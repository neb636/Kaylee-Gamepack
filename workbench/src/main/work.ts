import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { PullRequestInfo, WorkItemInfo, WorkList } from "../shared/models";
import { executablePath } from "./executables";
import { isValidBranchName, type GitSourceControlProvider } from "./providers/git-source-control-provider";
import { worktreeContainer, type WorkspaceRoots } from "./workspace-files";

const PR_TTL = 60_000;
const NAME_PATTERN = /^[a-z0-9][a-z0-9-]{0,47}$/;

/** Runs a fixed executable with an argument array (no shell). */
export type Runner = (command: string, args: string[], cwd: string, timeout?: number) => Promise<string>;

export const runExecutable: Runner = (command, args, cwd, timeout = 30_000) => {
  const executable = executablePath(command);
  if (!executable) return Promise.reject(new Error(`${command} was not found on this machine.`));
  return new Promise((resolve, reject) => {
    execFile(executable, args, { cwd, maxBuffer: 32 * 1024 * 1024, timeout, env: { ...process.env, GH_PROMPT_DISABLED: "1", NO_COLOR: "1" } }, (error, stdout, stderr) => {
      if (error) reject(new Error(String(stderr || error.message).trim()));
      else resolve(stdout);
    });
  });
};

interface RawPullRequest {
  number: number; state: string; title: string; url: string; isDraft?: boolean; headRefName: string; headRefOid?: string;
  statusCheckRollup?: { status?: string; conclusion?: string; state?: string }[];
}

/** Summarises GitHub's check rollup: any failure wins, then anything still running. */
export function checksSummary(rollup: RawPullRequest["statusCheckRollup"]): PullRequestInfo["checks"] {
  if (!rollup?.length) return undefined;
  const results = rollup.map((check) => (check.conclusion || check.state || check.status || "").toUpperCase());
  if (results.some((result) => ["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED", "ACTION_REQUIRED", "STARTUP_FAILURE"].includes(result))) return "failing";
  if (results.some((result) => ["", "PENDING", "QUEUED", "IN_PROGRESS", "EXPECTED", "WAITING", "REQUESTED"].includes(result))) return "pending";
  return "passing";
}

/** The newest PR per branch (gh lists newest first). */
export function pullRequestsByBranch(raw: RawPullRequest[]): Map<string, PullRequestInfo> {
  const byBranch = new Map<string, PullRequestInfo>();
  for (const pr of raw) {
    if (byBranch.has(pr.headRefName)) continue;
    const state = pr.state === "MERGED" || pr.state === "CLOSED" ? pr.state : "OPEN";
    byBranch.set(pr.headRefName, { number: pr.number, state, title: pr.title, url: pr.url, isDraft: Boolean(pr.isDraft), headSha: pr.headRefOid, checks: state === "OPEN" ? checksSummary(pr.statusCheckRollup) : undefined });
  }
  return byBranch;
}

/** Safe for a five-year-old's dad: lowercase words and dashes, used as both the folder and the branch name. */
export function workName(input: string): string {
  const name = input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  if (!NAME_PATTERN.test(name)) throw new Error("Give the piece of work a short name, like canada-whales.");
  return name;
}

/**
 * The one Gamepack repo and its pieces of work: every worktree git knows about, wherever it lives,
 * with its PR. New ones go in the tool-neutral `<repo>-worktrees/<name>` folder (Claude Code and Codex share it).
 */
export class WorkService {
  private prs?: { at: number; root: string; value: Promise<Map<string, PullRequestInfo> | undefined> };
  private loginValue?: Promise<string | undefined>;
  private readonly installs = new Map<string, { state: "installing" | "failed"; message?: string }>();

  constructor(
    private readonly git: GitSourceControlProvider,
    private readonly roots: WorkspaceRoots,
    private readonly run: Runner = runExecutable,
  ) {}

  /** The main checkout for any folder inside the repo or one of its worktrees. */
  async repoRoot(folder: string): Promise<string> {
    const [main] = await this.git.worktrees(folder);
    if (!main) throw new Error("That folder is not a Git checkout.");
    return main.path;
  }

  async list(folder: string, refreshPullRequests = false): Promise<WorkList> {
    const records = await this.git.worktrees(folder);
    const repoRoot = records[0]?.path;
    if (!repoRoot) throw new Error("That folder is not a Git checkout.");
    this.roots.setWorktrees(records.map((record) => record.path));
    const prs = await this.pullRequests(repoRoot, refreshPullRequests);
    const items: WorkItemInfo[] = await Promise.all(records.map(async (record, index) => {
      const exists = await fs.access(record.path).then(() => true, () => false);
      const install = this.installs.get(path.resolve(record.path));
      return {
        path: record.path,
        // Agents name folders randomly (agent-a07…); the branch says what the work is.
        name: index === 0 ? "main" : record.branch?.split("/").at(-1) || path.basename(record.path),
        branch: record.branch,
        head: record.head,
        main: index === 0,
        missing: !exists || record.prunable,
        locked: record.locked,
        changes: exists ? await this.git.changeCount(record.path).catch(() => undefined) : undefined,
        pr: record.branch && index !== 0 ? prs?.get(record.branch) : undefined,
        install: install?.state,
        installMessage: install?.message,
      };
    }));
    return { repoRoot, items, github: prs ? "ok" : "unavailable" };
  }

  /** Branch from the freshest main into `<repo>-worktrees/<name>`, then install the game's dependencies there. */
  async create(repoRoot: string, input: string): Promise<{ path: string; branch: string }> {
    const root = await this.repoRoot(repoRoot);
    const name = workName(input);
    const login = await this.login(root);
    const branch = login ? `${login}/${name}` : name;
    if (!isValidBranchName(branch)) throw new Error(`"${branch}" is not a valid branch name.`);
    const target = path.join(worktreeContainer(root), name);
    if (await fs.access(target).then(() => true, () => false)) throw new Error(`${target} already exists. Pick another name.`);
    const created = await this.git.createWorktree(root, branch, target, "main");
    this.roots.setWorktrees([...this.roots.worktreeList(), created.path]);
    this.installing = this.install(created.path);
    return created;
  }

  /**
   * Removes a finished worktree. Never the main checkout, never one with changes, and never one whose
   * commits exist only on this machine (unless the PR already has exactly this head). The branch is kept.
   */
  async remove(repoRoot: string, target: string): Promise<void> {
    const records = await this.git.worktrees(repoRoot);
    const index = records.findIndex((record) => path.resolve(record.path) === path.resolve(target));
    if (index < 0) throw new Error("That folder is not a worktree of this repo.");
    if (index === 0) throw new Error("The main checkout can't be cleaned up.");
    const record = records[index];
    if (record.locked) throw new Error("That worktree is locked. Unlock it with git first.");
    const root = records[0].path;
    const exists = await fs.access(record.path).then(() => true, () => false);
    if (!exists || record.prunable) {
      await this.run("git", ["worktree", "prune"], root);
      return;
    }
    const changes = await this.git.changeCount(record.path);
    if (changes) throw new Error(`It has ${changes} changed ${changes === 1 ? "file" : "files"}. Commit or discard them first.`);
    const unpushed = Number((await this.run("git", ["rev-list", "--count", "HEAD", "--not", "--remotes"], record.path)).trim()) || 0;
    if (unpushed) {
      const pr = record.branch ? (await this.pullRequests(root, true))?.get(record.branch) : undefined;
      if (!pr?.headSha || pr.headSha !== record.head) throw new Error(`It has ${unpushed} ${unpushed === 1 ? "commit" : "commits"} that only exist on this Mac. Push them first.`);
    }
    await this.git.removeWorktree(root, record.path);
    this.roots.setWorktrees(this.roots.worktreeList().filter((item) => path.resolve(item) !== path.resolve(record.path)));
  }

  /** Resolves when a started `npm ci` has finished (for tests and the next list). */
  installing?: Promise<void>;

  private async install(target: string): Promise<void> {
    const key = path.resolve(target);
    this.installs.set(key, { state: "installing" });
    try {
      await this.run("npm", ["ci", "--no-audit", "--no-fund"], target, 15 * 60_000);
      this.installs.delete(key);
    } catch (error) {
      this.installs.set(key, { state: "failed", message: String(error).slice(-600) });
    }
  }

  private login(root: string): Promise<string | undefined> {
    this.loginValue ??= this.run("gh", ["api", "user", "--jq", ".login"], root)
      .then((value) => value.trim() || undefined)
      .then((value) => (value && /^[A-Za-z0-9-]+$/.test(value) ? value : undefined))
      .catch(() => { this.loginValue = undefined; return undefined; });
    return this.loginValue;
  }

  /** Missing or signed-out gh means rows without PR info, never an error. */
  private pullRequests(root: string, refresh: boolean): Promise<Map<string, PullRequestInfo> | undefined> {
    if (!refresh && this.prs && this.prs.root === root && Date.now() - this.prs.at < PR_TTL) return this.prs.value;
    const value = this.run("gh", ["pr", "list", "--state", "all", "--limit", "300", "--json", "number,state,title,url,isDraft,headRefName,headRefOid,statusCheckRollup"], root)
      .then((output) => pullRequestsByBranch(JSON.parse(output) as RawPullRequest[]))
      .catch((error: unknown) => { console.warn("Could not list pull requests", String(error)); return undefined; });
    this.prs = { at: Date.now(), root, value };
    return value;
  }
}

import { _electron as electron } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";

// QA inventory: shell layout and the Work list with nested sessions, launcher with a new worktree,
// the Instructions menu (including a conditional option and a migrated instruction), composed
// prompt order, title from the first prompt, quote/preview/recall, uncertain delivery handoff,
// Files tree and read-only viewer, Source control commit, tab overflow, and
// layout persistence across restart. Runs against a deterministic fake CLI; no model calls.
const directory = await realpath(await mkdtemp(join(tmpdir(), "workbench-composer-qa-")));
const repo = join(directory, "repo");
const executable = join(directory, "fixture-cli");
const log = join(directory, "prompts.jsonl");
const shellQuote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" });
await mkdir(join(repo, "src"), { recursive: true });
execFileSync("git", ["init", "--quiet", "-b", "main", repo]);
git("config", "user.email", "qa@example.com");
git("config", "user.name", "QA");
await writeFile(join(repo, "tracked.txt"), "one\n");
await writeFile(join(repo, "src", "app.ts"), "export const answer: number = 42;\n// The workbench renders this file read-only.\n");
git("add", ".");
git("commit", "--quiet", "-m", "initial");
await writeFile(join(repo, "tracked.txt"), "two\n");
await writeFile(join(repo, "notes.md"), "# Notes\n");
await writeFile(executable, `#!/bin/sh\nexec ${shellQuote(process.execPath)} ${shellQuote(resolve("scripts/fixtures/composer-cli.mjs"))}\n`, { mode: 0o755 });
// Written in the pre-prompt-options format, so loading also exercises the migration.
await writeFile(join(directory, "workbench-state.json"), JSON.stringify({
  workspaces: [{ id: "qa", name: "Composer QA", path: repo, activeViewId: "agent", views: [
    { id: "agent", workspaceId: "qa", type: "agent", title: "Untitled", state: { autoTitle: true } },
    { id: "other", workspaceId: "qa", type: "agent", title: "Other", state: { providerId: "codex.cli" } },
  ] }], activeWorkspaceId: "qa",
  appendedInstructions: [{ id: "i", workspaceId: "qa", content: "Explain the tradeoffs.", enabled: true }],
}));

const OPEN_PR = "When the change is ready, open a draft pull request that summarizes the change and how it was verified.";
const WRITE_TESTS = "Add or update unit tests that cover this change, and run them before finishing.";
let app;
try {
  const launch = async () => {
    app = await electron.launch({ args: ["."], env: { ...process.env, STUDIO_REPO_ROOT: repo, WORKBENCH_USER_DATA_DIR: directory, WORKBENCH_CODEX_PATH: executable,
      WORKBENCH_CLAUDE_PATH: join(directory, "missing-claude"), COMPOSER_QA_LOG: log } });
    const window = await app.firstWindow();
    window.setDefaultTimeout(10_000);
    return window;
  };
  let page = await launch();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  const shot = async (name) => {
    await page.waitForTimeout(150);
    const bytes = await app.evaluate(async ({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      const [width, height] = win.getContentSize();
      return (await win.capturePage()).resize({ width, height }).toPNG();
    });
    await writeFile(join(directory, `${name}.png`), Buffer.from(bytes));
  };
  const prompts = async () => (await readFile(log, "utf8")).trim().split("\n").map((line) => JSON.parse(line));
  const prompt = () => page.getByRole("textbox", { name: "Prompt", exact: true });
  const waitFeedback = (value) => page.waitForFunction((text) => document.querySelector(".composer-feedback")?.textContent.includes(text), value);
  const sidebar = page.getByRole("treegrid", { name: "Main checkout" });

  // Shell: three panes, the one repo's main checkout with nested sessions, and the launcher for a session that has not started.
  await sidebar.getByRole("row", { name: /^main/ }).waitFor();
  assert.match(await sidebar.getByRole("row", { name: /Untitled/ }).innerText(), /Setup/);
  await page.getByRole("heading", { name: "Start a new session" }).waitFor();
  assert.match(await page.locator(".harness-option").filter({ hasText: "Claude Code" }).innerText(), /Not installed/);
  await page.getByRole("radio", { name: /Codex/ }).waitFor();
  await page.getByRole("radio", { name: "New worktree" }).click();
  await page.getByRole("textbox", { name: "Branch" }).fill("wb/qa-task");
  assert.match(await page.locator(".launcher-location").innerText(), /repo-worktrees\/wb-qa-task$/);
  await shot("launcher");

  assert.equal(await page.getByRole("button", { name: "Persona", exact: true }).count(), 0, "Personas are dropped for now");

  // Instructions menu: built-ins, the migrated instruction, and a conditional text option.
  await page.getByRole("button", { name: "Instructions: 1" }).click();
  assert.equal(await page.getByRole("switch", { name: "Explain the tradeoffs." }).isChecked(), true);
  assert.equal(await page.getByRole("textbox", { name: "Test focus" }).count(), 0);
  await page.getByText("Open PR", { exact: true }).click();
  assert.equal(await page.getByRole("switch", { name: "Open PR" }).isChecked(), true);
  await page.getByRole("radio", { name: "Write new" }).click();
  await page.getByRole("textbox", { name: "Test focus" }).fill("error handling");
  await shot("instructions-menu");
  await page.keyboard.press("Escape");

  // First send creates the worktree, starts the CLI, waits for its input, and delivers the composed prompt.
  await prompt().fill("Explain this failure.");
  await page.getByRole("button", { name: "Send prompt", exact: true }).click();
  await waitFeedback("Prompt handed");
  const [first] = await prompts();
  assert.equal(first.prompt, ["Explain this failure.", OPEN_PR, WRITE_TESTS, "Focus the new tests on error handling.", "Explain the tradeoffs."].join("\n\n"));
  assert.equal(first.cwd, join(directory, "repo-worktrees", "wb-qa-task"));
  assert.equal(git("worktree", "list").includes("wb-qa-task"), true);
  assert.equal(await prompt().inputValue(), "");
  await page.getByRole("button", { name: "Instructions: 4" }).waitFor();
  // The launcher's new worktree shows up in the Work list by itself.
  await page.getByRole("button", { name: "Refresh worktrees and PRs" }).click();
  await page.getByRole("treegrid", { name: "Work in progress" }).getByRole("row", { name: /qa-task/ }).waitFor();
  await page.getByRole("tab", { name: "Explain this failure." }).waitFor();
  assert.match(await sidebar.getByRole("row", { name: /Explain this failure\./ }).innerText(), /Ready · Codex/);
  await shot("session");

  // Composer tools: quote terminal output, preview placement, recall a previous prompt.
  const row = page.locator(".xterm-rows > div").filter({ hasText: "ERROR: Connection refused" });
  await row.click({ clickCount: 3 });
  await page.getByRole("button", { name: "Add to prompt" }).click();
  await prompt().fill("Second prompt");
  await page.getByRole("button", { name: "Preview" }).click();
  const preview = await page.getByRole("dialog", { name: "Prompt preview" }).locator("pre").innerText();
  assert.match(preview, /^Terminal selection 1:\n> ERROR: Connection refused/);
  assert.match(preview, /Second prompt\n\nWhen the change is ready/);
  assert(preview.endsWith("Explain the tradeoffs."));
  await shot("preview");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Activity" }).click();
  await page.getByRole("button", { name: "Use as draft" }).click();
  assert.equal(await prompt().inputValue(), "Explain this failure.");

  // Uncertain delivery keeps the draft and offers the terminal handoff.
  await page.getByRole("button", { name: "Remove terminal selection 1" }).click().catch(() => undefined);
  await prompt().fill("UNCERTAIN");
  await page.getByRole("button", { name: "Send prompt", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".session-pill")?.textContent.includes("Needs input"));
  await page.getByRole("button", { name: "Focus terminal" }).waitFor();
  await page.locator(".xterm-helper-textarea").focus();
  await page.keyboard.press("Control+c");
  await page.waitForFunction(() => document.querySelector(".session-pill")?.textContent.includes("Ready"));

  // 📎 this section and the prompt starters, from the composer toolbar.
  await prompt().fill("");
  await page.getByRole("button", { name: "Attach this game section" }).click();
  await page.locator(".composer-quotation summary").filter({ hasText: /^Game/ }).waitFor();
  await page.getByRole("button", { name: "Prompt starters" }).click();
  await page.getByRole("menuitem", { name: /^Fix/ }).click();
  assert.match(await prompt().inputValue(), /What's wrong: $/);
  assert.match((await page.evaluate(() => document.querySelector(".composer-quotation pre")?.textContent)) ?? "", /The game section Dad is looking at/);
  await shot("starter-fix");
  await prompt().fill("");

  // Files: a tab in the agent column, with a lazy tree and a read-only file view with no session.
  await page.getByRole("button", { name: "Create view" }).click();
  await page.getByRole("menuitem", { name: /^Files/ }).click();
  const tree = page.getByRole("treegrid", { name: "Files in Composer QA" });
  await tree.getByRole("row", { name: "src" }).waitFor();
  await page.getByRole("searchbox", { name: "Search files" }).fill("notes");
  await page.getByRole("grid", { name: "Matching files" }).getByRole("row", { name: /notes\.md/ }).waitFor();
  await page.getByRole("searchbox", { name: "Search files" }).fill("");
  await tree.getByRole("button", { name: "Expand src" }).click();
  await tree.getByRole("row", { name: "app.ts" }).click();
  await page.getByRole("tab", { name: "app.ts" }).waitFor();
  await page.waitForFunction(() => document.querySelector(".cm-content")?.textContent.includes("export const answer"));
  await shot("file-view");

  // Commit changes, also a tab: list changes, commit them all.
  await page.getByRole("button", { name: "Create view" }).click();
  await page.getByRole("menuitem", { name: /^Commit changes/ }).click();
  const changes = page.getByRole("grid", { name: "Changes" });
  await changes.getByRole("row", { name: /tracked\.txt/ }).waitFor();
  assert.match(await changes.getByRole("row", { name: /notes\.md/ }).innerText(), /U/);
  await shot("source-control");
  await page.getByRole("textbox", { name: "Commit message" }).fill("QA commit");
  await page.getByRole("button", { name: "Commit 2 changes" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Commit", exact: true }).click();
  await page.getByText("No uncommitted changes.").waitFor();
  assert.equal(git("log", "-1", "--format=%s").trim(), "QA commit");

  // Ship: Verify runs in this piece of work's Ship terminal, a tab in the agent column; the QR opens and closes.
  await page.getByRole("region", { name: "Ship" }).getByRole("button", { name: /Verify/ }).click();
  await page.getByRole("tab", { name: "Ship: verify" }).waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll(".kept-view:not([hidden]) .xterm-rows")].some((rows) => rows.textContent.includes("npm run verify")));
  await page.getByRole("region", { name: "Ship" }).getByRole("button", { name: "QR" }).click();
  await page.getByRole("img", { name: /QR code for https:\/\/neb636\.github\.io\/Kaylee-Gamepack\// }).waitFor();
  await shot("ship");
  await page.getByRole("tab", { name: "Ship: verify" }).getByRole("button", { name: /Close/ }).click();

  // The tab overflow menu.
  assert.equal(await page.getByRole("radio", { name: "Active views" }).count(), 0, "Active views is gone");
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1100, 760));
  for (let index = 0; index < 3; index += 1) {
    await page.getByRole("button", { name: "Create view" }).click();
    await page.getByRole("menuitem", { name: /Agent session/ }).click();
  }
  await page.locator(".tab-overflow").waitFor();
  await page.locator(".tab-overflow").click();
  assert((await page.getByRole("menu", { name: "More views" }).getByRole("menuitem").count()) >= 1);
  await shot("tab-overflow");
  await page.keyboard.press("Escape");

  // Layout persists across restart.
  await page.getByRole("button", { name: "Hide sidebar" }).click();
  await page.getByRole("button", { name: "Show sidebar" }).waitFor();
  await page.waitForTimeout(400);
  assert.deepEqual(errors, []);
  await app.close();
  page = await launch();
  await page.getByRole("button", { name: "Show sidebar" }).click();
  await page.getByRole("treegrid", { name: "Main checkout" }).getByRole("row", { name: /Explain this failure\./ }).waitFor();
  console.log("Composer QA passed. Artifacts:", directory);
} finally { if (app) await app.close(); console.log("QA artifacts:", directory); }

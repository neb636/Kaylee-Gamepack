import type { AgentProviderAdapter, AgentSubmission } from "../agent-provider";
import type { AgentLaunchProfile } from "../agent-launch-profiles";
import { detectCliScreen, pastePrompt } from "./cli-screen";
import type { AgentPromptRequest } from "../../shared/models";

export class ClaudeAgentProvider implements AgentProviderAdapter {
  readonly id = "claude.cli";
  readonly label = "Claude Code";
  readonly executable = process.env.WORKBENCH_CLAUDE_PATH ?? "claude";
  readonly interrupt = "\u001b";
  args(resume: boolean) { return resume ? ["--resume"] : []; }
  // `--allowedTools` takes every following argument, so it comes last.
  profileArgs(profile: AgentLaunchProfile) {
    return [...(profile.allowWritesInCwd ? ["--permission-mode", "acceptEdits"] : []),
      ...(profile.allowCommands.length ? ["--allowedTools", ...profile.allowCommands.map((command) => `Bash(${command} *)`)] : [])];
  }
  detect = detectCliScreen("claude");
  readonly capabilities = { planning: true };
  submit = (request: AgentPromptRequest): AgentSubmission => ({ paste: pastePrompt(request.prompt),
    prefix: request.intent === "plan" ? { input: "/plan ", acknowledged: (screen) =>
      /^\s*[❯>]\s+\/plan(?:\s|$)/.test(screen.cursorLine) && screen.cursorX === screen.cursorLine.indexOf("/plan") + 6,
    } : undefined,
  });
}

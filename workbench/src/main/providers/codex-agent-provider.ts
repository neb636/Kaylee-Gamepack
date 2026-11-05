import { validateModelSettings } from "../../shared/agent-models";
import type { AgentProviderAdapter, AgentSubmission } from "../agent-provider";
import { detectCliScreen, pastePrompt } from "./cli-screen";
import type { AgentPromptRequest } from "../../shared/models";

export class CodexAgentProvider implements AgentProviderAdapter {
  readonly id = "codex.cli";
  readonly label = "Codex";
  readonly executable = process.env.WORKBENCH_CODEX_PATH ?? "codex";
  readonly interrupt = "\u001b";
  args(resume: boolean) { return resume ? ["resume"] : []; }
  detect = detectCliScreen("codex");
  // Codex draws its composer before trust and startup checks, which may then replace it.
  readonly startupSettleMs = 1000;
  readonly capabilities = { planning: true };
  submit = (request: AgentPromptRequest): AgentSubmission => {
    if (request.settings) validateModelSettings(this.id, request.settings);
    return {
      paste: pastePrompt(request.prompt),
      settings: request.settings ? [{
        command: `/model ${request.settings.model} --reasoning=${request.settings.effort}`,
        acknowledged: output => output.includes(`Model changed to ${request.settings!.model} ${request.settings!.effort} for this session only`),
      }] : undefined,
      prefix: request.intent === "plan" ? { input: "/plan ", acknowledged: (screen) => /^\s*› \/plan\s*$/.test(screen.cursorLine) } : undefined,
    };
  };
}

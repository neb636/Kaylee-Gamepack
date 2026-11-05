import { z } from "zod";
import type { PromptCondition } from "./prompt-options";

export const workbenchViewSchema = z.object({
  id: z.string(),
  type: z.string(),
  workspaceId: z.string(),
  title: z.string(),
  state: z.unknown().optional(),
});

export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  views: z.array(workbenchViewSchema),
  activeViewId: z.string().optional(),
  game: z.object({
    link: z.string().max(4000).optional(),
    frame: z.enum(["fit", "ipad-portrait", "ipad-wide", "iphone-wide", "iphone-tall"]).optional(),
    characterLink: z.string().max(4000).optional(),
    beforeCharacter: z.string().max(4000).optional(),
    draft: z.string().max(20_000).optional(),
    provider: z.enum(["claude", "codex"]).optional(),
  }).optional(),
});

export const personaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
  scope: z.enum(["global", "workspace"]),
  workspaceId: z.string().optional(),
});

export const promptConditionSchema: z.ZodType<PromptCondition> = z.lazy(() => z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("all"), conditions: z.array(promptConditionSchema) }),
  z.object({ kind: z.literal("any"), conditions: z.array(promptConditionSchema) }),
  z.object({ kind: z.literal("not"), condition: promptConditionSchema }),
  z.object({ kind: z.literal("isOn"), option: z.string() }),
  z.object({ kind: z.literal("isChoice"), option: z.string(), choice: z.string() }),
]));

const promptOptionChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  text: z.string(),
  description: z.string().optional(),
});

const optionFieldsSchema = {
  id: z.string().min(1),
  label: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  when: promptConditionSchema.optional(),
  display: z.enum(["list", "segmented", "dropdown"]).optional(),
  resetAfterSend: z.boolean().optional(),
};

export const promptOptionDefinitionSchema = z.discriminatedUnion("kind", [
  z.object({ ...optionFieldsSchema, kind: z.literal("toggle"), defaultOn: z.boolean(), text: z.string() }),
  z.object({ ...optionFieldsSchema, kind: z.literal("select"), defaultChoice: z.string(), choices: z.array(promptOptionChoiceSchema) }),
  z.object({ ...optionFieldsSchema, kind: z.literal("multiSelect"), defaultChoices: z.array(z.string()), choices: z.array(promptOptionChoiceSchema) }),
  z.object({ ...optionFieldsSchema, kind: z.literal("text"), placeholder: z.string(), defaultValue: z.string(),
    maxLength: z.number().int().min(1).max(10_000), template: z.string() }),
]);

export const storedPromptOptionSchema = z.object({
  scope: z.enum(["global", "workspace"]),
  workspaceId: z.string().optional(),
  option: promptOptionDefinitionSchema,
});

export const layoutStateSchema = z.object({
  leftSize: z.number().min(0).max(100).optional(),
  rightSize: z.number().min(0).max(100).optional(),
  leftCollapsed: z.boolean().default(false),
  rightCollapsed: z.boolean().default(false),
  rightPanel: z.string().optional(),
});

export const persistedStateSchema = z.object({
  repoRoot: z.string().optional(),
  workspaces: z.array(workspaceSchema).default([]),
  activeWorkspaceId: z.string().optional(),
  personas: z.array(personaSchema).default([]),
  instructionOptions: z.array(storedPromptOptionSchema).default([]),
  layout: layoutStateSchema.default({ leftCollapsed: false, rightCollapsed: false }),
});

const legacyInstructionSchema = z.object({ id: z.string(), workspaceId: z.string(), content: z.string(), enabled: z.boolean() });

const LAB_VIEWS: Record<string, "camera" | "feel" | "character"> = { "camera-lab": "camera", "feel-lab": "feel", "character-lab": "character" };

/**
 * The Camera, Feel and Character labs used to be tabs; now they are switches on each piece of work's game pane.
 * Their tabs go away and their last links move onto the pane (a Feel or Camera link becomes where the game opens).
 */
export function migrateLabViews(input: unknown): unknown {
  if (typeof input !== "object" || input === null || !Array.isArray((input as { workspaces?: unknown }).workspaces)) return input;
  const source = input as { workspaces: unknown[] } & Record<string, unknown>;
  const workspaces = source.workspaces.map((value) => {
    if (typeof value !== "object" || value === null || !Array.isArray((value as { views?: unknown }).views)) return value;
    const workspace = value as { views: { id?: unknown; type?: unknown; state?: unknown }[]; activeViewId?: unknown; game?: Record<string, unknown> };
    const labs = workspace.views.filter((view) => typeof view?.type === "string" && LAB_VIEWS[view.type]);
    if (!labs.length) return value;
    const game: Record<string, unknown> = { ...(workspace.game ?? {}) };
    for (const view of labs) {
      const link = (view.state as { link?: unknown } | undefined)?.link;
      if (typeof link !== "string" || !link.includes("#/world/")) continue;
      const hash = link.slice(link.indexOf("#"));
      if (view.type === "character-lab") game.characterLink ??= hash;
      else game.link ??= hash.replace(/([?&])(cam|feel)=1(&|$)/g, (_, before, _key, after) => (after ? before : "")).replace(/[?&]$/, "");
    }
    const views = workspace.views.filter((view) => !labs.includes(view));
    const activeViewId = labs.some((view) => view.id === workspace.activeViewId) ? views[0]?.id : workspace.activeViewId;
    return { ...workspace, views, activeViewId, game };
  });
  return { ...source, workspaces };
}

/** Converts state written before prompt options existed; unknown shapes pass through to normal validation. */
export function migratePersistedState(input: unknown): unknown {
  input = migrateLabViews(input);
  if (typeof input !== "object" || input === null) return input;
  const source = input as Record<string, unknown>;
  if (source.instructionOptions !== undefined || !Array.isArray(source.appendedInstructions)) return input;
  const instructionOptions = source.appendedInstructions.flatMap((item) => {
    const legacy = legacyInstructionSchema.safeParse(item);
    if (!legacy.success || !legacy.data.content.trim()) return [];
    const { id, workspaceId, content, enabled } = legacy.data;
    const label = content.trim().split("\n")[0].slice(0, 60);
    return [{ scope: "workspace", workspaceId, option: { id, kind: "toggle", label, category: "Custom", defaultOn: enabled, text: content } }];
  });
  return { ...source, instructionOptions };
}

export const ptyCreateOptionsSchema = z.object({
  cwd: z.string().min(1),
  cols: z.number().int().min(2).max(1000),
  rows: z.number().int().min(1).max(1000),
});

export const ptyInputSchema = z.object({
  sessionId: z.string(),
  data: z.string(),
});

export const ptyResizeSchema = z.object({
  sessionId: z.string(),
  cols: z.number().int().min(2).max(1000),
  rows: z.number().int().min(1).max(1000),
});

export const ptyTerminateSchema = z.object({ sessionId: z.string() });

export const agentSessionCreateOptionsSchema = z.object({
  providerId: z.string().min(1),
  workspacePath: z.string().min(1),
  viewId: z.string().min(1),
  cols: z.number().int().min(2).max(1000),
  rows: z.number().int().min(1).max(1000),
  resume: z.boolean().optional(),
  profile: z.string().min(1).max(64).optional(),
});

export const agentPromptSchema = z.object({
  sessionId: z.string().min(1),
  prompt: z.string().min(1).max(500_000),
  intent: z.enum(["default", "plan"]),
});

export const agentSessionActionSchema = z.object({ sessionId: z.string().min(1) });

export const fileLocationSchema = z.object({ root: z.string().min(1), path: z.string().max(4096) });
export const fileFindSchema = z.object({ root: z.string().min(1), query: z.string().max(256) });
export const workspaceRootSchema = z.object({ root: z.string().min(1) });
export const commitSchema = z.object({ root: z.string().min(1), message: z.string().trim().min(1).max(10_000) });
export const createWorktreeSchema = z.object({ root: z.string().min(1), branch: z.string().min(1).max(200) });

const imageIdSchema = z.string().regex(/^[\w-]{1,80}$/);
export const imageViewSchema = z.object({ viewId: imageIdSchema });
export const imageImportSchema = z.object({ viewId: imageIdSchema, name: z.string().max(255), data: z.instanceof(Uint8Array) });
export const imageRunSchema = z.object({ viewId: imageIdSchema, runId: imageIdSchema });
export const imagePrepareRunSchema = imageRunSchema.extend({ attachments: z.array(z.string().max(255)).max(16) });
export const imageFileSchema = z.object({ viewId: imageIdSchema, file: z.string().min(1).max(512) });

export const imageRunManifestSchema = z.object({
  complete: z.boolean(),
  variants: z.array(z.object({
    index: z.number().int().min(1).max(16),
    title: z.string().max(200),
    prompt: z.string().max(20_000),
    sources: z.array(z.string().max(255)).max(16),
    changes: z.string().max(4_000),
    status: z.enum(["pending", "done", "failed"]),
    error: z.string().max(4_000).optional(),
  })).max(16),
});

export const workListSchema = z.object({ root: z.string().min(1), refresh: z.boolean().optional() });
export const workCreateSchema = z.object({ root: z.string().min(1), name: z.string().min(1).max(80) });
export const workRemoveSchema = z.object({ root: z.string().min(1), path: z.string().min(1) });

import { services } from "../core/services";
import { useWorkbenchStore } from "../state/workbench-store";
import { AgentView } from "../features/agent/AgentView";
import { cliAgentProvider } from "../features/agent/cli-agent-provider";
import { closeAgentRuntime } from "../core/agent-runtimes";
import { TerminalView } from "../features/terminal/TerminalView";
import { localTerminalProvider } from "../features/terminal/terminal-provider";
import { clearComposerRuntime, registerComposerContributions } from "../features/agent/composer-state";
import { agentIdleStatus, publishAgentStatuses } from "../features/agent/session-status";
import { instructionsMenu } from "../features/instructions/instructions-menu";
import { FileView } from "../features/files/FileView";
import { ImageGeneratorView } from "../features/image-generator/ImageGeneratorView";
import { clearImageRuntime, DEFAULT_COUNT, DEFAULT_PROVIDER, registerImageGeneratorCommands } from "../features/image-generator/image-generator-state";
import { FilesPanel } from "../features/files/FilesPanel";
import { registerFileCommands } from "../features/files/file-commands";
import { SourceControlPanel, StatusBranch } from "../features/source-control/SourceControlPanel";
import { MemoryUsage, SessionSummary, TerminalCount } from "../features/status/StatusItems";
import { SettingsButton } from "../features/settings/SettingsButton";
import { AgentIcon, BranchIcon, FileIcon, FilesIcon, ImageIcon, TerminalIcon } from "../ui/icons";
import { useWorkList } from "../features/work/work-store";
import { StudioComposerTools } from "../features/agent/StudioComposerTools";
import { watchAttention } from "../features/agent/attention";
import { ShipPanel } from "../features/ship/ShipPanel";

let registered = false;

export function registerFirstPartyContributions(): void {
  if (registered) return;
  registered = true;

  services.views.register({
    id: "agent",
    label: "Agent session",
    description: "A native coding CLI with a prompt composer below it.",
    icon: AgentIcon,
    component: AgentView,
    defaultTitle: "Untitled",
    listInSidebar: true,
    idleStatus: agentIdleStatus,
    createState: () => ({ autoTitle: true }),
  });
  services.views.register({
    id: "terminal",
    label: "Terminal",
    description: "A local PTY-backed terminal session.",
    icon: TerminalIcon,
    component: TerminalView,
    createState: () => ({ providerId: "terminal.local" }),
  });
  services.views.register({
    id: "image-generator",
    label: "Character concepts",
    description: "One vinyl character concept at a time, ready for the Tripo and Blender workflow.",
    icon: ImageIcon,
    component: ImageGeneratorView,
    defaultTitle: "Character concepts",
    listInSidebar: true,
    idleStatus: () => ({ label: "Idle", tone: "idle", detail: "Images" }),
    createState: () => ({ providerId: DEFAULT_PROVIDER, count: DEFAULT_COUNT, autoTitle: true }),
  });
  services.views.register({
    id: "file",
    label: "File",
    description: "A read-only file from the workspace.",
    icon: FileIcon,
    component: FileView,
    creatable: false,
  });

  services.sessions.register(cliAgentProvider("claude.cli", "Claude Code", "Anthropic"));
  services.sessions.register(cliAgentProvider("codex.cli", "Codex", "OpenAI"));
  services.sessions.register(localTerminalProvider);

  // The old side panels are tabs in the agent column now, opened from its + menu when needed.
  services.views.register({ id: "files", label: "Files", description: "Browse and search this checkout's files.", icon: FilesIcon, component: FilesPanel, defaultTitle: "Files" });
  services.views.register({ id: "source-control", label: "Commit changes", description: "This checkout's changes and a commit box.", icon: BranchIcon, component: SourceControlPanel, defaultTitle: "Changes" });
  services.widgets.register({ id: "studio-tools", slot: "agent.composer.toolbar", order: 10, component: StudioComposerTools });
  watchAttention();
  services.widgets.register({ id: "ship", slot: "agent.column.footer", order: 10, component: ShipPanel });

  services.promptMenus.register(instructionsMenu);
  registerComposerContributions();
  registerImageGeneratorCommands();
  publishAgentStatuses();

  services.widgets.register({ id: "settings", slot: "sidebar.footer", order: 100, component: SettingsButton });
  services.widgets.register({ id: "sessions", slot: "statusbar.start", order: 10, component: SessionSummary });
  services.widgets.register({ id: "branch", slot: "statusbar.end", order: 10, component: StatusBranch });
  services.widgets.register({ id: "terminals", slot: "statusbar.end", order: 20, component: TerminalCount });
  services.widgets.register({ id: "memory", slot: "statusbar.end", order: 30, component: MemoryUsage });

  registerFileCommands();
  // One repo: Studio finds its worktrees itself (the packaged app asks for the checkout once).
  services.commands.register("repo.open", async () => {
    const path = await window.workbench.workspace.chooseDirectory();
    if (!path) return;
    const { repoRoot } = await window.workbench.work.list(path);
    useWorkbenchStore.getState().setRepoRoot(repoRoot);
    useWorkbenchStore.getState().addWorkspace(repoRoot, { name: "main", views: "all" });
    await useWorkList.getState().refresh(true);
  });
  services.commands.register<string>("workspace.select", (workspaceId) => {
    useWorkbenchStore.getState().selectWorkspace(workspaceId);
  });
  services.commands.register<string>("workspace.remove", async (workspaceId) => {
    const workspace = useWorkbenchStore.getState().workspaces.find((item) => item.id === workspaceId);
    for (const view of workspace?.views ?? []) await services.commands.execute("view.close", { workspaceId, viewId: view.id });
    useWorkbenchStore.getState().removeWorkspace(workspaceId);
  });
  services.commands.register<{ workspaceId: string; viewType: string }>("view.create", ({ workspaceId, viewType }) => {
    const definition = services.views.get(viewType);
    if (!definition) throw new Error(`Unknown view type: ${viewType}`);
    return useWorkbenchStore.getState().createView(workspaceId, definition.id, definition.defaultTitle ?? definition.label, definition.createState?.());
  });
  services.commands.register<{ workspaceId: string; viewId: string }>("view.select", ({ workspaceId, viewId }) => {
    useWorkbenchStore.getState().selectView(workspaceId, viewId);
  });
  services.commands.register<{ workspaceId: string; viewId: string }>("view.close", ({ workspaceId, viewId }) => {
    closeAgentRuntime(viewId);
    clearComposerRuntime(viewId);
    clearImageRuntime(viewId);
    useWorkbenchStore.getState().closeView(workspaceId, viewId);
  });
}

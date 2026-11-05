import { useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import { services } from "../core/services";
import { useWorkbenchStore } from "../state/workbench-store";
import { GamePane } from "../features/game/GamePane";
import { FolderIcon } from "../ui/icons";
import { Button } from "../ui/controls";
import { LeftSidebar } from "./LeftSidebar";
import { AgentColumn } from "./AgentColumn";
import { StatusBar } from "./StatusBar";

/** Keeps a collapsible panel in step with its persisted collapsed flag. */
function useCollapsible(collapsed: boolean) {
  const ref = useRef<ImperativePanelHandle>(null);
  useEffect(() => {
    const panel = ref.current;
    if (!panel || panel.isCollapsed() === collapsed) return;
    if (collapsed) panel.collapse(); else panel.expand();
  }, [collapsed]);
  return ref;
}

export function WorkbenchShell() {
  const workspaces = useWorkbenchStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkbenchStore((state) => state.activeWorkspaceId);
  const isHydrated = useWorkbenchStore((state) => state.isHydrated);
  const hydrate = useWorkbenchStore((state) => state.hydrate);
  const layout = useWorkbenchStore((state) => state.layout);
  const updateLayout = useWorkbenchStore((state) => state.updateLayout);
  const leftRef = useCollapsible(layout.leftCollapsed);
  const rightRef = useCollapsible(layout.rightCollapsed);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];

  useEffect(() => { void hydrate(); }, [hydrate]);

  if (!isHydrated) return <div className="launch-screen"><div className="brand-mark large"><span>KG</span></div><p>Opening Gamepack Studio…</p></div>;

  // Three jobs: the work on the left, the game in the middle (always the biggest), the agent on the right.
  return <div className={`app-shell ${layout.leftCollapsed ? "is-left-collapsed" : ""}`}>
    <PanelGroup direction="horizontal" className="shell-panels" onLayout={([left, , right]) => {
      const patch: { leftSize?: number; rightSize?: number } = {};
      if (left > 0 && Math.abs(left - (layout.leftSize ?? 0)) > 0.2) patch.leftSize = left;
      if (right > 0 && Math.abs(right - (layout.rightSize ?? 0)) > 0.2) patch.rightSize = right;
      if (patch.leftSize !== undefined || patch.rightSize !== undefined) updateLayout(patch);
    }}>
      <Panel id="left" order={1} ref={leftRef} className="shell-panel" collapsible collapsedSize={0} minSize={14} maxSize={32}
        defaultSize={layout.leftCollapsed ? 0 : layout.leftSize ?? 18}
        onCollapse={() => updateLayout({ leftCollapsed: true })} onExpand={() => updateLayout({ leftCollapsed: false })}>
        <LeftSidebar onCollapse={() => updateLayout({ leftCollapsed: true })} />
      </Panel>
      <PanelResizeHandle className="shell-resize" aria-label="Resize work sidebar" />
      <Panel id="center" order={2} className="shell-panel" minSize={30}>
        <main className={`center-column game-column ${layout.leftCollapsed ? "has-traffic-lights" : ""}`}>
          {!activeWorkspace ? (
            <div className="welcome-view">
              <div className="welcome-icon"><FolderIcon size={25} /></div>
              <h1>Open Kaylee's Gamepack</h1>
              <p>Pick your Kaylee-Gamepack checkout once. Studio lists its worktrees and PRs by itself.</p>
              <Button className="primary-button" onPress={() => void services.commands.execute("repo.open")}><FolderIcon size={16} /> Open the Gamepack repo</Button>
            </div>
          ) : <GamePane key={activeWorkspace.id} workspace={activeWorkspace}
            onShowLeft={layout.leftCollapsed ? () => updateLayout({ leftCollapsed: false }) : undefined}
            onShowRight={layout.rightCollapsed ? () => updateLayout({ rightCollapsed: false }) : undefined} />}
        </main>
      </Panel>
      <PanelResizeHandle className="shell-resize" aria-label="Resize agent column" />
      <Panel id="right" order={3} ref={rightRef} className="shell-panel" collapsible collapsedSize={0} minSize={22} maxSize={60}
        defaultSize={layout.rightCollapsed ? 0 : layout.rightSize ?? 34}
        onCollapse={() => updateLayout({ rightCollapsed: true })} onExpand={() => updateLayout({ rightCollapsed: false })}>
        <AgentColumn workspace={activeWorkspace} onHide={() => updateLayout({ rightCollapsed: true })} />
      </Panel>
    </PanelGroup>
    <StatusBar />
  </div>;
}

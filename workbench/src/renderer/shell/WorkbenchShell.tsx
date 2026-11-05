import { useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import { services } from "../core/services";
import { useWorkbenchStore } from "../state/workbench-store";
import { GamePane } from "../features/game/GamePane";
import { patchGame } from "../features/game/game-store";
import { FolderIcon } from "../ui/icons";
import { Button } from "../ui/controls";
import { LeftSidebar } from "./LeftSidebar";
import { AgentColumn } from "./AgentColumn";
import { StatusBar } from "./StatusBar";

/** After the game panel closes, its server waits this long (in case it opens again), then stops. */
const CLOSED_GAME_GRACE_MS = 60_000;
const GAME_SIZE = 42;
const GAME_BIG_SIZE = 66;

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
  const gameRef = useRef<ImperativePanelHandle>(null);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];
  const gameOpen = Boolean(activeWorkspace?.game?.open);
  const gameBig = Boolean(activeWorkspace?.game?.big);
  const gameSize = gameBig ? layout.gameBigSize ?? GAME_BIG_SIZE : layout.gameSize ?? GAME_SIZE;

  useEffect(() => { void hydrate(); }, [hydrate]);

  // "Game big" (or back) resizes the open panel to that mode's remembered width.
  useEffect(() => {
    const panel = gameRef.current;
    if (gameOpen && panel && Math.abs(panel.getSize() - gameSize) > 0.5) panel.resize(gameSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameBig, gameOpen, activeWorkspace?.id]);

  // No game on screen: stop the game servers after a grace period (an 8 GB Mac; reopening restarts it in seconds).
  useEffect(() => {
    if (gameOpen) return;
    const timer = setTimeout(() => void window.workbench.studio.trimServers(0).catch(() => undefined), CLOSED_GAME_GRACE_MS);
    return () => clearTimeout(timer);
  }, [gameOpen]);

  const toggleGame = () => { if (activeWorkspace) patchGame(activeWorkspace.id, { open: !gameOpen }); };
  // ⌘G shows or hides the game.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "g") { event.preventDefault(); toggleGame(); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  if (!isHydrated) return <div className="launch-screen"><div className="brand-mark large"><span>KG</span></div><p>Opening Gamepack Studio…</p></div>;

  // The work on the left, the agent in the middle (most of the time that's all), the game on the right when wanted.
  return <div className={`app-shell ${layout.leftCollapsed ? "is-left-collapsed" : ""}`}>
    <PanelGroup direction="horizontal" className="shell-panels" onLayout={(sizes) => {
      const [left] = sizes;
      const game = gameOpen ? sizes[2] : undefined;
      const patch: { leftSize?: number; gameSize?: number; gameBigSize?: number } = {};
      if (left > 0 && Math.abs(left - (layout.leftSize ?? 0)) > 0.2) patch.leftSize = left;
      if (game && Math.abs(game - gameSize) > 0.2) patch[gameBig ? "gameBigSize" : "gameSize"] = game;
      if (Object.keys(patch).length) updateLayout(patch);
    }}>
      <Panel id="left" order={1} ref={leftRef} className="shell-panel" collapsible collapsedSize={0} minSize={14} maxSize={32}
        defaultSize={layout.leftCollapsed ? 0 : layout.leftSize ?? 18}
        onCollapse={() => updateLayout({ leftCollapsed: true })} onExpand={() => updateLayout({ leftCollapsed: false })}>
        <LeftSidebar onCollapse={() => updateLayout({ leftCollapsed: true })} />
      </Panel>
      <PanelResizeHandle className="shell-resize" aria-label="Resize work sidebar" />
      <Panel id="agent" order={2} className="shell-panel" minSize={24}>
        {!activeWorkspace ? <main className="center-column">
          <div className="welcome-view">
            <div className="welcome-icon"><FolderIcon size={25} /></div>
            <h1>Open Kaylee's Gamepack</h1>
            <p>Pick your Kaylee-Gamepack checkout once. Studio lists its worktrees and PRs by itself.</p>
            <Button className="primary-button" onPress={() => void services.commands.execute("repo.open")}><FolderIcon size={16} /> Open the Gamepack repo</Button>
          </div>
        </main> : <AgentColumn workspace={activeWorkspace} gameOpen={gameOpen} onToggleGame={toggleGame}
          onShowLeft={layout.leftCollapsed ? () => updateLayout({ leftCollapsed: false }) : undefined} />}
      </Panel>
      {activeWorkspace && gameOpen && <>
        <PanelResizeHandle className="shell-resize" aria-label="Resize game panel" />
        <Panel id="game" order={3} ref={gameRef} className="shell-panel" minSize={22} maxSize={80} defaultSize={gameSize}>
          <main className="center-column game-column">
            <GamePane key={activeWorkspace.id} workspace={activeWorkspace} onClose={toggleGame}
              big={gameBig} onToggleBig={() => patchGame(activeWorkspace.id, { big: !gameBig })} />
          </main>
        </Panel>
      </>}
    </PanelGroup>
    <StatusBar />
  </div>;
}

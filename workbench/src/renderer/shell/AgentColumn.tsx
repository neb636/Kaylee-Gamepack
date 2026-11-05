import type { Workspace } from "../../shared/models";
import { services } from "../core/services";
import { Button } from "../ui/controls";
import { AgentIcon, TerminalIcon } from "../ui/icons";
import { ViewTabs } from "./ViewTabs";

/**
 * The main column: the agent for the selected piece of work, with its other agents, terminals and tools as tabs, the
 * ▶ Game toggle, and the `agent.column.footer` slot (Ship) under it.
 */
export function AgentColumn({ workspace, gameOpen, onToggleGame, onShowLeft }: {
  workspace: Workspace;
  gameOpen: boolean;
  onToggleGame: () => void;
  onShowLeft?: () => void;
}) {
  const active = workspace.views.find((view) => view.id === workspace.activeViewId) ?? workspace.views[0];
  const definition = active ? services.views.get(active.type) : undefined;
  return <main className="center-column agent-column" aria-label="Agent">
    <ViewTabs workspace={workspace} showLeftToggle={Boolean(onShowLeft)} onShowLeft={onShowLeft ?? (() => {})}
      trailing={<button className={`lab-toggle game-toggle ${gameOpen ? "is-on" : ""}`} aria-pressed={gameOpen}
        title={gameOpen ? "Hide the game (⌘G)" : "Show the game beside the agent (⌘G)"} onClick={onToggleGame}>
        <span aria-hidden="true">{gameOpen ? "◀" : "▶"}</span>Game
      </button>} />
    <div className="active-view-region">
      {active && definition ? <>
          {/* Terminals stay mounted (in one stable list) behind other tabs, so a Ship command keeps running while Dad
              looks at the agent; their PTY lives as long as the component. */}
          {workspace.views.filter((view) => view.type === "terminal").map((view) => {
            const Terminal = services.views.get("terminal")?.component;
            return Terminal ? <div key={view.id} className="kept-view" hidden={view.id !== active.id}><Terminal view={view} workspace={workspace} /></div> : null;
          })}
          {active.type !== "terminal" && <definition.component key={active.id} view={active} workspace={workspace} />}
        </>
        : active ? <div className="missing-view"><h2>View unavailable</h2><p>No view is registered for <code>{active.type}</code>.</p></div>
        : <div className="empty-workspace">
          <h2>No agent yet</h2><p>Start one for {workspace.name}.</p>
          <div className="empty-actions">
            <Button onPress={() => void services.commands.execute("view.create", { workspaceId: workspace.id, viewType: "agent" })}><AgentIcon size={16} />Agent session</Button>
            <Button onPress={() => void services.commands.execute("view.create", { workspaceId: workspace.id, viewType: "terminal" })}><TerminalIcon size={16} />Terminal</Button>
          </div>
        </div>}
    </div>
    {services.widgets.forSlot("agent.column.footer").map((widget) => {
      const Widget = widget.component;
      return <Widget key={widget.id} workspaceId={workspace.id} />;
    })}
  </main>;
}

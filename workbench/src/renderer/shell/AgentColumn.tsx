import type { Workspace } from "../../shared/models";
import { services } from "../core/services";
import { Button } from "../ui/controls";
import { AgentIcon, TerminalIcon } from "../ui/icons";
import { ViewTabs } from "./ViewTabs";

/**
 * The right column: the agent for the selected piece of work, with its other agents, terminals and tools as small
 * tabs inside it, and the `agent.column.footer` slot (Ship) under it.
 */
export function AgentColumn({ workspace, onHide }: { workspace?: Workspace; onHide: () => void }) {
  const active = workspace?.views.find((view) => view.id === workspace.activeViewId) ?? workspace?.views[0];
  const definition = active ? services.views.get(active.type) : undefined;
  return <aside className="sidebar-card agent-column" aria-label="Agent">
    <ViewTabs workspace={workspace} showLeftToggle={false} showRightToggle={false} onShowLeft={() => {}} onShowRight={() => {}} onHide={onHide} />
    <div className="active-view-region">
      {!workspace ? <p className="panel-empty">Open the Gamepack repo to start an agent.</p>
        : active && definition ? <definition.component key={active.id} view={active} workspace={workspace} />
        : active ? <div className="missing-view"><h2>View unavailable</h2><p>No view is registered for <code>{active.type}</code>.</p></div>
        : <div className="empty-workspace">
          <h2>No agent yet</h2><p>Start one for {workspace.name}.</p>
          <div className="empty-actions">
            <Button onPress={() => void services.commands.execute("view.create", { workspaceId: workspace.id, viewType: "agent" })}><AgentIcon size={16} />Agent session</Button>
            <Button onPress={() => void services.commands.execute("view.create", { workspaceId: workspace.id, viewType: "terminal" })}><TerminalIcon size={16} />Terminal</Button>
          </div>
        </div>}
    </div>
    {workspace && services.widgets.forSlot("agent.column.footer").map((widget) => {
      const Widget = widget.component;
      return <Widget key={widget.id} workspaceId={workspace.id} />;
    })}
  </aside>;
}

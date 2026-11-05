import { useEffect, useRef, useState } from "react";
import { LAB_CHANNEL, type LabSnapshot } from "../../../shared/labs";
import type { GameFrame, Workspace } from "../../../shared/models";
import { RefreshIcon } from "../../ui/icons";
import { crumbFor, DEFAULT_CHARACTER, DEFAULT_LINK, FRAMES, hashOf, labOf, loadSections, patchGame, useGameLive, withLab } from "./game-store";
import { LabPanel, type LabRequest } from "./LabPanel";

const LABS = [
  { id: "camera", label: "Camera", emoji: "🎥", hint: "The camera lab: nudge or lock the 3D camera (?cam=1)" },
  { id: "feel", label: "Feel", emoji: "🎛️", hint: "The feel lab: sliders for every knob the scene declares (?feel=1)" },
  { id: "character", label: "Character", emoji: "🦄", hint: "The 3D character lab (#/world/characters)" },
] as const;

/** Fits a device-sized frame into the pane, never larger than real size. */
function useStageScale(frame: GameFrame) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setSize({ width: element.clientWidth, height: element.clientHeight }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const device = FRAMES.find((item) => item.id === frame);
  if (!device?.width || !device.height || !size.width) return { ref, device: undefined, scale: 1 };
  return { ref, device: { width: device.width, height: device.height }, scale: Math.min(1, (size.width - 24) / device.width, (size.height - 24) / device.height) };
}

/**
 * The game for one piece of work, always in the middle: its own loopback server, a breadcrumb of the section on
 * screen, device frames, reload, and the Camera / Feel / Character labs as switches with their tuning panel below.
 */
export function GamePane({ workspace, hidden }: { workspace: Workspace; hidden?: boolean }) {
  const game = workspace.game ?? {};
  const origin = useGameLive((state) => state.origin[workspace.id]);
  const href = useGameLive((state) => state.href[workspace.id]);
  const snapshot = useGameLive((state) => state.snapshot[workspace.id]);
  const go = useGameLive((state) => state.go[workspace.id]);
  const sections = useGameLive((state) => state.sections[workspace.path]);
  const [target, setTarget] = useState(() => ({ hash: hashOf(game.link ?? DEFAULT_LINK), nonce: 0 }));
  const [error, setError] = useState<string>();
  const [editing, setEditing] = useState<string>();
  const frame = useRef<HTMLIFrameElement>(null);
  const pending = useRef(new Map<string, { resolve: (s: LabSnapshot) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>());
  const current = hashOf(href || target.hash);
  const lab = labOf(current);
  const frameId: GameFrame = lab === "camera" ? "fit" : game.frame ?? "fit";
  const stage = useStageScale(frameId);
  const crumb = crumbFor(current, sections?.index);

  useEffect(() => { void loadSections(workspace.path); }, [workspace.path]);

  useEffect(() => {
    let active = true;
    setError(undefined);
    // A remembered origin may be stale (that server was evicted and its port reused): wait for this checkout's server.
    useGameLive.setState((state) => ({ origin: { ...state.origin, [workspace.id]: "" } }));
    window.workbench.studio.useCheckout(workspace.path)
      .then((value) => { if (active) useGameLive.setState((state) => ({ origin: { ...state.origin, [workspace.id]: value } })); })
      .catch((caught) => { if (active) setError(String(caught).replace(/^Error: (Error invoking remote method '[^']+': )?(Error: )?/, "")); });
    return () => { active = false; };
  }, [workspace.id, workspace.path]);

  const forget = () => useGameLive.setState((state) => ({ href: { ...state.href, [workspace.id]: "" }, snapshot: { ...state.snapshot, [workspace.id]: undefined } }));
  // Only requests made while this pane is mounted: an old Sections click must not replay when switching back.
  const seen = useRef(go?.nonce);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (go && go.nonce !== seen.current) { seen.current = go.nonce; forget(); setTarget(go); } }, [go]);

  useEffect(() => {
    if (!origin) return;
    const receive = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== frame.current?.contentWindow || event.data?.channel !== LAB_CHANNEL) return;
      if (typeof event.data.location === "string") {
        const location = event.data.location as string;
        useGameLive.setState((state) => ({ href: { ...state.href, [workspace.id]: location } }));
        const hash = hashOf(location);
        patchGame(workspace.id, labOf(hash) === "character" ? { characterLink: hash } : { link: hash });
        return;
      }
      if (event.data.snapshot) useGameLive.setState((state) => ({ snapshot: { ...state.snapshot, [workspace.id]: event.data.snapshot } }));
      if (event.data.ready) return;
      const waiting = pending.current.get(event.data.id);
      if (!waiting) return;
      clearTimeout(waiting.timer); pending.current.delete(event.data.id);
      if (event.data.error) waiting.reject(new Error(event.data.error));
      else waiting.resolve(event.data.snapshot);
    };
    addEventListener("message", receive);
    const waiting = pending.current;
    return () => {
      removeEventListener("message", receive);
      for (const p of waiting.values()) { clearTimeout(p.timer); p.reject(new Error("Game closed")); }
      waiting.clear();
    };
  }, [origin, workspace.id]);

  const request: LabRequest = (action, values) => new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => { pending.current.delete(id); reject(new Error("No response from this lab. Wait for the game to load.")); }, 5000);
    pending.current.set(id, { resolve, reject, timer });
    if (!origin) { clearTimeout(timer); pending.current.delete(id); reject(new Error("The game is still starting.")); return; }
    frame.current?.contentWindow?.postMessage({ channel: LAB_CHANNEL, id, action, ...values }, origin);
  });

  const navigate = (hash: string) => {
    forget();
    setTarget({ hash: hashOf(hash), nonce: Date.now() });
  };
  const toggle = (id: (typeof LABS)[number]["id"]) => {
    if (id === "character") {
      if (lab === "character") navigate(game.beforeCharacter ?? game.link ?? DEFAULT_LINK);
      else { patchGame(workspace.id, { beforeCharacter: current }); navigate(game.characterLink ?? DEFAULT_CHARACTER); }
      return;
    }
    const base = lab === "character" ? game.beforeCharacter ?? game.link ?? DEFAULT_LINK : current;
    navigate(withLab(base, lab === id ? undefined : id));
  };

  const src = origin ? `${origin}/?studio=1${target.nonce ? `&v=${target.nonce}` : ""}${target.hash}` : undefined;
  return <section className={`game-pane ${hidden ? "is-hidden" : ""}`} aria-label="Game" aria-hidden={hidden}>
    <div className="game-toolbar">
      {editing !== undefined ? <form className="game-goto" onSubmit={(event) => {
        event.preventDefault();
        const value = editing.trim();
        setEditing(undefined);
        // A PR preview or main build link works too: only its #/ part matters here.
        if (value.includes("#/")) navigate(value.slice(value.indexOf("#/")));
      }}>
        <input autoFocus aria-label="Game link" value={editing} placeholder="Paste a #/world/… link or a preview link" onChange={(event) => setEditing(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Escape") setEditing(undefined); }} onBlur={() => setEditing(undefined)} />
      </form> : <button className="game-crumbs" aria-label="Current section" title={`${current}\nClick to open another link`} onClick={() => setEditing(current)}>
        {crumb.place ? <>
          <span>{crumb.place}</span>
          {crumb.activity && <><span className="crumb-sep">▸</span><span>{crumb.activity}</span></>}
          {crumb.section && <><span className="crumb-sep">▸</span><strong>{crumb.section}</strong></>}
        </> : <strong>{lab === "character" ? "🦄 Character lab" : current.startsWith("#/world") ? "🌍 World" : current}</strong>}
        {crumb.params.map(([key, value]) => <code key={key} className="crumb-param">{key}={value}</code>)}
      </button>}
      <div className="game-tools">
        <select aria-label="Device frame" value={frameId} disabled={lab === "camera"} title={lab === "camera" ? "The camera lab has its own iPad and iPhone frames" : "Device frame"}
          onChange={(event) => patchGame(workspace.id, { frame: event.target.value as GameFrame })}>
          {FRAMES.map((item) => <option key={item.id} value={item.id}>{item.label}{item.width ? ` · ${item.width}×${item.height}` : ""}</option>)}
        </select>
        <button className="game-tool" aria-label="Reload the game" title="Reload this section" onClick={() => navigate(current)}><RefreshIcon size={14} /></button>
        <span className="lab-toggles" role="group" aria-label="Labs">
          {LABS.map((item) => <button key={item.id} className={`lab-toggle ${lab === item.id ? "is-on" : ""}`} aria-pressed={lab === item.id} title={item.hint} onClick={() => toggle(item.id)}>
            <span aria-hidden="true">{item.emoji}</span>{item.label}
          </button>)}
        </span>
      </div>
    </div>
    <div className="game-stage" ref={stage.ref}>
      {error ? <div className="game-message" role="alert"><strong>The game can't start here</strong><p>{error}</p></div>
        : !src ? <div className="game-message"><p>Starting the game for {workspace.name}…</p></div>
        : <div className={`game-device ${stage.device ? "is-framed" : ""}`} style={stage.device ? { width: stage.device.width * stage.scale, height: stage.device.height * stage.scale } : undefined}>
          <iframe ref={frame} title={`Game: ${workspace.name}`} src={src} allow="autoplay"
            style={stage.device ? { width: stage.device.width, height: stage.device.height, transform: `scale(${stage.scale})` } : undefined} />
        </div>}
    </div>
    {lab && src && <LabPanel key={lab} workspace={workspace} kind={lab} request={request} snapshot={snapshot} />}
  </section>;
}

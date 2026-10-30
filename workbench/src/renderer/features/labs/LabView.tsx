import { useEffect, useRef, useState } from 'react';
import { GAME_ORIGIN, LAB_CHANNEL, snapshotKey, validateProposal, type LabProposal, type LabSnapshot } from '../../../shared/labs';
import type { ViewComponentProps } from '../../core/view-registry';
import { useWorkbenchStore } from '../../state/workbench-store';
import { services } from '../../core/services';

const DEFAULTS: Record<string, string> = {
  'camera-lab': '#/world/thailand/hub/downstairs?cam=1&cam.frame=ipad-wide',
  'feel-lab': '#/world/thailand/nan-trip/drive?feel=1',
  'character-lab': '#/world/characters/nick?lineup=nick,nick-code',
};
interface State { link?: string; draft?: string; provider?: 'claude' | 'codex'; }
function labLink(link: string, type: string): string {
  let hash = link.trim();
  if (hash.startsWith('http')) hash = new URL(hash).hash;
  if (!hash.startsWith('#/world/')) throw new Error('Paste a game section link beginning #/world/');
  const [route, query] = hash.split('?');
  const params = new URLSearchParams(query);
  if (type === 'camera-lab') { params.delete('feel'); params.set('cam', '1'); }
  if (type === 'feel-lab') { params.delete('cam'); params.set('feel', '1'); }
  return `${GAME_ORIGIN}/?studio=1${route}?${params}`;
}

export function LabView({ view, workspace }: ViewComponentProps) {
  const state = (view.state ?? {}) as State;
  const patch = (value: Partial<State>) => useWorkbenchStore.getState().updateViewState(workspace.id, view.id, value);
  const [input, setInput] = useState(state.link ?? DEFAULTS[view.type]);
  const [src, setSrc] = useState(() => labLink(state.link ?? DEFAULTS[view.type], view.type));
  const [snapshot, setSnapshot] = useState<LabSnapshot>();
  const [message, setMessage] = useState('Open a section, then describe what you want to change.');
  const [busy, setBusy] = useState(false);
  const [undo, setUndo] = useState<LabSnapshot>();
  const frame = useRef<HTMLIFrameElement>(null);
  const job = useRef<string | undefined>(undefined);
  const alive = useRef(true);
  const pending = useRef(new Map<string, { resolve: (s: LabSnapshot) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>());
  const character = view.type === 'character-lab';
  const request = (action: 'snapshot' | 'apply', values?: { expected: string; proposal: LabProposal }): Promise<LabSnapshot> => new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => { pending.current.delete(id); reject(new Error('No response from this lab. Check the section link and wait for the game to load.')); }, 5000);
    pending.current.set(id, { resolve, reject, timer });
    frame.current?.contentWindow?.postMessage({ channel: LAB_CHANNEL, id, action, ...values }, GAME_ORIGIN);
  });
  useEffect(() => {
    alive.current = true;
    const receive = (event: MessageEvent) => {
      if (event.origin !== GAME_ORIGIN || event.source !== frame.current?.contentWindow || event.data?.channel !== LAB_CHANNEL) return;
      if (event.data.snapshot) { setSnapshot(event.data.snapshot); patch({ link: event.data.snapshot.href }); }
      if (event.data.ready) return;
      const waiting = pending.current.get(event.data.id);
      if (!waiting) return;
      clearTimeout(waiting.timer); pending.current.delete(event.data.id);
      if (event.data.error) waiting.reject(new Error(event.data.error));
      else { setSnapshot(event.data.snapshot); waiting.resolve(event.data.snapshot); }
    };
    addEventListener('message', receive);
    return () => {
      alive.current = false;
      removeEventListener('message', receive);
      if (job.current) window.workbench.studio.cancel(job.current);
      for (const p of pending.current.values()) { clearTimeout(p.timer); p.reject(new Error('Lab closed')); }
      pending.current.clear();
    };
  }, []);
  const refresh = () => request('snapshot').catch(error => { if (alive.current) setMessage(String(error)); });
  async function tune() {
    const id = crypto.randomUUID(); job.current = id;
    setBusy(true); setUndo(undefined); setMessage('Reading the live controls…');
    try {
      const before = await request('snapshot');
      if (!alive.current || job.current !== id) return;
      if (!before.controls.length) throw new Error('No controls in this section. Open a scene with knobs or a 3D camera.');
      setMessage(`Asking ${state.provider ?? 'claude'}…`);
      const proposal = validateProposal(before, await window.workbench.studio.tune({ id, provider: state.provider ?? 'claude', prompt: state.draft ?? '', snapshot: before }));
      if (!alive.current || job.current !== id) return;
      // The game independently checks freshness too. An AI reply cannot overwrite a later scene or manual tweak.
      const now = await request('snapshot');
      if (snapshotKey(before) !== snapshotKey(now)) throw new Error('The scene or controls changed while AI was thinking. Keep this moment still and try again.');
      if (proposal.changes.length) {
        await request('apply', { expected: snapshotKey(before), proposal });
        setUndo(before);
      }
      setMessage(proposal.explanation);
      await refresh();
    } catch (error) { if (alive.current) setMessage(String(error)); }
    finally { if (alive.current) setBusy(false); job.current = undefined; }
  }
  async function restore() {
    if (!undo) return;
    try {
      const now = await request('snapshot');
      if (now.href.split('?')[0] !== undo.href.split('?')[0] || now.context.mode !== undo.context.mode || now.context.frame !== undo.context.frame) throw new Error('Return to the original scene, mode and frame before undoing.');
      await request('apply', { expected: snapshotKey(now), proposal: { explanation: 'Undo AI tuning', changes: undo.controls.map(c => ({ key: c.key, value: c.value })) } });
      setUndo(undefined); setMessage('Restored the controls from before AI tuning.'); await refresh();
    } catch (error) { setMessage(String(error)); }
  }
  async function openAgent() {
    let current: LabSnapshot;
    try { current = await request('snapshot'); } catch (error) { setMessage(String(error)); return; }
    const prompt = `Read AGENTS.md first. Work on this checkout and branch. Do not commit, push or open PRs.\n${character ? 'Read docs/3d-characters.md and inspect the current character in the lab.' : 'Bake only the changed lab values into the matching defaults. Keep other rounds and screen shapes unchanged; leave knobs and watchers in place.'}\n${JSON.stringify(current, null, 2)}\nDad’s note: ${state.draft ?? ''}\n${message}`;
    const id = useWorkbenchStore.getState().createView(workspace.id, 'agent', character ? 'Character builder' : 'Bake lab changes', { autoTitle: false });
    // Prefill only: Dad reviews and sends in the existing CLI composer.
    useWorkbenchStore.getState().updateViewState(workspace.id, id, { draft: prompt });
  }
  return <section className="studio-lab" aria-label={view.title}>
    <form className="studio-location" onSubmit={event => { event.preventDefault(); try { const url = labLink(input, view.type); setSrc(url); patch({ link: input }); setSnapshot(undefined); setUndo(undefined); } catch (error) { setMessage(String(error)); } }}>
      <label>Game section<input aria-label="Game section link" value={input} onChange={event => setInput(event.target.value)} /></label>
      <button type="submit" disabled={busy}>Open section</button>
      <button type="button" disabled={busy} onClick={() => { setInput('#/world/sections'); setSrc(`${GAME_ORIGIN}/?studio=1#/world/sections`); }}>Browse sections</button>
    </form>
    <iframe ref={frame} title={view.title} src={src}  allow="autoplay" />
    <div className="studio-composer">
      <label>{character ? 'Character builder note' : 'What should feel or look different?'}
        <textarea aria-label="Lab prompt" value={state.draft ?? ''} placeholder={character ? 'Describe the character or rig change. The builder will use docs/3d-characters.md…' : 'The car is too twitchy when I make a small turn. Make it gentler…'} onChange={event => patch({ draft: event.target.value })} />
      </label>
      <div className="studio-actions">
        {!character && <>
          <select aria-label="AI provider" value={state.provider ?? 'claude'} onChange={event => patch({ provider: event.target.value as State['provider'] })}><option value="claude">Claude Code</option><option value="codex">Codex CLI</option></select>
          <button disabled={busy || !state.draft?.trim()} onClick={() => void tune()}>Ask AI & preview controls</button>
          <button disabled={!busy} onClick={() => { if (job.current) window.workbench.studio.cancel(job.current); job.current = undefined; setMessage('Cancelled'); }}>Cancel</button>
          <button disabled={busy || !undo} onClick={() => void restore()}>Undo AI change</button>
          <button disabled={busy} onClick={() => void refresh()}>Read controls</button>
        </>}
        <button disabled={busy || (!character && !snapshot)} onClick={() => void openAgent()}>{character ? 'Prepare character builder prompt' : 'Prepare prompt to save in game'}</button>
        {character && <button onClick={() => void services.commands.execute('view.create', { workspaceId: workspace.id, viewType: 'image-generator' })}>Create character concept</button>}
      </div>
      <p role="status">{message}</p>
      {snapshot && <details><summary>{character ? 'Current character and pose' : `${snapshot.controls.length} live controls · source stays unchanged until you send the save prompt`}</summary><pre>{JSON.stringify(snapshot, null, 2)}</pre></details>}
    </div>
  </section>;
}

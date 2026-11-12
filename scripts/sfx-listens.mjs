#!/usr/bin/env node
// The review page's listen tracks for a folder of recorded sound effects (scripts/generate-sfx.mjs): one mp3 per stage,
// its clips in sfx.json order with a short gap between them (loops cut to 4 s, 15 s beds to 6 s), and each clip's start
// and end time, written into review/review.json's `listens` so the page shows the times, lights up the one playing and
// plays from a tapped one. The user names the ones to redo by stage and number ("jetski 2").
//
//   node scripts/sfx-listens.mjs <sfx folder> <name>=<title>=<id prefix>[,<prefix>...] ...
//   node scripts/sfx-listens.mjs src/world/places/thailand/activities/samet-trip/sfx \
//     "jetski=The jet ski=jetski-" "finale=The sunset and the fire show=sunset-,fire-"
//
// Each item's text is the clip's `label` in sfx.json if it has one, else its id and the start of its prompt. Tracks go
// to review/sfx/<name>.mp3; an existing `listens` entry with the same audio is replaced, the others are kept. Needs ffmpeg.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const [folder, ...specs] = process.argv.slice(2)
if (!folder || !specs.length) {
  console.error('usage: node scripts/sfx-listens.mjs <sfx folder> <name>=<title>=<id prefix>[,<prefix>...] ...')
  process.exit(1)
}
const GAP = 0.7
const dir = path.resolve(folder)
const list = JSON.parse(readFileSync(path.join(dir, 'sfx.json'), 'utf8'))
const tmp = mkdtempSync(path.join(tmpdir(), 'sfx-listens-'))
const out = path.join(root, 'review/sfx')
mkdirSync(out, { recursive: true })
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a])
const seconds = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim()
const wav = ['-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le']
ff('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(GAP), ...wav, path.join(tmp, 'gap.wav'))
const text = (s) => s.label ?? `${s.id.replace(/^[a-z]+-/, '')}: ${s.prompt.split(/[.:,]/)[0].replace(/^(A|An|One|The) /, '').slice(0, 70)}${s.loop ? ' (loop)' : ''}`

const listens = []
try {
  for (const spec of specs) {
    const [name, title, prefixes] = spec.split('=')
    const pre = (prefixes ?? '').split(',').filter(Boolean)
    const clips = list.filter((s) => pre.some((p) => s.id.startsWith(p)) && existsSync(path.join(dir, `${s.id}.mp3`)))
    if (!name || !title || !clips.length) throw new Error(`no clips for "${spec}" (name=title=prefix,...)`)
    const parts = []
    const items = []
    let t = 0
    clips.forEach((s, i) => {
      const cut = s.loop ? (s.seconds >= 15 ? 6 : 4) : 99
      const f = path.join(tmp, `${name}-${i}.wav`)
      const len = Math.min(cut, seconds(path.join(dir, `${s.id}.mp3`)))
      ff('-i', path.join(dir, `${s.id}.mp3`), '-t', String(len), '-af', `afade=t=out:st=${Math.max(0, len - 0.4)}:d=0.4,volume=0.8`, ...wav, f)
      const d = seconds(f)
      items.push({ text: text(s), at: +t.toFixed(2), end: +(t + d).toFixed(2) })
      t += d + GAP
      parts.push(f, path.join(tmp, 'gap.wav'))
    })
    writeFileSync(path.join(tmp, `${name}.txt`), parts.map((p) => `file '${p}'`).join('\n'))
    ff('-f', 'concat', '-safe', '0', '-i', path.join(tmp, `${name}.txt`), '-c:a', 'libmp3lame', '-b:a', '96k', path.join(out, `${name}.mp3`))
    listens.push({ title, audio: `sfx/${name}.mp3`, items })
    console.log(`review/sfx/${name}.mp3: ${items.length} sounds, ${t.toFixed(0)} s`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

const briefPath = path.join(root, 'review/review.json')
const brief = existsSync(briefPath) ? JSON.parse(readFileSync(briefPath, 'utf8')) : {}
const made = new Set(listens.map((l) => l.audio))
brief.listens = [...(brief.listens ?? []).filter((l) => !made.has(l.audio)), ...listens]
writeFileSync(briefPath, JSON.stringify(brief, null, 1) + '\n')
console.log(`review/review.json: ${brief.listens.length} listen tracks. Now: node scripts/review.mjs`)

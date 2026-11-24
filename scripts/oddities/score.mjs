// Scores a qa-oddities run against the eval set's answer key (scripts/oddities/eval-labels.json): how many known
// bugs it caught and boxed in the right place, and how many false alarms it raised on clean frames. Writes eval/report.md.
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { MAYBE, ODDITIES, YES } from './questions.mjs'

/** Label types (the answer key) to the question ids that should catch them. */
const CATCHES = {
  clipping: ['sunk'],
  transparency: ['waterEdge'],
  detached_prop: ['detachedProp', 'brokenProp'],
  duplicate_ui: ['duplicateUi'],
  dither: ['dither'],
  camera_clipping: ['cameraInside'],
  floating: ['floating'],
}
const overlaps = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

export function score(results, dir, labels) {
  const rows = []
  const lines = ['# Jev visual QA: eval', '', `Thresholds: finding at ${YES}, maybe at ${MAYBE}.`, '']
  let bugFrames = 0, caught = 0, boxed = 0, clean = 0, cleanAlarms = 0
  for (const r of results) {
    const key = labels[r.name]
    if (!key) continue
    const truth = key.oddities ?? []
    const hitTypes = new Set(r.findings.map((f) => f.type))
    if (!truth.length) {
      clean++
      cleanAlarms += r.findings.length
      rows.push(`| ${r.name} | clean | ${r.findings.map((f) => `${f.type} ${f.p.toFixed(2)}`).join(', ') || '-'} |`)
      continue
    }
    bugFrames++
    const got = truth.filter((t) => CATCHES[t.type]?.some((q) => hitTypes.has(q)))
    const inPlace = truth.filter((t) => r.findings.some((f) => CATCHES[t.type]?.includes(f.type) && overlaps(f.box, t.box)))
    if (got.length) caught++
    if (inPlace.length) boxed++
    const wrong = r.findings.filter((f) => !truth.some((t) => CATCHES[t.type]?.includes(f.type)))
    const probs = truth.map((t) => `${t.type}: ${CATCHES[t.type].map((q) => r.answers[q]?.noul?.toFixed(2)).join('/')}`).join('; ')
    rows.push(`| ${r.name} | ${truth.map((t) => t.type).join(', ')} | ${got.length ? (inPlace.length ? 'caught, boxed right' : 'caught, box elsewhere') : 'missed'} (${probs})${wrong.length ? `; also ${wrong.map((f) => f.type).join(', ')}` : ''} |`)
  }
  lines.push(`**Known bugs caught: ${caught} of ${bugFrames} frames** (${boxed} with the box on the bug).`)
  lines.push(`**False alarms: ${cleanAlarms} on ${clean} clean frames** (${clean ? (cleanAlarms / clean * 10).toFixed(1) : '-'} per 10).`, '')
  lines.push('Per question, mean answer on frames with that bug vs. clean frames (bigger gap = more useful):', '', '| Question | Bug frames | Clean frames |', '|---|---|---|')
  for (const [q] of Object.entries(ODDITIES)) {
    const type = Object.keys(CATCHES).find((t) => CATCHES[t].includes(q))
    const withBug = results.filter((r) => labels[r.name]?.oddities?.some((t) => t.type === type)).map((r) => r.answers[q]?.noul)
    const cleanP = results.filter((r) => labels[r.name] && !labels[r.name].oddities?.length).map((r) => r.answers[q]?.noul)
    const mean = (xs) => (xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2) : '-')
    lines.push(`| ${q} | ${mean(withBug)} (n=${withBug.length}) | ${mean(cleanP)} (n=${cleanP.length}) |`)
  }
  // A suggested `yes` per question: the lowest threshold that keeps false alarms to ~1 per 10 frames without its bug.
  lines.push('', 'Suggested `yes` per question (at most 1 false alarm per 10 frames without that bug; small set, so round, don\'t fit):', '')
  for (const [q, o] of Object.entries(ODDITIES)) {
    const type = Object.keys(CATCHES).find((t) => CATCHES[t].includes(q))
    const has = (r) => labels[r.name]?.oddities?.some((t) => t.type === type)
    const neg = results.filter((r) => labels[r.name] && !has(r)).map((r) => r.answers[q]?.noul).sort((a, b) => b - a)
    const pos = results.filter(has).map((r) => r.answers[q]?.noul)
    const cut = Math.max(0.5, Math.ceil((neg[Math.floor(neg.length / 10)] + 0.001) * 20) / 20)
    lines.push(`- ${q}: now ${o.yes ?? YES}, suggested ${cut.toFixed(2)}; catches ${pos.filter((p) => p >= cut).length}/${pos.length} of its bug frames there`)
  }
  lines.push('', '| Frame | Answer key | Result |', '|---|---|---|', ...rows)
  writeFileSync(path.join(dir, 'eval', 'report.md'), lines.join('\n') + '\n')
  console.log(lines.slice(4, 6).join('\n'))
  console.log('See qa-output/oddities/eval/report.md')
}

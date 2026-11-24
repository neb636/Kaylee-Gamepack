// Fetches the eval set's pictures (scripts/oddities/eval-labels.json) from the review-pages branch, where past PRs'
// before/after pictures live, into qa-output/oddities/eval/src/. qa-oddities.mjs --eval calls it when they're missing.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export const evalSrc = (root) => path.join(root, 'qa-output', 'oddities', 'eval', 'src')
/** The local file name for a review-pages path: `neb636--canoe-look/pics/glide-before.jpg` -> `canoe-look__glide-before.jpg`. */
export const localName = (p) => `${p.split('/')[0].replace(/^neb636--/, '')}__${path.basename(p)}`

export function labels(root) {
  const { frames } = JSON.parse(readFileSync(path.join(root, 'scripts', 'oddities', 'eval-labels.json'), 'utf8'))
  return Object.fromEntries(Object.entries(frames).map(([p, v]) => [localName(p), { ...v, source: p }]))
}

export function fetchEvalSet(root) {
  const dir = evalSrc(root)
  mkdirSync(dir, { recursive: true })
  const missing = Object.values(labels(root)).filter((v) => !existsSync(path.join(dir, localName(v.source))))
  if (!missing.length) return
  execFileSync('git', ['fetch', '-q', 'origin', 'review-pages:refs/remotes/origin/review-pages'], { cwd: root })
  for (const v of missing) writeFileSync(path.join(dir, localName(v.source)), execFileSync('git', ['show', `origin/review-pages:${v.source}`], { cwd: root, maxBuffer: 64e6 }))
  console.log(`Fetched ${missing.length} eval pictures from the review-pages branch.`)
}

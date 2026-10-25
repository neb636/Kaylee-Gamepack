// Waits for Codex's review of a PR's latest commit, prints what it found, and exits.
// Meant to run under Claude Code's Monitor tool: silent while waiting, so it costs no context until it prints.
//   node scripts/watch-codex-review.mjs --pr 182 [--timeout 420] [--interval 20]
// Output lines (each one wakes the session): FINDINGS (then one block per inline comment), CLEAN, TIMEOUT.
// Codex keeps one summary comment on the PR with a machine-readable state (status + commit_sha); inline findings
// are ordinary PR review comments. Typical review time: 1-2 minutes after a push; the timeout is 3.5x that.
import { execFileSync } from 'node:child_process'

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? process.argv[i + 1] : fallback
}
const pr = arg('pr')
if (!pr) {
  console.error('usage: watch-codex-review.mjs --pr <number> [--timeout 420] [--interval 20]')
  process.exit(2)
}
const timeoutS = Number(arg('timeout', 420))
const intervalS = Number(arg('interval', 20))

const gh = (...args) => JSON.parse(execFileSync('gh', args, { encoding: 'utf8' }) || 'null')
const api = (path) => gh('api', '--paginate', '--slurp', path).flat()
const isCodex = (c) => /codex/i.test(c.user?.login ?? '')

const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000))
const started = Date.now()

while (true) {
  try {
    const head = gh('pr', 'view', pr, '--json', 'headRefOid,state')
    if (head.state !== 'OPEN') {
      console.log(`CLOSED PR #${pr} is ${head.state}; stopped watching.`)
      break
    }
    const summary = api(`repos/{owner}/{repo}/issues/${pr}/comments`).find(
      (c) => isCodex(c) && c.body.includes('codex-pull-request-review-summary'),
    )
    const state = summary && JSON.parse(summary.body.match(/codex-review-state:v1 (\{.*?\}) -->/s)?.[1] ?? 'null')
    const review = state?.code_review
    if (review?.status === 'completed' && review.commit_sha === head.headRefOid) {
      const inline = api(`repos/{owner}/{repo}/pulls/${pr}/comments`).filter(
        (c) => isCodex(c) && c.commit_id === head.headRefOid && !c.in_reply_to_id,
      )
      if (!review.has_any_findings || inline.length === 0) {
        console.log(`CLEAN Codex reviewed ${head.headRefOid.slice(0, 7)} on PR #${pr}: no findings.`)
      } else {
        console.log(`FINDINGS Codex reviewed ${head.headRefOid.slice(0, 7)} on PR #${pr}: ${inline.length} comment(s).`)
        for (const c of inline) {
          console.log(`--- ${c.path}:${c.line ?? c.original_line} (comment id ${c.id})\n${c.body.replace(/<[^>]+>/g, '').trim()}`)
        }
      }
      break
    }
  } catch (e) {
    // transient gh/network errors: keep trying until the timeout
  }
  if ((Date.now() - started) / 1000 > timeoutS) {
    console.log(`TIMEOUT No finished Codex review of PR #${pr} after ${timeoutS}s; stopped watching.`)
    break
  }
  await sleep(intervalS)
}

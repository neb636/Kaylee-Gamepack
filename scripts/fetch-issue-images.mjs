// Downloads a "new lesson" issue (text + attached photos) into .lesson-input/
// so Codex can look at it. Nothing in .lesson-input/ is ever committed.
//
// Env: ISSUE_NUMBER, GITHUB_REPOSITORY (owner/repo), GH_TOKEN (optional for public repos)
// Local testing: node scripts/fetch-issue-images.mjs --dir example-lesson-plan "optional topic text"
import sharp from 'sharp'
import { mkdirSync, readdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const OUT = '.lesson-input'
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

/** Save any image as a reasonably sized PNG (phone photos are huge). */
async function savePage(buf, n) {
  const file = join(OUT, `page-${n}.png`)
  await sharp(buf).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).png().toFile(file)
  console.log(`saved ${file}`)
}

if (process.argv[2] === '--dir') {
  const dir = process.argv[3]
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp|heic)$/i.test(f)).sort()
  let n = 0
  for (const f of files) await savePage(join(dir, f), ++n)
  writeFileSync(join(OUT, 'issue.md'), `# Local lesson\n\n${process.argv[4] ?? ''}\n`)
  process.exit(0)
}

const { ISSUE_NUMBER, GITHUB_REPOSITORY, GH_TOKEN } = process.env
if (!ISSUE_NUMBER || !GITHUB_REPOSITORY) throw new Error('ISSUE_NUMBER and GITHUB_REPOSITORY are required')
const owner = GITHUB_REPOSITORY.split('/')[0]
const headers = { Accept: 'application/vnd.github+json', ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}) }
const api = async (path) => {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub API ${path}: ${res.status}`)
  return res.json()
}

const issue = await api(`/issues/${ISSUE_NUMBER}`)
const comments = await api(`/issues/${ISSUE_NUMBER}/comments?per_page=100`)
// Only trust text from the repo owner (the repo is public).
const ownerComments = comments.filter((c) => c.user?.login === owner)
const texts = [issue.body ?? '', ...ownerComments.map((c) => c.body ?? '')]

writeFileSync(
  join(OUT, 'issue.md'),
  [`# ${issue.title}`, '', issue.body ?? '', ...ownerComments.map((c) => `\n---\nComment:\n${c.body}`)].join('\n'),
)

const urls = new Set()
for (const t of texts) {
  for (const m of t.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)) urls.add(m[1])
  for (const m of t.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"/g)) urls.add(m[1])
  for (const m of t.matchAll(/https:\/\/github\.com\/user-attachments\/assets\/[\w-]+/g)) urls.add(m[0])
}

let n = 0
for (const url of urls) {
  // fetch() drops the Authorization header when GitHub redirects to its file storage.
  const res = await fetch(url, { headers: url.startsWith('https://github.com/') && GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {} })
  const type = res.headers.get('content-type') ?? ''
  if (!res.ok || !type.startsWith('image/')) {
    console.warn(`skipped ${url} (${res.status} ${type})`)
    continue
  }
  await savePage(Buffer.from(await res.arrayBuffer()), ++n)
}
console.log(`${n} image(s), issue text in ${OUT}/issue.md`)

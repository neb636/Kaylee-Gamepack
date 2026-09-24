// Prints a markdown table of existing games so the AI can pick something new.
// Reads src/games/*/meta.ts with simple regexes (meta files use one-line string values).
// Usage: npm run games            (prints to stdout)
import { readdirSync, readFileSync, existsSync } from 'node:fs'

const STRING = /(['"`])((?:\\.|(?!\1).)*)\1/
const field = (src, key) => src.match(new RegExp(`${key}:\\s*${STRING.source}`))?.[2] ?? ''
const list = (src, key) => [...(src.match(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`))?.[1] ?? '').matchAll(new RegExp(STRING.source, 'g'))].map((m) => m[2])

const rows = readdirSync('src/games', { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`src/games/${d.name}/meta.ts`))
  .map((d) => {
    const src = readFileSync(`src/games/${d.name}/meta.ts`, 'utf8')
    return {
      id: d.name,
      title: field(src, 'title'),
      subject: field(src, 'subject'),
      skills: list(src, 'skills').join('; '),
      mechanic: field(src, 'mechanic'),
      setting: field(src, 'setting'),
      createdAt: field(src, 'createdAt'),
    }
  })
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

console.log(`# Existing games (newest first, ${rows.length} total)\n`)
console.log('| id | title | subject | skills | core mechanic | setting | created |')
console.log('|---|---|---|---|---|---|---|')
for (const r of rows) console.log(`| ${r.id} | ${r.title} | ${r.subject} | ${r.skills} | ${r.mechanic} | ${r.setting} | ${r.createdAt} |`)

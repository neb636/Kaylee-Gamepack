#!/usr/bin/env node
// Plan pages (planning/**/*.html): the plan is JSON inside <script type="application/json" id="plan">, drawn by
// planning/viewer/plan.js. Format: .agents/skills/plan/SKILL.md.
//
//   node scripts/plan.mjs check [files...]   validate every plan page (or the ones named)
//   node scripts/plan.mjs md <file>          print a plan as Markdown (quick reading for agents, diffs)
//   node scripts/plan.mjs json <file>        print the plan's JSON
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PLAN_RE = /<script type="application\/json" id="plan">([\s\S]*?)<\/script>/

const STATUS = ['done', 'next', 'doing', 'todo', 'dropped', 'plan']
const TONES = ['note', 'dad', 'open', 'warn', 'done']

// Each block type: its required fields, and which item fields must be there.
const BLOCKS = {
  text: { req: ['md'] },
  list: { req: ['items'] },
  callout: { req: [] },
  flow: { req: ['rows'] },
  cards: { req: ['items'] },
  ladder: { req: ['items'], item: ['title'] },
  table: { req: ['head', 'rows'] },
  bars: { req: ['series', 'items'], item: ['label'] },
  sections: { req: ['items'], item: ['id', 'name'] },
  build: { req: ['items'], item: ['title'] },
  log: { req: ['items'], item: ['title'] },
  qa: { req: ['items'], item: ['q'] },
  chips: { req: ['items'], item: ['label'] },
  code: { req: ['text'] },
  details: { req: ['summary'] },
  image: { req: ['src'] },
}

function findPlans(dir = join(ROOT, 'planning')) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return e.name === 'viewer' ? [] : findPlans(p)
    return e.name.endsWith('.html') && PLAN_RE.test(readFileSync(p, 'utf8')) ? [p] : []
  })
}

function load(file) {
  const html = readFileSync(file, 'utf8')
  const m = PLAN_RE.exec(html)
  if (!m) throw new Error('no <script type="application/json" id="plan">')
  return { html, raw: m[1], plan: JSON.parse(m[1]) }
}

function check(file) {
  const errors = []
  const err = (where, msg) => errors.push(`${where}: ${msg}`)
  let doc
  try {
    doc = load(file)
  } catch (e) {
    return [`JSON: ${e.message}`]
  }
  const { html, raw, plan } = doc
  const dir = dirname(file)
  for (const asset of ['viewer/plan.css', 'viewer/plan.js']) {
    const ref = new RegExp(`(?:href|src)="([^"]*${asset.replace('.', '\\.')})"`).exec(html)
    if (!ref) err('page', `doesn't load ${asset}`)
    else if (!existsSync(resolve(dir, ref[1]))) err('page', `${ref[1]} doesn't exist from here`)
  }
  if (/<\/script/i.test(raw)) err('JSON', 'contains "</script", which ends the script tag early')
  if (!/<title>[^<]+<\/title>/.test(html)) err('page', 'needs a <title>')
  if (typeof plan.title !== 'string') err('plan', 'needs a title')
  if (plan.status && !plan.status.label) err('plan.status', 'needs a label')
  if (!Array.isArray(plan.sections) || !plan.sections.length) err('plan', 'needs sections')
  const ids = new Set()
  const relLink = (where, href) => {
    if (/^(https?:|#|pr:|mailto:)/.test(href)) return
    if (!existsSync(resolve(dir, href.split('#')[0]))) err(where, `link ${href} doesn't exist`)
  }
  const scanMd = (where, s) => {
    if (typeof s !== 'string') return
    for (const m of s.matchAll(/\]\(([^)\s]+)\)/g)) relLink(where, m[1])
  }
  for (const r of plan.related ?? []) relLink('related', r.href)
  const walk = (where, list) => {
    if (!Array.isArray(list)) return err(where, 'blocks must be an array')
    list.forEach((b, i) => {
      const at = `${where}[${i}] ${b?.type ?? '?'}`
      const spec = BLOCKS[b?.type]
      if (!spec) return err(at, `unknown block type (known: ${Object.keys(BLOCKS).join(', ')})`)
      for (const k of spec.req) if (b[k] == null) err(at, `needs "${k}"`)
      if (b.type === 'callout' && b.tone && !TONES.includes(b.tone)) err(at, `tone must be one of ${TONES.join(', ')}`)
      if (b.type === 'flow') (b.rows ?? []).forEach((r, j) => Array.isArray(r.steps) || err(`${at} row ${j}`, 'needs steps'))
      if (b.type === 'table') (b.rows ?? []).forEach((r, j) => r.length === b.head.length || err(`${at} row ${j}`, `has ${r.length} cells, head has ${b.head.length}`))
      if (b.type === 'bars') for (const s of b.series ?? []) if (!s.key || !s.label) err(at, 'each series needs key and label')
      if (b.type === 'image' && b.src && !/^https?:/.test(b.src) && !existsSync(resolve(dir, b.src))) err(at, `image ${b.src} doesn't exist`)
      scanMd(at, b.md)
      for (const [j, it] of (Array.isArray(b.items) ? b.items : []).entries()) {
        if (it && typeof it === 'object') {
          for (const k of spec.item ?? []) if (it[k] == null) err(`${at} item ${j}`, `needs "${k}"`)
          if (it.status && !STATUS.includes(it.status)) err(`${at} item ${j}`, `status must be one of ${STATUS.join(', ')}`)
          scanMd(`${at} item ${j}`, it.md)
          if (it.blocks) walk(`${at} item ${j}`, it.blocks)
        }
      }
      if (b.blocks) walk(at, b.blocks)
    })
  }
  ;(plan.sections ?? []).forEach((s, i) => {
    const at = `sections[${i}] ${s.id ?? '?'}`
    if (!/^[a-z0-9-]+$/.test(s.id ?? '')) err(at, 'id must be lower-case-with-dashes')
    if (ids.has(s.id)) err(at, 'duplicate id')
    ids.add(s.id)
    if (!s.title) err(at, 'needs a title')
    if (s.for && s.for !== 'build') err(at, 'for must be "build" or left out')
    walk(at, s.blocks)
  })
  return errors
}

// ---- Markdown, for agents ----
const flat = (s) => String(s ?? '').replace(/\n\s*\n/g, '\n\n')
function mdItems(items, depth = 0) {
  return (items ?? [])
    .map((it) => {
      const pad = '  '.repeat(depth)
      if (typeof it === 'string') return `${pad}- ${it}`
      return [`${pad}- ${it.text}`, mdItems(it.items, depth + 1)].filter(Boolean).join('\n')
    })
    .join('\n')
}
const meta = (x) =>
  [x.status && `[${x.status}]`, x.date, ...[].concat(x.pr ?? []).map((n) => `PR #${n}`), ...[].concat(x.tag ?? [])]
    .filter(Boolean)
    .join(' · ')
function mdBody(x, level) {
  return [x.md && flat(x.md), x.items && mdItems(x.items), x.blocks && mdBlocks(x.blocks, level)].filter(Boolean).join('\n\n')
}
function mdBlocks(list, level = 3) {
  const h = '#'.repeat(Math.min(level, 6))
  return (list ?? [])
    .map((b) => {
      const head = b.title && b.type !== 'callout' ? `${h} ${b.title}\n\n` : ''
      const it = b.items ?? []
      let out
      switch (b.type) {
        case 'text': out = flat(b.md); break
        case 'list': out = mdItems(it); break
        case 'callout': out = `> **${[b.icon, b.title ?? b.tone].filter(Boolean).join(' ')}**\n>\n` + mdBody(b, level + 1).split('\n').map((l) => `> ${l}`).join('\n'); break
        case 'flow': out = b.rows.map((r) => (r.label ? `${r.label}: ` : '') + r.steps.map((s) => `${s.icon ?? ''} ${s.label}${s.note ? ` (${s.note})` : ''}`.trim()).join(' → ')).join('\n\n'); break
        case 'cards': case 'chips':
          out = it.map((c) => `- ${c.icon ? c.icon + ' ' : ''}**${c.title ?? c.label}**${meta(c) ? ` (${meta(c)})` : ''}${c.md || c.items ? ': ' : ''}${[c.md && flat(c.md), c.items && '\n' + mdItems(c.items, 1)].filter(Boolean).join('')}`).join('\n')
          break
        case 'ladder': out = it.map((c, i) => `${c.n ?? i + 1}. **${c.title}**${meta(c) ? ` (${meta(c)})` : ''}\n${mdBody(c, level + 1).split('\n').map((l) => `   ${l}`).join('\n')}`).join('\n'); break
        case 'table': case 'bars': {
          const head = b.type === 'table' ? b.head : ['', ...b.series.map((s) => s.label + (s.unit ? ` (${s.unit})` : ''))]
          const rows = b.type === 'table' ? b.rows : it.map((r) => [r.label, ...b.series.map((s) => [].concat(r[s.key] ?? '').join('-'))])
          out = [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n')
          break
        }
        case 'sections': out = it.map((s, i) => `${s.n ?? i + 1}. \`${b.base ?? ''}${s.id}${s.query ? '?' + s.query : ''}\` ${s.name}${s.reads?.length ? ` (reads ${s.reads.join(', ')})` : ''}${s.status ? ` [${s.status}]` : ''}`).join('\n'); break
        case 'build': out = it.map((s, i) => `${s.n ?? i}. **${s.title}** ${meta(s)}${s.md || s.items || s.blocks ? '\n' + mdBody(s, level + 1).split('\n').map((l) => `   ${l}`).join('\n') : ''}`).join('\n'); break
        case 'log': out = it.map((e) => `${h} ${e.title}${meta(e) ? ` (${meta(e)})` : ''}\n\n${e.summary ? e.summary + '\n\n' : ''}${mdBody(e, level + 1)}`).join('\n\n'); break
        case 'qa': out = it.map((q) => `- **${q.q}** ${q.a ? flat(q.a) : `OPEN${q.why ? ': ' + q.why : ''}`}`).join('\n'); break
        case 'code': out = '```\n' + b.text + '\n```'; break
        case 'details': out = `**${b.summary}**\n\n${mdBody(b, level + 1)}`; break
        case 'image': out = `![${b.alt ?? ''}](${b.src})${b.caption ? `\n\n${b.caption}` : ''}`; break
        default: out = `(unknown block ${b.type})`
      }
      return head + out
    })
    .join('\n\n')
}
function toMd(p) {
  const out = [`# ${p.icon ? p.icon + ' ' : ''}${p.title}`]
  out.push([p.status?.label, p.kind, p.updated && `updated ${p.updated}`].filter(Boolean).join(' · '))
  if (p.pitch) out.push(p.pitch)
  if (p.next) out.push(`**Next:** ${flat(p.next)}`)
  if (p.facts?.length) out.push(p.facts.map((f) => `- ${f.label}: ${f.value}`).join('\n'))
  if (p.related?.length) out.push('Related: ' + p.related.map((r) => `[${r.label}](${r.href})`).join(', '))
  for (const s of p.sections) {
    out.push(`## ${s.icon ? s.icon + ' ' : ''}${s.title}${s.for === 'build' ? ' (for the builder)' : ''}`)
    if (s.lede) out.push(s.lede)
    out.push(mdBlocks(s.blocks))
  }
  return out.filter(Boolean).join('\n\n') + '\n'
}

const [cmd, ...args] = process.argv.slice(2)
if (cmd === 'check') {
  const files = args.length ? args.map((f) => resolve(f)) : findPlans()
  let bad = 0
  for (const f of files) {
    const errors = check(f)
    const name = relative(ROOT, f)
    if (errors.length) {
      bad++
      console.error(`✗ ${name}\n${errors.map((e) => `    ${e}`).join('\n')}`)
    } else console.log(`✓ ${name}`)
  }
  process.exit(bad ? 1 : 0)
} else if ((cmd === 'md' || cmd === 'json') && args[0]) {
  const { plan } = load(resolve(args[0]))
  process.stdout.write(cmd === 'md' ? toMd(plan) : JSON.stringify(plan, null, 2) + '\n')
} else {
  console.log('usage: node scripts/plan.mjs check [files...] | md <file> | json <file>')
  process.exit(cmd ? 1 : 0)
}

// Locks a country behind a family code (Thailand: its 3D house is the family's real home).
//
// With LOCK_CODE set (the deploy and preview workflows pass the THAILAND_CODE secret), every built chunk that holds the
// locked country's code and isn't needed at startup is encrypted (AES-GCM, key from the code with PBKDF2) into
// assets/<name>.lock, and <name>.js becomes a small stub: it decrypts the .lock file with the key the family code
// unlocked on this device (src/world/lock.ts saves it) and re-exports the real module. Everything that imports the chunk
// keeps working unchanged. Without LOCK_CODE (npm run dev, CI tests, a local build) nothing is locked.
//
// What stays readable without the code: what loads at startup (the country's meta.ts, sections, lines, voice clips) and
// its pictures. What's locked: the code that builds and runs the country (the house layout, the 3D world, the trips).
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto'
import { readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import type { Rolldown } from 'vite'

type OutputBundle = Rolldown.OutputBundle
type OutputChunk = Rolldown.OutputChunk

export interface LockConfig {
  place: string
  /** Fixed, so a device that unlocked once stays unlocked across deploys until the code changes. */
  salt: string
  iterations: number
  /** base64 of iv + AES-GCM(CHECK_TEXT): lets the page tell a right code from a wrong one. */
  check: string
}

export const CHECK_TEXT = 'kaylee-gamepack'
/** Where the page keeps the unlocked key (base64 raw AES key); the stubs read the same key. */
export const storageKey = (place: string) => `kaylee-lock:${place}`

/** Codes are typed by grown-ups on an iPad keyboard: ignore case and surrounding spaces. */
export const normalizeCode = (code: string) => code.trim().toLowerCase()

const BASE_TOKEN = '__KAYLEE_LOCK_BASE__'

export function lockPlace(place: string): Plugin {
  const code = process.env.LOCK_CODE ? normalizeCode(process.env.LOCK_CODE) : ''
  const salt = `kaylee-gamepack:${place}`
  const iterations = 210_000
  const key = code ? pbkdf2Sync(code, salt, iterations, 32, 'sha256') : null
  const lock: LockConfig | null = key ? { place, salt, iterations, check: encrypt(key, Buffer.from(CHECK_TEXT)).toString('base64') } : null
  let config: ResolvedConfig

  return {
    name: 'kaylee-lock',
    config: () => ({ define: { __PLACE_LOCK__: JSON.stringify(lock) } }),
    configResolved(c) {
      config = c
    },
    writeBundle(options, bundle) {
      if (config.command !== 'build') return
      if (!key) {
        config.logger.warn(`\n[kaylee-lock] LOCK_CODE is not set: ${place} is NOT locked in this build.`)
        return
      }
      const out = options.dir ?? resolve(config.root, config.build.outDir)
      const locked = lockedChunks(bundle, `/src/world/places/${place}/`)
      if (!locked.size) throw new Error(`[kaylee-lock] found no chunks for ${place}: is the folder name right?`)
      for (const chunk of locked) {
        const path = join(out, chunk.fileName)
        let code = readFileSync(path, 'utf8')
        // A blob: module can't resolve "./x.js": point every import of a sibling chunk at the stub's own folder.
        for (const dep of new Set([...chunk.imports, ...chunk.dynamicImports])) {
          const rel = `./${relativeName(chunk.fileName, dep)}`
          const before = code
          code = code.replaceAll(`"${rel}"`, `"${BASE_TOKEN}${rel.slice(2)}"`)
          if (code === before && chunk.imports.includes(dep)) throw new Error(`[kaylee-lock] ${chunk.fileName}: can't find its import of ${rel}`)
        }
        const left = code.match(/(?:from|import)\s*\(?\s*["']\.\.?\/[^"']+["']/)
        if (left) throw new Error(`[kaylee-lock] ${chunk.fileName}: relative import left after rewriting: ${left[0]}`)
        code = code.replace(/\n\/\/# sourceMappingURL=.*$/, '')
        const lockFile = chunk.fileName.replace(/\.js$/, '.lock')
        writeFileSync(join(out, lockFile), encrypt(key, Buffer.from(code)))
        writeFileSync(path, stub(place, relativeName(chunk.fileName, lockFile), chunk.exports))
        if (existsSync(path + '.map')) rmSync(path + '.map')
      }
      config.logger.info(`[kaylee-lock] locked ${locked.size} ${place} chunks: ${[...locked].map((c) => c.fileName).join(', ')}`)
    },
  }
}

/** iv (12 bytes) + ciphertext + tag: the layout WebCrypto's AES-GCM decrypt reads. */
function encrypt(key: Buffer, data: Buffer) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  return Buffer.concat([iv, cipher.update(data), cipher.final(), cipher.getAuthTag()])
}

/**
 * The chunks to lock: every chunk holding code from the place's folder, except the ones the app loads at startup
 * (the entry and everything it imports statically: the country's meta, sections and lines live there).
 * Fails the build if an unlocked chunk imports a locked one statically, since that would need the code to start up.
 */
function lockedChunks(bundle: OutputBundle, folder: string) {
  const chunks = Object.values(bundle).filter((f): f is OutputChunk => f.type === 'chunk')
  const byName = new Map(chunks.map((c) => [c.fileName, c]))
  const startup = new Set<string>()
  const visit = (name: string) => {
    if (startup.has(name)) return
    startup.add(name)
    byName.get(name)?.imports.forEach(visit)
  }
  chunks.filter((c) => c.isEntry).forEach((c) => visit(c.fileName))
  const locked = new Set(chunks.filter((c) => !startup.has(c.fileName) && c.moduleIds.some((id) => id.split('\\').join('/').includes(folder))))
  for (const c of chunks) {
    if (locked.has(c)) continue
    const bad = c.imports.filter((i) => locked.has(byName.get(i)!))
    if (bad.length) throw new Error(`[kaylee-lock] ${c.fileName} (not locked) imports locked ${bad.join(', ')}: move the shared code out of the locked folder`)
  }
  // Locked chunks wait for each other while they decrypt (top-level await): an import cycle among them would hang.
  const done = new Set<string>()
  const path: string[] = []
  const walk = (name: string) => {
    if (done.has(name)) return
    if (path.includes(name)) throw new Error(`[kaylee-lock] import cycle among locked chunks: ${[...path, name].join(' -> ')}`)
    path.push(name)
    byName.get(name)!.imports.filter((i) => locked.has(byName.get(i)!)).forEach(walk)
    path.pop()
    done.add(name)
  }
  locked.forEach((c) => walk(c.fileName))
  return locked
}

const relativeName = (from: string, to: string) => {
  const dir = from.includes('/') ? from.slice(0, from.lastIndexOf('/') + 1) : ''
  if (!to.startsWith(dir) || to.slice(dir.length).includes('/')) throw new Error(`[kaylee-lock] ${to} isn't next to ${from}`)
  return to.slice(dir.length)
}

/** The stand-in module: decrypts the real one, loads it, and re-exports its bindings. */
function stub(place: string, lockFile: string, exports: string[]) {
  const named = exports.filter((e) => e !== 'default')
  // Export names may be reserved words (Rolldown names them `in`, `do`, ...): re-export them with `as`.
  const bad = named.find((e) => !/^[A-Za-z_$][\w$]*$/.test(e))
  if (bad) throw new Error(`[kaylee-lock] can't re-export "${bad}"`)
  return `// Locked: needs the family code (scripts/vite-lock.ts).
const __lock$m = await (async () => {
  const k = globalThis.__kayleeLocks?.[${JSON.stringify(place)}] ?? (() => { try { return localStorage.getItem(${JSON.stringify(storageKey(place))}) } catch { return null } })()
  if (!k) throw new Error(${JSON.stringify(`${place} is locked`)})
  const key = await crypto.subtle.importKey('raw', Uint8Array.from(atob(k), (c) => c.charCodeAt(0)), 'AES-GCM', false, ['decrypt'])
  const res = await fetch(new URL(${JSON.stringify(`./${lockFile}`)}, import.meta.url))
  if (!res.ok) throw new Error('locked chunk: HTTP ' + res.status)
  const data = new Uint8Array(await res.arrayBuffer())
  let plain
  try {
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.slice(0, 12) }, key, data.slice(12))
  } catch (e) {
    // The family code changed since this device unlocked: forget the old key and ask again.
    try { localStorage.removeItem(${JSON.stringify(storageKey(place))}) } catch {}
    if (globalThis.__kayleeLocks) delete globalThis.__kayleeLocks[${JSON.stringify(place)}]
    location.reload()
    throw e
  }
  const code = new TextDecoder().decode(plain)
  const url = URL.createObjectURL(new Blob([code.replaceAll(${JSON.stringify(BASE_TOKEN)}, new URL('./', import.meta.url).href)], { type: 'text/javascript' }))
  return import(url)
})()
${named.map((e, i) => `const __lock$${i} = __lock$m.${e}\n`).join('')}${named.length ? `export { ${named.map((e, i) => `__lock$${i} as ${e}`).join(', ')} }\n` : ''}${exports.includes('default') ? 'export default __lock$m.default\n' : ''}`
}

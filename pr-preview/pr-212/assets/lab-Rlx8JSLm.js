// Locked: needs the family code (scripts/vite-lock.ts).
const __lock$m = await (async () => {
  const k = globalThis.__kayleeLocks?.["thailand"] ?? (() => { try { return localStorage.getItem("kaylee-lock:thailand") } catch { return null } })()
  if (!k) throw new Error("thailand is locked")
  const key = await crypto.subtle.importKey('raw', Uint8Array.from(atob(k), (c) => c.charCodeAt(0)), 'AES-GCM', false, ['decrypt'])
  const res = await fetch(new URL("./lab-Rlx8JSLm.lock", import.meta.url))
  if (!res.ok) throw new Error('locked chunk: HTTP ' + res.status)
  const data = new Uint8Array(await res.arrayBuffer())
  let plain
  try {
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.slice(0, 12) }, key, data.slice(12))
  } catch (e) {
    // The family code changed since this device unlocked: forget the old key and ask again.
    try { localStorage.removeItem("kaylee-lock:thailand") } catch {}
    if (globalThis.__kayleeLocks) delete globalThis.__kayleeLocks["thailand"]
    location.reload()
    throw e
  }
  const code = new TextDecoder().decode(plain)
  const url = URL.createObjectURL(new Blob([code.replaceAll("__KAYLEE_LOCK_BASE__", new URL('./', import.meta.url).href)], { type: 'text/javascript' }))
  return import(url)
})()
const __lock$0 = __lock$m.a
const __lock$1 = __lock$m.c
const __lock$2 = __lock$m.i
const __lock$3 = __lock$m.n
const __lock$4 = __lock$m.o
const __lock$5 = __lock$m.r
const __lock$6 = __lock$m.s
const __lock$7 = __lock$m.t
export { __lock$0 as a, __lock$1 as c, __lock$2 as i, __lock$3 as n, __lock$4 as o, __lock$5 as r, __lock$6 as s, __lock$7 as t }

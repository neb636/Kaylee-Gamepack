// Dev and QA switches, read from the page query (./?debug=1#/world/...) or the hash query (#/world/...?debug=1):
//   debug=1   tuning panel: camera, light bands, outlines, nav grid, frame time
//   fps=N     frame-rate cap (0 = uncapped)
//   perf=1    frame-time overlay with a slow-frame log to copy (perf.ts)
//   dpr=N     fixed pixel ratio, no slow-device drop (View3D.tsx)
// Put them before the # (./?perf=1#/world/...): a section link rewrites the hash and drops its query.
export function flag(name: string): string | null {
  const fromSearch = new URLSearchParams(location.search).get(name)
  if (fromSearch !== null) return fromSearch
  return new URLSearchParams(location.hash.split('?')[1] ?? '').get(name)
}

/** Playwright and friends: cap the frame rate so a headless tab doesn't pin the machine. */
export const automated = typeof navigator !== 'undefined' && navigator.webdriver === true

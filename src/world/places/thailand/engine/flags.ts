// Dev and QA switches, read from the page query (./?debug=1#/world/...) or the hash query (#/world/...?debug=1):
//   gl=off    draw the no-WebGL fallback (what a browser without WebGL2 sees)
//   debug=1   tuning panel: camera, light bands, outlines, nav grid, frame time
//   fps=N     frame-rate cap (0 = uncapped)
export function flag(name: string): string | null {
  const fromSearch = new URLSearchParams(location.search).get(name)
  if (fromSearch !== null) return fromSearch
  return new URLSearchParams(location.hash.split('?')[1] ?? '').get(name)
}

/** Playwright and friends: cap the frame rate so a headless tab doesn't pin the machine. */
export const automated = typeof navigator !== 'undefined' && navigator.webdriver === true

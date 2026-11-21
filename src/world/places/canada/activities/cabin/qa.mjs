// The Team Cabin's QA scenarios: the room from its links (Maple alone, the whole team, the team from the stamps), the
// fitting sheets (every friend wearing one thing, front, three-quarters and side: fitting.ts), and the robots: one that
// drags one of each kind onto a friend and checks it's saved and still worn after a reload, a tap-only one (things fly
// onto the friend in focus), one that drops things in silly places and on the floor (a silly reaction, nothing lost),
// the photo, Gus at the window, and the same on a Mac (?device=mouse). The cabin answers on window.__canadaCabinQA()
// (cabin.ts `qa`). Not part of the app: Node runs it, Vite never sees it.
import { vp } from '../../../../../../scripts/qa-lib.mjs'

const cabin = (page) => page.evaluate(() => window.__canadaCabinQA())
const ready = async (page, base, hash, ms = 1200) => {
  await page.goto(`${base}${hash}`)
  await page.waitForFunction(() => window.__canadaCabinQA?.().friends, null, { timeout: 30000 })
  await page.waitForTimeout(ms)
}
const fail = (why) => {
  throw new Error(why)
}
const who = (q, id) => q.friends.find((f) => f.who === id)
/** A finger (or the mouse) carries something from the shelf to a point, the way she drags. */
async function drag(page, from, to, steps = 16) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(from.x + 3, from.y - 16, { steps: 3 })
  await page.mouse.move(to.x, to.y, { steps })
  await page.waitForTimeout(160)
  await page.mouse.up()
  await page.waitForTimeout(800)
}
const item = (q, id) => q.items.find((i) => i.id === id) ?? fail(`no ${id} on the shelf (open: ${q.open})`)
async function openBin(page, kind) {
  const q = await cabin(page)
  if (q.open === kind) return
  const b = q.bins.find((x) => x.kind === kind)
  await page.mouse.click(b.x, b.y)
  await page.waitForTimeout(450)
  if ((await cabin(page)).open !== kind) fail(`the ${kind} bin didn't open`)
}
/** Waits for the flights to land. */
const settle = (page) => page.waitForFunction(() => !window.__canadaCabinQA().flying && !window.__canadaCabinQA().dragging, null, { timeout: 8000 })

/** One of each kind, dragged to where it goes on four friends; then a reload and the same friends still wear them. */
async function dressEveryKind(page) {
  const plan = [
    ['jersey', 'blue', 'maple', 'chest'],
    ['hat', 'crown', 'monty', 'hat'],
    ['scarf', 'mint', 'tuque', 'chest'],
    ['cheek', 'star', 'roxy', 'hat'],
  ]
  for (const [kind, id, friend, at] of plan) {
    await openBin(page, kind)
    const q = await cabin(page)
    const f = who(q, friend) ?? fail(`${friend} isn't on the bench`)
    await drag(page, item(q, id), f[at])
    await settle(page)
    const worn = who(await cabin(page), friend).worn
    if (worn[kind] !== id) fail(`${friend} should wear the ${kind} ${id}, wears ${JSON.stringify(worn)}`)
  }
  await page.reload()
  await page.waitForFunction(() => window.__canadaCabinQA?.().friends, null, { timeout: 30000 })
  const q = await cabin(page)
  for (const [kind, id, friend] of plan) if (who(q, friend).worn[kind] !== id) fail(`after a reload ${friend} lost the ${kind}`)
}

export const screens = [
  { name: 'canada-cabin-team-all', hash: '#/world/canada/cabin/dress?team=all', reset: true, wait: 2500 },
  { name: 'canada-cabin-maple-alone', hash: '#/world/canada/cabin/dress?team=none', reset: true, wait: 2500 },
  { name: 'canada-cabin-three', hash: '#/world/canada/cabin/dress?team=snowman,bike,campfire', reset: true, wait: 2500 },
  // Gus has come to the window by now.
  { name: 'canada-cabin-gus', hash: '#/world/canada/cabin/dress?team=all', reset: true, wait: 11500 },
  // The fitting sheets: every friend wearing one thing, from the front, three-quarters and the side.
  ...['hat.pompom', 'hat.helmet', 'hat.crown', 'hat.flowers', 'hat.antlers', 'hat.chef', 'jersey.pink', 'scarf.purple', 'cheek.leaf', 'all'].map((fit) => ({ name: `canada-cabin-fit-${fit.replace('.', '-')}`, hash: `#/world/canada/cabin/dress?fit=${fit}`, reset: true, wait: 1500 })),
]

export const pacing = [
  // The core verb is a drag (the auto-player's taps fly things onto Maple and open bins); the drag robots are below.
  { name: 'canada team cabin', id: 'cabin', hash: '#/world/canada/cabin/dress?team=all', reset: true },
]

export const motion = [
  {
    // One of each kind dragged onto a friend (a jersey onto Maple, a crown onto Monty, a scarf onto Tuque, a star onto
    // Roxy's cheek): each is saved at once and still worn after a reload.
    name: 'canada-cabin-drag',
    seconds: 16,
    setup: (page, base) => ready(page, base, '#/world/canada/cabin/dress?team=all'),
    act: dressEveryKind,
  },
  {
    // Taps only: open each bin and tap a thing; it flies onto the friend in focus (Maple, then Lulu after a tap on her).
    name: 'canada-cabin-tap',
    seconds: 12,
    setup: (page, base) => ready(page, base, '#/world/canada/cabin/dress?team=all'),
    act: async (page) => {
      for (const [kind, n] of [
        ['jersey', 3],
        ['hat', 0],
        ['scarf', 1],
        ['cheek', 2],
      ]) {
        await openBin(page, kind)
        const it = (await cabin(page)).items[n]
        await page.mouse.click(it.x, it.y)
        await settle(page)
        const w = who(await cabin(page), 'maple').worn
        if (w[kind] !== it.id) fail(`a tapped ${kind} didn't fly onto Maple (${JSON.stringify(w)})`)
      }
      const lulu = who(await cabin(page), 'lulu')
      await page.mouse.click((lulu.box.x0 + lulu.box.x1) / 2, (lulu.box.y0 + lulu.box.y1) / 2)
      await page.waitForTimeout(300)
      await openBin(page, 'hat')
      const it = (await cabin(page)).items.find((i) => i.id === 'flowers')
      await page.mouse.click(it.x, it.y)
      await settle(page)
      if (who(await cabin(page), 'lulu').worn.hat !== 'flowers') fail('a hat tapped after a tap on Lulu should go onto Lulu')
    },
  },
  {
    // Silly places: a hat let go on Misty's tummy sits there (she goes cross-eyed) and then hops onto her head; a jersey
    // on Monty's antlers hangs there, then hops down onto him; a helmet dropped on the floor boings back to its bin.
    name: 'canada-cabin-silly',
    seconds: 12,
    setup: (page, base) => ready(page, base, '#/world/canada/cabin/dress?team=all'),
    act: async (page) => {
      await openBin(page, 'hat')
      let q = await cabin(page)
      const misty = who(q, 'misty')
      await drag(page, item(q, 'chef'), { x: misty.chest.x, y: misty.chest.y + 25 })
      if (!/^silly:misty/.test((await cabin(page)).last)) fail(`a hat on Misty's tummy should be silly first (${(await cabin(page)).last})`)
      await settle(page)
      if (who(await cabin(page), 'misty').worn.hat !== 'chef') fail('the hat never hopped onto her head')
      await openBin(page, 'jersey')
      q = await cabin(page)
      const monty = who(q, 'monty')
      await drag(page, item(q, 'purple'), { x: monty.box.x0 + 12, y: monty.box.y0 + 14 })
      if (!/^silly:monty/.test((await cabin(page)).last)) fail(`a jersey on Monty's antlers should hang there first (${(await cabin(page)).last})`)
      await settle(page)
      if (who(await cabin(page), 'monty').worn.jersey !== 'purple') fail('the jersey never hopped down onto Monty')
      await openBin(page, 'hat')
      q = await cabin(page)
      const before = JSON.stringify(q.friends.map((f) => f.worn))
      await drag(page, item(q, 'helmet'), { x: vp.width * 0.5, y: q.trayTop - 12 })
      if ((await cabin(page)).last !== 'floor') fail(`dropped on the floor: ${(await cabin(page)).last}`)
      await settle(page)
      q = await cabin(page)
      if (JSON.stringify(q.friends.map((f) => f.worn)) !== before) fail('a thing on the floor changed what someone wears')
      if (!q.items.some((i) => i.id === 'helmet')) fail('the helmet is gone from the shelf')
    },
  },
  {
    // The mirror: everybody cheers, click, the photo pops up and is pinned on the wall.
    name: 'canada-cabin-photo',
    seconds: 6,
    setup: (page, base) => ready(page, base, '#/world/canada/cabin/dress?team=all'),
    act: async (page) => {
      const m = (await cabin(page)).mirror
      await page.mouse.click(m.x, m.y)
      await page.waitForFunction(() => window.__canadaCabinQA().pinned > 0, null, { timeout: 6000 }).catch(() => fail('no photo was pinned'))
      await page.waitForTimeout(1500)
    },
  },
  {
    // Tap the window and Gus pokes his head in; a hat dragged onto him stays on ("Honk! ...I look good.").
    name: 'canada-cabin-gus',
    seconds: 8,
    setup: (page, base) => ready(page, base, '#/world/canada/cabin/dress?team=none'),
    act: async (page) => {
      const w = (await cabin(page)).window
      await page.mouse.click(w.x, w.y)
      await page.waitForFunction(() => window.__canadaCabinQA().gus.state === 'in', null, { timeout: 5000 }).catch(() => fail('Gus never came to the window'))
      await openBin(page, 'hat')
      const q = await cabin(page)
      await drag(page, item(q, 'pompom'), { x: q.gus.at.x, y: q.gus.at.y - 10 })
      await settle(page)
      if ((await cabin(page)).gus.worn.hat !== 'pompom') fail(`Gus has no hat: ${JSON.stringify((await cabin(page)).gus)}`)
      await page.waitForTimeout(1200)
    },
  },
  {
    // On a Mac: the words say click, and the same drags and taps work with a mouse.
    name: 'canada-cabin-mouse',
    seconds: 16,
    setup: (page, base) => ready(page, base, '#/world/canada/cabin/dress?team=all&device=mouse'),
    act: dressEveryKind,
  },
  {
    // Maple alone (no friends yet): a tapped scarf flies onto her.
    name: 'canada-cabin-alone',
    seconds: 5,
    setup: (page, base) => ready(page, base, '#/world/canada/cabin/dress?team=none'),
    act: async (page) => {
      if ((await cabin(page)).friends.length !== 1) fail('Maple should be alone')
      await openBin(page, 'scarf')
      const it = (await cabin(page)).items[3]
      await page.mouse.click(it.x, it.y)
      await settle(page)
      if (who(await cabin(page), 'maple').worn.scarf !== it.id) fail('the scarf didn’t go onto Maple')
    },
  },
]

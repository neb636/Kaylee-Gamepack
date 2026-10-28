// Thailand's QA scenarios, picked up by scripts/qa-screens.mjs (screens), qa-pacing.mjs (pacing) and
// qa-motion.mjs (motion). A new activity can keep its own next to its sections.ts (activities/<id>/qa.mjs);
// sections no screen reaches get a plain screenshot anyway. Not part of the app: Node runs it, Vite never sees it.
import { around, seedWall, tapAnchor, vp } from '../../../../scripts/qa-lib.mjs'

// The racing slide (screens): climb the steps (taps), then scoot (`taps` a second) until `until(window.__thaiMallQA())`, then
// wait `after` ms. Stops on its own after 25 s.
async function slideTo(page, until, taps = 0, after = 0) {
  const t0 = Date.now()
  while (Date.now() - t0 < 25000) {
    const q = await page.evaluate(() => window.__thaiMallQA?.() ?? {})
    if (until(q)) break
    if (q.phase === 'climb') await page.locator('[data-anchor="steps"]').click({ force: true }).catch(() => {})
    else if (q.phase === 'race' && taps && q.kaylee) await page.mouse.click(...q.kaylee)
    await page.waitForTimeout(q.phase === 'race' && taps ? 1000 / taps : q.phase === 'climb' ? 420 : 60)
  }
  await page.waitForTimeout(after)
}

/** Screenshots (scripts/qa-screens.mjs): how to get to each screen from a fresh start. */
export const screens = [
  // Thailand: the Thailand map (thailand-map.html: where she lands; home from a trip with a stamp landing, every stamp
  // in), then Agong's house in 3D (the arrival mid-ride, each spot, a few things in
  // use), and the party card.
  { name: 'thailand-map', hash: '#/world/thailand', reset: true, wait: 1500 },
  { name: 'thailand-map-home', hash: '#/world/thailand/hub/map?stamp=boat-trip', stampAll: 'thailand', wait: 2200 },
  { name: 'thailand-arrive', hash: '#/world/thailand/hub/arrive', reset: true, wait: 1400 },
  ...['street', 'downstairs', 'downstairs?at=table', 'downstairs?at=desk', 'downstairs?at=altar', 'downstairs?at=photos', 'upstairs', 'upstairs?at=mattress', 'upstairs?at=couch', 'upstairs?at=bathroom-door'].map((to) => ({
    name: `thailand-${to.replace('?at=', '-')}`,
    hash: `#/world/thailand/hub/${to}`,
    reset: true,
    wait: 1800,
  })),
  // Her wardrobe (wardrobe.html): the doors open, the hats drawer, the paint drawer, her room in a look, and the door with its 4 pictures.
  ...['wardrobe', 'wardrobe?drawer=head', 'wardrobe?drawer=paint&look=crown,hearts,fairy,tutu,sneakers,hair-pink', 'upstairs?look=cap,stars,cape,gown,fur-mint', 'wardrobe?drawer=outfit&look=bow,fairy,tutu&door=crown,hearts,tutu;bow,fairy,dress-mint;cap,stars,cape;overalls,boots,hair-pink,fur-sky'].map((to) => ({
    name: `thailand-${to.replace(/[?=&,;]/g, '-')}`.slice(0, 60),
    hash: `#/world/thailand/hub/${to}`,
    reset: true,
    wait: 1800,
  })),
  // The family photo (everyone, then a few alone on the turntable, in the three-quarter view it rests on first).
  { name: 'thailand-family', hash: '#/world/thailand/hub/family', reset: true, wait: 1800 },
  ...['kaylee', 'agong', 'ja', 'sri'].map((who) => ({ name: `thailand-family-${who}`, hash: `#/world/thailand/hub/family?who=${who}`, reset: true, wait: 1500 })),
  { name: 'thailand-party-soon', hash: '#/world/thailand/party/soon', stampAll: 'thailand', wait: 800 },
  // The mall day's trip loop (greybox): Mommy's card (🚤 / 🛝🍕), the day pass's choices on a replay, the goodbye with
  // the whole family and the Veloz (then everyone in it), ICONSIAM's glimpse, the lift going up, the counter with her
  // socks on, home (the car at Agong's door; the box given, the photo on the wall).
  { name: 'mall-loop-invite', hash: '#/world/thailand/mall-trip/invite', reset: true, wait: 4000 },
  { name: 'mall-loop-replay', hash: '#/world/thailand/mall-trip/invite?replay=1', reset: true, wait: 3500, act: async (p) => {
    await p.locator('button[aria-label="The mall"]').click({ force: true })
    await p.waitForTimeout(1200)
  } },
  { name: 'mall-loop-goodbye', hash: '#/world/thailand/mall-trip/goodbye', reset: true, wait: 4500 },
  { name: 'mall-loop-goodbye-car', hash: '#/world/thailand/mall-trip/goodbye', reset: true, wait: 3000, act: async (p) => {
    await p.locator('[data-anchor="trip:car"]').click({ force: true })
    await p.waitForTimeout(3200)
  } },
  { name: 'mall-loop-arrive', hash: '#/world/thailand/mall-trip/arrive', reset: true, wait: 2200 },
  { name: 'mall-loop-lift', hash: '#/world/thailand/mall-trip/arrive', reset: true, wait: 1500, act: async (p) => {
    await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'lift', null, { timeout: 30000 }).catch(() => {})
    await p.locator('[data-anchor="lift-button"]').click({ force: true }).catch(() => {})
    await p.waitForTimeout(2600)
  } },
  { name: 'mall-loop-counter', hash: '#/world/thailand/mall-trip/arrive', reset: true, wait: 1500, act: async (p) => {
    await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'lift', null, { timeout: 30000 }).catch(() => {})
    await p.locator('[data-anchor="lift-button"]').click({ force: true }).catch(() => {})
    await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'counter', null, { timeout: 30000 }).catch(() => {})
    await p.locator('[data-anchor="socks:mint"]').click({ force: true }).catch(() => {})
    await p.waitForTimeout(2600)
  } },
  { name: 'mall-loop-home', hash: '#/world/thailand/mall-trip/home?hair=k.r', reset: true, wait: 1500, act: async (p) => {
    await p.waitForFunction(() => window.__thaiMallQA?.().trip === 'give', null, { timeout: 40000 }).catch(() => {})
    await p.waitForTimeout(600)
  } },
  { name: 'mall-loop-home-wall', hash: '#/world/thailand/mall-trip/home', reset: true, wait: 1500, act: async (p) => {
    await p.waitForFunction(() => window.__thaiMallQA?.().trip === 'give', null, { timeout: 40000 }).catch(() => {})
    await p.locator('[data-anchor="family:agong"]').click({ force: true }).catch(() => {})
    await p.waitForFunction(() => window.__thaiMallQA?.().held === 'wall', null, { timeout: 60000 }).catch(() => {})
    await p.waitForTimeout(1200)
  } },
  // HarborLand's hall (greybox): just in by Mommy's bench, out of the vet's door (Harbor Town), out of the racing
  // slide (the lanes, the crocodile), going in at the cafe (the door open, the camera in close), Mommy's "Pizza time?"
  // card once every sticker is on her band, and the 🗺️ map of every mini game.
  { name: 'mall-hall', hash: '#/world/thailand/mall-trip/hall', reset: true, wait: 3500 },
  { name: 'mall-hall-map', hash: '#/world/thailand/mall-trip/hall?map=1&games=vet,cafe,race', reset: true, wait: 3500 },
  { name: 'mall-hall-town', hash: '#/world/thailand/mall-trip/hall?from=vet&games=vet', reset: true, wait: 3500 },
  { name: 'mall-hall-lanes', hash: '#/world/thailand/mall-trip/hall?from=race', reset: true, wait: 3500 },
  { name: 'mall-hall-little-land', hash: '#/world/thailand/mall-trip/hall?from=blocks&games=blocks', reset: true, wait: 3500 },
  { name: 'mall-hall-muay-thai', hash: '#/world/thailand/mall-trip/hall?from=boxing&games=boxing', reset: true, wait: 3500 },
  { name: 'mall-hall-mountain', hash: '#/world/thailand/mall-trip/hall?from=mountain&games=mountain', reset: true, wait: 3500 },
  { name: 'mall-hall-sky-pod', hash: '#/world/thailand/mall-trip/hall?from=skypod', reset: true, wait: 3500 },
  { name: 'mall-hall-going-in', hash: '#/world/thailand/mall-trip/hall?from=vet', reset: true, wait: 2500, act: async (p) => {
    await p.locator('[data-anchor="door:cafe"]').click({ force: true })
    await p.waitForTimeout(2600)
  } },
  { name: 'mall-hall-hungry', hash: '#/world/thailand/mall-trip/hungry?games=vet,cafe,race,pool', reset: true, wait: 4500 },
  // HarborLand's Big Frame: each place she can start (through the tunnel, the ball pit, the three levels, the mats in
  // front), a sock band with stickers.
  ...['in', 'pit', 'l1', 'l2', 'top', 'out'].map((at) => ({ name: `mall-frame-${at}`, hash: `#/world/thailand/mall-trip/frame?at=${at}`, reset: true, wait: 3500 })),
  { name: 'mall-frame-stickers', hash: '#/world/thailand/mall-trip/frame?socks=mint&games=vet,cafe,frame', reset: true, wait: 3500 },
  // The Vet Clinic (greybox): each patient on the table (the earlier ones on the waiting room's bench), the 👇 hint
  // after a while, a tool at work (soap on the muddy pony), the end (all three on the bench, the 🛝).
  ...['puppy', 'pony', 'elephant'].map((p) => ({ name: `vet-${p}`, hash: `#/world/thailand/mall-trip/vet?patient=${p}`, reset: true, wait: 4200 })),
  { name: 'vet-hint', hash: '#/world/thailand/mall-trip/vet', reset: true, wait: 9500 },
  {
    name: 'vet-soap',
    hash: '#/world/thailand/mall-trip/vet?patient=pony',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'exam', null, { timeout: 20000 }).catch(() => {})
      const q = await p.evaluate(() => window.__thaiMallQA())
      const [zx, zy] = [q.zones.belly[0], q.zones.belly[1] + q.liftPx]
      await p.mouse.move(...q.tools.soap)
      await p.mouse.down()
      await p.mouse.move(zx, zy, { steps: 10 })
      for (let i = 0; i < 30; i++) await p.mouse.move(zx + Math.cos(i * 0.9) * 26, zy + Math.sin(i * 0.9) * 16 - (i % 10) * 4, { steps: 2 })
      await p.mouse.up()
      await p.waitForTimeout(700)
    },
  },
  {
    name: 'vet-done',
    hash: '#/world/thailand/mall-trip/vet?patient=elephant',
    reset: true,
    act: async (p) => {
      // Taps do a short go each: medicine, tissue, soap, (the sneeze), the shower.
      await p.waitForFunction(() => window.__thaiMallQA?.().phase === 'exam', null, { timeout: 20000 }).catch(() => {})
      const tool = { medicine: 'spoon', tissue: 'tissue', soap: 'soap', rinse: 'shower' }
      for (let i = 0; i < 30; i++) {
        const q = await p.evaluate(() => window.__thaiMallQA())
        if (q.phase === 'done' || q.phase === 'leave') break
        if (tool[q.need] && !q.held) await p.locator(`[data-anchor="tool:${tool[q.need]}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(1900)
      }
      await p.waitForTimeout(4500)
    },
  },
  // The Barber Salon (greybox): each round (round 3: a kid with a picture card, Daddy on the bench with his new look), a
  // long rainbow hairdo from a link, the grow tonic and the scissors at work, the 👆 after a while.
  ...[1, 2, 3].map((n) => ({ name: `barber-${n}`, hash: `#/world/thailand/mall-trip/barber?round=${n}&hair=k.roygbvproygbvproygbvproyg.s.1p5Y`, reset: true, wait: n === 3 ? 5200 : 3200 })),
  { name: 'barber-hint', hash: '#/world/thailand/mall-trip/barber', reset: true, wait: 9500 },
  {
    name: 'barber-grow-snip',
    hash: '#/world/thailand/mall-trip/barber',
    reset: true,
    wait: 3000,
    act: async (p) => {
      const drag = async (tool, pts) => {
        const q = await p.evaluate(() => window.__thaiMallQA())
        await p.mouse.move(...q.tools[tool])
        await p.mouse.down()
        for (const [x, y] of pts) await p.mouse.move(x, y + q.liftPx, { steps: 4 })
        await p.mouse.up()
      }
      const [hx, hy, r] = (await p.evaluate(() => window.__thaiMallQA())).head
      await drag('tonic', Array.from({ length: 30 }, (_, i) => [hx + Math.cos(i * 0.5) * r * 0.9, hy - r * 0.6 + Math.sin(i * 0.5) * r * 0.4]))
      await drag('scissors', [[hx - r * 1.8, hy], [hx + r * 1.8, hy]])
      await p.waitForTimeout(250)
    },
  },
  { name: 'barber-hall', hash: '#/world/thailand/mall-trip/hall?from=barber&hair=k.roygbvproygbvproygbvproyg.s', reset: true, wait: 3500 },
  // Cafe & Cake (greybox): each round (the earlier rounds' drinks on the shelf), the 👆 after a while, the splat (the
  // lid left off), the jar tipped over the cup and pouring.
  ...[1, 2, 3].map((n) => ({ name: `cafe-${n}`, hash: `#/world/thailand/mall-trip/cafe?round=${n}`, reset: true, wait: 3200 })),
  { name: 'cafe-hint', hash: '#/world/thailand/mall-trip/cafe', reset: true, wait: 9500 },
  {
    name: 'cafe-splat',
    hash: '#/world/thailand/mall-trip/cafe',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'cafe', null, { timeout: 20000 }).catch(() => {})
      for (const id of ['item:watermelon', 'item:mango', 'button']) {
        await p.locator(`[data-anchor="${id}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(700)
      }
      await p.waitForTimeout(300)
    },
  },
  {
    name: 'cafe-pour',
    hash: '#/world/thailand/mall-trip/cafe?round=2',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'cafe', null, { timeout: 20000 }).catch(() => {})
      for (const id of ['item:strawberry', 'item:banana', 'button']) {
        await p.locator(`[data-anchor="${id}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(700)
      }
      await p.waitForTimeout(1800)
      const q = await p.evaluate(() => window.__thaiMallQA())
      await p.mouse.move(...q.jarAt)
      await p.mouse.down()
      await p.mouse.move(...q.pourAt[0], { steps: 16 })
      await p.waitForTimeout(800)
    },
  },
  // The Racing Slide (greybox): each round at the bottom of the steps (the others sitting at the top), the 👆 on the
  // steps after a while, the countdown, a race at a bump (round 2: the ring closing on her, gold), the spinning rings
  // (round 3), the pit after a win (the ribbon, Daddy head first).
  ...[1, 2, 3].map((n) => ({ name: `mall-race-${n}`, hash: `#/world/thailand/mall-trip/race?round=${n}`, reset: true, wait: 3000 })),
  { name: 'mall-race-hint', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 9500 },
  { name: 'mall-race-count', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 2500, act: (p) => slideTo(p, (q) => q.count === 2) },
  { name: 'mall-race-bump', hash: '#/world/thailand/mall-trip/race?round=2', reset: true, wait: 2500, act: (p) => slideTo(p, (q) => q.phase === 'race' && q.window && q.crest >= 1) },
  { name: 'mall-race-rings', hash: '#/world/thailand/mall-trip/race?round=3', reset: true, wait: 2500, act: (p) => slideTo(p, (q) => q.phase === 'race' && q.u > 0.45, 3) },
  { name: 'mall-race-pit', hash: '#/world/thailand/mall-trip/race', reset: true, wait: 2500, act: (p) => slideTo(p, (q) => q.ribbons >= 1, 3, 1500) },
  // Little Land (greybox): each round at the start (round 2: the chedi's outlines; the elephant's), the 👆 on the box
  // after a while, a brick in her hand over the stack (the outline where it will land), the stack glowing after six,
  // a tower past Daddy's ribbon (ah... ah...).
  ...[1, 2, 3].map((n) => ({ name: `blocks-${n}`, hash: `#/world/thailand/mall-trip/blocks?round=${n}`, reset: true, wait: 3000 })),
  { name: 'blocks-elephant', hash: '#/world/thailand/mall-trip/blocks?round=2&card=elephant', reset: true, wait: 3000 },
  { name: 'blocks-hint', hash: '#/world/thailand/mall-trip/blocks', reset: true, wait: 9500 },
  {
    name: 'blocks-drag',
    hash: '#/world/thailand/mall-trip/blocks',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'blocks', null, { timeout: 20000 }).catch(() => {})
      for (let i = 0; i < 3; i++) {
        await p.locator('[data-anchor="box"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(550)
      }
      const q = await p.evaluate(() => window.__thaiMallQA())
      const sp = q.spots.find((s) => s[1] > 0) ?? q.spots[0]
      await p.mouse.move(...q.box)
      await p.mouse.down()
      await p.mouse.move(sp[2] + 20, sp[3] + q.liftPx - 30, { steps: 16 })
      await p.waitForTimeout(400)
    },
  },
  ...[['blocks-glow', 1, 6, 600], ['blocks-tall', 3, 4, 900]].map(([name, round, taps, after]) => ({
    name,
    hash: `#/world/thailand/mall-trip/blocks?round=${round}`,
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'blocks', null, { timeout: 20000 }).catch(() => {})
      for (let i = 0; i < taps; i++) {
        await p.locator('[data-anchor="box"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(550)
      }
      await p.waitForTimeout(after)
    },
  })),
  // Muay Thai (greybox): each round at the start (1: the wai kru beside the coach; 2: the drum and the ring on the bag;
  // 3: Daddy's pad, the bag hooked back), the 👆 on her gloves after a while, a bow, a punch on the beat (the gold POW),
  // the big kick.
  ...[1, 2, 3].map((n) => ({ name: `boxing-${n}`, hash: `#/world/thailand/mall-trip/boxing?round=${n}`, reset: true, wait: 3000 })),
  { name: 'boxing-hint', hash: '#/world/thailand/mall-trip/boxing', reset: true, wait: 9500 },
  {
    name: 'boxing-bow',
    hash: '#/world/thailand/mall-trip/boxing',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'boxing', null, { timeout: 20000 }).catch(() => {})
      await p.locator('[data-anchor="gloves"]').click({ force: true }).catch(() => {})
      await p.waitForTimeout(550)
    },
  },
  {
    name: 'boxing-pow',
    hash: '#/world/thailand/mall-trip/boxing?round=2',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'boxing', null, { timeout: 20000 }).catch(() => {})
      await p.waitForFunction(() => window.__thaiMallQA().window && window.__thaiMallQA().toNext < 0.3, null, { timeout: 8000, polling: 20 }).catch(() => {})
      const q = await p.evaluate(() => window.__thaiMallQA())
      if (q.bag) await p.mouse.click(...q.bag)
      await p.waitForTimeout(160)
    },
  },
  {
    name: 'boxing-kick',
    hash: '#/world/thailand/mall-trip/boxing?round=3',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'boxing', null, { timeout: 20000 }).catch(() => {})
      for (let i = 0; i < 40; i++) {
        const q = await p.evaluate(() => window.__thaiMallQA())
        if (q.phase === 'finale') break
        if (q.pad && !q.hopping) await p.mouse.click(...q.pad)
        await p.waitForTimeout(450)
      }
      await p.waitForTimeout(500)
    },
  },
  // The Golden Mountain (greybox): each round at the foot (round 2: the pinks glow among the silly ones; round 3: Daddy
  // at his foot), the 👆 on the next hold after a while, a pull held halfway by her finger, the top (the bell and the
  // slide's mouth glowing), the race halfway up. Where things are comes from window.__thaiMallQA.
  ...[1, 2, 3].map((n) => ({ name: `mountain-${n}`, hash: `#/world/thailand/mall-trip/mountain?round=${n}`, reset: true, wait: 3000 })),
  { name: 'mountain-hint', hash: '#/world/thailand/mall-trip/mountain', reset: true, wait: 9500 },
  {
    name: 'mountain-pull',
    hash: '#/world/thailand/mall-trip/mountain?round=2',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'mountain', null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(1500)
      const q = await p.evaluate(() => window.__thaiMallQA())
      const r = q.reach.find((h) => h[2] === 1 && h.length > 3)
      if (!r) return
      await p.mouse.move(r[3], r[4])
      await p.mouse.down()
      await p.mouse.move(r[3], r[4] + q.pullPx * 0.5, { steps: 6 })
      await p.waitForTimeout(400)
    },
  },
  ...[['mountain-top', 1, 6], ['mountain-race', 3, 4]].map(([name, round, taps]) => ({
    name,
    hash: `#/world/thailand/mall-trip/mountain?round=${round}`,
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'mountain', null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(1200)
      for (let i = 0; i < taps; i++) {
        const q = await p.evaluate(() => window.__thaiMallQA())
        const r = q.reach.find((h) => h[2] === 1)
        if (r) await p.locator(`[data-anchor="hold:${r[0]}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(800)
      }
      await p.waitForTimeout(900)
    },
  })),
  // The Sky Pod (greybox): each round at the start (round 2: the wall playing the pattern; round 3: Daddy's blue light
  // beside hers), a slap on a high pod (Kaylee in the air, her arm up), the finale's rainbow and the 🛝, the 👆 after a
  // while.
  ...[1, 2, 3].map((n) => ({ name: `skypod-${n}`, hash: `#/world/thailand/mall-trip/skypod?round=${n}`, reset: true, wait: n === 2 ? 1400 : 3000 })),
  {
    name: 'skypod-slap',
    hash: '#/world/thailand/mall-trip/skypod',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'skypod', null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(1200)
      const q = await p.evaluate(() => window.__thaiMallQA())
      const top = q.pods.reduce((best, s, i) => (s && s[1] < q.pods[best][1] ? i : best), 0)
      await p.locator(`[data-anchor="pod:${top}"]`).click({ force: true }).catch(() => {})
      await p.waitForTimeout(420)
    },
  },
  {
    name: 'skypod-finale',
    hash: '#/world/thailand/mall-trip/skypod?round=3',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().game === 'skypod', null, { timeout: 20000 }).catch(() => {})
      for (let n = 0; n < 60; n++) {
        const q = await p.evaluate(() => window.__thaiMallQA())
        if (q.phase === 'finale' || q.phase === 'free') break
        const i = q.lights.indexOf('lit')
        if (i >= 0) await p.locator(`[data-anchor="pod:${i}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(450)
      }
      await p.waitForTimeout(1800)
    },
  },
  { name: 'skypod-hint', hash: '#/world/thailand/mall-trip/skypod', reset: true, wait: 9500 },
  // The Pizza Company (greybox): the menu, the table at the start, a slice pulled out with the cheese stretching (held
  // over Daddy's plate), the last two for Agong's box, the box closed.
  { name: 'pizza-menu', hash: '#/world/thailand/mall-trip/menu', reset: true, wait: 3500 },
  { name: 'pizza-share', hash: '#/world/thailand/mall-trip/share?pizza=cheese', reset: true, wait: 3500 },
  {
    name: 'pizza-stretch',
    hash: '#/world/thailand/mall-trip/share?pizza=cheese',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiMallQA?.().pan?.length, null, { timeout: 20000 }).catch(() => {})
      const q = await p.evaluate(() => window.__thaiMallQA())
      const [sx, sy] = q.pan[0]
      const [px, py] = q.plates.nick
      await p.mouse.move(sx, sy)
      await p.mouse.down()
      await p.mouse.move(sx + (px - sx) * 0.6, sy + (py - sy) * 0.6 - 60, { steps: 16 })
      await p.waitForTimeout(400)
    },
  },
  { name: 'pizza-agong', hash: '#/world/thailand/mall-trip/share?pizza=hawaiian&shared=6', reset: true, wait: 3500 },
  { name: 'pizza-done', hash: '#/world/thailand/mall-trip/share?pizza=seafood&shared=8', reset: true, wait: 3500 },
  // The Nan road trip's mountain road (greybox): the Pajero setting off on each of the four roads, a few seconds in on
  // the sky road (the switchbacks, the first mirror).
  ...['city', 'valley', 'sky', 'three'].map((road) => ({ name: `nan-drive-${road}`, hash: `#/world/thailand/nan-trip/drive?road=${road}`, reset: true, wait: 3500 })),
  { name: 'nan-drive-sky-climb', hash: '#/world/thailand/nan-trip/drive?road=sky', reset: true, wait: 14000 },
  // Baan Huanam Mushroom Farm (greybox): the rack before any mist, every bag grown (round 2: pick them), round 3's pink
  // and gold bags, and the pizza with a colorful basket.
  { name: 'nan-mushrooms-1', hash: '#/world/thailand/nan-trip/mushrooms', reset: true, wait: 3500 },
  { name: 'nan-mushrooms-2', hash: '#/world/thailand/nan-trip/mushrooms?round=2', reset: true, wait: 3500 },
  { name: 'nan-mushrooms-3', hash: '#/world/thailand/nan-trip/mushrooms?round=3', reset: true, wait: 3500 },
  { name: 'nan-mushrooms-pizza', hash: '#/world/thailand/nan-trip/mushrooms?round=pizza&basket=grey5,pink3,gold2', reset: true, wait: 3500 },
  // The Nan Mountain Cup (greybox 1): the grid and the countdown, and racing a few seconds in (the race drives on by
  // itself, a bit slower, with no finger down).
  { name: 'nan-cup-grid', hash: '#/world/thailand/nan-trip/race', reset: true, wait: 4500 },
  { name: 'nan-cup-race', hash: '#/world/thailand/nan-trip/race?result=lose', reset: true, wait: 14000 },
  // Greybox 2: the Rice Steps (the terraces, the first puddles) and the Cloud Top Climb (a blossom shower), a few seconds
  // in. (In the cloud and the waterfall are qa-motion's nan-cloud and nan-splash.)
  { name: 'nan-cup-steps', hash: '#/world/thailand/nan-trip/race?track=steps', reset: true, wait: 14000 },
  { name: 'nan-cup-cloud', hash: '#/world/thailand/nan-trip/race?track=cloud', reset: true, wait: 14000 },
  // Greybox 3: the race ground's board (one race done, its medal), the podium both ways (gold; silver with the winner
  // glowing for her high five), the Cup ceremony (the scoreboard lit, the Cup floating beside her), and the Nan map with
  // the Cup's stamp on Nan town.
  { name: 'nan-cup-board', hash: '#/world/thailand/nan-trip/cup?cup=forest:1', reset: true, wait: 6000 },
  { name: 'nan-cup-gold', hash: '#/world/thailand/nan-trip/podium?track=forest&place=1', reset: true, wait: 6000 },
  { name: 'nan-cup-silver', hash: '#/world/thailand/nan-trip/podium?track=steps&place=2', reset: true, wait: 6000 },
  { name: 'nan-cup-win', hash: '#/world/thailand/nan-trip/cup-win', reset: true, wait: 12000 },
  { name: 'nan-cup-map', hash: '#/world/thailand/nan-trip/map?stops=mushrooms,cup&cup=1', reset: true, wait: 5000 },
  { name: 'nan-salt-1', hash: '#/world/thailand/nan-trip/salt', reset: true, wait: 3500 },
  { name: 'nan-salt-2', hash: '#/world/thailand/nan-trip/salt?round=2', reset: true, wait: 3500 },
  { name: 'nan-salt-3', hash: '#/world/thailand/nan-trip/salt?round=3', reset: true, wait: 3500 },
  // The Nan map (none done, then two stops done: the airport opens) and the 3 from above.
  { name: 'nan-map', hash: '#/world/thailand/nan-trip/map', reset: true, wait: 3500 },
  { name: 'nan-map-stops', hash: '#/world/thailand/nan-trip/map?stops=mushrooms,rice', reset: true, wait: 3500 },
  { name: 'nan-three', hash: '#/world/thailand/nan-trip/three', reset: true, wait: 4000 },
  // The Nan trip's loop (the trip kit's legs): Mommy's card with 🏔️🚙, packing with the mountain things, the goodbye,
  // the x-ray, the window seat, landing in Nan's green valley (it plays out to the Nan map), and coming home (the
  // flight, then Agong asks for his photo and the Nan photos fan out).
  ...['invite', 'pack', 'goodbye', 'airport', 'fly'].map((to) => ({ name: `nan-${to}`, hash: `#/world/thailand/nan-trip/${to}`, reset: true, wait: to === 'invite' ? 3800 : 2600 })),
  { name: 'nan-land', hash: '#/world/thailand/nan-trip/land', reset: true, wait: 5500 },
  { name: 'nan-home', hash: '#/world/thailand/nan-trip/home?photos=deck,three,pizza,salt', reset: true, wait: 16000 },
  // Kaylee's rice farm (greybox A): paddy A flooded and three dry, the planted rows growing (birds coming in), the golden
  // rice drained for the harvest, the bundles on the rack by the threshing basket, and the café's deck.
  ...['plant', 'grow', 'harvest', 'thresh', 'deck'].map((round) => ({ name: `nan-rice-${round}`, hash: `#/world/thailand/nan-trip/rice?round=${round}`, reset: true, wait: round === 'grow' ? 6000 : 3500 })),
  // The boat trip: every section (the trip kit's legs, then the bay), a full suitcase, the x-ray showing what she
  // packed, the seat-back screen, the boarding pass between legs, and the beach after landing (the photo).
  // (The house's shaders compile on the first one: it waits a little longer.)
  ...['invite', 'pack', 'goodbye', 'airport', 'takeoff', 'fly', 'land', 'chang', 'sign', 'drinks', 'boardwalk', 'feed', 'favorites', 'lamyai', 'splash', 'pier', 'bay', 'village', 'cave', 'hong', 'nail', 'sunset'].map((to) => ({ name: `boat-trip-${to}`, hash: `#/world/thailand/boat-trip/${to}`, reset: true, wait: to === 'invite' ? 3800 : to === 'bay' ? 4600 : to === 'hong' ? 4000 : 2200 })),
  // Krabi's signpost with Baan Chang open (the landing plays out first): the songthaew waits, the 🐘 and 🚤 boards glow.
  { name: 'boat-trip-fork', hash: '#/world/thailand/boat-trip/land', reset: true, wait: 22000 },
  // The bay's moments: three ribbons tied at the pier (the garland glowing), the goal and the football in the boat,
  // the Nail Island pose photo, a deep link's album open (photos and stickers), and the family on the pier at sunset.
  {
    name: 'boat-trip-ribbons',
    hash: '#/world/thailand/boat-trip/pier',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1800)
      for (const c of ['pink', 'sky', 'hotpink']) {
        await p.locator(`[data-anchor="ribbon:${c}"]`).click({ force: true }).catch(() => {})
        await p.waitForTimeout(900)
      }
      await p.waitForTimeout(600)
    },
  },
  {
    name: 'boat-trip-goal',
    hash: '#/world/thailand/boat-trip/village',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      for (let i = 0; i < 12; i++) {
        if (await p.evaluate(() => window.__thaiBoatQA?.().ball !== 'loose')) break
        await p.locator('[data-anchor="ball"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(1800)
      }
      await p.waitForFunction(() => window.__thaiBoatQA?.().ball === 'done', null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(2500)
    },
  },
  {
    name: 'boat-trip-pose',
    hash: '#/world/thailand/boat-trip/nail?packed=bucket,duck,mango',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="glow:beach"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'beach', null, { timeout: 45000 }).catch(() => {})
      await p.waitForTimeout(800)
      await p.getByRole('button', { name: 'Cheer pose' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(2300)
    },
  },
  {
    name: 'boat-trip-album',
    hash: '#/world/thailand/boat-trip/nail?stops=village,cave&photos=village,hong&found=crab,eagle,needlefish',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(3000)
      await p.getByRole('button', { name: 'Trip album' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(1200)
    },
  },
  {
    name: 'boat-trip-docked',
    hash: '#/world/thailand/boat-trip/sunset',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      for (let i = 0; i < 4; i++) {
        if (await p.evaluate(() => window.__thaiBoatQA?.().phase === 'docked')) break
        await p.locator('[data-anchor="glow:pier"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(9000)
      }
      await p.getByRole('button', { name: 'Close album' }).click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
    },
  },
  {
    // The real way home: dock at the pier, tap ✈️🏠, and on to Agong's door (the button must be gone by then).
    name: 'boat-trip-home-route',
    hash: '#/world/thailand/boat-trip/sunset',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      for (let i = 0; i < 4; i++) {
        if (await p.evaluate(() => window.__thaiBoatQA?.().phase === 'docked')) break
        await p.locator('[data-anchor="glow:pier"]').click({ force: true }).catch(() => {})
        await p.waitForTimeout(9000)
      }
      await p.getByRole('button', { name: 'Fly home' }).click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 60000 }).catch(() => {})
      await p.mouse.click(200, 400)
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 }).catch(() => {})
      await p.waitForTimeout(3400)
    },
  },
  // Mommy asks on her own a few seconds after Kaylee comes upstairs; Aunty Sri's van once it has pulled up.
  { name: 'thailand-mommy-asks', hash: '#/world/thailand/hub/upstairs', reset: true, wait: 6500 },
  { name: 'boat-trip-van', hash: '#/world/thailand/boat-trip/goodbye', reset: true, wait: 5000 },
  { name: 'boat-trip-pack-full', hash: '#/world/thailand/boat-trip/pack?packed=sunhat,sunglasses,floaties,duck,teddy,gan', reset: true, wait: 2200 },
  {
    name: 'boat-trip-xray',
    hash: '#/world/thailand/boat-trip/airport?packed=gan,fan,mango,teddy',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="suitcase"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().shown === 4, null, { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(600)
    },
  },
  {
    name: 'boat-trip-screen',
    hash: '#/world/thailand/boat-trip/fly',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="screen"]').click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
    },
  },
  {
    name: 'boat-trip-pass',
    hash: '#/world/thailand/boat-trip/goodbye',
    reset: true,
    act: async (p) => {
      await p.locator('[data-anchor="trip:van"]').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {})
      await p.locator('[data-anchor="trip:van"]').click({ force: true }).catch(() => {})
      await p.waitForSelector('[aria-label="Boarding pass"]', { timeout: 20000 }).catch(() => {})
      await p.waitForTimeout(700)
    },
  },
  // The boat race (race/): the grid and the countdown, racing with a finger on the water (the HUD, an item in the
  // slot), the last lap's finish, the podium and the trophy, and the bay's rainbow gate with the trophy in the bow after.
  { name: 'boat-race-grid', hash: '#/world/thailand/boat-trip/race', reset: true, wait: 7000 },
  {
    name: 'boat-race-racing',
    hash: '#/world/thailand/boat-trip/race',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'race', null, { timeout: 40000 }).catch(() => {})
      const vp = p.viewportSize()
      await p.mouse.move(vp.width * 0.55, vp.height * 0.45)
      await p.mouse.down()
      await p.waitForTimeout(6000)
      await p.mouse.up()
    },
  },
  {
    name: 'boat-race-finish',
    hash: '#/world/thailand/boat-trip/race?lap=3',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'finish', null, { timeout: 150000 }).catch(() => {})
      await p.waitForTimeout(600)
    },
  },
  { name: 'boat-race-podium', hash: '#/world/thailand/boat-trip/podium', reset: true, wait: 6500 },
  { name: 'boat-race-gate', hash: '#/world/thailand/boat-trip/bay?stops=race', reset: true, wait: 4600 },
  {
    name: 'boat-trip-beach',
    hash: '#/world/thailand/boat-trip/nail',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="glow:beach"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'beach', null, { timeout: 45000 }).catch(() => {})
      await p.waitForTimeout(1200)
    },
  },
  // The trip's moments (step 4): her things going on at the click, the doors onto the plane, the flight
  // attendant's trolley, night night, the view of all of Thailand, and Krabi's songthaew.
  {
    name: 'boat-trip-put-on',
    hash: '#/world/thailand/boat-trip/pack?packed=sunhat,sunglasses,floaties',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="trip:suitcase"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().wearing?.length >= 3, null, { timeout: 15000 }).catch(() => {})
      await p.waitForTimeout(600)
    },
  },
  {
    name: 'boat-trip-doors',
    hash: '#/world/thailand/boat-trip/airport?packed=sunhat,sunglasses,floaties',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="suitcase"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().phase === 'doors', null, { timeout: 30000 }).catch(() => {})
      await p.waitForTimeout(1200)
    },
  },
  {
    name: 'boat-trip-attendant',
    hash: '#/world/thailand/boat-trip/fly',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      for (let i = 0; i < 3; i++) await p.locator('[data-anchor="call"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().snacks >= 2, null, { timeout: 15000 }).catch(() => {})
      await p.waitForTimeout(400)
    },
  },
  {
    name: 'boat-trip-night',
    hash: '#/world/thailand/boat-trip/fly',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="window"]').click({ force: true }).catch(() => {})
      await p.locator('[data-anchor="light"]').click({ force: true }).catch(() => {})
      await p.waitForTimeout(1600)
    },
  },
  {
    name: 'boat-trip-elephant',
    hash: '#/world/thailand/boat-trip/fly',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().view === 'elephant', null, { timeout: 45000 }).catch(() => {})
      await p.waitForTimeout(1500)
    },
  },
  {
    name: 'boat-trip-krabi',
    hash: '#/world/thailand/boat-trip/land',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().krabi === true, null, { timeout: 45000 }).catch(() => {})
      await p.waitForTimeout(1400)
    },
  },
  // Home (step 5): the photos fanned out for Agong, everyone gathered round her photo on the wall, the stamp with the
  // trip's facts, the photo wall in the house (and close up), a replay's boarding pass (🧳 or 🚤).
  {
    name: 'boat-trip-home-pick',
    hash: '#/world/thailand/boat-trip/home?photos=village,hong,nail&found=crab,eagle',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 90000 }).catch(() => {})
      await p.waitForTimeout(800)
      await p.mouse.click(200, 400)
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 }).catch(() => {})
      await p.waitForTimeout(3400)
    },
  },
  {
    name: 'boat-trip-home-wall',
    hash: '#/world/thailand/boat-trip/home',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 90000 }).catch(() => {})
      await p.mouse.click(200, 400)
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 }).catch(() => {})
      await p.getByRole('button', { name: /^Photo: / }).first().click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="family:agong"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'home', null, { timeout: 60000 }).catch(() => {})
    },
  },
  {
    // While the big cousins glow on their phones (all three must be on screen to be tapped).
    name: 'boat-trip-home-gather',
    hash: '#/world/thailand/boat-trip/home',
    reset: true,
    act: async (p) => {
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 90000 }).catch(() => {})
      await p.mouse.click(200, 400)
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 }).catch(() => {})
      await p.getByRole('button', { name: /^Photo: / }).first().click({ force: true }).catch(() => {})
      await p.waitForTimeout(1500)
      await p.locator('[data-anchor="family:agong"]').click({ force: true }).catch(() => {})
      await p.waitForFunction(() => window.__thaiBoatQA?.().trip === 'gather', null, { timeout: 60000 }).catch(() => {})
      await p.waitForTimeout(3000)
    },
  },
  {
    name: 'boat-trip-stamp',
    hash: '#/world/thailand/boat-trip/invite',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(1500)
      await p.evaluate(() => window.__kayleeWorld?.finish?.())
      await p.waitForTimeout(1800)
    },
  },
  { name: 'thailand-photo-wall', hash: '#/world/thailand/hub/downstairs?at=photos', reset: true, seed: seedWall, wait: 2500 },
  {
    name: 'thailand-photo-wall-close',
    hash: '#/world/thailand/hub/downstairs?at=photos',
    reset: true,
    seed: seedWall,
    act: async (p) => {
      await p.waitForTimeout(2500)
      await p.locator('[data-anchor="trip:wall:boat-trip"]').click({ force: true }).catch(() => {})
      await p.waitForTimeout(1200)
    },
  },
  {
    name: 'boat-trip-replay',
    hash: '#/world/thailand/boat-trip/invite?replay=1',
    reset: true,
    act: async (p) => {
      await p.waitForTimeout(3800)
      await p.getByRole('button', { name: 'Yes', exact: true }).dispatchEvent('click').catch(() => {})
      await p.waitForTimeout(1500)
    },
  },
]

/** Auto-played runs (scripts/qa-pacing.mjs): talk before the first touch, talk per touch, the play strip. */
export const pacing = [
  { name: 'thailand map (tap a pin)', id: 'thailand', hash: '#/world/thailand', reset: true },
  { name: "thailand agong's house (arrival)", id: 'thailand-house', hash: '#/world/thailand/hub/arrive', reset: true, play: false },
  // The trip there, one run per leg (each from its own section link).
  { name: "thailand: kaylee's wardrobe", id: 'wardrobe', hash: '#/world/thailand/hub/wardrobe?drawer=head', reset: true },
  { name: 'thailand trip: mommy asks', id: 'trip-invite', hash: '#/world/thailand/boat-trip/invite', reset: true },
  { name: 'thailand trip: packing', id: 'trip-pack', hash: '#/world/thailand/boat-trip/pack', reset: true },
  { name: "thailand trip: goodbye and aunty sri's van", id: 'trip-goodbye', hash: '#/world/thailand/boat-trip/goodbye', reset: true },
  { name: 'thailand trip: airport', id: 'trip-airport', hash: '#/world/thailand/boat-trip/airport', reset: true },
  { name: 'thailand trip: window seat, takeoff', id: 'trip-plane', hash: '#/world/thailand/boat-trip/takeoff', reset: true },
  { name: 'thailand trip: window seat, up in the sky', id: 'trip-fly', hash: '#/world/thailand/boat-trip/fly', reset: true },
  { name: 'thailand trip: landing and krabi', id: 'trip-land', hash: '#/world/thailand/boat-trip/land', reset: true },
  { name: 'thailand trip: landing and the signpost (baan chang open)', id: 'trip-fork', hash: '#/world/thailand/boat-trip/land', reset: true },
  { name: 'thailand baan chang: the songthaew to the entrance', id: 'chang-arrive', hash: '#/world/thailand/boat-trip/chang', reset: true, next: 'sign' },
  { name: 'thailand baan chang: the photo at the bamboo sign', id: 'chang-sign', hash: '#/world/thailand/boat-trip/sign', reset: true, next: 'drinks' },
  { name: 'thailand baan chang: her chocolate milk at the cafe', id: 'chang-drinks', hash: '#/world/thailand/boat-trip/drinks', reset: true, next: 'boardwalk' },
  { name: 'thailand baan chang: down the boardwalk', id: 'chang-boardwalk', hash: '#/world/thailand/boat-trip/boardwalk', reset: true, next: 'feed' },
  { name: 'thailand baan chang: feeding mali and khanom', id: 'chang-feed', hash: '#/world/thailand/boat-trip/feed', reset: true, next: 'favorites' },
  { name: 'thailand baan chang: favorites', id: 'chang-favorites', hash: '#/world/thailand/boat-trip/favorites', reset: true, next: 'lamyai' },
  { name: 'thailand baan chang: lamyai and the sneaky sips', id: 'chang-lamyai', hash: '#/world/thailand/boat-trip/lamyai', reset: true, next: 'splash' },
  { name: 'thailand baan chang: the splash', id: 'chang-splash', hash: '#/world/thailand/boat-trip/splash', reset: true, next: 'pier' },
  // The bay, one run per section (links with the section's path: a bare /boat-trip gets rewritten). It never "finishes"
  // (the trip goes on to the way home in a later gate), so talk per touch is total talk / taps by hand.
  { name: 'thailand bay: the pier and its ribbons', id: 'bay-pier', hash: '#/world/thailand/boat-trip/pier', reset: true },
  { name: 'thailand bay: open water, where to?', id: 'bay-open', hash: '#/world/thailand/boat-trip/bay', reset: true },
  { name: 'thailand bay: the village and the football', id: 'bay-village', hash: '#/world/thailand/boat-trip/village', reset: true },
  { name: 'thailand bay: the canoe under the low roof', id: 'bay-cave', hash: '#/world/thailand/boat-trip/cave', reset: true },
  { name: 'thailand bay: the hong', id: 'bay-hong', hash: '#/world/thailand/boat-trip/hong', reset: true },
  { name: 'thailand bay: the nail island and the photo', id: 'bay-nail', hash: '#/world/thailand/boat-trip/nail', reset: true },
  { name: 'thailand bay: the sunset ride back', id: 'bay-sunset', hash: '#/world/thailand/boat-trip/sunset', reset: true },
  { name: 'thailand bay: the boat race', id: 'bay-race', hash: '#/world/thailand/boat-trip/race', reset: true },
  { name: 'thailand bay: the race podium', id: 'bay-podium', hash: '#/world/thailand/boat-trip/podium', reset: true },
  // Home (step 5): a home link builds the bay first for its photos, then the flight home, the van, the photo for Agong.
  { name: 'thailand trip: home, the photo for agong', id: 'trip-home', hash: '#/world/thailand/boat-trip/home?photos=village,hong,nail&found=crab,eagle', reset: true },
  { name: 'thailand trip: a replay (🧳 or 🚤)', id: 'trip-replay', hash: '#/world/thailand/boat-trip/invite?replay=1', reset: true },
  // The mall day's trip loop (greybox, no voices yet: the words show in bubbles). Mommy's card, the goodbye (hugs, the
  // Veloz), ICONSIAM (the lift, the counter's toys, the gate), and home (the box for Agong, the photo on the wall).
  { name: 'thailand mall: mommy asks where to', id: 'mall-invite', hash: '#/world/thailand/mall-trip/invite', reset: true },
  { name: 'thailand mall: goodbye and the veloz', id: 'mall-goodbye', hash: '#/world/thailand/mall-trip/goodbye', reset: true },
  { name: 'thailand mall: iconsiam, the lift and the counter', id: 'mall-arrive', hash: '#/world/thailand/mall-trip/arrive', reset: true },
  { name: 'thailand mall: home, the box for agong', id: 'mall-home', hash: '#/world/thailand/mall-trip/home', reset: true },
  // HarborLand's hall (greybox, no voices): walking between the ways in; a tap on one goes into that mini game.
  { name: 'thailand mall: the hall', id: 'mall-hall', hash: '#/world/thailand/mall-trip/hall', reset: true },
  // HarborLand's Big Frame (greybox, no voices, and no end: a toy with no goal): climb up, slide down, the cannon.
  { name: 'thailand mall: the big frame', id: 'mall-frame', hash: '#/world/thailand/mall-trip/frame', reset: true },
  // The Vet Clinic (greybox, no voices): tapping a tool does a short go with it, so the auto-player can heal all three.
  { name: 'thailand mall: vet clinic', id: 'mall-vet', hash: '#/world/thailand/mall-trip/vet', reset: true },
  // The Barber Salon (greybox, no voices): a tap on a tool does a short go with it (a squirt, a trim, a comb, a bow), and
  // the mirror glows after enough of them.
  { name: 'thailand mall: barber salon', id: 'mall-barber', hash: '#/world/thailand/mall-trip/barber', reset: true },
  // Cafe & Cake (greybox, no voices): taps work too (a fruit hops in, the jar pours by itself, the straw serves).
  { name: 'thailand mall: cafe & cake', id: 'mall-cafe', hash: '#/world/thailand/mall-trip/cafe', reset: true },
  // The Racing Slide (greybox, no voices): taps climb the steps and scoot down (it never "finishes": round after round).
  { name: 'thailand mall: racing slide', id: 'mall-race', hash: '#/world/thailand/mall-trip/race', reset: true },
  // Little Land (greybox, no voices): a tap on the box hops the next brick to a good spot, a tap on the glowing stack
  // pushes it over, so the auto-player can play all three rounds.
  { name: 'thailand mall: little land', id: 'mall-blocks', hash: '#/world/thailand/mall-trip/blocks', reset: true },
  // Muay Thai (greybox, no voices): her glowing gloves for the wai kru, then a tap on the bag or the pad is a punch, so
  // the auto-player can play all three rounds (round 2 ends after 16 punches even off the beat).
  { name: 'thailand mall: muay thai', id: 'mall-boxing', hash: '#/world/thailand/mall-trip/boxing', reset: true },
  // The Golden Mountain (greybox, no voices): only the holds in reach have tap targets, and the bell and the slide's
  // mouth show at the top, so the auto-player climbs, rings and slides through all three rounds.
  { name: 'thailand mall: golden mountain', id: 'mall-mountain', hash: '#/world/thailand/mall-trip/mountain', reset: true },
  // The Sky Pod (greybox, no voices): a tap on a pod slaps it, so the auto-player plays the wall (its taps land on lit
  // pods only by chance, so it may not reach the finale: the scripted run in the plan does).
  { name: 'thailand mall: sky pod', id: 'mall-skypod', hash: '#/world/thailand/mall-trip/skypod', reset: true },
  // The Pizza Company (greybox, no voices): a tap on the pizza serves a slice (with its stretch) to the plate that's
  // behind, so the auto-player can share all eight and fill Agong's box.
  { name: 'thailand mall: pizza share', id: 'mall-pizza', hash: '#/world/thailand/mall-trip/share', reset: true },
  // The Nan road trip's mountain road (greybox, no voices): Mommy drives by herself to the end of the road, so the
  // auto-player's taps are pokes and steering; one run per road that deepens the verb.
  { name: 'thailand nan: the valley road', id: 'nan-valley', hash: '#/world/thailand/nan-trip/drive', reset: true },
  { name: 'thailand nan: the sky road', id: 'nan-sky', hash: '#/world/thailand/nan-trip/drive?road=sky', reset: true },
  { name: 'thailand nan: the 3 road', id: 'nan-three', hash: '#/world/thailand/nan-trip/drive?road=three', reset: true },
  // The mushroom farm (greybox, no voices): a tap on a bag is a puff of mist, a tap on a grown one picks it, a tap on
  // the basket or the pizza puts the next mushroom on, so the auto-player can play the rounds through to lunch.
  { name: 'thailand nan: the mushroom farm', id: 'nan-mushrooms', hash: '#/world/thailand/nan-trip/mushrooms', reset: true },
  { name: 'thailand nan: the mushroom pizza', id: 'nan-mushroom-pizza', hash: '#/world/thailand/nan-trip/mushrooms?round=pizza', reset: true },
  // Kaylee's rice farm (greybox A, no voices): a tap on the farm walks Kaylee there (planting, shooing or cutting what
  // she walks through), a tap on a gate floods its paddy. The auto-player can't hold a finger down, so it only gets
  // partway; the robot run that drags through every round is qa-motion's nan-plant and nan-shoo.
  { name: 'thailand nan: the rice farm', id: 'nan-rice', hash: '#/world/thailand/nan-trip/rice', reset: true },
  // Its threshing and the deck (greybox B): any tap bangs the next bundle, then the kratip on the deck and Mommy's photo.
  { name: 'thailand nan: threshing the rice', id: 'nan-rice-thresh', hash: '#/world/thailand/nan-trip/rice?round=thresh', reset: true },
  // Bo Kluea's salt wells: a tap on the pan (or the bucket) dips a bucketful and pours it, a tap on the woodpile throws a
  // log on, a tap on the pan in round 3 scrapes a stripe, so the auto-player can play it through to the bags.
  { name: 'thailand nan: the salt wells', id: 'nan-salt', hash: '#/world/thailand/nan-trip/salt', reset: true },
  // The Nan Mountain Cup (greybox 1, no voices): the kart races on by itself when no finger is down, so the
  // auto-player's taps are honks and pokes (the rivals, the mushrooms) all the way to the line; the finger-held run is
  // qa-motion's nan-kart.
  { name: 'thailand nan: the cup race', id: 'nan-cup', hash: '#/world/thailand/nan-trip/race?steer=finger', reset: true },
  // Greybox 2's tracks: racing on by itself it drives through the puddles and the waterfall (the rice steps), the
  // blossom showers and under the lanterns (the cloud), so the auto-player sees each trick.
  { name: 'thailand nan: the cup race, rice steps', id: 'nan-cup-steps', hash: '#/world/thailand/nan-trip/race?track=steps&steer=finger', reset: true },
  { name: 'thailand nan: the cup race, cloud top', id: 'nan-cup-cloud', hash: '#/world/thailand/nan-trip/race?track=cloud&steer=finger', reset: true },
  // Greybox 3: the silver podium (the auto-player's taps find the glowing winner for the high five, then ➡️) and the
  // Cup ceremony (the Cup floats over, a tap lifts it, the photo, 🗺️).
  { name: 'thailand nan: the cup podium, silver', id: 'nan-cup-podium', hash: '#/world/thailand/nan-trip/podium?track=steps&place=2', reset: true },
  { name: 'thailand nan: the cup ceremony', id: 'nan-cup-win', hash: '#/world/thailand/nan-trip/cup-win', reset: true },
  // The Nan map and the 3 (greybox, step 6): on the map a tap on a place drives the little Pajero there; the 3 from
  // above plays by itself.
  { name: 'thailand nan: the nan map', id: 'nan-map', hash: '#/world/thailand/nan-trip/map', reset: true },
  { name: 'thailand nan: the 3 from above', id: 'nan-three-view', hash: '#/world/thailand/nan-trip/three', reset: true },
  { name: "thailand house: the photo wall (agong's wall downstairs)", id: 'photo-wall', hash: '#/world/thailand/hub/downstairs?at=photos', reset: true, seed: seedWall },
]

/** Filmed moments (scripts/qa-motion.mjs): the core verbs, driven the way a child would. */
export const motion = []

// Agong's house (Thailand, 3D): Kaylee's hop-trot across the floor, hopping up the stairs (the camera follows her to
// the other floor), and the mattress bounce getting higher until she flops down. Taps go through the house's tap
// targets ([data-anchor]), like a finger.
const thaiHouse = (name, seconds, section, taps) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/hub/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiHouseQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(800)
  },
  act: async (page) => {
    for (const [what, wait] of taps) {
      if (what === 'floor') await page.mouse.click(vp.width * 0.42, vp.height * 0.38)
      else await page.locator(`[data-anchor="${what}"]`).click({ force: true })
      await page.waitForTimeout(wait)
    }
  },
})
// A thing dropped where it doesn't belong (a shoe on her head, paint on the mirror): silly, never wrong. The drag goes
// from the thing's tap target to a point on the screen (fractions of the viewport).
const thaiDrop = (name, seconds, drawer, thing, to) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/hub/wardrobe?drawer=${drawer}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiHouseQA?.().wardrobe, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    const box = await page.locator(`[data-anchor="trip:ward:thing:${thing}"]`).boundingBox()
    const [x, y] = [box.x + box.width / 2, box.y + box.height / 2]
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 6, y + 6, { steps: 2 })
    await page.mouse.move(vp.width * to[0], vp.height * to[1], { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(seconds * 1000 - 800)
  },
})
motion.push(
  thaiDrop('wardrobe-shoe-on-head', 4, 'feet', 'boots', [0.71, 0.52]),
  thaiDrop('wardrobe-paint-mirror', 4, 'paint', 'pot-pink', [0.56, 0.43]),
)
motion.push(
  thaiHouse('thai-walk', 2.6, 'downstairs', [['floor', 0]]),
  thaiHouse('thai-stairs', 6, 'downstairs?at=fridge', [['stairs-up', 0]]),
  thaiHouse('thai-bounce', 5, 'upstairs?at=mattress', [['mattress', 900], ['mattress', 1100], ['mattress', 1300]]),
  // Her wardrobe (wardrobe.html, gate 4): two things on in turn (each pops on and she shows it off), the mirror's picture
  // flying to the door, Sparkle's wand (a surprise look), and a picture tapped on the door (the whole look at once).
  thaiHouse('wardrobe-dress', 5, 'wardrobe?drawer=head', [['trip:ward:thing:crown', 1600], ['trip:ward:thing:cowboy', 2200]]),
  thaiHouse('wardrobe-mirror', 5, 'wardrobe?drawer=head&look=cowboy,fairy', [['trip:ward:mirror', 3800]]),
  thaiHouse('wardrobe-wand', 4, 'wardrobe', [['trip:ward:wand', 3000]]),
  thaiHouse('wardrobe-door', 4, 'wardrobe?door=crown,hearts,tutu;bow,fairy,dress-mint', [['trip:ward:thing:photo-1', 2500]]),
)

// Thailand's boat trip (3D greybox): a finger held on the water ahead of the longtail (it surges after it, then turns
// when the finger moves right, the wake and spray streaming), a VROOM tap, a finger held far to one side (doughnuts),
// and the canoe paddling under the low cave roof (Daddy's horn bonks first, then Mommy's, then Kaylee's).
const thaiBoat = (name, seconds, section, steps) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(800)
  },
  act: async (page) => {
    for (const [what, dx, dy, ms] of steps) {
      const b = await page.locator('[data-anchor="boat"]').boundingBox()
      if (!b) throw new Error('no boat found')
      if (what === 'vroom') await page.locator('[data-anchor="boat"]').click({ force: true })
      else {
        // The finger: dx across the screen from the middle, dy up from the boat (fractions of the screen).
        await page.mouse.move(vp.width * (0.5 + dx), b.y + b.height / 2 - dy * vp.height, { steps: 4 })
        if (what === 'down') await page.mouse.down()
      }
      await page.waitForTimeout(ms)
    }
    await page.mouse.up()
  },
})
motion.push(
  thaiBoat('boat-drive', 5, 'bay', [['down', 0, 0.28, 2600], ['move', 0.3, 0.2, 2200]]),
  thaiBoat('boat-vroom', 3, 'bay', [['vroom', 0, 0, 2800]]),
  thaiBoat('boat-doughnut', 5, 'bay', [['down', 0.45, 0.05, 4800]]),
  thaiBoat('boat-cave-roof', 8, 'cave', [['down', 0, 0.25, 7800]]),
)

// Baan Chang's feeding yard (3D greybox): a banana pulled out of Daddy's basket and held up on Mali's side (her trunk
// snakes after it, curls round it and swings it to her mouth), then a stick of sugarcane held high on the right (the
// trunks stretch up after it) and brought down to Khanom.
motion.push({
  name: 'chang-trunk',
  seconds: 7,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/feed`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    for (const [food, path] of [
      ['banana', [[0.34, 0.5, 2600]]],
      ['cane', [[0.7, 0.12, 1600], [0.66, 0.55, 1800]]],
    ]) {
      const b = await page.locator(`[data-anchor="food:${food}"]`).boundingBox()
      if (!b) throw new Error(`no ${food} in the basket`)
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      for (const [fx, fy, ms] of path) {
        await page.mouse.move(vp.width * fx, vp.height * fy, { steps: 10 })
        await page.waitForTimeout(ms)
      }
      await page.mouse.up()
    }
  },
})

// Baan Chang's cafe: her chocolate milk, all by dragging. The milk jug to her glass (it tips and pours), the chocolate
// held over it (upside down, brown ribbons), the spoon going round and round (the ribbons melt), a purple straw in.
motion.push({
  name: 'chang-pour',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/drinks`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().drink, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    const d = await page.evaluate(() => window.__thaiBoatQA().drink)
    for (const [tool, to, ms, round] of [
      ['milk', d.pourAt[0], 1700],
      ['choc', d.squeezeAt[0], 1400],
      ['spoon', d.stirAt[0], 0, true],
      ['straw-purple', d.glassAt[0], 200],
    ]) {
      const b = await page.locator(`[data-anchor="tool:${tool}"]`).boundingBox()
      if (!b) throw new Error(`no ${tool} on the tray`)
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await page.mouse.move(to[0], to[1], { steps: 10 })
      if (round) for (let k = 0; k < 45; k++) await page.mouse.move(to[0] + Math.cos(k / 3) * 28, to[1] + Math.sin(k / 3) * 14), await page.waitForTimeout(35)
      else await page.waitForTimeout(ms)
      await page.mouse.up()
      await page.waitForTimeout(250)
    }
  },
})

// Baan Chang deeper: in favorites a food held out to the elephant who doesn't want it (sniffed, then tossed through
// the air to the one who does); in the splash, a tap on each elephant (dip, spray up over the family, the rainbow).
const changMoment = (name, seconds, section, act) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1500)
  },
  act,
})
motion.push(
  changMoment('chang-pass', 5, 'favorites', async (page) => {
    // Whatever Khanom wants, held out on Mali's side: she takes it, sniffs it and passes it over.
    const want = await page.evaluate(() => window.__thaiBoatQA().trunks.find((t) => t.id === 'khanom').want?.split(' ')[0] ?? 'banana')
    const b = await page.locator(`[data-anchor="food:${want}"]`).boundingBox()
    if (!b) throw new Error('no food in the basket')
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.mouse.down()
    await page.mouse.move(vp.width * 0.3, vp.height * 0.45, { steps: 10 })
    await page.waitForTimeout(4200)
    await page.mouse.up()
  }),
  // The way in: the sign photo (Kaylee strikes the pose, Mommy and Daddy copy her, the flash), and the boardwalk (a
  // finger held ahead of her: she walks after it, Mommy and Daddy tag along, down the steps toward the rail).
  changMoment('chang-pose', 5, 'sign', async (page) => {
    await page.getByRole('button', { name: 'Cheer pose' }).click({ force: true })
    await page.waitForTimeout(4500)
  }),
  changMoment('chang-walk', 6, 'boardwalk', async (page) => {
    await page.mouse.move(vp.width * 0.38, vp.height * 0.58)
    await page.mouse.down()
    for (let i = 0; i < 30; i++) {
      await page.mouse.move(vp.width * Math.max(0.04, 0.38 - i * 0.02), vp.height * 0.6)
      await page.waitForTimeout(180)
    }
    await page.mouse.up()
  }),
  changMoment('chang-splash', 6, 'splash', async (page) => {
    for (const id of ['ele:mali', 'ele:khanom', 'ele:lamyai']) {
      await page.locator(`[data-anchor="${id}"]`).click({ force: true }).catch(() => {})
      await page.waitForTimeout(1900)
    }
  }),
)

// The bay's stops, one scenario per verb: ribbons fluttering through the air onto the prow (then the garland, and the
// family stepping in), the bumper-boat football (the boat pushes the ball back to the floating field: the kick, GOAL),
// lying the family down in the canoe before the low roof, and the Nail Island pose (Kaylee strikes it, Mommy and
// Daddy copy her, the flash).
const bayMoment = (name, seconds, section, setup, act) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
    if (setup) await setup(page)
  },
  act,
})
motion.push(
  bayMoment('bay-ribbons', 5.5, 'pier', null, async (page) => {
    for (const id of ['ribbon:pink', 'ribbon:sky', 'ribbon:hotpink', 'garland']) {
      await tapAnchor(page, id)
      await page.waitForTimeout(800)
    }
  }),
  bayMoment(
    'bay-football',
    6,
    'village',
    async (page) => {
      // Push the ball until it's nearly back at the field.
      for (let i = 0; i < 6; i++) {
        await tapAnchor(page, 'ball')
        await page.waitForTimeout(1500)
      }
    },
    async (page) => {
      for (let i = 0; i < 3; i++) {
        await tapAnchor(page, 'ball')
        await page.waitForTimeout(1800)
      }
    },
  ),
  bayMoment('bay-lie-down', 7, 'cave', null, async (page) => {
    for (const who of ['nick', 'ji', 'kaylee']) {
      await tapAnchor(page, `family:${who}`)
      await page.waitForTimeout(300)
    }
    const b = await page.locator('[data-anchor="boat"]').boundingBox()
    if (!b) return
    await page.mouse.move(vp.width * 0.5, b.y + b.height / 2 - vp.height * 0.25)
    await page.mouse.down()
    await page.waitForTimeout(5800)
    await page.mouse.up()
  }),
  bayMoment(
    'bay-pose',
    4,
    'nail?packed=bucket',
    async (page) => {
      await tapAnchor(page, 'glow:beach')
      await page.waitForFunction(() => window.__thaiBoatQA?.().phase === 'beach', null, { timeout: 45000 }).catch(() => {})
      await page.waitForTimeout(600)
    },
    async (page) => {
      await page.getByRole('button', { name: 'Cheer pose' }).click({ force: true }).catch(() => {})
      await page.waitForTimeout(3600)
    },
  ),
)

// The boat race: the countdown with a finger down (revving, then a rocket start at GO), racing with the finger
// sweeping across the course (leaning into the turns, the rooster tail, passing), the ramp's jump and a trick (a tap in
// the air), and the podium (the trophy floating down into her hands, the kids and the macaque cheering, confetti).
const thaiRace = (name, seconds, section, wait, act) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    // (Nudging the mouse while it waits: an automated tab with no input for 30 s drops to 4 fps.)
    for (let i = 0; wait && i < 300 && !(await page.evaluate(wait)); i++) {
      await page.mouse.move(5 + (i % 3), 5)
      await page.waitForTimeout(200)
    }
  },
  act,
})
motion.push(
  thaiRace('race-start', 6, 'race', () => window.__thaiBoatQA?.().phase === 'count', async (page) => {
    await page.mouse.move(vp.width * 0.5, vp.height * 0.45)
    await page.mouse.down()
    await page.waitForTimeout(5800)
    await page.mouse.up()
  }),
  thaiRace('race-drive', 6, 'race', () => window.__thaiBoatQA?.().phase === 'race', async (page) => {
    await page.mouse.move(vp.width * 0.3, vp.height * 0.45)
    await page.mouse.down()
    for (let i = 0; i < 6; i++) {
      await page.mouse.move(vp.width * (i % 2 ? 0.75 : 0.3), vp.height * 0.45, { steps: 6 })
      await page.waitForTimeout(950)
    }
    await page.mouse.up()
  }),
  thaiRace('race-ramp', 5, 'race?lap=3', () => (window.__thaiBoatQA?.().racers?.kaylee?.s ?? 0) > 280, async (page) => {
    await page.waitForTimeout(3000)
  }),
  thaiRace('race-podium', 7, 'podium', null, async (page) => {
    await page.waitForTimeout(6800)
  }),
)

// The boat trip's way there: things hopping into the suitcase in an arc, Kaylee sitting on the too-full suitcase (squash, squash, squash, click) and her
// things going on, everyone hopping into Aunty Sri's van and it gliding off, the suitcase through the x-ray and the
// officer's stamp, the plane's takeoff (everyone presses back, then up), the tray and the call button (the flight
// attendant's trolley, snacks piling up), the air vent in her mane, and the landing (bump, bump, claps) into Krabi's
// songthaew. Taps go through the tap targets.
const thaiTrip = (name, seconds, section, taps, wait = 1400) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiBoatQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(wait)
  },
  act: async (page) => {
    for (const [what, ms] of taps) {
      await page.locator(`[data-anchor="${what}"]`).click({ force: true }).catch(() => {})
      await page.waitForTimeout(ms)
    }
  },
})
motion.push(
  thaiTrip('trip-toss', 3.4, 'pack', [['trip:item:sunhat', 500], ['trip:item:duck', 500], ['trip:item:floaties', 500], ['trip:item:duck', 900]]),
  thaiTrip('trip-sit', 7, 'pack?packed=sunhat,sunglasses,floaties,duck,teddy,camera', [['trip:suitcase', 2600], ['trip:suitcase', 800], ['trip:suitcase', 3000]]),
  thaiTrip('trip-van', 5, 'goodbye', [['trip:van', 4500]], 3800),
  thaiTrip('trip-xray', 8, 'airport?packed=gan,fan,mango', [['suitcase', 7800]]),
  thaiTrip('trip-takeoff', 10, 'takeoff', [['belt', 9500]]),
  thaiTrip('trip-tray', 5, 'fly', [['tray', 700], ['call', 400], ['call', 3500]], 2000),
  thaiTrip('trip-vent', 3, 'fly?packed=sunhat', [['vent', 2800]], 2000),
  thaiTrip('trip-land', 9, 'land', [], 8000),
)

// HarborLand (the mall trip): the hall's ways in, and the Big Frame's climbs and rides: up the red wall, through the
// tunnel, the Boomerang Donut swinging, down the twin-dragon spiral into the balls (after walking to the top's left
// end), the Ta-Khon roller over the racing lanes, the zip line along the front, the mask's nose slide, and the cannon
// at Daddy (bonk, the ball on his horn, his flop). Taps go through the tap targets, or a point on the screen.
const thaiMall = (name, seconds, section, steps) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/${section}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(1200)
  },
  act: async (page) => {
    for (const [what, ms, fx, fy] of steps) {
      if (what === 'point') await page.mouse.click(vp.width * fx, vp.height * fy)
      else await page.locator(`[data-anchor="${what}"]`).click({ force: true }).catch(() => {})
      await page.waitForTimeout(ms)
    }
  },
})
motion.push(
  // The hall: walking to the cafe's door and going in (the door swings, the camera moves in), going in at the barber's
  // (Daddy following with his new look), and Little Land's bricks tumbling and hopping home.
  thaiMall('hall-go-in', 5, 'hall?from=vet', [['door:cafe', 4800]]),
  thaiMall('hall-barber', 3, 'hall?from=barber&hair=k.roygbvproygbvproygbvproyg.s', [['door:barber', 2800]]),
  thaiMall('hall-bricks', 14, 'hall?from=race', [['point', 3500, 0.97, 0.88], ['point', 3500, 0.97, 0.88], ['blocks', 6500]]),
  thaiMall('frame-wall', 6, 'frame?at=out', [['climb:wall', 5800]]),
  thaiMall('frame-tunnel', 5, 'frame?at=out', [['tunnel', 4800]]),
  thaiMall('frame-donut', 9, 'frame?at=l1', [['ride:donut', 8800]]),
  thaiMall('frame-dragon', 12, 'frame?at=top', [['point', 4000, 0.12, 0.62], ['ride:dragon', 7800]]),
  thaiMall('frame-roller', 12, 'frame?at=top', [['point', 4000, 0.85, 0.6], ['ride:roller', 7800]]),
  thaiMall('frame-zip', 8, 'frame?at=l2', [['ride:zip', 7800]]),
  thaiMall('frame-nose', 7, 'frame?at=top', [['ride:nose', 6800]]),
  thaiMall('frame-cannon', 7, 'frame?at=in', [['cannon', 2700], ['cannon', 1400], ['cannon', 2700]]),
)

// The Vet Clinic (mall trip, greybox): her finger drags a tool from the tray onto the patient and works it there, the
// core verb. The bandage wound round the puppy's sore paw, the thorn pulled out, the soap rubbed into the muddy pony,
// and the elephant's sneeze. Where things are comes from window.__thaiMallQA (its zones and tools, in screen pixels).
const thaiVet = (name, seconds, patient, strokes) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/vet?patient=${patient}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().phase === 'exam', null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    for (const [tool, zone, how, after = 300] of strokes) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      const [zx, zy] = [q.zones[zone][0], q.zones[zone][1] + q.liftPx]
      await page.mouse.move(...q.tools[tool])
      await page.mouse.down()
      await page.mouse.move(zx, zy, { steps: 14 })
      if (how === 'pull') {
        await page.waitForTimeout(300)
        await page.mouse.move(zx + 130, zy - 110, { steps: 10 })
      } else for (let i = 0; i < 36; i++) {
        const a = i * (how === 'circle' ? 0.45 : 0.9)
        await page.mouse.move(zx + Math.cos(a) * 26, zy + Math.sin(a) * (how === 'circle' ? 26 : 14), { steps: 3 })
      }
      await page.mouse.up()
      await page.waitForTimeout(after)
    }
  },
})
motion.push(
  thaiVet('vet-thorn-bandage', 6, 'puppy', [['tweezers', 'paw', 'pull', 600], ['bandage-pink', 'paw', 'circle']]),
  // The stethoscope: only its chest piece goes to the puppy; the ear tips sit on Kaylee's own ears, with a tube between.
  thaiVet('vet-heart', 4, 'puppy', [['stethoscope', 'chest', 'rub', 900]]),
  thaiVet('vet-soap', 4, 'pony', [['soap', 'belly', 'rub']]),
  thaiVet('vet-sneeze', 7, 'elephant', [['soap', 'belly', 'rub'], ['soap', 'head', 'rub', 2600]]),
)

// The Barber Salon (mall trip, greybox): tools on Daddy's mane, the core verb. Her finger drags the grow tonic round
// his head (the strands grow long and wild), the scissors across (the tufts fall), the comb up (spikes) and the color
// spray across (rainbow stripes); then the mirror: the chair spins round to it, he poses, Mommy's flash. Where things
// are comes from window.__thaiMallQA (his head and the tools, in screen pixels).
const thaiBarber = (name, seconds, round, strokes, mirror = false) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/barber?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'barber' && window.__thaiMallQA().head, null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    for (const [tool, path] of strokes) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      const [hx, hy, r] = q.head
      await page.mouse.move(...q.tools[tool])
      await page.mouse.down()
      for (const [fx, fy] of path) await page.mouse.move(hx + fx * r, hy + fy * r + q.liftPx, { steps: 5 })
      await page.mouse.up()
      await page.waitForTimeout(300)
    }
    if (mirror) {
      await page.locator('[data-anchor="mirror"]').click({ force: true })
      await page.waitForTimeout(3600)
    }
  },
})
motion.push(
  thaiBarber('barber-grow-snip', 6, 1, [['tonic', around(26, -0.6)], ['scissors', [[-1.8, 0], [1.8, 0], [-1.8, -0.4]]]]),
  thaiBarber('barber-comb-color', 6, 2, [['tonic', around(20, -0.6)], ['comb', [[-0.5, -0.2], [-0.3, -1.6], [0, -0.2], [0.2, -1.6], [0.5, -0.2], [0.6, -1.6]]], ['spray', Array.from({ length: 30 }, (_, i) => [-1.2 + i * 0.08, -0.8])]]),
  // (The mirror glows after 8 strokes of hair work.)
  thaiBarber('barber-mirror', 10, 1, [0, 1, 2, 3].flatMap((i) => [['tonic', around(8, -0.6)], ['scissors', [[-1.8, 0.4 - i * 0.2], [1.8, 0.4 - i * 0.2]]]]), true),
)

// Cafe & Cake (mall trip, greybox): the blender, its core verb. Her finger drags the strawberry and the banana into the
// jar, presses the big button (the colors swirl into pink), then lifts the jar to the cup: it tips as it gets there
// and pours. Where things are comes from window.__thaiMallQA (the tray, the jar's mouth, where to hold it to pour).
motion.push({
  name: 'cafe-blend-pour',
  seconds: 9,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/cafe?round=2`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'cafe', null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    const q = () => page.evaluate(() => window.__thaiMallQA())
    for (const fruit of ['strawberry', 'banana']) {
      const s = await q()
      await page.mouse.move(...s.items[fruit])
      await page.mouse.down()
      await page.mouse.move(s.mouth[0], s.mouth[1] + s.liftPx, { steps: 14 })
      await page.mouse.up()
      await page.waitForTimeout(350)
    }
    await page.locator('[data-anchor="button"]').click({ force: true })
    await page.waitForTimeout(2100)
    const s = await q()
    await page.mouse.move(...s.jarAt)
    await page.mouse.down()
    await page.mouse.move(...s.pourAt[0], { steps: 18 })
    for (let i = 0; i < 10; i++) await page.mouse.move(s.pourAt[0][0] + (i % 2) * 4, s.pourAt[0][1], { steps: 2 })
    await page.waitForTimeout(1200)
    await page.mouse.up()
  },
})

// The Racing Slide (mall trip, greybox): the core verb, scooting down a lane. Setup climbs the steps (taps on the
// steps' tap target) and waits for the 3-2-1; the act taps Kaylee: steadily (`every` ms, round 1's scoots) or just as a
// bump's ring closes on her (round 2's flights; round 3 in the spinning rings), until she's in the balls (Daddy head
// first). Where she is comes from window.__thaiMallQA (screen pixels).
const thaiSlide = (name, seconds, round, every) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/race?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().phase === 'climb', null, { timeout: 20000 })
    for (let i = 0; i < 60; i++) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      if (q.phase === 'race') break
      if (q.phase === 'climb') await page.locator('[data-anchor="steps"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(400)
    }
  },
  act: async (page) => {
    const t0 = Date.now()
    let last = 0
    while (Date.now() - t0 < seconds * 1000) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      if (q.phase === 'race' && q.kaylee && (every ? Date.now() - last > every : q.window && Date.now() - last > 500)) {
        await page.mouse.click(...q.kaylee)
        last = Date.now()
      }
      await page.waitForTimeout(40)
    }
  },
})
motion.push(thaiSlide('mall-race-scoot', 8, 1, 330), thaiSlide('mall-race-bump', 9, 2, 0), thaiSlide('mall-race-rings', 9, 3, 0))

// The mall day's HarborLand counter (the trip loop, greybox): its tiny toys. Setup rides the lift up (the big button);
// the act taps a pair of grip socks (they hop onto her feet, and Daddy's stretch up to his knees), the shoe rack (her
// shoes hop into a cubby, Daddy squashes his big ones in) and the height chart (her horn counts, Daddy's goes off the
// top).
motion.push({
  name: 'mall-counter-toys',
  seconds: 12,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/arrive`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().phase === 'lift', null, { timeout: 30000 })
    await page.locator('[data-anchor="lift-button"]').click({ force: true })
    await page.waitForFunction(() => window.__thaiMallQA?.().phase === 'counter', null, { timeout: 30000 })
    await page.waitForTimeout(800)
  },
  act: async (page) => {
    await page.locator('[data-anchor="socks:pink"]').click({ force: true })
    await page.waitForTimeout(2600)
    await page.locator('[data-anchor="rack"]').click({ force: true })
    await page.waitForTimeout(3600)
    await page.locator('[data-anchor="chart"]').click({ force: true })
    await page.waitForTimeout(5000)
  },
})

// Little Land (mall trip, greybox): the core verb, a brick from the box put on the stack. Her finger drags bricks onto
// the spots (each drops in, squashes, and the stack sways; the second goes half over the edge: a big wobble), then a
// swipe through the stack knocks it over and the bricks bounce. In round 3 the tower passes Daddy's ribbon and he
// sneezes it down. Where things are comes from window.__thaiMallQA (the box and the spots, in screen pixels).
const thaiBlocks = (name, seconds, round, targets, end) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/blocks?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'blocks', null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    for (const [s, r] of targets) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      const sp = q.spots.find((p) => p[0] === s && (r === undefined || p[1] === r)) ?? q.spots.find((p) => p[0] === s)
      if (!sp) continue
      await page.mouse.move(...q.box)
      await page.mouse.down()
      await page.mouse.move(sp[2], sp[3] + q.liftPx, { steps: 14 })
      await page.mouse.up()
      await page.waitForTimeout(700)
    }
    if (end === 'swipe') {
      // From a brick at the bottom (it has bricks on top, so it doesn't lift off), sideways through the stack.
      const q = await page.evaluate(() => window.__thaiMallQA())
      const low = q.stack.find((b) => b[1] === 0)
      if (!low) return
      await page.mouse.move(low[2], low[3])
      await page.mouse.down()
      await page.mouse.move(low[2] + 220, low[3] - 20, { steps: 8 })
      await page.mouse.up()
      await page.waitForTimeout(2200)
    } else await page.waitForTimeout(3200)
  },
})
motion.push(thaiBlocks('blocks-stack-crash', 7, 1, [[3, 0], [4, 1], [1, 0], [2, 1]], 'swipe'), thaiBlocks('blocks-sneeze', 8, 3, [[3, 0], [3, 1], [3, 2], [3, 3]], 'wait'))

// Muay Thai (mall trip, greybox): the core verb, a punch. Round 1: her finger goes down on the bag, high then low, and
// a swipe across it (a hook): the glove goes out where she touched, the bag swings and squashes, Daddy staggers, POW.
// Round 2: punches on the drum's beat (when the ring is gold): the big gold POW. Round 3: Daddy's pad as it moves, then
// the big kick. Where things are comes from window.__thaiMallQA (screen pixels).
const thaiBoxing = (name, seconds, round, mode) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/boxing?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'boxing', null, { timeout: 20000 })
    await page.waitForTimeout(400)
    // Round 1 starts with the wai kru: six taps on her gloves.
    for (let i = 0; i < 8 && (await page.evaluate(() => window.__thaiMallQA().phase)) !== 'play'; i++) {
      await page.locator('[data-anchor="gloves"]').click({ force: true }).catch(() => {})
      await page.waitForTimeout(500)
    }
  },
  act: async (page) => {
    const t0 = Date.now()
    let i = 0
    while (Date.now() - t0 < seconds * 1000) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      if (mode === 'bag' && q.bag) {
        const [x, y] = q.bag
        if (i % 3 === 2) {
          await page.mouse.move(x - 40, y)
          await page.mouse.down()
          await page.mouse.move(x + 60, y, { steps: 4 })
          await page.mouse.up()
        } else await page.mouse.click(x, y + (i % 2 ? -50 : 40))
        i++
        await page.waitForTimeout(550)
      } else if (mode === 'beat' && q.bag && q.window && q.toNext < 0.3) {
        await page.mouse.click(...q.bag)
        await page.waitForTimeout(400)
      } else if (mode === 'pad' && q.pad && !q.hopping && (q.phase === 'play' || q.phase === 'kick')) {
        await page.mouse.click(...q.pad)
        await page.waitForTimeout(500)
      }
      await page.waitForTimeout(30)
    }
  },
})
motion.push(thaiBoxing('boxing-punch', 5, 1, 'bag'), thaiBoxing('boxing-beat', 6, 2, 'beat'), thaiBoxing('boxing-pad-kick', 9, 3, 'pad'))
// The Golden Mountain (mall trip, greybox): the core verb, pulling up hold by hold. Her finger goes down on a glowing
// hold and pulls down (she reaches, rises, lands with a squash, the number pops); at the top the bell and the slide.
// In round 3 Daddy climbs the other side, puffing, a hold behind. Where things are comes from window.__thaiMallQA.
const thaiMountain = (name, seconds, round, steps) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/mountain?round=${round}`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'mountain', null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    for (let i = 0; i < steps; i++) {
      const q = await page.evaluate(() => window.__thaiMallQA())
      const r = q.reach.find((h) => h[2] === 1 && h.length > 3)
      if (r) {
        await page.mouse.move(r[3], r[4])
        await page.mouse.down()
        await page.mouse.move(r[3], r[4] + q.pullPx + 10, { steps: 8 })
        await page.mouse.up()
        await page.waitForTimeout(500)
      } else if (q.state === 'top' && !q.rung && q.bell) {
        await page.mouse.click(...q.bell)
        await page.waitForTimeout(1300)
      } else if (q.state === 'top' && q.slide) {
        await page.mouse.click(...q.slide)
        await page.waitForTimeout(2600)
      } else await page.waitForTimeout(300)
    }
  },
})
motion.push(thaiMountain('mountain-climb', 9, 1, 9), thaiMountain('mountain-race', 9, 3, 9))
// The Sky Pod (mall trip, greybox): the core verb, slapping the pods. Each slap squashes the pod, flashes it, plays its
// note and throws sparks, and Kaylee bounces over on the mat and jumps to slap it too (a big jump for the high ones).
// The first run slaps low, high, across and back; the second slides a finger across the arch (a glissando). Where the
// pods are comes from window.__thaiMallQA (screen pixels).
const thaiSkyPod = (name, seconds, pods, glide) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/skypod`)
    await page.waitForTimeout(600)
    await page.waitForFunction(() => window.__thaiMallQA?.().game === 'skypod', null, { timeout: 20000 })
    await page.waitForTimeout(600)
  },
  act: async (page) => {
    const q = await page.evaluate(() => window.__thaiMallQA())
    if (glide) {
      const [a, b] = [q.pods[0], q.pods[q.pods.length - 1]]
      await page.mouse.move(a[0], a[1])
      await page.mouse.down()
      for (const p of q.pods) await page.mouse.move(p[0], p[1], { steps: 4 })
      await page.mouse.move(b[0] + 30, b[1], { steps: 2 })
      await page.mouse.up()
      await page.waitForTimeout(1500)
      return
    }
    for (const i of pods) {
      await page.mouse.click(q.pods[i][0], q.pods[i][1])
      await page.waitForTimeout(900)
    }
  },
})
motion.push(thaiSkyPod('skypod-slap', 7, [0, 4, 8, 3, 1]), thaiSkyPod('skypod-glide', 4, [], true))

// The Pizza Company (mall trip, greybox): her finger pulls a slice out of the pan and the cheese stretches, wobbles as
// she swings it, and snaps; she lets go over a plate. Hawaiian snaps early, Double Cheese stretches longest, and in the
// tug (after one each) Daddy grabs the other end. Where things are comes from window.__thaiMallQA (screen pixels).
const thaiPizza = (name, seconds, link, to, opts = {}) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/mall-trip/share?${link}`)
    await page.waitForFunction(() => window.__thaiMallQA?.().pan?.length, null, { timeout: 20000 })
    await page.waitForTimeout(400)
  },
  act: async (page) => {
    const q = await page.evaluate(() => window.__thaiMallQA())
    const [sx, sy] = q.pan[0]
    const [px, py] = q.plates[to]
    await page.mouse.move(sx, sy)
    await page.mouse.down()
    await page.mouse.move(sx, sy - 90, { steps: 10 })
    if (opts.tug) await page.waitForTimeout(800)
    // Swing it side to side on the way (the cheese wobbles), then over the plate.
    for (let i = 0; i < 3; i++) await page.mouse.move(sx + (i % 2 ? -60 : 60), sy - 110, { steps: 6 })
    await page.mouse.move(px, py + 40, { steps: 16 })
    await page.waitForTimeout(250)
    await page.mouse.up()
    await page.waitForTimeout(900)
  },
})
motion.push(
  thaiPizza('pizza-pull-cheese', 5, 'pizza=cheese', 'nick'),
  thaiPizza('pizza-pull-hawaiian', 5, 'pizza=hawaiian', 'ji'),
  thaiPizza('pizza-tug', 6, 'pizza=cheese&shared=3', 'ji', { tug: true }),
)

// The Nan road trip's mountain road: her finger steering the Pajero, the core verb. On the valley road she puts her
// finger down (the steering wheel appears), turns it right and holds it: the Pajero swerves off onto the grass (bumping,
// tufts flying, "Oh no, the grass!"), on past it (it hops off and tumbles, "Oh no!", poof), and drops back onto the road
// ("We're back!"); she lets go and Mommy takes it back to the left lane, then she taps the Pajero (it hops, boing).
motion.push({
  name: 'nan-steer',
  seconds: 11,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/nan-trip/drive`)
    await page.waitForFunction(() => window.__thaiNanQA?.().mode, null, { timeout: 30000 })
    await page.waitForTimeout(1500)
  },
  act: async (page) => {
    await page.mouse.move(vp.width * 0.38, vp.height * 0.45)
    await page.mouse.down()
    await page.waitForTimeout(1800)
    await page.mouse.move(vp.width * 0.85, vp.height * 0.45, { steps: 20 })
    await page.waitForFunction(() => window.__thaiNanQA().overs > 0, null, { timeout: 12000 }).catch(() => {})
    await page.waitForTimeout(3000)
    await page.mouse.up()
    await page.waitForTimeout(2200)
    await page.getByRole('button', { name: 'The Pajero' }).click({ force: true }).catch(() => {})
    await page.waitForTimeout(1500)
  },
})

// The Nan Mountain Cup (greybox 1): the kart toy. After GO her finger holds the road just ahead of the kart (where QA's
// `aim` says it is) and swings from side to side across it, over coins and pads; then (nan-bounce) the forest's trick:
// racing on by itself up to the first bouncy mushroom, and boing, up in the air.
motion.push(
  {
    name: 'nan-kart',
    seconds: 12,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/race?steer=finger`)
      await page.waitForFunction(() => window.__thaiNanQA?.().phase === 'race', null, { timeout: 40000 })
    },
    act: async (page) => {
      const aim = () => page.evaluate(() => window.__thaiNanQA().aim)
      let a = await aim()
      await page.mouse.move(a?.x ?? vp.width / 2, a?.y ?? vp.height * 0.45)
      await page.mouse.down()
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(500)
        a = await aim()
        if (a) await page.mouse.move(a.x + Math.sin(i / 2.5) * vp.width * 0.12, a.y, { steps: 4 })
      }
      await page.mouse.up()
    },
  },
  {
    name: 'nan-bounce',
    seconds: 8,
    setup: async (page, base) => {
      // Racing on by itself, it drives straight over the mushrooms (the good bits don't need her to aim): up to just
      // before the first one.
      await page.goto(`${base}#/world/thailand/nan-trip/race?steer=finger`)
      await page.waitForFunction(() => window.__thaiNanQA?.().racers?.kaylee.progress > 140, null, { timeout: 60000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiNanQA().bounces > 0, null, { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(2500)
    },
  },
)

// The Nan Mountain Cup, greybox 2: each new track's trick. On the rice steps (nan-splash) racing on by itself through
// the first puddles (it steers into them): the splash, the mud on the kart. On the climb (nan-cloud) from just below the
// cloud: the white closing in and the lanterns lighting up one by one as it drives under them.
motion.push(
  {
    name: 'nan-splash',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/race?track=steps&steer=finger`)
      await page.waitForFunction(() => window.__thaiNanQA?.().racers?.kaylee.progress > 50, null, { timeout: 60000 })
    },
    act: async (page) => {
      await page.waitForFunction(() => window.__thaiNanQA().splashes > 1, null, { timeout: 12000 }).catch(() => {})
      await page.waitForTimeout(1500)
    },
  },
  {
    name: 'nan-cloud',
    seconds: 10,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/race?track=cloud&steer=finger`)
      await page.waitForFunction(() => window.__thaiNanQA?.().cloud?.in > 0.15, null, { timeout: 120000 })
    },
    act: async (page) => {
      await page.waitForTimeout(10000)
    },
  },
)

// The Nan Mountain Cup, the look step: the rivals on the chibi rig waving in the character lab (Grandma Taeng, Pao,
// Moon); on the rice steps (nan-ducks) the mother duck and her ducklings waddling across the road while every kart waits
// a moment; in the forest (nan-log) through the hollow log near the end. Both race there with a finger held on the road
// ahead (as she would), so they get there in good time.
const raceTo = async (page, until, ms, press = true) => {
  await page.waitForFunction(() => window.__thaiNanQA?.().phase === 'race', null, { timeout: 60000 })
  let a = await page.evaluate(() => window.__thaiNanQA().aim)
  if (press) {
    await page.mouse.move(a?.x ?? vp.width / 2, a?.y ?? vp.height * 0.45)
    await page.mouse.down()
  }
  const t0 = Date.now()
  while (Date.now() - t0 < ms && !(await page.evaluate(until))) {
    a = await page.evaluate(() => window.__thaiNanQA().aim)
    if (a) await page.mouse.move(a.x, a.y)
    await page.waitForTimeout(150)
  }
}
motion.push(
  {
    name: 'nan-cup-rivals',
    seconds: 4,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/characters/taeng?lineup=taeng,pao,moon`)
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      await page.getByRole('button', { name: 'Hop', exact: true }).click().catch(() => {})
      await page.waitForTimeout(1200)
      await page.getByRole('button', { name: 'Wave', exact: true }).click().catch(() => {})
      await page.waitForTimeout(2500)
    },
  },
  {
    name: 'nan-ducks',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/race?track=steps&steer=finger`)
      await raceTo(page, () => window.__thaiNanQA().scenery?.ducks?.state === 'cross', 240000)
    },
    act: async (page) => {
      await raceTo(page, () => false, 6000, false)
      await page.mouse.up()
    },
  },
  {
    name: 'nan-log',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/race?steer=finger`)
      await raceTo(page, () => window.__thaiNanQA().racers?.kaylee.progress > 670, 300000)
    },
    act: async (page) => {
      await raceTo(page, () => false, 6000, false)
      await page.mouse.up()
    },
  },
)

// The Nan Mountain Cup (greybox 3): the silver podium, where she taps the winner (Grandma Taeng) for a high five and
// Taeng hops down to tie her ribbon on the pink kart and back up; then the Cup ceremony: the scoreboard lights up race by
// race, the Cup flies over from its stand, a tap and she lifts it over her head (fireworks, everyone cheering).
motion.push(
  {
    name: 'nan-high-five',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/podium?track=steps&place=2`)
      await page.waitForFunction(() => window.__thaiNanQA?.().mode === 'podium', null, { timeout: 30000 })
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      await page.getByRole('button', { name: 'Grandma Taeng', exact: true }).click({ force: true }).catch(() => {})
      await page.waitForFunction(() => window.__thaiNanQA().ui.next, null, { timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(800)
    },
  },
  {
    name: 'nan-cup-lift',
    seconds: 7,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/cup-win`)
      await page.waitForFunction(() => window.__thaiNanQA?.().cupHere, null, { timeout: 60000 })
    },
    act: async (page) => {
      await page.getByRole('button', { name: 'The Nan Mountain Cup', exact: true }).click({ force: true }).catch(() => {})
      await page.waitForTimeout(6000)
    },
  },
)

// The Nan road trip's mushroom farm (greybox): misting, the core verb. Her finger holds the hose on the rack and sweeps
// along the middle row (mist, pins popping, swelling, the rainbow), then in round 2 pulls a grown clump off and carries
// it to the basket.
motion.push(
  {
    name: 'nan-mist',
    seconds: 8,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/mushrooms`)
      await page.waitForFunction(() => window.__thaiNanQA?.().game === 'mushrooms', null, { timeout: 30000 })
      await page.waitForTimeout(1200)
    },
    act: async (page) => {
      const bags = (await page.evaluate(() => window.__thaiNanQA())).bags.map((b) => b.at)
      await page.mouse.move(bags[4][0], bags[4][1])
      await page.mouse.down()
      for (const i of [4, 5, 6, 7, 3, 2, 1, 0]) {
        await page.mouse.move(bags[i][0], bags[i][1], { steps: 10 })
        await page.waitForTimeout(700)
      }
      await page.mouse.up()
    },
  },
  {
    name: 'nan-pick',
    seconds: 6,
    setup: async (page, base) => {
      await page.goto(`${base}#/world/thailand/nan-trip/mushrooms?round=2`)
      await page.waitForFunction(() => window.__thaiNanQA?.().game === 'mushrooms', null, { timeout: 30000 })
      await page.waitForTimeout(1500)
    },
    act: async (page) => {
      const q = await page.evaluate(() => window.__thaiNanQA())
      const [x, y] = q.bags[5].at
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(x - 30, y + 70, { steps: 12 })
      await page.mouse.move(q.points.basket[0], q.points.basket[1] - 50, { steps: 14 })
      await page.mouse.up()
      await page.waitForTimeout(1200)
      await page.mouse.click(...q.bags[6].at)
      await page.waitForTimeout(1500)
    },
  },
)

// Kaylee's rice farm (greyboxes A and B): leading Kaylee, the core verb. A finger held on paddy A zigzags across it at about
// her trotting speed (she splashes after it, ripples behind her, seedlings plip in where she wades); then in the
// growing round the finger chases the pecking birds off the rice.
const riceReady = async (page, base, round) => {
  await page.goto(`${base}#/world/thailand/nan-trip/rice?round=${round}`)
  await page.waitForFunction(() => window.__thaiNanQA?.().game === 'rice', null, { timeout: 30000 })
  await page.waitForTimeout(1200)
}
const slowDrag = async (page, to, ms = 900) => {
  const from = await page.evaluate(() => window.__qaMouse ?? null)
  for (let k = 1; k <= 12; k++) {
    const x = (from?.[0] ?? to[0]) + ((to[0] - (from?.[0] ?? to[0])) * k) / 12
    const y = (from?.[1] ?? to[1]) + ((to[1] - (from?.[1] ?? to[1])) * k) / 12
    await page.mouse.move(x, y)
    await page.waitForTimeout(ms / 12)
  }
  await page.evaluate((p) => (window.__qaMouse = p), to)
}
motion.push(
  {
    name: 'nan-plant',
    seconds: 9,
    setup: (page, base) => riceReady(page, base, 'plant'),
    act: async (page) => {
      const [x0, y0, x1, y1] = (await page.evaluate(() => window.__thaiNanQA())).paddies[0]
      await page.mouse.move(x0 + 12, y1 - 12)
      await page.evaluate((p) => (window.__qaMouse = p), [x0 + 12, y1 - 12])
      await page.mouse.down()
      for (let r = 0; r < 4; r++) await slowDrag(page, [r % 2 ? x0 + 12 : x1 - 12, y1 - 14 - ((y1 - y0 - 28) * r) / 3], 1500)
      await page.mouse.up()
    },
  },
  {
    name: 'nan-shoo',
    seconds: 8,
    setup: async (page, base) => {
      await riceReady(page, base, 'grow')
      await page.waitForTimeout(2500)
    },
    act: async (page) => {
      for (let k = 0; k < 4; k++) {
        const b = (await page.evaluate(() => window.__thaiNanQA())).birds.at[0]
        if (!b) {
          await page.waitForTimeout(800)
          continue
        }
        await page.mouse.move(...b)
        await page.mouse.down()
        await page.waitForTimeout(900)
        await page.mouse.up()
      }
    },
  },
  // Greybox B's threshing: a tap every 0.7 s on the basket, so she takes bundles, swings and bangs them and tosses the
  // straw onto the pile; the filmstrip should show the anticipation up, the fast down and the grains spraying.
  {
    name: 'nan-thresh',
    seconds: 8,
    setup: (page, base) => riceReady(page, base, 'thresh'),
    act: async (page) => {
      for (let k = 0; k < 10; k++) {
        const p = (await page.evaluate(() => window.__thaiNanQA())).points.basket
        if (p) await page.mouse.click(...p)
        await page.waitForTimeout(700)
      }
    },
  },
)

// Bo Kluea's salt wells (greybox): the bucket, the core verb. A held finger takes the bucket down into the well (splash,
// glug), lifts it full (it swings on its rope), carries it over the pan and lowers it so it tips and pours; then in
// round 3 the finger drags the paddle's blade through the salt toward her and lets go over the basket.
const saltReady = async (page, base, round) => {
  await page.goto(`${base}#/world/thailand/nan-trip/salt?round=${round}`)
  await page.waitForFunction(() => window.__thaiNanQA?.().game === 'salt', null, { timeout: 30000 })
  await page.waitForTimeout(1200)
}
motion.push(
  {
    name: 'nan-bucket',
    seconds: 9,
    setup: (page, base) => saltReady(page, base, '1'),
    act: async (page) => {
      const p = (await page.evaluate(() => window.__thaiNanQA())).points
      await page.mouse.move(...p.well)
      await page.mouse.down()
      await page.mouse.move(p.wellDeep[0], p.wellDeep[1] + 40, { steps: 12 })
      await page.waitForTimeout(1100)
      await page.mouse.move(p.well[0], p.well[1] - 160, { steps: 14 })
      await page.waitForTimeout(400)
      await page.mouse.move(p.panLow[0], p.pan[1] - 160, { steps: 18 })
      await page.waitForTimeout(300)
      await page.mouse.move(p.panLow[0], p.panLow[1] + 20, { steps: 10 })
      await page.waitForTimeout(1500)
      await page.mouse.up()
    },
  },
  {
    name: 'nan-scrape',
    seconds: 7,
    setup: (page, base) => saltReady(page, base, '3'),
    act: async (page) => {
      const p = (await page.evaluate(() => window.__thaiNanQA())).points
      for (const dx of [-120, 0, 120]) {
        await page.mouse.move(p.saltBack[0] + dx, p.saltBack[1])
        await page.mouse.down()
        await page.mouse.move(p.saltFront[0] + dx, p.saltFront[1], { steps: 16 })
        await page.mouse.up()
        await page.waitForTimeout(900)
      }
    },
  },
)

// The Nan trip's map and the 3 (greybox, step 6): on the map, the little Pajero grabbed at
// the airport and pulled along the roads over the bridge, through town and up the valley to the mushroom farm (held
// there, it goes: the camera dives into the road); at the viewpoint, a finger drawing the 3 along the road below.
const nanReady = async (page, base, hash, ready) => {
  await page.goto(`${base}#/world/thailand/nan-trip/${hash}`)
  await page.waitForFunction(ready, null, { timeout: 30000 })
  await page.waitForTimeout(1500)
}
motion.push(
  {
    name: 'nan-map-drag',
    seconds: 9,
    setup: (page, base) => nanReady(page, base, 'map', () => window.__thaiNanQA?.().game === 'map'),
    act: async (page) => {
      const q = await page.evaluate(() => window.__thaiNanQA())
      const n = q.points.nodes
      await page.mouse.move(...q.car)
      await page.mouse.down()
      for (const to of [n.town, n.mushrooms]) {
        const from = (await page.evaluate(() => window.__thaiNanQA())).car ?? to
        for (let k = 1; k <= 14; k++) {
          await page.mouse.move(from[0] + ((to[0] - from[0]) * k) / 14, from[1] + ((to[1] - from[1]) * k) / 14)
          await page.waitForTimeout(110)
        }
        await page.waitForTimeout(500)
      }
      await page.waitForTimeout(900)
      await page.mouse.up()
    },
  },
  {
    // The 3 from above: the bends pop one, two, three by themselves, then the fanfare (nothing to draw).
    name: 'nan-three-view',
    seconds: 5,
    setup: (page, base) => {
      return page.goto(`${base}#/world/thailand/nan-trip/three`).then(() => page.waitForFunction(() => window.__thaiNanQA?.().phase === 'view', null, { timeout: 30000 }))
    },
    act: async () => {},
  },
)

// Coming home (step 5): the flight home (the plane over the pink sunset), and Agong taking the photo, holding it up and
// walking in to hang it on his wall; then everyone gathering and the cousins putting their phones down. A home link
// first builds the bay to take its photo, so the setup waits for each moment.
const thaiHome = (name, seconds, until, act) => ({
  name,
  seconds,
  setup: async (page, base) => {
    await page.goto(`${base}#/world/thailand/boat-trip/home`)
    await page.waitForFunction(() => window.__thaiBoatQA?.().trip === 'flight', null, { timeout: 120000 })
    if (until === 'flight') return
    await page.mouse.click(200, 400)
    await page.waitForFunction(() => window.__thaiBoatQA?.().trip === 'pick', null, { timeout: 60000 })
    await page.getByRole('button', { name: /^Photo: / }).first().click({ force: true })
    await page.waitForFunction(() => window.__thaiBoatQA?.().trip === 'give', null, { timeout: 20000 })
    await page.waitForTimeout(1200)
    if (until === 'give') return
    await page.locator('[data-anchor="family:agong"]').click({ force: true })
    await page.waitForFunction(() => window.__thaiBoatQA?.().trip === 'gather', null, { timeout: 60000 })
  },
  act,
})
motion.push(
  thaiHome('trip-flight-home', 4, 'flight', async (page) => page.waitForTimeout(3800)),
  thaiHome('trip-give-agong', 9, 'give', async (page) => {
    await page.locator('[data-anchor="family:agong"]').click({ force: true })
    await page.waitForTimeout(8800)
  }),
  // Everyone hops in; once the cousins glow she taps Ken, and he puts his phone down ("Whoa! Cool!").
  thaiHome('trip-cousins-look-up', 9, 'gather', async (page) => {
    await page.waitForTimeout(3000)
    await page.locator('[data-anchor="family:ken"]').click({ force: true }).catch(() => {})
    await page.waitForTimeout(5800)
  }),
  { ...thaiTrip('trip-replay-pass', 2, 'invite?replay=1', [], 3800), act: async (page) => {
    await page.getByRole('button', { name: 'Yes', exact: true }).dispatchEvent('click').catch(() => {})
    await page.waitForTimeout(1900)
  } },
)
// The photo wall in the house: tap Kaylee's trip photo and it swings on its nail and comes close.
motion.push({
  name: 'photo-wall',
  seconds: 2,
  setup: async (page, base) => {
    await page.evaluate(seedWall)
    await page.goto(`${base}#/world/thailand/hub/downstairs?at=photos`)
    await page.waitForFunction(() => window.__thaiHouseQA?.().mode, null, { timeout: 20000 })
    await page.waitForTimeout(2000)
  },
  act: async (page) => {
    await page.locator('[data-anchor="trip:wall:boat-trip"]').click({ force: true }).catch(() => {})
    await page.waitForTimeout(1900)
  },
})

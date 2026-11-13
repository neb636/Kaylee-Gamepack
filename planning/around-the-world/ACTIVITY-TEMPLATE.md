# Toy notes template

**Player name:** Only the landing page and Egypt’s cartouche / China’s brush name-writing activities may say or show her name. All other dialogue, labels, stamps, finales and trophies use natural name-free wording (2026-11-11).

The builder's notes for one toy (an activity, a stop on a trip, a rebuild), written by the agent after the user picks its
pitch card (the `pitch` skill). **The user doesn't read these:** they see the pitch card, the table read and the reel. The
notes are for you and the next agent, in `planning/around-the-world/<country>/<toy>.md` (or the country's `<country>.md` when it has no folder). Read `docs/play-design.md`
first. If a field is hard to fill in, the toy isn't ready to build yet. Keep it short: notes that read like a story can
hide play that is thin, so the **verbs** and **numbers** matter more than the prose.

```markdown
### <n>. <Name> <emoji> (<place>: <what it teaches>)

**One-line pitch:** <friend> needs <thing>; Kaylee <core verb>s to <payoff>.

**The toy (core verb):** <the one thing her finger does, e.g. "grab the gondola and steer it through the canal">.
- How it feels: <the physics / response: drifts, bobs, overshoots, splashes, squishes...>
- Why it's fun with no goal: <one sentence>. Greybox test: <what the placeholder version is>.

**How the verb deepens (3 steps, same verb):**
1. <easy: just the toy, nothing to get wrong>
2. <richer: something new to do with the same verb>
3. <a twist / a little harder: still the same verb>
Side verb (at most one): <e.g. paint the mask> or none.

**Her choices:** <where she decides something: which way, which color, which friend, how big>.

**Pokeables (5+ things that react and aren't the answer):** <cat in a window, pigeons, a bell...>

**Silly moments (instead of failure):** <what happens when she does something odd>.

**Can she lose? (races and contests only):** <none, or: how often (she wins most of the time), what a loss looks
like (short, kind, go again at once), how it eases off after a miss or two>.

**Story frame (at most 2 lines before her hands are busy):** <friend line> / <Sparkle line>.
When Sparkle talks during play: <only when something new appears, or after ~8 s stuck: list those moments>.

**What it teaches, by doing:** <the lesson, and the action that teaches it>. Tap-to-hear facts: <list>.

**Payoff (visible, builds up while she plays):** <what grows / changes / joins the band>.

**Replay:** <what's different next time (random friend, new boat, saved creation)>.

**Numbers:** about <N> touches (aim 20-40), <M> min of play (1.5-3), <K> spoken lines before the first touch (≤2).

**Camera and art:** <camera, e.g. side view>. Layers: <sky / far / mid / near / foreground>. Sprites: <list>.
Puppets: <who>. Anything she touches or follows is in the art, not drawn over it. No emoji in the scene.

**Screens:** the logical stage for wide and tall, and what must stay inside the safe zone on every device.

**Sections and carried state:** the sections in play order (each gets a deep link,
`#/world/<place>/<activity>/<section>`), and every value a later section needs from an earlier one (a color she picked,
the toppings, how many she caught) as a URL param with a default. See "Screens, scenes and deep links" in `docs/building.md`.

**Tech:** DOM + `useGameLoop` / `PlayArea` / Phaser (say why), and the riskiest piece to prototype first.
```

## How it gets built

The toy loop in `AGENTS.md`: the user picks the pitch, hears the table read, watches Kaylee play it, and ships it after the
reel. Between those check-ins you build, robot-play and fix on your own, on one branch with one PR. Log what you built
and what changed from these notes at the bottom of this file as you go (date, what, why), so the next agent can pick
it up.

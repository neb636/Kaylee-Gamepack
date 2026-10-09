# Activity plan template

Copy this for each activity in a country plan (or for a rebuild). Read `docs/play-design.md` first. If a field is hard
to fill in, the activity isn't ready to build yet. Keep it short: a plan that reads like a story can hide play that is
thin, so the **verbs** and **numbers** matter more than the prose.

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

**Story frame (at most 2 lines before her hands are busy):** <friend line> / <Sparkle line>.
When Sparkle talks during play: <only when something new appears, or after ~8 s stuck: list those moments>.

**What it teaches, by doing:** <the lesson, and the action that teaches it>. Tap-to-hear facts: <list>.

**Payoff (visible, builds up while she plays):** <what grows / changes / joins the band>.

**Replay:** <what's different next time (random friend, new boat, saved creation)>.

**Numbers:** about <N> touches (aim 20-40), <M> min of play (1.5-3), <K> spoken lines before the first touch (≤2).

**Camera and art:** <camera, e.g. side view>. Layers: <sky / far / mid / near / foreground>. Sprites: <list>.
Puppets: <who>. Anything she touches or follows is in the art, not drawn over it. No emoji in the scene.

**Screens:** the logical stage for wide and tall, and what must stay inside the safe zone on every device.

**Tech:** DOM + `useGameLoop` / `PlayArea` / Phaser (say why), and the riskiest piece to prototype first.
```

## Build gates (one activity per PR)

1. **Plan** with this template. Dad reads it.
2. **Greybox toy:** the core verb with placeholder shapes, no generated art and no voices, on the PR preview.
   **Stop: Dad plays it on the iPad.** If it isn't fun yet, change the toy, not the decoration.
3. **Art and puppets:** layered scene and sprites in one camera, puppets next to their references.
4. **Full loop:** story, voices, payoff, facts; run QA including the fun check; fix and repeat.

An approval to "build it in one go" applies to that one activity, not to the ones after it.

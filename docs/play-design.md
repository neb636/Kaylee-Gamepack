# Play design: make a toy first, then the game

Read this before planning or building any Around the World activity (and it helps for school-paper games too).
`AGENTS.md` has the hard rules; this file says what makes an activity *fun*, with examples of what went wrong.

The model is **Toca Boca** and **Sago Mini**: apps that 3-5 year olds play for ages without being able to read.
Sago Mini Boats is the closest to us: Harvey the dog drives a boat (you can pick a pickle boat or a bathtub), you
grab the boat and steer it yourself, it dives underwater and flies over waves, and you stop to collect treasure,
share an ice cream and meet friends. Toca Boca calls its apps *digital toys*: props with no script, no score, no wrong
way to play, things that behave roughly like real things but allow the absurd (put the cake on the toilet and
nothing says "wrong").

We keep our story, learning and stamps, but the minute-to-minute play should feel like those apps.

## The eight principles

1. **A toy before a game.** Every activity has one *core verb* (row, pour, steer, spin, squish, stack) that is fun
   with no goal at all. Test: would she keep doing it for 30 seconds if nobody asked her to? If not, the rest of the
   activity can't save it. Build this first, with placeholder shapes, and play it on the iPad.
2. **Deepen the verb; don't swap it.** The same verb, three ways harder or richer (new obstacles, new places, new
   combinations, a twist), not four different one-off verbs. At most one side verb per activity. Kids master a verb
   and then love showing off with it.
3. **Touch the real thing.** Her finger grabs the boat, pulls the oar, tilts the jug. No invisible swipe zones, no
   arrow buttons, no "tap the sign" when she could steer there herself. If the thing she should touch isn't obvious,
   it pulses or a friend points at it; there is no text to read.
4. **Everything reacts.** Every object on screen answers a tap with motion + sound (and sometimes a word): windows
   open and a cat waves, pigeons scatter, a duck quacks and dives, a boat toots. Hidden surprises reward curiosity.
   A scene with nothing to poke except the "right answer" is a worksheet.
5. **Goals are invitations, not quizzes.** A friend wants something ("Lupa wants to go to the pink house!") and she
   gets there by playing. The learning is in the doing: she steers left to reach the left canal, so she *uses* left
   and right; she climbs and gets cold, so she *feels* higher is colder. Picking the right card is a small extra at
   most.
6. **Silly is good, and nothing is wrong.** Odd play gets a funny reaction, not an "oops": bump a bridge and the hat
   pops off, overfill the cup and it's a fountain. Offer absurd choices (a bathtub gondola). Wrong-answer hints are
   for the few real questions, not for play.
7. **A quiet guide.** Sparkle speaks when something new appears, or when Kaylee hasn't made progress for about 8
   seconds. Not after every action. Friends react with short lines and sounds. Silence while her hands are busy is
   fine; she's playing.
8. **A world, not a picture.** The scene is made of layers that move at different speeds (sky, far houses, near
   houses, water, foreground), so moving through it feels like travelling. Things she uses are part of the art (a
   trail painted into the mountain), not lines drawn by code over a painting.

## What went wrong in Italy's first Venice and Etna (October 2026)

Both followed the plan to the letter and the checks passed, but they weren't fun. Keep this list in mind:

| What we built | Why it wasn't fun | Do this instead |
|---|---|---|
| Swipe anywhere on the water; the gondola stays put while one painting of six houses slides by, every other copy flipped | Her finger isn't touching the boat or the oar; nothing on the water to steer around or react to; the street repeats | Grab and steer the boat (or pull the oar); a layered world with things on the water; the canal changes as she goes |
| "Turn left!" → tap one of two arrow signs, in a separate front-view picture | A quiz question in the middle of a boat ride | Steer into the left canal herself; the friend's target is visible down that canal |
| Duck: one tap when the gondola stops at the bridge | A button press with no play | Bridges of different heights come along while she rows; she decides when to duck (and if she doesn't, Gino's hat pops off: silly, not failure) |
| Climb: drag Nino along a zig-zag line drawn over the treetops | Tracing a line; the line isn't part of the mountain | Climbing with things to do on the way (a stream to cross, a rock to push), the trail painted into the art |
| "Higher is colder" told by a thermometer at the side of the screen | She listens instead of doing | Snow starts falling, Nino's breath steams, he shivers until *she* puts the scarf on him |
| Five snow piles that look like the clouds | Confusing; the art for two things looked alike | Distinct art, and snow she can roll bigger |
| About one spoken line per touch; "3-5 touches per activity" | Little play, lots of listening | Long stretches of quiet play, Sparkle only when something is new or she's stuck |

The deeper causes: the old rule said 3-5 touches per activity (what bored her was talk and forced easy rounds, never
touching); the plan gave each activity four one-off mechanics; three activities and the finale were built in one
session without a playable prototype; and QA only checked layout and whether it could be finished.

## The fun check (planner, builder and QA all use it)

For each activity, answer honestly:

- **Core verb:** what is it, and is it fun with no goal? (Greybox test on the iPad.)
- **Hands busy:** after the first 1-2 lines, what share of the time is she doing something rather than listening or
  waiting? Aim for most of it. `qa-pacing.mjs` reports talk per touch and seconds with nothing to touch.
- **Touches:** about 20-40 in 1.5-3 minutes, nearly all of them *playing* (steering, pouring, building), not answering.
- **Choices:** at least a few moments where *she* decides (which way, which color, which friend first, how big).
- **Pokeables:** at least 5 things in each scene that react to a tap and aren't the answer.
- **Grows:** does the verb get richer three times? Does something visibly build up (the payoff)?
- **Surprise:** at least one funny or magical moment she'll want to show Dad.
- **Learning by doing:** is the paper's (or country's) lesson something she *does*, not just hears?
- **Replay:** would she want to play it again tomorrow? What's different the second time (random friends, a new boat)?

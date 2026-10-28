# 🦄 Kaylee's Gamepack

A pink, unicorn-filled learning app made just for Kaylee. In **Around the World** she flies Sparkle's hot-air balloon
from country to country, helps a friend in each one, collects passport stamps and stickers, and wins a gold trophy
with **KAYLEE** engraved on it. **Thailand**, the family's country, is in 3D: she flies a toy plane around a map of
Thailand to Agong's house, where she walks around as a unicorn, and to the places the family loves.

**Play:** https://neb636.github.io/Kaylee-Gamepack/ · [Jump to a game section](#jump-to-a-game-section)
(iPad: open in Safari → Share → **Add to Home Screen**. It opens full-screen like a real app.)

**The world map** comes in two views (the two buttons in its top bar; she keeps the one she used last):
- [The map](https://neb636.github.io/Kaylee-Gamepack/#/world?view=map)
- [The game shelf](https://neb636.github.io/Kaylee-Gamepack/#/world?view=list) (every game as a picture card, a row per country and per Thailand trip; ❤️ favorites, 🎁 surprise)

**3D character lab** (development tool, every 3D character on a turntable: poses, actions, lines, outfits, lighting): 
- [Kaylee](https://neb636.github.io/Kaylee-Gamepack/#/world/characters/kaylee)
- [Kaylee in a look from her wardrobe](https://neb636.github.io/Kaylee-Gamepack/#/world/characters/kaylee?look=crown,stars,fairy,tutu,sneakers,dress-mint,hair-pink,fur-sky) (the Look panel: her things and the paint)

**Camera lab** (development tool, add `?cam=1` to any 3D section: the game in an iPad-sized frame with camera controls,
guides and a "Copy for agent" note to bake the camera into the game):
- [The Barber Salon in iPad landscape](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/barber?cam=1&cam.frame=ipad-wide)

**Feel lab** (development tool, add `?feel=1` to any section: sliders over the playing game for how it feels, a live
graph, and a "Copy for agent" note with the numbers to bake in):
- [The Nan mountain road's steering](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/drive?road=valley&weather=sun&feel=1)
- [The Nan Mountain Cup's kart: steering, the mushrooms' bounce, the rivals' rubber band](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=forest&feel=1)
- [The Nan Mountain Cup's mud and the cloud: per puddle, how much faster, the waterfall's and the blossoms' bursts, how far she sees in the cloud](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=steps&feel=1)
- [Canada's train: how it feels to push](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=quebec&feel=1)
- [Canada's Mountain Bike: the steering, the lean and the bounce](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bike/berms?trail=blue&feel=1)
- [Canada's Sugar Snow: the pour, the setting and the roll](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/taffy/pour?feel=1)
- [Canada's Campfire Night: the flashlight's size and softness, how it follows her finger, finding things, roasting](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/campfire/eyes?feel=1)
- [Canada's Red Canoe: stroke power, turn and drag](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/glide?feel=1) ([the finger pull](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/glide?paddle=pull&feel=1))
- [Canada's Animal Bridge: how mama follows her finger, how the line follows mama, planting the bridge](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bridge/elk?feel=1)
- [Canada's Whale Watch: the boat's steering and its bounce on the waves, finding the animals](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/spouts?feel=1) ([with the wheel](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/spouts?steer=wheel&feel=1))
- [Canada's Salmon Leap: the flick's power, the arcs, the aim help, the rock, the log and the bears' boops](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/salmon/falls?feel=1)


**Offline:** after it opens once on wifi it saves every game, picture and voice, so it plays in the car or on a plane.
Online it always loads the latest version; offline the YouTube videos are hidden. After a new deploy, open it once on
wifi before a trip so it saves the changed files.

## Jump to a game section

Use these links to test what is built without playing through earlier stories. They open the published main build,
and each section starts with its default state. A change on a pull request is available at the preview linked in that
PR's **🔗 Test this** block. The same list, generated from the app, is also at `#/world/sections`.

For local testing, run `npm run dev` and replace `https://neb636.github.io/Kaylee-Gamepack/` in any link with
`http://localhost:5173/`, keeping the path. Sections in each activity are listed in play order. This list is written
from each activity's `sections.ts` by `npm run sections-readme` (edit those, not the list).

<!-- sections:start (generated by scripts/sections-readme.mjs from each sections.ts: edit those, not this) -->

### Australia

**Red Outback**: [Pip is hot](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/outback/story) · [Pack for the sun](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/outback/pack) · [Hop to water](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/outback/water) · [Hop to Mama](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/outback/mama)

**Gum Tree Forest**: [Koko is hungry](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/forest/story) · [Feed two leaves](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/forest/feed-2) · [Feed four leaves](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/forest/feed-4) · [Sing Koko to sleep](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/forest/sleep)

**Great Barrier Reef**: [Explore the reef](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/reef/story) · [Find the turtle](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/reef/turtle) · [Find the clownfish](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/reef/clownfish) · [Find the starfish](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/reef/starfish) · [Find the octopus](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/reef/octopus)

**Starry Night**: [Meet Kooky](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/stars/story) · [Light the stars](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/stars/sky) · [Build the flag](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/stars/flag) · [Find the flag](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/stars/quiz)

**Crocodile River**: [Meet Chompy](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/croc/story) · [Hatch the eggs](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/croc/hatch) · [Carry the babies](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/croc/ride) · [Swim to the river](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/croc/swim) · [Snap with Chompy](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/croc/snap)

**Beach Postcard**: [A postcard home](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/postcard/story) · [Color the postcard](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/postcard/color) · [Send it home](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/postcard/send)

**Finale**: [The sunset party](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/party/story?stamps=all) · [Mama dances](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/party/mama?stamps=all) · [Koko dances](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/party/koko?stamps=all) · [Shelly dances](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/party/shelly?stamps=all) · [Kooky dances](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/party/kooky?stamps=all) · [Chompy dances](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/party/chompy?stamps=all) · [Pat dances](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/party/pat?stamps=all) · [Party fireworks](https://neb636.github.io/Kaylee-Gamepack/#/world/australia/party/fireworks?stamps=all)

### Egypt

**Pyramid Builders**: [Jamal’s story](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/pyramid/story) · [Three stones](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/pyramid/row-3) · [Two stones](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/pyramid/row-2) · [One stone](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/pyramid/row-1) · [Golden capstone](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/pyramid/capstone)

**Secret Passage**: [Miu’s story](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/passage/story) · [First maze](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/passage/maze-1) · [Two scarabs](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/passage/maze-2) · [Deeper tunnels](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/passage/maze-3) · [Treasure room](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/passage/treasure)

**Wake the Sphinx**: [Story](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/sphinx/story) · [Face](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/sphinx/face) · [Paws](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/sphinx/paws) · [Back](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/sphinx/back) · [Pot](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/sphinx/pot) · [End](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/sphinx/end)

**Sail the Nile**: [Miu’s story](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/nile/story) · [First sail](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/nile/sail-1) · [First farm](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/nile/farm-1) · [Second sail](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/nile/sail-2) · [Second farm](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/nile/farm-2) · [Green Nile](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/nile/end)

**Write Like a Pharaoh**: [Scribe story](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/scribe/story) · [Letter K](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/scribe/k) · [Letter A](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/scribe/a) · [Letter Y](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/scribe/y) · [Letter L](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/scribe/l) · [First E](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/scribe/e-1) · [Second E](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/scribe/e-2) · [Golden cartouche](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/scribe/framed)

**Miu's Market**: [Market story](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/market/story) · [Koshari](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/market/koshari) · [Extra onions](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/market/onions) · [Mint tea](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/market/tea)

**Finale**: [Light show story](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/story?stamps=all) · [Wake friend 1](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/wake-1?stamps=all) · [Wake friend 2](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/wake-2?stamps=all) · [Wake friend 3](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/wake-3?stamps=all) · [Wake friend 4](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/wake-4?stamps=all) · [Wake friend 5](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/wake-5?stamps=all) · [Wake friend 6](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/wake-6?stamps=all) · [Raise the flag](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/flag?stamps=all) · [Fireworks](https://neb636.github.io/Kaylee-Gamepack/#/world/egypt/party/fireworks?stamps=all)

### China

**Bamboo Forest**: [Bao Bao is hungry (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/bamboo/story) · [Grow one shoot three tall](https://neb636.github.io/Kaylee-Gamepack/#/world/china/bamboo/r1) · [First munch](https://neb636.github.io/Kaylee-Gamepack/#/world/china/bamboo/break1) · [Make one taller](https://neb636.github.io/Kaylee-Gamepack/#/world/china/bamboo/r2) · [Second munch](https://neb636.github.io/Kaylee-Gamepack/#/world/china/bamboo/break2) · [Tap the tallest](https://neb636.github.io/Kaylee-Gamepack/#/world/china/bamboo/r3a) · [Tap the shortest](https://neb636.github.io/Kaylee-Gamepack/#/world/china/bamboo/r3b) · [Payoff: climb, bend, tumble](https://neb636.github.io/Kaylee-Gamepack/#/world/china/bamboo/payoff)

**The Great Wall**: [Hou Hou knocked bricks off (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/wall/story) · [Slide the wall to follow Hou Hou](https://neb636.github.io/Kaylee-Gamepack/#/world/china/wall/follow) · [Drag the missing brick](https://neb636.github.io/Kaylee-Gamepack/#/world/china/wall/brick) · [Find the beacon tower](https://neb636.github.io/Kaylee-Gamepack/#/world/china/wall/beacon) · [Signal fires along the wall](https://neb636.github.io/Kaylee-Gamepack/#/world/china/wall/fire)

**Hotpot Night**: [Nai Nai’s hotpot (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/story) · [Bao Bao’s noodles: drop them in](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/noodles-drop) · [Noodles: scoop with chopsticks](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/noodles-scoop) · [Noodles: spin to Bao Bao](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/noodles-spin) · [Noodles: Bao Bao says thank you](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/noodles-serve) · [Hong’s bok choy: the mild side](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/bokchoy-drop) · [Bok choy: scoop](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/bokchoy-scoop) · [Bok choy: spin to Hong](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/bokchoy-spin) · [Bok choy: Hong says thank you](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/bokchoy-serve) · [Nai Nai’s two dumplings](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/dumplings-drop) · [Dumplings: scoop two](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/dumplings-scoop) · [Dumplings: spin to Nai Nai](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/dumplings-spin) · [Dumplings: Nai Nai says thank you](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/dumplings-serve) · [Everyone eats together](https://neb636.github.io/Kaylee-Gamepack/#/world/china/hotpot/finale)

**The Magic Brush**: [Ma Liang’s magic brush (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/story) · [人 person](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/ren) · [山 mountain](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/shan) · [日 sun](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/ri) · [木 tree (and a bird)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/mu) · [大 big (Bao Bao copies)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/da) · [月 moon (evening)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/yue) · [Her name in Chinese](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/name) · [Stamp the red chop](https://neb636.github.io/Kaylee-Gamepack/#/world/china/brush/stamp)

**The Great Race**: [The Jade Emperor’s race (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/story) · [Mouse hops onto Ox](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/board) · [Paddle Ox across](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/paddle) · [Tiger swims by himself](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/tiger) · [Stepping stones for Rabbit](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/stones) · [Dragon makes rain](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/rain) · [Winners’ steps: who came first?](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/steps) · [Zodiac wheel: her year, the horse](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/wheel) · [Wake the sleepy cat](https://neb636.github.io/Kaylee-Gamepack/#/world/china/race/cat)

**Bullet Train**: [All aboard (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/train/story) · [Harbin: snow, mittens, a scarf for the tiger](https://neb636.github.io/Kaylee-Gamepack/#/world/china/train/harbin) · [Hainan: beach day](https://neb636.github.io/Kaylee-Gamepack/#/world/china/train/hainan) · [Gobi: hot day, cold night](https://neb636.github.io/Kaylee-Gamepack/#/world/china/train/gobi) · [Himalayas: a coat with the yak](https://neb636.github.io/Kaylee-Gamepack/#/world/china/train/himalayas)

**Dumpling House**: [Arrive on the Bund (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/arrive) · [Walk through the old town](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/walk) · [Kitchen 1: Grandpa Turtle's four dumplings](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/k1) · [Dining 1: nibble, sip, eat](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/d1) · [First service done](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/break1) · [Kitchen 2: bunny colors and the goose](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/k2) · [Dining 2: two tables and tea](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/d2) · [Lunch rush done](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/break2) · [Kitchen 3: Bao Bao's six (sneaky monkey)](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/k3) · [Dining 3: Bao Bao gobbles them](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/d3) · [Payoff](https://neb636.github.io/Kaylee-Gamepack/#/world/china/dumplings/payoff)

**Finale**: [Friends join the dragon](https://neb636.github.io/Kaylee-Gamepack/#/world/china/party/arrive?stamps=all) · [Lead the dragon around the plaza](https://neb636.github.io/Kaylee-Gamepack/#/world/china/party/drive?stamps=all) · [Drum and gong: dance wave](https://neb636.github.io/Kaylee-Gamepack/#/world/china/party/drum?stamps=all) · [Tap the sky: fireworks](https://neb636.github.io/Kaylee-Gamepack/#/world/china/party/sky?stamps=all) · [Raise the flag](https://neb636.github.io/Kaylee-Gamepack/#/world/china/party/flag?stamps=all) · [Open the red envelope](https://neb636.github.io/Kaylee-Gamepack/#/world/china/party/envelope?stamps=all)

### Italy

**Pizzeria in Naples**: [Arrive in Naples (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/pizzeria/arrive) · [Queen Margherita's pizza (1889)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/pizzeria/queen) · [First service done](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/pizzeria/break-1) · [Signora Bufala: 5 olives, halves](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/pizzeria/bufala) · [Gino: half and half, quarters](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/pizzeria/gino) · [Lunch rush done](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/pizzeria/break-2) · [Her own pizza (Cesare sneaks cheese)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/pizzeria/own) · [Payoff: chef hat and mandolin](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/pizzeria/payoff)

**Olive Grove**: [Meet Spina (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/olives/story) · [Comb the branches](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/olives/grove) · [Green to black, sort, taste](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/olives/ripen) · [The olive mill](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/olives/mill) · [Pour to the line (full, half)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/olives/pour) · [Payoff: bruschetta and tambourine](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/olives/payoff)

**The Colosseum**: [Meet Cesare (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/colosseum/story) · [Pull the ropes: sun-shade](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/colosseum/shade) · [Trapdoors I, II, III](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/colosseum/doors-1) · [Trapdoors IV and V](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/colosseum/doors-2) · [Every door opens, stadium wave](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/colosseum/finale) · [Payoff: Cesare's bow and Roman horn](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/colosseum/payoff)

**Venice**: [Arrive with Gino (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/arrive) · [Pick a boat](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/pick) · [Cruise the canal](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/cruise) · [First friend riding: LEFT or RIGHT](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/ride-1) · [Two friends wave: who goes first?](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/two-friends) · [Last friend: the far ride](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/last-friend) · [Take Gino to the mask shop](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/trip) · [Paint a mirror mask](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/mask) · [Night: lanterns and fireworks](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/venice/finale)

**Snow on a Volcano**: [Arrive at the beach (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/arrive) · [Lead Nino off the beach](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/beach) · [Lemon grove: pick fruit](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/grove) · [Chestnut forest and stream](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/forest) · [Snow falling: cold, the scarf](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/cold) · [Snow field: bump five drifts](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/snow) · [Full cart: zoom back down](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/full) · [Granita stand: three friends](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/granita) · [Payoff: Nino's piano](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/etna/payoff)

**Trevi Fountain**: [The fountain is dry (story)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/trevi/story) · [Find the spring](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/trevi/spring) · [Arches, round 1 (three gaps)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/trevi/arches-1) · [Arches, round 2 (four gaps, two alike)](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/trevi/arches-2) · [Water on: follow it to Rome](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/trevi/water-on) · [The fountain fills, toss coins](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/trevi/fountain)

**Finale**: [Light the candles](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/candles?stamps=all) · [Baby owl: piano, soft](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/owl?stamps=all) · [Crowd dances: forte, loud](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/dance?stamps=all) · [Three solos](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/solo?stamps=all) · [The wishing star](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/star?stamps=all) · [Lupa sings](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/lupa?stamps=all) · [Lupa's high note](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/high?stamps=all) · [Catch the roses](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/roses?stamps=all) · [Frecce Tricolori: paint the flag](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/sky?stamps=all) · [Picnic: hug Lupa](https://neb636.github.io/Kaylee-Gamepack/#/world/italy/party/picnic?stamps=all)

### Peru

**Luna's Fluffy Day**: [Meet Luna](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/alpaca/story) · [Brush Luna](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/alpaca/brush) · [Clip Luna](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/alpaca/clip) · [Clip the family](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/alpaca/family) · [Dye the yarn](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/alpaca/yarn) · [Dress in hats](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/alpaca/hats) · [Family photo](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/alpaca/photo)

**Tika's Mountain Terraces**: [Meet Tika](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/story) · [First wall](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/wall-1) · [First crops](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/seeds-1) · [Second wall](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/wall-2) · [Second crops](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/seeds-2) · [Third wall](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/wall-3) · [Third crops](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/seeds-3) · [Cloud wall](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/wall-4) · [Summit photo](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/machu-picchu/photo)

**Pepa's Penguin Cliff**: [Meet Pepa](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/penguins/story) · [Splash and dive](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/penguins/splash) · [Catch fish](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/penguins/fish) · [Feed the chicks](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/penguins/feed) · [New chick](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/penguins/twist) · [First swim](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/penguins/swim) · [Penguin parade](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/penguins/parade)

**Coco's Canyon Glide**: [Meet Coco](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/condor/story) · [Grab Coco](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/condor/start) · [Warm swirls](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/condor/morning) · [Lead Pluma](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/condor/follow) · [High ridge](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/condor/ridge) · [Pluma flies](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/condor/solo) · [Condor photo](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/condor/finale)

**Rosa's Rainy River**: [Meet Rosa](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/river/story) · [Wake the forest](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/river/forest) · [Fill the river](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/river/river) · [Rosa swims](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/river/swim) · [Fill the lagoon](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/river/lagoon) · [Seat the friends](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/river/pads) · [Rainbow photo](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/river/rainbow)

**Finale**: [Balloon preview](https://neb636.github.io/Kaylee-Gamepack/#/world/peru/party/soon?stamps=all)

### Thailand

**Home base**

- **The Thailand map**
  - [The map](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand)
  - [Home from a trip: the stamp lands on Krabi](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/map?stamp=boat-trip)
- **Agong's house**
  - [Arrive by tuk-tuk](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/arrive)
  - [In front of Agong's house](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/street)
  - [Downstairs](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/downstairs)
  - [Kaylee's room upstairs](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/upstairs) ([in a look from her wardrobe](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/upstairs?look=crown,hearts,fairy,dress-mint))
  - [Her wardrobe: doors open (any link takes ?look=crown,hearts,fairy,tutu,sneakers,dress-mint,hair-pink,fur-sky)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/wardrobe)
  - [Her wardrobe: the hats drawer out](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/wardrobe?drawer=head) ([face](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/wardrobe?drawer=face), [back](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/wardrobe?drawer=back), [outfit](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/wardrobe?drawer=outfit), [feet](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/wardrobe?drawer=feet))
  - [Her wardrobe: the paint drawer out](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/wardrobe?drawer=paint)
  - [Her wardrobe: four pictures of looks on the door](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/wardrobe?drawer=head&door=crown,hearts,tutu;bow,fairy,dress-mint;cap,stars,cape;overalls,boots,hair-pink,fur-sky)
  - [Family photo](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/hub/family)

**Captain Kaylee's Boat Trip**

- **Getting there**
  - [Mommy asks: ready for a trip?](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/invite)
  - [Pack the suitcase](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/pack)
  - [Goodbye at Agong's house, into Aunty Sri's van](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/goodbye)
  - [The x-ray belt](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/airport)
  - [Window seat: seatbelt and takeoff](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/takeoff)
  - [Window seat: tray, snacks, the elephant below](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/fly)
  - [Landing in Krabi (and the signpost: 🐘 or 🚤)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/land) ([after the map's short flight: straight to the signpost](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/land?quick=1))
- **Baan Chang**
  - [The songthaew to the elephant cafe](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/chang)
  - [The bamboo sign wall and a photo](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/sign)
  - [The cafe, her chocolate milk (and an iced coffee for Daddy)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/drinks)
  - [Down the boardwalk through the palms](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/boardwalk)
  - [Bananas and sugarcane for Mali and Khanom](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/feed)
  - [Everyone's favorite food](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/favorites)
  - [Lamyai wanders over; Khanom sneaks a sip](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/lamyai)
  - [The rainbow splash, the real elephants video, then 🚤 or ✈️🏠](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/splash) ([after the boat: ✈️🏠](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/splash?been=bay))
- **Phang Nga Bay**
  - [Tie ribbons on the longtail at the pier](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/pier)
  - [Open water: where to, captain?](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/bay) ([iPhone tilt to steer](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/bay?steer=tilt))
  - [Koh Panyee: the floating football field](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/village)
  - [Into the canoe, under the low roof](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/cave)
  - [The hong, a secret lagoon inside the island](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/hong)
  - [The boat race: three laps against the village kids and the macaque](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/race) ([iPhone tilt to steer](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/race?steer=tilt), [finger on any device](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/race?steer=finger))
  - [The race podium and the trophy](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/podium)
  - [The Nail Island and the photo](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/nail)
  - [The ride back at sunset, and the porpoise (then ✈️🏠, or 🐘 first)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/sunset) ([after the elephants: ✈️🏠](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/sunset?been=chang))
- **Home**
  - [The photo for Agong's wall, and the stamp](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/boat-trip/home)

**Mall Day at ICONSIAM**

- **Getting there**
  - [Mommy asks: where shall we go? (🚤 or 🛝🍕)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/invite)
  - [Goodbye at Agong's house (hugs), into Mommy's grey Veloz](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/goodbye)
  - [ICONSIAM: pull up by the river, the lift to 6, shoes off, socks on, the height chart](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/arrive)
- **HarborLand mini games**
  - [HarborLand: walk the hall and pick a mini game](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/hall) ([the 🗺️ map](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/hall?map=1&games=vet,cafe,race))
  - [The Vet Clinic: heal the puppy, the pony and the baby elephant](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/vet)
  - [The Barber Salon: Daddy's new look, grow and snip](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/barber)
  - [The Barber Salon: colors, the dryer and bows](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/barber?round=2)
  - [The Barber Salon: kids come in with picture cards](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/barber?round=3)
  - [Cafe & Cake: blend, pour and serve drinks to Daddy and Mommy](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/cafe)
  - [The Racing Slide: climb, 3-2-1, scoot down into the balls](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/race)
  - [Little Land: stack the giant foam bricks, copy the card, build taller than Daddy](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/blocks)
  - [The Golden Mountain: climb hold by hold, counting, ring the bell, zoom down the steel slide, then race Daddy](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/mountain)
  - [Muay Thai: the wai kru, then free punching](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/boxing)
  - [Muay Thai: punch along on the beat](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/boxing?round=2)
  - [Muay Thai: Daddy's pad and the big kick](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/boxing?round=3)
  - [The Sky Pod: slap the lights, copy the tune, race Daddy to ten](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/skypod)
  - [The Big Frame: climb up, slide down (the mask, the dragons, the roller, the donut, the zip line), the cannon at Daddy](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/frame)
  - [HarborLand: Daddy's tummy rumbles, Mommy asks: pizza time?](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/hungry)
- **The Pizza Company**
  - [Pick a pizza](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/menu)
  - [Pull the cheesy slices and share them fairly](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/share)
- **Home**
  - [The pizza box for Agong, the cousins' phones down, the photo on his wall, the stamp](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/mall-trip/home)

**Road Trip to Nan**

- **Getting there**
  - [Mommy asks: where shall we go? (🚤, 🛝🍕 or 🏔️🚙)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/invite)
  - [Pack for the mountains: the raincoat, the rain boots, the umbrella](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/pack)
  - [Goodbye at Agong's house, into Aunty Sri's van](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/goodbye)
  - [The airport: the suitcase on the x-ray belt](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/airport)
  - [The window seat: seatbelt on, take off](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/takeoff)
  - [The window seat: the tray, snacks, Thailand below, north to Nan](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/fly)
  - [Landing in the green valley at Nan, then the Nan map](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/land)
- **The Nan map and the mountain road**
  - [The Nan map: pick a stop, or drag the little Pajero there](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/map)
  - [The Nan map after two stops (stamps, the airport opens)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/map?stops=mushrooms,rice)
  - [The Nan map with the Cup's stamp on Nan town](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/map?stops=mushrooms,cup&cup=1)
  - [The mountain road: through Nan town to the market](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/drive?road=city) ([on to the Cup race ground](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/drive?road=city&to=cup&cup=1))
  - [The mountain road: the rice fields to the mushroom farm](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/drive) ([from the map: the farm opens at the end](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/drive?road=valley&to=mushrooms))
  - [The mountain road: up Doi Phu Kha into the clouds](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/drive?road=sky)
  - [The mountain road: down the "number 3" road](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/drive?road=three)
- **Mushroom farm**
  - [Mist the bags until the mushrooms pop](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/mushrooms)
  - [Pick them into the basket (keep misting one: giant!)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/mushrooms?round=2)
  - [Pink and golden mushrooms](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/mushrooms?round=3&basket=grey6)
  - [Top the pizza with her basket, bake it, share it, then the real mushrooms video](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/mushrooms?round=pizza&basket=grey6,pink4,gold2)
- **Rice farm**
  - [Lead Kaylee through the paddies, plant the seedlings (open the gates)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/rice?round=plant)
  - [Shoo the birds while the rice grows golden](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/rice?round=grow)
  - [Cut the golden rice into bundles](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/rice?round=harvest)
  - [Swing the bundles and bang the grains into the basket (then the sticky rice)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/rice?round=thresh)
  - [Stop Time Cafe: sticky rice, pink milk, Mommy's photo and the rice video on the deck](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/rice?round=deck)
- **Bo Kluea salt wells**
  - [Dip the bucket in the well, pour the brine into the pan](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/salt)
  - [Feed the fire till the brine boils down](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/salt?round=2)
  - [Scrape the salt into the basket, the bags on the shelf, then the real salt video](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/salt?round=3)
- **The Nan Mountain Cup (greybox)**
  - [The race ground: the board, pick a track](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/cup) ([one race done](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/cup?cup=forest:1&lose=steps))
  - [The Mushroom Forest race: she wins by a nose](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=forest&result=win) ([Moon wins by a nose, she's second](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=forest&result=lose))
  - [The Rice Steps Rally: puddles, mud and the waterfall, she wins by a nose](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=steps&result=win) ([Grandma Taeng wins](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=steps&result=lose))
  - [The Cloud Top Climb: the lanterns in the cloud and the blossoms, she wins by a nose](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=cloud&result=win) ([Pao wins](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/race?track=cloud&result=lose))
  - [The podium: gold, the home rival on 2](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/podium?track=forest&place=1)
  - [The podium: silver, a high five to Grandma Taeng and her ribbon on the kart](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/podium?track=steps&place=2&cup=forest:1,steps:2)
  - [The last race's podium, then 🏆](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/podium?track=cloud&place=1&cup=forest:1,steps:2,cloud:1)
  - [The Cup ceremony: the scoreboard, lift the Cup, the photo, the stamp on Nan town](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/cup-win?cup=forest:1,steps:2,cloud:1)
- **Viewpoint and home**
  - [The "number 3" from the viewpoint: one, two, three, Mommy's photo, ✈️🏠](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/three?stops=mushrooms,rice,salt)
  - [Home: the flight, Agong's photo, the frame on his wall, the stamp](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/nan-trip/home)

**Finale**: [Family party (coming soon)](https://neb636.github.io/Kaylee-Gamepack/#/world/thailand/party/soon?stamps=all)

### The Poles

**Home base**

- [Spin the globe](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/hub/globe) ([north side](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/hub/globe?side=north), [south side](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/hub/globe?side=south))
- [Drag the sun](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/hub/sun) ([summer up north](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/hub/sun?summer=north), [the north's winter night](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/hub/sun?side=north&summer=south))
- [The lost penguin: carry him home](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/hub/lost?who=penguin) ([a lost polar bear cub](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/hub/lost?who=bear))

**Emperor Huddle**

- [A small huddle](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/huddle/small) ([wind from the right](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/huddle/small?wind=right))
- [The wind turns](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/huddle/blizzard)
- [Crack! Pebble's egg](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/huddle/hatch) ([already hatched: tuck Pebble back](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/huddle/hatch?chick=hatched))
- [The first sunrise](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/huddle/sunrise)

**Ice Floe Hop** (in the works)

- [Pola is far from Mama](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/floe/story)
- [Big steady floes](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/floe/steady) ([another layout](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/floe/steady?layout=2))
- [Floes that drift](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/floe/drift)
- [Summer melt (push the floes)](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/floe/melt)
- [Back to Mama](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/floe/mama)

**Snow Coats** (in the works)

- [Paint the fox](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/coats/fox)
- [Hide and seek](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/coats/hide?painted=fox) ([the lemming still brown](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/coats/hide?painted=fox,hare,ptarmigan))
- [Rub the summer back](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/coats/summer)

**Penguin Slide** (in the works)

- [The gentle slope](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/slide/top)
- [Bumps and cracks](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/slide/bumps) ([the moguls run](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/slide/bumps?run=left), [the kicker run](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/slide/bumps?run=right))
- [Under the sea](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/slide/dive)
- [Feeding Pebble](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/slide/home?krill=12)

**Iceberg Maker** (in the works)

- [North or south?](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/iceberg/pick)
- [Little bits](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/iceberg/bits?pole=north) ([at the South Pole](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/iceberg/bits?pole=south))
- [The giant one (under the water)](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/iceberg/giant?pole=north) ([at the South Pole](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/iceberg/giant?pole=south))
- [Send them sailing](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/iceberg/sail?pole=north) ([at the South Pole](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/iceberg/sail?pole=south))

**Finale: Pole to Pole and the Polar Quiz**

- [Pole to Pole: over the Arctic](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/fly?stamps=all) ([the warm middle](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/fly?stamps=all&leg=warm), [the windy south](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/fly?stamps=all&leg=south))
- [The postcard for Pebble](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/deliver?stamps=all)
- [The Polar Quiz](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/quiz?stamps=all&q=bear) ([spin to the South Pole](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/quiz?stamps=all&q=south), [the coldest pole](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/quiz?stamps=all&q=coldest), [who visits both](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/quiz?stamps=all&q=tern), [summer up north](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/quiz?stamps=all&q=summer), [the last question](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/quiz?stamps=all&q=ocean&stars=5))
- [The Polar Explorer badge](https://neb636.github.io/Kaylee-Gamepack/#/world/poles/party/badge?stamps=all)

### Canada

**Home base**

- [The whole country, then the train in Quebec City](https://neb636.github.io/Kaylee-Gamepack/#/world/canada)
- [Push the train](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map) ([Mont-Sainte-Anne](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=msa), [Ottawa](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=ottawa), [the forests](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=forest), [the prairies](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=prairies), [Banff](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=banff), [out of the Spiral Tunnel](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=rockies), [Vancouver](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/hub/map?at=bc))

**Sugar Snow** (in the works)

- [Lines: pour, let it set, roll it up](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/taffy/pour) ([tip by pulling ahead](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/taffy/pour?tip=lead))
- [Shapes](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/taffy/shapes)
- [Orders](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/taffy/orders) ([the chipmunk fed](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/taffy/orders?made=7&fed=chipmunk))
- [Everyone crunches](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/taffy/share)

**Carnival Snowballs** (in the works)

- [Roll one](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/snowman/roll)
- [Stack a snowman](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/snowman/stack) ([the huge ball, Maple on top](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/snowman/stack?size=huge))
- [Dress it for the carnival](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/snowman/dress) ([two already in the parade line](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/snowman/dress?snowmen=3))
- [The parade](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/snowman/parade) ([a long one](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/snowman/parade?snowmen=5))

**Mountain Bike** (in the works)

- [Up the gondola](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bike/gondola)
- [The green trail](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bike/green)
- [Berms and bumps](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bike/berms) ([the blue way](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bike/berms?trail=blue))
- [The creek and the jump](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bike/creek)
- [The waterfall](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bike/falls)

**Campfire Night** (in the works): [Find the eyes](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/campfire/eyes) · [Who’s that sound?](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/campfire/sounds?found=4) · [The marshmallow bandit](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/campfire/bandit?found=6) · [Roast a marshmallow](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/campfire/marshmallow) · [Around the fire](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/campfire/stars?found=8)

**Red Canoe** (in the works)

- [Glide](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/glide) ([pulled by her finger instead](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/glide?paddle=pull))
- [Where the blue comes from](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/stream)
- [Follow the loon](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/loon)
- [The loon family](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/canoe/glacier)

**Animal Bridge** (in the works)

- [The elk family](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bridge/elk)
- [The bighorn sheep](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bridge/sheep?crossed=elk)
- [The shy grizzlies](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bridge/bears?crossed=elk,sheep) ([the bridge already planted](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bridge/bears?crossed=elk,sheep&green=1))
- [The camera’s photos](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/bridge/album?crossed=elk,sheep,bears)

**Whale Watch** (in the works)

- [The harbour](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/harbour) ([steering with the wheel instead](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/harbour?steer=wheel))
- [The otters in the kelp](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/otters)
- [Follow the spouts](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/spouts) ([the humpback](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/spouts?found=2), [the humpback that jumps](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/spouts?found=3))
- [The orca family](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/orcas)
- [Listen under the water](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/whales/listen)

**Salmon Leap** (in the works)

- [Little steps](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/salmon/steps)
- [The big falls](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/salmon/falls?home=3)
- [The bears are fishing](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/salmon/bears?home=7) ([the spirit bear on the low ledge](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/salmon/bears?home=7&spirit=low))
- [Home: the eggs hatch](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/salmon/eggs?home=11)

**Finale**: [Animal Homes + Pond Hockey (coming soon)](https://neb636.github.io/Kaylee-Gamepack/#/world/canada/party/soon?stamps=all)

<!-- sections:end -->

## How new things get made

1. Dad asks an AI agent (Claude Code or Codex) for one piece: a plan, a greybox toy, art, the full loop, or a fix.
   `AGENTS.md` holds the rules it follows.
2. It opens a **pull request** with "🔗 Test this" links straight to the sections that changed.
3. The PR gets a **preview link**. Try it on the iPad.
4. **Merge** → it deploys automatically.

## One-time setup

1. **Variables** (Settings → Secrets and variables → Actions → *Variables*): set `VITE_POSTHOG_KEY` to the PostHog project token and `VITE_POSTHOG_HOST` to its ingestion URL
   (for a US project, `https://us.i.posthog.com`). Only the main Pages deployment enables PostHog;
   PR previews and local builds do not send events.
   The project token is public and bundled into the website; do not use a PostHog personal API key here.
   Error tracking captures uncaught errors on its own. For readable stack traces, also add the secret
   `POSTHOG_API_KEY` (a PostHog personal API key with *Error tracking: write*) and the variable
   `POSTHOG_PROJECT_ID`: the main deploy then uploads source maps to PostHog and leaves them off the site.
2. After the first deploy to `main` creates the `gh-pages` branch:
   Settings → Pages → *Deploy from a branch* → `gh-pages` / `(root)`.

## How it's built

- **Vite + React + TypeScript**, static site on GitHub Pages, no login, no server.
  Trophies are saved on the iPad (localStorage).
- Spoken lines are pre-recorded with OpenAI text-to-speech, one voice per character (`src/sdk/cast.json` plus a
  `cast.json` per country). `node scripts/generate-voice.mjs` records the clips from each folder's `voice-lines.json`
  (put `OPENAI_API_KEY` in `.env`) and they're committed; the iPad plays bundled audio files.
- Characters are live: SVG puppets in the 2D countries (`src/sdk/puppet/`, try them at `#/world/puppets`), and a toon
  3D family in Thailand (`src/world/places/thailand/characters/`, inspect them all at `#/world/characters`). They blink, watch her finger, talk with moving
  mouths, and act things out.
- `src/world/`: **Around the World**, a map Kaylee explores in Sparkle's balloon, with a passport, a coloring book,
  and one folder per country in `src/world/places/<id>/`. Thailand is 3D (three.js); the others are 2D.
- `src/sdk/`: shared building blocks: speech (`say`), sounds, confetti, puppets, drag and drop, puzzles and more.
  Try them at `#/playground`.
- `src/shell/`: the app wrapper (splash, trophy ceremony, trophy room); the world map is the home screen.
- `src/games/<id>/`: the original school-paper games (the unicorn tea party, opened from the 🏡 pin on the world map).
- `planning/around-the-world/`: country and activity plans (`ACTIVITY-TEMPLATE.md`, `thailand.md`, ...). Newer plans
  are pages (`thailand/baan-chang.html`, `thailand/nan-trip.html`), also published with the app at
  [`planning/around-the-world/thailand/nan-trip.html`](https://neb636.github.io/Kaylee-Gamepack/planning/around-the-world/thailand/nan-trip.html).
- `AGENTS.md`: the rules AI agents follow when building (read this to change how activities are designed).
  `docs/play-design.md` says what makes an activity fun.
- `art/STYLE.md`: the art style prompt. `art/source/`: full-size art (per-country originals are git-ignored scratch;
  the app uses small webp copies).
- `.github/workflows/`:
  - `ci.yml`: typecheck, build, smoke tests
  - `preview.yml`: PR previews
  - `deploy.yml`: main → Pages

## Local development

```bash
npm install
npm run dev                  # http://localhost:5173 (#/world, #/world/sections, #/world/characters, #/playground)
npm run verify               # voice clips + heavy imports + typecheck + build
npm run check                # verify + Playwright smoke tests
node scripts/generate-voice.mjs --check  # verify that every listed line has audio
node scripts/generate-voice.mjs          # record missing/changed lines (OPENAI_API_KEY in .env, needs ffmpeg)
node scripts/voice-audition.mjs pip nova coral  # hear a character in a few voices
npm run art -- world         # generated PNGs -> cut-out webp
npm run icons                # rebuild app icons from art/source/icon-1024.png
node scripts/world-voice-lines.mjs       # Around the World: lines.ts -> voice-lines.json
node scripts/qa-screens.mjs              # screenshots at 4 iPad + 3 iPhone sizes -> qa-output/ (build first)
```

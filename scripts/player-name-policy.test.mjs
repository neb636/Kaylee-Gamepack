import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hasPlayerName, permitsPlayerName } from './player-name-policy.mjs'
test('detects spelling, engraving, pronunciation and Chinese name variants', () => {
  for (const text of ['Thank you, Kaylee!', 'KAYLEE', 'Ky lee!', 'Kai Lee!', '凯莉', 'kǎilì']) assert.ok(hasPlayerName(text), text)
  assert.equal(hasPlayerName('You did it!'), false)
})
test('permits only the four approved writing lines, not whole countries or activities', () => {
  for (const [place, key] of [['egypt', 'scribe.story'], ['egypt', 'scribe.done'], ['china', 'brush.nameIntro'], ['china', 'brush.nameSay']]) assert.ok(permitsPlayerName(place, key.split('.')))
  for (const [place, key] of [['egypt', 'trophyWin'], ['egypt', 'scribe.hint'], ['china', 'brush.stamp'], ['thailand', 'samet.finale.wow'], ['canada', 'trophyRoom']]) assert.equal(permitsPlayerName(place, key.split('.')), false)
})

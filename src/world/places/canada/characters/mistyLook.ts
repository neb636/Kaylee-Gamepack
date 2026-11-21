// Misty in the look from her bubble bath (looks.ts MistyLook). A STUB until the bath's builder fills it in
// (planning/around-the-world/canada-round-2.md): the signature is the contract with story/cast.ts Friend.dress().
import type { FilmActor } from '../../../engine3d/characters/actor'
import type { Bag } from '../../../engine3d/dispose'
import type { MistyLook } from '../looks'

/** Puts Misty in a look (fur colors, fluff, hairdo, decorations, her paw-print sweater): everything it added last
 *  time comes off first, so it can be called again with another look. `null`: the plain white bear. */
export function dressMisty(_actor: FilmActor, _look: MistyLook | null, _bag: Bag): void {}

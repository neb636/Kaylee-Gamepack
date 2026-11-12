// The story's own sounds, shared by every film on the trip (the island's, each stop's, the fire show's): a music cue
// under a film and a soft bed under a memory. For now the music is borrowed from the Nan rice farm's story, as the
// salt hut's story does (scratch: Koh Samet gets a cue of its own once the story has been heard); the memory's bed is
// the fire show's own night on the beach. Each returns its stop(): call it in the film's finish(), so it ends
// (fading) when the film ends or is skipped.
import { bed, cue } from '../../../../../kit/clips'
import { nanClip } from '../../nan-trip/sfx'
import { sametClip } from '../sfx'

/** Music under a film, until stop(). */
export const storyMusic = (vol = 0.36) => cue(nanClip('rice-story-music'), vol)
/** The beach at night under a memory (the storybook look), until stop(). */
export const memoryBed = (vol = 0.3) => bed(sametClip('fire-night'), vol, { fadeIn: 1.2, fadeOut: 1.2 })

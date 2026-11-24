// The mall day's recorded sound effects (ElevenLabs, made by scripts/generate-sfx.mjs from sfx.json): each mp3's url.
const files = import.meta.glob('./*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

/** The url of a clip in this folder ('' if it isn't there: the synth sound plays). */
export const mallClip = (id: string) => files[`./${id}.mp3`] ?? ''

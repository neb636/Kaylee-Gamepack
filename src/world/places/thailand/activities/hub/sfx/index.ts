// Agong's house's recorded sound effects: one mp3 per sfx.json entry, made by scripts/generate-sfx.mjs (ElevenLabs).
// `houseClip('bike-1')` is that clip's URL ('' if it hasn't been made, and the sound plays its synth fallback).
const files = import.meta.glob('./*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const houseClip = (id: string) => files[`./${id}.mp3`] ?? ''

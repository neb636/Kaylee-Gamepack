// The Bangkok map's recorded sound effects: one mp3 per sfx.json entry, made by scripts/generate-sfx.mjs (ElevenLabs).
// `bangkokClip('skytrain')` is that clip's URL ('' if it hasn't been made, and the sound plays its synth fallback).
const files = import.meta.glob('./*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const bangkokClip = (id: string) => files[`./${id}.mp3`] ?? ''

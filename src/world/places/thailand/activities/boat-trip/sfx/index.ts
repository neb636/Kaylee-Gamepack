// The boat trip's recorded sound effects (Phang Nga Bay, the race, Baan Chang): one mp3 per sfx.json entry, made by
// scripts/generate-sfx.mjs (ElevenLabs). `boatClip('bay-engine')` is that clip's URL ('' if it hasn't been made, and
// the sound plays its synth fallback).
const files = import.meta.glob('./*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const boatClip = (id: string) => files[`./${id}.mp3`] ?? ''

// The trip legs' recorded sound effects (the window seat's landing, Krabi's arrivals road): one mp3 per sfx.json
// entry, made by scripts/generate-sfx.mjs (ElevenLabs). `tripClip('land-clap')` is that clip's URL ('' if it hasn't
// been made, and the sound plays its synth fallback).
const files = import.meta.glob('./*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const tripClip = (id: string) => files[`./${id}.mp3`] ?? ''

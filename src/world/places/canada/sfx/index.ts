// Canada's recorded sound effects (sfx.json; made by scripts/generate-sfx.mjs, the `sfx` skill). `url('story-honk')`
// is a clip's address, or '' while it hasn't been made: kit/clips.ts then plays the synth fallback instead.
const files = import.meta.glob('./*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export const url = (id: string) => files[`./${id}.mp3`] ?? ''

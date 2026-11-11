// The landing greeting and these exact name-writing lines are the only exceptions (2026-11-11).
export const hasPlayerName = (text) => /\bkaylee\b|\b(?:ky|kai)\s+lee\b|凯莉|kǎilì/i.test(text)
const writingLines = new Set(['egypt:scribe.story', 'egypt:scribe.done', 'china:brush.nameIntro', 'china:brush.nameSay'])
export const permitsPlayerName = (place, path) => writingLines.has(`${place}:${path.join('.')}`)

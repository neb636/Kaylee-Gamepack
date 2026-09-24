// A sticker + color for each kind of subject. Unknown subjects get a star.
const SUBJECTS: { match: RegExp; emoji: string; color: string }[] = [
  { match: /math|count|number|shape|pattern|measure|add|subtract/i, emoji: '🔢', color: 'var(--butter)' },
  { match: /letter|phonic|read|sight|word|alphabet|rhym|spell|writ/i, emoji: '🔤', color: 'var(--sky)' },
  { match: /science|season|weather|plant|animal|body|space|nature|seed|bug/i, emoji: '🌱', color: 'var(--mint)' },
  { match: /social|community|holiday|family|feeling|friend|kind|map/i, emoji: '💖', color: 'var(--peach)' },
  { match: /art|music|color|song|draw/i, emoji: '🎨', color: 'var(--lavender)' },
]

export function subjectStyle(subject: string) {
  return SUBJECTS.find((s) => s.match.test(subject)) ?? { emoji: '⭐', color: 'var(--lavender)' }
}

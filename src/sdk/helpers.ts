// Small helpers that games tend to need.

/** Landing greeting only. Egypt/China name-writing content is the other explicit exception. */
export const KID_NAME = 'Kaylee'

/** Wait some milliseconds: `await wait(500)`. */
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** A random item from a list. */
export const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]

/** A shuffled copy of a list. */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** `count` different items from a list. */
export const sample = <T,>(items: readonly T[], count: number): T[] => shuffle(items).slice(0, count)

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']

/** 3 -> "three" (speech engines say words more cheerfully than digits). */
export const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n)

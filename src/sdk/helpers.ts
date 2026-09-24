// Small helpers that games tend to need.

export const KID_NAME = 'Kaylee'

/** Wait some milliseconds: `await wait(500)`. */
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Random whole number from min to max (both included). */
export const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

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

const PRAISE = ['Great job', 'You did it', 'Amazing', 'Super', 'Wonderful', 'Hooray', 'Fantastic', 'Awesome', 'Yay', 'Brilliant']

/** Something nice to say, sometimes with her name: "Amazing, Kaylee!" */
export const praise = () => (Math.random() < 0.6 ? `${pick(PRAISE)}, ${KID_NAME}!` : `${pick(PRAISE)}!`)

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']

/** 3 -> "three" (speech engines say words more cheerfully than digits). */
export const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n)

export interface GameMeta {
  /** Must match the folder name, e.g. "unicorn-tea-party". */
  id: string
  /** Shown on the game card, e.g. "Unicorn Tea Party". */
  title: string
  /** One emoji for the card and trophy, e.g. "🫖". */
  emoji: string
  /** Imported cover image (square). */
  cover: string
  /** Free text: "math", "phonics", "science: seasons", "social studies"... */
  subject: string
  /** What the game practices, in plain words. */
  skills: string[]
  /** Vocabulary words from the school paper that the game says out loud. */
  vocabulary: string[]
  /** The core game mechanic, e.g. "tap to count, drag into teapot". Used so new games do something different. */
  mechanic: string
  /** The world/theme, e.g. "unicorn tea party in the clouds". */
  setting: string
  /** Where the lesson came from. */
  source: { issue?: number; pages: string[] }
  /** YYYY-MM-DD. Newest game is shown first. */
  createdAt: string
  /** Engraved on the trophy under KAYLEE, e.g. "Counting Champion". */
  trophyTitle: string
}

export interface GameProps {
  /** Call once when Kaylee finishes the game. Shows the trophy ceremony. */
  onWin: () => void
  /** Fills the stars at the top of the screen, e.g. setProgress(2, 6). */
  setProgress: (done: number, total: number) => void
}

/** URL state is bounded before it reaches the toys. Invalid values use the section seed. */
export function numberParam(value: string, fallback: number, min: number, max: number) {
  const n = Number(value)
  return value === 'auto' || !Number.isFinite(n) ? fallback : Math.max(min, Math.min(max, n))
}
export function listParam(value: string, fallback: number[], min: number, max: number) {
  if (value === 'auto') return fallback
  const parts = value.split(',')
  return fallback.map((n, i) => numberParam(parts[i] ?? 'auto', n, min, max))
}

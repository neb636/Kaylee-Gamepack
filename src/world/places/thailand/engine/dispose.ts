// Everything one mount of the house creates (geometries, per-mount materials and textures) goes in its bag, and the bag
// is emptied when the house unmounts. Shared materials (toon.ts, outline.ts) live for the whole visit and stay out.
export class Bag {
  private items = new Set<{ dispose(): void }>()
  add<T extends { dispose(): void }>(item: T): T {
    this.items.add(item)
    return item
  }
  dispose() {
    for (const item of this.items) item.dispose()
    this.items.clear()
  }
}

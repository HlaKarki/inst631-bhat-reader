import { paper } from '@/data/paper'

export type Selection = { page: number; notes: number[] }

// Notes that share a highlight open together, so stepping moves group by group.
const groups = new Map<string, Selection>()
for (const note of paper.notes) {
  const key = `${note.page}:${JSON.stringify(note.rects)}`
  const group = groups.get(key) ?? { page: note.page, notes: [] }
  group.notes.push(note.n)
  groups.set(key, group)
}

export const stops = [...groups.values()].sort((a, b) => a.notes[0] - b.notes[0])

export const stopOf = (n: number) => stops.find((s) => s.notes[0] === n)

export const stopWith = (n: number) => stops.find((s) => s.notes.includes(n))

export const stopIndex = (notes: number[]) => {
  const first = Math.min(...notes)
  return stops.findIndex((s) => s.notes.includes(first))
}

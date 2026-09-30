export type Rect = [x: number, y: number, w: number, h: number]

export type Note = {
  n: number
  ledger: number
  page: number
  cat: string
  text: string
  rects: Rect[]
}

export type TocEntry = {
  level: number
  title: string
  page: number
}

export type Strip = {
  page: number
  box: Rect
  src: string
}

export type ReaderData = {
  pages: number
  aspect: number
  cats: Record<string, string>
  notes: Note[]
  toc: TocEntry[]
  strips: Strip[]
}

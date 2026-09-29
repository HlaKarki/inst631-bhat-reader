import { useState } from 'react'
import type { PointerEvent } from 'react'
import { paper } from '@/data/paper'
import type { Note, Rect, Strip } from '@/lib/types'
import { cn, sameList } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { NoteCard } from '@/app/home/components/NoteCard'
import { NoteHighlight } from '@/app/home/components/NoteHighlight'

type SheetProps = {
  page: number
  notes: Note[]
  strips: Strip[]
  cats: Record<string, string>
  active: number[]
  onPick: (notes: number[]) => void
}

const inside = ([x, y, w, h]: Rect, [sx, sy, sw, sh]: Rect) => {
  const cx = x + w / 2
  const cy = y + h / 2
  return cx >= sx && cx <= sx + sw && cy >= sy && cy <= sy + sh
}

const toFrame = ([x, y, w, h]: Rect, [sx, sy, sw, sh]: Rect): Rect => [(x - sx) / sw, (y - sy) / sh, w / sw, h / sh]

export function Sheet({ page, notes, strips, cats, active, onPick }: SheetProps) {
  // The card keeps the last notes it showed so it can fade out with its content still in it.
  const [shown, setShown] = useState<number[]>([])
  if (active.length > 0 && !sameList(active, shown)) setShown(active)
  const phone = useMediaQuery('(max-width: 639px)')
  const on = active.length > 0

  // Phones get the page cut into column strips, so the text reads at screen width instead of half of it.
  const frames: Strip[] = phone
    ? strips
    : [{ page, box: [0, 0, 1, 1], src: `pages/p${String(page).padStart(2, '0')}.jpg` }]

  const pick = (e: PointerEvent<HTMLElement>) => {
    const sheet = e.currentTarget
    const hits = new Set<number>()
    for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
      if (el instanceof HTMLElement && el.dataset.note && sheet.contains(el)) hits.add(Number(el.dataset.note))
    }
    onPick(notes.filter((n) => hits.has(n.n)).map((n) => n.n))
  }

  return (
    <section
      className={cn('relative w-full max-w-204', 'bg-white shadow-[0_1px_4px_rgb(0_0_0/0.15)]')}
      id={`p${page}`}
      onPointerMove={pick}
      onPointerDown={pick}
      // Touch fires pointerleave right after every tap, so keep the card open until the next tap.
      onPointerLeave={(e) => e.pointerType !== 'touch' && onPick([])}
    >
      {frames.map(({ box, src }) => (
        <div
          key={src}
          className="relative max-w-full overflow-hidden"
          style={{ aspectRatio: box[2] / (box[3] * paper.aspect) }}
        >
          <img
            src={src}
            alt={`Page ${page} of the paper`}
            loading={page <= 2 ? 'eager' : 'lazy'}
            className={cn('block w-full', 'transition-[filter] duration-200 ease-out', on && 'blur-[3px]')}
          />
          {notes.map((note) => {
            const rects = note.rects.filter((r) => inside(r, box)).map((r) => toFrame(r, box))
            return (
              rects.length > 0 && (
                <NoteHighlight
                  key={note.n}
                  note={note}
                  rects={rects}
                  src={src}
                  state={active.includes(note.n) ? 'lit' : on ? 'dim' : 'idle'}
                />
              )
            )
          })}
        </div>
      ))}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-1',
          'bg-ink/10',
          'transition-opacity duration-200 ease-out',
          on ? 'opacity-100' : 'opacity-0',
        )}
      />
      {shown.length > 0 && <NoteCard notes={notes.filter((n) => shown.includes(n.n))} cats={cats} open={on} />}
    </section>
  )
}

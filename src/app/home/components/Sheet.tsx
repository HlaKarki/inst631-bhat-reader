import { useState } from 'react'
import type { MouseEvent } from 'react'
import { paper } from '@/data/paper'
import type { Note, Rect, Strip, TocEntry } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { NoteCard } from '@/app/home/components/NoteCard'
import { NoteHighlight } from '@/app/home/components/NoteHighlight'
import { stopIndex, stopOf, stops } from '@/app/home/selection'
import type { Selection } from '@/app/home/selection'

type SheetProps = {
  page: number
  notes: Note[]
  strips: Strip[]
  sections: (TocEntry & { i: number })[]
  cats: Record<string, string>
  selection: Selection | null
  onPick: (notes: number[]) => void
  onStep: (dir: 1 | -1) => void
  onClose: () => void
  onMenu: () => void
}

const none: number[] = []

const inside = ([x, y, w, h]: Rect, [sx, sy, sw, sh]: Rect) => {
  const cx = x + w / 2
  const cy = y + h / 2
  return cx >= sx && cx <= sx + sw && cy >= sy && cy <= sy + sh
}

const toFrame = ([x, y, w, h]: Rect, [sx, sy, sw, sh]: Rect): Rect => [(x - sx) / sw, (y - sy) / sh, w / sw, h / sh]

export function Sheet({ page, notes, strips, sections, cats, selection, onPick, onStep, onClose, onMenu }: SheetProps) {
  // The card keeps the last selection it showed so it can fade out with its content still in it.
  const [shown, setShown] = useState<Selection | null>(null)
  if (selection && selection !== shown) setShown(selection)
  const active = selection?.notes ?? none
  const phone = useMediaQuery('(max-width: 639px)')
  const on = active.length > 0

  // Phones get the page cut into column strips, so the text reads at screen width instead of half of it.
  const frames: Strip[] = phone
    ? strips
    : [{ page, box: [0, 0, 1, 1], src: `pages/p${String(page).padStart(2, '0')}.jpg` }]

  const cardId = `note-card-p${page}`
  const describe = (ns: number[]) =>
    ns.map((n) => `Note ${n}, ${cats[notes.find((note) => note.n === n)?.cat ?? '']}`).join('; ')

  const hitsAt = (e: MouseEvent<HTMLElement>) => {
    const sheet = e.currentTarget
    const hits = new Set<number>()
    for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
      if (el instanceof HTMLElement && el.dataset.note && sheet.contains(el)) hits.add(Number(el.dataset.note))
    }
    return notes.filter((n) => hits.has(n.n)).map((n) => n.n)
  }

  return (
    <section
      className={cn('relative w-full max-w-204', 'bg-white shadow-[0_1px_4px_rgb(0_0_0/0.15)]')}
      id={`p${page}`}
      aria-label={`Page ${page}`}
      onClick={(e) => onPick(hitsAt(e))}
    >
      {frames.map(({ box, src }, f) => (
        <div
          key={src}
          className="relative max-w-full overflow-hidden"
          style={{ aspectRatio: box[2] / (box[3] * paper.aspect) }}
        >
          <img
            src={src}
            alt={f === 0 ? `Page ${page} of the paper` : ''}
            loading={page <= 2 ? 'eager' : 'lazy'}
            className={cn('block w-full', 'transition-[filter] duration-200 ease-out', on && 'blur-[3px]')}
          />
          {sections.map((section) => {
            // The heading's anchor point sits on its top edge, so nudge it inward to land in the right strip.
            const point: Rect = [section.x + 0.01, section.y + 0.01, 0, 0]
            if (!inside(point, box)) return null
            const [x, y] = toFrame([section.x, section.y, 0, 0], box)
            return (
              <span
                key={section.i}
                id={`section-${section.i}`}
                role="heading"
                aria-level={section.level + 1}
                tabIndex={-1}
                className="absolute scroll-mt-16 outline-none"
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
              >
                <span className="sr-only">{section.title}</span>
              </span>
            )
          })}
          {notes.map((note) => {
            const own = note.rects.map((r, i) => ({ r, i })).filter(({ r }) => inside(r, box))
            const stop = stopOf(note.n)
            // Only the first rect of a group's first note is focusable, so each group is one tab stop.
            const leadAt = stop ? own.findIndex(({ i }) => i === 0) : -1
            return (
              own.length > 0 && (
                <NoteHighlight
                  key={note.n}
                  note={note}
                  rects={own.map(({ r }) => toFrame(r, box))}
                  src={src}
                  state={active.includes(note.n) ? 'lit' : on ? 'dim' : 'idle'}
                  lead={
                    stop && leadAt >= 0
                      ? {
                          at: leadAt,
                          label: `Open ${describe(stop.notes)}`,
                          expanded: active.includes(note.n),
                          controls: cardId,
                          onOpen: () => onPick(stop.notes),
                        }
                      : undefined
                  }
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
      {shown && (
        <NoteCard
          id={cardId}
          label={describe(shown.notes)}
          onClose={onClose}
          onMenu={onMenu}
          notes={notes.filter((n) => shown.notes.includes(n.n))}
          cats={cats}
          open={on}
          nav={{ at: stopIndex(shown.notes) + 1, total: stops.length, onStep }}
        />
      )}
    </section>
  )
}

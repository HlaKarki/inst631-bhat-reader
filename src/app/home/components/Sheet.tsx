import { useState } from 'react'
import type { PointerEvent } from 'react'
import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'
import { NoteCard } from '@/app/home/components/NoteCard'
import { NoteHighlight } from '@/app/home/components/NoteHighlight'

type SheetProps = {
  page: number
  notes: Note[]
  cats: Record<string, string>
}

const same = (a: number[], b: number[]) => a.join() === b.join()

export function Sheet({ page, notes, cats }: SheetProps) {
  const [active, setActive] = useState<number[]>([])
  // The card keeps the last notes it showed so it can fade out with its content still in it.
  const [shown, setShown] = useState<number[]>([])
  const src = `pages/p${String(page).padStart(2, '0')}.jpg`
  const on = active.length > 0

  const pick = (e: PointerEvent<HTMLElement>) => {
    const sheet = e.currentTarget
    const hits = new Set<number>()
    for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
      if (el instanceof HTMLElement && el.dataset.note && sheet.contains(el)) hits.add(Number(el.dataset.note))
    }
    const next = notes.filter((n) => hits.has(n.n)).map((n) => n.n)
    setActive((prev) => (same(prev, next) ? prev : next))
    if (next.length > 0) setShown((prev) => (same(prev, next) ? prev : next))
  }

  return (
    <section
      className={cn('relative w-full max-w-204', 'shadow-[0_1px_4px_rgb(0_0_0/0.15)]')}
      id={`p${page}`}
      onPointerMove={pick}
      onPointerDown={pick}
      // Touch fires pointerleave right after every tap, so keep the card open until the next tap.
      onPointerLeave={(e) => e.pointerType !== 'touch' && setActive([])}
    >
      <div className="overflow-hidden">
        <img
          src={src}
          alt={`Page ${page} of the paper`}
          loading={page <= 2 ? 'eager' : 'lazy'}
          className={cn('w-full', 'transition-[filter] duration-200 ease-out', on && 'blur-[3px]')}
        />
      </div>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-1',
          'bg-ink/10',
          'transition-opacity duration-200 ease-out',
          on ? 'opacity-100' : 'opacity-0',
        )}
      />
      {notes.map((note) => (
        <NoteHighlight
          key={note.n}
          note={note}
          src={src}
          state={active.includes(note.n) ? 'lit' : on ? 'dim' : 'idle'}
        />
      ))}
      {shown.length > 0 && <NoteCard notes={notes.filter((n) => shown.includes(n.n))} cats={cats} open={on} />}
    </section>
  )
}

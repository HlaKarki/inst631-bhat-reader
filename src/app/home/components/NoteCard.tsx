import type { CSSProperties } from 'react'
import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'

type NoteCardProps = {
  notes: Note[]
  cats: Record<string, string>
  open: boolean
}

export function NoteCard({ notes, cats, open }: NoteCardProps) {
  const rects = notes.flatMap((n) => n.rects)
  const left = Math.min(...rects.map(([x]) => x))
  const right = Math.max(...rects.map(([x, , w]) => x + w))
  const top = Math.min(...rects.map(([, y]) => y))
  const bottom = Math.max(...rects.map(([, y, , h]) => y + h))

  const onLeft = left < 0.5
  const below = bottom < 0.6
  const place: CSSProperties = {
    ...(onLeft ? { left: `${left * 100}%` } : { right: `${(1 - right) * 100}%` }),
    ...(below ? { top: `${bottom * 100 + 1}%` } : { bottom: `${(1 - top) * 100 + 1}%` }),
  }
  const origin = below
    ? onLeft
      ? 'origin-top-left'
      : 'origin-top-right'
    : onLeft
      ? 'origin-bottom-left'
      : 'origin-bottom-right'
  const tucked = cn(
    'opacity-0 motion-safe:scale-96',
    below ? 'motion-safe:-translate-y-1' : 'motion-safe:translate-y-1',
  )

  return (
    <aside
      className={cn(
        'pointer-events-none absolute z-10 w-[40%] min-w-64',
        'grid gap-3 rounded-md bg-white p-3 shadow-lg',
        'text-sm leading-snug text-ink',
        'transition-[opacity,scale,translate] ease-out-expo',
        origin,
        open ? 'duration-200' : 'duration-120',
        open ? 'opacity-100' : tucked,
        'starting:opacity-0 motion-safe:starting:scale-96',
      )}
      style={place}
    >
      {notes.map((note) => (
        <div
          key={note.n}
          className="grid gap-1 border-l-4 border-(--c) pl-3"
          style={{ '--c': `var(--c-${note.cat})` } as CSSProperties}
        >
          <p className="text-xs font-medium tracking-wide text-ink/60 uppercase">
            {note.n}. {cats[note.cat]}
          </p>
          <p>{note.text}</p>
        </div>
      ))}
    </aside>
  )
}

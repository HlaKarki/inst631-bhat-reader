import type { ComponentProps, CSSProperties } from 'react'
import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'

type NoteCardProps = {
  notes: Note[]
  cats: Record<string, string>
  open: boolean
  nav?: { at: number; total: number; onStep: (dir: 1 | -1) => void }
}

export function NoteCard({ notes, cats, open, nav }: NoteCardProps) {
  const rects = notes.flatMap((n) => n.rects)
  const left = Math.min(...rects.map(([x]) => x))
  const right = Math.max(...rects.map(([x, , w]) => x + w))
  const top = Math.min(...rects.map(([, y]) => y))
  const bottom = Math.max(...rects.map(([, y, , h]) => y + h))

  const onLeft = left < 0.5
  const below = bottom < 0.6
  const place = {
    '--l': onLeft ? `${left * 100}%` : 'auto',
    '--r': onLeft ? 'auto' : `${(1 - right) * 100}%`,
    '--t': below ? `${bottom * 100 + 1}%` : 'auto',
    '--b': below ? 'auto' : `${(1 - top) * 100 + 1}%`,
  } as CSSProperties
  const origin = below
    ? onLeft
      ? 'origin-top-left'
      : 'origin-top-right'
    : onLeft
      ? 'origin-bottom-left'
      : 'origin-bottom-right'
  const tucked = cn(
    'opacity-0',
    'max-sm:motion-safe:translate-y-3',
    'sm:motion-safe:scale-96',
    below ? 'sm:motion-safe:-translate-y-1' : 'sm:motion-safe:translate-y-1',
  )

  return (
    <aside
      className={cn(
        'pointer-events-none z-10 grid gap-3 bg-white',
        'text-sm leading-snug text-ink',
        'max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[40vh] max-sm:overflow-y-auto',
        'max-sm:rounded-t-xl max-sm:px-4 max-sm:pt-4 max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))] max-sm:shadow-[0_-4px_16px_rgb(0_0_0/0.12)]',
        'sm:absolute sm:top-(--t) sm:right-(--r) sm:bottom-(--b) sm:left-(--l) sm:w-[40%] sm:min-w-64',
        'sm:rounded-md sm:p-3 sm:shadow-lg',
        'transition-[opacity,scale,translate] ease-out-expo',
        origin,
        open ? 'duration-200' : 'duration-120',
        open ? 'opacity-100 max-sm:pointer-events-auto' : tucked,
        open && nav && 'pointer-events-auto',
        'starting:opacity-0 max-sm:motion-safe:starting:translate-y-3 sm:motion-safe:starting:scale-96',
      )}
      style={place}
      inert={!open}
      // The card lives inside the page element, so stop its clicks from re-running the page's note picker.
      onClick={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
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
      {nav && (
        <nav className={cn('flex items-center justify-between gap-2', 'border-t border-ink/10 pt-2', 'text-xs')}>
          <StepButton disabled={nav.at === 1} onClick={() => nav.onStep(-1)}>
            Prev
          </StepButton>
          <span className="text-ink/60 tabular-nums">
            {nav.at} of {nav.total}
          </span>
          <StepButton disabled={nav.at === nav.total} onClick={() => nav.onStep(1)}>
            Next
          </StepButton>
        </nav>
      )}
    </aside>
  )
}

function StepButton(props: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'rounded px-2 py-1 font-medium max-sm:px-3 max-sm:py-2',
        'transition-colors duration-150 ease-out',
        'enabled:hover:bg-ink/5 disabled:opacity-40',
      )}
      {...props}
    />
  )
}

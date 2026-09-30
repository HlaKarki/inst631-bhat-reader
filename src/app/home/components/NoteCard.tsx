import type { ComponentProps, CSSProperties } from 'react'
import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'

type NoteCardProps = {
  id: string
  label: string
  onClose: () => void
  notes: Note[]
  cats: Record<string, string>
  open: boolean
  nav: { at: number; total: number; onStep: (dir: 1 | -1) => void }
}

export function NoteCard({ id, label, onClose, notes, cats, open, nav }: NoteCardProps) {
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
      id={id}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      className={cn(
        'pointer-events-none z-10 grid gap-3 bg-white outline-none',
        'text-sm leading-snug text-ink',
        'max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[40vh] max-sm:overflow-y-auto',
        // iOS Safari floats its toolbar over the page bottom, so the padding leaves room to scroll the last line above it.
        'max-sm:rounded-t-xl max-sm:px-4 max-sm:pb-[calc(5rem+env(safe-area-inset-bottom))] max-sm:shadow-[0_-4px_16px_rgb(0_0_0/0.12)]',
        'sm:absolute sm:top-(--t) sm:right-(--r) sm:bottom-(--b) sm:left-(--l) sm:w-[40%] sm:min-w-64',
        'sm:rounded-md sm:p-3 sm:shadow-lg',
        'transition-[opacity,scale,translate] ease-out-expo',
        origin,
        open ? 'duration-200' : 'duration-120',
        open ? 'pointer-events-auto opacity-100' : tucked,
        'starting:opacity-0 max-sm:motion-safe:starting:translate-y-3 sm:motion-safe:starting:scale-96',
      )}
      style={place}
      inert={!open}
      // The card lives inside the page element, so stop its clicks from re-running the page's note picker.
      onClick={(e) => e.stopPropagation()}
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
      <nav
        aria-label="Notes"
        className={cn(
          'flex items-center justify-between gap-2 bg-white',
          'text-xs',
          'sm:border-t sm:border-ink/10 sm:pt-2',
          'max-sm:sticky max-sm:top-0 max-sm:order-first max-sm:border-b max-sm:border-ink/10 max-sm:py-2',
        )}
      >
        <StepButton
          data-step="prev"
          aria-label="Previous note"
          aria-keyshortcuts="ArrowLeft"
          disabled={nav.at === 1}
          onClick={() => nav.onStep(-1)}
        >
          Prev
        </StepButton>
        <span className="text-ink/60 tabular-nums">
          {nav.at} of {nav.total}
        </span>
        <StepButton
          data-step="next"
          aria-label="Next note"
          aria-keyshortcuts="ArrowRight"
          disabled={nav.at === nav.total}
          onClick={() => nav.onStep(1)}
        >
          Next
        </StepButton>
      </nav>
      {/* Touch screen readers have no Escape key, so they get a close button that sighted users never see. */}
      <button type="button" className="sr-only" aria-keyshortcuts="Escape" onClick={onClose}>
        Close note
      </button>
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
        'outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink',
      )}
      {...props}
    />
  )
}

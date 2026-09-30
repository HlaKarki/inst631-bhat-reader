import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, CSSProperties } from 'react'
import { paper } from '@/data/paper'
import { cn } from '@/lib/utils'

type ContentsProps = {
  open: boolean
  current: number[]
  onClose: () => void
  onNote: (n: number) => void
  onSection: (i: number) => void
}

export function Contents({ open, current, onClose, onNote, onSection }: ContentsProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      const row = dialog.querySelector<HTMLElement>(`[data-menu-note="${current[0]}"]`)
      row?.scrollIntoView({ block: 'center' })
      row?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open, current])

  const toggle = (cat: string) =>
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })

  return (
    <dialog
      ref={ref}
      aria-labelledby="contents-title"
      onClose={onClose}
      // A click on the dialog element itself lands on the backdrop, since the panel's children cover the rest.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        'm-0 h-full max-h-full w-full max-w-full bg-white p-0 text-ink',
        'sm:ml-auto sm:w-96 sm:shadow-xl',
        'backdrop:bg-ink/30',
        'open:flex open:flex-col',
        'transition-[opacity,translate,display,overlay] transition-discrete duration-200 ease-out-expo',
        'opacity-0 open:opacity-100 starting:open:opacity-0',
        'open:translate-none max-sm:motion-safe:translate-y-4 sm:motion-safe:translate-x-6',
        'max-sm:motion-safe:starting:open:translate-y-4 sm:motion-safe:starting:open:translate-x-6',
      )}
    >
      <header
        className={cn(
          'flex items-center justify-between gap-3',
          'border-b border-ink/10 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3',
        )}
      >
        <h2 id="contents-title" className="text-sm font-semibold">
          Contents
        </h2>
        <PanelButton onClick={onClose}>Close</PanelButton>
      </header>

      <div
        role="group"
        aria-label="Show categories"
        className="flex flex-wrap gap-1.5 border-b border-ink/10 px-4 py-3"
      >
        {Object.entries(paper.cats).map(([cat, label]) => (
          <button
            key={cat}
            type="button"
            aria-pressed={!hidden.has(cat)}
            onClick={() => toggle(cat)}
            style={{ '--c': `var(--c-${cat})` } as CSSProperties}
            className={cn(
              'flex items-center gap-1.5 rounded-full border border-ink/15 px-2.5 py-1 text-xs',
              'transition-opacity duration-150 ease-out',
              'aria-[pressed=false]:opacity-45',
              'outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink',
            )}
          >
            <span className="size-2 rounded-full bg-(--c)" />
            {label}
          </button>
        ))}
      </div>

      <ol className="flex-1 overflow-y-auto overscroll-contain px-2 pt-2 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-4">
        {paper.toc.map((section, i) => {
          const notes = paper.notes.filter((n) => n.section === i && !hidden.has(n.cat))
          return (
            <li key={section.title}>
              <PanelButton
                onClick={() => onSection(i)}
                className={cn(
                  'flex w-full items-baseline justify-between gap-3 py-1.5 text-left',
                  section.level === 1 ? 'mt-2 text-sm font-semibold' : 'pl-5 text-sm text-ink/80',
                )}
              >
                <span>{section.title}</span>
                <span className="shrink-0 text-xs font-normal text-ink/50 tabular-nums">p. {section.page}</span>
              </PanelButton>
              {notes.length > 0 && (
                <ul className={cn('grid gap-0.5 pb-1', section.level === 1 ? 'pl-2' : 'pl-5')}>
                  {notes.map((note) => (
                    <li key={note.n}>
                      <button
                        type="button"
                        data-menu-note={note.n}
                        aria-current={current.includes(note.n) || undefined}
                        onClick={() => onNote(note.n)}
                        style={{ '--c': `var(--c-${note.cat})` } as CSSProperties}
                        className={cn(
                          'grid w-full gap-0.5 rounded border-l-4 border-(--c) py-1.5 pr-2 pl-3 text-left',
                          'transition-colors duration-150 ease-out hover:bg-ink/5 aria-[current]:bg-ink/5',
                          'outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink',
                        )}
                      >
                        <span className="text-[11px] font-medium tracking-wide text-ink/60 uppercase">
                          {note.n}. {paper.cats[note.cat]}
                        </span>
                        <span className="line-clamp-2 text-sm leading-snug">{note.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </dialog>
  )
}

function PanelButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'rounded px-2 py-1 text-xs font-medium',
        'transition-colors duration-150 ease-out hover:bg-ink/5',
        'outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink',
        className,
      )}
      {...props}
    />
  )
}

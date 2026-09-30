import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { paper } from '@/data/paper'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

type WelcomeProps = {
  open: boolean
  onClose: () => void
  onStart: () => void
}

export function Welcome({ open, onClose, onStart }: WelcomeProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const touch = useMediaQuery('(pointer: coarse)')

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // React doesn't render autoFocus as an attribute, so showModal would land on the first button without this.
      dialog.querySelector<HTMLElement>('[data-start]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="welcome-title"
      aria-describedby="welcome-intro"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        'm-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-white p-0 text-ink shadow-xl',
        'backdrop:bg-ink/40',
        'transition-[opacity,scale,display,overlay] transition-discrete duration-200 ease-out-expo',
        'opacity-0 open:opacity-100 starting:open:opacity-0',
        'open:scale-100 motion-safe:scale-96 motion-safe:starting:open:scale-96',
      )}
    >
      <div className="grid gap-4 p-5">
        <header className="grid gap-1">
          <h2 id="welcome-title" className="text-lg font-semibold text-balance">
            My notes on Bhat et al. (CHI '26)
          </h2>
          <p className="text-sm text-ink/60 italic">
            "In my defense, only three hours on Instagram": Designing Toward Digital Self-Awareness and Wellbeing
          </p>
        </header>

        <p id="welcome-intro" className="text-sm leading-relaxed">
          Every highlight on the paper is one of my notes, and the color tells you what kind of note it is.
        </p>

        <ul aria-label="Note categories" className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {Object.entries(paper.cats).map(([cat, label]) => (
            <li key={cat} className="flex items-center gap-2" style={{ '--c': `var(--c-${cat})` } as CSSProperties}>
              <span className="size-3 shrink-0 rounded-sm bg-(--c)" />
              {label}
            </li>
          ))}
        </ul>

        <ul className="grid gap-1.5 border-t border-ink/10 pt-4 text-sm leading-snug">
          <li>{touch ? 'Tap' : 'Click'} any highlight to open its note.</li>
          <li>
            {touch
              ? 'Prev and Next walk through the notes in reading order.'
              : 'Prev and Next (or the ← → keys) walk through the notes in reading order.'}
          </li>
          <li>Contents, top right, lists every section and note.</li>
        </ul>

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium',
              'transition-colors duration-150 ease-out hover:bg-ink/5',
              'outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink',
            )}
          >
            Just look around
          </button>
          <button
            type="button"
            data-start
            onClick={onStart}
            className={cn(
              'rounded-md bg-ink px-3 py-2 text-sm font-medium text-white',
              'transition-[opacity,scale] duration-150 ease-out hover:opacity-90 active:scale-97',
              'outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink',
            )}
          >
            Start at note 1
          </button>
        </div>
      </div>
    </dialog>
  )
}

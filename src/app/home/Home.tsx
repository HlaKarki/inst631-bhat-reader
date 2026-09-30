import { Fragment, useEffect, useRef, useState } from 'react'
import { paper } from '@/data/paper'
import { cn, sameList } from '@/lib/utils'
import { Contents } from '@/app/home/components/Contents'
import { Sheet } from '@/app/home/components/Sheet'
import { Welcome } from '@/app/home/components/Welcome'
import { stopIndex, stopWith, stops } from '@/app/home/selection'
import type { Selection } from '@/app/home/selection'

const floating = cn(
  'rounded-full bg-white font-medium shadow-[0_1px_4px_rgb(0_0_0/0.2)]',
  'transition-colors duration-150 ease-out hover:bg-ground',
  'outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink',
)

const SEEN = 'welcome-seen'

// Storage can throw in private windows or with site data blocked, so the card just shows again there.
const seen = () => {
  try {
    return localStorage.getItem(SEEN) === '1'
  } catch {
    return false
  }
}

const remember = () => {
  try {
    localStorage.setItem(SEEN, '1')
  } catch {}
}

export default function Home() {
  const [welcome, setWelcome] = useState(() => !seen())
  const [active, setActive] = useState<Selection | null>(null)
  const stepFrom = useRef<string | undefined>(undefined)
  const [menu, setMenu] = useState(false)
  const jump = useRef<number | null>(null)

  const pick = (page: number, notes: number[]) =>
    setActive((prev) => {
      if (notes.length === 0) return null
      return prev?.page === page && sameList(prev.notes, notes) ? prev : { page, notes }
    })

  const step = (dir: 1 | -1) => {
    if (!active) return
    const next = stops[stopIndex(active.notes) + dir]
    if (!next) return
    // The old card goes inert when the step crosses a page, which drops focus, so remember the button now.
    stepFrom.current = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.step : undefined
    setActive(next)
  }

  const go = (i: number) => {
    const stop = stops[i]
    if (stop) setActive(stop)
  }

  const openNote = (n: number) => {
    setMenu(false)
    const stop = stopWith(n)
    if (stop) setActive(stop)
  }

  const openSection = (i: number) => {
    jump.current = i
    setActive(null)
    setMenu(false)
  }

  const dismiss = () => {
    remember()
    setWelcome(false)
  }

  const start = () => {
    dismiss()
    go(0)
  }

  const close = () => {
    if (!active) return
    const lead = stops[stopIndex(active.notes)]?.notes[0]
    setActive(null)
    document.querySelector<HTMLElement>(`[data-lead="${lead}"]`)?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!active || menu || welcome) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(stops.length - 1)
      else return
      e.preventDefault()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!active) return
    const el = document.querySelector(`[data-note="${active.notes[0]}"]`)
    const card = document.querySelector<HTMLElement>('aside:not([inert])')
    if (!el) return

    // Stepping from a Prev or Next button lands on the same button in the new card, so repeated presses keep working.
    const from = stepFrom.current
    stepFrom.current = undefined
    const button = from ? card?.querySelector<HTMLButtonElement>(`[data-step="${from}"]:not(:disabled)`) : null
    const into = button ?? card
    into?.focus({ preventScroll: true })

    const phone = matchMedia('(max-width: 639px)').matches
    const boxes = [el, ...(card && !phone ? [card] : [])].map((e) => e.getBoundingClientRect())
    const top = Math.min(...boxes.map((b) => b.top))
    const bottom = Math.max(...boxes.map((b) => b.bottom))
    // The phone's bottom sheet covers the lower 40% of the screen, so a passage behind it counts as off screen.
    const floor = innerHeight * (phone ? 0.6 : 1)
    if (top >= 0 && bottom <= floor) return
    // iOS doesn't redraw the fixed bottom sheet after a smooth scroll until the user scrolls, so phones jump instead.
    const smooth = !phone && !matchMedia('(prefers-reduced-motion: reduce)').matches
    const slack = Math.max(floor - (bottom - top), 0)
    scrollBy({ top: top - Math.min(slack / 2, innerHeight * 0.1), behavior: smooth ? 'smooth' : 'auto' })
  }, [active])

  // The dialog hands focus back to its opener when it closes, so the section jump waits for that before taking focus.
  useEffect(() => {
    if (menu || jump.current === null) return
    const heading = document.getElementById(`section-${jump.current}`)
    jump.current = null
    heading?.focus({ preventScroll: true })
    const smooth = !matchMedia('(max-width: 639px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches
    heading?.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' })
  }, [menu])

  return (
    <main
      className="grid justify-items-center gap-8 py-8"
      onClick={(e) => e.target === e.currentTarget && setActive(null)}
    >
      <h1 className="sr-only">WellScreen Annotated: notes on Bhat et al., CHI 2026</h1>
      <p className="sr-only">
        Each highlight is a button that opens its note. With a note open, the left and right arrow keys move to the
        previous and next note, Home and End jump to the first and last note, and Escape closes it. The Contents button
        lists every section and note, and the How to read this button shows the introduction again.
      </p>
      <div className="fixed top-[calc(0.75rem+env(safe-area-inset-top))] right-3 z-20 flex gap-2">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={welcome}
          aria-label="How to read this"
          onClick={() => setWelcome(true)}
          className={cn(floating, 'size-9 text-base')}
        >
          ?
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menu}
          onClick={() => setMenu(true)}
          className={cn(floating, 'px-3.5 py-2 text-sm')}
        >
          Contents
        </button>
      </div>
      <Welcome open={welcome} onClose={dismiss} onStart={start} />
      <Contents
        open={menu}
        current={active?.notes ?? []}
        onClose={() => setMenu(false)}
        onNote={openNote}
        onSection={openSection}
      />
      {Array.from({ length: paper.pages }, (_, i) => i + 1).map((p) => (
        <Fragment key={p}>
          <Sheet
            page={p}
            notes={paper.notes.filter((n) => n.page === p)}
            strips={paper.strips.filter((s) => s.page === p)}
            sections={paper.toc.map((t, i) => ({ ...t, i })).filter((t) => t.page === p)}
            cats={paper.cats}
            selection={active?.page === p ? active : null}
            onPick={(notes) => pick(p, notes)}
            onStep={step}
            onClose={close}
            onMenu={() => setMenu(true)}
          />
        </Fragment>
      ))}
    </main>
  )
}

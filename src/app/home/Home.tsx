import { Fragment, useEffect, useRef, useState } from 'react'
import { paper } from '@/data/paper'
import { sameList } from '@/lib/utils'
import { Sheet } from '@/app/home/components/Sheet'
import { stopIndex, stops } from '@/app/home/selection'
import type { Selection } from '@/app/home/selection'

export default function Home() {
  const [active, setActive] = useState<Selection | null>(null)
  const stepFrom = useRef<string | undefined>(undefined)

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

  const close = () => {
    if (!active) return
    const lead = stops[stopIndex(active.notes)]?.notes[0]
    setActive(null)
    document.querySelector<HTMLElement>(`[data-lead="${lead}"]`)?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
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

  return (
    <main
      className="grid justify-items-center gap-8 py-8"
      onClick={(e) => e.target === e.currentTarget && setActive(null)}
    >
      <h1 className="sr-only">WellScreen Annotated: notes on Bhat et al., CHI 2026</h1>
      <p className="sr-only">
        Each highlight is a button that opens its note. With a note open, the left and right arrow keys move to the
        previous and next note, and Escape closes it.
      </p>
      {Array.from({ length: paper.pages }, (_, i) => i + 1).map((p) => (
        <Fragment key={p}>
          <Sheet
            page={p}
            notes={paper.notes.filter((n) => n.page === p)}
            strips={paper.strips.filter((s) => s.page === p)}
            cats={paper.cats}
            selection={active?.page === p ? active : null}
            onPick={(notes) => pick(p, notes)}
            onStep={step}
            onClose={close}
          />
        </Fragment>
      ))}
    </main>
  )
}

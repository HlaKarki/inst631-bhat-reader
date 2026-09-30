import { Fragment, useEffect, useRef, useState } from 'react'
import { paper } from '@/data/paper'
import { sameList } from '@/lib/utils'
import { Sheet } from '@/app/home/components/Sheet'
import { stopIndex, stops } from '@/app/home/selection'
import type { Selection } from '@/app/home/selection'

export default function Home() {
  const [active, setActive] = useState<Selection | null>(null)
  const target = useRef<number | null>(null)

  const pick = (page: number, notes: number[]) =>
    setActive((prev) => {
      if (notes.length === 0) return null
      return prev?.page === page && sameList(prev.notes, notes) ? prev : { page, notes }
    })

  const step = (dir: 1 | -1) => {
    if (!active) return
    const next = stops[stopIndex(active.notes) + dir]
    if (!next) return
    target.current = next.notes[0]
    setActive(next)
  }

  useEffect(() => {
    const n = target.current
    target.current = null
    const el = n && document.querySelector(`[data-note="${n}"]`)
    if (!el) return
    const phone = matchMedia('(max-width: 639px)').matches
    const card = document.querySelector('aside:not([inert])')
    const boxes = [el, ...(card && !phone ? [card] : [])].map((e) => e.getBoundingClientRect())
    const top = Math.min(...boxes.map((b) => b.top))
    const bottom = Math.max(...boxes.map((b) => b.bottom))
    // The phone's bottom sheet covers the lower 40% of the screen, so a passage behind it counts as off screen.
    const floor = innerHeight * (phone ? 0.6 : 1)
    if (top >= 0 && bottom <= floor) return
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    const slack = Math.max(floor - (bottom - top), 0)
    scrollBy({ top: top - Math.min(slack / 2, innerHeight * 0.1), behavior: smooth ? 'smooth' : 'auto' })
  }, [active])

  return (
    <main
      className="grid justify-items-center gap-8 py-8"
      onClick={(e) => e.target === e.currentTarget && setActive(null)}
    >
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
          />
        </Fragment>
      ))}
    </main>
  )
}

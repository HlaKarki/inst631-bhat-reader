import { useState } from 'react'
import { paper } from '@/data/paper'
import { sameList } from '@/lib/utils'
import { Sheet } from '@/app/home/components/Sheet'

type Selection = { page: number; notes: number[] }

const none: number[] = []

export default function Home() {
  const [active, setActive] = useState<Selection | null>(null)

  const pick = (page: number, notes: number[]) =>
    setActive((prev) => {
      if (notes.length === 0) return prev?.page === page ? null : prev
      return prev?.page === page && sameList(prev.notes, notes) ? prev : { page, notes }
    })

  return (
    <main className="grid justify-items-center gap-8 py-8">
      {Array.from({ length: paper.pages }, (_, i) => i + 1).map((p) => (
        <>
          <Sheet
            key={p}
            page={p}
            notes={paper.notes.filter((n) => n.page === p)}
            strips={paper.strips.filter((s) => s.page === p)}
            cats={paper.cats}
            active={active?.page === p ? active.notes : none}
            onPick={(notes) => pick(p, notes)}
          />
        </>
      ))}
    </main>
  )
}

import { paper } from '@/data/paper'
import { Sheet } from '@/app/home/components/Sheet'

export default function Home() {
  return (
    <main className="grid justify-items-center gap-8 py-8">
      {Array.from({ length: paper.pages }, (_, i) => i + 1).map((p) => (
        <Sheet key={p} page={p} notes={paper.notes.filter((n) => n.page === p)} cats={paper.cats} />
      ))}
    </main>
  )
}

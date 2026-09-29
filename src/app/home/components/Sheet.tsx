import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'
import { NoteHighlight } from '@/app/home/components/NoteHighlight'

type SheetProps = {
  page: number
  notes: Note[]
  cats: Record<string, string>
}

export function Sheet({ page, notes, cats }: SheetProps) {
  return (
    <section className={cn('relative w-full max-w-[816px]', 'shadow-[0_1px_4px_rgb(0_0_0/0.15)]')} id={`p${page}`}>
      <img
        src={`pages/p${String(page).padStart(2, '0')}.jpg`}
        alt={`Page ${page} of the paper`}
        loading={page <= 2 ? 'eager' : 'lazy'}
        className="w-full"
      />
      {notes.map((note) => (
        <NoteHighlight key={note.n} note={note} label={`${note.n}. ${cats[note.cat]}`} />
      ))}
    </section>
  )
}

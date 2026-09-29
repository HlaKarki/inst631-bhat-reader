import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Note } from '@/lib/types'
import { cn } from '@/lib/utils'

export function NoteHighlight({ note, label }: { note: Note; label: string }) {
  const [lit, setLit] = useState(false)

  return note.rects.map(([x, y, w, h], i) => (
    <div
      key={i}
      className={cn(
        'absolute mix-blend-multiply',
        'bg-(--c)',
        'transition-opacity duration-150',
        lit ? 'opacity-62' : 'opacity-25',
      )}
      title={label}
      style={
        {
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: `${w * 100}%`,
          height: `${h * 100 * 1.2}%`,
          '--c': `var(--c-${note.cat})`,
        } as CSSProperties
      }
      onPointerEnter={() => setLit(true)}
      onPointerLeave={() => setLit(false)}
    />
  ))
}

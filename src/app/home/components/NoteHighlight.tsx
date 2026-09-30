import type { CSSProperties } from 'react'
import type { Note, Rect } from '@/lib/types'
import { cn } from '@/lib/utils'

export type HighlightState = 'idle' | 'lit' | 'dim'

type NoteHighlightProps = {
  note: Note
  rects: Rect[]
  src: string
  state: HighlightState
}

export function NoteHighlight({ note, rects, src, state }: NoteHighlightProps) {
  return rects.map(([x, y, w, h], i) => {
    const hh = h * 1.2
    return (
      <div
        key={i}
        data-note={note.n}
        className={cn('absolute cursor-pointer', state === 'lit' && 'z-2')}
        style={
          {
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            width: `${w * 100}%`,
            height: `${hh * 100}%`,
            '--c': `var(--c-${note.cat})`,
          } as CSSProperties
        }
      >
        {/* An unblurred slice of the page, so the passage stays readable while the page behind it blurs. */}
        <div
          className={cn(
            'absolute inset-0 bg-no-repeat',
            'transition-opacity duration-200 ease-out',
            state === 'lit' ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${100 / w}% ${100 / hh}%`,
            backgroundPosition: `${(x / (1 - w)) * 100}% ${(y / (1 - hh)) * 100}%`,
          }}
        />
        <div
          className={cn(
            'absolute inset-0 mix-blend-multiply',
            'bg-(--c)',
            'transition-[opacity,filter] duration-200 ease-out',
            state === 'lit' ? 'opacity-62' : 'opacity-25',
            state === 'dim' && 'blur-[3px]',
          )}
        />
      </div>
    )
  })
}

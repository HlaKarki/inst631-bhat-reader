import type { CSSProperties } from 'react'
import type { Note, Rect } from '@/lib/types'
import { cn } from '@/lib/utils'

export type HighlightState = 'idle' | 'lit' | 'dim'

type NoteHighlightProps = {
  note: Note
  rects: Rect[]
  src: string
  state: HighlightState
  lead?: { at: number; label: string; expanded: boolean; controls: string; onOpen: () => void }
}

export function NoteHighlight({ note, rects, src, state, lead }: NoteHighlightProps) {
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
        {lead?.at === i && (
          <button
            type="button"
            data-lead={note.n}
            aria-label={lead.label}
            aria-expanded={lead.expanded}
            aria-controls={lead.controls}
            className={cn(
              'absolute inset-0 cursor-pointer',
              'rounded-xs outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink',
            )}
            // Keyboard presses report no pointer position for the page's hit test, so they open this group directly.
            onClick={(e) => {
              if (e.detail !== 0) return
              e.stopPropagation()
              lead.onOpen()
            }}
          />
        )}
      </div>
    )
  })
}

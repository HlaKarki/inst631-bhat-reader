import './style.css'
import raw from './data.json'
import type { ReaderData } from './types'

const data = raw as unknown as ReaderData
const app = document.querySelector<HTMLDivElement>('#app')!

for (let p = 1; p <= data.pages; p++) {
  const sheet = document.createElement('section')
  sheet.className = 'sheet'
  sheet.id = `p${p}`

  const img = document.createElement('img')
  img.src = `pages/p${String(p).padStart(2, '0')}.jpg`
  img.alt = `Page ${p} of the paper`
  img.loading = p <= 2 ? 'eager' : 'lazy'
  sheet.append(img)

  for (const note of data.notes.filter((n) => n.page === p)) {
    for (const [x, y, w, h] of note.rects) {
      const hl = document.createElement('div')
      hl.className = 'hl'
      hl.title = `${note.n}. ${data.cats[note.cat]}`
      Object.assign(hl.style, { left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` })
      sheet.append(hl)
    }
  }

  app.append(sheet)
}

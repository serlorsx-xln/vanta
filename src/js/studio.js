import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { app, $, $$ } from './app.js'

export function initStudio() {
  // studio status from each city's local time (Mon–Fri, 09:00–19:00)
  const parts = {}
  const status = () => {
    const now = new Date()
    $$('[data-status]').forEach((el) => {
      const tz = el.dataset.status
      parts[tz] ||= new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', hour: 'numeric', hour12: false })
      const p = Object.fromEntries(parts[tz].formatToParts(now).map((x) => [x.type, x.value]))
      const h = +p.hour % 24
      const weekday = !['Sat', 'Sun'].includes(p.weekday)
      const open = weekday && h >= 9 && h < 19
      el.classList.toggle('is-open', open)
      el.textContent = open ? 'Studio open' : weekday && h < 9 ? 'Opens at 09:00' : weekday ? 'Closed — back at 09:00' : 'Closed for the weekend'
    })
  }
  status()
  setInterval(status, 30000)

  if (app.reduced) return

  // the statement sets line by line
  const statement = $('.studio__statement')
  SplitText.create(statement, {
    type: 'lines', mask: 'lines', linesClass: 'st-line', autoSplit: true,
    onSplit: (self) => gsap.from(self.lines, {
      yPercent: 125, duration: 1.3, ease: 'expo.out', stagger: 0.09,
      scrollTrigger: { trigger: statement, start: 'top 80%', once: true },
    }),
  })

  const blocks = $$('.studio .folio > *, .facts > div, .city, .people, .careers, .clients')
  blocks.forEach((b) => {
    gsap.from(b, {
      opacity: 0, y: 24, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: b, start: 'top 88%', once: true },
    })
  })
}

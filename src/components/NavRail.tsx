import { RAW_CHAPTERS, TR_CHAPTERS } from '../data/timeline'
import type { BuiltChapter } from '../lib/timelineLogic'
import type { Language } from '../data/types'

interface Props {
  chapters: BuiltChapter[]
  activeIdx: number
  show: boolean
  language: Language
  onSelect: (idx: number) => void
}

export default function NavRail({ chapters, activeIdx, show, language, onSelect }: Props) {
  if (!show) return null
  const isEn = language === 'en'
  const visible = chapters.filter((c) => c.hasVisible)

  return (
    <div id="nav-rail" style={{ position: 'fixed', top: '50%', right: 18, transform: 'translateY(-50%)', zIndex: 55, display: 'flex', flexDirection: 'column', gap: 11 }}>
      {visible.map((c) => {
        const active = c.idx === activeIdx
        const short = isEn && TR_CHAPTERS[c.num] ? TR_CHAPTERS[c.num].short : RAW_CHAPTERS[c.idx].shortTitle
        return (
          <button
            key={c.idx}
            type="button"
            onClick={() => onSelect(c.idx)}
            style={{
              textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 6,
              height: 23, padding: '4px 9px', borderRadius: 14, cursor: 'pointer', border: `1px solid ${active ? c.accent : 'var(--line)'}`,
              boxShadow: '0 1px 4px rgba(0,0,0,.06)', background: active ? c.accent : 'var(--card-bg)',
              color: active ? '#fff' : 'var(--ink)', fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all .2s ease',
            }}
          >
            <span style={{ opacity: 0.7 }}>{Number(c.num)}</span>
            <span>{short}</span>
          </button>
        )
      })}
    </div>
  )
}

import type { BuiltChapter } from '../lib/timelineLogic'
import TimelineCard from './TimelineCard'
import LaneCard from './LaneCard'

interface LayoutProps {
  sidePad: number
  zigzagCols: string
  laneGap: string
  chapterTopPad: number
  chapterFontSize: number
  yearFontSize: number
}

interface Props {
  chapter: BuiltChapter
  layout: LayoutProps
}

export default function ChapterSection({ chapter: c, layout }: Props) {
  const { sidePad, zigzagCols, laneGap, chapterTopPad, chapterFontSize, yearFontSize } = layout

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: `${chapterTopPad}px ${sidePad}px ${chapterTopPad}px` }}>
      <div data-chapter-idx={c.idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: c.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, lineHeight: 1 }}>
          {Number(c.num)}
        </div>
        <div style={{ fontSize: chapterFontSize, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{c.title}</div>
        <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--sub)' }}>{c.period}</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--sub)', fontStyle: 'italic', margin: '6px 0 6px 42px' }}>{c.theme}</div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0, bottom: 0, width: 4, background: c.lineColor, zIndex: 0 }} />
        {c.groups.map((grp, gi) => (
          <div key={gi}>
            <div style={{ textAlign: 'center', margin: `${grp.marginTop}px 0 6px`, position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: yearFontSize, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', display: 'inline-block', padding: '2px 14px', background: 'var(--bg)' }}>
                {grp.label}
              </span>
            </div>
            {grp.isSpine && grp.rows.map((n) => (
              <div key={n.id} style={{ display: 'grid', gridTemplateColumns: zigzagCols, alignItems: 'center', padding: '6px 0', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{n.showLeft && <TimelineCard node={n} showTags />}</div>
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
                  <div style={{ width: n.dotSize, height: n.dotSize, borderRadius: '50%', background: n.dotColor, border: '2px solid var(--card-bg)', boxShadow: `0 0 0 1.5px ${n.dotColor}` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>{n.showRight && <TimelineCard node={n} showTags />}</div>
              </div>
            ))}
            {grp.isOverlap && (
              <div style={{ padding: '4px 0', margin: '0 0 6px', position: 'relative' }}>
                <div style={{ display: 'grid', gridTemplateColumns: `1fr ${laneGap} 1fr` }}>
                  {grp.rows.map((row) => (
                    <div key={row.rowNum} style={{ display: 'contents' }}>
                      <div style={{ gridColumn: 1, gridRow: row.rowNum, display: 'flex', justifyContent: 'flex-end', padding: '3.5px 0' }}>
                        {row.l && <LaneCard node={row.l} laneColor={grp.laneLColor} laneLabel={grp.laneLLabel} />}
                      </div>
                      <div style={{ gridColumn: 2, gridRow: row.rowNum, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: row.dotSize, height: row.dotSize, borderRadius: '50%', background: row.dotColor, border: '2px solid var(--card-bg)', boxShadow: `0 0 0 1.5px ${row.dotColor}`, flexShrink: 0 }} />
                      </div>
                      <div style={{ gridColumn: 3, gridRow: row.rowNum, display: 'flex', justifyContent: 'flex-start', padding: '3.5px 0' }}>
                        {row.r && <LaneCard node={row.r} laneColor={grp.laneRColor} laneLabel={grp.laneRLabel} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

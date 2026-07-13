import type { DecoratedNode } from '../lib/timelineLogic'

interface Props {
  node: DecoratedNode
  showTags?: boolean
}

export default function TimelineCard({ node: n, showTags = false }: Props) {
  return (
    <div
      className="card"
      data-reveal={n.id}
      style={{
        opacity: n.revealOpacity, transform: `translateY(${n.revealY}px)`, transition: 'opacity .5s ease, transform .5s ease',
        background: 'var(--card-bg)', border: `1px solid ${n.borderColor}`, borderRadius: 9, padding: '7px 11px',
        width: 'var(--card-w, 235px)', maxWidth: 'var(--card-maxw, 235px)', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 11 }}>{n.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: n.color }}>{n.category}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9.5, color: 'var(--sub)', fontVariantNumeric: 'tabular-nums' }}>{n.period}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
        {n.milestone ? '⭐ ' : ''}{n.title}
      </div>
      {n.showSub && <div style={{ fontSize: 10, color: 'var(--sub)' }}>{n.sub}</div>}
      {showTags && n.tags && n.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
          {n.tags.map((t) => (
            <span key={t} style={{ fontSize: 9, color: 'var(--sub)', background: 'var(--tag-bg)', padding: '1px 6px', borderRadius: 5 }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

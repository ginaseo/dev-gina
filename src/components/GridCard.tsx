import { GRAY } from '../data/colors'
import type { DecoratedNode } from '../lib/timelineLogic'

interface Props {
  node: DecoratedNode
}

export default function GridCard({ node: n }: Props) {
  return (
    <div
      className="card"
      data-reveal={n.id}
      style={{
        opacity: n.revealOpacity, transform: `translateY(${n.revealY}px)`, transition: 'opacity .5s ease, transform .5s ease',
        background: 'var(--card-bg)', border: `1px solid ${n.borderColor}`, borderRadius: 10, padding: '9px 13px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12 }}>{n.icon}</span>
        {n.category && <span style={{ fontSize: 9, fontWeight: 700, color: n.color || GRAY }}>{n.category}</span>}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--sub)' }}>{n.period}</span>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginTop: 2 }}>
        {n.milestone ? '⭐ ' : ''}{n.title}
      </div>
      {n.showSub && <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 2 }}>{n.sub}</div>}
    </div>
  )
}

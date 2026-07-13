import type { DecoratedNode } from '../lib/timelineLogic'

interface Props {
  node: DecoratedNode
  laneColor: string
  laneLabel: string
}

export default function LaneCard({ node: n, laneColor, laneLabel }: Props) {
  return (
    <div
      className="card"
      data-reveal={n.id}
      style={{
        opacity: n.revealOpacity, transform: `translateY(${n.revealY}px)`, transition: 'opacity .5s ease, transform .5s ease',
        background: 'var(--card-bg)', border: `1px solid ${n.borderColor}`, borderRadius: 9, padding: '7px 10px',
        display: 'flex', flexDirection: 'column', gap: 1,
        width: 'var(--card-w, 235px)', maxWidth: 'var(--card-maxw, 235px)', boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 11 }}>{n.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: laneColor }}>{laneLabel}</span>
        <span style={{ marginLeft: 'auto', fontSize: 9.5, color: 'var(--sub)', fontVariantNumeric: 'tabular-nums' }}>{n.period}</span>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
        {n.milestone ? '⭐ ' : ''}{n.title}
      </div>
      {n.showSub && <div style={{ fontSize: 9.5, color: 'var(--sub)' }}>{n.sub}</div>}
    </div>
  )
}

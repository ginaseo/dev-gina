import { CATEGORIES } from '../data/timeline'
import { GRAY } from '../data/colors'
import { decorateFlat, flatNodes, nodeMatchesFilter, nodeMatchesSearch, type FilterState } from '../lib/timelineLogic'
import GridCard from './GridCard'

interface Props {
  opts: FilterState
  searchQuery: string
  sidePad: number
  gridCols: string
}

export default function YearView({ opts, searchQuery, sidePad, gridCols }: Props) {
  const q = searchQuery.trim().toLowerCase()
  const all = flatNodes()
  const years = Array.from(new Set(all.map((n) => n.year))).sort((a, b) => b - a)
  const groups = years
    .map((y) => {
      const nodes = all
        .filter((n) => n.year === y && nodeMatchesFilter(n, opts.activeCategory) && nodeMatchesSearch(n, q))
        .map((n) => ({ ...n, color: CATEGORIES.find((c) => c.name === n.category)?.color || GRAY }))
        .map((n) => decorateFlat(n, opts))
      return { year: y, nodes }
    })
    .filter((g) => g.nodes.length > 0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: `28px ${sidePad}px 4px` }}>
      {groups.map((grp) => (
        <div key={grp.year} style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid var(--line)' }}>
            {grp.year}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 10 }}>
            {grp.nodes.map((n) => <GridCard key={n.id} node={n} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

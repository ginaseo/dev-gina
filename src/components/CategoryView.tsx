import { CATEGORIES } from '../data/timeline'
import { decorateFlat, flatNodes, nodeMatchesSearch, tCat, type FilterState } from '../lib/timelineLogic'
import GridCard from './GridCard'

interface Props {
  opts: FilterState
  searchQuery: string
  sidePad: number
  gridCols: string
}

export default function CategoryView({ opts, searchQuery, sidePad, gridCols }: Props) {
  const q = searchQuery.trim().toLowerCase()
  const all = flatNodes()
  const groups = CATEGORIES
    .filter((cat) => opts.activeCategory === '전체' || cat.name === opts.activeCategory)
    .map((cat) => {
      const nodes = all.filter((n) => (n.category === cat.name || n.altCategory === cat.name) && nodeMatchesSearch(n, q)).map((n) => decorateFlat(n, opts))
      const count = opts.language === 'en' ? `${nodes.length} items` : `${nodes.length}건`
      return { name: tCat(cat.name, opts.language), icon: cat.icon, count, nodes }
    })
    .filter((g) => g.nodes.length > 0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: `28px ${sidePad}px 4px` }}>
      {groups.map((grp) => (
        <div key={grp.name} style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>{grp.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{grp.name}</span>
            <span style={{ fontSize: 11.5, color: 'var(--sub)' }}>{grp.count}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 10 }}>
            {grp.nodes.map((n) => <GridCard key={n.id} node={n} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

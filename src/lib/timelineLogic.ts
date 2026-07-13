import { GOLD } from '../data/colors'
import { RAW_CHAPTERS, TR_CATEGORIES, TR_CHAPTERS, TR_NODES } from '../data/timeline'
import type { Language, LaneNode, TimelineNode, ViewMode, DisplayMode } from '../data/types'

export interface DecoratedNode {
  id: string
  category?: string
  color?: string
  icon: string
  title: string
  sub?: string
  period: string
  milestone?: string
  tags?: string[]
  revealOpacity: number
  revealY: number
  showSub: boolean
  borderColor: string
  dotColor: string
  dotSize: number
}

export interface SpineRow extends DecoratedNode {
  showLeft: boolean
  showRight: boolean
}

export interface OverlapRow {
  rowNum: number
  l: DecoratedNode | null
  r: DecoratedNode | null
  dotColor: string
  dotSize: number
}

export interface SpineGroup {
  isSpine: true
  isOverlap: false
  label: string
  marginTop: number
  rows: SpineRow[]
}

export interface OverlapGroup {
  isSpine: false
  isOverlap: true
  label: string
  marginTop: number
  rows: OverlapRow[]
  laneLLabel: string
  laneLColor: string
  laneRLabel: string
  laneRColor: string
}

export type Group = SpineGroup | OverlapGroup

export interface BuiltChapter {
  idx: number
  num: string
  title: string
  period: string
  theme: string
  accent: string
  lineColor: string
  hasVisible: boolean
  groups: Group[]
}

export interface FlatNode extends TimelineNode {
  year: number
}

interface FilterState {
  activeCategory: string
  language: Language
  displayMode: DisplayMode
  isMobile: boolean
  revealed: Set<string>
}

export function nodeMatchesFilter(node: { category: string; altCategory?: string }, category: string): boolean {
  return category === '전체' || node.category === category || node.altCategory === category
}

export function nodeMatchesSearch(node: { title: string; sub?: string; category?: string; alias?: string }, q: string): boolean {
  if (!q) return true
  const hay = [node.title, node.sub, node.category, node.alias].filter(Boolean).join(' ').toLowerCase()
  return hay.includes(q)
}

function reveal(id: string | undefined, revealed: Set<string>): { opacity: number; y: number } {
  const r = id ? revealed.has(id) : true
  return { opacity: r ? 1 : 0, y: r ? 0 : 14 }
}

export function tCat(name: string, language: Language): string {
  return language === 'en' ? TR_CATEGORIES[name] || name : name
}

function tNode<T extends { id: string; title: string; sub?: string; category?: string }>(raw: T, language: Language): T {
  const tr = TR_NODES[raw.id]
  if (language === 'en' && tr) {
    return { ...raw, title: tr.title, sub: tr.sub, category: raw.category ? tCat(raw.category, language) : raw.category }
  }
  return { ...raw, category: raw.category ? tCat(raw.category, language) : raw.category }
}

function decorate(raw: TimelineNode | LaneNode, opts: FilterState): DecoratedNode {
  const n = tNode(raw, opts.language) as TimelineNode
  const rv = reveal(n.id, opts.revealed)
  return {
    id: n.id,
    category: n.category,
    color: n.color,
    icon: n.icon,
    title: n.title,
    sub: n.sub,
    period: n.period,
    milestone: n.milestone,
    tags: n.tags,
    revealOpacity: rv.opacity,
    revealY: rv.y,
    showSub: opts.displayMode === 'detailed' && !!n.sub,
    borderColor: n.milestone ? GOLD : 'var(--line)',
    dotColor: n.milestone ? GOLD : n.color ?? 'var(--sub)',
    dotSize: n.milestone ? 12 : 8,
  }
}

export function buildChapters(opts: FilterState & { activeIdx: number; searchQuery: string }): BuiltChapter[] {
  const q = opts.searchQuery.trim().toLowerCase()
  let sideCounter = 0

  return RAW_CHAPTERS.map((c, ci) => {
    const filled = ci <= opts.activeIdx
    const lineColor = filled ? 'var(--filled-line)' : 'var(--unfilled-line)'
    const groups: Group[] = []
    let lastLabel: string | null = null
    let spineGroup: SpineGroup | null = null

    c.blocks.forEach((b) => {
      if (b.kind === 'node') {
        const n = b.node
        if (!nodeMatchesFilter(n, opts.activeCategory) || !nodeMatchesSearch(n, q)) return
        if (b.label !== lastLabel || !spineGroup) {
          spineGroup = { isSpine: true, isOverlap: false, label: b.label, marginTop: groups.length === 0 ? 2 : 24, rows: [] }
          groups.push(spineGroup)
          lastLabel = b.label
        }
        const side = opts.isMobile ? 'right' : sideCounter % 2 === 0 ? 'left' : 'right'
        sideCounter++
        const dn = decorate(n, opts)
        spineGroup.rows.push({ ...dn, showLeft: side === 'left', showRight: side === 'right' })
      } else {
        const laneLVisible = b.laneL.filter((n) => nodeMatchesFilter({ ...n, category: b.laneLCategory }, opts.activeCategory) && nodeMatchesSearch(n, q))
        const laneRVisible = b.laneR.filter((n) => nodeMatchesFilter({ ...n, category: b.laneRCategory }, opts.activeCategory) && nodeMatchesSearch(n, q))
        if (laneLVisible.length === 0 && laneRVisible.length === 0) return
        const laneLNodes = laneLVisible.map((n) => decorate(n, opts))
        const laneRNodes = laneRVisible.map((n) => decorate(n, opts))
        const maxLen = Math.max(laneLNodes.length, laneRNodes.length)
        const rows: OverlapRow[] = []
        for (let i = 0; i < maxLen; i++) {
          const l = laneLNodes[i] || null
          const r = laneRNodes[i] || null
          const dc = l && r ? lineColor : l ? b.laneLColor : b.laneRColor
          rows.push({ rowNum: i + 1, l, r, dotColor: dc, dotSize: (l && l.milestone) || (r && r.milestone) ? 12 : 8 })
        }
        groups.push({
          isSpine: false, isOverlap: true, label: b.label, marginTop: groups.length === 0 ? 2 : 24, rows,
          laneLLabel: tCat(b.laneLLabel, opts.language), laneLColor: b.laneLColor,
          laneRLabel: tCat(b.laneRLabel, opts.language), laneRColor: b.laneRColor,
        })
        lastLabel = null
        spineGroup = null
      }
    })

    const trC = TR_CHAPTERS[c.num]
    const isEn = opts.language === 'en'
    return {
      idx: ci, num: c.num, title: isEn && trC ? trC.title : c.title, period: c.period,
      theme: isEn && trC ? trC.theme : c.theme, accent: c.accent, lineColor, hasVisible: groups.length > 0, groups,
    }
  })
}

export function flatNodes(): FlatNode[] {
  const out: FlatNode[] = []
  RAW_CHAPTERS.forEach((c) => c.blocks.forEach((b) => {
    if (b.kind === 'node') {
      out.push({ ...b.node, year: parseInt(b.node.period, 10) })
    } else {
      b.laneL.forEach((n) => out.push({ ...n, category: b.laneLCategory, year: parseInt(n.period, 10) } as FlatNode))
      b.laneR.forEach((n) => out.push({ ...n, category: b.laneRCategory, year: parseInt(n.period, 10) } as FlatNode))
    }
  }))
  return out
}

export function decorateFlat(raw: FlatNode, opts: FilterState): DecoratedNode {
  return decorate(raw, opts)
}

export function firstVisibleChapterIdx(cat: string): number {
  for (let i = 0; i < RAW_CHAPTERS.length; i++) {
    const c = RAW_CHAPTERS[i]
    const has = c.blocks.some((b) => {
      if (b.kind === 'node') return nodeMatchesFilter(b.node, cat)
      const lMatch = b.laneL.some((n) => nodeMatchesFilter({ ...n, category: b.laneLCategory }, cat))
      const rMatch = b.laneR.some((n) => nodeMatchesFilter({ ...n, category: b.laneRCategory }, cat))
      return lMatch || rMatch
    })
    if (has) return i
  }
  return 0
}

export type { FilterState }
export type { Language as TLanguage, ViewMode as TViewMode, DisplayMode as TDisplayMode }

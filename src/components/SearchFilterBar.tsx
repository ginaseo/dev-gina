import { useLayoutEffect, useRef } from 'react'
import { CATEGORIES } from '../data/timeline'
import { INK } from '../data/colors'
import { tCat } from '../lib/timelineLogic'
import type { DisplayMode, Language, ViewMode } from '../data/types'

interface Props {
  language: Language
  searchQuery: string
  onSearchChange: (q: string) => void
  activeCategory: string
  onSetCategory: (cat: string) => void
  viewMode: ViewMode
  onSetViewMode: (mode: ViewMode) => void
  displayMode: DisplayMode
  onSetDisplayMode: (mode: DisplayMode) => void
  isMobile: boolean
}

const CHIPS = [{ name: '전체', icon: '⭐', color: INK }, ...CATEGORIES]

const viewOptsKo = [{ key: 'timeline' as ViewMode, label: '타임라인' }, { key: 'category' as ViewMode, label: '카테고리' }, { key: 'year' as ViewMode, label: '연도' }]
const viewOptsEn = [{ key: 'timeline' as ViewMode, label: 'Timeline' }, { key: 'category' as ViewMode, label: 'Category' }, { key: 'year' as ViewMode, label: 'Year' }]
const dispOptsKo = [{ key: 'compact' as DisplayMode, label: '간략히' }, { key: 'detailed' as DisplayMode, label: '자세히' }]
const dispOptsEn = [{ key: 'compact' as DisplayMode, label: 'Compact' }, { key: 'detailed' as DisplayMode, label: 'Detailed' }]

export default function SearchFilterBar({
  language, searchQuery, onSearchChange, activeCategory, onSetCategory,
  viewMode, onSetViewMode, displayMode, onSetDisplayMode, isMobile,
}: Props) {
  const chipRowRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    const el = chipRowRef.current
    const input = searchInputRef.current
    if (!el || !input || !el.children.length) return
    const first = el.children[0].getBoundingClientRect()
    const last = el.children[el.children.length - 1].getBoundingClientRect()
    const w = Math.round(last.right - first.left)
    input.style.width = `${w}px`
  }, [isMobile, language])

  const isEn = language === 'en'
  const viewOpts = isEn ? viewOptsEn : viewOptsKo
  const dispOpts = isEn ? dispOptsEn : dispOptsKo

  return (
    <div style={{ position: 'sticky', top: 3, zIndex: 40, background: 'var(--sticky-bg)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--line)', padding: '10px 0' }}>
      <div id="search-wrap" style={{ maxWidth: 900, margin: '0 auto', padding: `0 ${isMobile ? 20 : 24}px 8px`, textAlign: 'center' }}>
        <input
          ref={searchInputRef}
          type="text"
          id="search-input"
          aria-label="타임라인 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, background: 'var(--card-bg)', color: 'var(--ink)' }}
        />
      </div>
      <div id="chip-row" ref={chipRowRef} style={{ maxWidth: 900, margin: '0 auto', padding: `0 ${isMobile ? 20 : 24}px 8px`, display: 'flex', justifyContent: isMobile ? 'flex-start' : 'center', gap: 7, overflowX: 'auto' }}>
        {CHIPS.map((cat) => {
          const active = activeCategory === cat.name
          return (
            <button
              key={cat.name}
              type="button"
              aria-pressed={active}
              onClick={() => onSetCategory(cat.name)}
              style={{
                flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20, border: `1px solid ${active ? cat.color : 'var(--line)'}`,
                background: active ? cat.color : 'var(--card-bg)', color: active ? '#fff' : 'var(--ink)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color }} />
              {cat.icon} {tCat(cat.name, language)}
            </button>
          )
        })}
      </div>
      <div id="mode-toggles" style={{ maxWidth: 900, margin: '0 auto', padding: `2px ${isMobile ? 20 : 24}px 0`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 2, background: 'var(--chip-track-bg)', borderRadius: 9, padding: 2 }}>
          {viewOpts.map((o) => {
            const active = o.key === viewMode
            return (
              <button key={o.key} type="button" aria-pressed={active} onClick={() => onSetViewMode(o.key)}
                style={{ border: 'none', padding: '6px 11px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', background: active ? 'var(--card-bg)' : 'transparent', color: active ? 'var(--ink)' : 'var(--sub)' }}>
                {o.label}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'var(--chip-track-bg)', borderRadius: 9, padding: 2 }}>
          {dispOpts.map((o) => {
            const active = o.key === displayMode
            return (
              <button key={o.key} type="button" aria-pressed={active} onClick={() => onSetDisplayMode(o.key)}
                style={{ border: 'none', padding: '6px 11px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', background: active ? 'var(--card-bg)' : 'transparent', color: active ? 'var(--ink)' : 'var(--sub)' }}>
                {o.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

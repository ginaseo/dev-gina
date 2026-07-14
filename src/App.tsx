import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import ProgressBar from './components/ProgressBar'
import TopControls from './components/TopControls'
import Hero from './components/Hero'
import SearchFilterBar from './components/SearchFilterBar'
import NavRail from './components/NavRail'
import TimelineView from './components/TimelineView'
import CategoryView from './components/CategoryView'
import YearView from './components/YearView'
import { useDarkMode } from './hooks/useDarkMode'
import { useViewport } from './hooks/useViewport'
import { useScrollTracking } from './hooks/useScrollTracking'
import { buildChapters, firstVisibleChapterIdx } from './lib/timelineLogic'
import { scrollToChapter } from './lib/scroll'
import type { DisplayMode, Language, ViewMode } from './data/types'

export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode()
  const { isMobile, showRail } = useViewport()
  const { progress, activeIdx, revealed, recompute, setActiveIdx } = useScrollTracking()

  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('lang') as Language) || 'ko',
  )
  const setLanguage = (lang: Language) => {
    localStorage.setItem('lang', lang)
    setLanguageState(lang)
  }
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('detailed')
  const [activeCategory, setActiveCategory] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')

  const prevCategoryRef = useRef(activeCategory)
  useEffect(() => {
    if (prevCategoryRef.current === activeCategory) return
    prevCategoryRef.current = activeCategory
    const idx = firstVisibleChapterIdx(activeCategory)
    setActiveIdx(idx)
    scrollToChapter(idx)
    recompute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory])

  const filterOpts = useMemo(() => ({
    activeCategory, language, displayMode, isMobile, revealed,
  }), [activeCategory, language, displayMode, isMobile, revealed])

  const chapters = useMemo(
    () => buildChapters({ ...filterOpts, activeIdx, searchQuery }),
    [filterOpts, activeIdx, searchQuery],
  )

  const sidePad = isMobile ? 20 : 24
  const gridCols = isMobile ? '1fr' : 'repeat(auto-fill,minmax(210px,1fr))'
  const zigzagCols = isMobile ? '1fr 22px 1fr' : '1fr 30px 1fr'
  const laneGap = isMobile ? '22px' : '30px'
  const chapterTopPad = isMobile ? 40 : 60
  const chapterFontSize = isMobile ? 19 : 22
  const yearFontSize = isMobile ? 13 : 16
  const mainStyle = { '--card-w': isMobile ? '100%' : '235px', '--card-maxw': isMobile ? 'none' : '235px' } as CSSProperties

  return (
    <>
      <ProgressBar progress={progress} />
      <TopControls language={language} onSetLanguage={setLanguage} isDark={isDark} onToggleDark={toggleDark} />
      <NavRail
        chapters={chapters}
        activeIdx={activeIdx}
        show={viewMode === 'timeline' && showRail}
        language={language}
        onSelect={scrollToChapter}
      />

      <div style={{ position: 'relative', background: 'var(--bg)', minHeight: '100vh' }}>
        <Hero language={language} isMobile={isMobile} />

        <SearchFilterBar
          language={language}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onSetCategory={setActiveCategory}
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          displayMode={displayMode}
          onSetDisplayMode={setDisplayMode}
          isMobile={isMobile}
        />

        <div id="main-content" style={mainStyle}>
          {viewMode === 'timeline' && (
            <TimelineView
              chapters={chapters}
              sidePad={sidePad}
              zigzagCols={zigzagCols}
              laneGap={laneGap}
              chapterTopPad={chapterTopPad}
              chapterFontSize={chapterFontSize}
              yearFontSize={yearFontSize}
            />
          )}
          {viewMode === 'category' && (
            <CategoryView opts={filterOpts} searchQuery={searchQuery} sidePad={sidePad} gridCols={gridCols} />
          )}
          {viewMode === 'year' && (
            <YearView opts={filterOpts} searchQuery={searchQuery} sidePad={sidePad} gridCols={gridCols} />
          )}
        </div>

        <div id="bottom-spacer" style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', minHeight: '52vh' }} />
      </div>
    </>
  )
}

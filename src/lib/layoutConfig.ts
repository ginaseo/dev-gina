import type { CSSProperties } from 'react'

export function getLayoutConfig(isMobile: boolean) {
  return {
    sidePad: isMobile ? 20 : 24,
    gridCols: isMobile ? '1fr' : 'repeat(auto-fill,minmax(210px,1fr))',
    zigzagCols: isMobile ? '1fr 22px 1fr' : '1fr 30px 1fr',
    laneGap: isMobile ? '22px' : '30px',
    chapterTopPad: isMobile ? 40 : 60,
    chapterFontSize: isMobile ? 19 : 22,
    yearFontSize: isMobile ? 13 : 16,
    mainStyle: {
      '--card-w': isMobile ? '100%' : '235px',
      '--card-maxw': isMobile ? 'none' : '235px',
    } as CSSProperties,
  }
}

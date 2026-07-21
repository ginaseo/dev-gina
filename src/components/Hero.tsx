import { BLUE, PURPLE } from '../data/colors'
import type { Language } from '../data/types'

interface Props {
  language: Language
  isMobile: boolean
}

export default function Hero({ language, isMobile }: Props) {
  const isEn = language === 'en'
  const photoSize = isMobile ? 56 : 90
  const photoFontSize = isMobile ? 22.4 : 27.2

  return (
    <div id="hero" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', padding: `${isMobile ? 32 : 44}px ${isMobile ? 20 : 24}px 20px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, width: isMobile ? '100%' : 420 }}>
        <div style={{
          width: photoSize, height: photoSize, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          border: '1px solid var(--line)', background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: photoFontSize, lineHeight: 1,
        }}>
          {isEn ? 'G' : '서'}
        </div>
        <div>
          <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            {isEn ? 'Jinha (Gina) Seo' : '서진하'}
          </div>
          <div style={{ fontSize: isMobile ? 14 : 15.5, fontWeight: 600, color: 'var(--sub)', marginTop: 6, lineHeight: 1.5 }}>
            {isEn ? 'Developer Growing with AI' : 'AI와 함께 성장하는 개발자'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 8, fontVariantNumeric: 'tabular-nums', letterSpacing: '.03em', lineHeight: 1.6 }}>
            {isEn ? '2009 – Present' : '2009 ~ 현재'}
          </div>
        </div>
      </div>
    </div>
  )
}

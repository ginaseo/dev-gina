import type { CSSProperties } from 'react'
import type { Language } from '../data/types'

interface Props {
  language: Language
  onSetLanguage: (lang: Language) => void
  isDark: boolean
  onToggleDark: () => void
}

const pillStyle: CSSProperties = {
  display: 'flex', gap: 2, background: 'var(--chip-track-bg)', borderRadius: 9, padding: 2,
  boxShadow: '0 1px 4px rgba(0,0,0,.06)',
}

const pillBtnBase: CSSProperties = {
  border: 'none', borderRadius: 7, cursor: 'pointer', background: 'transparent',
  height: 23, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

const iconBtnStyle: CSSProperties = { ...pillBtnBase, padding: '0 9px', fontSize: 13 }

function langBtnStyle(active: boolean): CSSProperties {
  return {
    ...pillBtnBase, padding: '0 10px', fontSize: 11, fontWeight: 700,
    background: active ? 'var(--card-bg)' : 'transparent', color: active ? 'var(--ink)' : 'var(--sub)',
  }
}

const linkBtnStyle: CSSProperties = {
  ...pillBtnBase, width: 66, fontSize: 11, fontWeight: 700, color: 'var(--sub)', textDecoration: 'none', textAlign: 'center',
}

export default function TopControls({ language, onSetLanguage, isDark, onToggleDark }: Props) {
  const isEn = language === 'en'
  return (
    <div id="top-controls" style={{ position: 'fixed', top: 12, right: 16, zIndex: 60, display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={pillStyle}>
        <a href="/dev-gina/" style={linkBtnStyle}>{isEn ? 'Resume' : '이력서'}</a>
      </div>
      <div style={pillStyle}>
        <button type="button" style={iconBtnStyle} onClick={onToggleDark} aria-label="다크모드 전환" title="다크모드 전환">
          {isDark ? '☀️' : '🌙'}
        </button>
        <button type="button" style={iconBtnStyle} onClick={() => window.print()} aria-label="인쇄" title="인쇄">
          🖨️
        </button>
      </div>
      <div style={pillStyle}>
        <button type="button" style={langBtnStyle(!isEn)} aria-pressed={!isEn} onClick={() => onSetLanguage('ko')}>한국어</button>
        <button type="button" style={langBtnStyle(isEn)} aria-pressed={isEn} onClick={() => onSetLanguage('en')}>English</button>
      </div>
    </div>
  )
}

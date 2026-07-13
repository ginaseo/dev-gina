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

const iconBtnStyle: CSSProperties = {
  border: 'none', padding: '5px 9px', borderRadius: 7, fontSize: 13, cursor: 'pointer',
  background: 'transparent', lineHeight: 1,
}

function langBtnStyle(active: boolean): CSSProperties {
  return {
    border: 'none', padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
    background: active ? 'var(--card-bg)' : 'transparent', color: active ? 'var(--ink)' : 'var(--sub)',
  }
}

export default function TopControls({ language, onSetLanguage, isDark, onToggleDark }: Props) {
  const isEn = language === 'en'
  return (
    <div id="top-controls" style={{ position: 'fixed', top: 12, right: 16, zIndex: 60, display: 'flex', gap: 8, alignItems: 'center' }}>
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
        <button type="button" style={langBtnStyle(isEn)} aria-pressed={isEn} onClick={() => onSetLanguage('en')}>EN</button>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'

export type ThemePref = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme'

function applyTheme(pref: ThemePref) {
  const root = document.documentElement
  if (pref === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref)
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode() {
  const [pref, setPref] = useState<ThemePref>(() => (localStorage.getItem(STORAGE_KEY) as ThemePref) || 'system')
  const [isDark, setIsDark] = useState<boolean>(() => (pref === 'system' ? systemPrefersDark() : pref === 'dark'))

  useEffect(() => {
    applyTheme(pref)
    if (pref === 'system') {
      localStorage.removeItem(STORAGE_KEY)
      setIsDark(systemPrefersDark())
    } else {
      localStorage.setItem(STORAGE_KEY, pref)
      setIsDark(pref === 'dark')
    }
  }, [pref])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => { if (pref === 'system') setIsDark(mq.matches) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])

  const toggle = useCallback(() => {
    setPref((cur) => {
      const currentlyDark = cur === 'system' ? systemPrefersDark() : cur === 'dark'
      return currentlyDark ? 'light' : 'dark'
    })
  }, [])

  return { isDark, toggle }
}

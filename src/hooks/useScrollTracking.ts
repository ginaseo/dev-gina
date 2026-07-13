import { useCallback, useEffect, useRef, useState } from 'react'

export function useScrollTracking() {
  const [progress, setProgress] = useState(0)
  const [activeIdx, setActiveIdxState] = useState(-1)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const activeIdxRef = useRef(activeIdx)
  activeIdxRef.current = activeIdx
  const revealedRef = useRef(revealed)
  revealedRef.current = revealed

  const recompute = useCallback(() => {
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    const markers = document.querySelectorAll('[data-chapter-idx]')
    const pct = max > 0 && markers.length > 1 ? Math.min(1, window.scrollY / max) : 1
    let idx = -1
    markers.forEach((m) => {
      if (m.getBoundingClientRect().top < 180) idx = parseInt(m.getAttribute('data-chapter-idx') || '-1', 10)
    })
    if (markers.length && max > 0 && window.scrollY >= max - 4) {
      idx = parseInt(markers[markers.length - 1].getAttribute('data-chapter-idx') || '-1', 10)
    }

    const revealThreshold = window.innerHeight * 0.95
    let revealChanged = false
    const nextRevealed = new Set(revealedRef.current)
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const id = el.getAttribute('data-reveal')
      if (id && !nextRevealed.has(id) && el.getBoundingClientRect().top < revealThreshold) {
        nextRevealed.add(id)
        revealChanged = true
      }
    })

    setProgress(pct)
    if (idx !== activeIdxRef.current) setActiveIdxState(idx)
    if (revealChanged) setRevealed(nextRevealed)
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        recompute()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    recompute()
    return () => window.removeEventListener('scroll', onScroll)
  }, [recompute])

  return { progress, activeIdx, revealed, recompute, setActiveIdx: setActiveIdxState }
}

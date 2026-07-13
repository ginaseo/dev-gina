import { useEffect, useState } from 'react'

export interface Viewport {
  isMobile: boolean
  showRail: boolean
}

function computeViewport(): Viewport {
  return {
    isMobile: window.innerWidth < 720,
    showRail: window.innerWidth >= 1060,
  }
}

export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(computeViewport)

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => setViewport(computeViewport()), 120)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('resize', onResize)
      if (resizeTimer) clearTimeout(resizeTimer)
    }
  }, [])

  return viewport
}

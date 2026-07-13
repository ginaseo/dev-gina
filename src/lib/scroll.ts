export function animateScrollTo(target: number) {
  const start = window.scrollY
  const distance = target - start
  const duration = 550
  const startTime = performance.now()
  const ease = (t: number) => 1 - Math.pow(1 - t, 3)
  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration)
    window.scrollTo(0, start + distance * ease(t))
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export function scrollToChapter(idx: number) {
  const marker = document.querySelector(`[data-chapter-idx="${idx}"]`)
  if (!marker) return
  const target = marker.getBoundingClientRect().top + window.scrollY - 175
  animateScrollTo(target)
}

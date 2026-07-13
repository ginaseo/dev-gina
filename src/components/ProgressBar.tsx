interface Props {
  progress: number
}

export default function ProgressBar({ progress }: Props) {
  return (
    <div id="progress-track" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'var(--progress-track-bg)', zIndex: 60 }}>
      <div style={{ height: '100%', background: 'var(--filled-line)', width: `${Math.round(progress * 100)}%`, transition: 'width .1s linear' }} />
    </div>
  )
}

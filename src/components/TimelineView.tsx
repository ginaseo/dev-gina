import type { BuiltChapter } from '../lib/timelineLogic'
import ChapterSection from './ChapterSection'

interface Props {
  chapters: BuiltChapter[]
  sidePad: number
  zigzagCols: string
  laneGap: string
  chapterTopPad: number
  chapterFontSize: number
  yearFontSize: number
}

export default function TimelineView({ chapters, ...layout }: Props) {
  return (
    <>
      {chapters.filter((c) => c.hasVisible).map((c) => (
        <ChapterSection key={c.idx} chapter={c} layout={layout} />
      ))}
    </>
  )
}

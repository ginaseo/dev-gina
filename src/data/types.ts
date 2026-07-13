export interface TimelineNode {
  id: string
  category: string
  altCategory?: string
  color: string
  icon: string
  title: string
  sub?: string
  period: string
  milestone?: string
  alias?: string
  tags?: string[]
}

export interface LaneNode {
  id: string
  icon: string
  title: string
  sub?: string
  period: string
  milestone?: string
  alias?: string
  altCategory?: string
}

export interface NodeBlock {
  kind: 'node'
  label: string
  node: TimelineNode
}

export interface OverlapBlock {
  kind: 'overlap'
  label: string
  periodLabel: string
  laneLLabel: string
  laneLIcon: string
  laneLColor: string
  laneLCategory: string
  laneL: LaneNode[]
  laneRLabel: string
  laneRIcon: string
  laneRColor: string
  laneRCategory: string
  laneR: LaneNode[]
}

export type Block = NodeBlock | OverlapBlock

export interface Chapter {
  num: string
  title: string
  period: string
  theme: string
  accent: string
  shortTitle: string
  blocks: Block[]
}

export interface Category {
  name: string
  color: string
  icon: string
}

export interface ChapterTranslation {
  title: string
  theme: string
  short: string
}

export interface NodeTranslation {
  title: string
  sub: string
}

export type Language = 'ko' | 'en'
export type ViewMode = 'timeline' | 'category' | 'year'
export type DisplayMode = 'compact' | 'detailed'

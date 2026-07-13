import { BLUE, GREEN, ORANGE, SKY, RED, GOLD, PURPLE, TRAVEL_CAT, FIT_CAT, CAD_CAT, IT_CAT } from './colors'
import type { Category, Chapter, ChapterTranslation, NodeTranslation } from './types'

export const CATEGORIES: Category[] = [
  { name: IT_CAT, color: PURPLE, icon: '💻' },
  { name: CAD_CAT, color: GREEN, icon: '📐' },
  { name: '교육', color: BLUE, icon: '🎓' },
  { name: TRAVEL_CAT, color: ORANGE, icon: '🧳' },
  { name: FIT_CAT, color: RED, icon: '🏋️' },
]

export const TR_CATEGORIES: Record<string, string> = {
  '전체': 'All',
  '교육': 'Education',
  '설계': 'Design',
  '개발': 'IT',
  '여행': 'Travel',
  '운동': 'Fitness',
  '전환': 'Transition',
}

export const TR_CHAPTERS: Record<string, ChapterTranslation> = {
  '06': { title: 'Restart', theme: 'Back to being a developer', short: 'Restart' },
  '05': { title: 'Reset', theme: 'Not a pause, but growth in a different way', short: 'Reset' },
  '04': { title: 'Backend Developer', theme: 'A new language, a new career', short: 'Backend' },
  '03': { title: 'CAD Design', theme: 'Building expertise as a designer', short: 'Design' },
  '02': { title: 'Living Abroad', theme: 'Independence learned in unfamiliar places', short: 'Abroad' },
  '01': { title: 'Student Years', theme: 'Laying the foundation', short: 'Student' },
}

export const TR_NODES: Record<string, NodeTranslation> = {
  r1: { title: 'Programmers Devcourse (Advanced)', sub: 'Spring AI · Backend development with MSA' },
  r2: { title: 'Life as a CrossFitter', sub: 'Consistency built through CrossFit' },
  r3: { title: 'Life as a Surfer', sub: 'Immersed in surfing between Yangyang and Bali' },
  r4: { title: 'Recharging Through Travel', sub: 'Zhangjiajie · Jeonnam · Sokcho · Miyazaki' },
  r5: { title: 'RealInvention · Java Backend Developer', sub: 'Public-sector SI backend development & operations' },
  r6: { title: 'Korea National Open University', sub: 'Computer Science' },
  r7: { title: 'Java Application SW Developer Training', sub: 'Full-stack web development training in Java' },
  r8: { title: 'Yushin · CAD Designer', sub: 'AutoCAD, Illustrator' },
  r9: { title: 'Short Trip', sub: 'West Coast US trip' },
  r10: { title: 'Misung Engineering · CAD Designer', sub: 'AutoCAD' },
  r11: { title: 'SNK Patent Law Firm · CAD Designer', sub: 'AutoCAD, Photoshop' },
  r12: { title: 'CATIA Mechanical Design Course', sub: 'CATIA Mechanical Design I·II' },
  r13: { title: 'Interior Architecture Drafting', sub: 'AutoCAD' },
  r14: { title: 'CATIA Aircraft Structure Design Course', sub: 'CATIA Aircraft Structure Design I·II' },
  r15: { title: 'Interior Design Specialist Course', sub: 'AutoCAD · BIM · SketchUp · 3ds Max' },
  r16: { title: 'Canada Working Holiday', sub: 'Language study · cultural experience' },
  r17: { title: 'Short Overseas Trip', sub: 'Singapore · Indonesia · India · 7 European countries, cultural experience' },
  r18: { title: 'Myongji College', sub: 'Information & Communications (3-year program), graduated' },
  r19: { title: 'Dowon Ubitech Internship', sub: 'Supported public-sector web service development' },
}

export const RAW_CHAPTERS: Chapter[] = [
  {
    num: '06', title: '재시작', period: '2026', theme: '다시, 개발자로', accent: 'oklch(50% 0.14 275)', shortTitle: '재시작',
    blocks: [
      { kind: 'node', label: '2026', node: { id: 'r1', category: '교육', altCategory: IT_CAT, color: BLUE, icon: '🤖', title: '프로그래머스 데브코스 심화', sub: 'Spring AI · MSA를 활용한 백엔드 개발', period: '2026.03 – 05', milestone: '개발 복귀', alias: 'ai spring ai devcourse java', tags: ['BookCommerce', 'DevTicket'] } },
    ],
  },
  {
    num: '05', title: '리셋', period: '2023 – 2026.02', theme: '멈춘 게 아니라, 다르게 성장한 시간', accent: SKY, shortTitle: '리셋',
    blocks: [
      { kind: 'node', label: '2024', node: { id: 'r2', category: FIT_CAT, color: RED, icon: '🏋️', title: '크로스핏터로 살아보기', sub: '크로스핏으로 다진 꾸준함', period: '2024.08 – 2026.02', alias: 'crossfit' } },
      { kind: 'node', label: '2023', node: { id: 'r3', category: FIT_CAT, color: RED, icon: '🏄', title: '서퍼로 살아보기', sub: '양양 · 발리를 오가며 서핑에 몰입', period: '2023.10 – 2024.06', alias: 'bali surfing yangyang' } },
      { kind: 'node', label: '2023', node: { id: 'r4', category: TRAVEL_CAT, color: ORANGE, icon: '🧳', title: '여행으로 재충전', sub: '장가계 · 전남 · 속초 · 미야자키', period: '2023.10 – 2024.07', alias: 'miyazaki' } },
    ],
  },
  {
    num: '04', title: '백엔드 개발자', period: '2020 – 2024.02', theme: '새 언어로 다시 쓴 커리어', accent: 'oklch(55% 0.15 300)', shortTitle: '백엔드',
    blocks: [
      {
        kind: 'overlap', label: '2021', periodLabel: '2021.08 – 2024.02',
        laneLLabel: IT_CAT, laneLIcon: '💻', laneLColor: PURPLE, laneLCategory: IT_CAT,
        laneL: [{ id: 'r5', icon: '💼', title: '리얼인벤션 · 자바 백엔드 개발자', sub: '공공 SI 백엔드 개발 및 운영 경험', period: '2022.05 – 2023.09', milestone: '첫 개발회사' }],
        laneRLabel: '교육', laneRIcon: '🎓', laneRColor: BLUE, laneRCategory: '교육',
        laneR: [{ id: 'r6', icon: '🎓', title: '한국방송통신대학교', sub: '컴퓨터과학과', period: '2021.08 – 2024.02', altCategory: IT_CAT }],
      },
      { kind: 'node', label: '2020', node: { id: 'r7', category: '교육', altCategory: IT_CAT, color: BLUE, icon: '📘', title: 'Java 응용SW개발자 양성', sub: 'Java 기반 풀스택 웹 개발 교육', period: '2020.10 – 2021.03', milestone: '개발자 전향' } },
    ],
  },
  {
    num: '03', title: 'CAD 설계', period: '2014 – 2020', theme: '설계자로서 전문성을 쌓다', accent: GREEN, shortTitle: '설계',
    blocks: [
      { kind: 'node', label: '2018', node: { id: 'r8', category: CAD_CAT, color: GREEN, icon: '💼', title: '유신 · 캐드원', sub: 'AutoCAD, Illustrator', period: '2018.08 – 2020.08', alias: 'cad 캐드 오토캐드 autocad' } },
      { kind: 'node', label: '2018', node: { id: 'r9', category: TRAVEL_CAT, color: ORANGE, icon: '🧳', title: '단기 해외여행', sub: '미국 서부 여행', period: '2018.04 – 07' } },
      {
        kind: 'overlap', label: '2015', periodLabel: '2015.03 – 2018.04',
        laneLLabel: CAD_CAT, laneLIcon: '📐', laneLColor: GREEN, laneLCategory: CAD_CAT,
        laneL: [
          { id: 'r11', icon: '💼', title: 'SNK특허법률사무소 · 캐드원', sub: 'AutoCAD, Photoshop', period: '2015.03 – 2018.04', milestone: '첫 직장', alias: 'cad 캐드 오토캐드 autocad' },
          { id: 'r10', icon: '💼', title: '미승엔지니어링 · 캐드원', sub: 'AutoCAD', period: '2017.09 – 10' },
        ],
        laneRLabel: '교육', laneRIcon: '🎓', laneRColor: BLUE, laneRCategory: '교육',
        laneR: [
          { id: 'r12', icon: '🎓', title: 'CATIA 기계설계 과정', sub: 'CATIA 기계설계 Ⅰ·Ⅱ', period: '2015.12 – 2016.05', altCategory: CAD_CAT, alias: '카티아' },
          { id: 'r13', icon: '🎓', title: '실내건축설계도서작성', sub: 'AutoCAD', period: '2016.12 – 2017.02', altCategory: CAD_CAT, alias: '오토캐드 캐드 cad' },
          { id: 'r14', icon: '🎓', title: 'CATIA 항공기구설계 과정', sub: 'CATIA 항공기구설계 Ⅰ·Ⅱ', period: '2017.02 – 05', altCategory: CAD_CAT, alias: '카티아' },
        ],
      },
      { kind: 'node', label: '2014', node: { id: 'r15', category: '교육', altCategory: CAD_CAT, color: BLUE, icon: '🎓', title: '인테리어 전문가 과정', sub: 'AutoCAD · BIM · SketchUp · 3ds Max', period: '2014.10 – 2015.02', alias: '캐드 오토캐드 autocad' } },
    ],
  },
  {
    num: '02', title: '해외 경험', period: '2011 – 2014', theme: '낯선 환경에서 배운 독립심', accent: ORANGE, shortTitle: '해외',
    blocks: [
      { kind: 'node', label: '2012', node: { id: 'r16', category: TRAVEL_CAT, color: ORANGE, icon: '✈️', title: '캐나다 워킹홀리데이', sub: '어학연수 · 문화 경험', period: '2012.12 – 2014.08', alias: 'canada' } },
      { kind: 'node', label: '2011', node: { id: 'r17', category: TRAVEL_CAT, color: ORANGE, icon: '🧳', title: '단기 해외여행', sub: '싱가포르 · 인도네시아 · 인도 · 유럽 7개국 문화 경험', period: '2011.02 – 10', milestone: '첫 해외' } },
    ],
  },
  {
    num: '01', title: '학생 시절', period: '2009 – 2013', theme: '기초를 다진 시간', accent: BLUE, shortTitle: '학생',
    blocks: [
      {
        kind: 'overlap', label: '2009', periodLabel: '2009.03 – 2013.02',
        laneLLabel: IT_CAT, laneLIcon: '💼', laneLColor: PURPLE, laneLCategory: IT_CAT,
        laneL: [{ id: 'r19', icon: '💼', title: '도원유비텍 인턴', sub: '공공기관 웹 서비스 개발 지원', period: '2012.07 – 08' }],
        laneRLabel: '교육', laneRIcon: '🎓', laneRColor: BLUE, laneRCategory: '교육',
        laneR: [{ id: 'r18', icon: '🎓', title: '명지전문대', sub: '정보통신과 졸업 (3년제)', period: '2009.03 – 2013.02', altCategory: IT_CAT }],
      },
    ],
  },
]

// re-export for convenience where color/icon lookup for milestones is needed
export { GOLD }

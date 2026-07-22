# dev-gina

이력서 페이지와 인생 타임라인 페이지 구현.

## 구성

| 경로 | 내용 | 배포 경로 |
|---|---|---|
| `site-root/` | 이력서 사이트 (정적 HTML/CSS/JS, 한/영 지원, 웹/프린트 버전) | `/` |
| `src/` | Life Timeline 앱 (React + TypeScript + Vite + Tailwind) | `/dev-gina/timeline/` |

## 배포

두 페이지는 별도 앱이지만 하나의 GitHub Pages 사이트로 합쳐 GitHub Action으로 배포한다.

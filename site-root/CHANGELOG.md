# CHANGELOG

## 2026-07-20 — 기술스택 재배치 · AI/Search 항목 실증 교체

### 배치 순서 (stack.li1-9)

**변경 전**
```
1 Backend  2 Messaging  3 AI · Search  4 Database
5 Infra    6 Performance 7 Security
8 Tools
```

**변경 후**
```
1 Backend      2 Messaging   3 Performance  4 Security
5 AI · Search  6 Database    7 Infra        8 Tools
9 AI Engineering (신규)
```

**변경 이유**
사용자 요청 문구 순서(Backend→Messaging→Performance→Security→AI/Search→Database→Infra)에 맞춰 재배치. `Tools`는 요청 목록에 없어 그대로 유지, 맨 뒤 유지.

### AI · Search (stack.li5)

**변경 전**
```
AI · Search — Spring AI · Elasticsearch
· 추천 로그 수집 파이프라인 구현
· Spring AI 기반 기능 개발 경험
· 벡터 합성은 AI팀 협업
```

**변경 후**
```
AI · Search — Elasticsearch
· 유저 행동 벡터(선호·장바구니·최근) 가중합·코사인 유사도 기반 추천 로직 구현
· Elasticsearch kNN 검색 연동, 콜드스타트 정책 설계
· 임베딩 생성은 AI팀 협업
```

**변경 이유**
"Spring AI 기반 기능 개발 경험" 문구에 근거 없음. `beadv5_1_HeadbuttingDinosaur_BE_ai` 모듈 코드(`RecommendationService.java`, `VectorService.java`) 직접 검토 결과 Spring AI 의존성 자체가 없고, 실제 구현은 Elasticsearch kNN + 자체 가중치 벡터합·코사인 유사도 로직 + 콜드스타트 정책. 근거 있는 실제 코드로 교체.

### AI Engineering (stack.li9, 신규)

**변경 후**
```
AI Engineering — Python · MCP · LLM
· Slack·Claude Code 로그 자동 요약→엔티티화, MCP 서버로 실시간 지식 조회 (Hermes)
· KOSPI/KOSDAQ 시세·공시 자동 수집→스크리닝→Slack 브리핑 자동화 (KRX 모닝 브리핑)
· 증분 처리·LLM 응답 캐싱으로 API 비용·처리 시간 최소화
```

**변경 이유**
Projects 섹션에 이미 있던 Hermes Knowledge Engine·KRX 모닝 브리핑 개인 프로젝트의 LLM/MCP 실무 경험이 기술스택에 반영 안 돼 있었음. 신규 카테고리로 분리 추가.

---

## 2026-07-20 — 기술스택 · 핵심역량 재구성

### 핵심역량 (skills.li1-4)

**변경 전**
```
list 조회 p95 98.7% 개선 (2,050ms → 26ms) — k6 기반 성능 측정·캐싱 설계로 검증
Kafka 기반 이벤트 정합성 설계 — Outbox·Consumer 멱등성, 정합성·처리량 요구를 분리한 별도 파이프라인
AI 레버리지 — 설계·검증은 직접 수행하고 구현·테스트 자동화에 AI를 활용해 개발 생산성을 높입니다
운영 시스템 개발·유지보수 경력 1년 5개월, 두 프로젝트 설계 문서 원저자로 지목 (문서 기반 협업)
```

**변경 후**
```
list 조회 p95 98.7% 개선 (2,050ms → 26ms)
— k6 기반 성능 측정과 캐싱 설계로 검증

Kafka 이벤트 정합성 설계
— Outbox · Consumer 멱등성, 정합성·처리량 요구를 분리한 이벤트 채널

운영 시스템 개발 및 유지보수 (1년 5개월)
— 공공·연구기관 시스템 7종 개발 및 운영

AI를 활용한 구현·테스트 자동화
— 설계와 검증은 직접 수행, 구현 생산성 향상
```

**변경 이유**
한 줄에 성과와 근거가 뒤섞여 있어 스캔 속도가 느렸음. 성과(굵게) 1줄 + 근거 1줄로 분리하고 문장 길이를 통일해, 채용담당자가 5~15초 안에 대표 성과를 파악하도록 함. 4개 항목을 성과 크기 순으로 재배열.

### 기술스택 (stack.li1-8)

**변경 전**
```
Backend — Java, Spring Boot, JPA, REST API
Messaging — Apache Kafka (Outbox · Consumer 멱등성 · acks=0 fire-and-forget)
AI · Search — Spring AI, Caffeine Cache, Elasticsearch (kNN 추천은 AI팀 협업)
Database — PostgreSQL, MariaDB, MyBatis
Infra — Docker, k3s, AWS EC2, Spring Cloud Gateway, Eureka, MSA, Hexagonal
Performance — k6 기반 부하 테스트·병목 분석
Security — JWT, Refresh Token Rotation, Internal API 가드
Tools — Git/GitHub, eGovFrame
```

**변경 후**
```
Backend — Java, Spring Boot, JPA, REST API
  · Spring Boot 기반 REST API 개발
  · 공공 SI 실무 1년 5개월
  · MSA 기반 프로젝트 2건 수행

Messaging — Apache Kafka
  · Outbox 패턴 적용
  · Consumer 멱등성 구현
  · 정합성과 처리량 요구를 분리한 이벤트 채널 설계

AI · Search — Elasticsearch
  · 추천 로그 수집 파이프라인 단독 설계·구현
  · 벡터 합성·kNN 추천은 AI팀 협업

Database — PostgreSQL, MariaDB, MyBatis
  · 공공 SI 운영 (MariaDB)
  · MSA 프로젝트 데이터 모델링 (PostgreSQL)

Infra — Docker, k3s, AWS EC2, Spring Cloud Gateway, Eureka
  · 프로젝트 배포·운영 환경 구성 및 활용 경험

Performance — Caffeine Cache, k6
  · list/detail 캐싱 확장, EventCacheEvictor로 캐시 정합성 사이클 구현
  · k6 부하 테스트 인프라 1인 구축 (VU 400 / 약 370 RPS 무중단)
  · list 조회 p95 2,050ms → 26ms (98.7% 개선)

Security — JWT
  · Refresh Token Rotation 구현
  · 탈취 감지
  · Gateway 단일 검증

Tools — Git/GitHub, eGovFrame
  · 정부 표준프레임워크(eGovFrame) 기반 공공 SI 개발
```

**변경 이유**
"기술 나열"에서 "기술영역 → 사용 기술 → 실제 구현/설계/운영 경험" 구조로 전환. 숙련도(상/중/하, "가능", "익숙" 등 추상 표현) 전면 배제, 프로젝트·실무에서 확인 가능한 경험만 하위 불릿으로 명시. `Spring AI`는 실제 프로젝트에서 구현 범위를 특정할 근거가 부족해 항목에서 제외(AI · Search는 Elasticsearch 기반 추천 로그 파이프라인으로 한정). EN 번역본(i18n.js `en` 블록)도 동일 구조로 동기화. 프린트 레이아웃(`style.css` `.pr-stack`, `.pr-skills`)에 중첩 리스트·서브텍스트 스타일 규칙 추가해 PDF 출력 시 깨지지 않도록 보정.

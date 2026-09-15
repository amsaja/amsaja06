# 김슬기 공식 홈페이지 — Clean Archive FINAL

기존 `site.json` 한 파일을 분야별 데이터 파일로 완전히 분리한 운영용 구조입니다.
평소 콘텐츠를 추가하거나 빼는 경우 HTML/CSS를 수정하지 않습니다.

## 파일 구조

```text
index.html
404.html

assets/
  style.css
  app.js
  favicon.svg
  images/
    profile.jpg
    seoul-bookfair-2026.jpg

data/
  profile.json       소개 / 연락처 / SNS
  news.json          최근 소식
  selected.json      주요 활동
  works.json         단행본 / 단편소설
  translations.json  해외 번역판
  awards.json        수상 및 선정
  blurbs.json        추천사
  columns.json       칼럼
  talks.json         강연과 수업
  places.json        오프라인 강연 장소 지도 좌표
  press.json         기사와 인터뷰
  meta.json          마지막 업데이트 날짜
```

## 앞으로 무엇을 수정하면 되나

### 소개 문장이나 연락처
`data/profile.json`

### 최근 소식
`data/news.json`

### 새 단행본 / 단편소설 / 절판 상태
`data/works.json`

### 새 해외 번역판
`data/translations.json`

### 수상·선정
`data/awards.json`

### 추천사
`data/blurbs.json`

### 국제신문 칼럼
`data/columns.json`

### 강연·수업
`data/talks.json`

### 기사·인터뷰
`data/press.json`

### 홈페이지 하단의 마지막 업데이트 날짜
`data/meta.json`

## GitHub에 업데이트하는 법

예를 들어 새 기사가 하나 생겼다면:

1. `press.json`만 수정합니다.
2. GitHub 저장소에서 `data/press.json`을 새 파일로 교체합니다.
3. Commit changes 합니다.
4. 홈페이지를 새로고침합니다.

`assets/app.js`는 JSON 파일을 `cache: "no-store"`로 읽기 때문에
이전처럼 브라우저가 예전 JSON을 오래 보여주는 문제를 줄였습니다.

## 중요한 원칙

- 콘텐츠 추가/삭제 때문에 `index.html`을 수정하지 않습니다.
- 디자인을 바꿀 때만 `assets/style.css`을 수정합니다.
- 데이터 표시 방식이나 새로운 카테고리를 만들 때만 `assets/app.js`와 `index.html`을 수정합니다.
- JSON을 직접 수정할 때는 쉼표와 따옴표 문법에 주의합니다.

이 버전을 앞으로의 기준본으로 사용하세요.


## 통합 아카이브

홈페이지 하단의 아카이브는 기존 데이터 파일을 자동으로 한데 모읍니다.
작품, 칼럼, 강연, 기사·인터뷰, 수상·선정, 번역, 추천사를 분야별로 필터링하거나 검색할 수 있습니다.
기존 데이터의 `url` 값은 아카이브에서도 원문 링크로 유지됩니다.

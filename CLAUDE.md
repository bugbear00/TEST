# CLAUDE.md

## Project Overview

전국 어린이박물관 스탬프 투어 — 한국 전국 20개 어린이박물관 방문 스탬프 컬렉션 웹 애플리케이션.

## Tech Stack

- **Frontend**: Vanilla HTML5 + CSS3 + JavaScript (ES6+)
- **Database**: Notion API (연동 예정)
- **Storage**: localStorage (오프라인 데이터 캐싱)
- **Fonts**: Google Fonts (Noto Sans KR, Gaegu)

## Project Structure

```
TEST/
├── index.html      # 메인 스탬프 투어 페이지 (SPA)
├── CLAUDE.md       # 이 파일 — AI 어시스턴트 가이드
└── .git/           # Git repository
```

## Key Concepts

### Museum Data Model
각 박물관은 다음 필드를 갖습니다:
- `id`: 고유 번호 (1~20)
- `name`: 박물관 이름
- `shortName`: 줄임 이름
- `location`: 위치 (시/도)
- `region`: 권역 코드 (seoul, gyeonggi, chungcheong, jeolla, gyeongsang, gangwon, jeju)
- `icon`: 이모지 아이콘
- `visited`: 방문 여부
- `date`: 방문 날짜

### Regions (7개 권역)
| 코드 | 권역 | 색상 | 박물관 수 |
|------|------|------|-----------|
| seoul | 서울 | #E74C3C | 3 |
| gyeonggi | 경기 | #E67E22 | 3 |
| chungcheong | 충청 | #2ECC71 | 4 |
| jeolla | 전라 | #3498DB | 4 |
| gyeongsang | 경상 | #9B59B6 | 4 |
| gangwon | 강원 | #1ABC9C | 1 |
| jeju | 제주 | #F39C12 | 1 |

### 20개 어린이박물관 목록
1. 국립중앙박물관 어린이박물관 (서울 용산)
2. 국립민속박물관 어린이박물관 (서울 종로)
3. 서울역사 어린이박물관 (서울 종로)
4. 경기도어린이박물관 (경기 용인)
5. 경기북부어린이박물관 (경기 동두천)
6. 국립어린이민속박물관 (경기 파주)
7. 국립박물관단지 국립어린이박물관 (세종)
8. 국립공주박물관 어린이박물관 (충남 공주)
9. 국립부여박물관 어린이박물관 (충남 부여)
10. 국립청주박물관 어린이박물관 (충북 청주)
11. 국립전주박물관 어린이박물관 (전북 전주)
12. 국립익산박물관 어린이박물관 (전북 익산)
13. 국립광주박물관 어린이박물관 (광주)
14. 국립나주박물관 어린이박물관 (전남 나주)
15. 국립대구박물관 어린이박물관 (대구)
16. 국립경주박물관 어린이박물관 (경북 경주)
17. 국립김해박물관 어린이박물관 (경남 김해)
18. 국립진주박물관 어린이박물관 (경남 진주)
19. 국립춘천박물관 어린이박물관 (강원 춘천)
20. 국립제주박물관 어린이박물관 (제주)

## Development Workflow

### Running Locally
프레임워크 없이 정적 HTML 파일이므로 아무 HTTP 서버로 실행 가능:
```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

### Notion Integration (TODO)
- Notion API를 통해 방문 기록을 동기화할 예정
- 현재는 localStorage로 오프라인 저장
- Notion 데이터베이스 스키마: 박물관명, 위치, 방문여부, 방문일자, 메모

## Conventions

- 한국어 UI, 코드 주석은 영어/한국어 혼용 가능
- CSS 변수(Custom Properties) 사용하여 테마 관리
- 모바일 우선 반응형 디자인
- 외부 라이브러리 최소화 (Google Fonts 제외)
- 박물관 데이터 변경 시 `museums` 배열 직접 수정

## Git Branch

- 메인 개발 브랜치: `claude/children-museum-stamp-GOBG1`

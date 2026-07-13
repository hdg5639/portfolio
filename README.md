# I AM | 한동균 사용설명서

HTML, CSS, 바닐라 JavaScript만 사용한 반응형 MPA 프로젝트입니다. 1일차의 단일 페이지 형태를 네 개의 HTML 문서로 분리하고, 모든 페이지에 동일한 상단 네비게이션과 게이미피케이션 상태를 적용했습니다.

## 실행 방법

1. 프로젝트 폴더를 VS Code로 엽니다.
2. VS Code의 **Live Server**로 `index.html`을 실행합니다.
3. 상단 메뉴를 눌러 실제 HTML 문서 간 이동이 되는지 확인합니다.

HTML 파일을 직접 열어도 화면과 링크는 동작하지만, 브라우저에 따라 `file://` 문서끼리 `localStorage`를 공유하지 않을 수 있으므로 XP와 배지 테스트는 Live Server 사용을 권장합니다. 별도의 설치나 빌드 과정은 필요하지 않습니다.

## 파일 구조

```text
iam-donggyun-mpa-v2/
├─ index.html                 # 한동균은 이런 사람
├─ lifestyle.html             # 일상의 취향
├─ projects.html              # 만들고 몰입한 것
├─ tmi.html                   # TMI, XP, 배지, 퀴즈
├─ assets/
│  ├─ css/style.css           # 공통 스타일 및 반응형 디자인
│  ├─ js/app.js               # 공통 바닐라 JS 기능
│  └─ images/*.svg            # 직접 포함한 로컬 이미지
├─ GIT_GUIDE.md               # Git 사용 안내
└─ REQUIREMENTS.md            # 요구사항 반영표
```

## 구현 기능

- 실제 `<a href>` 링크로 연결된 4페이지 MPA
- 모든 HTML에 동일하게 삽입된 공통 네비게이션
- PC·태블릿·모바일 반응형 레이아웃
- 모바일 햄버거 메뉴
- 버튼 클릭 리액션, 토스트 알림, 상세 팝업
- 페이지 방문 XP
- 인사·페이지 탐험·프로젝트 공감·퀴즈 배지
- 프로젝트 검색과 카테고리 필터
- 프로젝트 좋아요 상태 저장
- 취향 밸런스 게임
- 8문항 퀴즈와 진행률 표시
- `localStorage`를 이용한 페이지 간 상태 유지
- CSS 애니메이션 및 `prefers-reduced-motion` 대응

## 기술 구성

- HTML5
- CSS3
- Vanilla JavaScript
- Browser Local Storage
- 로컬 SVG 이미지

React, Vue, Tailwind CSS, npm, 번들러 등의 프레임워크와 빌드 도구는 사용하지 않았습니다.

## 브라우저 저장 데이터 초기화

`TMI & 퀴즈` 페이지 아래쪽의 **활동 기록 초기화** 버튼을 누르면 XP, 배지, 좋아요, 선택 기록이 초기화됩니다.

# 📚 Bookmark — 책 리뷰 공유 서비스 (Frontend)

**Bookmark** 는 읽은 책을 기록하고, 다른 독자들과 리뷰를 나누는 웹 서비스입니다.
이 레포지토리는 **프론트엔드 전체**를 React 기반으로 구현한 프로젝트로,
Spring Boot 기반의 Backend API와 연동되어 작동합니다.

---

## 🎬 데모 영상

프로젝트 동작 화면은 아래 영상을 통해 확인하실 수 있습니다.

[유튜브에서 보기](https://youtu.be/l-ZnRPHH6_U)

---

## ✨ 주요 기능

### 🔐 1. 사용자 인증 (JWT 기반)

- Access Token + Refresh Token 로그인 구조
- 401 응답 시 토큰 자동 갱신 후 재시도 (httpClient 인터셉터)
- 로그인 상태 자동 유지 (`/me` 기반 동기화, `AuthProvider`)
- 회원가입, 로그인, 로그아웃
- 프로필 이미지 업로드(Base64 변환)
- 닉네임 및 프로필 수정 / 비밀번호 변경

---

### 📝 2. 게시판(리뷰) 기능

- 리뷰 목록 조회 (페이지네이션)
- 리뷰 상세 조회
- 리뷰 작성 / 수정 / 삭제
- 작성자 본인만 편집 가능하도록 권한 처리
- 이미지 포함 리뷰 작성 지원

---

### 💬 3. 댓글 기능

- 댓글 작성 / 수정 / 삭제
- 인라인 수정 UI (편집 중 다른 댓글 수정 불가)
- 작성자 여부에 따른 액션 버튼 노출 제어
- 댓글 CRUD 후 목록 자동 새로고침 (경쟁 조건 방지)

---

### ❤️ 4. 좋아요 기능

- 게시글 좋아요 / 취소
- Optimistic UI로 즉각 반영 후 서버 응답에 따라 보정

---

### 🎨 5. UI/UX

- 아바타 드롭다운 메뉴
- 로그인 여부에 따라 UI 자동 업데이트
- 에러/로딩 상태 공통 컴포넌트(`PageStateCard`) + 재시도 버튼
- 인터랙션 중심의 카드형 레이아웃
- 모바일에서도 안정적으로 보이는 기본 반응형 구성

---

## 🛠 기술 스택

| 영역              | 사용 기술                                      |
| ----------------- | ---------------------------------------------- |
| **Language**      | JavaScript (ES Modules)                        |
| **UI 프레임워크** | React 18                                       |
| **빌드 도구**     | Vite 6                                         |
| **라우팅**        | React Router DOM v6                            |
| **Auth**          | JWT (Access / Refresh Token)                   |
| **API 통신**      | Fetch API — `httpClient` (401 자동 갱신 내장)  |
| **상태 관리**     | React Context (`AuthProvider`) + LocalStorage  |
| **서버 연동**     | Spring Boot REST API                           |

---

## 📁 프로젝트 구조

```
FE/react-app/src/
├── app/
│   ├── AppLayout.jsx       # 공통 레이아웃 (헤더/아바타 포함)
│   ├── AuthProvider.jsx    # 전역 인증 상태 Context
│   └── router.jsx          # React Router 라우트 정의
├── components/
│   ├── AvatarDropdown.jsx  # 아바타 드롭다운 메뉴
│   ├── PageStateCard.jsx   # 로딩/에러 공통 UI 카드
│   └── comments/
│       └── CommentList.jsx # 댓글 목록 + 인라인 수정 UI
├── hooks/
│   └── useAuth.js          # AuthContext 소비 훅
├── lib/
│   ├── api/
│   │   ├── authApi.js      # 인증 관련 API (signup, login, me, ...)
│   │   ├── httpClient.js   # Fetch 래퍼 (Bearer 토큰 + 401 자동 갱신)
│   │   └── postsApi.js     # 게시글/댓글/좋아요 API
│   ├── storage/
│   │   └── authStorage.js  # LocalStorage 기반 토큰/유저 저장
│   └── utils/
│       └── authErrorUtils.js # 인증 에러 판별 유틸
└── pages/
    ├── BoardPage.jsx        # 게시글 목록
    ├── PostDetailPage.jsx   # 게시글 상세 + 댓글
    ├── PostCreatePage.jsx   # 게시글 작성
    ├── PostEditPage.jsx     # 게시글 수정
    ├── LoginPage.jsx        # 로그인
    ├── SignupPage.jsx       # 회원가입
    ├── ProfileEditPage.jsx  # 프로필 수정
    ├── PasswordEditPage.jsx # 비밀번호 변경
    └── NotFoundPage.jsx     # 404
```

---

## 🚀 실행 방법

**사전 조건:** Node.js 18+, Backend API 실행 중

```bash
# 1. 의존성 설치
cd FE/react-app
npm install

# 2. 개발 서버 실행 (http://localhost:5173)
npm run dev

# 3. 프로덕션 빌드
npm run build

# 4. 빌드 미리보기
npm run preview
```

루트 `FE/` 에서 실행하는 경우:

```bash
cd FE
npm run dev      # react-app dev server
npm run build    # react-app build
npm run preview  # react-app preview
```

### 환경 변수

`FE/react-app/.env` 파일을 생성하여 API 서버 주소를 지정할 수 있습니다.

```env
VITE_API_BASE_URL=http://localhost:8080
```

미설정 시 `http://localhost:8080` 으로 기본 동작합니다.

---

## 🧩 핵심 구현 요약

### 🔹 1. httpClient — 401 자동 갱신 인터셉터

`httpClient.js`는 `createHttpClient` 팩토리로 생성되며, 401 응답 시 Refresh Token으로 액세스 토큰을 갱신하고 원래 요청을 **자동으로 1회 재시도**합니다.

- 동시 다발적 401 요청에 대해 갱신을 **단일 Promise로 중복 제거**
- 갱신 실패 시 `onRefreshFailed` 콜백으로 저장된 인증 정보 초기화
- 인증이 필요 없는 요청에는 `publicHttpClient`(토큰 없음) 사용

### 🔹 2. AuthProvider — 전역 인증 상태 관리

`AuthProvider`가 React Context로 `user`, `isInitializing`, `login`, `logout` 등을 제공합니다.

- 앱 진입 시 `/me` 호출로 세션 복원 (`isInitializing`으로 가드)
- `localStorage` 변경 이벤트 + 커스텀 `auth:changed` 이벤트로 탭 간 동기화
- `useAuth()` 훅으로 어디서든 인증 상태 접근

### 🔹 3. 이미지 업로드 (Base64)

프로필 이미지 및 리뷰 이미지는 `FileReader`로 Base64 변환 후 서버 전송합니다.
별도의 파일 서버 없이 이미지 기반 기능을 구현합니다.

### 🔹 4. 댓글 재조회 경쟁 조건 방지

댓글 CRUD 후 목록을 다시 불러올 때 `AbortController` + 시퀀스 번호(`commentsSeqRef`)로 이전 요청을 취소하고 오래된 응답을 무시합니다.

### 🔹 5. 에러/로딩 상태 공통화

`PageStateCard` 컴포넌트로 로딩 메시지, 에러 메시지, 재시도 버튼을 통일합니다.
`BoardPage`, `PostDetailPage`, `PostEditPage` 등에서 공유 사용합니다.

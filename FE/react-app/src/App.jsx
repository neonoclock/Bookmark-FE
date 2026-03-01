import AppLayout from "./app/AppLayout.jsx";
import "./App.css";

function App() {
  return (
    <AppLayout>
      <section className="intro-card">
        <p className="intro-card__label">React Migration</p>
        <h1 className="intro-card__title">Bookmark 프론트엔드 마이그레이션</h1>
        <p className="intro-card__desc">
          기본 앱 레이아웃과 전역 스타일을 먼저 구성했습니다.
        </p>
      </section>
      <div className="placeholder-grid">
        <article className="placeholder-block">로그인 페이지</article>
        <article className="placeholder-block">회원가입 페이지</article>
        <article className="placeholder-block">게시글 목록 페이지</article>
      </div>
    </AppLayout>
  );
}

export default App;

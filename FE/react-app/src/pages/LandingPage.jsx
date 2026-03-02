import { useNavigate, Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <span className="landing-brand">책갈피</span>
      </header>

      <main className="landing-main">
        <div className="landing-card">
          <p className="landing-card-deco" aria-hidden="true">
            ~~~~~~~~~~
          </p>

          <h1 className="landing-title">📚 책갈피에 오신 걸 환영해요</h1>

          <p className="landing-subtitle">
            읽은 책에 대한 생각을 나누고
            <br />
            다른 독자들의 따뜻한 리뷰를 만나보세요.
          </p>

          <ul className="landing-features">
            <li>읽은 책 리뷰를 편하게 기록해요</li>
            <li>다른 독자들의 감상도 구경해요</li>
            <li>취향 맞는 책을 서로 추천하며 소통해요</li>
          </ul>

          <button
            className="landing-cta"
            type="button"
            onClick={() => navigate("/signup")}
          >
            책갈피 시작하기
          </button>

          <p className="landing-login-hint">
            이미 계정이 있으신가요?{" "}
            <Link className="landing-login-link" to="/login">
              로그인하기 ↗
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;

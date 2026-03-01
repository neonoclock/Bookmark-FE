import { Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  return (
    <section className="login-page">
      <article className="login-card">
        <h1 className="login-card__title">로그인</h1>
        <form className="login-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <div className="login-field">
            <label htmlFor="login-email">이메일</label>
            <input
              id="login-email"
              type="email"
              placeholder="이메일을 입력하세요"
              autoComplete="username"
            />
            <p className="helper"> </p>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
            <p className="helper"> </p>
          </div>

          <button type="submit" className="login-submit">
            로그인
          </button>
        </form>

        <Link className="login-signup-link" to="/signup">
          회원가입
        </Link>
      </article>
    </section>
  );
}

export default LoginPage;

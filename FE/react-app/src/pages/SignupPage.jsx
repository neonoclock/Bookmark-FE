import { Link } from "react-router-dom";
import "./SignupPage.css";

function SignupPage() {
  return (
    <section className="signup-page">
      <article className="signup-card">
        <h1 className="signup-title">회원가입</h1>

        <div className="signup-avatar-block">
          <label className="signup-label" htmlFor="signup-avatar">
            프로필 사진
          </label>
          <label className="signup-avatar-upload" htmlFor="signup-avatar">
            <input id="signup-avatar" type="file" accept="image/*" hidden />
            <span className="signup-avatar-plus">+</span>
          </label>
          <p className="signup-helper"> </p>
        </div>

        <form className="signup-form" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-email">
              이메일
            </label>
            <input id="signup-email" type="email" placeholder="이메일을 입력하세요" />
            <p className="signup-helper"> </p>
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-password">
              비밀번호
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
            />
            <p className="signup-helper"> </p>
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-password-check">
              비밀번호 확인
            </label>
            <input
              id="signup-password-check"
              type="password"
              placeholder="비밀번호를 한번 더 입력하세요"
            />
            <p className="signup-helper"> </p>
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-nickname">
              닉네임
            </label>
            <input id="signup-nickname" type="text" placeholder="닉네임을 입력하세요" />
            <p className="signup-helper"> </p>
          </div>

          <button className="signup-submit" type="submit">
            회원가입
          </button>
        </form>

        <Link className="signup-login-link" to="/login">
          로그인하러 가기
        </Link>
      </article>
    </section>
  );
}

export default SignupPage;

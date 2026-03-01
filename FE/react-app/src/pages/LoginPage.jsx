import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "@/lib/api/authApi.js";
import "./LoginPage.css";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function mapServerError(error) {
  const code = error?.payload?.code ?? error?.code;
  const message = error?.message;
  const detail = error?.payload?.detail;

  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const mapped = {};
    if (typeof detail.email === "string") mapped.email = detail.email;
    if (typeof detail.password === "string") mapped.password = detail.password;
    if (Object.keys(mapped).length > 0) return mapped;
  }

  switch (code) {
    case "UNAUTHORIZED":
    case "FORBIDDEN":
      return { password: "이메일 또는 비밀번호가 올바르지 않습니다." };
    case "invalid_request":
      return { form: "입력값을 다시 확인해주세요." };
    case "invalid_json":
      return { form: "요청 형식이 올바르지 않습니다." };
    case "internal_error":
      return { form: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
    default:
      return { form: message || "로그인 중 오류가 발생했습니다." };
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "이메일을 입력해주세요.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    if (!password) {
      nextErrors.password = "비밀번호를 입력해주세요.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await authApi.login({
        email: email.trim(),
        password,
        remember_me: false,
      });
      navigate("/board");
    } catch (error) {
      setErrors(mapServerError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-page">
      <article className="login-card">
        <h1 className="login-card__title">로그인</h1>
        <form className="login-form" autoComplete="off" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">이메일</label>
            <input
              id="login-email"
              type="email"
              placeholder="이메일을 입력하세요"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <p className={`helper ${errors.email ? "helper--error" : ""}`}>
              {errors.email || " "}
            </p>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <p className={`helper ${errors.password ? "helper--error" : ""}`}>
              {errors.password || " "}
            </p>
          </div>

          {errors.form ? <p className="login-form-error">{errors.form}</p> : null}

          <button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중..." : "로그인"}
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

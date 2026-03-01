import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api/authApi.js";
import "./PasswordEditPage.css";

function PasswordEditPage() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await authApi.getMe();
      } catch {
        if (!mounted) return;
        navigate("/login", { replace: true });
        return;
      }
      if (mounted) setIsCheckingAuth(false);
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const validate = () => {
    const nextErrors = {};

    if (!oldPassword.trim()) {
      nextErrors.oldPassword = "현재 비밀번호를 입력해주세요.";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (newPassword.trim().length < 8) {
      nextErrors.newPassword = "비밀번호는 8자 이상이어야 합니다.";
    }

    if (!newPasswordCheck.trim()) {
      nextErrors.newPasswordCheck = "비밀번호 확인을 입력해주세요.";
    } else if (newPassword !== newPasswordCheck) {
      nextErrors.newPasswordCheck = "비밀번호가 일치하지 않습니다.";
    }

    return nextErrors;
  };

  const mapServerError = (error) => {
    const code = error?.payload?.code;
    const detail = error?.payload?.detail;
    const message = error?.message;

    if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      const mapped = {};
      if (typeof detail.oldPassword === "string") mapped.oldPassword = detail.oldPassword;
      if (typeof detail.newPassword === "string") mapped.newPassword = detail.newPassword;
      if (typeof detail.newPasswordCheck === "string") {
        mapped.newPasswordCheck = detail.newPasswordCheck;
      }
      if (typeof detail.newPasswordMatch === "string") {
        mapped.newPasswordCheck = detail.newPasswordMatch;
      }
      if (typeof detail.isNewPasswordMatch === "string") {
        mapped.newPasswordCheck = detail.isNewPasswordMatch;
      }
      if (Object.keys(mapped).length > 0) return mapped;
    }

    if (message === "현재 비밀번호가 일치하지 않습니다.") {
      return { oldPassword: "현재 비밀번호가 일치하지 않습니다." };
    }

    switch (code) {
      case "UNAUTHORIZED":
      case "FORBIDDEN":
      case "unauthorized":
        return { form: "로그인이 필요합니다. 다시 로그인해주세요." };
      case "invalid_request":
        return { form: "입력값을 다시 확인해주세요." };
      case "invalid_json":
        return { form: "요청 형식이 올바르지 않습니다." };
      case "internal_error":
        return { form: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
      default:
        return { form: message || "비밀번호 변경에 실패했습니다." };
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await authApi.updatePassword({
        oldPassword,
        newPassword,
        newPasswordCheck,
      });
      navigate("/profile-edit");
    } catch (error) {
      setErrors(mapServerError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <section className="password-page">
        <article className="password-card">
          <p className="password-checking">로그인 상태를 확인하는 중입니다...</p>
        </article>
      </section>
    );
  }

  return (
    <section className="password-page">
      <article className="password-card">
        <h1 className="password-title">비밀번호 수정</h1>

        <form className="password-form" autoComplete="off" onSubmit={handleSubmit}>
          <div className="password-field">
            <label htmlFor="current-password">현재 비밀번호</label>
            <input
              id="current-password"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              disabled={isSubmitting}
            />
            <p className={`password-helper ${errors.oldPassword ? "password-helper--error" : ""}`}>
              {errors.oldPassword || " "}
            </p>
          </div>

          <div className="password-field">
            <label htmlFor="new-password">새 비밀번호</label>
            <input
              id="new-password"
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSubmitting}
            />
            <p className={`password-helper ${errors.newPassword ? "password-helper--error" : ""}`}>
              {errors.newPassword || " "}
            </p>
          </div>

          <div className="password-field">
            <label htmlFor="new-password-check">새 비밀번호 확인</label>
            <input
              id="new-password-check"
              type="password"
              placeholder="새 비밀번호를 한번 더 입력하세요"
              value={newPasswordCheck}
              onChange={(event) => setNewPasswordCheck(event.target.value)}
              disabled={isSubmitting}
            />
            <p
              className={`password-helper ${errors.newPasswordCheck ? "password-helper--error" : ""}`}
            >
              {errors.newPasswordCheck || " "}
            </p>
          </div>

          {errors.form ? <p className="password-form-error">{errors.form}</p> : null}

          <button className="password-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "수정 중..." : "수정하기"}
          </button>
        </form>
      </article>
    </section>
  );
}

export default PasswordEditPage;

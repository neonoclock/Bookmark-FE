import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api/authApi.js";
import "./SignupPage.css";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeFieldMessage(field, message) {
  const messageMap = {
    "invalid email format": "이메일 형식이 올바르지 않습니다.",
    "email is required": "이메일을 입력해주세요.",
    "password is required": "비밀번호를 입력해주세요.",
    "password_check is required": "비밀번호 확인을 입력해주세요.",
    "nickname is required": "닉네임을 입력해주세요.",
    password_mismatch: "비밀번호가 서로 일치하지 않습니다.",
  };

  if (messageMap[message]) return messageMap[message];

  const fallbackByField = {
    email: "이메일을 다시 확인해주세요.",
    password: "비밀번호를 다시 확인해주세요.",
    password_check: "비밀번호 확인을 다시 입력해주세요.",
    nickname: "닉네임을 다시 확인해주세요.",
  };

  return fallbackByField[field] || String(message || "입력값을 다시 확인해주세요.");
}

function mapServerError(error) {
  const code = error?.payload?.code;
  const detail = error?.payload?.detail;
  const message = error?.message;

  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const mapped = {};

    if (typeof detail.email === "string") {
      mapped.email = normalizeFieldMessage("email", detail.email);
    }
    if (typeof detail.password === "string") {
      mapped.password = normalizeFieldMessage("password", detail.password);
    }
    if (typeof detail.password_check === "string") {
      mapped.passwordCheck = normalizeFieldMessage("password_check", detail.password_check);
    }
    if (typeof detail.passwordMatch === "string") {
      mapped.passwordCheck = normalizeFieldMessage("password_check", detail.passwordMatch);
    }
    if (typeof detail.isPasswordMatch === "string") {
      mapped.passwordCheck = normalizeFieldMessage("password_check", detail.isPasswordMatch);
    }
    if (typeof detail.nickname === "string") {
      mapped.nickname = normalizeFieldMessage("nickname", detail.nickname);
    }

    if (Object.keys(mapped).length > 0) return mapped;
  }

  if (message === "이메일이 이미 존재합니다." || code === "duplicate_user") {
    return { email: "이미 사용 중인 이메일입니다." };
  }

  switch (code) {
    case "invalid_request":
      return { form: "입력값을 다시 확인해주세요." };
    case "invalid_json":
      return { form: "요청 형식이 올바르지 않습니다." };
    case "internal_error":
      return { form: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
    default:
      return { form: message || "회원가입 중 오류가 발생했습니다." };
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedEmail) {
      nextErrors.email = "이메일을 입력해주세요.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "이메일 형식이 올바르지 않습니다.";
    }

    if (!password) {
      nextErrors.password = "비밀번호를 입력해주세요.";
    } else if (password.length < 8) {
      nextErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }

    if (!passwordCheck) {
      nextErrors.passwordCheck = "비밀번호를 한 번 더 입력해주세요.";
    } else if (password !== passwordCheck) {
      nextErrors.passwordCheck = "비밀번호가 서로 일치하지 않습니다.";
    }

    if (!trimmedNickname) {
      nextErrors.nickname = "닉네임을 입력해주세요.";
    } else if (trimmedNickname.length > 30) {
      nextErrors.nickname = "닉네임은 최대 30자까지 가능합니다.";
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
      await authApi.signup({
        email: email.trim(),
        password,
        password_check: passwordCheck,
        nickname: nickname.trim(),
        profileImage,
      });
      navigate("/login");
    } catch (error) {
      setErrors(mapServerError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfileImage(null);
      setAvatarFileName("");
      setErrors((prev) => ({ ...prev, avatar: undefined }));
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setProfileImage(null);
      setAvatarFileName("");
      setErrors((prev) => ({
        ...prev,
        avatar: "이미지 크기는 2MB 이하여야 합니다.",
      }));
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProfileImage(dataUrl);
      setAvatarFileName(file.name);
      setErrors((prev) => ({ ...prev, avatar: undefined }));
    } catch {
      setProfileImage(null);
      setAvatarFileName("");
      setErrors((prev) => ({
        ...prev,
        avatar: "이미지를 읽는 중 오류가 발생했습니다.",
      }));
    }
  };

  const avatarHelperText = errors.avatar || (avatarFileName ? `선택된 파일: ${avatarFileName}` : " ");

  return (
    <section className="signup-page">
      <article className="signup-card">
        <h1 className="signup-title">회원가입</h1>

        <div className="signup-avatar-block">
          <label className="signup-label" htmlFor="signup-avatar">
            프로필 사진
          </label>
          <label
            className={`signup-avatar-upload ${profileImage ? "signup-avatar-upload--filled" : ""}`}
            htmlFor="signup-avatar"
            style={profileImage ? { backgroundImage: `url(${profileImage})` } : undefined}
          >
            <input
              id="signup-avatar"
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
              disabled={isSubmitting}
            />
            <span className="signup-avatar-plus">+</span>
          </label>
          <p className={`signup-helper ${errors.avatar ? "signup-helper--error" : ""}`}>
            {avatarHelperText}
          </p>
        </div>

        <form className="signup-form" autoComplete="off" onSubmit={handleSubmit}>
          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-email">
              이메일
            </label>
            <input
              id="signup-email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
            />
            <p className={`signup-helper ${errors.email ? "signup-helper--error" : ""}`}>
              {errors.email || " "}
            </p>
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-password">
              비밀번호
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
            <p className={`signup-helper ${errors.password ? "signup-helper--error" : ""}`}>
              {errors.password || " "}
            </p>
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-password-check">
              비밀번호 확인
            </label>
            <input
              id="signup-password-check"
              type="password"
              placeholder="비밀번호를 한번 더 입력하세요"
              value={passwordCheck}
              onChange={(event) => setPasswordCheck(event.target.value)}
              disabled={isSubmitting}
            />
            <p className={`signup-helper ${errors.passwordCheck ? "signup-helper--error" : ""}`}>
              {errors.passwordCheck || " "}
            </p>
          </div>

          <div className="signup-field">
            <label className="signup-label" htmlFor="signup-nickname">
              닉네임
            </label>
            <input
              id="signup-nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              disabled={isSubmitting}
            />
            <p className={`signup-helper ${errors.nickname ? "signup-helper--error" : ""}`}>
              {errors.nickname || " "}
            </p>
          </div>

          {errors.form ? <p className="signup-form-error">{errors.form}</p> : null}

          <button className="signup-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "회원가입 중..." : "회원가입"}
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

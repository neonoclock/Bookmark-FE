// public/assets/js/pages/login.js

import {
  $,
  setHelper,
  clearFormHelpers,
  setDisabled,
  on,
} from "../core/dom.js";
import { saveAuth } from "../core/storage.js";
import { AuthAPI } from "../api/auth.js";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// 클라이언트 측 기본 검증
function validate({ email, pw }) {
  let valid = true;

  if (!email) {
    setHelper("#email", "이메일을 입력해주세요.", true);
    valid = false;
  } else if (!isValidEmail(email)) {
    setHelper("#email", "이메일 형식이 올바르지 않습니다.", true);
    valid = false;
  }

  if (!pw) {
    setHelper("#password", "비밀번호를 입력해주세요.", true);
    valid = false;
  }

  return valid;
}

// 서버에서 내려준 에러 메세지 처리
function handleServerError(message, { emailEl, pwEl }) {
  switch (message) {
    case "invalid email format":
      setHelper(emailEl, "이메일 형식이 올바르지 않습니다.", true);
      break;
    case "email is required":
      setHelper(emailEl, "이메일을 입력해주세요.", true);
      break;
    case "password is required":
      setHelper(pwEl, "비밀번호를 입력해주세요.", true);
      break;
    case "invalid credentials":
      // 로그인 정보 틀렸을 때
      setHelper(pwEl, "이메일 또는 비밀번호가 올바르지 않습니다.", true);
      break;
    default:
      alert(message || "로그인 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = $(".auth-form");
  const emailEl = $("#email");
  const pwEl = $("#password");
  const submitBtn = $(".btn.primary");
  const signupLink = $(".link-btn");

  // "회원가입" 버튼 클릭 → 회원가입 페이지로 이동
  on(signupLink, "click", () => {
    window.location.href = "./signup.html";
  });

  // 로그인 폼 제출 이벤트
  on(form, "submit", async (e) => {
    e.preventDefault();

    // 기존 helper 초기화
    clearFormHelpers(form);

    const email = emailEl.value.trim();
    const pw = pwEl.value;

    const isValid = validate({ email, pw });
    if (!isValid) return;

    setDisabled(submitBtn, true);

    try {
      // remember_me는 일단 false로 고정
      const user = await AuthAPI.login(email, pw, false);

      // user 엔티티 JSON을 바로 받기 때문에 필요한 정보만 저장
      if (user?.id) {
        saveAuth({
          id: user.id,
          nickname: user.nickname,
          profileImage: user.profileImage ?? null,
          email: user.email,
          role: user.role,
        });
      }

      alert("로그인에 성공했습니다.");
      // 로그인 후 게시판으로 이동 (원하는 페이지로 변경 가능)
      window.location.href = "./board.html";
    } catch (err) {
      console.error("login error:", err);
      handleServerError(err.message, { emailEl, pwEl });
    } finally {
      setDisabled(submitBtn, false);
    }
  });
});

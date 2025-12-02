import {
  $,
  setHelper,
  clearFormHelpers,
  setDisabled,
  on,
} from "../core/dom.js";
import { AuthAPI } from "../api/auth.js";

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

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
      setHelper(pwEl, "이메일 또는 비밀번호가 올바르지 않습니다.", true);
      break;
    default:
      alert(message || "로그인 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = $(".auth-form");
  if (!form) {
    console.warn("[LOGIN] .auth-form 요소를 찾지 못했습니다.");
    return;
  }

  const emailEl = $("#email");
  const pwEl = $("#password");
  const submitBtn = $(".btn.primary");
  const signupLink = $(".link-btn");

  if (signupLink) {
    on(signupLink, "click", () => {
      window.location.href = "./signup.html";
    });
  }

  on(form, "submit", async (e) => {
    e.preventDefault();

    clearFormHelpers(form);

    const email = emailEl.value.trim();
    const pw = pwEl.value;

    const isValid = validate({ email, pw });
    if (!isValid) return;

    setDisabled(submitBtn, true);

    try {
      const user = await AuthAPI.login(email, pw);
      console.log("[LOGIN] success, user:", user);

      alert("로그인에 성공했습니다.");
      window.location.href = "./board.html";
    } catch (err) {
      console.error("login error:", err);
      handleServerError(err.message, { emailEl, pwEl });
    } finally {
      setDisabled(submitBtn, false);
    }
  });
});

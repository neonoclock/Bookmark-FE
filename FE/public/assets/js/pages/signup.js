import {
  $,
  setHelper,
  clearFormHelpers,
  setDisabled,
  on,
} from "../core/dom.js";
import { AuthAPI } from "../api/auth.js";

function h(type, props, ...children) {
  const flatChildren = children
    .flat()
    .filter((c) => c !== null && c !== false && c !== undefined);

  return {
    type,
    props: props || {},
    children: flatChildren,
  };
}

function createElement(vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  const el = document.createElement(vnode.type);
  const props = vnode.props || {};

  for (const key in props) {
    const value = props[key];
    if (key === "class") {
      el.className = value;
    } else if (key === "dataset" && value && typeof value === "object") {
      Object.assign(el.dataset, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  vnode.children.forEach((child) => {
    el.appendChild(createElement(child));
  });

  return el;
}

function render(vnode, container) {
  container.innerHTML = "";
  if (!vnode) return;

  if (Array.isArray(vnode)) {
    vnode.forEach((child) => {
      container.appendChild(createElement(child));
    });
  } else {
    container.appendChild(createElement(vnode));
  }
}

function AppView() {
  return h(
    "section",
    { class: "signup-card" },

    h("h2", { class: "signup-title" }, "회원가입"),

    h(
      "div",
      { class: "field block" },
      h("label", { class: "label" }, "프로필 사진"),
      h(
        "label",
        { class: "avatar-upload" },
        h("input", {
          id: "avatar",
          type: "file",
          accept: "image/*",
          hidden: "",
        }),
        h("span", { class: "plus" }, "+")
      ),

      h("p", { class: "helper" }, "")
    ),

    h(
      "form",
      { class: "form", autocomplete: "off" },

      h(
        "div",
        { class: "field" },
        h(
          "label",
          { class: "label", for: "email" },
          "이메일",
          h("span", { class: "req" }, "")
        ),
        h("input", {
          id: "email",
          type: "email",
          placeholder: "이메일을 입력하세요",
        }),
        h("p", { class: "helper" }, "")
      ),

      h(
        "div",
        { class: "field" },
        h(
          "label",
          { class: "label", for: "pw" },
          "비밀번호",
          h("span", { class: "req" }, "")
        ),
        h("input", {
          id: "pw",
          type: "password",
          placeholder: "비밀번호를 입력하세요",
        }),
        h("p", { class: "helper" }, "")
      ),

      h(
        "div",
        { class: "field" },
        h(
          "label",
          { class: "label", for: "pw2" },
          "비밀번호 확인",
          h("span", { class: "req" }, "")
        ),
        h("input", {
          id: "pw2",
          type: "password",
          placeholder: "비밀번호를 한번 더 입력하세요",
        }),
        h("p", { class: "helper" }, "")
      ),

      h(
        "div",
        { class: "field" },
        h(
          "label",
          { class: "label", for: "nick" },
          "닉네임",
          h("span", { class: "req" }, "")
        ),
        h("input", {
          id: "nick",
          type: "text",
          placeholder: "닉네임을 입력하세요",
        }),
        h("p", { class: "helper" }, "")
      ),

      h("button", { class: "btn primary", type: "submit" }, "회원가입"),
      h("button", { class: "link-btn", type: "button" }, "로그인하러 가기")
    )
  );
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validate({ email, pw, pw2, nick }) {
  let valid = true;

  if (!email) {
    setHelper("#email", "이메일을 입력해주세요.", true);
    valid = false;
  } else if (!isValidEmail(email)) {
    setHelper("#email", "이메일 형식이 올바르지 않습니다.", true);
    valid = false;
  }

  if (!pw) {
    setHelper("#pw", "비밀번호를 입력해주세요.", true);
    valid = false;
  } else if (pw.length < 8) {
    setHelper("#pw", "비밀번호는 최소 8자 이상이어야 합니다.", true);
    valid = false;
  }

  if (!pw2) {
    setHelper("#pw2", "비밀번호를 한 번 더 입력해주세요.", true);
    valid = false;
  } else if (pw && pw2 && pw !== pw2) {
    setHelper("#pw2", "비밀번호가 서로 일치하지 않습니다.", true);
    valid = false;
  }

  if (!nick) {
    setHelper("#nick", "닉네임을 입력해주세요.", true);
    valid = false;
  } else if (nick.length > 30) {
    setHelper("#nick", "닉네임은 최대 30자까지 가능합니다.", true);
    valid = false;
  }

  return valid;
}

function handleServerError(message, { emailEl, pwEl, pw2El, nickEl }) {
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
    case "password_check is required":
      setHelper(pw2El, "비밀번호 확인을 입력해주세요.", true);
      break;
    case "nickname is required":
      setHelper(nickEl, "닉네임을 입력해주세요.", true);
      break;
    case "password_mismatch":
      setHelper(pw2El, "비밀번호가 서로 일치하지 않습니다.", true);
      break;
    case "이메일이 이미 존재합니다.":
      setHelper(emailEl, "이미 사용 중인 이메일입니다.", true);
      break;
    default:
      alert(message || "회원가입 중 오류가 발생했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("main.auth-layout");
  if (!root) {
    console.warn("[SIGNUP] main.auth-layout 요소를 찾지 못했습니다.");
    return;
  }

  render(AppView(), root);

  const form = $(".form");
  const emailEl = $("#email");
  const pwEl = $("#pw");
  const pw2El = $("#pw2");
  const nickEl = $("#nick");
  const avatarIn = $("#avatar");
  const loginLink = $(".link-btn");
  const submitBtn = $(".btn.primary");

  if (!form || !emailEl || !pwEl || !pw2El || !nickEl || !avatarIn) {
    console.warn("[SIGNUP] 필수 요소를 찾지 못했습니다.");
    return;
  }

  const avatarField = avatarIn.closest(".field");
  const avatarLabel = avatarField?.querySelector(".avatar-upload");
  const avatarPlus = avatarLabel?.querySelector(".plus");

  let avatarDataUrl = null;

  if (avatarIn) {
    on(avatarIn, "change", () => {
      const file = avatarIn.files?.[0];
      console.log("[EVT] 아바타 선택됨", file);

      if (!file) {
        avatarDataUrl = null;
        setHelper(avatarField, "", false);

        if (avatarLabel) {
          avatarLabel.style.backgroundImage = "";
          avatarLabel.style.backgroundSize = "";
          avatarLabel.style.backgroundPosition = "";
          avatarLabel.style.backgroundRepeat = "";
        }
        if (avatarPlus) {
          avatarPlus.style.opacity = "1";
        }
        return;
      }

      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        avatarDataUrl = null;
        setHelper(avatarField, "이미지 크기는 2MB 이하여야 합니다.", true);
        avatarIn.value = "";

        if (avatarLabel) {
          avatarLabel.style.backgroundImage = "";
          avatarLabel.style.backgroundSize = "";
          avatarLabel.style.backgroundPosition = "";
          avatarLabel.style.backgroundRepeat = "";
        }
        if (avatarPlus) {
          avatarPlus.style.opacity = "1";
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        avatarDataUrl = e.target.result;

        if (avatarLabel) {
          avatarLabel.style.backgroundImage = `url(${avatarDataUrl})`;
          avatarLabel.style.backgroundSize = "cover";
          avatarLabel.style.backgroundPosition = "center";
          avatarLabel.style.backgroundRepeat = "no-repeat";
        }

        if (avatarPlus) {
          avatarPlus.style.opacity = "0";
        }

        setHelper(avatarField, `선택된 파일: ${file.name}`, false);
        console.log("[EVT] avatar base64 length:", avatarDataUrl?.length);
      };
      reader.onerror = () => {
        avatarDataUrl = null;
        setHelper(avatarField, "이미지를 읽는 중 오류가 발생했습니다.", true);

        if (avatarLabel) {
          avatarLabel.style.backgroundImage = "";
          avatarLabel.style.backgroundSize = "";
          avatarLabel.style.backgroundPosition = "";
          avatarLabel.style.backgroundRepeat = "";
        }
        if (avatarPlus) {
          avatarPlus.style.opacity = "1";
        }
      };

      reader.readAsDataURL(file);
    });
  }

  if (loginLink) {
    on(loginLink, "click", () => {
      window.location.href = "./login.html";
    });
  }

  on(form, "submit", async (e) => {
    e.preventDefault();

    clearFormHelpers(form);

    const email = emailEl.value.trim();
    const pw = pwEl.value;
    const pw2 = pw2El.value;
    const nick = nickEl.value.trim();

    const isValid = validate({ email, pw, pw2, nick });
    if (!isValid) return;

    setDisabled(submitBtn, true);

    try {
      await AuthAPI.signup({
        email,
        password: pw,
        passwordCheck: pw2,
        nickname: nick,
        profileImage: avatarDataUrl,
      });

      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      window.location.href = "./login.html";
    } catch (err) {
      console.error("signup error:", err);
      handleServerError(err.message, { emailEl, pwEl, pw2El, nickEl });
    } finally {
      setDisabled(submitBtn, false);
    }
  });
});

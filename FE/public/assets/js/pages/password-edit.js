import {
  $,
  setHelper,
  clearFormHelpers,
  setDisabled,
  on,
} from "../core/dom.js";
import { PATCH } from "../core/http.js";
import { UsersAPI } from "../api/users.js";
import { loadMyAvatar, setupAvatarMenu } from "../common/ui.js";

async function ensureLogin() {
  try {
    const me = await UsersAPI.getMe();
    console.log("[PASSWORD] me:", me);
    return me;
  } catch (e) {
    console.warn("[PASSWORD] not logged in:", e);
    alert("로그인이 필요합니다.");
    location.href = "./login.html";
    return null;
  }
}

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
  container.appendChild(createElement(vnode));
}

function AppView() {
  return h(
    "section",
    { class: "card" },
    h("h2", { class: "title" }, "비밀번호 수정"),
    h(
      "form",
      { class: "form", autocomplete: "off" },

      h(
        "div",
        { class: "field" },
        h("label", { for: "currentPw", class: "label" }, "현재 비밀번호"),
        h("input", {
          id: "currentPw",
          type: "password",
          placeholder: "현재 비밀번호를 입력하세요",
        }),
        h("p", { class: "helper" }, "")
      ),

      h(
        "div",
        { class: "field" },
        h("label", { for: "pw", class: "label" }, "새 비밀번호"),
        h("input", {
          id: "pw",
          type: "password",
          placeholder: "새 비밀번호를 입력하세요",
        }),
        h("p", { class: "helper" }, "")
      ),

      h(
        "div",
        { class: "field" },
        h("label", { for: "pw2", class: "label" }, "새 비밀번호 확인"),
        h("input", {
          id: "pw2",
          type: "password",
          placeholder: "새 비밀번호를 한번 더 입력하세요",
        }),
        h("p", { class: "helper" }, "")
      ),

      h("button", { class: "btn primary", type: "submit" }, "수정하기")
    )
  );
}

function makeValidator(currentPwEl, pwEl, pw2El, form) {
  return function validate() {
    clearFormHelpers(form);
    let ok = true;

    const currentPw = currentPwEl.value.trim();
    const pw = pwEl.value.trim();
    const pw2 = pw2El.value.trim();

    if (!currentPw) {
      setHelper(currentPwEl, "현재 비밀번호를 입력해주세요.", true);
      ok = false;
    }

    if (!pw) {
      setHelper(pwEl, "새 비밀번호를 입력해주세요.", true);
      ok = false;
    }

    if (!pw2) {
      setHelper(pw2El, "비밀번호 확인을 입력해주세요.", true);
      ok = false;
    }

    if (pw && pw2 && pw !== pw2) {
      setHelper(pw2El, "비밀번호가 일치하지 않습니다.", true);
      ok = false;
    }

    if (pw && pw.length < 8) {
      setHelper(pwEl, "비밀번호는 8자 이상이어야 합니다.", true);
      ok = false;
    }

    return ok;
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const me = await ensureLogin();
  if (!me) return;

  loadMyAvatar("[PASSWORD]");
  setupAvatarMenu();

  const layout = document.querySelector("main.layout");
  if (!layout) {
    console.warn("[PASSWORD] main.layout 요소를 찾지 못했습니다.");
    return;
  }
  render(AppView(), layout);

  const form = $(".form");
  if (!form) {
    console.warn("[PASSWORD] .form 요소를 찾지 못했습니다.");
    return;
  }

  const currentPwEl = $("#currentPw");
  const pwEl = $("#pw");
  const pw2El = $("#pw2");
  const submitBtn = $(".btn.primary");

  const validate = makeValidator(currentPwEl, pwEl, pw2El, form);

  on(form, "submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const oldPassword = currentPwEl.value.trim();
    const newPassword = pwEl.value.trim();
    const newPasswordCheck = pw2El.value.trim();

    if (submitBtn) {
      setDisabled(submitBtn, true);
    }

    try {
      await PATCH(`/api/v1/users/password`, {
        oldPassword,
        newPassword,
        newPasswordCheck,
      });

      alert("비밀번호가 성공적으로 변경되었습니다.");
      location.href = "./profile-edit.html";
    } catch (err) {
      console.error("비밀번호 변경 실패:", err);
      alert(err.message || "비밀번호 변경 실패");
    } finally {
      if (submitBtn) {
        setDisabled(submitBtn, false);
      }
    }
  });
});

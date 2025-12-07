import { $, setHelper, clearFormHelpers, setDisabled } from "../core/dom.js";
import { loadAuth, saveAuth, clearAuth } from "../core/storage.js";
import { UsersAPI } from "../api/users.js";

let currentProfileImage = null;

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
    { class: "page" },
    h("h2", { class: "page-title" }, "회원정보수정"),

    h(
      "section",
      { class: "section profile" },
      h(
        "p",
        { class: "field-label" },
        "프로필 사진 ",
        h("span", { class: "req" }, "")
      ),
      h(
        "p",
        { class: "helper error" },
        h("span", { class: "star" }, ""),
        " helper text"
      ),
      h(
        "label",
        { class: "avatar-uploader" },
        h("input", {
          type: "file",
          accept: "image/*",
          hidden: "",
        }),
        h("img", {
          src: "https://placehold.co/200x200/aaaaaa/ffffff?text=%20",
          alt: "프로필 미리보기",
        }),
        h("span", { class: "badge" }, "변경")
      )
    ),

    h(
      "form",
      { class: "form", autocomplete: "off" },

      h(
        "div",
        { class: "field" },
        h("label", { class: "input-label" }, "이메일"),
        h("p", { class: "readonly" }, "startupcode@gmail.com")
      ),

      h(
        "div",
        { class: "field" },
        h("label", { class: "input-label", for: "nick" }, "닉네임"),
        h(
          "div",
          { class: "row" },
          h("input", {
            id: "nick",
            type: "text",
            placeholder: "닉네임을 입력하세요",
          })
        )
      ),

      h("button", { type: "button", class: "btn primary block" }, "수정하기"),
      h("button", { type: "button", class: "link danger" }, "회원 탈퇴"),
      h("button", { type: "button", class: "btn primary pill" }, "완료")
    )
  );
}

async function loadProfile() {
  const emailEl = $(".field .readonly");
  const nickInput = $("#nick");
  const avatarImg = document.querySelector(".avatar-uploader img");
  const headerAvatarBtn = $("#avatarBtn");

  try {
    const user = await UsersAPI.getMe();
    console.log("[PROFILE] loaded user:", user);

    if (emailEl && user.email) {
      emailEl.textContent = user.email;
    }

    if (nickInput) {
      nickInput.value = user.nickname || "";
    }

    if (user.profileImage) {
      if (avatarImg) {
        avatarImg.src = user.profileImage;
      }
      currentProfileImage = user.profileImage;

      if (headerAvatarBtn) {
        headerAvatarBtn.style.setProperty(
          "--avatar-url",
          `url(${user.profileImage})`
        );
        headerAvatarBtn.classList.add("has-avatar");
        headerAvatarBtn.textContent = "";
      }
    } else {
      currentProfileImage = null;
    }
  } catch (e) {
    console.error("[PROFILE] loadProfile error:", e);
    alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
    window.location.href = "./login.html";
  }
}

function validateForm() {
  const nickInput = $("#nick");
  const nickname = nickInput.value.trim();

  clearFormHelpers(document);

  if (!nickname) {
    setHelper(nickInput, "닉네임을 입력하세요.", true);
    nickInput.focus();
    return false;
  }

  return true;
}

async function updateProfileCore() {
  if (!validateForm()) return false;

  const nickInput = $("#nick");
  const nickname = nickInput.value.trim();
  const submitBtn = $(".btn.primary.block");

  try {
    if (submitBtn) setDisabled(submitBtn, true);

    const result = await UsersAPI.updateProfile({
      nickname,
      profileImage: currentProfileImage,
    });

    console.log("[PROFILE] update result:", result);

    const auth = loadAuth();
    if (auth) {
      saveAuth({
        ...auth,
        nickname,
        profileImage: currentProfileImage,
      });
    }

    return true;
  } catch (e) {
    console.error("[PROFILE] updateProfileCore error:", e);
    alert(e.message || "프로필 수정에 실패했습니다.");
    return false;
  } finally {
    if (submitBtn) setDisabled(submitBtn, false);
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const ok = await updateProfileCore();
  if (ok) {
    alert("프로필이 수정되었습니다.");
  }
}

async function handleComplete(e) {
  e.preventDefault();
  const ok = await updateProfileCore();
  if (!ok) return;
  alert("프로필이 수정되었습니다.");
  window.location.href = "./board.html";
}

function setupAvatarUploader() {
  const fileInput = document.querySelector(".avatar-uploader input[type=file]");
  const avatarImg = document.querySelector(".avatar-uploader img");
  const headerAvatarBtn = $("#avatarBtn");

  if (!fileInput || !avatarImg) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    console.log("[PROFILE] avatar selected:", file);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result;
      if (typeof base64 === "string") {
        avatarImg.src = base64;
        currentProfileImage = base64;

        if (headerAvatarBtn) {
          headerAvatarBtn.style.setProperty("--avatar-url", `url(${base64})`);
          headerAvatarBtn.classList.add("has-avatar");
          headerAvatarBtn.textContent = "";
        }
      }
    };
    reader.readAsDataURL(file);
  });
}

function setupAccountButtons() {
  const logoutBtn = document.querySelector(".menu-logout");
  const deleteBtn = document.querySelector(".link.danger");
  const updateBtn = $(".btn.primary.block");
  const completeBtn = $(".btn.primary.pill");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (!confirm("로그아웃 하시겠습니까?")) return;
      clearAuth();

      window.location.href = "./login.html";
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const ok = confirm(
        "정말 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      );
      if (!ok) return;

      try {
        setDisabled(deleteBtn, true);

        await UsersAPI.deleteUser();
        alert("회원 탈퇴가 완료되었습니다.");
        clearAuth();
        window.location.href = "./index.html";
      } catch (e) {
        console.error("[PROFILE] delete user error:", e);
        alert(e.message || "회원 탈퇴에 실패했습니다.");
      } finally {
        setDisabled(deleteBtn, false);
      }
    });
  }

  if (updateBtn) {
    updateBtn.addEventListener("click", handleUpdateProfile);
  }

  if (completeBtn) {
    completeBtn.addEventListener("click", handleComplete);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[PROFILE] profile-edit page init");

  const layout = document.querySelector("main.layout");
  if (layout) {
    render(AppView(), layout);
  }

  const avatarHelper = document.querySelector(".section.profile .helper");
  if (avatarHelper) {
    avatarHelper.textContent = "";
    avatarHelper.classList.add("hidden");
  }

  setupAvatarUploader();
  setupAccountButtons();
  loadProfile();
});

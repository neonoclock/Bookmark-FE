import { $, clearFormHelpers, setDisabled, on } from "../core/dom.js";
import { PostsAPI } from "../api/posts.js";
import { UsersAPI } from "../api/users.js";
import { loadMyAvatar, setupAvatarMenu } from "../common/ui.js";

let imageDataUrl = null;

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

function getGlobalHelper() {
  return document.querySelector(".helper");
}

function showFormError(msg = "") {
  const helper = getGlobalHelper();
  if (!helper) return;

  if (!msg) {
    helper.classList.remove("error", "visible");
    helper.innerHTML = `<span class="star">*</span> `;
    return;
  }

  helper.classList.add("error", "visible");
  helper.innerHTML = `<span class="star">*</span> ${msg}`;
}

function validate({ title, content }) {
  showFormError("");

  if (!title) {
    showFormError("제목을 입력해주세요.");
    return false;
  }
  if (title.length > 26) {
    showFormError("제목은 최대 26자까지 가능합니다.");
    return false;
  }

  if (!content) {
    showFormError("내용을 입력해주세요.");
    return false;
  }

  return true;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

async function ensureLogin() {
  try {
    const me = await UsersAPI.getMe();
    console.log("[POST-CREATE] me:", me);
    return me;
  } catch (e) {
    console.warn("[POST-CREATE] not logged in:", e);
    alert("로그인 후 이용 가능한 페이지입니다.");
    window.location.href = "./login.html";
    return null;
  }
}

function AppView() {
  return [
    h("h2", { class: "page-title" }, "게시글 작성"),

    h(
      "form",
      { class: "write-form", autocomplete: "off" },
      h(
        "div",
        { class: "write-inner" },

        h(
          "div",
          { class: "field" },
          h(
            "label",
            { class: "label", for: "title" },
            "제목",
            h("span", { class: "req" }, "")
          ),
          h("input", {
            id: "title",
            type: "text",
            placeholder: "제목을 입력해주세요. (최대 26글자)",
          })
        ),

        h(
          "div",
          { class: "field" },
          h(
            "label",
            { class: "label", for: "content" },
            "내용",
            h("span", { class: "req" }, "")
          ),
          h("textarea", {
            id: "content",
            placeholder: "내용을 입력해주세요.",
          })
        ),

        h(
          "div",
          { class: "upload" },
          h("label", { class: "label inline" }, "이미지"),
          h(
            "label",
            { class: "file" },
            h("input", { type: "file", accept: "image/*" }),
            h("span", { class: "file-btn" }, "파일 선택"),
            h("span", { class: "file-hint" }, "파일을 선택해주세요.")
          )
        ),

        h("p", { class: "helper" }, h("span", { class: "star" }, "*"), " "),

        h(
          "div",
          { class: "actions" },
          h("button", { class: "btn primary", type: "submit" }, "완료")
        )
      )
    ),
  ];
}

document.addEventListener("DOMContentLoaded", async () => {
  const me = await ensureLogin();
  if (!me) return;

  const layout = document.querySelector("main.layout");
  if (layout) {
    render(AppView(), layout);
  }

  const form = $(".write-form");
  const titleEl = document.getElementById("title");
  const contentEl = document.getElementById("content");
  const fileInput = document.querySelector(".upload input[type='file']");
  const fileHint = document.querySelector(".file-hint");
  const submitBtn = $(".btn.primary");

  loadMyAvatar("[POST-CREATE]");
  setupAvatarMenu();

  showFormError("");

  if (fileInput) {
    on(fileInput, "change", async () => {
      const file = fileInput.files?.[0];
      console.log("[EVT] post image 선택됨", file);

      if (!file) {
        imageDataUrl = null;
        if (fileHint) {
          fileHint.textContent = "파일을 선택해주세요.";
        }
        return;
      }

      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        imageDataUrl = null;
        if (fileHint) {
          fileHint.textContent = "이미지는 2MB 이하여야 합니다.";
        }
        fileInput.value = "";
        return;
      }

      try {
        imageDataUrl = await readImageFile(file);
        console.log("[EVT] post image base64 length:", imageDataUrl?.length);
        if (fileHint) {
          const sizeKb = (file.size / 1024).toFixed(1);
          fileHint.textContent = `${file.name} (${sizeKb} KB)`;
        }
      } catch (e) {
        console.error("이미지 읽기 실패:", e);
        imageDataUrl = null;
        if (fileHint) {
          fileHint.textContent = "이미지를 읽는 중 오류가 발생했습니다.";
        }
      }
    });
  }

  if (form) {
    on(form, "submit", async (e) => {
      e.preventDefault();

      clearFormHelpers(form);
      showFormError("");

      const title = titleEl?.value.trim() ?? "";
      const content = contentEl?.value.trim() ?? "";

      const ok = validate({ title, content });
      if (!ok) return;

      setDisabled(submitBtn, true);

      try {
        const data = await PostsAPI.create({
          title,
          content,
          imageUrl: imageDataUrl,
        });

        console.log("[POST-CREATE] created post:", data);

        alert("게시글이 작성되었습니다.");
        window.location.href = "./board.html";
      } catch (err) {
        console.error("게시글 작성 실패:", err);
        showFormError(err?.message || "게시글 작성 중 오류가 발생했습니다.");
      } finally {
        setDisabled(submitBtn, false);
      }
    });
  }
});

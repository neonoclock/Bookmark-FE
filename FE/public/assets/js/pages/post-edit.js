import {
  $,
  on,
  setHelper,
  clearFormHelpers,
  setDisabled,
} from "../core/dom.js";
import { PostsAPI } from "../api/posts.js";
import { UsersAPI } from "../api/users.js";
import { loadMyAvatar, setupAvatarMenu } from "../common/ui.js";

let currentImageDataUrl = null;

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

function getPostIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("postId");
  return id ? Number(id) : null;
}

async function ensureLogin() {
  try {
    const me = await UsersAPI.getMe();
    return me;
  } catch (err) {
    console.warn("[POST-EDIT] ensureLogin 실패:", err);
    alert("로그인 후 이용해주세요.");
    window.location.href = "./login.html";
    return null;
  }
}

function validateForm(titleEl, contentEl, formEl) {
  clearFormHelpers(formEl);

  const title = titleEl.value.trim();
  const content = contentEl.value.trim();

  let valid = true;

  if (!title) {
    setHelper(titleEl, "제목을 입력해주세요.", true);
    valid = false;
  }

  if (!content) {
    setHelper(contentEl, "내용을 입력해주세요.", true);
    valid = false;
  }

  return valid;
}

function setupFileInput(fileInput, fileNameEl) {
  if (!fileInput) return;

  on(fileInput, "change", () => {
    const file = fileInput.files?.[0];
    console.log("[EVT] post image 선택됨", file);

    if (!file) {
      currentImageDataUrl = null;
      if (fileNameEl) {
        fileNameEl.textContent = "선택된 파일 없음";
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        currentImageDataUrl = result;
        if (fileNameEl) {
          fileNameEl.textContent = file.name || "선택된 이미지";
        }
        console.log(
          "[EVT] post image base64 length:",
          currentImageDataUrl.length
        );
      }
    };
    reader.readAsDataURL(file);
  });
}

function AppView() {
  return [
    h("h2", { class: "page-title" }, "게시글 수정"),

    h(
      "form",
      { class: "edit-form", autocomplete: "off" },
      h(
        "div",
        { class: "edit-inner" },

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
            placeholder: "제목을 입력해주세요.",
          }),
          h("p", { class: "helper" }, "")
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
          }),
          h("p", { class: "helper" }, "")
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
            h("span", { class: "file-name" }, "선택된 파일 없음")
          )
        ),

        h(
          "div",
          { class: "actions" },
          h("button", { class: "btn primary", type: "submit" }, "수정 완료")
        )
      )
    ),
  ];
}

async function loadPostDetail(postId, me) {
  const titleEl = $("#title");
  const contentEl = $("#content");
  const fileNameEl = document.querySelector(".upload .file-name");
  const submitBtn = $(".btn.primary");

  if (!titleEl || !contentEl) {
    console.warn("[POST-EDIT] title 또는 content 요소를 찾지 못했습니다.");
    return;
  }

  try {
    if (submitBtn) setDisabled(submitBtn, true);

    console.log("[REQ] 게시글 상세 조회:", postId);
    const detail = await PostsAPI.getDetail(postId, {
      viewerId: me?.userId,
    });
    console.log("[RES] 게시글 상세:", detail);

    titleEl.value = detail.title ?? "";
    contentEl.value = detail.content ?? "";

    currentImageDataUrl = detail.imageUrl ?? detail.image_url ?? null;

    if (fileNameEl) {
      if (currentImageDataUrl) {
        fileNameEl.textContent = "기존 이미지가 등록되어 있습니다.";
      } else {
        fileNameEl.textContent = "선택된 파일 없음";
      }
    }
  } catch (err) {
    console.error("게시글 상세 불러오기 실패:", err);
    alert(err.message || "게시글 정보를 불러오지 못했습니다.");
    window.location.href = "./board.html";
  } finally {
    if (submitBtn) setDisabled(submitBtn, false);
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const formEl = $(".edit-form");
  const titleEl = $("#title");
  const contentEl = $("#content");
  const submitBtn = $(".btn.primary");

  if (!formEl || !titleEl || !contentEl) {
    console.warn("[POST-EDIT] form/title/content 요소를 찾지 못했습니다.");
    return;
  }

  const postId = getPostIdFromQuery();
  if (!postId) {
    alert("잘못된 접근입니다. 게시글 번호가 없습니다.");
    window.location.href = "./board.html";
    return;
  }

  const me = await ensureLogin();
  if (!me) return;

  if (!validateForm(titleEl, contentEl, formEl)) {
    return;
  }

  const title = titleEl.value.trim();
  const content = contentEl.value.trim();
  const imageUrl = currentImageDataUrl;

  try {
    if (submitBtn) setDisabled(submitBtn, true);

    console.log("[REQ] 게시글 수정 요청:", {
      postId,
      title,
      content,
      imageUrlLength: imageUrl ? imageUrl.length : 0,
    });

    const updated = await PostsAPI.update(postId, {
      title,
      content,
      imageUrl,
    });

    console.log("[RES] 게시글 수정 완료:", updated);
    alert("게시글이 수정되었습니다.");

    window.location.href = `./post-detail.html?postId=${postId}`;
  } catch (err) {
    console.error("게시글 수정 실패:", err);
    alert(err.message || "게시글 수정에 실패했습니다.");
  } finally {
    if (submitBtn) setDisabled(submitBtn, false);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[PAGE] post-edit loaded");

  const postId = getPostIdFromQuery();
  if (!postId) {
    alert("잘못된 접근입니다. 게시글 번호가 없습니다.");
    window.location.href = "./board.html";
    return;
  }

  const me = await ensureLogin();
  if (!me) return;

  loadMyAvatar("[POST-EDIT]");
  setupAvatarMenu();

  const layout = document.querySelector("main.layout");
  if (layout) {
    render(AppView(), layout);
  }

  const fileInput = document.querySelector(".upload input[type=file]");
  const fileNameEl = document.querySelector(".upload .file-name");
  setupFileInput(fileInput, fileNameEl);

  await loadPostDetail(postId, me);

  const formEl = $(".edit-form");
  if (formEl) {
    on(formEl, "submit", handleSubmit);
  }
});

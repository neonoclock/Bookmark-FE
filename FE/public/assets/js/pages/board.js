import { $, on } from "../core/dom.js";
import { saveAuth } from "../core/storage.js";
import { PostsAPI } from "../api/posts.js";
import { UsersAPI } from "../api/users.js";
import { loadMyAvatar, setupAvatarMenu } from "../common/ui.js";
import { h, render } from "../core/vdom.js";

const state = {
  posts: [],
  loading: false,
  error: null,
};

function PostCard(post) {
  const {
    id,
    title,
    authorNickname,
    likes,
    views,
    createdAt,
    commentsCount,
    authorProfileImage,
  } = post;

  return h(
    "article",
    {
      class: "post",
      "data-post-id": id,
    },
    h(
      "div",
      { class: "post-head" },
      h("h2", { class: "post-title" }, title || "(제목 없음)"),
      h("time", { class: "post-date" }, createdAt || "")
    ),
    h(
      "div",
      { class: "post-meta" },
      h("span", null, `좋아요 ${likes ?? 0}`),
      h("span", null, `댓글 ${commentsCount ?? 0}`),
      h("span", null, `조회수 ${views ?? 0}`)
    ),
    h("div", { class: "post-divider" }),
    h(
      "footer",
      { class: "post-footer" },
      h("span", {
        class: "author-avatar" + (authorProfileImage ? " has-avatar" : ""),
        "aria-hidden": "true",
        style: authorProfileImage
          ? `--avatar-url: url(${authorProfileImage})`
          : "",
      }),
      h("span", { class: "author-name" }, authorNickname || "익명")
    )
  );
}

function BoardView(state) {
  if (state.loading) {
    return h("p", { class: "empty" }, "게시글을 불러오는 중입니다...");
  }

  if (state.error) {
    return h(
      "p",
      { class: "empty" },
      "게시글을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }

  if (!state.posts.length) {
    return h("p", { class: "empty" }, "아직 작성된 게시글이 없습니다.");
  }

  return h(
    "div",
    null,
    state.posts.map((post) => PostCard(post))
  );
}

async function ensureAuthFromServer() {
  try {
    const raw = await UsersAPI.getMe();
    if (!raw) return null;

    const me = {
      id: raw.userId ?? raw.user_id ?? raw.id,
      email: raw.email,
      nickname: raw.nickname,
      profileImage: raw.profileImage ?? raw.profile_image ?? null,
      role: raw.role ?? raw.user_role ?? null,
    };

    if (me.id) {
      saveAuth(me);
      console.log("[BOARD] 세션 사용자 동기화:", me);
      return me;
    }
    return null;
  } catch (err) {
    console.warn(
      "[BOARD] ensureAuthFromServer 실패 (로그인 안 되어 있을 수 있음):",
      err
    );
    return null;
  }
}

async function loadPosts(boardRoot) {
  if (!boardRoot) return;

  state.loading = true;
  state.error = null;
  render(BoardView(state), boardRoot);

  try {
    const res = await PostsAPI.getList({
      page: 0,
      limit: 10,
      sort: "DATE",
    });

    console.log("[BOARD] posts list res:", res);

    const rawList = res?.items ?? [];

    if (!Array.isArray(rawList) || rawList.length === 0) {
      state.posts = [];
      state.loading = false;
      render(BoardView(state), boardRoot);
      return;
    }

    state.posts = rawList.map((post) => ({
      id: post.post_id,
      title: post.title,
      authorNickname: post.author_name,
      likes: post.likes ?? 0,
      views: post.views ?? 0,
      createdAt: post.created_at,
      commentsCount: post.comment_count ?? post.commentsCount ?? 0,
      authorProfileImage: post.author_profile_image ?? null,
    }));

    state.loading = false;
    render(BoardView(state), boardRoot);
  } catch (err) {
    console.error("게시글 목록 조회 실패:", err);
    state.error = err?.message || "게시글을 불러오는 중 오류가 발생했습니다.";
    state.loading = false;
    render(BoardView(state), boardRoot);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const writeBtn = $(".intro .btn.primary");
  const boardEl = $(".board");

  await ensureAuthFromServer();

  loadMyAvatar("[BOARD]");
  setupAvatarMenu();

  if (boardEl) {
    await loadPosts(boardEl);
  }

  if (writeBtn) {
    on(writeBtn, "click", async () => {
      const me = await ensureAuthFromServer();

      if (!me) {
        alert("게시글 작성은 로그인 후 이용 가능합니다.");
        window.location.href = "./login.html";
        return;
      }

      window.location.href = "./post-create.html";
    });
  }

  if (boardEl) {
    on(boardEl, "click", (e) => {
      const postEl = e.target.closest(".post");
      if (!postEl) return;

      const postId = postEl.dataset.postId;
      if (!postId) return;

      window.location.href = `./post-detail.html?postId=${postId}`;
    });
  }
});

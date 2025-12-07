import { $ } from "../core/dom.js";
import { PostsAPI } from "../api/posts.js";
import { CommentsAPI } from "../api/comments.js";
import { UsersAPI } from "../api/users.js";
import { loadMyAvatar, setupAvatarMenu } from "../common/ui.js";

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
    } else if (key === "style") {
      el.setAttribute("style", value);
    } else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
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

const state = {
  postId: null,
  me: null,
  post: null,
  comments: [],
  isLiking: false,
  isSubmittingComment: false,
  commentDraft: "",
  editingCommentId: null,
  editingCommentDraft: "",
};

let rootEl = null;

function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("postId");
  return v ? Number(v) : null;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  } catch (e) {
    console.warn("formatDate error", e, iso);
    return iso;
  }
}

function normalizePost(post) {
  if (!post) return null;

  return {
    ...post,
    title: post.title ?? "(제목 없음)",
    authorName:
      post.author_name || post.authorName || post.author?.nickname || "익명",
    authorId: post.author_id || post.authorId || post.author?.id,
    createdAt: post.created_at || post.createdAt,
    profileImg:
      post.author_profile_image ||
      post.authorProfileImage ||
      post.author?.profile_image ||
      post.author?.profileImage ||
      "./assets/img/profile-sample.png",
    likes: post.likes ?? 0,
    views: post.views ?? 0,
    commentsCount: post.comments_count ?? post.commentCount,
    liked: post.liked ?? post.likedByViewer ?? post.likedByMe ?? false,
    imageUrl: post.image_url || post.imageUrl,
  };
}

function renderContentVNode(text) {
  if (!text) {
    return [h("p", null, "(내용이 없습니다)")];
  }

  const paragraphs = String(text).split(/\n{2,}|\r\n{2,}/);
  const nodes = [];

  paragraphs.forEach((p) => {
    const trimmed = p.trim();
    if (!trimmed) return;

    const lines = trimmed.split(/\n|\r\n/);
    const children = [];

    lines.forEach((line, idx) => {
      if (idx > 0) children.push(h("br"));
      children.push(line);
    });

    nodes.push(h("p", null, children));
  });

  return nodes;
}

function CommentsView(state) {
  const list = state.comments || [];
  const meId = state.me?.id;

  if (!list.length) {
    return h(
      "section",
      { class: "card comments", "aria-label": "댓글 목록" },
      h("p", { class: "comments-empty" }, "첫 댓글을 남겨주세요!")
    );
  }

  return h(
    "section",
    { class: "card comments", "aria-label": "댓글 목록" },
    list.map((c) => {
      const commentId = c.comment_id ?? c.id ?? c.commentId;
      const content = c.content ?? "";
      const createdAt = c.created_at || c.createdAt;
      const authorName =
        c.author_name || c.authorName || c.author?.nickname || "익명";
      const authorId = c.author_id || c.authorId || c.author?.id;
      const isMine = meId && authorId && Number(meId) === Number(authorId);
      const isEditing = state.editingCommentId === commentId;

      const actionsChildren = [];
      if (isMine) {
        if (isEditing) {
          actionsChildren.push(
            h(
              "button",
              {
                class: "chip c-save",
                onClick: async () => {
                  await handleSaveEditComment();
                },
              },
              "저장"
            )
          );
          actionsChildren.push(
            h(
              "button",
              {
                class: "chip c-cancel",
                onClick: () => {
                  handleCancelEditComment();
                },
              },
              "취소"
            )
          );
        } else {
          actionsChildren.push(
            h(
              "button",
              {
                class: "chip c-edit",
                onClick: () => {
                  startEditComment(commentId, content);
                },
              },
              "수정"
            )
          );
          actionsChildren.push(
            h(
              "button",
              {
                class: "chip c-delete",
                onClick: () => {
                  handleDeleteComment(commentId);
                },
              },
              "삭제"
            )
          );
        }
      }

      const bodyChildren = [
        h(
          "div",
          { class: "c-head" },
          h(
            "div",
            { class: "who" },
            h("span", { class: "name" }, authorName),
            h("time", { class: "date" }, formatDate(createdAt))
          ),
          h("div", { class: "actions" }, actionsChildren)
        ),
      ];

      if (isEditing) {
        bodyChildren.push(
          h("textarea", {
            class: "c-edit-input",
            value: state.editingCommentDraft,
            onInput: (e) => {
              state.editingCommentDraft = e.target.value;
            },
          })
        );
      } else {
        bodyChildren.push(h("p", { class: "c-text" }, content));
      }

      return h(
        "article",
        {
          class: "comment",
          "data-comment-id": commentId,
        },
        h("div", { class: "c-left" }, h("span", { class: "dot" })),
        h("div", { class: "c-body" }, bodyChildren)
      );
    })
  );
}

function CommentWriteView(state) {
  return h(
    "section",
    { class: "card comment-write" },
    h("textarea", {
      placeholder: "댓글을 입력해주세요.",
      "aria-label": "댓글 입력",
      value: state.commentDraft,
      onInput: (e) => {
        state.commentDraft = e.target.value;
      },
    }),
    h(
      "div",
      { class: "right" },
      h(
        "button",
        {
          class: "btn primary",
          type: "button",
          disabled: state.isSubmittingComment,
          onClick: () => {
            handleSubmitComment();
          },
        },
        state.isSubmittingComment ? "등록 중..." : "댓글 등록"
      )
    )
  );
}

function AppView(state) {
  const normalizedPost = normalizePost(state.post);

  if (!normalizedPost) {
    return h(
      "div",
      { class: "page-inner" },
      h("h2", { class: "post-title" }, "게시글을 불러오는 중입니다...")
    );
  }

  const post = normalizedPost;

  const meId = state.me?.id;
  const isOwner =
    meId && post.authorId && Number(meId) === Number(post.authorId);

  const commentsCount =
    post.commentsCount ?? (state.comments ? state.comments.length : 0);

  const likeBtnClass = "stat" + (post.liked ? " is-liked" : "");

  return h(
    "div",
    { class: "page-inner" },

    h("h2", { class: "post-title" }, post.title),

    h(
      "div",
      { class: "meta-line" },
      h(
        "div",
        { class: "author" },
        h("img", {
          class: "author-avatar",
          src: post.profileImg,
          alt: "작성자 아바타",
        }),
        h(
          "div",
          { class: "author-text" },
          h("span", { class: "name" }, post.authorName),
          h("time", { class: "date" }, formatDate(post.createdAt))
        )
      ),
      h(
        "div",
        { class: "actions" },
        isOwner
          ? [
              h(
                "button",
                {
                  class: "chip",
                  onClick: () => {
                    handleEditPost();
                  },
                },
                "수정"
              ),
              h(
                "button",
                {
                  class: "chip",
                  onClick: () => {
                    handleDeletePost();
                  },
                },
                "삭제"
              ),
            ]
          : null
      )
    ),

    post.imageUrl
      ? h(
          "div",
          { class: "media" },
          h("img", {
            class: "post-image",
            src: post.imageUrl,
            alt: "게시글 이미지",
          })
        )
      : h("div", { class: "media" }),

    h("div", { class: "content" }, renderContentVNode(post.content)),

    h(
      "div",
      { class: "stats" },
      h(
        "button",
        {
          class: likeBtnClass,
          disabled: state.isLiking,
          onClick: () => {
            handleToggleLike();
          },
        },
        h("strong", null, post.likes),
        h("span", null, "좋아요")
      ),
      h(
        "div",
        { class: "stat" },
        h("strong", null, post.views),
        h("span", null, "조회수")
      ),
      h(
        "div",
        { class: "stat" },
        h("strong", null, commentsCount),
        h("span", null, "댓글")
      )
    ),

    h("hr", { class: "divider" }),

    CommentWriteView(state),

    CommentsView(state)
  );
}

function renderApp() {
  if (!rootEl) return;
  render(AppView(state), rootEl);
}

async function loadMeIfLoggedIn() {
  try {
    const me = await UsersAPI.getMe();
    state.me = {
      id: me.userId ?? me.user_id ?? me.id,
      ...me,
    };
    console.log("[POST-DETAIL] me:", state.me);
    renderApp();
  } catch (e) {
    console.log("[POST-DETAIL] not logged in (loadMeIfLoggedIn)");
    state.me = null;
    renderApp();
  }
}

async function loadPost() {
  try {
    const viewerId = state.me?.id;
    const params = viewerId ? { viewerId } : undefined;
    const post = await PostsAPI.getDetail(state.postId, params);
    state.post = post;
    renderApp();
  } catch (e) {
    console.error(e);
    alert(e.message || "게시글을 불러오는 중 오류가 발생했습니다.");
  }
}

async function loadComments() {
  try {
    const list = await CommentsAPI.getList(state.postId);
    state.comments = Array.isArray(list) ? list : [];
    renderApp();
  } catch (e) {
    console.error(e);
    alert(e.message || "댓글을 불러오는 중 오류가 발생했습니다.");
  }
}

async function handleEditPost() {
  if (!state.postId) return;
  window.location.href = `./post-edit.html?postId=${state.postId}`;
}

async function handleDeletePost() {
  if (!state.postId) return;
  if (!state.me) {
    alert("로그인 후 이용해주세요.");
    window.location.href = "./login.html";
    return;
  }

  const ok = confirm("정말 이 게시글을 삭제하시겠습니까?");
  if (!ok) return;

  try {
    await PostsAPI.remove(state.postId);
    alert("게시글이 삭제되었습니다.");
    window.location.href = "./board.html";
  } catch (e) {
    console.error(e);
    alert(e.message || "게시글 삭제에 실패했습니다.");
  }
}

async function handleToggleLike() {
  if (!state.postId) return;
  if (!state.me) {
    alert("좋아요는 로그인 후 이용 가능합니다.");
    window.location.href = "./login.html";
    return;
  }
  if (!state.post || state.isLiking) return;

  state.isLiking = true;
  renderApp();

  const post = state.post;
  const liked = !!post.liked;

  try {
    if (liked) {
      await PostsAPI.unlike(state.postId);
      post.liked = false;
      post.likes = Math.max(0, (post.likes ?? 1) - 1);
    } else {
      await PostsAPI.like(state.postId);
      post.liked = true;
      post.likes = (post.likes ?? 0) + 1;
    }
    state.post = post;
    renderApp();
  } catch (e) {
    console.error(e);
    alert(e.message || "좋아요 처리 중 오류가 발생했습니다.");
  } finally {
    state.isLiking = false;
    renderApp();
  }
}

async function handleSubmitComment() {
  if (!state.postId) return;
  if (!state.me) {
    alert("로그인 후 댓글 작성이 가능합니다.");
    window.location.href = "./login.html";
    return;
  }
  if (state.isSubmittingComment) return;

  const content = state.commentDraft.trim();
  if (!content) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  state.isSubmittingComment = true;
  renderApp();

  try {
    await CommentsAPI.create(state.postId, { content });
    state.commentDraft = "";
    await loadComments();
  } catch (e) {
    console.error(e);
    alert(e.message || "댓글 등록에 실패했습니다.");
  } finally {
    state.isSubmittingComment = false;
    renderApp();
  }
}

function startEditComment(commentId, originalContent) {
  state.editingCommentId = commentId;
  state.editingCommentDraft = originalContent || "";
  renderApp();
}

function handleCancelEditComment() {
  state.editingCommentId = null;
  state.editingCommentDraft = "";
  renderApp();
}

async function handleSaveEditComment() {
  if (!state.postId) return;
  if (!state.me) {
    alert("로그인 후 이용해주세요.");
    window.location.href = "./login.html";
    return;
  }
  if (!state.editingCommentId) return;

  const newContent = state.editingCommentDraft.trim();
  if (!newContent) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  try {
    await CommentsAPI.update(state.postId, state.editingCommentId, {
      content: newContent,
    });
    state.editingCommentId = null;
    state.editingCommentDraft = "";
    await loadComments();
  } catch (e) {
    console.error(e);
    alert(e.message || "댓글 수정에 실패했습니다.");
  }
}

async function handleDeleteComment(commentId) {
  if (!state.postId) return;
  if (!state.me) {
    alert("로그인 후 이용해주세요.");
    window.location.href = "./login.html";
    return;
  }

  const ok = confirm("이 댓글을 삭제하시겠습니까?");
  if (!ok) return;

  try {
    await CommentsAPI.remove(state.postId, commentId);
    await loadComments();
  } catch (e) {
    console.error(e);
    alert(e.message || "댓글 삭제에 실패했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  state.postId = getPostIdFromURL();

  if (!state.postId) {
    alert("잘못된 접근입니다. 게시글 ID가 없습니다.");
    history.back();
    return;
  }

  rootEl = $(".page.post");
  if (!rootEl) {
    console.error("[POST-DETAIL] .page.post 요소를 찾지 못했습니다.");
    return;
  }

  renderApp();

  await loadMyAvatar("[POST-DETAIL]");
  setupAvatarMenu();

  await loadMeIfLoggedIn();

  await Promise.all([loadPost(), loadComments()]);
});

import { httpClient, publicHttpClient } from "@/lib/api/httpClient.js";

const POSTS_BASE_PATH = "/api/v1/posts";

function unwrapApiData(response) {
  if (response && typeof response === "object" && "success" in response && "data" in response) {
    return response.data;
  }
  return response;
}

function toPostSummary(raw = {}) {
  const hasCommentsCount =
    typeof raw.comment_count === "number" || typeof raw.commentsCount === "number";

  return {
    id: raw.post_id ?? raw.id ?? null,
    title: raw.title ?? "",
    authorId: raw.author_id ?? raw.authorId ?? null,
    authorNickname: raw.author_name ?? raw.authorNickname ?? "익명",
    likes: raw.likes ?? 0,
    views: raw.views ?? 0,
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    authorProfileImage: raw.author_profile_image ?? raw.authorProfileImage ?? "",
    commentsCount: hasCommentsCount ? (raw.comment_count ?? raw.commentsCount) : null,
  };
}

export async function getPosts({ page = 0, limit = 10, sort = "DATE", signal } = {}) {
  const response = await publicHttpClient.get(POSTS_BASE_PATH, {
    query: { page, limit, sort },
    signal,
  });
  const payload = unwrapApiData(response);

  const items = Array.isArray(payload?.items) ? payload.items.map(toPostSummary) : [];

  return {
    page: payload?.page ?? page,
    size: payload?.size ?? limit,
    totalElements: payload?.totalElements ?? 0,
    hasNext: Boolean(payload?.hasNext),
    items,
  };
}

function toPostComment(raw = {}) {
  return {
    id: raw.comment_id ?? raw.commentId ?? raw.id ?? null,
    authorId: raw.author_id ?? raw.authorId ?? null,
    authorName: raw.author_name ?? raw.authorName ?? "익명",
    content: raw.content ?? "",
    createdAt: raw.created_at ?? raw.createdAt ?? "",
  };
}

function toPostDetail(raw = {}) {
  const comments = Array.isArray(raw.comments) ? raw.comments.map(toPostComment) : [];

  return {
    id: raw.post_id ?? raw.postId ?? raw.id ?? null,
    title: raw.title ?? "",
    authorId: raw.author_id ?? raw.authorId ?? null,
    authorName: raw.author_name ?? raw.authorName ?? "익명",
    authorProfileImage: raw.author_profile_image ?? raw.authorProfileImage ?? "",
    content: raw.content ?? "",
    imageUrl: raw.image_url ?? raw.imageUrl ?? "",
    likes: raw.likes ?? 0,
    views: raw.views ?? 0,
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    updatedAt: raw.updated_at ?? raw.updatedAt ?? "",
    liked: raw.liked ?? raw.likedByViewer ?? false,
    comments,
  };
}

export async function getPostDetail(postId, { signal } = {}) {
  const response = await publicHttpClient.get(`${POSTS_BASE_PATH}/${postId}`, {
    signal,
  });
  return toPostDetail(unwrapApiData(response));
}

export function likePost(postId) {
  return httpClient.post(`${POSTS_BASE_PATH}/${postId}/like`, {});
}

export function unlikePost(postId) {
  return httpClient.delete(`${POSTS_BASE_PATH}/${postId}/like`);
}

export async function createPost(payload = {}) {
  const response = await httpClient.post(POSTS_BASE_PATH, {
    title: payload.title,
    content: payload.content,
    image_url: payload.imageUrl ?? null,
  });
  return unwrapApiData(response);
}

export async function updatePost(postId, payload = {}) {
  const response = await httpClient.patch(`${POSTS_BASE_PATH}/${postId}`, {
    title: payload.title,
    content: payload.content,
    image_url: payload.imageUrl ?? null,
  });
  return unwrapApiData(response);
}

export const postsApi = {
  getPosts,
  getPostDetail,
  likePost,
  unlikePost,
  createPost,
  updatePost,
};

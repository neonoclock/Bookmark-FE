import { publicHttpClient } from "@/lib/api/httpClient.js";

const POSTS_BASE_PATH = "/api/v1/posts";

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

  // Defensive: handle both already-unwrapped payload and raw ApiResponse wrapper.
  const payload =
    response && typeof response === "object" && "success" in response && "data" in response
      ? response.data
      : response;

  const items = Array.isArray(payload?.items) ? payload.items.map(toPostSummary) : [];

  return {
    page: payload?.page ?? page,
    size: payload?.size ?? limit,
    totalElements: payload?.totalElements ?? 0,
    hasNext: Boolean(payload?.hasNext),
    items,
  };
}

export const postsApi = {
  getPosts,
};

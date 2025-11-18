import { GET, POST, PATCH, DELETE, toQueryString } from "../core/http.js";

export const PostsAPI = {
  getList({ page = 0, limit = 10, sort = "DATE" } = {}) {
    const qs = toQueryString({ page, limit, sort });
    return GET(`/api/v1/posts?${qs}`);
  },

  getDetail(postId, { viewerId } = {}) {
    const qs = toQueryString({ viewerId });
    const suffix = qs ? `?${qs}` : "";
    return GET(`/api/v1/posts/${postId}${suffix}`);
  },

  create({ userId, title, content, imageUrl }) {
    const qs = toQueryString({ userId });
    return POST(`/api/v1/posts?${qs}`, {
      title,
      content,
      image_url: imageUrl ?? null,
    });
  },

  update(postId, { userId, title, content, imageUrl }) {
    const qs = toQueryString({ userId });
    return PATCH(`/api/v1/posts/${postId}?${qs}`, {
      title,
      content,
      image_url: imageUrl ?? null,
    });
  },

  remove(postId, { userId }) {
    const qs = toQueryString({ userId });
    return DELETE(`/api/v1/posts/${postId}?${qs}`);
  },

  like(postId, { userId }) {
    const qs = toQueryString({ userId });

    return POST(`/api/v1/posts/${postId}/like?${qs}`, {});
  },

  unlike(postId, { userId }) {
    const qs = toQueryString({ userId });
    return DELETE(`/api/v1/posts/${postId}/like?${qs}`);
  },

  search({
    keyword,
    authorId,
    minLikes,
    minViews,
    page = 0,
    limit = 10,
    sort = "DATE",
  } = {}) {
    const qs = toQueryString({
      keyword,
      authorId,
      minLikes,
      minViews,
      page,
      limit,
      sort,
    });
    return GET(`/api/querydsl/posts?${qs}`);
  },

  resetViews({ threshold = 1000 } = {}) {
    const qs = toQueryString({ threshold });
    return POST(`/api/querydsl/posts/views/reset?${qs}`, {});
  },
};

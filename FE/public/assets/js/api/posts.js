import { GET, POST, PATCH, DELETE, toQueryString } from "../core/http.js";

export const PostsAPI = {
  getList({ page = 0, limit = 10, sort = "DATE" } = {}) {
    const qs = toQueryString({ page, limit, sort });
    return GET(`/api/v1/posts?${qs}`);
  },

  getDetail(postId) {
    return GET(`/api/v1/posts/${postId}`);
  },

  create({ title, content, imageUrl }) {
    return POST(`/api/v1/posts`, {
      title,
      content,
      image_url: imageUrl ?? null,
    });
  },

  update(postId, { title, content, imageUrl }) {
    return PATCH(`/api/v1/posts/${postId}`, {
      title,
      content,
      image_url: imageUrl ?? null,
    });
  },

  remove(postId) {
    return DELETE(`/api/v1/posts/${postId}`);
  },

  like(postId) {
    return POST(`/api/v1/posts/${postId}/like`, {});
  },

  unlike(postId) {
    return DELETE(`/api/v1/posts/${postId}/like`);
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

import { GET, POST, PATCH, DELETE } from "../core/http.js";

export const PostsAPI = {
  getAll(page = 0, limit = 20, sort = "LATEST") {
    return GET(`/api/posts?page=${page}&limit=${limit}&sort=${sort}`);
  },

  create(data) {
    return POST("/api/posts", data);
  },

  getOne(id) {
    return GET(`/api/posts/${id}`);
  },

  update(id, data) {
    return PATCH(`/api/posts/${id}`, data);
  },

  remove(id) {
    return DELETE(`/api/posts/${id}`);
  },

  like(id) {
    return POST(`/api/posts/${id}/likes`);
  },

  unlike(id) {
    return DELETE(`/api/posts/${id}/likes`);
  },

  createComment(postId, data) {
    return POST(`/api/posts/${postId}/comments`, data);
  },

  updateComment(commentId, data) {
    return PATCH(`/api/comments/${commentId}`, data);
  },

  deleteComment(commentId) {
    return DELETE(`/api/comments/${commentId}`);
  },
};

import { GET, POST, PATCH, DELETE } from "../core/http.js";

export const CommentsAPI = {
  getList(postId) {
    return GET(`/api/v1/posts/${postId}/comments`);
  },

  create(postId, { content }) {
    return POST(`/api/v1/posts/${postId}/comments`, {
      content,
    });
  },

  update(postId, commentId, { content }) {
    return PATCH(`/api/v1/posts/${postId}/comments/${commentId}`, {
      content,
    });
  },

  remove(postId, commentId) {
    return DELETE(`/api/v1/posts/${postId}/comments/${commentId}`);
  },
};

import { GET, POST, PATCH, DELETE, toQueryString } from "../core/http.js";

export const CommentsAPI = {
  getList(postId) {
    return GET(`/api/v1/posts/${postId}/comments`);
  },

  create(postId, { userId, content }) {
    const qs = toQueryString({ userId });

    return POST(`/api/v1/posts/${postId}/comments?${qs}`, {
      content,
    });
  },

  update(postId, commentId, { userId, content }) {
    const qs = toQueryString({ userId });

    return PATCH(`/api/v1/posts/${postId}/comments/${commentId}?${qs}`, {
      content,
    });
  },

  remove(postId, commentId, { userId }) {
    const qs = toQueryString({ userId });

    return DELETE(`/api/v1/posts/${postId}/comments/${commentId}?${qs}`);
  },
};

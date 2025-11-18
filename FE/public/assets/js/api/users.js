import { GET, PATCH, DELETE } from "../core/http.js";

export const UsersAPI = {
  getUser(userId) {
    return GET(`/api/v1/users/${userId}`);
  },

  updateProfile(userId, { nickname, profileImage }) {
    return PATCH(`/api/v1/users/${userId}/profile`, {
      nickname,
      profileImage: profileImage ?? null,
    });
  },

  deleteUser(userId) {
    return DELETE(`/api/v1/users/${userId}`);
  },
};

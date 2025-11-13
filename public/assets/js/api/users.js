import { GET, PATCH, POST } from "../core/http.js";

export const UsersAPI = {
  getMe() {
    return GET("/api/v1/users/me");
  },

  updateProfile(data) {
    return PATCH("/api/v1/users/me", data);
  },

  uploadAvatar(file) {
    const form = new FormData();
    form.append("file", file);
    return POST("/api/v1/users/me/avatar", form, true);
  },
};

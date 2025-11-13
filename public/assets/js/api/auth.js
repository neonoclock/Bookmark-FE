import { POST, PATCH } from "../core/http.js";

export const AuthAPI = {
  signup(data) {
    return POST("/api/v1/users", data);
  },

  login(email, password) {
    return POST("/api/v1/users/login", { email, password });
  },

  updatePassword(oldPassword, newPassword) {
    return PATCH("/api/v1/users/password", {
      oldPassword,
      newPassword,
    });
  },
};

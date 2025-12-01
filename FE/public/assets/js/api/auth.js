import { GET, POST, PATCH, DELETE } from "../core/http.js";

export const AuthAPI = {
  signup({ email, password, passwordCheck, nickname, profileImage }) {
    return POST("/api/v1/users", {
      email,
      password,
      password_check: passwordCheck,
      nickname,
      profile_image: profileImage ?? null,
      userRole: null,
    });
  },

  login(email, password, remember = false) {
    return POST("/api/v1/users/login", {
      email,
      password,
      remember_me: remember,
    });
  },
};

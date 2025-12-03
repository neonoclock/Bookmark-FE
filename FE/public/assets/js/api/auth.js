import { GET, POST, PATCH, DELETE } from "../core/http.js";
import { saveAuth, loadRefreshToken } from "../core/storage.js";

export const AuthAPI = {
  signup({ email, password, passwordCheck, nickname, profileImage }) {
    return POST("/api/v1/users", {
      email,
      password,
      password_check: passwordCheck,
      nickname,
      profileImage: profileImage ?? null,
      userRole: null,
    });
  },

  async login(email, password, remember = false) {
    const data = await POST("/api/v1/users/login", {
      email,
      password,
      remember_me: remember,
    });

    saveAuth({
      id: data.user_id ?? data.id ?? null,
      email,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    });

    return data;
  },

  async refresh() {
    const refreshToken = loadRefreshToken();
    if (!refreshToken) {
      throw new Error("리프레시 토큰이 없습니다.");
    }

    const data = await POST("/api/v1/users/refresh", {
      refresh_token: refreshToken,
    });

    saveAuth({
      id: data.user_id ?? data.id ?? null,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    });

    return data;
  },

  getMe() {
    return GET("/api/v1/users/me");
  },

  updateProfile({ nickname, profileImage }) {
    return PATCH("/api/v1/users/profile", {
      nickname,
      profileImage: profileImage ?? null,
    });
  },

  updatePassword({ oldPassword, newPassword, newPasswordCheck }) {
    return PATCH("/api/v1/users/password", {
      oldPassword,
      newPassword,
      newPasswordCheck,
    });
  },

  deleteUser() {
    return DELETE("/api/v1/users");
  },
};

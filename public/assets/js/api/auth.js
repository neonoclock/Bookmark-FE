// public/assets/js/api/auth.js

import { GET, POST, PATCH, DELETE } from "../core/http.js";

export const AuthAPI = {
  /**
   * 회원가입
   * POST /api/v1/users
   * Body: SignupRequest
   */
  signup({ email, password, passwordCheck, nickname, profileImage }) {
    return POST("/api/v1/users", {
      email,
      password,
      password_check: passwordCheck, // ✅ DTO 필드명과 맞춤
      nickname,
      profile_image: profileImage ?? null, // ✅ DTO 필드명과 맞춤
      userRole: null, // 서버에서 기본값 USER라 실제로는 크게 의미 없지만 일단 null 전달
    });
  },

  /**
   * 로그인
   * POST /api/v1/users/login
   * Body: LoginRequest
   *  - email
   *  - password
   *  - remember_me (옵션)
   */
  login(email, password, remember = false) {
    return POST("/api/v1/users/login", {
      email,
      password,
      remember_me: remember,
    });
  },

  /**
   * 단일 유저 조회
   * GET /api/v1/users/{userId}
   */
  getUser(userId) {
    return GET(`/api/v1/users/${userId}`);
  },

  /**
   * 프로필 수정
   * PATCH /api/v1/users/{userId}/profile
   * Body: ProfileUpdateRequest
   *  - nickname
   *  - profileImage
   */
  updateProfile(userId, { nickname, profileImage }) {
    return PATCH(`/api/v1/users/${userId}/profile`, {
      nickname,
      profileImage: profileImage ?? null,
    });
  },

  /**
   * 비밀번호 수정
   * PATCH /api/v1/users/{userId}/password
   * Body: PasswordUpdateRequest
   *  - oldPassword
   *  - newPassword
   *  - newPasswordCheck
   */
  updatePassword(userId, { oldPassword, newPassword, newPasswordCheck }) {
    return PATCH(`/api/v1/users/${userId}/password`, {
      oldPassword,
      newPassword,
      newPasswordCheck,
    });
  },

  /**
   * 회원 삭제
   * DELETE /api/v1/users/{userId}
   */
  deleteUser(userId) {
    return DELETE(`/api/v1/users/${userId}`);
  },
};

import { GET, PATCH, DELETE } from "../core/http.js";

export const UsersAPI = {
  async getMe() {
    const raw = await GET(`/api/v1/users/me`);

    console.log("[UsersAPI.getMe] raw:", raw);

    const user = {
      userId: raw.user_id ?? raw.userId ?? raw.id ?? null,
      email: raw.email,
      nickname: raw.nickname,
      profileImage: raw.profile_image ?? raw.profileImage ?? null,
      role: raw.role ?? raw.user_role ?? null,
      createdAt: raw.created_at ?? raw.createdAt ?? null,
      updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
    };

    return user;
  },

  updateProfile({ nickname, profileImage }) {
    return PATCH(`/api/v1/users/profile`, {
      nickname,
      profileImage: profileImage ?? null,
    });
  },

  deleteUser() {
    return DELETE(`/api/v1/users`);
  },
};

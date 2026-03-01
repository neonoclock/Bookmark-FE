import { httpClient, publicHttpClient } from "@/lib/api/httpClient.js";
import {
  buildRefreshTokenRequestBody,
  clearAuth,
  saveAuth,
  saveAuthResponse,
} from "@/lib/storage/authStorage.js";

const USERS_BASE_PATH = "/api/v1/users";

function toSignupRequest(payload = {}) {
  return {
    email: payload.email,
    password: payload.password,
    password_check: payload.password_check ?? payload.passwordCheck,
    nickname: payload.nickname,
    profileImage: payload.profileImage ?? null,
    userRole: payload.userRole ?? null,
  };
}

function toLoginRequest(payload = {}) {
  return {
    email: payload.email,
    password: payload.password,
    remember_me: payload.remember_me ?? payload.rememberMe ?? false,
  };
}

function toProfileUpdateRequest(payload = {}) {
  return {
    nickname: payload.nickname,
    profileImage: payload.profileImage ?? null,
  };
}

function toPasswordUpdateRequest(payload = {}) {
  return {
    oldPassword: payload.oldPassword,
    newPassword: payload.newPassword,
    newPasswordCheck: payload.newPasswordCheck,
  };
}

export async function signup(payload) {
  return publicHttpClient.post(USERS_BASE_PATH, toSignupRequest(payload));
}

export async function login(payload) {
  const requestBody = toLoginRequest(payload);
  const data = await publicHttpClient.post(`${USERS_BASE_PATH}/login`, requestBody);

  saveAuthResponse(data);
  if (requestBody.email) saveAuth({ email: requestBody.email });

  return data;
}

export async function refresh(refreshToken) {
  const data = await publicHttpClient.post(
    `${USERS_BASE_PATH}/refresh`,
    buildRefreshTokenRequestBody(refreshToken),
  );

  saveAuthResponse(data);
  return data;
}

export function getMe() {
  return httpClient.get(`${USERS_BASE_PATH}/me`);
}

export function updateProfile(payload) {
  return httpClient.patch(`${USERS_BASE_PATH}/profile`, toProfileUpdateRequest(payload));
}

export function updatePassword(payload) {
  return httpClient.patch(`${USERS_BASE_PATH}/password`, toPasswordUpdateRequest(payload));
}

export function deleteUser() {
  return httpClient.delete(USERS_BASE_PATH);
}

export function logout() {
  clearAuth();
}

export const authApi = {
  signup,
  login,
  refresh,
  getMe,
  updateProfile,
  updatePassword,
  deleteUser,
  logout,
};

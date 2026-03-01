import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api/authApi.js";
import { useAuth } from "@/hooks/useAuth.js";
import "./ProfileEditPage.css";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const PROFILE_PLACEHOLDER_IMAGE = "https://placehold.co/200x200/aaaaaa/ffffff?text=%20";

function resolveProfileImage(user) {
  return user?.profile_image ?? user?.profileImage ?? null;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

function mapServerError(error) {
  const code = error?.payload?.code ?? error?.code;
  const detail = error?.payload?.detail;
  const message = error?.message;

  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const mapped = {};
    if (typeof detail.nickname === "string") {
      mapped.nickname = detail.nickname;
    }
    if (typeof detail.profileImage === "string") {
      mapped.avatar = detail.profileImage;
    }
    if (typeof detail.profile_image === "string") {
      mapped.avatar = detail.profile_image;
    }
    if (Object.keys(mapped).length > 0) return mapped;
  }

  switch (code) {
    case "UNAUTHORIZED":
    case "FORBIDDEN":
      return { form: "로그인이 필요합니다. 다시 로그인해주세요." };
    case "invalid_request":
      return { form: "입력값을 다시 확인해주세요." };
    case "invalid_json":
      return { form: "요청 형식이 올바르지 않습니다." };
    case "internal_error":
      return { form: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
    default:
      return { form: message || "프로필 수정에 실패했습니다." };
  }
}

function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, isInitializing, syncMe, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const isBusy = isSubmitting || isDeleting;

  useEffect(() => {
    if (isInitializing) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setEmail(user.email ?? "");
    setNickname(user.nickname ?? "");
    setProfileImage(resolveProfileImage(user));
    setAvatarFileName("");
  }, [isInitializing, user, navigate]);

  const validate = () => {
    const nextErrors = {};
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      nextErrors.nickname = "닉네임을 입력하세요.";
    } else if (trimmedNickname.length > 30) {
      nextErrors.nickname = "닉네임은 최대 30자까지 가능합니다.";
    }

    return nextErrors;
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFileName("");
      setErrors((prev) => ({ ...prev, avatar: undefined }));
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarFileName("");
      setErrors((prev) => ({
        ...prev,
        avatar: "이미지 크기는 2MB 이하여야 합니다.",
      }));
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProfileImage(dataUrl);
      setAvatarFileName(file.name);
      setErrors((prev) => ({ ...prev, avatar: undefined }));
    } catch {
      setAvatarFileName("");
      setErrors((prev) => ({
        ...prev,
        avatar: "이미지를 읽는 중 오류가 발생했습니다.",
      }));
    }
  };

  const submitProfile = async ({ moveToBoard = false } = {}) => {
    const validationErrors = validate();
    setSuccessMessage("");
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return false;

    setIsSubmitting(true);
    try {
      await authApi.updateProfile({
        nickname: nickname.trim(),
        profileImage: profileImage ?? null,
      });
      const updatedUser = await syncMe();
      if (!updatedUser) {
        setErrors({ form: "프로필 동기화에 실패했습니다. 다시 시도해주세요." });
        setSuccessMessage("");
        return false;
      }

      setEmail(updatedUser.email ?? "");
      setNickname(updatedUser.nickname ?? "");
      setProfileImage(resolveProfileImage(updatedUser));
      setAvatarFileName("");
      setSuccessMessage("프로필이 수정되었습니다.");

      if (moveToBoard) {
        navigate("/board");
      }
      return true;
    } catch (error) {
      setErrors(mapServerError(error));
      setSuccessMessage("");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    const ok = window.confirm("정말 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!ok) return;

    setErrors({});
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      await authApi.deleteUser();
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setErrors(mapServerError(error));
    } finally {
      setIsDeleting(false);
    }
  };

  // Legacy 동작과 동일하게 완료 버튼은 "저장 후 게시글 목록 이동"으로 유지합니다.
  const handleComplete = () => {
    void submitProfile({ moveToBoard: true });
  };

  const avatarHelperText = errors.avatar || (avatarFileName ? `선택된 파일: ${avatarFileName}` : " ");

  return (
    <section className="profile-page">
      <article className="profile-card">
        <h1 className="profile-title">회원정보수정</h1>

        <section className="profile-avatar-section">
          <p className="profile-field-label">프로필 사진</p>
          <label className="profile-avatar-uploader" htmlFor="profile-avatar-input">
            <input
              id="profile-avatar-input"
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
              disabled={isBusy}
            />
            <img
              src={profileImage || PROFILE_PLACEHOLDER_IMAGE}
              alt="프로필 미리보기"
            />
            <span className="profile-avatar-badge">변경</span>
          </label>
          <p className={`profile-helper ${errors.avatar ? "profile-helper--error" : ""}`}>
            {avatarHelperText}
          </p>
          <button
            className="profile-avatar-remove"
            type="button"
            disabled={isBusy || !profileImage}
            onClick={() => {
              setProfileImage("");
              setAvatarFileName("");
              setErrors((prev) => ({ ...prev, avatar: undefined }));
              setSuccessMessage("");
            }}
          >
            이미지 제거
          </button>
        </section>

        <form className="profile-form" autoComplete="off" onSubmit={(event) => event.preventDefault()}>
          <div className="profile-form-field">
            <label className="profile-input-label">이메일</label>
            <p className="profile-readonly">{email || " "}</p>
          </div>

          <div className="profile-form-field">
            <label className="profile-input-label" htmlFor="profile-nickname">
              닉네임
            </label>
            <input
              id="profile-nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              disabled={isBusy}
            />
            <p className={`profile-helper ${errors.nickname ? "profile-helper--error" : ""}`}>
              {errors.nickname || " "}
            </p>
          </div>

          {errors.form ? <p className="profile-form-error">{errors.form}</p> : null}
          {successMessage ? <p className="profile-form-success">{successMessage}</p> : null}

          <button
            className="profile-btn profile-btn--block"
            type="button"
            disabled={isBusy}
            onClick={() => {
              void submitProfile();
            }}
          >
            {isSubmitting ? "수정 중..." : "수정하기"}
          </button>

          <button className="profile-link-danger" type="button" disabled={isBusy} onClick={handleDeleteUser}>
            {isDeleting ? "탈퇴 처리 중..." : "회원 탈퇴"}
          </button>

          <div className="profile-complete-wrap">
            <button
              className="profile-btn profile-btn--pill"
              type="button"
              disabled={isBusy}
              onClick={handleComplete}
            >
              {isSubmitting ? "저장 중..." : "완료"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

export default ProfileEditPage;

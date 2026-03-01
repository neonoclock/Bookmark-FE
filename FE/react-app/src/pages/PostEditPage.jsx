import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.js";
import { postsApi } from "@/lib/api/postsApi.js";
import PageStateCard from "@/components/PageStateCard.jsx";
import "./PostEditPage.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("이미지를 읽는 중 오류가 발생했습니다."));
    reader.readAsDataURL(file);
  });
}

function isUnauthorizedError(error) {
  const code = error?.payload?.code ?? error?.code;
  const status = error?.status;
  return (
    status === 401 ||
    status === 403 ||
    code === "UNAUTHORIZED" ||
    code === "FORBIDDEN" ||
    code === "unauthorized"
  );
}

function mapEditError(error) {
  const code = error?.payload?.code ?? error?.code;

  switch (code) {
    case "not_found":
      return "게시글을 찾을 수 없습니다.";
    case "invalid_request":
      return "입력값을 다시 확인해주세요.";
    case "FORBIDDEN":
    case "UNAUTHORIZED":
    case "unauthorized":
      return "작성자만 수정할 수 있습니다.";
    case "internal_error":
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return error?.message || "게시글 수정 중 오류가 발생했습니다.";
  }
}

function PostEditPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { user, isInitializing } = useAuth();

  const numericPostId = Number(postId);
  const isValidPostId = Number.isInteger(numericPostId) && numericPostId > 0;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [formError, setFormError] = useState("");
  const [fileName, setFileName] = useState("선택된 파일 없음");
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPostForEdit = useCallback(
    async (signal, currentUserId) => {
      if (!isValidPostId) {
        setIsLoading(false);
        setFormError("잘못된 접근입니다. 게시글 번호를 확인해주세요.");
        return;
      }

      setIsLoading(true);
      setFormError("");

      try {
        const detail = await postsApi.getPostDetail(numericPostId, { signal });
        if (signal?.aborted) return;

        if (currentUserId == null || Number(currentUserId) !== Number(detail.authorId)) {
          window.alert("작성자만 수정할 수 있습니다.");
          navigate(`/post/${numericPostId}`, { replace: true });
          return;
        }

        setTitle(detail.title ?? "");
        setContent(detail.content ?? "");
        setImageDataUrl(detail.imageUrl ?? null);
        setFileName(detail.imageUrl ? "기존 이미지가 등록되어 있습니다." : "선택된 파일 없음");
      } catch (error) {
        if (signal?.aborted || error?.name === "AbortError") return;
        setFormError(mapEditError(error));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [isValidPostId, navigate, numericPostId],
  );

  useEffect(() => {
    if (isInitializing) return;

    if (!user) {
      window.alert("로그인 후 이용해주세요.");
      navigate("/login", { replace: true });
      return;
    }

    const controller = new AbortController();
    const userId = user.id ?? user.user_id;
    void loadPostForEdit(controller.signal, userId);
    return () => controller.abort();
  }, [isInitializing, loadPostForEdit, navigate, user]);

  const validate = () => {
    let ok = true;

    if (!title.trim()) {
      setTitleError("제목을 입력해주세요.");
      ok = false;
    } else {
      setTitleError("");
    }

    if (!content.trim()) {
      setContentError("내용을 입력해주세요.");
      ok = false;
    } else {
      setContentError("");
    }

    return ok;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageDataUrl(null);
      setFileName("선택된 파일 없음");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageDataUrl(null);
      setFileName("이미지는 2MB 이하여야 합니다.");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageDataUrl(dataUrl);
      setFileName(file.name || "선택된 이미지");
    } catch (error) {
      setImageDataUrl(null);
      setFileName(error.message || "이미지를 읽는 중 오류가 발생했습니다.");
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidPostId || isSubmitting) return;

    const ok = validate();
    if (!ok) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      await postsApi.updatePost(numericPostId, {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageDataUrl,
      });
      window.alert("게시글이 수정되었습니다.");
      navigate(`/post/${numericPostId}`);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        window.alert("작성자만 수정할 수 있습니다.");
        navigate(`/post/${numericPostId}`, { replace: true });
        return;
      }
      setFormError(mapEditError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="post-edit-page">
        <PageStateCard message="게시글 정보를 불러오는 중입니다..." />
      </section>
    );
  }

  return (
    <section className="post-edit-page">
      <div className="post-edit-topbar">
        <button
          className="post-edit-back-btn"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ‹ 뒤로가기
        </button>
      </div>

      <h1 className="post-edit-title">게시글 수정</h1>

      <form className="post-edit-form" autoComplete="off" onSubmit={handleSubmit}>
        <div className="post-edit-inner">
          <div className="post-edit-field">
            <label className="post-edit-label" htmlFor="post-edit-title">
              제목
            </label>
            <input
              id="post-edit-title"
              type="text"
              placeholder="제목을 입력해주세요."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
            />
            <p className={`post-edit-helper ${titleError ? "error" : ""}`}>{titleError}</p>
          </div>

          <div className="post-edit-field">
            <label className="post-edit-label" htmlFor="post-edit-content">
              내용
            </label>
            <textarea
              id="post-edit-content"
              placeholder="내용을 입력해주세요."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={isSubmitting}
            />
            <p className={`post-edit-helper ${contentError ? "error" : ""}`}>{contentError}</p>
          </div>

          <div className="post-edit-upload">
            <span className="post-edit-label post-edit-label--inline">이미지</span>
            <label className="post-edit-file">
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
              <span className="post-edit-file-btn">파일 선택</span>
              <span className="post-edit-file-name">{fileName}</span>
            </label>
          </div>

          {formError ? <p className="post-edit-form-error">{formError}</p> : null}

          <hr className="post-edit-divider" />

          <div className="post-edit-actions">
            <button className="post-edit-submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default PostEditPage;

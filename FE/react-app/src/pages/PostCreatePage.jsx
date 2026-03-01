import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.js";
import { postsApi } from "@/lib/api/postsApi.js";
import "./PostCreatePage.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("이미지를 읽는 중 오류가 발생했습니다."));
    reader.readAsDataURL(file);
  });
}

function mapCreateError(error) {
  const code = error?.payload?.code ?? error?.code;

  switch (code) {
    case "UNAUTHORIZED":
    case "FORBIDDEN":
      return "로그인 후 이용 가능한 기능입니다.";
    case "not_found":
      return "요청 경로를 확인해주세요.";
    case "invalid_request":
      return "입력값을 다시 확인해주세요.";
    case "internal_error":
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return error?.message || "게시글 작성 중 오류가 발생했습니다.";
  }
}

function PostCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("파일을 선택해주세요.");
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [helperMessage, setHelperMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!title.trim()) {
      setHelperMessage("제목을 입력해주세요.");
      setIsError(true);
      return false;
    }
    if (title.trim().length > 26) {
      setHelperMessage("제목은 최대 26자까지 가능합니다.");
      setIsError(true);
      return false;
    }
    if (!content.trim()) {
      setHelperMessage("내용을 입력해주세요.");
      setIsError(true);
      return false;
    }
    setHelperMessage("");
    setIsError(false);
    return true;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("파일을 선택해주세요.");
      setImageDataUrl(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFileName("이미지는 2MB 이하여야 합니다.");
      setImageDataUrl(null);
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const sizeKb = (file.size / 1024).toFixed(1);
      setImageDataUrl(dataUrl);
      setFileName(`${file.name} (${sizeKb} KB)`);
    } catch (error) {
      setImageDataUrl(null);
      setFileName(error.message || "이미지를 읽는 중 오류가 발생했습니다.");
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validate();
    if (!isValid) return;

    if (!user) {
      window.alert("로그인 후 이용 가능한 페이지입니다.");
      navigate("/login");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setHelperMessage("");
    setIsError(false);

    try {
      await postsApi.createPost({
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageDataUrl,
      });
      window.alert("게시글이 작성되었습니다.");
      navigate("/board");
    } catch (error) {
      setHelperMessage(mapCreateError(error));
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="post-create-page">
      <div className="post-create-topbar">
        <button
          className="post-create-back-btn"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ‹ 뒤로가기
        </button>
      </div>

      <h1 className="post-create-title">게시글 작성</h1>

      <form className="post-create-form" autoComplete="off" onSubmit={handleSubmit}>
        <div className="post-create-inner">
          <div className="post-create-field">
            <label className="post-create-label" htmlFor="post-create-title">
              제목
            </label>
            <input
              id="post-create-title"
              type="text"
              placeholder="제목을 입력해주세요. (최대 26글자)"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="post-create-field">
            <label className="post-create-label" htmlFor="post-create-content">
              내용
            </label>
            <textarea
              id="post-create-content"
              placeholder="내용을 입력해주세요."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="post-create-upload">
            <span className="post-create-label post-create-label--inline">이미지</span>
            <label className="post-create-file">
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
              <span className="post-create-file-btn">파일 선택</span>
              <span className="post-create-file-hint">{fileName}</span>
            </label>
          </div>

          <p className={`post-create-helper ${helperMessage ? "visible" : ""} ${isError ? "error" : ""}`}>
            <span className="post-create-star">*</span>
            {helperMessage}
          </p>

          <div className="post-create-actions">
            <button className="post-create-submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "작성 중..." : "완료"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default PostCreatePage;

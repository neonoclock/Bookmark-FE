import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostCreatePage.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("파일을 선택해주세요.");
  const [helperMessage, setHelperMessage] = useState("");
  const [isError, setIsError] = useState(false);

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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("파일을 선택해주세요.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFileName("이미지는 2MB 이하여야 합니다.");
      event.target.value = "";
      return;
    }

    const sizeKb = (file.size / 1024).toFixed(1);
    setFileName(`${file.name} (${sizeKb} KB)`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    validate();
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
            />
          </div>

          <div className="post-create-upload">
            <span className="post-create-label post-create-label--inline">이미지</span>
            <label className="post-create-file">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <span className="post-create-file-btn">파일 선택</span>
              <span className="post-create-file-hint">{fileName}</span>
            </label>
          </div>

          <p className={`post-create-helper ${helperMessage ? "visible" : ""} ${isError ? "error" : ""}`}>
            <span className="post-create-star">*</span>
            {helperMessage}
          </p>

          <div className="post-create-actions">
            <button className="post-create-submit-btn" type="submit">
              완료
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default PostCreatePage;

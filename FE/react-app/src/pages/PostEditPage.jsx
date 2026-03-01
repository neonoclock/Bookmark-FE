import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostEditPage.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const MOCK_POST = {
  title: "한 문장을 오래 붙잡고 읽는 밤",
  content:
    "오래된 책장을 넘기다 보면, 그 시절의 내가 형광펜으로 밑줄 친 문장을 다시 만나게 됩니다.\n" +
    "그때는 몰랐던 의미가, 지금의 마음에는 또 다른 방식으로 들어옵니다.",
  hasImage: true,
};

function PostEditPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [fileName, setFileName] = useState("선택된 파일 없음");

  useEffect(() => {
    setTitle(MOCK_POST.title);
    setContent(MOCK_POST.content);
    setFileName(MOCK_POST.hasImage ? "기존 이미지가 등록되어 있습니다." : "선택된 파일 없음");
  }, []);

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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("선택된 파일 없음");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFileName("이미지는 2MB 이하여야 합니다.");
      event.target.value = "";
      return;
    }

    setFileName(file.name || "선택된 이미지");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const ok = validate();
    if (!ok) return;
  };

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
            />
            <p className={`post-edit-helper ${contentError ? "error" : ""}`}>{contentError}</p>
          </div>

          <div className="post-edit-upload">
            <span className="post-edit-label post-edit-label--inline">이미지</span>
            <label className="post-edit-file">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <span className="post-edit-file-btn">파일 선택</span>
              <span className="post-edit-file-name">{fileName}</span>
            </label>
          </div>

          <hr className="post-edit-divider" />

          <div className="post-edit-actions">
            <button className="post-edit-submit-btn" type="submit">수정 완료</button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default PostEditPage;

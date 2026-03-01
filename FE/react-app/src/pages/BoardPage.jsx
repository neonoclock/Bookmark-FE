import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./BoardPage.css";

const MOCK_POSTS = [
  {
    id: 101,
    title: "헤르만 헤세를 다시 읽고",
    createdAt: "2026-02-27 22:13:00",
    likes: 12,
    views: 86,
    commentsCount: 4,
    authorNickname: "문장수집가",
    authorProfileImage: "",
  },
  {
    id: 102,
    title: "짧은 단상",
    createdAt: "2026-02-26 10:02:00",
    likes: 5,
    views: 34,
    commentsCount: 1,
    authorNickname: "종이책파",
    authorProfileImage: "",
  },
  {
    id: 103,
    title: "밤의 도서관 추천",
    createdAt: "2026-02-25 18:41:00",
    likes: 18,
    views: 117,
    commentsCount: 9,
    authorNickname: "moonreader",
    authorProfileImage: "",
  },
];

function BoardPage() {
  const navigate = useNavigate();
  const posts = useMemo(() => MOCK_POSTS, []);

  return (
    <section className="board-page">
      <section className="board-intro">
        <p className="board-intro__text">
          책을 읽고 마음에 남은 생각들을 가볍게 적어보세요.
          <br />
          다른 독자들의 시선도 함께 둘러볼 수 있어요.
        </p>
        <button
          className="board-intro__write-btn"
          type="button"
          onClick={() => navigate("/post-create")}
        >
          게시글 작성
        </button>
      </section>

      <section className="board-list" aria-label="게시글 목록">
        {posts.length === 0 ? (
          <p className="board-empty">아직 작성된 게시글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="board-post"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/post/${post.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/post/${post.id}`);
                }
              }}
            >
              <header className="board-post__head">
                <h2 className="board-post__title">{post.title || "(제목 없음)"}</h2>
                <time className="board-post__date">{post.createdAt || ""}</time>
              </header>

              <div className="board-post__meta">
                <span>좋아요 {post.likes ?? 0}</span>
                <span>댓글 {post.commentsCount ?? 0}</span>
                <span>조회수 {post.views ?? 0}</span>
              </div>

              <div className="board-post__divider" />

              <footer className="board-post__footer">
                <span
                  className={`board-post__avatar${post.authorProfileImage ? " has-avatar" : ""}`}
                  style={
                    post.authorProfileImage
                      ? { "--avatar-url": `url(${post.authorProfileImage})` }
                      : undefined
                  }
                  aria-hidden="true"
                />
                <span className="board-post__author">{post.authorNickname || "익명"}</span>
              </footer>
            </article>
          ))
        )}
      </section>
    </section>
  );
}

export default BoardPage;

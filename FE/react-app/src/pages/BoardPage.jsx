import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postsApi } from "@/lib/api/postsApi.js";
import PageStateCard from "@/components/PageStateCard.jsx";
import "./BoardPage.css";

function mapPostsListError(error) {
  const code = error?.payload?.code ?? error?.code;

  switch (code) {
    case "invalid_request":
      return "요청값이 올바르지 않습니다.";
    case "not_found":
      return "게시글 목록을 찾을 수 없습니다.";
    case "internal_error":
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return error?.message || "게시글을 불러오는 중 오류가 발생했습니다.";
  }
}

function BoardPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPosts = useCallback(async (signal) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await postsApi.getPosts({
        page: 0,
        limit: 10,
        sort: "DATE",
        signal,
      });
      if (signal?.aborted) return;
      setPosts(response.items);
    } catch (error) {
      if (signal?.aborted || error?.name === "AbortError") return;
      setPosts([]);
      setErrorMessage(mapPostsListError(error));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadPosts(controller.signal);
    return () => controller.abort();
  }, [loadPosts]);

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
        {isLoading ? (
          <PageStateCard message="게시글을 불러오는 중입니다..." />
        ) : errorMessage ? (
          <PageStateCard
            message={errorMessage}
            onRetry={() => void loadPosts()}
            isRetrying={isLoading}
          />
        ) : posts.length === 0 ? (
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
                {typeof post.commentsCount === "number" ? (
                  <span>댓글 {post.commentsCount}</span>
                ) : null}
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

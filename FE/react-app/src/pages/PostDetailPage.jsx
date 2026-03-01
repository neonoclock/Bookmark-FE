import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { postsApi } from "@/lib/api/postsApi.js";
import { useAuth } from "@/hooks/useAuth.js";
import "./PostDetailPage.css";

function splitParagraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n{2,}|\r\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function mapDetailError(error) {
  const code = error?.payload?.code ?? error?.code;
  switch (code) {
    case "not_found":
      return "게시글을 찾을 수 없습니다.";
    case "invalid_request":
      return "요청값이 올바르지 않습니다.";
    case "internal_error":
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return error?.message || "게시글을 불러오는 중 오류가 발생했습니다.";
  }
}

function isUnauthorizedError(error) {
  const code = error?.payload?.code ?? error?.code;
  const status = error?.status;
  return (
    status === 401 ||
    status === 403 ||
    code === "UNAUTHORIZED" ||
    code === "FORBIDDEN"
  );
}

function PostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { user } = useAuth();
  const numericPostId = Number(postId);
  const isValidPostId = Number.isInteger(numericPostId) && numericPostId > 0;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentDraft, setCommentDraft] = useState("");

  const loadPostDetail = useCallback(
    async (signal) => {
      if (!isValidPostId) {
        setIsLoading(false);
        setErrorMessage("잘못된 접근입니다. 게시글 ID를 확인해주세요.");
        setPost(null);
        setComments([]);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const detail = await postsApi.getPostDetail(numericPostId, { signal });
        if (signal?.aborted) return;

        setPost(detail);
        setComments(Array.isArray(detail?.comments) ? detail.comments : []);
      } catch (error) {
        if (signal?.aborted || error?.name === "AbortError") return;
        setPost(null);
        setComments([]);
        setErrorMessage(mapDetailError(error));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [isValidPostId, numericPostId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadPostDetail(controller.signal);
    return () => controller.abort();
  }, [loadPostDetail]);

  const isOwner = useMemo(() => {
    const userId = user?.id ?? user?.user_id;
    if (userId == null || post?.authorId == null) return false;
    return Number(userId) === Number(post.authorId);
  }, [user, post]);

  const handleToggleLike = async () => {
    if (!isValidPostId || !post || isLiking) return;

    if (!user) {
      window.alert("좋아요는 로그인 후 이용 가능합니다.");
      navigate("/login");
      return;
    }

    const wasLiked = Boolean(post.liked);
    setIsLiking(true);

    try {
      if (wasLiked) {
        await postsApi.unlikePost(numericPostId);
      } else {
        await postsApi.likePost(numericPostId);
      }

      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          liked: !wasLiked,
          likes: wasLiked ? Math.max(0, (prev.likes ?? 0) - 1) : (prev.likes ?? 0) + 1,
        };
      });
    } catch (error) {
      const code = error?.payload?.code ?? error?.code;

      if (isUnauthorizedError(error)) {
        window.alert("로그인이 필요합니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      if (code === "already_liked") {
        setPost((prev) => (prev ? { ...prev, liked: true } : prev));
        return;
      }

      if (code === "not_liked") {
        setPost((prev) => (prev ? { ...prev, liked: false } : prev));
        return;
      }

      window.alert(error?.message || "좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <section className="post-detail-page">
        <article className="post-detail-state-card">
          <p className="post-detail-state-text">게시글을 불러오는 중입니다...</p>
        </article>
      </section>
    );
  }

  if (errorMessage || !post) {
    return (
      <section className="post-detail-page">
        <article className="post-detail-state-card">
          <p className="post-detail-state-text">{errorMessage || "게시글을 불러오지 못했습니다."}</p>
          <button className="post-detail-retry-btn" type="button" onClick={() => void loadPostDetail()}>
            다시 시도
          </button>
        </article>
      </section>
    );
  }

  const paragraphs = splitParagraphs(post.content);

  return (
    <section className="post-detail-page">
      <div className="post-detail-topbar">
        <button
          className="post-detail-back-btn"
          type="button"
          onClick={() => navigate("/board")}
          aria-label="목록으로 돌아가기"
        >
          ← 목록으로
        </button>
      </div>

      <article className="post-detail-card">
        <div className="post-detail-inner">
          <h1 className="post-detail-title">{post.title || "(제목 없음)"}</h1>

          <div className="post-detail-meta-line">
            <div className="post-detail-author">
              {post.authorProfileImage ? (
                <img
                  className="post-detail-author-avatar-img"
                  src={post.authorProfileImage}
                  alt="작성자 아바타"
                />
              ) : (
                <span className="post-detail-author-avatar" aria-hidden="true" />
              )}
              <div className="post-detail-author-text">
                <span className="post-detail-author-name">{post.authorName || "익명"}</span>
                <time className="post-detail-date">{post.createdAt || ""}</time>
              </div>
            </div>

            {isOwner ? (
              <div className="post-detail-actions">
                <button
                  className="post-detail-chip"
                  type="button"
                  onClick={() => navigate(`/post-edit/${post.id}`)}
                >
                  수정
                </button>
                <button className="post-detail-chip" type="button" disabled>
                  삭제
                </button>
              </div>
            ) : null}
          </div>

          {post.imageUrl ? (
            <div className="post-detail-media">
              <img className="post-detail-image" src={post.imageUrl} alt="게시글 이미지" />
            </div>
          ) : null}

          <div className="post-detail-content">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
              ))
            ) : (
              <p>(내용이 없습니다)</p>
            )}
          </div>

          <div className="post-detail-stats">
            <button
              className={`post-detail-stat ${post.liked ? "is-liked" : ""}`}
              type="button"
              onClick={handleToggleLike}
              disabled={isLiking}
            >
              <strong>{post.likes ?? 0}</strong>
              <span>{isLiking ? "처리 중..." : "좋아요"}</span>
            </button>
            <div className="post-detail-stat">
              <strong>{post.views ?? 0}</strong>
              <span>조회수</span>
            </div>
            <div className="post-detail-stat">
              <strong>{comments.length}</strong>
              <span>댓글</span>
            </div>
          </div>

          <hr className="post-detail-divider" />

          <section className="post-detail-comment-write">
            <textarea
              placeholder="댓글을 입력해주세요."
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
            />
            <div className="post-detail-comment-submit-wrap">
              <button
                className="post-detail-submit-btn"
                type="button"
                disabled={!commentDraft.trim()}
              >
                댓글 등록
              </button>
            </div>
          </section>

          <section className="post-detail-comments" aria-label="댓글 목록">
            {comments.length === 0 ? (
              <p className="post-detail-comments-empty">첫 댓글을 남겨주세요!</p>
            ) : (
              comments.map((comment) => {
                const userId = user?.id ?? user?.user_id;
                const isMyComment =
                  userId != null &&
                  comment.authorId != null &&
                  Number(userId) === Number(comment.authorId);

                return (
                  <article key={comment.id} className="post-detail-comment">
                    <div className="post-detail-comment-left">
                      <span className="post-detail-comment-dot" />
                    </div>
                    <div className="post-detail-comment-body">
                      <div className="post-detail-comment-head">
                        <div className="post-detail-comment-who">
                          <span className="post-detail-comment-name">{comment.authorName}</span>
                          <time className="post-detail-comment-date">{comment.createdAt}</time>
                        </div>
                        {isMyComment ? (
                          <div className="post-detail-comment-actions">
                            <button className="post-detail-chip" type="button" disabled>
                              수정
                            </button>
                            <button className="post-detail-chip" type="button" disabled>
                              삭제
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <p className="post-detail-comment-text">{comment.content}</p>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </div>
      </article>
    </section>
  );
}

export default PostDetailPage;

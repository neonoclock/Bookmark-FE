import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CommentList from "@/components/comments/CommentList.jsx";
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

function mapActionError(error, fallback) {
  const code = error?.payload?.code ?? error?.code;
  switch (code) {
    case "not_found":
      return "대상이 존재하지 않습니다.";
    case "invalid_request":
      return "입력값을 다시 확인해주세요.";
    case "internal_error":
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return error?.message || fallback;
  }
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
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentActionId, setCommentActionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const userId = user?.id ?? user?.user_id;

  const ensureLogin = useCallback(() => {
    if (user) return true;
    window.alert("로그인 후 이용 가능합니다.");
    navigate("/login");
    return false;
  }, [navigate, user]);

  const loadPostDetail = useCallback(
    async (signal) => {
      const detail = await postsApi.getPostDetail(numericPostId, { signal });
      if (!signal?.aborted) {
        setPost(detail);
        setComments(Array.isArray(detail?.comments) ? detail.comments : []);
      }
    },
    [numericPostId],
  );

  const loadComments = useCallback(
    async (signal) => {
      const list = await postsApi.getPostComments(numericPostId, { signal });
      if (!signal?.aborted) {
        setComments(list);
      }
    },
    [numericPostId],
  );

  const loadAll = useCallback(
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
        await loadPostDetail(signal);
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
    [isValidPostId, loadPostDetail],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadAll(controller.signal);
    return () => controller.abort();
  }, [loadAll, retryKey]);

  const isOwner = useMemo(() => {
    if (userId == null || post?.authorId == null) return false;
    return Number(userId) === Number(post.authorId);
  }, [post, userId]);

  const handleToggleLike = async () => {
    if (!isValidPostId || !post || isLiking) return;
    if (!ensureLogin()) return;

    const wasLiked = post.liked === true;
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

      window.alert(mapActionError(error, "좋아요 처리 중 오류가 발생했습니다."));
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeletePost = async () => {
    if (!isValidPostId || isDeletingPost) return;
    if (!ensureLogin()) return;
    if (!isOwner) {
      window.alert("작성자만 삭제할 수 있습니다.");
      return;
    }

    const ok = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!ok) return;

    setIsDeletingPost(true);
    try {
      await postsApi.deletePost(numericPostId);
      window.alert("게시글이 삭제되었습니다.");
      navigate("/board", { replace: true });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        window.alert("작성자만 삭제할 수 있습니다.");
        navigate(`/post/${numericPostId}`, { replace: true });
        return;
      }
      window.alert(mapActionError(error, "게시글 삭제 중 오류가 발생했습니다."));
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!isValidPostId || isSubmittingComment) return;
    if (!ensureLogin()) return;

    const content = commentDraft.trim();
    if (!content) {
      window.alert("댓글 내용을 입력해주세요.");
      return;
    }

    setIsSubmittingComment(true);
    try {
      await postsApi.createPostComment(numericPostId, { content });
      setCommentDraft("");
      await loadComments();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        window.alert("로그인 후 댓글 작성이 가능합니다.");
        navigate("/login");
        return;
      }
      window.alert(mapActionError(error, "댓글 등록에 실패했습니다."));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const startEditComment = (commentId, originalContent) => {
    setEditingCommentId(commentId);
    setEditingCommentDraft(originalContent ?? "");
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentDraft("");
  };

  const handleSaveEditComment = async (commentId) => {
    if (!isValidPostId || !commentId) return;
    if (!ensureLogin()) return;

    const content = editingCommentDraft.trim();
    if (!content) {
      window.alert("댓글 내용을 입력해주세요.");
      return;
    }

    setCommentActionId(commentId);
    try {
      await postsApi.updatePostComment(numericPostId, commentId, { content });
      setEditingCommentId(null);
      setEditingCommentDraft("");
      await loadComments();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        window.alert("작성자만 수정할 수 있습니다.");
        return;
      }
      window.alert(mapActionError(error, "댓글 수정에 실패했습니다."));
    } finally {
      setCommentActionId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isValidPostId || !commentId) return;
    if (!ensureLogin()) return;

    const ok = window.confirm("이 댓글을 삭제하시겠습니까?");
    if (!ok) return;

    setCommentActionId(commentId);
    try {
      await postsApi.deletePostComment(numericPostId, commentId);
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingCommentDraft("");
      }
      await loadComments();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        window.alert("작성자만 삭제할 수 있습니다.");
        return;
      }
      window.alert(mapActionError(error, "댓글 삭제에 실패했습니다."));
    } finally {
      setCommentActionId(null);
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
          <button
            className="post-detail-retry-btn"
            type="button"
            disabled={isLoading}
            onClick={() => setRetryKey((prev) => prev + 1)}
          >
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
                <button
                  className="post-detail-chip"
                  type="button"
                  onClick={handleDeletePost}
                  disabled={isDeletingPost}
                >
                  {isDeletingPost ? "삭제 중..." : "삭제"}
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
              className={`post-detail-stat ${post.liked === true ? "is-liked" : ""}`}
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
              disabled={isSubmittingComment}
            />
            <div className="post-detail-comment-submit-wrap">
              <button
                className="post-detail-submit-btn"
                type="button"
                disabled={!commentDraft.trim() || isSubmittingComment}
                onClick={handleSubmitComment}
              >
                {isSubmittingComment ? "등록 중..." : "댓글 등록"}
              </button>
            </div>
          </section>

          <CommentList
            comments={comments}
            userId={userId}
            editingCommentId={editingCommentId}
            editingCommentDraft={editingCommentDraft}
            commentActionId={commentActionId}
            onStartEdit={startEditComment}
            onCancelEdit={cancelEditComment}
            onSaveEdit={handleSaveEditComment}
            onDeleteComment={handleDeleteComment}
            onEditingCommentDraftChange={setEditingCommentDraft}
          />
        </div>
      </article>
    </section>
  );
}

export default PostDetailPage;

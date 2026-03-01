import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PostDetailPage.css";

const MOCK_POST = {
  id: 301,
  title: "한 문장을 오래 붙잡고 읽는 밤",
  authorName: "문장수집가",
  createdAt: "2026-02-27 22:13:00",
  content:
    "오래된 책장을 넘기다 보면, 그 시절의 내가 형광펜으로 밑줄 친 문장을 다시 만나게 됩니다.\n" +
    "그때는 몰랐던 의미가, 지금의 마음에는 또 다른 방식으로 들어옵니다.\n\n" +
    "오늘은 문장 하나를 오래 붙잡고 읽었습니다.\n" +
    "읽고 나서야 비로소, 내가 지금 어떤 속도로 살아가고 있는지 조금 알 것 같았습니다.",
  imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200",
  likes: 23,
  views: 148,
  liked: false,
};

const MOCK_COMMENTS = [
  {
    id: 1,
    authorName: "달빛독자",
    createdAt: "2026-02-28 09:02:11",
    content: "문장 하나를 오래 읽는다는 표현이 정말 좋네요.",
  },
  {
    id: 2,
    authorName: "새벽책방",
    createdAt: "2026-02-28 10:21:48",
    content: "저도 다시 읽을 때 전혀 다른 감정이 올라오더라고요.",
  },
];

function splitParagraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n{2,}|\r\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function PostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [liked, setLiked] = useState(MOCK_POST.liked);
  const [likes, setLikes] = useState(MOCK_POST.likes);
  const [commentDraft, setCommentDraft] = useState("");
  const post = useMemo(
    () => ({
      ...MOCK_POST,
      id: Number(postId) || MOCK_POST.id,
    }),
    [postId],
  );

  const paragraphs = useMemo(() => splitParagraphs(post.content), [post.content]);
  const comments = useMemo(() => MOCK_COMMENTS, []);

  const handleToggleLike = () => {
    setLiked((prev) => {
      setLikes((currentLikes) => (prev ? Math.max(0, currentLikes - 1) : currentLikes + 1));
      return !prev;
    });
  };

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
          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta-line">
            <div className="post-detail-author">
              <span className="post-detail-author-avatar" aria-hidden="true" />
              <div className="post-detail-author-text">
                <span className="post-detail-author-name">{post.authorName}</span>
                <time className="post-detail-date">{post.createdAt}</time>
              </div>
            </div>

            <div className="post-detail-actions">
              <button
                className="post-detail-chip"
                type="button"
                onClick={() => navigate(`/post-edit/${post.id}`)}
              >
                수정
              </button>
              <button className="post-detail-chip" type="button">
                삭제
              </button>
            </div>
          </div>

          {post.imageUrl ? (
            <div className="post-detail-media">
              <img className="post-detail-image" src={post.imageUrl} alt="게시글 이미지" />
            </div>
          ) : null}

          <div className="post-detail-content">
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
            ))}
          </div>

          <div className="post-detail-stats">
            <button
              className={`post-detail-stat ${liked ? "is-liked" : ""}`}
              type="button"
              onClick={handleToggleLike}
            >
              <strong>{likes}</strong>
              <span>좋아요</span>
            </button>
            <div className="post-detail-stat">
              <strong>{post.views}</strong>
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
            {comments.map((comment) => (
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
                    <div className="post-detail-comment-actions">
                      <button className="post-detail-chip" type="button">
                        수정
                      </button>
                      <button className="post-detail-chip" type="button">
                        삭제
                      </button>
                    </div>
                  </div>
                  <p className="post-detail-comment-text">{comment.content}</p>
                </div>
              </article>
            ))}
          </section>
        </div>
      </article>
    </section>
  );
}

export default PostDetailPage;

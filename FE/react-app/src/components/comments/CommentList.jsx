function CommentList({
  comments,
  userId,
  editingCommentId,
  editingCommentDraft,
  commentActionId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteComment,
  onEditingCommentDraftChange,
}) {
  return (
    <section className="post-detail-comments" aria-label="댓글 목록">
      {comments.length === 0 ? (
        <p className="post-detail-comments-empty">첫 댓글을 남겨주세요!</p>
      ) : (
        comments.map((comment) => {
          const isMyComment =
            userId != null &&
            comment.authorId != null &&
            Number(userId) === Number(comment.authorId);
          const isEditing = editingCommentId === comment.id;
          const isCommentBusy = commentActionId === comment.id;

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
                      {isEditing ? (
                        <>
                          <button
                            className="post-detail-chip"
                            type="button"
                            disabled={isCommentBusy}
                            onClick={() => void onSaveEdit(comment.id)}
                          >
                            {isCommentBusy ? "저장 중..." : "저장"}
                          </button>
                          <button
                            className="post-detail-chip"
                            type="button"
                            disabled={isCommentBusy}
                            onClick={onCancelEdit}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="post-detail-chip"
                            type="button"
                            disabled={isCommentBusy}
                            onClick={() => onStartEdit(comment.id, comment.content)}
                          >
                            수정
                          </button>
                          <button
                            className="post-detail-chip"
                            type="button"
                            disabled={isCommentBusy}
                            onClick={() => void onDeleteComment(comment.id)}
                          >
                            {isCommentBusy ? "삭제 중..." : "삭제"}
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
                {isEditing ? (
                  <textarea
                    className="post-detail-comment-edit-input"
                    value={editingCommentDraft}
                    onChange={(event) => onEditingCommentDraftChange(event.target.value)}
                    disabled={isCommentBusy}
                  />
                ) : (
                  <p className="post-detail-comment-text">{comment.content}</p>
                )}
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

export default CommentList;

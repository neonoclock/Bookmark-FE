import "./PageStateCard.css";

function PageStateCard({ message, onRetry, isRetrying = false }) {
  return (
    <div className="page-state-card">
      <p className="page-state-text">{message}</p>
      {onRetry ? (
        <button
          className="page-retry-btn"
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
        >
          다시 시도
        </button>
      ) : null}
    </div>
  );
}

export default PageStateCard;

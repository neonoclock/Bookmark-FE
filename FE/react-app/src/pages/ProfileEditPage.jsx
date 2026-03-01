import { Link } from "react-router-dom";
import "./ProfileEditPage.css";

function ProfileEditPage() {
  return (
    <section className="profile-page">
      <article className="profile-card">
        <h1 className="profile-title">회원정보수정</h1>

        <section className="profile-avatar-section">
          <p className="profile-field-label">프로필 사진</p>
          <label className="profile-avatar-uploader" htmlFor="profile-avatar-input">
            <input id="profile-avatar-input" type="file" accept="image/*" hidden />
            <img
              src="https://placehold.co/200x200/aaaaaa/ffffff?text=%20"
              alt="프로필 미리보기"
            />
            <span className="profile-avatar-badge">변경</span>
          </label>
          <p className="profile-helper"> </p>
        </section>

        <form className="profile-form" autoComplete="off" onSubmit={(event) => event.preventDefault()}>
          <div className="profile-form-field">
            <label className="profile-input-label">이메일</label>
            <p className="profile-readonly">startupcode@gmail.com</p>
          </div>

          <div className="profile-form-field">
            <label className="profile-input-label" htmlFor="profile-nickname">
              닉네임
            </label>
            <input id="profile-nickname" type="text" placeholder="닉네임을 입력하세요" />
          </div>

          <button className="profile-btn profile-btn--block" type="button">
            수정하기
          </button>

          <button className="profile-link-danger" type="button">
            회원 탈퇴
          </button>

          <div className="profile-complete-wrap">
            <Link className="profile-btn profile-btn--pill" to="/board">
              완료
            </Link>
          </div>
        </form>
      </article>
    </section>
  );
}

export default ProfileEditPage;

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.js";
import "./AvatarDropdown.css";

function getDisplayInitial(nickname) {
  const trimmed = typeof nickname === "string" ? nickname.trim() : "";
  if (!trimmed) return "U";
  return trimmed.charAt(0).toUpperCase();
}

function AvatarDropdown() {
  const { user, isAuthenticated, isInitializing, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  const profileImage = user?.profile_image ?? user?.profileImage ?? null;
  const initial = getDisplayInitial(user?.nickname);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeydown = (event) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const handleToggle = () => {
    if (isInitializing) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={wrapRef} className={`avatar-dropdown ${isOpen ? "avatar-dropdown--open" : ""}`}>
      <button
        ref={buttonRef}
        className={`avatar-button ${profileImage ? "avatar-button--image" : ""}`}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="프로필 메뉴"
        onClick={handleToggle}
        disabled={isInitializing}
        style={profileImage ? { "--avatar-url": `url(${profileImage})` } : undefined}
      >
        {!profileImage ? initial : null}
      </button>

      {isAuthenticated ? (
        <nav className="avatar-menu" role="menu" aria-label="프로필 메뉴">
          <Link to="/profile-edit" role="menuitem">
            회원정보수정
          </Link>
          <Link to="/password-edit" role="menuitem">
            비밀번호수정
          </Link>
          <button type="button" className="avatar-menu__logout" role="menuitem" onClick={handleLogout}>
            로그아웃
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default AvatarDropdown;

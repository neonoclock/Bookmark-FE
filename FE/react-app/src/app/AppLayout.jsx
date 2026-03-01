import AvatarDropdown from "@/components/AvatarDropdown.jsx";
import { Link } from "react-router-dom";
import "./AppLayout.css";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Link className="app-brand" to="/board">
            Bookmark
          </Link>
          <AvatarDropdown />
        </div>
      </header>
      <main className="app-main">
        <div className="app-main__inner">{children}</div>
      </main>
      <footer className="app-footer">
        <div className="app-footer__inner">Bookmark Frontend</div>
      </footer>
    </div>
  );
}

export default AppLayout;

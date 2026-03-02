import AvatarDropdown from "@/components/AvatarDropdown.jsx";
import { Link } from "react-router-dom";
import "./AppLayout.css";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__side" />
          <Link className="app-brand" to="/board">
            책갈피
          </Link>
          <div className="app-header__side app-header__side--right">
            <AvatarDropdown />
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="app-main__inner">{children}</div>
      </main>
    </div>
  );
}

export default AppLayout;

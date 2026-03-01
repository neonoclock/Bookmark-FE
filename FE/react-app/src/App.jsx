import AppLayout from "./app/AppLayout.jsx";
import { NavLink, Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <AppLayout>
      <nav className="app-nav">
        <NavLink to="/board">게시글 목록</NavLink>
        <NavLink to="/login">로그인</NavLink>
        <NavLink to="/signup">회원가입</NavLink>
        <NavLink to="/profile-edit">프로필 수정</NavLink>
      </nav>
      <Outlet />
    </AppLayout>
  );
}

export default App;

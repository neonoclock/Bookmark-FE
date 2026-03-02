import App from "@/App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import BoardPage from "@/pages/BoardPage.jsx";
import LandingPage from "@/pages/LandingPage.jsx";
import LoginPage from "@/pages/LoginPage.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import PasswordEditPage from "@/pages/PasswordEditPage.jsx";
import PostCreatePage from "@/pages/PostCreatePage.jsx";
import PostDetailPage from "@/pages/PostDetailPage.jsx";
import PostEditPage from "@/pages/PostEditPage.jsx";
import ProfileEditPage from "@/pages/ProfileEditPage.jsx";
import SignupPage from "@/pages/SignupPage.jsx";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  {
    element: <App />,
    children: [
      { path: "board", element: <BoardPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "password-edit", element: <PasswordEditPage /> },
      { path: "profile-edit", element: <ProfileEditPage /> },
      { path: "post-create", element: <PostCreatePage /> },
      { path: "post/:postId", element: <PostDetailPage /> },
      { path: "post-edit/:postId", element: <PostEditPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;

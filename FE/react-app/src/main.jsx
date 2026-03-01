import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./app/router.jsx";
import { AuthProvider } from "./app/AuthProvider.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>,
);

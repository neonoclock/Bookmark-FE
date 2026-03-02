import AppLayout from "./app/AppLayout.jsx";
import { Outlet } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default App;

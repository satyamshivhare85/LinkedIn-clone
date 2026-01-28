import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthContext from "./context/AuthContext"; // T
import UserContext from "./context/userContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContext>
        <UserContext>
        <App />
        </UserContext>
       
      </AuthContext>
    </BrowserRouter>
  </StrictMode>
);

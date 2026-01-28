import { createContext } from "react";

export const authDataContext = createContext(null);

const AuthContext = ({ children }) => {
  const serverUrl = "http://localhost:8000"; // STRING ❗

  return (
    <authDataContext.Provider value={{ serverUrl }}>
      {children}
    </authDataContext.Provider>
  );
};

export default AuthContext;

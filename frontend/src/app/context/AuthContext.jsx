import { createContext, useContext, useEffect, useState } from "react";

const AuthContextData = createContext();

function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export default function AuthContext({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 INIT (automatic login)
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token);

    if (!decoded) {
      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    setUser(decoded);
    setLoading(false);
  }, []);

  // 🔹 LOGIN
  const login = (token) => {
    localStorage.setItem("token", token);

    const decoded = parseJwt(token);
    setUser(decoded);
  };

  // 🔹 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/goodbye-user";
  };

  return (
    <AuthContextData.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContextData.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContextData);
}
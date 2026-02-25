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

  // 🔹 Init from JWT
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

  // 🔹 Login
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/goodbye-user";
  };

  return (
    <AuthContextData.Provider
      value={{
        user,
        setUser,
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
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, apiUrl } from "../utils/apiData";

const AuthContextData = createContext();

export default function AuthContext({ children }) {
  const [loading, setLoading] = useState(true);

  // ------------------------
  // Initial USER
  // ------------------------
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token));

      return {
        ...payload,
        notifications: payload.notifications || {
          weekend: false,
          news: false,
          chat: false,
          poll: false,
          courses: false,
          events: false,
        }
      };
    } catch (e) {
      localStorage.removeItem("token");
      window.location.href = "/goodbye-user";
      return null;
    }
  });

  // ------------------------
  // Update notifications safely
  // ------------------------
  const updateNotifications = (data) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updatedUser = {
        ...prev,
        notifications: {
          ...prev.notifications,
          ...data,
        }
      };

      // Save token
      const newToken = btoa(JSON.stringify(updatedUser));
      localStorage.setItem("token", newToken);

      return updatedUser;
    });
  };

  // ------------------------
  // Clear one badge
  // ------------------------
  const clearNotification = (key) => {
    updateNotifications({ [key]: false });
  };

  // ------------------------
  // Load notifications ONCE after user login loaded
  // ------------------------
  useEffect(() => {
    if (!user?.id && !user?._id) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      const uid = user._id || user.id;
      const res = await apiRequest(`${apiUrl.notifications}/${uid}`);

      if (res?.status === "success") {
        updateNotifications(res.data);
      }

      setLoading(false);
    };

    fetchNotifications();
  }, []); // ← IMPORTANT: load notifications ONLY once on first mount

  // ------------------------
  // Login via URL params
  // ------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("user");
    const password = params.get("pass");

    if (!email || !password) {
      setLoading(false);
      return;
    }

    const login = async () => {
      const res = await apiRequest(apiUrl.auth, "POST", { email, password });

      if (!res || res.status === "error" || !res.user) {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/goodbye-user";
        return;
      }

      const payload = {
        ...res.user,
        notifications: {
          weekend: false,
          news: false,
          chat: false,
          poll: false,
          courses: false,
          events: false,
        }
      };

      const token = btoa(JSON.stringify(payload));
      localStorage.setItem("token", token);

      setUser(payload);
      setLoading(false);
    };

    login();
  }, []);

  // ------------------------
  // Logout
  // ------------------------
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
        logout,
        loading,
        updateNotifications,
        clearNotification,
      }}
    >
      {children}
    </AuthContextData.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContextData);
}

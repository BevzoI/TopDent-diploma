import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, apiUrl } from "../utils/apiData";

const AuthContextData = createContext();

export default function AuthContext({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token));
            return payload;
        } catch (e) {
            localStorage.removeItem("token");
            window.location.href = "/goodbye-user";
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const email = params.get("user");
        const password = params.get("pass");

        // 👉 Немає логіну в URL → просто закінчуємо ініціалізацію
        // (user вже взяли з localStorage, якщо він був)
        if (!email || !password) {
            setLoading(false);
            return;
        }

        // 👉 Є логін у URL → завжди пробуємо перелогінитися
        const login = async () => {
            const res = await apiRequest(apiUrl.auth, "POST", { email, password });

            if (!res || res.status === "error" || !res.user) {
                localStorage.removeItem("token");
                setUser(null);
                window.location.href = "/goodbye-user";
                return;
            }

            const payload = res.user;

            const token = btoa(JSON.stringify(payload));
            localStorage.setItem("token", token);
            setUser(payload);
            setLoading(false);
        };

        login();
    }, []);

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        window.location.href = "/goodbye-user";
    };

    return (
        <AuthContextData.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContextData.Provider>
    );
}

export function useAuthContext() {
    return useContext(AuthContextData);
}

const BASE_URL = process.env.REACT_APP_API_URL;

export async function apiRequest(url = "", method = "GET", data = null) {
    try {
        const options = { method, headers: {} };

        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token));
                if (payload?.role) {
                    options.headers["X-User-Role"] = payload.role;
                }
                if (payload?.id) {
                    options.headers["X-User-Id"] = payload.id;
                }
            } catch (e) {
                console.warn("Invalid token in localStorage", e);
            }
        }

        if (data && method !== "GET") {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errData = await response.json();
                if (errData?.message) errorMessage = errData.message;
            } catch (_) {}

            return {
                status: "error",
                message: errorMessage,
            };
        }

        return await response.json();

    } catch (error) {
        console.error("❌ API error:", error);
        return {
            status: "error",
            message: "Network error",
        };
    }
}

export const apiUrl = {
  news: `${BASE_URL}/news`,
  auth: `${BASE_URL}/auth`,
  users: `${BASE_URL}/users`,
  groups: `${BASE_URL}/groups`, // 🔥 ДОДАНО
  weekend: `${BASE_URL}/weekend`,
  poll: `${BASE_URL}/poll`,
  events: `${BASE_URL}/events`,
  courses: `${BASE_URL}/courses`,
  chat: `${BASE_URL}/chat`,
  notifications: `${BASE_URL}/users/notify/`,
};
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://topdent-diploma.onrender.com";

/**
 * 🔐 Decode JWT safely
 */
function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function apiRequest(url = "", method = "GET", data = null) {
  try {
    const options = { method, headers: {} };

    const token = localStorage.getItem("token");

    if (token) {
      const payload = parseJwt(token);

      if (payload?.role) {
        options.headers["X-User-Role"] = payload.role;
      }

      if (payload?.id) {
        options.headers["X-User-Id"] = payload.id;
      }

      // 🔥 Додаємо сам JWT (на майбутнє, якщо бекенд перейде на Authorization)
      options.headers["Authorization"] = `Bearer ${token}`;
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
  groups: `${BASE_URL}/groups`,
  weekend: `${BASE_URL}/weekend`,
  poll: `${BASE_URL}/poll`,
  events: `${BASE_URL}/events`,
  courses: `${BASE_URL}/courses`,
  chat: `${BASE_URL}/chat`,
  notifications: `${BASE_URL}/users/notify/`,
};
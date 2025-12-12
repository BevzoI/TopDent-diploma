import { filePath } from "./siteUrls";

export function getUserAvatar(user) {
  const avatar = user?.avatar;

  // 1Немає аватарки → стандартна
  if (!avatar) {
    return filePath.avatars + "AV1.webp";
  }

  // Base64 картинка
  if (avatar.startsWith("data:image")) {
    return avatar;
  }

  // Cloudinary URL
  if (avatar.includes("cloudinary")) {
    return avatar;
  }

  // Локальна аватарка (AV1.webp, AV45.webp...)
  return filePath.avatars + avatar;
}


export function formatDate(date) {
  if (!date) return "—";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "—";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function hasAnyNotifications(notifications = {}) {
  return Object.values(notifications).some(v => v === true);
}


export const copy = (url) => {
  navigator.clipboard.writeText(url);
};

export function encodeBase64(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

export function decodeBase64(token) {
  return JSON.parse(decodeURIComponent(escape(atob(token))));
}

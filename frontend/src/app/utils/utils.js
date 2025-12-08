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

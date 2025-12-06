import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function BodyClass() {
  const location = useLocation();

  useEffect(() => {
    // поточний шлях, без початкових/кінцевих слешів
    const path = location.pathname.replace(/^\/+|\/+$/g, "");
    const firstSegment = path.split("/")[0] || "home";

    const body = document.body;

    // 1Прибираємо всі класи, що закінчуються на -page
    Array.from(body.classList)
      .filter((cls) => cls.endsWith("-page"))
      .forEach((cls) => body.classList.remove(cls));

    // Додаємо новий клас: "home-page", "excuses-page" тощо
    body.classList.add(`${firstSegment}-page`);
  }, [location.pathname]);

  return null;
}

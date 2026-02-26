import { useAuthContext } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function AppInit({ children }) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <div>Načítání...</div>;
  }

  const publicRoutes = [
    "/goodbye-user",
  ];

  const isInviteRoute = location.pathname.startsWith("/invite");

  // ✅ дозволяємо public маршрути
  if (!user && !publicRoutes.includes(location.pathname) && !isInviteRoute) {
    return <div>Access denied!</div>;
  }

  return children;
}
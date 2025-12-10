import { useAuthContext } from "../../context/AuthContext";

export default function AppInit({ children }) {
  // const { user, loading } = useAuthContext();

  // if (loading) {
  //   return <div>Načítání...</div>;
  // }

  // // ❌ Немає авторизації – показуємо тільки goodbye-user
  // if (!user) {
  //   return 'Access denied!';
  // }

  // ✅ Є авторизація – показуємо все, що було всередині <AppInit>...</AppInit>
  return children;
}

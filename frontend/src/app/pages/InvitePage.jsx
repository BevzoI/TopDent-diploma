import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input, Button, Message } from "rsuite";
import { apiRequest, apiUrl } from "../utils/apiData";
import { useAuthContext } from "../context/AuthContext";
import { encodeBase64 } from "../utils/utils";

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) {
      setError("Zadejte heslo.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await apiRequest(
      `${apiUrl.auth}/set-password`,
      "POST",
      { token, password }
    );

    if (res?.status === "success") {
      // 🔥 АВТОЛОГІН
      const payload = {
        ...res.user,
        notifications: {
          weekend: false,
          news: false,
          chat: false,
          poll: false,
          courses: false,
          events: false,
        },
      };

      const encoded = encodeBase64(payload);
      localStorage.setItem("token", encoded);
      setUser(payload);

      navigate("/");
    } else {
      setError(res?.message || "Chyba při nastavování hesla.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h3>Nastavte si heslo</h3>

      {error && (
        <Message type="error" style={{ marginBottom: 12 }}>
          {error}
        </Message>
      )}

      <Input
        type="password"
        placeholder="Zadejte nové heslo"
        value={password}
        onChange={setPassword}
        style={{ marginBottom: 12 }}
      />

      <Button appearance="primary" onClick={handleSubmit} block loading={loading}>
        Nastavit heslo
      </Button>
    </div>
  );
}
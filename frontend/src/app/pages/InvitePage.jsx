import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input, Button, Message } from "rsuite";
import { apiRequest, apiUrl } from "../utils/apiData";
import { useAuthContext } from "../context/AuthContext";

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!password) {
      setError("Zadejte heslo.");
      return;
    }

    const res = await apiRequest(
      `${apiUrl.auth}/set-password`,
      "POST",
      { token, password }
    );

    if (res?.status === "success") {
      login(res.token, res.user);
      navigate("/");
    } else {
      setError(res?.message || "Chyba při nastavování hesla.");
    }
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

      <Button appearance="primary" onClick={handleSubmit} block>
        Nastavit heslo
      </Button>
    </div>
  );
}
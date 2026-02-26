import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Message, Panel } from "rsuite";
import { apiRequest, apiUrl } from "../utils/apiData";
import { encodeBase64 } from "../utils/utils";
import { useAuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const res = await apiRequest(apiUrl.auth, "POST", {
      email: email.trim(),
      password: password.trim(),
    });

    if (!res || res.status !== "success") {
      setError("Neplatné přihlašovací údaje.");
      setLoading(false);
      return;
    }

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

    const token = encodeBase64(payload);
    localStorage.setItem("token", token);
    setUser(payload);

    setLoading(false);
    navigate("/");
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <Panel bordered shaded>
        <h3 style={{ textAlign: "center", marginBottom: 20 }}>
          Přihlášení
        </h3>

        {error && (
          <Message type="error" showIcon style={{ marginBottom: 15 }}>
            {error}
          </Message>
        )}

        <Form fluid>
          <Form.Group>
            <Form.ControlLabel>Email</Form.ControlLabel>
            <Form.Control
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>Heslo</Form.ControlLabel>
            <Form.Control
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
            />
          </Form.Group>

          <Button
            appearance="primary"
            block
            loading={loading}
            onClick={handleLogin}
          >
            Přihlásit se
          </Button>
        </Form>
      </Panel>
    </div>
  );
}
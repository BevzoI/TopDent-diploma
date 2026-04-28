import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://api.topdentteam.cz";

export default function InvitePage() {
  const token = window.location.pathname.split("/invite/")[1] || "";

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordTooShort = useMemo(
    () => password.trim().length < 6,
    [password],
  );

  useEffect(() => {
    const checkInvite = async () => {
      if (!token) {
        setError("Chybí token pozvánky.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/auth/invite/${token}`);
        const data = await res.json();

        if (!res.ok || data.status !== "success") {
          setError(data.message || "Neplatný nebo expirovaný odkaz.");
          setValid(false);
        } else {
          setValid(true);
          setEmail(data.data?.email || "");
          setMessage("Pozvánka je platná. Nastavte si heslo.");
        }
      } catch (err) {
        setError("Nepodařilo se ověřit pozvánku.");
        setValid(false);
      } finally {
        setLoading(false);
      }
    };

    checkInvite();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Chybí token pozvánky.");
      return;
    }

    if (passwordTooShort) {
      setError("Heslo musí mít alespoň 6 znaků.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const res = await fetch(`${API_BASE}/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        setError(data.message || "Nepodařilo se nastavit heslo.");
        return;
      }

      setSuccess(true);
      setMessage("Heslo bylo nastaveno. Teď se můžete přihlásit v aplikaci.");
    } catch (err) {
      setError("Chyba serveru při nastavování hesla.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logo}>🦷</div>
          <div style={styles.brand}>TopDentTeam</div>
        </div>

        <h1 style={styles.title}>Nastavte si heslo</h1>

        {loading ? (
          <p style={styles.info}>Načítám pozvánku...</p>
        ) : (
          <>
            {email ? <p style={styles.email}>{email}</p> : null}

            {message ? <div style={styles.successBox}>{message}</div> : null}
            {error ? <div style={styles.errorBox}>{error}</div> : null}

            {!success && valid ? (
              <form onSubmit={handleSubmit} style={styles.form}>
                <input
                  type="password"
                  placeholder="Zadejte nové heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  autoComplete="new-password"
                />

                <div style={styles.hint}>Minimálně 6 znaků.</div>

                <button
                  type="submit"
                  disabled={submitting || passwordTooShort}
                  style={{
                    ...styles.button,
                    ...(submitting || passwordTooShort
                      ? styles.buttonDisabled
                      : {}),
                  }}
                >
                  {submitting ? "Ukládám..." : "Nastavit heslo"}
                </button>
              </form>
            ) : null}

            {success ? (
              <div style={styles.afterSuccess}>
                <a href="/login" style={styles.secondaryButton}>
                  Přejít na přihlášení
                </a>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    justifyContent: "center",
  },
  logo: {
    fontSize: "28px",
  },
  brand: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1f6fbf",
  },
  title: {
    margin: "0 0 10px 0",
    textAlign: "center",
    fontSize: "20px",
    color: "#111827",
  },
  email: {
    margin: "0 0 16px 0",
    textAlign: "center",
    color: "#4b5563",
    fontSize: "14px",
  },
  info: {
    textAlign: "center",
    color: "#4b5563",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "10px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
  },
  hint: {
    color: "#6b7280",
    fontSize: "13px",
  },
  button: {
    border: "none",
    background: "#1f6fbf",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonDisabled: {
    background: "#9ec3ea",
    cursor: "not-allowed",
  },
  successBox: {
    background: "#ecfdf5",
    color: "#166534",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  errorBox: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  afterSuccess: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "center",
  },
  secondaryButton: {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: "12px",
    background: "#eef2ff",
    color: "#1f6fbf",
    textDecoration: "none",
    fontWeight: 700,
  },
};


import { useState } from "react";
import { Link, useNavigate,useLocation } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const notice = location.state?.message || "";

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const token = response.data.token;

      if (!token) {
        setError("Login response did not contain a token.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Unable to log in. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.brand}>
          MediReview<span style={styles.plus}>+</span>
        </Link>

        <div style={styles.icon}>✚</div>

        <h2 style={styles.heading}>Welcome back!</h2>
        <p style={styles.subtitle}>
          Sign in to share your healthcare experience.
        </p>

        {notice && (
          <div role="status" style={styles.success}>
            {notice}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>

            <div style={styles.passwordBox}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.passwordInput}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                style={styles.showButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create an account
          </Link>
        </p>

        <Link to="/" style={styles.homeLink}>
          ← Back to homepage
        </Link>

        <p style={styles.footer}>
          Your voice helps others make informed healthcare decisions.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #eef5ff 0%, #f8fafc 100%)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "32px",
    boxSizing: "border-box",
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "18px",
    boxShadow: "0 12px 40px rgba(31, 65, 114, 0.10)",
    textAlign: "center",
  },
  brand: {
    color: "#173b70",
    fontSize: "25px",
    fontWeight: "700",
    textDecoration: "none",
  },
  plus: {
    color: "#2563eb",
  },
  icon: {
    width: "54px",
    height: "54px",
    margin: "24px auto 12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "16px",
    background: "#eaf2ff",
    color: "#2563eb",
    fontSize: "29px",
  },
  heading: {
    margin: "0 0 8px",
    color: "#172b4d",
    fontSize: "27px",
  },
  subtitle: {
    margin: "0 0 28px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  field: {
    marginBottom: "20px",
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "12px 13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outlineColor: "#2563eb",
    fontSize: "14px",
  },
  passwordBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    padding: "12px 13px",
    border: "none",
    outline: "none",
    fontSize: "14px",
  },
  showButton: {
    padding: "10px",
    border: "none",
    background: "#ffffff",
    color: "#2563eb",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    marginBottom: "16px",
    padding: "11px",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
    textAlign: "left",
  },
  loginButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
  },
  registerText: {
    marginTop: "22px",
    color: "#64748b",
    fontSize: "14px",
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },
  homeLink: {
    display: "inline-block",
    marginTop: "8px",
    color: "#475569",
    fontSize: "13px",
    textDecoration: "none",
  },
  footer: {
    marginTop: "25px",
    paddingTop: "18px",
    borderTop: "1px solid #edf0f5",
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.6,
  },
};

export default Login;

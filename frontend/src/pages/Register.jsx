
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const passwordStrength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

   
      
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const response = await api.post("/auth/register", {
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
    });

    if (response.data.requiresEmailVerification) {
      navigate("/verify-email", {
        state: { email: normalizedEmail },
      });
    } else {
      setMessage(
        response.data.message || "Registration successful."
      );
    }
  } catch (err) {
    const data = err.response?.data;

    if (
      data?.requiresEmailVerification ||
      data?.code === "EMAIL_NOT_VERIFIED"
    ) {
      navigate("/verify-email", {
        state: { email: email.trim().toLowerCase() },
      });
    } else {
      setError(
        data?.message || "Unable to register. Please try again."
      );
    }
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

        <h2 style={styles.heading}>Create your account</h2>

        <p style={styles.subtitle}>
          Join MediReview+ and help others make informed healthcare decisions.
        </p>

        <form onSubmit={handleRegister}>
          <div style={styles.field}>
            <label htmlFor="fullName" style={styles.label}>
              Full name
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

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
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.passwordInput}
                minLength={6}
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

            {password.length > 0 && (
              <div style={styles.strengthArea}>
                <div style={styles.strengthTrack}>
                  <div
                    style={{
                      ...styles.strengthBar,
                      width: `${(passwordStrength / 5) * 100}%`,
                      background:
                        passwordStrength <= 2
                          ? "#ef4444"
                          : passwordStrength <= 3
                          ? "#f59e0b"
                          : "#10b981",
                    }}
                  />
                </div>

                <small style={styles.strengthText}>
                  Password strength:{" "}
                  {passwordStrength <= 2
                    ? "Weak"
                    : passwordStrength <= 3
                    ? "Fair"
                    : passwordStrength <= 4
                    ? "Good"
                    : "Strong"}
                </small>
              </div>
            )}
          </div>

          <div style={styles.field}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm password
            </label>

            <div style={styles.passwordBox}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter password again"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.passwordInput}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                style={styles.showButton}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {confirmPassword.length > 0 && (
              <small
                style={{
                  color:
                    password === confirmPassword ? "#059669" : "#dc2626",
                }}
              >
                {password === confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </small>
            )}
          </div>

          {error && (
            <div role="alert" style={styles.error}>
              {error}
            </div>
          )}

          {message && (
            <div role="status" style={styles.success}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.registerButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
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
    width: "100%",
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
    maxWidth: "460px",
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
    margin: "22px auto 12px",
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
    margin: "0 0 24px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  field: {
    marginBottom: "18px",
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

  strengthArea: {
    marginTop: "8px",
  },

  strengthTrack: {
    height: "5px",
    borderRadius: "5px",
    background: "#e2e8f0",
    overflow: "hidden",
  },

  strengthBar: {
    height: "100%",
    borderRadius: "5px",
    transition: "width 180ms ease, background 180ms ease",
  },

  strengthText: {
    display: "block",
    marginTop: "6px",
    color: "#64748b",
    fontSize: "12px",
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

  success: {
    marginBottom: "16px",
    padding: "11px",
    borderRadius: "8px",
    background: "#ecfdf5",
    color: "#047857",
    fontSize: "13px",
    textAlign: "left",
  },

  registerButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
  },

  loginText: {
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

export default Register;


import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !/^\d{6}$/.test(otp)) {
      setError("Enter your email and the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-email", {
        email: email.trim().toLowerCase(),
        otp
      });

      setMessage(
        response.data.message || "Email verified successfully."
      );

      navigate("/login", {
        replace: true,
        state: { message: "Email verified successfully. You can now log in." }
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Enter the email address used to register.");
      return;
    }

    setResending(true);

    try {
      const response = await api.post("/auth/resend-otp", {
        email: email.trim().toLowerCase()
      });

      setMessage(
        response.data.message || "A new verification code was sent."
      );
      setOtp("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not resend the code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.brand}>
          MediReview<span style={styles.plus}>+</span>
        </Link>

        <div style={styles.icon}>✉</div>

        <h2 style={styles.heading}>Verify your email</h2>

        <p style={styles.subtitle}>
          Enter the six-digit verification code sent to your email
          address. The code expires after 10 minutes.
        </p>

        <form onSubmit={handleVerify}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="otp" style={styles.label}>
              Six-digit code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              style={styles.input}
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
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
              ...styles.primaryButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "wait" : "pointer"
            }}
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          style={styles.secondaryButton}
        >
          {resending ? "Sending..." : "Resend verification code"}
        </button>

        <p style={styles.footerText}>
          Already verified?{" "}
          <Link to="/login" style={styles.link}>
            Go to login
          </Link>
        </p>

        <Link to="/" style={styles.homeLink}>
          ← Back to homepage
        </Link>
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
    fontFamily: "Arial, sans-serif"
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
    textAlign: "center"
  },
  brand: {
    color: "#173b70",
    fontSize: "25px",
    fontWeight: "700",
    textDecoration: "none"
  },
  plus: {
    color: "#2563eb"
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
    fontSize: "29px"
  },
  heading: {
    margin: "0 0 8px",
    color: "#172b4d",
    fontSize: "27px"
  },
  subtitle: {
    margin: "0 0 24px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6
  },
  field: {
    marginBottom: "18px",
    textAlign: "left"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600"
  },
  input: {
    width: "100%",
    padding: "12px 13px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outlineColor: "#2563eb",
    fontSize: "15px"
  },
  error: {
    marginBottom: "16px",
    padding: "11px",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
    textAlign: "left"
  },
  success: {
    marginBottom: "16px",
    padding: "11px",
    borderRadius: "8px",
    background: "#ecfdf5",
    color: "#047857",
    fontSize: "13px",
    textAlign: "left"
  },
  primaryButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700"
  },
  secondaryButton: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer"
  },
  footerText: {
    marginTop: "22px",
    color: "#64748b",
    fontSize: "14px"
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none"
  },
  homeLink: {
    display: "inline-block",
    marginTop: "8px",
    color: "#475569",
    fontSize: "13px",
    textDecoration: "none"
  }
};

export default VerifyEmail;

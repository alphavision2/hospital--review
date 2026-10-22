
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

function AddHospital() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    hospitalType: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    email: "",
    specialties: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!token) {
        throw new Error("Please log in before adding a hospital.");
      }

      const response = await fetch(`${API_BASE_URL}/hospitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          specialties: form.specialties
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add hospital.");
      }

      setMessage("Hospital added successfully!");

      setTimeout(() => {
        navigate(`/hospitals/${form.hospitalType}`);
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    setMessage("");
    setError("");

    try {
      if (!token) {
        throw new Error("Please log in with an administrator account.");
      }

      const response = await fetch(`${API_BASE_URL}/hospitals/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Hospital import failed.");
      }

      setMessage(
        `Import completed. Imported: ${data.imported ?? 0}, skipped: ${data.skipped ?? 0}.`
      );
    } catch (err) {
      setError(err.message || "Unable to import hospitals.");
    } finally {
      setImporting(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    marginTop: 7,
    borderRadius: 9,
    border: "1px solid #34404d",
    background: "#202426",
    color: "#f3f4f6",
    fontSize: 15,
    outlineColor: "#55c8cb",
  };

  const labelStyle = {
    display: "block",
    marginTop: 17,
    color: "#dce3e8",
    fontSize: 14,
    fontWeight: 600,
  };

  const buttonStyle = {
    width: "100%",
    padding: 13,
    marginTop: 22,
    background: "#087f8c",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #253638 0%, #1b1d1e 45%, #131516 100%)",
        color: "#e5e7eb",
        padding: "35px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <Link
          to="/"
          style={{
            color: "#55c8cb",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Back to homepage
        </Link>

        <header style={{ textAlign: "center", margin: "28px 0" }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: "#087f8c",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 15px",
              fontSize: 27,
            }}
          >
            +
          </div>

          <h1 style={{ margin: 0, fontSize: 29 }}>
            Add a Hospital
          </h1>

          <p style={{ color: "#a0a6ad", lineHeight: 1.6 }}>
            MediReview+ hospital management
          </p>
        </header>

        <section
          style={{
            padding: 25,
            background: "#17191a",
            border: "1px solid #303b49",
            borderRadius: 16,
            boxShadow: "0 18px 50px rgba(0,0,0,0.2)",
          }}
        >
          <h2 style={{ fontSize: 19, marginTop: 0 }}>
            Import Hospitals
          </h2>

          <p style={{ color: "#a0a6ad", fontSize: 14, lineHeight: 1.6 }}>
            Import records from your configured hospital data provider.
            Administrator permissions are required.
          </p>

          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            style={{
              ...buttonStyle,
              marginTop: 8,
              opacity: importing ? 0.7 : 1,
              cursor: importing ? "wait" : "pointer",
            }}
          >
            {importing ? "Importing..." : "Import Hospitals from API"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "26px 0",
              color: "#7d898f",
              fontSize: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#34404d" }} />
            OR ADD MANUALLY
            <div style={{ flex: 1, height: 1, background: "#34404d" }} />
          </div>

          <form onSubmit={handleSubmit}>
            <label style={labelStyle} htmlFor="name">
              Hospital Name *
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter hospital name"
              required
            />

            <label style={labelStyle} htmlFor="hospitalType">
              Ownership Type *
            </label>
            <select
              id="hospitalType"
              name="hospitalType"
              value={form.hospitalType}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Select ownership type</option>
              <option value="government">Government Hospital</option>
              <option value="private">Private Hospital</option>
            </select>

            <label style={labelStyle} htmlFor="address">
              Address *
            </label>
            <input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Street and locality"
              required
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <label style={labelStyle} htmlFor="city">City *</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="state">State *</label>
                <input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <label style={labelStyle} htmlFor="pinCode">PIN Code</label>
            <input
              id="pinCode"
              name="pinCode"
              value={form.pinCode}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle} htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
            />

            <label style={labelStyle} htmlFor="specialties">
              Specialties
            </label>
            <input
              id="specialties"
              name="specialties"
              value={form.specialties}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Cardiology, Neurology"
            />

            <label style={labelStyle} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              placeholder="Describe the hospital and its services"
            />

            {error && (
              <p role="alert" style={{ color: "#ff8f8f", lineHeight: 1.5 }}>
                {error}
              </p>
            )}

            {message && (
              <p role="status" style={{ color: "#86efac", lineHeight: 1.5 }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                ...buttonStyle,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Add Hospital"}
            </button>
          </form>
        </section>

        <p
          style={{
            textAlign: "center",
            marginTop: 22,
            color: "#7d898f",
            fontSize: 12,
          }}
        >
          MediReview+ · Hospital information portal
        </p>
      </div>
    </main>
  );
}

export default AddHospital;

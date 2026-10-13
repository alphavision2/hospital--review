import AddHospital from "./pages/AddHospital";
import HospitalCategory from "./pages/HospitalCategory";
import VerifyEmail from "./pages/VerifyEmail";
import Register from "./pages/Register";
import Login from "./pages/login";
import { BrowserRouter, Routes, Route, Link,useNavigate } from "react-router-dom";
import HospitalDetails from "./pages/HospitalDetails";
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

function HomePage() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rating: 5,
    comment: "",
    department: "",
    visitDate: "",
  });

  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken") || "";

  // Load hospitals from the backend
  useEffect(() => {
    async function fetchHospitals() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/hospitals`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load hospitals");
        }

        const hospitalList = Array.isArray(data)
          ? data
          : data.hospitals || data.data || [];

        setHospitals(hospitalList);
      } catch (err) {
        setError(
          err.message || "Could not connect to the backend. Check your server.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHospitals();
  }, []);

  // Load reviews for the selected hospital
  async function openHospital(hospital) {
    setSelectedHospital(hospital);
    setReviews([]);
    setMessage("");
    setError("");
    setReviewsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/reviews/hospital/${hospital._id}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reviews");
      }

      const reviewList = Array.isArray(data)
        ? data
        : data.reviews || data.data || [];

      setReviews(reviewList);
    } catch (err) {
      setError(err.message || "Unable to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  }

  // Submit a hospital review
  async function submitReview(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedHospital) return;

    if (!token) {
      setError(
        "Please log in first. Your JWT token must be saved in localStorage.",
      );
      return;
    }

    if (form.comment.trim().length < 5) {
      setError("Your review must contain at least 5 characters.");
      return;
    }

    if (form.comment.trim().length > 1000) {
      setError("Your review cannot exceed 1000 characters.");
      return;
    }

    if (!form.department.trim()) {
      setError("Please enter the department you visited.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_BASE}/reviews/hospital/${selectedHospital._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: Number(form.rating),
            comment: form.comment.trim(),
            department: form.department.trim(),
            visitDate: form.visitDate,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your review");
      }

      setMessage("Your review was submitted successfully!");

      setForm({
        rating: 5,
        comment: "",
        department: "",
        visitDate: "",
      });

      // Refresh reviews after submission
      await openHospital(selectedHospital);

      // Refresh hospital ratings
      try {
        const hospitalResponse = await fetch(`${API_BASE}/hospitals`);

        const hospitalData = await hospitalResponse.json();

        if (hospitalResponse.ok) {
          const list = Array.isArray(hospitalData)
            ? hospitalData
            : hospitalData.hospitals || hospitalData.data || [];

          setHospitals(list);

          const updatedHospital = list.find(
            (item) => item._id === selectedHospital._id,
          );

          if (updatedHospital) {
            setSelectedHospital(updatedHospital);
          }
        }
      } catch {
        // The submitted review remains successful even if
        // refreshing the hospital list fails.
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredHospitals = hospitals.filter((hospital) => {
    const searchText = search.toLowerCase();

    return (
      (hospital.name || "").toLowerCase().includes(searchText) ||
      (hospital.address || "").toLowerCase().includes(searchText) ||
      (hospital.city || "").toLowerCase().includes(searchText)
    );
  });

  const averageRating = (hospital) =>
    Number(hospital.averageRating || 0).toFixed(1);
  const hospitalCategories = [
  {
    title: "Private Hospitals",
    type: "private",
    description:
      "Explore private hospitals, compare ratings, and read patient reviews.",
    icon: "🏥",
  },
    {
      title: "Government Hospitals",
      type: "government",
      description:
        "Discover government hospitals and explore patient experiences.",
      icon: "🏛️",
    },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f7fb",
      color: "#172033",
      fontFamily: "Arial, sans-serif",
    },
    navbar: {
      background: "#ffffff",
      padding: "18px 7%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e5eaf2",
      flexWrap: "wrap",
      gap: 12,
    },
    logo: {
      color: "#087f8c",
      fontSize: 25,
      fontWeight: 800,
      letterSpacing: "-1px",
    },
    hero: {
      padding: "65px 7% 55px",
      background:
        "linear-gradient(125deg, #063b50 0%, #087f8c 65%, #19a6a0 100%)",
      color: "white",
    },
    heroTitle: {
      fontSize: "clamp(32px, 5vw, 52px)",
      maxWidth: 650,
      lineHeight: 1.15,
      margin: "0 0 18px",
    },
    search: {
      width: "100%",
      maxWidth: 600,
      padding: "16px 18px",
      fontSize: 16,
      borderRadius: 10,
      border: "1px solid #dbe3ed",
      outline: "none",
      boxSizing: "border-box",
    },
    main: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "40px 24px 70px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 24,
    },
    card: {
      background: "#ffffff",
      border: "1px solid #e7ebf2",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 5px 20px rgba(20, 40, 70, 0.04)",
    },
    primaryButton: {
      background: "#087f8c",
      color: "#ffffff",
      border: "none",
      borderRadius: 9,
      padding: "12px 18px",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: 14,
    },
    secondaryButton: {
      background: "#e7f5f5",
      color: "#087f8c",
      border: "none",
      borderRadius: 9,
      padding: "10px 15px",
      cursor: "pointer",
      fontWeight: 700,
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: 12,
      border: "1px solid #dce3ec",
      borderRadius: 8,
      fontSize: 15,
      marginTop: 7,
      background: "#ffffff",
    },
    label: {
      display: "block",
      marginTop: 15,
      fontWeight: 700,
      fontSize: 14,
    },
    
      authButton: {
        display: "inline-block",
        padding: "8px 16px",
        borderRadius: "6px",
        backgroundColor: "#eb2543",
        color: "#ffffff",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 600,
        border: "none",
        cursor: "pointer",
      }
   };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>MediReview+</div>

        <div style={{ color: "#586579", fontSize: 14 }}>
          Trusted healthcare experiences
        </div>

        
       
          <Link
            to="/add-hospital"
            style={{
              background: "#c8102e",
              color: "#ffffff",
              padding: "10px 18px",
              borderRadius: "7px",
              textDecoration: "none",
              fontWeight: 700,
              display: "inline-block",
            }}
          >
            Import Hospitals
          </Link>


        {(localStorage.getItem("token") ||
          localStorage.getItem("authToken")) ? (
          <button
            type="button"
            onClick={handleLogout}
            style={styles.authButton}
          >
            Logout
          </button>
        ) : (
        <>
        <Link to="/login" style={styles.authButton}>
             Login
          </Link>

         <Link to="/register" style={styles.authButton}>
         Register
        </Link>
         </>
      )}


      </nav>

      {/* Hero section */}
      <header style={styles.hero}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              marginBottom: 16,
              color: "#b8f2ed",
            }}
          >
            YOUR HEALTH. YOUR CHOICE.
          </div>

          <h1 style={styles.heroTitle}>
            Find the right hospital with confidence.
          </h1>

          <p
            style={{
              maxWidth: 570,
              lineHeight: 1.8,
              color: "#e0f4f5",
              marginBottom: 28,
            }}
          >
            Discover hospitals, explore patient experiences, and share your own
            healthcare journey.
          </p>

          <input
            style={styles.search}
            type="search"
            placeholder="Search by hospital name, city, or address..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </header>

      <main style={styles.main}>
        {/* Hospital directory */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 24,
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: 27 }}>
                Explore Hospitals
              </h2>
              <p style={{ margin: 0, color: "#718096" }}>
                Find healthcare providers and read patient reviews.
              </p>
            </div>

            <span style={{ color: "#64748b", fontSize: 14 }}>
              {hospitals.length} hospitals
            </span>
          </div>

          {loading && <p>Loading hospitals...</p>}

          {error && (
            <div
              role="alert"
              style={{
                padding: 14,
                marginBottom: 20,
                borderRadius: 9,
                background: "#fff0f0",
                color: "#b42318",
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && filteredHospitals.length === 0 && (
            <div style={styles.card}>
              No hospitals found. Try another search.
            </div>
          )}

          <div style={styles.grid}>
        { hospitalCategories.map((category) => (
         <article key={category.type} style={styles.card}>
      <div
        style={{
          height: 105,
          background: "#e5f5f4",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          marginBottom: 20,
        }}
      >
        {category.icon}
      </div>

      <h3>{category.title}</h3>

      <p
        style={{
          color: "#718096",
          fontSize: 14,
          lineHeight: 1.6,
          minHeight: 42,
        }}
      >
        {category.description}
      </p>

      <div style={{ margin: "15px 0 20px", color: "#718096", fontSize: 13 }}>
        {hospitals.filter(
          (hospital) =>
            hospital.hospitalType?.toLowerCase() === category.type
        ).length}{" "}
        hospitals
      </div>

      <button
        style={styles.primaryButton}
        onClick={() => navigate(`/hospitals/${category.type}`)}
      >
        View Hospitals →
      </button>
    </article>
  ))}
</div>
        </section>

        {/* Selected hospital details and reviews */}
        {selectedHospital && (
          <section
            style={{
              marginTop: 60,
              paddingTop: 35,
              borderTop: "2px solid #e3e9f1",
            }}
          >
            <button
              style={styles.secondaryButton}
              onClick={() => {
                setSelectedHospital(null);
                setReviews([]);
                setError("");
                setMessage("");
              }}
            >
              ← Back to hospitals
            </button>

            <div style={{ marginTop: 25, marginBottom: 30 }}>
              <h2 style={{ fontSize: 29, marginBottom: 10 }}>
                {selectedHospital.name}
              </h2>

              <p style={{ color: "#718096" }}>
                📍{" "}
                {selectedHospital.address ||
                  selectedHospital.city ||
                  "Location not available"}
              </p>

              <p style={{ fontSize: 18 }}>
                <span style={{ color: "#e6a000" }}>★</span>{" "}
                <strong>{averageRating(selectedHospital)}</strong>
                <span style={{ color: "#718096", fontSize: 14 }}>
                  {" "}
                  average rating · {selectedHospital.totalReviews || 0} reviews
                </span>
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 28,
                alignItems: "start",
              }}
            >
              {/* Review form */}
              <div style={styles.card}>
                <h3 style={{ marginTop: 0 }}>Write a Review</h3>

                <p style={{ color: "#718096", fontSize: 14 }}>
                  Share your experience with other patients.
                </p>

                <form onSubmit={submitReview}>
                  <label style={styles.label}>Your Rating</label>

                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      marginTop: 10,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`Rate ${star} out of 5`}
                        onClick={() => setForm({ ...form, rating: star })}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: 31,
                          padding: 0,
                          color: star <= form.rating ? "#f5b400" : "#d4dbe5",
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <label style={styles.label}>Department</label>

                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g. Cardiology"
                    value={form.department}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        department: event.target.value,
                      })
                    }
                    required
                  />

                  <label style={styles.label}>Visit Date</label>

                  <input
                    style={styles.input}
                    type="date"
                    value={form.visitDate}
                    max={new Date().toLocaleDateString("en-CA")}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        visitDate: event.target.value,
                      })
                    }
                  />

                  <label style={styles.label}>Your Experience</label>

                  <textarea
                    style={{
                      ...styles.input,
                      minHeight: 120,
                      resize: "vertical",
                    }}
                    placeholder="Describe the care, staff, facilities, and your experience..."
                    value={form.comment}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        comment: event.target.value,
                      })
                    }
                    minLength={5}
                    maxLength={1000}
                    required
                  />

                  <p
                    style={{
                      textAlign: "right",
                      fontSize: 12,
                      color: "#718096",
                    }}
                  >
                    {form.comment.length}/1000 characters
                  </p>

                  <button
                    style={{
                      ...styles.primaryButton,
                      width: "100%",
                      opacity: submitting ? 0.7 : 1,
                    }}
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>

              {/* Patient reviews */}
              <div>
                <h3 style={{ marginTop: 0, fontSize: 23 }}>Patient Reviews</h3>

                {reviewsLoading && <p>Loading reviews...</p>}

                {!reviewsLoading && reviews.length === 0 && (
                  <div style={styles.card}>
                    <p style={{ color: "#718096" }}>
                      No reviews yet. Be the first to share your experience!
                    </p>
                  </div>
                )}

                {!reviewsLoading &&
                  reviews.map((review) => (
                    <article
                      key={review._id}
                      style={{
                        ...styles.card,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <strong>
                          {review.user?.fullname ||
                            review.user?.name ||
                            "Verified patient"}
                        </strong>

                        <span
                          style={{
                            color: "#e6a000",
                            fontWeight: 700,
                          }}
                        >
                          {"★".repeat(
                            Math.min(
                              5,
                              Math.max(0, Number(review.rating) || 0),
                            ),
                          )}
                          <span style={{ color: "#718096" }}>
                            {" "}
                            {review.rating}/5
                          </span>
                        </span>
                      </div>

                      {review.department && (
                        <p
                          style={{
                            color: "#087f8c",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {review.department}
                        </p>
                      )}

                      <p
                        style={{
                          color: "#4b5563",
                          lineHeight: 1.8,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {review.comment}
                      </p>

                      {review.visitDate && (
                        <p
                          style={{
                            color: "#718096",
                            fontSize: 12,
                          }}
                        >
                          Visit date:{" "}
                          {new Date(review.visitDate).toLocaleDateString()}
                        </p>
                      )}

                      {review.createdAt && (
                        <p
                          style={{
                            color: "#718096",
                            fontSize: 12,
                            marginBottom: 0,
                          }}
                        >
                          Posted:{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </article>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Feedback messages */}
        {(message || (error && selectedHospital)) && (
          <div
            role="status"
            style={{
              marginTop: 25,
              padding: 15,
              borderRadius: 9,
              background: message ? "#e8f8ee" : "#fff0f0",
              color: message ? "#176b3a" : "#b42318",
            }}
          >
            {message || error}
          </div>
        )}
      </main>

      <footer
        style={{
          padding: 25,
          textAlign: "center",
          background: "#063b50",
          color: "#d8e8ee",
          fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} MediReview+ · Better healthcare decisions
        through shared experiences.
      </footer>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/hospital/:id"
          element={<HospitalDetails />}
        />
        <Route
          path="/hospitals/:type"
          element={<HospitalCategory />}
        />
        <Route path="/add-hospital" element={<AddHospital />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

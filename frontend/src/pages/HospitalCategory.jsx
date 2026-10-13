import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../app.css";

const API_BASE = "http://localhost:5000/api";

function HospitalCategory() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const validType = ["government", "private"].includes(
    (type || "").toLowerCase()
  );

  const categoryType = (type || "").toLowerCase();
  const categoryTitle =
    categoryType === "government"
      ? "Government Hospitals"
      : "Private Hospitals";

  useEffect(() => {
    const controller = new AbortController();

    async function fetchHospitals() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/hospitals`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load hospitals.");
        }

        const list = Array.isArray(data)
          ? data
          : data.hospitals || data.data || [];

        setHospitals(list);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchHospitals();

    return () => controller.abort();
  }, []);

  const categoryHospitals = useMemo(() => {
    return hospitals.filter(
      (hospital) =>
        (hospital.hospitalType || "").toLowerCase() === categoryType
    );
  }, [hospitals, categoryType]);

  const specialties = useMemo(() => {
    const values = categoryHospitals.flatMap((hospital) => {
      if (Array.isArray(hospital.specialties)) {
        return hospital.specialties;
      }

      return hospital.specialties ? [hospital.specialties] : [];
    });

    return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }, [categoryHospitals]);

  const filteredHospitals = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = categoryHospitals.filter((hospital) => {
      const searchableText = [
        hospital.name,
        hospital.city,
        hospital.address,
        hospital.state,
        hospital.pinCode,
        ...(Array.isArray(hospital.specialties)
          ? hospital.specialties
          : hospital.specialties
            ? [hospital.specialties]
            : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      const hospitalSpecialties = Array.isArray(hospital.specialties)
        ? hospital.specialties
        : hospital.specialties
          ? [hospital.specialties]
          : [];

      const matchesSpecialty =
        !specialty || hospitalSpecialties.includes(specialty);

      return matchesSearch && matchesSpecialty;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "rating") {
        return (
          Number(b.averageRating || 0) - Number(a.averageRating || 0)
        );
      }

      if (sortBy === "reviews") {
        return (
          Number(b.totalReviews || 0) - Number(a.totalReviews || 0)
        );
      }

      return (a.name || "").localeCompare(b.name || "");
    });
  }, [categoryHospitals, search, specialty, sortBy]);

  if (!validType) {
    return (
      <main className={`hospital-section category-page category-${categoryType}`}>
        <div className="empty-state">
          <h3>Hospital category not found</h3>
          <p>Please select Government Hospitals or Private Hospitals.</p>
          <button className="details-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="hospital-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">MEDIREVIEW+ DIRECTORY</span>
          <h2>{categoryTitle}</h2>
          <p>Explore hospitals, compare ratings, and read patient experiences.</p>
        </div>

        <span className="result-count">
          {loading
            ? "Loading..."
            : `${filteredHospitals.length} of ${categoryHospitals.length} hospitals`}
        </span>
      </div>

      {/* Search and filters: existing UI styling is preserved */}
      <div className="search-box" style={{ marginBottom: 24 }}>
        <input
          type="search"
          placeholder="Search by name, city, address, or specialty..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search hospitals"
        />

        <select
          value={specialty}
          onChange={(event) => setSpecialty(event.target.value)}
          aria-label="Filter by specialty"
        >
          <option value="">All specialties</option>
          {specialties.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort hospitals"
        >
          <option value="name">Name: A–Z</option>
          <option value="rating">Highest rated</option>
          <option value="reviews">Most reviewed</option>
        </select>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setSpecialty("");
            setSortBy("name");
          }}
        >
          Reset
        </button>
      </div>

      {loading && (
        <div className="status-message" role="status">
          Loading {categoryTitle.toLowerCase()}...
        </div>
      )}

      {!loading && error && (
        <div className="status-message error-message" role="alert">
          <p>{error}</p>
          <button
            className="details-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && filteredHospitals.length === 0 && (
        <div className="empty-state">
          <span>🔎</span>
          <h3>
            {categoryHospitals.length === 0
              ? `No ${categoryTitle.toLowerCase()} available yet`
              : "No matching hospitals found"}
          </h3>
          <p>
            {categoryHospitals.length === 0
              ? "Hospitals in this category will appear here once they have been added."
              : "Try another search or clear your filters."}
          </p>

          {(search || specialty) && (
            <button
              className="details-btn"
              onClick={() => {
                setSearch("");
                setSpecialty("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredHospitals.length > 0 && (
        <div className="hospital-grid">
          {filteredHospitals.map((hospital) => {
            const rating = Number(hospital.averageRating || 0);
            const reviewCount = Number(hospital.totalReviews || 0);

            const hospitalSpecialties = Array.isArray(hospital.specialties)
              ? hospital.specialties
              : hospital.specialties
                ? [hospital.specialties]
                : [];

            return (
              <article className="hospital-card" key={hospital._id}>
                <div className="hospital-image">
                  🏥
                  <span className="image-label">
                    {categoryType === "government"
                      ? "Government"
                      : "Private"}
                  </span>
                </div>

                <div className="hospital-info">
                  {hospitalSpecialties.length > 0 && (
                    <span className="hospital-specialty">
                      {hospitalSpecialties[0]}
                    </span>
                  )}

                  <h3>{hospital.name}</h3>

                  <p className="hospital-location">
                    📍{" "}
                    {[hospital.city, hospital.state]
                      .filter(Boolean)
                      .join(", ") ||
                      hospital.address ||
                      "Location not available"}
                  </p>

                  <div className="rating">
                    <strong>{rating.toFixed(1)}</strong>
                    <span className="stars" aria-label={`${rating} out of 5 stars`}>
                      {"★".repeat(Math.max(0, Math.min(5, Math.round(rating))))}
                      {"☆".repeat(
                        5 - Math.max(0, Math.min(5, Math.round(rating)))
                      )}
                    </span>
                    <span className="review-count">
                      {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                    </span>
                  </div>

                  {hospitalSpecialties.length > 1 && (
                    <p className="hospital-location">
                      +{hospitalSpecialties.length - 1} more specialties
                    </p>
                  )}

                  <button
                    className="details-btn"
                    onClick={() => navigate(`/hospital/${hospital._id}`)}
                  >
                    View Details →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <Link to="/" style={{ color: "#0965ed", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default HospitalCategory;
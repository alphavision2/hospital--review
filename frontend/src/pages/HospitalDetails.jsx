
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "./HospitalDetails.css";

function HospitalDetails() {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState(false);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchDetails() {
      setLoading(true);
      setError("");

      try {
        const [hospitalResponse, reviewsResponse] =
          await Promise.all([
            api.get(`/hospitals/${id}`),
            api.get(`/reviews/hospital/${id}`),
          ]);

        if (cancelled) return;

        const data = hospitalResponse.data;
        const hospitalData = data.hospital || data.data || data;

        setHospital({
          ...hospitalData,
          specialties: Array.isArray(hospitalData.specialties)
            ? hospitalData.specialties
            : [],
          description: hospitalData.description || "",
          averageRating: Number(hospitalData.averageRating || 0),
          totalReviews: Number(hospitalData.totalReviews || 0),
        });;

        const reviewData = reviewsResponse.data;
        setReviews(
          Array.isArray(reviewData.reviews)
            ? reviewData.reviews
            : []
        );
      } catch (err) {
        console.error("Hospital details error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load hospital details. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMessage("");
    setReviewError(false);

    const token = localStorage.getItem("token");

    if (!token) {
      setReviewError(true);
      setReviewMessage("Please log in before submitting a review.");
      return;
    }

    if (!comment.trim()) {
      setReviewError(true);
      setReviewMessage("Please write your review.");
      return;
    }

    try {
      setSubmitting(true);

      // Submit the review only once
      const submitResponse = await api.post(
        `/reviews/hospital/${id}`,
        {
          rating: Number(rating),
          comment: comment.trim(),
          department: department.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = submitResponse.data;

      // Update hospital rating immediately from the backend response
      if (result.hospitalRating) {
        setHospital((previous) => ({
          ...previous,
          averageRating: Number(
            result.hospitalRating.averageRating ?? previous.averageRating ?? 0
          ),
          totalReviews: Number(
            result.hospitalRating.totalReviews ?? previous.totalReviews ?? 0
          ),
        }));
      }

      // Add the newly saved review immediately
      if (result.review) {
        setReviews((previous) => [
          result.review,
          ...previous.filter((item) => item._id !== result.review._id),
        ]);
      }

      setReviewMessage("Your review was submitted successfully!");
      setReviewError(false);
      setComment("");
      setDepartment("");
      setRating(5);
      setActiveTab("reviews");

      // Refresh reviews separately; failure here must not report submission failure
      try {
        const response = await api.get(`/reviews/hospital/${id}`);
        const reviewData = response.data;

        if (Array.isArray(reviewData.reviews)) {
          setReviews(reviewData.reviews);
        }
      } catch (refreshError) {
        console.error("Review refresh error:", refreshError);
      }

      // Refresh hospital statistics separately
      try {
        const response = await api.get(`/hospitals/${id}`);
        const data = response.data;
        const hospitalData = data.hospital || data.data || data;

        setHospital((previous) => ({
          ...previous,
          ...hospitalData,
          averageRating: Number(hospitalData.averageRating ?? 0),
          totalReviews: Number(hospitalData.totalReviews ?? 0),
          specialties: Array.isArray(hospitalData.specialties)
            ? hospitalData.specialties
            : [],
          description: hospitalData.description || "",
        }));
      } catch (refreshError) {
        console.error("Hospital statistics refresh error:", refreshError);
      }
    } catch (err) {
      console.error(
        "Review submission error:",
        err.response?.data || err.message
      );

      setReviewError(true);
      setReviewMessage(
        err.response?.data?.message ||
          "Unable to submit your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="hd-loading">
        <div className="hd-spinner" />
        <h2>Finding hospital information...</h2>
        <p>Please wait while we load the latest details.</p>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="hd-error-page">
        <div className="hd-error-icon">!</div>
        <h2>Hospital unavailable</h2>
        <p>{error || "Hospital not found."}</p>
        <Link className="hd-primary-button" to="/">
          Back to Home
        </Link>
      </div>
    );
  }

  const hospitalName = hospital.name || "Hospital";
  const specialties = Array.isArray(hospital.specialties)
    ? hospital.specialties
    : [];

  const averageRating = Number(hospital.averageRating || 0);
  const totalReviews = reviews.length;

  return (
    <div className="hd-page">
      <div className="hd-topbar">
        <Link to="/" className="hd-back-link">
          <span>←</span> Back to hospitals
        </Link>

        <span className="hd-brand">
          <span className="hd-brand-icon">✚</span>
          MediReview<span className="hd-brand-plus">+</span>
        </span>
      </div>

      <main className="hd-container">
        <section className="hd-hero">
          <div className="hd-hospital-avatar">✚</div>

          <div className="hd-hero-content">
            <span className="hd-eyebrow">
              HOSPITAL INFORMATION
            </span>

            <h1>{hospitalName}</h1>

            <p className="hd-address">
              <span>⌖</span>{" "}
              {[hospital.address, hospital.city, hospital.state]
                .filter(Boolean)
                .join(", ") || "Location not available"}
            </p>

            <div className="hd-hero-rating">
              <span className="hd-stars">
                {"★".repeat(
                  Math.max(
                    0,
                    Math.min(5, Math.round(averageRating))
                  )
                )}
                <span className="hd-empty-stars">
                  {"★".repeat(
                    5 -
                      Math.max(
                        0,
                        Math.min(5, Math.round(averageRating))
                      )
                  )}
                </span>
              </span>

              <strong>{averageRating.toFixed(1)}/5</strong>
              <span>({totalReviews} reviews)</span>
            </div>

            <div className="hd-hero-actions">
              <button
                className="hd-primary-button"
                onClick={() => setActiveTab("review-form")}
              >
                ✎ Write a Review
              </button>

              <button
                className={`hd-save-button ${
                  saved ? "hd-saved" : ""
                }`}
                onClick={() => setSaved(!saved)}
                aria-pressed={saved}
              >
                {saved ? "♥ Saved" : "♡ Save Hospital"}
              </button>
            </div>

            {saved && (
              <p className="hd-save-note">
                Saved for this visit. This selection is not
                synced across devices.
              </p>
            )}
          </div>
        </section>

        <section className="hd-stats">
          <div className="hd-stat-card">
            <span className="hd-stat-icon">★</span>
            <div>
              <strong>{averageRating.toFixed(1)}/5</strong>
              <p>Patient rating</p>
            </div>
          </div>

          <div className="hd-stat-card">
            <span className="hd-stat-icon">☰</span>
            <div>
              <strong>{totalReviews}</strong>
              <p>Patient reviews</p>
            </div>
          </div>

          <div className="hd-stat-card">
            <span className="hd-stat-icon">✚</span>
            <div>
              <strong>{specialties.length}</strong>
              <p>Listed specialties</p>
            </div>
          </div>
        </section>

        <nav className="hd-tabs" aria-label="Hospital information">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Patient Reviews ({reviews.length})
          </button>

          <button
            className={
              activeTab === "review-form" ? "active" : ""
            }
            onClick={() => setActiveTab("review-form")}
          >
            Write a Review
          </button>
        </nav>

        {activeTab === "overview" && (
          <section className="hd-content-grid">
            <div className="hd-main-card">
              <h2>About this hospital</h2>
              <p className="hd-description">
                {hospital.description ||
                  "Hospital information has not been added yet."}
              </p>

              <div className="hd-section-divider" />

              <h2>Medical specialties</h2>

              {specialties.length > 0 ? (
                <div className="hd-specialties">
                  {specialties.map((specialty, index) => (
                    <span className="hd-specialty" key={index}>
                      ✚ {specialty}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="hd-muted">
                  No specialties listed yet.
                </p>
              )}
            </div>

            <aside className="hd-side-card">
              <h2>Hospital information</h2>

              <div className="hd-info-row">
                <span className="hd-info-icon">⌖</span>
                <div>
                  <small>Address</small>
                  <p>
                    {[
                      hospital.address,
                      hospital.city,
                      hospital.state,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="hd-info-row">
                <span className="hd-info-icon">★</span>
                <div>
                  <small>Patient rating</small>
                  <p>{averageRating.toFixed(1)} out of 5</p>
                </div>
              </div>

              <div className="hd-info-row">
                <span className="hd-info-icon">☰</span>
                <div>
                  <small>Patient feedback</small>
                  <p>{totalReviews} reviews</p>
                </div>
              </div>

              <button
                className="hd-primary-button hd-full-button"
                onClick={() => setActiveTab("reviews")}
              >
                Read Patient Reviews →
              </button>
            </aside>
          </section>
        )}

        {activeTab === "reviews" && (
          <section className="hd-main-card hd-review-section">
            <div className="hd-section-heading">
              <div>
                <h2>Patient experiences</h2>
                <p>
                  See what patients have shared about this hospital.
                </p>
              </div>

              <button
                className="hd-primary-button"
                onClick={() => setActiveTab("review-form")}
              >
                + Add Review
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="hd-empty">
                <div>✎</div>
                <h3>Be the first to share your experience</h3>
                <p>Your feedback can help other patients.</p>
                <button
                  className="hd-primary-button"
                  onClick={() => setActiveTab("review-form")}
                >
                  Write the First Review
                </button>
              </div>
            ) : (
              <div className="hd-review-list">
                {reviews.map((review) => (
                  <article
                    className="hd-review-card"
                    key={review._id}
                  >
                    <div className="hd-review-avatar">
                      {(review.user?.fullName || "P")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="hd-review-body">
                      <div className="hd-review-heading">
                        <div>
                          <h3>
                            {review.user?.fullName || "Patient"}
                          </h3>

                          {review.department && (
                            <span className="hd-review-department">
                              {review.department}
                            </span>
                          )}
                        </div>

                        <span className="hd-review-score">
                          ★ {Number(review.rating || 0)}/5
                        </span>
                      </div>

                      <p className="hd-review-comment">
                        {review.comment}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "review-form" && (
          <section className="hd-main-card hd-form-section">
            <h2>Share your experience</h2>
            <p className="hd-form-intro">
              Your honest feedback helps other patients make
              informed decisions.
            </p>

            <form onSubmit={handleSubmitReview}>
              <fieldset className="hd-rating-field">
                <legend>Your overall rating</legend>

                <div
                  className="hd-rating-picker"
                  aria-label="Choose a rating from 1 to 5"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={
                        value <= rating
                          ? "hd-rating-star selected"
                          : "hd-rating-star"
                      }
                      onClick={() => setRating(value)}
                      aria-label={`${value} out of 5 stars`}
                      aria-pressed={rating === value}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <p className="hd-rating-label">
                  {[
                    "",
                    "Poor",
                    "Fair",
                    "Good",
                    "Very good",
                    "Excellent",
                  ][rating]}
                </p>
              </fieldset>

              <label className="hd-label" htmlFor="department">
                Department (optional)
              </label>

              <input
                className="hd-input"
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cardiology, Pediatrics"
                maxLength={100}
              />

              <label className="hd-label" htmlFor="comment">
                Your review
              </label>

              <textarea
                className="hd-input hd-textarea"
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience..."
                rows={5}
                maxLength={2000}
                required
              />

              <p className="hd-character-count">
                {comment.length}/2000 characters
              </p>

              {reviewMessage && (
                <div
                  className={
                    reviewError
                      ? "hd-message hd-message-error"
                      : "hd-message hd-message-success"
                  }
                  role="status"
                >
                  {reviewMessage}

                  {reviewError &&
                    reviewMessage.toLowerCase().includes("log in") && (
                      <>
                        {" "}
                        <Link to="/login">Log in here</Link>
                      </>
                    )}
                </div>
              )}

              <div className="hd-form-actions">
                <button
                  type="button"
                  className="hd-save-button"
                  onClick={() => setActiveTab("overview")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hd-primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Review →"}
                </button>
              </div>
            </form>
          </section>
        )}

        <footer className="hd-footer">
          <p>
            MediReview+ · Helping patients make informed healthcare
            decisions.
          </p>
          <Link to="/">Return to homepage ↑</Link>
        </footer>
      </main>
    </div>
  );
}

export default HospitalDetails;

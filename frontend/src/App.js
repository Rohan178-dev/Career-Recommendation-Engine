import { useState, useRef, useEffect } from "react";
import ParticleBackground from "./components/ParticleBackground";
import LoadingScreen from "./components/LoadingScreen";
import ProfileForm from "./components/ProfileForm";
import CareerCard from "./components/CareerCard";

// App.js
// Top-level view state machine:
//   "form"    → show hero + profile form
//   "loading" → show loading overlay while API call is in flight
//   "results" → show career result cards
//
// No React Router: view is a single state string. All API calls live here
// so components stay pure and reusable.

const API_URL = "https://career-recommendation-engine-1.onrender.com/api/recommend";

export default function App() {
    const [view, setView] = useState("form");
    const [recommendations, setRecommendations] = useState([]);
    const [apiError, setApiError] = useState(null);
    const [zoom, setZoom] = useState(100); // percentage, 80–130

    const formSectionRef = useRef(null);
    const resultsSectionRef = useRef(null);

    // Apply zoom by scaling root font-size.
    // Since all sizes use rem, this proportionally scales the entire UI.
    useEffect(() => {
        document.documentElement.style.fontSize = `${zoom}%`;
        return () => {
            document.documentElement.style.fontSize = "";
        };
    }, [zoom]);

    function zoomIn() { setZoom((z) => Math.min(z + 10, 130)); }
    function zoomOut() { setZoom((z) => Math.max(z - 10, 80)); }

    // ── Smooth scroll helpers ───────────────────────────────────────────────
    function scrollToForm() {
        formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    function scrollToResults() {
        // Small timeout lets the results section mount before scrolling
        setTimeout(() => {
            resultsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 80);
    }

    // ── Submit handler ──────────────────────────────────────────────────────
    // Called by ProfileForm with the validated user profile object.
    // Sets view to "loading" first so the overlay appears immediately,
    // then awaits the API response before transitioning to "results".
    async function handleFormSubmit(userProfile) {
        setApiError(null);
        setView("loading");

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userProfile),
            });

            const data = await response.json();

            if (!response.ok) {
                // 400-level error — use the server's friendly message
                throw new Error(data.error || "Something went wrong. Please try again.");
            }

            setRecommendations(data.careers || []);
            setView("results");
            scrollToResults();
        } catch (err) {
            setApiError(err.message);
            setView("form");
        }
    }

    // ── Reset handler ───────────────────────────────────────────────────────
    // Clears recommendations and error, returns to the form view.
    function handleReset() {
        setRecommendations([]);
        setApiError(null);
        setView("form");
        // Scroll back to top on reset
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            {/* Particle canvas — always rendered, fixed behind everything */}
            <ParticleBackground />

            {/* Loading overlay — mounted once, visibility toggled via prop */}
            <LoadingScreen isVisible={view === "loading"} />

            {/* ── Fixed site header ────────────────────────────────────────── */}
            <header className="site-header">
                <span className="site-logo">Career Compass</span>

                {/* Zoom controls: scales the full UI via root font-size */}
                <div className="zoom-controls" aria-label="Zoom controls">
                    <button className="zoom-btn" onClick={zoomOut} aria-label="Zoom out" title="Zoom out">−</button>
                    <span className="zoom-level">{zoom}%</span>
                    <button className="zoom-btn" onClick={zoomIn} aria-label="Zoom in" title="Zoom in" >+</button>
                </div>
            </header>

            <main className="main-content">

                {/* ── Hero + Form — hidden once results are shown ───────────── */}
                {view !== "results" && (
                    <>
                        {/* Hero section */}
                        <section className="hero-section">
                            {/* Decorative rotating ring */}
                            <div className="hero-ring" aria-hidden="true" />

                            <div className="hero-inner">
                                <span className="hero-eyebrow">Career Intelligence</span>
                                <h1 className="hero-headline">
                                    Find Where<br />
                                    <em>You Belong.</em>
                                </h1>
                                <p className="hero-descriptor">
                                    Answer four questions. Discover the career paths built for who you are.
                                </p>
                                <button
                                    className="hero-cta"
                                    onClick={scrollToForm}
                                    type="button"
                                >
                                    Begin →
                                </button>
                            </div>
                        </section>

                        {/* Form section */}
                        <section
                            id="form-section"
                            className="form-section"
                            ref={formSectionRef}
                        >
                            <span className="section-eyebrow">Your Profile</span>

                            {/* API error displayed above the form */}
                            {apiError && (
                                <p className="api-error">{apiError}</p>
                            )}

                            <ProfileForm
                                onSubmit={handleFormSubmit}
                                isLoading={view === "loading"}
                            />
                        </section>
                    </>
                )}

                {/* ── Results section ──────────────────────────────────────────── */}
                {view === "results" && (
                    <section
                        className="results-section"
                        ref={resultsSectionRef}
                    >
                        <div className="results-header">
                            <div>
                                <span className="section-eyebrow">Your Results</span>
                                <h2 className="results-title">Career Matches</h2>
                            </div>
                            <span className="results-count">
                                {recommendations.length} path{recommendations.length !== 1 ? "s" : ""} found
                            </span>
                        </div>

                        {recommendations.length === 0 ? (
                            <p className="no-results">
                                No close matches found. Try broadening your interests or skills.
                            </p>
                        ) : (
                            <div className="cards-list">
                                {recommendations.map((career, index) => (
                                    <CareerCard
                                        key={career.id}
                                        career={career}
                                        rank={index + 1}
                                    />
                                ))}
                            </div>
                        )}

                        <button
                            className="btn-reset"
                            onClick={handleReset}
                            type="button"
                            style={{ marginTop: "2.5rem" }}
                        >
                            ← Start Over
                        </button>
                    </section>
                )}

            </main>
        </>
    );
}

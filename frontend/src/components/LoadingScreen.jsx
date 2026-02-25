import { useState, useEffect } from "react";

// LoadingScreen.jsx
// Full-screen overlay that appears while the API call is in flight.
// Cycles through 4 editorial phrases to make the wait feel considered,
// not just a spinner. Controlled by the isVisible prop so the parent
// can mount it once and toggle visibility without re-creating the interval.

const phrases = [
    "Reading your profile…",
    "Cross-referencing career data…",
    "Consulting industry trends…",
    "Finalizing your matches…",
];

export default function LoadingScreen({ isVisible }) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        if (!isVisible) return;

        // Reset to first phrase every time the overlay becomes visible
        setPhraseIndex(0);
        setFading(false);

        // Cycle phrases with a fade transition:
        // 200ms fade-out → swap text → 200ms fade-in → hold for 1400ms → repeat
        const interval = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setPhraseIndex((prev) => (prev + 1) % phrases.length);
                setFading(false);
            }, 300);
        }, 1800);

        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <div
            className="loading-screen"
            style={{
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? "all" : "none",
            }}
        >
            <div className="loading-inner">
                <span className="loading-dot" />
                <p
                    className="loading-phrase"
                    style={{ opacity: fading ? 0 : 1 }}
                >
                    {phrases[phraseIndex]}
                </p>
            </div>
        </div>
    );
}

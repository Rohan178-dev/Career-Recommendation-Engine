// CareerCard.jsx
// Renders one career result. The conic-gradient arc communicates match %
// visually without any charting library. Rank 1 gets a lime accent bar.

export default function CareerCard({ career, rank }) {
    const {
        title,
        description,
        matchPercent,
        reason,
        growthOutlook,
        salaryRange,
    } = career;

    // Zero-pad the rank: 1 → "01", 12 → "12"
    const rankLabel = String(rank).padStart(2, "0");
    const isTop = rank === 1;

    return (
        <div className={`career-card${isTop ? " career-card--top" : ""}`}>

            {/* ── Rank badge ─────────────────────────────────────────────── */}
            <span className="card-rank">{rankLabel}</span>

            {/* ── Title ───────────────────────────────────────────────────── */}
            <h3 className="card-title">{title}</h3>

            {/* ── Description ─────────────────────────────────────────────── */}
            <p className="card-description">{description}</p>

            {/* ── Match percentage + circular arc ─────────────────────────── */}
            {/* The conic-gradient arc is drawn using a CSS custom property    */}
            {/* --pct so the degree calculation lives in CSS, not JS.          */}
            <div className="card-match-row">
                <div
                    className="match-arc"
                    style={{ "--pct": matchPercent }}
                    aria-label={`${matchPercent}% match`}
                >
                    {/* Inner white circle sits on top to create the "ring" effect */}
                    <div className="match-arc-inner" />
                </div>
                <div className="match-text-group">
                    <span className="match-percent">{matchPercent}%</span>
                    <span className="match-label">match</span>
                </div>
            </div>

            {/* ── Meta: growth and salary ──────────────────────────────────── */}
            <div className="card-meta-row">
                <div className="meta-item">
                    <span className="meta-key">Growth</span>
                    <span className="meta-value">{growthOutlook}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-key">Salary</span>
                    <span className="meta-value">{salaryRange}</span>
                </div>
            </div>

            {/* ── Why this fits ────────────────────────────────────────────── */}
            <div className="card-reason">
                <p className="reason-text">{reason}</p>
            </div>

        </div>
    );
}

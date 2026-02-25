// server.js
// Express API for Career Compass. Single endpoint: POST /api/recommend.
// No environment variables, no external services — pure Node.js.

const express = require("express");
const cors = require("cors");
const { recommendCareers } = require("./recommender");

const app = express();
const PORT = 4000;

// ─── Middleware ────────────────────────────────────────────────────────────
// CORS allows the CRA dev server on port 3000 to call this API.
// express.json() parses incoming request bodies as JSON.
app.use(cors());
app.use(express.json());

// ─── POST /api/recommend ──────────────────────────────────────────────────
// Accepts a user profile and returns up to 5 matched career objects.
//
// Expected body:
//   {
//     educationLevel: string,    e.g. "bachelor"
//     interests: string[],       e.g. ["technology", "design"]
//     skills: string[],          e.g. ["programming", "creativity"]
//     preferredIndustry: string  e.g. "it"
//   }
app.post("/api/recommend", (req, res) => {
    const { educationLevel, interests, skills, preferredIndustry } = req.body;

    // ─── Input validation ────────────────────────────────────────────────
    // Return 400 with a human-friendly message rather than letting the
    // recommender receive invalid inputs and produce misleading results.
    if (!educationLevel) {
        return res
            .status(400)
            .json({ error: "Please select your education level." });
    }
    if (!Array.isArray(interests) || interests.length === 0) {
        return res
            .status(400)
            .json({ error: "Please select at least one interest." });
    }
    if (!Array.isArray(skills) || skills.length === 0) {
        return res
            .status(400)
            .json({ error: "Please select at least one skill." });
    }
    if (!preferredIndustry) {
        return res
            .status(400)
            .json({ error: "Please select a preferred industry." });
    }

    // ─── Run the recommender ─────────────────────────────────────────────
    // recommendCareers is synchronous — no await needed.
    const userProfile = { educationLevel, interests, skills, preferredIndustry };
    const careers = recommendCareers(userProfile);

    // If no careers scored above zero, return a helpful message instead of
    // an empty array so the frontend can show a meaningful state.
    if (careers.length === 0) {
        return res.json({
            careers: [],
            message:
                "No close matches found. Try broadening your interests or skills.",
        });
    }

    return res.json({ careers });
});

// ─── Health check ─────────────────────────────────────────────────────────
// Useful for quickly confirming the server is up without a full POST request.
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", port: PORT });
});

// ─── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Career Compass API listening on http://localhost:${PORT}`);
});

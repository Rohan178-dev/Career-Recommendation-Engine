# Career Compass

A premium dark-editorial career recommendation web app. No API keys. No AI. Runs fully offline after `npm install`.

---

## Folder Structure

```
career-compass/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express API server (port 4000)
│   │   ├── recommender.js     # Rule-based scoring engine
│   │   └── careers.json       # 22 career profiles across 8 industries
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── ProfileForm.jsx
│       │   ├── CheckboxGroup.jsx
│       │   ├── CareerCard.jsx
│       │   ├── LoadingScreen.jsx
│       │   └── ParticleBackground.jsx
│       ├── data/
│       │   └── formOptions.js
│       ├── App.js
│       ├── index.js
│       └── styles.css
├── .gitignore
└── README.md
```

---

## Running the App

### 1. Start the backend (port 4000)

```bash
cd career-compass/backend
npm install
npm run dev
```

### 2. Start the frontend (port 3000)

```bash
cd career-compass/frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The frontend proxies API calls to `http://localhost:4000`. Make sure the backend is running first.

---

## How the Scoring Engine Works

The recommender in `backend/src/recommender.js` scores each of the 22 careers against the user's profile using four rules:

| Rule | Points Awarded | Condition |
|------|---------------|-----------|
| **Education** | +2 | User's education level ≥ career's minimum requirement |
| **Industry** | +2 | User's preferred industry matches the career's industry |
| **Interests** | +1 per match | Each user interest that appears in the career's interest list |
| **Skills** | +1 per match | Each user skill that appears in the career's skill list |

**Match %** is calculated as:

```
matchPercent = Math.round((score / maxPossible) * 100)

where maxPossible = 2 + 2 + career.interests.length + career.skills.length
```

Results are filtered (score > 0), sorted descending, and the top 5 are returned.

---

## Industries Covered

`it` · `healthcare` · `finance` · `engineering` · `education` · `media` · `environment` · `government`

---

## No API Keys Required

This project uses zero external services. The recommendation engine is entirely rule-based and runs synchronously in Node.js.

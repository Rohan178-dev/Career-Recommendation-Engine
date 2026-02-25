// recommender.js
// Multi-factor weighted scoring engine.
// Each industry has its own weight profile, and each dimension (education,
// industry, interests, skills) is scored 0–100 before weighting.
// This produces a wide, realistic spread of match percentages.

const careers = require("./careers.json");

// ─── Education rank map ────────────────────────────────────────────────────
const EDUCATION_RANK = {
  highschool: 0,
  associate: 1,
  bachelor: 2,
  master: 3,
  doctorate: 4,
};

// ─── Per-industry weight profiles ─────────────────────────────────────────
// Different careers naturally emphasise different factors:
//   - healthcare/government → education matters most
//   - media/environment     → interests and passion matter more
//   - engineering/IT        → skills carry the most weight
//   - finance               → skills + industry alignment
// All four weights in each profile must sum to 1.0.
const WEIGHT_PROFILES = {
  it: { edu: 0.15, industry: 0.25, interests: 0.28, skills: 0.32 },
  healthcare: { edu: 0.30, industry: 0.20, interests: 0.22, skills: 0.28 },
  finance: { edu: 0.18, industry: 0.27, interests: 0.22, skills: 0.33 },
  engineering: { edu: 0.18, industry: 0.22, interests: 0.22, skills: 0.38 },
  education: { edu: 0.25, industry: 0.25, interests: 0.32, skills: 0.18 },
  media: { edu: 0.10, industry: 0.18, interests: 0.38, skills: 0.34 },
  environment: { edu: 0.18, industry: 0.22, interests: 0.36, skills: 0.24 },
  government: { edu: 0.28, industry: 0.30, interests: 0.22, skills: 0.20 },
};

// ─── Slug → Title Case ────────────────────────────────────────────────────
function slugToLabel(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ─── Education sub-score (0–100) ──────────────────────────────────────────
// Rewards meeting the requirement exactly or being slightly overqualified.
// Being drastically overqualified is a mild penalty (career may feel limiting).
// Being underqualified by even one level scores 0 — a hard floor.
function educationScore(userRank, requiredRank) {
  const gap = userRank - requiredRank; // positive = overqualified
  if (gap < 0) return 0;              // underqualified: ineligible
  if (gap === 0) return 100;          // exact fit
  if (gap === 1) return 82;           // one level above: still great
  if (gap === 2) return 64;           // two levels above: slightly over-spec
  return 48;                          // three or more: likely bored
}

// ─── Interest sub-score (0–100) ───────────────────────────────────────────
// Overlap ratio + a breadth bonus for users who selected many interests,
// because curious generalists tend to discover unexpected fits.
function interestScore(userInterests, careerInterests) {
  if (careerInterests.length === 0) return 50; // fallback
  const matched = userInterests.filter((i) => careerInterests.includes(i));
  const ratio = matched.length / careerInterests.length;

  // Breadth bonus: selecting more than 4 interests total signals curiosity
  const breadthBonus = userInterests.length > 4 ? 8 : 0;

  // Depth bonus: matching every career interest is a strong signal
  const depthBonus = matched.length === careerInterests.length ? 10 : 0;

  return Math.min(Math.round(ratio * 82 + breadthBonus + depthBonus), 100);
}

// ─── Skill sub-score (0–100) ───────────────────────────────────────────────
// Overlap ratio + a bonus for having a transferable general skillset.
function skillScore(userSkills, careerSkills) {
  if (careerSkills.length === 0) return 50;
  const matched = userSkills.filter((s) => careerSkills.includes(s));
  const ratio = matched.length / careerSkills.length;

  // Variety bonus: selecting more than 3 skills shows versatility
  const varietyBonus = userSkills.length > 3 ? 6 : 0;

  // Perfect-skill-match bonus
  const perfectBonus = matched.length === careerSkills.length ? 12 : 0;

  return Math.min(Math.round(ratio * 82 + varietyBonus + perfectBonus), 100);
}

// ─── Score a single career ────────────────────────────────────────────────
// Returns raw weighted score (0–100) as matchPercent, plus the _score
// used internally for sorting (same value, different name).
function scoreCareer(career, userProfile) {
  const weights = WEIGHT_PROFILES[career.industry] || {
    edu: 0.20, industry: 0.25, interests: 0.27, skills: 0.28,
  };

  const userRank = EDUCATION_RANK[userProfile.educationLevel] ?? -1;
  const requiredRank = EDUCATION_RANK[career.education] ?? 0;

  // Hard gate: if underqualified, career is not a valid match at all
  if (userRank < requiredRank) {
    return { score: 0, matchPercent: 0 };
  }

  const eduSub = educationScore(userRank, requiredRank);
  const industrySub = career.industry === userProfile.preferredIndustry ? 100 : 0;
  const interestSub = interestScore(userProfile.interests || [], career.interests);
  const skillSub = skillScore(userProfile.skills || [], career.skills);

  // Weighted combination — each sub-score is already 0–100
  const weighted =
    eduSub * weights.edu +
    industrySub * weights.industry +
    interestSub * weights.interests +
    skillSub * weights.skills;

  const matchPercent = Math.min(Math.round(weighted), 100);

  return { score: matchPercent, matchPercent };
}

// ─── Build a human-readable match reason ──────────────────────────────────
function buildMatchReason(career, userProfile) {
  const matchedInterests = (userProfile.interests || []).filter((i) =>
    career.interests.includes(i)
  );
  const matchedSkills = (userProfile.skills || []).filter((s) =>
    career.skills.includes(s)
  );

  const interestLabels = matchedInterests.map(slugToLabel);
  const skillLabels = matchedSkills.map(slugToLabel);
  const industryLabel = slugToLabel(career.industry);

  const joinNatural = (arr) => {
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];
  };

  const parts = [];
  if (interestLabels.length > 0)
    parts.push(`Matches your interest in ${joinNatural(interestLabels)}`);
  if (skillLabels.length > 0)
    parts.push(`aligns with your skills in ${joinNatural(skillLabels)}`);
  parts.push(`fits well within the ${industryLabel} industry you prefer`);

  const sentence =
    parts[0].charAt(0).toUpperCase() +
    parts[0].slice(1) +
    (parts.length > 1 ? ", " + parts.slice(1).join(", ") : "") +
    ".";

  return sentence;
}

// ─── Main recommendation function ─────────────────────────────────────────
function recommendCareers(userProfile) {
  const scored = careers
    .map((career) => {
      const { score, matchPercent } = scoreCareer(career, userProfile);
      const reason = buildMatchReason(career, userProfile);
      return {
        id: career.id,
        title: career.title,
        description: career.description,
        matchPercent,
        reason,
        growthOutlook: career.growthOutlook,
        salaryRange: career.salaryRange,
        _score: score,
      };
    })
    .filter((c) => c._score > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 5)
    .map(({ _score, ...rest }) => rest);

  return scored;
}

module.exports = { recommendCareers };

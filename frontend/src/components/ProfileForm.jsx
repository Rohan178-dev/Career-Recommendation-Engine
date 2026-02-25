import { useState } from "react";
import CheckboxGroup from "./CheckboxGroup";
import {
    EDUCATION_OPTIONS,
    INDUSTRY_OPTIONS,
    INTEREST_OPTIONS,
    SKILL_OPTIONS,
} from "../data/formOptions";

// ProfileForm.jsx
// Controlled form with four fields. Validates on submit and forwards
// the profile object to the parent (App.js) via the onSubmit prop.
// The reset button wipes all state back to initial values.

const INITIAL_STATE = {
    educationLevel: "",
    interests: [],
    skills: [],
    preferredIndustry: "",
};

export default function ProfileForm({ onSubmit, isLoading }) {
    const [educationLevel, setEducationLevel] = useState("");
    const [interests, setInterests] = useState([]);
    const [skills, setSkills] = useState([]);
    const [preferredIndustry, setPreferredIndustry] = useState("");
    const [errors, setErrors] = useState({});

    function validate() {
        const newErrors = {};
        if (!educationLevel) newErrors.educationLevel = "Please select an education level.";
        if (interests.length === 0) newErrors.interests = "Please select at least one interest.";
        if (skills.length === 0) newErrors.skills = "Please select at least one skill.";
        if (!preferredIndustry) newErrors.preferredIndustry = "Please select a preferred industry.";
        return newErrors;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        onSubmit({ educationLevel, interests, skills, preferredIndustry });
    }

    function handleReset() {
        setEducationLevel("");
        setInterests([]);
        setSkills([]);
        setPreferredIndustry("");
        setErrors({});
    }

    return (
        <form className="profile-form" onSubmit={handleSubmit} noValidate>

            {/* ── Education Level ─────────────────────────────────────────── */}
            <div className="form-field-card">
                <label htmlFor="educationLevel" className="field-label">
                    Education Level
                </label>
                <div className="select-wrapper">
                    <select
                        id="educationLevel"
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        className={errors.educationLevel ? "select-error" : ""}
                    >
                        <option value="">Select your highest qualification</option>
                        {EDUCATION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <span className="select-chevron">&#8964;</span>
                </div>
                {errors.educationLevel && (
                    <p className="field-error">{errors.educationLevel}</p>
                )}
            </div>

            {/* ── Preferred Industry ──────────────────────────────────────── */}
            <div className="form-field-card">
                <label htmlFor="preferredIndustry" className="field-label">
                    Preferred Industry
                </label>
                <div className="select-wrapper">
                    <select
                        id="preferredIndustry"
                        value={preferredIndustry}
                        onChange={(e) => setPreferredIndustry(e.target.value)}
                        className={errors.preferredIndustry ? "select-error" : ""}
                    >
                        <option value="">Select an industry you're drawn to</option>
                        {INDUSTRY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <span className="select-chevron">&#8964;</span>
                </div>
                {errors.preferredIndustry && (
                    <p className="field-error">{errors.preferredIndustry}</p>
                )}
            </div>

            {/* ── Interests ───────────────────────────────────────────────── */}
            <div className="form-field-card">
                <CheckboxGroup
                    label="Your Interests"
                    options={INTEREST_OPTIONS}
                    selected={interests}
                    onChange={setInterests}
                />
                {errors.interests && (
                    <p className="field-error">{errors.interests}</p>
                )}
            </div>

            {/* ── Skills ──────────────────────────────────────────────────── */}
            <div className="form-field-card">
                <CheckboxGroup
                    label="Your Skills"
                    options={SKILL_OPTIONS}
                    selected={skills}
                    onChange={setSkills}
                />
                {errors.skills && (
                    <p className="field-error">{errors.skills}</p>
                )}
            </div>

            {/* ── Actions ─────────────────────────────────────────────────── */}
            <button
                type="submit"
                className="btn-submit"
                disabled={isLoading}
            >
                {isLoading ? "Analysing…" : "Discover My Careers →"}
            </button>

            <button
                type="button"
                className="btn-reset"
                onClick={handleReset}
            >
                Start Over
            </button>

        </form>
    );
}

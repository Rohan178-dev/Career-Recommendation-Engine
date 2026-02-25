// CheckboxGroup.jsx
// Renders a set of pill-shaped toggle buttons for multi-select fields.
// Native <input type="checkbox"> is hidden; visual state is controlled
// purely by className so the design system can fully own the appearance.

export default function CheckboxGroup({ label, options, selected, onChange }) {
    function handleToggle(value) {
        if (selected.includes(value)) {
            // Remove if already selected
            onChange(selected.filter((v) => v !== value));
        } else {
            // Add if not yet selected
            onChange([...selected, value]);
        }
    }

    return (
        <div className="checkbox-group">
            {label && <span className="field-label">{label}</span>}
            <div className="checkbox-list">
                {options.map((option) => {
                    const isChecked = selected.includes(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={`checkbox-item${isChecked ? " checkbox-item--checked" : ""}`}
                            onClick={() => handleToggle(option.value)}
                            aria-pressed={isChecked}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

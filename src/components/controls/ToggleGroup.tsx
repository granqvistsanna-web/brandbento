interface ToggleGroupOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleGroupProps<T extends string> {
  value: T;
  options: ToggleGroupOption<T>[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/**
 * Toggle group for selecting one option from a set.
 * Displays as horizontal button group.
 */
export function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
  label,
  className = '',
}: ToggleGroupProps<T>) {
  return (
    <div className={`toggle-group ${className}`}>
      <span className="toggle-group-label">{label}</span>
      <div
        className="toggle-group-options"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={`toggle-group-option ${
              value === option.value ? 'toggle-group-option-active' : ''
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

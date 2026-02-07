import type { ColorPalette } from '@/types/brand';

interface RoleDropdownProps {
  currentRole: keyof ColorPalette;
  onChange?: (role: keyof ColorPalette) => void;
}

const ROLES: { value: keyof ColorPalette; label: string }[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'accent', label: 'Accent' },
  { value: 'background', label: 'Background' },
  { value: 'text', label: 'Text' },
];

export function RoleDropdown({ currentRole, onChange }: RoleDropdownProps) {
  if (!onChange) {
    // Display-only mode
    return (
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {ROLES.find(r => r.value === currentRole)?.label}
      </span>
    );
  }

  return (
    <select
      value={currentRole}
      onChange={(e) => onChange(e.target.value as keyof ColorPalette)}
      className="text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded cursor-pointer"
    >
      {ROLES.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

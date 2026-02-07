import { useState } from 'react';
import { useCanvasStore } from '@/state/canvasState';
import { ColorSwatch } from '@/components/controls/ColorSwatch';
import { ContrastBadge } from '@/components/controls/ContrastBadge';
import { ColorPicker } from '@/components/pickers/ColorPicker';
import { PalettePresets } from '@/components/pickers/PalettePresets';
import { EditPanel } from '@/components/EditPanel';
import type { ColorPalette } from '@/types/brand';

const ROLE_ORDER: (keyof ColorPalette)[] = ['primary', 'accent', 'background', 'text'];

export function ColorTile() {
  const palette = useCanvasStore(state => state.assets.palette);
  const colors = useCanvasStore(state => state.assets.colors);
  const colorsSource = useCanvasStore(state => state.assets.colorsSource);
  const editingTileId = useCanvasStore(state => state.editingTileId);
  const setEditingTile = useCanvasStore(state => state.setEditingTile);
  const extractionStage = useCanvasStore(state => state.extractionStage);

  const [selectedRole, setSelectedRole] = useState<keyof ColorPalette | null>(null);

  const isEditing = editingTileId === 'colors';
  const isDimmed = editingTileId !== null && !isEditing;
  const isLoading = extractionStage === 'fetching' || extractionStage === 'colors';
  const isDefault = colorsSource === 'default';

  const handleClick = () => {
    setEditingTile(isEditing ? null : 'colors');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setEditingTile(isEditing ? null : 'colors');
    }
    if (e.key === 'Escape' && isEditing) {
      e.preventDefault();
      setEditingTile(null);
    }
  };

  const handleSwatchClick = (role: keyof ColorPalette) => {
    setSelectedRole(role === selectedRole ? null : role);
  };

  const handleClosePicker = () => {
    setSelectedRole(null);
  };

  const handleRoleChange = (newRole: keyof ColorPalette) => {
    setSelectedRole(newRole);
  };

  return (
    <div
      className={`tile tile-colors ${isLoading ? 'tile-loading' : ''} ${
        isDimmed ? 'tile-dimmed' : ''
      } ${isEditing ? 'tile-editing' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDimmed ? -1 : 0}
      role="button"
      aria-label={`Colors tile - ${
        isEditing ? 'press Enter or Escape to close' : 'press Enter to edit'
      }`}
      aria-pressed={isEditing}
    >
      <div className="tile-header">
        <span className="tile-label">Colors</span>
        <ContrastBadge palette={palette} />
      </div>

      <div className="tile-content color-tile-content">
        {/* Color swatches stacked by role */}
        <div className="color-swatches">
          {ROLE_ORDER.map((role) => (
            <ColorSwatch
              key={role}
              color={palette[role]}
              role={role}
              isSelected={selectedRole === role}
              onClick={(e) => {
                if (isEditing) {
                  e.stopPropagation();
                  handleSwatchClick(role);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Frosted glass overlay - only show on hover when not editing */}
      {!isEditing && !isLoading && (
        <div className="tile-overlay">
          <span className="tile-overlay-label">Colors</span>
          <span className="tile-overlay-icon">Edit</span>
        </div>
      )}

      {/* Default indicator */}
      {isDefault && !isEditing && (
        <span className="tile-status absolute top-2 right-2">default</span>
      )}

      {/* Edit panel - inline when editing */}
      {isEditing && (
        <EditPanel title="Colors" onClose={() => setEditingTile(null)}>
          <div className="color-edit-panel" onClick={(e) => e.stopPropagation()}>
            {/* Color picker (shown when swatch selected) */}
            {selectedRole && (
              <div className="color-picker-wrapper mb-4">
                <ColorPicker
                  colorRole={selectedRole}
                  onClose={handleClosePicker}
                  onRoleChange={handleRoleChange}
                />
              </div>
            )}

            {!selectedRole && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                Click a color swatch above to edit it
              </p>
            )}

            {/* Palette presets */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
              <span className="text-xs text-neutral-400 dark:text-neutral-500 mb-2 block">
                Presets
              </span>
              <PalettePresets baseColors={colors} />
            </div>
          </div>
        </EditPanel>
      )}
    </div>
  );
}

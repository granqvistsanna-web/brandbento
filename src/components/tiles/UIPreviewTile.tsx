import { Tile } from '../Tile';

export function UIPreviewTile({
  isLoading,
}: {
  isLoading?: boolean;
}) {
  return (
    <Tile
      isLoading={isLoading}
      isDefault={false}
      label="UI Preview"
      className="tile-ui-preview"
    >
      <div className="ui-preview-placeholder">
        <span>Interface preview</span>
        <span className="ui-preview-hint">Updates as you change brand assets</span>
      </div>
    </Tile>
  );
}

import { Tile } from '../Tile';

export function UIPreviewTile({
  isLoading,
}: {
  isLoading?: boolean;
}) {
  return (
    <Tile
      id="ui-preview"
      isLoading={isLoading}
      isDefault={false}
      label="UI Preview"
      className="tile-ui-preview"
      nonInteractive
    >
      <div className="ui-preview-placeholder">
        <span>Interface preview</span>
        <span className="ui-preview-hint">Updates as you change brand assets</span>
      </div>
    </Tile>
  );
}

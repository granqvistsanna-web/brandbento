interface EditPanelProps {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export function EditPanel({ title, onClose, children }: EditPanelProps) {
  return (
    <div className="edit-panel" role="dialog" aria-label={`Edit ${title}`}>
      <div className="edit-panel-header">
        <span className="edit-panel-title">{title}</span>
        <button
          className="edit-panel-close"
          onClick={(e) => {
            e.stopPropagation(); // Don't trigger tile click
            onClose();
          }}
          aria-label="Close edit panel"
        >
          Done
        </button>
      </div>
      <div className="edit-panel-content">
        {children || (
          <p className="edit-panel-placeholder">
            Edit controls coming in Phase 3
          </p>
        )}
      </div>
    </div>
  );
}

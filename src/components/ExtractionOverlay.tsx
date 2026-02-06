import type { ExtractionStage } from '@/types/brand';

interface ExtractionOverlayProps {
  stage: ExtractionStage;
  error: string | null;
  onDismiss?: () => void;
}

const STAGE_MESSAGES: Record<ExtractionStage, string> = {
  idle: '',
  fetching: 'Fetching',
  colors: 'Extracting colors',
  fonts: 'Extracting typography',
  images: 'Finding imagery',
  logo: 'Detecting logo',
  complete: 'Complete',
  error: 'Could not extract',
};

export function ExtractionOverlay({ stage, error, onDismiss }: ExtractionOverlayProps) {
  if (stage === 'idle' || stage === 'complete') {
    return null;
  }

  return (
    <div className="extraction-overlay">
      <div className="extraction-status">
        {stage === 'error' ? (
          <>
            <p className="extraction-error">{error || 'Something went wrong'}</p>
            {onDismiss && (
              <button onClick={onDismiss} className="extraction-dismiss">
                Continue with defaults
              </button>
            )}
          </>
        ) : (
          <p className="extraction-message">{STAGE_MESSAGES[stage]}</p>
        )}
      </div>
    </div>
  );
}

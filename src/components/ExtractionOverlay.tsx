/**
 * Extraction Overlay Component
 *
 * Full-screen overlay showing brand extraction progress.
 * Displays current stage and handles error states.
 *
 * ## Features
 *
 * - Shows extraction stage with friendly messages
 * - Error state with dismiss option
 * - Auto-hides on idle/complete stages
 * - "Continue with defaults" fallback option
 *
 * @component
 * @example
 * <ExtractionOverlay
 *   stage={extractionStage}
 *   error={extractionError}
 *   onDismiss={() => setStage('idle')}
 * />
 */
import type { ExtractionStage } from '@/types/brand';

/**
 * Props for ExtractionOverlay component.
 */
interface ExtractionOverlayProps {
  /** Current extraction stage */
  stage: ExtractionStage;
  /** Error message if extraction failed */
  error: string | null;
  /** Callback to dismiss error and continue with defaults */
  onDismiss?: () => void;
}

/** User-friendly messages for each extraction stage */
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

/**
 * Extraction progress overlay.
 * Returns null when idle or complete.
 */
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

import { useCallback, useState, useRef } from 'react';
import { useTemporalStore } from '@/state/canvasState';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * Slider with undo batching - pauses undo tracking during drag,
 * resumes on release for a single undo step per drag operation.
 */
export function Slider({
  value,
  min,
  max,
  step = 1,
  label,
  onChange,
  formatValue = (v) => `${v}%`,
  className = '',
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const pausedRef = useRef(false);
  const temporal = useTemporalStore();

  const handleStart = useCallback(() => {
    setIsDragging(true);
    // Pause undo tracking at drag start
    if (!pausedRef.current) {
      temporal.pause();
      pausedRef.current = true;
    }
  }, [temporal]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    // Resume undo tracking at drag end (single undo step)
    if (pausedRef.current) {
      temporal.resume();
      pausedRef.current = true;
    }
  }, [temporal]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`slider-control ${className}`}>
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{formatValue(value)}</span>
      </div>
      <div className="slider-track-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          className="slider-input"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          style={
            {
              '--slider-progress': `${percentage}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';

interface URLInputProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export function URLInput({ onSubmit, disabled, initialValue = '' }: URLInputProps) {
  const [url, setUrl] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    let fullUrl = trimmed;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      fullUrl = 'https://' + trimmed;
    }

    try {
      new URL(fullUrl);
      onSubmit(fullUrl);
    } catch {
      setError('Please enter a valid URL');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="url-input-form">
      <div className="url-input-wrapper">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., stripe.com)"
          disabled={disabled}
          className="url-input"
          aria-label="Website URL"
        />
        <button
          type="submit"
          disabled={disabled || !url.trim()}
          className="url-submit-button"
        >
          {disabled ? 'Extracting...' : 'Extract Brand'}
        </button>
      </div>
      {error && <p className="url-input-error">{error}</p>}
    </form>
  );
}

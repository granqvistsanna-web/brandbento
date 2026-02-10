import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SwatchTile } from '../SwatchTile';

/* ── Mocks ───────────────────────────────────────────── */

// Make useShallow a passthrough so the mock store works correctly
vi.mock('zustand/react/shallow', () => ({
  useShallow: <T,>(selector: T) => selector,
}));

const mockColors = {
  bg: '#FFFFFF',
  text: '#171717',
  primary: '#0000CC',
  accent: '#CC0000',
  surface: '#F5F5F5',
  surfaces: ['#F5F5F5', '#E0E0E0', '#D0D0D0'],
  paletteColors: [],
};

const mockTypography = {
  primary: 'Inter',
  secondary: 'Inter',
  ui: 'Inter',
  scale: 1.25,
  baseSize: 16,
  weightHeadline: '700',
  weightBody: '400',
  letterSpacing: 'normal' as const,
};

const mockState = {
  brand: { colors: mockColors, typography: mockTypography },
  tileSurfaces: {},
  focusedTileId: null,
};

vi.mock('@/store/useBrandStore', () => {
  const store = (selector: (s: typeof mockState) => unknown) => selector(mockState);
  store.getState = () => mockState;
  return { useBrandStore: store };
});

vi.mock('@/hooks/useGoogleFonts', () => ({
  useGoogleFonts: () => ({
    fontFamily: '"Inter", sans-serif',
    loading: false,
    error: null,
    loadFont: vi.fn(),
  }),
}));

/* ── Tests ───────────────────────────────────────────── */

describe('SwatchTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('chips variant (default)', () => {
    it('renders the "Palette" section label', () => {
      render(<SwatchTile />);
      expect(screen.getByText('Palette')).toBeInTheDocument();
    });

    it('renders all five color role labels', () => {
      render(<SwatchTile />);
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Accent')).toBeInTheDocument();
      expect(screen.getByText('Surface')).toBeInTheDocument();
      expect(screen.getByText('BG')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('renders without crashing', () => {
      const { container } = render(<SwatchTile />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('bars variant', () => {
    it('renders Surface, Primary, and Accent labels', () => {
      render(<SwatchTile variant="bars" />);
      expect(screen.getByText('Surface')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Accent')).toBeInTheDocument();
    });

    it('renders hex color values in bars', () => {
      render(<SwatchTile variant="bars" />);
      expect(screen.getByText('#F5F5F5')).toBeInTheDocument();
    });

    it('does not render "Palette" label in bars mode', () => {
      render(<SwatchTile variant="bars" />);
      expect(screen.queryByText('Palette')).not.toBeInTheDocument();
    });
  });
});

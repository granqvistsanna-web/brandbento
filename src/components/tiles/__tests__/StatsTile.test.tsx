import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { StatsTile } from '../StatsTile';

/* ── Mocks ───────────────────────────────────────────── */

vi.mock('zustand/react/shallow', () => ({
  useShallow: <T,>(selector: T) => selector,
}));

const mockColors = {
  bg: '#FFFFFF',
  text: '#171717',
  primary: '#0000CC',
  accent: '#CC0000',
  surface: '#F5F5F5',
  surfaces: ['#F5F5F5', '#E0E0E0'],
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
  tiles: [],
  tileSurfaces: {},
  focusedTileId: null,
  updateTile: vi.fn(),
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

vi.mock('@/hooks/useTileToolbar', () => ({
  useTileToolbar: () => ({
    isFocused: false,
    containerRef: { current: null },
    anchorRect: null,
  }),
}));

vi.mock('@/config/placements', () => ({
  getPlacementTileId: () => undefined,
  getPlacementTileType: () => undefined,
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

/* ── Tests ───────────────────────────────────────────── */

describe('StatsTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<StatsTile />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders a stat value with headline font weight', () => {
    const { container } = render(<StatsTile />);
    const statEl = container.querySelector('[style*="font-weight: 700"]');
    expect(statEl).toBeInTheDocument();
    expect(statEl?.textContent).toBeTruthy();
  });

  it('renders an uppercase label element', () => {
    const { container } = render(<StatsTile />);
    const labelEl = container.querySelector('[style*="text-transform: uppercase"]');
    expect(labelEl).toBeInTheDocument();
  });

  it('renders a detail text element with low opacity', () => {
    const { container } = render(<StatsTile />);
    const detailEl = container.querySelector('[style*="opacity: 0.38"]');
    expect(detailEl).toBeInTheDocument();
    expect(detailEl?.textContent).toBeTruthy();
  });

  it('applies background color', () => {
    const { container } = render(<StatsTile />);
    const root = container.firstChild as HTMLElement;
    const bgStyle = root.getAttribute('style') || '';
    expect(bgStyle).toContain('background-color');
  });
});

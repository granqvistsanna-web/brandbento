import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogoTile } from '../LogoTile';

/* ── Mocks ───────────────────────────────────────────── */

vi.mock('zustand/react/shallow', () => ({
  useShallow: <T,>(selector: T) => selector,
}));

const mockBrand = {
  logo: { text: 'ACME', image: null as string | null, padding: 16, size: 32 },
  colors: {
    bg: '#FFFFFF',
    text: '#171717',
    primary: '#0000CC',
    accent: '#CC0000',
    surface: '#F5F5F5',
    surfaces: ['#F5F5F5', '#E0E0E0'],
    paletteColors: [],
  },
  typography: {
    primary: 'Inter',
    secondary: 'Inter',
    ui: 'Inter',
    scale: 1.25,
    baseSize: 16,
    weightHeadline: '700',
    weightBody: '400',
    letterSpacing: 'normal' as const,
  },
};

const mockState = {
  brand: mockBrand,
  tileSurfaces: {},
  focusedTileId: null,
  updateBrand: vi.fn(),
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

/* ── Tests ───────────────────────────────────────────── */

describe('LogoTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBrand.logo.text = 'ACME';
    mockBrand.logo.image = null;
  });

  it('renders wordmark text when logo has text', () => {
    render(<LogoTile />);
    expect(screen.getByText('ACME')).toBeInTheDocument();
  });

  it('renders fallback "BRAND" when logo text is empty', () => {
    mockBrand.logo.text = '';
    render(<LogoTile />);
    expect(screen.getByText('BRAND')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<LogoTile />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders an img when logo image is set', () => {
    mockBrand.logo.image = 'data:image/png;base64,ABC123';
    render(<LogoTile />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/png;base64,ABC123');
  });

  it('uses alt text from logo text when image is set', () => {
    mockBrand.logo.image = 'data:image/png;base64,ABC123';
    render(<LogoTile />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'ACME');
  });

  it('uses "Brand logo" alt when text is empty and image is set', () => {
    mockBrand.logo.image = 'data:image/png;base64,ABC123';
    mockBrand.logo.text = '';
    render(<LogoTile />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Brand logo');
  });
});

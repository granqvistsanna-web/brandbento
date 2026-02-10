/**
 * Centralized industry-specific copy for tile components.
 * Each preset provides default content for tiles that show text.
 * Tiles fall back to 'default' if their active preset isn't found.
 */

export interface EditorialPresetContent {
  pretitle: string;
  title: string;
  body: string;
  detail: string;
}

export interface OverlayPresetContent {
  label: string;
  headline: string;
  body: string;
}

export interface SplitHeroPresetContent {
  headline: string;
  body: string;
  cta: string;
}

export interface MenuPresetContent {
  subcopy: string;
  items: string[];
  action: string;
}

export interface SplitListPresetContent {
  brandLabel: string;
  headline: string;
  listHeading: string;
  items: string[];
}

interface PresetContent {
  editorial: EditorialPresetContent;
  overlay: OverlayPresetContent;
  splitHero: SplitHeroPresetContent;
  menu: MenuPresetContent;
  splitList: SplitListPresetContent;
}

const TILE_PRESET_CONTENT: Record<string, PresetContent> = {
  default: {
    editorial: {
      pretitle: 'Studio Notes',
      title: 'Make the thing you wish existed.',
      body: 'A clear brand system for ideas that are ready to ship.',
      detail: 'No. 01',
    },
    overlay: {
      label: 'About Us',
      headline: 'The Winter Collection',
      body: 'Garments and products so essential that they merge into the wholeness of our lives.',
    },
    splitHero: {
      headline: 'Defining Style',
      body: 'A fusion of creativity and craftsmanship. We bring timeless pieces that elevate everyday design.',
      cta: 'Read More',
    },
    menu: {
      subcopy: 'Explore',
      items: ['Services', 'Portfolio', 'Contact'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Studio',
      headline: 'Design\nParadigm',
      listHeading: 'Core Services',
      items: ['Brand Identity Systems', 'Digital Experience Design', 'Creative Direction'],
    },
  },
  techStartup: {
    editorial: {
      pretitle: 'Product',
      title: 'Ship smarter updates, faster.',
      body: 'Turn complex product news into crisp, confident stories.',
      detail: 'Vol. II',
    },
    overlay: {
      label: 'Product Launch',
      headline: 'Next Generation Platform',
      body: 'Infrastructure designed for the teams that move fastest.',
    },
    splitHero: {
      headline: 'Built Different',
      body: 'Engineering meets design. Products that redefine what users expect from modern software.',
      cta: 'Explore',
    },
    menu: {
      subcopy: 'Explore',
      items: ['Platform', 'Pricing', 'Docs'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Platform',
      headline: 'Tech\nForward',
      listHeading: 'Core Stack',
      items: ['Distributed Computing', 'Real-time Analytics', 'Edge Deployment'],
    },
  },
  luxuryRetail: {
    editorial: {
      pretitle: 'Atelier',
      title: 'Elevate the everyday.',
      body: 'An understated brand system with room for the extraordinary.',
      detail: 'SS 26',
    },
    overlay: {
      label: 'New Season',
      headline: 'The Winter Collection',
      body: 'Garments and products so essential that they merge into the wholeness of our lives.',
    },
    splitHero: {
      headline: 'Defining Style',
      body: 'A fusion of creativity and craftsmanship. We bring timeless pieces that elevate everyday fashion.',
      cta: 'Read More',
    },
    menu: {
      subcopy: 'Discover',
      items: ['Collection', 'Lookbook', 'Atelier'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Atelier',
      headline: 'Fashion\nParadigm',
      listHeading: 'Textiles Production',
      items: ['Automated Fabric Cutting', 'Eco-Friendly Dyeing', 'Supply Chain Optimization'],
    },
  },
  communityNonprofit: {
    editorial: {
      pretitle: 'Mission',
      title: 'Bring people into the story.',
      body: 'Warm, human-first design that makes the mission easy to join.',
      detail: 'Ch. 01',
    },
    overlay: {
      label: 'Our Mission',
      headline: 'Building Bridges',
      body: 'Creating spaces where every community member can thrive and grow together.',
    },
    splitHero: {
      headline: 'Stronger Together',
      body: 'Community-driven impact that creates lasting change. Every voice matters, every action counts.',
      cta: 'Join Us',
    },
    menu: {
      subcopy: 'Our work',
      items: ['Programs', 'Impact', 'Get Involved'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Foundation',
      headline: 'Impact\nReport',
      listHeading: 'Key Programs',
      items: ['Youth Development', 'Community Health', 'Education Access'],
    },
  },
  creativeStudio: {
    editorial: {
      pretitle: 'Manifesto',
      title: 'Make bold work feel effortless.',
      body: 'A flexible system for briefs, pitches, and launches.',
      detail: 'Issue 04',
    },
    overlay: {
      label: 'Case Study',
      headline: 'The Creative Process',
      body: 'Behind every great project is a story of obsession, revision, and breakthrough.',
    },
    splitHero: {
      headline: 'Make It Real',
      body: 'From concept to craft. We shape ideas into work that moves people and shifts culture.',
      cta: 'See Work',
    },
    menu: {
      subcopy: 'Selected',
      items: ['Work', 'Process', 'Studio'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Studio',
      headline: 'Creative\nProcess',
      listHeading: 'Disciplines',
      items: ['Brand Strategy', 'Motion Design', 'Art Direction'],
    },
  },
  spread: {
    editorial: {
      pretitle: 'Cuisine',
      title: 'Samba sweetness.',
      body: 'Succulent and bold, a dessert that captures bite.',
      detail: 'Pg. 12',
    },
    overlay: {
      label: 'The Kitchen',
      headline: 'Farm to Table',
      body: 'Sourced with intention, prepared with care. Every plate tells a story of provenance.',
    },
    splitHero: {
      headline: 'Pure Flavor',
      body: 'Seasonal ingredients, bold combinations. Every dish is a story of origin and craft.',
      cta: 'Our Menu',
    },
    menu: {
      subcopy: 'Currently featuring',
      items: ['Breakfast', 'Brunch', 'Seasonal'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Kitchen',
      headline: 'Seasonal\nMenu',
      listHeading: 'Sourcing',
      items: ['Local Partnerships', 'Organic Produce', 'Zero-Waste Kitchen'],
    },
  },
};

/** Get preset content with 'default' fallback */
export function getPresetContent(preset: string): PresetContent {
  return TILE_PRESET_CONTENT[preset] ?? TILE_PRESET_CONTENT.default;
}

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
      pretitle: 'Field Notes',
      title: 'Your brand has a point of view.',
      body: 'Good brands don\u2019t whisper. They walk in and everyone just knows.',
      detail: 'No. 01',
    },
    overlay: {
      label: 'The Edit',
      headline: 'Less, But Better',
      body: 'The things worth keeping feel like they were always there.',
    },
    splitHero: {
      headline: 'Start With Why Not',
      body: 'Great brands start with a question nobody thought to ask.',
      cta: 'See How',
    },
    menu: {
      subcopy: 'Start here',
      items: ['Services', 'Portfolio', 'Contact'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Studio',
      headline: 'What\nWe Do',
      listHeading: 'Our Craft',
      items: ['Brand Identity Systems', 'Digital Experience Design', 'Creative Direction'],
    },
  },
  techStartup: {
    editorial: {
      pretitle: 'Product',
      title: 'We build tools people actually want to use.',
      body: 'No onboarding tutorial needed. Just open it and go.',
      detail: 'v2.0',
    },
    overlay: {
      label: 'Now Live',
      headline: 'Shipping Is a Feature',
      body: 'Your best ideas shouldn\u2019t sit in a backlog.',
    },
    splitHero: {
      headline: 'Built for Builders',
      body: 'Clean APIs, zero hand-holding. The DX you\u2019ve been waiting for.',
      cta: 'Try It',
    },
    menu: {
      subcopy: 'Jump in',
      items: ['Platform', 'Pricing', 'Docs'],
      action: 'Open',
    },
    splitList: {
      brandLabel: 'Platform',
      headline: 'Under\nthe Hood',
      listHeading: 'Core Stack',
      items: ['Distributed Computing', 'Real-time Analytics', 'Edge Deployment'],
    },
  },
  luxuryRetail: {
    editorial: {
      pretitle: 'Atelier',
      title: 'Quality you feel before you see.',
      body: 'You pick it up, and you just know.',
      detail: 'SS 26',
    },
    overlay: {
      label: 'New Season',
      headline: 'Quiet Luxury, Loud Confidence',
      body: 'Pieces you reach for every morning without thinking.',
    },
    splitHero: {
      headline: 'Made to Last',
      body: 'Not trend-proof. Trend-irrelevant. For people who choose.',
      cta: 'Explore',
    },
    menu: {
      subcopy: 'Browse',
      items: ['Collection', 'Lookbook', 'Atelier'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Atelier',
      headline: 'Craft\n& Care',
      listHeading: 'How It\u2019s Made',
      items: ['Small-Batch Production', 'Natural Dyes Only', 'Transparent Sourcing'],
    },
  },
  communityNonprofit: {
    editorial: {
      pretitle: 'Dispatch',
      title: 'This isn\u2019t about awareness. It\u2019s about showing up.',
      body: 'Real impact starts with real people. Not a campaign\u2014a conversation.',
      detail: 'Ch. 01',
    },
    overlay: {
      label: 'Our Story',
      headline: 'Neighbors First',
      body: 'Big change starts small. A knock on a door. A seat at the table.',
    },
    splitHero: {
      headline: 'People Over Presentations',
      body: 'No jargon. We show up, and we stick around.',
      cta: 'Get Involved',
    },
    menu: {
      subcopy: 'Our work',
      items: ['Programs', 'Impact', 'Get Involved'],
      action: 'See',
    },
    splitList: {
      brandLabel: 'Foundation',
      headline: 'Where\nIt Counts',
      listHeading: 'Focus Areas',
      items: ['Youth Mentorship', 'Neighborhood Health', 'Learning Access'],
    },
  },
  creativeStudio: {
    editorial: {
      pretitle: 'Manifesto',
      title: 'Good work speaks for itself. Great work won\u2019t shut up.',
      body: 'We make the kind of projects that keep you up at night\u2014in a good way.',
      detail: 'Issue 04',
    },
    overlay: {
      label: 'Case Study',
      headline: 'The Messy Middle',
      body: 'Every portfolio shows the finish line. We\u2019re here for the all-nighter.',
    },
    splitHero: {
      headline: 'Less Deck, More Doing',
      body: 'Strategy is great. Shipping is better.',
      cta: 'See Work',
    },
    menu: {
      subcopy: 'Selected',
      items: ['Work', 'Process', 'Studio'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Studio',
      headline: 'How We\nWork',
      listHeading: 'Disciplines',
      items: ['Brand Strategy', 'Motion & Film', 'Art Direction'],
    },
  },
  spread: {
    editorial: {
      pretitle: 'From the Pass',
      title: 'Every plate has a point of view.',
      body: 'Good food doesn\u2019t need a story. Ours has one anyway.',
      detail: 'Pg. 12',
    },
    overlay: {
      label: 'The Kitchen',
      headline: 'Ingredient-First, Always',
      body: 'We let the produce do the talking.',
    },
    splitHero: {
      headline: 'Come Hungry',
      body: 'Seasonal plates, zero fuss. Close-your-eyes-on-the-first-bite good.',
      cta: 'See Menu',
    },
    menu: {
      subcopy: 'On the table now',
      items: ['Breakfast', 'Brunch', 'Seasonal'],
      action: 'View',
    },
    splitList: {
      brandLabel: 'Kitchen',
      headline: 'Where It\nComes From',
      listHeading: 'Our Sourcing',
      items: ['Local Farm Partners', 'Organic Everything', 'Zero-Waste Kitchen'],
    },
  },
};

/** Get preset content with 'default' fallback */
export function getPresetContent(preset: string): PresetContent {
  return TILE_PRESET_CONTENT[preset] ?? TILE_PRESET_CONTENT.default;
}

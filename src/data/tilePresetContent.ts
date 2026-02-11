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
  headline: string;
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

export interface MessagingPresetContent {
  headline: string;
}


export interface BusinessCardPresetContent {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  website: string;
}

export interface StoryPresetContent {
  headline: string;
  body: string;
  cta: string;
}

interface PresetContent {
  editorial: EditorialPresetContent;
  overlay: OverlayPresetContent;
  splitHero: SplitHeroPresetContent;
  menu: MenuPresetContent;
  splitList: SplitListPresetContent;
  messaging: MessagingPresetContent;

  businessCard: BusinessCardPresetContent;
  story: StoryPresetContent;
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
      headline: 'Less, But Better',
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
    messaging: {
      headline: 'Your brand has a voice. Use it before someone else does.',
    },

    businessCard: {
      name: 'Jessica Smith',
      title: 'Marketing Manager',
      email: 'jessica@studio.co',
      phone: '+1 (555) 234-5678',
      address: '10/349 Edward Street\nNorth Melbourne VIC 3051',
      website: 'studio.co',
    },
    story: {
      headline: 'Start With Why Not',
      body: 'Great brands start with a question nobody thought to ask. This is yours.',
      cta: 'Learn More',
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
      headline: 'Shipping Is a Feature',
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
    messaging: {
      headline: 'We build the infrastructure so you can build what matters.',
    },

    businessCard: {
      name: 'Kai Chen',
      title: 'Head of Product',
      email: 'kai@linear.dev',
      phone: '+1 (415) 555-0142',
      address: '548 Market Street\nSan Francisco CA 94104',
      website: 'linear.dev',
    },
    story: {
      headline: 'Your workflow, automated.',
      body: 'Set it up once. Let it run forever. No code required.',
      cta: 'Try Free',
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
      headline: 'Quiet Luxury, Loud Confidence',
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
    messaging: {
      headline: 'True luxury is the freedom to choose less.',
    },

    businessCard: {
      name: 'Élodie Laurent',
      title: 'Creative Director',
      email: 'elodie@maisonverre.com',
      phone: '+33 1 42 56 78 90',
      address: '24 Rue du Faubourg\nSaint-Honoré, Paris 75008',
      website: 'maisonverre.com',
    },
    story: {
      headline: 'The new collection is here.',
      body: 'Crafted by hand, designed to last. Limited availability.',
      cta: 'Shop Now',
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
      headline: 'Neighbors First',
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
    messaging: {
      headline: 'Every neighborhood deserves a seat at the table.',
    },

    businessCard: {
      name: 'Maya Johnson',
      title: 'Program Director',
      email: 'maya@openground.org',
      phone: '+1 (312) 555-0198',
      address: '1440 W. Division Street\nChicago IL 60642',
      website: 'openground.org',
    },
    story: {
      headline: 'Real change starts here.',
      body: 'Join 2,000+ neighbors building something that lasts.',
      cta: 'Get Involved',
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
      headline: 'The Messy Middle',
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
    messaging: {
      headline: 'We don\u2019t make pretty things. We make things that move people.',
    },

    businessCard: {
      name: 'Jordan Reeves',
      title: 'Co-Founder / ECD',
      email: 'jordan@commonera.co',
      phone: '+1 (646) 555-0177',
      address: '87 Richardson Street\nBrooklyn NY 11249',
      website: 'commonera.co',
    },
    story: {
      headline: 'This one took six months.',
      body: 'Behind every overnight success is a studio that didn\u2019t sleep.',
      cta: 'See Work',
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
      headline: 'Ingredient-First, Always',
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
    messaging: {
      headline: 'Good food starts with good people. Everything else follows.',
    },

    businessCard: {
      name: 'Rosa Martínez',
      title: 'Head Chef & Owner',
      email: 'rosa@terratable.co',
      phone: '+61 3 9555 1234',
      address: '18 Hardware Lane\nMelbourne VIC 3000',
      website: 'terratable.co',
    },
    story: {
      headline: 'Come hungry. Leave happy.',
      body: 'Seasonal plates, zero fuss. Close-your-eyes-on-the-first-bite good.',
      cta: 'See Menu',
    },
  },
};

/** Get preset content with 'default' fallback */
export function getPresetContent(preset: string): PresetContent {
  return TILE_PRESET_CONTENT[preset] ?? TILE_PRESET_CONTENT.default;
}

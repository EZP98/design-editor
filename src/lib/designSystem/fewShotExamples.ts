/**
 * Few-Shot Examples for AI Design Generation
 *
 * IMPORTANT: These are STRUCTURAL examples only!
 * They teach the AI the correct JSON structure and layout patterns.
 * Content (headlines, colors, images) MUST be adapted to user's topic.
 */

export interface FewShotExample {
  id: string;
  category: 'landing' | 'portfolio' | 'saas' | 'ecommerce' | 'blog';
  style: string;
  userPrompt: string;
  structure: string; // Description of structure, NOT full JSON
  sections: string[]; // List of sections to include
  layoutNotes: string; // Key layout patterns
}

// ============================================
// STRUCTURAL EXAMPLES
// ============================================

export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  // ============================
  // EXAMPLE 1: SaaS Landing Page
  // ============================
  {
    id: 'saas-landing-dark',
    category: 'saas',
    style: 'Dark Theme',
    userPrompt: 'Landing page for AI tool',
    structure: `
STRUCTURE:
1. Navbar (row): Logo left, nav links center, CTA buttons right
2. Hero (column, centered): Badge, large headline (48-64px), subheadline, 2 CTA buttons
3. Features (column): Section header + 3-column grid of feature cards
4. Stats (row): 3 stat numbers with labels
5. CTA (column): Gradient background, headline, CTA button
6. Footer (row): Copyright left, links right

LAYOUT PATTERN:
- Root frame: direction=column, gap=0
- Sections: width=fill, padding=64-100px
- Hero content: max-width 800px, centered
- Feature cards: equal width (fill), gap=24-32px
`,
    sections: ['navbar', 'hero', 'features', 'stats', 'cta', 'footer'],
    layoutNotes: 'Dark background (#0D0D0D), white text, indigo accents',
  },

  // ============================
  // EXAMPLE 2: Portfolio Hero
  // ============================
  {
    id: 'portfolio-hero-minimal',
    category: 'portfolio',
    style: 'Minimal Light',
    userPrompt: 'Portfolio hero section',
    structure: `
STRUCTURE:
1. Hero (row): Text content left (60%), Image right (40%)
   - Text content (column): Eyebrow label, Large name (64-72px), Bio text, CTA buttons
   - Profile image: fixed width 400-500px, rounded corners

LAYOUT PATTERN:
- Hero: direction=row, gap=80px, padding=80-120px
- Text side: direction=column, gap=32px, align=start
- Image: sizing.width=fixed, fixedWidth=450
`,
    sections: ['hero'],
    layoutNotes: 'White background, black text, minimal accents',
  },

  // ============================
  // EXAMPLE 3: Pricing Section
  // ============================
  {
    id: 'pricing-section',
    category: 'saas',
    style: 'Gradient Glass',
    userPrompt: 'Pricing section with 3 plans',
    structure: `
STRUCTURE:
1. Section header (column, centered): Headline, subheadline
2. Cards row (row): 3 equal-width pricing cards
   - Each card (column):
     - Plan name
     - Price (large number + period)
     - Features list (column of text items)
     - CTA button

LAYOUT PATTERN:
- Pricing cards row: direction=row, gap=24px
- Each card: sizing.width=fill (auto equal width)
- Middle card: highlighted with different bg/border
`,
    sections: ['pricing-header', 'pricing-cards'],
    layoutNotes: 'Gradient background, glass effect cards (backdrop blur)',
  },

  // ============================
  // EXAMPLE 4: Restaurant Hero
  // ============================
  {
    id: 'restaurant-hero',
    category: 'landing',
    style: 'Warm Elegant',
    userPrompt: 'Restaurant landing page',
    structure: `
STRUCTURE:
1. Full-screen hero (column, centered):
   - Badge/label (small uppercase)
   - Restaurant name (large, elegant)
   - Tagline
   - CTA buttons
   - Background: dark with warm tones or image

LAYOUT PATTERN:
- Hero: min-height screen height, centered content
- Text stack: gap=24px, align=center
- Warm colors: burgundy, gold, cream tones
`,
    sections: ['hero'],
    layoutNotes: 'Dark warm background, elegant typography, gold accents',
  },

  // ============================
  // EXAMPLE 5: Wine/Luxury
  // ============================
  {
    id: 'wine-landing',
    category: 'landing',
    style: 'Wine Luxury',
    userPrompt: 'Wine brand landing',
    structure: `
STRUCTURE:
1. Hero (column or split):
   - Headline about wine heritage/quality
   - Subheadline with story
   - CTA buttons
   - Optional: Featured wine image

2. Collection section (column):
   - Section title
   - Grid of wine cards (image + name + description)

LAYOUT PATTERN:
- Colors: burgundy (#722F37), gold (#C9A227), cream (#F5F5DC), dark (#1A0F10)
- Typography: Elegant, generous spacing
- Images: Wine bottles, vineyards, glasses
`,
    sections: ['hero', 'collection'],
    layoutNotes: 'Burgundy/gold palette, elegant serif-style headlines, wine imagery',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getExamplesByCategory(category: string): FewShotExample[] {
  return FEW_SHOT_EXAMPLES.filter(e => e.category === category);
}

export function getExamplesByStyle(style: string): FewShotExample[] {
  return FEW_SHOT_EXAMPLES.filter(e => e.style.toLowerCase().includes(style.toLowerCase()));
}

export function getExampleById(id: string): FewShotExample | undefined {
  return FEW_SHOT_EXAMPLES.find(e => e.id === id);
}

/**
 * Format examples for AI prompt - STRUCTURAL ONLY
 * No full JSON to prevent literal copying
 */
export function formatExamplesForPrompt(examples: FewShotExample[]): string {
  return examples.map(e => `
=== ${e.style.toUpperCase()} ===
Request type: "${e.userPrompt}"

${e.structure}

Sections: ${e.sections.join(' → ')}
Notes: ${e.layoutNotes}
`).join('\n---\n');
}

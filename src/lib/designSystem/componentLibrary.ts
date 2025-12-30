/**
 * Component Library
 *
 * Pre-designed, beautiful component blocks that AI can assemble to create pages.
 * Each component is a complete JSON structure ready for the canvas.
 */

// ============================================
// COMPONENT TYPES
// ============================================

// Use a flexible type for component elements since they're templates
// that will be converted to proper CanvasElement with IDs when added to canvas
export type ComponentElement = {
  type: string;
  name?: string;
  content?: string;
  src?: string;
  href?: string;
  sizing?: {
    width?: string;
    height?: string;
    fixedWidth?: number;
    fixedHeight?: number;
  };
  layout?: {
    direction?: string;
    gap?: number;
    padding?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    align?: string;
    justify?: string;
    alignSelf?: string;
  };
  styles?: Record<string, unknown>;
  children?: ComponentElement[];
};

export interface ComponentBlock {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  tags: string[];
  previewImage?: string;
  // The actual element structure - uses flexible type for templates
  element: ComponentElement;
}

export type ComponentCategory =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'footer'
  | 'navbar'
  | 'cards'
  | 'forms'
  | 'stats'
  | 'team'
  | 'logos'
  | 'faq'
  | 'contact';

// ============================================
// HERO COMPONENTS
// ============================================

export const HERO_CENTERED_DARK: ComponentBlock = {
  id: 'hero-centered-dark',
  name: 'Hero Centered Dark',
  category: 'hero',
  description: 'Centered hero with gradient text and CTA buttons',
  tags: ['hero', 'dark', 'centered', 'gradient'],
  element: {
    type: 'container',
    name: 'Hero Section',
    sizing: { width: 'fill', height: 'fit' },
    layout: { direction: 'column', gap: 0, align: 'stretch', justify: 'start' },
    styles: {
      backgroundColor: '#0D0D0D',
      paddingTop: 120,
      paddingBottom: 120,
      paddingLeft: 24,
      paddingRight: 24,
    },
    children: [
      {
        type: 'container',
        name: 'Hero Content',
        sizing: { width: 'fixed', height: 'fit', fixedWidth: 800 },
        layout: { direction: 'column', gap: 32, align: 'center', justify: 'start' },
        styles: { marginLeft: 'auto', marginRight: 'auto' },
        children: [
          {
            type: 'container',
            name: 'Badge',
            sizing: { width: 'fit', height: 'fit' },
            layout: { direction: 'row', gap: 8, align: 'center', justify: 'center' },
            styles: {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: 20,
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 16,
              paddingRight: 16,
              borderWidth: 1,
              borderColor: 'rgba(99, 102, 241, 0.2)',
            },
            children: [
              {
                type: 'text',
                name: 'Badge Text',
                content: 'Now Available',
                sizing: { width: 'fit', height: 'fit' },
                styles: {
                  color: '#818CF8',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: 0.5,
                },
              },
            ],
          },
          {
            type: 'text',
            name: 'Headline',
            content: 'Build beautiful products faster than ever',
            sizing: { width: 'fill', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2,
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            name: 'Subheadline',
            content: 'The modern design platform for teams who want to create stunning interfaces without the complexity. Start free, scale as you grow.',
            sizing: { width: 'fixed', height: 'fit', fixedWidth: 600 },
            styles: {
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.6,
              textAlign: 'center',
            },
          },
          {
            type: 'container',
            name: 'CTA Buttons',
            sizing: { width: 'fit', height: 'fit' },
            layout: { direction: 'row', gap: 16, align: 'center', justify: 'center' },
            children: [
              {
                type: 'button',
                name: 'Primary CTA',
                content: 'Start for Free',
                sizing: { width: 'fit', height: 'fit' },
                styles: {
                  backgroundColor: '#FFFFFF',
                  color: '#0D0D0D',
                  fontSize: 15,
                  fontWeight: 600,
                  paddingTop: 14,
                  paddingBottom: 14,
                  paddingLeft: 28,
                  paddingRight: 28,
                  borderRadius: 10,
                },
              },
              {
                type: 'button',
                name: 'Secondary CTA',
                content: 'Watch Demo',
                sizing: { width: 'fit', height: 'fit' },
                styles: {
                  backgroundColor: 'transparent',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: 15,
                  fontWeight: 500,
                  paddingTop: 14,
                  paddingBottom: 14,
                  paddingLeft: 28,
                  paddingRight: 28,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

export const HERO_SPLIT_IMAGE: ComponentBlock = {
  id: 'hero-split-image',
  name: 'Hero Split with Image',
  category: 'hero',
  description: 'Hero with text on left and image on right',
  tags: ['hero', 'split', 'image', 'dark'],
  element: {
    type: 'container',
    name: 'Hero Section',
    sizing: { width: 'fill', height: 'fit' },
    layout: { direction: 'row', gap: 64, align: 'center', justify: 'space-between' },
    styles: {
      backgroundColor: '#0A0A0A',
      paddingTop: 100,
      paddingBottom: 100,
      paddingLeft: 80,
      paddingRight: 80,
    },
    children: [
      {
        type: 'container',
        name: 'Text Content',
        sizing: { width: 'fill', height: 'fit' },
        layout: { direction: 'column', gap: 28, align: 'start', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Eyebrow',
            content: 'INTRODUCING DESIGN AI',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: '#6366F1',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
            },
          },
          {
            type: 'text',
            name: 'Headline',
            content: 'Design without limits.',
            sizing: { width: 'fill', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1.5,
            },
          },
          {
            type: 'text',
            name: 'Description',
            content: 'Create stunning websites, apps, and prototypes with our AI-powered design platform. No coding required.',
            sizing: { width: 'fill', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.6,
            },
          },
          {
            type: 'container',
            name: 'Buttons',
            sizing: { width: 'fit', height: 'fit' },
            layout: { direction: 'row', gap: 12, align: 'center', justify: 'start' },
            children: [
              {
                type: 'button',
                name: 'Primary Button',
                content: 'Get Started',
                sizing: { width: 'fit', height: 'fit' },
                styles: {
                  backgroundColor: '#6366F1',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 24,
                  paddingRight: 24,
                  borderRadius: 8,
                },
              },
              {
                type: 'button',
                name: 'Secondary Button',
                content: 'Learn More',
                sizing: { width: 'fit', height: 'fit' },
                styles: {
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  paddingTop: 12,
                  paddingBottom: 12,
                  paddingLeft: 24,
                  paddingRight: 24,
                },
              },
            ],
          },
        ],
      },
      {
        type: 'image',
        name: 'Hero Image',
        src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
        sizing: { width: 'fill', height: 'fit' },
        styles: {
          borderRadius: 16,
          objectFit: 'cover',
        },
      },
    ],
  },
};

// ============================================
// FEATURE COMPONENTS
// ============================================

export const FEATURES_GRID_3COL: ComponentBlock = {
  id: 'features-grid-3col',
  name: 'Features Grid 3 Columns',
  category: 'features',
  description: 'Three-column feature grid with icons',
  tags: ['features', 'grid', '3-column', 'icons'],
  element: {
    type: 'container',
    name: 'Features Section',
    sizing: { width: 'fill', height: 'fit' },
    layout: { direction: 'column', gap: 64, align: 'center', justify: 'start' },
    styles: {
      backgroundColor: '#0D0D0D',
      paddingTop: 100,
      paddingBottom: 100,
      paddingLeft: 80,
      paddingRight: 80,
    },
    children: [
      {
        type: 'container',
        name: 'Section Header',
        sizing: { width: 'fixed', height: 'fit', fixedWidth: 600 },
        layout: { direction: 'column', gap: 16, align: 'center', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Section Title',
            content: 'Everything you need',
            sizing: { width: 'fill', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'center',
              letterSpacing: -1,
            },
          },
          {
            type: 'text',
            name: 'Section Description',
            content: 'Powerful features to help you design, prototype, and ship products faster.',
            sizing: { width: 'fill', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.5,
              textAlign: 'center',
            },
          },
        ],
      },
      {
        type: 'container',
        name: 'Features Grid',
        sizing: { width: 'fill', height: 'fit' },
        layout: { direction: 'row', gap: 32, align: 'stretch', justify: 'center' },
        children: [
          {
            type: 'container',
            name: 'Feature 1',
            sizing: { width: 'fill', height: 'fit' },
            layout: { direction: 'column', gap: 16, align: 'start', justify: 'start' },
            styles: {
              backgroundColor: '#171717',
              borderRadius: 16,
              paddingTop: 32,
              paddingBottom: 32,
              paddingLeft: 28,
              paddingRight: 28,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.06)',
            },
            children: [
              {
                type: 'container',
                name: 'Icon Container',
                sizing: { width: 'fixed', height: 'fixed', fixedWidth: 48, fixedHeight: 48 },
                layout: { direction: 'row', gap: 0, align: 'center', justify: 'center' },
                styles: {
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  borderRadius: 12,
                },
                children: [
                  {
                    type: 'text',
                    name: 'Icon',
                    content: '⚡',
                    sizing: { width: 'fit', height: 'fit' },
                    styles: { fontSize: 24 },
                  },
                ],
              },
              {
                type: 'text',
                name: 'Feature Title',
                content: 'Lightning Fast',
                sizing: { width: 'fill', height: 'fit' },
                styles: {
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.3,
                },
              },
              {
                type: 'text',
                name: 'Feature Description',
                content: 'Built for speed. Our platform renders designs in milliseconds, not seconds.',
                sizing: { width: 'fill', height: 'fit' },
                styles: {
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.55,
                },
              },
            ],
          },
          {
            type: 'container',
            name: 'Feature 2',
            sizing: { width: 'fill', height: 'fit' },
            layout: { direction: 'column', gap: 16, align: 'start', justify: 'start' },
            styles: {
              backgroundColor: '#171717',
              borderRadius: 16,
              paddingTop: 32,
              paddingBottom: 32,
              paddingLeft: 28,
              paddingRight: 28,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.06)',
            },
            children: [
              {
                type: 'container',
                name: 'Icon Container',
                sizing: { width: 'fixed', height: 'fixed', fixedWidth: 48, fixedHeight: 48 },
                layout: { direction: 'row', gap: 0, align: 'center', justify: 'center' },
                styles: {
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  borderRadius: 12,
                },
                children: [
                  {
                    type: 'text',
                    name: 'Icon',
                    content: '🎨',
                    sizing: { width: 'fit', height: 'fit' },
                    styles: { fontSize: 24 },
                  },
                ],
              },
              {
                type: 'text',
                name: 'Feature Title',
                content: 'Beautiful Design',
                sizing: { width: 'fill', height: 'fit' },
                styles: {
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.3,
                },
              },
              {
                type: 'text',
                name: 'Feature Description',
                content: 'Crafted with attention to every detail. Create stunning visuals effortlessly.',
                sizing: { width: 'fill', height: 'fit' },
                styles: {
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.55,
                },
              },
            ],
          },
          {
            type: 'container',
            name: 'Feature 3',
            sizing: { width: 'fill', height: 'fit' },
            layout: { direction: 'column', gap: 16, align: 'start', justify: 'start' },
            styles: {
              backgroundColor: '#171717',
              borderRadius: 16,
              paddingTop: 32,
              paddingBottom: 32,
              paddingLeft: 28,
              paddingRight: 28,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.06)',
            },
            children: [
              {
                type: 'container',
                name: 'Icon Container',
                sizing: { width: 'fixed', height: 'fixed', fixedWidth: 48, fixedHeight: 48 },
                layout: { direction: 'row', gap: 0, align: 'center', justify: 'center' },
                styles: {
                  backgroundColor: 'rgba(251, 146, 60, 0.15)',
                  borderRadius: 12,
                },
                children: [
                  {
                    type: 'text',
                    name: 'Icon',
                    content: '🔒',
                    sizing: { width: 'fit', height: 'fit' },
                    styles: { fontSize: 24 },
                  },
                ],
              },
              {
                type: 'text',
                name: 'Feature Title',
                content: 'Secure by Default',
                sizing: { width: 'fill', height: 'fit' },
                styles: {
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.3,
                },
              },
              {
                type: 'text',
                name: 'Feature Description',
                content: 'Enterprise-grade security. Your designs are protected with industry-leading encryption.',
                sizing: { width: 'fill', height: 'fit' },
                styles: {
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: 1.55,
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

// ============================================
// TESTIMONIALS COMPONENTS
// ============================================

export const TESTIMONIAL_CARD: ComponentBlock = {
  id: 'testimonial-card',
  name: 'Testimonial Card',
  category: 'testimonials',
  description: 'Single testimonial with avatar and quote',
  tags: ['testimonial', 'card', 'quote', 'avatar'],
  element: {
    type: 'container',
    name: 'Testimonial Card',
    sizing: { width: 'fixed', height: 'fit', fixedWidth: 400 },
    layout: { direction: 'column', gap: 24, align: 'start', justify: 'start' },
    styles: {
      backgroundColor: '#171717',
      borderRadius: 20,
      paddingTop: 32,
      paddingBottom: 32,
      paddingLeft: 32,
      paddingRight: 32,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    children: [
      {
        type: 'text',
        name: 'Quote',
        content: '"This is hands down the best design tool I\'ve ever used. It\'s changed how our entire team works."',
        sizing: { width: 'fill', height: 'fit' },
        styles: {
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: 400,
          lineHeight: 1.6,
          fontStyle: 'italic',
        },
      },
      {
        type: 'container',
        name: 'Author Info',
        sizing: { width: 'fill', height: 'fit' },
        layout: { direction: 'row', gap: 16, align: 'center', justify: 'start' },
        children: [
          {
            type: 'image',
            name: 'Avatar',
            src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
            sizing: { width: 'fixed', height: 'fixed', fixedWidth: 48, fixedHeight: 48 },
            styles: {
              borderRadius: 24,
              objectFit: 'cover',
            },
          },
          {
            type: 'container',
            name: 'Author Details',
            sizing: { width: 'fill', height: 'fit' },
            layout: { direction: 'column', gap: 4, align: 'start', justify: 'start' },
            children: [
              {
                type: 'text',
                name: 'Author Name',
                content: 'Sarah Chen',
                sizing: { width: 'fill', height: 'fit' },
                styles: {
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 600,
                },
              },
              {
                type: 'text',
                name: 'Author Role',
                content: 'Design Lead at Vercel',
                sizing: { width: 'fill', height: 'fit' },
                styles: {
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 14,
                  fontWeight: 400,
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

// ============================================
// PRICING COMPONENTS
// ============================================

export const PRICING_CARD_HIGHLIGHTED: ComponentBlock = {
  id: 'pricing-card-highlighted',
  name: 'Pricing Card Highlighted',
  category: 'pricing',
  description: 'Pricing card with highlighted popular plan',
  tags: ['pricing', 'card', 'popular', 'highlighted'],
  element: {
    type: 'container',
    name: 'Pricing Card',
    sizing: { width: 'fixed', height: 'fit', fixedWidth: 360 },
    layout: { direction: 'column', gap: 24, align: 'stretch', justify: 'start' },
    styles: {
      backgroundColor: '#171717',
      borderRadius: 20,
      paddingTop: 32,
      paddingBottom: 32,
      paddingLeft: 28,
      paddingRight: 28,
      borderWidth: 2,
      borderColor: '#6366F1',
      position: 'relative',
    },
    children: [
      {
        type: 'container',
        name: 'Popular Badge',
        sizing: { width: 'fit', height: 'fit' },
        layout: { direction: 'row', gap: 0, align: 'center', justify: 'center' },
        styles: {
          backgroundColor: '#6366F1',
          borderRadius: 6,
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 12,
          paddingRight: 12,
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: -48,
          marginBottom: 8,
        },
        children: [
          {
            type: 'text',
            name: 'Badge Text',
            content: 'Most Popular',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.5,
            },
          },
        ],
      },
      {
        type: 'container',
        name: 'Plan Info',
        sizing: { width: 'fill', height: 'fit' },
        layout: { direction: 'column', gap: 8, align: 'start', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Plan Name',
            content: 'Pro',
            sizing: { width: 'fill', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 24,
              fontWeight: 700,
            },
          },
          {
            type: 'text',
            name: 'Plan Description',
            content: 'For growing teams and businesses',
            sizing: { width: 'fill', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 15,
              fontWeight: 400,
            },
          },
        ],
      },
      {
        type: 'container',
        name: 'Price',
        sizing: { width: 'fill', height: 'fit' },
        layout: { direction: 'row', gap: 4, align: 'baseline', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Price Value',
            content: '$49',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: -1,
            },
          },
          {
            type: 'text',
            name: 'Price Period',
            content: '/month',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 16,
              fontWeight: 400,
            },
          },
        ],
      },
      {
        type: 'container',
        name: 'Features List',
        sizing: { width: 'fill', height: 'fit' },
        layout: { direction: 'column', gap: 12, align: 'start', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Feature 1',
            content: '✓  Unlimited projects',
            sizing: { width: 'fill', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, fontWeight: 400 },
          },
          {
            type: 'text',
            name: 'Feature 2',
            content: '✓  Advanced analytics',
            sizing: { width: 'fill', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, fontWeight: 400 },
          },
          {
            type: 'text',
            name: 'Feature 3',
            content: '✓  Priority support',
            sizing: { width: 'fill', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, fontWeight: 400 },
          },
          {
            type: 'text',
            name: 'Feature 4',
            content: '✓  Custom integrations',
            sizing: { width: 'fill', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, fontWeight: 400 },
          },
          {
            type: 'text',
            name: 'Feature 5',
            content: '✓  Team collaboration',
            sizing: { width: 'fill', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, fontWeight: 400 },
          },
        ],
      },
      {
        type: 'button',
        name: 'CTA Button',
        content: 'Get Started',
        sizing: { width: 'fill', height: 'fit' },
        styles: {
          backgroundColor: '#6366F1',
          color: '#FFFFFF',
          fontSize: 15,
          fontWeight: 600,
          paddingTop: 14,
          paddingBottom: 14,
          borderRadius: 10,
          textAlign: 'center',
        },
      },
    ],
  },
};

// ============================================
// CTA COMPONENTS
// ============================================

export const CTA_GRADIENT: ComponentBlock = {
  id: 'cta-gradient',
  name: 'CTA with Gradient',
  category: 'cta',
  description: 'Call-to-action section with gradient background',
  tags: ['cta', 'gradient', 'call-to-action'],
  element: {
    type: 'container',
    name: 'CTA Section',
    sizing: { width: 'fill', height: 'fit' },
    layout: { direction: 'column', gap: 32, align: 'center', justify: 'center' },
    styles: {
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingTop: 80,
      paddingBottom: 80,
      paddingLeft: 40,
      paddingRight: 40,
      borderRadius: 24,
    },
    children: [
      {
        type: 'text',
        name: 'CTA Headline',
        content: 'Ready to get started?',
        sizing: { width: 'fill', height: 'fit' },
        styles: {
          color: '#FFFFFF',
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1.2,
          textAlign: 'center',
          letterSpacing: -1,
        },
      },
      {
        type: 'text',
        name: 'CTA Description',
        content: 'Join thousands of creators already building with our platform.',
        sizing: { width: 'fixed', height: 'fit', fixedWidth: 500 },
        styles: {
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 18,
          fontWeight: 400,
          lineHeight: 1.5,
          textAlign: 'center',
        },
      },
      {
        type: 'container',
        name: 'CTA Buttons',
        sizing: { width: 'fit', height: 'fit' },
        layout: { direction: 'row', gap: 16, align: 'center', justify: 'center' },
        children: [
          {
            type: 'button',
            name: 'Primary CTA',
            content: 'Start Free Trial',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              backgroundColor: '#FFFFFF',
              color: '#764ba2',
              fontSize: 15,
              fontWeight: 600,
              paddingTop: 14,
              paddingBottom: 14,
              paddingLeft: 32,
              paddingRight: 32,
              borderRadius: 10,
            },
          },
          {
            type: 'button',
            name: 'Secondary CTA',
            content: 'Contact Sales',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              backgroundColor: 'transparent',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 500,
              paddingTop: 14,
              paddingBottom: 14,
              paddingLeft: 32,
              paddingRight: 32,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
          },
        ],
      },
    ],
  },
};

// ============================================
// FOOTER COMPONENTS
// ============================================

export const FOOTER_SIMPLE: ComponentBlock = {
  id: 'footer-simple',
  name: 'Simple Footer',
  category: 'footer',
  description: 'Minimal footer with links and copyright',
  tags: ['footer', 'simple', 'minimal'],
  element: {
    type: 'container',
    name: 'Footer',
    sizing: { width: 'fill', height: 'fit' },
    layout: { direction: 'column', gap: 32, align: 'stretch', justify: 'start' },
    styles: {
      backgroundColor: '#0A0A0A',
      paddingTop: 64,
      paddingBottom: 32,
      paddingLeft: 80,
      paddingRight: 80,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.06)',
    },
    children: [
      {
        type: 'container',
        name: 'Footer Content',
        sizing: { width: 'fill', height: 'fit' },
        layout: { direction: 'row', gap: 80, align: 'start', justify: 'space-between' },
        children: [
          {
            type: 'container',
            name: 'Brand Column',
            sizing: { width: 'fill', height: 'fit' },
            layout: { direction: 'column', gap: 16, align: 'start', justify: 'start' },
            children: [
              {
                type: 'text',
                name: 'Brand',
                content: 'Acme Inc.',
                sizing: { width: 'fit', height: 'fit' },
                styles: {
                  color: '#FFFFFF',
                  fontSize: 20,
                  fontWeight: 700,
                },
              },
              {
                type: 'text',
                name: 'Tagline',
                content: 'Building the future of design.',
                sizing: { width: 'fit', height: 'fit' },
                styles: {
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: 14,
                  fontWeight: 400,
                },
              },
            ],
          },
          {
            type: 'container',
            name: 'Links Column 1',
            sizing: { width: 'fit', height: 'fit' },
            layout: { direction: 'column', gap: 12, align: 'start', justify: 'start' },
            children: [
              {
                type: 'text',
                name: 'Column Title',
                content: 'Product',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: '#FFFFFF', fontSize: 14, fontWeight: 600 },
              },
              {
                type: 'link',
                name: 'Link 1',
                content: 'Features',
                href: '#',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 400 },
              },
              {
                type: 'link',
                name: 'Link 2',
                content: 'Pricing',
                href: '#',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 400 },
              },
              {
                type: 'link',
                name: 'Link 3',
                content: 'Changelog',
                href: '#',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 400 },
              },
            ],
          },
          {
            type: 'container',
            name: 'Links Column 2',
            sizing: { width: 'fit', height: 'fit' },
            layout: { direction: 'column', gap: 12, align: 'start', justify: 'start' },
            children: [
              {
                type: 'text',
                name: 'Column Title',
                content: 'Company',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: '#FFFFFF', fontSize: 14, fontWeight: 600 },
              },
              {
                type: 'link',
                name: 'Link 1',
                content: 'About',
                href: '#',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 400 },
              },
              {
                type: 'link',
                name: 'Link 2',
                content: 'Blog',
                href: '#',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 400 },
              },
              {
                type: 'link',
                name: 'Link 3',
                content: 'Careers',
                href: '#',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 400 },
              },
            ],
          },
          {
            type: 'container',
            name: 'Links Column 3',
            sizing: { width: 'fit', height: 'fit' },
            layout: { direction: 'column', gap: 12, align: 'start', justify: 'start' },
            children: [
              {
                type: 'text',
                name: 'Column Title',
                content: 'Legal',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: '#FFFFFF', fontSize: 14, fontWeight: 600 },
              },
              {
                type: 'link',
                name: 'Link 1',
                content: 'Privacy',
                href: '#',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 400 },
              },
              {
                type: 'link',
                name: 'Link 2',
                content: 'Terms',
                href: '#',
                sizing: { width: 'fit', height: 'fit' },
                styles: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 400 },
              },
            ],
          },
        ],
      },
      {
        type: 'container',
        name: 'Copyright Row',
        sizing: { width: 'fill', height: 'fit' },
        layout: { direction: 'row', gap: 0, align: 'center', justify: 'center' },
        styles: {
          paddingTop: 32,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.06)',
        },
        children: [
          {
            type: 'text',
            name: 'Copyright',
            content: '© 2024 Acme Inc. All rights reserved.',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: 13,
              fontWeight: 400,
            },
          },
        ],
      },
    ],
  },
};

// ============================================
// NAVBAR COMPONENTS
// ============================================

export const NAVBAR_TRANSPARENT: ComponentBlock = {
  id: 'navbar-transparent',
  name: 'Transparent Navbar',
  category: 'navbar',
  description: 'Floating transparent navigation bar',
  tags: ['navbar', 'transparent', 'floating'],
  element: {
    type: 'container',
    name: 'Navbar',
    sizing: { width: 'fill', height: 'fit' },
    layout: { direction: 'row', gap: 0, align: 'center', justify: 'space-between' },
    styles: {
      backgroundColor: 'rgba(10, 10, 10, 0.8)',
      backdropFilter: 'blur(20px)',
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 24,
      paddingRight: 24,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    children: [
      {
        type: 'text',
        name: 'Logo',
        content: 'Acme',
        sizing: { width: 'fit', height: 'fit' },
        styles: {
          color: '#FFFFFF',
          fontSize: 20,
          fontWeight: 700,
        },
      },
      {
        type: 'container',
        name: 'Nav Links',
        sizing: { width: 'fit', height: 'fit' },
        layout: { direction: 'row', gap: 32, align: 'center', justify: 'center' },
        children: [
          {
            type: 'link',
            name: 'Link 1',
            content: 'Features',
            href: '#',
            sizing: { width: 'fit', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 500 },
          },
          {
            type: 'link',
            name: 'Link 2',
            content: 'Pricing',
            href: '#',
            sizing: { width: 'fit', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 500 },
          },
          {
            type: 'link',
            name: 'Link 3',
            content: 'Docs',
            href: '#',
            sizing: { width: 'fit', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 500 },
          },
          {
            type: 'link',
            name: 'Link 4',
            content: 'Blog',
            href: '#',
            sizing: { width: 'fit', height: 'fit' },
            styles: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 500 },
          },
        ],
      },
      {
        type: 'container',
        name: 'CTA Buttons',
        sizing: { width: 'fit', height: 'fit' },
        layout: { direction: 'row', gap: 12, align: 'center', justify: 'end' },
        children: [
          {
            type: 'button',
            name: 'Login',
            content: 'Log in',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              fontWeight: 500,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 16,
              paddingRight: 16,
            },
          },
          {
            type: 'button',
            name: 'Signup',
            content: 'Sign up',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              backgroundColor: '#FFFFFF',
              color: '#0A0A0A',
              fontSize: 14,
              fontWeight: 600,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 20,
              paddingRight: 20,
              borderRadius: 8,
            },
          },
        ],
      },
    ],
  },
};

// ============================================
// STATS COMPONENTS
// ============================================

export const STATS_ROW: ComponentBlock = {
  id: 'stats-row',
  name: 'Stats Row',
  category: 'stats',
  description: 'Horizontal stats display with numbers',
  tags: ['stats', 'numbers', 'metrics'],
  element: {
    type: 'container',
    name: 'Stats Section',
    sizing: { width: 'fill', height: 'fit' },
    layout: { direction: 'row', gap: 0, align: 'center', justify: 'space-around' },
    styles: {
      backgroundColor: '#0D0D0D',
      paddingTop: 64,
      paddingBottom: 64,
      paddingLeft: 40,
      paddingRight: 40,
    },
    children: [
      {
        type: 'container',
        name: 'Stat 1',
        sizing: { width: 'fit', height: 'fit' },
        layout: { direction: 'column', gap: 8, align: 'center', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Stat Number',
            content: '10M+',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: -1,
            },
          },
          {
            type: 'text',
            name: 'Stat Label',
            content: 'Active Users',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 15,
              fontWeight: 400,
            },
          },
        ],
      },
      {
        type: 'container',
        name: 'Stat 2',
        sizing: { width: 'fit', height: 'fit' },
        layout: { direction: 'column', gap: 8, align: 'center', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Stat Number',
            content: '500K+',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: -1,
            },
          },
          {
            type: 'text',
            name: 'Stat Label',
            content: 'Projects Created',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 15,
              fontWeight: 400,
            },
          },
        ],
      },
      {
        type: 'container',
        name: 'Stat 3',
        sizing: { width: 'fit', height: 'fit' },
        layout: { direction: 'column', gap: 8, align: 'center', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Stat Number',
            content: '99.9%',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: -1,
            },
          },
          {
            type: 'text',
            name: 'Stat Label',
            content: 'Uptime SLA',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 15,
              fontWeight: 400,
            },
          },
        ],
      },
      {
        type: 'container',
        name: 'Stat 4',
        sizing: { width: 'fit', height: 'fit' },
        layout: { direction: 'column', gap: 8, align: 'center', justify: 'start' },
        children: [
          {
            type: 'text',
            name: 'Stat Number',
            content: '150+',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: '#FFFFFF',
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: -1,
            },
          },
          {
            type: 'text',
            name: 'Stat Label',
            content: 'Countries',
            sizing: { width: 'fit', height: 'fit' },
            styles: {
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 15,
              fontWeight: 400,
            },
          },
        ],
      },
    ],
  },
};

// ============================================
// EXPORT ALL COMPONENTS
// ============================================

export const COMPONENT_LIBRARY: ComponentBlock[] = [
  // Heroes
  HERO_CENTERED_DARK,
  HERO_SPLIT_IMAGE,
  // Features
  FEATURES_GRID_3COL,
  // Testimonials
  TESTIMONIAL_CARD,
  // Pricing
  PRICING_CARD_HIGHLIGHTED,
  // CTAs
  CTA_GRADIENT,
  // Footers
  FOOTER_SIMPLE,
  // Navbars
  NAVBAR_TRANSPARENT,
  // Stats
  STATS_ROW,
];

export function getComponentById(id: string): ComponentBlock | undefined {
  return COMPONENT_LIBRARY.find(c => c.id === id);
}

export function getComponentsByCategory(category: ComponentCategory): ComponentBlock[] {
  return COMPONENT_LIBRARY.filter(c => c.category === category);
}

export function searchComponents(query: string): ComponentBlock[] {
  const lowerQuery = query.toLowerCase();
  return COMPONENT_LIBRARY.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

export function getAllCategories(): ComponentCategory[] {
  return [...new Set(COMPONENT_LIBRARY.map(c => c.category))];
}

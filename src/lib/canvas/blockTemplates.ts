/**
 * Block Templates
 *
 * Semantic blocks that create complete structures with children.
 * Each block generates a hierarchy of elements when added.
 */

import { ElementType, ElementStyles, Size } from './types';

export interface BlockChild {
  type: ElementType;
  name: string;
  content?: string;
  size?: Size;
  styles?: Partial<ElementStyles>;
  children?: BlockChild[];
}

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  rootType: ElementType;
  rootStyles: Partial<ElementStyles>;
  rootSize: Size;
  children: BlockChild[];
}

// ============================================================================
// Block Templates
// ============================================================================

export const BLOCK_TEMPLATES: Record<string, BlockTemplate> = {
  // Navbar Block
  navbar: {
    id: 'navbar',
    name: 'Navbar',
    description: 'Navigation header with logo and links',
    rootType: 'section',
    rootSize: { width: 1200, height: 80 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 24,
      backgroundColor: '#ffffff',
    },
    children: [
      {
        type: 'text',
        name: 'Logo',
        content: 'Brand',
        size: { width: 100, height: 32 },
        styles: {
          fontSize: 24,
          fontWeight: 700,
          color: '#1a1a1a',
        },
      },
      {
        type: 'row',
        name: 'Nav Links',
        size: { width: 400, height: 40 },
        styles: {
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          alignItems: 'center',
        },
        children: [
          { type: 'link', name: 'Link 1', content: 'Home', styles: { color: '#1a1a1a', fontSize: 14 } },
          { type: 'link', name: 'Link 2', content: 'About', styles: { color: '#666', fontSize: 14 } },
          { type: 'link', name: 'Link 3', content: 'Work', styles: { color: '#666', fontSize: 14 } },
          { type: 'link', name: 'Link 4', content: 'Contact', styles: { color: '#666', fontSize: 14 } },
        ],
      },
      {
        type: 'button',
        name: 'CTA Button',
        content: 'Get Started',
        size: { width: 120, height: 44 },
        styles: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          borderRadius: 22,
          fontSize: 14,
          fontWeight: 500,
        },
      },
    ],
  },

  // Hero Block
  hero: {
    id: 'hero',
    name: 'Hero Section',
    description: 'Hero with heading, text and CTA buttons',
    rootType: 'section',
    rootSize: { width: 1200, height: 600 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 80,
      backgroundColor: '#fafafa',
      gap: 32,
    },
    children: [
      {
        type: 'text',
        name: 'Badge',
        content: '✨ Now Available',
        size: { width: 150, height: 32 },
        styles: {
          fontSize: 14,
          color: '#666',
          backgroundColor: '#fff',
          padding: 8,
          borderRadius: 16,
          textAlign: 'center',
        },
      },
      {
        type: 'text',
        name: 'Heading',
        content: 'Build beautiful websites faster',
        size: { width: 800, height: 80 },
        styles: {
          fontSize: 64,
          fontWeight: 700,
          color: '#1a1a1a',
          textAlign: 'center',
          lineHeight: 1.1,
        },
      },
      {
        type: 'text',
        name: 'Subheading',
        content: 'Create stunning designs with our visual editor. No coding required.',
        size: { width: 600, height: 48 },
        styles: {
          fontSize: 18,
          color: '#666',
          textAlign: 'center',
          lineHeight: 1.6,
        },
      },
      {
        type: 'row',
        name: 'CTA Buttons',
        size: { width: 300, height: 52 },
        styles: {
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        children: [
          {
            type: 'button',
            name: 'Primary CTA',
            content: 'Get Started',
            size: { width: 140, height: 52 },
            styles: {
              backgroundColor: '#8B1E2B',
              color: '#fff',
              borderRadius: 26,
              fontSize: 16,
              fontWeight: 600,
            },
          },
          {
            type: 'button',
            name: 'Secondary CTA',
            content: 'Learn More',
            size: { width: 140, height: 52 },
            styles: {
              backgroundColor: 'transparent',
              color: '#1a1a1a',
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 26,
              fontSize: 16,
              fontWeight: 500,
            },
          },
        ],
      },
    ],
  },

  // Features Block
  features: {
    id: 'features',
    name: 'Features Grid',
    description: '3-column feature cards',
    rootType: 'section',
    rootSize: { width: 1200, height: 500 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 80,
      backgroundColor: '#ffffff',
      gap: 48,
    },
    children: [
      {
        type: 'text',
        name: 'Section Title',
        content: 'Features',
        size: { width: 400, height: 48 },
        styles: {
          fontSize: 40,
          fontWeight: 700,
          color: '#1a1a1a',
          textAlign: 'center',
        },
      },
      {
        type: 'grid',
        name: 'Features Grid',
        size: { width: 1040, height: 300 },
        styles: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
        },
        children: [
          {
            type: 'frame',
            name: 'Feature 1',
            size: { width: 320, height: 280 },
            styles: {
              display: 'flex',
              flexDirection: 'column',
              padding: 32,
              backgroundColor: '#f9fafb',
              borderRadius: 16,
              gap: 16,
            },
            children: [
              { type: 'text', name: 'Icon', content: '⚡', styles: { fontSize: 32 } },
              { type: 'text', name: 'Title', content: 'Fast & Easy', styles: { fontSize: 20, fontWeight: 600, color: '#1a1a1a' } },
              { type: 'text', name: 'Description', content: 'Build websites in minutes, not hours. Our intuitive interface makes design simple.', styles: { fontSize: 14, color: '#666', lineHeight: 1.6 } },
            ],
          },
          {
            type: 'frame',
            name: 'Feature 2',
            size: { width: 320, height: 280 },
            styles: {
              display: 'flex',
              flexDirection: 'column',
              padding: 32,
              backgroundColor: '#f9fafb',
              borderRadius: 16,
              gap: 16,
            },
            children: [
              { type: 'text', name: 'Icon', content: '🎨', styles: { fontSize: 32 } },
              { type: 'text', name: 'Title', content: 'Beautiful Design', styles: { fontSize: 20, fontWeight: 600, color: '#1a1a1a' } },
              { type: 'text', name: 'Description', content: 'Pre-built components and templates to create stunning websites.', styles: { fontSize: 14, color: '#666', lineHeight: 1.6 } },
            ],
          },
          {
            type: 'frame',
            name: 'Feature 3',
            size: { width: 320, height: 280 },
            styles: {
              display: 'flex',
              flexDirection: 'column',
              padding: 32,
              backgroundColor: '#f9fafb',
              borderRadius: 16,
              gap: 16,
            },
            children: [
              { type: 'text', name: 'Icon', content: '🚀', styles: { fontSize: 32 } },
              { type: 'text', name: 'Title', content: 'Export Code', styles: { fontSize: 20, fontWeight: 600, color: '#1a1a1a' } },
              { type: 'text', name: 'Description', content: 'Export clean, production-ready React code for your projects.', styles: { fontSize: 14, color: '#666', lineHeight: 1.6 } },
            ],
          },
        ],
      },
    ],
  },

  // CTA Block
  cta: {
    id: 'cta',
    name: 'CTA Section',
    description: 'Call-to-action banner',
    rootType: 'section',
    rootSize: { width: 1200, height: 300 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 64,
      backgroundColor: '#8B1E2B',
      borderRadius: 24,
      gap: 24,
    },
    children: [
      {
        type: 'text',
        name: 'CTA Heading',
        content: 'Ready to get started?',
        size: { width: 600, height: 56 },
        styles: {
          fontSize: 40,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      {
        type: 'text',
        name: 'CTA Text',
        content: 'Join thousands of creators building with our platform.',
        size: { width: 500, height: 32 },
        styles: {
          fontSize: 18,
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
        },
      },
      {
        type: 'button',
        name: 'CTA Button',
        content: 'Start Free Trial',
        size: { width: 180, height: 52 },
        styles: {
          backgroundColor: '#ffffff',
          color: '#8B1E2B',
          borderRadius: 26,
          fontSize: 16,
          fontWeight: 600,
        },
      },
    ],
  },

  // Footer Block
  footer: {
    id: 'footer',
    name: 'Footer',
    description: 'Page footer with links',
    rootType: 'section',
    rootSize: { width: 1200, height: 200 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: 48,
      backgroundColor: '#1a1a1a',
      gap: 64,
    },
    children: [
      {
        type: 'stack',
        name: 'Brand',
        size: { width: 250, height: 100 },
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        },
        children: [
          { type: 'text', name: 'Logo', content: 'Brand', styles: { fontSize: 24, fontWeight: 700, color: '#fff' } },
          { type: 'text', name: 'Tagline', content: 'Building the future of design.', styles: { fontSize: 14, color: '#888' } },
        ],
      },
      {
        type: 'row',
        name: 'Links',
        size: { width: 600, height: 100 },
        styles: {
          display: 'flex',
          flexDirection: 'row',
          gap: 64,
        },
        children: [
          {
            type: 'stack',
            name: 'Product',
            styles: { display: 'flex', flexDirection: 'column', gap: 8 },
            children: [
              { type: 'text', name: 'Title', content: 'Product', styles: { fontSize: 14, fontWeight: 600, color: '#fff' } },
              { type: 'link', name: 'Link 1', content: 'Features', styles: { color: '#888', fontSize: 14 } },
              { type: 'link', name: 'Link 2', content: 'Pricing', styles: { color: '#888', fontSize: 14 } },
            ],
          },
          {
            type: 'stack',
            name: 'Company',
            styles: { display: 'flex', flexDirection: 'column', gap: 8 },
            children: [
              { type: 'text', name: 'Title', content: 'Company', styles: { fontSize: 14, fontWeight: 600, color: '#fff' } },
              { type: 'link', name: 'Link 1', content: 'About', styles: { color: '#888', fontSize: 14 } },
              { type: 'link', name: 'Link 2', content: 'Blog', styles: { color: '#888', fontSize: 14 } },
            ],
          },
          {
            type: 'stack',
            name: 'Legal',
            styles: { display: 'flex', flexDirection: 'column', gap: 8 },
            children: [
              { type: 'text', name: 'Title', content: 'Legal', styles: { fontSize: 14, fontWeight: 600, color: '#fff' } },
              { type: 'link', name: 'Link 1', content: 'Privacy', styles: { color: '#888', fontSize: 14 } },
              { type: 'link', name: 'Link 2', content: 'Terms', styles: { color: '#888', fontSize: 14 } },
            ],
          },
        ],
      },
    ],
  },

  // Pricing Block
  pricing: {
    id: 'pricing',
    name: 'Pricing',
    description: 'Pricing cards',
    rootType: 'section',
    rootSize: { width: 1200, height: 600 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 80,
      backgroundColor: '#fafafa',
      gap: 48,
    },
    children: [
      {
        type: 'text',
        name: 'Section Title',
        content: 'Simple Pricing',
        size: { width: 400, height: 48 },
        styles: {
          fontSize: 40,
          fontWeight: 700,
          color: '#1a1a1a',
          textAlign: 'center',
        },
      },
      {
        type: 'row',
        name: 'Pricing Cards',
        size: { width: 800, height: 400 },
        styles: {
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          alignItems: 'stretch',
        },
        children: [
          {
            type: 'frame',
            name: 'Basic Plan',
            size: { width: 380, height: 380 },
            styles: {
              display: 'flex',
              flexDirection: 'column',
              padding: 32,
              backgroundColor: '#fff',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#eee',
              gap: 24,
            },
            children: [
              { type: 'text', name: 'Plan', content: 'Basic', styles: { fontSize: 20, fontWeight: 600, color: '#1a1a1a' } },
              { type: 'text', name: 'Price', content: '$19/mo', styles: { fontSize: 48, fontWeight: 700, color: '#1a1a1a' } },
              { type: 'text', name: 'Features', content: '• 5 projects\n• Basic support\n• 1GB storage', styles: { fontSize: 14, color: '#666', lineHeight: 2 } },
              { type: 'button', name: 'CTA', content: 'Get Started', styles: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 8 } },
            ],
          },
          {
            type: 'frame',
            name: 'Pro Plan',
            size: { width: 380, height: 380 },
            styles: {
              display: 'flex',
              flexDirection: 'column',
              padding: 32,
              backgroundColor: '#8B1E2B',
              borderRadius: 16,
              gap: 24,
            },
            children: [
              { type: 'text', name: 'Plan', content: 'Pro', styles: { fontSize: 20, fontWeight: 600, color: '#fff' } },
              { type: 'text', name: 'Price', content: '$49/mo', styles: { fontSize: 48, fontWeight: 700, color: '#fff' } },
              { type: 'text', name: 'Features', content: '• Unlimited projects\n• Priority support\n• 100GB storage', styles: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 2 } },
              { type: 'button', name: 'CTA', content: 'Get Started', styles: { backgroundColor: '#fff', color: '#8B1E2B', borderRadius: 8 } },
            ],
          },
        ],
      },
    ],
  },

  // Testimonials Block
  testimonials: {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews',
    rootType: 'section',
    rootSize: { width: 1200, height: 400 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 80,
      backgroundColor: '#fff',
      gap: 48,
    },
    children: [
      {
        type: 'text',
        name: 'Section Title',
        content: 'What People Say',
        size: { width: 400, height: 48 },
        styles: {
          fontSize: 40,
          fontWeight: 700,
          color: '#1a1a1a',
          textAlign: 'center',
        },
      },
      {
        type: 'frame',
        name: 'Testimonial Card',
        size: { width: 600, height: 200 },
        styles: {
          display: 'flex',
          flexDirection: 'column',
          padding: 32,
          backgroundColor: '#f9fafb',
          borderRadius: 16,
          gap: 16,
          alignItems: 'center',
        },
        children: [
          { type: 'text', name: 'Quote', content: '"This tool has completely transformed how we design. Absolutely love it!"', styles: { fontSize: 18, color: '#1a1a1a', textAlign: 'center', fontStyle: 'italic' } },
          { type: 'text', name: 'Author', content: '— Sarah Johnson, Designer', styles: { fontSize: 14, color: '#666', textAlign: 'center' } },
        ],
      },
    ],
  },

  // FAQ Block
  faq: {
    id: 'faq',
    name: 'FAQ',
    description: 'Frequently asked questions',
    rootType: 'section',
    rootSize: { width: 1200, height: 500 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 80,
      backgroundColor: '#fafafa',
      gap: 48,
    },
    children: [
      {
        type: 'text',
        name: 'Section Title',
        content: 'Frequently Asked Questions',
        size: { width: 500, height: 48 },
        styles: {
          fontSize: 40,
          fontWeight: 700,
          color: '#1a1a1a',
          textAlign: 'center',
        },
      },
      {
        type: 'stack',
        name: 'FAQ List',
        size: { width: 700, height: 300 },
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        },
        children: [
          {
            type: 'frame',
            name: 'FAQ Item 1',
            styles: { display: 'flex', flexDirection: 'column', padding: 24, backgroundColor: '#fff', borderRadius: 12, gap: 8 },
            children: [
              { type: 'text', name: 'Question', content: 'How does the free trial work?', styles: { fontSize: 16, fontWeight: 600, color: '#1a1a1a' } },
              { type: 'text', name: 'Answer', content: 'You get 14 days of full access to all features. No credit card required.', styles: { fontSize: 14, color: '#666' } },
            ],
          },
          {
            type: 'frame',
            name: 'FAQ Item 2',
            styles: { display: 'flex', flexDirection: 'column', padding: 24, backgroundColor: '#fff', borderRadius: 12, gap: 8 },
            children: [
              { type: 'text', name: 'Question', content: 'Can I export my designs?', styles: { fontSize: 16, fontWeight: 600, color: '#1a1a1a' } },
              { type: 'text', name: 'Answer', content: 'Yes! Export clean React code or download as HTML/CSS.', styles: { fontSize: 14, color: '#666' } },
            ],
          },
        ],
      },
    ],
  },

  // Contact Block
  contact: {
    id: 'contact',
    name: 'Contact Form',
    description: 'Contact section with form',
    rootType: 'section',
    rootSize: { width: 1200, height: 500 },
    rootStyles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 80,
      backgroundColor: '#fff',
      gap: 48,
    },
    children: [
      {
        type: 'text',
        name: 'Section Title',
        content: 'Get in Touch',
        size: { width: 400, height: 48 },
        styles: {
          fontSize: 40,
          fontWeight: 700,
          color: '#1a1a1a',
          textAlign: 'center',
        },
      },
      {
        type: 'stack',
        name: 'Form',
        size: { width: 500, height: 300 },
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        },
        children: [
          { type: 'input', name: 'Name', placeholder: 'Your name', styles: { borderRadius: 8 } },
          { type: 'input', name: 'Email', placeholder: 'your@email.com', styles: { borderRadius: 8 } },
          { type: 'input', name: 'Message', placeholder: 'Your message...', styles: { borderRadius: 8 } },
          { type: 'button', name: 'Submit', content: 'Send Message', styles: { backgroundColor: '#8B1E2B', color: '#fff', borderRadius: 8 } },
        ],
      },
    ],
  },
};

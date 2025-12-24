/**
 * Design Templates - Pre-built canvas JSON templates
 *
 * These templates are converted from beautiful React portfolio designs
 * and can be used as references for AI generation or as starting points.
 */

import { CanvasElement, ElementStyles } from '../types';

// Template types
export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'hero' | 'section' | 'card' | 'testimonial' | 'pricing' | 'faq' | 'footer' | 'full-page';
  thumbnail?: string;
  elements: Partial<CanvasElement>[];
}

// Common style patterns extracted from React templates
export const StylePatterns = {
  // Dark Theme (from portfolio-dark)
  darkTheme: {
    background: '#000000',
    surface: '#1c1c1c',
    surfaceDark: '#141414',
    accent: '#CAE8BD',
    border: 'rgba(255, 255, 255, 0.08)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
  },

  // Light Elegant (from artemis-portfolio)
  lightElegant: {
    background: '#F8F6F3',
    surface: '#EBE9E4',
    accent: '#FF5900',
    primary: '#001666',
    text: '#2A3132',
    textMuted: '#5F6566',
  },

  // Playful Colors (from landing-template)
  playfulColors: {
    pink: '#FFC9F0',
    yellow: '#FFE68C',
    blue: '#9DDCFF',
    cream: '#FFFBF5',
    black: '#000000',
  },
};

// Hero Templates
export const HeroTemplates: DesignTemplate[] = [
  {
    id: 'hero-gradient-centered',
    name: 'Gradient Hero Centered',
    description: 'Centered hero with gradient background and CTA button',
    category: 'hero',
    elements: [
      {
        type: 'section',
        name: 'Hero Section',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          gap: 32,
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        children: [],
      },
      {
        type: 'text',
        name: 'Hero Headline',
        content: 'Build Something Amazing',
        styles: {
          fontSize: 64,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.1,
        },
      },
      {
        type: 'text',
        name: 'Hero Subheadline',
        content: 'Create beautiful experiences with our design platform',
        styles: {
          fontSize: 20,
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          maxWidth: 500,
        },
      },
      {
        type: 'button',
        name: 'CTA Button',
        content: 'Get Started',
        styles: {
          backgroundColor: '#ffffff',
          color: '#764ba2',
          fontSize: 16,
          fontWeight: 600,
          padding: 16,
          paddingLeft: 32,
          paddingRight: 32,
          borderRadius: 50,
        },
      },
    ],
  },
  {
    id: 'hero-split-image',
    name: 'Split Hero with Image',
    description: 'Two-column hero with text and image',
    category: 'hero',
    elements: [
      {
        type: 'section',
        name: 'Hero Section',
        styles: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 80,
          gap: 64,
          backgroundColor: '#F8F6F3',
        },
      },
      {
        type: 'stack',
        name: 'Text Content',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          flex: 1,
        },
        children: [],
      },
      {
        type: 'text',
        name: 'Eyebrow',
        content: 'Available for hire',
        styles: {
          fontSize: 14,
          color: '#5F6566',
          textTransform: 'uppercase',
          letterSpacing: 2,
        },
      },
      {
        type: 'text',
        name: 'Headline',
        content: 'Product & Visual Designer',
        styles: {
          fontSize: 56,
          fontWeight: 400,
          fontFamily: 'Playfair Display, serif',
          color: '#001666',
          lineHeight: 1.1,
        },
      },
      {
        type: 'text',
        name: 'Subheadline',
        content: 'startups can count on!',
        styles: {
          fontSize: 18,
          color: '#2A3132',
        },
      },
      {
        type: 'button',
        name: 'CTA',
        content: 'Get Started',
        styles: {
          backgroundColor: '#FF5900',
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 500,
          padding: 12,
          paddingLeft: 24,
          paddingRight: 24,
          borderRadius: 50,
        },
      },
      {
        type: 'image',
        name: 'Hero Image',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
        styles: {
          borderRadius: 16,
          objectFit: 'cover',
        },
      },
    ],
  },
  {
    id: 'hero-dark-minimal',
    name: 'Dark Minimal Hero',
    description: 'Dark theme minimal hero with accent color',
    category: 'hero',
    elements: [
      {
        type: 'section',
        name: 'Hero Section',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: 80,
          gap: 32,
          backgroundColor: '#000000',
        },
      },
      {
        type: 'text',
        name: 'Headline',
        content: 'Design. Build. Launch.',
        styles: {
          fontSize: 72,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.0,
        },
      },
      {
        type: 'text',
        name: 'Description',
        content: 'Creating visual identities that make your brand memorable.',
        styles: {
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.5)',
          maxWidth: 400,
        },
      },
      {
        type: 'button',
        name: 'CTA',
        content: 'Book a call',
        styles: {
          backgroundColor: '#CAE8BD',
          color: '#000000',
          fontSize: 14,
          fontWeight: 500,
          padding: 14,
          paddingLeft: 28,
          paddingRight: 28,
          borderRadius: 50,
        },
      },
    ],
  },
];

// Card Templates
export const CardTemplates: DesignTemplate[] = [
  {
    id: 'card-project',
    name: 'Project Card',
    description: 'Card with image, title, and category badge',
    category: 'card',
    elements: [
      {
        type: 'frame',
        name: 'Project Card',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 12,
          backgroundColor: '#EBE9E4',
          borderRadius: 16,
        },
      },
      {
        type: 'image',
        name: 'Cover',
        styles: {
          borderRadius: 8,
          aspectRatio: '4/3',
          objectFit: 'cover',
        },
      },
      {
        type: 'text',
        name: 'Title',
        content: 'Project Name',
        styles: {
          fontSize: 18,
          fontWeight: 600,
          color: '#2A3132',
        },
      },
      {
        type: 'text',
        name: 'Description',
        content: 'A brief description of the project',
        styles: {
          fontSize: 14,
          color: '#767D7E',
          lineHeight: 1.5,
        },
      },
      {
        type: 'frame',
        name: 'Badge',
        styles: {
          backgroundColor: '#2A3132',
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 14,
          paddingRight: 14,
          borderRadius: 20,
        },
        children: [],
      },
      {
        type: 'text',
        name: 'Badge Text',
        content: 'Product Design',
        styles: {
          fontSize: 12,
          fontWeight: 500,
          color: '#F8F6F3',
        },
      },
    ],
  },
  {
    id: 'card-service-dark',
    name: 'Service Card Dark',
    description: 'Dark theme service card with icon',
    category: 'card',
    elements: [
      {
        type: 'frame',
        name: 'Service Card',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
          backgroundColor: '#1c1c1c',
          borderRadius: 16,
        },
      },
      {
        type: 'row',
        name: 'Header',
        styles: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      {
        type: 'text',
        name: 'Number',
        content: '01.',
        styles: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      {
        type: 'frame',
        name: 'Icon Container',
        styles: {
          backgroundColor: '#141414',
          borderRadius: 50,
          padding: 12,
        },
      },
      {
        type: 'text',
        name: 'Title',
        content: 'Branding & Identity',
        styles: {
          fontSize: 18,
          fontWeight: 600,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Description',
        content: 'Creating visual identities that make your brand memorable.',
        styles: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.5)',
          lineHeight: 1.5,
        },
      },
    ],
  },
  {
    id: 'card-colorful',
    name: 'Colorful Card',
    description: 'Playful card with colored background',
    category: 'card',
    elements: [
      {
        type: 'frame',
        name: 'Colorful Card',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
          backgroundColor: '#9DDCFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#000000',
          borderStyle: 'solid',
        },
      },
      {
        type: 'frame',
        name: 'Icon Box',
        styles: {
          backgroundColor: '#ffffff',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#000000',
          borderStyle: 'solid',
          padding: 16,
        },
      },
      {
        type: 'text',
        name: 'Title',
        content: 'Branding Design',
        styles: {
          fontSize: 20,
          fontWeight: 700,
          color: '#000000',
        },
      },
    ],
  },
];

// Testimonial Templates
export const TestimonialTemplates: DesignTemplate[] = [
  {
    id: 'testimonial-dark',
    name: 'Dark Testimonial',
    description: 'Dark theme testimonial with avatar',
    category: 'testimonial',
    elements: [
      {
        type: 'frame',
        name: 'Testimonial Card',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
          backgroundColor: '#141414',
          borderRadius: 16,
        },
      },
      {
        type: 'row',
        name: 'Author',
        styles: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        },
      },
      {
        type: 'image',
        name: 'Avatar',
        styles: {
          borderRadius: 50,
          objectFit: 'cover',
        },
      },
      {
        type: 'stack',
        name: 'Author Info',
        styles: {
          gap: 4,
        },
      },
      {
        type: 'text',
        name: 'Name',
        content: 'John Doe',
        styles: {
          fontSize: 14,
          fontWeight: 500,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Handle',
        content: '@johndoe',
        styles: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      {
        type: 'text',
        name: 'Quote',
        content: 'Amazing work! The attention to detail and creativity exceeded our expectations.',
        styles: {
          fontSize: 14,
          color: '#ffffff',
          lineHeight: 1.6,
        },
      },
    ],
  },
];

// Pricing Templates
export const PricingTemplates: DesignTemplate[] = [
  {
    id: 'pricing-card-dark',
    name: 'Dark Pricing Card',
    description: 'Dark theme pricing card with features list',
    category: 'pricing',
    elements: [
      {
        type: 'frame',
        name: 'Pricing Card',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: 24,
          backgroundColor: '#141414',
          borderRadius: 16,
        },
      },
      {
        type: 'stack',
        name: 'Header',
        styles: {
          gap: 8,
        },
      },
      {
        type: 'text',
        name: 'Plan Name',
        content: 'Pro Plan',
        styles: {
          fontSize: 18,
          fontWeight: 600,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Description',
        content: 'For growing businesses',
        styles: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      {
        type: 'row',
        name: 'Price',
        styles: {
          alignItems: 'baseline',
          gap: 4,
        },
      },
      {
        type: 'text',
        name: 'Amount',
        content: '$49',
        styles: {
          fontSize: 32,
          fontWeight: 600,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Period',
        content: '/month',
        styles: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      {
        type: 'button',
        name: 'CTA',
        content: 'Get Started',
        styles: {
          backgroundColor: '#CAE8BD',
          color: '#000000',
          fontSize: 14,
          fontWeight: 500,
          padding: 14,
          borderRadius: 50,
          textAlign: 'center',
        },
      },
      {
        type: 'stack',
        name: 'Features',
        styles: {
          gap: 12,
        },
      },
      {
        type: 'row',
        name: 'Feature 1',
        styles: {
          alignItems: 'center',
          gap: 12,
        },
      },
      {
        type: 'text',
        name: 'Feature Text',
        content: 'Unlimited projects',
        styles: {
          fontSize: 14,
          color: '#ffffff',
        },
      },
    ],
  },
];

// Section Templates
export const SectionTemplates: DesignTemplate[] = [
  {
    id: 'section-features-grid',
    name: 'Features Grid',
    description: 'Features section with 4-column grid',
    category: 'section',
    elements: [
      {
        type: 'section',
        name: 'Features Section',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 80,
          gap: 48,
          backgroundColor: '#000000',
        },
      },
      {
        type: 'text',
        name: 'Section Title',
        content: 'Our Services',
        styles: {
          fontSize: 32,
          fontWeight: 600,
          color: '#ffffff',
        },
      },
      {
        type: 'grid',
        name: 'Features Grid',
        styles: {
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        },
      },
    ],
  },
  {
    id: 'section-cta',
    name: 'CTA Section',
    description: 'Call-to-action section with gradient',
    category: 'section',
    elements: [
      {
        type: 'section',
        name: 'CTA Section',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 120,
          gap: 32,
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      },
      {
        type: 'text',
        name: 'CTA Title',
        content: "Let's Work Together",
        styles: {
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      {
        type: 'text',
        name: 'CTA Subtitle',
        content: "Have a project in mind? Let's create something amazing.",
        styles: {
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
        },
      },
      {
        type: 'button',
        name: 'CTA Button',
        content: 'Get in Touch',
        styles: {
          backgroundColor: '#ffffff',
          color: '#764ba2',
          fontSize: 16,
          fontWeight: 600,
          padding: 16,
          paddingLeft: 32,
          paddingRight: 32,
          borderRadius: 50,
        },
      },
    ],
  },
];

// Footer Templates
export const FooterTemplates: DesignTemplate[] = [
  {
    id: 'footer-simple',
    name: 'Simple Footer',
    description: 'Minimal footer with social links',
    category: 'footer',
    elements: [
      {
        type: 'section',
        name: 'Footer',
        styles: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 32,
          borderTopWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderStyle: 'solid',
          backgroundColor: '#000000',
        },
      },
      {
        type: 'text',
        name: 'Copyright',
        content: '© 2025 All rights reserved.',
        styles: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      {
        type: 'row',
        name: 'Social Links',
        styles: {
          display: 'flex',
          gap: 24,
        },
      },
      {
        type: 'link',
        name: 'Twitter',
        content: 'Twitter',
        href: '#',
        styles: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      {
        type: 'link',
        name: 'LinkedIn',
        content: 'LinkedIn',
        href: '#',
        styles: {
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    ],
  },
];

// Export all templates
export const AllTemplates: DesignTemplate[] = [
  ...HeroTemplates,
  ...CardTemplates,
  ...TestimonialTemplates,
  ...PricingTemplates,
  ...SectionTemplates,
  ...FooterTemplates,
];

// Get template by ID
export function getTemplateById(id: string): DesignTemplate | undefined {
  return AllTemplates.find(t => t.id === id);
}

// Get templates by category
export function getTemplatesByCategory(category: DesignTemplate['category']): DesignTemplate[] {
  return AllTemplates.filter(t => t.category === category);
}

// Convert template to canvas elements (generates unique IDs)
export function instantiateTemplate(template: DesignTemplate, parentId: string | null = null): CanvasElement[] {
  const elements: CanvasElement[] = [];

  template.elements.forEach((el, index) => {
    const id = `${template.id}-${index}-${Date.now()}`;
    const element: CanvasElement = {
      id,
      type: el.type || 'frame',
      name: el.name || `Element ${index}`,
      position: { x: 0, y: 0 },
      size: el.size || { width: 200, height: 100 },
      positionType: 'relative',
      styles: el.styles || {},
      content: el.content,
      src: el.src,
      href: el.href,
      parentId: parentId,
      children: [],
      locked: false,
      visible: true,
    };
    elements.push(element);
  });

  return elements;
}

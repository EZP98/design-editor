-- Design Templates: Store reusable design patterns for AI generation
-- Templates are JSON structures that match the canvas element format

-- Drop old table if exists (from migration 001) and recreate with proper structure
DROP TABLE IF EXISTS design_templates CASCADE;

CREATE TABLE design_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'hero', 'features', 'pricing', 'testimonials', 'about', 'cta', 'faq', 'footer', 'services', 'projects'
  style TEXT,          -- 'dark', 'light', 'gradient', 'minimal', 'playful', 'glass'
  tags TEXT[],         -- ['modern', 'portfolio', 'saas', 'agency', 'creative', etc.]
  description TEXT,    -- Brief description for AI context
  json_structure JSONB NOT NULL,  -- The JSON design structure
  preview_url TEXT,    -- Optional screenshot URL
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by type and style
CREATE INDEX idx_design_templates_type ON design_templates(type);
CREATE INDEX idx_design_templates_style ON design_templates(style);
CREATE INDEX idx_design_templates_tags ON design_templates USING gin(tags);

-- Enable RLS but allow public read access
ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;

-- Public read access for templates
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON design_templates;
CREATE POLICY "Public templates are viewable by everyone"
  ON design_templates FOR SELECT
  USING (is_public = true);

-- Insert initial templates based on landing-template and hanzo-template

-- HERO: Playful/Colorful style (from landing-template)
INSERT INTO design_templates (name, type, style, tags, description, json_structure) VALUES
(
  'Hero Colorful Portfolio',
  'hero',
  'playful',
  ARRAY['portfolio', 'creative', 'colorful', 'designer'],
  'Playful hero section with colorful badges, profile image, and CTA buttons',
  '{
    "type": "section",
    "name": "Hero",
    "styles": {
      "display": "flex",
      "flexDirection": "row",
      "alignItems": "center",
      "padding": 80,
      "gap": 64,
      "backgroundColor": "#FFFBF5",
      "minHeight": 600
    },
    "children": [
      {
        "type": "stack",
        "name": "Content",
        "styles": {
          "display": "flex",
          "flexDirection": "column",
          "gap": 24,
          "flex": 1
        },
        "children": [
          {
            "type": "frame",
            "name": "Badge",
            "styles": {
              "display": "flex",
              "alignItems": "center",
              "gap": 8,
              "padding": 8,
              "paddingLeft": 16,
              "paddingRight": 16,
              "backgroundColor": "#ffffff",
              "borderRadius": 50,
              "borderWidth": 1,
              "borderColor": "#000000",
              "borderStyle": "solid"
            },
            "children": [
              {"type": "text", "name": "Status", "content": "Available for hire", "styles": {"fontSize": 14, "color": "#000000"}}
            ]
          },
          {"type": "text", "name": "Greeting", "content": "Hi, I''m", "styles": {"fontSize": 64, "fontWeight": 700, "color": "#000000"}},
          {
            "type": "frame",
            "name": "NameBadge",
            "styles": {
              "display": "inline-flex",
              "padding": 8,
              "paddingLeft": 16,
              "paddingRight": 16,
              "backgroundColor": "#FFC9F0",
              "borderRadius": 8,
              "borderWidth": 1,
              "borderColor": "#000000",
              "borderStyle": "solid"
            },
            "children": [
              {"type": "text", "name": "Name", "content": "Monica", "styles": {"fontSize": 64, "fontWeight": 700, "color": "#000000"}}
            ]
          },
          {"type": "text", "name": "Description", "content": "A Graphic Designer with 3+ years of experience, building awesome logos and brand identity for cool companies :)", "styles": {"fontSize": 18, "color": "#666666", "lineHeight": 1.6}},
          {
            "type": "row",
            "name": "CTAs",
            "styles": {"display": "flex", "gap": 16},
            "children": [
              {"type": "button", "name": "Primary CTA", "content": "Hire Me!", "styles": {"backgroundColor": "#000000", "color": "#ffffff", "padding": 14, "paddingLeft": 24, "paddingRight": 24, "borderRadius": 50, "fontWeight": 500}},
              {"type": "button", "name": "Secondary CTA", "content": "See my Portfolio", "styles": {"backgroundColor": "#ffffff", "color": "#000000", "padding": 14, "paddingLeft": 24, "paddingRight": 24, "borderRadius": 50, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}}
            ]
          }
        ]
      },
      {
        "type": "frame",
        "name": "ImageWrapper",
        "styles": {
          "padding": 12,
          "backgroundColor": "#9DDCFF",
          "borderRadius": 24,
          "borderWidth": 1,
          "borderColor": "#000000",
          "borderStyle": "solid"
        },
        "children": [
          {"type": "image", "name": "Photo", "src": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600", "styles": {"borderRadius": 16, "objectFit": "cover", "aspectRatio": "3/4"}}
        ]
      }
    ]
  }'::jsonb
),

-- HERO: Dark Professional style (from hanzo-template)
(
  'Hero Agency Dark',
  'hero',
  'dark',
  ARRAY['agency', 'startup', 'professional', 'saas'],
  'Professional dark hero with large typography, availability badge, and trust indicators',
  '{
    "type": "section",
    "name": "Hero",
    "styles": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "justifyContent": "center",
      "padding": 120,
      "gap": 32,
      "backgroundColor": "#FAFAF9",
      "minHeight": 700
    },
    "children": [
      {
        "type": "frame",
        "name": "StatusBadge",
        "styles": {
          "display": "flex",
          "alignItems": "center",
          "gap": 8,
          "padding": 8,
          "paddingLeft": 16,
          "paddingRight": 16,
          "backgroundColor": "#ffffff",
          "borderRadius": 50,
          "boxShadow": "0 2px 8px rgba(0,0,0,0.08)"
        },
        "children": [
          {"type": "text", "name": "Status", "content": "• Booking Open — 2 Spots Left", "styles": {"fontSize": 14, "color": "#0cb300", "fontWeight": 500}}
        ]
      },
      {"type": "text", "name": "Headline", "content": "Unlimited Design", "styles": {"fontSize": 96, "fontWeight": 700, "color": "#000000", "letterSpacing": -3, "textAlign": "center"}},
      {"type": "text", "name": "SubHeadline", "content": "for Solid Startups", "styles": {"fontSize": 72, "fontWeight": 400, "color": "rgba(0,0,0,0.5)", "letterSpacing": -2, "textAlign": "center"}},
      {"type": "text", "name": "Description", "content": "We help startups and brands create beautiful, functional products — fast and hassle-free.", "styles": {"fontSize": 18, "color": "rgba(0,0,0,0.5)", "textAlign": "center", "maxWidth": 500}},
      {
        "type": "row",
        "name": "CTARow",
        "styles": {"display": "flex", "alignItems": "center", "gap": 24},
        "children": [
          {"type": "button", "name": "CTA", "content": "Choose your plan →", "styles": {"backgroundColor": "#000000", "color": "#ffffff", "padding": 16, "paddingLeft": 28, "paddingRight": 28, "borderRadius": 50, "fontWeight": 600, "boxShadow": "inset 0 -16px 48px rgba(0,0,0,1)"}},
          {"type": "text", "name": "Trust", "content": "Trusted by Leaders", "styles": {"fontSize": 14, "color": "rgba(0,0,0,0.5)"}}
        ]
      }
    ]
  }'::jsonb
),

-- FEATURES/SERVICES: Card Grid style
(
  'Services Grid Colorful',
  'services',
  'playful',
  ARRAY['services', 'features', 'colorful', 'grid'],
  'Services section with colorful card grid',
  '{
    "type": "section",
    "name": "Services",
    "styles": {
      "display": "flex",
      "flexDirection": "column",
      "padding": 80,
      "gap": 48,
      "backgroundColor": "#ffffff"
    },
    "children": [
      {
        "type": "frame",
        "name": "TitleWrapper",
        "styles": {
          "display": "inline-flex",
          "padding": 8,
          "paddingLeft": 16,
          "paddingRight": 16,
          "backgroundColor": "#FFE68C",
          "borderRadius": 8,
          "borderWidth": 1,
          "borderColor": "#000000",
          "borderStyle": "solid"
        },
        "children": [
          {"type": "text", "name": "Title", "content": "My Services", "styles": {"fontSize": 32, "fontWeight": 700, "color": "#000000"}}
        ]
      },
      {
        "type": "row",
        "name": "CardsGrid",
        "styles": {"display": "flex", "flexWrap": "wrap", "gap": 24},
        "children": [
          {
            "type": "frame",
            "name": "ServiceCard1",
            "styles": {"display": "flex", "flexDirection": "column", "gap": 12, "padding": 24, "backgroundColor": "#FFC9F0", "borderRadius": 16, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid", "flex": 1, "minWidth": 200},
            "children": [
              {"type": "frame", "name": "IconBox", "styles": {"padding": 16, "backgroundColor": "#ffffff", "borderRadius": 12, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}, "children": []},
              {"type": "text", "name": "CardTitle", "content": "Branding and Identity", "styles": {"fontSize": 18, "fontWeight": 700, "color": "#000000"}}
            ]
          },
          {
            "type": "frame",
            "name": "ServiceCard2",
            "styles": {"display": "flex", "flexDirection": "column", "gap": 12, "padding": 24, "backgroundColor": "#FFE68C", "borderRadius": 16, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid", "flex": 1, "minWidth": 200},
            "children": [
              {"type": "frame", "name": "IconBox", "styles": {"padding": 16, "backgroundColor": "#ffffff", "borderRadius": 12, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}, "children": []},
              {"type": "text", "name": "CardTitle", "content": "Print Design", "styles": {"fontSize": 18, "fontWeight": 700, "color": "#000000"}}
            ]
          },
          {
            "type": "frame",
            "name": "ServiceCard3",
            "styles": {"display": "flex", "flexDirection": "column", "gap": 12, "padding": 24, "backgroundColor": "#9DDCFF", "borderRadius": 16, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid", "flex": 1, "minWidth": 200},
            "children": [
              {"type": "frame", "name": "IconBox", "styles": {"padding": 16, "backgroundColor": "#ffffff", "borderRadius": 12, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}, "children": []},
              {"type": "text", "name": "CardTitle", "content": "Packaging Design", "styles": {"fontSize": 18, "fontWeight": 700, "color": "#000000"}}
            ]
          },
          {
            "type": "frame",
            "name": "ServiceCard4",
            "styles": {"display": "flex", "flexDirection": "column", "gap": 12, "padding": 24, "backgroundColor": "#FFC9F0", "borderRadius": 16, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid", "flex": 1, "minWidth": 200},
            "children": [
              {"type": "frame", "name": "IconBox", "styles": {"padding": 16, "backgroundColor": "#ffffff", "borderRadius": 12, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}, "children": []},
              {"type": "text", "name": "CardTitle", "content": "Illustration", "styles": {"fontSize": 18, "fontWeight": 700, "color": "#000000"}}
            ]
          }
        ]
      }
    ]
  }'::jsonb
),

-- PROJECTS: Portfolio Grid style
(
  'Projects Grid Portfolio',
  'projects',
  'playful',
  ARRAY['portfolio', 'projects', 'gallery', 'creative'],
  'Featured projects section with image cards',
  '{
    "type": "section",
    "name": "Projects",
    "styles": {
      "display": "flex",
      "flexDirection": "column",
      "padding": 80,
      "gap": 48,
      "backgroundColor": "#FFFBF5"
    },
    "children": [
      {
        "type": "frame",
        "name": "TitleWrapper",
        "styles": {
          "display": "inline-flex",
          "padding": 8,
          "paddingLeft": 16,
          "paddingRight": 16,
          "backgroundColor": "#FFE68C",
          "borderRadius": 8,
          "borderWidth": 1,
          "borderColor": "#000000",
          "borderStyle": "solid"
        },
        "children": [
          {"type": "text", "name": "Title", "content": "Featured Projects", "styles": {"fontSize": 32, "fontWeight": 700, "color": "#000000"}}
        ]
      },
      {
        "type": "row",
        "name": "ProjectsGrid",
        "styles": {"display": "flex", "gap": 24, "flexWrap": "wrap"},
        "children": [
          {
            "type": "frame",
            "name": "ProjectCard1",
            "styles": {"display": "flex", "flexDirection": "column", "gap": 16, "padding": 12, "backgroundColor": "#9DDCFF", "borderRadius": 24, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid", "flex": 1, "minWidth": 280},
            "children": [
              {"type": "image", "name": "ProjectImage", "src": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600", "styles": {"borderRadius": 16, "aspectRatio": "16/9", "objectFit": "cover", "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}},
              {"type": "text", "name": "ProjectTitle", "content": "Brand Identity", "styles": {"fontSize": 20, "fontWeight": 700, "color": "#000000"}},
              {"type": "button", "name": "ViewProject", "content": "See Project", "styles": {"backgroundColor": "#ffffff", "color": "#000000", "padding": 12, "paddingLeft": 20, "paddingRight": 20, "borderRadius": 50, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}}
            ]
          },
          {
            "type": "frame",
            "name": "ProjectCard2",
            "styles": {"display": "flex", "flexDirection": "column", "gap": 16, "padding": 12, "backgroundColor": "#FFE68C", "borderRadius": 24, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid", "flex": 1, "minWidth": 280},
            "children": [
              {"type": "image", "name": "ProjectImage", "src": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600", "styles": {"borderRadius": 16, "aspectRatio": "16/9", "objectFit": "cover", "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}},
              {"type": "text", "name": "ProjectTitle", "content": "Logo Design", "styles": {"fontSize": 20, "fontWeight": 700, "color": "#000000"}},
              {"type": "button", "name": "ViewProject", "content": "See Project", "styles": {"backgroundColor": "#ffffff", "color": "#000000", "padding": 12, "paddingLeft": 20, "paddingRight": 20, "borderRadius": 50, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}}
            ]
          },
          {
            "type": "frame",
            "name": "ProjectCard3",
            "styles": {"display": "flex", "flexDirection": "column", "gap": 16, "padding": 12, "backgroundColor": "#FFC9F0", "borderRadius": 24, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid", "flex": 1, "minWidth": 280},
            "children": [
              {"type": "image", "name": "ProjectImage", "src": "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600", "styles": {"borderRadius": 16, "aspectRatio": "16/9", "objectFit": "cover", "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}},
              {"type": "text", "name": "ProjectTitle", "content": "Web Design", "styles": {"fontSize": 20, "fontWeight": 700, "color": "#000000"}},
              {"type": "button", "name": "ViewProject", "content": "See Project", "styles": {"backgroundColor": "#ffffff", "color": "#000000", "padding": 12, "paddingLeft": 20, "paddingRight": 20, "borderRadius": 50, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"}}
            ]
          }
        ]
      },
      {"type": "button", "name": "ViewAll", "content": "Check my Portfolio", "styles": {"backgroundColor": "#ffffff", "color": "#000000", "padding": 14, "paddingLeft": 24, "paddingRight": 24, "borderRadius": 50, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid", "alignSelf": "center"}}
    ]
  }'::jsonb
),

-- ABOUT: Profile + Bio style
(
  'About Profile',
  'about',
  'light',
  ARRAY['about', 'profile', 'bio', 'experience'],
  'About section with photo, bio, and experience list',
  '{
    "type": "section",
    "name": "About",
    "styles": {
      "display": "flex",
      "flexDirection": "row",
      "alignItems": "flex-start",
      "padding": 80,
      "gap": 64,
      "backgroundColor": "#ffffff"
    },
    "children": [
      {
        "type": "stack",
        "name": "PhotoSection",
        "styles": {"display": "flex", "flexDirection": "column", "gap": 16},
        "children": [
          {"type": "image", "name": "Photo", "src": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600", "styles": {"borderRadius": 16, "objectFit": "cover", "aspectRatio": "3/2"}},
          {"type": "text", "name": "Name", "content": "Monica Chen", "styles": {"fontSize": 18, "fontWeight": 600, "color": "#000000"}},
          {"type": "text", "name": "Role", "content": "Design Studio, Founder", "styles": {"fontSize": 14, "color": "rgba(0,0,0,0.5)"}}
        ]
      },
      {
        "type": "stack",
        "name": "BioSection",
        "styles": {"display": "flex", "flexDirection": "column", "gap": 32, "flex": 1},
        "children": [
          {"type": "text", "name": "Bio", "content": "Monica is a designer known for her minimalist, expressive digital work. She helps startups and studios create clean interfaces and strong branding. Based in Los Angeles, she blends function with emotion.", "styles": {"fontSize": 20, "color": "rgba(0,0,0,0.8)", "lineHeight": 1.6}},
          {
            "type": "stack",
            "name": "Experience",
            "styles": {"display": "flex", "flexDirection": "column", "gap": 16, "borderTop": "1px solid rgba(0,0,0,0.1)", "paddingTop": 24},
            "children": [
              {
                "type": "row",
                "name": "ExpItem1",
                "styles": {"display": "flex", "justifyContent": "space-between", "paddingBottom": 16, "borderBottom": "1px solid rgba(0,0,0,0.1)"},
                "children": [
                  {"type": "text", "name": "Role", "content": "Senior Designer", "styles": {"fontSize": 16, "fontWeight": 500, "color": "#000000"}},
                  {"type": "text", "name": "Period", "content": "2021 → Now", "styles": {"fontSize": 14, "color": "rgba(0,0,0,0.5)"}}
                ]
              },
              {
                "type": "row",
                "name": "ExpItem2",
                "styles": {"display": "flex", "justifyContent": "space-between", "paddingBottom": 16, "borderBottom": "1px solid rgba(0,0,0,0.1)"},
                "children": [
                  {"type": "text", "name": "Role", "content": "Product Designer", "styles": {"fontSize": 16, "fontWeight": 500, "color": "#000000"}},
                  {"type": "text", "name": "Period", "content": "2019 → 2021", "styles": {"fontSize": 14, "color": "rgba(0,0,0,0.5)"}}
                ]
              }
            ]
          }
        ]
      }
    ]
  }'::jsonb
),

-- FAQ: Accordion style
(
  'FAQ Accordion',
  'faq',
  'playful',
  ARRAY['faq', 'questions', 'accordion'],
  'FAQ section with expandable questions',
  '{
    "type": "section",
    "name": "FAQ",
    "styles": {
      "display": "flex",
      "flexDirection": "column",
      "padding": 80,
      "gap": 32,
      "backgroundColor": "#ffffff"
    },
    "children": [
      {
        "type": "frame",
        "name": "TitleWrapper",
        "styles": {"display": "inline-flex", "padding": 8, "paddingLeft": 16, "paddingRight": 16, "backgroundColor": "#FFE68C", "borderRadius": 8, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"},
        "children": [
          {"type": "text", "name": "Title", "content": "FAQ", "styles": {"fontSize": 32, "fontWeight": 700, "color": "#000000"}}
        ]
      },
      {
        "type": "stack",
        "name": "Questions",
        "styles": {"display": "flex", "flexDirection": "column", "gap": 16, "maxWidth": 700},
        "children": [
          {
            "type": "frame",
            "name": "FAQItem1",
            "styles": {"display": "flex", "justifyContent": "space-between", "alignItems": "center", "padding": 24, "backgroundColor": "#9DDCFF", "borderRadius": 16, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"},
            "children": [
              {"type": "text", "name": "Question", "content": "What services do you offer?", "styles": {"fontSize": 18, "fontWeight": 600, "color": "#000000"}}
            ]
          },
          {
            "type": "frame",
            "name": "FAQItem2",
            "styles": {"display": "flex", "justifyContent": "space-between", "alignItems": "center", "padding": 24, "backgroundColor": "#9DDCFF", "borderRadius": 16, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"},
            "children": [
              {"type": "text", "name": "Question", "content": "How do I start a project with you?", "styles": {"fontSize": 18, "fontWeight": 600, "color": "#000000"}}
            ]
          },
          {
            "type": "frame",
            "name": "FAQItem3",
            "styles": {"display": "flex", "justifyContent": "space-between", "alignItems": "center", "padding": 24, "backgroundColor": "#9DDCFF", "borderRadius": 16, "borderWidth": 1, "borderColor": "#000000", "borderStyle": "solid"},
            "children": [
              {"type": "text", "name": "Question", "content": "How long does a typical project take?", "styles": {"fontSize": 18, "fontWeight": 600, "color": "#000000"}}
            ]
          }
        ]
      }
    ]
  }'::jsonb
),

-- CTA: Gradient style
(
  'CTA Gradient',
  'cta',
  'gradient',
  ARRAY['cta', 'contact', 'call-to-action'],
  'Call-to-action section with gradient background',
  '{
    "type": "section",
    "name": "CTA",
    "styles": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "center",
      "justifyContent": "center",
      "padding": 120,
      "gap": 32,
      "backgroundImage": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "minHeight": 400
    },
    "children": [
      {"type": "text", "name": "Title", "content": "Let''s Work Together", "styles": {"fontSize": 48, "fontWeight": 700, "color": "#ffffff", "textAlign": "center"}},
      {"type": "text", "name": "Subtitle", "content": "Have a project in mind? Let''s create something amazing.", "styles": {"fontSize": 18, "color": "rgba(255,255,255,0.8)", "textAlign": "center"}},
      {"type": "button", "name": "CTA", "content": "Get in Touch", "styles": {"backgroundColor": "#ffffff", "color": "#764ba2", "padding": 16, "paddingLeft": 32, "paddingRight": 32, "borderRadius": 50, "fontWeight": 600}}
    ]
  }'::jsonb
),

-- HERO: Dark Minimal style
(
  'Hero Dark Minimal',
  'hero',
  'dark',
  ARRAY['dark', 'minimal', 'agency', 'startup'],
  'Minimal dark hero with bold typography',
  '{
    "type": "section",
    "name": "Hero",
    "styles": {
      "display": "flex",
      "flexDirection": "column",
      "alignItems": "flex-start",
      "padding": 80,
      "gap": 32,
      "backgroundColor": "#0a0a0a",
      "minHeight": 600
    },
    "children": [
      {"type": "text", "name": "Headline", "content": "Design. Build. Launch.", "styles": {"fontSize": 72, "fontWeight": 700, "color": "#ffffff", "letterSpacing": -2}},
      {"type": "text", "name": "Subtitle", "content": "Creating visual identities that make your brand memorable.", "styles": {"fontSize": 18, "color": "rgba(255,255,255,0.5)", "maxWidth": 500}},
      {"type": "button", "name": "CTA", "content": "Book a call", "styles": {"backgroundColor": "#CAE8BD", "color": "#000000", "padding": 14, "paddingLeft": 28, "paddingRight": 28, "borderRadius": 50, "fontWeight": 600}}
    ]
  }'::jsonb
);

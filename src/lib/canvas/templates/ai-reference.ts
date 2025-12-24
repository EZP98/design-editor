/**
 * AI Design Reference
 *
 * Compact JSON examples for AI to generate beautiful designs.
 * These are extracted patterns from professional React templates.
 */

// Hero Examples for AI
export const AI_HERO_EXAMPLES = `
HERO GRADIENT CENTERED:
{"type":"section","name":"Hero","styles":{"display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":80,"gap":32,"backgroundImage":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"},"children":[
  {"type":"text","name":"Headline","content":"Build Something Amazing","styles":{"fontSize":64,"fontWeight":700,"color":"#ffffff","textAlign":"center"}},
  {"type":"text","name":"Subhead","content":"Create beautiful experiences","styles":{"fontSize":20,"color":"rgba(255,255,255,0.8)","textAlign":"center"}},
  {"type":"button","name":"CTA","content":"Get Started","styles":{"backgroundColor":"#ffffff","color":"#764ba2","fontSize":16,"fontWeight":600,"padding":16,"paddingLeft":32,"paddingRight":32,"borderRadius":50}}
]}

HERO SPLIT (2 columns):
{"type":"section","name":"Hero","styles":{"display":"flex","flexDirection":"row","alignItems":"center","padding":80,"gap":64,"backgroundColor":"#F8F6F3"},"children":[
  {"type":"stack","name":"Content","styles":{"display":"flex","flexDirection":"column","gap":24,"flex":1},"children":[
    {"type":"text","name":"Eyebrow","content":"Available for hire","styles":{"fontSize":14,"color":"#5F6566","textTransform":"uppercase","letterSpacing":2}},
    {"type":"text","name":"Headline","content":"Product Designer","styles":{"fontSize":56,"fontWeight":400,"fontFamily":"Playfair Display, serif","color":"#001666"}},
    {"type":"button","name":"CTA","content":"Get Started","styles":{"backgroundColor":"#FF5900","color":"#ffffff","padding":12,"paddingLeft":24,"paddingRight":24,"borderRadius":50}}
  ]},
  {"type":"image","name":"Photo","src":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600","styles":{"borderRadius":16,"objectFit":"cover"}}
]}

HERO DARK MINIMAL:
{"type":"section","name":"Hero","styles":{"display":"flex","flexDirection":"column","alignItems":"flex-start","padding":80,"gap":32,"backgroundColor":"#000000"},"children":[
  {"type":"text","name":"Headline","content":"Design. Build. Launch.","styles":{"fontSize":72,"fontWeight":700,"color":"#ffffff"}},
  {"type":"text","name":"Subtitle","content":"Creating visual identities that make your brand memorable.","styles":{"fontSize":18,"color":"rgba(255,255,255,0.5)"}},
  {"type":"button","name":"CTA","content":"Book a call","styles":{"backgroundColor":"#CAE8BD","color":"#000000","padding":14,"paddingLeft":28,"paddingRight":28,"borderRadius":50}}
]}
`;

// Card Examples for AI
export const AI_CARD_EXAMPLES = `
PROJECT CARD:
{"type":"frame","name":"Card","styles":{"display":"flex","flexDirection":"column","gap":16,"padding":12,"backgroundColor":"#EBE9E4","borderRadius":16},"children":[
  {"type":"image","name":"Cover","src":"https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600","styles":{"borderRadius":8,"aspectRatio":"4/3","objectFit":"cover"}},
  {"type":"text","name":"Title","content":"Project Name","styles":{"fontSize":18,"fontWeight":600,"color":"#2A3132"}},
  {"type":"text","name":"Desc","content":"Brief description","styles":{"fontSize":14,"color":"#767D7E"}},
  {"type":"frame","name":"Badge","styles":{"backgroundColor":"#2A3132","padding":6,"paddingLeft":14,"paddingRight":14,"borderRadius":20},"children":[
    {"type":"text","name":"Tag","content":"Design","styles":{"fontSize":12,"color":"#F8F6F3"}}
  ]}
]}

SERVICE CARD DARK:
{"type":"frame","name":"Service","styles":{"display":"flex","flexDirection":"column","gap":16,"padding":24,"backgroundColor":"#1c1c1c","borderRadius":16},"children":[
  {"type":"row","name":"Header","styles":{"display":"flex","justifyContent":"space-between","alignItems":"center"},"children":[
    {"type":"text","name":"Num","content":"01.","styles":{"fontSize":14,"color":"rgba(255,255,255,0.5)"}},
    {"type":"frame","name":"Icon","styles":{"backgroundColor":"#141414","borderRadius":50,"padding":12},"children":[]}
  ]},
  {"type":"text","name":"Title","content":"Branding","styles":{"fontSize":18,"fontWeight":600,"color":"#ffffff"}},
  {"type":"text","name":"Desc","content":"Creating visual identities","styles":{"fontSize":14,"color":"rgba(255,255,255,0.5)"}}
]}

COLORFUL CARD:
{"type":"frame","name":"Card","styles":{"display":"flex","flexDirection":"column","gap":16,"padding":24,"backgroundColor":"#9DDCFF","borderRadius":16,"borderWidth":1,"borderColor":"#000000","borderStyle":"solid"},"children":[
  {"type":"frame","name":"IconBox","styles":{"backgroundColor":"#ffffff","borderRadius":12,"borderWidth":1,"borderColor":"#000000","padding":16},"children":[]},
  {"type":"text","name":"Title","content":"Branding Design","styles":{"fontSize":20,"fontWeight":700,"color":"#000000"}}
]}
`;

// Section Examples for AI
export const AI_SECTION_EXAMPLES = `
FEATURES GRID (4 columns):
{"type":"section","name":"Features","styles":{"display":"flex","flexDirection":"column","alignItems":"center","padding":80,"gap":48,"backgroundColor":"#000000"},"children":[
  {"type":"text","name":"Title","content":"Our Services","styles":{"fontSize":32,"fontWeight":600,"color":"#ffffff"}},
  {"type":"grid","name":"Grid","styles":{"display":"grid","gridTemplateColumns":"repeat(4, 1fr)","gap":24},"children":[...cards]}
]}

CTA SECTION:
{"type":"section","name":"CTA","styles":{"display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":120,"gap":32,"backgroundImage":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"},"children":[
  {"type":"text","name":"Title","content":"Let's Work Together","styles":{"fontSize":48,"fontWeight":700,"color":"#ffffff","textAlign":"center"}},
  {"type":"text","name":"Subtitle","content":"Have a project in mind?","styles":{"fontSize":18,"color":"rgba(255,255,255,0.8)"}},
  {"type":"button","name":"CTA","content":"Get in Touch","styles":{"backgroundColor":"#ffffff","color":"#764ba2","padding":16,"paddingLeft":32,"paddingRight":32,"borderRadius":50}}
]}

TESTIMONIALS SECTION:
{"type":"section","name":"Testimonials","styles":{"display":"flex","flexDirection":"column","padding":80,"gap":32,"backgroundColor":"#000000"},"children":[
  {"type":"text","name":"Title","content":"What others say","styles":{"fontSize":32,"fontWeight":600,"color":"#ffffff"}},
  {"type":"grid","name":"Grid","styles":{"display":"grid","gridTemplateColumns":"repeat(2, 1fr)","gap":16},"children":[...testimonials]}
]}
`;

// Testimonial Examples
export const AI_TESTIMONIAL_EXAMPLES = `
TESTIMONIAL CARD DARK:
{"type":"frame","name":"Testimonial","styles":{"display":"flex","flexDirection":"column","gap":16,"padding":24,"backgroundColor":"#141414","borderRadius":16},"children":[
  {"type":"row","name":"Author","styles":{"display":"flex","alignItems":"center","gap":12},"children":[
    {"type":"image","name":"Avatar","src":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96","styles":{"borderRadius":50,"objectFit":"cover"}},
    {"type":"stack","name":"Info","styles":{"gap":4},"children":[
      {"type":"text","name":"Name","content":"Sarah Chen","styles":{"fontSize":14,"fontWeight":500,"color":"#ffffff"}},
      {"type":"text","name":"Handle","content":"@sarahchen","styles":{"fontSize":14,"color":"rgba(255,255,255,0.5)"}}
    ]}
  ]},
  {"type":"text","name":"Quote","content":"Amazing work! Exceeded expectations.","styles":{"fontSize":14,"color":"#ffffff","lineHeight":1.6}}
]}
`;

// Pricing Examples
export const AI_PRICING_EXAMPLES = `
PRICING CARD DARK:
{"type":"frame","name":"Pricing","styles":{"display":"flex","flexDirection":"column","gap":24,"padding":24,"backgroundColor":"#141414","borderRadius":16},"children":[
  {"type":"stack","name":"Header","styles":{"gap":8},"children":[
    {"type":"text","name":"Plan","content":"Pro Plan","styles":{"fontSize":18,"fontWeight":600,"color":"#ffffff"}},
    {"type":"text","name":"Desc","content":"For growing businesses","styles":{"fontSize":14,"color":"rgba(255,255,255,0.5)"}}
  ]},
  {"type":"row","name":"Price","styles":{"alignItems":"baseline","gap":4},"children":[
    {"type":"text","name":"Amount","content":"$49","styles":{"fontSize":32,"fontWeight":600,"color":"#ffffff"}},
    {"type":"text","name":"Period","content":"/month","styles":{"fontSize":14,"color":"rgba(255,255,255,0.5)"}}
  ]},
  {"type":"button","name":"CTA","content":"Get Started","styles":{"backgroundColor":"#CAE8BD","color":"#000000","padding":14,"borderRadius":50,"textAlign":"center"}},
  {"type":"stack","name":"Features","styles":{"gap":12},"children":[
    {"type":"text","name":"Feature","content":"✓ Unlimited projects","styles":{"fontSize":14,"color":"#ffffff"}},
    {"type":"text","name":"Feature","content":"✓ Priority support","styles":{"fontSize":14,"color":"#ffffff"}}
  ]}
]}
`;

// FAQ Examples
export const AI_FAQ_EXAMPLES = `
FAQ ITEM:
{"type":"frame","name":"FAQ","styles":{"display":"flex","justifyContent":"space-between","alignItems":"center","padding":20,"backgroundColor":"#1c1c1c","borderRadius":16},"children":[
  {"type":"text","name":"Question","content":"What services do you offer?","styles":{"fontSize":16,"fontWeight":500,"color":"#ffffff"}},
  {"type":"frame","name":"Toggle","styles":{"backgroundColor":"#000000","borderRadius":50,"padding":8},"children":[]}
]}
`;

// Color Palettes
export const AI_COLOR_PALETTES = `
DARK THEME: bg=#000000, surface=#1c1c1c, surfaceDark=#141414, accent=#CAE8BD, text=#ffffff, textMuted=rgba(255,255,255,0.5)
LIGHT ELEGANT: bg=#F8F6F3, surface=#EBE9E4, accent=#FF5900, primary=#001666, text=#2A3132, textMuted=#5F6566
PLAYFUL: pink=#FFC9F0, yellow=#FFE68C, blue=#9DDCFF, cream=#FFFBF5, black=#000000
GRADIENT: purple=linear-gradient(135deg, #667eea 0%, #764ba2 100%), sunset=linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
`;

// Complete AI Reference (compact)
export const AI_DESIGN_REFERENCE = `
${AI_HERO_EXAMPLES}
${AI_CARD_EXAMPLES}
${AI_SECTION_EXAMPLES}
${AI_TESTIMONIAL_EXAMPLES}
${AI_PRICING_EXAMPLES}
${AI_FAQ_EXAMPLES}
${AI_COLOR_PALETTES}
`;

/**
 * System Prompt for OBJECTS Design Editor
 *
 * Instructs the AI to:
 * - Use <boltArtifact> tags for code output
 * - Use React + TypeScript + Tailwind
 * - Generate production-ready, visually stunning code
 */

export const SYSTEM_PROMPT = `You are OBJECTS, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

<system_constraints>
You are operating in a WebContainer environment, which is an in-browser Node.js runtime. This means:
- You can run JavaScript/TypeScript, including Node.js
- Native binaries cannot be executed (no C++, Rust, Go compilation)
- Python is limited to standard library only
- Git is NOT available - do not suggest git commands
- Prefer Vite for dev servers and building

Available shell commands: cat, cp, ls, mkdir, mv, rm, rmdir, touch, which, node, npm, npx
</system_constraints>

<code_formatting_info>
Use 2 spaces for code indentation.
Always use TypeScript (.tsx) for React components.
Always use Tailwind CSS for styling - NEVER use inline styles.
</code_formatting_info>

<artifact_instructions>
CRITICAL: All code changes MUST be wrapped in a single \`<boltArtifact>\` tag per response.

The artifact contains one or more \`<boltAction>\` tags with the following types:

1. **file** - Creates or updates a file:
\`\`\`xml
<boltAction type="file" filePath="src/components/Hero.tsx">
// Complete file content here
</boltAction>
\`\`\`

2. **shell** - Runs a shell command:
\`\`\`xml
<boltAction type="shell">
npm install lucide-react
</boltAction>
\`\`\`

3. **start** - Starts the dev server (use sparingly):
\`\`\`xml
<boltAction type="start">
npm run dev
</boltAction>
\`\`\`

IMPORTANT RULES:
- ALWAYS provide COMPLETE file contents - NEVER use placeholders like "// ... rest of code"
- NEVER use diffs or patches - always write the full file
- Order actions correctly: package.json changes first, then npm install, then other files
- Include all necessary imports
- Use relative imports within the project

Example artifact:
\`\`\`xml
<boltArtifact id="hero-component" title="Create Hero Component">
  <boltAction type="file" filePath="src/components/Hero.tsx">
import React from 'react';

interface HeroProps {
  title: string;
  subtitle: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600">
      <div className="text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">{title}</h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}
  </boltAction>
</boltArtifact>
\`\`\`
</artifact_instructions>

<canvas_instructions>
IMPORTANT: When creating UI layouts, generate BOTH visual canvas elements AND React code.

The "canvas" action creates VISUALLY EDITABLE elements that the user can drag, resize, and modify:

\`\`\`xml
<boltAction type="canvas">
{
  "elements": [
    {
      "type": "section",
      "name": "Hero Section",
      "styles": {
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
        "justifyContent": "center",
        "padding": 64,
        "gap": 24,
        "backgroundColor": "#0f172a",
        "minHeight": 600
      },
      "children": [
        {
          "type": "text",
          "name": "Title",
          "content": "Welcome to Our Platform",
          "styles": {
            "fontSize": 48,
            "fontWeight": 700,
            "color": "#ffffff",
            "textAlign": "center"
          }
        },
        {
          "type": "text",
          "name": "Subtitle",
          "content": "Build amazing products with our tools",
          "styles": {
            "fontSize": 20,
            "color": "#94a3b8",
            "textAlign": "center"
          }
        },
        {
          "type": "button",
          "name": "CTA Button",
          "content": "Get Started",
          "styles": {
            "backgroundColor": "#3b82f6",
            "color": "#ffffff",
            "padding": 16,
            "paddingLeft": 32,
            "paddingRight": 32,
            "borderRadius": 8,
            "fontSize": 16,
            "fontWeight": 600
          }
        }
      ]
    }
  ]
}
</boltAction>
\`\`\`

Available element types:
- **frame**: Generic container div
- **section**: Semantic section element
- **stack**: Flex column container
- **grid**: CSS grid container
- **container**: Centered max-width container
- **text**: Text content (p, span, h1-h6)
- **button**: Clickable button
- **link**: Anchor link (use href property)
- **image**: Image element (use src property)
- **input**: Form input (use placeholder, inputType properties)
- **icon**: Lucide icon (use iconName property, e.g., "ArrowRight", "Star")

Style properties (CSS in camelCase):
- Layout: display, flexDirection, justifyContent, alignItems, gap, flexWrap
- Spacing: padding, paddingTop/Right/Bottom/Left, margin, marginTop/Right/Bottom/Left
- Sizing: width, height, minWidth, minHeight, maxWidth, maxHeight
- Background: backgroundColor, backgroundImage
- Typography: fontSize, fontWeight, fontFamily, color, textAlign, lineHeight, letterSpacing
- Border: borderRadius, borderWidth, borderColor, borderStyle
- Effects: boxShadow, opacity, overflow

WORKFLOW:
1. When user asks to create UI, generate canvas elements FIRST
2. Then generate the corresponding React code as a file artifact
3. This allows user to visually edit the design AND have working code

Example response structure:
\`\`\`xml
<boltArtifact id="hero-section" title="Create Hero Section">
  <boltAction type="canvas">
  {
    "elements": [/* canvas elements here */]
  }
  </boltAction>
  <boltAction type="file" filePath="src/components/Hero.tsx">
  // React code here
  </boltAction>
</boltArtifact>
\`\`\`
</canvas_instructions>

<design_instructions>
You are a world-class designer. Create visually stunning, modern, production-ready UIs:

1. **Typography**: Use a clear hierarchy with font weights and sizes
2. **Colors**: Use cohesive color palettes, prefer gradients for backgrounds
3. **Spacing**: Use consistent padding/margin (Tailwind's spacing scale)
4. **Layout**: Use Flexbox/Grid via Tailwind (flex, grid, gap)
5. **Responsiveness**: Always include responsive breakpoints (sm:, md:, lg:)
6. **Animations**: Add subtle hover states and transitions
7. **Components**: Create reusable, well-structured components
8. **Accessibility**: Use semantic HTML, proper ARIA labels

Tailwind class examples:
- Backgrounds: \`bg-gradient-to-br from-violet-600 to-indigo-600\`
- Text: \`text-4xl font-bold text-white\`
- Layout: \`flex items-center justify-center min-h-screen\`
- Spacing: \`p-8 mx-auto max-w-4xl\`
- Responsive: \`text-2xl md:text-4xl lg:text-6xl\`
- Effects: \`hover:scale-105 transition-transform duration-300\`
- Shadows: \`shadow-xl shadow-violet-500/20\`
- Borders: \`rounded-2xl border border-white/10\`
</design_instructions>

<chain_of_thought>
Before writing code, BRIEFLY (2-4 lines max) outline your approach. Then provide the implementation.
</chain_of_thought>

When the user asks to modify existing code:
1. Review the current files provided in the context
2. Understand the existing structure and patterns
3. Make surgical changes while preserving the existing code style
4. Return the COMPLETE updated file(s)

When the user provides visual style changes (from the visual editor):
1. Identify the component being modified
2. Convert the style changes to appropriate Tailwind classes
3. Update the component with the new classes
4. Preserve all existing functionality
`;

/**
 * Format templates from Supabase as few-shot examples for AI
 *
 * Few-shot prompting is the key technique for consistent AI output.
 * By showing 3-5 high-quality examples, the AI learns the exact format.
 */
export function formatTemplatesForPrompt(templates: Array<{
  name?: string;
  type: string;
  style: string;
  description: string;
  json_structure: Record<string, unknown>;
}>): string {
  if (!templates || templates.length === 0) return '';

  // Format each template as a clear example
  const examples = templates.map((t, index) => {
    // Ensure the JSON structure follows our layout rules
    const structure = ensureLayoutRules(t.json_structure);
    const json = JSON.stringify(structure, null, 0); // Compact JSON

    return `EXAMPLE ${index + 1} - ${t.type.toUpperCase()} (${t.style}):
${json}`;
  });

  return examples.join('\n\n');
}

/**
 * Ensure template follows our layout rules (resizeX: 'fill' for row children)
 */
function ensureLayoutRules(structure: Record<string, unknown>): Record<string, unknown> {
  const result = { ...structure };

  // If this is a row, ensure children have resizeX: 'fill'
  if (result.type === 'row' && Array.isArray(result.children)) {
    result.children = (result.children as Record<string, unknown>[]).map(child => {
      const childCopy = { ...child };
      if (!childCopy.styles) childCopy.styles = {};
      if (typeof childCopy.styles === 'object') {
        (childCopy.styles as Record<string, unknown>).resizeX = 'fill';
      }
      // Recursively apply to nested children
      if (childCopy.children) {
        childCopy.children = (childCopy.children as Record<string, unknown>[]).map(
          c => ensureLayoutRules(c as Record<string, unknown>)
        );
      }
      return childCopy;
    });
  }

  // Recursively process children
  if (Array.isArray(result.children)) {
    result.children = (result.children as Record<string, unknown>[]).map(
      child => ensureLayoutRules(child as Record<string, unknown>)
    );
  }

  return result;
}

/**
 * Design Mode System Prompt
 * Instructs AI to output ONLY canvas elements in JSON format
 * RULES only - examples come from Supabase templates dynamically
 */
export const DESIGN_MODE_PROMPT = `You are a world-class designer creating website designs.

OUTPUT FORMAT: {"elements":[<section1>, <section2>, ...]}

ELEMENT TYPES:
• section: Full-width container (display:flex, flexDirection:column, resizeX:fill)
• row: Horizontal container (display:flex, flexDirection:row) - children MUST have "resizeX":"fill"
• frame: Card/container
• stack: Vertical stack
• text: Text with "content" property
• button: Button with "content" property
• image: Image with "src" (use Unsplash URLs)
• icon: Lucide icon with "iconName" property

CRITICAL LAYOUT RULES:
1. All children inside a "row" MUST have "resizeX":"fill" to distribute width equally
2. All sections should have display:"flex" and flexDirection:"column"
3. Use gap for spacing between children, padding for internal space
4. Never hardcode pixel widths on row children - use resizeX:"fill"

STYLE PROPERTIES:
• Layout: display, flexDirection, alignItems, justifyContent, gap, flexWrap
• Spacing: padding, paddingTop/Right/Bottom/Left
• Background: backgroundColor, backgroundImage
• Typography: fontSize (48-72 for titles, 16-20 for body), fontWeight (400-700), color
• Border: borderRadius (8-24), borderWidth, borderColor, borderStyle
• Sizing: resizeX ("fill" or "hug"), width/height (only for images)

OUTPUT RAW JSON ONLY. No markdown, no explanation, no code fences.`;

/**
 * Get design prompt with dynamic templates from Supabase
 * Templates are passed in, not hardcoded
 */
export function getDesignPromptWithTemplates(options?: {
  style?: string;
  pageType?: string;
  templates?: Array<{
    type: string;
    style: string;
    description: string;
    json_structure: Record<string, unknown>;
  }>;
}): string {
  let prompt = DESIGN_MODE_PROMPT;

  // Add color palettes
  prompt += `

COLOR PALETTES:
• Dark Modern: bg=#09090b, surface=#18181b, accent=#a855f7, text=#ffffff, muted=rgba(255,255,255,0.5)
• Light Elegant: bg=#FAFAF9, surface=#ffffff, accent=#18181b, text=#0a0a0a, muted=#71717a
• Playful: pink=#FFC9F0, yellow=#FFE68C, blue=#9DDCFF, cream=#FFFBF5, borders=#000000
• Gradient Purple: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
• Gradient Sunset: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
• Glass Dark: bg=rgba(255,255,255,0.05), border=rgba(255,255,255,0.1)`;

  // Add templates from Supabase as few-shot examples
  // This is the key technique for consistent, high-quality AI output
  if (options?.templates && options.templates.length > 0) {
    const examples = formatTemplatesForPrompt(options.templates);
    prompt += `

═══════════════════════════════════════════════════════════════
FEW-SHOT EXAMPLES - FOLLOW THESE PATTERNS EXACTLY
═══════════════════════════════════════════════════════════════
Study these examples carefully. They show the EXACT structure and styling you must use.
Note how row children always have "resizeX":"fill" for equal distribution.

${examples}

═══════════════════════════════════════════════════════════════
Generate designs that match these patterns in structure and quality.`;
  }

  return prompt;
}

/**
 * Design Style Presets
 * Users can select a style and the AI will generate designs in that style
 */
export type DesignStyle = 'modern-dark' | 'minimal-light' | 'bold-gradient' | 'elegant-luxury' | 'playful-colorful' | 'corporate-clean';

export const DESIGN_STYLE_PRESETS: Record<DesignStyle, { name: string; description: string; prompt: string }> = {
  'modern-dark': {
    name: 'Modern Dark',
    description: 'Sleek dark theme with subtle accents',
    prompt: `STYLE: Modern Dark
- Background: #0a0a0a, #111111, #1a1a1a
- Text: #ffffff (primary), rgba(255,255,255,0.6) (secondary)
- Accents: #c9a962 (gold) or #3b82f6 (blue)
- Typography: Clean, bold headlines with tight letter-spacing
- Borders: Subtle rgba(255,255,255,0.1) borders
- Buttons: Solid white or accent color, pill-shaped (borderRadius 50)`
  },
  'minimal-light': {
    name: 'Minimal Light',
    description: 'Clean white space with black typography',
    prompt: `STYLE: Minimal Light
- Background: #ffffff, #fafafa, #f5f5f5
- Text: #1a1a1a (primary), #666666 (secondary)
- Accents: #000000 or single brand color
- Typography: Elegant, lots of white space, generous line-height
- Borders: Light #e5e5e5 or none
- Buttons: Black with white text, subtle rounded corners (borderRadius 8-12)`
  },
  'bold-gradient': {
    name: 'Bold Gradient',
    description: 'Vibrant gradients with high contrast',
    prompt: `STYLE: Bold Gradient
- Background: Vibrant gradients like linear-gradient(135deg, #667eea 0%, #764ba2 100%) or linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
- Text: #ffffff with subtle text shadows for depth
- Accents: White or contrasting bright colors
- Typography: Extra bold headlines (fontWeight 800-900), large sizes
- Buttons: White with gradient text, or solid white
- Effects: Consider backdrop blur for glass effects`
  },
  'elegant-luxury': {
    name: 'Elegant Luxury',
    description: 'Sophisticated with gold accents',
    prompt: `STYLE: Elegant Luxury
- Background: #0a0a0a (deep black), #1c1917 (warm dark)
- Text: #ffffff, #f5f5f4 (warm white)
- Accents: #c9a962 (gold), #d4af37 (metallic gold)
- Typography: Elegant serif-like feel, generous letter-spacing on labels
- Borders: Gold accents rgba(201,169,98,0.3)
- Buttons: Gold accents, refined rounded corners
- Labels: Uppercase, spaced-out letters`
  },
  'playful-colorful': {
    name: 'Playful Colorful',
    description: 'Fun, bright colors with rounded shapes',
    prompt: `STYLE: Playful Colorful
- Background: Bright colors like #fef3c7, #dbeafe, #fce7f3, or multi-color gradients
- Text: Dark contrasting colors #1f2937, #7c3aed
- Accents: Multiple bright colors - purple, pink, yellow, teal
- Typography: Rounded, friendly fonts, bouncy feel
- Borders: Thick colorful borders, large border-radius (16-24)
- Buttons: Colorful with shadows, very rounded (borderRadius 20+)
- Effects: Playful shadows, slight rotations`
  },
  'corporate-clean': {
    name: 'Corporate Clean',
    description: 'Professional, trustworthy business look',
    prompt: `STYLE: Corporate Clean
- Background: #ffffff, #f8fafc, #f1f5f9
- Text: #0f172a (primary), #475569 (secondary)
- Accents: Professional blue #2563eb, or teal #0d9488
- Typography: Clear, readable, professional hierarchy
- Borders: Clean #e2e8f0 borders
- Buttons: Solid accent color, moderate rounding (borderRadius 6-8)
- Cards: White with subtle shadows`
  }
};

/**
 * Get style-enhanced design prompt
 */
export function getStyledDesignPrompt(style?: DesignStyle): string {
  let prompt = DESIGN_MODE_PROMPT;

  if (style && DESIGN_STYLE_PRESETS[style]) {
    prompt += `\n\n═══════════════════════════════════════════════════════════════
SELECTED DESIGN STYLE
═══════════════════════════════════════════════════════════════
${DESIGN_STYLE_PRESETS[style].prompt}

Apply this style consistently to all generated elements.`;
  }

  return prompt;
}

/**
 * Format design tokens for AI context
 */
export function formatDesignTokensForAI(tokens: {
  colors: Array<{ id: string; name: string; value: string; group?: string }>;
  radii: Array<{ id: string; name: string; value: number }>;
  spacing: Array<{ id: string; name: string; value: number }>;
}): string {
  const brandColors = tokens.colors.filter(c => c.group === 'brand');

  if (brandColors.length === 0) return '';

  return `
BRAND COLORS (use for accents, buttons, highlights):
${brandColors.map(c => `- ${c.name}: "${c.value}"`).join('\n')}
`;
}

/**
 * Format current canvas elements as context for AI
 * Kept minimal to avoid confusing the AI
 */
export function formatCanvasContextForAI(elements: Array<{
  id: string;
  type: string;
  name: string;
  styles?: Record<string, unknown>;
  content?: string;
  children?: string[];
}>): string {
  // Filter out page elements - only show actual content
  const contentElements = elements.filter(el => el.type !== 'page');

  // Only provide context if there are meaningful elements (more than 2)
  if (contentElements.length < 3) return '';

  // Just list section names to give theme context without overwhelming
  const sectionNames = contentElements
    .filter(el => el.type === 'section')
    .map(el => el.name)
    .slice(0, 5);

  if (sectionNames.length === 0) return '';

  return `\nExisting sections: ${sectionNames.join(', ')}. Generate complementary sections.`;
}

/**
 * Get the system prompt with optional context
 */
export function getSystemPrompt(options?: {
  mode?: 'design' | 'code';
  projectFiles?: string;
  designStyle?: DesignStyle;
  designTokens?: {
    colors: Array<{ id: string; name: string; value: string; group?: string }>;
    radii: Array<{ id: string; name: string; value: number }>;
    spacing: Array<{ id: string; name: string; value: number }>;
  };
  selectedElement?: {
    componentName: string;
    className: string;
    filePath?: string;
  };
  currentCanvas?: Array<{
    id: string;
    type: string;
    name: string;
    styles?: Record<string, unknown>;
    content?: string;
    children?: string[];
  }>;
  // Templates fetched from Supabase
  templates?: Array<{
    type: string;
    style: string;
    description: string;
    json_structure: Record<string, unknown>;
  }>;
}): string {
  // Use design prompt for design mode
  if (options?.mode === 'design') {
    // Start with dynamic template-based prompt
    let prompt = getDesignPromptWithTemplates({
      style: options.designStyle,
      templates: options.templates,
    });

    // Add design tokens context if provided
    if (options.designTokens) {
      prompt += '\n\n' + formatDesignTokensForAI(options.designTokens);
    }

    // Add current canvas context if provided
    if (options.currentCanvas && options.currentCanvas.length > 0) {
      prompt += '\n\n' + formatCanvasContextForAI(options.currentCanvas);
    }

    return prompt;
  }

  // Default to code mode with full system prompt
  let prompt = SYSTEM_PROMPT;

  if (options?.projectFiles) {
    prompt += `\n\n<current_project>\n${options.projectFiles}\n</current_project>`;
  }

  if (options?.selectedElement) {
    prompt += `\n\n<selected_element>
The user is currently editing: ${options.selectedElement.componentName}
Current classes: ${options.selectedElement.className}
${options.selectedElement.filePath ? `File: ${options.selectedElement.filePath}` : ''}
</selected_element>`;
  }

  return prompt;
}

/**
 * Format visual style changes as a prompt for the AI
 */
export function formatStyleChangesPrompt(
  elementInfo: {
    componentName: string;
    id: string;
    currentStyles: Record<string, string>;
  },
  changes: Record<string, string>
): string {
  const changesDescription = Object.entries(changes)
    .map(([prop, value]) => `- ${prop}: ${value}`)
    .join('\n');

  return `Update the "${elementInfo.componentName}" component (id: ${elementInfo.id}) with these style changes:

${changesDescription}

Convert these CSS values to appropriate Tailwind classes and update the component.
Return the complete updated component file.`;
}

/**
 * Common Tailwind mappings for CSS properties
 * Used as a reference for converting inline styles to Tailwind
 */
export const CSS_TO_TAILWIND: Record<string, (value: string) => string> = {
  // Colors
  backgroundColor: (v) => {
    if (v.startsWith('#')) {
      // Could map to closest Tailwind color
      return `bg-[${v}]`;
    }
    return `bg-${v}`;
  },
  color: (v) => {
    if (v.startsWith('#')) {
      return `text-[${v}]`;
    }
    return `text-${v}`;
  },

  // Layout
  display: (v) => {
    const map: Record<string, string> = {
      flex: 'flex',
      grid: 'grid',
      block: 'block',
      'inline-block': 'inline-block',
      'inline-flex': 'inline-flex',
      none: 'hidden',
    };
    return map[v] || '';
  },
  flexDirection: (v) => {
    const map: Record<string, string> = {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    };
    return map[v] || '';
  },
  justifyContent: (v) => {
    const map: Record<string, string> = {
      'flex-start': 'justify-start',
      'flex-end': 'justify-end',
      center: 'justify-center',
      'space-between': 'justify-between',
      'space-around': 'justify-around',
      'space-evenly': 'justify-evenly',
    };
    return map[v] || '';
  },
  alignItems: (v) => {
    const map: Record<string, string> = {
      'flex-start': 'items-start',
      'flex-end': 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    };
    return map[v] || '';
  },

  // Spacing
  padding: (v) => `p-[${v}]`,
  margin: (v) => `m-[${v}]`,
  gap: (v) => `gap-[${v}]`,

  // Typography
  fontSize: (v) => `text-[${v}]`,
  fontWeight: (v) => {
    const map: Record<string, string> = {
      '300': 'font-light',
      '400': 'font-normal',
      '500': 'font-medium',
      '600': 'font-semibold',
      '700': 'font-bold',
      '800': 'font-extrabold',
    };
    return map[v] || `font-[${v}]`;
  },
  textAlign: (v) => `text-${v}`,

  // Border
  borderRadius: (v) => `rounded-[${v}]`,
  borderWidth: (v) => `border-[${v}]`,
  borderColor: (v) => `border-[${v}]`,

  // Effects
  opacity: (v) => `opacity-${Math.round(parseFloat(v) * 100)}`,
  boxShadow: (v) => v === 'none' ? 'shadow-none' : `shadow-[${v.replace(/\s+/g, '_')}]`,
};

/**
 * Editable Code Generator
 *
 * Generates React code with Editable wrappers for visual editing.
 */

// ============================================
// TYPES
// ============================================

export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: ComponentNode[];
}

export interface GeneratedCode {
  /** The main component code */
  code: string;
  /** Import statements */
  imports: string[];
  /** Component dependencies */
  dependencies: string[];
}

// ============================================
// HELPERS
// ============================================

/**
 * Convert a value to a JSX prop string
 */
function propToString(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `{${value}}`;
  }
  if (value === null || value === undefined) {
    return '{null}';
  }
  if (Array.isArray(value) || typeof value === 'object') {
    return `{${JSON.stringify(value)}}`;
  }
  return `{${String(value)}}`;
}

/**
 * Generate props string for a component
 */
function generatePropsString(props: Record<string, unknown>): string {
  const entries = Object.entries(props).filter(
    ([key]) => key !== 'children' && !key.startsWith('_')
  );

  if (entries.length === 0) return '';

  return entries
    .map(([key, value]) => `${key}=${propToString(value)}`)
    .join(' ');
}

/**
 * Indent code by a number of spaces
 */
function indent(code: string, spaces: number): string {
  const padding = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line) => (line.trim() ? padding + line : line))
    .join('\n');
}

// ============================================
// CODE GENERATOR
// ============================================

/**
 * Generate code for a single component node with Editable wrapper
 */
function generateNodeCode(node: ComponentNode, depth: number = 0): string {
  const { id, type, props, children } = node;
  const indentSize = depth * 2;

  // Generate children code recursively
  const childrenCode = children
    ? children.map((child) => generateNodeCode(child, depth + 2)).join('\n')
    : null;

  // Props for the Editable wrapper
  const propsObject = JSON.stringify(props, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : ' '.repeat(indentSize + 8) + line))
    .join('\n');

  // Generate the Editable wrapper
  if (childrenCode) {
    return `${' '.repeat(indentSize)}<Editable
${' '.repeat(indentSize + 2)}id="${id}"
${' '.repeat(indentSize + 2)}component={${type}}
${' '.repeat(indentSize + 2)}props={${propsObject}}
${' '.repeat(indentSize)}>
${childrenCode}
${' '.repeat(indentSize)}</Editable>`;
  }

  return `${' '.repeat(indentSize)}<Editable
${' '.repeat(indentSize + 2)}id="${id}"
${' '.repeat(indentSize + 2)}component={${type}}
${' '.repeat(indentSize + 2)}props={${propsObject}}
${' '.repeat(indentSize)}/>`;
}

/**
 * Generate a complete React component file with Editable wrappers
 */
export function generateEditableComponent(
  componentName: string,
  nodes: ComponentNode[],
  options: {
    includeRuntime?: boolean;
    componentImports?: Record<string, string>;
  } = {}
): GeneratedCode {
  const { includeRuntime = true, componentImports = {} } = options;

  // Collect all component types used
  const usedComponents = new Set<string>();
  const collectComponents = (node: ComponentNode) => {
    usedComponents.add(node.type);
    node.children?.forEach(collectComponents);
  };
  nodes.forEach(collectComponents);

  // Generate imports
  const imports: string[] = ["import React from 'react';"];

  if (includeRuntime) {
    imports.push(
      "import { EditableProvider, Editable } from '@objects/editable-runtime';"
    );
  }

  // Add component imports
  usedComponents.forEach((comp) => {
    if (componentImports[comp]) {
      imports.push(componentImports[comp]);
    } else {
      // Default import from components folder
      imports.push(`import { ${comp} } from './components/${comp}';`);
    }
  });

  // Generate nodes code
  const nodesCode = nodes
    .map((node) => generateNodeCode(node, 3))
    .join('\n\n');

  // Generate the component
  const code = `${imports.join('\n')}

export default function ${componentName}() {
  return (
    <EditableProvider>
      <div className="min-h-screen">
${nodesCode}
      </div>
    </EditableProvider>
  );
}
`;

  return {
    code,
    imports,
    dependencies: ['@objects/editable-runtime', ...Array.from(usedComponents)],
  };
}

/**
 * Generate code from a design schema
 */
export function schemaToEditableCode(
  schema: {
    name: string;
    components: ComponentNode[];
  },
  options: {
    componentImports?: Record<string, string>;
  } = {}
): string {
  const result = generateEditableComponent(
    schema.name,
    schema.components,
    options
  );
  return result.code;
}

// ============================================
// EXAMPLE USAGE
// ============================================

/**
 * Example: Generate a landing page
 */
export function generateLandingPageExample(): string {
  const schema = {
    name: 'LandingPage',
    components: [
      {
        id: 'hero-section',
        type: 'Hero',
        props: {
          title: 'Build Faster',
          subtitle: 'Visual editing for modern web apps',
          ctaText: 'Get Started',
          ctaLink: '/signup',
        },
        children: [],
      },
      {
        id: 'features-section',
        type: 'Features',
        props: {
          title: 'Features',
        },
        children: [
          {
            id: 'feature-1',
            type: 'FeatureCard',
            props: {
              icon: 'zap',
              title: 'Fast',
              description: 'Lightning fast performance',
            },
          },
          {
            id: 'feature-2',
            type: 'FeatureCard',
            props: {
              icon: 'shield',
              title: 'Secure',
              description: 'Enterprise-grade security',
            },
          },
          {
            id: 'feature-3',
            type: 'FeatureCard',
            props: {
              icon: 'code',
              title: 'Developer First',
              description: 'Built for developers',
            },
          },
        ],
      },
      {
        id: 'cta-section',
        type: 'CTA',
        props: {
          title: 'Ready to start?',
          buttonText: 'Sign Up Free',
          buttonLink: '/signup',
        },
      },
    ],
  };

  return schemaToEditableCode(schema, {
    componentImports: {
      Hero: "import { Hero } from '@/components/Hero';",
      Features: "import { Features } from '@/components/Features';",
      FeatureCard: "import { FeatureCard } from '@/components/FeatureCard';",
      CTA: "import { CTA } from '@/components/CTA';",
    },
  });
}

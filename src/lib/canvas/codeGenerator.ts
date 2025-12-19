/**
 * Canvas to Code Generator
 *
 * Converts canvas elements to React/Tailwind code for WebContainer.
 * Supports full Tailwind CSS palette and responsive design.
 */

import { CanvasElement, ElementType, ElementStyles } from './types';
import { DesignChange, ChangeType } from '../design-to-code/DesignToCodeEngine';

// ============================================================================
// Tailwind Color Mappings (full palette)
// ============================================================================

const TAILWIND_COLORS: Record<string, string> = {
  // White/Black
  '#ffffff': 'white',
  '#000000': 'black',
  'transparent': 'transparent',

  // Gray
  '#f9fafb': 'gray-50',
  '#f3f4f6': 'gray-100',
  '#e5e7eb': 'gray-200',
  '#d1d5db': 'gray-300',
  '#9ca3af': 'gray-400',
  '#6b7280': 'gray-500',
  '#4b5563': 'gray-600',
  '#374151': 'gray-700',
  '#1f2937': 'gray-800',
  '#111827': 'gray-900',
  '#030712': 'gray-950',

  // Slate
  '#f8fafc': 'slate-50',
  '#f1f5f9': 'slate-100',
  '#e2e8f0': 'slate-200',
  '#cbd5e1': 'slate-300',
  '#94a3b8': 'slate-400',
  '#64748b': 'slate-500',
  '#475569': 'slate-600',
  '#334155': 'slate-700',
  '#1e293b': 'slate-800',
  '#0f172a': 'slate-900',

  // Red
  '#fef2f2': 'red-50',
  '#fee2e2': 'red-100',
  '#fecaca': 'red-200',
  '#fca5a5': 'red-300',
  '#f87171': 'red-400',
  '#ef4444': 'red-500',
  '#dc2626': 'red-600',
  '#b91c1c': 'red-700',
  '#991b1b': 'red-800',
  '#7f1d1d': 'red-900',

  // Orange
  '#fff7ed': 'orange-50',
  '#ffedd5': 'orange-100',
  '#fed7aa': 'orange-200',
  '#fdba74': 'orange-300',
  '#fb923c': 'orange-400',
  '#f97316': 'orange-500',
  '#ea580c': 'orange-600',
  '#c2410c': 'orange-700',

  // Amber
  '#fffbeb': 'amber-50',
  '#fef3c7': 'amber-100',
  '#fde68a': 'amber-200',
  '#fcd34d': 'amber-300',
  '#fbbf24': 'amber-400',
  '#f59e0b': 'amber-500',
  '#d97706': 'amber-600',
  '#b45309': 'amber-700',

  // Yellow
  '#fefce8': 'yellow-50',
  '#fef9c3': 'yellow-100',
  '#fef08a': 'yellow-200',
  '#fde047': 'yellow-300',
  '#facc15': 'yellow-400',
  '#eab308': 'yellow-500',

  // Green
  '#f0fdf4': 'green-50',
  '#dcfce7': 'green-100',
  '#bbf7d0': 'green-200',
  '#86efac': 'green-300',
  '#4ade80': 'green-400',
  '#22c55e': 'green-500',
  '#16a34a': 'green-600',
  '#15803d': 'green-700',
  '#166534': 'green-800',
  '#14532d': 'green-900',

  // Emerald
  '#ecfdf5': 'emerald-50',
  '#d1fae5': 'emerald-100',
  '#a7f3d0': 'emerald-200',
  '#6ee7b7': 'emerald-300',
  '#34d399': 'emerald-400',
  '#10b981': 'emerald-500',
  '#059669': 'emerald-600',
  '#047857': 'emerald-700',

  // Teal
  '#f0fdfa': 'teal-50',
  '#ccfbf1': 'teal-100',
  '#99f6e4': 'teal-200',
  '#5eead4': 'teal-300',
  '#2dd4bf': 'teal-400',
  '#14b8a6': 'teal-500',
  '#0d9488': 'teal-600',
  '#0f766e': 'teal-700',

  // Cyan
  '#ecfeff': 'cyan-50',
  '#cffafe': 'cyan-100',
  '#a5f3fc': 'cyan-200',
  '#67e8f9': 'cyan-300',
  '#22d3ee': 'cyan-400',
  '#06b6d4': 'cyan-500',
  '#0891b2': 'cyan-600',
  '#0e7490': 'cyan-700',

  // Blue
  '#eff6ff': 'blue-50',
  '#dbeafe': 'blue-100',
  '#bfdbfe': 'blue-200',
  '#93c5fd': 'blue-300',
  '#60a5fa': 'blue-400',
  '#3b82f6': 'blue-500',
  '#2563eb': 'blue-600',
  '#1d4ed8': 'blue-700',
  '#1e40af': 'blue-800',
  '#1e3a8a': 'blue-900',

  // Indigo
  '#eef2ff': 'indigo-50',
  '#e0e7ff': 'indigo-100',
  '#c7d2fe': 'indigo-200',
  '#a5b4fc': 'indigo-300',
  '#818cf8': 'indigo-400',
  '#6366f1': 'indigo-500',
  '#4f46e5': 'indigo-600',
  '#4338ca': 'indigo-700',
  '#3730a3': 'indigo-800',
  '#312e81': 'indigo-900',

  // Violet
  '#f5f3ff': 'violet-50',
  '#ede9fe': 'violet-100',
  '#ddd6fe': 'violet-200',
  '#c4b5fd': 'violet-300',
  '#a78bfa': 'violet-400',
  '#8b5cf6': 'violet-500',
  '#7c3aed': 'violet-600',
  '#6d28d9': 'violet-700',
  '#5b21b6': 'violet-800',
  '#4c1d95': 'violet-900',

  // Brand colors (OBJECTS theme)
  '#8B1E2B': 'rose-800',
  '#A83248': 'rose-700',

  // Purple
  '#faf5ff': 'purple-50',
  '#f3e8ff': 'purple-100',
  '#e9d5ff': 'purple-200',
  '#d8b4fe': 'purple-300',
  '#c084fc': 'purple-400',
  '#a855f7': 'purple-500',
  '#9333ea': 'purple-600',
  '#7e22ce': 'purple-700',
  '#6b21a8': 'purple-800',
  '#581c87': 'purple-900',

  // Pink
  '#fdf2f8': 'pink-50',
  '#fce7f3': 'pink-100',
  '#fbcfe8': 'pink-200',
  '#f9a8d4': 'pink-300',
  '#f472b6': 'pink-400',
  '#ec4899': 'pink-500',
  '#db2777': 'pink-600',
  '#be185d': 'pink-700',
  '#9d174d': 'pink-800',
  '#831843': 'pink-900',

  // Rose
  '#fff1f2': 'rose-50',
  '#ffe4e6': 'rose-100',
  '#fecdd3': 'rose-200',
  '#fda4af': 'rose-300',
  '#fb7185': 'rose-400',
  '#f43f5e': 'rose-500',
  '#e11d48': 'rose-600',
  '#be123c': 'rose-700',
};

// Convert hex color to Tailwind class
function colorToTailwind(hex: string, prefix: 'bg' | 'text' | 'border'): string {
  const normalized = hex.toLowerCase();
  const tailwindColor = TAILWIND_COLORS[normalized];
  if (tailwindColor) {
    return `${prefix}-${tailwindColor}`;
  }
  return `${prefix}-[${hex}]`;
}

// Parse grid template columns to Tailwind
function parseGridColumns(gridTemplateColumns: string): string {
  // Match repeat(n, 1fr) pattern
  const repeatMatch = gridTemplateColumns.match(/repeat\((\d+),\s*1fr\)/);
  if (repeatMatch) {
    const cols = parseInt(repeatMatch[1], 10);
    if (cols >= 1 && cols <= 12) {
      return `grid-cols-${cols}`;
    }
    return `grid-cols-[repeat(${cols},minmax(0,1fr))]`;
  }

  // Count number of columns
  const parts = gridTemplateColumns.split(/\s+/).filter(Boolean);
  if (parts.length >= 1 && parts.length <= 12 && parts.every(p => p === '1fr')) {
    return `grid-cols-${parts.length}`;
  }

  return `grid-cols-[${gridTemplateColumns.replace(/\s+/g, '_')}]`;
}

// ============================================================================
// Main Style Converter
// ============================================================================

function stylesToTailwind(styles: ElementStyles, element: CanvasElement): string {
  const classes: string[] = [];

  // Display & Flex
  if (styles.display === 'flex') {
    classes.push('flex');
    if (styles.flexDirection === 'column') classes.push('flex-col');
    if (styles.flexDirection === 'row') classes.push('flex-row');

    if (styles.justifyContent) {
      const justifyMap: Record<string, string> = {
        'flex-start': 'justify-start',
        'center': 'justify-center',
        'flex-end': 'justify-end',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
        'space-evenly': 'justify-evenly',
      };
      if (justifyMap[styles.justifyContent]) {
        classes.push(justifyMap[styles.justifyContent]);
      }
    }

    if (styles.alignItems) {
      const alignMap: Record<string, string> = {
        'flex-start': 'items-start',
        'center': 'items-center',
        'flex-end': 'items-end',
        'stretch': 'items-stretch',
        'baseline': 'items-baseline',
      };
      if (alignMap[styles.alignItems]) {
        classes.push(alignMap[styles.alignItems]);
      }
    }
  }

  // Grid
  if (styles.display === 'grid') {
    classes.push('grid');
    if (styles.gridTemplateColumns) {
      classes.push(parseGridColumns(styles.gridTemplateColumns));
    }
  }

  // Inline displays
  if (styles.display === 'inline') classes.push('inline');
  if (styles.display === 'inline-block') classes.push('inline-block');
  if (styles.display === 'block') classes.push('block');

  // Gap
  if (styles.gap) {
    const gapMap: Record<number, string> = {
      0: 'gap-0',
      1: 'gap-px',
      2: 'gap-0.5',
      4: 'gap-1',
      6: 'gap-1.5',
      8: 'gap-2',
      10: 'gap-2.5',
      12: 'gap-3',
      14: 'gap-3.5',
      16: 'gap-4',
      20: 'gap-5',
      24: 'gap-6',
      28: 'gap-7',
      32: 'gap-8',
      36: 'gap-9',
      40: 'gap-10',
      48: 'gap-12',
      64: 'gap-16',
    };
    classes.push(gapMap[styles.gap] || `gap-[${styles.gap}px]`);
  }

  // Padding - uniform
  if (styles.padding !== undefined) {
    const paddingMap: Record<number, string> = {
      0: 'p-0',
      1: 'p-px',
      2: 'p-0.5',
      4: 'p-1',
      6: 'p-1.5',
      8: 'p-2',
      10: 'p-2.5',
      12: 'p-3',
      14: 'p-3.5',
      16: 'p-4',
      20: 'p-5',
      24: 'p-6',
      28: 'p-7',
      32: 'p-8',
      36: 'p-9',
      40: 'p-10',
      48: 'p-12',
      64: 'p-16',
    };
    classes.push(paddingMap[styles.padding] || `p-[${styles.padding}px]`);
  }

  // Padding - individual sides
  if (styles.paddingTop !== undefined && styles.paddingTop !== styles.padding) {
    classes.push(`pt-[${styles.paddingTop}px]`);
  }
  if (styles.paddingRight !== undefined && styles.paddingRight !== styles.padding) {
    classes.push(`pr-[${styles.paddingRight}px]`);
  }
  if (styles.paddingBottom !== undefined && styles.paddingBottom !== styles.padding) {
    classes.push(`pb-[${styles.paddingBottom}px]`);
  }
  if (styles.paddingLeft !== undefined && styles.paddingLeft !== styles.padding) {
    classes.push(`pl-[${styles.paddingLeft}px]`);
  }

  // Margin
  if (styles.margin !== undefined) {
    const marginMap: Record<number, string> = {
      0: 'm-0',
      4: 'm-1',
      8: 'm-2',
      12: 'm-3',
      16: 'm-4',
      20: 'm-5',
      24: 'm-6',
      32: 'm-8',
    };
    classes.push(marginMap[styles.margin] || `m-[${styles.margin}px]`);
  }

  // Background color - use full palette
  if (styles.backgroundColor) {
    classes.push(colorToTailwind(styles.backgroundColor, 'bg'));
  }

  // Border radius
  if (styles.borderRadius !== undefined) {
    const radiusMap: Record<number, string> = {
      0: 'rounded-none',
      2: 'rounded-sm',
      4: 'rounded',
      6: 'rounded-md',
      8: 'rounded-lg',
      12: 'rounded-xl',
      16: 'rounded-2xl',
      24: 'rounded-3xl',
      9999: 'rounded-full',
    };
    classes.push(radiusMap[styles.borderRadius] || `rounded-[${styles.borderRadius}px]`);
  }

  // Border
  if (styles.borderWidth && styles.borderWidth > 0) {
    const borderWidthMap: Record<number, string> = {
      1: 'border',
      2: 'border-2',
      4: 'border-4',
      8: 'border-8',
    };
    classes.push(borderWidthMap[styles.borderWidth] || `border-[${styles.borderWidth}px]`);

    if (styles.borderColor) {
      classes.push(colorToTailwind(styles.borderColor, 'border'));
    }

    if (styles.borderStyle && styles.borderStyle !== 'solid') {
      classes.push(`border-${styles.borderStyle}`);
    }
  }

  // Text color - use full palette
  if (styles.color) {
    classes.push(colorToTailwind(styles.color, 'text'));
  }

  // Font size
  if (styles.fontSize) {
    const fontSizeMap: Record<number, string> = {
      10: 'text-[10px]',
      12: 'text-xs',
      14: 'text-sm',
      16: 'text-base',
      18: 'text-lg',
      20: 'text-xl',
      24: 'text-2xl',
      30: 'text-3xl',
      36: 'text-4xl',
      48: 'text-5xl',
      60: 'text-6xl',
      72: 'text-7xl',
      96: 'text-8xl',
      128: 'text-9xl',
    };
    classes.push(fontSizeMap[styles.fontSize] || `text-[${styles.fontSize}px]`);
  }

  // Font weight
  if (styles.fontWeight) {
    const weightMap: Record<string | number, string> = {
      100: 'font-thin',
      200: 'font-extralight',
      300: 'font-light',
      400: 'font-normal',
      500: 'font-medium',
      600: 'font-semibold',
      700: 'font-bold',
      800: 'font-extrabold',
      900: 'font-black',
    };
    const w = weightMap[styles.fontWeight];
    if (w) classes.push(w);
  }

  // Text align
  if (styles.textAlign) {
    const textAlignMap: Record<string, string> = {
      'left': 'text-left',
      'center': 'text-center',
      'right': 'text-right',
    };
    if (textAlignMap[styles.textAlign]) {
      classes.push(textAlignMap[styles.textAlign]);
    }
  }

  // Line height
  if (styles.lineHeight) {
    const lineHeightMap: Record<number, string> = {
      1: 'leading-none',
      1.25: 'leading-tight',
      1.375: 'leading-snug',
      1.5: 'leading-normal',
      1.625: 'leading-relaxed',
      2: 'leading-loose',
    };
    classes.push(lineHeightMap[styles.lineHeight] || `leading-[${styles.lineHeight}]`);
  }

  // Overflow
  if (styles.overflow) {
    classes.push(`overflow-${styles.overflow}`);
  }

  // Opacity
  if (styles.opacity !== undefined && styles.opacity < 1) {
    const opacityMap: Record<number, string> = {
      0: 'opacity-0',
      0.05: 'opacity-5',
      0.1: 'opacity-10',
      0.2: 'opacity-20',
      0.25: 'opacity-25',
      0.3: 'opacity-30',
      0.4: 'opacity-40',
      0.5: 'opacity-50',
      0.6: 'opacity-60',
      0.7: 'opacity-70',
      0.75: 'opacity-75',
      0.8: 'opacity-80',
      0.9: 'opacity-90',
      0.95: 'opacity-95',
    };
    classes.push(opacityMap[styles.opacity] || `opacity-[${Math.round(styles.opacity * 100)}%]`);
  }

  // Box shadow
  if (styles.boxShadow) {
    const shadowMap: Record<string, string> = {
      'none': 'shadow-none',
      '0 1px 2px 0 rgb(0 0 0 / 0.05)': 'shadow-sm',
      '0 1px 3px 0 rgb(0 0 0 / 0.1)': 'shadow',
      '0 4px 6px -1px rgb(0 0 0 / 0.1)': 'shadow-md',
      '0 10px 15px -3px rgb(0 0 0 / 0.1)': 'shadow-lg',
      '0 20px 25px -5px rgb(0 0 0 / 0.1)': 'shadow-xl',
      '0 25px 50px -12px rgb(0 0 0 / 0.25)': 'shadow-2xl',
    };
    classes.push(shadowMap[styles.boxShadow] || 'shadow');
  }

  return classes.filter(Boolean).join(' ');
}

// ============================================================================
// Size Helpers
// ============================================================================

function sizeToTailwind(width: number, height: number, element: CanvasElement): string {
  const sizeClasses: string[] = [];

  // Width mapping
  const widthMap: Record<number, string> = {
    0: 'w-0',
    16: 'w-4',
    20: 'w-5',
    24: 'w-6',
    32: 'w-8',
    40: 'w-10',
    48: 'w-12',
    64: 'w-16',
    80: 'w-20',
    96: 'w-24',
    128: 'w-32',
    160: 'w-40',
    192: 'w-48',
    224: 'w-56',
    256: 'w-64',
    288: 'w-72',
    320: 'w-80',
    384: 'w-96',
  };

  // Height mapping
  const heightMap: Record<number, string> = {
    0: 'h-0',
    16: 'h-4',
    20: 'h-5',
    24: 'h-6',
    32: 'h-8',
    40: 'h-10',
    44: 'h-11',
    48: 'h-12',
    64: 'h-16',
    80: 'h-20',
    96: 'h-24',
    128: 'h-32',
    160: 'h-40',
    192: 'h-48',
    256: 'h-64',
    320: 'h-80',
    384: 'h-96',
  };

  // For containers with flex/grid, often we want auto sizing
  const isContainer = ['frame', 'stack', 'grid'].includes(element.type);

  if (!isContainer || width > 0) {
    sizeClasses.push(widthMap[width] || `w-[${width}px]`);
  }

  if (!isContainer || height > 0) {
    sizeClasses.push(heightMap[height] || `h-[${height}px]`);
  }

  return sizeClasses.join(' ');
}

// Get hover classes for interactive elements (using element variants if available)
function getInteractiveClasses(element: CanvasElement): string {
  const classes: string[] = [];

  // If element has custom variants, use those
  if (element.variants && element.variants.length > 0) {
    // Add transition if any variant has transition settings
    const hasTransition = element.variants.some(v => v.transition);
    if (hasTransition) {
      classes.push('transition-all');
    }

    // Generate hover classes from hover variant
    const hoverVariant = element.variants.find(v => v.type === 'hover');
    if (hoverVariant && hoverVariant.styles) {
      if (hoverVariant.styles.opacity !== undefined) {
        classes.push(`hover:opacity-${Math.round(hoverVariant.styles.opacity * 100)}`);
      }
      if (hoverVariant.styles.backgroundColor) {
        classes.push(`hover:${colorToTailwind(hoverVariant.styles.backgroundColor, 'bg')}`);
      }
      if (hoverVariant.styles.transform) {
        // Parse transform for scale
        const scaleMatch = hoverVariant.styles.transform.match(/scale\(([\d.]+)\)/);
        if (scaleMatch) {
          classes.push(`hover:scale-[${scaleMatch[1]}]`);
        }
      }
    }

    // Generate active classes from active variant
    const activeVariant = element.variants.find(v => v.type === 'active');
    if (activeVariant && activeVariant.styles) {
      if (activeVariant.styles.opacity !== undefined) {
        classes.push(`active:opacity-${Math.round(activeVariant.styles.opacity * 100)}`);
      }
      if (activeVariant.styles.transform) {
        const scaleMatch = activeVariant.styles.transform.match(/scale\(([\d.]+)\)/);
        if (scaleMatch) {
          classes.push(`active:scale-[${scaleMatch[1]}]`);
        }
      }
    }

    // Generate focus classes from focus variant
    const focusVariant = element.variants.find(v => v.type === 'focus');
    if (focusVariant && focusVariant.styles) {
      if (focusVariant.styles.borderColor) {
        classes.push(`focus:${colorToTailwind(focusVariant.styles.borderColor, 'border')}`);
      }
      if (focusVariant.styles.boxShadow) {
        classes.push('focus:ring-2', 'focus:ring-offset-2');
      }
    }

    // Generate disabled classes from disabled variant
    const disabledVariant = element.variants.find(v => v.type === 'disabled');
    if (disabledVariant && disabledVariant.styles) {
      if (disabledVariant.styles.opacity !== undefined) {
        classes.push(`disabled:opacity-${Math.round(disabledVariant.styles.opacity * 100)}`);
      }
      classes.push('disabled:cursor-not-allowed');
    }

    // Add cursor pointer for interactive elements
    if (['button', 'link'].includes(element.type)) {
      classes.push('cursor-pointer');
    }

    return classes.join(' ');
  }

  // Default interactive classes (fallback when no custom variants)
  switch (element.type) {
    case 'button':
      // Darken background on hover
      if (element.styles.backgroundColor) {
        const bgClass = colorToTailwind(element.styles.backgroundColor, 'bg');
        // Try to get a darker variant
        const colorMatch = bgClass.match(/bg-(\w+)-(\d+)/);
        if (colorMatch) {
          const [, color, shade] = colorMatch;
          const darkerShade = Math.min(parseInt(shade) + 100, 900);
          classes.push(`hover:bg-${color}-${darkerShade}`);
        } else {
          classes.push('hover:opacity-90');
        }
      }
      classes.push('transition-colors', 'cursor-pointer', 'active:scale-[0.98]');
      break;

    case 'link':
      if (element.styles.color) {
        const textClass = colorToTailwind(element.styles.color, 'text');
        const colorMatch = textClass.match(/text-(\w+)-(\d+)/);
        if (colorMatch) {
          const [, color, shade] = colorMatch;
          const darkerShade = Math.min(parseInt(shade) + 100, 900);
          classes.push(`hover:text-${color}-${darkerShade}`);
        }
      }
      classes.push('transition-colors', 'cursor-pointer');
      break;

    case 'input':
      classes.push(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-indigo-500',
        'focus:border-transparent',
        'transition-all'
      );
      break;
  }

  return classes.join(' ');
}

// ============================================================================
// JSX Generator
// ============================================================================

function generateElementJSX(
  element: CanvasElement,
  elements: Record<string, CanvasElement>,
  indent: string = '      '
): string {
  const tailwindClasses = stylesToTailwind(element.styles, element);
  const sizeClasses = sizeToTailwind(element.size.width, element.size.height, element);
  const interactiveClasses = getInteractiveClasses(element);

  // Combine all classes
  const allClasses = [tailwindClasses, sizeClasses, interactiveClasses]
    .filter(Boolean)
    .join(' ');

  // Recursively generate children
  const children = element.children
    .map(id => elements[id])
    .filter(Boolean)
    .filter(child => child.visible !== false)
    .map(child => generateElementJSX(child, elements, indent + '  '))
    .join('\n');

  const dataId = `data-objects-id="${element.id}"`;

  switch (element.type) {
    case 'frame':
    case 'stack':
    case 'grid':
      const containerClasses = allClasses || 'p-4 bg-gray-100 rounded-lg';
      if (children) {
        return `${indent}<div ${dataId} className="${containerClasses}">
${children}
${indent}</div>`;
      }
      return `${indent}<div ${dataId} className="${containerClasses}" />`;

    case 'text':
      const textClasses = allClasses || 'text-base text-gray-800';
      const textContent = escapeJSX(element.content || 'Add your text here');
      return `${indent}<p ${dataId} className="${textClasses}">
${indent}  ${textContent}
${indent}</p>`;

    case 'button':
      const buttonClasses = allClasses || 'py-3 px-6 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer';
      const buttonContent = escapeJSX(element.content || 'Button');
      return `${indent}<button ${dataId} className="${buttonClasses}">
${indent}  ${buttonContent}
${indent}</button>`;

    case 'image':
      const imgClasses = allClasses || 'object-cover rounded-lg';
      const imgSrc = element.src || 'https://via.placeholder.com/200x150';
      const imgAlt = escapeJSX(element.alt || 'Image');
      return `${indent}<img
${indent}  ${dataId}
${indent}  src="${imgSrc}"
${indent}  alt="${imgAlt}"
${indent}  className="${imgClasses}"
${indent}/>`;

    case 'input':
      const inputClasses = allClasses || 'py-3 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
      const placeholder = escapeJSX(element.placeholder || 'Enter text...');
      return `${indent}<input
${indent}  ${dataId}
${indent}  type="${element.inputType || 'text'}"
${indent}  placeholder="${placeholder}"
${indent}  className="${inputClasses}"
${indent}/>`;

    case 'link':
      const linkClasses = allClasses || 'text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer';
      const linkContent = escapeJSX(element.content || 'Link text');
      return `${indent}<a ${dataId} href="#" className="${linkClasses}">
${indent}  ${linkContent}
${indent}</a>`;

    default:
      if (children) {
        return `${indent}<div ${dataId} className="${allClasses}">
${children}
${indent}</div>`;
      }
      return `${indent}<div ${dataId} className="${allClasses}" />`;
  }
}

// Escape special characters for JSX
function escapeJSX(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');
}

// Generate full App.jsx code from canvas elements
export function generateAppCode(
  elements: Record<string, CanvasElement>,
  rootElementId: string
): string {
  const rootElement = elements[rootElementId];
  if (!rootElement) {
    return generateEmptyApp();
  }

  const childrenJSX = rootElement.children
    .map(id => elements[id])
    .filter(Boolean)
    .map(child => generateElementJSX(child, elements))
    .join('\n\n');

  if (!childrenJSX || rootElement.children.length === 0) {
    return generateEmptyApp();
  }

  return `import React from 'react';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '${rootElement.styles.backgroundColor || '#ffffff'}' }} className="p-8">
${childrenJSX}
    </div>
  );
}

export default App;
`;
}

// Generate empty app placeholder
function generateEmptyApp(): string {
  return `import React from 'react';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }} className="flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-6xl mb-4">🎨</div>
        <h1 className="text-2xl font-bold mb-2">Start Building</h1>
        <p className="text-gray-400">Add elements in the canvas to see them here</p>
      </div>
    </div>
  );
}

export default App;
`;
}

// Generate animation CSS from elements
function generateAnimationCSS(elements: Record<string, CanvasElement>): string {
  const animationCSS: string[] = [];

  for (const element of Object.values(elements)) {
    if (!element.animations || element.animations.length === 0) continue;

    for (const animation of element.animations) {
      // Generate keyframe name
      const keyframeName = `anim-${animation.id}`;

      // Generate keyframes
      let keyframes = `@keyframes ${keyframeName} {\n`;
      for (const kf of animation.keyframes) {
        const percent = Math.round(kf.offset * 100);
        keyframes += `  ${percent}% {\n`;

        // Handle transforms
        const transforms: string[] = [];
        if ((kf.styles as any).x !== undefined) transforms.push(`translateX(${(kf.styles as any).x}px)`);
        if ((kf.styles as any).y !== undefined) transforms.push(`translateY(${(kf.styles as any).y}px)`);
        if ((kf.styles as any).scale !== undefined) transforms.push(`scale(${(kf.styles as any).scale})`);
        if ((kf.styles as any).rotate !== undefined) transforms.push(`rotate(${(kf.styles as any).rotate}deg)`);
        if (transforms.length > 0) {
          keyframes += `    transform: ${transforms.join(' ')};\n`;
        }

        // Handle other properties
        if ((kf.styles as any).opacity !== undefined) {
          keyframes += `    opacity: ${(kf.styles as any).opacity};\n`;
        }

        keyframes += `  }\n`;
      }
      keyframes += `}\n\n`;

      // Generate animation property for element
      const iterations = animation.iterations === 'infinite' ? 'infinite' : animation.iterations;
      const elementAnimation = `[data-objects-id="${element.id}"] {\n  animation: ${keyframeName} ${animation.duration}ms ${animation.easing} ${animation.delay}ms ${iterations} ${animation.direction} ${animation.fillMode};\n}\n`;

      animationCSS.push(keyframes + elementAnimation);
    }
  }

  return animationCSS.join('\n');
}

// Generate all files needed for WebContainer
export function generateProjectFiles(
  elements: Record<string, CanvasElement>,
  rootElementId: string
): Record<string, string> {
  const appCode = generateAppCode(elements, rootElementId);
  const animationCSS = generateAnimationCSS(elements);

  return {
    'src/App.jsx': appCode,
    'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom Animations */
${animationCSS}
`,
    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OBJECTS - Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
    'package.json': JSON.stringify({
      name: 'objects-preview',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.1',
        autoprefixer: '^10.4.18',
        postcss: '^8.4.35',
        tailwindcss: '^3.4.1',
        vite: '^5.1.4',
      },
    }, null, 2),
    'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: true }
});
`,
    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
`,
    'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,
  };
}

// ============================================================================
// Bridge to DesignToCodeEngine
// ============================================================================

/**
 * Convert a canvas element style change to a DesignChange
 */
export function createStyleChange(
  element: CanvasElement,
  styleChanges: Partial<ElementStyles>
): Omit<DesignChange, 'timestamp'> {
  return {
    type: 'style',
    elementId: element.id,
    file: 'src/App.jsx',
    component: element.componentName || element.type,
    change: styleChanges,
  };
}

/**
 * Convert a canvas element content change to a DesignChange
 */
export function createContentChange(
  element: CanvasElement,
  newContent: string
): Omit<DesignChange, 'timestamp'> {
  return {
    type: 'content',
    elementId: element.id,
    file: 'src/App.jsx',
    component: element.componentName || element.type,
    change: { text: newContent },
  };
}

/**
 * Convert a canvas element move to a DesignChange
 */
export function createMoveChange(
  element: CanvasElement,
  from: { parent: string; index: number },
  to: { parent: string; index: number }
): Omit<DesignChange, 'timestamp'> {
  return {
    type: 'move',
    elementId: element.id,
    file: 'src/App.jsx',
    component: element.componentName || element.type,
    change: { from, to },
  };
}

/**
 * Convert a canvas element add to a DesignChange
 */
export function createAddChange(
  element: CanvasElement,
  parentId: string,
  index: number
): Omit<DesignChange, 'timestamp'> {
  return {
    type: 'add',
    elementId: element.id,
    file: 'src/App.jsx',
    component: element.componentName || element.type,
    change: {
      component: element.type,
      props: {
        className: stylesToTailwind(element.styles, element),
        ...(element.content && { children: element.content }),
        ...(element.src && { src: element.src }),
        ...(element.placeholder && { placeholder: element.placeholder }),
      },
      parent: parentId,
      index,
    },
  };
}

/**
 * Convert a canvas element delete to a DesignChange
 */
export function createDeleteChange(
  element: CanvasElement
): Omit<DesignChange, 'timestamp'> {
  return {
    type: 'delete',
    elementId: element.id,
    file: 'src/App.jsx',
    component: element.componentName || element.type,
    change: {},
  };
}

/**
 * Generate Tailwind class string from ElementStyles
 * Exported for use in other modules
 */
export function getElementTailwindClasses(element: CanvasElement): string {
  const styleClasses = stylesToTailwind(element.styles, element);
  const sizeClasses = sizeToTailwind(element.size.width, element.size.height, element);
  const interactiveClasses = getInteractiveClasses(element);

  return [styleClasses, sizeClasses, interactiveClasses]
    .filter(Boolean)
    .join(' ');
}

/**
 * Batch multiple canvas changes into DesignChanges
 */
export function batchCanvasChanges(
  changes: Array<{
    type: ChangeType;
    element: CanvasElement;
    data?: Record<string, unknown>;
  }>
): Array<Omit<DesignChange, 'timestamp'>> {
  return changes.map(({ type, element, data }) => {
    switch (type) {
      case 'style':
        return createStyleChange(element, data as Partial<ElementStyles>);
      case 'content':
        return createContentChange(element, data?.text as string);
      case 'delete':
        return createDeleteChange(element);
      case 'add':
        return createAddChange(
          element,
          data?.parentId as string,
          data?.index as number
        );
      default:
        return {
          type,
          elementId: element.id,
          file: 'src/App.jsx',
          component: element.componentName || element.type,
          change: data || {},
        };
    }
  });
}

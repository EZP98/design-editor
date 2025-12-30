/**
 * Export Manager
 *
 * Handles exporting designs to multiple formats:
 * - React: TSX component with Tailwind CSS
 * - HTML: Static HTML with inline styles
 * - PNG: Screenshot of the canvas
 * - PDF: Multi-page PDF document
 */

import { CanvasElement, ElementStyles } from '../canvas/types';
import { useCanvasStore } from '../canvas/canvasStore';

// ============================================
// TYPES
// ============================================

export type ExportFormat = 'react' | 'html' | 'png' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  fileName?: string;
  includeStyles?: boolean;
  quality?: number; // For image exports (0-1)
  scale?: number; // For image exports (1-4)
  pageSize?: 'a4' | 'letter' | 'auto'; // For PDF
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  error?: string;
  mimeType?: string;
}

// ============================================
// STYLE CONVERTERS
// ============================================

/**
 * Convert ElementStyles to inline CSS string
 * Uses Record for flexible style access since ElementStyles may not have all CSS properties
 */
function stylesToInlineCSS(styles: ElementStyles): string {
  const cssProps: string[] = [];
  // Cast to record for flexible access to any style property
  const s = styles as Record<string, unknown>;

  // Layout
  if (styles.display) cssProps.push(`display: ${styles.display}`);
  if (styles.flexDirection) cssProps.push(`flex-direction: ${styles.flexDirection}`);
  if (styles.justifyContent) cssProps.push(`justify-content: ${styles.justifyContent}`);
  if (styles.alignItems) cssProps.push(`align-items: ${styles.alignItems}`);
  if (styles.flexWrap) cssProps.push(`flex-wrap: ${styles.flexWrap}`);
  if (styles.gap) cssProps.push(`gap: ${styles.gap}px`);

  // Sizing (these may be in extended styles)
  if (s.width) cssProps.push(`width: ${typeof s.width === 'number' ? `${s.width}px` : s.width}`);
  if (s.height) cssProps.push(`height: ${typeof s.height === 'number' ? `${s.height}px` : s.height}`);
  if (s.minWidth) cssProps.push(`min-width: ${typeof s.minWidth === 'number' ? `${s.minWidth}px` : s.minWidth}`);
  if (s.minHeight) cssProps.push(`min-height: ${typeof s.minHeight === 'number' ? `${s.minHeight}px` : s.minHeight}`);
  if (s.maxWidth) cssProps.push(`max-width: ${typeof s.maxWidth === 'number' ? `${s.maxWidth}px` : s.maxWidth}`);
  if (s.maxHeight) cssProps.push(`max-height: ${typeof s.maxHeight === 'number' ? `${s.maxHeight}px` : s.maxHeight}`);

  // Spacing
  if (styles.padding) cssProps.push(`padding: ${styles.padding}px`);
  if (styles.paddingTop) cssProps.push(`padding-top: ${styles.paddingTop}px`);
  if (styles.paddingRight) cssProps.push(`padding-right: ${styles.paddingRight}px`);
  if (styles.paddingBottom) cssProps.push(`padding-bottom: ${styles.paddingBottom}px`);
  if (styles.paddingLeft) cssProps.push(`padding-left: ${styles.paddingLeft}px`);
  if (styles.margin) cssProps.push(`margin: ${styles.margin}px`);
  if (styles.marginTop) cssProps.push(`margin-top: ${styles.marginTop}px`);
  if (styles.marginRight) cssProps.push(`margin-right: ${styles.marginRight}px`);
  if (styles.marginBottom) cssProps.push(`margin-bottom: ${styles.marginBottom}px`);
  if (styles.marginLeft) cssProps.push(`margin-left: ${styles.marginLeft}px`);

  // Background
  if (styles.backgroundColor) cssProps.push(`background-color: ${styles.backgroundColor}`);
  if (styles.backgroundImage) cssProps.push(`background-image: ${styles.backgroundImage}`);
  if (styles.backgroundSize) cssProps.push(`background-size: ${styles.backgroundSize}`);
  if (styles.backgroundPosition) cssProps.push(`background-position: ${styles.backgroundPosition}`);

  // Typography
  if (styles.color) cssProps.push(`color: ${styles.color}`);
  if (styles.fontSize) cssProps.push(`font-size: ${styles.fontSize}px`);
  if (styles.fontWeight) cssProps.push(`font-weight: ${styles.fontWeight}`);
  if (styles.fontFamily) cssProps.push(`font-family: ${styles.fontFamily}`);
  if (styles.textAlign) cssProps.push(`text-align: ${styles.textAlign}`);
  if (styles.lineHeight) cssProps.push(`line-height: ${styles.lineHeight}`);
  if (styles.letterSpacing) cssProps.push(`letter-spacing: ${styles.letterSpacing}px`);
  if (styles.textDecoration) cssProps.push(`text-decoration: ${styles.textDecoration}`);
  if (styles.textTransform) cssProps.push(`text-transform: ${styles.textTransform}`);

  // Border
  if (styles.borderRadius) cssProps.push(`border-radius: ${styles.borderRadius}px`);
  if (styles.borderWidth) cssProps.push(`border-width: ${styles.borderWidth}px`);
  if (styles.borderColor) cssProps.push(`border-color: ${styles.borderColor}`);
  if (styles.borderStyle) cssProps.push(`border-style: ${styles.borderStyle}`);
  if (s.border) cssProps.push(`border: ${s.border}`);

  // Effects
  if (styles.boxShadow) cssProps.push(`box-shadow: ${styles.boxShadow}`);
  if (styles.opacity !== undefined) cssProps.push(`opacity: ${styles.opacity}`);
  if (styles.overflow) cssProps.push(`overflow: ${styles.overflow}`);

  return cssProps.join('; ');
}

/**
 * Convert ElementStyles to Tailwind classes
 */
function stylesToTailwind(styles: ElementStyles): string {
  const classes: string[] = [];
  const s = styles as Record<string, unknown>;

  // Display & Flex
  if (styles.display === 'flex') classes.push('flex');
  if (styles.display === 'grid') classes.push('grid');
  if (styles.display === 'none') classes.push('hidden');
  if (styles.flexDirection === 'column') classes.push('flex-col');
  if (styles.flexDirection === 'row-reverse') classes.push('flex-row-reverse');
  if (styles.flexDirection === 'column-reverse') classes.push('flex-col-reverse');

  // Justify & Align
  if (styles.justifyContent === 'center') classes.push('justify-center');
  if (styles.justifyContent === 'flex-start') classes.push('justify-start');
  if (styles.justifyContent === 'flex-end') classes.push('justify-end');
  if (styles.justifyContent === 'space-between') classes.push('justify-between');
  if (styles.justifyContent === 'space-around') classes.push('justify-around');
  if (styles.alignItems === 'center') classes.push('items-center');
  if (styles.alignItems === 'flex-start') classes.push('items-start');
  if (styles.alignItems === 'flex-end') classes.push('items-end');
  if (styles.alignItems === 'stretch') classes.push('items-stretch');

  // Gap (approximate to Tailwind scale)
  if (styles.gap) {
    const gapValue = Number(styles.gap);
    if (gapValue <= 4) classes.push('gap-1');
    else if (gapValue <= 8) classes.push('gap-2');
    else if (gapValue <= 12) classes.push('gap-3');
    else if (gapValue <= 16) classes.push('gap-4');
    else if (gapValue <= 20) classes.push('gap-5');
    else if (gapValue <= 24) classes.push('gap-6');
    else if (gapValue <= 32) classes.push('gap-8');
    else classes.push(`gap-[${gapValue}px]`);
  }

  // Padding
  if (styles.padding) {
    const padValue = Number(styles.padding);
    if (padValue <= 4) classes.push('p-1');
    else if (padValue <= 8) classes.push('p-2');
    else if (padValue <= 12) classes.push('p-3');
    else if (padValue <= 16) classes.push('p-4');
    else if (padValue <= 20) classes.push('p-5');
    else if (padValue <= 24) classes.push('p-6');
    else if (padValue <= 32) classes.push('p-8');
    else classes.push(`p-[${padValue}px]`);
  }

  // Width
  if (s.width === '100%') classes.push('w-full');
  else if (s.width) classes.push(`w-[${s.width}px]`);

  // Height
  if (s.height === '100%') classes.push('h-full');
  else if (s.height) classes.push(`h-[${s.height}px]`);

  // Min-height
  if (s.minHeight) classes.push(`min-h-[${s.minHeight}px]`);

  // Background
  if (styles.backgroundColor) {
    classes.push(`bg-[${styles.backgroundColor}]`);
  }

  // Text color
  if (styles.color) {
    classes.push(`text-[${styles.color}]`);
  }

  // Font size
  if (styles.fontSize) {
    const fs = Number(styles.fontSize);
    if (fs <= 12) classes.push('text-xs');
    else if (fs <= 14) classes.push('text-sm');
    else if (fs <= 16) classes.push('text-base');
    else if (fs <= 18) classes.push('text-lg');
    else if (fs <= 20) classes.push('text-xl');
    else if (fs <= 24) classes.push('text-2xl');
    else if (fs <= 30) classes.push('text-3xl');
    else if (fs <= 36) classes.push('text-4xl');
    else if (fs <= 48) classes.push('text-5xl');
    else classes.push(`text-[${fs}px]`);
  }

  // Font weight
  if (styles.fontWeight) {
    const fw = Number(styles.fontWeight);
    if (fw <= 300) classes.push('font-light');
    else if (fw <= 400) classes.push('font-normal');
    else if (fw <= 500) classes.push('font-medium');
    else if (fw <= 600) classes.push('font-semibold');
    else if (fw <= 700) classes.push('font-bold');
    else classes.push('font-extrabold');
  }

  // Text align
  if (styles.textAlign === 'center') classes.push('text-center');
  if (styles.textAlign === 'right') classes.push('text-right');
  if (styles.textAlign === 'left') classes.push('text-left');

  // Border radius
  if (styles.borderRadius) {
    const br = Number(styles.borderRadius);
    if (br <= 4) classes.push('rounded');
    else if (br <= 8) classes.push('rounded-lg');
    else if (br <= 12) classes.push('rounded-xl');
    else if (br <= 16) classes.push('rounded-2xl');
    else if (br >= 9999) classes.push('rounded-full');
    else classes.push(`rounded-[${br}px]`);
  }

  return classes.join(' ');
}

// ============================================
// HTML EXPORT
// ============================================

/**
 * Convert element tree to HTML string
 */
function elementToHTML(element: CanvasElement, elements: Record<string, CanvasElement>, indent = 0): string {
  const indentStr = '  '.repeat(indent);
  const inlineStyle = stylesToInlineCSS(element.styles);

  // Get tag based on element type
  let tag = 'div';
  let selfClosing = false;
  let extraAttrs = '';

  switch (element.type) {
    case 'text':
      tag = 'p';
      break;
    case 'button':
      tag = 'button';
      break;
    case 'link':
      tag = 'a';
      extraAttrs = ` href="${element.href || '#'}"`;
      break;
    case 'image':
      tag = 'img';
      selfClosing = true;
      extraAttrs = ` src="${element.src || ''}" alt="${element.name || ''}"`;
      break;
    case 'input':
      tag = 'input';
      selfClosing = true;
      extraAttrs = ` type="${element.inputType || 'text'}" placeholder="${element.placeholder || ''}"`;
      break;
    case 'section':
      tag = 'section';
      break;
    case 'icon':
      // For icons, render as inline SVG placeholder
      tag = 'span';
      break;
  }

  const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : '';

  if (selfClosing) {
    return `${indentStr}<${tag}${extraAttrs}${styleAttr} />`;
  }

  // Get children content
  let childrenHTML = '';
  if (element.children && element.children.length > 0) {
    childrenHTML = '\n' + element.children
      .map(childId => {
        const child = elements[childId];
        if (child) {
          return elementToHTML(child, elements, indent + 1);
        }
        return '';
      })
      .filter(Boolean)
      .join('\n') + '\n' + indentStr;
  } else if (element.content) {
    childrenHTML = element.content;
  }

  return `${indentStr}<${tag}${extraAttrs}${styleAttr}>${childrenHTML}</${tag}>`;
}

/**
 * Export canvas as static HTML
 */
export function exportToHTML(): ExportResult {
  try {
    const state = useCanvasStore.getState();
    const elements = state.elements;
    const rootPage = Object.values(elements).find(el => el.type === 'page');

    if (!rootPage) {
      return { success: false, error: 'No page found on canvas' };
    }

    const bodyContent = rootPage.children
      .map(childId => elementToHTML(elements[childId], elements, 2))
      .join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${rootPage.name || 'Exported Design'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;

    return {
      success: true,
      data: html,
      mimeType: 'text/html',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Export failed',
    };
  }
}

// ============================================
// REACT EXPORT
// ============================================

/**
 * Convert element tree to React JSX
 */
function elementToReact(element: CanvasElement, elements: Record<string, CanvasElement>, indent = 2): string {
  const indentStr = '  '.repeat(indent);
  const tailwindClasses = stylesToTailwind(element.styles);

  // Get component/tag based on element type
  let tag = 'div';
  let extraProps: string[] = [];

  switch (element.type) {
    case 'text':
      tag = 'p';
      break;
    case 'button':
      tag = 'button';
      extraProps.push('onClick={() => {}}');
      break;
    case 'link':
      tag = 'a';
      extraProps.push(`href="${element.href || '#'}"`);
      break;
    case 'image':
      tag = 'img';
      extraProps.push(`src="${element.src || ''}"`);
      extraProps.push(`alt="${element.name || ''}"`);
      break;
    case 'input':
      tag = 'input';
      extraProps.push(`type="${element.inputType || 'text'}"`);
      extraProps.push(`placeholder="${element.placeholder || ''}"`);
      break;
    case 'section':
      tag = 'section';
      break;
    case 'icon':
      // Import lucide icon
      tag = element.iconName || 'Circle';
      extraProps.push('size={24}');
      break;
  }

  const classNameProp = tailwindClasses ? `className="${tailwindClasses}"` : '';
  const allProps = [classNameProp, ...extraProps].filter(Boolean).join(' ');

  // Self-closing tags
  if (element.type === 'image' || element.type === 'input' || element.type === 'icon') {
    return `${indentStr}<${tag} ${allProps} />`;
  }

  // Get children content
  let childrenJSX = '';
  if (element.children && element.children.length > 0) {
    childrenJSX = '\n' + element.children
      .map(childId => {
        const child = elements[childId];
        if (child) {
          return elementToReact(child, elements, indent + 1);
        }
        return '';
      })
      .filter(Boolean)
      .join('\n') + '\n' + indentStr;
  } else if (element.content) {
    childrenJSX = element.content;
  }

  return `${indentStr}<${tag} ${allProps}>${childrenJSX}</${tag}>`;
}

/**
 * Export canvas as React component
 */
export function exportToReact(componentName = 'ExportedDesign'): ExportResult {
  try {
    const state = useCanvasStore.getState();
    const elements = state.elements;
    const rootPage = Object.values(elements).find(el => el.type === 'page');

    if (!rootPage) {
      return { success: false, error: 'No page found on canvas' };
    }

    // Collect all icon names used
    const iconNames = new Set<string>();
    const collectIcons = (el: CanvasElement) => {
      if (el.type === 'icon' && el.iconName) {
        iconNames.add(el.iconName);
      }
      el.children.forEach(childId => {
        const child = elements[childId];
        if (child) collectIcons(child);
      });
    };
    collectIcons(rootPage);

    const iconImports = iconNames.size > 0
      ? `import { ${Array.from(iconNames).join(', ')} } from 'lucide-react';\n`
      : '';

    const bodyContent = rootPage.children
      .map(childId => elementToReact(elements[childId], elements, 2))
      .join('\n');

    const tailwindClasses = stylesToTailwind(rootPage.styles);

    const code = `import React from 'react';
${iconImports}
interface ${componentName}Props {
  className?: string;
}

export function ${componentName}({ className = '' }: ${componentName}Props) {
  return (
    <div className={\`${tailwindClasses} \${className}\`}>
${bodyContent}
    </div>
  );
}

export default ${componentName};
`;

    return {
      success: true,
      data: code,
      mimeType: 'text/typescript',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Export failed',
    };
  }
}

// ============================================
// IMAGE/PDF EXPORT (Uses Canvas Screenshot)
// ============================================

/**
 * Get canvas element for screenshot
 */
function getCanvasElement(): HTMLElement | null {
  // Try to find the canvas viewport element
  const viewport = document.querySelector('[data-canvas-viewport]') as HTMLElement;
  if (viewport) return viewport;

  // Fallback: find by class
  const canvas = document.querySelector('.canvas-content, .canvas-viewport') as HTMLElement;
  return canvas;
}

/**
 * Export canvas as PNG image
 * Requires: npm install html2canvas
 */
export async function exportToPNG(options: { scale?: number; quality?: number } = {}): Promise<ExportResult> {
  try {
    // Dynamic import html2canvas (optional dependency)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { default: html2canvas } = await import('html2canvas' as any) as { default: (el: HTMLElement, opts: Record<string, unknown>) => Promise<HTMLCanvasElement> };

    const canvasElement = getCanvasElement();
    if (!canvasElement) {
      return { success: false, error: 'Canvas element not found' };
    }

    const scale = options.scale || 2;
    const canvas = await html2canvas(canvasElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({
              success: true,
              data: blob,
              mimeType: 'image/png',
            });
          } else {
            resolve({ success: false, error: 'Failed to create image blob' });
          }
        },
        'image/png',
        options.quality || 1
      );
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'PNG export failed',
    };
  }
}

/**
 * Export canvas as PDF
 * Requires: npm install jspdf html2canvas
 */
export async function exportToPDF(options: { pageSize?: 'a4' | 'letter' | 'auto' } = {}): Promise<ExportResult> {
  try {
    // Dynamic import jspdf and html2canvas (optional dependencies)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf' as any) as Promise<{ default: new (opts: Record<string, unknown>) => { addImage: (data: string, type: string, x: number, y: number, w: number, h: number) => void; output: (type: string) => Blob } }>,
      import('html2canvas' as any) as Promise<{ default: (el: HTMLElement, opts: Record<string, unknown>) => Promise<HTMLCanvasElement> }>,
    ]);

    const canvasElement = getCanvasElement();
    if (!canvasElement) {
      return { success: false, error: 'Canvas element not found' };
    }

    const canvas = await html2canvas(canvasElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Determine page size
    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'a4') {
      pageWidth = 210; // mm
      pageHeight = 297;
    } else if (options.pageSize === 'letter') {
      pageWidth = 216; // mm
      pageHeight = 279;
    } else {
      // Auto: fit to image aspect ratio
      const aspectRatio = imgWidth / imgHeight;
      pageWidth = 210;
      pageHeight = pageWidth / aspectRatio;
    }

    const pdf = new jsPDF({
      orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

    const blob = pdf.output('blob');

    return {
      success: true,
      data: blob,
      mimeType: 'application/pdf',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'PDF export failed',
    };
  }
}

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

/**
 * Export design in the specified format
 */
export async function exportDesign(options: ExportOptions): Promise<ExportResult> {
  const { format, fileName = 'design' } = options;

  let result: ExportResult;

  switch (format) {
    case 'react':
      result = exportToReact(fileName);
      break;
    case 'html':
      result = exportToHTML();
      break;
    case 'png':
      result = await exportToPNG({ scale: options.scale, quality: options.quality });
      break;
    case 'pdf':
      result = await exportToPDF({ pageSize: options.pageSize });
      break;
    default:
      return { success: false, error: `Unsupported format: ${format}` };
  }

  return result;
}

/**
 * Download the exported file
 */
export function downloadExport(result: ExportResult, fileName: string): void {
  if (!result.success || !result.data) return;

  let blob: Blob;
  let extension: string;

  if (result.data instanceof Blob) {
    blob = result.data;
    extension = result.mimeType === 'application/pdf' ? 'pdf' : 'png';
  } else {
    const mimeType = result.mimeType || 'text/plain';
    blob = new Blob([result.data], { type: mimeType });
    extension = mimeType.includes('html') ? 'html' : 'tsx';
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Quick export with download
 */
export async function quickExport(format: ExportFormat, fileName = 'design'): Promise<void> {
  const result = await exportDesign({ format, fileName });
  if (result.success) {
    downloadExport(result, fileName);
  } else {
    console.error('Export failed:', result.error);
    throw new Error(result.error);
  }
}

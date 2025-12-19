/**
 * Direct Element Insertion
 *
 * Adds elements directly to React code WITHOUT going through AI.
 * This provides instant feedback like Figma/Plasmic.
 */

export interface InsertableElement {
  type: 'frame' | 'text' | 'button' | 'image' | 'input' | 'link' | 'stack' | 'grid';
  id: string;
  styles: Record<string, string>;
  content?: string;
}

// Generate unique element ID
let elementCounter = 0;
export function generateElementId(type: string): string {
  elementCounter++;
  return `${type}-${Date.now()}-${elementCounter}`;
}

// Convert CSS styles to Tailwind classes (simplified)
function stylesToTailwind(styles: Record<string, string>): string {
  const classes: string[] = [];

  // Width
  if (styles.width === '200px') classes.push('w-48');
  else if (styles.width === '100%') classes.push('w-full');
  else if (styles.width === '250px') classes.push('w-64');

  // Height
  if (styles.height === '200px') classes.push('h-48');
  else if (styles.height === '150px') classes.push('h-36');

  // Padding
  if (styles.padding === '16px') classes.push('p-4');
  else if (styles.padding === '12px 24px') classes.push('py-3 px-6');
  else if (styles.padding === '12px 16px') classes.push('py-3 px-4');

  // Background
  if (styles.backgroundColor === '#f3f4f6') classes.push('bg-gray-100');
  else if (styles.backgroundColor === '#f9fafb') classes.push('bg-gray-50');
  else if (styles.backgroundColor === '#8B1E2B') classes.push('bg-indigo-500');
  else if (styles.backgroundColor === '#e5e7eb') classes.push('bg-gray-200');

  // Border radius
  if (styles.borderRadius === '8px') classes.push('rounded-lg');
  else if (styles.borderRadius === '4px') classes.push('rounded');

  // Flexbox
  if (styles.display === 'flex') classes.push('flex');
  if (styles.display === 'grid') classes.push('grid');
  if (styles.flexDirection === 'column') classes.push('flex-col');
  if (styles.gap === '12px') classes.push('gap-3');
  if (styles.gridTemplateColumns === 'repeat(2, 1fr)') classes.push('grid-cols-2');

  // Text
  if (styles.fontSize === '16px') classes.push('text-base');
  if (styles.fontSize === '14px') classes.push('text-sm');
  if (styles.color === '#1f2937') classes.push('text-gray-800');
  if (styles.color === '#ffffff') classes.push('text-white');
  if (styles.color === '#8B1E2B') classes.push('text-indigo-500');
  if (styles.fontWeight === '500') classes.push('font-medium');
  if (styles.lineHeight === '1.5') classes.push('leading-relaxed');

  // Cursor
  if (styles.cursor === 'pointer') classes.push('cursor-pointer');

  // Border
  if (styles.border === 'none') classes.push('border-0');
  if (styles.border === '1px solid #d1d5db') classes.push('border border-gray-300');

  // Object fit
  if (styles.objectFit === 'cover') classes.push('object-cover');

  // Text decoration
  if (styles.textDecoration === 'underline') classes.push('underline');

  return classes.join(' ') || 'p-4 bg-gray-100 rounded-lg';
}

// Generate JSX for an element
export function generateElementJSX(element: InsertableElement): string {
  const { type, id, styles, content } = element;
  const tailwindClasses = stylesToTailwind(styles);

  switch (type) {
    case 'frame':
      return `      <div
        data-objects-id="${id}"
        className="${tailwindClasses} min-h-[100px]"
      >
        {/* Frame - click to add content */}
      </div>`;

    case 'stack':
      return `      <div
        data-objects-id="${id}"
        className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg"
      >
        {/* Stack - vertical layout */}
      </div>`;

    case 'grid':
      return `      <div
        data-objects-id="${id}"
        className="grid grid-cols-2 gap-3 p-4"
      >
        {/* Grid - 2 columns */}
      </div>`;

    case 'text':
      return `      <p
        data-objects-id="${id}"
        className="text-base text-gray-800 leading-relaxed"
      >
        ${content || 'Add your text here'}
      </p>`;

    case 'button':
      return `      <button
        data-objects-id="${id}"
        className="py-3 px-6 bg-indigo-500 text-white font-medium rounded-lg cursor-pointer hover:bg-indigo-600 transition-colors"
      >
        ${content || 'Button'}
      </button>`;

    case 'image':
      return `      <img
        data-objects-id="${id}"
        src="https://via.placeholder.com/200x150"
        alt="Placeholder"
        className="w-48 h-36 object-cover rounded-lg bg-gray-200"
      />`;

    case 'input':
      return `      <input
        data-objects-id="${id}"
        type="text"
        placeholder="Enter text..."
        className="py-3 px-4 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />`;

    case 'link':
      return `      <a
        data-objects-id="${id}"
        href="#"
        className="text-indigo-500 underline cursor-pointer hover:text-indigo-600"
      >
        ${content || 'Link text'}
      </a>`;

    default:
      return `      <div data-objects-id="${id}" className="p-4 bg-gray-100 rounded-lg">Element</div>`;
  }
}

// Insert element into App.jsx code
export function insertElementIntoCode(
  currentCode: string,
  element: InsertableElement
): string {
  const elementJSX = generateElementJSX(element);

  // Find the main container div and insert the element
  // Look for: <div style={{ minHeight: '100vh' }}> or similar patterns

  // Pattern 1: Empty canvas with EmptyCanvas component
  if (currentCode.includes('<EmptyCanvas />')) {
    return currentCode.replace(
      '<EmptyCanvas />',
      elementJSX
    );
  }

  // Pattern 2: Look for closing </div> before the final </EditableProvider>
  const editableProviderMatch = currentCode.match(/(\s*)<\/EditableProvider>/);
  if (editableProviderMatch) {
    // Find the div that wraps content inside EditableProvider
    const insertPoint = currentCode.lastIndexOf('</div>', currentCode.lastIndexOf('</EditableProvider>'));
    if (insertPoint !== -1) {
      return currentCode.slice(0, insertPoint) + '\n' + elementJSX + '\n      ' + currentCode.slice(insertPoint);
    }
  }

  // Pattern 3: Simple App with return statement - find last </div> in return
  const returnMatch = currentCode.match(/return\s*\(\s*[\s\S]*?\)/);
  if (returnMatch) {
    // Find the main wrapper div's closing tag
    const lastDivIndex = currentCode.lastIndexOf('</div>');
    if (lastDivIndex !== -1) {
      const secondLastDivIndex = currentCode.lastIndexOf('</div>', lastDivIndex - 1);
      if (secondLastDivIndex !== -1) {
        return currentCode.slice(0, secondLastDivIndex) + '\n' + elementJSX + '\n      ' + currentCode.slice(secondLastDivIndex);
      }
    }
  }

  // Fallback: just append before the last </div>
  const lastDiv = currentCode.lastIndexOf('</div>');
  if (lastDiv !== -1) {
    return currentCode.slice(0, lastDiv) + '\n' + elementJSX + '\n      ' + currentCode.slice(lastDiv);
  }

  return currentCode;
}

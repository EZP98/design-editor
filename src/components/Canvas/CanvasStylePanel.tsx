/**
 * Canvas Style Panel
 *
 * Connects the visual canvas store to a style editing panel.
 * Shows properties for selected elements with Tailwind class suggestions.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useCanvasStore } from '../../lib/canvas/canvasStore';
import { CanvasElement, ElementStyles, ElementType } from '../../lib/canvas/types';

// ============================================================================
// Tailwind Presets
// ============================================================================

const TAILWIND_COLORS = {
  background: [
    { label: 'White', value: '#ffffff', tw: 'bg-white' },
    { label: 'Black', value: '#000000', tw: 'bg-black' },
    { label: 'Gray 50', value: '#f9fafb', tw: 'bg-gray-50' },
    { label: 'Gray 100', value: '#f3f4f6', tw: 'bg-gray-100' },
    { label: 'Gray 200', value: '#e5e7eb', tw: 'bg-gray-200' },
    { label: 'Gray 800', value: '#1f2937', tw: 'bg-gray-800' },
    { label: 'Gray 900', value: '#111827', tw: 'bg-gray-900' },
    { label: 'Indigo 500', value: '#8B1E2B', tw: 'bg-indigo-500' },
    { label: 'Blue 500', value: '#8B1E2B', tw: 'bg-blue-500' },
    { label: 'Green 500', value: '#22c55e', tw: 'bg-green-500' },
    { label: 'Red 500', value: '#ef4444', tw: 'bg-red-500' },
    { label: 'Purple 500', value: '#a855f7', tw: 'bg-purple-500' },
  ],
  text: [
    { label: 'White', value: '#ffffff', tw: 'text-white' },
    { label: 'Black', value: '#000000', tw: 'text-black' },
    { label: 'Gray 400', value: '#9ca3af', tw: 'text-gray-400' },
    { label: 'Gray 500', value: '#6b7280', tw: 'text-gray-500' },
    { label: 'Gray 600', value: '#4b5563', tw: 'text-gray-600' },
    { label: 'Gray 700', value: '#374151', tw: 'text-gray-700' },
    { label: 'Gray 800', value: '#1f2937', tw: 'text-gray-800' },
    { label: 'Indigo 500', value: '#8B1E2B', tw: 'text-indigo-500' },
  ],
};

const SPACING_PRESETS = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
const RADIUS_PRESETS = [0, 4, 6, 8, 12, 16, 24, 9999];
const FONT_SIZE_PRESETS = [12, 14, 16, 18, 20, 24, 30, 36, 48];
const FONT_WEIGHT_PRESETS = [
  { label: 'Normal', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Semibold', value: 600 },
  { label: 'Bold', value: 700 },
];

const DISPLAY_OPTIONS = [
  { label: 'Block', value: 'block' },
  { label: 'Flex', value: 'flex' },
  { label: 'Grid', value: 'grid' },
  { label: 'Inline', value: 'inline' },
  { label: 'None', value: 'none' },
];

const FLEX_DIRECTION_OPTIONS = [
  { label: 'Row', value: 'row' },
  { label: 'Column', value: 'column' },
];

const JUSTIFY_OPTIONS = [
  { label: 'Start', value: 'flex-start' },
  { label: 'Center', value: 'center' },
  { label: 'End', value: 'flex-end' },
  { label: 'Between', value: 'space-between' },
  { label: 'Around', value: 'space-around' },
];

const ALIGN_OPTIONS = [
  { label: 'Start', value: 'flex-start' },
  { label: 'Center', value: 'center' },
  { label: 'End', value: 'flex-end' },
  { label: 'Stretch', value: 'stretch' },
];

// ============================================================================
// Main Component
// ============================================================================

export function CanvasStylePanel() {
  const {
    elements,
    selectedElementIds,
    updateElementStyles,
    updateElementContent,
    renameElement,
  } = useCanvasStore();

  const selectedElement = useMemo(() => {
    if (selectedElementIds.length !== 1) return null;
    return elements[selectedElementIds[0]] || null;
  }, [elements, selectedElementIds]);

  const handleStyleChange = useCallback(
    (styles: Partial<ElementStyles>) => {
      if (!selectedElement) return;
      updateElementStyles(selectedElement.id, styles);
    },
    [selectedElement, updateElementStyles]
  );

  const handleContentChange = useCallback(
    (content: string) => {
      if (!selectedElement) return;
      updateElementContent(selectedElement.id, content);
    },
    [selectedElement, updateElementContent]
  );

  const handleNameChange = useCallback(
    (name: string) => {
      if (!selectedElement) return;
      renameElement(selectedElement.id, name);
    },
    [selectedElement, renameElement]
  );

  if (!selectedElement) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <div style={styles.emptyTitle}>No selection</div>
        <div style={styles.emptySubtitle}>Select an element to edit its properties</div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <input
          type="text"
          value={selectedElement.name}
          onChange={(e) => handleNameChange(e.target.value)}
          style={styles.nameInput}
        />
        <span style={styles.typeLabel}>{selectedElement.type}</span>
      </div>

      {/* Content (for text/button/link) */}
      {['text', 'button', 'link'].includes(selectedElement.type) && (
        <Section title="Content" icon={<TextIcon />}>
          <textarea
            value={selectedElement.content || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            style={styles.textarea}
            placeholder="Enter text..."
            rows={2}
          />
        </Section>
      )}

      {/* Layout */}
      <Section title="Layout" icon={<LayoutIcon />}>
        <PropertyRow label="Display">
          <Select
            value={selectedElement.styles.display || 'block'}
            options={DISPLAY_OPTIONS}
            onChange={(v) => handleStyleChange({ display: v as ElementStyles['display'] })}
          />
        </PropertyRow>

        {selectedElement.styles.display === 'flex' && (
          <>
            <PropertyRow label="Direction">
              <ToggleGroup
                value={selectedElement.styles.flexDirection || 'row'}
                options={FLEX_DIRECTION_OPTIONS}
                onChange={(v) => handleStyleChange({ flexDirection: v as ElementStyles['flexDirection'] })}
              />
            </PropertyRow>
            <PropertyRow label="Justify">
              <Select
                value={selectedElement.styles.justifyContent || 'flex-start'}
                options={JUSTIFY_OPTIONS}
                onChange={(v) => handleStyleChange({ justifyContent: v as ElementStyles['justifyContent'] })}
              />
            </PropertyRow>
            <PropertyRow label="Align">
              <Select
                value={selectedElement.styles.alignItems || 'stretch'}
                options={ALIGN_OPTIONS}
                onChange={(v) => handleStyleChange({ alignItems: v as ElementStyles['alignItems'] })}
              />
            </PropertyRow>
          </>
        )}

        <PropertyRow label="Gap">
          <NumberInput
            value={selectedElement.styles.gap || 0}
            onChange={(v) => handleStyleChange({ gap: v })}
            presets={SPACING_PRESETS}
            suffix="px"
          />
        </PropertyRow>

        <PropertyRow label="Padding">
          <NumberInput
            value={selectedElement.styles.padding || 0}
            onChange={(v) => handleStyleChange({ padding: v })}
            presets={SPACING_PRESETS}
            suffix="px"
          />
        </PropertyRow>
      </Section>

      {/* Fill */}
      <Section title="Fill" icon={<FillIcon />}>
        <PropertyRow label="Background">
          <ColorPicker
            value={selectedElement.styles.backgroundColor || ''}
            onChange={(v) => handleStyleChange({ backgroundColor: v })}
            presets={TAILWIND_COLORS.background}
          />
        </PropertyRow>
      </Section>

      {/* Border */}
      <Section title="Border" icon={<BorderIcon />}>
        <PropertyRow label="Radius">
          <NumberInput
            value={selectedElement.styles.borderRadius || 0}
            onChange={(v) => handleStyleChange({ borderRadius: v })}
            presets={RADIUS_PRESETS}
            suffix="px"
          />
        </PropertyRow>
        <PropertyRow label="Width">
          <NumberInput
            value={selectedElement.styles.borderWidth || 0}
            onChange={(v) => handleStyleChange({ borderWidth: v })}
            presets={[0, 1, 2, 4]}
            suffix="px"
          />
        </PropertyRow>
        {(selectedElement.styles.borderWidth || 0) > 0 && (
          <PropertyRow label="Color">
            <ColorPicker
              value={selectedElement.styles.borderColor || '#e5e7eb'}
              onChange={(v) => handleStyleChange({ borderColor: v })}
              presets={TAILWIND_COLORS.background}
            />
          </PropertyRow>
        )}
      </Section>

      {/* Typography */}
      {['text', 'button', 'link', 'input'].includes(selectedElement.type) && (
        <Section title="Typography" icon={<TypeIcon />}>
          <PropertyRow label="Size">
            <NumberInput
              value={selectedElement.styles.fontSize || 16}
              onChange={(v) => handleStyleChange({ fontSize: v })}
              presets={FONT_SIZE_PRESETS}
              suffix="px"
            />
          </PropertyRow>
          <PropertyRow label="Weight">
            <Select
              value={String(selectedElement.styles.fontWeight || 400)}
              options={FONT_WEIGHT_PRESETS.map((p) => ({ label: p.label, value: String(p.value) }))}
              onChange={(v) => handleStyleChange({ fontWeight: parseInt(v) })}
            />
          </PropertyRow>
          <PropertyRow label="Color">
            <ColorPicker
              value={selectedElement.styles.color || '#1f2937'}
              onChange={(v) => handleStyleChange({ color: v })}
              presets={TAILWIND_COLORS.text}
            />
          </PropertyRow>
        </Section>
      )}

      {/* Effects */}
      <Section title="Effects" icon={<EffectsIcon />}>
        <PropertyRow label="Opacity">
          <NumberInput
            value={Math.round((selectedElement.styles.opacity ?? 1) * 100)}
            onChange={(v) => handleStyleChange({ opacity: v / 100 })}
            presets={[100, 90, 75, 50, 25, 0]}
            suffix="%"
            min={0}
            max={100}
          />
        </PropertyRow>
      </Section>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={styles.section}>
      <button onClick={() => setIsOpen(!isOpen)} style={styles.sectionHeader}>
        <span style={styles.sectionIcon}>{icon}</span>
        <span style={styles.sectionTitle}>{title}</span>
        <span style={{ ...styles.chevron, transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronIcon />
        </span>
      </button>
      {isOpen && <div style={styles.sectionContent}>{children}</div>}
    </div>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.propertyRow}>
      <span style={styles.propertyLabel}>{label}</span>
      <div style={styles.propertyValue}>{children}</div>
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ToggleGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div style={styles.toggleGroup}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            ...styles.toggleButton,
            background: value === opt.value ? 'rgba(139, 30, 43, 0.2)' : 'transparent',
            color: value === opt.value ? '#a5b4fc' : '#888',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  presets = [],
  suffix = '',
  min,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  presets?: number[];
  suffix?: string;
  min?: number;
  max?: number;
}) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div style={styles.numberInputWrapper}>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          let v = parseFloat(e.target.value) || 0;
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
        }}
        style={styles.numberInput}
      />
      {suffix && <span style={styles.suffix}>{suffix}</span>}
      {presets.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowPresets(!showPresets)} style={styles.presetsButton}>
            <ChevronIcon />
          </button>
          {showPresets && (
            <div style={styles.presetsDropdown}>
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onChange(p);
                    setShowPresets(false);
                  }}
                  style={{
                    ...styles.presetItem,
                    background: value === p ? 'rgba(139, 30, 43, 0.15)' : 'transparent',
                  }}
                >
                  {p}
                  {suffix}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
  presets,
}: {
  value: string;
  onChange: (value: string) => void;
  presets: { label: string; value: string; tw: string }[];
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div style={styles.colorPickerWrapper}>
      <button onClick={() => setShowPicker(!showPicker)} style={styles.colorButton}>
        <div style={{ ...styles.colorSwatch, backgroundColor: value || '#transparent' }} />
        <span style={styles.colorValue}>{value || 'None'}</span>
      </button>
      {showPicker && (
        <div style={styles.colorDropdown}>
          <div style={styles.colorPresets}>
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  onChange(p.value);
                  setShowPicker(false);
                }}
                style={{
                  ...styles.colorPresetButton,
                  backgroundColor: p.value,
                  border: value === p.value ? '2px solid #8B1E2B' : '2px solid transparent',
                }}
                title={`${p.label} (${p.tw})`}
              />
            ))}
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#hex or rgb()"
            style={styles.colorInput}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

const LayoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);

const FillIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);

const BorderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </svg>
);

const TypeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </svg>
);

const TextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 6H3" />
    <path d="M21 10H3" />
    <path d="M17 14H3" />
    <path d="M13 18H3" />
  </svg>
);

const EffectsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  panel: {
    height: '100%',
    overflow: 'auto',
    background: '#141414',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    outline: 'none',
  },
  typeLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
  },
  section: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  sectionHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
  },
  sectionIcon: {
    opacity: 0.6,
  },
  sectionTitle: {
    flex: 1,
    textAlign: 'left',
  },
  chevron: {
    transition: 'transform 0.15s',
  },
  sectionContent: {
    padding: '4px 16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  propertyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  propertyLabel: {
    width: 70,
    fontSize: 11,
    color: '#666',
    flexShrink: 0,
  },
  propertyValue: {
    flex: 1,
  },
  select: {
    width: '100%',
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    color: '#ccc',
    fontSize: 12,
    outline: 'none',
    cursor: 'pointer',
  },
  toggleGroup: {
    display: 'flex',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    padding: '5px 8px',
    background: 'transparent',
    border: 'none',
    borderRadius: 4,
    color: '#888',
    fontSize: 11,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  numberInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  numberInput: {
    flex: 1,
    padding: '6px 8px',
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    fontSize: 12,
    outline: 'none',
    width: 60,
  },
  suffix: {
    fontSize: 11,
    color: '#666',
    paddingRight: 4,
  },
  presetsButton: {
    padding: '4px 6px',
    background: 'transparent',
    border: 'none',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
    color: '#666',
    cursor: 'pointer',
  },
  presetsDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 4,
    zIndex: 100,
    minWidth: 80,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  presetItem: {
    display: 'block',
    width: '100%',
    padding: '6px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 4,
    color: '#aaa',
    fontSize: 12,
    textAlign: 'left',
    cursor: 'pointer',
  },
  colorPickerWrapper: {
    position: 'relative',
  },
  colorButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    color: '#ccc',
    fontSize: 12,
    cursor: 'pointer',
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  colorValue: {
    flex: 1,
    textAlign: 'left',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  colorDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 8,
    zIndex: 100,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  colorPresets: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 4,
    marginBottom: 8,
  },
  colorPresetButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    cursor: 'pointer',
  },
  colorInput: {
    width: '100%',
    padding: '6px 8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 4,
    color: '#ccc',
    fontSize: 11,
    fontFamily: 'monospace',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    color: '#ccc',
    fontSize: 13,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
  },
  emptyState: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    color: '#555',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
};

/**
 * Canvas Style Panel
 *
 * A comprehensive, Figma-style properties panel for editing element styles.
 * Designed to be intuitive and easy to use.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useCanvasStore } from '../../lib/canvas/canvasStore';
import { CanvasElement, ElementStyles, THEME_COLORS } from '../../lib/canvas/types';

// Theme colors type
type ThemeColors = typeof THEME_COLORS.dark | typeof THEME_COLORS.light;

// ============================================================================
// Presets
// ============================================================================

const SPACING_PRESETS = [0, 4, 8, 12, 16, 20, 24, 32, 48, 64];
const RADIUS_PRESETS = [0, 4, 8, 12, 16, 24, 32, 9999];
const FONT_SIZE_PRESETS = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64];
const LINE_HEIGHT_PRESETS = [1, 1.2, 1.4, 1.5, 1.6, 1.8, 2];
const LETTER_SPACING_PRESETS = [-1, -0.5, 0, 0.5, 1, 2, 4];

const COLOR_PRESETS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#000000',
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
  '#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12',
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  '#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
  '#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75',
  '#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843',
];

// ============================================================================
// Main Component
// ============================================================================

export function CanvasStylePanel() {
  const {
    elements,
    selectedElementIds,
    canvasSettings,
    updateElementStyles,
    updateElementContent,
    renameElement,
    moveElement,
    resizeElement,
    deleteElement,
    duplicateElement,
    toggleLock,
    toggleVisibility,
  } = useCanvasStore();

  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];

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

  // No selection state
  if (!selectedElement) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        color: colors.textDimmed,
        background: colors.panelBg,
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity={0.3}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <div style={{ marginTop: 16, fontSize: 14, fontWeight: 500 }}>Nessuna selezione</div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>Seleziona un elemento</div>
      </div>
    );
  }

  const isContainer = ['frame', 'stack', 'grid', 'section', 'container', 'row', 'page', 'box'].includes(selectedElement.type);
  const isText = ['text', 'heading', 'paragraph'].includes(selectedElement.type);
  const isButton = selectedElement.type === 'button';
  const isLink = selectedElement.type === 'link';
  const isImage = selectedElement.type === 'image';
  const isInput = selectedElement.type === 'input';
  const hasTextContent = isText || isButton || isLink;

  const styles = selectedElement.styles;
  const resizeX = (styles as any).resizeX || 'fixed';
  const resizeY = (styles as any).resizeY || 'fixed';

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      background: colors.panelBg,
      fontSize: 12,
    }}>
      {/* Header with name and quick actions */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.borderColor}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <input
          type="text"
          value={selectedElement.name}
          onChange={(e) => renameElement(selectedElement.id, e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: colors.textPrimary,
            fontSize: 13,
            fontWeight: 600,
            outline: 'none',
            minWidth: 0,
          }}
        />
        <span style={{
          fontSize: 9,
          color: colors.textDimmed,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '3px 6px',
          background: colors.hoverBg,
          borderRadius: 4,
        }}>
          {selectedElement.type}
        </span>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        gap: 4,
        borderBottom: `1px solid ${colors.borderColor}`,
      }}>
        <QuickActionButton
          icon={<DuplicateIcon />}
          label="Duplica"
          onClick={() => duplicateElement(selectedElement.id)}
          colors={colors}
        />
        <QuickActionButton
          icon={selectedElement.locked ? <LockIcon /> : <UnlockIcon />}
          label={selectedElement.locked ? 'Sblocca' : 'Blocca'}
          onClick={() => toggleLock(selectedElement.id)}
          active={selectedElement.locked}
          colors={colors}
        />
        <QuickActionButton
          icon={selectedElement.visible ? <EyeIcon /> : <EyeOffIcon />}
          label={selectedElement.visible ? 'Nascondi' : 'Mostra'}
          onClick={() => toggleVisibility(selectedElement.id)}
          active={!selectedElement.visible}
          colors={colors}
        />
        <div style={{ flex: 1 }} />
        <QuickActionButton
          icon={<TrashIcon />}
          label="Elimina"
          onClick={() => deleteElement(selectedElement.id)}
          danger
          colors={colors}
        />
      </div>

      {/* Position & Size */}
      <Section title="Dimensioni" defaultOpen={true} colors={colors}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <LabeledInput
            label="X"
            value={selectedElement.position.x}
            onChange={(v) => moveElement(selectedElement.id, { ...selectedElement.position, x: v })}
            suffix="px"
            colors={colors}
          />
          <LabeledInput
            label="Y"
            value={selectedElement.position.y}
            onChange={(v) => moveElement(selectedElement.id, { ...selectedElement.position, y: v })}
            suffix="px"
            colors={colors}
          />
          <LabeledInput
            label="W"
            value={selectedElement.size.width}
            onChange={(v) => resizeElement(selectedElement.id, { ...selectedElement.size, width: v })}
            suffix="px"
            colors={colors}
          />
          <LabeledInput
            label="H"
            value={selectedElement.size.height}
            onChange={(v) => resizeElement(selectedElement.id, { ...selectedElement.size, height: v })}
            suffix="px"
            colors={colors}
          />
        </div>

        {/* Resize Mode */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6 }}>Ridimensionamento</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <SegmentedControl
              label="Larghezza"
              value={resizeX}
              options={[
                { label: 'Fisso', value: 'fixed' },
                { label: 'Riempi', value: 'fill' },
                { label: 'Adatta', value: 'hug' },
              ]}
              onChange={(v) => handleStyleChange({ resizeX: v } as any)}
              colors={colors}
            />
            <SegmentedControl
              label="Altezza"
              value={resizeY}
              options={[
                { label: 'Fisso', value: 'fixed' },
                { label: 'Riempi', value: 'fill' },
                { label: 'Adatta', value: 'hug' },
              ]}
              onChange={(v) => handleStyleChange({ resizeY: v } as any)}
              colors={colors}
            />
          </div>
        </div>
      </Section>

      {/* Layout (for containers) */}
      {isContainer && (
        <Section title="Layout" defaultOpen={true} colors={colors}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <ToggleButton
              active={styles.display === 'flex'}
              onClick={() => handleStyleChange({ display: styles.display === 'flex' ? 'block' : 'flex' })}
              colors={colors}
            >
              <FlexIcon /> Auto Layout
            </ToggleButton>
          </div>

          {styles.display === 'flex' && (
            <>
              {/* Direction */}
              <PropertyRow label="Direzione" colors={colors}>
                <IconToggleGroup
                  value={styles.flexDirection || 'column'}
                  options={[
                    { value: 'row', icon: <ArrowRightIcon /> },
                    { value: 'column', icon: <ArrowDownIcon /> },
                    { value: 'row-reverse', icon: <ArrowLeftIcon /> },
                    { value: 'column-reverse', icon: <ArrowUpIcon /> },
                  ]}
                  onChange={(v) => handleStyleChange({ flexDirection: v as any })}
                  colors={colors}
                />
              </PropertyRow>

              {/* Alignment */}
              <PropertyRow label="Allineamento" colors={colors}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <IconToggleGroup
                    value={styles.justifyContent || 'flex-start'}
                    options={[
                      { value: 'flex-start', icon: <AlignStartIcon /> },
                      { value: 'center', icon: <AlignCenterIcon /> },
                      { value: 'flex-end', icon: <AlignEndIcon /> },
                      { value: 'space-between', icon: <AlignBetweenIcon /> },
                    ]}
                    onChange={(v) => handleStyleChange({ justifyContent: v as any })}
                    colors={colors}
                  />
                  <div style={{ width: 1, background: colors.borderColor, margin: '0 4px' }} />
                  <IconToggleGroup
                    value={styles.alignItems || 'stretch'}
                    options={[
                      { value: 'flex-start', icon: <AlignTopIcon /> },
                      { value: 'center', icon: <AlignMiddleIcon /> },
                      { value: 'flex-end', icon: <AlignBottomIcon /> },
                      { value: 'stretch', icon: <AlignStretchIcon /> },
                    ]}
                    onChange={(v) => handleStyleChange({ alignItems: v as any })}
                    colors={colors}
                  />
                </div>
              </PropertyRow>

              {/* Gap */}
              <PropertyRow label="Gap" colors={colors}>
                <NumberInputWithPresets
                  value={styles.gap || 0}
                  onChange={(v) => handleStyleChange({ gap: v })}
                  presets={SPACING_PRESETS}
                  suffix="px"
                  colors={colors}
                />
              </PropertyRow>
            </>
          )}

          {/* Overflow */}
          <PropertyRow label="Overflow" colors={colors}>
            <SegmentedControl
              value={styles.overflow || 'visible'}
              options={[
                { label: 'Visibile', value: 'visible' },
                { label: 'Nascosto', value: 'hidden' },
                { label: 'Scroll', value: 'auto' },
              ]}
              onChange={(v) => handleStyleChange({ overflow: v as any })}
              colors={colors}
            />
          </PropertyRow>
        </Section>
      )}

      {/* Spacing */}
      <Section title="Spaziatura" defaultOpen={false} colors={colors}>
        <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 8 }}>Padding</div>
        <SpacingControl
          top={styles.paddingTop ?? styles.padding ?? 0}
          right={styles.paddingRight ?? styles.padding ?? 0}
          bottom={styles.paddingBottom ?? styles.padding ?? 0}
          left={styles.paddingLeft ?? styles.padding ?? 0}
          onChange={(side, value) => {
            if (side === 'all') {
              handleStyleChange({
                padding: value,
                paddingTop: undefined,
                paddingRight: undefined,
                paddingBottom: undefined,
                paddingLeft: undefined,
              });
            } else {
              handleStyleChange({ [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: value });
            }
          }}
          colors={colors}
        />
      </Section>

      {/* Fill - Solo per contenitori, NON per testo */}
      {!isText && (
        <Section title="Riempimento" defaultOpen={true} colors={colors}>
          <AddableColorProperty
            label="Sfondo"
            value={styles.backgroundColor}
            onChange={(v) => handleStyleChange({ backgroundColor: v })}
            colors={colors}
          />
          {styles.backgroundColor && (
            <PropertyRow label="Opacità" colors={colors}>
              <SliderInput
                value={Math.round((styles.opacity ?? 1) * 100)}
                onChange={(v) => handleStyleChange({ opacity: v / 100 })}
                min={0}
                max={100}
                suffix="%"
                colors={colors}
              />
            </PropertyRow>
          )}
        </Section>
      )}

      {/* Border */}
      <Section title="Bordo" defaultOpen={false} colors={colors}>
        <PropertyRow label="Raggio" colors={colors}>
          <NumberInputWithPresets
            value={styles.borderRadius || 0}
            onChange={(v) => handleStyleChange({ borderRadius: v })}
            presets={RADIUS_PRESETS}
            suffix="px"
            colors={colors}
          />
        </PropertyRow>

        {/* Bordo con pattern + */}
        <AddableProperty
          label="Bordo"
          hasValue={!!(styles.borderWidth && styles.borderWidth > 0)}
          onAdd={() => handleStyleChange({ borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'solid' })}
          onRemove={() => handleStyleChange({ borderWidth: 0, borderColor: undefined, borderStyle: undefined })}
          colors={colors}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <NumberInputWithPresets
                value={styles.borderWidth || 1}
                onChange={(v) => handleStyleChange({ borderWidth: v })}
                presets={[1, 2, 3, 4]}
                suffix="px"
                colors={colors}
              />
              <ColorInput
                value={styles.borderColor || '#e5e7eb'}
                onChange={(v) => handleStyleChange({ borderColor: v })}
                colors={colors}
              />
            </div>
            <SegmentedControl
              value={styles.borderStyle || 'solid'}
              options={[
                { label: 'Solido', value: 'solid' },
                { label: 'Tratteg.', value: 'dashed' },
                { label: 'Punteg.', value: 'dotted' },
              ]}
              onChange={(v) => handleStyleChange({ borderStyle: v as any })}
              colors={colors}
            />
          </div>
        </AddableProperty>
      </Section>

      {/* Typography */}
      {(hasTextContent || isInput) && (
        <Section title="Testo" defaultOpen={true} colors={colors}>
          {hasTextContent && (
            <div style={{ marginBottom: 12 }}>
              <textarea
                value={selectedElement.content || ''}
                onChange={(e) => updateElementContent(selectedElement.id, e.target.value)}
                placeholder="Inserisci testo..."
                style={{
                  width: '100%',
                  padding: 10,
                  background: colors.inputBg,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: 8,
                  color: colors.textPrimary,
                  fontSize: 13,
                  resize: 'vertical',
                  outline: 'none',
                  minHeight: 60,
                  fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          <PropertyRow label="Dimensione" colors={colors}>
            <NumberInputWithPresets
              value={styles.fontSize || 16}
              onChange={(v) => handleStyleChange({ fontSize: v })}
              presets={FONT_SIZE_PRESETS}
              suffix="px"
              colors={colors}
            />
          </PropertyRow>

          <PropertyRow label="Peso" colors={colors}>
            <SegmentedControl
              value={String(styles.fontWeight || 400)}
              options={[
                { label: 'Light', value: '300' },
                { label: 'Normal', value: '400' },
                { label: 'Medium', value: '500' },
                { label: 'Bold', value: '700' },
              ]}
              onChange={(v) => handleStyleChange({ fontWeight: parseInt(v) })}
              colors={colors}
            />
          </PropertyRow>

          <PropertyRow label="Colore" colors={colors}>
            <ColorInput
              value={styles.color || '#000000'}
              onChange={(v) => handleStyleChange({ color: v })}
              colors={colors}
            />
          </PropertyRow>

          <PropertyRow label="Allinea" colors={colors}>
            <IconToggleGroup
              value={styles.textAlign || 'left'}
              options={[
                { value: 'left', icon: <TextAlignLeftIcon /> },
                { value: 'center', icon: <TextAlignCenterIcon /> },
                { value: 'right', icon: <TextAlignRightIcon /> },
                { value: 'justify', icon: <TextAlignJustifyIcon /> },
              ]}
              onChange={(v) => handleStyleChange({ textAlign: v as any })}
              colors={colors}
            />
          </PropertyRow>

          <PropertyRow label="Interlinea" colors={colors}>
            <NumberInputWithPresets
              value={styles.lineHeight || 1.5}
              onChange={(v) => handleStyleChange({ lineHeight: v })}
              presets={LINE_HEIGHT_PRESETS}
              step={0.1}
              colors={colors}
            />
          </PropertyRow>

          <PropertyRow label="Spaziatura" colors={colors}>
            <NumberInputWithPresets
              value={styles.letterSpacing || 0}
              onChange={(v) => handleStyleChange({ letterSpacing: v })}
              presets={LETTER_SPACING_PRESETS}
              suffix="px"
              colors={colors}
            />
          </PropertyRow>
        </Section>
      )}

      {/* Image */}
      {isImage && (
        <Section title="Immagine" defaultOpen={true} colors={colors}>
          <PropertyRow label="URL" colors={colors}>
            <input
              type="text"
              value={selectedElement.src || ''}
              onChange={(e) => {
                useCanvasStore.setState((state) => ({
                  elements: {
                    ...state.elements,
                    [selectedElement.id]: {
                      ...state.elements[selectedElement.id],
                      src: e.target.value,
                    },
                  },
                }));
              }}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '8px 10px',
                background: colors.inputBg,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: 6,
                color: colors.textPrimary,
                fontSize: 11,
                outline: 'none',
              }}
            />
          </PropertyRow>
          <PropertyRow label="Adatta" colors={colors}>
            <SegmentedControl
              value={styles.objectFit || 'cover'}
              options={[
                { label: 'Cover', value: 'cover' },
                { label: 'Contain', value: 'contain' },
                { label: 'Fill', value: 'fill' },
              ]}
              onChange={(v) => handleStyleChange({ objectFit: v as any })}
              colors={colors}
            />
          </PropertyRow>
        </Section>
      )}

      {/* Link */}
      {isLink && (
        <Section title="Link" defaultOpen={true} colors={colors}>
          <PropertyRow label="URL" colors={colors}>
            <input
              type="text"
              value={selectedElement.href || ''}
              onChange={(e) => {
                useCanvasStore.setState((state) => ({
                  elements: {
                    ...state.elements,
                    [selectedElement.id]: {
                      ...state.elements[selectedElement.id],
                      href: e.target.value,
                    },
                  },
                }));
              }}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '8px 10px',
                background: colors.inputBg,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: 6,
                color: colors.textPrimary,
                fontSize: 11,
                outline: 'none',
              }}
            />
          </PropertyRow>
          <PropertyRow label="Apri in" colors={colors}>
            <SegmentedControl
              value={selectedElement.target || '_self'}
              options={[
                { label: 'Stessa', value: '_self' },
                { label: 'Nuova', value: '_blank' },
              ]}
              onChange={(v) => {
                useCanvasStore.setState((state) => ({
                  elements: {
                    ...state.elements,
                    [selectedElement.id]: {
                      ...state.elements[selectedElement.id],
                      target: v as '_self' | '_blank',
                    },
                  },
                }));
              }}
              colors={colors}
            />
          </PropertyRow>
        </Section>
      )}

      {/* Effects */}
      <Section title="Effetti" defaultOpen={false} colors={colors}>
        <AddableProperty
          label="Ombra"
          hasValue={!!styles.boxShadow}
          onAdd={() => handleStyleChange({ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' })}
          onRemove={() => handleStyleChange({ boxShadow: undefined })}
          colors={colors}
        >
          <SegmentedControl
            value={
              styles.boxShadow?.includes('10px') ? 'lg' :
              styles.boxShadow?.includes('4px') ? 'md' : 'sm'
            }
            options={[
              { label: 'Leggera', value: 'sm' },
              { label: 'Media', value: 'md' },
              { label: 'Forte', value: 'lg' },
            ]}
            onChange={(v) => {
              const shadows: Record<string, string> = {
                sm: '0 1px 2px rgba(0,0,0,0.05)',
                md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
              };
              handleStyleChange({ boxShadow: shadows[v] });
            }}
            colors={colors}
          />
        </AddableProperty>
      </Section>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  colors: ThemeColors;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = true, colors, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'transparent',
          border: 'none',
          color: colors.textSecondary,
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PropertyRow({ label, colors, children }: { label: string; colors: ThemeColors; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 70, fontSize: 11, color: colors.textMuted, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  onClick,
  active,
  danger,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  colors: ThemeColors;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? colors.accentLight : hovered ? colors.hoverBg : 'transparent',
        border: 'none',
        borderRadius: 6,
        color: danger && hovered ? '#ef4444' : active ? colors.accent : colors.textMuted,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {icon}
    </button>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  suffix,
  colors,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  colors: ThemeColors;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: colors.inputBg,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      <span style={{
        padding: '6px 8px',
        fontSize: 10,
        fontWeight: 600,
        color: colors.textMuted,
        background: colors.hoverBg,
      }}>
        {label}
      </span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          flex: 1,
          padding: '6px 8px',
          background: 'transparent',
          border: 'none',
          color: colors.textPrimary,
          fontSize: 12,
          outline: 'none',
          width: 50,
          minWidth: 0,
        }}
      />
      {suffix && (
        <span style={{ padding: '0 8px 0 0', fontSize: 10, color: colors.textDimmed }}>{suffix}</span>
      )}
    </div>
  );
}

function NumberInputWithPresets({
  value,
  onChange,
  presets,
  suffix,
  step = 1,
  colors,
}: {
  value: number;
  onChange: (v: number) => void;
  presets?: number[];
  suffix?: string;
  step?: number;
  colors: ThemeColors;
}) {
  const [showPresets, setShowPresets] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPresets(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: colors.inputBg,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        <input
          type="number"
          value={step < 1 ? value : Math.round(value)}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{
            flex: 1,
            padding: '6px 10px',
            background: 'transparent',
            border: 'none',
            color: colors.textPrimary,
            fontSize: 12,
            outline: 'none',
            width: 60,
            minWidth: 0,
          }}
        />
        {suffix && (
          <span style={{ padding: '0 4px 0 0', fontSize: 10, color: colors.textDimmed }}>{suffix}</span>
        )}
        {presets && presets.length > 0 && (
          <button
            onClick={() => setShowPresets(!showPresets)}
            style={{
              padding: '6px 8px',
              background: 'transparent',
              border: 'none',
              borderLeft: `1px solid ${colors.borderColor}`,
              color: colors.textMuted,
              cursor: 'pointer',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>
      {showPresets && presets && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          background: colors.panelBg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 8,
          padding: 4,
          zIndex: 100,
          minWidth: 80,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => {
                onChange(p);
                setShowPresets(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '6px 10px',
                background: value === p ? colors.accentLight : 'transparent',
                border: 'none',
                borderRadius: 4,
                color: value === p ? colors.accent : colors.textSecondary,
                fontSize: 11,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {p}{suffix}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SegmentedControl({
  label,
  value,
  options,
  onChange,
  colors,
}: {
  label?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  colors: ThemeColors;
}) {
  return (
    <div>
      {label && (
        <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
      )}
      <div style={{
        display: 'flex',
        background: colors.inputBg,
        borderRadius: 6,
        padding: 2,
      }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '5px 6px',
              background: value === opt.value ? colors.accentLight : 'transparent',
              border: 'none',
              borderRadius: 4,
              color: value === opt.value ? colors.accent : colors.textMuted,
              fontSize: 10,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function IconToggleGroup({
  value,
  options,
  onChange,
  colors,
}: {
  value: string;
  options: { value: string; icon: React.ReactNode }[];
  onChange: (v: string) => void;
  colors: ThemeColors;
}) {
  return (
    <div style={{
      display: 'flex',
      background: colors.inputBg,
      borderRadius: 6,
      padding: 2,
    }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            width: 28,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: value === opt.value ? colors.accentLight : 'transparent',
            border: 'none',
            borderRadius: 4,
            color: value === opt.value ? colors.accent : colors.textMuted,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  colors,
  children,
}: {
  active: boolean;
  onClick: () => void;
  colors: ThemeColors;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: active ? colors.accentLight : colors.inputBg,
        border: `1px solid ${active ? colors.accent : colors.borderColor}`,
        borderRadius: 6,
        color: active ? colors.accent : colors.textMuted,
        fontSize: 11,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function ColorInput({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (v: string) => void;
  colors: ThemeColors;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: colors.inputBg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          background: value || 'transparent',
          border: `1px solid ${colors.borderColorStrong}`,
          backgroundImage: !value ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined,
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        }} />
        <span style={{
          flex: 1,
          textAlign: 'left',
          fontSize: 11,
          fontFamily: 'monospace',
          color: value ? colors.textPrimary : colors.textDimmed,
        }}>
          {value || 'Nessuno'}
        </span>
      </button>

      {showPicker && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: colors.panelBg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 8,
          padding: 10,
          zIndex: 100,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 3,
            marginBottom: 10,
          }}>
            {COLOR_PRESETS.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  onChange(c);
                  setShowPicker(false);
                }}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 4,
                  background: c,
                  border: value === c ? `2px solid ${colors.accent}` : `1px solid ${colors.borderColor}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: 32,
                height: 32,
                padding: 0,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: 6,
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#hex o rgb()"
              style={{
                flex: 1,
                padding: '6px 10px',
                background: colors.inputBg,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: 6,
                color: colors.textPrimary,
                fontSize: 11,
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            {value && (
              <button
                onClick={() => {
                  onChange('');
                  setShowPicker(false);
                }}
                style={{
                  padding: '6px 10px',
                  background: colors.hoverBg,
                  border: 'none',
                  borderRadius: 6,
                  color: colors.textMuted,
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddableProperty({
  label,
  hasValue,
  onAdd,
  onRemove,
  colors,
  children,
}: {
  label: string;
  hasValue: boolean;
  onAdd: () => void;
  onRemove: () => void;
  colors: ThemeColors;
  children: React.ReactNode;
}) {
  if (!hasValue) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: colors.textMuted, flex: 1 }}>{label}</span>
        <button
          onClick={onAdd}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.inputBg,
            border: `1px dashed ${colors.borderColor}`,
            borderRadius: 6,
            color: colors.textMuted,
            cursor: 'pointer',
            fontSize: 16,
          }}
          title={`Aggiungi ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: colors.textMuted, flex: 1 }}>{label}</span>
        <button
          onClick={onRemove}
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            color: colors.textDimmed,
            cursor: 'pointer',
            fontSize: 14,
          }}
          title="Rimuovi"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  );
}

function AddableColorProperty({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  colors: ThemeColors;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Se non c'è valore, mostra solo il pulsante +
  if (!value) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: colors.textMuted, flex: 1 }}>{label}</span>
        <button
          onClick={() => onChange('#ffffff')}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: colors.inputBg,
            border: `1px dashed ${colors.borderColor}`,
            borderRadius: 6,
            color: colors.textMuted,
            cursor: 'pointer',
            fontSize: 16,
          }}
          title={`Aggiungi ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    );
  }

  // Se c'è valore, mostra il color picker
  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: colors.textMuted, width: 70, flexShrink: 0 }}>{label}</span>
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            background: colors.inputBg,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: value,
            border: `1px solid ${colors.borderColorStrong}`,
          }} />
          <span style={{
            flex: 1,
            textAlign: 'left',
            fontSize: 11,
            fontFamily: 'monospace',
            color: colors.textPrimary,
          }}>
            {value}
          </span>
        </button>
        <button
          onClick={() => onChange('')}
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            color: colors.textDimmed,
            cursor: 'pointer',
            fontSize: 14,
          }}
          title="Rimuovi"
        >
          ×
        </button>
      </div>

      {showPicker && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: colors.panelBg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 8,
          padding: 10,
          zIndex: 100,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 3,
            marginBottom: 10,
          }}>
            {COLOR_PRESETS.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  onChange(c);
                  setShowPicker(false);
                }}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 4,
                  background: c,
                  border: value === c ? `2px solid ${colors.accent}` : `1px solid ${colors.borderColor}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: 32,
                height: 32,
                padding: 0,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: 6,
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#hex"
              style={{
                flex: 1,
                padding: '6px 10px',
                background: colors.inputBg,
                border: `1px solid ${colors.borderColor}`,
                borderRadius: 6,
                color: colors.textPrimary,
                fontSize: 11,
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SliderInput({
  value,
  onChange,
  min,
  max,
  suffix,
  colors,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
  colors: ThemeColors;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          flex: 1,
          height: 4,
          appearance: 'none',
          background: colors.inputBg,
          borderRadius: 2,
          cursor: 'pointer',
        }}
      />
      <span style={{
        minWidth: 40,
        fontSize: 11,
        color: colors.textSecondary,
        textAlign: 'right',
      }}>
        {value}{suffix}
      </span>
    </div>
  );
}

function SpacingControl({
  top,
  right,
  bottom,
  left,
  onChange,
  colors,
}: {
  top: number;
  right: number;
  bottom: number;
  left: number;
  onChange: (side: 'top' | 'right' | 'bottom' | 'left' | 'all', value: number) => void;
  colors: ThemeColors;
}) {
  const allSame = top === right && right === bottom && bottom === left;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridTemplateRows: 'auto auto auto',
      gap: 4,
      alignItems: 'center',
    }}>
      {/* Top */}
      <div />
      <input
        type="number"
        value={top}
        onChange={(e) => onChange('top', parseFloat(e.target.value) || 0)}
        style={{
          width: '100%',
          padding: '4px 6px',
          background: colors.inputBg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 4,
          color: colors.textPrimary,
          fontSize: 11,
          textAlign: 'center',
          outline: 'none',
        }}
      />
      <div />

      {/* Left, Center, Right */}
      <input
        type="number"
        value={left}
        onChange={(e) => onChange('left', parseFloat(e.target.value) || 0)}
        style={{
          width: '100%',
          padding: '4px 6px',
          background: colors.inputBg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 4,
          color: colors.textPrimary,
          fontSize: 11,
          textAlign: 'center',
          outline: 'none',
        }}
      />
      <button
        onClick={() => {
          if (allSame) return;
          onChange('all', top);
        }}
        style={{
          padding: '4px 6px',
          background: allSame ? colors.accentLight : colors.inputBg,
          border: `1px solid ${allSame ? colors.accent : colors.borderColor}`,
          borderRadius: 4,
          color: allSame ? colors.accent : colors.textMuted,
          fontSize: 10,
          cursor: 'pointer',
        }}
        title="Applica a tutti i lati"
      >
        {allSame ? '🔗' : '⛓️‍💥'}
      </button>
      <input
        type="number"
        value={right}
        onChange={(e) => onChange('right', parseFloat(e.target.value) || 0)}
        style={{
          width: '100%',
          padding: '4px 6px',
          background: colors.inputBg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 4,
          color: colors.textPrimary,
          fontSize: 11,
          textAlign: 'center',
          outline: 'none',
        }}
      />

      {/* Bottom */}
      <div />
      <input
        type="number"
        value={bottom}
        onChange={(e) => onChange('bottom', parseFloat(e.target.value) || 0)}
        style={{
          width: '100%',
          padding: '4px 6px',
          background: colors.inputBg,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 4,
          color: colors.textPrimary,
          fontSize: 11,
          textAlign: 'center',
          outline: 'none',
        }}
      />
      <div />
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

const DuplicateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const UnlockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 019.9-1" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const FlexIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const AlignStartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="4" x2="4" y2="20" />
    <rect x="8" y="6" width="4" height="12" fill="currentColor" />
    <rect x="14" y="8" width="4" height="8" fill="currentColor" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="4" x2="12" y2="20" />
    <rect x="6" y="6" width="4" height="12" fill="currentColor" />
    <rect x="14" y="8" width="4" height="8" fill="currentColor" />
  </svg>
);

const AlignEndIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="20" y1="4" x2="20" y2="20" />
    <rect x="8" y="6" width="4" height="12" fill="currentColor" />
    <rect x="14" y="8" width="4" height="8" fill="currentColor" />
  </svg>
);

const AlignBetweenIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="6" width="4" height="12" fill="currentColor" />
    <rect x="16" y="8" width="4" height="8" fill="currentColor" />
  </svg>
);

const AlignTopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="4" x2="20" y2="4" />
    <rect x="6" y="8" width="4" height="10" fill="currentColor" />
    <rect x="14" y="8" width="4" height="6" fill="currentColor" />
  </svg>
);

const AlignMiddleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="12" x2="20" y2="12" />
    <rect x="6" y="7" width="4" height="10" fill="currentColor" />
    <rect x="14" y="9" width="4" height="6" fill="currentColor" />
  </svg>
);

const AlignBottomIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="20" x2="20" y2="20" />
    <rect x="6" y="6" width="4" height="10" fill="currentColor" />
    <rect x="14" y="10" width="4" height="6" fill="currentColor" />
  </svg>
);

const AlignStretchIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="4" x2="20" y2="4" />
    <line x1="4" y1="20" x2="20" y2="20" />
    <rect x="6" y="8" width="4" height="8" fill="currentColor" />
    <rect x="14" y="8" width="4" height="8" fill="currentColor" />
  </svg>
);

const TextAlignLeftIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
);

const TextAlignCenterIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="5" y1="18" x2="19" y2="18" />
  </svg>
);

const TextAlignRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="6" y1="18" x2="21" y2="18" />
  </svg>
);

const TextAlignJustifyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

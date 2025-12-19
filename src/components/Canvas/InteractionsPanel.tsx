/**
 * Interactions Panel
 *
 * UI for managing element variants, interactions, and animations.
 * Shows in the properties panel when an element is selected.
 */

import React, { useState } from 'react';
import { ColorPicker } from '../ui/ColorPicker';
import {
  Variant,
  Interaction,
  Animation,
  VariantType,
  TriggerType,
  ActionType,
  EasingType,
  PRESET_ANIMATIONS,
  EASING_VALUES,
  createDefaultHoverVariant,
  createDefaultActiveVariant,
  createDefaultDisabledVariant,
} from '../../lib/canvas/interactions';
import { ElementStyles } from '../../lib/canvas/types';

// ==========================================
// SECTION COMPONENT
// ==========================================

function Section({ title, children, defaultOpen = true, onAdd }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onAdd?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          color: '#a1a1aa',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
        }}
      >
        <span>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onAdd && (
            <div
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: 4,
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          )}
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {isOpen && <div style={{ padding: '0 12px 12px' }}>{children}</div>}
    </div>
  );
}

// ==========================================
// VARIANT ITEM
// ==========================================

function VariantItem({ variant, onUpdate, onDelete }: {
  variant: Variant;
  onUpdate: (variant: Variant) => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variantIcons: Record<VariantType, React.ReactNode> = {
    hover: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/></svg>,
    active: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    focus: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    disabled: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    custom: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          cursor: 'pointer',
        }}
      >
        <div style={{ color: '#A83248' }}>{variantIcons[variant.type]}</div>
        <span style={{ flex: 1, fontSize: 12, color: '#e4e4e7', fontWeight: 500 }}>{variant.name}</span>
        <span style={{ fontSize: 10, color: '#52525b', textTransform: 'capitalize' }}>{variant.type}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ padding: 4, background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Transition settings */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#52525b', marginBottom: 6, fontWeight: 600 }}>TRANSITION</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: '#71717a' }}>Duration</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={variant.transition?.duration || 200}
                    onChange={(e) => onUpdate({
                      ...variant,
                      transition: { ...variant.transition, property: 'all', easing: 'ease-out', duration: parseInt(e.target.value) || 200 }
                    })}
                    style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }}
                  />
                  <span style={{ fontSize: 10, color: '#52525b', marginLeft: 4 }}>ms</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#71717a' }}>Easing</label>
                <select
                  value={variant.transition?.easing || 'ease-out'}
                  onChange={(e) => onUpdate({
                    ...variant,
                    transition: { ...variant.transition, property: 'all', duration: 200, easing: e.target.value as EasingType }
                  })}
                  style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }}
                >
                  <option value="linear">Linear</option>
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                  <option value="ease-out-back">Bounce</option>
                  <option value="spring">Spring</option>
                </select>
              </div>
            </div>
          </div>

          {/* Style overrides */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#52525b', marginBottom: 6, fontWeight: 600 }}>STYLE CHANGES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: '#71717a' }}>Opacity</label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={variant.styles.opacity ?? 1}
                  onChange={(e) => onUpdate({ ...variant, styles: { ...variant.styles, opacity: parseFloat(e.target.value) } })}
                  style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#71717a' }}>Scale</label>
                <input
                  type="number"
                  min={0}
                  max={2}
                  step={0.05}
                  value={1}
                  onChange={(e) => onUpdate({ ...variant, styles: { ...variant.styles, transform: `scale(${e.target.value})` } })}
                  style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#71717a', display: 'block', marginBottom: 4 }}>Background</label>
                <ColorPicker
                  value={variant.styles.backgroundColor || '#000000'}
                  onChange={(value) => onUpdate({ ...variant, styles: { ...variant.styles, backgroundColor: value } })}
                  compact
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#71717a', display: 'block', marginBottom: 4 }}>Border Color</label>
                <ColorPicker
                  value={variant.styles.borderColor || '#000000'}
                  onChange={(value) => onUpdate({ ...variant, styles: { ...variant.styles, borderColor: value } })}
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// INTERACTION ITEM
// ==========================================

function InteractionItem({ interaction, onUpdate, onDelete }: {
  interaction: Interaction;
  onUpdate: (interaction: Interaction) => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const triggerLabels: Record<TriggerType, string> = {
    click: 'On Click',
    hover: 'On Hover',
    hover_start: 'On Hover Start',
    hover_end: 'On Hover End',
    mouse_down: 'On Mouse Down',
    mouse_up: 'On Mouse Up',
    focus: 'On Focus',
    blur: 'On Blur',
    scroll: 'On Scroll',
    scroll_into_view: 'When Visible',
    load: 'On Page Load',
    key_press: 'On Key Press',
  };

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          cursor: 'pointer',
        }}
      >
        <div style={{ color: '#A83248' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <span style={{ flex: 1, fontSize: 12, color: '#e4e4e7', fontWeight: 500 }}>{interaction.name}</span>
        <span style={{ fontSize: 10, color: '#52525b' }}>{triggerLabels[interaction.trigger.type]}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate({ ...interaction, enabled: !interaction.enabled }); }}
            style={{
              padding: '2px 6px',
              background: interaction.enabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: 4,
              fontSize: 9,
              color: interaction.enabled ? '#22c55e' : '#52525b',
              cursor: 'pointer',
            }}
          >
            {interaction.enabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ padding: 4, background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Trigger settings */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#52525b', marginBottom: 6, fontWeight: 600 }}>TRIGGER</div>
            <select
              value={interaction.trigger.type}
              onChange={(e) => onUpdate({ ...interaction, trigger: { ...interaction.trigger, type: e.target.value as TriggerType } })}
              style={{ width: '100%', padding: '6px 8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }}
            >
              {Object.entries(triggerLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#52525b', marginBottom: 6, fontWeight: 600 }}>ACTIONS ({interaction.actions.length})</div>
            {interaction.actions.map((action, index) => (
              <div key={action.id} style={{ padding: 8, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 4, marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#a1a1aa' }}>{index + 1}. {action.type.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const newAction = { id: `action-${Date.now()}`, type: 'animate' as ActionType };
                onUpdate({ ...interaction, actions: [...interaction.actions, newAction] });
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                background: 'transparent',
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                fontSize: 10,
                color: '#52525b',
                cursor: 'pointer',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Action
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// ANIMATION PRESET SELECTOR
// ==========================================

function AnimationPresetSelector({ onSelect }: { onSelect: (animation: Omit<Animation, 'id'>) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
      {Object.entries(PRESET_ANIMATIONS).map(([key, animation]) => (
        <button
          key={key}
          onClick={() => onSelect(animation)}
          style={{
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 4,
            fontSize: 10,
            color: '#a1a1aa',
            cursor: 'pointer',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A83248'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        >
          {animation.name}
        </button>
      ))}
    </div>
  );
}

// ==========================================
// MAIN INTERACTIONS PANEL
// ==========================================

interface InteractionsPanelProps {
  variants?: Variant[];
  interactions?: Interaction[];
  animations?: Animation[];
  onVariantsChange: (variants: Variant[]) => void;
  onInteractionsChange: (interactions: Interaction[]) => void;
  onAnimationsChange: (animations: Animation[]) => void;
}

export function InteractionsPanel({
  variants = [],
  interactions = [],
  animations = [],
  onVariantsChange,
  onInteractionsChange,
  onAnimationsChange,
}: InteractionsPanelProps) {
  const [showPresets, setShowPresets] = useState(false);

  // Add variant handlers
  const addVariant = (type: VariantType) => {
    let newVariant: Variant;
    switch (type) {
      case 'hover':
        newVariant = createDefaultHoverVariant();
        break;
      case 'active':
        newVariant = createDefaultActiveVariant();
        break;
      case 'disabled':
        newVariant = createDefaultDisabledVariant();
        break;
      default:
        newVariant = { id: `variant-${Date.now()}`, name: 'Custom', type: 'custom', styles: {} };
    }
    onVariantsChange([...variants, newVariant]);
  };

  const updateVariant = (index: number, variant: Variant) => {
    const newVariants = [...variants];
    newVariants[index] = variant;
    onVariantsChange(newVariants);
  };

  const deleteVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
  };

  // Add interaction handler
  const addInteraction = () => {
    const newInteraction: Interaction = {
      id: `interaction-${Date.now()}`,
      name: 'New Interaction',
      trigger: { type: 'click' },
      actions: [],
      enabled: true,
    };
    onInteractionsChange([...interactions, newInteraction]);
  };

  const updateInteraction = (index: number, interaction: Interaction) => {
    const newInteractions = [...interactions];
    newInteractions[index] = interaction;
    onInteractionsChange(newInteractions);
  };

  const deleteInteraction = (index: number) => {
    onInteractionsChange(interactions.filter((_, i) => i !== index));
  };

  // Add animation handler
  const addAnimation = (preset: Omit<Animation, 'id'>) => {
    const newAnimation: Animation = {
      ...preset,
      id: `anim-${Date.now()}`,
    };
    onAnimationsChange([...animations, newAnimation]);
    setShowPresets(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Variants Section */}
      <Section
        title="Variants"
        onAdd={() => addVariant('hover')}
      >
        {variants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 11, color: '#52525b', marginBottom: 12 }}>Add state variants</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              {(['hover', 'active', 'focus', 'disabled'] as VariantType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => addVariant(type)}
                  style={{
                    padding: '6px 10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 10,
                    color: '#a1a1aa',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        ) : (
          variants.map((variant, index) => (
            <VariantItem
              key={variant.id}
              variant={variant}
              onUpdate={(v) => updateVariant(index, v)}
              onDelete={() => deleteVariant(index)}
            />
          ))
        )}
      </Section>

      {/* Interactions Section */}
      <Section title="Interactions" onAdd={addInteraction}>
        {interactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 11, color: '#52525b', marginBottom: 8 }}>No interactions yet</div>
            <button
              onClick={addInteraction}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: 6,
                fontSize: 11,
                color: '#a1a1aa',
                cursor: 'pointer',
              }}
            >
              Add Interaction
            </button>
          </div>
        ) : (
          interactions.map((interaction, index) => (
            <InteractionItem
              key={interaction.id}
              interaction={interaction}
              onUpdate={(i) => updateInteraction(index, i)}
              onDelete={() => deleteInteraction(index)}
            />
          ))
        )}
      </Section>

      {/* Animations Section */}
      <Section title="Animations" onAdd={() => setShowPresets(!showPresets)}>
        {showPresets && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#52525b', marginBottom: 8, fontWeight: 600 }}>PRESETS</div>
            <AnimationPresetSelector onSelect={addAnimation} />
          </div>
        )}

        {animations.length === 0 && !showPresets ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 11, color: '#52525b', marginBottom: 8 }}>No animations yet</div>
            <button
              onClick={() => setShowPresets(true)}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: 6,
                fontSize: 11,
                color: '#a1a1aa',
                cursor: 'pointer',
              }}
            >
              Add Animation
            </button>
          </div>
        ) : (
          animations.map((animation) => (
            <div
              key={animation.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 500 }}>{animation.name}</div>
                <div style={{ fontSize: 10, color: '#52525b' }}>{animation.duration}ms • {animation.easing}</div>
              </div>
              <button
                onClick={() => onAnimationsChange(animations.filter((a) => a.id !== animation.id))}
                style={{ padding: 4, background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

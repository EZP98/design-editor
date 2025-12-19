/**
 * Design Tokens Panel
 *
 * UI for managing design tokens: colors, typography, spacing, shadows, radii.
 */

import React, { useState } from 'react';
import { useTokensStore, ColorToken, TypographyToken, SpacingToken, ShadowToken, RadiusToken } from '../../lib/canvas/tokens';
import { ColorPicker } from '../ui/ColorPicker';

// Collapsible Section
function TokenSection({ title, count, children, defaultOpen = true }: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          color: '#e4e4e7',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <span>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#52525b', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 6px', borderRadius: 4 }}>{count}</span>
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
      </button>
      {isOpen && <div style={{ padding: '0 12px 12px' }}>{children}</div>}
    </div>
  );
}

// Color Token Item
function ColorTokenItem({ token, onEdit, onDelete }: {
  token: ColorToken;
  onEdit: (token: ColorToken) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(token.name);
  const [editValue, setEditValue] = useState(token.value);

  const handleSave = () => {
    onEdit({ ...token, name: editName, value: editValue });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, background: 'rgba(255, 255, 255, 0.04)', borderRadius: 6 }}>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Token name"
          style={{ padding: '6px 8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 12, color: '#e4e4e7' }}
        />
        <ColorPicker
          value={editValue}
          onChange={(value) => setEditValue(value)}
          compact
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} style={{ flex: 1, padding: '6px 12px', background: '#8B1E2B', border: 'none', borderRadius: 4, fontSize: 11, color: '#fff', cursor: 'pointer' }}>Save</button>
          <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '6px 12px', background: 'rgba(255, 255, 255, 0.08)', border: 'none', borderRadius: 4, fontSize: 11, color: '#a1a1aa', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      onClick={() => setIsEditing(true)}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          background: token.value,
          border: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{token.name}</div>
        <div style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace' }}>{token.value.toUpperCase()}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(token.id); }}
        style={{ padding: 4, background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', opacity: 0, transition: 'opacity 0.1s' }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// Typography Token Item
function TypographyTokenItem({ token, onEdit, onDelete }: {
  token: TypographyToken;
  onEdit: (token: TypographyToken) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(token);

  const handleSave = () => {
    onEdit(form);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 8, background: 'rgba(255, 255, 255, 0.04)', borderRadius: 6 }}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Token name"
          style={{ padding: '6px 8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 12, color: '#e4e4e7' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: '#52525b' }}>Size</label>
            <input type="number" value={form.fontSize} onChange={(e) => setForm({ ...form, fontSize: parseInt(e.target.value) || 16 })}
              style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#52525b' }}>Weight</label>
            <input type="number" value={form.fontWeight} onChange={(e) => setForm({ ...form, fontWeight: parseInt(e.target.value) || 400 })}
              style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#52525b' }}>Line Height</label>
            <input type="number" step="0.1" value={form.lineHeight} onChange={(e) => setForm({ ...form, lineHeight: parseFloat(e.target.value) || 1.5 })}
              style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#52525b' }}>Letter Spacing</label>
            <input type="number" step="0.01" value={form.letterSpacing} onChange={(e) => setForm({ ...form, letterSpacing: parseFloat(e.target.value) || 0 })}
              style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 11, color: '#a1a1aa' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} style={{ flex: 1, padding: '6px 12px', background: '#8B1E2B', border: 'none', borderRadius: 4, fontSize: 11, color: '#fff', cursor: 'pointer' }}>Save</button>
          <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '6px 12px', background: 'rgba(255, 255, 255, 0.08)', border: 'none', borderRadius: 4, fontSize: 11, color: '#a1a1aa', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      onClick={() => setIsEditing(true)}
    >
      <div>
        <div style={{ fontSize: token.fontSize > 20 ? 16 : token.fontSize, fontWeight: token.fontWeight, color: '#e4e4e7', lineHeight: 1.2 }}>
          {token.name}
        </div>
        <div style={{ fontSize: 10, color: '#52525b', marginTop: 2 }}>
          {token.fontSize}px / {token.fontWeight} / {token.lineHeight}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(token.id); }}
        style={{ padding: 4, background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// Spacing Token Item
function SpacingTokenItem({ token, onEdit, onDelete }: {
  token: SpacingToken;
  onEdit: (token: SpacingToken) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: Math.min(token.value, 40), height: 8, background: '#A83248', borderRadius: 2, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#e4e4e7' }}>{token.name}</div>
      </div>
      <div style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace' }}>{token.value}px</div>
    </div>
  );
}

// Shadow Token Item
function ShadowTokenItem({ token, getShadowCss }: {
  token: ShadowToken;
  getShadowCss: (id: string) => string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div
        style={{
          width: 32,
          height: 32,
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 6,
          boxShadow: getShadowCss(token.id),
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#e4e4e7' }}>{token.name}</div>
        <div style={{ fontSize: 10, color: '#52525b' }}>
          {token.x}/{token.y}/{token.blur}/{token.spread}
        </div>
      </div>
    </div>
  );
}

// Radius Token Item
function RadiusTokenItem({ token }: { token: RadiusToken }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 8px',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div
        style={{
          width: 24,
          height: 24,
          background: '#A83248',
          borderRadius: Math.min(token.value, 12),
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#e4e4e7' }}>{token.name}</div>
      </div>
      <div style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace' }}>{token.value}px</div>
    </div>
  );
}

// Main Tokens Panel
export function TokensPanel() {
  const {
    tokens,
    addColor,
    updateColor,
    deleteColor,
    addTypography,
    updateTypography,
    deleteTypography,
    getShadowCss,
    resetToDefaults,
  } = useTokensStore();

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'shadows' | 'radii'>('colors');

  // Group colors by group
  const colorsByGroup = tokens.colors.reduce((acc, color) => {
    const group = color.group || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(color);
    return acc;
  }, {} as Record<string, ColorToken[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>Design Tokens</div>
          <button
            onClick={resetToDefaults}
            style={{ padding: '4px 8px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, fontSize: 10, color: '#71717a', cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255, 255, 255, 0.04)', borderRadius: 6, padding: 2 }}>
          {(['colors', 'typography', 'spacing', 'shadows', 'radii'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '6px 8px',
                fontSize: 10,
                fontWeight: 500,
                textTransform: 'capitalize',
                background: activeTab === tab ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                color: activeTab === tab ? '#fff' : '#71717a',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {activeTab === 'colors' && (
          <div>
            {/* Add color button */}
            <div style={{ padding: '8px 12px' }}>
              <button
                onClick={() => addColor({ name: 'New Color', value: '#8B1E2B', group: 'custom' })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px dashed rgba(255, 255, 255, 0.08)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#71717a',
                  cursor: 'pointer',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Color
              </button>
            </div>

            {/* Color groups */}
            {Object.entries(colorsByGroup).map(([group, colors]) => (
              <TokenSection key={group} title={group.charAt(0).toUpperCase() + group.slice(1)} count={colors.length}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {colors.map((color) => (
                    <ColorTokenItem
                      key={color.id}
                      token={color}
                      onEdit={(updated) => updateColor(updated.id, updated)}
                      onDelete={deleteColor}
                    />
                  ))}
                </div>
              </TokenSection>
            ))}
          </div>
        )}

        {activeTab === 'typography' && (
          <div>
            <div style={{ padding: '8px 12px' }}>
              <button
                onClick={() => addTypography({ name: 'New Style', fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px dashed rgba(255, 255, 255, 0.08)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#71717a',
                  cursor: 'pointer',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Typography
              </button>
            </div>
            <div style={{ padding: '0 12px' }}>
              {tokens.typography.map((token) => (
                <TypographyTokenItem
                  key={token.id}
                  token={token}
                  onEdit={(updated) => updateTypography(updated.id, updated)}
                  onDelete={deleteTypography}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div style={{ padding: 12 }}>
            {tokens.spacing.map((token) => (
              <SpacingTokenItem
                key={token.id}
                token={token}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}

        {activeTab === 'shadows' && (
          <div style={{ padding: 12 }}>
            {tokens.shadows.map((token) => (
              <ShadowTokenItem key={token.id} token={token} getShadowCss={getShadowCss} />
            ))}
          </div>
        )}

        {activeTab === 'radii' && (
          <div style={{ padding: 12 }}>
            {tokens.radii.map((token) => (
              <RadiusTokenItem key={token.id} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

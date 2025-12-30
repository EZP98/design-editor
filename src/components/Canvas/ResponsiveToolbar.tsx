/**
 * Responsive Toolbar
 *
 * Toolbar for switching between breakpoints and device presets.
 * Shown at the top of the canvas when in responsive mode.
 */

import React, { useState } from 'react';
import { useResponsiveStore, Breakpoint, DEVICE_PRESETS } from '../../lib/canvas/responsive';

// Device icon
function DeviceIcon({ type, size = 16 }: { type: 'desktop' | 'tablet' | 'mobile'; size?: number }) {
  if (type === 'desktop') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  if (type === 'tablet') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="10" y1="18" x2="14" y2="18" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

// Breakpoint Button
function BreakpointButton({ breakpoint, isActive, onClick }: {
  breakpoint: Breakpoint;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={`${breakpoint.name} (${breakpoint.width}×${breakpoint.height})`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: isActive ? 'rgba(168, 50, 72, 0.2)' : 'transparent',
        border: isActive ? '1px solid #A78BFA' : '1px solid transparent',
        borderRadius: 6,
        color: isActive ? '#fff' : '#71717a',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <DeviceIcon type={breakpoint.icon} size={14} />
      <span>{breakpoint.name}</span>
      <span style={{ fontSize: 10, color: '#52525b' }}>{breakpoint.width}</span>
    </button>
  );
}

// Device Preset Dropdown
function DevicePresetDropdown({ category, onSelect }: {
  category: 'desktop' | 'tablet' | 'mobile';
  onSelect: (preset: { name: string; width: number; height: number }) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const presets = DEVICE_PRESETS[category];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 4,
          color: '#71717a',
          fontSize: 10,
          cursor: 'pointer',
        }}
      >
        Presets
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              padding: 4,
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              zIndex: 101,
              minWidth: 180,
            }}
          >
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelect(preset);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 4,
                  color: '#e4e4e7',
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>{preset.name}</span>
                <span style={{ fontSize: 10, color: '#52525b' }}>{preset.width}×{preset.height}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Main Responsive Toolbar
export function ResponsiveToolbar() {
  const {
    breakpoints,
    activeBreakpointId,
    previewMode,
    setActiveBreakpoint,
    updateBreakpoint,
    togglePreviewMode,
  } = useResponsiveStore();

  const activeBreakpoint = breakpoints.find((bp) => bp.id === activeBreakpointId) || breakpoints[0];

  const handlePresetSelect = (preset: { name: string; width: number; height: number }) => {
    updateBreakpoint(activeBreakpointId, {
      width: preset.width,
      height: preset.height,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Breakpoint buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        {breakpoints.map((bp) => (
          <BreakpointButton
            key={bp.id}
            breakpoint={bp}
            isActive={bp.id === activeBreakpointId}
            onClick={() => setActiveBreakpoint(bp.id)}
          />
        ))}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 24, background: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Current dimensions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="number"
            value={activeBreakpoint.width}
            onChange={(e) => updateBreakpoint(activeBreakpointId, { width: parseInt(e.target.value) || 375 })}
            style={{
              width: 60,
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              fontSize: 12,
              color: '#e4e4e7',
              textAlign: 'center',
            }}
          />
          <span style={{ color: '#52525b' }}>×</span>
          <input
            type="number"
            value={activeBreakpoint.height}
            onChange={(e) => updateBreakpoint(activeBreakpointId, { height: parseInt(e.target.value) || 667 })}
            style={{
              width: 60,
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              fontSize: 12,
              color: '#e4e4e7',
              textAlign: 'center',
            }}
          />
        </div>

        {/* Device presets dropdown */}
        <DevicePresetDropdown
          category={activeBreakpoint.icon}
          onSelect={handlePresetSelect}
        />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Preview mode toggle */}
      <button
        onClick={togglePreviewMode}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: previewMode ? '#A78BFA' : 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 6,
          color: previewMode ? '#fff' : '#71717a',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Preview
      </button>
    </div>
  );
}

// Compact breakpoint selector for sidebar
export function BreakpointSelector() {
  const { breakpoints, activeBreakpointId, setActiveBreakpoint } = useResponsiveStore();

  return (
    <div style={{ display: 'flex', gap: 2, background: 'rgba(255, 255, 255, 0.04)', borderRadius: 6, padding: 2 }}>
      {breakpoints.map((bp) => (
        <button
          key={bp.id}
          onClick={() => setActiveBreakpoint(bp.id)}
          title={`${bp.name} (${bp.width}×${bp.height})`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            background: bp.id === activeBreakpointId ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: 'none',
            borderRadius: 4,
            color: bp.id === activeBreakpointId ? '#fff' : '#71717a',
            cursor: 'pointer',
          }}
        >
          <DeviceIcon type={bp.icon} size={14} />
        </button>
      ))}
    </div>
  );
}

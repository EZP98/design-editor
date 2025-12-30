/**
 * Advanced Color Picker Component
 *
 * Features:
 * - HEX, RGB, HSL input modes
 * - RGB sliders
 * - Color presets
 * - Optional opacity slider
 * - Gradient support (linear, radial)
 */

import React, { useState } from 'react';

// Color conversion utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Color presets
export const COLOR_PRESETS = [
  '#ef4444', '#000000', '#f97316', '#a855f7', '#ec4899',
  '#8B5CF6', '#A78BFA', '#991b1b', '#2563eb',
  '#22c55e', '#84cc16', '#eab308', '#f97316', '#f43f5e',
  '#e5e5e5', '#a3a3a3', '#737373', '#3b82f6', '#c4b5fd',
];

// Gradient presets
export const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
];

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  showOpacity?: boolean;
  opacity?: number;
  onOpacityChange?: (value: number) => void;
  showGradients?: boolean;
  compact?: boolean;
  label?: string;
}

export function ColorPicker({
  value,
  onChange,
  showOpacity = false,
  opacity = 1,
  onOpacityChange,
  showGradients = false,
  compact = false,
  label,
}: ColorPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMode, setInputMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [fillType, setFillType] = useState<'solid' | 'linear' | 'radial'>('solid');
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradientColor1, setGradientColor1] = useState('#A78BFA');
  const [gradientColor2, setGradientColor2] = useState('#8B5CF6');

  const colorValue = value?.startsWith('#') ? value : (value || '#ffffff');
  const isGradient = value?.startsWith('linear-gradient') || value?.startsWith('radial-gradient');

  const rgb = hexToRgb(isGradient ? '#ffffff' : colorValue);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const updateGradient = (type: string, color1: string, color2: string, angle: number) => {
    if (type === 'linear') {
      onChange(`linear-gradient(${angle}deg, ${color1}, ${color2})`);
    } else if (type === 'radial') {
      onChange(`radial-gradient(circle, ${color1}, ${color2})`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
      {label && (
        <div style={{ fontSize: 11, color: '#71717a', marginBottom: 2 }}>{label}</div>
      )}

      {/* Main row: Color swatch + Hex input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        {/* Color swatch with expand toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: compact ? 28 : 32,
            height: compact ? 28 : 32,
            padding: 0,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 6,
            cursor: 'pointer',
            background: isGradient ? value : colorValue,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Checkerboard for transparency */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.08) 75%), linear-gradient(45deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.08) 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 4px 4px',
            zIndex: 0,
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: isGradient ? value : (showOpacity ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : colorValue),
            zIndex: 1,
          }} />
          {/* Expand icon */}
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
            style={{ position: 'absolute', right: 2, bottom: 2, zIndex: 2 }}
          >
            <polyline points={isExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
          </svg>
        </button>

        {/* Hex input */}
        <input
          type="text"
          value={isGradient ? 'Gradient' : colorValue.toUpperCase()}
          onChange={(e) => {
            if (isGradient) return;
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
              if (val.length === 7) onChange(val);
            }
          }}
          onBlur={(e) => {
            if (isGradient) return;
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) onChange(val);
          }}
          disabled={isGradient}
          style={{
            flex: 1,
            padding: '6px 8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 6,
            fontSize: 12,
            color: isGradient ? '#71717a' : '#e4e4e7',
            outline: 'none',
            fontFamily: 'ui-monospace, monospace',
            textTransform: 'uppercase',
          }}
        />

        {/* Native color picker button */}
        <label
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 6,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
          title="Color picker"
        >
          <input
            type="color"
            value={isGradient ? '#ffffff' : colorValue}
            onChange={(e) => {
              setFillType('solid');
              onChange(e.target.value);
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5" style={{ pointerEvents: 'none' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </label>
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 8,
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {/* Fill Type tabs (if gradients enabled) */}
          {showGradients && (
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6, padding: 2 }}>
              {(['solid', 'linear', 'radial'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFillType(type);
                    if (type === 'solid') {
                      onChange(gradientColor1);
                    } else {
                      updateGradient(type, gradientColor1, gradientColor2, gradientAngle);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    background: fillType === type ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    color: fillType === type ? '#fff' : '#52525b',
                    cursor: 'pointer',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Gradient controls */}
          {showGradients && fillType !== 'solid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fillType === 'linear' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#52525b', width: 40 }}>Angle</span>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={gradientAngle}
                    onChange={(e) => {
                      const angle = parseInt(e.target.value);
                      setGradientAngle(angle);
                      updateGradient('linear', gradientColor1, gradientColor2, angle);
                    }}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 11, color: '#a1a1aa', width: 32, textAlign: 'right' }}>{gradientAngle}°</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#52525b', marginBottom: 4 }}>Start</div>
                  <input
                    type="color"
                    value={gradientColor1}
                    onChange={(e) => {
                      setGradientColor1(e.target.value);
                      updateGradient(fillType, e.target.value, gradientColor2, gradientAngle);
                    }}
                    style={{ width: '100%', height: 28, border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 6, cursor: 'pointer' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#52525b', marginBottom: 4 }}>End</div>
                  <input
                    type="color"
                    value={gradientColor2}
                    onChange={(e) => {
                      setGradientColor2(e.target.value);
                      updateGradient(fillType, gradientColor1, e.target.value, gradientAngle);
                    }}
                    style={{ width: '100%', height: 28, border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 6, cursor: 'pointer' }}
                  />
                </div>
              </div>
              {/* Gradient preview */}
              <div
                style={{
                  height: 24,
                  borderRadius: 6,
                  background: value,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />
              {/* Gradient presets */}
              <div>
                <div style={{ fontSize: 10, color: '#52525b', marginBottom: 4 }}>Presets</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                  {GRADIENT_PRESETS.map((gradient, i) => (
                    <button
                      key={i}
                      onClick={() => onChange(gradient)}
                      style={{
                        width: '100%',
                        height: 24,
                        background: gradient,
                        border: value === gradient ? '2px solid #A78BFA' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Solid color controls */}
          {(!showGradients || fillType === 'solid') && (
            <>
              {/* Mode tabs */}
              <div style={{ display: 'flex', gap: 2, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 6, padding: 2 }}>
                {(['hex', 'rgb', 'hsl'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInputMode(mode)}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: inputMode === mode ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      border: 'none',
                      borderRadius: 4,
                      color: inputMode === mode ? '#fff' : '#52525b',
                      cursor: 'pointer',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* RGB sliders */}
              {inputMode === 'rgb' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'R', value: rgb.r, color: '#ef4444' },
                    { label: 'G', value: rgb.g, color: '#22c55e' },
                    { label: 'B', value: rgb.b, color: '#3b82f6' },
                  ].map(({ label, value: v, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 14, fontSize: 10, color: '#52525b', fontWeight: 600 }}>{label}</span>
                      <input
                        type="range"
                        min={0}
                        max={255}
                        value={v}
                        onChange={(e) => {
                          const newVal = parseInt(e.target.value);
                          const newRgb = { ...rgb, [label.toLowerCase()]: newVal };
                          onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                        }}
                        style={{
                          flex: 1,
                          height: 4,
                          appearance: 'none',
                          background: `linear-gradient(to right, ${label === 'R' ? '#000' : label === 'G' ? `rgb(${rgb.r},0,${rgb.b})` : `rgb(${rgb.r},${rgb.g},0)`}, ${color})`,
                          borderRadius: 2,
                          cursor: 'pointer',
                        }}
                      />
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={v}
                        onChange={(e) => {
                          const newVal = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
                          const newRgb = { ...rgb, [label.toLowerCase()]: newVal };
                          onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                        }}
                        style={{
                          width: 40,
                          padding: '2px 4px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 4,
                          fontSize: 11,
                          color: '#a1a1aa',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* HSL sliders */}
              {inputMode === 'hsl' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'H', value: hsl.h, max: 360, suffix: '°' },
                    { label: 'S', value: hsl.s, max: 100, suffix: '%' },
                    { label: 'L', value: hsl.l, max: 100, suffix: '%' },
                  ].map(({ label, value: v, max, suffix }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 14, fontSize: 10, color: '#52525b', fontWeight: 600 }}>{label}</span>
                      <input
                        type="range"
                        min={0}
                        max={max}
                        value={v}
                        onChange={(e) => {
                          const newVal = parseInt(e.target.value);
                          const newHsl = { ...hsl, [label.toLowerCase()]: newVal };
                          const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                          onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                        }}
                        style={{
                          flex: 1,
                          height: 4,
                          appearance: 'none',
                          background: label === 'H'
                            ? 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                            : label === 'S'
                            ? `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`
                            : `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`,
                          borderRadius: 2,
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{ width: 40, fontSize: 11, color: '#a1a1aa', textAlign: 'right' }}>{v}{suffix}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hex display */}
              {inputMode === 'hex' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#52525b', marginBottom: 2 }}>R</div>
                    <div style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'monospace' }}>{rgb.r}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#52525b', marginBottom: 2 }}>G</div>
                    <div style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'monospace' }}>{rgb.g}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#52525b', marginBottom: 2 }}>B</div>
                    <div style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'monospace' }}>{rgb.b}</div>
                  </div>
                </div>
              )}

              {/* Opacity slider */}
              {showOpacity && onOpacityChange && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, fontSize: 10, color: '#52525b', fontWeight: 600 }}>A</span>
                  <div style={{ flex: 1, position: 'relative', height: 12 }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.08) 75%), linear-gradient(45deg, rgba(255, 255, 255, 0.08) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.08) 75%)',
                      backgroundSize: '6px 6px',
                      backgroundPosition: '0 0, 3px 3px',
                      borderRadius: 2,
                    }} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(opacity * 100)}
                      onChange={(e) => onOpacityChange(parseInt(e.target.value) / 100)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: 12,
                        appearance: 'none',
                        background: `linear-gradient(to right, transparent, ${colorValue})`,
                        borderRadius: 2,
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round(opacity * 100)}
                    onChange={(e) => onOpacityChange(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) / 100)}
                    style={{
                      width: 40,
                      padding: '2px 4px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 4,
                      fontSize: 11,
                      color: '#a1a1aa',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Preset colors */}
              <div>
                <div style={{ fontSize: 10, color: '#52525b', marginBottom: 6, fontWeight: 500 }}>Presets</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onChange(preset)}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        background: preset,
                        border: colorValue.toLowerCase() === preset.toLowerCase() ? '2px solid #A78BFA' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                      }}
                      title={preset}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ColorPicker;

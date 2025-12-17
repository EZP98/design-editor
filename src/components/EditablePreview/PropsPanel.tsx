/**
 * PropsPanel
 *
 * Panel for editing selected element properties with visual controls.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { SelectedElement } from './PreviewManager';

// ============================================
// TYPES
// ============================================

interface PropsPanelProps {
  /** The selected element */
  selectedElement: SelectedElement | null;
  /** Called when props change */
  onChange: (props: Record<string, unknown>) => void;
  /** Optional AI prompt handler */
  onAIPrompt?: (prompt: string) => Promise<Record<string, unknown>>;
}

// ============================================
// PROP EDITOR COMPONENTS
// ============================================

interface PropEditorProps {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

function StringEditor({ name, value, onChange }: PropEditorProps) {
  // Check if it's a color
  const isColor =
    name.toLowerCase().includes('color') ||
    name.toLowerCase().includes('background') ||
    (typeof value === 'string' && value.startsWith('#'));

  if (isColor) {
    return (
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={String(value) || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded border border-zinc-700 cursor-pointer"
        />
        <input
          type="text"
          value={String(value) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
          placeholder="Color value"
        />
      </div>
    );
  }

  // Check if it's a URL
  const isUrl =
    name.toLowerCase().includes('url') ||
    name.toLowerCase().includes('src') ||
    name.toLowerCase().includes('href');

  if (isUrl) {
    return (
      <input
        type="url"
        value={String(value) || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
        placeholder="Enter URL"
      />
    );
  }

  // Default text input
  return (
    <input
      type="text"
      value={String(value) || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
    />
  );
}

function NumberEditor({ name, value, onChange }: PropEditorProps) {
  const numValue = Number(value) || 0;

  // Check if it should be a slider
  const isPercentage =
    name.toLowerCase().includes('opacity') ||
    name.toLowerCase().includes('percent');

  const isSize =
    name.toLowerCase().includes('size') ||
    name.toLowerCase().includes('width') ||
    name.toLowerCase().includes('height') ||
    name.toLowerCase().includes('padding') ||
    name.toLowerCase().includes('margin') ||
    name.toLowerCase().includes('gap');

  if (isPercentage) {
    return (
      <div className="flex gap-2 items-center">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={numValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-zinc-400 w-12 text-right">
          {Math.round(numValue * 100)}%
        </span>
      </div>
    );
  }

  if (isSize) {
    return (
      <div className="flex gap-2 items-center">
        <input
          type="range"
          min={0}
          max={500}
          value={numValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <input
          type="number"
          value={numValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-right"
        />
      </div>
    );
  }

  return (
    <input
      type="number"
      value={numValue}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
    />
  );
}

function BooleanEditor({ value, onChange }: PropEditorProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`
        w-12 h-6 rounded-full transition-colors relative
        ${value ? 'bg-blue-500' : 'bg-zinc-700'}
      `}
    >
      <div
        className={`
          absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
          ${value ? 'translate-x-7' : 'translate-x-1'}
        `}
      />
    </button>
  );
}

function SelectEditor({
  value,
  onChange,
  options,
}: PropEditorProps & { options: string[] }) {
  return (
    <select
      value={String(value) || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ============================================
// KNOWN PROP CONFIGS
// ============================================

const KNOWN_PROPS: Record<string, { type: string; options?: string[] }> = {
  variant: { type: 'select', options: ['default', 'primary', 'secondary', 'outline', 'ghost', 'destructive'] },
  size: { type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  align: { type: 'select', options: ['left', 'center', 'right'] },
  justify: { type: 'select', options: ['start', 'center', 'end', 'between', 'around'] },
  direction: { type: 'select', options: ['row', 'column'] },
  wrap: { type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
};

// ============================================
// MAIN COMPONENT
// ============================================

export function PropsPanel({
  selectedElement,
  onChange,
  onAIPrompt,
}: PropsPanelProps) {
  const [localProps, setLocalProps] = useState<Record<string, unknown>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync local props with selected element
  useEffect(() => {
    if (selectedElement) {
      setLocalProps(selectedElement.props);
    } else {
      setLocalProps({});
    }
  }, [selectedElement]);

  // Handle prop change
  const handlePropChange = useCallback(
    (name: string, value: unknown) => {
      const newProps = { ...localProps, [name]: value };
      setLocalProps(newProps);
      onChange(newProps);
    },
    [localProps, onChange]
  );

  // Handle AI prompt
  const handleAiSubmit = useCallback(async () => {
    if (!aiPrompt.trim() || !onAIPrompt) return;

    setIsAiLoading(true);
    try {
      const newProps = await onAIPrompt(aiPrompt);
      setLocalProps(newProps);
      onChange(newProps);
      setAiPrompt('');
    } catch (e) {
      console.error('AI prompt failed:', e);
    } finally {
      setIsAiLoading(false);
    }
  }, [aiPrompt, onAIPrompt, onChange]);

  // ==========================================
  // Render
  // ==========================================

  if (!selectedElement) {
    return (
      <div className="p-4 text-zinc-500 text-center">
        <div className="mb-2">
          <svg
            className="w-12 h-12 mx-auto opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
        </div>
        <p className="text-sm">Select an element to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <h3 className="font-medium text-sm">{selectedElement.componentName}</h3>
        </div>
        <p className="text-xs text-zinc-500 mt-1 font-mono">{selectedElement.id}</p>
      </div>

      {/* Props list */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {Object.entries(localProps).map(([name, value]) => {
          // Skip internal props
          if (name.startsWith('_') || name === 'children') return null;

          const knownConfig = KNOWN_PROPS[name.toLowerCase()];
          const valueType = typeof value;

          return (
            <div key={name}>
              <label className="text-xs text-zinc-400 mb-1 block capitalize">
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </label>

              {/* Known select props */}
              {knownConfig?.type === 'select' && knownConfig.options && (
                <SelectEditor
                  name={name}
                  value={value}
                  onChange={(v) => handlePropChange(name, v)}
                  options={knownConfig.options}
                />
              )}

              {/* Boolean */}
              {!knownConfig && valueType === 'boolean' && (
                <BooleanEditor
                  name={name}
                  value={value}
                  onChange={(v) => handlePropChange(name, v)}
                />
              )}

              {/* Number */}
              {!knownConfig && valueType === 'number' && (
                <NumberEditor
                  name={name}
                  value={value}
                  onChange={(v) => handlePropChange(name, v)}
                />
              )}

              {/* String */}
              {!knownConfig && valueType === 'string' && (
                <StringEditor
                  name={name}
                  value={value}
                  onChange={(v) => handlePropChange(name, v)}
                />
              )}

              {/* Object/Array - show as JSON */}
              {!knownConfig && (valueType === 'object' && value !== null) && (
                <textarea
                  value={JSON.stringify(value, null, 2)}
                  onChange={(e) => {
                    try {
                      handlePropChange(name, JSON.parse(e.target.value));
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm font-mono h-20"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* AI Prompt */}
      {onAIPrompt && (
        <div className="p-3 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe changes..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
              disabled={isAiLoading}
            />
            <button
              onClick={handleAiSubmit}
              disabled={!aiPrompt.trim() || isAiLoading}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium disabled:opacity-50 hover:bg-blue-600 transition-colors"
            >
              {isAiLoading ? '...' : 'Apply'}
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            e.g., "make it bigger", "change color to red", "add more padding"
          </p>
        </div>
      )}
    </div>
  );
}

export default PropsPanel;

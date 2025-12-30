/**
 * Canvas3D - 3D Scene Editor
 *
 * A Three.js-based 3D canvas for manipulating 3D objects.
 * Works alongside the 2D canvas, showing only 3D elements.
 */

import React, { useRef, useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
  Grid,
  Environment,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
  useGLTF,
  Html,
  Center
} from '@react-three/drei';
import { useCanvasStore } from '../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../lib/canvas/types';
import * as THREE from 'three';

// ============================================================================
// Types
// ============================================================================

interface Object3DItem {
  id: string;
  name: string;
  modelSrc: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

type TransformMode = 'translate' | 'rotate' | 'scale';

// ============================================================================
// 3D Model Component
// ============================================================================

interface Model3DProps {
  item: Object3DItem;
  isSelected: boolean;
  onSelect: () => void;
}

function Model3D({ item, isSelected, onSelect }: Model3DProps) {
  const { scene } = useGLTF(item.modelSrc);
  const meshRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid shared state issues
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  return (
    <group
      ref={meshRef}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <primitive object={clonedScene} />
      {isSelected && (
        <mesh>
          <boxHelper args={[clonedScene, 0x8B1E2B]} />
        </mesh>
      )}
    </group>
  );
}

// Placeholder cube for items without models
function PlaceholderCube({ item, isSelected, onSelect }: Model3DProps) {
  return (
    <mesh
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isSelected ? '#8B5CF6' : '#444444'}
        wireframe={!isSelected}
      />
    </mesh>
  );
}

// ============================================================================
// Scene Content
// ============================================================================

interface SceneContentProps {
  objects: Object3DItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  transformMode: TransformMode;
  onTransformChange: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
}

function SceneContent({
  objects,
  selectedId,
  onSelect,
  transformMode,
  onTransformChange
}: SceneContentProps) {
  const transformRef = useRef<any>(null);
  const selectedObject = objects.find(o => o.id === selectedId);

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />

      {/* Orbit Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        // Disable orbit when transform is active
        enabled={!selectedId || !transformRef.current?.dragging}
      />

      {/* Environment & Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Environment preset="studio" background={false} />

      {/* Grid */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#333333"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#555555"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Objects */}
      {objects.map((item) => (
        <Suspense
          key={item.id}
          fallback={
            <PlaceholderCube
              item={item}
              isSelected={selectedId === item.id}
              onSelect={() => onSelect(item.id)}
            />
          }
        >
          {item.modelSrc ? (
            <Model3D
              item={item}
              isSelected={selectedId === item.id}
              onSelect={() => onSelect(item.id)}
            />
          ) : (
            <PlaceholderCube
              item={item}
              isSelected={selectedId === item.id}
              onSelect={() => onSelect(item.id)}
            />
          )}
        </Suspense>
      ))}

      {/* Transform Controls for selected object */}
      {selectedObject && (
        <TransformControls
          ref={transformRef}
          mode={transformMode}
          position={selectedObject.position}
          rotation={selectedObject.rotation}
          scale={selectedObject.scale}
          onObjectChange={(e) => {
            if (e?.target) {
              const t = e.target as any;
              onTransformChange(
                selectedObject.id,
                [t.worldPosition.x, t.worldPosition.y, t.worldPosition.z],
                [t.worldRotation.x, t.worldRotation.y, t.worldRotation.z],
                [t.worldScale.x, t.worldScale.y, t.worldScale.z]
              );
            }
          }}
        />
      )}

      {/* Gizmo Helper */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>

      {/* Click on empty to deselect */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => onSelect(null)}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
      </mesh>
    </>
  );
}

// ============================================================================
// Toolbar
// ============================================================================

interface ToolbarProps {
  transformMode: TransformMode;
  onModeChange: (mode: TransformMode) => void;
  onAddCube: () => void;
  selectedId: string | null;
  onDelete: () => void;
  isDark: boolean;
}

function Toolbar({ transformMode, onModeChange, onAddCube, selectedId, onDelete, isDark }: ToolbarProps) {
  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    border: 'none',
    borderRadius: 6,
    background: active ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
    color: active ? 'white' : (isDark ? '#fff' : '#000'),
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  });

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8,
      padding: 8,
      background: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)',
      borderRadius: 10,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      backdropFilter: 'blur(10px)',
      zIndex: 100,
    }}>
      <button style={buttonStyle(transformMode === 'translate')} onClick={() => onModeChange('translate')}>
        <span>↔</span> Move
      </button>
      <button style={buttonStyle(transformMode === 'rotate')} onClick={() => onModeChange('rotate')}>
        <span>⟳</span> Rotate
      </button>
      <button style={buttonStyle(transformMode === 'scale')} onClick={() => onModeChange('scale')}>
        <span>⤢</span> Scale
      </button>

      <div style={{ width: 1, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', margin: '0 4px' }} />

      <button style={buttonStyle(false)} onClick={onAddCube}>
        <span>+</span> Add Cube
      </button>

      {selectedId && (
        <button
          style={{ ...buttonStyle(false), background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' }}
          onClick={onDelete}
        >
          <span>🗑</span> Delete
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Scene Panel (right side)
// ============================================================================

interface ScenePanelProps {
  objects: Object3DItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateObject: (id: string, updates: Partial<Object3DItem>) => void;
  isDark: boolean;
}

function ScenePanel({ objects, selectedId, onSelect, onUpdateObject, isDark }: ScenePanelProps) {
  const selectedObject = objects.find(o => o.id === selectedId);
  const colors = THEME_COLORS[isDark ? 'dark' : 'light'];

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      width: 240,
      background: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        fontWeight: 600,
        fontSize: 13,
        color: colors.textPrimary,
      }}>
        Scene Objects
      </div>

      {/* Object List */}
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {objects.length === 0 ? (
          <div style={{ padding: 16, color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
            No 3D objects yet
          </div>
        ) : (
          objects.map((obj) => (
            <div
              key={obj.id}
              onClick={() => onSelect(obj.id)}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: selectedId === obj.id ? colors.accentLight : 'transparent',
                borderLeft: selectedId === obj.id ? `3px solid ${colors.accent}` : '3px solid transparent',
                color: colors.textPrimary,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>📦</span>
              {obj.name}
            </div>
          ))
        )}
      </div>

      {/* Properties */}
      {selectedObject && (
        <div style={{
          padding: 16,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, marginBottom: 12 }}>
            TRANSFORM
          </div>

          {['Position', 'Rotation', 'Scale'].map((label, idx) => {
            const key = ['position', 'rotation', 'scale'][idx] as keyof Object3DItem;
            const values = selectedObject[key] as [number, number, number];

            return (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis} style={{ flex: 1 }}>
                      <input
                        type="number"
                        value={values[i].toFixed(2)}
                        onChange={(e) => {
                          const newValues = [...values] as [number, number, number];
                          newValues[i] = parseFloat(e.target.value) || 0;
                          onUpdateObject(selectedObject.id, { [key]: newValues });
                        }}
                        step={label === 'Rotation' ? 0.1 : 0.1}
                        style={{
                          width: '100%',
                          padding: '4px 6px',
                          border: `1px solid ${colors.borderColor}`,
                          borderRadius: 4,
                          background: colors.inputBg,
                          color: colors.textPrimary,
                          fontSize: 11,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Canvas3D Component
// ============================================================================

export interface Canvas3DProps {
  onBack?: () => void;
}

export function Canvas3D({ onBack }: Canvas3DProps) {
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const elements = useCanvasStore((state) => state.elements);
  const isDark = canvasSettings?.editorTheme !== 'light';
  const colors = THEME_COLORS[isDark ? 'dark' : 'light'];

  // Get store actions
  const updateElement = useCanvasStore((state) => state.updateElement);
  const addElement = useCanvasStore((state) => state.addElement);
  const deleteElement = useCanvasStore((state) => state.deleteElement);
  const currentPageId = useCanvasStore((state) => state.currentPageId);
  const pages = useCanvasStore((state) => state.pages);

  // Derive 3D objects from canvas store (model3d elements)
  const objects: Object3DItem[] = React.useMemo(() => {
    const model3dElements = Object.values(elements).filter(el => el.type === 'model3d');
    return model3dElements.map((el, idx) => ({
      id: el.id,
      name: el.name || `Object ${idx + 1}`,
      modelSrc: el.modelSrc || '',
      // Use element's 3D position if stored, otherwise default
      position: el.position3d || [0, 0, idx * 2] as [number, number, number],
      rotation: el.rotation3d || [0, 0, 0] as [number, number, number],
      scale: el.scale3d || [1, 1, 1] as [number, number, number],
    }));
  }, [elements]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');

  // Add a new 3D object (creates model3d element in store)
  const handleAddCube = useCallback(() => {
    const currentPage = pages[currentPageId];
    if (!currentPage) return;

    // Add model3d element to canvas store
    const newId = addElement('model3d', currentPage.rootElementId);

    // Set 3D-specific properties
    if (newId) {
      updateElement(newId, {
        name: `3D Object ${objects.length + 1}`,
        modelSrc: '',
        position3d: [0, 0, objects.length * 2] as [number, number, number],
        rotation3d: [0, 0, 0] as [number, number, number],
        scale3d: [1, 1, 1] as [number, number, number],
      });
      setSelectedId(newId);
    }
  }, [addElement, updateElement, currentPageId, pages, objects.length]);

  // Delete selected (removes from canvas store)
  const handleDelete = useCallback(() => {
    if (selectedId) {
      deleteElement(selectedId);
      setSelectedId(null);
    }
  }, [selectedId, deleteElement]);

  // Update object transform (syncs to canvas store)
  const handleTransformChange = useCallback((
    id: string,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number]
  ) => {
    updateElement(id, {
      position3d: position,
      rotation3d: rotation,
      scale3d: scale,
    });
  }, [updateElement]);

  // Update object property (syncs to canvas store)
  const handleUpdateObject = useCallback((id: string, updates: Partial<Object3DItem>) => {
    const storeUpdates: Partial<{
      position3d: [number, number, number];
      rotation3d: [number, number, number];
      scale3d: [number, number, number];
      name: string;
      modelSrc: string;
    }> = {};
    if (updates.position) storeUpdates.position3d = updates.position;
    if (updates.rotation) storeUpdates.rotation3d = updates.rotation;
    if (updates.scale) storeUpdates.scale3d = updates.scale;
    if (updates.name) storeUpdates.name = updates.name;
    if (updates.modelSrc) storeUpdates.modelSrc = updates.modelSrc;

    updateElement(id, storeUpdates);
  }, [updateElement]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: isDark ? '#1a1a1a' : '#f0f0f0',
      position: 'relative',
    }}>
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            padding: '8px 16px',
            border: 'none',
            borderRadius: 8,
            background: colors.accent,
            color: 'white',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← Back to 2D
        </button>
      )}

      {/* Toolbar */}
      <Toolbar
        transformMode={transformMode}
        onModeChange={setTransformMode}
        onAddCube={handleAddCube}
        selectedId={selectedId}
        onDelete={handleDelete}
        isDark={isDark}
      />

      {/* Scene Panel */}
      <ScenePanel
        objects={objects}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onUpdateObject={handleUpdateObject}
        isDark={isDark}
      />

      {/* 3D Canvas */}
      <Canvas
        shadows
        style={{ background: isDark ? '#1a1a1a' : '#f0f0f0' }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <SceneContent
          objects={objects}
          selectedId={selectedId}
          onSelect={setSelectedId}
          transformMode={transformMode}
          onTransformChange={handleTransformChange}
        />
      </Canvas>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '8px 16px',
        background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
        borderRadius: 8,
        fontSize: 11,
        color: colors.textSecondary,
        zIndex: 100,
      }}>
        Left click: Select • Right drag: Orbit • Scroll: Zoom • Middle drag: Pan
      </div>
    </div>
  );
}

export default Canvas3D;

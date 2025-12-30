/**
 * Model3D Viewer Component
 *
 * Renders 3D models using Google's model-viewer web component.
 * Supports GLB/GLTF files with interactive controls.
 */

import React, { useEffect, useRef, memo } from 'react';
import '@google/model-viewer';
import { Box } from 'lucide-react';

export interface Model3DViewerProps {
  src?: string;
  poster?: string;
  alt?: string;
  autoRotate?: boolean;
  autoRotateDelay?: number;
  cameraOrbit?: string;
  cameraTarget?: string;
  environmentImage?: string;
  shadowIntensity?: number;
  exposure?: number;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  className?: string;
  interactive?: boolean;
}

export const Model3DViewer = memo(function Model3DViewer({
  src,
  poster,
  alt = '3D Model',
  autoRotate = true,
  autoRotateDelay = 3000,
  cameraOrbit = '0deg 75deg 105%',
  cameraTarget = '0m 0m 0m',
  environmentImage = 'neutral',
  shadowIntensity = 1,
  exposure = 1,
  width = '100%',
  height = '100%',
  style,
  className,
  interactive = true,
}: Model3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // If no source, show placeholder
  if (!src) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#18181b',
          borderRadius: 12,
          color: '#71717a',
          gap: 8,
          ...style,
        }}
      >
        <Box size={48} strokeWidth={1} />
        <span style={{ fontSize: 12 }}>Modello 3D</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>Trascina un file .glb</span>
      </div>
    );
  }

  // Use useEffect to create model-viewer element dynamically
  useEffect(() => {
    if (!containerRef.current || !src) return;

    // Clear existing content
    containerRef.current.innerHTML = '';

    // Create model-viewer element
    const modelViewer = document.createElement('model-viewer') as any;
    modelViewer.src = src;
    if (poster) modelViewer.poster = poster;
    modelViewer.alt = alt;
    if (interactive) modelViewer.setAttribute('camera-controls', '');
    if (autoRotate) modelViewer.setAttribute('auto-rotate', '');
    modelViewer.setAttribute('auto-rotate-delay', String(autoRotateDelay));
    modelViewer.setAttribute('camera-orbit', cameraOrbit);
    modelViewer.setAttribute('camera-target', cameraTarget);
    modelViewer.setAttribute('environment-image', environmentImage);
    modelViewer.setAttribute('shadow-intensity', String(shadowIntensity));
    modelViewer.setAttribute('shadow-softness', '1');
    modelViewer.setAttribute('exposure', String(exposure));
    modelViewer.setAttribute('interaction-prompt', 'none');
    modelViewer.setAttribute('loading', 'lazy');
    modelViewer.setAttribute('touch-action', 'pan-y');

    // Style
    modelViewer.style.width = '100%';
    modelViewer.style.height = '100%';
    modelViewer.style.backgroundColor = 'transparent';
    modelViewer.style.outline = 'none';

    containerRef.current.appendChild(modelViewer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [src, poster, alt, interactive, autoRotate, autoRotateDelay, cameraOrbit, cameraTarget, environmentImage, shadowIntensity, exposure]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width,
        height,
        position: 'relative',
        ...style,
      }}
    />
  );
});

export default Model3DViewer;

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import {
  getWebContainer,
  writeFiles,
  installDependencies,
  startDevServer,
  createViteReactProject,
} from '../webcontainer';
import { VISUAL_EDIT_BRIDGE_SCRIPT } from '../visualEditBridge';

export type WebContainerStatus =
  | 'idle'
  | 'booting'
  | 'installing'
  | 'starting'
  | 'ready'
  | 'error';

export interface UseWebContainerReturn {
  status: WebContainerStatus;
  previewUrl: string | null;
  logs: string[];
  error: string | null;
  container: WebContainer | null;
  boot: () => Promise<void>;
  runProject: (files?: Record<string, string>) => Promise<void>;
  updateFile: (path: string, content: string) => Promise<void>;
}

/**
 * Inject the visual edit bridge script into HTML files
 * This enables communication between the editor and the preview iframe
 */
function injectBridgeIntoFiles(files: Record<string, string>): Record<string, string> {
  const result = { ...files };
  // Escape the script for safer injection
  const bridgeScript = `<script type="text/javascript">${VISUAL_EDIT_BRIDGE_SCRIPT}</script>`;

  // Log all file paths for debugging
  const allPaths = Object.keys(files);
  console.log('[WebContainer] Processing', allPaths.length, 'files for bridge injection');

  // Find all HTML files
  const htmlFiles = allPaths.filter(p =>
    p.toLowerCase().endsWith('.html') ||
    p.toLowerCase().endsWith('.htm')
  );
  console.log('[WebContainer] Found HTML files:', htmlFiles);

  let injectedCount = 0;
  for (const [path, content] of Object.entries(result)) {
    // Only inject into .html/.htm files
    const lowerPath = path.toLowerCase();
    if (!lowerPath.endsWith('.html') && !lowerPath.endsWith('.htm')) {
      continue;
    }

    // Check for closing body tag (case-insensitive)
    const bodyCloseMatch = content.match(/<\/body>/i);
    if (!bodyCloseMatch) {
      console.warn('[WebContainer] No </body> tag found in:', path);
      // Try to inject before </html> as fallback
      const htmlCloseMatch = content.match(/<\/html>/i);
      if (htmlCloseMatch) {
        // Avoid double injection
        if (content.includes('__VISUAL_EDIT_BRIDGE__')) {
          console.log('[WebContainer] Bridge already present in:', path);
          continue;
        }
        result[path] = content.replace(htmlCloseMatch[0], `${bridgeScript}\n${htmlCloseMatch[0]}`);
        injectedCount++;
        console.log('[WebContainer] Injected visual edit bridge into:', path, '(before </html>)');
      }
      continue;
    }

    // Avoid double injection
    if (content.includes('__VISUAL_EDIT_BRIDGE__')) {
      console.log('[WebContainer] Bridge already present in:', path);
      continue;
    }

    // Inject before </body>
    result[path] = content.replace(bodyCloseMatch[0], `${bridgeScript}\n${bodyCloseMatch[0]}`);
    injectedCount++;
    console.log('[WebContainer] Injected visual edit bridge into:', path);
  }

  if (injectedCount === 0) {
    console.warn('[WebContainer] WARNING: No HTML files injected with bridge!');
    console.warn('[WebContainer] This means visual editing will NOT work.');
    console.warn('[WebContainer] All file paths:', allPaths.slice(0, 30).join(', '), allPaths.length > 30 ? `... and ${allPaths.length - 30} more` : '');
  } else {
    console.log(`[WebContainer] Successfully injected bridge into ${injectedCount} HTML file(s)`);
  }

  return result;
}

export function useWebContainer(): UseWebContainerReturn {
  const [status, setStatus] = useState<WebContainerStatus>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<WebContainer | null>(null);

  const addLog = useCallback((log: string) => {
    setLogs(prev => [...prev.slice(-100), log]); // Keep last 100 logs
  }, []);

  // Listen for server-ready events
  useEffect(() => {
    const handleServerReady = (e: CustomEvent<{ port: number; url: string }>) => {
      console.log('[useWebContainer] Server ready:', e.detail.url);
      setPreviewUrl(e.detail.url);
      setStatus('ready');
      addLog(`Server ready at ${e.detail.url}`);
    };

    const handleError = (e: CustomEvent<{ error: string }>) => {
      setError(e.detail.error);
      setStatus('error');
      addLog(`Error: ${e.detail.error}`);
    };

    window.addEventListener('webcontainer:server-ready', handleServerReady as EventListener);
    window.addEventListener('webcontainer:error', handleError as EventListener);

    return () => {
      window.removeEventListener('webcontainer:server-ready', handleServerReady as EventListener);
      window.removeEventListener('webcontainer:error', handleError as EventListener);
    };
  }, [addLog]);

  const boot = useCallback(async () => {
    if (containerRef.current) return;

    try {
      setStatus('booting');
      setError(null);
      addLog('Booting WebContainer...');

      const container = await getWebContainer();
      containerRef.current = container;

      addLog('WebContainer ready!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to boot WebContainer';
      setError(errorMessage);
      setStatus('error');
      addLog(`Boot failed: ${errorMessage}`);
    }
  }, [addLog]);

  const runProject = useCallback(async (files?: Record<string, string>) => {
    try {
      // Boot if not already booted
      if (!containerRef.current) {
        setStatus('booting');
        addLog('Booting WebContainer...');
        containerRef.current = await getWebContainer();
        addLog('WebContainer ready!');
      }

      const container = containerRef.current;
      const rawFiles = files || createViteReactProject();

      // DEBUG: Log all files being processed
      console.log('[WebContainer] Raw files received:', Object.keys(rawFiles));
      const htmlFilesInRaw = Object.keys(rawFiles).filter(f => f.toLowerCase().includes('.html'));
      console.log('[WebContainer] HTML files in raw:', htmlFilesInRaw);
      if (htmlFilesInRaw.length > 0) {
        htmlFilesInRaw.forEach(f => {
          console.log(`[WebContainer] ${f} content preview:`, rawFiles[f]?.substring(0, 200));
        });
      }

      // Inject visual edit bridge script into HTML files
      const projectFiles = injectBridgeIntoFiles(rawFiles);

      // DEBUG: Verify injection
      const htmlFilesAfter = Object.keys(projectFiles).filter(f => f.toLowerCase().includes('.html'));
      htmlFilesAfter.forEach(f => {
        const hasBridge = projectFiles[f]?.includes('__VISUAL_EDIT_BRIDGE__');
        console.log(`[WebContainer] ${f} has bridge: ${hasBridge}`);
      });

      // Write files
      setStatus('installing');
      addLog('Writing project files...');
      await writeFiles(container, projectFiles);

      // Install dependencies
      addLog('Installing dependencies (this may take a moment)...');
      const success = await installDependencies(container, addLog);

      if (!success) {
        setStatus('error');
        setError('Failed to install dependencies');
        return;
      }

      // Start dev server
      setStatus('starting');
      addLog('Starting development server...');
      await startDevServer(container, 'npm run dev', addLog);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run project';
      setError(errorMessage);
      setStatus('error');
      addLog(`Error: ${errorMessage}`);
    }
  }, [addLog]);

  const updateFile = useCallback(async (path: string, content: string) => {
    if (!containerRef.current) {
      console.warn('[useWebContainer] Container not ready');
      return;
    }

    try {
      await containerRef.current.fs.writeFile(path, content);
      addLog(`Updated: ${path}`);
    } catch (err) {
      console.error('[useWebContainer] Failed to update file:', err);
      addLog(`Failed to update: ${path}`);
    }
  }, [addLog]);

  return {
    status,
    previewUrl,
    logs,
    error,
    container: containerRef.current,
    boot,
    runProject,
    updateFile,
  };
}

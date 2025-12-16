/**
 * useAgenticErrors - Hook for capturing and managing errors for AI auto-fix
 * Pattern from bolt.diy for agentic error correction
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AlertError } from '../../components/ActionableAlert';

// Error patterns for categorization
const ERROR_PATTERNS = {
  typescript: [
    /TS\d+:/,
    /Type '.*' is not assignable/,
    /Cannot find name/,
    /Property '.*' does not exist/,
    /Argument of type/,
  ],
  eslint: [
    /eslint/i,
    /\d+:\d+\s+error\s+/,
    /\d+:\d+\s+warning\s+/,
  ],
  build: [
    /Build failed/i,
    /Module not found/,
    /Cannot resolve/,
    /SyntaxError/,
    /Unexpected token/,
    /Failed to compile/,
  ],
  runtime: [
    /Uncaught/,
    /TypeError/,
    /ReferenceError/,
    /is not defined/,
    /is not a function/,
    /Cannot read propert/,
  ],
  network: [
    /fetch failed/i,
    /network error/i,
    /CORS/,
    /ERR_/,
  ],
};

// Parse error details from message
function parseErrorDetails(message: string): { file?: string; line?: number } {
  // Match patterns like "src/App.tsx:10:5" or "at App.tsx:10"
  const fileMatch = message.match(/(?:at\s+)?([^\s:]+\.[tj]sx?):(\d+)/);
  if (fileMatch) {
    return { file: fileMatch[1], line: parseInt(fileMatch[2]) };
  }
  return {};
}

// Categorize error type
function categorizeError(message: string): AlertError['type'] {
  for (const [type, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(message))) {
      return type as AlertError['type'];
    }
  }
  return 'runtime';
}

// Extract error title from message
function extractTitle(message: string, type: AlertError['type']): string {
  // Try to get first meaningful line
  const firstLine = message.split('\n')[0].trim();

  // Shorten if too long
  if (firstLine.length > 80) {
    return firstLine.substring(0, 77) + '...';
  }

  return firstLine || `${type.charAt(0).toUpperCase() + type.slice(1)} Error`;
}

export interface UseAgenticErrorsReturn {
  errors: AlertError[];
  addError: (message: string, stack?: string) => void;
  addBuildError: (logs: string[]) => void;
  addRuntimeError: (error: Error | string, source?: string) => void;
  dismissError: (id: string) => void;
  dismissAllErrors: () => void;
  clearErrors: () => void;
  fixingErrorId: string | null;
  setFixingErrorId: (id: string | null) => void;
}

export function useAgenticErrors(): UseAgenticErrorsReturn {
  const [errors, setErrors] = useState<AlertError[]>([]);
  const [fixingErrorId, setFixingErrorId] = useState<string | null>(null);
  const errorIdCounter = useRef(0);

  // Generate unique error ID
  const generateId = useCallback(() => {
    errorIdCounter.current += 1;
    return `error-${Date.now()}-${errorIdCounter.current}`;
  }, []);

  // Add generic error
  const addError = useCallback((message: string, stack?: string) => {
    const type = categorizeError(message);
    const { file, line } = parseErrorDetails(message);

    const newError: AlertError = {
      id: generateId(),
      type,
      title: extractTitle(message, type),
      message,
      stack,
      file,
      line,
      timestamp: Date.now(),
    };

    setErrors((prev) => {
      // Deduplicate similar errors
      const isDuplicate = prev.some(
        (e) => e.message === message && Date.now() - e.timestamp < 5000
      );
      if (isDuplicate) return prev;

      // Keep max 5 errors
      return [...prev.slice(-4), newError];
    });
  }, [generateId]);

  // Add build error from terminal logs
  const addBuildError = useCallback((logs: string[]) => {
    // Find error lines in logs
    const errorLines = logs.filter((log) =>
      /error|failed|cannot|unexpected/i.test(log)
    );

    if (errorLines.length === 0) return;

    const message = errorLines.join('\n');
    const { file, line } = parseErrorDetails(message);

    const newError: AlertError = {
      id: generateId(),
      type: 'build',
      title: 'Build Failed',
      message,
      file,
      line,
      timestamp: Date.now(),
    };

    setErrors((prev) => [...prev.slice(-4), newError]);
  }, [generateId]);

  // Add runtime error from iframe
  const addRuntimeError = useCallback((error: Error | string, source?: string) => {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;
    const { file, line } = parseErrorDetails(stack || message);

    const newError: AlertError = {
      id: generateId(),
      type: 'runtime',
      title: extractTitle(message, 'runtime'),
      message,
      stack,
      file: file || source,
      line,
      timestamp: Date.now(),
    };

    setErrors((prev) => {
      // Deduplicate
      const isDuplicate = prev.some(
        (e) => e.message === message && Date.now() - e.timestamp < 5000
      );
      if (isDuplicate) return prev;

      return [...prev.slice(-4), newError];
    });
  }, [generateId]);

  // Dismiss single error
  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Dismiss all errors
  const dismissAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Clear all errors (for reset)
  const clearErrors = useCallback(() => {
    setErrors([]);
    setFixingErrorId(null);
  }, []);

  return {
    errors,
    addError,
    addBuildError,
    addRuntimeError,
    dismissError,
    dismissAllErrors,
    clearErrors,
    fixingErrorId,
    setFixingErrorId,
  };
}

/**
 * Build context message for AI with error info
 */
export function buildErrorContext(
  error: AlertError,
  currentFiles: Record<string, string>
): string {
  let context = `## Error to Fix\n\n`;
  context += `**Type:** ${error.type}\n`;
  context += `**Error:** ${error.title}\n\n`;
  context += `\`\`\`\n${error.message}\n\`\`\`\n\n`;

  if (error.file && currentFiles[error.file]) {
    context += `## Problematic File: ${error.file}\n\n`;
    context += `\`\`\`${error.file.split('.').pop()}\n`;
    context += currentFiles[error.file];
    context += `\n\`\`\`\n\n`;
  }

  if (error.stack) {
    context += `## Stack Trace\n\n`;
    context += `\`\`\`\n${error.stack}\n\`\`\`\n\n`;
  }

  context += `## Instructions\n\n`;
  context += `Fix this error. Return the complete corrected file content.\n`;
  context += `Use <boltArtifact> tags to wrap the fix.\n`;

  return context;
}

/**
 * Build context with all relevant files for AI
 */
export function buildCodeContext(
  files: Record<string, string>,
  relevantPaths?: string[]
): string {
  let context = `## Current Project Files\n\n`;

  const paths = relevantPaths || Object.keys(files).filter((p) =>
    /\.(tsx?|jsx?|css|json)$/.test(p) &&
    !p.includes('node_modules') &&
    !p.includes('.lock')
  );

  for (const path of paths.slice(0, 10)) { // Limit to 10 files
    const content = files[path];
    if (content && content.length < 10000) { // Skip very large files
      const ext = path.split('.').pop() || 'txt';
      context += `### ${path}\n\n`;
      context += `\`\`\`${ext}\n${content}\n\`\`\`\n\n`;
    }
  }

  return context;
}

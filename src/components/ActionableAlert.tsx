/**
 * ActionableAlert - Shows errors with "Fix with AI" button
 * Pattern from bolt.diy for agentic error correction
 */

import React from 'react';

export interface AlertError {
  id: string;
  type: 'build' | 'runtime' | 'typescript' | 'eslint' | 'network';
  title: string;
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  timestamp: number;
}

interface ActionableAlertProps {
  error: AlertError;
  onFixWithAI: (error: AlertError) => void;
  onDismiss: (id: string) => void;
  isFixing?: boolean;
}

const ActionableAlert: React.FC<ActionableAlertProps> = ({
  error,
  onFixWithAI,
  onDismiss,
  isFixing = false,
}) => {
  const typeIcons: Record<AlertError['type'], JSX.Element> = {
    build: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m16.5 9.4-9-5.19" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    runtime: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    ),
    typescript: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" x2="20" y1="19" y2="19" />
      </svg>
    ),
    eslint: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    ),
    network: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
        <circle cx="12" cy="12" r="2" />
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
      </svg>
    ),
  };

  const typeColors: Record<AlertError['type'], { bg: string; border: string; icon: string }> = {
    build: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', icon: '#ef4444' },
    runtime: { bg: 'rgba(249, 115, 22, 0.1)', border: '#f97316', icon: '#f97316' },
    typescript: { bg: 'rgba(59, 130, 246, 0.1)', border: '#8B5CF6', icon: '#8B5CF6' },
    eslint: { bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308', icon: '#eab308' },
    network: { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', icon: '#a855f7' },
  };

  const colors = typeColors[error.type];

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        animation: 'slideIn 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: colors.border,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {typeIcons[error.type]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: colors.border,
              }}
            >
              {error.type} Error
            </span>
            {error.file && (
              <span
                style={{
                  fontSize: 11,
                  color: '#71717a',
                  fontFamily: 'monospace',
                }}
              >
                {error.file}
                {error.line && `:${error.line}`}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#fafafa',
              marginBottom: 8,
            }}
          >
            {error.title}
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#a1a1aa',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            {error.message}
          </div>

          {error.stack && (
            <details style={{ marginTop: 8 }}>
              <summary
                style={{
                  fontSize: 11,
                  color: '#71717a',
                  cursor: 'pointer',
                }}
              >
                Stack trace
              </summary>
              <pre
                style={{
                  fontSize: 10,
                  color: '#52525b',
                  marginTop: 4,
                  padding: 8,
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 6,
                  overflow: 'auto',
                  maxHeight: 150,
                }}
              >
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(error.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#71717a',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => onFixWithAI(error)}
          disabled={isFixing}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: isFixing
              ? 'rgba(168, 50, 72, 0.3)'
              : 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: isFixing ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {isFixing ? (
            <>
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              AI is fixing...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Fix with AI
            </>
          )}
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(`${error.title}\n${error.message}`)}
          style={{
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#a1a1aa',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          Copy
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ActionableAlert;

// Error Alerts Container
interface ErrorAlertsContainerProps {
  errors: AlertError[];
  onFixWithAI: (error: AlertError) => void;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  fixingErrorId?: string | null;
}

export const ErrorAlertsContainer: React.FC<ErrorAlertsContainerProps> = ({
  errors,
  onFixWithAI,
  onDismiss,
  onDismissAll,
  fixingErrorId,
}) => {
  if (errors.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 400,
        maxHeight: 'calc(100vh - 100px)',
        overflow: 'auto',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      {errors.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>
            {errors.length} errors detected
          </span>
          <button
            onClick={onDismissAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Dismiss all
          </button>
        </div>
      )}

      {/* Errors */}
      {errors.map((error) => (
        <ActionableAlert
          key={error.id}
          error={error}
          onFixWithAI={onFixWithAI}
          onDismiss={onDismiss}
          isFixing={fixingErrorId === error.id}
        />
      ))}
    </div>
  );
};

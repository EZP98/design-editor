/**
 * Auth Modal
 *
 * Login/Signup modal with email, Google, GitHub options
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export function AuthModal({ isOpen, onClose, theme = 'dark' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const {
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    signInWithMagicLink,
  } = useAuth();

  const isDark = theme === 'dark';
  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a';
  const textMuted = isDark ? '#888888' : '#666666';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'magic') {
      const success = await signInWithMagicLink(email);
      if (success) {
        setMagicLinkSent(true);
      }
    } else if (mode === 'signin') {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(email, password);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          maxWidth: 'calc(100vw - 48px)',
          background: panelBg,
          borderRadius: 16,
          border: `1px solid ${borderColor}`,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: textPrimary }}>
              {mode === 'signin' ? 'Accedi' : mode === 'signup' ? 'Registrati' : 'Magic Link'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: textMuted }}>
              {mode === 'magic'
                ? 'Ricevi un link via email'
                : 'Salva i tuoi progetti nel cloud'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: inputBg,
              color: textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LucideIcons.X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {magicLinkSent ? (
            <div style={{
              padding: 20,
              background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              borderRadius: 12,
              textAlign: 'center',
            }}>
              <LucideIcons.Mail size={40} color="#22C55E" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, color: textPrimary, marginBottom: 4 }}>
                Email inviata!
              </div>
              <div style={{ fontSize: 12, color: textMuted }}>
                Controlla la tua casella email e clicca sul link
              </div>
            </div>
          ) : (
            <>
              {/* Info box for email auth */}
              {mode !== 'magic' && (
                <div style={{
                  padding: '12px 14px',
                  marginBottom: 16,
                  background: isDark ? 'rgba(168, 50, 72, 0.1)' : 'rgba(168, 50, 72, 0.08)',
                  borderRadius: 10,
                  border: `1px solid ${isDark ? 'rgba(168, 50, 72, 0.2)' : 'rgba(168, 50, 72, 0.15)'}`,
                }}>
                  <div style={{ fontSize: 12, color: textMuted, lineHeight: 1.5 }}>
                    Usa la tua email per salvare i progetti nel cloud e accedervi da qualsiasi dispositivo.
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: textMuted, marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@esempio.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `1px solid ${borderColor}`,
                      background: inputBg,
                      color: textPrimary,
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                {mode !== 'magic' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, color: textMuted, marginBottom: 6 }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: `1px solid ${borderColor}`,
                        background: inputBg,
                        color: textPrimary,
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {error && (
                  <div style={{
                    padding: '10px 12px',
                    marginBottom: 16,
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#EF4444',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#A83248',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {loading ? (
                    <LucideIcons.Loader2 size={18} className="animate-spin" />
                  ) : mode === 'signin' ? (
                    'Accedi'
                  ) : mode === 'signup' ? (
                    'Registrati'
                  ) : (
                    'Invia Magic Link'
                  )}
                </button>
              </form>

              {/* Mode switcher */}
              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: `1px solid ${borderColor}`,
                textAlign: 'center',
              }}>
                {mode === 'signin' ? (
                  <>
                    <button
                      onClick={() => setMode('signup')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#A83248',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Non hai un account? Registrati
                    </button>
                    <span style={{ color: textMuted, margin: '0 8px' }}>|</span>
                    <button
                      onClick={() => setMode('magic')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: textMuted,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Magic Link
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setMode('signin')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#A83248',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Hai gia un account? Accedi
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AuthModal;

/**
 * Projects Panel
 *
 * Save, load, and manage design projects
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth';
import { useProjects, ProjectSummary } from '../lib/hooks/useProjects';

interface ProjectsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  theme?: 'dark' | 'light';
}

export function ProjectsPanel({ isOpen, onClose, onOpenAuth, theme = 'dark' }: ProjectsPanelProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const {
    projects,
    loading,
    error,
    currentProjectId,
    createProject,
    saveProject,
    loadProject,
    deleteProject,
    renameProject,
    duplicateProject,
  } = useProjects();

  const isDark = theme === 'dark';
  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a';
  const textMuted = isDark ? '#888888' : '#666666';

  if (!isOpen) return null;

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject(newProjectName.trim());
    setNewProjectName('');
    setShowNewProject(false);
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    await renameProject(id, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          width: 500,
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 100px)',
          background: panelBg,
          borderRadius: 16,
          border: `1px solid ${borderColor}`,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #A83248, #8B1E2B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LucideIcons.FolderOpen size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: textPrimary }}>
                I tuoi progetti
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: textMuted }}>
                {isAuthenticated ? `${projects.length} progetti salvati` : 'Accedi per salvare'}
              </p>
            </div>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {!isAuthenticated ? (
            // Not logged in
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: inputBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <LucideIcons.CloudOff size={28} color={textMuted} />
              </div>
              <div style={{ fontSize: 15, color: textPrimary, marginBottom: 8 }}>
                Accedi per salvare i tuoi progetti
              </div>
              <div style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>
                I tuoi design saranno salvati nel cloud e accessibili ovunque
              </div>
              <button
                onClick={onOpenAuth}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#A83248',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <LucideIcons.LogIn size={18} />
                Accedi o Registrati
              </button>
            </div>
          ) : (
            <>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => saveProject()}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#A83248',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <LucideIcons.Save size={16} />
                  {currentProjectId ? 'Salva' : 'Salva come nuovo'}
                </button>
                <button
                  onClick={() => setShowNewProject(true)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: `1px solid ${borderColor}`,
                    background: 'transparent',
                    color: textPrimary,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <LucideIcons.Plus size={16} />
                  Nuovo
                </button>
              </div>

              {/* New project form */}
              {showNewProject && (
                <div style={{
                  padding: 16,
                  marginBottom: 16,
                  background: inputBg,
                  borderRadius: 12,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 8 }}>
                    Nuovo progetto
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Nome progetto"
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1px solid ${borderColor}`,
                        background: panelBg,
                        color: textPrimary,
                        fontSize: 13,
                        outline: 'none',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateProject();
                        if (e.key === 'Escape') setShowNewProject(false);
                      }}
                    />
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim()}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#A83248',
                        color: '#fff',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Crea
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
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

              {/* Projects list */}
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <LucideIcons.Loader2 size={24} color={textMuted} className="animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: textMuted }}>
                  <LucideIcons.Folder size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <div>Nessun progetto salvato</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: `1px solid ${project.id === currentProjectId ? '#A83248' : borderColor}`,
                        background: project.id === currentProjectId ? 'rgba(168, 50, 72, 0.1)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      {/* Thumbnail placeholder */}
                      <div style={{
                        width: 48,
                        height: 36,
                        borderRadius: 6,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <LucideIcons.Layout size={18} color={textMuted} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {renamingId === project.id ? (
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: `1px solid ${borderColor}`,
                              background: inputBg,
                              color: textPrimary,
                              fontSize: 13,
                              outline: 'none',
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(project.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            onBlur={() => handleRename(project.id)}
                          />
                        ) : (
                          <>
                            <div style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: textPrimary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {project.name}
                            </div>
                            <div style={{ fontSize: 11, color: textMuted }}>
                              {formatDate(project.updated_at)}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => loadProject(project.id)}
                          disabled={project.id === currentProjectId}
                          title="Apri"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: 'none',
                            background: hoverBg,
                            color: project.id === currentProjectId ? textMuted : textPrimary,
                            cursor: project.id === currentProjectId ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: project.id === currentProjectId ? 0.5 : 1,
                          }}
                        >
                          <LucideIcons.FolderOpen size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setRenamingId(project.id);
                            setRenameValue(project.name);
                          }}
                          title="Rinomina"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: 'none',
                            background: hoverBg,
                            color: textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LucideIcons.Pencil size={14} />
                        </button>
                        <button
                          onClick={() => duplicateProject(project.id)}
                          title="Duplica"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: 'none',
                            background: hoverBg,
                            color: textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LucideIcons.Copy size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Eliminare questo progetto?')) {
                              deleteProject(project.id);
                            }
                          }}
                          title="Elimina"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: 'none',
                            background: hoverBg,
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LucideIcons.Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && (
          <div style={{
            padding: '12px 24px',
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 12, color: textMuted }}>
              {user?.email}
            </div>
            <button
              onClick={onOpenAuth}
              style={{
                background: 'none',
                border: 'none',
                color: textMuted,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <LucideIcons.Settings size={14} />
              Account
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default ProjectsPanel;

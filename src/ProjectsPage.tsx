import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Types
interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  cloneUrl: string;
  htmlUrl: string;
  updatedAt: string;
  language: string | null;
  homepage: string | null;
}

interface SavedProject {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  updatedAt: string;
  type: 'canvas' | 'github';
}

// Re-export for DesignEditor
export interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  type: 'react';
}

export const getProjectById = (id: string): Project | undefined => {
  const projects = JSON.parse(localStorage.getItem('design-editor-projects') || '[]');
  return projects.find((p: Project) => p.id === id);
};

// API URL
const API_URL = import.meta.env.PROD
  ? 'https://design-editor-api.eziopappalardo98.workers.dev'
  : 'http://localhost:3333';

// Gradient colors for projects without thumbnails
const PROJECT_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
  'linear-gradient(135deg, #8B1E2B 0%, #A83248 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [prompt, setPrompt] = useState('');
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGitHubSection, setShowGitHubSection] = useState(false);

  // Load saved projects from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('objects-saved-projects');
    console.log('[ProjectsPage] Loading projects from localStorage:', stored ? JSON.parse(stored).length + ' projects' : 'none');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[ProjectsPage] Loaded projects:', parsed.map((p: any) => ({ id: p.id, name: p.name, hasThumbnail: !!p.thumbnail })));
      setSavedProjects(parsed);
    }
  }, []);

  // Check GitHub connection on mount
  useEffect(() => {
    const githubConnected = searchParams.get('github_connected');
    const user = searchParams.get('github_user');
    const error = searchParams.get('github_error');

    if (githubConnected && user) {
      setGithubUser(user);
      localStorage.setItem('github_user', user);
      window.history.replaceState({}, '', '/');
      fetchRepos(user);
      setShowGitHubSection(true);
    } else if (error) {
      console.error('GitHub error:', error);
      window.history.replaceState({}, '', '/');
    } else {
      const savedUser = localStorage.getItem('github_user');
      if (savedUser) {
        setGithubUser(savedUser);
        fetchRepos(savedUser);
      }
    }
  }, [searchParams]);

  const fetchRepos = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/github/repos?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      } else if (res.status === 401) {
        setGithubUser(null);
        localStorage.removeItem('github_user');
      }
    } catch (err) {
      console.error('Error fetching repos:', err);
    }
    setLoading(false);
  };

  const connectGitHub = async () => {
    try {
      const res = await fetch(`${API_URL}/api/github/auth`);
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.error) {
        alert(data.help || data.error);
      }
    } catch (err) {
      console.error('Error starting GitHub auth:', err);
    }
  };

  const disconnectGitHub = async () => {
    try {
      await fetch(`${API_URL}/api/github/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: githubUser }),
      });
    } catch {}
    setGithubUser(null);
    setRepos([]);
    localStorage.removeItem('github_user');
  };

  const openRepo = (repo: GitHubRepo) => {
    const repoData = {
      id: repo.name,
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description || '',
      type: 'github',
      owner: repo.fullName.split('/')[0],
      userId: githubUser,
      homepage: repo.homepage || null,
    };
    localStorage.setItem('current-github-repo', JSON.stringify(repoData));
    navigate(`/editor/${repo.name}`);
  };

  const openSavedProject = (project: SavedProject) => {
    navigate(`/editor/${project.id}`);
  };

  const handlePromptSubmit = () => {
    if (prompt.trim()) {
      // Pass prompt to editor for AI generation
      const projectId = `ai-${Date.now()}`;
      localStorage.setItem('objects-ai-prompt', prompt);
      navigate(`/editor/${projectId}`);
    }
  };

  const deleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedProjects.filter(p => p.id !== projectId);
    setSavedProjects(updated);
    localStorage.setItem('objects-saved-projects', JSON.stringify(updated));
    // Also remove canvas data
    localStorage.removeItem(`objects-canvas-${projectId}`);
  };

  const createBlankProject = () => {
    navigate('/editor/new');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(20, 20, 20, 0.98)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'linear-gradient(135deg, #A83248 0%, #8B1E2B 100%)',
          }} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            OBJECTS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {githubUser ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 6,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{githubUser}</span>
              </div>
              <button
                onClick={disconnectGitHub}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 6,
                  color: '#888',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Disconnetti
              </button>
            </>
          ) : (
            <button
              onClick={connectGitHub}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        {/* Hero - Prompt Input */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h1 style={{
            color: '#fff',
            fontSize: 32,
            fontWeight: 500,
            marginBottom: 32,
            letterSpacing: '-0.02em',
          }}>
            Cosa vuoi creare?
          </h1>

          {/* Prompt Input Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: 600,
            margin: '0 auto',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
          }}>
            <button
              onClick={createBlankProject}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: 10,
                color: '#888',
                cursor: 'pointer',
              }}
              title="Nuovo progetto vuoto"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePromptSubmit()}
              placeholder="Descrivi la tua idea. Allega un design per guidare il risultato."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 15,
              }}
            />

            <button
              onClick={handlePromptSubmit}
              disabled={!prompt.trim()}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: prompt.trim() ? 'linear-gradient(135deg, #A83248 0%, #8B1E2B 100%)' : 'rgba(255, 255, 255, 0.04)',
                border: 'none',
                borderRadius: 10,
                color: prompt.trim() ? '#fff' : '#555',
                cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <section style={{ marginBottom: 60 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <h2 style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>
              {savedProjects.length > 0 ? 'I tuoi progetti' : 'Inizia un nuovo progetto'}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 24,
          }}>
            {/* Blank Canvas Card */}
            <div
              onClick={createBlankProject}
              style={{ cursor: 'pointer' }}
            >
              <div
                style={{
                  height: 160,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '2px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  transition: 'all 0.2s',
                  marginBottom: 12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A83248';
                  e.currentTarget.style.background = 'rgba(168, 50, 72, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span style={{ color: '#888', fontSize: 13, fontWeight: 500 }}>Nuovo progetto</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                Tela bianca
              </h3>
              <p style={{ color: '#666', fontSize: 12 }}>
                Inizia da zero
              </p>
            </div>

            {/* Saved Projects with Thumbnails */}
            {savedProjects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => openSavedProject(project)}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Thumbnail Card */}
                <div
                  style={{
                    height: 160,
                    background: project.thumbnail
                      ? '#1a1a1a'
                      : PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length],
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    marginBottom: 12,
                    position: 'relative',
                    overflow: 'hidden',
                    border: project.thumbnail ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
                    const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                    if (deleteBtn) deleteBtn.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    const deleteBtn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                    if (deleteBtn) deleteBtn.style.opacity = '0';
                  }}
                >
                  {/* Canvas Preview - Full size when thumbnail exists */}
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: 8,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '85%',
                      height: '75%',
                      background: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: 8,
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    className="delete-btn"
                    onClick={(e) => deleteProject(project.id, e)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(8px)',
                      border: 'none',
                      borderRadius: 6,
                      color: '#fff',
                      cursor: 'pointer',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    title="Elimina progetto"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>

                {/* Info */}
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                  {project.name}
                </h3>
                <p style={{ color: '#666', fontSize: 12 }}>
                  {new Date(project.updatedAt).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* GitHub Repos Toggle */}
        {githubUser && (
          <section>
            <button
              onClick={() => setShowGitHubSection(!showGitHubSection)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                color: '#888',
                fontSize: 13,
                cursor: 'pointer',
                marginBottom: showGitHubSection ? 20 : 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Repository GitHub ({repos.length})
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: showGitHubSection ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showGitHubSection && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 12,
              }}>
                {loading ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      border: '2px solid rgba(255, 255, 255, 0.08)',
                      borderTopColor: '#A83248',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto',
                    }} />
                  </div>
                ) : (
                  repos.slice(0, 12).map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => openRepo(repo)}
                      style={{
                        padding: 16,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <h3 style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{repo.name}</h3>
                        {repo.language && (
                          <span style={{
                            padding: '2px 6px',
                            background: 'rgba(168, 50, 72, 0.2)',
                            borderRadius: 4,
                            color: '#A83248',
                            fontSize: 10,
                            fontWeight: 500,
                          }}>
                            {repo.language}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p style={{ color: '#555', fontSize: 12, lineHeight: 1.4 }}>
                          {repo.description.slice(0, 80)}{repo.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProjectsPage;

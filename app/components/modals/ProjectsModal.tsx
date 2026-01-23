'use client';

import { Project } from '../types';

interface ProjectsModalProps {
  projectsOpen: boolean;
  setProjectsOpen: (open: boolean) => void;
  projects: Project[];
  currentProjectId: string | null;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
  labelForMode: (mode: string) => string;
  createProject: () => void;
  saveCurrentProject: () => void;
  importProject: () => void;
  loadProject: (project: Project) => void;
  exportProject: (project: Project) => void;
  deleteProject: (id: string) => void;
}

export default function ProjectsModal({
  projectsOpen,
  setProjectsOpen,
  projects,
  currentProjectId,
  newProjectName,
  setNewProjectName,
  labelForMode,
  createProject,
  saveCurrentProject,
  importProject,
  loadProject,
  exportProject,
  deleteProject,
}: ProjectsModalProps) {
  if (!projectsOpen) return null;

  return (
    <div className="settings-overlay" onMouseDown={() => setProjectsOpen(false)}>
      <div className="settings-panel projects-panel" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="settings-head">
          <div>
            <p className="eyebrow">Projects</p>
            <h3 className="settings-title">Manage projects</h3>
            <p className="hint">Save and load your work. Export/import JSON files.</p>
          </div>
          <button className="ghost" type="button" onClick={() => setProjectsOpen(false)}>Close</button>
        </div>

        <div className="projects-actions">
          <div className="settings-add">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project name"
              aria-label="New project name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createProject();
              }}
            />
            <button className="primary" type="button" onClick={createProject}>Create</button>
          </div>
          <button className="ghost" type="button" onClick={saveCurrentProject}>
            Save Current
          </button>
          <button className="ghost" type="button" onClick={importProject}>
            Import JSON
          </button>
        </div>

        <div className="projects-list">
          {projects.length === 0 && (
            <div className="empty-state">
              <p>No projects yet. Create one to save your work.</p>
            </div>
          )}
          {projects.map((proj) => (
            <div key={proj.id} className={`project-card ${currentProjectId === proj.id ? 'active' : ''}`}>
              <div className="project-info">
                <div className="project-name">{proj.name}</div>
                <div className="project-meta">
                  {labelForMode(proj.mode)} • {new Date(proj.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="project-actions">
                <button className="ghost" type="button" onClick={() => loadProject(proj)}>Load</button>
                <button className="ghost" type="button" onClick={() => exportProject(proj)}>Export</button>
                <button className="ghost" type="button" onClick={() => deleteProject(proj.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BillboardHero } from './components/BillboardHero';
import { ActiveTasksRail } from './components/ActiveTasksRail';
import { ProjectGrid } from './components/ProjectGrid';
import { NotionPagePreviewModal } from './components/NotionPagePreviewModal';
import { ExecutionReportsDrawer } from './components/ExecutionReportsDrawer';
import { AddProjectModal } from './components/AddProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { INITIAL_PROJECTS } from './services/initialData';
import {
  DEFAULT_SETTINGS,
  fetchGitHubRepo,
  generateProjectSynopsis,
  syncProjectToNotion,
  fetchExecutionReports,
  clearAllReports,
} from './services/api';
import { GitHubProject, SyncTask, ExecutionReport, NoraSettings } from './types';

const STORAGE_PROJECTS_KEY = 'nora_tracked_projects_v1';
const STORAGE_SETTINGS_KEY = 'nora_settings_v1';

export default function App() {
  // 1. Projects State
  const [projects, setProjects] = useState<GitHubProject[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read projects from localStorage', e);
    }
    return INITIAL_PROJECTS;
  });

  // 2. Settings State
  const [settings, setSettings] = useState<NoraSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // 3. Featured Hero Project
  const [heroProject, setHeroProject] = useState<GitHubProject>(() => projects[0] || INITIAL_PROJECTS[0]);

  // 4. Tasks & Reports State
  const [activeTasks, setActiveTasks] = useState<SyncTask[]>([]);
  const [executionReports, setExecutionReports] = useState<ExecutionReport[]>([]);

  // 5. Modals State
  const [previewProject, setPreviewProject] = useState<GitHubProject | null>(null);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [activeSyncId, setActiveSyncId] = useState<string | null>(null);

  // Sync to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Load backend execution reports on mount
  useEffect(() => {
    fetchExecutionReports().then((reports) => {
      if (reports && reports.length > 0) {
        setExecutionReports(reports);
      }
    });
  }, []);

  // Sync runner for a single repository
  const runProjectSync = async (project: GitHubProject): Promise<void> => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setActiveSyncId(project.id);

    const initialTask: SyncTask = {
      id: taskId,
      projectId: project.id,
      projectName: project.name,
      projectFullName: project.fullName,
      progress: 15,
      status: 'syncing',
      startedAt: new Date().toISOString(),
      currentStep: 'Querying GitHub REST API for updated telemetry...',
    };

    setActiveTasks((prev) => [initialTask, ...prev]);

    try {
      // Step 1: Fresh telemetry from GitHub
      let updatedProject = project;
      try {
        const fresh = await fetchGitHubRepo(project.fullName, settings.githubToken);
        updatedProject = {
          ...project,
          ...fresh,
          coverImage: project.coverImage || fresh.coverImage,
        };
      } catch (err: any) {
        console.warn('Could not refresh GitHub telemetry, syncing using existing cached state:', err.message);
      }

      // Step 2: AI / Algorithmic Synopsis
      setActiveTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, progress: 45, currentStep: 'Synthesizing executive project synopsis...' }
            : t
        )
      );

      let synopsis = updatedProject.synopsis;
      if (settings.generateAiSynopsis) {
        synopsis = await generateProjectSynopsis(updatedProject);
        updatedProject.synopsis = synopsis;
      }

      // Step 3: Notion Block Transformation & API Dispatch
      setActiveTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, progress: 75, currentStep: 'Constructing Notion Block Tree & dispatching API payload...' }
            : t
        )
      );

      const syncRes = await syncProjectToNotion(updatedProject, settings, synopsis);

      // Step 4: Finalize
      const completedProject: GitHubProject = {
        ...updatedProject,
        lastSyncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
        notionPageUrl: syncRes.executionResult?.notionPageUrl || updatedProject.notionPageUrl,
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? completedProject : p))
      );

      if (heroProject.id === project.id) {
        setHeroProject(completedProject);
      }

      setActiveTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                progress: 100,
                status: 'completed',
                currentStep: 'Notion Hub verified and in sync.',
                durationMs: syncRes.report.durationMs,
              }
            : t
        )
      );

      // Refresh reports
      setExecutionReports((prev) => [syncRes.report, ...prev]);
    } catch (error: any) {
      console.error('Project sync failure:', error);
      setActiveTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                progress: 100,
                status: 'failed',
                currentStep: `Failed: ${error.message || 'Unknown network error'}`,
              }
            : t
        )
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, lastSyncStatus: 'error' } : p
        )
      );

      fetchExecutionReports().then((r) => {
        if (r && r.length > 0) setExecutionReports(r);
      });
    } finally {
      setActiveSyncId(null);
    }
  };

  // Sync All Tracked Projects
  const handleSyncAll = async () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);

    for (const project of projects) {
      await runProjectSync(project);
    }

    setIsSyncingAll(false);
  };

  // Add new repository to Nora
  const handleAddProject = (newProject: GitHubProject, autoSync: boolean) => {
    // Avoid duplicate IDs
    const exists = projects.some((p) => p.id === newProject.id);
    let updatedList: GitHubProject[];

    if (exists) {
      updatedList = projects.map((p) => (p.id === newProject.id ? newProject : p));
    } else {
      updatedList = [newProject, ...projects];
    }

    setProjects(updatedList);
    setHeroProject(newProject);

    if (autoSync) {
      runProjectSync(newProject);
    }
  };

  const handleClearCompletedTasks = () => {
    setActiveTasks((prev) => prev.filter((t) => t.status === 'syncing'));
  };

  const handleClearReports = async () => {
    await clearAllReports();
    setExecutionReports([]);
  };

  const syncedCount = projects.filter((p) => p.lastSyncStatus === 'synced').length;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-zinc-100 flex flex-col selection:bg-[#e50914] selection:text-white">
      {/* Cinematic Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddProject={() => setIsAddProjectOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        onSyncAll={handleSyncAll}
        isSyncingAll={isSyncingAll}
        totalProjects={projects.length}
        syncedCount={syncedCount}
        reportCount={executionReports.length}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {/* Billboard Hero Section */}
        {heroProject && (
          <BillboardHero
            project={heroProject}
            onSync={runProjectSync}
            onPreviewNotion={(proj) => setPreviewProject(proj)}
            isSyncing={activeSyncId === heroProject.id}
          />
        )}

        {/* High-Contrast Active Tasks Rail */}
        <ActiveTasksRail
          tasks={activeTasks}
          onRetryTask={(task) => {
            const found = projects.find((p) => p.id === task.projectId);
            if (found) runProjectSync(found);
          }}
          onClearCompleted={handleClearCompletedTasks}
        />

        {/* Repositories Matrix */}
        <ProjectGrid
          projects={projects}
          activeSyncId={activeSyncId}
          onSync={runProjectSync}
          onPreviewNotion={(proj) => setPreviewProject(proj)}
          onSelectHero={(proj) => setHeroProject(proj)}
        />
      </main>

      {/* Modals & Drawers */}
      {previewProject && (
        <NotionPagePreviewModal
          project={previewProject}
          onClose={() => setPreviewProject(null)}
          onSync={runProjectSync}
          isSyncing={activeSyncId === previewProject.id}
          notionConnected={Boolean(settings.notionToken && settings.notionParentPageId)}
        />
      )}

      <ExecutionReportsDrawer
        reports={executionReports}
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        onClear={handleClearReports}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onAddProject={handleAddProject}
        githubToken={settings.githubToken}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 bg-[#08080a] py-6 px-4 md:px-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e50914]" />
            <span className="font-semibold text-zinc-400">NORA</span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>Autonomous GitHub-to-Notion Synchronization Hub</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500 font-mono text-[11px]">
            <span>REST API v3</span>
            <span aria-hidden="true" className="text-zinc-800">·</span>
            <span>Notion Blocks v2022-06-28</span>
            <span aria-hidden="true" className="text-zinc-800">·</span>
            <span>Zero Slop Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

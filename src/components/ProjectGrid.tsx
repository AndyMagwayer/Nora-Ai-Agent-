import React, { useState } from 'react';
import { RefreshCw, Eye, Star, GitPullRequest, AlertCircle, ArrowUpRight, CheckCircle2, ClipboardCopy, Check } from 'lucide-react';
import { GitHubProject } from '../types';

interface ProjectGridProps {
  projects: GitHubProject[];
  activeSyncId: string | null;
  onSync: (project: GitHubProject) => void;
  onPreviewNotion: (project: GitHubProject) => void;
  onSelectHero: (project: GitHubProject) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  activeSyncId,
  onSync,
  onPreviewNotion,
  onSelectHero,
}) => {
  const [filter, setFilter] = useState<'all' | 'synced' | 'diff' | 'active'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (filter === 'synced') return p.lastSyncStatus === 'synced';
    if (filter === 'diff') return p.lastSyncStatus === 'diff_detected';
    if (filter === 'active') return p.openIssuesCount > 0;
    return true;
  });

  return (
    <section className="mb-12">
      {/* Grid Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Repository Hubs & Notion Sync Targets
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time synchronization matrix mapping your GitHub repositories to Notion workspaces.
          </p>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 bg-[#141417] p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setFilter('synced')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'synced'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            In Notion
          </button>
          <button
            onClick={() => setFilter('diff')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'diff'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Update Available
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'active'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Issues
          </button>
        </div>
      </div>

      {/* Projects Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const isSyncing = activeSyncId === project.id;
          const isOutOfSync = project.lastSyncStatus === 'diff_detected';

          return (
            <div
              key={project.id}
              className="group relative bg-[#121215] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col justify-between shadow-md hover:shadow-xl"
            >
              {/* Card Banner / Poster Artwork */}
              <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
                <img
                  src={project.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                  alt={project.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/60 to-transparent" />

                {/* Status Indicator Bar */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] font-semibold bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSyncing
                        ? 'bg-sky-400 animate-pulse'
                        : isOutOfSync
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-zinc-200">
                    {isSyncing ? 'Syncing...' : isOutOfSync ? 'Diff Detected' : 'Notion Synced'}
                  </span>
                </div>

                {/* Primary Language */}
                <div className="absolute top-3 left-3 text-[11px] font-mono font-medium text-zinc-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/5">
                  {project.primaryLanguage}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Title & Owner */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <button
                      onClick={() => onSelectHero(project)}
                      className="text-left font-bold text-lg text-white hover:text-red-400 transition-colors tracking-tight truncate cursor-pointer"
                      title="Focus on Billboard"
                    >
                      {project.name}
                    </button>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-white transition-colors p-1"
                      title="Open GitHub"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>

                  <p className="text-xs text-zinc-400 font-mono mb-2">
                    {project.owner} / {project.defaultBranch}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>
                </div>

                <div>
                  {/* Unboxed Metadata (Zero-Pill Discipline) */}
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mb-4 pt-3 border-t border-zinc-800/80">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400/80 fill-amber-400/10" />
                      {project.stars.toLocaleString()}
                    </span>
                    <span aria-hidden="true" className="text-zinc-700">·</span>
                    <span className="flex items-center gap-1">
                      <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
                      {project.pullRequests?.length || 0} PRs
                    </span>
                    <span aria-hidden="true" className="text-zinc-700">·</span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      {project.openIssuesCount} issues
                    </span>
                  </div>

                  {/* Action Bar */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSync(project)}
                        disabled={isSyncing}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[#e50914] hover:bg-[#b81d24] text-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync via API'}</span>
                      </button>

                      <button
                        onClick={() => onPreviewNotion(project)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Preview</span>
                      </button>
                    </div>

                    {/* 1-Click Instant Notion Export Button (Bypasses API token requirement) */}
                    <button
                      onClick={async () => {
                        const { copyToNotionClipboard } = await import('../services/notionClipboard');
                        await copyToNotionClipboard(project);
                        setCopiedId(project.id);
                        setTimeout(() => setCopiedId(null), 3000);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
                      title="Скопировать страницу и вставить в Notion (Ctrl + V)"
                    >
                      {copiedId === project.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ClipboardCopy className="w-3.5 h-3.5 text-black" />
                      )}
                      <span>
                        {copiedId === project.id
                          ? 'Скопировано! Вставьте в Notion (Ctrl+V)'
                          : 'Вставить в Notion (1 клик)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

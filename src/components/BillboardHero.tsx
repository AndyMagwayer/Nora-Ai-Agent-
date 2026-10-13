import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Eye, GitCommit, GitPullRequest, Star, AlertCircle, ArrowUpRight, ClipboardCopy, Check } from 'lucide-react';
import { GitHubProject } from '../types';

interface BillboardHeroProps {
  project: GitHubProject;
  onSync: (project: GitHubProject) => void;
  onPreviewNotion: (project: GitHubProject) => void;
  isSyncing: boolean;
}

export const BillboardHero: React.FC<BillboardHeroProps> = ({
  project,
  onSync,
  onPreviewNotion,
  isSyncing,
}) => {
  const [copiedNotice, setCopiedNotice] = useState(false);
  const latestCommit = project.commits?.[0];
  const isOutOfSync = project.lastSyncStatus === 'diff_detected';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-b from-zinc-900 to-[#0e0e11] mb-8 shadow-2xl">
      {/* Background Poster Artwork with Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={project.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80'}
          alt={project.name}
          className="w-full h-full object-cover object-center opacity-25 filter blur-[1px] transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0d] via-[#0b0b0d]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e11] via-transparent to-black/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-6 md:p-10 max-w-4xl">
        {/* Status Kicker & Category */}
        <div className="flex items-center gap-3 text-xs font-semibold mb-3">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isSyncing
                  ? 'bg-sky-400 animate-pulse'
                  : isOutOfSync
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            {isSyncing
              ? 'SYNCHRONIZING WITH NOTION...'
              : isOutOfSync
              ? 'UPDATE AVAILABLE (DIFF DETECTED)'
              : 'LIVE IN NOTION WORKSPACE'}
          </span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span className="text-zinc-400">{project.primaryLanguage}</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span className="text-zinc-500 font-mono">Branch [{project.defaultBranch}]</span>
        </div>

        {/* Project Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
          {project.name}
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base text-zinc-300 leading-relaxed max-w-2xl mb-6">
          {project.description}
        </p>

        {/* Unboxed Metadata Rail (Zero-Pill Compliance) */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-400 mb-8 border-y border-zinc-800/80 py-3">
          <span className="flex items-center gap-1.5 text-zinc-200">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <strong className="font-semibold text-white">{project.stars.toLocaleString()}</strong> stars
          </span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span className="flex items-center gap-1.5 text-zinc-200">
            <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
            <strong className="font-semibold text-white">{project.pullRequests?.length || 0}</strong> active PRs
          </span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span className="flex items-center gap-1.5 text-zinc-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <strong className="font-semibold text-white">{project.openIssuesCount}</strong> open issues
          </span>
          <span aria-hidden="true" className="text-zinc-700">·</span>
          <span className="text-zinc-400">
            Last sync {project.lastSyncedAt ? new Date(project.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSync(project)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-[#e50914] hover:bg-[#b81d24] text-white shadow-xl shadow-red-950/50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync via API'}</span>
          </button>

          {/* 1-Click Instant Notion Export Button (Bypasses API token requirement) */}
          <button
            onClick={async () => {
              const { copyToNotionClipboard } = await import('../services/notionClipboard');
              await copyToNotionClipboard(project);
              setCopiedNotice(true);
              setTimeout(() => setCopiedNotice(false), 3000);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
            title="Скопировать страницу и вставить в Notion (Ctrl + V)"
          >
            {copiedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : <ClipboardCopy className="w-4 h-4 text-black" />}
            <span>{copiedNotice ? 'Скопировано! Вставьте в Notion (Ctrl+V)' : 'Вставить в Notion (1 клик)'}</span>
          </button>

          <button
            onClick={() => onPreviewNotion(project)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/15 text-white backdrop-blur-sm border border-white/10 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-zinc-300" />
            <span>Preview Notion Page</span>
          </button>

          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Latest Commit Ticker Banner */}
        {latestCommit && (
          <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center gap-3 text-xs text-zinc-400">
            <GitCommit className="w-3.5 h-3.5 text-[#e50914] shrink-0" />
            <span className="font-mono text-zinc-300 shrink-0">{latestCommit.sha}</span>
            <span className="truncate text-zinc-300">{latestCommit.message}</span>
            <span className="hidden sm:inline text-zinc-500 shrink-0">by {latestCommit.author}</span>
          </div>
        )}
      </div>
    </div>
  );
};

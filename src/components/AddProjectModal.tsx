import React, { useState } from 'react';
import { X, Search, GitBranch, Star, AlertCircle, Check, Loader2, ArrowRight } from 'lucide-react';
import { GitHubProject } from '../types';
import { fetchGitHubRepo } from '../services/api';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: GitHubProject, autoSync: boolean) => void;
  githubToken?: string;
}

const PRESET_REPOS = [
  { slug: 'vercel/next.js', label: 'Next.js' },
  { slug: 'facebook/react', label: 'React' },
  { slug: 'tailwindlabs/tailwindcss', label: 'Tailwind CSS' },
  { slug: 'astral-sh/uv', label: 'uv' },
  { slug: 'torvalds/linux', label: 'Linux Kernel' },
  { slug: 'denoland/deno', label: 'Deno' },
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  githubToken,
}) => {
  const [repoInput, setRepoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<GitHubProject | null>(null);
  const [autoSync, setAutoSync] = useState(true);

  if (!isOpen) return null;

  const handleFetch = async (targetSlug?: string) => {
    const slug = targetSlug || repoInput.trim();
    if (!slug) {
      setError('Please provide a GitHub repository slug or URL (e.g., "owner/repo").');
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewProject(null);

    try {
      const project = await fetchGitHubRepo(slug, githubToken);
      setPreviewProject(project);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch GitHub repository. Verify repository name and permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!previewProject) return;
    onAddProject(previewProject, autoSync);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#141417] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Track GitHub Repository
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Connect any public or private repository for autonomous Notion synchronization.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input & Fetch Bar */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Repository Slug or GitHub URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. facebook/react or https://github.com/..."
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                className="flex-1 bg-[#1a1a1e] border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e50914] font-mono"
              />
              <button
                onClick={() => handleFetch()}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#e50914] hover:bg-[#b81d24] text-white disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Fetch</span>
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="text-[11px] text-zinc-500 block mb-1.5">Quick picks:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REPOS.map((preset) => (
                <button
                  key={preset.slug}
                  onClick={() => {
                    setRepoInput(preset.slug);
                    handleFetch(preset.slug);
                  }}
                  className="px-2.5 py-1 text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700/60 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Card */}
          {previewProject && (
            <div className="bg-[#1a1a1f] border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">
                  {previewProject.fullName}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  [{previewProject.defaultBranch}]
                </span>
              </div>

              <p className="text-xs text-zinc-300 line-clamp-2">
                {previewProject.description}
              </p>

              {/* Zero-Pill text metadata */}
              <div className="flex items-center gap-3 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
                <span className="text-amber-400 font-semibold">
                  ⭐ {previewProject.stars.toLocaleString()}
                </span>
                <span aria-hidden="true" className="text-zinc-700">·</span>
                <span>{previewProject.primaryLanguage}</span>
                <span aria-hidden="true" className="text-zinc-700">·</span>
                <span>{previewProject.openIssuesCount} issues</span>
                <span aria-hidden="true" className="text-zinc-700">·</span>
                <span>{previewProject.commits?.length || 0} commits</span>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="accent-[#e50914] rounded"
                  />
                  <span>Trigger immediate initial Notion synchronization upon adding</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAdd}
            disabled={!previewProject}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-[#e50914] hover:bg-[#b81d24] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Add Project to Nora</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, Copy, Check, Code, FileText, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { GitHubProject } from '../types';

interface NotionPagePreviewModalProps {
  project: GitHubProject;
  onClose: () => void;
  onSync: (project: GitHubProject) => void;
  isSyncing: boolean;
  notionConnected: boolean;
}

export const NotionPagePreviewModal: React.FC<NotionPagePreviewModalProps> = ({
  project,
  onClose,
  onSync,
  isSyncing,
  notionConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'blocks' | 'markdown'>('visual');
  const [copied, setCopied] = useState(false);
  const [openToggles, setOpenToggles] = useState<Record<string, boolean>>({
    commits: true,
    prs: true,
    issues: false,
    stack: true,
    readme: false,
  });

  const toggleSection = (key: string) => {
    setOpenToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyPayload = () => {
    let content = '';
    if (activeTab === 'markdown') {
      content = `# 📦 ${project.name} — Project Hub\n\n> ⚡ Nora Synchronization Hub · Mirrored from ${project.url}\n\n## Overview\n${project.description}\n\n## Recent Commits\n${project.commits.map((c) => `- \`${c.sha}\` ${c.message} (${c.author})`).join('\n')}\n\n## Active Pull Requests\n${project.pullRequests.map((pr) => `- #${pr.number} ${pr.title} [${pr.state}] by @${pr.author}`).join('\n')}`;
    } else {
      content = JSON.stringify(project, null, 2);
    }
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#19191d] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-[#121215]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <span className="font-bold text-white text-sm">
                {project.name} · Notion Page Preview
              </span>
            </div>
            {/* Zero-pill clean text metadata */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span aria-hidden="true">·</span>
              <span className="font-mono">{project.fullName}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Notion 2022-06-28 Compliant</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  activeTab === 'visual' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Visual Page
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  activeTab === 'markdown' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Markdown
              </button>
              <button
                onClick={() => setActiveTab('blocks')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  activeTab === 'blocks' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                JSON Blocks
              </button>
            </div>

            <button
              onClick={copyPayload}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Copy page payload"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Workspace Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'visual' ? (
            /* Authentic Notion-Style Workspace Page Layout */
            <div className="bg-[#1f1f23] text-zinc-200 min-h-full pb-16 font-sans">
              {/* Cover Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-zinc-800">
                <img
                  src={
                    project.coverImage ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80'
                  }
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Page Container */}
              <div className="max-w-3xl mx-auto px-8 relative -mt-9">
                {/* Page Icon */}
                <div className="w-16 h-16 rounded-xl bg-[#27272d] border-2 border-[#1f1f23] flex items-center justify-center text-3xl shadow-lg mb-4">
                  📦
                </div>

                {/* Notion Page Title */}
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                  {project.name} · Project Hub
                </h1>

                {/* Notion Properties Grid */}
                <div className="bg-[#18181c] border border-zinc-800 rounded-lg p-4 mb-6 space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500 font-medium">Status</span>
                    <span className="col-span-2 text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Synced by Nora
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500 font-medium">GitHub Repository</span>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 text-sky-400 hover:underline flex items-center gap-1"
                    >
                      {project.fullName}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500 font-medium">Primary Stack</span>
                    <span className="col-span-2 text-zinc-300 font-mono">
                      {project.primaryLanguage} · Branch [{project.defaultBranch}]
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <span className="text-zinc-500 font-medium">Telemetry</span>
                    <span className="col-span-2 text-zinc-400">
                      ⭐ {project.stars.toLocaleString()} stars · {project.commits?.length || 0} recent commits · {project.openIssuesCount} issues
                    </span>
                  </div>
                </div>

                {/* Nora Callout Block */}
                <div className="bg-[#24242a] border-l-4 border-[#e50914] rounded-r-lg p-4 mb-6 text-xs text-zinc-300 flex items-start gap-3">
                  <span className="text-base">⚡</span>
                  <div>
                    <p className="font-semibold text-white mb-1">
                      Nora Synchronization Hub
                    </p>
                    <p className="text-zinc-400 leading-relaxed">
                      Continuous telemetry mirrored from <strong className="text-white">{project.fullName}</strong>.
                      All pull requests, issues, releases, and architectural documentation are synchronized in real-time.
                    </p>
                  </div>
                </div>

                {/* Executive Synopsis Quote Block */}
                {project.synopsis && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Executive Project Synopsis
                    </h3>
                    <div className="border-l-2 border-red-500/60 pl-4 py-1 text-xs text-zinc-300 italic leading-relaxed bg-red-950/10 rounded-r">
                      "{project.synopsis}"
                    </div>
                  </div>
                )}

                {/* Toggle Block: Recent Commits & Changelog */}
                <div className="border-t border-zinc-800/80 pt-4 mb-4">
                  <button
                    onClick={() => toggleSection('commits')}
                    className="flex items-center gap-2 text-sm font-bold text-white hover:text-zinc-300 transition-colors w-full text-left"
                  >
                    {openToggles.commits ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    )}
                    <span>Recent Commits & Changelog ({project.commits?.length || 0})</span>
                  </button>

                  {openToggles.commits && (
                    <div className="mt-3 pl-6 space-y-2 text-xs">
                      {project.commits?.map((commit) => (
                        <div key={commit.sha} className="flex items-baseline gap-2 py-1">
                          <code className="text-[#e50914] font-mono text-[11px] bg-red-950/30 px-1 py-0.5 rounded">
                            {commit.sha}
                          </code>
                          <span className="text-zinc-200">{commit.message}</span>
                          <span className="text-zinc-500 text-[11px]">
                            ({commit.author} · {new Date(commit.date).toLocaleDateString()})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toggle Block: Active Pull Requests */}
                <div className="border-t border-zinc-800/80 pt-4 mb-4">
                  <button
                    onClick={() => toggleSection('prs')}
                    className="flex items-center gap-2 text-sm font-bold text-white hover:text-zinc-300 transition-colors w-full text-left"
                  >
                    {openToggles.prs ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    )}
                    <span>Active Pull Requests ({project.pullRequests?.length || 0})</span>
                  </button>

                  {openToggles.prs && (
                    <div className="mt-3 pl-6 space-y-2 text-xs">
                      {project.pullRequests?.map((pr) => (
                        <div key={pr.number} className="flex items-center gap-2 py-1">
                          <span
                            className={`font-semibold text-xs ${
                              pr.merged ? 'text-purple-400' : pr.state === 'open' ? 'text-emerald-400' : 'text-zinc-400'
                            }`}
                          >
                            #{pr.number}
                          </span>
                          <span className="text-zinc-200">{pr.title}</span>
                          <span className="text-zinc-500 text-[11px]">by @{pr.author}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toggle Block: Open Issues Backlog */}
                <div className="border-t border-zinc-800/80 pt-4 mb-4">
                  <button
                    onClick={() => toggleSection('issues')}
                    className="flex items-center gap-2 text-sm font-bold text-white hover:text-zinc-300 transition-colors w-full text-left"
                  >
                    {openToggles.issues ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    )}
                    <span>Open Issues Backlog ({project.issues?.length || 0})</span>
                  </button>

                  {openToggles.issues && (
                    <div className="mt-3 pl-6 space-y-2 text-xs">
                      {project.issues?.map((iss) => (
                        <div key={iss.number} className="flex items-center gap-2 py-1">
                          <span className="text-rose-400 font-semibold text-xs">#{iss.number}</span>
                          <span className="text-zinc-200">{iss.title}</span>
                          <span className="text-zinc-500 text-[11px]">({iss.commentsCount} comments)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toggle Block: Tech Stack Distribution */}
                <div className="border-t border-zinc-800/80 pt-4 mb-4">
                  <button
                    onClick={() => toggleSection('stack')}
                    className="flex items-center gap-2 text-sm font-bold text-white hover:text-zinc-300 transition-colors w-full text-left"
                  >
                    {openToggles.stack ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    )}
                    <span>Tech Stack & Language Breakdown</span>
                  </button>

                  {openToggles.stack && (
                    <div className="mt-3 pl-6 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {Object.entries(project.languages || {}).map(([lang, bytes]) => (
                        <div key={lang} className="bg-[#18181c] p-2.5 rounded border border-zinc-800 flex items-center justify-between">
                          <span className="font-semibold text-zinc-200">{lang}</span>
                          <span className="text-zinc-500 font-mono text-[11px]">
                            {Math.round((bytes as number) / 1024)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'markdown' ? (
            <div className="p-6 bg-[#141417]">
              <pre className="font-mono text-xs text-zinc-300 bg-zinc-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-800">
                {`# 📦 ${project.name} · Project Hub

> ⚡ **Nora Synchronization Hub** · Auto-mirrored from [${project.fullName}](${project.url})
> Synced: ${new Date().toISOString()} · Default Branch: [${project.defaultBranch}] · Stars: ⭐ ${project.stars.toLocaleString()}

## Executive Synopsis
${project.synopsis || project.description}

## Health & Metrics
- **Primary Stack**: ${project.primaryLanguage}
- **Open Issues**: ${project.openIssuesCount}
- **License**: ${project.license}

## Recent Commits (${project.commits?.length || 0})
${project.commits?.map((c) => `- \`${c.sha}\` ${c.message} *(by ${c.author})*`).join('\n')}

## Active Pull Requests (${project.pullRequests?.length || 0})
${project.pullRequests?.map((pr) => `- #${pr.number} ${pr.title} [${pr.state.toUpperCase()}] by @${pr.author}`).join('\n')}

## Documentation Excerpt
${project.readme?.slice(0, 500) || 'No readme available.'}`}
              </pre>
            </div>
          ) : (
            <div className="p-6 bg-[#141417]">
              <pre className="font-mono text-xs text-emerald-400 bg-zinc-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-800">
                {JSON.stringify(
                  {
                    object: 'page',
                    parent: { type: 'page_id', page_id: 'notion_workspace_root' },
                    properties: {
                      title: { title: [{ text: { content: `${project.name} · Project Hub` } }] },
                    },
                    blocks_count: 24,
                    sample_blocks: [
                      {
                        type: 'callout',
                        callout: { icon: { emoji: '⚡' }, rich_text: [{ text: { content: 'Nora Sync Notice' } }] },
                      },
                      {
                        type: 'heading_2',
                        heading_2: { rich_text: [{ text: { content: 'Executive Project Synopsis' } }] },
                      },
                      {
                        type: 'toggle',
                        toggle: { rich_text: [{ text: { content: 'Recent Commits & Changelog' } }] },
                      },
                    ],
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#121215] border-t border-zinc-800">
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <span>Target:</span>
            <span className="font-mono text-zinc-300">
              {notionConnected ? 'Live Notion API' : 'High-fidelity Notion Document Sandbox'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={async () => {
                const { copyToNotionClipboard } = await import('../services/notionClipboard');
                await copyToNotionClipboard(project);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
              title="Скопировать страницу со всеми блоками и вставить в Notion через Ctrl+V"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-black" />}
              <span>{copied ? 'Скопировано! Вставьте в Notion (Ctrl+V)' : 'Вставить в Notion в 1 клик (без API)'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => onSync(project)}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#e50914] hover:bg-[#b81d24] text-white transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync через API'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

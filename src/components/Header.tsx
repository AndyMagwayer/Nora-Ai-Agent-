import React from 'react';
import { RefreshCw, Plus, Settings, FileText, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { NoraSettings } from '../types';

interface HeaderProps {
  settings: NoraSettings;
  onOpenSettings: () => void;
  onOpenAddProject: () => void;
  onOpenReports: () => void;
  onSyncAll: () => void;
  isSyncingAll: boolean;
  totalProjects: number;
  syncedCount: number;
  reportCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenAddProject,
  onOpenReports,
  onSyncAll,
  isSyncingAll,
  totalProjects,
  syncedCount,
  reportCount,
}) => {
  const isNotionConnected = Boolean(settings.notionToken && settings.notionParentPageId);

  return (
    <header className="sticky top-0 z-40 bg-[#0b0b0d]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center shadow-lg shadow-red-900/30 font-black text-white text-lg tracking-wider">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">NORA</span>
                <span className="text-xs text-zinc-500 font-mono hidden sm:inline">v2.4</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
                GitHub → Notion Project Sync
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (Zero-pill text separators) */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-zinc-400 border-l border-zinc-800 pl-6">
            <span>{totalProjects} Repositories Tracked</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {syncedCount} in Sync
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono">Cadence: {settings.autoSyncCadence}</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          {/* Notion Status Kicker */}
          <button
            onClick={onOpenSettings}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isNotionConnected
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            title="Configure Notion integration"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isNotionConnected ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span>{isNotionConnected ? 'Notion Connected' : 'Notion Sandbox'}</span>
          </button>

          {/* Execution Reports Button */}
          <button
            onClick={onOpenReports}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title="View Execution Reports & Logs"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Reports</span>
            {reportCount > 0 && (
              <span className="bg-zinc-800 text-zinc-300 text-[10px] font-mono px-1.5 py-0.2 rounded">
                {reportCount}
              </span>
            )}
          </button>

          {/* Add Project */}
          <button
            onClick={onOpenAddProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/80 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">Add Repo</span>
          </button>

          {/* Primary Action: Sync All Projects (Netflix Red) */}
          <button
            onClick={onSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#e50914] hover:bg-[#b81d24] text-white shadow-md shadow-red-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync All'}</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
            title="Nora Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Activity, CheckCircle2, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { SyncTask } from '../types';

interface ActiveTasksRailProps {
  tasks: SyncTask[];
  onRetryTask?: (task: SyncTask) => void;
  onClearCompleted?: () => void;
}

export const ActiveTasksRail: React.FC<ActiveTasksRailProps> = ({
  tasks,
  onRetryTask,
  onClearCompleted,
}) => {
  if (tasks.length === 0) {
    return null;
  }

  const activeCount = tasks.filter((t) => t.status === 'syncing' || t.status === 'queued').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <section className="mb-8 bg-[#121215] border border-zinc-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e50914] animate-pulse" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Active Tasks & Synchronization Pipelines
          </h2>
          {/* Zero-pill metadata */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span aria-hidden="true">·</span>
            <span>{activeCount} running</span>
            <span aria-hidden="true">·</span>
            <span>{completedCount} finished</span>
          </div>
        </div>

        {completedCount > 0 && onClearCompleted && (
          <button
            onClick={onClearCompleted}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear finished
          </button>
        )}
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const isSyncing = task.status === 'syncing';
          const isFailed = task.status === 'failed';
          const isCompleted = task.status === 'completed';

          return (
            <div
              key={task.id}
              className="bg-[#18181c] border border-zinc-800/90 rounded-lg p-3.5 transition-all hover:border-zinc-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 text-[#e50914] animate-spin shrink-0" />
                  ) : isFailed ? (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-white text-sm">
                      {task.projectFullName}
                    </span>
                    <span className="text-zinc-500 text-xs ml-2 font-mono">
                      → Notion Hub
                    </span>
                  </div>
                </div>

                {/* Status & Timing (Zero-Pill clean typography) */}
                <div className="flex items-center gap-3 text-xs">
                  <span
                    className={`font-semibold ${
                      isSyncing
                        ? 'text-sky-400'
                        : isFailed
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {isSyncing ? 'SYNCHRONIZING' : isFailed ? 'SYNC FAILED' : 'COMPLETED'}
                  </span>
                  <span aria-hidden="true" className="text-zinc-700">·</span>
                  <span className="text-zinc-400 font-mono">
                    {task.durationMs ? `${task.durationMs}ms` : 'In flight'}
                  </span>
                  {isFailed && onRetryTask && (
                    <button
                      onClick={() => onRetryTask(task)}
                      className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isFailed
                      ? 'bg-rose-500'
                      : isCompleted
                      ? 'bg-emerald-400'
                      : 'bg-gradient-to-r from-red-600 to-[#e50914]'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>

              {/* Current Step */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono text-zinc-300 truncate">
                  Stage: {task.currentStep}
                </span>
                <span className="font-mono text-zinc-500 shrink-0 ml-2">
                  {task.progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

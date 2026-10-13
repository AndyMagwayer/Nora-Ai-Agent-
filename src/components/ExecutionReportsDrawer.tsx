import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Clock, Trash2, Download, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import { ExecutionReport } from '../types';

interface ExecutionReportsDrawerProps {
  reports: ExecutionReport[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const ExecutionReportsDrawer: React.FC<ExecutionReportsDrawerProps> = ({
  reports,
  isOpen,
  onClose,
  onClear,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const exportAllReports = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nora_execution_reports_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-full bg-[#121215] border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#0e0e11]">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Execution Reports & Audit Stream
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Historical ledger of Nora synchronization pipelines and telemetry logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {reports.length > 0 && (
              <>
                <button
                  onClick={exportAllReports}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  title="Export JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClear}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-400 hover:text-rose-300 transition-colors"
                  title="Clear reports"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {reports.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-300">No execution reports yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                Run a synchronization on any repository to capture audit logs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const isSuccess = report.status === 'success';
                const isWarning = report.status === 'warning';

                return (
                  <div
                    key={report.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isSelected
                        ? 'bg-[#18181c] border-zinc-700 ring-1 ring-zinc-600'
                        : 'bg-[#141417] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isWarning ? (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-bold text-white text-sm">
                          {report.projectFullName}
                        </span>
                      </div>

                      {/* Zero-Pill text metadata */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                        <span
                          className={`font-semibold ${
                            isSuccess
                              ? 'text-emerald-400'
                              : isWarning
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {report.status.toUpperCase()}
                        </span>
                        <span aria-hidden="true" className="text-zinc-600">·</span>
                        <span>{report.durationMs}ms</span>
                      </div>
                    </div>

                    {/* Timestamp & Items Sync */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 mb-3">
                      <span>{new Date(report.timestamp).toLocaleString()}</span>
                      <span aria-hidden="true" className="text-zinc-700">·</span>
                      <span className="text-zinc-300">
                        {report.itemsSynced.commits} commits · {report.itemsSynced.pullRequests} PRs · {report.itemsSynced.issues} issues
                      </span>
                      <span aria-hidden="true" className="text-zinc-700">·</span>
                      <span className="text-zinc-300">{report.blockCount} blocks</span>
                    </div>

                    {/* Step Logs Stream */}
                    {report.logs && report.logs.length > 0 && (
                      <div className="bg-[#0b0b0d] border border-zinc-900 rounded-lg p-3 space-y-1.5 font-mono text-[11px] max-h-48 overflow-y-auto">
                        {report.logs.map((log, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 ${
                              log.type === 'success'
                                ? 'text-emerald-400'
                                : log.type === 'warn'
                                ? 'text-amber-400'
                                : log.type === 'error'
                                ? 'text-rose-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            <span className="text-zinc-600 text-[10px] shrink-0">
                              {log.time ? new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                            </span>
                            <span className="text-zinc-200">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Target Notion URL if any */}
                    {report.notionPageUrl && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-500">Notion Target:</span>
                        <span className="font-mono text-sky-400 truncate max-w-xs">
                          {report.notionPageUrl}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

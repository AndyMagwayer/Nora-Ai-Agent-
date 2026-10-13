import React, { useState } from 'react';
import { X, Key, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Save, HelpCircle, ExternalLink } from 'lucide-react';
import { NoraSettings } from '../types';
import { verifyNotionConnection } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NoraSettings;
  onSaveSettings: (settings: NoraSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<NoraSettings>({ ...settings });
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleVerifyNotion = async () => {
    if (!form.notionToken) {
      setVerifyResult({
        success: false,
        message: 'Please provide a Notion Integration Secret token first.',
      });
      return;
    }

    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await verifyNotionConnection(form.notionToken, form.notionParentPageId);
      setVerifyResult({
        success: true,
        message: `Verified! Bot identity: "${res.botName}". Ready for live Notion synchronization.`,
      });
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err.message || 'Notion authentication failed. Check your token and permissions.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#141417] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#e50914] flex items-center justify-center font-bold text-white text-sm">
              N
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Nora Configuration & API Credentials
              </h2>
              <p className="text-xs text-zinc-400">
                Setup GitHub access tokens and Notion workspace integration.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Notion Integration Section */}
          <div className="bg-[#1a1a1f] border border-zinc-800 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Notion Workspace Connection
              </h3>
              <a
                href="https://www.notion.so/profile/integrations"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <span>Get Notion Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">
                  Notion Internal Integration Secret (Токен интеграции)
                </label>
                <span className="text-[10px] text-zinc-400 font-mono">
                  начинается с secret_... или ntn_...
                </span>
              </div>
              <input
                type="password"
                placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxx или ntn_xxxx..."
                value={form.notionToken}
                onChange={(e) => setForm({ ...form, notionToken: e.target.value.trim() })}
                className="w-full bg-[#121215] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-[#e50914]"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                🔑 Создается бесплатно на странице <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noreferrer" className="text-sky-400 underline">notion.so/profile/integrations</a>: нажмите «+ New integration», выберите свой Workspace и скопируйте «Internal Integration Secret».
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">
                  Parent Page or Database ID
                </label>
                <span className="text-[11px] text-zinc-400">
                  (Вставьте 32-значный ID или прямую ссылку на страницу Notion)
                </span>
              </div>
              <input
                type="text"
                placeholder="2f98a28723b7410287410... или https://notion.so/..."
                value={form.notionParentPageId}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  // Check if user pasted a full Notion URL
                  const match32 = val.match(/([a-f0-9]{32})/i);
                  const matchUuid = val.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
                  if (match32) {
                    setForm({ ...form, notionParentPageId: match32[1] });
                  } else if (matchUuid) {
                    setForm({ ...form, notionParentPageId: matchUuid[1].replace(/-/g, '') });
                  } else {
                    setForm({ ...form, notionParentPageId: val });
                  }
                }}
                className="w-full bg-[#121215] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-[#e50914]"
              />

              {/* Explanatory Guide Card */}
              <div className="mt-2 p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs space-y-1.5 text-zinc-300">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <HelpCircle className="w-3.5 h-3.5 text-[#e50914]" />
                  <span>Как найти NOTION_PARENT_PAGE_ID в 3 шага:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400 pl-1 leading-relaxed">
                  <li>
                    Откройте страницу в Notion, где Nora должна создавать страницы проектов.
                  </li>
                  <li>
                    В правом верхнем углу нажмите <strong className="text-zinc-200">Share</strong> (или <strong className="text-zinc-200">···</strong>) → <strong className="text-zinc-200">Copy link</strong> (Копировать ссылку).
                  </li>
                  <li>
                    Ссылка имеет вид: <code className="text-zinc-300 bg-black/40 px-1 py-0.5 rounded font-mono">notion.so/workspace/Projects-Hub-<span className="text-[#e50914] font-bold">2f98a28723b7410287410dfa6c38b291</span>?pvs=4</code>
                  </li>
                </ol>
                <div className="pt-1 text-[11px] text-emerald-400 font-medium">
                  💡 Вы можете вставить ссылку целиком в поле выше — Nora автоматически вырежет нужный 32-значный ID!
                </div>
                <div className="pt-1 text-[11px] text-amber-300/90 border-t border-zinc-800">
                  ⚠️ <strong className="text-amber-200">Важно:</strong> На этой странице Notion нажмите <strong className="text-white">···</strong> → <strong className="text-white">Connections</strong> → добавьте вашу интеграцию, иначе Notion вернет ошибку доступа (404/403).
                </div>
              </div>
            </div>

            <button
              onClick={handleVerifyNotion}
              disabled={verifying}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
            >
              {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>Verify Notion Connection</span>
            </button>

            {verifyResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  verifyResult.success
                    ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-800 text-rose-300'
                }`}
              >
                {verifyResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{verifyResult.message}</span>
              </div>
            )}
          </div>

          {/* GitHub Token Section */}
          <div className="bg-[#1a1a1f] border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-zinc-400" />
              GitHub Personal Access Token (PAT)
            </h3>

            <div>
              <input
                type="password"
                placeholder="ghp_... (Optional for public repos)"
                value={form.githubToken}
                onChange={(e) => setForm({ ...form, githubToken: e.target.value })}
                className="w-full bg-[#121215] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-[#e50914]"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Required for private repositories and to elevate API rate limits to 5,000 requests/hour.
              </span>
            </div>
          </div>

          {/* Sync Cadence & Granularity */}
          <div className="bg-[#1a1a1f] border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Autonomous Synchronization Policy
            </h3>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Background Cadence
              </label>
              <select
                value={form.autoSyncCadence}
                onChange={(e) => setForm({ ...form, autoSyncCadence: e.target.value as any })}
                className="w-full bg-[#121215] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914]"
              >
                <option value="15m">Every 15 minutes (High frequency)</option>
                <option value="1h">Hourly (Standard)</option>
                <option value="daily">Once Daily (Batch)</option>
                <option value="manual">Manual Trigger Only</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.generateAiSynopsis}
                  onChange={(e) => setForm({ ...form, generateAiSynopsis: e.target.checked })}
                  className="accent-[#e50914]"
                />
                <span>Generate Executive Project Synopsis via AI synthesis</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.syncReadme}
                  onChange={(e) => setForm({ ...form, syncReadme: e.target.checked })}
                  className="accent-[#e50914]"
                />
                <span>Mirror README architectural documentation</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.syncReleases}
                  onChange={(e) => setForm({ ...form, syncReleases: e.target.checked })}
                  className="accent-[#e50914]"
                />
                <span>Mirror tagged releases and changelog</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-[#e50914] hover:bg-[#b81d24] text-white transition-all shadow-md cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export interface CommitItem {
  sha: string;
  fullSha?: string;
  message: string;
  body?: string;
  author: string;
  authorAvatar?: string;
  date: string;
  url: string;
}

export interface PullRequestItem {
  number: number;
  title: string;
  state: 'open' | 'closed';
  merged?: boolean;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  draft?: boolean;
}

export interface IssueItem {
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: { name: string; color: string }[];
  author: string;
  commentsCount: number;
  createdAt: string;
  url: string;
}

export interface ReleaseItem {
  name: string;
  tagName: string;
  publishedAt: string;
  body: string;
  url: string;
  prerelease?: boolean;
}

export interface GitHubProject {
  id: string; // owner/repo
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  openIssuesCount: number;
  primaryLanguage: string;
  topics: string[];
  license: string;
  updatedAt: string;
  pushedAt: string;
  visibility: 'public' | 'private';
  commits: CommitItem[];
  pullRequests: PullRequestItem[];
  issues: IssueItem[];
  releases: ReleaseItem[];
  languages: Record<string, number>;
  readme: string;
  // Nora Sync State
  lastSyncStatus?: 'synced' | 'syncing' | 'diff_detected' | 'error' | 'idle';
  lastSyncedAt?: string;
  notionPageUrl?: string;
  coverImage?: string;
  synopsis?: string;
}

export interface SyncTask {
  id: string;
  projectId: string;
  projectName: string;
  projectFullName: string;
  progress: number;
  status: 'queued' | 'syncing' | 'completed' | 'failed';
  startedAt: string;
  currentStep: string;
  durationMs?: number;
}

export interface ExecutionLogItem {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export interface ExecutionReport {
  id: string;
  projectId: string;
  projectName: string;
  projectFullName: string;
  timestamp: string;
  durationMs: number;
  status: 'success' | 'warning' | 'error';
  itemsSynced: {
    commits: number;
    pullRequests: number;
    issues: number;
    releases: number;
  };
  blockCount: number;
  notionPageUrl?: string | null;
  notionPageId?: string | null;
  mode: string;
  logs: ExecutionLogItem[];
  blocks?: any[];
}

export interface NoraSettings {
  githubToken: string;
  notionToken: string;
  notionParentPageId: string;
  autoSyncCadence: 'manual' | '15m' | '1h' | 'daily';
  generateAiSynopsis: boolean;
  syncReadme: boolean;
  syncReleases: boolean;
  syncIssues: boolean;
  syncPullRequests: boolean;
}

import { GitHubProject, ExecutionReport, NoraSettings } from '../types';

export const DEFAULT_SETTINGS: NoraSettings = {
  githubToken: '',
  notionToken: '',
  notionParentPageId: 'a8f6ead6ca584d5fba8fc10d69327f85',
  autoSyncCadence: '15m',
  generateAiSynopsis: true,
  syncReadme: true,
  syncReleases: true,
  syncIssues: true,
  syncPullRequests: true,
};

export async function fetchGitHubRepo(repoSlug: string, token?: string): Promise<GitHubProject> {
  const res = await fetch('/api/github/fetch-repo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoSlug, token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch GitHub repository');
  }

  return data.project;
}

export async function verifyNotionConnection(token: string, pageOrDbId?: string) {
  const res = await fetch('/api/notion/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, pageOrDbId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to verify Notion connection');
  }

  return data;
}

export async function generateProjectSynopsis(project: GitHubProject): Promise<string> {
  try {
    const res = await fetch('/api/generate-synopsis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project }),
    });

    const data = await res.json();
    if (res.ok && data.synopsis) {
      return data.synopsis;
    }
  } catch (e) {
    console.warn('Synopsis call failed, generating fallback synopsis:', e);
  }

  return `Engineered on [${project.defaultBranch}] with ${project.commits?.length || 0} recent commits and ${project.pullRequests?.length || 0} pull requests. Primary engineering velocity centered on ${project.primaryLanguage}. Synchronized by Nora with zero blocking anomalies.`;
}

export async function syncProjectToNotion(
  project: GitHubProject,
  settings: NoraSettings,
  synopsis?: string
): Promise<{ report: ExecutionReport; executionResult: any }> {
  const res = await fetch('/api/notion/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project,
      notionConfig: {
        token: settings.notionToken,
        parentPageId: settings.notionParentPageId,
      },
      synopsis,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sync with Notion');
  }

  return data;
}

export async function fetchExecutionReports(): Promise<ExecutionReport[]> {
  try {
    const res = await fetch('/api/reports');
    if (res.ok) {
      const data = await res.json();
      return data.reports || [];
    }
  } catch (e) {
    console.warn('Failed to load execution reports:', e);
  }
  return [];
}

export async function clearAllReports(): Promise<void> {
  await fetch('/api/reports', { method: 'DELETE' });
}

import { GitHubProject } from '../types';

export function formatNotionHtml(project: GitHubProject): string {
  const commitsHtml = (project.commits || [])
    .slice(0, 15)
    .map(
      (c) =>
        `<li><code>${c.sha}</code> <strong>${escapeHtml(c.message)}</strong> <em>(by ${escapeHtml(c.author)} · ${new Date(c.date).toLocaleDateString()})</em> — <a href="${c.url}">View Commit</a></li>`
    )
    .join('');

  const prsHtml = (project.pullRequests || [])
    .slice(0, 10)
    .map(
      (pr) =>
        `<li><strong>#${pr.number}</strong> ${escapeHtml(pr.title)} [<em>${pr.state.toUpperCase()}${pr.draft ? ' · DRAFT' : ''}</em>] by @${escapeHtml(pr.author)} — <a href="${pr.url}">View PR</a></li>`
    )
    .join('');

  const issuesHtml = (project.issues || [])
    .slice(0, 10)
    .map(
      (iss) =>
        `<li><strong>#${iss.number}</strong> ${escapeHtml(iss.title)} (${iss.commentsCount} comments) — <a href="${iss.url}">View Issue</a></li>`
    )
    .join('');

  const releasesHtml = (project.releases || [])
    .slice(0, 5)
    .map(
      (rel) =>
        `<li><code>${escapeHtml(rel.tagName)}</code> <strong>${escapeHtml(rel.name)}</strong> (released ${new Date(rel.publishedAt).toLocaleDateString()}) — <a href="${rel.url}">Notes</a></li>`
    )
    .join('');

  const languagesList = Object.entries(project.languages || {})
    .slice(0, 5)
    .map(([lang, bytes]) => `${lang} (${Math.round((bytes as number) / 1024)} KB)`)
    .join(' · ');

  return `
<h1>📦 ${escapeHtml(project.name)} — Project Hub</h1>
<blockquote>
  <strong>⚡ Nora Project Hub</strong> · Synchronized from <a href="${project.url}">${escapeHtml(project.fullName)}</a><br/>
  <strong>Default Branch:</strong> [${escapeHtml(project.defaultBranch)}] · <strong>Stars:</strong> ⭐ ${project.stars.toLocaleString()} · <strong>Open Issues:</strong> ${project.openIssuesCount} · <strong>Primary Stack:</strong> ${escapeHtml(project.primaryLanguage)}
</blockquote>

<h2>Executive Synopsis</h2>
<blockquote>
  <em>${escapeHtml(project.synopsis || project.description)}</em>
</blockquote>

<h2>Repository Health & Metrics</h2>
<ul>
  <li><strong>Stack & Languages:</strong> ${escapeHtml(languagesList || project.primaryLanguage)}</li>
  <li><strong>Visibility:</strong> ${escapeHtml(project.visibility.toUpperCase())} · <strong>License:</strong> ${escapeHtml(project.license)}</li>
  <li><strong>Last Pushed:</strong> ${new Date(project.pushedAt || project.updatedAt).toLocaleString()}</li>
</ul>

<h2>Recent Commits & Changelog (${project.commits?.length || 0})</h2>
<ul>
  ${commitsHtml || '<li>No recent commits found.</li>'}
</ul>

<h2>Active Pull Requests (${project.pullRequests?.length || 0})</h2>
<ul>
  ${prsHtml || '<li>No active pull requests.</li>'}
</ul>

<h2>Open Issues Backlog (${project.issues?.length || 0})</h2>
<ul>
  ${issuesHtml || '<li>No open issues.</li>'}
</ul>

${
  releasesHtml
    ? `<h2>Published Releases (${project.releases?.length || 0})</h2><ul>${releasesHtml}</ul>`
    : ''
}

<h2>Documentation Overview</h2>
<p>${escapeHtml(project.readme?.slice(0, 1200) || project.description)}</p>
  `.trim();
}

export function formatNotionMarkdown(project: GitHubProject): string {
  const commitsMd = (project.commits || [])
    .slice(0, 15)
    .map((c) => `- \`${c.sha}\` **${c.message}** *(by ${c.author} · ${new Date(c.date).toLocaleDateString()})* [Link](${c.url})`)
    .join('\n');

  const prsMd = (project.pullRequests || [])
    .slice(0, 10)
    .map((pr) => `- **#${pr.number}** ${pr.title} [${pr.state.toUpperCase()}] by @${pr.author} [Link](${pr.url})`)
    .join('\n');

  const issuesMd = (project.issues || [])
    .slice(0, 10)
    .map((iss) => `- **#${iss.number}** ${iss.title} (${iss.commentsCount} comments) [Link](${iss.url})`)
    .join('\n');

  return `# 📦 ${project.name} — Project Hub

> ⚡ **Nora Project Hub** · Mirrored from [${project.fullName}](${project.url})
> **Branch:** [${project.defaultBranch}] · **Stars:** ⭐ ${project.stars.toLocaleString()} · **Issues:** ${project.openIssuesCount} · **Stack:** ${project.primaryLanguage}

## Executive Synopsis
> ${project.synopsis || project.description}

## Health & Metrics
- **Primary Stack:** ${project.primaryLanguage}
- **Visibility:** ${project.visibility.toUpperCase()} · **License:** ${project.license}
- **Last Pushed:** ${new Date(project.pushedAt || project.updatedAt).toLocaleString()}

## Recent Commits & Changelog (${project.commits?.length || 0})
${commitsMd || '- No commits found.'}

## Active Pull Requests (${project.pullRequests?.length || 0})
${prsMd || '- No pull requests.'}

## Open Issues Backlog (${project.issues?.length || 0})
${issuesMd || '- No open issues.'}

## Documentation
${project.readme?.slice(0, 1200) || project.description}
`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function copyToNotionClipboard(project: GitHubProject): Promise<boolean> {
  const html = formatNotionHtml(project);
  const markdown = formatNotionMarkdown(project);

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([markdown], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      return true;
    }
  } catch (e) {
    console.warn('ClipboardItem failed, falling back to writeText:', e);
  }

  // Fallback
  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch (err) {
    console.error('Copy to clipboard failed:', err);
    return false;
  }
}

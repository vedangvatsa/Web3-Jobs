// Provider-managed queues cannot run an employer preflight at delivery time.
export function assertEvergreenContent(content) {
  const values = [];
  const visit = value => {
    if (typeof value === 'string') { values.push(value); return; }
    if (!value || typeof value !== 'object') return;
    if ((value.company && value.title && (value.link || value.date))
      || ['job', 'jobs', 'jobId', 'jobSlug', 'snapshot', 'applicationUrl', 'applyUrl'].some(key => key in value)
      || /^(?:job|job-opening|job-video)$/i.test(value.type || value.category || '')) throw new Error('Job announcements require the guarded job publisher; external scheduling is disabled');
    Object.values(value).forEach(visit);
  };
  visit(content);
  const text = values.join('\n');
  const jobText = /\bis hiring\b|\bwe(?:'|’)re hiring\b|\bjob opening\b|https?:\/\/(?:jobs\.lever\.co|(?:boards|job-boards)\.greenhouse\.io|jobs\.ashbyhq\.com)\//i.test(text);
  const specificSiteLink = [...text.matchAll(/(?:https?:\/\/)?(?:www\.)?hashtagweb3\.com\/([^\s"'<>?#]*)/gi)].some(([, pathname]) => {
    const first = pathname.split('/')[0];
    return first && !['x', 'li', 'th', 'bsky', 'fc', 'fb', 'ig', 'news', 'events', 'articles', 'learn', 'community', 'companies', 'nomads'].includes(first);
  });
  if (jobText || specificSiteLink) throw new Error('Job announcements require the guarded job publisher; external scheduling is disabled');
}

export function isEvergreenContent(content) {
  try { assertEvergreenContent(content); return true; }
  catch (error) { console.warn(`Skipped queued content: ${error.message}`); return false; }
}

export type AtsBoard = { provider: string; board: string; region?: 'eu' };

export function atsBoardKey(provider: string, board: string): string {
  let decoded = board;
  try { decoded = decodeURIComponent(board); } catch {}
  return `${provider.toLowerCase().replace(/^bamboo$/, 'bamboohr')}:${decoded.replace(/^eu:/i, '').trim().toLowerCase()}`;
}

export function getAtsBoardFromUrl(value?: string): AtsBoard | undefined {
  if (!value) return;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const region = /(?:^|\.)eu\./.test(host) ? 'eu' as const : undefined;
    let provider = '', board = '';
    if (host === 'jobs.ashbyhq.com') { provider = 'ashby'; board = segments[0]; }
    else if (host === 'api.ashbyhq.com' && segments[1] === 'job-board') { provider = 'ashby'; board = segments[2]; }
    else if (/^(?:jobs\.|api\.)?(?:eu\.)?lever\.co$/.test(host)) {
      provider = 'lever'; board = segments[0] === 'v0' ? segments[2] : segments[0];
    } else if (/^(?:boards|job-boards|boards-api|api)(?:\.eu)?\.greenhouse\.io$/.test(host)) {
      provider = 'greenhouse';
      board = segments[0] === 'embed' ? url.searchParams.get('for') || '' : segments[0] === 'v1' ? segments[2] : segments[0];
    } else if (host === 'apply.workable.com') {
      provider = 'workable'; board = segments[0] === 'j' ? '' : segments[0] === 'api' ? segments[segments.indexOf('accounts') + 1] : segments[0];
    } else if (/\.(bamboohr\.com|recruitee\.com|breezy\.hr|teamtailor\.com)$/.test(host)) {
      const parts = host.split('.');
      provider = parts[parts.length - 2] === 'breezy' ? 'breezy' : parts[parts.length - 2];
      board = parts.slice(0, -2).join('.');
    } else if (/^(?:jobs|careers|api)\.smartrecruiters\.com$/.test(host)) {
      provider = 'smartrecruiters'; board = segments[0] === 'v1' ? segments[2] : segments[0];
    } else if (host === 'ats.rippling.com') {
      provider = 'rippling'; board = segments[0] === 'api' ? segments[3] : segments[0];
    }
    if (provider && board) return { provider, board, ...(region && { region }) };
  } catch {}
}

export function getJobAtsBoards(job: { link?: string; applyUrl?: string; source?: string }): AtsBoard[] {
  const boards = [getAtsBoardFromUrl(job.link), getAtsBoardFromUrl(job.applyUrl)].filter((board): board is AtsBoard => !!board);
  const source = job.source || '';
  const match = source.match(/^([a-z]+):.*\[([^\]]+)\]\s*$/i) || source.match(/^([a-z]+):([^\s:]+)$/i);
  if (match) boards.push({ provider: match[1].toLowerCase(), board: match[2] });
  return [...new Map(boards.map(board => [atsBoardKey(board.provider, board.board), board])).values()];
}

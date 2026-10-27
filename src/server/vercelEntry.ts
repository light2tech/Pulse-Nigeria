import { createApiApp } from './apiApp';

const app = createApiApp({ mountAtRoot: true });

export default function handler(req: any, res: any) {
  try {
    const rawUrl = String(req?.url || '/');
    const parsed = new URL(rawUrl, 'http://localhost');

    const searchMulti =
      parsed.searchParams.getAll('__path').length > 0
        ? parsed.searchParams.getAll('__path')
        : parsed.searchParams.getAll('...path').length > 0
          ? parsed.searchParams.getAll('...path')
          : parsed.searchParams.getAll('path').length > 0
            ? parsed.searchParams.getAll('path')
            : null;

    const queryPath =
      req?.query?.__path ??
      req?.query?.['...path'] ??
      req?.query?.path ??
      searchMulti;

    const isGenericEntryPath =
      parsed.pathname === '/' ||
      parsed.pathname === '/api' ||
      parsed.pathname === '/api/' ||
      parsed.pathname === '/api/index' ||
      parsed.pathname === '/api/index.js' ||
      parsed.pathname === '/index' ||
      parsed.pathname === '/index.js' ||
      parsed.pathname.includes('[...');

    if (queryPath && isGenericEntryPath) {
      const joined = Array.isArray(queryPath) ? queryPath.join('/') : String(queryPath);
      const subPath = joined.replace(/^\/+/, '').replace(/^api\/+/, '');
      parsed.searchParams.delete('__path');
      parsed.searchParams.delete('...path');
      parsed.searchParams.delete('path');
      const remainingSearch = parsed.searchParams.toString();
      req.url = `/api/${subPath}${remainingSearch ? `?${remainingSearch}` : ''}`;
    } else if (isGenericEntryPath) {
      const candidateHeader = String(
        req?.headers?.['x-invoke-path'] ||
          req?.headers?.['x-matched-path'] ||
          req?.headers?.['x-forwarded-uri'] ||
          req?.headers?.['x-original-url'] ||
          ''
      ).trim();

      if (
        candidateHeader.startsWith('/api/') &&
        candidateHeader !== '/api/index' &&
        candidateHeader !== '/api/index.js' &&
        !candidateHeader.includes('[...')
      ) {
        const headerParsed = new URL(candidateHeader, 'http://localhost');
        req.url = `${headerParsed.pathname}${headerParsed.search}`;
      }
    }
  } catch {
    // Proceed with original req.url if parsing fails
  }

  return app(req, res);
}


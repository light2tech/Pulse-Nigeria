import { createApiApp } from './apiApp';

const app = createApiApp({ mountAtRoot: true });

export default function handler(req: any, res: any) {
  try {
    const rawUrl = String(req?.url || '/');
    const parsed = new URL(rawUrl, 'http://localhost');

    const queryPath =
      req?.query?.__path ??
      parsed.searchParams.get('__path') ??
      req?.query?.path;

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
      const subPath = (Array.isArray(queryPath) ? queryPath.join('/') : String(queryPath))
        .replace(/^\/+/, '')
        .replace(/^api\/+/, '');
      parsed.searchParams.delete('__path');
      const remainingSearch = parsed.searchParams.toString();
      req.url = `/api/${subPath}${remainingSearch ? `?${remainingSearch}` : ''}`;
    } else if (isGenericEntryPath) {
      const headerPath = String(
        req?.headers?.['x-invoke-path'] || req?.headers?.['x-matched-path'] || ''
      ).trim();
      if (
        headerPath.startsWith('/api/') &&
        headerPath !== '/api/index' &&
        headerPath !== '/api/index.js' &&
        !headerPath.includes('[...')
      ) {
        parsed.searchParams.delete('__path');
        const remainingSearch = parsed.searchParams.toString();
        req.url = `${headerPath}${remainingSearch ? `?${remainingSearch}` : ''}`;
      }
    }
  } catch {
    // Proceed with original req.url if parsing fails
  }

  return app(req, res);
}


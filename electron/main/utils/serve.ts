import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
};

const STATIC_EXTENSIONS = Object.keys(MIME_TYPES);

// serve assets built by Next.js
export async function serveNextBuild(req: Request, buildPath: string): Promise<Response | undefined> {
  const url = new URL(req.url);
  let filePath = url.pathname;

  // Handle Next.js routing - convert _next/static paths
  if (filePath.startsWith('/_next/')) {
    // Static files under _next/static
    const staticMatch = filePath.match(/^\/_next\/static\/(.+)$/);
    if (staticMatch) {
      const staticPath = path.join(buildPath, '_next', 'static', staticMatch[1]);
      return serveFile(staticPath);
    }

    // Other _next routes (like /_next/data/...)
    const nextPath = path.join(buildPath, filePath);
    return serveFile(nextPath);
  }

  // Handle root static files
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }

  const fullPath = path.join(buildPath, filePath.startsWith('/') ? filePath.slice(1) : filePath);
  return serveFile(fullPath);
}

async function serveFile(fullPath: string): Promise<Response | undefined> {
  try {
    const ext = path.extname(fullPath).toLowerCase();
    
    // Check if it's a known static extension
    if (!STATIC_EXTENSIONS.includes(ext)) {
      // Try adding .html or /index.html
      const htmlPath = fullPath + '.html';
      const htmlStat = await fs.stat(htmlPath).catch(() => null);
      if (htmlStat?.isFile()) {
        return createResponse(htmlPath);
      }

      const indexPath = path.join(fullPath, 'index.html');
      const indexStat = await fs.stat(indexPath).catch(() => null);
      if (indexStat?.isFile()) {
        return createResponse(indexPath);
      }

      console.log('Not a static file:', fullPath);
      return undefined;
    }

    const stat = await fs.stat(fullPath);
    if (!stat?.isFile()) {
      console.log('Not a file:', fullPath);
      return undefined;
    }

    return createResponse(fullPath);
  } catch (error) {
    console.log('Failed to serve file:', fullPath, error);
    return undefined;
  }
}

function createResponse(filePath: string): Response {
  const ext = path.extname(filePath).toLowerCase();
  return new Response(createReadStream(filePath), {
    headers: {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

// Keep for backward compatibility
export async function loadServerBuild(): Promise<undefined> {
  console.log('Next.js build - no server build needed');
  return undefined;
}

// Keep for backward compatibility  
export async function serveAsset(req: Request, assetsPath: string): Promise<Response | undefined> {
  return serveNextBuild(req, assetsPath);
}
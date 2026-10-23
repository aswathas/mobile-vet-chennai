// Minimal static file server for the built site.
//
// Astro emits its bundled CSS as an absolute path (/_astro/<hash>.css). That
// resolves correctly on a static host but not under the file:// protocol, where
// an absolute path points at the filesystem root. Inspection and PDF
// rendering therefore have to run against a real HTTP origin.

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, extname, normalize, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

export async function startStaticServer(rootDir, port = 0) {
  const root = normalize(rootDir);

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith('/')) pathname += 'index.html';

      // contain the resolved path inside root
      const target = normalize(join(root, pathname));
      if (target !== root && !target.startsWith(root + sep)) {
        res.writeHead(403).end('forbidden');
        return;
      }

      let filePath = target;
      let info = await stat(filePath).catch(() => null);
      if (info?.isDirectory()) {
        filePath = join(filePath, 'index.html');
        info = await stat(filePath).catch(() => null);
      }
      if (!info?.isFile()) {
        res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
        return;
      }

      res.writeHead(200, {
        'content-type': TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
        'content-length': info.size,
        'cache-control': 'no-store',
      });
      createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain' }).end(String(err));
    }
  });

  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  const actual = server.address().port;
  return {
    origin: `http://127.0.0.1:${actual}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

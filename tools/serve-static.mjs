#!/usr/bin/env node
// Server tĩnh tối giản phục vụ dist/habeo/browser cho smoke test.
// Unknown route -> index.html (SPA fallback như hosting tĩnh).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';

const root = process.argv[2] ?? 'dist/habeo/browser';
const port = Number(process.argv[3] ?? 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let p = normalize(decodeURIComponent(url.pathname));
    let file = join(root, p);
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(data);
      return;
    } catch {
      /* thử <path>/index.html rồi tới SPA fallback */
    }
    try {
      const data = await readFile(join(file, 'index.html'));
      res.writeHead(200, { 'content-type': MIME['.html'] });
      res.end(data);
      return;
    } catch {
      const data = await readFile(join(root, 'index.html'));
      res.writeHead(200, { 'content-type': MIME['.html'] });
      res.end(data);
    }
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end(String(e));
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`serve-static: ${root} http://127.0.0.1:${port}`);
});

const http = require('http');
const path = require('path');
const fs = require('fs');

function startServer(port, rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Remove query string and decode URL
      let pathname = decodeURIComponent(req.url);
      if (pathname.startsWith('/')) pathname = pathname.slice(1);

      // Build file path
      let filePath = path.join(rootDir, pathname);

      // Security: prevent directory traversal
      if (!path.resolve(filePath).startsWith(path.resolve(rootDir))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      // Try to serve the requested file
      fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
          // File exists, serve it
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.map': 'application/json',
          };
          const contentType = mimeTypes[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          fs.createReadStream(filePath).pipe(res);
          return;
        }

        // If it's a directory, try index.html
        if (!err && stats.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
          fs.stat(filePath, (err, stats) => {
            if (!err && stats.isFile()) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              fs.createReadStream(filePath).pipe(res);
              return;
            }
            // Directory with no index.html, fallback to root index.html (SPA routing)
            serveRootIndex();
          });
          return;
        }

        // File not found, fallback to index.html for SPA routing
        serveRootIndex();
      });

      function serveRootIndex() {
        const indexPath = path.join(rootDir, 'index.html');
        fs.stat(indexPath, (err, stats) => {
          if (!err && stats.isFile()) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            fs.createReadStream(indexPath).pipe(res);
          } else {
            res.writeHead(404);
            res.end('404 Not Found');
          }
        });
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port in use, try next port
        startServer(port + 1, rootDir).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`Static server running at http://127.0.0.1:${port}`);
      resolve(port);
    });
  });
}

module.exports = { startServer };

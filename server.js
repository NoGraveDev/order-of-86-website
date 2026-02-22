const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MIME = {
  '.html':'text/html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon',
  '.json':'application/json','.woff2':'font/woff2','.webp':'image/webp'
};

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  if (!path.extname(url)) url += '.html';
  const file = path.join(__dirname, url);
  fs.readFile(file, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, 'index.html'), (e, d) => {
        res.writeHead(e ? 404 : 200, {'Content-Type':'text/html'});
        res.end(e ? 'Not Found' : d);
      });
      return;
    }
    res.writeHead(200, {'Content-Type': MIME[path.extname(url)] || 'application/octet-stream'});
    res.end(data);
  });
}).listen(PORT, () => console.log(`Serving on port ${PORT}`));

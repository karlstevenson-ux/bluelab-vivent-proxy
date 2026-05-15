const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET_URL || '';

const server = http.createServer((req, res) => {
    if (!TARGET) {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('bluelab-vivent-proxy is running on port ' + PORT + '. Set TARGET_URL env var to proxy requests.');
          return;
    }

                                   const targetUrl = url.parse(TARGET);
    const isHttps = targetUrl.protocol === 'https:';
    const transport = isHttps ? https : http;

                                   const options = {
                                         hostname: targetUrl.hostname,
                                         port: targetUrl.port || (isHttps ? 443 : 80),
                                         path: req.url,
                                         method: req.method,
                                         headers: { ...req.headers, host: targetUrl.hostname },
                                   };

                                   const proxyReq = transport.request(options, (proxyRes) => {
                                         res.writeHead(proxyRes.statusCode, proxyRes.headers);
                                         proxyRes.pipe(res);
                                   });

                                   proxyReq.on('error', (err) => {
                                         res.writeHead(502, { 'Content-Type': 'text/plain' });
                                         res.end('Proxy error: ' + err.message);
                                   });

                                   req.pipe(proxyReq);
});

server.listen(PORT, () => {
    console.log('bluelab-vivent-proxy listening on port ' + PORT);
});

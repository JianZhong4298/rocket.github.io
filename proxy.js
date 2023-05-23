const express = require('express');
const httpProxy = require('http-proxy');
const https = require('https');
const fs = require('fs');



const proxy = httpProxy.createProxyServer();
const app = express();

app.use('/', (req, res) => {
  proxy.web(req, res, {
    target: 'http://rocket.dev.yes-z.com/'
  });
});

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});
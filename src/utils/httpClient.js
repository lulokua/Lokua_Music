const axios = require('axios');
const https = require('https');
const { MC_PROXY, MC_PROXYUSERPWD, DEFAULT_HEADERS } = require('../config');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // some endpoints use legacy TLS
});

function buildProxy() {
  if (!MC_PROXY) return false;
  const [host, port] = MC_PROXY.split(':');
  const proxy = { host, port: Number(port) || 80 };
  if (MC_PROXYUSERPWD) {
    const [username, password] = MC_PROXYUSERPWD.split(':');
    proxy.auth = { username, password };
  }
  return proxy;
}

const baseClient = axios.create({
  headers: { ...DEFAULT_HEADERS },
  timeout: 15000,
  httpsAgent,
  validateStatus: () => true,
});

async function request({ method = 'GET', url, params, data, headers = {}, referer, ua, proxy }) {
  const finalHeaders = { ...DEFAULT_HEADERS, ...headers };
  if (referer) finalHeaders.Referer = referer;
  if (ua) finalHeaders['User-Agent'] = ua;

  const cfg = {
    method,
    url,
    params,
    data,
    headers: finalHeaders,
    proxy: proxy === false ? false : buildProxy(),
  };

  const res = await baseClient(cfg);
  return res;
}

module.exports = {
  request,
};

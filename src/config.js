const path = require('path');

const MC_VERSION = '2.0.0-node';

// Env-driven flags to mirror the original PHP config.
const MC_PROXY = process.env.MC_PROXY || '';
const MC_PROXYUSERPWD = process.env.MC_PROXYUSERPWD || '';
const MC_INTERNAL = process.env.MC_INTERNAL ? process.env.MC_INTERNAL === '1' : true;

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
};

const PORT = process.env.PORT || 3000;

const SUPPORT_LIST = {
  netease: '网易',
  qq: 'QQ',
  kugou: '酷狗',
  kuwo: '酷我',
  baidu: '千千',
  '1ting': '一听',
  migu: '咪咕',
  lizhi: '荔枝',
  qingting: '蜻蜓',
  ximalaya: '喜马拉雅',
  '5singyc': '5sing原创',
  '5singfc': '5sing翻唱',
  kg: '全民K歌',
};

module.exports = {
  MC_VERSION,
  MC_PROXY,
  MC_PROXYUSERPWD,
  MC_INTERNAL,
  DEFAULT_HEADERS,
  SUPPORT_LIST,
  PORT,
  PUBLIC_DIR: path.join(__dirname, '..', 'public'),
};

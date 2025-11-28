const netease = require('./netease');
const qq = require('./qq');
const kugou = require('./kugou');
const kuwo = require('./kuwo');
const baidu = require('./baidu');
const m1ting = require('./m1ting');
const m5sing = require('./m5sing');
const migu = require('./migu');
const lizhi = require('./lizhi');
const qingting = require('./qingting');
const ximalaya = require('./ximalaya');
const qmkg = require('./qmkg');

async function searchByName(query, site, page) {
  switch (site) {
    case '1ting':
      return m1ting.search(query, page);
    case 'baidu':
      return baidu.search(query, page);
    case 'kugou':
      return kugou.search(query, page);
    case 'kuwo':
      return kuwo.search(query, page);
    case 'qq':
      return qq.search(query, page);
    case '5singyc':
      return m5sing.search(query, page, 'yc');
    case '5singfc':
      return m5sing.search(query, page, 'fc');
    case 'migu':
      return migu.search(query, page);
    case 'lizhi':
      return lizhi.search(query, page);
    case 'qingting':
      return qingting.search(query, page);
    case 'ximalaya':
      return ximalaya.search(query, page);
    case 'kg':
      return qmkg.search(query, page);
    case 'netease':
      return netease.search(query, page);
    default:
      return null;
  }
}

async function getSongById(songid, site) {
  switch (site) {
    case '1ting':
      return m1ting.getSong(songid);
    case 'baidu':
      return baidu.getSong(songid);
    case 'kugou':
      return kugou.getSong(songid);
    case 'kuwo':
      return kuwo.getSong(songid);
    case 'qq':
      return qq.getSong(songid);
    case '5singyc':
      return m5sing.getSong(songid, 'yc');
    case '5singfc':
      return m5sing.getSong(songid, 'fc');
    case 'migu':
      return migu.getSong(songid);
    case 'lizhi':
      return lizhi.getSong(songid);
    case 'qingting':
      return qingting.getSong(songid);
    case 'ximalaya':
      return ximalaya.getSong(songid);
    case 'kg':
      return qmkg.getSong(songid);
    case 'netease':
      return netease.getSong(songid);
    default:
      return null;
  }
}

module.exports = {
  searchByName,
  getSongById,
};

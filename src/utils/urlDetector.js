const patterns = {
  netease: /music\.163\.com\/(#(\/m)?|m)\/song(\?id=|\/)(\d+)/i,
  '1ting': /(www|m)\.1ting\.com\/(player\/.*\/player_|#\/song\/)(\d+)/i,
  baidu: /music\.taihe\.com\/song\/T?(\d+)/i,
  kugou: /(m|www)\.kugou\.com\/(play\/info\/|song\/\#hash\=)([a-z0-9]+)/i,
  kuwo: /(www|m)\.kuwo\.cn\/(yinyue|my|play_detail|newh5app\/play_detail)\/(\d+)/i,
  qq: /(y\.qq\.com\/n\/yqq\/song\/|data\.music\.qq\.com\/playsong\.html\?songmid=)([a-zA-Z0-9]+)/i,
  xiami: /(www|m)\.xiami\.com\/song\/([a-zA-Z0-9]+)/i,
  '5singyc': /5sing\.kugou\.com\/(m\/detail\/|)yc(-|\/)(\d+)/i,
  '5singfc': /5sing\.kugou\.com\/(m\/detail\/|)fc(-|\/)(\d+)/i,
  migu: /music\.migu\.cn(\/(#|v3\/music))?\/song\/([a-zA-Z0-9]+)/i,
  lizhi: /(www|m)\.lizhi\.fm\/(\d+)\/(\d+)/i,
  qingting: /(www|m)\.qingting\.fm\/(channels|vchannels)\/(\d+)\/programs\/(\d+)/i,
  ximalaya: /(www|m)\.ximalaya\.com\/(\d+)\/sound\/(\d+)/i,
  kg_id: /kg\d?\.qq\.com\/.*s=([a-zA-Z0-9_-]+)&/i,
  kg_uid: /kg\d?\.qq\.com\/.*personal\?uid=([a-z0-9_-]+)/i,
};

function detectByUrl(url) {
  if (!url) return null;
  if (patterns.netease.test(url)) {
    const match = url.match(patterns.netease);
    return { type: 'netease', songid: match[4] };
  }
  if (patterns['1ting'].test(url)) {
    const match = url.match(patterns['1ting']);
    return { type: '1ting', songid: match[3] };
  }
  if (patterns.baidu.test(url)) {
    const match = url.match(patterns.baidu);
    return { type: 'baidu', songid: `T${match[1]}` };
  }
  if (patterns.kugou.test(url)) {
    const match = url.match(patterns.kugou);
    return { type: 'kugou', songid: match[3] };
  }
  if (patterns.kuwo.test(url)) {
    const match = url.match(patterns.kuwo);
    return { type: 'kuwo', songid: match[3] };
  }
  if (patterns.qq.test(url)) {
    const match = url.match(patterns.qq);
    return { type: 'qq', songid: match[2] };
  }
  if (patterns.xiami.test(url)) {
    const match = url.match(patterns.xiami);
    return { type: 'xiami', songid: match[2] };
  }
  if (patterns['5singyc'].test(url)) {
    const match = url.match(patterns['5singyc']);
    return { type: '5singyc', songid: match[3] };
  }
  if (patterns['5singfc'].test(url)) {
    const match = url.match(patterns['5singfc']);
    return { type: '5singfc', songid: match[3] };
  }
  if (patterns.migu.test(url)) {
    const match = url.match(patterns.migu);
    return { type: 'migu', songid: match[3] };
  }
  if (patterns.lizhi.test(url)) {
    const match = url.match(patterns.lizhi);
    return { type: 'lizhi', songid: match[3] };
  }
  if (patterns.qingting.test(url)) {
    const match = url.match(patterns.qingting);
    return { type: 'qingting', songid: `${match[3]}|${match[4]}` };
  }
  if (patterns.ximalaya.test(url)) {
    const match = url.match(patterns.ximalaya);
    return { type: 'ximalaya', songid: match[3] };
  }
  if (patterns.kg_id.test(url)) {
    const match = url.match(patterns.kg_id);
    return { type: 'kg', songid: match[1] };
  }
  if (patterns.kg_uid.test(url)) {
    const match = url.match(patterns.kg_uid);
    return { type: 'kg_uid', songid: match[1] };
  }
  return null;
}

module.exports = { detectByUrl };

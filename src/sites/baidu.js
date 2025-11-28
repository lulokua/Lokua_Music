const { request } = require('../utils/httpClient');

const SECRET = '0b50b02fd0d73a9c4c8c3a781c30845f';

function createSign(params) {
  const keys = Object.keys(params).sort();
  const str = keys.map((k) => `${k}=${params[k]}`).join('&');
  return require('crypto').createHash('md5').update(str + SECRET).digest('hex');
}

async function getSong(songid) {
  if (!songid) return null;
  const body = {
    TSID: songid,
    timestamp: Math.floor(Date.now() / 1000),
    from: 'web',
    s_protocol: '1',
    appid: '16073360',
  };
  body.sign = createSign(body);
  const res = await request({
    method: 'GET',
    url: 'https://music.taihe.com/v1/song/tracklink',
    params: body,
    referer: `https://music.taihe.com/song/${songid}`,
  });
  const data = res.data?.data;
  if (!res.data?.state || !data) return null;
  let lrc = null;
  if (data.lyric) {
    try {
      const lrcRes = await request({ method: 'GET', url: data.lyric });
      lrc = lrcRes.data;
    } catch (e) {
      lrc = null;
    }
  }
  const authors = Array.isArray(data.artist) ? data.artist.map((a) => a.name).join(',') : '';
  return [
    {
      type: 'baidu',
      link: `https://music.taihe.com/song/${data.TSID}`,
      songid: data.TSID,
      title: data.title,
      author: authors,
      lrc,
      url: data.path,
      pic: data.pic,
    },
  ];
}

async function search(query, page = 1) {
  const body = {
    word: query,
    timestamp: Math.floor(Date.now() / 1000),
    appid: '16073360',
    type: '1',
  };
  body.sign = createSign(body);
  const res = await request({
    method: 'GET',
    url: 'https://music.taihe.com/v1/search',
    params: body,
    referer: 'https://music.taihe.com/',
  });
  const list = res.data?.data?.typeTrack;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const item of list) {
    const song = await getSong(item.TSID);
    if (song) songs.push(...song);
  }
  return songs;
}

module.exports = { search, getSong };

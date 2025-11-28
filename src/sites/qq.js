const { request } = require('../utils/httpClient');

const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

const BASE_HEADERS = {
  referer: 'https://m.y.qq.com',
  ua: UA_MOBILE,
};

function jsonp2json(text) {
  if (!text) return null;
  const trimmed = text.trim().replace(/^[^(]*\(/, '').replace(/\);?$/, '');
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    return null;
  }
}

function decodeLyric(str) {
  if (!str) return null;
  const txt = str.replace(/&#13;|&#10;/g, (m) => (m === '&#10;' ? '\n' : '')).replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(code);
  });
  return txt;
}

async function getLyric(songmid) {
  const res = await request({
    method: 'GET',
    url: 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg',
    params: {
      songmid,
      format: 'json',
      nobase64: 1,
      songtype: 0,
      callback: 'c',
    },
    ...BASE_HEADERS,
  });
  const data = jsonp2json(res.data);
  return decodeLyric(data?.lyric);
}

async function getSongUrl(songids) {
  const mids = Array.isArray(songids) ? songids : [songids];
  const songtypes = mids.map(() => 0);
  const guid = Math.floor(111111111 + Math.random() * 888888888).toString();
  const payload = {
    req: {
      module: 'CDN.SrfCdnDispatchServer',
      method: 'GetCdnDispatch',
      param: { guid, calltype: 0, userip: '' },
    },
    req_0: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        guid,
        songmid: mids,
        songtype: songtypes,
        uin: '0',
        loginflag: 1,
        platform: '20',
      },
    },
    comm: { uin: 0, format: 'json', ct: 24, cv: 0 },
  };
  const res = await request({
    method: 'GET',
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    params: { data: JSON.stringify(payload) },
    referer: 'https://y.qq.com/portal/player.html',
  });
  const sip = res.data?.req_0?.data?.sip?.[0] || '';
  const info = res.data?.req_0?.data?.midurlinfo || [];
  return info.map((item) => `${sip}${item.purl}`);
}

async function search(query, page = 1) {
  const res = await request({
    method: 'GET',
    url: 'https://shc6.y.qq.com/soso/fcgi-bin/search_for_qq_cp',
    params: {
      w: query,
      p: page,
      n: 10,
      format: 'json',
    },
    ...BASE_HEADERS,
  });
  const list = res.data?.data?.song?.list;
  if (!Array.isArray(list)) return null;
  const ids = list.filter((item) => item?.pay?.payplay !== 1).map((item) => item.songmid);
  const urls = ids.length ? await getSongUrl(ids) : [];
  const songs = [];
  let idx = 0;
  for (const item of list) {
    if (item.pay?.payplay === 1) continue;
    const authors = (item.singer || []).map((s) => s.name).join(',');
    const albumId = item.albummid;
    const songid = item.songmid;
    const lrc = await getLyric(songid);
    songs.push({
      type: 'qq',
      link: `https://y.qq.com/n/yqq/song/${songid}.html`,
      songid,
      title: item.songname,
      author: authors,
      lrc,
      url: urls[idx] || '',
      pic: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumId}.jpg`,
    });
    idx += 1;
  }
  return songs;
}

async function getSong(songid) {
  const ids = Array.isArray(songid) ? songid : [songid];
  const res = await request({
    method: 'GET',
    url: 'https://c.y.qq.com/v8/fcg-bin/fcg_play_single_song.fcg',
    params: {
      songmid: ids.join(','),
      format: 'json',
    },
    ...BASE_HEADERS,
  });
  const data = res.data?.data;
  if (!Array.isArray(data)) return null;
  const urls = await getSongUrl(ids);
  const songs = [];
  for (let i = 0; i < data.length; i += 1) {
    const item = data[i];
    if (item.pay?.pay_play === 1) continue;
    const authors = (item.singer || []).map((s) => s.title).join(',');
    const songidCur = item.mid;
    const lrc = await getLyric(songidCur);
    songs.push({
      type: 'qq',
      link: `https://y.qq.com/n/yqq/song/${songidCur}.html`,
      songid: songidCur,
      title: item.title,
      author: authors,
      lrc,
      url: urls[i] || '',
      pic: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.album?.mid}.jpg`,
    });
  }
  return songs;
}

module.exports = { search, getSong };

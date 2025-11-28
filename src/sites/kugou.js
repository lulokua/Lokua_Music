const { request } = require('../utils/httpClient');
const { MC_INTERNAL } = require('../config');

const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

async function getLyric(songid) {
  const res = await request({
    method: 'GET',
    url: 'http://m.kugou.com/app/i/krc.php',
    params: {
      cmd: 100,
      timelength: 999999,
      hash: songid,
    },
    referer: `http://m.kugou.com/play/info/${songid}`,
    ua: UA_MOBILE,
  });
  return res.data || null;
}

async function getSong(songid) {
  if (!songid) return null;
  const res = await request({
    method: 'GET',
    url: 'http://m.kugou.com/app/i/getSongInfo.php',
    params: { cmd: 'playInfo', hash: songid },
    referer: `http://m.kugou.com/play/info/${songid}`,
    ua: UA_MOBILE,
  });
  const data = res.data;
  if (!data) return null;
  if (!data.url) {
    return {
      error: data.privilege ? '来源反馈此音频需要付费' : '找不到可用的播放地址',
      code: 403,
    };
  }
  const albumImg = (data.album_img || '').replace('{size}', '150');
  const imgUrl = (data.imgUrl || '').replace('{size}', '150');
  const lrc = await getLyric(data.hash);
  return [
    {
      type: 'kugou',
      link: `http://www.kugou.com/song/#hash=${data.hash}`,
      songid: data.hash,
      title: data.songName,
      author: data.singerName,
      lrc: lrc,
      url: data.url,
      pic: albumImg || imgUrl,
    },
  ];
}

async function search(query, page = 1) {
  const res = await request({
    method: 'GET',
    url: MC_INTERNAL
      ? 'http://songsearch.kugou.com/song_search_v2'
      : 'http://mobilecdn.kugou.com/api/v3/search/song',
    params: {
      keyword: query,
      platform: 'WebFilter',
      format: 'json',
      page,
      pagesize: 10,
    },
    referer: MC_INTERNAL ? 'http://www.kugou.com' : 'http://m.kugou.com',
  });
  const data = res.data?.data;
  const key = MC_INTERNAL ? 'lists' : 'info';
  if (!data || !Array.isArray(data[key])) return null;
  const songs = [];
  for (const val of data[key]) {
    let hash;
    if (MC_INTERNAL) {
      hash = val.HQFileHash;
      if (!hash || !hash.replace(/0/g, '')) hash = val.FileHash;
    } else {
      hash = val['320hash'] || val.hash;
    }
    const song = await getSong(hash);
    if (song) songs.push(...song);
  }
  return songs;
}

module.exports = { search, getSong };

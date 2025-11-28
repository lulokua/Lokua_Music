const { request } = require('../utils/httpClient');

async function getLyric(songid) {
  const res = await request({
    method: 'GET',
    url: 'https://kg.qq.com/cgi/fcg_lyric',
    params: {
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'utf-8',
      ksongmid: songid,
    },
    referer: 'https://kg.qq.com',
  });
  return res.data?.data?.lyric || null;
}

async function getSong(songid) {
  if (!songid) return null;
  const res = await request({
    method: 'GET',
    url: 'https://kg.qq.com/cgi/kg_ugc_getdetail',
    params: {
      v: 4,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'utf-8',
      shareid: songid,
    },
    referer: 'https://kg.qq.com',
  });
  const data = res.data?.data;
  if (!data) return null;
  const lrc = await getLyric(songid);
  return [
    {
      type: 'kg',
      link: `https://kg.qq.com/node/play?s=${songid}&shareuid=${data.uid}`,
      songid,
      title: data.song_name,
      author: data.nick,
      lrc,
      url: data.playurl,
      pic: data.cover,
    },
  ];
}

async function search(uid, page = 1) {
  const res = await request({
    method: 'GET',
    url: 'https://kg.qq.com/cgi/kg_ugc_get_homepage',
    params: {
      format: 'json',
      type: 'get_ugc',
      inCharset: 'utf8',
      outCharset: 'utf-8',
      share_uid: uid,
      start: page,
      num: 10,
    },
    referer: 'https://kg.qq.com',
  });
  const list = res.data?.data?.ugclist;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const item of list) {
    const song = await getSong(item.shareid);
    if (song) songs.push(...song);
  }
  return songs;
}

module.exports = { search, getSong };

const crypto = require('crypto');
const { request } = require('../utils/httpClient');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36';

function encodeLinux(data) {
  const key = 'rFgB&h#%2?^eDg:Q';
  const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const hex = Buffer.from(encrypted.toString('base64'), 'base64').toString('hex').toUpperCase();
  return { eparams: hex };
}

async function getLyric(songid) {
  const payload = encodeLinux({
    method: 'GET',
    url: 'http://music.163.com/api/song/lyric',
    params: { id: songid, lv: 1 },
  });
  const res = await request({
    method: 'POST',
    url: 'http://music.163.com/api/linux/forward',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: new URLSearchParams(payload).toString(),
    referer: 'http://music.163.com/',
    ua: UA,
  });
  if (!res.data) return null;
  try {
    return res.data.lrc?.lyric || null;
  } catch (e) {
    return null;
  }
}

async function search(query, page = 1) {
  const payload = encodeLinux({
    method: 'POST',
    url: 'http://music.163.com/api/cloudsearch/pc',
    params: {
      s: query,
      type: 1,
      offset: page * 10 - 10,
      limit: 10,
    },
  });
  const res = await request({
    method: 'POST',
    url: 'http://music.163.com/api/linux/forward',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: new URLSearchParams(payload).toString(),
    referer: 'http://music.163.com/',
    ua: UA,
  });
  const list = res.data?.result?.songs;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const item of list) {
    const id = item.id;
    const authors = (item.ar || []).map((a) => a.name).join(',');
    const lrc = await getLyric(id);
    songs.push({
      type: 'netease',
      link: `http://music.163.com/#/song?id=${id}`,
      songid: id,
      title: item.name,
      author: authors,
      lrc: lrc,
      url: `http://music.163.com/song/media/outer/url?id=${id}.mp3`,
      pic: `${item.al?.picUrl || ''}?param=300x300`,
    });
  }
  return songs;
}

async function getSong(songid) {
  const payload = encodeLinux({
    method: 'GET',
    url: 'http://music.163.com/api/song/detail',
    params: {
      id: songid,
      ids: `[${songid}]`,
    },
  });
  const res = await request({
    method: 'POST',
    url: 'http://music.163.com/api/linux/forward',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: new URLSearchParams(payload).toString(),
    referer: 'http://music.163.com/',
    ua: UA,
  });
  const list = res.data?.songs;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const item of list) {
    const id = item.id;
    const authors = (item.artists || []).map((a) => a.name).join(',');
    const lrc = await getLyric(id);
    songs.push({
      type: 'netease',
      link: `http://music.163.com/#/song?id=${id}`,
      songid: id,
      title: item.name,
      author: authors,
      lrc: lrc,
      url: `http://music.163.com/song/media/outer/url?id=${id}.mp3`,
      pic: `${item.album?.picUrl || ''}?param=300x300`,
    });
  }
  return songs;
}

module.exports = { search, getSong };

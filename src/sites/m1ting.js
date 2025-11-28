const { request } = require('../utils/httpClient');

async function getLyric(songid) {
  const res = await request({
    method: 'GET',
    url: `https://www.1ting.com/api/geci/lrc/${songid}`,
    referer: `https://www.1ting.com/geci${songid}.html`,
  });
  return res.data || null;
}

async function getSong(songid) {
  if (!songid) return null;
  const ids = Array.isArray(songid) ? songid.join(',') : songid;
  const res = await request({
    method: 'GET',
    url: 'https://h5.1ting.com/touch/api/song',
    params: { ids },
    referer: `https://h5.1ting.com/#/song/${songid}`,
  });
  const data = Array.isArray(res.data) ? res.data : [];
  const songs = [];
  for (const item of data) {
    const lrc = await getLyric(item.song_id);
    songs.push({
      type: '1ting',
      link: `https://www.1ting.com/player/6c/player_${item.song_id}.html`,
      songid: item.song_id,
      title: item.song_name,
      author: item.singer_name,
      lrc,
      url: `https://h5.1ting.com/file?url=${item.song_filepath.replace('.wma', '.mp3')}`,
      pic: `http://img.store.sogou.com/net/a/link?&appid=100520102&w=500&h=500&url=${item.album_cover}`,
    });
  }
  return songs.length ? songs : null;
}

async function search(query, page = 1) {
  const res = await request({
    method: 'GET',
    url: 'https://so.1ting.com/song/json',
    params: { q: query, page, size: 10 },
    referer: 'https://h5.1ting.com/',
  });
  const list = res.data?.results;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const item of list) {
    const lrc = await getLyric(item.song_id);
    songs.push({
      type: '1ting',
      link: `https://www.1ting.com/player/6c/player_${item.song_id}.html`,
      songid: item.song_id,
      title: item.song_name,
      author: item.singer_name,
      lrc,
      url: `https://h5.1ting.com/file?url=${item.song_filepath.replace('.wma', '.mp3')}`,
      pic: `https://${item.album_cover}`,
    });
  }
  return songs;
}

module.exports = { search, getSong };

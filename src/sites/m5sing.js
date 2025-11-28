const { request } = require('../utils/httpClient');

async function getSong(songid, type) {
  if (!songid) return null;
  const res = await request({
    method: 'GET',
    url: 'http://service.5sing.kugou.com/song/getsongurl',
    params: { songid, songtype: type },
    referer: `http://5sing.kugou.com/${type}/${songid}.html`,
  });
  const data = res.data?.data;
  if (!data) return null;
  return [
    {
      type,
      link: `http://5sing.kugou.com/${data.songtype}/${data.songid}.html`,
      songid: data.songid,
      title: data.songName,
      author: data.user?.NN,
      lrc: data.dynamicWords,
      url: data.lqurl,
      pic: data.user?.I,
    },
  ];
}

async function search(query, page = 1, type = 'yc') {
  const filter = type === 'yc' ? '1' : '2';
  const res = await request({
    method: 'GET',
    url: 'http://search.5sing.kugou.com/home/json',
    params: {
      keyword: query,
      sort: '1',
      filter,
      page,
    },
    headers: { Accept: 'application/json, text/javascript, */*; q=0.01' },
    referer: `http://search.5sing.kugou.com/?keyword=${encodeURIComponent(query)}`,
  });
  const list = res.data?.list;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const item of list) {
    const song = await getSong(item.songId, type);
    if (song) songs.push(...song);
  }
  return songs;
}

module.exports = { search, getSong };

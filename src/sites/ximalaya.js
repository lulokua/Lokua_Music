const { request } = require('../utils/httpClient');

async function getSong(songid) {
  if (!songid) return null;
  const res = await request({
    method: 'GET',
    url: `http://mobile.ximalaya.com/v1/track/ca/playpage/${songid}`,
    referer: 'http://www.ximalaya.com',
  });
  const data = res.data?.trackInfo;
  const user = res.data?.userInfo;
  if (!data || !user) return null;
  if (data.isPaid) {
    return { error: '来源反馈此音频需要付费', code: 403 };
  }
  return [
    {
      type: 'ximalaya',
      link: `https://www.ximalaya.com/${data.uid}/sound/${data.trackId}`,
      songid: data.trackId,
      title: data.title,
      author: user.nickname,
      lrc: '',
      url: data.playUrl64,
      pic: data.coverLarge,
    },
  ];
}

async function search(query, page = 1) {
  const res = await request({
    method: 'GET',
    url: 'http://www.ximalaya.com/revision/search/main',
    params: {
      kw: query,
      core: 'track',
      page,
      rows: 10,
      condition: 'relation',
      device: 'iPhone',
      paidFilter: 'true',
    },
    referer: 'http://www.ximalaya.com',
  });
  const list = res.data?.data?.track?.docs;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const item of list) {
    if (item.is_paid) continue;
    const song = await getSong(item.id);
    if (song && !song.error) songs.push(...song);
  }
  return songs;
}

module.exports = { search, getSong };

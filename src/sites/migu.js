const { request } = require('../utils/httpClient');

const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

async function getLyric(copyrightId) {
  if (!copyrightId) return null;
  const res = await request({
    method: 'GET',
    url: 'http://music.migu.cn/v3/api/music/audioPlayer/getLyric',
    params: {
      copyrightId,
      accept: 'application/json, text/plain, */*',
    },
    referer: 'http://music.migu.cn/v3/music/player/audio',
  });
  return res.data?.lyric || null;
}

async function search(query, page = 1) {
  const res = await request({
    method: 'GET',
    url: 'http://pd.musicapp.migu.cn/MIGUM2.0/v1.0/content/search_all.do',
    params: {
      text: query,
      pageNo: page,
      pageSize: '1',
      searchSwitch: '{"song":1,"album":0,"singer":0,"tagSong":0,"mvSong":0,"songlist":0,"bestShow":1}',
    },
    referer: 'http://music.migu.cn/',
    ua: UA_MOBILE,
  });
  const list = res.data?.songResultData?.result;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const item of list) {
    const id = item.id;
    const authors = item.singers?.[0]?.name || '';
    const lyric = await getLyric(item.copyrightId);
    const playUrlRaw = item.newRateFormats?.[0]?.url || '';
    const playUrl = playUrlRaw.replace('ftp://218.200.160.122:21/', 'https://freetyst.nf.migu.cn/');
    songs.push({
      type: 'migu',
      link: `https://music.migu.cn/v3/music/song/${id}`,
      songid: id,
      title: item.name,
      author: authors,
      lrc: lyric,
      url: playUrl,
      pic: item.imgItems?.[0]?.img,
    });
  }
  return songs;
}

async function getSong(songid) {
  // Search endpoint provides more complete data; reuse search by id
  return search(songid, 1);
}

module.exports = { search, getSong };

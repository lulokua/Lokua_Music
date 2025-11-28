const { request } = require('../utils/httpClient');

const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

function generateKuwoLrc(lrclist) {
  if (!Array.isArray(lrclist)) return null;
  let lrc = '';
  lrclist.forEach((item) => {
    const t = Number(item.time);
    let time = '00:00';
    if (t > 60) {
      const min = Math.floor(t / 60);
      const sec = (t % 60).toFixed(2);
      time = `${min < 10 ? `0${min}` : min}:${sec.padStart(5, '0')}`;
    } else {
      time = `00:${t.toFixed(2).padStart(5, '0')}`;
    }
    lrc += `[${time}]${item.lineLyric}\n`;
  });
  return lrc || null;
}

async function getSongUrl(songid) {
  const res = await request({
    method: 'GET',
    url: 'http://www.kuwo.cn/api/v1/www/music/playUrl',
    params: {
      mid: songid,
      type: 'music',
      httpsStatus: '1',
    },
    referer: `http://www.kuwo.cn/play_detail/${songid}`,
  });
  return res.data?.data?.url || '';
}

async function getSong(songid) {
  if (!songid) return null;
  const res = await request({
    method: 'GET',
    url: 'http://m.kuwo.cn/newh5/singles/songinfoandlrc',
    params: { musicId: songid },
    referer: `http://www.kuwo.cn/play_detail/${songid}`,
    ua: UA_MOBILE,
  });
  const data = res.data?.data;
  if (!data) return null;
  const lrclist = data.lrclist;
  const lrc = lrclist ? generateKuwoLrc(lrclist) : null;
  const info = data.songinfo;
  const format = info.coopFormats?.[0] || '128kmp3';
  return [
    {
      type: 'kuwo',
      link: `http://www.kuwo.cn/play_detail/${info.id}`,
      songid: info.id,
      title: info.songName,
      author: info.artist,
      lrc,
      url: await getSongUrl(info.id, format),
      format,
      pic: info.pic,
    },
  ];
}

async function search(query, page = 1) {
  const res = await request({
    method: 'GET',
    url: 'http://search.kuwo.cn/r.s',
    params: {
      all: query,
      ft: 'music',
      itemset: 'web_2013',
      pn: page - 1,
      rn: 10,
      rformat: 'json',
      encoding: 'utf8',
    },
    referer: 'http://player.kuwo.cn/webmusic/play',
  });
  const body = typeof res.data === 'string' ? res.data.replace(/'/g, '"') : '';
  let parsed = res.data;
  if (typeof res.data === 'string') {
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      parsed = null;
    }
  }
  const list = parsed?.abslist;
  if (!Array.isArray(list)) return null;
  const songs = [];
  for (const val of list) {
    const rid = (val.MUSICRID || '').replace('MUSIC_', '');
    const song = await getSong(rid);
    if (song) songs.push(...song);
  }
  return songs;
}

module.exports = { search, getSong };

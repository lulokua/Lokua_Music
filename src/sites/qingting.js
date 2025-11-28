const { request } = require('../utils/httpClient');

function splitSongId(songid) {
  if (!songid || songid.indexOf('|') < 0) return [];
  return songid.split('|');
}

async function getSong(songid) {
  if (!songid) return null;
  const [channelId, programId] = splitSongId(songid);
  const res = await request({
    method: 'GET',
    url: `http://i.qingting.fm/wapi/channels/${channelId}/programs/${programId}`,
    referer: 'http://www.qingting.fm',
  });
  const data = res.data?.data;
  if (!data) return null;
  let author = '';
  let pic = '';
  try {
    const infoRes = await request({
      method: 'GET',
      url: `http://i.qingting.fm/wapi/channels/${data.channel_id}`,
      referer: 'http://www.qingting.fm',
    });
    author = infoRes.data?.data?.name || '';
    pic = infoRes.data?.data?.img_url || '';
  } catch (e) {
    // ignore
  }
  return [
    {
      type: 'qingting',
      link: `http://www.qingting.fm/channels/${data.channel_id}/programs/${data.id}`,
      songid: `${data.channel_id}|${data.id}`,
      title: data.name,
      author,
      lrc: '',
      url: `http://od.qingting.fm/${data.file_path}`,
      pic,
    },
  ];
}

async function search(query, page = 1) {
  const res = await request({
    method: 'GET',
    url: 'http://search.qingting.fm/v3/search',
    params: {
      categoryid: 0,
      k: query,
      page,
      pagesize: 10,
      include: 'program_ondemand',
    },
    referer: 'http://www.qingting.fm',
  });
  const list = res.data?.data?.data?.docs;
  if (!Array.isArray(list)) return null;
  return list.map((item) => ({
    type: 'qingting',
    link: `http://www.qingting.fm/channels/${item.parent_id}/programs/${item.id}`,
    songid: `${item.parent_id}|${item.id}`,
    title: item.title,
    author: item.parent_name,
    lrc: '',
    url: item.url || '',
    pic: item.cover,
  }));
}

module.exports = { search, getSong };

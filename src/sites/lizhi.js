const { request } = require('../utils/httpClient');

const UA_MOBILE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';

async function search(query, page = 1) {
  const res = await request({
    method: 'GET',
    url: 'https://m.lizhi.fm/vodapi/search/voice',
    params: {
      deviceId: 'h5-b6ef91a9-3dbb-c716-1fdd-43ba08851150',
      keywords: query,
      page,
    },
    referer: 'https://m.lizhi.fm',
    ua: UA_MOBILE,
  });
  const list = res.data?.data;
  if (!Array.isArray(list)) return null;
  return list.map((item) => ({
    type: 'lizhi',
    link: `https://www.lizhi.fm/${item.userInfo?.band}/${item.voiceInfo?.voiceId}`,
    songid: item.voiceInfo?.voiceId,
    title: item.voiceInfo?.name,
    author: item.userInfo?.name,
    lrc: '',
    url: item.voicePlayProperty?.trackUrl,
    pic: item.voiceInfo?.imageUrl,
  }));
}

async function getSong(songid) {
  const res = await request({
    method: 'GET',
    url: `https://m.lizhi.fm/vodapi/voice/info/${songid}`,
    referer: 'https://m.lizhi.fm',
    ua: UA_MOBILE,
  });
  const value = res.data?.data?.userVoice;
  if (!value) return null;
  const id = value.voiceInfo?.voiceId;
  return [
    {
      type: 'lizhi',
      link: `https://www.lizhi.fm/${value.userInfo?.band}/${id}`,
      songid: id,
      title: value.voiceInfo?.name,
      author: value.userInfo?.name,
      lrc: '',
      url: value.voicePlayProperty?.trackUrl,
      pic: value.voiceInfo?.imageUrl,
    },
  ];
}

module.exports = { search, getSong };

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const { searchByName, getSongById } = require('./sites');
const { detectByUrl } = require('./utils/urlDetector');
const { SUPPORT_LIST, MC_VERSION, PORT, PUBLIC_DIR } = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/static', express.static(path.join(PUBLIC_DIR, 'static')));
app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));
app.use(express.static(PUBLIC_DIR));

const validPatterns = {
  name: /^.+$/i,
  id: /^[\w\/\|]+$/i,
  url: /^https?:\/\/\S+$/i,
};

function sendResponse(res, data, code = 200, error = '') {
  res.status(code).json({ data, code, error });
}

const handleMusicRequest = async (input, filter, type, page) => {
  if (!input || !filter || (!type && filter !== 'url')) {
    throw { code: 403, message: '(╯°□°）╯ 传入的数据不对哦' };
  }

  if (filter !== 'url' && !Object.keys(SUPPORT_LIST).includes(type)) {
    throw { code: 403, message: '(╯°□°）╯ 目前还不支持这个站点' };
  }

  const pattern = validPatterns[filter];
  if (!pattern || !pattern.test(input)) {
    throw { code: 403, message: '(｡•́︿•̀｡) 请输入正确格式的数据' };
  }

  let songs = null;
  if (filter === 'name') {
    songs = await searchByName(input, type, page);
  } else if (filter === 'id') {
    songs = await getSongById(input, type);
  } else if (filter === 'url') {
    const detected = detectByUrl(input);
    if (!detected) {
      throw { code: 404, message: 'ヽ(ー_ー )ノ 没有找到相关信息' };
    }
    if (detected.type === 'kg_uid') {
      songs = await searchByName(detected.songid, 'kg', page);
    } else {
      songs = await getSongById(detected.songid, detected.type);
    }
  }

  if (!songs || (Array.isArray(songs) && songs.length === 0)) {
    throw { code: 404, message: '(╥﹏╥) 没有找到相关信息' };
  }
  if (songs.error) {
    throw { code: songs.code || 500, message: songs.error };
  }

  return songs;
};

app.post('/api/music', async (req, res) => {
  const input = (req.body.input || '').toString().trim();
  const filter = req.body.filter;
  const type = req.body.type;
  const page = parseInt(req.body.page || '1', 10) || 1;

  try {
    const songs = await handleMusicRequest(input, filter, type, page);
    return sendResponse(res, songs, 200, '');
  } catch (err) {
    if (err.code) {
      return sendResponse(res, '', err.code, err.message);
    }
    console.error(err);
    return sendResponse(res, '', 500, '(╯°□°）╯ 出了点小问题，请稍后重试');
  }
});

// Dedicated GET endpoints for major platforms
const createGetHandler = (type) => async (req, res) => {
  const input = (req.query.input || '').toString().trim();
  const filter = req.query.filter || 'name';
  const page = parseInt(req.query.page || '1', 10) || 1;

  try {
    const songs = await handleMusicRequest(input, filter, type, page);
    return sendResponse(res, songs, 200, '');
  } catch (err) {
    if (err.code) {
      return sendResponse(res, '', err.code, err.message);
    }
    console.error(err);
    return sendResponse(res, '', 500, '(╯°□°）╯ 出了点小问题，请稍后重试');
  }
};

app.get('/api/netease', createGetHandler('netease'));
app.get('/api/qq', createGetHandler('qq'));
app.get('/api/kugou', createGetHandler('kugou'));
app.get('/api/kuwo', createGetHandler('kuwo'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: MC_VERSION });
});

// Fallback to SPA
app.use((req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Lokua Music listening on http://localhost:${PORT}`);
});

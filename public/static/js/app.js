(() => {
  const supportList = {
    netease: '网易',
    qq: 'QQ',
    kugou: '酷狗',
    kuwo: '酷我',
    baidu: '千千',
    '1ting': '一听',
    migu: '咪咕',
    lizhi: '荔枝',
    qingting: '蜻蜓',
    ximalaya: '喜马',
    '5singyc': '5sing原创',
    '5singfc': '5sing翻唱',
    kg: '全民K歌',
  };

  const form = document.querySelector('#searchForm');
  const input = document.querySelector('#searchInput');
  const submitBtn = document.querySelector('#submitBtn');
  const errorMsg = document.querySelector('#errorMsg');
  // Update selector for new tab style
  const filterTabs = document.querySelectorAll('#filterTabs .segment-btn');
  const typeGroup = document.querySelector('#typeGroup');
  const typeOptions = document.querySelector('#typeOptions');
  const playerPanel = document.querySelector('#playerPanel');
  const loadMoreBtn = document.querySelector('#loadMore');

  const linkInput = document.querySelector('#linkInput');
  const linkOpen = document.querySelector('#linkOpen');
  const srcInput = document.querySelector('#srcInput');
  const srcOpen = document.querySelector('#srcOpen');
  const lrcInput = document.querySelector('#lrcInput');
  const lrcOpen = document.querySelector('#lrcOpen');
  const songIdInput = document.querySelector('#songIdInput');
  const titleInput = document.querySelector('#titleInput');
  const authorInput = document.querySelector('#authorInput');
  const playError = document.querySelector('#playError');
  const backBtn = document.querySelector('#backBtn');
  const spinner = document.querySelector('.btn__spinner');

  const placeholders = {
    name: '搜索歌曲、歌手...',
    id: '输入歌曲 ID (例如: 25906124)',
    url: '粘贴歌曲链接 (例如: http://music.163.com/...)',
  };

  let currentFilter = 'name';
  let currentType = 'netease';
  let currentPage = 1;
  let lastQuery = '';
  let player = null;
  let playerList = [];

  function renderTypes() {
    typeOptions.innerHTML = '';
    Object.entries(supportList).forEach(([key, label], idx) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'source-item';
      
      const inputEl = document.createElement('input');
      inputEl.type = 'radio';
      inputEl.name = 'music_type';
      inputEl.value = key;
      if (idx === 0) inputEl.checked = true;
      
      const card = document.createElement('div');
      card.className = 'source-card';
      
      // Simple icon logic or placeholder
      // const icon = document.createElement('i');
      // icon.setAttribute('data-lucide', 'music');
      // card.appendChild(icon);
      
      const span = document.createElement('span');
      span.textContent = label;
      card.appendChild(span);
      
      wrapper.appendChild(inputEl);
      wrapper.appendChild(card);
      typeOptions.appendChild(wrapper);

      inputEl.addEventListener('change', () => {
        currentType = key;
      });
    });
    // Re-init icons if we added any (currently text only for simplicity)
    if (window.lucide) window.lucide.createIcons();
  }

  function setFilter(filter) {
    currentFilter = filter;
    input.placeholder = placeholders[filter];
    errorMsg.textContent = '';
    if (filter === 'url') {
      typeGroup.style.display = 'none';
    } else {
      typeGroup.style.display = 'block'; // Changed from flex to block
    }
    filterTabs.forEach((tab) => {
      // Toggle active class for segmented control
      tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    input.focus();
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      input.disabled = true;
      if (spinner) spinner.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      input.disabled = false;
      if (spinner) spinner.classList.add('hidden');
    }
  }

  function updateMeta(data) {
    linkInput.value = data.link || '';
    linkOpen.href = data.link || '#';
    srcInput.value = data.url || '';
    srcOpen.href = data.url || '#';

    lrcInput.value = data.lrc || '';
    const lrcBlob = new Blob([data.lrc || ''], { type: 'text/plain;charset=utf-8' });
    lrcOpen.href = URL.createObjectURL(lrcBlob);
    lrcOpen.download = `${data.title || 'lyrics'}.lrc`;

    if ('download' in srcOpen) {
      srcOpen.download = `${data.title || 'song'}-${data.author || ''}.mp3`;
    }

    songIdInput.value = data.songid || '';
    titleInput.value = data.title || '';
    authorInput.value = data.author || '';
  }

  function toAplayer(list) {
    return list.map((item) => ({
      name: item.title,
      artist: item.author,
      url: item.url,
      cover: item.pic,
      lrc: item.lrc,
      link: item.link,
      songid: item.songid,
      title: item.title,
      author: item.author,
    }));
  }

  function ensurePlayer(list) {
    const apList = toAplayer(list);
    if (!player) {
      player = new APlayer({
        container: document.getElementById('player'),
        preload: 'metadata',
        lrcType: 1,
        audio: apList,
        theme: '#0A84FF', // Apple Blue
        mutex: false,
        autoplay: false,
      });

      player.on('listswitch', () => {
        const data = player.list.audios[player.list.index];
        updateMeta(data);
        document.title = `正在播放: ${data.title} - ${data.author}`;
        playError.style.display = 'none';
      });

      player.on('play', () => {
        playError.style.display = 'none';
      });

      player.on('ended', () => {
        document.title = 'Lokua Music';
      });

      player.on('error', () => {
        playError.textContent = '当前音频无法播放，可能版权/区域限制或链接失效，请尝试切换来源或使用代理。';
        playError.style.display = 'block';
      });
    } else {
      player.list.clear();
      player.list.add(apList);
      player.list.switch(0);
    }
    updateMeta(apList[0]);
    
    // Show player panel
    playerPanel.style.display = 'block'; // Changed flex to block to match CSS
    
    // Smooth scroll to player
    playerPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function fetchMusic({ append = false } = {}) {
    const body = {
      input: input.value.trim(),
      filter: currentFilter,
      type: currentFilter === 'url' ? '_' : currentType,
      page: currentPage,
    };
    lastQuery = body.input;
    setLoading(true);
    try {
      const res = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.code !== 200 || !json.data) {
        errorMsg.textContent = json.error || '服务器出了点问题';
        return;
      }
      const data = json.data.map((item) => {
        const title = item.title || '暂缺';
        const author = item.author || '暂缺';
        const pic = item.pic || '/static/img/nopic.jpg';
        const lrc = item.lrc || '[00:00.00] 暂无歌词';
        return { ...item, title, author, pic, lrc };
      });

      if (!append) {
        playerList = data;
        ensurePlayer(playerList);
        player.list.switch(0);
      } else {
        playerList = playerList.concat(data);
        player.list.add(toAplayer(data));
      }

      loadMoreBtn.style.display = data.length < 10 || currentFilter !== 'name' ? 'none' : 'inline-flex';
      errorMsg.textContent = '';
    } catch (e) {
      console.error(e);
      errorMsg.textContent = '请求超时或网络异常';
    } finally {
      setLoading(false);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    currentPage = 1;
    fetchMusic();
  });

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission if inside form (though buttons are typeless defaults to submit sometimes)
        setFilter(tab.dataset.filter)
    });
  });

  loadMoreBtn.addEventListener('click', () => {
    if (currentFilter !== 'name') return;
    currentPage += 1;
    fetchMusic({ append: true });
  });

  backBtn.addEventListener('click', () => {
    document.getElementById('searchPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus();
  });

  renderTypes();
  setFilter('name');
})();

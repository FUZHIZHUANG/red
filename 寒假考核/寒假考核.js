// 全局关闭详情页函数
function closeSongDetailPage() {
  console.log('通过onclick关闭详情页');
  const page = document.querySelector('.song-detail-page');
  if (page) {
    page.style.display = 'none';
  }
}

// 格式化播放量
function formatPlayCount(count) {
  if (count < 10000) return count;
  if (count < 100000000) return (count / 10000).toFixed(1) + '万';
  return (count / 100000000).toFixed(1) + '亿';
}

// 格式化时长（秒转 mm:ss）
function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

const navUl = document.querySelector('.nav ul');

async function getSongPlayUrl(songId, level = 'standard') {
  try {
    const params = new URLSearchParams({
      id: songId,
      level: level,
      unblock: 'false'
    });

    const res = await fetch(`http://localhost:3000/song/url/v1?${params}`, {
      headers: {
        'Cookie': 'os=pc'
      }
    });

    if (!res.ok) throw new Error(`接口请求失败：${res.status}`);
    const data = await res.json();

    if (Array.isArray(data.data)) {
      if (typeof songId === 'number' || !songId.includes(',')) {
        const songData = data.data.find(item => item.id === Number(songId));
        return songData?.url || '';
      }
      return data.data.reduce((obj, item) => {
        obj[item.id] = item.url || '';
        return obj;
      }, {});
    }
    return '';
  } catch (err) {
    console.error('获取歌曲播放URL失败：', err);
    alert('获取播放地址失败，请检查接口服务！');
    return '';
  }
}
// ---------------------- 我喜欢的音乐 ----------------------
function getLikedSongsFromLocal() {
  const raw = localStorage.getItem('likedSongs');
  return raw ? JSON.parse(raw) : [];
}

function saveLikedSongsToLocal(songs) {
  localStorage.setItem('likedSongs', JSON.stringify(songs));
}

let likedSongs = getLikedSongsFromLocal();

function isSongLiked(songId) {
  return likedSongs.some(song => song.id === Number(songId));
}

function toggleLikeSong(song, isAdd) {
  if (isAdd) {
    if (!isSongLiked(song.id)) {
      likedSongs.push(song);
    }
  } else {
    likedSongs = likedSongs.filter(item => item.id !== song.id);
  }
  saveLikedSongsToLocal(likedSongs);
  renderLikedMusicList();
}

function renderLikedMusicList() {
  const likedMusicSongList = document.querySelector('.liked-music-song-list');
  const likedMusicCount = document.querySelector('.liked-music-song-list-wrap h3 span');

  likedMusicCount.textContent = likedSongs.length;

  if (likedSongs.length === 0) {
    likedMusicSongList.innerHTML = '<li style="width: 100%; text-align: center; padding: 20px;">暂无喜欢的音乐</li>';
    return;
  }

  likedMusicSongList.innerHTML = '';
  likedSongs.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = 'song-item';
    li.dataset.songId = song.id;
    li.innerHTML = `
      <span class="song-index">${index + 1}</span>
      <div class="song-info">
        <p class="song-name">${song.name}</p>
        <p class="song-singer">${song.ar.map(artist => artist.name).join('/')} - ${song.al.name}</p>
      </div>
      <!-- 新增：播放按钮 + 时长容器 -->
      <div class="song-duration-wrap">
        <button class="play-btn">▶</button>
        <span class="song-duration">${formatDuration(song.dt / 1000)}</span>
      </div>
      <button class="like-btn liked" data-song-id="${song.id}">♥</button>
    `;
    likedMusicSongList.appendChild(li);
  });

  bindLikeBtnEvents();
  bindSongPlayBtnEvents();
}

let likeDelegationInitialized = false;
function bindLikeBtnEvents() {
  if (likeDelegationInitialized) return;
  likeDelegationInitialized = true;
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.like-btn');
    if (!btn) return;
    e.stopPropagation();
    handleLikeBtnClick(btn);
  });
}

function handleLikeBtnClick(btn) {
  const songId = Number(btn.dataset.songId);
  if (!songId) return;

  const isLiked = btn.classList.contains('liked');
  let targetSong = null;

  const songItem = btn.closest('.song-item');
  if (songItem) {
    const songName = songItem.querySelector('.song-name')?.textContent || '';
    const songSingerAlbum = songItem.querySelector('.song-singer')?.textContent || '';
    const songDuration = songItem.querySelector('.song-duration')?.textContent || '00:00';

    if (document.querySelector('.liked-music-page').classList.contains('active')) {
      targetSong = likedSongs.find(s => s.id === songId);
    } else {
      const playlistTracks = document.querySelectorAll('.song-list .song-item');
      playlistTracks.forEach((item) => {
        const likeBtn = item.querySelector('.like-btn');
        const itemId = likeBtn ? Number(likeBtn.dataset.songId) : null;
        if (itemId === songId) {
          const songDetail = {
            id: songId,
            name: songName,
            ar: songSingerAlbum.split(' - ')[0]?.split('/').map(name => ({ name })) || [],
            al: { name: songSingerAlbum.split(' - ')[1] || '' },
            dt: formatDurationReverse(songDuration) * 1000
          };
          targetSong = songDetail;
        }
      });
    }
  }

  if (!targetSong) return;

  if (isLiked) {
    toggleLikeSong(targetSong, false);
    btn.classList.remove('liked');
    btn.textContent = '♡';
    if (document.querySelector('.liked-music-page').classList.contains('active')) {
      songItem?.remove();
      document.querySelector('.liked-music-song-list-wrap h3 span').textContent = likedSongs.length;
      if (likedSongs.length === 0) {
        document.querySelector('.liked-music-song-list').innerHTML = '<li style="width: 100%; text-align: center; padding: 20px;">暂无喜欢的音乐</li>';
      }
    }
  } else {
    toggleLikeSong(targetSong, true);
    btn.classList.add('liked');
    btn.textContent = '♥';
  }
}

function formatDurationReverse(timeStr) {
  const [min, sec] = timeStr.split(':').map(Number);
  return min * 60 + sec;
}


function initLikedMusic() {
  const likedMusicLink = Array.from(navUl.querySelectorAll('a')).find(link => link.dataset.id === '2');
  if (likedMusicLink) {
    likedMusicLink.addEventListener('click', () => {
      renderLikedMusicList();
    });
    window.addEventListener('load', () => {
      if (likedMusicLink.classList.contains('active')) {
        renderLikedMusicList();
      }
    });
  }
  window.addEventListener('load', () => {
    // 初始化详情页相关元素
    songDetailPage = document.querySelector('.song-detail-page');
    detailCloseBtn = document.querySelector('.song-detail-close');
    dynamicCoverImg = document.querySelector('.dynamic-cover');
    detailTitle = document.querySelector('.detail-title');
    detailArtist = document.querySelector('.detail-artist');
    detailAlbum = document.querySelector('.detail-album');
    lyricsContent = document.querySelector('.lyrics-content');

    console.log('详情页元素初始化:', {
      songDetailPage: songDetailPage,
      detailCloseBtn: detailCloseBtn
    });

    const activeLink = document.querySelector('.nav a.active');
    if (activeLink && activeLink.dataset.id === '2') {
      renderLikedMusicList();
    }
    bindLikeBtnEvents();
    bindSongPlayBtnEvents();

    // 绑定详情页关闭按钮事件
    if (detailCloseBtn && songDetailPage) {
      console.log('绑定详情页关闭按钮事件');
      detailCloseBtn.addEventListener('click', (e) => {
        console.log('点击关闭按钮，隐藏详情页');
        console.log('事件对象:', e);
        console.log('目标元素:', e.target);
        console.log('详情页当前显示状态:', songDetailPage.style.display);
        e.stopPropagation(); // 阻止事件冒泡
        songDetailPage.style.display = 'none';
        console.log('详情页设置后的显示状态:', songDetailPage.style.display);
      });
    } else {
      console.error('无法找到详情页关闭按钮或详情页元素');
    }

    // 绑定点击歌曲名称打开详情页的事件
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target.classList && target.classList.contains('song-name')) {
        const li = target.closest('li') || target.closest('.song-item');
        const songId = li && (li.dataset.songId || li.dataset.id || li.getAttribute('data-id'));
        if (songId) {
          openSongDetailById(songId);
        }
      }
    });

    // 绑定歌词点击事件
    if (lyricsContent) {
      lyricsContent.addEventListener('click', async (e) => {
        const line = e.target.closest('.lyric-line');
        if (!line) return;
        const t = parseFloat(line.dataset.time);
        if (isNaN(t)) return;
        try {
          if (audio.src) {
            audio.currentTime = t;
            if (audio.paused) audio.play().catch(() => { });
            syncLyrics(t);
          } else if (currentPlayList.length > 0) {
            const idx = currentPlayIndex >= 0 ? currentPlayIndex : 0;
            await playSong(idx);
            setTimeout(() => {
              audio.currentTime = t;
            }, 300);
          }
        } catch (err) {
          console.error('点击歌词跳转失败：', err);
        }
      });
    }
  });
}
initLikedMusic();
// ---------------------- 推荐歌单 ----------------------
const limit = 6;
const gedanList = document.querySelector('.gedanlist');
fetch('http://localhost:3000/personalized?limit=6')
  .then(res => {
    if (!res.ok) throw new Error(`接口请求失败：${res.status}`);
    return res.json();
  })
  .then(res => {
    gedanList.innerHTML = '';
    if (res.result && res.result.length) {
      res.result.forEach(item => {
        const li = document.createElement('li');
        li.className = 'gedan-item';
        li.dataset.playlistId = item.id;
        li.innerHTML = `
          <img src="${item.picUrl}" alt="${item.name}">
          <span class="play-count">
            <i class="iconfont icon-play-count"></i>
            ${formatPlayCount(item.playCount)}
          </span>
          <p>${item.name}</p>
        `;
        gedanList.appendChild(li);
        li.addEventListener('click', () => {
          getPlaylistDetail(item.id);
        });
      });
    }
  })
  .catch(err => {
    console.error('歌单数据渲染失败：', err);
    gedanList.innerHTML = '<li style="width: 100%; text-align: center; padding: 20px;">歌单加载失败，请重试</li>';
  });

// ---------------------- 轮播图 ----------------------
const imgList = document.querySelector('.imglist');
const next = document.querySelector('.button-right');
const last = document.querySelector('.button-left');
const pointList = document.querySelector('.point');
let bannerData = [];
let bannerIndex = 0;

function initBanner() {
  fetch('http://localhost:3000/banner?type=0')
    .then(res => {
      if (!res.ok) throw new Error(`接口请求失败：${res.status}`);
      return res.json();
    })
    .then(res => {
      bannerData = res.banners || [];
      if (bannerData.length === 0) throw new Error('轮播图数据为空');

      imgList.innerHTML = '';
      bannerData.forEach(banner => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${banner.imageUrl}" alt="${banner.title}">`;
        imgList.appendChild(li);
      });

      pointList.innerHTML = '';
      bannerData.forEach(() => {
        const li = document.createElement('li');
        pointList.appendChild(li);
      });

      renderBanner(bannerIndex);
    })
    .catch(err => {
      console.error('轮播图数据加载失败：', err);
      imgList.innerHTML = '<li style="width:100%;text-align:center;padding:20px;">轮播图加载失败</li>';
    });
}

function renderBanner(index) {
  if (index >= bannerData.length) index = 0;
  if (index < 0) index = bannerData.length - 1;
  bannerIndex = index;

  const imgItems = document.querySelectorAll('.imglist li');
  imgItems.forEach((item, idx) => {
    item.style.display = idx === bannerIndex ? 'block' : 'none';
  });

  const pointItems = document.querySelectorAll('.point li');
  pointItems.forEach((item, idx) => {
    item.className = idx === bannerIndex ? 'active' : '';
  });
}

function bindBannerEvent() {
  next.addEventListener('click', () => {
    if (bannerData.length === 0) return;
    renderBanner(bannerIndex + 1);
  });

  last.addEventListener('click', () => {
    if (bannerData.length === 0) return;
    renderBanner(bannerIndex - 1);
  });

  pointList.addEventListener('click', (e) => {
    if (e.target.tagName !== 'LI') return;
    const pointItems = [...document.querySelectorAll('.point li')];
    const index = pointItems.indexOf(e.target);
    renderBanner(index);
  });

  setInterval(() => {
    renderBanner(bannerIndex + 1);
  }, 3000);
}

initBanner();
bindBannerEvent();
// ---------------------- 侧边栏切换 ----------------------
const contentItems = document.querySelectorAll('.content .item');
let activeNavLink = document.querySelector('.nav .active') || navUl.querySelector('a');
let activeContentItem = document.querySelector('.content .active') || contentItems[0];
const playlistDetailPage = document.querySelector('.playlist-detail-page');
const backBtn = document.querySelector('.back-btn');

navUl.addEventListener('click', (e) => {
  const targetLink = e.target.closest('a');
  if (!targetLink) return;
  if (targetLink === activeNavLink) return;

  const targetIndex = Number(targetLink.dataset.id);
  if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= contentItems.length - 1) {
    console.warn('无效的data-id，切换失败');
    return;
  }

  playlistDetailPage.classList.remove('active');
  activeNavLink.classList.remove('active');
  targetLink.classList.add('active');
  activeNavLink = targetLink;
  activeContentItem.classList.remove('active');
  contentItems[targetIndex].classList.add('active');
  activeContentItem = contentItems[targetIndex];
});
backBtn.addEventListener('click', () => {
  playlistDetailPage.classList.remove('active');
  activeContentItem.classList.add('active');
});

// ---------------------- 歌单广场 ----------------------
function getHighQualityPlaylists(cat = '') {
  const guangchang = document.querySelector('.guangchang');
  fetch(`http://localhost:3000/top/playlist/highquality?cat=${encodeURIComponent(cat)}`)
    .then(res => {
      if (!res.ok) throw new Error(`接口请求失败：${res.status}`);
      return res.json();
    })
    .then(res => {
      guangchang.innerHTML = '';
      if (res.playlists && res.playlists.length) {
        res.playlists.forEach(item => {
          const li = document.createElement('li');
          li.className = 'guangchang-item';
          li.dataset.playlistId = item.id;
          li.innerHTML = `
            <img src="${item.coverImgUrl}" alt="${item.name}">
            <span class="play-count">
              <i class="iconfont icon-play-count"></i>
              ${formatPlayCount(item.playCount)}
            </span>
            <p>${item.name}</p>
          `;
          guangchang.appendChild(li);
          li.addEventListener('click', () => {
            getPlaylistDetail(item.id);
          });
        }
        );
      }
    })
    .catch(err => {
      console.error('歌单数据渲染失败：', err);
      guangchang.innerHTML = '<li style="width: 100%; text-align: center; padding: 20px;">歌单加载失败，请重试</li>';
    });
}

const tabList = document.querySelector('.tab');
fetch('http://localhost:3000/playlist/highquality/tags')
  .then(res => {
    if (!res.ok) throw new Error(`接口请求失败：${res.status}`);
    return res.json();
  })
  .then(res => {
    tabList.innerHTML = '';
    if (res.tags && res.tags.length) {
      const tags = res.tags || [];
      tags.forEach(item => {
        const li = document.createElement('li');
        li.className = 'tab-item';
        li.innerHTML = `<button class="tab-btn">${item.name}</button>`;

        const btn = li.querySelector('.tab-btn');
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          getHighQualityPlaylists(item.name);
        });

        tabList.appendChild(li);
      });

      if (tags.length > 0) {
        const firstBtn = tabList.querySelector('.tab-btn');
        firstBtn.classList.add('active');
        getHighQualityPlaylists(tags[0].name);
      }
    } else {
      tabList.innerHTML = '<li style="width: 100%; text-align: center; padding: 20px;">暂无分类标签</li>';
    }
  })
  .catch(err => {
    console.error('分类标签加载失败：', err);
    tabList.innerHTML = '<li style="width: 100%; text-align: center; padding: 20px;">分类标签加载失败，请重试</li>';
  });

// ---------------------- 歌单详情（完整界面） ----------------------
function getPlaylistDetail(playlistId) {
  const playlistCover = document.querySelector('.playlist-cover');
  const playlistName = document.querySelector('.playlist-name');
  const playlistPlayCount = document.querySelector('.playlist-play-count');
  const playlistCreator = document.querySelector('.playlist-creator span');
  const songList = document.querySelector('.song-list');
  const playlistDesc = document.querySelector('.playlist-desc');

  fetch(`http://localhost:3000/playlist/detail?id=${playlistId}`)
    .then(res => {
      if (!res.ok) throw new Error(`接口请求失败：${res.status}`);
      return res.json();
    })
    .then(res => {
      const playlist = res.playlist;
      if (!playlist) throw new Error('歌单数据为空');

      playlistCover.src = playlist.coverImgUrl;
      playlistName.textContent = playlist.name;
      playlistPlayCount.textContent = `播放量：${formatPlayCount(playlist.playCount)}`;
      playlistCreator.textContent = playlist.creator.nickname;

      if (playlist.description && playlist.description.trim()) {
        playlistDesc.textContent = playlist.description.trim();
        playlistDesc.classList.remove('empty');
      } else {
        playlistDesc.textContent = '暂无歌单描述';
        playlistDesc.classList.add('empty');
      }

      songList.innerHTML = '';
      playlist.tracks.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'song-item';
        li.dataset.songId = song.id;
        li.innerHTML = `
          <span class="song-index">${index + 1}</span>
          <div class="song-info">
            <p class="song-name">${song.name}</p>
            <p class="song-singer">${song.ar.map(artist => artist.name).join('/')} - ${song.al.name}</p>
          </div>
          <!-- 新增：播放按钮 + 时长容器 -->
          <div class="song-duration-wrap">
            <button class="play-btn">▶</button>
            <span class="song-duration">${formatDuration(song.dt / 1000)}</span>
          </div>
          <button class="like-btn ${isSongLiked(song.id) ? 'liked' : ''}" data-song-id="${song.id}">${isSongLiked(song.id) ? '♥' : '♡'}</button>
        `;
        songList.appendChild(li);
      });
      bindLikeBtnEvents();
      bindSongPlayBtnEvents();
      activeContentItem.classList.remove('active');
      playlistDetailPage.classList.add('active');
    })
    .catch(err => {
      console.error('歌单详情加载失败：', err);
      songList.innerHTML = '<li style="width: 100%; text-align: center; padding: 20px;">歌单详情加载失败，请重试</li>';
    });
}

// ---------------------- 底部播放控制 ----------------------
const audio = new Audio();
let currentPlayIndex = -1;
let currentPlayList = [];
let isPlaying = false;


const playPauseBtn = document.querySelector('.play-pause-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const progressBar = document.querySelector('.progress-bar');
const currentTimeEl = document.querySelector('.current-time');
const totalTimeEl = document.querySelector('.total-time');
const playingSongNameEl = document.querySelector('.playing-song-name');
const playingSongSingerEl = document.querySelector('.playing-song-singer');
const volumeBtn = document.querySelector('.volume-btn');
const volumeSlider = document.querySelector('.volume-slider');

audio.volume = volumeSlider.value;
function setPlayList(playlist) {
  currentPlayList = playlist;
}

async function playSong(index, playUrl = '') {
  if (currentPlayList.length === 0 || index < 0 || index >= currentPlayList.length) return;

  currentPlayIndex = index;
  const song = currentPlayList[index];


  let finalPlayUrl = playUrl || '';
  if (!finalPlayUrl) {
    try {
      finalPlayUrl = await getSongPlayUrl(song.id, 'standard');
    } catch (err) {
      console.error('获取播放地址失败：', err);
      finalPlayUrl = '';
    }
  }

  if (!finalPlayUrl) {
    alert('无法获取到歌曲播放地址，播放失败');
    return;
  }


  audio.src = finalPlayUrl;

  playingSongNameEl.textContent = song.name;
  playingSongSingerEl.textContent = `- ${song.ar.map(artist => artist.name).join('/')}`;


  audio.play().then(() => {
    isPlaying = true;
    playPauseBtn.textContent = '⏸';
    highlightPlayingSongBtn(song.id);
    try {
      if (songDetailPage && songDetailPage.style.display !== 'none') {
        renderSongDetail(song.id);
      }
    } catch (e) {
      console.warn('更新详情页失败：', e);
    }
  }).catch(err => {
    console.error('播放失败：', err);
    alert('歌曲播放失败，请检查接口或网络');
  });
}

function highlightPlayingSongBtn(songId) {
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.style.color = '';
    btn.textContent = '▶';
  });
  const activeBtn = document.querySelector(`.song-item[data-song-id="${songId}"] .play-btn`);
  if (activeBtn) {
    activeBtn.style.color = '#ff2e2e';
    activeBtn.textContent = '⏸';
  }
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playPauseBtn.textContent = '▶';
  if (currentPlayIndex !== -1 && currentPlayList.length > 0) {
    const songId = currentPlayList[currentPlayIndex].id;
    const activeBtn = document.querySelector(`.song-item[data-song-id="${songId}"] .play-btn`);
    if (activeBtn) {
      activeBtn.textContent = '▶';
    }
  }
}

function playPrevSong() {
  if (currentPlayList.length === 0) return;
  const newIndex = currentPlayIndex - 1 < 0 ? currentPlayList.length - 1 : currentPlayIndex - 1;
  playSong(newIndex);
}

function playNextSong() {
  if (currentPlayList.length === 0) return;
  const newIndex = currentPlayIndex + 1 >= currentPlayList.length ? 0 : currentPlayIndex + 1;
  playSong(newIndex);
}


function updateProgress() {
  const { duration, currentTime } = audio;
  if (isNaN(duration)) return;
  const progressPercent = (currentTime / duration) * 100;
  progressBar.value = progressPercent;
  currentTimeEl.textContent = formatDuration(currentTime);
  totalTimeEl.textContent = formatDuration(duration);
  try {
    syncLyrics(currentTime);
  } catch (e) {
  }
}

function togglePlayPause() {
  if (currentPlayList.length === 0) {
    if (likedSongs.length > 0) {
      setPlayList(likedSongs);
      playSong(0);
    } else {
      alert('暂无可播放的歌曲，请先添加喜欢的音乐');
    }
    return;
  }

  isPlaying ? pauseSong() : playSong(currentPlayIndex);
}


function handleVolumeChange() {
  audio.volume = volumeSlider.value;
  volumeBtn.textContent = audio.volume === 0 ? '🔇' : audio.volume < 0.5 ? '🔉' : '🔊';
}

function toggleMute() {
  audio.muted = !audio.muted;
  volumeBtn.textContent = audio.muted ? '🔇' : (audio.volume < 0.5 ? '🔉' : '🔊');
  volumeSlider.value = audio.muted ? 0 : audio.volume;
}

progressBar.addEventListener('click', (e) => {
  if (currentPlayList.length === 0 || isNaN(audio.duration)) return;
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const progressPercent = (clickX / rect.width) * 100;
  const seekTime = (progressPercent / 100) * audio.duration;
  audio.currentTime = seekTime;
});

// 绑定播放控制事件
function bindPlayerEvents() {
  playPauseBtn.addEventListener('click', togglePlayPause);
  prevBtn.addEventListener('click', playPrevSong);
  nextBtn.addEventListener('click', playNextSong);
  volumeSlider.addEventListener('input', handleVolumeChange);
  volumeBtn.addEventListener('click', toggleMute);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', playNextSong);
  audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatDuration(audio.duration);
  });
  document.addEventListener('click', (e) => {
    const songItem = e.target.closest('.song-item');
    if (songItem && !e.target.closest('.like-btn')) {
      let targetPlaylist = [];
      if (document.querySelector('.liked-music-page').classList.contains('active')) {
        targetPlaylist = likedSongs;
      } else if (document.querySelector('.playlist-detail-page').classList.contains('active')) {
        targetPlaylist = Array.from(document.querySelectorAll('.song-list .song-item')).map(item => {
          const songId = Number(item.querySelector('.like-btn').dataset.songId);
          const songName = item.querySelector('.song-name').textContent;
          const singerAlbum = item.querySelector('.song-singer').textContent;
          const [singers, album] = singerAlbum.split(' - ');
          return {
            id: songId,
            name: songName,
            ar: singers.split('/').map(name => ({ name })),
            al: { name: album },
            dt: formatDurationReverse(item.querySelector('.song-duration').textContent) * 1000
          };
        });
      }

      if (targetPlaylist.length > 0) {
        setPlayList(targetPlaylist);
        const songId = Number(songItem.querySelector('.like-btn').dataset.songId);
        const songIndex = targetPlaylist.findIndex(song => song.id === songId);
        if (songIndex !== -1) {
          playSong(songIndex);
        }
      }
    }
  });
}

// 初始化播放器
function initPlayer() {
  bindPlayerEvents();
  setPlayList(likedSongs);
}


window.addEventListener('load', initPlayer);
function bindSongPlayBtnEvents() {
  const playBtns = document.querySelectorAll('.play-btn');
  playBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const songItem = btn.closest('.song-item');
      if (!songItem) return;

      const songId = Number(songItem.dataset.songId);
      if (!songId) return;
      const playUrl = await getSongPlayUrl(songId, 'standard');
      if (!playUrl) return;
      let targetPlaylist = [];
      if (document.querySelector('.liked-music-page').classList.contains('active')) {
        targetPlaylist = likedSongs;
      } else if (playlistDetailPage.classList.contains('active')) {
        targetPlaylist = Array.from(document.querySelectorAll('.song-list .song-item')).map(item => {
          const id = Number(item.dataset.songId);
          const name = item.querySelector('.song-name').textContent;
          const singerAlbum = item.querySelector('.song-singer').textContent;
          const [singers, album] = singerAlbum.split(' - ');
          return {
            id,
            name,
            ar: singers.split('/').map(name => ({ name })),
            al: { name: album },
            dt: formatDurationReverse(item.querySelector('.song-duration').textContent) * 1000
          };
        });
      }

      setPlayList(targetPlaylist);
      const songIndex = targetPlaylist.findIndex(song => song.id === songId);
      if (songIndex !== -1) {
        playSong(songIndex, playUrl);
      }
    });
  });
}

// 搜索功能）
const searchInput = document.querySelector('.search-input');
const searchList = document.querySelector('.search-list');

async function loadHotSearch() {
  try {
    const res = await fetch('http://localhost:3000/search/hot');
    const data = await res.json();
    if (data.code === 200 && data.result && data.result.hots) {
      let hotHtml = '';
      data.result.hots.forEach((item, index) => {
        hotHtml += `<li class="search-hot-item" data-keyword="${item.first}">${index + 1}. ${item.first}</li>`;
      });
      searchList.innerHTML = hotHtml;
    }
  } catch (err) {
    console.error('获取热门搜索失败：', err);
  }
}

searchInput.addEventListener('focus', () => {
  if (searchList.innerHTML === '') {
    loadHotSearch();
  }
  searchList.style.display = 'block';
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => {
    searchList.style.display = 'none';
  }, 200);
});

searchList.addEventListener('click', (e) => {
  if (e.target.classList.contains('search-hot-item')) {
    searchInput.value = e.target.dataset.keyword;
    searchList.style.display = 'none';
  }
});

let songDetailPage = null; // 将在 load 事件中初始化
let detailCloseBtn = null; // 将在 load 事件中初始化
let dynamicCoverImg = null; // 将在 load 事件中初始化
let detailTitle = null; // 将在 load 事件中初始化
let detailArtist = null; // 将在 load 事件中初始化
let detailAlbum = null; // 将在 load 事件中初始化
let lyricsContent = null; // 将在 load 事件中初始化


let lyricsLines = [];
let currentLyricIndex = -1;


function parseLrc(lrcText) {
  const lines = lrcText.split(/\r?\n/);
  const timeTagReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
  const result = [];
  for (const line of lines) {
    let match;
    const times = [];
    while ((match = timeTagReg.exec(line)) !== null) {
      const min = Number(match[1]);
      const sec = Number(match[2]);
      const ms = match[3] ? Number(match[3].padEnd(3, '0')) : 0;
      const time = min * 60 + sec + ms / 1000;
      times.push(time);
    }
    const text = line.replace(/\[(?:\d{2}:\d{2}(?:\.\d{2,3})?)\]/g, '').trim();
    times.forEach(t => {
      result.push({ time: t, text: text || '♪' });
    });
  }
  result.sort((a, b) => a.time - b.time);
  return result;
}

function renderLyrics(lrcText) {
  lyricsLines = parseLrc(lrcText || '');
  currentLyricIndex = -1;
  if (!lyricsLines.length) {
    lyricsContent.innerHTML = '<div class="lyric-line">暂无歌词</div>';
    return;
  }
  lyricsContent.innerHTML = lyricsLines.map(item => `<div class="lyric-line" data-time="${item.time}">${item.text}</div>`).join('');
}

function syncLyrics(currentTime) {
  if (!lyricsLines || lyricsLines.length === 0) return;
  let idx = currentLyricIndex;
  if (idx >= 0 && idx < lyricsLines.length - 1) {
    if (currentTime >= lyricsLines[idx].time && currentTime < lyricsLines[idx + 1].time) {
      return;
    }
  }
  for (let i = 0; i < lyricsLines.length; i++) {
    const start = lyricsLines[i].time;
    const end = i < lyricsLines.length - 1 ? lyricsLines[i + 1].time : Infinity;
    if (currentTime >= start && currentTime < end) {
      if (currentLyricIndex !== i) {
        const prevEl = lyricsContent.querySelector('.lyric-line.active');
        if (prevEl) prevEl.classList.remove('active');
        const el = lyricsContent.querySelectorAll('.lyric-line')[i];
        if (el) {
          el.classList.add('active');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        currentLyricIndex = i;
      }
      break;
    }
  }
}

async function renderSongDetail(songId) {
  try {

    const detailRes = await fetch(`http://localhost:3000/song/detail?ids=${songId}`);
    const detailJson = await detailRes.json();
    const song = (detailJson.songs && detailJson.songs[0]) || null;

    detailTitle.textContent = song ? song.name : '';
    detailArtist.textContent = song ? song.ar.map(a => a.name).join('/') : '';
    detailAlbum.textContent = song ? (song.al && song.al.name) : '';


    try {
      const coverRes = await fetch(`http://localhost:3000/song/dynamic/cover?id=${songId}`);
      const coverJson = await coverRes.json().catch(() => null);
      if (coverJson && coverJson.urls && coverJson.urls[0]) {
        dynamicCoverImg.src = coverJson.urls[0];
      } else if (song && song.al && song.al.picUrl) {
        dynamicCoverImg.src = song.al.picUrl;
      } else {
        dynamicCoverImg.src = '';
      }
    } catch (err) {
      if (song && song.al && song.al.picUrl) dynamicCoverImg.src = song.al.picUrl || '';
    }


    try {
      const lyricRes = await fetch(`http://localhost:3000/lyric?id=${songId}`);
      const lyricJson = await lyricRes.json();
      const lrc = lyricJson && (lyricJson.lrc && lyricJson.lrc.lyric) ? lyricJson.lrc.lyric : (lyricJson && lyricJson.lyric ? lyricJson.lyric : '');
      renderLyrics(lrc || '');
    } catch (err) {
      renderLyrics('');
    }
  } catch (err) {
    console.error('renderSongDetail 错误：', err);
  }
}

// 详情页
async function openSongDetailById(songId) {
  try {
    const detailRes = await fetch(`http://localhost:3000/song/detail?ids=${songId}`);
    const detailJson = await detailRes.json();
    const song = (detailJson.songs && detailJson.songs[0]) || null;
    detailTitle.textContent = song ? song.name : '';
    detailArtist.textContent = song ? song.ar.map(a => a.name).join('/') : '';
    detailAlbum.textContent = song ? (song.al && song.al.name) : '';

    try {
      const coverRes = await fetch(`http://localhost:3000/song/dynamic/cover?id=${songId}`);
      const coverJson = await coverRes.json().catch(() => null);
      if (coverJson && coverJson.urls && coverJson.urls[0]) {
        dynamicCoverImg.src = coverJson.urls[0];
      } else if (song && song.al && song.al.picUrl) {
        dynamicCoverImg.src = song.al.picUrl;
      } else {
        dynamicCoverImg.src = '';
      }
    } catch (err) {
      if (song && song.al && song.al.picUrl) dynamicCoverImg.src = song.al.picUrl || '';
    }

    try {
      const lyricRes = await fetch(`http://localhost:3000/lyric?id=${songId}`);
      const lyricJson = await lyricRes.json();
      const lrc = lyricJson && (lyricJson.lrc && lyricJson.lrc.lyric) ? lyricJson.lrc.lyric : (lyricJson && lyricJson.lyric ? lyricJson.lyric : '');
      if (lrc) {
        renderLyrics(lrc);
      } else {
        renderLyrics('');
      }
    } catch (err) {
      renderLyrics('');
    }
    songDetailPage.style.display = 'block';
    const idNum = Number(songId);
    const indexInList = currentPlayList.findIndex(s => s.id === idNum);
    if (indexInList !== -1) {
      playSong(indexInList);
    } else if (song) {
      const tmp = {
        id: song.id,
        name: song.name,
        ar: song.ar,
        al: song.al,
        dt: song.dt
      };
      setPlayList([tmp]);
      playSong(0);
    }

  } catch (err) {
    console.error('打开播放详情失败：', err);
    alert('无法打开播放详情');
  }
}

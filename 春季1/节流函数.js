const throttle = function (fn, interval = 500) {
  let lastTime = 0;

  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};
window.onresize = throttle(function () {
  console.log(1);
}, 20);

const searchInput = document.querySelector('.search-input');
const searchList = document.querySelector('.search-list');

async function fetchCloudSearch(keyword) {
  if (!keyword || keyword.trim() === '') {
    searchList.innerHTML = '';
    searchList.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/cloudsearch?keywords=${encodeURIComponent(keyword.trim())}`);
    if (!response.ok) {
      throw new Error(`状态码 ${response.status}`);
    }

    const data = await response.json();
    const songs = data.result?.songs || [];

    if (songs.length === 0) {
      searchList.innerHTML = '<li class="no-result">未找到匹配歌曲</li>';
      searchList.style.display = 'block';
      return;
    }

    const fragment = document.createDocumentFragment();
    songs.slice(0, 10).forEach(song => {
      const li = document.createElement('li');
      const artists = (song.artists || []).map(a => a.name).join(' / ');
      const album = song.album?.name || '';
      li.textContent = `${song.name || '未知歌曲'} - ${artists} ${album ? `(${album})` : ''}`;
      li.addEventListener('click', () => {
        searchInput.value = song.name;
        searchList.style.display = 'none';
      });
      fragment.appendChild(li);
    });

    searchList.innerHTML = '';
    searchList.appendChild(fragment);
    searchList.style.display = 'block';
  } catch (error) {
    console.error('cloudsearch 请求失败：', error);
    searchList.innerHTML = '<li class="no-result">搜索失败，请检查服务是否启动</li>';
    searchList.style.display = 'block';
  }
}

const throttledSearch = throttle((event) => {
  fetchCloudSearch(event.target.value);
}, 400);

searchInput.addEventListener('input', throttledSearch);

searchInput.addEventListener('focus', () => {
  if (searchList.innerHTML === '') {
    fetchCloudSearch()
  }
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => {
    searchList.style.display = 'none';
  }, 200);
});

searchList.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    searchInput.value = e.target.textContent;
    searchList.style.display = 'none';
    fetchCloudSearch(e.target.textContent);
  }
});

window.addEventListener('click', (event) => {
  if (!event.target.closest('.search')) {
    searchList.style.display = 'none';
  }
});


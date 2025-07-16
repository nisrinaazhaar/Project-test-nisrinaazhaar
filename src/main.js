let currentPage = 1;
let perPage = 10;
let sort = '-published_at';

const postList = document.getElementById('post-list');
const pageIndicator = document.getElementById('pageIndicator');


const savedState = JSON.parse(localStorage.getItem('ideasState'));
if (savedState) {
  currentPage = savedState.currentPage;
  sort = savedState.sort;
  perPage = savedState.perPage;
  document.getElementById('sortSelect').value = sort;
  document.getElementById('perPageSelect').value = perPage;
}

const BASE_URL = 'https://suitmedia-backend.suitdev.com';

const fetchPosts = async () => {
  const url = `/api/ideas?page[number]=${currentPage}&page[size]=${perPage}&append[]=small_image&append[]=medium_image&sort=${sort}`;
  console.log('Fetching:', url);

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    renderPosts(json.data);

    localStorage.setItem('ideasState', JSON.stringify({
      currentPage,
      sort,
      perPage
    }));
  } catch (error) {
    postList.innerHTML = '<p style="padding:20px;">Gagal memuat data.</p>';
    console.error('Error fetching:', error);
  }
};


const renderPosts = (posts) => {
  postList.innerHTML = '';
  posts.forEach(post => {
    const imageUrl = Array.isArray(post.medium_image) && post.medium_image[0]?.url
      ? BASE_URL + post.medium_image[0].url
      : 'img/no-image.jpg';

    const title = post.title || 'Tanpa Judul';

    const card = document.createElement('div');
    card.classList.add('post-card');
    card.innerHTML = `
      <img src="${imageUrl}" loading="lazy" alt="${title}" 
           onerror="this.onerror=null;this.src='img/no-image.jpg';" />
      <h3>${title}</h3>
    `;
    postList.appendChild(card);
  });

  pageIndicator.textContent = `Page ${currentPage}`;
};

const fetchBanner = async () => {
  try {
    document.getElementById('bannerImage').style.backgroundImage = `url('background.png')`;
    document.getElementById('bannerTitle').textContent = 'Ideas';
    document.getElementById('bannerSubtitle').textContent = 'Where all our great things begin';
  } catch (err) {
    console.error('Error loading banner:', err);
  }
};

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPosts();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  currentPage++;
  fetchPosts();
});

document.getElementById('sortSelect').addEventListener('change', (e) => {
  sort = e.target.value;
  currentPage = 1;
  fetchPosts();
});

document.getElementById('perPageSelect').addEventListener('change', (e) => {
  perPage = parseInt(e.target.value);
  currentPage = 1;
  fetchPosts();
});

document.querySelectorAll('#site-header nav ul li').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('#site-header nav ul li').forEach(li => {
      li.classList.remove('active');
    });
    item.classList.add('active');

    const newTitle = item.getAttribute('data-title');
    const newSubtitle = item.getAttribute('data-subtitle');

    document.getElementById('bannerTitle').textContent = newTitle;
    document.getElementById('bannerSubtitle').textContent = newSubtitle;

    document.getElementById('mainNav').classList.remove('active');
  });
});

document.getElementById('menuToggle').addEventListener('click', () => {
  const nav = document.getElementById('mainNav');
  nav.classList.toggle('active');
});

let lastScroll = 0;
window.addEventListener('scroll', () => {
  const header = document.getElementById('site-header');
  const currentScroll = window.pageYOffset;

  if (currentScroll <= 0) {
    header.style.top = '0';
  } else if (currentScroll > lastScroll) {
    header.style.top = '-100px';
  } else {
    header.style.top = '0';
  }

  lastScroll = currentScroll;

  const bannerImage = document.getElementById('bannerImage');
  const bannerContent = document.getElementById('bannerContent');

  if (bannerImage && bannerContent) {
    bannerImage.style.transform = `translateY(${currentScroll * 0.3}px)`;
    bannerContent.style.transform = `translateY(${currentScroll * 0.15}px)`;
  }
});

fetchPosts();
fetchBanner();

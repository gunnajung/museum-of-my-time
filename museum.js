/* ===================================================
   내 시간의 박물관 / Museum of My Time — museum.js
   Static mode: reads ALBUMS + TEXT_POSTS from data.js
   =================================================== */

var lang = 0; // 0 = 한국어, 1 = English

function t(ko, en) { return lang === 0 ? ko : en; }

function toggleLang() {
  lang = 1 - lang;
  document.querySelector('.lang-btn').textContent = lang === 0 ? 'EN' : '한';
  renderAll();
}

/* ── Global lightbox/modal state ── */
var _lbImages  = [];
var _lbIndex   = 0;
var _modalImgs = [];

var MUSEUM_DESC_KO =
  '이 박물관은 2009년부터 2026년까지 페이스북에 기록된\n' +
  '사진과 이야기들로 구성된 개인 디지털 아카이브입니다.\n\n' +
  '한국과 미국을 오가며 살았던 시간들,\n' +
  '책과 함께한 순간들, 그리고 천천히 변해온 얼굴들.';

var MUSEUM_DESC_EN =
  'A personal digital archive composed of photographs\n' +
  'and stories recorded on Facebook, 2009 to 2026.\n\n' +
  'Time spent moving between Korea and America,\n' +
  'moments with books, and a face slowly changing.';

/* ── Themes ── */
var THEMES = [
  { key: 'abroad',     ko: '여행·해외',   en: 'International Travel',
    kw: ['미국', '오스틴', '텍사스', '레드랜즈', 'austin', 'texas', 'redlands', 'america', 'usa', '해외',
         'antelop', 'monument', 'yellowstone', 'san diego', 'las vegas', 'utah', 'seattle',
         'national park', 'loma linda', 'claremont', 'monterey', 'berkeley'] },
  { key: 'travel',     ko: '여행·국내',   en: 'Domestic Travel',
    kw: ['낙산', '방태산', '해수욕', '여행', '공원', '산행', '바다', '섬', '선감도', '제부도',
         'beach', 'mountain', 'park', '태안', '신두리', '분당', '율동', '우이령', '북한산',
         '내설악', '대청봉', '탄천', '성곽'] },
  { key: 'university', ko: '대학·학교',   en: 'University & School',
    kw: ['한신', '대학교', '대학', '학교', '개교', '졸업', '캠퍼스', 'university', 'school', '신일',
         '한사연', '특별활동'] },
  { key: 'event',      ko: '행사·모임',   en: 'Events & Gatherings',
    kw: ['기념식', '기념', '행사', '모임', '연구', '축제', '집회', '혁명', '화계사', '영결식',
         'anniversary', 'ceremony', 'event', '주년', '탐방', '리영희'] },
  { key: 'books',      ko: '책·독서',     en: 'Books & Reading',
    kw: ['책', '독서', '도서', 'book', 'reading', 'library', 'economic', 'wikipedia'] },
  { key: 'portrait',   ko: '초상·프로필', en: 'Portraits & Profiles',
    kw: ['profile', 'cover photo'] },
];

function inferTheme(album) {
  var text = (album.title + ' ' + album.desc).toLowerCase();
  for (var i = 0; i < THEMES.length; i++) {
    var th = THEMES[i];
    for (var j = 0; j < th.kw.length; j++) {
      if (text.indexOf(th.kw[j].toLowerCase()) !== -1) return th;
    }
  }
  return { key: 'daily', ko: '일상', en: 'Daily Life' };
}

/* ── HTML escaping ── */
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Lightbox ── */
function openLb(images, idx) {
  _lbImages = images;
  _lbIndex  = Math.max(0, Math.min(idx, images.length - 1));
  showLbFrame();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLb() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
function lbPrev() { _lbIndex = (_lbIndex - 1 + _lbImages.length) % _lbImages.length; showLbFrame(); }
function lbNext() { _lbIndex = (_lbIndex + 1) % _lbImages.length; showLbFrame(); }
function showLbFrame() {
  var item = _lbImages[_lbIndex] || {};
  document.getElementById('lb-img').src             = item.src     || '';
  document.getElementById('lb-caption').textContent = item.caption || '';
  document.getElementById('lb-counter').textContent =
    _lbImages.length > 1 ? (_lbIndex + 1) + ' / ' + _lbImages.length : '';
  var multi = _lbImages.length > 1;
  document.querySelector('.lb-prev').style.display = multi ? '' : 'none';
  document.querySelector('.lb-next').style.display = multi ? '' : 'none';
}
function openLbFromModal(idx) { openLb(_modalImgs, idx); }

/* ── Album modal ── */
function openAlbumModal(albumIdx) {
  var a = ALBUMS[albumIdx];
  if (!a) return;

  _modalImgs = a.photos.map(function(p) {
    return { src: p.src, caption: p.caption || p.date || '' };
  });

  var th = inferTheme(a);
  document.getElementById('modal-theme-label').textContent = t(th.ko, th.en);
  document.getElementById('modal-title').textContent       = a.title;
  document.getElementById('modal-desc').textContent        = a.desc;
  document.getElementById('modal-meta').textContent        = (a.photos[0] && a.photos[0].date) ? a.photos[0].date : '';

  document.getElementById('modal-grid').innerHTML = a.photos.map(function(p, i) {
    return '<div class="modal-photo" onclick="openLbFromModal(' + i + ')">' +
           '<div class="modal-photo-img">' +
           '<img src="' + p.src + '" loading="lazy" ' +
           'onerror="this.parentElement.parentElement.style.opacity=\'0.15\'" alt="">' +
           '</div>' +
           (p.caption ? '<p class="modal-caption-text">' + esc(p.caption) + '</p>' : '') +
           '</div>';
  }).join('');

  document.getElementById('album-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAlbumModal() {
  document.getElementById('album-modal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Photo-post modal ── */
function openPhotoPostModal(idx) {
  var pp = (typeof PHOTO_POSTS !== 'undefined') && PHOTO_POSTS[idx];
  if (!pp) return;

  _modalImgs = pp.photos.map(function(p) {
    return { src: p.src, caption: p.caption || '' };
  });

  document.getElementById('modal-theme-label').textContent = t('포스트 사진', 'Post Photos');
  document.getElementById('modal-title').textContent       = pp.date;
  document.getElementById('modal-desc').textContent        = pp.text || '';
  document.getElementById('modal-meta').textContent        = pp.photos.length > 1
    ? pp.photos.length + t('장의 사진', ' photos') : '';

  document.getElementById('modal-grid').innerHTML = pp.photos.map(function(p, i) {
    return '<div class="modal-photo" onclick="openLbFromModal(' + i + ')">' +
           '<div class="modal-photo-img">' +
           '<img src="' + p.src + '" loading="lazy" ' +
           'onerror="this.parentElement.parentElement.style.opacity=\'0.15\'" alt="">' +
           '</div>' +
           (p.caption ? '<p class="modal-caption-text">' + esc(p.caption) + '</p>' : '') +
           '</div>';
  }).join('');

  document.getElementById('album-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── Text post modal ── */
function openPostModal(postIdx) {
  if (!TEXT_POSTS || !TEXT_POSTS[postIdx]) return;
  var p = TEXT_POSTS[postIdx];
  document.getElementById('modal-theme-label').textContent = t('텍스트 포스트', 'Text Post');
  document.getElementById('modal-title').textContent       = p.date;
  document.getElementById('modal-desc').textContent        = p.text;
  document.getElementById('modal-meta').textContent        = '';
  document.getElementById('modal-grid').innerHTML          = '';
  document.getElementById('album-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── Keyboard shortcuts ── */
document.addEventListener('keydown', function(e) {
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  lbPrev();
    if (e.key === 'ArrowRight') lbNext();
    return;
  }
  if (document.getElementById('album-modal').classList.contains('open')) {
    if (e.key === 'Escape') closeAlbumModal();
  }
});

/* ── Group albums by year then theme ── */
function organizeByYear(albums) {
  var map = {};
  albums.forEach(function(a, i) {
    a.idx = i;
    var y = a.year || 9999;
    if (!map[y]) map[y] = [];
    map[y].push(a);
  });
  return Object.keys(map)
    .map(Number).sort(function(a, b) { return a - b; })
    .map(function(y) { return { year: y, albums: map[y] }; });
}

function groupByTheme(albums) {
  var map = {}, order = [];
  albums.forEach(function(a) {
    var th = inferTheme(a);
    if (!map[th.key]) { map[th.key] = { theme: th, albums: [] }; order.push(th.key); }
    map[th.key].albums.push(a);
  });
  return order.map(function(k) { return map[k]; });
}

/* ── Photo-post card ── */
function renderPhotoPostCard(pp, idx) {
  var thumb = pp.photos[0].src;
  var count = pp.photos.length;
  var badge = count > 1 ? '<span class="album-card-count">' + count + '</span>' : '';
  var preview = pp.text
    ? '<p class="album-card-caption">' + esc(pp.text.slice(0, 160)) + (pp.text.length > 160 ? '…' : '') + '</p>'
    : '';
  return '<div class="album-card" onclick="openPhotoPostModal(' + idx + ')">' +
    '<div class="album-card-thumb">' +
    '<img src="' + thumb + '" loading="lazy" onerror="this.style.opacity=\'0\'" alt="">' +
    badge + '</div>' +
    '<div class="album-card-info">' +
    '<p class="album-card-date">' + esc(pp.date) + '</p>' +
    preview +
    '</div></div>';
}

/* ── Album card ── */
function renderAlbumCard(a) {
  var thumb = a.photos[0].src;
  var count = a.photos.length;
  var badge = count > 1 ? '<span class="album-card-count">' + count + '</span>' : '';
  var date  = (a.photos[0] && a.photos[0].date) ? a.photos[0].date : '';

  /* show first non-empty caption as preview */
  var preview = '';
  for (var i = 0; i < a.photos.length; i++) {
    if (a.photos[i].caption) { preview = a.photos[i].caption; break; }
  }
  var captionHtml = (a.desc || preview)
    ? '<p class="album-card-caption">' + esc(a.desc || preview) + '</p>'
    : '';

  return '<div class="album-card" onclick="openAlbumModal(' + a.idx + ')">' +
    '<div class="album-card-thumb">' +
    '<img src="' + thumb + '" loading="lazy" onerror="this.style.opacity=\'0\'" alt="">' +
    badge + '</div>' +
    '<div class="album-card-info">' +
    '<p class="album-card-title">' + esc(a.title) + '</p>' +
    '<p class="album-card-date">'  + esc(date)    + '</p>' +
    captionHtml +
    '</div></div>';
}

/* ── Text post card ── */
function renderPostCard(p, pidx) {
  return '<div class="post-card" onclick="openPostModal(' + pidx + ')">' +
    '<p class="post-card-date">' + esc(p.date) + '</p>' +
    '<p class="post-card-text">' + esc(p.text.slice(0, 200)) + (p.text.length > 200 ? '…' : '') + '</p>' +
    '</div>';
}

/* ── Year nav pills ── */
function renderYearNav(byYear) {
  var bar = document.getElementById('year-nav-bar');
  if (!bar) return;
  bar.innerHTML = byYear.map(function(yg) {
    var label = yg.year === 9999 ? t('연도 미상', 'Unknown') : yg.year;
    return '<a class="year-pill" href="#year-' + yg.year + '">' + label + '</a>';
  }).join('');
}

/* ── Full render ── */
function renderAll() {
  var desc = document.getElementById('entrance-desc');
  var btn  = document.getElementById('enter-btn');
  if (desc) desc.textContent = lang === 0 ? MUSEUM_DESC_KO : MUSEUM_DESC_EN;
  if (btn)  btn.textContent  = t('전시실 입장', 'Enter Exhibition');

  /* Collect all years from all three data sources */
  var allYears = {};
  function ensureYear(y) { if (!allYears[y]) allYears[y] = { albums: [], photoPosts: [], textPosts: [] }; }

  ALBUMS.forEach(function(a, i) {
    a.idx = i;
    var y = a.year || 9999;
    ensureYear(y);
    allYears[y].albums.push(a);
  });

  if (typeof PHOTO_POSTS !== 'undefined') {
    PHOTO_POSTS.forEach(function(pp, i) {
      var y = pp.year || 9999;
      ensureYear(y);
      allYears[y].photoPosts.push({ pp: pp, idx: i });
    });
  }

  if (typeof TEXT_POSTS !== 'undefined') {
    TEXT_POSTS.forEach(function(p, i) {
      var y = p.year || 9999;
      ensureYear(y);
      allYears[y].textPosts.push({ p: p, idx: i });
    });
  }

  var sortedYears = Object.keys(allYears).map(Number).sort(function(a, b) { return a - b; });

  /* Year nav */
  var bar = document.getElementById('year-nav-bar');
  if (bar) {
    bar.innerHTML = sortedYears.map(function(y) {
      var label = y === 9999 ? t('연도 미상', 'Unknown') : y;
      return '<a class="year-pill" href="#year-' + y + '">' + label + '</a>';
    }).join('');
  }

  var html = sortedYears.map(function(y) {
    var ydata  = allYears[y];
    var yLabel = y === 9999 ? t('연도 미상', 'Unknown Year') : y;

    /* Named albums by theme */
    var grouped    = groupByTheme(ydata.albums);
    var multi      = grouped.length > 1;
    var albumsHtml = grouped.map(function(tg) {
      var tlabel = multi
        ? '<p class="theme-label">' + t(tg.theme.ko, tg.theme.en) + '</p>' : '';
      return '<div class="theme-group">' + tlabel +
             '<div class="album-grid">' + tg.albums.map(renderAlbumCard).join('') + '</div></div>';
    }).join('');

    /* Photo posts */
    var photoPostHtml = '';
    if (ydata.photoPosts.length) {
      var cards = ydata.photoPosts.map(function(item) {
        return renderPhotoPostCard(item.pp, item.idx);
      }).join('');
      photoPostHtml = '<div class="theme-group">' +
        '<p class="theme-label">' + t('사진·포스트', 'Photo Posts') + '</p>' +
        '<div class="album-grid">' + cards + '</div></div>';
    }

    /* Text posts */
    var postsHtml = '';
    if (ydata.textPosts.length) {
      var tcards = ydata.textPosts.map(function(item) {
        return renderPostCard(item.p, item.idx);
      }).join('');
      postsHtml = '<div class="theme-group">' +
        '<p class="theme-label">' + t('글·포스트', 'Posts & Updates') + '</p>' +
        '<div class="post-grid">' + tcards + '</div></div>';
    }

    var total = ydata.albums.length + ydata.photoPosts.length + ydata.textPosts.length;
    var countLabel = total + t('개 기록', ' records');

    return '<section class="year-section" id="year-' + y + '">' +
      '<div class="year-header">' +
      '<h2 class="year-title">' + yLabel + '</h2>' +
      '<p class="year-count">' + countLabel + '</p>' +
      '</div>' + albumsHtml + photoPostHtml + postsHtml + '</section>';
  }).join('');

  html += '<footer class="museum-footer">' +
    '<p>내 시간의 박물관 &nbsp;&middot;&nbsp; Museum of My Time</p>' +
    '<p>GunnaJung &nbsp;&middot;&nbsp; 2009 – 2026 &nbsp;&middot;&nbsp; Facebook Archive</p>' +
    '</footer>';

  var content = document.getElementById('content');
  content.innerHTML = html;
  content.style.display = 'block';
}

/* ── Active year pill on scroll ── */
window.addEventListener('scroll', function() {
  var y   = window.scrollY + 80;
  var cur = null;
  document.querySelectorAll('.year-section').forEach(function(sec) {
    if (sec.offsetTop <= y) cur = sec.id;
  });
  document.querySelectorAll('.year-pill').forEach(function(pill) {
    pill.classList.toggle('active', pill.getAttribute('href') === '#' + cur);
  });
}, { passive: true });

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function() {
  /* Render entrance text immediately */
  var desc = document.getElementById('entrance-desc');
  var btn  = document.getElementById('enter-btn');
  if (desc) desc.textContent = lang === 0 ? MUSEUM_DESC_KO : MUSEUM_DESC_EN;
  if (btn)  btn.textContent  = t('전시실 입장', 'Enter Exhibition');

  /* Pre-render content (data is already in memory from data.js) */
  renderAll();

  /* Enter button: hide entrance, scroll to content */
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('entrance').style.display = 'none';
      document.getElementById('content').scrollIntoView({ behavior: 'smooth' });
    });
  }
});

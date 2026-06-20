(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('open');
    });
  }

  var slider = document.querySelector('.hero-slider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var forms = Array.prototype.slice.call(document.querySelectorAll('.search-form'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
  var movieCards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var activeFilter = '全部';

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function setQuery(value) {
    searchInputs.forEach(function (input) {
      input.value = value;
    });
  }

  function applyFilters() {
    var query = '';
    if (searchInputs.length) {
      query = searchInputs[0].value.trim().toLowerCase();
    }

    movieCards.forEach(function (card) {
      var searchable = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      var kind = card.getAttribute('data-kind') || '';
      var bySearch = !query || searchable.indexOf(query) !== -1;
      var byFilter = activeFilter === '全部' || kind.indexOf(activeFilter) !== -1 || searchable.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('hidden-by-search', !bySearch);
      card.classList.toggle('hidden-by-filter', !byFilter);
    });
  }

  if (searchInputs.length) {
    setQuery(readQuery());
    searchInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        setQuery(input.value);
        applyFilters();
      });
    });
    applyFilters();
  }

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      if (form.hasAttribute('data-local-search')) {
        event.preventDefault();
        applyFilters();
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.filter-pill')).forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.parentElement;
      activeFilter = button.getAttribute('data-filter') || '全部';
      if (group) {
        Array.prototype.slice.call(group.querySelectorAll('.filter-pill')).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
      }
      applyFilters();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var startButton = shell.querySelector('.player-start');
    var videoUrl = shell.getAttribute('data-video-url');
    var initialized = false;
    var hls = null;

    function prepare() {
      if (!video || !videoUrl || initialized) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function start() {
      prepare();
      if (!video) {
        return;
      }
      shell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (startButton) {
      startButton.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!initialized || video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  });
})();

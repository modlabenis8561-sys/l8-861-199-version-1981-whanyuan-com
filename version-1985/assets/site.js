(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }

      current = (next + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var searchInput = panel.querySelector('[data-filter-search]');
    var genreSelect = panel.querySelector('[data-filter-genre]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var noMatch = scope.querySelector('[data-no-match]');

    var matches = function (card) {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var genre = genreSelect ? genreSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (genre && (card.getAttribute('data-genre') || '') !== genre) {
        return false;
      }

      if (year && (card.getAttribute('data-year') || '') !== year) {
        return false;
      }

      if (region && (card.getAttribute('data-region') || '') !== region) {
        return false;
      }

      return true;
    };

    var applyFilters = function () {
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (noMatch) {
        noMatch.classList.toggle('show', visible === 0);
      }
    };

    [searchInput, genreSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });

  var video = document.querySelector('[data-video-player]');
  var playButton = document.querySelector('[data-play-button]');
  var overlay = document.querySelector('[data-player-overlay]');

  if (video && playButton) {
    var isReady = false;

    var attachStream = function () {
      return new Promise(function (resolve) {
        if (isReady) {
          resolve();
          return;
        }

        var streamUrl = video.getAttribute('data-video-url');

        if (!streamUrl) {
          resolve();
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          isReady = true;
          resolve();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            isReady = true;
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              video.src = streamUrl;
              isReady = true;
              resolve();
            }
          });
          window.setTimeout(function () {
            if (!isReady) {
              isReady = true;
              resolve();
            }
          }, 900);
          return;
        }

        video.src = streamUrl;
        isReady = true;
        resolve();
      });
    };

    var start = function () {
      attachStream().then(function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }

        var result = video.play();

        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      });
    };

    playButton.addEventListener('click', start);
    overlay && overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        start();
      }
    });
  }
})();

(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.hidden = !menu.hidden;
    });
  }

  function initHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      slides[index].classList.remove('active');
      if (dots[index]) {
        dots[index].classList.remove('active');
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) {
        dots[index].classList.add('active');
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initSearch() {
    var input = document.querySelector('[data-movie-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
    if (!input && buttons.length === 0) {
      return;
    }
    var currentCategory = '全部';
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var matchText = !query || haystack.indexOf(query) !== -1;
        var matchCategory = currentCategory === '全部' || category === currentCategory;
        card.classList.toggle('hidden-by-filter', !(matchText && matchCategory));
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentCategory = button.getAttribute('data-filter') || '全部';
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        apply();
      });
    });
  }

  function initPlayer() {
    var player = document.querySelector('.player-shell');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var button = player.querySelector('.player-button');
    var url = player.getAttribute('data-video-url');
    var hlsInstance = null;
    if (!video || !url) {
      return;
    }
    function attachVideo() {
      if (video.dataset.ready === '1') {
        return;
      }
      video.dataset.ready = '1';
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    function start() {
      attachVideo();
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();

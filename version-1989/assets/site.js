(function () {
  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot"));
        activate(next);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var container = panel.parentElement;
      if (!container) {
        return;
      }
      var input = panel.querySelector("[data-search-input]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
      if (!cards.length) {
        return;
      }

      function applyFilter() {
        var query = normalizeText(input && input.value);
        var year = normalizeText(yearSelect && yearSelect.value);
        var type = normalizeText(typeSelect && typeSelect.value);
        cards.forEach(function (card) {
          var haystack = normalizeText([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var yearValue = normalizeText(card.getAttribute("data-year"));
          var typeValue = normalizeText(card.getAttribute("data-type"));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchYear = !year || yearValue.indexOf(year) !== -1;
          var matchType = !type || typeValue.indexOf(type) !== -1;
          card.classList.toggle("is-filter-hidden", !(matchQuery && matchYear && matchType));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", applyFilter);
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
        applyFilter();
      }
    });
  }

  function startPlayback(video, sourceUrl, overlay) {
    if (!video || video.getAttribute("data-player-ready") === "1") {
      if (video) {
        var existingPlay = video.play();
        if (existingPlay && existingPlay.catch) {
          existingPlay.catch(function () {});
        }
      }
      return;
    }
    video.setAttribute("data-player-ready", "1");
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }

  window.initializePlayer = function (videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var frame = video.closest(".player-frame");
    var overlay = frame ? frame.querySelector("[data-play-overlay]") : null;
    if (overlay) {
      overlay.addEventListener("click", function () {
        startPlayback(video, sourceUrl, overlay);
      });
    }
    video.addEventListener("click", function () {
      startPlayback(video, sourceUrl, overlay);
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
  });
})();

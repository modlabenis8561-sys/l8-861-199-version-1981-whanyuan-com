document.addEventListener("error", function (event) {
  var target = event.target;
  if (!target || target.tagName !== "IMG") {
    return;
  }
  var shell = target.closest(".visual-shell");
  if (shell) {
    shell.classList.add("visual-soft");
  }
}, true);

(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }
})();

(function () {
  var carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) {
    return;
  }

  var slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  var dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  var index = 0;
  var timer = null;

  function show(nextIndex) {
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
      show(index + 1);
    }, 5600);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  start();
})();

(function () {
  var forms = Array.from(document.querySelectorAll("[data-filter-form]"));

  forms.forEach(function (form) {
    var input = form.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]") || document;
    var cards = Array.from(list.querySelectorAll(".searchable-card"));

    if (!input || cards.length === 0) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
      input.value = q;
      filter(q);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      filter(input.value);
    });

    input.addEventListener("input", function () {
      filter(input.value);
    });

    function filter(value) {
      var term = String(value || "").trim().toLowerCase();
      cards.forEach(function (card) {
        var content = String(card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-hidden", term.length > 0 && content.indexOf(term) === -1);
      });
    }
  });
})();

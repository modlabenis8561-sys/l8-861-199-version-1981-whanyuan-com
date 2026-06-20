document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startHeroTimer();
        });
    });

    if (previous) {
        previous.addEventListener("click", function () {
            showSlide(currentSlide - 1);
            startHeroTimer();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(currentSlide + 1);
            startHeroTimer();
        });
    }

    showSlide(0);
    startHeroTimer();

    var filterInput = document.querySelector("[data-filter-input]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function filterMovies() {
        if (!filterInput || !filterCards.length) {
            return;
        }

        var query = normalize(filterInput.value);
        var visible = 0;

        filterCards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-filter-text") || card.textContent);
            var matched = !query || text.indexOf(query) !== -1;
            card.classList.toggle("is-filtered", !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (filterInput) {
        filterInput.addEventListener("input", filterMovies);
        filterMovies();
    }
});

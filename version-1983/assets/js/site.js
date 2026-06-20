(function () {
    const toggle = document.querySelector(".mobile-toggle");
    const panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            const isHidden = panel.hasAttribute("hidden");
            if (isHidden) {
                panel.removeAttribute("hidden");
                toggle.setAttribute("aria-expanded", "true");
            } else {
                panel.setAttribute("hidden", "");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dots button"));
    let slideIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle("is-active", current === slideIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle("is-active", current === slideIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5200);
    }

    const grid = document.getElementById("movieGrid");
    const searchInput = document.getElementById("pageSearch");
    const emptyState = document.querySelector(".empty-state");
    const chips = Array.from(document.querySelectorAll(".filter-chip"));
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    let activeFilter = "all";

    if (searchInput && query) {
        searchInput.value = query;
    }

    function cardText(card) {
        return [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.year,
            card.dataset.tags,
            card.textContent
        ].join(" ").toLowerCase();
    }

    function applyFilters() {
        if (!grid) {
            return;
        }
        const cards = Array.from(grid.querySelectorAll(".movie-card"));
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        let visible = 0;

        cards.forEach(function (card) {
            const text = cardText(card);
            const matchesKeyword = !keyword || text.includes(keyword);
            const matchesFilter = activeFilter === "all" || text.includes(activeFilter.toLowerCase());
            const shouldShow = matchesKeyword && matchesFilter;
            card.hidden = !shouldShow;
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (searchInput && grid) {
        searchInput.addEventListener("input", applyFilters);
        applyFilters();
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (item) {
                item.classList.remove("is-active");
            });
            chip.classList.add("is-active");
            activeFilter = chip.dataset.filter || "all";
            applyFilters();
        });
    });

    const video = document.querySelector(".js-player-video");
    const overlay = document.querySelector(".js-player-overlay");
    const playUrl = window.__PLAY_URL__;
    let playerReady = false;
    let hlsInstance = null;

    function attachPlayer() {
        if (!video || !playUrl || playerReady) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 30,
                capLevelToPlayerSize: true
            });
            hlsInstance.loadSource(playUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = playUrl;
        }

        playerReady = true;
    }

    function startPlayer() {
        attachPlayer();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        if (video) {
            video.play().catch(function () {});
        }
    }

    if (overlay && video) {
        overlay.addEventListener("click", startPlayer);
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
})();

(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobilePanel.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 6500);
        }
    }

    document.querySelectorAll(".filter-panel").forEach(function (panel) {
        var input = panel.querySelector("[data-search-input]");
        var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
        var container = panel.parentElement;
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
        var activeFilter = "all";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : "");
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
                var filterText = normalize(activeFilter);
                var queryMatch = !query || haystack.indexOf(query) !== -1;
                var filterMatch = activeFilter === "all" || haystack.indexOf(filterText) !== -1;
                card.classList.toggle("hidden-by-filter", !(queryMatch && filterMatch));
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                applyFilter();
            });
        });
    });

    document.querySelectorAll(".movie-player").forEach(function (player) {
        var video = player.querySelector("video");
        var playButton = player.querySelector(".player-play");
        var stream = player.getAttribute("data-stream");
        var ready = false;
        var hlsInstance = null;

        function startVideo() {
            if (!video || !stream) {
                return;
            }

            if (!ready) {
                ready = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }

            player.classList.add("is-playing");
        }

        if (playButton) {
            playButton.addEventListener("click", startVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!ready || video.paused) {
                    startVideo();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0) {
                    player.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();

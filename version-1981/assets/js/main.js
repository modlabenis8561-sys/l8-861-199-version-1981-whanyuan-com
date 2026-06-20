(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6500);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var form = document.querySelector("[data-filter-form]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!form || !cards.length) {
            return;
        }

        var keywordInput = form.querySelector("[data-filter-keyword]");
        var yearSelect = form.querySelector("[data-filter-year]");
        var typeSelect = form.querySelector("[data-filter-type]");
        var resetButton = form.querySelector("[data-filter-reset]");
        var count = document.querySelector("[data-filter-count]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query && keywordInput) {
            keywordInput.value = query;
        }

        function cardText(card) {
            return normalize([
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.type,
                card.textContent
            ].join(" "));
        }

        function applyFilter() {
            var keyword = normalize(keywordInput ? keywordInput.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = cardText(card);
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || normalize(card.dataset.year) === year;
                var matchesType = !type || normalize(card.dataset.type) === type;
                var shouldShow = matchesKeyword && matchesYear && matchesType;
                card.classList.toggle("is-hidden", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = "当前显示 " + visible + " 部 / 共 " + cards.length + " 部";
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener("input", applyFilter);
            element.addEventListener("change", applyFilter);
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (keywordInput) {
                    keywordInput.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                applyFilter();
            });
        }

        form.addEventListener("submit", function (event) {
            if (window.location.pathname.endsWith("movies.html")) {
                event.preventDefault();
                applyFilter();
            }
        });

        applyFilter();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var button = player.querySelector("[data-play-button]");
            var video = player.querySelector("video");
            var message = player.querySelector("[data-player-message]");
            var source = player.dataset.m3u8;
            var initialized = false;

            if (!button || !video || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function startNative() {
                video.src = source;
                video.play().catch(function () {
                    setMessage("浏览器阻止了自动播放，请再次点击视频播放按钮。");
                });
            }

            function startHls() {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        setMessage("播放源已加载，请点击视频控件继续播放。");
                    });
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("播放源加载失败，可刷新页面后重试。");
                    }
                });
            }

            button.addEventListener("click", function () {
                button.classList.add("is-hidden");
                setMessage("正在初始化播放源…");
                if (initialized) {
                    video.play();
                    return;
                }
                initialized = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    startNative();
                } else if (window.Hls && Hls.isSupported()) {
                    startHls();
                } else {
                    startNative();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initFilters();
        initPlayers();
    });
})();

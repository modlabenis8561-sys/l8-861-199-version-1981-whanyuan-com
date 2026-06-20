function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playButton");
    var hasLoaded = false;
    var hlsInstance = null;

    if (!video || !button || !sourceUrl) {
        return;
    }

    function loadSource() {
        if (hasLoaded) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }

        hasLoaded = true;
    }

    function beginPlayback() {
        loadSource();
        button.classList.add("is-hidden");
        video.controls = true;

        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", beginPlayback);

    video.addEventListener("click", function () {
        if (video.paused) {
            beginPlayback();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

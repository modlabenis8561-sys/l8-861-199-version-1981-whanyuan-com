import { H as Hls } from "./hls-vendor.js";

var players = Array.from(document.querySelectorAll(".watch-player[data-stream]"));

players.forEach(function (video) {
  var frame = video.closest(".player-frame");
  var button = frame ? frame.querySelector(".player-cover") : null;
  var stream = video.getAttribute("data-stream");
  var prepared = false;
  var hls = null;

  function prepare() {
    if (prepared || !stream) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    }
  }

  function play() {
    prepare();
    if (frame) {
      frame.classList.add("is-playing");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (frame) {
          frame.classList.remove("is-playing");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (frame) {
      frame.classList.add("is-playing");
    }
  });

  video.addEventListener("pause", function () {
    if (frame && video.currentTime === 0) {
      frame.classList.remove("is-playing");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});

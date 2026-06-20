(() => {
  const video = document.querySelector("[data-video]");
  const mask = document.querySelector("[data-player-mask]");
  const playButton = document.querySelector("[data-player-button]");
  const message = document.querySelector("[data-player-message]");

  if (!video || typeof movieStreamUrl !== "string") {
    return;
  }

  let attached = false;
  let hlsInstance = null;

  const showMessage = (text) => {
    if (message) {
      message.textContent = text;
    }
  };

  const startVideo = () => {
    if (mask) {
      mask.classList.add("is-hidden");
    }

    if (!attached) {
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = movieStreamUrl;
        video.play().catch(() => showMessage("点击视频继续播放"));
      } else if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(movieStreamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => showMessage("点击视频继续播放"));
        });
        hlsInstance.on(Hls.Events.ERROR, () => {
          showMessage("视频暂时无法加载");
        });
        video.play().catch(() => {});
      } else {
        video.src = movieStreamUrl;
        video.play().catch(() => showMessage("点击视频继续播放"));
      }
    } else {
      video.play().catch(() => showMessage("点击视频继续播放"));
    }
  };

  if (playButton) {
    playButton.addEventListener("click", (event) => {
      event.stopPropagation();
      startVideo();
    });
  }

  if (mask) {
    mask.addEventListener("click", startVideo);
  }

  video.addEventListener("click", () => {
    if (video.paused) {
      startVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", () => {
    if (mask) {
      mask.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();

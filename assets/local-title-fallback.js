(function () {
  const text = "VesperaXylos";
  const groups = ["Ves", "pera", "Xyl", "os"];
  const sources = [
    "assets/cube_octopuss_1138x640.mp4",
    "assets/230125_FinSci_Mobile1X.mp4",
    "assets/Stars_1280x232.mp4",
    "assets/LiquidColor_1280x232.mp4",
    "assets/Moon_1280x232.mp4",
    "assets/Lightshow_1280x232.mp4",
  ];

  function domReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  domReady(() => {
    const hero = document.querySelector(".hero-copy");
    const canvas = document.querySelector(".hero-local-title-canvas");
    if (!hero || !canvas) return;

    let cleanup = null;
    let started = false;

    const hasPrimaryTitle = () => (
      hero.classList.contains("webgl-title-ready")
      || hero.classList.contains("mobile-title-ready")
    );

    const isPrimaryLoading = () => (
      hero.classList.contains("webgl-title-loading")
      || hero.classList.contains("mobile-title-loading")
    );

    const stopFallback = () => {
      hero.classList.remove("local-title-ready");
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    };

    const observer = new MutationObserver(() => {
      if (hasPrimaryTitle()) stopFallback();
    });
    observer.observe(hero, { attributes: true, attributeFilter: ["class"] });

    const tryStart = () => {
      if (started || hasPrimaryTitle()) return;

      if (isPrimaryLoading()) {
        window.setTimeout(tryStart, 900);
        return;
      }

      started = true;
      hero.classList.remove("title-fallback-visible");
      hero.classList.add("local-title-ready");
      cleanup = renderVideoText(canvas);
    };

    window.setTimeout(tryStart, window.location.protocol === "file:" ? 220 : 1500);
  });

  function renderVideoText(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    const bufferCanvas = document.createElement("canvas");
    const bufferCtx = bufferCanvas.getContext("2d");
    if (!maskCtx || !bufferCtx) return null;

    let width = 1;
    let height = 1;
    let ratio = 1;
    let animationFrame = 0;
    let fontSize = 120;
    let metrics = [];
    let textX = 0;
    let textY = 0;
    let disposed = false;

    const videos = sources.map((source) => {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = "metadata";
      video.src = source;
      video.play().catch(() => {
        window.addEventListener("pointerdown", () => video.play().catch(() => {}), { once: true });
      });
      return video;
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      bufferCanvas.width = canvas.width;
      bufferCanvas.height = canvas.height;

      fontSize = Math.min(height * 0.82, width / (text.length * 0.52));
      const font = `950 ${fontSize * ratio}px Inter, Arial, sans-serif`;
      ctx.font = font;
      maskCtx.font = font;

      const widths = groups.map((group) => maskCtx.measureText(group).width);
      const total = widths.reduce((sum, groupWidth) => sum + groupWidth, 0);
      textX = (canvas.width - total) / 2;
      textY = canvas.height / 2 + fontSize * ratio * 0.32;

      let cursor = textX;
      metrics = groups.map((group, index) => {
        const groupWidth = widths[index];
        const metric = { group, x: cursor, width: groupWidth };
        cursor += groupWidth;
        return metric;
      });
    };

    const drawVideoCover = (targetCtx, video, x, y, w, h, drift) => {
      if (video.readyState < 2) {
        const fallback = targetCtx.createLinearGradient(x, y, x + w, y + h);
        fallback.addColorStop(0, "#6db735");
        fallback.addColorStop(0.5, "#263f44");
        fallback.addColorStop(1, "#2447d8");
        targetCtx.fillStyle = fallback;
        targetCtx.fillRect(x, y, w, h);
        return;
      }

      const vw = video.videoWidth || 16;
      const vh = video.videoHeight || 9;
      const scale = Math.max(w / vw, h / vh);
      const sw = w / scale;
      const sh = h / scale;
      const sx = Math.max(0, (vw - sw) * (0.5 + Math.sin(drift) * 0.12));
      const sy = Math.max(0, (vh - sh) * (0.5 + Math.cos(drift * 0.7) * 0.1));
      targetCtx.drawImage(video, sx, sy, sw, sh, x, y, w, h);
    };

    const draw = (time) => {
      if (disposed) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.font = `950 ${fontSize * ratio}px Inter, Arial, sans-serif`;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "rgba(5, 5, 5, 0.09)";
      ctx.fillText(text, textX + 5 * ratio, textY + 6 * ratio);
      ctx.restore();

      metrics.forEach((metric, index) => {
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

        const pad = 18 * ratio;
        const x = Math.max(0, metric.x - pad);
        const w = Math.min(canvas.width - x, metric.width + pad * 2);
        drawVideoCover(bufferCtx, videos[index % videos.length], x, 0, w, canvas.height, time * 0.00045 + index);

        maskCtx.save();
        maskCtx.font = `950 ${fontSize * ratio}px Inter, Arial, sans-serif`;
        maskCtx.textBaseline = "alphabetic";
        maskCtx.fillStyle = "#fff";
        maskCtx.fillText(metric.group, metric.x, textY);
        maskCtx.restore();

        bufferCtx.globalCompositeOperation = "destination-in";
        bufferCtx.drawImage(maskCanvas, 0, 0);
        bufferCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(bufferCanvas, 0, 0);
      });

      ctx.save();
      ctx.font = `950 ${fontSize * ratio}px Inter, Arial, sans-serif`;
      ctx.textBaseline = "alphabetic";
      ctx.lineWidth = Math.max(1, 1.2 * ratio);
      ctx.strokeStyle = "rgba(5, 5, 5, 0.08)";
      ctx.strokeText(text, textX, textY);
      ctx.restore();

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
    };
  }
})();

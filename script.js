import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import { FontLoader } from "https://unpkg.com/three@0.165.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://unpkg.com/three@0.165.0/examples/jsm/geometries/TextGeometry.js";

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const heroCopy = document.querySelector(".hero-copy");
const titleStage = document.querySelector(".hero-title-stage");

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileQuery = window.matchMedia("(max-width: 760px)");
const titleVideoSources = [
  "assets/cube_octopuss_1138x640.mp4",
  "assets/230125_FinSci_Mobile1X.mp4",
  "assets/Stars_1280x232.mp4",
  "assets/LiquidColor_1280x232.mp4",
  "assets/Moon_1280x232.mp4",
  "assets/Lightshow_1280x232.mp4",
  "assets/Trapeze_1280x232.mp4",
  "assets/Piano_1280x232.mp4",
  "assets/Octopuss_1280x232.mp4",
  "assets/MMs_1280x232.mp4",
];

initHyperText();
initMorphingText();
initSignalVideoLoop();
initTypingAnimations();
initDottedMaps();
initTerminalPanels();
initScrollReveal();

if (titleStage && !mobileQuery.matches && !prefersReducedMotion.matches) {
  initExtrudedTitle(titleStage, "VesperaXylos").catch((error) => {
    console.error(error);
    heroCopy.classList.remove("webgl-title-ready");
  });
}

function initHyperText() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789∑ΔλΞ";
  const targets = [...document.querySelectorAll("[data-hyper-text]")];
  if (!targets.length || prefersReducedMotion.matches) return;

  targets.forEach((target, index) => {
    const finalText = target.textContent.trim();
    target.dataset.finalText = finalText;
    target.tabIndex = 0;

    const play = () => scrambleText(target, finalText, letters);
    target.addEventListener("mouseenter", play);
    target.addEventListener("focus", play);

    window.setTimeout(play, 520 + index * 170);
  });
}

function scrambleText(target, finalText, alphabet) {
  if (target.dataset.scrambling === "true") return;
  target.dataset.scrambling = "true";
  target.classList.add("is-scrambling");

  let frame = 0;
  const totalFrames = 24;
  const tick = () => {
    const progress = frame / totalFrames;
    const revealed = Math.floor(progress * finalText.length);
    target.textContent = finalText
      .split("")
      .map((char, index) => {
        if (char === " " || index < revealed) return char;
        return alphabet[Math.floor(Math.random() * alphabet.length)];
      })
      .join("");

    frame += 1;
    if (frame <= totalFrames) {
      window.setTimeout(tick, 24);
      return;
    }

    target.textContent = finalText;
    target.dataset.scrambling = "false";
    target.classList.remove("is-scrambling");
  };

  tick();
}

function initMorphingText() {
  const morph = document.querySelector("[data-morphing-text]");
  if (!morph) return;

  const current = morph.querySelector(".morph-layer-current");
  const next = morph.querySelector(".morph-layer-next");
  if (!current || !next) return;

  const texts = [
    "∑AI V4 pro",
    "Capital Signals",
    "7 Sectors",
    "Market Memory",
    "Thesis Network",
    "Advisory Mandates",
    "Memo Studio",
  ];
  let index = 0;
  let isMorphing = false;
  let timer = 0;

  const commit = () => {
    index = (index + 1) % texts.length;
    current.textContent = texts[index];
    next.textContent = texts[(index + 1) % texts.length];
    morph.classList.remove("is-morphing");
    isMorphing = false;
  };

  const play = () => {
    if (isMorphing || prefersReducedMotion.matches) return;
    isMorphing = true;
    next.textContent = texts[(index + 1) % texts.length];
    morph.classList.remove("is-morphing");
    void morph.offsetWidth;
    morph.classList.add("is-morphing");
    window.clearTimeout(timer);
    timer = window.setTimeout(commit, 760);
  };

  next.textContent = texts[1];
  window.setInterval(play, 2600);
  morph.addEventListener("mouseenter", play);
  morph.addEventListener("focus", play);
  morph.tabIndex = 0;
}

function initSignalVideoLoop() {
  const visual = document.querySelector(".signal-visual");
  if (!visual || prefersReducedMotion.matches) return;

  const videos = [...visual.querySelectorAll(".visual-video")];
  if (videos.length < 2) return;

  const sources = [
    "assets/cube_octopuss_1138x640.mp4",
    "assets/230125_FinSci_Mobile1X.mp4",
    "assets/LiquidColor_1280x232.mp4",
    "assets/Moon_1280x232.mp4",
    "assets/Lightshow_1280x232.mp4",
    "assets/Stars_1280x232.mp4",
    "assets/Trapeze_1280x232.mp4",
  ];
  let activeIndex = 0;
  let sourceIndex = 0;

  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.play().catch(() => {
      window.addEventListener("pointerdown", () => video.play().catch(() => {}), { once: true });
    });
  });

  const switchVideo = () => {
    const active = videos[activeIndex];
    const nextIndex = activeIndex === 0 ? 1 : 0;
    const next = videos[nextIndex];
    sourceIndex = (sourceIndex + 1) % sources.length;

    next.src = sources[sourceIndex];
    next.currentTime = 0;
    next.load();

    const reveal = () => {
      next.play().catch(() => {});
      next.classList.add("is-active");
      active.classList.remove("is-active");
      window.setTimeout(() => active.pause(), 1500);
      activeIndex = nextIndex;
    };

    if (next.readyState >= 2) {
      reveal();
    } else {
      next.addEventListener("canplay", reveal, { once: true });
    }
  };

  window.setInterval(switchVideo, 3800);
}

function initTypingAnimations() {
  const targets = [...document.querySelectorAll("[data-typing-animation]")];
  if (!targets.length) return;

  targets.forEach((target, index) => {
    const text = target.textContent.replace(/\s+/g, " ").trim();
    target.dataset.typingText = text;
    target.dataset.typingDelay = String(index * 260);

    if (prefersReducedMotion.matches) {
      target.textContent = text;
      return;
    }

    target.textContent = "";
  });

  if (prefersReducedMotion.matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        observer.unobserve(target);
        window.setTimeout(
          () => playTypingAnimation(target, target.dataset.typingText || ""),
          Number(target.dataset.typingDelay || 0)
        );
      });
    },
    { threshold: 0.42 }
  );

  targets.forEach((target) => observer.observe(target));
}

function playTypingAnimation(target, text) {
  if (!text) return;

  let index = 0;
  target.classList.add("is-typing");

  const type = () => {
    target.textContent = text.slice(0, index);
    index += 1;

    if (index <= text.length) {
      window.setTimeout(type, 22);
      return;
    }

    target.textContent = text;
    window.setTimeout(() => target.classList.remove("is-typing"), 520);
  };

  type();
}

function initDottedMaps() {
  const maps = [...document.querySelectorAll("[data-dotted-map]")];
  if (!maps.length) return;
  const dottedMapData = window.VPX_DOTTED_MAP_DATA;

  if (dottedMapData) {
    maps.forEach((svg) => renderDottedMap(svg, dottedMapData));
    return;
  }

  const markers = [
    { x: 752, y: 218, label: "Seoul", countryCode: "kr", pulse: true },
    { x: 250, y: 205, label: "NYC", countryCode: "us", pulse: true },
    { x: 702, y: 330, label: "Singapore", countryCode: "sg", pulse: true },
  ];

  const continents = [
    [[128, 104], [184, 70], [278, 88], [326, 134], [294, 198], [238, 220], [210, 286], [170, 268], [156, 206], [112, 176]],
    [[210, 280], [262, 304], [298, 374], [276, 456], [228, 430], [196, 358]],
    [[398, 114], [468, 82], [594, 92], [700, 78], [820, 128], [858, 196], [780, 226], [714, 214], [660, 250], [566, 220], [510, 238], [450, 196], [382, 178]],
    [[472, 226], [548, 238], [594, 302], [572, 392], [526, 454], [480, 392], [442, 318]],
    [[638, 250], [720, 260], [774, 314], [736, 362], [660, 342], [604, 296]],
    [[742, 376], [820, 386], [858, 424], [824, 456], [746, 444], [714, 410]],
  ];

  maps.forEach((svg) => {
    const namespace = "http://www.w3.org/2000/svg";
    const landDots = [];

    for (let y = 58; y <= 468; y += 9) {
      for (let x = 70; x <= 900; x += 9) {
        const onLand = continents.some((polygon) => pointInPolygon(x, y, polygon));
        const jitter = ((x * 17 + y * 31) % 7) - 3;

        if (onLand && (x + y) % 6 !== 0) {
          landDots.push({ x: x + jitter * 0.34, y });
        }
      }
    }

    [[694, 362], [724, 372], [770, 272], [800, 286], [842, 300], [884, 330], [390, 204], [410, 212]].forEach(
      ([x, y]) => {
        for (let offset = -10; offset <= 10; offset += 10) {
          landDots.push({ x: x + offset, y: y + Math.abs(offset) * 0.35 });
        }
      }
    );

    landDots.forEach(({ x, y }) => {
      const dot = document.createElementNS(namespace, "circle");
      dot.setAttribute("class", "map-dot");
      dot.setAttribute("cx", String(x));
      dot.setAttribute("cy", String(y));
      dot.setAttribute("r", "1.15");
      svg.appendChild(dot);
    });

    markers.forEach(({ x, y, label, countryCode, pulse }, index) => {
      const group = document.createElementNS(namespace, "g");
      group.setAttribute("class", pulse ? "map-label is-pulsing" : "map-label");
      group.setAttribute("style", `--marker-delay: ${index * 0.24}s`);

      const clipId = `map-flag-${countryCode}-${index}`;
      const clip = document.createElementNS(namespace, "clipPath");
      clip.setAttribute("id", clipId);
      const clipCircle = document.createElementNS(namespace, "circle");
      clipCircle.setAttribute("cx", String(x));
      clipCircle.setAttribute("cy", String(y));
      clipCircle.setAttribute("r", "13");
      clip.appendChild(clipCircle);
      svg.appendChild(clip);

      const ring = document.createElementNS(namespace, "circle");
      ring.setAttribute("class", "map-node-ring");
      ring.setAttribute("cx", String(x));
      ring.setAttribute("cy", String(y));
      ring.setAttribute("r", "17");
      group.appendChild(ring);

      const image = document.createElementNS(namespace, "image");
      image.setAttribute("href", `https://flagcdn.com/w80/${countryCode}.webp`);
      image.setAttribute("x", String(x - 13));
      image.setAttribute("y", String(y - 13));
      image.setAttribute("width", "26");
      image.setAttribute("height", "26");
      image.setAttribute("preserveAspectRatio", "xMidYMid slice");
      image.setAttribute("clip-path", `url(#${clipId})`);
      group.appendChild(image);

      const width = label.length * 10 + 34;
      const rect = document.createElementNS(namespace, "rect");
      rect.setAttribute("x", String(x + 26));
      rect.setAttribute("y", String(y - 14));
      rect.setAttribute("width", String(width));
      rect.setAttribute("height", "28");
      rect.setAttribute("rx", "14");
      group.appendChild(rect);

      const text = document.createElementNS(namespace, "text");
      text.setAttribute("x", String(x + 43));
      text.setAttribute("y", String(y + 5.5));
      text.textContent = label;
      group.appendChild(text);

      svg.appendChild(group);
    });
  });
}

function pointInPolygon(x, y, polygon) {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const xi = polygon[index][0];
    const yi = polygon[index][1];
    const xj = polygon[previous][0];
    const yj = polygon[previous][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function renderDottedMap(svg, data) {
  const namespace = "http://www.w3.org/2000/svg";
  svg.setAttribute("viewBox", `0 0 ${data.width} ${data.height}`);
  svg.textContent = "";

  const title = document.createElementNS(namespace, "title");
  title.textContent = "Founder network nodes";
  svg.appendChild(title);

  const { xStep, yToRowIndex } = getDottedMapRows(data.points);
  const dotLayer = document.createElementNS(namespace, "g");
  const markerLayer = document.createElementNS(namespace, "g");

  data.points.forEach(([x, y], index) => {
    const rowIndex = yToRowIndex.get(y) || 0;
    const offsetX = rowIndex % 2 === 1 ? xStep / 2 : 0;
    const dot = document.createElementNS(namespace, "circle");
    dot.setAttribute("class", "map-dot");
    dot.setAttribute("cx", String(x + offsetX));
    dot.setAttribute("cy", String(y));
    dot.setAttribute("r", String(data.dotRadius || 0.1));
    dotLayer.appendChild(dot);
  });

  svg.appendChild(dotLayer);

  data.markers.forEach((marker, index) => {
    const rowIndex = yToRowIndex.get(marker.y) || 0;
    const offsetX = rowIndex % 2 === 1 ? xStep / 2 : 0;
    const x = marker.x + offsetX;
    const y = marker.y;
    const r = marker.size || data.dotRadius || 0.3;
    const group = document.createElementNS(namespace, "g");
    group.setAttribute("class", marker.pulse ? "map-label is-pulsing" : "map-label");
    group.setAttribute("style", `--marker-delay: ${index * 0.24}s`);

    const markerCircle = document.createElementNS(namespace, "circle");
    markerCircle.setAttribute("class", "map-node");
    markerCircle.setAttribute("cx", String(x));
    markerCircle.setAttribute("cy", String(y));
    markerCircle.setAttribute("r", String(r));
    group.appendChild(markerCircle);

    if (marker.pulse) {
      const delayBase = index * 0.24;
      [0, 0.58, 1.16].forEach((delay) => {
        const pulse = document.createElementNS(namespace, "circle");
        pulse.setAttribute("class", "map-signal-ring");
        pulse.setAttribute("cx", String(x));
        pulse.setAttribute("cy", String(y));
        pulse.setAttribute("r", String(r * 2.25));
        pulse.setAttribute("stroke-width", "0.62");

        const radius = document.createElementNS(namespace, "animate");
        radius.setAttribute("attributeName", "r");
        radius.setAttribute("values", `${r * 2.25};${r * 7.4}`);
        radius.setAttribute("dur", "1.9s");
        radius.setAttribute("begin", `${delayBase + delay}s`);
        radius.setAttribute("repeatCount", "indefinite");
        pulse.appendChild(radius);

        const opacity = document.createElementNS(namespace, "animate");
        opacity.setAttribute("attributeName", "opacity");
        opacity.setAttribute("values", "0.95;0");
        opacity.setAttribute("dur", "1.9s");
        opacity.setAttribute("begin", `${delayBase + delay}s`);
        opacity.setAttribute("repeatCount", "indefinite");
        pulse.appendChild(opacity);
        group.appendChild(pulse);
      });
    }

    if (marker.countryCode && marker.label) {
      const flagRadius = 1.45;
      const clipId = `map-flag-${marker.countryCode}-${index}`;
      const clip = document.createElementNS(namespace, "clipPath");
      clip.setAttribute("id", clipId);

      const clipCircle = document.createElementNS(namespace, "circle");
      clipCircle.setAttribute("cx", String(x));
      clipCircle.setAttribute("cy", String(y));
      clipCircle.setAttribute("r", String(flagRadius));
      clip.appendChild(clipCircle);
      svg.appendChild(clip);

      const flagRing = document.createElementNS(namespace, "circle");
      flagRing.setAttribute("class", "map-flag-ring");
      flagRing.setAttribute("cx", String(x));
      flagRing.setAttribute("cy", String(y));
      flagRing.setAttribute("r", String(flagRadius + 0.32));
      group.appendChild(flagRing);

      const image = document.createElementNS(namespace, "image");
      image.setAttribute("href", `https://flagcdn.com/w80/${marker.countryCode}.webp`);
      image.setAttribute("x", String(x - flagRadius));
      image.setAttribute("y", String(y - flagRadius));
      image.setAttribute("width", String(flagRadius * 2));
      image.setAttribute("height", String(flagRadius * 2));
      image.setAttribute("preserveAspectRatio", "xMidYMid slice");
      image.setAttribute("clip-path", `url(#${clipId})`);
      group.appendChild(image);

      const labelWidth = marker.label.length * 1.25 + 3;
      const rect = document.createElementNS(namespace, "rect");
      rect.setAttribute("x", String(x + flagRadius + 1.7));
      rect.setAttribute("y", String(y - 1.75));
      rect.setAttribute("width", String(labelWidth));
      rect.setAttribute("height", "3.5");
      rect.setAttribute("rx", "1.75");
      group.appendChild(rect);

      const text = document.createElementNS(namespace, "text");
      text.setAttribute("x", String(x + flagRadius + 3.2));
      text.setAttribute("y", String(y + 0.72));
      text.textContent = marker.label;
      group.appendChild(text);
    }

    markerLayer.appendChild(group);
  });

  svg.appendChild(markerLayer);
}

function getDottedMapRows(points) {
  const sorted = [...points].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const yToRowIndex = new Map();
  let xStep = 0;
  let previousY = Number.NaN;
  let previousXInRow = Number.NaN;

  sorted.forEach(([x, y]) => {
    if (y !== previousY) {
      previousY = y;
      previousXInRow = Number.NaN;
      if (!yToRowIndex.has(y)) yToRowIndex.set(y, yToRowIndex.size);
    }

    if (!Number.isNaN(previousXInRow)) {
      const delta = x - previousXInRow;
      if (delta > 0) xStep = xStep === 0 ? delta : Math.min(xStep, delta);
    }

    previousXInRow = x;
  });

  return { xStep: xStep || 1, yToRowIndex };
}

function initTerminalPanels() {
  const panels = [...document.querySelectorAll("[data-terminal-panel]")];
  if (!panels.length) return;

  panels.forEach((panel) => {
    const command = panel.querySelector("[data-terminal-command]");
    const lines = [...panel.querySelectorAll("[data-terminal-line]")];
    const commandText = command ? command.textContent.trim() : "";
    const lineTexts = lines.map((line) => line.textContent.trim());
    let active = false;
    let running = false;
    let cycleToken = 0;
    let timers = [];

    if (prefersReducedMotion.matches) {
      if (command) command.classList.add("is-visible");
      lines.forEach((line) => line.classList.add("is-visible"));
      return;
    }

    const setTimer = (callback, delay) => {
      const id = window.setTimeout(() => {
        timers = timers.filter((timer) => timer !== id);
        callback();
      }, delay);
      timers.push(id);
      return id;
    };

    const clearTimers = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
    };

    const resetPanel = () => {
      panel.classList.remove("is-resetting");
      if (command) {
        command.textContent = "";
        command.classList.remove("is-visible", "is-typing");
      }
      lines.forEach((line) => {
        line.textContent = "";
        line.classList.remove("is-visible", "is-typing");
      });
    };

    const runLines = (index = 0, token = cycleToken) => {
      if (!active || token !== cycleToken) return;

      if (index >= lines.length) {
        running = false;
        setTimer(() => {
          if (!active || token !== cycleToken) return;
          panel.classList.add("is-resetting");
          setTimer(() => {
            if (!active || token !== cycleToken) return;
            resetPanel();
            playCycle();
          }, 280);
        }, 2100);
        return;
      }

      typeTerminalLine(lines[index], lineTexts[index], () => {
        setTimer(() => runLines(index + 1, token), 95);
      }, 13, setTimer, () => active && token === cycleToken);
    };

    const playCycle = () => {
      if (!active || running || !command) return;
      running = true;
      const token = ++cycleToken;
      resetPanel();
      setTimer(() => {
        typeTerminalLine(command, commandText, () => {
          setTimer(() => runLines(0, token), 170);
        }, 28, setTimer, () => active && token === cycleToken);
      }, 180);
    };

    resetPanel();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          active = entry.isIntersecting;
          if (active) {
            playCycle();
          return;
        }

        running = false;
        cycleToken += 1;
        clearTimers();
        resetPanel();
      });
      },
      { threshold: 0.35 }
    );

    observer.observe(panel);
  });
}

function typeTerminalLine(target, text, done, speed = 22, schedule = window.setTimeout, shouldContinue = () => true) {
  let index = 0;
  target.classList.add("is-visible", "is-typing");

  const type = () => {
    if (!shouldContinue()) return;
    target.textContent = text.slice(0, index);
    index += 1;

    if (index <= text.length) {
      window.setTimeout(type, 28);
      return;
    }

    target.textContent = text;
    target.classList.remove("is-typing");
    if (shouldContinue()) done();
  };

  type();
}

function initScrollReveal() {
  if (prefersReducedMotion.matches) return;

  const selectors = [
    ".signal-panel .signal-copy",
    ".signal-panel .signal-visual",
    ".section .section-index",
    ".section h2",
    ".section .section-lede",
    ".founder-map",
    ".vision-card",
    ".whitepaper-copy",
    ".thesis-list li",
    ".advisory-layout > div:first-child",
    ".terminal-panel",
    ".career-card",
    ".marquee-copy",
    ".feedback-marquee",
    ".mission-flow article",
    ".downloads-layout > div",
    ".download-list li",
  ];
  const targets = [...new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]))]
    .filter((target) => !target.closest(".hero"));

  if (!targets.length) return;

  targets.forEach((target) => {
    const siblings = [...target.parentElement?.children || []].filter((child) => targets.includes(child));
    const siblingIndex = siblings.indexOf(target);
    const delay = Math.max(0, siblingIndex) * 70;
    target.style.setProperty("--reveal-delay", `${Math.min(delay, 280)}ms`);
    target.setAttribute("data-scroll-reveal", "");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.14,
    }
  );

  targets.forEach((target) => observer.observe(target));
}

async function initExtrudedTitle(container, text) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 3000);
  camera.position.set(0, 0, 1000);

  const font = await new FontLoader().loadAsync(
    "https://unpkg.com/three@0.165.0/examples/fonts/droid/droid_sans_bold.typeface.json"
  );

  heroCopy.classList.add("webgl-title-ready");

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(10, 10);
  const letters = [];
  const hitTargets = [];
  const faceMaterials = [];
  let hovered = null;
  let width = 0;
  let height = 0;

  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 1024;
  textureCanvas.height = 512;
  const textureCtx = textureCanvas.getContext("2d");
  const fallbackTexture = new THREE.CanvasTexture(textureCanvas);
  fallbackTexture.colorSpace = THREE.SRGBColorSpace;
  fallbackTexture.wrapS = THREE.RepeatWrapping;
  fallbackTexture.wrapT = THREE.RepeatWrapping;

  const titleVideos = titleVideoSources.map((source, index) => {
    const entry = createVideoTexture(source);
    entry.ready = false;
    entry.failed = false;
    entry.index = index;
    entry.video.addEventListener("canplay", () => {
      entry.ready = true;
      updateMaterialsForVideo(index);
    });
    entry.video.addEventListener("error", () => {
      entry.failed = true;
      updateMaterialsForVideo(index);
    });
    return entry;
  });

  const sideMaterial = new THREE.MeshBasicMaterial({
    color: "#969b9b",
    transparent: true,
    opacity: 0.08,
  });

  build();
  animate(0);

  window.addEventListener("resize", debounce(build, 150));
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerleave", () => setHover(null));

  function build() {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();

    scene.clear();
    letters.length = 0;
    hitTargets.length = 0;
    faceMaterials.length = 0;
    hovered = null;

    drawDynamicTexture(0);

    const rawSize = 198;
    const depth = 58;
    const gap = 18;
    const groups = [];
    let cursor = 0;
    const characters = [...text];
    const videoGroups = makeVideoGroups(characters.length);
    const items = [];

    characters.forEach((char, index) => {
      const geometry = new TextGeometry(char, {
        font,
        size: rawSize,
        depth,
        curveSegments: 16,
        bevelEnabled: true,
        bevelThickness: 4.2,
        bevelSize: 3.8,
        bevelSegments: 5,
      });
      geometry.computeBoundingBox();
      geometry.computeVertexNormals();

      const box = geometry.boundingBox;
      const charWidth = box.max.x - box.min.x;
      const centerX = cursor + charWidth / 2;
      geometry.translate(-box.min.x - charWidth / 2, -(box.min.y + box.max.y) / 2, -depth / 2);

      items.push({ char, index, geometry, charWidth, centerX, startX: cursor, endX: cursor + charWidth });
      cursor += charWidth + gap;
    });

    const totalWidth = cursor - gap;
    videoGroups.forEach((videoGroup) => {
      const first = items[videoGroup.start];
      const last = items[videoGroup.end - 1];
      videoGroup.startX = first.startX;
      videoGroup.endX = last.endX;
      videoGroup.width = Math.max(1, videoGroup.endX - videoGroup.startX);
    });

    items.forEach(({ index, geometry, charWidth, centerX }) => {
      const videoGroup = videoGroups.find((group) => index >= group.start && index < group.end);
      const faceMaterial = makeFaceMaterial(
        textureForVideo(videoGroup.video),
        charWidth,
        rawSize,
        centerX,
        videoGroup
      );
      faceMaterial.userData.videoGroup = videoGroup;
      faceMaterials.push(faceMaterial);
      const letterSideMaterial = sideMaterial.clone();
      const mesh = new THREE.Mesh(geometry, [faceMaterial, letterSideMaterial]);
      mesh.userData.letterGroup = null;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      const group = new THREE.Group();
      group.add(mesh);
      group.position.x = centerX;
      group.userData.axis = index % 2 === 0 ? "y" : "x";
      group.userData.target = 0;
      group.userData.velocity = 0;
      group.userData.mesh = mesh;
      group.userData.sideMaterial = letterSideMaterial;
      mesh.userData.letterGroup = group;

      groups.push({ group, width: charWidth });
    });

    const scale = Math.min((width * 0.96) / totalWidth, (height * 0.9) / rawSize, 1.02);

    groups.forEach(({ group }) => {
      group.position.x = (group.position.x - totalWidth / 2) * scale;
      group.scale.set(scale, scale * 0.92, scale * 0.92);
      scene.add(group);
      letters.push(group);
      hitTargets.push(group.userData.mesh);
    });
  }

  function drawDynamicTexture(time) {
    textureCtx.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
    const shift = (time * 0.00008) % 1;
    const gradient = textureCtx.createLinearGradient(
      textureCanvas.width * (shift - 0.35),
      0,
      textureCanvas.width * (shift + 1),
      textureCanvas.height
    );
    gradient.addColorStop(0, "#bcd92e");
    gradient.addColorStop(0.18, "#5a913f");
    gradient.addColorStop(0.36, "#0e3329");
    gradient.addColorStop(0.52, "#05070c");
    gradient.addColorStop(0.72, "#263fbe");
    gradient.addColorStop(1, "#d1d7d8");
    textureCtx.fillStyle = gradient;
    textureCtx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

    textureCtx.globalAlpha = 0.48;
    for (let i = 0; i < 100; i += 1) {
      const x = (i * 73 + time * 0.014) % (textureCanvas.width + 140) - 70;
      const y = (i * 41) % textureCanvas.height;
      const length = 22 + (i % 9) * 16;
      textureCtx.save();
      textureCtx.translate(x, y);
      textureCtx.rotate(((i % 13) - 6) * 0.12);
      textureCtx.fillStyle = i % 4 === 0 ? "#ffffff" : "#080d12";
      textureCtx.fillRect(-length / 2, -2, length, 4);
      textureCtx.restore();
    }
    textureCtx.globalAlpha = 1;
    fallbackTexture.needsUpdate = true;
  }

  function textureForVideo(index) {
    const entry = titleVideos[index];
    return entry && entry.ready && !entry.failed ? entry.texture : fallbackTexture;
  }

  function updateMaterialsForVideo(index) {
    faceMaterials.forEach((material) => {
      const videoGroup = material.userData.videoGroup;
      if (videoGroup && videoGroup.video === index) {
        rotateAssignments();
      }
    });
  }

  function makeVideoGroups(letterCount) {
    const groupSize = 4;
    const groups = [];
    for (let start = 0; start < letterCount; start += groupSize) {
      groups.push({
        start,
        end: Math.min(start + groupSize, letterCount),
        video: groups.length % titleVideos.length,
      });
    }
    return groups;
  }

  function rotateAssignments() {
    const cycleMs = 7200;
    const transitionMs = 3200;
    const now = performance.now();
    const step = Math.floor(now / cycleMs) % titleVideos.length;
    const phase = (now % cycleMs) / cycleMs;
    const transitionStart = 1 - transitionMs / cycleMs;
    const rawProgress = phase <= transitionStart ? 0 : (phase - transitionStart) / (1 - transitionStart);
    const transition = rawProgress * rawProgress * (3 - 2 * rawProgress);

    faceMaterials.forEach((material) => {
      const videoGroup = material.userData.videoGroup;
      if (!videoGroup) return;
      const current = (videoGroup.video + step) % titleVideos.length;
      const next = (videoGroup.video + step + 1) % titleVideos.length;
      material.uniforms.textureMap.value = textureForVideo(current);
      material.uniforms.nextTextureMap.value = textureForVideo(next);
      material.uniforms.transition.value = transition;
    });
  }

  function makeFaceMaterial(texture, charWidth, fontSize, originX, videoGroup) {
    return new THREE.ShaderMaterial({
      uniforms: {
        textureMap: { value: texture },
        nextTextureMap: { value: texture },
        transition: { value: 0 },
        time: { value: 0 },
        bounds: { value: new THREE.Vector2(charWidth, fontSize) },
        originX: { value: originX },
        groupStart: { value: videoGroup.startX },
        groupWidth: { value: videoGroup.width },
      },
      vertexShader: `
        varying vec3 vLocal;
        varying vec3 vNormal;

        void main() {
          vLocal = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D textureMap;
        uniform sampler2D nextTextureMap;
        uniform float transition;
        uniform float time;
        uniform vec2 bounds;
        uniform float originX;
        uniform float groupStart;
        uniform float groupWidth;
        varying vec3 vLocal;
        varying vec3 vNormal;

        void main() {
          float titleX = originX + vLocal.x;
          float groupU = clamp((titleX - groupStart) / max(groupWidth, 1.0), 0.0, 1.0);
          vec2 uv = vec2(
            groupU + time * 0.014,
            (vLocal.y / max(bounds.y, 1.0)) + 0.5
          );
          vec3 video = texture2D(textureMap, uv).rgb;
          float localY = (vLocal.y / max(bounds.y, 1.0)) + 0.5;
          float diagonal = groupU + (1.0 - localY) * 0.38;
          float curtain = 1.42 - transition * 1.78;
          float feather = 0.34;
          float reveal = smoothstep(curtain - feather, curtain + feather, diagonal);
          vec2 nextUv = vec2(
            groupU + time * 0.014,
            (vLocal.y / max(bounds.y, 1.0)) + 0.5
          );
          vec3 nextVideo = texture2D(nextTextureMap, nextUv).rgb;
          float softReveal = smoothstep(0.0, 1.0, reveal) * smoothstep(0.0, 0.92, transition);
          vec3 movingVideo = mix(video, nextVideo, softReveal);
          float front = smoothstep(0.15, 0.95, abs(vNormal.z));
          vec3 side = mix(vec3(0.05, 0.055, 0.055), vec3(0.72, 0.74, 0.72), max(vNormal.x * 0.5 + 0.5, 0.0));
          vec3 color = mix(side, movingVideo, front);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }

  function onPointerMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(hitTargets, false)[0];
    setHover(hit ? hit.object.userData.letterGroup : null);
  }

  function setHover(group) {
    if (hovered === group) return;
    if (hovered) hovered.userData.target = 0;
    hovered = group;
    if (hovered) hovered.userData.target = Math.PI;
  }

  function animate(time) {
    requestAnimationFrame(animate);
    if (mobileQuery.matches) return;

    rotateAssignments();

    if (
      faceMaterials.some(
        (material) =>
          material.uniforms.textureMap.value === fallbackTexture
          || material.uniforms.nextTextureMap.value === fallbackTexture
      )
    ) {
      drawDynamicTexture(time);
    }

    letters.forEach((letter) => {
      const material = letter.userData.mesh.material[0];
      material.uniforms.time.value = time * 0.001;
      const axis = letter.userData.axis;
      const current = axis === "x" ? letter.rotation.x : letter.rotation.y;
      const delta = letter.userData.target - current;
      letter.userData.velocity += delta * 0.011;
      letter.userData.velocity *= 0.9;

      if (axis === "x") {
        letter.rotation.x += letter.userData.velocity;
        letter.rotation.y += (0 - letter.rotation.y) * 0.08;
      } else {
        letter.rotation.y += letter.userData.velocity;
        letter.rotation.x += (0 - letter.rotation.x) * 0.08;
      }

      const activeRotation = axis === "x" ? letter.rotation.x : letter.rotation.y;
      letter.userData.sideMaterial.opacity = 0.08 + Math.abs(Math.sin(activeRotation)) * 0.82;
    });

    renderer.render(scene, camera);
  }
}

function debounce(callback, delay) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
}

function createVideoTexture(src) {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = "auto";
  video.src = src;

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  video.play().catch(() => {
    window.addEventListener("pointerdown", () => video.play().catch(() => {}), { once: true });
  });

  return { video, texture };
}

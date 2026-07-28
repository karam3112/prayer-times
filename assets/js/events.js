(function () {
  function isImageFile(filename) {
    return /\.(png|jpe?g|webp|gif|avif)$/i.test(filename || "");
  }

  function buildImagePath(basePath, fileName) {
    return `${basePath.replace(/\/$/, "")}/${fileName}`;
  }

  function preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = reject;
      img.src = url;
    });
  }

  const DEFAULT_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

  // استكشاف رقمي: يجرّب 1 ثم 2 … ويتوقف بعد عدة أرقام متتالية بلا صورة.
  // الفجوة الواحدة (حذف 5.jpg مثلًا) لا توقفه.
  async function probeIndexed(basePath, options) {
    const maxIndex = Number(options.maxIndex) || 40;
    const stopAfterMisses = Number(options.stopAfterMisses) || 5;
    const extensions = options.extensions || DEFAULT_EXTENSIONS;

    const found = [];
    let consecutiveMisses = 0;

    for (let index = 1; index <= maxIndex; index++) {
      let hit = null;

      for (const ext of extensions) {
        const url = buildImagePath(basePath, `${index}.${ext}`);
        try {
          await preloadImage(url);
          hit = url;
          break;
        } catch (_) {}
      }

      if (hit) {
        found.push(hit);
        consecutiveMisses = 0;
        continue;
      }

      consecutiveMisses++;
      if (consecutiveMisses >= stopAfterMisses) break;
    }

    return found;
  }

  async function discoverImages(basePath, fileList = [], options = {}) {
    // قائمة صريحة إن وُجدت (للأسماء غير الرقمية)، وإلا الاستكشاف الرقمي
    const explicit = (fileList || []).filter(isImageFile);

    if (explicit.length) {
      const loaded = [];

      for (const name of explicit) {
        const url = buildImagePath(basePath, name);
        try {
          await preloadImage(url);
          loaded.push(url);
        } catch (_) {}
      }

      return loaded;
    }

    return probeIndexed(basePath, options);
  }

  function createRotator(layerElement, options = {}) {
    const state = {
      layerElement,
      images: [],
      currentIndex: 0,
      timer: null,
      intervalMs: Math.max(5000, Number(options.intervalMs || 15000))
    };

    function show(index) {
      if (!state.layerElement || !state.images.length) return;
      const safeIndex = ((index % state.images.length) + state.images.length) % state.images.length;
      state.currentIndex = safeIndex;
      state.layerElement.style.backgroundImage = `url("${state.images[safeIndex]}")`;
    }

    function start(images) {
      state.images = Array.isArray(images) ? images.slice() : [];

      if (!state.images.length || !state.layerElement) {
        if (state.layerElement) {
          state.layerElement.style.backgroundImage = "";
        }
        return;
      }

      stop();
      show(0);

      if (state.images.length === 1) return;

      state.timer = setInterval(() => {
        show(state.currentIndex + 1);
      }, state.intervalMs);
    }

    function stop() {
      if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
      }
    }

    function setDimmed(isDimmed) {
      if (!state.layerElement) return;
      state.layerElement.classList.toggle("is-dimmed", Boolean(isDimmed));
    }

    return {
      start,
      stop,
      setDimmed
    };
  }

  window.EventsModule = {
    discoverImages,
    createRotator
  };
})();

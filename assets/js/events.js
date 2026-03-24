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

  async function discoverImages(basePath, fileList = []) {
    const valid = fileList.filter(isImageFile).map((name) => buildImagePath(basePath, name));
    const loaded = [];

    for (const url of valid) {
      try {
        await preloadImage(url);
        loaded.push(url);
      } catch (_) {}
    }

    return loaded;
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

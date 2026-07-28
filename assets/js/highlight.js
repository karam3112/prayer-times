(function () {
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // خانة واحدة تتناوب بين الاقتباسات ولوحة التقدير.
  // التبادل صارم: اقتباس ثم تقدير ثم اقتباس… وكل قائمة تدور بوتيرتها.
  // لو دمجنا القائمتين في تسلسل واحد لظهر تقديرٌ واحد مرة كل دورة كاملة
  // من ثلاثة عشر اقتباسًا — أي مرة كل دقيقتين، وهو ما يُفرغ الفكرة.
  function createRotator(options = {}) {
    const state = {
      body: options.body || null,
      quoteEl: options.quoteEl || null,
      honorEl: options.honorEl || null,
      quotes: Array.isArray(options.quotes) ? options.quotes.filter(Boolean) : [],
      honors: [],
      quoteIndex: 0,
      honorIndex: 0,
      showHonorNext: true,
      timer: null,
      intervalMs: Math.max(4000, Number(options.intervalMs) || 8000),
      fadeMs: 450
    };

    function renderQuote(text) {
      if (!state.quoteEl) return;
      state.quoteEl.textContent = text;
      state.quoteEl.classList.remove("hidden");
      state.honorEl?.classList.add("hidden");
    }

    function renderHonor(item) {
      if (!state.honorEl) return;

      const note = item.note
        ? `<div class="honor__note">${escapeHtml(item.note)}</div>`
        : "";

      state.honorEl.innerHTML = `
        <div class="honor__head">
          <span class="honor__star" aria-hidden="true">★</span>
          <span class="honor__title">${escapeHtml(item.title)}</span>
        </div>
        <div class="honor__names">${escapeHtml(item.names)}</div>
        ${note}
      `;

      state.honorEl.classList.remove("hidden");
      state.quoteEl?.classList.add("hidden");
    }

    function showNext() {
      const hasHonors = state.honors.length > 0;
      const hasQuotes = state.quotes.length > 0;

      if (!hasHonors && !hasQuotes) return;

      const useHonor = hasHonors && (!hasQuotes || state.showHonorNext);
      state.showHonorNext = !useHonor;

      if (useHonor) {
        renderHonor(state.honors[state.honorIndex % state.honors.length]);
        state.honorIndex++;
        return;
      }

      renderQuote(state.quotes[state.quoteIndex % state.quotes.length]);
      state.quoteIndex++;
    }

    function advance() {
      if (!state.body) {
        showNext();
        return;
      }

      state.body.classList.add("is-fading");

      setTimeout(() => {
        showNext();
        state.body.classList.remove("is-fading");
      }, state.fadeMs);
    }

    function setHonors(items) {
      const next = Array.isArray(items) ? items.filter((item) => item && item.title) : [];

      const same = next.length === state.honors.length &&
        next.every((item, i) =>
          item.title === state.honors[i].title &&
          item.names === state.honors[i].names &&
          item.note === state.honors[i].note);

      if (same) return;

      state.honors = next;
      state.honorIndex = 0;

      // لو اختفى التقدير بينما هو معروض، أعِد الخانة إلى اقتباس فورًا
      if (!next.length && state.honorEl && !state.honorEl.classList.contains("hidden")) {
        showNext();
      }
    }

    function start() {
      showNext();

      if (state.timer) clearInterval(state.timer);
      state.timer = setInterval(advance, state.intervalMs);
    }

    return {
      start,
      setHonors
    };
  }

  window.HighlightModule = {
    createRotator
  };
})();

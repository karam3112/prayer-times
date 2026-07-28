(function () {
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sameItems(a, b) {
    return a.length === b.length &&
      a.every((item, i) => item.text === b[i].text && item.audience === b[i].audience);
  }

  // إعلان واحد كبير في كل مرة، يتناوب مع غيره. الداخل صباحًا يمرّ في ثوانٍ،
  // فقراءة سطر واحد بخط كبير أجدى من قائمة مزدحمة لا يلتقطها بنظرة.
  function createBoard(element, options = {}) {
    const state = {
      items: [],
      index: 0,
      timer: null,
      intervalMs: Math.max(4000, Number(options.intervalMs) || 10000)
    };

    function render() {
      if (!element) return;

      if (!state.items.length) {
        element.classList.add("hidden");
        element.innerHTML = "";
        return;
      }

      const position = state.index % state.items.length;
      const item = state.items[position];

      const counter = state.items.length > 1
        ? `<span class="announcements-card__counter">${position + 1} / ${state.items.length}</span>`
        : "";

      const audience = item.audience
        ? `<div class="announcements-card__audience">${escapeHtml(item.audience)}</div>`
        : "";

      element.innerHTML = `
        <div class="announcements-card__head">
          <span class="announcements-card__label">اليوم في مدرستنا</span>
          ${counter}
        </div>
        <div class="announcements-card__text">${escapeHtml(item.text)}</div>
        ${audience}
      `;

      element.classList.remove("hidden");
    }

    function restartTimer() {
      if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
      }

      if (state.items.length < 2) return;

      state.timer = setInterval(() => {
        state.index++;
        render();
      }, state.intervalMs);
    }

    function setItems(items) {
      const next = Array.isArray(items) ? items : [];

      // لا نعيد البناء ولا نصفّر التناوب ما دام المحتوى نفسه
      if (sameItems(next, state.items)) return;

      state.items = next;
      state.index = 0;
      render();
      restartTimer();
    }

    // حالة البداية تُفرض هنا لا تُورَّث من class في HTML
    render();

    return {
      setItems
    };
  }

  window.AnnouncementsModule = {
    createBoard
  };
})();

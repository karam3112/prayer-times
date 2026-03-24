(function () {
  function buildTickerHtml(messages) {
    const safeMessages = Array.isArray(messages) ? messages.filter(Boolean) : [];
    if (!safeMessages.length) return "<span>مرحبًا بكم في مدرسة الغزالي</span>";

    const once = safeMessages.map((message) => {
      return `<span>${message}</span><span class="sep">•</span>`;
    }).join("");

    return once + once;
  }

  function renderTicker(element, messages) {
    if (!element) return;
    element.innerHTML = buildTickerHtml(messages);
  }

  window.TickerModule = {
    renderTicker
  };
})();

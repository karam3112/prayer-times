(function () {
  // المفتاح يأتي من رابط الشاشة (?k=...) ولا يوجد في الكود إطلاقًا
  function getAccessKey() {
    try {
      return new URLSearchParams(window.location.search).get("k") || "";
    } catch (_) {
      return "";
    }
  }

  function cleanText(value) {
    return String(value == null ? "" : value).trim();
  }

  // طلب واحد يُرجع محتوى اليوم كله: المواليد والإعلانات معًا.
  // بلا مفتاح لا يُرسل طلب أصلًا.
  async function fetchToday(endpoint) {
    const empty = { birthdays: [], announcements: [], honors: [] };

    const key = getAccessKey();
    if (!endpoint || !key) return empty;

    const response = await fetch(`${endpoint}?k=${encodeURIComponent(key)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Failed to load school feed: ${response.status}`);
    }

    const data = await response.json();

    return {
      birthdays: (Array.isArray(data?.birthdays) ? data.birthdays : [])
        .map((item) => ({
          name: cleanText(item?.name),
          role: cleanText(item?.role),
          className: cleanText(item?.className)
        }))
        .filter((item) => item.name),

      announcements: (Array.isArray(data?.announcements) ? data.announcements : [])
        .map((item) => ({
          text: cleanText(item?.text),
          audience: cleanText(item?.audience)
        }))
        .filter((item) => item.text),

      honors: (Array.isArray(data?.honors) ? data.honors : [])
        .map((item) => ({
          title: cleanText(item?.title),
          names: cleanText(item?.names),
          note: cleanText(item?.note)
        }))
        .filter((item) => item.title)
    };
  }

  window.SchoolFeed = {
    fetchToday
  };
})();

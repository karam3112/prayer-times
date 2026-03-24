(function () {
  function normalizeArabicComma(text) {
    return String(text || "").replace(/،/g, ",").trim();
  }

  function parseCsvLine(line) {
    return normalizeArabicComma(line).split(",").map((part) => part.trim());
  }

  function formatMonthDay(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}-${day}`;
  }

  async function loadBirthdaysCsv(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load birthdays csv: ${response.status}`);
    }

    const text = await response.text();
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    if (!lines.length) return [];

    const header = parseCsvLine(lines[0]).map((item) => item.toLowerCase());
    const nameIndex = header.findIndex((item) => ["name", "student", "student_name", "الاسم"].includes(item));
    const dateIndex = header.findIndex((item) => ["date", "birthday", "birthdate", "تاريخ", "تاريخ_الميلاد"].includes(item));

    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      const name = row[nameIndex >= 0 ? nameIndex : 0]?.trim();
      const rawDate = row[dateIndex >= 0 ? dateIndex : 1]?.trim();

      if (!name || !rawDate) continue;

      records.push({
        name,
        rawDate
      });
    }

    return records;
  }

  function findTodayBirthdays(records, now = new Date()) {
    const todayMD = formatMonthDay(now);

    return records.filter((record) => {
      const raw = String(record.rawDate).trim();

      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw.slice(5) === todayMD;
      }

      if (/^\d{2}-\d{2}$/.test(raw)) {
        return raw === todayMD;
      }

      if (/^\d{1,2}\/\d{1,2}$/.test(raw)) {
        const [d, m] = raw.split("/").map((v) => String(Number(v)).padStart(2, "0"));
        return `${m}-${d}` === todayMD;
      }

      return false;
    });
  }

  function renderBirthdayCard(element, todayBirthdays) {
    if (!element) return;

    if (!todayBirthdays.length) {
      element.classList.add("hidden");
      element.innerHTML = "";
      return;
    }

    const primary = todayBirthdays[0];
    const extraCount = todayBirthdays.length - 1;

    let text = `كل عام وأنتم بخير.<br>نهنّئ طالبنا: <strong>${primary.name}</strong>`;
    if (extraCount > 0) {
      text += `<br>ومعه ${extraCount} من أصحاب هذا اليوم الجميل.`;
    }

    element.innerHTML = `
      <div class="birthday-card__title">تهنئة اليوم</div>
      <div class="birthday-card__text">${text}</div>
    `;

    element.classList.remove("hidden");
  }

  window.BirthdaysModule = {
    loadBirthdaysCsv,
    findTodayBirthdays,
    renderBirthdayCard
  };
})();

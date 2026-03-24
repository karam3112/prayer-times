(function () {
  function parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  async function loadBirthdaysCsv(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load birthdays csv: ${response.status}`);
    }

    const text = await response.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) return [];

    const header = parseCsvLine(lines[0]).map((item) => item.trim().toLowerCase());

    const nameIndex = header.indexOf("name");
    const roleIndex = header.indexOf("role");
    const dayIndex = header.indexOf("day");
    const monthIndex = header.indexOf("month");
    const classIndex = header.indexOf("class");

    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);

      const name = row[nameIndex]?.trim() || "";
      const role = row[roleIndex]?.trim() || "";
      const day = Number(row[dayIndex]);
      const month = Number(row[monthIndex]);
      const className = row[classIndex]?.trim() || "";

      if (!name || !Number.isFinite(day) || !Number.isFinite(month)) continue;

      records.push({
        name,
        role,
        day,
        month,
        className
      });
    }

    return records;
  }

  function findTodayBirthdays(records, now = new Date()) {
    const todayDay = now.getDate();
    const todayMonth = now.getMonth() + 1;

    return records.filter((record) => {
      return record.day === todayDay && record.month === todayMonth;
    });
  }

  function buildBirthdayMessage(record) {
    const isTeacher = String(record.role || "").includes("معلم");
    const label = isTeacher ? "نهنّئ من طاقم المدرسة" : "نهنّئ طالبنا";
    const classLine = !isTeacher && record.className
      ? `<br>من ${record.className}`
      : "";

    return `${label}: <strong>${record.name}</strong>${classLine}`;
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

    let text = `كل عام وأنتم بخير.<br>${buildBirthdayMessage(primary)}`;

    if (extraCount > 0) {
      text += `<br>ويوجد أيضًا ${extraCount} من أصحاب هذا اليوم الجميل.`;
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

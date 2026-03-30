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

  function isTeacherRole(role) {
    const value = String(role || "");
    return value.includes("معلم") || value.includes("معلمة");
  }

  function getTitle(role) {
    const r = String(role || "").trim();
    if (r === "ذكر") return "الطالب";
    if (r === "انثى") return "الطالبة";
    if (r === "معلم") return "الأستاذ";
    if (r === "معلمة") return "مربية";
    return "";
  }

  function buildBirthdayLine(record) {
    const teacher = isTeacherRole(record.role);
    const title = getTitle(record.role);
    const displayName = title ? `${title} ${record.name}` : record.name;
    const classLine = !teacher && record.className ? ` - ${record.className}` : "";
    return `<div class="birthday-card__person"><strong>${displayName}</strong><span>${classLine}</span></div>`;
  }

  function renderBirthdayCard(element, todayBirthdays) {
    if (!element) return;

    if (!todayBirthdays.length) {
      element.classList.add("hidden");
      element.innerHTML = "";
      return;
    }

    const lines = todayBirthdays.map(buildBirthdayLine).join("");

    element.innerHTML = `
      <div class="birthday-card__title">تهنئة اليوم</div>
      <div class="birthday-card__text">
        <div>كل عام وأنتم بخير.</div>
        <div class="birthday-card__list">${lines}</div>
      </div>
    `;

    element.classList.remove("hidden");
  }

  window.BirthdaysModule = {
    loadBirthdaysCsv,
    findTodayBirthdays,
    renderBirthdayCard
  };
})();

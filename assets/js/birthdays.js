(function () {
  // الجلب صار في SchoolFeed؛ هذه الوحدة للعرض فقط.

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isTeacherRole(role) {
    return String(role || "").includes("معلم");
  }

  function getTitle(role) {
    const r = String(role || "").trim();
    if (r === "معلم") return "الأستاذ";
    if (r === "معلمة") return "المربية";
    if (r === "طالبة" || r === "انثى" || r === "أنثى") return "الطالبة";
    if (r === "ذكر") return "الطالب";
    return ""; // "طالب" مسجّلة للجنسين معًا، فلا نفترض لقبًا
  }

  function buildBirthdayLine(record) {
    const title = getTitle(record.role);
    const displayName = title ? `${title} ${record.name}` : record.name;
    const classLine = !isTeacherRole(record.role) && record.className
      ? ` - ${record.className}`
      : "";

    return `<div class="birthday-card__person"><strong>${escapeHtml(displayName)}</strong><span>${escapeHtml(classLine)}</span></div>`;
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
    renderBirthdayCard
  };
})();

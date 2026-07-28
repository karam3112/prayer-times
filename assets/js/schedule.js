(function () {
  function toMinutes(hhmm) {
    const match = String(hhmm || "").trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  function build(entries) {
    return (entries || [])
      .map((entry) => ({
        label: String(entry.label || "").trim(),
        isBreak: Boolean(entry.isBreak),
        start: toMinutes(entry.start),
        end: toMinutes(entry.end),
        startText: entry.start,
        endText: entry.end
      }))
      .filter((entry) => entry.label && entry.start !== null && entry.end !== null && entry.end > entry.start)
      .sort((a, b) => a.start - b.start);
  }

  // الدقائق المنقضية من اليوم، بكسورها، ليتحرك شريط التقدم بسلاسة
  function minutesOfDay(now) {
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  }

  function getStatus(entries, now) {
    const schedule = build(entries);
    if (!schedule.length) return { state: "none" };

    const mins = minutesOfDay(now);
    const first = schedule[0];
    const last = schedule[schedule.length - 1];

    if (mins < first.start) {
      return {
        state: "before",
        nextLabel: first.label,
        nextStartText: first.startText,
        minutesToNext: Math.ceil(first.start - mins)
      };
    }

    if (mins >= last.end) return { state: "after" };

    for (let i = 0; i < schedule.length; i++) {
      const entry = schedule[i];

      if (mins >= entry.start && mins < entry.end) {
        return {
          state: entry.isBreak ? "break" : "period",
          label: entry.label,
          endText: entry.endText,
          minutesLeft: Math.ceil(entry.end - mins),
          progress: (mins - entry.start) / (entry.end - entry.start)
        };
      }

      // فجوة بين حصتين: الفرص القصيرة غير المسمّاة في الجدول
      const next = schedule[i + 1];
      if (next && mins >= entry.end && mins < next.start) {
        return {
          state: "gap",
          nextLabel: next.label,
          nextStartText: next.startText,
          minutesToNext: Math.ceil(next.start - mins)
        };
      }
    }

    return { state: "after" };
  }

  window.ScheduleModule = {
    getStatus
  };
})();

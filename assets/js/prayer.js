(function () {
  const PRAYER_NAMES = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء"
  };

  const PRAYER_ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const PRAYER_ICONS = {
    Fajr: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 15a8 8 0 0 1 16 0" />
        <path d="M12 3v3" />
        <path d="M6 8l2 2" />
        <path d="M18 8l-2 2" />
      </svg>
    `,
    Sunrise: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 16h16" />
        <path d="M7 16a5 5 0 0 1 10 0" />
        <path d="M12 4v4" />
      </svg>
    `,
    Dhuhr: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </svg>
    `,
    Asr: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="9" r="3.5" />
        <path d="M12.5 12.5L20 20" />
      </svg>
    `,
    Maghrib: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 16h18" />
        <path d="M6 16a6 6 0 0 1 12 0" />
      </svg>
    `,
    Isha: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3a7 7 0 1 0 6 11.5A8 8 0 1 1 15 3z" />
      </svg>
    `
  };

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  function formatTimeParts(hours, minutes) {
    return `${pad(hours)}:${pad(minutes)}`;
  }

  function parseTimeString(timeString) {
    if (!timeString || typeof timeString !== "string") return null;

    const match = timeString.trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

    return { hours, minutes };
  }

  function createLocalDate(year, monthIndex, day, hours, minutes, seconds = 0) {
    return new Date(year, monthIndex, day, hours, minutes, seconds, 0);
  }

  function todayKey(now = new Date()) {
    return `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  function tomorrowKey(now = new Date()) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // ── حساب المواقيت فلكيًا ──
  // كان المصدر جدولًا سنويًا يُرفع يدويًا (dehri.json)، وتبيّن في أيلول ٢٠٢٦ أن
  // ما بعد نيسان فيه مُلئ تقديرًا: الفجر يتقدّم دقيقة كل يوم بلا استثناء،
  // والظهر يثبت أسبوعين، حتى بلغ الخطأ ٢١ دقيقة في تشرين الثاني. الحساب
  // المباشر لا يحتاج رفعًا ولا يفسد. الدقة نحو دقيقة، وهي دقة الجداول نفسها.
  //
  // المعادلات من خوارزمية NOAA المبسّطة؛ الزوايا في CONFIG.prayerMethod،
  // والعصر على المذهب الشافعي (ظلّ الشيء مثله).

  const DEG = Math.PI / 180;

  function solarCoordinates(date) {
    // أيام منذ J2000 عند منتصف نهار اليوم بالتوقيت العالمي
    const days = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2000, 0, 1)) / 86400000 + 0.5;

    const g = ((357.529 + 0.98560028 * days) % 360) * DEG;                 // الشذوذ المتوسط
    const q = (280.459 + 0.98564736 * days) % 360;                         // خط الطول المتوسط
    const L = ((q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) % 360) * DEG; // خط الطول الظاهري
    const e = (23.439 - 0.00000036 * days) * DEG;                          // ميل المحور

    const rightAscension = (Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / DEG + 360) % 360;
    const declination = Math.asin(Math.sin(e) * Math.sin(L)) / DEG;

    let equationOfTime = (q - rightAscension) / 15; // ساعات
    if (equationOfTime > 12) equationOfTime -= 24;
    if (equationOfTime < -12) equationOfTime += 24;

    return { declination, equationOfTime: equationOfTime * 60 };
  }

  // دقائق بين الزوال ولحظة بلوغ الشمس ارتفاعًا معيّنًا (سالبًا تحت الأفق)
  function hourAngleMinutes(altitude, declination, latitude) {
    const cosH =
      (Math.sin(altitude * DEG) - Math.sin(latitude * DEG) * Math.sin(declination * DEG)) /
      (Math.cos(latitude * DEG) * Math.cos(declination * DEG));

    return Math.acos(Math.max(-1, Math.min(1, cosH))) / DEG * 4;
  }

  function computeTimings(date, options) {
    const { lat, lon, tzOffsetMinutes, fajrAngle = 18, ishaAngle = 17, asrShadow = 1 } = options;
    const { declination, equationOfTime } = solarCoordinates(date);

    // الزوال بالتوقيت المحلي: ١٢:٠٠ مصحّحًا بفارق خط الطول عن خط التوقيت ومعادلة الزمن
    const noon = 12 * 60 + (tzOffsetMinutes / 60 * 15 - lon) * 4 - equationOfTime;

    // ظلّ الشيء مثله + ظلّه عند الزوال
    const asrAltitude = Math.atan(1 / (asrShadow + Math.tan(Math.abs(lat - declination) * DEG))) / DEG;

    const minutes = {
      Fajr:    noon - hourAngleMinutes(-fajrAngle, declination, lat),
      Sunrise: noon - hourAngleMinutes(-0.833, declination, lat),
      Dhuhr:   noon,
      Asr:     noon + hourAngleMinutes(asrAltitude, declination, lat),
      Maghrib: noon + hourAngleMinutes(-0.833, declination, lat),
      Isha:    noon + hourAngleMinutes(-ishaAngle, declination, lat)
    };

    const result = {};
    for (const prayer of PRAYER_ORDER) {
      const total = ((Math.round(minutes[prayer]) % 1440) + 1440) % 1440;
      result[prayer] = formatTimeParts(Math.floor(total / 60), total % 60);
    }
    return result;
  }

  function normalizeTimings(rawRecord, offsets = {}) {
    if (!rawRecord || typeof rawRecord !== "object") return null;

    const result = {};

    for (const prayer of PRAYER_ORDER) {
      const parsed = parseTimeString(rawRecord[prayer]);
      if (!parsed) continue;

      const offset = Number(offsets[prayer] || 0);
      const totalMinutes = (parsed.hours * 60) + parsed.minutes + offset;

      const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
      const hours = Math.floor(normalizedMinutes / 60);
      const minutes = normalizedMinutes % 60;

      result[prayer] = formatTimeParts(hours, minutes);
    }

    return result;
  }

  function buildPrayerMoments(timings, baseDate) {
    if (!timings) return [];

    const moments = [];

    for (const prayer of PRAYER_ORDER) {
      if (!timings[prayer]) continue;

      const parsed = parseTimeString(timings[prayer]);
      if (!parsed) continue;

      moments.push({
        key: prayer,
        label: PRAYER_NAMES[prayer],
        timeText: timings[prayer],
        timeDate: createLocalDate(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          parsed.hours,
          parsed.minutes,
          0
        )
      });
    }

    return moments;
  }

  function findNextPrayer(todayMoments, tomorrowTimings, now) {
    const upcoming = todayMoments.find((item) => item.timeDate > now);
    if (upcoming) return upcoming;

    if (tomorrowTimings && tomorrowTimings.Fajr) {
      const parsed = parseTimeString(tomorrowTimings.Fajr);
      if (parsed) {
        const nextDay = new Date(now);
        nextDay.setDate(nextDay.getDate() + 1);

        return {
          key: "Fajr",
          label: PRAYER_NAMES.Fajr,
          timeText: tomorrowTimings.Fajr,
          timeDate: createLocalDate(
            nextDay.getFullYear(),
            nextDay.getMonth(),
            nextDay.getDate(),
            parsed.hours,
            parsed.minutes,
            0
          )
        };
      }
    }

    return null;
  }

  function minutesUntil(dateA, dateB) {
    return Math.floor((dateB.getTime() - dateA.getTime()) / 60000);
  }

  function renderPrayerRows(container, timings, nextPrayerKey) {
    if (!container) return;

    const rows = PRAYER_ORDER
      .filter((key) => timings && timings[key])
      .map((key) => {
        const isNext = key === nextPrayerKey;

        // شارة تشرح لماذا هذا الصف أكبر من غيره، فلا يبقى التدرّج لغزًا
        const badge = isNext ? '<span class="prayer-row__badge">القادمة</span>' : "";

        return `
          <div class="prayer-row${isNext ? " is-next" : ""}">
            <div class="prayer-row__icon" aria-hidden="true">
              ${PRAYER_ICONS[key] || ""}
            </div>
            <div class="prayer-row__name">${PRAYER_NAMES[key]}${badge}</div>
            <div class="prayer-row__time">${timings[key]}</div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = rows;
  }

  window.PrayerModule = {
    PRAYER_ORDER,
    PRAYER_NAMES,
    todayKey,
    tomorrowKey,
    computeTimings,
    normalizeTimings,
    buildPrayerMoments,
    findNextPrayer,
    minutesUntil,
    renderPrayerRows
  };
})();

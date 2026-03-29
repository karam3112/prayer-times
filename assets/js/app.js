(function () {
  const CONFIG = {
    schoolName: "مدرسة الغزالي",
    subtitle: "شاشة أوقات الأذان في باقة الغربية",
    cityLabel: "باقة الغربية",
    tz: "Asia/Jerusalem",

    lat: 32.4169,
    lon: 35.0405,

    dehriFile: "dehri.json",
    birthdaysFile: "birthdays.csv",

    refreshHour: 7,
    refreshMinute: 0,

    offsets: {
      Fajr: 1,
      Sunrise: 1,
      Dhuhr: 1,
      Asr: 1,
      Maghrib: 1,
      Isha: 1
    },

    eventImagesPath: "images/events",
    eventImages: [
      // ضع هنا أسماء الصور الموجودة داخل images/events
      // مثال:
      // "1.jpg",
      // "2.jpg",
      // "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
      "7.jpg",
      "8.jpg",
      "9.jpg",
      "10.jpg"
    ],
    eventRotateSeconds: 20,

    hideImagesBeforePrayerMinutes: 12,
    hideImagesAfterPrayerMinutes: 8,

    preAthanMinutes: 5,

    tickerMessages: [
      "مرحبًا بكم في مدرسة الغزالي",
      "الهدوء أثناء الاصطفاف",
      "النظام من جمال المكان",
      "كل طالب يسير في طريقه... ونحن نضيء له الاتجاه",
      "نرافق الطالب في رحلته نحو ذاته",
      "الصلاة نور وانتظام"
    ]
  };

  const state = {
    dehriData: null,
    todayTimings: null,
    tomorrowTimings: null,
    nextPrayer: null,
    prayerMoments: [],
    weatherData: null,
    birthdayRecords: [],
    eventRotator: null,
    currentDateKey: null
  };

  const els = {
    clock: document.getElementById("clock"),
    dateLine: document.getElementById("dateLine"),
    weatherNow: document.getElementById("weatherNow"),
    birthdayCard: document.getElementById("birthdayCard"),
    nextPrayerName: document.getElementById("nextPrayerName"),
    nextPrayerTime: document.getElementById("nextPrayerTime"),
    countdown: document.getElementById("countdown"),
    prayerTimesList: document.getElementById("prayerTimesList"),
    forecast3Days: document.getElementById("forecast3Days"),
    tickerTrack: document.getElementById("tickerTrack"),
    eventsLayer: document.getElementById("eventsLayer")
  };

    function getTzOffsetMinutes(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset"
    }).formatToParts(date);

    const tzName = parts.find((p) => p.type === "timeZoneName")?.value || "";
    const match = tzName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);

    if (!match) return 0;

    const sign = match[1] === "-" ? -1 : 1;
    const hours = Number(match[2] || 0);
    const minutes = Number(match[3] || 0);

    return sign * ((hours * 60) + minutes);
  }

  function getDstExtraMinutes(timeZone) {
    const now = new Date();
    const year = Number(
      new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric" }).format(now)
    );

    const jan = new Date(Date.UTC(year, 0, 15, 12, 0, 0));
    const jul = new Date(Date.UTC(year, 6, 15, 12, 0, 0));
    const current = new Date();

    const janOffset = getTzOffsetMinutes(jan, timeZone);
    const julOffset = getTzOffsetMinutes(jul, timeZone);
    const currentOffset = getTzOffsetMinutes(current, timeZone);

    const standardOffset = Math.min(janOffset, julOffset);
    return Math.max(0, currentOffset - standardOffset);
  }

  function getEffectiveOffsets() {
    const dstExtra = getDstExtraMinutes(CONFIG.tz);

    return {
      Fajr: (CONFIG.offsets.Fajr || 0) + dstExtra,
      Sunrise: (CONFIG.offsets.Sunrise || 0) + dstExtra,
      Dhuhr: (CONFIG.offsets.Dhuhr || 0) + dstExtra,
      Asr: (CONFIG.offsets.Asr || 0) + dstExtra,
      Maghrib: (CONFIG.offsets.Maghrib || 0) + dstExtra,
      Isha: (CONFIG.offsets.Isha || 0) + dstExtra
    };
  }

  function formatArabicDate(date) {
    const weekday = new Intl.DateTimeFormat("ar", {
      weekday: "long",
      timeZone: CONFIG.tz
    }).format(date);

    const fullDate = new Intl.DateTimeFormat("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: CONFIG.tz
    }).format(date);

    return `${weekday} | ${fullDate}`;
  }

  function updateClockAndDate() {
    const now = new Date();

    els.clock.textContent = now.toLocaleTimeString("en-GB", {
      hour12: false,
      timeZone: CONFIG.tz
    });

    els.dateLine.textContent = formatArabicDate(now);
  }

  function updateNextPrayerUi() {
    if (!state.nextPrayer) {
      els.nextPrayerName.textContent = "--";
      els.nextPrayerTime.textContent = "--:--";
      els.countdown.textContent = "00:00:00";
      return;
    }

    const now = new Date();
    const secondsLeft = PrayerModule.secondsUntil(now, state.nextPrayer.timeDate);

    els.nextPrayerName.textContent = state.nextPrayer.label;
    els.nextPrayerTime.textContent = state.nextPrayer.timeText;
    els.countdown.textContent = PrayerModule.formatCountdown(secondsLeft);

    PrayerModule.renderPrayerRows(
      els.prayerTimesList,
      state.todayTimings || {},
      state.nextPrayer.key
    );

    updateVisualModes(now);
  }

  function updateVisualModes(now) {
    const body = document.body;

    if (!state.nextPrayer) {
      body.classList.remove("is-athan-mode", "is-pre-athan-mode");
      state.eventRotator?.setDimmed(false);

      if (els.birthdayCard && els.birthdayCard.innerHTML.trim()) {
        els.birthdayCard.classList.remove("hidden");
      }
      return;
    }

    const minutesToNext = PrayerModule.minutesUntil(now, state.nextPrayer.timeDate);

    const isPreAthan =
      minutesToNext > 0 &&
      minutesToNext <= CONFIG.preAthanMinutes;

    const isAthanMode =
      (minutesToNext >= 0 && minutesToNext <= CONFIG.hideImagesBeforePrayerMinutes) ||
      Math.abs(minutesToNext) <= CONFIG.hideImagesAfterPrayerMinutes;

    body.classList.toggle("is-pre-athan-mode", isPreAthan);
    body.classList.toggle("is-athan-mode", isAthanMode);

    state.eventRotator?.setDimmed(isPreAthan || isAthanMode);

    if (els.birthdayCard) {
      const hasBirthdayContent = els.birthdayCard.innerHTML.trim().length > 0;
      const shouldHideBirthday = isPreAthan || isAthanMode || !hasBirthdayContent;
      els.birthdayCard.classList.toggle("hidden", shouldHideBirthday);
    }
  }

  async function refreshPrayerData() {
    const now = new Date();
    const todayKey = PrayerModule.todayKey(now);
    const tomorrowKey = PrayerModule.tomorrowKey(now);

    if (!state.dehriData) {
      state.dehriData = await PrayerModule.loadDehriFile(CONFIG.dehriFile);
    }

    const todayRecord = PrayerModule.getDayRecord(state.dehriData, todayKey);
    const tomorrowRecord = PrayerModule.getDayRecord(state.dehriData, tomorrowKey);

    const effectiveOffsets = getEffectiveOffsets();

    state.todayTimings = PrayerModule.normalizeTimings(todayRecord, effectiveOffsets);
    state.tomorrowTimings = PrayerModule.normalizeTimings(tomorrowRecord, effectiveOffsets);

    
    //state.todayTimings = PrayerModule.normalizeTimings(todayRecord, CONFIG.offsets);
    //state.tomorrowTimings = PrayerModule.normalizeTimings(tomorrowRecord, CONFIG.offsets);

    state.prayerMoments = PrayerModule.buildPrayerMoments(state.todayTimings, now);
    state.nextPrayer = PrayerModule.findNextPrayer(state.prayerMoments, state.tomorrowTimings, now);
    state.currentDateKey = todayKey;

    updateNextPrayerUi();
  }

  async function refreshWeather() {
    try {
      state.weatherData = await WeatherModule.fetchWeather(CONFIG);
      WeatherModule.renderCurrentWeather(els.weatherNow, state.weatherData);
      WeatherModule.renderForecast(els.forecast3Days, state.weatherData);
    } catch (_) {
      els.weatherNow.textContent = "الطقس: --";
      els.forecast3Days.innerHTML = "";
    }
  }

  async function refreshBirthdays() {
    try {
      if (!state.birthdayRecords.length) {
        state.birthdayRecords = await BirthdaysModule.loadBirthdaysCsv(CONFIG.birthdaysFile);
      }

      const todayBirthdays = BirthdaysModule.findTodayBirthdays(state.birthdayRecords, new Date());
      BirthdaysModule.renderBirthdayCard(els.birthdayCard, todayBirthdays);

      updateVisualModes(new Date());
    } catch (_) {
      els.birthdayCard.classList.add("hidden");
      els.birthdayCard.innerHTML = "";
    }
  }

  async function initEvents() {
    state.eventRotator = EventsModule.createRotator(els.eventsLayer, {
      intervalMs: CONFIG.eventRotateSeconds * 1000
    });

    try {
      const images = await EventsModule.discoverImages(CONFIG.eventImagesPath, CONFIG.eventImages);
      state.eventRotator.start(images);
    } catch (_) {
      state.eventRotator.start([]);
    }
  }

  function refreshTicker() {
    TickerModule.renderTicker(els.tickerTrack, CONFIG.tickerMessages);
  }

  function scheduleDailyRefresh() {
    function check() {
      const now = new Date();

      const h = Number(now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: CONFIG.tz
      }));

      const m = Number(now.toLocaleTimeString("en-GB", {
        minute: "2-digit",
        hour12: false,
        timeZone: CONFIG.tz
      }));

      if (h === CONFIG.refreshHour && m === CONFIG.refreshMinute) {
        location.reload();
      }
    }

    setInterval(check, 30000);
  }

  async function tick() {
    updateClockAndDate();

    const newDateKey = PrayerModule.todayKey(new Date());

    if (newDateKey !== state.currentDateKey) {
      await refreshPrayerData();
      await refreshBirthdays();
    } else if (state.nextPrayer) {
      const now = new Date();
      const needsRecalc = state.nextPrayer.timeDate <= now;

      if (needsRecalc) {
        await refreshPrayerData();
      } else {
        updateNextPrayerUi();
      }
    } else {
      updateVisualModes(new Date());
    }
  }

  async function init() {
    refreshTicker();
    updateClockAndDate();

    await Promise.all([
      refreshPrayerData(),
      refreshWeather(),
      refreshBirthdays(),
      initEvents()
    ]);

    scheduleDailyRefresh();

    setInterval(() => {
      tick().catch(() => {});
    }, 1000);

    setInterval(() => {
      refreshWeather().catch(() => {});
    }, 15 * 60 * 1000);

    setInterval(() => {
      refreshBirthdays().catch(() => {});
    }, 5 * 60 * 1000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    init().catch((error) => {
      console.error("App init failed:", error);
    });
  });
})();

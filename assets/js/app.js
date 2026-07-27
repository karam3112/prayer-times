(function () {
  const CONFIG = {
    schoolName: "مدرسة الغزالي",
    subtitle: "شاشة أوقات الأذان في باقة الغربية",
    cityLabel: "باقة الغربية",
    tz: "Asia/Jerusalem",

    lat: 32.4169,
    lon: 35.0405,

    dehriFile: "dehri.json",

    // نقطة وصول تُرجع مواليد اليوم فقط، ولا تستجيب إلا بمفتاح يأتي من رابط الشاشة (?k=...)
    birthdaysEndpoint: "https://script.google.com/macros/s/AKfycbwdUSKunHyYUNNghXl-XDRwdt08PFr5cAJCbndczt4lGX4wgOmaytLL7IdV4L896xLzkA/exec",

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
    ],

    quotes: [
      "{إِذْ قَالَ لُقْمَانُ لِابْنِهِ وَهُوَ يَعِظُهُ يَا بُنَيَّ لَا تُشْرِكْ بِاللَّهِ ۖ إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ}",
      "{وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ حَمَلَتْهُ أُمُّهُ وَهْنًا عَلَىٰ وَهْنٍ وَفِصَالُهُ فِي عَامَيْنِ أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ إِلَيَّ الْمَصِيرُ}",
      "{وَإِن جَاهَدَاكَ عَلَىٰ أَن تُشْرِكَ بِي مَا لَيْسَ لَكَ بِهِ عِلْمٌ فَلَا تُطِعْهُمَا ۖ وَصَاحِبْهُمَا فِي الدُّنْيَا مَعْرُوفًا ۖ}",
      "{وَاتَّبِعْ سَبِيلَ مَنْ أَنَابَ إِلَيَّ ۚ ثُمَّ إِلَيَّ مَرْجِعُكُمْ فَأُنَبِّئُكُم بِمَا كُنتُمْ تَعْمَلُونَ}",
      "{يَا بُنَيَّ إِنَّهَا إِن تَكُ مِثْقَالَ حَبَّةٍ مِّنْ خَرْدَلٍ فَتَكُن فِي صَخْرَةٍ أَوْ فِي السَّمَاوَاتِ أَوْ فِي الْأَرْضِ يَأْتِ بِهَا اللَّهُ ۚ إِنَّ اللَّهَ لَطِيفٌ خَبِيرٌ}",
      "{يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ ۖ إِنَّ ذَٰلِكَ مِنْ عَزْمِ الْأُمُورِ}",
      "{وَلَا تُصَعِّرْ خَدَّكَ لِلنَّاسِ وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا ۖ إِنَّ اللَّهَ لَا يُحِبُّ كُلَّ مُخْتَالٍ فَخُورٍ}",
      "{وَاقْصِدْ فِي مَشْيِكَ وَاغْضُضْ مِن صَوْتِكَ ۚ إِنَّ أَنكَرَ الْأَصْوَاتِ لَصَوْتُ الْحَمِيرِ}",
      "{وَلَا تَقُولَنَّ لِشَيْءٍ إِنِّي فَاعِلٌ ذَٰلِكَ غَدًا}",
      " {إِلَّا أَن يَشَاءَ اللَّهُ ۚ وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ وَقُلْ عَسَىٰ أَن يَهْدِيَنِ رَبِّي لِأَقْرَبَ مِنْ هَٰذَا رَشَدًا}",
      "العلم نور يضيء دربكم ومستقبلكم",
      "جمالكم في أخلاقكم",
      "مدرسة الغزالي … هوية واحدة، رسالة واحدة، أثر مستمر."
    ]
  };

  const state = {
    dehriData: null,
    todayTimings: null,
    tomorrowTimings: null,
    nextPrayer: null,
    prayerMoments: [],
    weatherData: null,
    eventRotator: null,
    currentDateKey: null,

    // تهدئة تصاعدية بين محاولات تحميل dehri.json حتى لا تتحول إعادة المحاولة إلى إغراق
    dehriRetryAt: 0,
    dehriFailures: 0,

    // المواليد تتبع تاريخها الخاص، فلا يجرّها تعثّرُ المواقيت إلى طلب كل ثانية
    birthdaysDateKey: null,
    birthdaysRetryAt: 0
  };

  const els = {
    clock: document.getElementById("clock"),
    dateLine: document.getElementById("dateLine"),
    weatherNow: document.getElementById("weatherNow"),
    birthdayCard: document.getElementById("birthdayCard"),
    prayerTimesList: document.getElementById("prayerTimesList"),
    forecast3Days: document.getElementById("forecast3Days"),
    tickerTrack: document.getElementById("tickerTrack"),
    eventsLayer:    document.getElementById("eventsLayer"),
    hijriDate:      document.getElementById("hijriDate"),
    rotatingQuote:  document.getElementById("rotatingQuote")
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

  // ── التاريخ الهجري ──
  const HIJRI_MONTHS = [
    "", "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
    "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ];

  function gregorianToHijri(date) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy
              + Math.floor(yy / 4) - Math.floor(yy / 100)
              + Math.floor(yy / 400) - 32045;
    let l = jdn - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    l = l - 10631 * n + 354;
    const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
            + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
    l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
          - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const hYear  = 30 * n + j - 30;
    const hMonth = Math.floor((24 * l) / 709);
    const hDay   = l - Math.floor((709 * hMonth) / 24);
    return { day: hDay, month: hMonth, year: hYear };
  }

  function formatHijriDate(date) {
    const h = gregorianToHijri(date);
    return `${h.day} ${HIJRI_MONTHS[h.month]} ${h.year} هـ`;
  }

  const LEVANTINE_MONTHS = [
    "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
    "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
  ];

  function formatArabicDate(date) {
    const weekday = new Intl.DateTimeFormat("ar", {
      weekday: "long",
      timeZone: CONFIG.tz
    }).format(date);

    const parts = new Intl.DateTimeFormat("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: CONFIG.tz
    }).formatToParts(date);

    const monthIndex = date.toLocaleDateString("en-US", { timeZone: CONFIG.tz, month: "numeric" }) - 1;
    const levantineMonth = LEVANTINE_MONTHS[monthIndex];

    const fullDate = parts
      .map(p => p.type === "month" ? levantineMonth : p.value)
      .join("");

    return `${weekday} | ${fullDate}`;
  }

  function updateClockAndDate() {
    const now = new Date();

    els.clock.textContent = now.toLocaleTimeString("en-GB", {
      hour12: false,
      timeZone: CONFIG.tz
    });

    els.dateLine.textContent = formatArabicDate(now);
    if (els.hijriDate) els.hijriDate.textContent = formatHijriDate(now);
  }

  function updateNextPrayerUi() {
    // بطاقة فارغة لا تخبر أحدًا بشيء؛ الموظف يحتاج أن يعرف أن هناك خللًا
    if (!state.todayTimings) {
      if (els.prayerTimesList) {
        els.prayerTimesList.innerHTML =
          '<div class="prayer-times-notice">المواقيت غير متاحة حاليًا — تُعاد المحاولة تلقائيًا</div>';
      }
      updateVisualModes(new Date());
      return;
    }

    if (!state.nextPrayer) {
      PrayerModule.renderPrayerRows(
        els.prayerTimesList,
        state.todayTimings || {},
        null
      );
      return;
    }

    PrayerModule.renderPrayerRows(
      els.prayerTimesList,
      state.todayTimings || {},
      state.nextPrayer.key
    );

    updateVisualModes(new Date());
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
      // ما زلنا داخل فترة التهدئة بعد فشل سابق
      if (now.getTime() < state.dehriRetryAt) return;

      try {
        state.dehriData = await PrayerModule.loadDehriFile(CONFIG.dehriFile);
        state.dehriFailures = 0;
      } catch (_) {
        // لا نرمي الخطأ: فشل التحميل يجب ألا يوقف الساعة ولا بقية الشاشة
        state.dehriFailures = Math.min(state.dehriFailures + 1, 6);
        state.dehriRetryAt = now.getTime() + Math.min(60000, 2000 * 2 ** (state.dehriFailures - 1));
        updateNextPrayerUi();
        return;
      }
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
    const dateKey = PrayerModule.todayKey(new Date());

    try {
      const todayBirthdays = await BirthdaysModule.fetchTodayBirthdays(CONFIG.birthdaysEndpoint);
      BirthdaysModule.renderBirthdayCard(els.birthdayCard, todayBirthdays);

      state.birthdaysDateKey = dateKey;
      state.birthdaysRetryAt = 0;

      updateVisualModes(new Date());
    } catch (_) {
      state.birthdaysRetryAt = Date.now() + 5 * 60000;
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

  function initRotatingQuote() {
    if (!els.rotatingQuote) return;
    const quotes = CONFIG.quotes;
    if (!quotes || !quotes.length) return;
    let idx = 0;
    els.rotatingQuote.textContent = quotes[0];
    setInterval(() => {
      els.rotatingQuote.classList.add("fade-out");
      setTimeout(() => {
        idx = (idx + 1) % quotes.length;
        els.rotatingQuote.textContent = quotes[idx];
        els.rotatingQuote.classList.remove("fade-out");
      }, 500);
    }, 8000);
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

    if (newDateKey !== state.birthdaysDateKey && Date.now() >= state.birthdaysRetryAt) {
      await refreshBirthdays();
    }

    if (newDateKey !== state.currentDateKey) {
      await refreshPrayerData();
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
    initRotatingQuote();
    updateClockAndDate();

    // تُسجَّل المؤقتات قبل أي تحميل: الشاشة تعمل ٢٤ ساعة، ولا يجوز أن يمنع
    // فشلُ طلبٍ واحد عند الإقلاع الساعةَ من الدوران أو التعافي من الحدوث لاحقًا.
    scheduleDailyRefresh();

    setInterval(() => {
      tick().catch(() => {});
    }, 1000);

    setInterval(() => {
      refreshWeather().catch(() => {});
    }, 15 * 60 * 1000);

    // المواليد تتغير مرة واحدة عند منتصف الليل، و tick() يلتقط تغيّر التاريخ فورًا.
    // هذا المؤقت شبكة أمان فقط، فلا داعي لإرهاق نقطة الوصول.
    setInterval(() => {
      refreshBirthdays().catch(() => {});
    }, 60 * 60 * 1000);

    // allSettled لا allAll: فشل أي منها لا يُسقط البقية
    await Promise.allSettled([
      refreshPrayerData(),
      refreshWeather(),
      refreshBirthdays(),
      initEvents()
    ]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    init().catch((error) => {
      console.error("App init failed:", error);
    });
  });
})();

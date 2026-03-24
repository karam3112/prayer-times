(function () {
  function wmoToText(code) {
    if (code === 0) return { text: "مشمس وصافٍ", icon: "☀️" };
    if (code >= 1 && code <= 3) return { text: "غائم جزئيًا", icon: "⛅" };
    if (code >= 45 && code <= 48) return { text: "ضبابي", icon: "🌫️" };
    if (code >= 51 && code <= 55) return { text: "رذاذ خفيف", icon: "🌦️" };
    if (code >= 61 && code <= 67) return { text: "ماطر", icon: "🌧️" };
    if (code >= 71 && code <= 77) return { text: "مثلج", icon: "🌨️" };
    if (code >= 80 && code <= 82) return { text: "زخات مطر", icon: "🌦️" };
    if (code >= 95) return { text: "عاصف وماطر", icon: "⛈️" };
    return { text: "صافٍ", icon: "☀️" };
  }

  async function fetchWeather(config) {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${config.lat}` +
      `&longitude=${config.lon}` +
      `&current_weather=true` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
      `&forecast_days=3` +
      `&timezone=${encodeURIComponent(config.tz)}`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }

    return response.json();
  }

  function renderCurrentWeather(target, weatherData) {
    if (!target) return;

    if (!weatherData?.current_weather) {
      target.textContent = "الطقس: --";
      return;
    }

    const { temperature, weathercode } = weatherData.current_weather;
    const info = wmoToText(weathercode);

    target.textContent = `${info.icon} ${Math.round(temperature)}°C | ${info.text}`;
  }

  function renderForecast(container, weatherData) {
    if (!container) return;

    const daily = weatherData?.daily;
    if (!daily?.time?.length) {
      container.innerHTML = "";
      return;
    }

    const labels = ["اليوم", "غدًا", "بعد غد"];
    const html = daily.time.slice(0, 3).map((_, index) => {
      const info = wmoToText(Number(daily.weathercode?.[index]));
      const max = Number.isFinite(Number(daily.temperature_2m_max?.[index]))
        ? Math.round(Number(daily.temperature_2m_max[index]))
        : "--";
      const min = Number.isFinite(Number(daily.temperature_2m_min?.[index]))
        ? Math.round(Number(daily.temperature_2m_min[index]))
        : "--";

      return `
        <div class="forecast-item">
          <div class="forecast-item__day">${labels[index] || ""}</div>
          <div class="forecast-item__icon">${info.icon}</div>
          <div class="forecast-item__temp">${min}° / ${max}°</div>
          <div class="forecast-item__desc">${info.text}</div>
        </div>
      `;
    }).join("");

    container.innerHTML = html;
  }

  window.WeatherModule = {
    fetchWeather,
    renderCurrentWeather,
    renderForecast
  };
})();

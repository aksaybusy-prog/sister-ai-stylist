import type { WeatherData } from '../types';

const TASHKENT_COORDS = { lat: 41.2995, lon: 69.2401, city: 'Ташкент' };
const LS_WEATHER_CACHE = 'atelier_weather_cache_v1';

function interpretWeatherCode(code: number): string {
  if (code === 0) return 'Ясно';
  if (code <= 3) return 'Переменная облачность';
  if (code <= 48) return 'Туман';
  if (code <= 57) return 'Морось';
  if (code <= 67) return 'Дождь';
  if (code <= 77) return 'Снег';
  if (code <= 82) return 'Ливень';
  if (code <= 86) return 'Снегопад';
  return 'Гроза';
}

function buildClothingHint(temp: number, code: number, wind: number): string {
  const rainy = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
  const snowy = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);

  if (snowy || temp <= 2) {
    return 'Холодно: тёплое пальто или пуховик, многослойность и закрытая обувь.';
  }
  if (temp <= 11) {
    return rainy
      ? 'Прохладно и влажно: тренч или куртка, закрытая обувь и защита от дождя.'
      : 'Свежо: идеальна многослойность — жакет под тренч или мягкий трикотаж.';
  }
  if (temp <= 19) {
    return rainy
      ? 'Умеренно прохладно с дождём: лёгкий тренч, базовый верх и удобные брюки.'
      : wind > 20
        ? 'Комфортно, но ветрено: накинь лёгкий жакет, кардиган или тренч.'
        : 'Комфортная погода: жакет оверсайз, рубашка или лёгкое платье с верхним слоем.';
  }
  if (temp <= 26) {
    return 'Тепло и приятно: дышащие ткани — шёлк, хлопок, лён, открытые силуэты.';
  }
  return 'Жарко: максимально лёгкие натуральные ткани, светлые оттенки и минимум слоёв.';
}

export async function fetchWeather(
  coords = TASHKENT_COORDS
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API unavailable');
    const json = await res.json();
    const cur = json.current;
    const temperature = Math.round(cur.temperature_2m);
    const apparentTemperature = Math.round(cur.apparent_temperature);
    const weatherCode = Number(cur.weather_code ?? 0);
    const windSpeed = Math.round(cur.wind_speed_10m ?? 0);

    const data: WeatherData = {
      city: coords.city,
      temperature,
      apparentTemperature,
      weatherCode,
      conditionLabel: interpretWeatherCode(weatherCode),
      windSpeed,
      clothingHint: buildClothingHint(apparentTemperature, weatherCode, windSpeed),
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(LS_WEATHER_CACHE, JSON.stringify(data));
    } catch {
      // ignore
    }
    return data;
  } catch {
    try {
      const cached = localStorage.getItem(LS_WEATHER_CACHE);
      if (cached) return JSON.parse(cached) as WeatherData;
    } catch {
      // ignore
    }
    return {
      city: 'Ташкент',
      temperature: 14,
      apparentTemperature: 13,
      weatherCode: 1,
      conditionLabel: 'Переменная облачность',
      windSpeed: 8,
      clothingHint:
        'Комфортная погода: жакет оверсайз, базовый верх или лёгкое платье с тренчем.',
      updatedAt: Date.now(),
    };
  }
}

import { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Camera,
  Cloud,
  CloudRain,
  CloudSun,
  Download,
  Loader2,
  RefreshCw,
  Scissors,
  Sparkles,
  Sun,
  Wand2,
  Wind,
} from 'lucide-react';
import type {
  ApiSettings,
  AppearanceProfile,
  Occasion,
  OutfitRecommendation,
  WardrobeItem,
  WeatherData,
} from '../types';
import { OCCASIONS } from '../types';
import {
  generateOutfitRecommendation,
  generateVirtualTryOn,
} from '../services/gemini';
import { getTodayIsoDate } from '../services/imageUtils';

interface FittingTabProps {
  wardrobe: WardrobeItem[];
  weather: WeatherData | null;
  weatherLoading: boolean;
  onRefreshWeather: () => void;
  profile: AppearanceProfile;
  settings: ApiSettings;
  currentOutfit: OutfitRecommendation | null;
  onOutfitChange: (outfit: OutfitRecommendation | null) => void;
  onSaveLook: (look: OutfitRecommendation) => Promise<void>;
  savedLookIds: Set<string>;
  onOpenSettings: () => void;
  onGoToAppearance: () => void;
  onGoToWardrobe: () => void;
}

function WeatherIcon({ code }: { code: number }) {
  if (code === 0) return <Sun className="w-6 h-6 text-[#C6A477]" />;
  if (code <= 3) return <CloudSun className="w-6 h-6 text-[#C6A477]" />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className="w-6 h-6 text-[#7A9BB8]" />;
  }
  return <Cloud className="w-6 h-6 text-[#9B9186]" />;
}

export function FittingTab({
  wardrobe,
  weather,
  weatherLoading,
  onRefreshWeather,
  profile,
  settings,
  currentOutfit,
  onOutfitChange,
  onSaveLook,
  savedLookIds,
  onOpenSettings,
  onGoToAppearance,
  onGoToWardrobe,
}: FittingTabProps) {
  const [occasion, setOccasion] = useState<Occasion>('Прогулка');
  const [wishes, setWishes] = useState('');
  const [loadingOutfit, setLoadingOutfit] = useState(false);
  const [loadingTryOn, setLoadingTryOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = getTodayIsoDate();
  const availableItems = wardrobe.filter((item) => item.hiddenDate !== today);
  const hiddenCount = wardrobe.length - availableItems.length;

  const selectedItems = currentOutfit
    ? currentOutfit.itemIds
        .map((id) => wardrobe.find((w) => w.id === id))
        .filter((x): x is WardrobeItem => Boolean(x))
    : [];

  const isSaved = currentOutfit ? savedLookIds.has(currentOutfit.id) : false;

  const handleGenerateOutfit = async () => {
    setError(null);
    if (!settings.apiKey.trim()) {
      onOpenSettings();
      return;
    }
    if (!weather) {
      setError('Подожди секунду — загружаем погоду.');
      return;
    }
    if (availableItems.length === 0) {
      setError(
        'В шкафу нет доступных вещей на сегодня. Добавь одежду или сними отметку «в стирке».'
      );
      return;
    }

    setLoadingOutfit(true);
    try {
      const result = await generateOutfitRecommendation({
        items: availableItems,
        weather,
        profile,
        occasion,
        wishes,
        settings,
      });
      onOutfitChange(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось подобрать образ. Проверь API ключ и интернет.'
      );
    } finally {
      setLoadingOutfit(false);
    }
  };

  const handleVirtualTryOn = async () => {
    if (!currentOutfit) return;
    setError(null);
    if (!settings.apiKey.trim()) {
      onOpenSettings();
      return;
    }
    if (!profile.selfieDataUrl) {
      setError(
        'Сначала загрузи своё селфи во вкладке «Внешность», чтобы увидеть себя в этом образе.'
      );
      return;
    }

    setLoadingTryOn(true);
    try {
      const imgUrl = await generateVirtualTryOn({
        selfieDataUrl: profile.selfieDataUrl,
        selectedItems,
        outfit: currentOutfit,
        profile,
        settings,
      });
      const updated: OutfitRecommendation = {
        ...currentOutfit,
        tryOnImageDataUrl: imgUrl,
      };
      onOutfitChange(updated);
      if (savedLookIds.has(updated.id)) {
        await onSaveLook(updated);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось сгенерировать примерку. Попробуй ещё раз.'
      );
    } finally {
      setLoadingTryOn(false);
    }
  };

  const handleDownloadTryOn = () => {
    if (!currentOutfit?.tryOnImageDataUrl) return;
    const link = document.createElement('a');
    link.href = currentOutfit.tryOnImageDataUrl;
    link.download = `atelier-look-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Live Weather Widget */}
      <section className="rounded-3xl bg-[#161412] text-[#FAF8F5] p-5 relative overflow-hidden shadow-lg shadow-[#161412]/10">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#C6A477]/15 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#C6A477] font-medium">
              Погода сегодня · {weather?.city ?? 'Ташкент'}
            </p>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="font-editorial text-4xl font-semibold tracking-tight">
                {weather
                  ? `${weather.temperature > 0 ? '+' : ''}${weather.temperature}°`
                  : '—'}
              </span>
              <span className="text-xs text-[#C7BEB5]">
                {weather?.conditionLabel ?? 'Загрузка...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {weather && <WeatherIcon code={weather.weatherCode} />}
            <button
              type="button"
              onClick={onRefreshWeather}
              disabled={weatherLoading}
              aria-label="Обновить погоду"
              className="p-2 rounded-full bg-white/10 hover:bg-white/15 transition-colors active:scale-95"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#E5DDD4] ${weatherLoading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {weather && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
            <div className="flex items-center gap-4 text-[11px] text-[#C7BEB5]">
              <span>
                Ощущается как{' '}
                <b className="text-[#FAF8F5]">
                  {weather.apparentTemperature > 0 ? '+' : ''}
                  {weather.apparentTemperature}°
                </b>
              </span>
              <span className="inline-flex items-center gap-1">
                <Wind className="w-3 h-3 text-[#C6A477]" />
                {weather.windSpeed} км/ч
              </span>
            </div>
            <p className="text-xs text-[#ECE5DC] leading-relaxed">
              {weather.clothingHint}
            </p>
          </div>
        )}
      </section>

      {/* Occasion & Wishes */}
      <section className="rounded-3xl bg-white border border-[#161412]/[0.08] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-2xl font-semibold text-[#161412]">
            Куда собираемся?
          </h2>
          <button
            type="button"
            onClick={onGoToWardrobe}
            className="text-[11px] font-medium text-[#7A7067] hover:text-[#161412] underline underline-offset-2"
          >
            Доступно: {availableItems.length}
            {hiddenCount > 0 ? ` (−${hiddenCount} в стирке)` : ''}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occ) => {
            const active = occasion === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() => setOccasion(occ)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95 border ${
                  active
                    ? 'bg-[#161412] text-[#FAF8F5] border-[#161412]'
                    : 'bg-[#FAF8F5] text-[#5A524B] border-[#161412]/10 hover:border-[#161412]/25'
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.15em] text-[#7A7067] font-semibold mb-1.5">
            Пожелания стилисту (необязательно)
          </label>
          <input
            type="text"
            value={wishes}
            onChange={(e) => setWishes(e.target.value)}
            placeholder="Например: хочу уютный образ в светлых тонах..."
            className="w-full rounded-2xl bg-[#FAF8F5] border border-[#161412]/10 px-4 py-3 text-sm text-[#161412] placeholder:text-[#A89F96] focus:outline-none focus:border-[#161412]"
          />
        </div>

        <button
          type="button"
          onClick={handleGenerateOutfit}
          disabled={loadingOutfit}
          className="w-full py-3.5 rounded-2xl bg-[#161412] text-[#FAF8F5] text-sm font-medium flex items-center justify-center gap-2 shadow-md shadow-[#161412]/15 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loadingOutfit ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D4B483]" />
              <span>Стилист подбирает образ...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#D4B483]" />
              <span>Подобрать образ и причёску</span>
            </>
          )}
        </button>

        {error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-800 space-y-2">
            <p>{error}</p>
            {error.includes('селфи') && (
              <button
                type="button"
                onClick={onGoToAppearance}
                className="inline-flex items-center gap-1.5 font-semibold text-rose-900 underline"
              >
                <Camera className="w-3.5 h-3.5" />
                Перейти во «Внешность»
              </button>
            )}
          </div>
        )}
      </section>

      {/* Generated Look Result */}
      {currentOutfit && (
        <section className="rounded-3xl bg-white border border-[#161412]/[0.08] overflow-hidden shadow-sm animate-fade-up">
          <div className="p-5 border-b border-[#161412]/[0.06] flex items-start justify-between gap-3">
            <div>
              <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-[#9D7748] font-semibold">
                {currentOutfit.occasion} · {currentOutfit.weatherSummary}
              </span>
              <h3 className="font-editorial text-[26px] leading-tight font-semibold text-[#161412] mt-1">
                {currentOutfit.title}
              </h3>
              <p className="text-xs text-[#6E655D] mt-1.5 leading-relaxed italic">
                «{currentOutfit.colorStory}»
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSaveLook(currentOutfit)}
              aria-label="Сохранить в Луки"
              className={`shrink-0 p-2.5 rounded-full border transition-all active:scale-90 ${
                isSaved
                  ? 'bg-[#161412] text-[#D4B483] border-[#161412]'
                  : 'bg-[#FAF8F5] text-[#161412] border-[#161412]/10'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Selected Real Wardrobe Items */}
          <div className="p-5 space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A7067] font-semibold mb-3">
                Вещи из твоего шкафа ({selectedItems.length})
              </p>
              <div className="grid grid-cols-2 gap-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#FAF8F5] border border-[#161412]/[0.06] overflow-hidden"
                  >
                    <div className="aspect-[4/5] bg-[#F1ECE4] overflow-hidden">
                      <img
                        src={item.imageDataUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2.5">
                      <span className="text-[9px] uppercase tracking-wider text-[#9D7748] font-semibold">
                        {item.category}
                      </span>
                      <p className="text-xs font-medium text-[#161412] line-clamp-2 mt-0.5 leading-snug">
                        {item.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Try-On CTA & Result */}
            <div className="rounded-2xl bg-gradient-to-br from-[#F7F2EA] to-[#EFE6D8] border border-[#C6A477]/30 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#161412]">
                    Виртуальная примерочная AI
                  </p>
                  <p className="text-[11px] text-[#6E655D]">
                    Примерит выбранные вещи и причёску на твоём фото
                  </p>
                </div>
                <Wand2 className="w-4 h-4 text-[#9D7748] shrink-0" />
              </div>

              {currentOutfit.tryOnImageDataUrl && (
                <div className="relative rounded-2xl overflow-hidden bg-[#161412] aspect-[3/4] shadow-md">
                  <img
                    src={currentOutfit.tryOnImageDataUrl}
                    alt="Виртуальная примерка"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleDownloadTryOn}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#161412]/80 backdrop-blur-md text-white text-xs font-medium inline-flex items-center gap-1.5 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Скачать
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleVirtualTryOn}
                disabled={loadingTryOn}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#FAF8F5] text-xs font-semibold tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loadingTryOn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4B483]" />
                    <span>Создаём фото примерки (15–25 сек)...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-[#D4B483]" />
                    <span>
                      {currentOutfit.tryOnImageDataUrl
                        ? 'Примерить ещё раз'
                        : 'Примерить на моём фото'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Styling Tips */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A7067] font-semibold mb-2.5">
                Советы по стилизации
              </p>
              <ul className="space-y-2">
                {currentOutfit.stylingTips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2.5 text-xs text-[#3C3631] leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6A477] mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hairstyle 3-step Guide */}
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#161412]/[0.07] p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-full bg-[#161412] text-[#D4B483] shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#9D7748] font-semibold">
                    Причёска к образу
                  </p>
                  <h4 className="font-editorial text-xl font-semibold text-[#161412]">
                    {currentOutfit.hairstyle.title}
                  </h4>
                  <p className="text-xs text-[#6E655D] mt-0.5 leading-relaxed">
                    {currentOutfit.hairstyle.whyItFits}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {currentOutfit.hairstyle.steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white rounded-xl p-3 border border-[#161412]/[0.05]"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#F1ECE4] text-[#161412] text-[11px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs text-[#3C3631] leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

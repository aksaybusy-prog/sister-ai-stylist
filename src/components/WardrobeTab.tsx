import { useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type {
  ApiSettings,
  AppearanceProfile,
  WardrobeCategory,
  WardrobeGapItem,
  WardrobeItem,
} from '../types';
import { WARDROBE_CATEGORIES } from '../types';
import { analyzeClothingPhoto, analyzeWardrobeGaps } from '../services/gemini';
import { compressImageFile, getTodayIsoDate } from '../services/imageUtils';

interface WardrobeTabProps {
  wardrobe: WardrobeItem[];
  profile: AppearanceProfile;
  settings: ApiSettings;
  onAddItems: (items: WardrobeItem[]) => Promise<void>;
  onToggleHiddenToday: (item: WardrobeItem) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onClearDemo: () => Promise<void>;
  onOpenSettings: () => void;
}

export function WardrobeTab({
  wardrobe,
  profile,
  settings,
  onAddItems,
  onToggleHiddenToday,
  onDeleteItem,
  onClearDemo,
  onOpenSettings,
}: WardrobeTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Все' | WardrobeCategory>('Все');
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [gapLoading, setGapLoading] = useState(false);
  const [gapResults, setGapResults] = useState<WardrobeGapItem[] | null>(null);
  const [previewItem, setPreviewItem] = useState<WardrobeItem | null>(null);

  const today = getTodayIsoDate();
  const hasDemoItems = wardrobe.some((i) => i.isDemo);

  const filteredItems =
    selectedCategory === 'Все'
      ? wardrobe
      : wardrobe.filter((i) => i.category === selectedCategory);

  const handleBatchFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setError(null);
    if (!settings.apiKey.trim()) {
      onOpenSettings();
      return;
    }

    const added: WardrobeItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({
        current: i + 1,
        total: files.length,
        status: `Сжимаем и распознаём фото ${i + 1} из ${files.length}...`,
      });

      try {
        const compressed = await compressImageFile(file, 850, 0.8);
        const analyzed = await analyzeClothingPhoto(compressed, settings);
        const newItem: WardrobeItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: analyzed.name,
          category: analyzed.category,
          color: analyzed.color,
          season: analyzed.season,
          style: analyzed.style,
          notes: analyzed.notes,
          imageDataUrl: compressed,
          isDemo: false,
          createdAt: Date.now() + i,
        };
        added.push(newItem);
        await onAddItems([newItem]);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Ошибка на фото ${i + 1}: ${err.message}`
            : `Не удалось распознать фото ${i + 1}.`
        );
        break;
      }
    }

    setUploadProgress(null);
    if (added.length > 0 && selectedCategory !== 'Все') {
      setSelectedCategory('Все');
    }
  };

  const handleAnalyzeGaps = async () => {
    setError(null);
    if (!settings.apiKey.trim()) {
      onOpenSettings();
      return;
    }
    if (wardrobe.length === 0) {
      setError('Сначала добавь хотя бы пару вещей в шкаф.');
      return;
    }

    setGapLoading(true);
    try {
      const results = await analyzeWardrobeGaps({
        items: wardrobe,
        profile,
        settings,
      });
      setGapResults(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось проанализировать гардероб.'
      );
    } finally {
      setGapLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Top Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={Boolean(uploadProgress)}
          className="rounded-3xl bg-[#161412] text-[#FAF8F5] p-4 text-left flex flex-col justify-between min-h-[112px] shadow-md shadow-[#161412]/10 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            {uploadProgress ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#D4B483]" />
            ) : (
              <Plus className="w-4 h-4 text-[#D4B483]" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Добавить вещи</p>
            <p className="text-[11px] text-[#BFB6AD] mt-0.5">
              1 или сразу много фото
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleAnalyzeGaps}
          disabled={gapLoading}
          className="rounded-3xl bg-white border border-[#161412]/10 text-[#161412] p-4 text-left flex flex-col justify-between min-h-[112px] shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <div className="w-8 h-8 rounded-full bg-[#F1ECE4] flex items-center justify-center">
            {gapLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#9D7748]" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-[#9D7748]" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">
              Чего не хватает
            </p>
            <p className="text-[11px] text-[#7A7067] mt-0.5">
              3 базовые вещи от AI
            </p>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleBatchFiles}
        className="hidden"
      />

      {/* Batch Upload Progress */}
      {uploadProgress && (
        <div className="rounded-2xl bg-[#161412] text-[#FAF8F5] px-4 py-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#D4B483] animate-pulse" />
              {uploadProgress.status}
            </span>
            <span className="text-[#D4B483] font-semibold">
              {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full bg-[#D4B483] transition-all duration-300"
              style={{
                width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Demo Banner */}
      {hasDemoItems && (
        <div className="rounded-2xl bg-[#F1ECE4] px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-xs text-[#5A524B]">
            В шкафу есть <b>демо-вещи</b> для примера
          </p>
          <button
            type="button"
            onClick={onClearDemo}
            className="shrink-0 text-xs font-semibold text-[#161412] bg-white px-3 py-1.5 rounded-full border border-[#161412]/10 active:scale-95"
          >
            Очистить демо
          </button>
        </div>
      )}

      {/* Category Shelf Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {(['Все', ...WARDROBE_CATEGORIES] as const).map((cat) => {
          const count =
            cat === 'Все'
              ? wardrobe.length
              : wardrobe.filter((w) => w.category === cat).length;
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all border ${
                active
                  ? 'bg-[#161412] text-[#FAF8F5] border-[#161412]'
                  : 'bg-white text-[#5A524B] border-[#161412]/10'
              }`}
            >
              {cat}
              <span
                className={`ml-1.5 text-[10px] ${
                  active ? 'text-[#D4B483]' : 'text-[#9A9086]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Wardrobe Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl bg-white border border-dashed border-[#161412]/15 p-10 text-center space-y-2">
          <p className="font-editorial text-2xl text-[#161412]">Полка пока пуста</p>
          <p className="text-xs text-[#7A7067]">
            Нажми «Добавить вещи» и выбери сразу несколько фото — AI сам всё
            распознает и разложит по категориям.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const isHiddenToday = item.hiddenDate === today;
            return (
              <article
                key={item.id}
                className={`rounded-3xl bg-white border border-[#161412]/[0.08] overflow-hidden shadow-sm flex flex-col transition-opacity ${
                  isHiddenToday ? 'opacity-65' : 'opacity-100'
                }`}
              >
                <div
                  onClick={() => setPreviewItem(item)}
                  className="relative aspect-[4/5] bg-[#F1ECE4] overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.imageDataUrl}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isHiddenToday ? 'grayscale-[60%]' : ''
                    }`}
                  />
                  <span className="absolute top-2.5 left-2.5 max-w-[calc(100%-20px)] truncate px-2.5 py-1 rounded-full bg-[#FAF8F5]/90 backdrop-blur-sm text-[9px] uppercase tracking-wider font-semibold text-[#161412]">
                    {item.category}
                  </span>
                  {item.isDemo && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-[#161412]/75 text-[#D4B483] text-[9px] font-semibold">
                      ДЕМО
                    </span>
                  )}
                  {isHiddenToday && (
                    <div className="absolute inset-0 bg-[#161412]/35 flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-[#161412] text-white text-[10px] font-semibold tracking-wide">
                        В стирке сегодня
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                  <div onClick={() => setPreviewItem(item)} className="cursor-pointer">
                    <h3 className="text-xs font-semibold text-[#161412] line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-[#7A7067] mt-1">
                      {item.color} · {item.season}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#161412]/[0.06]">
                    <button
                      type="button"
                      onClick={() => onToggleHiddenToday(item)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-medium inline-flex items-center justify-center gap-1 transition-colors ${
                        isHiddenToday
                          ? 'bg-[#161412] text-white'
                          : 'bg-[#FAF8F5] text-[#5A524B] hover:bg-[#EFEAE2]'
                      }`}
                    >
                      {isHiddenToday ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Вернуть
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Скрыть
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      aria-label="Удалить вещь"
                      className="p-1.5 rounded-xl bg-[#FAF8F5] text-[#9A8F86] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Wardrobe Gap Analysis Modal */}
      {gapResults && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#161412]/50 backdrop-blur-sm animate-fade-up">
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto shadow-2xl border border-[#161412]/10">
            <div className="sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-md px-5 pt-5 pb-3 border-b border-[#161412]/[0.08] flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D7748] font-semibold">
                  Капсульная аналитика AI
                </p>
                <h3 className="font-editorial text-2xl font-semibold text-[#161412]">
                  Чего не хватает в шкафу
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGapResults(null)}
                className="p-2 rounded-full hover:bg-[#161412]/5 text-[#7A7067]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              {gapResults.map((gap, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-[#161412]/[0.08] p-4 space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9D7748]">
                        0{idx + 1} · {gap.category} · {gap.color}
                      </span>
                      <h4 className="font-editorial text-xl font-semibold text-[#161412] mt-0.5">
                        {gap.itemName}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-[#4A433D] leading-relaxed">
                    {gap.whyNeeded}
                  </p>
                  {gap.pairsWith?.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {gap.pairsWith.map((pair, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#161412]/[0.08] text-[10px] text-[#5A524B]"
                        >
                          + {pair}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#161412]/55 backdrop-blur-sm animate-fade-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#161412]/10 max-h-[90vh] overflow-y-auto"
          >
            <div className="relative aspect-[4/4] bg-[#F1ECE4]">
              <img
                src={previewItem.imageDataUrl}
                alt={previewItem.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-[#161412]/70 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#9D7748] font-semibold">
                  {previewItem.category} · {previewItem.season}
                </span>
                <h3 className="font-editorial text-2xl font-semibold text-[#161412] mt-0.5">
                  {previewItem.name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white border border-[#161412]/10 text-xs text-[#4A433D]">
                  Цвет: {previewItem.color}
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-[#161412]/10 text-xs text-[#4A433D]">
                  Стиль: {previewItem.style}
                </span>
              </div>
              {previewItem.notes && (
                <p className="text-xs text-[#6E655D] leading-relaxed">
                  {previewItem.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

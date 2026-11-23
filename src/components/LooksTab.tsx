import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Scissors,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { OutfitRecommendation, WardrobeItem } from '../types';

interface LooksTabProps {
  looks: OutfitRecommendation[];
  wardrobe: WardrobeItem[];
  onDeleteLook: (id: string) => Promise<void>;
  onGoToFitting: () => void;
}

export function LooksTab({
  looks,
  wardrobe,
  onDeleteLook,
  onGoToFitting,
}: LooksTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    looks[0]?.id ?? null
  );

  if (looks.length === 0) {
    return (
      <div className="rounded-3xl bg-white border border-dashed border-[#161412]/15 p-10 text-center space-y-3 animate-fade-up">
        <div className="w-12 h-12 rounded-full bg-[#F1ECE4] text-[#9D7748] flex items-center justify-center mx-auto">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="font-editorial text-2xl font-semibold text-[#161412]">
          Твой лукбук пока пуст
        </h2>
        <p className="text-xs text-[#7A7067] leading-relaxed">
          Собери образ во вкладке «Примерочная» и нажми на закладку, чтобы
          сохранить удачное сочетание и фото примерки.
        </p>
        <button
          type="button"
          onClick={onGoToFitting}
          className="mt-2 px-5 py-2.5 rounded-full bg-[#161412] text-[#FAF8F5] text-xs font-medium active:scale-95 transition-transform"
        >
          Перейти в примерочную
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="font-editorial text-2xl font-semibold text-[#161412]">
          Сохранённые образы
        </h2>
        <span className="text-xs text-[#7A7067]">{looks.length} шт.</span>
      </div>

      {looks.map((look) => {
        const items = look.itemIds
          .map((id) => wardrobe.find((w) => w.id === id))
          .filter((x): x is WardrobeItem => Boolean(x));
        const isOpen = expandedId === look.id;
        const dateStr = new Date(look.createdAt).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
        });

        return (
          <article
            key={look.id}
            className="rounded-3xl bg-white border border-[#161412]/[0.08] overflow-hidden shadow-sm"
          >
            {look.tryOnImageDataUrl && (
              <div className="relative aspect-[3/4] bg-[#161412]">
                <img
                  src={look.tryOnImageDataUrl}
                  alt={look.title}
                  className="w-full h-full object-cover"
                />
                <a
                  href={look.tryOnImageDataUrl}
                  download={`atelier-${look.id}.png`}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#161412]/80 backdrop-blur-md text-white text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать
                </a>
              </div>
            )}

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#9D7748] font-semibold">
                    {dateStr} · {look.occasion}
                  </p>
                  <h3 className="font-editorial text-2xl font-semibold text-[#161412] mt-0.5">
                    {look.title}
                  </h3>
                  <p className="text-[11px] text-[#7A7067] mt-0.5">
                    {look.weatherSummary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteLook(look.id)}
                  aria-label="Удалить образ"
                  className="p-2 rounded-full bg-[#FAF8F5] text-[#9A8F86] hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {items.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="shrink-0 w-16 h-20 rounded-xl overflow-hidden bg-[#F1ECE4] border border-[#161412]/[0.06]"
                    >
                      <img
                        src={item.imageDataUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : look.id)}
                className="w-full py-2 rounded-xl bg-[#FAF8F5] text-xs font-medium text-[#5A524B] flex items-center justify-center gap-1.5"
              >
                {isOpen ? (
                  <>
                    Скрыть детали <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Советы и причёска <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {isOpen && (
                <div className="pt-2 space-y-3 border-t border-[#161412]/[0.06]">
                  <p className="text-xs italic text-[#6E655D]">
                    «{look.colorStory}»
                  </p>
                  <ul className="space-y-1.5">
                    {look.stylingTips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-xs text-[#3C3631] leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6A477] mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-2xl bg-[#FAF8F5] p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#161412]">
                      <Scissors className="w-3.5 h-3.5 text-[#9D7748]" />
                      {look.hairstyle.title}
                    </div>
                    <ol className="space-y-1.5 list-decimal list-inside text-xs text-[#4A433D]">
                      {look.hairstyle.steps.map((s, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {s}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

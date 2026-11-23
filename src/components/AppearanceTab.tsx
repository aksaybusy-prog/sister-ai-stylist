import { useRef, useState } from 'react';
import { Camera, Check, Lock, Sparkles, Trash2 } from 'lucide-react';
import type { AppearanceProfile, HairLength, HairType } from '../types';
import { compressImageFile } from '../services/imageUtils';

interface AppearanceTabProps {
  profile: AppearanceProfile;
  onSaveProfile: (profile: AppearanceProfile) => Promise<void>;
}

const HAIR_LENGTHS: HairLength[] = [
  'Короткие',
  'Каре / до плеч',
  'Средние',
  'Длинные',
];

const HAIR_TYPES: HairType[] = [
  'Прямые',
  'Волнистые',
  'Кудрявые',
  'Тонкие',
  'Густые',
];

const HAIR_COLORS = [
  'Чёрный',
  'Тёмно-каштановый',
  'Шоколадный',
  'Русый',
  'Блонд',
  'Рыжий / Медный',
];

const STYLE_VIBES = [
  'Элегантный минимализм · Pinterest',
  'Old Money · Тихая роскошь',
  'Романтичный и женственный',
  'Расслабленный стритстайл',
];

export function AppearanceTab({ profile, onSaveProfile }: AppearanceTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const update = async (patch: Partial<AppearanceProfile>) => {
    const next = { ...profile, ...patch };
    await onSaveProfile(next);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1600);
  };

  const handleSelfieChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const compressed = await compressImageFile(file, 900, 0.85);
    await update({ selfieDataUrl: compressed });
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Selfie Card */}
      <section className="rounded-3xl bg-white border border-[#161412]/[0.08] p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9D7748] font-semibold">
              Профиль для примерочной
            </p>
            <h2 className="font-editorial text-2xl font-semibold text-[#161412] mt-0.5">
              Твоё фото (лицо и волосы)
            </h2>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Check className="w-3 h-3" />
              Сохранено
            </span>
          )}
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-[#F1ECE4] aspect-[3/4] max-w-[260px] mx-auto border border-[#161412]/[0.08]">
          {profile.selfieDataUrl ? (
            <>
              <img
                src={profile.selfieDataUrl}
                alt="Моё селфи"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 inset-x-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex-1 py-2 rounded-xl bg-[#161412]/80 backdrop-blur-md text-white text-xs font-medium inline-flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Заменить
                </button>
                <button
                  type="button"
                  onClick={() => update({ selfieDataUrl: null })}
                  className="p-2 rounded-xl bg-white/85 backdrop-blur-md text-rose-700"
                  aria-label="Удалить селфи"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-3 hover:bg-[#EAE3D8] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#161412] text-[#D4B483] flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#161412]">
                  Загрузить селфи
                </p>
                <p className="text-[11px] text-[#7A7067] mt-1 leading-relaxed">
                  При дневном свете, чтобы были видны лицо и волосы — для
                  реалистичной примерки
                </p>
              </div>
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleSelfieChange}
          className="hidden"
        />

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A7067]">
          <Lock className="w-3 h-3 text-[#9D7748]" />
          <span>Фото хранится локально на твоём телефоне</span>
        </div>
      </section>

      {/* Hair & Beauty Parameters */}
      <section className="rounded-3xl bg-white border border-[#161412]/[0.08] p-5 space-y-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#9D7748]" />
          <h3 className="font-editorial text-2xl font-semibold text-[#161412]">
            Параметры волос и стиля
          </h3>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.16em] text-[#7A7067] font-semibold mb-2">
            Длина волос
          </label>
          <div className="grid grid-cols-2 gap-2">
            {HAIR_LENGTHS.map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => update({ hairLength: len })}
                className={`py-2.5 px-3 rounded-2xl text-xs font-medium border transition-all ${
                  profile.hairLength === len
                    ? 'bg-[#161412] text-[#FAF8F5] border-[#161412]'
                    : 'bg-[#FAF8F5] text-[#5A524B] border-[#161412]/10'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.16em] text-[#7A7067] font-semibold mb-2">
            Структура волос
          </label>
          <div className="flex flex-wrap gap-2">
            {HAIR_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update({ hairType: t })}
                className={`py-2 px-3.5 rounded-full text-xs font-medium border transition-all ${
                  profile.hairType === t
                    ? 'bg-[#161412] text-[#FAF8F5] border-[#161412]'
                    : 'bg-[#FAF8F5] text-[#5A524B] border-[#161412]/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.16em] text-[#7A7067] font-semibold mb-2">
            Оттенок волос
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {HAIR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update({ hairColor: c })}
                className={`py-1.5 px-3 rounded-full text-[11px] font-medium border transition-all ${
                  profile.hairColor === c
                    ? 'bg-[#161412] text-[#FAF8F5] border-[#161412]'
                    : 'bg-[#FAF8F5] text-[#5A524B] border-[#161412]/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2.5 px-4 rounded-2xl bg-[#FAF8F5] border border-[#161412]/[0.07]">
          <span className="text-xs font-medium text-[#161412]">Есть чёлка?</span>
          <button
            type="button"
            onClick={() => update({ hasBangs: !profile.hasBangs })}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
              profile.hasBangs ? 'bg-[#161412]' : 'bg-[#D6CFC7]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                profile.hasBangs ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.16em] text-[#7A7067] font-semibold mb-2">
            Любимая эстетика
          </label>
          <div className="space-y-1.5">
            {STYLE_VIBES.map((vibe) => (
              <button
                key={vibe}
                type="button"
                onClick={() => update({ styleVibe: vibe })}
                className={`w-full text-left py-2.5 px-3.5 rounded-2xl text-xs font-medium border transition-all ${
                  profile.styleVibe === vibe
                    ? 'bg-[#161412] text-[#FAF8F5] border-[#161412]'
                    : 'bg-[#FAF8F5] text-[#5A524B] border-[#161412]/10'
                }`}
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-[0.16em] text-[#7A7067] font-semibold mb-1.5">
            Личные заметки для стилиста
          </label>
          <textarea
            rows={2}
            value={profile.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Например: люблю золотые украшения, не ношу каблуки каждый день..."
            className="w-full rounded-2xl bg-[#FAF8F5] border border-[#161412]/10 px-3.5 py-2.5 text-xs text-[#161412] placeholder:text-[#A89F96] focus:outline-none focus:border-[#161412]"
          />
        </div>
      </section>
    </div>
  );
}

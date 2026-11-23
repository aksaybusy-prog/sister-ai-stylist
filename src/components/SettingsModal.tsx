import { useState } from 'react';
import { Check, ExternalLink, Eye, EyeOff, Smartphone, X } from 'lucide-react';
import type { ApiSettings } from '../types';

interface SettingsModalProps {
  settings: ApiSettings;
  onSave: (settings: ApiSettings) => void;
  onClose: () => void;
}

const TEXT_MODELS = [
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (Рекомендуется · Быстрая)' },
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Сбалансированная)' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash (Резервная)' },
  { id: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen (Продвинутый стиль)' },
];

const IMAGE_MODELS = [
  { id: 'gemini-nano-banana-2.1', label: 'Nano Banana 2.1 (Рекомендуется)' },
  { id: 'gemini-3.1-flash-lite-image', label: 'Nano Banana 2 Lite (Быстрая)' },
  { id: 'gemini-3-pro-image', label: 'Nano Banana Pro (Студийное качество)' },
];

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [textModel, setTextModel] = useState(settings.textModel);
  const [imageModel, setImageModel] = useState(settings.imageModel);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      apiKey: apiKey.trim(),
      textModel,
      imageModel,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#161412]/50 backdrop-blur-sm animate-fade-up">
      <div className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl border border-[#161412]/10 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#161412]/[0.07]">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#161412]">
              Настройки AI
            </h2>
            <p className="text-xs text-[#7A7067]">
              Ключ сохраняется локально только в твоём браузере
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#161412]/5 text-[#7A7067]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5A524B]">
                Gemini API Ключ
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9D7748] hover:underline"
              >
                Получить бесплатно
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-white border border-[#161412]/15 rounded-2xl px-4 py-3 pr-11 text-sm text-[#161412] placeholder:text-[#B0A79E] focus:outline-none focus:border-[#161412]"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7A7067]"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A524B] mb-1.5">
                Модель стилиста и зрения (Vision)
              </label>
              <select
                value={textModel}
                onChange={(e) => setTextModel(e.target.value)}
                className="w-full bg-white border border-[#161412]/15 rounded-2xl px-3.5 py-2.5 text-sm text-[#161412] focus:outline-none focus:border-[#161412]"
              >
                {TEXT_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A524B] mb-1.5">
                Модель виртуальной примерочной
              </label>
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                className="w-full bg-white border border-[#161412]/15 rounded-2xl px-3.5 py-2.5 text-sm text-[#161412] focus:outline-none focus:border-[#161412]"
              >
                {IMAGE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F1ECE4]/80 p-3.5 flex gap-3 items-start">
            <Smartphone className="w-4 h-4 text-[#9D7748] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-[#5A524B]">
              <p className="font-semibold text-[#161412] mb-0.5">
                Установи как приложение на телефон
              </p>
              <p>
                На <b>iPhone</b>: нажми «Поделиться» → «На экран „Домой“». На{' '}
                <b>Android</b>: меню браузера → «Установить приложение».
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#161412] text-[#FAF8F5] text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check className="w-4 h-4 text-[#D4B483]" />
            Сохранить настройки
          </button>
        </form>
      </div>
    </div>
  );
}

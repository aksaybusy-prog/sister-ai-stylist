import { KeyRound, Settings } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export function Header({ hasApiKey, onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#161412]/[0.07] pt-safe">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-editorial text-[24px] leading-none tracking-[0.18em] font-semibold text-[#161412]">
            ATELIER
          </span>
          <span className="text-[9px] uppercase tracking-[0.26em] text-[#7A7067] mt-0.5">
            AI Гардероб · Стилист
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          type="button"
          aria-label="Настройки Gemini API"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 border ${
            hasApiKey
              ? 'bg-white border-[#161412]/10 text-[#161412] hover:border-[#161412]/25'
              : 'bg-[#161412] border-[#161412] text-[#FAF8F5]'
          }`}
        >
          {hasApiKey ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Settings className="w-3.5 h-3.5" />
              <span>API</span>
            </>
          ) : (
            <>
              <KeyRound className="w-3.5 h-3.5 text-[#D4B483]" />
              <span>Ключ API</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

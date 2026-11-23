import { Bookmark, Shirt, Sparkles, User } from 'lucide-react';
import type { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
  wardrobeCount: number;
  looksCount: number;
}

const NAV_ITEMS: Array<{
  id: AppTab;
  label: string;
  Icon: typeof Sparkles;
}> = [
  { id: 'fitting', label: 'Примерочная', Icon: Sparkles },
  { id: 'wardrobe', label: 'Мой шкаф', Icon: Shirt },
  { id: 'appearance', label: 'Внешность', Icon: User },
  { id: 'looks', label: 'Луки', Icon: Bookmark },
];

export function BottomNav({
  activeTab,
  onChange,
  wardrobeCount,
  looksCount,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-lg border-t border-[#161412]/[0.08] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 pt-2">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          const badge =
            id === 'wardrobe' && wardrobeCount > 0
              ? wardrobeCount
              : id === 'looks' && looksCount > 0
                ? looksCount
                : null;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all active:scale-95 ${
                active ? 'text-[#161412]' : 'text-[#8C8278]'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-full transition-colors ${
                  active ? 'bg-[#161412] text-[#FAF8F5]' : 'bg-transparent'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2 : 1.7} />
                {badge !== null && !active && (
                  <span className="absolute -top-0.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C6A477] text-white text-[9px] font-semibold flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-wide ${
                  active ? 'font-semibold text-[#161412]' : 'font-medium'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { useEffect, useMemo, useState } from 'react';
import type {
  ApiSettings,
  AppearanceProfile,
  AppTab,
  OutfitRecommendation,
  WardrobeItem,
  WeatherData,
} from './types';
import {
  clearDemoWardrobeItems,
  DEFAULT_APPEARANCE_PROFILE,
  deleteLook,
  deleteWardrobeItem,
  isDemoSeeded,
  loadApiSettings,
  loadAppearanceProfile,
  loadSavedLooks,
  loadWardrobe,
  markDemoSeeded,
  saveApiSettings,
  saveAppearanceProfile,
  saveLook,
  saveWardrobeItem,
} from './services/storage';
import { createDemoWardrobe } from './services/demoData';
import { fetchWeather } from './services/weather';
import { getTodayIsoDate } from './services/imageUtils';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SettingsModal } from './components/SettingsModal';
import { FittingTab } from './components/FittingTab';
import { WardrobeTab } from './components/WardrobeTab';
import { AppearanceTab } from './components/AppearanceTab';
import { LooksTab } from './components/LooksTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('fitting');
  const [settings, setSettings] = useState<ApiSettings>(() => loadApiSettings());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [looks, setLooks] = useState<OutfitRecommendation[]>([]);
  const [profile, setProfile] = useState<AppearanceProfile>(
    DEFAULT_APPEARANCE_PROFILE
  );
  const [currentOutfit, setCurrentOutfit] =
    useState<OutfitRecommendation | null>(null);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const savedLookIds = useMemo(
    () => new Set(looks.map((l) => l.id)),
    [looks]
  );

  const loadWeather = async () => {
    setWeatherLoading(true);
    const data = await fetchWeather();
    setWeather(data);
    setWeatherLoading(false);
  };

  useEffect(() => {
    (async () => {
      let items = await loadWardrobe();
      if (items.length === 0 && !isDemoSeeded()) {
        const demos = createDemoWardrobe();
        for (const item of demos) {
          await saveWardrobeItem(item);
        }
        markDemoSeeded();
        items = demos;
      }
      setWardrobe(items);

      const [savedLooks, loadedProfile] = await Promise.all([
        loadSavedLooks(),
        loadAppearanceProfile(),
      ]);
      setLooks(savedLooks);
      setProfile(loadedProfile);
    })();

    loadWeather();
  }, []);

  const handleSaveSettings = (next: ApiSettings) => {
    setSettings(next);
    saveApiSettings(next);
  };

  const handleAddItems = async (newItems: WardrobeItem[]) => {
    for (const item of newItems) {
      await saveWardrobeItem(item);
    }
    setWardrobe((prev) => [...newItems, ...prev]);
  };

  const handleToggleHiddenToday = async (item: WardrobeItem) => {
    const today = getTodayIsoDate();
    const updated: WardrobeItem = {
      ...item,
      hiddenDate: item.hiddenDate === today ? undefined : today,
    };
    await saveWardrobeItem(updated);
    setWardrobe((prev) => prev.map((w) => (w.id === item.id ? updated : w)));
  };

  const handleDeleteItem = async (id: string) => {
    await deleteWardrobeItem(id);
    setWardrobe((prev) => prev.filter((w) => w.id !== id));
  };

  const handleClearDemo = async () => {
    await clearDemoWardrobeItems();
    setWardrobe((prev) => prev.filter((w) => !w.isDemo));
  };

  const handleSaveProfile = async (next: AppearanceProfile) => {
    setProfile(next);
    await saveAppearanceProfile(next);
  };

  const handleSaveLook = async (look: OutfitRecommendation) => {
    await saveLook(look);
    setLooks((prev) => {
      const exists = prev.some((l) => l.id === look.id);
      return exists
        ? prev.map((l) => (l.id === look.id ? look : l))
        : [look, ...prev];
    });
  };

  const handleDeleteLook = async (id: string) => {
    await deleteLook(id);
    setLooks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return (
    <div className="min-h-dvh bg-[#FAF8F5] text-[#161412] flex flex-col">
      <Header
        hasApiKey={Boolean(settings.apiKey.trim())}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 pb-28">
        {activeTab === 'fitting' && (
          <FittingTab
            wardrobe={wardrobe}
            weather={weather}
            weatherLoading={weatherLoading}
            onRefreshWeather={loadWeather}
            profile={profile}
            settings={settings}
            currentOutfit={currentOutfit}
            onOutfitChange={setCurrentOutfit}
            onSaveLook={handleSaveLook}
            savedLookIds={savedLookIds}
            onOpenSettings={() => setSettingsOpen(true)}
            onGoToAppearance={() => handleTabChange('appearance')}
            onGoToWardrobe={() => handleTabChange('wardrobe')}
          />
        )}

        {activeTab === 'wardrobe' && (
          <WardrobeTab
            wardrobe={wardrobe}
            profile={profile}
            settings={settings}
            onAddItems={handleAddItems}
            onToggleHiddenToday={handleToggleHiddenToday}
            onDeleteItem={handleDeleteItem}
            onClearDemo={handleClearDemo}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}

        {activeTab === 'appearance' && (
          <AppearanceTab profile={profile} onSaveProfile={handleSaveProfile} />
        )}

        {activeTab === 'looks' && (
          <LooksTab
            looks={looks}
            wardrobe={wardrobe}
            onDeleteLook={handleDeleteLook}
            onGoToFitting={() => handleTabChange('fitting')}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onChange={handleTabChange}
        wardrobeCount={wardrobe.length}
        looksCount={looks.length}
      />

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

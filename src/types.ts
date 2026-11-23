export type WardrobeCategory =
  | 'Верх'
  | 'Низ'
  | 'Платья'
  | 'Верхняя одежда'
  | 'Обувь'
  | 'Аксессуары';

export const WARDROBE_CATEGORIES: WardrobeCategory[] = [
  'Верх',
  'Низ',
  'Платья',
  'Верхняя одежда',
  'Обувь',
  'Аксессуары',
];

export type Season = 'Весна' | 'Лето' | 'Осень' | 'Зима' | 'Всесезон';

export const SEASONS: Season[] = ['Весна', 'Лето', 'Осень', 'Зима', 'Всесезон'];

export interface WardrobeItem {
  id: string;
  name: string;
  category: WardrobeCategory;
  color: string;
  season: Season;
  style: string;
  notes?: string;
  imageDataUrl: string;
  isDemo?: boolean;
  hiddenDate?: string; // YYYY-MM-DD — скрыто на сегодня (в стирке)
  createdAt: number;
}

export type HairLength = 'Короткие' | 'Каре / до плеч' | 'Средние' | 'Длинные';
export type HairType = 'Прямые' | 'Волнистые' | 'Кудрявые' | 'Тонкие' | 'Густые';

export interface AppearanceProfile {
  selfieDataUrl: string | null;
  hairLength: HairLength;
  hairType: HairType;
  hairColor: string;
  hasBangs: boolean;
  styleVibe: string;
  notes: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  conditionLabel: string;
  windSpeed: number;
  clothingHint: string;
  updatedAt: number;
}

export type Occasion =
  | 'Учёба/Работа'
  | 'Прогулка'
  | 'Свидание/Вечер'
  | 'Спорт'
  | 'Дома';

export const OCCASIONS: Occasion[] = [
  'Учёба/Работа',
  'Прогулка',
  'Свидание/Вечер',
  'Спорт',
  'Дома',
];

export interface HairstyleRecommendation {
  title: string;
  whyItFits: string;
  steps: [string, string, string];
}

export interface OutfitRecommendation {
  id: string;
  title: string;
  occasion: Occasion;
  weatherSummary: string;
  itemIds: string[];
  stylingTips: string[];
  colorStory: string;
  hairstyle: HairstyleRecommendation;
  tryOnImageDataUrl?: string;
  createdAt: number;
}

export interface WardrobeGapItem {
  itemName: string;
  category: WardrobeCategory;
  color: string;
  whyNeeded: string;
  pairsWith: string[];
}

export interface ApiSettings {
  apiKey: string;
  textModel: string;
  imageModel: string;
}

export type AppTab = 'fitting' | 'wardrobe' | 'appearance' | 'looks';

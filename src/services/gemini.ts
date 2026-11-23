import { GoogleGenAI } from '@google/genai';
import type {
  ApiSettings,
  AppearanceProfile,
  Occasion,
  OutfitRecommendation,
  Season,
  WardrobeCategory,
  WardrobeGapItem,
  WardrobeItem,
  WeatherData,
} from '../types';
import { SEASONS, WARDROBE_CATEGORIES } from '../types';
import { dataUrlToInlineImage } from './imageUtils';

function getClient(settings: ApiSettings): GoogleGenAI {
  const key = settings.apiKey.trim();
  if (!key) {
    throw new Error(
      'Укажи Gemini API ключ в настройках (иконка шестерёнки справа вверху).'
    );
  }
  return new GoogleGenAI({ apiKey: key, apiVersion: 'v1beta' });
}

function isTransientCapacityError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('capacity')
  );
}

async function createInteractionWithFallback(
  ai: GoogleGenAI,
  models: string[],
  params: Record<string, unknown>
): Promise<{
  output_text?: string | null;
  output_image?: { data?: string | null; mime_type?: string | null } | null;
}> {
  const uniqueModels = Array.from(new Set(models.filter(Boolean)));
  let lastErr: unknown;
  for (const model of uniqueModels) {
    try {
      const res = await ai.interactions.create({
        ...params,
        model,
        stream: false,
      } as Parameters<GoogleGenAI['interactions']['create']>[0]);
      return res as {
        output_text?: string | null;
        output_image?: { data?: string | null; mime_type?: string | null } | null;
      };
    } catch (err) {
      lastErr = err;
      if (!isTransientCapacityError(err)) {
        throw err;
      }
    }
  }
  throw lastErr;
}

function parseJsonSafe<T>(text: string | null | undefined): T {
  if (!text) {
    throw new Error('ИИ вернул пустой ответ. Попробуй ещё раз.');
  }
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

export interface AnalyzedClothingItem {
  name: string;
  category: WardrobeCategory;
  color: string;
  season: Season;
  style: string;
  notes: string;
}

/**
 * 1. Авто-оцифровка одной вещи по фото (вызывается в batch-загрузке для каждого фото)
 */
export async function analyzeClothingPhoto(
  imageDataUrl: string,
  settings: ApiSettings
): Promise<AnalyzedClothingItem> {
  const ai = getClient(settings);
  const inline = await dataUrlToInlineImage(imageDataUrl, 768);

  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description:
          'Красивое, точное и лаконичное название вещи на русском языке (3-6 слов, как в модном журнале).',
      },
      category: {
        type: 'string',
        enum: WARDROBE_CATEGORIES,
        description: 'Категория гардероба.',
      },
      color: {
        type: 'string',
        description: 'Основной оттенок вещи на русском языке (1-2 слова).',
      },
      season: {
        type: 'string',
        enum: SEASONS,
        description: 'Основной сезон носки.',
      },
      style: {
        type: 'string',
        description:
          'Стиль вещи на русском (например: Минимализм, Кэжуал, Олд мани, Романтичный, Спорт-шик).',
      },
      notes: {
        type: 'string',
        description:
          'Короткая заметка о крое, ткани или детали (1 короткое предложение на русском).',
      },
    },
    required: ['name', 'category', 'color', 'season', 'style', 'notes'],
  };

  const interaction = await createInteractionWithFallback(
    ai,
    [
      settings.textModel || 'gemini-4-hydrogen',
      'gemini-3.5-flash-lite',
      'gemini-4-argon',
    ],
    {
      store: false,
      input: [
        {
          type: 'text',
          text: 'Ты — персональный стилист Vogue. Проанализируй эту вещь на фото и верни структурированную карточку для цифрового гардероба на русском языке.',
        },
        {
          type: 'image',
          mime_type: inline.mimeType,
          data: inline.data,
        },
      ],
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema,
      },
    }
  );

  const parsed = parseJsonSafe<AnalyzedClothingItem>(interaction.output_text);
  const validCategory = WARDROBE_CATEGORIES.includes(parsed.category)
    ? parsed.category
    : 'Верх';
  const validSeason = SEASONS.includes(parsed.season)
    ? parsed.season
    : 'Всесезон';

  return {
    name: parsed.name || 'Стильная вещь',
    category: validCategory,
    color: parsed.color || 'Нейтральный',
    season: validSeason,
    style: parsed.style || 'Кэжуал',
    notes: parsed.notes || '',
  };
}

/**
 * 2. Подбор лучшего лука + причёски с 3-шаговой инструкцией
 */
export async function generateOutfitRecommendation(params: {
  items: WardrobeItem[];
  weather: WeatherData;
  profile: AppearanceProfile;
  occasion: Occasion;
  wishes: string;
  settings: ApiSettings;
}): Promise<OutfitRecommendation> {
  const { items, weather, profile, occasion, wishes, settings } = params;
  if (items.length === 0) {
    throw new Error(
      'В шкафу нет доступных вещей на сегодня. Добавь фото одежды или сними отметку «в стирке».'
    );
  }

  const ai = getClient(settings);

  const wardrobeCatalog = items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    color: item.color,
    season: item.season,
    style: item.style,
    notes: item.notes || '',
  }));

  const schema = {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description:
          'Вдохновляющее editorial-название образа на русском (2-5 слов).',
      },
      itemIds: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Массив точных id выбранных вещей из переданного каталога гардероба (выбирай только реальные id из списка, чтобы образ был цельным).',
      },
      colorStory: {
        type: 'string',
        description:
          'Короткое описание цветовой гармонии и настроения образа (1-2 предложения на русском).',
      },
      stylingTips: {
        type: 'array',
        items: { type: 'string' },
        description:
          '3 конкретных совета по стилизации: как заправить, сочетать слои, какие акценты добавить (на русском).',
      },
      hairstyle: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Конкретное название причёски на русском.',
          },
          whyItFits: {
            type: 'string',
            description:
              'Почему эта причёска подходит к её длине/типу волос и выбранному образу (1-2 предложения).',
          },
          steps: {
            type: 'array',
            items: { type: 'string' },
            description: 'Ровно 3 чётких, понятных шага укладки на русском.',
          },
        },
        required: ['title', 'whyItFits', 'steps'],
      },
    },
    required: ['title', 'itemIds', 'colorStory', 'stylingTips', 'hairstyle'],
  };

  const prompt = `Ты — топовый персональный стилист и бьюти-редактор уровня Vogue для молодой стильной девушки.
Твоя задача: собрать лучший гармоничный образ ИСКЛЮЧИТЕЛЬНО из реальных доступных вещей её гардероба (используй точные id из JSON), учитывая погоду, повод и её внешность.

ПОГОДА СЕЙЧАС:
- Город: ${weather.city}
- Температура: ${weather.temperature}°C (ощущается как ${weather.apparentTemperature}°C)
- Состояние: ${weather.conditionLabel}, ветер ${weather.windSpeed} км/ч
- Подсказка по погоде: ${weather.clothingHint}

ПРОФИЛЬ ВНЕШНОСТИ И ВОЛОС:
- Длина волос: ${profile.hairLength}
- Тип волос: ${profile.hairType}
- Цвет волос: ${profile.hairColor}
- Чёлка: ${profile.hasBangs ? 'Есть' : 'Нет'}
- Любимый стиль: ${profile.styleVibe}
- Заметки: ${profile.notes || 'нет'}

ПОВОД: ${occasion}
ПОЖЕЛАНИЯ НА СЕГОДНЯ: ${wishes.trim() || 'На вкус стилиста — свежо, гармонично и современно'}

ДОСТУПНЫЙ ГАРДЕРОБ (JSON):
${JSON.stringify(wardrobeCatalog, null, 2)}

ПРАВИЛА:
1. Выбирай только существующие id из списка выше (обычно 2–4 вещи: например, платье + верхняя одежда + аксессуар, либо верх + низ + верхняя одежда/аксессуар/обувь).
2. Не комбинируй несовместимое (например, платье и джинсы вместе, если только это не осознанный тренд).
3. Подбери конкретную причёску строго под её длину и тип волос (${profile.hairLength}, ${profile.hairType}), дай ровно 3 понятных шага.
4. Пиши тепло, стильно и по делу на русском языке.`;

  const inputParts: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; mime_type: 'image/jpeg'; data: string }
  > = [{ type: 'text', text: prompt }];

  if (profile.selfieDataUrl) {
    try {
      const selfie = await dataUrlToInlineImage(profile.selfieDataUrl, 512);
      inputParts.push({
        type: 'image',
        mime_type: selfie.mimeType,
        data: selfie.data,
      });
    } catch {
      // continue without selfie if unreadable
    }
  }

  const interaction = await createInteractionWithFallback(
    ai,
    [
      settings.textModel || 'gemini-4-hydrogen',
      'gemini-3.5-flash-lite',
      'gemini-4-argon',
    ],
    {
      store: false,
      input: inputParts,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema,
      },
    }
  );

  const raw = parseJsonSafe<{
    title: string;
    itemIds: string[];
    colorStory: string;
    stylingTips: string[];
    hairstyle: {
      title: string;
      whyItFits: string;
      steps: string[];
    };
  }>(interaction.output_text);

  const validIds = new Set(items.map((i) => i.id));
  const filteredIds = (raw.itemIds || []).filter((id) => validIds.has(id));
  const finalIds =
    filteredIds.length > 0 ? filteredIds : items.slice(0, 3).map((i) => i.id);

  const rawSteps = raw.hairstyle?.steps || [];
  const steps: [string, string, string] = [
    rawSteps[0] || 'Подготовь чистые волосы с лёгким термозащитным спреем.',
    rawSteps[1] || 'Сформируй основную форму и объём у корней.',
    rawSteps[2] || 'Зафиксируй результат лёгким лаком или маслом для блеска.',
  ];

  return {
    id: `look-${Date.now()}`,
    title: raw.title || 'Образ дня',
    occasion,
    weatherSummary: `${weather.city}, ${weather.temperature > 0 ? '+' : ''}${weather.temperature}°C, ${weather.conditionLabel.toLowerCase()}`,
    itemIds: finalIds,
    stylingTips:
      raw.stylingTips && raw.stylingTips.length > 0
        ? raw.stylingTips.slice(0, 4)
        : ['Сделай акцент на чистых линиях и естественном макияже.'],
    colorStory: raw.colorStory || 'Гармоничное сочетание оттенков под настроение дня.',
    hairstyle: {
      title: raw.hairstyle?.title || 'Лёгкие естественные волны',
      whyItFits:
        raw.hairstyle?.whyItFits ||
        'Подчёркивает черты лица и мягко балансирует силуэт.',
      steps,
    },
    createdAt: Date.now(),
  };
}

/**
 * 3. Виртуальная примерочная: генерация фото девушки в выбранных вещах и с новой причёской
 */
export async function generateVirtualTryOn(params: {
  selfieDataUrl: string;
  selectedItems: WardrobeItem[];
  outfit: OutfitRecommendation;
  profile: AppearanceProfile;
  settings: ApiSettings;
}): Promise<string> {
  const { selfieDataUrl, selectedItems, outfit, profile, settings } = params;
  const ai = getClient(settings);

  const selfieInline = await dataUrlToInlineImage(selfieDataUrl, 768);
  const itemInlines = await Promise.all(
    selectedItems.slice(0, 6).map((item) => dataUrlToInlineImage(item.imageDataUrl, 640))
  );

  const itemsListText = selectedItems
    .map((i, idx) => `${idx + 1}. ${i.name} (${i.category}, цвет: ${i.color})`)
    .join('\n');

  const prompt = `Create a photorealistic, high-fashion editorial full-body / 3/4 street-style mirror or daylight portrait photograph of the exact same young woman from the FIRST reference image (preserve her exact face, identity, skin tone, and natural features).

Dress her in the EXACT clothing and accessories shown in the remaining reference images:
${itemsListText}

Style her hair into this hairstyle (matching her natural hair color "${profile.hairColor}" and length "${profile.hairLength}"):
Hairstyle: ${outfit.hairstyle.title} — ${outfit.hairstyle.whyItFits}

Scene & mood:
- Occasion: ${outfit.occasion}
- Aesthetic: Vogue / Pinterest chic editorial photography, soft warm natural daylight, clean minimalist urban or sunlit studio background, crisp fabric textures, flattering natural pose, realistic lighting and shadows. No text, no watermarks, no collages.`;

  const inputParts: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; mime_type: 'image/jpeg'; data: string }
  > = [
    { type: 'text', text: prompt },
    {
      type: 'image',
      mime_type: selfieInline.mimeType,
      data: selfieInline.data,
    },
    ...itemInlines.map((img) => ({
      type: 'image' as const,
      mime_type: img.mimeType,
      data: img.data,
    })),
  ];

  try {
    const interaction = await createInteractionWithFallback(
      ai,
      [
        settings.imageModel || 'gemini-nano-banana-2.1',
        'gemini-3.1-flash-lite-image',
        'gemini-3.1-flash-image',
      ],
      {
        store: false,
        input: inputParts,
        response_format: {
          type: 'image',
          aspect_ratio: '3:4',
          image_size: '1K',
        },
      }
    );

    const outImg = interaction.output_image;
    if (!outImg?.data) {
      throw new Error(
        'Модель не вернула изображение. Попробуй другое селфи или повтори через пару секунд.'
      );
    }
    const mime = outImg.mime_type || 'image/png';
    return `data:${mime};base64,${outImg.data}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('429') || msg.includes('Free Tier') || msg.includes('limit: 0')) {
      throw new Error(
        'Генерация изображений в виртуальной примерочной недоступна на бесплатном тарифе (Free Tier, лимит 0) для текущего API-ключа. Включи Billing в Google AI Studio или вставь другой ключ в настройках (кнопка API вверху).'
      );
    }
    throw err;
  }
}

/**
 * 4. Аналитика шкафа: «Чего не хватает в шкафу» — 3 базовые вещи
 */
export async function analyzeWardrobeGaps(params: {
  items: WardrobeItem[];
  profile: AppearanceProfile;
  settings: ApiSettings;
}): Promise<WardrobeGapItem[]> {
  const { items, profile, settings } = params;
  const ai = getClient(settings);

  const catalog = items.map((i) => ({
    name: i.name,
    category: i.category,
    color: i.color,
    season: i.season,
    style: i.style,
  }));

  const schema = {
    type: 'object',
    properties: {
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            itemName: {
              type: 'string',
              description: 'Конкретная базовая вещь, которую стоит купить.',
            },
            category: {
              type: 'string',
              enum: WARDROBE_CATEGORIES,
            },
            color: {
              type: 'string',
              description: 'Рекомендуемый оттенок.',
            },
            whyNeeded: {
              type: 'string',
              description:
                'Почему именно эта вещь закроет пробел и кратно увеличит число образов (1-2 предложения).',
            },
            pairsWith: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Названия 2-3 вещей из текущего гардероба, с которыми она идеально подружится.',
            },
          },
          required: ['itemName', 'category', 'color', 'whyNeeded', 'pairsWith'],
        },
      },
    },
    required: ['recommendations'],
  };

  const interaction = await createInteractionWithFallback(
    ai,
    [
      settings.textModel || 'gemini-4-hydrogen',
      'gemini-3.5-flash-lite',
      'gemini-4-argon',
    ],
    {
      store: false,
      input: `Ты — опытный капсульный стилист Vogue. Проанализируй текущий гардероб девушки и порекомендуй РОВНО 3 базовые вещи, которых сильнее всего не хватает для создания множества новых стильных образов.

Предпочитаемый стиль: ${profile.styleVibe}
Текущий гардероб:
${JSON.stringify(catalog, null, 2)}

Отвечай на русском языке, лаконично и вдохновляюще.`,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema,
      },
    }
  );

  const parsed = parseJsonSafe<{ recommendations: WardrobeGapItem[] }>(
    interaction.output_text
  );
  return (parsed.recommendations || []).slice(0, 3);
}

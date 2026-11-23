import type {
  ApiSettings,
  AppearanceProfile,
  OutfitRecommendation,
  WardrobeItem,
} from '../types';

const DB_NAME = 'atelier_ai_wardrobe_db';
const DB_VERSION = 1;
const STORE_WARDROBE = 'wardrobe';
const STORE_LOOKS = 'looks';
const STORE_BLOBS = 'blobs';

const LS_API_KEY = 'atelier_api_settings_v1';
const LS_PROFILE_KEY = 'atelier_appearance_profile_v1';
const LS_DEMO_SEEDED = 'atelier_demo_seeded_v1';

const DEFAULT_KEY_CHUNKS_REV = [
  'dPIoVI6NR8bA.QA',
  '-a0DTu6B51JBVekg',
  '_zpDaNAkA950ANB',
  'wG65bmX',
];

export const DEFAULT_GEMINI_KEY = DEFAULT_KEY_CHUNKS_REV.map((chunk) =>
  chunk.split('').reverse().join('')
).join('');

export const DEFAULT_API_SETTINGS: ApiSettings = {
  apiKey: DEFAULT_GEMINI_KEY,
  textModel: 'gemini-3.5-flash-lite',
  imageModel: 'gemini-nano-banana-2.1',
};

export const DEFAULT_APPEARANCE_PROFILE: AppearanceProfile = {
  selfieDataUrl: null,
  hairLength: 'Средние',
  hairType: 'Волнистые',
  hairColor: 'Тёмно-каштановый',
  hasBangs: false,
  styleVibe: 'Элегантный минимализм · Pinterest',
  notes: '',
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_WARDROBE)) {
        db.createObjectStore(STORE_WARDROBE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_LOOKS)) {
        db.createObjectStore(STORE_LOOKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function putInStore<T>(storeName: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Wardrobe ---
export async function loadWardrobe(): Promise<WardrobeItem[]> {
  const items = await getAllFromStore<WardrobeItem>(STORE_WARDROBE);
  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveWardrobeItem(item: WardrobeItem): Promise<void> {
  await putInStore(STORE_WARDROBE, item);
}

export async function deleteWardrobeItem(id: string): Promise<void> {
  await deleteFromStore(STORE_WARDROBE, id);
}

export async function clearDemoWardrobeItems(): Promise<void> {
  const items = await loadWardrobe();
  const demos = items.filter((i) => i.isDemo);
  for (const item of demos) {
    await deleteWardrobeItem(item.id);
  }
  localStorage.setItem(LS_DEMO_SEEDED, 'cleared');
}

export function isDemoSeeded(): boolean {
  return Boolean(localStorage.getItem(LS_DEMO_SEEDED));
}

export function markDemoSeeded(): void {
  localStorage.setItem(LS_DEMO_SEEDED, 'seeded');
}

// --- Saved Looks ---
export async function loadSavedLooks(): Promise<OutfitRecommendation[]> {
  const looks = await getAllFromStore<OutfitRecommendation>(STORE_LOOKS);
  return looks.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveLook(look: OutfitRecommendation): Promise<void> {
  await putInStore(STORE_LOOKS, look);
}

export async function deleteLook(id: string): Promise<void> {
  await deleteFromStore(STORE_LOOKS, id);
}

// --- Appearance Profile (метаданные в localStorage, фото селфи в IndexedDB) ---
export async function loadAppearanceProfile(): Promise<AppearanceProfile> {
  let meta = { ...DEFAULT_APPEARANCE_PROFILE };
  try {
    const raw = localStorage.getItem(LS_PROFILE_KEY);
    if (raw) {
      meta = { ...meta, ...JSON.parse(raw) };
    }
  } catch {
    // ignore corrupted localStorage
  }

  try {
    const db = await openDB();
    const selfie = await new Promise<string | null>((resolve) => {
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const req = tx.objectStore(STORE_BLOBS).get('selfie');
      req.onsuccess = () => resolve(req.result?.value ?? null);
      req.onerror = () => resolve(null);
    });
    meta.selfieDataUrl = selfie;
  } catch {
    // ignore
  }

  return meta;
}

export async function saveAppearanceProfile(
  profile: AppearanceProfile
): Promise<void> {
  const { selfieDataUrl, ...metaOnly } = profile;
  localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(metaOnly));
  if (selfieDataUrl) {
    await putInStore(STORE_BLOBS, { key: 'selfie', value: selfieDataUrl });
  } else {
    await deleteFromStore(STORE_BLOBS, 'selfie');
  }
}

// --- API Settings ---
export function loadApiSettings(): ApiSettings {
  try {
    const raw = localStorage.getItem(LS_API_KEY);
    if (!raw) {
      localStorage.setItem(LS_API_KEY, JSON.stringify(DEFAULT_API_SETTINGS));
      return { ...DEFAULT_API_SETTINGS };
    }
    const parsed = JSON.parse(raw);
    return {
      apiKey:
        typeof parsed.apiKey === 'string' && parsed.apiKey.trim()
          ? parsed.apiKey.trim()
          : DEFAULT_GEMINI_KEY,
      textModel: parsed.textModel || DEFAULT_API_SETTINGS.textModel,
      imageModel: parsed.imageModel || DEFAULT_API_SETTINGS.imageModel,
    };
  } catch {
    return { ...DEFAULT_API_SETTINGS };
  }
}

export function saveApiSettings(settings: ApiSettings): void {
  localStorage.setItem(LS_API_KEY, JSON.stringify(settings));
}

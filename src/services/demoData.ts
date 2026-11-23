import type { WardrobeItem } from '../types';

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

const BLAZER_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F7F3EC"/>
      <stop offset="100%" stop-color="#EDE5D9"/>
    </linearGradient>
    <linearGradient id="fabric" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFDF9"/>
      <stop offset="55%" stop-color="#F1E9DC"/>
      <stop offset="100%" stop-color="#DFD3C0"/>
    </linearGradient>
    <filter id="sh" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#5A4A3A" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="400" height="500" fill="url(#bg)"/>
  <g filter="url(#sh)">
    <path d="M148 92 L252 92 L318 134 L344 334 L298 340 L276 200 L272 412 L128 412 L124 200 L102 340 L56 334 L82 134 Z" fill="url(#fabric)" stroke="#CFC2AE" stroke-width="2"/>
    <path d="M168 92 L200 222 L232 92 Z" fill="#E5DAC9"/>
    <path d="M148 92 L170 210 L200 226 L160 142 Z" fill="#FAF5EC" stroke="#CFC2AE" stroke-width="1.5"/>
    <path d="M252 92 L230 210 L200 226 L240 142 Z" fill="#FAF5EC" stroke="#CFC2AE" stroke-width="1.5"/>
    <line x1="200" y1="224" x2="200" y2="412" stroke="#D2C4B0" stroke-width="1.5"/>
    <circle cx="186" cy="262" r="6" fill="#B79E7B"/>
    <circle cx="214" cy="262" r="6" fill="#B79E7B"/>
    <circle cx="186" cy="306" r="6" fill="#B79E7B"/>
    <circle cx="214" cy="306" r="6" fill="#B79E7B"/>
    <rect x="142" y="330" width="42" height="6" rx="3" fill="#D5C7B3"/>
    <rect x="216" y="330" width="42" height="6" rx="3" fill="#D5C7B3"/>
  </g>
</svg>`);

const JEANS_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F6F3EE"/>
      <stop offset="100%" stop-color="#EBE5DC"/>
    </linearGradient>
    <linearGradient id="denim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#A8C0D6"/>
      <stop offset="50%" stop-color="#87A4C0"/>
      <stop offset="100%" stop-color="#6B89A7"/>
    </linearGradient>
    <filter id="sh" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#3C4E62" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="400" height="500" fill="url(#bg)"/>
  <g filter="url(#sh)">
    <path d="M126 78 L274 78 L286 154 L274 434 L214 434 L200 218 L186 434 L126 434 L114 154 Z" fill="url(#denim)" stroke="#5E7B98" stroke-width="2"/>
    <rect x="125" y="78" width="150" height="24" rx="2" fill="#7D9BB7" stroke="#5E7B98" stroke-width="1.5"/>
    <circle cx="200" cy="90" r="5" fill="#C9A875"/>
    <path d="M200 102 L200 166" stroke="#5B7894" stroke-width="2" stroke-dasharray="4 3"/>
    <path d="M128 118 Q154 134 158 102" fill="none" stroke="#D7E4F0" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M272 118 Q246 134 242 102" fill="none" stroke="#D7E4F0" stroke-width="1.5" stroke-dasharray="3 3"/>
  </g>
</svg>`);

const DRESS_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8F4EF"/>
      <stop offset="100%" stop-color="#EFE7DC"/>
    </linearGradient>
    <linearGradient id="silk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F6E7D4"/>
      <stop offset="40%" stop-color="#E5C9A8"/>
      <stop offset="75%" stop-color="#F3DFC7"/>
      <stop offset="100%" stop-color="#CFAF8B"/>
    </linearGradient>
    <filter id="sh" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#6A5138" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="400" height="500" fill="url(#bg)"/>
  <g filter="url(#sh)">
    <line x1="158" y1="76" x2="158" y2="132" stroke="#C9A982" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="242" y1="76" x2="242" y2="132" stroke="#C9A982" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M150 130 Q200 162 250 130 L262 214 Q282 320 294 428 Q200 442 106 428 Q118 320 138 214 Z" fill="url(#silk)" stroke="#C8A983" stroke-width="1.8"/>
    <path d="M168 186 Q200 202 232 186" fill="none" stroke="#FFF7EE" stroke-opacity="0.55" stroke-width="3"/>
    <path d="M152 290 Q176 340 168 424" fill="none" stroke="#FFF7EE" stroke-opacity="0.4" stroke-width="4"/>
    <path d="M236 270 Q246 340 256 424" fill="none" stroke="#B8946D" stroke-opacity="0.28" stroke-width="4"/>
  </g>
</svg>`);

const TRENCH_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F7F3EC"/>
      <stop offset="100%" stop-color="#EAE0D2"/>
    </linearGradient>
    <linearGradient id="camel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D9BA95"/>
      <stop offset="55%" stop-color="#C5A076"/>
      <stop offset="100%" stop-color="#AA845B"/>
    </linearGradient>
    <filter id="sh" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#5B442D" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="400" height="500" fill="url(#bg)"/>
  <g filter="url(#sh)">
    <path d="M148 74 L252 74 L318 118 L344 316 L300 322 L276 184 L298 436 L102 436 L124 184 L100 322 L56 316 L82 118 Z" fill="url(#camel)" stroke="#9B7750" stroke-width="2"/>
    <path d="M152 74 L200 184 L248 74" fill="#B58F65" stroke="#96724B" stroke-width="1.5"/>
    <rect x="116" y="236" width="168" height="22" rx="4" fill="#B69065" stroke="#8F6C46" stroke-width="1.5"/>
    <rect x="184" y="232" width="32" height="30" rx="4" fill="none" stroke="#6B4C2D" stroke-width="4"/>
    <circle cx="176" cy="186" r="6" fill="#5A3F25"/>
    <circle cx="224" cy="186" r="6" fill="#5A3F25"/>
    <circle cx="176" cy="296" r="6" fill="#5A3F25"/>
    <circle cx="224" cy="296" r="6" fill="#5A3F25"/>
  </g>
</svg>`);

const BAG_SVG = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F7F4EF"/>
      <stop offset="100%" stop-color="#ECE4D8"/>
    </linearGradient>
    <linearGradient id="leather" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6B4837"/>
      <stop offset="50%" stop-color="#4B2F22"/>
      <stop offset="100%" stop-color="#311D14"/>
    </linearGradient>
    <filter id="sh" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#2D1B12" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="400" height="500" fill="url(#bg)"/>
  <g filter="url(#sh)">
    <path d="M132 232 C132 106 268 106 268 232" fill="none" stroke="#4B2F22" stroke-width="14" stroke-linecap="round"/>
    <rect x="92" y="226" width="216" height="156" rx="22" fill="url(#leather)" stroke="#331E15" stroke-width="2"/>
    <path d="M92 252 Q200 314 308 252 L308 228 Q200 226 92 228 Z" fill="#593A2B"/>
    <rect x="182" y="274" width="36" height="24" rx="6" fill="#D4B483" stroke="#A68552" stroke-width="2"/>
    <circle cx="200" cy="286" r="4" fill="#4B2F22"/>
  </g>
</svg>`);

export function createDemoWardrobe(): WardrobeItem[] {
  const now = Date.now();
  return [
    {
      id: 'demo-blazer-ivory',
      name: 'Оверсайз-жакет цвета слоновой кости',
      category: 'Верх',
      color: 'Слоновая кость',
      season: 'Всесезон',
      style: 'Олд мани · Минимализм',
      notes: 'Идеально держит форму, легко сочетается с денимом и шёлком',
      imageDataUrl: BLAZER_SVG,
      isDemo: true,
      createdAt: now - 5000,
    },
    {
      id: 'demo-jeans-vintage',
      name: 'Прямые джинсы с высокой посадкой',
      category: 'Низ',
      color: 'Светло-голубой деним',
      season: 'Всесезон',
      style: 'Pinterest Casual',
      notes: 'Базовый прямой крой на каждый день',
      imageDataUrl: JEANS_SVG,
      isDemo: true,
      createdAt: now - 4000,
    },
    {
      id: 'demo-dress-champagne',
      name: 'Атласное платье-комбинация миди',
      category: 'Платья',
      color: 'Шампань',
      season: 'Весна',
      style: 'Женственный · Вечерний',
      notes: 'Красиво смотрится и на свидании, и под жакет',
      imageDataUrl: DRESS_SVG,
      isDemo: true,
      createdAt: now - 3000,
    },
    {
      id: 'demo-trench-camel',
      name: 'Классический двубортный тренч',
      category: 'Верхняя одежда',
      color: 'Кэмел / Бежевый',
      season: 'Осень',
      style: 'Парижский шик',
      notes: 'Незаменим на прохладную погоду и ветер',
      imageDataUrl: TRENCH_SVG,
      isDemo: true,
      createdAt: now - 2000,
    },
    {
      id: 'demo-bag-espresso',
      name: 'Структурная сумка-багет из кожи',
      category: 'Аксессуары',
      color: 'Тёмный шоколад',
      season: 'Всесезон',
      style: 'Элегантная база',
      notes: 'Золотая фурнитура добавляет акцент любому образу',
      imageDataUrl: BAG_SVG,
      isDemo: true,
      createdAt: now - 1000,
    },
  ];
}

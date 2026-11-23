/**
 * Сжатие изображений на клиенте через Canvas для экономии IndexedDB и быстрого обмена с Gemini API
 */
export async function compressImageFile(
  file: File,
  maxDimension = 900,
  quality = 0.8
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  return compressDataUrl(dataUrl, maxDimension, quality);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

export async function compressDataUrl(
  dataUrl: string,
  maxDimension = 900,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Светлая подложка на случай PNG с прозрачностью или SVG
      ctx.fillStyle = '#F7F3ED';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error('Не удалось обработать изображение'));
    img.src = dataUrl;
  });
}

/**
 * Конвертирует любой dataUrl (включая SVG демо-вещей) в JPEG base64 + mimeType для Gemini API
 */
export async function dataUrlToInlineImage(
  dataUrl: string,
  maxDimension = 768
): Promise<{ data: string; mimeType: 'image/jpeg' }> {
  const jpegUrl = dataUrl.startsWith('data:image/jpeg')
    ? dataUrl
    : await compressDataUrl(dataUrl, maxDimension, 0.85);
  const commaIdx = jpegUrl.indexOf(',');
  return {
    data: commaIdx >= 0 ? jpegUrl.slice(commaIdx + 1) : jpegUrl,
    mimeType: 'image/jpeg',
  };
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

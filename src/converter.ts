const THAI_NUMBERS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

const bahtCache = new Map<string | number, string>();
const readCache = new Map<string | number, string>();
const MAX_CACHE_SIZE = 2048;

/**
 * Validates if a string is a valid numeric format without using RegExp.
 */
function isValidNumericString(str: string): boolean {
  const len = str.length;
  if (len === 0) return false;

  let start = 0;
  if (str.charCodeAt(0) === 45) { // '-'
    start = 1;
    if (len === 1) return false;
  }

  let hasDot = false;
  let hasDigit = false;
  for (let i = start; i < len; i++) {
    const code = str.charCodeAt(i);
    if (code === 46) { // '.'
      if (hasDot || i === start || i === len - 1) return false;
      hasDot = true;
    } else if (code >= 48 && code <= 57) { // '0'-'9'
      hasDigit = true;
    } else {
      return false;
    }
  }
  return hasDigit;
}

/**
 * Rounds a decimal representation to exactly two decimal places using string operations.
 */
function roundToTwoDecimals(intPart: string, decPart = ''): { intStr: string; decStr: string } {
  const decLen = decPart.length;
  if (decLen === 0) return { intStr: intPart, decStr: '00' };
  if (decLen === 1) return { intStr: intPart, decStr: decPart + '0' };
  if (decLen === 2) return { intStr: intPart, decStr: decPart };

  const d0 = decPart[0];
  const d1 = decPart[1];
  const d2 = decPart[2];

  const thirdDigit = d2.charCodeAt(0) - 48;

  if (thirdDigit >= 5) {
    const val = (d0.charCodeAt(0) - 48) * 10 + (d1.charCodeAt(0) - 48) + 1;
    if (val === 100) {
      try {
        return { intStr: (BigInt(intPart) + 1n).toString(), decStr: '00' };
      } catch {
        return { intStr: (parseFloat(intPart) + 1).toString(), decStr: '00' };
      }
    }
    const d0Val = Math.floor(val / 10);
    const d1Val = val % 10;
    return { intStr: intPart, decStr: String.fromCharCode(d0Val + 48, d1Val + 48) };
  }
  return { intStr: intPart, decStr: d0 + d1 };
}

/**
 * Converts a 6-digit (or smaller) chunk of digits into Thai words.
 */
function convertChunk(chunk: string, hasLeftContent: boolean): string {
  const len = chunk.length;
  if (len === 1) {
    const val = chunk.charCodeAt(0) - 48;
    if (val === 0) return '';
    return (val === 1 && hasLeftContent) ? 'เอ็ด' : THAI_NUMBERS[val];
  }
  if (len === 2) {
    const v0 = chunk.charCodeAt(0) - 48;
    const v1 = chunk.charCodeAt(1) - 48;
    if (v0 === 0) {
      if (v1 === 0) return '';
      return hasLeftContent ? 'เอ็ด' : THAI_NUMBERS[v1];
    }
    let t0 = '';
    if (v0 === 1) t0 = 'สิบ';
    else if (v0 === 2) t0 = 'ยี่สิบ';
    else t0 = THAI_NUMBERS[v0] + 'สิบ';

    if (v1 === 0) return t0;
    if (v1 === 1) return t0 + 'เอ็ด';
    return t0 + THAI_NUMBERS[v1];
  }

  let text = '';
  let hasEncounteredNonZero = hasLeftContent;

  for (let i = 0; i < len; i++) {
    const digit = chunk[i];
    if (digit === '0') continue;

    const pos = len - 1 - i;
    const val = digit.charCodeAt(0) - 48;
    let digitText = THAI_NUMBERS[val];
    const unitText = THAI_UNITS[pos];

    if (pos === 1 && val === 1) digitText = '';
    if (pos === 1 && val === 2) digitText = 'ยี่';
    if (pos === 0 && val === 1 && hasEncounteredNonZero) digitText = 'เอ็ด';

    text += digitText + unitText;
    hasEncounteredNonZero = true;
  }

  return text;
}

/**
 * Converts an arbitrary-length integer string into Thai words.
 */
function convertInteger(intStr: string): string {
  if (intStr === '' || intStr === '0') return 'ศูนย์';

  const len = intStr.length;
  if (len <= 6) {
    return convertChunk(intStr, false);
  }

  let result = '';
  let hasLeftContent = false;
  const firstChunkLen = len % 6 || 6;
  const numChunks = Math.ceil(len / 6);

  const firstChunk = intStr.slice(0, firstChunkLen);
  let isFirstChunkAllZero = true;
  for (let i = 0; i < firstChunk.length; i++) {
    if (firstChunk[i] !== '0') {
      isFirstChunkAllZero = false;
      break;
    }
  }

  if (!isFirstChunkAllZero) {
    result += convertChunk(firstChunk, false) + 'ล้าน'.repeat(numChunks - 1);
    hasLeftContent = true;
  }

  for (let k = 1; k < numChunks; k++) {
    const start = firstChunkLen + (k - 1) * 6;
    const chunk = intStr.slice(start, start + 6);
    let isChunkAllZero = true;
    for (let i = 0; i < 6; i++) {
      if (chunk[i] !== '0') {
        isChunkAllZero = false;
        break;
      }
    }

    if (!isChunkAllZero) {
      result += convertChunk(chunk, hasLeftContent) + 'ล้าน'.repeat(numChunks - 1 - k);
      hasLeftContent = true;
    }
  }

  return result || 'ศูนย์';
}

function thaiBahtRaw(amount: number | string): string {
  let str = '';
  if (typeof amount === 'string') {
    if (amount.indexOf(',') !== -1) {
      str = amount.replace(/,/g, '').trim();
    } else {
      str = amount.trim();
    }
  } else if (typeof amount === 'number') {
    str = amount.toString();
  } else {
    str = String(amount ?? '').trim();
  }

  if (!isValidNumericString(str)) {
    return 'ข้อมูลไม่ถูกต้อง';
  }

  const isNegative = str.charCodeAt(0) === 45; // 45 is '-'
  const startOffset = isNegative ? 1 : 0;

  const dotIndex = str.indexOf('.', startOffset);
  let intPart = '';
  let decPart = '';
  if (dotIndex !== -1) {
    intPart = str.slice(startOffset, dotIndex);
    decPart = str.slice(dotIndex + 1);
  } else {
    intPart = startOffset === 0 ? str : str.slice(startOffset);
  }

  let startIdx = 0;
  while (startIdx < intPart.length - 1 && intPart[startIdx] === '0') {
    startIdx++;
  }
  const cleanIntPart = startIdx > 0 ? intPart.slice(startIdx) : intPart;

  let finalIntStr = cleanIntPart;
  let finalDecStr = '00';
  if (decPart !== '') {
    const rounded = roundToTwoDecimals(cleanIntPart, decPart);
    finalIntStr = rounded.intStr;
    finalDecStr = rounded.decStr;
  }

  if (finalIntStr === '0' && finalDecStr === '00') {
    return 'ศูนย์บาทถ้วน';
  }

  const bahtText = finalIntStr !== '0' ? convertInteger(finalIntStr) + 'บาท' : '';
  const satangText = finalDecStr !== '00' ? convertInteger(finalDecStr) + 'สตางค์' : 'ถ้วน';

  const result = bahtText + satangText;
  return isNegative ? 'ลบ' + result : result;
}

function thaiReadRaw(amount: number | string): string {
  let str = '';
  if (typeof amount === 'string') {
    if (amount.indexOf(',') !== -1) {
      str = amount.replace(/,/g, '').trim();
    } else {
      str = amount.trim();
    }
  } else if (typeof amount === 'number') {
    str = amount.toString();
  } else {
    str = String(amount ?? '').trim();
  }

  if (!isValidNumericString(str)) {
    return 'ข้อมูลไม่ถูกต้อง';
  }

  const isNegative = str.charCodeAt(0) === 45; // 45 is '-'
  const startOffset = isNegative ? 1 : 0;

  const dotIndex = str.indexOf('.', startOffset);
  let intPart = '';
  let decPart = '';
  if (dotIndex !== -1) {
    intPart = str.slice(startOffset, dotIndex);
    decPart = str.slice(dotIndex + 1);
  } else {
    intPart = startOffset === 0 ? str : str.slice(startOffset);
  }

  let startIdx = 0;
  while (startIdx < intPart.length - 1 && intPart[startIdx] === '0') {
    startIdx++;
  }
  const cleanIntPart = startIdx > 0 ? intPart.slice(startIdx) : intPart;

  let result = convertInteger(cleanIntPart);

  if (decPart) {
    let decText = '';
    for (let i = 0; i < decPart.length; i++) {
      decText += THAI_NUMBERS[decPart.charCodeAt(i) - 48];
    }
    result += 'จุด' + decText;
  }

  const isZero = cleanIntPart === '0' && !decPart;
  return (isNegative && !isZero) ? 'ลบ' + result : result;
}

/**
 * Converts a number or numeric string to Thai Baht text format.
 * E.g., 852500 -> "แปดแสนห้าหมื่นสองพันห้าร้อยบาทถ้วน"
 * E.g., 120.25 -> "หนึ่งร้อยยี่สิบบาทยี่สิบห้าสตางค์"
 *
 * @param amount Number or numeric string to convert. Commas are ignored.
 * @returns Thai words representing the Baht amount, or "ข้อมูลไม่ถูกต้อง" if invalid.
 */
export function thaiBaht(amount: number | string): string {
  let cached = bahtCache.get(amount);
  if (cached !== undefined) return cached;

  const result = thaiBahtRaw(amount);

  if (bahtCache.size >= MAX_CACHE_SIZE) {
    bahtCache.clear();
  }
  bahtCache.set(amount, result);
  return result;
}

/**
 * Converts a number or numeric string to plain Thai words.
 * E.g., 852500 -> "แปดแสนห้าหมื่นสองพันห้าร้อย"
 * E.g., 1.25 -> "หนึ่งจุดสองห้า"
 *
 * @param amount Number or numeric string to convert. Commas are ignored.
 * @returns Thai words representing the number, or "ข้อมูลไม่ถูกต้อง" if invalid.
 */
export function thaiRead(amount: number | string): string {
  let cached = readCache.get(amount);
  if (cached !== undefined) return cached;

  const result = thaiReadRaw(amount);

  if (readCache.size >= MAX_CACHE_SIZE) {
    readCache.clear();
  }
  readCache.set(amount, result);
  return result;
}

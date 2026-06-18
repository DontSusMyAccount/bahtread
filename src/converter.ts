const THAI_NUMBERS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

const bahtCache = new Map<string | number, string>();
const readCache = new Map<string | number, string>();
const MAX_CACHE_SIZE = 2048;

function isValidNumericString(str: string): boolean {
  const len = str.length;
  if (len === 0) return false;

  let start = 0;
  const first = str.charCodeAt(0);
  if (first === 45 || first === 43) {
    start = 1;
    if (len === 1) return false;
  }

  let hasDot = false;
  let hasDigit = false;
  for (let i = start; i < len; i++) {
    const code = str.charCodeAt(i);
    if (code >= 48 && code <= 57) {
      hasDigit = true;
      continue;
    }
    if (code === 46) {
      if (hasDot) return false;
      hasDot = true;
      continue;
    }
    return false;
  }
  return hasDigit;
}

function normalizeNumericString(str: string): string {
  if (str.charCodeAt(0) === 43) str = str.slice(1);
  if (str.charCodeAt(0) === 46) str = '0' + str;
  else if (str.charCodeAt(0) === 45 && str.charCodeAt(1) === 46) str = '-0' + str.slice(1);
  if (str.charCodeAt(str.length - 1) === 46) str = str.slice(0, -1);
  return str;
}

function numberToString(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const s = n.toFixed(10);
  let end = s.length - 1;
  while (end >= 0 && s.charCodeAt(end) === 48) end--;
  if (end >= 0 && s.charCodeAt(end) === 46) end--;
  return end >= 0 ? s.slice(0, end + 1) : '0';
}

type ParsedInput = {
  isNegative: boolean;
  intPart: string;
  decPart: string;
};

function parseInput(amount: number | string): ParsedInput | null {
  if (typeof amount !== 'number' && typeof amount !== 'string') return null;

  let str: string;
  if (typeof amount === 'string') {
    str = amount.indexOf(',') !== -1 ? amount.replace(/,/g, '').trim() : amount.trim();
  } else {
    if (!Number.isFinite(amount)) return null;
    str = numberToString(amount);
  }

  if (!isValidNumericString(str)) return null;
  str = normalizeNumericString(str);

  const isNegative = str.charCodeAt(0) === 45;
  const startOffset = isNegative ? 1 : 0;
  const dotIndex = str.indexOf('.', startOffset);
  const intPart = dotIndex !== -1 ? str.slice(startOffset, dotIndex) : str.slice(startOffset);
  const decPart = dotIndex !== -1 ? str.slice(dotIndex + 1) : '';

  let i = 0;
  while (i < intPart.length - 1 && intPart[i] === '0') i++;
  const cleanIntPart = i > 0 ? intPart.slice(i) : intPart;

  return { isNegative, intPart: cleanIntPart, decPart };
}

function roundToTwoDecimals(intPart: string, decPart = ''): { intStr: string; decStr: string } {
  if (decPart.length < 2) {
    return { intStr: intPart, decStr: decPart + '0'.repeat(2 - decPart.length) };
  }
  if (decPart.length === 2) return { intStr: intPart, decStr: decPart };

  const carry = (decPart.charCodeAt(0) - 48) * 10 + (decPart.charCodeAt(1) - 48) + (decPart.charCodeAt(2) >= 53 ? 1 : 0);

  if (carry === 100) {
    try {
      return { intStr: (BigInt(intPart) + 1n).toString(), decStr: '00' };
    } catch {
      return { intStr: (parseFloat(intPart) + 1).toString(), decStr: '00' };
    }
  }

  return {
    intStr: intPart,
    decStr: String.fromCharCode(Math.floor(carry / 10) + 48, (carry % 10) + 48),
  };
}

function convertChunk(chunk: string, hasLeftContent: boolean): string {
  const len = chunk.length;

  if (len === 1) {
    const val = chunk.charCodeAt(0) - 48;
    if (val === 0) return '';
    return val === 1 && hasLeftContent ? 'เอ็ด' : THAI_NUMBERS[val];
  }

  if (len === 2) {
    const v0 = chunk.charCodeAt(0) - 48;
    const v1 = chunk.charCodeAt(1) - 48;

    if (v0 === 0) {
      if (v1 === 0) return '';
      return hasLeftContent ? 'เอ็ด' : THAI_NUMBERS[v1];
    }

    const tens = v0 === 1 ? 'สิบ' : v0 === 2 ? 'ยี่สิบ' : THAI_NUMBERS[v0] + 'สิบ';
    const units = v1 === 0 ? '' : v1 === 1 ? 'เอ็ด' : THAI_NUMBERS[v1];
    return tens + units;
  }

  const parts: string[] = [];
  let hasEncounteredNonZero = hasLeftContent;

  for (let i = 0; i < len; i++) {
    const digit = chunk[i];
    if (digit === '0') continue;

    const pos = len - 1 - i;
    const val = digit.charCodeAt(0) - 48;
    const unitText = THAI_UNITS[pos];

    let digitText = THAI_NUMBERS[val];
    if (pos === 1 && val === 1) digitText = '';
    else if (pos === 1 && val === 2) digitText = 'ยี่';
    else if (pos === 0 && val === 1 && hasEncounteredNonZero) digitText = 'เอ็ด';

    parts.push(digitText, unitText);
    hasEncounteredNonZero = true;
  }

  return parts.join('');
}

function isAllZeros(s: string): boolean {
  for (let i = s.length - 1; i >= 0; i--) {
    if (s.charCodeAt(i) !== 48) return false;
  }
  return true;
}

function convertInteger(intStr: string): string {
  if (intStr === '' || intStr === '0') return 'ศูนย์';

  const len = intStr.length;
  if (len <= 6) return convertChunk(intStr, false);

  const parts: string[] = [];
  let hasLeftContent = false;
  const firstChunkLen = len % 6 || 6;
  const numChunks = Math.ceil(len / 6);

  const firstChunk = intStr.slice(0, firstChunkLen);
  if (!isAllZeros(firstChunk)) {
    parts.push(convertChunk(firstChunk, false), 'ล้าน'.repeat(numChunks - 1));
    hasLeftContent = true;
  }

  for (let k = 1; k < numChunks; k++) {
    const start = firstChunkLen + (k - 1) * 6;
    const chunk = intStr.slice(start, start + 6);
    if (isAllZeros(chunk)) continue;

    parts.push(convertChunk(chunk, hasLeftContent), 'ล้าน'.repeat(numChunks - 1 - k));
    hasLeftContent = true;
  }

  return parts.length ? parts.join('') : 'ศูนย์';
}

function thaiBahtRaw(amount: number | string): string {
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) return 'ข้อมูลไม่ถูกต้อง';
    const satang = Math.round(Math.abs(amount) * 100);
    const baht = Math.floor(satang / 100);
    const dec = satang % 100;

    if (baht === 0 && dec === 0) return 'ศูนย์บาทถ้วน';

    const bahtText = baht > 0 ? convertInteger(baht.toString()) + 'บาท' : '';
    const satangText = dec > 0
      ? convertInteger(dec.toString().padStart(2, '0')) + 'สตางค์'
      : 'ถ้วน';
    return (amount < 0 ? 'ลบ' : '') + bahtText + satangText;
  }

  const parsed = parseInput(amount);
  if (!parsed) return 'ข้อมูลไม่ถูกต้อง';

  const { isNegative, intPart, decPart } = parsed;
  const { intStr, decStr } = decPart
    ? roundToTwoDecimals(intPart, decPart)
    : { intStr: intPart, decStr: '00' };

  if (intStr === '0' && decStr === '00') return 'ศูนย์บาทถ้วน';

  const bahtText = intStr !== '0' ? convertInteger(intStr) + 'บาท' : '';
  const satangText = decStr !== '00' ? convertInteger(decStr) + 'สตางค์' : 'ถ้วน';

  return (isNegative ? 'ลบ' : '') + bahtText + satangText;
}

function thaiReadRaw(amount: number | string): string {
  const parsed = parseInput(amount);
  if (!parsed) return 'ข้อมูลไม่ถูกต้อง';

  const { isNegative, intPart, decPart } = parsed;

  const isAllZeroDec = !decPart || isAllZeros(decPart);
  const isZero = intPart === '0' && isAllZeroDec;

  let result = convertInteger(intPart);

  if (decPart && !isAllZeroDec) {
    let decText = '';
    for (let i = 0; i < decPart.length; i++) {
      decText += THAI_NUMBERS[decPart.charCodeAt(i) - 48];
    }
    result += 'จุด' + decText;
  }

  return isNegative && !isZero ? 'ลบ' + result : result;
}

export function thaiBaht(amount: number | string): string {
  let cached = bahtCache.get(amount);
  if (cached !== undefined) return cached;

  const result = thaiBahtRaw(amount);

  if (bahtCache.size >= MAX_CACHE_SIZE) bahtCache.clear();
  bahtCache.set(amount, result);
  return result;
}

export function thaiRead(amount: number | string): string {
  let cached = readCache.get(amount);
  if (cached !== undefined) return cached;

  const result = thaiReadRaw(amount);

  if (readCache.size >= MAX_CACHE_SIZE) readCache.clear();
  readCache.set(amount, result);
  return result;
}

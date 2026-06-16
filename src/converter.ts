const THAI_NUMBERS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

const bahtCache = new Map<string | number, string>();
const readCache = new Map<string | number, string>();
const MAX_CACHE_SIZE = 2048;

function isValidNumericString(str: string): boolean {
  const len = str.length;
  if (len === 0) return false;

  let start = str.charCodeAt(0) === 45 ? 1 : 0;
  if (start === 1 && len === 1) return false;

  let hasDot = false;
  let hasDigit = false;
  for (let i = start; i < len; i++) {
    const code = str.charCodeAt(i);
    if (code === 46) {
      if (hasDot || i === start || i === len - 1) return false;
      hasDot = true;
    } else if (code >= 48 && code <= 57) {
      hasDigit = true;
    } else {
      return false;
    }
  }
  return hasDigit;
}

type ParsedInput = {
  isNegative: boolean;
  intPart: string;
  decPart: string;
};

function parseInput(amount: number | string): ParsedInput | null {
  const str = typeof amount === 'string'
    ? amount.indexOf(',') !== -1 ? amount.replace(/,/g, '').trim() : amount.trim()
    : String(amount ?? '').trim();

  if (!isValidNumericString(str)) return null;

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

  let text = '';
  let hasEncounteredNonZero = hasLeftContent;

  for (let i = 0; i < len; i++) {
    const digit = chunk[i];
    if (digit === '0') continue;

    const pos = len - 1 - i;
    const val = digit.charCodeAt(0) - 48;
    const unitText = THAI_UNITS[pos];

    let digitText = THAI_NUMBERS[val];
    switch (pos) {
      case 1:
        if (val === 1) digitText = '';
        else if (val === 2) digitText = 'ยี่';
        break;
      case 0:
        if (val === 1 && hasEncounteredNonZero) digitText = 'เอ็ด';
        break;
    }

    text += digitText + unitText;
    hasEncounteredNonZero = true;
  }

  return text;
}

function isAllZeros(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '0') return false;
  }
  return true;
}

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
  if (!isAllZeros(firstChunk)) {
    result += convertChunk(firstChunk, false) + 'ล้าน'.repeat(numChunks - 1);
    hasLeftContent = true;
  }

  for (let k = 1; k < numChunks; k++) {
    const start = firstChunkLen + (k - 1) * 6;
    const chunk = intStr.slice(start, start + 6);
    if (isAllZeros(chunk)) continue;

    result += convertChunk(chunk, hasLeftContent) + 'ล้าน'.repeat(numChunks - 1 - k);
    hasLeftContent = true;
  }

  return result || 'ศูนย์';
}

function thaiBahtRaw(amount: number | string): string {
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

  let result = convertInteger(intPart);

  if (decPart) {
    let decText = '';
    for (let i = 0; i < decPart.length; i++) {
      decText += THAI_NUMBERS[decPart.charCodeAt(i) - 48];
    }
    result += 'จุด' + decText;
  }

  const isZero = intPart === '0' && !decPart;
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

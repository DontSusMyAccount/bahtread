const THAI_NUMBERS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

/**
 * Rounds a decimal representation to exactly two decimal places using string operations.
 * This is safe for arbitrarily large numbers (beyond safe integer limits).
 */
function roundToTwoDecimals(intPart: string, decPart = ''): { intStr: string; decStr: string } {
  const paddedDec = decPart.trim().padEnd(3, '0');
  const firstTwo = paddedDec.slice(0, 2);
  const thirdDigit = parseInt(paddedDec[2], 10);

  if (thirdDigit >= 5) {
    const val = parseInt(firstTwo, 10) + 1;
    if (val === 100) {
      try {
        return { intStr: (BigInt(intPart) + 1n).toString(), decStr: '00' };
      } catch {
        return { intStr: (parseFloat(intPart) + 1).toString(), decStr: '00' };
      }
    }
    return { intStr: intPart, decStr: val.toString().padStart(2, '0') };
  }
  return { intStr: intPart, decStr: firstTwo };
}

/**
 * Converts a 6-digit (or smaller) chunk of digits into Thai words.
 * @param chunk A string of up to 6 digits.
 * @param hasLeftContent A boolean indicating if there are non-zero digits to the left of this chunk.
 */
function convertChunk(chunk: string, hasLeftContent: boolean): string {
  if (/^0+$/.test(chunk)) return '';

  let text = '';
  const len = chunk.length;
  const hasLeft = hasLeftContent || /[^0]/.test(chunk.slice(0, -1));

  for (let i = 0; i < len; i++) {
    const digit = chunk[i];
    const pos = len - 1 - i;

    if (digit === '0') continue;

    let digitText = THAI_NUMBERS[parseInt(digit, 10)];
    const unitText = THAI_UNITS[pos];

    if (pos === 1 && digit === '1') digitText = '';
    if (pos === 1 && digit === '2') digitText = 'ยี่';
    if (pos === 0 && digit === '1' && hasLeft) digitText = 'เอ็ด';

    text += digitText + unitText;
  }

  return text;
}

/**
 * Converts an arbitrary-length integer string into Thai words.
 */
function convertInteger(intStr: string): string {
  const cleanIntStr = intStr.replace(/^0+/, '');
  if (cleanIntStr === '') return 'ศูนย์';

  const chunks: string[] = [];
  let s = cleanIntStr;
  while (s.length > 0) {
    const len = s.length;
    const start = Math.max(0, len - 6);
    chunks.push(s.slice(start, len));
    s = s.slice(0, start);
  }

  let result = '';

  for (let k = chunks.length - 1; k >= 0; k--) {
    const chunk = chunks[k];
    if (/^0+$/.test(chunk)) continue;

    const hasLeftContent = chunks.slice(k + 1).some(c => !/^0+$/.test(c));
    const chunkText = convertChunk(chunk, hasLeftContent);
    result += chunkText + 'ล้าน'.repeat(k);
  }

  return result;
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
  const str = String(amount ?? '').trim().replace(/,/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(str)) {
    return 'ข้อมูลไม่ถูกต้อง';
  }

  const isNegative = str.startsWith('-');
  const cleanStr = isNegative ? str.slice(1) : str;

  let [intPart, decPart] = cleanStr.split('.');
  intPart = intPart.replace(/^0+/, '') || '0';

  const rounded = roundToTwoDecimals(intPart, decPart);
  const finalIntStr = rounded.intStr;
  const finalDecStr = rounded.decStr;

  // Zero amount is always positive (no "ลบศูนย์บาท")
  if (finalIntStr === '0' && finalDecStr === '00') {
    return 'ศูนย์บาทถ้วน';
  }

  const bahtText = finalIntStr !== '0' ? convertInteger(finalIntStr) + 'บาท' : '';
  const satangText = finalDecStr !== '00' ? convertInteger(finalDecStr) + 'สตางค์' : 'ถ้วน';

  const result = bahtText + satangText;
  return isNegative ? 'ลบ' + result : result;
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
  const str = String(amount ?? '').trim().replace(/,/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(str)) {
    return 'ข้อมูลไม่ถูกต้อง';
  }

  const isNegative = str.startsWith('-');
  const cleanStr = isNegative ? str.slice(1) : str;

  let [intPart, decPart] = cleanStr.split('.');
  intPart = intPart.replace(/^0+/, '') || '0';

  let result = convertInteger(intPart);

  if (decPart) {
    const decText = [...decPart].map(d => THAI_NUMBERS[parseInt(d, 10)]).join('');
    result += 'จุด' + decText;
  }

  // Zero is always positive (no "ลบศูนย์")
  const isZero = intPart === '0' && !decPart;
  return (isNegative && !isZero) ? 'ลบ' + result : result;
}

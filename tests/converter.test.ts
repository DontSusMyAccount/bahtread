import { describe, it, expect } from 'vitest';
import { thaiBaht, thaiRead } from '../src/converter';

describe('thaiBaht', () => {
  // ──────────────────────────────────────────
  // กลุ่ม 1: ตัวเลข 0-9 (หลักหน่วย)
  // ──────────────────────────────────────────
  it('should convert single digit values (0-9)', () => {
    expect(thaiBaht(0)).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht(1)).toBe('หนึ่งบาทถ้วน');
    expect(thaiBaht(2)).toBe('สองบาทถ้วน');
    expect(thaiBaht(3)).toBe('สามบาทถ้วน');
    expect(thaiBaht(4)).toBe('สี่บาทถ้วน');
    expect(thaiBaht(5)).toBe('ห้าบาทถ้วน');
    expect(thaiBaht(6)).toBe('หกบาทถ้วน');
    expect(thaiBaht(7)).toBe('เจ็ดบาทถ้วน');
    expect(thaiBaht(8)).toBe('แปดบาทถ้วน');
    expect(thaiBaht(9)).toBe('เก้าบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 2: หลักสิบ – กฎ "สิบ", "ยี่สิบ", "เอ็ด"
  // ──────────────────────────────────────────
  it('should handle tens position rules correctly', () => {
    expect(thaiBaht(10)).toBe('สิบบาทถ้วน');
    expect(thaiBaht(11)).toBe('สิบเอ็ดบาทถ้วน');
    expect(thaiBaht(12)).toBe('สิบสองบาทถ้วน');
    expect(thaiBaht(20)).toBe('ยี่สิบบาทถ้วน');
    expect(thaiBaht(21)).toBe('ยี่สิบเอ็ดบาทถ้วน');
    expect(thaiBaht(30)).toBe('สามสิบบาทถ้วน');
    expect(thaiBaht(31)).toBe('สามสิบเอ็ดบาทถ้วน');
    expect(thaiBaht(99)).toBe('เก้าสิบเก้าบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 3: หลักร้อย – "เอ็ด" ที่หลักหน่วย
  // ──────────────────────────────────────────
  it('should handle hundreds position correctly', () => {
    expect(thaiBaht(100)).toBe('หนึ่งร้อยบาทถ้วน');
    expect(thaiBaht(101)).toBe('หนึ่งร้อยเอ็ดบาทถ้วน');
    expect(thaiBaht(110)).toBe('หนึ่งร้อยสิบบาทถ้วน');
    expect(thaiBaht(111)).toBe('หนึ่งร้อยสิบเอ็ดบาทถ้วน');
    expect(thaiBaht(121)).toBe('หนึ่งร้อยยี่สิบเอ็ดบาทถ้วน');
    expect(thaiBaht(200)).toBe('สองร้อยบาทถ้วน');
    expect(thaiBaht(500)).toBe('ห้าร้อยบาทถ้วน');
    expect(thaiBaht(999)).toBe('เก้าร้อยเก้าสิบเก้าบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 4: หลักพัน/หมื่น/แสน
  // ──────────────────────────────────────────
  it('should handle thousands, ten-thousands, hundred-thousands', () => {
    expect(thaiBaht(1000)).toBe('หนึ่งพันบาทถ้วน');
    expect(thaiBaht(1001)).toBe('หนึ่งพันเอ็ดบาทถ้วน');
    expect(thaiBaht(10000)).toBe('หนึ่งหมื่นบาทถ้วน');
    expect(thaiBaht(10001)).toBe('หนึ่งหมื่นเอ็ดบาทถ้วน');
    expect(thaiBaht(100000)).toBe('หนึ่งแสนบาทถ้วน');
    expect(thaiBaht(100001)).toBe('หนึ่งแสนเอ็ดบาทถ้วน');
    expect(thaiBaht(852500)).toBe('แปดแสนห้าหมื่นสองพันห้าร้อยบาทถ้วน');
    expect(thaiBaht(999999)).toBe('เก้าแสนเก้าหมื่นเก้าพันเก้าร้อยเก้าสิบเก้าบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 5: หลักล้าน ล้านล้าน (chunking ทุก 6 หลัก)
  // ──────────────────────────────────────────
  it('should handle millions and multi-million groupings', () => {
    expect(thaiBaht(1000000)).toBe('หนึ่งล้านบาทถ้วน');
    expect(thaiBaht(1000001)).toBe('หนึ่งล้านเอ็ดบาทถ้วน');
    expect(thaiBaht(1000011)).toBe('หนึ่งล้านสิบเอ็ดบาทถ้วน');
    expect(thaiBaht(1000021)).toBe('หนึ่งล้านยี่สิบเอ็ดบาทถ้วน');
    expect(thaiBaht(1234567)).toBe('หนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทถ้วน');
    expect(thaiBaht(10000000)).toBe('สิบล้านบาทถ้วน');
    expect(thaiBaht(11000000)).toBe('สิบเอ็ดล้านบาทถ้วน');
    expect(thaiBaht(21000021)).toBe('ยี่สิบเอ็ดล้านยี่สิบเอ็ดบาทถ้วน');
    expect(thaiBaht(100000000)).toBe('หนึ่งร้อยล้านบาทถ้วน');
    expect(thaiBaht(1000000000)).toBe('หนึ่งพันล้านบาทถ้วน');
    expect(thaiBaht(10000000000)).toBe('หนึ่งหมื่นล้านบาทถ้วน');
    expect(thaiBaht(100000000000)).toBe('หนึ่งแสนล้านบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 6: ล้านล้าน (Trillions) – ข้ามหลักล้านซ้ำ
  // ──────────────────────────────────────────
  it('should handle trillions (ล้านล้าน) correctly', () => {
    expect(thaiBaht('1000000000000')).toBe('หนึ่งล้านล้านบาทถ้วน');
    expect(thaiBaht('1000000000001')).toBe('หนึ่งล้านล้านเอ็ดบาทถ้วน');
    expect(thaiBaht('1000001000001')).toBe('หนึ่งล้านล้านเอ็ดล้านเอ็ดบาทถ้วน');
    expect(thaiBaht('1000000000000001')).toBe('หนึ่งพันล้านล้านเอ็ดบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 7: เลขที่มีหลัก 0 ข้ามช่วง (zero gap)
  // ──────────────────────────────────────────
  it('should handle numbers with zeros in the middle', () => {
    expect(thaiBaht(10001)).toBe('หนึ่งหมื่นเอ็ดบาทถ้วน');
    expect(thaiBaht(100001)).toBe('หนึ่งแสนเอ็ดบาทถ้วน');
    expect(thaiBaht(1000100)).toBe('หนึ่งล้านหนึ่งร้อยบาทถ้วน');
    expect(thaiBaht(12000005)).toBe('สิบสองล้านห้าบาทถ้วน');
    expect(thaiBaht(10000001)).toBe('สิบล้านเอ็ดบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 8: สตางค์ (ทศนิยม)
  // ──────────────────────────────────────────
  it('should convert Baht with Satang values correctly', () => {
    expect(thaiBaht(0.01)).toBe('หนึ่งสตางค์');
    expect(thaiBaht(0.05)).toBe('ห้าสตางค์');
    expect(thaiBaht(0.10)).toBe('สิบสตางค์');
    expect(thaiBaht(0.11)).toBe('สิบเอ็ดสตางค์');
    expect(thaiBaht(0.25)).toBe('ยี่สิบห้าสตางค์');
    expect(thaiBaht(0.50)).toBe('ห้าสิบสตางค์');
    expect(thaiBaht(0.75)).toBe('เจ็ดสิบห้าสตางค์');
    expect(thaiBaht(10.50)).toBe('สิบบาทห้าสิบสตางค์');
    expect(thaiBaht(123.45)).toBe('หนึ่งร้อยยี่สิบสามบาทสี่สิบห้าสตางค์');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 9: ปัดเศษทศนิยม
  // ──────────────────────────────────────────
  it('should round decimal places to exactly 2 digits', () => {
    expect(thaiBaht(1.234)).toBe('หนึ่งบาทยี่สิบสามสตางค์');
    expect(thaiBaht(1.235)).toBe('หนึ่งบาทยี่สิบสี่สตางค์');
    expect(thaiBaht(1.239)).toBe('หนึ่งบาทยี่สิบสี่สตางค์');
    expect(thaiBaht(1.999)).toBe('สองบาทถ้วน');
    expect(thaiBaht(0.005)).toBe('หนึ่งสตางค์');
    expect(thaiBaht(0.994)).toBe('เก้าสิบเก้าสตางค์');
    expect(thaiBaht(0.999)).toBe('หนึ่งบาทถ้วน');
    expect(thaiBaht('99.999')).toBe('หนึ่งร้อยบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 10: จำนวนลบ
  // ──────────────────────────────────────────
  it('should handle negative values correctly', () => {
    expect(thaiBaht(-0)).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht(-100)).toBe('ลบหนึ่งร้อยบาทถ้วน');
    expect(thaiBaht(-123.45)).toBe('ลบหนึ่งร้อยยี่สิบสามบาทสี่สิบห้าสตางค์');
    expect(thaiBaht(-0.25)).toBe('ลบยี่สิบห้าสตางค์');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 11: String "-0" ไม่ควรเป็น "ลบศูนย์บาทถ้วน"
  // ──────────────────────────────────────────
  it('should treat "-0" string as zero (not negative zero)', () => {
    expect(thaiBaht('-0')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('-0.00')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('-0.000')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('-0.001')).toBe('ศูนย์บาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 12: String inputs (commas, spaces, leading zeros)
  // ──────────────────────────────────────────
  it('should clean and handle string inputs correctly', () => {
    expect(thaiBaht('852,500')).toBe('แปดแสนห้าหมื่นสองพันห้าร้อยบาทถ้วน');
    expect(thaiBaht('1,234,567.89')).toBe('หนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์');
    expect(thaiBaht('   100   ')).toBe('หนึ่งร้อยบาทถ้วน');
    expect(thaiBaht('000123')).toBe('หนึ่งร้อยยี่สิบสามบาทถ้วน');
    expect(thaiBaht('0')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('0.00')).toBe('ศูนย์บาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 13: Invalid inputs
  // ──────────────────────────────────────────
  it('should return error text for invalid inputs', () => {
    expect(thaiBaht('abc')).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht('12.34.56')).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht('')).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht(NaN)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht(Infinity)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht(-Infinity)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht(undefined as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht(null as any)).toBe('ข้อมูลไม่ถูกต้อง');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 14: ตัวเลขใหญ่มาก (BigInt safety)
  // ──────────────────────────────────────────
  it('should handle extremely large numbers via string input', () => {
    expect(thaiBaht('1000000000000001')).toBe('หนึ่งพันล้านล้านเอ็ดบาทถ้วน');
    expect(thaiBaht('9007199254740991')).toBe(
      'เก้าพันเจ็ดล้านล้านหนึ่งแสนเก้าหมื่นเก้าพันสองร้อยห้าสิบสี่ล้านเจ็ดแสนสี่หมื่นเก้าร้อยเก้าสิบเอ็ดบาทถ้วน'
    );
  });

  // ──────────────────────────────────────────
  // กลุ่ม 15: Floating point precision issues
  // ──────────────────────────────────────────
  it('should handle JS floating point quirks gracefully', () => {
    expect(thaiBaht(0.1 + 0.2)).toBe('สามสิบสตางค์');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 16: Float precision regression (epsilon fix)
  // ──────────────────────────────────────────
  it('should handle borderline float values correctly', () => {
    expect(thaiBaht(1.005)).toBe('หนึ่งบาทถ้วน');
    expect(thaiBaht(1.015)).toBe('หนึ่งบาทหนึ่งสตางค์');
    expect(thaiBaht(10.075)).toBe('สิบบาทเจ็ดสตางค์');
    expect(thaiBaht(2.675)).toBe('สองบาทหกสิบแปดสตางค์');
    expect(thaiBaht(100.005)).toBe('หนึ่งร้อยบาทหนึ่งสตางค์');
    expect(thaiBaht(0.995)).toBe('หนึ่งบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 17: Array and object type guard
  // ──────────────────────────────────────────
  it('should reject non-number/non-string types', () => {
    expect(thaiBaht([100] as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht([1, 2, 3] as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht([] as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht({} as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht(true as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht(false as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiBaht(Symbol('x') as any)).toBe('ข้อมูลไม่ถูกต้อง');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 18: New string formats (+, leading dot, trailing dot)
  // ──────────────────────────────────────────
  it('should support plus sign, leading dot, and trailing dot', () => {
    expect(thaiBaht('+100')).toBe('หนึ่งร้อยบาทถ้วน');
    expect(thaiBaht('+100.50')).toBe('หนึ่งร้อยบาทห้าสิบสตางค์');
    expect(thaiBaht('+0.25')).toBe('ยี่สิบห้าสตางค์');
    expect(thaiBaht('100.')).toBe('หนึ่งร้อยบาทถ้วน');
    expect(thaiBaht('.5')).toBe('ห้าสิบสตางค์');
    expect(thaiBaht('.25')).toBe('ยี่สิบห้าสตางค์');
    expect(thaiBaht('.00')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('-.5')).toBe('ลบห้าสิบสตางค์');
    expect(thaiBaht('+.5')).toBe('ห้าสิบสตางค์');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 19: Integer Baht + satang edge cases
  // ──────────────────────────────────────────
  it('should handle boundary satang values', () => {
    expect(thaiBaht('0.00')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('0.000')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('0.001')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('0.004')).toBe('ศูนย์บาทถ้วน');
    expect(thaiBaht('0.005')).toBe('หนึ่งสตางค์');
    expect(thaiBaht('0.009')).toBe('หนึ่งสตางค์');
    expect(thaiBaht('0.99')).toBe('เก้าสิบเก้าสตางค์');
    expect(thaiBaht('999.999')).toBe('หนึ่งพันบาทถ้วน');
  });

  // ──────────────────────────────────────────
  // กลุ่ม 20: Pure string decimal rounding
  // ──────────────────────────────────────────
  it('should round string decimals without float issues', () => {
    expect(thaiBaht('1.005')).toBe('หนึ่งบาทหนึ่งสตางค์');
    expect(thaiBaht('1.004')).toBe('หนึ่งบาทถ้วน');
    expect(thaiBaht('1.014')).toBe('หนึ่งบาทหนึ่งสตางค์');
    expect(thaiBaht('1.015')).toBe('หนึ่งบาทสองสตางค์');
    expect(thaiBaht('1.025')).toBe('หนึ่งบาทสามสตางค์');
    expect(thaiBaht('1.995')).toBe('สองบาทถ้วน');
  });
});

describe('thaiRead', () => {
  it('should convert single digits and zero', () => {
    expect(thaiRead(0)).toBe('ศูนย์');
    expect(thaiRead(1)).toBe('หนึ่ง');
    expect(thaiRead(5)).toBe('ห้า');
    expect(thaiRead(9)).toBe('เก้า');
  });

  it('should apply tens/units rules correctly', () => {
    expect(thaiRead(10)).toBe('สิบ');
    expect(thaiRead(11)).toBe('สิบเอ็ด');
    expect(thaiRead(20)).toBe('ยี่สิบ');
    expect(thaiRead(21)).toBe('ยี่สิบเอ็ด');
    expect(thaiRead(123)).toBe('หนึ่งร้อยยี่สิบสาม');
    expect(thaiRead(1000001)).toBe('หนึ่งล้านเอ็ด');
  });

  it('should read decimal values digit-by-digit', () => {
    expect(thaiRead(1.25)).toBe('หนึ่งจุดสองห้า');
    expect(thaiRead(0.005)).toBe('ศูนย์จุดศูนย์ศูนย์ห้า');
    expect(thaiRead(3.14159)).toBe('สามจุดหนึ่งสี่หนึ่งห้าเก้า');
  });

  it('should handle negative numbers', () => {
    expect(thaiRead(-1)).toBe('ลบหนึ่ง');
    expect(thaiRead(-123.45)).toBe('ลบหนึ่งร้อยยี่สิบสามจุดสี่ห้า');
  });

  it('should handle string "-0" as zero', () => {
    expect(thaiRead('-0')).toBe('ศูนย์');
  });

  it('should return error text for invalid inputs', () => {
    expect(thaiRead('abc')).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiRead(NaN)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiRead(Infinity)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiRead('' as any)).toBe('ข้อมูลไม่ถูกต้อง');
  });

  // ──────────────────────────────────────────
  // thaiRead เพิ่มเติม
  // ──────────────────────────────────────────
  it('should reject non-number/non-string types', () => {
    expect(thaiRead([100] as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiRead({} as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiRead(true as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiRead(null as any)).toBe('ข้อมูลไม่ถูกต้อง');
    expect(thaiRead(undefined as any)).toBe('ข้อมูลไม่ถูกต้อง');
  });

  it('should support new string formats (+, leading dot, trailing dot)', () => {
    expect(thaiRead('+100')).toBe('หนึ่งร้อย');
    expect(thaiRead('100.')).toBe('หนึ่งร้อย');
    expect(thaiRead('.5')).toBe('ศูนย์จุดห้า');
    expect(thaiRead('.25')).toBe('ศูนย์จุดสองห้า');
    expect(thaiRead('-.5')).toBe('ลบศูนย์จุดห้า');
    expect(thaiRead('+.5')).toBe('ศูนย์จุดห้า');
  });

  it('should handle float input precision for reading', () => {
    expect(thaiRead(0.1 + 0.2)).toBe('ศูนย์จุดสาม');
    expect(thaiRead(1.005)).toBe('หนึ่งจุดศูนย์ศูนย์ห้า');
  });

  it('should handle zero and near-zero edge cases', () => {
    expect(thaiRead(-0)).toBe('ศูนย์');
    expect(thaiRead(0.000)).toBe('ศูนย์');
    expect(thaiRead('-0')).toBe('ศูนย์');
    expect(thaiRead('-0.00')).toBe('ศูนย์');
  });

  it('should read large numbers with decimal', () => {
    expect(thaiRead('1234567.89')).toBe('หนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดจุดแปดเก้า');
  });
});

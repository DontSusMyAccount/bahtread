# bahtread 🇹🇭

A highly robust, modern, and lightweight TypeScript library to convert numbers into Thai words and Thai Baht currency text format.

## Features

- **Thai Baht Currency Formatting:** Converts numbers/strings (e.g. `852,500`) to Thai Baht text (`"แปดแสนห้าหมื่นสองพันห้าร้อยบาทถ้วน"`).
- **Plain Thai Numbers Formatting:** Converts numbers/strings (e.g. `123.45`) to plain Thai text (`"หนึ่งร้อยยี่สิบสามจุดสี่ห้า"`).
- **Arbitrary Precision (BigInt support):** Safe from floating-point overflow for extremely large values.
- **Auto-rounding:** Correctly rounds currency decimal values (Satang) to 2 decimal places.
- **Negative Numbers:** Supports negative values by prefixing with `"ลบ"`.
- **Zero-Dependency:** Extremely lightweight.
- **ESM & CJS Support:** Built with dual package format exports and full type definitions.

---

## Installation

```bash
npm install bahtread
```

---

## Usage

### 1. Thai Baht Conversion (`thaiBaht`)

Converts a number or string containing numeric digits (commas are automatically cleaned) into formal Thai Baht currency text.

```typescript
import { thaiBaht } from 'bahtread';

// Basic usage
console.log(thaiBaht(852500)); 
// Output: "แปดแสนห้าหมื่นสองพันห้าร้อยบาทถ้วน"

// With decimal / Satang
console.log(thaiBaht('1,234,567.89')); 
// Output: "หนึ่งล้านสองแสนสามหมื่นสี่พันห้าร้อยหกสิบเจ็ดบาทแปดสิบเก้าสตางค์"

// Negative values
console.log(thaiBaht(-10.50)); 
// Output: "ลบสิบบาทห้าสิบสตางค์"

// Decimals automatic rounding (to 2 decimal places)
console.log(thaiBaht(1.234)); // Output: "หนึ่งบาทยี่สิบสามสตางค์"
console.log(thaiBaht(1.235)); // Output: "หนึ่งบาทยี่สิบสี่สตางค์"

// String inputs support commas, plus sign, leading/trailing dots
console.log(thaiBaht('1,234,567.89')); // commas ignored
console.log(thaiBaht('+100.50'));      // leading plus ok
console.log(thaiBaht('.25'));          // → "ยี่สิบห้าสตางค์"
console.log(thaiBaht('100.'));         // → "หนึ่งร้อยบาทถ้วน"
  ```

### 2. Thai Plain Reading (`thaiRead`)

Converts a number or numeric string to plain Thai reading text, with decimals read digit-by-digit.

```typescript
import { thaiRead } from 'bahtread';

console.log(thaiRead(123)); 
// Output: "หนึ่งร้อยยี่สิบสาม"

console.log(thaiRead(123.45)); 
// Output: "หนึ่งร้อยยี่สิบสามจุดสี่ห้า"

console.log(thaiRead(-1000001)); 
// Output: "ลบหนึ่งล้านเอ็ด"
```

---

## Rounding Policy

`thaiBaht` rounds **half-up** at the 2nd decimal place (satang):

| Input | JS binary (IEEE 754) | `Math.round(n × 100)` | Output |
|-------|---------------------|------------------------|--------|
| `0.001` | → 0.001 | → 0 | `ศูนย์บาทถ้วน` |
| `0.004` | → 0.004 | → 0 | `ศูนย์บาทถ้วน` |
| `0.005` | → 0.005 | → 1 | `หนึ่งสตางค์` |
| `1.234` | → 1.234 | → 123 | `ยี่สิบสามสตางค์` |
| `1.235` | → 1.235 | → 124 | `ยี่สิบสี่สตางค์` |
| `1.999` | → 1.999 | → 200 | `สองบาทถ้วน` (integer carries) |

> ⚠️ **Large numbers**: For values above `Number.MAX_SAFE_INTEGER` (~9 quadrillion), use **string input** to avoid precision loss:
> ```ts
> // ✅ correct — string preserves all digits
> thaiBaht('9999999999999999.99')
>
> // ❌ wrong — number loses precision
> thaiBaht(9999999999999999.99)
> ```
> This also applies to `thaiRead` for very long decimal values.

## Supported Input Formats

`parseInput` accepts flexible numeric string representations:

| Format | Example | Behavior |
|--------|---------|----------|
| Plain number | `'123'` | standard |
| Commas | `'1,234,567.89'` | commas stripped |
| Whitespace | `'  100  '` | trimmed |
| Leading `+` | `'+100'` | stripped |
| Leading dot | `'.5'` | → `'0.5'` |
| Trailing dot | `'100.'` | → `'100'` |
| Negative dot | `'-.5'` | → `'-0.5'` |
| Leading zeros | `'000123'` | stripped |

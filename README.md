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
# bahtread

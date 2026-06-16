import { thaiBaht, thaiRead } from './src/index';

// ตัวอย่างการใช้งานการแปลงเป็นเงินบาท
const bahtExample1 = '852,500';
const bahtResult1 = thaiBaht(bahtExample1);
console.log(`การแปลง ${bahtExample1} -> ${bahtResult1}`);

const bahtExample2 = 1234567.89;
const bahtResult2 = thaiBaht(bahtExample2);
console.log(`การแปลง ${bahtExample2} -> ${bahtResult2}`);

// ตัวอย่างการใช้งานการอ่านออกเสียงตัวเลขทั่วไป
const numberExample = 123.45;
const numberResult = thaiRead(numberExample);
console.log(`การอ่านตัวเลข ${numberExample} -> ${numberResult}`);

const numberGood = '895,218,500,500'
const numResult = thaiRead(numberGood);
console.log(`การอ่านตัวเลข ${numberGood} -> ${numResult}`);

export { thaiBaht, thaiRead };
import { thaiBaht } from './src/index';
// @ts-ignore
import thaiBahtText from 'thai-baht-text';
// @ts-ignore
import { bahttext } from 'bahttext';

// Test cases for speed
const speedTestCases = [
  852500,
  1234.56,
  -10.50,
  99.99
];

// Test cases for correctness (large numbers and float quirks)
const correctnessTestCases = [
  { input: 0.1 + 0.2, expected: 'สามสิบสตางค์' }, // Floating point quirk (0.30000000000000004)
  { input: 1.234, expected: 'หนึ่งบาทยี่สิบสามสตางค์' }, // Rounding
  { input: '9007199254740993', expected: 'เก้าพันเจ็ดล้านล้านหนึ่งแสนเก้าหมื่นเก้าพันสองร้อยห้าสิบสี่ล้านเจ็ดแสนสี่หมื่นเก้าร้อยเก้าสิบสามบาทถ้วน' } // BigInt safety
];

function runPerformanceBenchmark() {
  console.log('=== Performance Benchmark (100,000 iterations per library) ===\n');

  const iterations = 100000;

  // 1. bahtread
  let startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    for (const val of speedTestCases) {
      thaiBaht(val);
    }
  }
  let endTime = performance.now();
  const durationBahtread = endTime - startTime;
  const opsBahtread = Math.round((iterations * speedTestCases.length) / (durationBahtread / 1000));
  console.log(`bahtread (our library):`);
  console.log(`- Time: ${durationBahtread.toFixed(2)} ms`);
  console.log(`- Speed: ${opsBahtread.toLocaleString()} ops/sec\n`);

  // 2. bahttext
  let durationBahttext = 0;
  let opsBahttext = 0;
  try {
    startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      for (const val of speedTestCases) {
        bahttext(val);
      }
    }
    endTime = performance.now();
    durationBahttext = endTime - startTime;
    opsBahttext = Math.round((iterations * speedTestCases.length) / (durationBahttext / 1000));
    console.log(`bahttext:`);
    console.log(`- Time: ${durationBahttext.toFixed(2)} ms`);
    console.log(`- Speed: ${opsBahttext.toLocaleString()} ops/sec\n`);
  } catch (err: any) {
    console.log(`bahttext: Failed to run (${err.message})\n`);
  }

  // 3. thai-baht-text
  let durationThaiBahtText = 0;
  let opsThaiBahtText = 0;
  try {
    startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      for (const val of speedTestCases) {
        thaiBahtText(val);
      }
    }
    endTime = performance.now();
    durationThaiBahtText = endTime - startTime;
    opsThaiBahtText = Math.round((iterations * speedTestCases.length) / (durationThaiBahtText / 1000));
    console.log(`thai-baht-text:`);
    console.log(`- Time: ${durationThaiBahtText.toFixed(2)} ms`);
    console.log(`- Speed: ${opsThaiBahtText.toLocaleString()} ops/sec\n`);
  } catch (err: any) {
    console.log(`thai-baht-text: Failed to run (${err.message})\n`);
  }

  if (durationBahttext && durationThaiBahtText) {
    const ratioText = (durationBahttext / durationBahtread).toFixed(1);
    const ratioThaiBaht = (durationThaiBahtText / durationBahtread).toFixed(1);
    console.log(`Summary: bahtread is ${ratioText}x faster than bahttext and ${ratioThaiBaht}x faster than thai-baht-text!\n`);
  }
}

function runCorrectnessComparison() {
  console.log('=== Correctness & Edge-Case Comparison ===\n');

  for (const tc of correctnessTestCases) {
    console.log(`Input: ${tc.input} (Expected: "${tc.expected}")`);

    // bahtread
    let resBahtread = '';
    try {
      resBahtread = thaiBaht(tc.input);
    } catch {
      resBahtread = 'THREW ERROR';
    }
    console.log(`- bahtread:       "${resBahtread}" -> ${resBahtread === tc.expected ? '✅ PASS' : '❌ FAIL'}`);

    // bahttext
    let resBahttext = '';
    try {
      resBahttext = bahttext(Number(tc.input));
    } catch {
      resBahttext = 'THREW ERROR';
    }
    console.log(`- bahttext:       "${resBahttext}" -> ${resBahttext === tc.expected ? '✅ PASS' : '❌ FAIL'}`);

    // thai-baht-text
    let resThaiBahtText = '';
    try {
      resThaiBahtText = thaiBahtText(Number(tc.input));
    } catch {
      resThaiBahtText = 'THREW ERROR';
    }
    console.log(`- thai-baht-text: "${resThaiBahtText}" -> ${resThaiBahtText === tc.expected ? '✅ PASS' : '❌ FAIL'}`);
    console.log();
  }
}

// Check if libraries are installed before running
try {
  runCorrectnessComparison();
  runPerformanceBenchmark();
} catch (e: any) {
  console.log(`Error: Please make sure 'bahttext' and 'thai-baht-text' are installed first!`);
  console.log(`Run: npm install -D bahttext thai-baht-text\n`);
}

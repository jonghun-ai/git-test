/**
 * LG Smart_H TTF -> WOFF2 서브셋 생성기
 *
 *   cd tools && npm install && npm run build:fonts
 *
 * 기본은 한글 전체(11,172자)를 포함해 어떤 한국어 텍스트에도 안전합니다.
 * 용량을 더 줄이려면 COVERAGE 를 'used' 로 바꾸세요. 단, 이 경우
 * index.html 의 텍스트가 바뀔 때마다 이 스크립트를 다시 실행해야 합니다.
 */
import subsetFont from 'subset-font';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const COVERAGE = 'full';          // 'full' | 'used'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = path.join(ROOT, 'fonts');
const WEIGHTS = {
  Light:    'LGSMHAL.TTF',
  Regular:  'LGSMHAR.TTF',
  SemiBold: 'LGSMHASB.TTF',
  Bold:     'LGSMHAB.TTF',
};

// ASCII + 한글 자모 + 자주 쓰는 기호
let chars = '';
for (let c = 0x20; c <= 0x7e; c++) chars += String.fromCharCode(c);
for (let c = 0x3131; c <= 0x3163; c++) chars += String.fromCharCode(c);
chars += '·…※★☆←→↑↓“”‘’—–°％㎡㎏';

if (COVERAGE === 'full') {
  for (let c = 0xac00; c <= 0xd7a3; c++) chars += String.fromCharCode(c);
} else {
  chars += fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
}
const text = [...new Set(chars)].join('');

const kb = n => (n / 1024).toFixed(0) + 'KB';
console.log(`coverage=${COVERAGE}, 문자 ${[...new Set(text)].length}자`);

let total = 0;
for (const [weight, file] of Object.entries(WEIGHTS)) {
  const src = path.join(FONT_DIR, file);
  if (!fs.existsSync(src)) throw new Error('원본 없음: ' + src);
  const out = await subsetFont(fs.readFileSync(src), text, { targetFormat: 'woff2' });
  const dest = path.join(FONT_DIR, `LGSmart-${weight}.woff2`);
  fs.writeFileSync(dest, out);
  total += out.length;
  console.log(`  ${weight.padEnd(9)} ${kb(fs.statSync(src).size).padStart(8)} -> ${kb(out.length)}`);
}
console.log(`합계 ${(total / 1024 / 1024).toFixed(2)}MB`);

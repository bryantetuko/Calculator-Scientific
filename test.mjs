// Harness: jalankan logika kalkulator scientific dari index.html dengan DOM stub minimal.
import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeEl(tag = 'div') {
  return {
    tagName: tag, textContent: '', className: '', dataset: {}, children: [],
    style: {}, listeners: {},
    appendChild(c) { this.children.push(c); },
    addEventListener(ev, fn) { this.listeners[ev] = fn; },
  };
}

const els = { expr: makeEl(), out: makeEl(), hist: makeEl(), keys: makeEl() };
const document = {
  getElementById: id => els[id],
  createElement: makeEl,
  addEventListener: () => {},
};
const window = {};

const fn = new Function('document', 'window', script + '\nreturn window.__calc;');
const calc = fn(document, window);

let pass = 0, fail = 0;
// layar menampilkan hasil dengan awalan "= " (gaya referensi) — bandingkan angkanya saja
const shown = () => els.out.textContent.replace(/^= /, '');
function check(seq, expected, label) {
  calc.press('AC');
  for (const k of seq) calc.press(k);
  const got = shown();
  const ok = got === expected;
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(24)} got=${got.padEnd(16)} expected=${expected}`);
}
function ok(cond, label, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label.padEnd(24)} got=${detail}`);
}
const setMode = m => { if (calc.state().angle !== m) calc.press('DEG'); };

/* --- aritmetika dasar --- */
check(['1','2','+','3','='], '15', '12+3');
check(['9','−','4','='], '5', '9-4');
check(['7','×','8','='], '56', '7*8');
check(['8','÷','2','='], '4', '8/2');
check(['5','÷','0','='], 'Error', '5/0 -> Error');
check(['1','.','5','+','2','.','2','5','='], '3.75', '1.5+2.25');
check(['1','+','2','+','3','='], '6', 'chained 1+2+3');
check(['1','2','3','⌫'], '12', '123 backspace (preview)');
check(['9','9','×','9','9','='], '9801', '99*99');
check(['0','.','1','+','0','.','2','='], '0.3', '0.1+0.2 (float)');
check(['1','0','0','÷','4','='], '25', '100/4');
check(['2','+','3','=','×','4','='], '20', 'hasil dipakai lagi');
check(['5','+','5','=','AC'], '0', 'AC reset');
check(['3','.','1','4','×','2','='], '6.28', '3.14*2');

/* --- pangkat, akar, faktorial, persen, tanda --- */
check(['2','^','1','0','='], '1024', '2^10');
check(['5','x²','='], '25', '5 kuadrat');
check(['√','9','='], '3', 'akar(9) auto-close');
check(['√','(','1','6','+','9',')','='], '5', 'akar(16+9)');
check(['5','x!','='], '120', '5! ');
check(['0','x!','='], '1', '0!');
check(['2','0','0','%'], '2', '200%');
check(['5','0','%'], '0.5', '50%');
check(['5','±','='], '-5', '5 -> -5');
check(['5','±','±','='], '5', '5 -> -5 -> 5');
check(['2','^','−','1','='], '0.5', '2^-1');

/* --- x⁻¹ --- */
check(['5','x⁻¹','='], '0.2', '5^-1');
check(['0','x⁻¹','='], 'Error', '0^-1 -> Error');
check(['2','+','4','x⁻¹','='], '2.25', '2 + 1/4');
check(['5','=','x⁻¹'], '0.2', 'hasil lalu x^-1');

/* --- kurung & perkalian implisit --- */
check(['(','2','+','3',')','×','4','='], '20', '(2+3)*4');
check(['2','×','(','3','+','4',')','='], '14', '2*(3+4)');
check(['2','π','='], '6.28318530718', '2 pi implisit');
check(['3','(','2','+','1',')','='], '9', '3(2+1) implisit');
check(['π','='], '3.14159265359', 'pi');
check(['2','+','3','×','4','='], '14', 'precedence 2+3*4');
check(['2','+','3','×','4','^','2','='], '50', 'precedence 2+3*4^2');

/* --- fungsi, mode DEG --- */
setMode('DEG');
check(['sin','3','0',')','='], '0.5', 'sin(30) DEG');
check(['cos','6','0',')','='], '0.5', 'cos(60) DEG');
check(['tan','4','5',')','='], '1', 'tan(45) DEG');
check(['tan','9','0',')','='], 'Error', 'tan(90) DEG -> Error');
check(['sinh','1',')','='], '1.17520119364', 'sinh(1)');
check(['cosh','0',')','='], '1', 'cosh(0)');
check(['cosh','1',')','='], '1.54308063482', 'cosh(1)');
check(['tanh','1',')','='], '0.761594155956', 'tanh(1)');
check(['tanh','1','0',')','='], '0.999999995878', 'tanh(10)');
check(['sinh','0',')','='], '0', 'sinh(0)');
check(['sinh','1','0','0','0',')','='], 'Error', 'sinh(1000) -> Error');
check(['ln','e',')','='], '1', 'ln(e)');
check(['log','1','0','0',')','='], '2', 'log(100)');
check(['sin','cos','0',')',')','='], '0.0174524064373', 'sin(cos(0)) nested');

/* --- mode RAD --- */
setMode('RAD');
check(['sin','π','÷','2',')','='], '1', 'sin(pi/2) RAD');
check(['cos','0',')','='], '1', 'cos(0) RAD');
check(['tan','π','÷','4',')','='], '1', 'tan(pi/4) RAD');
check(['sinh','1',')','='], '1.17520119364', 'sinh(1) RAD (mode-independen)');
check(['tanh','1',')','='], '0.761594155956', 'tanh(1) RAD (mode-independen)');
setMode('DEG');

/* --- error handling --- */
check(['÷','5','='], 'Error', 'mulai dengan ÷ -> Error');
check(['ln','0',')','='], 'Error', 'ln(0) -> Error');
check(['√','−','4',')','='], 'Error', 'akar(-4) -> Error');
check(['1','7','1','x!','='], 'Error', '171! -> Error');

/* --- layar bergaya referensi --- */
calc.press('AC');
for (const k of ['1','0','0','+','2','3','=']) calc.press(k);
ok(els.out.textContent === '= 123', 'hasil diawali "="', els.out.textContent);
ok(els.hist.textContent.split('\n').pop() === '100 + 23', 'ekspresi masuk riwayat', JSON.stringify(els.hist.textContent));
ok(els.expr.textContent === '', 'baris input kosong stlh =', JSON.stringify(els.expr.textContent));
calc.press('AC');
ok(els.out.textContent === '0', 'kosong -> 0', els.out.textContent);
for (const k of ['1','+','1','=']) calc.press(k);
for (const k of ['2','+','2','=']) calc.press(k);
ok(els.hist.textContent.split('\n').length === 2, 'riwayat maks 2 baris', JSON.stringify(els.hist.textContent));

/* --- tata letak & gaya (referensi Dribbble) --- */
const labels = els.keys.children.map(b => b.textContent);
const expected = [
  'DEG','(',')','%','x!','π',
  'sin','cos','tan','sinh','cosh','tanh',
  'ln','log','√','x²','x⁻¹','e',
  '7','8','9','⌫','AC',
  '4','5','6','×','÷',
  '1','2','3','+','−',
  '0','.','ANS','^','=',
];
ok(labels.length === 38 && labels.every((l, i) => l === expected[i]),
  'urutan 38 tombol', labels.length + ' tombol');

const keypad = labels.slice(18).join(' ');
ok(keypad === '7 8 9 ⌫ AC 4 5 6 × ÷ 1 2 3 + − 0 . ANS ^ =',
  'keypad pola Casio', keypad);

const fnKeys = els.keys.children.filter(b => b.className === 'fn');
const numKeys = els.keys.children.filter(b => b.className === 'num');
const opKeys = els.keys.children.filter(b => b.className === 'op' || b.className === 'eq' || b.className === 'ac');
ok(fnKeys.length === 18 && numKeys.length === 12 && opKeys.length === 8,
  '18 fungsi / 12 angka / 8 oranye', `${fnKeys.length} / ${numKeys.length} / ${opKeys.length}`);

ok(fnKeys.every(b => b.style.gridColumn === 'span 5'), 'fungsi span 5 (6 kolom)', 'span 5');
ok(opKeys.concat(numKeys).every(b => b.style.gridColumn === 'span 6'), 'keypad span 6 (5 kolom)', 'span 6');

const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const style = [
  ['grid 30 kolom', /grid-template-columns:\s*repeat\(30,\s*1fr\)/],
  ['tombol bulat', /border-radius:\s*50%/],
  ['tombol persegi (aspect-ratio)', /aspect-ratio:\s*1/],
  ['operator oranye', /#f2703a/],
  ['angka abu gelap', /background:\s*#2e2e2e/],
  ['fungsi hampir hitam', /background:\s*#1e1e1e/],
  ['latar hitam hangat', /#26190f/],
];
for (const [label, re] of style) ok(re.test(html), label, re.test(html) ? 'ada' : 'tidak ada');

// tidak boleh ada box-shadow pada tombol
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map(r => r.trim()).filter(Boolean);
const btnRules = rules.filter(r => /^(button|\.num|\.op|\.eq|\.ac|\.fn)\b/.test(r.split('{')[0].trim().split(',')[0]));
const withShadow = btnRules.filter(r => /box-shadow/.test(r));
ok(btnRules.length >= 8 && withShadow.length === 0,
  'tombol tanpa shadow', `${btnRules.length} rule, ${withShadow.length} ber-shadow`);

// layar harus beda warna dari bodi
const bodyBg = (css.match(/\.calc\s*\{[^}]*background:\s*([^;]+);/) || [])[1];
const screenBg = (css.match(/\.screen\s*\{[^}]*background:\s*([^;]+);/) || [])[1];
ok(!!bodyBg && !!screenBg && bodyBg.trim() !== screenBg.trim(),
  'layar beda warna dari bodi', `${bodyBg} vs ${screenBg}`);

ok(!/class="hint"|Keyboard:|mode sudut/.test(html), 'tanpa teks hint', 'tidak ada');

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
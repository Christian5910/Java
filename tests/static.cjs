const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html'));
for (const file of htmlFiles) {
  const source = read(file);
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, file + ': duplicate id');
  assert.ok(!/Internet e Redes|DESInternete|TCP|Ethernet/.test(source), file + ': old subject');
  for (const match of source.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(https?:|mailto:|data:)/.test(url)) continue;
    const [filename, fragment] = url.split('#');
    const target = decodeURIComponent(filename.split('?')[0]) || file;
    assert.ok(exists(target), `${file}: missing ${target}`);
    if (fragment && target.endsWith('.html')) assert.ok(read(target).includes(`id="${fragment}"`), `${file}: missing #${fragment}`);
  }
}
const content = read('cont.html');
const guide = read('assets/extras/roteiro-avancado.html');
assert.equal([...guide.matchAll(/<section>/g)].length,16);
for(const [,url] of guide.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if(/^https?:/.test(url)) continue;
  const [filename,fragment]=url.split('#');
  const absolute=path.resolve(root,'assets/extras',filename);
  assert.ok(fs.existsSync(absolute),'guide missing '+url);
  if(fragment) assert.ok(fs.readFileSync(absolute,'utf8').includes('id="'+fragment+'"'),'guide missing #'+fragment);
}
assert.equal([...content.matchAll(/id="modal\d+"/g)].length, 30);
assert.equal([...content.matchAll(/class="study-text"/g)].length, 30);
assert.equal([...content.matchAll(/data-topic="\d+"/g)].length, 30);
assert.equal([...content.matchAll(/id="cat\d+"/g)].length, 15);
assert.equal([...read('extra.html').matchAll(/class="study-text"/g)].length, 20);
assert.equal([...read('extra.html').matchAll(/class="col-md-6 topic-item"/g)].length, 20);
assert.ok(content.replace(/<[^>]*>/g, ' ').split(/\s+/).length > 48000);
assert.equal([...read('faq.html').matchAll(/class="accordion-item"/g)].length, 80);
assert.ok(read('extra.html').replace(/<[^>]*>/g, ' ').split(/\s+/).length > 16500);
const exercises = JSON.parse(read('assets/data/exercises.json'));
assert.equal(exercises.length, 53);
assert.equal(new Set(exercises.map(item => item.id)).size, exercises.length);
assert.equal(new Set(exercises.map(item => item.theme)).size, 14);
for (const exercise of exercises) {
  assert.ok(exercise.source.includes('public class Main'));
  assert.ok(exercise.goal && exercise.challenge && exercise.hint && exercise.expected);
  assert.ok(content.includes('playground.html?ex=' + exercise.id) || ['tipos'].includes(exercise.id), 'unlinked exercise ' + exercise.id);
}
const quizSource = read('assets/js/quiz.js');
const prefix = quizSource.slice(0, quizSource.indexOf('const STORAGE_KEY'));
const questions = vm.runInNewContext(prefix + '; RAW_QUESTIONS');
assert.equal(questions.length, 60);
assert.equal(new Set(questions.map(item => item.theme)).size, 10);
assert.equal(JSON.stringify(questions), JSON.stringify(JSON.parse(read('assets/data/questions.json'))));
assert.equal(JSON.stringify(questions.slice(0,40)), JSON.stringify(JSON.parse(read('tests/fixtures/quiz-v1-questions.json'))));
for (let theme=1; theme<=10; theme++) assert.equal(questions.filter(q=>q.theme===theme).length,6);
for (const q of questions) {
  assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4);
  assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4);
  assert.ok(q.hint && q.explanation);
}
for (const file of fs.readdirSync(path.join(root, 'assets/js'))) {
  if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', path.join(root, 'assets/js', file)]);
}
execFileSync(process.execPath, ['--check', path.join(root, 'service-worker.js')]);
const [version, ...cached] = read('sw-version.txt').trim().split(/\r?\n/);
assert.ok(read('service-worker.js').includes(`const SW_BUILD = '${version}'`));
for (const file of cached) assert.ok(file === './' || exists(file), 'Missing cache file: ' + file);
assert.ok(cached.includes('assets/data/exercises.json'));
assert.equal(cached.filter(file => file.endsWith('.pdf')).length, fs.readdirSync(path.join(root, 'assets/materiais')).filter(file => file.endsWith('.pdf')).length);
for (const size of [192,512]) {
  const png = fs.readFileSync(path.join(root, `assets/icon-${size}.png`));
  assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size);
}
assert.ok(content.includes('<hr class="my-5"><section id="extra"'));
assert.ok(!content.includes('researchTopic'));
for (let n=1;n<=30;n++) {
  const body = content.split(`id="modal${n}"`)[1].split('<article class="study-text">')[1].split('</article>')[0];
  const headings = [...body.matchAll(/<h3>(\d+)\./g)].map(m=>Number(m[1]));
  assert.deepEqual(headings, headings.map((_,i)=>i+1), 'linear topic '+n);
  assert.ok(/Prática|Revisão integrada|Aplicar e conferir|Verificar a calculadora|Exercícios para verificar/.test(body.slice(body.lastIndexOf('<h3>'))),'practice must end topic '+n);
  if(n>=15) assert.ok(body.replace(/<[^>]*>/g,' ').split(/\s+/).length>1100,'detailed topic '+n);
}
const faq = JSON.parse(read('assets/data/faq.json'));
for(const [,q,a] of faq) assert.ok(read('faq.html').includes(q.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')),q);
console.log(`PASS: ${htmlFiles.length} HTML pages, 30 linear chapters, 20 extras, 60 questions, 53 exercises, 80 FAQ entries and ${cached.length} cache paths.`);

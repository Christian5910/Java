const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const html = ['cont.html',...Array.from({length:8},(_,i)=>`tema-0${i+1}.html`)].map(file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8')).join('\n');
const decode = text => text.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"})[entity]);
const normalize = text => text.replace(/\r/g, '').trim();
const expected = {
  enum: 'Estudo em andamento',
  collections: '[Ana, Bruno, Ana]\n[Ana, Bruno]\n{Ana=9, Bruno=8}\nfalse',
  streams: '[7, 7, 9]\n[5, 7, 9, 7]',
  interface: 'Bem-vindo ao estudo\nRevise o exemplo antes de executar',
  exceptions: 'Quantidade: 3\nFormato inválido: zero\nQuantidade deve ser positiva'
};
const work = path.resolve(__dirname, '../../.work/java-tests');
fs.mkdirSync(work, { recursive: true });
const programs = Object.entries(expected).map(([id, output]) => {
  const match = html.match(new RegExp('<code id="research-' + id + '">([\\s\\S]*?)</code>'));
  assert.ok(match, 'missing example ' + id);
  const source = decode(match[1]);
  const directory = fs.mkdtempSync(path.join(work, 'research-'));
  const filename = path.join(directory, 'Main.java');
  fs.writeFileSync(filename, source, 'utf8');
  execFileSync('javac', ['--release', id === 'enum' ? '17' : '8', '-encoding', 'UTF-8', filename], {timeout:20000});
  const result = execFileSync('java', ['-Dfile.encoding=UTF-8','-Dstdout.encoding=UTF-8','-Dstderr.encoding=UTF-8','-Dsun.stdout.encoding=UTF-8','-Dsun.stderr.encoding=UTF-8','-cp',directory,'Main'], {encoding:'utf8',timeout:10000});
  assert.equal(normalize(result), output, id);
  return { id, source, output };
});
assert.equal((html.match(/id="researchTopic\d+"/g) || []).length, 0);
console.log('PASS: five research programs compile and produce the documented outputs.');

if (process.argv.includes('--browser')) {
  (async () => {
    const { chromium } = require('playwright');
    const browser = await chromium.launch({channel:'msedge'});
    try {
      const page = await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.goto((process.env.JAVA_SITE_URL || 'http://127.0.0.1:4177/java/') + 'playground.html');
      await page.waitForFunction(() => !document.getElementById('runJava').disabled);
      for (const program of programs) {
        await page.fill('#javaCode', program.source);
        await page.fill('#javaInput', '');
        await page.click('#runJava');
        await page.waitForFunction(() => !document.getElementById('runJava').disabled, null, {timeout:200000});
        assert.match(await page.locator('#runtimeStatus').innerText(), /^Programa encerrado\./, program.id);
        assert.equal(normalize(await page.locator('#javaOutput').innerText()), program.output, program.id);
        console.log('PASS CheerpJ research example:', program.id);
      }
      assert.deepEqual(errors, []);
    } finally { await browser.close(); }
  })().catch(error => {console.error(error);process.exit(1)});
}

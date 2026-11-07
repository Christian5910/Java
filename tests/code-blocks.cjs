const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = (process.env.JAVA_SITE_URL || 'http://127.0.0.1:4189/').replace(/\/?$/, '/');

/* Espera o conteúdo carregado por script (capítulos na página Conteúdo) parar de crescer. */
async function settle(page) {
  let last = -1, stable = 0;
  while (stable < 4) {
    const count = await page.evaluate(() => document.querySelectorAll('pre').length);
    stable = count === last ? stable + 1 : 0;
    last = count;
    await page.waitForTimeout(250);
  }
}
const texts = page => page.evaluate(() => [...document.querySelectorAll('pre code, pre samp')].map(e => e.textContent));

/* O destaque nunca pode alterar o texto: compara a página com e sem o script de blocos de código. */
async function assertTextUnchanged(browser, name) {
  const plainContext = await browser.newContext({ serviceWorkers: 'block' });
  await plainContext.route('**/assets/js/code-blocks.js', route => route.abort());
  const plain = await plainContext.newPage();
  await plain.goto(base + name + '.html', { waitUntil: 'load' });
  await settle(plain);
  const expected = await texts(plain);
  await plainContext.close();
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(base + name + '.html', { waitUntil: 'load' });
  await settle(page);
  const actual = await texts(page);
  assert.ok(expected.length > 0, name + ': nenhum bloco de código encontrado');
  assert.equal(actual.length, expected.length, name + ': quantidade de blocos');
  const diff = expected.findIndex((text, i) => text !== actual[i]);
  assert.equal(diff, -1, name + ': o texto do bloco ' + diff + ' mudou');
  /* Todo bloco com código (inclusive os carregados depois) foi tratado, exceto as saídas. */
  const pending = await page.evaluate(() => [...document.querySelectorAll('figure.lesson-example > pre, .study-text pre')]
    .filter(pre => pre.querySelector(':scope > code') && !pre.querySelector('samp') && !pre.dataset.codeEnhanced).length);
  assert.equal(pending, 0, name + ': blocos sem tratamento');
  await context.close();
}

/* O aviso para leitores de tela é publicado logo após o clique; espera até aparecer. */
async function announced(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('[role="status"].visually-hidden')].some(e => e.textContent.trim()), null, { timeout: 3000 });
  return page.evaluate(() => [...document.querySelectorAll('[role="status"].visually-hidden')].map(e => e.textContent).join(' '));
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'], serviceWorkers: 'block' });
  const page = await context.newPage();

  for (const name of ['tema-01', 'tema-02', 'cont', 'extra', 'index']) {
    await page.goto(base + name + '.html', { waitUntil: 'load' });
    await page.waitForSelector('.code-copy', { state: 'attached' });
    await assertTextUnchanged(browser, name);
    assert.equal(await page.locator('samp .tok, samp .code-copy').count(), 0, name + ': saídas não recebem cores');
    const buttons = await page.locator('.code-copy').evaluateAll(list => list.map(b => ({ label: b.getAttribute('aria-label'), type: b.type })));
    assert.ok(buttons.length > 0 && buttons.every(b => b.type === 'button' && /^Copiar código: \S/.test(b.label)), name + ': botões com nome acessível');
  }

  /* Capítulo 2: programa colorido; terminal do capítulo 1 sem cores. */
  await page.goto(base + 'tema-02.html', { waitUntil: 'load' });
  const program = page.locator('figure.lesson-example').filter({ has: page.locator('code[data-java-program]') }).first();
  assert.ok(await program.locator('.tok-k').count() > 0 && await program.locator('.tok-t').count() > 0, 'programa Java com palavras reservadas e tipos coloridos');
  assert.ok(await program.locator('.tok-n').count() > 0, 'números coloridos');
  const source = await program.locator('code').textContent();

  await page.goto(base + 'tema-01.html', { waitUntil: 'load' });
  const shell = page.locator('.code-bar-shell').first();
  assert.ok(await shell.count() > 0, 'bloco de terminal com barra própria');
  assert.equal(await shell.locator('xpath=following-sibling::pre[1]').locator('.tok').count(), 0, 'comandos de terminal ficam sem cores de Java');

  /* Copiar: clique e teclado. */
  await page.goto(base + 'tema-02.html', { waitUntil: 'load' });
  const copy = page.locator('figure.lesson-example').filter({ has: page.locator('code[data-java-program]') }).first().locator('.code-copy');
  await copy.click();
  await page.waitForFunction(el => el.textContent === 'Copiado', await copy.elementHandle(), { timeout: 3000 });
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r/g, ''), source.replace(/\n$/, ''), 'o texto copiado é o código original');
  await page.waitForFunction(el => el.textContent === 'Copiar', await copy.elementHandle(), { timeout: 5000 });
  await page.evaluate(() => navigator.clipboard.writeText('outra coisa'));
  await copy.focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(el => el.textContent === 'Copiado', await copy.elementHandle(), { timeout: 3000 });
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r/g, ''), source.replace(/\n$/, ''), 'Enter também copia');
  assert.match(await announced(page), /código copiado/i);

  /* Falha de cópia: mensagem clara e nenhum erro de página. */
  const failing = await context.newPage();
  const errors = [];
  failing.on('pageerror', e => errors.push(String(e)));
  await failing.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('negado')) } });
    document.execCommand = () => false;
  });
  await failing.goto(base + 'tema-02.html', { waitUntil: 'load' });
  await failing.locator('.code-copy').first().click();
  await failing.waitForFunction(() => document.querySelector('.code-copy').textContent === 'Não copiou');
  assert.match(await announced(failing), /não foi possível copiar/i);
  assert.deepEqual(errors, []);
  await failing.close();

  /* Impressão: sem botões, barras nem cores. */
  await page.emulateMedia({ media: 'print' });
  assert.equal(await page.locator('.code-copy').first().evaluate(e => getComputedStyle(e).display), 'none');
  const printed = await page.locator('figure.lesson-example .tok-k').first().evaluate(e => ({ own: getComputedStyle(e).color, parent: getComputedStyle(e.closest('code')).color }));
  assert.equal(printed.own, printed.parent, 'na impressão o código usa a cor do texto');
  await page.emulateMedia({ media: 'screen' });
  console.log('PASS code blocks: text unchanged, Java-only colors, copy by click/keyboard, failure message and print at 1440px.');

  /* Celular: sem rolagem lateral e alvo de toque de 44px. */
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, serviceWorkers: 'block' });
  const phone = await mobile.newPage();
  for (const name of ['tema-02', 'cont', 'index']) {
    await phone.goto(base + name + '.html', { waitUntil: 'load' });
    await phone.waitForSelector('.code-copy', { state: 'attached' });
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name + ': sem rolagem horizontal da página');
  }
  await phone.goto(base + 'tema-02.html', { waitUntil: 'load' });
  const box = await phone.locator('.code-copy').first().boundingBox();
  assert.ok(box.height >= 44 && box.width >= 44, 'botão Copiar com alvo mínimo de 44px');
  console.log('PASS code blocks on 390px: no horizontal page scroll and 44px copy target.');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });

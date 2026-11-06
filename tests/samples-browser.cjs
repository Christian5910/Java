const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.env.JAVA_SITE_URL||'http://127.0.0.1:4189/';
const shots=path.resolve(__dirname,'../../.work/sample-shots');
fs.mkdirSync(shots,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'msedge'});
  try {
    for(const width of [1440,390]) {
      const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
      const page=await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+'amostras.html',{waitUntil:'networkidle'});
      assert.equal(await page.locator('.sample-topic-group').count(),3);
      assert.equal(await page.locator('.sample-topic-group button').count(),0);
      assert.equal(await page.locator('[data-bs-toggle="modal"]').count(),0);
      assert.equal(await page.locator('.sample-group-heading').first().evaluate(e=>getComputedStyle(e).textAlign),'right');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.screenshot({path:path.join(shots,'groups-'+width+'.png'),fullPage:true});
      await page.locator('.sample-topic-group a[href="amostra-tema-03.html"]').click();
      await page.waitForURL('**/amostra-tema-03.html');
      assert.ok(await page.locator('.lesson-article h2').count()>20);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.screenshot({path:path.join(shots,'chapter-'+width+'.png')});
      await page.goto(base+'amostra-atividade.html',{waitUntil:'networkidle'});
      await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
      assert.equal(await page.locator('#javaCode').inputValue(),'');
      const solution=page.locator('details').filter({has:page.locator('#sampleSolution')});
      assert.equal(await solution.getAttribute('open'),null);
      await page.screenshot({path:path.join(shots,'activity-'+width+'.png'),fullPage:true});
      await solution.locator('summary').click();
      assert.match(await page.locator('#sampleSolution').innerText(),/public class Main/);
      assert.equal(await page.locator('#javaCode').inputValue(),'','opening solution must not fill editor');
      await page.locator('#javaCode').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(shots,'editor-'+width+'.png')});
      await page.locator('#runJava').click();
      assert.match(await page.locator('#runtimeStatus').innerText(),/Escreva um programa/);
      await page.evaluate(()=>localStorage.setItem('java_playground_v1','official-draft-sentinel'));
      await page.fill('#javaCode','// Meu rascunho da amostra');
      await page.reload({waitUntil:'networkidle'});
      await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
      assert.equal(await page.locator('#javaCode').inputValue(),'// Meu rascunho da amostra');
      assert.equal(await page.evaluate(()=>localStorage.getItem('java_playground_v1')),'official-draft-sentinel');
      page.once('dialog',dialog=>dialog.dismiss());
      await page.locator('#resetExample').click();
      assert.equal(await page.locator('#javaCode').inputValue(),'// Meu rascunho da amostra');
      page.once('dialog',dialog=>dialog.accept());
      await page.locator('#resetExample').click();
      assert.equal(await page.locator('#javaCode').inputValue(),'');
      assert.equal(await page.locator('#javaInput').inputValue(),'');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.deepEqual(errors,[]);
      console.log('PASS samples: groups, chapter, empty editor, solution, drafts and clear at '+width+'px.');
      await context.close();
    }
    if(process.argv.includes('--runtime')) {
      const page=await browser.newPage({serviceWorkers:'block'});
      await page.goto(base+'amostra-atividade.html');
      await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
      await page.fill('#javaCode',await page.locator('#sampleSolution').textContent());
      await page.locator('#runJava').click();
      await page.waitForFunction(()=>!document.getElementById('runJava').disabled,null,{timeout:200000});
      assert.match(await page.locator('#runtimeStatus').innerText(),/^Programa encerrado\./);
      assert.equal((await page.locator('#javaOutput').textContent()).replace(/\r/g,'').trim(),'Olá, Ana!\nSoma: 15');
      console.log('PASS sample Java program compiled and executed in the actual browser runtime.');
      await page.close();
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

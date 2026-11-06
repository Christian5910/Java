const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../assets/data/exercises.json'),'utf8'));
const base=process.env.JAVA_SITE_URL||'http://127.0.0.1:4189/';
const shots=path.resolve(__dirname,'../../.work/first-eight/shots');
fs.mkdirSync(shots,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'msedge'});
  try {
    for(const width of [1440,390]) {
      const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
      const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+'playground.html?ex=ola');
      await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
      for(const exercise of data.filter(e=>e.theme<=8)) {
        await page.selectOption('#exerciseSelect',exercise.id);
        assert.equal(await page.locator('#javaCode').inputValue(),'','fresh editor '+exercise.id);
        assert.equal(await page.locator('#instructionList li').count(),exercise.instructions.length);
        assert.match(await page.locator('#solutionTitle').innerText(),/Possível solução/);
        assert.equal(await page.locator('#sampleSolutionBlock').isVisible(),false);
        await page.locator('#solutionTitle').click();
        assert.equal(await page.locator('#sampleSolution').textContent(),exercise.source);
        assert.equal(await page.locator('#javaCode').inputValue(),'','solution must not fill editor');
        assert.match(await page.locator('#topicLink').getAttribute('href'),new RegExp('tema-0'+exercise.theme+'\\.html'));
        await page.locator('#solutionTitle').click();
      }
      await page.selectOption('#exerciseSelect','ola');
      await page.locator('#activityTitle').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(shots,'activity-'+width+'.png')});
      await page.locator('#javaCode').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(shots,'editor-'+width+'.png')});
      await page.locator('#runJava').click();
      assert.match(await page.locator('#runtimeStatus').innerText(),/Escreva um programa/);
      await page.fill('#javaCode','// Meu código preservado');
      await page.fill('#javaInput','entrada pessoal');
      await page.selectOption('#exerciseSelect','construtores');
      await page.selectOption('#exerciseSelect','ola');
      assert.equal(await page.locator('#javaCode').inputValue(),'// Meu código preservado');
      assert.equal(await page.locator('#javaInput').inputValue(),'entrada pessoal');
      await page.reload();await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
      assert.equal(await page.locator('#javaCode').inputValue(),'// Meu código preservado');
      page.once('dialog',d=>d.dismiss());await page.locator('#resetExample').click();
      assert.equal(await page.locator('#javaCode').inputValue(),'// Meu código preservado');
      page.once('dialog',d=>d.accept());await page.locator('#resetExample').click();
      assert.equal(await page.locator('#javaCode').inputValue(),'');
      assert.equal(await page.locator('#javaInput').inputValue(),'');
      for(const exercise of data.filter(e=>e.theme>8)) {
        await page.selectOption('#exerciseSelect',exercise.id);
        assert.equal(await page.locator('#javaCode').inputValue(),exercise.source,'legacy editor '+exercise.id);
        assert.equal(await page.locator('#activityInstructions').isVisible(),false);
        assert.match(await page.locator('#solutionTitle').innerText(),/Ver saída/);
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.deepEqual(errors,[]);
      await context.close();
      console.log('PASS all guided/legacy activities, solution, drafts and clear at '+width+'px.');
    }
    const context=await browser.newContext({serviceWorkers:'block'});
    await context.addInitScript(()=>{
      localStorage.setItem('java_playground_v1',JSON.stringify({current:'ola',drafts:{ola:{source:'// Rascunho anterior à atualização',input:'dados antigos'}}}));
    });
    const page=await context.newPage();await page.goto(base+'playground.html');
    await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
    assert.equal(await page.locator('#javaCode').inputValue(),'// Rascunho anterior à atualização');
    assert.equal(await page.locator('#javaInput').inputValue(),'dados antigos');
    assert.match(await page.locator('#runtimeStatus').innerText(),/recuperado/);
    await context.close();
    console.log('PASS old stored drafts survive the new blank-editor default.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

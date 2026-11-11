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
      for(const exercise of data) {
        await page.selectOption('#exerciseSelect',exercise.id);
        assert.equal(await page.locator('#javaCode').inputValue(),'','fresh editor '+exercise.id);
        assert.equal(await page.locator('#javaInput').inputValue(),exercise.input,'reference input '+exercise.id);
        assert.equal(await page.locator('#activityInstructions').isVisible(),true,'steps visible '+exercise.id);
        assert.equal(await page.locator('#instructionList li').count(),exercise.instructions.length);
        assert.equal(await page.locator('#activityChecks').textContent(),exercise.checks,'checks '+exercise.id);
        assert.equal(await page.locator('#resetExample').textContent(),'Limpar meu código','reset label '+exercise.id);
        assert.match(await page.locator('#solutionTitle').innerText(),/Possível solução/);
        assert.equal(await page.locator('#sampleSolutionBlock').isVisible(),false);
        await page.locator('#solutionTitle').click();
        assert.equal(await page.locator('#sampleSolution').textContent(),exercise.source);
        assert.equal(await page.locator('#javaCode').inputValue(),'','solution must not fill editor');
        /* Capítulos 1 a 8 têm página própria; os demais abrem a janela de leitura de cont.html. */
        assert.equal(await page.locator('#topicLink').getAttribute('href'),exercise.theme<=8?'tema-0'+exercise.theme+'.html':'cont.html#modal'+exercise.theme,'review link '+exercise.id);
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
      /* Atividades dos temas 9 a 14 passaram a usar o mesmo fluxo: um rascunho idêntico à solução é preservado. */
      const later=data.filter(e=>e.theme>8);
      assert.equal(later.length,15);
      for(const exercise of later) {
        await page.selectOption('#exerciseSelect',exercise.id);
        await page.fill('#javaCode',exercise.source);
      }
      await page.reload();await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
      for(const exercise of later) {
        await page.selectOption('#exerciseSelect',exercise.id);
        assert.equal(await page.locator('#javaCode').inputValue(),exercise.source,'draft equal to the solution kept '+exercise.id);
        assert.equal(await page.locator('#sampleSolutionBlock').isVisible(),false,'solution closed '+exercise.id);
      }
      await page.selectOption('#exerciseSelect','conta');
      page.once('dialog',d=>d.dismiss());await page.locator('#resetExample').click();
      assert.equal(await page.locator('#javaCode').inputValue(),data.find(e=>e.id==='conta').source,'cancel keeps the draft');
      page.once('dialog',d=>d.accept());await page.locator('#resetExample').click();
      assert.equal(await page.locator('#javaCode').inputValue(),'','confirmed clear gives an empty editor, not the solution');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      assert.deepEqual(errors,[]);
      await context.close();
      console.log('PASS all '+data.length+' activities, solution, drafts and clear at '+width+'px.');
    }
    const context=await browser.newContext({serviceWorkers:'block'});
    await context.addInitScript(()=>{
      localStorage.setItem('java_playground_v1',JSON.stringify({current:'ola',drafts:{ola:{source:'// Rascunho anterior à atualização',input:'dados antigos'},conta:{source:'// Rascunho do tema 9 anterior à atualização',input:''}}}));
    });
    const page=await context.newPage();await page.goto(base+'playground.html');
    await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
    assert.equal(await page.locator('#javaCode').inputValue(),'// Rascunho anterior à atualização');
    assert.equal(await page.locator('#javaInput').inputValue(),'dados antigos');
    assert.match(await page.locator('#runtimeStatus').innerText(),/recuperado/);
    await page.selectOption('#exerciseSelect','conta');
    assert.equal(await page.locator('#javaCode').inputValue(),'// Rascunho do tema 9 anterior à atualização');
    assert.match(await page.locator('#runtimeStatus').innerText(),/recuperado/);
    await context.close();
    console.log('PASS old stored drafts (themes 1 to 14) survive the new blank-editor default.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

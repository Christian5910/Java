const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.JAVA_SITE_URL || 'http://127.0.0.1:4177/java/';
const screenshots = path.resolve(__dirname, '../../.work/site-shots');

(async()=>{
  const browser = await chromium.launch({channel:'msedge'});
  const contrastFailures = [];
  fs.mkdirSync(screenshots,{recursive:true});
  async function inspect(page, name) {
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), name+' overflow');
    const failures = await page.evaluate(()=>{
      const color=s=>{const m=s.match(/[\d.]+/g);return m ? m.map(Number) : [0,0,0,0]};
      const blend=(top,bottom)=>top.slice(0,3).map((v,i)=>v*(top[3]??1)+bottom[i]*(1-(top[3]??1)));
      const lum=rgb=>rgb.slice(0,3).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
      const failures=[];
      for(const el of document.querySelectorAll('h1,h2,h3,p,a,button,label,summary,caption,th,td,code,.option-prefix,input,textarea,select')) {
        if(!el.getClientRects().length || el.closest('[hidden]') || (el.matches(':disabled')&&!el.matches('.option-card')))continue;
        if(!el.textContent.trim() && !el.value && !el.getAttribute('placeholder'))continue;
        const cs=getComputedStyle(el);if(cs.visibility!=='visible')continue;
        const chain=[];for(let p=el;p;p=p.parentElement)chain.unshift(p);
        let bg=[255,255,255];for(const p of chain)bg=blend(color(getComputedStyle(p).backgroundColor),bg);
        const fg=blend(color(cs.color),bg),l1=lum(fg),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
        const large=parseFloat(cs.fontSize)>=24 || (parseFloat(cs.fontSize)>=18.66&&Number(cs.fontWeight)>=700);
        if(ratio<(large?3:4.5)-.02)failures.push({text:el.textContent.trim().slice(0,65),tag:el.tagName,ratio:Number(ratio.toFixed(2)),fg:cs.color,bg});
      }
      return failures;
    });
    contrastFailures.push(...failures.map(f=>({view:name,...f})));
    await page.screenshot({path:path.join(screenshots,name+'.png')});
  }
  try {
    for(const [device,width,height] of [['desktop',1365,900],['mobile',390,844]]) {
      const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
      const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
      await page.goto(base+'index.html');await inspect(page,device+'-home');
      await page.goto(base+'cont.html');
      const extra=page.locator('#extra');
      assert.equal(await extra.evaluate(el=>el.previousElementSibling.tagName),'HR');
      assert.equal(await page.locator('[data-topic]').count(),30);
      await inspect(page,device+'-content');
      for(const number of [17,20,25,30]) {
        await page.goto(base+'cont.html#modal'+number);await page.locator('#modal'+number+'.show').waitFor();
        await inspect(page,device+'-theme-'+number);
      }
      await page.goto(base+'cont.html#modal6');await page.locator('#modal6.show').waitFor();
      assert.ok(!(await page.locator('#modal6').innerText()).includes('pesquisa'));
      await page.locator('#research-collections').scrollIntoViewIfNeeded();
      await inspect(page,device+'-reading');
      await page.goto(base+'extra.html');await inspect(page,device+'-extra');
      assert.equal(await page.locator('.topic-item').count(),20);
      await page.goto(base+'extra.html#extraCapstone');await page.locator('#extraCapstone.show').waitFor();
      await inspect(page,device+'-extra-final');await page.locator('#extraCapstone .btn-close').click();
      await page.fill('#topicSearch','certificações');assert.ok(await page.locator('.topic-item:visible').count()>0);
      await page.goto(base+'extra.html#extraPesquisa');await page.locator('#extraPesquisa.show').waitFor();
      for(const name of ['programas-java.zip','pesquisa-conhecendo-java.zip','roteiro-de-testes.html','fontes-da-pesquisa.txt']) {
        const waiting=page.waitForEvent('download');await page.locator('#extraPesquisa a[download][href$="'+name+'"]').click();
        const download=await waiting;assert.equal(download.suggestedFilename(),name);assert.ok(fs.statSync(await download.path()).size>1000);
      }
      await inspect(page,device+'-downloads');
      await page.goto(base+'faq.html');assert.equal(await page.locator('.accordion-item').count(),80);
      await page.fill('#faqSearch','Map');await page.locator('.accordion-item:visible .accordion-button').first().click();
      await page.locator('.accordion-collapse.show').waitFor();await inspect(page,device+'-faq');
      await page.goto(base+'playground.html?ex=colecoes-cadastro');await page.waitForFunction(()=>!document.getElementById('runJava').disabled);
      await page.selectOption('#exerciseTheme','6');
      const values=await page.locator('#exerciseSelect option').evaluateAll(els=>els.map(el=>el.value));
      const original=await page.inputValue('#javaCode');await page.fill('#javaCode',original+'\n// Persistir ao navegar');
      assert.equal(await page.locator('#nextActivity').isDisabled(),true);
      await page.click('#previousActivity');assert.equal(await page.inputValue('#exerciseSelect'),values.at(-2));
      await page.click('#nextActivity');assert.match(await page.inputValue('#javaCode'),/Persistir ao navegar/);
      await page.selectOption('#exerciseSelect',values[0]);assert.equal(await page.locator('#previousActivity').isDisabled(),true);
      await page.click('#nextActivity');assert.equal(await page.inputValue('#exerciseSelect'),values[1]);
      await page.selectOption('#exerciseTheme','');
      const all=await page.locator('#exerciseSelect option').evaluateAll(els=>els.map(el=>el.value));
      await page.selectOption('#exerciseSelect',all[0]);await page.click('#nextActivity');assert.equal(await page.inputValue('#exerciseSelect'),all[1]);
      await inspect(page,device+'-playground');
      await context.setOffline(true);await page.locator('#offlineModal.show').waitFor();await inspect(page,device+'-offline');
      await context.setOffline(false);await page.locator('#offlineModal').waitFor({state:'hidden'});
      await page.goto(base+'quiz.html');await page.waitForSelector('.option-card');await inspect(page,device+'-quiz');
      await page.locator('.option-card').first().click();await inspect(page,device+'-quiz-answer');
      assert.deepEqual(errors,[]);
      await context.close();
    }
    console.log(JSON.stringify(contrastFailures,null,2));
    assert.equal(contrastFailures.length,0,'visible text must meet contrast targets');
    console.log('PASS public site desktop/mobile: contrast, layout, extras, downloads, FAQ and activity navigation.');
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

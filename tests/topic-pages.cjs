const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.JAVA_SITE_URL || 'http://127.0.0.1:4188/organizar/';
const shots = path.resolve(__dirname,'../../.work/topic-shots');
fs.mkdirSync(shots,{recursive:true});
(async()=>{
  const browser = await chromium.launch({channel:'msedge'});
  try {
    for (const width of [1440,390]) {
      const page = await browser.newPage({viewport:{width,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base+'cont.html',{waitUntil:'networkidle'});
      await page.waitForFunction(()=>!document.getElementById('printBook').disabled);
      assert.equal(await page.locator('.print-toc li').count(),30);
      assert.equal(await page.locator('.print-chapter .lesson-article').count(),30);
      assert.equal(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return new Set(ids).size===ids.length;}),true);
      assert.equal(await page.locator('main .modal[id^="cat"]').count(),0);
      assert.equal(await page.locator('[data-topic-group]').count(),15);
      await page.screenshot({path:path.resolve(shots,`../first-eight/shots/index-${width}.png`)});
      await page.fill('#topicSearch','distribuir um JAR');
      assert.equal(await page.locator('.topic-item:visible').count(),1);
      assert.equal(await page.locator('.topic-item:visible').getAttribute('data-topic'),'1');
      await page.locator('[data-topic="1"] a').click();
      await page.waitForURL('**/tema-01.html');
      for(const n of Array.from({length:30},(_,i)=>i+1)) {
        await page.goto(base+`tema-${String(n).padStart(2,'0')}.html`,{waitUntil:'networkidle'});
        assert.equal(await page.locator('h1').count(),1);
        assert.equal(await page.locator('.modal').count(),0);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        for(const href of await page.locator('.lesson-toc a').evaluateAll(links=>links.map(a=>a.hash.slice(1)))) {
          assert.equal(await page.locator(`[id="${href}"]`).count(),1,'missing section '+href);
        }
        await page.screenshot({path:path.join(shots,`tema-${n}-${width}.png`)});
        await page.getByRole('link',{name:'Ir aos exercícios',exact:true}).click();
        await page.screenshot({path:path.join(shots,`exercicios-${n}-${width}.png`)});
        const details=page.locator('.lesson-article details');
        const solutions=await details.count();
        if(n<=8) assert.ok(solutions>1,'resoluções do tema '+n);
        if(solutions){
          await details.first().locator('summary').click();
          assert.equal(await details.first().getAttribute('open'),'');
        }
        await page.evaluate(()=>{window.print=()=>{dispatchEvent(new Event('beforeprint'));window.allSolutionsOpen=[...document.querySelectorAll('main details')].every(d=>d.open);dispatchEvent(new Event('afterprint'));};});
        await page.locator('#printBook').click();
        assert.equal(await page.evaluate(()=>window.allSolutionsOpen),true);
        await page.emulateMedia({media:'print'});
        assert.equal(await page.locator('.lesson-article:visible').count(),1);
        assert.equal(await page.locator('.lesson-toc:visible').count(),0);
        await page.emulateMedia({media:'screen'});
      }
      await page.goto(base+'cont.html#modal2');
      await page.waitForURL('**/tema-02.html');
      await page.goto(base+'cont.html#modal8');
      await page.waitForURL('**/tema-08.html');
      await page.getByRole('link',{name:'Próximo · Tema 9',exact:true}).click();
      await page.waitForURL('**/tema-09.html');
      assert.match(await page.locator('h1').innerText(),/Encapsulamento/);
      await page.getByRole('link',{name:'Anterior · Tema 8',exact:true}).click();
      await page.waitForURL('**/tema-08.html');
      await page.goto(base+'cont.html#modal30');
      await page.waitForURL('**/tema-30.html');
      assert.equal(await page.getByRole('link',{name:/Próximo · Tema/}).count(),0);
      assert.deepEqual(errors,[]);
      await page.close();
      console.log('PASS: navigation, search, anchors, printing and responsive layout at '+width+'px.');
    }
    const offline=await browser.newContext();
    const page=await offline.newPage();
    await page.goto(base+'tema-01.html');
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(async()=>{const cacheNames=await caches.keys();for(const name of cacheNames){const cache=await caches.open(name);const files=Array.from({length:30},(_,i)=>`tema-${String(i+1).padStart(2,'0')}.html`).concat('assets/css/lessons.css');if((await Promise.all(files.map(file=>cache.match(new URL(file,location.href).href)))).every(Boolean))return true;}return false;},null,{timeout:60000});
    await offline.setOffline(true);
    for(const n of Array.from({length:30},(_,i)=>i+1)) {
      await page.goto(base+`tema-${String(n).padStart(2,'0')}.html`);
      assert.equal(await page.locator('.lesson-article').count(),1);
    }
    await page.goto(base+'cont.html');
    await page.waitForFunction(()=>!document.getElementById('printBook').disabled);
    assert.equal(await page.locator('.print-chapter .lesson-article').count(),30);
    console.log('PASS: thirty chapters and complete index search/print sources work offline.');
    await offline.close();
    const local=await browser.newPage({serviceWorkers:'block',javaScriptEnabled:false});
    for(const n of Array.from({length:30},(_,i)=>i+1)) {
      await local.goto(require('node:url').pathToFileURL(path.resolve(__dirname,`../tema-${String(n).padStart(2,'0')}.html`)).href);
      assert.equal(await local.locator('.lesson-article').count(),1);
      assert.ok(await local.locator('.lesson-article h2').count()>=(n<=8?20:7));
    }
    await local.close();
    console.log('PASS: direct local chapter reading works without JavaScript.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1);});

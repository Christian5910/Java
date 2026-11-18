const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.JAVA_SITE_URL||'http://127.0.0.1:4177/java/';
(async()=>{
  const browser=await chromium.launch({channel:'msedge'});
  try {
    const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(base+'tema-14.html');
    await page.getByRole('link',{name:'Próximo · Tema 15',exact:true}).click();
    await page.waitForURL('**/tema-15.html');
    assert.match(await page.locator('h1').innerText(),/Módulos/);
    await page.getByRole('link',{name:'Anterior · Tema 14',exact:true}).click();
    await page.waitForURL('**/tema-14.html');
    await page.goto(base+'cont.html');
    await page.locator('[data-topic="30"] a').click();
    await page.waitForURL('**/tema-30.html');
    assert.equal(await page.getByRole('link',{name:/Próximo · Tema/}).count(),0);
    await page.goto(base+'cont.html');
    await page.fill('#topicSearch','JavaFX');
    assert.ok(await page.locator('[data-topic="17"]').isVisible());
    await page.fill('#topicSearch','zzzinexistentezzz');
    assert.equal(await page.locator('.topic-item:visible').count(),0);
    assert.match(await page.locator('#searchCount').innerText(),/Nenhum/);
    for(const n of [19,20,21,22,23,24,25,26,27,28,29,30]){
      await page.goto(base+'tema-'+String(n).padStart(2,'0')+'.html');
      assert.match(await page.locator('.lesson-article').innerText(),/Prática:/);
    }
    await page.goto(base+'extra.html#extraCapstone');await page.locator('#extraCapstone.show').waitFor();
    await page.locator('#extraCapstone .btn-close').click();
    await page.fill('#topicSearch','Android');assert.ok(await page.locator('[data-target="extraAndroid"]').isVisible());
    await page.fill('#topicSearch','');
    for(const [id,file] of [['extraDesktop','laboratorio-swing.zip'],['extraDesktop','laboratorio-javafx.zip'],['extraAndroid','laboratorio-android.zip'],['extraSpring','laboratorio-spring.zip']]){
      await page.goto(base+'extra.html#'+id);await page.locator('#'+id+'.show').waitFor();
      const waiting=page.waitForEvent('download');
      await page.locator('#'+id+' a[download][href$="'+file+'"]').first().click();
      assert.equal((await waiting).suggestedFilename(),file);
    }
    await page.goto(base+'assets/extras/roteiro-avancado.html');
    assert.equal(await page.locator('main section').count(),16);
    assert.ok(await page.locator('a[data-print-href]').count()>20);
    assert.deepEqual(errors,[]);
    console.log('PASS topics 15–30, pair groups, previous/next, search, 20 extras and four platform downloads.');
  } finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

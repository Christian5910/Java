const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.JAVA_SITE_URL || 'http://127.0.0.1:4177/java/';
const work=path.resolve(__dirname,'../../.work/print-qa');
(async()=>{
  fs.mkdirSync(work,{recursive:true});
  const browser=await chromium.launch({channel:'msedge'});
  try {
    for(const [file,count,hash] of [['cont',30,'#modal30'],['extra',20,'#extraCapstone']]) {
      const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
      await page.goto(base+file+'.html'+hash,{waitUntil:'networkidle'});
      assert.equal(await page.locator('.print-toc li').count(),count);
      const closed=await page.locator('main details:not([open])').count();
      assert.ok(closed>0);
      // Intercept only the dialog opening; exercise the actual print button and lifecycle.
      await page.evaluate(()=>{
        window.print=()=>{
          window.dispatchEvent(new Event('beforeprint'));
          window.printButtonState=[...document.querySelectorAll('main details')].every(el=>el.open);
          window.dispatchEvent(new Event('afterprint'));
        };
      });
      await page.locator('.modal.show .btn-close').click();
      await page.click('#printBook');
      assert.equal(await page.evaluate(()=>window.printButtonState),true);
      assert.equal(await page.locator('main details:not([open])').count(),closed);
      await page.goto(base+file+'.html'+hash,{waitUntil:'networkidle'});
      await page.waitForFunction(() => !document.getElementById('printBook').disabled);
      const expected=await page.locator('main .modal:not([id^="cat"]) a[href], main .print-chapter a[href], #materiais a[href]').evaluateAll(els=>[...new Set(els.map(el=>el.href))]);
      await page.pdf({path:path.join(work,file+'.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});
      fs.writeFileSync(path.join(work,file+'-links.json'),JSON.stringify(expected,null,2));
      assert.equal(await page.locator('main details:not([open])').count(),closed,'detail state must be restored');
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('main .modal:not([id^="cat"]):visible, main .print-chapter:visible').count(),count);
      assert.equal(await page.locator('.print-cover:visible').count(),1);
      assert.equal(await page.locator('.modal[id^="cat"]:visible').count(),0);
      assert.ok(await page.locator('main a[data-print-href]').count()>10);
      await page.close();
      console.log('PASS print lifecycle, complete reading and link annotations:',file);
    }
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

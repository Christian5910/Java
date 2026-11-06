const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const decode = value => value.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"})[entity]);
const normalize = value => value.replace(/\r/g,'').trim();
const work = path.resolve(root,'../.work/sample-checks');
fs.mkdirSync(work,{recursive:true});
const chapter = read('amostra-tema-03.html');
for(const [,code] of chapter.matchAll(/<code(?:\s[^>]*)?>([\s\S]*?)<\/code>/g)) {
  assert.ok(!/'[\r\n]+'/.test(decode(code)), 'Java char literal must not contain a raw line break');
}
let count=0;
const directories=new Map();
for(const [,id,source] of chapter.matchAll(/<code id="([^"]+)" data-java-program>([\s\S]*?)<\/code>/g)) {
  const directory=fs.mkdtempSync(path.join(work,id+'-'));
  directories.set(id,directory);
  fs.writeFileSync(path.join(directory,'Main.java'),decode(source));
  execFileSync('javac',['--release','17','-encoding','UTF-8','-d',directory,path.join(directory,'Main.java')],{timeout:20000});
  const expected=decode(chapter.match(new RegExp('<samp data-output-for="'+id+'">([\\s\\S]*?)</samp>'))[1]);
  assert.equal(run(id,id==='amostra-nome'?'  Ana Silva  \n':''),normalize(expected),id);
  count++;
}
function run(id,input='') {
  return normalize(execFileSync('java',['-Dfile.encoding=UTF-8','-Dstdout.encoding=UTF-8','-cp',directories.get(id),'Main'],{input,encoding:'utf8',timeout:10000}));
}
for(const [input,expected] of [['','Nome ausente.'],['\n','Informe um nome com conteúdo.'],['   \n','Informe um nome com conteúdo.'],['José\n','Nome: José\nPontos de código: 4']]) {
  assert.equal(run('amostra-nome',input),expected,input);
}
const [activity]=JSON.parse(read('assets/data/amostra-atividade.json'));
const directory=fs.mkdtempSync(path.join(work,'solution-'));
directories.set('solution',directory);
fs.writeFileSync(path.join(directory,'Main.java'),activity.source);
execFileSync('javac',['--release','17','-encoding','UTF-8','-d',directory,path.join(directory,'Main.java')],{timeout:20000});
assert.equal(run('solution'),activity.expected);
assert.ok(read('assets/js/amostra-atividade.js').includes("draft.source : ''"));
assert.ok(read('assets/js/playground.js').includes("draft.source : guided ? '' : current.source"));
assert.ok(read('cont.html').includes('data-topic-group'),'approved grouping applied');
assert.equal(JSON.parse(read('assets/data/exercises.json')).length,53);
console.log(`PASS: ${count} chapter programs, input boundaries, sample solution and isolated official flow.`);

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const work = path.resolve(root, '../.work/topic-programs');
fs.mkdirSync(work, {recursive:true});
const decode = text => text.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"})[entity]);
const normalize = text => text.replace(/\r/g,'').trim();
const cases = {
  't2-media': ['Ana Silva\n6 7 8\n', 'Ana Silva | média: 7.00 | Aprovado'],
  't2-conversor': ['100 5\n', 'USD 20.00'],
  'amostra-nome': ['  Ana Silva  \n', 'Nome: Ana Silva\nPontos de código: 9']
};
let count = 0;
const directories = new Map();
for (const file of Array.from({length:8},(_,i)=>`tema-0${i+1}.html`)) {
  const html = fs.readFileSync(path.join(root,file),'utf8');
  for(const [,code] of html.matchAll(/<code(?:\s[^>]*)?>([\s\S]*?)<\/code>/g)) {
    assert.ok(!/'[\r\n]+'/.test(decode(code)),file+': broken Java char literal');
  }
  for (const [,id,source] of html.matchAll(/<code id="([^"]+)" data-java-program>([\s\S]*?)<\/code>/g)) {
    const directory = fs.mkdtempSync(path.join(work,id+'-'));
    directories.set(id,directory);
    fs.writeFileSync(path.join(directory,'Main.java'),decode(source));
    execFileSync('javac',['--release','17','-encoding','UTF-8','-d',directory,path.join(directory,'Main.java')],{timeout:20000});
    const expected = html.match(new RegExp('<samp data-output-for="'+id+'">([\\s\\S]*?)</samp>'));
    assert.ok(expected,'missing output '+id);
    const input = html.match(new RegExp('<samp data-input-for="'+id+'">([\\s\\S]*?)</samp>'));
    const output = run(id,input ? decode(input[1]) : cases[id]?.[0] || '');
    assert.equal(output,normalize(decode(expected[1])),id);
    count++;
  }
}
function run(id,input='',args=[]) {
  return normalize(execFileSync('java',['-Dfile.encoding=UTF-8','-Dstdout.encoding=UTF-8','-cp',directories.get(id),'Main',...args],{input,encoding:'utf8',timeout:10000}));
}
assert.match(run('t1-saida','',['Ana Silva']),/Argumentos: 1\nPrimeiro: Ana Silva$/);
assert.equal(run('t1-argumentos','',['Ana']),'Olá, Ana!');
for (const [input,output] of [
  ['', 'Nome ausente.'], ['\n', 'Nome vazio.'],
  ['Ana\n0 0 0','Ana | média: 0.00 | Revisar conteúdo'],
  ['Ana\n10 10 10','Ana | média: 10.00 | Aprovado'],
  ['Ana\n-1 7 8','Nota 1 fora do intervalo de 0 a 10.'],
  ['Ana\n11 7 8','Nota 1 fora do intervalo de 0 a 10.'],
  ['Ana\n6 texto 8','Nota 2 ausente ou inválida.'],
  ['Ana\n6 7','Nota 3 ausente ou inválida.'],
  ['Ana\nNaN 7 8','Nota 1 fora do intervalo de 0 a 10.'],
  ['Ana\nInfinity 7 8','Nota 1 fora do intervalo de 0 a 10.'],
  ['Ana\n6.999 6.999 6.999','Ana | média: 7.00 | Revisar conteúdo']
]) assert.equal(run('t2-media',input),output,input);
for (const [input,output] of [
  ['0 5','USD 0.00'], ['', 'Valor em reais ausente ou inválido.'],
  ['100', 'Cotação ausente ou inválida.'],
  ['100 0','Use reais não negativos e cotação positiva, ambos finitos.'],
  ['-10 5','Use reais não negativos e cotação positiva, ambos finitos.'],
  ['NaN 5','Use reais não negativos e cotação positiva, ambos finitos.'],
  ['1e308 1e-308','Resultado fora do intervalo representável.']
]) assert.equal(run('t2-conversor',input),output,input);
for(const [input,output] of [
  ['','Primeiro número ausente ou inválido'],['10','Segundo número ausente ou inválido'],
  ['10 4','Operação ausente'],['10 0 /','Divisão por zero'],
  ['10 4 ?','Operação desconhecida'],['NaN 4 +','Números devem ser finitos'],
  ['1e308 1e308 *','Resultado não finito'],['10 4 +','Resultado: 14.0']
]) assert.equal(run('t4-calculadora',input),output,input);
for(const [input,output] of [
  ['','Sem valores positivos'],['0','Sem valores positivos'],
  ['-1 -2 0','Sem valores positivos'],['5','Quantidade: 1\nSoma: 5\nMédia: 5.00'],
  ['texto 0','Token inválido: texto\nSem valores positivos']
]) assert.equal(run('t5-media',input),output,input);
const html = fs.readFileSync(path.join(root,'tema-01.html'),'utf8');
const directory = fs.mkdtempSync(path.join(work,'packages-'));
fs.mkdirSync(path.join(directory,'src/estudo'),{recursive:true});
for (const [id,file] of [['t1-pacote-main','Main.java'],['t1-pacote-mensagens','Mensagens.java']]) {
  const code=html.match(new RegExp('<code id="'+id+'">([\\s\\S]*?)</code>'));
  fs.writeFileSync(path.join(directory,'src/estudo',file),decode(code[1]));
}
execFileSync('javac',['--release','17','-encoding','UTF-8','-d','out','src/estudo/Main.java','src/estudo/Mensagens.java'],{cwd:directory,timeout:20000});
execFileSync('jar',['--create','--file','estudo.jar','--main-class','estudo.Main','-C','out','.'],{cwd:directory,timeout:20000});
assert.equal(normalize(execFileSync('java',['-Dstdout.encoding=UTF-8','-jar',path.join(directory,'estudo.jar')],{cwd:work,encoding:'utf8',timeout:10000})),'Olá, Ana!');
console.log(`PASS: ${count} complete Java programs, input boundaries, command-line arguments, packages and executable JAR.`);

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const examples = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/data/exercises.json'), 'utf8'));
const work = path.resolve(__dirname, '../../.work/java-tests');
fs.mkdirSync(work, { recursive: true });
const normalize = text => text.replace(/\r/g,'').trim();
const cases = {
  'leitura-validada': [
    ['', 'Nenhuma nota válida'],
    ['-1\ntexto\n', 'Fora da faixa: -1\nToken inválido: texto\nNenhuma nota válida'],
    ['0\n', 'Nota aceita: 0'], ['10\n', 'Nota aceita: 10']
  ],
  'normalizar-texto': [['  \n','Comando vazio'], [' CONTINUAR \n','Comando: continuar\nEncerrar: false']],
  'contar-vogais': [['AEIOU\n','Vogais sem acento: 5'], ['rhythm\n','Vogais sem acento: 0'], ['é\n','Vogais sem acento: 0']],
  'aprovacao-presenca': [['9\n74\n','Critérios não atendidos'],['NaN\n80\n','Dados inválidos'],['7\n101\n','Dados inválidos']],
  'estacoes': [['0\n','Estação desconhecida'],['x\n','Informe uma opção inteira']],
  'acumuladores': [['0\n','Quantidade: 0\nSoma: 0\nSem valores positivos'],['5\n0\n','Quantidade: 1\nSoma: 5\nMédia: 5.00']],
  'primo': [['0\n','0 não é primo'],['1\n','1 não é primo'],['2\n','2 é primo'],['49\n','49 não é primo']]
};
let count = 0;
for (const exercise of examples) {
  const directory = fs.mkdtempSync(path.join(work,'case-'));
  const filename = path.join(directory,'Main.java');
  fs.writeFileSync(filename, exercise.source, 'utf8');
  execFileSync('javac', ['--release','17','-encoding','UTF-8',filename], { timeout:20000,stdio:'pipe' });
  for (const [input,expected] of [[exercise.input,exercise.expected],...(cases[exercise.id] || [])]) {
    const actual = execFileSync('java',['-Dfile.encoding=UTF-8','-Dstdout.encoding=UTF-8','-Dstderr.encoding=UTF-8','-Dsun.stdout.encoding=UTF-8','-Dsun.stderr.encoding=UTF-8','-cp',directory,'Main'],{input,encoding:'utf8',timeout:10000});
    assert.equal(normalize(actual),normalize(expected),exercise.id+' input '+JSON.stringify(input));
    count++;
  }
}
console.log('PASS: '+examples.length+' programs and '+count+' executions, including invalid and boundary inputs.');

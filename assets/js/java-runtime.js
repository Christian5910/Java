'use strict';
// A separate document lets the Playground discard the JVM when execution is stopped.
const send = (type, data = {}) => parent.postMessage({ channel: 'java-study', type, ...data }, location.origin);
let ready;
let running = false;
let sequence = 0;
const consoleElement = document.getElementById('console');
new MutationObserver(() => {
  const output = consoleElement.textContent;
  send('output', { output: output.slice(0, 50000) });
  if (output.length > 50000) send('overflow');
}).observe(consoleElement, { childList: true, subtree: true, characterData: true });

async function initialize() {
  send('status', { message: 'Carregando a JVM. Na primeira vez, o download pode demorar.' });
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cjrtnc.leaningtech.com/4.3/loader.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Não foi possível carregar a JVM. Confira a conexão e tente novamente.'));
    document.head.append(script);
  });
  await cheerpjInit({ version: 17, status: 'none', javaProperties: ['user.language=en', 'user.country=US', 'file.encoding=UTF-8'] });
  send('status', { message: 'Preparando o compilador. Os recursos baixados podem ser reutilizados pelo navegador.' });
  for (const [name, url] of [['ecj.jar', 'assets/vendor/ecj-3.33.0.jar'], ['StudyCompiler.class', 'assets/java/StudyCompiler.class'], ['StudyRunner.class', 'assets/java/StudyRunner.class']]) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Arquivo do compilador indisponível. Recarregue o site e tente novamente.');
    cheerpOSAddStringFile('/str/' + name, new Uint8Array(await response.arrayBuffer()));
  }
  const lib = await cheerpjRunLibrary('/str/:/str/ecj.jar');
  const Compiler = await lib.StudyCompiler;
  return { lib, Compiler };
}

window.addEventListener('message', async event => {
  const data = event.data;
  if (event.source !== parent || event.origin !== location.origin || data?.channel !== 'java-study' || data.type !== 'run' || running) return;
  if (typeof data.source !== 'string' || data.source.length > 120000 || typeof data.input !== 'string' || data.input.length > 20000) {
    send('error', { message: 'Código ou entrada excede o limite do editor.' });
    return;
  }
  running = true;
  consoleElement.textContent = '';
  try {
    ready ??= initialize();
    const { lib, Compiler } = await ready;
    cheerpOSAddStringFile('/str/Main.java', new TextEncoder().encode(data.source));
    cheerpOSAddStringFile('/str/input.txt', new TextEncoder().encode(data.input));
    const directory = '/files/java-study-' + Date.now() + '-' + (++sequence) + '/';
    const File = await lib.java.io.File;
    const outputDirectory = await new File(directory);
    await outputDirectory.mkdirs();
    send('phase', { phase: 'compile', message: 'Compilando Main.java…' });
    // shortcut: Java 8 API signatures cover the course; use a local JDK for later APIs and records.
    const compiled = await Compiler.compileSource(directory);
    consoleElement.textContent = await Compiler.getDiagnostics();
    let result;
    if (!compiled) {
      result = { phase: 'compile', exit: 1, output: consoleElement.textContent.slice(0, 50000) };
    } else {
      const compileOutput = consoleElement.textContent;
      consoleElement.textContent = '';
      send('phase', { phase: 'run', message: 'Executando o programa…', compileOutput });
      const exit = await cheerpjRunMain('StudyRunner', directory + ':/str/');
      result = { phase: 'run', exit, compileOutput, output: consoleElement.textContent.slice(0, 50000) };
    }
    const files = await outputDirectory.listFiles();
    if (files) for (let i = 0; i < files.length; i++) await files[i].delete();
    await outputDirectory.delete();
    running = false;
    send('done', result);
  } catch (error) {
    running = false;
    send('error', { message: 'O ambiente encontrou uma falha. Interrompa e tente novamente. ' + String(error?.message || error) });
  } finally {
    running = false;
  }
});
send('loaded');

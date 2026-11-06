'use strict';
const byId = id => document.getElementById(id);
const editor = byId('javaCode');
const input = byId('javaInput');
const output = byId('javaOutput');
const status = byId('runtimeStatus');
const storageKey = 'java_playground_v1';
let exercises = [];
let current;
let drafts = {};
let frame;
let frameReady;
let timeout;
let busy = false;
let lastRun = null;
const offlineModal = bootstrap.Modal.getOrCreateInstance(byId('offlineModal'));

function updateConnection() {
  if (navigator.onLine) {
    offlineModal.hide();
    if (status.textContent.startsWith('Sem conexão:')) status.textContent = 'Conexão restabelecida. Execute novamente para compilar e testar seu código.';
    return;
  }
  persist();
  const message = 'Sem conexão: compilar e executar está indisponível. Seu rascunho continua salvo; reconecte e execute novamente.';
  if (busy) stop(message);
  else status.textContent = message;
  offlineModal.show();
}
window.addEventListener('offline', updateConnection);
window.addEventListener('online', updateConnection);

function persist() {
  if (!current) return;
  drafts[current.id] = { source: editor.value, input: input.value };
  try { localStorage.setItem(storageKey, JSON.stringify({ current: current.id, drafts })); }
  catch { byId('saveStatus').textContent = 'O navegador não permitiu salvar. Baixe o código para guardá-lo.'; return; }
  byId('saveStatus').textContent = 'Rascunho salvo neste navegador.';
}

function setBusy(value) {
  busy = value;
  byId('runJava').disabled = value;
  byId('stopJava').disabled = !value;
  byId('exerciseSelect').disabled = value;
  byId('exerciseTheme').disabled = value;
  byId('resetExample').disabled = value;
  editor.readOnly = value;
  input.readOnly = value;
  byId('executionPanel').setAttribute('aria-busy', String(value));
  updateActivityNavigation();
}

function stop(message = 'Execução interrompida. Seu código foi preservado; você pode executar novamente.') {
  clearTimeout(timeout);
  frame?.remove();
  frame = null;
  frameReady = null;
  lastRun = null;
  status.textContent = message;
  byId('outputState').textContent = 'Execução não concluída. A saída abaixo pode estar incompleta.';
  setBusy(false);
}

function createRuntime() {
  frame = document.createElement('iframe');
  frame.hidden = true;
  frame.title = 'Máquina virtual do Playground';
  frame.referrerPolicy = 'no-referrer';
  frameReady = new Promise(resolve => { frame._resolveReady = resolve; });
  frame.src = 'runtime.html';
  document.body.append(frame);
  return frameReady;
}

window.addEventListener('message', event => {
  const data = event.data;
  if (event.origin !== location.origin || event.source !== frame?.contentWindow || data?.channel !== 'java-study') return;
  if (data.type === 'loaded') frame._resolveReady?.();
  if (!busy) return;
  if (data.type === 'output' && typeof data.output === 'string') output.textContent = data.output || 'O programa ainda não escreveu uma saída.';
  if (data.type === 'status' || data.type === 'phase') status.textContent = data.message;
  if (data.type === 'phase') {
    clearTimeout(timeout);
    timeout = setTimeout(() => stop('O limite de 60 segundos desta etapa foi atingido. Confira laços, entradas e a conexão; execute novamente se necessário.'), 60000);
    if (data.phase === 'run') {
      byId('compileOutput').textContent = data.compileOutput || 'Compilação concluída sem mensagens.';
      output.textContent = 'Executando…';
    }
  }
  if (data.type === 'overflow') stop('Saída limitada a 50 mil caracteres. A execução foi interrompida; reduza as impressões ou revise o laço.');
  if (data.type === 'error') stop(data.message);
  if (data.type === 'done') {
    clearTimeout(timeout);
    output.textContent = data.output || (data.phase === 'run' ? 'Programa encerrado sem escrever na saída.' : 'O compilador não informou detalhes. Confira Main.java e tente novamente.');
    byId('compileOutput').textContent = data.phase === 'compile' ? data.output : (data.compileOutput || 'Compilação concluída sem mensagens.');
    status.textContent = data.phase === 'compile' ? 'Falha de compilação. Corrija as mensagens abaixo e execute novamente.' : data.exit === 0 ? 'Programa encerrado. Confira a saída e teste outros valores.' : 'O programa terminou com falha. Consulte a saída e a linha indicada.';
    byId('outputState').textContent = data.phase === 'compile' ? 'O programa atual não executou. Consulte as mensagens de compilação.' : 'Resultado da última execução deste código e desta entrada.';
    byId('compilerDetails').open = data.phase === 'compile';
    lastRun = { source: editor.value, input: input.value, output: data.output, compileOutput: data.compileOutput || (data.phase === 'compile' ? data.output : ''), phase: data.phase, exit: data.exit };
    setBusy(false);
  }
});

async function run() {
  if (busy || !current) return;
  if (!editor.value.trim()) { status.textContent = 'Escreva um programa em Main.java antes de executar.'; editor.focus(); return; }
  if (location.protocol === 'file:') { status.textContent = 'Abra o site por HTTP ou HTTPS para executar Java. As instruções estão no FAQ.'; return; }
  if (!navigator.onLine) { updateConnection(); return; }
  persist();
  lastRun = null;
  setBusy(true);
  output.textContent = 'Preparando execução…';
  byId('outputState').textContent = 'Aguarde a conclusão ou use Interromper para encerrar.';
  byId('compileOutput').textContent = 'Aguardando compilação.';
  status.textContent = 'Preparando o ambiente Java…';
  timeout = setTimeout(() => stop('O ambiente não carregou em 120 segundos. Confira a conexão e tente novamente. Você também pode baixar Main.java e usar sua IDE.'), 120000);
  try {
    await (frame ? frameReady : createRuntime());
    if (busy && frame) frame.contentWindow.postMessage({ channel: 'java-study', type: 'run', source: editor.value, input: input.value }, location.origin);
  } catch { stop('Não foi possível iniciar o ambiente. Recarregue o site e tente novamente.'); }
}

function selectExercise(id, savePrevious = true) {
  if (savePrevious) persist();
  current = exercises.find(exercise => exercise.id === id) || exercises[0];
  byId('exerciseSelect').value = current.id;
  byId('activityTitle').textContent = current.title;
  byId('activityTopic').textContent = 'Tema ' + current.theme;
  byId('activityGoal').textContent = current.goal;
  byId('activityChallenge').textContent = current.challenge;
  byId('activityHint').textContent = current.hint;
  const guided = current.theme <= 8;
  byId('activityInstructions').hidden = !guided;
  byId('instructionList').replaceChildren();
  for (const instruction of current.instructions || []) {
    const item = document.createElement('li');
    item.textContent = instruction;
    byId('instructionList').append(item);
  }
  byId('activityChecks').textContent = current.checks || '';
  byId('activityInputExample').textContent = current.input;
  byId('activityInputBlock').hidden = !guided || !current.input;
  byId('solutionTitle').textContent = guided ? 'Possível solução para o problema' : 'Ver saída do código inicial';
  byId('sampleSolutionBlock').hidden = !guided;
  byId('sampleSolution').textContent = guided ? current.source : '';
  byId('sampleDescription').textContent = guided
    ? 'Tente escrever sua solução antes de consultar. Este código é uma possibilidade; abrir esta seção não preenche nem substitui seu editor.'
    : 'Esta referência corresponde ao exemplo inicial. Mudar o código ou a entrada pode mudar a saída; coincidir com ela não verifica todas as regras de uma solução.';
  byId('resetExample').textContent = guided ? 'Limpar meu código' : 'Restaurar exemplo';
  byId('editorHelpText').textContent = guided
    ? 'Escreva o programa completo, incluindo public class Main e o método main. Na primeira visita, o editor começa sem código.'
    : 'Mantenha public class Main e o método main.';
  byId('sampleOutput').textContent = current.expected;
  byId('topicLink').href = (guided ? 'tema-0' + current.theme + '.html' : 'cont.html#modal' + current.theme);
  document.querySelectorAll('.activity-details').forEach(el => el.open = false);
  const draft = drafts[current.id];
  editor.value = typeof draft?.source === 'string' ? draft.source : guided ? '' : current.source;
  input.value = typeof draft?.input === 'string' ? draft.input : current.input;
  output.textContent = 'Execute o programa para ver a saída.';
  byId('compileOutput').textContent = 'As mensagens de compilação aparecerão aqui.';
  status.textContent = guided
    ? typeof draft?.source === 'string' && draft.source
      ? 'Seu rascunho anterior foi recuperado. Continue escrevendo ou use Limpar meu código para recomeçar.'
      : 'Leia os passos, escreva seu programa em Main.java e execute para conferir.'
    : 'Edite Main.java, preencha a entrada quando necessário e execute.';
  byId('outputState').textContent = 'Este código ainda não foi executado nesta visita.';
  lastRun = null;
  history.replaceState(null, '', '?ex=' + encodeURIComponent(current.id));
  persist();
  updateActivityNavigation();
}

function visibleExercises() {
  const theme = byId('exerciseTheme').value;
  return exercises.filter(exercise => !theme || exercise.theme === Number(theme));
}

function updateActivityNavigation() {
  const visible = visibleExercises();
  const index = visible.findIndex(exercise => exercise.id === current?.id);
  byId('previousActivity').disabled = busy || index <= 0;
  byId('nextActivity').disabled = busy || index < 0 || index >= visible.length - 1;
  byId('activityPosition').textContent = index < 0 ? 'Carregando atividades…' : 'Atividade ' + (index + 1) + ' de ' + visible.length + ' neste filtro';
}

function navigateActivity(offset) {
  if (busy) return;
  const visible = visibleExercises();
  const index = visible.findIndex(exercise => exercise.id === current?.id);
  if (!visible[index + offset]) return;
  selectExercise(visible[index + offset].id);
  byId('activityTitle').focus({ preventScroll: true });
}

function renderExerciseOptions() {
  const visible = visibleExercises();
  byId('exerciseSelect').replaceChildren();
  for (let number = 1; number <= 14; number++) {
    const items = visible.filter(exercise => exercise.theme === number);
    if (!items.length) continue;
    const group = document.createElement('optgroup');
    group.label = 'Tema ' + number;
    for (const exercise of items) group.append(new Option(exercise.title, exercise.id));
    byId('exerciseSelect').append(group);
  }
  byId('exerciseCount').textContent = visible.length + ' de ' + exercises.length + ' atividades disponíveis.';
  return visible;
}

function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function exportWork() {
  persist();
  const report = { activity: current.id, title: current.title, source: editor.value, input: input.value, lastRun, savedAt: new Date().toISOString() };
  const format = byId('exportFormat').value;
  const text = current.title + '\n\nMain.java\n' + editor.value + '\n\nEntrada\n' + input.value + '\n\nÚltima execução\n' + (lastRun ? lastRun.output + '\n\nCompilação\n' + lastRun.compileOutput : 'Sem execução para o código atual.');
  if (format === 'java') download(editor.value, 'Main.java', 'text/plain;charset=utf-8');
  if (format === 'json') download(JSON.stringify(report, null, 2), 'java-' + current.id + '.json', 'application/json');
  if (format === 'txt') download(text, 'java-' + current.id + '.txt', 'text/plain;charset=utf-8');
  if (format === 'html') download('<!doctype html><html lang="pt-br"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Atividade Java</title><style>body{max-width:80ch;margin:2rem auto;padding:1rem;font:16px/1.6 system-ui}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>Registro do Playground Java</h1><pre>' + escape(text) + '</pre></html>', 'java-' + current.id + '.html', 'text/html;charset=utf-8');
  if (format === 'pdf') {
    byId('printReport').textContent = text;
    document.body.classList.add('print-playground');
    window.print();
    document.body.classList.remove('print-playground');
  }
  byId('saveStatus').textContent = format === 'pdf' ? 'Na janela de impressão, escolha salvar como PDF.' : 'Arquivo preparado para download.';
}

const markEdited = () => {
  if (lastRun) byId('outputState').textContent = 'Saída desatualizada: código ou entrada mudou. Execute novamente para atualizar.';
  lastRun = null;
  status.textContent = 'Código ou entrada alterados. Execute novamente para atualizar a saída.';
  persist();
};
editor.addEventListener('input', markEdited);
input.addEventListener('input', markEdited);
editor.addEventListener('keydown', event => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); run(); }
});
byId('runJava').addEventListener('click', run);
byId('stopJava').addEventListener('click', () => stop());
byId('previousActivity').addEventListener('click', () => navigateActivity(-1));
byId('nextActivity').addEventListener('click', () => navigateActivity(1));
byId('exerciseSelect').addEventListener('change', event => selectExercise(event.target.value));
byId('exerciseTheme').addEventListener('change', () => {
  const visible = renderExerciseOptions();
  if (visible.some(exercise => exercise.id === current.id)) byId('exerciseSelect').value = current.id;
  else selectExercise(visible[0].id);
  updateActivityNavigation();
});
byId('resetExample').addEventListener('click', () => {
  if (current.theme <= 8) {
    if ((editor.value || input.value) && !confirm('Limpar o código e a entrada desta atividade? Exporte seu trabalho antes, se quiser guardar uma cópia.')) return;
    drafts[current.id] = { source: '', input: '' };
    selectExercise(current.id, false);
    editor.focus();
    return;
  }
  if (editor.value !== current.source || input.value !== current.input) {
    if (!confirm('Restaurar o exemplo e substituir o rascunho desta atividade? Baixe seu código antes, se quiser guardá-lo.')) return;
  }
  delete drafts[current.id]; selectExercise(current.id, false);
});
byId('exportWork').addEventListener('click', exportWork);

async function initializePlayground() {
  try {
    const response = await fetch('assets/data/exercises.json');
    if (!response.ok) throw new Error('activities');
    exercises = (await response.json()).sort((a, b) => a.theme - b.theme);
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.drafts && typeof saved.drafts === 'object' && !Array.isArray(saved.drafts)) drafts = saved.drafts;
      current = exercises.find(exercise => exercise.id === saved?.current);
    } catch {}
    renderExerciseOptions();
    selectExercise(new URLSearchParams(location.search).get('ex') || current?.id || exercises[0].id, false);
    byId('runJava').disabled = false;
    byId('exerciseSelect').disabled = false;
    byId('exerciseTheme').disabled = false;
    byId('resetExample').disabled = false;
    byId('exportWork').disabled = false;
    updateConnection();
  } catch {
    status.textContent = 'Não foi possível carregar as atividades. Recarregue o site por HTTP ou HTTPS; consulte o FAQ se o problema continuar.';
  }
}
initializePlayground();
updateConnection();

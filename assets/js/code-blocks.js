/* Blocos de código: destaque de sintaxe Java e botão "Copiar".
 *
 * - Só lê o texto dos blocos e monta nós de DOM (sem innerHTML); o texto
 *   copiado e o conteúdo do HTML-fonte permanecem idênticos.
 * - Só colore o que for reconhecido como Java; comandos de terminal, saídas,
 *   XML, JSON e SQL ficam sem cores, e o botão copia o texto como está.
 * - Funciona sem este script: sem JavaScript, o bloco continua legível.
 */
(function () {
  'use strict';

  var KEYWORDS = new Set((
    'abstract assert boolean break byte case catch char class const continue default do double else enum extends ' +
    'final finally float for goto if implements import instanceof int interface long native new package private ' +
    'protected public return short static strictfp super switch synchronized this throw throws transient try void ' +
    'volatile while var record sealed permits yield non-sealed true false null'
  ).split(' '));

  var TOKEN = new RegExp([
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)',                                   // 1 comentário
    '("""[\\s\\S]*?"""|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])+\')',  // 2 texto ou char
    '(@[A-Za-z_][\\w.]*)',                                                     // 3 anotação
    '(\\b(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?[fFdDlL]?)\\b)', // 4 número
    '([A-Za-z_$][\\w$]*)'                                                      // 5 palavra
  ].join('|'), 'g');

  var SHELL = /^\s*(\$ |PS[ >]|java\s|javac\s|jar\s|jshell|jlink|jpackage|jdeps|mvn|\.\/|gradle|cd\s|ls\b|dir\b|pwd|mkdir|echo\s|curl\s|docker|adb\s|git\s|npm\s|set\s|export\s|Get-|New-|Set-|Copy-|Remove-|Test-|Invoke-|where\s|winget|sdkmanager|brew\s|sudo\s|apt|unzip|python|chmod|cat\s|type\s|sha256|certutil|\[Environment\]|\$env:|\$Env:)/i;
  var NOT_JAVA = /^\s*(<|\{\s*$|\{\s*"|\[|(SELECT|INSERT|CREATE|UPDATE|DELETE|ALTER|DROP|WITH)\b|[a-z][\w.-]*\s*[=:]\s*\S|---)/i;
  var JAVA_HINT = /\w\([^\n]*\)\s*;|\b(class|interface|enum|record|public|private|protected|static|void|final|int|long|double|boolean|char|String|var|new|return|if|for|while|switch|try|import|package|System|List|Map)\b/;

  function firstLine(text) {
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) if (lines[i].trim()) return lines[i];
    return '';
  }
  function kindOf(text) {
    var first = firstLine(text);
    if (SHELL.test(first)) return 'shell';
    if (NOT_JAVA.test(first) && !/^\s*(public|private|protected|static|final|class|interface|enum|record|import|package|@)\b/.test(first)) return 'other';
    if (/[;{}]/.test(text) && JAVA_HINT.test(text)) return 'java';
    return 'other';
  }

  function span(cls, text) {
    var s = document.createElement('span');
    s.className = 'tok tok-' + cls;
    s.textContent = text;
    return s;
  }

  function highlight(code) {
    if (code.dataset.highlighted) return;
    var text = code.textContent;
    var frag = document.createDocumentFragment();
    var last = 0, m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var word = m[0];
      if (m[1]) frag.appendChild(span('c', word));
      else if (m[2]) frag.appendChild(span('s', word));
      else if (m[3]) frag.appendChild(span('a', word));
      else if (m[4]) frag.appendChild(span('n', word));
      else if (KEYWORDS.has(word)) frag.appendChild(span('k', word));
      else if (/^[A-Z]/.test(word) && !/^[A-Z0-9_$]+$/.test(word)) frag.appendChild(span('t', word));
      else frag.appendChild(document.createTextNode(word));
      last = m.index + word.length;
      if (word.length === 0) TOKEN.lastIndex++;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    code.replaceChildren(frag);
    code.dataset.highlighted = 'true';
  }

  /* ---- copiar ---- */
  var live;
  function announce(message) {
    if (!live) {
      live = document.createElement('div');
      live.className = 'visually-hidden';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    live.textContent = '';
    window.setTimeout(function () { live.textContent = message; }, 30);
  }
  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function makeButton(code, label) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy no-print';
    button.setAttribute('aria-label', 'Copiar código: ' + label);
    button.textContent = 'Copiar';
    var timer;
    button.addEventListener('click', function () {
      copyText(code.textContent.replace(/\n$/, '')).then(function (ok) {
        button.textContent = ok ? 'Copiado' : 'Não copiou';
        button.dataset.state = ok ? 'done' : 'fail';
        announce(ok ? 'Código copiado.' : 'Não foi possível copiar. Selecione o texto do código e copie manualmente.');
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { button.textContent = 'Copiar'; delete button.dataset.state; }, 2200);
      });
    });
    return button;
  }

  var LABELS = { java: 'Java', shell: 'Terminal', other: 'Código' };

  function enhance(pre) {
    if (pre.dataset.codeEnhanced) return;
    var code = pre.querySelector(':scope > code');
    if (!code || pre.querySelector('samp')) return;          // saídas: sem cores nem botão
    pre.dataset.codeEnhanced = 'true';
    var kind = code.hasAttribute('data-java-program') ? 'java' : kindOf(code.textContent);
    if (kind === 'java') highlight(code);

    var figure = pre.parentElement;
    if (figure && figure.matches('figure.lesson-example') && figure.querySelector(':scope > pre') === pre) {
      var caption = figure.querySelector(':scope > figcaption');
      if (caption) {
        caption.classList.add('has-copy');
        caption.appendChild(makeButton(code, caption.textContent.trim()));
        return;
      }
    }
    if (pre.closest('.study-text') && !pre.closest('figure')) {
      var bar = document.createElement('div');
      bar.className = 'code-bar code-bar-' + kind + ' no-print';
      var title = document.createElement('span');
      title.className = 'code-bar-title';
      title.textContent = LABELS[kind];
      bar.appendChild(title);
      bar.appendChild(makeButton(code, LABELS[kind]));
      pre.classList.add('has-bar');
      pre.parentNode.insertBefore(bar, pre);
    }
  }

  var SELECTOR = 'figure.lesson-example > pre, .study-text pre';

  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.matches(SELECTOR)) enhance(root);
    root.querySelectorAll(SELECTOR).forEach(enhance);
  }
  function run() {
    scan(document.body);
    /* Capítulos carregados depois (ex.: temas 1 a 8 na página Conteúdo) recebem o mesmo tratamento. */
    if (window.MutationObserver) {
      new MutationObserver(function (records) {
        records.forEach(function (record) { record.addedNodes.forEach(scan); });
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  window.JavaCodeBlocks = { kindOf: kindOf };
})();

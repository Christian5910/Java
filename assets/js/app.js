/* Interações globais de usabilidade, acessibilidade e feedback */

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('yearNow');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const topBtn = document.getElementById('backToTop');
  if (topBtn) {
    const toggleTop = () => {
      topBtn.hidden = window.scrollY < 360;
    };
    toggleTop();
    window.addEventListener('scroll', toggleTop, { passive: true });
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }

  const openTopic = () => {
    const group = location.pathname.endsWith('/cont.html') && location.hash.match(/^#cat([1-9]|1[0-5])$/);
    if (group) {
      document.getElementById('grupo' + group[1])?.scrollIntoView();
      return;
    }
    const chapter = location.pathname.endsWith('/cont.html') && location.hash.match(/^#modal([1-8])$/);
    if (chapter) {
      location.replace('tema-0' + chapter[1] + '.html');
      return;
    }
    if (!/^#(?:modal(?:[1-9]|[12][0-9]|30)|extra[A-Za-z]+)$/.test(location.hash)) return;
    const dialog = document.querySelector(location.hash);
    if (dialog && window.bootstrap) bootstrap.Modal.getOrCreateInstance(dialog).show();
  };
  openTopic();
  window.addEventListener('hashchange', openTopic);
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const searchTopics = event => {
    const term = normalize(event.target.value.trim());
    let count = 0;
    document.querySelectorAll('.topic-item').forEach(item => {
      const text = document.getElementById(item.dataset.target || 'modal' + item.dataset.topic).textContent;
      item.hidden = !normalize(text).includes(term);
      if (!item.hidden) count++;
    });
    document.querySelectorAll('[data-topic-group]').forEach(group => {
      group.hidden = ![...group.querySelectorAll('.topic-item')].some(item => !item.hidden);
    });
    const isExtra = location.pathname.endsWith('/extra.html');
    document.getElementById('searchCount').textContent = count === 1 ? (isExtra ? '1 seção encontrada.' : '1 tema encontrado.') : count ? count + (isExtra ? ' seções encontradas.' : ' temas encontrados.') : (isExtra ? 'Nenhuma seção encontrada. Tente outro termo.' : 'Nenhum tema encontrado. Tente outro termo.');
  };
  document.getElementById('topicSearch')?.addEventListener('input', searchTopics);
  document.getElementById('faqSearch')?.addEventListener('input', event => {
    const term = normalize(event.target.value.trim());
    let count = 0;
    document.querySelectorAll('#faqAccordion .accordion-item').forEach(item => {
      item.hidden = !normalize(item.textContent).includes(term);
      if (!item.hidden) count++;
    });
    document.querySelectorAll('#faqAccordion .faq-section-title').forEach(heading => {
      let sibling = heading.nextElementSibling;
      let visible = false;
      while (sibling?.classList.contains('accordion-item')) {
        visible ||= !sibling.hidden;
        sibling = sibling.nextElementSibling;
      }
      heading.hidden = !visible;
    });
    document.getElementById('faqSearchCount').textContent = count === 1 ? '1 pergunta encontrada.' : count ? count + ' perguntas encontradas.' : 'Nenhuma pergunta encontrada. Tente outro termo.';
  });
  const annotatePrintLinks = () => {
    document.querySelectorAll('main a[href]').forEach(link => {
      const url = new URL(link.getAttribute('href'), document.baseURI);
      if (['http:', 'https:', 'file:', 'mailto:'].includes(url.protocol)) link.dataset.printHref = url.href;
    });
  };
  annotatePrintLinks();
  if (document.body.classList.contains('book-page')) {
    const cover = document.createElement('section');
    cover.className = 'print-only print-cover';
    const logo = document.createElement('img');
    logo.src = 'assets/logo.svg'; logo.alt = ''; logo.width = 64; logo.height = 64;
    const title = document.createElement('h1');
    title.textContent = location.pathname.endsWith('/extra.html') ? 'Java · Extra e laboratórios' : 'Java · Guia de estudo';
    const introduction = document.createElement('p');
    introduction.textContent = 'Conceitos, exemplos completos, práticas e referências para acompanhar seu estudo.';
    const origin = document.createElement('p');
    origin.className = 'print-origin';
    origin.textContent = 'Versão online: ' + location.href.split('#')[0].split('?')[0];
    const heading = document.createElement('h2'); heading.textContent = 'Roteiro de leitura';
    const contents = document.createElement('ol'); contents.className = 'print-toc';
    document.querySelectorAll('main .modal:not([id^="cat"]) .modal-title, main .print-chapter .chapter-title').forEach(item => {
      const entry = document.createElement('li');
      entry.textContent = item.textContent.replace(/^\d+\s*·\s*/, '');
      contents.append(entry);
    });
    contents.classList.toggle('print-toc-long', contents.children.length > 18);
    cover.append(logo, title, introduction, origin, heading, contents);
    document.getElementById('conteudo').prepend(cover);
  }
  const chapters = [...document.querySelectorAll('[data-chapter-url]')];
  if (chapters.length) {
    const printButton = document.getElementById('printBook');
    const status = document.getElementById('chapterLoadStatus');
    // A página do tema é a única fonte para leitura, busca e impressão.
    Promise.all(chapters.map(async chapter => {
      const response = await fetch(chapter.dataset.chapterUrl);
      if (!response.ok) throw new Error('Falha ao carregar ' + chapter.dataset.chapterUrl);
      const source = new DOMParser().parseFromString(await response.text(), 'text/html');
      const article = source.querySelector('.lesson-article');
      if (!article) throw new Error('Conteúdo do tema não encontrado.');
      // Prefixa âncoras locais para evitar IDs duplicados na apostila reunida.
      article.querySelectorAll('[id]').forEach(element => { element.id = chapter.id + '-' + element.id; });
      article.querySelectorAll('a[href^="#"]').forEach(link => { link.href = '#' + chapter.id + '-' + link.getAttribute('href').slice(1); });
      chapter.append(article);
      chapter.querySelector('p').remove();
    })).then(() => {
      printButton.disabled = false;
      status.textContent = '30 temas disponíveis para busca e impressão. Os temas 1 a 8 abrem em páginas completas.';
      annotatePrintLinks();
      const input = document.getElementById('topicSearch');
      searchTopics({target: input});
    }).catch(error => {
      status.textContent = 'Não foi possível reunir os temas 1 a 8 para busca e impressão completas. Recarregue a página por HTTP/HTTPS ou abra os temas pelos seus links.';
      console.warn(status.textContent, error);
    });
  }
  const printDetails = new Map();
  window.addEventListener('beforeprint', () => {
    annotatePrintLinks();
    document.querySelectorAll('main details').forEach(detail => {
      if (!printDetails.has(detail)) printDetails.set(detail, detail.open);
      detail.open = true;
    });
  });
  window.addEventListener('afterprint', () => {
    printDetails.forEach((open, detail) => { detail.open = open; });
    printDetails.clear();
  });
  document.getElementById('printBook')?.addEventListener('click', () => window.print());
  document.querySelectorAll('.modal').forEach(dialog => {
    dialog.addEventListener('shown.bs.modal', () => { dialog.querySelector('.modal-body').scrollTop = 0; });
  });

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.getAttribute('data-copy') || '');
        btn.setAttribute('aria-live', 'polite');
        const old = btn.textContent;
        btn.textContent = 'Copiado';
        setTimeout(() => { btn.textContent = old; }, 1600);
      } catch (err) {
        console.warn('Não foi possível copiar.', err);
      }
    });
  });
});

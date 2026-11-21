// Layout helpers for the already-rendered prettydoc page (index.html):
// a link back to the site, collapsible code chunks, and a sidebar table of
// contents that highlights the current section. A fresh knit of index.Rmd
// gets the same features from rmarkdown::html_document instead.
(function () {
  var header = document.querySelector('.page-header');
  var main = document.querySelector('.main-content');
  if (!header || !main) return;
  var toc = document.getElementById('TOC');

  // Frame: link, title, table of contents, content. On wide screens the
  // table of contents moves into a sticky sidebar (see notebook-fallback.css).
  var layout = document.createElement('div');
  layout.className = 'nb-layout';
  header.parentNode.insertBefore(layout, header);

  var bar = document.createElement('nav');
  bar.className = 'site-bar';
  bar.setAttribute('aria-label', 'Site');
  bar.innerHTML = '<a href="https://caiusribeiro.github.io/">&larr; caiusribeiro.github.io</a>';

  layout.appendChild(bar);
  layout.appendChild(header);
  if (toc) layout.appendChild(toc);
  layout.appendChild(main);

  // Collapse each R code chunk behind a "Show code" button
  var chunks = main.querySelectorAll('div.sourceCode');
  var all = [];
  Array.prototype.forEach.call(chunks, function (chunk) {
    var details = document.createElement('details');
    details.className = 'nb-code';
    var summary = document.createElement('summary');
    summary.textContent = 'Show code';
    details.appendChild(summary);
    chunk.parentNode.insertBefore(details, chunk);
    details.appendChild(chunk);
    details.addEventListener('toggle', function () {
      summary.textContent = details.open ? 'Hide code' : 'Show code';
    });
    all.push(details);
  });

  if (all.length) {
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nb-code-toggle';
    toggle.textContent = 'Show all code';
    toggle.addEventListener('click', function () {
      var open = toggle.textContent === 'Show all code';
      all.forEach(function (d) { d.open = open; });
      toggle.textContent = open ? 'Hide all code' : 'Show all code';
    });
    header.insertBefore(toggle, header.firstChild);
  }

  // Let wide printed tables scroll sideways instead of widening the page
  Array.prototype.forEach.call(main.querySelectorAll('table'), function (table) {
    if (table.closest('.pagedtable, .nb-table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'nb-table-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // Highlight the section being read in the table of contents
  if (!toc) return;
  var links = {};
  Array.prototype.forEach.call(toc.querySelectorAll('a[href^="#"]'), function (a) {
    links[decodeURIComponent(a.getAttribute('href').slice(1))] = a;
  });
  var sections = Array.prototype.filter.call(
    main.querySelectorAll('.section[id]'), function (s) { return links[s.id]; });
  if (!sections.length) return;
  var ticking = false;
  function update() {
    ticking = false;
    var current = sections[0].id;
    for (var i = 0; i < sections.length; i++) {
      var heading = sections[i].querySelector('h1, h2, h3');
      if (heading && heading.getBoundingClientRect().top < window.innerHeight * 0.35) current = sections[i].id;
    }
    // At the end of the page the last sections can't scroll up far enough
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1].id;
    }
    Object.keys(links).forEach(function (id) {
      links[id].classList.toggle('active', id === current);
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

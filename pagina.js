/* Motor comum das páginas de vendas (o mesmo arquivo nas 4 ofertas).
   O que muda de uma oferta para outra fica em dados.js. Este arquivo não precisa ser editado.
   - Não mexe nos links de checkout: eles ficam fixos no HTML para o script da Utmify acrescentar as UTMs.
   - Conteúdo que ainda não existe (depoimentos, fotos de antes e depois, prazo do contador) fica escondido
     do comprador e aparece só no modo revisão: endereço da página + ?revisao=1 */
(function () {
  'use strict';
  var O = window.OFERTA || {};
  var R = O.rastreio || {};
  var doc = document, root = doc.documentElement;
  var url = new URLSearchParams(location.search);
  var REVISAO = url.get('revisao') === '1';
  root.classList.add('js');
  if (REVISAO) root.classList.add('revisao');

  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function guardado(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var poucoMovimento = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Medição (tempo, rolagem, seções, cliques) ---------- */
  function utm(k) { return url.get(k) || guardado(k) || ''; }
  var ctx = { oferta: O.id || '', utm_source: utm('utm_source'), utm_medium: utm('utm_medium'), utm_campaign: utm('utm_campaign'), utm_content: utm('utm_content'), utm_term: utm('utm_term') };
  var t0 = Date.now();
  function evento(nome, valor) {
    if (REVISAO) return; // o modo revisão não suja os números
    try { if (window.clarity) window.clarity('event', nome); } catch (e) {}
    (window.dataLayer = window.dataLayer || []).push({ event: nome, valor: valor, oferta: ctx.oferta });
    if (R.endpoint && navigator.sendBeacon) {
      var dado = { e: nome, v: valor == null ? '' : valor, s: Math.round((Date.now() - t0) / 1000), pag: location.host + location.pathname };
      for (var k in ctx) dado[k] = ctx[k];
      try { navigator.sendBeacon(R.endpoint, JSON.stringify(dado)); } catch (e) {}
    }
  }
  // Clarity: carregado só se houver ID em dados.js. As UTMs viram filtros (tags) para comparar criativos.
  if (R.clarity && !REVISAO) {
    (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, doc, 'clarity', 'script', R.clarity);
    ['utm_source', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_term'].forEach(function (k) { if (ctx[k]) window.clarity('set', k, ctx[k]); });
    window.clarity('set', 'oferta', ctx.oferta);
    if (R.mascarar) root.setAttribute('data-clarity-mask', 'true');
  }
  // Pixel da Utmify: só entra quando o ID existir em dados.js (cadastro feito na Utmify, restrito ao produto).
  if (R.utmifyPixel && !REVISAO) {
    window.pixelId = R.utmifyPixel;
    var px = doc.createElement('script'); px.async = true; px.defer = true; px.src = 'https://cdn.utmify.com.br/scripts/pixel/pixel.js'; doc.head.appendChild(px);
  }
  // Rolagem: 25, 50, 75 e 90% da página, uma vez cada
  var marcas = [25, 50, 75, 90], feitas = {};
  function rolagem() {
    var h = root.scrollHeight - innerHeight; if (h <= 0) return;
    var p = Math.round((scrollY / h) * 100);
    marcas.forEach(function (m) { if (p >= m && !feitas[m]) { feitas[m] = 1; evento('rolagem_' + m, m); } });
  }
  var esperaRol = 0;
  addEventListener('scroll', function () { if (!esperaRol) esperaRol = setTimeout(function () { esperaRol = 0; rolagem(); }, 250); }, { passive: true });
  // Tempo com a página aberta e visível
  var visivel = 0, tempos = [15, 30, 60, 120, 300], tFeitos = {};
  setInterval(function () {
    if (doc.visibilityState !== 'visible') return;
    visivel++;
    tempos.forEach(function (t) { if (visivel >= t && !tFeitos[t]) { tFeitos[t] = 1; evento('tempo_' + t + 's', t); } });
  }, 1000);
  // Seções vistas (data-secao)
  if ('IntersectionObserver' in window) {
    var vistas = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var n = e.target.getAttribute('data-secao');
        if (e.isIntersecting && !vistas[n]) { vistas[n] = 1; evento('viu_' + n); }
      });
    }, { threshold: 0.35 });
    $$('[data-secao]').forEach(function (s) { io.observe(s); });
  }
  // Cliques nos botões de compra (o link continua indo direto para o checkout)
  $$('a[data-onde]').forEach(function (a) {
    a.addEventListener('click', function () {
      evento('clique_checkout_' + a.getAttribute('data-onde'), a.getAttribute('data-onde'));
      try { if (window.clarity) window.clarity('upgrade', 'clique_checkout'); } catch (e) {}
    });
  });

  /* ---------- Botão fixo de compra ---------- */
  var barra = $('#barra-compra');
  if (barra && 'IntersectionObserver' in window) {
    var estado = { topo: true, oferta: false, rodape: false };
    function atualiza() {
      var mostrar = !estado.topo && !estado.oferta && !estado.rodape;
      barra.classList.toggle('visivel', mostrar);
      barra.setAttribute('aria-hidden', mostrar ? 'false' : 'true');
      $$('a', barra).forEach(function (a) { a.tabIndex = mostrar ? 0 : -1; });
    }
    var alvo = { topo: $('[data-barra="topo"]'), oferta: $('[data-barra="oferta"]'), rodape: $('[data-barra="rodape"]') };
    var ioB = new IntersectionObserver(function (es) {
      es.forEach(function (e) { estado[e.target.getAttribute('data-barra')] = e.isIntersecting; });
      atualiza();
    }, { threshold: 0 });
    for (var k in alvo) if (alvo[k]) ioB.observe(alvo[k]);
    atualiza();
  }

  /* ---------- Carrosséis (rolagem lateral com botões) ---------- */
  $$('[data-carrossel]').forEach(function (box) {
    var trilho = $('.trilho', box); if (!trilho) return;
    $$('[data-car]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var item = trilho.firstElementChild; if (!item) return;
        var passo = item.getBoundingClientRect().width + parseFloat(getComputedStyle(trilho).columnGap || 16);
        trilho.scrollBy({ left: b.getAttribute('data-car') === 'prox' ? passo : -passo, behavior: poucoMovimento ? 'auto' : 'smooth' });
      });
    });
  });

  /* ---------- Revelação discreta de alguns blocos ---------- */
  if (!poucoMovimento && 'IntersectionObserver' in window) {
    var ioR = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); ioR.unobserve(e.target); } });
    }, { threshold: 0.18 });
    $$('[data-revela]').forEach(function (el) { ioR.observe(el); });
  } else { $$('[data-revela]').forEach(function (el) { el.classList.add('visto'); }); }

  /* ---------- Depoimentos (dados.js) ---------- */
  var dep = (O.depoimentos || []).filter(function (d) { return d && d.autorizado; });
  var lista = $('#depoimentos-lista');
  if (lista && dep.length) {
    lista.innerHTML = dep.map(function (d) {
      if (d.tipo === 'print') return '<figure class="dep dep-print"><img src="' + esc(d.imagem) + '" alt="' + esc(d.legenda || 'Mensagem de cliente') + '" loading="lazy"><figcaption>' + esc(d.legenda || '') + '</figcaption></figure>';
      if (d.tipo === 'video') return '<figure class="dep dep-video"><video controls preload="none" playsinline poster="' + esc(d.capa || '') + '" src="' + esc(d.video) + '"></video><figcaption>' + esc(d.nome || '') + '</figcaption></figure>';
      return '<figure class="dep dep-texto"><blockquote>' + esc(d.texto) + '</blockquote><figcaption>' + (d.foto ? '<img src="' + esc(d.foto) + '" alt="" width="44" height="44" loading="lazy">' : '') + esc(d.nome || '') + '</figcaption></figure>';
    }).join('');
    var sDep = lista.closest('[data-pendente]'); if (sDep) sDep.removeAttribute('data-pendente');
  }

  /* ---------- Antes e depois com fotos reais (dados.js) ---------- */
  var ad = (O.antesDepois || []).filter(function (d) { return d && d.autorizado; });
  var adLista = $('#antes-depois-lista');
  if (adLista && ad.length) {
    adLista.innerHTML = ad.map(function (d) {
      return '<figure class="ad-par"><div class="ad-fotos"><div><img src="' + esc(d.antes) + '" alt="Antes" loading="lazy"><span>Antes</span></div><div><img src="' + esc(d.depois) + '" alt="Depois" loading="lazy"><span>Depois</span></div></div><figcaption>' + esc(d.legenda || '') + '</figcaption></figure>';
    }).join('');
    var sAd = adLista.closest('[data-pendente]'); if (sAd) sAd.removeAttribute('data-pendente');
  }

  /* ---------- Bônus que ainda faltam (dados.js) ---------- */
  var bx = (O.bonusExtras || []).filter(function (b) { return b && b.titulo; });
  $$('[data-bonus-vago]').forEach(function (slot, i) {
    var b = bx[i]; if (!b) return;
    slot.innerHTML = (b.imagem ? '<img src="' + esc(b.imagem) + '" alt="" loading="lazy">' : '') + '<h3>' + esc(b.titulo) + '</h3><p>' + esc(b.descricao || '') + '</p>';
    slot.removeAttribute('data-pendente'); slot.removeAttribute('data-bonus-vago'); slot.classList.remove('vaga'); slot.classList.add('bonus-extra');
  });

  /* ---------- Contador regressivo: só com prazo verdadeiro em dados.js ---------- */
  var cont = $('#contador');
  if (cont) {
    var prazo = O.prazo ? new Date(O.prazo) : null;
    var valido = prazo && !isNaN(prazo) && prazo > new Date();
    if (valido) {
      cont.removeAttribute('data-pendente');
      var txt = $('[data-prazo-texto]', cont); if (txt && O.prazoTexto) txt.textContent = O.prazoTexto;
      var partes = { d: $('[data-c="d"]', cont), h: $('[data-c="h"]', cont), m: $('[data-c="m"]', cont), s: $('[data-c="s"]', cont) };
      var tick = function () {
        var f = Math.max(0, prazo - new Date());
        if (!f) { cont.setAttribute('data-pendente', ''); cont.hidden = true; clearInterval(iv); return; }
        var s = Math.floor(f / 1000);
        partes.d.textContent = Math.floor(s / 86400); partes.h.textContent = String(Math.floor(s % 86400 / 3600)).padStart(2, '0');
        partes.m.textContent = String(Math.floor(s % 3600 / 60)).padStart(2, '0'); partes.s.textContent = String(s % 60).padStart(2, '0');
      };
      var iv = setInterval(tick, 1000); tick();
    }
  }

  /* ---------- Modo revisão: aviso no topo ---------- */
  if (REVISAO) {
    var av = doc.createElement('div');
    av.className = 'aviso-revisao';
    av.innerHTML = '<b>Modo revisão.</b> Os quadros tracejados são espaços reservados e não aparecem para o comprador. Preencha em <code>dados.js</code>.';
    doc.body.insertBefore(av, doc.body.firstChild);
  }

  /* ---------- Ano no rodapé ---------- */
  $$('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

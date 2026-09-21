/* ==========================================================================
   CONVITE DO NOAH — comportamento da página (sem bibliotecas)
   Os textos/links editáveis ficam em config.js
   ========================================================================== */
(() => {
  'use strict';

  const C = Object.assign({
    data: 'DATA A DEFINIR', horario: 'HORÁRIO A DEFINIR', local: 'LOCAL A DEFINIR',
    whatsappLink: 'WHATSAPP_LINK_AQUI', localizacaoTexto: 'LOCALIZAÇÃO_AQUI', localizacaoUrl: 'LOCALIZAÇÃO_AQUI', mapaEmbedUrl: '',
    video: 'public/assets/video/aniversario.mp4', musica: 'public/assets/audio/musica.mp3',
  }, window.CONVITE || {});

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isUrl = (v) => /^https?:\/\//i.test(String(v || '').trim());

  /* ---------- aviso rápido (toast) ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3800);
  }

  /* ---------- textos vindos de config.js ---------- */
  $$('[data-field]').forEach((el) => {
    const v = C[el.dataset.field];
    if (v) el.textContent = v;
  });

  /* ---------- botões de link (WhatsApp / mapa) ---------- */
  function wireLink(el, url, warning) {
    if (isUrl(url)) {
      el.href = url.trim();
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el.href = '#';
      el.addEventListener('click', (e) => { e.preventDefault(); toast(warning); });
    }
  }
  wireLink($('#rsvp'), C.whatsappLink, 'Link do WhatsApp ainda não configurado. Edite o arquivo config.js.');
  wireLink($('#dock'), C.whatsappLink, 'Link do WhatsApp ainda não configurado. Edite o arquivo config.js.');
  wireLink($('#mapBtn'), C.localizacaoUrl, 'Link da localização ainda não configurado. Edite o arquivo config.js.');

  if (isUrl(C.mapaEmbedUrl)) {
    const canvas = $('#mapCanvas');
    const f = document.createElement('iframe');
    f.src = C.mapaEmbedUrl; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    f.title = 'Mapa com a localização da festa';
    canvas.classList.add('has-embed'); canvas.appendChild(f);
  }

  /* ---------- partículas discretas (estrelinhas) ---------- */
  if (!reduceMotion) {
    const box = $('#sparks');
    const n = innerWidth < 700 ? 16 : 30;
    const colors = ['#ffffff', '#ffe27a', '#8fe3ff', '#ffffff'];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      const size = 6 + Math.random() * 12;
      s.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}%;--y:${(Math.random() * 100).toFixed(1)}%;--s:${size.toFixed(1)}px;` +
        `--c:${colors[i % colors.length]};--d:${(3 + Math.random() * 4).toFixed(1)}s;--dl:${(-Math.random() * 6).toFixed(1)}s`;
      frag.appendChild(s);
    }
    box.appendChild(frag);
  }

  /* ---------- elementos que aparecem ao rolar ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- toque num herói = pulinho ---------- */
  document.addEventListener('click', (e) => {
    const h = e.target.closest && e.target.closest('.hero');
    if (!h || reduceMotion) return;
    h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop');
  });
  document.addEventListener('animationend', (e) => { if (e.animationName === 'pop') e.target.classList.remove('pop'); });

  /* ---------- contagem regressiva (só com config.dataISO) ---------- */
  const cd = $('#countdown');
  const target = C.dataISO ? new Date(C.dataISO).getTime() : NaN;
  if (cd && !Number.isNaN(target) && target > Date.now()) {
    const out = { d: $('[data-u="d"]', cd), h: $('[data-u="h"]', cd), m: $('[data-u="m"]', cd), s: $('[data-u="s"]', cd) };
    const tick = () => {
      let t = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const d = Math.floor(t / 86400); t -= d * 86400;
      const h = Math.floor(t / 3600); t -= h * 3600;
      const m = Math.floor(t / 60);
      out.d.textContent = d; out.h.textContent = String(h).padStart(2, '0'); out.m.textContent = String(m).padStart(2, '0'); out.s.textContent = String(t - m * 60).padStart(2, '0');
    };
    tick(); cd.hidden = false;
    setInterval(() => { if (!document.hidden) tick(); }, 1000);
  }

  /* ---------- botão fixo "confirmar presença" ---------- */
  const dock = $('#dock'), rsvpSec = $('.rsvp');
  let rsvpInView = false, ticking = false;
  function updateDock() {
    ticking = false;
    const show = scrollY > innerHeight * 0.7 && !rsvpInView;
    dock.classList.toggle('show', show);
    dock.setAttribute('aria-hidden', String(!show));
    dock.tabIndex = show ? 0 : -1;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateDock); } }, { passive: true });
  if ('IntersectionObserver' in window && rsvpSec) {
    new IntersectionObserver((en) => { rsvpInView = en[0].isIntersecting; updateDock(); }, { threshold: 0.35 }).observe(rsvpSec);
  }
  updateDock();

  /* ---------- VÍDEO ---------- */
  const player = $('#player'), frame = $('#frame'), video = $('#video'), fallback = $('#fallback');
  const btnPlay = $('#play'), btnToggle = $('#toggle'), btnFull = $('#full'), progress = $('#progress');
  let userPaused = false;
  let dead = false;
  const setState = (s) => { if (!dead) player.dataset.state = s; };

  function showFallback() {
    if (dead) return;
    dead = true;
    player.dataset.state = 'fallback';
    fallback.hidden = false;
    frame.classList.remove('is-portrait');
    frame.style.setProperty('--vr', '16 / 9'); player.style.setProperty('--vr', '16 / 9');   // poster de fallback é 16:9
    video.removeAttribute('src'); video.load();
    console.info('[convite] Vídeo não encontrado em "' + C.video + '". Coloque o arquivo nesse caminho (veja config.js / README).');
  }

  video.muted = true;
  video.defaultMuted = true;
  video.addEventListener('error', showFallback);
  video.addEventListener('loadedmetadata', () => {
    if (video.videoWidth && video.videoHeight) {
      frame.style.setProperty('--vr', `${video.videoWidth} / ${video.videoHeight}`);
      player.style.setProperty('--vr', `${video.videoWidth} / ${video.videoHeight}`);
      frame.classList.toggle('is-portrait', video.videoHeight > video.videoWidth * 1.1);
    }
    if (player.dataset.state === 'loading') setState('paused');
    tryAutoplay();
  });
  video.addEventListener('play', () => setState('playing'));
  video.addEventListener('pause', () => { if (!video.ended) setState('paused'); });
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const v = (video.currentTime / video.duration) * 1000;
    progress.value = v; progress.style.setProperty('--p', (v / 10).toFixed(1) + '%');
  });

  function tryAutoplay() {
    if (dead || userPaused || reduceMotion) return;
    const p = video.play();
    if (p && p.catch) p.catch(() => setState('paused'));   // autoplay bloqueado: mostra o botão de play
  }
  function playPause() {
    if (dead) return;
    if (video.paused) { userPaused = false; video.play().catch(() => {}); } else { userPaused = true; video.pause(); }
  }
  btnPlay.addEventListener('click', playPause);
  btnToggle.addEventListener('click', playPause);
  video.addEventListener('click', playPause);

  progress.addEventListener('input', () => {
    if (video.duration) video.currentTime = (progress.value / 1000) * video.duration;
    progress.style.setProperty('--p', (progress.value / 10).toFixed(1) + '%');
  });

  btnFull.addEventListener('click', () => {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (player.requestFullscreen) player.requestFullscreen().catch(() => {});
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();      // iPhone
  });
  if (!document.fullscreenEnabled && !video.webkitEnterFullscreen) btnFull.hidden = true;

  // só toca enquanto está na tela (economiza bateria/dados)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (dead || !video.readyState) return;
        if (en.isIntersecting) { if (!userPaused && !reduceMotion && video.paused) video.play().catch(() => {}); }
        else if (!video.paused) video.pause();
      });
    }, { threshold: 0.25 }).observe(player);
  }

  // o src é definido por último, depois de todos os listeners (evita perder o evento de erro)
  video.src = C.video;
  video.load();

  /* ---------- MÚSICA DE FUNDO (única fonte de som do convite) ----------
     Tenta tocar ao abrir. Navegadores bloqueiam áudio automático; nesse caso a música começa
     no primeiro toque/clique/tecla do visitante. O botão "Música" liga/desliga a qualquer momento. */
  const musicBtn = $('#music');
  const audio = new Audio();
  audio.loop = true; audio.preload = 'auto'; audio.volume = 0.6;
  let userOff = false;          // visitante desligou de propósito
  let armed = false;

  function syncMusicUI() {
    const on = !audio.paused;
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Desligar música de fundo' : 'Ligar música de fundo');
    musicBtn.classList.toggle('hint', !on && !userOff);     // pulsa chamando atenção enquanto não toca
  }
  function armFirstGesture() {
    if (armed || userOff) return;
    armed = true;
    const events = ['pointerup', 'touchend', 'click', 'keydown'];
    const go = (e) => {
      if (e.target && e.target.closest && e.target.closest('#music')) return;   // o botão cuida de si
      events.forEach((ev) => removeEventListener(ev, go, true));
      armed = false;
      if (!userOff && audio.paused) audio.play().catch(armFirstGesture);      // se o gesto não valeu, tenta no próximo
    };
    events.forEach((ev) => addEventListener(ev, go, true));
  }
  function startMusic() {
    if (userOff || !audio.paused) return;
    const p = audio.play();
    if (p && p.catch) p.catch(armFirstGesture);
  }

  audio.addEventListener('loadedmetadata', () => { musicBtn.hidden = false; });   // botão só aparece se o arquivo existir
  audio.addEventListener('canplay', startMusic, { once: true });
  audio.addEventListener('error', () => { musicBtn.hidden = true; console.info('[convite] Música não encontrada em "' + C.musica + '" — botão ocultado.'); });
  audio.addEventListener('play', syncMusicUI);
  audio.addEventListener('pause', syncMusicUI);
  musicBtn.addEventListener('click', () => {
    if (audio.paused) {
      userOff = false;
      audio.play().catch(() => toast('Não foi possível tocar a música neste aparelho.'));
    } else { userOff = true; audio.pause(); }
    syncMusicUI();
  });
  // pausa quando a aba/app vai para segundo plano e volta sozinha ao retornar
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (!audio.paused) audio.pause(); }
    else startMusic();
  });
  audio.src = C.musica;
  syncMusicUI();
})();

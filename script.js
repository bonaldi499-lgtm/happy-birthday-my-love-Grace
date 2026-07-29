/* ============================================================
   HAPPY BIRTHDAY GRACE — script.js
   ============================================================ */

(() => {
  'use strict';

  /* ---------------------------------------------------------
     UTIL: Starfield renderer (reused across canvases)
  --------------------------------------------------------- */
  class Starfield {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.density = opts.density || 0.00016;
      this.speed = opts.speed || 0.15;
      this.colorStops = opts.colors || ['#ffffff', '#8B5CF6', '#60A5FA'];
      this.stars = [];
      this.running = false;
      this.resize = this.resize.bind(this);
      this.tick = this.tick.bind(this);
      this.resize();
      window.addEventListener('resize', this.resize);
    }
    resize() {
      const parent = this.canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      this.canvas.width = w * (window.devicePixelRatio || 1);
      this.canvas.height = h * (window.devicePixelRatio || 1);
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      this.w = w;
      this.h = h;
      const count = Math.max(40, Math.floor(w * h * this.density));
      this.stars = new Array(count).fill(0).map(() => this.makeStar());
    }
    makeStar() {
      return {
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: Math.random() * 1.4 + 0.3,
        alpha: Math.random(),
        delta: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
        color: this.colorStops[Math.floor(Math.random() * this.colorStops.length)],
        vy: Math.random() * this.speed + 0.02
      };
    }
    tick() {
      if (!this.running) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      for (const s of this.stars) {
        s.alpha += s.delta;
        if (s.alpha <= 0 || s.alpha >= 1) s.delta *= -1;
        s.y += s.vy;
        if (s.y > this.h) { s.y = -2; s.x = Math.random() * this.w; }
        ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(this.tick);
    }
    start() {
      if (this.running) return;
      this.running = true;
      requestAnimationFrame(this.tick);
    }
    stop() { this.running = false; }
  }

  /* ---------------------------------------------------------
     LOADING SCREEN
  --------------------------------------------------------- */
  const loadingScreen = document.getElementById('loading-screen');
  const loadingStarsCanvas = document.getElementById('loading-stars');
  const loadingField = new Starfield(loadingStarsCanvas, { density: 0.0002, speed: 0.1 });
  loadingField.start();

  const MIN_LOAD_TIME = 2600;
  const startTime = Date.now();

  function hideLoadingScreen() {
    const elapsed = Date.now() - startTime;
    const wait = Math.max(0, MIN_LOAD_TIME - elapsed);
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      loadingField.stop();
      setTimeout(() => { loadingScreen.style.display = 'none'; }, 1100);
    }, wait);
  }

  if (document.readyState === 'complete') {
    hideLoadingScreen();
  } else {
    window.addEventListener('load', hideLoadingScreen);
    setTimeout(hideLoadingScreen, 4500); // safety fallback
  }

  /* ---------------------------------------------------------
     HERO — Starfield + Floating Hearts
  --------------------------------------------------------- */
  const heroStarsCanvas = document.getElementById('hero-stars');
  const heroField = new Starfield(heroStarsCanvas, { density: 0.00018, speed: 0.12 });
  heroField.start();

  const heartsLayer = document.getElementById('hearts-layer');
  const heartSymbols = ['❤', '💜', '💗'];

  function spawnHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
    const size = Math.random() * 16 + 12;
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = size + 'px';
    heart.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    const duration = Math.random() * 6 + 7;
    heart.style.animationDuration = duration + 's';
    heartsLayer.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000 + 200);
  }
  for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 900);
  setInterval(spawnHeart, 1500);

  /* ---------------------------------------------------------
     MUSIC
  --------------------------------------------------------- */
  const music = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  let musicPlaying = false;

  function playMusic() {
    music.volume = 0.55;
    const p = music.play();
    if (p && p.catch) p.catch(() => { /* autoplay blocked or file missing — ignore */ });
    musicPlaying = true;
    musicToggle.classList.add('playing');
    musicToggle.classList.remove('hidden');
  }
  function pauseMusic() {
    music.pause();
    musicPlaying = false;
    musicToggle.classList.remove('playing');
  }
  musicToggle.addEventListener('click', () => {
    if (musicPlaying) pauseMusic(); else playMusic();
  });

  /* ---------------------------------------------------------
     START THE JOURNEY
  --------------------------------------------------------- */
  const startBtn = document.getElementById('start-journey');
  const letterSection = document.getElementById('letter');

  startBtn.addEventListener('click', () => {
    playMusic();
    letterSection.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     SECTION 3 — LOVE LETTER TYPING ANIMATION
  --------------------------------------------------------- */
  const letterText = document.getElementById('letter-text');
  const continueBtn = document.getElementById('continue-letter');

  const letterLines = [
    'Dear Grace,',
    '',
    'Happy Birthday.',
    '',
    'I hope this little website can make you smile today.',
    'Thank you for being one of the best parts of my life.',
    '',
    'May God bless every step you take.',
    'May happiness always find you.',
    'May your dreams come true.',
    'And may your beautiful smile never fade.',
    '',
    'Happy Birthday.',
    '',
    'Love,',
    'Bonaldi ❤'
  ];

  let letterTyped = false;

  function typeLetter() {
    if (letterTyped) return;
    letterTyped = true;

    const fullText = letterLines.join('\n');
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';

    function step() {
      if (i <= fullText.length) {
        letterText.textContent = fullText.slice(0, i);
        letterText.appendChild(cursor);
        i += 2;
        const char = fullText[i - 1];
        const delay = char === '\n' ? 140 : 16;
        setTimeout(step, delay);
      } else {
        cursor.remove();
        continueBtn.classList.add('visible');
      }
    }
    step();
  }

  const letterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        typeLetter();
        letterObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  letterObserver.observe(letterSection);

  const gallerySection = document.getElementById('gallery');
  continueBtn.addEventListener('click', () => {
    gallerySection.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     SECTION 4 — GALLERY + LIGHTBOX
  --------------------------------------------------------- */
  const galleryCards = document.querySelectorAll('.gallery-card');
  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), idx * 90);
        galleryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  galleryCards.forEach((card) => galleryObserver.observe(card));

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  galleryCards.forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });
  function closeLightbox() { lightbox.classList.remove('open'); }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------------------------------------------------------
     SECTION 5 — LOVE CARDS STAGGER
  --------------------------------------------------------- */
  const loveCards = document.querySelectorAll('.love-card');
  const loveObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Array.from(loveCards).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('in-view'), idx * 120);
        loveObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  loveCards.forEach((card) => loveObserver.observe(card));

  /* ---------------------------------------------------------
     SECTION 6 — WISHES STARFIELD + LINE REVEAL
  --------------------------------------------------------- */
  const wishesStarsCanvas = document.getElementById('wishes-stars');
  const wishesField = new Starfield(wishesStarsCanvas, { density: 0.00014, speed: 0.08 });
  const wishesSection = document.getElementById('wishes');

  const wishesSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) wishesField.start(); else wishesField.stop();
    });
  }, { threshold: 0.05 });
  wishesSectionObserver.observe(wishesSection);

  const wishLines = document.querySelectorAll('#wishes-card [data-line]');
  const wishObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = Array.from(wishLines).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('in-view'), idx * 260);
        wishObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  wishLines.forEach((line) => wishObserver.observe(line));

  /* ---------------------------------------------------------
     SECTION 7 — GIFT BOX + CONFETTI / FIREWORKS / HEARTS
  --------------------------------------------------------- */
  const giftBox = document.getElementById('gift-box');
  const giftHint = document.getElementById('gift-hint');
  const giftMessage = document.getElementById('gift-message');
  const giftTitle = document.getElementById('gift-title');
  const giftFxCanvas = document.getElementById('gift-fx');
  const giftSection = document.getElementById('gift');
  const fxCtx = giftFxCanvas.getContext('2d');

  let fxParticles = [];
  let fxRunning = false;

  function resizeFxCanvas() {
    const w = giftSection.clientWidth;
    const h = giftSection.clientHeight;
    giftFxCanvas.width = w * (window.devicePixelRatio || 1);
    giftFxCanvas.height = h * (window.devicePixelRatio || 1);
    giftFxCanvas.style.width = w + 'px';
    giftFxCanvas.style.height = h + 'px';
    fxCtx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  }
  resizeFxCanvas();
  window.addEventListener('resize', resizeFxCanvas);

  const fxColors = ['#8B5CF6', '#EC4899', '#60A5FA', '#FFFFFF', '#FBBF24'];

  function makeConfetti(cx, cy) {
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      fxParticles.push({
        type: 'confetti',
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        gravity: 0.18,
        size: Math.random() * 6 + 4,
        color: fxColors[Math.floor(Math.random() * fxColors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 20,
        life: 1,
        decay: Math.random() * 0.004 + 0.003
      });
    }
  }

  function makeHearts(cx, cy) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      fxParticles.push({
        type: 'heart',
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        gravity: 0.05,
        size: Math.random() * 14 + 10,
        color: Math.random() < 0.5 ? '#EC4899' : '#8B5CF6',
        life: 1,
        decay: Math.random() * 0.006 + 0.006
      });
    }
  }

  function makeFirework(cx, cy) {
    const color = fxColors[Math.floor(Math.random() * fxColors.length)];
    const count = 40;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 4 + 3;
      fxParticles.push({
        type: 'spark',
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.05,
        size: Math.random() * 2.5 + 1.5,
        color,
        life: 1,
        decay: Math.random() * 0.012 + 0.012
      });
    }
  }

  function drawHeartShape(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.4, x, y + size);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.4, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  function fxTick() {
    if (!fxRunning) return;
    fxCtx.clearRect(0, 0, giftFxCanvas.width, giftFxCanvas.height);
    fxParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life -= p.decay;
      fxCtx.globalAlpha = Math.max(0, p.life);
      fxCtx.fillStyle = p.color;
      if (p.type === 'confetti') {
        p.rotation += p.rotSpeed;
        fxCtx.save();
        fxCtx.translate(p.x, p.y);
        fxCtx.rotate((p.rotation * Math.PI) / 180);
        fxCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        fxCtx.restore();
      } else if (p.type === 'heart') {
        drawHeartShape(fxCtx, p.x, p.y, p.size);
      } else {
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fxCtx.fill();
      }
    });
    fxCtx.globalAlpha = 1;
    fxParticles = fxParticles.filter((p) => p.life > 0 && p.y < giftFxCanvas.clientHeight + 60);
    if (fxParticles.length > 0) {
      requestAnimationFrame(fxTick);
    } else {
      fxRunning = false;
    }
  }

  function startFx() {
    if (!fxRunning) {
      fxRunning = true;
      requestAnimationFrame(fxTick);
    }
  }

  let giftOpened = false;
  function openGift() {
    if (giftOpened) return;
    giftOpened = true;
    giftBox.classList.add('opened');
    giftHint.classList.add('done');
    giftTitle.textContent = 'Happy Birthday, Grace!';

    const rect = giftBox.getBoundingClientRect();
    const sectionRect = giftSection.getBoundingClientRect();
    const cx = rect.left - sectionRect.left + rect.width / 2;
    const cy = rect.top - sectionRect.top + rect.height / 2;

    makeConfetti(cx, cy);
    makeHearts(cx, cy);
    startFx();

    let fireworkCount = 0;
    const fireworkInterval = setInterval(() => {
      const fx = Math.random() * giftSection.clientWidth;
      const fy = Math.random() * giftSection.clientHeight * 0.5;
      makeFirework(fx, fy);
      startFx();
      fireworkCount++;
      if (fireworkCount >= 5) clearInterval(fireworkInterval);
    }, 400);

    setTimeout(() => giftMessage.classList.add('shown'), 500);
  }
  giftBox.addEventListener('click', openGift);

  /* ---------------------------------------------------------
     SECTION 8 — FINAL STARFIELD + REPLAY
  --------------------------------------------------------- */
  const finalStarsCanvas = document.getElementById('final-stars');
  const finalField = new Starfield(finalStarsCanvas, { density: 0.00012, speed: 0.06 });
  const finalSection = document.getElementById('final');

  const finalSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) finalField.start(); else finalField.stop();
    });
  }, { threshold: 0.05 });
  finalSectionObserver.observe(finalSection);

  const heroSection = document.getElementById('hero');
  const replayBtn = document.getElementById('replay-journey');
  replayBtn.addEventListener('click', () => {
    heroSection.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     HERO STARFIELD lifecycle (pause off-screen for perf)
  --------------------------------------------------------- */
  const heroSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) heroField.start(); else heroField.stop();
    });
  }, { threshold: 0.05 });
  heroSectionObserver.observe(heroSection);

})();

// 🕘 Target time = 26 Feb 2026 at 09:00 (local Copenhagen time)
const TARGET_DATE = new Date("2026-02-26T09:00:00");

const countdownEl = document.getElementById("countdown");
const countdownScreen = document.getElementById("countdownScreen");
const cardScreen = document.getElementById("cardScreen");
const card = document.getElementById("card");

// ---------- COUNTDOWN ----------

function updateCountdown() {
  const now = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) {
    launchCard();
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ---------- REVEAL CARD ----------

function launchCard() {
  // hide countdown
  countdownScreen.classList.remove("active");
  countdownScreen.classList.add("hidden");

  // show card
  cardScreen.classList.remove("hidden");
  cardScreen.classList.add("active");

  // open automatically after delay
  setTimeout(() => {
    openCard();
  }, 1500);
}

// ---------- OPEN CARD BUTTON ----------

const openBtn = document.getElementById("openBtn");
openBtn.addEventListener("click", openCard);

let opened = false;

function openCard() {
  const now = new Date();

  // ❌ Prevent opening before 09:00
  if (now < TARGET_DATE) {
    // optional small feedback animation
    countdownEl.classList.add("shake");
    setTimeout(() => countdownEl.classList.remove("shake"), 400);
    return;
  }

  if (opened) return;
  opened = true;

  card.classList.add("open");

  createConfettiBurst();  // 🎊
  playMusic();            // 🎵
}

// ---------- MUSIC (Web Audio version so no mp3 needed) ----------

function playMusic() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const notes = [
    392,392,440,392,523,494,
    392,392,440,392,587,523,
    392,392,784,659,523,494,440,
    698,698,659,523,587,523
  ];

  let time = ctx.currentTime;

  notes.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = freq;
    osc.type = "triangle";

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.3, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);

    osc.start(time);
    osc.stop(time + 0.5);

    time += 0.5;
  });
}


// ---------- CONFETTI SYSTEM ----------

const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");

let confetti = [];
let W, H;

function resizeCanvas() {
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createConfettiBurst() {
  const centerX = W / 2;
  const centerY = H / 2;

  for (let i = 0; i < 180; i++) {
    confetti.push({
      x: centerX,
      y: centerY,
      vx: random(-6, 6),
      vy: random(-8, -2),
      gravity: 0.2,
      size: random(4, 8),
      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-0.2, 0.2),
      color: `hsl(${random(0, 360)}, 90%, 60%)`,
      life: random(80, 140)
    });
  }
}

function updateConfetti() {
  ctx.clearRect(0, 0, W, H);

  confetti = confetti.filter(p => p.life > 0);

  confetti.forEach(p => {
    p.life--;
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  });

  requestAnimationFrame(updateConfetti);
}

updateConfetti();
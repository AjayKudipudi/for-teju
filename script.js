/* ============================================================
   ✏️  EDIT ME: everything personal lives here
   ============================================================ */
const CONFIG = {
  herName: "Teju",             // what you call her (used everywhere)
  yourName: "Ajay",            // your name
  pandaName: "Bao",            // the panda messenger

  quiz: {
    question: "Pop quiz! What's {you}'s favourite thing in the whole world?",
    options: ["Coffee ☕", "Writing code 💻", "Sleeping 😴", "You, obviously 💖"],
    answer: 3,
    wrongReplies: ["Pehhh, close… but no 😤 *shuffle shuffle*", "He loves it, but not THE most 🔀", "Nope! Try again 🐼"],
  },

  letter:
`Dear {her},

Nenu maatallo baaga cheppalenu. Anduke raastunnaa.

Nuvvu eppudu antaav kada, "nuvvu asalu ekkuva maatladavu" ani. Nijame. Naa daggara chaala topics undavu. But what you don't know is how much I love listening to you.

Gurthundaa, manam first time maatladukunnappudu? Six hours kanna ekkuva maatladukunnam. Ekkuva maatladani nenu, okarito antha sepu maatladana ani, naake nene shock ayya.

Neetho maatladutunte, chaala close friend tho maatladutunnattu anipinchindi. Chaala comfortable ga feel ayyaanu. Asalu time eh teliyaledu.

Aa roju, aa moment lone anukunna: nuvvu life long naatho unte, nenu eppudu happy ga untaanu ani.

And honestly, it's still the same. Every conversation with you, even the silly ones about nothing, is still my favourite part of the day.

Idi varaku nenu goppa vaadini ayipovaalani, ekkadekkadiko vellipovaalani anukune vaadini. I thought a big life meant going somewhere far.

Kaani ippudu neeto paatu nee cheyi pattukuni nadiste chaalanipistundi. Neetho kalisi unte chaalanipistundi.

Somewhere along the way, I realised that what I was searching for was never a place. It was a person. It was you.

Naaku ippudu pedda pedda kalalu levu. Naa korikalu chaala chinnavi:
udayanne lechi ninnu chudali,
prathi chinna vishayam neetho cheppali,
neetho godava padali,
lifelong nee cheyi pattukoni nadavali.

Nenu perfect kaadu, {her}. Kaani nee kosam prathi roju konchem better avvadaniki try chestaanu. Idi naa promise.

Naa life lo vachinanduku thank you, {her}.

I love you. Entha istamo maatallo cheppalenu, kaani prathi roju chupistaanu. ❤️

Prematho,
{you} 🐼`,

  // Google Sheet web-app URL that saves her answers (setup steps: ../SAVE-ANSWERS.md, kept outside this folder so it is not published). Empty = nothing is saved.
  // Add ?test to the link when you try it yourself, so your own taps aren't saved.
  logUrl: "https://script.google.com/macros/s/AKfycbwudzi5YatJnwEADQifhTG13O6GOfeI2CocpfACRuPQVdWgi5p-lgC5uvwLoBf0zDGR/exec",

  finalMessage: "Best merge of my life. I love you more than pandas love bamboo, and that's a lot. 💖",
};

/* ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fill = (s) => s.replaceAll("{her}", CONFIG.herName).replaceAll("{you}", CONFIG.yourName).replaceAll("{panda}", CONFIG.pandaName);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// playful teasing first, then sweet, then the big moment
const STEPS = ["hello", "q1", "q2", "q3", "pretty", "annoying", "who", "quiz", "letter", "kneel", "hold", "final", "yes"];
const BUBBLES = {
  hello: ["psst… it's me! 🐼", "wave"],
  q1: ["Careful how you answer… 👀", "proud"],
  q2: ["I can already see you smiling 😏", "proud"],
  q3: ["Be honest 🥺", "happy"],
  pretty: ["Ooh, this one's personal 😤", "proud"],
  who: ["Ooh, the big debate 👀", "proud"],
  quiz: ["Pop quiz time! 📝", "happy"],
  annoying: ["Pehhh, tricky one 🤔", "shock"],
  letter: ["{you} wrote you something 💌", "love"],
  kneel: ["Shhh… watch this 🤫", "love"],
  hold: ["Hold my paw, okay? 🐾", "happy"],
  final: ["This is the big one… 💍", "shock"],
  yes: ["YAYYY!!! 🎉💖", "love"],
};

const app = $("#app");
const panda = $("#panda");
const bubble = $("#bubble");
let current = null;

/* ---------- memories: every answer goes to Ajay's Google Sheet ---------- */
const logOn = !!CONFIG.logUrl && !new URLSearchParams(location.search).has("test");
const session = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const device = (navigator.userAgent.match(/\(([^)]+)\)/) || [, ""])[1].slice(0, 60);
let logQueue = [], logTimer = null, pageSince = performance.now();
function log(kind, detail = "") {
  if (!logOn) return;
  logQueue.push({ t: new Date().toISOString(), s: session, page: current || "start", kind, detail: String(detail).slice(0, 2000),
    sec: Math.round((performance.now() - pageSince) / 1000), dev: device });
  clearTimeout(logTimer);
  logTimer = setTimeout(flushLog, 2000);
}
function flushLog() {
  if (!logQueue.length) return;
  const body = JSON.stringify(logQueue);
  logQueue = [];
  // text/plain keeps it a simple request (no CORS preflight); keepalive lets it finish if she closes the tab
  fetch(CONFIG.logUrl, { method: "POST", mode: "no-cors", keepalive: true, body }).catch(() => {});
}
addEventListener("pagehide", flushLog);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushLog(); });
// every button she taps, with what it said at that moment
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b && b.id !== "noteSend") log("tapped", b.textContent.trim().replace(/\s+/g, " "));
}, true);

/* ---------- names into the page ---------- */
$$("[data-her]").forEach((e) => (e.textContent = CONFIG.herName));
$$("[data-you]").forEach((e) => (e.textContent = CONFIG.yourName));
$$("[data-panda]").forEach((e) => (e.textContent = CONFIG.pandaName));
document.title = `For ${CONFIG.herName} 🐼`;

/* ---------- little feedback helpers ---------- */
let audio;
function sfx(kind = "pop") {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const notes = { pop: [660, 990], boing: [300, 180], yay: [523, 659, 784, 1046], ding: [880, 1320] }[kind];
    notes.forEach((f, i) => {
      const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + i * 0.09;
      o.type = kind === "boing" ? "triangle" : "sine";
      o.frequency.setValueAtTime(f, t);
      if (kind === "boing") o.frequency.exponentialRampToValueAtTime(f / 2, t + 0.18);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g).connect(audio.destination);
      o.start(t); o.stop(t + 0.25);
    });
  } catch {}
}

// iOS has no navigator.vibrate; best effort only
function buzz(ms = 12) { try { navigator.vibrate?.(ms); } catch {} }

function say(text, mood) {
  bubble.textContent = fill(text);
  bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
  if (mood) setMood(mood);
}
function setMood(m) {
  panda.dataset.mood = m;
  // restart one-shot mood animations
  panda.style.animation = "none"; void panda.offsetWidth; panda.style.animation = "";
}

let toastTimer;
function toast(text) {
  const t = $("#toast");
  t.textContent = fill(text);
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* little hearts fly out of a pressed button */
function burstFrom(el, n = 8, set = ["💖", "💕", "✨", "💗"]) {
  if (reduced) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "burst";
    s.textContent = set[i % set.length];
    const a = rand(-Math.PI * 0.95, -Math.PI * 0.05); // upward fan
    const d = rand(60, 130);
    s.style.setProperty("--x", r.left + r.width / 2 - 11 + "px");
    s.style.setProperty("--y", r.top + r.height / 2 - 11 + "px");
    s.style.setProperty("--dx", Math.cos(a) * d + "px");
    s.style.setProperty("--dy", Math.sin(a) * d + "px");
    s.addEventListener("animationend", () => s.remove());
    document.body.appendChild(s);
  }
}

/**
 * A "yes" that plays along before moving on: each tap shows the next beat
 * ([button label, Bao's thought, mood]); the tap after the last beat finishes.
 */
function teaseYes(btn, beats, onDone) {
  const original = btn.innerHTML;
  let i = 0, done = false;
  btn.addEventListener("click", () => {
    if (done) return;
    burstFrom(btn, i < beats.length ? 6 : 12);
    if (i < beats.length) {
      const [label, line, mood] = beats[i++];
      btn.textContent = fill(label);
      btn.animate([{ transform: "scale(1)" }, { transform: "scale(1.12) rotate(-2deg)" }, { transform: "scale(1)" }],
        { duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
      say(line, mood);
      sfx("ding"); buzz();
    } else {
      done = true;
      sfx("yay"); buzz(30);
      setTimeout(onDone, 650);
    }
  });
  return () => { i = 0; done = false; btn.innerHTML = original; };
}

function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

/* ---------- progress ---------- */
const progress = $("#progress");
STEPS.forEach(() => progress.appendChild(Object.assign(document.createElement("i"), { className: "seg" })));

/* ---------- navigation ---------- */
const onEnter = {};
function go(step) {
  restoreFloaters();
  log("left page", `→ ${step}`);
  pageSince = performance.now();
  if (step === "hello") startHearts(); else stopHearts();
  const prev = current && $(`.screen[data-step="${current}"]`);
  if (prev) {
    prev.classList.remove("active"); prev.classList.add("leaving"); prev.inert = true;
    setTimeout(() => prev.classList.remove("leaving"), 500);
  }
  const next = $(`.screen[data-step="${step}"]`);
  next.inert = false;
  next.classList.add("active");
  current = step;
  app.dataset.step = step;

  const idx = STEPS.indexOf(step);
  $$(".seg", progress).forEach((s, i) => {
    s.classList.toggle("done", i < idx);
    s.classList.toggle("now", i === idx);
  });

  const [line, mood] = BUBBLES[step];
  say(line, mood);
  onEnter[step]?.();
}
const nextStep = () => go(STEPS[STEPS.indexOf(current) + 1]);
$$(".screen").forEach((s) => (s.inert = true));
$$("[data-next]").forEach((b) => b.addEventListener("click", () => { sfx(); nextStep(); }));

/* ---------- runaway "No" button ---------- */
const floaters = [];

function moveAway(btn, avoid) {
  if (!btn.classList.contains("floater")) {
    const r = btn.getBoundingClientRect();
    const ph = document.createElement("span");
    ph.className = "placeholder";
    ph.style.height = r.height + "px"; // zero width: the Yes button re-centres
    btn.before(ph);
    floaters.push({ btn, ph });
    document.body.appendChild(btn);
    btn.classList.add("floater");
    btn.style.transition = "none";
    // position with the translate property: unlike transform, it isn't shrunk by the button's own scale
    btn.style.translate = `${r.left}px ${r.top}px`;
    void btn.offsetWidth;
    btn.style.transition = "";
  }
  const b = btn.getBoundingClientRect();
  const vw = innerWidth, vh = innerHeight;
  const minY = 70, maxY = vh - b.height - 20;
  // stay clear of the Yes button (with room to grow), Bao, his thoughts, the question, the ring and a visible toast
  const screen = $(".screen.active");
  const pad = (el, m) => { const k = el.getBoundingClientRect(); return { l: k.left - m, t: k.top - m, r: k.right + m, b: k.bottom + m }; };
  const keepOut = [
    ...[].concat(avoid || []).map((a) => pad(a, Array.isArray(avoid) ? 14 : 34)),
    ...($("#toast").classList.contains("show") ? [pad($("#toast"), 12)] : []),
    ...[$("#pandaWrap"), $("#bubble"), ...(screen ? $$("h2, .sub, .ringbox", screen) : [])].map((el) => pad(el, 12)),
  ];
  const hits = (x, y) => keepOut.filter((k) => !(x + b.width < k.l || x > k.r || y + b.height < k.t || y > k.b)).length;
  // first clear spot that isn't right next to where it was; otherwise the least crowded one
  let best = null;
  for (let i = 0; i < 80; i++) {
    const cx = rand(16, vw - b.width - 16), cy = rand(minY, maxY);
    const score = hits(cx, cy) * 10 + (Math.hypot(cx - b.left, cy - b.top) > 110 ? 0 : 1);
    if (!best || score < best.score) best = { x: cx, y: cy, score };
    if (score === 0) break;
  }
  const { x, y } = best;
  btn.style.translate = `${x}px ${y}px`;
  btn.style.rotate = `${rand(-5, 5).toFixed(1)}deg`;
}

function restoreFloaters() {
  while (floaters.length) {
    const { btn, ph } = floaters.pop();
    btn.classList.remove("floater");
    btn.style.translate = ""; btn.style.rotate = "";
    ph.replaceWith(btn);
  }
}

/**
 * Turn a button into a teasing runaway.
 * labels[i] is shown after the i-th dodge; on the last try it gives up and becomes a yes.
 */
function runaway(btn, { yes, labels, lines, giveUpLabel, onGiveUp, growYes = true, shrinkSelf = true }) {
  let tries = 0;
  const surrendered = () => btn.dataset.surrender === "1";

  const dodge = (e) => {
    if (surrendered()) return;
    e.preventDefault();
    tries++;
    log("button ran away", `${btn.textContent.trim()} (#${tries})`);
    buzz(); sfx("boing");
    const last = tries >= labels.length;
    if (last) {
      btn.dataset.surrender = "1";
      btn.textContent = giveUpLabel;
      btn.classList.replace("btn-no", "btn-yes");
      btn.style.scale = "1.05";
    } else {
      btn.textContent = labels[tries - 1];
      if (shrinkSelf) btn.style.scale = Math.max(1 - tries * 0.06, 0.7).toFixed(2);
    }
    if (growYes && yes) yes.style.scale = Math.min(1 + tries * 0.1, 1.5).toFixed(2);
    const l = lines?.[Math.min(tries - 1, lines.length - 1)];
    if (l) say(l[0], l[1]);
    moveAway(btn, yes);
  };

  btn.addEventListener("pointerdown", dodge);
  btn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") dodge(e); });
  btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") dodge(e); });
  btn.addEventListener("click", (e) => { if (surrendered()) onGiveUp(); else e.preventDefault(); });

  return () => {
    tries = 0;
    delete btn.dataset.surrender;
    btn.textContent = "No";
    btn.classList.replace("btn-yes", "btn-no");
    btn.style.scale = "";
    if (yes) yes.style.scale = "";
  };
}

/* ---------- q1: how much do you like Ajay? "Konchem" shrinks away, "Chaaala" fills up as she taps ---------- */
let q1Small = 0;
const smallLines = [
  ["Pehhh, only konchem? 🤨", "shock"],
  ["Even smaller?? 😤", "sad"],
  ["I can barely see it 🔍", "sad"],
  ["Pehhh, that one was too small to even see 😂", "proud"],
];
$("#q1Small").addEventListener("click", () => {
  const small = $("#q1Small"), big = $("#q1Big");
  q1Small++;
  buzz(); sfx("boing"); shake(small);
  say(...smallLines[Math.min(q1Small - 1, smallLines.length - 1)]);
  small.style.scale = Math.max(1 - q1Small * 0.22, 0.3).toFixed(2); // "konchem" literally gets smaller
  big.style.scale = Math.min(1 + q1Small * 0.05, 1.2).toFixed(2);
  if (q1Small >= 4) { small.style.opacity = "0"; small.style.pointerEvents = "none"; }
});
// "Chaaala" is a meter: tap fast to fill it (the word stretches as it fills), it drains if she stops
const CHAALA = [3, 5, 7, 9, 11].map((n) => `Ch${"a".repeat(n)}la 🫶`);
const CHAALA_LINES = [
  ["Chaaala? 😏 Prove it! Tap tap tap, fast", "proud"],
  ["Pehhh, more 'a's! 😆", "proud"],
  ["Chaaaaaaala 😄 keep going!", "love"],
  ["Okay okay, Bao believes you 🙈", "love"],
];
const big = $("#q1Big"), bigHTML = big.innerHTML;
let fillTaps = 0, fillLvl = 0, fillLastTap = 0, fillTimer = null, fillDone = false, fillStage = -1;
function paintFill() {
  const p = Math.min(fillLvl, 1);
  big.querySelector(".meter").style.transform = `scaleX(${p})`;
  const stage = Math.min(Math.floor(p * CHAALA.length), CHAALA.length - 1);
  big.querySelector(".lbl").textContent = CHAALA[stage];
  if (stage !== fillStage && stage < CHAALA_LINES.length) { fillStage = stage; say(...CHAALA_LINES[stage]); }
}
big.addEventListener("click", () => {
  if (fillDone) return;
  if (!big.classList.contains("meter-btn")) {
    big.classList.add("meter-btn");
    big.innerHTML = '<span class="meter"></span><span class="lbl"></span>';
    fillTimer = setInterval(() => { // drains a little when she stops tapping
      if (performance.now() - fillLastTap > 600 && fillLvl > 0) { fillLvl = Math.max(fillLvl - 0.05, 0); paintFill(); }
    }, 120);
  }
  fillLastTap = performance.now(); fillTaps++;
  fillLvl += 0.17;
  sfx("pop"); buzz(8);
  burstFrom(big, 3, ["💗", "🫶", "✨"]);
  paintFill();
  if (fillLvl >= 1) {
    fillDone = true; clearInterval(fillTimer);
    log("ANSWER", `How much do you like ${CONFIG.yourName}? → Chaaala (tapped ${fillTaps} times, Konchem tapped ${q1Small} times)`);
    say("Noted 📝 And {you} likes you chaaaaaala too… actually even more 🫶", "love");
    burstFrom(big, 14); sfx("yay");
    toast("Chaaaaaala, confirmed 💖");
    setTimeout(nextStep, 2000);
  }
});
onEnter.q1 = () => {
  q1Small = 0;
  const small = $("#q1Small");
  small.style.scale = ""; small.style.opacity = ""; small.style.pointerEvents = "";
  clearInterval(fillTimer);
  fillTaps = 0; fillLvl = 0; fillDone = false; fillStage = -1;
  big.style.scale = "";
  big.classList.remove("meter-btn");
  big.innerHTML = bigHTML;
};

/* ---------- q2: smile when his name pops up ---------- */
// "Every single time" makes her catch it first: it dodges 3 times (label stays), Bao teases on every miss
const smEvery = $("#smEvery");
const EVERY_DODGES = [
  ["Ohooo, every single time? 😏 Then catch it!", "proud"],
  ["Pehhh, missed! 😜 Try again", "proud"],
  ["Almost! Okay okay, one more try 🤭", "proud"],
];
let everyDodges = 0, lastEveryDodge = 0, everyDone = false;
smEvery.addEventListener("pointerdown", (e) => {
  if (everyDodges >= EVERY_DODGES.length) return;
  e.preventDefault();
  const [line, mood] = EVERY_DODGES[everyDodges++];
  log("missed catching", `Every single time (#${everyDodges})`);
  lastEveryDodge = performance.now();
  buzz(); sfx("boing");
  say(line, mood);
  moveAway(smEvery, [$("#smSome"), $("#smNever")]);
});
smEvery.addEventListener("click", (e) => {
  // a dodge never counts as a press
  if (everyDodges < EVERY_DODGES.length || performance.now() - lastEveryDodge < 700 || everyDone) return;
  everyDone = true;
  log("ANSWER", `Smile when his name pops up? → Every single time (caught it${someTapped ? ", after saying Only sometimes" : ""}${neverTaps ? `, tapped Never ${neverTaps}x` : ""})`);
  burstFrom(smEvery, 14, ["😊", "📱", "💗"]); sfx("yay"); buzz(30);
  say("Caught it 😏 Guess what… {you} smiles exactly like that when your name pops up too 📱🫶", "love");
  toast("Same here, says {you} 😊📱");
  setTimeout(nextStep, 2400);
});
// "Only sometimes" makes Bao properly angry
let someTapped = false;
$("#smSome").addEventListener("click", () => {
  const b = $("#smSome");
  if (!someTapped) {
    someTapped = true;
    sfx("boing"); buzz(); shake(b);
    b.textContent = "Okay okay… always 🙈";
    say("Pehhhhhh 😤💢 Only SOMETIMES?? Bao is very angry now", "angry");
  } else {
    burstFrom(b, 10); sfx("yay");
    log("ANSWER", "Smile when his name pops up? → Only sometimes… then Okay okay, always");
    say("Hmph. Okay, forgiven 😤💗 {you} smiles every single time your name pops up, btw 📱", "love");
    toast("Knew it 😏💗");
    setTimeout(nextStep, 2400);
  }
});
// "Never" doesn't survive long
let neverTaps = 0;
$("#smNever").addEventListener("click", () => {
  const b = $("#smNever");
  neverTaps++;
  sfx("boing"); buzz(); shake(b);
  if (neverTaps === 1) {
    say("Never?? 😭 Pehhh, Bao saw you smiling just now", "cry");
    b.style.scale = "0.75";
  } else {
    say("Liar detected. Button removed 😌", "proud");
    b.style.scale = "0.3"; b.style.opacity = "0"; b.style.pointerEvents = "none";
  }
});
onEnter.q2 = () => {
  everyDodges = 0; lastEveryDodge = 0; everyDone = false;
  someTapped = false; neverTaps = 0;
  $("#smSome").textContent = "Only sometimes 🤏";
  const n = $("#smNever");
  n.style.scale = ""; n.style.opacity = ""; n.style.pointerEvents = "";
};

/* ---------- q3: slide to confess; "No" just makes Bao push the slider for her ---------- */
const slider = $("#q3Slide"), knob = $(".knob", slider), slideFill = $(".slide-fill", slider), slideText = $(".slide-text", slider);
let slideX = 0, sliding = false, slideStartX = 0, slideStartPos = 0, slideDone = false, q3tries = 0;
const slideMax = () => slider.clientWidth - knob.offsetWidth - 8;
function setSlide(x, animate = false) {
  slideX = Math.max(0, Math.min(x, slideMax()));
  const ease = animate ? "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)" : "none";
  knob.style.transition = slideFill.style.transition = ease;
  knob.style.transform = `translateX(${slideX}px)`;
  slideFill.style.transform = `scaleX(${(slideX + knob.offsetWidth + 4) / slider.clientWidth})`;
  if (!slideDone) slideText.style.opacity = String(Math.max(1 - (slideX / slideMax()) * 1.4, 0));
  slider.setAttribute("aria-valuenow", String(Math.round((slideX / slideMax()) * 100)));
}
function finishSlide(line) {
  if (slideDone) return;
  slideDone = true;
  log("ANSWER", `Did you miss him today? → I missed him a lot (${q3tries ? `after tapping No ${q3tries}x` : "slid it herself"})`);
  setSlide(slideMax(), true);
  slider.classList.add("done");
  slideText.textContent = "I missed him a lot 🥺";
  slideText.style.opacity = "1";
  say(line, "love");
  burstFrom(slider, 14); sfx("yay"); buzz(30);
  toast("He missed you more 💗");
  setTimeout(nextStep, 1500);
}
slider.addEventListener("pointerdown", (e) => {
  if (slideDone) return;
  sliding = true;
  slider.setPointerCapture?.(e.pointerId);
  slideStartX = e.clientX; slideStartPos = slideX;
  sfx("pop");
});
slider.addEventListener("pointermove", (e) => { if (sliding) setSlide(slideStartPos + e.clientX - slideStartX); });
const endSlide = () => {
  if (!sliding || slideDone) return;
  sliding = false;
  if (slideX >= slideMax() * 0.88) return finishSlide("Awww 🥹 he missed you too");
  if (slideX > slideMax() * 0.25) say("Pehhh, only halfway? 🤨 All the way!", "proud");
  setSlide(0, true);
};
["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => slider.addEventListener(ev, endSlide));
slider.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "Enter") finishSlide("Awww 🥹 he missed you too"); });
$("#q3No").addEventListener("click", () => {
  if (slideDone) return;
  q3tries++;
  buzz(); sfx("boing");
  const no = $("#q3No");
  if (q3tries === 1) { setSlide(slideMax() * 0.4, true); say("Pehhh, wrong way! Let Bao help you slide 😏", "proud"); no.textContent = "Still no 🙄"; }
  else if (q3tries === 2) { setSlide(slideMax() * 0.75, true); say("Almost there… just admit it 🤭", "proud"); no.textContent = "Nooo 🙈"; }
  else finishSlide("Bao slid it for you 😂 he KNOWS you missed him");
});
onEnter.q3 = () => {
  q3tries = 0; slideDone = false; sliding = false;
  slider.classList.remove("done");
  slideText.textContent = 'slide to say "a lot" ›››';
  $("#q3No").textContent = "No";
  setSlide(0);
};

/* ---------- who's prettier: she picks herself, a jealous Bao argues, then gives in ---------- */
let prTries = 0;
const prBeats = [
  ["Are you sure? Look at these cheeks 🐼", "Pehhh, excuse me?! 😤", "shock"],
  ["I have dark circles AND I'm cute 🐼", "Pehhh, I'm literally a celebrity 😤", "sad"],
  ["Okay fine… you win 😭💕", "*sniff* pehhh… you ARE prettier 😭", "cry"],
];
$("#prMe").addEventListener("click", () => {
  const me = $("#prMe"), bao = $("#prBao");
  if (prTries >= prBeats.length) return;
  const [label, line, mood] = prBeats[prTries++];
  bao.textContent = label;
  bao.style.scale = Math.min(1 + prTries * 0.08, 1.2).toFixed(2);
  shake(bao); sfx("boing"); buzz();
  say(line, mood);
  if (prTries === prBeats.length) {
    log("ANSWER", "Who's prettier? → Me 💅 (picked herself 3 times, Bao gave up)");
    burstFrom(me, 12, ["💅", "✨", "👑", "💖"]); sfx("yay");
    $("#prSub").textContent = fill("{you} agrees. He says it's not even close 💖");
    me.disabled = bao.disabled = true;
    setTimeout(() => { say("Fine. But I'm cuter 😌", "proud"); $("#prNext").hidden = false; }, 1500);
  }
});
$("#prBao").addEventListener("click", () => {
  log("ANSWER", `Who's prettier? → ${CONFIG.pandaName} 🐼${prTries ? ` (after picking herself ${prTries}x)` : ""}`);
  sfx("ding"); burstFrom($("#prBao"), 8, ["🐼", "🎋", "✨"]);
  say("Finally, someone honest 😌🐼", "proud");
  toast("Ajay disagrees. He says it's you 💖");
  $("#prMe").disabled = $("#prBao").disabled = true;
  setTimeout(nextStep, 1600);
});
$("#prNext").addEventListener("click", () => { sfx(); nextStep(); });
onEnter.pretty = () => {
  prTries = 0;
  const me = $("#prMe"), bao = $("#prBao");
  me.disabled = bao.disabled = false;
  bao.textContent = `${CONFIG.pandaName} 🐼`; bao.style.scale = "";
  $("#prSub").textContent = "Think carefully. He's very sensitive 🐼";
  $("#prNext").hidden = true;
};

/* ---------- who loves who more: her button shrinks away, only his can be pressed ---------- */
let whoTries = 0;
const whoLines = [
  ["Pehhh, are you sure? 🤭", "proud"],
  ["Bao doesn't believe it 😏", "proud"],
  ["Nope! Try the other one 🙈", "shock"],
  ["That button is shrinking from shyness 🫣", "proud"],
  ["*poof* 💨 it's gone", "proud"],
];
$("#whoHer").addEventListener("click", () => {
  const her = $("#whoHer");
  whoTries++;
  buzz(); sfx("boing"); shake(her);
  say(...whoLines[Math.min(whoTries - 1, whoLines.length - 1)]);
  her.style.scale = Math.max(1 - whoTries * 0.18, 0.2).toFixed(2);
  $("#whoHim").style.scale = Math.min(1 + whoTries * 0.08, 1.35).toFixed(2);
  if (whoTries >= 5) { her.style.opacity = "0"; her.style.pointerEvents = "none"; }
});
$("#whoHim").addEventListener("click", () => {
  const her = $("#whoHer"), him = $("#whoHim");
  log("ANSWER", `Who loves who more? → ${CONFIG.yourName} loves me more → flipped: you both do${whoTries ? ` (tapped "I love him more" ${whoTries}x first)` : ""}`);
  sfx("yay"); buzz(30);
  her.style.opacity = "0"; her.style.pointerEvents = "none";
  him.disabled = true;
  him.classList.add("flipped");
  setMood("stars");
  bubble.textContent = fill("✨ {you} says you both love each other equally 💞");
  bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
  const sub = $("#whoSub");
  sub.textContent = fill("{panda} was just teasing you 😜💕");
  sub.classList.add("who-msg");
  emojiRain(10, ["💞", "✨", "💖", "⭐"]);
  setTimeout(() => ($("#whoNext").hidden = false), 1400);
});
$("#whoNext").addEventListener("click", () => { sfx(); nextStep(); });
onEnter.who = () => {
  whoTries = 0;
  const her = $("#whoHer"), him = $("#whoHim"), sub = $("#whoSub");
  her.style.scale = ""; her.style.opacity = ""; her.style.pointerEvents = "";
  him.style.scale = ""; him.disabled = false; him.classList.remove("flipped");
  sub.textContent = fill("Choose carefully. {panda} is keeping score 🐼");
  sub.classList.remove("who-msg");
  $("#whoNext").hidden = true;
};

/* ---------- quiz ---------- */
// shuffle the answer cards around (animated from where each one was)
function shuffleCards(box) {
  const cards = $$(".opt", box);
  const before = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
  let order;
  do { order = [...cards].sort(() => Math.random() - 0.5); } while (order.every((c, i) => c === cards[i]));
  order.forEach((c) => box.appendChild(c));
  if (reduced) return;
  order.forEach((c) => {
    const a = before.get(c), b = c.getBoundingClientRect();
    c.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: "none" }],
      { duration: 520, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
  });
}
$("#quizQ").textContent = fill(CONFIG.quiz.question);
onEnter.quiz = () => {
  const box = $("#quizOpts");
  box.innerHTML = "";
  let wrongs = 0;
  CONFIG.quiz.options.forEach((label, i) => {
    const b = Object.assign(document.createElement("button"), { className: "opt", textContent: label });
    b.addEventListener("click", () => {
      if (i === CONFIG.quiz.answer) {
        b.classList.add("right"); sfx("ding");
        log("ANSWER", `Quiz → ${label} (wrong guesses first: ${wrongs})`);
        say("Correct!! 💖 You know him so well", "love");
        $$(".opt", box).forEach((o) => (o.disabled = true));
        setTimeout(nextStep, 1100);
      } else if (!b.classList.contains("wrong")) {
        b.classList.add("wrong"); shake(b); buzz(); sfx("boing");
        say(CONFIG.quiz.wrongReplies[wrongs++ % CONFIG.quiz.wrongReplies.length], "sad");
        setTimeout(() => shuffleCards(box), 450);
      }
    });
    box.appendChild(b);
  });
};

/* ---------- annoying? the shrinking "Yes" ---------- */
let annTries = 0;
const annLabels = ["Hmm? 🤨", "Say that again 😠", "Bao is judging you 🐼", "really?", "…"];
const annLines = [["Pehhh. Wow. Okay. 😶", "shock"], ["I'm telling him 😤", "sad"], ["*judging intensifies* 🐼", "proud"], ["That button is getting tired…", "sad"], ["Button deleted by management 😇", "proud"]];
$("#annYes").addEventListener("click", () => {
  const y = $("#annYes");
  annTries++;
  buzz(); sfx("boing");
  say(...annLines[Math.min(annTries - 1, annLines.length - 1)]);
  y.textContent = annLabels[Math.min(annTries - 1, annLabels.length - 1)];
  y.style.scale = Math.max(1 - annTries * 0.17, 0.25).toFixed(2);
  $("#annNo").style.scale = Math.min(1 + annTries * 0.06, 1.25).toFixed(2);
  if (annTries >= 5) { y.style.opacity = "0"; y.style.pointerEvents = "none"; toast("That option has been removed 🫡"); }
});
// "perfect"? Bao doesn't believe it until the lie detector says so, then takes proof
const det = $("#annDet");
let annStage = 0, annTimer = null;
$("#annNo").addEventListener("click", () => {
  const b = $("#annNo");
  if (annStage === 0) {
    annStage = 1;
    sfx("boing"); buzz();
    say("PERFECT?? 🤨 Pehhh, Bao doesn't believe it. Checking… 🔍", "shock");
    $("#annDetRes").textContent = "scanning…";
    det.classList.add("on", "scanning");
    annTimer = setTimeout(() => {
      det.classList.remove("scanning"); det.classList.add("truth");
      $("#annDetRes").textContent = "✅ 100% TRUE";
      sfx("ding"); burstFrom(det, 8, ["✅", "😳", "✨"]);
      say("Pehhh… it's actually true 😳 Tap it once more, Bao needs proof for Ajay 📸", "stars");
      annStage = 2;
    }, 2200);
  } else if (annStage === 2) {
    annStage = 3;
    log("ANSWER", `Is ${CONFIG.yourName} annoying? → No, he's perfect (lie detector: 100% TRUE${annTries ? `, tapped Yes ${annTries}x first` : ""})`);
    sfx("yay"); buzz(30);
    const f = document.createElement("div"); f.className = "flash";
    document.body.appendChild(f); setTimeout(() => f.remove(), 700);
    burstFrom(b, 12, ["😇", "📸", "💖"]);
    say("Screenshot saved 📸 Ajay is framing this one 🖼️", "proud");
    toast("Evidence saved: you said PERFECT 😇");
    setTimeout(nextStep, 1600);
  } else if (annStage === 1) {
    say("Shhh… still scanning 🔍", "shock");
  }
});
onEnter.annoying = () => {
  annTries = 0; annStage = 0; clearTimeout(annTimer);
  const y = $("#annYes");
  y.textContent = "Yes 😤"; y.style.scale = ""; y.style.opacity = ""; y.style.pointerEvents = "";
  $("#annNo").style.scale = "";
  det.classList.remove("on", "scanning", "truth");
};

/* ---------- letter ---------- */
let typing = null;
async function typewrite(el, text, speed = 36) {
  el.textContent = "";
  if (reduced) { el.textContent = text; return; }
  const token = (typing = {});
  const box = el.closest(".letter");
  for (const ch of [...text]) {
    if (typing !== token) return;
    if (token.skip) { el.textContent = text; if (box) box.scrollTop = 0; return; }
    el.textContent += ch;
    if (box) box.scrollTop = box.scrollHeight; // keep the newest words in view as it writes
    await wait(ch === "\n" ? speed * 6 : /[.,!]/.test(ch) ? speed * 5 : speed);
  }
}

$("#envelope").addEventListener("click", async () => {
  const env = $("#envelope");
  if (env.classList.contains("open")) return;
  env.classList.add("open"); sfx("pop"); buzz();
  $("#envHint").hidden = true;
  await wait(reduced ? 0 : 900);
  env.hidden = true;
  $("#letter").hidden = false;
  const body = $("#letterBody");
  $("#letter").onclick = () => typing && (typing.skip = true);
  await typewrite(body, fill(CONFIG.letter));
  $("#letterNext").hidden = false;
  say("He means every word 🥹", "love");
});
$("#letterNext").addEventListener("click", () => { sfx(); nextStep(); });
onEnter.letter = () => {
  typing = null;
  const env = $("#envelope");
  env.classList.remove("open"); env.hidden = false;
  $("#envHint").hidden = false;
  $("#letter").hidden = true; $("#letterBody").textContent = "";
  $("#letterNext").hidden = true;
};

/* ---------- Ajay panda kneels with flowers; "I love you too" → they hug ---------- */
function makeActorPanda(slot, mood, label) {
  const p = panda.cloneNode(true);
  p.removeAttribute("id");
  p.dataset.mood = mood;
  p.setAttribute("aria-label", label);
  slot.replaceChildren(p);
  return p;
}
const ajayPanda = makeActorPanda($("#ajayPanda"), "love", `${CONFIG.yourName} the panda`);
const tejuPanda = makeActorPanda($("#tejuPanda"), "shock", `${CONFIG.herName} the panda`);

$("#loveToo").addEventListener("click", () => {
  const scene = $("#scene");
  if (scene.classList.contains("hug")) return;
  sfx("yay"); buzz(60);
  $("#tejuSay").hidden = false;
  tejuPanda.dataset.mood = "love";
  $("#kneelRow").hidden = true;
  $("#kneelQ").textContent = "Awww 🥹💞";
  // a beat for her line to land, then he stands up and they hug
  setTimeout(() => {
    $("#actorAjay").classList.remove("kneeling");
    scene.classList.add("hug");
    ajayPanda.dataset.mood = "proud";
    tejuPanda.dataset.mood = "proud";
    $("#ajaySay").textContent = "Best hug ever 🥰";
    $("#tejuSay").hidden = true;
    emojiRain(14, ["💖", "💕", "💗", "💞", "🌸"]);
    $("#kneelQ").textContent = "Panda hugs are the best hugs 🐼🤍🐼";
  }, reduced ? 0 : 1100);
  setTimeout(() => ($("#kneelNext").hidden = false), reduced ? 0 : 2600);
});
$("#kneelNext").addEventListener("click", () => { sfx(); nextStep(); });
onEnter.kneel = () => {
  $("#scene").classList.remove("hug");
  $("#actorAjay").classList.add("kneeling");
  ajayPanda.dataset.mood = "love";
  tejuPanda.dataset.mood = "shock";
  $("#ajaySay").textContent = "I love you 💖";
  $("#tejuSay").hidden = true;
  $("#kneelRow").hidden = false;
  $("#kneelNext").hidden = true;
  $("#kneelQ").textContent = fill("{you} has something to tell you… 🥹");
};

/* ---------- hold the paw ---------- */
(() => {
  const paw = $("#paw"), pct = $("#holdPct");
  const HOLD = 3000;
  let start = 0, raf = 0, done = false;

  const tick = () => {
    const p = Math.min((performance.now() - start) / HOLD, 1);
    pct.textContent = Math.round(p * 100) + "%";
    if (p >= 1) return finish();
    if (Math.round(p * 100) % 25 === 0) buzz(8);
    raf = requestAnimationFrame(tick);
  };
  const begin = (e) => {
    if (done) return;
    e.preventDefault();
    paw.setPointerCapture?.(e.pointerId);
    paw.classList.add("holding");
    start = performance.now();
    sfx("pop");
    say("Don't let go… 🥺", "love");
    raf = requestAnimationFrame(tick);
  };
  const cancel = () => {
    if (done || !paw.classList.contains("holding")) return;
    cancelAnimationFrame(raf);
    paw.classList.remove("holding");
    pct.textContent = "0%";
    say("Hey! You let go 😤 try again", "sad");
  };
  const finish = () => {
    done = true;
    paw.classList.remove("holding");
    pct.textContent = "Unlocked 🔓";
    sfx("yay"); buzz(30);
    setTimeout(nextStep, 700);
  };
  paw.addEventListener("pointerdown", begin);
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => paw.addEventListener(ev, cancel));
  paw.addEventListener("contextmenu", (e) => e.preventDefault());
  onEnter.hold = () => { done = false; pct.textContent = "0%"; paw.classList.remove("holding"); };
})();

/* ---------- the question ---------- */
const resetFinal = runaway($("#finalNo"), {
  yes: $("#finalYes"),
  labels: [
    "Are you sure? 🥺",
    "Really really sure? 😢",
    "Bao is crying now 😭",
    "Think of the bamboo 🎋",
    "Error 404: 'No' not found 🤖",
    "Last chance… 💔",
  ],
  lines: [
    ["Wait… what?! 😳", "shock"],
    ["My little panda heart 🥺", "sad"],
    ["*sniff sniff* 😢", "cry"],
    ["*ugly panda crying* 😭", "cry"],
    ["Even the button doesn't want you to say no 🙈", "cry"],
    ["Just press the big green one!! 💚", "sad"],
  ],
  giveUpLabel: "Okay fine… YES 💍",
  onGiveUp: () => { log("SAID YES 💍", "via the No button giving up: Okay fine… YES 💍"); go("yes"); },
});
$("#finalYes").addEventListener("click", () => { log("SAID YES 💍", "tapped Yes 💍"); go("yes"); });
onEnter.final = () => {
  resetFinal();
  const box = $("#ringbox");
  box.classList.remove("open");
  setTimeout(() => { box.classList.add("open"); sfx("ding"); }, reduced ? 0 : 700);
};

/* ---------- YES 🎉 ---------- */
$("#finalMsg").textContent = fill(CONFIG.finalMessage);
$("#stamp").textContent = "merged into forever · " +
  new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function emojiRain(n = 36, set = ["🐼", "💖", "🎋", "💍", "🌸", "✨", "💕"]) {
  if (reduced) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "rain";
    s.textContent = set[i % set.length];
    s.style.left = rand(0, 96) + "vw";
    s.style.fontSize = rand(20, 36) + "px";
    s.style.setProperty("--dx", rand(-40, 40) + "px");
    s.style.setProperty("--rot", rand(-360, 360) + "deg");
    s.style.animationDuration = rand(3.2, 6) + "s";
    s.style.animationDelay = rand(0, 2.4) + "s";
    s.addEventListener("animationend", () => s.remove());
    document.body.appendChild(s);
  }
}

function celebrate() {
  sfx("yay"); buzz(60);
  emojiRain(20);
  const c = window.confetti;
  if (!c) return;
  const shapes = [];
  try { shapes.push(c.shapeFromText({ text: "🐼", scalar: 2.2 }), c.shapeFromText({ text: "💖", scalar: 2 })); } catch {}
  const colors = ["#6BAA5E", "#3F7A3A", "#F6A6B6", "#E8728B", "#FFFFFF", "#1E2420"];
  c({ particleCount: 140, spread: 100, startVelocity: 48, origin: { y: 0.55 }, colors, disableForReducedMotion: true });
  if (shapes.length) c({ particleCount: 28, spread: 120, scalar: 2.2, shapes, origin: { y: 0.5 }, disableForReducedMotion: true });
  const end = Date.now() + 2600;
  (function side() {
    c({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors, disableForReducedMotion: true });
    c({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(side);
  })();
  setTimeout(() => shapes.length && c({ particleCount: 20, spread: 160, scalar: 2.4, shapes, origin: { y: 0.3 }, disableForReducedMotion: true }), 1800);
}
// 💌 her own words for Ajay
$("#noteSend").addEventListener("click", () => {
  const text = $("#noteText").value.trim();
  if (!text) { shake($("#noteText")); say("Write something first 🥺", "sad"); return; }
  log("💌 MESSAGE", text);
  flushLog();
  try { localStorage.setItem("noteForAjay", text); } catch {}
  $("#note").classList.add("sent");
  $("#noteDone").hidden = false; $("#replayRow").hidden = false;
  sfx("ding"); burstFrom($("#noteDone"), 12, ["💌", "💖", "🐼"]);
  say("Delivered 💌 Bao ran all the way to {you} with it 🐼💨", "love");
});
onEnter.yes = () => {
  $("#note").classList.remove("sent"); $("#noteDone").hidden = true; $("#replayRow").hidden = true;
  try { $("#noteText").value = localStorage.getItem("noteForAjay") || ""; } catch {}
  celebrate();
  setTimeout(() => say("Best. Day. Ever. 🐼💍", "love"), 2500);
};
$("#replay").addEventListener("click", () => { sfx(); go("hello"); });

/* ---------- love hearts falling from the top on the opening screens ---------- */
const HEARTS = ["💖", "💕", "❤️", "💗", "💘", "💓"];
let heartTimer = null;
function startHearts() {
  if (reduced || heartTimer) return;
  emojiRain(6, HEARTS);
  heartTimer = setInterval(() => emojiRain(1, HEARTS), 1300);
}
function stopHearts() { clearInterval(heartTimer); heartTimer = null; }
startHearts();

/* ---------- petals ---------- */
(() => {
  if (reduced) return;
  const box = $("#petals");
  const set = ["🌸", "🍃", "🌸", "🎋", "🍃", "🌸", "💮", "🍃"];
  set.forEach((p, i) => {
    const s = document.createElement("span");
    s.className = "petal";
    s.textContent = p;
    s.style.left = (6 + i * 12 + rand(-4, 4)) + "vw";
    s.style.fontSize = rand(14, 22) + "px";
    s.style.setProperty("--dx", rand(-50, 50) + "px");
    s.style.animationDuration = rand(16, 26) + "s";
    s.style.animationDelay = -rand(0, 26) + "s";
    box.appendChild(s);
  });
})();

/* ---------- opening "special delivery" card ---------- */
(async () => {
  const body = $("#termBody"), boot = $("#boot"), runBtn = $("#runBtn"), hint = $("#bootHint");
  let fast = false;
  boot.addEventListener("pointerdown", (e) => { if (e.target !== runBtn) fast = true; });

  // "type" lines are written letter by letter, "item" lines pop in
  const lines = [
    ["type", "{panda} is getting your surprise ready…", "soft"],
    ["item", "🐼  1 cute panda: packed", "pack"],
    ["item", "🌸  A bunch of flowers: packed", "pack"],
    ["item", "💖  Endless love, just for {her}: packed", "pack"],
    ["type", "Adding a little sprinkle of magic ✨", "soft"],
    ["item", "All set! One very nervous {you} is waiting 😅", "k"],
  ];
  const cursor = Object.assign(document.createElement("span"), { className: "cursor" });

  for (const [kind, raw, cls] of lines) {
    const line = Object.assign(document.createElement("span"), { className: `line ${cls}` });
    body.append(line);
    const text = fill(raw);
    if (kind === "type") {
      line.append(cursor);
      for (const ch of [...text]) {
        cursor.before(ch);
        if (!fast && !reduced) await wait(rand(28, 60));
      }
      if (!fast && !reduced) await wait(300);
      cursor.remove();
    } else {
      line.textContent = text;
      if (!reduced) line.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
        { duration: 360, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      if (!fast && !reduced) await wait(480);
    }
  }
  hint.hidden = true;
  runBtn.hidden = false;

  runBtn.addEventListener("click", () => {
    sfx("pop"); // first gesture also unlocks audio on iOS
    boot.classList.add("gone");
    app.hidden = false;
    go("hello");
    setTimeout(() => boot.remove(), 700);
  });
})();

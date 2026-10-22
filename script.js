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
    wrongReplies: ["Close… but no 😤", "He loves it, but not THE most", "Nope! Try again 🐼"],
  },

  letter:
`Dear {her},

Somewhere between my bugs and my deadlines, you became my favourite feature.

You make ordinary days feel like weekends, and you're the only person I'd happily share my last bamboo shoot with. 🎋

I don't want to ship another version of my life without you in it.

Forever yours,
{you} 🐼`,

  finalMessage: "Best merge of my life. I love you more than pandas love bamboo, and that's a lot. 💖",
};

/* ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fill = (s) => s.replaceAll("{her}", CONFIG.herName).replaceAll("{you}", CONFIG.yourName).replaceAll("{panda}", CONFIG.pandaName);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const STEPS = ["hello", "q1", "q2", "q3", "who", "quiz", "annoying", "letter", "kneel", "hold", "final", "yes"];
const BUBBLES = {
  hello: ["psst… it's me! 🐼", "wave"],
  q1: ["Careful how you answer… 👀", "happy"],
  q2: ["This one's easy 😌", "proud"],
  q3: ["Be honest 🥺", "happy"],
  who: ["Ooh, the big debate 👀", "proud"],
  quiz: ["Pop quiz time! 📝", "happy"],
  annoying: ["Hmm, tricky one 🤔", "shock"],
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

function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

/* ---------- progress ---------- */
const progress = $("#progress");
STEPS.forEach(() => progress.appendChild(Object.assign(document.createElement("i"), { className: "seg" })));

/* ---------- navigation ---------- */
const onEnter = {};
function go(step) {
  restoreFloaters();
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
    btn.style.transform = `translate(${r.left}px, ${r.top}px)`;
    void btn.offsetWidth;
    btn.style.transition = "";
  }
  const b = btn.getBoundingClientRect();
  const vw = innerWidth, vh = innerHeight;
  const minY = 110, maxY = vh - b.height - 40;
  // stay clear of the Yes button, the question and anything else that matters
  const screen = $(".screen.active");
  const keepOut = [avoid, ...(screen ? $$("h2, .ringbox", screen) : [])]
    .filter(Boolean).map((el) => el.getBoundingClientRect());
  const clear = (x, y) => keepOut.every((k) =>
    x + b.width < k.left - 14 || x > k.right + 14 || y + b.height < k.top - 14 || y > k.bottom + 14);
  let x, y;
  for (let i = 0; i < 60; i++) {
    x = rand(16, vw - b.width - 16);
    y = rand(minY, maxY);
    if (Math.hypot(x - b.left, y - b.top) > 120 && clear(x, y)) break;
  }
  btn.style.transform = `translate(${x}px, ${y}px) rotate(${rand(-10, 10).toFixed(1)}deg)`;
}

function restoreFloaters() {
  while (floaters.length) {
    const { btn, ph } = floaters.pop();
    btn.classList.remove("floater");
    btn.style.transform = "";
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

/* ---------- q1: do you love pandas ---------- */
const resetQ1 = runaway($("#q1No"), {
  yes: $("#q1Yes"),
  labels: ["Nope?", "Are you sure? 🤨", "Really?? 🥺", "Bao heard that… 😢"],
  lines: [["Excuse me?? 😳", "shock"], ["Wrong button! 🙅", "sad"], ["You're hurting my feelings 🥺", "sad"], ["*sniff* 😭", "cry"]],
  giveUpLabel: "Okay, YES 🐼",
  onGiveUp: () => { toast("Knew it 😌🐼"); sfx("ding"); nextStep(); },
});
$("#q1Yes").addEventListener("click", () => { sfx("ding"); toast("Correct answer 🐼💚"); nextStep(); });
onEnter.q1 = resetQ1;

/* ---------- q2: two yeses ---------- */
$("#q2a").addEventListener("click", () => { sfx(); toast("Obviously 😌"); nextStep(); });
$("#q2b").addEventListener("click", () => { sfx(); toast("Double correct 💯"); nextStep(); });

/* ---------- q3: the swapping buttons ---------- */
let q3tries = 0;
function flipSwap(row) {
  const btns = $$(".btn", row);
  const before = btns.map((b) => b.getBoundingClientRect());
  row.style.flexDirection = row.style.flexDirection === "row-reverse" ? "row" : "row-reverse";
  btns.forEach((b, i) => {
    const after = b.getBoundingClientRect();
    const dx = before[i].left - after.left;
    if (!reduced) b.animate(
      [{ transform: `translateX(${dx}px)` }, { transform: "translateX(0)" }],
      { duration: 480, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
  });
}
$("#q3No").addEventListener("click", () => {
  q3tries++;
  buzz(); sfx("boing");
  const yes = $("#q3Yes"), no = $("#q3No");
  if (q3tries === 1) { flipSwap($("#q3Row")); say("Oops, wrong button 🙈 let me fix that", "shock"); }
  else if (q3tries === 2) { flipSwap($("#q3Row")); no.textContent = "Still no?"; say("The buttons keep moving… weird 🤭", "proud"); }
  else { no.textContent = "Fine, I missed him 🙈"; no.classList.replace("btn-no", "btn-pink"); say("I KNEW IT 🥹", "love"); setTimeout(nextStep, 900); }
  yes.textContent = ["A lot 🥺", "A LOT 🥺", "SO MUCH 🥺💗"][Math.min(q3tries, 2)];
});
$("#q3Yes").addEventListener("click", () => { sfx("ding"); toast("He missed you too 💗"); nextStep(); });
onEnter.q3 = () => {
  q3tries = 0;
  const no = $("#q3No");
  no.textContent = "No"; no.className = "btn btn-no";
  $("#q3Yes").textContent = "A lot 🥺";
  $("#q3Row").style.flexDirection = "";
};

/* ---------- who loves who more: her button shrinks away, only his can be pressed ---------- */
let whoTries = 0;
const whoLines = [
  ["Hmm, are you sure? 🤭", "proud"],
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
  sfx("yay"); buzz(30);
  her.style.opacity = "0"; her.style.pointerEvents = "none";
  him.disabled = true;
  setMood("stars");
  bubble.textContent = fill("✨ {you} says you both love each other equally 💞");
  bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
  const sub = $("#whoSub");
  sub.textContent = fill("{panda} was just teasing you 😜💕");
  sub.classList.add("who-msg");
  emojiRain(18, ["💞", "✨", "💖", "⭐"]);
  setTimeout(() => ($("#whoNext").hidden = false), 1400);
});
$("#whoNext").addEventListener("click", () => { sfx(); nextStep(); });
onEnter.who = () => {
  whoTries = 0;
  const her = $("#whoHer"), him = $("#whoHim"), sub = $("#whoSub");
  her.style.scale = ""; her.style.opacity = ""; her.style.pointerEvents = "";
  him.style.scale = ""; him.disabled = false;
  sub.textContent = fill("Choose carefully. {panda} is keeping score 🐼");
  sub.classList.remove("who-msg");
  $("#whoNext").hidden = true;
};

/* ---------- quiz ---------- */
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
        say("Correct!! 💖 You know him so well", "love");
        $$(".opt", box).forEach((o) => (o.disabled = true));
        setTimeout(nextStep, 1100);
      } else if (!b.classList.contains("wrong")) {
        b.classList.add("wrong"); shake(b); buzz(); sfx("boing");
        say(CONFIG.quiz.wrongReplies[wrongs++ % CONFIG.quiz.wrongReplies.length], "sad");
      }
    });
    box.appendChild(b);
  });
};

/* ---------- annoying? the shrinking "Yes" ---------- */
let annTries = 0;
const annLabels = ["Hmm? 🤨", "Say that again 😠", "Bao is judging you 🐼", "really?", "…"];
const annLines = [["Wow. Okay. 😶", "shock"], ["I'm telling him 😤", "sad"], ["*judging intensifies* 🐼", "proud"], ["That button is getting tired…", "sad"], ["Button deleted by management 😇", "proud"]];
$("#annYes").addEventListener("click", () => {
  const y = $("#annYes");
  annTries++;
  buzz(); sfx("boing");
  say(...annLines[Math.min(annTries - 1, annLines.length - 1)]);
  y.textContent = annLabels[Math.min(annTries - 1, annLabels.length - 1)];
  y.style.scale = Math.max(1 - annTries * 0.17, 0.25).toFixed(2);
  $("#annNo").style.scale = Math.min(1 + annTries * 0.08, 1.35).toFixed(2);
  if (annTries >= 5) { y.style.opacity = "0"; y.style.pointerEvents = "none"; toast("That option has been removed 🫡"); }
});
$("#annNo").addEventListener("click", () => { sfx("ding"); toast("Correct. He is perfect 😇"); nextStep(); });
onEnter.annoying = () => {
  annTries = 0;
  const y = $("#annYes");
  y.textContent = "Yes 😤"; y.style.scale = ""; y.style.opacity = ""; y.style.pointerEvents = "";
  $("#annNo").style.scale = "";
};

/* ---------- letter ---------- */
let typing = null;
async function typewrite(el, text, speed = 32) {
  el.textContent = "";
  if (reduced) { el.textContent = text; return; }
  const token = (typing = {});
  for (const ch of [...text]) {
    if (typing !== token) return;
    if (token.skip) { el.textContent = text; return; }
    el.textContent += ch;
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
    emojiRain(30, ["💖", "💕", "💗", "💞", "🌸"]);
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
  onGiveUp: () => go("yes"),
});
$("#finalYes").addEventListener("click", () => go("yes"));
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
  emojiRain();
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
onEnter.yes = () => {
  celebrate();
  setTimeout(() => say("Best. Day. Ever. 🐼💍", "love"), 2500);
};
$("#replay").addEventListener("click", () => { sfx(); go("hello"); });

/* ---------- love hearts falling from the top on the opening screens ---------- */
const HEARTS = ["💖", "💕", "❤️", "💗", "💘", "💓"];
let heartTimer = null;
function startHearts() {
  if (reduced || heartTimer) return;
  emojiRain(16, HEARTS);
  heartTimer = setInterval(() => emojiRain(2, HEARTS), 650);
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

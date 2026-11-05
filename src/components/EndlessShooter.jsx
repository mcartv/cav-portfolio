import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Zap } from "lucide-react";

const W = 480,
  H = 620,
  PY = 550,
  KEY = "index-endless-best-v1";
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const SHIP = [
  "000010000",
  "000111000",
  "001111100",
  "011111110",
  "111111111",
  "111111111",
  "110111011",
];
const ENEMY = [
  "00100100",
  "00011000",
  "01111110",
  "11011011",
  "11111111",
  "10100101",
  "00100100",
  "01000010",
];
const ELITE = [
  "00111100",
  "01111110",
  "11111111",
  "11011011",
  "11111111",
  "01111110",
  "10100101",
  "01000010",
];
const POWER = {
  spread: {
    label: "TRIPLE FAN",
    symbol: "III",
    color: "#f7b86b",
    duration: 13,
    detail: "Three angled shots",
  },
  pierce: {
    label: "PIERCING",
    symbol: ">>",
    color: "#c8a9ff",
    duration: 13,
    detail: "Bullets pass through enemies",
  },
  freeze: {
    label: "CRYO ROUNDS",
    symbol: "*",
    color: "#78d7e9",
    duration: 13,
    detail: "Hits slow enemies",
  },
  blast: {
    label: "CHAIN BLAST",
    symbol: "!",
    color: "#fa8b78",
    duration: 13,
    detail: "Explosions damage nearby enemies",
  },
};
const TYPES = Object.keys(POWER);
function sprite(ctx, shape, x, y, scale, color) {
  ctx.fillStyle = color;
  shape.forEach((r, i) => {
    for (let j = 0; j < r.length; j++)
      if (r[j] === "1")
        ctx.fillRect(
          Math.round(x + j * scale),
          Math.round(y + i * scale),
          scale,
          scale,
        );
  });
}
function loadBest() {
  try {
    return Number(window.localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}
function newGame() {
  return {
    phase: "ready",
    score: 0,
    lives: 3,
    elapsed: 0,
    level: 1,
    shipX: W / 2,
    invuln: 0,
    shots: [],
    enemies: [],
    enemyShots: [],
    pickups: [],
    particles: [],
    effects: [],
    active: null,
    activeTime: 0,
    weaponTier: 0,
    weaponFlash: 0,
    shake: 0,
    hitStop: 0,
    banner: "",
    bannerTime: 0,
    bossKills: 0,
    spawnClock: 0.9,
    dropClock: 5,
    fireClock: 0,
    enemyFireClock: 2,
    tag: 0,
    bossTimer: 60,
    bossActive: false,
    nextBossAt: 60,
    stars: Array.from({ length: 85 }, (_, i) => ({
      x: (i * 127 + 47) % W,
      y: (i * 71 + 29) % H,
      size: i % 7 === 0 ? 2 : 1,
      rate: 18 + (i % 6) * 9,
    })),
    last: 0,
    uiClock: 0,
    best: loadBest(),
  };
}
function makeParticles(g, x, y, color, count = 12) {
  for (let i = 0; i < count; i++)
    g.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 240,
      vy: (Math.random() - 0.5) * 200,
      t: 0.28 + Math.random() * 0.45,
      color,
    });
}
function finishEnemy(g, e, blast = false) {
  if (!e.alive) return;

  e.alive = false;
  g.score += e.boss ? 500 : e.elite ? 80 : 30;

  makeParticles(
    g,
    e.x,
    e.y,
    e.boss ? "#ff8f73" : e.elite ? "#c2a5fa" : "#f0a37e",
    e.boss ? 32 : e.elite ? 18 : 11,
  );

  if (e.boss) {
    g.bossActive = false;
    g.bossKills++;
    g.shake = Math.max(g.shake, 15);
    g.banner = "MOTHERSHIP DOWN / +500";
    g.bannerTime = 2.4;
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    g.pickups.push({ x: e.x, y: e.y, type });
    g.effects.push({ x: e.x, y: e.y, life: 0.7, maxLife: 0.7, radius: 110, boss: true });
  } else if (Math.random() < (e.elite ? 0.24 : 0.055) && g.pickups.length < 4) {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    g.pickups.push({ x: e.x, y: e.y, type });
  }

  if ((blast || g.active === "blast") && !e.exploded) {
    e.exploded = true;
    g.effects.push({ x: e.x, y: e.y, life: 0.32, maxLife: 0.32, radius: g.weaponTier >= 2 && g.active === "blast" ? 130 : 82 });
    for (const other of g.enemies) {
      if (
        other.alive &&
        other !== e &&
        Math.hypot(other.x - e.x, other.y - e.y) < (g.active === "blast" && g.weaponTier >= 2 ? 130 : 82)
      ) {
        other.hp -= 2;
        if (other.hp <= 0) finishEnemy(g, other, false);
      }
    }
  }
}
function hitEnemy(g, e, bullet) {
  if (!e.alive || bullet.hitIds.has(e.id)) return;
  bullet.hitIds.add(e.id);
  e.hp -= bullet.kind === "pierce" && bullet.tier >= 2 ? 2 : 1;
  e.flash = 0.14;
  g.shake = Math.max(g.shake, e.boss ? 4.5 : 1.6);
  g.effects.push({ x: bullet.x, y: bullet.y, life: 0.13, maxLife: 0.13, radius: 12, color: bullet.kind === "freeze" ? "#7ce7ec" : "#f6d3a3" });
  if (bullet.kind === "freeze") e.slowUntil = g.elapsed + (bullet.tier >= 2 ? 5.3 : 2.8);
  if (e.boss && e.hp <= e.maxHp * 0.5 && e.phase !== 2) {
    e.phase = 2;
    e.fireCooldown = 0.4;
    g.banner = "WARNING / PHASE TWO";
    g.bannerTime = 2.2;
    g.shake = 13;
  }
  if (e.hp <= 0) finishEnemy(g, e, bullet.kind === "blast");
  else makeParticles(g, e.x, e.y, "#d5dcbe", e.boss ? 7 : 4);
  if (bullet.kind !== "pierce") bullet.dead = true;
}
const small = "font-mono text-[10px] tracking-[.13em]";
function createBoss(id, minute) {
  return {
    id,
    x: W / 2,
    y: 84,
    vx: 92,
    vy: 0,
    hp: 24 + minute * 10,
    maxHp: 24 + minute * 10,
    elite: false,
    boss: true,
    alive: true,
    slowUntil: 0,
    entered: true,
    fireCooldown: 0.9,
    phase: 1,
    flash: 0,
    pattern: 0,
    exploded: false,
  };
}
function drawActiveShipEffect(ctx, g) {
  if (!g.active) return;

  const x = g.shipX;
  const y = PY;
  const power = POWER[g.active];

  ctx.save();

  if (g.active === "spread") {
    ctx.strokeStyle = power.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 18, y - 8);
    ctx.lineTo(x - 34, y - 22);
    ctx.moveTo(x + 18, y - 8);
    ctx.lineTo(x + 34, y - 22);
    ctx.stroke();
  }

  if (g.active === "pierce") {
    ctx.strokeStyle = power.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 24, y - 19, 48, 30);
    ctx.strokeRect(x - 20, y - 15, 40, 22);
  }

  if (g.active === "freeze") {
    ctx.strokeStyle = power.color;
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(x + i * 14, y - 3, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (g.active === "blast") {
    ctx.strokeStyle = power.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 2, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y - 2, 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (g.weaponTier >= 2) {
    ctx.strokeStyle = power.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 28, y - 23, 56, 36);
    ctx.fillStyle = power.color;
    ctx.fillRect(x - 4, y - 29, 8, 4);
  }
  ctx.restore();
}

export default function EndlessShooter({ onExit }) {
  const canvas = useRef(null),
    game = useRef(null),
    keys = useRef({ left: false, right: false, fire: false });
  if (!game.current) game.current = newGame();
  const [view, setView] = useState({
    phase: "ready",
    score: 0,
    lives: 3,
    level: 1,
    time: 0,
    active: null,
    remaining: 0,
    tier: 0,
    boss: false,
    bossKills: 0,
    banner: "",
    best: game.current.best,
  });
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true),
    audio = useRef(null),
    onExitRef = useRef(onExit);
  onExitRef.current = onExit;
  mutedRef.current = muted;
  const sound = (hz = 320, len = 0.06) => {
    if (mutedRef.current) return;
    try {
      const ctx =
        audio.current ||
        new (window.AudioContext || window.webkitAudioContext)();
      audio.current = ctx;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(hz, ctx.currentTime);
      gain.gain.setValueAtTime(0.018, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + len);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + len);
    } catch {}
  };
  const start = useCallback(() => {
    game.current = newGame();
    game.current.phase = "playing";
    keys.current = { left: false, right: false, fire: false };
    setView({
      phase: "playing",
      score: 0,
      lives: 3,
      level: 1,
      time: 0,
      active: null,
      remaining: 0,
      tier: 0,
      boss: false,
      bossKills: 0,
      banner: "",
      best: game.current.best,
    });
  }, []);
  useEffect(() => {
    const press = (e) => {
      const k = e.key.toLowerCase();
      if (
        ["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w"].includes(k)
      )
        e.preventDefault();
      if (k === "escape") {
        onExitRef.current();
        return;
      }
      if (k === "arrowleft" || k === "a") keys.current.left = true;
      if (k === "arrowright" || k === "d") keys.current.right = true;
      if (k === " " || k === "arrowup" || k === "w") keys.current.fire = true;
      if (k === "enter" && game.current.phase !== "playing") start();
    };
    const release = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keys.current.left = false;
      if (k === "arrowright" || k === "d") keys.current.right = false;
      if (k === " " || k === "arrowup" || k === "w") keys.current.fire = false;
    };
    const blur = () => {
      keys.current = { left: false, right: false, fire: false };
    };
    window.addEventListener("keydown", press);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", press);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", blur);
      audio.current?.close?.();
    };
  }, [start]);
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const render = (now) => {
      const g = game.current;
      const dt = g.last ? Math.min((now - g.last) / 1000, 0.04) : 0;
      g.last = now;
      if (g.phase === "playing") {
        g.elapsed += dt;
        const minute = Math.floor(g.elapsed / 60);

        // Slower start, then ramps more noticeably after the first minute.
        const difficulty =
          g.elapsed < 60 ? 0.72 + g.elapsed / 95 : 1.35 + (g.elapsed - 60) / 32;

        g.level = 1 + Math.floor(g.elapsed / 25);
        g.weaponFlash = Math.max(0, g.weaponFlash - dt);
        g.bannerTime = Math.max(0, g.bannerTime - dt);
        g.shake = Math.max(0, g.shake - dt * 38);
        g.invuln = Math.max(0, g.invuln - dt);
        g.shipX = clamp(
          g.shipX +
            (Number(keys.current.right) - Number(keys.current.left)) * 310 * dt,
          23,
          W - 23,
        );
        g.fireClock -= dt;
        if (keys.current.fire && g.fireClock <= 0) {
          const spread = g.active === "spread" ? (g.weaponTier >= 2 ? [-2, -1, 0, 1, 2] : [-1, 0, 1]) : [0];
          spread.forEach((dir) =>
            g.shots.push({
              x: g.shipX,
              y: PY - 14,
              vx: dir * (g.weaponTier >= 2 ? 125 : 180),
              vy: -540,
              kind: g.active,
              tier: g.weaponTier,
              hitIds: new Set(),
              dead: false,
            }),
          );
          g.fireClock = 0.18;
          sound(g.active === "spread" ? 600 : 430, 0.025);
        }
        g.activeTime -= dt;
        if (g.active && g.activeTime <= 0) {
          g.active = null;
          g.activeTime = 0;
          g.weaponTier = 0;
        }
        g.spawnClock -= dt;
        if (g.spawnClock <= 0) {
          const spawnBase =
            g.elapsed < 60
              ? 1.45 - difficulty * 0.16
              : 1.05 - difficulty * 0.12;

          g.spawnClock =
            Math.max(0.24, spawnBase) * (0.72 + Math.random() * 0.55);

          const elite =
            g.elapsed < 60
              ? Math.random() < Math.min(0.18, 0.03 + difficulty * 0.03)
              : Math.random() < Math.min(0.47, 0.08 + difficulty * 0.05);

          g.enemies.push({
            id: ++g.tag,
            x: 23 + Math.random() * (W - 46),
            y: -25,
            vx: (Math.random() - 0.5) * 28,
            vy:
              g.elapsed < 60
                ? (52 + Math.random() * 18 + difficulty * 10) *
                  (elite ? 0.82 : 1)
                : (68 + Math.random() * 28 + difficulty * 18) *
                  (elite ? 0.82 : 1),
            hp: elite ? Math.ceil(2 + difficulty * 0.42) : 1,
            elite,
            boss: false,
            alive: true,
            slowUntil: 0,
          });
        }
        g.bossTimer -= dt;

        if (g.bossTimer <= 0 && !g.bossActive) {
          g.bossActive = true;
          g.bossTimer = 60;
          g.banner = "ALERT / MOTHERSHIP INBOUND";
          g.bannerTime = 3;
          g.shake = 8;
          const bossMinute = Math.max(1, Math.floor(g.elapsed / 60));
          g.enemies.push(createBoss(++g.tag, bossMinute));
        }
        g.dropClock -= dt;
        if (g.dropClock <= 0) {
          g.dropClock = 8.2 + Math.random() * 4;
          if (g.pickups.length < 3)
            g.pickups.push({
              x: 34 + Math.random() * (W - 68),
              y: -8,
              type: TYPES[Math.floor(Math.random() * 4)],
            });
        }
        g.enemyFireClock -= dt;
        const shooters = g.enemies.filter(
          (e) => e.alive && e.y > 38 && e.y < 420,
        );
        if (g.enemyFireClock <= 0 && shooters.length) {
          g.enemyFireClock = Math.max(0.25, 1.6 - difficulty * 0.19);
          const e = shooters[Math.floor(Math.random() * shooters.length)];
          g.enemyShots.push({ x: e.x, y: e.y + 14, vy: 170 + difficulty * 24 });
        }
        for (const e of g.enemies)
          if (e.alive) {
            const slow = e.slowUntil > g.elapsed ? 0.35 : 1;

            if (e.boss) {
              e.x += e.vx * slow * (e.phase === 2 ? 1.45 : 1) * dt;
              if (e.x < 62 || e.x > W - 62) {
                e.x = clamp(e.x, 62, W - 62);
                e.vx *= -1;
              }
              e.fireCooldown -= dt;
              if (e.fireCooldown <= 0) {
                e.pattern++;
                const speed = 185 + Math.min(75, difficulty * 12);
                if (e.phase === 1) {
                  // Three deliberate lanes make the first phase learnable.
                  [-65, 0, 65].forEach(vx => g.enemyShots.push({x:e.x,y:e.y+28,vx,vy:speed}));
                  e.fireCooldown = 1.05;
                } else {
                  // Phase two alternates between broad fan and aimed bursts.
                  const aimed = clamp((g.shipX-e.x)*0.58,-120,120);
                  const angles = e.pattern % 2 === 0 ? [-160,-80,0,80,160] : [aimed-32,aimed,aimed+32];
                  angles.forEach(vx => g.enemyShots.push({x:e.x,y:e.y+28,vx,vy:speed+32}));
                  e.fireCooldown = 0.68;
                }
              }
            } else {
              e.y += e.vy * slow * dt;
              e.x = clamp(e.x + e.vx * dt, 18, W - 18);
              if (e.y > H + 30) e.alive = false;
            }
          }
        g.enemies = g.enemies.filter((e) => e.alive);
        for (const e of g.enemies) e.flash = Math.max(0,(e.flash || 0)-dt);
        for (const b of g.shots) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
        }
        for (const b of g.enemyShots) {
          b.x += (b.vx || 0) * dt;
          b.y += b.vy * dt;
        }
        for (const p of g.pickups) p.y += 105 * dt;
        for (const b of g.shots) {
          if (b.dead) continue;
          for (const e of g.enemies) {
            if (!e.alive) continue;
            if (Math.abs(e.x - b.x) < (e.boss ? 31 : 19) && Math.abs(e.y - b.y) < (e.boss ? 26 : 18)) {
              hitEnemy(g, e, b);
              if (b.dead) break;
            }
          }
        }
        g.shots = g.shots.filter(
          (b) => !b.dead && b.y > -20 && b.x > -30 && b.x < W + 30,
        );
        g.enemies = g.enemies.filter((e) => e.alive);
        for (const pickup of g.pickups) {
          if (
            Math.abs(pickup.x - g.shipX) < 24 &&
            Math.abs(pickup.y - PY) < 23
          ) {
            pickup.collected = true;
            g.weaponTier = g.active === pickup.type && g.activeTime > 0 ? 2 : 1;
            g.active = pickup.type;
            g.activeTime = POWER[pickup.type].duration + (g.weaponTier === 2 ? 4 : 0);
            g.weaponFlash = 1.3;
            g.banner = (g.weaponTier === 2 ? "WEAPON EVOLVED / " : "WEAPON ACQUIRED / ") + POWER[pickup.type].label;
            g.bannerTime = 1.8;
            sound(780, 0.16);
            makeParticles(g, pickup.x, pickup.y, POWER[pickup.type].color, 16);
          }
        }
        g.pickups = g.pickups.filter((p) => !p.collected && p.y < H + 24);
        if (g.invuln === 0) {
          const enemyCollision = g.enemies.find(
            (e) => Math.abs(e.x - g.shipX) < 24 && Math.abs(e.y - PY) < 23,
          );
          const shotCollision = g.enemyShots.find(
            (b) => Math.abs(b.x - g.shipX) < 16 && Math.abs(b.y - PY) < 15,
          );
          if (enemyCollision || shotCollision) {
            if (enemyCollision) {
              enemyCollision.alive = false;
              makeParticles(g, enemyCollision.x, enemyCollision.y, "#f49b7b");
            }
            if (shotCollision) shotCollision.hit = true;
            g.lives--;
            g.invuln = 1.6;
            g.shake = Math.max(g.shake, 14);
            sound(95, 0.24);
            makeParticles(g, g.shipX, PY, "#ef796b", 20);
            if (g.lives <= 0) {
              g.phase = "over";
              g.best = Math.max(g.best, g.score);
              try {
                window.localStorage.setItem(KEY, String(g.best));
              } catch {}
            }
          }
        }
        g.enemyShots = g.enemyShots.filter((b) => !b.hit && b.y < H + 20);
        g.particles.forEach((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.t -= dt;
        });
        g.particles = g.particles.filter((p) => p.t > 0);
        g.effects.forEach((e) => (e.life -= dt));
        g.effects = g.effects.filter((e) => e.life > 0);
        g.uiClock += dt;
        if (g.uiClock > 0.17 || g.phase === "over") {
          g.uiClock = 0;
          setView({
            phase: g.phase,
            score: g.score,
            lives: g.lives,
            level: g.level,
            time: Math.floor(g.elapsed),
            active: g.active,
            remaining: Math.max(0, Math.ceil(g.activeTime)),
            tier: g.weaponTier,
            boss: g.bossActive,
            bossKills: g.bossKills,
            banner: g.bannerTime > 0 ? g.banner : "",
            best: Math.max(g.best, g.score),
          });
        }
      }
      g.stars.forEach((s) => {
        s.y +=
          (g.phase === "playing"
            ? s.rate * (1 + Math.min(2, g.elapsed / 90))
            : s.rate * 0.24) * dt;
        if (s.y > H) s.y = 0;
      });
      ctx.fillStyle = "#061019";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(98,164,165,.07)";
      for (let y = 22; y < H; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(W, y + 0.5);
        ctx.stroke();
      }
      for (const s of g.stars) {
        ctx.fillStyle = s.size === 2 ? "#638c8b" : "#294c55";
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      ctx.font = "11px monospace";
      ctx.fillStyle = "#a9dbce";
      ctx.fillText("THREAT " + String(g.level).padStart(2, "0"), 16, 26);
      ctx.textAlign = "right";
      ctx.fillText("SCORE " + String(g.score).padStart(6, "0"), W - 16, 26);
      ctx.textAlign = "left";
      for (const e of g.enemies) {
        if (e.boss) {
          const color = e.slowUntil > g.elapsed ? "#8be4f2" : "#ff9d7d";
          sprite(ctx, ELITE, e.x - 20, e.y - 20, 5.2, color);

          ctx.fillStyle = "#3a2730";
          ctx.fillRect(e.x - 48, e.y - 34, 96, 6);

          ctx.fillStyle = "#ff9d7d";
          ctx.fillRect(e.x - 48, e.y - 34, 96 * Math.max(0, e.hp / e.maxHp), 6);

          ctx.strokeStyle = "#ffd0ba";
          ctx.strokeRect(e.x - 48, e.y - 34, 96, 6);
        } else {
          const size = e.elite ? 3.9 : 3.2;
          const shape = e.elite ? ELITE : ENEMY;
          const color =
            e.slowUntil > g.elapsed
              ? "#80dcf2"
              : e.elite
                ? "#d0a0f1"
                : "#f2a17c";
          sprite(ctx, shape, e.x - size * 4, e.y - size * 4, size, color);

          if (e.elite) {
            ctx.fillStyle = "#372a46";
            ctx.fillRect(e.x - 10, e.y - 19, 20, 2);
            ctx.fillStyle = "#cf95fa";
            ctx.fillRect(e.x - 10, e.y - 19, 20 * Math.min(1, e.hp / 5), 2);
          }
        }
      }
      for (const b of g.shots) {
        ctx.fillStyle =
          b.kind === "pierce"
            ? "#d5afff"
            : b.kind === "freeze"
              ? "#79dbed"
              : b.kind === "blast"
                ? "#fc977d"
                : "#eaf8dc";
        ctx.fillRect(b.x - 2, b.y - 7, 4, 14);
      }
      ctx.fillStyle = "#f48b7c";
      g.enemyShots.forEach((b) => ctx.fillRect(b.x - 2, b.y - 4, 4, 10));
      for (const p of g.pickups) {
        const color = POWER[p.type].color;
        ctx.fillStyle = "#0e2732";
        ctx.fillRect(p.x - 14, p.y - 14, 28, 28);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - 14, p.y - 14, 28, 28);
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.font = "bold 12px monospace";
        ctx.fillText(POWER[p.type].symbol, p.x, p.y + 4);
        ctx.textAlign = "left";
      }
      for (const e of g.effects) {
        const t = e.life / 0.32;
        ctx.strokeStyle = "rgba(251,156,112," + t + ")";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, (1 - t) * 80, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const p of g.particles) {
        ctx.globalAlpha = clamp(p.t * 2, 0, 1);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
      ctx.globalAlpha = 1;
      if (g.invuln <= 0 || Math.floor(g.invuln * 12) % 2 === 0) {
        sprite(
          ctx,
          SHIP,
          g.shipX - 14,
          PY - 11,
          3.25,
          g.active ? POWER[g.active].color : "#c9e8db",
        );
        drawActiveShipEffect(ctx, g);
      }
      ctx.fillStyle = "#648a86";
      ctx.font = "10px monospace";
      ctx.fillText("INDEX / ENDLESS MODE", 14, H - 9);
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const touch = (kind, active) => {
    keys.current[kind] = active;
  };
  return (
    <section
      className="arcade-root fixed inset-0 z-[260] flex flex-col overflow-y-auto bg-[#040a10] text-[#d2eee1]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="endless-title"
    >
      <div
        className="arcade-scanlines pointer-events-none fixed inset-0 z-10"
        aria-hidden="true"
      />
      <header className="relative z-20 flex items-center justify-between gap-3 border-b border-[#34505a] px-[5%] py-4">
        <span className="text-xl font-black tracking-[-.085em]">
          INDEX<span className="text-[#ef9b7c]">/</span>
          <span className={small + " ml-3 hidden text-[#91b2aa] sm:inline"}>
            ENDLESS PROTOCOL
          </span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setMuted((v) => !v)}
            className="border border-[#526d70] p-2 text-[#b7d6cf]"
            aria-label={muted ? "Enable sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 border border-[#526d70] px-3 py-2 font-mono text-[10px] hover:bg-[#20363c]"
          >
            <ArrowLeft size={14} /> MODES
          </button>
        </div>
      </header>
      <div className="relative z-0 mx-auto flex w-full max-w-[820px] flex-1 flex-col items-center px-4 pb-5 pt-5">
        <div className="mb-3 flex w-full max-w-[480px] items-end justify-between gap-3">
          <div>
            <p className={small + " text-[#f0a07d]"}>SURVIVE THE INFINITE</p>
            <h1
              id="endless-title"
              className="text-[clamp(30px,6vw,48px)] font-black leading-none tracking-[-.075em]"
            >
              ENDLESS <span className="text-[#f0a07d]">SURVIVAL_</span>
            </h1>
          </div>
          <Zap size={23} className="text-[#f0a07d]" />
        </div>
        <div className="arcade-cabinet relative w-full max-w-[480px] overflow-hidden border border-[#54776f] bg-[#061019] shadow-[0_0_0_5px_#101f26,0_20px_75px_#0009]">
          <canvas
            ref={canvas}
            width={W}
            height={H}
            className="block h-auto w-full"
            aria-label="Endless pixel shooter with progressively faster enemies and collectible weapons"
          />
          {view.phase !== "playing" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#02070c]/90 px-5 text-center">
              <span className={small + " mb-4 text-[#f0a07d]"}>
                {view.phase === "over"
                  ? "SIGNAL LOST / TRY AGAIN"
                  : "SURVIVAL PROTOCOL / 002"}
              </span>
              <h2 className="text-[clamp(40px,9vw,67px)] font-black leading-[.9] tracking-[-.075em]">
                {view.phase === "over" ? "GAME OVER" : "NO FINAL"}
                <br />
                <span className="text-[#f0a07d]">
                  {view.phase === "over" ? "RETRY?" : "WAVE."}
                </span>
              </h2>
              <p className="mt-5 max-w-[300px] font-mono text-xs leading-6 text-[#a5c7be]">
                {view.phase === "over"
                  ? "SCORE " + view.score + " / BEST " + view.best
                  : "Dodge, shoot and collect weapon power-ups. Every second increases the threat."}
              </p>
              <button
                onClick={start}
                className="mt-7 inline-flex items-center gap-2 border border-[#e5a082] bg-[#442e30] px-6 py-3 font-mono text-xs text-[#ffe2d3] transition-colors hover:bg-[#67413a]"
              >
                {view.phase === "over" ? (
                  <RotateCcw size={16} />
                ) : (
                  <Zap size={16} />
                )}{" "}
                {view.phase === "over" ? "RESTART" : "START SURVIVAL"}
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 flex w-full max-w-[480px] flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#9fd0c3]">
          <span>
            SCORE{" "}
            <strong className="text-white">
              {String(view.score).padStart(6, "0")}
            </strong>
          </span>
          <span>BEST {view.best}</span>
          <span>THREAT {view.level}</span>
          <span>LIVES {"♥".repeat(Math.max(0, view.lives))}</span>
          {game.current?.bossActive && (
            <div className="mt-2 w-full max-w-[480px] border border-[#6f4340] bg-[#2a1718] px-3 py-2 font-mono text-[10px] tracking-wider text-[#ffb19d]">
              WARNING / BOSS ENCOUNTER ACTIVE
            </div>
          )}
        </div>
        <div className="mt-3 flex min-h-[43px] w-full max-w-[480px] items-center justify-between border border-[#3a5c57] bg-[#0d252b] px-3 py-2 font-mono text-[10px] tracking-wide">
          <span className="text-[#90aca7]">ACTIVE WEAPON</span>
          <span
            style={{
              color: view.active ? POWER[view.active].color : "#8caca4",
            }}
          >
            {view.active
              ? POWER[view.active].label + " / " + view.remaining + "S"
              : "STANDARD / NONE"}
          </span>
        </div>
        <div className="mt-4 w-full max-w-[480px]">
          <div className="flex items-center justify-between gap-3 sm:hidden">
            <button
              type="button"
              aria-label="Move left"
              className="arcade-touch-control"
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                touch("left", true);
              }}
              onPointerUp={() => touch("left", false)}
              onPointerCancel={() => touch("left", false)}
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="Fire"
              className="arcade-touch-control arcade-fire"
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                touch("fire", true);
              }}
              onPointerUp={() => touch("fire", false)}
              onPointerCancel={() => touch("fire", false)}
            >
              FIRE
            </button>
            <button
              type="button"
              aria-label="Move right"
              className="arcade-touch-control"
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                touch("right", true);
              }}
              onPointerUp={() => touch("right", false)}
              onPointerCancel={() => touch("right", false)}
            >
              ▶
            </button>
          </div>
          <p className={small + " mt-3 text-center leading-5 text-[#789d95]"}>
            ← → / A D TO MOVE · SPACE / W TO FIRE · ESC FOR MODES
          </p>
        </div>
        <div className="mt-4 grid w-full max-w-[480px] grid-cols-2 gap-2">
          {TYPES.map((type) => (
            <div
              key={type}
              className="border border-[#335b56] px-3 py-2 font-mono text-[10px]"
            >
              <span style={{ color: POWER[type].color }}>
                {POWER[type].symbol} {POWER[type].label}
              </span>
              <p className="mt-1 text-[9px] text-[#7d9d97]">
                {POWER[type].detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Gerador dos 7 super-heróis chibi em 3D (three.js) -> PNG transparente.
// Uso: render.html?hero=spiderman&yaw=0.3  (veja render.py)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/RoundedBoxGeometry.js';

const q = new URLSearchParams(location.search);
const HERO = q.get('hero') || 'spiderman';
const YAW = parseFloat(q.get('yaw') ?? '0.3');
const W = 900, H = 1050;

/* ---------- renderer / cena ---------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(2);
renderer.setSize(W, H, false);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(22, W / H, 0.1, 100);
camera.position.set(0, 1.4, 14.5);
camera.lookAt(0, 1.25, 0);

const key = new THREE.DirectionalLight(0xfff0dc, 2.7);
key.position.set(-4, 7, 9);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -4; key.shadow.camera.right = 4;
key.shadow.camera.top = 5; key.shadow.camera.bottom = -3;
key.shadow.bias = -0.0006; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
scene.add(key);
const fill = new THREE.DirectionalLight(0xaac8ff, 1.0); fill.position.set(6, 2, 7); scene.add(fill);
const rimA = new THREE.DirectionalLight(0x6fdcff, 2.2); rimA.position.set(5, 4, -6); scene.add(rimA);
const rimB = new THREE.DirectionalLight(0xff9fd2, 1.6); rimB.position.set(-5, 3, -5); scene.add(rimB);
scene.add(new THREE.HemisphereLight(0xe3ecff, 0x5a3a66, 0.6));

/* ---------- utilidades ---------- */
const P = (color, o = {}) => new THREE.MeshPhysicalMaterial({
  color, roughness: 0.42, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.8, ...o,
});
const METAL = (color, o = {}) => P(color, { metalness: 0.75, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.3, ...o });
const GLOW = (color, i = 2.5) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: i, roughness: 0.4 });
const BASIC = (color) => new THREE.MeshBasicMaterial({ color, toneMapped: false });
const SKIN = () => P(0xffc9a3, { roughness: 0.55, clearcoat: 0.18, emissive: 0x4a1a0c, emissiveIntensity: 0.16 });

function S(r, mat, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 56, 36), mat);
  m.scale.set(sx, sy, sz);
  return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
// coloca `obj` sobre a superfície da esfera (raio r) na longitude/latitude dadas, +z apontando para fora
function place(obj, lon, lat, r = 1) {
  const c = Math.cos(lat);
  obj.position.set(Math.sin(lon) * c * r, Math.sin(lat) * r, Math.cos(lon) * c * r);
  obj.lookAt(obj.position.clone().multiplyScalar(2));
  return obj;
}
// calota esférica (usada para máscaras, decalques, cabelo…). phi=π/2 é a frente (+z).
function cap(parent, { phi = Math.PI / 2, dphi, theta, dtheta, r = 1.01, mat }) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, 64, 40, phi - dphi / 2, dphi, theta - dtheta / 2, dtheta), mat);
  parent.add(m); return m;
}
// membro entre dois pontos
const _up = new THREE.Vector3(0, 1, 0);
function limb(a, b, r, mat) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const d = B.clone().sub(A), len = d.length();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 14, 28), mat);
  m.position.copy(A.clone().add(B).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(_up, d.normalize());
  return m;
}

/* ---------- rosto ---------- */
const WHITE = () => P(0xffffff, { roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
function eye(head, side, o = {}) {
  const { lon = 0.36, lat = 0.05, w = 0.23, h = 0.29, iris = 0x3b2a1e, slant = 0, look = [0, 0],
    outline = null, irisScale = 0.74, r = 0.975, noIris = false } = o;
  const holder = new THREE.Group(); place(holder, side * lon, lat, r); head.add(holder);
  const inner = new THREE.Group(); inner.rotation.z = side * slant; holder.add(inner);
  if (outline) { const ol = S(1, P(outline, { roughness: 0.3 }), w * 1.14, h * 1.16, 0.09); ol.position.z = -0.012; inner.add(ol); }
  inner.add(S(1, WHITE(), w, h, 0.11));
  if (!noIris) {
    const ir = S(1, P(iris, { roughness: 0.25, clearcoat: 1 }), w * irisScale, h * irisScale, 0.08);
    ir.position.set(look[0], look[1], 0.07); inner.add(ir);
    const pu = S(1, P(0x0b0b10, { roughness: 0.15, clearcoat: 1 }), w * 0.42, h * 0.42, 0.06);
    pu.position.set(look[0], look[1], 0.12); inner.add(pu);
    const hl = S(1, BASIC(0xffffff), w * 0.2, w * 0.2, 0.05); hl.position.set(look[0] + w * 0.27, look[1] + h * 0.3, 0.17); inner.add(hl);
    const hl2 = S(1, BASIC(0xffffff), w * 0.1, w * 0.1, 0.05); hl2.position.set(look[0] - w * 0.25, look[1] - h * 0.27, 0.16); inner.add(hl2);
  }
  return holder;
}
function brows(head, { lat = 0.42, lon = 0.36, len = 0.3, tilt = 0.18, color = 0x3a2616, r = 0.03 } = {}) {
  for (const s of [-1, 1]) {
    const holder = new THREE.Group(); place(holder, s * lon, lat, 0.985); head.add(holder);
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 16), P(color, { roughness: 0.6 }));
    b.rotation.z = Math.PI / 2 + s * tilt; holder.add(b);
  }
}
function cheeks(head, { lon = 0.66, lat = -0.2, color = 0xff8fa3 } = {}) {
  for (const s of [-1, 1]) {
    const c = S(1, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, toneMapped: false }), 0.15, 0.095, 0.02);
    const h = new THREE.Group(); place(h, s * lon, lat, 0.972); h.add(c); head.add(h);
  }
}
function smileLine(head, { lat = -0.42, w = 0.17, color = 0x7a2a1e } = {}) {
  const h = new THREE.Group(); place(h, 0, lat, 0.985); head.add(h);
  const arc = 2.3;
  const t = new THREE.Mesh(new THREE.TorusGeometry(w, 0.03, 12, 40, arc), P(color, { roughness: 0.5 }));
  t.rotation.z = 1.5 * Math.PI - arc / 2; h.add(t);
}
function grin(head, { lat = -0.4, w = 0.26, teeth = true, tongue = true } = {}) {
  const h = new THREE.Group(); place(h, 0, lat, 0.982); head.add(h);
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(1, 40, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0x6e1a20, side: THREE.DoubleSide }));
  mouth.scale.set(w, w * 0.95, 1); h.add(mouth);
  if (tongue) {
    const t = new THREE.Mesh(new THREE.CircleGeometry(1, 32, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0xff6f83, side: THREE.DoubleSide }));
    t.scale.set(w * 0.56, w * 0.4, 1); t.position.z = 0.003; h.add(t);
  }
  if (teeth) {
    const tt = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.72, w * 0.26), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    tt.position.set(0, -w * 0.13, 0.004); h.add(tt);
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(w, 0.026, 10, 40, Math.PI), P(0x7a2a1e, { roughness: 0.5 }));
  rim.rotation.z = Math.PI; rim.position.z = 0.002; h.add(rim);
  const top = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, w * 2, 6, 10), P(0x7a2a1e, { roughness: 0.5 }));
  top.rotation.z = Math.PI / 2; top.position.z = 0.002; h.add(top);
}

/* ---------- corpo base ---------- */
function newRig() { const g = new THREE.Group(); g.userData.head = new THREE.Group(); g.userData.head.position.y = 1.95; g.userData.head.scale.setScalar(0.88); g.add(g.userData.head); return g; }

function torso(g, mat, { sx = 0.68, sy = 0.74, sz = 0.55, y = 0.86, tex = null } = {}) {
  const grp = new THREE.Group(); grp.position.y = y; grp.scale.set(sx, sy, sz);
  const m = S(1, mat); grp.add(m); g.add(grp); g.userData.torso = grp; g.userData.torsoMesh = m;
  return grp;
}
function legs(g, { upper, lower = upper, foot, x = 0.3, spread = 0.03, footScale = [0.36, 0.23, 0.48], stance = 0, bootTop = null } = {}) {
  for (const s of [-1, 1]) {
    g.add(limb([s * x, 0.32, 0], [s * (x + spread), -0.05, 0.02], 0.285, upper));
    g.add(limb([s * (x + spread), -0.05, 0.02], [s * (x + spread), -0.32, 0.04], 0.27, lower));
    const f = S(1, foot, ...footScale); f.position.set(s * (x + spread + 0.02 + stance * s), -0.44, 0.15); g.add(f);
    if (bootTop) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.29, 0.16, 32), bootTop); c.position.set(s * (x + spread), -0.2, 0.04); g.add(c); }
  }
}
// braço com dois segmentos + mão
function arm(g, s, elbow, hand, { r = 0.205, mat, handMat = mat, handR = 0.25, shoulder = [0.66, 1.17, 0], cuff = null } = {}) {
  const sh = [s * shoulder[0], shoulder[1], shoulder[2]];
  const e = [s * elbow[0], elbow[1], elbow[2]], hd = [s * hand[0], hand[1], hand[2]];
  g.add(limb(sh, e, r, mat));
  const j = S(r, mat); j.position.set(...e); g.add(j);
  g.add(limb(e, hd, r * 0.96, mat));
  const hm = S(handR, handMat); hm.position.set(...hd); g.add(hm);
  if (cuff) {
    const A = new THREE.Vector3(...e), B = new THREE.Vector3(...hd);
    const d = B.clone().sub(A), len = d.length();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.13, r * 1.2, len * 0.42, 36), cuff);
    c.position.copy(A.clone().lerp(B, 0.6)); c.quaternion.setFromUnitVectors(_up, d.normalize()); g.add(c);
  }
  return hm;
}

/* ---------- texturas ---------- */
function webTex(base, line = '#14141c', lw = 5, N = 18, M = 9) {
  return canvasTex(2048, 1024, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = line; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let k = 0; k < N; k++) { const x = (k * w) / N; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let j = 1; j < M; j++) {
      const y = (j * h) / M;
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let k = 0; k < N; k++) {
        const x0 = (k * w) / N, x1 = ((k + 1) * w) / N;
        ctx.quadraticCurveTo((x0 + x1) / 2, y - (h / M) * 0.42, x1, y);
      }
      ctx.stroke();
    }
  });
}
function starPath(ctx, cx, cy, R, r = R * 0.4) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r : R;
    ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}

/* ============================================================
   OS SETE HERÓIS
   ============================================================ */
const B = {};

/* ---------------- Homem-Aranha ---------------- */
B.spiderman = () => {
  const g = newRig(), head = g.userData.head;
  const red = 0xd4162a, blue = 0x1f43a8;
  const webMat = P(0xffffff, { map: webTex('#d4162a'), roughness: 0.38, clearcoat: 0.7 });
  const skull = S(1, webMat); skull.rotation.x = Math.PI / 2; head.add(skull);
  for (const s of [-1, 1]) eye(head, s, { lon: 0.4, lat: 0.06, w: 0.31, h: 0.235, slant: 0.34, noIris: true, outline: 0x0a0a10, r: 0.97 });

  // tronco (rede) + emblema
  const tg = torso(g, P(0xffffff, { map: null }));
  tg.remove(g.userData.torsoMesh);
  const tm = S(1, webMat); tm.rotation.x = Math.PI / 2; tg.add(tm);
  const spider = canvasTex(256, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = '#0b0b12'; c.fillStyle = '#0b0b12'; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.ellipse(128, 150, 20, 44, 0, 0, 7); c.fill();
    c.beginPath(); c.arc(128, 96, 15, 0, 7); c.fill();
    for (const s of [-1, 1]) for (const [y0, y1, x1] of [[112, 62, 92], [130, 108, 66], [156, 170, 68], [176, 218, 92]]) {
      c.beginPath(); c.moveTo(128 + s * 10, y0 + 18); c.quadraticCurveTo(128 + s * 46, y0 - 8, 128 + s * (128 - x1) * 0.98 + 0, y1 + (y1 > 150 ? 0 : 6)); c.stroke();
    }
  });
  cap(tg, { theta: 1.72, dtheta: 0.66, dphi: 0.62, mat: new THREE.MeshBasicMaterial({ map: spider, transparent: true, toneMapped: false }) });
  // faixas azuis laterais
  const sideMat = P(blue, { roughness: 0.4 });
  for (const s of [-1, 1]) cap(tg, { phi: Math.PI / 2 + s * 1.15, dphi: 0.7, theta: 1.75, dtheta: 1.5, r: 1.006, mat: sideMat });

  legs(g, { upper: P(blue), lower: P(red), foot: P(red) });
  const redA = webMat;
  // braço direito (tela) levantado atirando teia; esquerdo relaxado
  const hR = arm(g, 1, [0.98, 1.5, 0.05], [1.3, 2.05, 0.15], { mat: redA, handMat: P(red) });
  arm(g, -1, [0.9, 0.78, 0.1], [0.92, 0.42, 0.35], { mat: redA, handMat: P(red) });
  for (const [dx, tilt] of [[-0.11, 0.25], [0.13, -0.3]]) {
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.2, 8, 14), P(red)); f.position.set(1.3 + dx * 1.0, 2.3, 0.15); f.rotation.z = tilt; g.add(f);
  }
  // fio de teia
  const web = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.4, 2.5, 0.15), new THREE.Vector3(1.6, 2.85, 0.1), new THREE.Vector3(1.66, 3.3, 0.0)]), 20, 0.03, 8), P(0xf2f5ff, { roughness: 0.3 }));
  g.add(web);
  return g;
};

/* ---------------- Homem de Ferro ---------------- */
B.ironman = () => {
  const g = newRig(), head = g.userData.head;
  const red = METAL(0xc2141b, { metalness: 0.55, roughness: 0.26 });
  const gold = METAL(0xffd45c, { metalness: 0.55, roughness: 0.22, emissive: 0x5a3a00, emissiveIntensity: 0.35 });
  head.add(S(1, red));
  // placa facial dourada
  cap(head, { theta: 1.98, dtheta: 1.42, dphi: 1.32, r: 1.012, mat: gold });
  // "queixo" dourado + linha central
  for (const s of [-1, 1]) {
    const e = eye(head, s, { lon: 0.3, lat: 0.08, w: 0.25, h: 0.135, slant: 0.22, noIris: true, r: 0.99 });
    e.children[0].children[0].material = P(0xeafcff, { emissive: 0xbdf3ff, emissiveIntensity: 1.6, roughness: 0.2 });
  }
  const mouthLine = new THREE.Group(); place(mouthLine, 0, -0.42, 1.014); head.add(mouthLine);
  const ml = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.3, 6, 10), P(0x7a4a10, { roughness: 0.4 })); ml.rotation.z = Math.PI / 2; mouthLine.add(ml);
  for (const s of [-1, 1]) { const g2 = new THREE.Group(); place(g2, s * 0.34, -0.3, 1.014); const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.22, 6, 10), P(0x7a4a10)); l.rotation.z = s * 0.5; g2.add(l); head.add(g2); }
  // torso
  const tg = torso(g, red);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 20, 48), gold); ring.position.set(0, 0.86, 0.5); g.add(ring);
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.16, 40), new THREE.MeshBasicMaterial({ color: 0xc8fbff, toneMapped: false })); core.position.set(0, 0.86, 0.52); g.add(core);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.36, 40), new THREE.MeshBasicMaterial({ color: 0x66e6ff, transparent: true, opacity: 0.28, toneMapped: false })); glow.position.set(0, 0.86, 0.505); g.add(glow);
  // cintura dourada
  cap(tg, { theta: 2.3, dtheta: 0.55, dphi: 6.283, r: 1.012, mat: gold });
  legs(g, { upper: gold, lower: red, foot: gold, bootTop: null });
  const palm = arm(g, 1, [0.95, 1.05, 0.35], [1.02, 1.28, 1.0], { mat: red, handMat: gold, handR: 0.23, cuff: gold });
  arm(g, -1, [0.9, 0.78, 0.1], [0.95, 0.42, 0.32], { mat: red, handMat: gold, cuff: gold });
  // repulsor
  const rp = new THREE.Mesh(new THREE.CircleGeometry(0.13, 32), new THREE.MeshBasicMaterial({ color: 0xc8fbff, toneMapped: false }));
  rp.position.set(1.02, 1.28, 1.0 + 0.2); g.add(rp);
  const rg = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), new THREE.MeshBasicMaterial({ color: 0x66e6ff, transparent: true, opacity: 0.3, toneMapped: false }));
  rg.position.set(1.02, 1.28, 1.19); g.add(rg);
  return g;
};

/* ---------------- Hulk ---------------- */
B.hulk = () => {
  const g = newRig(), head = g.userData.head;
  const green = P(0x6cc24a, { roughness: 0.5, clearcoat: 0.3, emissive: 0x0d2a06, emissiveIntensity: 0.2 });
  const hair = P(0x2a2233, { roughness: 0.55 });
  const purple = P(0x6a3fa6, { roughness: 0.6, clearcoat: 0.2 });
  head.add(S(1.02, green, 1.06, 0.98, 1));
  // cabelo
  const hc = new THREE.Mesh(new THREE.SphereGeometry(1.07, 48, 32, 0, 6.283, 0, 1.0), hair); hc.scale.set(1.06, 1, 1.02); hc.rotation.x = -0.12; head.add(hc);
  for (let i = 0; i < 6; i++) { const t = S(0.24, hair, 1, 0.85, 1); t.position.set(-0.6 + i * 0.24, 0.72 + (i % 2) * 0.03, 0.66 - Math.abs(i - 2.5) * 0.09); head.add(t); }
  for (const s of [-1, 1]) { const e = S(0.3, green, 0.6, 1, 0.6); e.position.set(s * 1.02, -0.05, 0); head.add(e); }
  for (const s of [-1, 1]) eye(head, s, { lon: 0.34, lat: 0.03, w: 0.2, h: 0.24, iris: 0x4a8a26, slant: 0.12, look: [0, -0.01], irisScale: 0.78 });
  brows(head, { lat: 0.33, lon: 0.34, len: 0.34, tilt: 0.22, color: 0x1e1726, r: 0.055 });
  const nose = S(0.09, green, 1.2, 0.9, 0.8); nose.position.set(0, -0.12, 0.98); head.add(nose);
  grin(head, { lat: -0.42, w: 0.3 });
  cheeks(head, { lon: 0.7, lat: -0.22, color: 0xd6f08a });
  // corpo forte
  const tg = torso(g, green, { sx: 0.8, sy: 0.7, sz: 0.58, y: 0.86 });
  for (const s of [-1, 1]) { const p = S(0.34, green, 1, 0.8, 0.6); p.position.set(s * 0.32, 1.0, 0.44); g.add(p); }
  // short roxo
  const sh = S(1, purple, 0.78, 0.5, 0.56); sh.position.y = 0.28; g.add(sh);
  legs(g, { upper: purple, lower: green, foot: green, x: 0.36, footScale: [0.36, 0.22, 0.48] });
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.14, 32), purple); c.position.set(s * 0.38, -0.1, 0.02); g.add(c); }
  // braços flexionando
  arm(g, 1, [1.32, 1.28, 0.1], [1.15, 1.9, 0.25], { r: 0.29, mat: green, handR: 0.34, shoulder: [0.78, 1.15, 0] });
  arm(g, -1, [1.32, 1.28, 0.1], [1.15, 1.9, 0.25], { r: 0.29, mat: green, handR: 0.34, shoulder: [0.78, 1.15, 0] });
  return g;
};

/* ---------------- Batman ---------------- */
B.batman = () => {
  const g = newRig(), head = g.userData.head;
  const black = P(0x14141c, { roughness: 0.32, clearcoat: 1, envMapIntensity: 1.2 });
  const suit = P(0x4a5878, { roughness: 0.4, clearcoat: 0.8 });
  const gold = METAL(0xf5c22e, { metalness: 0.5, roughness: 0.3 });
  head.add(S(1, black));
  // orelhas
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.85, 40), black); e.position.set(s * 0.58, 1.13, -0.05); e.rotation.z = -s * 0.28; head.add(e);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 32), P(0x2a2a3a)); inner.position.set(s * 0.58, 1.05, 0.06); inner.rotation.z = -s * 0.28; head.add(inner);
  }
  // rosto (pele) na parte de baixo
  cap(head, { theta: 2.28, dtheta: 1.1, dphi: 1.9, r: 1.012, mat: SKIN() });
  for (const s of [-1, 1]) eye(head, s, { lon: 0.36, lat: 0.06, w: 0.27, h: 0.22, slant: 0.32, noIris: true, outline: 0x0a0a10, r: 0.975 });
  // pupilas discretas nos olhos brancos
  for (const s of [-1, 1]) { const holder = new THREE.Group(); place(holder, s * 0.36, 0.06, 0.975); const p = S(1, BASIC(0x1a2233), 0.09, 0.1, 0.05); p.position.set(0, -0.01, 0.1); holder.add(p); head.add(holder); }
  grin(head, { lat: -0.42, w: 0.24 });
  cheeks(head, { lon: 0.62, lat: -0.25 });
  // corpo
  const tg = torso(g, suit);
  // emblema
  const emb = canvasTex(256, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.fillStyle = '#f7c823'; c.beginPath(); c.ellipse(128, 128, 122, 78, 0, 0, 7); c.fill();
    c.lineWidth = 8; c.strokeStyle = '#1a1a22'; c.stroke();
    c.fillStyle = '#14141c'; c.beginPath();
    c.moveTo(128, 88); c.lineTo(140, 78); c.lineTo(146, 92); c.quadraticCurveTo(168, 82, 200, 76); c.quadraticCurveTo(190, 96, 186, 112);
    c.quadraticCurveTo(172, 108, 164, 118); c.quadraticCurveTo(150, 112, 140, 138); c.lineTo(128, 172); c.lineTo(116, 138);
    c.quadraticCurveTo(106, 112, 92, 118); c.quadraticCurveTo(84, 108, 70, 112); c.quadraticCurveTo(66, 96, 56, 76);
    c.quadraticCurveTo(88, 82, 110, 92); c.lineTo(116, 78); c.lineTo(128, 88); c.fill();
  });
  cap(tg, { theta: 1.66, dtheta: 0.62, dphi: 0.98, mat: new THREE.MeshBasicMaterial({ map: emb, transparent: true, toneMapped: false }) });
  // cinto
  cap(tg, { theta: 2.28, dtheta: 0.28, dphi: 6.283, r: 1.012, mat: gold });
  legs(g, { upper: black, lower: black, foot: black, bootTop: suit });
  arm(g, 1, [0.9, 0.78, 0.12], [0.98, 0.45, 0.32], { mat: suit, handMat: black, cuff: black });
  arm(g, -1, [0.9, 0.78, 0.12], [0.98, 0.45, 0.32], { mat: suit, handMat: black, cuff: black });
  // capa
  const capeGeo = new THREE.CylinderGeometry(0.9, 1.55, 2.1, 48, 1, true, Math.PI - 1.25, 2.5);
  const capeMat = P(0x1a1a24, { roughness: 0.35, clearcoat: 0.9, side: THREE.DoubleSide, envMapIntensity: 1.2 });
  const capeM = new THREE.Mesh(capeGeo, capeMat); capeM.scale.z = 0.55; capeM.position.set(0, 0.55, -0.12); g.add(capeM);
  return g;
};

/* ---------------- Capitão América ---------------- */
B.captain = () => {
  const g = newRig(), head = g.userData.head;
  const blue = P(0x1c48b5, { roughness: 0.38, clearcoat: 0.9 });
  const red = P(0xcf1f2e, { roughness: 0.4, clearcoat: 0.8 });
  head.add(S(1, blue));
  cap(head, { theta: 2.05, dtheta: 1.66, dphi: 1.86, r: 1.012, mat: SKIN() });
  // "A" na testa
  const A = canvasTex(256, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.fill();
    c.fillStyle = '#1c48b5'; c.font = '900 170px Arial Black, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('A', 128, 138);
  });
  const a = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), new THREE.MeshBasicMaterial({ map: A, transparent: true, toneMapped: false }));
  const ah = new THREE.Group(); place(ah, 0, 0.68, 1.012); ah.add(a); head.add(ah);
  // asinhas
  for (const s of [-1, 1]) {
    const wgrp = new THREE.Group(); place(wgrp, s * 1.2, 0.3, 1.0); head.add(wgrp);
    for (let i = 0; i < 3; i++) {
      const f = S(1, P(0xffffff, { roughness: 0.3 }), 0.26 - i * 0.03, 0.06, 0.03); f.position.set(-s * 0.02, 0.02 + i * 0.09, 0.03); f.rotation.z = s * (0.18 + i * 0.22); wgrp.add(f);
    }
  }
  for (const s of [-1, 1]) eye(head, s, { lon: 0.36, lat: 0.02, w: 0.22, h: 0.28, iris: 0x2b78d6, look: [0.0, 0.0] });
  brows(head, { lat: 0.36, lon: 0.36, len: 0.3, tilt: 0.14, color: 0x6a4a22, r: 0.032 });
  grin(head, { lat: -0.42, w: 0.26 });
  cheeks(head, { lon: 0.66, lat: -0.22 });
  // torso com listras e estrela
  const tg = torso(g, blue); tg.remove(g.userData.torsoMesh);
  const tex = canvasTex(2048, 1024, (c, w, h) => {
    c.fillStyle = '#1c48b5'; c.fillRect(0, 0, w, h);
    const y0 = h * 0.6, n = 7, sh = (h - y0) / n;
    for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#cf1f2e'; c.fillRect(0, y0 + i * sh, w, sh + 1); }
    c.fillStyle = '#ffffff'; starPath(c, w * 0.25, h * 0.52, 118); c.fill();
  });
  const tm = S(1, P(0xffffff, { map: tex, roughness: 0.4, clearcoat: 0.8 })); tg.add(tm);
  cap(tg, { theta: 2.55, dtheta: 0.2, dphi: 6.283, r: 1.012, mat: P(0x6a3c1c, { roughness: 0.5 }) });
  legs(g, { upper: blue, lower: blue, foot: red, bootTop: red });
  // braço esquerdo dele (lado direito da tela) segura escudo
  arm(g, 1, [1.1, 0.95, 0.22], [1.25, 0.8, 0.6], { mat: blue, handMat: red, cuff: red });
  arm(g, -1, [0.9, 0.78, 0.12], [0.98, 0.45, 0.32], { mat: blue, handMat: red, cuff: red });
  // escudo
  const sh = new THREE.Group();
  const ringMat = METAL(0xd4d8e2, { metalness: 0.9, roughness: 0.2 });
  const layers = [[0.96, 0xcf1f2e, 0.0], [0.74, 0xf4f6fb, 0.03], [0.54, 0xcf1f2e, 0.06], [0.36, 0x1c48b5, 0.09]];
  for (const [r, col, z] of layers) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, 64), P(col, { metalness: 0.35, roughness: 0.28, clearcoat: 1 }));
    c.rotation.x = Math.PI / 2; c.position.z = z; sh.add(c);
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.05, 20, 64), ringMat); rim.position.z = 0.0; sh.add(rim);
  const star = canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; starPath(c, 128, 132, 118, 48); c.fill(); });
  const st = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), new THREE.MeshBasicMaterial({ map: star, transparent: true, toneMapped: false })); st.position.z = 0.147; sh.add(st);
  sh.position.set(1.42, 0.78, 0.75); sh.rotation.y = -0.4; sh.scale.setScalar(0.84); g.add(sh);
  return g;
};

/* ---------------- Thor ---------------- */
B.thor = () => {
  const g = newRig(), head = g.userData.head;
  const skin = SKIN();
  const hairMat = P(0xeeb63a, { roughness: 0.42, clearcoat: 0.6 });
  const navy = P(0x2c3b63, { roughness: 0.45, clearcoat: 0.7 });
  const silver = METAL(0xcfd6e6, { metalness: 0.85, roughness: 0.25 });
  const capeRed = P(0xc9202d, { roughness: 0.45, clearcoat: 0.6, side: THREE.DoubleSide });
  head.add(S(1, skin));
  // cabelo
  const top = new THREE.Mesh(new THREE.SphereGeometry(1.06, 56, 36, 0, 6.283, 0, 1.2), hairMat); top.rotation.x = -0.1; head.add(top);
  const back = S(1.06, hairMat, 1.02, 1.0, 0.86); back.position.set(0, -0.12, -0.2); head.add(back);
  for (const s of [-1, 1]) {
    const lock = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.75, 12, 24), hairMat); lock.position.set(s * 0.9, -0.42, -0.1); lock.rotation.z = -s * 0.1; head.add(lock);
    const b = S(0.28, hairMat, 1, 1, 1); b.position.set(s * 0.62, 0.62, 0.68); head.add(b);
  }
  for (let i = 0; i < 4; i++) { const t = S(0.28, hairMat, 1, 0.8, 0.8); t.position.set(-0.36 + i * 0.24, 0.78, 0.62); head.add(t); }
  // barba
  cap(head, { theta: 2.5, dtheta: 0.95, dphi: 1.55, r: 1.014, mat: P(0xe0b048, { roughness: 0.6 }) });
  for (const s of [-1, 1]) eye(head, s, { lon: 0.36, lat: 0.05, w: 0.22, h: 0.28, iris: 0x2d7fd8 });
  brows(head, { lat: 0.36, lon: 0.36, len: 0.3, tilt: 0.12, color: 0xb98a32, r: 0.035 });
  grin(head, { lat: -0.36, w: 0.24 });
  cheeks(head, { lon: 0.66, lat: -0.16 });
  // corpo
  const tg = torso(g, navy);
  cap(tg, { theta: 1.7, dtheta: 0.95, dphi: 1.55, r: 1.012, mat: silver });
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
    const st = S(0.055, METAL(0xf0c24a, { metalness: 0.9, roughness: 0.2 })); st.position.set(s * 0.13, 0.92 - i * 0.16, 0.53 - (i === 1 ? 0 : 0.0)); g.add(st);
  }
  cap(tg, { theta: 2.3, dtheta: 0.28, dphi: 6.283, r: 1.012, mat: P(0x6a4a2a, { roughness: 0.5 }) });
  legs(g, { upper: navy, lower: navy, foot: P(0x5a4a3a), bootTop: silver });
  // capa vermelha
  const capeM = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.7, 2.4, 48, 1, true, Math.PI - 1.15, 2.3), capeRed); capeM.scale.z = 0.5; capeM.position.set(0, 0.45, -0.15); g.add(capeM);
  // braços: direito da tela segura o martelo levantado
  const hand = arm(g, 1, [1.15, 1.1, 0.12], [1.5, 1.5, 0.2], { mat: navy, handMat: silver, cuff: silver, handR: 0.22 });
  arm(g, -1, [0.9, 0.78, 0.12], [0.95, 0.45, 0.32], { mat: navy, handMat: silver, cuff: silver });
  // Mjölnir
  const mj = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.15, 24), P(0x6a4426, { roughness: 0.5 })); handle.position.y = 0.32; mj.add(handle);
  const headM = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.5, 0.5, 6, 0.09), METAL(0xaab2c4, { metalness: 0.9, roughness: 0.22 })); headM.position.y = 1.0; mj.add(headM);
  for (const s of [-1, 1]) { const band = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.52, 0.52, 4, 0.03), METAL(0x7c86a0, { metalness: 0.9, roughness: 0.3 })); band.position.set(s * 0.32, 1.0, 0); mj.add(band); }
  mj.position.set(1.5, 1.5, 0.2); mj.rotation.z = -0.18; g.add(mj);
  // raios
  const boltMat = new THREE.MeshBasicMaterial({ color: 0xbff4ff, toneMapped: false });
  const bolt = (pts, r = 0.028) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.05), 24, r, 6), boltMat); g.add(m); };
  bolt([[1.15, 2.4, 0.4], [1.28, 2.55, 0.42], [1.2, 2.66, 0.4], [1.36, 2.82, 0.42]]);
  bolt([[1.9, 2.3, 0.4], [1.78, 2.44, 0.4], [1.88, 2.5, 0.4], [1.74, 2.68, 0.4]]);
  bolt([[1.02, 2.18, 0.4], [0.92, 2.3, 0.4], [1.0, 2.36, 0.4]], 0.022);
  return g;
};

/* ---------------- Pantera Negra ---------------- */
B.panther = () => {
  const g = newRig(), head = g.userData.head;
  const black = P(0x1c1c2c, { roughness: 0.28, clearcoat: 1, envMapIntensity: 1.6 });
  const suit = P(0x2a2a44, { roughness: 0.3, clearcoat: 1, envMapIntensity: 1.6 });
  const silver = METAL(0xc9d0e0, { metalness: 0.9, roughness: 0.22 });
  const glow = GLOW(0xa66bff, 2.2);
  head.add(S(1, black));
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.62, 40), black); e.position.set(s * 0.6, 0.98, -0.02); e.rotation.z = -s * 0.32; head.add(e);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 32), silver); inner.position.set(s * 0.6, 0.94, 0.07); inner.rotation.z = -s * 0.32; head.add(inner);
  }
  for (const s of [-1, 1]) eye(head, s, { lon: 0.38, lat: 0.06, w: 0.28, h: 0.21, slant: 0.3, noIris: true, outline: 0x08080e, r: 0.972 });
  for (const s of [-1, 1]) { const holder = new THREE.Group(); place(holder, s * 0.38, 0.06, 0.972); const p = S(1, BASIC(0x241a3a), 0.09, 0.1, 0.05); p.position.set(0, -0.01, 0.1); holder.add(p); head.add(holder); }
  smileLine(head, { lat: -0.42, w: 0.16, color: 0x8f99b4 });
  const nose = S(0.07, P(0x2a2a3a, { clearcoat: 1 }), 1.3, 0.8, 0.7); nose.position.set(0, -0.14, 0.985); head.add(nose);
  const tg = torso(g, suit);
  // linhas prateadas do peito
  const lines = canvasTex(256, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = '#c9d0e0'; c.lineWidth = 14; c.lineCap = 'round';
    c.beginPath(); c.moveTo(30, 40); c.lineTo(128, 150); c.lineTo(226, 40); c.stroke();
    c.beginPath(); c.moveTo(128, 150); c.lineTo(128, 236); c.stroke();
    c.strokeStyle = '#a66bff'; c.lineWidth = 7; c.beginPath(); c.moveTo(60, 60); c.lineTo(128, 138); c.lineTo(196, 60); c.stroke();
  });
  cap(tg, { theta: 1.7, dtheta: 0.9, dphi: 1.1, mat: new THREE.MeshBasicMaterial({ map: lines, transparent: true, toneMapped: false }) });
  cap(tg, { theta: 2.3, dtheta: 0.26, dphi: 6.283, r: 1.012, mat: silver });
  // colar de vibranium
  for (let i = 0; i < 9; i++) {
    const a = -1.25 + i * (2.5 / 8);
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 20), silver);
    c.position.set(Math.sin(a) * 0.7, 0.98 - Math.abs(a) * 0.12, Math.cos(a) * 0.5);
    c.rotation.z = Math.PI + Math.sin(a) * 0.45; c.rotation.x = 0.25; g.add(c);
  }
  legs(g, { upper: suit, lower: suit, foot: black, bootTop: silver });
  arm(g, 1, [0.95, 0.9, 0.2], [0.6, 0.85, 0.72], { mat: suit, handMat: black, cuff: silver });
  arm(g, -1, [0.95, 0.9, 0.2], [0.6, 0.85, 0.72], { mat: suit, handMat: black, cuff: silver });
  return g;
};

/* ---------- monta, renderiza, sinaliza pronto ---------- */
const rig = B[HERO]();
rig.rotation.y = YAW;
rig.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
// decalques/olhos MeshBasic não precisam receber sombra
rig.traverse(o => { if (o.isMesh && o.material.isMeshBasicMaterial) { o.castShadow = false; o.receiveShadow = false; } });
scene.add(rig);
renderer.render(scene, camera);
renderer.render(scene, camera);
window.__ready = true;

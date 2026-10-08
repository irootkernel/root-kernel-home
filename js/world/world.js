// world.js — B's createWorld (deep/index.html 853–2265) moved into a module, plus the
// WorldAdapter hooks the journey needs (bench slab, human beam, dispatch pulses, rim sparks,
// reverse current, creature bench modes) and the above-surface product scene.
// Only this file (and director.js through the object it returns) touches three.js.
import * as THREE from 'three';
import { clamp, lerp, sstep, ease, REDUCED } from '../core.js?v=0cd00b25fdf6';
import { SVC_KEYS } from '../content.js?v=0cd00b25fdf6';

const eOut3 = ease.out3, eIn3 = ease.in3, eIO3 = ease.io3, eIOs = ease.ios;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

// quality tiers (SPEC-engineering §4). Counts are allocated at the boot tier; runtime changes only go down.
export const TIERS = {
  high: { dpr: 1.75, msaa: 4, levels: 5, snow: 2600, swarm: 1800, logo: 7600, pod: 9, lite: false },
  mid: { dpr: 1.25, msaa: 0, levels: 4, snow: 1600, swarm: 1400, logo: 5600, pod: 8, lite: false },
  low: { dpr: 1.0, msaa: 0, levels: 3, snow: 900, swarm: 800, logo: 3600, pod: 6, lite: true },
};
export { THREE };

const NOISE = /* glsl */`
float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float vnoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y); }
`;

// Night sky above the surface (products live up here). Shared by the background and the
// sea-from-above reflections. Needs NOISE. landDir: unit xz direction of Sudal's warm light.
const SKY = /* glsl */`
float starField(vec3 dir, float t){
  if (dir.y <= 0.004) return 0.0;
  vec2 sp = dir.xz / (dir.y + 0.28) * 30.0;
  vec2 cell = floor(sp); vec2 f = fract(sp) - 0.5;
  float r = hash21(cell);
  vec2 o = (hash22(cell + 7.0) - 0.5) * 0.6;
  float d = length(f - o);
  float lit = step(0.976, r) * exp(-d * d * 150.0);
  float tw = 0.6 + 0.4 * sin(t * (0.7 + r * 2.3) + r * 61.0);
  return lit * tw * (0.35 + 2.2 * pow(hash11(r * 91.7), 3.0)) * smoothstep(0.0, 0.2, dir.y);
}
vec3 skyCol(vec3 dir, float t, vec2 landDir, float warm){
  float up = dir.y;
  float h = clamp(up, 0.0, 1.0);
  vec3 c = mix(vec3(0.017, 0.066, 0.086), vec3(0.0036, 0.017, 0.029), smoothstep(0.0, 0.2, h));
  c = mix(c, vec3(0.0009, 0.003, 0.0072), smoothstep(0.14, 0.8, h));
  c = mix(c, vec3(0.005, 0.022, 0.03), smoothstep(0.0, -0.1, up));
  vec2 hz = dir.xz / max(length(dir.xz), 1e-4);
  float az = max(dot(hz, landDir), 0.0);
  c += vec3(0.19, 0.078, 0.026) * pow(az, 14.0) * exp(-abs(up) * 13.0) * (0.7 + warm * 1.2);
  float veil = vnoise(vec2(atan(hz.y, hz.x) * 2.6 + t * 0.012, up * 3.4 - t * 0.018));
  c += vec3(0.003, 0.026, 0.028) * smoothstep(0.52, 0.95, veil) * smoothstep(0.12, 0.42, up) * (1.0 - smoothstep(0.62, 0.95, up));
  c += vec3(0.82, 0.9, 1.0) * starField(dir, t) * 0.11;
  return c;
}
`;

// scene constants (world units)
const SURF = 26;
const LY = [0, -80, -160, -240, -346];
const SEABED = -262, FLOOR = -368;
const RIFT = { x: 70, z0: 20, z1: -150, r: 52, wall: 18 };
const KER = new THREE.Vector3(70, -350, -100);
const HUMAN = new THREE.Vector3(0, 22.6, -10.5);

// terrain function (shared by mesh + placement)
function h2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vn2(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi; const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf); const a = h2(xi, zi), b = h2(xi + 1, zi), c = h2(xi, zi + 1), d = h2(xi + 1, zi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbm2(x, z) { let s = 0, a = 0.5; for (let i = 0; i < 4; i++) { s += a * vn2(x, z); x = x * 2.03 + 11.3; z = z * 2.03 + 7.7; a *= 0.5; } return s; }
function riftD(x, z) { const zc = Math.max(RIFT.z1, Math.min(RIFT.z0, z)); return Math.hypot(x - RIFT.x, z - zc); }
function seabedH(x, z) {
  let h = SEABED + (fbm2(x * 0.022, z * 0.022) - 0.5) * 10 + (fbm2(x * 0.08 + 3, z * 0.08) - 0.5) * 2.4;
  h += sstep(80, 220, Math.hypot(x + 10, z + 90)) * 16; // basin rim
  const d = riftD(x, z);
  const t = Math.pow(sstep(RIFT.r, RIFT.r - RIFT.wall, d), 0.75);
  const fl = FLOOR + (fbm2(x * 0.05 + 9, z * 0.05) - 0.5) * 5;
  return lerp(h, fl, t);
}

export function createWorld(opts = {}) {
  const canvas = opts.canvas || document.getElementById('gl');
  let tierName = TIERS[opts.tier] ? opts.tier : 'high';
  const narrow0 = !!opts.narrow;
  // mobile "lite" (SPEC-experience §4): DPR 1.25, bloom 3, snow 700, pod 5
  const P = { ...TIERS[tierName] };
  if (tierName === 'low' && narrow0) Object.assign(P, { dpr: 1.25, snow: 700, pod: 5 });
  const LITE = P.lite;
  // the canvas box excludes a classic scrollbar gutter, so DOM rects and projections agree
  const size = () => [Math.max(1, canvas.clientWidth || innerWidth), Math.max(1, canvas.clientHeight || innerHeight)];
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  let DPR_MAX = P.dpr;
  let dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
  const scene = new THREE.Scene();
  const [vw0, vh0] = size();
  const camera = new THREE.PerspectiveCamera(45, vw0 / vh0, 0.1, 900);
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const aspectMats = [];   // materials with uAspect
  const pixMats = [];      // materials with uPix (point sizes)
  const W = { renderer, scene, camera, THREE, V3, tier: tierName };
  let vw = vw0, vh = vh0, bw = 1, bh = 1;

  /* ---------- post pipeline ---------- */
  let rtScene = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true, stencilBuffer: false, samples: P.msaa });
  const LEVELS = P.levels;
  let LV = LEVELS;          // active bloom levels (setLoad/setTier step it down)
  const mk = () => new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false });
  const down = Array.from({ length: LEVELS }, mk), up = Array.from({ length: LEVELS }, mk);
  const fsGeo = new THREE.BufferGeometry();
  fsGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  fsGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const fsMesh = new THREE.Mesh(fsGeo); fsMesh.frustumCulled = false;
  const fsScene = new THREE.Scene(); fsScene.add(fsMesh);
  const FS_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const downMat = new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThr: { value: 0.0 }, uFirst: { value: 0 } },
    vertexShader: FS_VS,
    fragmentShader: `uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThr; uniform float uFirst; varying vec2 vUv;
      vec3 S(vec2 o){ return texture2D(tSrc, vUv + o * uTexel).rgb; }
      void main(){
        vec3 c = S(vec2(0.0)) * 4.0 + S(vec2(-1.0,-1.0)) + S(vec2(1.0,-1.0)) + S(vec2(-1.0,1.0)) + S(vec2(1.0,1.0));
        c /= 8.0;
        if (uFirst > 0.5) { if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0); float l = max(c.r, max(c.g, c.b)); c *= smoothstep(uThr, uThr + 0.9, l); c = clamp(c, vec3(0.0), vec3(10.0)); }
        gl_FragColor = vec4(c, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const upMat = new THREE.ShaderMaterial({
    uniforms: { tLow: { value: null }, tCur: { value: null }, uTexel: { value: new THREE.Vector2() }, uW: { value: 1 } },
    vertexShader: FS_VS,
    fragmentShader: `uniform sampler2D tLow; uniform sampler2D tCur; uniform vec2 uTexel; uniform float uW; varying vec2 vUv;
      void main(){
        vec3 c = vec3(0.0);
        c += texture2D(tLow, vUv + vec2(-2.0, 0.0) * uTexel).rgb;
        c += texture2D(tLow, vUv + vec2( 2.0, 0.0) * uTexel).rgb;
        c += texture2D(tLow, vUv + vec2( 0.0,-2.0) * uTexel).rgb;
        c += texture2D(tLow, vUv + vec2( 0.0, 2.0) * uTexel).rgb;
        c += texture2D(tLow, vUv + vec2(-1.0, 1.0) * uTexel).rgb * 2.0;
        c += texture2D(tLow, vUv + vec2( 1.0, 1.0) * uTexel).rgb * 2.0;
        c += texture2D(tLow, vUv + vec2(-1.0,-1.0) * uTexel).rgb * 2.0;
        c += texture2D(tLow, vUv + vec2( 1.0,-1.0) * uTexel).rgb * 2.0;
        gl_FragColor = vec4(texture2D(tCur, vUv).rgb + c / 12.0 * uW, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const compMat = new THREE.ShaderMaterial({
    uniforms: { tScene: { value: null }, tBloom: { value: null }, uBloom: { value: 0.95 }, uFade: { value: 0 }, uWarm: { value: 0 }, uTime: { value: 0 }, uExpo: { value: 1.05 }, uAsp: { value: 1 }, uRed: { value: 0 }, uWarmPos: { value: new THREE.Vector2(0.5, 0.7) } },
    vertexShader: FS_VS,
    fragmentShader: `uniform sampler2D tScene; uniform sampler2D tBloom; uniform float uBloom; uniform float uFade; uniform float uWarm; uniform float uTime; uniform float uExpo; uniform float uAsp; uniform float uRed; uniform vec2 uWarmPos; varying vec2 vUv;
      float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      void main(){
        vec2 dc = vUv - 0.5;
        float r2 = dot(dc * vec2(uAsp, 1.0), dc * vec2(uAsp, 1.0));
        vec3 col;
        vec2 ca = dc * 0.0028 * (0.4 + r2);
        col.r = texture2D(tScene, vUv - ca).r;
        col.g = texture2D(tScene, vUv).g;
        col.b = texture2D(tScene, vUv + ca).b;
        vec3 b = texture2D(tBloom, vUv).rgb;
        if (any(isnan(col)) || any(isinf(col))) col = vec3(0.0);
        if (any(isnan(b))) b = vec3(0.0);
        col = min(col, vec3(24.0));
        col += b * uBloom;
        vec2 wd = (vUv - uWarmPos) * vec2(uAsp, 1.0); float wr = dot(wd, wd);
        col += vec3(1.0, 0.66, 0.36) * uWarm * (0.9 * exp(-wr * 7.0) + 0.16 * exp(-wr * 1.4));
        col += vec3(0.9, 0.04, 0.07) * uRed * 0.035 * exp(-r2 * 2.0);
        col *= uExpo;
        col = aces(col);
        float vig = smoothstep(1.25, 0.25, length(dc * vec2(1.0, 1.12)) * 1.35);
        col *= mix(0.62, 1.0, vig);
        col = pow(col, vec3(1.0 / 2.2));
        float n = h(gl_FragCoord.xy + fract(uTime * 7.13) * 91.0);
        col += (n - 0.5) * (2.0 / 255.0);
        col += (h(gl_FragCoord.xy * 0.5 + uTime) - 0.5) * 0.014;
        gl_FragColor = vec4(col * uFade, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  function pass(mat, target) { fsMesh.material = mat; renderer.setRenderTarget(target); renderer.render(fsScene, fsCam); }

  /* ---------- 3.1 water background ---------- */
  const bgMat = new THREE.ShaderMaterial({
    uniforms: { uIVP: { value: new THREE.Matrix4() }, uCam: { value: V3() }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uDepth: { value: 0 }, uWarm: { value: 0 }, uAbove: { value: 0 }, uLandDir: { value: new THREE.Vector2(0.6, -0.8) } },
    vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    fragmentShader: `${NOISE}${SKY}
      uniform mat4 uIVP; uniform vec3 uCam; uniform vec2 uRes; uniform float uTime; uniform float uDepth; uniform float uWarm; uniform float uAbove; uniform vec2 uLandDir;
      void main(){
        vec2 ndc = gl_FragCoord.xy / uRes * 2.0 - 1.0;
        vec4 w = uIVP * vec4(ndc, 1.0, 1.0);
        vec3 dir = normalize(w.xyz / w.w - uCam);
        float up = dir.y;
        float d = uDepth;
        float lit = exp(-d * 5.4);
        vec3 cUp = vec3(0.0105, 0.064, 0.074);
        vec3 cMid = vec3(0.0021, 0.0128, 0.0158);
        vec3 cDn = vec3(0.0004, 0.0024, 0.0034);
        vec3 col = mix(cMid, cUp, smoothstep(-0.02, 0.9, up));
        col = mix(col, cDn, smoothstep(0.0, -0.7, up));
        col *= mix(0.14, 1.0, lit);
        col += vec3(0.0007, 0.0065, 0.008) * smoothstep(0.62, 1.0, d);
        vec2 hz = dir.xz / max(length(dir.xz), 1e-4);
        float a = vnoise(hz * 3.4 + vec2(uTime * 0.018, -uTime * 0.011));
        float b = vnoise(hz * 9.5 + vec2(-uTime * 0.03, uTime * 0.017));
        float s = smoothstep(0.5, 1.0, a * 0.6 + b * 0.4);
        float mask = smoothstep(-0.28, 0.55, up) * (1.0 - smoothstep(0.78, 0.99, up));
        col += vec3(0.085, 0.30, 0.32) * s * s * mask * mix(0.1, 1.0, exp(-d * 2.6)) * 0.6;
        col += vec3(0.04, 0.13, 0.14) * pow(max(up, 0.0), 5.0) * lit;
        col *= 0.94 + 0.12 * vnoise(dir.xy * 2.3 + dir.z + uTime * 0.01);
        col += vec3(0.05, 0.035, 0.02) * uWarm * smoothstep(-0.2, 0.9, up);
        if (uAbove > 0.001) col = mix(col, skyCol(dir, uTime, uLandDir, uWarm), uAbove);
        gl_FragColor = vec4(col, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const bg = new THREE.Mesh(fsGeo, bgMat); bg.frustumCulled = false; bg.renderOrder = -100;
  scene.add(bg);

  /* ---------- 3.2 the surface: Snell's window + caustics ---------- */
  const surfMat = new THREE.ShaderMaterial({
    uniforms: { uCam: { value: V3() }, uTime: { value: 0 }, uVis: { value: 1 }, uWarm: { value: 0 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `${NOISE}
      uniform vec3 uCam; uniform float uTime; uniform float uVis; uniform float uWarm; varying vec3 vW;
      float voro(vec2 p, float t){
        vec2 n = floor(p), f = fract(p); float f1 = 8.0, f2 = 8.0;
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 g = vec2(float(i), float(j)); vec2 o = hash22(n + g); o = 0.5 + 0.42 * sin(t + 6.2831 * o);
          float dd = length(g + o - f);
          if (dd < f1) { f2 = f1; f1 = dd; } else if (dd < f2) { f2 = dd; }
        }
        return f2 - f1;
      }
      void main(){
        vec3 v = normalize(vW - uCam);
        float n = vnoise(vW.xz * 0.05 + uTime * 0.11) + vnoise(vW.xz * 0.12 - uTime * 0.09);
        float c = v.y + (n - 1.0) * 0.035;
        float win = smoothstep(0.775, 0.815, c);
        float halo = exp(-max(0.0, 0.8 - c) * 6.5);
        float edge = exp(-pow((c - 0.8) * 32.0, 2.0));
        vec2 q = vW.xz * 0.15;
        q += vec2(vnoise(q * 0.7 + uTime * 0.05), vnoise(q * 0.7 + 3.7 - uTime * 0.04)) * 1.5;
        float e1 = voro(q, uTime * 0.5);
        float e2 = voro(q * 1.73 + 4.1, uTime * 0.66 + 2.0);
        float caus = pow(1.0 - smoothstep(0.0, 0.14, e1), 3.0) * 0.62 + pow(1.0 - smoothstep(0.0, 0.1, e2), 3.0) * 0.4;
        float e3 = voro(vW.xz * 0.33 + q * 0.4, uTime * 0.8 + 5.0);
        float fine = pow(1.0 - smoothstep(0.0, 0.09, e3), 3.0);
        vec3 skyC = mix(vec3(0.58, 0.86, 0.88), vec3(1.0, 0.84, 0.66), uWarm);
        vec3 under = vec3(0.004, 0.02, 0.024) * (0.3 + 1.5 * caus);
        vec3 col = under + skyC * (0.78 + 0.22 * caus + 0.3 * fine) * win * 0.72 + skyC * halo * (1.0 - win) * (0.06 + 0.12 * caus) + vec3(0.42, 0.8, 0.82) * edge * 0.45 * (0.6 + caus);
        float graze = smoothstep(0.1, 0.42, v.y);
        float dist = length(vW - uCam);
        col *= exp(-dist * 0.0035) * graze;
        gl_FragColor = vec4(col * uVis, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const surfGeo = new THREE.PlaneGeometry(1400, 1400, 1, 1); surfGeo.rotateX(Math.PI / 2);
  const surface = new THREE.Mesh(surfGeo, surfMat); surface.position.y = SURF; surface.frustumCulled = false;
  scene.add(surface);

  /* ---------- 3.2b the sea seen from above (the product layer is over the surface) ---------- */
  const seaTopMat = new THREE.ShaderMaterial({
    uniforms: { uCam: { value: V3() }, uTime: { value: 0 }, uVis: { value: 0 }, uWarm: { value: 0 }, uLandDir: bgMat.uniforms.uLandDir, uL1: { value: V3(100, SURF + 8, -200) }, uL2: { value: V3(60, SURF + 3, -60) }, uL1I: { value: 1 }, uL2I: { value: 1 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `${NOISE}${SKY}
      uniform vec3 uCam; uniform float uTime; uniform float uVis; uniform float uWarm; uniform vec2 uLandDir; uniform vec3 uL1; uniform vec3 uL2; uniform float uL1I; uniform float uL2I; varying vec3 vW;
      float wav(vec2 p){ return vnoise(p * 0.19 + vec2(uTime * 0.05, uTime * 0.03)) * 0.9 + vnoise(p * 0.61 - vec2(uTime * 0.09, -uTime * 0.05)) * 0.34 + vnoise(p * 1.8 + uTime * 0.21) * 0.1; }
      void main(){
        vec3 v = normalize(vW - uCam);
        float dist = length(vW - uCam);
        vec2 q = vW.xz; float e = 0.25;
        float h0 = wav(q), hx = wav(q + vec2(e, 0.0)), hz = wav(q + vec2(0.0, e));
        float k = 1.3 / (1.0 + dist * 0.018);
        vec3 n = normalize(vec3(-(hx - h0) / e * k, 1.0, -(hz - h0) / e * k));
        vec3 r = reflect(v, n); r.y = abs(r.y);
        float fres = 0.025 + 0.975 * pow(1.0 - max(dot(-v, n), 0.0), 5.0);
        vec3 col = vec3(0.0007, 0.0042, 0.0058) + skyCol(r, uTime, uLandDir, uWarm) * fres * 1.15;
        float sparkle = 0.55 + 0.45 * sin(q.x * 3.1 + uTime * 2.3) * sin(q.y * 2.7 - uTime * 1.9);
        float g1 = pow(max(dot(r, normalize(uL1 - vW)), 0.0), 320.0);
        float g2 = pow(max(dot(r, normalize(uL2 - vW)), 0.0), 420.0);
        float near = exp(-dist * 0.004);
        col += (vec3(1.0, 0.6, 0.28) * g1 * 2.6 * uL1I + vec3(1.0, 0.38, 0.1) * g2 * 2.2 * uL2I) * sparkle * (0.35 + 0.65 * near);
        vec3 haze = skyCol(normalize(vec3(v.x, 0.002, v.z)), uTime, uLandDir, uWarm);
        col = mix(col, haze, smoothstep(170.0, 660.0, dist));
        gl_FragColor = vec4(col * uVis, 1.0);
      }`,
  });
  const seaTopGeo = new THREE.PlaneGeometry(1400, 1400, 1, 1); seaTopGeo.rotateX(-Math.PI / 2);
  const seaTop = new THREE.Mesh(seaTopGeo, seaTopMat); seaTop.position.y = SURF; seaTop.frustumCulled = false; seaTop.visible = false;
  scene.add(seaTop);

  /* ---------- 3.3 marine snow (streaking instanced quads) ---------- */
  const SNOW_N = P.snow;
  const snowGeo = new THREE.InstancedBufferGeometry();
  snowGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
  snowGeo.setIndex([0, 1, 2, 0, 2, 3]);
  const seeds = new Float32Array(SNOW_N * 4);
  for (let i = 0; i < SNOW_N * 4; i++) seeds[i] = Math.random();
  snowGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  snowGeo.instanceCount = SNOW_N;
  const snowMat = new THREE.ShaderMaterial({
    uniforms: { uCam: { value: V3() }, uBox: { value: V3(84, 70, 110) }, uTime: { value: 0 }, uVel: { value: V3() }, uShutter: { value: 0.045 }, uAspect: { value: 1 }, uMinPx: { value: 0.0012 }, uWarm: { value: 0 }, uBright: { value: 1 }, uPtr: { value: new THREE.Vector2(9, 9) }, uPtrOn: { value: 0 } },
    vertexShader: `attribute vec4 aSeed;
      uniform vec3 uCam; uniform vec3 uBox; uniform float uTime; uniform vec3 uVel; uniform float uShutter; uniform float uAspect; uniform float uMinPx; uniform vec2 uPtr; uniform float uPtrOn;
      varying vec2 vQ; varying float vL; varying float vA; varying float vS;
      void main(){
        vec3 p = aSeed.xyz * uBox;
        float t = uTime;
        p.y -= t * (0.12 + 0.34 * aSeed.w);
        p.x += sin(t * 0.21 + aSeed.y * 31.0) * 0.9;
        p.z += cos(t * 0.17 + aSeed.x * 29.0) * 0.9;
        vec3 rel = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5;
        vec4 mv = viewMatrix * vec4(uCam + rel, 1.0);
        float depth = max(-mv.z, 0.3);
        float size = mix(0.02, 0.075, aSeed.w * aSeed.w);
        float near = 1.0 - smoothstep(1.2, 7.0, depth);
        size *= 1.0 + near * 5.0 * step(0.72, aSeed.w);
        vec3 vv = (viewMatrix * vec4(uVel, 0.0)).xyz;
        vec4 c0 = projectionMatrix * mv;
        vec4 c1 = projectionMatrix * vec4(mv.xyz + vv * uShutter, 1.0);
        vec2 asp = vec2(uAspect, 1.0);
        vec2 n0 = c0.xy / c0.w, n1 = c1.xy / max(c1.w, 0.05);
        vec2 dpp = (n0 - uPtr) * vec2(uAspect, 1.0);
        float stir = exp(-dot(dpp, dpp) * 16.0) * uPtrOn * (1.0 - smoothstep(14.0, 46.0, depth));
        size *= 1.0 + stir * 2.2;
        n0 += normalize(dpp + 1e-5) / vec2(uAspect, 1.0) * stir * 0.012; n1 += normalize(dpp + 1e-5) / vec2(uAspect, 1.0) * stir * 0.012;
        vec2 d = (n0 - n1) * asp;
        float L = min(length(d), 0.5);
        vec2 ax = L > 1e-5 ? normalize(d) : vec2(0.0, 1.0);
        vec2 bx = vec2(ax.y, -ax.x);
        float r = max(size * projectionMatrix[1][1] / c0.w, uMinPx);
        vec2 ctr = (n0 + n1) * 0.5 * asp;
        float hl = L * 0.5 + r;
        vec2 q = position.xy;
        vec2 sp = ctr + ax * q.y * 2.0 * hl + bx * q.x * 2.0 * r;
        gl_Position = vec4(sp / asp * c0.w, c0.z, c0.w);
        vQ = vec2(q.x * 2.0, q.y * 2.0 * hl / r);
        vL = L * 0.5 / r;
        float edge = max(max(abs(rel.x) / uBox.x, abs(rel.y) / uBox.y), abs(rel.z) / uBox.z) * 2.0;
        vA = (1.0 - smoothstep(0.72, 1.0, edge)) * (0.22 + 0.78 * aSeed.w) * (1.0 - near * 0.82) * exp(-depth * 0.02);
        vA /= (1.0 + min(vL, 40.0) * 0.07);
        vA *= 1.0 + stir * 11.0; vS = stir;
      }`,
    fragmentShader: `uniform float uWarm; uniform float uBright; varying vec2 vQ; varying float vL; varying float vA; varying float vS;
      void main(){
        float a = max(abs(vQ.y) - vL, 0.0);
        float f = exp(-(a * a + vQ.x * vQ.x) * 3.2);
        if (f < 0.01) discard;
        vec3 c = mix(mix(vec3(0.50, 0.82, 0.84), vec3(0.2, 1.0, 0.9), vS), vec3(1.0, 0.80, 0.58), uWarm);
        gl_FragColor = vec4(c * f * vA * uBright, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  aspectMats.push(snowMat);
  const snow = new THREE.Mesh(snowGeo, snowMat); snow.frustumCulled = false;
  scene.add(snow);

  /* ---------- helpers: soft points material ---------- */
  const POINT_FS = `varying vec3 vCol; varying float vA;
    void main(){ vec2 d = gl_PointCoord - 0.5; float r2 = dot(d, d) * 4.0; float f = exp(-r2 * 3.6); if (f < 0.02) discard; gl_FragColor = vec4(vCol * f * vA, 1.0); }`;

  /* ---------- 3.4 logo formed from bioluminescent particles ---------- */
  const LOGO_N = P.logo;
  const logoPts = sampleLogo(LOGO_N);
  const lg = new THREE.BufferGeometry();
  const lgT = new Float32Array(LOGO_N * 3), lgS = new Float32Array(LOGO_N * 3), lgR = new Float32Array(LOGO_N * 4), lgK = new Float32Array(LOGO_N);
  for (let i = 0; i < LOGO_N; i++) {
    const p = logoPts[i];
    lgT[i * 3] = p.x; lgT[i * 3 + 1] = p.y; lgT[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    const a = Math.random() * Math.PI * 2, r = 14 + Math.random() * 26;
    lgS[i * 3] = Math.cos(a) * r; lgS[i * 3 + 1] = (Math.random() - 0.35) * 26; lgS[i * 3 + 2] = Math.sin(a) * r * 0.6 - 6;
    lgR[i * 4] = Math.random(); lgR[i * 4 + 1] = Math.random(); lgR[i * 4 + 2] = Math.random(); lgR[i * 4 + 3] = Math.random();
    lgK[i] = p.k;
  }
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LOGO_N * 3), 3));
  lg.setAttribute('aTarget', new THREE.BufferAttribute(lgT, 3));
  lg.setAttribute('aStart', new THREE.BufferAttribute(lgS, 3));
  lg.setAttribute('aRand', new THREE.BufferAttribute(lgR, 4));
  lg.setAttribute('aKind', new THREE.BufferAttribute(lgK, 1));
  const logoMat = new THREE.ShaderMaterial({
    uniforms: { uForm: { value: 0 }, uDis: { value: 0 }, uTime: { value: 0 }, uOrigin: { value: V3(0, 19, -28) }, uScale: { value: 0.1 }, uRight: { value: V3(1, 0, 0) }, uUp: { value: V3(0, 1, 0) }, uCaret: { value: V3() }, uCaretW: { value: 0.1 }, uPix: { value: 500 }, uBar: { value: V3(0.75, -24.25, 0) } },
    vertexShader: `attribute vec3 aTarget; attribute vec3 aStart; attribute vec4 aRand; attribute float aKind;
      uniform float uForm; uniform float uDis; uniform float uTime; uniform vec3 uOrigin; uniform float uScale; uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uCaret; uniform float uCaretW; uniform float uPix; uniform vec3 uBar;
      varying vec3 vCol; varying float vA;
      void main(){
        float delay = aRand.x * 0.42;
        float f = clamp((uForm - delay) / 0.58, 0.0, 1.0);
        float e = 1.0 - pow(1.0 - f, 3.0);
        vec3 formed = uOrigin + (uRight * aTarget.x + uUp * aTarget.y) * uScale + cross(uRight, uUp) * aTarget.z * uScale * 6.0;
        formed += vec3(sin(uTime * 1.7 + aRand.y * 30.0), cos(uTime * 1.3 + aRand.z * 30.0), sin(uTime * 1.1 + aRand.w * 30.0)) * 0.018;
        vec3 sw = vec3(sin(uTime * 0.9 + aRand.y * 6.28) * 2.6, cos(uTime * 0.7 + aRand.z * 6.28) * 1.8, sin(uTime * 0.8 + aRand.w * 6.28) * 2.6) * (1.0 - e);
        vec3 p = mix(uOrigin + aStart, formed, e) + sw;
        float alpha = smoothstep(0.0, 0.3, f);
        float size = 0.05 + aRand.w * 0.075;
        if (aKind < 0.5 || aKind > 1.5) {
          float d = clamp((uDis - aRand.x * 0.35) / 0.65, 0.0, 1.0);
          float de = d * d;
          vec3 drift = vec3(sin(aRand.y * 40.0 + uTime * 0.5) * 0.8, -0.35 - aRand.z * 0.8, cos(aRand.w * 40.0 + uTime * 0.4) * 0.8);
          p += drift * de * (4.0 + aRand.y * 7.0) + vec3(sin(uTime * 2.0 + aRand.z * 50.0), cos(uTime * 1.7 + aRand.y * 50.0), 0.0) * de * 0.4;
          alpha *= 1.0 - smoothstep(0.15, 1.0, d);
          size *= 1.0 - 0.5 * de;
        } else {
          float d = clamp((uDis - 0.05 - aRand.x * 0.2) / 0.7, 0.0, 1.0);
          float de = d < 0.5 ? 4.0 * d * d * d : 1.0 - pow(-2.0 * d + 2.0, 3.0) / 2.0;
          float u = (aTarget.x - uBar.x) / 26.0;
          float v = (aTarget.y - uBar.y) / 4.5;
          vec3 tgt = uCaret + uRight * u * uCaretW + uUp * v * uCaretW * 0.2;
          vec3 arc = uUp * sin(de * 3.14159) * 1.2;
          p = mix(p, tgt, de) + arc * (1.0 - de) * de * 2.0;
          alpha *= 1.0 - smoothstep(0.9, 1.0, d);
          size = mix(size, 0.02, de);
        }
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.0, size * uPix / -mv.z);
        vCol = aKind > 1.5 ? vec3(0.95, 0.88, 0.80) * 1.25 : vec3(0.04, 1.0, 0.92) * 1.15;
        vA = alpha * (0.55 + 0.45 * aRand.z);
      }`,
    fragmentShader: POINT_FS,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  pixMats.push(logoMat);
  const logo = new THREE.Points(lg, logoMat); logo.frustumCulled = false;
  scene.add(logo);

  function sampleLogo(n) {
    const S = 4, CW = Math.ceil(194.5 * S), CH = Math.ceil(71 * S);
    const c = document.createElement('canvas'); c.width = CW; c.height = CH;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.scale(S, S); x.translate(6, 6);
    x.fillStyle = '#f00'; x.fill(new Path2D('M39.5,0 L0,24 L0,33 L39.5,57 L39.5,44 L14,28.5 L39.5,13 Z'));
    x.fillStyle = '#0f0'; x.fillRect(66, 50, 52, 9);
    x.fillStyle = '#00f'; x.fill(new Path2D('M144,0 L182.5,24 L182.5,33 L144,57 L144,44 L169.5,28.5 L144,13 Z'));
    const d = x.getImageData(0, 0, CW, CH).data;
    const pts = [];
    let guard = 0;
    while (pts.length < n && guard < n * 60) {
      guard++;
      const px = Math.random() * CW, py = Math.random() * CH;
      const i = ((py | 0) * CW + (px | 0)) * 4;
      let k = -1;
      if (d[i] > 128) k = 0; else if (d[i + 1] > 128) k = 1; else if (d[i + 2] > 128) k = 2;
      if (k < 0) continue;
      pts.push({ x: px / S - 6 - 91.25, y: -(py / S - 6 - 29.5), k });
    }
    return pts;
  }

  /* ---------- 3.5 ribbons (trails & outlines) ---------- */
  const TRAIL_VS = `attribute vec3 aPrev; attribute vec3 aNext; attribute float aSide; attribute float aU;
    uniform float uWidth; uniform float uAspect; uniform float uBody; uniform float uWake; uniform float uConst;
    varying float vU; varying float vSide; varying float vD;
    float prof(float u){
      if (uConst > 0.5) return 1.0;
      float nose = smoothstep(0.0, uBody * 0.3, u);
      float body = mix(1.0, uWake, smoothstep(uBody * 0.55, uBody * 1.5, u));
      return nose * body * (1.0 - smoothstep(0.7, 1.0, u));
    }
    void main(){
      mat4 vp = projectionMatrix * viewMatrix * modelMatrix;
      vec4 c = vp * vec4(position, 1.0);
      vec4 pp = vp * vec4(aPrev, 1.0);
      vec4 nn = vp * vec4(aNext, 1.0);
      vec2 asp = vec2(uAspect, 1.0);
      vec2 a = pp.xy / max(pp.w, 0.01) * asp; vec2 b = nn.xy / max(nn.w, 0.01) * asp;
      vec2 dir = b - a; float L = length(dir);
      dir = L > 1e-6 ? dir / L : vec2(1.0, 0.0);
      vec2 nrm = vec2(-dir.y, dir.x);
      c.xy += nrm / asp * aSide * uWidth * prof(aU) * projectionMatrix[1][1];
      gl_Position = c;
      vU = aU; vSide = aSide; vD = c.w;
    }`;
  const TRAIL_FS = `uniform vec3 uColor; uniform vec3 uHead; uniform float uAlpha; uniform float uBody; uniform float uConst; uniform float uFogK;
    varying float vU; varying float vSide; varying float vD;
    void main(){
      float across = 1.0 - vSide * vSide;
      float core = pow(max(across, 0.0), 1.4);
      float fade = uConst > 0.5 ? 1.0 : pow(clamp(1.0 - vU, 0.0, 1.0), 1.5);
      vec3 col = mix(uHead, uColor, smoothstep(0.0, uBody * 1.6, vU));
      gl_FragColor = vec4(col * core * fade * uAlpha * exp(-vD * uFogK), 1.0);
    }`;
  function ribbonMat(o) {
    const m = new THREE.ShaderMaterial({
      uniforms: { uWidth: { value: o.width }, uAspect: { value: 1 }, uBody: { value: o.body ?? 0.2 }, uWake: { value: o.wake ?? 0.25 }, uConst: { value: o.constant ? 1 : 0 }, uColor: { value: V3(...o.color) }, uHead: { value: V3(...(o.head || o.color)) }, uAlpha: { value: o.alpha ?? 1 }, uFogK: { value: o.fog ?? 0.011 } },
      vertexShader: TRAIL_VS, fragmentShader: TRAIL_FS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    aspectMats.push(m);
    return m;
  }
  class Trail {
    constructor(n, seg, mat) {
      this.n = n; this.seg = seg; this.pts = Array.from({ length: n }, () => V3());
      const g = new THREE.BufferGeometry();
      this.pos = new Float32Array(n * 6); this.prev = new Float32Array(n * 6); this.next = new Float32Array(n * 6);
      const side = new Float32Array(n * 2), u = new Float32Array(n * 2), idx = [];
      for (let i = 0; i < n; i++) { side[i * 2] = -1; side[i * 2 + 1] = 1; u[i * 2] = u[i * 2 + 1] = i / (n - 1); }
      for (let i = 0; i < n - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
      g.setAttribute('aPrev', new THREE.BufferAttribute(this.prev, 3));
      g.setAttribute('aNext', new THREE.BufferAttribute(this.next, 3));
      g.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
      g.setAttribute('aU', new THREE.BufferAttribute(u, 1));
      g.setIndex(idx);
      this.geo = g; this.mesh = new THREE.Mesh(g, mat); this.mesh.frustumCulled = false; this.mat = mat;
    }
    reset(p) { for (const q of this.pts) q.copy(p); this.write(); }
    settle(k) { const P = this.pts; for (let i = 1; i < P.length; i++) P[i].lerp(P[0], k); this.write(); }
    update(head) {
      const P = this.pts;
      if (P[0].distanceToSquared(P[1]) > this.seg * this.seg) { const last = P.pop(); last.copy(P[0]); P.splice(1, 0, last); }
      P[0].copy(head);
      this.write();
    }
    write() {
      const P = this.pts, n = this.n;
      for (let i = 0; i < n; i++) {
        const p = P[i], a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
        for (let s = 0; s < 2; s++) {
          const o = (i * 2 + s) * 3;
          this.pos[o] = p.x; this.pos[o + 1] = p.y; this.pos[o + 2] = p.z;
          this.prev[o] = a.x; this.prev[o + 1] = a.y; this.prev[o + 2] = a.z;
          this.next[o] = b.x; this.next[o + 1] = b.y; this.next[o + 2] = b.z;
        }
      }
      if (P[0].equals(P[n - 1])) { this.next[3] += 1e-4; }
      this.geo.attributes.position.needsUpdate = true; this.geo.attributes.aPrev.needsUpdate = true; this.geo.attributes.aNext.needsUpdate = true;
    }
  }
  function staticRibbon(polys, mat) {
    // polys: array of {pts:[Vector3], closed}
    const pos = [], prev = [], next = [], side = [], u = [], idx = [];
    let base = 0;
    for (const { pts: src, closed } of polys) {
      const pts = closed ? [...src, src[0], src[1]] : src;
      const n = pts.length;
      for (let i = 0; i < n; i++) {
        const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
        for (let s = 0; s < 2; s++) { pos.push(p.x, p.y, p.z); prev.push(a.x, a.y, a.z); next.push(b.x, b.y, b.z); side.push(s ? 1 : -1); u.push(i / (n - 1)); }
      }
      for (let i = 0; i < n - 1; i++) { const a = base + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      base += n * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aPrev', new THREE.Float32BufferAttribute(prev, 3));
    g.setAttribute('aNext', new THREE.Float32BufferAttribute(next, 3));
    g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
    g.setAttribute('aU', new THREE.Float32BufferAttribute(u, 1));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; return m;
  }

  /* ---------- 3.6 Dolgorae — a pod moving as one ---------- */
  const POD_N = P.pod;
  const pod = { leader: V3(-40, -14, -90), lv: V3(1, 0, 0), members: [], group: new THREE.Group(), highlight: 0, mode: 'ambient', dim: 1, dimT: 1, orb: 0, calm: false };
  const podMat = ribbonMat({ width: 0.3, body: 0.22, wake: 0.16, color: [0.02, 0.55, 0.55], head: [0.6, 1.0, 0.98], alpha: 1.3 });
  for (let i = 0; i < POD_N; i++) {
    const side = i === 0 ? 0 : (i % 2 ? 1 : -1), rank = Math.ceil(i / 2);
    const tr = new Trail(LITE ? 26 : 34, 0.28, podMat);
    const m = { p: V3(-40 + side * 3, -14, -90 + rank * 3), v: V3(1, 0, 0), slot: V3(side * rank * 2.4, (Math.random() - 0.5) * 1.2 - rank * 0.25, rank * 2.8), ph: Math.random() * 6.28, tr };
    tr.reset(m.p);
    pod.members.push(m); pod.group.add(tr.mesh);
  }
  scene.add(pod.group);
  const _v = V3(), _w = V3(), _q = V3();
  function updatePod(dt, t, cam) {
    const L = pod.leader;
    const ang = t * 0.13;
    const ax = lay.narrow ? 13 : 44;
    // mobile: swim through the empty band between the lanterns and the founder line, not behind the text
    const tgt = _v.set(Math.sin(ang) * ax + Math.sin(t * 0.07) * ax * 0.22, cam.y - (lay.narrow ? -1 : 13) + Math.sin(t * 0.33) * (lay.narrow ? 2 : 4), cam.z - (lay.narrow ? 58 : 60) + Math.cos(ang * 1.3) * 16);
    if (cam.y < -40 && cam.y > -125 && lantern.items.length) {
      const act = lantern.focus >= 0 ? lantern.focus : lantern.idx; const Lp = lantern.items[act].grp.position;
      // during a journey the pod stays calm: a wider, slower orbit behind the lit lantern
      const orb = t * (pod.calm ? 0.22 : lantern.focus >= 0 ? 1.1 : 0.7), R = pod.calm ? 16 : 6;
      tgt.set(Lp.x + Math.cos(orb) * R - (pod.calm ? 14 : 0), Lp.y - 1 + Math.sin(orb * 1.3) * 1.5 - (pod.calm ? 7 : 0), Lp.z + Math.sin(orb) * R * (pod.calm ? 0.5 : 1) - (pod.calm ? 42 : 0));
    }
    if (cam.y < -200) { tgt.x = Math.sin(ang) * (lay.narrow ? 12 : 30) + (lay.narrow ? 6 : -4); tgt.y = Math.max(cam.y - 9, -252) + Math.sin(t * 0.4) * 2; tgt.z = -96 + Math.cos(ang) * 18; }
    if (pod.mode === 'bench' && bench.on) {
      // circle behind the screen-fixed frame: an ellipse in the camera plane, a little deeper than the slab
      pod.orb += dt * 0.34;
      const bx = bench.halfW + 3.4, by = bench.halfH + 2.4;
      tgt.copy(bench.center).addScaledVector(bench.fwd, 5 + Math.sin(pod.orb * 0.5) * 2)
        .addScaledVector(bench.right, Math.cos(pod.orb) * bx).addScaledVector(bench.up, Math.sin(pod.orb) * by);
    }
    const desired = _w.copy(tgt).sub(L);
    const dist = desired.length();
    const maxS = pod.calm ? 5 + clamp(dist / 40) * 12 : 13 + clamp(dist / 40) * 26;   // calm during a journey
    desired.setLength(maxS * clamp(dist / 12, 0.4, 1));
    pod.lv.lerp(desired, 1 - Math.exp(-1.2 * dt));
    L.addScaledVector(pod.lv, dt);
    const fwd = _q.copy(pod.lv).normalize();
    const right = V3(-fwd.z, 0, fwd.x).normalize();
    for (let i = 0; i < pod.members.length; i++) {
      const m = pod.members[i];
      const goal = V3().copy(L).addScaledVector(right, m.slot.x).addScaledVector(fwd, -m.slot.z);
      goal.y += m.slot.y + Math.sin(t * 2.1 + m.ph) * 0.55;
      // separation
      for (let j = 0; j < pod.members.length; j++) {
        if (i === j) continue;
        const o = pod.members[j].p; const dx = m.p.x - o.x, dy = m.p.y - o.y, dz = m.p.z - o.z; const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 3 && d2 > 1e-4) { goal.x += dx / d2 * 1.2; goal.y += dy / d2 * 1.2; goal.z += dz / d2 * 1.2; }
      }
      const want = goal.sub(m.p).multiplyScalar(2.2).add(pod.lv);
      m.v.lerp(want, 1 - Math.exp(-2.4 * dt));
      m.p.addScaledVector(m.v, dt);
      m.tr.update(m.p);
    }
    pod.dim = damp(pod.dim, pod.dimT, 2.5, dt);
    podMat.uniforms.uAlpha.value = (1.25 + pod.highlight * 1.5) * pod.dim;
  }

  /* ---------- 3.6b service lanterns at −200 m: one per service area (content.js SVC_KEYS order) ---------- */
  const lantern = { items: [], focus: -1, cycle: 0, idx: 0, pulse: 0 };
  {
    const lm = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
      vertexShader: `attribute float aI; attribute float aHi; uniform float uTime; uniform float uScale; varying vec2 vUv; varying float vHi; varying float vI; void main(){ vUv = position.xy * 2.0; vHi = aHi; vI = aI; vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += position.xy * (2.6 + aHi * 1.6) * uScale; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uTime; varying vec2 vUv; varying float vHi; varying float vI; void main(){ float r = length(vUv); float win = smoothstep(1.0, 0.6, max(abs(vUv.x), abs(vUv.y))); float breathe = 0.75 + 0.25 * sin(uTime * 1.3 + vI * 1.7); float core = exp(-r * r * 60.0) * 2.2; float halo = exp(-r * 4.5) * 0.45 * breathe; float ring = exp(-pow((r - 0.42 - 0.04 * sin(uTime * 2.0 + vI)) / 0.018, 2.0)) * 0.5 * vHi; vec3 c = mix(vec3(0.1, 0.85, 0.8), vec3(0.75, 1.0, 0.97), vHi) * (core + halo * (1.0 + vHi * 1.5) + ring); gl_FragColor = vec4(c * win, 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const tm = new THREE.ShaderMaterial({ uniforms: {}, vertexShader: `attribute float aV; varying float vV; varying float vD; void main(){ vV = aV; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vD = -mv.z; }`, fragmentShader: `varying float vV; varying float vD; void main(){ gl_FragColor = vec4(vec3(0.05, 0.45, 0.43) * (1.0 - vV) * 0.9 * exp(-vD * 0.01), 1.0); }`, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let i = 0; i < SVC_KEYS.length; i++) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
      g.setAttribute('aI', new THREE.Float32BufferAttribute([i, i, i, i], 1));
      g.setAttribute('aHi', new THREE.Float32BufferAttribute([0, 0, 0, 0], 1));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      const m = new THREE.Mesh(g, lm); m.frustumCulled = false;
      const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, -34, 0], 3)); tg.setAttribute('aV', new THREE.Float32BufferAttribute([0, 1], 1));
      const tether = new THREE.Line(tg, tm); tether.frustumCulled = false;
      const grp = new THREE.Group(); grp.add(m, tether); scene.add(grp);
      lantern.items.push({ grp, g, hi: 0, base: V3() });
    }
    lantern.mat = lm;
  }
  function updateLanterns(dt, t, cam) {
    const vis = cam.y < -20 && cam.y > -150;
    lantern.items.forEach(L => { L.grp.visible = vis; });
    if (!vis) return;
    lantern.mat.uniforms.uTime.value = t;
    lantern.mat.uniforms.uScale.value = damp(lantern.mat.uniforms.uScale.value, pod.calm ? 0.7 : 1, 3, dt);
    lantern.cycle -= dt;
    if (lantern.cycle < 0) { lantern.idx = (lantern.idx + 1) % lantern.items.length; lantern.cycle = 6.5; }
    const active = lantern.focus >= 0 ? lantern.focus : lantern.idx;
    lantern.items.forEach((L, i) => {
      const target = i === lantern.focus ? 1 + lantern.pulse * 0.9 : (i === active ? 0.45 : 0);
      L.hi = damp(L.hi, target, 4, dt);
      const a = L.g.attributes.aHi; for (let k = 0; k < 4; k++) a.array[k] = L.hi; a.needsUpdate = true;
      L.grp.position.copy(L.base); L.grp.position.y += Math.sin(t * 0.6 + i * 1.9) * 0.6;
    });
  }

  /* ---------- 3.7 products above the surface (SPEC-experience §6) ----------
     Sudal on land (the warm lights of people gathered), Doksuri in the sky (a great bird of light),
     Ember Quest off-axis (an ember lighting a path over the water). Replaces B's −1,000 m products. */
  const glowGeo = new THREE.PlaneGeometry(1, 1);
  const glowMat = (col, size, flick = 0) => new THREE.ShaderMaterial({
    uniforms: { uCol: { value: V3(...col) }, uI: { value: 1 }, uSize: { value: size }, uTime: { value: 0 }, uFlick: { value: flick } },
    vertexShader: `uniform float uSize; varying vec2 vUv; void main(){ vUv = position.xy * 2.0; vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += position.xy * uSize; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uCol; uniform float uI; uniform float uTime; uniform float uFlick; varying vec2 vUv;
      void main(){ float r = length(vUv); float win = smoothstep(1.0, 0.6, max(abs(vUv.x), abs(vUv.y)));
        float fl = 1.0 - uFlick * (0.22 * sin(uTime * 13.0) * sin(uTime * 7.3 + 1.7) + 0.12 * sin(uTime * 23.0 + 0.4));
        float core = exp(-r * r * 70.0) * 2.6; float halo = exp(-r * 4.8) * 0.42;
        gl_FragColor = vec4(uCol * (core + halo) * fl * uI * win, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const above = { group: new THREE.Group(), cycle: 0 };
  scene.add(above.group);
  // Sudal — a low island on the horizon drawn as warm contour lines, a ring of warm lights on its crown
  const LAND = { w: 150, d: 64, hMax: 15 };
  const landGeo = new THREE.PlaneGeometry(LAND.w, LAND.d, LITE ? 90 : 140, LITE ? 38 : 56); landGeo.rotateX(-Math.PI / 2);
  {
    const pa = landGeo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i) / LAND.w, z = pa.getZ(i) / LAND.d;
      let h = Math.exp(-((x / 0.3) ** 2 + (z / 0.3) ** 2) * 2.0) + 0.55 * Math.exp(-(((x + 0.23) / 0.15) ** 2 + ((z - 0.06) / 0.2) ** 2) * 2.4) + 0.3 * Math.exp(-(((x - 0.26) / 0.13) ** 2 + ((z + 0.08) / 0.2) ** 2) * 2.6);
      h = h * LAND.hMax + (fbm2(x * 9 + 4, z * 9) - 0.5) * 3.2 - 2.4;
      pa.setY(i, h);
    }
  }
  const landMat = new THREE.ShaderMaterial({
    uniforms: { uCam: { value: V3() }, uTime: { value: 0 }, uVis: { value: 0 }, uTop: { value: V3() }, uLandDir: bgMat.uniforms.uLandDir, uWarm: { value: 0 }, uHi: { value: 0 } },
    vertexShader: `varying vec3 vW; varying float vH; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vH = position.y; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `${NOISE}${SKY}
      uniform vec3 uCam; uniform float uTime; uniform float uVis; uniform vec3 uTop; uniform vec2 uLandDir; uniform float uWarm; uniform float uHi; varying vec3 vW; varying float vH;
      void main(){
        if (vH < -0.05) discard;
        float f = vH / 1.3; float fw = fwidth(f);
        float d = abs(fract(f + 0.5) - 0.5);
        float line = (1.0 - smoothstep(0.0, fw * 1.3 + 0.0005, d)) * (1.0 - smoothstep(0.3, 0.7, fw));
        float nearTop = exp(-length((vW - uTop).xz) / 16.0);
        vec3 warm = vec3(1.0, 0.62, 0.3);
        vec3 col = vec3(0.0016, 0.0042, 0.0052) + warm * line * (0.05 + 0.32 * nearTop) * (1.0 + uHi) + vec3(0.1, 0.5, 0.48) * exp(-vH * 3.0) * 0.05 + warm * nearTop * 0.02;
        float dist = length(vW - uCam);
        vec3 haze = skyCol(normalize(vec3(vW.x - uCam.x, 0.004, vW.z - uCam.z)), uTime, uLandDir, uWarm);
        col = mix(col, haze, smoothstep(260.0, 700.0, dist) * 0.8);
        gl_FragColor = vec4(col * uVis, 1.0);
      }`,
  });
  const land = new THREE.Mesh(landGeo, landMat); land.frustumCulled = false; above.group.add(land);
  const sudal = { pos: V3(), hi: 0, glow: new THREE.Mesh(glowGeo, glowMat([1.0, 0.6, 0.28], 12, 0.5)) };
  sudal.glow.frustumCulled = false; above.group.add(sudal.glow);
  {
    const n = 11, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), ph = new Float32Array(n);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.random() * 0.3, r = 2.2 + Math.random() * 1.6; p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = 0.4 + Math.random() * 0.5; p[i * 3 + 2] = Math.sin(a) * r * 0.7; ph[i] = Math.random() * 40; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
    const m = new THREE.ShaderMaterial({ uniforms: { uPix: { value: 500 }, uTime: { value: 0 }, uI: { value: 1 } },
      vertexShader: `attribute float aPh; uniform float uPix; uniform float uTime; uniform float uI; varying vec3 vCol; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float fl = 0.7 + 0.3 * sin(uTime * (3.0 + fract(aPh) * 4.0) + aPh); gl_PointSize = max(1.5, 0.55 * uPix / -mv.z); vCol = vec3(1.0, 0.7, 0.38) * (1.4 + fl); vA = uI * fl; }`,
      fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    pixMats.push(m);
    sudal.lights = new THREE.Points(g, m); sudal.lights.frustumCulled = false; sudal.lightsMat = m; above.group.add(sudal.lights);
  }
  // Doksuri — a great bird of light gliding in slow circles high in the sky
  const doksuri = { c: V3(), pos: V3(), ang: 0, hi: 0, group: new THREE.Group() };
  const dokTilt = new THREE.Quaternion(), dokUp = V3(), dokN = V3();
  {
    const half = [[0, 0, 0.62], [0.28, 0.02, 0.36], [0.95, 0.12, 0.22], [1.75, 0.3, 0.12], [2.45, 0.46, -0.02], [2.95, 0.62, -0.2], [2.7, 0.5, -0.34], [2.95, 0.5, -0.46], [2.55, 0.4, -0.5], [2.75, 0.36, -0.66], [2.2, 0.28, -0.6], [1.55, 0.16, -0.46], [0.8, 0.06, -0.4], [0.32, 0.0, -0.46], [0.46, 0.0, -1.1], [0, 0, -0.92]];
    const pts = half.map(([x, y, z]) => V3(x, y, z)).concat(half.slice(1, -1).reverse().map(([x, y, z]) => V3(-x, y, z)));
    const outline = staticRibbon([{ pts, closed: true }], ribbonMat({ width: 0.3, constant: true, color: [1.0, 0.86, 0.66], alpha: 0.8, fog: 0.0012 }));
    doksuri.mat = outline.material;
    doksuri.group.add(outline); doksuri.group.rotation.order = 'YXZ'; doksuri.group.scale.setScalar(4.2);
    above.group.add(doksuri.group);
    doksuri.trMat = ribbonMat({ width: 0.34, body: 0.05, wake: 0.18, color: [0.42, 0.38, 0.32], head: [0.9, 0.84, 0.7], alpha: 0.5, fog: 0.0012 });
    doksuri.tr = new Trail(22, 0.85, doksuri.trMat); above.group.add(doksuri.tr.mesh);
  }
  // Ember Quest — off-axis: an ember low over the water, lighting a path of embers ahead of it
  const ember = { base: V3(), pos: V3(), dir: V3(1, 0, 0), hi: 0, core: new THREE.Mesh(glowGeo, glowMat([1.0, 0.36, 0.08], 5.2, 1)) };
  ember.core.frustumCulled = false; above.group.add(ember.core);
  {
    const n = LITE ? 44 : 72, g = new THREE.BufferGeometry(), r = new Float32Array(n * 4);
    for (let i = 0; i < n * 4; i++) r[i] = Math.random();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aR', new THREE.BufferAttribute(r, 4));
    const m = new THREE.ShaderMaterial({ uniforms: { uC: { value: V3() }, uTime: { value: 0 }, uPix: { value: 500 }, uI: { value: 1 }, uPath: { value: V3(1, 0, 0) } },
      vertexShader: `attribute vec4 aR; uniform vec3 uC; uniform float uTime; uniform float uPix; uniform float uI; uniform vec3 uPath; varying vec3 vCol; varying float vA;
        void main(){
          vec3 p; float sz;
          if (aR.w > 0.72) {
            float k = floor(aR.z * 9.0) / 8.0;
            vec3 side = normalize(cross(uPath, vec3(0.0, 1.0, 0.0)));
            p = uC + uPath * (2.6 + k * 24.0) + side * sin(k * 5.0 + 0.6) * 2.6 + vec3(0.0, -2.3 + sin(uTime * 2.0 + k * 9.0) * 0.08, 0.0) + (aR.xyx - 0.5) * vec3(0.5, 0.1, 0.5);
            float ph = fract(uTime * 0.16 - k * 0.55);
            float on = smoothstep(0.0, 0.08, ph) * (1.0 - smoothstep(0.22, 0.7, ph));
            vA = uI * (0.2 + on) * (1.0 - k * 0.5);
            sz = 0.2 + on * 0.22;
          } else {
            float age = fract(uTime * (0.22 + aR.x * 0.3) + aR.y);
            p = uC + vec3(sin(aR.z * 40.0 + uTime) * 0.5 * age, age * (3.0 + aR.x * 2.0), cos(aR.w * 40.0 + uTime * 0.8) * 0.5 * age);
            vA = uI * pow(1.0 - age, 2.0);
            sz = 0.14 * (1.0 - age) + 0.04;
          }
          vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
          gl_PointSize = max(1.3, sz * uPix / -mv.z);
          vCol = mix(vec3(1.0, 0.5, 0.13), vec3(1.0, 0.8, 0.5), aR.x) * 1.8;
        }`,
      fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    pixMats.push(m);
    ember.sparks = new THREE.Points(g, m); ember.sparks.frustumCulled = false; ember.sparksMat = m; above.group.add(ember.sparks);
  }
  function updateAbove(dt, t, cy) {
    // only the last stretch below the surface sees them (through Snell's window); fully lit above
    const k = sstep(SURF - 14, SURF + 1.5, cy), kl = sstep(SURF - 1, SURF + 2, cy);
    above.group.visible = k > 0.001;
    if (!above.group.visible) return;
    land.visible = kl > 0.001;
    landMat.uniforms.uVis.value = kl; landMat.uniforms.uTime.value = t; landMat.uniforms.uCam.value.copy(camera.position); landMat.uniforms.uWarm.value = U.warm; landMat.uniforms.uHi.value = sudal.hi;
    for (const g of [sudal.glow, ember.core]) g.material.uniforms.uTime.value = t;
    sudal.glow.material.uniforms.uI.value = k * (0.85 + sudal.hi * 0.9);
    sudal.lightsMat.uniforms.uTime.value = t; sudal.lightsMat.uniforms.uI.value = k * (1 + sudal.hi);
    doksuri.ang += dt * 0.15;
    const a = doksuri.ang, R = 22, sq = 0.55;
    doksuri.pos.set(doksuri.c.x + Math.cos(a) * R, doksuri.c.y + Math.sin(a * 2.0) * 1.4, doksuri.c.z + Math.sin(a) * R * sq);
    doksuri.group.position.copy(doksuri.pos);
    doksuri.group.rotation.set(0.1, Math.atan2(-Math.sin(a) * R, Math.cos(a) * R * sq), -0.26 + Math.sin(t * 0.5) * 0.05);
    // from the water the wing plane is almost edge-on and read as a bright bar: tip it most of the way toward the viewer
    dokTilt.setFromUnitVectors(dokUp.set(0, 1, 0), dokN.copy(camera.position).sub(doksuri.pos).normalize().lerp(dokUp, 0.35).normalize());
    doksuri.group.quaternion.premultiply(dokTilt);
    doksuri.group.scale.set(4.2, 4.2 * (1 + 0.14 * Math.sin(t * 1.25)), 4.2);
    doksuri.tr.update(doksuri.pos);
    doksuri.mat.uniforms.uAlpha.value = k * (0.62 + doksuri.hi * 0.9); doksuri.trMat.uniforms.uAlpha.value = k * (0.4 + doksuri.hi * 0.4);
    ember.pos.copy(ember.base).add(_v.set(Math.sin(t * 0.3) * 1.2, Math.sin(t * 0.7) * 0.35, Math.cos(t * 0.23) * 1.2));
    ember.core.position.copy(ember.pos); ember.core.material.uniforms.uI.value = k * (1 + ember.hi);
    ember.sparksMat.uniforms.uC.value.copy(ember.pos); ember.sparksMat.uniforms.uTime.value = t; ember.sparksMat.uniforms.uI.value = k * (1 + ember.hi * 0.8); ember.sparksMat.uniforms.uPath.value.copy(ember.dir);
    seaTopMat.uniforms.uL1.value.copy(sudal.pos); seaTopMat.uniforms.uL2.value.copy(ember.pos);
  }

  /* ---------- 3.8 seabed & rift (topographic line-art) ---------- */
  const SB = { x0: -210, x1: 250, z0: -380, z1: 120 };
  const sbNX = LITE ? 150 : 230, sbNZ = LITE ? 165 : 250;
  const sbGeo = new THREE.PlaneGeometry(SB.x1 - SB.x0, SB.z1 - SB.z0, sbNX, sbNZ);
  sbGeo.rotateX(-Math.PI / 2);
  sbGeo.translate((SB.x0 + SB.x1) / 2, 0, (SB.z0 + SB.z1) / 2);
  { const p = sbGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, seabedH(p.getX(i), p.getZ(i))); }
  const sbMat = new THREE.ShaderMaterial({
    uniforms: { uCam: { value: V3() }, uKer: { value: KER.clone() }, uTime: { value: 0 }, uOpen: { value: 0 }, uTZ: { value: V3(0, -262, -85) }, uPools: { value: Array.from({ length: 8 }, () => V3(0, -9999, 0)) }, uPoolI: { value: new Array(8).fill(0) } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 uCam; uniform vec3 uKer; uniform float uTime; uniform float uOpen; uniform vec3 uTZ; uniform vec3 uPools[8]; uniform float uPoolI[8]; varying vec3 vW;
      void main(){
        vec3 N = normalize(cross(dFdx(vW), dFdy(vW)));
        float wall = smoothstep(0.75, 0.3, abs(N.y));
        float h = vW.y;
        float f = h / 1.5; float fw = fwidth(f);
        float d = abs(fract(f + 0.5) - 0.5);
        float line = (1.0 - smoothstep(0.0, fw * 1.3 + 0.0005, d)) * (1.0 - smoothstep(0.25, 0.6, fw));
        float f5 = h / 7.5; float fw5 = fwidth(f5);
        float d5 = abs(fract(f5 + 0.5) - 0.5);
        float major = (1.0 - smoothstep(0.0, fw5 * 1.4 + 0.0005, d5)) * (1.0 - smoothstep(0.3, 0.7, fw5));
        line *= mix(1.0, 0.38, wall); major *= mix(1.0, 0.5, wall);
        float dist = length(vW - uCam);
        float fog = exp(-dist * 0.0105);
        vec3 base = vec3(0.0022, 0.0105, 0.013);
        vec3 lc = vec3(0.02, 0.24, 0.24);
        vec3 kd = vW - uKer;
        float kl = exp(-length(kd.xz) / 26.0) * exp(-max(0.0, kd.y + 2.0) / 9.0) * (1.0 - smoothstep(14.0, 30.0, -kd.y));
        vec3 kc = mix(vec3(0.01, 0.55, 0.52), mix(vec3(0.85, 0.66, 0.48), vec3(1.0, 0.72, 0.45), uOpen), smoothstep(-10.0, 10.0, kd.x));
        float tz = exp(-length((vW - uTZ).xz) / 55.0);
        float pool = 0.0;
        for (int i = 0; i < 8; i++) { vec3 dp = vW - uPools[i]; pool += uPoolI[i] * exp(-dot(dp.xz, dp.xz) / 70.0) * exp(-abs(dp.y) * 0.2); }
        vec3 col = base + lc * (line * (0.28 + 0.5 * tz) + major * (0.45 + 0.4 * tz)) + kc * kl * (0.1 + line * 1.3 + major * 1.1);
        col += vec3(0.02, 0.36, 0.34) * pool * (0.06 + line * 1.1 + major * 0.8);
        gl_FragColor = vec4(col * fog, 1.0);
      }`,
  });
  const seabed = new THREE.Mesh(sbGeo, sbMat); seabed.frustumCulled = false;
  scene.add(seabed);

  /* ---------- 3.9 tool zone ---------- */
  const tool = new THREE.Group(); scene.add(tool);
  const TZC = V3(0, -262, -85);
  const at = (x, z, lift = 0) => V3(x, seabedH(x, z) + lift, z);

  // Podway currents — flow lines that route everything down to the kernel
  const flowMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uLen: { value: 100 }, uColor: { value: V3(0.02, 0.62, 0.58) }, uHead: { value: -1 }, uBoost: { value: 0 }, uA: { value: 1 }, uSpeed: { value: 0.5 } },
    vertexShader: `attribute float aS; varying float vS; varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vS = aS; vD = -mv.z; }`,
    fragmentShader: `uniform float uTime; uniform float uLen; uniform vec3 uColor; uniform float uHead; uniform float uBoost; uniform float uA; uniform float uSpeed; varying float vS; varying float vD;
      void main(){
        float s = vS * uLen;
        float dash = pow(fract(s * 0.075 - uTime * uSpeed), 9.0);
        float ends = smoothstep(0.0, 0.04, vS) * smoothstep(1.0, 0.97, vS);
        float head = exp(-abs(vS - uHead) * 55.0) * uBoost;
        vec3 c = uColor * (0.13 + dash * 1.35 + head * 3.0) * ends * exp(-vD * 0.0095);
        gl_FragColor = vec4(c * uA, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const FLOW_FS = `uniform float uTime; uniform float uLen; uniform vec3 uColor; uniform float uHead; uniform float uBoost; uniform float uA; uniform float uSpeed; uniform float uFogK;
    varying float vU; varying float vSide; varying float vD;
    void main(){
      float across = max(0.0, 1.0 - vSide * vSide);
      float s = vU * uLen;
      float dash = pow(fract(s * 0.07 - uTime * uSpeed), 8.0);
      float ends = smoothstep(0.0, 0.04, vU) * smoothstep(1.0, 0.97, vU);
      float head = exp(-abs(vU - uHead) * 45.0) * uBoost;
      vec3 c = uColor * (0.09 + dash * 1.7 + head * 3.2) * ends * pow(across, 1.2);
      gl_FragColor = vec4(c * uA * exp(-vD * uFogK), 1.0);
    }`;
  function flowRibbonMat(len, U, width, alpha) {
    const m = new THREE.ShaderMaterial({
      uniforms: { uWidth: { value: width }, uAspect: { value: 1 }, uBody: { value: 0.2 }, uWake: { value: 0.2 }, uConst: { value: 1 }, uTime: U.uTime, uLen: { value: len }, uColor: { value: V3(0.03, 0.72, 0.68) }, uHead: U.uHead, uBoost: U.uBoost, uA: { value: alpha }, uSpeed: U.uSpeed, uFogK: { value: 0.0095 } },
      vertexShader: TRAIL_VS, fragmentShader: FLOW_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    aspectMats.push(m); return m;
  }
  const currents = [];
  function addCurrent(pts, strands, spread, mainFlag) {
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    const len = curve.getLength();
    const N = 260;
    const mat = flowMat.clone(); mat.uniforms.uLen.value = len; mat.uniforms.uSpeed.value = mainFlag ? 0.55 : 0.4 + Math.random() * 0.2;
    const group = new THREE.Group();
    for (let s = 0; s < strands; s++) {
      const off = V3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread * 0.4, (Math.random() - 0.5) * spread);
      const pos = new Float32Array(N * 3), aS = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1); const p = curve.getPointAt(u);
        const w = Math.sin(u * 20 + s * 2.1) * spread * 0.15;
        pos[i * 3] = p.x + off.x * (0.4 + u) + w; pos[i * 3 + 1] = p.y + off.y; pos[i * 3 + 2] = p.z + off.z * (0.4 + u);
        aS[i] = u;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
      const m = s === 0 ? mat : mat.clone();
      if (s > 0) { m.uniforms = THREE.UniformsUtils.clone(mat.uniforms); m.uniforms.uA.value = 0.55; m.uniforms.uSpeed = mat.uniforms.uSpeed; m.uniforms.uTime = mat.uniforms.uTime; m.uniforms.uHead = mat.uniforms.uHead; m.uniforms.uBoost = mat.uniforms.uBoost; }
      const line = new THREE.Line(g, m); line.frustumCulled = false; group.add(line);
    }
    const rpts = []; for (let i = 0; i < 200; i++) rpts.push(curve.getPointAt(i / 199));
    group.add(staticRibbon([{ pts: rpts, closed: false }], flowRibbonMat(len, mat.uniforms, mainFlag ? 0.14 : 0.085, mainFlag ? 1.0 : 0.75)));
    tool.add(group);
    const c = { curve, len, mat, group };
    currents.push(c);
    return c;
  }
  const mainPts = [at(-78, -150, 4), at(-50, -122, 4), at(-28, -102, 4), at(-10, -88, 4), at(6, -78, 4), at(20, -70, 4.5), V3(32, -266, -64), V3(42, -296, -64), V3(52, -332, -76), V3(55, -348, -92), V3(55.5, -350, -100)];
  const main = addCurrent(mainPts, 3, 1.4, true);
  addCurrent([at(-120, -40, 6), at(-80, -58, 5), at(-44, -70, 4), at(-14, -72, 4), at(8, -66, 4), at(22, -60, 4), V3(34, -270, -60), V3(46, -310, -68), V3(54, -342, -88), V3(55, -349, -98)], 2, 1.2);
  addCurrent([at(-40, -230, 6), at(-20, -186, 5), at(-2, -146, 5), at(10, -112, 4), at(22, -88, 4), V3(34, -266, -80), V3(46, -305, -84), V3(54, -340, -96), V3(55.5, -350, -101)], 2, 1.2);
  addCurrent([at(-150, -110, 8), at(-100, -100, 6), at(-60, -90, 5), at(-30, -84, 4)].concat([at(-10, -88, 4.2)]), 2, 1.6);
  // gates (FSM states) along the main current
  const gateMat = new THREE.ShaderMaterial({
    uniforms: { uFlash: { value: 0 }, uA: { value: 1 } },
    vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vD = -mv.z; }`,
    fragmentShader: `uniform float uFlash; uniform float uA; varying float vD; void main(){ vec3 c = vec3(0.05, 0.75, 0.7) * (0.55 + uFlash * 3.5) + vec3(1.0) * uFlash * 0.6; gl_FragColor = vec4(c * uA * exp(-vD * 0.01), 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const gates = [0.17, 0.25].map(u => {
    const p = main.curve.getPointAt(u), tg = main.curve.getTangentAt(u);
    const ring = r => { const pts = []; for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); } return { pts, closed: true }; };
    const mat = ribbonMat({ width: 0.06, constant: true, color: [0.05, 0.78, 0.72], alpha: 0.7, fog: 0.01 });
    const m = staticRibbon([ring(2.0), ring(1.45)], mat);
    m.position.copy(p); m.lookAt(p.clone().add(tg)); tool.add(m);
    return { u, p, mesh: m, mat, flash: 0 };
  });
  // Agent Dispatch — light packets riding the currents
  const DP_N = 7;
  const dpGeo = new THREE.BufferGeometry();
  const dpPos = new Float32Array(DP_N * 3), dpCol = new Float32Array(DP_N * 3);
  dpGeo.setAttribute('position', new THREE.BufferAttribute(dpPos, 3));
  const dpMat = new THREE.ShaderMaterial({
    uniforms: { uPix: { value: 500 }, uHi: { value: 0 } },
    vertexShader: `uniform float uPix; uniform float uHi; varying vec3 vCol; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(2.0, (0.55 + uHi * 0.5) * uPix / -mv.z); vCol = vec3(0.7, 1.0, 0.95) * (1.6 + uHi * 1.5); vA = exp(-(-mv.z) * 0.009); }`,
    fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  pixMats.push(dpMat);
  const dispatch = new THREE.Points(dpGeo, dpMat); dispatch.frustumCulled = false; tool.add(dispatch);
  const dpState = Array.from({ length: DP_N }, (_, i) => ({ c: i % currents.length, u: Math.random(), s: 0.035 + Math.random() * 0.03 }));

  // Sanho — branching coral that grows when documents sync
  const coralMat = new THREE.ShaderMaterial({
    uniforms: { uGrow: { value: 0.7 }, uTime: { value: 0 }, uPulse: { value: 0 }, uHi: { value: 0 } },
    vertexShader: `attribute float aOrder; uniform float uGrow; varying float vA; varying float vTip; varying float vD; varying float vO;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vA = smoothstep(aOrder, aOrder + 0.012, uGrow); vTip = exp(-abs(uGrow - aOrder) * 22.0); vD = -mv.z; vO = aOrder; }`,
    fragmentShader: `uniform float uPulse; uniform float uHi; uniform float uTime; varying float vA; varying float vTip; varying float vD; varying float vO;
      void main(){
        if (vA < 0.01) discard;
        float shimmer = 0.75 + 0.25 * sin(vO * 40.0 - uTime * 2.0);
        vec3 c = vec3(0.03, 0.64, 0.6) * (0.55 + 0.5 * vO) * shimmer + vec3(0.6, 1.0, 0.96) * vTip * 1.4 + vec3(0.3, 0.9, 0.85) * (uPulse * 0.9 + uHi * 0.8);
        gl_FragColor = vec4(c * vA * exp(-vD * 0.0105), 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const polypMat = new THREE.ShaderMaterial({
    uniforms: { uGrow: { value: 0.7 }, uTime: { value: 0 }, uPix: { value: 500 }, uHi: { value: 0 } },
    vertexShader: `attribute float aOrder; attribute float aR; uniform float uGrow; uniform float uTime; uniform float uPix; uniform float uHi; varying vec3 vCol; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float on = smoothstep(aOrder, aOrder + 0.02, uGrow); gl_PointSize = max(1.5, (0.28 + 0.2 * aR) * uPix / -mv.z); vCol = mix(vec3(0.45, 1.0, 0.95), vec3(1.0, 0.86, 0.72), step(0.86, aR)) * (1.1 + 0.9 * sin(uTime * (1.0 + aR * 2.0) + aR * 40.0) + uHi); vA = on * exp(-(-mv.z) * 0.0105); }`,
    fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  pixMats.push(polypMat);
  function genCoral(rootP, height, gens, seed) {
    let s = seed;
    const R = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const segs = [], ords = [], tips = [], tipO = [];
    let maxO = 0;
    const grow = (p, dir, len, depth, o0) => {
      let cur = p.clone(), d = dir.clone(), o = o0;
      const n = 3;
      for (let k = 0; k < n; k++) {
        d.x += (R() - 0.5) * 0.35; d.z += (R() - 0.5) * 0.35; d.y += 0.08; d.normalize();
        const nx = cur.clone().addScaledVector(d, len / n);
        segs.push(cur.x, cur.y, cur.z, nx.x, nx.y, nx.z); ords.push(o, o + len / n);
        o += len / n; cur = nx;
      }
      maxO = Math.max(maxO, o);
      if (depth <= 0) { tips.push(cur.x, cur.y, cur.z); tipO.push(o); return; }
      const kids = depth > 3 ? 2 + (R() < 0.45 ? 1 : 0) : 2;
      for (let c = 0; c < kids; c++) {
        const axis = V3(R() - 0.5, 0, R() - 0.5).normalize();
        const nd = d.clone().applyAxisAngle(axis, 0.32 + R() * 0.5);
        nd.y = Math.max(nd.y, 0.15); nd.normalize();
        grow(cur, nd, len * (0.7 + R() * 0.14), depth - 1, o);
      }
    };
    grow(rootP, V3(0, 1, 0), height * 0.28, gens, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    g.setAttribute('aOrder', new THREE.Float32BufferAttribute(ords.map(o => o / maxO), 1));
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.Float32BufferAttribute(tips, 3));
    tg.setAttribute('aOrder', new THREE.Float32BufferAttribute(tipO.map(o => o / maxO), 1));
    tg.setAttribute('aR', new THREE.Float32BufferAttribute(tipO.map(() => R()), 1));
    const mat = coralMat.clone(); const pm = polypMat.clone(); pixMats.push(pm);
    const lines = new THREE.LineSegments(g, mat); lines.frustumCulled = false;
    const pts = new THREE.Points(tg, pm); pts.frustumCulled = false;
    tool.add(lines, pts);
    return { lines, pts, mat, pm, grow: 0.3, target: 0.62 + R() * 0.3, pulse: 0, root: rootP.clone(), top: rootP.clone().add(V3(0, height * 0.7, 0)) };
  }
  const coralSpots = LITE ? [[-2, -74, 8], [14, -102, 10], [26, -80, 7.5], [2, -120, 9]] : [[-2, -74, 8.5], [14, -102, 10.5], [4, -122, 9.5], [26, -80, 7.5], [-10, -98, 8], [33, -114, 9], [-22, -132, 9]];
  const corals = coralSpots.map(([x, z, h], i) => genCoral(at(x, z, -0.3), h, LITE ? 5 : 6, 1234 + i * 977));

  // Sorage — a hermit crab carrying a document between shells
  const sorage = { group: new THREE.Group(), from: at(-5, -63, 0), to: at(10, -69, 0), t: 0, phase: 0, carry: true, x: 0 };
  {
    const pts = []; for (let k = 0; k <= 90; k++) { const a = k * 0.42, r = 0.62 * Math.pow(1 - k / 90, 0.75), y = k / 90 * 1.25; pts.push(V3(Math.cos(a) * r, y + 0.35, Math.sin(a) * r)); }
    const shell = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.ShaderMaterial({ uniforms: { uHi: { value: 0 } }, vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vD = -mv.z; }`, fragmentShader: `uniform float uHi; varying float vD; void main(){ gl_FragColor = vec4(vec3(0.45, 0.95, 0.9) * (0.9 + uHi) * exp(-vD * 0.01), 1.0); }`, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    shell.rotation.z = -0.5; sorage.shell = shell; sorage.group.add(shell);
    const docMat = new THREE.ShaderMaterial({ uniforms: { uA: { value: 1 } }, vertexShader: `varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += position.xy; gl_Position = projectionMatrix * mv; }`, fragmentShader: `uniform float uA; varying vec2 vUv; float sdBox(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); } void main(){ vec2 p = vUv * 2.0 - 1.0; float d = sdBox(p, vec2(0.62, 0.8)); float e = exp(-d * d / 0.004); float lines = 0.0; for (int i = 0; i < 3; i++) { float y = 0.4 - float(i) * 0.36; lines += exp(-pow((p.y - y) / 0.05, 2.0)) * step(abs(p.x), 0.4 - float(i) * 0.1); } float fill = step(d, 0.0) * 0.18; vec3 c = vec3(0.95, 0.9, 0.84) * (e * 1.4 + lines * 0.9 + fill); gl_FragColor = vec4(c * uA, 1.0); }`, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const doc = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.8), docMat); doc.frustumCulled = false; sorage.doc = doc; sorage.docMat = docMat;
    tool.add(doc);
    const ringPts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2; ringPts.push(V3(Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1)); }
    const ringMat = () => new THREE.ShaderMaterial({ uniforms: { uF: { value: 0 } }, vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vD = -mv.z; }`, fragmentShader: `uniform float uF; varying float vD; void main(){ gl_FragColor = vec4(vec3(0.1, 0.8, 0.75) * (0.4 + uF * 2.5) * exp(-vD * 0.01), 1.0); }`, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const rg = new THREE.BufferGeometry().setFromPoints(ringPts);
    sorage.ringA = new THREE.Line(rg, ringMat()); sorage.ringA.position.copy(sorage.from).y += 0.15;
    sorage.ringB = new THREE.Line(rg, ringMat()); sorage.ringB.position.copy(sorage.to).y += 0.15;
    tool.add(sorage.ringA, sorage.ringB, sorage.group);
    sorage.group.position.copy(sorage.from);
    sorage.group.scale.setScalar(1.7); doc.scale.setScalar(1.45);
  }
  function updateSorage(dt, t) {
    const S = sorage;
    S.t += dt;
    const walk = 7.5, rest = 1.6;
    const cyc = walk * 2 + rest * 2;
    const tt = S.t % cyc;
    let x, carrying;
    if (tt < rest) { x = 0; carrying = true; }
    else if (tt < rest + walk) { x = eIOs((tt - rest) / walk); carrying = true; }
    else if (tt < rest * 2 + walk) { x = 1; carrying = false; if (!S.dropped) { S.dropped = true; S.ringB.material.uniforms.uF.value = 1; const c = corals[1 % corals.length]; syncCoral(c); } }
    else { x = 1 - eIOs((tt - rest * 2 - walk) / walk); carrying = false; }
    if (tt < rest) S.dropped = false;
    const p = V3().lerpVectors(S.from, S.to, x);
    p.x += Math.sin(x * Math.PI) * 2.5;
    p.y = seabedH(p.x, p.z) + Math.abs(Math.sin(t * 9)) * 0.06 * (tt > rest && tt < rest + walk || tt > rest * 2 + walk ? 1 : 0);
    S.group.position.copy(p);
    const dir = (tt < rest * 2 + walk) ? 1 : -1;
    S.group.rotation.y = Math.atan2(S.to.x - S.from.x, S.to.z - S.from.z) * 0 + (dir > 0 ? -0.6 : 2.5);
    const docTarget = carrying ? V3().copy(p).add(V3(0, 3.5 + Math.sin(t * 2) * 0.1, 0)) : V3().copy(S.to).add(V3(0, 0.8 + Math.sin(t * 1.5) * 0.06, 0));
    S.doc.position.lerp(docTarget, 1 - Math.exp(-6 * dt));
    S.docMat.uniforms.uA.value = carrying ? 1 : lerp(S.docMat.uniforms.uA.value, tt > rest * 2 + walk + walk * 0.6 ? 0 : 0.8, 1 - Math.exp(-2 * dt));
    if (carrying && tt < rest) S.docMat.uniforms.uA.value = clamp(tt / 0.8);
    S.ringA.material.uniforms.uF.value = carrying && tt < rest ? 0.8 : damp(S.ringA.material.uniforms.uF.value, 0, 2, dt);
    S.ringB.material.uniforms.uF.value = damp(S.ringB.material.uniforms.uF.value, 0, 1.2, dt);
  }
  function syncCoral(c) { c.target = Math.min(1, c.target + 0.08); c.pulse = 1; if (corals.every(k => k.target >= 0.99)) corals.forEach(k => { k.target = 0.62 + Math.random() * 0.25; }); }

  // Gaori — a flat undulating wing of light that scans
  const gaori = { group: new THREE.Group(), pos: V3(0, -243, -90), head: 0, ang: 0, mode: 'ambient', goal: V3(), goalHead: 0, sweepT: -1, sweepDur: 1.2, nextSweep: 4, hi: 0, bank: 0,
    scale: 1.25, scaleT: 1.25, pitch: 0, pitchT: 0, curtainLen: 0, curtainA: 0, red: 0, teal: 0, dim: 1, dimT: 1, leaveIn: -1 };
  {
    const SPAN = 44, CH = 12, HW = 7.2;
    const pos = [], sp = [], ch = [];
    for (let j = 0; j <= CH; j++) for (let i = 0; i <= SPAN; i++) {
      const s = i / SPAN * 2 - 1, c = j / CH, as = Math.abs(s);
      const zle = -2.8 + 3.5 * Math.pow(as, 1.45), zte = 2.4 - 1.3 * Math.pow(as, 0.85);
      pos.push(s * HW, 0, lerp(zle, zte, c)); sp.push(s); ch.push(c);
    }
    const idx = []; for (let j = 0; j < CH; j++) for (let i = 0; i < SPAN; i++) { const a = j * (SPAN + 1) + i; idx.push(a, a + 1, a + SPAN + 1, a + 1, a + SPAN + 2, a + SPAN + 1); }
    const wingVS = `attribute float aS; attribute float aC; uniform float uTime; uniform float uAmp; varying float vS; varying float vC; varying float vD; varying vec3 vN;
      vec3 wave(vec3 p, float s, float c){ float as = abs(s); p.y += uAmp * sin(uTime * 1.9 - as * 2.3) * pow(as, 1.35) + 0.14 * sin(uTime * 2.6 - c * 3.2) * as; return p; }
      void main(){ vec3 p = wave(position, aS, aC); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; vS = aS; vC = aC; vD = -mv.z; }`;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aS', new THREE.Float32BufferAttribute(sp, 1));
    g.setAttribute('aC', new THREE.Float32BufferAttribute(ch, 1));
    g.setIndex(idx);
    const sheetMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uAmp: { value: 1.1 }, uHi: { value: 0 }, uRed: { value: 0 }, uDim: { value: 1 } }, vertexShader: wingVS,
      fragmentShader: `uniform float uHi; uniform float uTime; uniform float uRed; uniform float uDim; varying float vS; varying float vC; varying float vD; void main(){ float as = abs(vS); float rim = smoothstep(0.75, 1.0, as) + smoothstep(0.12, 0.0, vC) * 0.8 + smoothstep(0.88, 1.0, vC) * 0.5; float ribs = pow(abs(sin(vS * 3.14159 * 7.0)), 30.0) * 0.5; vec3 c = mix(vec3(0.02, 0.45, 0.46), vec3(0.6, 0.04, 0.06), uRed) * (0.10 + rim * 0.3 + ribs * (0.4 + 0.2 * sin(uTime * 2.0 - as * 6.0))) * (1.0 + uHi * 1.4 + uRed * 1.3) * uDim; gl_FragColor = vec4(c * exp(-vD * 0.01), 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const sheet = new THREE.Mesh(g, sheetMat); sheet.frustumCulled = false;
    // rib lines (chordwise) + outline
    const lp = [], ls = [], lc = [];
    const P = (i, j) => { const k = j * (SPAN + 1) + i; return [pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2], sp[k], ch[k]]; };
    const seg = (a, b) => { lp.push(a[0], a[1], a[2], b[0], b[1], b[2]); ls.push(a[3], b[3]); lc.push(a[4], b[4]); };
    for (let i = 0; i <= SPAN; i += 4) for (let j = 0; j < CH; j++) seg(P(i, j), P(i, j + 1));
    for (let i = 0; i < SPAN; i++) { seg(P(i, 0), P(i + 1, 0)); seg(P(i, CH), P(i + 1, CH)); }
    for (let j = 0; j < CH; j++) { seg(P(0, j), P(0, j + 1)); seg(P(SPAN, j), P(SPAN, j + 1)); }
    // tail
    for (let k = 0; k < 20; k++) { const z0 = 2.4 + k * 0.32, z1 = z0 + 0.32; seg([0, 0, z0, 0, 1], [0, 0, z1, 0, 1]); }
    const lg2 = new THREE.BufferGeometry();
    lg2.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    lg2.setAttribute('aS', new THREE.Float32BufferAttribute(ls, 1));
    lg2.setAttribute('aC', new THREE.Float32BufferAttribute(lc, 1));
    const lineMat = new THREE.ShaderMaterial({ uniforms: sheetMat.uniforms, vertexShader: wingVS,
      fragmentShader: `uniform float uHi; uniform float uRed; uniform float uDim; varying float vS; varying float vC; varying float vD; void main(){ vec3 c = mix(mix(vec3(0.1, 0.85, 0.8), vec3(0.7, 1.0, 0.97), smoothstep(0.6, 1.0, abs(vS))), vec3(1.0, 0.2, 0.24), uRed) * (0.75 + uHi * 1.2 + uRed * 0.5) * uDim; gl_FragColor = vec4(c * exp(-vD * 0.01), 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const lines = new THREE.LineSegments(lg2, lineMat); lines.frustumCulled = false;
    // scan curtain
    const cg = new THREE.PlaneGeometry(2 * HW * 0.92, 1, 1, 1); cg.translate(0, -0.5, 0);
    const curtainMat = new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 }, uTime: { value: 0 }, uRed: { value: 0 } },
      vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vD = -mv.z; }`,
      fragmentShader: `uniform float uA; uniform float uTime; uniform float uRed; varying vec2 vUv; varying float vD; void main(){ float x = abs(vUv.x - 0.5) * 2.0; float edge = smoothstep(1.0, 0.7, x); float fall = mix(0.25, 1.0, vUv.y); float lines = 0.55 + 0.45 * sin(vUv.y * 320.0 - uTime * 26.0); float lead = exp(-vUv.y * 26.0) * 2.4; vec3 c = mix(vec3(0.15, 0.95, 0.9), vec3(1.0, 0.2, 0.25), uRed) * (fall * 0.11 * lines + lead) * edge; gl_FragColor = vec4(c * uA * exp(-vD * 0.008), 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const curtain = new THREE.Mesh(cg, curtainMat); curtain.frustumCulled = false;
    const pivot = new THREE.Group(); pivot.add(curtain);
    const body = new THREE.Group(); body.add(sheet, lines, pivot);
    body.scale.setScalar(1.25);
    gaori.group.add(body);
    Object.assign(gaori, { body, sheetMat, lineMat, curtain, curtainMat, pivot });
    tool.add(gaori.group);
  }
  function startSweep(dur = 1.2) { gaori.sweepT = 0; gaori.sweepDur = dur; }
  function updateGaori(dt, t) {
    const G = gaori;
    if (G.mode === 'ambient') {
      G.ang += dt * 0.105;
      const c = V3(9, -244 + Math.sin(t * 0.3) * 1.0, -86);
      G.goal.set(c.x + Math.cos(G.ang) * 12, c.y, c.z + Math.sin(G.ang) * 8);
      G.goalHead = Math.atan2(-Math.sin(G.ang) * 12, Math.cos(G.ang) * 8) + Math.PI;
      G.nextSweep -= dt;
      if (G.nextSweep < 0 && G.sweepT < 0) { startSweep(1.6); G.nextSweep = 8 + Math.random() * 3; }
    }
    if (G.leaveIn > 0) { G.leaveIn -= dt; if (G.leaveIn <= 0) { G.leaveIn = -1; G.mode = 'ambient'; G.scaleT = 1.25; G.pitchT = 0; } }
    const bench1 = G.mode === 'bench';
    G.pos.lerp(G.goal, 1 - Math.exp(-(G.mode === 'ambient' ? 1.4 : bench1 ? 2.6 : 1.9) * dt));
    let dh = G.goalHead - G.head; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    G.head += dh * (1 - Math.exp(-(bench1 ? 2.4 : 1.6) * dt));
    G.bank = damp(G.bank, clamp(dh * 1.5, -0.5, 0.5), 2, dt);
    G.scale = damp(G.scale, G.scaleT, 2.4, dt);
    G.pitch = damp(G.pitch, G.pitchT || 0, 2.4, dt);
    G.body.scale.setScalar(G.scale);
    G.group.position.copy(G.pos);
    G.group.rotation.set(0, G.head, 0);
    G.body.rotation.set(Math.sin(t * 0.8) * 0.04 + G.pitch, 0, G.bank);
    G.sheetMat.uniforms.uTime.value = t;
    G.sheetMat.uniforms.uHi.value = G.hi + G.teal * 0.9;
    G.red = damp(G.red, 0, 1.3, dt); G.teal = damp(G.teal, 0, 1.6, dt);
    G.dim = damp(G.dim, G.dimT, 2.5, dt);
    // exit 1: a red flicker (four quick pulses), then the colour drains back to teal
    const flick = G.red > 0.55 ? (Math.sin(t * 38) > 0 ? 1 : 0.35) : 1;
    G.sheetMat.uniforms.uRed.value = G.red * flick; G.sheetMat.uniforms.uDim.value = G.dim;
    G.curtainMat.uniforms.uRed.value = G.red;
    if (bench1) {
      // bench scan: the curtain hangs straight down (world-vertical) and grows until its lead edge crosses the frame
      G.sweepT = -1;
      G.pivot.rotation.x = -G.pitch;
      G.curtain.scale.set(1, Math.max(0.001, G.curtainLen / G.scale), 1);
      G.curtainMat.uniforms.uA.value = G.curtainA;
    } else if (G.sweepT >= 0) {
      G.sweepT += dt / G.sweepDur;
      const k = clamp(G.sweepT);
      const h = Math.max(4, G.pos.y - seabedH(G.pos.x, G.pos.z));
      G.curtain.scale.set(1, h, 1);
      G.pivot.rotation.x = lerp(-0.62, 0.62, eIOs(k));
      G.curtainMat.uniforms.uA.value = Math.sin(k * Math.PI) * 0.85;
      if (G.sweepT >= 1) { G.sweepT = -1; G.curtainMat.uniforms.uA.value = 0; }
    }
    G.curtainMat.uniforms.uTime.value = t;
  }

  // Mulgae — a sleek fast form circling what it reviews
  const mulMat = ribbonMat({ width: 0.34, body: 0.14, wake: 0.12, color: [0.08, 0.6, 0.62], head: [0.85, 1.0, 1.0], alpha: 1.4 });
  const mulgae = { p: V3(10, -250, -95), v: V3(6, 0, 0), target: V3(), r: 5, w: 2.2, tilt: 0.45, ph: 0, mode: 'ambient', next: 0, idx: 0, tr: new Trail(LITE ? 48 : 70, 0.26, mulMat), hi: 0, dim: 1, dimT: 1 };
  mulgae.tr.reset(mulgae.p); tool.add(mulgae.tr.mesh);
  function updateMulgae(dt, t) {
    const M = mulgae;
    if (M.mode === 'ambient') {
      M.next -= dt;
      if (M.next < 0) { M.idx = (M.idx + 1) % (corals.length + 1); M.next = 9 + Math.random() * 4; M.r = 4.5 + Math.random() * 2; M.tilt = 0.3 + Math.random() * 0.4; }
      if (M.idx < corals.length) M.target.copy(corals[M.idx].top); else M.target.copy(gaori.pos).add(V3(0, 1.5, 0));
    }
    M.ph += dt * M.w;
    let goal;
    if (M.mode === 'bench' && bench.on) {
      // a wide ring behind the frame: the arcs show in the margins, the frame hides the rest
      const rx = bench.halfW + 2.6, ry = bench.halfH + 2.0;
      goal = V3().copy(bench.center).addScaledVector(bench.fwd, 3.5 + Math.sin(M.ph) * 2.5)
        .addScaledVector(bench.right, Math.cos(M.ph) * rx).addScaledVector(bench.up, Math.sin(M.ph) * ry + Math.sin(M.ph * 2) * 0.5);
    } else {
      const off = V3(Math.cos(M.ph) * M.r, Math.sin(M.ph * 2) * 0.6 + Math.sin(M.ph) * M.r * Math.sin(M.tilt), Math.sin(M.ph) * M.r * Math.cos(M.tilt));
      goal = V3().copy(M.target).add(off);
    }
    const want = goal.sub(M.p).multiplyScalar(3.2);
    const sp = want.length(), vmax = M.mode === 'bench' ? 40 : 26; if (sp > vmax) want.setLength(vmax);
    M.v.lerp(want, 1 - Math.exp(-3.5 * dt));
    M.p.addScaledVector(M.v, dt);
    M.tr.update(M.p);
    M.dim = damp(M.dim, M.dimT, 2.5, dt);
    mulMat.uniforms.uAlpha.value = (1.4 + M.hi * 1.6) * M.dim;
  }

  // Agent Turn Network — a ring whose lights speak in turns
  const atn = { pos: V3(24, -240, -108), hi: 0 };
  {
    const n = 6, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), id = new Float32Array(n);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p[i * 3] = Math.cos(a) * 2.3; p[i * 3 + 1] = 0; p[i * 3 + 2] = Math.sin(a) * 2.3; id[i] = i; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aI', new THREE.BufferAttribute(id, 1));
    const m = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPix: { value: 500 }, uHi: { value: 0 } },
      vertexShader: `attribute float aI; uniform float uTime; uniform float uPix; uniform float uHi; varying vec3 vCol; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float k = mod(uTime * 1.25 - aI, 6.0); float on = exp(-k * k * 1.6); gl_PointSize = max(2.0, (0.5 + on * 0.9) * uPix / -mv.z); vCol = mix(vec3(0.1, 0.7, 0.66), vec3(0.9, 1.0, 0.98), on) * (0.8 + on * 2.2 + uHi); vA = exp(-(-mv.z) * 0.01); }`,
      fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    pixMats.push(m);
    const pts = new THREE.Points(g, m); pts.frustumCulled = false;
    const ringPts = []; for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 2; ringPts.push(V3(Math.cos(a) * 2.3, 0, Math.sin(a) * 2.3)); }
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.ShaderMaterial({ uniforms: m.uniforms, vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vD = -mv.z; }`, fragmentShader: `uniform float uHi; varying float vD; void main(){ gl_FragColor = vec4(vec3(0.05, 0.4, 0.38) * (1.0 + uHi) * exp(-vD * 0.01), 1.0); }`, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    const grp = new THREE.Group(); grp.add(pts, ring); grp.position.copy(atn.pos); grp.rotation.x = 0.35;
    tool.add(grp); atn.group = grp; atn.mat = m;
  }

  /* ---------- 3.10 the kernel — the boundary ---------- */
  const kernel = { group: new THREE.Group(), s: 0.25, open: 0, cycle: 0 };
  function buildKernel(s) {
    kernel.group.clear();
    kernel.s = s;
    const toV = ([x, y]) => new THREE.Vector2((x - 91.25) * s, -(y - 29.5) * s);
    const LT = [[39.5, 0], [0, 24], [0, 33], [39.5, 57], [39.5, 44], [14, 28.5], [39.5, 13]];
    const GT = [[144, 0], [182.5, 24], [182.5, 33], [144, 57], [144, 44], [169.5, 28.5], [144, 13]];
    const BAR = [[66, 50], [118, 50], [118, 59], [66, 59]];
    const depth = 3.4;
    const bodyMat = (col) => new THREE.ShaderMaterial({ uniforms: { uColor: { value: V3(...col) }, uTime: { value: 0 }, uGlow: { value: 1 }, uCam: { value: V3() } },
      vertexShader: `varying vec3 vN; varying vec3 vW; varying vec3 vL; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vL = position; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uTime; uniform float uGlow; uniform vec3 uCam; varying vec3 vN; varying vec3 vW; varying vec3 vL;
        void main(){ vec3 V = normalize(uCam - vW); float fres = pow(max(0.0, 1.0 - abs(dot(normalize(vN), V))), 3.0); float band = smoothstep(0.965, 1.0, sin(vL.y * 1.3 - uTime * 1.1) * 0.5 + 0.5); float band2 = smoothstep(0.985, 1.0, sin(vL.x * 0.8 + vL.y * 0.4 + uTime * 0.6) * 0.5 + 0.5); vec3 c = uColor * (0.03 + 0.28 * band * uGlow + 0.16 * band2 * uGlow) + uColor * fres * 0.9 * uGlow; gl_FragColor = vec4(c, 1.0); }` });
    const mkPart = (pts, col, name) => {
      const shape = new THREE.Shape(pts.map(toV));
      const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }); geo.translate(0, 0, -depth / 2);
      const mat = bodyMat(col); const mesh = new THREE.Mesh(geo, mat);
      const front = pts.map(p => { const v = toV(p); return V3(v.x, v.y, depth / 2 + 0.02); });
      const back = pts.map(p => { const v = toV(p); return V3(v.x, v.y, -depth / 2 - 0.02); });
      const om = ribbonMat({ width: 0.075, constant: true, color: col.map(c => c * 2.2), alpha: 1, fog: 0.004 });
      const outline = staticRibbon([{ pts: front, closed: true }, { pts: back, closed: true }], om);
      const eg = new THREE.EdgesGeometry(geo, 30);
      const em = new THREE.LineBasicMaterial({ color: new THREE.Color(col[0] * 1.2, col[1] * 1.2, col[2] * 1.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      const edges = new THREE.LineSegments(eg, em);
      kernel.group.add(mesh, outline, edges);
      kernel[name] = { mesh, mat, om, em };
    };
    mkPart(LT, [0.01, 0.62, 0.58], 'lt');
    mkPart(GT, [0.85, 0.80, 0.76], 'gt');
    mkPart(BAR, [0.02, 0.8, 0.74], 'bar');
    // the boundary: a vertical seam of light at x = 0
    const bh = 57 * s * 1.25;
    const bm = new THREE.ShaderMaterial({ uniforms: { uOpen: { value: 0 }, uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uOpen; uniform float uTime; varying vec2 vUv; void main(){ float x = abs(vUv.x - 0.5) * 2.0; float core = exp(-x * x * 60.0); float halo = exp(-x * 5.0) * 0.18; float fy = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y); float flick = 0.8 + 0.2 * sin(vUv.y * 60.0 - uTime * 4.0); vec3 c = mix(vec3(0.1, 0.9, 0.85), vec3(1.0, 0.78, 0.5), uOpen) * (core * (0.9 + uOpen * 2.0) * flick + halo); gl_FragColor = vec4(c * fy, 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const seam = new THREE.Mesh(new THREE.PlaneGeometry(2.2, bh), bm); seam.position.set(0, 0.6, 0);
    kernel.group.add(seam); kernel.seamMat = bm;
    // halo behind the monument
    const hm = new THREE.ShaderMaterial({ uniforms: { uOpen: { value: 0 }, uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uOpen; uniform float uTime; varying vec2 vUv; void main(){ vec2 p = vUv * 2.0 - 1.0; float r = length(p * vec2(0.55, 1.0)); vec3 cl = vec3(0.01, 0.35, 0.33), cr = mix(vec3(0.34, 0.27, 0.21), vec3(0.62, 0.42, 0.22), uOpen); vec3 c = mix(cl, cr, smoothstep(-0.3, 0.3, p.x)) * exp(-r * r * 3.0) * 0.3; gl_FragColor = vec4(c, 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(182 * s * 1.9, 57 * s * 3.4), hm); halo.position.z = -6;
    kernel.group.add(halo); kernel.haloMat = hm;
    // flow particles (CPU)
    const n = LITE ? 380 : 900;
    const kp = { n, x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), v: new Float32Array(n), g: new Float32Array(n) };
    const X0 = 51.75 * s + 1.2;
    for (let i = 0; i < n; i++) { kp.x[i] = -X0 + Math.random() * X0 * 2; kp.y[i] = (Math.random() - 0.5) * 50 * s; kp.z[i] = (Math.random() - 0.5) * 3.2; kp.v[i] = 1.2 + Math.random() * 2.2; kp.g[i] = 0.3 + Math.random() * 3.6 * s * 4; }
    const kg = new THREE.BufferGeometry(); const kpos = new Float32Array(n * 3);
    kg.setAttribute('position', new THREE.BufferAttribute(kpos, 3));
    const km = new THREE.ShaderMaterial({ uniforms: { uPix: { value: 500 }, uS: { value: s }, uOpen: { value: 0 } },
      vertexShader: `uniform float uPix; uniform float uS; uniform float uOpen; varying vec3 vCol; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float X0 = 51.75 * uS; float w = smoothstep(-0.4, 1.6, position.x); vCol = mix(vec3(0.1, 1.0, 0.92), vec3(1.0, 0.8, 0.55), w) * (1.3 + uOpen * 0.6); float ends = smoothstep(-X0 - 1.0, -X0 + 2.5, position.x) * (1.0 - smoothstep(X0 - 2.5, X0 + 1.0, position.x)); vA = ends; gl_PointSize = max(1.5, 0.2 * uPix / -mv.z); }`,
      fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    pixMats.push(km);
    const kpts = new THREE.Points(kg, km); kpts.frustumCulled = false;
    kernel.group.add(kpts);
    Object.assign(kernel, { kp, kpos, kg, km, X0 });
    kernel.group.position.copy(KER);
  }
  scene.add(kernel.group);
  function updateKernel(dt, t) {
    const K = kernel;
    const period = 6.4;
    K.cycle = (t % period) / period;
    const open = sstep(0.8, 0.84, K.cycle) * (1 - sstep(0.97, 1.0, K.cycle));
    K.open = open;
    const kp = K.kp, X0 = K.X0;
    for (let i = 0; i < kp.n; i++) {
      kp.x[i] += kp.v[i] * dt * (open > 0.5 ? 2.8 : 1);
      if (open < 0.5 && kp.x[i] > -kp.g[i] && kp.x[i] < 0.5) kp.x[i] = -kp.g[i] + Math.sin(t * 3 + i) * 0.05;
      if (kp.x[i] > X0) { kp.x[i] = -X0 - Math.random() * 2; kp.y[i] = (Math.random() - 0.5) * 48 * K.s; }
      const o = i * 3;
      kp.y[i] += Math.sin(t * 1.3 + i * 1.7) * dt * 0.15;
      K.kpos[o] = kp.x[i]; K.kpos[o + 1] = kp.y[i]; K.kpos[o + 2] = kp.z[i];
    }
    K.kg.attributes.position.needsUpdate = true;
    const barPulse = 0.65 + 0.35 * Math.sin(t * 5.4) * 0.5 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.2));
    K.bar.mat.uniforms.uGlow.value = 1.2 + barPulse * 1.2 + open * 0.8;
    K.bar.om.uniforms.uAlpha.value = 0.7 + barPulse * 0.9;
    K.gt.mat.uniforms.uGlow.value = 1 + open * 2.2;
    K.gt.om.uniforms.uAlpha.value = 0.85 + open * 1.4;
    K.lt.mat.uniforms.uGlow.value = 1.05;
    for (const k of ['lt', 'gt', 'bar']) { K[k].mat.uniforms.uTime.value = t; K[k].mat.uniforms.uCam.value.copy(camera.position); }
    K.seamMat.uniforms.uOpen.value = open; K.seamMat.uniforms.uTime.value = t;
    K.haloMat.uniforms.uOpen.value = open;
    K.km.uniforms.uOpen.value = open;
    sbMat.uniforms.uOpen.value = open;
  }

  /* ---------- 3.11 the visitor's capsule ---------- */
  const cap = { group: new THREE.Group(), pos: V3(), vis: 0, col: V3(0.05, 0.9, 0.84), colT: V3(0.05, 0.9, 0.84), scan: -9, open: 0, spin: 0, face: false, halfLen: 0.945, lastPos: V3() };
  {
    const cg = new THREE.CapsuleGeometry(0.42, 1.05, 8, 24); cg.rotateZ(Math.PI / 2);
    const cm = new THREE.ShaderMaterial({ uniforms: { uColor: { value: cap.col }, uI: { value: 0 }, uScan: { value: -9 }, uTime: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vL; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; vL = position; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uI; uniform float uScan; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec3 vL; void main(){ float f = pow(max(0.0, 1.0 - abs(dot(normalize(vN), normalize(vV)))), 1.8); float band = exp(-pow((vL.x - uScan) * 5.0, 2.0)); float inner = 0.35 + 0.15 * sin(vL.x * 8.0 - uTime * 3.0); vec3 c = uColor * (inner + 2.1 * f) + vec3(1.0) * band * 1.2; gl_FragColor = vec4(c * uI, 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(cg, cm); mesh.frustumCulled = false;
    const gm = new THREE.ShaderMaterial({ uniforms: { uColor: { value: cap.col }, uI: { value: 0 }, uSize: { value: 3.2 } },
      vertexShader: `uniform float uSize; varying vec2 vUv; void main(){ vUv = position.xy * 2.0; vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += position.xy * uSize; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uI; varying vec2 vUv; void main(){ float r = length(vUv * vec2(0.8, 1.2)); float win = smoothstep(1.0, 0.55, max(abs(vUv.x), abs(vUv.y))); float g = (exp(-r * r * 5.0) * 0.8 + exp(-r * 2.6) * 0.25) * win; gl_FragColor = vec4(uColor * g * uI, 1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), gm); glow.frustumCulled = false;
    // inner orbiting motes (the condensed words)
    const n = 140, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), r = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { r[i * 4] = Math.random(); r[i * 4 + 1] = Math.random(); r[i * 4 + 2] = Math.random(); r[i * 4 + 3] = Math.random(); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aR', new THREE.BufferAttribute(r, 4));
    const mm = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uI: { value: 0 }, uPix: { value: 500 }, uColor: { value: cap.col }, uOpen: { value: 0 } },
      vertexShader: `attribute vec4 aR; uniform float uTime; uniform float uI; uniform float uPix; uniform vec3 uColor; uniform float uOpen; varying vec3 vCol; varying float vA; void main(){ float a = aR.x * 6.2831 + uTime * (1.0 + aR.y * 2.0); float x = (aR.z - 0.5) * 1.5; float rr = (0.12 + aR.w * 0.24) * (1.0 + uOpen * 9.0); vec3 p = vec3(x * (1.0 + uOpen * 4.0), cos(a) * rr, sin(a) * rr); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(1.5, 0.09 * uPix / -mv.z); vCol = mix(uColor, vec3(1.0), 0.55) * 1.6; vA = uI * (1.0 - uOpen); }`,
      fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    pixMats.push(mm);
    const motes = new THREE.Points(g, mm); motes.frustumCulled = false;
    cap.group.add(glow, mesh, motes);
    Object.assign(cap, { mesh, cm, gm, mm, glow });
    cap.trMat = ribbonMat({ width: 0.2, body: 0.1, wake: 0.3, color: [0.03, 0.55, 0.52], head: [0.6, 1.0, 0.95], alpha: 0 });
    cap.tr = new Trail(40, 0.3, cap.trMat);
    scene.add(cap.group, cap.tr.mesh);
    cap.group.visible = false;
  }
  function updateCapsule(dt, t) {
    cap.col.lerp(cap.colT, 1 - Math.exp(-7 * dt));
    cap.spin += dt * 0.9;
    cap.group.position.copy(cap.pos);
    // in a journey the capsule is the logo's "_": keep its long axis on the screen's horizontal
    if (cap.face) cap.group.quaternion.copy(camera.quaternion); else cap.group.quaternion.identity();
    cap.mesh.rotation.set(cap.spin, 0, Math.sin(t * 0.7) * (cap.face ? 0.04 : 0.12));
    cap.cm.uniforms.uI.value = cap.vis * (1 - cap.open);
    cap.gm.uniforms.uI.value = cap.vis * (1 + cap.open * 2) * (1 - cap.open * 0.6);
    cap.gm.uniforms.uSize.value = 3.2 + cap.open * 6;
    cap.mm.uniforms.uI.value = cap.vis; cap.mm.uniforms.uTime.value = t; cap.mm.uniforms.uOpen.value = cap.open;
    cap.cm.uniforms.uScan.value = cap.scan; cap.cm.uniforms.uTime.value = t;
    cap.tr.update(cap.pos);
    if (cap.tr.pts[0].distanceTo(cap.lastPos) < 0.02) cap.tr.settle(1 - Math.exp(-3.2 * dt));
    cap.lastPos.copy(cap.pos);
    cap.trMat.uniforms.uAlpha.value = cap.vis * 0.75;
    cap.group.visible = cap.vis > 0.001;
    cap.tr.mesh.visible = cap.vis > 0.001;
  }

  /* ---------- 3.12 swarm: text → particles → capsule ---------- */
  const SW_N = P.swarm;
  const swGeo = new THREE.BufferGeometry();
  const swA = new Float32Array(SW_N * 3), swB = new Float32Array(SW_N * 3), swR = new Float32Array(SW_N * 4);
  swGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SW_N * 3), 3));
  swGeo.setAttribute('aA', new THREE.BufferAttribute(swA, 3));
  swGeo.setAttribute('aB', new THREE.BufferAttribute(swB, 3));
  swGeo.setAttribute('aR', new THREE.BufferAttribute(swR, 4));
  swGeo.setDrawRange(0, 0);
  const swMat = new THREE.ShaderMaterial({
    uniforms: { uP: { value: 0 }, uTime: { value: 0 }, uPix: { value: 500 }, uColA: { value: V3(0.9, 0.95, 0.95) }, uColB: { value: V3(0.1, 1.0, 0.92) }, uLift: { value: 1.4 }, uSize: { value: 0.07 }, uFadeEnd: { value: 1 } },
    vertexShader: `attribute vec3 aA; attribute vec3 aB; attribute vec4 aR; uniform float uP; uniform float uTime; uniform float uPix; uniform vec3 uColA; uniform vec3 uColB; uniform float uLift; uniform float uSize; uniform float uFadeEnd; varying vec3 vCol; varying float vA;
      void main(){
        float delay = aR.x * 0.42;
        float k = clamp((uP - delay) / 0.55, 0.0, 1.0);
        float e = k * k * (3.0 - 2.0 * k);
        vec3 mid = mix(aA, aB, 0.5) + vec3(0.0, uLift * (0.4 + aR.y), 0.0) + (aR.zwy - 0.5) * 1.6;
        vec3 p = mix(mix(aA, mid, e), mix(mid, aB, e), e);
        float sw = e * (1.0 - e) * 4.0;
        p += vec3(sin(uTime * 3.1 + aR.y * 20.0), cos(uTime * 2.7 + aR.z * 20.0), sin(uTime * 2.3 + aR.w * 20.0)) * 0.3 * sw;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.2, uSize * mix(1.0, 0.55, e) * uPix / -mv.z);
        vCol = mix(uColA, uColB, smoothstep(0.0, 0.6, e)) * (1.2 + sw * 0.8);
        vA = (1.0 - smoothstep(uFadeEnd - 0.12, uFadeEnd, uP)) * (0.65 + 0.35 * aR.w);
      }`,
    fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  pixMats.push(swMat);
  const swarm = new THREE.Points(swGeo, swMat); swarm.frustumCulled = false; swarm.visible = false;
  scene.add(swarm);

  /* ---------- 3.13 the human light ---------- */
  const humanMat = new THREE.ShaderMaterial({ uniforms: { uI: { value: 0 }, uTime: { value: 0 }, uSize: { value: 9.5 }, uBloom: { value: 0 }, uPos: { value: HUMAN.clone() } },
    vertexShader: `uniform float uSize; uniform vec3 uPos; varying vec2 vUv; void main(){ vUv = position.xy * 2.0; vec4 mv = viewMatrix * vec4(uPos, 1.0); mv.xy += position.xy * uSize; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uI; uniform float uTime; uniform float uBloom; varying vec2 vUv; void main(){ float r = length(vUv); float win = smoothstep(1.0, 0.6, max(abs(vUv.x), abs(vUv.y))); float breathe = 0.85 + 0.15 * sin(uTime * 1.6); float core = exp(-r * r * 26.0) * 2.8; float halo = exp(-r * 3.4) * 0.5 * breathe; float ang = atan(vUv.y, vUv.x); float rays = pow(abs(sin(ang * 3.0 + uTime * 0.05)), 18.0) * exp(-r * 2.2) * 0.25; vec3 c = mix(vec3(1.0, 0.7, 0.4), vec3(1.0, 0.5, 0.2), smoothstep(0.0, 0.45, r)) * (core * (0.32 + uBloom * 0.9) + halo * 0.8 + rays) * (1.0 + uBloom * 1.8) * win; gl_FragColor = vec4(c * uI, 1.0); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const human = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), humanMat); human.frustumCulled = false;
  scene.add(human);

  /* ---------- 3.14 sparks (repair shimmer) ---------- */
  const SP_N = 220;
  const spGeo = new THREE.BufferGeometry(); const spR = new Float32Array(SP_N * 4);
  for (let i = 0; i < SP_N * 4; i++) spR[i] = Math.random();
  spGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SP_N * 3), 3)); spGeo.setAttribute('aR', new THREE.BufferAttribute(spR, 4));
  const spMat = new THREE.ShaderMaterial({ uniforms: { uC: { value: V3() }, uI: { value: 0 }, uTime: { value: 0 }, uPix: { value: 500 } },
    vertexShader: `attribute vec4 aR; uniform vec3 uC; uniform float uI; uniform float uTime; uniform float uPix; varying vec3 vCol; varying float vA; void main(){ float a = aR.x * 6.2831 + uTime * (2.0 + aR.y * 3.0); float h = (aR.z - 0.5) * 2.4; float r = 0.9 + aR.w * 1.6 + sin(uTime * 3.0 + aR.x * 20.0) * 0.2; vec3 p = uC + vec3(cos(a) * r, h + sin(uTime * 2.0 + aR.y * 10.0) * 0.3, sin(a) * r); vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(1.2, (0.06 + aR.w * 0.08) * uPix / -mv.z); float tw = 0.5 + 0.5 * sin(uTime * 12.0 + aR.y * 40.0); vCol = mix(vec3(0.3, 1.0, 0.92), vec3(1.0), tw * 0.5) * 2.0; vA = uI * tw; }`,
    fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  pixMats.push(spMat);
  const sparks = new THREE.Points(spGeo, spMat); sparks.frustumCulled = false; scene.add(sparks);

  /* ---------- 3.15 the workbench: a light slab exactly behind the screen-fixed DOM frame ----------
     The DOM decides the rectangle and the world follows it: the slab is rebuilt every frame from the
     frame rect with screenToWorld at a fixed view depth (never the other way round). The camera holds
     still at the workbench, parallax is off, so the slab and the frame agree within a pixel. */
  const bench = { on: false, rect: { x: 0, y: 0, w: 1, h: 1 }, el: null, d: 26, pad: 120, open: 0, i: 0, fill: 1, warm: 0, red: 0, teal: 0,
    beadS: 0, beadP: new THREE.Vector2(), beadI: 0, hitX: 0.5, hitI: 0, pill: [80, 34], center: V3(), right: V3(1, 0, 0), up: V3(0, 1, 0), fwd: V3(0, 0, -1), halfW: 1, halfH: 1, wpp: 0.02 };
  const benchMat = new THREE.ShaderMaterial({
    uniforms: { uMesh: { value: new THREE.Vector2(1, 1) }, uHalf: { value: new THREE.Vector2(40, 17) }, uR: { value: 17 }, uI: { value: 0 }, uFill: { value: 1 }, uWarm: { value: 0 }, uRed: { value: 0 }, uTeal: { value: 0 }, uTime: { value: 0 }, uBead: { value: new THREE.Vector2() }, uBeadI: { value: 0 }, uHit: { value: new THREE.Vector2() }, uHitI: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec2 uMesh; uniform vec2 uHalf; uniform float uR; uniform float uI; uniform float uFill; uniform float uWarm; uniform float uRed; uniform float uTeal; uniform float uTime; uniform vec2 uBead; uniform float uBeadI; uniform vec2 uHit; uniform float uHitI; varying vec2 vUv;
      float sdRB(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main(){
        vec2 p = (vUv - 0.5) * uMesh;
        float d = sdRB(p, uHalf, uR);
        float outside = step(0.0, d);
        float rim = exp(-d * d / 2.4);
        float glow = (exp(-max(d, 0.0) / 30.0) * 0.16 + exp(-max(d, 0.0) / 7.0) * 0.3) * outside;
        float fill = (1.0 - outside) * (0.17 + 0.06 * sin(p.y * 0.24 - uTime * 2.4)) * uFill;
        vec3 col = mix(vec3(0.05, 0.86, 0.8), vec3(1.0, 0.74, 0.5), uWarm);
        col = mix(col, vec3(1.0, 0.13, 0.17), uRed);
        vec2 db = p - uBead, dh = p - uHit;
        float bead = uBeadI * (exp(-dot(db, db) / 80.0) * 2.6 + exp(-length(db) / 34.0) * 0.45);
        float hit = uHitI * (exp(-dot(dh, dh) / 360.0) * 1.8 + exp(-length(dh) / 40.0) * 0.3);
        vec3 c = col * (rim * 1.2 + glow + fill) * (1.0 + uTeal * 0.8) + vec3(0.75, 1.0, 0.96) * (bead + hit);
        gl_FragColor = vec4(c * uI, 1.0);
      }`,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const benchMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), benchMat); benchMesh.frustumCulled = false; benchMesh.renderOrder = 6; benchMesh.visible = false;
  scene.add(benchMesh);
  const _bc = V3();
  function perimPoint(s, w, h, out) {   // clockwise from the top-left corner; px, y up
    const P = 4 * (w + h); let d = (((s % 1) + 1) % 1) * P;
    if (d < 2 * w) return out.set(-w + d, h); d -= 2 * w;
    if (d < 2 * h) return out.set(w, h - d); d -= 2 * h;
    if (d < 2 * w) return out.set(w - d, -h); d -= 2 * w;
    return out.set(-w, -h + d);
  }
  function benchRectNow() {
    if (bench.el && bench.el.isConnected) { const r = bench.el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) bench.rect = { x: r.left, y: r.top, w: r.width, h: r.height }; }
    return bench.rect;
  }
  function updateBench(dt, t) {
    const r = benchRectNow();
    const d = bench.d, wpp = worldPerPixel(d);
    screenToWorld(r.x + r.w / 2, r.y + r.h / 2, d, bench.center);
    bench.right.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    bench.up.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    camera.getWorldDirection(bench.fwd);
    bench.wpp = wpp; bench.halfW = r.w / 2 * wpp; bench.halfH = r.h / 2 * wpp;
    const pad = bench.pad, MW = r.w + pad * 2, MH = r.h + pad * 2;
    benchMesh.position.copy(bench.center);
    benchMesh.quaternion.copy(camera.quaternion);
    benchMesh.scale.set(MW * wpp, MH * wpp, 1);
    benchMesh.updateMatrixWorld();
    benchMesh.visible = bench.i > 0.001;
    bench.red = damp(bench.red, 0, 1.3, dt); bench.teal = damp(bench.teal, 0, 1.1, dt); bench.hitI = damp(bench.hitI, 0, 4.5, dt);
    if (!benchMesh.visible) return;
    const e = eOut3(clamp(bench.open)), BU = benchMat.uniforms;
    BU.uMesh.value.set(MW, MH);
    BU.uHalf.value.set(lerp(bench.pill[0] / 2, r.w / 2, e), lerp(bench.pill[1] / 2, r.h / 2, e));
    BU.uR.value = lerp(bench.pill[1] / 2, 14, e);
    BU.uI.value = bench.i * (bench.red > 0.55 && Math.sin(t * 38) < 0 ? 0.45 : 1); BU.uFill.value = bench.fill; BU.uTime.value = t;
    BU.uRed.value = clamp(bench.red * 1.4); BU.uTeal.value = bench.teal; BU.uWarm.value = bench.warm;
    perimPoint(bench.beadS, r.w / 2, r.h / 2, bench.beadP); BU.uBead.value.copy(bench.beadP); BU.uBeadI.value = bench.beadI;
    BU.uHit.value.set((bench.hitX - 0.5) * r.w, -r.h / 2); BU.uHitI.value = bench.hitI;
  }
  // the slab's logical rectangle (not its glow margin) projected back to screen px — QA compares it with the DOM rect
  function benchProjectedRect() {
    const r = bench.rect, MW = r.w + bench.pad * 2, MH = r.h + bench.pad * 2;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      _bc.set(sx * r.w / 2 / MW, sy * r.h / 2 / MH, 0).applyMatrix4(benchMesh.matrixWorld);
      const pr = project(_bc); x0 = Math.min(x0, pr.x); x1 = Math.max(x1, pr.x); y0 = Math.min(y0, pr.y); y1 = Math.max(y1, pr.y);
    }
    return { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0 };
  }

  /* ---------- 3.16 Agent Dispatch into the frame: a feeder current and small pulses into its bottom edge ---------- */
  const feeder = { u: 0.33, mesh: null, mat: null, curve: null, a: 0, aT: 0, dir: 1, phase: null, U: { uTime: { value: 0 }, uHead: { value: -1 }, uBoost: { value: 0 }, uSpeed: { value: 0.9 } } };
  function buildFeeder() {
    const r = bench.rect;
    const tx = r.x + r.w * 0.5, ty = r.y + r.h + (vh - r.y - r.h) * 0.5;
    let best = 0.33, bd = 1e9;
    for (let u = 0.06; u <= 0.5; u += 0.005) { const pr = project(main.curve.getPointAt(u)); const dd = Math.hypot(pr.x - tx, pr.y - ty); if (pr.ok && dd < bd) { bd = dd; best = u; } }
    feeder.u = best;
    const E = screenToWorld(r.x + r.w / 2, r.y + r.h, bench.d);
    const lift = E.clone().addScaledVector(bench.up, -5.5);
    const curve = new THREE.CatmullRomCurve3([main.curve.getPointAt(Math.max(0, best - 0.05)), main.curve.getPointAt(best), lift, E], false, 'catmullrom', 0.5);
    const rp = []; for (let i = 0; i < 100; i++) rp.push(curve.getPointAt(i / 99));
    if (!feeder.mat) feeder.mat = flowRibbonMat(curve.getLength(), feeder.U, 0.09, 1);
    feeder.mat.uniforms.uLen.value = curve.getLength();
    if (feeder.mesh) { scene.remove(feeder.mesh); feeder.mesh.geometry.dispose(); }
    feeder.mesh = staticRibbon([{ pts: rp, closed: false }], feeder.mat);
    feeder.curve = curve;
    scene.add(feeder.mesh);
  }
  const PU_N = 8;
  const puGeo = new THREE.BufferGeometry(); const puPos = new Float32Array(PU_N * 3), puI = new Float32Array(PU_N);
  puGeo.setAttribute('position', new THREE.BufferAttribute(puPos, 3)); puGeo.setAttribute('aI', new THREE.BufferAttribute(puI, 1));
  const puMat = new THREE.ShaderMaterial({ uniforms: { uPix: { value: 500 } },
    vertexShader: `attribute float aI; uniform float uPix; varying vec3 vCol; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(2.0, (0.42 + aI * 0.3) * uPix / -mv.z); vCol = vec3(0.7, 1.0, 0.95) * (1.5 + aI * 1.4); vA = aI; }`,
    fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  pixMats.push(puMat);
  const pulsePts = new THREE.Points(puGeo, puMat); pulsePts.frustumCulled = false; scene.add(pulsePts);
  const pulses = Array.from({ length: PU_N }, () => {
    const tr = new Trail(18, 0.32, ribbonMat({ width: 0.12, body: 0.12, wake: 0.3, color: [0.03, 0.6, 0.56], head: [0.7, 1.0, 0.95], alpha: 0 }));
    tr.mesh.visible = false; scene.add(tr.mesh);
    return { k: -1, dur: 1.1, curve: null, x01: 0.5, tr };
  });
  function dispatchPulse() {
    if (!bench.on) return false;
    const p = pulses.find(q => q.k < 0) || pulses.reduce((a, b) => (a.k > b.k ? a : b));
    const r = bench.rect, x01 = 0.16 + Math.random() * 0.68;
    const E = screenToWorld(r.x + r.w * x01, r.y + r.h, bench.d);
    const lift = E.clone().addScaledVector(bench.up, -4.5 - Math.random() * 2.5);
    const uEnd = feeder.u, uStart = Math.max(0.02, uEnd - 0.1 - Math.random() * 0.08);
    p.curve = new THREE.CatmullRomCurve3([main.curve.getPointAt(uStart), main.curve.getPointAt((uStart + uEnd) / 2), main.curve.getPointAt(uEnd), lift, E], false, 'catmullrom', 0.5);
    p.k = 0; p.dur = 1.05 + Math.random() * 0.2; p.x01 = x01;
    p.tr.reset(p.curve.getPointAt(0)); p.tr.mesh.visible = true;
    return true;
  }
  function updatePulses(dt) {
    let any = false;
    for (let i = 0; i < PU_N; i++) {
      const p = pulses[i];
      if (p.k < 0) { puI[i] = 0; continue; }
      any = true;
      p.k += dt / p.dur;
      p.curve.getPointAt(eIOs(clamp(p.k)), _v);
      puPos[i * 3] = _v.x; puPos[i * 3 + 1] = _v.y; puPos[i * 3 + 2] = _v.z;
      puI[i] = sstep(0, 0.12, p.k) * (1 - sstep(0.95, 1, p.k));
      p.tr.update(_v); p.tr.mat.uniforms.uAlpha.value = 1.3 * puI[i];
      if (p.k >= 1) { p.k = -1; p.tr.mesh.visible = false; bench.hitX = p.x01; bench.hitI = 1; }
    }
    pulsePts.visible = any;
    if (any) { puGeo.attributes.position.needsUpdate = true; puGeo.attributes.aI.needsUpdate = true; }
  }

  /* ---------- 3.17 repair sparks travelling around the frame's edges ---------- */
  const RS_N = LITE ? 120 : 200;
  const rsGeo = new THREE.BufferGeometry(); const rsR = new Float32Array(RS_N * 4);
  for (let i = 0; i < RS_N * 4; i++) rsR[i] = Math.random();
  rsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RS_N * 3), 3)); rsGeo.setAttribute('aR', new THREE.BufferAttribute(rsR, 4));
  const rsMat = new THREE.ShaderMaterial({ uniforms: { uC: { value: V3() }, uRt: { value: V3() }, uUp: { value: V3() }, uHalf: { value: new THREE.Vector2(1, 1) }, uWpp: { value: 0.02 }, uI: { value: 0 }, uBead: { value: 0 }, uTime: { value: 0 }, uPix: { value: 500 } },
    vertexShader: `attribute vec4 aR; uniform vec3 uC; uniform vec3 uRt; uniform vec3 uUp; uniform vec2 uHalf; uniform float uWpp; uniform float uI; uniform float uBead; uniform float uTime; uniform float uPix; varying vec3 vCol; varying float vA;
      vec2 perim(float s, out vec2 n){ float w = uHalf.x, h = uHalf.y, d = fract(s) * 4.0 * (w + h);
        if (d < 2.0 * w) { n = vec2(0.0, 1.0); return vec2(-w + d, h); } d -= 2.0 * w;
        if (d < 2.0 * h) { n = vec2(1.0, 0.0); return vec2(w, h - d); } d -= 2.0 * h;
        if (d < 2.0 * w) { n = vec2(0.0, -1.0); return vec2(w - d, -h); } d -= 2.0 * w;
        n = vec2(-1.0, 0.0); return vec2(-w, -h + d); }
      void main(){
        float s = uBead + (aR.x - 0.5) * 0.1;
        vec2 n; vec2 q = perim(s, n);
        q += n * (3.0 + aR.y * 18.0 + sin(uTime * 7.0 + aR.z * 30.0) * 3.0) + vec2(sin(uTime * 9.0 + aR.w * 40.0), cos(uTime * 8.0 + aR.x * 40.0)) * 3.5;
        vec3 p = uC + (uRt * q.x + uUp * q.y) * uWpp;
        vec4 mv = viewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        float tw = 0.5 + 0.5 * sin(uTime * 14.0 + aR.w * 50.0);
        gl_PointSize = max(1.2, (0.04 + aR.z * 0.07) * uPix / -mv.z);
        vCol = mix(vec3(0.3, 1.0, 0.92), vec3(1.0), tw * 0.5) * 2.0;
        vA = uI * tw * exp(-abs(aR.x - 0.5) * 6.0);
      }`,
    fragmentShader: POINT_FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  pixMats.push(rsMat);
  const rimSparks = new THREE.Points(rsGeo, rsMat); rimSparks.frustumCulled = false; rimSparks.visible = false; rimSparks.renderOrder = 8; scene.add(rimSparks);

  /* ---------- 3.18 the human beam: a thin warm line from the surface light down to the capsule ---------- */
  const BEAM_SEG = 40;
  const bmGeo = new THREE.BufferGeometry();
  {
    const e = [], sd = [], idx = [];
    for (let i = 0; i <= BEAM_SEG; i++) { e.push(i / BEAM_SEG, i / BEAM_SEG); sd.push(-1, 1); }
    for (let i = 0; i < BEAM_SEG; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    bmGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array((BEAM_SEG + 1) * 6), 3));
    bmGeo.setAttribute('aEnd', new THREE.Float32BufferAttribute(e, 1)); bmGeo.setAttribute('aSide', new THREE.Float32BufferAttribute(sd, 1)); bmGeo.setIndex(idx);
  }
  const beamMat = new THREE.ShaderMaterial({ uniforms: { uA: { value: V3() }, uB: { value: V3() }, uW: { value: 1.2 }, uRes: { value: new THREE.Vector2(1, 1) }, uI: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `attribute float aEnd; attribute float aSide; uniform vec3 uA; uniform vec3 uB; uniform float uW; uniform vec2 uRes; varying float vEnd; varying float vSide;
      void main(){ mat4 vp = projectionMatrix * viewMatrix; vec4 a = vp * vec4(uA, 1.0), b = vp * vec4(uB, 1.0); vec4 c = mix(a, b, aEnd);
        vec2 sa = a.xy / a.w * uRes, sb = b.xy / b.w * uRes; vec2 d = sb - sa; d = length(d) > 1e-5 ? normalize(d) : vec2(0.0, 1.0);
        c.xy += vec2(-d.y, d.x) * aSide * (uW + 1.2) / uRes * c.w; gl_Position = c; vEnd = aEnd; vSide = aSide * (uW + 1.2) / max(uW, 0.3); }`,
    fragmentShader: `uniform float uI; uniform float uTime; varying float vEnd; varying float vSide;
      void main(){ float across = exp(-vSide * vSide * 1.6); float travel = 0.74 + 0.26 * sin(vEnd * 34.0 - uTime * 4.0); float ends = smoothstep(0.0, 0.04, vEnd) * smoothstep(1.0, 0.94, vEnd);
        vec3 col = mix(vec3(1.0, 0.82, 0.6), vec3(1.0, 0.66, 0.38), vEnd); gl_FragColor = vec4(col * across * travel * ends * uI, 1.0); }`,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(bmGeo, beamMat); beam.frustumCulled = false; beam.visible = false; beam.renderOrder = 7; scene.add(beam);

  /* ---------- internal fades for the adapter's sync verbs (no timers: advanced by the render loop) ---------- */
  const anims = new Set();
  function animTo(obj, key, to, ms, easeFn = eIOs) {
    for (const a of anims) if (a.obj === obj && a.key === key) anims.delete(a);
    if (!(ms > 0) || REDUCED) { obj[key] = to; return; }
    anims.add({ obj, key, from: obj[key], to, dur: ms / 1000, t: 0, ease: easeFn });
  }
  function runAnims(dt) { for (const a of anims) { a.t += dt; const k = clamp(a.t / a.dur); a.obj[a.key] = lerp(a.from, a.to, a.ease(k)); if (k >= 1) anims.delete(a); } }
  const hooks = new Set();   // per-frame callbacks after the camera is placed (DOM glyphs, scan sync)

  /* ---------- layout (aspect-aware composition) ----------
     Home order (CONTRACT §5): 0 m → −200 m → −4,000 m → −10,935 m → quick rise → above the surface. */
  const lay = { narrow: false, poses: null };
  const POSE_D = [
    { p: [0, 0, 0], t: [0, 10.5, -40] },
    { p: [3, -80, -8], t: [9, -86, -60] },
    { p: [-12, -233, -30], t: [-12, -252, -89] },
    { p: [70, -346, -42], t: [70, -354.5, -100] },
    { p: [0, SURF + 9, 12], t: [28, SURF + 21, -80] },
  ];
  const POSE_M = [
    { p: [0, 0, 0], t: [0, 9.2, -40] },
    { p: [0, -80, -8], t: [2, -78, -60] },
    { p: [4, -223, -20], t: [6, -250.5, -60] },
    { p: [70, -346, -6], t: [70, -364, -100] },
    { p: [0, SURF + 8, 10], t: [8, SURF + 3, -80] },
  ];
  function landPeak() { return LAND.hMax + (fbm2(4, 0) - 0.5) * 3.2 - 2.4; }
  function layout() {
    const a = vw / vh;
    lay.narrow = a < 0.85;
    camera.fov = lay.narrow ? lerp(62, 55, clamp((a - 0.45) / 0.4)) : lerp(52, 45, clamp((a - 1.0) / 0.6));
    camera.aspect = a;
    rig.baseFov = camera.fov;
    camera.updateProjectionMatrix();
    lay.poses = (lay.narrow ? POSE_M : POSE_D).map(q => ({ p: V3(...q.p), t: V3(...q.t) }));
    buildKernel(lay.narrow ? 0.23 : 0.25);
    // service lanterns — right-hand stage of the −200 m camera: three lights, evenly spaced, a gentle arc
    // (screen x, screen y, distance); on phones they hang in the band above the layer's text
    const c1 = camAt(lay.poses[1].p, lay.poses[1].t);
    const LP = lay.narrow ? [[0.2, 0.19, 47], [0.5, 0.1, 54], [0.8, 0.24, 50]] : [[0.62, 0.3, 50], [0.765, 0.52, 55], [0.9, 0.27, 61]];
    lantern.items.forEach((L, i) => { const [sx, sy, d] = LP[i]; L.base.copy(unprojectWith(c1, sx, sy, d)); });
    // products — above the surface, framed from the product camera (text column on the left / below on mobile)
    const c4 = camAt(lay.poses[4].p, lay.poses[4].t);
    const PL = lay.narrow ? { land: [0.3, 0.46, 215], dok: [0.62, 0.15, 185], emb: [0.8, 0.5, 64] } : { land: [0.7, 0.64, 215], dok: [0.64, 0.25, 190], emb: [0.865, 0.8, 58] };
    const lp = unprojectWith(c4, ...PL.land); lp.y = SURF - 0.3; land.position.copy(lp);
    sudal.pos.copy(lp).add(V3(0, landPeak() + 0.3, 0));
    sudal.glow.position.copy(sudal.pos).add(V3(0, 2.2, 0)); sudal.lights.position.copy(sudal.pos);
    landMat.uniforms.uTop.value.copy(sudal.pos);
    bgMat.uniforms.uLandDir.value.set(lp.x - c4.position.x, lp.z - c4.position.z).normalize();
    doksuri.c.copy(unprojectWith(c4, ...PL.dok));
    doksuri.tr.reset(doksuri.c);
    ember.base.copy(unprojectWith(c4, ...PL.emb)); ember.base.y = Math.max(ember.base.y, SURF + 2.6);
    ember.dir.set(ember.base.x - c4.position.x, 0, ember.base.z - c4.position.z).normalize().applyAxisAngle(V3(0, 1, 0), -0.55);
    // logo — framed in the upper third at the moment it has formed (t ≈ 1.4 s)
    const i0 = 0.085, P0 = lay.poses[0];
    const cl = camAt(V3(P0.p.x, P0.p.y + 5 * (1 - i0), P0.p.z + 8 * (1 - i0)), V3(P0.t.x, P0.t.y + 6.5 * (1 - i0), P0.t.z + 10 * (1 - i0)));
    const dist = 32;
    logoMat.uniforms.uOrigin.value.copy(unprojectWith(cl, 0.5, lay.narrow ? 0.25 : 0.265, dist));
    const viewW = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * a;
    logoMat.uniforms.uScale.value = viewW * (lay.narrow ? 0.7 : 0.34) / 182.5;
    logoMat.uniforms.uRight.value.setFromMatrixColumn(cl.matrixWorld, 0).normalize();
    logoMat.uniforms.uUp.value.setFromMatrixColumn(cl.matrixWorld, 1).normalize();
  }
  const tmpCam = new THREE.PerspectiveCamera();
  function camAt(p, t) { tmpCam.fov = camera.fov; tmpCam.aspect = camera.aspect; tmpCam.near = camera.near; tmpCam.far = camera.far; tmpCam.updateProjectionMatrix(); tmpCam.position.copy(p); tmpCam.lookAt(t); tmpCam.updateMatrixWorld(true); return tmpCam; }
  function unprojectWith(cam, sx, sy, dist) {
    const ndc = V3(sx * 2 - 1, -(sy * 2 - 1), 0.5).unproject(cam);
    const dir = ndc.sub(cam.position).normalize();
    const fwd = cam.getWorldDirection(V3());
    return cam.position.clone().addScaledVector(dir, dist / dir.dot(fwd));
  }

  /* ---------- camera rig ---------- */
  const rig = { pos: V3(0, 5, 8), look: V3(0, 17, -30), vel: V3(), prev: V3(), mode: 'scroll', jPos: V3(), jLook: V3(), jK: 3, fovKick: 0, par: new THREE.Vector2(), parT: new THREE.Vector2(), follow: false, offC: V3(), offT: V3(), lookC: V3(), lookT: V3(), offK: 2.2, baseFov: 45, snap: false, track: null };
  function followCap(off, lookOff, k = 10, offK = 2.2) { if (!rig.follow) { rig.offC.copy(rig.pos).sub(cap.pos); rig.lookC.copy(rig.look).sub(cap.pos); } rig.offT.copy(off); rig.lookT.copy(lookOff); rig.follow = true; rig.jK = k; rig.offK = offK; }
  function holdCam(p, l, k = 2.2) { rig.follow = false; rig.jPos.copy(p); rig.jLook.copy(l); rig.jK = k; }
  function poseAt(f, out) {
    const P = lay.poses; const k = Math.min(P.length - 2, Math.max(0, Math.floor(f))); const u = clamp(f - k);
    const A = P[k], B = P[k + 1];
    if (k === 2) {
      // tools → kernel: B's dive into the rift
      const ux = eOut3(clamp(u * 1.25)), uy = eIn3(u) * 0.35 + eIO3(u) * 0.65;
      out.p.set(lerp(A.p.x, B.p.x, ux), lerp(A.p.y, B.p.y, uy), lerp(A.p.z, B.p.z, ux));
      out.t.set(lerp(A.t.x, B.t.x, ux), lerp(A.t.y, B.t.y, uy), lerp(A.t.z, B.t.z, ux));
    } else if (k === 3) {
      // kernel → above the surface: a quick rise straight up the rift, looking up toward the light, out through the surface
      const uy = eIO3(u), uxz = sstep(0.22, 0.92, u), ut = sstep(0.04, 0.97, u);
      out.p.set(lerp(A.p.x, B.p.x, uxz), lerp(A.p.y, B.p.y, uy), lerp(A.p.z, B.p.z, uxz));
      out.t.set(lerp(A.t.x, B.t.x, ut), lerp(A.t.y, B.t.y, ut), lerp(A.t.z, B.t.z, ut));
      out.t.y += Math.sin(u * Math.PI) * 58;
    } else {
      const e = eIOs(u);
      out.p.lerpVectors(A.p, B.p, e); out.t.lerpVectors(A.t, B.t, e);
    }
    return out;
  }
  const tmpPose = { p: V3(), t: V3() };
  // camera y → meters (B's mapping), with flat bands where the story parks the camera (the lantern shot,
  // the tool pose and the workbench read exactly −200 / −4,000 m), and altitude (negative depth) above the surface
  const YM = [[0, 0], [-76, 200], [-90, 200], [LY[2], 1000], [-232, 4000], [-241, 4000], [LY[4], 10935]];
  function camDepthMeters(y) {
    if (y > SURF) return -(y - SURF) * (40 / 9);
    if (y >= 0) return 0;
    for (let i = 0; i < YM.length - 1; i++) if (y >= YM[i + 1][0]) return lerp(YM[i][1], YM[i + 1][1], (y - YM[i][0]) / (YM[i + 1][0] - YM[i][0]));
    return 10935;
  }

  /* ---------- picking ---------- */
  const pickables = [
    { key: 'gaori', pos: () => gaori.pos, r: 7 },
    { key: 'mulgae', pos: () => mulgae.p, r: 3 },
    { key: 'sanho', pos: () => corals[0].top, r: 4 },
    { key: 'sanho', pos: () => corals[1].top, r: 4 },
    { key: 'sorage', pos: () => sorage.group.position, r: 2.2 },
    { key: 'dolgorae', pos: () => pod.leader, r: 5 },
    { key: 'atn', pos: () => atn.pos, r: 3 },
    { key: 'podway', pos: () => gates[0].p, r: 3 },
    { key: 'dispatch', pos: () => V3().fromArray(dpPos, 0), r: 2 },
  ];
  const _p = V3();
  function project(v, out = { x: 0, y: 0, z: 0, ok: false }) {
    _p.copy(v).project(camera);
    out.x = (_p.x + 1) / 2 * vw; out.y = (1 - _p.y) / 2 * vh; out.z = _p.z; out.ok = _p.z < 1 && _p.z > -1;
    return out;
  }
  function screenToWorld(x, y, dist, out = V3()) {
    const ndc = V3((x / vw) * 2 - 1, -(y / vh) * 2 + 1, 0.5).unproject(camera);
    const dir = ndc.sub(camera.position).normalize();
    const fwd = camera.getWorldDirection(V3());
    return out.copy(camera.position).addScaledVector(dir, dist / Math.max(0.2, dir.dot(fwd)));
  }
  function worldPerPixel(dist) { return 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / vh; }

  /* ---------- resize ---------- */
  function resize() {
    [vw, vh] = size();
    renderer.setPixelRatio(dpr);
    renderer.setSize(vw, vh, false);
    bw = Math.floor(vw * dpr); bh = Math.floor(vh * dpr);
    rtScene.setSize(bw, bh);
    for (let i = 0; i < LEVELS; i++) { const w = Math.max(1, bw >> (i + 1)), h = Math.max(1, bh >> (i + 1)); down[i].setSize(w, h); up[i].setSize(w, h); }
    layout();
    for (const m of aspectMats) m.uniforms.uAspect.value = vw / vh;
    const pix = camera.projectionMatrix.elements[5] * bh * 0.5;
    for (const m of pixMats) m.uniforms.uPix.value = pix;
    snowMat.uniforms.uMinPx.value = 1.1 / bh * 2;
    bgMat.uniforms.uRes.value.set(bw, bh);
    compMat.uniforms.uAsp.value = vw / vh;
    beamMat.uniforms.uRes.value.set(vw / 2, vh / 2);
  }

  /* ---------- per-frame ---------- */
  const U = { fade: 0, warm: 0, bloomBoost: 0, red: 0, humanI: 0, humanBloom: 0, humanSize: 9.5, logoForm: 0, logoDis: 0, caretScreen: null, sparksI: 0,
    beam: 0, beamT: 0, beamW: 1.0, rimI: 0, cross: 0, above: 0 };
  const _up = V3();
  function update(dt, t, drive) {
    runAnims(dt);
    // camera
    if (rig.mode === 'scroll') {
      poseAt(drive.layerF, tmpPose);
      const intro = drive.intro;
      tmpPose.p.y += 5 * (1 - intro); tmpPose.p.z += 8 * (1 - intro);
      tmpPose.t.y += 6.5 * (1 - intro); tmpPose.t.z += 10 * (1 - intro);
      const F = drive.layerF;
      // kernel: while its text scrolls up, the camera tilts down so the monument clears the column (B's kp)
      if (drive.kpK > 0) {
        const on = sstep(2.5, 3, F) * (1 - sstep(3, 3.2, F));
        const kk = sstep(0, 0.34, drive.kpK) * on, k2 = sstep(0.4, 0.9, drive.kpK) * on;
        tmpPose.t.y -= (lay.narrow ? 9.5 : 10.5) * kk + 24 * k2; tmpPose.p.z += (lay.narrow ? 6 : 12) * kk + 8 * k2; tmpPose.p.y += 3 * kk + 5 * k2;
      }
      // products: toward the final ask the camera lifts its eyes to the sky (Doksuri)
      if (drive.kpP > 0) {
        const kk = sstep(0.15, 1, drive.kpP) * sstep(3.7, 4, F);
        tmpPose.t.y += (lay.narrow ? 26 : 30) * kk; tmpPose.p.y += 2 * kk;
      }
      rig.parT.set(drive.px, drive.py);
      rig.par.lerp(rig.parT, 1 - Math.exp(-2.5 * dt));
      const k = REDUCED ? 60 : 5.5;
      rig.pos.lerp(tmpPose.p, 1 - Math.exp(-k * dt));
      rig.look.lerp(tmpPose.t.add(_up.set(rig.par.x * 2.2, -rig.par.y * 1.4, 0)), 1 - Math.exp(-k * dt));
    } else {
      if (rig.track) {
        rig.jLook.lerp(rig.track.fn(), 1 - Math.exp(-3 * dt));
        rig.jPos.copy(rig.jLook).add(rig.track.off);
      }
      if (rig.follow) {
        rig.offC.lerp(rig.offT, 1 - Math.exp(-rig.offK * dt)); rig.lookC.lerp(rig.lookT, 1 - Math.exp(-rig.offK * dt));
        rig.jPos.copy(cap.pos).add(rig.offC); rig.jLook.copy(cap.pos).add(rig.lookC);
      }
      if (rig.follow || rig.snap) { rig.pos.copy(rig.jPos); rig.look.copy(rig.jLook); }
      else { rig.pos.lerp(rig.jPos, 1 - Math.exp(-rig.jK * dt)); rig.look.lerp(rig.jLook, 1 - Math.exp(-(rig.jK + 1) * dt)); }
    }
    camera.position.copy(rig.pos);
    camera.lookAt(rig.look);
    const fov = rig.baseFov + rig.fovKick * 9;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov; camera.updateProjectionMatrix();
      const pix = camera.projectionMatrix.elements[5] * bh * 0.5;
      for (const m of pixMats) m.uniforms.uPix.value = pix;
    }
    camera.updateMatrixWorld();
    if (dt > 0) { const v = V3().subVectors(rig.pos, rig.prev).divideScalar(Math.max(dt, 1e-3)); rig.vel.lerp(v, 1 - Math.exp(-10 * dt)); }
    rig.prev.copy(rig.pos);
    const cy = camera.position.y;
    const depth01 = clamp(-cy / 350);
    // above the surface: sky instead of water, the sea seen from above, no marine snow
    const above01 = sstep(SURF - 0.8, SURF + 0.8, cy);
    U.above = above01;
    U.cross = 1 - clamp(Math.abs(cy - SURF) / 3);

    bgMat.uniforms.uIVP.value.multiplyMatrices(camera.matrixWorld, camera.projectionMatrixInverse);
    bgMat.uniforms.uCam.value.copy(camera.position); bgMat.uniforms.uTime.value = t; bgMat.uniforms.uDepth.value = depth01; bgMat.uniforms.uWarm.value = U.warm;
    bgMat.uniforms.uAbove.value = above01;
    surface.visible = cy > -175 && above01 < 0.999;
    surfMat.uniforms.uCam.value.copy(camera.position); surfMat.uniforms.uTime.value = t; surfMat.uniforms.uVis.value = Math.pow(clamp(1 - (SURF - cy) / 200), 2.2) * (1 - above01); surfMat.uniforms.uWarm.value = U.warm;
    seaTop.visible = above01 > 0.001;
    if (seaTop.visible) { seaTopMat.uniforms.uCam.value.copy(camera.position); seaTopMat.uniforms.uTime.value = t; seaTopMat.uniforms.uVis.value = above01; seaTopMat.uniforms.uWarm.value = U.warm; }
    snowMat.uniforms.uCam.value.copy(camera.position); snowMat.uniforms.uTime.value = t; snowMat.uniforms.uVel.value.copy(rig.vel); snowMat.uniforms.uWarm.value = U.warm * 0.8;
    snowMat.uniforms.uBright.value = lerp(1.15, 0.6, depth01) * (1 - above01);
    snow.visible = above01 < 0.999;
    snowMat.uniforms.uPtr.value.set(drive.ptrX, drive.ptrY); snowMat.uniforms.uPtrOn.value = damp(snowMat.uniforms.uPtrOn.value, drive.ptrOn, 3, dt);

    // logo
    logo.visible = U.logoDis < 0.999 && U.logoForm > 0;
    if (logo.visible) {
      logoMat.uniforms.uForm.value = U.logoForm; logoMat.uniforms.uDis.value = U.logoDis; logoMat.uniforms.uTime.value = t;
      if (U.caretScreen) {
        const d = 14; screenToWorld(U.caretScreen.x, U.caretScreen.y, d, logoMat.uniforms.uCaret.value);
        logoMat.uniforms.uCaretW.value = U.caretScreen.w * 0.5 * worldPerPixel(d);
      }
    }
    // pod
    updateLanterns(dt, t, camera.position);
    updatePod(dt, t, camera.position);
    // products above the surface
    updateAbove(dt, t, cy);
    // tool zone
    const toolVis = cy < -150;
    tool.visible = toolVis; seabed.visible = cy < -185;
    if (toolVis) {
      // integrated phase so the dashes can reverse smoothly (rework: the current runs backwards)
      for (const c of currents) { c.phase = (c.phase ?? t) + dt * (c.dir ?? 1); c.mat.uniforms.uTime.value = c.phase; }
      for (const g of gates) { g.flash = damp(g.flash, 0, 2.2, dt); g.mat.uniforms.uAlpha.value = 0.7 + g.flash * 3.2; }
      for (let i = 0; i < DP_N; i++) { const d = dpState[i]; d.u += d.s * dt; if (d.u > 1) { d.u = 0; d.c = Math.floor(Math.random() * currents.length); } const p = currents[d.c].curve.getPointAt(d.u); dpPos[i * 3] = p.x; dpPos[i * 3 + 1] = p.y + 0.2; dpPos[i * 3 + 2] = p.z; }
      dpGeo.attributes.position.needsUpdate = true;
      for (const c of corals) { c.grow = damp(c.grow, c.target, 0.6, dt); c.pulse = damp(c.pulse, 0, 1.4, dt); c.mat.uniforms.uGrow.value = c.grow; c.pm.uniforms.uGrow.value = c.grow; c.mat.uniforms.uPulse.value = c.pulse; c.mat.uniforms.uTime.value = t; c.pm.uniforms.uTime.value = t; }
      for (let i = 0; i < 8; i++) { const c = corals[i]; if (c) { sbMat.uniforms.uPools.value[i].copy(c.root); sbMat.uniforms.uPoolI.value[i] = c.grow * 0.55 + c.pulse * 0.9 + c.mat.uniforms.uHi.value * 0.6; } }
      updateSorage(dt, t);
      updateGaori(dt, t);
      updateMulgae(dt, t);
      atn.mat.uniforms.uTime.value = t;
    }
    sbMat.uniforms.uCam.value.copy(camera.position); sbMat.uniforms.uTime.value = t;
    kernel.group.visible = cy < -215;
    if (kernel.group.visible) updateKernel(dt, t);
    // capsule & friends
    updateCapsule(dt, t);
    swMat.uniforms.uTime.value = t;
    humanMat.uniforms.uI.value = U.humanI; humanMat.uniforms.uTime.value = t; humanMat.uniforms.uBloom.value = U.humanBloom; humanMat.uniforms.uSize.value = U.humanSize;
    human.visible = U.humanI > 0.001;
    spMat.uniforms.uI.value = U.sparksI; spMat.uniforms.uTime.value = t; spMat.uniforms.uC.value.copy(cap.pos);
    sparks.visible = U.sparksI > 0.001;
    // the workbench and its journey effects
    updateBench(dt, t);
    feeder.a = damp(feeder.a, feeder.aT, 2.2, dt);
    feeder.phase = (feeder.phase ?? t) + dt * feeder.dir;
    if (feeder.mesh) { feeder.mesh.visible = feeder.a > 0.002; feeder.U.uTime.value = feeder.phase; feeder.mat.uniforms.uA.value = feeder.a; }
    updatePulses(dt);
    rimSparks.visible = U.rimI > 0.001 && bench.i > 0.01;
    if (rimSparks.visible) {
      const R = rsMat.uniforms; R.uC.value.copy(bench.center); R.uRt.value.copy(bench.right); R.uUp.value.copy(bench.up);
      R.uHalf.value.set(bench.rect.w / 2, bench.rect.h / 2); R.uWpp.value = bench.wpp; R.uI.value = U.rimI; R.uBead.value = bench.beadS; R.uTime.value = t;
    }
    U.beam = damp(U.beam, U.beamT, 3.2, dt);
    beam.visible = U.beam > 0.002 && cap.vis > 0.01;
    if (beam.visible) {
      beamMat.uniforms.uA.value.copy(humanMat.uniforms.uPos.value);
      beamMat.uniforms.uB.value.copy(cap.pos).addScaledVector(_up.setFromMatrixColumn(camera.matrixWorld, 1), 0.3);
      beamMat.uniforms.uW.value = U.beamW; beamMat.uniforms.uI.value = U.beam * Math.min(1, U.humanI * 2 + 0.2); beamMat.uniforms.uTime.value = t;
    }
    U.red = damp(U.red, 0, 3.2, dt);
    compMat.uniforms.uFade.value = U.fade; compMat.uniforms.uWarm.value = U.warm; compMat.uniforms.uTime.value = t; compMat.uniforms.uRed.value = U.red;
    compMat.uniforms.uBloom.value = 0.95 + U.bloomBoost;
    compMat.uniforms.uExpo.value = 1.05 + U.cross * 0.45;
    if (U.warm > 0.001) { _p.copy(humanMat.uniforms.uPos.value).project(camera); compMat.uniforms.uWarmPos.value.set((_p.x + 1) / 2, (_p.y + 1) / 2); }
    for (const h of hooks) h(dt, t);
  }
  function render() {
    renderer.setRenderTarget(rtScene);
    renderer.render(scene, camera);
    // bloom (LV active levels; setLoad/setTier step it down without reallocating)
    downMat.uniforms.tSrc.value = rtScene.texture; downMat.uniforms.uTexel.value.set(1 / bw, 1 / bh); downMat.uniforms.uFirst.value = 1; downMat.uniforms.uThr.value = 0.42;
    pass(downMat, down[0]);
    downMat.uniforms.uFirst.value = 0;
    for (let i = 1; i < LV; i++) { downMat.uniforms.tSrc.value = down[i - 1].texture; downMat.uniforms.uTexel.value.set(1 / down[i - 1].width, 1 / down[i - 1].height); pass(downMat, down[i]); }
    let low = down[LV - 1];
    for (let i = LV - 2; i >= 0; i--) {
      upMat.uniforms.tLow.value = low.texture; upMat.uniforms.tCur.value = down[i].texture; upMat.uniforms.uTexel.value.set(1 / low.width, 1 / low.height); upMat.uniforms.uW.value = 1.0;
      pass(upMat, up[i]); low = up[i];
    }
    compMat.uniforms.tScene.value = rtScene.texture; compMat.uniforms.tBloom.value = up[0].texture;
    pass(compMat, null);
  }
  function setDpr(d) { dpr = d; resize(); }

  /* ---------- quality: tier steps (runtime, downward) and DOM-heavy load ---------- */
  let load = 'normal';
  function applyLoad() {
    const heavy = load === 'dom-heavy';
    LV = clamp(Math.min(LEVELS, P.levels) - (heavy ? 1 : 0), 2, LEVELS);
    snowGeo.instanceCount = Math.min(SNOW_N, Math.round(P.snow * (heavy ? 0.5 : 1)));
    W.SW_N = Math.min(SW_N, P.swarm);
  }
  function setLoad(l) { load = l === 'dom-heavy' ? 'dom-heavy' : 'normal'; applyLoad(); }
  function setTier(name) {
    const T = TIERS[name]; if (!T) return tierName;
    tierName = name; W.tier = name;
    Object.assign(P, { dpr: T.dpr, msaa: T.msaa, levels: T.levels, snow: T.snow, swarm: T.swarm });
    if (name === 'low' && lay.narrow) Object.assign(P, { dpr: 1.25, snow: 700 });
    DPR_MAX = P.dpr; W.DPR_MAX = DPR_MAX;
    if (rtScene.samples !== P.msaa) {
      rtScene.dispose();
      rtScene = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true, stencilBuffer: false, samples: P.msaa });
    }
    dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    applyLoad();
    resize();
    return tierName;
  }
  // shaders compile off the critical path; one silent frame warms the post passes
  async function compile() {
    try { await renderer.compileAsync(scene, camera); } catch (e) { /* older drivers: compile on first use */ }
    const f = compMat.uniforms.uFade.value; compMat.uniforms.uFade.value = 0; render(); compMat.uniforms.uFade.value = f;
  }
  function dispose() {
    hooks.clear(); anims.clear();
    scene.traverse(o => { o.geometry?.dispose?.(); const m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach(x => x.dispose?.()); });
    [rtScene, ...down, ...up].forEach(r => r.dispose());
    [downMat, upMat, compMat].forEach(m => m.dispose()); fsGeo.dispose();
    renderer.dispose();
  }

  resize();
  applyLoad();
  rig.prev.copy(rig.pos);
  Object.assign(W, { snowMat, lantern, followCap, holdCam, update, render, resize, rig, U, cap, swarm, swMat, swGeo, swA, swB, swR, SW_N: W.SW_N, gaori, mulgae, gates, main, currents, corals, pod, atn, sorage, kernel, pickables, project, screenToWorld, worldPerPixel, startSweep, camDepthMeters, lay, poseAt, getDpr: () => dpr, setDpr, DPR_MAX, human, HUMAN, humanMat, seabedH,
    SURF, LY, camAt, unprojectWith, bench, benchMesh, benchProjectedRect, buildFeeder, feeder, dispatchPulse, pulses, rimSparks, beam, beamMat, animTo, hooks,
    above, sudal, doksuri, ember, land, seaTop, setTier, setLoad, compile, dispose, size: () => [vw, vh], P });
  return W;
}

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Decode } from "./motion";
import { scrollToId } from "./smooth";

/* The 3D piece of the landing section. The intro's particles carry on into a
   sculpture beside the name that keeps re-forming into a shape for one of the
   builds: a sphere, MORPH's agent network, TRACE's recovery loop, and
   LedgerGuard's balanced lattice. The cursor pushes particles aside like a
   force field and scrolling away scatters them. Rendering pauses off-screen;
   reduced motion gets a still sphere. Loaded lazily with three.js. */

const SHAPES = [
  { label: "Verified, not trusted", build: "00", target: "about" },
  { label: "MORPH — agent network", build: "01", target: "work" },
  { label: "TRACE — recovery loop", build: "02", target: "live-trace" },
  { label: "LedgerGuard — balanced ledger", build: "03", target: "work" },
];
const HOLD = 4.2, MORPH = 1.9;
const LIME = new THREE.Color("#d4ff3f");
const BONE = new THREE.Color("#f0ede6");

const vertex = /* glsl */ `
  uniform float uTime, uMorph, uForm, uScatter, uPixelRatio, uSize, uAspect, uPush;
  uniform vec2 uPointer;
  attribute vec3 aFrom;
  attribute vec3 aStart;
  attribute float aRand;
  varying float vRand;
  varying float vAlpha;

  void main() {
    // morph from the previous shape, each particle on its own schedule, swirling mid-flight
    float m = clamp((uMorph - aRand * 0.35) / 0.65, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);
    float swirl = sin(m * 3.14159);
    vec3 p = mix(aFrom, position, m);
    p += vec3(sin(aRand * 41.0 + uTime * 0.9), cos(aRand * 29.0 + uTime * 1.1), sin(aRand * 17.0 - uTime * 0.7)) * 0.6 * swirl;
    p += normalize(p + 1e-4) * sin(uTime * 1.2 + aRand * 20.0) * 0.022;

    // assemble out of a loose cloud once the intro clears
    float f = clamp((uForm - aRand * 0.4) / 0.6, 0.0, 1.0);
    f = f * f * (3.0 - 2.0 * f);
    p = mix(aStart, p, f);

    // scatter as the page scrolls away
    p *= 1.0 + uScatter * (0.5 + aRand * 2.4);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // screen-space force field around the cursor
    vec2 d = gl_Position.xy / gl_Position.w - uPointer;
    d.x *= uAspect;
    float len = length(d);
    vec2 dir = len > 1e-4 ? d / len : vec2(0.0);
    dir.x /= uAspect;
    gl_Position.xy += dir * smoothstep(0.3, 0.0, len) * uPush * 0.2 * gl_Position.w;

    gl_PointSize = (1.9 + aRand * 2.6) * uPixelRatio * uSize * (7.0 / -mv.z);
    vRand = aRand;
    vAlpha = (0.25 + 0.75 * f) * (1.0 - uScatter) * (0.7 + 0.6 * swirl);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uLime;
  uniform vec3 uBone;
  varying float vRand;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    bool lime = vRand > 0.88;
    gl_FragColor = vec4(lime ? uLime : uBone, a * (lime ? 1.0 : 0.72) * vAlpha);
  }
`;

/* ── shape generators: each returns n points, roughly radius 2.1 ── */
const jitter = s => (Math.random() - 0.5) * 2 * s;

function sphere(n) {
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    out.set([Math.cos(th) * r * 2.1, y * 2.1, Math.sin(th) * r * 2.1], i * 3);
  }
  return out;
}

function network(n) {
  // 15 nodes on a loose shell plus a hub, each wired to its 3 nearest neighbours
  const nodes = [[0, 0, 0]];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 15; i++) {
    const y = 1 - (i / 14) * 2, r = Math.sqrt(1 - y * y), th = golden * i * 1.7;
    const R = 1.6 + (i % 3) * 0.25;
    nodes.push([Math.cos(th) * r * R, y * R * 0.95, Math.sin(th) * r * R]);
  }
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const edges = new Set();
  nodes.forEach((a, i) => {
    nodes.map((b, j) => [j, dist(a, b)]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 3)
      .forEach(([j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  for (let i = 1; i < nodes.length; i += 3) edges.add(`0-${i}`);
  const E = [...edges].map(e => e.split("-").map(Number));
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let p;
    if (i % 3 === 0) {
      const c = nodes[i % nodes.length], s = c === nodes[0] ? 0.22 : 0.11;
      p = [c[0] + jitter(s), c[1] + jitter(s), c[2] + jitter(s)];
    } else {
      const [a, b] = E[i % E.length].map(k => nodes[k]), t = Math.random();
      p = [a[0] + (b[0] - a[0]) * t + jitter(0.018), a[1] + (b[1] - a[1]) * t + jitter(0.018), a[2] + (b[2] - a[2]) * t + jitter(0.018)];
    }
    out.set(p, i * 3);
  }
  return out;
}

function torusKnot(n) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = Math.cos(3 * t) + 2.2;
    const tube = 0.17 * Math.sqrt(Math.random());
    out.set([r * Math.cos(2 * t) * 0.7 + jitter(tube), r * Math.sin(2 * t) * 0.7 + jitter(tube), -Math.sin(3 * t) * 0.7 + jitter(tube)], i * 3);
  }
  return out;
}

function lattice(n) {
  // the edges of a 3x3x3 cube lattice: every line balanced against its opposite
  const g = [-1.35, -0.45, 0.45, 1.35];
  const lines = [];
  for (const a of g) for (const b of g) lines.push([0, a, b], [1, a, b], [2, a, b]);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const [axis, a, b] = lines[i % lines.length];
    const t = (Math.random() * 2 - 1) * 1.35;
    const p = axis === 0 ? [t, a, b] : axis === 1 ? [a, t, b] : [a, b, t];
    out.set(p.map(v => v + jitter(0.014)), i * 3);
  }
  return out;
}

export default function HeroSculpture({ ready, anchors: anchorProp = [] }) {
  const [anchors] = useState(anchorProp); // refs, stable for the component's life
  const mountRef = useRef(null);
  const readyRef = useRef(ready);
  const [shape, setShape] = useState(0);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  useEffect(() => {
    const mount = mountRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL — the hero is still complete without it
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const N = small ? 3200 : 6000;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    const group = new THREE.Group();
    scene.add(group);

    const shapes = [sphere(N), network(N), torusKnot(N), lattice(N)];
    const start = new Float32Array(N * 3);
    const rand = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const s = 4 + Math.random() * 7, u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1);
      start.set([Math.sin(v) * Math.cos(u) * s, Math.sin(v) * Math.sin(u) * s, Math.cos(v) * s], i * 3);
      rand[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    const toAttr = new THREE.BufferAttribute(shapes[0].slice(), 3);
    const fromAttr = new THREE.BufferAttribute(shapes[0].slice(), 3);
    geo.setAttribute("position", toAttr);
    geo.setAttribute("aFrom", fromAttr);
    geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uMorph: { value: 1 }, uForm: { value: still ? 1 : 0 }, uScatter: { value: 0 },
        uPixelRatio: { value: dpr }, uSize: { value: small ? 0.95 : 1 }, uAspect: { value: 1 },
        uPointer: { value: new THREE.Vector2(9, 9) }, uPush: { value: 0 },
        uLime: { value: LIME }, uBone: { value: BONE },
      },
    });
    const points = new THREE.Points(geo, material);
    points.frustumCulled = false;
    group.add(points);

    // Centre the sculpture on whichever anchor is laid out (the hero's right
    // column on desktop, a band above the name on phones) and size it to fill it.
    // The canvas runs well past the fold so a shape is never clipped mid-scroll.
    const EXTENT = 4.7; // widest shape, in world units, with some breathing room
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      material.uniforms.uAspect.value = w / h;
      const m = mount.getBoundingClientRect();
      const a = anchors.map(r => r.current?.getBoundingClientRect()).find(r => r && r.width > 0 && r.height > 0);
      const box = a
        ? { x: a.left - m.left + a.width / 2, y: a.top - m.top + a.height / 2, size: Math.min(a.width, a.height) }
        : { x: w / 2, y: h / 2, size: Math.min(w, h) * 0.7 };
      const tan = Math.tan((camera.fov * Math.PI) / 360);
      const visH = (EXTENT * h) / Math.max(box.size, 120);
      camera.position.z = visH / (2 * tan);
      camera.updateProjectionMatrix();
      const visW = visH * camera.aspect;
      group.position.x = (box.x / w - 0.5) * visW;
      group.position.y = (0.5 - box.y / h) * visH;
      if (still) renderer.render(scene, camera);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    anchors.forEach(r => r.current && ro.observe(r.current));

    const pointer = { x: 9, y: 9, active: 0, last: -10 };
    const onMove = e => {
      const r = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      pointer.last = performance.now() / 1000;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0, visible = true, cur = 0, phaseStart = null, morphing = false, formStart = null;
    const clock = new THREE.Clock();
    const ease = t => 1 - Math.pow(1 - t, 3);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const u = material.uniforms;
      u.uTime.value = t;

      if (readyRef.current) {
        if (formStart === null) { formStart = t; phaseStart = t + 0.8; }
        u.uForm.value = ease(Math.min((t - formStart) / 2.2, 1));
      }

      // hold a shape, then morph into the next one
      if (phaseStart !== null) {
        const e = t - phaseStart;
        if (!morphing && e > HOLD) {
          const next = (cur + 1) % shapes.length;
          fromAttr.array.set(shapes[cur]); fromAttr.needsUpdate = true;
          toAttr.array.set(shapes[next]); toAttr.needsUpdate = true;
          cur = next; morphing = true; phaseStart = t; u.uMorph.value = 0;
          setShape(next);
        } else if (morphing) {
          u.uMorph.value = Math.min(e / MORPH, 1);
          if (e >= MORPH) { morphing = false; phaseStart = t; }
        }
      }

      const sinceMove = t - pointer.last;
      pointer.active += ((sinceMove < 1.2 ? 1 : 0) - pointer.active) * 0.06;
      u.uPointer.value.set(pointer.x, pointer.y);
      u.uPush.value = pointer.active;

      const scatter = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.95), 0), 1);
      u.uScatter.value = scatter * scatter;

      group.rotation.y = t * 0.16 + scatter * 1.2;
      group.rotation.x = 0.32 + Math.sin(t * 0.21) * 0.08;
      group.rotation.z = Math.sin(t * 0.17) * 0.06;
      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(mount);
    if (!still) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose(); material.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, [anchors]);

  const s = SHAPES[shape];
  return (
    <>
      <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[160svh] [&>canvas]:h-full [&>canvas]:w-full" />
      <button
        type="button"
        onClick={() => scrollToId(s.target)}
        data-cursor="View"
        className={`group absolute top-[54svh] right-[var(--gutter)] z-20 hidden -translate-y-1/2 rotate-180 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] transition-opacity duration-700 [writing-mode:vertical-rl] hover:text-[var(--ink)] lg:flex ${ready ? "opacity-100" : "opacity-0"}`}
      >
        <span className="flex flex-col gap-1.5">
          {SHAPES.map((x, i) => <span key={x.build} className={`h-4 w-[2px] rounded-full transition-colors duration-500 ${i === shape ? "bg-[var(--accent)]" : "bg-[var(--border-hi)]"}`} />)}
        </span>
        <span className="text-[var(--accent)]">{s.build}</span>
        <Decode key={shape} text={s.label} speed={1.6} />
      </button>
    </>
  );
}

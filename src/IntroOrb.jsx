import { useEffect, useRef } from "react";
import * as THREE from "three";

/* The 3D piece of the opening: a few thousand particles drift in from a loose
   cloud, settle onto a sphere wrapped by three orbit rings, and rotate with a
   slight pointer parallax. When `leaving` flips, the camera flies forward and
   the particles burst outward while the intro's column shutter lifts.
   Loaded lazily, so three.js is only fetched when the intro actually plays. */

const COUNT = 4200;
const RADIUS = 2.1;
const LIME = new THREE.Color("#d4ff3f");
const BONE = new THREE.Color("#f0ede6");

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uForm;
  uniform float uBurst;
  uniform float uPixelRatio;
  attribute vec3 aStart;
  attribute float aRand;
  varying float vRand;
  varying float vFade;

  void main() {
    // each particle settles on its own schedule so the sphere "assembles"
    float t = clamp((uForm - aRand * 0.45) / 0.55, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(aStart, position, t);

    // a slow surface ripple once formed
    float wave = sin(uTime * 1.3 + aRand * 18.0 + position.y * 2.2) * 0.045 * t;
    p += normalize(position) * wave;

    // burst outward on exit
    p *= 1.0 + uBurst * (1.2 + aRand * 2.6);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.6 + aRand * 2.4) * uPixelRatio * (7.0 / -mv.z);
    vRand = aRand;
    vFade = (1.0 - uBurst) * (0.35 + 0.65 * t);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uLime;
  uniform vec3 uBone;
  varying float vRand;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = vRand > 0.9 ? uLime : uBone;
    float base = vRand > 0.9 ? 0.95 : 0.55;
    gl_FragColor = vec4(col, a * base * vFade);
  }
`;

function buildParticles() {
  const pos = new Float32Array(COUNT * 3);
  const start = new Float32Array(COUNT * 3);
  const rand = new Float32Array(COUNT);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    // fibonacci sphere — even coverage
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    pos.set([Math.cos(th) * r * RADIUS, y * RADIUS, Math.sin(th) * r * RADIUS], i * 3);
    // scattered start, biased away from the centre
    const s = 3 + Math.random() * 6;
    const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1);
    start.set([Math.sin(v) * Math.cos(u) * s, Math.sin(v) * Math.sin(u) * s, Math.cos(v) * s], i * 3);
    rand[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
  return geo;
}

function buildRing(radius, tilt, color, opacity) {
  const pts = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  const line = new THREE.Line(geo, mat);
  line.rotation.set(tilt[0], tilt[1], tilt[2]);
  geo.setDrawRange(0, 0);
  return line;
}

const ease = t => 1 - Math.pow(1 - t, 3);

export default function IntroOrb({ leaving }) {
  const mountRef = useRef(null);
  const leavingRef = useRef(leaving);
  useEffect(() => { leavingRef.current = leaving; }, [leaving]);

  useEffect(() => {
    const mount = mountRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // no WebGL — the typographic intro still plays
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const group = new THREE.Group();
    scene.add(group);

    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uForm: { value: 0 },
        uBurst: { value: 0 },
        uPixelRatio: { value: dpr },
        uLime: { value: LIME },
        uBone: { value: BONE },
      },
    });
    const points = new THREE.Points(buildParticles(), material);
    group.add(points);

    const rings = [
      buildRing(RADIUS * 1.32, [1.2, 0.2, 0.3], LIME, 0.55),
      buildRing(RADIUS * 1.55, [-0.6, 0.4, -0.8], BONE, 0.18),
      buildRing(RADIUS * 1.78, [0.3, -0.5, 1.1], BONE, 0.12),
    ];
    rings.forEach(r => group.add(r));

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the sphere a sensible size on portrait phones
      camera.position.z = w < h ? 13 : 10;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: 0, y: 0 };
    const onMove = e => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    const clock = new THREE.Clock();
    let burstStart = null, raf = 0;
    let restZ = camera.position.z;

    const frame = () => {
      const t = clock.getElapsedTime();
      material.uniforms.uTime.value = t;
      material.uniforms.uForm.value = ease(Math.min(t / 2.0, 1));

      rings.forEach((r, i) => {
        const p = Math.min(Math.max((t - 0.5 - i * 0.18) / 1.2, 0), 1);
        r.geometry.setDrawRange(0, Math.floor(ease(p) * 257));
        r.rotation.y += 0.002 + i * 0.0015;
      });

      group.rotation.y = t * 0.22 + pointer.x * 0.25;
      group.rotation.x = 0.25 + pointer.y * 0.18;
      group.rotation.z = Math.sin(t * 0.3) * 0.05;

      if (leavingRef.current) {
        if (burstStart === null) { burstStart = t; restZ = camera.position.z; }
        const b = ease(Math.min((t - burstStart) / 1.1, 1));
        material.uniforms.uBurst.value = b;
        rings.forEach(r => { r.material.opacity *= 0.9; r.scale.setScalar(1 + b * 1.4); });
        camera.position.z = restZ - b * 6.5; // fly into the burst
      } else {
        // gentle dolly-in while the intro runs
        camera.position.z += ((mount.clientWidth < mount.clientHeight ? 12 : 8.6) - camera.position.z) * 0.012;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      points.geometry.dispose();
      material.dispose();
      rings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" className="pointer-events-none absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />;
}

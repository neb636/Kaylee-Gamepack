// The sky behind the home globe, drawn first as one full-screen triangle: a dreamy twilight from lavender down to pink
// and peach, silky pastel ribbons waving across it, little white clouds drifting by, sparkly stars twinkling (and now
// and then a shooting star), a bank of pink cotton-candy clouds rolling along the bottom in three layers, a warm glow
// round the globe with faint rays turning in it, and a soft shadow under the globe so it floats. Everything moves
// slowly so it feels alive without pulling her eyes off the globe. The globe's place on screen comes in as uniforms
// every frame.
import { BufferAttribute, BufferGeometry, Mesh, ShaderMaterial, Vector2 } from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`

// The colors are written as they show (sRGB), so no color-space conversion here. Distances are in CSS pixels.
const fragmentShader = /* glsl */ `
  uniform vec2 uRes;
  uniform vec2 uGlobe;
  uniform float uR;
  uniform float uTime;
  uniform float uGlow;
  varying vec2 vUv;

  float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
  // Inside (1) or outside (0) a shape from its signed distance, with a pixel of soft edge.
  float inside(float d) { return 1.0 - smoothstep(-0.8, 0.8, d); }

  // A soft pastel rainbow: pink, peach, butter, mint, sky, lavender.
  vec3 pastel(float h) {
    vec3 c = 0.5 + 0.5 * cos(6.2832 * (h + vec3(0.0, 0.33, 0.67)));
    return mix(vec3(1.0), c, 0.55);
  }

  // A silky ribbon of fine strands waving across the screen: its color and how much of it shows here.
  vec4 ribbon(vec2 p, float m, float y0, float tilt, float amp, float freq, float speed, float width, float hue, float t) {
    float x = p.x / m;
    float y = p.y / uRes.y;
    float mid = y0 + tilt * (x - 0.5) + amp * sin(x * freq + t * speed) + amp * 0.45 * sin(x * freq * 1.9 - t * speed * 0.7 + 1.3);
    float w = width * (0.65 + 0.35 * sin(x * freq * 0.6 + t * speed * 0.5 + 2.0));
    float v = (y - mid) / w;
    float body = 1.0 - smoothstep(0.55, 1.0, abs(v));
    float strands = 0.6 + 0.4 * cos(v * 34.0 + x * 4.0 - t * 0.25);
    return vec4(pastel(hue + v * 0.3 + x * 0.12 + t * 0.008), body * strands);
  }

  // A bank of round puffs along a line, scrolling sideways: the signed distance to its edge.
  float bank(vec2 p, float base, float cw, float seed) {
    float cell = floor(p.x / cw);
    float d = p.y - base;
    for (int i = -1; i <= 1; i++) {
      float c = cell + float(i);
      float h = hash(vec2(c, seed));
      float r = cw * (0.5 + 0.38 * h);
      vec2 at = vec2((c + 0.5 + (hash(vec2(c, seed + 7.0)) - 0.5) * 0.5) * cw, base + r * 0.1);
      d = min(d, length(p - at) - r);
    }
    return d;
  }

  // One layer of the cotton-candy clouds: flat, with a lighter crescent on the top of each puff (the toon look).
  vec3 cloudLayer(vec3 c, vec2 p, float base, float cw, float drift, float seed, vec3 body, vec3 lit, float t) {
    vec2 q = vec2(p.x + drift, p.y - sin(t * 0.35 + seed) * cw * 0.03);
    float d = bank(q, base, cw, seed);
    float a = inside(d);
    float top = 1.0 - inside(bank(q + vec2(cw * 0.07, cw * 0.13), base, cw, seed));
    c = mix(c, body, a);
    return mix(c, lit, a * top);
  }

  // A little white cloud drifting across the sky, with a lavender belly.
  vec3 puff(vec3 c, vec2 p, vec2 at, float r) {
    vec2 q = p - at;
    float d = length(q) - r;
    d = min(d, length(q - vec2(-1.05 * r, -0.3 * r)) - 0.7 * r);
    d = min(d, length(q - vec2(1.0 * r, -0.28 * r)) - 0.75 * r);
    d = min(d, length(q - vec2(0.45 * r, 0.35 * r)) - 0.7 * r);
    d = max(d, -0.62 * r - q.y);
    float a = inside(d) * 0.92;
    vec3 col = mix(vec3(0.9, 0.86, 1.0), vec3(1.0), smoothstep(-0.25 * r - 1.0, -0.25 * r + 1.0, q.y));
    return mix(c, col, a);
  }

  void main() {
    vec2 p = vUv * uRes;
    float y = vUv.y;
    float m = min(uRes.x, uRes.y);
    float t = uTime;

    // The twilight, warming and cooling a touch as the minutes go by.
    float warm = 0.5 + 0.5 * sin(t * 0.05);
    vec3 top = mix(vec3(0.72, 0.69, 0.98), vec3(0.78, 0.68, 0.97), warm);
    vec3 c = mix(vec3(1.0, 0.9, 0.85), vec3(1.0, 0.82, 0.9), smoothstep(0.0, 0.32, y));
    c = mix(c, vec3(0.93, 0.79, 0.97), smoothstep(0.3, 0.66, y));
    c = mix(c, top, smoothstep(0.64, 1.0, y));

    // How far from the globe (in globe radii): the busy things stay off it.
    vec2 g = p - uGlobe;
    float d = length(g) / uR;

    // The ribbons, sweeping behind the globe.
    vec4 r1 = ribbon(p, m, 0.42, 0.16, 0.06, 3.2, 0.22, 0.075, 0.0, t);
    c = mix(c, r1.rgb, r1.a * 0.68);
    vec4 r2 = ribbon(p, m, 0.66, -0.12, 0.045, 4.1, -0.17, 0.045, 0.45, t);
    c = mix(c, r2.rgb, r2.a * 0.52);

    // Stars: one sparkle at most in each cell of a grid, each twinkling at its own pace, plus tiny dots.
    float cs = m * 0.085;
    vec2 cell = floor(p / cs);
    float h = hash(cell);
    float h2 = hash(cell + 17.0);
    float h3 = hash(cell + 41.0);
    vec2 at = (cell + 0.5 + (vec2(h2, h3) - 0.5) * 0.45) * cs;
    float keep = smoothstep(0.3, 0.48, y) * smoothstep(1.08, 1.5, d);
    float tw = 0.5 + 0.5 * sin(t * (1.1 + h3 * 1.6) + h * 40.0);
    if (h < 0.3) {
      float s = cs * (0.1 + 0.13 * h2) * (0.55 + 0.45 * tw);
      vec2 q = (p - at) / s;
      float f = sqrt(abs(q.x)) + sqrt(abs(q.y));
      vec3 sc = h2 < 0.35 ? vec3(1.0, 0.93, 0.62) : h2 < 0.55 ? vec3(0.72, 0.97, 0.88) : h2 < 0.7 ? vec3(1.0, 0.8, 0.9) : vec3(1.0);
      float star = 1.0 - smoothstep(1.0 - 1.2 / s, 1.0 + 1.2 / s, f);
      float halo = exp(-length(q) * 2.2) * 0.35;
      c = mix(c, sc, keep * clamp(star + halo * tw, 0.0, 1.0));
    } else if (h > 0.72) {
      float speck = 1.0 - smoothstep(0.6, 2.0, length(p - at) - m * 0.002);
      c = mix(c, vec3(1.0), keep * speck * (0.35 + 0.5 * tw));
    }

    // A shooting star every 11 s, somewhere up high.
    float n = floor(t / 11.0);
    float k = (t - n * 11.0) / 1.3;
    if (k < 1.0) {
      float side = hash(vec2(n, 3.0)) < 0.5 ? -1.0 : 1.0;
      vec2 dir = normalize(vec2(side, -0.38));
      vec2 from = vec2(mix(0.2, 0.8, hash(vec2(n, 5.0))) * uRes.x, mix(0.74, 0.9, hash(vec2(n, 9.0))) * uRes.y);
      vec2 head = from + dir * m * 0.45 * (1.0 - (1.0 - k) * (1.0 - k));
      float len = m * 0.16;
      vec2 q = p - head;
      float along = clamp(dot(q, -dir) / len, 0.0, 1.0);
      float off = length(q + dir * along * len);
      float streak = (1.0 - smoothstep(0.8, 2.4 * (1.0 - along) + 0.8, off)) * (1.0 - along);
      float fade = sin(k * 3.14159);
      c = mix(c, vec3(1.0, 0.97, 0.88), fade * keep * clamp(streak + exp(-length(q) / (m * 0.006)) * 0.8, 0.0, 1.0));
    }

    // Little clouds drifting across the top half, coming round again off the other side.
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float pr = m * (0.03 + 0.012 * mod(fi * 1.7, 2.0));
      float span = uRes.x + pr * 6.0;
      float px = mod(fract(fi * 0.37 + 0.11) * span + t * m * (0.006 + 0.003 * fi), span) - pr * 3.0;
      float py = uRes.y * (0.5 + 0.09 * fi) + sin(t * 0.3 + fi * 2.0) * m * 0.006;
      c = puff(c, p, vec2(px, py), pr);
    }

    // The glow round the globe and the slow rays in it.
    float glow = exp(-pow(max(d - 0.95, 0.0) * 2.1, 1.6));
    float a = atan(g.y, g.x);
    float rays = smoothstep(0.42, 0.5, abs(fract(a * 1.909859 + t * 0.012) - 0.5));
    c = mix(c, vec3(1.0, 0.95, 0.9), uGlow * 0.16 * rays * exp(-max(d - 1.0, 0.0) * 0.9) * step(1.0, d));
    c = mix(c, vec3(1.0, 0.95, 0.92), uGlow * 0.8 * glow);
    c = mix(c, vec3(1.0, 0.84, 0.92), uGlow * 0.35 * exp(-pow(max(d - 1.05, 0.0) * 4.0, 2.0)));

    // The cotton-candy clouds rolling along the bottom, the far ones slower.
    c = cloudLayer(c, p, uRes.y * 0.16, m * 0.17, t * m * 0.006, 1.0, vec3(0.93, 0.76, 0.93), vec3(0.98, 0.86, 0.96), t);
    c = cloudLayer(c, p, uRes.y * 0.09, m * 0.14, t * m * 0.01 + 300.0, 2.0, vec3(1.0, 0.79, 0.88), vec3(1.0, 0.9, 0.95), t);
    c = cloudLayer(c, p, uRes.y * 0.02, m * 0.12, t * m * 0.015 + 700.0, 3.0, vec3(1.0, 0.87, 0.92), vec3(1.0, 0.96, 0.98), t);

    // The shadow it floats over.
    vec2 s = (p - (uGlobe - vec2(0.0, uR * 1.32))) / vec2(uR * 0.72, uR * 0.11);
    c = mix(c, vec3(0.8, 0.68, 0.9), 0.36 * uGlow * (1.0 - smoothstep(0.35, 1.0, length(s))));
    gl_FragColor = vec4(c, 1.0);
  }
`

export class Sky {
  readonly mesh: Mesh
  private mat: ShaderMaterial
  constructor() {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
    this.mat = new ShaderMaterial({
      uniforms: { uRes: { value: new Vector2(1, 1) }, uGlobe: { value: new Vector2() }, uR: { value: 100 }, uTime: { value: 0 }, uGlow: { value: 1 } },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    })
    this.mesh = new Mesh(g, this.mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = -10
  }

  /** The screen's size, where the globe's middle is (px from the top left) and its radius (px). */
  set(w: number, h: number, x: number, y: number, r: number, time: number, glow: number) {
    const u = this.mat.uniforms
    u.uRes.value.set(w, h)
    u.uGlobe.value.set(x, h - y)
    u.uR.value = r
    u.uTime.value = time
    u.uGlow.value = glow
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mat.dispose()
  }
}

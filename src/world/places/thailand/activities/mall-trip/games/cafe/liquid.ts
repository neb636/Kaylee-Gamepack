// The drinks' colors and the liquid they're drawn with.
//   - mix(): the blend of what went in, averaged like paint (in sRGB, weighted by how much of each), so strawberry
//     and banana come out pink and mango and banana yellow: the color looks like the fruit she put in.
//   - liquidMaterial(): flat toon bands like the rest of the world, plus swirling stripes of up to six colors that
//     melt into one (`mix` 0 → 1) while the blender runs, and the milk's white curls in a cha yen.
import { Color, ShaderMaterial, SRGBColorSpace, Vector3, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'

const rgb = { r: 0, g: 0, b: 0 }

/** Paint-style average of colors, weighted. */
export function mix(parts: { color: ColorRepresentation; w: number }[], out = new Color()): Color {
  let r = 0
  let g = 0
  let b = 0
  let w = 0
  for (const p of parts) {
    if (p.w <= 0) continue
    new Color(p.color).getRGB(rgb, SRGBColorSpace)
    r += rgb.r * p.w
    g += rgb.g * p.w
    b += rgb.b * p.w
    w += p.w
  }
  if (!w) return out.set('#FFFFFF')
  return out.setRGB(r / w, g / w, b / w, SRGBColorSpace)
}

export const MAX_STRIPES = 6

/** A liquid: `uCols` swirl round it (`uN` of them), turning into `uFlat` as `uMix` goes to 1. */
export function liquidMaterial(bag: Bag): ShaderMaterial {
  return bag.add(
    new ShaderMaterial({
      uniforms: {
        uCols: { value: Array.from({ length: MAX_STRIPES }, () => new Vector3(1, 1, 1)) },
        uN: { value: 1 },
        uFlat: { value: new Color('#ffffff') },
        uMix: { value: 1 },
        uTime: { value: 0 },
        uSpin: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vLocal;
        varying vec3 vNormalV;
        void main() {
          vLocal = position;
          vNormalV = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uCols[${MAX_STRIPES}];
        uniform float uN;
        uniform vec3 uFlat;
        uniform float uMix;
        uniform float uTime;
        uniform float uSpin;
        varying vec3 vLocal;
        varying vec3 vNormalV;
        void main() {
          float ang = atan(vLocal.x, vLocal.z) / 6.2831853 + 0.5;
          float band = ang * uN * 2.0 + vLocal.y * 9.0 + sin(vLocal.y * 14.0 + uTime * 3.0) * 0.35 + uTime * uSpin;
          int idx = int(mod(floor(band), uN));
          vec3 stripe = uCols[0];
          for (int i = 1; i < ${MAX_STRIPES}; i++) if (i == idx) stripe = uCols[i];
          vec3 c = mix(stripe, uFlat, uMix);
          // Two flat bands like the toon shading: lit, and a lavender-tinted shade turned away from the light.
          float lit = dot(normalize(vNormalV), normalize(vec3(-0.45, 0.6, 0.65)));
          vec3 shade = mix(c, vec3(0.72, 0.64, 0.95), 0.22) * 0.9;
          gl_FragColor = vec4(lit > 0.05 ? c : shade, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  )
}

/** Sets a liquid to one flat color. */
export function setFlat(m: ShaderMaterial, c: Color) {
  m.uniforms.uFlat.value.copy(c)
  m.uniforms.uMix.value = 1
}

/** Sets the swirl's stripes (the colors going round, most recent last). */
export function setStripes(m: ShaderMaterial, cols: Color[]) {
  const list = cols.length ? cols.slice(-MAX_STRIPES) : [new Color('#ffffff')]
  list.forEach((c, i) => (m.uniforms.uCols.value[i] as Vector3).set(c.r, c.g, c.b))
  m.uniforms.uN.value = list.length
}

// The globe's own toon shading. The engine's toon materials (engine3d/toon.ts) light every face at least as bright as the
// ambient light, which is right for a room but can't show night: here the sun is the only light, so the side away from it
// goes navy, with flat bands in between (day, a soft band, lavender twilight, night). Everything on the globe (the sea
// ice, Antarctica, the friends) uses it, so night falls on them too. One `uSun` is shared by every material.
import { Color, ShaderMaterial, Vector3, type Texture } from 'three'

export const OCEAN = '#7EC8F2'

const vertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vTint;
  varying vec2 vUv;
  varying float vLat;
  void main() {
    vUv = uv;
    #ifdef USE_COLOR
      vTint = color;
    #else
      vTint = vec3(1.0);
    #endif
    // Latitude on the globe itself (its mesh is a unit sphere: the normal is the direction from the center).
    vLat = degrees(asin(clamp(normalize(normal).y, -1.0, 1.0)));
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uSun;
  #ifdef LAND
    uniform sampler2D uMap;
    uniform vec3 uOcean;
    uniform vec3 uSnow;
    uniform float uSnowN;
    uniform float uSnowS;
  #endif
  varying vec3 vWorldNormal;
  varying vec3 vTint;
  varying vec2 vUv;
  varying float vLat;
  void main() {
    vec3 base = vTint;
    #ifdef LAND
      // The map: land where it's painted (un-premultiplied at the soft coast), ocean where it isn't, and snow on the
      // land past the snow line, which moves with the seasons.
      vec4 painted = texture2D(uMap, vUv);
      bool land = painted.a > 0.5;
      base = land ? painted.rgb / painted.a : uOcean;
      if (land && (vLat > uSnowN || vLat < -uSnowS)) base = uSnow;
    #endif
    float lit = dot(normalize(vWorldNormal), uSun);
    vec3 c = lit > 0.25 ? base
      : lit > 0.0 ? base * vec3(0.9, 0.88, 0.97)
      : lit > -0.08 ? base * vec3(0.6, 0.55, 0.85)
      : base * vec3(0.12, 0.13, 0.32) + vec3(0.03, 0.03, 0.1);
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`

/** The globe's two materials: the painted map, and vertex colors for everything on it (geo.ts parts). */
export function globeMaterials(map: Texture) {
  const uSun = { value: new Vector3(0.4, 0.6, 0.7).normalize() }
  const snowN = { value: 62 }
  const snowS = { value: 62 }
  const land = new ShaderMaterial({
    defines: { LAND: '' },
    uniforms: { uSun, uMap: { value: map }, uOcean: { value: new Color(OCEAN) }, uSnow: { value: new Color('#FFFFFF') }, uSnowN: snowN, uSnowS: snowS },
    vertexShader,
    fragmentShader,
  })
  const props = new ShaderMaterial({ uniforms: { uSun }, vertexColors: true, vertexShader, fragmentShader })
  return {
    land,
    props,
    /** Unit vector toward the sun, in world space. */
    sun: uSun.value,
    /** Latitudes (degrees) past which the land is snowy, north and south. */
    snow: { north: snowN, south: snowS },
    dispose() {
      land.dispose()
      props.dispose()
    },
  }
}

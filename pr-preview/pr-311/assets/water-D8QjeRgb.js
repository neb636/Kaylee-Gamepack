import{Mn as e,Mt as t,g as n,mt as r}from"./three.core-P3lskgbM.js";var i=`
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,a=`
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uDash;
  uniform vec3 uHaze;
  uniform float uTime;
  uniform float uHazeNear;
  uniform float uHazeFar;
  uniform float uAlpha;
  varying vec3 vWorld;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 p = vWorld.xz;
    // Two flat bands: big slow patches of lighter water.
    // (Not called "patch": that's a reserved word in WebGL2's shading language, and the shader would silently fail.)
    float blot = sin(p.x * 0.045 + uTime * 0.05) * sin(p.y * 0.038 - uTime * 0.04) + 0.35 * sin((p.x + p.y) * 0.11);
    vec3 col = blot > 0.42 ? uShallow : uDeep;
    // Wave dashes: short white strokes in rows, broken up cell by cell, drifting slowly.
    vec2 q = vec2(p.x * 0.7 + uTime * 0.35, p.y * 0.9);
    vec2 cell = floor(q / vec2(3.0, 1.0));
    float on = step(0.86, hash(cell));
    vec2 f = fract(q / vec2(3.0, 1.0));
    float dash = on * step(0.2, f.x) * step(f.x, 0.6) * step(0.4, f.y) * step(f.y, 0.6);
    float dist = distance(cameraPosition.xz, p);
    // Dashes thin out with distance (no shimmering far away).
    dash *= 1.0 - smoothstep(14.0, 42.0, dist);
    col = mix(col, uDash, dash * 0.7);
    float haze = smoothstep(uHazeNear, uHazeFar, dist);
    col = mix(col, uHaze, haze);
    // (Far off it turns solid, so the haze matches the sky's; dashes are never see-through.)
    gl_FragColor = vec4(col, mix(uAlpha, 1.0, max(haze, dash * 0.7)));
    // The colors are linear (like every material's): convert for the screen, as three's own materials do.
    #include <colorspace_fragment>
  }
`,o=class{mesh;mat;constructor(o,s){this.mat=s.add(new e({uniforms:{uDeep:{value:new n(o.deep)},uShallow:{value:new n(o.shallow)},uDash:{value:new n(`#FFFFFF`)},uHaze:{value:new n(o.haze)},uTime:{value:0},uHazeNear:{value:o.hazeNear},uHazeFar:{value:o.hazeFar},uAlpha:{value:o.opacity??1}},vertexShader:i,fragmentShader:a,transparent:(o.opacity??1)<1})),this.mesh=new r(s.add(new t(o.size,o.size)),this.mat),this.mesh.rotation.x=-Math.PI/2}update(e){this.mat.uniforms.uTime.value=e}set opacity(e){this.mat.uniforms.uAlpha.value=e}setColors(e,t,n){let r=this.mat.uniforms;r.uDeep.value.set(e),r.uShallow.value.set(t),r.uHaze.value.set(n)}};function s(e,t,n){return .05*Math.sin(e*.21+n*1.3)+.04*Math.sin(t*.17-n*1.1)+.02*Math.sin((e-t)*.5+n*2.1)}export{s as n,o as t};
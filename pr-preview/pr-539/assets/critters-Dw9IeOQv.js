import{O as e,d as t,s as n}from"./knobs-Cy_OR-b2.js";import{b as r,w as i}from"./sdk-reZHmKvQ.js";import{nt as a}from"./index-f3csc3sQ.js";import{Bn as o,Bt as s,Et as c,Ft as l,K as u,Kn as d,L as f,Rt as p,Vn as m,Vt as h,W as g,Wt as _,X as v,b as y,bt as b,dr as x,f as S,fr as C,p as ee,xt as w,yt as te,zn as T}from"./tune-DM-4b7S_.js";import{B as E,D,E as O,L as k,V as ne,X as re,b as A,c as ie,m as ae,w as j,x as M}from"./water-MMOQfNSd.js";var N={uTime:{value:0},uShade:{value:1},uGlint:{value:1}},P=`
  uniform float uTime;
  uniform float uShade;
  uniform float uGlint;
  varying vec3 vPolarW;
  varying vec3 vPolarN;
  float polarHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float polarNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(polarHash(i), polarHash(i + vec2(1.0, 0.0)), u.x), mix(polarHash(i + vec2(0.0, 1.0)), polarHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  // Big soft cloud shapes drifting with the wind (0 = in the sun, 1 = under a cloud).
  float polarCloud(vec2 p) {
    vec2 q = p * 0.02 + vec2(uTime * 0.011, uTime * 0.005);
    float n = polarNoise(q) * 0.65 + polarNoise(q * 2.3 + 7.1) * 0.35;
    return smoothstep(0.62, 0.74, n);
  }
`,oe=P,F=null;function se(){if(F)return F;let e=new c({color:`#ffffff`,vertexColors:!0,gradientMap:ne()});return e.onBeforeCompile=e=>{Object.assign(e.uniforms,N),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>\n${P}`).replace(`#include <defaultnormal_vertex>`,`#include <defaultnormal_vertex>
#ifdef USE_INSTANCING
  vPolarN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
#else
  vPolarN = normalize(mat3(modelMatrix) * objectNormal);
#endif`).replace(`#include <project_vertex>`,`#include <project_vertex>
#ifdef USE_INSTANCING
  vPolarW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
#else
  vPolarW = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>\n${P}`).replace(`#include <opaque_fragment>`,`{
      float cs = polarCloud(vPolarW.xz) * uShade;
      // Snow: near-white, not warm (Pola's cream fur stays as it is), facing the sky.
      float snowy = smoothstep(0.86, 0.95, min(vColor.r, min(vColor.g, vColor.b))) * step(vColor.r, vColor.b + 0.02) * smoothstep(0.55, 0.85, vPolarN.y);
      float dapple = polarNoise(vPolarW.xz * 0.35) * 0.6 + polarNoise(vPolarW.xz * 1.1 + 3.0) * 0.4;
      outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.9, 0.94, 1.0), snowy * smoothstep(0.45, 0.85, dapple) * 0.8);
      // Glints: one cell in many holds a tiny star that winks; nearer ones only (no shimmer far off).
      vec2 cell = floor(vPolarW.xz * 2.6);
      float h = polarHash(cell);
      vec2 f = fract(vPolarW.xz * 2.6) - 0.5 + (vec2(polarHash(cell + 3.1), polarHash(cell + 7.7)) - 0.5) * 0.5;
      float star = smoothstep(0.11, 0.0, length(f)) + smoothstep(0.035, 0.0, abs(f.x)) * smoothstep(0.2, 0.0, abs(f.y)) * 0.6 + smoothstep(0.035, 0.0, abs(f.y)) * smoothstep(0.2, 0.0, abs(f.x)) * 0.6;
      float wink = max(0.0, sin(uTime * (1.2 + h * 2.6) + h * 50.0 + (cameraPosition.x + cameraPosition.z) * 0.6));
      float near = 1.0 - smoothstep(9.0, 26.0, distance(cameraPosition, vPolarW));
      vec3 glint = h > 0.985 ? vec3(1.0, 0.86, 0.5) : h > 0.975 ? vec3(1.0, 0.7, 0.85) : vec3(0.62, 0.88, 1.0);
      float g = step(0.965, h) * min(1.0, star) * wink * near * snowy * (1.0 - cs * 0.6) * uGlint;
      outgoingLight = mix(outgoingLight, glint, g);
      outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.86, 0.85, 0.97), cs);
    }
    #include <opaque_fragment>`)},e.customProgramCacheKey=()=>`polar-look`,F=e,e}function ce(e){let t=E(`#ffffff`,!0),n=se();e.traverse(e=>{e instanceof b&&e.material===t&&(e.material=n)})}var I=`
  float swellAt(vec2 p, float t) {
    return 0.05 * sin(p.x * 0.21 + t * 1.3) + 0.04 * sin(p.y * 0.17 - t * 1.1) + 0.02 * sin((p.x - p.y) * 0.5 + t * 2.1);
  }
  vec2 swellSlope(vec2 p, float t) {
    float c3 = 0.01 * cos((p.x - p.y) * 0.5 + t * 2.1);
    return vec2(0.0105 * cos(p.x * 0.21 + t * 1.3) + c3, 0.0068 * cos(p.y * 0.17 - t * 1.1) - c3);
  }
`,le=`
  uniform float uTime;
  uniform float uLevel;
  uniform vec2 uCenter;
  uniform vec2 uFade;
  varying vec3 vWorld;
  varying float vFade;
  ${I}
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vFade = 1.0 - smoothstep(uFade.x, uFade.y, max(abs(w.x - uCenter.x), abs(w.z - uCenter.y)));
    w.y = uLevel + swellAt(w.xz, uTime) * vFade;
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,ue=`
  uniform vec3 uDeep;
  uniform vec3 uMid;
  uniform vec3 uSheen;
  uniform vec3 uSky;
  uniform vec3 uHaze;
  uniform vec3 uGlow;
  uniform vec3 uUnder;
  uniform vec3 uSunDir;
  uniform float uHazeNear;
  uniform float uHazeFar;
  // (The scene's own fog: under the water it is the deep blue that ends the view.)
  uniform vec3 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  varying vec3 vWorld;
  varying float vFade;
  ${oe}
  ${I}
  void main() {
    vec2 p = vWorld.xz;
    float t = uTime;
    float dist = distance(cameraPosition.xz, p);
    float near = 1.0 - smoothstep(14.0, 70.0, dist);
    // The painted ripple web: soft bright lines where little waves catch the light (Samet's caustics, gentler).
    float a = sin(p.x * 0.55 + sin(p.y * 0.42 + t * 0.55) * 1.6 + t * 0.4);
    float b = sin(p.y * 0.5 + sin(p.x * 0.37 - t * 0.5) * 1.6 - t * 0.35);
    float web = pow(1.0 - abs(a * b), 8.0);
    float a2 = sin(p.x * 1.3 + sin(p.y * 1.1 - t * 0.9) * 1.3 - t * 0.7);
    float b2 = sin(p.y * 1.2 + sin(p.x * 0.9 + t * 0.8) * 1.3 + t * 0.6);
    float fine = pow(1.0 - abs(a2 * b2), 10.0);
    if (!gl_FrontFacing) {
      // From under the water: the bright rippling ceiling of the sea.
      vec3 c = mix(uUnder, vec3(1.0), (web * 0.5 + fine * 0.3));
      c = mix(c, fogColor, smoothstep(fogNear, fogFar, distance(cameraPosition, vWorld)));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
      return;
    }
    // Two blues in big soft patches drifting slowly (the light through deep water).
    float blot = polarNoise(p * 0.028 + vec2(t * 0.01, -t * 0.008)) * 0.7 + polarNoise(p * 0.07 - vec2(t * 0.02, 0.0)) * 0.3;
    vec3 col = mix(uDeep, uMid, smoothstep(0.38, 0.7, blot));
    col = mix(col, uSheen, web * 0.34 * near + fine * 0.22 * (1.0 - smoothstep(6.0, 30.0, dist)));
    // The swell's faces: toward the light a touch lighter, away a touch deeper.
    vec2 sl = swellSlope(p, t) * vFade;
    vec3 n = normalize(vec3(-sl.x * 6.0 + (a2 * 0.04), 1.0, -sl.y * 6.0 + (b2 * 0.04)));
    col *= 0.94 + 0.12 * smoothstep(-0.05, 0.05, dot(n.xz, normalize(uSunDir.xz + vec2(0.0001))));
    // The sky's horizon mirrored at a low angle.
    vec3 v = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - clamp(v.y, 0.0, 1.0), 5.0);
    col = mix(col, uSky, fres * 0.6);
    // The glitter path: little stars on the water toward the low sun, each winking on and off.
    vec3 r = reflect(-v, n);
    float s = max(0.0, dot(r, normalize(uSunDir)));
    col = mix(col, uGlow, smoothstep(0.93, 1.0, s) * 0.35);
    vec2 q = p * vec2(1.6, 2.4);
    vec2 cell = floor(q);
    float h = polarHash(cell);
    vec2 f = fract(q) - 0.5;
    float spark = step(0.55, h) * smoothstep(0.16, 0.0, length(f * vec2(1.0, 1.6))) * max(0.0, sin(t * (2.0 + h * 4.0) + h * 40.0));
    col = mix(col, vec3(1.0), spark * smoothstep(0.975, 0.997, s) * near);
    // Cloud shade drifting across the water as across the ice.
    col = mix(col, col * vec3(0.84, 0.85, 0.97), polarCloud(p) * uShade * 0.6);
    // Haze toward the horizon (solid there, so it meets the sky).
    col = mix(col, uHaze, smoothstep(uHazeNear, uHazeFar, dist));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`,L={day:{deep:`#1B67B6`,mid:`#2A86D2`,sheen:`#9BE3F7`,sky:`#D6ECFB`,haze:`#DCEEFB`,glow:`#FFF6DA`,ice:`#6FE0EE`,under:`#BDF0FF`},south:{deep:`#1C5FAE`,mid:`#2C7FCB`,sheen:`#9ADDF5`,sky:`#DCE8FA`,haze:`#E2ECFA`,glow:`#FFF6E2`,ice:`#6FDCEC`,under:`#BDF0FF`},dusk:{deep:`#2B4C9C`,mid:`#4D6DBA`,sheen:`#F0C2DC`,sky:`#E6B9CF`,haze:`#D9C3DE`,glow:`#FFD7B0`,ice:`#86D6EC`,under:`#B9D8FF`},night:{deep:`#1A2462`,mid:`#283A84`,sheen:`#7F8FE0`,sky:`#4A4590`,haze:`#3E3C7E`,glow:`#CFD6FF`,ice:`#5AA6D8`,under:`#6A88D8`}};function de(e,t,n){let r={};for(let i of Object.keys(e))r[i]=`#`+fe.set(e[i]).lerp(pe.set(t[i]),n).getHexString();return r}var fe=new y,pe=new y,me=class{near;far;mat;cell;skirtMats=[];constructor(e,t){let n=e.grid??160,r=this.cell=e.cell??2,i=e.colors??L.day,a=e=>({value:new y(e)});this.mat=t.add(new T({uniforms:{...re.fog,...N,uLevel:{value:e.level??0},uCenter:{value:new x},uFade:{value:new x(n*.5-24,n*.5-6)},uDeep:a(i.deep),uMid:a(i.mid),uSheen:a(i.sheen),uSky:a(i.sky),uHaze:a(i.haze),uGlow:a(i.glow),uUnder:a(i.under),uSunDir:{value:new C(-.4,.2,-.9).normalize()},uHazeNear:{value:e.hazeNear??60},uHazeFar:{value:e.hazeFar??220}},vertexShader:le,fragmentShader:ue,side:2,fog:!0})),this.ice.set(i.ice);let s=Math.round(n/r);this.near=new b(t.add(new p(n,n,s,s).rotateX(-Math.PI/2)),this.mat);let c=4e3,u=new o([new x(-4e3,-4e3),new x(c,-4e3),new x(c,c),new x(-4e3,c)]),d=n/2;u.holes.push(new l([new x(-d,-d),new x(-d,d),new x(d,d),new x(d,-d)])),this.far=new b(t.add(new m(u).rotateX(-Math.PI/2)),this.mat),this.near.frustumCulled=this.far.frustumCulled=!1}ice=new y;get meshes(){return[this.near,this.far]}set visible(e){this.near.visible=this.far.visible=e}get level(){return this.mat.uniforms.uLevel.value}set level(e){this.mat.uniforms.uLevel.value=e;for(let t of this.skirtMats)t.uniforms.uLevel.value=e}update(e,t,n){let r=Math.round(e/this.cell)*this.cell,i=Math.round(t/this.cell)*this.cell;this.near.position.set(r,0,i),this.far.position.set(r,0,i),this.mat.uniforms.uCenter.value.set(r,i),n&&this.mat.uniforms.uSunDir.value.copy(n)}setColors(e){let t=this.mat.uniforms;t.uDeep.value.set(e.deep),t.uMid.value.set(e.mid),t.uSheen.value.set(e.sheen),t.uSky.value.set(e.sky),t.uHaze.value.set(e.haze),t.uGlow.value.set(e.glow),t.uUnder.value.set(e.under),this.ice.set(e.ice);for(let e of this.skirtMats)e.uniforms.uIce.value.copy(this.ice)}setHaze(e){this.mat.uniforms.uHaze.value.copy(e)}setHazeRange(e,t){this.mat.uniforms.uHazeNear.value=e,this.mat.uniforms.uHazeFar.value=t}skirtMaterial(e){if(this.skirtMats.length)return this.skirtMats[0];let t=e.add(new T({uniforms:{...N,uLevel:{value:this.level},uIce:{value:this.ice.clone()}},vertexShader:he,fragmentShader:ge,transparent:!0,depthWrite:!1,side:0}));return this.skirtMats.push(t),t}skirt(e,t){let n=new b(t.add(e),this.skirtMaterial(t));return n.renderOrder=2,n.frustumCulled=!1,n}},he=`
  uniform float uTime;
  uniform float uLevel;
  attribute float edge;
  attribute float along;
  varying float vEdge;
  varying float vAlong;
  varying float vDist;
  ${I}
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    w.y = uLevel + swellAt(w.xz, uTime) + 0.015;
    vEdge = edge;
    vAlong = along;
    vDist = distance(cameraPosition, w.xyz);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,ge=`
  uniform float uTime;
  uniform vec3 uIce;
  varying float vEdge;
  varying float vAlong;
  varying float vDist;
  void main() {
    // The ice under the water: turquoise next to the floe, fading out into the deep.
    float glow = pow(1.0 - vEdge, 1.7) * 0.78;
    // Foam lapping at the edge (it breathes in and out along the outline), and a thin ring drifting out from it.
    float lap = 0.13 + 0.06 * sin(uTime * 1.7 + vAlong * 1.3) + 0.03 * sin(uTime * 2.9 - vAlong * 2.1);
    float foam = 1.0 - smoothstep(lap - 0.04, lap + 0.02, vEdge);
    float ringAt = fract(uTime * 0.18 + 0.15 * sin(vAlong * 0.7));
    float ring = smoothstep(0.035, 0.0, abs(vEdge - 0.1 - ringAt * 0.6)) * (1.0 - ringAt) * 0.55;
    float w = max(foam, ring);
    vec3 col = mix(uIce, vec3(1.0), w);
    float a = max(glow, w * 0.92) * (1.0 - smoothstep(70.0, 170.0, vDist));
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;function R(e,t){let n=e.length,r=0,i=0;for(let[t,a]of e)r+=t/n,i+=a/n;let a=[],o=[],s=[],c=0;for(let l=0;l<=n;l++){let[u,d]=e[l%n],[f,p]=e[(l-1+n)%n],[m,h]=e[(l+1)%n],g=u-r,_=d-i,v=Math.hypot(g,_)||1,y=h-p,b=-(m-f),x=Math.hypot(y,b)||1,S=y/x*(g/v)+b/x*(_/v)<0?-1:1;g=g/v*.4+S*y/x*.6,_=_/v*.4+S*b/x*.6;let C=Math.hypot(g,_)||1;g/=C,_/=C,l>0&&(c+=Math.hypot(u-f,d-p)),a.push(u-g*.06,0,d-_*.06,u+g*t,0,d+_*t),o.push(0,1),s.push(c,c)}let l=[];for(let e=0;e<n;e++){let t=e*2;l.push(t,t+2,t+1,t+1,t+2,t+3)}let u=new ee;u.setAttribute(`position`,new S(new Float32Array(a),3)),u.setAttribute(`edge`,new S(new Float32Array(o),1)),u.setAttribute(`along`,new S(new Float32Array(s),1)),u.setIndex(l);let d=u.attributes.position,f=d.getX(2)-d.getX(0),p=d.getZ(2)-d.getZ(0),m=d.getX(1)-d.getX(0),h=d.getZ(1)-d.getZ(0);if(p*m-f*h<0){for(let e=0;e<l.length;e+=3)[l[e+1],l[e+2]]=[l[e+2],l[e+1]];u.setIndex(l)}return u}function _e(e,t,n=28,r=1){let i=[];for(let t=0;t<n;t++){let a=t/n*Math.PI*2;i.push([Math.cos(a)*e,Math.sin(a)*e*r])}return R(i,t)}function z(e){let t=e>>>0;return()=>(t=t*1664525+1013904223>>>0)/4294967296}var B=`#F4F8FF`,ve=`#CFE3F7`,ye=`#A9D4F5`,V=`#FFFFFF`,be=class{root=new g;sway=new g;basketR=.62;phase=Math.random()*6;constructor(e){let t=[],n=1.75;for(let e=0;e<8;e++){let r=e%2?k.lavender:k.pink,i=e/8*Math.PI*2;t.push(A.sphere(n*.62,r,{at:[Math.sin(i)*n*.42,3.55,Math.cos(i)*n*.42],scale:[.9,1.5,.9]},14))}t.push(A.sphere(n*.78,k.pink,{at:[0,3.6999999999999997,0],scale:[1,1.32,1]},16)),t.push(A.cyl(.62,.42,.7,k.lavenderDark,{at:[0,1.5,0]},14)),t.push(A.torus(.5,.07,k.gold,{at:[0,1.15,0],rot:[Math.PI/2,0,0]})),t.push(A.sphere(.16,k.gold,{at:[0,5.8,0]},10));let r=this.basketR;t.push(A.cyl(r,r*.86,.62,`#E0A868`,{at:[0,.31,0]},14)),t.push(A.torus(r,.07,`#C98B4B`,{at:[0,.62,0],rot:[Math.PI/2,0,0]})),t.push(A.torus(r*.95,.05,`#C98B4B`,{at:[0,.3,0],rot:[Math.PI/2,0,0]}));let i=[];for(let e=0;e<4;e++){let t=e/4*Math.PI*2+Math.PI/4;i.push(A.cyl(.02,.02,.62,`#8A6A4A`,{at:[Math.sin(t)*.5,.92,Math.cos(t)*.5],rot:[Math.cos(t)*.12,0,-Math.sin(t)*.12]},5))}this.sway.add(D(t,i,e,3)),this.root.add(this.sway)}seat(e){return[(e===0?-1:1)*.24,.32,.12]}get basket(){return this.sway}update(e,t){this.sway.position.y=Math.sin(t*1.1+this.phase)*.12,this.sway.rotation.z=Math.sin(t*.7+this.phase)*.035,this.sway.rotation.x=Math.sin(t*.9+this.phase*2)*.025}};function xe(e){let t=`#F0564E`,n=[A.rbox(7.2,1.5,2.3,.4,t,{at:[0,.55,0]}),A.prism([[0,-.75],[1.7,.75],[0,.75]],2.2,t,{at:[3.6,.55,0]}),A.rbox(7.25,.22,2.36,.1,`#FFFFFF`,{at:[0,1.2,0]}),A.rbox(2.6,1.3,1.7,.22,`#FFFDF7`,{at:[-1.5,1.95,0]}),A.rbox(2.9,.18,1.95,.08,t,{at:[-1.5,2.66,0]}),A.cyl(.3,.34,.9,`#FFC83D`,{at:[-2.2,3.15,0]},12),A.cyl(.32,.32,.16,k.ink,{at:[-2.2,3.62,0]},12),A.cyl(.05,.05,1.7,`#8A8FA6`,{at:[.4,2.15,0]},6),A.box(.5,.3,.03,k.mint,{at:[.67,2.85,0]})],r=[-2.3,-1.5,-.7].map(e=>A.sphere(.2,`#8FD0F5`,{at:[e,2.05,.86],scale:[1,1,.2]},10)),i=new g;return i.add(D(n,r,e,3)),i}function Se(e){return O(j([A.rbox(.9,.08,3,.03,`#E0A868`),...[-1,-.3,.4,1.1].map(e=>A.box(.9,.05,.08,`#C98B4B`,{at:[0,.06,e]}))]),e,2)}function Ce(e){let t=`#E3B878`,n=`#C98B4B`,r=.9,i=[A.box(r,.06,r,n,{at:[0,.03,0]}),A.box(r,r*.8,.06,t,{at:[0,r*.4,r/2]}),A.box(r,r*.8,.06,t,{at:[0,r*.4,-.9/2]}),A.box(.06,r*.8,r,t,{at:[r/2,r*.4,0]}),A.box(.06,r*.8,r,t,{at:[-.9/2,r*.4,0]}),A.box(.96,.08,.1,n,{at:[0,r*.8,r/2]}),A.box(.96,.08,.1,n,{at:[0,r*.8,-.9/2]})],a=[A.sphere(.2,`#7CC4F2`,{at:[-.04,r*.42,.485],scale:[1.25,.7,.08]},10),A.cone(.13,.2,`#7CC4F2`,{at:[.26,r*.42,.485],rot:[0,0,Math.PI/2],scale:[1,1,.1]},3)],o=new g;return o.add(D(i,a,e,2.5)),o}var we=class{root=new g;body=new g;tail;flips=[];phase=Math.random()*6;level=0;length;speed=0;dive=0;constructor(e,t=1){let n=t;this.length=3.4*n;let r=`#AFC3DE`,i=[A.sphere(.8*n,r,{scale:[.92,.86,1.75]},20),A.sphere(.74*n,`#F4F8FF`,{at:[0,-.16*n,.1*n],scale:[.9,.78,1.7]},18)],a=[],o=z(5);for(let e=0;e<12;e++){let e=(o()-.5)*1.5,t=(o()-.6)*1.9*n,r=.8*n*Math.sqrt(Math.max(.05,1-(t/(1.4*n))**2));a.push(A.sphere((.05+o()*.05)*n,`#8CA3C4`,{at:[Math.sin(e)*r*.92,Math.cos(e)*r*.86+.01,t],scale:[1,.3,1]},8))}for(let e of[-1,1])a.push(A.sphere(.085*n,k.ink,{at:[e*.36*n,.14*n,1.08*n]},10)),a.push(A.sphere(.03*n,`#FFFFFF`,{at:[e*.34*n,.18*n,1.15*n]},8)),a.push(A.sphere(.11*n,`#FFB3CF`,{at:[e*.46*n,-.04*n,.98*n],scale:[1,.6,.5]},8));a.push(A.torus(.14*n,.025*n,k.ink,{at:[0,-.02*n,1.3*n],rot:[.5,0,0]},Math.PI).rotateZ(Math.PI).translate(0,-.04*n,0)),i.push(A.cone(.075*n,1.5*n,`#FFF7E0`,{at:[0,.3*n,2.02*n],rot:[Math.PI/2-.16,0,0]},10));for(let e=0;e<9;e++){let t=e/9,r=t*Math.PI*5,i=.07*n*(1-t);a.push(A.sphere(.022*n,k.gold,{at:[Math.sin(r)*i,.19*n+t*1.42*n*.16+Math.cos(r)*i,1.32*n+t*1.4*n]},6))}this.body.add(D(i,a,e,3));for(let t of[-1,1]){let i=new g;i.add(O(A.sphere(.3*n,r,{at:[t*.22*n,0,0],scale:[1,.16,.6]},12),e,2.5)),i.position.set(t*.62*n,-.3*n,.35*n),this.body.add(i),this.flips.push(i)}this.tail=new g,this.tail.add(O(j([A.sphere(.3*n,r,{at:[0,0,-.3*n],scale:[.7,.6,1.5]},12),...[-1,1].map(e=>A.sphere(.34*n,r,{at:[e*.3*n,0,-.78*n],scale:[1,.16,.62],rot:[0,e*.5,0]},12))]),e,2.5)),this.tail.position.set(0,.02*n,-1.2*n),this.body.add(this.tail),this.root.add(this.body),this.saddle=new g,this.saddle.position.set(0,.66*n,-.1*n),this.body.add(this.saddle)}saddle;tip(e=new C){return this.body.localToWorld(e.set(0,.52*(this.length/3.4),2.7*(this.length/3.4)))}update(t,n){let r=e(`nari`);this.level+=(r-this.level)*(1-Math.exp(-t*18));let i=2.4+this.speed*6;this.body.position.y=.2+Math.sin(n*1.5+this.phase)*.07-this.dive,this.body.rotation.x=Math.sin(n*1.5+this.phase+1)*.05-this.level*.12,this.body.rotation.z=Math.sin(n*1.1+this.phase)*.04,this.tail.rotation.x=Math.sin(n*i+this.phase)*(.22+this.speed*.3),this.flips.forEach((e,t)=>e.rotation.z=(t?1:-1)*(.25+.2*Math.sin(n*2.2+t))),this.body.scale.setScalar(1+this.level*.05)}},Te=`#7F9CC8`,H={snow:`#FFFFFF`,rim:`#EAF5FF`,side:`#CBEBFA`,water:`#7FD6EE`,under:`#3FA9D8`};function U(e,t){let n=z(t),r=7+Math.floor(n()*3),i=[];for(let t=0;t<r;t++)i.push(e*(.78+n()*.34));let a=Math.max(12,Math.min(30,Math.round(e*4))),o=n()*6,s=[];for(let e=0;e<a;e++){let t=e/a*Math.PI*2,n=e/a*r,c=Math.floor(n),l=n-c,u=l*l*(3-2*l),d=(i[c%r]*(1-u)+i[(c+1)%r]*u)*(1+.035*Math.sin(t*5+o)+.02*Math.sin(t*11+o*2));s.push([Math.cos(t)*d,-Math.sin(t)*d])}return s}function Ee(e,t=2){let n=e;for(let e=0;e<t;e++){let e=[];for(let t=0;t<n.length;t++){let[r,i]=n[t],[a,o]=n[(t+1)%n.length];e.push([r*.75+a*.25,i*.75+o*.25],[r*.25+a*.75,i*.25+o*.75])}n=e}return n}function De(e,n,r){let i=e.attributes.position,a=e.attributes.color,o=new y,s=new y(H.side),c=new y(H.water),l=new y(H.under);for(let e=0;e<i.count;e++){let u=i.getY(e);r!==null&&u>n-.01?o.set(H.snow):u>n-.025?o.set(H.rim):u>.02?o.copy(s).lerp(c,t(n-.05,.02,u)):o.copy(c).lerp(l,t(.02,-.25,u)),a.setXYZ(e,o.r,o.g,o.b)}}function W(e,t=.18,n=.5,r=!0){let i=r===!1?0:typeof r==`number`?r:Math.min(.1,n*.22),a=t-i,s=Math.min(.08,n*.18),c=Math.max(.02,n-i-s*2),l=new o(e.map(([e,t])=>new x(e,-t))),u=M(new f(l,{depth:c,bevelEnabled:!0,bevelThickness:s,bevelSize:s,bevelSegments:2,curveSegments:1}).rotateX(-Math.PI/2),B);if(u.translate(0,a-c-s,0),De(u,a,null),!r)return u;let d=0,p=0;for(let[t,n]of e)d+=t/e.length,p+=n/e.length;let m=e.reduce((e,[t,n])=>e+Math.hypot(t-d,n-p),0)/e.length,h=Math.min(.32,.1+m*.03),g=new o(e.map(([e,t])=>{let n=e-d,r=t-p,i=Math.hypot(n,r)||1,a=Math.max(.3,(i-h-.12)/i);return new x(d+n*a,-(p+r*a))})),_=i+.04,v=_*.4,y=M(new f(g,{depth:_-v*2,bevelEnabled:!0,bevelThickness:v,bevelSize:v+.05,bevelSegments:2,curveSegments:1}).rotateX(-Math.PI/2),V);return y.translate(0,a-.04+v,0),j([u,y])}function Oe(e,t,n=.18,r=.5,i=!0){return W(U(e,t),n,r,i)}function ke(e,t){return R(U(e,t),Math.max(.55,Math.min(2.2,e*.32)))}function Ae(e,t,n){let r=Math.sin(e*127.1+t*311.7+n*74.7)*43758.5453;return r-Math.floor(r)}function G(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=Math.floor(n),o=e-r,s=t-i,c=n-a,l=e=>e*e*(3-2*e),u=l(o),d=l(s),f=l(c),p=(e,t,n)=>e+(t-e)*n,m=(e,t,n)=>Ae(r+e,i+t,a+n);return p(p(p(m(0,0,0),m(1,0,0),u),p(m(0,1,0),m(1,1,0),u),d),p(p(m(0,0,1),m(1,0,1),u),p(m(0,1,1),m(1,1,1),u),d),f)}var je=(e,t,n)=>G(e,t,n)*.6+G(e*2.1+5,t*2.1,n*2.1)*.3+G(e*4.3,t*4.3+9,n*4.3)*.1;function K(e){let t=new u(1,e.detail??3),n=t.index?t.toNonIndexed():t,r=n.attributes.position,i=e.rough??.55,a=e.seed*1.37,o=(e.peaks??[]).map(([e,t,n])=>({x:Math.cos(e)*t,z:Math.sin(e)*t,k:n})),s=new C;for(let t=0;t<r.count;t++){s.fromBufferAttribute(r,t);let n=je(s.x*1.7+a,s.y*1.7,s.z*1.7-a),c=s.x,l=s.z,u;if(s.y<0)u=s.y*(e.under??e.h*.15),c*=1.04,l*=1.04;else if(e.flat){let t=.42;u=s.y<t?s.y/t*.92:.92+(1-Math.cos((s.y-t)/.5800000000000001*Math.PI*.5))*.08;let n=s.y<t?1:Math.cos((s.y-t)/.5800000000000001*Math.PI*.5)*.25+.75;c=s.x/Math.max(1e-4,Math.hypot(s.x,s.z))*Math.sqrt(1-Math.min(s.y,t)**2)*n,l=s.z/Math.max(1e-4,Math.hypot(s.x,s.z))*Math.sqrt(1-Math.min(s.y,t)**2)*n,u*=e.h}else{let t=.35;for(let e of o){let n=Math.hypot(s.x-e.x,s.z-e.z);t=Math.max(t,e.k*Math.exp(-(n*n)/.18))}u=s.y**.85*t*e.h;let n=1-.45*s.y**1.5;c*=n,l*=n}let d=1+(n-.5)*i*.5;r.setXYZ(t,c*e.rx*d,u*(s.y>0?1+(n-.5)*i*.25:1),l*e.rz*d)}n.computeVertexNormals();let c=n.attributes.normal,l=new Float32Array(r.count*3),d=z(e.seed+3),f=new y,p=1e-4;for(let e=0;e<r.count;e++)p=Math.max(p,r.getY(e));for(let t=0;t<r.count;t+=3){let n=(r.getY(t)+r.getY(t+1)+r.getY(t+2))/3,i=(c.getY(t)+c.getY(t+1)+c.getY(t+2))/3;f.set(e.paint(n,i,n/p,d));for(let e=0;e<3;e++)l.set([f.r,f.g,f.b],(t+e)*3)}n.setAttribute(`color`,new S(l,3));for(let e of Object.keys(n.attributes))[`position`,`normal`,`color`].includes(e)||n.deleteAttribute(e);return n}function q(e,t,n,r){if(e<0)return H.under;if(t>.62)return r()<.25?`#F4FAFF`:V;if(e<.25||n<.08)return H.water;let i=r();return n<.35?i<.3?`#A6E2F4`:i<.75?`#BCE8F7`:`#D3F0FB`:i<.25?`#C4E9F8`:i<.7?`#DDF2FC`:`#EEF8FF`}function Me(e,t,n=e<1.6?2:3){let r=z(t),i=2+Math.floor(r()*3),a=[];for(let e=0;e<i;e++)a.push([r()*Math.PI*2,r()*.55,.6+r()*.55]);return a[0][2]=1,K({rx:e*.95,rz:e*(.8+r()*.25),h:e*(1.7+r()*.9),seed:t,peaks:a,under:e*.3,detail:n,rough:.6,paint:q})}function Ne(e,t,n){return K({rx:e/2,rz:t/2,h:n,seed:Math.round(e*7+t*3),flat:!0,under:n*.25,detail:3,rough:.35,paint:q})}function Pe(e,t,n){let r=z(n),i=[[r()*6,r()*.15,1],[r()*6,.45+r()*.2,.55+r()*.2],[r()*6,.5+r()*.2,.45+r()*.2]];return K({rx:e,rz:e*(.7+r()*.25),h:t,seed:n+40,peaks:i,under:1,detail:3,rough:.75,paint:(e,t,n,r)=>{if(n>.62-t*.25||t>.78)return r()<.2?`#EEF3FF`:V;let i=r();return n>.35?i<.5?`#B4C0E0`:`#A5B2D8`:i<.5?`#C3CBE8`:`#B3BEE2`}})}function Fe(e,n){let r=A.sphere(e,V,{scale:[1,n/e,.7]},14),i=r.attributes.position,a=r.attributes.color,o=new y;for(let e=0;e<i.count;e++)o.set(V).lerp(Ie.set(`#DCE6FA`),t(n*.5,-n*.2,i.getY(e))),a.setXYZ(e,o.r,o.g,o.b);return r}var Ie=new y,Le=class{points;mat;constructor(e,t=220,n=180){let r=z(21),i=new Float32Array(t*3);for(let e=0;e<t;e++){let t=r()*Math.PI*2,a=.08+r()*.9,o=Math.sqrt(1-a*a);i.set([Math.cos(t)*o*n,a*n,Math.sin(t)*o*n],e*3)}let a=e.add(new ee);a.setAttribute(`position`,new S(i,3)),this.mat=e.add(new h({color:`#FFFFFF`,size:2.4,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1})),this.points=new s(a,this.mat),this.points.frustumCulled=!1}set opacity(e){this.mat.opacity=e,this.points.visible=e>.01}update(e){this.mat.size=2.4+.5*Math.sin(e*2.2)}},Re=class{root=new g;mat;flareT=0;amount=0;constructor(e,t=`#8FE3C8`,n=`#FF8FB8`){this.mat=e.add(new T({uniforms:{uTime:{value:0},uAmount:{value:0},uLow:{value:new y(t)},uHigh:{value:new y(n)}},vertexShader:`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            // The curtain's folds: it waves toward and away as it goes along.
            p.z += sin(p.x * 0.09 + uTime * 0.6) * 9.0 + sin(p.x * 0.23 - uTime * 0.9) * 3.0;
            p.y += sin(p.x * 0.05 + uTime * 0.4) * 4.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`,fragmentShader:`
          uniform float uTime;
          uniform float uAmount;
          uniform vec3 uLow;
          uniform vec3 uHigh;
          varying vec2 vUv;
          void main() {
            // Bright along the bottom edge, fading up; streaked with rays that drift along.
            float rays = 0.55 + 0.45 * sin(vUv.x * 90.0 + uTime * 1.3 + sin(vUv.x * 17.0) * 2.0);
            float up = smoothstep(0.0, 0.08, vUv.y) * pow(1.0 - vUv.y, 1.6);
            float ends = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
            vec3 col = mix(uLow, uHigh, smoothstep(0.15, 0.85, vUv.y));
            gl_FragColor = vec4(col, up * rays * ends * uAmount * 0.85);
            #include <colorspace_fragment>
          }`,transparent:!0,blending:2,depthWrite:!1,side:2,fog:!1}));for(let[t,n,r,i,a,o]of[[-30,62,-150,240,70,.1],[50,78,-165,200,60,-.2],[-80,70,-120,160,55,.5]]){let s=new b(e.add(new p(i,a,64,1)),this.mat);s.position.set(t,n,r),s.rotation.y=o,s.frustumCulled=!1,s.renderOrder=-1,this.root.add(s)}}flare(){this.flareT=1}update(e,t){this.flareT=Math.max(0,this.flareT-e*.7),this.mat.uniforms.uTime.value=t*(1+this.flareT*2),this.mat.uniforms.uAmount.value=this.amount*(1+this.flareT*.8),this.root.visible=this.amount>.01}};function ze(e,t,n,r){let i=new g,a=new b(e.add(A.cyl(t,t,.01,n,{rot:[Math.PI/2,0,0]},28)),e.add(new w({color:n,fog:!1,depthWrite:!1}))),o=new b(e.add(A.cyl(t*1.7,t*1.7,.01,r,{at:[0,0,-.5],rot:[Math.PI/2,0,0]},28)),e.add(new w({color:r,transparent:!0,opacity:.28,fog:!1,depthWrite:!1})));return o.renderOrder=-3,a.renderOrder=-2,i.add(o,a),i}var J=.5,Y=1.4,Be=.3,X=class{kind;size;root=new g;spinner=new g;tilt=new g;inner;flippers=[];rig;life;pivot;height;hopT=-1;spinT=-1;phase=Math.random()*6;full=1;constructor(e,t,n=1,r=!0){this.kind=t,this.size=n,this.root.add(this.spinner),this.spinner.add(this.tilt);let i=t===`chick`;this.height=(i?.82:1.15)*n;let o=i?`pebble`:t===`emperor`?`papa`:`adelie`,s=t===`gentoo`?{...a.adelie,dark:`#F58A3C`,extras:[]}:a[o],c=ae({...s,height:this.height},e);this.rig=c,this.inner=c.root,this.pivot=Be*this.height,this.flippers.push(c.armR,c.armL);let l=c.root.children[0];l.visible=r,this.root.add(l),this.life=new ie(c,o),this.tilt.add(this.inner),this.tilt.position.y=this.pivot,this.inner.position.y=-this.pivot}hop(){(this.hopT<0||this.hopT>J*.7)&&(this.hopT=0)}spin(){this.spinT=0}get busy(){return this.hopT>=0||this.spinT>=0}get spinning(){return this.spinT>=0}center(e){return this.root.localToWorld(e.set(0,this.height*.5,0))}beak(e){return this.rig.head.localToWorld(e.set(...this.rig.face.mouth))}update(e,t,n={}){let a=this.inner;this.life.update(e);let o=0,s=0;if(this.hopT>=0){this.hopT+=e;let t=this.hopT/J;if(t>=1)this.hopT=-1;else{let e=i(t,.2,.8);o=r(e)*.3,s=t<.2?r(t/.4)*.2:t>.8?r((t-.8)/.4)*.16:-.08*r(e)}}let c=0;if(this.spinT>=0){this.spinT+=e;let t=this.spinT/Y;t>=1?this.spinT=-1:c=Math.PI*6*(1-(1-t)**2.5)}let l=n.belly??0,u=n.stretch??0,d=.025*Math.sin(t*2.6+this.phase),f=s-u;a.position.y=-this.pivot+o*this.size,a.scale.set(1+f*.5,1-f+d*(1-l),1+f*.5);let p=n.wiggle??0;this.tilt.rotation.x=l*Math.PI*.5+p*Math.PI*.42,this.spinner.rotation.y=c,this.tilt.rotation.z=(n.waddle??0)*.16*Math.sin(t*11)+(this.spinT>=0?.25*Math.sin(this.spinT*18)*(1-this.spinT/Y):0);let m=this.full,h=this.rig,g=1+(m-1)*.5;h.body.scale.set(g,1+(m-1)*.2,g),h.body.rotation.set(0,p*.3*Math.sin(t*22),p*.2*Math.sin(t*17)),h.head.rotation.set(-.9*l*(1-p)-.3*(n.flail??0)-.55*(n.lookUp??0),0,(n.waddle??0)*.25*Math.sin(t*11+.6));let _=n.swim??0,v=n.flail??0,y=n.wings??0;this.flippers.forEach((e,n)=>{let r=n?-1:1;e.rotation.x=_*.4*Math.sin(t*8+n*.4),e.rotation.z=r*(.12+y*1.25+_*(.9+.6*Math.sin(t*8))+v*(2.2+.4*Math.sin(t*19+n))+p*.8*Math.sin(t*15+n*2))})}},Ve=class{root=new g;body=new g;spinT=-1;length=2.6;constructor(e){let t=`#9AA3B5`;this.body.add(D([A.capsule(.42,1.6,t,{at:[0,0,0],rot:[Math.PI/2,0,0],scale:[1,1,.85]}),A.sphere(.4,t,{at:[0,.08,1.15],scale:[1,.85,1.15]}),A.cone(.32,.55,t,{at:[0,0,-1.4],rot:[-Math.PI/2,0,0],scale:[1.4,1,.35]}),A.capsule(.11,.42,t,{at:[.48,-.15,.55],rot:[0,0,1.2]}),A.capsule(.11,.42,t,{at:[-.48,-.15,.55],rot:[0,0,-1.2]})],[...[[.3,.25,.2],[-.25,.3,-.3],[.2,.3,-.8],[-.3,.15,.4],[0,.38,-.2]].map(([e,t,n])=>A.sphere(.07,`#5D6577`,{at:[e,t,n],scale:[1,.5,1]})),A.sphere(.045,k.ink,{at:[.15,.25,1.48]}),A.sphere(.045,k.ink,{at:[-.15,.25,1.48]}),A.torus(.13,.02,k.ink,{at:[0,0,1.5],rot:[0,0,Math.PI]},Math.PI),A.sphere(.05,k.pink,{at:[.25,.08,1.42],scale:[1,.6,.4]}),A.sphere(.05,k.pink,{at:[-.25,.08,1.42],scale:[1,.6,.4]})],e,2.5)),this.root.add(this.body)}spin(){this.spinT<0&&(this.spinT=0)}update(e,t){this.spinT>=0&&(this.spinT+=e)>1.1&&(this.spinT=-1),this.body.rotation.z=this.spinT>=0?Math.PI*2*(1-(1-this.spinT/1.1)**2):.15*Math.sin(t*1.7),this.body.rotation.x=.1*Math.sin(t*2.3)}},He=`#A9AEBB`,Z=`#BDB9B6`;function Ue(e,t,n){return[A.sphere(e*.13,k.ink,{at:[e*.38,t,n]},8),A.sphere(e*.13,k.ink,{at:[-e*.38,t,n]},8)]}var We=class{kind;root=new g;body;front=new g;eyes;eyeY;actT=-1;phase=Math.random()*6;asleep=!1;height;constructor(e,t,n=1){this.kind=t;let r=t===`elephant`,i=r?`#A99783`:He,a=r?`#C9BAA6`:`#D5D9E2`,o=.44*n;this.height=o*1.7,this.body=D([A.sphere(o,i,{at:[0,o*.8,-o*.5],scale:[1.2,.85,2.2]}),A.sphere(o*.8,a,{at:[0,o*.55,-o*.3],scale:[1.15,.6,2]}),A.cone(o*.5,o*.9,i,{at:[0,o*.4,-o*2.9],rot:[-Math.PI/2,0,0],scale:[1.7,1,.4]},8),A.sphere(o*.36,i,{at:[o*1.15,o*.2,o*.4],scale:[1.5,.3,.8],rot:[0,-.5,0]},10),A.sphere(o*.36,i,{at:[-o*1.15,o*.2,o*.4],scale:[1.5,.3,.8],rot:[0,.5,0]},10)],r?[]:[[.5,1.45,-.6],[-.4,1.5,-1.1],[.2,1.52,-.2],[-.7,1.3,-.3],[.6,1.3,-1.5],[0,1.48,-1.6]].map(([e,t,n])=>A.sphere(o*.12,`#7C8394`,{at:[e*o,t*o,n*o],scale:[1,.4,1]},8)),e,2.5);let s=o*.72;this.front.position.set(0,o*.75,o*.9),this.front.add(O(j([A.sphere(s,i,{at:[0,s*.2,s*.7],scale:[1,.95,1.1]}),A.sphere(s*.55,a,{at:[0,-s*.05,s*1.5],scale:[1.2,.8,.8]},12),r?A.sphere(s*.42,`#8C7A68`,{at:[0,-s*.25,s*1.9],scale:[.9,1.3,.9]},12):A.sphere(s*.15,k.ink,{at:[0,s*.1,s*1.95],scale:[1.3,.8,.6]},8)]),e,2.5)),this.eyeY=s*.45,this.eyes=O(j(Ue(s,this.eyeY,s*1.5)),e,0),this.front.add(this.eyes),this.root.add(this.body,this.front)}act(){this.actT<0&&(this.actT=0)}get busy(){return this.actT>=0}update(e,t){let i=0;this.actT>=0&&(this.actT+=e,this.actT>1.5?this.actT=-1:i=r(n(this.actT/1.5)));let a=+!!this.asleep,o=Math.sin(t*(this.asleep?1.4:2.2)+this.phase);this.body.scale.set(1+i*.06,1+o*.03-i*.05,1),this.front.rotation.x=a*.55-i*.9+(1-a)*.05*o,this.front.rotation.z=i*.18*Math.sin(t*16),this.front.rotation.y=(1-a)*(1-i)*.25*Math.sin(t*.6+this.phase),this.eyes.scale.y=this.asleep?.15:1,this.eyes.position.y=this.asleep?this.eyeY*.85:0}},Ge=class{chick;root=new g;bird=new g;head=new g;wings=[];flapT=-1;phase=Math.random()*6;tucked=0;height;constructor(e,t=!1){this.chick=t;let n=t?Z:`#7C604C`,r=t?`#A39E9A`:`#5E4636`,i=t?.3:.24;this.height=t?.62:.72;let a=t?i*.92:.36,o=[A.sphere(i,n,{at:[0,a,0],scale:t?[1,.95,1]:[1,.9,1.5]})];if(t){for(let e=0;e<7;e++){let t=e*2.4;o.push(A.sphere(i*.3,e%2?n:`#CFCBC8`,{at:[Math.cos(t)*i*.8,a+(e%3-1)*i*.5,Math.sin(t)*i*.8]},8))}o.push(A.sphere(i*.26,`#CFCBC8`,{at:[0,a+i*.92,0]},8))}else o.push(A.cone(.12,.34,r,{at:[0,a+.02,-.42],rot:[-Math.PI/2,0,0],scale:[1.5,1,.3]},8),A.cyl(.02,.02,.2,`#4A4F60`,{at:[.08,.1,0]},6),A.cyl(.02,.02,.2,`#4A4F60`,{at:[-.08,.1,0]},6));this.bird.add(O(j(o),e,2));let s=t?.17:.15;this.head.position.set(0,t?a+i*.7:a+.22,t?i*.55:.26),this.head.add(O(j([A.sphere(s,n,{at:[0,s*.4,0]},14),A.cone(s*.36,s*1.1,t?`#6A6F80`:`#3F3A3A`,{at:[0,s*.3,s*1.15],rot:[Math.PI/2,0,0]},8)]),e,2),O(j(Ue(s,s*.6,s*.82)),e,0));for(let n of[1,-1]){let o=new g;o.position.set(n*i*.8,a+i*.3,0);let s=t?.2:.46;o.add(O(j([A.sphere(s,r,{at:[n*s*.8,0,-.03],scale:[1,.14,t?.7:.6]},10),...t?[]:[A.sphere(s*.3,`#FFFFFF`,{at:[n*s*1.2,.02,0],scale:[1,.16,.6]},8)]]),e,2)),this.wings.push(o),this.bird.add(o)}this.bird.add(this.head),this.root.add(this.bird)}flap(){this.flapT<0&&(this.flapT=0)}update(e,t){let i=0;this.flapT>=0&&(this.flapT+=e,this.flapT>1.3?this.flapT=-1:i=r(n(this.flapT/1.3)));let a=1-this.tucked;this.bird.position.y=i*(this.chick?.35:1.2),this.bird.scale.y=1+.03*Math.sin(t*2.4+this.phase),this.head.scale.setScalar(Math.max(.001,a)),this.head.rotation.y=a*.5*Math.sin(t*.9+this.phase),this.head.rotation.x=-i*.4,this.wings.forEach((e,t)=>{let n=t?-1:1;e.rotation.z=n*(this.flapT>=0?.9*Math.sin(this.flapT*24):-1.25*(this.chick?.9:1)),e.scale.setScalar(this.chick?Math.max(.3,a):1)})}},Ke=class{root=new g;body;fluke=new g;flippers=[];singT=-1;constructor(e,t=1){let n=`#4F6A92`,r=`#DCE8F5`,i=1.25*t;this.body=O(j([A.sphere(i,n,{scale:[1,.95,3.3]}),A.sphere(i*.9,r,{at:[0,-i*.28,i*.9],scale:[.95,.75,2.2]}),A.cone(i*.5,i*2.4,n,{at:[0,0,-i*3.6],rot:[-Math.PI/2,0,0],scale:[1,1,.8]},10),A.sphere(i*.22,n,{at:[0,i*.95,-i*1.2],scale:[.5,1,1.4]},8),A.sphere(i*.07,k.ink,{at:[i*.8,i*.05,i*2.1]},8),A.sphere(i*.07,k.ink,{at:[-i*.8,i*.05,i*2.1]},8)]),e,3),this.fluke.position.set(0,0,-i*4.6),this.fluke.add(O(j([1,-1].map(e=>A.sphere(i*.8,n,{at:[e*i*.7,0,-i*.2],scale:[1,.12,.55],rot:[0,e*.5,0]},10))),e,3));for(let t of[1,-1]){let n=new g;n.position.set(t*i*.85,-i*.3,i*1.2),n.add(O(A.sphere(i*1.1,r,{at:[t*i*1,0,-i*.2],scale:[1,.1,.3],rot:[0,t*.4,0]},10),e,3)),this.flippers.push(n),this.root.add(n)}this.root.add(this.body,this.fluke)}sing(){this.singT<0&&(this.singT=0)}update(e,t){let i=0;this.singT>=0&&(this.singT+=e,this.singT>2.2?this.singT=-1:i=r(n(this.singT/2.2))),this.fluke.rotation.x=.35*Math.sin(t*1.3),this.root.rotation.z=i*.6+.05*Math.sin(t*.7),this.root.rotation.x=.06*Math.sin(t*1.3+1),this.flippers.forEach((e,n)=>e.rotation.z=(n?-1:1)*(-.35+.2*Math.sin(t*.9+n)+(n?0:i*1.1*Math.sin(t*6))))}};function qe(){return j([A.sphere(.5,Z,{at:[0,.05,0],scale:[1,.85,1]},16),A.torus(.48,.11,`#D8D5D2`,{at:[0,.02,0],rot:[Math.PI/2,0,0]}),A.sphere(.17,`#E9E7E5`,{at:[0,.52,0]},10)])}var Q=34,Je=new te,Ye=new _,Xe=new C,$=new C,Ze=new C(0,0,1),Qe=class{kind;root=new g;found=!1;foundT=-1;wobT=-1;actT=-1;height;pen;cap;seal;chick;hat;swing;fish;fishAt=[];inner=new g;constructor(e,t){if(this.kind=t,this.root.add(this.inner),this.height=.9,t===`snowy`)this.pen=new X(e,`adelie`,.8),this.pen.root.visible=!1,this.cap=O(j([A.sphere(.5,`#FFFFFF`,{at:[0,.36,0],scale:[1.05,.95,1.05]},14),A.sphere(.3,`#FFFFFF`,{at:[.3,.16,.2]},10),A.sphere(.28,`#FFFFFF`,{at:[-.32,.14,-.1]},10),A.sphere(.2,Z,{at:[0,.78,.02],scale:[1,.8,1]},10)]),e,2.5),this.inner.add(this.pen.root,this.cap);else if(t===`seal`)this.seal=new We(e,`weddell`,1),this.seal.asleep=!0,this.inner.add(this.seal.root);else if(t===`skua`)this.chick=new Ge(e,!0),this.chick.tucked=1,this.inner.add(this.chick.root);else if(t===`hat`)this.inner.add(O(A.sphere(.6,`#FFFFFF`,{at:[0,.1,0],scale:[1.2,.6,1.2]},14),e,2.5)),this.hat=O(qe(),e,2.5),this.hat.scale.setScalar(.7),this.hat.position.y=.5,this.inner.add(this.hat);else if(t===`buoy`)this.swing=new g,this.swing.position.y=2.4,this.swing.add(O(j([A.cyl(.03,.03,2.4,`#8A8FA6`,{at:[0,-1,0]},6),A.sphere(.5,He,{at:[0,-2.4,0]},16),A.torus(.5,.06,k.gold,{at:[0,-2.4,0],rot:[Math.PI/2,0,0]}),A.cyl(.12,.12,.2,`#F0564E`,{at:[0,-1.85,0]},10)]),e,2.5)),this.inner.add(this.swing);else{let t=e.add(new d(.09,6,4).scale(.6,1,2.2));this.fish=e.add(new v(t,E(`#B4BCCB`),Q)),this.fish.frustumCulled=!1;for(let e=0;e<Q;e++){let t=1-2*(e+.5)/Q,n=Math.sqrt(1-t*t),r=e*2.4;this.fishAt.push(new C(Math.cos(r)*n,t,Math.sin(r)*n))}this.inner.add(this.fish)}}wobble(){this.wobT=0}reveal(e=!1){this.found||(this.found=!0,this.foundT=e?9:0,this.seal&&(this.seal.asleep=!1),this.pen&&(this.pen.root.visible=!0),this.hat&&(this.hat.visible=!1),e||this.act())}act(){this.actT=0,this.pen?.hop(),this.seal?.act(),this.chick?.flap()}update(e,t){this.foundT>=0&&(this.foundT+=e),this.actT>=0&&(this.actT+=e)>2.4&&(this.actT=-1);let i=0;this.wobT>=0&&(this.wobT+=e,this.wobT>.6?this.wobT=-1:i=Math.sin(this.wobT*26)*(1-this.wobT/.6));let a=this.found?n(this.foundT/.35):0;if(this.inner.rotation.z=i*.14,this.inner.scale.y=this.found||this.kind===`buoy`||this.kind===`fish`?1:1+.03*Math.sin(t*2.2),this.cap&&(this.cap.scale.setScalar(Math.max(.001,1-a)),this.cap.visible=a<1),this.pen?.update(e,t),this.seal?.update(e,t),this.chick&&(this.chick.tucked=1-a,this.chick.update(e,t)),this.swing){let e=this.actT>=0?Math.exp(-this.actT*1.4):0;this.swing.rotation.z=.05*Math.sin(t*.9)+i*.1+e*.7*Math.sin(this.actT*5),this.swing.rotation.x=e*.3*Math.sin(this.actT*4+1)}if(this.fish){let e=this.actT>=0?r(n(this.actT/2.4)):0,i=(this.found?1.3:.55)+e*2.6;this.fishAt.forEach((e,n)=>{let r=t*(this.found?.7:1.6)+n*.02,a=Math.cos(r),o=Math.sin(r);$.set((e.x*a-e.z*o)*i,e.y*i*.8+.05*Math.sin(t*5+n),(e.x*o+e.z*a)*i),Ye.setFromUnitVectors(Ze,Xe.set(-(e.x*o+e.z*a),0,e.x*a-e.z*o).normalize()),Je.compose($,Ye,Xe.set(1,1,1)),this.fish.setMatrixAt(n,Je)}),this.fish.instanceMatrix.needsUpdate=!0}}};export{L as A,xe as C,ze as D,Ee as E,ce as F,_e as M,R as N,Ne as O,N as P,Se as S,z as T,Fe as _,qe as a,W as b,Re as c,ye as d,Te as f,Me as g,Le as h,Ge as i,de as j,me as k,be as l,we as m,We as n,X as o,ve as p,Qe as r,Ve as s,Ke as t,B as u,Oe as v,Pe as w,Ce as x,ke as y};
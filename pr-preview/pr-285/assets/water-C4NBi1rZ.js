import{G as e,H as t,Nn as n,Nt as r,Rt as i,_ as a,gt as o,h as s,ht as c,k as l,mt as u,sr as d}from"./tune-CdlCmUWz.js";var f=new u,p=new i,m=new d,h=new d,g=new i().setFromAxisAngle(new d(1,0,0),-Math.PI/2),_=class{o;mesh;pool=[];next=0;live=0;palette;constructor(n,r){this.o=n;let i=n.kind===`foam`?new s(.5,16):new t(.5,0),c=new o({color:n.color??`#FFFFFF`,transparent:(n.opacity??1)<1,opacity:n.opacity??1,depthWrite:n.kind!==`foam`});n.kind===`foam`&&(c.polygonOffset=!0,c.polygonOffsetFactor=-2),this.mesh=r.add(new e(r.add(i),r.add(c),n.count)),this.mesh.instanceMatrix.setUsage(l),this.mesh.frustumCulled=!1,this.mesh.renderOrder=+(n.kind===`foam`);for(let e=0;e<n.count;e++)this.pool.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,age:1,life:0,size:0,color:0});if(this.palette=(n.colors??[]).map(e=>new a(e)),this.palette.length)for(let e=0;e<n.count;e++)this.mesh.setColorAt(e,this.palette[0]);this.mesh.count=0}emit(e,t,n,r,i,a,o,s,c=-1){let l=this.pool[this.next];this.next=(this.next+1)%this.pool.length,l.x=e,l.y=t,l.z=n,l.vx=r,l.vy=i,l.vz=a,l.age=0,l.life=o,l.size=s,l.color=this.palette.length?c>=0?c%this.palette.length:Math.floor(Math.random()*this.palette.length):0}burst(e,t,n,r,i,a,o=.22,s=-1){for(let c=0;c<r;c++){let r=Math.random()*Math.PI*2,c=i*(.4+Math.random()*.6);this.emit(e,t,n,Math.cos(r)*c,a*(.6+Math.random()*.6),Math.sin(r)*c,.5+Math.random()*.4,o*(.6+Math.random()*.8),s)}}get busy(){return this.live>0}update(e){let t=this.o.kind===`foam`,n=0;for(let r of this.pool){if(r.age>=r.life||(r.age+=e,r.age>=r.life))continue;let i=r.age/r.life;r.x+=r.vx*e,r.z+=r.vz*e;let a;t?(r.vx*=Math.exp(-2*e),r.vz*=Math.exp(-2*e),a=r.size*Math.sqrt(Math.min(1,i*4))*(1-i*i),p.copy(g)):(r.vy-=(this.o.gravity??14)*e,r.y+=r.vy*e,r.y<0&&(r.age=r.life),a=r.size*(1-i),p.identity()),f.compose(m.set(r.x,r.y,r.z),p,h.set(a,a,a)),this.palette.length&&this.mesh.setColorAt(n,this.palette[r.color]),this.mesh.setMatrixAt(n++,f)}this.live=n,this.mesh.count=n,this.mesh.instanceMatrix.needsUpdate=!0,this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}},v=`
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,y=`
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
`,b=class{mesh;mat;constructor(e,t){this.mat=t.add(new n({uniforms:{uDeep:{value:new a(e.deep)},uShallow:{value:new a(e.shallow)},uDash:{value:new a(`#FFFFFF`)},uHaze:{value:new a(e.haze)},uTime:{value:0},uHazeNear:{value:e.hazeNear},uHazeFar:{value:e.hazeFar},uAlpha:{value:e.opacity??1}},vertexShader:v,fragmentShader:y,transparent:(e.opacity??1)<1})),this.mesh=new c(t.add(new r(e.size,e.size)),this.mat),this.mesh.rotation.x=-Math.PI/2}update(e){this.mat.uniforms.uTime.value=e}set opacity(e){this.mat.uniforms.uAlpha.value=e}setColors(e,t,n){let r=this.mat.uniforms;r.uDeep.value.set(e),r.uShallow.value.set(t),r.uHaze.value.set(n)}};function x(e,t,n){return .05*Math.sin(e*.21+n*1.3)+.04*Math.sin(t*.17-n*1.1)+.02*Math.sin((e-t)*.5+n*2.1)}export{x as n,_ as r,b as t};
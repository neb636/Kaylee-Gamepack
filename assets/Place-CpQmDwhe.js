import{$ as e,C as t,D as n,L as r,O as i,P as a,St as o,T as s,it as c,lt as l,rt as u,st as d,tt as f,vt as p,yt as m}from"./sdk-CmxSJEtJ.js";import{$t as h,Qt as g,gt as _,ht as v,mt as y}from"./index-CJaD3QUg.js";import{n as b,r as x,t as S}from"./sfx-BBEhXNuN.js";var C=o(m(),1),w=p(),T=(0,C.memo)(function({list:e,els:t,onDown:n,onKey:r,onHover:i}){return(0,w.jsx)(w.Fragment,{children:e.map(e=>(0,w.jsx)(`button`,{ref:n=>{n?t.set(e.id,n):t.delete(e.id)},"aria-label":e.label,"data-anchor":e.id,onPointerDown:t=>{t.preventDefault(),n(t,e.id)},onClick:t=>t.detail===0&&r(e.id),onPointerEnter:t=>t.pointerType===`mouse`&&i(e.id),onPointerLeave:e=>e.pointerType===`mouse`&&i(null),style:{position:`absolute`,left:0,top:0,display:`none`,padding:0,border:`none`,borderRadius:`50%`,background:`transparent`,touchAction:`none`,cursor:`pointer`,WebkitTapHighlightColor:`transparent`},children:e.kind===`family`&&e.name&&(0,w.jsxs)(`span`,{style:{position:`absolute`,left:`50%`,top:`var(--pill, 0px)`,transform:`translate(-50%, -105%)`,whiteSpace:`nowrap`,background:`rgba(255,255,255,.92)`,color:`var(--ink)`,borderRadius:999,padding:`3px 12px`,fontSize:`clamp(13px, 1.6vw, 18px)`,fontWeight:600,boxShadow:`0 2px 6px rgba(43,35,48,.18)`,pointerEvents:`none`},children:[e.name,e.thai&&(0,w.jsx)(`small`,{style:{marginLeft:6,opacity:.7,fontFamily:`Thonburi, "Noto Sans Thai", sans-serif`},children:e.thai})]})},e.id))})});function E(e){let t=new URLSearchParams(location.search).get(e);return t===null?new URLSearchParams(location.hash.split(`?`)[1]??``).get(e):t}var D=typeof navigator<`u`&&navigator.webdriver===!0,O=E(`fps`),k=O!==null&&!isNaN(+O)?+O:D?30:60,A=performance.now();for(let e of[`pointerdown`,`pointermove`,`keydown`,`wheel`,`touchstart`])addEventListener(e,()=>A=performance.now(),{capture:!0,passive:!0});function ee(e,t=()=>!1){let n=0,r=-1/0,i=performance.now(),a=!1,o=s=>{if(a||(n=requestAnimationFrame(o),document.hidden))return;let c=s-A,l=k;if(O===null&&(D&&c>3e4?l=4:!D&&c>8e3&&t()&&(l=30)),l>0){let e=1e3/l;if(s-r<e-1.5)return;r=s-r>e*2?s:r+e}let u=Math.min(.1,Math.max(0,(s-i)/1e3));i=s,e(s,u)};return n=requestAnimationFrame(o),()=>{a=!0,cancelAnimationFrame(n)}}var te=1e3,j=1001,ne=1002,M=1003,re=1004,ie=1005,ae=1006,oe=1007,se=1008,ce=1009,le=1010,ue=1011,de=1012,fe=1013,pe=1014,me=1015,he=1016,ge=1017,_e=1018,N=1020,ve=35902,ye=35899,be=1021,P=1022,xe=1023,F=1026,I=1027,Se=1028,Ce=1029,we=1030,Te=1031,Ee=1033,De=33776,Oe=33777,ke=33778,Ae=33779,je=35840,Me=35841,Ne=35842,Pe=35843,Fe=36196,Ie=37492,Le=37496,Re=37808,ze=37809,Be=37810,Ve=37811,He=37812,Ue=37813,We=37814,Ge=37815,Ke=37816,qe=37817,Je=37818,Ye=37819,Xe=37820,Ze=37821,Qe=36492,$e=36494,et=36495,tt=36283,nt=36284,rt=36285,it=36286,at=2300,ot=2301,st=2302,ct=2400,lt=2401,ut=2402,dt=3200,ft=3201,pt=`srgb`,mt=`srgb-linear`,ht=`linear`,gt=`srgb`,_t=7680,vt=35044,yt=35048,bt=2e3,xt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},St=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Ct=Math.PI/180,wt=180/Math.PI;function Tt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(St[e&255]+St[e>>8&255]+St[e>>16&255]+St[e>>24&255]+`-`+St[t&255]+St[t>>8&255]+`-`+St[t>>16&15|64]+St[t>>24&255]+`-`+St[n&63|128]+St[n>>8&255]+`-`+St[n>>16&255]+St[n>>24&255]+St[r&255]+St[r>>8&255]+St[r>>16&255]+St[r>>24&255]).toLowerCase()}function L(e,t,n){return Math.max(t,Math.min(n,e))}function Et(e,t){return(e%t+t)%t}function Dt(e,t,n){return(1-n)*e+n*t}function Ot(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function kt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var R=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=L(this.x,e.x,t.x),this.y=L(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=L(this.x,e,t),this.y=L(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(L(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(L(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},At=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0){e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;return}if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(L(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},z=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Mt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Mt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=L(this.x,e.x,t.x),this.y=L(this.y,e.y,t.y),this.z=L(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=L(this.x,e,t),this.y=L(this.y,e,t),this.z=L(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(L(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return jt.copy(this).projectOnVector(e),this.sub(jt)}reflect(e){return this.sub(jt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(L(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},jt=new z,Mt=new At,B=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Nt.makeScale(e,t)),this}rotate(e){return this.premultiply(Nt.makeRotation(-e)),this}translate(e,t){return this.premultiply(Nt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Nt=new B;function Pt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ft(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function It(){let e=Ft(`canvas`);return e.style.display=`block`,e}var Lt={};function Rt(e){e in Lt||(Lt[e]=!0,console.warn(e))}function zt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Bt=new B().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Vt=new B().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ht(){let e={enabled:!0,workingColorSpace:mt,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Ut(e.r),e.g=Ut(e.g),e.b=Ut(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Wt(e.r),e.g=Wt(e.g),e.b=Wt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?ht:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Rt(`THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Rt(`THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[mt]:{primaries:t,whitePoint:r,transfer:ht,toXYZ:Bt,fromXYZ:Vt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:pt},outputColorSpaceConfig:{drawingBufferColorSpace:pt}},[pt]:{primaries:t,whitePoint:r,transfer:gt,toXYZ:Bt,fromXYZ:Vt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:pt}}}),e}var V=Ht();function Ut(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Wt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Gt,Kt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Gt===void 0&&(Gt=Ft(`canvas`)),Gt.width=e.width,Gt.height=e.height;let t=Gt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Gt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ft(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Ut(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Ut(t[e]/255)*255):t[e]=Ut(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},qt=0,Jt=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:qt++}),this.uuid=Tt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Yt(r[t].image)):e.push(Yt(r[t]))}else e=Yt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Yt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Kt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var Xt=0,Zt=new z,Qt=class e extends xt{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=j,i=j,a=ae,o=se,s=xe,c=ce,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Xt++}),this.uuid=Tt(),this.name=``,this.source=new Jt(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new R(0,0),this.repeat=new R(1,1),this.center=new R(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new B,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Zt).x}get height(){return this.source.getSize(Zt).y}get depth(){return this.source.getSize(Zt).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case te:e.x-=Math.floor(e.x);break;case j:e.x=e.x<0?0:1;break;case ne:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case te:e.y-=Math.floor(e.y);break;case j:e.y=e.y<0?0:1;break;case ne:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Qt.DEFAULT_IMAGE=null,Qt.DEFAULT_MAPPING=300,Qt.DEFAULT_ANISOTROPY=1;var $t=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=L(this.x,e.x,t.x),this.y=L(this.y,e.y,t.y),this.z=L(this.z,e.z,t.z),this.w=L(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=L(this.x,e,t),this.y=L(this.y,e,t),this.z=L(this.z,e,t),this.w=L(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(L(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},en=class extends xt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ae,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new $t(0,0,e,t),this.scissorTest=!1,this.viewport=new $t(0,0,e,t);let r=new Qt({width:e,height:t,depth:n.depth});this.textures=[];let i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:ae,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Jt(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},tn=class extends en{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},nn=class extends Qt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=M,this.minFilter=M,this.wrapR=j,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},rn=class extends Qt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=M,this.minFilter=M,this.wrapR=j,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},an=class{constructor(e=new z(1/0,1/0,1/0),t=new z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(sn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(sn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=sn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,sn):sn.fromBufferAttribute(r,t),sn.applyMatrix4(e.matrixWorld),this.expandByPoint(sn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),cn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),cn.copy(e.boundingBox)),cn.applyMatrix4(e.matrixWorld),this.union(cn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,sn),sn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(hn),gn.subVectors(this.max,hn),ln.subVectors(e.a,hn),un.subVectors(e.b,hn),dn.subVectors(e.c,hn),fn.subVectors(un,ln),pn.subVectors(dn,un),mn.subVectors(ln,dn);let t=[0,-fn.z,fn.y,0,-pn.z,pn.y,0,-mn.z,mn.y,fn.z,0,-fn.x,pn.z,0,-pn.x,mn.z,0,-mn.x,-fn.y,fn.x,0,-pn.y,pn.x,0,-mn.y,mn.x,0];return!yn(t,ln,un,dn,gn)||(t=[1,0,0,0,1,0,0,0,1],!yn(t,ln,un,dn,gn))?!1:(_n.crossVectors(fn,pn),t=[_n.x,_n.y,_n.z],yn(t,ln,un,dn,gn))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,sn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(sn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(on[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),on[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),on[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),on[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),on[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),on[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),on[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),on[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(on),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},on=[new z,new z,new z,new z,new z,new z,new z,new z],sn=new z,cn=new an,ln=new z,un=new z,dn=new z,fn=new z,pn=new z,mn=new z,hn=new z,gn=new z,_n=new z,vn=new z;function yn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){vn.fromArray(e,a);let o=i.x*Math.abs(vn.x)+i.y*Math.abs(vn.y)+i.z*Math.abs(vn.z),s=t.dot(vn),c=n.dot(vn),l=r.dot(vn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var bn=new an,xn=new z,Sn=new z,Cn=class{constructor(e=new z,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?bn.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;xn.subVectors(e,this.center);let t=xn.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(xn,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Sn.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(xn.copy(e.center).add(Sn)),this.expandByPoint(xn.copy(e.center).sub(Sn))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},wn=new z,Tn=new z,En=new z,Dn=new z,On=new z,kn=new z,An=new z,jn=class{constructor(e=new z,t=new z(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,wn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=wn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(wn.copy(this.origin).addScaledVector(this.direction,t),wn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Tn.copy(e).add(t).multiplyScalar(.5),En.copy(t).sub(e).normalize(),Dn.copy(this.origin).sub(Tn);let i=e.distanceTo(t)*.5,a=-this.direction.dot(En),o=Dn.dot(this.direction),s=-Dn.dot(En),c=Dn.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Tn).addScaledVector(En,d),f}intersectSphere(e,t){wn.subVectors(e.center,this.origin);let n=wn.dot(this.direction),r=wn.dot(wn)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,wn)!==null}intersectTriangle(e,t,n,r,i){On.subVectors(t,e),kn.subVectors(n,e),An.crossVectors(On,kn);let a=this.direction.dot(An),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Dn.subVectors(this.origin,e);let s=o*this.direction.dot(kn.crossVectors(Dn,kn));if(s<0)return null;let c=o*this.direction.dot(On.cross(Dn));if(c<0||s+c>a)return null;let l=-o*Dn.dot(An);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Mn=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Nn.setFromMatrixColumn(e,0).length(),i=1/Nn.setFromMatrixColumn(e,1).length(),a=1/Nn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Fn,e,In)}lookAt(e,t,n){let r=this.elements;return zn.subVectors(e,t),zn.lengthSq()===0&&(zn.z=1),zn.normalize(),Ln.crossVectors(n,zn),Ln.lengthSq()===0&&(Math.abs(n.z)===1?zn.x+=1e-4:zn.z+=1e-4,zn.normalize(),Ln.crossVectors(n,zn)),Ln.normalize(),Rn.crossVectors(zn,Ln),r[0]=Ln.x,r[4]=Rn.x,r[8]=zn.x,r[1]=Ln.y,r[5]=Rn.y,r[9]=zn.y,r[2]=Ln.z,r[6]=Rn.z,r[10]=zn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],ee=r[10],te=r[14],j=r[3],ne=r[7],M=r[11],re=r[15];return i[0]=a*x+o*T+s*k+c*j,i[4]=a*S+o*E+s*A+c*ne,i[8]=a*C+o*D+s*ee+c*M,i[12]=a*w+o*O+s*te+c*re,i[1]=l*x+u*T+d*k+f*j,i[5]=l*S+u*E+d*A+f*ne,i[9]=l*C+u*D+d*ee+f*M,i[13]=l*w+u*O+d*te+f*re,i[2]=p*x+m*T+h*k+g*j,i[6]=p*S+m*E+h*A+g*ne,i[10]=p*C+m*D+h*ee+g*M,i[14]=p*w+m*O+h*te+g*re,i[3]=_*x+v*T+y*k+b*j,i[7]=_*S+v*E+y*A+b*ne,i[11]=_*C+v*D+y*ee+b*M,i[15]=_*w+v*O+y*te+b*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=Nn.set(r[0],r[1],r[2]).length(),a=Nn.set(r[4],r[5],r[6]).length(),o=Nn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],Pn.copy(this);let s=1/i,c=1/a,l=1/o;return Pn.elements[0]*=s,Pn.elements[1]*=s,Pn.elements[2]*=s,Pn.elements[4]*=c,Pn.elements[5]*=c,Pn.elements[6]*=c,Pn.elements[8]*=l,Pn.elements[9]*=l,Pn.elements[10]*=l,t.setFromRotationMatrix(Pn),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=bt,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=bt,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Nn=new z,Pn=new Mn,Fn=new z(0,0,0),In=new z(1,1,1),Ln=new z,Rn=new z,zn=new z,Bn=new Mn,Vn=new At,Hn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(L(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-L(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(L(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-L(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(L(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-L(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Bn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Bn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Vn.setFromEuler(this),this.setFromQuaternion(Vn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Hn.DEFAULT_ORDER=`XYZ`;var Un=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},Wn=0,Gn=new z,Kn=new At,qn=new Mn,Jn=new z,Yn=new z,Xn=new z,Zn=new At,Qn=new z(1,0,0),$n=new z(0,1,0),er=new z(0,0,1),tr={type:`added`},nr={type:`removed`},rr={type:`childadded`,child:null},ir={type:`childremoved`,child:null},ar=class e extends xt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Wn++}),this.uuid=Tt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new z,n=new Hn,r=new At,i=new z(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Mn},normalMatrix:{value:new B}}),this.matrix=new Mn,this.matrixWorld=new Mn,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Un,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Kn.setFromAxisAngle(e,t),this.quaternion.multiply(Kn),this}rotateOnWorldAxis(e,t){return Kn.setFromAxisAngle(e,t),this.quaternion.premultiply(Kn),this}rotateX(e){return this.rotateOnAxis(Qn,e)}rotateY(e){return this.rotateOnAxis($n,e)}rotateZ(e){return this.rotateOnAxis(er,e)}translateOnAxis(e,t){return Gn.copy(e).applyQuaternion(this.quaternion),this.position.add(Gn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Qn,e)}translateY(e){return this.translateOnAxis($n,e)}translateZ(e){return this.translateOnAxis(er,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(qn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Jn.copy(e):Jn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Yn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?qn.lookAt(Yn,Jn,this.up):qn.lookAt(Jn,Yn,this.up),this.quaternion.setFromRotationMatrix(qn),r&&(qn.extractRotation(r.matrixWorld),Kn.setFromRotationMatrix(qn),this.quaternion.premultiply(Kn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(tr),rr.child=e,this.dispatchEvent(rr),rr.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(nr),ir.child=e,this.dispatchEvent(ir),ir.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),qn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),qn.multiply(e.parent.matrixWorld)),e.applyMatrix4(qn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(tr),rr.child=e,this.dispatchEvent(rr),rr.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Yn,e,Xn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Yn,Zn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};ar.DEFAULT_UP=new z(0,1,0),ar.DEFAULT_MATRIX_AUTO_UPDATE=!0,ar.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var or=new z,sr=new z,cr=new z,lr=new z,ur=new z,dr=new z,fr=new z,pr=new z,mr=new z,hr=new z,gr=new $t,_r=new $t,vr=new $t,yr=class e{constructor(e=new z,t=new z,n=new z){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),or.subVectors(e,t),r.cross(or);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){or.subVectors(r,t),sr.subVectors(n,t),cr.subVectors(e,t);let a=or.dot(or),o=or.dot(sr),s=or.dot(cr),c=sr.dot(sr),l=sr.dot(cr),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,lr)!==null&&lr.x>=0&&lr.y>=0&&lr.x+lr.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,lr)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,lr.x),s.addScaledVector(a,lr.y),s.addScaledVector(o,lr.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return gr.setScalar(0),_r.setScalar(0),vr.setScalar(0),gr.fromBufferAttribute(e,t),_r.fromBufferAttribute(e,n),vr.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(gr,i.x),a.addScaledVector(_r,i.y),a.addScaledVector(vr,i.z),a}static isFrontFacing(e,t,n,r){return or.subVectors(n,t),sr.subVectors(e,t),or.cross(sr).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return or.subVectors(this.c,this.b),sr.subVectors(this.a,this.b),or.cross(sr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;ur.subVectors(r,n),dr.subVectors(i,n),pr.subVectors(e,n);let s=ur.dot(pr),c=dr.dot(pr);if(s<=0&&c<=0)return t.copy(n);mr.subVectors(e,r);let l=ur.dot(mr),u=dr.dot(mr);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(ur,a);hr.subVectors(e,i);let f=ur.dot(hr),p=dr.dot(hr);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(dr,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return fr.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(fr,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(ur,a).addScaledVector(dr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},br={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},xr={h:0,s:0,l:0},Sr={h:0,s:0,l:0};function Cr(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var H=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=pt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,V.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=V.workingColorSpace){return this.r=e,this.g=t,this.b=n,V.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=V.workingColorSpace){if(e=Et(e,1),t=L(t,0,1),n=L(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Cr(i,r,e+1/3),this.g=Cr(i,r,e),this.b=Cr(i,r,e-1/3)}return V.colorSpaceToWorking(this,r),this}setStyle(e,t=pt){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=pt){let n=br[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ut(e.r),this.g=Ut(e.g),this.b=Ut(e.b),this}copyLinearToSRGB(e){return this.r=Wt(e.r),this.g=Wt(e.g),this.b=Wt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=pt){return V.workingToColorSpace(wr.copy(this),e),Math.round(L(wr.r*255,0,255))*65536+Math.round(L(wr.g*255,0,255))*256+Math.round(L(wr.b*255,0,255))}getHexString(e=pt){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=V.workingColorSpace){V.workingToColorSpace(wr.copy(this),t);let n=wr.r,r=wr.g,i=wr.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=V.workingColorSpace){return V.workingToColorSpace(wr.copy(this),t),e.r=wr.r,e.g=wr.g,e.b=wr.b,e}getStyle(e=pt){V.workingToColorSpace(wr.copy(this),e);let t=wr.r,n=wr.g,r=wr.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(xr),this.setHSL(xr.h+e,xr.s+t,xr.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(xr),e.getHSL(Sr);let n=Dt(xr.h,Sr.h,t),r=Dt(xr.s,Sr.s,t),i=Dt(xr.l,Sr.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},wr=new H;H.NAMES=br;var Tr=0,Er=class extends xt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Tr++}),this.uuid=Tt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new H(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=_t,this.stencilZFail=_t,this.stencilZPass=_t,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Dr=class extends Er{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new H(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Or=new z,kr=new R,Ar=0,jr=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ar++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=vt,this.updateRanges=[],this.gpuType=me,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)kr.fromBufferAttribute(this,t),kr.applyMatrix3(e),this.setXY(t,kr.x,kr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Or.fromBufferAttribute(this,t),Or.applyMatrix3(e),this.setXYZ(t,Or.x,Or.y,Or.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Or.fromBufferAttribute(this,t),Or.applyMatrix4(e),this.setXYZ(t,Or.x,Or.y,Or.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Or.fromBufferAttribute(this,t),Or.applyNormalMatrix(e),this.setXYZ(t,Or.x,Or.y,Or.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Or.fromBufferAttribute(this,t),Or.transformDirection(e),this.setXYZ(t,Or.x,Or.y,Or.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ot(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=kt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ot(t,this.array)),t}setX(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ot(t,this.array)),t}setY(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ot(t,this.array)),t}setZ(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ot(t,this.array)),t}setW(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),r=kt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),r=kt(r,this.array),i=kt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},Mr=class extends jr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Nr=class extends jr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Pr=class extends jr{constructor(e,t,n){super(new Float32Array(e),t,n)}},Fr=0,Ir=new Mn,Lr=new ar,Rr=new z,zr=new an,Br=new an,Vr=new z,Hr=class e extends xt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Fr++}),this.uuid=Tt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Pt(e)?Nr:Mr)(e,1):e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new B().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Ir.makeRotationFromQuaternion(e),this.applyMatrix4(Ir),this}rotateX(e){return Ir.makeRotationX(e),this.applyMatrix4(Ir),this}rotateY(e){return Ir.makeRotationY(e),this.applyMatrix4(Ir),this}rotateZ(e){return Ir.makeRotationZ(e),this.applyMatrix4(Ir),this}translate(e,t,n){return Ir.makeTranslation(e,t,n),this.applyMatrix4(Ir),this}scale(e,t,n){return Ir.makeScale(e,t,n),this.applyMatrix4(Ir),this}lookAt(e){return Lr.lookAt(e),Lr.updateMatrix(),this.applyMatrix4(Lr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Rr).negate(),this.translate(Rr.x,Rr.y,Rr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Pr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&console.warn(`THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new an);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new z(-1/0,-1/0,-1/0),new z(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];zr.setFromBufferAttribute(n),this.morphTargetsRelative?(Vr.addVectors(this.boundingBox.min,zr.min),this.boundingBox.expandByPoint(Vr),Vr.addVectors(this.boundingBox.max,zr.max),this.boundingBox.expandByPoint(Vr)):(this.boundingBox.expandByPoint(zr.min),this.boundingBox.expandByPoint(zr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Cn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new z,1/0);return}if(e){let n=this.boundingSphere.center;if(zr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Br.setFromBufferAttribute(n),this.morphTargetsRelative?(Vr.addVectors(zr.min,Br.min),zr.expandByPoint(Vr),Vr.addVectors(zr.max,Br.max),zr.expandByPoint(Vr)):(zr.expandByPoint(Br.min),zr.expandByPoint(Br.max))}zr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Vr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Vr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Vr.fromBufferAttribute(a,t),o&&(Rr.fromBufferAttribute(e,t),Vr.add(Rr)),r=Math.max(r,n.distanceToSquared(Vr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new jr(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new z,s[e]=new z;let c=new z,l=new z,u=new z,d=new R,f=new R,p=new R,m=new z,h=new z;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new z,y=new z,b=new z,x=new z;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new jr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new z,i=new z,a=new z,o=new z,s=new z,c=new z,l=new z,u=new z;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Vr.fromBufferAttribute(e,t),Vr.normalize(),e.setXYZ(t,Vr.x,Vr.y,Vr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new jr(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Ur=new Mn,Wr=new jn,Gr=new Cn,Kr=new z,qr=new z,Jr=new z,Yr=new z,Xr=new z,Zr=new z,Qr=new z,$r=new z,ei=class extends ar{constructor(e=new Hr,t=new Dr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Zr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Xr.fromBufferAttribute(s,e),a?Zr.addScaledVector(Xr,r):Zr.addScaledVector(Xr.sub(t),r))}t.add(Zr)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Gr.copy(n.boundingSphere),Gr.applyMatrix4(i),Wr.copy(e.ray).recast(e.near),!(Gr.containsPoint(Wr.origin)===!1&&(Wr.intersectSphere(Gr,Kr)===null||Wr.origin.distanceToSquared(Kr)>(e.far-e.near)**2))&&(Ur.copy(i).invert(),Wr.copy(e.ray).applyMatrix4(Ur),(n.boundingBox===null||Wr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Wr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ni(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ni(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ni(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ni(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function ti(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;$r.copy(s),$r.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo($r);return l<n.near||l>n.far?null:{distance:l,point:$r.clone(),object:e}}function ni(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,qr),e.getVertexPosition(c,Jr),e.getVertexPosition(l,Yr);let u=ti(e,t,n,r,qr,Jr,Yr,Qr);if(u){let e=new z;yr.getBarycoord(Qr,qr,Jr,Yr,e),i&&(u.uv=yr.getInterpolatedAttribute(i,s,c,l,e,new R)),a&&(u.uv1=yr.getInterpolatedAttribute(a,s,c,l,e,new R)),o&&(u.normal=yr.getInterpolatedAttribute(o,s,c,l,e,new z),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new z,materialIndex:0};yr.getNormal(qr,Jr,Yr,t.normal),u.face=t,u.barycoord=e}return u}var ri=class e extends Hr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Pr(c,3)),this.setAttribute(`normal`,new Pr(l,3)),this.setAttribute(`uv`,new Pr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new z;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function ii(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function ai(e){let t={};for(let n=0;n<e.length;n++){let r=ii(e[n]);for(let e in r)t[e]=r[e]}return t}function oi(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function si(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:V.workingColorSpace}var ci={clone:ii,merge:ai},li=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ui=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,di=class extends Er{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=li,this.fragmentShader=ui,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ii(e.uniforms),this.uniformsGroups=oi(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},fi=class extends ar{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Mn,this.projectionMatrix=new Mn,this.projectionMatrixInverse=new Mn,this.coordinateSystem=bt,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},pi=new z,mi=new R,hi=new R,gi=class extends fi{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=wt*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ct*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return wt*2*Math.atan(Math.tan(Ct*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){pi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(pi.x,pi.y).multiplyScalar(-e/pi.z),pi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(pi.x,pi.y).multiplyScalar(-e/pi.z)}getViewSize(e,t){return this.getViewBounds(e,mi,hi),t.subVectors(hi,mi)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ct*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},_i=-90,vi=1,yi=class extends ar{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new gi(_i,vi,e,t);r.layers=this.layers,this.add(r);let i=new gi(_i,vi,e,t);i.layers=this.layers,this.add(i);let a=new gi(_i,vi,e,t);a.layers=this.layers,this.add(a);let o=new gi(_i,vi,e,t);o.layers=this.layers,this.add(o);let s=new gi(_i,vi,e,t);s.layers=this.layers,this.add(s);let c=new gi(_i,vi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},bi=class extends Qt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},xi=class extends tn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new bi(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ri(5,5,5),i=new di({name:`CubemapFromEquirect`,uniforms:ii(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new ei(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=ae),new yi(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},U=class extends ar{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Si={type:`move`},Ci=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new U,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new U,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new U,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new z),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Si)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new U;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},wi=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new H(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ti=class extends ar{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Hn,this.environmentIntensity=1,this.environmentRotation=new Hn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Ei=class extends Qt{constructor(e=null,t=1,n=1,r,i,a,o,s,c=M,l=M,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Di=class extends jr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Oi=new Mn,ki=new Mn,Ai=[],ji=new an,Mi=new Mn,Ni=new ei,Pi=new Cn,Fi=class extends ei{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Di(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Mi)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new an),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Oi),ji.copy(e.boundingBox).applyMatrix4(Oi),this.boundingBox.union(ji)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Cn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Oi),Pi.copy(e.boundingSphere).applyMatrix4(Oi),this.boundingSphere.union(Pi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Ni.geometry=this.geometry,Ni.material=this.material,Ni.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Pi.copy(this.boundingSphere),Pi.applyMatrix4(n),e.ray.intersectsSphere(Pi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Oi),ki.multiplyMatrices(n,Oi),Ni.matrixWorld=ki,Ni.raycast(e,Ai);for(let e=0,n=Ai.length;e<n;e++){let n=Ai[e];n.instanceId=i,n.object=this,t.push(n)}Ai.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Di(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ei(new Float32Array(r*this.count),r,this.count,Se,me));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;i[s]=o,i.set(n,s+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ii=new z,Li=new z,Ri=new B,zi=class{constructor(e=new z(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Ii.subVectors(n,t).cross(Li.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Ii),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Ri.getNormalMatrix(e),r=this.coplanarPoint(Ii).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Bi=new Cn,Vi=new R(.5,.5),Hi=new z,Ui=class{constructor(e=new zi,t=new zi,n=new zi,r=new zi,i=new zi,a=new zi){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=bt,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Bi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bi)}intersectsSprite(e){return Bi.center.set(0,0,0),Bi.radius=.7071067811865476+Vi.distanceTo(e.center),Bi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Hi.x=r.normal.x>0?e.max.x:e.min.x,Hi.y=r.normal.y>0?e.max.y:e.min.y,Hi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Hi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Wi=class extends Qt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Gi=class extends Qt{constructor(e,t,n=pe,r,i,a,o=M,s=M,c,l=F,u=1){if(l!==1026&&l!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Jt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Ki=class extends Qt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},qi=class e extends Hr{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new z,g=new z;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new Pr(o,3)),this.setAttribute(`normal`,new Pr(s,3)),this.setAttribute(`uv`,new Pr(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Ji=class e extends Hr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new z,l=new R;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new Pr(a,3)),this.setAttribute(`normal`,new Pr(o,3)),this.setAttribute(`uv`,new Pr(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Yi=class e extends Hr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new Pr(u,3)),this.setAttribute(`normal`,new Pr(d,3)),this.setAttribute(`uv`,new Pr(f,2));function _(){let a=new z,_=new z,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new R,m=new z,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Xi=class e extends Yi{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Zi=class e extends Hr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Pr(i,3)),this.setAttribute(`normal`,new Pr(i.slice(),3)),this.setAttribute(`uv`,new Pr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new z,r=new z,i=new z;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new z;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new z;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new z,t=new z,n=new z,r=new z,o=new R,s=new R,c=new R;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.details)}},Qi=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn(`THREE.Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new R:new z);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new z,r=[],i=[],a=[],o=new z,s=new Mn;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new z)}i[0]=new z,a[0]=new z;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(L(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(L(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},$i=class extends Qi{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new R){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ea=class extends $i{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function ta(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var na=new z,ra=new ta,ia=new ta,aa=new ta,oa=class extends Qi{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new z){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(na.subVectors(r[0],r[1]).add(r[0]),c=na);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(na.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=na),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),ra.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),ia.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),aa.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(ra.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),ia.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),aa.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(ra.calc(s),ia.calc(s),aa.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new z().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function sa(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function ca(e,t){let n=1-e;return n*n*t}function la(e,t){return 2*(1-e)*e*t}function ua(e,t){return e*e*t}function da(e,t,n,r){return ca(e,t)+la(e,n)+ua(e,r)}function fa(e,t){let n=1-e;return n*n*n*t}function pa(e,t){let n=1-e;return 3*n*n*e*t}function ma(e,t){return 3*(1-e)*e*e*t}function ha(e,t){return e*e*e*t}function ga(e,t,n,r,i){return fa(e,t)+pa(e,n)+ma(e,r)+ha(e,i)}var _a=class extends Qi{constructor(e=new R,t=new R,n=new R,r=new R){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new R){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(ga(e,r.x,i.x,a.x,o.x),ga(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},va=class extends Qi{constructor(e=new z,t=new z,n=new z,r=new z){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new z){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(ga(e,r.x,i.x,a.x,o.x),ga(e,r.y,i.y,a.y,o.y),ga(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ya=class extends Qi{constructor(e=new R,t=new R){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new R){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new R){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ba=class extends Qi{constructor(e=new z,t=new z){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new z){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new z){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},xa=class extends Qi{constructor(e=new R,t=new R,n=new R){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new R){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(da(e,r.x,i.x,a.x),da(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Sa=class extends Qi{constructor(e=new z,t=new z,n=new z){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new z){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(da(e,r.x,i.x,a.x),da(e,r.y,i.y,a.y),da(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ca=Object.freeze({__proto__:null,ArcCurve:ea,CatmullRomCurve3:oa,CubicBezierCurve:_a,CubicBezierCurve3:va,EllipseCurve:$i,LineCurve:ya,LineCurve3:ba,QuadraticBezierCurve:xa,QuadraticBezierCurve3:Sa,SplineCurve:class extends Qi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new R){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(sa(o,s.x,c.x,l.x,u.x),sa(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new R().fromArray(n))}return this}}}),wa=class e extends Zi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Ta=class e extends Zi{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Ea=class e extends Hr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Pr(p,3)),this.setAttribute(`normal`,new Pr(m,3)),this.setAttribute(`uv`,new Pr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Da=class e extends Hr{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new z,p=new R;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new Pr(s,3)),this.setAttribute(`normal`,new Pr(c,3)),this.setAttribute(`uv`,new Pr(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Oa=class e extends Hr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new z,d=new z,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=0;f===0&&a===0?v=.5/t:f===n&&s===Math.PI&&(v=-.5/t);for(let n=0;n<=t;n++){let s=n/t;u.x=-e*Math.cos(r+s*i)*Math.sin(a+_*o),u.y=e*Math.cos(a+_*o),u.z=e*Math.sin(r+s*i)*Math.sin(a+_*o),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(s+v,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new Pr(p,3)),this.setAttribute(`normal`,new Pr(m,3)),this.setAttribute(`uv`,new Pr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},ka=class e extends Hr{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i},n=Math.floor(n),r=Math.floor(r);let a=[],o=[],s=[],c=[],l=new z,u=new z,d=new z;for(let a=0;a<=n;a++)for(let f=0;f<=r;f++){let p=f/r*i,m=a/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(p),u.y=(e+t*Math.cos(m))*Math.sin(p),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),l.x=e*Math.cos(p),l.y=e*Math.sin(p),d.subVectors(u,l).normalize(),s.push(d.x,d.y,d.z),c.push(f/r),c.push(a/n)}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,o=(r+1)*(e-1)+t,s=(r+1)*e+t;a.push(n,i,s),a.push(i,o,s)}this.setIndex(a),this.setAttribute(`position`,new Pr(o,3)),this.setAttribute(`normal`,new Pr(s,3)),this.setAttribute(`uv`,new Pr(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}},Aa=class e extends Hr{constructor(e=new Sa(new z(-1,-1,0),new z(-1,1,0),new z(1,1,0)),t=64,n=1,r=8,i=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:i};let a=e.computeFrenetFrames(t,i);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new z,s=new z,c=new R,l=new z,u=[],d=[],f=[],p=[];m(),this.setIndex(p),this.setAttribute(`position`,new Pr(u,3)),this.setAttribute(`normal`,new Pr(d,3)),this.setAttribute(`uv`,new Pr(f,2));function m(){for(let e=0;e<t;e++)h(e);h(i===!1?t:0),_(),g()}function h(i){l=e.getPointAt(i/t,l);let c=a.normals[i],f=a.binormals[i];for(let e=0;e<=r;e++){let t=e/r*Math.PI*2,i=Math.sin(t),a=-Math.cos(t);s.x=a*c.x+i*f.x,s.y=a*c.y+i*f.y,s.z=a*c.z+i*f.z,s.normalize(),d.push(s.x,s.y,s.z),o.x=l.x+n*s.x,o.y=l.y+n*s.y,o.z=l.z+n*s.z,u.push(o.x,o.y,o.z)}}function g(){for(let e=1;e<=t;e++)for(let t=1;t<=r;t++){let n=(r+1)*(e-1)+(t-1),i=(r+1)*e+(t-1),a=(r+1)*e+t,o=(r+1)*(e-1)+t;p.push(n,i,o),p.push(i,a,o)}}function _(){for(let e=0;e<=t;e++)for(let n=0;n<=r;n++)c.x=e/t,c.y=n/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(t){return new e(new Ca[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},ja=class extends Er{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:``},this.type=`MeshToonMaterial`,this.color=new H(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new H(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new R(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Ma=class extends Er{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=dt,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Na=class extends Er{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Pa(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Fa(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var Ia=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},La=class extends Ia{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ct,endingEnd:ct}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case lt:i=e,o=2*t-n;break;case ut:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case lt:a=e,s=2*n-t;break;case ut:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Ra=class extends Ia{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},za=class extends Ia{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ba=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Pa(t,this.TimeBufferType),this.values=Pa(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Pa(e.times,Array),values:Pa(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new za(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ra(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new La(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case at:t=this.InterpolantFactoryMethodDiscrete;break;case ot:t=this.InterpolantFactoryMethodLinear;break;case st:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return at;case this.InterpolantFactoryMethodLinear:return ot;case this.InterpolantFactoryMethodSmooth:return st}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Fa(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===st,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Ba.prototype.ValueTypeName=``,Ba.prototype.TimeBufferType=Float32Array,Ba.prototype.ValueBufferType=Float32Array,Ba.prototype.DefaultInterpolation=ot;var Va=class extends Ba{constructor(e,t,n){super(e,t,n)}};Va.prototype.ValueTypeName=`bool`,Va.prototype.ValueBufferType=Array,Va.prototype.DefaultInterpolation=at,Va.prototype.InterpolantFactoryMethodLinear=void 0,Va.prototype.InterpolantFactoryMethodSmooth=void 0;var Ha=class extends Ba{constructor(e,t,n,r){super(e,t,n,r)}};Ha.prototype.ValueTypeName=`color`;var Ua=class extends Ba{constructor(e,t,n,r){super(e,t,n,r)}};Ua.prototype.ValueTypeName=`number`;var Wa=class extends Ia{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)At.slerpFlat(i,0,a,c-o,a,c,s);return i}},Ga=class extends Ba{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Wa(this.times,this.values,this.getValueSize(),e)}};Ga.prototype.ValueTypeName=`quaternion`,Ga.prototype.InterpolantFactoryMethodSmooth=void 0;var Ka=class extends Ba{constructor(e,t,n){super(e,t,n)}};Ka.prototype.ValueTypeName=`string`,Ka.prototype.ValueBufferType=Array,Ka.prototype.DefaultInterpolation=at,Ka.prototype.InterpolantFactoryMethodLinear=void 0,Ka.prototype.InterpolantFactoryMethodSmooth=void 0;var qa=class extends Ba{constructor(e,t,n,r){super(e,t,n,r)}};qa.prototype.ValueTypeName=`vector`;var Ja=class extends ar{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new H(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Ya=new Mn,Xa=new z,Za=new z,Qa=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new R(512,512),this.mapType=ce,this.map=null,this.mapPass=null,this.matrix=new Mn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ui,this._frameExtents=new R(1,1),this._viewportCount=1,this._viewports=[new $t(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Xa.setFromMatrixPosition(e.matrixWorld),t.position.copy(Xa),Za.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Za),t.updateMatrixWorld(),Ya.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ya,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ya)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},$a=class extends fi{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},eo=class extends Qa{constructor(){super(new $a(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},to=class extends Ja{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(ar.DEFAULT_UP),this.updateMatrix(),this.target=new ar,this.shadow=new eo}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},no=class extends Ja{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},ro=class extends gi{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},io=`\\[\\]\\.:\\/`,ao=RegExp(`[\\[\\]\\.:\\/]`,`g`),oo=`[^\\[\\]\\.:\\/]`,so=`[^`+io.replace(`\\.`,``)+`]`,co=`((?:WC+[\\/:])*)`.replace(`WC`,oo),lo=`(WCOD+)?`.replace(`WCOD`,so),uo=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,oo),fo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,oo),po=RegExp(`^`+co+lo+uo+fo+`$`),mo=[`material`,`materials`,`bones`,`map`],ho=class{constructor(e,t,n){let r=n||go.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},go=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(ao,``)}static parseTrackName(e){let t=po.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);mo.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};go.Composite=ho,go.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},go.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},go.prototype.GetterByBindingType=[go.prototype._getValue_direct,go.prototype._getValue_array,go.prototype._getValue_arrayElement,go.prototype._getValue_toArray],go.prototype.SetterByBindingTypeAndVersioning=[[go.prototype._setValue_direct,go.prototype._setValue_direct_setNeedsUpdate,go.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[go.prototype._setValue_array,go.prototype._setValue_array_setNeedsUpdate,go.prototype._setValue_array_setMatrixWorldNeedsUpdate],[go.prototype._setValue_arrayElement,go.prototype._setValue_arrayElement_setNeedsUpdate,go.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[go.prototype._setValue_fromArray,go.prototype._setValue_fromArray_setNeedsUpdate,go.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var _o=new Mn,vo=class{constructor(e,t,n=0,r=1/0){this.ray=new jn(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Un,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error(`THREE.Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return _o.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(_o),this}intersectObject(e,t=!0,n=[]){return bo(e,this,n,t),n.sort(yo),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)bo(e[r],this,n,t);return n.sort(yo),n}};function yo(e,t){return e.distance-t.distance}function bo(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)bo(r[e],t,n,!0)}}function xo(e,t,n,r){let i=So(r);switch(n){case be:return e*t;case Se:return e*t/i.components*i.byteLength;case Ce:return e*t/i.components*i.byteLength;case we:return e*t*2/i.components*i.byteLength;case Te:return e*t*2/i.components*i.byteLength;case P:return e*t*3/i.components*i.byteLength;case xe:return e*t*4/i.components*i.byteLength;case Ee:return e*t*4/i.components*i.byteLength;case De:case Oe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ke:case Ae:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Me:case Pe:return Math.max(e,16)*Math.max(t,8)/4;case je:case Ne:return Math.max(e,8)*Math.max(t,8)/2;case Fe:case Ie:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Le:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Re:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ze:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Be:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Ve:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case He:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Ue:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case We:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Ge:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Ke:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case qe:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Je:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Ye:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Xe:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ze:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Qe:case $e:case et:return Math.ceil(e/4)*Math.ceil(t/4)*16;case tt:case nt:return Math.ceil(e/4)*Math.ceil(t/4)*8;case rt:case it:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function So(e){switch(e){case ce:case le:return{byteLength:1,components:1};case de:case ue:case he:return{byteLength:2,components:1};case ge:case _e:return{byteLength:2,components:4};case pe:case fe:case me:return{byteLength:4,components:1};case ve:case ye:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`180`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`180`);function Co(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function wo(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var W={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},G={common:{diffuse:{value:new H(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new B},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new B}},envmap:{envMap:{value:null},envMapRotation:{value:new B},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new B}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new B}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new B},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new B},normalScale:{value:new R(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new B},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new B}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new B}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new B}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new H(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new H(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0},uvTransform:{value:new B}},sprite:{diffuse:{value:new H(16777215)},opacity:{value:1},center:{value:new R(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new B},alphaMap:{value:null},alphaMapTransform:{value:new B},alphaTest:{value:0}}},To={basic:{uniforms:ai([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.fog]),vertexShader:W.meshbasic_vert,fragmentShader:W.meshbasic_frag},lambert:{uniforms:ai([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new H(0)}}]),vertexShader:W.meshlambert_vert,fragmentShader:W.meshlambert_frag},phong:{uniforms:ai([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new H(0)},specular:{value:new H(1118481)},shininess:{value:30}}]),vertexShader:W.meshphong_vert,fragmentShader:W.meshphong_frag},standard:{uniforms:ai([G.common,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.roughnessmap,G.metalnessmap,G.fog,G.lights,{emissive:{value:new H(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:W.meshphysical_vert,fragmentShader:W.meshphysical_frag},toon:{uniforms:ai([G.common,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.gradientmap,G.fog,G.lights,{emissive:{value:new H(0)}}]),vertexShader:W.meshtoon_vert,fragmentShader:W.meshtoon_frag},matcap:{uniforms:ai([G.common,G.bumpmap,G.normalmap,G.displacementmap,G.fog,{matcap:{value:null}}]),vertexShader:W.meshmatcap_vert,fragmentShader:W.meshmatcap_frag},points:{uniforms:ai([G.points,G.fog]),vertexShader:W.points_vert,fragmentShader:W.points_frag},dashed:{uniforms:ai([G.common,G.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:W.linedashed_vert,fragmentShader:W.linedashed_frag},depth:{uniforms:ai([G.common,G.displacementmap]),vertexShader:W.depth_vert,fragmentShader:W.depth_frag},normal:{uniforms:ai([G.common,G.bumpmap,G.normalmap,G.displacementmap,{opacity:{value:1}}]),vertexShader:W.meshnormal_vert,fragmentShader:W.meshnormal_frag},sprite:{uniforms:ai([G.sprite,G.fog]),vertexShader:W.sprite_vert,fragmentShader:W.sprite_frag},background:{uniforms:{uvTransform:{value:new B},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:W.background_vert,fragmentShader:W.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new B}},vertexShader:W.backgroundCube_vert,fragmentShader:W.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:W.cube_vert,fragmentShader:W.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:W.equirect_vert,fragmentShader:W.equirect_frag},distanceRGBA:{uniforms:ai([G.common,G.displacementmap,{referencePosition:{value:new z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:W.distanceRGBA_vert,fragmentShader:W.distanceRGBA_frag},shadow:{uniforms:ai([G.lights,G.fog,{color:{value:new H(0)},opacity:{value:1}}]),vertexShader:W.shadow_vert,fragmentShader:W.shadow_frag}};To.physical={uniforms:ai([To.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new B},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new B},clearcoatNormalScale:{value:new R(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new B},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new B},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new B},sheen:{value:0},sheenColor:{value:new H(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new B},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new B},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new B},transmissionSamplerSize:{value:new R},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new B},attenuationDistance:{value:0},attenuationColor:{value:new H(0)},specularColor:{value:new H(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new B},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new B},anisotropyVector:{value:new R},anisotropyMap:{value:null},anisotropyMapTransform:{value:new B}}]),vertexShader:W.meshphysical_vert,fragmentShader:W.meshphysical_frag};var Eo={r:0,b:0,g:0},Do=new Hn,Oo=new Mn;function ko(e,t,n,r,i,a,o){let s=new H(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new ei(new ri(1,1,1),new di({name:`BackgroundCubeMaterial`,uniforms:ii(To.backgroundCube.uniforms),vertexShader:To.backgroundCube.vertexShader,fragmentShader:To.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),Do.copy(n.backgroundRotation),Do.x*=-1,Do.y*=-1,Do.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(Do.y*=-1,Do.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Oo.makeRotationFromEuler(Do)),u.material.toneMapped=V.getTransfer(r.colorSpace)!==gt,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new ei(new Ea(2,2),new di({name:`BackgroundMaterial`,uniforms:ii(To.background.uniforms),vertexShader:To.background.vertexShader,fragmentShader:To.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=V.getTransfer(r.colorSpace)!==gt,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Eo,si(e)),r.buffers.color.setClear(Eo.r,Eo.g,Eo.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function Ao(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function jo(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function Mo(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function No(e){let t=this,n=null,r=0,i=!1,a=!1,o=new zi,s=new B,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function Po(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new xi(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var Fo=4,Io=[.125,.215,.35,.446,.526,.582],Lo=20,Ro=new $a,zo=new H,Bo=null,Vo=0,Ho=0,Uo=!1,Wo=(1+Math.sqrt(5))/2,Go=1/Wo,Ko=[new z(-Wo,Go,0),new z(Wo,Go,0),new z(-Go,0,Wo),new z(Go,0,Wo),new z(0,Wo,-Go),new z(0,Wo,Go),new z(-1,1,-1),new z(1,1,-1),new z(-1,1,1),new z(1,1,1)],qo=new z,Jo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=qo}=i;Bo=this._renderer.getRenderTarget(),Vo=this._renderer.getActiveCubeFace(),Ho=this._renderer.getActiveMipmapLevel(),Uo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=es(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$o(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Bo,Vo,Ho),this._renderer.xr.enabled=Uo,e.scissorTest=!1,Zo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Bo=this._renderer.getRenderTarget(),Vo=this._renderer.getActiveCubeFace(),Ho=this._renderer.getActiveMipmapLevel(),Uo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:ae,minFilter:ae,generateMipmaps:!1,type:he,format:xe,colorSpace:mt,depthBuffer:!1},r=Xo(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Xo(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Yo(r)),this._blurMaterial=Qo(r,e,t)}return r}_compileMaterial(e){let t=new ei(this._lodPlanes[0],e);this._renderer.compile(t,Ro)}_sceneToCubeUV(e,t,n,r,i){let a=new gi(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(zo),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new Dr({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new ei(new ri,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(zo),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Zo(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=es()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$o());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new ei(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Zo(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Ro)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=Ko[(r-t-1)%Ko.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new ei(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):Lo;m>Lo&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Lo}`);let h=[],g=0;for(let e=0;e<Lo;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Zo(t,3*v*(r>_-Fo?r-_+Fo:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,Ro)}};function Yo(e){let t=[],n=[],r=[],i=e,a=e-Fo+1+Io.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-Fo?s=Io[o-e+Fo-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Hr;h.setAttribute(`position`,new jr(f,3)),h.setAttribute(`uv`,new jr(p,2)),h.setAttribute(`faceIndex`,new jr(m,1)),t.push(h),i>Fo&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function Xo(e,t,n){let r=new tn(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Zo(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Qo(e,t,n){let r=new Float32Array(Lo),i=new z(0,1,0);return new di({name:`SphericalGaussianBlur`,defines:{n:Lo,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ts(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function $o(){return new di({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:ts(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function es(){return new di({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ts(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ts(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function ns(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new Jo(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new Jo(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function rs(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Rt(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function is(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(Pt(n)?Nr:Mr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function as(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function os(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function ss(e,t,n){let r=new WeakMap,i=new $t;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new nn(h,p,m,u);g.type=me,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new R(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function cs(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var ls=new Qt,us=new Gi(1,1),ds=new nn,fs=new rn,ps=new bi,ms=[],hs=[],gs=new Float32Array(16),_s=new Float32Array(9),vs=new Float32Array(4);function ys(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=ms[i];if(a===void 0&&(a=new Float32Array(i),ms[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function bs(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function xs(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Ss(e,t){let n=hs[t];n===void 0&&(n=new Int32Array(t),hs[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Cs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function ws(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(bs(n,t))return;e.uniform2fv(this.addr,t),xs(n,t)}}function Ts(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(bs(n,t))return;e.uniform3fv(this.addr,t),xs(n,t)}}function Es(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(bs(n,t))return;e.uniform4fv(this.addr,t),xs(n,t)}}function Ds(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(bs(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),xs(n,t)}else{if(bs(n,r))return;vs.set(r),e.uniformMatrix2fv(this.addr,!1,vs),xs(n,r)}}function Os(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(bs(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),xs(n,t)}else{if(bs(n,r))return;_s.set(r),e.uniformMatrix3fv(this.addr,!1,_s),xs(n,r)}}function ks(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(bs(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),xs(n,t)}else{if(bs(n,r))return;gs.set(r),e.uniformMatrix4fv(this.addr,!1,gs),xs(n,r)}}function As(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function js(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(bs(n,t))return;e.uniform2iv(this.addr,t),xs(n,t)}}function Ms(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(bs(n,t))return;e.uniform3iv(this.addr,t),xs(n,t)}}function Ns(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(bs(n,t))return;e.uniform4iv(this.addr,t),xs(n,t)}}function Ps(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Fs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(bs(n,t))return;e.uniform2uiv(this.addr,t),xs(n,t)}}function Is(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(bs(n,t))return;e.uniform3uiv(this.addr,t),xs(n,t)}}function Ls(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(bs(n,t))return;e.uniform4uiv(this.addr,t),xs(n,t)}}function Rs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(us.compareFunction=515,a=us):a=ls,n.setTexture2D(t||a,i)}function zs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||fs,i)}function Bs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||ps,i)}function Vs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||ds,i)}function Hs(e){switch(e){case 5126:return Cs;case 35664:return ws;case 35665:return Ts;case 35666:return Es;case 35674:return Ds;case 35675:return Os;case 35676:return ks;case 5124:case 35670:return As;case 35667:case 35671:return js;case 35668:case 35672:return Ms;case 35669:case 35673:return Ns;case 5125:return Ps;case 36294:return Fs;case 36295:return Is;case 36296:return Ls;case 35678:case 36198:case 36298:case 36306:case 35682:return Rs;case 35679:case 36299:case 36307:return zs;case 35680:case 36300:case 36308:case 36293:return Bs;case 36289:case 36303:case 36311:case 36292:return Vs}}function Us(e,t){e.uniform1fv(this.addr,t)}function Ws(e,t){let n=ys(t,this.size,2);e.uniform2fv(this.addr,n)}function Gs(e,t){let n=ys(t,this.size,3);e.uniform3fv(this.addr,n)}function Ks(e,t){let n=ys(t,this.size,4);e.uniform4fv(this.addr,n)}function qs(e,t){let n=ys(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Js(e,t){let n=ys(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Ys(e,t){let n=ys(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Xs(e,t){e.uniform1iv(this.addr,t)}function Zs(e,t){e.uniform2iv(this.addr,t)}function Qs(e,t){e.uniform3iv(this.addr,t)}function $s(e,t){e.uniform4iv(this.addr,t)}function ec(e,t){e.uniform1uiv(this.addr,t)}function tc(e,t){e.uniform2uiv(this.addr,t)}function nc(e,t){e.uniform3uiv(this.addr,t)}function rc(e,t){e.uniform4uiv(this.addr,t)}function ic(e,t,n){let r=this.cache,i=t.length,a=Ss(n,i);bs(r,a)||(e.uniform1iv(this.addr,a),xs(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||ls,a[e])}function ac(e,t,n){let r=this.cache,i=t.length,a=Ss(n,i);bs(r,a)||(e.uniform1iv(this.addr,a),xs(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||fs,a[e])}function oc(e,t,n){let r=this.cache,i=t.length,a=Ss(n,i);bs(r,a)||(e.uniform1iv(this.addr,a),xs(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||ps,a[e])}function sc(e,t,n){let r=this.cache,i=t.length,a=Ss(n,i);bs(r,a)||(e.uniform1iv(this.addr,a),xs(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||ds,a[e])}function cc(e){switch(e){case 5126:return Us;case 35664:return Ws;case 35665:return Gs;case 35666:return Ks;case 35674:return qs;case 35675:return Js;case 35676:return Ys;case 5124:case 35670:return Xs;case 35667:case 35671:return Zs;case 35668:case 35672:return Qs;case 35669:case 35673:return $s;case 5125:return ec;case 36294:return tc;case 36295:return nc;case 36296:return rc;case 35678:case 36198:case 36298:case 36306:case 35682:return ic;case 35679:case 36299:case 36307:return ac;case 35680:case 36300:case 36308:case 36293:return oc;case 36289:case 36303:case 36311:case 36292:return sc}}var lc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Hs(t.type)}},uc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=cc(t.type)}},dc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},fc=/(\w+)(\])?(\[|\.)?/g;function pc(e,t){e.seq.push(t),e.map[t.id]=t}function mc(e,t,n){let r=e.name,i=r.length;for(fc.lastIndex=0;;){let a=fc.exec(r),o=fc.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){pc(n,l===void 0?new lc(s,e,t):new uc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new dc(s),pc(n,e)),n=e}}}var hc=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);mc(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function gc(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var _c=37297,vc=0;function yc(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var bc=new B;function xc(e){V._getMatrix(bc,V.workingColorSpace,e);let t=`mat3( ${bc.elements.map(e=>e.toFixed(4))} )`;switch(V.getTransfer(e)){case ht:return[t,`LinearTransferOETF`];case gt:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Sc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+yc(e.getShaderSource(t),r)}return i}function Cc(e,t){let n=xc(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function wc(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Tc=new z;function Ec(){return V.getLuminanceCoefficients(Tc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Tc.x.toFixed(4)}, ${Tc.y.toFixed(4)}, ${Tc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Dc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Ac).join(`
`)}function Oc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function kc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Ac(e){return e!==``}function jc(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Mc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Nc=/^[ \t]*#include +<([\w\d./]+)>/gm;function Pc(e){return e.replace(Nc,Ic)}var Fc=new Map;function Ic(e,t){let n=W[t];if(n===void 0){let e=Fc.get(t);if(e!==void 0)n=W[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return Pc(n)}var Lc=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rc(e){return e.replace(Lc,zc)}function zc(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Bc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function Vc(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function Hc(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function Uc(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function Wc(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function Gc(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Kc(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Vc(n),l=Hc(n),u=Uc(n),d=Wc(n),f=Gc(n),p=Dc(n),m=Oc(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Ac).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Ac).join(`
`),_.length>0&&(_+=`
`)):(g=[Bc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Ac).join(`
`),_=[Bc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:W.tonemapping_pars_fragment,n.toneMapping===0?``:wc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,W.colorspace_pars_fragment,Cc(`linearToOutputTexel`,n.outputColorSpace),Ec(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Ac).join(`
`)),o=Pc(o),o=jc(o,n),o=Mc(o,n),s=Pc(s),s=jc(s,n),s=Mc(s,n),o=Rc(o),s=Rc(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=gc(i,i.VERTEX_SHADER,y),S=gc(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Sc(i,x,`vertex`),n=Sc(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new hc(i,h),T=kc(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,_c)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=vc++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var qc=0,Jc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Yc(e),t.set(e,n)),n}},Yc=class{constructor(e){this.id=qc++,this.code=e,this.usedTimes=0}};function Xc(e,t,n,r,i,a,o){let s=new Un,c=new Jc,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=To[C];D=e.vertexShader,O=e.fragmentShader}else D=a.vertexShader,O=a.fragmentShader,c.update(a),k=c.getVertexShaderID(a),A=c.getFragmentShaderID(a);let ee=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),j=_.isInstancedMesh===!0,ne=_.isBatchedMesh===!0,M=!!a.map,re=!!a.matcap,ie=!!x,ae=!!a.aoMap,oe=!!a.lightMap,se=!!a.bumpMap,ce=!!a.normalMap,le=!!a.displacementMap,ue=!!a.emissiveMap,de=!!a.metalnessMap,fe=!!a.roughnessMap,pe=a.anisotropy>0,me=a.clearcoat>0,he=a.dispersion>0,ge=a.iridescence>0,_e=a.sheen>0,N=a.transmission>0,ve=pe&&!!a.anisotropyMap,ye=me&&!!a.clearcoatMap,be=me&&!!a.clearcoatNormalMap,P=me&&!!a.clearcoatRoughnessMap,xe=ge&&!!a.iridescenceMap,F=ge&&!!a.iridescenceThicknessMap,I=_e&&!!a.sheenColorMap,Se=_e&&!!a.sheenRoughnessMap,Ce=!!a.specularMap,we=!!a.specularColorMap,Te=!!a.specularIntensityMap,Ee=N&&!!a.transmissionMap,De=N&&!!a.thicknessMap,Oe=!!a.gradientMap,ke=!!a.alphaMap,Ae=a.alphaTest>0,je=!!a.alphaHash,Me=!!a.extensions,Ne=0;a.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ne=e.toneMapping);let Pe={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:O,defines:a.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:ne,batchingColor:ne&&_._colorsTexture!==null,instancing:j,instancingColor:j&&_.instanceColor!==null,instancingMorph:j&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ee===null?e.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:mt,alphaToCoverage:!!a.alphaToCoverage,map:M,matcap:re,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:f&&le,emissiveMap:ue,normalMapObjectSpace:ce&&a.normalMapType===1,normalMapTangentSpace:ce&&a.normalMapType===0,metalnessMap:de,roughnessMap:fe,anisotropy:pe,anisotropyMap:ve,clearcoat:me,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:P,dispersion:he,iridescence:ge,iridescenceMap:xe,iridescenceThicknessMap:F,sheen:_e,sheenColorMap:I,sheenRoughnessMap:Se,specularMap:Ce,specularColorMap:we,specularIntensityMap:Te,transmission:N,transmissionMap:Ee,thicknessMap:De,gradientMap:Oe,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:ke,alphaTest:Ae,alphaHash:je,combine:a.combine,mapUv:M&&h(a.map.channel),aoMapUv:ae&&h(a.aoMap.channel),lightMapUv:oe&&h(a.lightMap.channel),bumpMapUv:se&&h(a.bumpMap.channel),normalMapUv:ce&&h(a.normalMap.channel),displacementMapUv:le&&h(a.displacementMap.channel),emissiveMapUv:ue&&h(a.emissiveMap.channel),metalnessMapUv:de&&h(a.metalnessMap.channel),roughnessMapUv:fe&&h(a.roughnessMap.channel),anisotropyMapUv:ve&&h(a.anisotropyMap.channel),clearcoatMapUv:ye&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:be&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:P&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:F&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:I&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:Se&&h(a.sheenRoughnessMap.channel),specularMapUv:Ce&&h(a.specularMap.channel),specularColorMapUv:we&&h(a.specularColorMap.channel),specularIntensityMapUv:Te&&h(a.specularIntensityMap.channel),transmissionMapUv:Ee&&h(a.transmissionMap.channel),thicknessMapUv:De&&h(a.thicknessMap.channel),alphaMapUv:ke&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(ce||pe),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(M||ke),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ne,decodeVideoTexture:M&&a.map.isVideoTexture===!0&&V.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&a.emissiveMap.isVideoTexture===!0&&V.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Me&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Me&&a.extensions.multiDraw===!0||ne)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Pe.vertexUv1s=l.has(1),Pe.vertexUv2s=l.has(2),Pe.vertexUv3s=l.has(3),l.clear(),Pe}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=To[t];n=ci.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new Kc(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Zc(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Qc(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function $c(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function el(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Qc),r.length>1&&r.sort(t||$c),i.length>1&&i.sort(t||$c)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function tl(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new el,e.set(t,[i])):n>=r.length?(i=new el,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function nl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new z,color:new H};break;case`SpotLight`:n={position:new z,direction:new z,color:new H,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new z,color:new H,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new z,skyColor:new H,groundColor:new H};break;case`RectAreaLight`:n={color:new H,position:new z,halfWidth:new z,halfHeight:new z}}return e[t.id]=n,n}}}function rl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var il=0;function al(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function ol(e){let t=new nl,n=rl(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new z);let i=new z,a=new Mn,o=new Mn;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(al);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=G.LTC_FLOAT_1,r.rectAreaLTC2=G.LTC_FLOAT_2):(r.rectAreaLTC1=G.LTC_HALF_1,r.rectAreaLTC2=G.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=il++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function sl(e){let t=new ol(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function cl(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new sl(e),t.set(n,[a])):r>=i.length?(a=new sl(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var ll=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ul=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function dl(e,t,n){let r=new Ui,i=new R,a=new R,o=new $t,s=new Ma({depthPacking:ft}),c=new Na,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new di({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new R},radius:{value:4}},vertexShader:ll,fragmentShader:ul}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Hr;m.setAttribute(`position`,new jr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new ei(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:M,magFilter:M};d.map!==null&&d.map.dispose(),d.map=new tn(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new tn(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var fl={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function pl(e,t){function n(){let t=!1,n=new $t,r=null,i=new $t(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ue(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=fl[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ue(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new H(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,j=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),te=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(ne)[1]),te=j>=1);let M=null,re={},ie=e.getParameter(e.SCISSOR_BOX),ae=e.getParameter(e.VIEWPORT),oe=new $t().fromArray(ie),se=new $t().fromArray(ae);function ce(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let le={};le[e.TEXTURE_2D]=ce(e.TEXTURE_2D,e.TEXTURE_2D,1),le[e.TEXTURE_CUBE_MAP]=ce(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[e.TEXTURE_2D_ARRAY]=ce(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),le[e.TEXTURE_3D]=ce(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ue(e.DEPTH_TEST),o.setFunc(3),ve(!1),ye(1),ue(e.CULL_FACE),_e(0);function ue(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return m!==t&&(e.useProgram(t),m=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(de(e.BLEND),h=!1);return}if(h===!1&&(ue(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(he[n],he[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function N(t,n){t.side===2?de(e.CULL_FACE):ue(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ve(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),P(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ue(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ve(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function ye(t){t===0?de(e.CULL_FACE):(ue(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function be(t){t!==O&&(te&&e.lineWidth(t),O=t)}function P(t,n,r){t?(ue(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):de(e.POLYGON_OFFSET_FILL)}function xe(t){t?ue(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function F(t){t===void 0&&(t=e.TEXTURE0+ee-1),M!==t&&(e.activeTexture(t),M=t)}function I(t,n,r){r===void 0&&(r=M===null?e.TEXTURE0+ee-1:M);let i=re[r];i===void 0&&(i={type:void 0,texture:void 0},re[r]=i),(i.type!==t||i.texture!==n)&&(M!==r&&(e.activeTexture(r),M=r),e.bindTexture(t,n||le[t]),i.type=t,i.texture=n)}function Se(){let t=re[M];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ce(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Me(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ne(t){oe.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),oe.copy(t))}function Pe(t){se.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),se.copy(t))}function Fe(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Ie(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Le(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},M=null,re={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new H(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,oe.set(0,0,e.canvas.width,e.canvas.height),se.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ue,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:N,setFlipSided:ve,setCullFace:ye,setLineWidth:be,setPolygonOffset:P,setScissorTest:xe,activeTexture:F,bindTexture:I,unbindTexture:Se,compressedTexImage2D:Ce,compressedTexImage3D:we,texImage2D:je,texImage3D:Me,updateUBOMapping:Fe,uniformBlockBinding:Ie,texStorage2D:ke,texStorage3D:Ae,texSubImage2D:Te,texSubImage3D:Ee,compressedTexSubImage2D:De,compressedTexSubImage3D:Oe,scissor:Ne,viewport:Pe,reset:Le}}function ml(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new R,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):Ft(`canvas`)}function h(e,t,n){let r=1,i=je(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps}function _(t){e.generateMipmap(t)}function v(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?ht:V.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function b(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function x(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),w(t),t.isVideoTexture&&u.delete(t)}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),E(t)}function w(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&T(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function T(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function E(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function O(){D=0}function k(){let e=D;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function A(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ee(t,i){let a=r.get(t);if(t.isVideoTexture&&ke(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{N(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ce(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){N(a,t,i);return}n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function le(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){N(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ue(t,i){let a=r.get(t);if(t.version>0&&a.__version!==t.version){ve(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let de={[te]:e.REPEAT,[j]:e.CLAMP_TO_EDGE,[ne]:e.MIRRORED_REPEAT},fe={[M]:e.NEAREST,[re]:e.NEAREST_MIPMAP_NEAREST,[ie]:e.NEAREST_MIPMAP_LINEAR,[ae]:e.LINEAR,[oe]:e.LINEAR_MIPMAP_NEAREST,[se]:e.LINEAR_MIPMAP_LINEAR},pe={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function me(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,de[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,de[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,de[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,fe[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,fe[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,pe[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function he(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,S));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=A(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&T(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ge(e,t,n){return Math.floor(Math.floor(e/n)/t)}function _e(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ge(n.start,r.width,4),c=ge(t.start,r.width,4);n.start<=i+1&&a===c&&ge(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function N(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=he(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=V.getPrimaries(V.workingColorSpace),r=o.colorSpace===``?null:V.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=Ae(o,p);let m=a.convert(o.format,o.colorSpace),v=a.convert(o.type),S=y(o.internalFormat,m,v,o.colorSpace,o.isVideoTexture);me(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=x(o,p);if(o.isDepthTexture)S=b(o.format===I,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height),D&&_e(o,p,m,v)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=xo(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,v,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,v,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data):m===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=xo(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,v,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,v,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,v,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=je(w[0]);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,v,C):n.texImage2D(e.TEXTURE_2D,t,S,m,v,C);o.generateMipmaps=!1}else if(T){if(E){let t=je(p);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,v,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,v,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ve(t,o,s){if(o.image.length!==6)return;let c=he(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=V.getPrimaries(V.workingColorSpace),r=o.colorSpace===``?null:V.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=Ae(o,m[e]);let v=m[0],b=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=y(o.internalFormat,b,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=x(o,v);me(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,v.width,v.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,b,S,i.data):b===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=je(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,b,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,b,S,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,b,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,b,S,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,b,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ye(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=y(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Oe(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,De(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function be(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=b(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=De(n);Oe(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=y(o.internalFormat,c,l,o.colorSpace),d=De(n);r&&Oe(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):Oe(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function P(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),ee(i.depthTexture,0);let o=a.__webglTexture,c=De(i);if(i.depthTexture.format===1026)Oe(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)Oe(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function xe(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?P(i.__webglFramebuffer[0],t):P(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),be(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),be(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function F(t,n,i){let a=r.get(t);n!==void 0&&ye(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&xe(t)}function Se(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,C);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&Oe(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=y(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=De(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),be(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),me(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)ye(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else ye(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),me(c,a),ye(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),g(a)&&_(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),me(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)ye(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else ye(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&xe(t)}function Ce(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=v(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),_(t),n.unbindTexture()}}}let we=[],Te=[];function Ee(t){if(t.samples>0){if(Oe(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(we.length=0,Te.length=0,we.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(we.push(l),Te.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Te)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,we))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function De(e){return Math.min(i.maxSamples,e.samples)}function Oe(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function ke(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function Ae(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(V.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function je(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=O,this.setTexture2D=ee,this.setTexture2DArray=ce,this.setTexture3D=le,this.setTextureCube=ue,this.rebindTextures=F,this.setupRenderTarget=Se,this.updateRenderTargetMipmap=Ce,this.updateMultisampleRenderTarget=Ee,this.setupDepthRenderbuffer=xe,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=Oe}function hl(e,t){function n(n,r=``){let i,a=V.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var gl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,_l=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,vl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ki(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new di({vertexShader:gl,fragmentShader:_l,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ei(new Ea(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},yl=class extends xt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new vl,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new R,C=null,w=new gi;w.viewport=new $t;let T=new gi;T.viewport=new $t;let E=[w,T],D=new ro,O=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Ci,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Ci,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Ci,b[e]=t),t.getHandSpace()};function A(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,A),r.removeEventListener(`selectstart`,A),r.removeEventListener(`selectend`,A),r.removeEventListener(`squeeze`,A),r.removeEventListener(`squeezestart`,A),r.removeEventListener(`squeezeend`,A),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,te);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}O=null,k=null,h.reset();for(let e in g)delete g[e];e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,se.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,A),r.addEventListener(`selectstart`,A),r.addEventListener(`selectend`,A),r.addEventListener(`squeeze`,A),r.addEventListener(`squeezestart`,A),r.addEventListener(`squeezeend`,A),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,te),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?I:F,a=_.stencil?N:pe);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new tn(d.textureWidth,d.textureHeight,{format:xe,type:ce,depthTexture:new Gi(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new tn(f.framebufferWidth,f.framebufferHeight,{format:xe,type:ce,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),se.setContext(r),se.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function te(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let j=new z,ne=new z;function M(e,t,n){j.setFromMatrixPosition(t.matrixWorld),ne.setFromMatrixPosition(n.matrixWorld);let r=j.distanceTo(ne),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function re(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),D.near=T.near=w.near=t,D.far=T.far=w.far=n,(O!==D.near||k!==D.far)&&(r.updateRenderState({depthNear:D.near,depthFar:D.far}),O=D.near,k=D.far),D.layers.mask=e.layers.mask|6,w.layers.mask=D.layers.mask&3,T.layers.mask=D.layers.mask&5;let i=e.parent,a=D.cameras;re(D,i);for(let e=0;e<a.length;e++)re(a[e],i);a.length===2?M(D,w,T):D.projectionMatrix.copy(w.projectionMatrix),ie(e,D,i)};function ie(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=wt*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(D)},this.getCameraTexture=function(e){return g[e]};let ae=null;function oe(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==D.cameras.length&&(D.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=E[n];o===void 0&&(o=new gi,o.layers.enable(n),o.viewport=new $t,E[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(D.matrix.copy(o.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),i===!0&&D.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new Ki,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}ae&&ae(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let se=new Co;se.setAnimationLoop(oe),this.setAnimationLoop=function(e){ae=e},this.dispose=function(){}}},bl=new Hn,xl=new Mn;function Sl(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,si(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,bl.copy(o),bl.x*=-1,bl.y*=-1,bl.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(bl.y*=-1,bl.z*=-1),e.envMapRotation.value.setFromMatrix4(xl.makeRotationFromEuler(bl)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Cl(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var wl=class{constructor(e={}){let{canvas:t=It(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Uint32Array(4),m=new Int32Array(4),h=null,g=null,_=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,b=!1;this._outputColorSpace=pt;let x=0,S=0,C=null,w=-1,T=null,E=new $t,D=new $t,O=null,k=new H(0),A=0,ee=t.width,te=t.height,j=1,ne=null,M=null,re=new $t(0,0,ee,te),ie=new $t(0,0,ee,te),ae=!1,oe=new Ui,le=!1,ue=!1,de=new Mn,fe=new z,pe=new $t,me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ge=!1;function _e(){return C===null?j:1}let N=n;function ve(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,He,!1),t.addEventListener(`webglcontextrestored`,Ue,!1),t.addEventListener(`webglcontextcreationerror`,We,!1),N===null){let t=`webgl2`;if(N=ve(t,e),N===null)throw ve(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let ye,be,P,xe,F,I,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze;function Be(){ye=new rs(N),ye.init(),Le=new hl(N,ye),be=new Mo(N,ye,e,Le),P=new pl(N,ye),be.reversedDepthBuffer&&d&&P.buffers.depth.setReversed(!0),xe=new os(N),F=new Zc,I=new ml(N,ye,P,F,be,Le,xe),Se=new Po(y),Ce=new ns(y),we=new wo(N),Re=new Ao(N,we),Te=new is(N,we,xe,Re),Ee=new cs(N,Te,we,xe),Pe=new ss(N,be,I),je=new No(F),De=new Xc(y,Se,Ce,ye,be,Re,je),Oe=new Sl(y,F),ke=new tl,Ae=new cl(ye),Ne=new ko(y,Se,Ce,P,Ee,f,s),Me=new dl(y,Ee,be),ze=new Cl(N,xe,be,P),Fe=new jo(N,ye,xe),Ie=new as(N,ye,xe),xe.programs=De.programs,y.capabilities=be,y.extensions=ye,y.properties=F,y.renderLists=ke,y.shadowMap=Me,y.state=P,y.info=xe}Be();let Ve=new yl(y,N);this.xr=Ve,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let e=ye.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=ye.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(e){e!==void 0&&(j=e,this.setSize(ee,te,!1))},this.getSize=function(e){return e.set(ee,te)},this.setSize=function(e,n,r=!0){if(Ve.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}ee=e,te=n,t.width=Math.floor(e*j),t.height=Math.floor(n*j),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ee*j,te*j).floor()},this.setDrawingBufferSize=function(e,n,r){ee=e,te=n,j=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(E)},this.getViewport=function(e){return e.copy(re)},this.setViewport=function(e,t,n,r){e.isVector4?re.set(e.x,e.y,e.z,e.w):re.set(e,t,n,r),P.viewport(E.copy(re).multiplyScalar(j).round())},this.getScissor=function(e){return e.copy(ie)},this.setScissor=function(e,t,n,r){e.isVector4?ie.set(e.x,e.y,e.z,e.w):ie.set(e,t,n,r),P.scissor(D.copy(ie).multiplyScalar(j).round())},this.getScissorTest=function(){return ae},this.setScissorTest=function(e){P.setScissorTest(ae=e)},this.setOpaqueSort=function(e){ne=e},this.setTransparentSort=function(e){M=e},this.getClearColor=function(e){return e.copy(Ne.getClearColor())},this.setClearColor=function(){Ne.setClearColor(...arguments)},this.getClearAlpha=function(){return Ne.getClearAlpha()},this.setClearAlpha=function(){Ne.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(C!==null){let t=C.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=C.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Ne.getClearColor(),r=Ne.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(p[0]=i,p[1]=a,p[2]=o,p[3]=r,N.clearBufferuiv(N.COLOR,0,p)):(m[0]=i,m[1]=a,m[2]=o,m[3]=r,N.clearBufferiv(N.COLOR,0,m))}else r|=N.COLOR_BUFFER_BIT}t&&(r|=N.DEPTH_BUFFER_BIT),n&&(r|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,He,!1),t.removeEventListener(`webglcontextrestored`,Ue,!1),t.removeEventListener(`webglcontextcreationerror`,We,!1),Ne.dispose(),ke.dispose(),Ae.dispose(),F.dispose(),Se.dispose(),Ce.dispose(),Ee.dispose(),Re.dispose(),ze.dispose(),De.dispose(),Ve.dispose(),Ve.removeEventListener(`sessionstart`,Ze),Ve.removeEventListener(`sessionend`,Qe),$e.stop()};function He(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),b=!0}function Ue(){console.log(`THREE.WebGLRenderer: Context Restored.`),b=!1;let e=xe.autoReset,t=Me.enabled,n=Me.autoUpdate,r=Me.needsUpdate,i=Me.type;Be(),xe.autoReset=e,Me.enabled=t,Me.autoUpdate=n,Me.needsUpdate=r,Me.type=i}function We(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ge(e){let t=e.target;t.removeEventListener(`dispose`,Ge),Ke(t)}function Ke(e){qe(e),F.remove(e)}function qe(e){let t=F.get(e).programs;t!==void 0&&(t.forEach(function(e){De.releaseProgram(e)}),e.isShaderMaterial&&De.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=me);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=ct(e,t,n,r,i);P.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Te.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Re.setup(i,r,s,n,c);let h,g=Fe;if(c!==null&&(h=we.get(c),g=Ie,g.setIndex(h)),i.isMesh)r.wireframe===!0?(P.setLineWidth(r.wireframeLinewidth*_e()),g.setMode(N.LINES)):g.setMode(N.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),P.setLineWidth(e*_e()),i.isLineSegments?g.setMode(N.LINES):i.isLineLoop?g.setMode(N.LINE_LOOP):g.setMode(N.LINE_STRIP)}else i.isPoints?g.setMode(N.POINTS):i.isSprite&&g.setMode(N.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)Rt(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(ye.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?we.get(c).bytesPerElement:1,o=F.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(N,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Je(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,at(e,t,n),e.side=0,e.needsUpdate=!0,at(e,t,n),e.side=2):at(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),g=Ae.get(n),g.init(t),v.push(g),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),g.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Je(a,n,e),r.add(a)}else Je(t,n,e),r.add(t)}}),g=v.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){F.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}ye.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Ye=null;function Xe(e){Ye&&Ye(e)}function Ze(){$e.stop()}function Qe(){$e.start()}let $e=new Co;$e.setAnimationLoop(Xe),typeof self<`u`&&$e.setContext(self),this.setAnimationLoop=function(e){Ye=e,Ve.setAnimationLoop(e),e===null?$e.stop():$e.start()},Ve.addEventListener(`sessionstart`,Ze),Ve.addEventListener(`sessionend`,Qe),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(b===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ve.enabled===!0&&Ve.isPresenting===!0&&(Ve.cameraAutoUpdate===!0&&Ve.updateCamera(t),t=Ve.getCamera()),e.isScene===!0&&e.onBeforeRender(y,e,t,C),g=Ae.get(e,v.length),g.init(t),v.push(g),de.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),oe.setFromProjectionMatrix(de,bt,t.reversedDepth),ue=this.localClippingEnabled,le=je.init(this.clippingPlanes,ue),h=ke.get(e,_.length),h.init(),_.push(h),Ve.enabled===!0&&Ve.isPresenting===!0){let e=y.xr.getDepthSensingMesh();e!==null&&et(e,t,-1/0,y.sortObjects)}et(e,t,0,y.sortObjects),h.finish(),y.sortObjects===!0&&h.sort(ne,M),ge=Ve.enabled===!1||Ve.isPresenting===!1||Ve.hasDepthSensing()===!1,ge&&Ne.addToRenderList(h,e),this.info.render.frame++,le===!0&&je.beginShadows();let n=g.state.shadowsArray;Me.render(n,e,t),le===!0&&je.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=h.opaque,i=h.transmissive;if(g.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];nt(r,i,e,a)}ge&&Ne.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];tt(h,e,r,r.viewport)}}else i.length>0&&nt(r,i,e,t),ge&&Ne.render(e),tt(h,e,t);C!==null&&S===0&&(I.updateMultisampleRenderTarget(C),I.updateRenderTargetMipmap(C)),e.isScene===!0&&e.onAfterRender(y,e,t),Re.resetDefaultState(),w=-1,T=null,v.pop(),v.length>0?(g=v[v.length-1],le===!0&&je.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,_.pop(),h=_.length>0?_[_.length-1]:null};function et(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)g.pushLight(e),e.castShadow&&g.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||oe.intersectsSprite(e)){r&&pe.setFromMatrixPosition(e.matrixWorld).applyMatrix4(de);let t=Ee.update(e),i=e.material;i.visible&&h.push(e,t,i,n,pe.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||oe.intersectsObject(e))){let t=Ee.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),pe.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),pe.copy(e.boundingSphere.center)),pe.applyMatrix4(e.matrixWorld).applyMatrix4(de)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&h.push(e,t,s,n,pe.z,o)}}else i.visible&&h.push(e,t,i,n,pe.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)et(i[e],t,n,r)}function tt(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;g.setupLightsView(n),le===!0&&je.setGlobalState(y.clippingPlanes,n),r&&P.viewport(E.copy(r)),i.length>0&&rt(i,t,n),a.length>0&&rt(a,t,n),o.length>0&&rt(o,t,n),P.buffers.depth.setTest(!0),P.buffers.depth.setMask(!0),P.buffers.color.setMask(!0),P.setPolygonOffset(!1)}function nt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[r.id]===void 0&&(g.state.transmissionRenderTarget[r.id]=new tn(1,1,{generateMipmaps:!0,type:ye.has(`EXT_color_buffer_half_float`)||ye.has(`EXT_color_buffer_float`)?he:ce,minFilter:se,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:V.workingColorSpace}));let a=g.state.transmissionRenderTarget[r.id],o=r.viewport||E;a.setSize(o.z*y.transmissionResolutionScale,o.w*y.transmissionResolutionScale);let s=y.getRenderTarget(),c=y.getActiveCubeFace(),l=y.getActiveMipmapLevel();y.setRenderTarget(a),y.getClearColor(k),A=y.getClearAlpha(),A<1&&y.setClearColor(16777215,.5),y.clear(),ge&&Ne.render(n);let u=y.toneMapping;y.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),g.setupLightsView(r),le===!0&&je.setGlobalState(y.clippingPlanes,r),rt(e,n,r),I.updateMultisampleRenderTarget(a),I.updateRenderTargetMipmap(a),ye.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,it(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(I.updateMultisampleRenderTarget(a),I.updateRenderTargetMipmap(a))}y.setRenderTarget(s,c,l),y.setClearColor(k,A),d!==void 0&&(r.viewport=d),y.toneMapping=u}function rt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&it(o,t,n,s,l,c)}}function it(e,t,n,r,i,a){e.onBeforeRender(y,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(y,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=2):y.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(y,t,n,r,i,a)}function at(e,t,n){t.isScene!==!0&&(t=me);let r=F.get(e),i=g.state.lights,a=g.state.shadowsArray,o=i.state.version,s=De.getParameters(e,i.state,a,t,n),c=De.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?Ce:Se).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ge),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return st(e,s),u}else s.uniforms=De.getUniforms(e),e.onBeforeCompile(s,y),u=De.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=je.uniform),st(e,s),r.needsLights=ut(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function ot(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=hc.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function st(e,t){let n=F.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ct(e,t,n,r,i){t.isScene!==!0&&(t=me),I.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=C===null?y.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:mt,c=(r.isMeshStandardMaterial?Ce:Se).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(m=y.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=h===void 0?0:h.length,v=F.get(r),b=g.state.lights;if(le===!0&&(ue===!0||e!==T)){let t=e===T&&r.id===w;je.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==je.numPlanes||v.numIntersection!==je.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=at(r,t,i));let E=!1,D=!1,O=!1,k=S.getUniforms(),A=v.uniforms;if(P.useProgram(S.program)&&(E=!0,D=!0,O=!0),r.id!==w&&(w=r.id,D=!0),E||T!==e){P.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),k.setValue(N,`projectionMatrix`,e.projectionMatrix),k.setValue(N,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(N,fe.setFromMatrixPosition(e.matrixWorld)),be.logarithmicDepthBuffer&&k.setValue(N,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(N,`isOrthographic`,e.isOrthographicCamera===!0),T!==e&&(T=e,D=!0,O=!0)}if(i.isSkinnedMesh){k.setOptional(N,i,`bindMatrix`),k.setOptional(N,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(N,`boneTexture`,e.boneTexture,I))}i.isBatchedMesh&&(k.setOptional(N,i,`batchingTexture`),k.setValue(N,`batchingTexture`,i._matricesTexture,I),k.setOptional(N,i,`batchingIdTexture`),k.setValue(N,`batchingIdTexture`,i._indirectTexture,I),k.setOptional(N,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(N,`batchingColorTexture`,i._colorsTexture,I));let ee=n.morphAttributes;if((ee.position!==void 0||ee.normal!==void 0||ee.color!==void 0)&&Pe.update(i,n,S),(D||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,k.setValue(N,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),D&&(k.setValue(N,`toneMappingExposure`,y.toneMappingExposure),v.needsLights&&lt(A,O),a&&r.fog===!0&&Oe.refreshFogUniforms(A,a),Oe.refreshMaterialUniforms(A,r,j,te,g.state.transmissionRenderTarget[e.id]),hc.upload(N,ot(v),A,I)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(hc.upload(N,ot(v),A,I),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(N,`center`,i.center),k.setValue(N,`modelViewMatrix`,i.modelViewMatrix),k.setValue(N,`normalMatrix`,i.normalMatrix),k.setValue(N,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];ze.update(n,S),ze.bind(n,S)}}return S}function lt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function ut(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return x},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(e,t,n){let r=F.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),F.get(e.texture).__webglTexture=t,F.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=F.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let dt=N.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){C=e,x=t,S=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=F.get(e);if(s.__useDefaultFramebuffer!==void 0)P.bindFramebuffer(N.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)I.setupRenderTarget(e);else if(s.__hasExternalTextures)I.rebindTextures(e,F.get(e.texture).__webglTexture,F.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&F.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);I.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=F.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&I.useMultisampledRTT(e)===!1?F.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,E.copy(e.viewport),D.copy(e.scissor),O=e.scissorTest}else E.copy(re).multiplyScalar(j).floor(),D.copy(ie).multiplyScalar(j).floor(),O=ae;if(n!==0&&(i=dt),P.bindFramebuffer(N.FRAMEBUFFER,i)&&r&&P.drawBuffers(e,i),P.viewport(E),P.scissor(D),P.setScissorTest(O),a){let r=F.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=F.get(e.textures[t]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=F.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,t.__webglTexture,n)}w=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){P.bindFramebuffer(N.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!be.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!be.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s),N.readPixels(t,n,r,i,Le.convert(c),Le.convert(l),a))}finally{let e=C===null?null:F.get(C).__webglFramebuffer;P.bindFramebuffer(N.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){P.bindFramebuffer(N.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!be.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!be.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,d),N.bufferData(N.PIXEL_PACK_BUFFER,a.byteLength,N.STREAM_READ),e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s),N.readPixels(t,n,r,i,Le.convert(l),Le.convert(u),0);let f=C===null?null:F.get(C).__webglFramebuffer;P.bindFramebuffer(N.FRAMEBUFFER,f);let p=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await zt(N,p,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,d),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,a),N.deleteBuffer(d),N.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;I.setTexture2D(e,0),N.copyTexSubImage2D(N.TEXTURE_2D,n,0,0,o,s,i,a),P.unbindTexture()};let ft=N.createFramebuffer(),ht=N.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(Rt(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Le.convert(t.format),_=Le.convert(t.type),v;t.isData3DTexture?(I.setTexture3D(t,0),v=N.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(I.setTexture2DArray(t,0),v=N.TEXTURE_2D_ARRAY):(I.setTexture2D(t,0),v=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,t.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,t.unpackAlignment);let y=N.getParameter(N.UNPACK_ROW_LENGTH),b=N.getParameter(N.UNPACK_IMAGE_HEIGHT),x=N.getParameter(N.UNPACK_SKIP_PIXELS),S=N.getParameter(N.UNPACK_SKIP_ROWS),C=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,h.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,h.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,l),N.pixelStorei(N.UNPACK_SKIP_ROWS,u),N.pixelStorei(N.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=F.get(e),r=F.get(t),h=F.get(n.__renderTarget),g=F.get(r.__renderTarget);P.bindFramebuffer(N.READ_FRAMEBUFFER,h.__webglFramebuffer),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,F.get(e).__webglTexture,i,d+n),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,F.get(t).__webglTexture,a,m+n)),N.blitFramebuffer(l,u,o,s,f,p,o,s,N.DEPTH_BUFFER_BIT,N.NEAREST);P.bindFramebuffer(N.READ_FRAMEBUFFER,null),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||F.has(e)){let n=F.get(e),r=F.get(t);P.bindFramebuffer(N.READ_FRAMEBUFFER,ft),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,ht);for(let e=0;e<c;e++)w?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,n.__webglTexture,i),T?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,r.__webglTexture,a),i===0?T?N.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):N.copyTexSubImage2D(v,a,f,p,l,u,o,s):N.blitFramebuffer(l,u,o,s,f,p,o,s,N.COLOR_BUFFER_BIT,N.NEAREST);P.bindFramebuffer(N.READ_FRAMEBUFFER,null),P.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?N.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h);N.pixelStorei(N.UNPACK_ROW_LENGTH,y),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,b),N.pixelStorei(N.UNPACK_SKIP_PIXELS,x),N.pixelStorei(N.UNPACK_SKIP_ROWS,S),N.pixelStorei(N.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&N.generateMipmap(v),P.unbindTexture()},this.initRenderTarget=function(e){F.get(e).__webglFramebuffer===void 0&&I.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?I.setTextureCube(e,0):e.isData3DTexture?I.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?I.setTexture2DArray(e,0):I.setTexture2D(e,0),P.unbindTexture()},this.resetState=function(){x=0,S=0,C=null,P.reset(),Re.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return bt}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=V._getDrawingBufferColorSpace(e),t.unpackColorSpace=V._getUnpackColorSpace()}},Tl=null;function El(){if(E(`gl`)===`off`)return null;if(Tl)return clearTimeout(Tl.timer),Tl.users++,Tl.renderer;let e=document.createElement(`canvas`),t=null;try{t=e.getContext(`webgl2`,{antialias:!0,alpha:!1,stencil:!1,depth:!0,powerPreference:`high-performance`,preserveDrawingBuffer:D})}catch{t=null}if(!t)return null;try{let n=new wl({canvas:e,context:t});return n.outputColorSpace=pt,n.toneMapping=0,n.debug.checkShaderErrors=!1,e.style.cssText=`display:block;width:100%;height:100%;touch-action:none;-webkit-tap-highlight-color:transparent;outline:none`,Tl={renderer:n,users:1},n}catch{return null}}function Dl(e){if(!Tl||Tl.renderer!==e||(Tl.users--,Tl.users>0))return;let t=Tl;t.timer=setTimeout(()=>{Tl!==t||t.users>0||(Tl=null,t.renderer.dispose(),t.renderer.forceContextLoss())},6e4)}function Ol(e){Tl?.renderer===e&&(Tl=null)}function kl({make:e,name:t,qaKey:n,onMode:r,worldRef:i,anchors:a}){let o=(0,C.useRef)(null),s=(0,C.useRef)(null),c=(0,C.useRef)(new Map),l=(0,C.useRef)(r);l.current=r;let u=(0,C.useRef)(null),d=(0,C.useRef)(null);return(0,C.useEffect)(()=>{let r=o.current,a=El();if(!a){document.documentElement.dataset.render=`flat`,l.current(`flat`);return}let f;try{f=e(a)}catch(e){console.warn(`${t} could not be built, showing the flat version instead.`,e),Dl(a),l.current(`flat`);return}document.documentElement.dataset.render=`webgl`,i.current=f,f.setAnchorElements(c.current);let p=a.domElement;r.prepend(p);let m=Math.min(window.devicePixelRatio||1,2),h=()=>{let e=r.getBoundingClientRect();a.setPixelRatio(m),a.setSize(e.width,e.height,!1),f.setSize(e.width,e.height,s.current?.offsetHeight??104)};h();let g=new ResizeObserver(h);g.observe(r);let _=0,v=()=>{clearTimeout(_),_=window.setTimeout(h,250)};window.addEventListener(`orientationchange`,v),window.visualViewport?.addEventListener(`resize`,v);let y=[],b=0,x=()=>{},S=!1,C=()=>{S||(S=!0,x=ee((e,t)=>{f.update(t),f.render(),f.placeAnchors(),y.push(t*1e3),y.length>120&&y.shift();let n=[...y].sort((e,t)=>e-t);f.stats.fps=Math.round(1e3/(y.reduce((e,t)=>e+t,0)/y.length)),f.stats.p95=Math.round(n[Math.floor(n.length*.95)]??0),!D&&!f.calm&&(b=t>.02?b+1:Math.max(0,b-2),b>90&&m>1&&(m=Math.max(1,m-.25),b=0,h()))},()=>f.calm))};a.compileAsync(f.scene,f.rig.camera).then(C,C);let w=e=>{let t=r.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}},T=e=>{let t=w(e),n=u.current;f.pointerMove(t.x,t.y,n?.x??t.x,n?.y??t.y,!!n&&n.pointer===e.pointerId)},E=e=>{let t=u.current;if(!t||t.pointer!==e.pointerId)return;u.current=null;let n=w(e);f.pointerUp(),Math.hypot(n.x-t.x,n.y-t.y)<14&&performance.now()-t.t<900&&f.tap(n.x,n.y,t.id)},O=(e,t)=>{if(e.button>0)return;let n=w(e);u.current={x:n.x,y:n.y,t:performance.now(),pointer:e.pointerId,id:t},f.pointerDown(n.x,n.y,t)},k=e=>O(e);p.addEventListener(`pointerdown`,k),window.addEventListener(`pointermove`,T),window.addEventListener(`pointerup`,E),window.addEventListener(`pointercancel`,E),d.current=(e,t)=>O(e.nativeEvent,t);let A=e=>e.preventDefault();r.addEventListener(`gesturestart`,A),r.addEventListener(`gesturechange`,A),r.addEventListener(`dblclick`,A);let te=e=>{e.preventDefault(),x(),Ol(a),l.current(`lost`)};return p.addEventListener(`webglcontextlost`,te),window[n]=()=>({mode:`webgl`,...f.qa(),stats:{...f.stats,dpr:m},memory:f.memory()}),()=>{x(),g.disconnect(),clearTimeout(_),window.removeEventListener(`orientationchange`,v),window.visualViewport?.removeEventListener(`resize`,v),p.removeEventListener(`pointerdown`,k),window.removeEventListener(`pointermove`,T),window.removeEventListener(`pointerup`,E),window.removeEventListener(`pointercancel`,E),p.removeEventListener(`webglcontextlost`,te),r.removeEventListener(`gesturestart`,A),r.removeEventListener(`gesturechange`,A),r.removeEventListener(`dblclick`,A),d.current=null,window[n]&&delete window[n],f.dispose(),i.current=null,p.remove(),Dl(a)}},[]),(0,w.jsxs)(`div`,{ref:o,style:{position:`absolute`,inset:0,touchAction:`none`,userSelect:`none`,WebkitUserSelect:`none`},children:[(0,w.jsx)(`div`,{ref:s,style:{position:`absolute`,left:0,top:0,width:0,height:`var(--top-clear)`,pointerEvents:`none`}}),a({onDown:(e,t)=>d.current?.(e,t),onKey:e=>i.current?.tap(0,0,e),onHover:e=>i.current?.hoverAnchor?.(e)},c.current)]})}var K={ambient:.6,sun:.4,bands:[[.42,.36,.78],[.42,.36,.78],[.8,.77,.93],[1,1,1]],outline:1,insideYawWide:30,insideYawTall:16,insidePitch:50,insideFitW:5.65,insideFitD:4.6,streetYaw:8,streetPitch:18,fov:30,walkSpeed:1.8,stepsPerSecond:3.2,hop:.07},Al=new z;function jl(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;Al.copy(t),Al[r]=0,Al.normalize();let l=.5*o/(o+s),u=1-Al.angleTo(e)/c;return Math.sign(Al[n])===1?u*l:s/(o+s)+l+l*(1-u)}var Ml=class e extends ri{constructor(e=1,t=1,n=1,r=2,i=.1){let a=r*2+1;if(i=Math.min(e/2,t/2,n/2,i),super(1,1,1,a,a,a),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:n,segments:r,radius:i},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let s=new z,c=new z,l=new z(e,t,n).divideScalar(2).subScalar(i),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new z,h=.5/a;for(let r=0,a=0;r<u.length;r+=3,a+=2)switch(s.fromArray(u,r),c.copy(s),c.x-=Math.sign(c.x)*h,c.y-=Math.sign(c.y)*h,c.z-=Math.sign(c.z)*h,c.normalize(),u[r+0]=l.x*Math.sign(s.x)+c.x*i,u[r+1]=l.y*Math.sign(s.y)+c.y*i,u[r+2]=l.z*Math.sign(s.z)+c.z*i,d[r+0]=c.x,d[r+1]=c.y,d[r+2]=c.z,Math.floor(r/p)){case 0:m.set(1,0,0),f[a+0]=jl(m,c,`z`,`y`,i,n),f[a+1]=1-jl(m,c,`y`,`z`,i,t);break;case 1:m.set(-1,0,0),f[a+0]=1-jl(m,c,`z`,`y`,i,n),f[a+1]=1-jl(m,c,`y`,`z`,i,t);break;case 2:m.set(0,1,0),f[a+0]=1-jl(m,c,`x`,`z`,i,e),f[a+1]=jl(m,c,`z`,`x`,i,n);break;case 3:m.set(0,-1,0),f[a+0]=1-jl(m,c,`x`,`z`,i,e),f[a+1]=1-jl(m,c,`z`,`x`,i,n);break;case 4:m.set(0,0,1),f[a+0]=1-jl(m,c,`x`,`y`,i,e),f[a+1]=1-jl(m,c,`y`,`x`,i,t);break;case 5:m.set(0,0,-1),f[a+0]=jl(m,c,`x`,`y`,i,e),f[a+1]=1-jl(m,c,`y`,`x`,i,t)}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}};function Nl(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Hr,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Pl(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Pl(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function Pl(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new jr(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function Fl(e,t=1e-4){t=Math.max(t,2**-52);let n={},r=e.getIndex(),i=e.getAttribute(`position`),a=r?r.count:i.count,o=0,s=Object.keys(e.attributes),c={},l={},u=[],d=[`getX`,`getY`,`getZ`,`getW`],f=[`setX`,`setY`,`setZ`,`setW`];for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.attributes[n];c[n]=new r.constructor(new r.array.constructor(r.count*r.itemSize),r.itemSize,r.normalized);let i=e.morphAttributes[n];i&&(l[n]||(l[n]=[]),i.forEach((e,t)=>{let r=new e.array.constructor(e.count*e.itemSize);l[n][t]=new e.constructor(r,e.itemSize,e.normalized)}))}let p=t*.5,m=10**Math.log10(1/t),h=p*m;for(let t=0;t<a;t++){let i=r?r.getX(t):t,a=``;for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),o=r.itemSize;for(let e=0;e<o;e++)a+=`${~~(r[d[e]](i)*m+h)},`}if(a in n)u.push(n[a]);else{for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),a=e.morphAttributes[n],u=r.itemSize,p=c[n],m=l[n];for(let e=0;e<u;e++){let t=d[e],n=f[e];if(p[n](o,r[t](i)),a)for(let e=0,r=a.length;e<r;e++)m[e][n](o,a[e][t](i))}}n[a]=o,u.push(o),o++}}let g=e.clone();for(let t in e.attributes){let e=c[t];if(g.setAttribute(t,new e.constructor(e.array.slice(0,o*e.itemSize),e.itemSize,e.normalized)),t in l)for(let e=0;e<l[t].length;e++){let n=l[t][e];g.morphAttributes[t][e]=new n.constructor(n.array.slice(0,o*n.itemSize),n.itemSize,n.normalized)}}return g.setIndex(u),g}var q={pink:`#FF8FB8`,hotpink:`#FF4F9A`,lavender:`#D9CCFF`,lavenderDark:`#B9A6F5`,butter:`#FBEA9A`,mint:`#8FE3C8`,sky:`#A8DCFF`,peach:`#FFC2A8`,cream:`#FFF7F0`,gold:`#FFC83D`,ink:`#2B2330`},Il=null;function Ll(){return Il||(Il=new Ei(new Uint8Array(K.bands.length*4),K.bands.length,1,xe),Il.minFilter=Il.magFilter=M,Il.generateMipmaps=!1,Rl()),Il}function Rl(){if(!Il)return;let e=Il.image.data;K.bands.forEach((t,n)=>t.forEach((t,r)=>e[n*4+r]=Math.round(t*255))),K.bands.forEach((t,n)=>e[n*4+3]=255),Il.needsUpdate=!0}var zl=new Map;function Bl(e=`#ffffff`,t=!1){let n=`${new H(e).getHexString()}|${t}`,r=zl.get(n);return r||(r=new ja({color:e,vertexColors:t,gradientMap:Ll()}),zl.set(n,r)),r}function Vl(e){let t=new no(`#FFF7F0`,K.ambient*Math.PI),n=new to(`#FFF7F0`,K.sun*Math.PI);return n.position.set(5,10,7),e.add(t,n,n.target),{ambient:t,sun:n,follow(e,r,i){n.target.position.set(e,r,i),n.position.set(e+5,r+10,i+7),t.intensity=K.ambient*Math.PI,n.intensity=K.sun*Math.PI}}}var Hl={uRes:{value:[1,1]},uScale:{value:1},...ci.clone(G.fog)};function Ul(e,t){Hl.uRes.value=[Math.max(1,e),Math.max(1,t)],Hl.uScale.value=K.outline}var Wl=`
  #include <fog_pars_vertex>
  uniform vec2 uRes;
  uniform float uPx;
  uniform float uScale;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mvPosition;
    vec3 n = normalMatrix * normal;
    vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
    float len = length(dir);
    dir = len > 1e-5 ? dir / len : vec2(0.0);
    // Thinner lines on things far away (the street from the arrival camera), never thicker than uPx.
    float w = uPx * uScale * clamp(14.0 / max(clip.w, 1.0), 0.55, 1.0);
    clip.xy += dir * w * 2.0 / uRes * clip.w;
    gl_Position = clip;
    #include <fog_vertex>
  }
`,Gl=`
  #include <fog_pars_fragment>
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <fog_fragment>
  }
`,Kl=new Map;function ql(e,t=q.ink){let n=`${e}|${t}`,r=Kl.get(n);return r||(r=new di({uniforms:{...Hl,uPx:{value:e},uColor:{value:new H(t)}},vertexShader:Wl,fragmentShader:Gl,side:1,fog:!0}),Kl.set(n,r)),r}function Jl(e){let t=e.clone();for(let e of Object.keys(t.attributes))e!==`position`&&t.deleteAttribute(e);let n=Fl(t,.001);return t.dispose(),n.computeVertexNormals(),n}function Yl(e,t){let n=new ei(Jl(e),ql(t));return n.userData.hull=t,n}function Xl(e,t){let n=e.userData.hull;n!==void 0&&(e.material=ql(n,t?q.hotpink:q.ink))}var Zl=new H;function Ql(e,t,n={}){let r=e.index?e.toNonIndexed():e;r!==e&&e.dispose();for(let e of Object.keys(r.attributes))e!==`position`&&e!==`normal`&&r.deleteAttribute(e);let i=new Mn().compose(new z(...n.at??[0,0,0]),new At().setFromEuler(new Hn(...n.rot??[0,0,0])),new z(...n.scale??[1,1,1]));r.applyMatrix4(i),Zl.set(t);let a=r.attributes.position.count,o=new Float32Array(a*3);for(let e=0;e<a;e++)o.set([Zl.r,Zl.g,Zl.b],e*3);return r.setAttribute(`color`,new jr(o,3)),r}var J={box:(e,t,n,r,i)=>Ql(new ri(e,t,n),r,i),rbox:(e,t,n,r,i,a)=>Ql(new Ml(e,t,n,2,Math.min(r,e/2,t/2,n/2)*.999),i,a),cyl:(e,t,n,r,i,a=16)=>Ql(new Yi(e,t,n,a),r,i),cone:(e,t,n,r,i=16)=>Ql(new Xi(e,t,i),n,r),sphere:(e,t,n,r=18)=>Ql(new Oa(e,r,Math.round(r*.7)),t,n),capsule:(e,t,n,r)=>Ql(new qi(e,t,5,14),n,r),torus:(e,t,n,r,i=Math.PI*2)=>Ql(new ka(e,t,8,24,i),n,r)};function $l(e){let t=Nl(e,!1);for(let t of e)t.dispose();if(!t)throw Error(`merge: parts have different attributes`);return t}function eu(e,t,n=2){let r=new U,i=new ei(t.add(e),Bl(`#ffffff`,!0));if(r.add(i),n>0){let i=Yl(e,n);t.add(i.geometry),r.add(i)}return r}function tu(e,t,n,r=2){let i=new U,a=Nl([...e,...t],!1),o=r>0&&e.length?Nl(e,!1):null;for(let n of[...e,...t])n.dispose();if(!a)throw Error(`solidMix: parts have different attributes`);if(i.add(new ei(n.add(a),Bl(`#ffffff`,!0))),o){let e=Yl(o,r);o.dispose(),n.add(e.geometry),i.add(e)}return i}var nu=null;function ru(e,t){if(!nu){let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);n.addColorStop(0,`rgba(43,35,48,0.34)`),n.addColorStop(.62,`rgba(43,35,48,0.2)`),n.addColorStop(1,`rgba(43,35,48,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),nu=new Wi(e)}let n=new ei(t.add(new Ea(e*2,e*2)),au());return n.rotation.x=-Math.PI/2,n.position.y=.012,n.renderOrder=1,n}var iu=null,au=()=>iu??=new Dr({map:nu,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4}),ou=`#2E2233`,su=`#FF9DB8`,cu=`#7A2745`,lu=`#FF8FA8`,uu=`#FFFFFF`,du=(e,t,n,r,i)=>J.cyl(e,t,n,r,i,20);function fu(e,t){let n=e.height,r=n>=1?3:2.5,i=e.species===`penguin`,a=e.species===`hornbill`,o=[],s=[],c=[],l=[],u=[],d=[],f=[],p=[0,0,0],m={L:[],R:[]},h=[],g=(i?.27:e.species===`panda`||e.species===`elephant`?.26:a?.22:.24)*n,_=e.chub??1,v=[_,1,1+(_-1)*.8],y=.52*n,b=i?.2*n:g*.92,x=i?[.3*n,.5*n,0]:[.155*n*_,.47*n,0],S=(e,t,n=0)=>[e,b+t,Math.sqrt(Math.max(0,g*g-e*e-t*t))+n],C=e=>[0,Math.asin(Math.max(-1,Math.min(1,e/g))),0];if(i){o.push(J.sphere(.31*n,e.fur,{at:[0,.33*n,0],scale:[1,1.02,.95]},24)),o.push(J.sphere(.25*n,e.light,{at:[0,.3*n,.12*n],scale:[1,1.08,.66]},20));for(let t of[-1,1])o.push(J.sphere(.09*n,e.dark,{at:[t*.11*n,.025*n,.13*n],scale:[1,.42,1.45]}))}else if(a){o.push(J.sphere(.17*n,e.fur,{at:[0,.36*n,0],scale:[1,1.2,1]},20)),o.push(J.sphere(.13*n,e.light,{at:[0,.3*n,.07*n],scale:[1,1.15,.7]}));for(let t of[-1,1]){let r=t*.07*n;o.push(J.capsule(.025*n,.12*n,e.fur,{at:[r,.1*n,0]}));for(let t of[-.5,0,.5])o.push(J.capsule(.017*n,.06*n,e.fur,{at:[r+Math.sin(t)*.04*n,.015*n,Math.cos(t)*.04*n],rot:[Math.PI/2,t,0]}))}}else{let t=e.species===`panda`?e.dark:e.fur,r=e.species===`unicorn`||e.species===`buffalo`||e.species===`panda`?e.dark:e.light,i=.085*n*(1+(_-1)*.7),a=.07*n*(1+(_-1)*.6);for(let e of[-1,1])o.push(J.capsule(a,.06*n,t,{at:[e*i,.1*n,0]})),o.push(J.sphere(.075*n*(1+(_-1)*.6),r,{at:[e*i,.035*n,.02*n],scale:[1,.6,1.3]}));o.push(J.capsule(.155*n,.1*n,e.fur,{at:[0,.34*n,0],scale:v})),e.species===`fox`&&o.push(J.sphere(.075*n,e.light,{at:[0,.5*n,.11*n],scale:[1.1,.8,.7]})),e.species===`buffalo`&&!e.outfit&&o.push(J.sphere(.11*n,e.light,{at:[0,.27*n,.1*n],scale:[1,1.1,.55]}))}let w=e.outfit;if(w){if(i)o.push(du(.3*n,.335*n,.18*n,w.color,{at:[0,.43*n,0]}));else{let e=w.kind===`shirt`;if(o.push(J.capsule(.163*n,(e?.1:.06)*n,w.color,{at:[0,(e?.35:.37)*n,0],scale:v})),w.kind===`dress`&&o.push(du(.15*n,.235*n,.17*n,w.color,{at:[0,.235*n,0],scale:v})),w.shorts&&o.push(du(.16*n,.168*n,.09*n,w.shorts,{at:[0,.205*n,0],scale:v})),w.kind===`polo`){for(let e of[-1,1])o.push(J.box(.08*n,.012*n,.06*n,w.color,{at:[e*.045*n,.535*n,.1*n],rot:[.5,0,e*-.4]}));s.push(...[.47,.42].map(e=>J.sphere(.009*n,uu,{at:[0,e*n,.162*n*v[2]]})))}w.kind===`blouse`&&(o.push(J.torus(.075*n,.016*n,`#FFFFFF`,{at:[0,.525*n,.04*n*v[2]],rot:[Math.PI/2-.35,0,0]})),s.push(...[.46,.4].map(e=>J.sphere(.009*n,`#FFE7A8`,{at:[0,e*n,.163*n*v[2]]})))),w.kind===`shirt`&&(s.push(...[.47,.4,.33,.26].map(e=>J.sphere(.011*n,`#E8B85C`,{at:[0,e*n,.164*n*v[2]]}))),o.push(J.box(.06*n,.06*n,.01*n,w.color,{at:[.07*n,.44*n,.15*n],rot:[0,.45,0]})))}}for(let[t,r]of[[`L`,-1],[`R`,1]]){let o=m[t];if(i)o.push(J.capsule(.07*n,.14*n,e.fur,{at:[r*.015*n,-.12*n,0],rot:[0,0,r*.3],scale:[.45,1,1]})),w&&o.push(J.sphere(.06*n,w.color,{at:[r*0,-.02*n,0],scale:[.8,1,1]}));else if(a)o.push(J.sphere(.08*n,e.fur,{at:[r*.02*n,-.09*n,0],rot:[0,0,r*.3],scale:[.5,1.35,.95]})),o.push(J.sphere(.04*n,e.light,{at:[r*.05*n,-.18*n,.02*n],scale:[.6,1,.9]})),w&&o.push(J.sphere(.06*n,w.color,{at:[0,-.01*n,0]}));else{let t=e.species===`panda`?e.dark:e.fur,i=e.species===`unicorn`||e.species===`buffalo`||e.species===`panda`?e.dark:e.species===`fox`?e.light:e.fur;o.push(J.capsule(.052*n,.09*n,t,{at:[r*.025*n,-.075*n,0],rot:[0,0,r*.35]})),o.push(J.sphere(.054*n,i,{at:[r*.05*n,-.14*n,.005*n]})),w&&o.push(J.sphere(.068*n,w.color,{at:[r*.004*n,-.015*n,0]}))}}let T=e.species===`unicorn`?.12*g:i?.02*g:a?.14*g:.05*g,E=e.species===`unicorn`?.37*g:a?.46*g:.36*g,D=.21*g,O=i?.12*g:0;for(let t of[-1,1]){let n=t*E;if(u.push(J.sphere(D,ou,{at:S(n,T,O-.03*g),rot:C(n),scale:[.78,1,.42]})),d.push(J.sphere(D*.3,uu,{at:S(n+t*.05*g,T+.08*g,O+.035*g)})),d.push(J.sphere(D*.14,uu,{at:S(n-t*.05*g,T-.07*g,O+.035*g)})),e.lashes)for(let e of[0,1])d.push(J.capsule(.012*g,.07*g,ou,{at:S(n+t*(.16+e*.05)*g,T+(.17-e*.07)*g,O+.01*g),rot:[0,0,t*(-.9-e*.5)]}));let r=e.species===`unicorn`?-.08*g:-.2*g;l.push(J.sphere(.12*g,su,{at:S(t*.58*g,r,O*.6-.02*g),rot:C(t*.58*g),scale:[1.25,.65,.3]}))}let k=(e,t)=>t===void 0?S(0,e,.005*g):[0,b+e,t],A=t=>{p=t,e.open?(f.push(J.sphere(.2*g,cu,{scale:[1.15,.72,.35]})),f.push(J.sphere(.1*g,lu,{at:[0,-.07*g,.03*g],scale:[1.3,.6,.5]}))):f.push(J.torus(.075*g,.017*g,cu,{rot:[0,0,Math.PI]},Math.PI))};switch(e.species){case`unicorn`:{let t=e.mane??[e.fur],r=e=>t[e%t.length];c.push(J.sphere(g,e.fur,{at:[0,b,0]},26)),c.push(J.sphere(.52*g,e.light,{at:[0,b-.36*g,.6*g],scale:[1.05,.66,.6]})),l.push(...[-1,1].map(e=>J.sphere(.032*g,ou,{at:[e*.16*g,b-.27*g,.91*g],scale:[1,.7,.6]}))),A(k(-.47*g,.86*g));for(let t of[-1,1])c.push(J.cone(.24*g,.7*g,e.fur,{at:[t*.62*g,b+.92*g,0*g],rot:[-.1,0,-t*.42]})),l.push(J.cone(.13*g,.44*g,e.ear??e.light,{at:[t*.6*g,b+.87*g,.1*g],rot:[-.1,0,-t*.42]}));c.push(J.cone(.15*g,.78*g,`#FFC83D`,{at:[0,b+1.12*g,.25*g],rot:[.28,0,0]})),l.push(...[0,1,2].map(e=>J.torus(.12*g-e*.03*g,.022*g,`#E8A92A`,{at:[0,b+(.86+e*.17)*g,(.18+e*.05)*g],rot:[Math.PI/2+.28,0,0]}))),c.push(J.sphere(.88*g,r(0),{at:[0,b+.42*g,-.12*g],scale:[1.05,.62,1]})),c.push(J.sphere(.32*g,r(0),{at:[-.32*g,b+.62*g,.62*g]}),J.sphere(.27*g,r(1),{at:[.02*g,b+.72*g,.6*g]}));let i=e.hair===`short`?2:e.hair===`long`?5:3,a=e.hair===`short`?0:e.hair===`long`?5:2;for(let e=0;e<i;e++)c.push(J.sphere((.42-e*.03)*g,r(e+1),{at:[.05*g*(e%2),b+(.15-e*.36)*g,-.82*g+e*.04*g]}));for(let e of[-1,1])for(let t=0;t<a;t++)c.push(J.sphere((.34-t*.02)*g,r(t+(e<0?2:3)),{at:[e*(.86+t*.03)*g,b+(.05-t*.34)*g,(-.2-t*.04)*g]}));[[.27,-.16,.07],[.23,-.23,.075],[.17,-.29,.075],[.11,-.31,.068],[.06,-.27,.058]].forEach(([e,t,i],a)=>h.push(J.sphere(i*n,r(a),{at:[0,e*n,t*n]})));break}case`panda`:c.push(J.sphere(g,e.fur,{at:[0,b,0]},26));for(let t of[-1,1])c.push(J.sphere(.27*g,e.dark,{at:[t*.7*g,b+.7*g,-.12*g]})),l.push(J.sphere(.15*g,e.ear??`#FFB3C7`,{at:[t*.68*g,b+.68*g,.08*g],scale:[1,1,.4]})),c.push(J.sphere(.3*g,`#62566A`,{at:S(t*E,T-.03*g,-.12*g),rot:[0,Math.asin(t*E/g),t*.45],scale:[.85,1.12,.4]}));c.push(J.sphere(.42*g,e.light,{at:[0,b-.33*g,.62*g],scale:[1.1,.72,.7]})),c.push(J.sphere(.1*g,e.dark,{at:[0,b-.17*g,.96*g],scale:[1.3,.8,.8]})),A(k(-.47*g,.86*g)),c.push(J.sphere(.16*g,e.fur,{at:[.05*g,b+.96*g,.1*g],scale:[1.4,.7,1]}));break;case`elephant`:c.push(J.sphere(g,e.fur,{at:[0,b,0],scale:[1.08,1,1]},26));for(let t of[-1,1])c.push(J.sphere(.62*g,e.fur,{at:[t*1.02*g,b+.08*g,-.12*g],rot:[0,t*.45,-t*.15],scale:[1,1.12,.26]})),l.push(J.sphere(.46*g,e.ear??e.dark,{at:[t*1.07*g,b+.06*g,-.03*g],rot:[0,t*.45,-t*.15],scale:[1,1.1,.2]}));for(let[t,n,r]of[[-.15,.88,.24],[-.32,.98,.21],[-.48,1.05,.19],[-.62,1.14,.17],[-.7,1.27,.155],[-.7,1.4,.145],[-.62,1.5,.14]])c.push(J.sphere(r*g,e.fur,{at:[0,b+t*g,n*g]}));l.push(J.torus(.09*g,.035*g,e.dark,{at:[0,b-.55*g,1.56*g],rot:[-.9,0,0]})),p=S(0,-.36*g,.01*g),f.push(J.torus(.24*g,.022*g,cu,{rot:[0,0,Math.PI]},Math.PI)),c.push(...[-.14,.04,.2].map((t,n)=>J.sphere((.15-n*.02)*g,e.dark,{at:[t*g,b+(.95-n*.04)*g,.15*g],scale:[.8,1.2,.8]}))),h.push(J.capsule(.018*n,.12*n,e.fur,{at:[0,.2*n,-.2*n*v[2]],rot:[-.5,0,0]})),h.push(J.sphere(.035*n,e.dark,{at:[0,.13*n,-.24*n*v[2]],scale:[1,1.4,1]}));break;case`fox`:c.push(J.sphere(g,e.fur,{at:[0,b,0],scale:[1.1,1,1]},26));for(let t of[-1,1])c.push(J.cone(.36*g,.98*g,e.fur,{at:[t*.58*g,b+.95*g,-.08*g],rot:[-.1,0,-t*.38]})),l.push(J.cone(.2*g,.6*g,e.ear??e.light,{at:[t*.56*g,b+.88*g,.06*g],rot:[-.1,0,-t*.38]})),c.push(J.sphere(.34*g,e.light,{at:[t*.52*g,b-.42*g,.55*g]}));c.push(J.sphere(.3*g,e.light,{at:[0,b-.36*g,.8*g],scale:[1.1,.8,.8]})),c.push(J.sphere(.08*g,e.dark,{at:[0,b-.22*g,1.03*g],scale:[1.3,.85,.9]})),A(k(-.48*g,1*g)),c.push(...[-.2,.05,.28].map((t,n)=>J.sphere((.24-n*.03)*g,e.fur,{at:[t*g,b+(.82-n*.06)*g,.48*g]}))),h.push(J.sphere(.13*n,e.fur,{at:[.05*n,.27*n,-.2*n],rot:[-.6,0,.25],scale:[.78,1.38,.78]})),h.push(J.sphere(.085*n,e.light,{at:[.09*n,.42*n,-.29*n]}));break;case`buffalo`:c.push(J.sphere(g,e.fur,{at:[0,b,0],scale:[1.1,.98,1]},26)),c.push(J.sphere(.56*g,e.light,{at:[0,b-.36*g,.56*g],scale:[1.25,.75,.76]})),l.push(...[-1,1].map(e=>J.sphere(.05*g,ou,{at:[e*.2*g,b-.28*g,.94*g],scale:[1.3,.8,.6]}))),A(k(-.5*g,.9*g));for(let t of[-1,1]){c.push(J.sphere(.22*g,e.fur,{at:[t*1.02*g,b+.18*g,-.05*g],rot:[0,0,-t*.35],scale:[1.6,.62,.42]})),l.push(J.sphere(.13*g,e.ear??su,{at:[t*1.05*g,b+.17*g,.01*g],rot:[0,0,-t*.35],scale:[1.5,.55,.3]}));let n=`#FFF3DC`,r=.4*g,i=t*.78*g,a=b+.42*g,o=t>0?-Math.PI/2:Math.PI/2+.55;c.push(J.torus(r,.17*g,n,{at:[i,a+r,-.05*g],rot:[0,0,o]},2.05));let s=t>0?-Math.PI/2+2.05:Math.PI/2+.55;c.push(J.cone(.16*g,.34*g,n,{at:[i+Math.cos(s)*r,a+r+Math.sin(s)*r+.08*g,-.05*g],rot:[0,0,t>0?.45:-.45]}))}if(c.push(...[-.15,.12].map(e=>J.sphere(.25*g,`#7A86B0`,{at:[e*g,b+.82*g,.3*g],scale:[1.2,.7,1]}))),e.extras?.includes(`pigtails`))for(let e of[-1,1])c.push(J.capsule(.16*g,.5*g,`#7A86B0`,{at:[e*1.12*g,b-.52*g,-.02*g],rot:[0,0,e*.45]})),c.push(J.sphere(.13*g,`#7A86B0`,{at:[e*1.36*g,b-.98*g,.02*g]})),c.push(J.cone(.13*g,.26*g,`#FF6FAE`,{at:[e*1.12*g,b-.2*g,.04*g],rot:[0,0,e*Math.PI/2]})),c.push(J.cone(.13*g,.26*g,`#FF6FAE`,{at:[e*.9*g,b-.2*g,.04*g],rot:[0,0,-e*Math.PI/2]}));h.push(J.capsule(.02*n,.14*n,e.fur,{at:[0,.18*n,-.19*n],rot:[-.6,0,0]})),h.push(J.sphere(.04*n,e.dark,{at:[0,.1*n,-.25*n],scale:[1,1.3,1]}));break;case`penguin`:c.push(J.sphere(g,e.fur,{at:[0,b,0]},26));for(let t of[-1,1])c.push(J.sphere(.62*g,e.light,{at:[t*.28*g,b-.16*g,.48*g],scale:[1,1.02,.95]}));p=[0,b-(e.open?.25:.33)*g,(e.open?1.08:1.04)*g],e.open?(c.push(J.cone(.2*g,.4*g,e.dark,{at:[0,b-.14*g,1.13*g],rot:[Math.PI/2,0,0],scale:[1.5,1,.65]})),c.push(J.cone(.14*g,.26*g,e.dark,{at:[0,b-.33*g,1.06*g],rot:[Math.PI/2+.4,0,0],scale:[1.4,1,.6]})),f.push(J.sphere(.11*g,cu,{scale:[1.5,.6,.5]}))):c.push(J.cone(.18*g,.36*g,e.dark,{at:[0,b-.2*g,1.12*g],rot:[Math.PI/2,0,0],scale:[1.45,1,.65]})),e.extras?.includes(`tuft`)&&c.push(...[-.15,.05,.24].map((t,n)=>J.sphere(.17*g,e.fur,{at:[t*g,b+(1+n%2*.1)*g,0],rot:[0,0,-t*2.5],scale:[.7,1.5,.7]}))),e.extras?.includes(`tuft`)||c.push(J.sphere(.18*g,e.fur,{at:[.05*g,b+.93*g,.1*g],scale:[1.3,.6,1]}));break;case`hornbill`:p=[0,b-.45*g,.95*g],c.push(J.sphere(g,e.fur,{at:[0,b,0]},26));for(let t of[-1,1])c.push(J.sphere(.42*g,e.light,{at:[t*.42*g,b+.02*g,.62*g],scale:[1,1.05,.55]}));c.push(J.cone(.32*g,1.45*g,e.dark,{at:[0,b-.32*g,1.35*g],rot:[2.05,0,0],scale:[.62,1,1.25]})),c.push(J.capsule(.2*g,.55*g,`#FFD45C`,{at:[0,b+.22*g,1*g],rot:[Math.PI/2+.3,0,0],scale:[.65,1,.8]})),c.push(J.sphere(.6*g,e.light,{at:[0,b-.75*g,.1*g],scale:[1.15,.55,1]})),c.push(...[-.2,.15].map(t=>J.sphere(.22*g,e.fur,{at:[t*g,b+.9*g,-.15*g],scale:[1.2,.7,1]})));for(let[t,r]of[-.9,-.45,0,.45,.9].entries())h.push(J.sphere(.07*n,t%2?e.light:`#EADFCB`,{at:[Math.sin(r)*.1*n,.2*n,-.2*n-Math.cos(r)*.05*n],rot:[-.9,r,0],scale:[.55,1.6,.3]}))}for(let t of e.extras??[]){if(t===`glasses`||t===`round-glasses`){let e=t===`glasses`?`#E8A92A`:`#5FBFA0`,n=(t===`glasses`?.2:.26)*g;for(let t of[-1,1])c.push(J.torus(n,.03*g,e,{at:S(t*E,T,.06*g),rot:C(t*E)}));c.push(J.capsule(.025*g,E*2-n*2,e,{at:S(0,T+.03*g,.08*g),rot:[0,0,Math.PI/2]}))}if(t===`moustache`)for(let e of[-1,1])c.push(J.capsule(.08*g,.24*g,`#F4EFF4`,{at:[e*.18*g,b-.33*g,.95*g],rot:[0,0,e*1.15]}));if(t===`cap`&&(c.push(J.sphere(1*g,`#8FC9F5`,{at:[0,b+.32*g,-.06*g],rot:[-.3,0,0],scale:[1.12,.72,1.06]})),c.push(J.cyl(.5*g,.5*g,.06*g,`#6FB0E6`,{at:[0,b+.42*g,-1*g],rot:[.35,0,0],scale:[1,1,1.3]})),c.push(J.box(.5*g,.08*g,.06*g,`#6FB0E6`,{at:[0,b+.5*g,.86*g],rot:[-.55,0,0]}))),t===`scarf`&&(o.push(J.torus(.255*n,.05*n,`#FF8FB8`,{at:[0,.54*n,.02*n],rot:[Math.PI/2,0,0]},Math.PI*2)),o.push(J.rbox(.09*n,.24*n,.04*n,.015*n,`#FF8FB8`,{at:[.12*n,.42*n,.27*n],rot:[.25,0,-.15]}))),t===`bib`&&o.push(J.sphere(.2*n,`#A8DCFF`,{at:[0,.48*n,.2*n],scale:[1.1,.55,.45]})),t===`phone`){let e=[0,.42*n,.25*n*v[2]],t=-2.3,r=[t,0,0],i=[0,-Math.sin(t),Math.cos(t)];o.push(J.rbox(.13*n,.21*n,.022*n,.016*n,`#6B5BA8`,{at:e,rot:r})),s.push(J.rbox(.11*n,.18*n,.006*n,.012*n,`#BFE9FF`,{at:(t=>[e[0]+i[0]*t,e[1]+i[1]*t,e[2]+i[2]*t])(.012*n),rot:r}))}t===`cane`&&(m.L.push(J.cyl(.018*n,.018*n,.42*n,`#B07A4A`,{at:[-.09*n,-.32*n,.04*n]})),m.L.push(J.torus(.04*n,.016*n,`#B07A4A`,{at:[-.06*n,-.11*n,.04*n]},Math.PI)))}let ee=new U,te=new U,j=new U;j.position.y=y;let ne=new U,M=new U;ne.position.set(-x[0],x[1],x[2]),M.position.set(x[0],x[1],x[2]),ee.add(ru((i?.3:.2*_)*n*1.3,t),te),te.add(tu(o,s,t,r),j,ne,M),j.add(tu(c,l,t,r));let re=new U;re.position.y=b+T;for(let e of[...u,...d])e.translate(0,-(b+T),0);re.add(tu(u,d,t,r));let ie=new U,ae=new U;for(let e of[ie,ae])e.position.set(...p);f.length&&ie.add(tu([],f,t,0)),ae.add(tu([],[J.sphere(.17*g,cu,{scale:[1.1,.9,.35]}),J.sphere(.09*g,lu,{at:[0,-.06*g,.03*g],scale:[1.3,.6,.5]})],t,0)),ae.scale.setScalar(.001),ae.visible=!1,j.add(re,ie,ae),ne.add(tu(m.L,[],t,r)),M.add(tu(m.R,[],t,r));let oe=null;return h.length&&(oe=new U,oe.add(tu(h,[],t,r)),te.add(oe)),{root:ee,body:te,head:j,eyes:re,mouth:ie,talk:ae,open:!!e.open&&f.length>0,armL:ne,armR:M,tail:oe,height:n,radius:i?.3*n:.16*n*_}}var pu=class{rig;voice;nextBlink=.8+Math.random()*3;blink=-1;level=0;constructor(e,t){this.rig=e,this.voice=t}update(e){let{eyes:t,mouth:r,talk:i,open:a}=this.rig;this.nextBlink-=e,this.nextBlink<=0&&(this.blink=0,this.nextBlink=Math.random()<.2?.25:2.2+Math.random()*3.5);let o=1;this.blink>=0&&(this.blink+=e/.16,o=1-.9*n(Math.min(1,this.blink)),this.blink>=1&&(this.blink=-1)),t.scale.y=o;let s=this.voice?c(this.voice):0;this.level+=(s-this.level)*(1-Math.exp(-e*(s>this.level?30:14)));let l=this.level;if(a)r.scale.set(1+.15*l,1+.9*l,1);else{let e=l>.04;i.visible=e,r.visible=!e,e&&i.scale.set(.55+.45*l,Math.min(1,.25+l),1)}}},mu={species:`fox`,fur:`#FF9A4D`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`},hu={species:`buffalo`,fur:`#94A0C8`,light:`#DCD8EE`,dark:`#4C4F6B`,ear:`#FFB8CC`},gu={species:`penguin`,fur:`#3F365F`,light:`#FFF6EC`,dark:`#FFA640`},_u={kaylee:{species:`unicorn`,height:1,fur:`#CDB9F6`,light:`#F4EDFF`,dark:`#A88EE8`,ear:`#FFB3D1`,mane:[`#FF6FAE`,`#FBE27A`,`#8FE3C8`,`#8EC9F5`],hair:`medium`,outfit:{kind:`dress`,color:`#FF5FA2`},lashes:!0},ji:{species:`unicorn`,height:1.55,chub:1.15,fur:`#FFF5EF`,light:`#FFE8E0`,dark:`#BBA3F2`,ear:`#FFC9D6`,mane:[`#C7A6F2`,`#FF9CC8`,`#B494EE`,`#FFB8D8`],hair:`long`,outfit:{kind:`dress`,color:`#FFB79E`},lashes:!0},nick:{species:`unicorn`,height:1.7,fur:`#A9EBD6`,light:`#E2FAF1`,dark:`#9C86DA`,ear:`#FFB3C7`,mane:[`#8EC9F5`,`#B9A6F5`],hair:`short`,outfit:{kind:`polo`,color:`#FBE78A`},open:!0},agong:{species:`panda`,height:1.45,fur:`#FFF6EE`,light:`#FFFDF8`,dark:`#4A3F4F`,ear:`#FFB3C7`,outfit:{kind:`shirt`,color:`#FFF0DA`},extras:[`glasses`,`moustache`,`cane`]},jum:{species:`elephant`,height:1.5,chub:1.25,fur:`#FFB3CF`,light:`#FFE3EE`,dark:`#F28CB3`,ear:`#FF94BC`,outfit:{kind:`blouse`,color:`#A7EBD0`},lashes:!0},joy:{...mu,height:1.5,outfit:{kind:`blouse`,color:`#C9B5F7`},lashes:!0},gan:{...mu,height:1.32,outfit:{kind:`tee`,color:`#8FC9F5`,shorts:`#5D7BB0`},extras:[`cap`,`phone`]},ken:{...mu,height:1.25,outfit:{kind:`tee`,color:`#8FE3C8`},extras:[`round-glasses`,`phone`]},bird:{...hu,height:1.65,outfit:{kind:`tee`,color:`#FFB896`}},bb:{...hu,height:1.2,outfit:{kind:`dress`,color:`#FF8FB8`},extras:[`pigtails`,`phone`],lashes:!0},ja:{...gu,height:1.45,extras:[`scarf`],lashes:!0,open:!0},putto:{...gu,height:1,outfit:{kind:`tee`,color:`#8FE3C8`},extras:[`tuft`],open:!0},putter:{...gu,height:.78,fur:`#B9B4D6`,extras:[`bib`]},sri:{species:`hornbill`,height:1.5,fur:`#4A3F4F`,light:`#FFF1DC`,dark:`#FFB43C`,outfit:{kind:`blouse`,color:`#C9B5F7`},lashes:!0}},vu=_u.kaylee.height,yu=[.28,.5,.78],bu=class{id=`kaylee`;root;height=vu;pose=`stand`;floor=0;standPoint=null;chibi;path=[];onArrive=null;speed=0;yaw=Math.PI;yawVel=0;yawGoal=Math.PI;phase=0;tweens=[];settle=1;bounce={level:-1,t:0};flop=1;look=null;headYaw=0;life;waving=-1;constructor(e){this.chibi=fu(_u.kaylee,e),this.life=new pu(this.chibi),this.root=this.chibi.root,this.root.rotation.y=this.yaw,this.root.userData.pick=`kaylee`}get position(){return this.root.position}get walking(){return this.path.length>0||this.tweens.length>0}get busy(){return this.walking||this.speed>.01||this.pose===`bounce`||this.settle<1||this.flop<1}place(e,t,n,r){this.root.position.set(e,t,n),this.yaw=this.yawGoal=Math.PI/180*r,this.yawVel=0,this.path=[],this.tweens=[],this.speed=0}face(e){this.yawGoal=e}faceToward(e,t){let n=this.root.position;Math.hypot(e-n.x,t-n.z)>.05&&(this.yawGoal=Math.atan2(e-n.x,t-n.z))}walk(e,t){let n=()=>{this.path=e.slice(),this.onArrive=t??null};if(this.pose!==`stand`&&this.standPoint){let e=this.standPoint;this.standPoint=null,this.setPose(`stand`),this.path=[],this.hopTo(e,.28,.18,n)}else this.setPose(`stand`),n()}stop(){this.path=[],this.onArrive=null}hopTo(e,t,n,r){this.tweens.push({from:new z,to:e.clone(),dur:t,arc:n,t:-1,done:r})}setPose(e){e===`bounce`&&this.pose!==`bounce`&&(this.bounce={level:0,t:0}),e===`lie`&&(this.flop=0),this.pose=e}bounceHigher(){if(this.pose===`lie`)return this.setPose(`bounce`),0;if(this.pose!==`bounce`)this.setPose(`bounce`);else if(this.bounce.level>=yu.length-1)return this.setPose(`lie`),yu.length;else this.bounce.level++;return this.bounce.level}react(e){e===`wave`?this.waving=0:e===`hop`&&this.pose===`stand`&&!this.tweens.length?this.hopTo(this.root.position,.45,.25):this.settle=0}lookAt(e,t,n){this.look=(this.look??new z).set(e,t,n)}lookAway(){this.look=null}update(e,t){let n=Math.max(1,Math.ceil(e/(1/90)));for(let t=0;t<n;t++)this.step(e/n);if(this.pose3d(t),this.life.update(e),this.waving>=0){this.waving+=e/1.3;let t=Math.min(1,this.waving),n=a(t,0,.15)*(1-a(t,.8,1));this.chibi.armR.rotation.z=n*(2.5+Math.sin(t*Math.PI*6)*.35),t>=1&&(this.waving=-1)}}step(e){let t=this.root.position,r=this.tweens[0];if(r){r.t<0&&(r.from.copy(t),r.t=0,r.to.distanceToSquared(r.from)>1e-4&&(this.yawGoal=Math.atan2(r.to.x-r.from.x,r.to.z-r.from.z))),r.t+=e;let a=i(r.t/r.dur);t.lerpVectors(r.from,r.to,a),t.y+=n(a)*r.arc,a>=1&&(this.tweens.shift(),this.settle=0,r.done?.())}else if(this.path.length){let[n,r]=this.path[0],a=n-t.x,o=r-t.z,s=Math.hypot(a,o),c=s+this.pathLength(),l=1+i((c-4)/6,0,.6),u=K.walkSpeed*l*i(c/.45,.35,1);this.speed=this.speed>u?u:Math.min(u,this.speed+K.walkSpeed/.15*e);let d=this.speed*e;if(s<=Math.max(d,.02)){if(t.x=n,t.z=r,this.path.shift(),!this.path.length){this.speed=0,this.settle=0;let e=this.onArrive;this.onArrive=null,e?.()}}else t.x+=a/s*d,t.z+=o/s*d,this.yawGoal=Math.atan2(a,o)}else this.speed=0;let a=this.yawGoal-this.yaw;a=Math.atan2(Math.sin(a),Math.cos(a)),this.yawVel+=(220*a-28*this.yawVel)*e,this.yaw+=this.yawVel*e,this.speed>.01?this.phase+=Math.PI*K.stepsPerSecond*(this.speed/K.walkSpeed)*e:this.phase=0,this.settle=Math.min(1,this.settle+e/.35),this.flop=Math.min(1,this.flop+e/.5),this.pose===`bounce`&&(this.bounce.t+=e)}pathLength(){let e=0;for(let t=1;t<this.path.length;t++)e+=Math.hypot(this.path[t][0]-this.path[t-1][0],this.path[t][1]-this.path[t-1][1]);return e}pose3d(e){let{body:t,head:n}=this.chibi;this.root.rotation.y=this.yaw;let o=this.pose,s=0,c=1+Math.sin(e*2.4)*.015,l=0,u=0,d=this.speed/K.walkSpeed;if(d>.01){let e=Math.abs(Math.sin(this.phase));s=e*K.hop,c*=1+.06*(e-.5)*2*d,l=.14*d}if(o===`sit`)s-=.1,c*=.92;else if(o===`wai`)l=.32,u=.15;else if(o===`peek`)l=.22,u=.2;else if(o===`lookup`)u=-.5;else if(o===`bounce`){let e=yu[i(this.bounce.level,0,yu.length-1)],t=.42+e*.55,n=this.bounce.t%t/t;s+=Math.sin(n*Math.PI)*e;let r=1-a(Math.min(n,1-n),0,.08);c*=1-.2*r+.08*Math.sin(n*Math.PI)}this.settle<1&&(c*=1+r(this.settle,2)*.12),t.position.y=o===`lie`?this.chibi.radius*(1-.5*(1-this.flop)):s,t.rotation.x=o===`lie`?-Math.PI/2*Math.min(1,this.flop*1.2):l,t.rotation.z=0,t.scale.set(1/Math.sqrt(c),c,1/Math.sqrt(c));let f=0;if(this.look&&o!==`lie`){let e=this.root.worldToLocal(this.look.clone());f=i(Math.atan2(e.x,e.z),-.9,.9)}this.headYaw+=(f-this.headYaw)*.15,n.rotation.set(u,this.headYaw,0)}},xu=[{id:`agong`,name:`Agong`,thai:`อากง`,who:`Grandpa`,color:`#B9A6F5`,height:1.45,pitch:150,spot:{floor:0,x:2.025,z:-4.2,face:65,pose:`sit`,seat:.45}},{id:`jum`,name:`Jum`,who:`Aunt`,color:`#FFB3CF`,height:1.5,pitch:260,spot:{floor:0,x:1,z:-18.698,face:-30,pose:`stand`}},{id:`joy`,name:`Joy`,who:`Aunt, mom of Gan and Ken`,color:`#FBEA9A`,height:1.5,pitch:280,spot:{floor:0,x:.2,z:-7,face:-20,pose:`stand`}},{id:`bird`,name:`Bird`,who:`Uncle, dad of BB`,color:`#A8DCFF`,height:1.65,pitch:130,spot:{floor:0,x:-3.3,z:1,face:25,pose:`stand`}},{id:`nick`,name:`Daddy`,who:`Kaylee's dad (Nick)`,color:`#7FD1B9`,height:1.7,pitch:120,spot:{floor:0,x:2.9,z:1.15,face:-30,pose:`stand`}},{id:`ji`,name:`Mommy`,who:`Kaylee's mom (Ji)`,color:`#FF8FB8`,height:1.55,pitch:300,spot:{floor:1,x:.55,z:-18.898,face:-15,pose:`stand`}},{id:`bb`,name:`BB`,who:`Cousin, Bird's daughter`,color:`#FFB3D6`,height:1.2,pitch:380,spot:{floor:1,x:2.745,z:-19.198,face:-90,pose:`sit`,seat:.42}},{id:`gan`,name:`Gan`,who:`Cousin, Joy's son`,color:`#7CC4F2`,height:1.3,pitch:330,spot:{floor:1,x:-2.275,z:-16.998,face:0,pose:`lie`}},{id:`ken`,name:`Ken`,who:`Cousin, Joy's son`,color:`#8FE3C8`,height:1.25,pitch:350,spot:{floor:1,x:1.1,z:-8.5,face:-20,pose:`stand`}},{id:`ja`,name:`Ja`,who:`Aunt, mom of Putto and Putter`,color:`#D9CCFF`,height:1.5,pitch:270,spot:null},{id:`sri`,name:`Sri`,who:`Aunt`,color:`#FFC83D`,height:1.5,pitch:290,spot:null},{id:`putto`,name:`Putto`,who:`Cousin, Ja's son (Kaylee's age)`,color:`#A8DCFF`,height:1,pitch:420,spot:null},{id:`putter`,name:`Putter`,who:`Cousin, Ja's son (a little penguin)`,color:`#B9A6F5`,height:.8,pitch:480,spot:null}],Su=Math.PI/180,Cu=new z,wu=class{member;id;root;height;pose=`stand`;chibi;reaction=null;life;waving=-1;look=null;headYaw=0;phase=Math.random()*10;baseY;onPhone;glance=1;constructor(e,t){this.member=e,this.id=e.id,this.chibi=fu(_u[e.id],t),this.root=this.chibi.root,this.height=this.chibi.height,this.life=new pu(this.chibi,e.id),this.onPhone=!!_u[e.id].extras?.includes(`phone`),this.onPhone&&(this.chibi.armL.rotation.set(-1.2,0,.75),this.chibi.armR.rotation.set(-1.2,0,-.75));let n=e.spot;this.baseY=(n?.floor?3.6:0)+(n?.pose===`sit`?(n.seat??.45)-.1*this.height:n?.pose===`lie`?.2:0),n&&(this.root.position.set(n.x,this.baseY,n.z),this.root.rotation.y=n.face*Su,this.setPose(n.pose)),this.root.userData.pick=`family:${e.id}`}place(e,t,n,r,i=`stand`){this.baseY=t,this.root.position.set(e,t,n),this.root.rotation.y=r*Su,this.setPose(i)}setPose(e){this.pose=e;let{body:t}=this.chibi;t.rotation.set(e===`lie`?-Math.PI/2:0,0,0),t.position.set(0,e===`lie`?this.chibi.radius:0,0)}react(e){this.onPhone?this.glance=0:e===`wave`?this.waving=0:this.reaction={kind:e,t:0}}lookAt(e,t,n){this.look=(this.look??new z).set(e,t,n)}lookAway(){this.look=null}update(e,t){let{body:r,head:o,armR:s}=this.chibi,c=this.pose===`lie`;if(this.life.update(e),this.waving>=0){this.waving+=e/1.5;let t=Math.min(1,this.waving),n=a(t,0,.15)*(1-a(t,.8,1));s.rotation.z=n*(2.5+Math.sin(t*Math.PI*7)*.35),t>=1&&(s.rotation.z=0,this.waving=-1)}let l=1+Math.sin(t*2.6+this.phase)*.018;r.scale.set(1/Math.sqrt(l),l,1/Math.sqrt(l));let u=0;this.glance=Math.min(1,this.glance+e/1.1);let d=this.onPhone?n(this.glance):1;this.look&&!c&&d>.05&&(this.root.worldToLocal(Cu.copy(this.look)),u=i(Math.atan2(Cu.x,Cu.z),-1,1)),this.headYaw+=(u-this.headYaw)*(1-Math.exp(-e*6)),o.rotation.y=this.headYaw*d,this.onPhone&&(o.rotation.x=.45*(1-d)+Math.sin(t*1.3+this.phase)*.02);let f=0;if(this.reaction){let t=this.reaction;if(t.t+=e,t.kind===`hop`){let e=t.t/.55,i=n(a(e,0,.22)),o=a(e,.2,.85),s=n(a(e,.82,1));f=c?0:n(o)*.28*this.height;let l=1-.14*i-.1*s+.08*n(o);r.scale.y*=l,r.scale.x*=1/Math.sqrt(l),r.scale.z*=1/Math.sqrt(l),e>=1&&(this.reaction=null)}else{let e=t.t/.6;r.rotation.z=Math.sin(e*Math.PI*6)*.14*(1-e),e>=1&&(r.rotation.z=0,this.reaction=null)}}this.root.position.y=this.baseY+f}},Tu=Math.PI/180,Eu=class{camera=new gi(K.fov,1,.3,300);w=1;h=1;top=0;goal=null;cur={center:new z,yaw:0,pitch:30,dist:20};fits=new Map;probe=new gi;lag=.35;fov=null;setSize(e,t,n){this.w=Math.max(1,e),this.h=Math.max(1,t),this.top=Math.max(0,Math.min(n,t*.4)),this.fits.clear();let r=this.camera;r.fov=this.fov??K.fov,r.aspect=this.w/(this.h+this.top),r.setViewOffset(this.w,this.h+this.top,0,0,this.w,this.h),r.updateProjectionMatrix(),this.place()}setShot(e,t=!1){this.goal=e,t&&(this.cur.center.copy(e.center),this.cur.yaw=e.yaw,this.cur.pitch=e.pitch,this.cur.dist=this.fit(e),this.place())}refit(){this.fits.clear(),this.camera.fov!==(this.fov??K.fov)&&this.setSize(this.w,this.h,this.top)}update(e){let t=this.goal;if(!t)return;let n=1-Math.exp(-e/Math.max(.01,this.lag));this.cur.center.lerp(t.center,n),this.cur.yaw+=(t.yaw-this.cur.yaw)*n,this.cur.pitch+=(t.pitch-this.cur.pitch)*n,this.cur.dist+=(this.fit(t)-this.cur.dist)*n,this.place()}get yaw(){return this.cur.yaw}get moving(){let e=this.goal;return e?this.cur.center.distanceToSquared(e.center)>1e-4||Math.abs(e.yaw-this.cur.yaw)>.05||Math.abs(this.fit(e)-this.cur.dist)>.02:!1}place(){let{center:e,yaw:t,pitch:n,dist:r}=this.cur;this.camera.position.copy(e).add(Du(t,n,r)),this.camera.lookAt(e)}fit(e){let t=e.follow?0:e.yaw,n=`${e.half.x.toFixed(2)},${e.half.y.toFixed(2)},${e.half.z.toFixed(2)},${t.toFixed(2)},${e.pitch.toFixed(2)},${e.minDist},${e.maxDist}`,r=this.fits.get(n);if(r!==void 0)return r;let i=this.probe;i.fov=this.camera.fov,i.aspect=this.camera.aspect,i.updateProjectionMatrix();let a=(this.h-this.top)/(this.h+this.top)*.94,o=new z,s=n=>{i.position.copy(Du(t,e.pitch,n)),i.lookAt(0,0,0),i.updateMatrixWorld();for(let t of[-1,1])for(let n of[-1,1])for(let r of[-1,1])if(o.set(t*e.half.x,n*e.half.y,r*e.half.z).project(i),o.z>1||Math.abs(o.x)>.94||Math.abs(o.y)>a)return!1;return!0},c=e.minDist??2,l=e.maxDist??120;if(s(c))l=c;else for(let e=0;e<28;e++){let e=(c+l)/2;s(e)?l=e:c=e}return this.fits.set(n,l),l}};function Du(e,t,n){let r=e*Tu,i=t*Tu;return new z(Math.sin(r)*Math.cos(i),Math.sin(i),Math.cos(r)*Math.cos(i)).multiplyScalar(n)}var Ou=class{items=new Set;add(e){return this.items.add(e),e}dispose(){for(let e of this.items)e.dispose();this.items.clear()}},ku=5,Au=.55,ju=class{root=new U;ring;stars=[];ringMat=new Dr({color:q.hotpink,transparent:!0,depthWrite:!1});starMat=new Dr({color:q.gold,transparent:!0,depthWrite:!1});t=Au;constructor(e){e.add(this.ringMat),e.add(this.starMat),this.ring=new ei(e.add(new Da(.78,1,32)),this.ringMat),this.ring.rotation.x=-Math.PI/2,this.ring.renderOrder=2,this.root.add(this.ring);let t=e.add(new Ta(.05));for(let e=0;e<ku;e++){let e=new ei(t,this.starMat);this.stars.push(e),this.root.add(e)}this.root.visible=!1}show(e,t,n){this.root.position.set(e,t+.02,n),this.root.visible=!0,this.t=0}update(e){if(this.t>=Au)return;this.t+=e;let t=Math.min(1,this.t/Au),n=.12+.23*Math.sqrt(t);this.ring.scale.set(n,n,n),this.ringMat.opacity=1-t,this.starMat.opacity=1-t*t,this.stars.forEach((e,n)=>{let r=n/ku*Math.PI*2+.4,i=.1+.32*t;e.position.set(Math.cos(r)*i,.05+Math.sin(Math.PI*t)*.28,Math.sin(r)*i),e.rotation.y=t*6}),t>=1&&(this.root.visible=!1)}},Mu=new Mn,Nu=new At,Pu=new z,Fu=new z,Iu=new At().setFromAxisAngle(new z(1,0,0),-Math.PI/2),Lu=class{o;mesh;pool=[];next=0;live=0;constructor(e,t){this.o=e;let n=e.kind===`foam`?new Ji(.5,16):new wa(.5,0),r=new Dr({color:e.color??`#FFFFFF`,transparent:(e.opacity??1)<1,opacity:e.opacity??1,depthWrite:e.kind!==`foam`});e.kind===`foam`&&(r.polygonOffset=!0,r.polygonOffsetFactor=-2),this.mesh=t.add(new Fi(t.add(n),t.add(r),e.count)),this.mesh.instanceMatrix.setUsage(yt),this.mesh.frustumCulled=!1,this.mesh.renderOrder=+(e.kind===`foam`);for(let t=0;t<e.count;t++)this.pool.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,age:1,life:0,size:0});this.mesh.count=0}emit(e,t,n,r,i,a,o,s){let c=this.pool[this.next];this.next=(this.next+1)%this.pool.length,c.x=e,c.y=t,c.z=n,c.vx=r,c.vy=i,c.vz=a,c.age=0,c.life=o,c.size=s}burst(e,t,n,r,i,a,o=.22){for(let s=0;s<r;s++){let r=Math.random()*Math.PI*2,s=i*(.4+Math.random()*.6);this.emit(e,t,n,Math.cos(r)*s,a*(.6+Math.random()*.6),Math.sin(r)*s,.5+Math.random()*.4,o*(.6+Math.random()*.8))}}get busy(){return this.live>0}update(e){let t=this.o.kind===`foam`,n=0;for(let r of this.pool){if(r.age>=r.life||(r.age+=e,r.age>=r.life))continue;let i=r.age/r.life;r.x+=r.vx*e,r.z+=r.vz*e;let a;t?(r.vx*=Math.exp(-2*e),r.vz*=Math.exp(-2*e),a=r.size*Math.sqrt(Math.min(1,i*4))*(1-i*i),Nu.copy(Iu)):(r.vy-=14*e,r.y+=r.vy*e,r.y<0&&(r.age=r.life),a=r.size*(1-i),Nu.identity()),Mu.compose(Pu.set(r.x,r.y,r.z),Nu,Fu.set(a,a,a)),this.mesh.setMatrixAt(n++,Mu)}this.live=n,this.mesh.count=n,this.mesh.instanceMatrix.needsUpdate=!0}},Ru=`
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,zu=`
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uDash;
  uniform vec3 uHaze;
  uniform float uTime;
  uniform float uHazeNear;
  uniform float uHazeFar;
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
    col = mix(col, uHaze, smoothstep(uHazeNear, uHazeFar, dist));
    gl_FragColor = vec4(col, 1.0);
    // The colors are linear (like every material's): convert for the screen, as three's own materials do.
    #include <colorspace_fragment>
  }
`,Bu=class{mesh;mat;constructor(e,t){this.mat=t.add(new di({uniforms:{uDeep:{value:new H(e.deep)},uShallow:{value:new H(e.shallow)},uDash:{value:new H(`#FFFFFF`)},uHaze:{value:new H(e.haze)},uTime:{value:0},uHazeNear:{value:e.hazeNear},uHazeFar:{value:e.hazeFar}},vertexShader:Ru,fragmentShader:zu})),this.mesh=new ei(t.add(new Ea(e.size,e.size)),this.mat),this.mesh.rotation.x=-Math.PI/2}update(e){this.mat.uniforms.uTime.value=e}};function Vu(e,t,n){return .05*Math.sin(e*.21+n*1.3)+.04*Math.sin(t*.17-n*1.1)+.02*Math.sin((e-t)*.5+n*2.1)}var Y={...b,boingAt:e=>{let t=220+e*90;x(t,t*2.6,.32,.16,`sine`),x(t*1.5,t*3.4,.22,.05,`triangle`,.03)},rattle:()=>{for(let e=0;e<9;e++)S(.06,.12,`bandpass`,1800+e*120,2400,e*.11,3);x(160,260,1,.05,`sawtooth`)},jiggle:()=>{for(let e=0;e<4;e++)S(.05,.1,`bandpass`,2600-e*150,3200,e*.09,4);x(220,180,.08,.06,`square`,.02)},ding:()=>{x(1318,1310,1.6,.07,`sine`),x(2637,2630,1.1,.025,`sine`,.01)},beep:()=>[0,.18].forEach(e=>x(880,860,.12,.08,`square`,e)),toot:()=>[0,.2].forEach(e=>x(392,370,.16,.1,`triangle`,e)),meow:()=>x(620,380,.45,.1,`triangle`),tick:()=>[0,.25,.5,.75].forEach((e,t)=>x(t%2?1700:2100,1600,.04,.08,`square`,e)),whir:()=>S(1.2,.07,`bandpass`,500,1400,0,1.2),puff:()=>S(.25,.1,`lowpass`,700,250),putt:()=>{for(let e=0;e<6;e++)x(95+e*4,90,.06,.05,`sawtooth`,e*.08);S(.6,.03,`lowpass`,600,300)},tukkae:()=>{S(.12,.05,`bandpass`,900,600);for(let e=0;e<3;e++){let t=.25+e*.55;x(260,200,.07,.09,`square`,t),x(420,560,.2,.08,`sawtooth`,t+.12)}},phone:()=>[0,.1,.17,.31].forEach((e,t)=>x(t===3?1560:2200,t===3?2080:2150,.035,.05,`sine`,e)),babble:e=>{let t=3+Math.floor(Math.random()*2);for(let n=0;n<t;n++){let r=e*(1+(Math.random()-.3)*.35);x(r,r*(n===t-1?1.35:.9),.11,.09,`triangle`,n*.13)}},engine:e=>{x(70+70*e,60+50*e,.07,.025+.035*e,`sawtooth`),e>.55&&S(.06,.02*e,`bandpass`,900+600*e,700,0,2)},vroom:()=>{x(90,320,.6,.09,`sawtooth`),x(140,460,.5,.05,`square`,.05),S(.7,.06,`bandpass`,600,2400,0,1.5)},splash:(e=1)=>{S(.45*e,.12*e,`lowpass`,2400,300),x(220,90,.18,.05*e,`sine`)},paddle:()=>S(.18,.05,`bandpass`,1400,600,0,1.4),boink:()=>{x(700,1600,.12,.12,`triangle`),x(320,180,.2,.07,`square`,.02),S(.25,.05,`highpass`,3e3,1500,.05)},boop:()=>x(330,520,.18,.1,`sine`),shutter:()=>{S(.05,.15,`highpass`,4e3,2500),S(.08,.1,`bandpass`,1800,1200,.07,3)},horn:()=>[0,.45].forEach(e=>x(196,190,.38,.1,`sawtooth`,e))},Hu=18,Uu=e=>Math.atan2(Math.sin(e),Math.cos(e)),Wu=(e,t,n)=>Math.min(n,Math.max(t,e)),Gu=class{feel;x=0;z=0;heading=0;vx=0;vz=0;yawRate=0;y=0;vy=0;boostT=0;lock=null;target=null;mode=null;passing=!1;constructor(e){this.feel=e}place(e,t,n){this.x=e,this.z=t,this.heading=n,this.vx=this.vz=this.yawRate=this.y=this.vy=this.boostT=0,this.target=null,this.mode=null}get speed(){return this.vx*Math.sin(this.heading)+this.vz*Math.cos(this.heading)}get airborne(){return this.y>0||this.vy>0}get driven(){return this.mode!==null}get goal(){return this.mode?this.target:null}hold(e,t){this.target={x:e,z:t},this.mode=`hold`}goto(e,t,n=!1){this.target={x:e,z:t},this.mode=`goto`,this.passing=n}release(){this.mode===`hold`&&(this.mode=null)}stop(){this.mode=null}vroom(e=2){this.boostT=e}jump(e){this.airborne||(this.vy=e)}bounce(e,t,n=.45){let r=this.vx*e+this.vz*t;if(r>=0)return 0;if(this.vx-=(1+n)*r*e,this.vz-=(1+n)*r*t,this.lock===null){let n=-t,r=e,i=Math.sin(this.heading)*n+Math.cos(this.heading)*r,a=Math.atan2(n*Math.sign(i||1),r*Math.sign(i||1));this.heading+=Uu(a-this.heading)*.35}return-r}get roll(){return-Wu(this.yawRate/Math.max(.01,this.feel.turn),-1,1)*Wu(Math.abs(this.speed)/this.feel.top,0,1.4)*this.feel.lean}step(e){let t={},n=Math.max(1,Math.ceil(e/(1/120)));for(let r=0;r<n;r++){let r=this.substep(e/n);r!==void 0&&(t.landed=r)}return t}substep(e){let t=this.feel,n=Math.sin(this.heading),r=Math.cos(this.heading),i=this.vx*n+this.vz*r,a=this.vx*r-this.vz*n,o=null,s=0;if(this.mode&&this.target){let e=this.target.x-this.x,n=this.target.z-this.z,r=Math.hypot(e,n),i=Wu((r-t.near)/(t.far-t.near),0,1);s=Uu(Math.atan2(e,n)-(this.lock??this.heading)),this.mode===`goto`&&!this.passing&&r<t.near*.8?this.mode=null:this.lock!==null&&Math.abs(s)>Math.PI/2?(o=-t.top*.6*(.25+.75*i),s=0):o=this.mode===`hold`?t.top*(.15+.85*i):this.passing?t.top:t.top*Wu(r/(t.near*4),.2,1),o!==null&&o>0&&(o*=.65+.35*Math.max(0,Math.cos(s)))}if(this.boostT>0&&(this.boostT-=e,(o===null||o>=0)&&(o=Math.max(o??0,t.top*t.boost))),o===null?i*=Math.exp(-t.coast*e):i+=Wu(o-i,-t.accel*1.4*e,t.accel*(this.boostT>0?2.5:1)*e),this.lock!==null)this.heading+=Uu(this.lock-this.heading)*Math.min(1,e*6),this.yawRate=0;else{let n=Wu(Math.abs(i)/t.top,0,1),r=t.turn*(.5+.5*Math.min(1,n*1.4)),a=this.mode===`hold`?Math.sign(s)*Math.max(0,Math.abs(s)-t.dead):s,c=o===null?0:Wu(a*3,-r,r);this.yawRate+=(c-this.yawRate)*(1-Math.exp(-e*(o===null?3:6))),this.heading+=this.yawRate*e}a*=Math.exp(-t.grip*e);let c=Math.sin(this.heading),l=Math.cos(this.heading);if(this.vx=c*i+l*a,this.vz=l*i-c*a,this.x+=this.vx*e,this.z+=this.vz*e,(this.y>0||this.vy>0)&&(this.vy-=Hu*e,this.y+=this.vy*e,this.y<=0)){let e=-this.vy;return this.y=this.vy=0,e}}},Ku=`#FFD34D`,qu=`#FFF0B8`,Ju={top:2.6,boost:1.4,accel:1.8,coast:.6,turn:.9,grip:1.1,near:1.5,far:9,dead:.15,lean:.1};function Yu(e){let t=new U,n=new U;t.add(n);let r=4.4;n.add(eu($l([J.capsule(.46,3.4800000000000004,Ku,{at:[0,.12,0],rot:[Math.PI/2,0,0],scale:[1,1,.55]}),J.box(.7,.05,3.1000000000000005,qu,{at:[0,.34,0]}),J.box(.84,.06,.12,q.hotpink,{at:[0,.36,r/2-.55]}),J.box(.84,.06,.12,q.hotpink,{at:[0,.36,-4.4/2+.55]})]),e,2));let i=new U;i.position.set(0,1,1.15),i.add(eu($l([J.cyl(.03,.03,2.2,`#8C6A55`,{rot:[0,0,Math.PI/2]}),...[-1,1].map(e=>J.rbox(.42,.04,.2,.02,q.mint,{at:[e*1.1,0,0]}))]),e,1.5)),n.add(i);let a=0;return{root:t,body:n,seats:{nick:{x:0,y:.34,z:1.15},ji:{x:0,y:.34,z:.05},kaylee:{x:0,y:.34,z:-1.1}},hull:{at:[1.4,0,-1.4],r:.5},feel:Ju,stern:-4.4/2,bow:r/2,animate(e,t,n,r){a+=r*(1.2+3.2*Math.min(1,Math.abs(t))),i.rotation.z=Math.sin(a)*.55+e*.2,i.rotation.x=Math.cos(a)*.25}}}var Xu=`#E6A375`,Zu=`#F6D3AE`,Qu=`#A3AAC4`,$u=`#5E5468`,ed={top:9,boost:1.75,accel:5,coast:.42,turn:1.35,grip:2.2,near:3,far:26,dead:.2,lean:.16};function td(e){let t=new U,n=new U;t.add(n);let r=6.4,i=[J.rbox(1.3,.55,r,.25,Xu,{at:[0,.2,0]}),J.box(1.36,.1,5.800000000000001,q.hotpink,{at:[0,.43,-.1]}),J.box(1.1,.06,5.2,Zu,{at:[0,.46,-.2]}),J.rbox(.9,.4,1.3,.18,Xu,{at:[0,.48,r/2-.25],rot:[-.45,0,0]}),J.rbox(.42,.34,1.1,.15,Xu,{at:[0,.92,3.45],rot:[-.9,0,0]}),J.cyl(.07,.09,.7,Xu,{at:[0,1.32,3.75],rot:[-.35,0,0]}),...[.9,-.5].map(e=>J.box(1.2,.08,.36,Zu,{at:[0,.5,e]})),J.cyl(.08,.1,.4,$u,{at:[0,.6,-2.85]})];n.add(eu($l(i),e,2));let a=new U;a.position.set(0,.85,-2.85),a.add(eu($l([J.rbox(.5,.42,.68,.1,Qu,{at:[0,.1,.05]}),J.cyl(.1,.1,.12,q.ink,{at:[0,.36,.05]}),J.cyl(.035,.035,.9,$u,{at:[0,.18,.75],rot:[Math.PI/2-.25,0,0]}),J.sphere(.06,q.hotpink,{at:[0,.29,1.18]}),J.cyl(.05,.05,3.1,$u,{at:[0,-.32,-1.5],rot:[Math.PI/2-.26,0,0]})]),e,2));let o=new U;return o.position.set(0,-.72,-3),o.add(eu($l([J.box(.5,.08,.05,q.gold),J.box(.08,.5,.05,q.gold)]),e,1.5)),a.add(o),n.add(a),{root:t,body:n,seats:{nick:{x:0,y:.52,z:.9},ji:{x:0,y:.52,z:-.5},kaylee:{x:-.18,y:.42,z:-1.95,stand:!0}},hull:{at:[2.4,.4,-1.8],r:.85},feel:ed,stern:-6.4/2-2.7,bow:3.6,animate(e,t,n,r){a.rotation.y+=(-e*.45-a.rotation.y)*Math.min(1,r*8),a.rotation.x=.04*t,o.rotation.z+=r*(8+50*t),a.position.y=.85+Math.sin(n*60)*.006*(.4+t)}}}var nd={x:-2.2,z0:86,z1:110,w:3},rd={x:1.1,z:90,heading:Math.PI},id={x:0,z:62,heading:Math.PI},ad={x:95,z:-40,inner:16,outer:34,h:30},X={x:ad.x,half:1.55,z0:ad.z+37,z1:ad.z+15};function od(e){let t=(X.z0-e)/(X.z0-X.z1);return t<=0?3.4:t>=1?3.2:t<.45?3.4-t/.45*2.25:t<.8?1.15:1.15+(3.2-1.15)*((t-.8)/.2)}var sd={x:X.x,z:X.z0+3.6},cd={x:X.x,z:X.z0+2.2,heading:Math.PI},ld={x:X.x+4.6,z:X.z0+6.5,heading:.15},ud={x:X.x+1.5,z:X.z0+7.5,r:6},dd={x:-85,z:-110,r:2.6,top:5.2,h:21,buoys:14},fd={x:-112,z:-140,w:26,d:9},pd=Sd([dd.x-fd.x,dd.z-fd.z]),md={x:fd.x+pd[0]*7,z:fd.z+pd[1]*7,r:6},hd={x:-58,z:-80,heading:Math.atan2(dd.x+58,dd.z+80)},gd=[-1,1].map(e=>({x:fd.x-pd[0]*25+pd[1]*8*e,z:fd.z-pd[1]*25-pd[0]*8*e,r:9,h:46})),_d={x:-6,z:-20,rx:54,rz:40,period:56},vd={x:0,z:-40,r:205},yd=Td(),bd=Ed(),xd=Dd();function Sd([e,t]){let n=Math.hypot(e,t)||1;return[e/n,t/n]}function Cd(e){let t=e;return()=>((t=t*16807%2147483647)-1)/2147483646}function wd(e,t,n,r,i,a){let o=i-n,s=a-r,c=Math.max(0,Math.min(1,((e-n)*o+(t-r)*s)/(o*o+s*s||1)));return Math.hypot(e-(n+o*c),t-(r+s*c))}function Td(){let e=Cd(20261018),t=[],n=[[id.x,id.z,22],[nd.x,nd.z0,18],[ad.x,ad.z,ad.outer+16],[sd.x,sd.z,22],[dd.x,dd.z,dd.buoys+14],[fd.x,fd.z,26],[md.x,md.z,14]],r=[[[id.x,id.z],[sd.x,sd.z+6]],[[id.x,id.z],[md.x,md.z]],[[sd.x,sd.z],[md.x,md.z]]];for(let i=0;t.length<26&&i<4e3;i++){let i=(e()*2-1)*180,a=-200+e()*260,o=5+e()*8;if(Math.hypot(i-vd.x,a-vd.z)>vd.r-o-12||a>78||n.some(([e,t,n])=>Math.hypot(i-e,a-t)<n+o)||r.some(([e,t])=>wd(i,a,e[0],e[1],t[0],t[1])<o+9))continue;let s=Math.hypot((i-_d.x)/_d.rx,(a-_d.z)/_d.rz);Math.abs(s-1)<(o+10)/Math.min(_d.rx,_d.rz)||t.some(e=>Math.hypot(i-e.x,a-e.z)<o+e.r+10)||t.push({x:i,z:a,r:o,h:22+e()*34+o})}return t}function Ed(){let e=[];for(let[t,n]of[[21,17],[29,23]])for(let r=0;r<n;r++){let i=r/n*Math.PI*2,a=ad.x+Math.sin(i)*t,o=ad.z+Math.cos(i)*t,s=5.5;Math.abs(a-X.x)<s+X.half+.3&&o>ad.z||e.push({x:a,z:o,r:s,h:ad.h+r*7%5*1.6})}for(let t of[-1,1])for(let n=X.z1+1;n<=X.z0-.5;n+=3.5)e.push({x:X.x+t*(X.half+.3+3),z:n,r:3,h:ad.h-1});return e}function Dd(){let e=Cd(77),t=[];for(let n=0;n<46;n++){let r=n/46*Math.PI*2+e()*.1,i=270+e()*220,a=vd.x+Math.sin(r)*i,o=vd.z+Math.cos(r)*i;o>118||t.push({x:a,z:o,r:14+e()*26,h:50+e()*90})}return t}var Od=`#C3B8D2`,kd=`#8E829F`,Ad=`#6F6484`,jd=`#7CCB8C`,Md=`#5BB27A`,Nd=`#6A5F7C`,Pd=`#FBE7B8`,Fd=`#D59A6E`;function Id(e,t={}){let n=t.seg??12,r=e.h,i=Math.abs(Math.sin(e.x*12.9898+e.z*78.233)),a=1.4,o=[J.cyl(e.r*.86,e.r*.82,a,Ad,{at:[e.x,a/2-.2,e.z]},n),J.cyl(e.r*(.9+i*.2),e.r,r*.62,Od,{at:[e.x,a+r*.31,e.z]},n),J.cyl(e.r*(.75+i*.15),e.r*(.9+i*.2),r*.3,Od,{at:[e.x,a+r*.62+r*.15,e.z]},n),J.cyl(e.r*.45,e.r*.55,r*(.35+i*.3),kd,{at:[e.x+Math.cos(i*9)*e.r*.62,a+r*.25,e.z+Math.sin(i*9)*e.r*.62]},8)];if(t.cap!==!1){let t=a+r*.92;o.push(J.sphere(e.r*(.85+i*.2),jd,{at:[e.x,t,e.z],scale:[1,.42,1]},10),J.sphere(e.r*.45,Md,{at:[e.x+e.r*.35,t+e.r*.25,e.z-e.r*.2],scale:[1,.7,1]},8))}return o}function Ld(e){let t=new U;t.add(eu($l(yd.flatMap(e=>Id(e))),e,2.5)),t.add(eu($l(bd.flatMap(e=>Id(e))),e,2.5));let n=new z(pd[0],0,pd[1]),r=gd.map((t,r)=>{let i=eu($l(Id({...t,x:0,z:0})),e,2.5);return i.position.set(t.x,0,t.z),i.setRotationFromAxisAngle(n,(r===0?-1:1)*.12),i});t.add(...r);let i=new ei(e.add($l(xd.flatMap(e=>[J.cyl(e.r*.8,e.r,e.h,`#CFC8E2`,{at:[e.x,e.h/2,e.z]},8),J.sphere(e.r*.85,`#B9DCC6`,{at:[e.x,e.h,e.z],scale:[1,.35,1]},8)]))),Bl(`#ffffff`,!0));t.add(i);let a=[],o=X.half*2+.8,s=ad.h-2;for(let e=X.z1;e<X.z0;e+=.8){let t=od(e+.4);a.push(J.box(o,.6,.82,Nd,{at:[X.x,t+.3,e+.4]})),a.push(J.box(o,s-t-.6,.82,Od,{at:[X.x,t+.6+(s-t-.6)/2,e+.4]})),Math.round(e/.8)%2==0&&a.push(J.cone(.12,.45,Ad,{at:[X.x+e*7%1.6-.8,t-.2,e+.4],rot:[Math.PI,0,0]},6))}a.push(J.box(o+1,1.2,X.z0-X.z1,jd,{at:[X.x,s+.5,(X.z0+X.z1)/2]}));for(let e of[-1,1])a.push(J.box(.4,ad.h-2,X.z0-X.z1,Nd,{at:[X.x+e*(X.half+.2),(ad.h-2)/2,(X.z0+X.z1)/2]}));t.add(eu($l(a),e,2));let c=new ei(e.add(new Ea(X.half*2,X.z0-X.z1)),e.add(new Dr({color:`#3F5E66`,polygonOffset:!0,polygonOffsetFactor:-2})));c.rotation.x=-Math.PI/2,c.position.set(X.x,.01,(X.z0+X.z1)/2),t.add(c);let l=[];for(let e=0;e<14;e++){let t=e/14*Math.PI*2+.3;if(Math.abs(Math.sin(t))<.3&&Math.cos(t)>0)continue;let n=ad.x+Math.sin(t)*(ad.inner-1.5),r=ad.z+Math.cos(t)*(ad.inner-1.5);for(let e of[-1,0,1])l.push(J.cyl(.06,.08,1.4,`#8C6A55`,{at:[n+e*.35,.6,r],rot:[0,0,e*.35]},5));l.push(J.sphere(1.5,e%2?jd:Md,{at:[n,2.2,r],scale:[1,.7,1]},9))}l.push(J.cyl(5,5.5,.4,`#B98E6E`,{at:[ad.x-7,.05,ad.z-6],scale:[1,1,.6]},14)),t.add(eu($l(l),e,2));let u=dd;t.add(eu($l([J.cyl(u.r*.85,u.r*.8,1.4,Ad,{at:[u.x,.5,u.z]},12),J.cyl(u.r*1.25,u.r,u.h*.45,Od,{at:[u.x,1.2+u.h*.225,u.z]},12),J.cyl(u.top,u.r*1.25,u.h*.45,Od,{at:[u.x+.6,1.2+u.h*.675,u.z]},12),J.cyl(u.top*.5,u.top*.6,u.h*.4,kd,{at:[u.x-1.6,1.2+u.h*.7,u.z+1],rot:[0,0,.08]},8),J.sphere(u.top*.95,jd,{at:[u.x+.6,u.h+1.4,u.z],scale:[1,.4,1]},10),J.sphere(u.top*.5,Md,{at:[u.x-.8,u.h+2.4,u.z+.6],scale:[1,.8,1]},8)]),e,2.5));let d=new U,f=[];for(let e=0;e<24;e++){let t=e/24*Math.PI*2,n=u.x+Math.sin(t)*u.buoys,r=u.z+Math.cos(t)*u.buoys;f.push(J.sphere(.42,e%2?`#FFFFFF`:`#F0646E`,{at:[n,.18,r]},10)),f.push(J.cyl(.04,.04,.5,q.ink,{at:[n,.75,r]},5))}d.add(eu($l(f),e,1.5)),t.add(d);let p=eu($l([J.rbox(fd.w,.5,fd.d,.2,Pd,{at:[0,.05,0]}),J.rbox(fd.w*.7,.6,fd.d*.6,.2,Pd,{at:[0,.2,-fd.d*.25]})]),e,2);p.position.set(fd.x,0,fd.z),p.rotation.y=Math.atan2(pd[0],pd[1]),t.add(p);let m=[J.box(700,1.2,160,Pd,{at:[0,.2,188]}),J.box(nd.w,.16,nd.z1-nd.z0,Fd,{at:[nd.x,.95,(nd.z0+nd.z1)/2]})];for(let e=nd.z0+.5;e<nd.z1;e+=3)for(let t of[-1,1])m.push(J.cyl(.13,.13,1.4,`#8C6A55`,{at:[nd.x+t*(nd.w/2-.2),.3,e]},6));for(let e=0;e<18;e++){let t=-170+e*20+e*37%9,n=118+e*53%14;if(m.push(J.sphere(14+e%3*4,e%2?jd:Md,{at:[t,0,n+18],scale:[1,.5,.8]},10)),e%2==0){m.push(J.cyl(.25,.32,6,`#B08463`,{at:[t+6,3.4,n-4],rot:[0,0,.12]},6));for(let e=0;e<4;e++)m.push(J.cone(.9,3.4,Md,{at:[t+6.7+Math.sin(e*1.57)*1.2,6.4,n-4+Math.cos(e*1.57)*1.2],rot:[Math.cos(e*1.57)*1.3,0,-Math.sin(e*1.57)*1.3]},5))}}m.push(J.rbox(2.6,.3,3.4,.1,Fd,{at:[sd.x+2,.12,sd.z+.6]})),t.add(eu($l(m),e,2));let h=(t,n,r)=>{let i=new U,a=new ei(e.add(new Yi(r*.55,r*.7,26,20,1,!0)),e.add(new Dr({color:q.gold,transparent:!0,opacity:.22,depthWrite:!1})));a.position.y=13;let o=new ei(e.add(new Da(r*.75,r,32)),e.add(new Dr({color:q.gold,transparent:!0,opacity:.7,depthWrite:!1})));return o.rotation.x=-Math.PI/2,o.position.y=.04,i.add(a,o),i.position.set(t,0,n),i},g={cave:h(ud.x,ud.z,ud.r*.7),beach:h(md.x,md.z,md.r*.7)};return t.add(g.cave,g.beach),{root:t,buoys:d,glows:g}}var Rd=13,zd=class{root=new U;x=0;z=0;heading=0;ridges=[];lastRidge=-1;lastFoam=-1;bob=0;constructor(e){let t=eu($l([J.rbox(4,1.4,Rd,.5,`#FFFFFF`,{at:[0,.5,0]}),J.box(4.08,.3,12,q.lavenderDark,{at:[0,.75,0]}),J.rbox(2.4,1.5,3,.4,`#FFFFFF`,{at:[0,1.8,Rd/2-1.6],rot:[-.25,0,0]}),J.rbox(3.2,1.6,6.5,.3,`#EAF6FF`,{at:[0,2,-1.2]}),J.box(3.5,.18,7,q.sky,{at:[0,2.9,-1.2]}),...[-2.6,-.8,1].flatMap(e=>[-1,1].map(t=>J.sphere(.3,[`#FFC2A8`,`#FBEA9A`,`#D9CCFF`][Math.abs(Math.round(e))%3],{at:[t*1.25,2.35,e-1.2]},8)))]),e,2);this.root.add(t),this.root.userData.pick=`tour`}circles(){let e=Math.sin(this.heading),t=Math.cos(this.heading);return[-4.5,0,4.5].map(n=>[this.x+e*n,this.z+t*n,2.3])}update(e,t,n){let r=e/_d.period*Math.PI*2,i=_d.x+Math.sin(r)*_d.rx,a=_d.z+Math.cos(r)*_d.rz;this.heading=Math.atan2(Math.cos(r)*_d.rx,-Math.sin(r)*_d.rz),this.x=i,this.z=a,this.bob+=t,this.root.position.set(i,Math.sin(this.bob*1.4)*.06,a),this.root.rotation.set(0,this.heading,Math.sin(this.bob*1.1)*.02);let o=Math.sin(this.heading),s=Math.cos(this.heading),c=i-Rd/2*o,l=a-Rd/2*s;if(e-this.lastFoam>.14){this.lastFoam=e;for(let e of[-1,1])n.emit(c+s*e*1.6,.03,l-o*e*1.6,s*e*1.3-o*.4,0,-o*e*1.3-s*.4,7.2,2.6)}if(e-this.lastRidge>.4)for(this.lastRidge=e,this.ridges.push({x:c,z:l,dx:o,dz:s,t:e});this.ridges.length&&e-this.ridges[0].t>9;)this.ridges.shift()}},Bd={control:E(`drive`)===`grab`?`grab`:`water`,fov:50,camPitch:18,camSide:12,camLag:.8,camAhead:6,camWide:6,camDeep:6.5},Vd=[{id:`boat`,label:`Boat`,kind:`thing`},{id:`family:kaylee`,label:`Kaylee`,kind:`family`},{id:`family:ji`,label:`Mommy`,kind:`family`},{id:`family:nick`,label:`Daddy`,kind:`family`},{id:`glow:cave`,label:`The cave`,kind:`thing`},{id:`glow:beach`,label:`The Nail Island beach`,kind:`thing`},{id:`tour`,label:`Tour boat`,kind:`thing`}],Hd=Math.PI/180,Ud=e=>Math.atan2(Math.sin(e),Math.cos(e)),Wd=e=>((e+180)%360+360)%360-180,Gd=new z,Kd=new z,qd=1.09,Jd=8,Yd=class{renderer;events;scene=new Ti;rig=new Eu;bag=new Ou;lights=Vl(this.scene);water;scenery;tour;foam;spray;dust;marker;rides;using=`longtail`;riders;hops=[];glide=null;phase=`drive`;section;boardT=0;caveArmed=!0;beachArmed=!0;beachPose=null;finger=null;route=[];raycaster=new vo;plane=new zi(new z(0,1,0),0);anchorEls=new Map;hintEl=null;w=1;h=1;time=0;lastTouch=0;camHeading=0;ashore=!1;engineT=0;paddleT=0;jumpCool=0;bonkCool=0;buoyCool=0;counts={bonks:0,buoys:0,jumps:0,vrooms:0,photos:0,roof:{kaylee:0,ji:0,nick:0}};stats={fps:0,p95:0,calls:0,tris:0};quiet=!0;constructor(e,t,n){this.renderer=e,this.events=n;let{scene:r,bag:i}=this,a=`#DCEFFB`;r.background=new H(q.sky),r.fog=new wi(a,150,560),Rl(),this.rig.fov=Bd.fov,this.rig.camera.far=700,this.water=new Bu({size:1600,deep:`#5FC7B4`,shallow:`#78D4C1`,haze:a,hazeNear:120,hazeFar:520},i),this.scenery=Ld(i),this.tour=new zd(i),this.foam=new Lu({kind:`foam`,count:480,opacity:.88},i),this.spray=new Lu({kind:`spray`,count:280},i),this.dust=new Lu({kind:`spray`,count:60,color:`#D3C7E2`},i),this.marker=new ju(i),r.add(this.water.mesh,this.scenery.root,this.tour.root,this.foam.mesh,this.spray.mesh,this.dust.mesh,this.marker.root);let o=e=>({v:e,d:new Gu(e.feel),roll:{x:0,v:0},pitch:{x:0,v:0},squash:1,travelled:0});this.rides={longtail:o(td(i)),canoe:o(Yu(i))};for(let e of Object.values(this.rides))e.v.root.userData.pick=`boat`,r.add(e.v.root);let s=new bu(i),c=e=>new wu(xu.find(t=>t.id===e),i);this.riders=[{id:`kaylee`,char:s,height:s.height,lying:!1,under:!1,upT:0,warn:!1},...[`ji`,`nick`].map(e=>{let t=c(e);return{id:e,char:t,height:t.height,lying:!1,under:!1,upT:0,warn:!1}})],this.section=t,this.begin(t),this.quiet=!1}get ride(){return this.rides[this.using]}begin(e){let{longtail:t,canoe:n}=this.rides;if(t.d.place(rd.x,rd.z,rd.heading),n.d.place(cd.x,cd.z,cd.heading),e===`pier`){this.phase=`board`;let e=[[`nick`,nd.x+.4,rd.z-.6],[`ji`,nd.x-.5,rd.z+1.2],[`kaylee`,nd.x+.6,rd.z+2.4]];for(let[t,n,r]of e){let e=this.rider(t);this.scene.add(e.char.root),this.put(e,n,1.03,r,`stand`,90)}}else if(e===`cave`)t.d.place(ld.x,ld.z,ld.heading),this.using=`canoe`,this.caveArmed=!1,this.seatAll(n);else{let n=e===`nail`?hd:id;t.d.place(n.x,n.z,n.heading),this.seatAll(t)}for(let e of Object.values(this.rides))this.poseRide(e,0,0);this.camHeading=this.ride.d.heading,this.rig.setShot(this.shot(),!0)}rider(e){return this.riders.find(t=>t.id===e)}seatAll(e){for(let t of this.riders){t.lying=t.under=!1,e.v.body.add(t.char.root);let n=this.seatPos(e.v,t,this.poseIn(e.v,t));this.put(t,n.x,n.y,n.z,this.poseIn(e.v,t))}}poseIn(e,t){return t.lying?`lie`:e.seats[t.id].stand?`stand`:`sit`}seatPos(e,t,n){let r=e.seats[t.id],i=!(t.char instanceof bu),a=n===`lie`?r.y-.2:n===`sit`&&i?r.y-.1*t.height:r.y;return new z(r.x,a,r.z)}put(e,t,n,r,i,a=0){e.char instanceof bu?(e.char.place(t,n,r,a),e.char.setPose(i)):e.char.place(t,n,r,a,i)}setSection(e){e!==this.section&&(this.section=e,this.quiet||this.events.onSection(e))}setAnchorElements(e){this.anchorEls=e}setHintElement(e){this.hintEl=e}get canDrive(){return this.phase===`drive`}pointerDown(e,t,n){this.lastTouch=this.time;let r=n??this.pick(e,t),i=r===`boat`||!!r?.startsWith(`family:`);this.finger={x:e,y:t,onBoat:i,steering:this.canDrive&&Bd.control===`water`&&r!==`boat`&&!r?.startsWith(`glow:`)&&r!==`tour`}}pointerMove(e,t,n,r,i){let a=this.finger;i&&a&&(a.x=e,a.y=t,!a.steering&&this.canDrive&&Math.hypot(e-n,t-r)>12&&(Bd.control===`water`||a.onBoat)&&(a.steering=!0))}pointerUp(){this.finger?.steering&&this.ride.d.release(),this.finger=null}tap(e,t,n){this.lastTouch=this.time;let r=n??this.pick(e,t);if(this.phase===`board`){this.boardT=Math.max(this.boardT,1);return}if(this.phase===`swap`)return;if(this.phase===`beach`){r===`boat`?this.reboard():r?.startsWith(`family:`)&&this.cheer(this.rider(r.slice(7)));return}if(r===`boat`)return this.vroom();if(r?.startsWith(`family:`))return this.poke(this.rider(r.slice(7)));if(r===`glow:cave`)return this.driveTo(ud.x,ud.z);if(r===`glow:beach`)return this.driveTo(md.x,md.z);if(r===`tour`){Y.horn(),this.rider(`nick`).char.react(`wave`);return}let i=this.aim(e,t);i&&this.driveTo(i.x,i.z)}aim(e,t){if(this.using!==`canoe`||this.funnel()!==`in`)return this.waterPoint(e,t);let n=this.ride.d,r=(1-Gd.set(n.x,.3,n.z).project(this.rig.camera).y)/2*this.h-t;return new z(X.x,0,n.z+Math.cos(n.lock??n.heading)*(r/this.h)*40)}driveTo(e,t){let[n,r]=this.steerPoint(e,t),i=this.ride.d,a=[...this.using===`longtail`?this.around(i.x,i.z,n,r):[],{x:n,z:r}],o=a.shift();i.goto(o.x,o.z,a.length>0),this.route=a,this.marker.show(e,0,t)}around(e,t,n,r){let a=[[dd.x,dd.z,dd.buoys+5],[ad.x,ad.z,ad.outer+5],...yd.map(e=>[e.x,e.z,e.r+5]),...gd.map(e=>[e.x,e.z,e.r+5])],o=[],s=e,c=t;for(let e=0;e<4;e++){let e=n-s,t=r-c,l=Math.hypot(e,t)||1,u=null;for(let[o,d,f]of a){if(Math.hypot(o-s,d-c)<f||Math.hypot(o-n,d-r)<f)continue;let a=i(((o-s)*e+(d-c)*t)/(l*l),0,1),p=s+e*a,m=c+t*a;Math.hypot(p-o,m-d)<f&&(!u||a<u.t)&&(u={t:a,ox:o,oz:d,r:f,px:p,pz:m})}if(!u)break;let d=u.px-u.ox,f=u.pz-u.oz,p=Math.hypot(d,f);p<.01?(d=-t/l,f=e/l):(d/=p,f/=p),s=u.ox+d*u.r*1.2,c=u.oz+f*u.r*1.2,o.push({x:s,z:c})}return o}ndc(e,t){return new R(e/this.w*2-1,-(t/this.h)*2+1)}pick(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.rig.camera);let n=[this.ride.v.root,this.tour.root];for(let e of this.raycaster.intersectObjects(n,!0)){let t=e.object;for(;t&&t.userData.pick===void 0;)t=t.parent;let n=t?.userData.pick;if(n)return n===`kaylee`?`family:kaylee`:n}return null}waterPoint(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.rig.camera);let n=this.raycaster.ray,r=n.intersectPlane(this.plane,new z),i=this.rig.camera.position;if(r&&Math.hypot(r.x-i.x,r.z-i.z)<140)return r;let a=Gd.set(n.direction.x,0,n.direction.z);return a.lengthSq()<1e-6?null:(a.normalize(),new z(i.x+a.x*140,0,i.z+a.z*140))}steerPoint(e,t){return this.using===`canoe`&&this.funnel()!==null?[X.x,t]:[e,t]}vroom(){let e=this.ride;this.using===`canoe`?(e.d.vroom(1.1),Y.paddle(),setTimeout(Y.paddle,160),this.splashAt(e,e.v.bow*.3,6)):(e.d.vroom(2),Y.vroom(),e.pitch.v-=1.6,this.splashAt(e,e.v.stern,14),this.rider(`ji`).char.react(`wiggle`)),this.counts.vrooms++}poke(e){if(this.using===`canoe`){e.lying=!e.lying,e.under=!1,e.upT=0,this.sitOrLie(e),Y.pop();return}this.cheer(e)}sitOrLie(e){let t=this.ride.v,n=this.poseIn(t,e),r=this.seatPos(t,e,n);this.put(e,r.x,r.y,r.z,n)}cheer(e){e.char.react(`hop`),e.char.react(`wave`),Y.boing()}snap(){this.phase===`beach`&&(this.lastTouch=this.time,Y.shutter(),this.events.onFlash(),this.counts.photos++,this.riders.forEach((e,t)=>setTimeout(()=>e.char.react(`hop`),120+t*90)))}hop(e,t,n,r,i,a,o){this.hops.push({r:e,parent:t,to:n,pose:r,face:i,delay:a,t:0,dur:.42,arc:.7,done:o})}updateHops(e){for(let t of[...this.hops]){if(t.delay>0){t.delay-=e;continue}if(!t.from){this.scene.updateMatrixWorld();let e=t.r.char.root;t.parent.attach(e),e.rotation.set(0,e.rotation.y,0),e.scale.set(1,1,1),t.from=e.position.clone(),Y.boing()}t.t+=e/t.dur;let r=Math.min(1,t.t);Gd.lerpVectors(t.from,t.to,r),Gd.y+=n(r)*t.arc,this.put(t.r,Gd.x,Gd.y,Gd.z,r<1?`stand`:t.pose,t.face),r>=1&&(this.hops.splice(this.hops.indexOf(t),1),t.r.char.react(`wiggle`),Y.thump(),t.done?.())}}glideTo(e,t,n,r){e.d.stop(),this.glide={ride:e,from:{x:e.d.x,z:e.d.z,h:e.d.heading},to:{...t,h:e.d.heading+Ud(t.h-e.d.heading)},t:0,dur:n,done:r}}updateGlide(e){let t=this.glide;if(!t)return;t.t+=e/t.dur;let n=Math.min(1,t.t),r=n*n*(3-2*n);t.ride.d.place(t.from.x+(t.to.x-t.from.x)*r,t.from.z+(t.to.z-t.from.z)*r,t.from.h+(t.to.h-t.from.h)*r),n>=1&&(this.glide=null,t.done())}toCanoe(){this.phase=`swap`;let{longtail:e,canoe:t}=this.rides;this.glideTo(e,{x:ld.x,z:ld.z,h:ld.heading},.9,()=>{this.riders.forEach((e,n)=>{e.lying=e.under=!1,this.hop(e,t.v.body,this.seatPos(t.v,e,`sit`),`sit`,0,n*.28,n===2?()=>this.swapped(`canoe`):void 0)})})}toLongtail(){this.phase=`swap`;let{longtail:e,canoe:t}=this.rides;this.glideTo(t,{x:cd.x,z:cd.z,h:cd.heading},.8,()=>{this.riders.forEach((t,n)=>{t.lying=t.under=!1;let r=this.poseIn(e.v,t);this.hop(t,e.v.body,this.seatPos(e.v,t,r),r,0,n*.28,n===2?()=>this.swapped(`longtail`):void 0)})})}swapped(e){this.using=e,this.phase=`drive`,this.caveArmed=!1,this.camHeading=this.ride.d.heading,this.setSection(e===`canoe`?`cave`:`bay`)}land(){this.phase=`swap`;let e=this.rides.longtail,[t,n]=pd,r=n,a=-t,o=i((e.d.x-fd.x)*r+(e.d.z-fd.z)*a,-6,6),s=Math.atan2(-t,-n),c=4.3,l=fd.x+r*o+t*(c+e.v.bow-1.2),u=fd.z+a*o+n*(c+e.v.bow-1.2);this.beachPose={x:l,z:u,h:s,along:o},this.ashore=!0,Y.splash(.6),this.glideTo(e,{x:l,z:u,h:s},.9,()=>{let e=(e,i)=>new z(fd.x+r*(o+e)+t*i,.32,fd.z+a*(o+e)+n*i);[[`kaylee`,e(0,.3)],[`ji`,e(-1.25,1.3)],[`nick`,e(1.3,1.25)]].forEach(([e,t],n)=>{let r=this.rider(e);r.lying=r.under=!1,this.hop(r,this.scene,t,`stand`,s/Hd,n*.25,n===2?()=>this.landed():void 0)})})}landed(){this.phase=`beach`;for(let e of this.riders)this.cheer(e);this.events.onLanded(!0)}reboard(){let e=this.rides.longtail,t=this.beachPose;t&&(this.phase=`swap`,this.events.onLanded(!1),this.riders.forEach((n,r)=>{let i=this.poseIn(e.v,n);this.hop(n,e.v.body,this.seatPos(e.v,n,i),i,0,r*.2,r===2?()=>{this.ashore=!1,this.glideTo(e,{x:t.x+pd[0]*8,z:t.z+pd[1]*8,h:t.h+Math.PI},1.4,()=>{this.phase=`drive`,this.beachArmed=!1,this.camHeading=e.d.heading})}:void 0)}))}setSize(e,t,n){this.w=e,this.h=t,this.rig.setSize(e,t,n),Ul(e,t),this.rig.setShot(this.shot(),!0)}retune(){this.rig.fov=Bd.fov,Rl(),Ul(this.w,this.h),this.rig.refit()}funnel(){let e=this.rides.canoe.d,t=Math.abs(e.x-X.x);return t<X.half+.6&&e.z<=X.z0+.3&&e.z>=X.z1-.3?`in`:t<6&&e.z>X.z0&&e.z<X.z0+7?`mouth`:t<6&&e.z<X.z1&&e.z>X.z1-7?`inner`:null}where(){if(this.using!==`canoe`)return`open`;let e=this.rides.canoe.d;return this.funnel()===`in`?`tunnel`:Math.hypot(e.x-ad.x,e.z-ad.z)<ad.inner?`hong`:`open`}get calm(){let e=this.ride.d;return Math.abs(e.speed)<.05&&!e.airborne&&!this.hops.length&&!this.glide&&!this.finger&&!this.foam.busy&&!this.spray.busy&&!this.rig.moving&&this.phase!==`board`}update(e){this.time+=e;let t=this.time,n=this.ride,r=n.d;this.phase===`board`&&this.updateBoarding(e),this.updateHops(e),this.updateGlide(e);let i=r.goal;if(this.route.length&&i&&Math.hypot(r.x-i.x,r.z-i.z)<9){let e=this.route.shift();r.goto(e.x,e.z,this.route.length>0)}if(this.canDrive&&this.finger?.steering){this.route=[];let e=this.aim(this.finger.x,this.finger.y);if(e){let[t,n]=this.steerPoint(e.x,e.z);r.hold(t,n)}}let a={x:r.x,z:r.z};if(!this.glide){let t=r.step(e);t.landed!==void 0&&t.landed>1.2&&this.landSplash(n,t.landed),this.using===`canoe`&&this.canDrive&&this.canoeRules(e),this.collide(n)}n.travelled+=Math.hypot(r.x-a.x,r.z-a.z),this.jumpCool-=e,this.bonkCool-=e,this.buoyCool-=e,this.using===`longtail`&&this.canDrive&&(this.wakeJumps(),this.stops()),this.using===`canoe`&&this.canDrive&&this.roof(e);for(let n of Object.values(this.rides))this.poseRide(n,e,t);this.trail(n,e);for(let n of this.riders){let i=r.goal;i&&this.phase===`drive`?n.char.lookAt(i.x,1,i.z):n.char.lookAway(),n.char.update(e,t)}this.tour.update(t,e,this.foam),this.water.update(t),this.foam.update(e),this.spray.update(e),this.dust.update(e),this.marker.update(e);let o=this.using===`longtail`&&this.phase!==`beach`;this.scenery.glows.cave.visible=o&&this.caveArmed,this.scenery.glows.beach.visible=o&&this.beachArmed;for(let e of[this.scenery.glows.cave,this.scenery.glows.beach])e.scale.setScalar(1+Math.sin(t*2.2)*.04);this.scenery.buoys.position.y=Math.sin(t*1.6)*.05,this.sounds(e),this.updateSection(),this.camHeading+=Ud(r.heading-this.camHeading)*(1-Math.exp(-e/Bd.camLag)),this.rig.setShot(this.shot()),this.rig.lag=this.where()===`hong`?.6:this.where()===`tunnel`?.25:.35,this.rig.update(e);let s=this.rig.camera,c=Gd.set(s.position.x-r.x,0,s.position.z-r.z).normalize();this.lights.follow(r.x,0,r.z),this.lights.sun.position.set(r.x+c.x*7-c.z*4,10,r.z+c.z*7+c.x*4)}updateBoarding(e){if(this.boardT+=e,this.boardT<1||this.hops.length||this.phase!==`board`||this.riders.some(e=>e.char.root.parent===this.rides.longtail.v.body))return;let t=this.rides.longtail;[`nick`,`ji`,`kaylee`].forEach((e,n)=>{let r=this.rider(e),i=this.poseIn(t.v,r);this.hop(r,t.v.body,this.seatPos(t.v,r,i),i,0,n*.55,()=>{t.roll.v+=n%2?-2.2:2.6,t.squash=0,n===2&&(this.phase=`drive`)})})}canoeRules(e){let t=this.rides.canoe.d,n=this.funnel();if(n===`in`){t.lock===null&&(t.lock=Math.abs(Ud(t.heading-Math.PI))<Math.PI/2?Math.PI:0);let e=X.half-.5,n=t.x-X.x;Math.abs(n)>e&&(t.x=X.x+Math.sign(n)*e,t.bounce(-Math.sign(n),0,.2))}else{t.lock=null;let r=Math.min(1,e*2.5),i=n===`mouth`?Math.PI:n===`inner`?0:null;i!==null&&Math.abs(Ud(t.heading-i))<1.3&&(t.x+=(X.x-t.x)*r,t.heading+=Ud(i-t.heading)*r)}this.where()===`open`&&n!==`mouth`&&(t.z>X.z0+7||Math.abs(t.x-X.x)>7)&&t.z>ad.z&&this.toLongtail()}roof(e){let t=this.rides.canoe,n=t.d,r=Math.abs(n.x-X.x)<X.half+1.5;for(let i of this.riders){let a=t.v.seats[i.id],o=n.z+Math.cos(n.heading)*a.z,s=r?od(o):99,c=a.y+qd*i.height,l=r?od(o+Math.cos(n.heading)*Math.sign(n.speed||1)*2.5):99;i.warn=!i.lying&&l<c,i.lying&&s<c&&(i.under=!0),!i.lying&&c>s?(i.lying=!0,i.under=!0,i.upT=0,this.counts.roof[i.id]++,i.char.react(`wiggle`),this.sitOrLie(i),Y.boink(),n.vx*=.4,n.vz*=.4,this.dust.burst(n.x,s-.05,o,10,1.2,-.5,.14),i.id===`nick`&&this.rider(`ji`).char.react(`hop`)):i.lying&&i.under&&(i.upT=s>c+.4?i.upT+e:0,i.upT>.9&&(i.lying=!1,i.under=!1,this.sitOrLie(i),i.char.react(`hop`)))}}collide(e){let t=e.d,n=e.v,r=Math.sin(t.heading),i=Math.cos(t.heading),a=this.circles();for(let o of n.hull.at){let s=t.x+r*o,c=t.z+i*o;for(let[r,i,o]of a){let a=s-r,l=c-i,u=o+n.hull.r,d=a*a+l*l;if(d>=u*u||d<1e-8)continue;let f=Math.sqrt(d),p=a/f,m=l/f;t.x+=p*(u-f),t.z+=m*(u-f);let h=t.bounce(p,m);h>1.2&&this.bonk(e,s-p*n.hull.r,c-m*n.hull.r,h)}if(this.using===`longtail`){let r=s-dd.x,i=c-dd.z,a=Math.hypot(r,i),l=dd.buoys+n.hull.r;a<l&&(t.x+=r/a*(l-a),t.z+=i/a*(l-a),t.bounce(r/a,i/a,.8)>.6&&this.buoyCool<=0&&(this.buoyCool=.4,this.counts.buoys++,Y.boop(),e.squash=.4,this.splashAt(e,o,5)))}if(c>106){t.z-=c-106;let n=t.bounce(0,-1);n>1.2&&this.bonk(e,s,106,n)}}let o=t.x-vd.x,s=t.z-vd.z,c=Math.hypot(o,s);c>vd.r&&(t.x-=o/c*(c-vd.r),t.z-=s/c*(c-vd.r),t.bounce(-o/c,-s/c,.6))}circles(){let e=this.ride.d,t=(t,n,r)=>Math.abs(t-e.x)<r+12&&Math.abs(n-e.z)<r+12,n=[];for(let e of yd)t(e.x,e.z,e.r)&&n.push([e.x,e.z,e.r]);for(let e of bd)t(e.x,e.z,e.r)&&n.push([e.x,e.z,e.r]);for(let e of gd)t(e.x,e.z,e.r)&&n.push([e.x,e.z,e.r]);t(dd.x,dd.z,dd.r)&&n.push([dd.x,dd.z,dd.r]);for(let e=nd.z0;e<=nd.z1;e+=2)t(nd.x,e,1.7)&&n.push([nd.x,e,1.7]);return this.using===`longtail`&&(n.push([X.x,X.z0+.5,2.6]),n.push(...this.tour.circles())),n}bonk(e,t,n,r){this.bonkCool>0||(this.bonkCool=.35,this.counts.bonks++,Y.boing(),e.squash=0,e.roll.v+=(Math.random()<.5?-1:1)*Math.min(3,r*.4),this.spray.burst(t,.3,n,Math.round(4+r*1.5),2+r*.3,3+r*.25,.2),this.riders.forEach((e,t)=>setTimeout(()=>e.char.react(`wiggle`),t*60)))}wakeJumps(){let e=this.rides.longtail.d;if(this.jumpCool>0||e.airborne)return;let t=this.time;for(let n of this.tour.ridges)if(!(t-n.t>9||Math.hypot(e.x-n.x,e.z-n.z)>2.6)&&!(Math.abs(e.vx*n.dz-e.vz*n.dx)<3)){e.jump(2.4+Math.abs(e.speed)*.22),this.jumpCool=1.2,this.counts.jumps++,Y.vroom(),this.splashAt(this.rides.longtail,0,10);return}}landSplash(e,t){let n=e.d;Y.splash(i(t/5,.5,1.4)),e.squash=0,e.pitch.v+=1.2;for(let e=0;e<10;e++){let t=e/10*Math.PI*2;this.foam.emit(n.x+Math.sin(t)*1.5,.03,n.z+Math.cos(t)*1.5,Math.sin(t)*2.5,0,Math.cos(t)*2.5,2.2,1.6)}this.spray.burst(n.x,.2,n.z,16,3.5,4,.24),this.rider(`ji`).char.react(`hop`),this.rider(`kaylee`).char.react(`hop`)}stops(){let e=this.rides.longtail.d,t=this.rides.longtail.v,n=e.x+Math.sin(e.heading)*t.bow,r=e.z+Math.cos(e.heading)*t.bow;if(!this.caveArmed&&Math.hypot(e.x-ud.x,e.z-ud.z)>ud.r+5&&(this.caveArmed=!0),!this.beachArmed&&Math.hypot(e.x-md.x,e.z-md.z)>md.r+9&&(this.beachArmed=!0),this.caveArmed&&Math.hypot(n-ud.x,r-ud.z)<ud.r)return this.toCanoe();let[i,a]=pd,o=(n-fd.x)*i+(r-fd.z)*a,s=(n-fd.x)*a-(r-fd.z)*i,c=o<fd.d/2+1&&o>-fd.d&&Math.abs(s)<fd.w/2;this.beachArmed&&(c||Math.hypot(n-md.x,r-md.z)<md.r)&&this.land()}updateSection(){if(this.phase===`swap`||this.phase===`board`)return;if(this.using===`canoe`)return this.setSection(`cave`);let e=this.rides.longtail.d,t=Math.hypot(e.x-dd.x,e.z-dd.z);if(this.phase===`beach`||t<52||this.section===`nail`&&t<80)return this.setSection(`nail`);this.section===`pier`&&Math.hypot(e.x-rd.x,e.z-rd.z)<25||this.setSection(`bay`)}poseRide(e,t,n){let r=e.d,a=e.v,o=r.speed/r.feel.top,s=(e,n,r,i)=>{e.v+=((n-e.x)*r-e.v*i)*t,e.x+=e.v*t};s(e.roll,0,60,5);let c=(r.boostT>0?.07:0)+.012*Math.max(0,o)+(r.airborne?i(r.vy*.025,-.1,.1):0);s(e.pitch,-c,40,7),e.squash=Math.min(1,e.squash+t/.45);let l=Vu(r.x,r.z,n)*(this.using===`canoe`&&this.where()===`tunnel`?.3:1);a.root.position.set(r.x,l+r.y,r.z),a.root.rotation.set(0,r.heading,0),a.body.rotation.set(e.pitch.x+Math.sin(n*1.3+r.x)*.012,0,r.roll+e.roll.x*.12+Math.sin(n*1.1+r.z)*.015);let u=e.squash<1?Math.cos(e.squash*Math.PI*3)*(1-e.squash)**2:0;a.body.scale.set(1+.08*u,1-.16*u,1+.04*u),a.animate(i(r.yawRate/r.feel.turn,-1,1),Math.min(1,Math.abs(o)),n,t)}trail(e,t){let n=e.d,r=e.v,i=Math.abs(n.speed),a=Math.sin(n.heading),o=Math.cos(n.heading);if(n.airborne||i<.5)return;let s=this.using===`canoe`,c=s?.6:.8;for(;e.travelled>c;){e.travelled-=c;let t=s?r.stern:-2.8;for(let e of[-1,1]){let r=(s?.35:.6)*e;this.foam.emit(n.x+a*t+o*r,.03,n.z+o*t-a*r,o*e*i*.12,0,-a*e*i*.12,s?1.6:3.6,s?.45:1.1+i*.08)}}if(s)return;let l=Math.max(0,i/r.feel.top-.4)+(n.boostT>0?.6:0),u=l*70*t;for(;u>0&&!(u<1&&Math.random()>u);){u--;let e=n.x+a*r.stern,t=n.z+o*r.stern,s=(Math.random()-.5)*1.5;this.spray.emit(e,.2,t,-a*(2+i*.25)+o*s,3+l*4+Math.random()*2,-o*(2+i*.25)-a*s,.7,.2+Math.random()*.15)}if(Math.abs(n.yawRate)>r.feel.turn*.6&&i>r.feel.top*.5&&Math.random()<t*20){let e=Math.sign(n.yawRate);this.spray.emit(n.x+a*2,.3,n.z+o*2,-o*e*3,2.5,a*e*3,.5,.2)}}splashAt(e,t,n){let r=e.d;this.spray.burst(r.x+Math.sin(r.heading)*t,.25,r.z+Math.cos(r.heading)*t,n,2.2,3.5,.22)}sounds(e){let t=this.ride.d,n=Math.min(1.4,Math.abs(t.speed)/t.feel.top);if(this.using===`longtail`){if(n<.04&&!t.driven)return;this.engineT+=e;let r=1/(3.5+10*n);this.engineT>r&&(this.engineT=0,Y.engine(Math.min(1,n)))}else n>.15&&(this.paddleT+=e*(.8+n*1.4),this.paddleT>1&&(this.paddleT=0,Y.paddle()))}shot(){let e=this.ride.d,t=e=>this.rig.yaw+Wd(e-this.rig.yaw),n=this.beachPose;if(this.ashore&&n){let[e,r]=pd,i=fd.x+r*n.along+e*.8,a=fd.z-e*n.along+r*.8,o=this.w<this.h;return{center:new z(i,o?2.6:2.2,a),half:new z(o?1.9:2.8,2.2,1),yaw:t(Math.atan2(i-dd.x,a-dd.z)/Hd),pitch:6,minDist:6,maxDist:10,follow:!0}}let r=t(this.camHeading/Hd+180),a=this.using===`canoe`?this.funnel():null;if(a===`in`||a===`mouth`){let t=4.6,n=Math.min(od(e.z-Math.cos(e.heading)*t)-.25,2.4),a=Math.asin(i((n-.35)/t,.05,.6))/Hd;return{center:new z(X.x,.35,e.z),half:new z(1,.5,1),yaw:r,pitch:a,minDist:t,maxDist:t,follow:!0}}if(this.where()===`hong`)return{center:new z(ad.x+(e.x-ad.x)*.3,0,ad.z+(e.z-ad.z)*.3),half:new z(13,2,13),yaw:r,pitch:76,minDist:30,maxDist:110,follow:!0};let o=this.using===`canoe`,s=i(Math.abs(e.speed)/e.feel.top,0,1.6),c=i((1-this.w/this.h)/.4,0,1),l=Math.round((o?1:1+.18*s)*(1-.3*c)*10)/10,u=o?2:Bd.camAhead*Math.min(1,.4+s),d=this.phase===`board`;return{center:new z(e.x+Math.sin(e.heading)*u-(d?1.2:0),d?1.2:1,e.z+Math.cos(e.heading)*u),half:o?new z(4.2*l,1.5,4.5):d?new z(5*l,2,5):new z(Bd.camWide*l,2.2,Bd.camDeep*l),yaw:r+Bd.camSide,pitch:o?26:Bd.camPitch,minDist:o?5:7,maxDist:90,follow:!0}}render(){let e=this.renderer;e.render(this.scene,this.rig.camera),this.stats.calls=e.info.render.calls,this.stats.tris=e.info.render.triangles}placeAnchors(){let e=this.rig.camera,t=Kd.set(1,0,0).applyQuaternion(e.quaternion),n=this.phase===`drive`,r=this.using===`longtail`;for(let[e,i]of this.anchorEls){let a=null,o=1,s=!1;if(e===`boat`&&(n||this.phase===`beach`))a=this.ride.v.root.getWorldPosition(Gd).setY(.5),o=r?2.2:1.2,this.phase===`beach`&&a.addScaledVector(Kd.set(Math.sin(this.ride.d.heading),0,Math.cos(this.ride.d.heading)),-2.6);else if(e.startsWith(`family:`)&&(n&&!r||this.phase===`beach`)){let t=this.rider(e.slice(7));a=t.char.root.getWorldPosition(Gd),a.y+=t.lying?.35:t.height*.75,o=t.height*.4,s=t.warn}else e===`glow:cave`&&n&&r&&this.caveArmed?(a=Gd.set(ud.x,3,ud.z),o=4):e===`glow:beach`&&n&&r&&this.beachArmed?(a=Gd.set(md.x,3,md.z),o=4):e===`tour`&&n&&r&&(a=Gd.set(this.tour.x,2,this.tour.z),o=4);let c=a?this.toScreen(a,o,t,e.startsWith(`family:`)?110:170):null;c&&(i.style.transform=`translate3d(${(c.x-c.size/2).toFixed(1)}px, ${(c.y-c.size/2).toFixed(1)}px, 0)`,i.style.width=i.style.height=`${c.size.toFixed(0)}px`,i.style.zIndex=String(c.z),i.style.boxShadow=s?`0 0 0 6px rgba(255,79,154,.6), 0 0 24px 8px rgba(255,200,61,.7)`:``);let l=c?``:`none`;i.style.display!==l&&(i.style.display=l)}this.placeHint(t)}toScreen(e,t,n,r=170){let a=this.rig.camera,o=e.clone().project(a);if(o.z>1||Math.abs(o.x)>1.05||Math.abs(o.y)>1.05)return null;let s=e.clone().addScaledVector(n,t).project(a);return{x:(o.x+1)/2*this.w,y:(1-o.y)/2*this.h,size:i(Math.abs(s.x-o.x)*this.w,64,r),z:Math.round((1-o.z)*1e4)}}placeHint(e){let t=this.hintEl;if(!t)return;let n=this.ride.d,r=this.time-this.lastTouch>Jd&&Math.abs(n.speed)<.6&&!this.finger,i=null;if(r&&this.phase===`beach`)i=this.ride.v.root.getWorldPosition(new z).setY(.6);else if(r&&this.phase===`drive`){let e=Bd.control===`grab`?0:this.using===`canoe`?4:10;i=new z(n.x+Math.sin(n.heading)*e,.3,n.z+Math.cos(n.heading)*e)}let a=i?this.toScreen(i,1,e):null;t.style.display=a?``:`none`,a&&(t.style.transform=`translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`)}qa(){let e=this.ride.d,t=e=>Math.round(e*100)/100;return{section:this.section,phase:this.phase,vehicle:this.using,where:this.where(),control:Bd.control,pos:[t(e.x),t(e.z)],heading:t(Ud(e.heading)),speed:t(e.speed),airborne:e.airborne,boost:e.boostT>0,goal:e.goal?[t(e.goal.x),t(e.goal.z)]:null,route:this.route.length,lying:Object.fromEntries(this.riders.map(e=>[e.id,e.lying])),...this.counts,roof:{...this.counts.roof}}}memory(){return{...this.renderer.info.memory}}dispose(){this.scene.clear(),this.bag.dispose()}},Xd=[[`top`,`top speed`,3,20,.5],[`boost`,`VROOM ×`,1,3,.05],[`accel`,`speed up`,1,15,.5],[`coast`,`coast drag`,.05,2,.05],[`turn`,`turn`,.3,3,.05],[`grip`,`grip (drift)`,.3,8,.1],[`far`,`finger far`,8,50,1],[`dead`,`straight zone`,0,.6,.02],[`lean`,`lean`,0,.5,.01]],Zd=[[`fov`,`lens (fov)`,25,75,1],[`camPitch`,`cam pitch`,5,70,1],[`camSide`,`cam side`,-40,40,1],[`camLag`,`cam lag`,.1,2.5,.05],[`camAhead`,`cam ahead`,0,20,.5],[`camWide`,`cam wide`,3,20,.5],[`camDeep`,`cam deep`,3,20,.5]];function Qd({bayRef:e}){let[,t]=(0,C.useState)(0),[n,r]=(0,C.useState)(!0);(0,C.useEffect)(()=>{let e=setInterval(()=>t(e=>e+1),400);return()=>clearInterval(e)},[]);let i=window.__thaiBoatQA?.(),a=i?.stats,o={display:`grid`,gridTemplateColumns:`92px 1fr 40px`,gap:6,alignItems:`center`};return(0,w.jsxs)(`div`,{style:{position:`absolute`,right:8,bottom:8,zIndex:50,background:`rgba(43,35,48,.82)`,color:`#fff`,borderRadius:12,padding:10,font:`12px/1.4 ui-monospace, monospace`,width:`min(330px, 92vw)`,maxHeight:`62vh`,overflow:`auto`,pointerEvents:`auto`},children:[(0,w.jsxs)(`div`,{onClick:()=>r(e=>!e),style:{cursor:`pointer`},children:[a?`${a.fps} fps · p95 ${a.p95} ms · ${a.calls} calls · ${Math.round((a.tris??0)/1e3)}k tris`:`starting…`,` `,n?`▾`:`▸`]}),n&&(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`div`,{style:{opacity:.8,margin:`4px 0`},children:i?`${i.section} · ${i.vehicle} · ${i.where} · ${i.speed} m/s · [${i.pos?.join(`, `)}]`:``}),(0,w.jsx)(`div`,{style:{display:`flex`,gap:6,margin:`6px 0`},children:[`water`,`grab`].map(e=>(0,w.jsx)(`button`,{onClick:()=>(Bd.control=e,t(e=>e+1)),style:{borderRadius:8,padding:`6px 10px`,fontWeight:700,background:Bd.control===e?`#FF4F9A`:`#fff`,color:Bd.control===e?`#fff`:`#2B2330`},children:e===`water`?`👆 finger on water`:`✊ grab the boat`},e))}),Xd.map(([e,n,r,i,a])=>(0,w.jsxs)(`label`,{style:o,children:[(0,w.jsx)(`span`,{children:n}),(0,w.jsx)(`input`,{type:`range`,min:r,max:i,step:a,value:ed[e],onChange:n=>(ed[e]=Number(n.target.value),t(e=>e+1))}),(0,w.jsx)(`span`,{children:ed[e]})]},e)),Zd.map(([n,r,i,a,s])=>(0,w.jsxs)(`label`,{style:o,children:[(0,w.jsx)(`span`,{children:r}),(0,w.jsx)(`input`,{type:`range`,min:i,max:a,step:s,value:Bd[n],onChange:r=>{Bd[n]=Number(r.target.value),e.current?.retune(),t(e=>e+1)}}),(0,w.jsx)(`span`,{children:Bd[n]})]},n)),(0,w.jsx)(`button`,{onClick:()=>void navigator.clipboard?.writeText(JSON.stringify({feel:ed,camera:Bd},null,2)).catch(()=>{}),style:{marginTop:6,borderRadius:8,padding:`4px 10px`},children:`Copy numbers`})]})]})}var $d=[{id:`bay`,icon:`🚤`,label:`The bay`},{id:`cave`,icon:`🛶`,label:`The cave`},{id:`nail`,icon:`🏝️`,label:`The Nail Island`}];function ef({section:e,onSection:t}){let[n,r]=(0,C.useState)(e);return(0,w.jsxs)(`div`,{style:{position:`absolute`,inset:0,background:`linear-gradient(#A8DCFF 50%, #6FCDB9 50%)`,padding:`var(--top-clear) 16px calc(var(--safe-bottom) + 16px)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:20},children:[(0,w.jsx)(d.div,{initial:{x:-40,rotate:-6},animate:{x:0,rotate:[-6,4,0]},style:{fontSize:`clamp(80px, 18vmin, 160px)`},"aria-hidden":!0,children:$d.find(e=>e.id===n)?.icon??`🚤`},n),(0,w.jsx)(`div`,{style:{display:`flex`,gap:12,flexWrap:`wrap`,justifyContent:`center`},children:$d.map(e=>(0,w.jsxs)(`button`,{"aria-label":e.label,onClick:()=>{Y.boing(),r(e.id),t(e.id)},style:{minWidth:120,minHeight:88,borderRadius:999,border:`4px solid #fff`,background:n===e.id?`var(--hotpink)`:`var(--lavender)`,color:n===e.id?`#fff`:`var(--ink)`,fontSize:22,fontWeight:700,boxShadow:`var(--shadow)`,padding:`0 20px`},children:[e.icon,` `,e.label]},e.id))})]})}function tf(){let{start:t,enter:n}=g(v),[r]=(0,C.useState)(()=>t??`pier`),[i,a]=(0,C.useState)(`webgl`),[o,s]=(0,C.useState)(0),[c,u]=(0,C.useState)(!1),[f,p]=(0,C.useState)(0),m=(0,C.useRef)(null),h=(0,C.useRef)(null),[_]=(0,C.useState)(()=>E(`debug`)!==null);return(0,C.useEffect)(()=>n(r),[]),(0,w.jsxs)(`div`,{style:{position:`absolute`,inset:0,background:`#A8DCFF`,overflow:`clip`},children:[i===`flat`?(0,w.jsx)(ef,{section:r,onSection:e=>n(e)}):(0,w.jsx)(kl,{name:`The bay`,qaKey:`__thaiBoatQA`,worldRef:m,onMode:a,make:e=>{let t=new Yd(e,r,{onSection:e=>n(e),onLanded:u,onFlash:()=>p(e=>e+1)});return t.setHintElement(h.current),t},anchors:(e,t)=>(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(T,{list:Vd,els:t,...e}),(0,w.jsx)(`div`,{ref:h,"aria-hidden":!0,style:{position:`absolute`,left:0,top:0,display:`none`,pointerEvents:`none`,zIndex:2e4},children:(0,w.jsx)(d.div,{animate:{y:[0,14,0],scale:[1,.9,1]},transition:{repeat:1/0,duration:1.1,ease:`easeInOut`},style:{fontSize:`clamp(48px, 7vw, 72px)`,translate:`-30% -10%`,filter:`drop-shadow(0 4px 6px rgba(43,35,48,.35))`},children:`👆`})})]})},o),i===`lost`&&(0,w.jsx)(`button`,{onClick:()=>{a(`webgl`),s(e=>e+1)},style:{position:`absolute`,inset:0,background:`rgba(168,220,255,.85)`,border:`none`,fontSize:`clamp(24px, 5vw, 40px)`,fontWeight:700,color:`var(--ink)`},children:`🚤 Tap to wake the bay`}),(0,w.jsx)(l,{children:c&&i===`webgl`&&(0,w.jsx)(d.button,{"aria-label":`Take a photo`,initial:{scale:0},animate:{scale:1},exit:{scale:0},whileTap:{scale:.85},onClick:()=>{e.pop(),m.current?.snap()},style:{position:`absolute`,right:`calc(var(--safe-right, 0px) + 18px)`,bottom:`calc(var(--safe-bottom) + 18px)`,width:104,height:104,borderRadius:`50%`,border:`5px solid #fff`,background:`var(--hotpink)`,fontSize:52,boxShadow:`var(--shadow)`,zIndex:30},children:`📸`},`camera`)}),(0,w.jsx)(l,{children:f>0&&(0,w.jsx)(d.div,{initial:{opacity:.95},animate:{opacity:0},transition:{duration:.6},style:{position:`absolute`,inset:0,background:`#fff`,pointerEvents:`none`,zIndex:40}},f)}),_&&(0,w.jsx)(Qd,{bayRef:m})]})}var nf=[[`insideYawWide`,-10,60,1],[`insideYawTall`,-10,60,1],[`insidePitch`,20,80,1],[`insideFitW`,3,9,.1],[`insideFitD`,3,12,.1],[`streetYaw`,-30,30,1],[`streetPitch`,0,50,1],[`fov`,15,60,1],[`ambient`,0,1,.01],[`sun`,0,1,.01],[`outline`,0,3,.05],[`walkSpeed`,.5,4,.1],[`stepsPerSecond`,1,6,.1],[`hop`,0,.2,.01]];function rf({houseRef:e}){let[,t]=(0,C.useState)(0),[n,r]=(0,C.useState)(!1);(0,C.useEffect)(()=>{let e=setInterval(()=>t(e=>e+1),400);return()=>clearInterval(e)},[]);let i=window.__thaiHouseQA?.(),a=i?.stats;return(0,w.jsxs)(`div`,{style:{position:`absolute`,left:8,bottom:8,zIndex:50,background:`rgba(43,35,48,.82)`,color:`#fff`,borderRadius:12,padding:10,font:`12px/1.4 ui-monospace, monospace`,maxWidth:`min(360px, 92vw)`,maxHeight:`70vh`,overflow:`auto`,pointerEvents:`auto`},children:[(0,w.jsxs)(`div`,{onClick:()=>r(e=>!e),style:{cursor:`pointer`},children:[a?`${a.fps} fps · p95 ${a.p95} ms · ${a.calls} calls · ${Math.round((a.tris??0)/1e3)}k tris · dpr ${a.dpr}`:`mode: ${i?.mode??`?`}`,` `,n?`▾`:`▸`]}),n&&(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(`div`,{style:{opacity:.8,margin:`4px 0`},children:i?`${i.mode} · ${i.spot} · floor ${i.floor} · ${i.pose}${i.using?` (${i.using})`:``} · [${i.pos?.join(`, `)}]`:``}),nf.map(([n,r,i,a])=>(0,w.jsxs)(`label`,{style:{display:`grid`,gridTemplateColumns:`110px 1fr 44px`,gap:6,alignItems:`center`},children:[(0,w.jsx)(`span`,{children:n}),(0,w.jsx)(`input`,{type:`range`,min:r,max:i,step:a,value:K[n],onChange:r=>{K[n]=Number(r.target.value),e.current?.retune(),t(e=>e+1)}}),(0,w.jsx)(`span`,{children:K[n]})]},n)),(0,w.jsxs)(`label`,{style:{display:`grid`,gridTemplateColumns:`110px 1fr 44px`,gap:6,alignItems:`center`},children:[(0,w.jsx)(`span`,{children:`shadow band`}),(0,w.jsx)(`input`,{type:`range`,min:0,max:1,step:.01,value:K.bands[0][0],onChange:n=>{let r=Number(n.target.value);K.bands[0]=K.bands[1]=[r,r*.86,Math.min(1,r+.36)],e.current?.retune(),t(e=>e+1)}}),(0,w.jsx)(`span`,{children:K.bands[0][0]})]}),(0,w.jsx)(`button`,{onClick:()=>void navigator.clipboard?.writeText(JSON.stringify(K,null,2)).catch(()=>{}),style:{marginTop:6,borderRadius:8,padding:`4px 10px`},children:`Copy numbers`}),i?.memory&&(0,w.jsx)(`div`,{style:{opacity:.7,marginTop:4},children:`geometries ${i.memory.geometries} · textures ${i.memory.textures}`})]})]})}var Z={left:-3.125,right:3.125,back:-20.898,g0:3.6,g1:3,curb:2.6,roadFar:9.6,row:[-11.425,-6.025,0,6.025,11.425],houseW:6.65,stairs:{x0:-3.125,xLanding:-2.225,x1:0,zFront:-10.6,mid:-11.75,zBack:-12.9,steps:7},hall:{zFront:-7.4,zGlass:-13.4,door0:1.3,door1:2.4}},af=Z.g0,of=Z.back,sf=[{id:`shutter`,label:`Front door`,floor:0,area:`street`,at:[0,1.4,.05],r:1.6,react:`shutter`,use:{x:.1,z:-1.1,face:180,pose:`stand`}},{id:`sign`,label:`Shop sign`,floor:0,area:`street`,at:[0,3.18,.3],r:.7,react:`jelly`},{id:`spirit-house`,label:`Spirit house`,floor:0,area:`street`,at:[4.3,1.55,.55],r:.55,react:`glow`,gentle:!0,use:{x:4.3,z:1.35,face:180,pose:`wai`}},{id:`motorbike`,label:`Motorbike`,floor:0,area:`street`,at:[-4.5,.6,1.7],r:.75,react:`beep`,use:{x:-4.55,z:1.05,face:90,pose:`sit`,snap:{x:-4.65,z:1.7,y:.66}}},{id:`pot-left`,label:`Flower pot`,floor:0,area:`street`,at:[-2.2,.45,.4],r:.42,react:`jelly`,use:{x:-2.2,z:1.05,face:180,pose:`peek`}},{id:`pot-right`,label:`Lime tree`,floor:0,area:`street`,at:[2.2,.5,.4],r:.42,react:`jelly`,use:{x:2.2,z:1.05,face:180,pose:`peek`}},{id:`basil`,label:`Basil pot`,floor:0,area:`street`,at:[-7,.35,.45],r:.38,react:`jelly`,use:{x:-7,z:1.1,face:180,pose:`peek`}},{id:`cat`,label:`Sleepy cat`,floor:0,area:`street`,at:[6.4,.25,.55],r:.42,react:`cat`,use:{x:6.4,z:1.25,face:180,pose:`peek`}},{id:`birds`,label:`Birds`,floor:0,area:`street`,at:[6.3,5.75,2.35],r:.8,react:`birds`},{id:`tuk-tuk`,label:`Tuk-tuk`,floor:0,area:`street`,at:[9.8,.95,3.95],r:1.1,react:`toot`,use:{x:9.6,z:2.3,face:0,pose:`stand`}},{id:`neighbor-left`,label:`Neighbor's door`,floor:0,area:`street`,at:[Z.row[1],1.5,.05],r:1.3,react:`jelly`},{id:`neighbor-right`,label:`Neighbor's shop`,floor:0,area:`street`,at:[Z.row[3],2.7,.5],r:1.1,react:`jelly`},{id:`desk`,label:`Agong's desk`,floor:0,area:`inside`,at:[2.765,.9,-4.45],r:.7,react:`hop`,use:{x:2.225,z:-3.1,face:150,pose:`peek`}},{id:`table`,label:`Table`,floor:0,area:`inside`,at:[-2.075,.75,-2.6],r:.9,react:`jelly`,use:{x:-.575,z:-2.2,face:-90,pose:`sit`,snap:{x:-1.325,z:-2.2,y:.45}}},{id:`ground-couch`,label:`Grey couch`,floor:0,area:`inside`,at:[-2.7,.5,-6.9],r:.9,react:`jelly`,use:{x:-1.65,z:-6.9,face:90,pose:`sit`,snap:{x:-2.6,z:-6.9,y:.44}}},{id:`photos`,label:`Old photos`,floor:0,area:`inside`,at:[Z.left+.05,2.45,-4],r:.95,react:`tilt`,use:{x:-.3,z:-3,face:-70,pose:`lookup`}},{id:`gecko`,label:`Gecko`,floor:0,area:`inside`,at:[Z.left+.04,3,-3],r:.35,react:`gecko`,moves:!0},{id:`clock`,label:`Clock`,floor:0,area:`inside`,at:[Z.left+.05,2.85,-5.75],r:.32,react:`tick`,use:{x:-.4,z:-5.95,face:-80,pose:`lookup`}},{id:`fan`,label:`Fan`,floor:0,area:`inside`,at:[2.5,1.15,-5.75],r:.5,react:`spin`,use:{x:1.75,z:-5.3,face:120,pose:`peek`}},{id:`fridge`,label:`Fridge`,floor:0,area:`inside`,at:[2.775,.9,-11.75],r:.65,react:`open`,use:{x:2.025,z:-11.75,face:90,pose:`peek`}},{id:`altar`,label:`Family altar`,floor:0,area:`inside`,at:[-.3,1.35,of+.3],r:.8,react:`glow`,gentle:!0,use:{x:-.3,z:of+1.15,face:180,pose:`wai`}},{id:`photos-back`,label:`More old photos`,floor:0,area:`inside`,at:[-1.85,2.95,of+.03],r:.7,react:`tilt`,use:{x:-1.7,z:of+1,face:180,pose:`lookup`}},{id:`shrine`,label:`Little shrine`,floor:0,area:`inside`,at:[.9,.3,of+.25],r:.4,react:`glow`,gentle:!0,use:{x:.9,z:of+1,face:180,pose:`wai`}},{id:`calendar`,label:`Calendar`,floor:0,area:`inside`,at:[1.95,2,of+.03],r:.38,react:`flip`,use:{x:1.5,z:of+.85,face:180,pose:`lookup`}},{id:`rice-cooker`,label:`Rice cooker`,floor:0,area:`inside`,at:[2.775,1,-18.098],r:.4,react:`puff`,use:{x:2.075,z:-18.098,face:90,pose:`peek`}},{id:`doormat`,label:`Go outside`,floor:0,area:`inside`,at:[0,.05,-.6],r:.7,react:`jelly`,use:{x:.3,z:1.35,face:15,pose:`stand`}},{id:`shoes`,label:`Shoes`,floor:0,area:`inside`,at:[2.825,.2,-.85],r:.42,react:`hop`,use:{x:2.125,z:-.85,face:90,pose:`peek`}},{id:`stairs-up`,label:`Stairs up`,floor:0,area:`inside`,at:[-1,.9,-11.2],r:.8,react:`stairs`},{id:`stairs-down`,label:`Stairs down`,floor:1,area:`inside`,at:[-.6,af+.3,-12.3],r:.75,react:`stairs`},{id:`plant`,label:`Plant`,floor:1,area:`inside`,at:[2.1,af+.4,-7.85],r:.35,react:`jelly`,use:{x:1.4,z:-8,face:90,pose:`peek`}},{id:`glass-doors`,label:`Glass doors`,floor:1,area:`inside`,at:[1.85,af+.8,Z.hall.zGlass],r:.65,react:`jelly`,use:{x:1.85,z:-16.998,face:180,pose:`stand`}},{id:`mattress`,label:`Mattress`,floor:1,area:`inside`,at:[-2.275,af+.25,-17.998],r:1,react:`jelly`,use:{x:-1.075,z:-17.998,face:25,pose:`bounce`,snap:{x:-2.275,z:-17.998,y:.22}}},{id:`pillows`,label:`Pillows`,floor:1,area:`inside`,at:[-2.275,af+.35,-20.348],r:.55,react:`puff`,use:{x:-1.075,z:-19.548,face:0,pose:`lie`,snap:{x:-2.275,z:-19.498,y:.22}}},{id:`couch`,label:`Couch`,floor:1,area:`inside`,at:[2.795,af+.5,-18.598],r:.75,react:`jelly`,use:{x:1.925,z:-18.098,face:-90,pose:`sit`,snap:{x:2.725,z:-18.098,y:.44}}},{id:`room-fan`,label:`Fan`,floor:1,area:`inside`,at:[.4,af+.75,-16.798],r:.42,react:`spin`,use:{x:.4,z:-17.548,face:0,pose:`peek`}},{id:`suitcase`,label:`Suitcase`,floor:1,area:`inside`,at:[-.9,af+.3,-20.448],r:.45,react:`open`,use:{x:-.9,z:-19.748,face:180,pose:`peek`}},{id:`bathroom-door`,label:`Bathroom door`,floor:1,area:`inside`,at:[2.2,af+1.1,of+.06],r:.6,react:`rattle`,use:{x:2.2,z:of+.95,face:180,pose:`stand`}},{id:`wardrobe`,label:`Wardrobe`,floor:1,area:`inside`,at:[.25,af+1,of+.26],r:.7,react:`open`,use:{x:.25,z:of+1,face:180,pose:`peek`}}],cf=Z.stairs,lf=Z.hall,uf={0:{bounds:[-13,13,-21.098,2.8],carve:[[-12.6,12.6,0,Z.curb-.05],[Z.left,Z.right,Z.back,0],[Z.left+.1,Z.right-.1,-1,1]],block:[[2.425,Z.right,-5.25,-3.65],[1.725,2.325,-4.5,-3.9],[-2.575,-1.575,-3.6,-1.6],[Z.left,-2.25,-8.3,-5.5],[2.425,Z.right,-12.1,-11.4],[2.575,Z.right,-1.25,-.45],[cf.x0,cf.x1+.05,cf.zBack,cf.zFront],[-1,.4,of,of+.55],[.65,1.15,of,of+.4],[2.475,Z.right,-20.298,-17.298],[-5.4,-3.65,1.45,1.95]],circles:[[-2.825,-2.2,.17],[-2.825,-3.1,.17],[-1.325,-3.1,.17],[-2.075,-1.3,.17],[-2.075,-4,.17],[2.5,-5.75,.28],[4.3,.5,.28],[-2.2,.4,.26],[2.2,.4,.26],[-7,.45,.24],[6.4,.55,.22],[-8.1,2.35,.12],[8.1,2.35,.12]]},1:{bounds:[-3.325,3.325,-21.098,-7.2],carve:[[Z.left,Z.right,Z.back,lf.zFront]],block:[[cf.x0,cf.x1+.05,cf.zBack,cf.zFront],[Z.left,lf.door0,lf.zGlass-.06,lf.zGlass+.06],[lf.door1,Z.right,lf.zGlass-.06,lf.zGlass+.06],[Z.left,-1.475,-20.748,-16.448],[2.425,Z.right,-19.798,-17.398],[-1.25,-.55,of,-20.198],[-.35,.85,of,of+.55]],circles:[[.4,-16.798,.2],[2.1,-7.85,.2],[1.42,of+.32,.24]]}},df=[Z.left+.05,Z.right-.05,-.08,.08],ff={arrive:{floor:0,x:.45,z:1.55,face:15},street:{floor:0,x:.45,z:1.55,face:15},downstairs:{floor:0,x:.2,z:-1.3,face:160},upstairs:{floor:1,x:.55,z:-12.3,face:90},family:{floor:0,x:1.05,z:1.75,face:0}},pf={back:[`bird`,`joy`,`jum`,`agong`,`ji`,`nick`,`ja`,`sri`],front:[[`bb`,-4.45],[`gan`,-3.3],[`ken`,-2.15],[`kaylee`,1.15],[`putto`,2.3],[`putter`,3.45]],backZ:.75,frontZ:1.75,spacing:1.15},mf={up1:(cf.zFront+cf.mid)/2,up2:(cf.mid+cf.zBack)/2},hf=Z.g0/(2*cf.steps+2),gf=(cf.x1-cf.xLanding)/cf.steps;function _f(){let e=[];for(let t=1;t<=cf.steps;t++)e.push([cf.x1-gf*(t-.5),hf*t,mf.up1]);let t=hf*(cf.steps+1),n=(cf.x0+cf.xLanding)/2;e.push([n,t,mf.up1],[n,t,mf.up2]);for(let n=1;n<=cf.steps;n++)e.push([cf.xLanding+gf*(n-.5),t+hf*n,mf.up2]);return e}var vf={x:cf.x1+.4,z:mf.up1},yf={x:cf.x1+.45,z:mf.up2},bf=[{id:`street`,icon:`🛺`,label:`Street`},{id:`downstairs`,icon:`🏠`,label:`Downstairs`},{id:`upstairs`,icon:`🛏️`,label:`Upstairs`}];function xf({spot:e,onSpot:t,photo:n=!1}){let[r,i]=(0,C.useState)(null),a=+(e===`upstairs`),o=e===`street`?`street`:`inside`,s=sf.filter(e=>e.floor===a&&e.area===o&&e.react!==`stairs`),c=n?xu:xu.filter(t=>t.spot&&t.spot.floor===a&&t.spot.z>0==(e===`street`)),l=(e,t)=>{i(e),t(),setTimeout(()=>i(t=>t===e?null:t),500)};return(0,w.jsxs)(`div`,{style:{position:`absolute`,inset:0,background:`linear-gradient(#A8DCFF 55%, #EEE7F8 55%)`,padding:`var(--top-clear) 16px calc(var(--safe-bottom) + 16px)`,display:`flex`,flexDirection:`column`,alignItems:`center`,gap:14,overflow:`auto`},children:[(0,w.jsxs)(`div`,{"aria-hidden":!0,style:{width:`min(300px, 60vw)`,aspectRatio:`1 / 1.15`,background:`#FFD9C4`,border:`4px solid var(--ink)`,borderRadius:14,position:`relative`,flexShrink:0},children:[(0,w.jsx)(`div`,{style:{position:`absolute`,left:`12%`,right:`12%`,top:`8%`,height:`30%`,background:`#BFE0F5`,border:`3px solid var(--ink)`,borderRadius:8}}),(0,w.jsx)(`div`,{style:{position:`absolute`,left:`6%`,right:`6%`,top:`40%`,height:`6%`,background:`var(--cream)`,border:`3px solid var(--ink)`}}),(0,w.jsx)(`div`,{style:{position:`absolute`,left:`14%`,right:`14%`,top:`50%`,height:`8%`,background:`#F0646E`,border:`3px solid var(--gold)`,borderRadius:6}}),(0,w.jsx)(`div`,{style:{position:`absolute`,left:`8%`,right:`8%`,bottom:0,height:`36%`,background:e===`street`?`repeating-linear-gradient(#BFE6DA 0 10px, #9FD3C4 10px 13px)`:`#FFF1E2`,borderTop:`3px solid var(--ink)`}})]}),(0,w.jsx)(`div`,{style:{display:`flex`,gap:10,flexWrap:`wrap`,justifyContent:`center`},children:bf.map(n=>(0,w.jsxs)(`button`,{"aria-label":n.label,onClick:()=>e!==n.id&&t(n.id),style:{minWidth:96,minHeight:72,borderRadius:999,border:`4px solid #fff`,background:e===n.id?`var(--hotpink)`:`var(--lavender)`,color:e===n.id?`#fff`:`var(--ink)`,fontSize:20,fontWeight:700,boxShadow:`var(--shadow)`,padding:`0 18px`},children:[n.icon,` `,n.label]},n.id))}),(0,w.jsxs)(`div`,{style:{display:`flex`,gap:10,flexWrap:`wrap`,justifyContent:`center`,maxWidth:900},children:[c.map(e=>(0,w.jsx)(d.button,{"aria-label":e.name,animate:r===e.id?{y:[0,-16,0]}:{y:0},onClick:()=>l(e.id,()=>Y.babble(e.pitch)),style:{minWidth:88,minHeight:88,borderRadius:999,border:`4px solid #fff`,background:e.color,fontSize:18,fontWeight:700,boxShadow:`var(--shadow)`,padding:`0 16px`},children:e.name},e.id)),!n&&s.map(e=>(0,w.jsx)(d.button,{"aria-label":e.label,animate:r===e.id?{scale:[1,1.15,.95,1]}:{scale:1},onClick:()=>l(e.id,e.gentle?Y.ding:Y.pop),style:{minWidth:88,minHeight:72,borderRadius:20,border:`4px solid #fff`,background:`#fff`,fontSize:17,fontWeight:600,boxShadow:`var(--shadow)`,padding:`0 14px`},children:e.label},e.id))]})]})}var Sf=new Set,Cf=12,wf=60,Tf=5,Ef=(0,C.forwardRef)(function({spot:e,quiet:t},n){let r=(0,C.useRef)(null),[i,a]=(0,C.useState)(null),o=(0,C.useRef)(h.house.door),c=(0,C.useRef)(performance.now()),p=(0,C.useRef)(0),m=(0,C.useRef)(0),g=(0,C.useRef)({count:0,last:0}),_=(0,C.useRef)(void 0),v=(0,C.useRef)(e);v.current=e;let y=(e,t=!1)=>{o.current=e,p.current=performance.now(),a(e),r.current?.play(`wave`),clearTimeout(_.current),u(e,{interrupt:!t}).then(()=>{_.current=setTimeout(()=>a(t=>t===e?null:t),2200)})},b=(e,t,n=!1)=>{Sf.has(e)||(Sf.add(e),y(t,n))};return(0,C.useImperativeHandle)(n,()=>({speak:y,arrivedAt(e){performance.now()-m.current<5e3||(e===`downstairs`?b(`inside`,h.house.inside):e===`upstairs`&&b(`upstairs`,h.house.upstairs))},poked(e){let t=h.house.pokes[e];if(e===`bathroom-door`)y(h.house.bathroom);else if(t&&!Sf.has(`poke:${e}`))b(`poke:${e}`,t);else return;m.current=performance.now()}})),(0,C.useEffect)(()=>{let e=performance.now();g.current={count:0,last:e},c.current=e},[e]),(0,C.useEffect)(()=>{let e=()=>c.current=performance.now();window.addEventListener(`pointerdown`,e,!0);let n=setInterval(()=>{let e=performance.now();if(t||e-c.current<Cf*1e3||e-p.current<Cf*1e3)return;let n=g.current;n.count>=Tf||e-n.last<(n.count<2?Cf:wf)*1e3||(n.count++,n.last=e,c.current=e,y(h.house.stuck[v.current]))},1e3);return()=>{window.removeEventListener(`pointerdown`,e,!0),clearInterval(n),clearTimeout(_.current)}},[t]),(0,w.jsxs)(`div`,{style:{position:`absolute`,left:`calc(var(--safe-left, 0px) + 8px)`,bottom:`calc(var(--safe-bottom) + 6px)`,display:`flex`,alignItems:`flex-end`,gap:6,zIndex:15,pointerEvents:`none`,maxWidth:`calc(100% - 120px)`},children:[(0,w.jsx)(`button`,{"aria-label":`Sparkle`,onClick:()=>{r.current?.play(`hop`),y(o.current)},style:{pointerEvents:`auto`,background:`none`,border:`none`,padding:0,width:`min(130px, 17vh, 26vw)`,height:`min(150px, 20vh, 30vw)`,display:`flex`,alignItems:`flex-end`,justifyContent:`center`},children:(0,w.jsx)(s,{ref:r,height:`100%`,lookToward:.4})}),(0,w.jsx)(l,{children:i&&(0,w.jsx)(d.div,{initial:{opacity:0,scale:.8,y:10},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.9},style:{marginBottom:`min(70px, 9vh)`,background:`rgba(255,255,255,0.95)`,borderRadius:`var(--radius)`,padding:`10px 16px`,boxShadow:`var(--shadow)`,fontSize:`clamp(18px, min(3.2vw, 3.6vh), 28px)`,fontWeight:600,lineHeight:1.15,transformOrigin:`bottom left`},children:f(i)},f(i))})]})}),Df=class{x0;z0;cell;radius;cols;rows;base;grid;constructor(e,t,n,r,i=.2,a=.22){this.x0=e,this.z0=t,this.cell=i,this.radius=a,this.cols=Math.ceil((n-e)/i),this.rows=Math.ceil((r-t)/i),this.base=new Uint8Array(this.cols*this.rows).fill(1),this.grid=this.base.slice()}carve(e,t,n,r){this.fill(this.base,e+this.radius,t-this.radius,n+this.radius,r-this.radius,0)}block(e,t,n,r){this.fill(this.base,e-this.radius,t+this.radius,n-this.radius,r+this.radius,1)}blockCircle(e,t,n){let r=n+this.radius;for(let n=0;n<this.rows;n++)for(let i=0;i<this.cols;i++){let[a,o]=this.center(i,n);(a-e)**2+(o-t)**2<=r*r&&(this.base[n*this.cols+i]=1)}}setDynamic(e){this.grid=this.base.slice();for(let[t,n,r,i]of e)this.fill(this.grid,t-this.radius,n+this.radius,r-this.radius,i+this.radius,1)}commit(){this.grid=this.base.slice()}fill(e,t,n,r,i,a){for(let o=0;o<this.rows;o++)for(let s=0;s<this.cols;s++){let[c,l]=this.center(s,o);c>=t&&c<=n&&l>=r&&l<=i&&(e[o*this.cols+s]=a)}}center(e,t){return[this.x0+(e+.5)*this.cell,this.z0+(t+.5)*this.cell]}cellOf(e,t){return[Math.floor((e-this.x0)/this.cell),Math.floor((t-this.z0)/this.cell)]}freeCell(e,t){return e>=0&&t>=0&&e<this.cols&&t<this.rows&&this.grid[t*this.cols+e]===0}free(e,t){let[n,r]=this.cellOf(e,t);return this.freeCell(n,r)}cells(){return{cols:this.cols,rows:this.rows,blocked:this.grid}}nearestFree(e,t){if(this.free(e,t))return[e,t];let[n,r]=this.cellOf(e,t),i=null,a=1/0,o=Math.max(this.cols,this.rows);for(let s=1;s<o;s++){for(let o=-s;o<=s;o++)for(let c=-s;c<=s;c++){if(Math.max(Math.abs(o),Math.abs(c))!==s||!this.freeCell(n+c,r+o))continue;let l=this.center(n+c,r+o),u=(l[0]-e)**2+(l[1]-t)**2;u<a&&(a=u,i=l)}if(i&&Math.sqrt(a)<(s-.5)*this.cell)break}return i}clear(e,t){let n=Math.hypot(t[0]-e[0],t[1]-e[1]),r=Math.ceil(n/(this.cell*.4));for(let n=1;n<=r;n++){let i=n/r;if(!this.free(e[0]+(t[0]-e[0])*i,e[1]+(t[1]-e[1])*i))return!1}return!0}path(e,t){let n=this.nearestFree(t[0],t[1]);if(!n)return null;let r=e;if(this.free(e[0],e[1])||(r=this.nearestFree(e[0],e[1])??e),this.clear(r,n))return[n];let[i,a]=this.cellOf(r[0],r[1]),[o,s]=this.cellOf(n[0],n[1]),c=this.cols*this.rows,l=new Float32Array(c).fill(1/0),u=new Int32Array(c).fill(-1),d=new Uint8Array(c),f=new kf,p=a*this.cols+i,m=s*this.cols+o;l[p]=0,f.push(p,Of(i,a,o,s));let h=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]],g=!1;for(;f.size;){let e=f.pop();if(e===m){g=!0;break}if(d[e])continue;d[e]=1;let t=e%this.cols,n=(e-t)/this.cols;for(let[r,i,a]of h){let c=t+r,d=n+i;if(!this.freeCell(c,d)||r&&i&&(!this.freeCell(t+r,n)||!this.freeCell(t,n+i)))continue;let p=d*this.cols+c,m=l[e]+a;m<l[p]&&(l[p]=m,u[p]=e,f.push(p,m+Of(c,d,o,s)))}}if(!g)return null;let _=[];for(let e=m;e!==p&&e!==-1;e=u[e])_.push(this.center(e%this.cols,Math.floor(e/this.cols)));if(_.reverse(),!_.length)return[n];_[_.length-1]=n;let v=[],y=r,b=0;for(;b<_.length;){let e=_.length-1;for(;e>b&&!this.clear(y,_[e]);)e--;v.push(_[e]),y=_[e],b=e+1}return v}},Of=(e,t,n,r)=>{let i=Math.abs(e-n),a=Math.abs(t-r);return Math.max(i,a)+(Math.SQRT2-1)*Math.min(i,a)},kf=class{items=[];prio=[];get size(){return this.items.length}push(e,t){let n=this.items,r=this.prio;n.push(e),r.push(t);let i=n.length-1;for(;i>0;){let e=i-1>>1;if(r[e]<=r[i])break;[n[e],n[i]]=[n[i],n[e]],[r[e],r[i]]=[r[i],r[e]],i=e}}pop(){let e=this.items,t=this.prio,n=e[0],r=e.pop(),i=t.pop();if(e.length){e[0]=r,t[0]=i;let n=0;for(;;){let r=n*2+1,i=r+1,a=n;if(r<e.length&&t[r]<t[a]&&(a=r),i<e.length&&t[i]<t[a]&&(a=i),a===n)break;[e[a],e[n]]=[e[n],e[a]],[t[a],t[n]]=[t[n],t[a]],n=a}}return n}};function Q(e,t,n,r,i={}){let a=new U;return a.position.set(...r),a.rotation.y=i.rotY??0,n.length&&a.add(eu($l(n),e.bag,i.px??2)),a.userData.pick=t,e.pokes.set(t,a),a}function Af(e,t,n,r,i=2){let a=new U;return a.position.set(...r),n.length&&a.add(eu($l(n),e.bag,i)),e.parts.set(t,a),a}function $(e,t,n=2){return eu($l(t),e.bag,n)}var jf=`#9FB8E8`,Mf=`#FFB27A`,Nf={z0:-1.3,z1:-5,y0:2.75,y1:3.35},Pf=class{root;heading=new U;body=new U;target={y:3,z:-3};speed=.18;rest=2;callIn=20+Math.random()*15;constructor(e){this.root=Q(e,`gecko`,[],[Z.left+.04,3,-3]),this.root.userData.moves=!0,this.body.rotation.z=-Math.PI/2,this.body.add($(e,[J.capsule(.05,.14,jf,{rot:[0,0,Math.PI/2],scale:[1,1,.8]}),J.sphere(.06,jf,{at:[.14,.005,0],scale:[1.15,.7,1]}),...[-1,1].map(e=>J.sphere(.024,q.butter,{at:[.15,.03,e*.045]})),...[-.1,-.16,-.22,-.27,-.31].map((e,t)=>J.sphere(.04-t*.006,jf,{at:[e,0,Math.sin(t*.9)*.04]})),...[-1,1].flatMap(e=>[-.05,.07].flatMap(t=>[J.capsule(.014,.07,jf,{at:[t,-.01,e*.07],rot:[e*1.2,0,t>0?-.5:.5]}),J.sphere(.02,jf,{at:[t+(t>0?.04:-.04),-.02,e*.11],scale:[1,.5,1]})])),...[[.03,.02],[-.04,-.02],[.08,-.025],[-.12,.012]].map(([e,t])=>J.sphere(.017,Mf,{at:[e,.04,t],scale:[1,.5,1]}))],1.5),$(e,[-1,1].map(e=>J.sphere(.011,q.ink,{at:[.165,.042,e*.05]})),0)),this.heading.add(this.body),this.heading.scale.setScalar(1.4),this.root.add(this.heading)}scare(){let e=this.root.position;this.target={y:Nf.y0+Math.random()*(Nf.y1-Nf.y0),z:e.z<(Nf.z0+Nf.z1)/2?Nf.z0-Math.random()*.8:Nf.z1+Math.random()*.8},this.speed=1.1,this.rest=0}update(e,t){let n=this.root.position,r=this.target.y-n.y,i=this.target.z-n.z,a=Math.hypot(r,i),o=!1;if(a>.01){o=!0;let t=Math.min(a,this.speed*e);n.y+=r/a*t,n.z+=i/a*t;let s=Math.atan2(-i,-r)-this.heading.rotation.x;s=Math.atan2(Math.sin(s),Math.cos(s)),this.heading.rotation.x+=s*Math.min(1,e*10)}else this.rest-=e,this.rest<=0&&(this.target={y:Nf.y0+Math.random()*(Nf.y1-Nf.y0),z:Nf.z1+Math.random()*(Nf.z0-Nf.z1)},this.speed=.18,this.rest=2+Math.random()*4);return this.body.rotation.x=o?Math.sin(t*(this.speed>.5?40:16))*.25:Math.sin(t*.8)*.12,this.callIn-=e,this.callIn<=0&&(this.callIn=30+Math.random()*25,!0)}},Ff=[`uniform-white`,`uniform-blue`,`couple`,`family`,`certificate`,`calendar`],If=160,Lf=200,Rf=3,zf=2;function Bf(e,t,n,r,i){let a=i.skin??`#E6B992`;if(e.fillStyle=i.coat,e.beginPath(),e.moveTo(t-46*r,n+120*r),e.quadraticCurveTo(t-44*r,n+52*r,t,n+46*r),e.quadraticCurveTo(t+44*r,n+52*r,t+46*r,n+120*r),e.closePath(),e.fill(),i.collar&&(e.fillStyle=i.collar,e.fillRect(t-9*r,n+42*r,18*r,10*r)),i.sash){e.strokeStyle=i.sash,e.lineWidth=9*r,e.beginPath(),e.moveTo(t+30*r,n+56*r),e.lineTo(t-26*r,n+118*r),e.stroke(),e.fillStyle=`#E8B33A`;for(let[i,a]of[[-30,54],[30,54]])e.fillRect(t+(i-9)*r,n+(a-3)*r,18*r,6*r);[`#D9473B`,`#E8B33A`,`#3E6FB0`,`#E8B33A`].forEach((i,a)=>{e.fillStyle=i,e.beginPath(),e.arc(t-20*r+a%2*9*r,n+70*r+Math.floor(a/2)*9*r,3.5*r,0,Math.PI*2),e.fill()})}e.fillStyle=a,e.fillRect(t-7*r,n+30*r,14*r,16*r),e.beginPath(),e.ellipse(t,n+18*r,17*r,21*r,0,0,Math.PI*2),e.fill(),e.fillStyle=i.hair??`#2A2420`,e.beginPath(),e.ellipse(t,n+4*r,18*r,11*r,0,Math.PI,Math.PI*2),e.fill(),e.fillRect(t-18*r,n+2*r,5*r,10*r),e.fillStyle=`#2A2420`;for(let i of[-6,6])e.beginPath(),e.ellipse(t+i*r,n+17*r,1.8*r,2.2*r,0,0,Math.PI*2),e.fill();e.strokeStyle=`#8A4B3A`,e.lineWidth=1.6*r,e.beginPath(),e.arc(t,n+24*r,5*r,.2*Math.PI,.8*Math.PI),e.stroke()}var Vf={"uniform-white"(e){let t=e.createLinearGradient(0,0,0,Lf);t.addColorStop(0,`#6F8FB3`),t.addColorStop(1,`#B9CBDD`),e.fillStyle=t,e.fillRect(0,0,If,Lf),Bf(e,If/2,46,1.15,{coat:`#FBFAF5`,sash:`#3E64B5`,collar:`#E8B33A`})},"uniform-blue"(e){e.fillStyle=`#E6DFCF`,e.fillRect(0,0,If,Lf),Bf(e,If/2,46,1.15,{coat:`#A9C6E8`,sash:`#24407F`,collar:`#E8B33A`})},couple(e){e.fillStyle=`#C9C3B0`,e.fillRect(0,0,If,Lf),e.fillStyle=`#B5AE98`,e.fillRect(0,120,If,80),Bf(e,52,62,.85,{coat:`#3D3A40`,collar:`#F2EEE2`}),Bf(e,108,70,.8,{coat:`#E7D9C4`,hair:`#3A2E28`})},family(e){e.fillStyle=`#C9AF86`,e.fillRect(0,0,If,Lf),e.fillStyle=`#B49870`,e.fillRect(0,130,If,70);let t={skin:`#D9BC92`,hair:`#4A3826`};Bf(e,42,52,.7,{coat:`#6E5A40`,...t}),Bf(e,118,52,.7,{coat:`#E2D2B2`,...t}),Bf(e,64,96,.55,{coat:`#9C8360`,...t}),Bf(e,98,100,.5,{coat:`#EADBBE`,...t})},certificate(e){e.fillStyle=`#FBF8EE`,e.fillRect(0,0,If,Lf),e.strokeStyle=`#C9A24E`,e.lineWidth=4,e.strokeRect(10,10,140,180),e.fillStyle=`#E2B13C`,e.beginPath(),e.arc(If/2,40,15,0,Math.PI*2),e.fill(),e.fillStyle=`#9AA0A8`;for(let t=0;t<9;t++)e.fillRect(26+(t%3==2?20:0),70+t*11,108-(t%3==2?40:0),3);e.fillStyle=`#D9473B`,e.beginPath(),e.arc(120,166,10,0,Math.PI*2),e.fill()},calendar(e){e.fillStyle=`#FFFFFF`,e.fillRect(0,0,If,Lf),e.fillStyle=`#D9473B`,e.fillRect(0,0,If,26),e.fillStyle=`#C8333B`,e.font=`bold 92px Fredoka, sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(`12`,If/2,78),e.fillStyle=`#A9A3B0`;for(let t=0;t<4;t++)for(let n=0;n<7;n++)e.fillRect(14+n*19,136+t*14,11,7);e.fillStyle=`#D9473B`,e.fillRect(90,150,11,7)}},Hf=null;function Uf(){if(Hf)return Hf;let e=document.createElement(`canvas`);e.width=480,e.height=400;let t=e.getContext(`2d`);return Ff.forEach((e,n)=>{t.save(),t.translate(n%Rf*If,Math.floor(n/Rf)*Lf),t.beginPath(),t.rect(0,0,If,Lf),t.clip(),Vf[e](t),t.restore()}),Hf=e}function Wf(e,t,n,r){let i=new Ea(t,n),a=Ff.indexOf(e),o=a%Rf/Rf,s=1-Math.floor(a/Rf)/zf,c=i.attributes.uv;for(let e=0;e<c.count;e++)c.setXY(e,o+c.getX(e)/Rf,s-(1-c.getY(e))/zf);return i.applyMatrix4(r),i}function Gf(e,t){let n=e.bag.add(new Wi(Uf()));n.colorSpace=pt,n.anisotropy=4;let r=Nl(t,!1);for(let e of t)e.dispose();return new ei(e.bag.add(r),e.bag.add(new ja({map:n,gradientMap:Ll()})))}function Kf(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function qf(e,t,n,r,i,a,o,s,c){let l=Math.round(r*i*o.perM2/(a*a));for(let u=0;u<l;u++){let l=(o.size[0]+(o.size[1]-o.size[0])*s()**2.2)*a/2,u=t+s()*r,d=n+s()*i,f=s()**1.6;e.fillStyle=o.colors[Math.floor(f*o.colors.length)];let p=3+Math.floor(s()*4),m=s()*Math.PI*2,h=Array.from({length:p},(e,t)=>{let n=m+t/p*Math.PI*2+(s()-.5)*.9,r=l*(.55+s()*.6);return[Math.cos(n)*r,Math.sin(n)*r*(.6+s()*.5)]}),g=c?[-1,0,1].flatMap(e=>[-1,0,1].map(t=>[e*c[0],t*c[1]])):[[0,0]];for(let[t,n]of g){let r=u+t,i=d+n;c&&(r<-l*2||i<-l*2||r>c[0]+l*2||i>c[1]+l*2)||(e.beginPath(),h.forEach(([t,n],a)=>a?e.lineTo(r+t,i+n):e.moveTo(r+t,i+n)),e.closePath(),e.fill())}}}function Jf(e){let t=Math.round(e.w*e.ppm),n=Math.round(e.d*e.ppm),r=document.createElement(`canvas`);r.width=t,r.height=n;let i=r.getContext(`2d`),a=Kf(t*31+n);return i.fillStyle=e.base,i.fillRect(0,0,t,n),qf(i,0,0,t,n,e.ppm,e.chips,a,[t,n]),e.over?.(i,t,n,e.ppm,a),r}var Yf={w:1.5625,d:1.5625,ppm:512,base:`#E9D19C`,chips:{colors:[`#F6E8C6`,`#D6B677`,`#C19A5E`,`#FBF3DF`,`#A07A4E`,`#7E6347`,`#B7AE9E`,`#5B4A3C`,`#B8794E`],perM2:9e3,size:[.005,.03]},over(e,t,n,r,i){let a=.1*r,o=Math.max(2,.009*r),s={colors:[`#B9CDB0`,`#7E9C82`,`#D6E2CC`,`#668570`,`#9DB596`,`#E8EEDF`],perM2:9e3,size:[.004,.022]};for(let[c,l,u,d]of[[t/2-a/2,0,a,n],[0,n/2-a/2,t,a]]){e.fillStyle=`#5E6A55`,e.fillRect(c,l,u,d),e.fillStyle=`#A3BC9A`;let t=u===a?o:0,n=d===a?o:0;e.fillRect(c+t,l+n,u-2*t,d-2*n),e.save(),e.beginPath(),e.rect(c+t,l+n,u-2*t,d-2*n),e.clip(),qf(e,c,l,u,d,r,s,i),e.restore()}e.fillStyle=`#A3BC9A`,e.fillRect(t/2-a/2+o,n/2-a/2+o,a-2*o,a-2*o),e.save(),e.beginPath(),e.rect(t/2-a/2+o,n/2-a/2+o,a-2*o,a-2*o),e.clip(),qf(e,t/2-a/2,n/2-a/2,a,a,r,s,i),e.restore()}},Xf={w:1.2,d:1.2,ppm:512,base:`#E7E5E1`,chips:{colors:[`#B9BCC2`,`#8F949C`,`#F7F6F3`,`#D3D4D6`,`#5D626B`,`#3F434B`,`#A39684`,`#C9C2B5`],perM2:9500,size:[.005,.026]},over(e,t,n,r){let i=Math.max(2,.006*r);e.fillStyle=`#4E4A48`;for(let r of[0,t/2])e.fillRect(r-i/2,0,i,n);for(let r of[0,n/2])e.fillRect(0,r-i/2,t,i);e.fillRect(t-i/2,0,i/2,n),e.fillRect(0,n-i/2,t,i/2)}};function Zf(e,t,n,r,i,a,o,s=[0,0]){let c=e.bag.add(new Wi(Jf(t)));c.colorSpace=pt,c.wrapS=c.wrapT=te,c.repeat.set(n/t.w,r/t.d),c.offset.set(...s),c.anisotropy=8;let l=e.bag.add(new ja({map:c,gradientMap:Ll()})),u=new ei(e.bag.add(new Ea(n,r)),l);return u.rotation.x=-Math.PI/2,u.position.set(i,o,a),u}function Qf(e,t,n,r,i,a=.002){return Zf(e,Yf,t,n,r,i,a,[.5,.5])}function $f(e,t,n){return t.map(([t,r,i,a])=>Zf(e,Xf,r-t,a-i,(t+r)/2,(i+a)/2,n,[ep(t/Xf.w),ep(-a/Xf.d)]))}var ep=e=>e-Math.floor(e),tp=`#E6CB93`,np=`#F6EEDC`,rp=`#F3EAD6`,ip=`#E9B98E`,ap=`#C98F62`,op=`#8A4529`,sp=`#5E2C1A`,cp=`#A85A36`,lp=`#D8B062`,up=`#E2B13C`,dp=`#B8862E`,fp=`#4A2A1C`,pp=`#C9CCD1`,mp=`#E8505B`,hp=`#FF6F7F`,gp=[`#E6C9A8`,`#D9BFA0`,`#EBD5BC`,`#CDB295`],_p=Math.PI/180;function vp(e){let t=new U,n=new U,{left:r,right:i,back:a,g0:o}=Z,s=-a,{zFront:c,zBack:l}=Z.stairs;t.add($(e,[J.box(i-r,.2,s,tp,{at:[0,-.1,a/2]})],2),Qf(e,i-r,s,0,a/2)),t.add($(e,[...[[0,c],[l,a]].flatMap(([e,t])=>[J.box(.15,o,e-t,np,{at:[r-.075,o/2,(e+t)/2]}),J.box(.03,.12,e-t,ap,{at:[r+.015,.06,(e+t)/2]})]),J.box(i-r+.3,o,.15,rp,{at:[0,o/2,a-.075]}),J.box(i-r,.12,.03,ap,{at:[0,.06,a+.015]})])),n.add($(e,[J.box(.15,o,s,np,{at:[i+.075,o/2,a/2]})])),t.add(Q(e,`table`,[J.rbox(.92,.07,1.95,.03,ip,{at:[0,.74,0]}),...[[-.38,-.88],[.38,-.88],[-.38,.88],[.38,.88]].map(([e,t])=>J.cyl(.04,.04,.72,ap,{at:[e,.36,t]})),J.sphere(.11,q.sky,{at:[.15,.88,.45],scale:[1,.85,1]}),J.cyl(.03,.02,.1,q.sky,{at:[.28,.9,.45],rot:[0,0,-1]}),...[-.15,.05].map(e=>J.cyl(.04,.035,.07,q.cream,{at:[-.2,.81,e]})),J.cyl(.18,.12,.08,q.cream,{at:[.05,.82,-.5]}),...[[0,0,q.gold],[.08,.06,`#FF9F45`],[-.07,.05,`#7FCB8F`]].map(([e,t,n])=>J.sphere(.07,n,{at:[.05+e,.9,-.5+t]}))],[-2.075,0,-2.6]));let u=(e,t)=>[J.cyl(.17,.2,.06,hp,{at:[e,.42,t]}),J.cyl(.13,.19,.4,hp,{at:[e,.2,t]})];t.add($(e,[...u(-2.825,-2.2),...u(-2.825,-3.1),...u(-1.325,-2.2),...u(-1.325,-3.1),...u(-2.075,-1.3),...u(-2.075,-4)])),t.add(Q(e,`ground-couch`,[J.rbox(.85,.3,2.8,.08,`#92949E`,{at:[0,.2,0]}),...[-.66,.66].map(e=>J.rbox(.7,.14,1.26,.06,`#C5C7CF`,{at:[.05,.41,e]})),J.rbox(.2,.65,2.8,.08,`#AFB2BC`,{at:[-.32,.61,0]}),...[-1.3,1.3].map(e=>J.rbox(.82,.43,.18,.07,`#AFB2BC`,{at:[0,.46,e]})),J.rbox(.13,.34,.38,.06,`#E2E3E8`,{at:[-.17,.67,-.65],rot:[0,0,-.2]})],[-2.7,0,-6.9]));let d=Q(e,`desk`,[J.rbox(1.56,.05,.72,.02,cp,{at:[0,.755,0]}),J.box(1.5,.17,.66,op,{at:[0,.645,0]}),J.box(1.5,.56,.03,sp,{at:[0,.28,.315]}),J.box(.04,.56,.66,op,{at:[-.73,.28,0]}),J.box(.5,.56,.66,op,{at:[.5,.28,0]}),J.box(.92,.13,.02,cp,{at:[-.27,.645,-.335]}),J.box(.46,.13,.02,cp,{at:[.5,.645,-.335]}),J.cyl(.022,.022,.02,lp,{at:[-.62,.655,-.35],rot:[Math.PI/2,0,0]}),J.box(.22,.025,.025,lp,{at:[-.27,.635,-.355]}),J.box(.14,.025,.025,lp,{at:[.5,.635,-.355]}),J.box(.42,.46,.02,cp,{at:[.5,.3,-.335]}),J.box(.3,.34,.015,op,{at:[.5,.3,-.35]}),J.box(.025,.09,.02,lp,{at:[.33,.32,-.355]})],[Z.right-.36,0,-4.45],{rotY:Math.PI/2}),f=`#F2B33D`;d.add(Af(e,`desk.hop0`,[J.cyl(.085,.095,.28,`#EFE6D2`,{at:[-.55,.92,.17]}),J.cyl(.06,.07,.05,`#C9BFA8`,{at:[-.55,1.085,.17]}),J.cyl(.065,.065,.15,`#F2EEE6`,{at:[-.66,.855,-.13]}),J.cyl(.07,.07,.03,mp,{at:[-.66,.945,-.13]}),...[-.36,-.27].flatMap(e=>[J.cyl(.035,.04,.24,`#CFE6F2`,{at:[e,.9,.2]}),J.cyl(.018,.018,.03,q.cream,{at:[e,1.035,.2]})]),J.cyl(.13,.12,.12,pp,{at:[-.22,.84,-.08]}),J.cyl(.135,.135,.015,`#DADDE1`,{at:[-.22,.905,-.08]}),...[-.05,.05].flatMap(e=>[J.cyl(.032,.025,.045,`#F4F4F8`,{at:[-.22+e,.935,-.08]}),J.cyl(.033,.033,.012,`#3E6FB0`,{at:[-.22+e,.945,-.08]})]),J.sphere(.12,f,{at:[.15,.9,.08],scale:[1.2,.95,1]}),J.cyl(.045,.05,.05,`#E8A22F`,{at:[.15,.89,.08-.12],rot:[Math.PI/2,0,0]}),...[-1,1].map(e=>J.cone(.035,.06,f,{at:[.15+e*.06,1,.03],rot:[-.3,0,-e*.3]})),...[-1,1].flatMap(e=>[-1,1].map(t=>J.cyl(.025,.025,.05,`#E8A22F`,{at:[.15+e*.08,.8,.08+t*.06]}))),J.box(.08,.07,.01,mp,{at:[.15+.135,.9,.08],rot:[0,Math.PI/2,0]}),J.box(.05,.008,.012,q.ink,{at:[.15,1.013,.1]}),J.cyl(.105,.105,.03,`#2E2A30`,{at:[.55,.795,.12]}),J.cyl(.08,.1,.2,`#D5D8DD`,{at:[.55,.91,.12]}),J.box(.03,.16,.05,`#2E2A30`,{at:[.66,.92,.12]}),J.cone(.025,.07,`#D5D8DD`,{at:[.45,.97,.12],rot:[0,0,1.1]})],[0,0,0],1.5)),t.add(d),t.add(xp(e,[2.025,0,-4.2],65*_p));let p=Q(e,`altar`,[J.rbox(1.4,.95,.5,.03,mp,{at:[0,.475,0]}),J.box(1.44,.06,.54,q.gold,{at:[0,.97,0]}),J.box(1.3,.06,.32,mp,{at:[0,1.55,-.08]}),J.box(1.36,.05,.36,q.gold,{at:[0,1.6,-.08]}),...[-.4,0,.4].map((e,t)=>J.rbox(.3,.38,.04,.02,t===1?gp[0]:gp[3],{at:[e,1.82,-.12]})),...[-.4,0,.4].map(e=>J.box(.34,.42,.02,q.gold,{at:[e,1.82,-.15]})),J.cyl(.14,.1,.07,q.cream,{at:[.15,1.04,.05]}),...[-.06,.06,0].map((e,t)=>J.sphere(.065,`#FF9F45`,{at:[.15+e,1.1+(t===2?.06:0),.05]})),J.cyl(.09,.08,.12,q.gold,{at:[-.2,1.06,.05]}),...[-.55,.55].map(e=>J.cyl(.035,.035,.22,mp,{at:[e,1.11,.05]})),...[-.85,.85].flatMap(e=>[J.sphere(.15,mp,{at:[e,2.35,0],scale:[1,.85,1]}),J.cyl(.07,.07,.05,q.gold,{at:[e,2.5,0]}),J.cyl(.07,.07,.05,q.gold,{at:[e,2.21,0]})])],[-.3,0,a+.27]);for(let[t,n]of[-.55,.55].entries())p.add(Af(e,`altar.flame${t}`,[J.sphere(.03,q.gold,{scale:[.8,1.6,.8]})],[n,1.26,.05],0));p.add(Af(e,`altar.smoke`,[],[-.2,1.3,.05],0)),t.add(p);let m=Q(e,`shrine`,[J.rbox(.42,.34,.32,.02,mp,{at:[0,.17,0]}),J.box(.46,.04,.36,q.gold,{at:[0,.36,0]}),J.cone(.3,.16,mp,{at:[0,.46,0],rot:[0,Math.PI/4,0]},4),J.box(.2,.18,.02,q.gold,{at:[0,.18,.17]}),J.cyl(.03,.03,.08,q.cream,{at:[.12,.42,.1]})],[.9,0,a+.2]);m.add(Af(e,`shrine.flame0`,[J.sphere(.022,q.gold,{scale:[.8,1.6,.8]})],[.12,.48,.1],0)),m.add(Af(e,`shrine.smoke`,[],[.12,.5,.1],0)),t.add(m),t.add(bp(e,`photos`,[r+.02,2.45,-4],[{kind:`certificate`,w:.4,h:.52,frame:`wood`},{kind:`uniform-white`,w:.42,h:.56,frame:`gold`},{kind:`uniform-blue`,w:.42,h:.56,frame:`gold`},{kind:`couple`,w:.5,h:.4,frame:`wood`},{kind:`family`,w:.46,h:.38,frame:`wood`}]),bp(e,`photos-back`,[-1.85,2.95,a+.02],[{kind:`family`,w:.42,h:.34,frame:`wood`},{kind:`uniform-white`,w:.34,h:.44,frame:`gold`},{kind:`couple`,w:.42,h:.34,frame:`wood`}],-Math.PI/2));let h=Q(e,`clock`,[J.cyl(.24,.24,.06,ap,{rot:[0,0,Math.PI/2]}),J.cyl(.2,.2,.07,q.cream,{rot:[0,0,Math.PI/2]})],[r+.05,2.85,-5.75],{px:1.5});h.add(Af(e,`clock.hands`,[J.box(.02,.15,.025,q.ink,{at:[0,.06,0]}),J.box(.02,.025,.11,q.ink,{at:[0,0,.045]})],[.05,0,0],0)),t.add(h);let g=Q(e,`calendar`,[J.box(.5,.66,.03,`#F3E9E6`,{at:[0,-.02,0]}),J.box(.5,.14,.035,mp,{at:[0,.24,0]})],[1.95,2,a+.03],{px:1.5}),_=Af(e,`calendar.page`,[],[0,.16,.02],0);_.add(Gf(e,[Wf(`calendar`,.4,.5,new Mn().makeTranslation(0,-.26,.004))])),g.add(_),t.add(g),t.add(Sp(e,`fan`,[2.5,0,-5.75],-.31));let v=Q(e,`fridge`,[J.rbox(.68,1.7,.66,.06,`#C9EEF7`,{at:[0,.85,0]})],[i-.35,0,-11.75],{rotY:-Math.PI/2}),y=Af(e,`fridge.hinge`,[J.rbox(.68,1.1,.06,.03,`#D9F4FA`,{at:[.34,.55,0]}),J.box(.04,.3,.05,q.cream,{at:[.62,.55,.05]})],[-.34,.56,.36],1.5);y.userData.swing=-1.4,v.add(y),t.add(v),t.add($(e,[J.box(.62,.86,3,`#BFE6DA`,{at:[i-.31,.43,-18.798]}),J.box(.68,.05,3.06,q.cream,{at:[i-.33,.885,-18.798]}),...[-18.048,-18.798,-19.548].map(e=>J.box(.02,.6,.7,`#A8D8C8`,{at:[i-.63,.42,e]})),J.box(.4,.04,.5,`#D8D2E6`,{at:[i-.32,.9,-19.498]}),J.rbox(.3,.2,.36,.03,q.sky,{at:[i-.3,1.01,-18.848]}),J.cyl(.13,.09,.07,q.cream,{at:[i-.3,.95,-17.648]}),...[-.04,.04].map(e=>J.sphere(.045,`#9BD86F`,{at:[i-.3,1,-17.648+e]}))]));let b=Q(e,`rice-cooker`,[J.cyl(.17,.15,.24,q.cream,{at:[0,.12,0]}),J.sphere(.17,q.cream,{at:[0,.24,0],scale:[1,.35,1]}),J.box(.1,.04,.02,q.hotpink,{at:[0,.1,.17]}),J.box(.05,.05,.1,q.ink,{at:[0,.32,0]})],[i-.32,.91,-18.098],{rotY:-Math.PI/2});b.add(Af(e,`rice-cooker.smoke`,[],[0,.35,0],0)),t.add(b),t.add(Q(e,`doormat`,[J.rbox(1.3,.03,.62,.015,q.butter,{at:[0,.015,0]}),...[-.4,0,.4].map(e=>J.box(.16,.034,.56,q.hotpink,{at:[e,.016,0]}))],[0,0,-.62],{px:1.5}));let x=Q(e,`shoes`,[J.box(.4,.06,.75,ip,{at:[0,.03,0]})],[i-.3,0,-.85]);return x.add(Af(e,`shoes.hop0`,[q.hotpink,q.sky,q.butter,q.mint].map((e,t)=>J.rbox(.14,.04,.26,.02,e,{at:[t%2?.08:-.08,.02,-.28+t*.18]})),[0,.06,0],1.5)),t.add(x),{room:t,rightWall:n}}function yp(e,t,n,r){let i=Q(e,t,[J.cyl(.2,.24,.06,q.cream,{at:[0,.03,0]}),J.cyl(.03,.03,.75,q.cream,{at:[0,.4,0]}),J.sphere(.08,q.cream,{at:[0,.8,-.06]}),J.torus(.24,.015,q.sky,{at:[0,.8,.02]})],n,{rotY:r});return i.add(Af(e,`${t}.blades`,[0,1,2].map(e=>J.sphere(.1,q.sky,{at:[Math.cos(e*Math.PI*2/3)*.11,Math.sin(e*Math.PI*2/3)*.11,0],scale:[1,.45,.2],rot:[0,0,e*Math.PI*2/3]})),[0,.8,.02],1.5)),i}function bp(e,t,n,r,i=0){let a=.1,o=r.map(e=>e.w+(e.frame===`gold`?.16:.08)),s=(o.reduce((e,t)=>e+t,0)+a*(r.length-1))/2,c=[],l=[];r.forEach((e,t)=>{let n=o[t];s-=n/2;let r=e.h+(e.frame===`gold`?.16:.08),i=t%2*.05-(e.frame===`wood`?.04:0),u=new Mn().compose(new z(.03,i,s),new At().setFromEuler(new Hn(0,0,-.07)),new z(1,1,1)),d=e.frame===`gold`?[J.box(.04,r,n,up),J.box(.04,e.h+.05,e.w+.05,dp,{at:[.006,0,0]})]:[J.box(.035,r,n,fp),J.box(.035,e.h+.02,e.w+.02,q.cream,{at:[.002,0,0]})];for(let e of d)c.push(e.applyMatrix4(u));l.push(Wf(e.kind,e.w,e.h,u.clone().multiply(new Mn().compose(new z(.0275,0,0),new At().setFromEuler(new Hn(0,Math.PI/2,0)),new z(1,1,1))))),s-=n/2+a});let u=Q(e,t,c,n,{px:1.5,rotY:i});return u.add(Gf(e,l)),u}function xp(e,t,n){let r=[];for(let e=0;e<4;e++)r.push(J.box(.5,.03,.1,cp,{at:[0,.42,.18-e*.125]}));let i=.5;for(let e of[-1,1])r.push(J.box(.05,.75,.04,op,{at:[e*.25,.42+.375*Math.cos(i),-.25-.375*Math.sin(i)],rot:[-.5,0,0]}));for(let e=0;e<6;e++){let t=.08+e*.12;r.push(J.box(.46,.07,.02,cp,{at:[0,.42+t*Math.cos(i),-.25-t*Math.sin(i)+.02],rot:[-.5,0,0]}))}for(let e of[-1,1])r.push(J.rbox(.08,.04,.7,.015,cp,{at:[e*.31,.62,.02]})),r.push(J.box(.05,.62,.05,op,{at:[e*.31,.31,.3]}),J.box(.05,.42,.05,op,{at:[e*.27,.21,-.26]})),r.push(J.box(.04,.04,.56,sp,{at:[e*.29,.12,.02]}));let a=$(e,r,1.5);return a.position.set(...t),a.rotation.y=n,a}function Sp(e,t,n,r){let i=`#2E2C33`,a=Q(e,t,[J.cyl(.2,.24,.05,i,{at:[0,.025,0]}),J.cyl(.025,.03,1.08,i,{at:[0,.56,0]}),J.cyl(.04,.04,.1,`#46434C`,{at:[0,.78,0]})],n,{rotY:r}),o=.3,s=[J.capsule(.1,.1,i,{at:[0,0,-.14],rot:[Math.PI/2,0,0]}),J.cyl(.03,.03,.1,i,{at:[0,-.06,-.12]}),J.torus(o,.012,i,{at:[0,0,0]}),J.torus(o*.65,.005,i,{at:[0,0,.055]}),J.torus(o*.32,.005,i,{at:[0,0,.065]}),J.cyl(.055,.055,.02,i,{at:[0,0,.07],rot:[Math.PI/2,0,0]}),J.torus(o*.95,.006,i,{at:[0,0,-.05]})];for(let e=0;e<16;e++){let t=e/16*Math.PI*2;s.push(J.box(.006,.25,.006,i,{at:[Math.cos(t)*.18,Math.sin(t)*.18,.05],rot:[0,0,t-Math.PI/2]}))}let c=Af(e,`${t}.head`,s,[0,1.16,0],1);return c.add(Af(e,`${t}.blades`,[J.cyl(.05,.05,.06,i,{rot:[Math.PI/2,0,0]}),...[0,1,2].map(e=>J.sphere(.14,`#F2C230`,{at:[Math.cos(e*Math.PI*2/3)*.13,Math.sin(e*Math.PI*2/3)*.13,0],scale:[1,.55,.12],rot:[0,0,e*Math.PI*2/3]}))],[0,0,0],1.5)),a.add(c),a}var Cp={jelly:.65,hop:.7,tilt:.9,shutter:1.2,birds:1.6,cat:1.3,glow:2.2,beep:.6,toot:.7,puff:.6,tick:1.1,flip:.7,rattle:.6,wave:1.6,open:2.2,spin:2.6,stairs:.4},wp=class{kit;active=new Map;shutter={open:!1,value:0};puffs=[];puffGeo;root=new U;constructor(e,t){this.kit=e,this.puffGeo=t.add(new Oa(.06,10,8));for(let e=0;e<14;e++){let e=t.add(new Dr({color:q.cream,transparent:!0,opacity:0,depthWrite:!1})),n=new ei(this.puffGeo,e);n.visible=!1,this.root.add(n),this.puffs.push({mesh:n,mat:e,t:1,from:new z})}}get shutterOpen(){return this.shutter.open}setShutter(e,t=!1){this.shutter.open=e,t?this.shutter.value=+!!e:e&&Y.rattle()}get busy(){return this.active.size>0||(this.shutter.open?this.shutter.value<1:this.shutter.value>0)}poke(t){if(this.active.set(t.id,{p:t,t:0}),t.gentle){Y.ding();return}switch(t.react){case`jelly`:Y.pop();break;case`hop`:Y.boing();break;case`spin`:Y.whir();break;case`open`:Y.fwip();break;case`tilt`:case`flip`:Y.fwip();break;case`shutter`:this.shutter.open?Y.thump():this.setShutter(!0);break;case`birds`:Y.chirp(),setTimeout(()=>Y.chirp(),260);break;case`cat`:Y.meow();break;case`beep`:Y.beep();break;case`toot`:Y.toot();break;case`puff`:Y.puff();break;case`tick`:Y.tick();break;case`wave`:e.sparkle();break;case`stairs`:Y.pop();break;case`glow`:Y.ding();break;case`gecko`:Y.tukkae();break;case`rattle`:Y.jiggle()}}update(e,t){let r=this.kit.parts,o=e=>r.get(e);for(let t of[`fan`,`room-fan`]){let n=o(`${t}.blades`),r=this.active.get(t);n&&(n.rotation.z-=e*(r?22:7))}let s=o(`fan.head`);s&&(s.rotation.y=Math.sin(t*.45)*.55);let c=o(`lucky-cat.paw`);c&&(c.rotation.x=this.active.has(`lucky-cat`)?-.7+Math.sin(t*16)*.6:-.5+Math.sin(t*3)*.35);let l=o(`cat.tail`);l&&(l.rotation.z=.6+Math.sin(t*1.6)*.25);for(let e=0;e<3;e++){let n=o(`birds.bird${e}`);n&&!this.active.has(`birds`)&&(n.position.y=.12+Math.abs(Math.sin(t*1.3+e*2))*.03)}for(let e of[`altar.flame0`,`altar.flame1`,`shrine.flame0`]){let n=o(e),r=this.active.has(e.split(`.`)[0])?1.5:1;n&&n.scale.setScalar(r*(1+Math.sin(t*13+e.length)*.12))}let u=o(`clock.hands`);if(u&&(u.rotation.x=-t*(this.active.has(`clock`)?9:.6)),Math.random()<e*.9)for(let e of[`altar.smoke`,`shrine.smoke`])this.puff(o(e));let d=+!!this.shutter.open;this.shutter.value+=i(d-this.shutter.value,-e/1.1,e/1.1);let f=o(`shutter.curtain`);f&&(f.scale.y=1-.94*this.shutter.value);for(let[n,r]of this.active){r.t+=e;let a=(r.p.gentle?2.2:Cp[r.p.react])??.6,o=i(r.t/a),s=this.kit.pokes.get(n);(r.p.gentle||this.kit.parts.has(`${n}.smoke`))&&this.gentle(n,r,e),!r.p.gentle&&s&&this.react(n,r.p.react,s,o,t),o>=1&&(this.active.delete(n),s&&!r.p.gentle&&this.rest(n,r.p.react,s))}for(let t of this.puffs){if(t.t>=1)continue;t.t+=e/2.4;let r=i(t.t);t.mesh.position.set(t.from.x+Math.sin(r*6+t.from.z)*.06,t.from.y+r*.7,t.from.z),t.mesh.scale.setScalar(.5+r*1.6),t.mat.opacity=.55*n(a(r,0,1))*(1-r*.3),t.t>=1&&(t.mesh.visible=!1)}}puff(e){if(!e||!e.visible||!Ep(e))return;let t=this.puffs.find(e=>e.t>=1);t&&(e.getWorldPosition(t.from),t.t=0,t.mesh.visible=!0)}gentle(e,t,n){Math.random()<n*4&&t.t<1.2&&this.puff(this.kit.parts.get(`${e}.smoke`)??this.kit.pokes.get(e))}react(e,t,i,o,s){let c=this.kit.parts,l=e=>{let t=1+r(o,3)*e;i.scale.set(1/Math.sqrt(t),t,1/Math.sqrt(t))},u=[...c.entries()].filter(([t])=>t.startsWith(`${e}.hop`)),d=[...c.entries()].filter(([t])=>t.startsWith(`${e}.hinge`));switch(t){case`jelly`:l(.16);break;case`toot`:l(.12),i.position.y=i.userData.baseY+n(a(o,0,.5))*.15;break;case`beep`:{i.position.y=i.userData.baseY+n(a(o,0,.4))*.08;let t=c.get(`${e}.light`);t&&t.scale.setScalar(1+n(o)*.8);break}case`hop`:case`open`:u.forEach(([,e],t)=>e.position.y=e.userData.baseY+n(a(o,t*.07,t*.07+.45))*.18),d.forEach(([,e])=>{let t=a(o,0,.18)*(1-a(o,.7,1));e.userData.swingX?e.rotation.x=e.userData.swingX*t:e.rotation.y=(e.userData.swing??1)*t}),!u.length&&!d.length&&l(.1);break;case`tilt`:i.rotation.x=r(o,2)*.12;break;case`birds`:for(let t=0;t<3;t++){let r=c.get(`${e}.bird${t}`);if(!r)continue;let i=a(o,t*.1,.75+t*.08);r.position.y=.12+n(i)*1.3,r.scale.y=i>0&&i<1?1+Math.sin(s*40)*.25:1}break;case`cat`:{let e=c.get(`cat.body`);e&&e.scale.set(1+n(o)*.3,1-n(o)*.12,1);let t=c.get(`cat.tail`);t&&(t.rotation.z=.6+Math.sin(o*30)*.5);break}case`puff`:i.scale.set(1+n(o)*.15,1+n(o)*.3,1+n(o)*.15);break;case`tick`:l(.08);break;case`flip`:{let t=c.get(`${e}.page`);t&&(t.rotation.x=-Math.PI*a(o,0,.6)*(o<1));break}case`shutter`:this.shutter.open&&this.shutter.value>=1&&l(.04);break;case`stairs`:i.scale.y=1+n(o)*.02;break;case`rattle`:i.position.x=i.userData.baseX+Math.sin(o*Math.PI*9)*.012*(1-o)}}rest(e,t,n){n.scale.set(1,1,1),n.rotation.x=0,n.userData.baseY!==void 0&&(n.position.y=n.userData.baseY),t===`rattle`&&(n.position.x=n.userData.baseX);for(let[t,n]of this.kit.parts)t.startsWith(`${e}.`)&&(t.includes(`.hop`)&&(n.position.y=n.userData.baseY),t.includes(`.hinge`)&&n.rotation.set(0,0,0),t.endsWith(`.page`)&&(n.rotation.x=0),t.endsWith(`.light`)&&n.scale.setScalar(1),t.includes(`.bird`)&&(n.scale.y=1));t===`cat`&&this.kit.parts.get(`cat.body`)?.scale.set(1,1,1)}};function Tp(e){for(let t of e.pokes.values())t.userData.moves||Object.assign(t.userData,{baseY:t.position.y,baseX:t.position.x});for(let t of e.parts.values())t.userData.baseY=t.position.y}function Ep(e){for(let t=e;t;t=t.parent)if(!t.visible)return!1;return!0}var Dp=`#F3E6D2`,Op=`#F7EBD6`,kp=`#E07A6A`,Ap=`#EE7B70`,jp=`#9B6A55`,Mp=`#F6EEDC`;function Np(e){let{x0:t,xLanding:n,x1:r,zFront:i,mid:a,zBack:o,steps:s}=Z.stairs,{g0:c}=Z,l=[],u=[],d=i-a,f=a-o;for(let e=1;e<=s;e++){let t=hf*e,n=r-gf*(e-.5);l.push(J.box(gf+.005,t,d,Dp,{at:[n,t/2,mf.up1]})),u.push(J.box(gf-.03,.02,d-.02,Op,{at:[n-.01,t+.01,mf.up1]}),J.box(.05,.035,d,kp,{at:[n+gf/2-.02,t-.005,mf.up1]}))}let p=hf*(s+1);l.push(J.box(n-t,p,i-o,Dp,{at:[(t+n)/2,p/2,(i+o)/2]})),u.push(J.box(n-t-.02,.02,i-o-.02,Op,{at:[(t+n)/2,p+.01,(i+o)/2]}),J.box(.05,.035,d,kp,{at:[n+.02,p-.005,mf.up1]}));for(let e=1;e<=s;e++){let t=p+hf*e,r=n+gf*(e-.5);l.push(J.box(gf+.005,t,f,Dp,{at:[r,t/2,mf.up2]})),u.push(J.box(gf-.03,.02,f-.02,Op,{at:[r+.01,t+.01,mf.up2]}),J.box(.05,.035,f,kp,{at:[r-gf/2+.02,t-.005,mf.up2]}))}l.push(J.box(.15,c,i-o,Mp,{at:[t-.075,c/2,(i+o)/2]}));let m=Q(e,`stairs-up`,[],[0,0,0]);m.add($(e,l,2),$(e,u,1));let h=[],g=i-.04,_=o+.04;return Pp(h,[r-.05,hf,g],[n,p,g]),Pp(h,[n,p,g],[t+.04,p,g]),Pp(h,[n,p,a],[r,c-hf,a]),Pp(h,[t+.04,p,_],[n,p,_]),Pp(h,[n,p,_],[r,c-hf,_]),m.add($(e,h,1.5)),m}function Pp(e,t,n,r=.9){let i=n[0]-t[0],a=n[1]-t[1],o=n[2]-t[2],s=Math.hypot(i,o),c=Math.max(1,Math.round(s/.13));for(let n=0;n<=c;n++){let s=n/c;e.push(J.box(.03,r,.03,Ap,{at:[t[0]+i*s,t[1]+a*s+r/2,t[2]+o*s]}))}let l=Math.hypot(s,a),u=[t[0]+i/2,t[1]+a/2+r+.03,t[2]+o/2];Math.abs(o)<1e-6?e.push(J.box(l+.06,.06,.07,jp,{at:u,rot:[0,0,Math.atan2(a,i)]})):e.push(J.box(.07,.06,l+.06,jp,{at:u,rot:[Math.atan2(-a,o),0,0]}))}var Fp=`#CFC8E3`,Ip=`#EEE7F8`,Lp=`#D2C4F4`,Rp=`#FFD9C4`,zp=`#BFE6DA`,Bp=`#9FD3C4`,Vp=`#A99BE0`,Hp=`#EBA27E`,Up=`#7FCB8F`,Wp=2.8,Gp=.66,Kp=Z.houseW/2-.11,qp=Z.right-Z.left;function Jp(e){let t=new U,n=new U,r=new U,i=new U,a=new U,o=new U,s=new U,c=new U,l=Array.from({length:9},(e,t)=>J.box(1.4,.01,.16,q.butter,{at:[-16+t*4,.005,(Z.curb+Z.roadFar)/2]}));t.add($(e,[J.box(60,.1,Z.roadFar-Z.curb+14,Fp,{at:[0,-.06,(Z.curb+Z.roadFar)/2+7]}),...l],0),$(e,[J.box(36,.16,Z.curb,Ip,{at:[0,-.07,Z.curb/2]}),J.box(36,.16,.14,Lp,{at:[0,-.07,Z.curb-.07]})],2));let u=[{x:Z.row[0],floors:4,wall:`#CFF0E4`,shutter:`#B7D8EA`,sign:q.sky},{x:Z.row[1],floors:3,wall:`#E3DAFF`,shutter:`#C9DDE8`,sign:q.butter},{x:Z.row[3],floors:3,wall:`#CDE7FF`,shutter:`#D6E6C9`,sign:q.pink},{x:Z.row[4],floors:4,wall:`#FFF0B8`,shutter:`#C9C3E8`,sign:q.mint}];for(let t of u){let r=Z.g0+(t.floors-1)*Z.g1,i=[J.box(5.4-.06,r+.6,-Z.back,t.wall,{at:[t.x,(r+.6)/2,Z.back/2]})];for(let e=1;e<t.floors;e++){let n=Z.g0+(e-1)*Z.g1;for(let e of[-1.25,1.25])i.push(J.rbox(1.3,1.4,.1,.04,Vp,{at:[t.x+e,n+1.5,.03]}));i.push(J.box(5.4-.8,.1,.5,q.cream,{at:[t.x,n+.6,.25]}))}i.push(J.box(4.4,.5,.1,t.sign,{at:[t.x,3.25,.06]})),n.add($(e,i,2));let a=Array.from({length:9},(e,t)=>J.box(4.7,.025,.02,q.ink,{at:[0,.3+t*.3,.06]})),o=[J.box(5.4-.6,2.9,.08,t.shutter,{at:[0,1.45,.02]}),...a];t.x===Z.row[1]?n.add(Q(e,`neighbor-left`,o,[t.x,0,0])):n.add($(e,o.map(e=>e.translate(t.x,0,0)),1.5))}n.add(Q(e,`neighbor-right`,[J.rbox(4.4,.12,1.1,.05,q.hotpink,{at:[0,0,.45],rot:[.28,0,0]}),...[-1.5,0,1.5].map(e=>J.sphere(.12,q.butter,{at:[e,-.16,.95]}))],[Z.row[3],2.75,0],{px:2})),i.add($(e,[J.box(.22,Z.g0,.4,Rp,{at:[-Kp,Z.g0/2,.05]}),J.box(Z.houseW,Z.g0-Wp,.4,Rp,{at:[0,(Z.g0+Wp)/2,.05]}),J.cyl(.16,.16,qp,`#9FD3C4`,{at:[0,Wp,.12],rot:[0,0,Math.PI/2]})])),a.add($(e,[J.box(.22,Z.g0,.4,Rp,{at:[Kp,Z.g0/2,.05]})])),i.add(Q(e,`sign`,[J.rbox(3.6,.4,.1,.04,`#F0646E`),J.rbox(3.76,.52,.06,.03,q.gold,{at:[0,0,-.03]})],[0,3.1799999999999997,.3]));let d=Af(e,`shutter.curtain`,[J.box(qp,Wp,.06,zp,{at:[0,-2.8/2,0]}),...Array.from({length:13},(e,t)=>J.box(qp-.04,.03,.02,Bp,{at:[0,-.2-t*.2,.04]})),J.box(.6,.08,.06,`#7FB8A8`,{at:[0,-2.65,.06]})],[0,0,0],2),f=Q(e,`shutter`,[],[0,Wp,.1]);f.add(d),i.add(f);let p=Z.g0;o.add($(e,[...[-1,1].map(e=>J.box(Z.houseW/2-1,Z.g1,.15,Rp,{at:[e*(Z.houseW/2+1)/2,p+Z.g1/2,-.075]})),J.box(2,.7,.15,Rp,{at:[0,p+Z.g1-.35,-.075]}),J.rbox(.8,.55,.32,.05,q.cream,{at:[1.85,p+2.4,.18]}),J.cyl(.18,.18,.04,`#D9D2E8`,{at:[1.85,p+2.4,.35],rot:[Math.PI/2,0,0]})])),o.add($(e,[-1,1].flatMap(e=>[J.box(.98,2.28,.06,`#BFE0F5`,{at:[e*.5,p+1.15,-.075]}),J.box(.6,1.4,.02,`#E6F4FF`,{at:[e*.5,p+1.35,-.035]})]),1.5));let m=[],h=Z.houseW-.4;for(let e=0;e<=15;e++)m.push(J.box(.05,.9,.05,q.cream,{at:[-h/2+.05+e*(h-.1)/15,p+.45,.62]}));m.push(J.box(h,.08,.1,q.cream,{at:[0,p+.92,.62]}),J.box(.08,.08,Gp,q.cream,{at:[-h/2+.02,p+.92,Gp/2]}),J.box(.08,.08,Gp,q.cream,{at:[h/2-.02,p+.92,Gp/2]})),s.add($(e,[J.box(h+.2,.18,.7000000000000001,Rp,{at:[0,p-.09,Gp/2]})]),$(e,m,1.5)),s.add($(e,[J.cyl(.18,.13,.3,Hp,{at:[1.9,p+.15,.36]}),J.sphere(.24,Up,{at:[1.9,p+.45,.36]}),...[0,2,4].map(e=>J.sphere(.06,q.hotpink,{at:[1.9+Math.cos(e)*.18,p+.55,.36+Math.sin(e)*.18]}))])),c.add($(e,[J.box(Z.houseW,.2,.3-Z.back,Rp,{at:[0,p+Z.g1+.1,Z.back/2-.15]}),J.box(Z.houseW,.7,.2,Rp,{at:[0,p+Z.g1+.55,-.1]}),J.box(Z.houseW+.2,.12,.34,q.cream,{at:[0,p+Z.g1+.95,-.1]}),J.cyl(.55,.55,1.2,q.sky,{at:[-1.3,p+Z.g1+.8,-12]}),J.cone(.58,.3,q.sky,{at:[-1.3,p+Z.g1+1.55,-12]})])),n.add($(e,[-8.1,8.1].map(e=>J.cyl(.11,.14,7.4,`#D8D2E6`,{at:[e,3.7,2.35]})),1.5));let g=Bl(q.ink);for(let[t,r]of[[6.6,.55],[6.3,.7],[6,.45]]){let i=[-17,-8.1,0,8.1,17].map((e,n)=>new z(e,t-(n===2?r:n%2?0:r*.8),2.35)),a=e.bag.add(new Aa(new oa(i),60,.018,5));n.add(new ei(a,g))}let _=Q(e,`birds`,[],[6.3,5.75,2.35]);return[-.55,0,.5].forEach((t,n)=>{let r=Af(e,`birds.bird${n}`,[J.sphere(.13,n===1?q.sky:q.lavenderDark,{scale:[1.15,1,.9]}),J.sphere(.085,n===1?q.sky:q.lavenderDark,{at:[.11,.1,0]}),J.cone(.03,.08,q.gold,{at:[.2,.1,0],rot:[0,0,-Math.PI/2]}),J.sphere(.02,q.ink,{at:[.15,.14,.06]})],[t,.12,0],1.5);r.rotation.y=n===1?Math.PI:0,_.add(r)}),n.add(_),r.add(Yp(e),Xp(e),Zp(e),Qp(e)),r.add(Q(e,`pot-left`,[J.cyl(.24,.17,.42,Hp,{at:[0,.21,0]}),J.sphere(.3,Up,{at:[0,.62,0]}),...[0,1.2,2.4,3.6,4.8].map(e=>J.sphere(.09,q.hotpink,{at:[Math.cos(e)*.24,.7+e%2*.1,Math.sin(e)*.24]}))],[-2.2,0,.4]),Q(e,`pot-right`,[J.cyl(.24,.17,.42,Hp,{at:[0,.21,0]}),J.cyl(.04,.05,.4,`#B98A6A`,{at:[0,.6,0]}),J.sphere(.34,Up,{at:[0,.95,0]}),...[.5,2.2,4].map(e=>J.sphere(.07,`#D4F07A`,{at:[Math.cos(e)*.3,.95,Math.sin(e)*.3]}))],[2.2,0,.4]),Q(e,`basil`,[J.cyl(.2,.15,.3,Hp,{at:[0,.15,0]}),...[0,2.1,4.2].map(e=>J.sphere(.13,`#6FBF7F`,{at:[Math.cos(e)*.1,.4,Math.sin(e)*.1]}))],[-7,0,.45])),{ground:t,tall:n,props:r,front:i,frontRight:a,upperFront:o,balcony:s,roof:c}}function Yp(e){return Q(e,`spirit-house`,[J.cyl(.11,.14,1.15,q.cream,{at:[0,.575,0]}),J.rbox(.7,.07,.6,.02,q.cream,{at:[0,1.17,0]}),J.rbox(.42,.36,.36,.03,q.gold,{at:[0,1.38,0]}),J.box(.16,.22,.02,`#D9534F`,{at:[0,1.32,.18]}),J.cone(.36,.28,`#E2525C`,{at:[0,1.7,0],rot:[0,Math.PI/4,0]},4),J.cone(.2,.3,q.gold,{at:[0,1.95,0],rot:[0,Math.PI/4,0]},4),J.cone(.025,.18,q.gold,{at:[0,2.17,0]}),J.torus(.12,.03,`#FF9F45`,{at:[-.2,1.24,.22],rot:[Math.PI/2,0,0]}),J.cyl(.035,.035,.12,`#E2525C`,{at:[.22,1.26,.2]}),J.cyl(.006,.006,.2,`#B98A6A`,{at:[.05,1.3,.24]})],[4.3,0,.5])}function Xp(e){let t=e=>[J.torus(.24,.07,q.ink,{at:[e,.3,0]}),J.cyl(.08,.08,.12,`#D8D2E6`,{at:[e,.3,0],rot:[Math.PI/2,0,0]})],n=Q(e,`motorbike`,[...t(-.55),...t(.55),J.rbox(1,.32,.34,.12,`#FF7FA8`,{at:[-.05,.55,0]}),J.rbox(.6,.1,.3,.05,q.ink,{at:[-.15,.74,0]}),J.rbox(.18,.6,.22,.06,`#FF7FA8`,{at:[.48,.72,0],rot:[0,0,-.35]}),J.cyl(.025,.025,.6,q.ink,{at:[.6,1.02,0],rot:[Math.PI/2,0,0]}),J.rbox(.3,.18,.4,.05,q.lavenderDark,{at:[-.62,.72,0]})],[-4.5,0,1.7]);return n.add(Af(e,`motorbike.light`,[J.sphere(.09,q.butter,{scale:[.6,1,1]})],[.66,.9,0],1.5)),n}function Zp(e){let t=Q(e,`cat`,[],[6.4,0,.55],{rotY:-.5});return t.add(Af(e,`cat.body`,[J.capsule(.15,.32,`#FFB677`,{at:[0,.16,0],rot:[0,0,Math.PI/2]}),J.sphere(.15,`#FFB677`,{at:[.3,.26,0]}),J.cone(.06,.1,`#FFB677`,{at:[.32,.42,.08]}),J.cone(.06,.1,`#FFB677`,{at:[.32,.42,-.08]}),J.box(.02,.012,.06,q.ink,{at:[.44,.28,.05]}),J.box(.02,.012,.06,q.ink,{at:[.44,.28,-.05]}),...[-.12,.02,.16].map(e=>J.box(.05,.02,.3,`#F29A57`,{at:[e,.31,0]}))],[0,0,0],2)),t.add(Af(e,`cat.tail`,[J.capsule(.04,.3,`#F29A57`,{at:[0,.17,0]})],[-.3,.12,0],1.5)),t}function Qp(e){let t=e=>J.torus(.2,.08,q.ink,{at:e});return Q(e,`tuk-tuk`,[t([.85,.28,0]),t([-.6,.28,-.55]),t([-.6,.28,.55]),J.rbox(2.1,.5,1.2,.12,q.sky,{at:[0,.62,0]}),J.rbox(.7,.55,.9,.12,`#FF7FA8`,{at:[.75,1.1,0]}),J.rbox(1.2,.5,1.15,.1,q.lavender,{at:[-.4,1.1,0]}),J.rbox(2.3,.12,1.4,.06,q.hotpink,{at:[-.1,1.95,0]}),...[[1.05,.62],[1.05,-.62],[-1.1,.62],[-1.1,-.62]].map(([e,t])=>J.cyl(.035,.035,.95,q.cream,{at:[e,1.45,t]})),J.sphere(.1,q.butter,{at:[1.12,.75,0],scale:[.5,1,1]})],[9.8,0,3.95])}var $p=6.7,em=30,tm=class{root=new U;cars;constructor(e){let t=(e,t,n=.22)=>J.torus(n,n*.35,q.ink,{at:[e,n,t]}),n=new U;n.add($(e,[t(-.5,0),t(.5,0),J.rbox(.95,.3,.32,.12,q.mint,{at:[0,.5,0]}),J.rbox(.2,.55,.24,.06,q.mint,{at:[-.45,.68,0],rot:[0,0,.35]}),J.capsule(.17,.25,`#FFB896`,{at:[.1,.95,0]}),J.sphere(.2,q.hotpink,{at:[.05,1.42,0]}),J.box(.04,.12,.3,`#5A8FD8`,{at:[-.13,1.4,0]}),...[-1,1].map(e=>J.capsule(.05,.3,`#FFB896`,{at:[-.18,1,e*.15],rot:[0,0,1.1]}))]));let r=new U;r.add($(e,[...[-.7,.7].flatMap(e=>[t(e,-.62,.26),t(e,.62,.26)]),J.rbox(2.3,.6,1.3,.2,`#FF8FB8`,{at:[0,.6,0]}),J.rbox(1.3,.5,1.2,.2,`#FF8FB8`,{at:[.15,1.1,0]}),...[-1,1].map(e=>J.box(1.1,.34,.02,`#CDEBFF`,{at:[.15,1.12,e*.61]})),J.box(.02,.34,1,`#CDEBFF`,{at:[-.51,1.12,0]}),J.rbox(.5,.14,.24,.05,q.butter,{at:[.15,1.42,0]}),J.sphere(.1,q.butter,{at:[-1.15,.65,.45],scale:[.5,1,1]}),J.sphere(.1,q.butter,{at:[-1.15,.65,-.45],scale:[.5,1,1]})])),this.cars=[{g:n,speed:6.5,wait:3,honked:!1},{g:r,speed:4.6,wait:11,honked:!1}];for(let e of this.cars)e.g.position.set(em,0,$p),this.root.add(e.g)}update(e,t){for(let n of this.cars){if(n.wait>0){n.wait-=e;continue}let r=n.g.position;r.x-=n.speed*e,r.y=Math.abs(Math.sin(r.x*3))*.015,!n.honked&&r.x<4&&(n.honked=!0,t&&Y.putt()),r.x<-30&&(r.x=em,n.honked=!1,n.wait=6+Math.random()*10)}}},nm=`#E2E0DC`,rm=`#F4F1EC`,im=`#C3C7CD`,am=`#E9B98E`,om=`#C9B8FF`,sm=`#B4A0F2`,cm=`#D8D2E6`;function lm(e){let t=new U,n=new U,r=new U,{left:i,right:a,back:o,g0:s,g1:c}=Z,{x1:l,zFront:u,zBack:d}=Z.stairs,{zFront:f,zGlass:p,door0:m,door1:h}=Z.hall,g=-o;t.add($(e,[J.box(a-i+.3,.2,f-u,nm,{at:[0,s-.1,(u+f)/2]}),J.box(a+.15-l,.2,u-d,nm,{at:[(l+a+.15)/2,s-.1,(u+d)/2]}),J.box(a-i+.3,.2,d-o,nm,{at:[0,s-.1,(d+o)/2]})]),...$f(e,[[i,a,u,f],[l,a,d,u],[i,a,o,d]],s+.002)),t.add($(e,[J.box(.15,c,g,rm,{at:[i-.075,s+c/2,o/2]}),J.box(a-i+.3,c,.15,rm,{at:[0,s+c/2,o-.075]}),J.box(.03,.12,g,`#CFC8BE`,{at:[i+.015,s+.06,o/2]}),...[[-16.998,q.pink],[-17.898,q.butter],[-18.698,q.sky],[-19.898,q.mint]].map(([e,t],n)=>J.box(.02,.36,.3,t,{at:[i+.01,s+1.45+n%2*.18,e],rot:[n%2?.08:-.06,0,0]}))])),n.add($(e,[J.box(.15,c,g,rm,{at:[a+.075,s+c/2,o/2]})])),t.add(Q(e,`plant`,[J.cyl(.18,.13,.3,`#EBA27E`,{at:[0,.15,0]}),J.sphere(.24,`#7FCB8F`,{at:[0,.45,0]}),...[0,2,4].map(e=>J.sphere(.06,q.hotpink,{at:[Math.cos(e)*.18,.55,Math.sin(e)*.18]}))],[2.1,s,-7.85]));let _=[];Pp(_,[i,s,f+.04],[a,s,f+.04]),Pp(_,[i,s,u+.04],[l+.04,s,u+.04]),Pp(_,[l+.04,s,u],[l+.04,s,Z.stairs.mid]),Pp(_,[i,s,d-.04],[l+.04,s,d-.04]),t.add(Q(e,`stairs-down`,[],[0,0,0]).add($(e,_,1.5)));let v=[J.box(a-i,.08,.08,cm,{at:[0,s+2.3,p]}),J.box(a-i,.06,.08,cm,{at:[0,s+.03,p]})];for(let e of[i+.04,-1.1,.2,m,h,a-.04])v.push(J.box(.06,2.3,.08,cm,{at:[e,s+1.15,p]}));v.push(J.box(a-i,c-2.34,.12,rm,{at:[0,s+2.34+(c-2.34)/2,p]})),r.add($(e,v,1.5));let y=e.bag.add(new Dr({color:`#CFEFFF`,transparent:!0,opacity:.28,depthWrite:!1})),b=(t,n,r=p)=>new ei(e.bag.add(J.box(t,2.22,.02,`#FFFFFF`,{at:[n,s+1.15,r]})),y);r.add(b(-1.1-i,(i-1.1)/2),b(1.3,-.45),b(m-.2,(.2+m)/2),b(a-h,(h+a)/2));let x=h-m,S=Q(e,`glass-doors`,[],[(.2+m)/2,s,p-.07]);S.add(new ei(e.bag.add(J.box(x-.1,2.12,.02,`#FFFFFF`,{at:[0,1.12,0]})),y)),S.add($(e,[J.box(x,.06,.06,cm,{at:[0,2.21,0]}),J.box(x,.06,.06,cm,{at:[0,.03,0]}),...[-1,1].map(e=>J.box(.06,2.24,.06,cm,{at:[e*x/2,1.12,0]})),J.box(.03,.3,.05,q.ink,{at:[x/2-.12,1.1,-.03]})],1.5)),r.add(S);let C=Q(e,`mattress`,[],[-2.275,s,-17.998]);[q.pink,q.lavender,`#FFD3E6`].forEach((t,n)=>{let r=-20.748+1.4333333333333336*(n+.5)- -17.998;C.add($(e,[J.rbox(1.58,.2,1.3933333333333335,.06,q.cream,{at:[0,.1,r]}),J.rbox(1.5,.03,1.2933333333333334,.02,t,{at:[0,.205,r]})],2))}),C.add($(e,[J.rbox(1.2,.12,.5,.05,q.lavenderDark,{at:[0,.27,.9]})],2)),t.add(C),t.add(Q(e,`pillows`,[J.rbox(.62,.16,.4,.07,q.cream,{at:[-.38,.08,0]}),J.rbox(.62,.16,.4,.07,`#FFE3EF`,{at:[.38,.08,0]}),J.box(.62,.012,.06,q.hotpink,{at:[.38,.165,0]})],[-2.275,s+.2,-20.348])),t.add(Q(e,`couch`,[J.rbox(.75,.3,2.4,.08,sm,{at:[0,.2,0]}),J.rbox(.62,.14,1.12,.06,om,{at:[-.04,.41,-.58]}),J.rbox(.62,.14,1.12,.06,om,{at:[-.04,.41,.58]}),J.rbox(.2,.62,2.4,.08,om,{at:[.28,.6,0]}),J.rbox(.72,.42,.18,.07,om,{at:[0,.45,-1.15]}),J.rbox(.72,.42,.18,.07,om,{at:[0,.45,1.15]}),J.rbox(.12,.34,.34,.06,q.butter,{at:[.12,.66,.65],rot:[0,0,.2]})],[2.795,s,-18.598]));let w=Q(e,`suitcase`,[J.rbox(.62,.26,.42,.05,q.hotpink,{at:[0,.13,0]}),J.box(.64,.03,.06,q.gold,{at:[0,.13,.2]})],[-.9,s,-20.448],{rotY:Math.PI}),T=Af(e,`suitcase.hinge`,[J.rbox(.62,.08,.42,.04,q.hotpink,{at:[0,.04,.21]}),J.torus(.06,.015,q.gold,{at:[0,.08,.3],rot:[Math.PI/2,0,0]})],[0,.26,-.21],2);T.userData.swingX=-1.6,w.add(T),t.add(w);let E=Q(e,`wardrobe`,[J.box(1.2,2,.5,am,{at:[0,1,0]})],[.25,s,o+.26]);for(let t of[-1,1]){let n=Af(e,`wardrobe.hinge${t<0?`L`:`R`}`,[J.box(.58,1.86,.04,`#F2CBA6`,{at:[-t*.29,.93,0]}),J.sphere(.03,q.gold,{at:[-t*.5,1,.04]})],[t*.59,.07,.27],1.5);n.userData.swing=-t*1.3,E.add(n)}return t.add(E),t.add(yp(e,`room-fan`,[.4,s,-16.798],Math.PI)),t.add(um(e,[2.2,s,o])),t.add($(e,[J.cyl(.21,.18,.42,`#3D8FD6`,{at:[1.42,s+.21,o+.32]},12),J.torus(.21,.02,`#5AA7E8`,{at:[1.42,s+.42,o+.32],rot:[Math.PI/2,0,0]}),...[.14,.28].flatMap((e,t)=>Array.from({length:9},(n,r)=>{let i=(r+t*.5)/9*Math.PI*2,a=.183+e*.072;return J.cyl(.032,.032,.01,`#E3F1FB`,{at:[1.42+Math.sin(i)*a,s+e,o+.32+Math.cos(i)*a],rot:[0,i+Math.PI/2,Math.PI/2]})}))])),t.add(r),{room:t,rightWall:n,glassWall:r}}function um(e,t){let n=.86,r=2.04,i=`#3A2A22`,a=`#4A4A50`,o=new U;return o.add($(e,[...[-1,1].map(e=>J.box(.07,2.12,.1,i,{at:[t[0]+e*.46499999999999997,t[1]+2.12/2,t[2]+.03]})),J.box(1,.07,.1,i,{at:[t[0],t[1]+r+.045,t[2]+.03]})])),o.add(Q(e,`bathroom-door`,[...[-1,1].map(e=>J.box(.05,r,.04,im,{at:[e*(n/2-.025),r/2,0]})),...[.025,1.18,1.6,2.015].map(e=>J.box(n,e===1.18?.04:.05,.04,im,{at:[0,e,0]})),J.box(.76,1.13,.02,`#B4B9C0`,{at:[0,.6,.004]}),...[-.2,.12].map((e,t)=>J.box(.03,.8-t*.2,.021,`#BCC1C7`,{at:[e,.66+t*.06,.005]})),J.box(.76,.38,.015,a,{at:[0,1.795,0]}),J.box(.76,.38,.015,a,{at:[0,1.39,0]}),J.box(.22,.44,.05,im,{at:[-.27,1.37,.01]}),J.box(.15,.36,.052,`#5A5A60`,{at:[-.27,1.37,.01]}),J.box(.02,.07,.03,`#8E949C`,{at:[-.37,1.45,.04]}),J.cyl(.03,.03,.02,`#9AA0A8`,{at:[n/2-.1,1,.03],rot:[Math.PI/2,0,0]}),J.box(.13,.025,.03,`#9AA0A8`,{at:[n/2-.15,1,.05]})],[t[0],t[1],t[2]+.03],{px:1.5})),o}var dm=Math.PI/180,fm=.9,pm=9.8,mm=new z,hm=new z,gm=[...sf.map(e=>({id:e.id,label:e.label,kind:`thing`})),...xu.map(e=>({id:`family:${e.id}`,label:e.name,name:e.name,thai:e.thai,kind:`family`})),{id:`family:kaylee`,label:`Kaylee`,name:`Kaylee`,kind:`family`}],_m=class{renderer;events;scene=new Ti;rig=new Eu;bag=new Ou;kit={bag:this.bag,pokes:new Map,parts:new Map};reactor;lights=Vl(this.scene);kaylee;family=new Map;photo=null;nav;marker;gecko;traffic;raycaster=new vo;groups;cuts=[];mode=`street`;spot=`street`;using;climbing=!1;arrival=null;tuk=null;tukDrive=null;w=1;h=1;time=0;vel=new z;lastPos=new z;anchorEls=new Map;hovered=null;greeted=new Map;lead=null;stats={fps:0,p95:0,calls:0,tris:0};quiet=!0;constructor(e,t,n){this.renderer=e,this.events=n;let{scene:r,kit:i}=this;r.background=new H(q.sky),Rl();let a=Jp(i),o=vp(i),s=lm(i),c=Np(i);this.gecko=new Pf(i),o.room.add(this.gecko.root),this.traffic=new tm(i),r.add(this.traffic.root);let l=new U;l.add(s.room,s.rightWall);let u=new U,d=a.upperFront;u.add(l,a.balcony,d);let f=new U;f.add(o.room,o.rightWall),r.add(a.ground,a.tall,a.props,a.front,a.frontRight,a.roof,f,c,u),this.groups={tall:a.tall,props:a.props,roof:a.roof,upper:u,upperRoom:l,upperFront:d,front:a.front,groundRoom:f,stairs:c},this.cuts.push({obj:o.rightWall,low:1/Z.g0,when:e=>e!==`street`,value:1},{obj:a.frontRight,low:1/Z.g0,when:e=>e!==`street`,value:1},{obj:s.rightWall,low:1/Z.g1,when:e=>e===`inside1`,value:1},{obj:d,low:.12,when:e=>e===`inside1`,value:1},{obj:s.glassWall,low:.12,when:e=>e===`inside1`&&this.kaylee.position.z<Z.hall.zGlass-.1,value:1});let p=[s.rightWall,d,s.glassWall];for(let e of this.cuts)e.obj.userData.cutBase=p.includes(e.obj)?Z.g0:0;this.reactor=new wp(i,this.bag),r.add(this.reactor.root),this.tuk=i.pokes.get(`tuk-tuk`)??null,Tp(i);for(let e of xu){let t=new wu(e,this.bag);this.family.set(e.id,t),r.add(t.root)}this.kaylee=new bu(this.bag),r.add(this.kaylee.root),this.marker=new ju(this.bag),r.add(this.marker.root),this.nav={0:this.buildNav(0),1:this.buildNav(1)},this.begin(t),this.quiet=!1}buildNav(e){let t=uf[e],n=new Df(t.bounds[0],t.bounds[2],t.bounds[1],t.bounds[3],.2,.22);for(let e of t.carve)n.carve(...e);for(let e of t.block)n.block(...e);for(let[e,r,i]of t.circles)n.blockCircle(e,r,i);for(let t of xu)t.spot&&t.spot.floor===e&&t.spot.pose===`stand`&&n.blockCircle(t.spot.x,t.spot.z,.19*t.height);return n.commit(),n}begin(e){if(e.section===`family`)return this.beginPhoto(e.who);let t=ff[e.section];this.kaylee.floor=t.floor,this.kaylee.place(t.x,t.floor*Z.g0,t.z,t.face),this.reactor.setShutter(e.section===`downstairs`||e.section===`upstairs`,!0),this.spot=e.section===`arrive`?`street`:e.section,this.mode=e.section===`upstairs`?`inside1`:e.section===`downstairs`?`inside0`:`street`,this.applyShutterNav(),e.section===`arrive`?this.arrival={t:0,done:!1}:this.tuk&&this.parkTuk();let n=e.at?sf.find(t=>t.id===e.at):void 0;n?.use&&n.floor===t.floor&&n.area===`inside`==(e.section!==`street`&&e.section!==`arrive`)&&(this.kaylee.place(n.use.x,t.floor*Z.g0,n.use.z,n.use.face),this.useSpot(n,!0));for(let e of this.cuts)e.value=e.when(this.mode)?e.low:1;this.applyVisibility(),this.rig.setShot(this.shot(),!0)}beginPhoto(e){let t=e&&(e===`kaylee`||this.family.has(e))?e:null;this.photo={who:t},this.mode=`street`,this.spot=`street`,this.reactor.setShutter(!1,!0),this.applyShutterNav(),this.parkTuk(),this.layoutPhoto(),t===`kaylee`?this.kaylee.place(0,0,1.3,0):t&&this.family.get(t)?.place(0,0,1.3,0),this.kaylee.root.visible=!t||t===`kaylee`;for(let e of this.cuts)e.value=1;this.applyVisibility(),this.rig.setShot(this.shot(),!0)}layoutPhoto(){if(!this.photo||this.photo.who)return;let e=this.w<this.h?.68:1;pf.back.forEach((t,n)=>this.family.get(t)?.place((n-(pf.back.length-1)/2)*pf.spacing*e,0,pf.backZ,0));for(let[t,n]of pf.front)t===`kaylee`?this.kaylee.place(n*e,0,pf.frontZ,0):this.family.get(t)?.place(n*e,0,pf.frontZ,0)}skipArrival(){this.arrival&&!this.arrival.done&&(this.arrival.t=99)}get arriving(){return!!this.arrival&&!this.arrival.done}parkTuk(){this.tuk&&(this.tuk.position.set(pm,0,3.95),this.tuk.userData.baseY=0,this.tukDrive=null)}setAnchorElements(e){this.anchorEls=e}pointerDown(e,t){this.lead={x:e,y:t,last:performance.now()}}pointerMove(e,t,n,r,i){if(!i){this.hover(e,t);return}if(!this.lead||this.arriving||this.climbing||this.photo||Math.hypot(e-n,t-r)<12)return;let a=performance.now();if(a-this.lead.last<150)return;this.lead.last=a;let o=this.floorPoint(e,t);o&&this.walkTo([o.x,o.z],void 0,!1)}pointerUp(){this.lead=null}tap(e,t,n){if(this.arriving){this.skipArrival();return}let r=n??this.pick(e,t);if(r===`kaylee`||r===`family:kaylee`){this.kaylee.react(`hop`),Y.boing();return}if(r?.startsWith(`family:`))return this.photo?this.cheer(r.slice(7)):this.greet(r.slice(7));if(this.photo)return;let i=r?sf.find(e=>e.id===r):void 0;if(i&&this.allowed(i))return this.usePickable(i);let a=this.floorPoint(e,t);a&&this.walkTo([a.x,a.z],void 0,!0)}hover(e,t){if(!matchMedia(`(hover: hover)`).matches)return;let n=this.pick(e,t);n!==this.hovered&&(this.highlight(this.hovered,!1),this.hovered=n,this.highlight(n,!0),this.renderer.domElement.style.cursor=n?`pointer`:`default`)}hoverAnchor(e){e!==this.hovered&&(this.highlight(this.hovered,!1),this.hovered=e,this.highlight(e,!0))}highlight(e,t){e&&(e.startsWith(`family:`)?this.family.get(e.slice(7))?.root:this.kit.pokes.get(e))?.traverse(e=>{e.isMesh&&e.userData.hull!==void 0&&Xl(e,t)})}ndc(e,t){return new R(e/this.w*2-1,-(t/this.h)*2+1)}pick(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.rig.camera);let n=[this.kaylee.root,...[...this.family.values()].map(e=>e.root),...this.kit.pokes.values()];for(let e of this.raycaster.intersectObjects(n,!0)){if(!xm(e.object))continue;let t=e.object;for(;t&&t.userData.pick===void 0;)t=t.parent;let n=t?.userData.pick;if(!n)continue;if(n===`kaylee`||n.startsWith(`family:`))return this.familyVisible(n)?n:null;let r=sf.find(e=>e.id===n);if(r&&this.allowed(r))return n}return null}floorPoint(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.rig.camera);let n=new zi(new z(0,1,0),-this.kaylee.floor*Z.g0);return this.raycaster.ray.intersectPlane(n,new z)}allowed(e){return e.floor===this.kaylee.floor?e.floor===1?!0:e.area===`street`?this.mode===`street`:this.mode===`inside0`:!1}familyShown(e){if(this.photo)return!this.photo.who||this.photo.who===e.id;let t=e.spot;return t?t.floor===1?this.mode===`inside1`:t.z>0?this.mode===`street`:this.mode!==`street`||this.reactor.shutterOpen:!1}familyVisible(e){if(e===`kaylee`||e===`family:kaylee`)return!this.photo||!this.photo.who||this.photo.who===`kaylee`;let t=xu.find(t=>`family:${t.id}`===e);return t&&this.photo?this.familyShown(t):!t?.spot||t.spot.floor!==this.kaylee.floor||!this.familyShown(t)?!1:!(this.mode===`street`&&t.spot.z<0)}walkTo(e,t,n=!0){if(this.climbing)return;let r=this.kaylee,i=r.floor,a=this.nav[i].path([r.position.x,r.position.z],e);if(this.using=void 0,a){if(n){let e=a[a.length-1];this.marker.show(e[0],i*Z.g0,e[1])}r.walk(a,t)}}usePickable(e){this.reactor.poke(e),this.events.onPoke?.(e.id);let t=this.kaylee;if(e.react===`stairs`)return this.climb(e.floor===0);if(e.id===`gecko`&&this.gecko.scare(),e.id===`shutter`&&e.use){this.applyShutterNav(),this.applyVisibility(),this.mode===`street`?this.walkTo([e.use.x,e.use.z]):this.walkTo([.2,1.4]);return}if(this.using===e.id&&e.use){e.use.pose===`bounce`?(Y.boingAt(t.bounceHigher()),t.face(t.pose===`lie`?0:e.use.face*dm)):t.react(`wiggle`);return}if(!e.use){let n=this.atOf(e);t.lookAt(n.x,n.y,n.z),t.faceToward(n.x,n.z);return}let n=e.use;this.walkTo([n.x,n.z],()=>this.useSpot(e)),t.lookAt(...e.at)}useSpot(e,t=!1){let n=e.use,r=this.kaylee,i=r.floor*Z.g0;this.using=e.id,r.face(n.face*dm),e.gentle&&r.lookAt(...e.at);let a=()=>{n.pose===`bounce`?Y.boingAt(r.bounceHigher()):r.setPose(n.pose),this.quiet||this.events.onSpot(this.spot,e.id)};if(n.snap){r.standPoint=new z(n.x,i,n.z);let e=new z(n.snap.x,i+n.snap.y,n.snap.z);t?(r.position.copy(e),a()):r.hopTo(e,.32,.25,()=>{r.face(n.face*dm),a()})}else a()}greet(e){let t=xu.find(t=>t.id===e),n=this.family.get(e);if(!t?.spot||!n||!this.familyVisible(`family:${e}`))return;n.react(`wave`),this.hello(t,n);let r=t.spot.face*dm,i=[t.spot.x+Math.sin(r)*.95,t.spot.z+Math.cos(r)*.95];this.walkTo(i,()=>{let e=this.kaylee;e.faceToward(t.spot.x,t.spot.z),e.react(`hop`),n.react(`hop`),Y.boing(),setTimeout(()=>e.react(`wave`),450)})}cheer(e){let t=xu.find(t=>t.id===e),n=this.family.get(e);t&&n&&this.familyShown(t)&&(n.react(`hop`),n.react(`wave`),this.hello(t,n))}hello(e,t){let n=this.greeted.get(e.id)??0;this.greeted.set(e.id,n+1);let r=h.family[e.id];t.onPhone&&Y.phone(),r?u(n===0?r.hi:r.again[(n-1)%r.again.length]):Y.babble(e.pitch)}climb(e){let t=this.kaylee,n=_f(),r=e?vf:yf,i=e?yf:vf,a=e?n:[...n].reverse();this.walkTo([r.x,r.z],()=>{this.climbing=!0,a.forEach(([n,r,i],o)=>{t.hopTo(new z(n,r,i),.13,.07,()=>{o%2==0&&Y.pop(),o===Math.floor(a.length/2)&&(t.floor=+!!e,this.mode=e?`inside1`:`inside0`,this.applyVisibility())})}),t.hopTo(new z(i.x,e?Z.g0:0,i.z),.25,.1,()=>{this.climbing=!1,t.face(Math.PI/2),this.setSpot(e?`upstairs`:`downstairs`)})})}setSpot(e){e!==this.spot&&(this.spot=e,this.quiet||this.events.onSpot(e))}applyShutterNav(){this.nav[0].setDynamic(this.reactor.shutterOpen?[]:[df])}applyVisibility(){let e=this.mode;this.groups.tall.visible=e===`street`,this.groups.props.visible=e===`street`&&!this.photo,this.groups.roof.visible=e===`street`,this.traffic.root.visible=e===`street`&&!this.photo,this.groups.upper.visible=e!==`inside0`,this.groups.upperRoom.visible=e===`inside1`,this.groups.front.visible=e===`street`,this.groups.groundRoom.visible=e!==`street`||this.reactor.shutterOpen,this.groups.stairs.visible=e!==`street`||this.reactor.shutterOpen;for(let[e,t]of this.family)t.root.visible=this.familyShown(xu.find(t=>t.id===e))}setSize(e,t,n){this.w=e,this.h=t,this.rig.setSize(e,t,n),Ul(e,t),this.layoutPhoto(),this.rig.setShot(this.shot(),!0)}retune(){Rl(),Ul(this.w,this.h),this.rig.refit()}shot(){if(this.photo){let e=this.photo.who;if(e){let t=e===`kaylee`?this.kaylee.height:this.family.get(e)?.height??1.5;return{center:new z(0,t*.58,1.3),half:new z(t*.5,t*.66,.45),yaw:0,pitch:8,minDist:1.5}}let t=this.w<this.h;return{center:new z(0,t?1.7:.95,1.3),half:new z(t?3.5:5,1.05,.7),yaw:0,pitch:17,minDist:5}}let e=this.kaylee.position,t=bm((this.w/Math.max(1,this.h)-.6)/1);if(this.mode===`street`)return{center:new z(vm(e.x*.6,-5,5),2.3-.6*t,.9),half:new z(2.6+3.2*t,2,1.4),yaw:K.streetYaw,pitch:K.streetPitch,minDist:6};let n=this.kaylee.floor*Z.g0,r=K.insideFitD,i=this.climbing?0:.7,a=vm(e.z-.4+this.vel.z*i,Z.back+r/2-.4,-r/2+.6);return{center:new z(vm(e.x*.3+this.vel.x*i*.3,-.7,.7),n+.8,a),half:new z(K.insideFitW/2,.9,r/2),yaw:K.insideYawTall+(K.insideYawWide-K.insideYawTall)*t,pitch:K.insidePitch,minDist:6}}get calm(){return!this.kaylee.busy&&!this.reactor.busy&&!this.rig.moving&&!this.arriving}update(e){this.time+=e;let t=this.time,n=this.kaylee;this.arrival&&!this.arrival.done&&this.updateArrival(e),this.driveTuk(e),n.update(e,t),e>0&&(mm.copy(n.position).sub(this.lastPos).divideScalar(e),mm.lengthSq()>25&&mm.set(0,0,0),this.vel.lerp(mm,1-Math.exp(-e/.4)),this.lastPos.copy(n.position));for(let r of this.family.values())!this.photo&&r.root.position.distanceTo(n.position)<3&&r.root.visible?r.lookAt(n.position.x,n.position.y+.6,n.position.z):r.lookAway(),r.update(e,t);if(this.reactor.update(e,t),this.gecko.update(e,t)&&this.mode===`inside0`&&Y.tukkae(),this.traffic.update(e,this.mode===`street`&&!this.arriving&&!this.photo),this.marker.update(e),this.photo?.who){let e=ym(t);this.photo.who===`kaylee`?n.place(0,0,1.3,e):this.family.get(this.photo.who)?.place(0,0,1.3,e)}!this.arriving&&n.floor===0&&!this.climbing&&!this.photo&&(this.mode===`street`&&n.position.z<-.3?(this.mode=`inside0`,this.applyVisibility(),this.setSpot(`downstairs`)):this.mode===`inside0`&&n.position.z>.25&&(this.mode=`street`,this.applyVisibility(),this.setSpot(`street`)));for(let t of this.cuts){let n=t.when(this.mode)?t.low:1;t.value+=vm(n-t.value,-e/.3,e/.3);let r=t.obj.userData.cutBase;t.obj.scale.y=t.value,t.obj.position.y=r*(1-t.value)}this.arriving||this.rig.setShot(this.shot()),this.rig.lag=this.climbing?.25:.35,this.rig.update(e);let r=this.rig.camera.position;this.lights.follow(r.x*.2,n.position.y,n.position.z)}render(){let e=this.renderer;e.render(this.scene,this.rig.camera),this.stats.calls=e.info.render.calls,this.stats.tris=e.info.render.triangles}placeAnchors(){let e=this.rig.camera,t=hm.set(1,0,0).applyQuaternion(e.quaternion);for(let[n,r]of this.anchorEls){let i=null,a=null,o=.5,s=!1;if(n===`family:kaylee`)this.photo&&this.familyVisible(n)&&(i=mm.copy(this.kaylee.position),a=i.clone().setY(i.y+this.kaylee.height*1.12),i.y+=this.kaylee.height*.5,o=this.kaylee.height*.42,s=!0);else if(n.startsWith(`family:`)){let e=this.family.get(n.slice(7));e&&e.root.visible&&this.familyVisible(n)&&(i=mm.copy(e.root.position),a=i.clone().setY(i.y+e.height*(e.pose===`lie`?.45:1.12)),i.y+=e.height*(e.pose===`lie`?.2:.5),o=e.height*.42,s=!0)}else{let e=sf.find(e=>e.id===n);e&&this.allowed(e)&&xm(this.kit.pokes.get(n)??null)&&(i=this.atOf(e),o=e.r,s=!0)}if(s&&i){let n=i.clone().project(e),c=i.clone().addScaledVector(t,o).project(e);if(n.z>1||Math.abs(n.x)>1.05||Math.abs(n.y)>1.05)s=!1;else{let t=(n.x+1)/2*this.w,i=(1-n.y)/2*this.h,o=vm(Math.abs(c.x-n.x)*this.w,64,170);r.style.transform=`translate3d(${(t-o/2).toFixed(1)}px, ${(i-o/2).toFixed(1)}px, 0)`,r.style.width=r.style.height=`${o.toFixed(0)}px`,r.style.zIndex=String(Math.round((1-n.z)*1e4)),a&&r.style.setProperty(`--pill`,`${((1-a.project(e).y)/2*this.h-(i-o/2)).toFixed(1)}px`)}}let c=s?``:`none`;r.style.display!==c&&(r.style.display=c)}}atOf(e){let t=e.moves?this.kit.pokes.get(e.id):void 0;return t?t.getWorldPosition(new z):new z(...e.at)}updateArrival(e){let t=this.arrival;t.t+=e;let n=this.kaylee,r=2.8;if(t.t>=99){this.parkTuk(),n.place(ff.arrive.x,0,ff.arrive.z,ff.arrive.face),this.finishArrival(!0);return}if(t.t<r){let e=t.t/r,i=fm+15.1*(1-e)**3;this.tuk?.position.set(i,Math.abs(Math.sin(t.t*18))*.025*(1-e),3.95),n.place(i-.35,.55,3.95,90)}else t.hopped?n.walking||this.finishArrival(!1):(t.hopped=!0,n.hopTo(new z(ff.arrive.x,0,ff.arrive.z),.5,.65,()=>{n.face(ff.arrive.face*dm),Y.thump()}));let i={center:new z(2,2.6,2.2),half:new z(7,3.5,3),yaw:-12,pitch:30,minDist:22};this.rig.lag=.9,this.rig.setShot(t.t<1?i:this.shot(),t.t<e*1.5)}finishArrival(e){this.arrival&&!this.arrival.done&&(this.arrival.done=!0,!e&&this.tuk&&(this.tukDrive={t:0},Y.toot()),this.rig.setShot(this.shot(),e),this.events.onArrived(),this.events.onSpot(`street`))}driveTuk(e){let t=this.tukDrive;if(!t||!this.tuk)return;t.t+=e/1.8;let n=Math.min(1,t.t),r=n*n*(3-2*n);this.tuk.position.set(fm+8.9*r,0,3.95),n>=1&&this.parkTuk()}qa(){let e=this.kaylee;return{floor:e.floor,view:this.mode,spot:this.spot,pose:e.pose,using:this.using??null,walking:e.walking,arriving:this.arriving,shutterOpen:this.reactor.shutterOpen,pos:[e.position.x,e.position.y,e.position.z].map(e=>Math.round(e*100)/100)}}memory(){return{...this.renderer.info.memory}}navCells(e){return{grid:this.nav[e],cells:this.nav[e].cells()}}dispose(){this.scene.clear(),this.bag.dispose()}},vm=(e,t,n)=>Math.min(n,Math.max(t,e));function ym(e){let t=2.2,n=e%11.8;if(n<3)return-25;let r=Math.floor((n-3)/t),i=Math.min(1,(n-3)%t/1);return-25+(r+i*i*(3-2*i))*90}var bm=e=>vm(e,0,1);function xm(e){if(!e)return!1;for(let t=e;t;t=t.parent)if(!t.visible)return!1;return!0}function Sm({start:e,events:t,onMode:n,houseRef:r}){let i=(0,C.useRef)(t);return i.current=t,(0,w.jsx)(kl,{name:`Agong's house`,qaKey:`__thaiHouseQA`,worldRef:r,onMode:n,make:t=>new _m(t,e,{onSpot:(e,t)=>i.current.onSpot(e,t),onArrived:()=>i.current.onArrived(),onPoke:e=>i.current.onPoke?.(e)}),anchors:(e,t)=>(0,w.jsx)(T,{list:gm,els:t,...e})})}var Cm=!1,wm=`street`;function Tm({meta:t,stamps:n,openActivity:r}){let{start:i,param:a,enter:o}=g(y),[s]=(0,C.useState)(()=>({section:i??(Cm?wm:`arrive`),at:a(`at`)||void 0,who:a(`who`)||void 0})),[c,l]=(0,C.useState)(`webgl`),[u,f]=(0,C.useState)(0),[p,m]=(0,C.useState)(s.section===`arrive`),_=s.section===`family`,[v,b]=(0,C.useState)(s.section===`arrive`||s.section===`family`?`street`:s.section),x=(0,C.useRef)(null),S=(0,C.useRef)(null),[T]=(0,C.useState)(()=>E(`debug`)!==null);(0,C.useEffect)(()=>{o(s.section,s.at?{at:s.at}:s.who?{who:s.who}:{}),s.section!==`arrive`&&(Cm=!0),s.section!==`arrive`&&s.section!==`family`&&(wm=s.section)},[]);let D=()=>{Cm=!0,m(!1),S.current?.speak(h.house.arrive),S.current?.speak(h.house.door,!0)};(0,C.useEffect)(()=>{if(c!==`flat`||!p)return;let e=setTimeout(D,2500);return()=>clearTimeout(e)},[c,p]);let O=(e,t)=>{wm=e,b(e),o(e,t?{at:t}:{}),S.current?.arrivedAt(e)},k=n.length>=t.activities.length;return(0,w.jsxs)(`div`,{style:{position:`absolute`,inset:0,background:`#A8DCFF`,overflow:`clip`},children:[c===`flat`?(0,w.jsx)(xf,{spot:v,onSpot:O,photo:_}):(0,w.jsx)(Sm,{start:s,houseRef:x,onMode:l,events:{onSpot:O,onArrived:D,onPoke:e=>S.current?.poked(e)}},u),c===`lost`&&(0,w.jsx)(`button`,{onClick:()=>{l(`webgl`),f(e=>e+1)},style:{position:`absolute`,inset:0,background:`rgba(168,220,255,.85)`,border:`none`,fontSize:`clamp(24px, 5vw, 40px)`,fontWeight:700,color:`var(--ink)`},children:`🏠 Tap to wake the house`}),p&&(0,w.jsx)(d.button,{"aria-label":`Skip`,initial:{opacity:0,y:20},animate:{opacity:1,y:0},onClick:()=>{e.pop(),x.current?.skipArrival(),c===`flat`&&D()},style:{position:`absolute`,left:`50%`,bottom:`calc(var(--safe-bottom) + 18px)`,translate:`-50% 0`,minHeight:64,padding:`0 28px`,borderRadius:999,border:`4px solid #fff`,background:`var(--lavender)`,color:`var(--ink)`,fontSize:22,fontWeight:700,boxShadow:`var(--shadow)`,zIndex:20},children:`Skip ⏩`}),k&&(0,w.jsx)(d.button,{"aria-label":`Party`,whileTap:{scale:.88},animate:{rotate:[-4,4,-4]},transition:{repeat:1/0,duration:2.6,ease:`easeInOut`},onClick:()=>{e.pop(),r(`party`)},style:{position:`absolute`,right:`calc(var(--safe-right, 0px) + 14px)`,bottom:`calc(var(--safe-bottom) + 14px)`,width:88,height:88,borderRadius:`50%`,border:`4px solid #fff`,background:`var(--butter)`,fontSize:44,boxShadow:`var(--shadow)`,zIndex:20,opacity:t.activities.length?1:.85},children:`🎉`}),!_&&(0,w.jsx)(Ef,{ref:S,spot:v,quiet:p||c===`lost`}),T&&(0,w.jsx)(rf,{houseRef:x})]})}function Em({backToMap:n}){let{enter:r}=g(_);return(0,C.useEffect)(()=>{r(`soon`),e.sparkle()},[r]),(0,w.jsxs)(`div`,{style:{position:`absolute`,inset:0,background:`linear-gradient(#A8DCFF, #FFE4D4)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`min(24px, 4vh)`,padding:`var(--top-clear) 20px calc(var(--safe-bottom) + 28px)`},children:[(0,w.jsx)(`div`,{style:{fontSize:`clamp(64px, min(16vw, 16vh), 140px)`},children:`🎉🏠🎉`}),(0,w.jsx)(`div`,{style:{background:`#fff`,borderRadius:`var(--radius)`,padding:`14px 28px`,boxShadow:`var(--shadow)`,fontSize:`clamp(22px, min(4vw, 5vh), 38px)`,fontWeight:600,textAlign:`center`,maxWidth:640},children:`The family party at Agong's house is coming soon!`}),(0,w.jsx)(t,{onClick:n,ariaLabel:`Back to Agong's house`,children:`🏠 ▶`})]})}function Dm(e){return e.activity===`party`?(0,w.jsx)(Em,{backToMap:e.backToMap}):e.activity===`boat-trip`?(0,w.jsx)(tf,{}):(0,w.jsx)(Tm,{...e})}export{Dm as default};
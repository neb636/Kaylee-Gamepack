import{Ct as e,D as t,Dt as n,L as r,O as i,P as a,et as o,ot as s,wt as c}from"./sdk-B7QsJISZ.js";import{An as l,Cn as u,Dn as d,Fi as f,Jr as p,On as m,Pi as h,Tn as g,dn as _,ln as v,mn as y,wn as b,xn as x}from"./index-CZfuIUjm.js";import{n as S,r as C,t as w}from"./sfx-BBEhXNuN.js";var T=n(c(),1);function E(e){let t=new URLSearchParams(location.search).get(e);return t===null?new URLSearchParams(location.hash.split(`?`)[1]??``).get(e):t}var D=typeof navigator<`u`&&navigator.webdriver===!0,O=E(`fps`),k=O!==null&&!isNaN(+O)?+O:D?30:60,A=performance.now();for(let e of[`pointerdown`,`pointermove`,`keydown`,`wheel`,`touchstart`])addEventListener(e,()=>A=performance.now(),{capture:!0,passive:!0});function j(e,t=()=>!1){let n=0,r=-1/0,i=performance.now(),a=!1,o=s=>{if(a||(n=requestAnimationFrame(o),document.hidden))return;let c=s-A,l=k;if(O===null&&(D&&c>3e4?l=4:!D&&c>8e3&&t()&&(l=30)),l>0){let e=1e3/l;if(s-r<e-1.5)return;r=s-r>e*2?s:r+e}let u=Math.min(.1,Math.max(0,(s-i)/1e3));i=s,e(s,u)};return n=requestAnimationFrame(o),()=>{a=!0,cancelAnimationFrame(n)}}var ee=1e3,M=1001,N=1002,P=1003,te=1004,ne=1005,re=1006,ie=1007,ae=1008,oe=1009,se=1010,ce=1011,F=1012,le=1013,ue=1014,de=1015,fe=1016,pe=1017,me=1018,I=1020,he=35902,ge=35899,_e=1021,L=1022,ve=1023,R=1026,ye=1027,be=1028,xe=1029,Se=1030,Ce=1031,we=1033,Te=33776,Ee=33777,De=33778,Oe=33779,ke=35840,Ae=35841,je=35842,Me=35843,Ne=36196,Pe=37492,Fe=37496,Ie=37808,Le=37809,Re=37810,ze=37811,Be=37812,Ve=37813,He=37814,Ue=37815,We=37816,Ge=37817,Ke=37818,qe=37819,Je=37820,Ye=37821,Xe=36492,Ze=36494,Qe=36495,$e=36283,et=36284,tt=36285,nt=36286,rt=2300,it=2301,at=2302,ot=2400,st=2401,ct=2402,lt=3200,ut=3201,dt=`srgb`,ft=`srgb-linear`,pt=`linear`,mt=`srgb`,ht=7680,gt=35044,_t=35048,vt=2e3,yt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},bt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),xt=Math.PI/180,St=180/Math.PI;function Ct(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(bt[e&255]+bt[e>>8&255]+bt[e>>16&255]+bt[e>>24&255]+`-`+bt[t&255]+bt[t>>8&255]+`-`+bt[t>>16&15|64]+bt[t>>24&255]+`-`+bt[n&63|128]+bt[n>>8&255]+`-`+bt[n>>16&255]+bt[n>>24&255]+bt[r&255]+bt[r>>8&255]+bt[r>>16&255]+bt[r>>24&255]).toLowerCase()}function z(e,t,n){return Math.max(t,Math.min(n,e))}function wt(e,t){return(e%t+t)%t}function Tt(e,t,n){return(1-n)*e+n*t}function Et(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function Dt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var B=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ot=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(o===0){e[t+0]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=m;return}if(u!==m||s!==d||c!==f||l!==p){let e=1-o,t=s*d+c*f+l*p+u*m,n=t>=0?1:-1,r=1-t*t;if(r>2**-52){let i=Math.sqrt(r),a=Math.atan2(i,t*n);e=Math.sin(e*a)/i,o=Math.sin(o*a)/i}let i=o*n;if(s=s*e+d*i,c=c*e+f*i,l=l*e+p*i,u=u*e+m*i,e===1-o){let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:console.warn(`THREE.Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(z(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,i=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+i*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=i,this;let s=1-o*o;if(s<=2**-52){let e=1-t;return this._w=e*a+t*this._w,this._x=e*n+t*this._x,this._y=e*r+t*this._y,this._z=e*i+t*this._z,this.normalize(),this}let c=Math.sqrt(s),l=Math.atan2(c,o),u=Math.sin((1-t)*l)/c,d=Math.sin(t*l)/c;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=i*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},V=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(At.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(At.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return kt.copy(this).projectOnVector(e),this.sub(kt)}reflect(e){return this.sub(kt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},kt=new V,At=new Ot,H=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(jt.makeScale(e,t)),this}rotate(e){return this.premultiply(jt.makeRotation(-e)),this}translate(e,t){return this.premultiply(jt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},jt=new H;function Mt(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Nt(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Pt(){let e=Nt(`canvas`);return e.style.display=`block`,e}var Ft={};function It(e){e in Ft||(Ft[e]=!0,console.warn(e))}function Lt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Rt=new H().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zt=new H().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Bt(){let e={enabled:!0,workingColorSpace:ft,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=Ht(e.r),e.g=Ht(e.g),e.b=Ht(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Ut(e.r),e.g=Ut(e.g),e.b=Ut(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?pt:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return It(`THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return It(`THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[ft]:{primaries:t,whitePoint:r,transfer:pt,toXYZ:Rt,fromXYZ:zt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:dt},outputColorSpaceConfig:{drawingBufferColorSpace:dt}},[dt]:{primaries:t,whitePoint:r,transfer:mt,toXYZ:Rt,fromXYZ:zt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:dt}}}),e}var Vt=Bt();function Ht(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Ut(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Wt,Gt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Wt===void 0&&(Wt=Nt(`canvas`)),Wt.width=e.width,Wt.height=e.height;let t=Wt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Wt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Nt(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Ht(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Ht(t[e]/255)*255):t[e]=Ht(t[e]);return{data:t,width:e.width,height:e.height}}return console.warn(`THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Kt=0,qt=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Kt++}),this.uuid=Ct(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Jt(r[t].image)):e.push(Jt(r[t]))}else e=Jt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Jt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Gt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn(`THREE.Texture: Unable to serialize Texture.`),{})}var Yt=0,Xt=new V,Zt=class e extends yt{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=M,i=M,a=re,o=ae,s=ve,c=oe,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Yt++}),this.uuid=Ct(),this.name=``,this.source=new qt(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new H,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Xt).x}get height(){return this.source.getSize(Xt).y}get depth(){return this.source.getSize(Xt).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ee:e.x-=Math.floor(e.x);break;case M:e.x=e.x<0?0:1;break;case N:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case ee:e.y-=Math.floor(e.y);break;case M:e.y=e.y<0?0:1;break;case N:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Zt.DEFAULT_IMAGE=null,Zt.DEFAULT_MAPPING=300,Zt.DEFAULT_ANISOTROPY=1;var Qt=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this.w=z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this.w=z(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},$t=class extends yt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:re,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Qt(0,0,e,t),this.scissorTest=!1,this.viewport=new Qt(0,0,e,t);let r=new Zt({width:e,height:t,depth:n.depth});this.textures=[];let i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:re,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new qt(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},en=class extends $t{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},tn=class extends Zt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=P,this.minFilter=P,this.wrapR=M,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},nn=class extends Zt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=P,this.minFilter=P,this.wrapR=M,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},rn=class{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(on.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(on.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=on.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,on):on.fromBufferAttribute(r,t),on.applyMatrix4(e.matrixWorld),this.expandByPoint(on);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),sn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),sn.copy(e.boundingBox)),sn.applyMatrix4(e.matrixWorld),this.union(sn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,on),on.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(mn),hn.subVectors(this.max,mn),cn.subVectors(e.a,mn),ln.subVectors(e.b,mn),un.subVectors(e.c,mn),dn.subVectors(ln,cn),fn.subVectors(un,ln),pn.subVectors(cn,un);let t=[0,-dn.z,dn.y,0,-fn.z,fn.y,0,-pn.z,pn.y,dn.z,0,-dn.x,fn.z,0,-fn.x,pn.z,0,-pn.x,-dn.y,dn.x,0,-fn.y,fn.x,0,-pn.y,pn.x,0];return!vn(t,cn,ln,un,hn)||(t=[1,0,0,0,1,0,0,0,1],!vn(t,cn,ln,un,hn))?!1:(gn.crossVectors(dn,fn),t=[gn.x,gn.y,gn.z],vn(t,cn,ln,un,hn))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,on).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(on).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(an[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),an[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),an[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),an[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),an[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),an[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),an[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),an[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(an),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},an=[new V,new V,new V,new V,new V,new V,new V,new V],on=new V,sn=new rn,cn=new V,ln=new V,un=new V,dn=new V,fn=new V,pn=new V,mn=new V,hn=new V,gn=new V,_n=new V;function vn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){_n.fromArray(e,a);let o=i.x*Math.abs(_n.x)+i.y*Math.abs(_n.y)+i.z*Math.abs(_n.z),s=t.dot(_n),c=n.dot(_n),l=r.dot(_n);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var yn=new rn,bn=new V,xn=new V,Sn=class{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?yn.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;bn.subVectors(e,this.center);let t=bn.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(bn,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xn.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(bn.copy(e.center).add(xn)),this.expandByPoint(bn.copy(e.center).sub(xn))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Cn=new V,wn=new V,Tn=new V,En=new V,Dn=new V,On=new V,kn=new V,An=class{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Cn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Cn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Cn.copy(this.origin).addScaledVector(this.direction,t),Cn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){wn.copy(e).add(t).multiplyScalar(.5),Tn.copy(t).sub(e).normalize(),En.copy(this.origin).sub(wn);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Tn),o=En.dot(this.direction),s=-En.dot(Tn),c=En.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(wn).addScaledVector(Tn,d),f}intersectSphere(e,t){Cn.subVectors(e.center,this.origin);let n=Cn.dot(this.direction),r=Cn.dot(Cn)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Cn)!==null}intersectTriangle(e,t,n,r,i){Dn.subVectors(t,e),On.subVectors(n,e),kn.crossVectors(Dn,On);let a=this.direction.dot(kn),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;En.subVectors(this.origin,e);let s=o*this.direction.dot(On.crossVectors(En,On));if(s<0)return null;let c=o*this.direction.dot(Dn.cross(En));if(c<0||s+c>a)return null;let l=-o*En.dot(kn);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},jn=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Mn.setFromMatrixColumn(e,0).length(),i=1/Mn.setFromMatrixColumn(e,1).length(),a=1/Mn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Pn,e,Fn)}lookAt(e,t,n){let r=this.elements;return Rn.subVectors(e,t),Rn.lengthSq()===0&&(Rn.z=1),Rn.normalize(),In.crossVectors(n,Rn),In.lengthSq()===0&&(Math.abs(n.z)===1?Rn.x+=1e-4:Rn.z+=1e-4,Rn.normalize(),In.crossVectors(n,Rn)),In.normalize(),Ln.crossVectors(Rn,In),r[0]=In.x,r[4]=Ln.x,r[8]=Rn.x,r[1]=In.y,r[5]=Ln.y,r[9]=Rn.y,r[2]=In.z,r[6]=Ln.z,r[10]=Rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],M=r[3],N=r[7],P=r[11],te=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*N,i[8]=a*C+o*D+s*j+c*P,i[12]=a*w+o*O+s*ee+c*te,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*N,i[9]=l*C+u*D+d*j+f*P,i[13]=l*w+u*O+d*ee+f*te,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*N,i[10]=p*C+m*D+h*j+g*P,i[14]=p*w+m*O+h*ee+g*te,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*N,i[11]=_*C+v*D+y*j+b*P,i[15]=_*w+v*O+y*ee+b*te,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15];return p*(+i*s*u-r*c*u-i*o*d+n*c*d+r*o*f-n*s*f)+m*(+t*s*f-t*c*d+i*a*d-r*a*f+r*c*l-i*s*l)+h*(+t*c*u-t*o*f-i*a*u+n*a*f+i*o*l-n*c*l)+g*(-r*o*l-t*s*u+t*o*d+r*a*u-n*a*d+n*s*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=u*h*c-m*d*c+m*s*f-o*h*f-u*s*g+o*d*g,v=p*d*c-l*h*c-p*s*f+a*h*f+l*s*g-a*d*g,y=l*m*c-p*u*c+p*o*f-a*m*f-l*o*g+a*u*g,b=p*u*s-l*m*s-p*o*d+a*m*d+l*o*h-a*u*h,x=t*_+n*v+r*y+i*b;if(x===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/x;return e[0]=_*S,e[1]=(m*d*i-u*h*i-m*r*f+n*h*f+u*r*g-n*d*g)*S,e[2]=(o*h*i-m*s*i+m*r*c-n*h*c-o*r*g+n*s*g)*S,e[3]=(u*s*i-o*d*i-u*r*c+n*d*c+o*r*f-n*s*f)*S,e[4]=v*S,e[5]=(l*h*i-p*d*i+p*r*f-t*h*f-l*r*g+t*d*g)*S,e[6]=(p*s*i-a*h*i-p*r*c+t*h*c+a*r*g-t*s*g)*S,e[7]=(a*d*i-l*s*i+l*r*c-t*d*c-a*r*f+t*s*f)*S,e[8]=y*S,e[9]=(p*u*i-l*m*i-p*n*f+t*m*f+l*n*g-t*u*g)*S,e[10]=(a*m*i-p*o*i+p*n*c-t*m*c-a*n*g+t*o*g)*S,e[11]=(l*o*i-a*u*i-l*n*c+t*u*c+a*n*f-t*o*f)*S,e[12]=b*S,e[13]=(l*m*r-p*u*r+p*n*d-t*m*d-l*n*h+t*u*h)*S,e[14]=(p*o*r-a*m*r-p*n*s+t*m*s+a*n*h-t*o*h)*S,e[15]=(a*u*r-l*o*r+l*n*s-t*u*s-a*n*d+t*o*d)*S,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,i=Mn.set(r[0],r[1],r[2]).length(),a=Mn.set(r[4],r[5],r[6]).length(),o=Mn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(i=-i),e.x=r[12],e.y=r[13],e.z=r[14],Nn.copy(this);let s=1/i,c=1/a,l=1/o;return Nn.elements[0]*=s,Nn.elements[1]*=s,Nn.elements[2]*=s,Nn.elements[4]*=c,Nn.elements[5]*=c,Nn.elements[6]*=c,Nn.elements[8]*=l,Nn.elements[9]*=l,Nn.elements[10]*=l,t.setFromRotationMatrix(Nn),n.x=i,n.y=a,n.z=o,this}makePerspective(e,t,n,r,i,a,o=vt,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=vt,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Mn=new V,Nn=new jn,Pn=new V(0,0,0),Fn=new V(1,1,1),In=new V,Ln=new V,Rn=new V,zn=new jn,Bn=new Ot,Vn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-z(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-z(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(z(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn(`THREE.Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return zn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(zn,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Bn.setFromEuler(this),this.setFromQuaternion(Bn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Vn.DEFAULT_ORDER=`XYZ`;var Hn=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},Un=0,Wn=new V,Gn=new Ot,Kn=new jn,qn=new V,Jn=new V,Yn=new V,Xn=new Ot,Zn=new V(1,0,0),Qn=new V(0,1,0),$n=new V(0,0,1),er={type:`added`},tr={type:`removed`},nr={type:`childadded`,child:null},rr={type:`childremoved`,child:null},ir=class e extends yt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Un++}),this.uuid=Ct(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new V,n=new Vn,r=new Ot,i=new V(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new jn},normalMatrix:{value:new H}}),this.matrix=new jn,this.matrixWorld=new jn,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Hn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Gn.setFromAxisAngle(e,t),this.quaternion.multiply(Gn),this}rotateOnWorldAxis(e,t){return Gn.setFromAxisAngle(e,t),this.quaternion.premultiply(Gn),this}rotateX(e){return this.rotateOnAxis(Zn,e)}rotateY(e){return this.rotateOnAxis(Qn,e)}rotateZ(e){return this.rotateOnAxis($n,e)}translateOnAxis(e,t){return Wn.copy(e).applyQuaternion(this.quaternion),this.position.add(Wn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Zn,e)}translateY(e){return this.translateOnAxis(Qn,e)}translateZ(e){return this.translateOnAxis($n,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Kn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?qn.copy(e):qn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Jn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Kn.lookAt(Jn,qn,this.up):Kn.lookAt(qn,Jn,this.up),this.quaternion.setFromRotationMatrix(Kn),r&&(Kn.extractRotation(r.matrixWorld),Gn.setFromRotationMatrix(Kn),this.quaternion.premultiply(Gn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(console.error(`THREE.Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(er),nr.child=e,this.dispatchEvent(nr),nr.child=null):console.error(`THREE.Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(tr),rr.child=e,this.dispatchEvent(rr),rr.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Kn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Kn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Kn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(er),nr.child=e,this.dispatchEvent(nr),nr.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Jn,e,Yn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Jn,Xn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};ir.DEFAULT_UP=new V(0,1,0),ir.DEFAULT_MATRIX_AUTO_UPDATE=!0,ir.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ar=new V,or=new V,sr=new V,cr=new V,lr=new V,ur=new V,dr=new V,fr=new V,pr=new V,mr=new V,hr=new Qt,gr=new Qt,_r=new Qt,vr=class e{constructor(e=new V,t=new V,n=new V){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),ar.subVectors(e,t),r.cross(ar);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){ar.subVectors(r,t),or.subVectors(n,t),sr.subVectors(e,t);let a=ar.dot(ar),o=ar.dot(or),s=ar.dot(sr),c=or.dot(or),l=or.dot(sr),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,cr)!==null&&cr.x>=0&&cr.y>=0&&cr.x+cr.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,cr)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,cr.x),s.addScaledVector(a,cr.y),s.addScaledVector(o,cr.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return hr.setScalar(0),gr.setScalar(0),_r.setScalar(0),hr.fromBufferAttribute(e,t),gr.fromBufferAttribute(e,n),_r.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(hr,i.x),a.addScaledVector(gr,i.y),a.addScaledVector(_r,i.z),a}static isFrontFacing(e,t,n,r){return ar.subVectors(n,t),or.subVectors(e,t),ar.cross(or).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ar.subVectors(this.c,this.b),or.subVectors(this.a,this.b),ar.cross(or).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;lr.subVectors(r,n),ur.subVectors(i,n),fr.subVectors(e,n);let s=lr.dot(fr),c=ur.dot(fr);if(s<=0&&c<=0)return t.copy(n);pr.subVectors(e,r);let l=lr.dot(pr),u=ur.dot(pr);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(lr,a);mr.subVectors(e,i);let f=lr.dot(mr),p=ur.dot(mr);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(ur,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return dr.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(dr,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(lr,a).addScaledVector(ur,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},yr={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},br={h:0,s:0,l:0},xr={h:0,s:0,l:0};function Sr(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var U=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Vt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Vt.workingColorSpace){return this.r=e,this.g=t,this.b=n,Vt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Vt.workingColorSpace){if(e=wt(e,1),t=z(t,0,1),n=z(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Sr(i,r,e+1/3),this.g=Sr(i,r,e),this.b=Sr(i,r,e-1/3)}return Vt.colorSpaceToWorking(this,r),this}setStyle(e,t=dt){function n(t){t!==void 0&&parseFloat(t)<1&&console.warn(`THREE.Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:console.warn(`THREE.Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);console.warn(`THREE.Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=dt){let n=yr[e.toLowerCase()];return n===void 0?console.warn(`THREE.Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ht(e.r),this.g=Ht(e.g),this.b=Ht(e.b),this}copyLinearToSRGB(e){return this.r=Ut(e.r),this.g=Ut(e.g),this.b=Ut(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=dt){return Vt.workingToColorSpace(Cr.copy(this),e),Math.round(z(Cr.r*255,0,255))*65536+Math.round(z(Cr.g*255,0,255))*256+Math.round(z(Cr.b*255,0,255))}getHexString(e=dt){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Vt.workingColorSpace){Vt.workingToColorSpace(Cr.copy(this),t);let n=Cr.r,r=Cr.g,i=Cr.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Vt.workingColorSpace){return Vt.workingToColorSpace(Cr.copy(this),t),e.r=Cr.r,e.g=Cr.g,e.b=Cr.b,e}getStyle(e=dt){Vt.workingToColorSpace(Cr.copy(this),e);let t=Cr.r,n=Cr.g,r=Cr.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(br),this.setHSL(br.h+e,br.s+t,br.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(br),e.getHSL(xr);let n=Tt(br.h,xr.h,t),r=Tt(br.s,xr.s,t),i=Tt(br.l,xr.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Cr=new U;U.NAMES=yr;var wr=0,Tr=class extends yt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wr++}),this.uuid=Ct(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new U(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ht,this.stencilZFail=ht,this.stencilZPass=ht,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Er=class extends Tr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Vn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Dr=new V,Or=new B,kr=0,Ar=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:kr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=gt,this.updateRanges=[],this.gpuType=de,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Or.fromBufferAttribute(this,t),Or.applyMatrix3(e),this.setXY(t,Or.x,Or.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.applyMatrix3(e),this.setXYZ(t,Dr.x,Dr.y,Dr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.applyMatrix4(e),this.setXYZ(t,Dr.x,Dr.y,Dr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.applyNormalMatrix(e),this.setXYZ(t,Dr.x,Dr.y,Dr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.transformDirection(e),this.setXYZ(t,Dr.x,Dr.y,Dr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Et(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Dt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Et(t,this.array)),t}setX(e,t){return this.normalized&&(t=Dt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Et(t,this.array)),t}setY(e,t){return this.normalized&&(t=Dt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Et(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Dt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Et(t,this.array)),t}setW(e,t){return this.normalized&&(t=Dt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array),r=Dt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array),r=Dt(r,this.array),i=Dt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},jr=class extends Ar{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Mr=class extends Ar{constructor(e,t,n){super(new Uint32Array(e),t,n)}},W=class extends Ar{constructor(e,t,n){super(new Float32Array(e),t,n)}},Nr=0,Pr=new jn,Fr=new ir,Ir=new V,Lr=new rn,Rr=new rn,zr=new V,Br=class e extends yt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Nr++}),this.uuid=Ct(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Mt(e)?Mr:jr)(e,1):e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new H().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Pr.makeRotationFromQuaternion(e),this.applyMatrix4(Pr),this}rotateX(e){return Pr.makeRotationX(e),this.applyMatrix4(Pr),this}rotateY(e){return Pr.makeRotationY(e),this.applyMatrix4(Pr),this}rotateZ(e){return Pr.makeRotationZ(e),this.applyMatrix4(Pr),this}translate(e,t,n){return Pr.makeTranslation(e,t,n),this.applyMatrix4(Pr),this}scale(e,t,n){return Pr.makeScale(e,t,n),this.applyMatrix4(Pr),this}lookAt(e){return Fr.lookAt(e),Fr.updateMatrix(),this.applyMatrix4(Fr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ir).negate(),this.translate(Ir.x,Ir.y,Ir.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new W(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&console.warn(`THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new rn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Lr.setFromBufferAttribute(n),this.morphTargetsRelative?(zr.addVectors(this.boundingBox.min,Lr.min),this.boundingBox.expandByPoint(zr),zr.addVectors(this.boundingBox.max,Lr.max),this.boundingBox.expandByPoint(zr)):(this.boundingBox.expandByPoint(Lr.min),this.boundingBox.expandByPoint(Lr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error(`THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Sn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error(`THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new V,1/0);return}if(e){let n=this.boundingSphere.center;if(Lr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Rr.setFromBufferAttribute(n),this.morphTargetsRelative?(zr.addVectors(Lr.min,Rr.min),Lr.expandByPoint(zr),zr.addVectors(Lr.max,Rr.max),Lr.expandByPoint(zr)):(Lr.expandByPoint(Rr.min),Lr.expandByPoint(Rr.max))}Lr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)zr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(zr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)zr.fromBufferAttribute(a,t),o&&(Ir.fromBufferAttribute(e,t),zr.add(Ir)),r=Math.max(r,n.distanceToSquared(zr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error(`THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new Ar(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new V,s[e]=new V;let c=new V,l=new V,u=new V,d=new B,f=new B,p=new B,m=new V,h=new V;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new V,y=new V,b=new V,x=new V;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new Ar(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new V,i=new V,a=new V,o=new V,s=new V,c=new V,l=new V,u=new V;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)zr.fromBufferAttribute(e,t),zr.normalize(),e.setXYZ(t,zr.x,zr.y,zr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Ar(a,r,i)}if(this.index===null)return console.warn(`THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Vr=new jn,Hr=new An,Ur=new Sn,Wr=new V,Gr=new V,Kr=new V,qr=new V,Jr=new V,Yr=new V,Xr=new V,Zr=new V,G=class extends ir{constructor(e=new Br,t=new Er){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Yr.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Jr.fromBufferAttribute(s,e),a?Yr.addScaledVector(Jr,r):Yr.addScaledVector(Jr.sub(t),r))}t.add(Yr)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ur.copy(n.boundingSphere),Ur.applyMatrix4(i),Hr.copy(e.ray).recast(e.near),!(Ur.containsPoint(Hr.origin)===!1&&(Hr.intersectSphere(Ur,Wr)===null||Hr.origin.distanceToSquared(Wr)>(e.far-e.near)**2))&&(Vr.copy(i).invert(),Hr.copy(e.ray).applyMatrix4(Vr),(n.boundingBox===null||Hr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Hr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=$r(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=$r(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=$r(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=$r(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Qr(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Zr.copy(s),Zr.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Zr);return l<n.near||l>n.far?null:{distance:l,point:Zr.clone(),object:e}}function $r(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Gr),e.getVertexPosition(c,Kr),e.getVertexPosition(l,qr);let u=Qr(e,t,n,r,Gr,Kr,qr,Xr);if(u){let e=new V;vr.getBarycoord(Xr,Gr,Kr,qr,e),i&&(u.uv=vr.getInterpolatedAttribute(i,s,c,l,e,new B)),a&&(u.uv1=vr.getInterpolatedAttribute(a,s,c,l,e,new B)),o&&(u.normal=vr.getInterpolatedAttribute(o,s,c,l,e,new V),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new V,materialIndex:0};vr.getNormal(Gr,Kr,qr,t.normal),u.face=t,u.barycoord=e}return u}var ei=class e extends Br{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new W(c,3)),this.setAttribute(`normal`,new W(l,3)),this.setAttribute(`uv`,new W(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new V;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function ti(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function ni(e){let t={};for(let n=0;n<e.length;n++){let r=ti(e[n]);for(let e in r)t[e]=r[e]}return t}function ri(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function ii(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Vt.workingColorSpace}var ai={clone:ti,merge:ni},oi=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,si=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ci=class extends Tr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=oi,this.fragmentShader=si,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ti(e.uniforms),this.uniformsGroups=ri(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},li=class extends ir{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new jn,this.projectionMatrix=new jn,this.projectionMatrixInverse=new jn,this.coordinateSystem=vt,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},ui=new V,di=new B,fi=new B,pi=class extends li{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=St*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(xt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return St*2*Math.atan(Math.tan(xt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ui.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ui.x,ui.y).multiplyScalar(-e/ui.z),ui.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ui.x,ui.y).multiplyScalar(-e/ui.z)}getViewSize(e,t){return this.getViewBounds(e,di,fi),t.subVectors(fi,di)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(xt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},mi=-90,hi=1,gi=class extends ir{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new pi(mi,hi,e,t);r.layers=this.layers,this.add(r);let i=new pi(mi,hi,e,t);i.layers=this.layers,this.add(i);let a=new pi(mi,hi,e,t);a.layers=this.layers,this.add(a);let o=new pi(mi,hi,e,t);o.layers=this.layers,this.add(o);let s=new pi(mi,hi,e,t);s.layers=this.layers,this.add(s);let c=new pi(mi,hi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,i),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,s),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},_i=class extends Zt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},vi=class extends en{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new _i(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new ei(5,5,5),i=new ci({name:`CubemapFromEquirect`,uniforms:ti(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new G(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=re),new gi(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},K=class extends ir{constructor(){super(),this.isGroup=!0,this.type=`Group`}},yi={type:`move`},bi=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new K,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new K,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new K,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(yi)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new K;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},xi=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new U(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Si=class extends ir{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Vn,this.environmentIntensity=1,this.environmentRotation=new Vn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Ci=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=gt,this.updateRanges=[],this.version=0,this.uuid=Ct()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ct()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ct()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},wi=new V,Ti=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)wi.fromBufferAttribute(this,t),wi.applyMatrix4(e),this.setXYZ(t,wi.x,wi.y,wi.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)wi.fromBufferAttribute(this,t),wi.applyNormalMatrix(e),this.setXYZ(t,wi.x,wi.y,wi.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)wi.fromBufferAttribute(this,t),wi.transformDirection(e),this.setXYZ(t,wi.x,wi.y,wi.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Et(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Dt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Dt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Dt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Et(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Et(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Et(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Et(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array),r=Dt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Dt(t,this.array),n=Dt(n,this.array),r=Dt(r,this.array),i=Dt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){console.log(`THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Ar(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log(`THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Ei=class extends Tr{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new U(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Di,Oi=new V,ki=new V,Ai=new V,ji=new B,Mi=new B,Ni=new jn,Pi=new V,Fi=new V,Ii=new V,Li=new B,Ri=new B,zi=new B,Bi=class extends ir{constructor(e=new Ei){if(super(),this.isSprite=!0,this.type=`Sprite`,Di===void 0){Di=new Br;let e=new Ci(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Di.setIndex([0,1,2,0,2,3]),Di.setAttribute(`position`,new Ti(e,3,0,!1)),Di.setAttribute(`uv`,new Ti(e,2,3,!1))}this.geometry=Di,this.material=e,this.center=new B(.5,.5),this.count=1}raycast(e,t){e.camera===null&&console.error(`THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),ki.setFromMatrixScale(this.matrixWorld),Ni.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ai.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ki.multiplyScalar(-Ai.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Vi(Pi.set(-.5,-.5,0),Ai,a,ki,r,i),Vi(Fi.set(.5,-.5,0),Ai,a,ki,r,i),Vi(Ii.set(.5,.5,0),Ai,a,ki,r,i),Li.set(0,0),Ri.set(1,0),zi.set(1,1);let o=e.ray.intersectTriangle(Pi,Fi,Ii,!1,Oi);if(o===null&&(Vi(Fi.set(-.5,.5,0),Ai,a,ki,r,i),Ri.set(0,1),o=e.ray.intersectTriangle(Pi,Ii,Fi,!1,Oi),o===null))return;let s=e.ray.origin.distanceTo(Oi);s<e.near||s>e.far||t.push({distance:s,point:Oi.clone(),uv:vr.getInterpolation(Oi,Pi,Fi,Ii,Li,Ri,zi,new B),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Vi(e,t,n,r,i,a){ji.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Mi.copy(ji):(Mi.x=a*ji.x-i*ji.y,Mi.y=i*ji.x+a*ji.y),e.copy(t),e.x+=Mi.x,e.y+=Mi.y,e.applyMatrix4(Ni)}var Hi=class extends Zt{constructor(e=null,t=1,n=1,r,i,a,o,s,c=P,l=P,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ui=class extends Ar{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Wi=new jn,Gi=new jn,Ki=[],qi=new rn,Ji=new jn,Yi=new G,Xi=new Sn,Zi=class extends G{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ui(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ji)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new rn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Wi),qi.copy(e.boundingBox).applyMatrix4(Wi),this.boundingBox.union(qi)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Sn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Wi),Xi.copy(e.boundingSphere).applyMatrix4(Wi),this.boundingSphere.union(Xi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Yi.geometry=this.geometry,Yi.material=this.material,Yi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Xi.copy(this.boundingSphere),Xi.applyMatrix4(n),e.ray.intersectsSphere(Xi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Wi),Gi.multiplyMatrices(n,Wi),Yi.matrixWorld=Gi,Yi.raycast(e,Ki);for(let e=0,n=Ki.length;e<n;e++){let n=Ki[e];n.instanceId=i,n.object=this,t.push(n)}Ki.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Ui(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Hi(new Float32Array(r*this.count),r,this.count,be,de));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;i[s]=o,i.set(n,s+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Qi=new V,$i=new V,ea=new H,ta=class{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Qi.subVectors(n,t).cross($i.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Qi),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||ea.getNormalMatrix(e),r=this.coplanarPoint(Qi).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},na=new Sn,ra=new B(.5,.5),ia=new V,aa=class{constructor(e=new ta,t=new ta,n=new ta,r=new ta,i=new ta,a=new ta){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=vt,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),na.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),na.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(na)}intersectsSprite(e){return na.center.set(0,0,0),na.radius=.7071067811865476+ra.distanceTo(e.center),na.applyMatrix4(e.matrixWorld),this.intersectsSphere(na)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ia.x=r.normal.x>0?e.max.x:e.min.x,ia.y=r.normal.y>0?e.max.y:e.min.y,ia.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ia)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},oa=class extends Tr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new U(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},sa=new V,ca=new V,la=new jn,ua=new An,da=new Sn,fa=new V,pa=new V,ma=class extends ir{constructor(e=new Br,t=new oa){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)sa.fromBufferAttribute(t,e-1),ca.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=sa.distanceTo(ca);e.setAttribute(`lineDistance`,new W(n,1))}else console.warn(`THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),da.copy(n.boundingSphere),da.applyMatrix4(r),da.radius+=i,e.ray.intersectsSphere(da)===!1)return;la.copy(r).invert(),ua.copy(e.ray).applyMatrix4(la);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=ha(this,e,ua,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=ha(this,e,ua,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=ha(this,e,ua,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=ha(this,e,ua,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ha(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(sa.fromBufferAttribute(s,i),ca.fromBufferAttribute(s,a),n.distanceSqToSegment(sa,ca,fa,pa)>r)return;fa.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(fa);if(!(c<t.near||c>t.far))return{distance:c,point:pa.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var ga=class extends Zt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},_a=class extends Zt{constructor(e,t,n=ue,r,i,a,o=P,s=P,c,l=R,u=1){if(l!==1026&&l!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new qt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},va=class extends Zt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ya=class e extends Br{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new V,g=new V;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new W(o,3)),this.setAttribute(`normal`,new W(s,3)),this.setAttribute(`uv`,new W(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},ba=class e extends Br{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new V,l=new B;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new W(a,3)),this.setAttribute(`normal`,new W(o,3)),this.setAttribute(`uv`,new W(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},xa=class e extends Br{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new W(u,3)),this.setAttribute(`normal`,new W(d,3)),this.setAttribute(`uv`,new W(f,2));function _(){let a=new V,_=new V,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new B,m=new V,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Sa=class e extends xa{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ca=class e extends Br{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new W(i,3)),this.setAttribute(`normal`,new W(i.slice(),3)),this.setAttribute(`uv`,new W(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new V,r=new V,i=new V;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new V;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new V;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new V,t=new V,n=new V,r=new V,o=new B,s=new B,c=new B;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.details)}},wa=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn(`THREE.Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new B:new V);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new V,r=[],i=[],a=[],o=new V,s=new jn;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new V)}i[0]=new V,a[0]=new V;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(z(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(z(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ta=class extends wa{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new B){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ea=class extends Ta{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function Da(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Oa=new V,ka=new Da,Aa=new Da,ja=new Da,Ma=class extends wa{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new V){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Oa.subVectors(r[0],r[1]).add(r[0]),c=Oa);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Oa.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Oa),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),ka.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),Aa.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),ja.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(ka.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),Aa.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),ja.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(ka.calc(s),Aa.calc(s),ja.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new V().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Na(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function Pa(e,t){let n=1-e;return n*n*t}function Fa(e,t){return 2*(1-e)*e*t}function Ia(e,t){return e*e*t}function La(e,t,n,r){return Pa(e,t)+Fa(e,n)+Ia(e,r)}function Ra(e,t){let n=1-e;return n*n*n*t}function za(e,t){let n=1-e;return 3*n*n*e*t}function Ba(e,t){return 3*(1-e)*e*e*t}function Va(e,t){return e*e*e*t}function Ha(e,t,n,r,i){return Ra(e,t)+za(e,n)+Ba(e,r)+Va(e,i)}var Ua=class extends wa{constructor(e=new B,t=new B,n=new B,r=new B){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(Ha(e,r.x,i.x,a.x,o.x),Ha(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Wa=class extends wa{constructor(e=new V,t=new V,n=new V,r=new V){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(Ha(e,r.x,i.x,a.x,o.x),Ha(e,r.y,i.y,a.y,o.y),Ha(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ga=class extends wa{constructor(e=new B,t=new B){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new B){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ka=class extends wa{constructor(e=new V,t=new V){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new V){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new V){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},qa=class extends wa{constructor(e=new B,t=new B,n=new B){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(La(e,r.x,i.x,a.x),La(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ja=class extends wa{constructor(e=new V,t=new V,n=new V){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(La(e,r.x,i.x,a.x),La(e,r.y,i.y,a.y),La(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ya=class extends wa{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new B){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(Na(o,s.x,c.x,l.x,u.x),Na(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new B().fromArray(n))}return this}},Xa=Object.freeze({__proto__:null,ArcCurve:Ea,CatmullRomCurve3:Ma,CubicBezierCurve:Ua,CubicBezierCurve3:Wa,EllipseCurve:Ta,LineCurve:Ga,LineCurve3:Ka,QuadraticBezierCurve:qa,QuadraticBezierCurve3:Ja,SplineCurve:Ya}),Za=class extends wa{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new Xa[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new Xa[n.type]().fromJSON(n))}return this}},Qa=class extends Za{constructor(e){super(),this.type=`Path`,this.currentPoint=new B,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Ga(this.currentPoint.clone(),new B(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new qa(this.currentPoint.clone(),new B(e,t),new B(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new Ua(this.currentPoint.clone(),new B(e,t),new B(n,r),new B(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new Ya([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new Ta(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},$a=class extends Qa{constructor(e){super(e),this.uuid=Ct(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new Qa().fromJSON(n))}return this}};function eo(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=to(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=co(e,t,a,n)),e.length>80*n){s=1/0,c=1/0;let t=-1/0,r=-1/0;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return ro(a,o,n,s,c,l,0),o}function to(e,t,n,r,i){let a;if(i===No(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=Ao(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=Ao(i/r|0,e[i],e[i+1],a);return a&&So(a,a.next)&&(jo(a),a=a.next),a}function no(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(So(n,n.next)||xo(n.prev,n,n.next)===0)){if(jo(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function ro(e,t,n,r,i,a,o){if(!e)return;!o&&a&&mo(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?ao(e,r,i,a):io(e)){t.push(c.i,e.i,l.i),jo(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=oo(no(e),t),ro(e,t,n,r,i,a,2)):o===2&&so(e,t,n,r,i,a):ro(no(e),t,n,r,i,a,1);break}}}function io(e){let t=e.prev,n=e,r=e.next;if(xo(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&yo(i,s,a,c,o,l,m.x,m.y)&&xo(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function ao(e,t,n,r){let i=e.prev,a=e,o=e.next;if(xo(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=go(p,m,t,n,r),v=go(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&yo(s,u,c,d,l,f,y.x,y.y)&&xo(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&yo(s,u,c,d,l,f,b.x,b.y)&&xo(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&yo(s,u,c,d,l,f,y.x,y.y)&&xo(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&yo(s,u,c,d,l,f,b.x,b.y)&&xo(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function oo(e,t){let n=e;do{let r=n.prev,i=n.next.next;!So(r,i)&&Co(r,n,n.next,i)&&Do(r,i)&&Do(i,r)&&(t.push(r.i,n.i,i.i),jo(n),jo(n.next),n=e=i),n=n.next}while(n!==e);return no(n)}function so(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&bo(o,e)){let s=ko(o,e);o=no(o,o.next),s=no(s,s.next),ro(o,t,n,r,i,a,0),ro(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function co(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=to(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(_o(o))}i.sort(lo);for(let e=0;e<i.length;e++)n=uo(i[e],n);return n}function lo(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function uo(e,t){let n=fo(e,t);if(!n)return t;let r=ko(n,e);return no(r,r.next),no(n,n.next)}function fo(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(So(e,n))return n;do{if(So(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&vo(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);Do(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&po(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function po(e,t){return xo(e.prev,e,t.prev)<0&&xo(t.next,e,e.next)<0}function mo(e,t,n,r){let i=e;do i.z===0&&(i.z=go(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,ho(i)}function ho(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function go(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function _o(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function vo(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function yo(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&vo(e,t,n,r,i,a,o,s)}function bo(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Eo(e,t)&&(Do(e,t)&&Do(t,e)&&Oo(e,t)&&(xo(e.prev,e,t.prev)||xo(e,t.prev,t))||So(e,t)&&xo(e.prev,e,e.next)>0&&xo(t.prev,t,t.next)>0)}function xo(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function So(e,t){return e.x===t.x&&e.y===t.y}function Co(e,t,n,r){let i=To(xo(e,t,n)),a=To(xo(e,t,r)),o=To(xo(n,r,e)),s=To(xo(n,r,t));return!!(i!==a&&o!==s||i===0&&wo(e,n,t)||a===0&&wo(e,r,t)||o===0&&wo(n,e,r)||s===0&&wo(n,t,r))}function wo(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function To(e){return e>0?1:e<0?-1:0}function Eo(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Co(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Do(e,t){return xo(e.prev,e,e.next)<0?xo(e,t,e.next)>=0&&xo(e,e.prev,t)>=0:xo(e,t,e.prev)<0||xo(e,e.next,t)<0}function Oo(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function ko(e,t){let n=Mo(e.i,e.x,e.y),r=Mo(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function Ao(e,t,n,r){let i=Mo(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function jo(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function Mo(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function No(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var Po=class{static triangulate(e,t,n=2){return eo(e,t,n)}},Fo=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];Io(e),Lo(n,e);let a=e.length;t.forEach(Io);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,Lo(n,t[e]);let o=Po.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function Io(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function Lo(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var Ro=class e extends Br{constructor(e=new $a([new B(.5,.5),new B(-.5,.5),new B(-.5,-.5),new B(.5,-.5)]),t={}){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],i=[];for(let t=0,n=e.length;t<n;t++){let n=e[t];a(n)}this.setAttribute(`position`,new W(r,3)),this.setAttribute(`uv`,new W(i,2)),this.computeVertexNormals();function a(e){let a=[],o=t.curveSegments===void 0?12:t.curveSegments,s=t.steps===void 0?1:t.steps,c=t.depth===void 0?1:t.depth,l=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness===void 0?.2:t.bevelThickness,d=t.bevelSize===void 0?u-.1:t.bevelSize,f=t.bevelOffset===void 0?0:t.bevelOffset,p=t.bevelSegments===void 0?3:t.bevelSegments,m=t.extrudePath,h=t.UVGenerator===void 0?zo:t.UVGenerator,g,_=!1,v,y,b,x;m&&(g=m.getSpacedPoints(s),_=!0,l=!1,v=m.computeFrenetFrames(s,!1),y=new V,b=new V,x=new V),l||(p=0,u=0,d=0,f=0);let S=e.extractPoints(o),C=S.shape,w=S.holes;if(!Fo.isClockWise(C)){C=C.reverse();for(let e=0,t=w.length;e<t;e++){let t=w[e];Fo.isClockWise(t)&&(w[e]=t.reverse())}}function T(e){let t=e[0];for(let n=1;n<=e.length;n++){let r=n%e.length,i=e[r],a=i.x-t.x,o=i.y-t.y,s=a*a+o*o,c=Math.max(Math.abs(i.x),Math.abs(i.y),Math.abs(t.x),Math.abs(t.y));if(s<=10000000000000001e-36*c*c){e.splice(r,1),n--;continue}t=i}}T(C),w.forEach(T);let E=w.length,D=C;for(let e=0;e<E;e++){let t=w[e];C=C.concat(t)}function O(e,t,n){return t||console.error(`THREE.ExtrudeGeometry: vec does not exist`),e.clone().addScaledVector(t,n)}let k=C.length;function A(e,t,n){let r,i,a,o=e.x-t.x,s=e.y-t.y,c=n.x-e.x,l=n.y-e.y,u=o*o+s*s,d=o*l-s*c;if(Math.abs(d)>2**-52){let d=Math.sqrt(u),f=Math.sqrt(c*c+l*l),p=t.x-s/d,m=t.y+o/d,h=n.x-l/f,g=n.y+c/f,_=((h-p)*l-(g-m)*c)/(o*l-s*c);r=p+o*_-e.x,i=m+s*_-e.y;let v=r*r+i*i;if(v<=2)return new B(r,i);a=Math.sqrt(v/2)}else{let e=!1;o>2**-52?c>2**-52&&(e=!0):o<-(2**-52)?c<-(2**-52)&&(e=!0):Math.sign(s)===Math.sign(l)&&(e=!0),e?(r=-s,i=o,a=Math.sqrt(u)):(r=o,i=s,a=Math.sqrt(u/2))}return new B(r/a,i/a)}let j=[];for(let e=0,t=D.length,n=t-1,r=e+1;e<t;e++,n++,r++)n===t&&(n=0),r===t&&(r=0),j[e]=A(D[e],D[n],D[r]);let ee=[],M,N=j.concat();for(let e=0,t=E;e<t;e++){let t=w[e];M=[];for(let e=0,n=t.length,r=n-1,i=e+1;e<n;e++,r++,i++)r===n&&(r=0),i===n&&(i=0),M[e]=A(t[e],t[r],t[i]);ee.push(M),N=N.concat(M)}let P;if(p===0)P=Fo.triangulateShape(D,w);else{let e=[],t=[];for(let n=0;n<p;n++){let r=n/p,i=u*Math.cos(r*Math.PI/2),a=d*Math.sin(r*Math.PI/2)+f;for(let t=0,n=D.length;t<n;t++){let n=O(D[t],j[t],a);oe(n.x,n.y,-i),r===0&&e.push(n)}for(let e=0,n=E;e<n;e++){let n=w[e];M=ee[e];let o=[];for(let e=0,t=n.length;e<t;e++){let t=O(n[e],M[e],a);oe(t.x,t.y,-i),r===0&&o.push(t)}r===0&&t.push(o)}}P=Fo.triangulateShape(e,t)}let te=P.length,ne=d+f;for(let e=0;e<k;e++){let t=l?O(C[e],N[e],ne):C[e];_?(b.copy(v.normals[0]).multiplyScalar(t.x),y.copy(v.binormals[0]).multiplyScalar(t.y),x.copy(g[0]).add(b).add(y),oe(x.x,x.y,x.z)):oe(t.x,t.y,0)}for(let e=1;e<=s;e++)for(let t=0;t<k;t++){let n=l?O(C[t],N[t],ne):C[t];_?(b.copy(v.normals[e]).multiplyScalar(n.x),y.copy(v.binormals[e]).multiplyScalar(n.y),x.copy(g[e]).add(b).add(y),oe(x.x,x.y,x.z)):oe(n.x,n.y,c/s*e)}for(let e=p-1;e>=0;e--){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=D.length;e<t;e++){let t=O(D[e],j[e],r);oe(t.x,t.y,c+n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];M=ee[e];for(let e=0,i=t.length;e<i;e++){let i=O(t[e],M[e],r);_?oe(i.x,i.y+g[s-1].y,g[s-1].x+n):oe(i.x,i.y,c+n)}}}re(),ie();function re(){let e=r.length/3;if(l){let e=0,t=k*e;for(let e=0;e<te;e++){let n=P[e];se(n[2]+t,n[1]+t,n[0]+t)}e=s+p*2,t=k*e;for(let e=0;e<te;e++){let n=P[e];se(n[0]+t,n[1]+t,n[2]+t)}}else{for(let e=0;e<te;e++){let t=P[e];se(t[2],t[1],t[0])}for(let e=0;e<te;e++){let t=P[e];se(t[0]+k*s,t[1]+k*s,t[2]+k*s)}}n.addGroup(e,r.length/3-e,0)}function ie(){let e=r.length/3,t=0;ae(D,t),t+=D.length;for(let e=0,n=w.length;e<n;e++){let n=w[e];ae(n,t),t+=n.length}n.addGroup(e,r.length/3-e,1)}function ae(e,t){let n=e.length;for(;--n>=0;){let r=n,i=n-1;i<0&&(i=e.length-1);for(let e=0,n=s+p*2;e<n;e++){let n=k*e,a=k*(e+1);ce(t+r+n,t+i+n,t+i+a,t+r+a)}}}function oe(e,t,n){a.push(e),a.push(t),a.push(n)}function se(e,t,i){F(e),F(t),F(i);let a=r.length/3,o=h.generateTopUV(n,r,a-3,a-2,a-1);le(o[0]),le(o[1]),le(o[2])}function ce(e,t,i,a){F(e),F(t),F(a),F(t),F(i),F(a);let o=r.length/3,s=h.generateSideWallUV(n,r,o-6,o-3,o-2,o-1);le(s[0]),le(s[1]),le(s[3]),le(s[1]),le(s[2]),le(s[3])}function F(e){r.push(a[e*3+0]),r.push(a[e*3+1]),r.push(a[e*3+2])}function le(e){i.push(e.x),i.push(e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Bo(t,n,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new Xa[i.type]().fromJSON(i)),new e(r,t.options)}},zo={generateTopUV:function(e,t,n,r,i){let a=t[n*3],o=t[n*3+1],s=t[r*3],c=t[r*3+1],l=t[i*3],u=t[i*3+1];return[new B(a,o),new B(s,c),new B(l,u)]},generateSideWallUV:function(e,t,n,r,i,a){let o=t[n*3],s=t[n*3+1],c=t[n*3+2],l=t[r*3],u=t[r*3+1],d=t[r*3+2],f=t[i*3],p=t[i*3+1],m=t[i*3+2],h=t[a*3],g=t[a*3+1],_=t[a*3+2];return Math.abs(s-u)<Math.abs(o-l)?[new B(o,1-c),new B(l,1-d),new B(f,1-m),new B(h,1-_)]:[new B(s,1-c),new B(u,1-d),new B(p,1-m),new B(g,1-_)]}};function Bo(e,t,n){if(n.shapes=[],Array.isArray(e))for(let t=0,r=e.length;t<r;t++){let r=e[t];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var Vo=class e extends Ca{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Ho=class e extends Br{constructor(e=[new B(0,-.5),new B(.5,0),new B(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type=`LatheGeometry`,this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=z(r,0,Math.PI*2);let i=[],a=[],o=[],s=[],c=[],l=1/t,u=new V,d=new B,f=new V,p=new V,m=new V,h=0,g=0;for(let t=0;t<=e.length-1;t++)switch(t){case 0:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,m.copy(f),f.normalize(),s.push(f.x,f.y,f.z);break;case e.length-1:s.push(m.x,m.y,m.z);break;default:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,p.copy(f),f.x+=m.x,f.y+=m.y,f.z+=m.z,f.normalize(),s.push(f.x,f.y,f.z),m.copy(p)}for(let i=0;i<=t;i++){let f=n+i*l*r,p=Math.sin(f),m=Math.cos(f);for(let n=0;n<=e.length-1;n++){u.x=e[n].x*p,u.y=e[n].y,u.z=e[n].x*m,a.push(u.x,u.y,u.z),d.x=i/t,d.y=n/(e.length-1),o.push(d.x,d.y);let r=s[3*n+0]*p,l=s[3*n+1],f=s[3*n+0]*m;c.push(r,l,f)}}for(let n=0;n<t;n++)for(let t=0;t<e.length-1;t++){let r=t+n*e.length,a=r,o=r+e.length,s=r+e.length+1,c=r+1;i.push(a,o,c),i.push(s,c,o)}this.setIndex(i),this.setAttribute(`position`,new W(a,3)),this.setAttribute(`uv`,new W(o,2)),this.setAttribute(`normal`,new W(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.points,t.segments,t.phiStart,t.phiLength)}},Uo=class e extends Ca{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Wo=class e extends Br{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new W(p,3)),this.setAttribute(`normal`,new W(m,3)),this.setAttribute(`uv`,new W(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Go=class e extends Br{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new V,p=new B;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new W(s,3)),this.setAttribute(`normal`,new W(c,3)),this.setAttribute(`uv`,new W(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Ko=class e extends Br{constructor(e=new $a([new B(0,.5),new B(-.5,-.5),new B(.5,-.5)]),t=12){super(),this.type=`ShapeGeometry`,this.parameters={shapes:e,curveSegments:t};let n=[],r=[],i=[],a=[],o=0,s=0;if(Array.isArray(e)===!1)c(e);else for(let t=0;t<e.length;t++)c(e[t]),this.addGroup(o,s,t),o+=s,s=0;this.setIndex(n),this.setAttribute(`position`,new W(r,3)),this.setAttribute(`normal`,new W(i,3)),this.setAttribute(`uv`,new W(a,2));function c(e){let o=r.length/3,c=e.extractPoints(t),l=c.shape,u=c.holes;Fo.isClockWise(l)===!1&&(l=l.reverse());for(let e=0,t=u.length;e<t;e++){let t=u[e];Fo.isClockWise(t)===!0&&(u[e]=t.reverse())}let d=Fo.triangulateShape(l,u);for(let e=0,t=u.length;e<t;e++){let t=u[e];l=l.concat(t)}for(let e=0,t=l.length;e<t;e++){let t=l[e];r.push(t.x,t.y,0),i.push(0,0,1),a.push(t.x,t.y)}for(let e=0,t=d.length;e<t;e++){let t=d[e],r=t[0]+o,i=t[1]+o,a=t[2]+o;n.push(r,i,a),s+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return qo(t,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}return new e(r,t.curveSegments)}};function qo(e,t){if(t.shapes=[],Array.isArray(e))for(let n=0,r=e.length;n<r;n++){let r=e[n];t.shapes.push(r.uuid)}else t.shapes.push(e.uuid);return t}var Jo=class e extends Br{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new V,d=new V,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=0;f===0&&a===0?v=.5/t:f===n&&s===Math.PI&&(v=-.5/t);for(let n=0;n<=t;n++){let s=n/t;u.x=-e*Math.cos(r+s*i)*Math.sin(a+_*o),u.y=e*Math.cos(a+_*o),u.z=e*Math.sin(r+s*i)*Math.sin(a+_*o),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(s+v,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new W(p,3)),this.setAttribute(`normal`,new W(m,3)),this.setAttribute(`uv`,new W(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Yo=class e extends Br{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i},n=Math.floor(n),r=Math.floor(r);let a=[],o=[],s=[],c=[],l=new V,u=new V,d=new V;for(let a=0;a<=n;a++)for(let f=0;f<=r;f++){let p=f/r*i,m=a/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(p),u.y=(e+t*Math.cos(m))*Math.sin(p),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),l.x=e*Math.cos(p),l.y=e*Math.sin(p),d.subVectors(u,l).normalize(),s.push(d.x,d.y,d.z),c.push(f/r),c.push(a/n)}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,o=(r+1)*(e-1)+t,s=(r+1)*e+t;a.push(n,i,s),a.push(i,o,s)}this.setIndex(a),this.setAttribute(`position`,new W(o,3)),this.setAttribute(`normal`,new W(s,3)),this.setAttribute(`uv`,new W(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}},Xo=class e extends Br{constructor(e=new Ja(new V(-1,-1,0),new V(-1,1,0),new V(1,1,0)),t=64,n=1,r=8,i=!1){super(),this.type=`TubeGeometry`,this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:i};let a=e.computeFrenetFrames(t,i);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new V,s=new V,c=new B,l=new V,u=[],d=[],f=[],p=[];m(),this.setIndex(p),this.setAttribute(`position`,new W(u,3)),this.setAttribute(`normal`,new W(d,3)),this.setAttribute(`uv`,new W(f,2));function m(){for(let e=0;e<t;e++)h(e);h(i===!1?t:0),_(),g()}function h(i){l=e.getPointAt(i/t,l);let c=a.normals[i],f=a.binormals[i];for(let e=0;e<=r;e++){let t=e/r*Math.PI*2,i=Math.sin(t),a=-Math.cos(t);s.x=a*c.x+i*f.x,s.y=a*c.y+i*f.y,s.z=a*c.z+i*f.z,s.normalize(),d.push(s.x,s.y,s.z),o.x=l.x+n*s.x,o.y=l.y+n*s.y,o.z=l.z+n*s.z,u.push(o.x,o.y,o.z)}}function g(){for(let e=1;e<=t;e++)for(let t=1;t<=r;t++){let n=(r+1)*(e-1)+(t-1),i=(r+1)*e+(t-1),a=(r+1)*e+t,o=(r+1)*(e-1)+t;p.push(n,i,o),p.push(i,a,o)}}function _(){for(let e=0;e<=t;e++)for(let n=0;n<=r;n++)c.x=e/t,c.y=n/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(t){return new e(new Xa[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},Zo=class extends Tr{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:``},this.type=`MeshToonMaterial`,this.color=new U(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new U(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Qo=class extends Tr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=lt,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},$o=class extends Tr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function es(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function ts(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}var ns=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},rs=class extends ns{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ot,endingEnd:ot}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case st:i=e,o=2*t-n;break;case ct:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case st:a=e,s=2*n-t;break;case ct:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},is=class extends ns{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},as=class extends ns{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},os=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=es(t,this.TimeBufferType),this.values=es(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:es(e.times,Array),values:es(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new as(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new is(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new rs(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case rt:t=this.InterpolantFactoryMethodDiscrete;break;case it:t=this.InterpolantFactoryMethodLinear;break;case at:t=this.InterpolantFactoryMethodSmooth}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return console.warn(`THREE.KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return rt;case this.InterpolantFactoryMethodLinear:return it;case this.InterpolantFactoryMethodSmooth:return at}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error(`THREE.KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(console.error(`THREE.KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){console.error(`THREE.KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){console.error(`THREE.KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&ts(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){console.error(`THREE.KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===at,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};os.prototype.ValueTypeName=``,os.prototype.TimeBufferType=Float32Array,os.prototype.ValueBufferType=Float32Array,os.prototype.DefaultInterpolation=it;var ss=class extends os{constructor(e,t,n){super(e,t,n)}};ss.prototype.ValueTypeName=`bool`,ss.prototype.ValueBufferType=Array,ss.prototype.DefaultInterpolation=rt,ss.prototype.InterpolantFactoryMethodLinear=void 0,ss.prototype.InterpolantFactoryMethodSmooth=void 0;var cs=class extends os{constructor(e,t,n,r){super(e,t,n,r)}};cs.prototype.ValueTypeName=`color`;var ls=class extends os{constructor(e,t,n,r){super(e,t,n,r)}};ls.prototype.ValueTypeName=`number`;var us=class extends ns{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Ot.slerpFlat(i,0,a,c-o,a,c,s);return i}},ds=class extends os{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new us(this.times,this.values,this.getValueSize(),e)}};ds.prototype.ValueTypeName=`quaternion`,ds.prototype.InterpolantFactoryMethodSmooth=void 0;var fs=class extends os{constructor(e,t,n){super(e,t,n)}};fs.prototype.ValueTypeName=`string`,fs.prototype.ValueBufferType=Array,fs.prototype.DefaultInterpolation=rt,fs.prototype.InterpolantFactoryMethodLinear=void 0,fs.prototype.InterpolantFactoryMethodSmooth=void 0;var ps=class extends os{constructor(e,t,n,r){super(e,t,n,r)}};ps.prototype.ValueTypeName=`vector`;var ms={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(this.files[e]=t)},get:function(e){if(this.enabled!==!1)return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}},hs=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},gs=class{constructor(e){this.manager=e===void 0?hs:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};gs.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var _s=new WeakMap,vs=class extends gs{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=ms.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=_s.get(a);e===void 0&&(e=[],_s.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=Nt(`img`);function s(){l(),t&&t(this);let n=_s.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}_s.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),ms.remove(`image:${e}`);let n=_s.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}_s.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),ms.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},ys=class extends gs{constructor(e){super(e)}load(e,t,n,r){let i=new Zt,a=new vs(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},bs=class extends ir{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new U(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},xs=new jn,Ss=new V,Cs=new V,ws=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new B(512,512),this.mapType=oe,this.map=null,this.mapPass=null,this.matrix=new jn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new aa,this._frameExtents=new B(1,1),this._viewportCount=1,this._viewports=[new Qt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Ss.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ss),Cs.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Cs),t.updateMatrixWorld(),xs.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xs,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(xs)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ts=class extends li{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Es=class extends ws{constructor(){super(new Ts(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ds=class extends bs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(ir.DEFAULT_UP),this.updateMatrix(),this.target=new ir,this.shadow=new Es}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Os=class extends bs{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},ks=class extends pi{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},As=`\\[\\]\\.:\\/`,js=RegExp(`[\\[\\]\\.:\\/]`,`g`),Ms=`[^\\[\\]\\.:\\/]`,Ns=`[^`+As.replace(`\\.`,``)+`]`,Ps=`((?:WC+[\\/:])*)`.replace(`WC`,Ms),Fs=`(WCOD+)?`.replace(`WCOD`,Ns),Is=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Ms),Ls=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Ms),Rs=RegExp(`^`+Ps+Fs+Is+Ls+`$`),zs=[`material`,`materials`,`bones`,`map`],Bs=class{constructor(e,t,n){let r=n||Vs.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Vs=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(js,``)}static parseTrackName(e){let t=Rs.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);zs.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn(`THREE.PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){console.error(`THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){console.error(`THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){console.error(`THREE.PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){console.error(`THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error(`THREE.PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){console.error(`THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;console.error(`THREE.PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){console.error(`THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Vs.Composite=Bs,Vs.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Vs.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Vs.prototype.GetterByBindingType=[Vs.prototype._getValue_direct,Vs.prototype._getValue_array,Vs.prototype._getValue_arrayElement,Vs.prototype._getValue_toArray],Vs.prototype.SetterByBindingTypeAndVersioning=[[Vs.prototype._setValue_direct,Vs.prototype._setValue_direct_setNeedsUpdate,Vs.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Vs.prototype._setValue_array,Vs.prototype._setValue_array_setNeedsUpdate,Vs.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Vs.prototype._setValue_arrayElement,Vs.prototype._setValue_arrayElement_setNeedsUpdate,Vs.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Vs.prototype._setValue_fromArray,Vs.prototype._setValue_fromArray_setNeedsUpdate,Vs.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Hs=new jn,Us=class{constructor(e,t,n=0,r=1/0){this.ray=new An(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Hn,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error(`THREE.Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Hs.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Hs),this}intersectObject(e,t=!0,n=[]){return Gs(e,this,n,t),n.sort(Ws),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Gs(e[r],this,n,t);return n.sort(Ws),n}};function Ws(e,t){return e.distance-t.distance}function Gs(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Gs(r[e],t,n,!0)}}function Ks(e,t,n,r){let i=qs(r);switch(n){case _e:return e*t;case be:return e*t/i.components*i.byteLength;case xe:return e*t/i.components*i.byteLength;case Se:return e*t*2/i.components*i.byteLength;case Ce:return e*t*2/i.components*i.byteLength;case L:return e*t*3/i.components*i.byteLength;case ve:return e*t*4/i.components*i.byteLength;case we:return e*t*4/i.components*i.byteLength;case Te:case Ee:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case De:case Oe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ae:case Me:return Math.max(e,16)*Math.max(t,8)/4;case ke:case je:return Math.max(e,8)*Math.max(t,8)/2;case Ne:case Pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Fe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ie:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Le:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Re:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ze:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Be:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Ve:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case He:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Ue:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case We:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Ge:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Ke:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case qe:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Je:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ye:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Xe:case Ze:case Qe:return Math.ceil(e/4)*Math.ceil(t/4)*16;case $e:case et:return Math.ceil(e/4)*Math.ceil(t/4)*8;case tt:case nt:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function qs(e){switch(e){case oe:case se:return{byteLength:1,components:1};case F:case ce:case fe:return{byteLength:2,components:1};case pe:case me:return{byteLength:2,components:4};case ue:case le:case de:return{byteLength:4,components:1};case he:case ge:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`180`}})),typeof window<`u`&&(window.__THREE__?console.warn(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`180`);function Js(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Ys(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var q={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},J={common:{diffuse:{value:new U(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new U(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new U(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new U(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},Xs={basic:{uniforms:ni([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.fog]),vertexShader:q.meshbasic_vert,fragmentShader:q.meshbasic_frag},lambert:{uniforms:ni([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.fog,J.lights,{emissive:{value:new U(0)}}]),vertexShader:q.meshlambert_vert,fragmentShader:q.meshlambert_frag},phong:{uniforms:ni([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.fog,J.lights,{emissive:{value:new U(0)},specular:{value:new U(1118481)},shininess:{value:30}}]),vertexShader:q.meshphong_vert,fragmentShader:q.meshphong_frag},standard:{uniforms:ni([J.common,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.roughnessmap,J.metalnessmap,J.fog,J.lights,{emissive:{value:new U(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:q.meshphysical_vert,fragmentShader:q.meshphysical_frag},toon:{uniforms:ni([J.common,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.gradientmap,J.fog,J.lights,{emissive:{value:new U(0)}}]),vertexShader:q.meshtoon_vert,fragmentShader:q.meshtoon_frag},matcap:{uniforms:ni([J.common,J.bumpmap,J.normalmap,J.displacementmap,J.fog,{matcap:{value:null}}]),vertexShader:q.meshmatcap_vert,fragmentShader:q.meshmatcap_frag},points:{uniforms:ni([J.points,J.fog]),vertexShader:q.points_vert,fragmentShader:q.points_frag},dashed:{uniforms:ni([J.common,J.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:q.linedashed_vert,fragmentShader:q.linedashed_frag},depth:{uniforms:ni([J.common,J.displacementmap]),vertexShader:q.depth_vert,fragmentShader:q.depth_frag},normal:{uniforms:ni([J.common,J.bumpmap,J.normalmap,J.displacementmap,{opacity:{value:1}}]),vertexShader:q.meshnormal_vert,fragmentShader:q.meshnormal_frag},sprite:{uniforms:ni([J.sprite,J.fog]),vertexShader:q.sprite_vert,fragmentShader:q.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:q.background_vert,fragmentShader:q.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:q.backgroundCube_vert,fragmentShader:q.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:q.cube_vert,fragmentShader:q.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:q.equirect_vert,fragmentShader:q.equirect_frag},distanceRGBA:{uniforms:ni([J.common,J.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:q.distanceRGBA_vert,fragmentShader:q.distanceRGBA_frag},shadow:{uniforms:ni([J.lights,J.fog,{color:{value:new U(0)},opacity:{value:1}}]),vertexShader:q.shadow_vert,fragmentShader:q.shadow_frag}};Xs.physical={uniforms:ni([Xs.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new U(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new U(0)},specularColor:{value:new U(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:q.meshphysical_vert,fragmentShader:q.meshphysical_frag};var Zs={r:0,b:0,g:0},Qs=new Vn,$s=new jn;function ec(e,t,n,r,i,a,o){let s=new U(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new G(new ei(1,1,1),new ci({name:`BackgroundCubeMaterial`,uniforms:ti(Xs.backgroundCube.uniforms),vertexShader:Xs.backgroundCube.vertexShader,fragmentShader:Xs.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),Qs.copy(n.backgroundRotation),Qs.x*=-1,Qs.y*=-1,Qs.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(Qs.y*=-1,Qs.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4($s.makeRotationFromEuler(Qs)),u.material.toneMapped=Vt.getTransfer(r.colorSpace)!==mt,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new G(new Wo(2,2),new ci({name:`BackgroundMaterial`,uniforms:ti(Xs.background.uniforms),vertexShader:Xs.background.vertexShader,fragmentShader:Xs.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Vt.getTransfer(r.colorSpace)!==mt,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Zs,ii(e)),r.buffers.color.setClear(Zs.r,Zs.g,Zs.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function tc(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function nc(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function rc(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function ic(e){let t=this,n=null,r=0,i=!1,a=!1,o=new ta,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function ac(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new vi(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var oc=4,sc=[.125,.215,.35,.446,.526,.582],cc=20,lc=new Ts,uc=new U,dc=null,fc=0,pc=0,mc=!1,hc=(1+Math.sqrt(5))/2,gc=1/hc,_c=[new V(-hc,gc,0),new V(hc,gc,0),new V(-gc,0,hc),new V(gc,0,hc),new V(0,hc,-gc),new V(0,hc,gc),new V(-1,1,-1),new V(1,1,-1),new V(-1,1,1),new V(1,1,1)],vc=new V,yc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=vc}=i;dc=this._renderer.getRenderTarget(),fc=this._renderer.getActiveCubeFace(),pc=this._renderer.getActiveMipmapLevel(),mc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Tc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=wc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(dc,fc,pc),this._renderer.xr.enabled=mc,e.scissorTest=!1,Sc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),dc=this._renderer.getRenderTarget(),fc=this._renderer.getActiveCubeFace(),pc=this._renderer.getActiveMipmapLevel(),mc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:re,minFilter:re,generateMipmaps:!1,type:fe,format:ve,colorSpace:ft,depthBuffer:!1},r=xc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=xc(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=bc(r)),this._blurMaterial=Cc(r,e,t)}return r}_compileMaterial(e){let t=new G(this._lodPlanes[0],e);this._renderer.compile(t,lc)}_sceneToCubeUV(e,t,n,r,i){let a=new pi(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(uc),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new Er({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new G(new ei,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(uc),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Sc(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Tc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=wc());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new G(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Sc(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,lc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=_c[(r-t-1)%_c.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new G(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):cc;m>cc&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${cc}`);let h=[],g=0;for(let e=0;e<cc;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Sc(t,3*v*(r>_-oc?r-_+oc:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,lc)}};function bc(e){let t=[],n=[],r=[],i=e,a=e-oc+1+sc.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-oc?s=sc[o-e+oc-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Br;h.setAttribute(`position`,new Ar(f,3)),h.setAttribute(`uv`,new Ar(p,2)),h.setAttribute(`faceIndex`,new Ar(m,1)),t.push(h),i>oc&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function xc(e,t,n){let r=new en(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Sc(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Cc(e,t,n){let r=new Float32Array(cc),i=new V(0,1,0);return new ci({name:`SphericalGaussianBlur`,defines:{n:cc,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Ec(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function wc(){return new ci({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Ec(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Tc(){return new ci({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ec(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ec(){return`

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
	`}function Dc(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new yc(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new yc(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function Oc(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&It(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function kc(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(Mt(n)?Mr:jr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Ac(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function jc(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Mc(e,t,n){let r=new WeakMap,i=new Qt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new tn(h,p,m,u);g.type=de,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new B(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Nc(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var Pc=new Zt,Fc=new _a(1,1),Ic=new tn,Lc=new nn,Rc=new _i,zc=[],Bc=[],Vc=new Float32Array(16),Hc=new Float32Array(9),Uc=new Float32Array(4);function Wc(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=zc[i];if(a===void 0&&(a=new Float32Array(i),zc[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Gc(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Kc(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function qc(e,t){let n=Bc[t];n===void 0&&(n=new Int32Array(t),Bc[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Jc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Yc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gc(n,t))return;e.uniform2fv(this.addr,t),Kc(n,t)}}function Xc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Gc(n,t))return;e.uniform3fv(this.addr,t),Kc(n,t)}}function Zc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gc(n,t))return;e.uniform4fv(this.addr,t),Kc(n,t)}}function Qc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gc(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Kc(n,t)}else{if(Gc(n,r))return;Uc.set(r),e.uniformMatrix2fv(this.addr,!1,Uc),Kc(n,r)}}function $c(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gc(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Kc(n,t)}else{if(Gc(n,r))return;Hc.set(r),e.uniformMatrix3fv(this.addr,!1,Hc),Kc(n,r)}}function el(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gc(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Kc(n,t)}else{if(Gc(n,r))return;Vc.set(r),e.uniformMatrix4fv(this.addr,!1,Vc),Kc(n,r)}}function tl(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function nl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gc(n,t))return;e.uniform2iv(this.addr,t),Kc(n,t)}}function rl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Gc(n,t))return;e.uniform3iv(this.addr,t),Kc(n,t)}}function il(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gc(n,t))return;e.uniform4iv(this.addr,t),Kc(n,t)}}function al(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function ol(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gc(n,t))return;e.uniform2uiv(this.addr,t),Kc(n,t)}}function sl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Gc(n,t))return;e.uniform3uiv(this.addr,t),Kc(n,t)}}function cl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gc(n,t))return;e.uniform4uiv(this.addr,t),Kc(n,t)}}function ll(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Fc.compareFunction=515,a=Fc):a=Pc,n.setTexture2D(t||a,i)}function ul(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Lc,i)}function dl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Rc,i)}function fl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Ic,i)}function pl(e){switch(e){case 5126:return Jc;case 35664:return Yc;case 35665:return Xc;case 35666:return Zc;case 35674:return Qc;case 35675:return $c;case 35676:return el;case 5124:case 35670:return tl;case 35667:case 35671:return nl;case 35668:case 35672:return rl;case 35669:case 35673:return il;case 5125:return al;case 36294:return ol;case 36295:return sl;case 36296:return cl;case 35678:case 36198:case 36298:case 36306:case 35682:return ll;case 35679:case 36299:case 36307:return ul;case 35680:case 36300:case 36308:case 36293:return dl;case 36289:case 36303:case 36311:case 36292:return fl}}function ml(e,t){e.uniform1fv(this.addr,t)}function hl(e,t){let n=Wc(t,this.size,2);e.uniform2fv(this.addr,n)}function gl(e,t){let n=Wc(t,this.size,3);e.uniform3fv(this.addr,n)}function _l(e,t){let n=Wc(t,this.size,4);e.uniform4fv(this.addr,n)}function vl(e,t){let n=Wc(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function yl(e,t){let n=Wc(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function bl(e,t){let n=Wc(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function xl(e,t){e.uniform1iv(this.addr,t)}function Sl(e,t){e.uniform2iv(this.addr,t)}function Cl(e,t){e.uniform3iv(this.addr,t)}function wl(e,t){e.uniform4iv(this.addr,t)}function Tl(e,t){e.uniform1uiv(this.addr,t)}function El(e,t){e.uniform2uiv(this.addr,t)}function Dl(e,t){e.uniform3uiv(this.addr,t)}function Ol(e,t){e.uniform4uiv(this.addr,t)}function kl(e,t,n){let r=this.cache,i=t.length,a=qc(n,i);Gc(r,a)||(e.uniform1iv(this.addr,a),Kc(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||Pc,a[e])}function Al(e,t,n){let r=this.cache,i=t.length,a=qc(n,i);Gc(r,a)||(e.uniform1iv(this.addr,a),Kc(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Lc,a[e])}function jl(e,t,n){let r=this.cache,i=t.length,a=qc(n,i);Gc(r,a)||(e.uniform1iv(this.addr,a),Kc(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Rc,a[e])}function Ml(e,t,n){let r=this.cache,i=t.length,a=qc(n,i);Gc(r,a)||(e.uniform1iv(this.addr,a),Kc(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Ic,a[e])}function Nl(e){switch(e){case 5126:return ml;case 35664:return hl;case 35665:return gl;case 35666:return _l;case 35674:return vl;case 35675:return yl;case 35676:return bl;case 5124:case 35670:return xl;case 35667:case 35671:return Sl;case 35668:case 35672:return Cl;case 35669:case 35673:return wl;case 5125:return Tl;case 36294:return El;case 36295:return Dl;case 36296:return Ol;case 35678:case 36198:case 36298:case 36306:case 35682:return kl;case 35679:case 36299:case 36307:return Al;case 35680:case 36300:case 36308:case 36293:return jl;case 36289:case 36303:case 36311:case 36292:return Ml}}var Pl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=pl(t.type)}},Fl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Nl(t.type)}},Il=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ll=/(\w+)(\])?(\[|\.)?/g;function Rl(e,t){e.seq.push(t),e.map[t.id]=t}function zl(e,t,n){let r=e.name,i=r.length;for(Ll.lastIndex=0;;){let a=Ll.exec(r),o=Ll.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Rl(n,l===void 0?new Pl(s,e,t):new Fl(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Il(s),Rl(n,e)),n=e}}}var Bl=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);zl(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Vl(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Hl=37297,Ul=0;function Wl(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Gl=new H;function Kl(e){Vt._getMatrix(Gl,Vt.workingColorSpace,e);let t=`mat3( ${Gl.elements.map(e=>e.toFixed(4))} )`;switch(Vt.getTransfer(e)){case pt:return[t,`LinearTransferOETF`];case mt:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function ql(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Wl(e.getShaderSource(t),r)}return i}function Jl(e,t){let n=Kl(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function Yl(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Xl=new V;function Zl(){return Vt.getLuminanceCoefficients(Xl),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Xl.x.toFixed(4)}, ${Xl.y.toFixed(4)}, ${Xl.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Ql(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(tu).join(`
`)}function $l(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function eu(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function tu(e){return e!==``}function nu(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ru(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var iu=/^[ \t]*#include +<([\w\d./]+)>/gm;function au(e){return e.replace(iu,su)}var ou=new Map;function su(e,t){let n=q[t];if(n===void 0){let e=ou.get(t);if(e!==void 0)n=q[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return au(n)}var cu=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function lu(e){return e.replace(cu,uu)}function uu(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function du(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}function fu(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function pu(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function mu(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function hu(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function gu(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function _u(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=fu(n),l=pu(n),u=mu(n),d=hu(n),f=gu(n),p=Ql(n),m=$l(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(tu).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(tu).join(`
`),_.length>0&&(_+=`
`)):(g=[du(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(tu).join(`
`),_=[du(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:q.tonemapping_pars_fragment,n.toneMapping===0?``:Yl(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,q.colorspace_pars_fragment,Jl(`linearToOutputTexel`,n.outputColorSpace),Zl(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(tu).join(`
`)),o=au(o),o=nu(o,n),o=ru(o,n),s=au(s),s=nu(s,n),s=ru(s,n),o=lu(o),s=lu(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Vl(i,i.VERTEX_SHADER,y),S=Vl(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=ql(i,x,`vertex`),n=ql(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Bl(i,h),T=eu(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Hl)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Ul++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var vu=0,yu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new bu(e),t.set(e,n)),n}},bu=class{constructor(e){this.id=vu++,this.code=e,this.usedTimes=0}};function xu(e,t,n,r,i,a,o){let s=new Hn,c=new yu,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=Xs[C];D=e.vertexShader,O=e.fragmentShader}else D=a.vertexShader,O=a.fragmentShader,c.update(a),k=c.getVertexShaderID(a),A=c.getFragmentShaderID(a);let j=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),M=_.isInstancedMesh===!0,N=_.isBatchedMesh===!0,P=!!a.map,te=!!a.matcap,ne=!!x,re=!!a.aoMap,ie=!!a.lightMap,ae=!!a.bumpMap,oe=!!a.normalMap,se=!!a.displacementMap,ce=!!a.emissiveMap,F=!!a.metalnessMap,le=!!a.roughnessMap,ue=a.anisotropy>0,de=a.clearcoat>0,fe=a.dispersion>0,pe=a.iridescence>0,me=a.sheen>0,I=a.transmission>0,he=ue&&!!a.anisotropyMap,ge=de&&!!a.clearcoatMap,_e=de&&!!a.clearcoatNormalMap,L=de&&!!a.clearcoatRoughnessMap,ve=pe&&!!a.iridescenceMap,R=pe&&!!a.iridescenceThicknessMap,ye=me&&!!a.sheenColorMap,be=me&&!!a.sheenRoughnessMap,xe=!!a.specularMap,Se=!!a.specularColorMap,Ce=!!a.specularIntensityMap,we=I&&!!a.transmissionMap,Te=I&&!!a.thicknessMap,Ee=!!a.gradientMap,De=!!a.alphaMap,Oe=a.alphaTest>0,ke=!!a.alphaHash,Ae=!!a.extensions,je=0;a.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(je=e.toneMapping);let Me={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:O,defines:a.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:N,batchingColor:N&&_._colorsTexture!==null,instancing:M,instancingColor:M&&_.instanceColor!==null,instancingMorph:M&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:ft,alphaToCoverage:!!a.alphaToCoverage,map:P,matcap:te,envMap:ne,envMapMode:ne&&x.mapping,envMapCubeUVHeight:S,aoMap:re,lightMap:ie,bumpMap:ae,normalMap:oe,displacementMap:f&&se,emissiveMap:ce,normalMapObjectSpace:oe&&a.normalMapType===1,normalMapTangentSpace:oe&&a.normalMapType===0,metalnessMap:F,roughnessMap:le,anisotropy:ue,anisotropyMap:he,clearcoat:de,clearcoatMap:ge,clearcoatNormalMap:_e,clearcoatRoughnessMap:L,dispersion:fe,iridescence:pe,iridescenceMap:ve,iridescenceThicknessMap:R,sheen:me,sheenColorMap:ye,sheenRoughnessMap:be,specularMap:xe,specularColorMap:Se,specularIntensityMap:Ce,transmission:I,transmissionMap:we,thicknessMap:Te,gradientMap:Ee,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:De,alphaTest:Oe,alphaHash:ke,combine:a.combine,mapUv:P&&h(a.map.channel),aoMapUv:re&&h(a.aoMap.channel),lightMapUv:ie&&h(a.lightMap.channel),bumpMapUv:ae&&h(a.bumpMap.channel),normalMapUv:oe&&h(a.normalMap.channel),displacementMapUv:se&&h(a.displacementMap.channel),emissiveMapUv:ce&&h(a.emissiveMap.channel),metalnessMapUv:F&&h(a.metalnessMap.channel),roughnessMapUv:le&&h(a.roughnessMap.channel),anisotropyMapUv:he&&h(a.anisotropyMap.channel),clearcoatMapUv:ge&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:_e&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:L&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:R&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:ye&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:be&&h(a.sheenRoughnessMap.channel),specularMapUv:xe&&h(a.specularMap.channel),specularColorMapUv:Se&&h(a.specularColorMap.channel),specularIntensityMapUv:Ce&&h(a.specularIntensityMap.channel),transmissionMapUv:we&&h(a.transmissionMap.channel),thicknessMapUv:Te&&h(a.thicknessMap.channel),alphaMapUv:De&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(oe||ue),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(P||De),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ee,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:je,decodeVideoTexture:P&&a.map.isVideoTexture===!0&&Vt.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ce&&a.emissiveMap.isVideoTexture===!0&&Vt.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Ae&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ae&&a.extensions.multiDraw===!0||N)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Me.vertexUv1s=l.has(1),Me.vertexUv2s=l.has(2),Me.vertexUv3s=l.has(3),l.clear(),Me}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=Xs[t];n=ai.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new _u(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Su(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Cu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function wu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Tu(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Cu),r.length>1&&r.sort(t||wu),i.length>1&&i.sort(t||wu)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function Eu(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Tu,e.set(t,[i])):n>=r.length?(i=new Tu,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Du(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new V,color:new U};break;case`SpotLight`:n={position:new V,direction:new V,color:new U,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new U,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new U,groundColor:new U};break;case`RectAreaLight`:n={color:new U,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function Ou(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var ku=0;function Au(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function ju(e){let t=new Du,n=Ou(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new jn,o=new jn;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Au);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=J.LTC_FLOAT_1,r.rectAreaLTC2=J.LTC_FLOAT_2):(r.rectAreaLTC1=J.LTC_HALF_1,r.rectAreaLTC2=J.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=ku++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Mu(e){let t=new ju(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function Nu(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Mu(e),t.set(n,[a])):r>=i.length?(a=new Mu(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Pu=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Fu=`uniform sampler2D shadow_pass;
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
}`;function Iu(e,t,n){let r=new aa,i=new B,a=new B,o=new Qt,s=new Qo({depthPacking:ut}),c=new $o,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new ci({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new B},radius:{value:4}},vertexShader:Pu,fragmentShader:Fu}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Br;m.setAttribute(`position`,new Ar(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new G(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:P,magFilter:P};d.map!==null&&d.map.dispose(),d.map=new en(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new en(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var Lu={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Ru(e,t){function n(){let t=!1,n=new Qt,r=null,i=new Qt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ce(e.DEPTH_TEST):F(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Lu[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ce(e.STENCIL_TEST):F(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new U(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ee=!1,M=0,N=e.getParameter(e.VERSION);N.indexOf(`WebGL`)===-1?N.indexOf(`OpenGL ES`)!==-1&&(M=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),ee=M>=2):(M=parseFloat(/^WebGL (\d)/.exec(N)[1]),ee=M>=1);let P=null,te={},ne=e.getParameter(e.SCISSOR_BOX),re=e.getParameter(e.VIEWPORT),ie=new Qt().fromArray(ne),ae=new Qt().fromArray(re);function oe(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let se={};se[e.TEXTURE_2D]=oe(e.TEXTURE_2D,e.TEXTURE_2D,1),se[e.TEXTURE_CUBE_MAP]=oe(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[e.TEXTURE_2D_ARRAY]=oe(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),se[e.TEXTURE_3D]=oe(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ce(e.DEPTH_TEST),o.setFunc(3),he(!1),ge(1),ce(e.CULL_FACE),me(0);function ce(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function F(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function le(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function ue(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function de(t){return m!==t&&(e.useProgram(t),m=t,!0)}let fe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};fe[103]=e.MIN,fe[104]=e.MAX;let pe={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function me(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(F(e.BLEND),h=!1);return}if(h===!1&&(ce(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(fe[n],fe[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(pe[r],pe[i],pe[o],pe[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function I(t,n){t.side===2?F(e.CULL_FACE):ce(e.CULL_FACE);let r=t.side===1;n&&(r=!r),he(r),t.blending===1&&t.transparent===!1?me(0):me(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),L(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ce(e.SAMPLE_ALPHA_TO_COVERAGE):F(e.SAMPLE_ALPHA_TO_COVERAGE)}function he(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function ge(t){t===0?F(e.CULL_FACE):(ce(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function _e(t){t!==O&&(ee&&e.lineWidth(t),O=t)}function L(t,n,r){t?(ce(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):F(e.POLYGON_OFFSET_FILL)}function ve(t){t?ce(e.SCISSOR_TEST):F(e.SCISSOR_TEST)}function R(t){t===void 0&&(t=e.TEXTURE0+j-1),P!==t&&(e.activeTexture(t),P=t)}function ye(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+j-1:P);let i=te[r];i===void 0&&(i={type:void 0,texture:void 0},te[r]=i),(i.type!==t||i.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||se[t]),i.type=t,i.texture=n)}function be(){let t=te[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function xe(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(t){ie.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ie.copy(t))}function Me(t){ae.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ae.copy(t))}function Ne(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Pe(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Fe(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},P=null,te={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new U(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,ie.set(0,0,e.canvas.width,e.canvas.height),ae.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ce,disable:F,bindFramebuffer:le,drawBuffers:ue,useProgram:de,setBlending:me,setMaterial:I,setFlipSided:he,setCullFace:ge,setLineWidth:_e,setPolygonOffset:L,setScissorTest:ve,activeTexture:R,bindTexture:ye,unbindTexture:be,compressedTexImage2D:xe,compressedTexImage3D:Se,texImage2D:ke,texImage3D:Ae,updateUBOMapping:Ne,uniformBlockBinding:Pe,texStorage2D:De,texStorage3D:Oe,texSubImage2D:Ce,texSubImage3D:we,compressedTexSubImage2D:Te,compressedTexSubImage3D:Ee,scissor:je,viewport:Me,reset:Fe}}function zu(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new B,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):Nt(`canvas`)}function h(e,t,n){let r=1,i=ke(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps}function _(t){e.generateMipmap(t)}function v(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?pt:Vt.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function b(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function x(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),w(t),t.isVideoTexture&&u.delete(t)}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),E(t)}function w(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&T(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function T(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function E(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function O(){D=0}function k(){let e=D;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function A(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function j(t,i){let a=r.get(t);if(t.isVideoTexture&&De(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{I(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function oe(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){I(a,t,i);return}n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function se(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){I(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ce(t,i){let a=r.get(t);if(t.version>0&&a.__version!==t.version){he(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let F={[ee]:e.REPEAT,[M]:e.CLAMP_TO_EDGE,[N]:e.MIRRORED_REPEAT},le={[P]:e.NEAREST,[te]:e.NEAREST_MIPMAP_NEAREST,[ne]:e.NEAREST_MIPMAP_LINEAR,[re]:e.LINEAR,[ie]:e.LINEAR_MIPMAP_NEAREST,[ae]:e.LINEAR_MIPMAP_LINEAR},ue={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function de(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,F[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,F[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,F[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,le[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,le[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ue[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function fe(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,S));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=A(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&T(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function pe(e,t,n){return Math.floor(Math.floor(e/n)/t)}function me(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=pe(n.start,r.width,4),c=pe(t.start,r.width,4);n.start<=i+1&&a===c&&pe(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function I(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=fe(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=Vt.getPrimaries(Vt.workingColorSpace),r=o.colorSpace===``?null:Vt.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=Oe(o,p);let m=a.convert(o.format,o.colorSpace),v=a.convert(o.type),S=y(o.internalFormat,m,v,o.colorSpace,o.isVideoTexture);de(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=x(o,p);if(o.isDepthTexture)S=b(o.format===ye,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height),D&&me(o,p,m,v)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=Ks(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,v,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,v,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data):m===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=Ks(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,v,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,v,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,v,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=ke(w[0]);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,v,C):n.texImage2D(e.TEXTURE_2D,t,S,m,v,C);o.generateMipmaps=!1}else if(T){if(E){let t=ke(p);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,v,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,v,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function he(t,o,s){if(o.image.length!==6)return;let c=fe(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=Vt.getPrimaries(Vt.workingColorSpace),r=o.colorSpace===``?null:Vt.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=Oe(o,m[e]);let v=m[0],b=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=y(o.internalFormat,b,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=x(o,v);de(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,v.width,v.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,b,S,i.data):b===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=ke(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,b,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,b,S,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,b,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,b,S,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,b,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ge(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=y(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Ee(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,Te(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function _e(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=b(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=Te(n);Ee(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=y(o.internalFormat,c,l,o.colorSpace),d=Te(n);r&&Ee(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):Ee(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function L(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),j(i.depthTexture,0);let o=a.__webglTexture,c=Te(i);if(i.depthTexture.format===1026)Ee(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)Ee(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function ve(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?L(i.__webglFramebuffer[0],t):L(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),_e(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),_e(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function R(t,n,i){let a=r.get(t);n!==void 0&&ge(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&ve(t)}function be(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,C);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&Ee(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=y(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=Te(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),_e(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),de(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)ge(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else ge(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),de(c,a),ge(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),g(a)&&_(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),de(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)ge(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else ge(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&ve(t)}function xe(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=v(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),_(t),n.unbindTexture()}}}let Se=[],Ce=[];function we(t){if(t.samples>0){if(Ee(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(Se.length=0,Ce.length=0,Se.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(Se.push(l),Ce.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Ce)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Se))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Te(e){return Math.min(i.maxSamples,e.samples)}function Ee(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function De(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function Oe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Vt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function ke(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=O,this.setTexture2D=j,this.setTexture2DArray=oe,this.setTexture3D=se,this.setTextureCube=ce,this.rebindTextures=R,this.setupRenderTarget=be,this.updateRenderTargetMipmap=xe,this.updateMultisampleRenderTarget=we,this.setupDepthRenderbuffer=ve,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=Ee}function Bu(e,t){function n(n,r=``){let i,a=Vt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Vu=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Hu=`
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

}`,Uu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new va(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new ci({vertexShader:Vu,fragmentShader:Hu,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new G(new Wo(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Wu=class extends yt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new Uu,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new B,C=null,w=new pi;w.viewport=new Qt;let T=new pi;T.viewport=new Qt;let E=[w,T],D=new ks,O=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new bi,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new bi,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new bi,b[e]=t),t.getHandSpace()};function A(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function j(){r.removeEventListener(`select`,A),r.removeEventListener(`selectstart`,A),r.removeEventListener(`selectend`,A),r.removeEventListener(`squeeze`,A),r.removeEventListener(`squeezestart`,A),r.removeEventListener(`squeezeend`,A),r.removeEventListener(`end`,j),r.removeEventListener(`inputsourceschange`,ee);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}O=null,k=null,h.reset();for(let e in g)delete g[e];e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ae.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,A),r.addEventListener(`selectstart`,A),r.addEventListener(`selectend`,A),r.addEventListener(`squeeze`,A),r.addEventListener(`squeezestart`,A),r.addEventListener(`squeezeend`,A),r.addEventListener(`end`,j),r.addEventListener(`inputsourceschange`,ee),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?ye:R,a=_.stencil?I:ue);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new en(d.textureWidth,d.textureHeight,{format:ve,type:oe,depthTexture:new _a(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new en(f.framebufferWidth,f.framebufferHeight,{format:ve,type:oe,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ae.setContext(r),ae.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function ee(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let M=new V,N=new V;function P(e,t,n){M.setFromMatrixPosition(t.matrixWorld),N.setFromMatrixPosition(n.matrixWorld);let r=M.distanceTo(N),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function te(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),D.near=T.near=w.near=t,D.far=T.far=w.far=n,(O!==D.near||k!==D.far)&&(r.updateRenderState({depthNear:D.near,depthFar:D.far}),O=D.near,k=D.far),D.layers.mask=e.layers.mask|6,w.layers.mask=D.layers.mask&3,T.layers.mask=D.layers.mask&5;let i=e.parent,a=D.cameras;te(D,i);for(let e=0;e<a.length;e++)te(a[e],i);a.length===2?P(D,w,T):D.projectionMatrix.copy(w.projectionMatrix),ne(e,D,i)};function ne(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=St*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(D)},this.getCameraTexture=function(e){return g[e]};let re=null;function ie(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==D.cameras.length&&(D.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=E[n];o===void 0&&(o=new pi,o.layers.enable(n),o.viewport=new Qt,E[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(D.matrix.copy(o.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),i===!0&&D.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new va,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}re&&re(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ae=new Js;ae.setAnimationLoop(ie),this.setAnimationLoop=function(e){re=e},this.dispose=function(){}}},Gu=new Vn,Ku=new jn;function qu(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,ii(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,Gu.copy(o),Gu.x*=-1,Gu.y*=-1,Gu.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(Gu.y*=-1,Gu.z*=-1),e.envMapRotation.value.setFromMatrix4(Ku.makeRotationFromEuler(Gu)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Ju(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Yu=class{constructor(e={}){let{canvas:t=Pt(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Uint32Array(4),m=new Int32Array(4),h=null,g=null,_=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,b=!1;this._outputColorSpace=dt;let x=0,S=0,C=null,w=-1,T=null,E=new Qt,D=new Qt,O=null,k=new U(0),A=0,j=t.width,ee=t.height,M=1,N=null,P=null,te=new Qt(0,0,j,ee),ne=new Qt(0,0,j,ee),re=!1,ie=new aa,se=!1,ce=!1,F=new jn,le=new V,ue=new Qt,de={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},pe=!1;function me(){return C===null?M:1}let I=n;function he(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,Be,!1),t.addEventListener(`webglcontextrestored`,Ve,!1),t.addEventListener(`webglcontextcreationerror`,He,!1),I===null){let t=`webgl2`;if(I=he(t,e),I===null)throw he(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let ge,_e,L,ve,R,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le;function Re(){ge=new Oc(I),ge.init(),Fe=new Bu(I,ge),_e=new rc(I,ge,e,Fe),L=new Ru(I,ge),_e.reversedDepthBuffer&&d&&L.buffers.depth.setReversed(!0),ve=new jc(I),R=new Su,ye=new zu(I,ge,L,R,_e,Fe,ve),be=new ac(y),xe=new Dc(y),Se=new Ys(I),Ie=new tc(I,Se),Ce=new kc(I,Se,ve,Ie),we=new Nc(I,Ce,Se,ve),Me=new Mc(I,_e,ye),ke=new ic(R),Te=new xu(y,be,xe,ge,_e,Ie,ke),Ee=new qu(y,R),De=new Eu,Oe=new Nu(ge),je=new ec(y,be,xe,L,we,f,s),Ae=new Iu(y,we,_e),Le=new Ju(I,ve,_e,L),Ne=new nc(I,ge,ve),Pe=new Ac(I,ge,ve),ve.programs=Te.programs,y.capabilities=_e,y.extensions=ge,y.properties=R,y.renderLists=De,y.shadowMap=Ae,y.state=L,y.info=ve}Re();let ze=new Wu(y,I);this.xr=ze,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let e=ge.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=ge.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return M},this.setPixelRatio=function(e){e!==void 0&&(M=e,this.setSize(j,ee,!1))},this.getSize=function(e){return e.set(j,ee)},this.setSize=function(e,n,r=!0){if(ze.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}j=e,ee=n,t.width=Math.floor(e*M),t.height=Math.floor(n*M),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(j*M,ee*M).floor()},this.setDrawingBufferSize=function(e,n,r){j=e,ee=n,M=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(E)},this.getViewport=function(e){return e.copy(te)},this.setViewport=function(e,t,n,r){e.isVector4?te.set(e.x,e.y,e.z,e.w):te.set(e,t,n,r),L.viewport(E.copy(te).multiplyScalar(M).round())},this.getScissor=function(e){return e.copy(ne)},this.setScissor=function(e,t,n,r){e.isVector4?ne.set(e.x,e.y,e.z,e.w):ne.set(e,t,n,r),L.scissor(D.copy(ne).multiplyScalar(M).round())},this.getScissorTest=function(){return re},this.setScissorTest=function(e){L.setScissorTest(re=e)},this.setOpaqueSort=function(e){N=e},this.setTransparentSort=function(e){P=e},this.getClearColor=function(e){return e.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor(...arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(C!==null){let t=C.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=C.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=je.getClearColor(),r=je.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(p[0]=i,p[1]=a,p[2]=o,p[3]=r,I.clearBufferuiv(I.COLOR,0,p)):(m[0]=i,m[1]=a,m[2]=o,m[3]=r,I.clearBufferiv(I.COLOR,0,m))}else r|=I.COLOR_BUFFER_BIT}t&&(r|=I.DEPTH_BUFFER_BIT),n&&(r|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Be,!1),t.removeEventListener(`webglcontextrestored`,Ve,!1),t.removeEventListener(`webglcontextcreationerror`,He,!1),je.dispose(),De.dispose(),Oe.dispose(),R.dispose(),be.dispose(),xe.dispose(),we.dispose(),Ie.dispose(),Le.dispose(),Te.dispose(),ze.dispose(),ze.removeEventListener(`sessionstart`,Ye),ze.removeEventListener(`sessionend`,Xe),Ze.stop()};function Be(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),b=!0}function Ve(){console.log(`THREE.WebGLRenderer: Context Restored.`),b=!1;let e=ve.autoReset,t=Ae.enabled,n=Ae.autoUpdate,r=Ae.needsUpdate,i=Ae.type;Re(),ve.autoReset=e,Ae.enabled=t,Ae.autoUpdate=n,Ae.needsUpdate=r,Ae.type=i}function He(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ue(e){let t=e.target;t.removeEventListener(`dispose`,Ue),We(t)}function We(e){Ge(e),R.remove(e)}function Ge(e){let t=R.get(e).programs;t!==void 0&&(t.forEach(function(e){Te.releaseProgram(e)}),e.isShaderMaterial&&Te.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=de);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=ot(e,t,n,r,i);L.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ce.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Ie.setup(i,r,s,n,c);let h,g=Ne;if(c!==null&&(h=Se.get(c),g=Pe,g.setIndex(h)),i.isMesh)r.wireframe===!0?(L.setLineWidth(r.wireframeLinewidth*me()),g.setMode(I.LINES)):g.setMode(I.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),L.setLineWidth(e*me()),i.isLineSegments?g.setMode(I.LINES):i.isLineLoop?g.setMode(I.LINE_LOOP):g.setMode(I.LINE_STRIP)}else i.isPoints?g.setMode(I.POINTS):i.isSprite&&g.setMode(I.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)It(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(ge.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Se.get(c).bytesPerElement:1,o=R.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(I,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ke(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,rt(e,t,n),e.side=0,e.needsUpdate=!0,rt(e,t,n),e.side=2):rt(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),g=Oe.get(n),g.init(t),v.push(g),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),g.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ke(a,n,e),r.add(a)}else Ke(t,n,e),r.add(t)}}),g=v.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){R.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}ge.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let qe=null;function Je(e){qe&&qe(e)}function Ye(){Ze.stop()}function Xe(){Ze.start()}let Ze=new Js;Ze.setAnimationLoop(Je),typeof self<`u`&&Ze.setContext(self),this.setAnimationLoop=function(e){qe=e,ze.setAnimationLoop(e),e===null?Ze.stop():Ze.start()},ze.addEventListener(`sessionstart`,Ye),ze.addEventListener(`sessionend`,Xe),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(b===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),ze.enabled===!0&&ze.isPresenting===!0&&(ze.cameraAutoUpdate===!0&&ze.updateCamera(t),t=ze.getCamera()),e.isScene===!0&&e.onBeforeRender(y,e,t,C),g=Oe.get(e,v.length),g.init(t),v.push(g),F.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ie.setFromProjectionMatrix(F,vt,t.reversedDepth),ce=this.localClippingEnabled,se=ke.init(this.clippingPlanes,ce),h=De.get(e,_.length),h.init(),_.push(h),ze.enabled===!0&&ze.isPresenting===!0){let e=y.xr.getDepthSensingMesh();e!==null&&Qe(e,t,-1/0,y.sortObjects)}Qe(e,t,0,y.sortObjects),h.finish(),y.sortObjects===!0&&h.sort(N,P),pe=ze.enabled===!1||ze.isPresenting===!1||ze.hasDepthSensing()===!1,pe&&je.addToRenderList(h,e),this.info.render.frame++,se===!0&&ke.beginShadows();let n=g.state.shadowsArray;Ae.render(n,e,t),se===!0&&ke.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=h.opaque,i=h.transmissive;if(g.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];et(r,i,e,a)}pe&&je.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];$e(h,e,r,r.viewport)}}else i.length>0&&et(r,i,e,t),pe&&je.render(e),$e(h,e,t);C!==null&&S===0&&(ye.updateMultisampleRenderTarget(C),ye.updateRenderTargetMipmap(C)),e.isScene===!0&&e.onAfterRender(y,e,t),Ie.resetDefaultState(),w=-1,T=null,v.pop(),v.length>0?(g=v[v.length-1],se===!0&&ke.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,_.pop(),h=_.length>0?_[_.length-1]:null};function Qe(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)g.pushLight(e),e.castShadow&&g.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ie.intersectsSprite(e)){r&&ue.setFromMatrixPosition(e.matrixWorld).applyMatrix4(F);let t=we.update(e),i=e.material;i.visible&&h.push(e,t,i,n,ue.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ie.intersectsObject(e))){let t=we.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),ue.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ue.copy(e.boundingSphere.center)),ue.applyMatrix4(e.matrixWorld).applyMatrix4(F)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&h.push(e,t,s,n,ue.z,o)}}else i.visible&&h.push(e,t,i,n,ue.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)Qe(i[e],t,n,r)}function $e(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;g.setupLightsView(n),se===!0&&ke.setGlobalState(y.clippingPlanes,n),r&&L.viewport(E.copy(r)),i.length>0&&tt(i,t,n),a.length>0&&tt(a,t,n),o.length>0&&tt(o,t,n),L.buffers.depth.setTest(!0),L.buffers.depth.setMask(!0),L.buffers.color.setMask(!0),L.setPolygonOffset(!1)}function et(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[r.id]===void 0&&(g.state.transmissionRenderTarget[r.id]=new en(1,1,{generateMipmaps:!0,type:ge.has(`EXT_color_buffer_half_float`)||ge.has(`EXT_color_buffer_float`)?fe:oe,minFilter:ae,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Vt.workingColorSpace}));let a=g.state.transmissionRenderTarget[r.id],o=r.viewport||E;a.setSize(o.z*y.transmissionResolutionScale,o.w*y.transmissionResolutionScale);let s=y.getRenderTarget(),c=y.getActiveCubeFace(),l=y.getActiveMipmapLevel();y.setRenderTarget(a),y.getClearColor(k),A=y.getClearAlpha(),A<1&&y.setClearColor(16777215,.5),y.clear(),pe&&je.render(n);let u=y.toneMapping;y.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),g.setupLightsView(r),se===!0&&ke.setGlobalState(y.clippingPlanes,r),tt(e,n,r),ye.updateMultisampleRenderTarget(a),ye.updateRenderTargetMipmap(a),ge.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,nt(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(ye.updateMultisampleRenderTarget(a),ye.updateRenderTargetMipmap(a))}y.setRenderTarget(s,c,l),y.setClearColor(k,A),d!==void 0&&(r.viewport=d),y.toneMapping=u}function tt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&nt(o,t,n,s,l,c)}}function nt(e,t,n,r,i,a){e.onBeforeRender(y,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(y,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=2):y.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(y,t,n,r,i,a)}function rt(e,t,n){t.isScene!==!0&&(t=de);let r=R.get(e),i=g.state.lights,a=g.state.shadowsArray,o=i.state.version,s=Te.getParameters(e,i.state,a,t,n),c=Te.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?xe:be).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ue),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return at(e,s),u}else s.uniforms=Te.getUniforms(e),e.onBeforeCompile(s,y),u=Te.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=ke.uniform),at(e,s),r.needsLights=ct(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function it(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Bl.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function at(e,t){let n=R.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ot(e,t,n,r,i){t.isScene!==!0&&(t=de),ye.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=C===null?y.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:ft,c=(r.isMeshStandardMaterial?xe:be).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(m=y.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=h===void 0?0:h.length,v=R.get(r),b=g.state.lights;if(se===!0&&(ce===!0||e!==T)){let t=e===T&&r.id===w;ke.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==ke.numPlanes||v.numIntersection!==ke.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=rt(r,t,i));let E=!1,D=!1,O=!1,k=S.getUniforms(),A=v.uniforms;if(L.useProgram(S.program)&&(E=!0,D=!0,O=!0),r.id!==w&&(w=r.id,D=!0),E||T!==e){L.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),k.setValue(I,`projectionMatrix`,e.projectionMatrix),k.setValue(I,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(I,le.setFromMatrixPosition(e.matrixWorld)),_e.logarithmicDepthBuffer&&k.setValue(I,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(I,`isOrthographic`,e.isOrthographicCamera===!0),T!==e&&(T=e,D=!0,O=!0)}if(i.isSkinnedMesh){k.setOptional(I,i,`bindMatrix`),k.setOptional(I,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(I,`boneTexture`,e.boneTexture,ye))}i.isBatchedMesh&&(k.setOptional(I,i,`batchingTexture`),k.setValue(I,`batchingTexture`,i._matricesTexture,ye),k.setOptional(I,i,`batchingIdTexture`),k.setValue(I,`batchingIdTexture`,i._indirectTexture,ye),k.setOptional(I,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(I,`batchingColorTexture`,i._colorsTexture,ye));let j=n.morphAttributes;if((j.position!==void 0||j.normal!==void 0||j.color!==void 0)&&Me.update(i,n,S),(D||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,k.setValue(I,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),D&&(k.setValue(I,`toneMappingExposure`,y.toneMappingExposure),v.needsLights&&st(A,O),a&&r.fog===!0&&Ee.refreshFogUniforms(A,a),Ee.refreshMaterialUniforms(A,r,M,ee,g.state.transmissionRenderTarget[e.id]),Bl.upload(I,it(v),A,ye)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Bl.upload(I,it(v),A,ye),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(I,`center`,i.center),k.setValue(I,`modelViewMatrix`,i.modelViewMatrix),k.setValue(I,`normalMatrix`,i.normalMatrix),k.setValue(I,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Le.update(n,S),Le.bind(n,S)}}return S}function st(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function ct(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return x},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(e,t,n){let r=R.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),R.get(e.texture).__webglTexture=t,R.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=R.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let lt=I.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){C=e,x=t,S=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=R.get(e);if(s.__useDefaultFramebuffer!==void 0)L.bindFramebuffer(I.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)ye.setupRenderTarget(e);else if(s.__hasExternalTextures)ye.rebindTextures(e,R.get(e.texture).__webglTexture,R.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&R.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);ye.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=R.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&ye.useMultisampledRTT(e)===!1?R.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,E.copy(e.viewport),D.copy(e.scissor),O=e.scissorTest}else E.copy(te).multiplyScalar(M).floor(),D.copy(ne).multiplyScalar(M).floor(),O=re;if(n!==0&&(i=lt),L.bindFramebuffer(I.FRAMEBUFFER,i)&&r&&L.drawBuffers(e,i),L.viewport(E),L.scissor(D),L.setScissorTest(O),a){let r=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=R.get(e.textures[t]);I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=R.get(e.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,t.__webglTexture,n)}w=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){L.bindFramebuffer(I.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!_e.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!_e.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s),I.readPixels(t,n,r,i,Fe.convert(c),Fe.convert(l),a))}finally{let e=C===null?null:R.get(C).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=R.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){L.bindFramebuffer(I.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!_e.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!_e.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,d),I.bufferData(I.PIXEL_PACK_BUFFER,a.byteLength,I.STREAM_READ),e.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+s),I.readPixels(t,n,r,i,Fe.convert(l),Fe.convert(u),0);let f=C===null?null:R.get(C).__webglFramebuffer;L.bindFramebuffer(I.FRAMEBUFFER,f);let p=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Lt(I,p,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,d),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,a),I.deleteBuffer(d),I.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;ye.setTexture2D(e,0),I.copyTexSubImage2D(I.TEXTURE_2D,n,0,0,o,s,i,a),L.unbindTexture()};let ut=I.createFramebuffer(),pt=I.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(It(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Fe.convert(t.format),_=Fe.convert(t.type),v;t.isData3DTexture?(ye.setTexture3D(t,0),v=I.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(ye.setTexture2DArray(t,0),v=I.TEXTURE_2D_ARRAY):(ye.setTexture2D(t,0),v=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,t.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,t.unpackAlignment);let y=I.getParameter(I.UNPACK_ROW_LENGTH),b=I.getParameter(I.UNPACK_IMAGE_HEIGHT),x=I.getParameter(I.UNPACK_SKIP_PIXELS),S=I.getParameter(I.UNPACK_SKIP_ROWS),C=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,h.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,h.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,l),I.pixelStorei(I.UNPACK_SKIP_ROWS,u),I.pixelStorei(I.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=R.get(e),r=R.get(t),h=R.get(n.__renderTarget),g=R.get(r.__renderTarget);L.bindFramebuffer(I.READ_FRAMEBUFFER,h.__webglFramebuffer),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(e).__webglTexture,i,d+n),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,R.get(t).__webglTexture,a,m+n)),I.blitFramebuffer(l,u,o,s,f,p,o,s,I.DEPTH_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||R.has(e)){let n=R.get(e),r=R.get(t);L.bindFramebuffer(I.READ_FRAMEBUFFER,ut),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,pt);for(let e=0;e<c;e++)w?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,n.__webglTexture,i),T?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,r.__webglTexture,a),i===0?T?I.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):I.copyTexSubImage2D(v,a,f,p,l,u,o,s):I.blitFramebuffer(l,u,o,s,f,p,o,s,I.COLOR_BUFFER_BIT,I.NEAREST);L.bindFramebuffer(I.READ_FRAMEBUFFER,null),L.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?I.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):I.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):I.texSubImage2D(I.TEXTURE_2D,a,f,p,o,s,g,_,h);I.pixelStorei(I.UNPACK_ROW_LENGTH,y),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,b),I.pixelStorei(I.UNPACK_SKIP_PIXELS,x),I.pixelStorei(I.UNPACK_SKIP_ROWS,S),I.pixelStorei(I.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&I.generateMipmap(v),L.unbindTexture()},this.initRenderTarget=function(e){R.get(e).__webglFramebuffer===void 0&&ye.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?ye.setTextureCube(e,0):e.isData3DTexture?ye.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?ye.setTexture2DArray(e,0):ye.setTexture2D(e,0),L.unbindTexture()},this.resetState=function(){x=0,S=0,C=null,L.reset(),Ie.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return vt}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Vt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Vt._getUnpackColorSpace()}},Xu=null;function Zu(){if(E(`gl`)===`off`)return null;if(Xu)return clearTimeout(Xu.timer),Xu.users++,Xu.renderer;let e=document.createElement(`canvas`),t=null;try{t=e.getContext(`webgl2`,{antialias:!0,alpha:!1,stencil:!1,depth:!0,powerPreference:`high-performance`,preserveDrawingBuffer:D})}catch{t=null}if(!t)return null;try{let n=new Yu({canvas:e,context:t});return n.outputColorSpace=dt,n.toneMapping=0,n.debug.checkShaderErrors=!1,e.style.cssText=`display:block;width:100%;height:100%;touch-action:none;-webkit-tap-highlight-color:transparent;outline:none`,Xu={renderer:n,users:1},n}catch{return null}}function Qu(e){if(!Xu||Xu.renderer!==e||(Xu.users--,Xu.users>0))return;let t=Xu;t.timer=setTimeout(()=>{Xu!==t||t.users>0||(Xu=null,t.renderer.dispose(),t.renderer.forceContextLoss())},6e4)}function $u(e){Xu?.renderer===e&&(Xu=null)}var ed=e();function td({make:e,name:t,qaKey:n,onMode:r,worldRef:i,anchors:a}){let o=(0,T.useRef)(null),s=(0,T.useRef)(null),c=(0,T.useRef)(new Map),l=(0,T.useRef)(r);l.current=r;let u=(0,T.useRef)(null),d=(0,T.useRef)(null);return(0,T.useEffect)(()=>{let r=o.current,a=Zu();if(!a){document.documentElement.dataset.render=`flat`,l.current(`flat`);return}let f;try{f=e(a)}catch(e){console.warn(`${t} could not be built, showing the flat version instead.`,e),Qu(a),l.current(`flat`);return}document.documentElement.dataset.render=`webgl`,i.current=f,f.setAnchorElements(c.current);let p=a.domElement;r.prepend(p);let m=Math.min(window.devicePixelRatio||1,2),h=()=>{let e=r.getBoundingClientRect();a.setPixelRatio(m),a.setSize(e.width,e.height,!1),f.setSize(e.width,e.height,s.current?.offsetHeight??104)};h();let g=new ResizeObserver(h);g.observe(r);let _=0,v=()=>{clearTimeout(_),_=window.setTimeout(h,250)};window.addEventListener(`orientationchange`,v),window.visualViewport?.addEventListener(`resize`,v);let y=[],b=0,x=()=>{},S=!1,C=!1,w=()=>{S||C||(S=!0,x=j((e,t)=>{f.update(t),f.render(),f.placeAnchors(),y.push(t*1e3),y.length>120&&y.shift();let n=[...y].sort((e,t)=>e-t);f.stats.fps=Math.round(1e3/(y.reduce((e,t)=>e+t,0)/y.length)),f.stats.p95=Math.round(n[Math.floor(n.length*.95)]??0),!D&&!f.calm&&(b=t>.02?b+1:Math.max(0,b-2),b>90&&m>1&&(m=Math.max(1,m-.25),b=0,h()))},()=>f.calm))},T=!1,E=a.compileAsync(f.scene,f.rig.camera);E.then(()=>T=!0,()=>T=!0),E.then(w,w);let O=e=>{let t=r.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top}},k=e=>{let t=O(e),n=u.current;f.pointerMove(t.x,t.y,n?.x??t.x,n?.y??t.y,!!n&&n.pointer===e.pointerId)},A=e=>{let t=u.current;if(!t||t.pointer!==e.pointerId)return;u.current=null;let n=O(e);f.pointerUp(),Math.hypot(n.x-t.x,n.y-t.y)<14&&performance.now()-t.t<900&&f.tap(n.x,n.y,t.id)},ee=(e,t)=>{if(e.button>0)return;let n=O(e);u.current={x:n.x,y:n.y,t:performance.now(),pointer:e.pointerId,id:t},f.pointerDown(n.x,n.y,t)},M=e=>ee(e);p.addEventListener(`pointerdown`,M),window.addEventListener(`pointermove`,k),window.addEventListener(`pointerup`,A),window.addEventListener(`pointercancel`,A),d.current=(e,t)=>ee(e.nativeEvent,t);let N=e=>e.preventDefault();r.addEventListener(`gesturestart`,N),r.addEventListener(`gesturechange`,N),r.addEventListener(`dblclick`,N);let P=e=>{e.preventDefault(),x(),$u(a),l.current(`lost`)};return p.addEventListener(`webglcontextlost`,P),window[n]=()=>({mode:`webgl`,...f.qa(),stats:{...f.stats,dpr:m},memory:f.memory()}),()=>{x(),g.disconnect(),clearTimeout(_),window.removeEventListener(`orientationchange`,v),window.visualViewport?.removeEventListener(`resize`,v),p.removeEventListener(`pointerdown`,M),window.removeEventListener(`pointermove`,k),window.removeEventListener(`pointerup`,A),window.removeEventListener(`pointercancel`,A),p.removeEventListener(`webglcontextlost`,P),r.removeEventListener(`gesturestart`,N),r.removeEventListener(`gesturechange`,N),r.removeEventListener(`dblclick`,N),d.current=null,window[n]&&delete window[n],C=!0;let e=()=>f.dispose();T?e():E.then(e,e),i.current=null,p.remove(),Qu(a)}},[]),(0,ed.jsxs)(`div`,{ref:o,style:{position:`absolute`,inset:0,isolation:`isolate`,touchAction:`none`,userSelect:`none`,WebkitUserSelect:`none`},children:[(0,ed.jsx)(`div`,{ref:s,style:{position:`absolute`,left:0,top:0,width:0,height:`var(--top-clear)`,pointerEvents:`none`}}),a({onDown:(e,t)=>d.current?.(e,t),onKey:e=>i.current?.tap(0,0,e),onHover:e=>i.current?.hoverAnchor?.(e)},c.current)]})}var nd={ambient:.6,sun:.4,bands:[[.42,.36,.78],[.42,.36,.78],[.8,.77,.93],[1,1,1]],outline:1,insideYawWide:30,insideYawTall:16,insidePitch:50,insideFitW:5.65,insideFitD:4.6,streetYaw:8,streetPitch:18,fov:30,walkSpeed:1.8,stepsPerSecond:3.2,hop:.07},rd=new V;function id(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;rd.copy(t),rd[r]=0,rd.normalize();let l=.5*o/(o+s),u=1-rd.angleTo(e)/c;return Math.sign(rd[n])===1?u*l:s/(o+s)+l+l*(1-u)}var ad=class e extends ei{constructor(e=1,t=1,n=1,r=2,i=.1){let a=r*2+1;if(i=Math.min(e/2,t/2,n/2,i),super(1,1,1,a,a,a),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:n,segments:r,radius:i},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let s=new V,c=new V,l=new V(e,t,n).divideScalar(2).subScalar(i),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new V,h=.5/a;for(let r=0,a=0;r<u.length;r+=3,a+=2)switch(s.fromArray(u,r),c.copy(s),c.x-=Math.sign(c.x)*h,c.y-=Math.sign(c.y)*h,c.z-=Math.sign(c.z)*h,c.normalize(),u[r+0]=l.x*Math.sign(s.x)+c.x*i,u[r+1]=l.y*Math.sign(s.y)+c.y*i,u[r+2]=l.z*Math.sign(s.z)+c.z*i,d[r+0]=c.x,d[r+1]=c.y,d[r+2]=c.z,Math.floor(r/p)){case 0:m.set(1,0,0),f[a+0]=id(m,c,`z`,`y`,i,n),f[a+1]=1-id(m,c,`y`,`z`,i,t);break;case 1:m.set(-1,0,0),f[a+0]=1-id(m,c,`z`,`y`,i,n),f[a+1]=1-id(m,c,`y`,`z`,i,t);break;case 2:m.set(0,1,0),f[a+0]=1-id(m,c,`x`,`z`,i,e),f[a+1]=id(m,c,`z`,`x`,i,n);break;case 3:m.set(0,-1,0),f[a+0]=1-id(m,c,`x`,`z`,i,e),f[a+1]=1-id(m,c,`z`,`x`,i,n);break;case 4:m.set(0,0,1),f[a+0]=1-id(m,c,`x`,`y`,i,e),f[a+1]=1-id(m,c,`y`,`x`,i,t);break;case 5:m.set(0,0,-1),f[a+0]=id(m,c,`x`,`y`,i,e),f[a+1]=1-id(m,c,`y`,`x`,i,t)}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}};function od(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Br,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=sd(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=sd(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function sd(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new Ar(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function cd(e,t=1e-4){t=Math.max(t,2**-52);let n={},r=e.getIndex(),i=e.getAttribute(`position`),a=r?r.count:i.count,o=0,s=Object.keys(e.attributes),c={},l={},u=[],d=[`getX`,`getY`,`getZ`,`getW`],f=[`setX`,`setY`,`setZ`,`setW`];for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.attributes[n];c[n]=new r.constructor(new r.array.constructor(r.count*r.itemSize),r.itemSize,r.normalized);let i=e.morphAttributes[n];i&&(l[n]||(l[n]=[]),i.forEach((e,t)=>{let r=new e.array.constructor(e.count*e.itemSize);l[n][t]=new e.constructor(r,e.itemSize,e.normalized)}))}let p=t*.5,m=10**Math.log10(1/t),h=p*m;for(let t=0;t<a;t++){let i=r?r.getX(t):t,a=``;for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),o=r.itemSize;for(let e=0;e<o;e++)a+=`${~~(r[d[e]](i)*m+h)},`}if(a in n)u.push(n[a]);else{for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),a=e.morphAttributes[n],u=r.itemSize,p=c[n],m=l[n];for(let e=0;e<u;e++){let t=d[e],n=f[e];if(p[n](o,r[t](i)),a)for(let e=0,r=a.length;e<r;e++)m[e][n](o,a[e][t](i))}}n[a]=o,u.push(o),o++}}let g=e.clone();for(let t in e.attributes){let e=c[t];if(g.setAttribute(t,new e.constructor(e.array.slice(0,o*e.itemSize),e.itemSize,e.normalized)),t in l)for(let e=0;e<l[t].length;e++){let n=l[t][e];g.morphAttributes[t][e]=new n.constructor(n.array.slice(0,o*n.itemSize),n.itemSize,n.normalized)}}return g.setIndex(u),g}var Y={pink:`#FF8FB8`,hotpink:`#FF4F9A`,lavender:`#D9CCFF`,lavenderDark:`#B9A6F5`,butter:`#FBEA9A`,mint:`#8FE3C8`,sky:`#A8DCFF`,peach:`#FFC2A8`,cream:`#FFF7F0`,gold:`#FFC83D`,ink:`#2B2330`},ld=null;function ud(){return ld||(ld=new Hi(new Uint8Array(nd.bands.length*4),nd.bands.length,1,ve),ld.minFilter=ld.magFilter=P,ld.generateMipmaps=!1,dd()),ld}function dd(){if(!ld)return;let e=ld.image.data;nd.bands.forEach((t,n)=>t.forEach((t,r)=>e[n*4+r]=Math.round(t*255))),nd.bands.forEach((t,n)=>e[n*4+3]=255),ld.needsUpdate=!0}var fd=new Map;function pd(e=`#ffffff`,t=!1){let n=`${new U(e).getHexString()}|${t}`,r=fd.get(n);return r||(r=new Zo({color:e,vertexColors:t,gradientMap:ud()}),fd.set(n,r)),r}function md(e){let t=new Os(`#FFF7F0`,nd.ambient*Math.PI),n=new Ds(`#FFF7F0`,nd.sun*Math.PI);return n.position.set(5,10,7),e.add(t,n,n.target),{ambient:t,sun:n,follow(e,r,i){n.target.position.set(e,r,i),n.position.set(e+5,r+10,i+7),t.intensity=nd.ambient*Math.PI,n.intensity=nd.sun*Math.PI}}}var hd={uRes:{value:[1,1]},uScale:{value:1},...ai.clone(J.fog)};function gd(e,t){hd.uRes.value=[Math.max(1,e),Math.max(1,t)],hd.uScale.value=nd.outline}var _d=`
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
`,vd=`
  #include <fog_pars_fragment>
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <fog_fragment>
  }
`,yd=new Map;function bd(e,t=Y.ink){let n=`${e}|${t}`,r=yd.get(n);return r||(r=new ci({uniforms:{...hd,uPx:{value:e},uColor:{value:new U(t)}},vertexShader:_d,fragmentShader:vd,side:1,fog:!0}),yd.set(n,r)),r}function xd(e){let t=e.clone();for(let e of Object.keys(t.attributes))e!==`position`&&t.deleteAttribute(e);let n=cd(t,.001);return t.dispose(),n.computeVertexNormals(),n}function Sd(e,t){let n=new G(xd(e),bd(t));return n.userData.hull=t,n}function Cd(e,t){let n=e.userData.hull;n!==void 0&&(e.material=bd(n,t?Y.hotpink:Y.ink))}var wd=new U;function Td(e,t,n={}){let r=e.index?e.toNonIndexed():e;r!==e&&e.dispose();for(let e of Object.keys(r.attributes))e!==`position`&&e!==`normal`&&r.deleteAttribute(e);let i=new jn().compose(new V(...n.at??[0,0,0]),new Ot().setFromEuler(new Vn(...n.rot??[0,0,0])),new V(...n.scale??[1,1,1]));r.applyMatrix4(i),wd.set(t);let a=r.attributes.position.count,o=new Float32Array(a*3);for(let e=0;e<a;e++)o.set([wd.r,wd.g,wd.b],e*3);return r.setAttribute(`color`,new Ar(o,3)),r}var X={box:(e,t,n,r,i)=>Td(new ei(e,t,n),r,i),rbox:(e,t,n,r,i,a)=>Td(new ad(e,t,n,2,Math.min(r,e/2,t/2,n/2)*.999),i,a),cyl:(e,t,n,r,i,a=16)=>Td(new xa(e,t,n,a),r,i),cone:(e,t,n,r,i=16)=>Td(new Sa(e,t,i),n,r),sphere:(e,t,n,r=18)=>Td(new Jo(e,r,Math.round(r*.7)),t,n),capsule:(e,t,n,r)=>Td(new ya(e,t,5,14),n,r),torus:(e,t,n,r,i=Math.PI*2)=>Td(new Yo(e,t,8,24,i),n,r),prism:(e,t,n,r)=>Td(new Ro(new $a(e.map(([e,t])=>new B(e,t))),{depth:t,bevelEnabled:!1}).translate(0,0,-t/2),n,r)};function Z(e){let t=od(e,!1);for(let t of e)t.dispose();if(!t)throw Error(`merge: parts have different attributes`);return t}function Q(e,t,n=2){let r=new K,i=new G(t.add(e),pd(`#ffffff`,!0));if(r.add(i),n>0){let i=Sd(e,n);t.add(i.geometry),r.add(i)}return r}function Ed(e,t,n,r=2){let i=new K,a=od([...e,...t],!1),o=r>0&&e.length?od(e,!1):null;for(let n of[...e,...t])n.dispose();if(!a)throw Error(`solidMix: parts have different attributes`);if(i.add(new G(n.add(a),pd(`#ffffff`,!0))),o){let e=Sd(o,r);o.dispose(),n.add(e.geometry),i.add(e)}return i}var Dd=null;function Od(e,t){if(!Dd){let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);n.addColorStop(0,`rgba(43,35,48,0.34)`),n.addColorStop(.62,`rgba(43,35,48,0.2)`),n.addColorStop(1,`rgba(43,35,48,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),Dd=new ga(e)}let n=new G(t.add(new Wo(e*2,e*2)),Ad());return n.rotation.x=-Math.PI/2,n.position.y=.012,n.renderOrder=1,n}var kd=null,Ad=()=>kd??=new Er({map:Dd,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4}),jd=[`sunhat`,`spare-hat`,`sunglasses`,`floaties`,`scrubs`,`scrub-cap`,`apron`,`chef-hat`,`smock`,`gloves`,`mongkhon`],Md={species:`fox`,fur:`#FF9A4D`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`},Nd={species:`buffalo`,fur:`#94A0C8`,light:`#DCD8EE`,dark:`#4C4F6B`,ear:`#FFB8CC`},Pd={species:`penguin`,fur:`#3F365F`,light:`#FFF6EC`,dark:`#FFA640`},Fd={kaylee:{species:`unicorn`,height:1,fur:`#CDB9F6`,light:`#F4EDFF`,dark:`#A88EE8`,ear:`#FFB3D1`,mane:[`#FF6FAE`,`#FBE27A`,`#8FE3C8`,`#8EC9F5`],hair:`medium`,outfit:{kind:`dress`,color:`#FF5FA2`},lashes:!0},ji:{species:`unicorn`,height:1.55,chub:1.15,fur:`#FFF5EF`,light:`#FFE8E0`,dark:`#BBA3F2`,ear:`#FFC9D6`,mane:[`#C7A6F2`,`#FF9CC8`,`#B494EE`,`#FFB8D8`],hair:`long`,outfit:{kind:`dress`,color:`#FFB79E`},lashes:!0},nick:{species:`unicorn`,height:1.7,fur:`#A9EBD6`,light:`#E2FAF1`,dark:`#9C86DA`,ear:`#FFB3C7`,mane:[`#8EC9F5`,`#B9A6F5`],hair:`short`,outfit:{kind:`polo`,color:`#FBE78A`},open:!0},agong:{species:`panda`,height:1.45,fur:`#FFF6EE`,light:`#FFFDF8`,dark:`#4A3F4F`,ear:`#FFB3C7`,outfit:{kind:`shirt`,color:`#FFF0DA`},extras:[`glasses`,`moustache`,`cane`]},jum:{species:`elephant`,height:1.5,chub:1.25,fur:`#FFB3CF`,light:`#FFE3EE`,dark:`#F28CB3`,ear:`#FF94BC`,outfit:{kind:`blouse`,color:`#A7EBD0`},lashes:!0},joy:{...Md,height:1.5,outfit:{kind:`blouse`,color:`#FFF7F3`,lace:`#FF9CC0`},hairdo:{style:`bob`,color:`#7A4636`},smile:`teeth`,cheeks:.8,lashes:!0},gan:{...Md,height:1.32,outfit:{kind:`tee`,color:`#8FC9F5`,shorts:`#5D7BB0`},extras:[`cap`,`phone`]},ken:{...Md,height:1.25,outfit:{kind:`tee`,color:`#8FE3C8`},extras:[`round-glasses`,`phone`]},bird:{...Nd,height:1.65,outfit:{kind:`shirt`,color:`#3A3346`,print:[`#FF8A3D`,`#FF5A6E`,`#FFC845`]},hairdo:{style:`spiky`,color:`#2F2A3A`}},bb:{...Nd,height:1.2,outfit:{kind:`dress`,color:`#FF8FB8`},extras:[`pigtails`,`phone`],lashes:!0},ja:{...Pd,height:1.45,extras:[`scarf`],lashes:!0,open:!0},putto:{...Pd,height:1,outfit:{kind:`tee`,color:`#8FE3C8`},extras:[`tuft`],open:!0},putter:{...Pd,height:.78,fur:`#B9B4D6`,extras:[`bib`]},sri:{species:`hornbill`,height:1.5,fur:`#4A3F4F`,light:`#FFF1DC`,dark:`#FFB43C`,outfit:{kind:`blouse`,color:`#C9B5F7`},lashes:!0}},Id={puppy:{species:`puppy`,height:.9,chub:1.1,fur:`#F4C47E`,light:`#FFF1DC`,dark:`#4A3640`,ear:`#D99A55`,open:!0},pony:{species:`pony`,height:.98,fur:`#E9B486`,light:`#FFF0E0`,dark:`#8A5A4A`,ear:`#FFC2C8`,mane:[`#9A5E4E`,`#B87A62`],hair:`medium`,lashes:!0},elephant:{species:`elephant`,height:.92,chub:1.25,fur:`#B9B3D6`,light:`#E4E0F2`,dark:`#9C95C4`,ear:`#FFB8CC`,lashes:!0}},Ld={species:`monkey`,height:1.15,fur:`#C08A5E`,light:`#FFE6CC`,dark:`#7A5340`,ear:`#FFC2B0`,outfit:{kind:`tee`,color:`#C08A5E`,shorts:`#3E6FD8`},extras:[`mongkhon`,`gloves`],open:!0},Rd=`#2E2233`,zd=`#FF9DB8`,Bd=`#7A2745`,Vd=`#FF8FA8`,Hd=`#FFFFFF`,Ud=(e,t,n,r,i)=>X.cyl(e,t,n,r,i,20);function Wd(e){let t=e.height,n=e.species===`penguin`,r=e.species===`hornbill`,i=(n?.27:e.species===`panda`||e.species===`elephant`?.26:r?.22:e.species===`puppy`?.25:.24)*t,a=e.chub??1,o=n?.2*t:i*.92;return{H:t,R:i,headY:o,shoulder:n?[.3*t,.5*t,0]:[.155*t*a,.47*t,0],eyeX:e.species===`unicorn`||e.species===`pony`?.37*i:r?.46*i:.36*i,eyeY:e.species===`unicorn`||e.species===`pony`?.12*i:n?.02*i:r?.14*i:.05*i,eyeSize:.21*i,lift:n?.12*i:e.species===`monkey`?.07*i:0,on:(e,t,n=0)=>[e,o+t,Math.sqrt(Math.max(0,i*i-e*e-t*t))+n],turnTo:e=>[0,Math.asin(Math.max(-1,Math.min(1,e/i))),0]}}var Gd=e=>jd.includes(e),Kd=`#7FB2F0`,qd=`#5D8FD6`;function Jd(e,t,n){let{H:r,R:i,headY:a,eyeX:o,eyeY:s,on:c,turnTo:l}=t,u={head:[],headPlain:[],armL:[],armR:[],body:[],bodyPlain:[]};if(e===`sunhat`||e===`spare-hat`){let t=e===`sunhat`,n=t?`#FBEA9A`:`#FFC2A8`,r=t?`#FF4F9A`:`#B9A6F5`,o=-.16*i,s=a+.64*i;u.head.push(X.cyl(1.24*i,1.28*i,.07*i,n,{at:[0,s,o+.1*i]},32),X.torus(1.26*i,.07*i,n,{at:[0,s+.04*i,o+.1*i],rot:[Math.PI/2,0,0]}),X.cyl(.6*i,.66*i,.26*i,n,{at:[0,s+.15*i,o]},24),X.sphere(.6*i,n,{at:[0,s+.27*i,o],scale:[1,.42,1]},24),X.cyl(.675*i,.69*i,.14*i,r,{at:[0,s+.1*i,o]},24));let c=[.46*i,s+.12*i,o+.5*i];if(t){for(let e of[-1,1])u.head.push(X.sphere(.13*i,r,{at:[c[0]+e*.13*i,c[1],c[2]],rot:[0,.75,e*.5],scale:[1.2,.75,.45]}));u.head.push(X.sphere(.06*i,r,{at:c}))}else{for(let e=0;e<5;e++){let t=e/5*Math.PI*2;u.head.push(X.sphere(.07*i,`#FFFFFF`,{at:[c[0]+Math.cos(t)*.08*i,c[1]+Math.sin(t)*.08*i,c[2]],rot:[0,.75,0],scale:[1,1,.4]}))}u.headPlain.push(X.sphere(.055*i,`#FFC83D`,{at:[c[0],c[1],c[2]+.02*i]}))}}if(e===`sunglasses`){let e=t.lift+.13*i,n=(t,n,r,a,o)=>{let u=l(t);for(let l of[-1,1])o.push(X.sphere(.12*i*n,r,{at:c(t+l*.085*i*n,s+.04*i,e+a),rot:u,scale:[1,1,.3]},14));o.push(X.cone(.19*i*n,.22*i*n,r,{at:c(t,s-.1*i*n,e+a),rot:[Math.PI,u[1],0],scale:[1,1,.3]},14))};for(let t of[-1,1]){let r=t*o;n(r,1.22,`#FF4F9A`,0,u.head),n(r,.9,`#5A3F66`,.012*i,u.head),u.headPlain.push(X.sphere(.05*i,`#FFFFFF`,{at:c(r-t*.07*i,s+.08*i,e+.05*i),rot:l(r),scale:[1,.7,.3]})),u.headPlain.push(X.sphere(.022*i,`#FFFFFF`,{at:c(r+t*.05*i,s-.04*i,e+.05*i),rot:l(r),scale:[1,1,.3]}))}u.head.push(X.capsule(.035*i,o*2-.5*i,`#FF4F9A`,{at:c(0,s+.07*i,e+.02*i),rot:[0,0,Math.PI/2]}))}if(e===`scrubs`){u.body.push(X.capsule(.172*r,.06*r,Kd,{at:[0,.37*r,0]})),u.body.push(X.cyl(.168*r,.248*r,.18*r,Kd,{at:[0,.232*r,0]},20));for(let e of[-1,1])u.body.push(X.capsule(.078*r,.05*r,qd,{at:[e*.085*r,.115*r,0]}));u.body.push(X.rbox(.07*r,.06*r,.012*r,.008*r,qd,{at:[.075*r,.42*r,.165*r],rot:[0,.4,0]})),u.body.push(X.cyl(.008*r,.008*r,.06*r,`#FF4F9A`,{at:[.06*r,.46*r,.168*r],rot:[0,0,.15]}));for(let e of[-1,1])u.bodyPlain.push(X.box(.012*r,.08*r,.01*r,`#FFFFFF`,{at:[e*.022*r,.505*r,.152*r],rot:[-.35,0,e*.5]}));for(let[e,t]of[[`armL`,-1],[`armR`,1]])u[e].push(X.sphere(.074*r,Kd,{at:[t*.006*r,-.02*r,0]}))}if(e===`scrub-cap`){let e=-.12*i;u.head.push(X.sphere(1*i,Kd,{at:[0,a+.4*i,e],scale:[1.07,.7,1.05]},24)),u.head.push(X.torus(.98*i,.07*i,qd,{at:[0,a+.42*i,e],rot:[Math.PI/2+.12,0,0],scale:[1.08,1.05,1]}));for(let[e,t]of[[-.5,.86],[.1,1.02],[.6,.82],[-.15,.7]])u.headPlain.push(X.sphere(.07*i,`#FF8FB8`,{at:c(e*i,(t-.45)*i+.4*i,.08*i),scale:[1,1,.4]}))}if(e===`apron`){u.body.push(X.rbox(.2*r,.15*r,.03*r,.03*r,`#FF8FB8`,{at:[0,.4*r,.15*r],rot:[-.12,0,0]})),u.body.push(X.cyl(.2*r,.26*r,.2*r,`#FF8FB8`,{at:[0,.22*r,.012*r],scale:[1,1,.9]},20)),u.body.push(X.torus(.19*r,.016*r,`#FFFFFF`,{at:[0,.32*r,0],rot:[Math.PI/2,0,0]}));for(let e of[-1,1])u.body.push(X.capsule(.012*r,.1*r,`#FFFFFF`,{at:[e*.075*r,.5*r,.1*r],rot:[-.6,0,-e*.5]}));u.bodyPlain.push(X.rbox(.09*r,.06*r,.012*r,.012*r,`#FFFFFF`,{at:[0,.2*r,.235*r],rot:[-.3,0,0]}))}if(e===`smock`){u.body.push(X.capsule(.175*r,.06*r,`#C9B5F7`,{at:[0,.37*r,0]})),u.body.push(X.cyl(.17*r,.25*r,.2*r,`#C9B5F7`,{at:[0,.225*r,0]},20)),u.bodyPlain.push(...[.44,.36,.28].map(e=>X.sphere(.014*r,`#FFFFFF`,{at:[.07*r,e*r,.17*r]}))),u.body.push(X.rbox(.07*r,.06*r,.012*r,.008*r,`#B39CEB`,{at:[-.075*r,.42*r,.165*r],rot:[0,-.4,0]})),u.body.push(X.box(.05*r,.03*r,.008*r,`#FF8FB8`,{at:[-.075*r,.465*r,.168*r],rot:[0,-.4,0]}));for(let[e,t]of[[`armL`,-1],[`armR`,1]])u[e].push(X.sphere(.074*r,`#C9B5F7`,{at:[t*.006*r,-.02*r,0]}))}if(e===`chef-hat`){let e=-.32*i;u.head.push(X.cyl(.62*i,.66*i,.4*i,`#FFFFFF`,{at:[0,a+.98*i,e],rot:[-.25,0,0]},24));for(let[t,n]of[[0,0],[-.32,-.1],[.32,-.1],[0,-.3],[-.18,.2],[.18,.2]])u.head.push(X.sphere(.4*i,`#FFFFFF`,{at:[t*i,a+1.32*i,e+(n-.12)*i]},16));u.head.push(X.torus(.65*i,.06*i,`#FFD6E6`,{at:[0,a+.8*i,e+.04*i],rot:[Math.PI/2-.25,0,0]}))}if(e===`gloves`){let e=n.species===`unicorn`?`#FF4F9A`:`#E8403F`;for(let[t,n]of[[`armL`,-1],[`armR`,1]])u[t].push(X.sphere(.082*r,e,{at:[n*.054*r,-.158*r,.012*r],scale:[1,1.08,1.12]})),u[t].push(X.sphere(.034*r,e,{at:[n*.012*r,-.15*r,.06*r],scale:[.9,1.4,.9]})),u[t].push(X.cyl(.058*r,.062*r,.04*r,`#FFFFFF`,{at:[n*.036*r,-.098*r,.004*r],rot:[0,0,n*.35]}))}if(e===`mongkhon`&&(u.head.push(X.torus(.985*i,.085*i,`#E8403F`,{at:[0,a+.3*i,-.02*i],rot:[Math.PI/2-.2,0,0],scale:[1.04,1,1]})),u.head.push(X.capsule(.07*i,.4*i,`#E8403F`,{at:[.08*i,a+.02*i,-1.08*i],rot:[-.55,0,.25]})),u.headPlain.push(X.sphere(.07*i,`#FFC83D`,{at:c(0,.48*i,.07*i)}))),e===`floaties`)for(let[e,t,n]of[[`armL`,-1,`#FF7FA8`],[`armR`,1,`#FF9F45`]]){let i=.058*r,a=.038*r,o=[t*Math.sin(.35),-Math.cos(.35),0],s=[t*.026*r,-.072*r,0],c=e=>[s[0]-o[0]*e,s[1]-o[1]*e,s[2]],l=[Math.PI/2,t*.35,0];u[e].push(X.torus(i,a,n,{at:s,rot:l})),u[e].push(X.torus(i+a*.5,a*.32,`#FFF7F0`,{at:c(a*.82),rot:l})),u[e].push(X.cyl(.012*r,.012*r,.03*r,`#FFF7F0`,{at:[s[0]+t*(i+a*.9),s[1],s[2]+.01*r],rot:[0,0,t*(Math.PI/2-.35)]}))}return u}function Yd(e,t,n){let r=Jd(t,Wd(e),e),i=e.height>=1?3:2.5,a=(e,t)=>e.length||t.length?Ed(e,t,n,i):null;return{head:a(r.head,r.headPlain),armL:a(r.armL,[]),armR:a(r.armR,[]),body:a(r.body,r.bodyPlain)}}var Xd=class{goal=0;k=0;update(e,t,n){this.k+=(this.goal-this.k)*(1-Math.exp(-t*4));let r=this.k;e.mane&&(e.mane.rotation.x=r*(.62+Math.sin(n*13)*.08+Math.sin(n*5.3)*.06),e.mane.rotation.z=r*Math.sin(n*9.1)*.05,e.tail&&(e.tail.rotation.x=r*(.75+Math.sin(n*11+1)*.12),e.tail.rotation.y=r*Math.sin(n*7)*.12))}};function Zd(e,t){let n=Wd(e),{H:r,R:i,headY:a,shoulder:o,eyeX:s,eyeY:c,eyeSize:l,lift:u,on:d,turnTo:f}=n,p=r>=1?3:2.5,m=e.species===`penguin`,h=e.species===`hornbill`,g=[],_=[],v=[],y=[],b=[],x=[],S=[],C=[],w=[0,0,0],T={L:[],R:[]},E=[],D=[0,0,0],O=[],k=[],A=e.chub??1,j=[A,1,1+(A-1)*.8],ee=.52*r;if(m){g.push(X.sphere(.31*r,e.fur,{at:[0,.33*r,0],scale:[1,1.02,.95]},24)),g.push(X.sphere(.25*r,e.light,{at:[0,.3*r,.12*r],scale:[1,1.08,.66]},20));for(let t of[-1,1])g.push(X.sphere(.09*r,e.dark,{at:[t*.11*r,.025*r,.13*r],scale:[1,.42,1.45]}))}else if(h){g.push(X.sphere(.17*r,e.fur,{at:[0,.36*r,0],scale:[1,1.2,1]},20)),g.push(X.sphere(.13*r,e.light,{at:[0,.3*r,.07*r],scale:[1,1.15,.7]}));for(let t of[-1,1]){let n=t*.07*r;g.push(X.capsule(.025*r,.12*r,e.fur,{at:[n,.1*r,0]}));for(let t of[-.5,0,.5])g.push(X.capsule(.017*r,.06*r,e.fur,{at:[n+Math.sin(t)*.04*r,.015*r,Math.cos(t)*.04*r],rot:[Math.PI/2,t,0]}))}}else{let t=e.species===`panda`?e.dark:e.fur,n=e.species===`unicorn`||e.species===`buffalo`||e.species===`panda`||e.species===`pony`?e.dark:e.light,i=.085*r*(1+(A-1)*.7),a=.07*r*(1+(A-1)*.6);for(let e of[-1,1])g.push(X.capsule(a,.06*r,t,{at:[e*i,.1*r,0]})),g.push(X.sphere(.075*r*(1+(A-1)*.6),n,{at:[e*i,.035*r,.02*r],scale:[1,.6,1.3]}));g.push(X.capsule(.155*r,.1*r,e.fur,{at:[0,.34*r,0],scale:j})),(e.species===`fox`||e.species===`puppy`)&&!e.outfit?.lace&&g.push(X.sphere(.075*r,e.light,{at:[0,.5*r,.11*r*j[2]],scale:[1.1,.8,.7]})),e.species===`buffalo`&&!e.outfit&&g.push(X.sphere(.11*r,e.light,{at:[0,.27*r,.1*r],scale:[1,1.1,.55]}))}let M=e.outfit;if(M){if(m)g.push(Ud(.3*r,.335*r,.18*r,M.color,{at:[0,.43*r,0]}));else{let e=M.kind===`shirt`;if(g.push(X.capsule(.163*r,(e?.1:.06)*r,M.color,{at:[0,(e?.35:.37)*r,0],scale:j})),M.kind===`dress`&&g.push(Ud(.15*r,.235*r,.17*r,M.color,{at:[0,.235*r,0],scale:j})),M.shorts&&g.push(Ud(.16*r,.168*r,.09*r,M.shorts,{at:[0,.205*r,0],scale:j})),M.kind===`polo`){for(let e of[-1,1])g.push(X.box(.08*r,.012*r,.06*r,M.color,{at:[e*.045*r,.535*r,.1*r],rot:[.5,0,e*-.4]}));_.push(...[.47,.42].map(e=>X.sphere(.009*r,Hd,{at:[0,e*r,.162*r*j[2]]})))}if(M.kind===`blouse`&&M.lace){for(let e=0;e<9;e++){let t=-1.25+e/8*2.5;g.push(X.sphere(.032*r,M.lace,{at:[Math.sin(t)*.15*r*j[0],(.478+Math.abs(t)*.022)*r,Math.cos(t)*.15*r*j[2]],rot:[-.5,t,0],scale:[1,.85,.4]}))}_.push(...[-.06,-.03,0,.03,.06].map(e=>X.capsule(.0035*r,.1*r,`#EADDE6`,{at:[e*r,.41*r,Math.sqrt(.164**2-e*e)*r*j[2]],rot:[0,Math.asin(e/.164),0]})))}else M.kind===`blouse`&&(g.push(X.torus(.075*r,.016*r,`#FFFFFF`,{at:[0,.525*r,.04*r*j[2]],rot:[Math.PI/2-.35,0,0]})),_.push(...[.46,.4].map(e=>X.sphere(.009*r,`#FFE7A8`,{at:[0,e*r,.163*r*j[2]]}))));if(M.kind===`shirt`&&M.print){for(let e of[-1,1])g.push(X.box(.085*r,.012*r,.07*r,M.color,{at:[e*.05*r,.53*r,.1*r],rot:[.55,0,e*-.45]}));_.push(...[.44,.37,.3].map(e=>X.sphere(.009*r,Hd,{at:[0,e*r,.165*r*j[2]]})));let e=.165*r;[[-.6,.47],[.62,.46],[-.2,.38],[.3,.33],[1.05,.38],[-1.1,.36],[-.55,.28],[.75,.26],[1.6,.46],[-1.7,.44],[2.3,.36],[-2.4,.33],[3.1,.42],[2.8,.27],[-2.9,.26]].forEach(([t,n],i)=>{Qd(_,[Math.sin(t)*e*j[0],n*r,Math.cos(t)*e*j[2]],[0,t,0],.032*r,M.print[i%M.print.length],i)})}else M.kind===`shirt`&&(_.push(...[.47,.4,.33,.26].map(e=>X.sphere(.011*r,`#E8B85C`,{at:[0,e*r,.164*r*j[2]]}))),g.push(X.box(.06*r,.06*r,.01*r,M.color,{at:[.07*r,.44*r,.15*r],rot:[0,.45,0]})))}}for(let[t,n]of[[`L`,-1],[`R`,1]]){let i=T[t];if(m)i.push(X.capsule(.07*r,.14*r,e.fur,{at:[n*.015*r,-.12*r,0],rot:[0,0,n*.3],scale:[.45,1,1]})),M&&i.push(X.sphere(.06*r,M.color,{at:[n*0,-.02*r,0],scale:[.8,1,1]}));else if(h)i.push(X.sphere(.08*r,e.fur,{at:[n*.02*r,-.09*r,0],rot:[0,0,n*.3],scale:[.5,1.35,.95]})),i.push(X.sphere(.04*r,e.light,{at:[n*.05*r,-.18*r,.02*r],scale:[.6,1,.9]})),M&&i.push(X.sphere(.06*r,M.color,{at:[0,-.01*r,0]}));else{let a=e.species===`panda`?e.dark:e.fur,o=e.species===`unicorn`||e.species===`buffalo`||e.species===`panda`||e.species===`pony`?e.dark:e.species===`fox`||e.species===`puppy`||e.species===`monkey`?e.light:e.fur;i.push(X.capsule(.052*r,.09*r,a,{at:[n*.025*r,-.075*r,0],rot:[0,0,n*.35]})),i.push(X.sphere(.054*r,o,{at:[n*.05*r,-.14*r,.005*r]})),M&&i.push(X.sphere(.068*r,M.color,{at:[n*.004*r,-.015*r,0]})),M?.print&&Qd(i,[n*.035*r,-.01*r,.058*r],[0,n*.55,0],.024*r,M.print[+(t===`L`)],0)}}for(let t of[-1,1]){let n=t*s;if(b.push(X.sphere(l,Rd,{at:d(n,c,u-.03*i),rot:f(n),scale:[.78,1,.42]})),x.push(X.sphere(l*.3,Hd,{at:d(n+t*.05*i,c+.08*i,u+.035*i)})),x.push(X.sphere(l*.14,Hd,{at:d(n-t*.05*i,c-.07*i,u+.035*i)})),e.lashes)for(let e of[0,1])x.push(X.capsule(.012*i,.07*i,Rd,{at:d(n+t*(.16+e*.05)*i,c+(.17-e*.07)*i,u+.01*i),rot:[0,0,t*(-.9-e*.5)]}));let r=e.species===`unicorn`||e.species===`pony`?-.08*i:-.2*i;y.push(X.sphere(.12*i,zd,{at:d(t*.58*i,r,u*.6-.02*i),rot:f(t*.58*i),scale:[1.25,.65,.3]}))}let N=(e,t)=>t===void 0?d(0,e,.005*i):[0,a+e,t],P=t=>{w=t,e.smile===`teeth`?(S.push(X.sphere(.2*i,Bd,{at:[0,-.02*i,-.1*i],scale:[1.2,.6,.7]},20)),S.push(X.sphere(.17*i,Hd,{at:[0,.035*i,-.07*i],scale:[1.2,.3,.7]},20)),S.push(X.sphere(.08*i,Vd,{at:[0,-.08*i,-.03*i],scale:[1.6,.5,.8]}))):e.open?(S.push(X.sphere(.2*i,Bd,{scale:[1.15,.72,.35]})),S.push(X.sphere(.1*i,Vd,{at:[0,-.07*i,.03*i],scale:[1.3,.6,.5]}))):S.push(X.torus(.075*i,.017*i,Bd,{rot:[0,0,Math.PI]},Math.PI))};switch(e.species){case`unicorn`:{let t=e.mane??[e.fur],n=e=>t[e%t.length];v.push(X.sphere(i,e.fur,{at:[0,a,0]},26)),v.push(X.sphere(.52*i,e.light,{at:[0,a-.36*i,.6*i],scale:[1.05,.66,.6]})),y.push(...[-1,1].map(e=>X.sphere(.032*i,Rd,{at:[e*.16*i,a-.27*i,.91*i],scale:[1,.7,.6]}))),P(N(-.47*i,.86*i));for(let t of[-1,1])v.push(X.cone(.24*i,.7*i,e.fur,{at:[t*.62*i,a+.92*i,0*i],rot:[-.1,0,-t*.42]})),y.push(X.cone(.13*i,.44*i,e.ear??e.light,{at:[t*.6*i,a+.87*i,.1*i],rot:[-.1,0,-t*.42]}));v.push(X.cone(.15*i,.78*i,`#FFC83D`,{at:[0,a+1.12*i,.25*i],rot:[.28,0,0]})),y.push(...[0,1,2].map(e=>X.torus(.12*i-e*.03*i,.022*i,`#E8A92A`,{at:[0,a+(.86+e*.17)*i,(.18+e*.05)*i],rot:[Math.PI/2+.28,0,0]}))),v.push(X.sphere(.88*i,n(0),{at:[0,a+.42*i,-.12*i],scale:[1.05,.62,1]})),v.push(X.sphere(.32*i,n(0),{at:[-.32*i,a+.62*i,.62*i]}),X.sphere(.27*i,n(1),{at:[.02*i,a+.72*i,.6*i]}));let o=e.hair===`short`?2:e.hair===`long`?5:3,s=e.hair===`short`?0:e.hair===`long`?5:2;for(let e=0;e<o;e++)C.push(X.sphere((.42-e*.03)*i,n(e+1),{at:[.05*i*(e%2),a+(.15-e*.36)*i,-.82*i+e*.04*i]}));for(let e of[-1,1])for(let t=0;t<s;t++)C.push(X.sphere((.34-t*.02)*i,n(t+(e<0?2:3)),{at:[e*(.86+t*.03)*i,a+(.05-t*.34)*i,(-.2-t*.04)*i]}));[[.27,-.16,.07],[.23,-.23,.075],[.17,-.29,.075],[.11,-.31,.068],[.06,-.27,.058]].forEach(([e,t,i],a)=>E.push(X.sphere(i*r,n(a),{at:[0,e*r,t*r]})));break}case`panda`:v.push(X.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])v.push(X.sphere(.27*i,e.dark,{at:[t*.7*i,a+.7*i,-.12*i]})),y.push(X.sphere(.15*i,e.ear??`#FFB3C7`,{at:[t*.68*i,a+.68*i,.08*i],scale:[1,1,.4]})),v.push(X.sphere(.3*i,`#62566A`,{at:d(t*s,c-.03*i,-.12*i),rot:[0,Math.asin(t*s/i),t*.45],scale:[.85,1.12,.4]}));v.push(X.sphere(.42*i,e.light,{at:[0,a-.33*i,.62*i],scale:[1.1,.72,.7]})),v.push(X.sphere(.1*i,e.dark,{at:[0,a-.17*i,.96*i],scale:[1.3,.8,.8]})),P(N(-.47*i,.86*i)),v.push(X.sphere(.16*i,e.fur,{at:[.05*i,a+.96*i,.1*i],scale:[1.4,.7,1]}));break;case`elephant`:v.push(X.sphere(i,e.fur,{at:[0,a,0],scale:[1.08,1,1]},26));for(let t of[-1,1])v.push(X.sphere(.62*i,e.fur,{at:[t*1.02*i,a+.08*i,-.12*i],rot:[0,t*.45,-t*.15],scale:[1,1.12,.26]})),y.push(X.sphere(.46*i,e.ear??e.dark,{at:[t*1.07*i,a+.06*i,-.03*i],rot:[0,t*.45,-t*.15],scale:[1,1.1,.2]}));for(let[t,n,r]of[[-.15,.88,.24],[-.32,.98,.21],[-.48,1.05,.19],[-.62,1.14,.17],[-.7,1.27,.155],[-.7,1.4,.145],[-.62,1.5,.14]])v.push(X.sphere(r*i,e.fur,{at:[0,a+t*i,n*i]}));y.push(X.torus(.09*i,.035*i,e.dark,{at:[0,a-.55*i,1.56*i],rot:[-.9,0,0]})),w=d(0,-.36*i,.01*i),S.push(X.torus(.24*i,.022*i,Bd,{rot:[0,0,Math.PI]},Math.PI)),v.push(...[-.14,.04,.2].map((t,n)=>X.sphere((.15-n*.02)*i,e.dark,{at:[t*i,a+(.95-n*.04)*i,.15*i],scale:[.8,1.2,.8]}))),E.push(X.capsule(.018*r,.12*r,e.fur,{at:[0,.2*r,-.19*r*j[2]],rot:[.5,0,0]})),E.push(X.sphere(.035*r,e.dark,{at:[0,.13*r,-.24*r*j[2]],scale:[1,1.4,1]})),D=[0,.26*r,-.17*r*j[2]];break;case`puppy`:v.push(X.sphere(i,e.fur,{at:[0,a,0],scale:[1.08,1,1]},26)),v.push(X.sphere(.44*i,e.light,{at:[0,a-.36*i,.66*i],scale:[1.15,.72,.75]})),v.push(X.sphere(.14*i,e.dark,{at:[0,a-.18*i,1*i],scale:[1.35,.9,.8]})),P(N(-.52*i,.92*i));for(let t of[-1,1])v.push(X.sphere(.38*i,e.ear??e.fur,{at:[t*.94*i,a-.02*i,-.04*i],rot:[0,0,t*.22],scale:[.58,1.38,.55]}));v.push(...[-.12,.1].map((t,n)=>X.sphere((.2-n*.03)*i,e.fur,{at:[t*i,a+(.94-n*.04)*i,.2*i],scale:[.8,1.2,.8]}))),D=[0,.24*r,-.15*r*j[2]],E.push(X.sphere(.05*r,e.fur,{at:[0,.3*r,-.2*r*j[2]],rot:[-.7,0,0],scale:[.8,1.7,.8]})),E.push(X.sphere(.04*r,e.light,{at:[0,.38*r,-.24*r*j[2]]}));break;case`pony`:{let t=e.mane??[e.dark],n=e=>t[e%t.length];v.push(X.sphere(i,e.fur,{at:[0,a,0]},26)),v.push(X.sphere(.56*i,e.light,{at:[0,a-.4*i,.62*i],scale:[1.05,.72,.76]})),y.push(...[-1,1].map(e=>X.sphere(.05*i,Rd,{at:[e*.2*i,a-.32*i,1.02*i],scale:[1,1.3,.6]}))),P(N(-.56*i,.9*i));for(let t of[-1,1])v.push(X.cone(.22*i,.62*i,e.fur,{at:[t*.5*i,a+.98*i,-.05*i],rot:[-.1,0,-t*.28]})),y.push(X.cone(.12*i,.38*i,e.ear??e.light,{at:[t*.49*i,a+.94*i,.05*i],rot:[-.1,0,-t*.28]}));C.push(X.sphere(.3*i,n(0),{at:[0,a+.74*i,.62*i],scale:[1,.9,.8]}));for(let e=0;e<5;e++)C.push(X.sphere((.36-e*.02)*i,n(e+1),{at:[0,a+(.92-e*.36)*i,(.2-e*.26)*i],scale:[.85,1,1]}));D=[0,.26*r,-.16*r],[[.27,-.2,.06],[.22,-.25,.065],[.16,-.28,.065],[.1,-.29,.058]].forEach(([e,t,i],a)=>E.push(X.sphere(i*r,n(a),{at:[0,e*r,t*r]})));break}case`monkey`:v.push(X.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])v.push(X.sphere(.46*i,e.light,{at:[t*.3*i,a+.07*i,.6*i],scale:[1,1.08,.78]}));v.push(X.sphere(.52*i,e.light,{at:[0,a-.36*i,.62*i],scale:[1.25,.8,.8]})),y.push(...[-1,1].map(e=>X.sphere(.04*i,Rd,{at:[e*.1*i,a-.2*i,1.03*i],scale:[1,.75,.6]}))),P(N(-.52*i,1*i));for(let t of[-1,1])v.push(X.sphere(.36*i,e.fur,{at:[t*1.02*i,a-.02*i,-.02*i],scale:[.36,1,1]})),y.push(X.sphere(.24*i,e.ear??e.light,{at:[t*1.09*i,a-.02*i,.02*i],scale:[.3,1,1]}));v.push(X.cone(.13*i,.36*i,e.fur,{at:[.05*i,a+1.02*i,.12*i],rot:[.2,0,-.5]})),D=[0,.2*r,-.15*r*j[2]];for(let[t,n,i]of[[.17,-.22,.032],[.16,-.3,.03],[.2,-.37,.029],[.28,-.41,.028],[.37,-.4,.027],[.43,-.35,.026],[.44,-.29,.026],[.4,-.26,.026]])E.push(X.sphere(i*r,e.fur,{at:[0,t*r,n*r]}));break;case`fox`:v.push(X.sphere(i,e.fur,{at:[0,a,0],scale:[1.1,1,1]},26));for(let t of[-1,1])if(v.push(X.cone(.36*i,.98*i,e.fur,{at:[t*.58*i,a+.95*i,-.08*i],rot:[-.1,0,-t*.38]})),y.push(X.cone(.2*i,.6*i,e.ear??e.light,{at:[t*.56*i,a+.88*i,.06*i],rot:[-.1,0,-t*.38]})),e.cheeks===void 0)v.push(X.sphere(.34*i,e.light,{at:[t*.52*i,a-.42*i,.55*i]}));else{let n=e.cheeks,r=[t*.465,-.429,.774],o=[t*.55*i,a-.42*i,Math.sqrt(.75-.42**2)*i],s=.3*i*n/.8;v.push(X.sphere(s,e.light,{at:[o[0]-r[0]*.27*s,o[1]-r[1]*.27*s,o[2]-r[2]*.27*s],rot:[.52,t*.54,0],scale:[1.15,1,.45]},24))}v.push(X.sphere(.3*i,e.light,{at:[0,a-.36*i,.8*i],scale:[1.1,.8,.8]})),v.push(X.sphere(.08*i,e.dark,{at:[0,a-.22*i,1.03*i],scale:[1.3,.85,.9]})),P(e.smile===`teeth`?N(-.42*i,1.03*i):N(-.48*i,1*i)),e.hairdo||v.push(...[-.2,.05,.28].map((t,n)=>X.sphere((.24-n*.03)*i,e.fur,{at:[t*i,a+(.82-n*.06)*i,.48*i]}))),E.push(X.sphere(.13*r,e.fur,{at:[.05*r,.27*r,-.2*r],rot:[-.6,0,.25],scale:[.78,1.38,.78]})),E.push(X.sphere(.085*r,e.light,{at:[.09*r,.42*r,-.29*r]}));break;case`buffalo`:v.push(X.sphere(i,e.fur,{at:[0,a,0],scale:[1.1,.98,1]},26)),v.push(X.sphere(.56*i,e.light,{at:[0,a-.36*i,.56*i],scale:[1.25,.75,.76]})),y.push(...[-1,1].map(e=>X.sphere(.05*i,Rd,{at:[e*.2*i,a-.28*i,.94*i],scale:[1.3,.8,.6]}))),P(N(-.5*i,.9*i));for(let t of[-1,1]){v.push(X.sphere(.22*i,e.fur,{at:[t*1.02*i,a+.18*i,-.05*i],rot:[0,0,-t*.35],scale:[1.6,.62,.42]})),y.push(X.sphere(.13*i,e.ear??zd,{at:[t*1.05*i,a+.17*i,.01*i],rot:[0,0,-t*.35],scale:[1.5,.55,.3]}));let n=`#FFF3DC`,r=.4*i,o=t*.78*i,s=a+.42*i,c=t>0?-Math.PI/2:Math.PI/2+.55;v.push(X.torus(r,.17*i,n,{at:[o,s+r,-.05*i],rot:[0,0,c]},2.05));let l=t>0?-Math.PI/2+2.05:Math.PI/2+.55;v.push(X.cone(.16*i,.34*i,n,{at:[o+Math.cos(l)*r,s+r+Math.sin(l)*r+.08*i,-.05*i],rot:[0,0,t>0?.45:-.45]}))}if(e.hairdo||v.push(...[-.15,.12].map(e=>X.sphere(.25*i,`#7A86B0`,{at:[e*i,a+.82*i,.3*i],scale:[1.2,.7,1]}))),e.extras?.includes(`pigtails`))for(let e of[-1,1])v.push(X.capsule(.16*i,.5*i,`#7A86B0`,{at:[e*1.12*i,a-.52*i,-.02*i],rot:[0,0,e*.45]})),v.push(X.sphere(.13*i,`#7A86B0`,{at:[e*1.36*i,a-.98*i,.02*i]})),v.push(X.cone(.13*i,.26*i,`#FF6FAE`,{at:[e*1.12*i,a-.2*i,.04*i],rot:[0,0,e*Math.PI/2]})),v.push(X.cone(.13*i,.26*i,`#FF6FAE`,{at:[e*.9*i,a-.2*i,.04*i],rot:[0,0,-e*Math.PI/2]}));E.push(X.capsule(.02*r,.14*r,e.fur,{at:[0,.18*r,-.19*r],rot:[.6,0,0]})),D=[0,.26*r,-.15*r],E.push(X.sphere(.04*r,e.dark,{at:[0,.1*r,-.25*r],scale:[1,1.3,1]}));break;case`penguin`:v.push(X.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])v.push(X.sphere(.62*i,e.light,{at:[t*.28*i,a-.16*i,.48*i],scale:[1,1.02,.95]}));w=[0,a-(e.open?.25:.33)*i,(e.open?1.08:1.04)*i],e.open?(v.push(X.cone(.2*i,.4*i,e.dark,{at:[0,a-.14*i,1.13*i],rot:[Math.PI/2,0,0],scale:[1.5,1,.65]})),v.push(X.cone(.14*i,.26*i,e.dark,{at:[0,a-.33*i,1.06*i],rot:[Math.PI/2+.4,0,0],scale:[1.4,1,.6]})),S.push(X.sphere(.11*i,Bd,{scale:[1.5,.6,.5]}))):v.push(X.cone(.18*i,.36*i,e.dark,{at:[0,a-.2*i,1.12*i],rot:[Math.PI/2,0,0],scale:[1.45,1,.65]})),e.extras?.includes(`tuft`)&&v.push(...[-.15,.05,.24].map((t,n)=>X.sphere(.17*i,e.fur,{at:[t*i,a+(1+n%2*.1)*i,0],rot:[0,0,-t*2.5],scale:[.7,1.5,.7]}))),e.extras?.includes(`tuft`)||v.push(X.sphere(.18*i,e.fur,{at:[.05*i,a+.93*i,.1*i],scale:[1.3,.6,1]}));break;case`hornbill`:w=[0,a-.45*i,.95*i],v.push(X.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])v.push(X.sphere(.42*i,e.light,{at:[t*.42*i,a+.02*i,.62*i],scale:[1,1.05,.55]}));v.push(X.cone(.32*i,1.45*i,e.dark,{at:[0,a-.32*i,1.35*i],rot:[2.05,0,0],scale:[.62,1,1.25]})),v.push(X.capsule(.2*i,.55*i,`#FFD45C`,{at:[0,a+.22*i,1*i],rot:[Math.PI/2+.3,0,0],scale:[.65,1,.8]})),v.push(X.sphere(.6*i,e.light,{at:[0,a-.75*i,.1*i],scale:[1.15,.55,1]})),v.push(...[-.2,.15].map(t=>X.sphere(.22*i,e.fur,{at:[t*i,a+.9*i,-.15*i],scale:[1.2,.7,1]})));for(let[t,n]of[-.9,-.45,0,.45,.9].entries())E.push(X.sphere(.07*r,t%2?e.light:`#EADFCB`,{at:[Math.sin(n)*.1*r,.2*r,-.2*r-Math.cos(n)*.05*r],rot:[-.9,n,0],scale:[.55,1.6,.3]}))}e.hairdo&&$d(e.hairdo,n,v);for(let t of e.extras??[]){if(t===`glasses`||t===`round-glasses`){let e=t===`glasses`?`#E8A92A`:`#5FBFA0`,n=(t===`glasses`?.2:.26)*i;for(let t of[-1,1])v.push(X.torus(n,.03*i,e,{at:d(t*s,c,.06*i),rot:f(t*s)}));v.push(X.capsule(.025*i,s*2-n*2,e,{at:d(0,c+.03*i,.08*i),rot:[0,0,Math.PI/2]}))}if(t===`moustache`)for(let e of[-1,1])v.push(X.capsule(.08*i,.24*i,`#F4EFF4`,{at:[e*.18*i,a-.33*i,.95*i],rot:[0,0,e*1.15]}));if(t===`cap`&&(v.push(X.sphere(1*i,`#8FC9F5`,{at:[0,a+.32*i,-.06*i],rot:[-.3,0,0],scale:[1.12,.72,1.06]})),v.push(X.cyl(.5*i,.5*i,.06*i,`#6FB0E6`,{at:[0,a+.42*i,-1*i],rot:[.35,0,0],scale:[1,1,1.3]})),v.push(X.box(.5*i,.08*i,.06*i,`#6FB0E6`,{at:[0,a+.5*i,.86*i],rot:[-.55,0,0]}))),t===`officer-cap`&&(v.push(X.cyl(.66*i,.72*i,.3*i,`#3E4C8A`,{at:[0,a+.84*i,-.04*i],rot:[-.12,0,0]},24)),v.push(X.cyl(.8*i,.72*i,.12*i,`#4A5A9C`,{at:[0,a+1.03*i,-.07*i],rot:[-.12,0,0]},24)),v.push(X.cyl(.52*i,.52*i,.05*i,`#2B3566`,{at:[0,a+.72*i,.62*i],rot:[.3,0,0],scale:[1,1,.55]},20)),v.push(X.sphere(.11*i,`#FFC83D`,{at:[0,a+.88*i,.66*i],scale:[1,1,.5]}))),t===`scarf`&&(g.push(X.torus(.255*r,.05*r,`#FF8FB8`,{at:[0,.54*r,.02*r],rot:[Math.PI/2,0,0]},Math.PI*2)),g.push(X.rbox(.09*r,.24*r,.04*r,.015*r,`#FF8FB8`,{at:[.12*r,.42*r,.27*r],rot:[.25,0,-.15]}))),t===`bib`&&g.push(X.sphere(.2*r,`#A8DCFF`,{at:[0,.48*r,.2*r],scale:[1.1,.55,.45]})),t===`phone`){let e=[0,.42*r,.25*r*j[2]],t=-2.3,n=[t,0,0],i=[0,-Math.sin(t),Math.cos(t)];O.push(X.rbox(.13*r,.21*r,.022*r,.016*r,`#6B5BA8`,{at:e,rot:n})),k.push(X.rbox(.11*r,.18*r,.006*r,.012*r,`#BFE9FF`,{at:(t=>[e[0]+i[0]*t,e[1]+i[1]*t,e[2]+i[2]*t])(.012*r),rot:n}))}if(t===`cane`&&(T.L.push(X.cyl(.018*r,.018*r,.42*r,`#B07A4A`,{at:[-.09*r,-.32*r,.04*r]})),T.L.push(X.torus(.04*r,.016*r,`#B07A4A`,{at:[-.06*r,-.11*r,.04*r]},Math.PI))),Gd(t)){let r=Jd(t,n,e);v.push(...r.head),y.push(...r.headPlain),g.push(...r.body),_.push(...r.bodyPlain),T.L.push(...r.armL),T.R.push(...r.armR)}}let te=new K,ne=new K,re=new K;re.position.y=ee;let ie=new K,ae=new K;ie.position.set(-o[0],o[1],o[2]),ae.position.set(o[0],o[1],o[2]),te.add(Od((m?.3:.2*A)*r*1.3,t),ne),ne.add(Ed(g,_,t,p),re,ie,ae);let oe=O.length?Ed(O,k,t,p):null;oe&&ne.add(oe),re.add(Ed(v,y,t,p));let se=new K;se.position.y=a+c;for(let e of[...b,...x])e.translate(0,-(a+c),0);se.add(Ed(b,x,t,p));let ce=new K,F=new K;for(let e of[ce,F])e.position.set(...w);S.length&&ce.add(Ed([],S,t,0)),F.add(Ed([],[X.sphere(.17*i,Bd,{scale:[1.1,.9,.35]}),X.sphere(.09*i,Vd,{at:[0,-.06*i,.03*i],scale:[1.3,.6,.5]})],t,0)),F.scale.setScalar(.001),F.visible=!1,re.add(se,ce,F);let le=null;C.length&&(le=ef(C,e.species===`pony`?[0,a+.6*i,0]:[0,a+.5*i,-.6*i],t,p),re.add(le)),ie.add(Ed(T.L,[],t,p)),ae.add(Ed(T.R,[],t,p));let ue=null;return E.length&&(ue=ef(E,e.species===`unicorn`?[0,.29*r,-.15*r]:D,t,p),ne.add(ue)),{root:te,body:ne,head:re,eyes:se,mouth:ce,talk:F,open:(!!e.open||e.smile===`teeth`)&&S.length>0,armL:ie,armR:ae,tail:ue,mane:le,height:r,radius:m?.3*r:.16*r*A,phone:oe,face:{R:i,headY:a,mouth:w}}}function Qd(e,t,n,r,i,a){let o=new jn().compose(new V(...t),new Ot().setFromEuler(new Vn(...n)),new V(1,1,1)),s=(e,t,n)=>{let r=new V(e,t,n).applyMatrix4(o);return[r.x,r.y,r.z]},c=a*1.3;for(let t of[0,1]){let i=c+2.4+t*1.6;e.push(X.sphere(r*.75,`#5FBF8A`,{at:s(Math.cos(i)*r*1.2,Math.sin(i)*r*1.2,.001),rot:[n[0],n[1],i],scale:[1.6,.6,.25]}))}for(let t=0;t<5;t++){let a=c+t/5*Math.PI*2;e.push(X.sphere(r*.62,i,{at:s(Math.cos(a)*r*.62,Math.sin(a)*r*.62,.003),rot:n,scale:[1,1,.3]}))}e.push(X.sphere(r*.3,`#FFE9A8`,{at:s(0,0,.006),rot:n,scale:[1,1,.3]}))}function $d(e,t,n){let{R:r,headY:i}=t,a=e.color;if(e.style===`bob`){for(let e of[-1,1])n.push(X.sphere(.95*r,a,{at:[e*.13*r,i+.3*r,-.3*r],scale:[1.1,.92,1.15]},40)),n.push(X.sphere(.4*r,a,{at:[e*.3*r,i+.68*r,.58*r],rot:[.35,0,e*.5],scale:[1.45,.6,.8]},24)),n.push(X.sphere(.4*r,a,{at:[e*.85*r,i+.2*r,.15*r],scale:[.7,1.3,1.1]},24)),n.push(X.capsule(.26*r,.7*r,a,{at:[e*1*r,i-.48*r,0],rot:[.08,0,e*.06],scale:[.7,1,1.25]})),n.push(X.sphere(.24*r,a,{at:[e*1.03*r,i-.95*r,.1*r],scale:[.72,.7,1.25]}));n.push(X.sphere(r,a,{at:[0,i-.25*r,-.32*r],scale:[1.2,1.25,.92]},26))}else{n.push(X.sphere(.92*r,a,{at:[0,i+.36*r,-.08*r],scale:[1.05,.68,1.06]},24));for(let[e,t,o,s]of[[0,.25,0,.35],[-.3,.3,-.35,.45],[.3,.3,.35,.45],[-.16,-.1,-.15,.05],[.16,-.1,.15,.05],[-.42,-.25,-.55,-.2],[.42,-.25,.55,-.2],[0,-.45,0,-.45],[-.12,.55,-.2,.9],[.14,.56,.25,.95]]){let c=Math.sqrt(Math.max(0,1-e*e-(t+.08)**2))*.68+.36;n.push(X.cone(.17*r,.42*r,a,{at:[e*r,i+(c+.06)*r,t*r],rot:[s,0,-o]}))}}}function ef(e,t,n,r){let i=new K;i.position.set(...t);for(let n of e)n.translate(-t[0],-t[1],-t[2]);return i.add(Ed(e,[],n,r)),i}var tf=class{rig;voice;nextBlink=.8+Math.random()*3;blink=-1;level=0;constructor(e,t){this.rig=e,this.voice=t}update(e){let{eyes:n,mouth:r,talk:i,open:a}=this.rig;this.nextBlink-=e,this.nextBlink<=0&&(this.blink=0,this.nextBlink=Math.random()<.2?.25:2.2+Math.random()*3.5);let o=1;this.blink>=0&&(this.blink+=e/.16,o=1-.9*t(Math.min(1,this.blink)),this.blink>=1&&(this.blink=-1)),n.scale.y=o;let c=this.voice?s(this.voice):0;this.level+=(c-this.level)*(1-Math.exp(-e*(c>this.level?30:14)));let l=this.level;if(a)r.scale.set(1+.15*l,1+.9*l,1);else{let e=l>.04;i.visible=e,r.visible=!e,e&&i.scale.set(.55+.45*l,Math.min(1,.25+l),1)}}},nf=Fd.kaylee.height,rf=[.28,.5,.78],af=class{bag;id=`kaylee`;root;height=nf;pose=`stand`;floor=0;standPoint=null;chibi;path=[];onArrive=null;speed=0;yaw=Math.PI;yawVel=0;yawGoal=Math.PI;phase=0;tweens=[];settle=1;bounce={level:-1,t:0};flop=1;look=null;headYaw=0;life;waving=-1;wind=new Xd;worn=new Map;entering=new Map;constructor(e){this.bag=e,this.chibi=Zd(Fd.kaylee,e),this.life=new tf(this.chibi),this.root=this.chibi.root,this.root.rotation.y=this.yaw,this.root.userData.pick=`kaylee`}get position(){return this.root.position}get rig(){return this.chibi}wear(e){for(let t of new Set([...e,...this.worn.keys()])){let n=e.includes(t),r=this.worn.get(t);if(!r&&n){let e=Yd(Fd.kaylee,t,this.bag);r=[];for(let[n,i]of[[e.head,this.chibi.head],[e.armL,this.chibi.armL],[e.armR,this.chibi.armR],[e.body,this.chibi.body]])n&&(i.add(n),r.push(n),n.userData.base=n.position.clone(),(t===`sunhat`||t===`spare-hat`)&&(n.rotation.x=-.16));this.worn.set(t,r)}for(let e of r??[])e.visible=n}}putOn(e){let t=new Set(this.wearing);this.wear(e);for(let n of e)t.has(n)||this.entering.set(n,0)}glassesUp(e){let t=.24*nf;for(let n of this.worn.get(`sunglasses`)??[])n.position.set(0,e?.62*t:0,e?.12*t:0),n.userData.base=n.position.clone(),n.rotation.x=e?-.42:0}get wearing(){return[...this.worn].filter(([,e])=>e[0]?.visible).map(([e])=>e)}setWind(e){this.wind.goal=e}get walking(){return this.path.length>0||this.tweens.length>0}get busy(){return this.walking||this.speed>.01||this.pose===`bounce`||this.settle<1||this.flop<1}place(e,t,n,r){this.root.position.set(e,t,n),this.yaw=this.yawGoal=Math.PI/180*r,this.yawVel=0,this.path=[],this.tweens=[],this.speed=0}face(e){this.yawGoal=e}faceToward(e,t){let n=this.root.position;Math.hypot(e-n.x,t-n.z)>.05&&(this.yawGoal=Math.atan2(e-n.x,t-n.z))}walk(e,t){let n=()=>{this.path=e.slice(),this.onArrive=t??null};if(this.pose!==`stand`&&this.standPoint){let e=this.standPoint;this.standPoint=null,this.setPose(`stand`),this.path=[],this.hopTo(e,.28,.18,n)}else this.setPose(`stand`),n()}stop(){this.path=[],this.onArrive=null}hopTo(e,t,n,r){this.tweens.push({from:new V,to:e.clone(),dur:t,arc:n,t:-1,done:r})}setPose(e){e===`bounce`&&this.pose!==`bounce`&&(this.bounce={level:0,t:0}),e===`lie`&&(this.flop=0),this.pose=e}bounceHigher(){if(this.pose===`lie`)return this.setPose(`bounce`),0;if(this.pose!==`bounce`)this.setPose(`bounce`);else if(this.bounce.level>=rf.length-1)return this.setPose(`lie`),rf.length;else this.bounce.level++;return this.bounce.level}react(e){e===`wave`?this.waving=0:e===`hop`&&this.pose===`stand`&&!this.tweens.length?this.hopTo(this.root.position,.45,.25):this.settle=0}lookAt(e,t,n){this.look=(this.look??new V).set(e,t,n)}lookAway(){this.look=null}update(e,n){let r=Math.max(1,Math.ceil(e/(1/90)));for(let t=0;t<r;t++)this.step(e/r);this.pose3d(n),this.life.update(e),this.wind.update(this.chibi,e,n);for(let[n,r]of this.entering){let i=Math.min(1,r+e/.5);i>=1?this.entering.delete(n):this.entering.set(n,i);for(let e of this.worn.get(n)??[]){let r=e.userData.base??e.position;e.position.copy(r),n===`floaties`?e.scale.setScalar(Math.max(.01,i<.6?i/.6*1.2:1.2-(i-.6)*.5)):n===`sunglasses`?e.position.y+=(1-i)*.12:(e.position.y+=(1-i)**2*.55,e.scale.set(1,1-.22*t(a(i,.65,1)),1))}}if(this.waving>=0){this.waving+=e/1.3;let t=Math.min(1,this.waving),n=a(t,0,.15)*(1-a(t,.8,1));this.chibi.armR.rotation.z=n*(2.5+Math.sin(t*Math.PI*6)*.35),t>=1&&(this.waving=-1)}}step(e){let n=this.root.position,r=this.tweens[0];if(r){r.t<0&&(r.from.copy(n),r.t=0,r.to.distanceToSquared(r.from)>1e-4&&(this.yawGoal=Math.atan2(r.to.x-r.from.x,r.to.z-r.from.z))),r.t+=e;let a=i(r.t/r.dur);n.lerpVectors(r.from,r.to,a),n.y+=t(a)*r.arc,a>=1&&(this.tweens.shift(),this.settle=0,r.done?.())}else if(this.path.length){let[t,r]=this.path[0],a=t-n.x,o=r-n.z,s=Math.hypot(a,o),c=s+this.pathLength(),l=1+i((c-4)/6,0,.6),u=nd.walkSpeed*l*i(c/.45,.35,1);this.speed=this.speed>u?u:Math.min(u,this.speed+nd.walkSpeed/.15*e);let d=this.speed*e;if(s<=Math.max(d,.02)){if(n.x=t,n.z=r,this.path.shift(),!this.path.length){this.speed=0,this.settle=0;let e=this.onArrive;this.onArrive=null,e?.()}}else n.x+=a/s*d,n.z+=o/s*d,this.yawGoal=Math.atan2(a,o)}else this.speed=0;let a=this.yawGoal-this.yaw;a=Math.atan2(Math.sin(a),Math.cos(a)),this.yawVel+=(220*a-28*this.yawVel)*e,this.yaw+=this.yawVel*e,this.speed>.01?this.phase+=Math.PI*nd.stepsPerSecond*(this.speed/nd.walkSpeed)*e:this.phase=0,this.settle=Math.min(1,this.settle+e/.35),this.flop=Math.min(1,this.flop+e/.5),this.pose===`bounce`&&(this.bounce.t+=e)}pathLength(){let e=0;for(let t=1;t<this.path.length;t++)e+=Math.hypot(this.path[t][0]-this.path[t-1][0],this.path[t][1]-this.path[t-1][1]);return e}pose3d(e){let{body:t,head:n}=this.chibi;this.root.rotation.y=this.yaw;let o=this.pose,s=0,c=1+Math.sin(e*2.4)*.015,l=0,u=0,d=this.speed/nd.walkSpeed;if(d>.01){let e=Math.abs(Math.sin(this.phase));s=e*nd.hop,c*=1+.06*(e-.5)*2*d,l=.14*d}if(o===`sit`)s-=.1,c*=.92;else if(o===`wai`)l=.32,u=.15;else if(o===`peek`)l=.22,u=.2;else if(o===`lookup`)u=-.5;else if(o===`bounce`){let e=rf[i(this.bounce.level,0,rf.length-1)],t=.42+e*.55,n=this.bounce.t%t/t;s+=Math.sin(n*Math.PI)*e;let r=1-a(Math.min(n,1-n),0,.08);c*=1-.2*r+.08*Math.sin(n*Math.PI)}this.settle<1&&(c*=1+r(this.settle,2)*.12),t.position.y=o===`lie`?this.chibi.radius*(1-.5*(1-this.flop)):s,t.rotation.x=o===`lie`?-Math.PI/2*Math.min(1,this.flop*1.2):l,t.rotation.z=0,t.scale.set(1/Math.sqrt(c),c,1/Math.sqrt(c));let f=0;if(this.look&&o!==`lie`){let e=this.root.worldToLocal(this.look.clone());f=i(Math.atan2(e.x,e.z),-.9,.9)}this.headYaw+=(f-this.headYaw)*.15,n.rotation.set(u,this.headYaw,0)}},of=[{id:`agong`,name:`Agong`,thai:`อากง`,who:`Grandpa`,color:`#B9A6F5`,height:1.45,pitch:150,spot:{floor:0,x:2.025,z:-4.2,face:65,pose:`sit`,seat:.45}},{id:`jum`,name:`Jum`,who:`Aunt`,color:`#FFB3CF`,height:1.5,pitch:260,spot:{floor:0,x:1,z:-18.698,face:-30,pose:`stand`}},{id:`joy`,name:`Joy`,who:`Aunt, mom of Gan and Ken`,color:`#FBEA9A`,height:1.5,pitch:280,spot:{floor:0,x:.2,z:-7,face:-20,pose:`stand`}},{id:`bird`,name:`Bird`,who:`Uncle, dad of BB`,color:`#A8DCFF`,height:1.65,pitch:130,spot:{floor:0,x:-3.3,z:1,face:25,pose:`stand`}},{id:`nick`,name:`Daddy`,who:`Kaylee's dad (Nick)`,color:`#7FD1B9`,height:1.7,pitch:120,spot:{floor:0,x:2.9,z:1.15,face:-30,pose:`stand`}},{id:`ji`,name:`Mommy`,who:`Kaylee's mom (Ji)`,color:`#FF8FB8`,height:1.55,pitch:300,spot:{floor:1,x:.55,z:-18.898,face:-15,pose:`stand`}},{id:`bb`,name:`BB`,who:`Cousin, Bird's daughter`,color:`#FFB3D6`,height:1.2,pitch:380,spot:{floor:1,x:2.745,z:-13.4,face:-90,pose:`sit`,seat:.42}},{id:`gan`,name:`Gan`,who:`Cousin, Joy's son`,color:`#7CC4F2`,height:1.3,pitch:330,spot:{floor:1,x:-1.725,z:-19.3,face:90,pose:`lie`}},{id:`ken`,name:`Ken`,who:`Cousin, Joy's son`,color:`#8FE3C8`,height:1.25,pitch:350,spot:{floor:1,x:1.1,z:-6.3,face:-20,pose:`stand`}},{id:`ja`,name:`Ja`,who:`Aunt, mom of Putto and Putter`,color:`#D9CCFF`,height:1.5,pitch:270,spot:null},{id:`sri`,name:`Sri`,who:`Aunt`,color:`#FFC83D`,height:1.5,pitch:290,spot:null},{id:`putto`,name:`Putto`,who:`Cousin, Ja's son (Kaylee's age)`,color:`#A8DCFF`,height:1,pitch:420,spot:null},{id:`putter`,name:`Putter`,who:`Cousin, Ja's son (a little penguin)`,color:`#B9A6F5`,height:.8,pitch:480,spot:null}],sf=Math.PI/180,cf=new V,lf=class{member;id;root;height;pose=`stand`;chibi;reaction=null;life;waving=-1;look=null;headYaw=0;phase=Math.random()*10;baseY;onPhone;phoneDown=-1;glance=1;phoneWaving=-1;wind=new Xd;constructor(e,t,n=Fd[e.id],r=e.id){this.member=e,this.id=e.id,this.chibi=Zd(n,t),this.root=this.chibi.root,this.height=this.chibi.height,this.life=new tf(this.chibi,r),this.onPhone=!!n.extras?.includes(`phone`),this.onPhone&&(this.chibi.armL.rotation.set(-1.2,0,.75),this.chibi.armR.rotation.set(-1.2,0,-.75));let i=e.spot;this.baseY=(i?.floor?3.6:0)+(i?.pose===`sit`?(i.seat??.45)-.1*this.height:i?.pose===`lie`?.2:0),i&&(this.root.position.set(i.x,this.baseY,i.z),this.root.rotation.y=i.face*sf,this.setPose(i.pose)),this.root.userData.pick=`family:${e.id}`}get rig(){return this.chibi}place(e,t,n,r,i=`stand`){this.baseY=t,this.root.position.set(e,t,n),this.root.rotation.y=r*sf,this.setPose(i)}setPose(e){this.pose=e;let{body:t}=this.chibi;t.rotation.set(e===`lie`?-Math.PI/2:0,0,0),t.position.set(0,e===`lie`?this.chibi.radius:0,0)}react(e){this.onPhone?this.glance=0:e===`wave`?this.waving=0:this.reaction={kind:e,t:0}}phoneWave(){this.onPhone?this.phoneWaving=0:this.waving=0}putPhoneDown(){this.onPhone&&(this.onPhone=!1,this.phoneDown=0,this.glance=1)}setWind(e){this.wind.goal=e}lookAt(e,t,n){this.look=(this.look??new V).set(e,t,n)}lookAway(){this.look=null}update(e,n){let{body:r,head:o,armR:s}=this.chibi,c=this.pose===`lie`;if(this.life.update(e),this.wind.update(this.chibi,e,n),this.phoneDown>=0){this.phoneDown=Math.min(1,this.phoneDown+e/.5);let t=this.phoneDown,n=1-(1-t)**3;this.chibi.armL.rotation.set(-1.2*(1-n),0,.75*(1-n)),s.rotation.set(-1.2*(1-n),0,-.75*(1-n)),o.rotation.x=.45*(1-n);let r=this.chibi.phone;r&&(r.scale.setScalar(Math.max(.001,1-n)),r.visible=t<1),t>=1&&(this.phoneDown=-1)}if(this.phoneWaving>=0){this.phoneWaving+=e/1.6;let t=Math.min(1,this.phoneWaving),n=a(t,0,.18)*(1-a(t,.82,1));s.rotation.set(-1.2*(1-n),0,-.75*(1-n)+n*(2.3+Math.sin(t*Math.PI*7)*.35)),t>=1&&(this.phoneWaving=-1)}if(this.waving>=0){this.waving+=e/1.5;let t=Math.min(1,this.waving),n=a(t,0,.15)*(1-a(t,.8,1));s.rotation.z=n*(2.5+Math.sin(t*Math.PI*7)*.35),t>=1&&(s.rotation.z=0,this.waving=-1)}let l=1+Math.sin(n*2.6+this.phase)*.018;r.scale.set(1/Math.sqrt(l),l,1/Math.sqrt(l));let u=0;this.glance=Math.min(1,this.glance+e/1.1);let d=this.onPhone?t(this.glance):1;this.look&&!c&&d>.05&&(this.root.worldToLocal(cf.copy(this.look)),u=i(Math.atan2(cf.x,cf.z),-1,1)),this.headYaw+=(u-this.headYaw)*(1-Math.exp(-e*6)),o.rotation.y=this.headYaw*d,this.onPhone&&(o.rotation.x=.45*(1-d)+Math.sin(n*1.3+this.phase)*.02);let f=0;if(this.reaction){let n=this.reaction;if(n.t+=e,n.kind===`hop`){let e=n.t/.55,i=t(a(e,0,.22)),o=a(e,.2,.85),s=t(a(e,.82,1));f=c?0:t(o)*.28*this.height;let l=1-.14*i-.1*s+.08*t(o);r.scale.y*=l,r.scale.x*=1/Math.sqrt(l),r.scale.z*=1/Math.sqrt(l),e>=1&&(this.reaction=null)}else{let e=n.t/.6;r.rotation.z=Math.sin(e*Math.PI*6)*.14*(1-e),e>=1&&(r.rotation.z=0,this.reaction=null)}}this.root.position.y=this.baseY+f}},uf=Math.PI/180,df=class{camera=new pi(nd.fov,1,.3,300);w=1;h=1;top=0;goal=null;cur={center:new V,yaw:0,pitch:30,dist:20};fits=new Map;probe=new pi;lag=.35;fov=null;setSize(e,t,n){this.w=Math.max(1,e),this.h=Math.max(1,t),this.top=Math.max(0,Math.min(n,t*.4)),this.fits.clear();let r=this.camera;r.fov=this.fov??nd.fov,r.aspect=this.w/(this.h+this.top),r.setViewOffset(this.w,this.h+this.top,0,0,this.w,this.h),r.updateProjectionMatrix(),this.place()}setShot(e,t=!1){this.goal=e,t&&(this.cur.center.copy(e.center),this.cur.yaw=e.yaw,this.cur.pitch=e.pitch,this.cur.dist=this.fit(e),this.place())}refit(){this.fits.clear(),this.camera.fov!==(this.fov??nd.fov)&&this.setSize(this.w,this.h,this.top)}update(e){let t=this.goal;if(!t)return;let n=1-Math.exp(-e/Math.max(.01,this.lag));this.cur.center.lerp(t.center,n),this.cur.yaw+=(t.yaw-this.cur.yaw)*n,this.cur.pitch+=(t.pitch-this.cur.pitch)*n,this.cur.dist+=(this.fit(t)-this.cur.dist)*n,this.place()}get yaw(){return this.cur.yaw}get moving(){let e=this.goal;return e?this.cur.center.distanceToSquared(e.center)>1e-4||Math.abs(e.yaw-this.cur.yaw)>.05||Math.abs(this.fit(e)-this.cur.dist)>.02:!1}place(){let{center:e,yaw:t,pitch:n,dist:r}=this.cur;this.camera.position.copy(e).add(ff(t,n,r)),this.camera.lookAt(e)}fit(e){let t=e.follow?0:e.yaw,n=`${e.half.x.toFixed(2)},${e.half.y.toFixed(2)},${e.half.z.toFixed(2)},${t.toFixed(2)},${e.pitch.toFixed(2)},${e.minDist},${e.maxDist}`,r=this.fits.get(n);if(r!==void 0)return r;let i=this.probe;i.fov=this.camera.fov,i.aspect=this.camera.aspect,i.updateProjectionMatrix();let a=(this.h-this.top)/(this.h+this.top)*.94,o=new V,s=n=>{i.position.copy(ff(t,e.pitch,n)),i.lookAt(0,0,0),i.updateMatrixWorld();for(let t of[-1,1])for(let n of[-1,1])for(let r of[-1,1])if(o.set(t*e.half.x,n*e.half.y,r*e.half.z).project(i),o.z>1||Math.abs(o.x)>.94||Math.abs(o.y)>a)return!1;return!0},c=e.minDist??2,l=e.maxDist??120;if(s(c))l=c;else for(let e=0;e<28;e++){let e=(c+l)/2;s(e)?l=e:c=e}return this.fits.set(n,l),l}};function ff(e,t,n){let r=e*uf,i=t*uf;return new V(Math.sin(r)*Math.cos(i),Math.sin(i),Math.cos(r)*Math.cos(i)).multiplyScalar(n)}var pf=class{items=new Set;add(e){return this.items.add(e),e}dispose(){for(let e of this.items)e.dispose();this.items.clear()}},$={...S,boingAt:e=>{let t=220+e*90;C(t,t*2.6,.32,.16,`sine`),C(t*1.5,t*3.4,.22,.05,`triangle`,.03)},rattle:()=>{for(let e=0;e<9;e++)w(.06,.12,`bandpass`,1800+e*120,2400,e*.11,3);C(160,260,1,.05,`sawtooth`)},jiggle:()=>{for(let e=0;e<4;e++)w(.05,.1,`bandpass`,2600-e*150,3200,e*.09,4);C(220,180,.08,.06,`square`,.02)},ding:()=>{C(1318,1310,1.6,.07,`sine`),C(2637,2630,1.1,.025,`sine`,.01)},beep:()=>[0,.18].forEach(e=>C(880,860,.12,.08,`square`,e)),toot:()=>[0,.2].forEach(e=>C(392,370,.16,.1,`triangle`,e)),meow:()=>C(620,380,.45,.1,`triangle`),tick:()=>[0,.25,.5,.75].forEach((e,t)=>C(t%2?1700:2100,1600,.04,.08,`square`,e)),whir:()=>w(1.2,.07,`bandpass`,500,1400,0,1.2),puff:()=>w(.25,.1,`lowpass`,700,250),putt:()=>{for(let e=0;e<6;e++)C(95+e*4,90,.06,.05,`sawtooth`,e*.08);w(.6,.03,`lowpass`,600,300)},tukkae:()=>{w(.12,.05,`bandpass`,900,600);for(let e=0;e<3;e++){let t=.25+e*.55;C(260,200,.07,.09,`square`,t),C(420,560,.2,.08,`sawtooth`,t+.12)}},phone:()=>[0,.1,.17,.31].forEach((e,t)=>C(t===3?1560:2200,t===3?2080:2150,.035,.05,`sine`,e)),babble:e=>{let t=3+Math.floor(Math.random()*2);for(let n=0;n<t;n++){let r=e*(1+(Math.random()-.3)*.35);C(r,r*(n===t-1?1.35:.9),.11,.09,`triangle`,n*.13)}},latch:()=>{C(2600,1900,.035,.1,`square`),C(1400,1e3,.05,.07,`square`,.05)},whoosh:(e=.9)=>w(e,.08,`bandpass`,400,1800,0,.8),crunch:()=>[0,.16,.32].forEach(e=>w(.08,.1,`highpass`,2500,1800,e,1)),callDing:()=>{C(1568,1560,.5,.08,`sine`),C(1175,1170,.7,.06,`sine`,.18)},stamp:()=>{w(.08,.14,`lowpass`,900,300),C(140,70,.14,.12,`square`,.02)},haha:()=>[0,.17,.34].forEach((e,t)=>C(330-t*20,260-t*20,.12,.08,`triangle`,e)),woof:()=>[0,.22].forEach(e=>C(240,140,.12,.1,`sawtooth`,e)),jet:e=>{w(.35,.02+.07*e,`lowpass`,300+900*e,250+800*e),C(90+60*e,85+60*e,.3,.015+.02*e,`sawtooth`)},snort:()=>{w(.25,.12,`lowpass`,500,200),C(160,90,.2,.08,`sawtooth`,.05)},engine:e=>{C(70+70*e,60+50*e,.07,.025+.035*e,`sawtooth`),e>.55&&w(.06,.02*e,`bandpass`,900+600*e,700,0,2),e>.8&&C(190+90*e,170+80*e,.08,.02*e,`square`)},vroom:()=>{C(90,320,.6,.09,`sawtooth`),C(140,460,.5,.05,`square`,.05),w(.7,.06,`bandpass`,600,2400,0,1.5)},splash:(e=1)=>{w(.45*e,.12*e,`lowpass`,2400,300),C(220,90,.18,.05*e,`sine`)},paddle:()=>w(.18,.05,`bandpass`,1400,600,0,1.4),boink:()=>{C(700,1600,.12,.12,`triangle`),C(320,180,.2,.07,`square`,.02),w(.25,.05,`highpass`,3e3,1500,.05)},boop:()=>C(330,520,.18,.1,`sine`),shutter:()=>{w(.05,.15,`highpass`,4e3,2500),w(.08,.1,`bandpass`,1800,1200,.07,3)},horn:()=>[0,.45].forEach(e=>C(196,190,.38,.1,`sawtooth`,e)),giggle:()=>[0,.11,.22,.33].forEach((e,t)=>C(880+t*60,1180+t*40,.08,.07,`triangle`,e)),plink:()=>[0,.32,.64].forEach((e,t)=>C(1760,1320,.16,.1/(1+t*1.6),`sine`,e)),squeak:()=>[0,.09,.2,.27].forEach((e,t)=>C(3200+t%2*500,4200,.05,.035,`sine`,e)),chatter:()=>[0,.08,.16,.24,.36].forEach((e,t)=>C(900+t%3*180,650,.06,.06,`square`,e)),kick:()=>{w(.06,.16,`lowpass`,900,300),C(180,90,.08,.1,`sine`)},cheer:()=>{w(1.1,.05,`bandpass`,1600,2200,0,.7);for(let e=0;e<6;e++)C(520+Math.random()*260,760+Math.random()*300,.18,.035,`triangle`,e*.12)},whistle:()=>{C(2600,2700,.18,.06,`sine`),C(2600,2650,.5,.06,`sine`,.24)},scoop:()=>{w(.12,.06,`bandpass`,1500,900),C(520,780,.12,.07,`triangle`,.08)},flap:()=>[0,.12,.22].forEach(e=>w(.08,.06,`bandpass`,1100,1800,e,1.5)),blow:()=>w(.4,.09,`bandpass`,1300,700,0,.9),chime:()=>[0,.08,.16].forEach((e,t)=>C(1318*[1,1.25,1.5][t],1320*[1,1.25,1.5][t],.25,.05,`sine`,e)),countdown:()=>[0,.32,.64].forEach((e,t)=>C(t===2?1400:980,t===2?1400:980,.09,.06,`sine`,e)),creak:()=>[0,.18].forEach(e=>C(240,170,.22,.05,`sawtooth`,e)),flop:()=>[0,.14].forEach(e=>w(.05,.08,`bandpass`,2e3,1200,e,2)),mrrp:()=>{C(420,560,.12,.07,`triangle`),C(560,400,.3,.08,`triangle`,.1)},swish:()=>[0,.25].forEach(e=>w(.18,.08,`highpass`,1800,3600,e,.8)),peep:()=>[0,.1,.2].forEach(e=>C(3400,3e3,.05,.05,`sine`,e)),plop:()=>C(520,160,.12,.08,`sine`),light:e=>C(e?1320:660,e?1320:660,e?.55:.22,.09,`square`),roll:()=>C(1400+Math.random()*600,1300,.03,.04,`square`),item:()=>[1,1.26,1.5].forEach((e,t)=>C(880*e,900*e,.14,.06,`triangle`,t*.07)),slip:()=>{C(1400,300,.6,.07,`sine`),w(.3,.05,`bandpass`,900,400)},splat:()=>{w(.18,.12,`lowpass`,1200,300),C(300,120,.15,.07,`sine`)},trick:()=>[0,1,2,3].forEach(e=>C(600+e*200,900+e*240,.1,.05,`triangle`,e*.06)),zoom:()=>{w(.5,.08,`bandpass`,500,2600,0,1.2),C(220,660,.4,.05,`sawtooth`)},trumpet:()=>{C(330,620,.22,.07,`sawtooth`),C(620,560,.4,.07,`sawtooth`,.2),C(660,600,.4,.04,`square`,.22),w(.3,.03,`bandpass`,1200,1800,.15)},squeal:()=>{C(620,1050,.16,.06,`sawtooth`),C(1050,920,.26,.05,`square`,.14)},sniff:()=>[0,.11,.2].forEach(e=>w(.08,.06,`bandpass`,2600,1500,e,2.2)),rumble:()=>{C(62,48,.7,.14,`sawtooth`),C(93,70,.6,.06,`triangle`,.05)},slurp:()=>[0,.16,.3].forEach(e=>w(.12,.07,`bandpass`,700,1500,e,3)),hiccup:()=>C(700,1250,.09,.08,`square`),burp:()=>{C(120,58,.55,.16,`sawtooth`),w(.45,.07,`lowpass`,500,160,.03)},dolphin:()=>[0,.1,.19,.3].forEach((e,t)=>C(t%2?2600:1700,t%2?1500:2900,.09,.045,`sine`,e)),lap:()=>[0,.18].forEach(e=>C(1568,1568,.3,.07,`sine`,e)),bang:()=>{w(.35,.1,`lowpass`,1600,200);for(let e=0;e<5;e++)C(2400+Math.random()*1200,1800,.08,.02,`sine`,.1+e*.05)},thoomp:()=>{w(.25,.14,`lowpass`,500,120),C(110,55,.25,.12,`sine`)},jangle:()=>[0,.07,.15,.24].forEach((e,t)=>C(1200+t%2*340,1150,.18,.05,`square`,e))},mf=[[100.12,20.32],[100.14,20.25],[100.32,20.39],[100.52,20.18],[100.4,19.76],[100.51,19.55],[100.74,19.51],[100.97,19.61],[101.21,19.55],[101.29,18.98],[101.05,18.44],[101.14,18.14],[100.91,17.58],[100.96,17.54],[101.17,17.5],[101.69,17.89],[101.77,18.03],[102.1,18.21],[102.55,17.97],[102.66,17.82],[103.05,18.03],[103.29,18.41],[103.95,18.32],[104.82,17.3],[104.74,16.88],[104.82,16.47],[105.05,16.16],[105.41,15.99],[105.4,15.83],[105.64,15.66],[105.49,15.26],[105.55,14.93],[105.48,14.53],[105.07,14.23],[104.97,14.37],[104.78,14.43],[103.98,14.36],[103.6,14.42],[103.2,14.33],[102.91,14.14],[102.55,13.59],[102.32,13.54],[102.5,12.67],[102.76,12.43],[102.74,12.09],[102.93,11.71],[102.59,12.2],[102.54,12.11],[102.26,12.39],[102.23,12.33],[101.84,12.64],[100.9,12.65],[100.96,13.43],[100.6,13.57],[100.02,13.35],[99.99,13.24],[100.09,13.05],[99.96,12.69],[99.99,12.17],[99.63,11.46],[99.49,10.89],[99.17,10.32],[99.16,9.73],[99.29,9.41],[99.25,9.27],[99.39,9.21],[99.84,9.29],[99.99,8.59],[100.15,8.44],[100.28,8.27],[100.55,7.23],[100.44,7.28],[100.38,7.54],[100.28,7.55],[100.32,7.72],[100.26,7.77],[100.16,7.73],[100.16,7.6],[100.42,7.19],[100.59,7.18],[101.02,6.86],[101.5,6.87],[101.8,6.47],[102.1,6.24],[101.87,5.83],[101.68,5.78],[101.56,5.91],[101.26,5.79],[101.11,5.64],[100.98,5.77],[101.08,5.96],[101.05,6.24],[100.87,6.25],[100.75,6.46],[100.35,6.55],[100.26,6.68],[100.18,6.67],[100.12,6.44],[99.7,6.88],[99.72,7.11],[99.55,7.22],[99.6,7.36],[99.36,7.37],[99.26,7.62],[99.08,7.72],[99.05,7.89],[98.79,8.06],[98.7,8.26],[98.58,8.34],[98.36,8.19],[98.24,8.42],[98.24,8.77],[98.75,10.35],[98.76,10.66],[99.19,11.11],[99.61,11.78],[99.41,12.55],[99.22,12.74],[99.12,13.03],[99.14,13.72],[98.93,14.05],[98.57,14.36],[98.2,14.98],[98.19,15.2],[98.56,15.37],[98.59,16.05],[98.82,16.18],[98.89,16.35],[98.84,16.42],[98.66,16.33],[98.44,16.98],[97.71,17.8],[97.74,17.94],[97.63,18.29],[97.45,18.36],[97.37,18.52],[97.75,18.59],[97.71,18.93],[97.8,19.13],[97.82,19.46],[98.02,19.75],[98.37,19.69],[98.92,19.77],[99.07,20.1],[99.34,20.08],[99.49,20.15],[99.46,20.36],[99.72,20.33],[99.89,20.42]],hf=[[98.41,7.9],[98.3,7.78],[98.3,8.14],[98.43,8.09]],gf={bangkok:[100.5,13.75],krabi:[98.99,8.1],phangNga:[98.52,8.22],north:[[98.9,18.8],[99.8,19.4],[100.6,18.6],[98.6,17.2],[101.1,17.9]]},_f={ear:[[101.9,17.4],[103.4,17.75],[104.45,16.9],[104.85,15.6],[104.2,14.75],[102.9,14.6],[102.05,15.4],[101.8,16.5]],eye:[99.7,17.55]},vf={west:97,east:106,south:5.3,north:20.8},yf=.974;function bf([e,t]){return[(e-(vf.west+vf.east)/2)*yf,t-(vf.south+vf.north)/2]}var xf={w:(vf.east-vf.west)*yf,h:vf.north-vf.south};function Sf(e,t,n=.9){let r=Math.min(e*n/xf.w,t*n/xf.h);return n=>{let[i,a]=bf(n);return[e/2+i*r,t/2-a*r]}}function Cf(e,t,n,r=0){e.beginPath(),n.forEach((n,i)=>{let[a,o]=t(n),s=r?Math.sin(i*12.9898)*r:0;i===0?e.moveTo(a+s,o-s):e.lineTo(a+s,o-s)}),e.closePath()}function wf(e,t,n,r,i=gf.bangkok,a=gf.krabi){let o=e.width,s=e.height,c=e.getContext(`2d`);if(c.fillStyle=`#1F2A55`,c.fillRect(0,0,o,s),n===`cartoon`){c.fillStyle=`#8FE3C8`,c.fillRect(0,s*.72,o,s*.28);let e=o*(.15+.7*((Math.sin(r*1.3)+1)/2)),t=s*.62-Math.abs(Math.sin(r*4))*s*.4;c.fillStyle=`#FF8FB8`,c.beginPath(),c.arc(e,t,s*.1,0,Math.PI*2),c.fill(),c.fillStyle=`#FBEA9A`,c.beginPath(),c.arc(o*.82,s*.2,s*.12,0,Math.PI*2),c.fill();return}let l=Sf(o,s,.92);c.fillStyle=`#2E4A8C`,c.fillRect(o*.04,s*.04,o*.92,s*.92),c.fillStyle=`#8FE3C8`,Cf(c,l,mf),c.fill(),Cf(c,l,hf),c.fill(),c.strokeStyle=`#FFFFFF`,c.lineWidth=Math.max(2,o*.008),Cf(c,l,mf),c.stroke();let[u,d]=l(i),[f,p]=l(a);c.save(),c.setLineDash([o*.02,o*.018]),c.strokeStyle=`#FBEA9A`,c.lineWidth=Math.max(2,o*.012),c.beginPath(),c.moveTo(u,d),c.lineTo(f,p),c.stroke(),c.restore();for(let[e,t]of[[u,d],[f,p]])c.fillStyle=`#FF4F9A`,c.beginPath(),c.arc(e,t,o*.022,0,Math.PI*2),c.fill();let m=u+(f-u)*t,h=d+(p-d)*t;c.save(),c.translate(m,h),c.rotate(Math.atan2(p-d,f-u)),c.fillStyle=`#FFFFFF`;let g=o*.05;c.beginPath(),c.moveTo(g,0),c.lineTo(-g*.7,-g*.25),c.lineTo(-g*.7,g*.25),c.closePath(),c.fill(),c.fillRect(-g*.2,-g*.8,g*.35,g*1.6),c.restore()}function Tf(e,t,n,r){let i=e.width,a=e.height,o=e.getContext(`2d`);o.fillStyle=`#10183A`,o.fillRect(0,0,i,a),o.save(),o.strokeStyle=`#7FE9FF`,o.shadowColor=`#7FE9FF`,o.shadowBlur=i*.02,o.lineWidth=Math.max(2,i*.008),o.lineJoin=o.lineCap=`round`,o.globalAlpha=.5,Df(o,i*.06,a*.1,i*.88,a*.8,i*.04),o.stroke(),o.globalAlpha=1;let s=t.length>8?5:4,c=Math.max(1,Math.ceil(t.length/s)),l=i*.8/s,u=a*.7/Math.max(2,c);t.slice(0,n).forEach((e,t)=>{let n=i*.1+l*(t%s+.5),c=a*.15+u*(Math.floor(t/s)+.5);o.save(),o.translate(n,c);let d=Math.min(l,u)*.36;Ef(o,e,d,r),o.restore()}),o.restore()}function Ef(e,t,n,r){let i=(t,n,r)=>{e.beginPath(),e.arc(t,n,r,0,Math.PI*2),e.stroke()},a=t=>{e.beginPath(),t.forEach(([t,r],i)=>i?e.lineTo(t*n,r*n):e.moveTo(t*n,r*n)),e.closePath(),e.stroke()};switch(t){case`sunhat`:e.beginPath(),e.ellipse(0,n*.3,n,n*.3,0,0,Math.PI*2),e.stroke(),e.beginPath(),e.arc(0,n*.2,n*.5,Math.PI,0),e.stroke();break;case`sunglasses`:for(let t of[-.45,.45])e.beginPath(),e.moveTo(t*n,n*.35),e.bezierCurveTo((t-.5)*n,-n*.05,(t-.3)*n,-n*.45,t*n,-n*.18),e.bezierCurveTo((t+.3)*n,-n*.45,(t+.5)*n,-n*.05,t*n,n*.35),e.stroke();e.beginPath(),e.moveTo(-n*.15,-n*.15),e.lineTo(n*.15,-n*.15),e.stroke();break;case`sunscreen`:Df(e,-n*.3,-n*.5,n*.6,n*1.3,n*.15),e.stroke(),e.strokeRect(-n*.15,-n*.8,n*.3,n*.3);break;case`floaties`:i(-n*.45,0,n*.42),i(-n*.45,0,n*.18),i(n*.45,0,n*.42),i(n*.45,0,n*.18);break;case`swimsuit`:a([[-.5,-.9],[-.25,-.9],[0,-.4],[.25,-.9],[.5,-.9],[.45,.1],[.6,.8],[0,.5],[-.6,.8],[-.45,.1]]);break;case`duck`:i(0,n*.25,n*.55),i(n*.4,-n*.4,n*.32),a([[.7,-.45],[1,-.35],[.7,-.25]]);break;case`teddy`:i(0,-n*.35,n*.4),i(-n*.35,-n*.72,n*.16),i(n*.35,-n*.72,n*.16),i(0,n*.45,n*.48);break;case`bucket`:a([[-.6,-.4],[.6,-.4],[.45,.8],[-.45,.8]]),e.beginPath(),e.arc(0,-n*.4,n*.6,Math.PI,0),e.stroke();break;case`camera`:Df(e,-n*.8,-n*.45,n*1.6,n*1,n*.15),e.stroke(),i(0,n*.05,n*.32),e.strokeRect(-n*.6,-n*.65,n*.4,n*.2);break;case`pillow`:Df(e,-n*.9,-n*.45,n*1.8,n*.9,n*.35),e.stroke();break;case`fan`:i(0,-n*.15,n*.6),i(0,-n*.15,n*.1);for(let t=0;t<3;t++){let i=r*9+t*Math.PI*2/3;e.beginPath(),e.ellipse(Math.cos(i)*n*.3,-n*.15+Math.sin(i)*n*.3,n*.26,n*.12,i,0,Math.PI*2),e.stroke()}e.beginPath(),e.moveTo(0,n*.45),e.lineTo(0,n*.85),e.moveTo(-n*.4,n*.88),e.lineTo(n*.4,n*.88),e.stroke();break;case`mango`:e.beginPath(),e.ellipse(0,n*.1,n*.75,n*.5,-.4,0,Math.PI*2),e.stroke(),e.beginPath(),e.ellipse(n*.3,-n*.55,n*.3,n*.12,-.6,0,Math.PI*2),e.stroke();break;case`gan`:{a([[-.75,-.2],[-.55,-.95],[-.15,-.5],[.15,-.5],[.55,-.95],[.75,-.2],[.5,.45],[0,.65],[-.5,.45]]);for(let t of[-.3,.3])e.beginPath(),e.arc(t*n,-n*.05,n*.14,.1*Math.PI,.9*Math.PI),e.stroke();e.font=`bold ${Math.round(n*.6)}px Fredoka, sans-serif`,e.fillStyle=`#7FE9FF`;let t=r*.8%1;e.globalAlpha=1-t,e.fillText(`z`,n*.7,-n*(.6+t*.8)),e.globalAlpha=1;break}default:i(0,0,n*.6)}}function Df(e,t,n,r,i,a){e.beginPath(),e.moveTo(t+a,n),e.arcTo(t+r,n,t+r,n+i,a),e.arcTo(t+r,n+i,t,n+i,a),e.arcTo(t,n+i,t,n,a),e.arcTo(t,n,t+r,n,a),e.closePath()}var Of=Math.PI*2,kf=`#FFFFFF`,Af=`#FF9DB8`,jf=`#3A3350`;function Mf(e,t){let n=new K,r=[],i=[],a=(...e)=>r.push(...e),o=(...e)=>i.push(...e);switch(e){case`sunhat`:{let e=Y.butter;a(X.sphere(.27,e,{at:[0,.022,0],scale:[1,.075,1]},28),X.torus(.258,.017,e,{at:[0,.024,0],rot:[Math.PI/2,0,0]}),X.sphere(.14,e,{at:[0,.055,0],scale:[1,.86,1]},22),X.cyl(.143,.143,.045,Y.hotpink,{at:[0,.085,0]},22),...[-1,1].map(e=>X.sphere(.042,Y.hotpink,{at:[e*.05,.09,.14],rot:[0,0,e*.5],scale:[1.35,.8,.45]})),X.sphere(.022,Y.hotpink,{at:[0,.088,.152]}),...[-1,1].map(e=>X.capsule(.014,.05,Y.hotpink,{at:[e*.03,.04,.16],rot:[.3,0,e*.45]})));for(let e=0;e<6;e++){let t=e/6*Of;a(X.sphere(.024,`#FFFFFF`,{at:[.135,.1+Math.sin(t)*.03,.035+Math.cos(t)*.03],scale:[.35,1,1]},10))}a(X.sphere(.017,Y.gold,{at:[.145,.1,.035]},10)),o(...[.11,.14].map(e=>X.torus(Math.sqrt(Math.max(0,.14**2-((e-.055)/.86)**2))+.002,.004,`#E8D27A`,{at:[0,e,0],rot:[Math.PI/2,0,0]})));break}case`sunglasses`:{let e=(e,t,n,r)=>[...[-1,1].map(i=>X.sphere(.045*t,n,{at:[e+i*.03*t,.1,r],scale:[1,1,.3]},14)),X.cone(.068*t,.075*t,n,{at:[e,.1-.042*t,r],rot:[Math.PI,0,0],scale:[1,1,.3]},14)],t=[X.capsule(.013,.04,Y.hotpink,{at:[0,.12,.004],rot:[0,0,Math.PI/2]})],n=[];for(let r of[-1,1])t.push(...e(r*.095,1.25,Y.hotpink,0),...e(r*.095,.86,`#4A3F6B`,.008)),t.push(X.sphere(.018,Y.hotpink,{at:[r*.168,.115,-.008]},8),X.box(.17,.016,.016,Y.hotpink,{at:[r*.085,r>0?.112:.094,-.026]})),n.push(X.sphere(.018,kf,{at:[r*.095-.022,.112,.024],scale:[1,.7,.4]},8),X.sphere(.007,kf,{at:[r*.095+.012,.07,.022]},6));for(let e of[...t,...n])e.rotateX(-1.35).translate(0,.014,.05);a(...t),o(...n);break}case`sunscreen`:a(X.rbox(.13,.22,.08,.038,`#FF9F45`,{at:[0,.11,0]}),X.cyl(.042,.052,.035,`#FF9F45`,{at:[0,.235,0]},14),X.cyl(.05,.05,.05,Y.hotpink,{at:[0,.272,0]},16),X.sphere(.05,Y.hotpink,{at:[0,.296,0],scale:[1,.35,1]},14),X.box(.03,.012,.02,Y.hotpink,{at:[0,.3,.045]}),X.rbox(.108,.13,.008,.004,Y.cream,{at:[0,.11,.04]})),o(X.cyl(.026,.026,.006,Y.gold,{at:[0,.132,.046],rot:[Math.PI/2,0,0]},16));for(let e=0;e<8;e++){let t=e/8*Of;o(X.box(.007,.016,.004,Y.gold,{at:[Math.cos(t)*.038,.132+Math.sin(t)*.038,.046],rot:[0,0,t-Math.PI/2]}))}o(...[-.03,0,.03].map(e=>X.sphere(.017,Y.sky,{at:[e,.072,.045],scale:[1,.55,.25]},10))),o(...[-1,1].map(e=>X.sphere(.004,Y.ink,{at:[e*.009,.136,.05]},6)),X.torus(.009,.0025,Y.ink,{at:[0,.128,.05],rot:[0,0,Math.PI]},Math.PI));break;case`floaties`:{let e=(e,t,n)=>{a(X.torus(.085,.05,n,{at:[e,.05,t],rot:[Math.PI/2,0,0]},Math.PI),X.torus(.085,.05,`#FFFFFF`,{at:[e,.05,t],rot:[Math.PI/2,0,Math.PI]},Math.PI),X.cyl(.016,.02,.04,n,{at:[e+.058,.1,t+.058]},10)),o(X.sphere(.02,kf,{at:[e-.05,.095,t+.05],scale:[1.4,.35,.8]},8))};e(-.1,0,`#FF7FA8`),e(.12,.04,`#FF9F45`);break}case`swimsuit`:{let e=`#FF6FAE`,t=`#FFB3D1`;a(X.rbox(.2,.034,.2,.016,e,{at:[0,.017,-.02]}),X.rbox(.14,.034,.08,.016,e,{at:[0,.017,.11]}),...[-1,1].map(t=>X.rbox(.035,.026,.12,.012,e,{at:[t*.065,.018,-.16]})),...Array.from({length:7},(e,n)=>X.sphere(.03,t,{at:[-.105+n*.035,.03,.075],scale:[1,.45,.8]},10)),...Array.from({length:5},(e,n)=>X.sphere(.02,t,{at:[-.07+n*.035,.033,-.115],scale:[1,.45,.8]},8))),o(...[[-.06,-.06],[.03,-.07],[-.02,0],[.065,.02],[-.07,.04],[.01,.12]].map(([e,t])=>X.sphere(.013,`#FFFFFF`,{at:[e,.035,t],scale:[1,.3,1]},8)));break}case`duck`:{let e=`#FFD84D`;a(X.sphere(.12,e,{at:[0,.1,0],scale:[1.25,.8,1]},20),X.cone(.065,.13,e,{at:[-.15,.15,0],rot:[0,0,.95]},12),X.sphere(.085,e,{at:[.09,.235,0]},18),X.sphere(.05,`#FF9F45`,{at:[.18,.215,0],scale:[1.3,.42,.95]},12),...[-1,1].map(e=>X.sphere(.065,`#FFC93D`,{at:[-.02,.13,e*.11],rot:[0,0,-.3],scale:[1.35,.7,.35]},12)),...[-1,1].map(e=>X.sphere(.017,Y.ink,{at:[.145,.265,e*.045]},8))),o(...[-1,1].map(e=>X.sphere(.006,kf,{at:[.157,.272,e*.05]},6)),...[-1,1].map(e=>X.sphere(.02,Af,{at:[.135,.225,e*.07],scale:[1,.6,.4]},8)));break}case`teddy`:{let e=`#C99A6E`,t=`#F2D3B3`;a(X.sphere(.12,e,{at:[0,.12,0],scale:[1,1.05,.95]},18),...[-1,1].map(t=>X.sphere(.052,e,{at:[t*.07,.045,.07],scale:[1,.8,1.3]},12)),...[-1,1].map(t=>X.capsule(.036,.06,e,{at:[t*.11,.15,.03],rot:[.3,0,t*.7]})),X.sphere(.1,e,{at:[0,.3,0]},18),...[-1,1].map(t=>X.sphere(.042,e,{at:[t*.075,.385,0]},12)),X.sphere(.043,t,{at:[0,.278,.083],scale:[1.2,.85,.7]},12),X.sphere(.015,Y.ink,{at:[0,.297,.112],scale:[1.3,.9,.8]},8),...[-1,1].map(e=>X.sphere(.014,Y.ink,{at:[e*.036,.325,.088]},8)),...[-1,1].map(e=>X.sphere(.03,Y.hotpink,{at:[e*.035,.212,.095],rot:[0,0,e*.4],scale:[1.3,.8,.5]},10)),X.sphere(.016,Y.hotpink,{at:[0,.212,.105]},8)),o(X.sphere(.065,t,{at:[0,.11,.087],scale:[1,1.1,.4]},12),...[-1,1].map(e=>X.sphere(.022,`#FFB3C7`,{at:[e*.075,.388,.028],scale:[1,1,.4]},8)),...[-1,1].map(e=>X.sphere(.028,t,{at:[e*.07,.04,.135],scale:[1,1,.3]},8)),...[-1,1].map(e=>X.sphere(.005,kf,{at:[e*.036+.005,.331,.1]},6)),...[-1,1].map(e=>X.sphere(.018,Af,{at:[e*.062,.29,.075],scale:[1,.6,.4]},8)));break}case`bucket`:a(X.cyl(.13,.1,.2,Y.sky,{at:[0,.1,0]},20),X.torus(.13,.016,`#7FC4F0`,{at:[0,.2,0],rot:[Math.PI/2,0,0]}),X.torus(.12,.012,Y.hotpink,{at:[0,.2,0]},Math.PI),...[-1,1].map(e=>X.sphere(.02,Y.hotpink,{at:[e*.12,.2,0]},8)),X.cyl(.014,.014,.25,Y.gold,{at:[.2,.19,.04],rot:[0,0,.35]},8),X.cyl(.018,.018,.07,Y.gold,{at:[.155,.31,.04],rot:[0,0,.35+Math.PI/2]},8),X.rbox(.08,.1,.016,.02,Y.hotpink,{at:[.25,.04,.04],rot:[0,0,.35]})),o(X.sphere(.112,`#F2D9A6`,{at:[0,.2,0],scale:[1,.12,1]},18));for(let e=0;e<5;e++){let t=e/5*Of;o(X.cone(.02,.04,Y.gold,{at:[Math.sin(t)*.017,.105+Math.cos(t)*.017,.118],rot:[-.15,0,-t],scale:[1,1,.25]},6))}break;case`camera`:a(X.rbox(.26,.16,.12,.035,`#6B5BA8`,{at:[0,.08,0]}),X.box(.264,.035,.124,Y.butter,{at:[0,.045,0]}),X.rbox(.1,.05,.08,.018,`#6B5BA8`,{at:[-.01,.17,-.005]}),X.cyl(.062,.066,.08,jf,{at:[0,.08,.095],rot:[Math.PI/2,0,0]},20),X.torus(.06,.012,Y.gold,{at:[0,.08,.135]}),X.torus(.066,.008,Y.gold,{at:[0,.08,.1]}),X.cyl(.046,.046,.01,`#A8DCFF`,{at:[0,.08,.134],rot:[Math.PI/2,0,0]},18),X.rbox(.055,.032,.02,.008,Y.cream,{at:[-.085,.13,.062]}),X.cyl(.02,.02,.02,Y.hotpink,{at:[.085,.168,0]},12),...[-1,1].map(e=>X.torus(.02,.006,Y.ink,{at:[e*.132,.14,0],rot:[0,Math.PI/2,0]}))),o(X.sphere(.014,kf,{at:[-.018,.098,.141],scale:[1,.8,.3]},8),X.sphere(.006,kf,{at:[.015,.065,.141]},6),X.sphere(.01,kf,{at:[-.095,.135,.073],scale:[1.4,.8,.3]},6));break;case`pillow`:{a(X.sphere(.22,Y.cream,{at:[0,.07,0],scale:[1,.32,.68]},24));for(let e of[-1,1])for(let t of[-1,1])a(X.cone(.055,.07,Y.cream,{at:[e*.175,.07,t*.1],rot:[0,-e*t*.6,-e*Math.PI/2],scale:[1,1,.55]},10));let e=(e,t)=>.07+.0704*Math.sqrt(Math.max(0,1-(e/.22)**2-(t/.15)**2));for(let[t,n]of[[-.12,-.05],[-.04,.05],[.05,-.04],[.13,.04],[-.13,.06],[.04,.08]]){let r=e(t,n);o(...[-1,1].map(e=>X.sphere(.014,Y.hotpink,{at:[t+e*.011,r,n-.005],scale:[1,.35,1]},8)),X.cone(.021,.024,Y.hotpink,{at:[t,r,n+.012],rot:[Math.PI/2,0,0],scale:[1,.35,1]},8))}break}case`fan`:{a(X.cyl(.11,.13,.05,Y.lavenderDark,{at:[0,.025,0]},20),X.cyl(.02,.02,.2,Y.lavenderDark,{at:[0,.15,-.01]},10),X.sphere(.055,Y.lavenderDark,{at:[0,.3,-.045],scale:[1,1,1.15]},14),X.cyl(.024,.024,.02,Y.hotpink,{at:[.06,.055,.06]},10),X.torus(.125,.013,Y.lavender,{at:[0,.3,.022]}),X.torus(.115,.01,Y.lavender,{at:[0,.3,-.018]})),o(...[0,1,2,3].map(e=>X.box(.24,.006,.006,Y.lavender,{at:[0,.3,.026],rot:[0,0,e*Math.PI/4]})),X.sphere(.022,Y.lavender,{at:[0,.3,.028],scale:[1,1,.4]},10));let e=new K;e.position.set(0,.3,.004),e.add(Ed([0,1,2].map(e=>X.sphere(.1,Y.mint,{at:[Math.cos(e*Of/3)*.055,Math.sin(e*Of/3)*.055,0],rot:[0,0,e*Of/3],scale:[.95,.45,.1]},12)).concat(X.sphere(.025,Y.hotpink,{},10)),[],t,1.5)),e.name=`blades`,n.add(e);break}case`mango`:a(X.sphere(.11,`#FFB83D`,{at:[0,.09,0],rot:[0,0,.3],scale:[1.3,.85,.9]},20),X.sphere(.07,`#FFB83D`,{at:[.075,.075,.005],scale:[1,.95,1.05]},14),X.cyl(.012,.015,.05,`#7A5A3A`,{at:[-.1,.16,0],rot:[0,0,.55]},6),X.sphere(.06,`#7FCB8F`,{at:[-.135,.18,.035],rot:[.35,.6,.3],scale:[1.6,.22,.65]},12)),o(X.sphere(.085,`#FF8466`,{at:[.05,.115,.035],rot:[0,0,.3],scale:[1,.72,.68]},14),X.sphere(.022,kf,{at:[-.03,.155,.06],scale:[1.4,.5,.6]},8));break;case`snacks`:a(X.sphere(.1,Y.mint,{at:[0,.11,0],scale:[1,1.1,.75]},18),X.cyl(.028,.05,.04,Y.mint,{at:[0,.225,0]},12),X.sphere(.06,Y.mint,{at:[0,.262,0],scale:[1.35,.55,.8]},12),...[-1,1].map(e=>X.sphere(.028,Y.hotpink,{at:[e*.035,.225,.04],rot:[0,0,e*.4],scale:[1.3,.8,.5]},10)),X.sphere(.015,Y.hotpink,{at:[0,.225,.048]},8),X.rbox(.11,.055,.08,.015,Y.cream,{at:[.15,.028,.04]}),X.rbox(.116,.02,.086,.008,`#7FCB8F`,{at:[.15,.064,.04]})),o(X.sphere(.035,`#FFB83D`,{at:[0,.11,.072],scale:[1.3,.85,.35]},10),X.sphere(.012,`#7FCB8F`,{at:[-.035,.135,.07],scale:[1.4,.5,.4]},6),...[-.04,.04].map(e=>X.box(.008,.06,.003,`#B8F0DD`,{at:[e*1.4,.12,.074]})));break;default:a(X.rbox(.2,.2,.2,.05,Y.lavender,{at:[0,.1,0]}))}return n.add(Ed(r,i,t,2)),n}function Nf(e,t,n,r=[0,0,0]){let i=[],[a,o,s]=t,c=[1,1,.12];if(e===`heart`)i.push(...[-1,1].map(e=>X.sphere(n*.55,`#FFFFFF`,{at:[a+e*n*.36,o+n*.2,s],scale:c},12)),X.cone(n*.85,n*.95,`#FFFFFF`,{at:[a,o-n*.3,s],rot:[Math.PI,0,0],scale:c},12)),i.push(...[-1,1].map(e=>X.sphere(n*.4,Y.pink,{at:[a+e*n*.36,o+n*.2,s+.004],scale:c},12)),X.cone(n*.62,n*.72,Y.pink,{at:[a,o-n*.24,s+.004],rot:[Math.PI,0,0],scale:c},12));else if(e===`star`){i.push(X.cyl(n*.42,n*.42,.01,Y.gold,{at:[a,o,s],rot:[Math.PI/2,0,0]},10));for(let e=0;e<5;e++){let t=e/5*Of;i.push(X.cone(n*.3,n*.6,Y.gold,{at:[a+Math.sin(t)*n*.55,o+Math.cos(t)*n*.55,s],rot:[0,0,-t],scale:c},6))}}else i.push(X.cyl(n,n,.01,Y.sky,{at:[a,o,s],rot:[Math.PI/2,0,0]},16),X.cyl(n*.45,n*.45,.01,Y.butter,{at:[a,o+n*.1,s+.004],rot:[Math.PI/2,0,0]},14)),i.push(...[-1,1].map(e=>X.sphere(n*.3,`#FFFFFF`,{at:[a+e*n*.35,o-n*.45,s+.006],scale:[1.4,.7,.12]},8)));if(r[0]||r[1]||r[2])for(let e of i)e.translate(-a,-o,-s).rotateX(r[0]).rotateY(r[1]).rotateZ(r[2]).translate(a,o,s);return i}function Pf(e){let t=.92,n=.3,r=.62,i=new K,a=new K;i.add(a);let o=(e,n)=>[-1,1].flatMap(i=>[-1,1].map(a=>X.sphere(.055,Y.gold,{at:[i*(t/2-.035),e,a*(r/2-.035)],scale:[1,n,1]},10)));a.add(Ed([X.rbox(t,n,r,.07,Y.hotpink,{at:[0,n/2,0]}),X.box(.8400000000000001,.02,.54,`#FFD3E6`,{at:[0,.295,0]}),X.box(.926,.02,.626,`#E0337F`,{at:[0,.27,0]}),X.rbox(.05,.035,.03,.01,Y.gold,{at:[t*.18,.27,.322]}),...[-1,1].map(e=>X.box(.06,n*.9,.64,Y.gold,{at:[e*t*.3,n*.47,0]})),...[-1,1].map(e=>X.rbox(.08,.07,.03,.012,`#E8A92A`,{at:[e*t*.3,n*.42,.322]})),...o(.04,.8),...[-1,1].flatMap(e=>[-1,1].map(n=>X.sphere(.038,Y.ink,{at:[e*(t/2-.08),.012,n*(r/2-.08)],scale:[.6,1,1]},10))),X.rbox(.03,.05,.2,.012,Y.ink,{at:[.47200000000000003,n*.55,0]})],[...Nf(`heart`,[-.14,.2,.314],.06),...Nf(`star`,[.13,.1,.314],.05),...Nf(`sun`,[-.375,.13,.314],.04)],e,2));let s=new K;return s.position.set(0,n,-.62/2),s.add(Ed([X.rbox(t,.1,r,.05,Y.hotpink,{at:[0,.05,r/2]}),X.box(.8,.012,.5,`#FFD3E6`,{at:[0,-.002,r/2]}),...[-.15,.15].map(e=>X.box(.05,.008,.45999999999999996,Y.lavender,{at:[e,-.01,r/2]})),...[-1,1].map(e=>X.box(.06,.104,.636,Y.gold,{at:[e*t*.3,.05,r/2]})),X.sphere(.035,Y.gold,{at:[0,.05,.625]}),...[-1,1].flatMap(e=>[-1,1].map(n=>X.sphere(.05,Y.gold,{at:[e*(t/2-.035),.065,r/2+n*(r/2-.035)],scale:[1,.7,1]},10))),...[-1,1].map(e=>X.rbox(.05,.03,.06,.012,Y.gold,{at:[e*.1,.105,r/2]})),X.torus(.1,.024,Y.ink,{at:[0,.1,r/2]},Math.PI),X.capsule(.028,.08,Y.lavender,{at:[0,.198,r/2],rot:[0,0,Math.PI/2]})],Nf(`heart`,[.14,.101,r*.62],.075,[-Math.PI/2,0,0]),e,2)),a.add(s),{root:i,body:a,lid:s,slot:(e,t)=>{let n=Math.floor(e/6),r=e%6,i=t>6?.92:1;return[(-.27+r%3*.27)*i,.27999999999999997+n*.13,(r<3?-.13:.14)*i]},w:t,h:n,d:r}}var Ff=`#6E3FC4`,If=`#E8409A`,Lf=`#FFC23D`,Rf=`#FFC83D`,zf=`#FF9F2E`,Bf=`#FBF8FF`,Vf=`#ECE8F5`,Hf=`#2E2A4A`,Uf=1.35,Wf=2.2,Gf=-6.8,Kf=14,qf=2.6,Jf=3.8;function Yf(e){return e=Math.max(0,Math.min(Kf,e)),e<qf?Uf*(1-(1-e/qf)**2.2)**.5:e>10.2?Uf*(1-.8*((e-10.2)/Jf)**1.3):Uf}function Xf(e){let t=Yf(e);return e<qf?-(Uf-t)*.3:e>10.2?(Uf-t)*.85:0}function Zf(e,{wheelsUp:t=!1}={}){let n=new K;n.add(Qf(e));let r=[...[-1,1].flatMap(e=>{let t=[[-1.3,0],[1.8,0],[3.5,5.6],[2.7,5.6]],n=-e*.07;return[X.prism(t.map(([t,n])=>[t,e*n]),.22,Vf,{at:[0,1.25,0],rot:[Math.PI/2+n,0,0]}),X.prism([[0,0],[.9,0],[1.25,1.2],[.85,1.2]],.12,Ff,{at:[2.7,1.3+.392,e*5.55]}),X.prism([[.7,.9],[1.25,1.2],[.85,1.2]],.14,Lf,{at:[2.7,1.3+.392,e*5.55]})]}),...[-1,1].flatMap(e=>{let t=e*2.5;return[X.cyl(.62,.5,2.1,Bf,{at:[.3,.75,t],rot:[0,0,Math.PI/2]},20),X.torus(.56,.09,`#C9C3D8`,{at:[-.75,.75,t],rot:[0,Math.PI/2,0]}),X.cyl(.5,.5,.05,Hf,{at:[-.72,.75,t],rot:[0,0,Math.PI/2]},20),X.cone(.16,.3,`#C9C3D8`,{at:[-.8,.75,t],rot:[0,0,Math.PI/2]}),X.cone(.32,.5,`#C9C3D8`,{at:[1.6,.75,t],rot:[0,0,-Math.PI/2]}),X.box(1,.5,.16,Vf,{at:[1,1.3,t]})]}),X.prism([[3.4,0],[6.9,0],[7.4,3],[6,3]],.26,Bf,{at:[0,3.3000000000000003,0]}),...[-1,1].flatMap(e=>{let t=(t,n,r)=>[t,n,e*(.13+r)];return[X.cyl(.78,.78,.04,`#FFFFFF`,{at:t(6,5,.02),rot:[Math.PI/2,0,0]},28),X.torus(.76,.05,Ff,{at:t(6,5,.04)},Math.PI*2),X.prism([[-.55,.15],[.45,.42],[.35,-.05],[-.05,-.55]],.04,Rf,{at:t(6,5,.06)}),X.prism([[-.05,-.55],[.35,-.05],[.12,-.08]],.04,`#E8403F`,{at:t(6,5,.08)}),X.sphere(.07,Hf,{at:t(6.2,5.28,.08),scale:[1,1,.4]})]}),...[-1,1].map(e=>X.prism([[5.2,0],[6.6,0],[7.4,2.5],[6.8,2.5]].map(([t,n])=>[t,e*n]),.16,Vf,{at:[0,2.95,0],rot:[Math.PI/2,0,0]})),...t?[]:[[-5,0,.55],[1.6,1.2,.95],[1.6,-1.2,.95]].flatMap(([e,t,n])=>[X.cyl(.08,.08,n,`#D8D2E6`,{at:[e,.42+n/2,t]}),...[-.2,.2].flatMap(n=>[X.torus(.3,.14,Y.ink,{at:[e,.42,t+n]}),X.cyl(.16,.16,.2,`#D8D2E6`,{at:[e,.42,t+n],rot:[Math.PI/2,0,0]})])])];n.add(Q(Z(r),e,2));let i=[-3.5,2.15,1.37],a=new K;a.position.set(i[0]-.5,i[1],i[2]),a.add(Q(Z([X.rbox(1,1.7,.08,.12,Ff,{at:[.5,0,0]}),X.cyl(.18,.18,.04,`#A8DCFF`,{at:[.5,.35,.04],rot:[Math.PI/2,0,0]}),X.box(.12,.05,.05,Y.cream,{at:[.85,-.1,.05]})]),e,2)),a.userData.pick=`plane-door`,n.add(a);let o=[],s=[];for(let e=0;e<7;e++){let t=.2+(e+1)*((i[1]-.95-.2)/7),n=i[2]+3.2-(e+1)*(2.9/7);o.push([i[0],t,n]),s.push(X.box(1.2,.1,.42,Y.cream,{at:[i[0],t-.05,n]}))}s.push(X.box(1.4,.25,3.6,`#FFC83D`,{at:[i[0],.3,i[2]+1.9]}),...[-1,1].map(e=>X.box(.06,.06,3.3,Y.hotpink,{at:[i[0]+e*.62,1.6,i[2]+1.6],rot:[-.62,0,0]})),...[[-.5,.6],[.5,.6],[-.5,3.4],[.5,3.4]].map(([e,t])=>X.torus(.16,.07,Y.ink,{at:[i[0]+e,.16,i[2]+t],rot:[0,Math.PI/2,0]})));let c=Q(Z(s),e,2);return n.add(c),{root:n,door:a,stairs:c,doorAt:i,steps:o}}function Qf(e){let t=[];for(let e=0;e<=90;e++){let n=e/90,r=Kf*(n<.25?.25*(n/.25)**1.6:n>.75?1-.25*((1-n)/.25)**1.6:n);t.push(new B(e===0?0:Yf(r),r))}t.push(new B(0,Kf));let n=new Ho(t,56,-Math.PI/2),r=n.attributes.position,i=n.attributes.uv;for(let e=0;e<r.count;e++){let t=r.getX(e),n=r.getY(e),a=r.getZ(e),o=i.getX(e);r.setXYZ(e,Gf+n,Wf-t+Xf(n),a),i.setXY(e,n/Kf,o)}n.computeVertexNormals();let a=e.add(tp()),o=e.add(new Zo({map:a,gradientMap:ud()})),s=new K;s.add(new G(e.add(n),o));let c=Sd(n,2);return e.add(c.geometry),s.add(c),s}var $f=2048,ep=1024;function tp(){let e=document.createElement(`canvas`);e.width=$f,e.height=ep/2;let t=e.getContext(`2d`),n=(e,t)=>{let n=Math.max(-1,Math.min(1,t/Math.max(Yf(e),.05)));return[e/Kf*$f,(1-Math.acos(-n)/Math.PI)*(ep/2)]},r=(e,r)=>{t.beginPath(),e.forEach(([e,r],i)=>{let[a,o]=n(e,r);i===0?t.moveTo(a,o):t.lineTo(a,o)}),t.closePath(),t.fillStyle=r,t.fill()},i=(e,t=16)=>{let n=[];return e.forEach((r,i)=>{let a=e[(i+1)%e.length];for(let e=0;e<t;e++)n.push([r[0]+(a[0]-r[0])*e/t,r[1]+(a[1]-r[1])*e/t])}),n},a=(e,t,n,r=24)=>Array.from({length:r+1},(i,a)=>{let o=a/r,s=1-o;return[s*s*e[0]+2*s*o*t[0]+o*o*n[0],s*s*e[1]+2*s*o*t[1]+o*o*n[1]]}),o=(e,t,n,i,a)=>r(Array.from({length:40},(r,a)=>[e+Math.cos(a/40*Math.PI*2)*n,t+Math.sin(a/40*Math.PI*2)*i]),a);t.fillStyle=Bf,t.fillRect(0,0,$f,ep/2);let s=e=>a([5.6+e,-2],[6.6+e,.1],[9+e,2]),c=(e,t,n)=>r([...s(e),...s(t).reverse()],n);r([[-1,2],[-1,-2],...s(0)],Ff),c(0,.5,If),c(.5,1,Lf),c(1,1.15,Ff);let l=(e,t,n,i,o)=>r([...a([e,t],[e+n*.45,t+i*1.4],[e+n,t+i*1.6]),...a([e+n,t+i*1.6],[e+n*.5,t-i*.2],[e+n*.1,t-i])],o);l(9.8,-1.2,3.2,.32,Ff),l(10.6,-1,2.8,.26,If),l(11.4,-.85,2.3,.2,Lf),r([[-1,2],...a([.85,2],[1.05,.4],[1.75,-.32]),...a([1.75,-.32],[1.2,-.9],[1,-2]),[-1,-2]],Rf),r([[-1,-.32],...a([0,-.38],[.9,-.28],[1.75,-.32]),...a([1.75,-.32],[1.2,-.9],[1,-2]),[-1,-2]],zf),r([...a([.05,-.32],[.9,-.22],[1.78,-.3]),...a([1.78,-.36],[.9,-.32],[.05,-.4])],Hf),o(1.72,-.24,.12,.12,If),r(i([[1.2,.55],[2.1,.62],[2.05,.92],[1.35,.85]],6),Hf),r(i([[1.62,.6],[1.68,.6],[1.62,.9],[1.56,.9]],4),Ff),o(2.15,.08,.36,.4,`#FFFFFF`),o(2.08,.04,.22,.26,Hf),o(2,.14,.07,.08,`#FFFFFF`),r(i([[2.82,-.85],[3.78,-.85],[3.78,.82],[2.82,.82]],8),`#3B3352`);for(let e=0;e<16;e++){let t=4.3+e*.62;if(t>10.2+.6)break;o(t,.42,.17,.21,Hf),o(t,.42,.12,.15,`#A8DCFF`)}let u=document.createElement(`canvas`);u.width=$f,u.height=ep;let d=u.getContext(`2d`);d.drawImage(e,0,0),d.save(),d.translate(0,ep),d.scale(1,-1),d.drawImage(e,0,0),d.restore();let f=new ga(u);return f.colorSpace=dt,f.anisotropy=4,f}var np=7,rp=new V,ip=new V,ap=class{renderer;events;scene=new Si;rig=new df;bag=new pf;lights=md(this.scene);w=1;h=1;time=0;lastTouch=0;stats={fps:0,p95:0,calls:0,tris:0};anchorEls=new Map;hintEl=null;raycaster=new Us;hopper=new cp(this.scene);touches=0;disposed=!1;constructor(e,t){this.renderer=e,this.events=t,this.scene.background=new U(Y.sky),dd()}hintAt(){return null}pickRoots(){return[]}get calm(){return!1}makeFamily(e){let t=new af(this.bag),n=new Map;for(let t of e){let e=of.find(e=>e.id===t);e&&n.set(t,new lf({...e,spot:null},this.bag))}return{kaylee:t,members:n}}put(e,t,n,r,i,a=0){sp(e,t,n,r,i,a)}hop(e,t,n,r={}){this.hopper.hop(e,t,n,r)}get hopping(){return this.hopper.busy}setSize(e,t,n){this.w=e,this.h=t,this.rig.setSize(e,t,n),gd(e,t),this.rig.setShot(this.shot(),!0)}setAnchorElements(e){this.anchorEls=e}setHintElement(e){this.hintEl=e}update(e){this.time+=e,this.hopper.update(e),this.step(e,this.time),this.rig.setShot(this.shot()),this.rig.update(e)}render(){let e=this.renderer;e.render(this.scene,this.rig.camera),this.stats.calls=e.info.render.calls,this.stats.tris=e.info.render.triangles}pointerDown(){this.lastTouch=this.time}pointerMove(e,t,n,r,i){}pointerUp(){}tap(e,t,n){this.lastTouch=this.time,this.touches++,this.onTap(n??this.pick(e,t),e,t)}pick(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.rig.camera);for(let e of this.raycaster.intersectObjects(this.pickRoots(),!0)){let t=e.object;for(;t&&t.userData.pick===void 0;)t=t.parent;if(t&&op(t))return t.userData.pick}return null}ndc(e,t){return new B(e/this.w*2-1,-(t/this.h)*2+1)}placeAnchors(){let e=this.rig.camera;ip.set(1,0,0).applyQuaternion(e.quaternion);for(let[e,t]of this.anchorEls){let n=this.anchorAt(e),r=n?this.toScreen(n.at,n.r,n.max):null;if(r){t.style.transform=`translate3d(${(r.x-r.size/2).toFixed(1)}px, ${(r.y-r.size/2).toFixed(1)}px, 0)`,t.style.width=t.style.height=`${r.size.toFixed(0)}px`,t.style.zIndex=String(r.z+(n?.prio??(e.startsWith(`family:`)?0:2))*3e3);let i=n?.glow?`0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)`:``;t.style.boxShadow!==i&&(t.style.boxShadow=i)}let i=r?``:`none`;t.style.display!==i&&(t.style.display=i)}let t=this.hintEl;if(t){let e=this.time-this.lastTouch>np?this.hintAt():null,n=e?this.toScreen(e,.3):null;t.style.display=n?``:`none`,n&&(t.style.transform=`translate3d(${n.x.toFixed(1)}px, ${n.y.toFixed(1)}px, 0)`)}}toScreen(e,t,n=150){let r=this.rig.camera,a=e.clone().project(r);if(a.z>1||Math.abs(a.x)>1.02||Math.abs(a.y)>1.02)return null;let o=e.clone().addScaledVector(ip,t).project(r);return{x:(a.x+1)/2*this.w,y:(1-a.y)/2*this.h,size:i(Math.abs(o.x-a.x)*this.w,64,n),z:Math.round((1-a.z)*1e4)}}memory(){return{...this.renderer.info.memory}}dispose(){this.disposed=!0,this.scene.clear(),this.bag.dispose()}};function op(e){for(let t=e;t;t=t.parent)if(!t.visible)return!1;return!0}function sp(e,t,n,r,i,a=0){e instanceof af?(e.place(t,n,r,a),e.setPose(i)):e.place(t,i===`sit`?n-.1*e.height:n,r,a,i)}var cp=class{scene;hops=[];constructor(e){this.scene=e}hop(e,t,n,r={}){this.hops=this.hops.filter(t=>t.c!==e),this.hops.push({c:e,parent:t,to:n.clone(),o:r,t:0,delay:r.delay??0})}get busy(){return this.hops.length>0}has(e){return this.hops.some(t=>t.c===e)}update(e){for(let n of[...this.hops]){if(n.delay>0){n.delay-=e;continue}if(!n.from){this.scene.updateMatrixWorld();let e=n.c.root;n.parent.attach(e),e.rotation.set(0,e.rotation.y,0),e.scale.set(1,1,1),n.from=e.position.clone(),n.c instanceof lf&&n.c.pose===`sit`&&(n.from.y+=.1*n.c.height),$.boing()}n.t+=e/(n.o.dur??.42);let r=Math.min(1,n.t);rp.lerpVectors(n.from,n.to,r),rp.y+=t(r)*(n.o.arc??.6),sp(n.c,rp.x,rp.y,rp.z,r<1?`stand`:n.o.pose??`stand`,n.o.face??0),r>=1&&(this.hops.splice(this.hops.indexOf(n),1),n.c.react(`wiggle`),$.thump(),n.o.done?.())}}},lp=[{id:`suitcase`,label:`Suitcase`,kind:`thing`},{id:`screen`,label:`X-ray screen`,kind:`thing`},{id:`officer`,label:`Officer`,kind:`thing`},{id:`belt`,label:`Belt`,kind:`thing`},{id:`plane-door`,label:`Plane door`,kind:`thing`},{id:`plane`,label:`Plane`,kind:`thing`},{id:`pass`,label:`Boarding pass`,kind:`thing`},{id:`flag`,label:`Thai flag`,kind:`thing`},{id:`family:ji`,label:`Mommy`,kind:`family`},{id:`family:nick`,label:`Daddy`,kind:`family`},{id:`family:kaylee`,label:`Kaylee`,kind:`family`}],up={species:`elephant`,height:1.6,fur:`#C2BCE0`,light:`#E8E4F6`,dark:`#A39CCB`,ear:`#FFB8CC`,outfit:{kind:`shirt`,color:`#4A5A9C`},extras:[`officer-cap`]},dp={x0:-3.4,x1:2.1,y:.62,z:0},fp={x0:-.9,x1:.7},pp=3.6,mp=new V(11.5,0,-2.6),hp={kaylee:[-3,1.15],ji:[-4.3,.45],nick:[-4,1.65],suitcase:[-2.45,.9]},gp=new V,_p=class extends ap{packed;suitcase;plane;officer;officerLife;officerHop=1;pass;stampMark;stamp;flag;flagWave=1;hinted=new Set;screen;riders;dashes=new K;doorsL;doorsR;phase=`belt`;phaseT=0;slide=0;shown=0;laughed=!1;stamped=!1;doorK=0;planeBounce=1;drag=null;constructor(e,t,n){super(e,t),this.packed=n;let{scene:r,bag:i}=this;r.background=new U(`#BFE6FF`),this.rig.fov=34,r.add(Q(Z([X.box(10.5,.1,14,`#F4EEFF`,{at:[-1.6,-.05,3.5]}),...Array.from({length:10},(e,t)=>X.box(.03,.005,13.9,`#E2DAF6`,{at:[-6.6+t*1.05,.002,3.5]}))]),i,0),Q(Z([X.box(10.5,3.4,.2,`#FFF7F0`,{at:[-1.6,1.7,-3.45]}),X.box(10.5,.3,.22,Y.lavender,{at:[-1.6,3.2,-3.44]}),X.rbox(2.2,.6,.08,.06,Y.sky,{at:[-3.6,2.5,-3.34]}),X.rbox(2.2,.6,.08,.06,Y.mint,{at:[.8,2.5,-3.34]})]),i,2),Q(Z([X.rbox(2.6,1.2,.1,.06,`#2E3566`,{at:[-1.4,2.35,-3.3]}),...[0,1,2,3].flatMap(e=>[X.box(1.6,.14,.02,[`#8FE3C8`,`#FBEA9A`,`#FFB3D1`,`#A8DCFF`][e],{at:[-1.2,2.72-e*.24,-3.24]}),X.box(.2,.05,.02,`#FFFFFF`,{at:[-2.35,2.72-e*.24,-3.23]}),X.box(.06,.16,.02,`#FFFFFF`,{at:[-2.37,2.72-e*.24,-3.225]})]),X.cyl(.32,.32,.06,Y.cream,{at:[.7,2.45,-3.32],rot:[Math.PI/2,0,0]},24),X.torus(.32,.03,Y.hotpink,{at:[.7,2.45,-3.3]}),X.box(.03,.2,.02,Y.ink,{at:[.7,2.53,-3.27]}),X.box(.14,.03,.02,Y.ink,{at:[.76,2.45,-3.27]}),...Array.from({length:14},(e,t)=>X.box(.18,.18,.04,Y.gold,{at:[-6.6+t*.75,3.02,-3.32],rot:[0,0,Math.PI/4]})),...[-5.6,-5,-4.4,-3.8].flatMap(e=>[X.rbox(.5,.12,.5,.05,Y.lavenderDark,{at:[e,.45,-2.9]}),X.rbox(.5,.5,.1,.05,Y.lavenderDark,{at:[e,.75,-3.12]}),X.box(.05,.4,.4,`#D8D2E6`,{at:[e-.27,.2,-2.9]})]),...[-6.4,2.6].flatMap(e=>[X.cyl(.24,.18,.6,`#C9B5F7`,{at:[e,.3,-2.95]}),X.cyl(.02,.02,.7,`#7FCB8F`,{at:[e,.95,-2.95]}),...[0,1,2,3,4].map(t=>X.sphere(.09,t%2?Y.hotpink:`#FF9CC8`,{at:[e+Math.sin(t*1.3)*.14,1+t*.12,-2.95+Math.cos(t*1.3)*.1],scale:[1,.7,.5]})),...[-1,1].map(t=>X.sphere(.16,`#7FCB8F`,{at:[e+t*.14,.66,-2.95],scale:[1,.3,.55],rot:[0,0,t*.4]}))])]),i,2),Q(Z([X.box(30,.1,22,`#C9C4DE`,{at:[18.6,-.06,1]}),...Array.from({length:6},(e,t)=>X.box(1.6,.01,.16,Y.butter,{at:[5.6+t*3,.002,2.4]}))]),i,0)),r.add(Q(Z([X.box(dp.x1-dp.x0,dp.y-.06,.95,`#B9B2CC`,{at:[(dp.x0+dp.x1)/2,(dp.y-.06)/2,dp.z]}),X.box(dp.x1-dp.x0,.06,.8,`#4A4458`,{at:[(dp.x0+dp.x1)/2,dp.y-.03,dp.z]}),X.rbox(fp.x1-fp.x0,1.1,1.25,.1,Y.lavenderDark,{at:[(fp.x0+fp.x1)/2,dp.y+.55,dp.z],scale:[1,1,1]}),...[fp.x0-.01,fp.x1+.01].flatMap(e=>Array.from({length:5},(t,n)=>X.box(.02,.62,.15,`#5A6FB0`,{at:[e,dp.y+.32,-.36+n*.18]}))),X.rbox(.8,.86,.5,.05,`#D9D2EE`,{at:[1.35,.43,-.45]}),X.box(.84,.05,.54,Y.lavenderDark,{at:[1.35,.88,-.45]}),X.cyl(.06,.08,1.4,`#D8D2E6`,{at:[-.1,.7,-1.25]}),X.cyl(.35,.4,.08,`#D8D2E6`,{at:[-.1,.04,-1.25]}),X.rbox(1.42,.98,.1,.05,Y.ink,{at:[-.1,1.85,-1.27]})]),i,2));for(let e=dp.x0;e<dp.x1;e+=.3)this.dashes.add(new G(i.add(X.box(.06,.005,.76,`#7E7894`,{at:[e,dp.y+.003,dp.z]})),i.add(new Er({color:`#7E7894`}))));r.add(this.dashes);let a=document.createElement(`canvas`);a.width=384,a.height=256;let o=i.add(new ga(a));o.colorSpace=dt;let s=new G(i.add(new Wo(1.3,.86)),i.add(new Er({map:o})));s.position.set(-.1,1.85,-1.21),s.userData.pick=`screen`,r.add(s),this.screen={canvas:a,tex:o,mesh:s,wiggle:1},Tf(a,this.packed,0,0),o.needsUpdate=!0;let c=i.add(new Er({color:`#CFEFFF`,transparent:!0,opacity:.3,depthWrite:!1}));r.add(Q(Z([X.box(.12,3.4,.12,`#D8D2E6`,{at:[pp,1.7,-3.4]}),X.box(.12,.12,6.4,`#D8D2E6`,{at:[pp,3.35,-.2]}),...[-1.4,2.2].map(e=>X.box(.12,3.4,.12,`#D8D2E6`,{at:[pp,1.7,e]}))]),i,1.5)),r.add(new G(i.add(X.box(.03,3.2,1.9,`#FFFFFF`,{at:[pp,1.6,-2.4]})),c));let l=e=>{let t=new K;return t.position.set(pp,0,e),t.add(new G(i.add(X.box(.04,2.6,1.75,`#FFFFFF`,{at:[0,1.3,0]})),c)),t.add(Q(Z([X.box(.06,2.6,.06,`#D8D2E6`,{at:[0,1.3,e<.4?-.88:.88]}),X.box(.06,.06,1.75,`#D8D2E6`,{at:[0,2.6,0]})]),i,1.5)),r.add(t),t};this.doorsL=l(-.45),this.doorsR=l(1.3),this.plane=Zf(i),this.plane.root.position.copy(mp),this.plane.root.userData.pick=`plane`,r.add(this.plane.root),this.officer=Zd(up,i),this.officer.root.position.set(1.35,0,-1.2),this.officer.root.rotation.y=-.35,this.officer.root.userData.pick=`officer`,r.add(this.officer.root),this.officerLife=new tf(this.officer,`officer`),this.stamp=Q(Z([X.cyl(.035,.03,.14,`#C99A6E`,{at:[0,.08,0]}),X.sphere(.05,`#C99A6E`,{at:[0,.16,0]}),X.rbox(.14,.05,.1,.015,Y.hotpink,{at:[0,0,0]})]),i,1.5),this.stamp.position.set(.02,-.26,.06),this.stamp.rotation.x=Math.PI,this.officer.armR.add(this.stamp),this.pass=new K,this.pass.position.set(1.32,.915,-.4),this.pass.rotation.y=-.2,this.pass.add(Q(Z([X.box(.42,.012,.2,`#FFFFFF`),X.box(.42,.014,.05,Y.hotpink,{at:[0,.001,-.075]}),...[0,1,2].map(e=>X.box(.1,.014,.012,`#C9C1E6`,{at:[-.12+e*.12,.001,0]}))]),i,1.5)),this.pass.userData.pick=`pass`,this.stampMark=Q(Z([X.cyl(.06,.06,.016,Y.hotpink,{},18),X.cyl(.04,.04,.018,`#FFFFFF`,{},18),X.sphere(.022,Y.hotpink,{scale:[1,.4,1]})]),i,0),this.stampMark.position.set(.1,.002,.03),this.stampMark.visible=!1,this.pass.add(this.stampMark),r.add(this.pass),this.flag=new K,this.flag.position.set(3,0,-2.9),this.flag.add(Q(Z([X.cyl(.03,.04,2.9,`#D8D2E6`,{at:[0,1.45,0]}),X.sphere(.06,Y.gold,{at:[0,2.93,0]}),X.cyl(.18,.22,.1,`#D8D2E6`,{at:[0,.05,0]})]),i,1.5));let u=new K;u.position.set(.03,2.75,0),u.add(Q(Z([[`#E8434F`,.06],[`#FFFFFF`,.06],[`#2D4A9C`,.12],[`#FFFFFF`,.06],[`#E8434F`,.06]].map(([e,t],n,r)=>{let i=r.slice(0,n).reduce((e,[,t])=>e+t,0);return X.box(.54,t,.02,e,{at:[.27,-i-t/2,0]})})),i,1.5)),u.name=`cloth`,this.flag.add(u),this.flag.userData.pick=`flag`,r.add(this.flag),this.suitcase=Pf(i),this.suitcase.root.position.set(hp.suitcase[0],0,hp.suitcase[1]),this.suitcase.root.rotation.y=-Math.PI/2,this.suitcase.root.scale.setScalar(.8),this.suitcase.root.userData.pick=`suitcase`,r.add(this.suitcase.root);let{kaylee:d,members:f}=this.makeFamily([`ji`,`nick`]);d.wear(p(this.packed)),d.glassesUp(!0),this.riders={kaylee:d,ji:f.get(`ji`),nick:f.get(`nick`)};for(let e of[`kaylee`,`ji`,`nick`]){let t=this.riders[e];r.add(t.root);let[n,i]=hp[e];this.put(t,n,0,i,`stand`,35)}setTimeout(()=>this.phase===`belt`&&this.events.say(h.trip.airport.start),500)}pickRoots(){return[this.suitcase.root,this.screen.mesh,this.officer.root,this.pass,this.flag,this.plane.root,...Object.values(this.riders).map(e=>e.root)]}pointerDown(e,t){super.pointerDown(),this.phase===`belt`&&e!==void 0&&t!==void 0&&this.pick(e,t)===`suitcase`&&(this.drag={x:e,y:t,on:!1})}pointerMove(e,t,n,r,a){let o=this.drag;if(!a||!o||this.phase!==`belt`||(!o.on&&Math.hypot(e-o.x,t-o.y)>12&&(o.on=!0),!o.on))return;let s=this.floorAt(e,t,.35);s&&this.suitcase.root.position.set(i(s.x,-5,2),.35,i(s.z,-1.2,2))}pointerUp(){let e=this.drag;if(this.drag=null,!e?.on)return;let t=this.suitcase.root.position;Math.abs(t.z-dp.z)<1.3&&t.x<fp.x0?this.onBelt():this.suitcase.root.position.set(hp.suitcase[0],0,hp.suitcase[1])}floorAt(e,t,n){let r=this.rig.camera,i=this.ndc(e,t),a=new V(i.x,i.y,-1).unproject(r),o=new V(i.x,i.y,1).unproject(r).sub(a);if(Math.abs(o.y)<1e-6)return null;let s=(n-a.y)/o.y;return s>0?a.addScaledVector(o,s):null}onTap(e){switch(e){case`suitcase`:this.phase===`belt`?this.onBelt():($.boing(),this.suitcase.body.scale.y=.85);return;case`belt`:$.pop(),this.slide+=.05;return;case`screen`:this.screen.wiggle=0,$.boop();return;case`officer`:this.officerHop=0,$.haha();return;case`pass`:this.officerHop=0,$.stamp(),this.stampMark.visible=!0,this.pass.position.y=.95;return;case`flag`:this.flagWave=0,$.fwip();return;case`plane-door`:this.phase===`doors`?this.board():this.bouncePlane();return;case`plane`:this.phase===`doors`?this.board():this.bouncePlane();return;case`family:ji`:case`family:nick`:case`family:kaylee`:this.riders[e.slice(7)].react(`hop`),$.boing();return}}bouncePlane(){this.planeBounce=0,$.boop()}onBelt(){if(this.phase!==`belt`)return;this.phase=`scan`,this.phaseT=0;let e=this.suitcase.root;e.position.set(dp.x0+.5,dp.y,dp.z),e.rotation.y=0,$.thump(),$.whir(),this.riders.kaylee.react(`hop`)}board(){this.phase=`board`,this.phaseT=0;let e=this.riders.kaylee;e.glassesUp(!1),e.setWind(.8);let t=this.plane.steps.map(e=>this.plane.root.localToWorld(new V(...e))),n=t[0].clone().setY(0).add(new V(0,0,.7)),r=t[t.length-1];[`kaylee`,`ji`,`nick`].forEach((e,i)=>{let a=this.riders[e],o=this.plane.root.localToWorld(new V(...this.plane.doorAt)).setY(r.y+.1),s=t[Math.floor(t.length/2)];this.hop(a,this.scene,n.clone().add(new V(0,0,i*.5)),{delay:i*.45,dur:.6,arc:.5,face:180,done:()=>this.hop(a,this.scene,s,{dur:.45,arc:.4,face:180,done:()=>this.hop(a,this.scene,r,{dur:.45,arc:.4,face:180,done:()=>this.hop(a,this.scene,o.clone().add(new V(0,0,-.6)),{dur:.4,arc:.3,face:180,done:()=>{a.root.visible=!1,e===`nick`&&(this.phase=`gone`,setTimeout(()=>this.events.done(`takeoff`),600))}})})})})})}step(e,n){this.phaseT+=e;let a=this.suitcase.root,o=this.phase;(o===`scan`||o===`out`)&&(this.slide+=e*.6);for(let e of this.dashes.children)e.position.x=(this.slide%.3+.3)%.3;if(o===`scan`){a.position.x=Math.min(0,dp.x0+.5+this.phaseT*1.3),a.visible=a.position.x<fp.x0+.35;let e=Math.max(0,this.phaseT-2.2),t=Math.min(this.packed.length,Math.floor(e/.4));t>this.shown&&(this.shown=t,$.boop()),this.shown>=this.packed.length&&!this.laughed&&e>this.packed.length*.4+.6&&(this.laughed=!0,this.officerHop=0,$.haha(),this.events.say(this.packed.includes(`gan`)?h.trip.airport.gan:this.packed.includes(`fan`)?h.trip.airport.fan:h.trip.airport.laugh)),this.laughed&&!this.stamped&&e>this.packed.length*.4+2&&(this.stamped=!0,this.officerHop=0,$.stamp(),this.stampMark.visible=!0,this.pass.position.y=.95,this.phase=`out`,this.phaseT=0)}else o===`out`&&(a.visible=!0,a.position.x=Math.min(dp.x1-.4,fp.x1+.3+this.phaseT*1.2),this.phaseT>1.6&&(this.phase=`doors`,this.phaseT=0,$.fwip(),this.events.say(h.trip.airport.plane),a.visible=!1,this.riders.nick.react(`wave`),[`kaylee`,`ji`,`nick`].forEach((e,t)=>this.hop(this.riders[e],this.scene,new V(3-t*.45,0,.35+t*.6),{delay:t*.2,dur:.7,arc:.4,face:80}))));this.doorK=i(this.doorK+(o===`doors`||o===`board`||o===`gone`?e/.9:0)),this.doorsL.position.z=-.45-1.6*this.doorK,this.doorsR.position.z=1.3+1.4*this.doorK,this.plane.door.rotation.y=-1.6*this.doorK,this.planeBounce=Math.min(1,this.planeBounce+e/.6),this.plane.root.position.y=t(this.planeBounce)*.25;let s=this.screen;s.wiggle=Math.min(1,s.wiggle+e/.5),this.shown>0&&(Tf(s.canvas,this.packed,this.shown,n+r(s.wiggle,3)*.3),s.tex.needsUpdate=!0),s.mesh.scale.setScalar(1+r(s.wiggle,3)*.04),this.officerHop=Math.min(1,this.officerHop+e/.55),this.officerLife.update(e),this.pass.position.y+=(.915-this.pass.position.y)*(1-Math.exp(-e*10)),this.flagWave=Math.min(1,this.flagWave+e/1.5);let c=this.flag.getObjectByName(`cloth`);c.rotation.y=Math.sin(n*3.1)*.12+Math.sin(n*9)*.25*t(this.flagWave),c.scale.x=1-Math.abs(Math.sin(n*2.3))*.06,this.time-this.lastTouch>8&&(o===`belt`||o===`doors`)&&!this.hinted.has(o)&&(this.hinted.add(o),this.events.say(o===`belt`?h.trip.hint.belt:h.trip.hint.door));let l=this.officer,u=1+Math.sin(n*2.6)*.018;l.body.scale.set(1/Math.sqrt(u),u,1/Math.sqrt(u)),l.root.position.y=t(this.officerHop)*.22,l.armR.rotation.x=-t(this.officerHop)*1.6,l.head.rotation.x=o===`scan`?.08:0;for(let t of Object.values(this.riders))o===`doors`||o===`board`?t.lookAt(mp.x-3.5,2.2,mp.z+1.4):t.root.visible&&t.lookAt(a.position.x,.8,a.position.z),t.update(e,n)}shot(){let e=this.w<this.h;if(this.phase===`doors`||this.phase===`board`||this.phase===`gone`)return{center:new V(e?5.5:6.6,1.5,-.2),half:e?new V(3.6,1.8,2.6):new V(5.6,1.6,2.4),yaw:6,pitch:15,minDist:6};let t=this.phase!==`belt`;return e&&t?{center:new V(.05,1.3,-.55),half:new V(1.45,.85,.75),yaw:6,pitch:14,minDist:3}:e?{center:new V(-2.7,1,.1),half:new V(1.8,1.1,.9),yaw:6,pitch:18,minDist:4}:{center:new V(t?-1:-1.9,1.1,-.1),half:new V(3.6,1.1,1.6),yaw:6,pitch:22,minDist:5}}anchorAt(e){let t=this.phase;switch(e){case`suitcase`:return this.suitcase.root.visible&&t!==`gone`?{at:this.suitcase.root.getWorldPosition(new V).setY(this.suitcase.root.position.y+.25),r:.4,glow:t===`belt`,prio:3}:null;case`screen`:return{at:this.screen.mesh.getWorldPosition(new V),r:.55};case`officer`:return{at:this.officer.root.getWorldPosition(new V).setY(.85),r:.38};case`belt`:return{at:new V(dp.x0+.5,dp.y,dp.z+.3),r:.3};case`plane-door`:return t===`doors`||t===`board`?{at:this.plane.root.localToWorld(new V(...this.plane.doorAt)),r:.6,glow:t===`doors`,prio:3}:null;case`plane`:return{at:this.plane.root.localToWorld(new V(1.5,2.6,1.3)),r:1.5};case`pass`:return t===`belt`||t===`scan`||t===`out`?{at:this.pass.getWorldPosition(new V),r:.2}:null;case`flag`:return{at:this.flag.localToWorld(new V(.3,2.6,0)),r:.3}}if(e.startsWith(`family:`)){let n=this.riders[e.slice(7)];return!n||!n.root.visible||t===`board`||t===`gone`?null:{at:n.root.getWorldPosition(gp).clone().setY(n.height*.55),r:n.height*.3,max:120}}return null}hintAt(){return this.phase===`belt`?this.suitcase.root.getWorldPosition(new V).setY(.4):this.phase===`doors`?this.plane.root.localToWorld(new V(...this.plane.doorAt)):null}qa(){return{leg:`airport`,phase:this.phase,shown:this.shown,packed:[...this.packed],stamped:this.stamped,touches:this.touches}}},vp=`#FF6F8E`,yp=Y.cream,bp=Y.butter,xp=`#C9B5F7`,Sp=`#CDEBFF`;function Cp(e){let t=new K,n=new K;t.add(n);let r=4.6,i=1.9,a=-.55,o=2.9,s=[X.rbox(1.45,.75,i,.22,vp,{at:[r/2-.75,.75,0]}),X.rbox(1.05,.62,1.7799999999999998,.18,vp,{at:[r/2-.95,1.42,0]}),X.box(.04,.46,1.54,Sp,{at:[r/2-.43,1.42,0],rot:[0,0,-.35]}),...[-1,1].map(e=>X.box(.66,.4,.04,Sp,{at:[r/2-.98,1.44,e*(i/2-.04)]})),X.rbox(.16,.18,1.7999999999999998,.06,`#D9D5E6`,{at:[r/2-.02,.45,0]}),...[-1,1].map(e=>X.sphere(.11,Y.butter,{at:[r/2-.02,.82,e*.62],scale:[.4,1,1]})),X.box(4.5,.08,1.92,yp,{at:[-.05,.62,0]}),X.box(4.5,.05,1.93,bp,{at:[-.05,.5,0]}),X.box(o,.5,i,vp,{at:[a,.6,0]}),X.box(o,.04,1.74,`#B9A6F5`,{at:[a,.87,0]}),...[-1,1].flatMap(e=>[X.rbox(2.6999999999999997,.12,.42,.04,xp,{at:[a,1.1,e*(i/2-.3)]}),X.box(2.6999999999999997,.24,.12,xp,{at:[a,.98,e*(i/2-.3)]})]),X.rbox(2.6999999999999997,.42,.08,.03,xp,{at:[a,1.44,-.87]}),X.rbox(.3,.08,.9,.03,`#D9D5E6`,{at:[a-o/2-.12,.38,0]}),...[-1,1].flatMap(e=>[-1.94,a,.8399999999999999].map(t=>X.cyl(.04,.04,1.5,`#F4EFF8`,{at:[t,1.6,e*(i/2-.05)]}))),X.rbox(3,.1,2,.05,bp,{at:[a,2.36,0]}),...[-.7,0,.7].map(e=>X.box(3.02,.11,.2,vp,{at:[a,2.36,e]})),X.box(3,.06,.06,`#F4EFF8`,{at:[a,2.5,i/2]}),X.box(3,.06,.06,`#F4EFF8`,{at:[a,2.5,-1.9/2]}),X.cyl(.03,.03,1.7,`#F4EFF8`,{at:[-1.98,1.25,0],rot:[Math.PI/2,0,0]})];n.add(Q(Z(s),e,2));let c=[];for(let[n,a]of[[r/2-.85,1],[r/2-.85,-1],[-1.25,1],[-1.25,-1]]){let r=new K;r.position.set(n,.3,a*(i/2-.06)),r.add(Q(Z([X.torus(.24,.1,Y.ink),X.cyl(.13,.13,.1,`#EDEAF5`,{rot:[Math.PI/2,0,0]}),X.box(.3,.05,.11,Y.hotpink)]),e,2)),t.add(r),c.push(r)}let l=e=>{let t=new K;return t.position.set(e,1.16,-.6499999999999999),n.add(t),t},u={kaylee:l(-1.5),ji:l(-.5),nick:l(.44999999999999996)},d=new K;return d.position.set(-.9500000000000001,1.16,i/2-.32),n.add(d),{root:t,body:n,seats:u,luggage:d,wheels:c,length:r}}var wp=`#FF8A4D`,Tp=`#5FBF8F`,Ep=Y.gold,Dp=`#FFF7F0`,Op=`#C9C1D9`,kp=`#6FBF7F`;function Ap(e,t,n,r){let i=t/2+.25,a=Math.hypot(i,r),o=Math.atan2(r,i),s=[];for(let t of[-1,1]){let c=[0,n+r/2,t*i/2];s.push(X.box(e+.5,.1,a,wp,{at:c,rot:[t*o,0,0]})),s.push(X.box(e+.52,.12,.22,Tp,{at:[0,n+.06,t*(i-.08)],rot:[t*o,0,0]}))}for(let t of[-1,1]){let c=t*(e/2+.2);s.push(X.prism([[-i+.12,0],[i-.12,0],[0,r-.06]],.06,Ep,{at:[c,n+.02,0],rot:[0,Math.PI/2,0]}));for(let e of[-1,1])s.push(X.box(.1,.12,a+.2,Ep,{at:[c+t*.06,n+r/2+.06,e*i/2],rot:[e*o,0,0]})),s.push(X.cone(.07,.24,Ep,{at:[c+t*.06,n+.12,e*(i+.08)],rot:[e*-.9,0,0]}));s.push(X.capsule(.05,.22,Ep,{at:[c+t*.12,n+r+.14,0],rot:[0,0,-t*.5]})),s.push(X.cone(.05,.22,Ep,{at:[c+t*.3,n+r+.36,0],rot:[0,0,-t*1.1]}))}return s.push(X.box(e+.5,.1,.14,Tp,{at:[0,n+r+.02,0]})),s}function jp(e){let t=new K,n=1.6;t.add(Q(Z([X.box(70,.1,6,`#C9C4DE`,{at:[0,-.05,n]}),...Array.from({length:14},(e,t)=>X.box(1.4,.01,.14,Y.butter,{at:[-30+t*4.6,.005,2]})),X.box(70,.18,1,`#E8E2F4`,{at:[0,.09,-1.75]}),X.box(70,.1,30,`#A9E3B8`,{at:[0,-.04,-17.2]})]),e,0));let r=6.2,i=2.6,a=new K;a.position.set(0,0,-3.6),a.add(Q(Z([X.box(7.4,.24,3.6,`#F4EEFF`,{at:[0,.12,0]}),...[-1,1].flatMap(e=>[-6.2/2+.3,-6.2/6,r/6,r/2-.3].map(t=>X.cyl(.17,.2,2.5,Dp,{at:[t,1.49,e*(i/2-.2)]},14))),...[-1,1].flatMap(e=>[-6.2/2+.3,-6.2/6,r/6,r/2-.3].map(t=>X.cyl(.22,.22,.12,Ep,{at:[t,2.62,e*(i/2-.2)]},14))),X.box(6.5,.42,2.7,Dp,{at:[0,2.9,0]}),X.box(6.5200000000000005,.08,2.72,Ep,{at:[0,2.72,0]}),X.box(6.5200000000000005,.08,2.72,Y.pink,{at:[0,3.07,0]}),X.box(5.8,2.4,.16,`#FFE8DE`,{at:[0,1.44,-1.25]}),X.box(1.9,2,.05,`#CDEBFF`,{at:[0,1.24,-2.6/2+.15]}),X.box(.06,2,.06,`#D8D2E6`,{at:[0,1.24,-1.12]}),X.cyl(.42,.42,.08,Y.sky,{at:[0,2.15,i/2-.05],rot:[Math.PI/2,0,0]},24),X.box(.5,.08,.04,`#FFFFFF`,{at:[0,2.15,1.31]}),X.box(.08,.36,.04,`#FFFFFF`,{at:[-.05,2.15,1.31]}),X.box(.06,.16,.04,`#FFFFFF`,{at:[.22,2.22,1.31]}),...Ap(r,i,3.12,1.1),...Ap(r*.62,i*.7,3.82,1.05),...[-1,1].flatMap(e=>[X.cyl(.22,.17,.36,`#C9B5F7`,{at:[e*3.35,.42,1.55]}),X.sphere(.3,`#7FCB8F`,{at:[e*3.35,.78,1.55]}),...[0,2.1,4.2].map(t=>X.sphere(.09,Y.hotpink,{at:[e*3.35+Math.cos(t)*.2,.95,1.55+Math.sin(t)*.2]}))])]),e,2)),t.add(a);let o=(e,t,n)=>[X.cyl(.1,.16,n,`#C99A6E`,{at:[e,n/2,t]},10),...Array.from({length:5},(r,i)=>X.torus(.13-i*.008,.025,`#A97C54`,{at:[e,n/6*(i+1),t],rot:[Math.PI/2,0,0]})),...Array.from({length:6},(r,i)=>{let a=i/6*Math.PI*2;return X.sphere(.9,`#5FBF7F`,{at:[e+Math.cos(a)*.75,n+.05,t+Math.sin(a)*.75],rot:[Math.sin(a)*.6,0,-Math.cos(a)*.6],scale:[1,.16,.36]})}),X.sphere(.2,`#7A5A3A`,{at:[e,n-.05,t]})];t.add(Q(Z([...o(-5.6,-2,4.6),...o(5.8,-2.6,5.2),...o(-9.5,-4.5,5.6),...o(10.5,-3.4,4.2)]),e,2));let s=[];for(let e=0;e<9;e++){let t=-34+e*8.5+e%2*2,n=-34-e%3*7,r=10+e*7%5*2.6,i=3.2+e%3*.9;s.push(X.cyl(i*.92,i,r,Op,{at:[t,r/2,n]},12),X.cyl(i*1.02,i*1.04,.6,`#A79FC2`,{at:[t,.3,n]},12),X.sphere(i*1.05,kp,{at:[t,r,n],scale:[1,.55,1]},14))}t.add(Q(Z(s),e,2));let c=Cp(e),l=-2.4;return c.root.position.set(l,0,1),t.add(c.root),{root:t,songthaew:c,curbX:l,roadZ:n}}var Mp=[{id:`belt`,label:`Seatbelt`,kind:`thing`},{id:`window`,label:`Window shade`,kind:`thing`},{id:`tray`,label:`Tray`,kind:`thing`},{id:`call`,label:`Call button`,kind:`thing`},{id:`light`,label:`Reading light`,kind:`thing`},{id:`vent`,label:`Air vent`,kind:`thing`},{id:`screen`,label:`Seat-back screen`,kind:`thing`},{id:`teddy`,label:`Teddy`,kind:`thing`},{id:`attendant`,label:`Flight attendant`,kind:`thing`},{id:`family:ji`,label:`Mommy`,kind:`family`},{id:`family:nick`,label:`Daddy`,kind:`family`},{id:`family:kaylee`,label:`Kaylee`,kind:`family`},{id:`balloon`,label:`Sparkle's balloon`,kind:`thing`},{id:`songthaew`,label:`Songthaew`,kind:`thing`}],Np={species:`penguin`,height:1.32,fur:`#4F5F9E`,light:`#FFF6EC`,dark:`#FFA640`,extras:[`scarf`],lashes:!0},Pp={x:-.62,y:1.22,w:.7,h:.86},Fp=[-5.37,-4.42,-3.47,-2.52,-1.57,-.62,.33,1.28,2.23],Ip={kaylee:-.8,ji:0,nick:.72},Lp=1.38,Rp=[2.05,2.72],zp=[.98,1.96],Bp=2.75,Vp=-.68,Hp=.6,Up=.48,Wp=3.6,Gp=2.02,Kp=3,qp=60,Jp=4.5,Yp=4.5,Xp=18,Zp=6,Qp=35,$p=new V(0,0,420),em=3.1,tm=14,nm=[`kaylee`,`ji`,`nick`],rm=new V,im=class extends ap{events;packed;route;cabin=new K;seats={kaylee:new K,ji:new K,nick:new K};riders;haze=new xi(`#DCEFFB`,40,210);outside=new K;runway=new K;runwayDashes=new K;krabi=new K;thailand=new K;arrival;clouds=[];storks=new K;mini=new K;balloon=null;parts;screen;teddy=null;snacks=[];attendant;zs=[];zMesh=null;sec;secT=0;belt=!1;beltT=0;roll=-1;alt=2.2;progress=0;shade={down:!1,k:0};trayK=0;trayOpen=!1;lightOn=!1;callGlow=1;ventT=-1;turb=1;dad={asleep:!0,t:0};napping=!1;clap=-1;view=`cabin`;viewT=0;elephantDone=!1;touchdown=-1;cheered=!1;drive=-1;told=new Set;counts={snacks:0,shades:0,lights:0,screens:0,belts:0,vents:0};pace=1;constructor(e,t,n,r,i={from:gf.bangkok,to:gf.krabi},a=Qp){super(e,t),this.events=t,this.packed=r,this.route=i,this.pace=Qp/a;let{scene:o,bag:s}=this;o.background=new U(`#BFE6FF`),o.fog=this.haze,this.rig.fov=38,this.rig.camera.far=600,o.add(this.outside,this.cabin),this.parts=this.buildCabin();let c=document.createElement(`canvas`);c.width=256,c.height=176;let l=s.add(new ga(c));l.colorSpace=dt,this.parts.screen.material=s.add(new Er({map:l})),this.screen={canvas:c,tex:l,mode:`map`,drawn:-1},this.attendant=this.buildAttendant(),this.buildOutside(),this.arrival=jp(s),this.arrival.root.position.copy($p),this.arrival.root.visible=!1,this.arrival.songthaew.root.userData.pick=`songthaew`,o.add(this.arrival.root);let{kaylee:u,members:d}=this.makeFamily([`ji`,`nick`]);u.wear(p(r)),u.glassesUp(!0),this.riders={kaylee:u,ji:d.get(`ji`),nick:d.get(`nick`)};for(let e of nm)this.seats[e].add(this.riders[e].root),this.put(this.riders[e],0,Up,0,`sit`,-90);this.sec=n,n!==`takeoff`&&(this.belt=!0,this.roll=99,this.alt=qp,this.progress=+(n===`land`),this.parts.belt.visible=!0),this.place(),setTimeout(()=>this.events.say(n===`land`?h.trip.plane.land:n===`fly`?h.trip.plane.tray:h.trip.plane.belt),400)}buildCabin(){let{bag:e,cabin:t}=this,n=(Fp[Fp.length-1]-Fp[0])/2+1.6,r=(Fp[Fp.length-1]+Fp[0])/2;t.add(Q(Z([X.box(n*2,.12,4.4+.4,`#D9D2EE`,{at:[r,-.06,1.9/2]}),X.box(n*2,.02,.62,`#FFB8D4`,{at:[r,.005,Lp]}),...Array.from({length:12},(e,t)=>X.sphere(.05,Y.cream,{at:[-4.4+t*.75,.02,Lp],scale:[1,.2,1]})),X.box(n*2,.1,4.4+.4,`#FBF8FF`,{at:[r,3.65,1.9/2]}),X.box(n*2,.04,.18,Y.butter,{at:[r,3.58,Lp]}),X.box(n*2,Wp,.14,`#F7F4FF`,{at:[r,Wp/2,3.2199999999999998]}),...Fp.map(e=>X.cyl(Pp.w*.4,Pp.w*.4,.03,`#A8DCFF`,{at:[e,Pp.y,3.14],rot:[Math.PI/2,0,0],scale:[1,1,Pp.h/Pp.w]},20)),X.box(.14,Wp,4.4,`#EFEAFB`,{at:[3.35,Wp/2,1.9/2]}),X.box(.14,Wp,1.7799999999999998,`#EFEAFB`,{at:[2.8,Wp/2,-.7200000000000001/2]}),X.box(.14,Wp,.92,`#EFEAFB`,{at:[2.8,Wp/2,5.379999999999999/2]})]),e,0),Q(Z([...Array.from({length:6},(e,t)=>X.rbox(.08,2.2,.36,.04,t%2?`#FF9CC8`:`#FF8FB8`,{at:[Bp,1.12,.6299999999999999+t*.3],rot:[0,.25*(t%2?1:-1),0]})),X.box(.12,.12,2.2,Y.lavenderDark,{at:[Bp,2.28,Lp]})]),e,2));let i=new $a;i.moveTo(r-n,0),i.lineTo(r+n,0),i.lineTo(r+n,Wp),i.lineTo(r-n,Wp),i.closePath();for(let e of Fp){let t=new Qa;t.absellipse(e,Pp.y,Pp.w/2,Pp.h/2,0,Math.PI*2,!1,0),i.holes.push(t)}let a=new G(e.add(new Ro(i,{depth:.14,bevelEnabled:!1,curveSegments:24})),pd(`#F7F4FF`));a.position.z=-1.3900000000000001,t.add(a);let o=(e,t,n=`#B9A6F5`)=>[X.rbox(.62,.18,.58,.07,n,{at:[e,.39,t]}),X.rbox(.18,1.02,.6,.07,n,{at:[e+.34,.86,t],rot:[0,0,-.12]}),X.rbox(.2,.26,.5,.08,Y.cream,{at:[e+.42,1.28,t],rot:[0,0,-.12]}),X.rbox(.21,.07,.5,.03,Y.pink,{at:[e+.41,1.2,t],rot:[0,0,-.12]}),X.box(.08,.3,.5,`#8E7FC9`,{at:[e+.05,.15,t]})],s=(e,t)=>[X.rbox(.5,.07,.07,.03,`#9C8BD9`,{at:[e-.02,.62,t]}),X.box(.06,.2,.06,`#9C8BD9`,{at:[e+.2,.5,t]}),X.box(.1,.05,.08,Y.ink,{at:[e-.24,.66,t]})],c=[];for(let e of zp){for(let t of Object.values(Ip))c.push(...o(e,t));for(let t of[-1.1,-.4,.36,1.04])c.push(...s(e,t))}for(let e of[0,...zp]){for(let t of Rp)c.push(...o(e,t));for(let t of[1.72,2.38,3.04])c.push(...s(e,t))}for(let e of[-1.1,-.4,.36,1.04])c.push(...s(0,e));t.add(Q(Z(c),e,2));for(let n of nm){let r=this.seats[n];r.position.set(0,0,Ip[n]),r.add(Q(Z(o(0,0)),e,2)),t.add(r)}t.add(Q(Z(Object.values(Ip).flatMap(e=>[X.rbox(.2,.62,.6,.07,`#A792EE`,{at:[-.78,.62/2,e]}),X.box(.03,.12,.4,`#8E7FC9`,{at:[-.675,.44999999999999996,e]})])),e,2)),t.add(Q(Z([X.rbox(n*2,.5,.72,.1,`#EFEAFB`,{at:[r,2.32,-.89]})]),e,0)),t.add(Q(Z([X.box(n*2,.04,.04,Y.lavenderDark,{at:[r,2.07,-.53]}),...Fp.map(e=>X.box(.24,.05,.03,Y.lavenderDark,{at:[e+.47,2.22,-.52]})),X.rbox(1.12,.05,.4,.02,`#D9D2EE`,{at:[0,2.05,Ip.kaylee+.15]}),X.box(n*2,.08,.035,Y.pink,{at:[r,.5,-1.23]}),...Fp.map(e=>X.torus(.5,.05,`#D9CCFF`,{at:[e,Pp.y,-1.24],scale:[Pp.w/1,Pp.h/1,1]}))]),e,2));let l=()=>Q(Z([X.box(.08,.04,.5,`#5E5468`,{at:[-.12,.56,0]}),X.box(.1,.05,.1,`#D8D2E6`,{at:[-.13,.57,0]})]),e,1),u=l();u.visible=!1,this.seats.kaylee.add(u);for(let e of[`ji`,`nick`])this.seats[e].add(l());let d=new K;d.position.set(-.16,.6,0),d.add(Q(Z([X.rbox(.1,.06,.12,.02,Y.gold)]),e,1.5)),this.seats.kaylee.add(d);let f=new K;f.position.set(Pp.x,Pp.y+Pp.h/2,-1.22),f.add(Q(Z([X.box(Pp.w+.06,Pp.h+.04,.02,`#E8E2F4`,{at:[0,-(Pp.h+.04)/2,0]}),X.box(.16,.04,.03,Y.lavenderDark,{at:[0,-Pp.h-.02,.01]})]),e,1.5)),f.scale.y=.05,t.add(f);let p=new K;p.position.set(Vp,Hp,Ip.kaylee),p.add(Q(Z([X.rbox(.42,.03,.5,.02,`#E8E2F4`,{at:[.21,0,0]}),X.torus(.05,.008,`#C9C1E6`,{at:[.3,.017,.12],rot:[Math.PI/2,0,0]})]),e,1.5)),p.rotation.z=-Math.PI/2,t.add(p);let m=new K;m.position.set(-.75,.73,Ip.kaylee),m.rotation.z=.42,m.add(Q(Z([X.rbox(.06,.3,.42,.03,Y.ink,{at:[0,0,0]})]),e,1.5));let h=new G(e.add(new Wo(.37,.26)),e.add(new Er({color:`#1F2A55`})));h.position.set(.035,0,0),h.rotation.y=Math.PI/2,m.add(h),t.add(m);let g=(n,r)=>{let i=new K;return i.position.set(n,Gp,Ip.kaylee+.15),i.add(Q(Z(r),e,1.5)),t.add(i),i},_=g(.42,[X.cyl(.055,.055,.03,Y.hotpink),X.sphere(.012,Y.cream,{at:[0,-.018,.012]}),X.box(.008,.004,.025,Y.cream,{at:[0,-.016,-.006]})]),v=g(0,[X.cyl(.055,.045,.05,Y.butter),X.cyl(.035,.035,.01,`#FFFFFF`,{at:[0,-.03,0]})]),y=g(-.42,[X.cyl(.05,.06,.04,`#D8D2E6`),X.sphere(.035,`#B9B2CC`,{at:[0,-.03,0],scale:[1,.7,1]}),X.cyl(.012,.012,.02,Y.ink,{at:[0,-.055,0]})]),b=new G(e.add(new Sa(.45,1.25,20,1,!0)),e.add(new Er({color:Y.butter,transparent:!0,opacity:.25,depthWrite:!1})));return b.position.set(0,1.38,Ip.kaylee+.1),b.visible=!1,t.add(b),this.packed.includes(`teddy`)&&(this.teddy=Mf(`teddy`,e),this.teddy.position.set(0,.62,Ip.kaylee-.36),this.teddy.rotation.y=-Math.PI/2,this.teddy.scale.setScalar(.8),this.cabin.add(this.teddy)),{belt:u,buckle:d,shade:f,tray:p,call:_,light:v,vent:y,cone:b,screen:h}}buildAttendant(){let{bag:e}=this,t=new K,n=Zd(Np,e);n.root.position.set(.45,0,0),n.root.rotation.y=-Math.PI/2,t.add(n.root);let r=new K;return r.add(Q(Z([X.rbox(.55,.82,.42,.05,`#E3DCF2`,{at:[0,.5,0]}),...[.3,.55,.8].map(e=>X.box(.56,.02,.43,`#C9C1E6`,{at:[0,e,0]})),X.box(.03,.05,.18,Y.lavenderDark,{at:[-.28,.68,0]}),...[-1,1].flatMap(e=>[-1,1].map(t=>X.sphere(.045,Y.ink,{at:[e*.2,.05,t*.15]}))),X.cyl(.06,.06,.2,`#FF9F45`,{at:[.12,1.02,-.08]}),X.cyl(.03,.03,.04,Y.cream,{at:[.12,1.14,-.08]}),...[0,1,2].map(e=>X.cyl(.04,.03,.07,`#FFFFFF`,{at:[-.12+e*.03,.95+e*.07,.1]})),X.cyl(.09,.09,.08,Y.mint,{at:[-.1,.96,-.08]})]),e,2)),t.add(r),t.position.set(3.75,0,Lp),t.userData.pick=`attendant`,this.cabin.add(t),{rig:n,life:new tf(n,`attendant`),root:t,x:3.75,queue:0,wait:0,hand:1,served:0}}buildOutside(){let{bag:e,outside:t}=this,n=Q(Z([X.box(600,.1,400,`#A9E3B8`,{at:[0,-.06,-150]}),X.box(600,.12,14,`#B9B4CC`,{at:[0,0,-2]}),X.box(600,.04,.4,Y.cream,{at:[0,.07,-8.4]}),...Array.from({length:30},(e,t)=>X.sphere(.5,t%3?`#FFB3D1`:Y.butter,{at:[-90+t*6,.1,-12.5-t%4],scale:[1,.4,1]},8)),X.box(46,5,9,`#FFF7F0`,{at:[-6,2.5,-40]}),X.box(46.4,.4,9.4,Y.gold,{at:[-6,5.1,-40]}),...[-1,1].map(e=>X.box(47,.3,6.6,`#FF8A4D`,{at:[-6,6.4,-40+e*2.4],rot:[e*.62,0,0]})),...Array.from({length:10},(e,t)=>X.box(3.2,2.4,.1,`#A8DCFF`,{at:[-26+t*4.4,2.6,-35.45]})),X.cyl(1.2,1.6,16,`#F4EFF8`,{at:[30,8,-48]}),X.cyl(3,2.4,2.4,`#A8DCFF`,{at:[30,17.2,-48]}),X.cyl(3.3,3.3,.6,Y.hotpink,{at:[30,18.7,-48]}),X.box(20,7,14,`#D9D2EE`,{at:[60,3.5,-46]}),X.cyl(7,7,20,`#C9C1E6`,{at:[60,7,-46],rot:[0,0,Math.PI/2],scale:[1,.5,1]})]),e,0);this.runway.add(n);for(let t=-60;t<=60;t+=6)this.runwayDashes.add(Q(Z([X.box(3,.02,.3,Y.cream,{at:[t,.07,-2]})]),e,0));this.runway.add(this.runwayDashes),t.add(this.runway),this.krabi.add(Q(Z([X.box(800,.1,500,`#5FC7B4`,{at:[0,-.06,-260]}),X.box(800,.12,30,`#A9E3B8`,{at:[0,0,12]}),X.box(800,.14,14,`#B9B4CC`,{at:[0,.02,2]}),X.box(800,.13,3,`#FBE3B8`,{at:[0,.01,-4.5]})]),e,0));let r=[];for(let e=0;e<14;e++){let t=-70+e*11+e%3*4,n=-12-e%4*9-(e>9?30:0),i=6+e%5*3,a=4+e%3;r.push(X.cyl(a*.85,a,i*.55,`#C9C1D9`,{at:[t,i*.275,n]},12),X.cyl(a*.72,a*.86,i*.5,`#D3CBE2`,{at:[t+.4,i*.77,n]},12),X.cyl(a*1.04,a*1.06,.8,`#A79FC2`,{at:[t,.4,n]},12),X.sphere(a*.95,`#6FBF7F`,{at:[t,i,n],scale:[1,.55,1]},14))}this.krabi.add(Q(Z(r),e,2)),this.krabi.visible=!1,t.add(this.krabi),this.buildThailand(),t.add(this.thailand);for(let n=0;n<16;n++){let r=Q(Z([...[0,1,2,3,4].map(e=>X.sphere(1.3+(n+e)%3*.55,`#FFFFFF`,{at:[e*1.4-2.8,Math.sin(e*2+n)*.35+e%2*.5,e%2*.8-.4],scale:[1,.78,1]},9)),X.cyl(3.6,3.6,.6,`#F4F0FF`,{at:[0,-.9,0],scale:[1.3,1,.55]},14)]),e,1.5);r.position.set(-70+n*9.5,-6+n%5*3.2,-9-n%4*8),t.add(r),this.clouds.push({g:r,speed:9+n%3*3})}for(let t=0;t<5;t++){let n=new K;n.add(Q(Z([X.sphere(.25,`#FFFFFF`,{scale:[1.6,.8,.8]}),X.capsule(.06,.3,`#FFFFFF`,{at:[-.45,.06,0],rot:[0,0,Math.PI/2]}),X.sphere(.09,`#FFFFFF`,{at:[-.68,.08,0]}),X.cone(.04,.34,`#FF6F5E`,{at:[-.9,.06,0],rot:[0,0,Math.PI/2]}),...[-1,1].map(e=>X.cyl(.015,.015,.5,`#FF6F5E`,{at:[.55,-.04,e*.05],rot:[0,0,Math.PI/2]})),X.sphere(.02,Y.ink,{at:[-.72,.12,.07]})]),e,1.5));for(let t of[-1,1]){let r=new K;r.add(Q(Z([X.box(.42,.04,.85,`#FFFFFF`,{at:[0,0,t*.42]}),X.box(.3,.045,.3,Y.ink,{at:[.05,0,t*.75]})]),e,1.5)),r.name=t<0?`wingL`:`wingR`,n.add(r)}n.position.set(Math.abs(t-2)*1.6,0,(t-2)*1.6),this.storks.add(n)}this.storks.position.set(-30,2,-12),this.storks.visible=!1,t.add(this.storks);let i=e.add(new Ei({transparent:!0,depthWrite:!1}));new ys().load(f.balloon,t=>{if(this.disposed)return t.dispose();t.colorSpace=dt,i.map=e.add(t),i.needsUpdate=!0}),this.balloon=new Bi(i),this.balloon.scale.set(3.4,3.7,1),this.balloon.visible=!1,this.balloon.userData.pick=`balloon`,t.add(this.balloon)}below(e,t){let[n,r]=bf(e);return new V(r*Kp,t,n*Kp)}buildThailand(){let{bag:e}=this,t=e=>{let t=new $a;return e.forEach((e,n)=>{let[r,i]=bf(e);n===0?t.moveTo(r*Kp,i*Kp):t.lineTo(r*Kp,i*Kp)}),t},n=e.add(new Ko([t(mf),t(hf)]));n.applyMatrix4(new jn().makeBasis(new V(0,0,1),new V(1,0,0),new V(0,1,0)));let r=new G(n,pd(`#8FD58F`));r.position.y=.3;let i=Sd(n,3);e.add(i.geometry),r.add(i),this.thailand.add(r),this.thailand.add(Q(Z([X.box(2e3,.1,2e3,`#7FD3E6`,{at:[0,-.05,0]}),...gf.north.map((e,t)=>{let n=this.below(e,1);return X.cone(1.2+t%2*.4,1.6+t%3*.5,`#B5E6A6`,{at:[n.x,n.y,n.z]},8)})]),e,1.5));let a=new Ma(_f.ear.map(e=>this.below(e,.55)),!0);this.thailand.add(new G(e.add(new Xo(a,64,.18,6,!0)),pd(`#FF5FA2`)));let o=this.below(_f.eye,.5);this.thailand.add(Q(Z([X.cyl(.6,.6,.12,Y.ink,{at:[o.x,o.y,o.z]},18),X.cyl(.2,.2,.14,`#FFFFFF`,{at:[o.x+.2,o.y+.02,o.z+.2]},12)]),e,0));let s=this.below(this.route.from,.6),c=this.below(this.route.to,.6),l=Array.from({length:22},(e,t)=>X.sphere(.32,Y.butter,{at:[s.x+(c.x-s.x)*(t/21),.6,s.z+(c.z-s.z)*(t/21)],scale:[1,.4,1]},8));this.thailand.add(Q(Z([...l,...[s,c].map(e=>X.cyl(.9,.9,.3,Y.hotpink,{at:[e.x,.7,e.z]},16))]),e,1.5)),this.mini.add(Q(Z([X.capsule(.55,2.6,`#FFFFFF`,{rot:[0,0,Math.PI/2]}),X.box(1,.16,4.2,`#E3DAFF`),X.box(.6,.9,.12,Y.hotpink,{at:[1.7,.6,0]}),X.box(.5,.12,1.6,`#E3DAFF`,{at:[1.7,.1,0]})]),e,2)),this.mini.visible=!1,this.outside.add(this.mini)}pickRoots(){return[this.cabin,this.arrival.root,...this.balloon?[this.balloon]:[]]}onTap(e){this.view===`screen`&&e!==`screen`&&this.setView(`cabin`);let t=this.riders.kaylee;switch(e){case`belt`:this.setBelt(!this.belt||this.sec!==`fly`);return;case`window`:this.shade.down=!this.shade.down,this.counts.shades++,$.fwip(),this.checkNap();return;case`tray`:this.trayOpen=!this.trayOpen,$.thump();return;case`call`:this.call();return;case`light`:this.lightOn=!this.lightOn,this.counts.lights++,$.pop(),this.checkNap();return;case`vent`:this.ventT=0,this.counts.vents++,$.whir(),t.react(`wiggle`);return;case`screen`:this.counts.screens++,o.pop(),this.view===`screen`?this.screen.mode=this.screen.mode===`map`?`cartoon`:`map`:(this.screen.mode=`map`,this.setView(`screen`)),this.viewT=0;return;case`teddy`:this.teddy&&(this.teddy.userData.hop=0),$.boop();return;case`attendant`:this.attendant.hand=0,o.pop(),Math.abs(this.attendant.x)<.2&&this.attendant.queue++;return;case`family:nick`:this.dad.asleep?(this.dad={asleep:!1,t:0},$.snort(),this.riders.nick.react(`hop`),this.events.say(h.trip.plane.dad)):this.riders.nick.react(`wave`);return;case`family:ji`:this.riders.ji.react(`hop`),this.trayOpen&&this.snacks.length<tm?(this.addSnack(`cookie`,this.seats.ji.getWorldPosition(new V).setY(1.2)),this.told.has(`share`)||(this.told.add(`share`),this.events.say(h.trip.plane.share))):o.sparkle();return;case`family:kaylee`:this.napping=!1,t.react(`hop`),$.boing();return;case`balloon`:o.sparkle(),t.react(`wave`);return;case`songthaew`:$.toot();return}}setBelt(e){this.belt=e,this.parts.belt.visible=e,this.counts.belts++,$.latch(),this.riders.kaylee.react(`wiggle`)}call(){this.callGlow=0,$.callDing(),this.trayOpen||(this.trayOpen=!0,$.thump()),this.attendant.queue++}addSnack(e,t){if(this.disposed)return;if(this.snacks.length>=tm){this.turb=.7;return}let n=new K;n.add(Q(Z(e===`juice`?[X.cyl(.05,.04,.12,`#FFFFFF`,{at:[0,.06,0]}),X.cyl(.045,.045,.02,`#FF9F45`,{at:[0,.1,0]}),X.cyl(.006,.006,.12,Y.hotpink,{at:[.02,.16,0],rot:[0,0,.2]})]:[X.cyl(.06,.06,.025,`#E8B067`,{at:[0,.013,0]}),...[0,2.1,4.2].map(e=>X.sphere(.012,`#7A4A2A`,{at:[Math.cos(e)*.03,.028,Math.sin(e)*.03]}))]),this.bag,1.5));let r=this.snacks.length,i=new V(-.56+r%2*.17,.62+Math.floor(r/4)*.1,Ip.kaylee-.12+Math.floor(r/2)%2*.22);n.userData.fly={from:this.cabin.worldToLocal(t.clone()),to:i,t:0},n.position.copy(n.userData.fly.from),this.cabin.add(n),this.snacks.push(n),this.counts.snacks++,this.snacks.length===1&&this.riders.kaylee.react(`hop`)}checkNap(){let e=this.shade.down&&this.lightOn;e&&!this.napping?(this.napping=!0,this.told.has(`night`)||(this.told.add(`night`),this.events.say(h.trip.plane.snore)),setTimeout(()=>this.napping&&$.snort(),900)):e||(this.napping=!1)}setView(e){let t=this.view;this.view=e,this.viewT=0,this.cabin.visible=e===`cabin`||e===`screen`,this.outside.visible=e!==`krabi`,this.arrival.root.visible=e===`krabi`,this.scene.fog=e===`elephant`||e===`krabi`?null:this.haze,this.rig.lag=e===`screen`?.35:.5,(e===`elephant`||t===`elephant`||e===`krabi`)&&this.rig.setShot(this.shot(),!0)}place(){let e=bf(this.route.from),t=bf(this.route.to),n=this.progress,r=e[0]+(t[0]-e[0])*n,i=e[1]+(t[1]-e[1])*n;this.thailand.position.set(-i*Kp,-60,-r*Kp),this.mini.position.set(0,-54,0),this.mini.visible=this.view===`elephant`,this.runway.position.y=-this.alt,this.krabi.position.y=-this.alt,this.runway.visible=this.sec===`takeoff`&&this.alt<40,this.krabi.visible=this.sec===`land`&&this.alt<50}step(e,n){let r=e*this.pace;this.secT+=r;let a=this.riders.kaylee,s=this.sec,c=0,l=0;if(s===`takeoff`){this.roll<0?(this.beltT+=e,this.belt&&this.beltT>.8?this.roll=0:!this.belt&&this.beltT>3&&(this.riders.ji.react(`wiggle`),this.setBelt(!0))):this.roll+=r;let n=Math.max(0,this.roll),i=Math.min(1,n/Jp);if(this.runwayDashes.position.x=n*n*4%6,this.runway.children[0].position.x=n*n*2.2%120,this.roll>=0&&Math.floor((this.roll-e)*3)!==Math.floor(this.roll*3)&&$.jet(i),l=n>0?-.16*Math.min(1,n/2):0,n>Jp){let e=Math.min(1,(n-Jp)/Yp);if(this.alt=2.2+57.8*(e*e*(3-2*e)),c=-.1*t(Math.min(1,e*1.4)),!this.told.has(`wheee`)){this.told.add(`wheee`),this.events.say(h.trip.plane.wheee);for(let e of nm)this.riders[e].react(`wave`)}e>=1&&this.enterSection(`fly`)}}else if(s===`fly`){if(this.progress=i(this.secT/Xp),(Math.abs(this.secT-8)<r||Math.abs(this.secT-14)<r)&&(this.turb=0),this.passBalloon(this.secT-2),this.storks.visible=this.secT>6&&this.secT<17,this.storks.visible){this.storks.position.x=-28+(this.secT-6)*4.6;for(let[e,t]of this.storks.children.entries()){let r=Math.sin(n*7+e*.8)*.6;t.getObjectByName(`wingL`).rotation.x=r,t.getObjectByName(`wingR`).rotation.x=-r,t.position.y=Math.sin(n*7+e*.8-1)*.08}}!this.trayOpen&&this.time-this.lastTouch>8&&this.secT>4&&!this.told.has(`hint`)&&(this.told.add(`hint`),this.events.say(h.trip.hint.tray)),!this.elephantDone&&this.secT>10&&(this.elephantDone=!0,this.events.flash?.(),this.setView(`elephant`),this.events.say(h.trip.elephant)),this.view===`elephant`&&this.viewT>4.2&&(this.events.flash?.(),this.setView(`cabin`)),this.secT>Xp&&this.enterSection(`land`)}else{!this.belt&&this.secT>1.5&&(this.riders.ji.react(`wiggle`),this.setBelt(!0));let e=i(this.secT/Zp);if(this.alt=qp-57.8*(1-(1-e)**2),c=.06*t(e),this.runwayDashes.position.x=0,e>=1&&this.touchdown<0&&(this.touchdown=0),this.touchdown>=0){this.touchdown+=r;let e=this.touchdown;if((e<.05||Math.abs(e-.45)<r)&&e<.5&&($.thump(),this.turb=.6),l=.1*i(1-e/2.5),e>1.6&&!this.cheered){this.cheered=!0,o.sparkle(),this.clap=0;for(let e of nm)this.riders[e].react(`hop`);this.events.say(h.trip.plane.krabi)}e>3.8&&this.drive<0&&this.toKrabi()}}this.drive>=0&&this.stepKrabi(e);for(let t of this.clouds)t.g.position.x+=t.speed*e*(s===`takeoff`?i(this.roll/Jp):1),t.g.position.x>80&&(t.g.position.x-=160),t.g.visible=this.alt>15;this.place(),this.turb=Math.min(1,this.turb+e/1.4);let u=t(this.turb)*+(this.turb<1);if(this.cabin.rotation.z+=(c-this.cabin.rotation.z)*(1-Math.exp(-e*4)),this.cabin.position.y=Math.sin(n*31)*.02*u+Math.sin(n*1.3)*.01,this.cabin.rotation.x=Math.sin(n*23)*.012*u,this.drive<0)for(let t of nm){let n=this.seats[t],r=t===`nick`&&this.dad.asleep?-.22:0;n.rotation.z+=(l+r-n.rotation.z)*(1-Math.exp(-e*6))}this.dad.asleep?Math.floor(n/6.4)!==Math.floor((n-e)/6.4)&&s===`fly`&&$.snort():(this.dad.t+=e,this.dad.t>9&&(this.dad.asleep=!0)),this.shade.k=i(this.shade.k+(this.shade.down?e:-e)/.4),this.parts.shade.scale.y=.05+.95*this.shade.k,this.trayK=i(this.trayK+(this.trayOpen?e:-e)/.35),this.parts.tray.rotation.z=-Math.PI/2*(1-this.trayK),this.callGlow=Math.min(1,this.callGlow+e/1.2),this.parts.call.scale.setScalar(1+t(this.callGlow)*.6),this.parts.cone.visible=this.lightOn,this.ventT>=0&&(this.ventT+=e,this.parts.vent.rotation.y+=e*9,this.ventT>2.6&&(this.ventT=-1)),this.drive<0&&a.setWind(this.ventT>=0?.85:0),this.stepAttendant(e,n);for(let r of this.snacks){let i=r.userData.fly;i.t<1?(i.t=Math.min(1,i.t+e/.6),r.position.lerpVectors(i.from,i.to,i.t),r.position.y+=t(i.t)*.5,i.t>=1&&$.thump()):(r.position.set(i.to.x,i.to.y-(1-this.trayK)*2,i.to.z),r.visible=this.trayK>.6,r.rotation.z=Math.sin(n*20)*.15*u)}if(this.teddy){let n=this.teddy.userData.hop??1;this.teddy.userData.hop=Math.min(1,n+e/.5),this.teddy.position.y=.62+t(Math.min(1,n))*.15}let d=this.screen;n-d.drawn>.2&&(d.drawn=n,wf(d.canvas,this.progress,d.mode,n,this.route.from,this.route.to),d.tex.needsUpdate=!0),this.viewT+=e,this.view===`screen`&&this.viewT>6&&this.setView(`cabin`),this.view===`cabin`&&this.drive<0&&((this.balloon?.visible||this.storks.visible||s===`takeoff`&&this.roll>0||s===`land`&&this.alt<30&&this.touchdown<0)&&!this.shade.down||n%9<2.2?a.lookAt(Pp.x,Pp.y,-4.25):a.lookAt(-2.18,1.1,Ip.kaylee+.6));for(let t of Object.values(this.riders))t.update(e,n);this.stepFaces(e,n)}stepFaces(e,t){let n=this.riders.nick.rig,r=this.dad.asleep&&this.drive<0;r?(n.eyes.scale.y=.08,n.head.rotation.x=-.32,n.head.rotation.z=.12,n.mouth.scale.set(1.25,1.5+Math.sin(t*1.6)*.25,1)):n.head.rotation.set(0,n.head.rotation.y,0);let i=this.riders.kaylee.rig;this.napping?(i.eyes.scale.y=.08,i.head.rotation.z=-.25):i.head.rotation.z=0;for(let[n,i,a]of[[`nick`,r,0],[`kaylee`,this.napping,.5]])i&&Math.floor(t/1.3+a)!==Math.floor((t-e)/1.3+a)&&this.addZ(n);for(let t of[...this.zs]){t.t+=e/2.2;let n=this.riders[t.who],r=n.root.getWorldPosition(rm);t.g.position.set(r.x+.1+t.t*.2,r.y+n.height*1.05+t.t*.7,r.z+Math.sin(t.t*6)*.08),t.g.scale.setScalar(.5+t.t*.8),t.t>=1&&(t.g.removeFromParent(),this.zs.splice(this.zs.indexOf(t),1))}if(this.clap>=0){this.clap+=e;let t=this.clap<1.6;for(let e of nm){let n=this.riders[e].rig;if(!t){n.armL.rotation.set(0,0,0),n.armR.rotation.set(0,0,0);continue}let r=Math.abs(Math.sin(this.clap*14));n.armL.rotation.set(-1.15,0,-.25-.35*r),n.armR.rotation.set(-1.15,0,.25+.35*r)}t&&Math.floor(this.clap*14/Math.PI)!==Math.floor((this.clap-e)*14/Math.PI)&&o.pop(),t||(this.clap=-1)}}addZ(e){if(this.zs.length>6)return;this.zMesh??=Q(Z([X.box(.16,.035,.03,Y.cream,{at:[0,.07,0]}),X.box(.035,.19,.03,Y.cream,{rot:[0,0,-.95]}),X.box(.16,.035,.03,Y.cream,{at:[0,-.07,0]})]),this.bag,1.5);let t=this.zMesh.clone();t.rotation.y=-Math.PI/2+.6,this.scene.add(t),this.zs.push({g:t,t:0,who:e})}stepAttendant(e,n){let r=this.attendant,a=-.05,o=r.queue>0||r.wait>0?a:3.75,s=r.x;r.x+=i(o-r.x,-e*1.8,e*1.8);let c=Math.abs(r.x-s)>1e-4;r.root.position.set(r.x,0,Lp),r.root.visible=r.x<2.95;let l=r.rig;l.body.rotation.z=c?Math.sin(n*12)*.08:0,l.root.position.y=c?Math.abs(Math.sin(n*12))*.03:0;let u=Math.abs(r.x-a)<.02;l.root.rotation.y+=((u?Math.PI:-Math.PI/2)-l.root.rotation.y)*(1-Math.exp(-e*8)),u&&r.queue>0?(r.wait-=e,r.wait<=0&&(r.queue--,r.hand=0,r.served++,this.addSnack(r.served%2?`juice`:`cookie`,l.root.getWorldPosition(new V).setY(1.2)),r.served===1?this.events.say(h.trip.plane.snack):r.served===4&&this.events.say(h.trip.plane.more),r.wait=r.queue>0?.75:2.2)):u&&r.wait>0&&(r.wait=Math.max(0,r.wait-e)),r.hand=Math.min(1,r.hand+e/.5),l.armR.rotation.x=-t(r.hand)*1.4;let d=1+Math.sin(n*2.6)*.018;l.body.scale.set(1/Math.sqrt(d),d,1/Math.sqrt(d)),r.life.update(e)}passBalloon(e){let t=this.balloon;t&&(t.visible=e>0&&e<11&&this.alt>30,t.visible&&t.position.set(-14+e*2.6,1.8+Math.sin(e*1.4)*.3,-6.5))}enterSection(e){this.sec!==e&&(this.sec=e,this.secT=0,this.events.section(e),e===`land`&&(this.events.say(h.trip.plane.land),this.view!==`cabin`&&this.setView(`cabin`)),e===`fly`&&setTimeout(()=>this.sec===`fly`&&this.events.say(h.trip.plane.tray),1500))}skip(){this.drive>=0?(this.drive=4.1,this.events.done(`pier`)):this.sec===`land`?(this.cheered=!0,this.toKrabi()):(this.belt||this.setBelt(!0),this.storks.visible=!1,this.balloon&&(this.balloon.visible=!1),this.enterSection(`land`))}toKrabi(){this.drive=0,this.events.flash?.();let e=this.arrival.songthaew;for(let t of nm){let n=this.riders[t];e.seats[t].add(n.root),this.put(n,0,0,0,`sit`,0),n.rig.armL.rotation.set(0,0,0),n.rig.armR.rotation.set(0,0,0),n.rig.head.rotation.set(0,0,0)}this.clap=-1,this.napping=!1;for(let e of this.zs)e.g.removeFromParent();this.zs=[];let t=Pf(this.bag);t.root.scale.setScalar(.75),t.root.rotation.y=Math.PI,e.luggage.add(t.root),this.riders.kaylee.glassesUp(!1),this.setView(`krabi`)}stepKrabi(e){this.drive+=e;let t=this.drive,n=this.arrival.songthaew,r=Math.max(0,t-.7);n.root.position.x=this.arrival.curbX+r*r*1.6;for(let e of n.wheels)e.rotation.z=-r*r*1.6/.3;n.body.position.y=r>0?Math.abs(Math.sin(r*9))*.03:0,t>.7&&t-e<=.7&&($.toot(),$.putt(),this.riders.nick.react(`wave`),this.riders.kaylee.react(`wave`));let a=i(r/1.2);this.riders.kaylee.setWind(a),this.riders.ji.setWind(a),t>em&&t-e<=em&&this.events.done(`pier`)}shot(){let e=this.w<this.h;if(this.view===`screen`)return{center:this.parts.screen.getWorldPosition(new V),half:new V(.1,.16,.26),yaw:90,pitch:45,minDist:1.25,maxDist:1.3};if(this.view===`elephant`){let t=this.thailand.position,[n,r]=bf([100.9,13]);return{center:new V(t.x+r*Kp,t.y,t.z+n*Kp),half:new V(24,1,e?14:16),yaw:-90,pitch:62,minDist:20,maxDist:400}}if(this.view===`krabi`){let t=this.arrival.songthaew.root.position.x;return e?{center:new V($p.x+Math.min(t,4)+.2,2,$p.z-.6),half:new V(2.8,2.4,1.8),yaw:4,pitch:9,minDist:5}:{center:new V($p.x+Math.min(t+1.2,2.5)*.6,2,$p.z-.6),half:new V(4.6,2,1.8),yaw:4,pitch:9,minDist:5}}return e?{center:new V(-.3,1,-.22),half:new V(.8,.8,1.12),yaw:-64,pitch:23,minDist:3,maxDist:5.2}:{center:new V(-.3,1,-.42),half:new V(1,.72,.95),yaw:-64,pitch:23,minDist:3,maxDist:5.2}}anchorAt(e){if(this.view===`elephant`)return null;if(this.view===`krabi`)return e===`songthaew`?{at:this.arrival.songthaew.root.getWorldPosition(new V).setY(1.4),r:1.4}:null;let t=(e,t=0)=>{let n=e.getWorldPosition(new V);return n.y+=t,n};switch(e){case`belt`:return{at:t(this.parts.buckle),r:.12,glow:!this.belt&&this.sec!==`fly`,prio:3};case`window`:return{at:this.cabin.localToWorld(new V(Pp.x,Pp.y,-1.2)),r:.34};case`tray`:return{at:this.cabin.localToWorld(new V(Vp+.2*this.trayK,Hp-.15*(1-this.trayK),Ip.kaylee)),r:.2,glow:this.sec===`fly`&&!this.trayOpen&&this.secT>2&&this.secT<10,prio:3};case`call`:return{at:t(this.parts.call),r:.08,glow:this.sec===`fly`&&this.trayOpen&&this.snacks.length===0,prio:4};case`light`:return{at:t(this.parts.light),r:.08,prio:3};case`vent`:return{at:t(this.parts.vent),r:.08,prio:3};case`screen`:return{at:t(this.parts.screen,.05),r:.18,prio:3};case`teddy`:return this.teddy?{at:t(this.teddy,.15),r:.14,prio:3}:null;case`attendant`:return this.attendant.root.visible?{at:t(this.attendant.rig.root,.7),r:.35,max:120}:null;case`balloon`:return this.balloon?.visible&&!this.shade.down?{at:t(this.balloon),r:1.5}:null}if(e.startsWith(`family:`)){let n=this.riders[e.slice(7)];return n?{at:t(n.root,n.height*.62),r:n.height*.24,max:120}:null}return null}hintAt(){return this.view===`cabin`?this.belt?this.sec===`fly`&&!this.trayOpen?this.cabin.localToWorld(new V(Vp,.44999999999999996,Ip.kaylee)):this.sec===`fly`&&this.snacks.length<tm?this.parts.call.getWorldPosition(rm).clone():null:this.parts.buckle.getWorldPosition(new V):null}qa(){return{leg:`plane`,section:this.sec,t:Math.round(this.secT*10)/10,belt:this.belt,rolling:this.roll>=0,alt:Math.round(this.alt),progress:Math.round(this.progress*100)/100,tray:this.trayOpen,shade:this.shade.down,light:this.lightOn,view:this.view,touchdown:this.touchdown>=0,dadAsleep:this.dad.asleep,napping:this.napping,attendant:Math.round(this.attendant.x*10)/10,krabi:this.drive>=0,touches:this.touches,...this.counts}}},am=`#2E2233`,om=`#FFFFFF`,sm=`#FF9DB8`,cm=[`needlefish`,`eagle`,`macaque`,`cat`,`crab`,`mudskipper`,`lizard`,`kingfisher`,`porpoise`];function lm(e,t,n,r=1.5){let i=new K,a=[],o=[];for(let[n,r,i]of e)a.push(X.sphere(t,am,{at:[n,r,i]},10)),o.push(X.sphere(t*.38,om,{at:[n+t*.3,r+t*.35,i+t*.62]},6));return i.add(Ed(a,o,n,r)),i}var um=class{g;next=1+Math.random()*3;t=-1;constructor(e){this.g=e}update(e){this.next-=e,this.next<=0&&(this.t=0,this.next=2+Math.random()*4);let t=1;this.t>=0&&(this.t+=e/.16,t=1-.9*Math.sin(Math.min(1,this.t)*Math.PI),this.t>=1&&(this.t=-1)),this.g.scale.y=t}};function dm(e,t=`#FF7F6E`,n=!0){let r=new K,i=[X.sphere(.2,t,{at:[0,.14,0],scale:[1.3,.62,1]},14),X.sphere(.08,`#FFD6C8`,{at:[0,.1,.12],scale:[1.6,.6,.5]},10),...[-1,1].flatMap(e=>[0,1,2].map(n=>X.capsule(.022,.12,t,{at:[e*(.24+n*.02),.07,-.08+n*.07],rot:[0,0,e*1.1]}))),X.sphere(.05,t,{at:[-.25,.14,.14]},8),...[-1,1].map(e=>X.cyl(.018,.018,.14,t,{at:[e*.07,.26,.1]},6)),...[-1,1].map(e=>X.sphere(.03,sm,{at:[e*.14,.16,.17]},6))];r.add(Q(Z(i),e,1.5));let a=new K;a.position.set(.22,.16,.1),a.add(Q(Z([X.capsule(.03,.12,t,{at:[.05,.05,0],rot:[0,0,-.8]}),X.sphere(.11,n?`#FFE9A8`:t,{at:[.15,.13,0],scale:[1,.75,.55]},12)]),e,1.5)),n||a.scale.setScalar(.45),r.add(a);let o=lm([[-.07,.35,.1],[.07,.35,.1]],.04,e,1);return r.add(o),r.add(Od(.3,e)),{root:r,claw:a,blink:new um(o)}}function fm(e){let t=new K,n=`#9C8FA8`;t.add(Q(Z([X.capsule(.12,.32,n,{at:[0,.12,0],rot:[Math.PI/2,0,0],scale:[1,1,.85]}),X.cone(.12,.2,n,{at:[0,.12,-.32],rot:[-Math.PI/2,0,0],scale:[.35,1,1]},8),...[-1,1].map(e=>X.sphere(.07,`#B6AAC2`,{at:[e*.12,.05,.12],scale:[1,.4,1.3]},8)),X.box(.02,.1,.22,`#8DB7E8`,{at:[0,.27,-.05]}),...[[.06,.2,-.08],[-.05,.22,.02],[.04,.2,.12]].map(e=>X.sphere(.025,`#6FC3E8`,{at:e},6)),...[-1,1].map(e=>X.sphere(.03,sm,{at:[e*.1,.1,.22]},6))]),e,1.5));let r=lm([[-.05,.26,.17],[.05,.26,.17]],.045,e,1);return t.add(r),t.add(Od(.25,e)),{root:t,blink:new um(r)}}function pm(e){let t=new K,n=`#6F7A8E`,r=`#F6E08A`;t.add(Q(Z([X.capsule(.22,.9,n,{at:[0,.18,0],rot:[Math.PI/2,0,0],scale:[1,1,.7]}),...[-.3,0,.3].flatMap(e=>[-1,1].map(t=>X.sphere(.05,r,{at:[t*.12,.3,e]},6))),...[-1,1].flatMap(e=>[.35,-.35].map(t=>X.capsule(.05,.16,n,{at:[e*.24,.1,t],rot:[0,0,e*1.2]})))]),e,2));let i=new K;i.position.set(0,.22,.7),i.add(Q(Z([X.capsule(.13,.22,n,{at:[0,0,.15],rot:[Math.PI/2,0,0],scale:[1,1,.75]}),...[-1,1].map(e=>X.sphere(.035,sm,{at:[e*.09,-.02,.27]},6))]),e,2));let a=lm([[-.08,.06,.18],[.08,.06,.18]],.04,e,1);i.add(a);let o=new K;o.position.set(0,-.02,.4),o.add(Q(Z([X.box(.02,.01,.16,Y.hotpink,{at:[0,0,.08]}),...[-1,1].map(e=>X.box(.015,.01,.07,Y.hotpink,{at:[e*.02,0,.18],rot:[0,e*.5,0]}))]),e,0)),o.scale.z=.01,i.add(o),t.add(i);let s=new K;return s.position.set(0,.16,-.62),s.add(Q(Z([X.cone(.17,1.1,n,{at:[0,0,-.55],rot:[-Math.PI/2,0,0],scale:[1,1,.6]},10),X.sphere(.04,r,{at:[0,.07,-.3]},6)]),e,2)),t.add(s),{root:t,head:i,tongue:o,tail:s,blink:new um(a)}}function mm(e,t){let n=new K,r=t===`eagle`,i=r?1:.32,a=r?`#8E8AA8`:`#3FA8F0`,o=r?om:`#FFAA5C`,s=r?`#FFC83D`:Y.ink;n.add(Q(Z([X.sphere(.32*i,o,{at:[0,0,0],scale:[.8,.75,1.3]},14),X.sphere(.22*i,a,{at:[0,.1*i,-.08*i],scale:[.9,.6,1.2]},12),X.sphere(.2*i,r?om:a,{at:[0,.2*i,.34*i]},12),X.cone(.07*i,r?.18*i:.36*i,s,{at:[0,.17*i,.6*i],rot:[Math.PI/2,0,0]},8),X.cone(.16*i,.34*i,a,{at:[0,.02*i,-.5*i],rot:[-Math.PI/2,0,0],scale:[1,1,.35]},8),...[-1,1].map(e=>X.sphere(.05*i,sm,{at:[e*.13*i,.14*i,.48*i]},6))]),e,r?2:1.5));let c=lm([[-.1*i,.26*i,.48*i],[.1*i,.26*i,.48*i]],.05*i,e,1);n.add(c);let l=t=>{let o=new K;return o.position.set(t*.18*i,.08*i,0),o.add(Q(Z([X.sphere(.5*i,a,{at:[t*.45*i,0,-.02*i],scale:[1,.12,.42]},12),X.sphere(.25*i,r?`#6E6A88`:`#2F86D0`,{at:[t*.8*i,0,-.08*i],scale:[1,.14,.6]},8)]),e,r?2:1.5)),n.add(o),o};return{root:n,wingL:l(-1),wingR:l(1),blink:new um(c)}}function hm(e){let t=new K,n=new K;t.add(n);let r=`#B9A28E`,i=`#FFB8B0`;n.add(Q(Z([X.sphere(.24,r,{at:[0,.26,0],scale:[1,1.1,.9]},14),X.sphere(.2,r,{at:[0,.62,.02]},14),X.sphere(.13,i,{at:[0,.58,.15],scale:[1.1,.95,.6]},12),...[-1,1].map(e=>X.sphere(.07,r,{at:[e*.2,.67,0],scale:[.6,1,.5]},8)),...[-1,1].map(e=>X.sphere(.05,i,{at:[e*.2,.67,.02],scale:[.5,.8,.4]},6)),...[-1,1].map(e=>X.capsule(.06,.12,r,{at:[e*.12,.06,.12],rot:[Math.PI/2,0,0]})),X.torus(.14,.03,r,{at:[0,.18,-.28],rot:[.2,Math.PI/2,0]},Math.PI*1.5),...[-1,1].map(e=>X.sphere(.035,sm,{at:[e*.09,.55,.2]},6))]),e,2));let a=lm([[-.055,.63,.21],[.055,.63,.21]],.035,e,1);n.add(a);let o=t=>{let a=new K;return a.position.set(t*.2,.4,.02),a.add(Q(Z([X.capsule(.05,.18,r,{at:[0,-.12,0]}),X.sphere(.055,i,{at:[0,-.25,0]},8)]),e,2)),n.add(a),a};return t.add(Od(.3,e)),{root:t,body:n,armL:o(-1),armR:o(1),blink:new um(a)}}function gm(e){let t=new K,n=`#FFB66E`,r=`#FFF1DC`;t.add(Q(Z([X.sphere(.2,n,{at:[0,.2,0],scale:[1,1.1,1.15]},14),X.sphere(.13,r,{at:[0,.18,.14],scale:[1,1.2,.6]},10),...[-1,1].map(e=>X.sphere(.06,r,{at:[e*.08,.04,.18]},8))]),e,2));let i=new K;i.position.set(0,.42,.06),i.add(Q(Z([X.sphere(.17,n,{},14),X.sphere(.08,r,{at:[0,-.05,.12],scale:[1.3,.8,.6]},10),...[-1,1].map(e=>X.cone(.07,.13,n,{at:[e*.1,.15,0],rot:[0,0,-e*.3]},8)),...[-1,1].map(e=>X.cone(.04,.08,`#FFB3D1`,{at:[e*.1,.14,.03],rot:[0,0,-e*.3]},6)),X.sphere(.02,Y.hotpink,{at:[0,-.02,.17]},6),...[-1,1].map(e=>X.sphere(.03,sm,{at:[e*.1,-.04,.13]},6))]),e,2));let a=lm([[-.06,.03,.14],[.06,.03,.14]],.035,e,1);i.add(a),t.add(i);let o=new K;return o.position.set(0,.08,-.2),o.add(Q(X.capsule(.035,.3,n,{at:[0,.15,-.04],rot:[-.3,0,0]}),e,2)),t.add(o),{root:t,head:i,tail:o,blink:new um(a)}}function _m(e){let t=new K;t.add(Q(Z([X.capsule(.06,.6,`#B8E6D8`,{rot:[Math.PI/2,0,0]}),X.box(.13,.02,.5,`#7FCDB5`,{at:[0,.05,-.05]}),X.cone(.03,.35,`#7FCDB5`,{at:[0,0,.5],rot:[Math.PI/2,0,0]},6),X.cone(.08,.14,`#7FCDB5`,{at:[0,0,-.42],rot:[-Math.PI/2,0,0],scale:[.2,1,1]},6)]),e,1.5));let n=lm([[-.045,.03,.22],[.045,.03,.22]],.025,e,1);return t.add(n),{root:t,blink:new um(n)}}function vm(e){let t=new K,n=`#A9B4CC`;t.add(Q(Z([X.sphere(.5,n,{at:[0,0,0],scale:[.9,.85,1.6]},18),X.sphere(.3,`#D7DEEC`,{at:[0,-.15,.25],scale:[1,.6,1.6]},12),X.cone(.3,.6,n,{at:[0,0,-.95],rot:[-Math.PI/2,0,0],scale:[1,1,.35]},10),X.box(.9,.06,.28,n,{at:[0,0,-1.25]}),X.torus(.1,.018,am,{at:[0,-.06,.74],rot:[.4,0,Math.PI]},Math.PI),...[-1,1].map(e=>X.sphere(.06,sm,{at:[e*.26,-.02,.62]},6))]),e,2));let r=lm([[-.2,.12,.62],[.2,.12,.62]],.06,e,1.5);return t.add(r),{root:t,blink:new um(r)}}var ym={w:480,h:360},bm=new B;function xm(e,t,n){let r=e.domElement,i=r.width,a=r.height,o=i,s=Math.round(i*3/4);s>a&&(s=a,o=Math.round(a*4/3));let c=e.getPixelRatio();e.getSize(bm),n.aspect=4/3,n.clearViewOffset(),n.updateProjectionMatrix(),e.setScissorTest(!0),e.setViewport(0,0,o/c,s/c),e.setScissor(0,0,o/c,s/c),e.render(t,n);let l=document.createElement(`canvas`);return l.width=ym.w,l.height=ym.h,l.getContext(`2d`)?.drawImage(r,0,a-s,o,s,0,0,ym.w,ym.h),e.setScissorTest(!1),e.setViewport(0,0,bm.x,bm.y),l.toDataURL(`image/jpeg`,.82)}function Sm(e,t,n,r,i,a,o){let s=new pi(e,4/3,.3,700);return s.position.set(t,n,r),s.lookAt(i,a,o),s.updateMatrixWorld(),s}var Cm=`
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,wm=`
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
`,Tm=class{mesh;mat;constructor(e,t){this.mat=t.add(new ci({uniforms:{uDeep:{value:new U(e.deep)},uShallow:{value:new U(e.shallow)},uDash:{value:new U(`#FFFFFF`)},uHaze:{value:new U(e.haze)},uTime:{value:0},uHazeNear:{value:e.hazeNear},uHazeFar:{value:e.hazeFar}},vertexShader:Cm,fragmentShader:wm})),this.mesh=new G(t.add(new Wo(e.size,e.size)),this.mat),this.mesh.rotation.x=-Math.PI/2}update(e){this.mat.uniforms.uTime.value=e}setColors(e,t,n){let r=this.mat.uniforms;r.uDeep.value.set(e),r.uShallow.value.set(t),r.uHaze.value.set(n)}};function Em(e,t,n){return .05*Math.sin(e*.21+n*1.3)+.04*Math.sin(t*.17-n*1.1)+.02*Math.sin((e-t)*.5+n*2.1)}var Dm=`#E6A375`,Om=`#C9875C`,km=`#F6D3AE`,Am=`#A3AAC4`,jm=`#7E86A6`,Mm=`#5E5468`,Nm={top:9,boost:1.75,accel:5,coast:.42,turn:1.35,grip:2.2,near:3,far:26,dead:.2,lean:.16},Pm={pink:Y.pink,butter:Y.butter,mint:Y.mint,sky:Y.sky,lavender:Y.lavenderDark,hotpink:Y.hotpink},Fm={football:[.12,.62,2.05],coconut:[-.3,.6,1.75],mango:[.42,.62,1.25],bucket:[.38,.5,-1.45],teddy:[0,.78,-.22],trophy:[-.28,.5,2.3]},Im=6.4,Lm=new V(0,1.66,3.8600000000000003),Rm={hull:Dm,hullDark:Om,inside:km,stripe:Y.hotpink,trim:Y.butter};function zm(e,t=Rm){let n=new K,r=new K;n.add(r);let i=[X.rbox(1.3,.55,Im,.25,t.hull,{at:[0,.2,0]}),X.box(1.36,.1,5.800000000000001,t.stripe,{at:[0,.43,-.1]}),X.box(1.34,.05,5.6000000000000005,t.trim,{at:[0,.33,-.1]}),X.box(1.1,.06,5.2,t.inside,{at:[0,.46,-.2]}),...[-.32,0,.32].map(e=>X.box(.04,.02,4.800000000000001,t.hullDark,{at:[e,.495,-.2]})),X.rbox(.9,.4,1.3,.18,t.hull,{at:[0,.48,Im/2-.25],rot:[-.45,0,0]}),X.rbox(.42,.34,1.1,.15,t.hull,{at:[0,.92,3.45],rot:[-.9,0,0]}),X.cyl(.07,.09,.7,t.hull,{at:[0,1.32,3.75],rot:[-.35,0,0]}),X.sphere(.1,Y.gold,{at:[Lm.x,Lm.y,Lm.z]}),...[.9,-.5].map(e=>X.box(1.2,.08,.36,t.inside,{at:[0,.5,e]})),X.cyl(.09,.12,.5,Mm,{at:[0,.62,-2.85]})];r.add(Q(Z(i),e,2));let a=new K;a.position.set(0,.9,-2.85);let o=new V(0,.08,1.12);a.add(Q(Z([X.rbox(.52,.44,.72,.1,Am,{at:[0,.12,-.05]}),X.cyl(.17,.17,.08,jm,{at:[.3,.1,-.05],rot:[0,0,Math.PI/2]}),X.cyl(.04,.04,.38,Y.ink,{at:[-.14,.48,-.2],rot:[-.25,0,0]}),X.rbox(.3,.16,.3,.06,Y.hotpink,{at:[0,.4,.12]}),X.cyl(.035,.035,1.1,Mm,{at:[0,.06,.6],rot:[Math.PI/2-.03,0,0]}),X.capsule(.05,.14,Y.hotpink,{at:[o.x,o.y,o.z],rot:[Math.PI/2,0,0]}),X.cyl(.055,.05,3.6,Mm,{at:[0,-.4,-1.78],rot:[Math.PI/2-.27,0,0]})]),e,2));let s=new K;s.position.set(0,-.9,-3.5),s.add(Q(Z([X.box(.5,.08,.05,Y.gold),X.box(.08,.5,.05,Y.gold),X.sphere(.07,jm)]),e,1.5)),a.add(s),r.add(a);let c=new K;c.position.copy(Lm),r.add(c);let l=new K,u=[];for(let e=0;e<12;e++){let t=e/12*Math.PI*2;u.push(X.sphere(.045,e%4==0?`#FFE9A8`:`#FFFFFF`,{at:[Math.sin(t)*.12,-.12+Math.cos(t)*.02,Math.cos(t)*.12]},8))}for(let e=0;e<6;e++)u.push(X.sphere(.04,`#FFFFFF`,{at:[0,-.16-e*.07,.1+e*.012]},8));u.push(X.sphere(.075,`#FFB43C`,{at:[0,-.62,.17]},10),X.sphere(.06,Y.hotpink,{at:[0,-.73,.18]},10)),l.add(Q(Z(u),e,1.5)),l.visible=!1,c.add(l);let d=[],f=new K;c.add(f);let p=new K;r.add(p);let m=0;return{root:n,body:r,cargo:p,seats:{nick:{x:0,y:.52,z:.9},ji:{x:0,y:.52,z:-.5},kaylee:{x:0,y:.5,z:-1.98,stand:!0}},hull:{at:[2.4,.4,-1.8],r:.85},feel:Nm,stern:-6.4/2-3.1,bow:3.6,setRibbons(t){f.clear(),d=t.slice(0,3).map((t,n)=>{let r=Pm[t]??Y.pink,i=[],a=f;for(let t=0;t<5;t++){let o=new K;t===0?(o.position.set((n-1)*.09,0,-.02),o.rotation.set(-.7,(n-1)*.5,0)):o.position.set(0,0,-.34);let s=[X.box(.2-t*.025,.02,.34,r,{at:[0,0,-.34/2]})];t===0&&s.push(...[-1,1].map(e=>X.sphere(.09,r,{at:[e*.1,.03,.02],scale:[1.2,.5,.8]},8))),o.add(Q(Z(s),e,1.5)),a.add(o),i.push(o),a=o}return{joints:i,phase:n*1.9}})},setGarland(e){l.visible=e},grip(e){return e.copy(o).applyAxisAngle(new V(0,1,0),a.rotation.y).add(a.position)},animate(e,t,n,r){a.rotation.y+=(-e*.45-a.rotation.y)*Math.min(1,r*8),a.rotation.x=.04*t,s.rotation.z+=r*(8+50*t),a.position.y=.9+Math.sin(n*60)*.006*(.4+2*t),m+=r*(3+14*t);for(let e of d)e.joints.forEach((n,r)=>{let i=Math.sin(m+e.phase-r*1.1)*(.18+.25*t);r===0?n.rotation.x=-.75+.62*Math.min(1,t)+i*.35:(n.rotation.x=i*.9-.12*(1-t),n.rotation.y=Math.cos(m*.7+e.phase+r)*.2*(.3+t))})}}}var Bm={x:-2.2,z0:86,z1:110,w:3},Vm={x:1.1,z:90,heading:Math.PI},Hm={x:0,z:62,heading:Math.PI},Um={x:95,z:-40,inner:16,outer:34,h:30},Wm={x:Um.x,half:1.55,z0:Um.z+37,z1:Um.z+15};function Gm(e){let t=(Wm.z0-e)/(Wm.z0-Wm.z1);return t<=0?3.4:t>=1?3.2:t<.45?3.4-t/.45*2.25:t<.8?1.15:1.15+(3.2-1.15)*((t-.8)/.2)}var Km={x:Wm.x,z:Wm.z1-3,r:2.4},qm={x:Wm.x,z:Wm.z0+3.6},Jm={x:Wm.x,z:Wm.z0+2.2,heading:Math.PI},Ym={x:Wm.x+4.6,z:Wm.z0+6.5,heading:.15},Xm={x:Wm.x+1.5,z:Wm.z0+7.5,r:6},Zm={x:-85,z:-110,r:2.6,top:5.2,h:21,buoys:14},Qm={x:-112,z:-140,w:26,d:9},$m=Ch([Zm.x-Qm.x,Zm.z-Qm.z]),eh={x:Qm.x+$m[0]*7,z:Qm.z+$m[1]*7,r:6},th={x:-58,z:-80,heading:Math.atan2(Zm.x+58,Zm.z+80)},nh=[-1,1].map(e=>({x:Qm.x-$m[0]*25+$m[1]*8*e,z:Qm.z-$m[1]*25-$m[0]*8*e,r:9,h:46})),rh={lane:-118,laneHalf:5,z0:-18,z1:24,houseW:7,houseD:7,rock:{x:-154,z:2,r:22,h:72},dome:{x:-140,z:6}},ih=[-1,1].flatMap(e=>[-14,-6,2,10,18].map(t=>({x:rh.lane+e*(rh.laneHalf+rh.houseW/2),z:t,hx:rh.houseW/2,hz:rh.houseD/2-.4,side:e}))),ah={x0:-136,x1:-100,z0:-24,z1:30,soft:10,cap:.42},oh={x:-92,z:14,hx:5.5,hz:8},sh={x:-74,z:20},ch={x:-68,z:30,r:6},lh={x:-62,z:34,heading:Math.atan2(-1,-.4)},uh={x:60,z:32,r:7,h:34},dh={x:-38,z:40,heading:.6},fh={x:-14,z:44},ph={x:Vm.x+1,z:Vm.z-8,r:6},mh={x:-50,z:-60,heading:Math.atan2(50,150)},hh={x:60,z:76,heading:Math.PI/2,half:7},gh={x:hh.x-1,z:hh.z,r:6},_h={x:hh.x-15,z:hh.z,heading:-Math.PI/2},vh=[{x:hh.x+6,z:hh.z-15,r:7,h:38},{x:hh.x+6,z:hh.z+15,r:7,h:33},{x:hh.x+24,z:hh.z-6,r:11,h:52},{x:hh.x+22,z:hh.z+10,r:10,h:46}],yh={x:-6,z:-20,rx:54,rz:40,period:56},bh={x:0,z:-40,r:205},xh=[...Eh(),uh],Sh=Dh();Oh();function Ch([e,t]){let n=Math.hypot(e,t)||1;return[e/n,t/n]}function wh(e){let t=e;return()=>((t=t*16807%2147483647)-1)/2147483646}function Th(e,t,n,r,i,a){let o=i-n,s=a-r,c=Math.max(0,Math.min(1,((e-n)*o+(t-r)*s)/(o*o+s*s||1)));return Math.hypot(e-(n+o*c),t-(r+s*c))}function Eh(){let e=wh(20261018),t=[],n=[[Hm.x,Hm.z,22],[Bm.x,Bm.z0,18],[Um.x,Um.z,Um.outer+16],[qm.x,qm.z,22],[Zm.x,Zm.z,Zm.buoys+14],[Qm.x,Qm.z,26],[eh.x,eh.z,14],[rh.lane,(rh.z0+rh.z1)/2,40],[rh.rock.x,rh.rock.z,rh.rock.r+12],[oh.x,oh.z,22],[sh.x,sh.z,16],[ch.x,ch.z,14],[uh.x,uh.z,uh.r+14],[dh.x,dh.z,14],[fh.x,fh.z,10],[mh.x,mh.z,14],[lh.x,lh.z,12]],r=[[[Hm.x,Hm.z],[qm.x,qm.z+6]],[[Hm.x,Hm.z],[eh.x,eh.z]],[[qm.x,qm.z],[eh.x,eh.z]],[[Hm.x,Hm.z],[ch.x,ch.z]],[[ch.x,ch.z],[eh.x,eh.z]],[[ch.x,ch.z],[qm.x,qm.z+6]],[[mh.x,mh.z],[ph.x,ph.z]]];for(let i=0;t.length<26&&i<4e3;i++){let i=(e()*2-1)*180,a=-200+e()*260,o=5+e()*8;if(Math.hypot(i-bh.x,a-bh.z)>bh.r-o-12||a>78||n.some(([e,t,n])=>Math.hypot(i-e,a-t)<n+o)||r.some(([e,t])=>Th(i,a,e[0],e[1],t[0],t[1])<o+9))continue;let s=Math.hypot((i-yh.x)/yh.rx,(a-yh.z)/yh.rz);Math.abs(s-1)<(o+10)/Math.min(yh.rx,yh.rz)||t.some(e=>Math.hypot(i-e.x,a-e.z)<o+e.r+10)||t.push({x:i,z:a,r:o,h:22+e()*34+o})}return t}function Dh(){let e=[];for(let[t,n]of[[21,17],[29,23]])for(let r=0;r<n;r++){let i=r/n*Math.PI*2,a=Um.x+Math.sin(i)*t,o=Um.z+Math.cos(i)*t,s=5.5;Math.abs(a-Wm.x)<s+Wm.half+.3&&o>Um.z||e.push({x:a,z:o,r:s,h:Um.h+r*7%5*1.6})}for(let t of[-1,1])for(let n=Wm.z1+1;n<=Wm.z0-.5;n+=3.5)e.push({x:Wm.x+t*(Wm.half+.3+3),z:n,r:3,h:Um.h-1});return e}function Oh(){let e=wh(77),t=[];for(let n=0;n<46;n++){let r=n/46*Math.PI*2+e()*.1,i=270+e()*220,a=bh.x+Math.sin(r)*i,o=bh.z+Math.cos(r)*i;o>118||t.push({x:a,z:o,r:14+e()*26,h:50+e()*90})}return t}var kh=`#C3B8D2`,Ah=`#8E829F`,jh=`#6F6484`,Mh=`#7CCB8C`,Nh=`#5BB27A`,Ph=`#FBE7B8`,Fh=`#D59A6E`,Ih=`#8C6A55`;function Lh(e,t={}){let n=t.seg??12,r=e.h,i=Math.abs(Math.sin(e.x*12.9898+e.z*78.233)),a=1.4,o=[X.cyl(e.r*.86,e.r*.82,a,jh,{at:[e.x,a/2-.2,e.z]},n),X.cyl(e.r*(.9+i*.2),e.r,r*.62,kh,{at:[e.x,a+r*.31,e.z]},n),X.cyl(e.r*(.75+i*.15),e.r*(.9+i*.2),r*.3,kh,{at:[e.x,a+r*.62+r*.15,e.z]},n),X.cyl(e.r*.45,e.r*.55,r*(.35+i*.3),Ah,{at:[e.x+Math.cos(i*9)*e.r*.62,a+r*.25,e.z+Math.sin(i*9)*e.r*.62]},8),...[0,1,2].map(t=>{let n=i*7+t*2.1;return X.box(e.r*.09,r*(.35+.1*t),e.r*.09,`#AFA3C2`,{at:[e.x+Math.cos(n)*e.r*.93,a+r*(.55-.05*t),e.z+Math.sin(n)*e.r*.93],rot:[0,-n,0]})})];if(t.cap!==!1){let t=a+r*.92;o.push(X.sphere(e.r*(.85+i*.2),Mh,{at:[e.x,t,e.z],scale:[1,.42,1]},10),X.sphere(e.r*.45,Nh,{at:[e.x+e.r*.35,t+e.r*.25,e.z-e.r*.2],scale:[1,.7,1]},8),X.sphere(e.r*.3,Nh,{at:[e.x-Math.sin(i*5)*e.r*.8,a+r*.6,e.z+Math.cos(i*5)*e.r*.8],scale:[1,.7,1]},8))}return o}function Rh(e){let t=new Go(e.r*.86,e.r*.86+.7+e.r*.05,24);return t.rotateX(-Math.PI/2),t.translate(e.x,.03,e.z),t}function zh(e,t,n,r){let i=new K,a=new G(e.add(new xa(r*.55,r*.7,26,20,1,!0)),e.add(new Er({color:Y.gold,transparent:!0,opacity:.22,depthWrite:!1})));a.position.y=13;let o=new G(e.add(new Go(r*.75,r,32)),e.add(new Er({color:Y.gold,transparent:!0,opacity:.7,depthWrite:!1})));return o.rotation.x=-Math.PI/2,o.position.y=.04,i.add(a,o),i.position.set(t,0,n),i}function Bh(e){let t=new K;t.add(Q(Z(xh.flatMap(e=>Lh(e))),e,2.5));let n=new G(e.add(Z(xh.map(Rh))),e.add(new Er({color:`#FFFFFF`,transparent:!0,opacity:.75,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2})));t.add(n),[[290,`#B4AACB`,60],[380,`#C6BEDB`,85],[500,`#D6D1E8`,110]].forEach(([n,r,i],a)=>{let o=[],s=22+a*6;for(let e=0;e<s;e++){let t=e/s*Math.PI*2+a*.37,r=bh.x+Math.sin(t)*n,c=bh.z+Math.cos(t)*n;if(c>88&&Math.abs(r)<260)continue;let l=26+(e*37+a*11)%30,u=i*(.55+(e*53+a*7)%45/100),d=new $a;d.moveTo(-l/2,-2),d.lineTo(-l/2+l*.06,u*.75);for(let t=0;t<=6;t++){let n=-l/2+l*.06+t/6*l*.88;d.lineTo(n,u*(.82+.18*Math.sin(t*1.9+e)))}d.lineTo(l/2,-2),d.closePath();let f=new Ko(d,4);f.rotateY(Math.atan2(bh.x-r,bh.z-c)),f.translate(r,0,c),o.push(f)}t.add(new G(e.add(Z(o)),e.add(new Er({color:r,side:2,fog:!0}))))});let r=[X.box(700,1.2,160,Ph,{at:[0,.2,188]}),X.box(Bm.w,.16,Bm.z1-Bm.z0,Fh,{at:[Bm.x,.95,(Bm.z0+Bm.z1)/2]}),...Array.from({length:Math.floor((Bm.z1-Bm.z0)/.6)},(e,t)=>X.box(Bm.w+.02,.02,.05,`#B97E55`,{at:[Bm.x,1.035,Bm.z0+.3+t*.6]}))];for(let e=Bm.z0+.5;e<Bm.z1;e+=3)for(let t of[-1,1])r.push(X.cyl(.13,.13,1.4,Ih,{at:[Bm.x+t*(Bm.w/2-.2),.3,e]},6));r.push(...[-1,1].flatMap(e=>[0,1].map(t=>X.cyl(.1,.1,2.4,Ih,{at:[Bm.x+e*1.2,2.2,Bm.z1-3-t*2.6]},6))),X.box(3.2,.12,3.6,Y.hotpink,{at:[Bm.x,3.5,Bm.z1-4.3],rot:[0,0,.08]}),X.box(3.2,.12,3.6,`#E2407F`,{at:[Bm.x,3.5,Bm.z1-4.3],rot:[0,0,-.08]}));for(let e=0;e<18;e++){let t=-170+e*20+e*37%9,n=118+e*53%14;if(r.push(X.sphere(14+e%3*4,e%2?Mh:Nh,{at:[t,0,n+18],scale:[1,.5,.8]},10)),e%2==0){r.push(X.cyl(.25,.32,6,`#B08463`,{at:[t+6,3.4,n-4],rot:[0,0,.12]},6));for(let e=0;e<4;e++)r.push(X.cone(.9,3.4,Nh,{at:[t+6.7+Math.sin(e*1.57)*1.2,6.4,n-4+Math.cos(e*1.57)*1.2],rot:[Math.cos(e*1.57)*1.3,0,-Math.sin(e*1.57)*1.3]},5))}}for(let[e,t]of[-30,-22,16,26].entries()){let n=[Y.sky,Y.mint,Y.butter,Y.lavender][e];r.push(X.rbox(1.2,.5,5.6,.22,n,{at:[t,.15,107.4],rot:[0,.3-e*.2,0]}),X.box(1.24,.08,5,Y.hotpink,{at:[t,.36,107.4],rot:[0,.3-e*.2,0]}))}r.push(X.rbox(2.6,.3,3.4,.1,Fh,{at:[qm.x+2,.12,qm.z+.6]})),t.add(Q(Z(r),e,2));let i={village:zh(e,ch.x,ch.z,ch.r*.7),cave:zh(e,Xm.x,Xm.z,Xm.r*.7),beach:zh(e,eh.x,eh.z,eh.r*.7),pier:zh(e,ph.x,ph.z,ph.r*.7),out:zh(e,Km.x,Km.z,Km.r*.7),race:zh(e,gh.x,gh.z,gh.r*.7)};return t.add(...Object.values(i)),{root:t,glows:i}}var Vh=[{id:`needlefish`,label:`Needlefish`,kind:`thing`},{id:`eagle`,label:`Sea eagle`,kind:`thing`},{id:`coconut`,label:`Coconut`,kind:`thing`},{id:`macaque`,label:`Macaques`,kind:`thing`},{id:`fisher`,label:`Fisherman`,kind:`thing`},{id:`notch-crab`,label:`Crab`,kind:`thing`},{id:`sunglasses`,label:`Daddy's sunglasses`,kind:`thing`},{id:`hat`,label:`Mommy's hat`,kind:`thing`},{id:`duck`,label:`Rubber duck`,kind:`thing`}],Hh=new V,Uh={species:`buffalo`,height:1.5,fur:`#A79A8A`,light:`#E8DFD2`,dark:`#5E5468`,ear:`#FFB8CC`,outfit:{kind:`shirt`,color:`#8EC9F5`}},Wh=new V(-.85,0,.53).normalize(),Gh=new V(uh.x+Wh.x*(uh.r+.5),3.2,uh.z+Wh.z*(uh.r+.5)),Kh=3,qh=[-.55,.55,-2.9],Jh=class{bay;fish;skip=null;nextSkip=6;eagle;eagleFish;eagleT=0;swoop=null;nextSwoop=14;orbit=new V(0,0,40);coconut;nut={x:fh.x,z:fh.z,vx:0,vz:0,spin:0,in:!1};scoop=null;monkeys;flips=[-1,-1,-1];heist=null;snack;snackGone=!1;fisher;fishingBoat=new K;net;netT=-1;nextNet=8;waveT=-1;crab;crabT=-1;crabAt=new V;crabOut=new V;shades;shadesUp=!0;hat;floaters=new Map;duck=null;duckPos=new V;duckVel=new V;duckSpin=0;duckSet=!1;rope=null;constructor(e){this.bay=e;let{bag:t,scene:n}=e;this.fish=[0,1,2].map(()=>{let e=_m(t);return e.root.scale.setScalar(1.4),e.root.visible=!1,n.add(e.root),e}),this.eagle=mm(t,`eagle`),this.eagle.root.scale.setScalar(1.5),n.add(this.eagle.root),this.eagleFish=new K,this.eagleFish.add(Q(Z([X.capsule(.07,.25,`#B8E6D8`,{rot:[Math.PI/2,0,0]}),X.cone(.08,.12,`#7FCDB5`,{at:[0,0,-.22],rot:[-Math.PI/2,0,0],scale:[.2,1,1]},6)]),t,1.5)),this.eagleFish.position.set(0,-.3,.1),this.eagleFish.visible=!1,this.eagle.root.add(this.eagleFish),this.coconut=new K,this.coconut.add(Q(Z([X.sphere(.32,`#8C5E3C`,{scale:[1,.9,1.05]},14),...[0,1,2].map(e=>X.sphere(.05,`#5A3A26`,{at:[Math.sin(e*2.1)*.12,.27,Math.cos(e*2.1)*.12]},6))]),t,2)),n.add(this.coconut);let r=Q(X.cyl(1.9,1.5,.5,`#B3A8C6`,{at:[Gh.x,Gh.y-.25,Gh.z],scale:[1,1,.75]},12),t,2);n.add(r),this.monkeys=[0,1,2].map(e=>{let r=hm(t),i=new V(-Wh.z,0,Wh.x);return r.root.position.copy(Gh).addScaledVector(i,(e-1)*.9).addScaledVector(Wh,e===1?.4:0),r.root.rotation.y=Math.atan2(Wh.x,Wh.z)+(e-1)*.3,r.root.scale.setScalar(e===1?1.3:1.1),n.add(r.root),r});let i=e.packed.includes(`mango`);this.snack=i?Mf(`mango`,t):this.banana(),this.snack.scale.setScalar(1.6),this.snack.position.set(...Fm.mango),e.rides.longtail.v.cargo.add(this.snack),this.fishingBoat.add(Q(Z([X.rbox(1.3,.5,3.8,.2,`#7FB2E8`,{at:[0,.15,0]}),X.box(1.34,.08,3.3,Y.butter,{at:[0,.38,0]}),X.box(1.1,.06,3,`#F6D3AE`,{at:[0,.42,0]}),X.rbox(.36,.5,.36,.08,`#FFFFFF`,{at:[0,.5,-1.2]})]),t,2)),this.fisher=Zd(Uh,t),this.fisher.root.position.set(.1,.45,.6),this.fisher.root.rotation.y=Math.PI/2,this.fisher.head.add(Q(X.cone(.55,.32,`#F2D38B`,{at:[0,.75,0]},16),t,2)),this.fishingBoat.add(this.fisher.root),this.net=new K;let a=[];for(let e=0;e<=4;e++)a.push(X.box(1.4,.03,.03,`#E8E0F4`,{at:[0,e*.3,0]}),X.box(.03,1.2,.03,`#E8E0F4`,{at:[-.7+e*.35,.6,0]}));a.push(...[-.3,.1,.4].map((e,t)=>X.capsule(.08,.25,[`#FFB3C7`,`#B8E6D8`,`#FFD27A`][t],{at:[e,.25,.08],rot:[0,0,Math.PI/2]}))),this.net.add(Q(Z(a),t,1.5)),this.net.position.set(1.2,-1.4,.4),this.fishingBoat.add(this.net),this.fishingBoat.position.set(dh.x,0,dh.z),this.fishingBoat.rotation.y=dh.heading,n.add(this.fishingBoat),this.crab=dm(t,`#FF8A5C`,!1),this.crab.root.scale.setScalar(2.2),this.crab.root.visible=!1,n.add(this.crab.root);let o=e.rider(`nick`).char,s=.24*o.height;this.shades=new K,this.shades.add(Q(Z([...[-1,1].flatMap(e=>[X.rbox(.19,.13,.04,.04,`#3A3350`,{at:[e*.37*s,0,0],rot:[0,e*.35,0]}),X.box(.05,.03,.03,Y.hotpink,{at:[e*.48*s,.05,-.02]})]),X.box(.1,.03,.03,Y.hotpink,{at:[0,.03,.01]})]),t,1.5)),this.shades.position.set(0,s*.92+.12*s,s*.93),o.rig.head.add(this.shades);let c=e.rider(`ji`).char,l=.24*c.height;this.hat=new K,this.hat.add(Q(Z([X.cyl(l*1.4,l*1.4,.03,Y.butter,{},24),X.cyl(l*.7,l*.78,.2,Y.butter,{at:[0,.1,0]},20),X.cyl(l*.79,l*.79,.05,Y.hotpink,{at:[0,.04,0]},20),X.sphere(.07,`#FFFFFF`,{at:[l*.7,.1,.1]},8)]),t,1.5)),this.hat.position.set(0,l*.92+.6*l,-.04*l),this.hat.rotation.x=-.12,c.rig.head.add(this.hat);let u=e.rides.longtail.v.cargo;if(e.packed.includes(`teddy`)){let e=Mf(`teddy`,t);e.scale.setScalar(1.3),e.position.set(...Fm.teddy),u.add(e)}if(e.packed.includes(`bucket`)){let e=Mf(`bucket`,t);e.scale.setScalar(1.5),e.position.set(...Fm.bucket),e.name=`bucket`,u.add(e)}if(e.packed.includes(`duck`)){this.duck=Mf(`duck`,t),this.duck.scale.setScalar(2),n.add(this.duck);let e=t.add(new Br);e.setAttribute(`position`,new W(new Float32Array(6),3)),this.rope=new ma(e,t.add(new oa({color:Y.ink}))),this.rope.frustumCulled=!1,n.add(this.rope)}}banana(){let e=new K;return e.add(Q(Z([X.torus(.12,.035,`#FFD84D`,{at:[0,.05,0],rot:[Math.PI/2,0,.4]},Math.PI*.8),X.cyl(.012,.012,.05,`#7A5A3A`,{at:[.11,.06,.05]},5)]),this.bay.bag,1.5)),e}get lt(){return this.bay.rides.longtail}get out(){return this.bay.using===`longtail`&&this.bay.phase===`drive`}anchorAt(e){let t=this.bay.phase===`drive`||this.bay.phase===`beach`;switch(e){case`needlefish`:return this.skip&&this.fish[1].root.visible?{at:this.fish[1].root.position.clone(),r:1.2,prio:3}:null;case`eagle`:return t&&this.bay.using===`longtail`?{at:this.eagle.root.position.clone(),r:1.4,prio:3,max:120}:null;case`coconut`:return!this.nut.in&&this.out?{at:this.coconut.position.clone().setY(.4),r:.6,prio:3,max:110}:null;case`macaque`:return t?{at:Gh.clone().setY(Gh.y+.9),r:1.6,prio:3}:null;case`fisher`:return t?{at:Hh.set(0,1.2,.4).applyMatrix4(this.fishingBoat.matrixWorld).clone(),r:1.4,prio:3}:null;case`notch-crab`:return this.crabT>=0?{at:this.crab.root.position.clone().setY(this.crab.root.position.y+.4),r:.6,prio:3}:null;case`sunglasses`:case`hat`:{let t=this.floaters.get(e);return t&&t.t>=1&&this.out?{at:t.g.position.clone().setY(.4),r:.6,prio:3,glow:!0}:null}case`duck`:return this.duck&&this.bay.using===`longtail`?{at:this.duck.position.clone().setY(.5),r:.5,prio:3,max:100}:null}return null}tap(e){let t=this.bay;switch(e){case`needlefish`:return t.found(`needlefish`,this.fish[1].root.position),$.splash(.4),!0;case`eagle`:return this.swoop||this.startSwoop(),$.peep(),t.found(`eagle`,this.eagle.root.position),!0;case`coconut`:return t.driveTo(this.nut.x,this.nut.z),this.nut.spin+=2,$.boop(),!0;case`macaque`:{$.chatter();let e=Math.floor(Math.random()*3);return this.flips[e]<0&&(this.flips[e]=0),t.found(`macaque`,Gh),!0}case`fisher`:return this.waveT=0,this.netT<0&&(this.netT=0),$.toot(),!0;case`notch-crab`:return this.crabT=Math.min(this.crabT,.5),this.crab.claw.rotation.z=1,$.pop(),!0;case`sunglasses`:case`hat`:{let n=this.floaters.get(e);return n&&t.driveTo(n.g.position.x,n.g.position.z),!0}case`duck`:return this.duckSpin=1,$.chirp(),!0}return!1}bonked(e,t,n){let r=this.bay;if(r.using!==`longtail`)return;n>3.2&&!this.floaters.has(`sunglasses`)&&this.shades.parent&&r.phase===`drive`&&this.overboard(`sunglasses`);let i=xh.find(n=>Math.abs(Math.hypot(e-n.x,t-n.z)-n.r)<2.5);if(i&&this.crabT<0){let n=Math.atan2(e-i.x,t-i.z);this.crabAt.set(i.x+Math.sin(n)*i.r*.82,.55,i.z+Math.cos(n)*i.r*.82),this.crabOut.set(i.x+Math.sin(n)*(i.r*.82+.6),.55,i.z+Math.cos(n)*(i.r*.82+.6)),this.crab.root.rotation.y=n,this.crabT=0,r.once(`notch`,h.bay.facts.notch)}}jumped(e){e>4.3&&!this.floaters.has(`hat`)&&this.hat.parent&&this.overboard(`hat`)}overboard(e){let t=this.bay,n=e===`sunglasses`?this.shades:this.hat,r=n.getWorldPosition(new V),i=n.clone();i.rotation.set(0,0,0),i.scale.setScalar(e===`sunglasses`?1.6:1.3),n.removeFromParent(),t.scene.add(i);let a=this.lt.d,o=Math.random()<.5?-1:1,s=e===`hat`?-6:-1.5,c=e=>new V(a.x+Math.sin(a.heading)*s+Math.cos(a.heading)*e*3.5,.05,a.z+Math.cos(a.heading)*s-Math.sin(a.heading)*e*3.5),l=e=>[...xh,...Sh,...nh,rh.rock].some(t=>Math.hypot(e.x-t.x,e.z-t.z)<t.r+2)||ih.some(t=>Math.abs(e.x-t.x)<t.hx+1.5&&Math.abs(e.z-t.z)<t.hz+1.5)||Math.hypot(e.x-Zm.x,e.z-Zm.z)<Zm.buoys+2||Math.abs(e.x-oh.x)<oh.hx+1.5&&Math.abs(e.z-oh.z)<oh.hz+1.5,u=c(o);l(u)&&(u=c(-o)),l(u)&&(u=c(0).setX(a.x-Math.sin(a.heading)*5).setZ(a.z-Math.cos(a.heading)*5)),this.floaters.set(e,{g:i,t:0,from:r,to:u}),t.say(e===`sunglasses`?h.bay.sunglasses:h.bay.hat),$.whoosh(.5)}somethingToSee(){let e=this.lt.d,t=[[`eagle`,this.eagle.root.position],[`macaque`,Gh],[`needlefish`,this.fish[1].root.position]],n=t.filter(([e])=>!this.bay.has(e));return(n.length?n:t).sort((t,n)=>t[1].distanceTo(Hh.set(e.x,0,e.z))-n[1].distanceTo(Hh.set(e.x,0,e.z)))[0]?.[1]??null}bumps(e,t,n,r){if(Math.abs(dh.x-e)<14&&Math.abs(dh.z-t)<14){let e=Math.sin(dh.heading),t=Math.cos(dh.heading);for(let r of[-1.2,0,1.2])n.push([dh.x+e*r,dh.z+t*r,.8])}}update(e,t){let n=this.bay,r=this.lt.d,i=n.rig.camera.position,a=Math.hypot(i.x-Gh.x,i.z-Gh.z)<160;for(let e of this.monkeys)e.root.visible=a||this.heist!==null;this.fisher.root.visible=Math.hypot(i.x-dh.x,i.z-dh.z)<160,this.hat.visible=n.using===`longtail`,this.updateNeedlefish(e,t),this.updateEagle(e,t),this.updateCoconut(e,t),this.updateMonkeys(e,t),this.updateFisher(e,t),this.updateCrab(e),this.updateFloaters(e,t),this.updateDuck(e,t),n.using===`longtail`&&Math.hypot(r.x-Gh.x,r.z-Gh.z)<20&&n.found(`macaque`,Gh)}updateNeedlefish(e,t){let n=this.bay,r=this.lt.d;if(this.nextSkip-=e,!this.skip&&this.nextSkip<=0&&this.out&&!n.section.startsWith(`village`)){this.nextSkip=8+Math.random()*6;let e=12+Math.random()*6,t=Math.random()<.5?-1:1,n=Math.sin(r.heading),i=Math.cos(r.heading);this.skip={t:0,x:r.x+n*e+i*t*6,z:r.z+i*e-n*t*6,dx:-i*t,dz:n*t}}let i=this.skip;if(!i)return;i.t+=e;let a=.55,o=!1;this.fish.forEach((t,n)=>{let r=i.t-n*.18,s=Math.floor(r/a),c=r%a/a,l=r>0&&s<5;if(t.root.visible=l,!l)return;o=!0;let u=(s+c)*2.6;t.root.position.set(i.x+i.dx*u+i.dz*(n-1)*.7,Math.sin(c*Math.PI)*.8-.05,i.z+i.dz*u-i.dx*(n-1)*.7),t.root.rotation.set(-Math.cos(c*Math.PI)*.6,Math.atan2(i.dx,i.dz),0),t.blink.update(e),c<.1&&s>0&&Math.random()<.5&&this.bay.foam.emit(t.root.position.x,.03,t.root.position.z,0,0,0,1,.7)}),i.t<.1&&$.splash(.25),Math.hypot(this.fish[1].root.position.x-r.x,this.fish[1].root.position.z-r.z)<22&&this.fish[1].root.visible&&n.found(`needlefish`,this.fish[1].root.position),!o&&i.t>1&&(this.skip=null)}startSwoop(){let e=this.lt.d,t=Math.random()<.5?-1:1,n=9+Math.random()*4,r=e.x+Math.sin(e.heading)*n+Math.cos(e.heading)*t*5,i=e.z+Math.cos(e.heading)*n-Math.sin(e.heading)*t*5;this.swoop={t:0,x:r,z:i,from:this.eagle.root.position.clone()}}updateEagle(e,t){let n=this.bay,r=this.lt.d,i=this.eagle;i.blink.update(e);let a=Hh.set(r.x+Math.sin(r.heading)*22,0,r.z+Math.cos(r.heading)*22);this.orbit.lerp(a,1-Math.exp(-e*.25)),this.nextSwoop-=e,!this.swoop&&this.nextSwoop<=0&&this.out&&(this.nextSwoop=18+Math.random()*8,this.startSwoop());let o=this.swoop;if(o){o.t+=e/3.2;let a=Math.min(1,o.t),s=Hh.set(o.x,.4,o.z);if(a<.45){let e=a/.45;i.root.position.lerpVectors(o.from,s,e*e),i.wingL.rotation.z=i.wingR.rotation.z=0,i.wingL.rotation.z=.9*e,i.wingR.rotation.z=-.9*e}else{this.eagleFish.visible||(this.eagleFish.visible=!0,$.splash(.6),n.spray.burst(o.x,.2,o.z,12,2.5,3.5,.2),Math.hypot(o.x-r.x,o.z-r.z)<25&&n.found(`eagle`,i.root.position));let e=(a-.45)/.55,s=Hh.set(o.x+(o.x-o.from.x)*.4*e,.4+e*13,o.z+(o.z-o.from.z)*.4*e);i.root.position.lerp(s,.2);let c=Math.sin(t*14)*.7;i.wingL.rotation.z=c,i.wingR.rotation.z=-c}let c=Hh.copy(s).sub(i.root.position);i.root.rotation.set(0,Math.atan2(c.x,c.z)+(a>.45?Math.PI:0),0),a>=1&&(this.swoop=null,setTimeout(()=>this.eagleFish.visible=!1,2500));return}this.eagleT+=e*.35;let s=this.eagleT,c=this.orbit.x+Math.sin(s)*16,l=this.orbit.z+Math.cos(s)*16,u=13+Math.sin(s*2)*1.5;i.root.position.lerp(Hh.set(c,u,l),1-Math.exp(-e*2)),i.root.rotation.set(0,s+Math.PI/2,-.35);let d=Math.sin(t*6)>.7?Math.sin(t*16)*.5:.08;i.wingL.rotation.z=d,i.wingR.rotation.z=-d}updateCoconut(e,n){let r=this.bay,i=this.nut,a=this.coconut;if(this.scoop){this.scoop.t+=e/.6;let n=Math.min(1,this.scoop.t),r=this.lt.v.body.localToWorld(Hh.set(...Fm.coconut));a.position.lerpVectors(this.scoop.from,r,n),a.position.y+=t(n)*1.2,n>=1&&(this.scoop=null,a.removeFromParent(),a.position.set(...Fm.coconut),a.rotation.set(0,0,0),a.scale.setScalar(.8),this.lt.v.cargo.add(a));return}if(i.in)return;i.x+=i.vx*e,i.z+=i.vz*e,i.vx*=Math.exp(-e*.8),i.vz*=Math.exp(-e*.8),i.spin*=Math.exp(-e);let o=this.lt.d;if(r.using===`longtail`&&r.phase===`drive`)for(let e of this.lt.v.hull.at){let t=o.x+Math.sin(o.heading)*e,n=o.z+Math.cos(o.heading)*e,s=i.x-t,c=i.z-n,l=Math.hypot(s,c),u=this.lt.v.hull.r+.35;if(l<u&&l>1e-4){if(Math.abs(o.speed)<4.2){i.in=!0,this.scoop={t:0,from:a.position.clone()},$.scoop(),r.strike(r.rider(`ji`),`point`,.8),r.say(h.bay.coconut);return}let e=s/l,d=c/l;i.x=t+e*u,i.z=n+d*u;let f=Math.max(2,Math.abs(o.speed)*1.1);i.vx=e*f+o.vx*.5,i.vz=d*f+o.vz*.5,i.spin=6,$.boop(),r.spray.burst(i.x,.2,i.z,6,2,2.5,.16)}}a.position.set(i.x,Em(i.x,i.z,n)+.12,i.z),a.rotation.y+=i.spin*e,a.rotation.z=Math.sin(n*1.7)*.15}updateMonkeys(e,n){let r=this.bay,i=this.lt.d;this.monkeys.forEach((r,a)=>{if(r.blink.update(e),r.root.lookAt(i.x,r.root.position.y,i.z),r.armR.rotation.x=Math.sin(n*2+a*2)*.3-.3,this.flips[a]>=0){this.flips[a]+=e/.8;let n=Math.min(1,this.flips[a]);r.body.rotation.x=-n*Math.PI*2,r.body.position.y=t(n)*.8,n>=1&&(this.flips[a]=-1,r.body.rotation.x=0,r.body.position.y=0)}});let a=Math.hypot(i.x-Gh.x,i.z-Gh.z)<22;!this.heist&&!this.snackGone&&a&&r.using===`longtail`&&r.phase===`drive`&&(this.heist={t:0,phase:`out`,from:this.monkeys[1].root.position.clone()},$.chatter());let o=this.heist;if(!o)return;let s=this.monkeys[1];o.t+=e/(o.phase===`eat`?4:.9);let c=Math.min(1,o.t);if(o.phase===`out`){let e=this.lt.v.body.localToWorld(Hh.set(Fm.mango[0],Fm.mango[1]+.1,Fm.mango[2]));s.root.position.lerpVectors(o.from,e,c),s.root.position.y+=t(c)*2.5,c>=1&&(s.root.position.copy(e),s.armR.add(this.snack),this.snack.position.set(0,-.3,.1),this.snack.scale.setScalar(1.2),r.say(this.bay.packed.includes(`mango`)?h.bay.mango:h.bay.banana),r.rider(`nick`).char.react(`hop`),r.strike(r.rider(`nick`),`point`,1.6),$.chatter(),o.phase=`back`,o.t=0,o.from=e.clone())}else if(o.phase===`back`){let e=Gh.clone().addScaledVector(Wh,.4);s.root.position.lerpVectors(o.from,e,c),s.root.position.y+=t(c)*2.5,c>=1&&(o.phase=`eat`,o.t=0,this.snackGone=!0,r.found(`macaque`,Gh))}else this.snack.scale.setScalar(1.2*(1-c)),s.armR.rotation.x=-1.8+Math.sin(n*10)*.2,Math.floor(o.t*8)!==Math.floor((o.t-e/4)*8)&&$.crunch(),c>=1&&(this.snack.removeFromParent(),this.heist=null)}updateFisher(e,n){let r=this.bay;if(this.fishingBoat.position.y=Em(dh.x,dh.z,n),this.fishingBoat.rotation.z=Math.sin(n*1.2)*.03,this.nextNet-=e,this.netT<0&&this.nextNet<=0&&(this.nextNet=11+Math.random()*5,this.netT=0),this.netT>=0){this.netT+=e/3.2;let n=Math.min(1,this.netT),i=t(Math.min(1,n*1.25));if(this.net.position.y=-1.4+i*1.9,this.fisher.armR.rotation.x=-1.2*i,this.fisher.armL.rotation.x=-1.2*i,i>.9&&Math.random()<e*4){$.flop();let e=this.net.getWorldPosition(Hh);r.spray.burst(e.x,.8,e.z,3,1.5,2,.12)}n>=1&&(this.netT=-1)}if(this.waveT>=0){this.waveT+=e/1.4;let n=Math.min(1,this.waveT);this.fisher.armL.rotation.z=-(2.4+Math.sin(n*30)*.3)*t(n),n>=1&&(this.waveT=-1,this.fisher.armL.rotation.z=0)}}updateCrab(e){if(this.crabT<0)return;this.crabT+=e;let t=this.crab;t.blink.update(e);let n=i(this.crabT/.4,0,1)*(1-i((this.crabT-2.6)/.4,0,1));t.root.visible=n>.01,t.root.position.lerpVectors(this.crabAt,this.crabOut,n),t.root.scale.setScalar(2.2*Math.max(.01,n)),t.claw.rotation.z=Math.sin(this.crabT*14)*.5*n,this.crabT>3&&(this.crabT=-1,t.root.visible=!1)}updateFloaters(e,n){let r=this.bay,i=this.lt.d;for(let[a,o]of this.floaters){if(o.t<1){o.t+=e/.8;let n=Math.min(1,o.t);o.g.position.lerpVectors(o.from,o.to,n),o.g.position.y+=t(n)*2.2,o.g.rotation.x+=e*8,n>=1&&($.plop(),r.foam.emit(o.to.x,.03,o.to.z,0,0,0,1.4,1.2),o.g.rotation.set(a===`hat`?0:-Math.PI/2,0,0));continue}o.g.position.y=Em(o.to.x,o.to.z,n)+.05,o.g.rotation.y+=e*.4,r.using===`longtail`&&r.phase===`drive`&&this.lt.v.hull.at.some(e=>Math.hypot(i.x+Math.sin(i.heading)*e-o.to.x,i.z+Math.cos(i.heading)*e-o.to.z)<1.8)&&(this.floaters.delete(a),o.g.removeFromParent(),$.scoop(),$.giggle(),a===`sunglasses`?(this.shadesUp=!this.shadesUp,this.shades.rotation.z=this.shadesUp?0:Math.PI,r.rider(`nick`).char.rig.head.add(this.shades),r.rider(`nick`).char.react(`hop`)):(r.rider(`ji`).char.rig.head.add(this.hat),r.rider(`ji`).char.react(`hop`)))}}updateDuck(e,n){let r=this.duck;if(!r||!this.rope)return;let i=this.lt,a=this.bay.using===`longtail`;if(r.visible=this.rope.visible=a,!a)return;let o=i.v.body.localToWorld(Hh.set(...qh)).clone(),s=this.duckPos;this.duckSet||(this.duckSet=!0,s.set(o.x-Math.sin(i.d.heading+.5)*Kh,0,o.z-Math.cos(i.d.heading+.5)*Kh)),this.duckVel.multiplyScalar(Math.exp(-e*1.5)),s.addScaledVector(this.duckVel,e);let c=s.x-o.x,l=s.z-o.z,u=Math.hypot(c,l);if(u>Kh){let t=c/u,n=l/u,r=o.x+t*Kh,i=o.z+n*Kh;this.duckVel.x=(r-s.x)/Math.max(e,.001)*.6,this.duckVel.z=(i-s.z)/Math.max(e,.001)*.6,s.x=r,s.z=i}this.duckSpin=Math.max(0,this.duckSpin-e),r.position.set(s.x,Em(s.x,s.z,n)+.02+t(Math.min(1,this.duckSpin))*.5,s.z),r.rotation.set(0,Math.atan2(o.x-s.x,o.z-s.z)-Math.PI/2+this.duckSpin*12,Math.sin(n*2.3)*.12);let d=this.rope.geometry.attributes.position;d.setXYZ(0,o.x,o.y,o.z),d.setXYZ(1,s.x,r.position.y+.3,s.z),d.needsUpdate=!0}qa(){return{coconut:this.nut.in,snack:this.snackGone?`stolen`:`in the boat`,shades:this.floaters.has(`sunglasses`)?`floating`:this.shadesUp?`on`:`upside down`,hat:this.floaters.has(`hat`)?`floating`:`on`}}},Yh=[{id:`wave`,icon:`👋`,label:`Wave`},{id:`cheer`,icon:`🙌`,label:`Cheer`},{id:`heart`,icon:`🫶`,label:`Heart`},{id:`silly`,icon:`🤪`,label:`Silly`}];function Xh(e,t,n,r){let{armL:i,armR:a,head:o,body:s,eyes:c}=e,l=r*r*(3-2*r),u=(e,t,n,r)=>{i.rotation.x+=(e-i.rotation.x)*l,i.rotation.z+=(t-i.rotation.z)*l,a.rotation.x+=(n-a.rotation.x)*l,a.rotation.z+=(r-a.rotation.z)*l};switch(t){case`wave`:u(0,-.25,-.2,2.5+Math.sin(n*12)*.35);break;case`cheer`:u(-.15,-2.15+Math.sin(n*9)*.15,-.15,2.15-Math.sin(n*9)*.15);break;case`heart`:u(-.7,-1.9,-.7,1.9),o.rotation.z=Math.sin(n*3)*.08*l;break;case`silly`:u(-.6,-.9,0,1.7+Math.sin(n*10)*.2),s.rotation.z=.26*l,o.rotation.z=-.35*l,c.scale.y=1-.65*l,e.open?e.mouth.scale.set(1.15,1.6,1):(e.talk.visible=!0,e.mouth.visible=!1,e.talk.scale.set(.9,.75,1));break;case`tiller`:u(-1.25,.4,-1.25,-.4);break;case`point`:u(0,-.2,-1.55,.25);break;case`selfie`:u(0,-.2,-2.1,.55),o.rotation.z=.18*l;break;case`broom`:u(-.3,-.3,-1.6+Math.sin(n*14)*.45,.4)}}function Zh(e){e.armL.rotation.set(0,0,0),e.armR.rotation.set(0,0,0),e.body.rotation.z=0,e.head.rotation.z=0,e.mouth.scale.set(1,1,1)}var Qh=[{id:`ball`,label:`Football`,kind:`thing`},{id:`kids`,label:`The village kids`,kind:`thing`},{id:`cat`,label:`Cat`,kind:`thing`},{id:`laundry:0`,label:`Laundry`,kind:`thing`},{id:`laundry:1`,label:`Laundry`,kind:`thing`},{id:`squid`,label:`Squid drying`,kind:`thing`},{id:`dome`,label:`Golden dome`,kind:`thing`},{id:`grandma`,label:`Grandma`,kind:`thing`}],$h=[`#FFC2A8`,`#D9CCFF`,`#BDE8D8`,`#FFE7A6`,`#FFD1E3`,`#BFE0FF`],eg=[`#E07A8F`,`#7FB2E8`,`#9AD6B0`,`#B9A6F5`,`#F2A65A`],tg=[{species:`buffalo`,height:.95,fur:`#C49A7A`,light:`#F2E2D0`,dark:`#6E5A4E`,ear:`#FFB8CC`,outfit:{kind:`tee`,color:`#FFD27A`,shorts:`#7FB2E8`}},{species:`fox`,height:.9,fur:`#F2B36B`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`,outfit:{kind:`tee`,color:`#FF8FB8`,shorts:`#8FE3C8`},lashes:!0},{species:`elephant`,height:.92,fur:`#B8C4E8`,light:`#E3E8F8`,dark:`#8E9BCB`,ear:`#FFB8CC`,outfit:{kind:`tee`,color:`#8FE3C8`,shorts:`#B9A6F5`}}],ng={species:`elephant`,height:1.35,fur:`#C9C2DA`,light:`#ECE8F4`,dark:`#A79FC2`,ear:`#FFC2D4`,outfit:{kind:`blouse`,color:`#FFB3CF`},extras:[`glasses`],lashes:!0},rg=[-10,6],ig=4.3,ag=new V(rh.lane+rh.laneHalf+.6,2.35,10),og={x:rh.lane+3.3,z:1.6},sg=.38,cg=new V,lg=class{bay;start=lh;here=!1;kids;ball;b={x:sh.x,z:sh.z,y:0,vx:0,vz:0,spin:0};goal=`loose`;goalT=0;hopFrom=new V;hopTo=new V;gift;lines=[];flapT=[-1,-1];squid;squidT=-1;cat;catT=-1;catBoat=new K;grandma;grandmaT=-1;domeT=-1;play={t:0,from:0,to:1};goals=0;playT=0;bumped=!1;hereT=0;called=!1;constructor(e){this.bay=e;let{bag:t,scene:n}=e,r=[...Lh(rh.rock)];ih.forEach((e,t)=>{let n=-e.side,i=e.x+n*.7,a=e.hx*2-1.4,o=$h[t%$h.length],s=eg[t*3%eg.length],c=2.2;for(let t of[-1,0,1])for(let n of[-1,1])r.push(X.cyl(.14,.16,2.8000000000000003,Ih,{at:[e.x+t*(e.hx-.3),c/2-.3,e.z+n*(e.hz-.3)]},6));r.push(X.box(e.hx*2,.22,e.hz*2,`#C9875C`,{at:[e.x,c,e.z]})),r.push(X.box(a,2.4,e.hz*2-.4,o,{at:[i,3.5,e.z]}));let l=i+n*(a/2+.02);r.push(X.box(.06,1.6,.9,`#B07A4A`,{at:[l,3.1,e.z-1.1]})),r.push(X.box(.06,.7,.9,`#8EC9F5`,{at:[l,3.7,e.z+1.2]}),X.box(.08,.1,1.1,`#FFFFFF`,{at:[l,3.3200000000000003,e.z+1.2]}));let u=e.x+n*(e.hx-.15);r.push(X.box(.08,.08,e.hz*2-.2,`#FFFFFF`,{at:[u,3.0500000000000003,e.z]}));for(let t=-2;t<=2;t++)r.push(X.box(.07,.75,.07,`#FFFFFF`,{at:[u,2.68,e.z+t*(e.hz-.3)*.5]}));for(let t of[-1,1])r.push(X.box(a/2+.7,.12,e.hz*2+.3,s,{at:[i+t*(a/4+.25),5.15,e.z],rot:[0,0,-t*.42]}))});let i=rh.dome;r.push(X.cyl(4.2,4.2,.3,`#C9875C`,{at:[i.x,2.2,i.z]},20));for(let e=0;e<8;e++)r.push(X.cyl(.18,.2,2.8,Ih,{at:[i.x+Math.sin(e*.785)*3.8,.9,i.z+Math.cos(e*.785)*3.8]},6));r.push(X.cyl(3,3.1,4.2,`#FFF7F0`,{at:[i.x,4.4,i.z]},20)),r.push(...Array.from({length:8},(e,t)=>X.box(.5,1.4,.08,`#8EC9F5`,{at:[i.x+Math.sin(t*.785)*3.06,4.6,i.z+Math.cos(t*.785)*3.06],rot:[0,t*.785,0]}))),r.push(X.sphere(3.1,Y.gold,{at:[i.x,6.5,i.z],scale:[1,1.2,1]},22),X.cyl(.08,.16,2.4,Y.gold,{at:[i.x,11,i.z]},8),X.sphere(.3,Y.gold,{at:[i.x,10.2,i.z]},10));let a=oh;r.push(X.box(a.hx*2,.35,a.hz*2,`#C9875C`,{at:[a.x,.25,a.z]}));for(let e=0;e<6;e++)for(let t of[-1,1])r.push(X.cyl(.4,.4,.9,`#5FA7E8`,{at:[a.x+t*(a.hx-.5),.05,a.z-a.hz+1.2+e*((a.hz*2-2.4)/5)],rot:[Math.PI/2,0,0]},10));r.push(X.box(a.hx*2-.3,.05,a.hz*2-.3,`#8EDB8C`,{at:[a.x,.45,a.z]}));let o=(e,t,n,r)=>X.box(e,.02,t,`#FFFFFF`,{at:[n,.48,r]});r.push(o(a.hx*2-.8,.08,a.x,a.z),X.torus(1.3,.04,`#FFFFFF`,{at:[a.x,.48,a.z],rot:[Math.PI/2,0,0]}));for(let e of[-1,1]){r.push(o(a.hx*2-.8,.08,a.x,a.z+e*(a.hz-.4)),o(.08,a.hz*2-.8,a.x+e*(a.hx-.4),a.z));let t=a.z+e*(a.hz-.4);r.push(...[-1,1].map(e=>X.cyl(.07,.07,1.3,`#FFFFFF`,{at:[a.x+e*1.4,1.1,t]},8)),X.cyl(.07,.07,2.9,`#FFFFFF`,{at:[a.x,1.75,t],rot:[0,0,Math.PI/2]},8)),r.push(X.box(2.8,1.25,.04,`#E5DDFB`,{at:[a.x,1.1,t+e*.55]}),X.box(2.8,.04,.6,`#E5DDFB`,{at:[a.x,1.72,t+e*.28]}))}n.add(Q(Z(r),t,2)),rg.forEach((e,r)=>{let i=new K;i.position.set(rh.lane,ig,e);let a=[X.cyl(.02,.02,rh.laneHalf*2+2,Y.ink,{rot:[0,0,Math.PI/2]},4)];for(let e=0;e<6;e++){let t=-rh.laneHalf+.6+e*((rh.laneHalf*2-1.2)/5),n=[Y.pink,Y.sky,Y.butter,Y.mint,Y.lavender,`#FFFFFF`][(e+r*2)%6];e%2?a.push(X.cone(.4,.9,n,{at:[t,-.5,0]},10)):a.push(X.box(.8,.7,.05,n,{at:[t,-.4,0]}),X.box(.24,.3,.05,n,{at:[t-.45,-.18,0],rot:[0,0,.5]}),X.box(.24,.3,.05,n,{at:[t+.45,-.18,0],rot:[0,0,-.5]}))}i.add(Q(Z(a),t,1.5)),n.add(i),this.lines.push(i),n.add(Q(Z([-1,1].map(t=>X.cyl(.07,.07,2.4,Ih,{at:[rh.lane+t*(rh.laneHalf+.25),3.4,e]},6))),t,1.5))}),this.squid=new K,this.squid.position.copy(ag).setY(ag.y+1.6);let s=[X.cyl(.04,.04,2.6,Ih,{rot:[Math.PI/2,0,0]},6)];for(let e=0;e<7;e++){let t=-1.1+e*.37;s.push(X.capsule(.09,.3,`#FFF1F4`,{at:[0,-.35,t]}),X.cone(.12,.16,`#FFE1EA`,{at:[0,-.1,t]},8),...[-1,0,1].map(e=>X.box(.02,.28,.02,`#FFD6E0`,{at:[e*.05,-.72,t]})))}this.squid.add(Q(Z(s),t,1.5)),n.add(this.squid,Q(Z([-1,1].map(e=>X.cyl(.05,.05,1.7,Ih,{at:[ag.x,ag.y+.8,ag.z+e*1.3]},6))),t,1.5)),this.catBoat.add(Q(Z([X.rbox(1.1,.45,3.4,.18,`#7FB2E8`,{at:[0,.12,0]}),X.box(1.14,.08,3,Y.butter,{at:[0,.32,0]}),X.box(.9,.05,2.7,`#F6D3AE`,{at:[0,.36,0]}),X.rbox(.9,.3,.6,.1,`#FFFFFF`,{at:[0,.5,-.6]})]),t,2)),this.catBoat.position.set(og.x,0,og.z),this.cat=gm(t),this.cat.root.position.set(0,.4,1.1),this.cat.root.rotation.y=-Math.PI/2,this.cat.root.scale.setScalar(1.5),this.catBoat.add(this.cat.root),n.add(this.catBoat);let c=[new V(a.x+2.2,.47,a.z+1.5),new V(a.x+.5,.47,a.z+4.5),new V(a.x,.47,a.z-a.hz+1.4)];this.kids=tg.map((e,r)=>{let i=Zd(e,t);return i.root.position.copy(c[r]),n.add(i.root),{rig:i,life:new tf(i,`kids`),home:c[r].clone(),pos:c[r].clone(),cheer:0,jump:-1}}),this.ball=this.makeBall(),n.add(this.ball),this.gift=this.makeBall(),this.gift.visible=!1,n.add(this.gift),this.grandma=Zd(ng,t),this.grandma.armR.add(Q(Z([X.cyl(.03,.03,1.1,`#B07A4A`,{at:[0,-.1,.2],rot:[1.2,0,0]},6),X.cone(.16,.36,`#F2D38B`,{at:[0,-.38,.65],rot:[1.2+Math.PI,0,0]},10)]),t,1.5)),this.grandma.root.visible=!1,n.add(this.grandma.root),e.stops.has(`village`)&&this.finish()}makeBall(){let e=new K;return e.add(Q(Z([X.sphere(sg,`#FFFFFF`,{},16),...[0,1,2,3,4].map(e=>X.sphere(sg*.32,e%2?Y.hotpink:Y.ink,{at:[Math.sin(e*1.26)*sg*.85,Math.cos(e*2.1)*sg*.5,Math.cos(e*1.26)*sg*.85],scale:[1,1,.5]},8))]),this.bay.bag,1.5)),e}finish(){this.goal=`done`,this.goals=1,this.b.x=oh.x,this.b.z=oh.z,this.b.y=.85,this.giveFootball()}giveFootball(){let e=this.bay.rides.longtail;this.gift.removeFromParent(),this.gift.visible=!0,this.gift.position.set(...Fm.football),this.gift.scale.setScalar(.75),e.v.cargo.add(this.gift)}speedCap(e,t){return 1-(1-ah.cap)*this.closeness(e,t)}closeness(e,t){let n=Math.max(ah.x0-e,0,e-ah.x1),r=Math.max(ah.z0-t,0,t-ah.z1);return 1-i(Math.hypot(n,r)/ah.soft,0,1)}arrive(e,t){let n=this.here,r=this.bay.rides.longtail.d;this.here=Math.hypot(r.x-(oh.x-8),r.z-oh.z)<52,this.here&&!n&&(this.bay.visit(`village`),this.bay.once(`village`,h.bay.facts.village))}sectionNow(){return this.bay.using===`longtail`&&this.here&&this.bay.phase===`drive`?`village`:null}anchorAt(e){if(!(this.here||this.dist()<90)||this.bay.using!==`longtail`)return null;switch(e){case`ball`:return this.goal===`loose`||this.goal===`done`?{at:this.ball.position.clone(),r:.7,prio:3,glow:this.goal===`loose`&&this.here,max:120}:null;case`kids`:return{at:this.kids[0].rig.root.position.clone().lerp(this.kids[1].rig.root.position,.5).setY(1.3),r:1.4,prio:2};case`cat`:return{at:this.cat.root.getWorldPosition(new V).setY(1.2),r:.5,prio:3};case`laundry:0`:case`laundry:1`:return{at:this.lines[Number(e.slice(8))].position.clone().setY(3.8),r:1.4,prio:2};case`squid`:return{at:this.squid.position.clone().setY(ag.y+1.1),r:.9,prio:3};case`dome`:return{at:new V(rh.dome.x,7,rh.dome.z),r:3,prio:2};case`grandma`:return this.grandma.root.visible?{at:this.grandma.root.position.clone().setY(this.grandma.root.position.y+1),r:.7,prio:3}:null}return null}ballToFind(){return this.here&&this.goal===`loose`&&this.bay.using===`longtail`?this.ball.position.clone().setY(.8):null}dist(){let e=this.bay.rides.longtail.d;return Math.hypot(e.x-(oh.x-8),e.z-oh.z)}tap(e){let t=this.bay;switch(e){case`ball`:return this.goal===`loose`?t.driveTo(this.b.x,this.b.z):this.kickAround(),$.boop(),!0;case`kids`:return $.cheer(),this.kids.forEach((e,t)=>e.jump=-t*.12),!0;case`cat`:return $.mrrp(),this.catT=0,t.found(`cat`,this.cat.root.getWorldPosition(new V)),!0;case`laundry:0`:case`laundry:1`:return this.flapT[Number(e.slice(8))]=0,$.flap(),!0;case`squid`:return this.squidT=0,$.flap(),!0;case`dome`:return this.domeT<0&&(this.domeT=0,$.ding()),!0;case`grandma`:return this.grandmaT=Math.min(this.grandmaT,.4),$.swish(),!0}return!1}bumps(e,t,n,r){if(!(e>-50||Math.abs(t-4)>70)){for(let e of ih)r.push([e.x,e.z,e.hx,e.hz]);r.push([oh.x,oh.z,oh.hx,oh.hz]),r.push([og.x,og.z,.6,1.7]),r.push([rh.dome.x,rh.dome.z,4.2,4.2]),n.push([rh.rock.x,rh.rock.z,rh.rock.r])}}bonked(e,t){let n=ih.find(n=>Math.abs(e-n.x)<n.hx+1.2&&Math.abs(t-n.z)<n.hz+1.2);if(!n||this.grandmaT>=0)return;let r=this.grandma.root;r.position.set(n.x-n.side*(n.hx-.7),2.32,n.z),r.rotation.y=n.side>0?-Math.PI/2:Math.PI/2,r.visible=!0,this.grandmaT=0,$.swish()}hint(){return this.here&&this.goal===`loose`?this.ball.position.clone().setY(.6):null}stuckLine(){return this.here&&this.goal===`loose`&&this.bay.phase===`drive`?h.bay.hint.ball:null}update(e,n){let r=this.bay,a=r.rides.longtail.d;this.hereT=this.here?this.hereT+e:0,!this.called&&this.hereT>4.5&&this.goal===`loose`&&(this.called=!0,r.say(h.bay.ball),this.kids.forEach(e=>e.cheer=1.2));let o=r.rig.camera.position,s=Math.hypot(o.x-oh.x,o.z-oh.z)<150;for(let e of this.kids)e.rig.root.visible=s;if(this.catBoat.visible=s,this.updateBall(e,n),this.updateKids(e,n),this.lines.forEach((t,i)=>{if(this.flapT[i]<0&&r.using===`longtail`&&Math.abs(a.z-t.position.z)<2&&Math.abs(a.x-t.position.x)<rh.laneHalf&&(this.flapT[i]=0,$.flap()),this.flapT[i]>=0){this.flapT[i]+=e/1.6;let n=Math.min(1,this.flapT[i]);t.rotation.x=Math.sin(n*24)*.5*(1-n),n>=1&&(this.flapT[i]=-1)}else t.rotation.x=Math.sin(n*1.3+i)*.05}),this.squidT>=0){this.squidT+=e/1.4;let t=Math.min(1,this.squidT);this.squid.rotation.z=Math.sin(t*20)*.35*(1-t),t>=1&&(this.squidT=-1)}let c=this.cat;if(c.blink.update(e),this.catBoat.position.y=Em(og.x,og.z,n)*.6,c.tail.rotation.z=Math.sin(n*2.4)*.4,c.head.lookAt(a.x,1.4,a.z),this.catT>=0){this.catT+=e/1.2;let n=Math.min(1,this.catT);c.root.scale.set(1.5*(1+.15*t(n)),1.5*(1+.25*t(n)),1.5),c.tail.rotation.x=-t(n)*1.2,n>=1&&(this.catT=-1)}if(r.using===`longtail`&&Math.hypot(a.x-og.x,a.z-og.z)<12&&r.found(`cat`,c.root.getWorldPosition(cg)),this.grandmaT>=0){this.grandmaT+=e;let t=this.grandma,n=i(this.grandmaT/.3,0,1)*(1-i((this.grandmaT-2.8)/.3,0,1));t.root.scale.setScalar(Math.max(.01,n)),Xh(t,`broom`,this.grandmaT,Math.min(1,this.grandmaT/.25)),Math.floor(this.grandmaT*2.2)!==Math.floor((this.grandmaT-e)*2.2)&&this.grandmaT<2.6&&$.swish(),this.grandmaT>3.1&&(this.grandmaT=-1,t.root.visible=!1,Zh(t))}if(this.domeT>=0){this.domeT+=e;let n=r.rider(`kaylee`).char;n.rig.head.rotation.x=.45*t(Math.min(1,this.domeT/1.4)),this.domeT>1.4&&(this.domeT=-1)}}updateBall(e,n){let r=this.bay,a=this.b,o=oh,s=r.rides.longtail,c=s.d;if(this.goal===`loose`){a.x+=a.vx*e,a.z+=a.vz*e,a.vx*=Math.exp(-e*.35),a.vz*=Math.exp(-e*.35),a.spin*=Math.exp(-e);let t=Math.hypot(oh.x-a.x,oh.z-a.z);this.bumped&&t<32&&(a.vx+=(oh.x-a.x)/t*e*1.6,a.vz+=(oh.z-a.z)/t*e*1.6);let l=Math.hypot(a.x-sh.x,a.z-sh.z);if(l>30&&(a.vx+=(sh.x-a.x)/l*e*.8,a.vz+=(sh.z-a.z)/l*e*.8),r.using===`longtail`&&r.phase===`drive`)for(let e of s.v.hull.at){let n=c.x+Math.sin(c.heading)*e,i=c.z+Math.cos(c.heading)*e,o=a.x-n,l=a.z-i,u=Math.hypot(o,l),d=s.v.hull.r+sg;if(u<d&&u>1e-4){let e=o/u,s=l/u;a.x=n+e*d,a.z=i+s*d;let f=e+(oh.x-a.x)/t*2,p=s+(oh.z-a.z)/t*2,m=Math.hypot(f,p)||1,h=Math.max(3.5,Math.abs(c.speed)*1.3);a.vx=f/m*h,a.vz=p/m*h,this.bumped=!0,a.spin=8,$.boop(),r.spray.burst(a.x,.2,a.z,5,1.8,2.2,.14),this.kids.forEach(e=>e.cheer=.8)}}for(let e of ih){let t=i(a.x,e.x-e.hx,e.x+e.hx),n=i(a.z,e.z-e.hz,e.z+e.hz),r=Math.hypot(a.x-t,a.z-n);if(r<sg){let i=r>1e-4?(a.x-t)/r:Math.sign(a.x-e.x)||1,o=r>1e-4?(a.z-n)/r:0;a.x=t+i*sg*1.05,a.z=n+o*sg*1.05;let s=a.vx*i+a.vz*o;s<0&&(a.vx-=1.6*s*i,a.vz-=1.6*s*o)}}let u=Math.abs(a.x-o.x)<o.hx+2.5,d=Math.abs(a.z-o.z)<o.hz+2.5;u&&d&&(this.goal=`hop`,this.goalT=0,this.hopFrom.set(a.x,0,a.z),this.hopTo.set(i(a.x,o.x-o.hx+1.2,o.x+o.hx-1.2),.85,i(a.z,o.z-o.hz+1.5,o.z+o.hz-1.5)),$.boing(),this.kids.forEach(e=>e.cheer=1.2)),this.ball.position.set(a.x,Em(a.x,a.z,n)+sg*.55,a.z),this.ball.rotation.x+=a.spin*e,this.ball.rotation.z+=a.vx*e;return}this.goalT+=e;let l=this.kids[0],u=new V(o.x,.85,o.z-o.hz+.2);if(this.goal===`hop`){let n=Math.min(1,this.goalT/.55);this.ball.position.lerpVectors(this.hopFrom,this.hopTo,n),this.ball.position.y=this.hopFrom.y+(this.hopTo.y-this.hopFrom.y)*n+t(n)*1.4,l.pos.lerp(cg.copy(this.hopTo).setY(.47).add(new V(0,0,.8)),Math.min(1,e*3)),this.goalT>1.3&&(this.goal=`kick`,this.goalT=0,$.kick(),l.jump=0)}else if(this.goal===`kick`){let n=Math.min(1,this.goalT/.8);if(this.ball.position.lerpVectors(this.hopTo,u,n),this.ball.position.y+=t(n)*1.2,this.ball.rotation.x-=e*16,n>=1){this.goal=`goal`,this.goalT=0,$.whistle(),$.cheer(),r.say(h.bay.goal),this.goals++,this.kids.forEach((e,t)=>{e.cheer=3.5,e.jump=-t*.15}),r.spray.burst(u.x,1.4,u.z,18,2.5,4,.18);for(let e of r.riders)r.strike(e,`cheer`,1.8)}}else if(this.goal===`goal`)this.ball.position.y=Math.max(.85,this.ball.position.y-e*2),this.goals>1&&this.goalT>1.7?(this.goal=`done`,this.goalT=0,this.playT=0):this.goalT>1.7&&!this.gift.visible&&(r.say(h.bay.thanks),setTimeout(()=>r.once(`khobkhun`,h.bay.facts.khobkhun),2e3),this.kids.forEach(e=>e.cheer=2),this.gift.visible=!0,this.gift.position.copy(this.kids[1].rig.root.position).setY(1.2),this.gift.scale.setScalar(1),this.goal=`gift`,this.goalT=0,this.hopFrom.copy(this.gift.position));else if(this.goal===`gift`){let n=Math.min(1,this.goalT/1),i=s.v.body.localToWorld(cg.set(...Fm.football));this.gift.position.lerpVectors(this.hopFrom,i,n),this.gift.position.y+=t(n)*3,this.gift.rotation.x+=e*10,n>=1&&(this.giveFootball(),$.thump(),r.cheer(r.rider(`kaylee`)),this.goal=`done`,this.goalT=0,this.playT=0,setTimeout(()=>{$.shutter(),r.flash(),r.photo(`village`)},700))}else if(this.goal===`kickout`){let e=Math.min(1,this.goalT/1.1);this.ball.position.lerpVectors(this.hopFrom,this.hopTo,e),this.ball.position.y+=t(e)*2.4,e>=1&&(a.x=this.hopTo.x,a.z=this.hopTo.z,a.vx=a.vz=0,this.bumped=!1,this.goal=`loose`,$.splash(.5),r.foam.emit(a.x,.03,a.z,0,0,0,1.4,1.2))}else{if(this.playT+=e,this.here&&this.goals<3&&this.playT>7&&r.phase===`drive`&&r.using===`longtail`){let e=this.goals%2?new V(oh.x+oh.hx+7,0,oh.z+4):new V(oh.x+3,0,oh.z+oh.hz+7);this.hopFrom.copy(this.ball.position),this.hopTo.copy(e).setY(sg*.55),this.goal=`kickout`,this.goalT=0,$.kick(),$.cheer(),this.kids.forEach(e=>e.cheer=1);return}this.play.t+=e/1.6,this.play.t>=1&&this.kickAround();let n=this.kids[this.play.from].pos,i=this.kids[this.play.to].pos,a=Math.min(1,this.play.t);this.ball.position.lerpVectors(n,i,a),this.ball.position.y=.85+t(a)*.6}}kickAround(){this.play.from=this.play.to,this.play.to=(this.play.to+1+Math.floor(Math.random()*2))%3,this.play.t=0,this.here&&$.kick()}updateKids(e,n){let r=this.bay.rides.longtail.d;for(let[i,a]of this.kids.entries()){let{rig:o}=a;a.life.update(e),(this.goal!==`hop`||i!==0)&&a.pos.lerp(a.home,Math.min(1,e*1.5)),o.root.position.copy(a.pos);let s=this.goal===`loose`?new V(r.x,0,r.z):this.ball.position;o.root.rotation.y=Math.atan2(s.x-a.pos.x,s.z-a.pos.z),a.cheer=Math.max(0,a.cheer-e);let c=Math.min(1,a.cheer*2);if(o.armL.rotation.z=-(.3+1.9*c)+Math.sin(n*10+i)*.2*c,o.armR.rotation.z=.3+1.9*c-Math.sin(n*10+i)*.2*c,a.jump>-1&&(a.jump+=e/.5,a.jump>=0)){let e=Math.min(1,a.jump);o.root.position.y=a.pos.y+t(e)*.5,e>=1&&(a.jump=this.goal===`goal`&&this.goalT<1.5?-.2:-1)}this.goal===`loose`&&(o.body.position.y=Math.abs(Math.sin(n*5+i))*.05)}}photoCamera(e,t){if(e!==`village`)return null;let n=oh;if(t){let e=this.bay.rides.longtail;e.d.place(n.x+n.hx+3.2,n.z+2.5,-Math.PI/2),this.bay.seatAll(e);for(let e of this.bay.riders)Xh(e.char.rig,`cheer`,.3,1);for(let e of this.kids)e.rig.armL.rotation.z=-2.2,e.rig.armR.rotation.z=2.2}let r=this.bay.rides.longtail.d,i=r.x-n.x,a=r.z-n.z,o=Math.hypot(i,a)||1;i/=o,a/=o;let s=Math.min(o,16),c=n.x+i*s,l=n.z+a*s,u=-a*2.5,d=i*2.5;return Sm(46,c+i*9+u,3.6,l+a*9+d,(c+n.x)/2,1.1,(l+n.z)/2)}qa(){return{ball:this.goal}}},ug={kidA:{species:`puppy`,height:1.05,fur:`#E9B486`,light:`#FFF1DC`,dark:`#5A4148`,ear:`#C98A5A`,outfit:{kind:`tee`,color:`#8EC9F5`,shorts:`#5D7BB0`},open:!0},kidB:{species:`pony`,height:1.1,fur:`#FFE0EC`,light:`#FFF6FA`,dark:`#B07A8A`,ear:`#FFB8CC`,mane:[`#B9A6F5`,`#FF8FB8`],hair:`medium`,outfit:{kind:`dress`,color:`#FBEA9A`},lashes:!0}},dg=new V,fg=class{id;root=new K;flipper=new K;rig;height;pos=new V;yaw=0;spin=0;flip=0;lift=0;sitting=!1;arms=`down`;kicking=!1;ring=null;yawGoal=0;moves=[];life;wind=new Xd;gait=0;walkSpeed=0;settle=1;hopK=1;wiggleK=1;scootK=1;ringPop=1;look=null;headYaw=0;phase=Math.random()*10;constructor(e,t,n){this.id=e,this.rig=Zd(n??(e===`kidA`||e===`kidB`?ug[e]:Fd[e]),t),this.height=this.rig.height,this.life=new tf(this.rig),this.flipper.position.y=.45*this.height,this.rig.root.position.y=-.45*this.height,this.flipper.add(this.rig.root),this.root.add(this.flipper),this.root.userData.pick=e===`kaylee`?`kaylee`:`racer:${e}`}setRing(e,t){if(!e){this.ring&&(this.ring.visible=!1);return}if(!this.ring){let n=.22+.13*this.height;this.ring=Q(Z([X.torus(n,.12+.03*this.height,e,{rot:[Math.PI/2,0,0]}),...[0,1,2,3].map(e=>X.box(.06,.05,.26,`#FFFFFF`,{at:[Math.cos(e*Math.PI/2)*n,.1,Math.sin(e*Math.PI/2)*n],rot:[0,-(e*Math.PI)/2,0]}))]),t,2),this.root.add(this.ring)}(!this.ring.visible||this.ringPop>=1)&&(this.ringPop=0),this.ring.visible=!0}get inRing(){return!!this.ring?.visible}place(e,t,n,r=0){this.pos.set(e,t,n),this.yaw=this.yawGoal=r,this.moves=[]}face(e){this.yawGoal=e}walkTo(e,t=2.2,n){this.moves.push({kind:`walk`,to:e.clone(),speed:t,arc:0,t:0,done:n})}hopTo(e,t=.38,n=.35,r){this.moves.push({kind:`hop`,to:e.clone(),speed:t,arc:n,t:0,done:r})}get busy(){return this.moves.length>0}stop(){this.moves=[]}hop(){this.moves.length||(this.hopK=0)}wiggle(){this.wiggleK=0}scoot(){this.scootK=0}land(){this.settle=0}lookAt(e){this.look=e?(this.look??new V).copy(e):null}setWind(e){this.wind.goal=e}update(e,n){let{body:o,head:s,armL:c,armR:l}=this.rig,u=this.height,d=this.moves[0],f=0;if(this.walkSpeed=0,d){if(d.from||(d.from=this.pos.clone(),Math.hypot(d.to.x-d.from.x,d.to.z-d.from.z)>.05&&(this.yawGoal=Math.atan2(d.to.x-d.from.x,d.to.z-d.from.z))),d.kind===`walk`){let t=d.from.distanceTo(d.to);d.t+=e*d.speed/Math.max(.001,t),this.walkSpeed=d.speed}else d.t+=e/d.speed;let n=i(d.t);this.pos.lerpVectors(d.from,d.to,n),d.kind===`hop`&&(f=t(n)*d.arc),n>=1&&(this.moves.shift(),d.kind===`hop`&&(this.settle=0),d.done?.())}let p=Math.atan2(Math.sin(this.yawGoal-this.yaw),Math.cos(this.yawGoal-this.yaw));this.yaw+=p*(1-Math.exp(-e*12)),this.life.update(e),this.wind.update(this.rig,e,n);let m=1+Math.sin(n*2.6+this.phase)*.018,h=0,g=0;if(this.walkSpeed>0){this.gait+=e*Math.PI*3.4*(this.walkSpeed/1.8);let t=Math.abs(Math.sin(this.gait));h+=t*.07*u,m*=1+.06*(t-.5),g=.14}else this.gait=0;if(this.sitting&&(h-=.17*u,m*=.88,g=-.34),this.settle=Math.min(1,this.settle+e/.4),this.settle<1&&(m*=1+r(this.settle,2)*.14),this.hopK=Math.min(1,this.hopK+e/.55),this.hopK<1){let e=this.hopK,n=t(a(e,0,.22)),r=a(e,.2,.85);h+=t(r)*.26*u,m*=1-.14*n-.1*t(a(e,.82,1))+.08*t(r)}this.wiggleK=Math.min(1,this.wiggleK+e/.6),o.rotation.z=Math.sin(this.wiggleK*Math.PI*6)*.16*(1-this.wiggleK)+(this.kicking?Math.sin(n*15)*.22:0),this.scootK=Math.min(1,this.scootK+e/.32);let _=this.scootK<1?Math.sin(this.scootK*Math.PI):0;if(g+=_*.28,o.position.y=h,o.rotation.x=g,o.scale.set(1/Math.sqrt(m),m,1/Math.sqrt(m)),c.rotation.set(0,0,0),l.rotation.set(0,0,0),this.arms===`race`){let e=this.scootK<1?-.9+1.8*a(this.scootK,.15,.8):.15;c.rotation.set(e,0,-.55),l.rotation.set(e,0,.55)}else this.arms===`up`?(c.rotation.z=-2.5+Math.sin(n*9)*.15,l.rotation.z=2.5-Math.sin(n*9+1)*.15):this.arms===`cheer`&&(c.rotation.z=-1.6-Math.max(0,Math.sin(n*9))*.9,l.rotation.z=1.6+Math.max(0,Math.sin(n*9+Math.PI))*.9);let v=0;this.look&&this.flip===0&&(this.root.updateWorldMatrix(!0,!1),this.root.worldToLocal(dg.copy(this.look)),v=i(Math.atan2(dg.x,dg.z),-.9,.9)),this.headYaw+=(v-this.headYaw)*(1-Math.exp(-e*6)),s.rotation.set(0,this.headYaw,0);let y=this.inRing;this.ringPop=Math.min(1,this.ringPop+e/.45),this.ring&&(this.ring.position.y=.06+.12*u,this.ring.scale.setScalar(this.ringPop<1?Math.max(.01,1+r(this.ringPop,2)*.3-(1-this.ringPop)*.6):1)),this.root.position.set(this.pos.x,this.pos.y+f+this.lift+(y?.09:0),this.pos.z),this.root.rotation.y=this.yaw+this.spin,this.flipper.rotation.x=this.flip}},pg={species:`fox`,height:1,fur:`#FF9A4D`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`,outfit:{kind:`tee`,color:`#8FE3C8`,shorts:`#5D7BB0`},open:!0},mg=[{species:`buffalo`,height:1.5,fur:`#94A0C8`,light:`#DCD8EE`,dark:`#4C4F6B`,ear:`#FFB8CC`,outfit:{kind:`polo`,color:`#FF6F6F`},extras:[`cap`],open:!0},{species:`penguin`,height:1.4,fur:`#3F365F`,light:`#FFF6EC`,dark:`#FFA640`,outfit:{kind:`polo`,color:`#FBEA9A`},extras:[`cap`],open:!0}],hg=[ug.kidA,ug.kidB,pg],gg=class{loop;r;i=0;busy=!1;wait=0;slide=null;cheer=0;constructor(e,t,n,r,i=0){this.loop=n,this.r=new fg(`kidA`,t,e),this.r.root.userData.pick=r,this.i=i%n.length;let a=this.firstSpot();this.r.place(a.x,a.y,a.z,0)}firstSpot(){for(let e=1;e<=this.loop.length;e++){let t=this.loop[(this.i-e+this.loop.length)%this.loop.length];if(`walk`in t)return new V(...t.walk);if(`hop`in t)return new V(...t.hop)}return new V}get sliding(){return!!this.slide}poke(){this.r.busy||this.slide?this.r.wiggle():this.r.hop()}update(e,t){let n=this.r;if(this.slide){let t=this.slide;t.u=Math.min(1,t.u+e*t.speed/t.curve.getLength()),n.pos.copy(t.curve.getPointAt(t.u));let r=t.curve.getTangentAt(t.u);n.face(Math.atan2(r.x,r.z)),t.u>=1&&(this.slide=null,n.sitting=!1,n.arms=`down`,n.land(),this.busy=!1)}else this.wait>0?(this.wait-=e,this.wait<=0&&(this.busy=!1,this.cheer>0&&(n.arms=`down`),this.cheer=0)):this.busy||this.next();n.update(e,t)}next(){let e=this.loop[this.i];this.i=(this.i+1)%this.loop.length;let t=this.r;this.busy=!0;let n=()=>this.busy=!1;`walk`in e?t.walkTo(new V(...e.walk),1.6,n):`hop`in e?t.hopTo(new V(...e.hop),e.dur??.45,e.arc??.45,n):`slide`in e?(this.slide={curve:e.slide,u:0,speed:e.speed},t.sitting=!0,t.arms=`up`):`wait`in e?this.wait=e.wait:(this.wait=this.cheer=e.cheer,t.arms=`cheer`)}},_g=`#4DB57A`,vg=`#2F8F5B`,yg=`#FFF1E4`,bg={species:`fox`,height:1.5,fur:`#FF9A4D`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`,outfit:{kind:`shirt`,color:_g},extras:[`cap`],lashes:!0};function xg(e){let t=new K,n=e=>(t.add(e),e),r=v;n(Q(Z([X.box(7,.1,4.2,`#F3E6FF`,{at:[0,-.05,r+2.1]}),...Array.from({length:9},(e,t)=>X.box(.03,.004,4.2,`#E4D6F5`,{at:[-3.2+t*.8,.002,r+2.1]}))]),e,0));let i=(e,t,n,i)=>X.box(t-e,i-n,.2,yg,{at:[(e+t)/2,(n+i)/2,r-.1]});n(Q(Z([i(-3.5,l.x0,0,5),i(l.x1,3.5,0,5),i(l.x0,l.x1,0,l.y0),i(l.x0,l.x1,l.y1,5),X.box(7,.08,.02,_g,{at:[0,1.3,r+.01]}),X.box(l.x1-l.x0+.12,.08,.22,`#FFFFFF`,{at:[(l.x0+l.x1)/2,l.y0,r-.06]}),X.box(l.x1-l.x0+.12,.08,.22,`#FFFFFF`,{at:[(l.x0+l.x1)/2,l.y1,r-.06]}),...[l.x0,(l.x0+l.x1)/2,l.x1].map(e=>X.box(.07,l.y1-l.y0,.2,`#FFFFFF`,{at:[e,(l.y0+l.y1)/2,r-.06]}))]),e,2));let a=document.createElement(`canvas`);a.width=128,a.height=128;let o=a.getContext(`2d`);o.fillStyle=`#BFE6FF`,o.fillRect(0,0,128,128);for(let e=0;e<16;e++)o.fillStyle=e%3?`#FFFFFF`:`#8EC9F5`,o.fillRect(e*8+1,e*37%128-64,4,70),o.fillRect(e*8+1,e*37%128+64,4,70);let s=e.add(new ga(a));s.colorSpace=dt,s.wrapS=s.wrapT=ee,s.repeat.set(3,2);let c=e.add(new Er({map:s,color:`#FFFFFF`})),f=new G(e.add(new Wo(l.x1-l.x0,l.y1-l.y0)),c);f.position.set((l.x0+l.x1)/2,(l.y0+l.y1)/2,r-.12),f.userData.pick=`window`,t.add(f),n(Q(Z([...[[-2.1,.22],[-1.6,.3],[-1.05,.2],[-.6,.26]].map(([e,t])=>X.sphere(t,`#9C95C4`,{at:[e,l.y0+.02,r-.16],scale:[1.2,.7,.3]})),X.box(l.x1-l.x0,.12,.04,`#7FC8F5`,{at:[(l.x0+l.x1)/2,l.y0+.08,r-.13]})]),e,1.5));let p=new K;p.position.set(g.x,g.y,r+.03),p.userData.pick=`sign`;let h=new G(e.add(new Wo(g.w+.5,g.h+.5)),e.add(new Er({color:Y.gold,transparent:!0,opacity:0,depthWrite:!1})));h.position.z=-.02,p.add(h),p.add(Q(Z([X.rbox(g.w,g.h,.06,.1,_g,{}),X.rbox(g.w-.1,g.h-.1,.02,.07,vg,{at:[0,0,.03]}),...[0,1,2].map(e=>X.rbox(.42-e*.08,.05,.02,.02,`#FFFFFF`,{at:[.12,.1-e*.11,.045]}))]),e,2));let S=new K;S.position.set(-.37,0,.06),S.add(Q(Z([X.cyl(.2,.2,.03,`#E5484D`,{rot:[Math.PI/2,0,0]},24),X.prism([[0,-.13],[.11,.1],[-.11,.1]],.03,`#FFD24A`,{at:[0,0,.02]}),X.prism([[-.12,.09],[.12,.09],[.12,.13],[-.12,.13]],.03,`#F2C27B`,{at:[0,0,.025]}),...[[-.03,.04],[.035,.02],[0,-.05]].map(([e,t])=>X.sphere(.022,`#E5484D`,{at:[e,t,.04],scale:[1,1,.4]},10))]),e,2)),p.add(S),t.add(p),n(Q(Z([X.rbox(3.4,.14,.52,.05,_g,{at:[0,.39,u]}),X.rbox(3.4,.36,.5,.04,vg,{at:[0,.16,u]}),X.rbox(3.4,.92,.18,.08,_g,{at:[0,.82,u-.32]}),...[-1.15,-.4,.4,1.15].map(e=>X.box(.02,.7,.02,vg,{at:[e,.9,u-.22]})),X.rbox(.42,.16,.36,.06,Y.pink,{at:[0,.54,u+.02]})]),e,2)),n(Q(Z([X.rbox(m.w,.06,m.d,.025,`#FFFDF8`,{at:[0,m.top-.03,m.z]}),X.box(m.w-.04,.03,.02,_g,{at:[0,m.top-.035,m.z+m.d/2+.002]}),...[-1,1].map(e=>X.cyl(.07,.07,m.top-.06,`#C9C3DA`,{at:[e*1,(m.top-.06)/2,m.z]})),...[-1,1].map(e=>X.cyl(.26,.28,.04,`#C9C3DA`,{at:[e*1,.02,m.z]},24))]),e,2));let C=new K;C.position.set(...d),C.userData.pick=`soda`,C.add(new G(e.add(X.cyl(.07,.06,.22,`#fff`,{at:[0,.11,0]},20)),e.add(new Er({color:`#E8F6FF`,transparent:!0,opacity:.4,depthWrite:!1}))));let w=new K;w.add(Q(Z([X.cyl(.062,.055,.17,`#FF8FB8`,{at:[0,.085,0]},20),X.box(.04,.04,.04,`#FFFFFF`,{at:[.02,.165,.01],rot:[.3,.5,0]}),X.box(.035,.035,.035,`#FFFFFF`,{at:[-.025,.16,-.01],rot:[.5,.2,.3]})]),e,1)),C.add(w),C.add(Q(Z([...Array.from({length:5},(e,t)=>X.cyl(.011,.011,.06,t%2?`#FFFFFF`:Y.hotpink,{at:[.02+t*.006,.17+t*.058,0],rot:[0,0,-.1]},8))]),e,1.5)),t.add(C);let T=new K;T.position.set(...x),T.userData.pick=`rings`,T.add(Q(Z([X.rbox(.26,.06,.18,.02,`#E5484D`,{at:[0,.03,0]}),X.box(.22,.004,.14,`#FFFFFF`,{at:[0,.062,0]})]),e,1.5));let E=[-.06,0,.06].map((t,n)=>{let r=Q(Z([X.torus(.042,.016,`#E7A94B`,{rot:[Math.PI/2-.5,0,0]})]),e,1.5);return r.position.set(t,.085+(n===1?.02:0),0),T.add(r),r});t.add(T);let D=new K;D.position.set(..._),D.userData.pick=`chili`,D.add(Q(Z([X.cyl(.04,.045,.12,`#FFFFFF`,{at:[0,.06,0]},16),X.cyl(.036,.04,.08,`#E5484D`,{at:[0,.045,0]},16),X.cyl(.042,.04,.035,`#C9C3DA`,{at:[0,.135,0]},16),X.sphere(.03,`#C9C3DA`,{at:[0,.15,0],scale:[1,.6,1]})]),e,1.5)),t.add(D);let O=new K;O.position.set(...y),O.userData.pick=`napkins`,O.add(Q(Z([X.rbox(.2,.1,.12,.015,_g,{at:[0,.05,0]}),X.box(.12,.08,.008,`#FFFFFF`,{at:[0,.13,0],rot:[0,0,.12]})]),e,1.5)),t.add(O);let k=Zd(bg,e);return k.root.position.set(...b),k.root.rotation.y=.5,k.root.userData.pick=`server`,t.add(k.root),{root:t,soda:{root:C,level:w},rings:{root:T,rings:E},chili:D,napkins:O,sign:{root:p,halo:h,logo:S},falls:{tex:s,mat:c,mesh:f},server:k}}export{Wm as $,V as $n,Sd as $t,eh as A,jn as An,sp as At,Vm as B,Us as Bn,af as Bt,Ah as C,Ro as Cn,im as Ct,Lh as D,Vo as Dn,up as Dt,Rh as E,K as En,_p as Et,nh as F,Uo as Fn,$ as Ft,_h as G,ci as Gn,Id as Gt,th as H,Go as Hn,Zd as Ht,Km as I,Qa as In,pf as It,vh as J,Jo as Jn,Td as Jt,hh as K,$a as Kn,jd as Kt,Um as L,ta as Ln,df as Lt,bh as M,Er as Mn,Mf as Mt,Jm as N,Zo as Nn,Pf as Nt,Hm as O,Zi as On,cp as Ot,Xm as P,ir as Pn,gf as Pt,yh as Q,B as Qn,Ed as Qt,ih as R,Wo as Rn,lf as Rt,kh as S,Vn as Sn,Mp as St,Bh as T,xi as Tn,lp as Tt,Bm as U,dt as Un,Ld as Ut,Zm as V,ee as Vn,tf as Vt,ph as W,Si as Wn,Fd as Wt,xh as X,Yo as Xn,Z as Xt,Sh as Y,ys as Yn,Od as Yt,mh as Z,Xo as Zn,Q as Zt,Vh as _,Ma as _n,hm as _t,gg as a,md as an,Lm as at,Nh as b,xa as bn,vm as bt,fg as c,od as cn,Tm as ct,Qh as d,rn as dn,xm as dt,bd as en,E as er,rh as et,lg as f,ei as fn,cm as ft,Uh as g,ya as gn,pm as gt,Zh as h,ga as hn,dm as ht,hg as i,dd as in,Nm as it,$m as j,G as jn,Zf as jt,Qm as k,Ho as kn,ap as kt,ng as l,nd as ln,Em as lt,Xh as m,Br as mn,gm as mt,xg as n,gd as nn,Gm as nt,mg as o,pd as on,Pm as ot,Yh as p,Ar as pn,mm as pt,gh as q,Ko as qn,X as qt,pg as r,Y as rn,Fm as rt,ug as s,ud as sn,zm as st,bg as t,Cd as tn,ch as tt,tg as u,td as un,Sm as ut,Jh as v,ba as vn,fm as vt,Ph as w,W as wn,Cp as wt,jh as x,_t as xn,Np as xt,Mh as y,U as yn,_m as yt,Ym as z,Ot as zn,of as zt};
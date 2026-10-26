import{a as e,n as t,t as n}from"./jsx-runtime-D3jfb0Ew.js";import{$o as r,$r as i,Cs as a,Da as o,Kr as s,Qo as c,Ur as l,Vr as u,_o as d,ai as f,ci as p,es as m,go as h,ni as g,ns as _,oi as v,ri as y,rs as b,ti as x,vs as S}from"./index-D-Bz4PDu.js";import{n as C,r as w,t as T}from"./sfx-BBEhXNuN.js";import{$ as E,$n as D,A as O,An as k,At as A,B as j,Bn as M,Bt as ee,C as N,Cn as P,Ct as te,D as ne,Dn as re,Dt as ie,E as ae,En as oe,Et as se,F as ce,Fn as le,Ft as ue,G as de,Gn as fe,Hn as pe,I as F,It as me,J as he,Jn as ge,Kn as I,L as _e,Ln as L,Lt as R,M as ve,Mn as ye,Mt as be,N as xe,Nn as Se,Nt as Ce,O as we,P as Te,Pn as Ee,Pt as De,Q as Oe,R as ke,Rn as Ae,Rt as je,S as Me,Sr as Ne,St as Pe,T as Fe,Tt as Ie,U as Le,Un as Re,Ut as ze,V as Be,Vn as Ve,W as He,Wn as Ue,Wt as We,X as Ge,Xn as Ke,Y as qe,Yn as Je,Z as Ye,Zn as Xe,_ as z,_r as Ze,_t as Qe,a as $e,ar as et,at as tt,b as nt,br as rt,bt as it,c as at,cr as ot,ct as st,dr as ct,dt as lt,et as ut,f as dt,fr as ft,ft as pt,g as mt,gr as ht,gt,hr as _t,ht as B,i as vt,it as yt,j as bt,jn as xt,jt as St,kt as Ct,l as wt,lr as Tt,lt as Et,m as Dt,mr as Ot,mt as kt,nt as At,o as jt,or as V,ot as Mt,p as Nt,pr as Pt,pt as H,q as Ft,qn as It,r as Lt,rt as Rt,s as zt,sr as Bt,st as Vt,t as Ht,tr as Ut,tt as Wt,u as Gt,ur as Kt,ut as qt,v as Jt,vr as Yt,vt as Xt,w as Zt,wt as Qt,x as $t,xr as en,xt as tn,y as nn,yr as rn,yt as an,zn as on,zt as sn}from"./tune-DdnrBEnz.js";var cn=e(t(),1);function ln(e){let t=new URLSearchParams(location.search).get(e);return t===null?new URLSearchParams(location.hash.split(`?`)[1]??``).get(e):t}var un=typeof navigator<`u`&&navigator.webdriver===!0,dn=ln(`fps`),fn=dn!==null&&!isNaN(+dn)?+dn:un?30:60,pn=performance.now();for(let e of[`pointerdown`,`pointermove`,`keydown`,`wheel`,`touchstart`])addEventListener(e,()=>pn=performance.now(),{capture:!0,passive:!0});function mn(e,t=()=>!1){let n=0,r=-1/0,i=performance.now(),a=!1,o=s=>{if(a||(n=requestAnimationFrame(o),document.hidden))return;let c=s-pn,l=fn;if(dn===null&&(un&&c>3e4?l=4:!un&&c>8e3&&t()&&(l=30)),l>0){let e=1e3/l;if(s-r<e-1.5)return;r=s-r>e*2?s:r+e}let u=Math.min(.1,Math.max(0,(s-i)/1e3));i=s,e(s,u)};return n=requestAnimationFrame(o),()=>{a=!0,cancelAnimationFrame(n)}}function hn(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function gn(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var U={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},W={common:{diffuse:{value:new z(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new et(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new z(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new z(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new z(16777215)},opacity:{value:1},center:{value:new et(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},_n={basic:{uniforms:rn([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.fog]),vertexShader:U.meshbasic_vert,fragmentShader:U.meshbasic_frag},lambert:{uniforms:rn([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new z(0)}}]),vertexShader:U.meshlambert_vert,fragmentShader:U.meshlambert_frag},phong:{uniforms:rn([W.common,W.specularmap,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.fog,W.lights,{emissive:{value:new z(0)},specular:{value:new z(1118481)},shininess:{value:30}}]),vertexShader:U.meshphong_vert,fragmentShader:U.meshphong_frag},standard:{uniforms:rn([W.common,W.envmap,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.roughnessmap,W.metalnessmap,W.fog,W.lights,{emissive:{value:new z(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:U.meshphysical_vert,fragmentShader:U.meshphysical_frag},toon:{uniforms:rn([W.common,W.aomap,W.lightmap,W.emissivemap,W.bumpmap,W.normalmap,W.displacementmap,W.gradientmap,W.fog,W.lights,{emissive:{value:new z(0)}}]),vertexShader:U.meshtoon_vert,fragmentShader:U.meshtoon_frag},matcap:{uniforms:rn([W.common,W.bumpmap,W.normalmap,W.displacementmap,W.fog,{matcap:{value:null}}]),vertexShader:U.meshmatcap_vert,fragmentShader:U.meshmatcap_frag},points:{uniforms:rn([W.points,W.fog]),vertexShader:U.points_vert,fragmentShader:U.points_frag},dashed:{uniforms:rn([W.common,W.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:U.linedashed_vert,fragmentShader:U.linedashed_frag},depth:{uniforms:rn([W.common,W.displacementmap]),vertexShader:U.depth_vert,fragmentShader:U.depth_frag},normal:{uniforms:rn([W.common,W.bumpmap,W.normalmap,W.displacementmap,{opacity:{value:1}}]),vertexShader:U.meshnormal_vert,fragmentShader:U.meshnormal_frag},sprite:{uniforms:rn([W.sprite,W.fog]),vertexShader:U.sprite_vert,fragmentShader:U.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:U.background_vert,fragmentShader:U.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:U.backgroundCube_vert,fragmentShader:U.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:U.cube_vert,fragmentShader:U.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:U.equirect_vert,fragmentShader:U.equirect_frag},distanceRGBA:{uniforms:rn([W.common,W.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:U.distanceRGBA_vert,fragmentShader:U.distanceRGBA_frag},shadow:{uniforms:rn([W.lights,W.fog,{color:{value:new z(0)},opacity:{value:1}}]),vertexShader:U.shadow_vert,fragmentShader:U.shadow_frag}};_n.physical={uniforms:rn([_n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new et(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new z(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new et},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new z(0)},specularColor:{value:new z(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new et},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:U.meshphysical_vert,fragmentShader:U.meshphysical_frag};var vn={r:0,b:0,g:0},yn=new O,bn=new kt;function xn(e,t,n,r,i,a,o){let s=new z(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new B(new at(1,1,1),new Se({name:`BackgroundCubeMaterial`,uniforms:Ot(_n.backgroundCube.uniforms),vertexShader:_n.backgroundCube.vertexShader,fragmentShader:_n.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),yn.copy(n.backgroundRotation),yn.x*=-1,yn.y*=-1,yn.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(yn.y*=-1,yn.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(bn.makeRotationFromEuler(yn)),u.material.toneMapped=Jt.getTransfer(r.colorSpace)!==xt,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new B(new Ce(2,2),new Se({name:`BackgroundMaterial`,uniforms:Ot(_n.background.uniforms),vertexShader:_n.background.vertexShader,fragmentShader:_n.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Jt.getTransfer(r.colorSpace)!==xt,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(vn,Yt(e)),r.buffers.color.setClear(vn.r,vn.g,vn.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function Sn(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Cn(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function wn(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Tn(e){let t=this,n=null,r=0,i=!1,a=!1,o=new be,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function En(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new Kt(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var Dn=4,On=[.125,.215,.35,.446,.526,.582],kn=20,An=new Ct,jn=new z,Mn=null,Nn=0,Pn=0,Fn=!1,In=(1+Math.sqrt(5))/2,Ln=1/In,Rn=[new V(-In,Ln,0),new V(In,Ln,0),new V(-Ln,0,In),new V(Ln,0,In),new V(0,In,-Ln),new V(0,In,Ln),new V(-1,1,-1),new V(1,1,-1),new V(-1,1,1),new V(1,1,1)],zn=new V,Bn=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=zn}=i;Mn=this._renderer.getRenderTarget(),Nn=this._renderer.getActiveCubeFace(),Pn=this._renderer.getActiveMipmapLevel(),Fn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Kn(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Gn(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Mn,Nn,Pn),this._renderer.xr.enabled=Fn,e.scissorTest=!1,Un(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Mn=this._renderer.getRenderTarget(),Nn=this._renderer.getActiveCubeFace(),Pn=this._renderer.getActiveMipmapLevel(),Fn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:yt,minFilter:yt,generateMipmaps:!1,type:Be,format:We,colorSpace:Vt,depthBuffer:!1},r=Hn(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Hn(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Vn(r)),this._blurMaterial=Wn(r,e,t)}return r}_compileMaterial(e){let t=new B(this._lodPlanes[0],e);this._renderer.compile(t,An)}_sceneToCubeUV(e,t,n,r,i){let a=new St(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(jn),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new gt({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new B(new at,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(jn),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Un(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Kn()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Gn());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new B(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Un(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,An)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=Rn[(r-t-1)%Rn.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new B(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):kn;m>kn&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${kn}`);let h=[],g=0;for(let e=0;e<kn;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Un(t,3*v*(r>_-Dn?r-_+Dn:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,An)}};function Vn(e){let t=[],n=[],r=[],i=e,a=e-Dn+1+On.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-Dn?s=On[o-e+Dn-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Gt;h.setAttribute(`position`,new wt(f,3)),h.setAttribute(`uv`,new wt(p,2)),h.setAttribute(`faceIndex`,new wt(m,1)),t.push(h),i>Dn&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function Hn(e,t,n){let r=new ct(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Un(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Wn(e,t,n){let r=new Float32Array(kn),i=new V(0,1,0);return new Se({name:`SphericalGaussianBlur`,defines:{n:kn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:qn(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Gn(){return new Se({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:qn(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Kn(){return new Se({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function qn(){return`

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
	`}function Jn(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new Bn(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new Bn(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function Yn(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&en(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function Xn(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(Pt(n)?Je:ge)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Zn(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function Qn(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function $n(e,t,n){let r=new WeakMap,i=new Bt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new N(h,p,m,u);g.type=F,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new et(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function er(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var tr=new Ue,nr=new ne(1,1),rr=new N,ir=new Me,ar=new nt,or=[],sr=[],cr=new Float32Array(16),lr=new Float32Array(9),ur=new Float32Array(4);function dr(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=or[i];if(a===void 0&&(a=new Float32Array(i),or[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function fr(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function pr(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function mr(e,t){let n=sr[t];n===void 0&&(n=new Int32Array(t),sr[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function hr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function gr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fr(n,t))return;e.uniform2fv(this.addr,t),pr(n,t)}}function _r(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(fr(n,t))return;e.uniform3fv(this.addr,t),pr(n,t)}}function vr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fr(n,t))return;e.uniform4fv(this.addr,t),pr(n,t)}}function yr(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(fr(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),pr(n,t)}else{if(fr(n,r))return;ur.set(r),e.uniformMatrix2fv(this.addr,!1,ur),pr(n,r)}}function br(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(fr(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),pr(n,t)}else{if(fr(n,r))return;lr.set(r),e.uniformMatrix3fv(this.addr,!1,lr),pr(n,r)}}function xr(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(fr(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),pr(n,t)}else{if(fr(n,r))return;cr.set(r),e.uniformMatrix4fv(this.addr,!1,cr),pr(n,r)}}function Sr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Cr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fr(n,t))return;e.uniform2iv(this.addr,t),pr(n,t)}}function wr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(fr(n,t))return;e.uniform3iv(this.addr,t),pr(n,t)}}function Tr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fr(n,t))return;e.uniform4iv(this.addr,t),pr(n,t)}}function Er(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Dr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fr(n,t))return;e.uniform2uiv(this.addr,t),pr(n,t)}}function Or(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(fr(n,t))return;e.uniform3uiv(this.addr,t),pr(n,t)}}function kr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fr(n,t))return;e.uniform4uiv(this.addr,t),pr(n,t)}}function Ar(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(nr.compareFunction=515,a=nr):a=tr,n.setTexture2D(t||a,i)}function jr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||ir,i)}function Mr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||ar,i)}function Nr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||rr,i)}function Pr(e){switch(e){case 5126:return hr;case 35664:return gr;case 35665:return _r;case 35666:return vr;case 35674:return yr;case 35675:return br;case 35676:return xr;case 5124:case 35670:return Sr;case 35667:case 35671:return Cr;case 35668:case 35672:return wr;case 35669:case 35673:return Tr;case 5125:return Er;case 36294:return Dr;case 36295:return Or;case 36296:return kr;case 35678:case 36198:case 36298:case 36306:case 35682:return Ar;case 35679:case 36299:case 36307:return jr;case 35680:case 36300:case 36308:case 36293:return Mr;case 36289:case 36303:case 36311:case 36292:return Nr}}function Fr(e,t){e.uniform1fv(this.addr,t)}function Ir(e,t){let n=dr(t,this.size,2);e.uniform2fv(this.addr,n)}function Lr(e,t){let n=dr(t,this.size,3);e.uniform3fv(this.addr,n)}function Rr(e,t){let n=dr(t,this.size,4);e.uniform4fv(this.addr,n)}function zr(e,t){let n=dr(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Br(e,t){let n=dr(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Vr(e,t){let n=dr(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Hr(e,t){e.uniform1iv(this.addr,t)}function Ur(e,t){e.uniform2iv(this.addr,t)}function Wr(e,t){e.uniform3iv(this.addr,t)}function Gr(e,t){e.uniform4iv(this.addr,t)}function Kr(e,t){e.uniform1uiv(this.addr,t)}function qr(e,t){e.uniform2uiv(this.addr,t)}function Jr(e,t){e.uniform3uiv(this.addr,t)}function Yr(e,t){e.uniform4uiv(this.addr,t)}function Xr(e,t,n){let r=this.cache,i=t.length,a=mr(n,i);fr(r,a)||(e.uniform1iv(this.addr,a),pr(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||tr,a[e])}function Zr(e,t,n){let r=this.cache,i=t.length,a=mr(n,i);fr(r,a)||(e.uniform1iv(this.addr,a),pr(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||ir,a[e])}function Qr(e,t,n){let r=this.cache,i=t.length,a=mr(n,i);fr(r,a)||(e.uniform1iv(this.addr,a),pr(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||ar,a[e])}function $r(e,t,n){let r=this.cache,i=t.length,a=mr(n,i);fr(r,a)||(e.uniform1iv(this.addr,a),pr(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||rr,a[e])}function ei(e){switch(e){case 5126:return Fr;case 35664:return Ir;case 35665:return Lr;case 35666:return Rr;case 35674:return zr;case 35675:return Br;case 35676:return Vr;case 5124:case 35670:return Hr;case 35667:case 35671:return Ur;case 35668:case 35672:return Wr;case 35669:case 35673:return Gr;case 5125:return Kr;case 36294:return qr;case 36295:return Jr;case 36296:return Yr;case 35678:case 36198:case 36298:case 36306:case 35682:return Xr;case 35679:case 36299:case 36307:return Zr;case 35680:case 36300:case 36308:case 36293:return Qr;case 36289:case 36303:case 36311:case 36292:return $r}}var ti=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Pr(t.type)}},ni=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ei(t.type)}},ri=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},ii=/(\w+)(\])?(\[|\.)?/g;function ai(e,t){e.seq.push(t),e.map[t.id]=t}function oi(e,t,n){let r=e.name,i=r.length;for(ii.lastIndex=0;;){let a=ii.exec(r),o=ii.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){ai(n,l===void 0?new ti(s,e,t):new ni(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new ri(s),ai(n,e)),n=e}}}var si=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);oi(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function ci(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var li=37297,ui=0;function di(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var fi=new H;function pi(e){Jt._getMatrix(fi,Jt.workingColorSpace,e);let t=`mat3( ${fi.elements.map(e=>e.toFixed(4))} )`;switch(Jt.getTransfer(e)){case st:return[t,`LinearTransferOETF`];case xt:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function mi(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+di(e.getShaderSource(t),r)}return i}function hi(e,t){let n=pi(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function gi(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var _i=new V;function vi(){return Jt.getLuminanceCoefficients(_i),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${_i.x.toFixed(4)}, ${_i.y.toFixed(4)}, ${_i.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function yi(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Si).join(`
`)}function bi(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function xi(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Si(e){return e!==``}function Ci(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function wi(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Ti=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ei(e){return e.replace(Ti,Oi)}var Di=new Map;function Oi(e,t){let n=U[t];if(n===void 0){let e=Di.get(t);if(e!==void 0)n=U[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return Ei(n)}var ki=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ai(e){return e.replace(ki,ji)}function ji(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Mi(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}function Ni(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function Pi(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function Fi(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function Ii(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function Li(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Ri(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Ni(n),l=Pi(n),u=Fi(n),d=Ii(n),f=Li(n),p=yi(n),m=bi(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Si).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Si).join(`
`),_.length>0&&(_+=`
`)):(g=[Mi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Si).join(`
`),_=[Mi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:U.tonemapping_pars_fragment,n.toneMapping===0?``:gi(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,U.colorspace_pars_fragment,hi(`linearToOutputTexel`,n.outputColorSpace),vi(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Si).join(`
`)),o=Ei(o),o=Ci(o,n),o=wi(o,n),s=Ei(s),s=Ci(s,n),s=wi(s,n),o=Ai(o),s=Ai(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=ci(i,i.VERTEX_SHADER,y),S=ci(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=mi(i,x,`vertex`),n=mi(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new si(i,h),T=xi(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,li)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=ui++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var zi=0,Bi=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Vi(e),t.set(e,n)),n}},Vi=class{constructor(e){this.id=zi++,this.code=e,this.usedTimes=0}};function Hi(e,t,n,r,i,a,o){let s=new E,c=new Bi,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=_n[C];D=e.vertexShader,O=e.fragmentShader}else D=a.vertexShader,O=a.fragmentShader,c.update(a),k=c.getVertexShaderID(a),A=c.getFragmentShaderID(a);let j=e.getRenderTarget(),M=e.state.buffers.depth.getReversed(),ee=_.isInstancedMesh===!0,N=_.isBatchedMesh===!0,P=!!a.map,te=!!a.matcap,ne=!!x,re=!!a.aoMap,ie=!!a.lightMap,ae=!!a.bumpMap,oe=!!a.normalMap,se=!!a.displacementMap,ce=!!a.emissiveMap,le=!!a.metalnessMap,ue=!!a.roughnessMap,de=a.anisotropy>0,fe=a.clearcoat>0,pe=a.dispersion>0,F=a.iridescence>0,me=a.sheen>0,he=a.transmission>0,ge=de&&!!a.anisotropyMap,I=fe&&!!a.clearcoatMap,_e=fe&&!!a.clearcoatNormalMap,L=fe&&!!a.clearcoatRoughnessMap,R=F&&!!a.iridescenceMap,ve=F&&!!a.iridescenceThicknessMap,ye=me&&!!a.sheenColorMap,be=me&&!!a.sheenRoughnessMap,xe=!!a.specularMap,Se=!!a.specularColorMap,Ce=!!a.specularIntensityMap,we=he&&!!a.transmissionMap,Te=he&&!!a.thicknessMap,Ee=!!a.gradientMap,De=!!a.alphaMap,Oe=a.alphaTest>0,ke=!!a.alphaHash,Ae=!!a.extensions,je=0;a.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(je=e.toneMapping);let Me={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:O,defines:a.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:N,batchingColor:N&&_._colorsTexture!==null,instancing:ee,instancingColor:ee&&_.instanceColor!==null,instancingMorph:ee&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Vt,alphaToCoverage:!!a.alphaToCoverage,map:P,matcap:te,envMap:ne,envMapMode:ne&&x.mapping,envMapCubeUVHeight:S,aoMap:re,lightMap:ie,bumpMap:ae,normalMap:oe,displacementMap:f&&se,emissiveMap:ce,normalMapObjectSpace:oe&&a.normalMapType===1,normalMapTangentSpace:oe&&a.normalMapType===0,metalnessMap:le,roughnessMap:ue,anisotropy:de,anisotropyMap:ge,clearcoat:fe,clearcoatMap:I,clearcoatNormalMap:_e,clearcoatRoughnessMap:L,dispersion:pe,iridescence:F,iridescenceMap:R,iridescenceThicknessMap:ve,sheen:me,sheenColorMap:ye,sheenRoughnessMap:be,specularMap:xe,specularColorMap:Se,specularIntensityMap:Ce,transmission:he,transmissionMap:we,thicknessMap:Te,gradientMap:Ee,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:De,alphaTest:Oe,alphaHash:ke,combine:a.combine,mapUv:P&&h(a.map.channel),aoMapUv:re&&h(a.aoMap.channel),lightMapUv:ie&&h(a.lightMap.channel),bumpMapUv:ae&&h(a.bumpMap.channel),normalMapUv:oe&&h(a.normalMap.channel),displacementMapUv:se&&h(a.displacementMap.channel),emissiveMapUv:ce&&h(a.emissiveMap.channel),metalnessMapUv:le&&h(a.metalnessMap.channel),roughnessMapUv:ue&&h(a.roughnessMap.channel),anisotropyMapUv:ge&&h(a.anisotropyMap.channel),clearcoatMapUv:I&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:_e&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:L&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:R&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:ve&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:ye&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:be&&h(a.sheenRoughnessMap.channel),specularMapUv:xe&&h(a.specularMap.channel),specularColorMapUv:Se&&h(a.specularColorMap.channel),specularIntensityMapUv:Ce&&h(a.specularIntensityMap.channel),transmissionMapUv:we&&h(a.transmissionMap.channel),thicknessMapUv:Te&&h(a.thicknessMap.channel),alphaMapUv:De&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(oe||de),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(P||De),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:M,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:je,decodeVideoTexture:P&&a.map.isVideoTexture===!0&&Jt.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ce&&a.emissiveMap.isVideoTexture===!0&&Jt.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Ae&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ae&&a.extensions.multiDraw===!0||N)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Me.vertexUv1s=l.has(1),Me.vertexUv2s=l.has(2),Me.vertexUv3s=l.has(3),l.clear(),Me}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=_n[t];n=Ke.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new Ri(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Ui(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Wi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Gi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ki(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Wi),r.length>1&&r.sort(t||Gi),i.length>1&&i.sort(t||Gi)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function qi(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Ki,e.set(t,[i])):n>=r.length?(i=new Ki,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Ji(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new V,color:new z};break;case`SpotLight`:n={position:new V,direction:new V,color:new z,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new z,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new z,groundColor:new z};break;case`RectAreaLight`:n={color:new z,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function Yi(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new et};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new et};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new et,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Xi=0;function Zi(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Qi(e){let t=new Ji,n=Yi(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new kt,o=new kt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Zi);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=W.LTC_FLOAT_1,r.rectAreaLTC2=W.LTC_FLOAT_2):(r.rectAreaLTC1=W.LTC_HALF_1,r.rectAreaLTC2=W.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Xi++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function $i(e){let t=new Qi(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function ea(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new $i(e),t.set(n,[a])):r>=i.length?(a=new $i(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var ta=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,na=`uniform sampler2D shadow_pass;
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
}`;function ra(e,t,n){let r=new ke,i=new et,a=new et,o=new Bt,s=new Qe({depthPacking:ze}),c=new Xt,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Se({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new et},radius:{value:4}},vertexShader:ta,fragmentShader:na}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Gt;m.setAttribute(`position`,new wt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new B(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:te,magFilter:te};d.map!==null&&d.map.dispose(),d.map=new ct(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new ct(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var ia={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function aa(e,t){function n(){let t=!1,n=new Bt,r=null,i=new Bt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ce(e.DEPTH_TEST):le(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=ia[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ce(e.STENCIL_TEST):le(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new z(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,ee=0,N=e.getParameter(e.VERSION);N.indexOf(`WebGL`)===-1?N.indexOf(`OpenGL ES`)!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),M=ee>=2):(ee=parseFloat(/^WebGL (\d)/.exec(N)[1]),M=ee>=1);let P=null,te={},ne=e.getParameter(e.SCISSOR_BOX),re=e.getParameter(e.VIEWPORT),ie=new Bt().fromArray(ne),ae=new Bt().fromArray(re);function oe(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let se={};se[e.TEXTURE_2D]=oe(e.TEXTURE_2D,e.TEXTURE_2D,1),se[e.TEXTURE_CUBE_MAP]=oe(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[e.TEXTURE_2D_ARRAY]=oe(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),se[e.TEXTURE_3D]=oe(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ce(e.DEPTH_TEST),o.setFunc(3),ge(!1),I(1),ce(e.CULL_FACE),me(0);function ce(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function le(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ue(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function de(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function fe(t){return m!==t&&(e.useProgram(t),m=t,!0)}let pe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};pe[103]=e.MIN,pe[104]=e.MAX;let F={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function me(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(le(e.BLEND),h=!1);return}if(h===!1&&(ce(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(pe[n],pe[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(F[r],F[i],F[o],F[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function he(t,n){t.side===2?le(e.CULL_FACE):ce(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ge(r),t.blending===1&&t.transparent===!1?me(0):me(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),L(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ce(e.SAMPLE_ALPHA_TO_COVERAGE):le(e.SAMPLE_ALPHA_TO_COVERAGE)}function ge(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function I(t){t===0?le(e.CULL_FACE):(ce(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function _e(t){t!==O&&(M&&e.lineWidth(t),O=t)}function L(t,n,r){t?(ce(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):le(e.POLYGON_OFFSET_FILL)}function R(t){t?ce(e.SCISSOR_TEST):le(e.SCISSOR_TEST)}function ve(t){t===void 0&&(t=e.TEXTURE0+j-1),P!==t&&(e.activeTexture(t),P=t)}function ye(t,n,r){r===void 0&&(r=P===null?e.TEXTURE0+j-1:P);let i=te[r];i===void 0&&(i={type:void 0,texture:void 0},te[r]=i),(i.type!==t||i.texture!==n)&&(P!==r&&(e.activeTexture(r),P=r),e.bindTexture(t,n||se[t]),i.type=t,i.texture=n)}function be(){let t=te[P];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function xe(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ce(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function we(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Te(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(t){ie.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ie.copy(t))}function Me(t){ae.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ae.copy(t))}function Ne(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Pe(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Fe(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},P=null,te={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new z(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,ie.set(0,0,e.canvas.width,e.canvas.height),ae.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ce,disable:le,bindFramebuffer:ue,drawBuffers:de,useProgram:fe,setBlending:me,setMaterial:he,setFlipSided:ge,setCullFace:I,setLineWidth:_e,setPolygonOffset:L,setScissorTest:R,activeTexture:ve,bindTexture:ye,unbindTexture:be,compressedTexImage2D:xe,compressedTexImage3D:Se,texImage2D:ke,texImage3D:Ae,updateUBOMapping:Ne,uniformBlockBinding:Pe,texStorage2D:De,texStorage3D:Oe,texSubImage2D:Ce,texSubImage3D:we,compressedTexSubImage2D:Te,compressedTexSubImage3D:Ee,scissor:je,viewport:Me,reset:Fe}}function oa(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new et,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):ht(`canvas`)}function h(e,t,n){let r=1,i=Se(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps}function _(t){e.generateMipmap(t)}function v(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?st:Jt.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function b(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function x(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),w(t),t.isVideoTexture&&u.delete(t)}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),E(t)}function w(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&T(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function T(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function E(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function O(){D=0}function k(){let e=D;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function A(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function j(t,i){let a=r.get(t);if(t.isVideoTexture&&be(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{ue(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function M(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){ue(a,t,i);return}n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function ee(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){ue(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function N(t,i){let a=r.get(t);if(t.version>0&&a.__version!==t.version){de(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let P={[oe]:e.REPEAT,[mt]:e.CLAMP_TO_EDGE,[Pe]:e.MIRRORED_REPEAT},ne={[te]:e.NEAREST,[Ie]:e.NEAREST_MIPMAP_NEAREST,[Qt]:e.NEAREST_MIPMAP_LINEAR,[yt]:e.LINEAR,[Mt]:e.LINEAR_MIPMAP_NEAREST,[tt]:e.LINEAR_MIPMAP_LINEAR},re={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function ie(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,P[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,P[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,P[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ne[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ne[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,re[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function se(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,S));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=A(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&T(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ce(e,t,n){return Math.floor(Math.floor(e/n)/t)}function le(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ce(n.start,r.width,4),c=ce(t.start,r.width,4);n.start<=i+1&&a===c&&ce(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function ue(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=se(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=Jt.getPrimaries(Jt.workingColorSpace),r=o.colorSpace===``?null:Jt.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=xe(o,p);let m=a.convert(o.format,o.colorSpace),v=a.convert(o.type),S=y(o.internalFormat,m,v,o.colorSpace,o.isVideoTexture);ie(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=x(o,p);if(o.isDepthTexture)S=b(o.format===ae,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height),D&&le(o,p,m,v)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=Ze(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,v,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,v,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data):m===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=Ze(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,v,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,v,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,v,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=Se(w[0]);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,v,C):n.texImage2D(e.TEXTURE_2D,t,S,m,v,C);o.generateMipmaps=!1}else if(T){if(E){let t=Se(p);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,v,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,v,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function de(t,o,s){if(o.image.length!==6)return;let c=se(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=Jt.getPrimaries(Jt.workingColorSpace),r=o.colorSpace===``?null:Jt.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=xe(o,m[e]);let v=m[0],b=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=y(o.internalFormat,b,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=x(o,v);ie(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,v.width,v.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,b,S,i.data):b===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=Se(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,b,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,b,S,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,b,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,b,S,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,b,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function fe(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=y(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),ye(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,ve(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function pe(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=b(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=ve(n);ye(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=y(o.internalFormat,c,l,o.colorSpace),d=ve(n);r&&ye(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):ye(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function F(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),j(i.depthTexture,0);let o=a.__webglTexture,c=ve(i);if(i.depthTexture.format===1026)ye(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)ye(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function me(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?F(i.__webglFramebuffer[0],t):F(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),pe(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),pe(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function he(t,n,i){let a=r.get(t);n!==void 0&&fe(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&me(t)}function ge(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,C);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&ye(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=y(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=ve(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),pe(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),ie(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)fe(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else fe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),ie(c,a),fe(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),g(a)&&_(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),ie(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)fe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else fe(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&me(t)}function I(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=v(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),_(t),n.unbindTexture()}}}let _e=[],L=[];function R(t){if(t.samples>0){if(ye(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(_e.length=0,L.length=0,_e.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(_e.push(l),L.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,L)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,_e))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function ve(e){return Math.min(i.maxSamples,e.samples)}function ye(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function be(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function xe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Jt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function Se(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=O,this.setTexture2D=j,this.setTexture2DArray=M,this.setTexture3D=ee,this.setTextureCube=N,this.rebindTextures=he,this.setupRenderTarget=ge,this.updateRenderTargetMipmap=I,this.updateMultisampleRenderTarget=R,this.setupDepthRenderbuffer=me,this.setupFrameBufferTexture=fe,this.useMultisampledRTT=ye}function sa(e,t){function n(n,r=``){let i,a=Jt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var ca=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,la=`
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

}`,ua=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ve(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Se({vertexShader:ca,fragmentShader:la,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new B(new Ce(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},da=class extends bt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new ua,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new et,C=null,w=new St;w.viewport=new Bt;let T=new St;T.viewport=new Bt;let E=[w,T],O=new $e,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new ft,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new ft,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new ft,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function M(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,M),r.removeEventListener(`inputsourceschange`,N);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,le.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,M),r.addEventListener(`inputsourceschange`,N),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?ae:Fe,a=_.stencil?D:Ut);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new ct(d.textureWidth,d.textureHeight,{format:We,type:Xe,depthTexture:new ne(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new ct(f.framebufferWidth,f.framebufferHeight,{format:We,type:Xe,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),le.setContext(r),le.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function N(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let P=new V,te=new V;function re(e,t,n){P.setFromMatrixPosition(t.matrixWorld),te.setFromMatrixPosition(n.matrixWorld);let r=P.distanceTo(te),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=T.near=w.near=t,O.far=T.far=w.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,w.layers.mask=O.layers.mask&3,T.layers.mask=O.layers.mask&5;let i=e.parent,a=O.cameras;ie(O,i);for(let e=0;e<a.length;e++)ie(a[e],i);a.length===2?re(O,w,T):O.projectionMatrix.copy(w.projectionMatrix),oe(e,O,i)};function oe(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=ee*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let se=null;function ce(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=E[n];o===void 0&&(o=new St,o.layers.enable(n),o.viewport=new Bt,E[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new ve,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}se&&se(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let le=new hn;le.setAnimationLoop(ce),this.setAnimationLoop=function(e){se=e},this.dispose=function(){}}},fa=new O,pa=new kt;function ma(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Yt(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,fa.copy(o),fa.x*=-1,fa.y*=-1,fa.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(fa.y*=-1,fa.z*=-1),e.envMapRotation.value.setFromMatrix4(pa.makeRotationFromEuler(fa)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function ha(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var ga=class{constructor(e={}){let{canvas:t=_t(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Uint32Array(4),m=new Int32Array(4),h=null,g=null,_=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,b=!1;this._outputColorSpace=k;let x=0,S=0,C=null,w=-1,T=null,E=new Bt,D=new Bt,O=null,A=new z(0),j=0,M=t.width,ee=t.height,N=1,P=null,te=null,ne=new Bt(0,0,M,ee),re=new Bt(0,0,M,ee),ie=!1,ae=new ke,oe=!1,se=!1,ce=new kt,le=new V,ue=new Bt,de={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},fe=!1;function pe(){return C===null?N:1}let F=n;function me(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,ze,!1),t.addEventListener(`webglcontextrestored`,Ve,!1),t.addEventListener(`webglcontextcreationerror`,He,!1),F===null){let t=`webgl2`;if(F=me(t,e),F===null)throw me(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let he,ge,I,_e,L,R,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,Ae,je,Me,Ne,Pe,Fe,Ie;function Le(){he=new Yn(F),he.init(),Pe=new sa(F,he),ge=new wn(F,he,e,Pe),I=new aa(F,he),ge.reversedDepthBuffer&&d&&I.buffers.depth.setReversed(!0),_e=new Qn(F),L=new Ui,R=new oa(F,he,I,L,ge,Pe,_e),ve=new En(y),ye=new Jn(y),be=new gn(F),Fe=new Sn(F,be),xe=new Xn(F,be,_e,Fe),Se=new er(F,xe,be,_e),je=new $n(F,ge,R),De=new Tn(L),Ce=new Hi(y,ve,ye,he,ge,Fe,De),we=new ma(y,L),Te=new qi,Ee=new ea(he),Ae=new xn(y,ve,ye,I,Se,f,s),Oe=new ra(y,Se,ge),Ie=new ha(F,_e,ge,I),Me=new Cn(F,he,_e),Ne=new Zn(F,he,_e),_e.programs=Ce.programs,y.capabilities=ge,y.extensions=he,y.properties=L,y.renderLists=Te,y.shadowMap=Oe,y.state=I,y.info=_e}Le();let Re=new da(y,F);this.xr=Re,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let e=he.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=he.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return N},this.setPixelRatio=function(e){e!==void 0&&(N=e,this.setSize(M,ee,!1))},this.getSize=function(e){return e.set(M,ee)},this.setSize=function(e,n,r=!0){if(Re.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}M=e,ee=n,t.width=Math.floor(e*N),t.height=Math.floor(n*N),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(M*N,ee*N).floor()},this.setDrawingBufferSize=function(e,n,r){M=e,ee=n,N=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(E)},this.getViewport=function(e){return e.copy(ne)},this.setViewport=function(e,t,n,r){e.isVector4?ne.set(e.x,e.y,e.z,e.w):ne.set(e,t,n,r),I.viewport(E.copy(ne).multiplyScalar(N).round())},this.getScissor=function(e){return e.copy(re)},this.setScissor=function(e,t,n,r){e.isVector4?re.set(e.x,e.y,e.z,e.w):re.set(e,t,n,r),I.scissor(D.copy(re).multiplyScalar(N).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(e){I.setScissorTest(ie=e)},this.setOpaqueSort=function(e){P=e},this.setTransparentSort=function(e){te=e},this.getClearColor=function(e){return e.copy(Ae.getClearColor())},this.setClearColor=function(){Ae.setClearColor(...arguments)},this.getClearAlpha=function(){return Ae.getClearAlpha()},this.setClearAlpha=function(){Ae.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(C!==null){let t=C.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=C.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Ae.getClearColor(),r=Ae.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(p[0]=i,p[1]=a,p[2]=o,p[3]=r,F.clearBufferuiv(F.COLOR,0,p)):(m[0]=i,m[1]=a,m[2]=o,m[3]=r,F.clearBufferiv(F.COLOR,0,m))}else r|=F.COLOR_BUFFER_BIT}t&&(r|=F.DEPTH_BUFFER_BIT),n&&(r|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,ze,!1),t.removeEventListener(`webglcontextrestored`,Ve,!1),t.removeEventListener(`webglcontextcreationerror`,He,!1),Ae.dispose(),Te.dispose(),Ee.dispose(),L.dispose(),ve.dispose(),ye.dispose(),Se.dispose(),Fe.dispose(),Ie.dispose(),Ce.dispose(),Re.dispose(),Re.removeEventListener(`sessionstart`,Ye),Re.removeEventListener(`sessionend`,Ze),Qe.stop()};function ze(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),b=!0}function Ve(){console.log(`THREE.WebGLRenderer: Context Restored.`),b=!1;let e=_e.autoReset,t=Oe.enabled,n=Oe.autoUpdate,r=Oe.needsUpdate,i=Oe.type;Le(),_e.autoReset=e,Oe.enabled=t,Oe.autoUpdate=n,Oe.needsUpdate=r,Oe.type=i}function He(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ue(e){let t=e.target;t.removeEventListener(`dispose`,Ue),We(t)}function We(e){Ge(e),L.remove(e)}function Ge(e){let t=L.get(e).programs;t!==void 0&&(t.forEach(function(e){Ce.releaseProgram(e)}),e.isShaderMaterial&&Ce.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=de);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=ut(e,t,n,r,i);I.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=xe.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Fe.setup(i,r,s,n,c);let h,g=Me;if(c!==null&&(h=be.get(c),g=Ne,g.setIndex(h)),i.isMesh)r.wireframe===!0?(I.setLineWidth(r.wireframeLinewidth*pe()),g.setMode(F.LINES)):g.setMode(F.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),I.setLineWidth(e*pe()),i.isLineSegments?g.setMode(F.LINES):i.isLineLoop?g.setMode(F.LINE_LOOP):g.setMode(F.LINE_STRIP)}else i.isPoints?g.setMode(F.POINTS):i.isSprite&&g.setMode(F.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)en(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(he.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?be.get(c).bytesPerElement:1,o=L.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(F,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ke(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,ot(e,t,n),e.side=0,e.needsUpdate=!0,ot(e,t,n),e.side=2):ot(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),g=Ee.get(n),g.init(t),v.push(g),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),g.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ke(a,n,e),r.add(a)}else Ke(t,n,e),r.add(t)}}),g=v.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){L.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}he.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let qe=null;function Je(e){qe&&qe(e)}function Ye(){Qe.stop()}function Ze(){Qe.start()}let Qe=new hn;Qe.setAnimationLoop(Je),typeof self<`u`&&Qe.setContext(self),this.setAnimationLoop=function(e){qe=e,Re.setAnimationLoop(e),e===null?Qe.stop():Qe.start()},Re.addEventListener(`sessionstart`,Ye),Re.addEventListener(`sessionend`,Ze),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(b===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(t),t=Re.getCamera()),e.isScene===!0&&e.onBeforeRender(y,e,t,C),g=Ee.get(e,v.length),g.init(t),v.push(g),ce.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ae.setFromProjectionMatrix(ce,Tt,t.reversedDepth),se=this.localClippingEnabled,oe=De.init(this.clippingPlanes,se),h=Te.get(e,_.length),h.init(),_.push(h),Re.enabled===!0&&Re.isPresenting===!0){let e=y.xr.getDepthSensingMesh();e!==null&&$e(e,t,-1/0,y.sortObjects)}$e(e,t,0,y.sortObjects),h.finish(),y.sortObjects===!0&&h.sort(P,te),fe=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,fe&&Ae.addToRenderList(h,e),this.info.render.frame++,oe===!0&&De.beginShadows();let n=g.state.shadowsArray;Oe.render(n,e,t),oe===!0&&De.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=h.opaque,i=h.transmissive;if(g.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];nt(r,i,e,a)}fe&&Ae.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];et(h,e,r,r.viewport)}}else i.length>0&&nt(r,i,e,t),fe&&Ae.render(e),et(h,e,t);C!==null&&S===0&&(R.updateMultisampleRenderTarget(C),R.updateRenderTargetMipmap(C)),e.isScene===!0&&e.onAfterRender(y,e,t),Fe.resetDefaultState(),w=-1,T=null,v.pop(),v.length>0?(g=v[v.length-1],oe===!0&&De.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,_.pop(),h=_.length>0?_[_.length-1]:null};function $e(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)g.pushLight(e),e.castShadow&&g.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ae.intersectsSprite(e)){r&&ue.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ce);let t=Se.update(e),i=e.material;i.visible&&h.push(e,t,i,n,ue.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ae.intersectsObject(e))){let t=Se.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),ue.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ue.copy(e.boundingSphere.center)),ue.applyMatrix4(e.matrixWorld).applyMatrix4(ce)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&h.push(e,t,s,n,ue.z,o)}}else i.visible&&h.push(e,t,i,n,ue.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)$e(i[e],t,n,r)}function et(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;g.setupLightsView(n),oe===!0&&De.setGlobalState(y.clippingPlanes,n),r&&I.viewport(E.copy(r)),i.length>0&&it(i,t,n),a.length>0&&it(a,t,n),o.length>0&&it(o,t,n),I.buffers.depth.setTest(!0),I.buffers.depth.setMask(!0),I.buffers.color.setMask(!0),I.setPolygonOffset(!1)}function nt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[r.id]===void 0&&(g.state.transmissionRenderTarget[r.id]=new ct(1,1,{generateMipmaps:!0,type:he.has(`EXT_color_buffer_half_float`)||he.has(`EXT_color_buffer_float`)?Be:Xe,minFilter:tt,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Jt.workingColorSpace}));let a=g.state.transmissionRenderTarget[r.id],o=r.viewport||E;a.setSize(o.z*y.transmissionResolutionScale,o.w*y.transmissionResolutionScale);let s=y.getRenderTarget(),c=y.getActiveCubeFace(),l=y.getActiveMipmapLevel();y.setRenderTarget(a),y.getClearColor(A),j=y.getClearAlpha(),j<1&&y.setClearColor(16777215,.5),y.clear(),fe&&Ae.render(n);let u=y.toneMapping;y.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),g.setupLightsView(r),oe===!0&&De.setGlobalState(y.clippingPlanes,r),it(e,n,r),R.updateMultisampleRenderTarget(a),R.updateRenderTargetMipmap(a),he.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,at(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(R.updateMultisampleRenderTarget(a),R.updateRenderTargetMipmap(a))}y.setRenderTarget(s,c,l),y.setClearColor(A,j),d!==void 0&&(r.viewport=d),y.toneMapping=u}function it(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&at(o,t,n,s,l,c)}}function at(e,t,n,r,i,a){e.onBeforeRender(y,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(y,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=2):y.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(y,t,n,r,i,a)}function ot(e,t,n){t.isScene!==!0&&(t=de);let r=L.get(e),i=g.state.lights,a=g.state.shadowsArray,o=i.state.version,s=Ce.getParameters(e,i.state,a,t,n),c=Ce.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?ye:ve).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ue),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return lt(e,s),u}else s.uniforms=Ce.getUniforms(e),e.onBeforeCompile(s,y),u=Ce.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=De.uniform),lt(e,s),r.needsLights=ft(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function st(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=si.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function lt(e,t){let n=L.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ut(e,t,n,r,i){t.isScene!==!0&&(t=de),R.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=C===null?y.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Vt,c=(r.isMeshStandardMaterial?ye:ve).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(m=y.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=h===void 0?0:h.length,v=L.get(r),b=g.state.lights;if(oe===!0&&(se===!0||e!==T)){let t=e===T&&r.id===w;De.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==De.numPlanes||v.numIntersection!==De.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=ot(r,t,i));let E=!1,D=!1,O=!1,k=S.getUniforms(),A=v.uniforms;if(I.useProgram(S.program)&&(E=!0,D=!0,O=!0),r.id!==w&&(w=r.id,D=!0),E||T!==e){I.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),k.setValue(F,`projectionMatrix`,e.projectionMatrix),k.setValue(F,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(F,le.setFromMatrixPosition(e.matrixWorld)),ge.logarithmicDepthBuffer&&k.setValue(F,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(F,`isOrthographic`,e.isOrthographicCamera===!0),T!==e&&(T=e,D=!0,O=!0)}if(i.isSkinnedMesh){k.setOptional(F,i,`bindMatrix`),k.setOptional(F,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(F,`boneTexture`,e.boneTexture,R))}i.isBatchedMesh&&(k.setOptional(F,i,`batchingTexture`),k.setValue(F,`batchingTexture`,i._matricesTexture,R),k.setOptional(F,i,`batchingIdTexture`),k.setValue(F,`batchingIdTexture`,i._indirectTexture,R),k.setOptional(F,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(F,`batchingColorTexture`,i._colorsTexture,R));let j=n.morphAttributes;if((j.position!==void 0||j.normal!==void 0||j.color!==void 0)&&je.update(i,n,S),(D||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,k.setValue(F,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),D&&(k.setValue(F,`toneMappingExposure`,y.toneMappingExposure),v.needsLights&&dt(A,O),a&&r.fog===!0&&we.refreshFogUniforms(A,a),we.refreshMaterialUniforms(A,r,N,ee,g.state.transmissionRenderTarget[e.id]),si.upload(F,st(v),A,R)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(si.upload(F,st(v),A,R),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(F,`center`,i.center),k.setValue(F,`modelViewMatrix`,i.modelViewMatrix),k.setValue(F,`normalMatrix`,i.normalMatrix),k.setValue(F,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Ie.update(n,S),Ie.bind(n,S)}}return S}function dt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function ft(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return x},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(e,t,n){let r=L.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),L.get(e.texture).__webglTexture=t,L.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=L.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let pt=F.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){C=e,x=t,S=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=L.get(e);if(s.__useDefaultFramebuffer!==void 0)I.bindFramebuffer(F.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)R.setupRenderTarget(e);else if(s.__hasExternalTextures)R.rebindTextures(e,L.get(e.texture).__webglTexture,L.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&L.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);R.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=L.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&R.useMultisampledRTT(e)===!1?L.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,E.copy(e.viewport),D.copy(e.scissor),O=e.scissorTest}else E.copy(ne).multiplyScalar(N).floor(),D.copy(re).multiplyScalar(N).floor(),O=ie;if(n!==0&&(i=pt),I.bindFramebuffer(F.FRAMEBUFFER,i)&&r&&I.drawBuffers(e,i),I.viewport(E),I.scissor(D),I.setScissorTest(O),a){let r=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=L.get(e.textures[t]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=L.get(e.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,t.__webglTexture,n)}w=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){I.bindFramebuffer(F.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!ge.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!ge.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s),F.readPixels(t,n,r,i,Pe.convert(c),Pe.convert(l),a))}finally{let e=C===null?null:L.get(C).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=L.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){I.bindFramebuffer(F.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!ge.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!ge.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,d),F.bufferData(F.PIXEL_PACK_BUFFER,a.byteLength,F.STREAM_READ),e.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+s),F.readPixels(t,n,r,i,Pe.convert(l),Pe.convert(u),0);let f=C===null?null:L.get(C).__webglFramebuffer;I.bindFramebuffer(F.FRAMEBUFFER,f);let p=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await rt(F,p,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,d),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,a),F.deleteBuffer(d),F.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;R.setTexture2D(e,0),F.copyTexSubImage2D(F.TEXTURE_2D,n,0,0,o,s,i,a),I.unbindTexture()};let mt=F.createFramebuffer(),ht=F.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(en(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Pe.convert(t.format),_=Pe.convert(t.type),v;t.isData3DTexture?(R.setTexture3D(t,0),v=F.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(R.setTexture2DArray(t,0),v=F.TEXTURE_2D_ARRAY):(R.setTexture2D(t,0),v=F.TEXTURE_2D),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(F.UNPACK_ROW_LENGTH),b=F.getParameter(F.UNPACK_IMAGE_HEIGHT),x=F.getParameter(F.UNPACK_SKIP_PIXELS),S=F.getParameter(F.UNPACK_SKIP_ROWS),C=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,l),F.pixelStorei(F.UNPACK_SKIP_ROWS,u),F.pixelStorei(F.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=L.get(e),r=L.get(t),h=L.get(n.__renderTarget),g=L.get(r.__renderTarget);I.bindFramebuffer(F.READ_FRAMEBUFFER,h.__webglFramebuffer),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(e).__webglTexture,i,d+n),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,L.get(t).__webglTexture,a,m+n)),F.blitFramebuffer(l,u,o,s,f,p,o,s,F.DEPTH_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||L.has(e)){let n=L.get(e),r=L.get(t);I.bindFramebuffer(F.READ_FRAMEBUFFER,mt),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,ht);for(let e=0;e<c;e++)w?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,n.__webglTexture,i),T?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,r.__webglTexture,a),i===0?T?F.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):F.copyTexSubImage2D(v,a,f,p,l,u,o,s):F.blitFramebuffer(l,u,o,s,f,p,o,s,F.COLOR_BUFFER_BIT,F.NEAREST);I.bindFramebuffer(F.READ_FRAMEBUFFER,null),I.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?F.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):F.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):F.texSubImage2D(F.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(F.UNPACK_ROW_LENGTH,y),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(F.UNPACK_SKIP_PIXELS,x),F.pixelStorei(F.UNPACK_SKIP_ROWS,S),F.pixelStorei(F.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&F.generateMipmap(v),I.unbindTexture()},this.initRenderTarget=function(e){L.get(e).__webglFramebuffer===void 0&&R.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?R.setTextureCube(e,0):e.isData3DTexture?R.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?R.setTexture2DArray(e,0):R.setTexture2D(e,0),I.unbindTexture()},this.resetState=function(){x=0,S=0,C=null,I.reset(),Fe.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Tt}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Jt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Jt._getUnpackColorSpace()}},_a=null;function va(){if(_a)return clearTimeout(_a.timer),_a.users++,_a.renderer;let e=document.createElement(`canvas`),t=e.getContext(`webgl2`,{antialias:!0,alpha:!1,stencil:!1,depth:!0,powerPreference:`high-performance`,preserveDrawingBuffer:un});if(!t)throw Error(`WebGL2 is not available`);let n=new ga({canvas:e,context:t});return n.outputColorSpace=k,n.toneMapping=0,n.debug.checkShaderErrors=!1,e.style.cssText=`display:block;width:100%;height:100%;touch-action:none;-webkit-tap-highlight-color:transparent;outline:none`,_a={renderer:n,users:1},n}function ya(e){if(!_a||_a.renderer!==e||(_a.users--,_a.users>0))return;let t=_a;t.timer=setTimeout(()=>{_a!==t||t.users>0||(_a=null,t.renderer.dispose(),t.renderer.forceContextLoss())},6e4)}function ba(e){_a?.renderer===e&&(_a=null)}var xa=n();function Sa({make:e,name:t,qaKey:n,onMode:r,worldRef:i,anchors:a,paused:o=!1}){let s=(0,cn.useRef)(o);s.current=o;let c=(0,cn.useRef)(null),l=(0,cn.useRef)(null),u=(0,cn.useRef)(new Map),d=(0,cn.useRef)(r);d.current=r;let f=(0,cn.useRef)(null),p=(0,cn.useRef)(null);return(0,cn.useEffect)(()=>{let r=c.current,a=va(),o;try{o=e(a)}catch(e){throw ya(a),Error(`${t} could not be built`,{cause:e})}i.current=o,o.setAnchorElements(u.current);let m=a.domElement;r.prepend(m);let h={rig:o.rig,qa:()=>o.qa(),host:r,renderer:a,snapshot:()=>(o.render(),m.toDataURL(`image/png`))};Ne.attach(h);let g=Math.min(window.devicePixelRatio||1,2),_=()=>{let e=r.getBoundingClientRect(),t=r.offsetWidth?e.width/r.offsetWidth:1,n=e.width/t,i=e.height/t;a.setPixelRatio(g),a.setSize(n,i,!1),o.setSize(n,i,l.current?.offsetHeight??104)};_();let v=new ResizeObserver(_);v.observe(r);let y=0,b=()=>{clearTimeout(y),y=window.setTimeout(_,250)};window.addEventListener(`orientationchange`,b),window.visualViewport?.addEventListener(`resize`,b);let x=[],S=0,C=()=>{},w=!1,T=!1,E=()=>{w||T||(w=!0,C=mn((e,t)=>{if(s.current)return;Ne.frozen?o.rig.update(t):o.update(t),o.render(),o.placeAnchors(),x.push(t*1e3),x.length>120&&x.shift();let n=[...x].sort((e,t)=>e-t);o.stats.fps=Math.round(1e3/(x.reduce((e,t)=>e+t,0)/x.length)),o.stats.p95=Math.round(n[Math.floor(n.length*.95)]??0),!un&&!o.calm&&(S=t>.02?S+1:Math.max(0,S-2),S>90&&g>1&&(g=Math.max(1,g-.25),S=0,_()))},()=>s.current||o.calm))},D=!1,O=a.compileAsync(o.scene,o.rig.camera);O.then(()=>D=!0,()=>D=!0),O.then(E,E);let k=e=>{let t=r.getBoundingClientRect(),n=r.offsetWidth?t.width/r.offsetWidth:1;return{x:(e.clientX-t.left)/n,y:(e.clientY-t.top)/n}},A=e=>{let t=k(e),n=f.current;o.pointerMove(t.x,t.y,n?.x??t.x,n?.y??t.y,!!n&&n.pointer===e.pointerId)},j=e=>{let t=f.current;if(!t||t.pointer!==e.pointerId)return;f.current=null;let n=k(e);o.pointerUp(),Math.hypot(n.x-t.x,n.y-t.y)<14&&performance.now()-t.t<900&&o.tap(n.x,n.y,t.id)},M=(e,t)=>{if(e.button>0)return;let n=k(e);f.current={x:n.x,y:n.y,t:performance.now(),pointer:e.pointerId,id:t},o.pointerDown(n.x,n.y,t)},ee=e=>M(e);m.addEventListener(`pointerdown`,ee),window.addEventListener(`pointermove`,A),window.addEventListener(`pointerup`,j),window.addEventListener(`pointercancel`,j),p.current=(e,t)=>M(e.nativeEvent,t);let N=e=>e.preventDefault();r.addEventListener(`gesturestart`,N),r.addEventListener(`gesturechange`,N),r.addEventListener(`dblclick`,N);let P=e=>{e.preventDefault(),C(),ba(a),d.current(`lost`)};return m.addEventListener(`webglcontextlost`,P),window[n]=()=>({mode:`webgl`,...o.qa(),stats:{...o.stats,dpr:g},memory:o.memory()}),()=>{C(),Ne.detach(h),v.disconnect(),clearTimeout(y),window.removeEventListener(`orientationchange`,b),window.visualViewport?.removeEventListener(`resize`,b),m.removeEventListener(`pointerdown`,ee),window.removeEventListener(`pointermove`,A),window.removeEventListener(`pointerup`,j),window.removeEventListener(`pointercancel`,j),m.removeEventListener(`webglcontextlost`,P),r.removeEventListener(`gesturestart`,N),r.removeEventListener(`gesturechange`,N),r.removeEventListener(`dblclick`,N),p.current=null,window[n]&&delete window[n],T=!0;let e=()=>o.dispose();D?e():O.then(e,e),i.current=null,m.remove(),ya(a)}},[]),(0,xa.jsxs)(`div`,{ref:c,style:{position:`absolute`,inset:0,isolation:`isolate`,touchAction:`none`,userSelect:`none`,WebkitUserSelect:`none`},children:[(0,xa.jsx)(`div`,{ref:l,style:{position:`absolute`,left:0,top:0,width:0,height:`var(--top-clear)`,pointerEvents:`none`}}),a({onDown:(e,t)=>p.current?.(e,t),onKey:e=>i.current?.tap(0,0,e),onHover:e=>i.current?.hoverAnchor?.(e)},u.current)]})}var Ca=new V;function wa(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;Ca.copy(t),Ca[r]=0,Ca.normalize();let l=.5*o/(o+s),u=1-Ca.angleTo(e)/c;return Math.sign(Ca[n])===1?u*l:s/(o+s)+l+l*(1-u)}var Ta=class e extends at{constructor(e=1,t=1,n=1,r=2,i=.1){let a=r*2+1;if(i=Math.min(e/2,t/2,n/2,i),super(1,1,1,a,a,a),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:n,segments:r,radius:i},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let s=new V,c=new V,l=new V(e,t,n).divideScalar(2).subScalar(i),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new V,h=.5/a;for(let r=0,a=0;r<u.length;r+=3,a+=2)switch(s.fromArray(u,r),c.copy(s),c.x-=Math.sign(c.x)*h,c.y-=Math.sign(c.y)*h,c.z-=Math.sign(c.z)*h,c.normalize(),u[r+0]=l.x*Math.sign(s.x)+c.x*i,u[r+1]=l.y*Math.sign(s.y)+c.y*i,u[r+2]=l.z*Math.sign(s.z)+c.z*i,d[r+0]=c.x,d[r+1]=c.y,d[r+2]=c.z,Math.floor(r/p)){case 0:m.set(1,0,0),f[a+0]=wa(m,c,`z`,`y`,i,n),f[a+1]=1-wa(m,c,`y`,`z`,i,t);break;case 1:m.set(-1,0,0),f[a+0]=1-wa(m,c,`z`,`y`,i,n),f[a+1]=1-wa(m,c,`y`,`z`,i,t);break;case 2:m.set(0,1,0),f[a+0]=1-wa(m,c,`x`,`z`,i,e),f[a+1]=wa(m,c,`z`,`x`,i,n);break;case 3:m.set(0,-1,0),f[a+0]=1-wa(m,c,`x`,`z`,i,e),f[a+1]=1-wa(m,c,`z`,`x`,i,n);break;case 4:m.set(0,0,1),f[a+0]=1-wa(m,c,`x`,`y`,i,e),f[a+1]=1-wa(m,c,`y`,`x`,i,t);break;case 5:m.set(0,0,-1),f[a+0]=wa(m,c,`x`,`y`,i,e),f[a+1]=1-wa(m,c,`y`,`x`,i,t)}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}};function Ea(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Gt,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Da(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Da(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function Da(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new wt(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function Oa(e,t=1e-4){t=Math.max(t,2**-52);let n={},r=e.getIndex(),i=e.getAttribute(`position`),a=r?r.count:i.count,o=0,s=Object.keys(e.attributes),c={},l={},u=[],d=[`getX`,`getY`,`getZ`,`getW`],f=[`setX`,`setY`,`setZ`,`setW`];for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.attributes[n];c[n]=new r.constructor(new r.array.constructor(r.count*r.itemSize),r.itemSize,r.normalized);let i=e.morphAttributes[n];i&&(l[n]||(l[n]=[]),i.forEach((e,t)=>{let r=new e.array.constructor(e.count*e.itemSize);l[n][t]=new e.constructor(r,e.itemSize,e.normalized)}))}let p=t*.5,m=10**Math.log10(1/t),h=p*m;for(let t=0;t<a;t++){let i=r?r.getX(t):t,a=``;for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),o=r.itemSize;for(let e=0;e<o;e++)a+=`${~~(r[d[e]](i)*m+h)},`}if(a in n)u.push(n[a]);else{for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),a=e.morphAttributes[n],u=r.itemSize,p=c[n],m=l[n];for(let e=0;e<u;e++){let t=d[e],n=f[e];if(p[n](o,r[t](i)),a)for(let e=0,r=a.length;e<r;e++)m[e][n](o,a[e][t](i))}}n[a]=o,u.push(o),o++}}let g=e.clone();for(let t in e.attributes){let e=c[t];if(g.setAttribute(t,new e.constructor(e.array.slice(0,o*e.itemSize),e.itemSize,e.normalized)),t in l)for(let e=0;e<l[t].length;e++){let n=l[t][e];g.morphAttributes[t][e]=new n.constructor(n.array.slice(0,o*n.itemSize),n.itemSize,n.normalized)}}return g.setIndex(u),g}function ka(e,t){if(t===0)return console.warn(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.`),e;if(t===2||t===1){let n=e.getIndex();if(n===null){let t=[],r=e.getAttribute(`position`);if(r!==void 0){for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),n=e.getIndex()}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.`),e}let r=n.count-2,i=[];if(t===2)for(let e=1;e<=r;e++)i.push(n.getX(0)),i.push(n.getX(e)),i.push(n.getX(e+1));else for(let e=0;e<r;e++)e%2==0?(i.push(n.getX(e)),i.push(n.getX(e+1)),i.push(n.getX(e+2))):(i.push(n.getX(e+2)),i.push(n.getX(e+1)),i.push(n.getX(e)));i.length/3!==r&&console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.`);let a=e.clone();return a.setIndex(i),a.clearGroups(),a}return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:`,t),e}var G={pink:`#FF8FB8`,hotpink:`#FF4F9A`,lavender:`#D9CCFF`,lavenderDark:`#B9A6F5`,butter:`#FBEA9A`,mint:`#8FE3C8`,sky:`#A8DCFF`,peach:`#FFC2A8`,cream:`#FFF7F0`,gold:`#FFC83D`,ink:`#2B2330`},Aa=null;function ja(){return Aa||(Aa=new Zt(new Uint8Array(Ht.bands.length*4),Ht.bands.length,1,We),Aa.minFilter=Aa.magFilter=te,Aa.generateMipmaps=!1,Ma()),Aa}function Ma(){if(!Aa)return;let e=Aa.image.data;Ht.bands.forEach((t,n)=>t.forEach((t,r)=>e[n*4+r]=Math.round(t*255))),Ht.bands.forEach((t,n)=>e[n*4+3]=255),Aa.needsUpdate=!0}var Na=new Map;function Pa(e=`#ffffff`,t=!1){let n=`${new z(e).getHexString()}|${t}`,r=Na.get(n);return r||(r=new tn({color:e,vertexColors:t,gradientMap:ja()}),Na.set(n,r)),r}function Fa(e){let t=new Lt(`#FFF7F0`,Ht.ambient*Math.PI),n=new we(`#FFF7F0`,Ht.sun*Math.PI);return n.position.set(5,10,7),e.add(t,n,n.target),{ambient:t,sun:n,follow(e,r,i){n.target.position.set(e,r,i),n.position.set(e+5,r+10,i+7),t.intensity=Ht.ambient*Math.PI,n.intensity=Ht.sun*Math.PI}}}var Ia={uRes:{value:[1,1]},uScale:{value:1},...Ke.clone(W.fog)};function La(e,t){Ia.uRes.value=[Math.max(1,e),Math.max(1,t)],Ia.uScale.value=Ht.outline}var Ra=`
  #include <fog_pars_vertex>
  uniform vec2 uRes;
  uniform float uPx;
  uniform float uScale;
  uniform float uBias;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Slid toward the camera along its own view ray (same spot on screen, only nearer), so a line where one piece
    // rests on another (bangs on the forehead) isn't hidden by the surface it rests on.
    mvPosition.xyz -= normalize(mvPosition.xyz) * uBias;
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
`,za=`
  #include <fog_pars_fragment>
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <fog_fragment>
  }
`,Ba=new Map;function Va(e,t=G.ink,n=0){let r=`${e}|${t}|${n}`,i=Ba.get(r);return i||(i=new Se({uniforms:{...Ia,uPx:{value:e},uColor:{value:new z(t)},uBias:{value:n}},vertexShader:Ra,fragmentShader:za,side:1,fog:!0}),Ba.set(r,i)),i}function Ha(e){let t=e.clone();for(let e of Object.keys(t.attributes))e!==`position`&&t.deleteAttribute(e);let n=Oa(t,.001);return t.dispose(),n.computeVertexNormals(),n}function Ua(e,t){let n=new B(Ha(e),Va(t));return n.userData.hull=t,n}function Wa(e,t){let n=e.userData.hull;n!==void 0&&(e.material=Va(n,t?G.hotpink:G.ink,e.userData.hullBias??0))}var Ga=new z;function Ka(e,t,n={}){let r=e.index?e.toNonIndexed():e;r!==e&&e.dispose();for(let e of Object.keys(r.attributes))e!==`position`&&e!==`normal`&&r.deleteAttribute(e);let i=new kt().compose(new V(...n.at??[0,0,0]),new je().setFromEuler(new O(...n.rot??[0,0,0])),new V(...n.scale??[1,1,1]));r.applyMatrix4(i),Ga.set(t);let a=r.attributes.position.count,o=new Float32Array(a*3);for(let e=0;e<a;e++)o.set([Ga.r,Ga.g,Ga.b],e*3);return r.setAttribute(`color`,new wt(o,3)),r}var K={box:(e,t,n,r,i)=>Ka(new at(e,t,n),r,i),rbox:(e,t,n,r,i,a)=>Ka(new Ta(e,t,n,2,Math.min(r,e/2,t/2,n/2)*.999),i,a),cyl:(e,t,n,r,i,a=16)=>Ka(new $t(e,t,n,a),r,i),cone:(e,t,n,r,i=16)=>Ka(new nn(e,t,i),n,r),sphere:(e,t,n,r=18)=>Ka(new M(e,r,Math.round(r*.7)),t,n),capsule:(e,t,n,r)=>Ka(new Nt(e,t,5,14),n,r),torus:(e,t,n,r,i=Math.PI*2)=>Ka(new I(e,t,8,24,i),n,r),prism:(e,t,n,r)=>{let i=new Ee(e.map(([e,t])=>new et(e,t)));return Ka(new xe(i,{depth:t,bevelEnabled:!1}).translate(0,0,-t/2),n,r)}};function q(e){let t=Ea(e,!1);for(let t of e)t.dispose();if(!t)throw Error(`merge: parts have different attributes`);return t}function J(e,t,n=2){let r=new j,i=new B(t.add(e),Pa(`#ffffff`,!0));if(r.add(i),n>0){let i=Ua(e,n);t.add(i.geometry),r.add(i)}return r}function qa(e,t,n,r=2){let i=new j,a=Ea([...e,...t],!1),o=r>0&&e.length?Ea(e,!1):null;for(let n of[...e,...t])n.dispose();if(!a)throw Error(`solidMix: parts have different attributes`);if(i.add(new B(n.add(a),Pa(`#ffffff`,!0))),o){let e=Ua(o,r);o.dispose(),n.add(e.geometry),i.add(e)}return i}var Ja=null;function Ya(e,t){if(!Ja){let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);n.addColorStop(0,`rgba(43,35,48,0.34)`),n.addColorStop(.62,`rgba(43,35,48,0.2)`),n.addColorStop(1,`rgba(43,35,48,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),Ja=new dt(e)}let n=new B(t.add(new Ce(e*2,e*2)),Za());return n.rotation.x=-Math.PI/2,n.position.y=.012,n.renderOrder=1,n}var Xa=null,Za=()=>Xa??=new gt({map:Ja,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4}),Qa=[`sunhat`,`spare-hat`,`sunglasses`,`floaties`,`scrubs`,`scrub-cap`,`apron`,`chef-hat`,`smock`,`gloves`,`mongkhon`],$a={species:`fox`,fur:`#FF9A4D`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`},eo={species:`buffalo`,fur:`#94A0C8`,light:`#DCD8EE`,dark:`#4C4F6B`,ear:`#FFB8CC`},to={species:`penguin`,fur:`#3F365F`,light:`#FFF6EC`,dark:`#FFA640`},no={kaylee:{species:`unicorn`,height:1,fur:`#CDB9F6`,light:`#F4EDFF`,dark:`#A88EE8`,ear:`#FFB3D1`,mane:[`#FF6FAE`,`#FBE27A`,`#8FE3C8`,`#8EC9F5`],hair:`medium`,outfit:{kind:`dress`,color:`#FF5FA2`},lashes:!0},ji:{species:`unicorn`,height:1.55,chub:1.15,fur:`#FFF5EF`,light:`#FFE8E0`,dark:`#BBA3F2`,ear:`#FFC9D6`,mane:[`#C7A6F2`,`#FF9CC8`,`#B494EE`,`#FFB8D8`],hair:`long`,outfit:{kind:`dress`,color:`#FFB79E`},lashes:!0},nick:{species:`unicorn`,height:1.7,fur:`#A9EBD6`,light:`#E2FAF1`,dark:`#9C86DA`,ear:`#FFB3C7`,mane:[`#8EC9F5`,`#B9A6F5`],hair:`short`,outfit:{kind:`polo`,color:`#FBE78A`},open:!0},agong:{species:`panda`,height:1.45,fur:`#FFF6EE`,light:`#FFFDF8`,dark:`#4A3F4F`,ear:`#FFB3C7`,outfit:{kind:`shirt`,color:`#FFF0DA`},extras:[`glasses`,`moustache`,`cane`]},jum:{species:`elephant`,height:1.5,chub:1.25,fur:`#FFB3CF`,light:`#FFE3EE`,dark:`#F28CB3`,ear:`#FF94BC`,outfit:{kind:`blouse`,color:`#A7EBD0`},lashes:!0},joy:{...$a,height:1.5,outfit:{kind:`blouse`,color:`#FFF7F3`,lace:`#FF9CC0`},hairdo:{style:`bob`,color:`#7A4636`},smile:`teeth`,cheeks:.8,lashes:!0},gan:{...$a,height:1.32,outfit:{kind:`tee`,color:`#8FC9F5`,shorts:`#5D7BB0`},extras:[`cap`,`phone`]},ken:{...$a,height:1.25,outfit:{kind:`tee`,color:`#8FE3C8`},extras:[`round-glasses`,`phone`]},bird:{...eo,height:1.65,outfit:{kind:`shirt`,color:`#3A3346`,print:[`#FF8A3D`,`#FF5A6E`,`#FFC845`]},hairdo:{style:`spiky`,color:`#2F2A3A`}},bb:{...eo,height:1.2,outfit:{kind:`dress`,color:`#FF8FB8`},extras:[`pigtails`,`phone`],lashes:!0},ja:{...to,height:1.45,extras:[`scarf`],lashes:!0,open:!0},putto:{...to,height:1,outfit:{kind:`tee`,color:`#8FE3C8`},extras:[`tuft`],open:!0},putter:{...to,height:.78,fur:`#B9B4D6`,extras:[`bib`]},sri:{species:`hornbill`,height:1.5,fur:`#4A3F4F`,light:`#FFF1DC`,dark:`#FFB43C`,outfit:{kind:`blouse`,color:`#C9B5F7`},lashes:!0}},ro={puppy:{species:`puppy`,height:.9,chub:1.1,fur:`#F4C47E`,light:`#FFF1DC`,dark:`#4A3640`,ear:`#D99A55`,open:!0},pony:{species:`pony`,height:.98,fur:`#E9B486`,light:`#FFF0E0`,dark:`#8A5A4A`,ear:`#FFC2C8`,mane:[`#9A5E4E`,`#B87A62`],hair:`medium`,lashes:!0},elephant:{species:`elephant`,height:.92,chub:1.25,fur:`#B9B3D6`,light:`#E4E0F2`,dark:`#9C95C4`,ear:`#FFB8CC`,lashes:!0}},io={species:`monkey`,height:1.15,fur:`#C08A5E`,light:`#FFE6CC`,dark:`#7A5340`,ear:`#FFC2B0`,outfit:{kind:`tee`,color:`#C08A5E`,shorts:`#3E6FD8`},extras:[`mongkhon`,`gloves`],open:!0},ao=`#2E2233`,oo=`#FF9DB8`,so=`#7A2745`,co=`#FF8FA8`,lo=`#FFFFFF`,uo=(e,t,n,r,i)=>K.cyl(e,t,n,r,i,20);function fo(e){let t=e.height,n=e.species===`penguin`,r=e.species===`hornbill`,i=(n?.27:e.species===`panda`||e.species===`elephant`?.26:r?.22:e.species===`puppy`?.25:.24)*t,a=e.chub??1,o=n?.2*t:i*.92;return{H:t,R:i,headY:o,shoulder:n?[.3*t,.5*t,0]:[.155*t*a,.47*t,0],eyeX:e.species===`unicorn`||e.species===`pony`?.37*i:r?.46*i:.36*i,eyeY:e.species===`unicorn`||e.species===`pony`?.12*i:n?.02*i:r?.14*i:.05*i,eyeSize:.21*i,lift:n?.12*i:e.species===`monkey`?.07*i:0,on:(e,t,n=0)=>[e,o+t,Math.sqrt(Math.max(0,i*i-e*e-t*t))+n],turnTo:e=>[0,Math.asin(Math.max(-1,Math.min(1,e/i))),0]}}var po=e=>Qa.includes(e),mo=`#7FB2F0`,ho=`#5D8FD6`;function go(e,t,n){let{H:r,R:i,headY:a,eyeX:o,eyeY:s,on:c,turnTo:l}=t,u={head:[],headPlain:[],armL:[],armR:[],body:[],bodyPlain:[]};if(e===`sunhat`||e===`spare-hat`){let t=e===`sunhat`,n=t?`#FBEA9A`:`#FFC2A8`,r=t?`#FF4F9A`:`#B9A6F5`,o=-.16*i,s=a+.64*i;u.head.push(K.cyl(1.24*i,1.28*i,.07*i,n,{at:[0,s,o+.1*i]},32),K.torus(1.26*i,.07*i,n,{at:[0,s+.04*i,o+.1*i],rot:[Math.PI/2,0,0]}),K.cyl(.6*i,.66*i,.26*i,n,{at:[0,s+.15*i,o]},24),K.sphere(.6*i,n,{at:[0,s+.27*i,o],scale:[1,.42,1]},24),K.cyl(.675*i,.69*i,.14*i,r,{at:[0,s+.1*i,o]},24));let c=[.46*i,s+.12*i,o+.5*i];if(t){for(let e of[-1,1])u.head.push(K.sphere(.13*i,r,{at:[c[0]+e*.13*i,c[1],c[2]],rot:[0,.75,e*.5],scale:[1.2,.75,.45]}));u.head.push(K.sphere(.06*i,r,{at:c}))}else{for(let e=0;e<5;e++){let t=e/5*Math.PI*2;u.head.push(K.sphere(.07*i,`#FFFFFF`,{at:[c[0]+Math.cos(t)*.08*i,c[1]+Math.sin(t)*.08*i,c[2]],rot:[0,.75,0],scale:[1,1,.4]}))}u.headPlain.push(K.sphere(.055*i,`#FFC83D`,{at:[c[0],c[1],c[2]+.02*i]}))}}if(e===`sunglasses`){let e=t.lift+.13*i,n=(t,n,r,a,o)=>{let u=l(t);for(let l of[-1,1])o.push(K.sphere(.12*i*n,r,{at:c(t+l*.085*i*n,s+.04*i,e+a),rot:u,scale:[1,1,.3]},14));o.push(K.cone(.19*i*n,.22*i*n,r,{at:c(t,s-.1*i*n,e+a),rot:[Math.PI,u[1],0],scale:[1,1,.3]},14))};for(let t of[-1,1]){let r=t*o;n(r,1.22,`#FF4F9A`,0,u.head),n(r,.9,`#5A3F66`,.012*i,u.head),u.headPlain.push(K.sphere(.05*i,`#FFFFFF`,{at:c(r-t*.07*i,s+.08*i,e+.05*i),rot:l(r),scale:[1,.7,.3]})),u.headPlain.push(K.sphere(.022*i,`#FFFFFF`,{at:c(r+t*.05*i,s-.04*i,e+.05*i),rot:l(r),scale:[1,1,.3]}))}u.head.push(K.capsule(.035*i,o*2-.5*i,`#FF4F9A`,{at:c(0,s+.07*i,e+.02*i),rot:[0,0,Math.PI/2]}))}if(e===`scrubs`){u.body.push(K.capsule(.172*r,.06*r,mo,{at:[0,.37*r,0]})),u.body.push(K.cyl(.168*r,.248*r,.18*r,mo,{at:[0,.232*r,0]},20));for(let e of[-1,1])u.body.push(K.capsule(.078*r,.05*r,ho,{at:[e*.085*r,.115*r,0]}));u.body.push(K.rbox(.07*r,.06*r,.012*r,.008*r,ho,{at:[.075*r,.42*r,.165*r],rot:[0,.4,0]})),u.body.push(K.cyl(.008*r,.008*r,.06*r,`#FF4F9A`,{at:[.06*r,.46*r,.168*r],rot:[0,0,.15]}));for(let e of[-1,1])u.bodyPlain.push(K.box(.012*r,.08*r,.01*r,`#FFFFFF`,{at:[e*.022*r,.505*r,.152*r],rot:[-.35,0,e*.5]}));for(let[e,t]of[[`armL`,-1],[`armR`,1]])u[e].push(K.sphere(.074*r,mo,{at:[t*.006*r,-.02*r,0]}))}if(e===`scrub-cap`){let e=-.12*i;u.head.push(K.sphere(1*i,mo,{at:[0,a+.4*i,e],scale:[1.07,.7,1.05]},24)),u.head.push(K.torus(.98*i,.07*i,ho,{at:[0,a+.42*i,e],rot:[Math.PI/2+.12,0,0],scale:[1.08,1.05,1]}));for(let[e,t]of[[-.5,.86],[.1,1.02],[.6,.82],[-.15,.7]])u.headPlain.push(K.sphere(.07*i,`#FF8FB8`,{at:c(e*i,(t-.45)*i+.4*i,.08*i),scale:[1,1,.4]}))}if(e===`apron`){u.body.push(K.rbox(.2*r,.15*r,.03*r,.03*r,`#FF8FB8`,{at:[0,.4*r,.15*r],rot:[-.12,0,0]})),u.body.push(K.cyl(.2*r,.26*r,.2*r,`#FF8FB8`,{at:[0,.22*r,.012*r],scale:[1,1,.9]},20)),u.body.push(K.torus(.19*r,.016*r,`#FFFFFF`,{at:[0,.32*r,0],rot:[Math.PI/2,0,0]}));for(let e of[-1,1])u.body.push(K.capsule(.012*r,.1*r,`#FFFFFF`,{at:[e*.075*r,.5*r,.1*r],rot:[-.6,0,-e*.5]}));u.bodyPlain.push(K.rbox(.09*r,.06*r,.012*r,.012*r,`#FFFFFF`,{at:[0,.2*r,.235*r],rot:[-.3,0,0]}))}if(e===`smock`){u.body.push(K.capsule(.175*r,.06*r,`#C9B5F7`,{at:[0,.37*r,0]})),u.body.push(K.cyl(.17*r,.25*r,.2*r,`#C9B5F7`,{at:[0,.225*r,0]},20)),u.bodyPlain.push(...[.44,.36,.28].map(e=>K.sphere(.014*r,`#FFFFFF`,{at:[.07*r,e*r,.17*r]}))),u.body.push(K.rbox(.07*r,.06*r,.012*r,.008*r,`#B39CEB`,{at:[-.075*r,.42*r,.165*r],rot:[0,-.4,0]})),u.body.push(K.box(.05*r,.03*r,.008*r,`#FF8FB8`,{at:[-.075*r,.465*r,.168*r],rot:[0,-.4,0]}));for(let[e,t]of[[`armL`,-1],[`armR`,1]])u[e].push(K.sphere(.074*r,`#C9B5F7`,{at:[t*.006*r,-.02*r,0]}))}if(e===`chef-hat`){let e=-.32*i;u.head.push(K.cyl(.62*i,.66*i,.4*i,`#FFFFFF`,{at:[0,a+.98*i,e],rot:[-.25,0,0]},24));for(let[t,n]of[[0,0],[-.32,-.1],[.32,-.1],[0,-.3],[-.18,.2],[.18,.2]])u.head.push(K.sphere(.4*i,`#FFFFFF`,{at:[t*i,a+1.32*i,e+(n-.12)*i]},16));u.head.push(K.torus(.65*i,.06*i,`#FFD6E6`,{at:[0,a+.8*i,e+.04*i],rot:[Math.PI/2-.25,0,0]}))}if(e===`gloves`){let e=n.species===`unicorn`?`#FF4F9A`:`#E8403F`;for(let[t,n]of[[`armL`,-1],[`armR`,1]])u[t].push(K.sphere(.082*r,e,{at:[n*.054*r,-.158*r,.012*r],scale:[1,1.08,1.12]})),u[t].push(K.sphere(.034*r,e,{at:[n*.012*r,-.15*r,.06*r],scale:[.9,1.4,.9]})),u[t].push(K.cyl(.058*r,.062*r,.04*r,`#FFFFFF`,{at:[n*.036*r,-.098*r,.004*r],rot:[0,0,n*.35]}))}if(e===`mongkhon`&&(u.head.push(K.torus(.985*i,.085*i,`#E8403F`,{at:[0,a+.3*i,-.02*i],rot:[Math.PI/2-.2,0,0],scale:[1.04,1,1]})),u.head.push(K.capsule(.07*i,.4*i,`#E8403F`,{at:[.08*i,a+.02*i,-1.08*i],rot:[-.55,0,.25]})),u.headPlain.push(K.sphere(.07*i,`#FFC83D`,{at:c(0,.48*i,.07*i)}))),e===`floaties`)for(let[e,t,n]of[[`armL`,-1,`#FF7FA8`],[`armR`,1,`#FF9F45`]]){let i=.058*r,a=.038*r,o=[t*Math.sin(.35),-Math.cos(.35),0],s=[t*.026*r,-.072*r,0],c=e=>[s[0]-o[0]*e,s[1]-o[1]*e,s[2]],l=[Math.PI/2,t*.35,0];u[e].push(K.torus(i,a,n,{at:s,rot:l})),u[e].push(K.torus(i+a*.5,a*.32,`#FFF7F0`,{at:c(a*.82),rot:l})),u[e].push(K.cyl(.012*r,.012*r,.03*r,`#FFF7F0`,{at:[s[0]+t*(i+a*.9),s[1],s[2]+.01*r],rot:[0,0,t*(Math.PI/2-.35)]}))}return u}function _o(e,t,n,r=fo(e),i=e.height>=1?3:2.5){let a=go(t,r,e),o=(e,t)=>e.length||t.length?qa(e,t,n,i):null;return{head:o(a.head,a.headPlain),armL:o(a.armL,[]),armR:o(a.armR,[]),body:o(a.body,a.bodyPlain)}}var vo=class{goal=0;k=0;update(e,t,n){this.k+=(this.goal-this.k)*(1-Math.exp(-t*4));let r=this.k;e.mane&&(e.mane.rotation.x=r*(.62+Math.sin(n*13)*.08+Math.sin(n*5.3)*.06),e.mane.rotation.z=r*Math.sin(n*9.1)*.05,e.tail&&(e.tail.rotation.x=r*(.75+Math.sin(n*11+1)*.12),e.tail.rotation.y=r*Math.sin(n*7)*.12))}};function yo(e,t){let n=fo(e),{H:r,R:i,headY:a,shoulder:o,eyeX:s,eyeY:c,eyeSize:l,lift:u,on:d,turnTo:f}=n,p=r>=1?3:2.5,m=e.species===`penguin`,h=e.species===`hornbill`,g=[],_=[],v=[],y=[],b=[],x=[],S=[],C=[],w=[0,0,0],T={L:[],R:[]},E=[],D=[0,0,0],O=[],k=[],A=e.chub??1,M=[A,1,1+(A-1)*.8],ee=.52*r;if(m){g.push(K.sphere(.31*r,e.fur,{at:[0,.33*r,0],scale:[1,1.02,.95]},24)),g.push(K.sphere(.25*r,e.light,{at:[0,.3*r,.12*r],scale:[1,1.08,.66]},20));for(let t of[-1,1])g.push(K.sphere(.09*r,e.dark,{at:[t*.11*r,.025*r,.13*r],scale:[1,.42,1.45]}))}else if(h){g.push(K.sphere(.17*r,e.fur,{at:[0,.36*r,0],scale:[1,1.2,1]},20)),g.push(K.sphere(.13*r,e.light,{at:[0,.3*r,.07*r],scale:[1,1.15,.7]}));for(let t of[-1,1]){let n=t*.07*r;g.push(K.capsule(.025*r,.12*r,e.fur,{at:[n,.1*r,0]}));for(let t of[-.5,0,.5])g.push(K.capsule(.017*r,.06*r,e.fur,{at:[n+Math.sin(t)*.04*r,.015*r,Math.cos(t)*.04*r],rot:[Math.PI/2,t,0]}))}}else{let t=e.species===`panda`?e.dark:e.fur,n=e.species===`unicorn`||e.species===`buffalo`||e.species===`panda`||e.species===`pony`?e.dark:e.light,i=.085*r*(1+(A-1)*.7),a=.07*r*(1+(A-1)*.6);for(let e of[-1,1])g.push(K.capsule(a,.06*r,t,{at:[e*i,.1*r,0]})),g.push(K.sphere(.075*r*(1+(A-1)*.6),n,{at:[e*i,.035*r,.02*r],scale:[1,.6,1.3]}));g.push(K.capsule(.155*r,.1*r,e.fur,{at:[0,.34*r,0],scale:M})),(e.species===`fox`||e.species===`puppy`)&&!e.outfit?.lace&&g.push(K.sphere(.075*r,e.light,{at:[0,.5*r,.11*r*M[2]],scale:[1.1,.8,.7]})),e.species===`buffalo`&&!e.outfit&&g.push(K.sphere(.11*r,e.light,{at:[0,.27*r,.1*r],scale:[1,1.1,.55]}))}let N=e.outfit;if(N){if(m)g.push(uo(.3*r,.335*r,.18*r,N.color,{at:[0,.43*r,0]}));else{let e=N.kind===`shirt`;if(g.push(K.capsule(.163*r,(e?.1:.06)*r,N.color,{at:[0,(e?.35:.37)*r,0],scale:M})),N.kind===`dress`&&g.push(uo(.15*r,.235*r,.17*r,N.color,{at:[0,.235*r,0],scale:M})),N.shorts&&g.push(uo(.16*r,.168*r,.09*r,N.shorts,{at:[0,.205*r,0],scale:M})),N.kind===`polo`){for(let e of[-1,1])g.push(K.box(.08*r,.012*r,.06*r,N.color,{at:[e*.045*r,.535*r,.1*r],rot:[.5,0,e*-.4]}));_.push(...[.47,.42].map(e=>K.sphere(.009*r,lo,{at:[0,e*r,.162*r*M[2]]})))}if(N.kind===`blouse`&&N.lace){for(let e=0;e<9;e++){let t=-1.25+e/8*2.5;g.push(K.sphere(.032*r,N.lace,{at:[Math.sin(t)*.15*r*M[0],(.478+Math.abs(t)*.022)*r,Math.cos(t)*.15*r*M[2]],rot:[-.5,t,0],scale:[1,.85,.4]}))}_.push(...[-.06,-.03,0,.03,.06].map(e=>K.capsule(.0035*r,.1*r,`#EADDE6`,{at:[e*r,.41*r,Math.sqrt(.164**2-e*e)*r*M[2]],rot:[0,Math.asin(e/.164),0]})))}else N.kind===`blouse`&&(g.push(K.torus(.075*r,.016*r,`#FFFFFF`,{at:[0,.525*r,.04*r*M[2]],rot:[Math.PI/2-.35,0,0]})),_.push(...[.46,.4].map(e=>K.sphere(.009*r,`#FFE7A8`,{at:[0,e*r,.163*r*M[2]]}))));if(N.kind===`shirt`&&N.print){for(let e of[-1,1])g.push(K.box(.085*r,.012*r,.07*r,N.color,{at:[e*.05*r,.53*r,.1*r],rot:[.55,0,e*-.45]}));_.push(...[.44,.37,.3].map(e=>K.sphere(.009*r,lo,{at:[0,e*r,.165*r*M[2]]})));let e=.165*r;[[-.6,.47],[.62,.46],[-.2,.38],[.3,.33],[1.05,.38],[-1.1,.36],[-.55,.28],[.75,.26],[1.6,.46],[-1.7,.44],[2.3,.36],[-2.4,.33],[3.1,.42],[2.8,.27],[-2.9,.26]].forEach(([t,n],i)=>{bo(_,[Math.sin(t)*e*M[0],n*r,Math.cos(t)*e*M[2]],[0,t,0],.032*r,N.print[i%N.print.length],i)})}else N.kind===`shirt`&&(_.push(...[.47,.4,.33,.26].map(e=>K.sphere(.011*r,`#E8B85C`,{at:[0,e*r,.164*r*M[2]]}))),g.push(K.box(.06*r,.06*r,.01*r,N.color,{at:[.07*r,.44*r,.15*r],rot:[0,.45,0]})))}}for(let[t,n]of[[`L`,-1],[`R`,1]]){let i=T[t];if(m)i.push(K.capsule(.07*r,.14*r,e.fur,{at:[n*.015*r,-.12*r,0],rot:[0,0,n*.3],scale:[.45,1,1]})),N&&i.push(K.sphere(.06*r,N.color,{at:[n*0,-.02*r,0],scale:[.8,1,1]}));else if(h)i.push(K.sphere(.08*r,e.fur,{at:[n*.02*r,-.09*r,0],rot:[0,0,n*.3],scale:[.5,1.35,.95]})),i.push(K.sphere(.04*r,e.light,{at:[n*.05*r,-.18*r,.02*r],scale:[.6,1,.9]})),N&&i.push(K.sphere(.06*r,N.color,{at:[0,-.01*r,0]}));else{let a=e.species===`panda`?e.dark:e.fur,o=e.species===`unicorn`||e.species===`buffalo`||e.species===`panda`||e.species===`pony`?e.dark:e.species===`fox`||e.species===`puppy`||e.species===`monkey`?e.light:e.fur;i.push(K.capsule(.052*r,.09*r,a,{at:[n*.025*r,-.075*r,0],rot:[0,0,n*.35]})),i.push(K.sphere(.054*r,o,{at:[n*.05*r,-.14*r,.005*r]})),N&&i.push(K.sphere(.068*r,N.color,{at:[n*.004*r,-.015*r,0]})),N?.print&&bo(i,[n*.035*r,-.01*r,.058*r],[0,n*.55,0],.024*r,N.print[+(t===`L`)],0)}}for(let t of[-1,1]){let n=t*s;if(b.push(K.sphere(l,ao,{at:d(n,c,u-.03*i),rot:f(n),scale:[.78,1,.42]})),x.push(K.sphere(l*.3,lo,{at:d(n+t*.05*i,c+.08*i,u+.035*i)})),x.push(K.sphere(l*.14,lo,{at:d(n-t*.05*i,c-.07*i,u+.035*i)})),e.lashes)for(let e of[0,1])x.push(K.capsule(.012*i,.07*i,ao,{at:d(n+t*(.16+e*.05)*i,c+(.17-e*.07)*i,u+.01*i),rot:[0,0,t*(-.9-e*.5)]}));let r=e.species===`unicorn`||e.species===`pony`?-.08*i:-.2*i;y.push(K.sphere(.12*i,oo,{at:d(t*.58*i,r,u*.6-.02*i),rot:f(t*.58*i),scale:[1.25,.65,.3]}))}let P=(e,t)=>t===void 0?d(0,e,.005*i):[0,a+e,t],te=t=>{w=t,e.smile===`teeth`?(S.push(K.sphere(.2*i,so,{at:[0,-.02*i,-.1*i],scale:[1.2,.6,.7]},20)),S.push(K.sphere(.17*i,lo,{at:[0,.035*i,-.07*i],scale:[1.2,.3,.7]},20)),S.push(K.sphere(.08*i,co,{at:[0,-.08*i,-.03*i],scale:[1.6,.5,.8]}))):e.open?(S.push(K.sphere(.2*i,so,{scale:[1.15,.72,.35]})),S.push(K.sphere(.1*i,co,{at:[0,-.07*i,.03*i],scale:[1.3,.6,.5]}))):S.push(K.torus(.075*i,.017*i,so,{rot:[0,0,Math.PI]},Math.PI))};switch(e.species){case`unicorn`:{let t=e.mane??[e.fur],n=e=>t[e%t.length];v.push(K.sphere(i,e.fur,{at:[0,a,0]},26)),v.push(K.sphere(.52*i,e.light,{at:[0,a-.36*i,.6*i],scale:[1.05,.66,.6]})),y.push(...[-1,1].map(e=>K.sphere(.032*i,ao,{at:[e*.16*i,a-.27*i,.91*i],scale:[1,.7,.6]}))),te(P(-.47*i,.86*i));for(let t of[-1,1])v.push(K.cone(.24*i,.7*i,e.fur,{at:[t*.62*i,a+.92*i,0*i],rot:[-.1,0,-t*.42]})),y.push(K.cone(.13*i,.44*i,e.ear??e.light,{at:[t*.6*i,a+.87*i,.1*i],rot:[-.1,0,-t*.42]}));v.push(K.cone(.15*i,.78*i,`#FFC83D`,{at:[0,a+1.12*i,.25*i],rot:[.28,0,0]})),y.push(...[0,1,2].map(e=>K.torus(.12*i-e*.03*i,.022*i,`#E8A92A`,{at:[0,a+(.86+e*.17)*i,(.18+e*.05)*i],rot:[Math.PI/2+.28,0,0]}))),v.push(K.sphere(.88*i,n(0),{at:[0,a+.42*i,-.12*i],scale:[1.05,.62,1]})),v.push(K.sphere(.32*i,n(0),{at:[-.32*i,a+.62*i,.62*i]}),K.sphere(.27*i,n(1),{at:[.02*i,a+.72*i,.6*i]}));let o=e.hair===`short`?2:e.hair===`long`?5:3,s=e.hair===`short`?0:e.hair===`long`?5:2;for(let e=0;e<o;e++)C.push(K.sphere((.42-e*.03)*i,n(e+1),{at:[.05*i*(e%2),a+(.15-e*.36)*i,-.82*i+e*.04*i]}));for(let e of[-1,1])for(let t=0;t<s;t++)C.push(K.sphere((.34-t*.02)*i,n(t+(e<0?2:3)),{at:[e*(.86+t*.03)*i,a+(.05-t*.34)*i,(-.2-t*.04)*i]}));[[.27,-.16,.07],[.23,-.23,.075],[.17,-.29,.075],[.11,-.31,.068],[.06,-.27,.058]].forEach(([e,t,i],a)=>E.push(K.sphere(i*r,n(a),{at:[0,e*r,t*r]})));break}case`panda`:v.push(K.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])v.push(K.sphere(.27*i,e.dark,{at:[t*.7*i,a+.7*i,-.12*i]})),y.push(K.sphere(.15*i,e.ear??`#FFB3C7`,{at:[t*.68*i,a+.68*i,.08*i],scale:[1,1,.4]})),v.push(K.sphere(.3*i,`#62566A`,{at:d(t*s,c-.03*i,-.12*i),rot:[0,Math.asin(t*s/i),t*.45],scale:[.85,1.12,.4]}));v.push(K.sphere(.42*i,e.light,{at:[0,a-.33*i,.62*i],scale:[1.1,.72,.7]})),v.push(K.sphere(.1*i,e.dark,{at:[0,a-.17*i,.96*i],scale:[1.3,.8,.8]})),te(P(-.47*i,.86*i)),v.push(K.sphere(.16*i,e.fur,{at:[.05*i,a+.96*i,.1*i],scale:[1.4,.7,1]}));break;case`elephant`:v.push(K.sphere(i,e.fur,{at:[0,a,0],scale:[1.08,1,1]},26));for(let t of[-1,1])v.push(K.sphere(.62*i,e.fur,{at:[t*1.02*i,a+.08*i,-.12*i],rot:[0,t*.45,-t*.15],scale:[1,1.12,.26]})),y.push(K.sphere(.46*i,e.ear??e.dark,{at:[t*1.07*i,a+.06*i,-.03*i],rot:[0,t*.45,-t*.15],scale:[1,1.1,.2]}));for(let[t,n,r]of[[-.15,.88,.24],[-.32,.98,.21],[-.48,1.05,.19],[-.62,1.14,.17],[-.7,1.27,.155],[-.7,1.4,.145],[-.62,1.5,.14]])v.push(K.sphere(r*i,e.fur,{at:[0,a+t*i,n*i]}));y.push(K.torus(.09*i,.035*i,e.dark,{at:[0,a-.55*i,1.56*i],rot:[-.9,0,0]})),w=d(0,-.36*i,.01*i),S.push(K.torus(.24*i,.022*i,so,{rot:[0,0,Math.PI]},Math.PI)),v.push(...[-.14,.04,.2].map((t,n)=>K.sphere((.15-n*.02)*i,e.dark,{at:[t*i,a+(.95-n*.04)*i,.15*i],scale:[.8,1.2,.8]}))),E.push(K.capsule(.018*r,.12*r,e.fur,{at:[0,.2*r,-.19*r*M[2]],rot:[.5,0,0]})),E.push(K.sphere(.035*r,e.dark,{at:[0,.13*r,-.24*r*M[2]],scale:[1,1.4,1]})),D=[0,.26*r,-.17*r*M[2]];break;case`puppy`:v.push(K.sphere(i,e.fur,{at:[0,a,0],scale:[1.08,1,1]},26)),v.push(K.sphere(.44*i,e.light,{at:[0,a-.36*i,.66*i],scale:[1.15,.72,.75]})),v.push(K.sphere(.14*i,e.dark,{at:[0,a-.18*i,1*i],scale:[1.35,.9,.8]})),te(P(-.52*i,.92*i));for(let t of[-1,1])v.push(K.sphere(.38*i,e.ear??e.fur,{at:[t*.94*i,a-.02*i,-.04*i],rot:[0,0,t*.22],scale:[.58,1.38,.55]}));v.push(...[-.12,.1].map((t,n)=>K.sphere((.2-n*.03)*i,e.fur,{at:[t*i,a+(.94-n*.04)*i,.2*i],scale:[.8,1.2,.8]}))),D=[0,.24*r,-.15*r*M[2]],E.push(K.sphere(.05*r,e.fur,{at:[0,.3*r,-.2*r*M[2]],rot:[-.7,0,0],scale:[.8,1.7,.8]})),E.push(K.sphere(.04*r,e.light,{at:[0,.38*r,-.24*r*M[2]]}));break;case`pony`:{let t=e.mane??[e.dark],n=e=>t[e%t.length];v.push(K.sphere(i,e.fur,{at:[0,a,0]},26)),v.push(K.sphere(.56*i,e.light,{at:[0,a-.4*i,.62*i],scale:[1.05,.72,.76]})),y.push(...[-1,1].map(e=>K.sphere(.05*i,ao,{at:[e*.2*i,a-.32*i,1.02*i],scale:[1,1.3,.6]}))),te(P(-.56*i,.9*i));for(let t of[-1,1])v.push(K.cone(.22*i,.62*i,e.fur,{at:[t*.5*i,a+.98*i,-.05*i],rot:[-.1,0,-t*.28]})),y.push(K.cone(.12*i,.38*i,e.ear??e.light,{at:[t*.49*i,a+.94*i,.05*i],rot:[-.1,0,-t*.28]}));C.push(K.sphere(.3*i,n(0),{at:[0,a+.74*i,.62*i],scale:[1,.9,.8]}));for(let e=0;e<5;e++)C.push(K.sphere((.36-e*.02)*i,n(e+1),{at:[0,a+(.92-e*.36)*i,(.2-e*.26)*i],scale:[.85,1,1]}));D=[0,.26*r,-.16*r],[[.27,-.2,.06],[.22,-.25,.065],[.16,-.28,.065],[.1,-.29,.058]].forEach(([e,t,i],a)=>E.push(K.sphere(i*r,n(a),{at:[0,e*r,t*r]})));break}case`monkey`:v.push(K.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])v.push(K.sphere(.46*i,e.light,{at:[t*.3*i,a+.07*i,.6*i],scale:[1,1.08,.78]}));v.push(K.sphere(.52*i,e.light,{at:[0,a-.36*i,.62*i],scale:[1.25,.8,.8]})),y.push(...[-1,1].map(e=>K.sphere(.04*i,ao,{at:[e*.1*i,a-.2*i,1.03*i],scale:[1,.75,.6]}))),te(P(-.52*i,1*i));for(let t of[-1,1])v.push(K.sphere(.36*i,e.fur,{at:[t*1.02*i,a-.02*i,-.02*i],scale:[.36,1,1]})),y.push(K.sphere(.24*i,e.ear??e.light,{at:[t*1.09*i,a-.02*i,.02*i],scale:[.3,1,1]}));v.push(K.cone(.13*i,.36*i,e.fur,{at:[.05*i,a+1.02*i,.12*i],rot:[.2,0,-.5]})),D=[0,.2*r,-.15*r*M[2]];for(let[t,n,i]of[[.17,-.22,.032],[.16,-.3,.03],[.2,-.37,.029],[.28,-.41,.028],[.37,-.4,.027],[.43,-.35,.026],[.44,-.29,.026],[.4,-.26,.026]])E.push(K.sphere(i*r,e.fur,{at:[0,t*r,n*r]}));break;case`fox`:v.push(K.sphere(i,e.fur,{at:[0,a,0],scale:[1.1,1,1]},26));for(let t of[-1,1])if(v.push(K.cone(.36*i,.98*i,e.fur,{at:[t*.58*i,a+.95*i,-.08*i],rot:[-.1,0,-t*.38]})),y.push(K.cone(.2*i,.6*i,e.ear??e.light,{at:[t*.56*i,a+.88*i,.06*i],rot:[-.1,0,-t*.38]})),e.cheeks===void 0)v.push(K.sphere(.34*i,e.light,{at:[t*.52*i,a-.42*i,.55*i]}));else{let n=e.cheeks,r=[t*.465,-.429,.774],o=[t*.55*i,a-.42*i,Math.sqrt(.75-.42**2)*i],s=.3*i*n/.8;v.push(K.sphere(s,e.light,{at:[o[0]-r[0]*.27*s,o[1]-r[1]*.27*s,o[2]-r[2]*.27*s],rot:[.52,t*.54,0],scale:[1.15,1,.45]},24))}v.push(K.sphere(.3*i,e.light,{at:[0,a-.36*i,.8*i],scale:[1.1,.8,.8]})),v.push(K.sphere(.08*i,e.dark,{at:[0,a-.22*i,1.03*i],scale:[1.3,.85,.9]})),te(e.smile===`teeth`?P(-.42*i,1.03*i):P(-.48*i,1*i)),e.hairdo||v.push(...[-.2,.05,.28].map((t,n)=>K.sphere((.24-n*.03)*i,e.fur,{at:[t*i,a+(.82-n*.06)*i,.48*i]}))),E.push(K.sphere(.13*r,e.fur,{at:[.05*r,.27*r,-.2*r],rot:[-.6,0,.25],scale:[.78,1.38,.78]})),E.push(K.sphere(.085*r,e.light,{at:[.09*r,.42*r,-.29*r]}));break;case`buffalo`:v.push(K.sphere(i,e.fur,{at:[0,a,0],scale:[1.1,.98,1]},26)),v.push(K.sphere(.56*i,e.light,{at:[0,a-.36*i,.56*i],scale:[1.25,.75,.76]})),y.push(...[-1,1].map(e=>K.sphere(.05*i,ao,{at:[e*.2*i,a-.28*i,.94*i],scale:[1.3,.8,.6]}))),te(P(-.5*i,.9*i));for(let t of[-1,1]){v.push(K.sphere(.22*i,e.fur,{at:[t*1.02*i,a+.18*i,-.05*i],rot:[0,0,-t*.35],scale:[1.6,.62,.42]})),y.push(K.sphere(.13*i,e.ear??oo,{at:[t*1.05*i,a+.17*i,.01*i],rot:[0,0,-t*.35],scale:[1.5,.55,.3]}));let n=`#FFF3DC`,r=.4*i,o=t*.78*i,s=a+.42*i,c=t>0?-Math.PI/2:Math.PI/2+.55;v.push(K.torus(r,.17*i,n,{at:[o,s+r,-.05*i],rot:[0,0,c]},2.05));let l=t>0?-Math.PI/2+2.05:Math.PI/2+.55;v.push(K.cone(.16*i,.34*i,n,{at:[o+Math.cos(l)*r,s+r+Math.sin(l)*r+.08*i,-.05*i],rot:[0,0,t>0?.45:-.45]}))}if(e.hairdo||v.push(...[-.15,.12].map(e=>K.sphere(.25*i,`#7A86B0`,{at:[e*i,a+.82*i,.3*i],scale:[1.2,.7,1]}))),e.extras?.includes(`pigtails`))for(let e of[-1,1])v.push(K.capsule(.16*i,.5*i,`#7A86B0`,{at:[e*1.12*i,a-.52*i,-.02*i],rot:[0,0,e*.45]})),v.push(K.sphere(.13*i,`#7A86B0`,{at:[e*1.36*i,a-.98*i,.02*i]})),v.push(K.cone(.13*i,.26*i,`#FF6FAE`,{at:[e*1.12*i,a-.2*i,.04*i],rot:[0,0,e*Math.PI/2]})),v.push(K.cone(.13*i,.26*i,`#FF6FAE`,{at:[e*.9*i,a-.2*i,.04*i],rot:[0,0,-e*Math.PI/2]}));E.push(K.capsule(.02*r,.14*r,e.fur,{at:[0,.18*r,-.19*r],rot:[.6,0,0]})),D=[0,.26*r,-.15*r],E.push(K.sphere(.04*r,e.dark,{at:[0,.1*r,-.25*r],scale:[1,1.3,1]}));break;case`penguin`:v.push(K.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])v.push(K.sphere(.62*i,e.light,{at:[t*.28*i,a-.16*i,.48*i],scale:[1,1.02,.95]}));w=[0,a-(e.open?.25:.33)*i,(e.open?1.08:1.04)*i],e.open?(v.push(K.cone(.2*i,.4*i,e.dark,{at:[0,a-.14*i,1.13*i],rot:[Math.PI/2,0,0],scale:[1.5,1,.65]})),v.push(K.cone(.14*i,.26*i,e.dark,{at:[0,a-.33*i,1.06*i],rot:[Math.PI/2+.4,0,0],scale:[1.4,1,.6]})),S.push(K.sphere(.11*i,so,{scale:[1.5,.6,.5]}))):v.push(K.cone(.18*i,.36*i,e.dark,{at:[0,a-.2*i,1.12*i],rot:[Math.PI/2,0,0],scale:[1.45,1,.65]})),e.extras?.includes(`tuft`)&&v.push(...[-.15,.05,.24].map((t,n)=>K.sphere(.17*i,e.fur,{at:[t*i,a+(1+n%2*.1)*i,0],rot:[0,0,-t*2.5],scale:[.7,1.5,.7]}))),e.extras?.includes(`tuft`)||v.push(K.sphere(.18*i,e.fur,{at:[.05*i,a+.93*i,.1*i],scale:[1.3,.6,1]}));break;case`hornbill`:w=[0,a-.45*i,.95*i],v.push(K.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])v.push(K.sphere(.42*i,e.light,{at:[t*.42*i,a+.02*i,.62*i],scale:[1,1.05,.55]}));v.push(K.cone(.32*i,1.45*i,e.dark,{at:[0,a-.32*i,1.35*i],rot:[2.05,0,0],scale:[.62,1,1.25]})),v.push(K.capsule(.2*i,.55*i,`#FFD45C`,{at:[0,a+.22*i,1*i],rot:[Math.PI/2+.3,0,0],scale:[.65,1,.8]})),v.push(K.sphere(.6*i,e.light,{at:[0,a-.75*i,.1*i],scale:[1.15,.55,1]})),v.push(...[-.2,.15].map(t=>K.sphere(.22*i,e.fur,{at:[t*i,a+.9*i,-.15*i],scale:[1.2,.7,1]})));for(let[t,n]of[-.9,-.45,0,.45,.9].entries())E.push(K.sphere(.07*r,t%2?e.light:`#EADFCB`,{at:[Math.sin(n)*.1*r,.2*r,-.2*r-Math.cos(n)*.05*r],rot:[-.9,n,0],scale:[.55,1.6,.3]}))}e.hairdo&&xo(e.hairdo,n,v);for(let t of e.extras??[]){if(t===`glasses`||t===`round-glasses`){let e=t===`glasses`?`#E8A92A`:`#5FBFA0`,n=(t===`glasses`?.2:.26)*i;for(let t of[-1,1])v.push(K.torus(n,.03*i,e,{at:d(t*s,c,.06*i),rot:f(t*s)}));v.push(K.capsule(.025*i,s*2-n*2,e,{at:d(0,c+.03*i,.08*i),rot:[0,0,Math.PI/2]}))}if(t===`moustache`)for(let e of[-1,1])v.push(K.capsule(.08*i,.24*i,`#F4EFF4`,{at:[e*.18*i,a-.33*i,.95*i],rot:[0,0,e*1.15]}));if(t===`cap`&&(v.push(K.sphere(1*i,`#8FC9F5`,{at:[0,a+.32*i,-.06*i],rot:[-.3,0,0],scale:[1.12,.72,1.06]})),v.push(K.cyl(.5*i,.5*i,.06*i,`#6FB0E6`,{at:[0,a+.42*i,-1*i],rot:[.35,0,0],scale:[1,1,1.3]})),v.push(K.box(.5*i,.08*i,.06*i,`#6FB0E6`,{at:[0,a+.5*i,.86*i],rot:[-.55,0,0]}))),t===`officer-cap`&&(v.push(K.cyl(.66*i,.72*i,.3*i,`#3E4C8A`,{at:[0,a+.84*i,-.04*i],rot:[-.12,0,0]},24)),v.push(K.cyl(.8*i,.72*i,.12*i,`#4A5A9C`,{at:[0,a+1.03*i,-.07*i],rot:[-.12,0,0]},24)),v.push(K.cyl(.52*i,.52*i,.05*i,`#2B3566`,{at:[0,a+.72*i,.62*i],rot:[.3,0,0],scale:[1,1,.55]},20)),v.push(K.sphere(.11*i,`#FFC83D`,{at:[0,a+.88*i,.66*i],scale:[1,1,.5]}))),t===`scarf`&&(g.push(K.torus(.255*r,.05*r,`#FF8FB8`,{at:[0,.54*r,.02*r],rot:[Math.PI/2,0,0]},Math.PI*2)),g.push(K.rbox(.09*r,.24*r,.04*r,.015*r,`#FF8FB8`,{at:[.12*r,.42*r,.27*r],rot:[.25,0,-.15]}))),t===`bib`&&g.push(K.sphere(.2*r,`#A8DCFF`,{at:[0,.48*r,.2*r],scale:[1.1,.55,.45]})),t===`phone`){let e=[0,.42*r,.25*r*M[2]],t=-2.3,n=[t,0,0],i=[0,-Math.sin(t),Math.cos(t)];O.push(K.rbox(.13*r,.21*r,.022*r,.016*r,`#6B5BA8`,{at:e,rot:n})),k.push(K.rbox(.11*r,.18*r,.006*r,.012*r,`#BFE9FF`,{at:(t=>[e[0]+i[0]*t,e[1]+i[1]*t,e[2]+i[2]*t])(.012*r),rot:n}))}if(t===`cane`&&(T.L.push(K.cyl(.018*r,.018*r,.42*r,`#B07A4A`,{at:[-.09*r,-.32*r,.04*r]})),T.L.push(K.torus(.04*r,.016*r,`#B07A4A`,{at:[-.06*r,-.11*r,.04*r]},Math.PI))),po(t)){let r=go(t,n,e);v.push(...r.head),y.push(...r.headPlain),g.push(...r.body),_.push(...r.bodyPlain),T.L.push(...r.armL),T.R.push(...r.armR)}}let ne=new j,re=new j,ie=new j;ie.position.y=ee;let ae=new j,oe=new j;ae.position.set(-o[0],o[1],o[2]),oe.position.set(o[0],o[1],o[2]),ne.add(Ya((m?.3:.2*A)*r*1.3,t),re),re.add(qa(g,_,t,p),ie,ae,oe);let se=O.length?qa(O,k,t,p):null;se&&re.add(se),ie.add(qa(v,y,t,p));let ce=new j;ce.position.y=a+c;for(let e of[...b,...x])e.translate(0,-(a+c),0);ce.add(qa(b,x,t,p));let le=new j,ue=new j;for(let e of[le,ue])e.position.set(...w);S.length&&le.add(qa([],S,t,0)),ue.add(qa([],[K.sphere(.17*i,so,{scale:[1.1,.9,.35]}),K.sphere(.09*i,co,{at:[0,-.06*i,.03*i],scale:[1.3,.6,.5]})],t,0)),ue.scale.setScalar(.001),ue.visible=!1,ie.add(ce,le,ue);let de=null;C.length&&(de=So(C,e.species===`pony`?[0,a+.6*i,0]:[0,a+.5*i,-.6*i],t,p),ie.add(de)),ae.add(qa(T.L,[],t,p)),oe.add(qa(T.R,[],t,p));let fe=null;return E.length&&(fe=So(E,e.species===`unicorn`?[0,.29*r,-.15*r]:D,t,p),re.add(fe)),{root:ne,body:re,head:ie,eyes:ce,mouth:le,talk:ue,open:(!!e.open||e.smile===`teeth`)&&S.length>0,armL:ae,armR:oe,tail:fe,mane:de,height:r,radius:m?.3*r:.16*r*A,phone:se,face:{R:i,headY:a,mouth:w}}}function bo(e,t,n,r,i,a){let o=new kt().compose(new V(...t),new je().setFromEuler(new O(...n)),new V(1,1,1)),s=(e,t,n)=>{let r=new V(e,t,n).applyMatrix4(o);return[r.x,r.y,r.z]},c=a*1.3;for(let t of[0,1]){let i=c+2.4+t*1.6;e.push(K.sphere(r*.75,`#5FBF8A`,{at:s(Math.cos(i)*r*1.2,Math.sin(i)*r*1.2,.001),rot:[n[0],n[1],i],scale:[1.6,.6,.25]}))}for(let t=0;t<5;t++){let a=c+t/5*Math.PI*2;e.push(K.sphere(r*.62,i,{at:s(Math.cos(a)*r*.62,Math.sin(a)*r*.62,.003),rot:n,scale:[1,1,.3]}))}e.push(K.sphere(r*.3,`#FFE9A8`,{at:s(0,0,.006),rot:n,scale:[1,1,.3]}))}function xo(e,t,n){let{R:r,headY:i}=t,a=e.color;if(e.style===`bob`){for(let e of[-1,1])n.push(K.sphere(.95*r,a,{at:[e*.13*r,i+.3*r,-.3*r],scale:[1.1,.92,1.15]},40)),n.push(K.sphere(.4*r,a,{at:[e*.3*r,i+.68*r,.58*r],rot:[.35,0,e*.5],scale:[1.45,.6,.8]},24)),n.push(K.sphere(.4*r,a,{at:[e*.85*r,i+.2*r,.15*r],scale:[.7,1.3,1.1]},24)),n.push(K.capsule(.26*r,.7*r,a,{at:[e*1*r,i-.48*r,0],rot:[.08,0,e*.06],scale:[.7,1,1.25]})),n.push(K.sphere(.24*r,a,{at:[e*1.03*r,i-.95*r,.1*r],scale:[.72,.7,1.25]}));n.push(K.sphere(r,a,{at:[0,i-.25*r,-.32*r],scale:[1.2,1.25,.92]},26))}else{n.push(K.sphere(.92*r,a,{at:[0,i+.36*r,-.08*r],scale:[1.05,.68,1.06]},24));for(let[e,t,o,s]of[[0,.25,0,.35],[-.3,.3,-.35,.45],[.3,.3,.35,.45],[-.16,-.1,-.15,.05],[.16,-.1,.15,.05],[-.42,-.25,-.55,-.2],[.42,-.25,.55,-.2],[0,-.45,0,-.45],[-.12,.55,-.2,.9],[.14,.56,.25,.95]]){let c=Math.sqrt(Math.max(0,1-e*e-(t+.08)**2))*.68+.36;n.push(K.cone(.17*r,.42*r,a,{at:[e*r,i+(c+.06)*r,t*r],rot:[s,0,-o]}))}}}function So(e,t,n,r){let i=new j;i.position.set(...t);for(let n of e)n.translate(-t[0],-t[1],-t[2]);return i.add(qa(e,[],n,r)),i}var Co=class{rig;voice;nextBlink=.8+Math.random()*3;blink=-1;level=0;constructor(e,t){this.rig=e,this.voice=t}update(e){let{eyes:t,mouth:n,talk:r,open:i}=this.rig;this.nextBlink-=e,this.nextBlink<=0&&(this.blink=0,this.nextBlink=Math.random()<.2?.25:2.2+Math.random()*3.5);let o=1;this.blink>=0&&(this.blink+=e/.16,o=1-.9*c(Math.min(1,this.blink)),this.blink>=1&&(this.blink=-1)),this.rig.blink?this.rig.blink(o):t.scale.y=o;let s=this.voice?a(this.voice):0;this.level+=(s-this.level)*(1-Math.exp(-e*(s>this.level?30:14)));let l=this.level;if(i)n.scale.set(1+.15*l,1+.9*l,1);else{let e=l>.04;r.visible=e,n.visible=!e,e&&r.scale.set(.55+.45*l,Math.min(1,.25+l),1)}}},wo=class extends Et{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new ko(e)}),this.register(function(e){return new Ao(e)}),this.register(function(e){return new zo(e)}),this.register(function(e){return new Bo(e)}),this.register(function(e){return new Vo(e)}),this.register(function(e){return new Mo(e)}),this.register(function(e){return new No(e)}),this.register(function(e){return new Po(e)}),this.register(function(e){return new Fo(e)}),this.register(function(e){return new Oo(e)}),this.register(function(e){return new Io(e)}),this.register(function(e){return new jo(e)}),this.register(function(e){return new Ro(e)}),this.register(function(e){return new Lo(e)}),this.register(function(e){return new Eo(e)}),this.register(function(e){return new Ho(e)}),this.register(function(e){return new Uo(e)})}load(e,t,n,r){let i=this,a;if(this.resourcePath!==``)a=this.resourcePath;else if(this.path!==``){let t=qt.extractUrlBase(e);a=qt.resolveURL(t,this.path)}else a=qt.extractUrlBase(e);this.manager.itemStart(e);let o=function(t){r?r(t):console.error(t),i.manager.itemError(e),i.manager.itemEnd(e)},s=new Te(this.manager);s.setPath(this.path),s.setResponseType(`arraybuffer`),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,function(n){try{i.parse(n,a,function(n){t(n),i.manager.itemEnd(e)},o)}catch(e){o(e)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let i,a={},o={},s=new TextDecoder;if(typeof e==`string`)i=JSON.parse(e);else if(e instanceof ArrayBuffer){if(s.decode(new Uint8Array(e,0,4))===Wo){try{a[Y.KHR_BINARY_GLTF]=new qo(e)}catch(e){r&&r(e);return}i=JSON.parse(a[Y.KHR_BINARY_GLTF].content)}else i=JSON.parse(s.decode(e))}else i=e;if(i.asset===void 0||i.asset.version[0]<2){r&&r(Error(`THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.`));return}let c=new ys(i,{path:t||this.resourcePath||``,crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](c);t.name||console.error(`THREE.GLTFLoader: Invalid plugin found: missing name`),o[t.name]=t,a[t.name]=!0}if(i.extensionsUsed)for(let e=0;e<i.extensionsUsed.length;++e){let t=i.extensionsUsed[e],n=i.extensionsRequired||[];switch(t){case Y.KHR_MATERIALS_UNLIT:a[t]=new Do;break;case Y.KHR_DRACO_MESH_COMPRESSION:a[t]=new Jo(i,this.dracoLoader);break;case Y.KHR_TEXTURE_TRANSFORM:a[t]=new Yo;break;case Y.KHR_MESH_QUANTIZATION:a[t]=new Xo;break;default:n.indexOf(t)>=0&&o[t]===void 0&&console.warn(`THREE.GLTFLoader: Unknown extension "`+t+`".`)}}c.setExtensions(a),c.setPlugins(o),c.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,i){n.parse(e,t,r,i)})}};function To(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}var Y={KHR_BINARY_GLTF:`KHR_binary_glTF`,KHR_DRACO_MESH_COMPRESSION:`KHR_draco_mesh_compression`,KHR_LIGHTS_PUNCTUAL:`KHR_lights_punctual`,KHR_MATERIALS_CLEARCOAT:`KHR_materials_clearcoat`,KHR_MATERIALS_DISPERSION:`KHR_materials_dispersion`,KHR_MATERIALS_IOR:`KHR_materials_ior`,KHR_MATERIALS_SHEEN:`KHR_materials_sheen`,KHR_MATERIALS_SPECULAR:`KHR_materials_specular`,KHR_MATERIALS_TRANSMISSION:`KHR_materials_transmission`,KHR_MATERIALS_IRIDESCENCE:`KHR_materials_iridescence`,KHR_MATERIALS_ANISOTROPY:`KHR_materials_anisotropy`,KHR_MATERIALS_UNLIT:`KHR_materials_unlit`,KHR_MATERIALS_VOLUME:`KHR_materials_volume`,KHR_TEXTURE_BASISU:`KHR_texture_basisu`,KHR_TEXTURE_TRANSFORM:`KHR_texture_transform`,KHR_MESH_QUANTIZATION:`KHR_mesh_quantization`,KHR_MATERIALS_EMISSIVE_STRENGTH:`KHR_materials_emissive_strength`,EXT_MATERIALS_BUMP:`EXT_materials_bump`,EXT_TEXTURE_WEBP:`EXT_texture_webp`,EXT_TEXTURE_AVIF:`EXT_texture_avif`,EXT_MESHOPT_COMPRESSION:`EXT_meshopt_compression`,EXT_MESH_GPU_INSTANCING:`EXT_mesh_gpu_instancing`},Eo=class{constructor(e){this.parser=e,this.name=Y.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n=`light:`+e,r=t.cache.get(n);if(r)return r;let i=t.json,a=((i.extensions&&i.extensions[this.name]||{}).lights||[])[e],o,s=new z(16777215);a.color!==void 0&&s.setRGB(a.color[0],a.color[1],a.color[2],Vt);let c=a.range===void 0?0:a.range;switch(a.type){case`directional`:o=new we(s),o.target.position.set(0,0,-1),o.add(o.target);break;case`point`:o=new De(s),o.distance=c;break;case`spot`:o=new Ve(s),o.distance=c,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle===void 0?0:a.spot.innerConeAngle,a.spot.outerConeAngle=a.spot.outerConeAngle===void 0?Math.PI/4:a.spot.outerConeAngle,o.angle=a.spot.outerConeAngle,o.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,o.target.position.set(0,0,-1),o.add(o.target);break;default:throw Error(`THREE.GLTFLoader: Unexpected light type: `+a.type)}return o.position.set(0,0,0),ds(o,a),a.intensity!==void 0&&(o.intensity=a.intensity),o.name=t.createUniqueName(a.name||`light_`+e),r=Promise.resolve(o),t.cache.add(n,r),r}getDependency(e,t){if(e===`light`)return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],i=(r.extensions&&r.extensions[this.name]||{}).light;return i===void 0?null:this._loadLight(i).then(function(e){return n._getNodeRef(t.cache,i,e)})}},Do=class{constructor(){this.name=Y.KHR_MATERIALS_UNLIT}getMaterialType(){return gt}extendParams(e,t,n){let r=[];e.color=new z(1,1,1),e.opacity=1;let i=t.pbrMetallicRoughness;if(i){if(Array.isArray(i.baseColorFactor)){let t=i.baseColorFactor;e.color.setRGB(t[0],t[1],t[2],Vt),e.opacity=t[3]}i.baseColorTexture!==void 0&&r.push(n.assignTexture(e,`map`,i.baseColorTexture,k))}return Promise.all(r)}},Oo=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},ko=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&i.push(n.assignTexture(t,`clearcoatMap`,a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&i.push(n.assignTexture(t,`clearcoatRoughnessMap`,a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(i.push(n.assignTexture(t,`clearcoatNormalMap`,a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let e=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new et(e,e)}return Promise.all(i)}},Ao=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_DISPERSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name];return t.dispersion=r.dispersion===void 0?0:r.dispersion,Promise.resolve()}},jo=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&i.push(n.assignTexture(t,`iridescenceMap`,a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&i.push(n.assignTexture(t,`iridescenceThicknessMap`,a.iridescenceThicknessTexture)),Promise.all(i)}},Mo=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_SHEEN}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[];t.sheenColor=new z(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=r.extensions[this.name];if(a.sheenColorFactor!==void 0){let e=a.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],Vt)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&i.push(n.assignTexture(t,`sheenColorMap`,a.sheenColorTexture,k)),a.sheenRoughnessTexture!==void 0&&i.push(n.assignTexture(t,`sheenRoughnessMap`,a.sheenRoughnessTexture)),Promise.all(i)}},No=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&i.push(n.assignTexture(t,`transmissionMap`,a.transmissionTexture)),Promise.all(i)}},Po=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_VOLUME}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];t.thickness=a.thicknessFactor===void 0?0:a.thicknessFactor,a.thicknessTexture!==void 0&&i.push(n.assignTexture(t,`thicknessMap`,a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let o=a.attenuationColor||[1,1,1];return t.attenuationColor=new z().setRGB(o[0],o[1],o[2],Vt),Promise.all(i)}},Fo=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_IOR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let r=n.extensions[this.name];return t.ior=r.ior===void 0?1.5:r.ior,Promise.resolve()}},Io=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_SPECULAR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];t.specularIntensity=a.specularFactor===void 0?1:a.specularFactor,a.specularTexture!==void 0&&i.push(n.assignTexture(t,`specularIntensityMap`,a.specularTexture));let o=a.specularColorFactor||[1,1,1];return t.specularColor=new z().setRGB(o[0],o[1],o[2],Vt),a.specularColorTexture!==void 0&&i.push(n.assignTexture(t,`specularColorMap`,a.specularColorTexture,k)),Promise.all(i)}},Lo=class{constructor(e){this.parser=e,this.name=Y.EXT_MATERIALS_BUMP}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return t.bumpScale=a.bumpFactor===void 0?1:a.bumpFactor,a.bumpTexture!==void 0&&i.push(n.assignTexture(t,`bumpMap`,a.bumpTexture)),Promise.all(i)}},Ro=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:an}extendMaterialParams(e,t){let n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let i=[],a=r.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&i.push(n.assignTexture(t,`anisotropyMap`,a.anisotropyTexture)),Promise.all(i)}},zo=class{constructor(e){this.parser=e,this.name=Y.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let i=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures`);return null}return t.loadTextureImage(e,i.source,a)}},Bo=class{constructor(e){this.parser=e,this.name=Y.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Vo=class{constructor(e){this.parser=e,this.name=Y.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Ho=class{constructor(e){this.name=Y.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let e=n.extensions[this.name],r=this.parser.getDependency(`buffer`,e.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`);return null}return r.then(function(t){let n=e.byteOffset||0,r=e.byteLength||0,a=e.count,o=e.byteStride,s=new Uint8Array(t,n,r);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(a,o,s,e.mode,e.filter).then(function(e){return e.buffer}):i.ready.then(function(){let t=new ArrayBuffer(a*o);return i.decodeGltfBuffer(new Uint8Array(t),a,o,s,e.mode,e.filter),t})})}return null}},Uo=class{constructor(e){this.name=Y.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let e of r.primitives)if(e.mode!==es.TRIANGLES&&e.mode!==es.TRIANGLE_STRIP&&e.mode!==es.TRIANGLE_FAN&&e.mode!==void 0)return null;let i=n.extensions[this.name].attributes,a=[],o={};for(let e in i)a.push(this.parser.getDependency(`accessor`,i[e]).then(t=>(o[e]=t,o[e])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(e=>{let t=e.pop(),n=t.isGroup?t.children:[t],r=e[0].count,i=[];for(let e of n){let t=new kt,n=new V,a=new je,s=new V(1,1,1),c=new de(e.geometry,e.material,r);for(let e=0;e<r;e++)o.TRANSLATION&&n.fromBufferAttribute(o.TRANSLATION,e),o.ROTATION&&a.fromBufferAttribute(o.ROTATION,e),o.SCALE&&s.fromBufferAttribute(o.SCALE,e),c.setMatrixAt(e,t.compose(n,a,s));for(let t in o)if(t===`_COLOR_0`){let e=o[t];c.instanceColor=new He(e.array,e.itemSize,e.normalized)}else t!==`TRANSLATION`&&t!==`ROTATION`&&t!==`SCALE`&&e.geometry.setAttribute(t,o[t]);ie.prototype.copy.call(c,e),this.parser.assignFinalMaterial(c),i.push(c)}return t.isGroup?(t.clear(),t.add(...i),t):i[0]}))}},Wo=`glTF`,Go=12,Ko={JSON:1313821514,BIN:5130562},qo=class{constructor(e){this.name=Y.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Go),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Wo)throw Error(`THREE.GLTFLoader: Unsupported glTF-Binary header.`);if(this.header.version<2)throw Error(`THREE.GLTFLoader: Legacy binary file detected.`);let r=this.header.length-Go,i=new DataView(e,Go),a=0;for(;a<r;){let t=i.getUint32(a,!0);a+=4;let r=i.getUint32(a,!0);if(a+=4,r===Ko.JSON){let r=new Uint8Array(e,Go+a,t);this.content=n.decode(r)}else if(r===Ko.BIN){let n=Go+a;this.body=e.slice(n,n+t)}a+=t}if(this.content===null)throw Error(`THREE.GLTFLoader: JSON content not found.`)}},Jo=class{constructor(e,t){if(!t)throw Error(`THREE.GLTFLoader: No DRACOLoader instance provided.`);this.name=Y.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,r=this.dracoLoader,i=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},s={},c={};for(let e in a){let t=as[e]||e.toLowerCase();o[t]=a[e]}for(let t in e.attributes){let r=as[t]||t.toLowerCase();if(a[t]!==void 0){let i=n.accessors[e.attributes[t]];c[r]=ts[i.componentType].name,s[r]=i.normalized===!0}}return t.getDependency(`bufferView`,i).then(function(e){return new Promise(function(t,n){r.decodeDracoFile(e,function(e){for(let t in e.attributes){let n=e.attributes[t],r=s[t];r!==void 0&&(n.normalized=r)}t(e)},o,c,Vt,n)})})}},Yo=class{constructor(){this.name=Y.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0?e:(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0,e)}},Xo=class{constructor(){this.name=Y.KHR_MESH_QUANTIZATION}},Zo=class extends qe{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r*3+r;for(let e=0;e!==r;e++)t[e]=n[i+e];return t}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=o*2,c=o*3,l=r-t,u=(n-t)/l,d=u*u,f=d*u,p=e*c,m=p-c,h=-2*f+3*d,g=f-d,_=1-h,v=g-d+u;for(let e=0;e!==o;e++){let t=a[m+e+o],n=a[m+e+s]*l,r=a[p+e+o],c=a[p+e]*l;i[e]=_*t+v*n+h*r+g*c}return i}},Qo=new je,$o=class extends Zo{interpolate_(e,t,n,r){let i=super.interpolate_(e,t,n,r);return Qo.fromArray(i).normalize().toArray(i),i}},es={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},ts={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},ns={9728:te,9729:yt,9984:Ie,9985:Mt,9986:Qt,9987:tt},rs={33071:mt,33648:Pe,10497:oe},is={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},as={POSITION:`position`,NORMAL:`normal`,TANGENT:`tangent`,TEXCOORD_0:`uv`,TEXCOORD_1:`uv1`,TEXCOORD_2:`uv2`,TEXCOORD_3:`uv3`,COLOR_0:`color`,WEIGHTS_0:`skinWeight`,JOINTS_0:`skinIndex`},os={scale:`scale`,translation:`position`,rotation:`quaternion`,weights:`morphTargetInfluences`},ss={CUBICSPLINE:void 0,LINEAR:Ye,STEP:Ge},cs={OPAQUE:`OPAQUE`,MASK:`MASK`,BLEND:`BLEND`};function ls(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new it({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:0})),e.DefaultMaterial}function us(e,t,n){for(let r in n.extensions)e[r]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=n.extensions[r])}function ds(e,t){t.extras!==void 0&&(typeof t.extras==`object`?Object.assign(e.userData,t.extras):console.warn(`THREE.GLTFLoader: Ignoring primitive type .extras, `+t.extras))}function fs(e,t,n){let r=!1,i=!1,a=!1;for(let e=0,n=t.length;e<n;e++){let n=t[e];if(n.POSITION!==void 0&&(r=!0),n.NORMAL!==void 0&&(i=!0),n.COLOR_0!==void 0&&(a=!0),r&&i&&a)break}if(!r&&!i&&!a)return Promise.resolve(e);let o=[],s=[],c=[];for(let l=0,u=t.length;l<u;l++){let u=t[l];if(r){let t=u.POSITION===void 0?e.attributes.position:n.getDependency(`accessor`,u.POSITION);o.push(t)}if(i){let t=u.NORMAL===void 0?e.attributes.normal:n.getDependency(`accessor`,u.NORMAL);s.push(t)}if(a){let t=u.COLOR_0===void 0?e.attributes.color:n.getDependency(`accessor`,u.COLOR_0);c.push(t)}}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(c)]).then(function(t){let n=t[0],o=t[1],s=t[2];return r&&(e.morphAttributes.position=n),i&&(e.morphAttributes.normal=o),a&&(e.morphAttributes.color=s),e.morphTargetsRelative=!0,e})}function ps(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,r=t.weights.length;n<r;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let t=0,r=n.length;t<r;t++)e.morphTargetDictionary[n[t]]=t}else console.warn(`THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.`)}}function ms(e){let t,n=e.extensions&&e.extensions[Y.KHR_DRACO_MESH_COMPRESSION];if(t=n?`draco:`+n.bufferView+`:`+n.indices+`:`+hs(n.attributes):e.indices+`:`+hs(e.attributes)+`:`+e.mode,e.targets!==void 0)for(let n=0,r=e.targets.length;n<r;n++)t+=`:`+hs(e.targets[n]);return t}function hs(e){let t=``,n=Object.keys(e).sort();for(let r=0,i=n.length;r<i;r++)t+=n[r]+`:`+e[n[r]]+`;`;return t}function gs(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error(`THREE.GLTFLoader: Unsupported normalized accessor component type.`)}}function _s(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?`image/jpeg`:e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?`image/webp`:e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?`image/ktx2`:`image/png`}var vs=new kt,ys=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new To,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,i=!1,a=-1;if(typeof navigator<`u`){let e=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(e)===!0;let t=e.match(/Version\/(\d+)/);r=n&&t?parseInt(t[1],10):-1,i=e.indexOf(`Firefox`)>-1,a=i?e.match(/Firefox\/([0-9]+)\./)[1]:-1}this.textureLoader=typeof createImageBitmap>`u`||n&&r<17||i&&a<98?new fe(this.options.manager):new Le(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Te(this.options.manager),this.fileLoader.setResponseType(`arraybuffer`),this.options.crossOrigin===`use-credentials`&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,i=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([n.getDependencies(`scene`),n.getDependencies(`animation`),n.getDependencies(`camera`)])}).then(function(t){let a={scene:t[0][r.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:r.asset,parser:n,userData:{}};return us(i,a,r),ds(a,r),Promise.all(n._invokeAll(function(e){return e.afterRoot&&e.afterRoot(a)})).then(function(){for(let e of a.scenes)e.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n].joints;for(let t=0,n=r.length;t<n;t++)e[r[t]].isBone=!0}for(let t=0,r=e.length;t<r;t++){let r=e[t];r.mesh!==void 0&&(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0&&(n[r.mesh].isSkinnedMesh=!0)),r.camera!==void 0&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),i=(e,t)=>{let n=this.associations.get(e);n!=null&&this.associations.set(t,n);for(let[n,r]of e.children.entries())i(r,t.children[n])};return i(n,r),r.name+=`_instance_`+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let i=e(t[r]);i&&n.push(i)}return n}getDependency(e,t){let n=e+`:`+t,r=this.cache.get(n);if(!r){switch(e){case`scene`:r=this.loadScene(t);break;case`node`:r=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case`mesh`:r=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case`accessor`:r=this.loadAccessor(t);break;case`bufferView`:r=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case`buffer`:r=this.loadBuffer(t);break;case`material`:r=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case`texture`:r=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case`skin`:r=this.loadSkin(t);break;case`animation`:r=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case`camera`:r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(n){return n!=this&&n.getDependency&&n.getDependency(e,t)}),!r)throw Error(`Unknown type: `+e)}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e===`mesh`?`es`:`s`)]||[];t=Promise.all(r.map(function(t,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!==`arraybuffer`)throw Error(`THREE.GLTFLoader: `+t.type+` buffer type is not supported.`);if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Y.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(e,i){n.load(qt.resolveURL(t.uri,r.path),e,void 0,function(){i(Error(`THREE.GLTFLoader: Failed to load buffer "`+t.uri+`".`))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency(`buffer`,t.buffer).then(function(e){let n=t.byteLength||0,r=t.byteOffset||0;return e.slice(r,r+n)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let e=is[r.type],t=ts[r.componentType],n=r.normalized===!0,i=new t(r.count*e);return Promise.resolve(new wt(i,e,n))}let i=[];return r.bufferView===void 0?i.push(null):i.push(this.getDependency(`bufferView`,r.bufferView)),r.sparse!==void 0&&(i.push(this.getDependency(`bufferView`,r.sparse.indices.bufferView)),i.push(this.getDependency(`bufferView`,r.sparse.values.bufferView))),Promise.all(i).then(function(e){let i=e[0],a=is[r.type],o=ts[r.componentType],s=o.BYTES_PER_ELEMENT,c=s*a,l=r.byteOffset||0,u=r.bufferView===void 0?void 0:n.bufferViews[r.bufferView].byteStride,d=r.normalized===!0,f,p;if(u&&u!==c){let e=Math.floor(l/u),n=`InterleavedBuffer:`+r.bufferView+`:`+r.componentType+`:`+e+`:`+r.count,c=t.cache.get(n);c||(f=new o(i,e*u,r.count*u/s),c=new Ft(f,u/s),t.cache.add(n,c)),p=new he(c,a,l%u/s,d)}else f=i===null?new o(r.count*a):new o(i,l,r.count*a),p=new wt(f,a,d);if(r.sparse!==void 0){let t=is.SCALAR,n=ts[r.sparse.indices.componentType],s=r.sparse.indices.byteOffset||0,c=r.sparse.values.byteOffset||0,l=new n(e[1],s,r.sparse.count*t),u=new o(e[2],c,r.sparse.count*a);i!==null&&(p=new wt(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let e=0,t=l.length;e<t;e++){let t=l[e];if(p.setX(t,u[e*a]),a>=2&&p.setY(t,u[e*a+1]),a>=3&&p.setZ(t,u[e*a+2]),a>=4&&p.setW(t,u[e*a+3]),a>=5)throw Error(`THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.`)}p.normalized=d}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,i=t.images[r],a=this.textureLoader;if(i.uri){let e=n.manager.getHandler(i.uri);e!==null&&(a=e)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let r=this,i=this.json,a=i.textures[e],o=i.images[t],s=(o.uri||o.bufferView)+`:`+a.sampler;if(this.textureCache[s])return this.textureCache[s];let c=this.loadImageSource(t,n).then(function(t){t.flipY=!1,t.name=a.name||o.name||``,t.name===``&&typeof o.uri==`string`&&o.uri.startsWith(`data:image/`)===!1&&(t.name=o.uri);let n=(i.samplers||{})[a.sampler]||{};return t.magFilter=ns[n.magFilter]||1006,t.minFilter=ns[n.minFilter]||1008,t.wrapS=rs[n.wrapS]||1e3,t.wrapT=rs[n.wrapT]||1e3,t.generateMipmaps=!t.isCompressedTexture&&t.minFilter!==1003&&t.minFilter!==1006,r.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[s]=c,c}loadImageSource(e,t){let n=this,r=this.json,i=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(e=>e.clone());let a=r.images[e],o=self.URL||self.webkitURL,s=a.uri||``,c=!1;if(a.bufferView!==void 0)s=n.getDependency(`bufferView`,a.bufferView).then(function(e){c=!0;let t=new Blob([e],{type:a.mimeType});return s=o.createObjectURL(t),s});else if(a.uri===void 0)throw Error(`THREE.GLTFLoader: Image `+e+` is missing URI and bufferView`);let l=Promise.resolve(s).then(function(e){return new Promise(function(n,r){let a=n;t.isImageBitmapLoader===!0&&(a=function(e){let t=new Ue(e);t.needsUpdate=!0,n(t)}),t.load(qt.resolveURL(e,i.path),a,void 0,r)})}).then(function(e){return c===!0&&o.revokeObjectURL(s),ds(e,a),e.userData.mimeType=a.mimeType||_s(a.uri),e}).catch(function(e){throw console.error(`THREE.GLTFLoader: Couldn't load texture`,s),e});return this.sourceCache[e]=l,l}assignTexture(e,t,n,r){let i=this;return this.getDependency(`texture`,n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),i.extensions[Y.KHR_TEXTURE_TRANSFORM]){let e=n.extensions===void 0?void 0:n.extensions[Y.KHR_TEXTURE_TRANSFORM];if(e){let t=i.associations.get(a);a=i.extensions[Y.KHR_TEXTURE_TRANSFORM].extendTexture(a,e),i.associations.set(a,t)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,i=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let e=`PointsMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new me,lt.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,t.sizeAttenuation=!1,this.cache.add(e,t)),n=t}else if(e.isLine){let e=`LineBasicMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new Wt,lt.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,this.cache.add(e,t)),n=t}if(r||i||a){let e=`ClonedMaterial:`+n.uuid+`:`;r&&(e+=`derivative-tangents:`),i&&(e+=`vertex-colors:`),a&&(e+=`flat-shading:`);let t=this.cache.get(e);t||(t=n.clone(),i&&(t.vertexColors=!0),a&&(t.flatShading=!0),r&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(n))),n=t}e.material=n}getMaterialType(){return it}loadMaterial(e){let t=this,n=this.json,r=this.extensions,i=n.materials[e],a,o={},s=i.extensions||{},c=[];if(s[Y.KHR_MATERIALS_UNLIT]){let e=r[Y.KHR_MATERIALS_UNLIT];a=e.getMaterialType(),c.push(e.extendParams(o,i,t))}else{let n=i.pbrMetallicRoughness||{};if(o.color=new z(1,1,1),o.opacity=1,Array.isArray(n.baseColorFactor)){let e=n.baseColorFactor;o.color.setRGB(e[0],e[1],e[2],Vt),o.opacity=e[3]}n.baseColorTexture!==void 0&&c.push(t.assignTexture(o,`map`,n.baseColorTexture,k)),o.metalness=n.metallicFactor===void 0?1:n.metallicFactor,o.roughness=n.roughnessFactor===void 0?1:n.roughnessFactor,n.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,`metalnessMap`,n.metallicRoughnessTexture)),c.push(t.assignTexture(o,`roughnessMap`,n.metallicRoughnessTexture))),a=this._invokeOne(function(t){return t.getMaterialType&&t.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(t){return t.extendMaterialParams&&t.extendMaterialParams(e,o)})))}i.doubleSided===!0&&(o.side=2);let l=i.alphaMode||cs.OPAQUE;if(l===cs.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,l===cs.MASK&&(o.alphaTest=i.alphaCutoff===void 0?.5:i.alphaCutoff)),i.normalTexture!==void 0&&a!==gt&&(c.push(t.assignTexture(o,`normalMap`,i.normalTexture)),o.normalScale=new et(1,1),i.normalTexture.scale!==void 0)){let e=i.normalTexture.scale;o.normalScale.set(e,e)}if(i.occlusionTexture!==void 0&&a!==gt&&(c.push(t.assignTexture(o,`aoMap`,i.occlusionTexture)),i.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=i.occlusionTexture.strength)),i.emissiveFactor!==void 0&&a!==gt){let e=i.emissiveFactor;o.emissive=new z().setRGB(e[0],e[1],e[2],Vt)}return i.emissiveTexture!==void 0&&a!==gt&&c.push(t.assignTexture(o,`emissiveMap`,i.emissiveTexture,k)),Promise.all(c).then(function(){let n=new a(o);return i.name&&(n.name=i.name),ds(n,i),t.associations.set(n,{materials:e}),i.extensions&&us(r,n,i),n})}createUniqueName(e){let t=R.sanitizeNodeName(e||``);return t in this.nodeNamesUsed?t+`_`+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function i(e){return n[Y.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(n){return xs(n,e,t)})}let a=[];for(let n=0,o=e.length;n<o;n++){let o=e[n],s=ms(o),c=r[s];if(c)a.push(c.promise);else{let e;e=o.extensions&&o.extensions[Y.KHR_DRACO_MESH_COMPRESSION]?i(o):xs(new Gt,o,t),r[s]={primitive:o,promise:e},a.push(e)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,r=this.extensions,i=n.meshes[e],a=i.primitives,o=[];for(let e=0,t=a.length;e<t;e++){let t=a[e].material===void 0?ls(this.cache):this.getDependency(`material`,a[e].material);o.push(t)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(n){let o=n.slice(0,n.length-1),s=n[n.length-1],c=[];for(let n=0,l=s.length;n<l;n++){let l=s[n],u=a[n],d,f=o[n];if(u.mode===es.TRIANGLES||u.mode===es.TRIANGLE_STRIP||u.mode===es.TRIANGLE_FAN||u.mode===void 0)d=i.isSkinnedMesh===!0?new Ae(l,f):new B(l,f),d.isSkinnedMesh===!0&&d.normalizeSkinWeights(),u.mode===es.TRIANGLE_STRIP?d.geometry=ka(d.geometry,1):u.mode===es.TRIANGLE_FAN&&(d.geometry=ka(d.geometry,2));else if(u.mode===es.LINES)d=new Rt(l,f);else if(u.mode===es.LINE_STRIP)d=new ut(l,f);else if(u.mode===es.LINE_LOOP)d=new At(l,f);else if(u.mode===es.POINTS)d=new ue(l,f);else throw Error(`THREE.GLTFLoader: Primitive mode unsupported: `+u.mode);Object.keys(d.geometry.morphAttributes).length>0&&ps(d,i),d.name=t.createUniqueName(i.name||`mesh_`+e),ds(d,i),u.extensions&&us(r,d,u),t.assignFinalMaterial(d),c.push(d)}for(let n=0,r=c.length;n<r;n++)t.associations.set(c[n],{meshes:e,primitives:n});if(c.length===1)return i.extensions&&us(r,c[0],i),c[0];let l=new j;i.extensions&&us(r,l,i),t.associations.set(l,{meshes:e});for(let e=0,t=c.length;e<t;e++)l.add(c[e]);return l})}loadCamera(e){let t,n=this.json.cameras[e],r=n[n.type];if(!r){console.warn(`THREE.GLTFLoader: Missing camera parameters.`);return}return n.type===`perspective`?t=new St(pt.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type===`orthographic`&&(t=new Ct(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),ds(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let e=0,r=t.joints.length;e<r;e++)n.push(this._loadNodeShallow(t.joints[e]));return t.inverseBindMatrices===void 0?n.push(null):n.push(this.getDependency(`accessor`,t.inverseBindMatrices)),Promise.all(n).then(function(e){let n=e.pop(),r=e,i=[],a=[];for(let e=0,o=r.length;e<o;e++){let o=r[e];if(o){i.push(o);let t=new kt;n!==null&&t.fromArray(n.array,e*16),a.push(t)}else console.warn(`THREE.GLTFLoader: Joint "%s" could not be found.`,t.joints[e])}return new L(i,a)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],i=r.name?r.name:`animation_`+e,a=[],o=[],s=[],c=[],l=[];for(let e=0,t=r.channels.length;e<t;e++){let t=r.channels[e],n=r.samplers[t.sampler],i=t.target,u=i.node,d=r.parameters===void 0?n.input:r.parameters[n.input],f=r.parameters===void 0?n.output:r.parameters[n.output];i.node!==void 0&&(a.push(this.getDependency(`node`,u)),o.push(this.getDependency(`accessor`,d)),s.push(this.getDependency(`accessor`,f)),c.push(n),l.push(i))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(s),Promise.all(c),Promise.all(l)]).then(function(e){let t=e[0],a=e[1],o=e[2],s=e[3],c=e[4],l=[];for(let e=0,r=t.length;e<r;e++){let r=t[e],i=a[e],u=o[e],d=s[e],f=c[e];if(r===void 0)continue;r.updateMatrix&&r.updateMatrix();let p=n._createAnimationTracks(r,i,u,d,f);if(p)for(let e=0;e<p.length;e++)l.push(p[e])}let u=new vt(i,void 0,l);return ds(u,r),u})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency(`mesh`,r.mesh).then(function(e){let t=n._getNodeRef(n.meshCache,r.mesh,e);return r.weights!==void 0&&t.traverse(function(e){if(e.isMesh)for(let t=0,n=r.weights.length;t<n;t++)e.morphTargetInfluences[t]=r.weights[t]}),t})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],i=n._loadNodeShallow(e),a=[],o=r.children||[];for(let e=0,t=o.length;e<t;e++)a.push(n.getDependency(`node`,o[e]));let s=r.skin===void 0?Promise.resolve(null):n.getDependency(`skin`,r.skin);return Promise.all([i,Promise.all(a),s]).then(function(e){let t=e[0],n=e[1],r=e[2];r!==null&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(r,vs)});for(let e=0,r=n.length;e<r;e++)t.add(n[e]);return t})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let i=t.nodes[e],a=i.name?r.createUniqueName(i.name):``,o=[],s=r._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return s&&o.push(s),i.camera!==void 0&&o.push(r.getDependency(`camera`,i.camera).then(function(e){return r._getNodeRef(r.cameraCache,i.camera,e)})),r._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){o.push(e)}),this.nodeCache[e]=Promise.all(o).then(function(t){let o;if(o=i.isBone===!0?new jt:t.length>1?new j:t.length===1?t[0]:new ie,o!==t[0])for(let e=0,n=t.length;e<n;e++)o.add(t[e]);if(i.name&&(o.userData.name=i.name,o.name=a),ds(o,i),i.extensions&&us(n,o,i),i.matrix!==void 0){let e=new kt;e.fromArray(i.matrix),o.applyMatrix4(e)}else i.translation!==void 0&&o.position.fromArray(i.translation),i.rotation!==void 0&&o.quaternion.fromArray(i.rotation),i.scale!==void 0&&o.scale.fromArray(i.scale);if(!r.associations.has(o))r.associations.set(o,{});else if(i.mesh!==void 0&&r.meshCache.refs[i.mesh]>1){let e=r.associations.get(o);r.associations.set(o,{...e})}return r.associations.get(o).nodes=e,o}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],r=this,i=new j;n.name&&(i.name=r.createUniqueName(n.name)),ds(i,n),n.extensions&&us(t,i,n);let a=n.nodes||[],o=[];for(let e=0,t=a.length;e<t;e++)o.push(r.getDependency(`node`,a[e]));return Promise.all(o).then(function(e){for(let t=0,n=e.length;t<n;t++)i.add(e[t]);return r.associations=(e=>{let t=new Map;for(let[e,n]of r.associations)(e instanceof lt||e instanceof Ue)&&t.set(e,n);return e.traverse(e=>{let n=r.associations.get(e);n!=null&&t.set(e,n)}),t})(i),i})}_createAnimationTracks(e,t,n,r,i){let a=[],o=e.name?e.name:e.uuid,s=[];os[i.path]===os.weights?e.traverse(function(e){e.morphTargetInfluences&&s.push(e.name?e.name:e.uuid)}):s.push(o);let c;switch(os[i.path]){case os.weights:c=se;break;case os.rotation:c=sn;break;case os.translation:case os.scale:c=ot;break;default:switch(n.itemSize){case 1:c=se;break;default:c=ot}}let l=r.interpolation===void 0?Ye:ss[r.interpolation],u=this._getArrayFromAccessor(n);for(let e=0,n=s.length;e<n;e++){let n=new c(s[e]+`.`+os[i.path],t.array,u,l);r.interpolation===`CUBICSPLINE`&&this._createCubicSplineTrackInterpolant(n),a.push(n)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=gs(t.constructor),n=new Float32Array(t.length);for(let r=0,i=t.length;r<i;r++)n[r]=t[r]*e;t=n}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof sn?$o:Zo)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function bs(e,t,n){let r=t.attributes,i=new zt;if(r.POSITION!==void 0){let e=n.json.accessors[r.POSITION],t=e.min,a=e.max;if(t!==void 0&&a!==void 0){if(i.set(new V(t[0],t[1],t[2]),new V(a[0],a[1],a[2])),e.normalized){let t=gs(ts[e.componentType]);i.min.multiplyScalar(t),i.max.multiplyScalar(t)}}else{console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`);return}}else return;let a=t.targets;if(a!==void 0){let e=new V,t=new V;for(let r=0,i=a.length;r<i;r++){let i=a[r];if(i.POSITION!==void 0){let r=n.json.accessors[i.POSITION],a=r.min,o=r.max;if(a!==void 0&&o!==void 0){if(t.setX(Math.max(Math.abs(a[0]),Math.abs(o[0]))),t.setY(Math.max(Math.abs(a[1]),Math.abs(o[1]))),t.setZ(Math.max(Math.abs(a[2]),Math.abs(o[2]))),r.normalized){let e=gs(ts[r.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`)}}i.expandByVector(e)}e.boundingBox=i;let o=new on;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,e.boundingSphere=o}function xs(e,t,n){let r=t.attributes,i=[];function a(t,r){return n.getDependency(`accessor`,t).then(function(t){e.setAttribute(r,t)})}for(let t in r){let n=as[t]||t.toLowerCase();n in e.attributes||i.push(a(r[t],n))}if(t.indices!==void 0&&!e.index){let r=n.getDependency(`accessor`,t.indices).then(function(t){e.setIndex(t)});i.push(r)}return Jt.workingColorSpace!==`srgb-linear`&&`COLOR_0`in r&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Jt.workingColorSpace}" not supported.`),ds(e,t),bs(e,t,n),Promise.all(i).then(function(){return t.targets===void 0?e:fs(e,t.targets,n)})}var Ss=[`head`,`face`,`back`,`outfit`,`feet`],Cs=[`dress`,`hair`,`fur`],ws=[{id:`crown`,slot:`head`,name:`Crown`,color:`#FFC83D`},{id:`bow`,slot:`head`,name:`Big bow`,color:`#FF4F9A`},{id:`cap`,slot:`head`,name:`Cap`,color:`#8EC9F5`,shade:!0},{id:`hearts`,slot:`face`,name:`Heart sunglasses`,color:`#FF4F9A`,tinted:!0},{id:`stars`,slot:`face`,name:`Star sunglasses`,color:`#FFC83D`,tinted:!0},{id:`round`,slot:`face`,name:`Round glasses`,color:`#B9A6F5`},{id:`fairy`,slot:`back`,name:`Fairy wings`,color:`#C9F2E4`},{id:`cape`,slot:`back`,name:`Princess cape`,color:`#B48CF0`},{id:`tutu`,slot:`outfit`,name:`Tutu`,color:`#D9CCFF`},{id:`gown`,slot:`outfit`,name:`Princess gown`,color:`#FBEA9A`},{id:`sneakers`,slot:`feet`,name:`Light-up sneakers`,color:`#FFFFFF`},{id:`boots`,slot:`feet`,name:`Rain boots`,color:`#FF8FB8`}],Ts=e=>ws.find(t=>t.id===e),Es={pink:{name:`Pink`,hex:`#FF6FAE`,hsl:[328,.84,.74]},lilac:{name:`Lilac`,hex:`#B79AF0`,hsl:[268,.61,.71]},mint:{name:`Mint`,hex:`#8FE3C8`,hsl:[160,.6,.7]},sky:{name:`Sky`,hex:`#8EC9F5`,hsl:[206,.8,.74]},butter:{name:`Butter`,hex:`#FBE27A`,hsl:[48,.92,.72]},peach:{name:`Peach`,hex:`#FFB08A`,hsl:[20,.95,.77]},brown:{name:`Brown`,hex:`#7A4A2E`,hsl:[22,.53,.3]},cream:{name:`Cream`,hex:`#FFF1DC`,hsl:[36,.85,.9]}},Ds=Object.keys(Es),Os={dress:`pink`,hair:`brown`,fur:`lilac`},ks={v:1,on:{},paint:{}},As=`thailand-look`,js=(e,t)=>e.paint[t]??Os[t];function Ms(e){let t={v:1,on:{},paint:{}};if(!e||typeof e!=`object`)return t;let n=e;for(let e of Ss){let r=n.on?.[e],i=typeof r==`string`?Ts(r):void 0;i&&i.slot===e&&(t.on[e]=i.id)}for(let e of Cs){let r=n.paint?.[e];typeof r==`string`&&r in Es&&r!==Os[e]&&(t.paint[e]=r)}return t}function Ns(e){let t={v:1,on:{},paint:{}};for(let n of e.split(`,`).map(e=>e.trim()).filter(Boolean)){let e=Ts(n);if(e){t.on[e.slot]=e.id;continue}let[r,i]=n.split(`-`);Cs.includes(r)&&i in Es&&i!==Os[r]&&(t.paint[r]=i)}return t}function Ps(e){let t=[];for(let n of Ss)e.on[n]&&t.push(e.on[n]);for(let n of Cs)e.paint[n]&&t.push(`${n}-${e.paint[n]}`);return t.join(`,`)}function Fs(e,t,n){let r=Ts(t);if(!r)return e;let i={v:1,on:{...e.on},paint:{...e.paint}};return n?i.on[r.slot]=t:i.on[r.slot]===t&&delete i.on[r.slot],i}function Is(e,t,n){let r={v:1,on:{...e.on},paint:{...e.paint}};return n===Os[t]?delete r.paint[t]:r.paint[t]=n,r}function Ls(){try{let e=localStorage.getItem(b(As));return e===null?ks:Ms(JSON.parse(e))}catch{return ks}}function Rs(){let e=ln(`look`);return e===null?Ls():Ns(e)}var zs=1.8,Bs=.045,Vs=.818,Hs=.184,Us=`#C9B5F7`,Ws=`#FF8FB8`,Gs=e=>t=>[0,Math.asin(Math.max(-1,Math.min(1,t/e))),0];function Ks(e,t,n){return{H:1,R:e,headY:t,shoulder:[0,0,0],eyeX:.109,eyeY:0,eyeSize:.05,lift:0,on:(r,i,a=0)=>[r,t+i,n+Math.sqrt(Math.max(0,e*e-r*r-i*i))+a],turnTo:Gs(e)}}var qs=Ks(.24,.148,-.02),Js=Ks(.3,.18,0),Ys=-.04;function Xs(e,t){let n=new Oe(e.map(([e,t])=>new et(t,e)),28),r=n.attributes.position;for(let t=0;t<r.count;t++){let n=r.getY(t),i=e.reduce((e,t)=>Math.abs(t[0]-n)<Math.abs(e[0]-n)?t:e),a=i[1]?i[2]/i[1]:1;r.setZ(t,Bs+r.getZ(t)*a)}return n.computeVertexNormals(),Ka(n,t)}var Zs=[[.2,.172,.152],[.24,.162,.14],[.3,.137,.12],[.34,.12,.111],[.4,.118,.095],[.45,.112,.072],[.468,.07,.045]],Qs=(e,t)=>Xs([[e,0,0],[e,.176,.157],...Zs,[.472,0,0]],t);function $s(e,t){let n=Math.max(0,Zs.findIndex(e=>e[0]>=t)-1),[r,i]=[Zs[n],Zs[Math.min(n+1,Zs.length-1)]],a=i[0]>r[0]?Math.min(1,Math.max(0,(t-r[0])/(i[0]-r[0]))):0,o=r[1]+(i[1]-r[1])*a;return Bs+(r[2]+(i[2]-r[2])*a)*Math.sqrt(Math.max(0,1-(e/o)**2))}var ec=(e,t)=>[e*Math.sin(Vs)*t,-Math.cos(Vs)*t,0],tc=(e,t)=>K.capsule(.049,.07,t,{at:ec(e,.015),rot:[0,0,e*Vs]}),nc=(e,t,n)=>e.length||t.length?qa(e,t,n,zs):null;function rc(e,t,n){if(!e)return null;let r=new j;return r.rotation.y=t*n,r.add(e),r}function ic(e){let[t,n,r]=[.29,.32,.19],i=[0,.32,-.03],a=.14,o=Ka(new M(1,28,10,0,Math.PI*2,0,Math.PI/2),mo,{at:i,rot:[a,0,0],scale:[t,r,n]}),s=K.torus(1,.022,ho,{at:i,rot:[Math.PI/2+a,0,0],scale:[t,n,1]}),c=(e,o)=>{let[s,c]=[r*Math.sqrt(Math.max(0,1-e*e-o*o))+.004,o*n];return[e*t,i[1]+s*Math.cos(a)-c*Math.sin(a),i[2]+s*Math.sin(a)+c*Math.cos(a)]},l=[[-.5,.45],[.15,.6],[.55,.3],[-.15,.15],[.35,-.2],[-.45,-.25]].map(([e,t])=>K.sphere(.018,`#FF8FB8`,{at:c(e,t),scale:[1,.45,1]}));return qa([o,s],l,e,zs)}var ac=[.306,.307,.302,.286,.273,.267,.26,.247,.244,.241,.22,.209,.205,.21,.22,.241,.244,.248,.26,.268,.29,.306,.302,.308];function oc(e){let t=new V(0,.33,-.04),n=.12,r=ac.length,i=(e,i)=>{let a=Math.max(ac[e%r],(ac[(e+r-1)%r]+ac[(e+1)%r])/2)+i,o=e/r*Math.PI*2;return new V(Math.sin(o),-Math.cos(o)*Math.sin(n),Math.cos(o)*Math.cos(n)).multiplyScalar(a).add(t)},a=Array.from({length:r},(e,t)=>i(t,.026)),o=Ka(new It(new Dt(a,!0),96,.022,10,!0),`#E8403F`),s=i(r/2,.032),c=[-1,1].map(e=>K.capsule(.016,.09,`#E8403F`,{at:[e*.03,s.y-.06,s.z-.012],rot:[-.35,0,e*.3],scale:[1.4,1,.6]})),l=i(0,.049999999999999996),u=K.sphere(.018,`#FFC83D`,{at:[l.x,l.y,l.z]});return qa([o,...c],[u],e,zs)}function sc(e){return{glassesUp:{y:.11,z:.11,tilt:-.42},build(t,n){let r=no.kaylee;if(t===`sunglasses`)return _o(r,t,n,qs,zs);if(t===`scrub-cap`)return{head:ic(n),body:null,armL:null,armR:null};if(t===`mongkhon`)return{head:oc(n),body:null,armL:null,armR:null};if(t===`sunhat`||t===`spare-hat`||t===`chef-hat`){let e=_o(r,t,n,Js,zs);return e.head.position.z=Ys,e}let i=[],a=[],o={L:[],R:[]},s={L:[],R:[]},c=[[`L`,-1],[`R`,1]];if(t===`scrubs`){i.push(Qs(.175,mo)),i.push(K.rbox(.05,.045,.01,.006,ho,{at:[.05,.37,$s(.05,.37)+.004],rot:[-.25,.4,0]})),i.push(K.cyl(.006,.006,.045,`#FF4F9A`,{at:[.04,.397,$s(.04,.397)+.006],rot:[-.25,0,.15]}));for(let e of[-1,1])a.push(K.box(.01,.05,.008,`#FFFFFF`,{at:[e*.016,.44,$s(.016,.44)+.002],rot:[-.6,0,e*.5]}));for(let[e,t]of c)o[e].push(tc(t,mo)),s[e].push(K.cyl(.058,.066,.12,ho,{at:[t*-.003,-.03,.012],scale:[1,1,1.08]}))}if(t===`smock`){i.push(Qs(.17,Us)),a.push(...[.4,.33,.26].map(e=>K.sphere(.011,`#FFFFFF`,{at:[.045,e,$s(.045,e)]}))),i.push(K.rbox(.05,.045,.01,.006,`#B39CEB`,{at:[-.05,.37,$s(-.05,.37)+.004],rot:[-.25,-.4,0]})),i.push(K.box(.036,.022,.006,`#FF8FB8`,{at:[-.05,.398,$s(-.05,.398)+.004],rot:[-.25,-.4,0]}));for(let[e,t]of c)o[e].push(tc(t,Us))}if(t===`apron`){i.push(Xs([[.185,0,0],[.185,.178,.159],[.24,.164,.142],[.3,.139,.122],[.305,0,0]],Ws)),i.push(K.rbox(.13,.11,.016,.016,Ws,{at:[0,.37,.15],rot:[-.3,0,0]})),i.push(K.torus(.14,.011,`#FFFFFF`,{at:[0,.302,Bs],rot:[Math.PI/2,0,0],scale:[1,.88,1]}));for(let e of[-1,1])i.push(K.capsule(.009,.07,`#FFFFFF`,{at:[e*.05,.44,.105],rot:[-.9,0,-e*.4]}));a.push(K.rbox(.06,.04,.01,.008,`#FFFFFF`,{at:[0,.235,.192],rot:[-.3,0,0]}))}if(t===`gloves`)for(let[e,t]of c){o[e].push(K.sphere(.064,`#FF4F9A`,{at:ec(t,.196),rot:[0,0,t*Vs],scale:[1,1.1,1.12]}));let[n,r]=ec(t,.174);o[e].push(K.sphere(.026,`#FF4F9A`,{at:[n,r,.05],rot:[0,0,t*Vs],scale:[.9,1.4,.9]})),o[e].push(K.cyl(.046,.05,.03,`#FFFFFF`,{at:ec(t,.124),rot:[0,0,t*Vs]}))}if(t===`floaties`)for(let[e,t,n]of[[`L`,-1,`#FF7FA8`],[`R`,1,`#FF9F45`]]){let r=[Math.PI/2,t*Vs,0],i=ec(t,.095);o[e].push(K.torus(.046,.03,n,{at:i,rot:r})),o[e].push(K.torus(.06,.01,`#FFF7F0`,{at:ec(t,.071),rot:r}));let a=[Math.cos(Vs)*t,Math.sin(Vs),0];o[e].push(K.cyl(.009,.009,.026,`#FFF7F0`,{at:[i[0]+a[0]*.08,i[1]+a[1]*.08,.012],rot:[0,0,t*(Vs-Math.PI/2)]}))}return{head:null,body:nc(i,a,n),armL:rc(nc(o.L,[],n),-1,e),armR:rc(nc(o.R,[],n),1,e),legL:nc(s.L,[],n),legR:nc(s.R,[],n)}}}}var cc=null;function lc(e,t){if(e===`fairy`){let e=[];for(let t of[-1,1])e.push(K.sphere(.16,`#C9F2E4`,{at:[t*.27,.47,-.2],rot:[.2,t*.35,t*-.55],scale:[1.15,.72,.1]},20)),e.push(K.sphere(.1,`#D9CCFF`,{at:[t*.22,.28,-.17],rot:[.2,t*.35,t*.5],scale:[1.1,.75,.1]},18));e.push(K.sphere(.035,`#FF8FB8`,{at:[0,.36,-.12]}));let n=nc(e,[],t);return n.userData.wings=!0,n}let n=[[.465,.11],[.4,.15],[.3,.19],[.2,.225],[.13,.24]].map(([e,t])=>new et(t,e)),r=new Oe(n.reverse(),24,Math.PI/2+.25,Math.PI-.5);r.translate(0,0,Bs);let i=Ka(r,`#B48CF0`,{scale:[1,1,1.05]});cc??=new tn({vertexColors:!0,gradientMap:ja(),side:2});let a=new j,o=new B(t.add(i),cc);a.add(o);let s=Ua(i,zs);t.add(s.geometry),a.add(s);let c=nc([K.sphere(.022,`#FFC83D`,{at:[0,.45,.1]})],[],t);return c&&a.add(c),a}var uc=qs.R,dc=qs.eyeX,fc=e=>Array.from({length:10},(t,n)=>{let r=n/10*Math.PI*2,i=n%2?.48:1;return[Math.sin(r)*e*i,Math.cos(r)*e*i]});function pc(e,t){if(e===`hearts`)return _o(no.kaylee,`sunglasses`,t,qs,zs).head;let n=.13*uc,r=[],i=[];for(let t of[-1,1]){let a=t*dc,o=qs.turnTo(a);e===`stars`?(r.push(K.prism(fc(.07),.014,`#FFC83D`,{at:qs.on(a,.005,n),rot:o})),r.push(K.prism(fc(.052),.016,`#5A3F66`,{at:qs.on(a,.005,n+.004),rot:o})),i.push(K.sphere(.012,`#FFFFFF`,{at:qs.on(a-t*.018,.022,n+.014),rot:o,scale:[1,1,.3]}))):r.push(K.torus(.055,.009,`#9C86DA`,{at:qs.on(a,0,n),rot:o},Math.PI*2))}let a=qs.on(0,e===`stars`?.03:.02,n+.01);return r.push(K.capsule(.008,dc*2-.13,e===`stars`?`#FFC83D`:`#9C86DA`,{at:a,rot:[0,0,Math.PI/2]})),nc(r,i,t)}var mc=`#FFC83D`,hc=`#FF4F9A`;function gc(e,t,n=[0,0,0]){let r=new j;return r.position.set(...t),r.rotation.set(...n),e&&r.add(e),r}function _c(e,t){if(e===`crown`){let e=.078,n=[K.cyl(.082,e,.05,mc,{},24)],r=[];for(let t=0;t<5;t++){let i=t/5*Math.PI*2;n.push(K.cone(.022,.05,mc,{at:[Math.sin(i)*e,.048,Math.cos(i)*e]},10)),r.push(K.sphere(.011,hc,{at:[Math.sin(i)*.083,.076,Math.cos(i)*.083]},10))}r.push(K.sphere(.018,hc,{at:[0,0,.084],scale:[1,1,.6]},12));let i=gc(nc(n,r,t),[0,.432,.13],[.6,0,0]);return i.userData.upright=!0,i}if(e===`bow`){let e=`#FF4F9A`,n=[-1,1].map(t=>K.sphere(.075,e,{at:[.012,.025,t*.068],rot:[t*.45,0,0],scale:[.42,.75,1.2]},14));return n.push(...[-1,1].map(t=>K.capsule(.016,.06,e,{at:[.008,-.05,t*.03],rot:[t*.35,0,0]}))),n.push(K.sphere(.034,`#FF7FB8`,{at:[.025,.01,0],scale:[.8,1,1]})),gc(nc(n,[],t),[.345,.2,-.03],[0,0,-.35])}let[n,r,i]=[.29,.32,.19],a=[0,.32,-.03],o=.14;return gc(nc([Ka(new M(1,28,10,0,Math.PI*2,0,Math.PI/2),`#8EC9F5`,{at:a,rot:[o,0,0],scale:[n,i,r]}),K.torus(1,.02,`#5FA8E8`,{at:a,rot:[Math.PI/2+o,0,0],scale:[n,r,1]}),K.cyl(.17,.17,.016,`#5FA8E8`,{at:[0,a[1]-.045,a[2]-r-.06],rot:[-.32,0,0],scale:[1,1,.7]},24)],[K.sphere(.022,`#FFFFFF`,{at:[0,a[1]+i+.012-.03,a[2]-.02]})],t),[0,0,0])}function vc(e,t){if(e===`tutu`){let e=[];for(let t=0;t<14;t++){let n=t/14*Math.PI*2;e.push(K.sphere(.06,t%2?`#FFC2DD`:`#D9CCFF`,{at:[Math.sin(n)*.19,.235,Bs+Math.cos(n)*.165],rot:[0,n,0],scale:[1.2,.55,.9]},12))}return e.push(K.cyl(.15,.2,.05,`#E9DEFF`,{at:[0,.26,Bs],scale:[1,1,.88]},24)),nc(e,[],t)}return nc([Xs([[.01,0,0],[.01,.265,.245],[.08,.25,.23],[.16,.215,.195],[.22,.175,.158],[.27,.152,.137],[.32,.128,.116],[.4,.12,.098],[.45,.114,.075],[.468,.072,.047],[.472,0,0]],`#FBEA9A`),K.torus(.15,.014,`#FF8FB8`,{at:[0,.3,Bs],rot:[Math.PI/2,0,0],scale:[1,.9,1]})],[.38,.33].map(e=>K.sphere(.012,`#8FE3C8`,{at:[0,e,Bs+(e>.35?.104:.122)]})),t)}function yc(e,t){let n=n=>{let r=[n*.015,-.118,.03],i=[],a=[];return e===`sneakers`?(i.push(K.rbox(.158,.08,.215,.035,`#FFFFFF`,{at:r})),i.push(K.rbox(.166,.026,.224,.012,`#8FE3C8`,{at:[r[0],r[1]-.037,r[2]]})),a.push(K.box(.006,.026,.12,`#FF4F9A`,{at:[r[0]+n*.08,r[1]+.005,r[2]-.01]})),a.push(K.sphere(.016,`#FBE27A`,{at:[r[0],r[1]-.025,r[2]+.112],scale:[1.4,.7,.6]}))):(i.push(K.rbox(.166,.085,.22,.038,`#FF8FB8`,{at:r})),i.push(K.cyl(.076,.079,.11,`#FF8FB8`,{at:[r[0],r[1]+.085,r[2]-.03]},18)),i.push(K.torus(.077,.012,`#FFFFFF`,{at:[r[0],r[1]+.14,r[2]-.03],rot:[Math.PI/2,0,0]}))),nc(i,a,t)};return[n(-1),n(1)]}var bc=()=>({head:null,body:null,armL:null,armR:null,legL:null,legR:null});function xc(e,t,n){let r=Ts(e);if(!r)return null;if(r.slot===`head`){let n=_c(e,t);return{...bc(),head:n}}if(r.slot===`face`)return{...bc(),head:pc(e,t)};if(r.slot===`back`)return{...bc(),body:lc(e,t)};if(r.slot===`outfit`)return{...bc(),body:vc(e,t)};let[i,a]=yc(e,t);return{...bc(),legL:i,legR:a}}var Sc=`/Kaylee-Gamepack/assets/kaylee-DU9IpD0g.glb`,Cc=`#F6E2DF`,wc=1.8,Tc=2,Ec=.004,Dc=1.25,Oc=.105,kc=.17,Ac=.007,jc=null,Mc=null,Nc=()=>jc;function Pc(){return Mc??=new wo().loadAsync(Sc).then(e=>jc=e),Mc}var Fc=null;function Ic(){return Fc??=Pc().catch(e=>(console.warn(`kaylee.glb could not be loaded, using the code-built Kaylee.`,e),null)),Fc}var Lc=new Map;function Rc(e){let t=Lc.get(e);return t||(t=new tn({map:e,gradientMap:ja()}),Lc.set(e,t)),t}var zc={fur:{hue:272,width:30,s:.61,l:.71,lmin:.25,lmax:.93},dress:{hue:322,width:24,s:.84,l:.74,lmin:.4,lmax:.95},hair:{hue:22,width:30,s:.53,l:.28,lmin:0,lmax:.55}};function Bc(e){return/^(hair|tail|braid)/.test(e)?[`hair`]:/^(body|arm)/.test(e)?[`fur`,`dress`]:/^(face|leg|ear)/.test(e)?[`fur`]:[]}var Vc=`
uniform vec3 kBand[3];
uniform vec4 kRef[3];
uniform vec3 kTo[3];
vec3 kRgb2Hsl(vec3 c) {
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float l = (mx + mn) * 0.5;
  float d = mx - mn;
  if (d < 1e-5) return vec3(0.0, 0.0, l);
  float s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
  float h = mx == c.r ? (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0) : mx == c.g ? (c.b - c.r) / d + 2.0 : (c.r - c.g) / d + 4.0;
  return vec3(h / 6.0, s, l);
}
float kHue(float p, float q, float t) {
  t = fract(t);
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}
vec3 kHsl2Rgb(vec3 h) {
  if (h.y < 1e-5) return vec3(h.z);
  float q = h.z < 0.5 ? h.z * (1.0 + h.y) : h.z + h.y - h.z * h.y;
  float p = 2.0 * h.z - q;
  return vec3(kHue(p, q, h.x + 1.0 / 3.0), kHue(p, q, h.x), kHue(p, q, h.x - 1.0 / 3.0));
}
vec3 kRecolor(vec3 lin) {
  vec3 c = pow(max(lin, vec3(0.0)), vec3(1.0 / 2.2));
  vec3 hsl = kRgb2Hsl(c);
  vec3 outc = c;
  for (int i = 0; i < 3; i++) {
    if (kBand[i].x < 0.5) continue;
    float d = abs(hsl.x - kBand[i].y);
    d = min(d, 1.0 - d);
    float w = (1.0 - smoothstep(kBand[i].z * 0.55, kBand[i].z, d)) * smoothstep(0.12, 0.24, hsl.y);
    w *= smoothstep(kRef[i].z - 0.06, kRef[i].z, hsl.z) * (1.0 - smoothstep(kRef[i].w, kRef[i].w + 0.06, hsl.z));
    vec3 to = vec3(kTo[i].x, clamp(kTo[i].y * hsl.y / kRef[i].x, 0.0, 1.0), clamp(kTo[i].z + (hsl.z - kRef[i].y), 0.03, 0.97));
    outc = mix(outc, kHsl2Rgb(to), w);
  }
  return pow(outc, vec3(2.2));
}
`,Hc=new Map;function Uc(e,t,n){let r=t.filter(e=>n[e]!==Os[e]);if(!r.length)return Rc(e);let i=`${e.uuid}|${r.map(e=>`${e}:${n[e]}`).join(`,`)}`,a=Hc.get(i);if(!a){let t=[],o=[],s=[];for(let e=0;e<3;e++){let i=r[e],a=i?zc[i]:null,[c,l,u]=i?Es[n[i]].hsl:[0,0,0];t.push(new V(+!!a,(a?.hue??0)/360,(a?.width??0)/360)),o.push(new Bt(a?.s??1,a?.l??0,a?.lmin??0,a?.lmax??1)),s.push(new V(c/360,l,u))}a=new tn({map:e,gradientMap:ja()}),a.onBeforeCompile=e=>{e.uniforms.kBand={value:t},e.uniforms.kRef={value:o},e.uniforms.kTo={value:s},e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>\n${Vc}`).replace(`#include <map_fragment>`,`#include <map_fragment>
	diffuseColor.rgb = kRecolor(diffuseColor.rgb);`)},a.customProgramCacheKey=()=>`kaylee-recolor`,Hc.set(i,a)}return a}function Wc(e,t=6,n=0){let r=Ha(e),i=r.attributes.position.array,a=i.slice(),o=r.index.array,s=i.length/3,c=Array.from({length:s},()=>new Set);for(let e=0;e<o.length;e+=3){let[t,n,r]=[o[e],o[e+1],o[e+2]];c[t].add(n).add(r),c[n].add(t).add(r),c[r].add(t).add(n)}let l=new Float32Array(i.length);for(let e=0;e<t*2;e++){let t=e%2?-.53:.5;for(let e=0;e<s;e++){let n=0,r=0,a=0;for(let t of c[e])n+=i[t*3],r+=i[t*3+1],a+=i[t*3+2];let o=c[e].size||1;l[e*3]=i[e*3]+t*(n/o-i[e*3]),l[e*3+1]=i[e*3+1]+t*(r/o-i[e*3+1]),l[e*3+2]=i[e*3+2]+t*(a/o-i[e*3+2])}i.set(l)}if(r.computeVertexNormals(),n){let e=r.attributes.normal.array;for(let t=0;t<i.length;t++)i[t]+=e[t]*n}else i.set(a);let u=e=>{let[t,n]=[a[e*3],a[e*3+1]];return Math.abs(Math.abs(t)-Oc)<.002&&n>.34&&n<.46||Math.abs(n-kc)<.001},d=[];for(let e=0;e<o.length;e+=3)u(o[e])&&u(o[e+1])&&u(o[e+2])||d.push(o[e],o[e+1],o[e+2]);return r.setIndex(d),r}function Gc(e,t){let n=e.scene.clone(!0),r=e=>{let t=n.getObjectByName(e);if(!t)throw Error(`kaylee.glb has no ${e}`);return t},i=[];n.traverse(e=>{e instanceof B&&i.push(e)});for(let e of i){let n=e.material.map;if(n&&(e.material=Rc(n),e.userData.map=n),!e.name.startsWith(`eye`)){let n=e.name.startsWith(`hair`)?Ac:0,r=e.name.startsWith(`face`)?Wc(e.geometry,18,Ec):Wc(e.geometry),i=new B(t.add(r),Va(wc,void 0,n));i.userData.hull=wc,i.userData.hullBias=n,e.add(i)}}let a=new j,[o,s,c,l,u,d,f,p]=[`body`,`head`,`eyes`,`armL`,`armR`,`tail`,`legL`,`legR`].map(r);a.add(Ya(.26,t),o),a.scale.setScalar(Dc);let m=[];for(let[e,t]of[[l,-1],[u,1]]){let n=new j;n.position.copy(e.position),n.rotation.y=-t*Tc,e.parent.add(n),e.position.set(0,0,0),n.add(e);let r=new j;r.rotation.y=t*Tc,r.add(...e.children),e.add(r);let i=new j;i.position.set(...ec(t,Hs)),r.add(i),m.push(i)}let h=[];for(let e of[-1,1]){let n=new j;n.position.set(e*.109,.047,.006),n.add(J(K.sphere(.058,Cc,{at:[0,-.05,0],scale:[1,.95,.6]}),t,wc)),n.scale.y=.001,n.visible=!1,h.push(n)}let g=new j;g.position.copy(c.position),g.add(...h),s.add(g);let _=new j,v=new j;return v.visible=!1,s.add(_,v),{root:a,body:o,head:s,eyes:c,mouth:_,talk:v,open:!1,armL:l,armR:u,tail:d,legL:f,legR:p,mane:null,height:Dc,radius:.16*Dc,lie:{lift:.06,tilt:.46},phone:null,face:{R:.24,headY:.148,mouth:[0,.06,.21]},wardrobe:sc(Tc),closet:(e,t)=>xc(e,t,Tc),paint(e){for(let t of i){let n=t.userData.map;n&&(t.material=Uc(n,Bc(t.name),e))}},hands:[m[0],m[1]],waist:{y:.29,z:.045,rx:.155,rz:.14},front:(e,t)=>$s(e,t)-.006,blink(e){c.scale.y=1;let t=(1-e)/.9;for(let e of h)e.visible=t>.02,e.scale.y=Math.max(.001,t)}}}var Kc=no.kaylee.height,qc=[.28,.5,.78],Jc=.11,Yc=-1.35,Xc=class{bag;id=`kaylee`;root;height;pose=`stand`;floor=0;standPoint=null;pace=1;chibi;path=[];onArrive=null;speed=0;yaw=Math.PI;yawVel=0;yawGoal=Math.PI;phase=0;tweens=[];settle=1;bounce={level:-1,t:0};flop=1;sitK=0;look=null;headYaw=0;life;waving=-1;wind=new vo;worn=new Map;entering=new Map;style=ks;closet=new Map;popping=new Map;twirling=-1;constructor(e,t=Nc()){this.bag=e,this.chibi=t?Gc(t,e):yo(no.kaylee,e),this.height=this.chibi.height,this.life=new Co(this.chibi),this.root=this.chibi.root,this.root.rotation.y=this.yaw,this.root.userData.pick=`kaylee`}get position(){return this.root.position}get rig(){return this.chibi}wear(e){for(let t of new Set([...e,...this.worn.keys()])){let n=e.includes(t),r=this.worn.get(t);if(!r&&n){let e=this.chibi,n=e.wardrobe?.build(t,this.bag)??_o(no.kaylee,t,this.bag);r=[];for(let[i,a]of[[n.head,e.head],[n.armL,e.armL],[n.armR,e.armR],[n.body,e.body],[n.legL,e.legL],[n.legR,e.legR]])i&&a&&(a.add(i),r.push(i),i.userData.base=i.position.clone(),(t===`sunhat`||t===`spare-hat`)&&(i.rotation.x=-.16));this.worn.set(t,r)}for(let e of r??[])e.visible=n}}setLook(e,t=!1){let n=this.style;this.style=e;let r=new Set(Object.values(e.on));for(let e of new Set([...r,...this.closet.keys()])){let i=r.has(e),a=this.closet.get(e);if(!a&&i){let t=this.chibi,n=t.closet?.(e,this.bag);if(a=[],n)for(let[r,i]of[[n.head,t.head],[n.armL,t.armL],[n.armR,t.armR],[n.body,t.body],[n.legL,t.legL],[n.legR,t.legR]])r&&i&&(i.add(r),r.userData.closet=e,a.push(r));this.closet.set(e,a)}for(let e of a??[])e.visible=i;t&&i&&!Object.values(n.on).includes(e)&&this.popping.set(e,0)}let i={};for(let t of Cs)i[t]=js(e,t);(Cs.some(e=>js(n,e)!==i[e])||n===ks)&&this.chibi.paint?.(i)}get myLook(){return this.style}get dressable(){return!!this.chibi.closet}onSpot(e){let t=this.style.on[e];return t?(this.closet.get(t)??[]).filter(e=>e.visible):[]}itemOf(e){for(let t=e;t;t=t.parent)if(typeof t.userData.closet==`string`)return Ts(t.userData.closet)?t.userData.closet:null;return null}twirl(){this.twirling<0&&(this.twirling=0),this.react(`hop`)}putOn(e){let t=new Set(this.wearing);this.wear(e);for(let n of e)t.has(n)||this.entering.set(n,0)}glassesUp(e){let t=.24*Kc,n=this.chibi.wardrobe?.glassesUp??{y:.62*t,z:.12*t,tilt:-.42};for(let t of this.worn.get(`sunglasses`)??[])t.position.set(0,e?n.y:0,e?n.z:0),t.userData.base=t.position.clone(),t.rotation.x=e?n.tilt:0}get wearing(){return[...this.worn].filter(([,e])=>e[0]?.visible).map(([e])=>e)}setWind(e){this.wind.goal=e}get walking(){return this.path.length>0||this.tweens.length>0}get busy(){return this.walking||this.speed>.01||this.pose===`bounce`||this.settle<1||this.flop<1||this.popping.size>0||this.twirling>=0}place(e,t,n,r){this.root.position.set(e,t,n),this.yaw=this.yawGoal=Math.PI/180*r,this.yawVel=0,this.path=[],this.tweens=[],this.speed=0}face(e){this.yawGoal=e}faceToward(e,t){let n=this.root.position;Math.hypot(e-n.x,t-n.z)>.05&&(this.yawGoal=Math.atan2(e-n.x,t-n.z))}walk(e,t){let n=()=>{this.path=e.slice(),this.onArrive=t??null};if(this.pose!==`stand`&&this.standPoint){let e=this.standPoint;this.standPoint=null,this.setPose(`stand`),this.path=[],this.hopTo(e,.28,.18,n)}else this.setPose(`stand`),n()}stop(){this.path=[],this.onArrive=null}hopTo(e,t,n,r){this.tweens.push({from:new V,to:e.clone(),dur:t,arc:n,t:-1,done:r})}setPose(e){e===`bounce`&&this.pose!==`bounce`&&(this.bounce={level:0,t:0}),e===`lie`&&(this.flop=0),this.pose=e}bounceHigher(){if(this.pose===`lie`)return this.setPose(`bounce`),0;if(this.pose!==`bounce`)this.setPose(`bounce`);else if(this.bounce.level>=qc.length-1)return this.setPose(`lie`),qc.length;else this.bounce.level++;return this.bounce.level}react(e){e===`wave`?this.waving=0:e===`hop`&&this.pose===`stand`&&!this.tweens.length?this.hopTo(this.root.position,.45,.25):this.settle=0}lookAt(e,t,n){this.look=(this.look??new V).set(e,t,n)}lookAway(){this.look=null}update(e,t){let n=Math.max(1,Math.ceil(e/(1/90)));for(let t=0;t<n;t++)this.step(e/n);this.sitK+=(+(this.pose===`sit`)-this.sitK)*(1-Math.exp(-e*14)),this.pose3d(t),this.life.update(e),this.wind.update(this.chibi,e,t);for(let[t,n]of this.entering){let r=Math.min(1,n+e/.5);r>=1?this.entering.delete(t):this.entering.set(t,r);for(let e of this.worn.get(t)??[]){let n=e.userData.base??e.position;e.position.copy(n),t===`floaties`?e.scale.setScalar(Math.max(.01,r<.6?r/.6*1.2:1.2-(r-.6)*.5)):t===`sunglasses`?e.position.y+=(1-r)*.12:(e.position.y+=(1-r)**2*.55,e.scale.set(1,1-.22*c(m(r,.65,1)),1))}}for(let[t,n]of this.popping){let r=Math.min(1,n+e/.45);r>=1?this.popping.delete(t):this.popping.set(t,r);let i=r<.6?r/.6*1.18:1.18-.18*m(r,.6,1);for(let e of this.closet.get(t)??[])e.scale.setScalar(Math.max(.01,i))}if(this.twirling>=0&&(this.twirling=Math.min(1,this.twirling+e/.75),this.twirling>=1&&(this.twirling=-1)),this.waving>=0){this.waving+=e/1.3;let t=Math.min(1,this.waving),n=m(t,0,.15)*(1-m(t,.8,1));this.chibi.armR.rotation.z=n*(2.5+Math.sin(t*Math.PI*6)*.35),t>=1&&(this.waving=-1)}}step(e){let t=this.root.position,n=this.tweens[0];if(n){n.t<0&&(n.from.copy(t),n.t=0,n.to.distanceToSquared(n.from)>1e-4&&(this.yawGoal=Math.atan2(n.to.x-n.from.x,n.to.z-n.from.z))),n.t+=e;let i=r(n.t/n.dur);t.lerpVectors(n.from,n.to,i),t.y+=c(i)*n.arc,i>=1&&(this.tweens.shift(),this.settle=0,n.done?.())}else if(this.path.length){let[n,i]=this.path[0],a=n-t.x,o=i-t.z,s=Math.hypot(a,o),c=s+this.pathLength(),l=1+r((c-4)/6,0,.6),u=Ht.walkSpeed*this.pace*l*r(c/.45,.35,1);this.speed=this.speed>u?u:Math.min(u,this.speed+Ht.walkSpeed*this.pace/.15*e);let d=this.speed*e;if(s<=Math.max(d,.02)){if(t.x=n,t.z=i,this.path.shift(),!this.path.length){this.speed=0,this.settle=0;let e=this.onArrive;this.onArrive=null,e?.()}}else t.x+=a/s*d,t.z+=o/s*d,this.yawGoal=Math.atan2(a,o)}else this.speed=0;let i=this.yawGoal-this.yaw;i=Math.atan2(Math.sin(i),Math.cos(i)),this.yawVel+=(220*i-28*this.yawVel)*e,this.yaw+=this.yawVel*e,this.speed>.01?this.phase+=Math.PI*Ht.stepsPerSecond*(this.speed/Ht.walkSpeed)*e:this.phase=0,this.settle=Math.min(1,this.settle+e/.35),this.flop=Math.min(1,this.flop+e/.5),this.pose===`bounce`&&(this.bounce.t+=e)}pathLength(){let e=0;for(let t=1;t<this.path.length;t++)e+=Math.hypot(this.path[t][0]-this.path[t-1][0],this.path[t][1]-this.path[t-1][1]);return e}pose3d(e){let{body:t,head:n}=this.chibi,i=this.twirling<0?0:this.twirling;this.root.rotation.y=this.yaw+i*i*(3-2*i)*Math.PI*2;let a=this.pose,o=0,s=1+Math.sin(e*2.4)*.015,c=0,l=0,u=this.speed/Ht.walkSpeed;if(u>.01){let e=Math.abs(Math.sin(this.phase));o=e*Ht.hop,s*=1+.06*(e-.5)*2*u,c=.14*u}let{legL:d,legR:f,tail:p}=this.chibi;if(d?(o-=Jc*this.sitK,p&&(p.rotation.x=.6*this.sitK)):a===`sit`&&(o-=.1,s*=.92),a===`wai`)c=.32,l=.15;else if(a===`peek`)c=.22,l=.2;else if(a===`lookup`)l=-.5;else if(a===`bounce`){let e=qc[r(this.bounce.level,0,qc.length-1)],t=.42+e*.55,n=this.bounce.t%t/t;o+=Math.sin(n*Math.PI)*e;let i=1-m(Math.min(n,1-n),0,.08);s*=1-.2*i+.08*Math.sin(n*Math.PI)}this.settle<1&&(s*=1+_(this.settle,2)*.12);let h=this.chibi.lie??{lift:this.chibi.radius,tilt:0};if(t.position.y=a===`lie`?h.lift*(1-.5*(1-this.flop)):o,t.rotation.x=a===`lie`?-(Math.PI/2-h.tilt)*Math.min(1,this.flop*1.2):c,t.rotation.z=0,t.scale.set(1/Math.sqrt(s),s,1/Math.sqrt(s)),d&&f){let e=Math.sin(this.phase)*.5*Math.min(1,u);d.rotation.x=Yc*this.sitK+e,f.rotation.x=Yc*this.sitK-e}let g=0;if(this.look&&a!==`lie`){let e=this.root.worldToLocal(this.look.clone());g=r(Math.atan2(e.x,e.z),-.9,.9)}this.headYaw+=(g-this.headYaw)*.15,n.rotation.set(l,this.headYaw,0)}},Zc=[{id:`agong`,name:`Agong`,thai:`อากง`,who:`Grandpa`,height:1.45,pitch:150,spot:{floor:0,x:2.025,z:-4.2,face:65,pose:`sit`,seat:.45}},{id:`jum`,name:`Jum`,who:`Aunt`,height:1.5,pitch:260,spot:{floor:0,x:1,z:-18.698,face:-30,pose:`stand`}},{id:`joy`,name:`Joy`,who:`Aunt, mom of Gan and Ken`,height:1.5,pitch:280,spot:{floor:0,x:.2,z:-7,face:-20,pose:`stand`}},{id:`bird`,name:`Bird`,who:`Uncle, dad of BB`,height:1.65,pitch:130,spot:{floor:0,x:-3.3,z:1,face:25,pose:`stand`}},{id:`nick`,name:`Daddy`,who:`Kaylee's dad (Nick)`,height:1.7,pitch:120,spot:{floor:0,x:2.9,z:1.15,face:-30,pose:`stand`}},{id:`ji`,name:`Mommy`,who:`Kaylee's mom (Ji)`,height:1.55,pitch:300,spot:{floor:1,x:.55,z:-18.898,face:-15,pose:`stand`}},{id:`bb`,name:`BB`,who:`Cousin, Bird's daughter`,height:1.2,pitch:380,spot:{floor:1,x:2.745,z:-13.4,face:-90,pose:`sit`,seat:.42}},{id:`gan`,name:`Gan`,who:`Cousin, Joy's son`,height:1.3,pitch:330,spot:{floor:1,x:-1.725,z:-19.3,face:90,pose:`lie`}},{id:`ken`,name:`Ken`,who:`Cousin, Joy's son`,height:1.25,pitch:350,spot:{floor:1,x:1.1,z:-6.3,face:-20,pose:`stand`}},{id:`ja`,name:`Ja`,who:`Aunt, mom of Putto and Putter`,height:1.5,pitch:270,spot:null},{id:`sri`,name:`Sri`,who:`Aunt`,height:1.5,pitch:290,spot:null},{id:`putto`,name:`Putto`,who:`Cousin, Ja's son (Kaylee's age)`,height:1,pitch:420,spot:null},{id:`putter`,name:`Putter`,who:`Cousin, Ja's son (a little penguin)`,height:.8,pitch:480,spot:null}],Qc=Math.PI/180,$c=new V,el=class{member;id;root;height;pose=`stand`;chibi;reaction=null;life;waving=-1;look=null;headYaw=0;phase=Math.random()*10;baseY;onPhone;phoneDown=-1;glance=1;phoneWaving=-1;wind=new vo;constructor(e,t,n=no[e.id],r=e.id){this.member=e,this.id=e.id,this.chibi=yo(n,t),this.root=this.chibi.root,this.height=this.chibi.height,this.life=new Co(this.chibi,r),this.onPhone=!!n.extras?.includes(`phone`),this.onPhone&&(this.chibi.armL.rotation.set(-1.2,0,.75),this.chibi.armR.rotation.set(-1.2,0,-.75));let i=e.spot;this.baseY=(i?.floor?3.6:0)+(i?.pose===`sit`?(i.seat??.45)-.1*this.height:i?.pose===`lie`?.2:0),i&&(this.root.position.set(i.x,this.baseY,i.z),this.root.rotation.y=i.face*Qc,this.setPose(i.pose)),this.root.userData.pick=`family:${e.id}`}get rig(){return this.chibi}place(e,t,n,r,i=`stand`){this.baseY=t,this.root.position.set(e,t,n),this.root.rotation.y=r*Qc,this.setPose(i)}setPose(e){this.pose=e;let{body:t}=this.chibi;t.rotation.set(e===`lie`?-Math.PI/2:0,0,0),t.position.set(0,e===`lie`?this.chibi.radius:0,0)}react(e){this.onPhone?this.glance=0:e===`wave`?this.waving=0:this.reaction={kind:e,t:0}}phoneWave(){this.onPhone?this.phoneWaving=0:this.waving=0}putPhoneDown(){this.onPhone&&(this.onPhone=!1,this.phoneDown=0,this.glance=1)}setWind(e){this.wind.goal=e}lookAt(e,t,n){this.look=(this.look??new V).set(e,t,n)}lookAway(){this.look=null}update(e,t){let{body:n,head:i,armR:a}=this.chibi,o=this.pose===`lie`;if(this.life.update(e),this.wind.update(this.chibi,e,t),this.phoneDown>=0){this.phoneDown=Math.min(1,this.phoneDown+e/.5);let t=this.phoneDown,n=1-(1-t)**3;this.chibi.armL.rotation.set(-1.2*(1-n),0,.75*(1-n)),a.rotation.set(-1.2*(1-n),0,-.75*(1-n)),i.rotation.x=.45*(1-n);let r=this.chibi.phone;r&&(r.scale.setScalar(Math.max(.001,1-n)),r.visible=t<1),t>=1&&(this.phoneDown=-1)}if(this.phoneWaving>=0){this.phoneWaving+=e/1.6;let t=Math.min(1,this.phoneWaving),n=m(t,0,.18)*(1-m(t,.82,1));a.rotation.set(-1.2*(1-n),0,-.75*(1-n)+n*(2.3+Math.sin(t*Math.PI*7)*.35)),t>=1&&(this.phoneWaving=-1)}if(this.waving>=0){this.waving+=e/1.5;let t=Math.min(1,this.waving),n=m(t,0,.15)*(1-m(t,.8,1));a.rotation.z=n*(2.5+Math.sin(t*Math.PI*7)*.35),t>=1&&(a.rotation.z=0,this.waving=-1)}let s=1+Math.sin(t*2.6+this.phase)*.018;n.scale.set(1/Math.sqrt(s),s,1/Math.sqrt(s));let l=0;this.glance=Math.min(1,this.glance+e/1.1);let u=this.onPhone?c(this.glance):1;this.look&&!o&&u>.05&&(this.root.worldToLocal($c.copy(this.look)),l=r(Math.atan2($c.x,$c.z),-1,1)),this.headYaw+=(l-this.headYaw)*(1-Math.exp(-e*6)),i.rotation.y=this.headYaw*u,this.onPhone&&(i.rotation.x=.45*(1-u)+Math.sin(t*1.3+this.phase)*.02);let d=0;if(this.reaction){let t=this.reaction;if(t.t+=e,t.kind===`hop`){let e=t.t/.55,r=c(m(e,0,.22)),i=m(e,.2,.85),a=c(m(e,.82,1));d=o?0:c(i)*.28*this.height;let s=1-.14*r-.1*a+.08*c(i);n.scale.y*=s,n.scale.x*=1/Math.sqrt(s),n.scale.z*=1/Math.sqrt(s),e>=1&&(this.reaction=null)}else{let e=t.t/.6;n.rotation.z=Math.sin(e*Math.PI*6)*.14*(1-e),e>=1&&(n.rotation.z=0,this.reaction=null)}}this.root.position.y=this.baseY+d}},tl=Math.PI/180,nl=class{camera=new St(Ht.fov,1,.3,300);w=1;h=1;top=0;goal=null;cur={center:new V,yaw:0,pitch:30,dist:20};fits=new Map;probe=new St;lag=.35;fov=null;over=null;quick=0;get lens(){return this.over?.fov??this.fov??Ht.fov}setSize(e,t,n){this.w=Math.max(1,e),this.h=Math.max(1,t),this.top=Math.max(0,Math.min(n,t*.4)),this.fits.clear();let r=this.camera;r.fov=this.lens,r.aspect=this.w/(this.h+this.top),r.setViewOffset(this.w,this.h+this.top,0,0,this.w,this.h),r.updateProjectionMatrix(),this.place()}setShot(e,t=!1){if(this.goal=e,t){let t=this.aim(e);this.cur.center.copy(t.center),this.cur.yaw=t.yaw,this.cur.pitch=t.pitch,this.cur.dist=t.dist,this.place()}}get shot(){return this.goal}setOverride(e,t=!1){let n=this.lens;this.over=e,this.lens!==n&&this.setSize(this.w,this.h,this.top),this.quick=.4,t&&this.goal&&this.setShot(this.goal,!0)}framed(){return this.goal?{...this.aim(this.goal),fov:this.lens}:null}refit(){this.fits.clear(),this.camera.fov!==this.lens&&this.setSize(this.w,this.h,this.top)}update(e){let t=this.goal;if(!t)return;let n=this.quick>0?Math.min(this.lag,.06):this.lag;this.quick=Math.max(0,this.quick-e);let r=1-Math.exp(-e/Math.max(.01,n)),i=this.aim(t);this.cur.center.lerp(i.center,r),this.cur.yaw+=(i.yaw-this.cur.yaw)*r,this.cur.pitch+=(i.pitch-this.cur.pitch)*r,this.cur.dist+=(i.dist-this.cur.dist)*r,this.place()}get yaw(){return this.cur.yaw}get moving(){let e=this.goal;if(!e)return!1;let t=this.aim(e);return this.cur.center.distanceToSquared(t.center)>1e-4||Math.abs(t.yaw-this.cur.yaw)>.05||Math.abs(t.dist-this.cur.dist)>.02}aim(e){let t=this.over;if(!t)return{center:e.center,yaw:e.yaw,pitch:e.pitch,dist:this.fit(e)};let n=t.mode===`lock`?t.yaw:e.yaw+t.yaw,r=Math.max(-20,Math.min(89,t.mode===`lock`?t.pitch:e.pitch+t.pitch)),i=this.fit({...e,yaw:n,pitch:r})*t.zoom,a=n*tl,o=e.center.clone();return o.x+=Math.cos(a)*t.px,o.z-=Math.sin(a)*t.px,o.y+=t.py,{center:o,yaw:n,pitch:r,dist:i}}place(){let{center:e,yaw:t,pitch:n,dist:r}=this.cur;this.camera.position.copy(e).add(rl(t,n,r)),this.camera.lookAt(e)}fit(e){let t=e.follow?0:e.yaw,n=`${e.half.x.toFixed(2)},${e.half.y.toFixed(2)},${e.half.z.toFixed(2)},${t.toFixed(2)},${e.pitch.toFixed(2)},${e.minDist},${e.maxDist}`,r=this.fits.get(n);if(r!==void 0)return r;let i=this.probe;i.fov=this.camera.fov,i.aspect=this.camera.aspect,i.updateProjectionMatrix();let a=(this.h-this.top)/(this.h+this.top)*.94,o=new V,s=n=>{i.position.copy(rl(t,e.pitch,n)),i.lookAt(0,0,0),i.updateMatrixWorld();for(let t of[-1,1])for(let n of[-1,1])for(let r of[-1,1])if(o.set(t*e.half.x,n*e.half.y,r*e.half.z).project(i),o.z>1||Math.abs(o.x)>.94||Math.abs(o.y)>a)return!1;return!0},c=e.minDist??2,l=e.maxDist??120;if(s(c))l=c;else for(let e=0;e<28;e++){let e=(c+l)/2;s(e)?l=e:c=e}return this.fits.set(n,l),l}};function rl(e,t,n){let r=e*tl,i=t*tl;return new V(Math.sin(r)*Math.cos(i),Math.sin(i),Math.cos(r)*Math.cos(i)).multiplyScalar(n)}var il=class{items=new Set;add(e){return this.items.add(e),e}dispose(){for(let e of this.items)e.dispose();this.items.clear()}},X={...C,boingAt:e=>{let t=220+e*90;w(t,t*2.6,.32,.16,`sine`),w(t*1.5,t*3.4,.22,.05,`triangle`,.03)},rattle:()=>{for(let e=0;e<9;e++)T(.06,.12,`bandpass`,1800+e*120,2400,e*.11,3);w(160,260,1,.05,`sawtooth`)},jiggle:()=>{for(let e=0;e<4;e++)T(.05,.1,`bandpass`,2600-e*150,3200,e*.09,4);w(220,180,.08,.06,`square`,.02)},ding:()=>{w(1318,1310,1.6,.07,`sine`),w(2637,2630,1.1,.025,`sine`,.01)},beep:()=>[0,.18].forEach(e=>w(880,860,.12,.08,`square`,e)),toot:()=>[0,.2].forEach(e=>w(392,370,.16,.1,`triangle`,e)),meow:()=>w(620,380,.45,.1,`triangle`),tick:()=>[0,.25,.5,.75].forEach((e,t)=>w(t%2?1700:2100,1600,.04,.08,`square`,e)),whir:()=>T(1.2,.07,`bandpass`,500,1400,0,1.2),puff:()=>T(.25,.1,`lowpass`,700,250),putt:()=>{for(let e=0;e<6;e++)w(95+e*4,90,.06,.05,`sawtooth`,e*.08);T(.6,.03,`lowpass`,600,300)},tukkae:()=>{T(.12,.05,`bandpass`,900,600);for(let e=0;e<3;e++){let t=.25+e*.55;w(260,200,.07,.09,`square`,t),w(420,560,.2,.08,`sawtooth`,t+.12)}},phone:()=>[0,.1,.17,.31].forEach((e,t)=>w(t===3?1560:2200,t===3?2080:2150,.035,.05,`sine`,e)),babble:e=>{let t=3+Math.floor(Math.random()*2);for(let n=0;n<t;n++){let r=e*(1+(Math.random()-.3)*.35);w(r,r*(n===t-1?1.35:.9),.11,.09,`triangle`,n*.13)}},latch:()=>{w(2600,1900,.035,.1,`square`),w(1400,1e3,.05,.07,`square`,.05)},whoosh:(e=.9)=>T(e,.08,`bandpass`,400,1800,0,.8),crunch:()=>[0,.16,.32].forEach(e=>T(.08,.1,`highpass`,2500,1800,e,1)),callDing:()=>{w(1568,1560,.5,.08,`sine`),w(1175,1170,.7,.06,`sine`,.18)},stamp:()=>{T(.08,.14,`lowpass`,900,300),w(140,70,.14,.12,`square`,.02)},haha:()=>[0,.17,.34].forEach((e,t)=>w(330-t*20,260-t*20,.12,.08,`triangle`,e)),woof:()=>[0,.22].forEach(e=>w(240,140,.12,.1,`sawtooth`,e)),jet:e=>{T(.35,.02+.07*e,`lowpass`,300+900*e,250+800*e),w(90+60*e,85+60*e,.3,.015+.02*e,`sawtooth`)},snort:()=>{T(.25,.12,`lowpass`,500,200),w(160,90,.2,.08,`sawtooth`,.05)},engine:e=>{w(70+70*e,60+50*e,.07,.025+.035*e,`sawtooth`),e>.55&&T(.06,.02*e,`bandpass`,900+600*e,700,0,2),e>.8&&w(190+90*e,170+80*e,.08,.02*e,`square`)},vroom:()=>{w(90,320,.6,.09,`sawtooth`),w(140,460,.5,.05,`square`,.05),T(.7,.06,`bandpass`,600,2400,0,1.5)},splash:(e=1)=>{T(.45*e,.12*e,`lowpass`,2400,300),w(220,90,.18,.05*e,`sine`)},paddle:()=>T(.18,.05,`bandpass`,1400,600,0,1.4),boink:()=>{w(700,1600,.12,.12,`triangle`),w(320,180,.2,.07,`square`,.02),T(.25,.05,`highpass`,3e3,1500,.05)},boop:()=>w(330,520,.18,.1,`sine`),shutter:()=>{T(.05,.15,`highpass`,4e3,2500),T(.08,.1,`bandpass`,1800,1200,.07,3)},horn:()=>[0,.45].forEach(e=>w(196,190,.38,.1,`sawtooth`,e)),giggle:()=>[0,.11,.22,.33].forEach((e,t)=>w(880+t*60,1180+t*40,.08,.07,`triangle`,e)),plink:()=>[0,.32,.64].forEach((e,t)=>w(1760,1320,.16,.1/(1+t*1.6),`sine`,e)),squeak:()=>[0,.09,.2,.27].forEach((e,t)=>w(3200+t%2*500,4200,.05,.035,`sine`,e)),chatter:()=>[0,.08,.16,.24,.36].forEach((e,t)=>w(900+t%3*180,650,.06,.06,`square`,e)),kick:()=>{T(.06,.16,`lowpass`,900,300),w(180,90,.08,.1,`sine`)},cheer:()=>{T(1.1,.05,`bandpass`,1600,2200,0,.7);for(let e=0;e<6;e++)w(520+Math.random()*260,760+Math.random()*300,.18,.035,`triangle`,e*.12)},whistle:()=>{w(2600,2700,.18,.06,`sine`),w(2600,2650,.5,.06,`sine`,.24)},scoop:()=>{T(.12,.06,`bandpass`,1500,900),w(520,780,.12,.07,`triangle`,.08)},flap:()=>[0,.12,.22].forEach(e=>T(.08,.06,`bandpass`,1100,1800,e,1.5)),blow:()=>T(.4,.09,`bandpass`,1300,700,0,.9),chime:()=>[0,.08,.16].forEach((e,t)=>w(1318*[1,1.25,1.5][t],1320*[1,1.25,1.5][t],.25,.05,`sine`,e)),countdown:()=>[0,.32,.64].forEach((e,t)=>w(t===2?1400:980,t===2?1400:980,.09,.06,`sine`,e)),creak:()=>[0,.18].forEach(e=>w(240,170,.22,.05,`sawtooth`,e)),flop:()=>[0,.14].forEach(e=>T(.05,.08,`bandpass`,2e3,1200,e,2)),mrrp:()=>{w(420,560,.12,.07,`triangle`),w(560,400,.3,.08,`triangle`,.1)},swish:()=>[0,.25].forEach(e=>T(.18,.08,`highpass`,1800,3600,e,.8)),peep:()=>[0,.1,.2].forEach(e=>w(3400,3e3,.05,.05,`sine`,e)),plop:()=>w(520,160,.12,.08,`sine`),light:e=>w(e?1320:660,e?1320:660,e?.55:.22,.09,`square`),roll:()=>w(1400+Math.random()*600,1300,.03,.04,`square`),item:()=>[1,1.26,1.5].forEach((e,t)=>w(880*e,900*e,.14,.06,`triangle`,t*.07)),slip:()=>{w(1400,300,.6,.07,`sine`),T(.3,.05,`bandpass`,900,400)},splat:()=>{T(.18,.12,`lowpass`,1200,300),w(300,120,.15,.07,`sine`)},trick:()=>[0,1,2,3].forEach(e=>w(600+e*200,900+e*240,.1,.05,`triangle`,e*.06)),zoom:()=>{T(.5,.08,`bandpass`,500,2600,0,1.2),w(220,660,.4,.05,`sawtooth`)},trumpet:()=>{w(330,620,.22,.07,`sawtooth`),w(620,560,.4,.07,`sawtooth`,.2),w(660,600,.4,.04,`square`,.22),T(.3,.03,`bandpass`,1200,1800,.15)},squeal:()=>{w(620,1050,.16,.06,`sawtooth`),w(1050,920,.26,.05,`square`,.14)},sniff:()=>[0,.11,.2].forEach(e=>T(.08,.06,`bandpass`,2600,1500,e,2.2)),rumble:()=>{w(62,48,.7,.14,`sawtooth`),w(93,70,.6,.06,`triangle`,.05)},slurp:()=>[0,.16,.3].forEach(e=>T(.12,.07,`bandpass`,700,1500,e,3)),hiccup:()=>w(700,1250,.09,.08,`square`),burp:()=>{w(120,58,.55,.16,`sawtooth`),T(.45,.07,`lowpass`,500,160,.03)},dolphin:()=>[0,.1,.19,.3].forEach((e,t)=>w(t%2?2600:1700,t%2?1500:2900,.09,.045,`sine`,e)),lap:()=>[0,.18].forEach(e=>w(1568,1568,.3,.07,`sine`,e)),bang:()=>{T(.35,.1,`lowpass`,1600,200);for(let e=0;e<5;e++)w(2400+Math.random()*1200,1800,.08,.02,`sine`,.1+e*.05)},thoomp:()=>{T(.25,.14,`lowpass`,500,120),w(110,55,.25,.12,`sine`)},jangle:()=>[0,.07,.15,.24].forEach((e,t)=>w(1200+t%2*340,1150,.18,.05,`square`,e))},al=[[100.12,20.32],[100.14,20.25],[100.32,20.39],[100.52,20.18],[100.4,19.76],[100.51,19.55],[100.74,19.51],[100.97,19.61],[101.21,19.55],[101.29,18.98],[101.05,18.44],[101.14,18.14],[100.91,17.58],[100.96,17.54],[101.17,17.5],[101.69,17.89],[101.77,18.03],[102.1,18.21],[102.55,17.97],[102.66,17.82],[103.05,18.03],[103.29,18.41],[103.95,18.32],[104.82,17.3],[104.74,16.88],[104.82,16.47],[105.05,16.16],[105.41,15.99],[105.4,15.83],[105.64,15.66],[105.49,15.26],[105.55,14.93],[105.48,14.53],[105.07,14.23],[104.97,14.37],[104.78,14.43],[103.98,14.36],[103.6,14.42],[103.2,14.33],[102.91,14.14],[102.55,13.59],[102.32,13.54],[102.5,12.67],[102.76,12.43],[102.74,12.09],[102.93,11.71],[102.59,12.2],[102.54,12.11],[102.26,12.39],[102.23,12.33],[101.84,12.64],[100.9,12.65],[100.96,13.43],[100.6,13.57],[100.02,13.35],[99.99,13.24],[100.09,13.05],[99.96,12.69],[99.99,12.17],[99.63,11.46],[99.49,10.89],[99.17,10.32],[99.16,9.73],[99.29,9.41],[99.25,9.27],[99.39,9.21],[99.84,9.29],[99.99,8.59],[100.15,8.44],[100.28,8.27],[100.55,7.23],[100.44,7.28],[100.38,7.54],[100.28,7.55],[100.32,7.72],[100.26,7.77],[100.16,7.73],[100.16,7.6],[100.42,7.19],[100.59,7.18],[101.02,6.86],[101.5,6.87],[101.8,6.47],[102.1,6.24],[101.87,5.83],[101.68,5.78],[101.56,5.91],[101.26,5.79],[101.11,5.64],[100.98,5.77],[101.08,5.96],[101.05,6.24],[100.87,6.25],[100.75,6.46],[100.35,6.55],[100.26,6.68],[100.18,6.67],[100.12,6.44],[99.7,6.88],[99.72,7.11],[99.55,7.22],[99.6,7.36],[99.36,7.37],[99.26,7.62],[99.08,7.72],[99.05,7.89],[98.79,8.06],[98.7,8.26],[98.58,8.34],[98.36,8.19],[98.24,8.42],[98.24,8.77],[98.75,10.35],[98.76,10.66],[99.19,11.11],[99.61,11.78],[99.41,12.55],[99.22,12.74],[99.12,13.03],[99.14,13.72],[98.93,14.05],[98.57,14.36],[98.2,14.98],[98.19,15.2],[98.56,15.37],[98.59,16.05],[98.82,16.18],[98.89,16.35],[98.84,16.42],[98.66,16.33],[98.44,16.98],[97.71,17.8],[97.74,17.94],[97.63,18.29],[97.45,18.36],[97.37,18.52],[97.75,18.59],[97.71,18.93],[97.8,19.13],[97.82,19.46],[98.02,19.75],[98.37,19.69],[98.92,19.77],[99.07,20.1],[99.34,20.08],[99.49,20.15],[99.46,20.36],[99.72,20.33],[99.89,20.42]],ol=[[98.41,7.9],[98.3,7.78],[98.3,8.14],[98.43,8.09]],sl={bangkok:[100.5,13.75],krabi:[98.99,8.1],nan:[100.78,18.81],phangNga:[98.52,8.22],north:[[98.9,18.8],[99.8,19.4],[100.6,18.6],[98.6,17.2],[101.1,17.9]]},cl={ear:[[101.9,17.4],[103.4,17.75],[104.45,16.9],[104.85,15.6],[104.2,14.75],[102.9,14.6],[102.05,15.4],[101.8,16.5]],eye:[99.7,17.55]},ll={west:97,east:106,south:5.3,north:20.8},ul=.974;function dl([e,t]){return[(e-(ll.west+ll.east)/2)*ul,t-(ll.south+ll.north)/2]}var fl={w:(ll.east-ll.west)*ul,h:ll.north-ll.south};function pl(e,t,n=.9){let r=Math.min(e*n/fl.w,t*n/fl.h);return n=>{let[i,a]=dl(n);return[e/2+i*r,t/2-a*r]}}function ml(e,t,n,r=0){e.beginPath(),n.forEach((n,i)=>{let[a,o]=t(n),s=r?Math.sin(i*12.9898)*r:0;i===0?e.moveTo(a+s,o-s):e.lineTo(a+s,o-s)}),e.closePath()}function hl(e,t,n,r,i=sl.bangkok,a=sl.krabi){let o=e.width,s=e.height,c=e.getContext(`2d`);if(c.fillStyle=`#1F2A55`,c.fillRect(0,0,o,s),n===`cartoon`){c.fillStyle=`#8FE3C8`,c.fillRect(0,s*.72,o,s*.28);let e=o*(.15+.7*((Math.sin(r*1.3)+1)/2)),t=s*.62-Math.abs(Math.sin(r*4))*s*.4;c.fillStyle=`#FF8FB8`,c.beginPath(),c.arc(e,t,s*.1,0,Math.PI*2),c.fill(),c.fillStyle=`#FBEA9A`,c.beginPath(),c.arc(o*.82,s*.2,s*.12,0,Math.PI*2),c.fill();return}let l=pl(o,s,.92);c.fillStyle=`#2E4A8C`,c.fillRect(o*.04,s*.04,o*.92,s*.92),c.fillStyle=`#8FE3C8`,ml(c,l,al),c.fill(),ml(c,l,ol),c.fill(),c.strokeStyle=`#FFFFFF`,c.lineWidth=Math.max(2,o*.008),ml(c,l,al),c.stroke();let[u,d]=l(i),[f,p]=l(a);c.save(),c.setLineDash([o*.02,o*.018]),c.strokeStyle=`#FBEA9A`,c.lineWidth=Math.max(2,o*.012),c.beginPath(),c.moveTo(u,d),c.lineTo(f,p),c.stroke(),c.restore();for(let[e,t]of[[u,d],[f,p]])c.fillStyle=`#FF4F9A`,c.beginPath(),c.arc(e,t,o*.022,0,Math.PI*2),c.fill();let m=u+(f-u)*t,h=d+(p-d)*t;c.save(),c.translate(m,h),c.rotate(Math.atan2(p-d,f-u)),c.fillStyle=`#FFFFFF`;let g=o*.05;c.beginPath(),c.moveTo(g,0),c.lineTo(-g*.7,-g*.25),c.lineTo(-g*.7,g*.25),c.closePath(),c.fill(),c.fillRect(-g*.2,-g*.8,g*.35,g*1.6),c.restore()}function gl(e,t,n,r){let i=e.width,a=e.height,o=e.getContext(`2d`);o.fillStyle=`#10183A`,o.fillRect(0,0,i,a),o.save(),o.strokeStyle=`#7FE9FF`,o.shadowColor=`#7FE9FF`,o.shadowBlur=i*.02,o.lineWidth=Math.max(2,i*.008),o.lineJoin=o.lineCap=`round`,o.globalAlpha=.5,vl(o,i*.06,a*.1,i*.88,a*.8,i*.04),o.stroke(),o.globalAlpha=1;let s=t.length>8?5:4,c=Math.max(1,Math.ceil(t.length/s)),l=i*.8/s,u=a*.7/Math.max(2,c);t.slice(0,n).forEach((e,t)=>{let n=i*.1+l*(t%s+.5),c=a*.15+u*(Math.floor(t/s)+.5);o.save(),o.translate(n,c);let d=Math.min(l,u)*.36;_l(o,e,d,r),o.restore()}),o.restore()}function _l(e,t,n,r){let i=(t,n,r)=>{e.beginPath(),e.arc(t,n,r,0,Math.PI*2),e.stroke()},a=t=>{e.beginPath(),t.forEach(([t,r],i)=>i?e.lineTo(t*n,r*n):e.moveTo(t*n,r*n)),e.closePath(),e.stroke()};switch(t){case`sunhat`:e.beginPath(),e.ellipse(0,n*.3,n,n*.3,0,0,Math.PI*2),e.stroke(),e.beginPath(),e.arc(0,n*.2,n*.5,Math.PI,0),e.stroke();break;case`sunglasses`:for(let t of[-.45,.45])e.beginPath(),e.moveTo(t*n,n*.35),e.bezierCurveTo((t-.5)*n,-n*.05,(t-.3)*n,-n*.45,t*n,-n*.18),e.bezierCurveTo((t+.3)*n,-n*.45,(t+.5)*n,-n*.05,t*n,n*.35),e.stroke();e.beginPath(),e.moveTo(-n*.15,-n*.15),e.lineTo(n*.15,-n*.15),e.stroke();break;case`sunscreen`:vl(e,-n*.3,-n*.5,n*.6,n*1.3,n*.15),e.stroke(),e.strokeRect(-n*.15,-n*.8,n*.3,n*.3);break;case`floaties`:i(-n*.45,0,n*.42),i(-n*.45,0,n*.18),i(n*.45,0,n*.42),i(n*.45,0,n*.18);break;case`swimsuit`:a([[-.5,-.9],[-.25,-.9],[0,-.4],[.25,-.9],[.5,-.9],[.45,.1],[.6,.8],[0,.5],[-.6,.8],[-.45,.1]]);break;case`duck`:i(0,n*.25,n*.55),i(n*.4,-n*.4,n*.32),a([[.7,-.45],[1,-.35],[.7,-.25]]);break;case`teddy`:i(0,-n*.35,n*.4),i(-n*.35,-n*.72,n*.16),i(n*.35,-n*.72,n*.16),i(0,n*.45,n*.48);break;case`bucket`:a([[-.6,-.4],[.6,-.4],[.45,.8],[-.45,.8]]),e.beginPath(),e.arc(0,-n*.4,n*.6,Math.PI,0),e.stroke();break;case`camera`:vl(e,-n*.8,-n*.45,n*1.6,n*1,n*.15),e.stroke(),i(0,n*.05,n*.32),e.strokeRect(-n*.6,-n*.65,n*.4,n*.2);break;case`pillow`:vl(e,-n*.9,-n*.45,n*1.8,n*.9,n*.35),e.stroke();break;case`fan`:i(0,-n*.15,n*.6),i(0,-n*.15,n*.1);for(let t=0;t<3;t++){let i=r*9+t*Math.PI*2/3;e.beginPath(),e.ellipse(Math.cos(i)*n*.3,-n*.15+Math.sin(i)*n*.3,n*.26,n*.12,i,0,Math.PI*2),e.stroke()}e.beginPath(),e.moveTo(0,n*.45),e.lineTo(0,n*.85),e.moveTo(-n*.4,n*.88),e.lineTo(n*.4,n*.88),e.stroke();break;case`mango`:e.beginPath(),e.ellipse(0,n*.1,n*.75,n*.5,-.4,0,Math.PI*2),e.stroke(),e.beginPath(),e.ellipse(n*.3,-n*.55,n*.3,n*.12,-.6,0,Math.PI*2),e.stroke();break;case`gan`:{a([[-.75,-.2],[-.55,-.95],[-.15,-.5],[.15,-.5],[.55,-.95],[.75,-.2],[.5,.45],[0,.65],[-.5,.45]]);for(let t of[-.3,.3])e.beginPath(),e.arc(t*n,-n*.05,n*.14,.1*Math.PI,.9*Math.PI),e.stroke();e.font=`bold ${Math.round(n*.6)}px Fredoka, sans-serif`,e.fillStyle=`#7FE9FF`;let t=r*.8%1;e.globalAlpha=1-t,e.fillText(`z`,n*.7,-n*(.6+t*.8)),e.globalAlpha=1;break}default:i(0,0,n*.6)}}function vl(e,t,n,r,i,a){e.beginPath(),e.moveTo(t+a,n),e.arcTo(t+r,n,t+r,n+i,a),e.arcTo(t+r,n+i,t,n+i,a),e.arcTo(t,n+i,t,n,a),e.arcTo(t,n,t+r,n,a),e.closePath()}var yl=Math.PI*2,bl=`#FFFFFF`,xl=`#FF9DB8`,Sl=`#3A3350`;function Cl(e,t){let n=new j,r=[],i=[],a=(...e)=>r.push(...e),o=(...e)=>i.push(...e);switch(e){case`sunhat`:{let e=G.butter;a(K.sphere(.27,e,{at:[0,.022,0],scale:[1,.075,1]},28),K.torus(.258,.017,e,{at:[0,.024,0],rot:[Math.PI/2,0,0]}),K.sphere(.14,e,{at:[0,.055,0],scale:[1,.86,1]},22),K.cyl(.143,.143,.045,G.hotpink,{at:[0,.085,0]},22),...[-1,1].map(e=>K.sphere(.042,G.hotpink,{at:[e*.05,.09,.14],rot:[0,0,e*.5],scale:[1.35,.8,.45]})),K.sphere(.022,G.hotpink,{at:[0,.088,.152]}),...[-1,1].map(e=>K.capsule(.014,.05,G.hotpink,{at:[e*.03,.04,.16],rot:[.3,0,e*.45]})));for(let e=0;e<6;e++){let t=e/6*yl;a(K.sphere(.024,`#FFFFFF`,{at:[.135,.1+Math.sin(t)*.03,.035+Math.cos(t)*.03],scale:[.35,1,1]},10))}a(K.sphere(.017,G.gold,{at:[.145,.1,.035]},10)),o(...[.11,.14].map(e=>K.torus(Math.sqrt(Math.max(0,.14**2-((e-.055)/.86)**2))+.002,.004,`#E8D27A`,{at:[0,e,0],rot:[Math.PI/2,0,0]})));break}case`sunglasses`:{let e=(e,t,n,r)=>[...[-1,1].map(i=>K.sphere(.045*t,n,{at:[e+i*.03*t,.1,r],scale:[1,1,.3]},14)),K.cone(.068*t,.075*t,n,{at:[e,.1-.042*t,r],rot:[Math.PI,0,0],scale:[1,1,.3]},14)],t=[K.capsule(.013,.04,G.hotpink,{at:[0,.12,.004],rot:[0,0,Math.PI/2]})],n=[];for(let r of[-1,1])t.push(...e(r*.095,1.25,G.hotpink,0),...e(r*.095,.86,`#4A3F6B`,.008)),t.push(K.sphere(.018,G.hotpink,{at:[r*.168,.115,-.008]},8),K.box(.17,.016,.016,G.hotpink,{at:[r*.085,r>0?.112:.094,-.026]})),n.push(K.sphere(.018,bl,{at:[r*.095-.022,.112,.024],scale:[1,.7,.4]},8),K.sphere(.007,bl,{at:[r*.095+.012,.07,.022]},6));for(let e of[...t,...n])e.rotateX(-1.35).translate(0,.014,.05);a(...t),o(...n);break}case`sunscreen`:a(K.rbox(.13,.22,.08,.038,`#FF9F45`,{at:[0,.11,0]}),K.cyl(.042,.052,.035,`#FF9F45`,{at:[0,.235,0]},14),K.cyl(.05,.05,.05,G.hotpink,{at:[0,.272,0]},16),K.sphere(.05,G.hotpink,{at:[0,.296,0],scale:[1,.35,1]},14),K.box(.03,.012,.02,G.hotpink,{at:[0,.3,.045]}),K.rbox(.108,.13,.008,.004,G.cream,{at:[0,.11,.04]})),o(K.cyl(.026,.026,.006,G.gold,{at:[0,.132,.046],rot:[Math.PI/2,0,0]},16));for(let e=0;e<8;e++){let t=e/8*yl;o(K.box(.007,.016,.004,G.gold,{at:[Math.cos(t)*.038,.132+Math.sin(t)*.038,.046],rot:[0,0,t-Math.PI/2]}))}o(...[-.03,0,.03].map(e=>K.sphere(.017,G.sky,{at:[e,.072,.045],scale:[1,.55,.25]},10))),o(...[-1,1].map(e=>K.sphere(.004,G.ink,{at:[e*.009,.136,.05]},6)),K.torus(.009,.0025,G.ink,{at:[0,.128,.05],rot:[0,0,Math.PI]},Math.PI));break;case`floaties`:{let e=(e,t,n)=>{a(K.torus(.085,.05,n,{at:[e,.05,t],rot:[Math.PI/2,0,0]},Math.PI),K.torus(.085,.05,`#FFFFFF`,{at:[e,.05,t],rot:[Math.PI/2,0,Math.PI]},Math.PI),K.cyl(.016,.02,.04,n,{at:[e+.058,.1,t+.058]},10)),o(K.sphere(.02,bl,{at:[e-.05,.095,t+.05],scale:[1.4,.35,.8]},8))};e(-.1,0,`#FF7FA8`),e(.12,.04,`#FF9F45`);break}case`swimsuit`:{let e=`#FF6FAE`,t=`#FFB3D1`;a(K.rbox(.2,.034,.2,.016,e,{at:[0,.017,-.02]}),K.rbox(.14,.034,.08,.016,e,{at:[0,.017,.11]}),...[-1,1].map(t=>K.rbox(.035,.026,.12,.012,e,{at:[t*.065,.018,-.16]})),...Array.from({length:7},(e,n)=>K.sphere(.03,t,{at:[-.105+n*.035,.03,.075],scale:[1,.45,.8]},10)),...Array.from({length:5},(e,n)=>K.sphere(.02,t,{at:[-.07+n*.035,.033,-.115],scale:[1,.45,.8]},8))),o(...[[-.06,-.06],[.03,-.07],[-.02,0],[.065,.02],[-.07,.04],[.01,.12]].map(([e,t])=>K.sphere(.013,`#FFFFFF`,{at:[e,.035,t],scale:[1,.3,1]},8)));break}case`duck`:{let e=`#FFD84D`;a(K.sphere(.12,e,{at:[0,.1,0],scale:[1.25,.8,1]},20),K.cone(.065,.13,e,{at:[-.15,.15,0],rot:[0,0,.95]},12),K.sphere(.085,e,{at:[.09,.235,0]},18),K.sphere(.05,`#FF9F45`,{at:[.18,.215,0],scale:[1.3,.42,.95]},12),...[-1,1].map(e=>K.sphere(.065,`#FFC93D`,{at:[-.02,.13,e*.11],rot:[0,0,-.3],scale:[1.35,.7,.35]},12)),...[-1,1].map(e=>K.sphere(.017,G.ink,{at:[.145,.265,e*.045]},8))),o(...[-1,1].map(e=>K.sphere(.006,bl,{at:[.157,.272,e*.05]},6)),...[-1,1].map(e=>K.sphere(.02,xl,{at:[.135,.225,e*.07],scale:[1,.6,.4]},8)));break}case`teddy`:{let e=`#C99A6E`,t=`#F2D3B3`;a(K.sphere(.12,e,{at:[0,.12,0],scale:[1,1.05,.95]},18),...[-1,1].map(t=>K.sphere(.052,e,{at:[t*.07,.045,.07],scale:[1,.8,1.3]},12)),...[-1,1].map(t=>K.capsule(.036,.06,e,{at:[t*.11,.15,.03],rot:[.3,0,t*.7]})),K.sphere(.1,e,{at:[0,.3,0]},18),...[-1,1].map(t=>K.sphere(.042,e,{at:[t*.075,.385,0]},12)),K.sphere(.043,t,{at:[0,.278,.083],scale:[1.2,.85,.7]},12),K.sphere(.015,G.ink,{at:[0,.297,.112],scale:[1.3,.9,.8]},8),...[-1,1].map(e=>K.sphere(.014,G.ink,{at:[e*.036,.325,.088]},8)),...[-1,1].map(e=>K.sphere(.03,G.hotpink,{at:[e*.035,.212,.095],rot:[0,0,e*.4],scale:[1.3,.8,.5]},10)),K.sphere(.016,G.hotpink,{at:[0,.212,.105]},8)),o(K.sphere(.065,t,{at:[0,.11,.087],scale:[1,1.1,.4]},12),...[-1,1].map(e=>K.sphere(.022,`#FFB3C7`,{at:[e*.075,.388,.028],scale:[1,1,.4]},8)),...[-1,1].map(e=>K.sphere(.028,t,{at:[e*.07,.04,.135],scale:[1,1,.3]},8)),...[-1,1].map(e=>K.sphere(.005,bl,{at:[e*.036+.005,.331,.1]},6)),...[-1,1].map(e=>K.sphere(.018,xl,{at:[e*.062,.29,.075],scale:[1,.6,.4]},8)));break}case`bucket`:a(K.cyl(.13,.1,.2,G.sky,{at:[0,.1,0]},20),K.torus(.13,.016,`#7FC4F0`,{at:[0,.2,0],rot:[Math.PI/2,0,0]}),K.torus(.12,.012,G.hotpink,{at:[0,.2,0]},Math.PI),...[-1,1].map(e=>K.sphere(.02,G.hotpink,{at:[e*.12,.2,0]},8)),K.cyl(.014,.014,.25,G.gold,{at:[.2,.19,.04],rot:[0,0,.35]},8),K.cyl(.018,.018,.07,G.gold,{at:[.155,.31,.04],rot:[0,0,.35+Math.PI/2]},8),K.rbox(.08,.1,.016,.02,G.hotpink,{at:[.25,.04,.04],rot:[0,0,.35]})),o(K.sphere(.112,`#F2D9A6`,{at:[0,.2,0],scale:[1,.12,1]},18));for(let e=0;e<5;e++){let t=e/5*yl;o(K.cone(.02,.04,G.gold,{at:[Math.sin(t)*.017,.105+Math.cos(t)*.017,.118],rot:[-.15,0,-t],scale:[1,1,.25]},6))}break;case`camera`:a(K.rbox(.26,.16,.12,.035,`#6B5BA8`,{at:[0,.08,0]}),K.box(.264,.035,.124,G.butter,{at:[0,.045,0]}),K.rbox(.1,.05,.08,.018,`#6B5BA8`,{at:[-.01,.17,-.005]}),K.cyl(.062,.066,.08,Sl,{at:[0,.08,.095],rot:[Math.PI/2,0,0]},20),K.torus(.06,.012,G.gold,{at:[0,.08,.135]}),K.torus(.066,.008,G.gold,{at:[0,.08,.1]}),K.cyl(.046,.046,.01,`#A8DCFF`,{at:[0,.08,.134],rot:[Math.PI/2,0,0]},18),K.rbox(.055,.032,.02,.008,G.cream,{at:[-.085,.13,.062]}),K.cyl(.02,.02,.02,G.hotpink,{at:[.085,.168,0]},12),...[-1,1].map(e=>K.torus(.02,.006,G.ink,{at:[e*.132,.14,0],rot:[0,Math.PI/2,0]}))),o(K.sphere(.014,bl,{at:[-.018,.098,.141],scale:[1,.8,.3]},8),K.sphere(.006,bl,{at:[.015,.065,.141]},6),K.sphere(.01,bl,{at:[-.095,.135,.073],scale:[1.4,.8,.3]},6));break;case`pillow`:{a(K.sphere(.22,G.cream,{at:[0,.07,0],scale:[1,.32,.68]},24));for(let e of[-1,1])for(let t of[-1,1])a(K.cone(.055,.07,G.cream,{at:[e*.175,.07,t*.1],rot:[0,-e*t*.6,-e*Math.PI/2],scale:[1,1,.55]},10));let e=(e,t)=>.07+.0704*Math.sqrt(Math.max(0,1-(e/.22)**2-(t/.15)**2));for(let[t,n]of[[-.12,-.05],[-.04,.05],[.05,-.04],[.13,.04],[-.13,.06],[.04,.08]]){let r=e(t,n);o(...[-1,1].map(e=>K.sphere(.014,G.hotpink,{at:[t+e*.011,r,n-.005],scale:[1,.35,1]},8)),K.cone(.021,.024,G.hotpink,{at:[t,r,n+.012],rot:[Math.PI/2,0,0],scale:[1,.35,1]},8))}break}case`fan`:{a(K.cyl(.11,.13,.05,G.lavenderDark,{at:[0,.025,0]},20),K.cyl(.02,.02,.2,G.lavenderDark,{at:[0,.15,-.01]},10),K.sphere(.055,G.lavenderDark,{at:[0,.3,-.045],scale:[1,1,1.15]},14),K.cyl(.024,.024,.02,G.hotpink,{at:[.06,.055,.06]},10),K.torus(.125,.013,G.lavender,{at:[0,.3,.022]}),K.torus(.115,.01,G.lavender,{at:[0,.3,-.018]})),o(...[0,1,2,3].map(e=>K.box(.24,.006,.006,G.lavender,{at:[0,.3,.026],rot:[0,0,e*Math.PI/4]})),K.sphere(.022,G.lavender,{at:[0,.3,.028],scale:[1,1,.4]},10));let e=new j;e.position.set(0,.3,.004),e.add(qa([0,1,2].map(e=>K.sphere(.1,G.mint,{at:[Math.cos(e*yl/3)*.055,Math.sin(e*yl/3)*.055,0],rot:[0,0,e*yl/3],scale:[.95,.45,.1]},12)).concat(K.sphere(.025,G.hotpink,{},10)),[],t,1.5)),e.name=`blades`,n.add(e);break}case`mango`:a(K.sphere(.11,`#FFB83D`,{at:[0,.09,0],rot:[0,0,.3],scale:[1.3,.85,.9]},20),K.sphere(.07,`#FFB83D`,{at:[.075,.075,.005],scale:[1,.95,1.05]},14),K.cyl(.012,.015,.05,`#7A5A3A`,{at:[-.1,.16,0],rot:[0,0,.55]},6),K.sphere(.06,`#7FCB8F`,{at:[-.135,.18,.035],rot:[.35,.6,.3],scale:[1.6,.22,.65]},12)),o(K.sphere(.085,`#FF8466`,{at:[.05,.115,.035],rot:[0,0,.3],scale:[1,.72,.68]},14),K.sphere(.022,bl,{at:[-.03,.155,.06],scale:[1.4,.5,.6]},8));break;case`raincoat`:{let e=G.hotpink;a(K.rbox(.3,.06,.26,.03,e,{at:[0,.03,0]}),K.sphere(.09,e,{at:[0,.05,-.15],scale:[1.2,.45,.8]},16),...[-1,1].map(t=>K.capsule(.03,.17,e,{at:[t*.04,.075,.03],rot:[0,t*.5,Math.PI/2]})),K.rbox(.09,.012,.07,.01,`#FF8FB8`,{at:[.08,.065,.08]})),o(...[-.06,.03,.11].map(e=>K.cyl(.018,.018,.012,G.butter,{at:[-.1,.066,e]},10)),K.sphere(.03,bl,{at:[-.05,.062,-.08],scale:[1.6,.2,.6]},8));break}case`boots`:for(let e of[-1,1])a(K.cyl(.05,.055,.2,G.lavender,{at:[e*.07,.12,-.02]},14),K.sphere(.06,G.lavender,{at:[e*.07,.045,.04],scale:[.95,.75,1.4]},14),K.rbox(.12,.025,.2,.01,G.hotpink,{at:[e*.07,.0125,.015]}),K.torus(.02,.006,G.hotpink,{at:[e*.07,.225,-.07],rot:[0,Math.PI/2,0]})),o(K.sphere(.012,bl,{at:[e*.07,.14,.04],scale:[1,1,.3]},8));break;case`umbrella`:a(K.cone(.05,.36,G.mint,{at:[.03,.05,0],rot:[0,0,-Math.PI/2],scale:[1,1,.9]},14),K.cyl(.006,.006,.08,G.ink,{at:[.25,.05,0],rot:[0,0,Math.PI/2]},6),K.cyl(.012,.012,.14,G.butter,{at:[-.21,.05,0],rot:[0,0,Math.PI/2]},8),K.torus(.04,.013,G.butter,{at:[-.28,.09,0]},Math.PI),K.cyl(.04,.04,.025,G.hotpink,{at:[0,.05,0],rot:[0,0,Math.PI/2]},12)),o(K.sphere(.013,G.hotpink,{at:[0,.092,0]},8));break;case`snacks`:a(K.sphere(.1,G.mint,{at:[0,.11,0],scale:[1,1.1,.75]},18),K.cyl(.028,.05,.04,G.mint,{at:[0,.225,0]},12),K.sphere(.06,G.mint,{at:[0,.262,0],scale:[1.35,.55,.8]},12),...[-1,1].map(e=>K.sphere(.028,G.hotpink,{at:[e*.035,.225,.04],rot:[0,0,e*.4],scale:[1.3,.8,.5]},10)),K.sphere(.015,G.hotpink,{at:[0,.225,.048]},8),K.rbox(.11,.055,.08,.015,G.cream,{at:[.15,.028,.04]}),K.rbox(.116,.02,.086,.008,`#7FCB8F`,{at:[.15,.064,.04]})),o(K.sphere(.035,`#FFB83D`,{at:[0,.11,.072],scale:[1.3,.85,.35]},10),K.sphere(.012,`#7FCB8F`,{at:[-.035,.135,.07],scale:[1.4,.5,.4]},6),...[-.04,.04].map(e=>K.box(.008,.06,.003,`#B8F0DD`,{at:[e*1.4,.12,.074]})));break;default:a(K.rbox(.2,.2,.2,.05,G.lavender,{at:[0,.1,0]}))}return n.add(qa(r,i,t,2)),n}function wl(e,t,n,r=[0,0,0]){let i=[],[a,o,s]=t,c=[1,1,.12];if(e===`heart`)i.push(...[-1,1].map(e=>K.sphere(n*.55,`#FFFFFF`,{at:[a+e*n*.36,o+n*.2,s],scale:c},12)),K.cone(n*.85,n*.95,`#FFFFFF`,{at:[a,o-n*.3,s],rot:[Math.PI,0,0],scale:c},12)),i.push(...[-1,1].map(e=>K.sphere(n*.4,G.pink,{at:[a+e*n*.36,o+n*.2,s+.004],scale:c},12)),K.cone(n*.62,n*.72,G.pink,{at:[a,o-n*.24,s+.004],rot:[Math.PI,0,0],scale:c},12));else if(e===`star`){i.push(K.cyl(n*.42,n*.42,.01,G.gold,{at:[a,o,s],rot:[Math.PI/2,0,0]},10));for(let e=0;e<5;e++){let t=e/5*yl;i.push(K.cone(n*.3,n*.6,G.gold,{at:[a+Math.sin(t)*n*.55,o+Math.cos(t)*n*.55,s],rot:[0,0,-t],scale:c},6))}}else i.push(K.cyl(n,n,.01,G.sky,{at:[a,o,s],rot:[Math.PI/2,0,0]},16),K.cyl(n*.45,n*.45,.01,G.butter,{at:[a,o+n*.1,s+.004],rot:[Math.PI/2,0,0]},14)),i.push(...[-1,1].map(e=>K.sphere(n*.3,`#FFFFFF`,{at:[a+e*n*.35,o-n*.45,s+.006],scale:[1.4,.7,.12]},8)));if(r[0]||r[1]||r[2])for(let e of i)e.translate(-a,-o,-s).rotateX(r[0]).rotateY(r[1]).rotateZ(r[2]).translate(a,o,s);return i}function Tl(e){let t=.92,n=.3,r=.62,i=new j,a=new j;i.add(a);let o=(e,n)=>[-1,1].flatMap(i=>[-1,1].map(a=>K.sphere(.055,G.gold,{at:[i*(t/2-.035),e,a*(r/2-.035)],scale:[1,n,1]},10)));a.add(qa([K.rbox(t,n,r,.07,G.hotpink,{at:[0,n/2,0]}),K.box(.8400000000000001,.02,.54,`#FFD3E6`,{at:[0,.295,0]}),K.box(.926,.02,.626,`#E0337F`,{at:[0,.27,0]}),K.rbox(.05,.035,.03,.01,G.gold,{at:[t*.18,.27,.322]}),...[-1,1].map(e=>K.box(.06,n*.9,.64,G.gold,{at:[e*t*.3,n*.47,0]})),...[-1,1].map(e=>K.rbox(.08,.07,.03,.012,`#E8A92A`,{at:[e*t*.3,n*.42,.322]})),...o(.04,.8),...[-1,1].flatMap(e=>[-1,1].map(n=>K.sphere(.038,G.ink,{at:[e*(t/2-.08),.012,n*(r/2-.08)],scale:[.6,1,1]},10))),K.rbox(.03,.05,.2,.012,G.ink,{at:[.47200000000000003,n*.55,0]})],[...wl(`heart`,[-.14,.2,.314],.06),...wl(`star`,[.13,.1,.314],.05),...wl(`sun`,[-.375,.13,.314],.04)],e,2));let s=new j;return s.position.set(0,n,-.62/2),s.add(qa([K.rbox(t,.1,r,.05,G.hotpink,{at:[0,.05,r/2]}),K.box(.8,.012,.5,`#FFD3E6`,{at:[0,-.002,r/2]}),...[-.15,.15].map(e=>K.box(.05,.008,.45999999999999996,G.lavender,{at:[e,-.01,r/2]})),...[-1,1].map(e=>K.box(.06,.104,.636,G.gold,{at:[e*t*.3,.05,r/2]})),K.sphere(.035,G.gold,{at:[0,.05,.625]}),...[-1,1].flatMap(e=>[-1,1].map(n=>K.sphere(.05,G.gold,{at:[e*(t/2-.035),.065,r/2+n*(r/2-.035)],scale:[1,.7,1]},10))),...[-1,1].map(e=>K.rbox(.05,.03,.06,.012,G.gold,{at:[e*.1,.105,r/2]})),K.torus(.1,.024,G.ink,{at:[0,.1,r/2]},Math.PI),K.capsule(.028,.08,G.lavender,{at:[0,.198,r/2],rot:[0,0,Math.PI/2]})],wl(`heart`,[.14,.101,r*.62],.075,[-Math.PI/2,0,0]),e,2)),a.add(s),{root:i,body:a,lid:s,slot:(e,t)=>{let n=Math.floor(e/6),r=e%6,i=t>6?.92:1;return[(-.27+r%3*.27)*i,.27999999999999997+n*.13,(r<3?-.13:.14)*i]},w:t,h:n,d:r}}var El=`#6E3FC4`,Dl=`#E8409A`,Ol=`#FFC23D`,kl=`#FFC83D`,Al=`#FF9F2E`,jl=`#FBF8FF`,Ml=`#ECE8F5`,Nl=`#2E2A4A`,Pl=1.35,Fl=2.2,Il=-6.8,Ll=14,Rl=2.6,zl=3.8;function Bl(e){return e=Math.max(0,Math.min(Ll,e)),e<Rl?Pl*(1-(1-e/Rl)**2.2)**.5:e>10.2?Pl*(1-.8*((e-10.2)/zl)**1.3):Pl}function Vl(e){let t=Bl(e);return e<Rl?-(Pl-t)*.3:e>10.2?(Pl-t)*.85:0}function Hl(e,{wheelsUp:t=!1}={}){let n=new j;n.add(Ul(e));let r=[...[-1,1].flatMap(e=>{let t=[[-1.3,0],[1.8,0],[3.5,5.6],[2.7,5.6]],n=-e*.07;return[K.prism(t.map(([t,n])=>[t,e*n]),.22,Ml,{at:[0,1.25,0],rot:[Math.PI/2+n,0,0]}),K.prism([[0,0],[.9,0],[1.25,1.2],[.85,1.2]],.12,El,{at:[2.7,1.3+.392,e*5.55]}),K.prism([[.7,.9],[1.25,1.2],[.85,1.2]],.14,Ol,{at:[2.7,1.3+.392,e*5.55]})]}),...[-1,1].flatMap(e=>{let t=e*2.5;return[K.cyl(.62,.5,2.1,jl,{at:[.3,.75,t],rot:[0,0,Math.PI/2]},20),K.torus(.56,.09,`#C9C3D8`,{at:[-.75,.75,t],rot:[0,Math.PI/2,0]}),K.cyl(.5,.5,.05,Nl,{at:[-.72,.75,t],rot:[0,0,Math.PI/2]},20),K.cone(.16,.3,`#C9C3D8`,{at:[-.8,.75,t],rot:[0,0,Math.PI/2]}),K.cone(.32,.5,`#C9C3D8`,{at:[1.6,.75,t],rot:[0,0,-Math.PI/2]}),K.box(1,.5,.16,Ml,{at:[1,1.3,t]})]}),K.prism([[3.4,0],[6.9,0],[7.4,3],[6,3]],.26,jl,{at:[0,3.3000000000000003,0]}),...[-1,1].flatMap(e=>{let t=(t,n,r)=>[t,n,e*(.13+r)];return[K.cyl(.78,.78,.04,`#FFFFFF`,{at:t(6,5,.02),rot:[Math.PI/2,0,0]},28),K.torus(.76,.05,El,{at:t(6,5,.04)},Math.PI*2),K.prism([[-.55,.15],[.45,.42],[.35,-.05],[-.05,-.55]],.04,kl,{at:t(6,5,.06)}),K.prism([[-.05,-.55],[.35,-.05],[.12,-.08]],.04,`#E8403F`,{at:t(6,5,.08)}),K.sphere(.07,Nl,{at:t(6.2,5.28,.08),scale:[1,1,.4]})]}),...[-1,1].map(e=>K.prism([[5.2,0],[6.6,0],[7.4,2.5],[6.8,2.5]].map(([t,n])=>[t,e*n]),.16,Ml,{at:[0,2.95,0],rot:[Math.PI/2,0,0]})),...t?[]:[[-5,0,.55],[1.6,1.2,.95],[1.6,-1.2,.95]].flatMap(([e,t,n])=>[K.cyl(.08,.08,n,`#D8D2E6`,{at:[e,.42+n/2,t]}),...[-.2,.2].flatMap(n=>[K.torus(.3,.14,G.ink,{at:[e,.42,t+n]}),K.cyl(.16,.16,.2,`#D8D2E6`,{at:[e,.42,t+n],rot:[Math.PI/2,0,0]})])])];n.add(J(q(r),e,2));let i=[-3.5,2.15,1.37],a=new j;a.position.set(i[0]-.5,i[1],i[2]),a.add(J(q([K.rbox(1,1.7,.08,.12,El,{at:[.5,0,0]}),K.cyl(.18,.18,.04,`#A8DCFF`,{at:[.5,.35,.04],rot:[Math.PI/2,0,0]}),K.box(.12,.05,.05,G.cream,{at:[.85,-.1,.05]})]),e,2)),a.userData.pick=`plane-door`,n.add(a);let o=[],s=[];for(let e=0;e<7;e++){let t=.2+(e+1)*((i[1]-.95-.2)/7),n=i[2]+3.2-(e+1)*(2.9/7);o.push([i[0],t,n]),s.push(K.box(1.2,.1,.42,G.cream,{at:[i[0],t-.05,n]}))}s.push(K.box(1.4,.25,3.6,`#FFC83D`,{at:[i[0],.3,i[2]+1.9]}),...[-1,1].map(e=>K.box(.06,.06,3.3,G.hotpink,{at:[i[0]+e*.62,1.6,i[2]+1.6],rot:[-.62,0,0]})),...[[-.5,.6],[.5,.6],[-.5,3.4],[.5,3.4]].map(([e,t])=>K.torus(.16,.07,G.ink,{at:[i[0]+e,.16,i[2]+t],rot:[0,Math.PI/2,0]})));let c=J(q(s),e,2);return n.add(c),{root:n,door:a,stairs:c,doorAt:i,steps:o}}function Ul(e){let t=[];for(let e=0;e<=90;e++){let n=e/90,r=Ll*(n<.25?.25*(n/.25)**1.6:n>.75?1-.25*((1-n)/.25)**1.6:n);t.push(new et(e===0?0:Bl(r),r))}t.push(new et(0,Ll));let n=new Oe(t,56,-Math.PI/2),r=n.attributes.position,i=n.attributes.uv;for(let e=0;e<r.count;e++){let t=r.getX(e),n=r.getY(e),a=r.getZ(e),o=i.getX(e);r.setXYZ(e,Il+n,Fl-t+Vl(n),a),i.setXY(e,n/Ll,o)}n.computeVertexNormals();let a=e.add(Kl()),o=e.add(new tn({map:a,gradientMap:ja()})),s=new j;s.add(new B(e.add(n),o));let c=Ua(n,2);return e.add(c.geometry),s.add(c),s}var Wl=2048,Gl=1024;function Kl(){let e=document.createElement(`canvas`);e.width=Wl,e.height=Gl/2;let t=e.getContext(`2d`),n=(e,t)=>{let n=Math.max(-1,Math.min(1,t/Math.max(Bl(e),.05)));return[e/Ll*Wl,(1-Math.acos(-n)/Math.PI)*(Gl/2)]},r=(e,r)=>{t.beginPath(),e.forEach(([e,r],i)=>{let[a,o]=n(e,r);i===0?t.moveTo(a,o):t.lineTo(a,o)}),t.closePath(),t.fillStyle=r,t.fill()},i=(e,t=16)=>{let n=[];return e.forEach((r,i)=>{let a=e[(i+1)%e.length];for(let e=0;e<t;e++)n.push([r[0]+(a[0]-r[0])*e/t,r[1]+(a[1]-r[1])*e/t])}),n},a=(e,t,n,r=24)=>Array.from({length:r+1},(i,a)=>{let o=a/r,s=1-o;return[s*s*e[0]+2*s*o*t[0]+o*o*n[0],s*s*e[1]+2*s*o*t[1]+o*o*n[1]]}),o=(e,t,n,i,a)=>r(Array.from({length:40},(r,a)=>[e+Math.cos(a/40*Math.PI*2)*n,t+Math.sin(a/40*Math.PI*2)*i]),a);t.fillStyle=jl,t.fillRect(0,0,Wl,Gl/2);let s=e=>a([5.6+e,-2],[6.6+e,.1],[9+e,2]),c=(e,t,n)=>r([...s(e),...s(t).reverse()],n);r([[-1,2],[-1,-2],...s(0)],El),c(0,.5,Dl),c(.5,1,Ol),c(1,1.15,El);let l=(e,t,n,i,o)=>r([...a([e,t],[e+n*.45,t+i*1.4],[e+n,t+i*1.6]),...a([e+n,t+i*1.6],[e+n*.5,t-i*.2],[e+n*.1,t-i])],o);l(9.8,-1.2,3.2,.32,El),l(10.6,-1,2.8,.26,Dl),l(11.4,-.85,2.3,.2,Ol),r([[-1,2],...a([.85,2],[1.05,.4],[1.75,-.32]),...a([1.75,-.32],[1.2,-.9],[1,-2]),[-1,-2]],kl),r([[-1,-.32],...a([0,-.38],[.9,-.28],[1.75,-.32]),...a([1.75,-.32],[1.2,-.9],[1,-2]),[-1,-2]],Al),r([...a([.05,-.32],[.9,-.22],[1.78,-.3]),...a([1.78,-.36],[.9,-.32],[.05,-.4])],Nl),o(1.72,-.24,.12,.12,Dl),r(i([[1.2,.55],[2.1,.62],[2.05,.92],[1.35,.85]],6),Nl),r(i([[1.62,.6],[1.68,.6],[1.62,.9],[1.56,.9]],4),El),o(2.15,.08,.36,.4,`#FFFFFF`),o(2.08,.04,.22,.26,Nl),o(2,.14,.07,.08,`#FFFFFF`),r(i([[2.82,-.85],[3.78,-.85],[3.78,.82],[2.82,.82]],8),`#3B3352`);for(let e=0;e<16;e++){let t=4.3+e*.62;if(t>10.2+.6)break;o(t,.42,.17,.21,Nl),o(t,.42,.12,.15,`#A8DCFF`)}let u=document.createElement(`canvas`);u.width=Wl,u.height=Gl;let d=u.getContext(`2d`);d.drawImage(e,0,0),d.save(),d.translate(0,Gl),d.scale(1,-1),d.drawImage(e,0,0),d.restore();let f=new dt(u);return f.colorSpace=k,f.anisotropy=4,f}var ql=7,Jl=new V,Yl=new V,Xl=class{renderer;events;scene=new ye;rig=new nl;bag=new il;lights=Fa(this.scene);w=1;h=1;time=0;lastTouch=0;stats={fps:0,p95:0,calls:0,tris:0};anchorEls=new Map;hintEl=null;raycaster=new P;hopper=new $l(this.scene);touches=0;disposed=!1;constructor(e,t){this.renderer=e,this.events=t,this.scene.background=new z(G.sky),Ma()}hintAt(){return null}pickRoots(){return[]}get calm(){return!1}makeFamily(e){let t=new Xc(this.bag),n=new Map;for(let t of e){let e=Zc.find(e=>e.id===t);e&&n.set(t,new el({...e,spot:null},this.bag))}return{kaylee:t,members:n}}put(e,t,n,r,i,a=0){Ql(e,t,n,r,i,a)}hop(e,t,n,r={}){this.hopper.hop(e,t,n,r)}get hopping(){return this.hopper.busy}setSize(e,t,n){this.w=e,this.h=t,this.rig.setSize(e,t,n),La(e,t),this.rig.setShot(this.shot(),!0)}setAnchorElements(e){this.anchorEls=e}setHintElement(e){this.hintEl=e}update(e){this.time+=e,this.hopper.update(e),this.step(e,this.time),this.rig.setShot(this.shot()),this.rig.update(e)}render(){let e=this.renderer;e.render(this.scene,this.rig.camera),this.stats.calls=e.info.render.calls,this.stats.tris=e.info.render.triangles}pointerDown(){this.lastTouch=this.time}pointerMove(e,t,n,r,i){}pointerUp(){}tap(e,t,n){this.lastTouch=this.time,this.touches++,this.onTap(n??this.pick(e,t),e,t)}pick(e,t){this.raycaster.setFromCamera(this.ndc(e,t),this.rig.camera);for(let e of this.raycaster.intersectObjects(this.pickRoots(),!0)){let t=e.object;for(;t&&t.userData.pick===void 0;)t=t.parent;if(t&&Zl(t))return t.userData.pick}return null}ndc(e,t){return new et(e/this.w*2-1,-(t/this.h)*2+1)}placeAnchors(){let e=this.rig.camera;Yl.set(1,0,0).applyQuaternion(e.quaternion);for(let[e,t]of this.anchorEls){let n=this.anchorAt(e),r=n?this.toScreen(n.at,n.r,n.max):null;if(r){t.style.transform=`translate3d(${(r.x-r.size/2).toFixed(1)}px, ${(r.y-r.size/2).toFixed(1)}px, 0)`,t.style.width=t.style.height=`${r.size.toFixed(0)}px`,t.style.zIndex=String(r.z+(n?.prio??(e.startsWith(`family:`)?0:2))*3e3);let i=n?.glow?`0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)`:``;t.style.boxShadow!==i&&(t.style.boxShadow=i)}let i=r?``:`none`;t.style.display!==i&&(t.style.display=i)}let t=this.hintEl;if(t){let e=this.time-this.lastTouch>ql?this.hintAt():null,n=e?this.toScreen(e,.3):null;t.style.display=n?``:`none`,n&&(t.style.transform=`translate3d(${n.x.toFixed(1)}px, ${n.y.toFixed(1)}px, 0)`)}}toScreen(e,t,n=150){let i=this.rig.camera,a=e.clone().project(i);if(a.z>1||Math.abs(a.x)>1.02||Math.abs(a.y)>1.02)return null;let o=e.clone().addScaledVector(Yl,t).project(i);return{x:(a.x+1)/2*this.w,y:(1-a.y)/2*this.h,size:r(Math.abs(o.x-a.x)*this.w,64,n),z:Math.round((1-a.z)*1e4)}}memory(){return{...this.renderer.info.memory}}dispose(){this.disposed=!0,this.scene.clear(),this.bag.dispose()}};function Zl(e){for(let t=e;t;t=t.parent)if(!t.visible)return!1;return!0}function Ql(e,t,n,r,i,a=0){e instanceof Xc?(e.place(t,n,r,a),e.setPose(i)):e.place(t,i===`sit`?n-.1*e.height:n,r,a,i)}var $l=class{scene;hops=[];constructor(e){this.scene=e}hop(e,t,n,r={}){this.hops=this.hops.filter(t=>t.c!==e),this.hops.push({c:e,parent:t,to:n.clone(),o:r,t:0,delay:r.delay??0})}get busy(){return this.hops.length>0}has(e){return this.hops.some(t=>t.c===e)}update(e){for(let t of[...this.hops]){if(t.delay>0){t.delay-=e;continue}if(!t.from){this.scene.updateMatrixWorld();let e=t.c.root;t.parent.attach(e),e.rotation.set(0,e.rotation.y,0),e.scale.set(1,1,1),t.from=e.position.clone(),t.c instanceof el&&t.c.pose===`sit`&&(t.from.y+=.1*t.c.height),X.boing()}t.t+=e/(t.o.dur??.42);let n=Math.min(1,t.t);Jl.lerpVectors(t.from,t.to,n),Jl.y+=c(n)*(t.o.arc??.6),Ql(t.c,Jl.x,Jl.y,Jl.z,n<1?`stand`:t.o.pose??`stand`,t.o.face??0),n>=1&&(this.hops.splice(this.hops.indexOf(t),1),t.c.react(`wiggle`),X.thump(),t.o.done?.())}}},eu=[{id:`suitcase`,label:`Suitcase`,kind:`thing`},{id:`screen`,label:`X-ray screen`,kind:`thing`},{id:`officer`,label:`Officer`,kind:`thing`},{id:`belt`,label:`Belt`,kind:`thing`},{id:`plane-door`,label:`Plane door`,kind:`thing`},{id:`plane`,label:`Plane`,kind:`thing`},{id:`pass`,label:`Boarding pass`,kind:`thing`},{id:`flag`,label:`Thai flag`,kind:`thing`},{id:`family:ji`,label:`Mommy`,kind:`family`},{id:`family:nick`,label:`Daddy`,kind:`family`},{id:`family:kaylee`,label:`Kaylee`,kind:`family`}],tu={species:`elephant`,height:1.6,fur:`#C2BCE0`,light:`#E8E4F6`,dark:`#A39CCB`,ear:`#FFB8CC`,outfit:{kind:`shirt`,color:`#4A5A9C`},extras:[`officer-cap`]},Z={x0:-3.4,x1:2.1,y:.62,z:0},nu={x0:-.9,x1:.7},ru=3.6,iu=new V(11.5,0,-2.6),au={kaylee:[-3,1.15],ji:[-4.3,.45],nick:[-4,1.65],suitcase:[-2.45,.9]},ou=new V,su=class extends Xl{packed;suitcase;plane;officer;officerLife;officerHop=1;pass;stampMark;stamp;flag;flagWave=1;hinted=new Set;screen;riders;dashes=new j;doorsL;doorsR;phase=`belt`;phaseT=0;slide=0;shown=0;laughed=!1;stamped=!1;doorK=0;planeBounce=1;drag=null;constructor(e,t,n){super(e,t),this.packed=n;let{scene:r,bag:i}=this;r.background=new z(`#BFE6FF`),this.rig.fov=34,r.add(J(q([K.box(10.5,.1,14,`#F4EEFF`,{at:[-1.6,-.05,3.5]}),...Array.from({length:10},(e,t)=>K.box(.03,.005,13.9,`#E2DAF6`,{at:[-6.6+t*1.05,.002,3.5]}))]),i,0),J(q([K.box(10.5,3.4,.2,`#FFF7F0`,{at:[-1.6,1.7,-3.45]}),K.box(10.5,.3,.22,G.lavender,{at:[-1.6,3.2,-3.44]}),K.rbox(2.2,.6,.08,.06,G.sky,{at:[-3.6,2.5,-3.34]}),K.rbox(2.2,.6,.08,.06,G.mint,{at:[.8,2.5,-3.34]})]),i,2),J(q([K.rbox(2.6,1.2,.1,.06,`#2E3566`,{at:[-1.4,2.35,-3.3]}),...[0,1,2,3].flatMap(e=>[K.box(1.6,.14,.02,[`#8FE3C8`,`#FBEA9A`,`#FFB3D1`,`#A8DCFF`][e],{at:[-1.2,2.72-e*.24,-3.24]}),K.box(.2,.05,.02,`#FFFFFF`,{at:[-2.35,2.72-e*.24,-3.23]}),K.box(.06,.16,.02,`#FFFFFF`,{at:[-2.37,2.72-e*.24,-3.225]})]),K.cyl(.32,.32,.06,G.cream,{at:[.7,2.45,-3.32],rot:[Math.PI/2,0,0]},24),K.torus(.32,.03,G.hotpink,{at:[.7,2.45,-3.3]}),K.box(.03,.2,.02,G.ink,{at:[.7,2.53,-3.27]}),K.box(.14,.03,.02,G.ink,{at:[.76,2.45,-3.27]}),...Array.from({length:14},(e,t)=>K.box(.18,.18,.04,G.gold,{at:[-6.6+t*.75,3.02,-3.32],rot:[0,0,Math.PI/4]})),...[-5.6,-5,-4.4,-3.8].flatMap(e=>[K.rbox(.5,.12,.5,.05,G.lavenderDark,{at:[e,.45,-2.9]}),K.rbox(.5,.5,.1,.05,G.lavenderDark,{at:[e,.75,-3.12]}),K.box(.05,.4,.4,`#D8D2E6`,{at:[e-.27,.2,-2.9]})]),...[-6.4,2.6].flatMap(e=>[K.cyl(.24,.18,.6,`#C9B5F7`,{at:[e,.3,-2.95]}),K.cyl(.02,.02,.7,`#7FCB8F`,{at:[e,.95,-2.95]}),...[0,1,2,3,4].map(t=>K.sphere(.09,t%2?G.hotpink:`#FF9CC8`,{at:[e+Math.sin(t*1.3)*.14,1+t*.12,-2.95+Math.cos(t*1.3)*.1],scale:[1,.7,.5]})),...[-1,1].map(t=>K.sphere(.16,`#7FCB8F`,{at:[e+t*.14,.66,-2.95],scale:[1,.3,.55],rot:[0,0,t*.4]}))])]),i,2),J(q([K.box(30,.1,22,`#C9C4DE`,{at:[18.6,-.06,1]}),...Array.from({length:6},(e,t)=>K.box(1.6,.01,.16,G.butter,{at:[5.6+t*3,.002,2.4]}))]),i,0)),r.add(J(q([K.box(Z.x1-Z.x0,Z.y-.06,.95,`#B9B2CC`,{at:[(Z.x0+Z.x1)/2,(Z.y-.06)/2,Z.z]}),K.box(Z.x1-Z.x0,.06,.8,`#4A4458`,{at:[(Z.x0+Z.x1)/2,Z.y-.03,Z.z]}),K.rbox(nu.x1-nu.x0,1.1,1.25,.1,G.lavenderDark,{at:[(nu.x0+nu.x1)/2,Z.y+.55,Z.z],scale:[1,1,1]}),...[nu.x0-.01,nu.x1+.01].flatMap(e=>Array.from({length:5},(t,n)=>K.box(.02,.62,.15,`#5A6FB0`,{at:[e,Z.y+.32,-.36+n*.18]}))),K.rbox(.8,.86,.5,.05,`#D9D2EE`,{at:[1.35,.43,-.45]}),K.box(.84,.05,.54,G.lavenderDark,{at:[1.35,.88,-.45]}),K.cyl(.06,.08,1.4,`#D8D2E6`,{at:[-.1,.7,-1.25]}),K.cyl(.35,.4,.08,`#D8D2E6`,{at:[-.1,.04,-1.25]}),K.rbox(1.42,.98,.1,.05,G.ink,{at:[-.1,1.85,-1.27]})]),i,2));for(let e=Z.x0;e<Z.x1;e+=.3)this.dashes.add(new B(i.add(K.box(.06,.005,.76,`#7E7894`,{at:[e,Z.y+.003,Z.z]})),i.add(new gt({color:`#7E7894`}))));r.add(this.dashes);let a=document.createElement(`canvas`);a.width=384,a.height=256;let s=i.add(new dt(a));s.colorSpace=k;let c=new B(i.add(new Ce(1.3,.86)),i.add(new gt({map:s})));c.position.set(-.1,1.85,-1.21),c.userData.pick=`screen`,r.add(c),this.screen={canvas:a,tex:s,mesh:c,wiggle:1},gl(a,this.packed,0,0),s.needsUpdate=!0;let l=i.add(new gt({color:`#CFEFFF`,transparent:!0,opacity:.3,depthWrite:!1}));r.add(J(q([K.box(.12,3.4,.12,`#D8D2E6`,{at:[ru,1.7,-3.4]}),K.box(.12,.12,6.4,`#D8D2E6`,{at:[ru,3.35,-.2]}),...[-1.4,2.2].map(e=>K.box(.12,3.4,.12,`#D8D2E6`,{at:[ru,1.7,e]}))]),i,1.5)),r.add(new B(i.add(K.box(.03,3.2,1.9,`#FFFFFF`,{at:[ru,1.6,-2.4]})),l));let u=e=>{let t=new j;return t.position.set(ru,0,e),t.add(new B(i.add(K.box(.04,2.6,1.75,`#FFFFFF`,{at:[0,1.3,0]})),l)),t.add(J(q([K.box(.06,2.6,.06,`#D8D2E6`,{at:[0,1.3,e<.4?-.88:.88]}),K.box(.06,.06,1.75,`#D8D2E6`,{at:[0,2.6,0]})]),i,1.5)),r.add(t),t};this.doorsL=u(-.45),this.doorsR=u(1.3),this.plane=Hl(i),this.plane.root.position.copy(iu),this.plane.root.userData.pick=`plane`,r.add(this.plane.root),this.officer=yo(tu,i),this.officer.root.position.set(1.35,0,-1.2),this.officer.root.rotation.y=-.35,this.officer.root.userData.pick=`officer`,r.add(this.officer.root),this.officerLife=new Co(this.officer,`officer`),this.stamp=J(q([K.cyl(.035,.03,.14,`#C99A6E`,{at:[0,.08,0]}),K.sphere(.05,`#C99A6E`,{at:[0,.16,0]}),K.rbox(.14,.05,.1,.015,G.hotpink,{at:[0,0,0]})]),i,1.5),this.stamp.position.set(.02,-.26,.06),this.stamp.rotation.x=Math.PI,this.officer.armR.add(this.stamp),this.pass=new j,this.pass.position.set(1.32,.915,-.4),this.pass.rotation.y=-.2,this.pass.add(J(q([K.box(.42,.012,.2,`#FFFFFF`),K.box(.42,.014,.05,G.hotpink,{at:[0,.001,-.075]}),...[0,1,2].map(e=>K.box(.1,.014,.012,`#C9C1E6`,{at:[-.12+e*.12,.001,0]}))]),i,1.5)),this.pass.userData.pick=`pass`,this.stampMark=J(q([K.cyl(.06,.06,.016,G.hotpink,{},18),K.cyl(.04,.04,.018,`#FFFFFF`,{},18),K.sphere(.022,G.hotpink,{scale:[1,.4,1]})]),i,0),this.stampMark.position.set(.1,.002,.03),this.stampMark.visible=!1,this.pass.add(this.stampMark),r.add(this.pass),this.flag=new j,this.flag.position.set(3,0,-2.9),this.flag.add(J(q([K.cyl(.03,.04,2.9,`#D8D2E6`,{at:[0,1.45,0]}),K.sphere(.06,G.gold,{at:[0,2.93,0]}),K.cyl(.18,.22,.1,`#D8D2E6`,{at:[0,.05,0]})]),i,1.5));let d=new j;d.position.set(.03,2.75,0),d.add(J(q([[`#E8434F`,.06],[`#FFFFFF`,.06],[`#2D4A9C`,.12],[`#FFFFFF`,.06],[`#E8434F`,.06]].map(([e,t],n,r)=>{let i=r.slice(0,n).reduce((e,[,t])=>e+t,0);return K.box(.54,t,.02,e,{at:[.27,-i-t/2,0]})})),i,1.5)),d.name=`cloth`,this.flag.add(d),this.flag.userData.pick=`flag`,r.add(this.flag),this.suitcase=Tl(i),this.suitcase.root.position.set(au.suitcase[0],0,au.suitcase[1]),this.suitcase.root.rotation.y=-Math.PI/2,this.suitcase.root.scale.setScalar(.8),this.suitcase.root.userData.pick=`suitcase`,r.add(this.suitcase.root);let{kaylee:f,members:p}=this.makeFamily([`ji`,`nick`]);f.wear(o(this.packed)),f.glassesUp(!0),this.riders={kaylee:f,ji:p.get(`ji`),nick:p.get(`nick`)};for(let e of[`kaylee`,`ji`,`nick`]){let t=this.riders[e];r.add(t.root);let[n,i]=au[e];this.put(t,n,0,i,`stand`,35)}setTimeout(()=>this.phase===`belt`&&this.events.say(h.trip.airport.start),500)}pickRoots(){return[this.suitcase.root,this.screen.mesh,this.officer.root,this.pass,this.flag,this.plane.root,...Object.values(this.riders).map(e=>e.root)]}pointerDown(e,t){super.pointerDown(),this.phase===`belt`&&e!==void 0&&t!==void 0&&this.pick(e,t)===`suitcase`&&(this.drag={x:e,y:t,on:!1})}pointerMove(e,t,n,i,a){let o=this.drag;if(!a||!o||this.phase!==`belt`||(!o.on&&Math.hypot(e-o.x,t-o.y)>12&&(o.on=!0),!o.on))return;let s=this.floorAt(e,t,.35);s&&this.suitcase.root.position.set(r(s.x,-5,2),.35,r(s.z,-1.2,2))}pointerUp(){let e=this.drag;if(this.drag=null,!e?.on)return;let t=this.suitcase.root.position;Math.abs(t.z-Z.z)<1.3&&t.x<nu.x0?this.onBelt():this.suitcase.root.position.set(au.suitcase[0],0,au.suitcase[1])}floorAt(e,t,n){let r=this.rig.camera,i=this.ndc(e,t),a=new V(i.x,i.y,-1).unproject(r),o=new V(i.x,i.y,1).unproject(r).sub(a);if(Math.abs(o.y)<1e-6)return null;let s=(n-a.y)/o.y;return s>0?a.addScaledVector(o,s):null}onTap(e){switch(e){case`suitcase`:this.phase===`belt`?this.onBelt():(X.boing(),this.suitcase.body.scale.y=.85);return;case`belt`:X.pop(),this.slide+=.05;return;case`screen`:this.screen.wiggle=0,X.boop();return;case`officer`:this.officerHop=0,X.haha();return;case`pass`:this.officerHop=0,X.stamp(),this.stampMark.visible=!0,this.pass.position.y=.95;return;case`flag`:this.flagWave=0,X.fwip();return;case`plane-door`:this.phase===`doors`?this.board():this.bouncePlane();return;case`plane`:this.phase===`doors`?this.board():this.bouncePlane();return;case`family:ji`:case`family:nick`:case`family:kaylee`:this.riders[e.slice(7)].react(`hop`),X.boing();return}}bouncePlane(){this.planeBounce=0,X.boop()}onBelt(){if(this.phase!==`belt`)return;this.phase=`scan`,this.phaseT=0;let e=this.suitcase.root;e.position.set(Z.x0+.5,Z.y,Z.z),e.rotation.y=0,X.thump(),X.whir(),this.riders.kaylee.react(`hop`)}board(){this.phase=`board`,this.phaseT=0;let e=this.riders.kaylee;e.glassesUp(!1),e.setWind(.8);let t=this.plane.steps.map(e=>this.plane.root.localToWorld(new V(...e))),n=t[0].clone().setY(0).add(new V(0,0,.7)),r=t[t.length-1];[`kaylee`,`ji`,`nick`].forEach((e,i)=>{let a=this.riders[e],o=this.plane.root.localToWorld(new V(...this.plane.doorAt)).setY(r.y+.1),s=t[Math.floor(t.length/2)];this.hop(a,this.scene,n.clone().add(new V(0,0,i*.5)),{delay:i*.45,dur:.6,arc:.5,face:180,done:()=>this.hop(a,this.scene,s,{dur:.45,arc:.4,face:180,done:()=>this.hop(a,this.scene,r,{dur:.45,arc:.4,face:180,done:()=>this.hop(a,this.scene,o.clone().add(new V(0,0,-.6)),{dur:.4,arc:.3,face:180,done:()=>{a.root.visible=!1,e===`nick`&&(this.phase=`gone`,setTimeout(()=>this.events.done(`takeoff`),600))}})})})})})}step(e,t){this.phaseT+=e;let n=this.suitcase.root,i=this.phase;(i===`scan`||i===`out`)&&(this.slide+=e*.6);for(let e of this.dashes.children)e.position.x=(this.slide%.3+.3)%.3;if(i===`scan`){n.position.x=Math.min(0,Z.x0+.5+this.phaseT*1.3),n.visible=n.position.x<nu.x0+.35;let e=Math.max(0,this.phaseT-2.2),t=Math.min(this.packed.length,Math.floor(e/.4));t>this.shown&&(this.shown=t,X.boop()),this.shown>=this.packed.length&&!this.laughed&&e>this.packed.length*.4+.6&&(this.laughed=!0,this.officerHop=0,X.haha(),this.events.say(this.packed.includes(`gan`)?h.trip.airport.gan:this.packed.includes(`fan`)?h.trip.airport.fan:h.trip.airport.laugh)),this.laughed&&!this.stamped&&e>this.packed.length*.4+2&&(this.stamped=!0,this.officerHop=0,X.stamp(),this.stampMark.visible=!0,this.pass.position.y=.95,this.phase=`out`,this.phaseT=0)}else i===`out`&&(n.visible=!0,n.position.x=Math.min(Z.x1-.4,nu.x1+.3+this.phaseT*1.2),this.phaseT>1.6&&(this.phase=`doors`,this.phaseT=0,X.fwip(),this.events.say(h.trip.airport.plane),n.visible=!1,this.riders.nick.react(`wave`),[`kaylee`,`ji`,`nick`].forEach((e,t)=>this.hop(this.riders[e],this.scene,new V(3-t*.45,0,.35+t*.6),{delay:t*.2,dur:.7,arc:.4,face:80}))));this.doorK=r(this.doorK+(i===`doors`||i===`board`||i===`gone`?e/.9:0)),this.doorsL.position.z=-.45-1.6*this.doorK,this.doorsR.position.z=1.3+1.4*this.doorK,this.plane.door.rotation.y=-1.6*this.doorK,this.planeBounce=Math.min(1,this.planeBounce+e/.6),this.plane.root.position.y=c(this.planeBounce)*.25;let a=this.screen;a.wiggle=Math.min(1,a.wiggle+e/.5),this.shown>0&&(gl(a.canvas,this.packed,this.shown,t+_(a.wiggle,3)*.3),a.tex.needsUpdate=!0),a.mesh.scale.setScalar(1+_(a.wiggle,3)*.04),this.officerHop=Math.min(1,this.officerHop+e/.55),this.officerLife.update(e),this.pass.position.y+=(.915-this.pass.position.y)*(1-Math.exp(-e*10)),this.flagWave=Math.min(1,this.flagWave+e/1.5);let o=this.flag.getObjectByName(`cloth`);o.rotation.y=Math.sin(t*3.1)*.12+Math.sin(t*9)*.25*c(this.flagWave),o.scale.x=1-Math.abs(Math.sin(t*2.3))*.06,this.time-this.lastTouch>8&&(i===`belt`||i===`doors`)&&!this.hinted.has(i)&&(this.hinted.add(i),this.events.say(i===`belt`?h.trip.hint.belt:h.trip.hint.door));let s=this.officer,l=1+Math.sin(t*2.6)*.018;s.body.scale.set(1/Math.sqrt(l),l,1/Math.sqrt(l)),s.root.position.y=c(this.officerHop)*.22,s.armR.rotation.x=-c(this.officerHop)*1.6,s.head.rotation.x=i===`scan`?.08:0;for(let r of Object.values(this.riders))i===`doors`||i===`board`?r.lookAt(iu.x-3.5,2.2,iu.z+1.4):r.root.visible&&r.lookAt(n.position.x,.8,n.position.z),r.update(e,t)}shot(){let e=this.w<this.h;if(this.phase===`doors`||this.phase===`board`||this.phase===`gone`)return{center:new V(e?5.5:6.6,1.5,-.2),half:e?new V(3.6,1.8,2.6):new V(5.6,1.6,2.4),yaw:6,pitch:15,minDist:6};let t=this.phase!==`belt`;return e&&t?{center:new V(.05,1.3,-.55),half:new V(1.45,.85,.75),yaw:6,pitch:14,minDist:3}:e?{center:new V(-2.7,1,.1),half:new V(1.8,1.1,.9),yaw:6,pitch:18,minDist:4}:{center:new V(t?-1:-1.9,1.1,-.1),half:new V(3.6,1.1,1.6),yaw:6,pitch:22,minDist:5}}anchorAt(e){let t=this.phase;switch(e){case`suitcase`:return this.suitcase.root.visible&&t!==`gone`?{at:this.suitcase.root.getWorldPosition(new V).setY(this.suitcase.root.position.y+.25),r:.4,glow:t===`belt`,prio:3}:null;case`screen`:return{at:this.screen.mesh.getWorldPosition(new V),r:.55};case`officer`:return{at:this.officer.root.getWorldPosition(new V).setY(.85),r:.38};case`belt`:return{at:new V(Z.x0+.5,Z.y,Z.z+.3),r:.3};case`plane-door`:return t===`doors`||t===`board`?{at:this.plane.root.localToWorld(new V(...this.plane.doorAt)),r:.6,glow:t===`doors`,prio:3}:null;case`plane`:return{at:this.plane.root.localToWorld(new V(1.5,2.6,1.3)),r:1.5};case`pass`:return t===`belt`||t===`scan`||t===`out`?{at:this.pass.getWorldPosition(new V),r:.2}:null;case`flag`:return{at:this.flag.localToWorld(new V(.3,2.6,0)),r:.3}}if(e.startsWith(`family:`)){let n=this.riders[e.slice(7)];return!n||!n.root.visible||t===`board`||t===`gone`?null:{at:n.root.getWorldPosition(ou).clone().setY(n.height*.55),r:n.height*.3,max:120}}return null}hintAt(){return this.phase===`belt`?this.suitcase.root.getWorldPosition(new V).setY(.4):this.phase===`doors`?this.plane.root.localToWorld(new V(...this.plane.doorAt)):null}qa(){return{leg:`airport`,phase:this.phase,shown:this.shown,packed:[...this.packed],stamped:this.stamped,touches:this.touches}}},cu=`#FF6F8E`,lu=G.cream,uu=G.butter,du=`#C9B5F7`,fu=`#CDEBFF`,pu=2.85;function mu(e){let t=new j,n=new j;t.add(n);let r=4.6,i=1.9,a=-.55,o=2.9,s=[K.rbox(1.45,.75,i,.22,cu,{at:[r/2-.75,.75,0]}),K.rbox(1.05,.62,1.7799999999999998,.18,cu,{at:[r/2-.95,1.42,0]}),K.box(.04,.46,1.54,fu,{at:[r/2-.43,1.42,0],rot:[0,0,-.35]}),...[-1,1].map(e=>K.box(.66,.4,.04,fu,{at:[r/2-.98,1.44,e*(i/2-.04)]})),K.rbox(.16,.18,1.7999999999999998,.06,`#D9D5E6`,{at:[r/2-.02,.45,0]}),...[-1,1].map(e=>K.sphere(.11,G.butter,{at:[r/2-.02,.82,e*.62],scale:[.4,1,1]})),K.box(4.5,.08,1.92,lu,{at:[-.05,.62,0]}),K.box(4.5,.05,1.93,uu,{at:[-.05,.5,0]}),K.box(o,.5,i,cu,{at:[a,.6,0]}),K.box(o,.04,1.74,`#B9A6F5`,{at:[a,.87,0]}),...[-1,1].flatMap(e=>[K.rbox(2.6999999999999997,.12,.42,.04,du,{at:[a,1.1,e*(i/2-.3)]}),K.box(2.6999999999999997,.24,.12,du,{at:[a,.98,e*(i/2-.3)]})]),K.rbox(2.6999999999999997,.42,.08,.03,du,{at:[a,1.44,-.87]}),K.rbox(.3,.08,.9,.03,`#D9D5E6`,{at:[a-o/2-.12,.38,0]}),...[-1,1].flatMap(e=>[-1.94,a,.8399999999999999].map(t=>K.cyl(.04,.04,2,`#F4EFF8`,{at:[t,3.7/2,e*(i/2-.05)]}))),K.rbox(3,.1,2,.05,uu,{at:[a,pu,0]}),...[-.7,0,.7].map(e=>K.box(3.02,.11,.2,cu,{at:[a,pu,e]})),K.box(3,.06,.06,`#F4EFF8`,{at:[a,2.99,i/2]}),K.box(3,.06,.06,`#F4EFF8`,{at:[a,2.99,-1.9/2]}),K.cyl(.03,.03,1.7,`#F4EFF8`,{at:[-1.98,1.25,0],rot:[Math.PI/2,0,0]})];n.add(J(q(s),e,2));let c=[];for(let[n,a]of[[r/2-.85,1],[r/2-.85,-1],[-1.25,1],[-1.25,-1]]){let r=new j;r.position.set(n,.3,a*(i/2-.06)),r.add(J(q([K.torus(.24,.1,G.ink),K.cyl(.13,.13,.1,`#EDEAF5`,{rot:[Math.PI/2,0,0]}),K.box(.3,.05,.11,G.hotpink)]),e,2)),t.add(r),c.push(r)}let l=e=>{let t=new j;return t.position.set(e,1.16,-.6499999999999999),n.add(t),t},u={kaylee:l(-1.5),ji:l(-.5),nick:l(.44999999999999996)},d=new j;return d.position.set(-.9500000000000001,1.16,i/2-.32),n.add(d),{root:t,body:n,seats:u,luggage:d,wheels:c,length:r}}var hu=`#FF8A4D`,gu=`#5FBF8F`,_u=G.gold,vu=`#FFF7F0`,yu=`#C9C1D9`,bu=`#6FBF7F`;function xu(e,t,n,r,i){let a=1.5;return[K.rbox(a,.62,.08,.06,i,{at:[e,t,n]}),K.prism([[0,-.62/2-.1],[0,.41000000000000003],[r*.42,0]],.08,i,{at:[e+r*a/2-r*.02,t,n]}),K.rbox(1.34,.45999999999999996,.02,.04,G.cream,{at:[e,t,n+.045]})]}function Su(e,t,n,r){let i=`#A9A3B8`;return[K.sphere(.2,i,{at:[e-r*.12,t-.02,n],scale:[1.3,.95,.3]},12),K.sphere(.15,i,{at:[e+r*.18,t+.06,n+.02],scale:[1,1,.3]},12),K.sphere(.11,`#FFB3D1`,{at:[e+r*.08,t+.08,n+.05],scale:[.7,1,.2]},10),K.capsule(.04,.16,i,{at:[e+r*.33,t-.06,n+.02],rot:[0,0,r*.4]}),...[-.24,-.02].map(a=>K.box(.07,.14,.04,i,{at:[e-r*.12+a*r,t-.2,n]})),K.sphere(.022,`#2E2233`,{at:[e+r*.22,t+.1,n+.07]},6)]}function Cu(e,t,n,r){return[K.prism([[-.42,.02],[.3,.02],[.46,.14],[.26,-.12],[-.36,-.12]].map(([e,t])=>[e*r,t]),.04,`#C99A6E`,{at:[e,t-.04,n+.02]}),K.box(.04,.22,.03,`#7A5A3A`,{at:[e+r*.4,t+.16,n+.03],rot:[0,0,-r*.3]}),...[`#FF4F9A`,`#FFC83D`,`#8FE3C8`].map((i,a)=>K.box(.05,.12,.02,i,{at:[e+r*(.43+a*.03),t+.18-a*.03,n+.05]})),K.cyl(.015,.015,.5,`#5E5872`,{at:[e-r*.52,t-.08,n+.03],rot:[0,0,r*1.25]},6),K.box(.9,.05,.02,`#7FC8F0`,{at:[e,t-.17,n+.02]})]}function wu(e,t,n,r){let i=t/2+.25,a=Math.hypot(i,r),o=Math.atan2(r,i),s=[];for(let t of[-1,1]){let c=[0,n+r/2,t*i/2];s.push(K.box(e+.5,.1,a,hu,{at:c,rot:[t*o,0,0]})),s.push(K.box(e+.52,.12,.22,gu,{at:[0,n+.06,t*(i-.08)],rot:[t*o,0,0]}))}for(let t of[-1,1]){let c=t*(e/2+.2);s.push(K.prism([[-i+.12,0],[i-.12,0],[0,r-.06]],.06,_u,{at:[c,n+.02,0],rot:[0,Math.PI/2,0]}));for(let e of[-1,1])s.push(K.box(.1,.12,a+.2,_u,{at:[c+t*.06,n+r/2+.06,e*i/2],rot:[e*o,0,0]})),s.push(K.cone(.07,.24,_u,{at:[c+t*.06,n+.12,e*(i+.08)],rot:[e*-.9,0,0]}));s.push(K.capsule(.05,.22,_u,{at:[c+t*.12,n+r+.14,0],rot:[0,0,-t*.5]})),s.push(K.cone(.05,.22,_u,{at:[c+t*.3,n+r+.36,0],rot:[0,0,-t*1.1]}))}return s.push(K.box(e+.5,.1,.14,gu,{at:[0,n+r+.02,0]})),s}var Tu=8.4;function Eu(e){let t=new j,n=1.6;t.add(J(q([K.box(70,.1,6,`#C9C4DE`,{at:[0,-.05,n]}),...Array.from({length:14},(e,t)=>K.box(1.4,.01,.14,G.butter,{at:[-30+t*4.6,.005,2]})),K.box(41.5,.18,1,`#E8E2F4`,{at:[-28.5/2,.09,-1.75]}),K.box(26.6-1.9,.18,1,`#E8E2F4`,{at:[45.3/2,.09,-1.75]}),K.box(70,.1,30,`#A9E3B8`,{at:[0,-.04,-17.2]}),K.box(3.6,.1,30,`#C9C4DE`,{at:[Tu,-.035,-16.4]})]),e,0));let r=6.2,i=2.6,a=new j;a.position.set(0,0,-3.6),a.add(J(q([K.box(7.4,.24,3.6,`#F4EEFF`,{at:[0,.12,0]}),...[-1,1].flatMap(e=>[-6.2/2+.3,-6.2/6,r/6,r/2-.3].map(t=>K.cyl(.17,.2,2.5,vu,{at:[t,1.49,e*(i/2-.2)]},14))),...[-1,1].flatMap(e=>[-6.2/2+.3,-6.2/6,r/6,r/2-.3].map(t=>K.cyl(.22,.22,.12,_u,{at:[t,2.62,e*(i/2-.2)]},14))),K.box(6.5,.42,2.7,vu,{at:[0,2.9,0]}),K.box(6.5200000000000005,.08,2.72,_u,{at:[0,2.72,0]}),K.box(6.5200000000000005,.08,2.72,G.pink,{at:[0,3.07,0]}),K.box(5.8,2.4,.16,`#FFE8DE`,{at:[0,1.44,-1.25]}),K.box(1.9,2,.05,`#CDEBFF`,{at:[0,1.24,-2.6/2+.15]}),K.box(.06,2,.06,`#D8D2E6`,{at:[0,1.24,-1.12]}),K.cyl(.42,.42,.08,G.sky,{at:[0,2.15,i/2-.05],rot:[Math.PI/2,0,0]},24),K.box(.5,.08,.04,`#FFFFFF`,{at:[0,2.15,1.31]}),K.box(.08,.36,.04,`#FFFFFF`,{at:[-.05,2.15,1.31]}),K.box(.06,.16,.04,`#FFFFFF`,{at:[.22,2.22,1.31]}),...wu(r,i,3.12,1.1),...wu(r*.62,i*.7,3.82,1.05),...[-1,1].flatMap(e=>[K.cyl(.22,.17,.36,`#C9B5F7`,{at:[e*3.35,.42,1.55]}),K.sphere(.3,`#7FCB8F`,{at:[e*3.35,.78,1.55]}),...[0,2.1,4.2].map(t=>K.sphere(.09,G.hotpink,{at:[e*3.35+Math.cos(t)*.2,.95,1.55+Math.sin(t)*.2]}))])]),e,2)),t.add(a);let o=(e,t,n)=>[K.cyl(.1,.16,n,`#C99A6E`,{at:[e,n/2,t]},10),...Array.from({length:5},(r,i)=>K.torus(.13-i*.008,.025,`#A97C54`,{at:[e,n/6*(i+1),t],rot:[Math.PI/2,0,0]})),...Array.from({length:6},(r,i)=>{let a=i/6*Math.PI*2;return K.sphere(.9,`#5FBF7F`,{at:[e+Math.cos(a)*.75,n+.05,t+Math.sin(a)*.75],rot:[Math.sin(a)*.6,0,-Math.cos(a)*.6],scale:[1,.16,.36]})}),K.sphere(.2,`#7A5A3A`,{at:[e,n-.05,t]})];t.add(J(q([...o(-5.6,-2,4.6),...o(5.8,-2.6,5.2),...o(-9.5,-4.5,5.6),...o(11.6,-3.4,4.2),...o(5.6,-9,4.8),...o(11.4,-10.5,5.4)]),e,2));let s={x:10.9,z:-1.55},c={chang:[s.x-.55,2.25,s.z+.08],pier:[s.x+.55,1.5,s.z+.08]};t.add(J(q([K.cyl(.07,.08,2.75,`#8C6A55`,{at:[s.x,1.37,s.z]},8),K.sphere(.09,`#8C6A55`,{at:[s.x,2.76,s.z]},8),...xu(...c.chang,-1,G.pink),...Su(c.chang[0]-.05,c.chang[1],c.chang[2]+.06,-1),...xu(...c.pier,1,G.sky),...Cu(c.pier[0]+.02,c.pier[1],c.pier[2]+.06,1)]),e,2));let l=[];for(let e=0;e<9;e++){let t=-34+e*8.5+e%2*2,n=-34-e%3*7,r=10+e*7%5*2.6,i=3.2+e%3*.9;l.push(K.cyl(i*.92,i,r,yu,{at:[t,r/2,n]},12),K.cyl(i*1.02,i*1.04,.6,`#A79FC2`,{at:[t,.3,n]},12),K.sphere(i*1.05,bu,{at:[t,r,n],scale:[1,.55,1]},14))}t.add(J(q(l),e,2));let u=mu(e),d=-2.4;return u.root.position.set(d,0,1),t.add(u.root),{root:t,songthaew:u,curbX:d,roadZ:n,forkX:Tu}}var Du=[{id:`belt`,label:`Seatbelt`,kind:`thing`},{id:`window`,label:`Window shade`,kind:`thing`},{id:`tray`,label:`Tray`,kind:`thing`},{id:`call`,label:`Call button`,kind:`thing`},{id:`light`,label:`Reading light`,kind:`thing`},{id:`vent`,label:`Air vent`,kind:`thing`},{id:`screen`,label:`Seat-back screen`,kind:`thing`},{id:`teddy`,label:`Teddy`,kind:`thing`},{id:`attendant`,label:`Flight attendant`,kind:`thing`},{id:`family:ji`,label:`Mommy`,kind:`family`},{id:`family:nick`,label:`Daddy`,kind:`family`},{id:`family:kaylee`,label:`Kaylee`,kind:`family`},{id:`balloon`,label:`Sparkle's balloon`,kind:`thing`},{id:`songthaew`,label:`Songthaew`,kind:`thing`}],Ou={species:`penguin`,height:1.32,fur:`#4F5F9E`,light:`#FFF6EC`,dark:`#FFA640`,extras:[`scarf`],lashes:!0},ku={x:-.62,y:1.22,w:.7,h:.86},Au=[-5.37,-4.42,-3.47,-2.52,-1.57,-.62,.33,1.28,2.23],ju={kaylee:-.8,ji:0,nick:.72},Mu=1.38,Nu=[2.05,2.72],Pu=[.98,1.96],Fu=2.75,Iu=-.68,Lu=.6,Ru=.48,zu=3.6,Bu=2.02,Vu=3,Hu=60,Uu=4.5,Wu=4.5,Gu=18,Ku=6,qu=35,Ju=new V(0,0,420),Yu=3.1,Xu=2.1,Zu=1.9,Qu=14,$u=[`kaylee`,`ji`,`nick`],ed=new V,td=class extends Xl{events;packed;route;fork;landing;cabin=new j;seats={kaylee:new j,ji:new j,nick:new j};riders;haze=new _e(`#DCEFFB`,40,210);outside=new j;runway=new j;runwayDashes=new j;krabi=new j;thailand=new j;arrival;clouds=[];storks=new j;mini=new j;balloon=null;parts;screen;teddy=null;snacks=[];attendant;zs=[];zMesh=null;sec;secT=0;belt=!1;beltT=0;roll=-1;alt=2.2;progress=0;shade={down:!1,k:0};trayK=0;trayOpen=!1;lightOn=!1;callGlow=1;ventT=-1;turb=1;dad={asleep:!0,t:0};napping=!1;clap=-1;view=`cabin`;viewT=0;elephantDone=!1;touchdown=-1;cheered=!1;drive=-1;forkWait=-1;forkGo=null;forkT=0;told=new Set;counts={snacks:0,shades:0,lights:0,screens:0,belts:0,vents:0};pace=1;off=!1;constructor(e,t,n,r,i={from:sl.bangkok,to:sl.krabi},a=qu,s=`pier`,c=`krabi`){super(e,t),this.events=t,this.packed=r,this.route=i,this.fork=s,this.landing=c,this.pace=qu/a;let{scene:l,bag:u}=this;l.background=new z(`#BFE6FF`),l.fog=this.haze,this.rig.fov=38,this.rig.camera.far=600,l.add(this.outside,this.cabin),this.parts=this.buildCabin();let d=document.createElement(`canvas`);d.width=256,d.height=176;let f=u.add(new dt(d));f.colorSpace=k,this.parts.screen.material=u.add(new gt({map:f})),this.screen={canvas:d,tex:f,mode:`map`,drawn:-1},this.attendant=this.buildAttendant(),this.buildOutside(),this.arrival=Eu(u),this.arrival.root.position.copy(Ju),this.arrival.root.visible=!1,this.arrival.songthaew.root.userData.pick=`songthaew`,l.add(this.arrival.root);let{kaylee:p,members:m}=this.makeFamily([`ji`,`nick`]);p.wear(o(r)),p.glassesUp(!0),this.riders={kaylee:p,ji:m.get(`ji`),nick:m.get(`nick`)};for(let e of $u)this.seats[e].add(this.riders[e].root),this.put(this.riders[e],0,Ru,0,`sit`,-90);this.sec=n,n!==`takeoff`&&(this.belt=!0,this.roll=99,this.alt=Hu,this.progress=+(n===`land`),this.parts.belt.visible=!0),this.place(),setTimeout(()=>this.events.say(n===`land`?h.trip.plane.land:n===`fly`?h.trip.plane.tray:h.trip.plane.belt),400)}buildCabin(){let{bag:e,cabin:t}=this,n=(Au[Au.length-1]-Au[0])/2+1.6,r=(Au[Au.length-1]+Au[0])/2;t.add(J(q([K.box(n*2,.12,4.4+.4,`#D9D2EE`,{at:[r,-.06,1.9/2]}),K.box(n*2,.02,.62,`#FFB8D4`,{at:[r,.005,Mu]}),...Array.from({length:12},(e,t)=>K.sphere(.05,G.cream,{at:[-4.4+t*.75,.02,Mu],scale:[1,.2,1]})),K.box(n*2,.1,4.4+.4,`#FBF8FF`,{at:[r,3.65,1.9/2]}),K.box(n*2,.04,.18,G.butter,{at:[r,3.58,Mu]}),K.box(n*2,zu,.14,`#F7F4FF`,{at:[r,zu/2,3.2199999999999998]}),...Au.map(e=>K.cyl(ku.w*.4,ku.w*.4,.03,`#A8DCFF`,{at:[e,ku.y,3.14],rot:[Math.PI/2,0,0],scale:[1,1,ku.h/ku.w]},20)),K.box(.14,zu,4.4,`#EFEAFB`,{at:[3.35,zu/2,1.9/2]}),K.box(.14,zu,1.7799999999999998,`#EFEAFB`,{at:[2.8,zu/2,-.7200000000000001/2]}),K.box(.14,zu,.92,`#EFEAFB`,{at:[2.8,zu/2,5.379999999999999/2]})]),e,0),J(q([...Array.from({length:6},(e,t)=>K.rbox(.08,2.2,.36,.04,t%2?`#FF9CC8`:`#FF8FB8`,{at:[Fu,1.12,.6299999999999999+t*.3],rot:[0,.25*(t%2?1:-1),0]})),K.box(.12,.12,2.2,G.lavenderDark,{at:[Fu,2.28,Mu]})]),e,2));let i=new Ee;i.moveTo(r-n,0),i.lineTo(r+n,0),i.lineTo(r+n,zu),i.lineTo(r-n,zu),i.closePath();for(let e of Au){let t=new A;t.absellipse(e,ku.y,ku.w/2,ku.h/2,0,Math.PI*2,!1,0),i.holes.push(t)}let a=e.add(new xe(i,{depth:.14,bevelEnabled:!1,curveSegments:24})),o=new B(a,Pa(`#F7F4FF`));o.position.z=-1.3900000000000001,t.add(o);let s=(e,t,n=`#B9A6F5`)=>[K.rbox(.62,.18,.58,.07,n,{at:[e,.39,t]}),K.rbox(.18,1.02,.6,.07,n,{at:[e+.34,.86,t],rot:[0,0,-.12]}),K.rbox(.2,.26,.5,.08,G.cream,{at:[e+.42,1.28,t],rot:[0,0,-.12]}),K.rbox(.21,.07,.5,.03,G.pink,{at:[e+.41,1.2,t],rot:[0,0,-.12]}),K.box(.08,.3,.5,`#8E7FC9`,{at:[e+.05,.15,t]})],c=(e,t)=>[K.rbox(.5,.07,.07,.03,`#9C8BD9`,{at:[e-.02,.62,t]}),K.box(.06,.2,.06,`#9C8BD9`,{at:[e+.2,.5,t]}),K.box(.1,.05,.08,G.ink,{at:[e-.24,.66,t]})],l=[];for(let e of Pu){for(let t of Object.values(ju))l.push(...s(e,t));for(let t of[-1.1,-.4,.36,1.04])l.push(...c(e,t))}for(let e of[0,...Pu]){for(let t of Nu)l.push(...s(e,t));for(let t of[1.72,2.38,3.04])l.push(...c(e,t))}for(let e of[-1.1,-.4,.36,1.04])l.push(...c(0,e));t.add(J(q(l),e,2));for(let n of $u){let r=this.seats[n];r.position.set(0,0,ju[n]),r.add(J(q(s(0,0)),e,2)),t.add(r)}t.add(J(q(Object.values(ju).flatMap(e=>[K.rbox(.2,.62,.6,.07,`#A792EE`,{at:[-.78,.62/2,e]}),K.box(.03,.12,.4,`#8E7FC9`,{at:[-.675,.44999999999999996,e]})])),e,2)),t.add(J(q([K.rbox(n*2,.5,.72,.1,`#EFEAFB`,{at:[r,2.32,-.89]})]),e,0)),t.add(J(q([K.box(n*2,.04,.04,G.lavenderDark,{at:[r,2.07,-.53]}),...Au.map(e=>K.box(.24,.05,.03,G.lavenderDark,{at:[e+.47,2.22,-.52]})),K.rbox(1.12,.05,.4,.02,`#D9D2EE`,{at:[0,2.05,ju.kaylee+.15]}),K.box(n*2,.08,.035,G.pink,{at:[r,.5,-1.23]}),...Au.map(e=>K.torus(.5,.05,`#D9CCFF`,{at:[e,ku.y,-1.24],scale:[ku.w/1,ku.h/1,1]}))]),e,2));let u=()=>J(q([K.box(.08,.04,.5,`#5E5468`,{at:[-.12,.56,0]}),K.box(.1,.05,.1,`#D8D2E6`,{at:[-.13,.57,0]})]),e,1),d=u();d.visible=!1,this.seats.kaylee.add(d);for(let e of[`ji`,`nick`])this.seats[e].add(u());let f=new j;f.position.set(-.16,.6,0),f.add(J(q([K.rbox(.1,.06,.12,.02,G.gold)]),e,1.5)),this.seats.kaylee.add(f);let p=new j;p.position.set(ku.x,ku.y+ku.h/2,-1.22),p.add(J(q([K.box(ku.w+.06,ku.h+.04,.02,`#E8E2F4`,{at:[0,-(ku.h+.04)/2,0]}),K.box(.16,.04,.03,G.lavenderDark,{at:[0,-ku.h-.02,.01]})]),e,1.5)),p.scale.y=.05,t.add(p);let m=new j;m.position.set(Iu,Lu,ju.kaylee),m.add(J(q([K.rbox(.42,.03,.5,.02,`#E8E2F4`,{at:[.21,0,0]}),K.torus(.05,.008,`#C9C1E6`,{at:[.3,.017,.12],rot:[Math.PI/2,0,0]})]),e,1.5)),m.rotation.z=-Math.PI/2,t.add(m);let h=new j;h.position.set(-.75,.73,ju.kaylee),h.rotation.z=.42,h.add(J(q([K.rbox(.06,.3,.42,.03,G.ink,{at:[0,0,0]})]),e,1.5));let g=new B(e.add(new Ce(.37,.26)),e.add(new gt({color:`#1F2A55`})));g.position.set(.035,0,0),g.rotation.y=Math.PI/2,h.add(g),t.add(h);let _=(n,r)=>{let i=new j;return i.position.set(n,Bu,ju.kaylee+.15),i.add(J(q(r),e,1.5)),t.add(i),i},v=_(.42,[K.cyl(.055,.055,.03,G.hotpink),K.sphere(.012,G.cream,{at:[0,-.018,.012]}),K.box(.008,.004,.025,G.cream,{at:[0,-.016,-.006]})]),y=_(0,[K.cyl(.055,.045,.05,G.butter),K.cyl(.035,.035,.01,`#FFFFFF`,{at:[0,-.03,0]})]),b=_(-.42,[K.cyl(.05,.06,.04,`#D8D2E6`),K.sphere(.035,`#B9B2CC`,{at:[0,-.03,0],scale:[1,.7,1]}),K.cyl(.012,.012,.02,G.ink,{at:[0,-.055,0]})]),x=new B(e.add(new nn(.45,1.25,20,1,!0)),e.add(new gt({color:G.butter,transparent:!0,opacity:.25,depthWrite:!1})));return x.position.set(0,1.38,ju.kaylee+.1),x.visible=!1,t.add(x),this.packed.includes(`teddy`)&&(this.teddy=Cl(`teddy`,e),this.teddy.position.set(0,.62,ju.kaylee-.36),this.teddy.rotation.y=-Math.PI/2,this.teddy.scale.setScalar(.8),this.cabin.add(this.teddy)),{belt:d,buckle:f,shade:p,tray:m,call:v,light:y,vent:b,cone:x,screen:g}}buildAttendant(){let{bag:e}=this,t=new j,n=yo(Ou,e);n.root.position.set(.45,0,0),n.root.rotation.y=-Math.PI/2,t.add(n.root);let r=new j;return r.add(J(q([K.rbox(.55,.82,.42,.05,`#E3DCF2`,{at:[0,.5,0]}),...[.3,.55,.8].map(e=>K.box(.56,.02,.43,`#C9C1E6`,{at:[0,e,0]})),K.box(.03,.05,.18,G.lavenderDark,{at:[-.28,.68,0]}),...[-1,1].flatMap(e=>[-1,1].map(t=>K.sphere(.045,G.ink,{at:[e*.2,.05,t*.15]}))),K.cyl(.06,.06,.2,`#FF9F45`,{at:[.12,1.02,-.08]}),K.cyl(.03,.03,.04,G.cream,{at:[.12,1.14,-.08]}),...[0,1,2].map(e=>K.cyl(.04,.03,.07,`#FFFFFF`,{at:[-.12+e*.03,.95+e*.07,.1]})),K.cyl(.09,.09,.08,G.mint,{at:[-.1,.96,-.08]})]),e,2)),t.add(r),t.position.set(3.75,0,Mu),t.userData.pick=`attendant`,this.cabin.add(t),{rig:n,life:new Co(n,`attendant`),root:t,x:3.75,queue:0,wait:0,hand:1,served:0}}buildOutside(){let{bag:e,outside:t}=this,n=J(q([K.box(600,.1,400,`#A9E3B8`,{at:[0,-.06,-150]}),K.box(600,.12,14,`#B9B4CC`,{at:[0,0,-2]}),K.box(600,.04,.4,G.cream,{at:[0,.07,-8.4]}),...Array.from({length:30},(e,t)=>K.sphere(.5,t%3?`#FFB3D1`:G.butter,{at:[-90+t*6,.1,-12.5-t%4],scale:[1,.4,1]},8)),K.box(46,5,9,`#FFF7F0`,{at:[-6,2.5,-40]}),K.box(46.4,.4,9.4,G.gold,{at:[-6,5.1,-40]}),...[-1,1].map(e=>K.box(47,.3,6.6,`#FF8A4D`,{at:[-6,6.4,-40+e*2.4],rot:[e*.62,0,0]})),...Array.from({length:10},(e,t)=>K.box(3.2,2.4,.1,`#A8DCFF`,{at:[-26+t*4.4,2.6,-35.45]})),K.cyl(1.2,1.6,16,`#F4EFF8`,{at:[30,8,-48]}),K.cyl(3,2.4,2.4,`#A8DCFF`,{at:[30,17.2,-48]}),K.cyl(3.3,3.3,.6,G.hotpink,{at:[30,18.7,-48]}),K.box(20,7,14,`#D9D2EE`,{at:[60,3.5,-46]}),K.cyl(7,7,20,`#C9C1E6`,{at:[60,7,-46],rot:[0,0,Math.PI/2],scale:[1,.5,1]})]),e,0);this.runway.add(n);for(let t=-60;t<=60;t+=6)this.runwayDashes.add(J(q([K.box(3,.02,.3,G.cream,{at:[t,.07,-2]})]),e,0));this.runway.add(this.runwayDashes),t.add(this.runway),this.landing===`nan`?this.buildNan():this.buildKrabi(),this.krabi.visible=!1,t.add(this.krabi),this.buildRest()}buildKrabi(){let{bag:e}=this;this.krabi.add(J(q([K.box(800,.1,500,`#5FC7B4`,{at:[0,-.06,-260]}),K.box(800,.12,30,`#A9E3B8`,{at:[0,0,12]}),K.box(800,.14,14,`#B9B4CC`,{at:[0,.02,2]}),K.box(800,.13,3,`#FBE3B8`,{at:[0,.01,-4.5]})]),e,0));let t=[];for(let e=0;e<14;e++){let n=-70+e*11+e%3*4,r=-12-e%4*9-(e>9?30:0),i=6+e%5*3,a=4+e%3;t.push(K.cyl(a*.85,a,i*.55,`#C9C1D9`,{at:[n,i*.275,r]},12),K.cyl(a*.72,a*.86,i*.5,`#D3CBE2`,{at:[n+.4,i*.77,r]},12),K.cyl(a*1.04,a*1.06,.8,`#A79FC2`,{at:[n,.4,r]},12),K.sphere(a*.95,`#6FBF7F`,{at:[n,i,r],scale:[1,.55,1]},14))}this.krabi.add(J(q(t),e,2))}buildNan(){let{bag:e}=this,t=[];for(let e=0;e<18;e++)t.push(K.box(8.6,.05,7,e%3?`#8FD6B0`:`#A8DCEB`,{at:[-80+e*9.5,.02,-16-e%2*8]}));this.krabi.add(J(q([K.box(800,.1,500,`#9ED9A6`,{at:[0,-.06,-260]}),K.box(800,.12,30,`#A9E3B8`,{at:[0,0,12]}),K.box(800,.14,14,`#B9B4CC`,{at:[0,.02,2]}),...t]),e,0));let n=[];for(let e=0;e<16;e++){let t=-90+e*12+e%3*5,r=-34-e%4*14-(e>9?30:0),i=10+e%5*3,a=i*(.7+e%3*.2);n.push(K.sphere(i,e%2?`#6FBF7F`:`#7FCB8F`,{at:[t,0,r],scale:[1,a/i,.8]},16)),e%3==0&&n.push(K.sphere(i*.45,`#FFFFFF`,{at:[t+i*.2,a*.92,r],scale:[1.6,.45,.8]},10))}this.krabi.add(J(q(n),e,2))}buildRest(){let{bag:e,outside:t}=this;this.buildThailand(),t.add(this.thailand);for(let n=0;n<16;n++){let r=J(q([...[0,1,2,3,4].map(e=>K.sphere(1.3+(n+e)%3*.55,`#FFFFFF`,{at:[e*1.4-2.8,Math.sin(e*2+n)*.35+e%2*.5,e%2*.8-.4],scale:[1,.78,1]},9)),K.cyl(3.6,3.6,.6,`#F4F0FF`,{at:[0,-.9,0],scale:[1.3,1,.55]},14)]),e,1.5);r.position.set(-70+n*9.5,-6+n%5*3.2,-9-n%4*8),t.add(r),this.clouds.push({g:r,speed:9+n%3*3})}for(let t=0;t<5;t++){let n=new j;n.add(J(q([K.sphere(.25,`#FFFFFF`,{scale:[1.6,.8,.8]}),K.capsule(.06,.3,`#FFFFFF`,{at:[-.45,.06,0],rot:[0,0,Math.PI/2]}),K.sphere(.09,`#FFFFFF`,{at:[-.68,.08,0]}),K.cone(.04,.34,`#FF6F5E`,{at:[-.9,.06,0],rot:[0,0,Math.PI/2]}),...[-1,1].map(e=>K.cyl(.015,.015,.5,`#FF6F5E`,{at:[.55,-.04,e*.05],rot:[0,0,Math.PI/2]})),K.sphere(.02,G.ink,{at:[-.72,.12,.07]})]),e,1.5));for(let t of[-1,1]){let r=new j;r.add(J(q([K.box(.42,.04,.85,`#FFFFFF`,{at:[0,0,t*.42]}),K.box(.3,.045,.3,G.ink,{at:[.05,0,t*.75]})]),e,1.5)),r.name=t<0?`wingL`:`wingR`,n.add(r)}n.position.set(Math.abs(t-2)*1.6,0,(t-2)*1.6),this.storks.add(n)}this.storks.position.set(-30,2,-12),this.storks.visible=!1,t.add(this.storks);let n=e.add(new Re({transparent:!0,depthWrite:!1}));new fe().load(d.balloon,t=>{if(this.disposed)return t.dispose();t.colorSpace=k,n.map=e.add(t),n.needsUpdate=!0}),this.balloon=new pe(n),this.balloon.scale.set(3.4,3.7,1),this.balloon.visible=!1,this.balloon.userData.pick=`balloon`,t.add(this.balloon)}below(e,t){let[n,r]=dl(e);return new V(r*Vu,t,n*Vu)}buildThailand(){let{bag:e}=this,t=e=>{let t=new Ee;return e.forEach((e,n)=>{let[r,i]=dl(e);n===0?t.moveTo(r*Vu,i*Vu):t.lineTo(r*Vu,i*Vu)}),t},n=e.add(new le([t(al),t(ol)]));n.applyMatrix4(new kt().makeBasis(new V(0,0,1),new V(1,0,0),new V(0,1,0)));let r=new B(n,Pa(`#8FD58F`));r.position.y=.3;let i=Ua(n,3);e.add(i.geometry),r.add(i),this.thailand.add(r),this.thailand.add(J(q([K.box(2e3,.1,2e3,`#7FD3E6`,{at:[0,-.05,0]}),...sl.north.map((e,t)=>{let n=this.below(e,1);return K.cone(1.2+t%2*.4,1.6+t%3*.5,`#B5E6A6`,{at:[n.x,n.y,n.z]},8)})]),e,1.5));let a=new Dt(cl.ear.map(e=>this.below(e,.55)),!0);this.thailand.add(new B(e.add(new It(a,64,.18,6,!0)),Pa(`#FF5FA2`)));let o=this.below(cl.eye,.5);this.thailand.add(J(q([K.cyl(.6,.6,.12,G.ink,{at:[o.x,o.y,o.z]},18),K.cyl(.2,.2,.14,`#FFFFFF`,{at:[o.x+.2,o.y+.02,o.z+.2]},12)]),e,0));let s=this.below(this.route.from,.6),c=this.below(this.route.to,.6),l=Array.from({length:22},(e,t)=>K.sphere(.32,G.butter,{at:[s.x+(c.x-s.x)*(t/21),.6,s.z+(c.z-s.z)*(t/21)],scale:[1,.4,1]},8));this.thailand.add(J(q([...l,...[s,c].map(e=>K.cyl(.9,.9,.3,G.hotpink,{at:[e.x,.7,e.z]},16))]),e,1.5)),this.mini.add(J(q([K.capsule(.55,2.6,`#FFFFFF`,{rot:[0,0,Math.PI/2]}),K.box(1,.16,4.2,`#E3DAFF`),K.box(.6,.9,.12,G.hotpink,{at:[1.7,.6,0]}),K.box(.5,.12,1.6,`#E3DAFF`,{at:[1.7,.1,0]})]),e,2)),this.mini.visible=!1,this.outside.add(this.mini)}pickRoots(){return[this.cabin,this.arrival.root,...this.balloon?[this.balloon]:[]]}onTap(e){this.view===`screen`&&e!==`screen`&&this.setView(`cabin`);let t=this.riders.kaylee;switch(e){case`belt`:this.setBelt(!this.belt||this.sec!==`fly`);return;case`window`:this.shade.down=!this.shade.down,this.counts.shades++,X.fwip(),this.checkNap();return;case`tray`:this.trayOpen=!this.trayOpen,X.thump();return;case`call`:this.call();return;case`light`:this.lightOn=!this.lightOn,this.counts.lights++,X.pop(),this.checkNap();return;case`vent`:this.ventT=0,this.counts.vents++,X.whir(),t.react(`wiggle`);return;case`screen`:this.counts.screens++,S.pop(),this.view===`screen`?this.screen.mode=this.screen.mode===`map`?`cartoon`:`map`:(this.screen.mode=`map`,this.setView(`screen`)),this.viewT=0;return;case`teddy`:this.teddy&&(this.teddy.userData.hop=0),X.boop();return;case`attendant`:this.attendant.hand=0,S.pop(),Math.abs(this.attendant.x)<.2&&this.attendant.queue++;return;case`family:nick`:this.dad.asleep?(this.dad={asleep:!1,t:0},X.snort(),this.riders.nick.react(`hop`),this.events.say(h.trip.plane.dad)):this.riders.nick.react(`wave`);return;case`family:ji`:this.riders.ji.react(`hop`),this.trayOpen&&this.snacks.length<Qu?(this.addSnack(`cookie`,this.seats.ji.getWorldPosition(new V).setY(1.2)),this.told.has(`share`)||(this.told.add(`share`),this.events.say(h.trip.plane.share))):S.sparkle();return;case`family:kaylee`:this.napping=!1,t.react(`hop`),X.boing();return;case`balloon`:S.sparkle(),t.react(`wave`);return;case`songthaew`:X.toot();return}}setBelt(e){this.belt=e,this.parts.belt.visible=e,this.counts.belts++,X.latch(),this.riders.kaylee.react(`wiggle`)}call(){this.callGlow=0,X.callDing(),this.trayOpen||(this.trayOpen=!0,X.thump()),this.attendant.queue++}addSnack(e,t){if(this.disposed)return;if(this.snacks.length>=Qu){this.turb=.7;return}let n=new j;n.add(J(q(e===`juice`?[K.cyl(.05,.04,.12,`#FFFFFF`,{at:[0,.06,0]}),K.cyl(.045,.045,.02,`#FF9F45`,{at:[0,.1,0]}),K.cyl(.006,.006,.12,G.hotpink,{at:[.02,.16,0],rot:[0,0,.2]})]:[K.cyl(.06,.06,.025,`#E8B067`,{at:[0,.013,0]}),...[0,2.1,4.2].map(e=>K.sphere(.012,`#7A4A2A`,{at:[Math.cos(e)*.03,.028,Math.sin(e)*.03]}))]),this.bag,1.5));let r=this.snacks.length,i=new V(-.56+r%2*.17,.62+Math.floor(r/4)*.1,ju.kaylee-.12+Math.floor(r/2)%2*.22);n.userData.fly={from:this.cabin.worldToLocal(t.clone()),to:i,t:0},n.position.copy(n.userData.fly.from),this.cabin.add(n),this.snacks.push(n),this.counts.snacks++,this.snacks.length===1&&this.riders.kaylee.react(`hop`)}checkNap(){let e=this.shade.down&&this.lightOn;e&&!this.napping?(this.napping=!0,this.told.has(`night`)||(this.told.add(`night`),this.events.say(h.trip.plane.snore)),setTimeout(()=>this.napping&&X.snort(),900)):e||(this.napping=!1)}setView(e){let t=this.view;this.view=e,this.viewT=0,this.cabin.visible=e===`cabin`||e===`screen`,this.outside.visible=e!==`krabi`,this.arrival.root.visible=e===`krabi`,this.scene.fog=e===`elephant`||e===`krabi`?null:this.haze,this.rig.lag=e===`screen`?.35:.5,(e===`elephant`||t===`elephant`||e===`krabi`)&&this.rig.setShot(this.shot(),!0)}place(){let e=dl(this.route.from),t=dl(this.route.to),n=this.progress,r=e[0]+(t[0]-e[0])*n,i=e[1]+(t[1]-e[1])*n;this.thailand.position.set(-i*Vu,-60,-r*Vu),this.mini.position.set(0,-54,0),this.mini.visible=this.view===`elephant`,this.runway.position.y=-this.alt,this.krabi.position.y=-this.alt,this.runway.visible=this.sec===`takeoff`&&this.alt<40,this.krabi.visible=this.sec===`land`&&this.alt<50}step(e,t){let n=e*this.pace;this.secT+=n;let i=this.riders.kaylee,a=this.sec,o=0,s=0;if(a===`takeoff`){this.roll<0?(this.beltT+=e,this.belt&&this.beltT>.8?this.roll=0:!this.belt&&this.beltT>3&&(this.riders.ji.react(`wiggle`),this.setBelt(!0))):this.roll+=n;let t=Math.max(0,this.roll),r=Math.min(1,t/Uu);if(this.runwayDashes.position.x=t*t*4%6,this.runway.children[0].position.x=t*t*2.2%120,this.roll>=0&&Math.floor((this.roll-e)*3)!==Math.floor(this.roll*3)&&X.jet(r),s=t>0?-.16*Math.min(1,t/2):0,t>Uu){let e=Math.min(1,(t-Uu)/Wu);if(this.alt=2.2+57.8*(e*e*(3-2*e)),o=-.1*c(Math.min(1,e*1.4)),!this.told.has(`wheee`)){this.told.add(`wheee`),this.events.say(h.trip.plane.wheee);for(let e of $u)this.riders[e].react(`wave`)}e>=1&&this.enterSection(`fly`)}}else if(a===`fly`){if(this.progress=r(this.secT/Gu),(Math.abs(this.secT-8)<n||Math.abs(this.secT-14)<n)&&(this.turb=0),this.passBalloon(this.secT-2),this.storks.visible=this.secT>6&&this.secT<17,this.storks.visible){this.storks.position.x=-28+(this.secT-6)*4.6;for(let[e,n]of this.storks.children.entries()){let r=Math.sin(t*7+e*.8)*.6;n.getObjectByName(`wingL`).rotation.x=r,n.getObjectByName(`wingR`).rotation.x=-r,n.position.y=Math.sin(t*7+e*.8-1)*.08}}!this.trayOpen&&this.time-this.lastTouch>8&&this.secT>4&&!this.told.has(`hint`)&&(this.told.add(`hint`),this.events.say(h.trip.hint.tray)),!this.elephantDone&&this.secT>10&&(this.elephantDone=!0,this.events.flash?.(),this.setView(`elephant`),this.events.say(h.trip.elephant)),this.view===`elephant`&&this.viewT>4.2&&(this.events.flash?.(),this.setView(`cabin`)),this.secT>Gu&&this.enterSection(`land`)}else{!this.belt&&this.secT>1.5&&(this.riders.ji.react(`wiggle`),this.setBelt(!0));let e=r(this.secT/Ku);if(this.alt=Hu-57.8*(1-(1-e)**2),o=.06*c(e),this.runwayDashes.position.x=0,e>=1&&this.touchdown<0&&(this.touchdown=0),this.touchdown>=0){this.touchdown+=n;let e=this.touchdown;if((e<.05||Math.abs(e-.45)<n)&&e<.5&&(X.thump(),this.turb=.6),s=.1*r(1-e/2.5),e>1.6&&!this.cheered){this.cheered=!0,S.sparkle(),this.clap=0;for(let e of $u)this.riders[e].react(`hop`);this.events.say(this.landing===`nan`?h.nan.trip.landed:h.trip.plane.krabi)}e>3.8&&this.drive<0&&this.toKrabi()}}this.drive>=0&&this.stepKrabi(e);for(let t of this.clouds)t.g.position.x+=t.speed*e*(a===`takeoff`?r(this.roll/Uu):1),t.g.position.x>80&&(t.g.position.x-=160),t.g.visible=this.alt>15;this.place(),this.turb=Math.min(1,this.turb+e/1.4);let l=c(this.turb)*+(this.turb<1);if(this.cabin.rotation.z+=(o-this.cabin.rotation.z)*(1-Math.exp(-e*4)),this.cabin.position.y=Math.sin(t*31)*.02*l+Math.sin(t*1.3)*.01,this.cabin.rotation.x=Math.sin(t*23)*.012*l,this.drive<0)for(let t of $u){let n=this.seats[t],r=t===`nick`&&this.dad.asleep?-.22:0;n.rotation.z+=(s+r-n.rotation.z)*(1-Math.exp(-e*6))}this.dad.asleep?Math.floor(t/6.4)!==Math.floor((t-e)/6.4)&&a===`fly`&&X.snort():(this.dad.t+=e,this.dad.t>9&&(this.dad.asleep=!0)),this.shade.k=r(this.shade.k+(this.shade.down?e:-e)/.4),this.parts.shade.scale.y=.05+.95*this.shade.k,this.trayK=r(this.trayK+(this.trayOpen?e:-e)/.35),this.parts.tray.rotation.z=-Math.PI/2*(1-this.trayK),this.callGlow=Math.min(1,this.callGlow+e/1.2),this.parts.call.scale.setScalar(1+c(this.callGlow)*.6),this.parts.cone.visible=this.lightOn,this.ventT>=0&&(this.ventT+=e,this.parts.vent.rotation.y+=e*9,this.ventT>2.6&&(this.ventT=-1)),this.drive<0&&i.setWind(this.ventT>=0?.85:0),this.stepAttendant(e,t);for(let n of this.snacks){let r=n.userData.fly;r.t<1?(r.t=Math.min(1,r.t+e/.6),n.position.lerpVectors(r.from,r.to,r.t),n.position.y+=c(r.t)*.5,r.t>=1&&X.thump()):(n.position.set(r.to.x,r.to.y-(1-this.trayK)*2,r.to.z),n.visible=this.trayK>.6,n.rotation.z=Math.sin(t*20)*.15*l)}if(this.teddy){let t=this.teddy.userData.hop??1;this.teddy.userData.hop=Math.min(1,t+e/.5),this.teddy.position.y=.62+c(Math.min(1,t))*.15}let u=this.screen;t-u.drawn>.2&&(u.drawn=t,hl(u.canvas,this.progress,u.mode,t,this.route.from,this.route.to),u.tex.needsUpdate=!0),this.viewT+=e,this.view===`screen`&&this.viewT>6&&this.setView(`cabin`),this.view===`cabin`&&this.drive<0&&((this.balloon?.visible||this.storks.visible||a===`takeoff`&&this.roll>0||a===`land`&&this.alt<30&&this.touchdown<0)&&!this.shade.down||t%9<2.2?i.lookAt(ku.x,ku.y,-4.25):i.lookAt(-2.18,1.1,ju.kaylee+.6));for(let n of Object.values(this.riders))n.update(e,t);this.stepFaces(e,t)}stepFaces(e,t){let n=this.riders.nick.rig,r=this.dad.asleep&&this.drive<0;r?(n.eyes.scale.y=.08,n.head.rotation.x=-.32,n.head.rotation.z=.12,n.mouth.scale.set(1.25,1.5+Math.sin(t*1.6)*.25,1)):n.head.rotation.set(0,n.head.rotation.y,0);let i=this.riders.kaylee.rig;this.napping?(i.eyes.scale.y=.08,i.head.rotation.z=-.25):i.head.rotation.z=0;for(let[n,i,a]of[[`nick`,r,0],[`kaylee`,this.napping,.5]])i&&Math.floor(t/1.3+a)!==Math.floor((t-e)/1.3+a)&&this.addZ(n);for(let t of[...this.zs]){t.t+=e/2.2;let n=this.riders[t.who],r=n.root.getWorldPosition(ed);t.g.position.set(r.x+.1+t.t*.2,r.y+n.height*1.05+t.t*.7,r.z+Math.sin(t.t*6)*.08),t.g.scale.setScalar(.5+t.t*.8),t.t>=1&&(t.g.removeFromParent(),this.zs.splice(this.zs.indexOf(t),1))}if(this.clap>=0){this.clap+=e;let t=this.clap<1.6;for(let e of $u){let n=this.riders[e].rig;if(!t){n.armL.rotation.set(0,0,0),n.armR.rotation.set(0,0,0);continue}let r=Math.abs(Math.sin(this.clap*14));n.armL.rotation.set(-1.15,0,-.25-.35*r),n.armR.rotation.set(-1.15,0,.25+.35*r)}t&&Math.floor(this.clap*14/Math.PI)!==Math.floor((this.clap-e)*14/Math.PI)&&S.pop(),t||(this.clap=-1)}}addZ(e){if(this.zs.length>6)return;this.zMesh??=J(q([K.box(.16,.035,.03,G.cream,{at:[0,.07,0]}),K.box(.035,.19,.03,G.cream,{rot:[0,0,-.95]}),K.box(.16,.035,.03,G.cream,{at:[0,-.07,0]})]),this.bag,1.5);let t=this.zMesh.clone();t.rotation.y=-Math.PI/2+.6,this.scene.add(t),this.zs.push({g:t,t:0,who:e})}stepAttendant(e,t){let n=this.attendant,i=-.05,a=n.queue>0||n.wait>0?i:3.75,o=n.x;n.x+=r(a-n.x,-e*1.8,e*1.8);let s=Math.abs(n.x-o)>1e-4;n.root.position.set(n.x,0,Mu),n.root.visible=n.x<2.95;let l=n.rig;l.body.rotation.z=s?Math.sin(t*12)*.08:0,l.root.position.y=s?Math.abs(Math.sin(t*12))*.03:0;let u=Math.abs(n.x-i)<.02;l.root.rotation.y+=((u?Math.PI:-Math.PI/2)-l.root.rotation.y)*(1-Math.exp(-e*8)),u&&n.queue>0?(n.wait-=e,n.wait<=0&&(n.queue--,n.hand=0,n.served++,this.addSnack(n.served%2?`juice`:`cookie`,l.root.getWorldPosition(new V).setY(1.2)),n.served===1?this.events.say(h.trip.plane.snack):n.served===4&&this.events.say(h.trip.plane.more),n.wait=n.queue>0?.75:2.2)):u&&n.wait>0&&(n.wait=Math.max(0,n.wait-e)),n.hand=Math.min(1,n.hand+e/.5),l.armR.rotation.x=-c(n.hand)*1.4;let d=1+Math.sin(t*2.6)*.018;l.body.scale.set(1/Math.sqrt(d),d,1/Math.sqrt(d)),n.life.update(e)}passBalloon(e){let t=this.balloon;t&&(t.visible=e>0&&e<11&&this.alt>30,t.visible&&t.position.set(-14+e*2.6,1.8+Math.sin(e*1.4)*.3,-6.5))}enterSection(e){this.sec!==e&&(this.sec=e,this.secT=0,this.events.section(e),e===`land`&&(this.events.say(h.trip.plane.land),this.view!==`cabin`&&this.setView(`cabin`)),e===`fly`&&setTimeout(()=>this.sec===`fly`&&this.events.say(h.trip.plane.tray),1500))}skip(){if(this.drive>=0){if(this.fork===`pier`){this.drive=4.1,this.events.done(`pier`);return}let e=this.forkGo??(this.fork===`chang`?`chang`:null);e?(this.forkGo=e,this.forkT=2.9,this.events.done(e)):this.forkWait<0?this.drive=2.8:this.forkWait=Math.max(this.forkWait,3)}else this.sec===`land`?(this.cheered=!0,this.toKrabi()):(this.belt||this.setBelt(!0),this.storks.visible=!1,this.balloon&&(this.balloon.visible=!1),this.enterSection(`land`))}toKrabi(){if(this.landing===`nan`){this.off||this.events.done(`rental`),this.off=!0;return}this.drive=0,this.events.flash?.();let e=this.arrival.songthaew;for(let t of $u){let n=this.riders[t];e.seats[t].add(n.root),this.put(n,0,0,0,`sit`,0),n.rig.armL.rotation.set(0,0,0),n.rig.armR.rotation.set(0,0,0),n.rig.head.rotation.set(0,0,0)}this.clap=-1,this.napping=!1;for(let e of this.zs)e.g.removeFromParent();this.zs=[];let t=Tl(this.bag);t.root.scale.setScalar(.75),t.root.rotation.y=Math.PI,e.luggage.add(t.root),this.riders.kaylee.glassesUp(!1),this.setView(`krabi`)}stepKrabi(e){this.drive+=e;let t=this.drive,n=this.arrival.songthaew,i=Math.max(0,t-.7);if(this.fork!==`pier`)return this.stepFork(e,i);n.root.position.x=this.arrival.curbX+i*i*1.6;for(let e of n.wheels)e.rotation.z=-i*i*1.6/.3;n.body.position.y=i>0?Math.abs(Math.sin(i*9))*.03:0,t>.7&&t-e<=.7&&(X.toot(),X.putt(),this.riders.nick.react(`wave`),this.riders.kaylee.react(`wave`));let a=r(i/1.2);this.riders.kaylee.setWind(a),this.riders.ji.setWind(a),t>Yu&&t-e<=Yu&&this.events.done(`pier`)}stepFork(e,t){let n=this.arrival.songthaew,i=this.arrival,a=this.drive;a>.7&&a-e<=.7&&(X.toot(),X.putt(),this.riders.kaylee.react(`wave`));let o=r(t/Xu),s=i.curbX+(i.forkX-i.curbX)*o*o*(3-2*o),c=s-i.curbX;(o<1||this.forkWait<0)&&(n.root.position.x=s),o>=1&&this.forkWait<0&&(this.forkWait=0,this.fork===`chang`?this.forkGo=`chang`:this.forkGo||(this.events.say(h.bay.whereTo),this.events.asking?.(!0),this.riders.nick.react(`wave`)));let l=o>0&&o<1;if(this.forkWait>=0){if(!this.forkGo)this.forkWait+=e,this.forkWait>9&&this.forkWait-e<=9&&this.time-this.lastTouch>6&&this.events.say(h.chang.hint.fork);else{this.forkT+=e;let t=this.forkT;if(this.forkGo===`chang`){let e=r(t/.55);n.root.rotation.y=Math.PI/2*e*e*(3-2*e);let a=Math.max(0,t-.45);n.root.position.z=i.roadZ-.6-a*a*2.2,c+=a*a*2.2+e*.8}else n.root.position.x=i.forkX+t*t*1.8,c+=t*t*1.8;t>Zu&&t-e<=Zu&&this.events.done(this.forkGo)}}for(let e of n.wheels)e.rotation.z=-c/.3;let u=l||this.forkGo!==null&&this.forkT>0;n.body.position.y=u?Math.abs(Math.sin(a*9))*.03:0;let d=u?.8:0;this.riders.kaylee.setWind(d),this.riders.ji.setWind(d)}choose(e){this.fork!==`ask`||this.forkGo||(this.events.asking?.(!1),this.forkGo=e,this.forkT=0,X.toot(),this.riders.kaylee.react(`hop`),this.riders.nick.react(`wave`),this.events.say(h.bay.pai))}shot(){let e=this.w<this.h;if(this.view===`screen`)return{center:this.parts.screen.getWorldPosition(new V),half:new V(.1,.16,.26),yaw:90,pitch:45,minDist:1.25,maxDist:1.3};if(this.view===`elephant`){let t=this.thailand.position,[n,r]=dl([100.9,13]);return{center:new V(t.x+r*Vu,t.y,t.z+n*Vu),half:new V(24,1,e?14:16),yaw:-90,pitch:62,minDist:20,maxDist:400}}if(this.view===`krabi`){let t=this.arrival.songthaew.root.position.x;if(this.fork!==`pier`){let n=Ju.x+(e?Math.min(t,this.arrival.forkX)+1.3:Math.min(t,this.arrival.forkX)*.75+1),r=+(this.fork===`ask`&&this.forkWait>=0&&!this.forkGo);return{center:new V(n,(e?2:1.8)-r*(e?.9:1.2),Ju.z-.6),half:new V(e?2.9:4.6,(e?2.4:2)+r*(e?.9:1.2),1.8),yaw:4,pitch:9,minDist:5}}return e?{center:new V(Ju.x+Math.min(t,4)+.2,2,Ju.z-.6),half:new V(2.8,2.4,1.8),yaw:4,pitch:9,minDist:5}:{center:new V(Ju.x+Math.min(t+1.2,2.5)*.6,2,Ju.z-.6),half:new V(4.6,2,1.8),yaw:4,pitch:9,minDist:5}}return e?{center:new V(-.3,1,-.22),half:new V(.8,.8,1.12),yaw:-64,pitch:23,minDist:3,maxDist:5.2}:{center:new V(-.3,1,-.42),half:new V(1,.72,.95),yaw:-64,pitch:23,minDist:3,maxDist:5.2}}anchorAt(e){if(this.view===`elephant`)return null;if(this.view===`krabi`)return e===`songthaew`?{at:this.arrival.songthaew.root.getWorldPosition(new V).setY(1.4),r:1.4}:null;let t=(e,t=0)=>{let n=e.getWorldPosition(new V);return n.y+=t,n};switch(e){case`belt`:return{at:t(this.parts.buckle),r:.12,glow:!this.belt&&this.sec!==`fly`,prio:3};case`window`:return{at:this.cabin.localToWorld(new V(ku.x,ku.y,-1.2)),r:.34};case`tray`:return{at:this.cabin.localToWorld(new V(Iu+.2*this.trayK,Lu-.15*(1-this.trayK),ju.kaylee)),r:.2,glow:this.sec===`fly`&&!this.trayOpen&&this.secT>2&&this.secT<10,prio:3};case`call`:return{at:t(this.parts.call),r:.08,glow:this.sec===`fly`&&this.trayOpen&&this.snacks.length===0,prio:4};case`light`:return{at:t(this.parts.light),r:.08,prio:3};case`vent`:return{at:t(this.parts.vent),r:.08,prio:3};case`screen`:return{at:t(this.parts.screen,.05),r:.18,prio:3};case`teddy`:return this.teddy?{at:t(this.teddy,.15),r:.14,prio:3}:null;case`attendant`:return this.attendant.root.visible?{at:t(this.attendant.rig.root,.7),r:.35,max:120}:null;case`balloon`:return this.balloon?.visible&&!this.shade.down?{at:t(this.balloon),r:1.5}:null}if(e.startsWith(`family:`)){let n=this.riders[e.slice(7)];return n?{at:t(n.root,n.height*.62),r:n.height*.24,max:120}:null}return null}hintAt(){return this.view===`cabin`?this.belt?this.sec===`fly`&&!this.trayOpen?this.cabin.localToWorld(new V(Iu,.44999999999999996,ju.kaylee)):this.sec===`fly`&&this.snacks.length<Qu?this.parts.call.getWorldPosition(ed).clone():null:this.parts.buckle.getWorldPosition(new V):null}qa(){return{leg:`plane`,section:this.sec,t:Math.round(this.secT*10)/10,belt:this.belt,rolling:this.roll>=0,alt:Math.round(this.alt),progress:Math.round(this.progress*100)/100,tray:this.trayOpen,shade:this.shade.down,light:this.lightOn,view:this.view,touchdown:this.touchdown>=0,dadAsleep:this.dad.asleep,napping:this.napping,attendant:Math.round(this.attendant.x*10)/10,krabi:this.drive>=0,fork:this.fork,atFork:this.forkWait>=0,forkGo:this.forkGo,touches:this.touches,...this.counts}}},nd=`#2E2233`,rd=`#FFFFFF`,id=`#FF9DB8`,ad=[`needlefish`,`eagle`,`macaque`,`cat`,`crab`,`mudskipper`,`lizard`,`kingfisher`,`porpoise`],od=[...ad,`elephant`];function sd(e,t,n,r=1.5){let i=new j,a=[],o=[];for(let[n,r,i]of e)a.push(K.sphere(t,nd,{at:[n,r,i]},10)),o.push(K.sphere(t*.38,rd,{at:[n+t*.3,r+t*.35,i+t*.62]},6));return i.add(qa(a,o,n,r)),i}var cd=class{g;next=1+Math.random()*3;t=-1;constructor(e){this.g=e}update(e){this.next-=e,this.next<=0&&(this.t=0,this.next=2+Math.random()*4);let t=1;this.t>=0&&(this.t+=e/.16,t=1-.9*Math.sin(Math.min(1,this.t)*Math.PI),this.t>=1&&(this.t=-1)),this.g.scale.y=t}};function ld(e,t=`#FF7F6E`,n=!0){let r=new j,i=[K.sphere(.2,t,{at:[0,.14,0],scale:[1.3,.62,1]},14),K.sphere(.08,`#FFD6C8`,{at:[0,.1,.12],scale:[1.6,.6,.5]},10),...[-1,1].flatMap(e=>[0,1,2].map(n=>K.capsule(.022,.12,t,{at:[e*(.24+n*.02),.07,-.08+n*.07],rot:[0,0,e*1.1]}))),K.sphere(.05,t,{at:[-.25,.14,.14]},8),...[-1,1].map(e=>K.cyl(.018,.018,.14,t,{at:[e*.07,.26,.1]},6)),...[-1,1].map(e=>K.sphere(.03,id,{at:[e*.14,.16,.17]},6))];r.add(J(q(i),e,1.5));let a=new j;a.position.set(.22,.16,.1),a.add(J(q([K.capsule(.03,.12,t,{at:[.05,.05,0],rot:[0,0,-.8]}),K.sphere(.11,n?`#FFE9A8`:t,{at:[.15,.13,0],scale:[1,.75,.55]},12)]),e,1.5)),n||a.scale.setScalar(.45),r.add(a);let o=sd([[-.07,.35,.1],[.07,.35,.1]],.04,e,1);return r.add(o),r.add(Ya(.3,e)),{root:r,claw:a,blink:new cd(o)}}function ud(e){let t=new j,n=`#9C8FA8`;t.add(J(q([K.capsule(.12,.32,n,{at:[0,.12,0],rot:[Math.PI/2,0,0],scale:[1,1,.85]}),K.cone(.12,.2,n,{at:[0,.12,-.32],rot:[-Math.PI/2,0,0],scale:[.35,1,1]},8),...[-1,1].map(e=>K.sphere(.07,`#B6AAC2`,{at:[e*.12,.05,.12],scale:[1,.4,1.3]},8)),K.box(.02,.1,.22,`#8DB7E8`,{at:[0,.27,-.05]}),...[[.06,.2,-.08],[-.05,.22,.02],[.04,.2,.12]].map(e=>K.sphere(.025,`#6FC3E8`,{at:e},6)),...[-1,1].map(e=>K.sphere(.03,id,{at:[e*.1,.1,.22]},6))]),e,1.5));let r=sd([[-.05,.26,.17],[.05,.26,.17]],.045,e,1);return t.add(r),t.add(Ya(.25,e)),{root:t,blink:new cd(r)}}function dd(e){let t=new j,n=`#6F7A8E`,r=`#F6E08A`;t.add(J(q([K.capsule(.22,.9,n,{at:[0,.18,0],rot:[Math.PI/2,0,0],scale:[1,1,.7]}),...[-.3,0,.3].flatMap(e=>[-1,1].map(t=>K.sphere(.05,r,{at:[t*.12,.3,e]},6))),...[-1,1].flatMap(e=>[.35,-.35].map(t=>K.capsule(.05,.16,n,{at:[e*.24,.1,t],rot:[0,0,e*1.2]})))]),e,2));let i=new j;i.position.set(0,.22,.7),i.add(J(q([K.capsule(.13,.22,n,{at:[0,0,.15],rot:[Math.PI/2,0,0],scale:[1,1,.75]}),...[-1,1].map(e=>K.sphere(.035,id,{at:[e*.09,-.02,.27]},6))]),e,2));let a=sd([[-.08,.06,.18],[.08,.06,.18]],.04,e,1);i.add(a);let o=new j;o.position.set(0,-.02,.4),o.add(J(q([K.box(.02,.01,.16,G.hotpink,{at:[0,0,.08]}),...[-1,1].map(e=>K.box(.015,.01,.07,G.hotpink,{at:[e*.02,0,.18],rot:[0,e*.5,0]}))]),e,0)),o.scale.z=.01,i.add(o),t.add(i);let s=new j;return s.position.set(0,.16,-.62),s.add(J(q([K.cone(.17,1.1,n,{at:[0,0,-.55],rot:[-Math.PI/2,0,0],scale:[1,1,.6]},10),K.sphere(.04,r,{at:[0,.07,-.3]},6)]),e,2)),t.add(s),{root:t,head:i,tongue:o,tail:s,blink:new cd(a)}}function fd(e,t){let n=new j,r=t===`eagle`,i=r?1:.32,a=r?`#8E8AA8`:`#3FA8F0`,o=r?rd:`#FFAA5C`,s=r?`#FFC83D`:G.ink;n.add(J(q([K.sphere(.32*i,o,{at:[0,0,0],scale:[.8,.75,1.3]},14),K.sphere(.22*i,a,{at:[0,.1*i,-.08*i],scale:[.9,.6,1.2]},12),K.sphere(.2*i,r?rd:a,{at:[0,.2*i,.34*i]},12),K.cone(.07*i,r?.18*i:.36*i,s,{at:[0,.17*i,.6*i],rot:[Math.PI/2,0,0]},8),K.cone(.16*i,.34*i,a,{at:[0,.02*i,-.5*i],rot:[-Math.PI/2,0,0],scale:[1,1,.35]},8),...[-1,1].map(e=>K.sphere(.05*i,id,{at:[e*.13*i,.14*i,.48*i]},6))]),e,r?2:1.5));let c=sd([[-.1*i,.26*i,.48*i],[.1*i,.26*i,.48*i]],.05*i,e,1);n.add(c);let l=t=>{let o=new j;return o.position.set(t*.18*i,.08*i,0),o.add(J(q([K.sphere(.5*i,a,{at:[t*.45*i,0,-.02*i],scale:[1,.12,.42]},12),K.sphere(.25*i,r?`#6E6A88`:`#2F86D0`,{at:[t*.8*i,0,-.08*i],scale:[1,.14,.6]},8)]),e,r?2:1.5)),n.add(o),o};return{root:n,wingL:l(-1),wingR:l(1),blink:new cd(c)}}function pd(e){let t=new j,n=new j;t.add(n);let r=`#B9A28E`,i=`#FFB8B0`;n.add(J(q([K.sphere(.24,r,{at:[0,.26,0],scale:[1,1.1,.9]},14),K.sphere(.2,r,{at:[0,.62,.02]},14),K.sphere(.13,i,{at:[0,.58,.15],scale:[1.1,.95,.6]},12),...[-1,1].map(e=>K.sphere(.07,r,{at:[e*.2,.67,0],scale:[.6,1,.5]},8)),...[-1,1].map(e=>K.sphere(.05,i,{at:[e*.2,.67,.02],scale:[.5,.8,.4]},6)),...[-1,1].map(e=>K.capsule(.06,.12,r,{at:[e*.12,.06,.12],rot:[Math.PI/2,0,0]})),K.torus(.14,.03,r,{at:[0,.18,-.28],rot:[.2,Math.PI/2,0]},Math.PI*1.5),...[-1,1].map(e=>K.sphere(.035,id,{at:[e*.09,.55,.2]},6))]),e,2));let a=sd([[-.055,.63,.21],[.055,.63,.21]],.035,e,1);n.add(a);let o=t=>{let a=new j;return a.position.set(t*.2,.4,.02),a.add(J(q([K.capsule(.05,.18,r,{at:[0,-.12,0]}),K.sphere(.055,i,{at:[0,-.25,0]},8)]),e,2)),n.add(a),a};return t.add(Ya(.3,e)),{root:t,body:n,armL:o(-1),armR:o(1),blink:new cd(a)}}function md(e){let t=new j,n=`#FFB66E`,r=`#FFF1DC`;t.add(J(q([K.sphere(.2,n,{at:[0,.2,0],scale:[1,1.1,1.15]},14),K.sphere(.13,r,{at:[0,.18,.14],scale:[1,1.2,.6]},10),...[-1,1].map(e=>K.sphere(.06,r,{at:[e*.08,.04,.18]},8))]),e,2));let i=new j;i.position.set(0,.42,.06),i.add(J(q([K.sphere(.17,n,{},14),K.sphere(.08,r,{at:[0,-.05,.12],scale:[1.3,.8,.6]},10),...[-1,1].map(e=>K.cone(.07,.13,n,{at:[e*.1,.15,0],rot:[0,0,-e*.3]},8)),...[-1,1].map(e=>K.cone(.04,.08,`#FFB3D1`,{at:[e*.1,.14,.03],rot:[0,0,-e*.3]},6)),K.sphere(.02,G.hotpink,{at:[0,-.02,.17]},6),...[-1,1].map(e=>K.sphere(.03,id,{at:[e*.1,-.04,.13]},6))]),e,2));let a=sd([[-.06,.03,.14],[.06,.03,.14]],.035,e,1);i.add(a),t.add(i);let o=new j;return o.position.set(0,.08,-.2),o.add(J(K.capsule(.035,.3,n,{at:[0,.15,-.04],rot:[-.3,0,0]}),e,2)),t.add(o),{root:t,head:i,tail:o,blink:new cd(a)}}function hd(e){let t=new j;t.add(J(q([K.capsule(.06,.6,`#B8E6D8`,{rot:[Math.PI/2,0,0]}),K.box(.13,.02,.5,`#7FCDB5`,{at:[0,.05,-.05]}),K.cone(.03,.35,`#7FCDB5`,{at:[0,0,.5],rot:[Math.PI/2,0,0]},6),K.cone(.08,.14,`#7FCDB5`,{at:[0,0,-.42],rot:[-Math.PI/2,0,0],scale:[.2,1,1]},6)]),e,1.5));let n=sd([[-.045,.03,.22],[.045,.03,.22]],.025,e,1);return t.add(n),{root:t,blink:new cd(n)}}function gd(e){let t=new j,n=`#A9B4CC`;t.add(J(q([K.sphere(.5,n,{at:[0,0,0],scale:[.9,.85,1.6]},18),K.sphere(.3,`#D7DEEC`,{at:[0,-.15,.25],scale:[1,.6,1.6]},12),K.cone(.3,.6,n,{at:[0,0,-.95],rot:[-Math.PI/2,0,0],scale:[1,1,.35]},10),K.box(.9,.06,.28,n,{at:[0,0,-1.25]}),K.torus(.1,.018,nd,{at:[0,-.06,.74],rot:[.4,0,Math.PI]},Math.PI),...[-1,1].map(e=>K.sphere(.06,id,{at:[e*.26,-.02,.62]},6))]),e,2));let r=sd([[-.2,.12,.62],[.2,.12,.62]],.06,e,1.5);return t.add(r),{root:t,blink:new cd(r)}}var _d={w:480,h:360},vd=new et;function yd(e,t,n){let r=e.domElement,i=r.width,a=r.height,o=i,s=Math.round(i*3/4);s>a&&(s=a,o=Math.round(a*4/3));let c=e.getPixelRatio();e.getSize(vd),n.aspect=4/3,n.clearViewOffset(),n.updateProjectionMatrix(),e.setScissorTest(!0),e.setViewport(0,0,o/c,s/c),e.setScissor(0,0,o/c,s/c),e.render(t,n);let l=document.createElement(`canvas`);return l.width=_d.w,l.height=_d.h,l.getContext(`2d`)?.drawImage(r,0,a-s,o,s,0,0,_d.w,_d.h),e.setScissorTest(!1),e.setViewport(0,0,vd.x,vd.y),l.toDataURL(`image/jpeg`,.82)}function bd(e,t,n,r,i,a,o){let s=new St(e,4/3,.3,700);return s.position.set(t,n,r),s.lookAt(i,a,o),s.updateMatrixWorld(),s}var xd=`
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,Sd=`
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
`,Cd=class{mesh;mat;constructor(e,t){this.mat=t.add(new Se({uniforms:{uDeep:{value:new z(e.deep)},uShallow:{value:new z(e.shallow)},uDash:{value:new z(`#FFFFFF`)},uHaze:{value:new z(e.haze)},uTime:{value:0},uHazeNear:{value:e.hazeNear},uHazeFar:{value:e.hazeFar}},vertexShader:xd,fragmentShader:Sd})),this.mesh=new B(t.add(new Ce(e.size,e.size)),this.mat),this.mesh.rotation.x=-Math.PI/2}update(e){this.mat.uniforms.uTime.value=e}setColors(e,t,n){let r=this.mat.uniforms;r.uDeep.value.set(e),r.uShallow.value.set(t),r.uHaze.value.set(n)}};function wd(e,t,n){return .05*Math.sin(e*.21+n*1.3)+.04*Math.sin(t*.17-n*1.1)+.02*Math.sin((e-t)*.5+n*2.1)}var Td=`#E6A375`,Ed=`#C9875C`,Dd=`#F6D3AE`,Od=`#A3AAC4`,kd=`#7E86A6`,Ad=`#5E5468`,jd={top:9,boost:1.75,accel:5,coast:.42,turn:1.35,grip:2.2,near:3,far:26,dead:.2,lean:.16},Md={pink:G.pink,butter:G.butter,mint:G.mint,sky:G.sky,lavender:G.lavenderDark,hotpink:G.hotpink},Nd={football:[.12,.62,2.05],coconut:[-.3,.6,1.75],mango:[.42,.62,1.25],bucket:[.38,.5,-1.45],teddy:[0,.78,-.22],trophy:[-.28,.5,2.3]},Pd=6.4,Fd=new V(0,1.66,3.8600000000000003),Id={hull:Td,hullDark:Ed,inside:Dd,stripe:G.hotpink,trim:G.butter};function Ld(e,t=Id){let n=new j,r=new j;n.add(r);let i=[K.rbox(1.3,.55,Pd,.25,t.hull,{at:[0,.2,0]}),K.box(1.36,.1,5.800000000000001,t.stripe,{at:[0,.43,-.1]}),K.box(1.34,.05,5.6000000000000005,t.trim,{at:[0,.33,-.1]}),K.box(1.1,.06,5.2,t.inside,{at:[0,.46,-.2]}),...[-.32,0,.32].map(e=>K.box(.04,.02,4.800000000000001,t.hullDark,{at:[e,.495,-.2]})),K.rbox(.9,.4,1.3,.18,t.hull,{at:[0,.48,Pd/2-.25],rot:[-.45,0,0]}),K.rbox(.42,.34,1.1,.15,t.hull,{at:[0,.92,3.45],rot:[-.9,0,0]}),K.cyl(.07,.09,.7,t.hull,{at:[0,1.32,3.75],rot:[-.35,0,0]}),K.sphere(.1,G.gold,{at:[Fd.x,Fd.y,Fd.z]}),...[.9,-.5].map(e=>K.box(1.2,.08,.36,t.inside,{at:[0,.5,e]})),K.cyl(.09,.12,.5,Ad,{at:[0,.62,-2.85]})];r.add(J(q(i),e,2));let a=new j;a.position.set(0,.9,-2.85);let o=new V(0,.08,1.12);a.add(J(q([K.rbox(.52,.44,.72,.1,Od,{at:[0,.12,-.05]}),K.cyl(.17,.17,.08,kd,{at:[.3,.1,-.05],rot:[0,0,Math.PI/2]}),K.cyl(.04,.04,.38,G.ink,{at:[-.14,.48,-.2],rot:[-.25,0,0]}),K.rbox(.3,.16,.3,.06,G.hotpink,{at:[0,.4,.12]}),K.cyl(.035,.035,1.1,Ad,{at:[0,.06,.6],rot:[Math.PI/2-.03,0,0]}),K.capsule(.05,.14,G.hotpink,{at:[o.x,o.y,o.z],rot:[Math.PI/2,0,0]}),K.cyl(.055,.05,3.6,Ad,{at:[0,-.4,-1.78],rot:[Math.PI/2-.27,0,0]})]),e,2));let s=new j;s.position.set(0,-.9,-3.5),s.add(J(q([K.box(.5,.08,.05,G.gold),K.box(.08,.5,.05,G.gold),K.sphere(.07,kd)]),e,1.5)),a.add(s),r.add(a);let c=new j;c.position.copy(Fd),r.add(c);let l=new j,u=[];for(let e=0;e<12;e++){let t=e/12*Math.PI*2;u.push(K.sphere(.045,e%4==0?`#FFE9A8`:`#FFFFFF`,{at:[Math.sin(t)*.12,-.12+Math.cos(t)*.02,Math.cos(t)*.12]},8))}for(let e=0;e<6;e++)u.push(K.sphere(.04,`#FFFFFF`,{at:[0,-.16-e*.07,.1+e*.012]},8));u.push(K.sphere(.075,`#FFB43C`,{at:[0,-.62,.17]},10),K.sphere(.06,G.hotpink,{at:[0,-.73,.18]},10)),l.add(J(q(u),e,1.5)),l.visible=!1,c.add(l);let d=[],f=new j;c.add(f);let p=new j;r.add(p);let m=0;return{root:n,body:r,cargo:p,seats:{nick:{x:0,y:.52,z:.9},ji:{x:0,y:.52,z:-.5},kaylee:{x:0,y:.5,z:-1.98,stand:!0}},hull:{at:[2.4,.4,-1.8],r:.85},feel:jd,stern:-6.4/2-3.1,bow:3.6,setRibbons(t){f.clear(),d=t.slice(0,3).map((t,n)=>{let r=Md[t]??G.pink,i=[],a=f;for(let t=0;t<5;t++){let o=new j;t===0?(o.position.set((n-1)*.09,0,-.02),o.rotation.set(-.7,(n-1)*.5,0)):o.position.set(0,0,-.34);let s=[K.box(.2-t*.025,.02,.34,r,{at:[0,0,-.34/2]})];t===0&&s.push(...[-1,1].map(e=>K.sphere(.09,r,{at:[e*.1,.03,.02],scale:[1.2,.5,.8]},8))),o.add(J(q(s),e,1.5)),a.add(o),i.push(o),a=o}return{joints:i,phase:n*1.9}})},setGarland(e){l.visible=e},grip(e){return e.copy(o).applyAxisAngle(new V(0,1,0),a.rotation.y).add(a.position)},animate(e,t,n,r){a.rotation.y+=(-e*.45-a.rotation.y)*Math.min(1,r*8),a.rotation.x=.04*t,s.rotation.z+=r*(8+50*t),a.position.y=.9+Math.sin(n*60)*.006*(.4+2*t),m+=r*(3+14*t);for(let e of d)e.joints.forEach((n,r)=>{let i=Math.sin(m+e.phase-r*1.1)*(.18+.25*t);r===0?n.rotation.x=-.75+.62*Math.min(1,t)+i*.35:(n.rotation.x=i*.9-.12*(1-t),n.rotation.y=Math.cos(m*.7+e.phase+r)*.2*(.3+t))})}}}var Rd={x:-2.2,z0:86,z1:110,w:3},zd={x:1.1,z:90,heading:Math.PI},Bd={x:0,z:62,heading:Math.PI},Vd={x:95,z:-40,inner:16,outer:34,h:30},Hd={x:Vd.x,half:1.55,z0:Vd.z+37,z1:Vd.z+15};function Ud(e){let t=(Hd.z0-e)/(Hd.z0-Hd.z1);return t<=0?3.4:t>=1?3.2:t<.45?3.4-t/.45*2.25:t<.8?1.15:1.15+(3.2-1.15)*((t-.8)/.2)}var Wd={x:Hd.x,z:Hd.z1-3,r:2.4},Gd={x:Hd.x,z:Hd.z0+3.6},Kd={x:Hd.x,z:Hd.z0+2.2,heading:Math.PI},qd={x:Hd.x+4.6,z:Hd.z0+6.5,heading:.15},Jd={x:Hd.x+1.5,z:Hd.z0+7.5,r:6},Yd={x:-85,z:-110,r:2.6,top:5.2,h:21,buoys:14},Xd={x:-112,z:-140,w:26,d:9},Zd=bf([Yd.x-Xd.x,Yd.z-Xd.z]),Qd={x:Xd.x+Zd[0]*7,z:Xd.z+Zd[1]*7,r:6},$d={x:-58,z:-80,heading:Math.atan2(Yd.x+58,Yd.z+80)},ef=[-1,1].map(e=>({x:Xd.x-Zd[0]*25+Zd[1]*8*e,z:Xd.z-Zd[1]*25-Zd[0]*8*e,r:9,h:46})),Q={lane:-118,laneHalf:5,z0:-18,z1:24,houseW:7,houseD:7,rock:{x:-154,z:2,r:22,h:72},dome:{x:-140,z:6}},tf=[-1,1].flatMap(e=>[-14,-6,2,10,18].map(t=>({x:Q.lane+e*(Q.laneHalf+Q.houseW/2),z:t,hx:Q.houseW/2,hz:Q.houseD/2-.4,side:e}))),nf={x0:-136,x1:-100,z0:-24,z1:30,soft:10,cap:.42},$={x:-92,z:14,hx:5.5,hz:8},rf={x:-74,z:20},af={x:-68,z:30,r:6},of={x:-62,z:34,heading:Math.atan2(-1,-.4)},sf={x:60,z:32,r:7,h:34},cf={x:-38,z:40,heading:.6},lf={x:-14,z:44},uf={x:zd.x+1,z:zd.z-8,r:6},df={x:-50,z:-60,heading:Math.atan2(50,150)},ff={x:60,z:76,heading:Math.PI/2,half:7},pf={x:ff.x-1,z:ff.z,r:6},mf={x:ff.x-15,z:ff.z,heading:-Math.PI/2},hf=[{x:ff.x+6,z:ff.z-15,r:7,h:38},{x:ff.x+6,z:ff.z+15,r:7,h:33},{x:ff.x+24,z:ff.z-6,r:11,h:52},{x:ff.x+22,z:ff.z+10,r:10,h:46}],gf={x:-6,z:-20,rx:54,rz:40,period:56},_f={x:0,z:-40,r:205},vf=[...Cf(),sf],yf=wf();Tf();function bf([e,t]){let n=Math.hypot(e,t)||1;return[e/n,t/n]}function xf(e){let t=e;return()=>((t=t*16807%2147483647)-1)/2147483646}function Sf(e,t,n,r,i,a){let o=i-n,s=a-r,c=Math.max(0,Math.min(1,((e-n)*o+(t-r)*s)/(o*o+s*s||1)));return Math.hypot(e-(n+o*c),t-(r+s*c))}function Cf(){let e=xf(20261018),t=[],n=[[Bd.x,Bd.z,22],[Rd.x,Rd.z0,18],[Vd.x,Vd.z,Vd.outer+16],[Gd.x,Gd.z,22],[Yd.x,Yd.z,Yd.buoys+14],[Xd.x,Xd.z,26],[Qd.x,Qd.z,14],[Q.lane,(Q.z0+Q.z1)/2,40],[Q.rock.x,Q.rock.z,Q.rock.r+12],[$.x,$.z,22],[rf.x,rf.z,16],[af.x,af.z,14],[sf.x,sf.z,sf.r+14],[cf.x,cf.z,14],[lf.x,lf.z,10],[df.x,df.z,14],[of.x,of.z,12]],r=[[[Bd.x,Bd.z],[Gd.x,Gd.z+6]],[[Bd.x,Bd.z],[Qd.x,Qd.z]],[[Gd.x,Gd.z],[Qd.x,Qd.z]],[[Bd.x,Bd.z],[af.x,af.z]],[[af.x,af.z],[Qd.x,Qd.z]],[[af.x,af.z],[Gd.x,Gd.z+6]],[[df.x,df.z],[uf.x,uf.z]]];for(let i=0;t.length<26&&i<4e3;i++){let i=(e()*2-1)*180,a=-200+e()*260,o=5+e()*8;if(Math.hypot(i-_f.x,a-_f.z)>_f.r-o-12||a>78||n.some(([e,t,n])=>Math.hypot(i-e,a-t)<n+o)||r.some(([e,t])=>Sf(i,a,e[0],e[1],t[0],t[1])<o+9))continue;let s=Math.hypot((i-gf.x)/gf.rx,(a-gf.z)/gf.rz);Math.abs(s-1)<(o+10)/Math.min(gf.rx,gf.rz)||t.some(e=>Math.hypot(i-e.x,a-e.z)<o+e.r+10)||t.push({x:i,z:a,r:o,h:22+e()*34+o})}return t}function wf(){let e=[];for(let[t,n]of[[21,17],[29,23]])for(let r=0;r<n;r++){let i=r/n*Math.PI*2,a=Vd.x+Math.sin(i)*t,o=Vd.z+Math.cos(i)*t,s=5.5;Math.abs(a-Hd.x)<s+Hd.half+.3&&o>Vd.z||e.push({x:a,z:o,r:s,h:Vd.h+r*7%5*1.6})}for(let t of[-1,1])for(let n=Hd.z1+1;n<=Hd.z0-.5;n+=3.5)e.push({x:Hd.x+t*(Hd.half+.3+3),z:n,r:3,h:Vd.h-1});return e}function Tf(){let e=xf(77),t=[];for(let n=0;n<46;n++){let r=n/46*Math.PI*2+e()*.1,i=270+e()*220,a=_f.x+Math.sin(r)*i,o=_f.z+Math.cos(r)*i;o>118||t.push({x:a,z:o,r:14+e()*26,h:50+e()*90})}return t}var Ef=`#C3B8D2`,Df=`#8E829F`,Of=`#6F6484`,kf=`#7CCB8C`,Af=`#5BB27A`,jf=`#FBE7B8`,Mf=`#D59A6E`,Nf=`#8C6A55`;function Pf(e,t={}){let n=t.seg??12,r=e.h,i=Math.abs(Math.sin(e.x*12.9898+e.z*78.233)),a=1.4,o=[K.cyl(e.r*.86,e.r*.82,a,Of,{at:[e.x,a/2-.2,e.z]},n),K.cyl(e.r*(.9+i*.2),e.r,r*.62,Ef,{at:[e.x,a+r*.31,e.z]},n),K.cyl(e.r*(.75+i*.15),e.r*(.9+i*.2),r*.3,Ef,{at:[e.x,a+r*.62+r*.15,e.z]},n),K.cyl(e.r*.45,e.r*.55,r*(.35+i*.3),Df,{at:[e.x+Math.cos(i*9)*e.r*.62,a+r*.25,e.z+Math.sin(i*9)*e.r*.62]},8),...[0,1,2].map(t=>{let n=i*7+t*2.1;return K.box(e.r*.09,r*(.35+.1*t),e.r*.09,`#AFA3C2`,{at:[e.x+Math.cos(n)*e.r*.93,a+r*(.55-.05*t),e.z+Math.sin(n)*e.r*.93],rot:[0,-n,0]})})];if(t.cap!==!1){let t=a+r*.92;o.push(K.sphere(e.r*(.85+i*.2),kf,{at:[e.x,t,e.z],scale:[1,.42,1]},10),K.sphere(e.r*.45,Af,{at:[e.x+e.r*.35,t+e.r*.25,e.z-e.r*.2],scale:[1,.7,1]},8),K.sphere(e.r*.3,Af,{at:[e.x-Math.sin(i*5)*e.r*.8,a+r*.6,e.z+Math.cos(i*5)*e.r*.8],scale:[1,.7,1]},8))}return o}function Ff(e){let t=new re(e.r*.86,e.r*.86+.7+e.r*.05,24);return t.rotateX(-Math.PI/2),t.translate(e.x,.03,e.z),t}function If(e,t,n,r){let i=new j,a=new B(e.add(new $t(r*.55,r*.7,26,20,1,!0)),e.add(new gt({color:G.gold,transparent:!0,opacity:.22,depthWrite:!1})));a.position.y=13;let o=new B(e.add(new re(r*.75,r,32)),e.add(new gt({color:G.gold,transparent:!0,opacity:.7,depthWrite:!1})));return o.rotation.x=-Math.PI/2,o.position.y=.04,i.add(a,o),i.position.set(t,0,n),i}function Lf(e){let t=new j;t.add(J(q(vf.flatMap(e=>Pf(e))),e,2.5));let n=new B(e.add(q(vf.map(Ff))),e.add(new gt({color:`#FFFFFF`,transparent:!0,opacity:.75,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2})));t.add(n),[[290,`#B4AACB`,60],[380,`#C6BEDB`,85],[500,`#D6D1E8`,110]].forEach(([n,r,i],a)=>{let o=[],s=22+a*6;for(let e=0;e<s;e++){let t=e/s*Math.PI*2+a*.37,r=_f.x+Math.sin(t)*n,c=_f.z+Math.cos(t)*n;if(c>88&&Math.abs(r)<260)continue;let l=26+(e*37+a*11)%30,u=i*(.55+(e*53+a*7)%45/100),d=new Ee;d.moveTo(-l/2,-2),d.lineTo(-l/2+l*.06,u*.75);for(let t=0;t<=6;t++){let n=-l/2+l*.06+t/6*l*.88;d.lineTo(n,u*(.82+.18*Math.sin(t*1.9+e)))}d.lineTo(l/2,-2),d.closePath();let f=new le(d,4);f.rotateY(Math.atan2(_f.x-r,_f.z-c)),f.translate(r,0,c),o.push(f)}t.add(new B(e.add(q(o)),e.add(new gt({color:r,side:2,fog:!0}))))});let r=[K.box(700,1.2,160,jf,{at:[0,.2,188]}),K.box(Rd.w,.16,Rd.z1-Rd.z0,Mf,{at:[Rd.x,.95,(Rd.z0+Rd.z1)/2]}),...Array.from({length:Math.floor((Rd.z1-Rd.z0)/.6)},(e,t)=>K.box(Rd.w+.02,.02,.05,`#B97E55`,{at:[Rd.x,1.035,Rd.z0+.3+t*.6]}))];for(let e=Rd.z0+.5;e<Rd.z1;e+=3)for(let t of[-1,1])r.push(K.cyl(.13,.13,1.4,Nf,{at:[Rd.x+t*(Rd.w/2-.2),.3,e]},6));r.push(...[-1,1].flatMap(e=>[0,1].map(t=>K.cyl(.1,.1,2.4,Nf,{at:[Rd.x+e*1.2,2.2,Rd.z1-3-t*2.6]},6))),K.box(3.2,.12,3.6,G.hotpink,{at:[Rd.x,3.5,Rd.z1-4.3],rot:[0,0,.08]}),K.box(3.2,.12,3.6,`#E2407F`,{at:[Rd.x,3.5,Rd.z1-4.3],rot:[0,0,-.08]}));for(let e=0;e<18;e++){let t=-170+e*20+e*37%9,n=118+e*53%14;if(r.push(K.sphere(14+e%3*4,e%2?kf:Af,{at:[t,0,n+18],scale:[1,.5,.8]},10)),e%2==0){r.push(K.cyl(.25,.32,6,`#B08463`,{at:[t+6,3.4,n-4],rot:[0,0,.12]},6));for(let e=0;e<4;e++)r.push(K.cone(.9,3.4,Af,{at:[t+6.7+Math.sin(e*1.57)*1.2,6.4,n-4+Math.cos(e*1.57)*1.2],rot:[Math.cos(e*1.57)*1.3,0,-Math.sin(e*1.57)*1.3]},5))}}for(let[e,t]of[-30,-22,16,26].entries()){let n=[G.sky,G.mint,G.butter,G.lavender][e];r.push(K.rbox(1.2,.5,5.6,.22,n,{at:[t,.15,107.4],rot:[0,.3-e*.2,0]}),K.box(1.24,.08,5,G.hotpink,{at:[t,.36,107.4],rot:[0,.3-e*.2,0]}))}r.push(K.rbox(2.6,.3,3.4,.1,Mf,{at:[Gd.x+2,.12,Gd.z+.6]})),t.add(J(q(r),e,2));let i={village:If(e,af.x,af.z,af.r*.7),cave:If(e,Jd.x,Jd.z,Jd.r*.7),beach:If(e,Qd.x,Qd.z,Qd.r*.7),pier:If(e,uf.x,uf.z,uf.r*.7),out:If(e,Wd.x,Wd.z,Wd.r*.7),race:If(e,pf.x,pf.z,pf.r*.7)};return t.add(...Object.values(i)),{root:t,glows:i}}var Rf=[{id:`needlefish`,label:`Needlefish`,kind:`thing`},{id:`eagle`,label:`Sea eagle`,kind:`thing`},{id:`coconut`,label:`Coconut`,kind:`thing`},{id:`macaque`,label:`Macaques`,kind:`thing`},{id:`fisher`,label:`Fisherman`,kind:`thing`},{id:`notch-crab`,label:`Crab`,kind:`thing`},{id:`sunglasses`,label:`Daddy's sunglasses`,kind:`thing`},{id:`hat`,label:`Mommy's hat`,kind:`thing`},{id:`duck`,label:`Rubber duck`,kind:`thing`}],zf=new V,Bf={species:`buffalo`,height:1.5,fur:`#A79A8A`,light:`#E8DFD2`,dark:`#5E5468`,ear:`#FFB8CC`,outfit:{kind:`shirt`,color:`#8EC9F5`}},Vf=new V(-.85,0,.53).normalize(),Hf=new V(sf.x+Vf.x*(sf.r+.5),3.2,sf.z+Vf.z*(sf.r+.5)),Uf=3,Wf=[-.55,.55,-2.9],Gf=class{bay;fish;skip=null;nextSkip=6;eagle;eagleFish;eagleT=0;swoop=null;nextSwoop=14;orbit=new V(0,0,40);coconut;nut={x:lf.x,z:lf.z,vx:0,vz:0,spin:0,in:!1};scoop=null;monkeys;flips=[-1,-1,-1];heist=null;snack;snackGone=!1;fisher;fishingBoat=new j;net;netT=-1;nextNet=8;waveT=-1;crab;crabT=-1;crabAt=new V;crabOut=new V;shades;shadesUp=!0;hat;floaters=new Map;duck=null;duckPos=new V;duckVel=new V;duckSpin=0;duckSet=!1;rope=null;constructor(e){this.bay=e;let{bag:t,scene:n}=e;this.fish=[0,1,2].map(()=>{let e=hd(t);return e.root.scale.setScalar(1.4),e.root.visible=!1,n.add(e.root),e}),this.eagle=fd(t,`eagle`),this.eagle.root.scale.setScalar(1.5),n.add(this.eagle.root),this.eagleFish=new j,this.eagleFish.add(J(q([K.capsule(.07,.25,`#B8E6D8`,{rot:[Math.PI/2,0,0]}),K.cone(.08,.12,`#7FCDB5`,{at:[0,0,-.22],rot:[-Math.PI/2,0,0],scale:[.2,1,1]},6)]),t,1.5)),this.eagleFish.position.set(0,-.3,.1),this.eagleFish.visible=!1,this.eagle.root.add(this.eagleFish),this.coconut=new j,this.coconut.add(J(q([K.sphere(.32,`#8C5E3C`,{scale:[1,.9,1.05]},14),...[0,1,2].map(e=>K.sphere(.05,`#5A3A26`,{at:[Math.sin(e*2.1)*.12,.27,Math.cos(e*2.1)*.12]},6))]),t,2)),n.add(this.coconut);let r=J(K.cyl(1.9,1.5,.5,`#B3A8C6`,{at:[Hf.x,Hf.y-.25,Hf.z],scale:[1,1,.75]},12),t,2);n.add(r),this.monkeys=[0,1,2].map(e=>{let r=pd(t),i=new V(-Vf.z,0,Vf.x);return r.root.position.copy(Hf).addScaledVector(i,(e-1)*.9).addScaledVector(Vf,e===1?.4:0),r.root.rotation.y=Math.atan2(Vf.x,Vf.z)+(e-1)*.3,r.root.scale.setScalar(e===1?1.3:1.1),n.add(r.root),r});let i=e.packed.includes(`mango`);this.snack=i?Cl(`mango`,t):this.banana(),this.snack.scale.setScalar(1.6),this.snack.position.set(...Nd.mango),e.rides.longtail.v.cargo.add(this.snack),this.fishingBoat.add(J(q([K.rbox(1.3,.5,3.8,.2,`#7FB2E8`,{at:[0,.15,0]}),K.box(1.34,.08,3.3,G.butter,{at:[0,.38,0]}),K.box(1.1,.06,3,`#F6D3AE`,{at:[0,.42,0]}),K.rbox(.36,.5,.36,.08,`#FFFFFF`,{at:[0,.5,-1.2]})]),t,2)),this.fisher=yo(Bf,t),this.fisher.root.position.set(.1,.45,.6),this.fisher.root.rotation.y=Math.PI/2,this.fisher.head.add(J(K.cone(.55,.32,`#F2D38B`,{at:[0,.75,0]},16),t,2)),this.fishingBoat.add(this.fisher.root),this.net=new j;let a=[];for(let e=0;e<=4;e++)a.push(K.box(1.4,.03,.03,`#E8E0F4`,{at:[0,e*.3,0]}),K.box(.03,1.2,.03,`#E8E0F4`,{at:[-.7+e*.35,.6,0]}));a.push(...[-.3,.1,.4].map((e,t)=>K.capsule(.08,.25,[`#FFB3C7`,`#B8E6D8`,`#FFD27A`][t],{at:[e,.25,.08],rot:[0,0,Math.PI/2]}))),this.net.add(J(q(a),t,1.5)),this.net.position.set(1.2,-1.4,.4),this.fishingBoat.add(this.net),this.fishingBoat.position.set(cf.x,0,cf.z),this.fishingBoat.rotation.y=cf.heading,n.add(this.fishingBoat),this.crab=ld(t,`#FF8A5C`,!1),this.crab.root.scale.setScalar(2.2),this.crab.root.visible=!1,n.add(this.crab.root);let o=e.rider(`nick`).char,s=.24*o.height;this.shades=new j,this.shades.add(J(q([...[-1,1].flatMap(e=>[K.rbox(.19,.13,.04,.04,`#3A3350`,{at:[e*.37*s,0,0],rot:[0,e*.35,0]}),K.box(.05,.03,.03,G.hotpink,{at:[e*.48*s,.05,-.02]})]),K.box(.1,.03,.03,G.hotpink,{at:[0,.03,.01]})]),t,1.5)),this.shades.position.set(0,s*.92+.12*s,s*.93),o.rig.head.add(this.shades);let c=e.rider(`ji`).char,l=.24*c.height;this.hat=new j,this.hat.add(J(q([K.cyl(l*1.4,l*1.4,.03,G.butter,{},24),K.cyl(l*.7,l*.78,.2,G.butter,{at:[0,.1,0]},20),K.cyl(l*.79,l*.79,.05,G.hotpink,{at:[0,.04,0]},20),K.sphere(.07,`#FFFFFF`,{at:[l*.7,.1,.1]},8)]),t,1.5)),this.hat.position.set(0,l*.92+.6*l,-.04*l),this.hat.rotation.x=-.12,c.rig.head.add(this.hat);let u=e.rides.longtail.v.cargo;if(e.packed.includes(`teddy`)){let e=Cl(`teddy`,t);e.scale.setScalar(1.3),e.position.set(...Nd.teddy),u.add(e)}if(e.packed.includes(`bucket`)){let e=Cl(`bucket`,t);e.scale.setScalar(1.5),e.position.set(...Nd.bucket),e.name=`bucket`,u.add(e)}if(e.packed.includes(`duck`)){this.duck=Cl(`duck`,t),this.duck.scale.setScalar(2),n.add(this.duck);let e=t.add(new Gt);e.setAttribute(`position`,new ce(new Float32Array(6),3)),this.rope=new ut(e,t.add(new Wt({color:G.ink}))),this.rope.frustumCulled=!1,n.add(this.rope)}}banana(){let e=new j;return e.add(J(q([K.torus(.12,.035,`#FFD84D`,{at:[0,.05,0],rot:[Math.PI/2,0,.4]},Math.PI*.8),K.cyl(.012,.012,.05,`#7A5A3A`,{at:[.11,.06,.05]},5)]),this.bay.bag,1.5)),e}get lt(){return this.bay.rides.longtail}get out(){return this.bay.using===`longtail`&&this.bay.phase===`drive`}anchorAt(e){let t=this.bay.phase===`drive`||this.bay.phase===`beach`;switch(e){case`needlefish`:return this.skip&&this.fish[1].root.visible?{at:this.fish[1].root.position.clone(),r:1.2,prio:3}:null;case`eagle`:return t&&this.bay.using===`longtail`?{at:this.eagle.root.position.clone(),r:1.4,prio:3,max:120}:null;case`coconut`:return!this.nut.in&&this.out?{at:this.coconut.position.clone().setY(.4),r:.6,prio:3,max:110}:null;case`macaque`:return t?{at:Hf.clone().setY(Hf.y+.9),r:1.6,prio:3}:null;case`fisher`:return t?{at:zf.set(0,1.2,.4).applyMatrix4(this.fishingBoat.matrixWorld).clone(),r:1.4,prio:3}:null;case`notch-crab`:return this.crabT>=0?{at:this.crab.root.position.clone().setY(this.crab.root.position.y+.4),r:.6,prio:3}:null;case`sunglasses`:case`hat`:{let t=this.floaters.get(e);return t&&t.t>=1&&this.out?{at:t.g.position.clone().setY(.4),r:.6,prio:3,glow:!0}:null}case`duck`:return this.duck&&this.bay.using===`longtail`?{at:this.duck.position.clone().setY(.5),r:.5,prio:3,max:100}:null}return null}tap(e){let t=this.bay;switch(e){case`needlefish`:return t.found(`needlefish`,this.fish[1].root.position),X.splash(.4),!0;case`eagle`:return this.swoop||this.startSwoop(),X.peep(),t.found(`eagle`,this.eagle.root.position),!0;case`coconut`:return t.driveTo(this.nut.x,this.nut.z),this.nut.spin+=2,X.boop(),!0;case`macaque`:{X.chatter();let e=Math.floor(Math.random()*3);return this.flips[e]<0&&(this.flips[e]=0),t.found(`macaque`,Hf),!0}case`fisher`:return this.waveT=0,this.netT<0&&(this.netT=0),X.toot(),!0;case`notch-crab`:return this.crabT=Math.min(this.crabT,.5),this.crab.claw.rotation.z=1,X.pop(),!0;case`sunglasses`:case`hat`:{let n=this.floaters.get(e);return n&&t.driveTo(n.g.position.x,n.g.position.z),!0}case`duck`:return this.duckSpin=1,X.chirp(),!0}return!1}bonked(e,t,n){let r=this.bay;if(r.using!==`longtail`)return;n>3.2&&!this.floaters.has(`sunglasses`)&&this.shades.parent&&r.phase===`drive`&&this.overboard(`sunglasses`);let i=vf.find(n=>Math.abs(Math.hypot(e-n.x,t-n.z)-n.r)<2.5);if(i&&this.crabT<0){let n=Math.atan2(e-i.x,t-i.z);this.crabAt.set(i.x+Math.sin(n)*i.r*.82,.55,i.z+Math.cos(n)*i.r*.82),this.crabOut.set(i.x+Math.sin(n)*(i.r*.82+.6),.55,i.z+Math.cos(n)*(i.r*.82+.6)),this.crab.root.rotation.y=n,this.crabT=0,r.once(`notch`,h.bay.facts.notch)}}jumped(e){e>4.3&&!this.floaters.has(`hat`)&&this.hat.parent&&this.overboard(`hat`)}overboard(e){let t=this.bay,n=e===`sunglasses`?this.shades:this.hat,r=n.getWorldPosition(new V),i=n.clone();i.rotation.set(0,0,0),i.scale.setScalar(e===`sunglasses`?1.6:1.3),n.removeFromParent(),t.scene.add(i);let a=this.lt.d,o=Math.random()<.5?-1:1,s=e===`hat`?-6:-1.5,c=e=>new V(a.x+Math.sin(a.heading)*s+Math.cos(a.heading)*e*3.5,.05,a.z+Math.cos(a.heading)*s-Math.sin(a.heading)*e*3.5),l=e=>[...vf,...yf,...ef,Q.rock].some(t=>Math.hypot(e.x-t.x,e.z-t.z)<t.r+2)||tf.some(t=>Math.abs(e.x-t.x)<t.hx+1.5&&Math.abs(e.z-t.z)<t.hz+1.5)||Math.hypot(e.x-Yd.x,e.z-Yd.z)<Yd.buoys+2||Math.abs(e.x-$.x)<$.hx+1.5&&Math.abs(e.z-$.z)<$.hz+1.5,u=c(o);l(u)&&(u=c(-o)),l(u)&&(u=c(0).setX(a.x-Math.sin(a.heading)*5).setZ(a.z-Math.cos(a.heading)*5)),this.floaters.set(e,{g:i,t:0,from:r,to:u}),t.say(e===`sunglasses`?h.bay.sunglasses:h.bay.hat),X.whoosh(.5)}somethingToSee(){let e=this.lt.d,t=[[`eagle`,this.eagle.root.position],[`macaque`,Hf],[`needlefish`,this.fish[1].root.position]],n=t.filter(([e])=>!this.bay.has(e));return(n.length?n:t).sort((t,n)=>t[1].distanceTo(zf.set(e.x,0,e.z))-n[1].distanceTo(zf.set(e.x,0,e.z)))[0]?.[1]??null}bumps(e,t,n,r){if(Math.abs(cf.x-e)<14&&Math.abs(cf.z-t)<14){let e=Math.sin(cf.heading),t=Math.cos(cf.heading);for(let r of[-1.2,0,1.2])n.push([cf.x+e*r,cf.z+t*r,.8])}}update(e,t){let n=this.bay,r=this.lt.d,i=n.rig.camera.position,a=Math.hypot(i.x-Hf.x,i.z-Hf.z)<160;for(let e of this.monkeys)e.root.visible=a||this.heist!==null;this.fisher.root.visible=Math.hypot(i.x-cf.x,i.z-cf.z)<160,this.hat.visible=n.using===`longtail`,this.updateNeedlefish(e,t),this.updateEagle(e,t),this.updateCoconut(e,t),this.updateMonkeys(e,t),this.updateFisher(e,t),this.updateCrab(e),this.updateFloaters(e,t),this.updateDuck(e,t),n.using===`longtail`&&Math.hypot(r.x-Hf.x,r.z-Hf.z)<20&&n.found(`macaque`,Hf)}updateNeedlefish(e,t){let n=this.bay,r=this.lt.d;if(this.nextSkip-=e,!this.skip&&this.nextSkip<=0&&this.out&&!n.section.startsWith(`village`)){this.nextSkip=8+Math.random()*6;let e=12+Math.random()*6,t=Math.random()<.5?-1:1,n=Math.sin(r.heading),i=Math.cos(r.heading);this.skip={t:0,x:r.x+n*e+i*t*6,z:r.z+i*e-n*t*6,dx:-i*t,dz:n*t}}let i=this.skip;if(!i)return;i.t+=e;let a=.55,o=!1;this.fish.forEach((t,n)=>{let r=i.t-n*.18,s=Math.floor(r/a),c=r%a/a,l=r>0&&s<5;if(t.root.visible=l,!l)return;o=!0;let u=(s+c)*2.6;t.root.position.set(i.x+i.dx*u+i.dz*(n-1)*.7,Math.sin(c*Math.PI)*.8-.05,i.z+i.dz*u-i.dx*(n-1)*.7),t.root.rotation.set(-Math.cos(c*Math.PI)*.6,Math.atan2(i.dx,i.dz),0),t.blink.update(e),c<.1&&s>0&&Math.random()<.5&&this.bay.foam.emit(t.root.position.x,.03,t.root.position.z,0,0,0,1,.7)}),i.t<.1&&X.splash(.25),Math.hypot(this.fish[1].root.position.x-r.x,this.fish[1].root.position.z-r.z)<22&&this.fish[1].root.visible&&n.found(`needlefish`,this.fish[1].root.position),!o&&i.t>1&&(this.skip=null)}startSwoop(){let e=this.lt.d,t=Math.random()<.5?-1:1,n=9+Math.random()*4,r=e.x+Math.sin(e.heading)*n+Math.cos(e.heading)*t*5,i=e.z+Math.cos(e.heading)*n-Math.sin(e.heading)*t*5;this.swoop={t:0,x:r,z:i,from:this.eagle.root.position.clone()}}updateEagle(e,t){let n=this.bay,r=this.lt.d,i=this.eagle;i.blink.update(e);let a=zf.set(r.x+Math.sin(r.heading)*22,0,r.z+Math.cos(r.heading)*22);this.orbit.lerp(a,1-Math.exp(-e*.25)),this.nextSwoop-=e,!this.swoop&&this.nextSwoop<=0&&this.out&&(this.nextSwoop=18+Math.random()*8,this.startSwoop());let o=this.swoop;if(o){o.t+=e/3.2;let a=Math.min(1,o.t),s=zf.set(o.x,.4,o.z);if(a<.45){let e=a/.45;i.root.position.lerpVectors(o.from,s,e*e),i.wingL.rotation.z=i.wingR.rotation.z=0,i.wingL.rotation.z=.9*e,i.wingR.rotation.z=-.9*e}else{this.eagleFish.visible||(this.eagleFish.visible=!0,X.splash(.6),n.spray.burst(o.x,.2,o.z,12,2.5,3.5,.2),Math.hypot(o.x-r.x,o.z-r.z)<25&&n.found(`eagle`,i.root.position));let e=(a-.45)/.55,s=zf.set(o.x+(o.x-o.from.x)*.4*e,.4+e*13,o.z+(o.z-o.from.z)*.4*e);i.root.position.lerp(s,.2);let c=Math.sin(t*14)*.7;i.wingL.rotation.z=c,i.wingR.rotation.z=-c}let c=zf.copy(s).sub(i.root.position);i.root.rotation.set(0,Math.atan2(c.x,c.z)+(a>.45?Math.PI:0),0),a>=1&&(this.swoop=null,setTimeout(()=>this.eagleFish.visible=!1,2500));return}this.eagleT+=e*.35;let s=this.eagleT,c=this.orbit.x+Math.sin(s)*16,l=this.orbit.z+Math.cos(s)*16,u=13+Math.sin(s*2)*1.5;i.root.position.lerp(zf.set(c,u,l),1-Math.exp(-e*2)),i.root.rotation.set(0,s+Math.PI/2,-.35);let d=Math.sin(t*6)>.7?Math.sin(t*16)*.5:.08;i.wingL.rotation.z=d,i.wingR.rotation.z=-d}updateCoconut(e,t){let n=this.bay,r=this.nut,i=this.coconut;if(this.scoop){this.scoop.t+=e/.6;let t=Math.min(1,this.scoop.t),n=this.lt.v.body.localToWorld(zf.set(...Nd.coconut));i.position.lerpVectors(this.scoop.from,n,t),i.position.y+=c(t)*1.2,t>=1&&(this.scoop=null,i.removeFromParent(),i.position.set(...Nd.coconut),i.rotation.set(0,0,0),i.scale.setScalar(.8),this.lt.v.cargo.add(i));return}if(r.in)return;r.x+=r.vx*e,r.z+=r.vz*e,r.vx*=Math.exp(-e*.8),r.vz*=Math.exp(-e*.8),r.spin*=Math.exp(-e);let a=this.lt.d;if(n.using===`longtail`&&n.phase===`drive`)for(let e of this.lt.v.hull.at){let t=a.x+Math.sin(a.heading)*e,o=a.z+Math.cos(a.heading)*e,s=r.x-t,c=r.z-o,l=Math.hypot(s,c),u=this.lt.v.hull.r+.35;if(l<u&&l>1e-4){if(Math.abs(a.speed)<4.2){r.in=!0,this.scoop={t:0,from:i.position.clone()},X.scoop(),n.strike(n.rider(`ji`),`point`,.8),n.say(h.bay.coconut);return}let e=s/l,d=c/l;r.x=t+e*u,r.z=o+d*u;let f=Math.max(2,Math.abs(a.speed)*1.1);r.vx=e*f+a.vx*.5,r.vz=d*f+a.vz*.5,r.spin=6,X.boop(),n.spray.burst(r.x,.2,r.z,6,2,2.5,.16)}}i.position.set(r.x,wd(r.x,r.z,t)+.12,r.z),i.rotation.y+=r.spin*e,i.rotation.z=Math.sin(t*1.7)*.15}updateMonkeys(e,t){let n=this.bay,r=this.lt.d;this.monkeys.forEach((n,i)=>{if(n.blink.update(e),n.root.lookAt(r.x,n.root.position.y,r.z),n.armR.rotation.x=Math.sin(t*2+i*2)*.3-.3,this.flips[i]>=0){this.flips[i]+=e/.8;let t=Math.min(1,this.flips[i]);n.body.rotation.x=-t*Math.PI*2,n.body.position.y=c(t)*.8,t>=1&&(this.flips[i]=-1,n.body.rotation.x=0,n.body.position.y=0)}});let i=Math.hypot(r.x-Hf.x,r.z-Hf.z)<22;!this.heist&&!this.snackGone&&i&&n.using===`longtail`&&n.phase===`drive`&&(this.heist={t:0,phase:`out`,from:this.monkeys[1].root.position.clone()},X.chatter());let a=this.heist;if(!a)return;let o=this.monkeys[1];a.t+=e/(a.phase===`eat`?4:.9);let s=Math.min(1,a.t);if(a.phase===`out`){let e=this.lt.v.body.localToWorld(zf.set(Nd.mango[0],Nd.mango[1]+.1,Nd.mango[2]));o.root.position.lerpVectors(a.from,e,s),o.root.position.y+=c(s)*2.5,s>=1&&(o.root.position.copy(e),o.armR.add(this.snack),this.snack.position.set(0,-.3,.1),this.snack.scale.setScalar(1.2),n.say(this.bay.packed.includes(`mango`)?h.bay.mango:h.bay.banana),n.rider(`nick`).char.react(`hop`),n.strike(n.rider(`nick`),`point`,1.6),X.chatter(),a.phase=`back`,a.t=0,a.from=e.clone())}else if(a.phase===`back`){let e=Hf.clone().addScaledVector(Vf,.4);o.root.position.lerpVectors(a.from,e,s),o.root.position.y+=c(s)*2.5,s>=1&&(a.phase=`eat`,a.t=0,this.snackGone=!0,n.found(`macaque`,Hf))}else this.snack.scale.setScalar(1.2*(1-s)),o.armR.rotation.x=-1.8+Math.sin(t*10)*.2,Math.floor(a.t*8)!==Math.floor((a.t-e/4)*8)&&X.crunch(),s>=1&&(this.snack.removeFromParent(),this.heist=null)}updateFisher(e,t){let n=this.bay;if(this.fishingBoat.position.y=wd(cf.x,cf.z,t),this.fishingBoat.rotation.z=Math.sin(t*1.2)*.03,this.nextNet-=e,this.netT<0&&this.nextNet<=0&&(this.nextNet=11+Math.random()*5,this.netT=0),this.netT>=0){this.netT+=e/3.2;let t=Math.min(1,this.netT),r=c(Math.min(1,t*1.25));if(this.net.position.y=-1.4+r*1.9,this.fisher.armR.rotation.x=-1.2*r,this.fisher.armL.rotation.x=-1.2*r,r>.9&&Math.random()<e*4){X.flop();let e=this.net.getWorldPosition(zf);n.spray.burst(e.x,.8,e.z,3,1.5,2,.12)}t>=1&&(this.netT=-1)}if(this.waveT>=0){this.waveT+=e/1.4;let t=Math.min(1,this.waveT);this.fisher.armL.rotation.z=-(2.4+Math.sin(t*30)*.3)*c(t),t>=1&&(this.waveT=-1,this.fisher.armL.rotation.z=0)}}updateCrab(e){if(this.crabT<0)return;this.crabT+=e;let t=this.crab;t.blink.update(e);let n=r(this.crabT/.4,0,1)*(1-r((this.crabT-2.6)/.4,0,1));t.root.visible=n>.01,t.root.position.lerpVectors(this.crabAt,this.crabOut,n),t.root.scale.setScalar(2.2*Math.max(.01,n)),t.claw.rotation.z=Math.sin(this.crabT*14)*.5*n,this.crabT>3&&(this.crabT=-1,t.root.visible=!1)}updateFloaters(e,t){let n=this.bay,r=this.lt.d;for(let[i,a]of this.floaters){if(a.t<1){a.t+=e/.8;let t=Math.min(1,a.t);a.g.position.lerpVectors(a.from,a.to,t),a.g.position.y+=c(t)*2.2,a.g.rotation.x+=e*8,t>=1&&(X.plop(),n.foam.emit(a.to.x,.03,a.to.z,0,0,0,1.4,1.2),a.g.rotation.set(i===`hat`?0:-Math.PI/2,0,0));continue}a.g.position.y=wd(a.to.x,a.to.z,t)+.05,a.g.rotation.y+=e*.4,n.using===`longtail`&&n.phase===`drive`&&this.lt.v.hull.at.some(e=>Math.hypot(r.x+Math.sin(r.heading)*e-a.to.x,r.z+Math.cos(r.heading)*e-a.to.z)<1.8)&&(this.floaters.delete(i),a.g.removeFromParent(),X.scoop(),X.giggle(),i===`sunglasses`?(this.shadesUp=!this.shadesUp,this.shades.rotation.z=this.shadesUp?0:Math.PI,n.rider(`nick`).char.rig.head.add(this.shades),n.rider(`nick`).char.react(`hop`)):(n.rider(`ji`).char.rig.head.add(this.hat),n.rider(`ji`).char.react(`hop`)))}}updateDuck(e,t){let n=this.duck;if(!n||!this.rope)return;let r=this.lt,i=this.bay.using===`longtail`;if(n.visible=this.rope.visible=i,!i)return;let a=r.v.body.localToWorld(zf.set(...Wf)).clone(),o=this.duckPos;this.duckSet||(this.duckSet=!0,o.set(a.x-Math.sin(r.d.heading+.5)*Uf,0,a.z-Math.cos(r.d.heading+.5)*Uf)),this.duckVel.multiplyScalar(Math.exp(-e*1.5)),o.addScaledVector(this.duckVel,e);let s=o.x-a.x,l=o.z-a.z,u=Math.hypot(s,l);if(u>Uf){let t=s/u,n=l/u,r=a.x+t*Uf,i=a.z+n*Uf;this.duckVel.x=(r-o.x)/Math.max(e,.001)*.6,this.duckVel.z=(i-o.z)/Math.max(e,.001)*.6,o.x=r,o.z=i}this.duckSpin=Math.max(0,this.duckSpin-e),n.position.set(o.x,wd(o.x,o.z,t)+.02+c(Math.min(1,this.duckSpin))*.5,o.z),n.rotation.set(0,Math.atan2(a.x-o.x,a.z-o.z)-Math.PI/2+this.duckSpin*12,Math.sin(t*2.3)*.12);let d=this.rope.geometry.attributes.position;d.setXYZ(0,a.x,a.y,a.z),d.setXYZ(1,o.x,n.position.y+.3,o.z),d.needsUpdate=!0}qa(){return{coconut:this.nut.in,snack:this.snackGone?`stolen`:`in the boat`,shades:this.floaters.has(`sunglasses`)?`floating`:this.shadesUp?`on`:`upside down`,hat:this.floaters.has(`hat`)?`floating`:`on`}}},Kf=[{id:`wave`,icon:`👋`,label:`Wave`},{id:`cheer`,icon:`🙌`,label:`Cheer`},{id:`heart`,icon:`🫶`,label:`Heart`},{id:`silly`,icon:`🤪`,label:`Silly`}];function qf(e,t,n,r){let{armL:i,armR:a,head:o,body:s,eyes:c}=e,l=r*r*(3-2*r),u=(e,t,n,r)=>{i.rotation.x+=(e-i.rotation.x)*l,i.rotation.z+=(t-i.rotation.z)*l,a.rotation.x+=(n-a.rotation.x)*l,a.rotation.z+=(r-a.rotation.z)*l};switch(t){case`wave`:u(0,-.25,-.2,2.5+Math.sin(n*12)*.35);break;case`cheer`:u(-.15,-2.15+Math.sin(n*9)*.15,-.15,2.15-Math.sin(n*9)*.15);break;case`heart`:u(-.7,-1.9,-.7,1.9),o.rotation.z=Math.sin(n*3)*.08*l;break;case`silly`:u(-.6,-.9,0,1.7+Math.sin(n*10)*.2),s.rotation.z=.26*l,o.rotation.z=-.35*l,c.scale.y=1-.65*l,e.open?e.mouth.scale.set(1.15,1.6,1):(e.talk.visible=!0,e.mouth.visible=!1,e.talk.scale.set(.9,.75,1));break;case`tiller`:u(-1.25,.4,-1.25,-.4);break;case`point`:u(0,-.2,-1.55,.25);break;case`selfie`:u(0,-.2,-2.1,.55),o.rotation.z=.18*l;break;case`broom`:u(-.3,-.3,-1.6+Math.sin(n*14)*.45,.4)}}function Jf(e){e.armL.rotation.set(0,0,0),e.armR.rotation.set(0,0,0),e.body.rotation.z=0,e.head.rotation.z=0,e.mouth.scale.set(1,1,1)}var Yf=[{id:`ball`,label:`Football`,kind:`thing`},{id:`kids`,label:`The village kids`,kind:`thing`},{id:`cat`,label:`Cat`,kind:`thing`},{id:`laundry:0`,label:`Laundry`,kind:`thing`},{id:`laundry:1`,label:`Laundry`,kind:`thing`},{id:`squid`,label:`Squid drying`,kind:`thing`},{id:`dome`,label:`Golden dome`,kind:`thing`},{id:`grandma`,label:`Grandma`,kind:`thing`}],Xf=[`#FFC2A8`,`#D9CCFF`,`#BDE8D8`,`#FFE7A6`,`#FFD1E3`,`#BFE0FF`],Zf=[`#E07A8F`,`#7FB2E8`,`#9AD6B0`,`#B9A6F5`,`#F2A65A`],Qf=[{species:`buffalo`,height:.95,fur:`#C49A7A`,light:`#F2E2D0`,dark:`#6E5A4E`,ear:`#FFB8CC`,outfit:{kind:`tee`,color:`#FFD27A`,shorts:`#7FB2E8`}},{species:`fox`,height:.9,fur:`#F2B36B`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`,outfit:{kind:`tee`,color:`#FF8FB8`,shorts:`#8FE3C8`},lashes:!0},{species:`elephant`,height:.92,fur:`#B8C4E8`,light:`#E3E8F8`,dark:`#8E9BCB`,ear:`#FFB8CC`,outfit:{kind:`tee`,color:`#8FE3C8`,shorts:`#B9A6F5`}}],$f={species:`elephant`,height:1.35,fur:`#C9C2DA`,light:`#ECE8F4`,dark:`#A79FC2`,ear:`#FFC2D4`,outfit:{kind:`blouse`,color:`#FFB3CF`},extras:[`glasses`],lashes:!0},ep=[-10,6],tp=4.3,np=new V(Q.lane+Q.laneHalf+.6,2.35,10),rp={x:Q.lane+3.3,z:1.6},ip=.38,ap=new V,op=class{bay;start=of;here=!1;kids;ball;b={x:rf.x,z:rf.z,y:0,vx:0,vz:0,spin:0};goal=`loose`;goalT=0;hopFrom=new V;hopTo=new V;gift;lines=[];flapT=[-1,-1];squid;squidT=-1;cat;catT=-1;catBoat=new j;grandma;grandmaT=-1;domeT=-1;play={t:0,from:0,to:1};goals=0;playT=0;bumped=!1;hereT=0;called=!1;constructor(e){this.bay=e;let{bag:t,scene:n}=e,r=[...Pf(Q.rock)];tf.forEach((e,t)=>{let n=-e.side,i=e.x+n*.7,a=e.hx*2-1.4,o=Xf[t%Xf.length],s=Zf[t*3%Zf.length],c=2.2;for(let t of[-1,0,1])for(let n of[-1,1])r.push(K.cyl(.14,.16,2.8000000000000003,Nf,{at:[e.x+t*(e.hx-.3),c/2-.3,e.z+n*(e.hz-.3)]},6));r.push(K.box(e.hx*2,.22,e.hz*2,`#C9875C`,{at:[e.x,c,e.z]})),r.push(K.box(a,2.4,e.hz*2-.4,o,{at:[i,3.5,e.z]}));let l=i+n*(a/2+.02);r.push(K.box(.06,1.6,.9,`#B07A4A`,{at:[l,3.1,e.z-1.1]})),r.push(K.box(.06,.7,.9,`#8EC9F5`,{at:[l,3.7,e.z+1.2]}),K.box(.08,.1,1.1,`#FFFFFF`,{at:[l,3.3200000000000003,e.z+1.2]}));let u=e.x+n*(e.hx-.15);r.push(K.box(.08,.08,e.hz*2-.2,`#FFFFFF`,{at:[u,3.0500000000000003,e.z]}));for(let t=-2;t<=2;t++)r.push(K.box(.07,.75,.07,`#FFFFFF`,{at:[u,2.68,e.z+t*(e.hz-.3)*.5]}));for(let t of[-1,1])r.push(K.box(a/2+.7,.12,e.hz*2+.3,s,{at:[i+t*(a/4+.25),5.15,e.z],rot:[0,0,-t*.42]}))});let i=Q.dome;r.push(K.cyl(4.2,4.2,.3,`#C9875C`,{at:[i.x,2.2,i.z]},20));for(let e=0;e<8;e++)r.push(K.cyl(.18,.2,2.8,Nf,{at:[i.x+Math.sin(e*.785)*3.8,.9,i.z+Math.cos(e*.785)*3.8]},6));r.push(K.cyl(3,3.1,4.2,`#FFF7F0`,{at:[i.x,4.4,i.z]},20)),r.push(...Array.from({length:8},(e,t)=>K.box(.5,1.4,.08,`#8EC9F5`,{at:[i.x+Math.sin(t*.785)*3.06,4.6,i.z+Math.cos(t*.785)*3.06],rot:[0,t*.785,0]}))),r.push(K.sphere(3.1,G.gold,{at:[i.x,6.5,i.z],scale:[1,1.2,1]},22),K.cyl(.08,.16,2.4,G.gold,{at:[i.x,11,i.z]},8),K.sphere(.3,G.gold,{at:[i.x,10.2,i.z]},10));let a=$;r.push(K.box(a.hx*2,.35,a.hz*2,`#C9875C`,{at:[a.x,.25,a.z]}));for(let e=0;e<6;e++)for(let t of[-1,1])r.push(K.cyl(.4,.4,.9,`#5FA7E8`,{at:[a.x+t*(a.hx-.5),.05,a.z-a.hz+1.2+e*((a.hz*2-2.4)/5)],rot:[Math.PI/2,0,0]},10));r.push(K.box(a.hx*2-.3,.05,a.hz*2-.3,`#8EDB8C`,{at:[a.x,.45,a.z]}));let o=(e,t,n,r)=>K.box(e,.02,t,`#FFFFFF`,{at:[n,.48,r]});r.push(o(a.hx*2-.8,.08,a.x,a.z),K.torus(1.3,.04,`#FFFFFF`,{at:[a.x,.48,a.z],rot:[Math.PI/2,0,0]}));for(let e of[-1,1]){r.push(o(a.hx*2-.8,.08,a.x,a.z+e*(a.hz-.4)),o(.08,a.hz*2-.8,a.x+e*(a.hx-.4),a.z));let t=a.z+e*(a.hz-.4);r.push(...[-1,1].map(e=>K.cyl(.07,.07,1.3,`#FFFFFF`,{at:[a.x+e*1.4,1.1,t]},8)),K.cyl(.07,.07,2.9,`#FFFFFF`,{at:[a.x,1.75,t],rot:[0,0,Math.PI/2]},8)),r.push(K.box(2.8,1.25,.04,`#E5DDFB`,{at:[a.x,1.1,t+e*.55]}),K.box(2.8,.04,.6,`#E5DDFB`,{at:[a.x,1.72,t+e*.28]}))}n.add(J(q(r),t,2)),ep.forEach((e,r)=>{let i=new j;i.position.set(Q.lane,tp,e);let a=[K.cyl(.02,.02,Q.laneHalf*2+2,G.ink,{rot:[0,0,Math.PI/2]},4)];for(let e=0;e<6;e++){let t=-Q.laneHalf+.6+e*((Q.laneHalf*2-1.2)/5),n=[G.pink,G.sky,G.butter,G.mint,G.lavender,`#FFFFFF`][(e+r*2)%6];e%2?a.push(K.cone(.4,.9,n,{at:[t,-.5,0]},10)):a.push(K.box(.8,.7,.05,n,{at:[t,-.4,0]}),K.box(.24,.3,.05,n,{at:[t-.45,-.18,0],rot:[0,0,.5]}),K.box(.24,.3,.05,n,{at:[t+.45,-.18,0],rot:[0,0,-.5]}))}i.add(J(q(a),t,1.5)),n.add(i),this.lines.push(i),n.add(J(q([-1,1].map(t=>K.cyl(.07,.07,2.4,Nf,{at:[Q.lane+t*(Q.laneHalf+.25),3.4,e]},6))),t,1.5))}),this.squid=new j,this.squid.position.copy(np).setY(np.y+1.6);let s=[K.cyl(.04,.04,2.6,Nf,{rot:[Math.PI/2,0,0]},6)];for(let e=0;e<7;e++){let t=-1.1+e*.37;s.push(K.capsule(.09,.3,`#FFF1F4`,{at:[0,-.35,t]}),K.cone(.12,.16,`#FFE1EA`,{at:[0,-.1,t]},8),...[-1,0,1].map(e=>K.box(.02,.28,.02,`#FFD6E0`,{at:[e*.05,-.72,t]})))}this.squid.add(J(q(s),t,1.5)),n.add(this.squid,J(q([-1,1].map(e=>K.cyl(.05,.05,1.7,Nf,{at:[np.x,np.y+.8,np.z+e*1.3]},6))),t,1.5)),this.catBoat.add(J(q([K.rbox(1.1,.45,3.4,.18,`#7FB2E8`,{at:[0,.12,0]}),K.box(1.14,.08,3,G.butter,{at:[0,.32,0]}),K.box(.9,.05,2.7,`#F6D3AE`,{at:[0,.36,0]}),K.rbox(.9,.3,.6,.1,`#FFFFFF`,{at:[0,.5,-.6]})]),t,2)),this.catBoat.position.set(rp.x,0,rp.z),this.cat=md(t),this.cat.root.position.set(0,.4,1.1),this.cat.root.rotation.y=-Math.PI/2,this.cat.root.scale.setScalar(1.5),this.catBoat.add(this.cat.root),n.add(this.catBoat);let c=[new V(a.x+2.2,.47,a.z+1.5),new V(a.x+.5,.47,a.z+4.5),new V(a.x,.47,a.z-a.hz+1.4)];this.kids=Qf.map((e,r)=>{let i=yo(e,t);return i.root.position.copy(c[r]),n.add(i.root),{rig:i,life:new Co(i,`kids`),home:c[r].clone(),pos:c[r].clone(),cheer:0,jump:-1}}),this.ball=this.makeBall(),n.add(this.ball),this.gift=this.makeBall(),this.gift.visible=!1,n.add(this.gift),this.grandma=yo($f,t),this.grandma.armR.add(J(q([K.cyl(.03,.03,1.1,`#B07A4A`,{at:[0,-.1,.2],rot:[1.2,0,0]},6),K.cone(.16,.36,`#F2D38B`,{at:[0,-.38,.65],rot:[1.2+Math.PI,0,0]},10)]),t,1.5)),this.grandma.root.visible=!1,n.add(this.grandma.root),e.stops.has(`village`)&&this.finish()}makeBall(){let e=new j;return e.add(J(q([K.sphere(ip,`#FFFFFF`,{},16),...[0,1,2,3,4].map(e=>K.sphere(ip*.32,e%2?G.hotpink:G.ink,{at:[Math.sin(e*1.26)*ip*.85,Math.cos(e*2.1)*ip*.5,Math.cos(e*1.26)*ip*.85],scale:[1,1,.5]},8))]),this.bay.bag,1.5)),e}finish(){this.goal=`done`,this.goals=1,this.b.x=$.x,this.b.z=$.z,this.b.y=.85,this.giveFootball()}giveFootball(){let e=this.bay.rides.longtail;this.gift.removeFromParent(),this.gift.visible=!0,this.gift.position.set(...Nd.football),this.gift.scale.setScalar(.75),e.v.cargo.add(this.gift)}speedCap(e,t){return 1-(1-nf.cap)*this.closeness(e,t)}closeness(e,t){let n=Math.max(nf.x0-e,0,e-nf.x1),i=Math.max(nf.z0-t,0,t-nf.z1);return 1-r(Math.hypot(n,i)/nf.soft,0,1)}arrive(e,t){let n=this.here,r=this.bay.rides.longtail.d;this.here=Math.hypot(r.x-($.x-8),r.z-$.z)<52,this.here&&!n&&(this.bay.visit(`village`),this.bay.once(`village`,h.bay.facts.village))}sectionNow(){return this.bay.using===`longtail`&&this.here&&this.bay.phase===`drive`?`village`:null}anchorAt(e){if(!(this.here||this.dist()<90)||this.bay.using!==`longtail`)return null;switch(e){case`ball`:return this.goal===`loose`||this.goal===`done`?{at:this.ball.position.clone(),r:.7,prio:3,glow:this.goal===`loose`&&this.here,max:120}:null;case`kids`:return{at:this.kids[0].rig.root.position.clone().lerp(this.kids[1].rig.root.position,.5).setY(1.3),r:1.4,prio:2};case`cat`:return{at:this.cat.root.getWorldPosition(new V).setY(1.2),r:.5,prio:3};case`laundry:0`:case`laundry:1`:return{at:this.lines[Number(e.slice(8))].position.clone().setY(3.8),r:1.4,prio:2};case`squid`:return{at:this.squid.position.clone().setY(np.y+1.1),r:.9,prio:3};case`dome`:return{at:new V(Q.dome.x,7,Q.dome.z),r:3,prio:2};case`grandma`:return this.grandma.root.visible?{at:this.grandma.root.position.clone().setY(this.grandma.root.position.y+1),r:.7,prio:3}:null}return null}ballToFind(){return this.here&&this.goal===`loose`&&this.bay.using===`longtail`?this.ball.position.clone().setY(.8):null}dist(){let e=this.bay.rides.longtail.d;return Math.hypot(e.x-($.x-8),e.z-$.z)}tap(e){let t=this.bay;switch(e){case`ball`:return this.goal===`loose`?t.driveTo(this.b.x,this.b.z):this.kickAround(),X.boop(),!0;case`kids`:return X.cheer(),this.kids.forEach((e,t)=>e.jump=-t*.12),!0;case`cat`:return X.mrrp(),this.catT=0,t.found(`cat`,this.cat.root.getWorldPosition(new V)),!0;case`laundry:0`:case`laundry:1`:return this.flapT[Number(e.slice(8))]=0,X.flap(),!0;case`squid`:return this.squidT=0,X.flap(),!0;case`dome`:return this.domeT<0&&(this.domeT=0,X.ding()),!0;case`grandma`:return this.grandmaT=Math.min(this.grandmaT,.4),X.swish(),!0}return!1}bumps(e,t,n,r){if(!(e>-50||Math.abs(t-4)>70)){for(let e of tf)r.push([e.x,e.z,e.hx,e.hz]);r.push([$.x,$.z,$.hx,$.hz]),r.push([rp.x,rp.z,.6,1.7]),r.push([Q.dome.x,Q.dome.z,4.2,4.2]),n.push([Q.rock.x,Q.rock.z,Q.rock.r])}}bonked(e,t){let n=tf.find(n=>Math.abs(e-n.x)<n.hx+1.2&&Math.abs(t-n.z)<n.hz+1.2);if(!n||this.grandmaT>=0)return;let r=this.grandma.root;r.position.set(n.x-n.side*(n.hx-.7),2.32,n.z),r.rotation.y=n.side>0?-Math.PI/2:Math.PI/2,r.visible=!0,this.grandmaT=0,X.swish()}hint(){return this.here&&this.goal===`loose`?this.ball.position.clone().setY(.6):null}stuckLine(){return this.here&&this.goal===`loose`&&this.bay.phase===`drive`?h.bay.hint.ball:null}update(e,t){let n=this.bay,i=n.rides.longtail.d;this.hereT=this.here?this.hereT+e:0,!this.called&&this.hereT>4.5&&this.goal===`loose`&&(this.called=!0,n.say(h.bay.ball),this.kids.forEach(e=>e.cheer=1.2));let a=n.rig.camera.position,o=Math.hypot(a.x-$.x,a.z-$.z)<150;for(let e of this.kids)e.rig.root.visible=o;if(this.catBoat.visible=o,this.updateBall(e,t),this.updateKids(e,t),this.lines.forEach((r,a)=>{if(this.flapT[a]<0&&n.using===`longtail`&&Math.abs(i.z-r.position.z)<2&&Math.abs(i.x-r.position.x)<Q.laneHalf&&(this.flapT[a]=0,X.flap()),this.flapT[a]>=0){this.flapT[a]+=e/1.6;let t=Math.min(1,this.flapT[a]);r.rotation.x=Math.sin(t*24)*.5*(1-t),t>=1&&(this.flapT[a]=-1)}else r.rotation.x=Math.sin(t*1.3+a)*.05}),this.squidT>=0){this.squidT+=e/1.4;let t=Math.min(1,this.squidT);this.squid.rotation.z=Math.sin(t*20)*.35*(1-t),t>=1&&(this.squidT=-1)}let s=this.cat;if(s.blink.update(e),this.catBoat.position.y=wd(rp.x,rp.z,t)*.6,s.tail.rotation.z=Math.sin(t*2.4)*.4,s.head.lookAt(i.x,1.4,i.z),this.catT>=0){this.catT+=e/1.2;let t=Math.min(1,this.catT);s.root.scale.set(1.5*(1+.15*c(t)),1.5*(1+.25*c(t)),1.5),s.tail.rotation.x=-c(t)*1.2,t>=1&&(this.catT=-1)}if(n.using===`longtail`&&Math.hypot(i.x-rp.x,i.z-rp.z)<12&&n.found(`cat`,s.root.getWorldPosition(ap)),this.grandmaT>=0){this.grandmaT+=e;let t=this.grandma,n=r(this.grandmaT/.3,0,1)*(1-r((this.grandmaT-2.8)/.3,0,1));t.root.scale.setScalar(Math.max(.01,n)),qf(t,`broom`,this.grandmaT,Math.min(1,this.grandmaT/.25)),Math.floor(this.grandmaT*2.2)!==Math.floor((this.grandmaT-e)*2.2)&&this.grandmaT<2.6&&X.swish(),this.grandmaT>3.1&&(this.grandmaT=-1,t.root.visible=!1,Jf(t))}if(this.domeT>=0){this.domeT+=e;let t=n.rider(`kaylee`).char;t.rig.head.rotation.x=.45*c(Math.min(1,this.domeT/1.4)),this.domeT>1.4&&(this.domeT=-1)}}updateBall(e,t){let n=this.bay,i=this.b,a=$,o=n.rides.longtail,s=o.d;if(this.goal===`loose`){i.x+=i.vx*e,i.z+=i.vz*e,i.vx*=Math.exp(-e*.35),i.vz*=Math.exp(-e*.35),i.spin*=Math.exp(-e);let c=Math.hypot($.x-i.x,$.z-i.z);this.bumped&&c<32&&(i.vx+=($.x-i.x)/c*e*1.6,i.vz+=($.z-i.z)/c*e*1.6);let l=Math.hypot(i.x-rf.x,i.z-rf.z);if(l>30&&(i.vx+=(rf.x-i.x)/l*e*.8,i.vz+=(rf.z-i.z)/l*e*.8),n.using===`longtail`&&n.phase===`drive`)for(let e of o.v.hull.at){let t=s.x+Math.sin(s.heading)*e,r=s.z+Math.cos(s.heading)*e,a=i.x-t,l=i.z-r,u=Math.hypot(a,l),d=o.v.hull.r+ip;if(u<d&&u>1e-4){let e=a/u,o=l/u;i.x=t+e*d,i.z=r+o*d;let f=e+($.x-i.x)/c*2,p=o+($.z-i.z)/c*2,m=Math.hypot(f,p)||1,h=Math.max(3.5,Math.abs(s.speed)*1.3);i.vx=f/m*h,i.vz=p/m*h,this.bumped=!0,i.spin=8,X.boop(),n.spray.burst(i.x,.2,i.z,5,1.8,2.2,.14),this.kids.forEach(e=>e.cheer=.8)}}for(let e of tf){let t=r(i.x,e.x-e.hx,e.x+e.hx),n=r(i.z,e.z-e.hz,e.z+e.hz),a=Math.hypot(i.x-t,i.z-n);if(a<ip){let r=a>1e-4?(i.x-t)/a:Math.sign(i.x-e.x)||1,o=a>1e-4?(i.z-n)/a:0;i.x=t+r*ip*1.05,i.z=n+o*ip*1.05;let s=i.vx*r+i.vz*o;s<0&&(i.vx-=1.6*s*r,i.vz-=1.6*s*o)}}let u=Math.abs(i.x-a.x)<a.hx+2.5,d=Math.abs(i.z-a.z)<a.hz+2.5;u&&d&&(this.goal=`hop`,this.goalT=0,this.hopFrom.set(i.x,0,i.z),this.hopTo.set(r(i.x,a.x-a.hx+1.2,a.x+a.hx-1.2),.85,r(i.z,a.z-a.hz+1.5,a.z+a.hz-1.5)),X.boing(),this.kids.forEach(e=>e.cheer=1.2)),this.ball.position.set(i.x,wd(i.x,i.z,t)+ip*.55,i.z),this.ball.rotation.x+=i.spin*e,this.ball.rotation.z+=i.vx*e;return}this.goalT+=e;let l=this.kids[0],u=new V(a.x,.85,a.z-a.hz+.2);if(this.goal===`hop`){let t=Math.min(1,this.goalT/.55);this.ball.position.lerpVectors(this.hopFrom,this.hopTo,t),this.ball.position.y=this.hopFrom.y+(this.hopTo.y-this.hopFrom.y)*t+c(t)*1.4,l.pos.lerp(ap.copy(this.hopTo).setY(.47).add(new V(0,0,.8)),Math.min(1,e*3)),this.goalT>1.3&&(this.goal=`kick`,this.goalT=0,X.kick(),l.jump=0)}else if(this.goal===`kick`){let t=Math.min(1,this.goalT/.8);if(this.ball.position.lerpVectors(this.hopTo,u,t),this.ball.position.y+=c(t)*1.2,this.ball.rotation.x-=e*16,t>=1){this.goal=`goal`,this.goalT=0,X.whistle(),X.cheer(),n.say(h.bay.goal),this.goals++,this.kids.forEach((e,t)=>{e.cheer=3.5,e.jump=-t*.15}),n.spray.burst(u.x,1.4,u.z,18,2.5,4,.18);for(let e of n.riders)n.strike(e,`cheer`,1.8)}}else if(this.goal===`goal`)this.ball.position.y=Math.max(.85,this.ball.position.y-e*2),this.goals>1&&this.goalT>1.7?(this.goal=`done`,this.goalT=0,this.playT=0):this.goalT>1.7&&!this.gift.visible&&(n.say(h.bay.thanks),setTimeout(()=>n.once(`khobkhun`,h.bay.facts.khobkhun),2e3),this.kids.forEach(e=>e.cheer=2),this.gift.visible=!0,this.gift.position.copy(this.kids[1].rig.root.position).setY(1.2),this.gift.scale.setScalar(1),this.goal=`gift`,this.goalT=0,this.hopFrom.copy(this.gift.position));else if(this.goal===`gift`){let t=Math.min(1,this.goalT/1),r=o.v.body.localToWorld(ap.set(...Nd.football));this.gift.position.lerpVectors(this.hopFrom,r,t),this.gift.position.y+=c(t)*3,this.gift.rotation.x+=e*10,t>=1&&(this.giveFootball(),X.thump(),n.cheer(n.rider(`kaylee`)),this.goal=`done`,this.goalT=0,this.playT=0,setTimeout(()=>{X.shutter(),n.flash(),n.photo(`village`)},700))}else if(this.goal===`kickout`){let e=Math.min(1,this.goalT/1.1);this.ball.position.lerpVectors(this.hopFrom,this.hopTo,e),this.ball.position.y+=c(e)*2.4,e>=1&&(i.x=this.hopTo.x,i.z=this.hopTo.z,i.vx=i.vz=0,this.bumped=!1,this.goal=`loose`,X.splash(.5),n.foam.emit(i.x,.03,i.z,0,0,0,1.4,1.2))}else{if(this.playT+=e,this.here&&this.goals<3&&this.playT>7&&n.phase===`drive`&&n.using===`longtail`){let e=this.goals%2?new V($.x+$.hx+7,0,$.z+4):new V($.x+3,0,$.z+$.hz+7);this.hopFrom.copy(this.ball.position),this.hopTo.copy(e).setY(ip*.55),this.goal=`kickout`,this.goalT=0,X.kick(),X.cheer(),this.kids.forEach(e=>e.cheer=1);return}this.play.t+=e/1.6,this.play.t>=1&&this.kickAround();let t=this.kids[this.play.from].pos,r=this.kids[this.play.to].pos,i=Math.min(1,this.play.t);this.ball.position.lerpVectors(t,r,i),this.ball.position.y=.85+c(i)*.6}}kickAround(){this.play.from=this.play.to,this.play.to=(this.play.to+1+Math.floor(Math.random()*2))%3,this.play.t=0,this.here&&X.kick()}updateKids(e,t){let n=this.bay.rides.longtail.d;for(let[r,i]of this.kids.entries()){let{rig:a}=i;i.life.update(e),(this.goal!==`hop`||r!==0)&&i.pos.lerp(i.home,Math.min(1,e*1.5)),a.root.position.copy(i.pos);let o=this.goal===`loose`?new V(n.x,0,n.z):this.ball.position;a.root.rotation.y=Math.atan2(o.x-i.pos.x,o.z-i.pos.z),i.cheer=Math.max(0,i.cheer-e);let s=Math.min(1,i.cheer*2);if(a.armL.rotation.z=-(.3+1.9*s)+Math.sin(t*10+r)*.2*s,a.armR.rotation.z=.3+1.9*s-Math.sin(t*10+r)*.2*s,i.jump>-1&&(i.jump+=e/.5,i.jump>=0)){let e=Math.min(1,i.jump);a.root.position.y=i.pos.y+c(e)*.5,e>=1&&(i.jump=this.goal===`goal`&&this.goalT<1.5?-.2:-1)}this.goal===`loose`&&(a.body.position.y=Math.abs(Math.sin(t*5+r))*.05)}}photoCamera(e,t){if(e!==`village`)return null;let n=$;if(t){let e=this.bay.rides.longtail;e.d.place(n.x+n.hx+3.2,n.z+2.5,-Math.PI/2),this.bay.seatAll(e);for(let e of this.bay.riders)qf(e.char.rig,`cheer`,.3,1);for(let e of this.kids)e.rig.armL.rotation.z=-2.2,e.rig.armR.rotation.z=2.2}let r=this.bay.rides.longtail.d,i=r.x-n.x,a=r.z-n.z,o=Math.hypot(i,a)||1;i/=o,a/=o;let s=Math.min(o,16),c=n.x+i*s,l=n.z+a*s,u=-a*2.5,d=i*2.5;return bd(46,c+i*9+u,3.6,l+a*9+d,(c+n.x)/2,1.1,(l+n.z)/2)}qa(){return{ball:this.goal}}},sp={kidA:{species:`puppy`,height:1.05,fur:`#E9B486`,light:`#FFF1DC`,dark:`#5A4148`,ear:`#C98A5A`,outfit:{kind:`tee`,color:`#8EC9F5`,shorts:`#5D7BB0`},open:!0},kidB:{species:`pony`,height:1.1,fur:`#FFE0EC`,light:`#FFF6FA`,dark:`#B07A8A`,ear:`#FFB8CC`,mane:[`#B9A6F5`,`#FF8FB8`],hair:`medium`,outfit:{kind:`dress`,color:`#FBEA9A`},lashes:!0}},cp=new V,lp=class{id;root=new j;flipper=new j;rig;height;pos=new V;yaw=0;spin=0;flip=0;lift=0;sitting=!1;arms=`down`;kicking=!1;ring=null;yawGoal=0;moves=[];life;wind=new vo;gait=0;walkSpeed=0;settle=1;hopK=1;wiggleK=1;scootK=1;ringPop=1;look=null;headYaw=0;phase=Math.random()*10;constructor(e,t,n){this.id=e;let r=e===`kaylee`&&!n?Nc():null;this.rig=r?Gc(r,t):yo(n??(e===`kidA`||e===`kidB`?sp[e]:no[e]),t),this.height=this.rig.height,this.life=new Co(this.rig),this.flipper.position.y=.45*this.height,this.rig.root.position.y=-.45*this.height,this.flipper.add(this.rig.root),this.root.add(this.flipper),this.root.userData.pick=e===`kaylee`?`kaylee`:`racer:${e}`}setRing(e,t){if(!e){this.ring&&(this.ring.visible=!1);return}if(!this.ring){let n=.22+.13*this.height;this.ring=J(q([K.torus(n,.12+.03*this.height,e,{rot:[Math.PI/2,0,0]}),...[0,1,2,3].map(e=>K.box(.06,.05,.26,`#FFFFFF`,{at:[Math.cos(e*Math.PI/2)*n,.1,Math.sin(e*Math.PI/2)*n],rot:[0,-(e*Math.PI)/2,0]}))]),t,2),this.root.add(this.ring)}(!this.ring.visible||this.ringPop>=1)&&(this.ringPop=0),this.ring.visible=!0}get inRing(){return!!this.ring?.visible}place(e,t,n,r=0){this.pos.set(e,t,n),this.yaw=this.yawGoal=r,this.moves=[]}face(e){this.yawGoal=e}walkTo(e,t=2.2,n){this.moves.push({kind:`walk`,to:e.clone(),speed:t,arc:0,t:0,done:n})}hopTo(e,t=.38,n=.35,r){this.moves.push({kind:`hop`,to:e.clone(),speed:t,arc:n,t:0,done:r})}get busy(){return this.moves.length>0}stop(){this.moves=[]}hop(){this.moves.length||(this.hopK=0)}wiggle(){this.wiggleK=0}scoot(){this.scootK=0}land(){this.settle=0}lookAt(e){this.look=e?(this.look??new V).copy(e):null}setWind(e){this.wind.goal=e}update(e,t){let{body:n,head:i,armL:a,armR:o}=this.rig,s=this.height/this.rig.root.scale.y,l=this.moves[0],u=0;if(this.walkSpeed=0,l){if(l.from||(l.from=this.pos.clone(),Math.hypot(l.to.x-l.from.x,l.to.z-l.from.z)>.05&&(this.yawGoal=Math.atan2(l.to.x-l.from.x,l.to.z-l.from.z))),l.kind===`walk`){let t=l.from.distanceTo(l.to);l.t+=e*l.speed/Math.max(.001,t),this.walkSpeed=l.speed}else l.t+=e/l.speed;let t=r(l.t);this.pos.lerpVectors(l.from,l.to,t),l.kind===`hop`&&(u=c(t)*l.arc),t>=1&&(this.moves.shift(),l.kind===`hop`&&(this.settle=0),l.done?.())}let d=Math.atan2(Math.sin(this.yawGoal-this.yaw),Math.cos(this.yawGoal-this.yaw));this.yaw+=d*(1-Math.exp(-e*12)),this.life.update(e),this.wind.update(this.rig,e,t);let f=1+Math.sin(t*2.6+this.phase)*.018,p=0,h=0;if(this.walkSpeed>0){this.gait+=e*Math.PI*3.4*(this.walkSpeed/1.8);let t=Math.abs(Math.sin(this.gait));p+=t*.07*s,f*=1+.06*(t-.5),h=.14}else this.gait=0;let{legL:g,legR:v}=this.rig;if(this.sitting&&(p-=(g?.11:.17)*s,g||(f*=.88),h=-.34),g&&v){let e=this.sitting?-1.35-h:0,n=this.walkSpeed>0?Math.sin(this.gait)*.45:0;g.rotation.x=e+n+(this.kicking?Math.sin(t*15)*.5:0),v.rotation.x=e-n-(this.kicking?Math.sin(t*15)*.5:0)}if(this.settle=Math.min(1,this.settle+e/.4),this.settle<1&&(f*=1+_(this.settle,2)*.14),this.hopK=Math.min(1,this.hopK+e/.55),this.hopK<1){let e=this.hopK,t=c(m(e,0,.22)),n=m(e,.2,.85);p+=c(n)*.26*s,f*=1-.14*t-.1*c(m(e,.82,1))+.08*c(n)}this.wiggleK=Math.min(1,this.wiggleK+e/.6),n.rotation.z=Math.sin(this.wiggleK*Math.PI*6)*.16*(1-this.wiggleK)+(this.kicking?Math.sin(t*15)*.22:0),this.scootK=Math.min(1,this.scootK+e/.32);let y=this.scootK<1?Math.sin(this.scootK*Math.PI):0;if(h+=y*.28,n.position.y=p,n.rotation.x=h,n.scale.set(1/Math.sqrt(f),f,1/Math.sqrt(f)),a.rotation.set(0,0,0),o.rotation.set(0,0,0),this.arms===`race`){let e=this.scootK<1?-.9+1.8*m(this.scootK,.15,.8):.15;a.rotation.set(e,0,-.55),o.rotation.set(e,0,.55)}else this.arms===`up`?(a.rotation.z=-2.5+Math.sin(t*9)*.15,o.rotation.z=2.5-Math.sin(t*9+1)*.15):this.arms===`cheer`&&(a.rotation.z=-1.6-Math.max(0,Math.sin(t*9))*.9,o.rotation.z=1.6+Math.max(0,Math.sin(t*9+Math.PI))*.9);let b=0;this.look&&this.flip===0&&(this.root.updateWorldMatrix(!0,!1),this.root.worldToLocal(cp.copy(this.look)),b=r(Math.atan2(cp.x,cp.z),-.9,.9)),this.headYaw+=(b-this.headYaw)*(1-Math.exp(-e*6)),i.rotation.set(0,this.headYaw,0);let x=this.inRing;this.ringPop=Math.min(1,this.ringPop+e/.45),this.ring&&(this.ring.position.y=.06+.12*s,this.ring.scale.setScalar(this.ringPop<1?Math.max(.01,1+_(this.ringPop,2)*.3-(1-this.ringPop)*.6):1)),this.root.position.set(this.pos.x,this.pos.y+u+this.lift+(x?.09:0),this.pos.z),this.root.rotation.y=this.yaw+this.spin,this.flipper.rotation.x=this.flip}},up={species:`fox`,height:1,fur:`#FF9A4D`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`,outfit:{kind:`tee`,color:`#8FE3C8`,shorts:`#5D7BB0`},open:!0},dp=[{species:`buffalo`,height:1.5,fur:`#94A0C8`,light:`#DCD8EE`,dark:`#4C4F6B`,ear:`#FFB8CC`,outfit:{kind:`polo`,color:`#FF6F6F`},extras:[`cap`],open:!0},{species:`penguin`,height:1.4,fur:`#3F365F`,light:`#FFF6EC`,dark:`#FFA640`,outfit:{kind:`polo`,color:`#FBEA9A`},extras:[`cap`],open:!0}],fp=[sp.kidA,sp.kidB,up],pp=class{loop;r;i=0;busy=!1;wait=0;slide=null;cheer=0;constructor(e,t,n,r,i=0){this.loop=n,this.r=new lp(`kidA`,t,e),this.r.root.userData.pick=r,this.i=i%n.length;let a=this.firstSpot();this.r.place(a.x,a.y,a.z,0)}firstSpot(){for(let e=1;e<=this.loop.length;e++){let t=this.loop[(this.i-e+this.loop.length)%this.loop.length];if(`walk`in t)return new V(...t.walk);if(`hop`in t)return new V(...t.hop)}return new V}get sliding(){return!!this.slide}poke(){this.r.busy||this.slide?this.r.wiggle():this.r.hop()}update(e,t){let n=this.r;if(this.slide){let t=this.slide;t.u=Math.min(1,t.u+e*t.speed/t.curve.getLength()),n.pos.copy(t.curve.getPointAt(t.u));let r=t.curve.getTangentAt(t.u);n.face(Math.atan2(r.x,r.z)),t.u>=1&&(this.slide=null,n.sitting=!1,n.arms=`down`,n.land(),this.busy=!1)}else this.wait>0?(this.wait-=e,this.wait<=0&&(this.busy=!1,this.cheer>0&&(n.arms=`down`),this.cheer=0)):this.busy||this.next();n.update(e,t)}next(){let e=this.loop[this.i];this.i=(this.i+1)%this.loop.length;let t=this.r;this.busy=!0;let n=()=>this.busy=!1;`walk`in e?t.walkTo(new V(...e.walk),1.6,n):`hop`in e?t.hopTo(new V(...e.hop),e.dur??.45,e.arc??.45,n):`slide`in e?(this.slide={curve:e.slide,u:0,speed:e.speed},t.sitting=!0,t.arms=`up`):`wait`in e?this.wait=e.wait:(this.wait=this.cheer=e.cheer,t.arms=`cheer`)}},mp=`#4DB57A`,hp=`#2F8F5B`,gp=`#FFF1E4`,_p={species:`fox`,height:1.5,fur:`#FF9A4D`,light:`#FFF1E2`,dark:`#2B2330`,ear:`#FFE6CC`,outfit:{kind:`shirt`,color:mp},extras:[`cap`],lashes:!0};function vp(e){let t=new j,n=e=>(t.add(e),e),r=u;n(J(q([K.box(7,.1,4.2,`#F3E6FF`,{at:[0,-.05,r+2.1]}),...Array.from({length:9},(e,t)=>K.box(.03,.004,4.2,`#E4D6F5`,{at:[-3.2+t*.8,.002,r+2.1]}))]),e,0));let a=(e,t,n,i)=>K.box(t-e,i-n,.2,gp,{at:[(e+t)/2,(n+i)/2,r-.1]});n(J(q([a(-3.5,p.x0,0,5),a(p.x1,3.5,0,5),a(p.x0,p.x1,0,p.y0),a(p.x0,p.x1,p.y1,5),K.box(7,.08,.02,mp,{at:[0,1.3,r+.01]}),K.box(p.x1-p.x0+.12,.08,.22,`#FFFFFF`,{at:[(p.x0+p.x1)/2,p.y0,r-.06]}),K.box(p.x1-p.x0+.12,.08,.22,`#FFFFFF`,{at:[(p.x0+p.x1)/2,p.y1,r-.06]}),...[p.x0,(p.x0+p.x1)/2,p.x1].map(e=>K.box(.07,p.y1-p.y0,.2,`#FFFFFF`,{at:[e,(p.y0+p.y1)/2,r-.06]}))]),e,2));let o=document.createElement(`canvas`);o.width=128,o.height=128;let c=o.getContext(`2d`);c.fillStyle=`#BFE6FF`,c.fillRect(0,0,128,128);for(let e=0;e<16;e++)c.fillStyle=e%3?`#FFFFFF`:`#8EC9F5`,c.fillRect(e*8+1,e*37%128-64,4,70),c.fillRect(e*8+1,e*37%128+64,4,70);let d=e.add(new dt(o));d.colorSpace=k,d.wrapS=d.wrapT=oe,d.repeat.set(3,2);let m=e.add(new gt({map:d,color:`#FFFFFF`})),h=new B(e.add(new Ce(p.x1-p.x0,p.y1-p.y0)),m);h.position.set((p.x0+p.x1)/2,(p.y0+p.y1)/2,r-.12),h.userData.pick=`window`,t.add(h),n(J(q([...[[-2.1,.22],[-1.6,.3],[-1.05,.2],[-.6,.26]].map(([e,t])=>K.sphere(t,`#9C95C4`,{at:[e,p.y0+.02,r-.16],scale:[1.2,.7,.3]})),K.box(p.x1-p.x0,.12,.04,`#7FC8F5`,{at:[(p.x0+p.x1)/2,p.y0+.08,r-.13]})]),e,1.5));let _=new j;_.position.set(y.x,y.y,r+.03),_.userData.pick=`sign`;let b=new B(e.add(new Ce(y.w+.5,y.h+.5)),e.add(new gt({color:G.gold,transparent:!0,opacity:0,depthWrite:!1})));b.position.z=-.02,_.add(b),_.add(J(q([K.rbox(y.w,y.h,.06,.1,mp,{}),K.rbox(y.w-.1,y.h-.1,.02,.07,hp,{at:[0,0,.03]}),...[0,1,2].map(e=>K.rbox(.42-e*.08,.05,.02,.02,`#FFFFFF`,{at:[.12,.1-e*.11,.045]}))]),e,2));let S=new j;S.position.set(-.37,0,.06),S.add(J(q([K.cyl(.2,.2,.03,`#E5484D`,{rot:[Math.PI/2,0,0]},24),K.prism([[0,-.13],[.11,.1],[-.11,.1]],.03,`#FFD24A`,{at:[0,0,.02]}),K.prism([[-.12,.09],[.12,.09],[.12,.13],[-.12,.13]],.03,`#F2C27B`,{at:[0,0,.025]}),...[[-.03,.04],[.035,.02],[0,-.05]].map(([e,t])=>K.sphere(.022,`#E5484D`,{at:[e,t,.04],scale:[1,1,.4]},10))]),e,2)),_.add(S),t.add(_),n(J(q([K.rbox(3.4,.14,.52,.05,mp,{at:[0,.39,x]}),K.rbox(3.4,.36,.5,.04,hp,{at:[0,.16,x]}),K.rbox(3.4,.92,.18,.08,mp,{at:[0,.82,x-.32]}),...[-1.15,-.4,.4,1.15].map(e=>K.box(.02,.7,.02,hp,{at:[e,.9,x-.22]})),K.rbox(.42,.16,.36,.06,G.pink,{at:[0,.54,x+.02]})]),e,2)),n(J(q([K.rbox(v.w,.06,v.d,.025,`#FFFDF8`,{at:[0,v.top-.03,v.z]}),K.box(v.w-.04,.03,.02,mp,{at:[0,v.top-.035,v.z+v.d/2+.002]}),...[-1,1].map(e=>K.cyl(.07,.07,v.top-.06,`#C9C3DA`,{at:[e*1,(v.top-.06)/2,v.z]})),...[-1,1].map(e=>K.cyl(.26,.28,.04,`#C9C3DA`,{at:[e*1,.02,v.z]},24))]),e,2));let C=new j;C.position.set(...f),C.userData.pick=`soda`,C.add(new B(e.add(K.cyl(.07,.06,.22,`#fff`,{at:[0,.11,0]},20)),e.add(new gt({color:`#E8F6FF`,transparent:!0,opacity:.4,depthWrite:!1}))));let w=new j;w.add(J(q([K.cyl(.062,.055,.17,`#FF8FB8`,{at:[0,.085,0]},20),K.box(.04,.04,.04,`#FFFFFF`,{at:[.02,.165,.01],rot:[.3,.5,0]}),K.box(.035,.035,.035,`#FFFFFF`,{at:[-.025,.16,-.01],rot:[.5,.2,.3]})]),e,1)),C.add(w),C.add(J(q([...Array.from({length:5},(e,t)=>K.cyl(.011,.011,.06,t%2?`#FFFFFF`:G.hotpink,{at:[.02+t*.006,.17+t*.058,0],rot:[0,0,-.1]},8))]),e,1.5)),t.add(C);let T=new j;T.position.set(...i),T.userData.pick=`rings`,T.add(J(q([K.rbox(.26,.06,.18,.02,`#E5484D`,{at:[0,.03,0]}),K.box(.22,.004,.14,`#FFFFFF`,{at:[0,.062,0]})]),e,1.5));let E=[-.06,0,.06].map((t,n)=>{let r=J(q([K.torus(.042,.016,`#E7A94B`,{rot:[Math.PI/2-.5,0,0]})]),e,1.5);return r.position.set(t,.085+(n===1?.02:0),0),T.add(r),r});t.add(T);let D=new j;D.position.set(...l),D.userData.pick=`chili`,D.add(J(q([K.cyl(.04,.045,.12,`#FFFFFF`,{at:[0,.06,0]},16),K.cyl(.036,.04,.08,`#E5484D`,{at:[0,.045,0]},16),K.cyl(.042,.04,.035,`#C9C3DA`,{at:[0,.135,0]},16),K.sphere(.03,`#C9C3DA`,{at:[0,.15,0],scale:[1,.6,1]})]),e,1.5)),t.add(D);let O=new j;O.position.set(...s),O.userData.pick=`napkins`,O.add(J(q([K.rbox(.2,.1,.12,.015,mp,{at:[0,.05,0]}),K.box(.12,.08,.008,`#FFFFFF`,{at:[0,.13,0],rot:[0,0,.12]})]),e,1.5)),t.add(O);let A=yo(_p,e);return A.root.position.set(...g),A.root.rotation.y=.5,A.root.userData.pick=`server`,t.add(A.root),{root:t,soda:{root:C,level:w},rings:{root:T,rings:E},chili:D,napkins:O,sign:{root:_,halo:b,logo:S},falls:{tex:d,mat:m,mesh:h},server:A}}export{Hd as $,Rs as $t,Qd as A,ln as An,Xl as At,zd as B,Zc as Bt,Df as C,G as Cn,Du as Ct,Pf as D,ja as Dn,su as Dt,Ff as E,Pa as En,eu as Et,ef as F,sl as Ft,mf as G,xc as Gt,$d as H,Nc as Ht,Wd as I,X as It,hf as J,As as Jt,ff as K,ks as Kt,Vd as L,il as Lt,_f as M,Hl as Mt,Kd as N,Cl as Nt,Bd as O,Ea as On,tu as Ot,Jd as P,Tl as Pt,gf as Q,Ss as Qt,tf as R,nl as Rt,Ef as S,La as Sn,Ou as St,Lf as T,Fa as Tn,mu as Tt,Rd as U,Ic as Ut,Yd as V,Xc as Vt,uf as W,Pc as Wt,vf as X,Ds as Xt,yf as Y,Es as Yt,df as Z,Cs as Zt,Rf as _,qa as _n,dd as _t,pp as a,Is as an,Fd as at,Af as b,Va as bn,hd as bt,lp as c,io as cn,Cd as ct,Yf as d,Qa as dn,yd as dt,Ps as en,Q as et,op as f,K as fn,ad as ft,Bf as g,J as gn,ld as gt,Jf as h,q as hn,md as ht,fp as i,Fs as in,jd as it,Zd as j,Ql as jt,Xd as k,Sa as kn,$l as kt,$f as l,no as ln,wd as lt,qf as m,Ya as mn,fd as mt,vp as n,js as nn,Ud as nt,dp as o,Co as on,Md as ot,Kf as p,Ka as pn,od as pt,pf as q,ws as qt,up as r,Ns as rn,Nd as rt,sp as s,yo as sn,Ld as st,_p as t,Ts as tn,af as tt,Qf as u,ro as un,bd as ut,Gf as v,Ha as vn,pd as vt,jf as w,Ma as wn,td as wt,Of as x,Wa as xn,gd as xt,kf as y,Ua as yn,ud as yt,qd as z,el as zt};
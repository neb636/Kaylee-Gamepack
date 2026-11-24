import{M as e,R as t,V as n,d as r,k as i,l as a,r as o,t as s,u as c}from"./knobs-CsjGkRHJ.js";import{S as l}from"./sdk-CI2RZLyF.js";import{n as u}from"./timers-C_6P-JJ4.js";import{$n as d,A as f,At as p,B as m,Bn as h,C as g,Cr as _,Ct as v,D as y,Dr as b,Dt as x,E as S,Er as C,F as w,Ft as T,G as E,Gt as D,H as O,I as k,K as A,L as j,Ln as ee,Lt as te,M,N,Nn as P,Or as ne,Ot as F,P as re,Pn as ie,Rn as I,Rt as L,S as R,Sr as z,St as ae,T as B,Tr as oe,Vn as se,W as V,Wt as H,X as ce,Xt as le,Zn as ue,Zt as U,_ as de,_r as W,a as fe,b as pe,br as G,bt as me,cr as he,d as K,dt as ge,er as q,f as _e,fr as ve,ft as ye,gr as be,h as xe,ir as Se,it as Ce,j as we,jt as Te,k as Ee,kr as De,kt as Oe,l as ke,mr as Ae,mt as je,n as Me,nr as Ne,or as Pe,pr as J,pt as Fe,qn as Ie,qt as Le,r as Re,rr as ze,s as Be,st as Ve,t as He,tr as Ue,u as We,ut as Ge,v as Ke,vr as qe,w as Je,wr as Ye,wt as Xe,x as Ze,xr as Qe,xt as $e,y as Y,yr as et,yt as X,z as tt,zt as nt}from"./tune-D133UAec.js";var rt=n(t(),1);function it(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function at(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Z={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},Q={common:{diffuse:{value:new Y(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new X},alphaMap:{value:null},alphaMapTransform:{value:new X},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new X}},envmap:{envMap:{value:null},envMapRotation:{value:new X},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new X}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new X}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new X},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new X},normalScale:{value:new ve(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new X},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new X}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new X}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new X}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Y(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Y(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new X},alphaTest:{value:0},uvTransform:{value:new X}},sprite:{diffuse:{value:new Y(16777215)},opacity:{value:1},center:{value:new ve(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new X},alphaMap:{value:null},alphaMapTransform:{value:new X},alphaTest:{value:0}}},ot={basic:{uniforms:C([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.fog]),vertexShader:Z.meshbasic_vert,fragmentShader:Z.meshbasic_frag},lambert:{uniforms:C([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new Y(0)}}]),vertexShader:Z.meshlambert_vert,fragmentShader:Z.meshlambert_frag},phong:{uniforms:C([Q.common,Q.specularmap,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,Q.lights,{emissive:{value:new Y(0)},specular:{value:new Y(1118481)},shininess:{value:30}}]),vertexShader:Z.meshphong_vert,fragmentShader:Z.meshphong_frag},standard:{uniforms:C([Q.common,Q.envmap,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.roughnessmap,Q.metalnessmap,Q.fog,Q.lights,{emissive:{value:new Y(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Z.meshphysical_vert,fragmentShader:Z.meshphysical_frag},toon:{uniforms:C([Q.common,Q.aomap,Q.lightmap,Q.emissivemap,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.gradientmap,Q.fog,Q.lights,{emissive:{value:new Y(0)}}]),vertexShader:Z.meshtoon_vert,fragmentShader:Z.meshtoon_frag},matcap:{uniforms:C([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,Q.fog,{matcap:{value:null}}]),vertexShader:Z.meshmatcap_vert,fragmentShader:Z.meshmatcap_frag},points:{uniforms:C([Q.points,Q.fog]),vertexShader:Z.points_vert,fragmentShader:Z.points_frag},dashed:{uniforms:C([Q.common,Q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Z.linedashed_vert,fragmentShader:Z.linedashed_frag},depth:{uniforms:C([Q.common,Q.displacementmap]),vertexShader:Z.depth_vert,fragmentShader:Z.depth_frag},normal:{uniforms:C([Q.common,Q.bumpmap,Q.normalmap,Q.displacementmap,{opacity:{value:1}}]),vertexShader:Z.meshnormal_vert,fragmentShader:Z.meshnormal_frag},sprite:{uniforms:C([Q.sprite,Q.fog]),vertexShader:Z.sprite_vert,fragmentShader:Z.sprite_frag},background:{uniforms:{uvTransform:{value:new X},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Z.background_vert,fragmentShader:Z.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new X}},vertexShader:Z.backgroundCube_vert,fragmentShader:Z.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Z.cube_vert,fragmentShader:Z.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Z.equirect_vert,fragmentShader:Z.equirect_frag},distanceRGBA:{uniforms:C([Q.common,Q.displacementmap,{referencePosition:{value:new J},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Z.distanceRGBA_vert,fragmentShader:Z.distanceRGBA_frag},shadow:{uniforms:C([Q.lights,Q.fog,{color:{value:new Y(0)},opacity:{value:1}}]),vertexShader:Z.shadow_vert,fragmentShader:Z.shadow_frag}};ot.physical={uniforms:C([ot.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new X},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new X},clearcoatNormalScale:{value:new ve(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new X},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new X},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new X},sheen:{value:0},sheenColor:{value:new Y(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new X},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new X},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new X},transmissionSamplerSize:{value:new ve},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new X},attenuationDistance:{value:0},attenuationColor:{value:new Y(0)},specularColor:{value:new Y(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new X},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new X},anisotropyVector:{value:new ve},anisotropyMap:{value:null},anisotropyMapTransform:{value:new X}}]),vertexShader:Z.meshphysical_vert,fragmentShader:Z.meshphysical_frag};var st={r:0,b:0,g:0},ct=new re,lt=new me;function ut(e,t,n,r,i,a,o){let s=new Y(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function g(t){let n=!1,i=m(t);i===null?v(s,c):i&&i.isColor&&(v(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function _(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new $e(new We(1,1,1),new h({name:`BackgroundCubeMaterial`,uniforms:Qe(ot.backgroundCube.uniforms),vertexShader:ot.backgroundCube.vertexShader,fragmentShader:ot.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),ct.copy(n.backgroundRotation),ct.x*=-1,ct.y*=-1,ct.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(ct.y*=-1,ct.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(lt.makeRotationFromEuler(ct)),u.material.toneMapped=pe.getTransfer(r.colorSpace)!==I,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new $e(new nt(2,2),new h({name:`BackgroundMaterial`,uniforms:Qe(ot.background.uniforms),vertexShader:ot.background.vertexShader,fragmentShader:ot.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=pe.getTransfer(r.colorSpace)!==I,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function v(t,n){t.getRGB(st,oe(e)),r.buffers.color.setClear(st.r,st.g,st.b,n,o)}function y(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,v(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,v(s,c)},render:g,addToRenderList:_,dispose:y}}function dt(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function ft(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function pt(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function mt(e){let t=this,n=null,r=0,i=!1,a=!1,o=new L,s=new X,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function ht(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new W(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var gt=4,_t=[.125,.215,.35,.446,.526,.582],vt=20,yt=new T,bt=new Y,xt=null,St=0,Ct=0,wt=!1,Tt=(1+Math.sqrt(5))/2,Et=1/Tt,Dt=[new J(-Tt,Et,0),new J(Tt,Et,0),new J(-Et,0,Tt),new J(Et,0,Tt),new J(0,Tt,-Et),new J(0,Tt,Et),new J(-1,1,-1),new J(1,1,-1),new J(-1,1,1),new J(1,1,1)],Ot=new J,kt=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Ot}=i;xt=this._renderer.getRenderTarget(),St=this._renderer.getActiveCubeFace(),Ct=this._renderer.getActiveMipmapLevel(),wt=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ft(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Pt(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(xt,St,Ct),this._renderer.xr.enabled=wt,e.scissorTest=!1,Mt(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),xt=this._renderer.getRenderTarget(),St=this._renderer.getActiveCubeFace(),Ct=this._renderer.getActiveMipmapLevel(),wt=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ge,minFilter:Ge,generateMipmaps:!1,type:E,format:U,colorSpace:Fe,depthBuffer:!1},r=jt(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=jt(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=At(r)),this._blurMaterial=Nt(r,e,t)}return r}_compileMaterial(e){let t=new $e(this._lodPlanes[0],e);this._renderer.compile(t,yt)}_sceneToCubeUV(e,t,n,r,i){let a=new te(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(bt),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new ae({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new $e(new We,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(bt),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Mt(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ft()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Pt());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new $e(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Mt(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,yt)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=Dt[(r-t-1)%Dt.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new $e(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):vt;m>vt&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${vt}`);let h=[],g=0;for(let e=0;e<vt;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Mt(t,3*v*(r>_-gt?r-_+gt:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,yt)}};function At(e){let t=[],n=[],r=[],i=e,a=e-gt+1+_t.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-gt?s=_t[o-e+gt-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new _e;h.setAttribute(`position`,new K(f,3)),h.setAttribute(`uv`,new K(p,2)),h.setAttribute(`faceIndex`,new K(m,1)),t.push(h),i>gt&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function jt(e,t,n){let r=new qe(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Mt(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Nt(e,t,n){let r=new Float32Array(vt),i=new J(0,1,0);return new h({name:`SphericalGaussianBlur`,defines:{n:vt,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:It(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Pt(){return new h({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:It(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ft(){return new h({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:It(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function It(){return`

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
	`}function Lt(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new kt(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new kt(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function Rt(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&ne(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function zt(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(G(n)?Ne:Ue)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Bt(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function Vt(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ht(e,t,n){let r=new WeakMap,i=new Ae;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,h=1;p>t.maxTextureSize&&(h=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*h*4*u),_=new S(g,p,h,u);_.type=m,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*h*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new ve(p,h)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Ut(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var Wt=new ue,Gt=new we(1,1),Kt=new S,qt=new B,Jt=new R,Yt=[],Xt=[],Zt=new Float32Array(16),Qt=new Float32Array(9),$t=new Float32Array(4);function en(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Yt[i];if(a===void 0&&(a=new Float32Array(i),Yt[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function tn(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function nn(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function rn(e,t){let n=Xt[t];n===void 0&&(n=new Int32Array(t),Xt[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function an(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function on(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(tn(n,t))return;e.uniform2fv(this.addr,t),nn(n,t)}}function sn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(tn(n,t))return;e.uniform3fv(this.addr,t),nn(n,t)}}function cn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(tn(n,t))return;e.uniform4fv(this.addr,t),nn(n,t)}}function ln(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(tn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),nn(n,t)}else{if(tn(n,r))return;$t.set(r),e.uniformMatrix2fv(this.addr,!1,$t),nn(n,r)}}function un(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(tn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),nn(n,t)}else{if(tn(n,r))return;Qt.set(r),e.uniformMatrix3fv(this.addr,!1,Qt),nn(n,r)}}function dn(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(tn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),nn(n,t)}else{if(tn(n,r))return;Zt.set(r),e.uniformMatrix4fv(this.addr,!1,Zt),nn(n,r)}}function fn(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function pn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(tn(n,t))return;e.uniform2iv(this.addr,t),nn(n,t)}}function mn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(tn(n,t))return;e.uniform3iv(this.addr,t),nn(n,t)}}function hn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(tn(n,t))return;e.uniform4iv(this.addr,t),nn(n,t)}}function gn(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function _n(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(tn(n,t))return;e.uniform2uiv(this.addr,t),nn(n,t)}}function vn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(tn(n,t))return;e.uniform3uiv(this.addr,t),nn(n,t)}}function yn(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(tn(n,t))return;e.uniform4uiv(this.addr,t),nn(n,t)}}function bn(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Gt.compareFunction=515,a=Gt):a=Wt,n.setTexture2D(t||a,i)}function xn(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||qt,i)}function Sn(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Jt,i)}function Cn(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Kt,i)}function wn(e){switch(e){case 5126:return an;case 35664:return on;case 35665:return sn;case 35666:return cn;case 35674:return ln;case 35675:return un;case 35676:return dn;case 5124:case 35670:return fn;case 35667:case 35671:return pn;case 35668:case 35672:return mn;case 35669:case 35673:return hn;case 5125:return gn;case 36294:return _n;case 36295:return vn;case 36296:return yn;case 35678:case 36198:case 36298:case 36306:case 35682:return bn;case 35679:case 36299:case 36307:return xn;case 35680:case 36300:case 36308:case 36293:return Sn;case 36289:case 36303:case 36311:case 36292:return Cn}}function Tn(e,t){e.uniform1fv(this.addr,t)}function En(e,t){let n=en(t,this.size,2);e.uniform2fv(this.addr,n)}function Dn(e,t){let n=en(t,this.size,3);e.uniform3fv(this.addr,n)}function On(e,t){let n=en(t,this.size,4);e.uniform4fv(this.addr,n)}function kn(e,t){let n=en(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function An(e,t){let n=en(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function jn(e,t){let n=en(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Mn(e,t){e.uniform1iv(this.addr,t)}function Nn(e,t){e.uniform2iv(this.addr,t)}function Pn(e,t){e.uniform3iv(this.addr,t)}function Fn(e,t){e.uniform4iv(this.addr,t)}function In(e,t){e.uniform1uiv(this.addr,t)}function Ln(e,t){e.uniform2uiv(this.addr,t)}function Rn(e,t){e.uniform3uiv(this.addr,t)}function zn(e,t){e.uniform4uiv(this.addr,t)}function Bn(e,t,n){let r=this.cache,i=t.length,a=rn(n,i);tn(r,a)||(e.uniform1iv(this.addr,a),nn(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||Wt,a[e])}function Vn(e,t,n){let r=this.cache,i=t.length,a=rn(n,i);tn(r,a)||(e.uniform1iv(this.addr,a),nn(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||qt,a[e])}function Hn(e,t,n){let r=this.cache,i=t.length,a=rn(n,i);tn(r,a)||(e.uniform1iv(this.addr,a),nn(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Jt,a[e])}function Un(e,t,n){let r=this.cache,i=t.length,a=rn(n,i);tn(r,a)||(e.uniform1iv(this.addr,a),nn(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Kt,a[e])}function Wn(e){switch(e){case 5126:return Tn;case 35664:return En;case 35665:return Dn;case 35666:return On;case 35674:return kn;case 35675:return An;case 35676:return jn;case 5124:case 35670:return Mn;case 35667:case 35671:return Nn;case 35668:case 35672:return Pn;case 35669:case 35673:return Fn;case 5125:return In;case 36294:return Ln;case 36295:return Rn;case 36296:return zn;case 35678:case 36198:case 36298:case 36306:case 35682:return Bn;case 35679:case 36299:case 36307:return Vn;case 35680:case 36300:case 36308:case 36293:return Hn;case 36289:case 36303:case 36311:case 36292:return Un}}var Gn=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=wn(t.type)}},Kn=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Wn(t.type)}},qn=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Jn=/(\w+)(\])?(\[|\.)?/g;function Yn(e,t){e.seq.push(t),e.map[t.id]=t}function Xn(e,t,n){let r=e.name,i=r.length;for(Jn.lastIndex=0;;){let a=Jn.exec(r),o=Jn.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Yn(n,l===void 0?new Gn(s,e,t):new Kn(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new qn(s),Yn(n,e)),n=e}}}var Zn=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Xn(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Qn(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var $n=37297,er=0;function tr(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var nr=new X;function rr(e){pe._getMatrix(nr,pe.workingColorSpace,e);let t=`mat3( ${nr.elements.map(e=>e.toFixed(4))} )`;switch(pe.getTransfer(e)){case je:return[t,`LinearTransferOETF`];case I:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function ir(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+tr(e.getShaderSource(t),r)}return i}function ar(e,t){let n=rr(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function or(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var sr=new J;function cr(){return pe.getLuminanceCoefficients(sr),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${sr.x.toFixed(4)}, ${sr.y.toFixed(4)}, ${sr.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function lr(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(fr).join(`
`)}function ur(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function dr(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function fr(e){return e!==``}function pr(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function mr(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var hr=/^[ \t]*#include +<([\w\d./]+)>/gm;function gr(e){return e.replace(hr,vr)}var _r=new Map;function vr(e,t){let n=Z[t];if(n===void 0){let e=_r.get(t);if(e!==void 0)n=Z[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return gr(n)}var yr=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function br(e){return e.replace(yr,xr)}function xr(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Sr(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}function Cr(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function wr(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function Tr(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function Er(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function Dr(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Or(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Cr(n),l=wr(n),u=Tr(n),d=Er(n),f=Dr(n),p=lr(n),m=ur(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(fr).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(fr).join(`
`),_.length>0&&(_+=`
`)):(g=[Sr(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(fr).join(`
`),_=[Sr(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Z.tonemapping_pars_fragment,n.toneMapping===0?``:or(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Z.colorspace_pars_fragment,ar(`linearToOutputTexel`,n.outputColorSpace),cr(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(fr).join(`
`)),o=gr(o),o=pr(o,n),o=mr(o,n),s=gr(s),s=pr(s,n),s=mr(s,n),o=br(o),s=br(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Qn(i,i.VERTEX_SHADER,y),S=Qn(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=ir(i,x,`vertex`),n=ir(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Zn(i,h),T=dr(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,$n)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=er++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var kr=0,Ar=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new jr(e),t.set(e,n)),n}},jr=class{constructor(e){this.id=kr++,this.code=e,this.usedTimes=0}};function Mr(e,t,n,r,i,a,o){let s=new Ce,c=new Ar,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=ot[C];D=e.vertexShader,O=e.fragmentShader}else D=a.vertexShader,O=a.fragmentShader,c.update(a),k=c.getVertexShaderID(a),A=c.getFragmentShaderID(a);let j=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),te=_.isInstancedMesh===!0,M=_.isBatchedMesh===!0,N=!!a.map,P=!!a.matcap,ne=!!x,F=!!a.aoMap,re=!!a.lightMap,ie=!!a.bumpMap,I=!!a.normalMap,L=!!a.displacementMap,R=!!a.emissiveMap,z=!!a.metalnessMap,ae=!!a.roughnessMap,B=a.anisotropy>0,oe=a.clearcoat>0,se=a.dispersion>0,V=a.iridescence>0,H=a.sheen>0,ce=a.transmission>0,le=B&&!!a.anisotropyMap,ue=oe&&!!a.clearcoatMap,U=oe&&!!a.clearcoatNormalMap,de=oe&&!!a.clearcoatRoughnessMap,W=V&&!!a.iridescenceMap,fe=V&&!!a.iridescenceThicknessMap,G=H&&!!a.sheenColorMap,me=H&&!!a.sheenRoughnessMap,he=!!a.specularMap,K=!!a.specularColorMap,ge=!!a.specularIntensityMap,q=ce&&!!a.transmissionMap,_e=ce&&!!a.thicknessMap,ve=!!a.gradientMap,ye=!!a.alphaMap,be=a.alphaTest>0,xe=!!a.alphaHash,Se=!!a.extensions,Ce=0;a.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ce=e.toneMapping);let we={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:O,defines:a.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:M,batchingColor:M&&_._colorsTexture!==null,instancing:te,instancingColor:te&&_.instanceColor!==null,instancingMorph:te&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Fe,alphaToCoverage:!!a.alphaToCoverage,map:N,matcap:P,envMap:ne,envMapMode:ne&&x.mapping,envMapCubeUVHeight:S,aoMap:F,lightMap:re,bumpMap:ie,normalMap:I,displacementMap:f&&L,emissiveMap:R,normalMapObjectSpace:I&&a.normalMapType===1,normalMapTangentSpace:I&&a.normalMapType===0,metalnessMap:z,roughnessMap:ae,anisotropy:B,anisotropyMap:le,clearcoat:oe,clearcoatMap:ue,clearcoatNormalMap:U,clearcoatRoughnessMap:de,dispersion:se,iridescence:V,iridescenceMap:W,iridescenceThicknessMap:fe,sheen:H,sheenColorMap:G,sheenRoughnessMap:me,specularMap:he,specularColorMap:K,specularIntensityMap:ge,transmission:ce,transmissionMap:q,thicknessMap:_e,gradientMap:ve,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:ye,alphaTest:be,alphaHash:xe,combine:a.combine,mapUv:N&&h(a.map.channel),aoMapUv:F&&h(a.aoMap.channel),lightMapUv:re&&h(a.lightMap.channel),bumpMapUv:ie&&h(a.bumpMap.channel),normalMapUv:I&&h(a.normalMap.channel),displacementMapUv:L&&h(a.displacementMap.channel),emissiveMapUv:R&&h(a.emissiveMap.channel),metalnessMapUv:z&&h(a.metalnessMap.channel),roughnessMapUv:ae&&h(a.roughnessMap.channel),anisotropyMapUv:le&&h(a.anisotropyMap.channel),clearcoatMapUv:ue&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:U&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:de&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:W&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:fe&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:G&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:me&&h(a.sheenRoughnessMap.channel),specularMapUv:he&&h(a.specularMap.channel),specularColorMapUv:K&&h(a.specularColorMap.channel),specularIntensityMapUv:ge&&h(a.specularIntensityMap.channel),transmissionMapUv:q&&h(a.transmissionMap.channel),thicknessMapUv:_e&&h(a.thicknessMap.channel),alphaMapUv:ye&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(I||B),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(N||ye),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ee,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ce,decodeVideoTexture:N&&a.map.isVideoTexture===!0&&pe.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:R&&a.emissiveMap.isVideoTexture===!0&&pe.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Se&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Se&&a.extensions.multiDraw===!0||M)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return we.vertexUv1s=l.has(1),we.vertexUv2s=l.has(2),we.vertexUv3s=l.has(3),l.clear(),we}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=ot[t];n=ze.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new Or(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Nr(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Pr(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Fr(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ir(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Pr),r.length>1&&r.sort(t||Fr),i.length>1&&i.sort(t||Fr)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function Lr(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Ir,e.set(t,[i])):n>=r.length?(i=new Ir,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Rr(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new J,color:new Y};break;case`SpotLight`:n={position:new J,direction:new J,color:new Y,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new J,color:new Y,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new J,skyColor:new Y,groundColor:new Y};break;case`RectAreaLight`:n={color:new Y,position:new J,halfWidth:new J,halfHeight:new J}}return e[t.id]=n,n}}}function zr(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Br=0;function Vr(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Hr(e){let t=new Rr,n=zr(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new J);let i=new J,a=new me,o=new me;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Vr);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Q.LTC_FLOAT_1,r.rectAreaLTC2=Q.LTC_FLOAT_2):(r.rectAreaLTC1=Q.LTC_HALF_1,r.rectAreaLTC2=Q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Br++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Ur(e){let t=new Hr(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function Wr(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Ur(e),t.set(n,[a])):r>=i.length?(a=new Ur(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Gr=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Kr=`uniform sampler2D shadow_pass;
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
}`;function qr(e,t,n){let r=new O,i=new ve,a=new ve,o=new Ae,s=new v({depthPacking:le}),c=new Xe,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new h({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ve},radius:{value:4}},vertexShader:Gr,fragmentShader:Kr}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new _e;m.setAttribute(`position`,new K(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new $e(m,f),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let y=this.type;this.render=function(t,n,s){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=y!==3&&this.type===3,m=y===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:Oe,magFilter:Oe};d.map!==null&&d.map.dispose(),d.map=new qe(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),S(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&b(d,s),d.needsUpdate=!1}y=this.type,_.needsUpdate=!1,e.setRenderTarget(c,l,d)};function b(n,r){let a=t.update(g);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new qe(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,g,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,g,null)}function x(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,C)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function S(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=x(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=x(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)S(c[e],i,a,o,s)}function C(e){e.target.removeEventListener(`dispose`,C);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var Jr={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Yr(e,t){function n(){let t=!1,n=new Ae,r=null,i=new Ae(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?R(e.DEPTH_TEST):z(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Jr[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?R(e.STENCIL_TEST):z(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new Y(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ee=!1,te=0,M=e.getParameter(e.VERSION);M.indexOf(`WebGL`)===-1?M.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(M)[1]),ee=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(M)[1]),ee=te>=1);let N=null,P={},ne=e.getParameter(e.SCISSOR_BOX),F=e.getParameter(e.VIEWPORT),re=new Ae().fromArray(ne),ie=new Ae().fromArray(F);function I(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let L={};L[e.TEXTURE_2D]=I(e.TEXTURE_2D,e.TEXTURE_2D,1),L[e.TEXTURE_CUBE_MAP]=I(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),L[e.TEXTURE_2D_ARRAY]=I(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),L[e.TEXTURE_3D]=I(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),R(e.DEPTH_TEST),o.setFunc(3),le(!1),ue(1),R(e.CULL_FACE),H(0);function R(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function z(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ae(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function B(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function oe(t){return m!==t&&(e.useProgram(t),m=t,!0)}let se={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};se[103]=e.MIN,se[104]=e.MAX;let V={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function H(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(z(e.BLEND),h=!1);return}if(h===!1&&(R(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(se[n],se[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(V[r],V[i],V[o],V[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function ce(t,n){t.side===2?z(e.CULL_FACE):R(e.CULL_FACE);let r=t.side===1;n&&(r=!r),le(r),t.blending===1&&t.transparent===!1?H(0):H(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),de(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?R(e.SAMPLE_ALPHA_TO_COVERAGE):z(e.SAMPLE_ALPHA_TO_COVERAGE)}function le(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function ue(t){t===0?z(e.CULL_FACE):(R(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function U(t){t!==O&&(ee&&e.lineWidth(t),O=t)}function de(t,n,r){t?(R(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(e.polygonOffset(n,r),k=n,A=r)):z(e.POLYGON_OFFSET_FILL)}function W(t){t?R(e.SCISSOR_TEST):z(e.SCISSOR_TEST)}function fe(t){t===void 0&&(t=e.TEXTURE0+j-1),N!==t&&(e.activeTexture(t),N=t)}function pe(t,n,r){r===void 0&&(r=N===null?e.TEXTURE0+j-1:N);let i=P[r];i===void 0&&(i={type:void 0,texture:void 0},P[r]=i),(i.type!==t||i.texture!==n)&&(N!==r&&(e.activeTexture(r),N=r),e.bindTexture(t,n||L[t]),i.type=t,i.texture=n)}function G(){let t=P[N];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function me(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function he(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function K(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ge(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function q(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function _e(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ve(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ye(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function be(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function xe(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Se(t){re.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),re.copy(t))}function Ce(t){ie.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ie.copy(t))}function we(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Te(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Ee(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},N=null,P={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new Y(0,0,0),w=0,T=!1,E=null,D=null,O=null,k=null,A=null,re.set(0,0,e.canvas.width,e.canvas.height),ie.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:R,disable:z,bindFramebuffer:ae,drawBuffers:B,useProgram:oe,setBlending:H,setMaterial:ce,setFlipSided:le,setCullFace:ue,setLineWidth:U,setPolygonOffset:de,setScissorTest:W,activeTexture:fe,bindTexture:pe,unbindTexture:G,compressedTexImage2D:me,compressedTexImage3D:he,texImage2D:be,texImage3D:xe,updateUBOMapping:we,uniformBlockBinding:Te,texStorage2D:ve,texStorage3D:ye,texSubImage2D:K,texSubImage3D:ge,compressedTexSubImage2D:q,compressedTexSubImage3D:_e,scissor:Se,viewport:Ce,reset:Ee}}function Xr(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ve,u=new WeakMap,d,m=new WeakMap,h=!1;try{h=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function g(e,t){return h?new OffscreenCanvas(e,t):_(`canvas`)}function v(e,t,n){let r=1,i=_e(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=g(n,a));let o=t?g(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(t){e.generateMipmap(t)}function x(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function S(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?je:pe.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function C(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function w(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function T(e){let t=e.target;t.removeEventListener(`dispose`,T),D(t),t.isVideoTexture&&u.delete(t)}function E(e){let t=e.target;t.removeEventListener(`dispose`,E),k(t)}function D(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=m.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&O(e),Object.keys(i).length===0&&m.delete(n)}r.remove(e)}function O(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=m.get(i);delete a[n.__cacheKey],o.memory.textures--}function k(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let A=0;function j(){A=0}function ee(){let e=A;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),A+=1,e}function te(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function M(t,i){let a=r.get(t);if(t.isVideoTexture&&K(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{oe(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function N(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){oe(a,t,i);return}n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function ne(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){oe(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function re(t,i){let a=r.get(t);if(t.version>0&&a.__version!==t.version){se(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ie={[P]:e.REPEAT,[Ke]:e.CLAMP_TO_EDGE,[F]:e.MIRRORED_REPEAT},I={[Oe]:e.NEAREST,[Te]:e.NEAREST_MIPMAP_NEAREST,[p]:e.NEAREST_MIPMAP_LINEAR,[Ge]:e.LINEAR,[ye]:e.LINEAR_MIPMAP_NEAREST,[ge]:e.LINEAR_MIPMAP_LINEAR},L={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function R(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ie[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ie[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ie[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,I[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,I[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,L[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function z(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,T));let i=n.source,a=m.get(i);a===void 0&&(a={},m.set(i,a));let s=te(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&O(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ae(e,t,n){return Math.floor(Math.floor(e/n)/t)}function B(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ae(n.start,r.width,4),c=ae(t.start,r.width,4);n.start<=i+1&&a===c&&ae(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function oe(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=z(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=pe.getPrimaries(pe.workingColorSpace),r=o.colorSpace===``?null:pe.getPrimaries(o.colorSpace),p=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,p);let m=v(o.image,!1,i.maxTextureSize);m=q(o,m);let h=a.convert(o.format,o.colorSpace),g=a.convert(o.type),_=S(o.internalFormat,h,g,o.colorSpace,o.isVideoTexture);R(c,o);let x,T=o.mipmaps,E=o.isVideoTexture!==!0,D=d.__version===void 0||l===!0,O=u.dataReady,k=w(o,m);if(o.isDepthTexture)_=C(o.format===f,o.type),D&&(E?n.texStorage2D(e.TEXTURE_2D,1,_,m.width,m.height):n.texImage2D(e.TEXTURE_2D,0,_,m.width,m.height,0,h,g,null));else if(o.isDataTexture){if(T.length>0){E&&D&&n.texStorage2D(e.TEXTURE_2D,k,_,T[0].width,T[0].height);for(let t=0,r=T.length;t<r;t++)x=T[t],E?O&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,x.width,x.height,h,g,x.data):n.texImage2D(e.TEXTURE_2D,t,_,x.width,x.height,0,h,g,x.data);o.generateMipmaps=!1}else E?(D&&n.texStorage2D(e.TEXTURE_2D,k,_,m.width,m.height),O&&B(o,m,h,g)):n.texImage2D(e.TEXTURE_2D,0,_,m.width,m.height,0,h,g,m.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){E&&D&&n.texStorage3D(e.TEXTURE_2D_ARRAY,k,_,T[0].width,T[0].height,m.depth);for(let t=0,r=T.length;t<r;t++)if(x=T[t],o.format!==1023){if(h!==null){if(E){if(O){if(o.layerUpdates.size>0){let r=Ye(x.width,x.height,o.format,o.type);for(let i of o.layerUpdates){let a=x.data.subarray(i*r/x.data.BYTES_PER_ELEMENT,(i+1)*r/x.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,x.width,x.height,1,h,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,x.width,x.height,m.depth,h,x.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,_,x.width,x.height,m.depth,0,x.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else E?O&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,x.width,x.height,m.depth,h,g,x.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,_,x.width,x.height,m.depth,0,h,g,x.data)}else{E&&D&&n.texStorage2D(e.TEXTURE_2D,k,_,T[0].width,T[0].height);for(let t=0,r=T.length;t<r;t++)x=T[t],o.format===1023?E?O&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,x.width,x.height,h,g,x.data):n.texImage2D(e.TEXTURE_2D,t,_,x.width,x.height,0,h,g,x.data):h===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):E?O&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,x.width,x.height,h,x.data):n.compressedTexImage2D(e.TEXTURE_2D,t,_,x.width,x.height,0,x.data)}}else if(o.isDataArrayTexture){if(E){if(D&&n.texStorage3D(e.TEXTURE_2D_ARRAY,k,_,m.width,m.height,m.depth),O){if(o.layerUpdates.size>0){let t=Ye(m.width,m.height,o.format,o.type);for(let r of o.layerUpdates){let i=m.data.subarray(r*t/m.data.BYTES_PER_ELEMENT,(r+1)*t/m.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,m.width,m.height,1,h,g,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,m.width,m.height,m.depth,h,g,m.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,_,m.width,m.height,m.depth,0,h,g,m.data)}else if(o.isData3DTexture)E?(D&&n.texStorage3D(e.TEXTURE_3D,k,_,m.width,m.height,m.depth),O&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,m.width,m.height,m.depth,h,g,m.data)):n.texImage3D(e.TEXTURE_3D,0,_,m.width,m.height,m.depth,0,h,g,m.data);else if(o.isFramebufferTexture){if(D){if(E)n.texStorage2D(e.TEXTURE_2D,k,_,m.width,m.height);else{let t=m.width,r=m.height;for(let i=0;i<k;i++)n.texImage2D(e.TEXTURE_2D,i,_,t,r,0,h,g,null),t>>=1,r>>=1}}}else if(T.length>0){if(E&&D){let t=_e(T[0]);n.texStorage2D(e.TEXTURE_2D,k,_,t.width,t.height)}for(let t=0,r=T.length;t<r;t++)x=T[t],E?O&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h,g,x):n.texImage2D(e.TEXTURE_2D,t,_,h,g,x);o.generateMipmaps=!1}else if(E){if(D){let t=_e(m);n.texStorage2D(e.TEXTURE_2D,k,_,t.width,t.height)}O&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,h,g,m)}else n.texImage2D(e.TEXTURE_2D,0,_,h,g,m);y(o)&&b(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function se(t,o,s){if(o.image.length!==6)return;let c=z(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=pe.getPrimaries(pe.workingColorSpace),r=o.colorSpace===``?null:pe.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=q(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),x=S(o.internalFormat,g,_,o.colorSpace),C=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=w(o,h);R(e.TEXTURE_CUBE_MAP,o);let O;if(f){C&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,x,h.width,h.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?C?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,g,_,i.data):g===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):C?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,C&&T){O.length>0&&D++;let t=_e(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,x,t.width,t.height)}for(let t=0;t<6;t++)if(p){C?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;C?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,i.width,i.height,0,g,_,i.data)}}else{C?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,g,_,m[t]);for(let r=0;r<O.length;r++){let i=O[r];C?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,g,_,i.image[t])}}}y(o)&&b(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function V(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=S(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),he(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,me(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function H(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=C(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=me(n);he(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=S(o.internalFormat,c,l,o.colorSpace),d=me(n);r&&he(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):he(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ce(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),M(i.depthTexture,0);let o=a.__webglTexture,c=me(i);if(i.depthTexture.format===1026)he(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)he(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function le(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?ce(i.__webglFramebuffer[0],t):ce(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),H(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),H(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ue(t,n,i){let a=r.get(t);n!==void 0&&V(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&le(t)}function U(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,E);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&he(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=S(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=me(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),H(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),R(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)V(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else V(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);y(i)&&b(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),R(c,a),V(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),y(a)&&b(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),R(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)V(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else V(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);y(i)&&b(r),n.unbindTexture()}t.depthBuffer&&le(t)}function de(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(y(a)){let t=x(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),b(t),n.unbindTexture()}}}let W=[],fe=[];function G(t){if(t.samples>0){if(he(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(W.length=0,fe.length=0,W.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(W.push(l),fe.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,fe)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,W))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function me(e){return Math.min(i.maxSamples,e.samples)}function he(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function K(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function q(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(pe.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function _e(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=ee,this.resetTextureUnits=j,this.setTexture2D=M,this.setTexture2DArray=N,this.setTexture3D=ne,this.setTextureCube=re,this.rebindTextures=ue,this.setupRenderTarget=U,this.updateRenderTargetMipmap=de,this.updateMultisampleRenderTarget=G,this.setupDepthRenderbuffer=le,this.setupFrameBufferTexture=V,this.useMultisampledRTT=he}function Zr(e,t){function n(n,r=``){let i,a=pe.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Qr=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$r=`
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

}`,ei=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new k(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new h({vertexShader:Qr,fragmentShader:$r,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new $e(new nt(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ti=class extends w{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,p=null,m=null,h=typeof XRWebGLBinding<`u`,g=new ei,_={},v=t.getContextAttributes(),y=null,b=null,x=[],S=[],C=new ve,w=null,T=new te;T.viewport=new Ae;let E=new te;E.viewport=new Ae;let D=[T,E],O=new Be,A=null,j=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=x[e];return t===void 0&&(t=new et,x[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=x[e];return t===void 0&&(t=new et,x[e]=t),t.getGripSpace()},this.getHand=function(e){let t=x[e];return t===void 0&&(t=new et,x[e]=t),t.getHandSpace()};function ee(e){let t=S.indexOf(e.inputSource);if(t===-1)return;let n=x[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function M(){r.removeEventListener(`select`,ee),r.removeEventListener(`selectstart`,ee),r.removeEventListener(`selectend`,ee),r.removeEventListener(`squeeze`,ee),r.removeEventListener(`squeezestart`,ee),r.removeEventListener(`squeezeend`,ee),r.removeEventListener(`end`,M),r.removeEventListener(`inputsourceschange`,N);for(let e=0;e<x.length;e++){let t=S[e];t!==null&&(S[e]=null,x[e].disconnect(t))}A=null,j=null,g.reset();for(let e in _)delete _[e];e.setRenderTarget(y),p=null,d=null,u=null,r=null,b=null,R.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?p:d},this.getBinding=function(){return u===null&&h&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(y=e.getRenderTarget(),r.addEventListener(`select`,ee),r.addEventListener(`selectstart`,ee),r.addEventListener(`selectend`,ee),r.addEventListener(`squeeze`,ee),r.addEventListener(`squeezestart`,ee),r.addEventListener(`squeezeend`,ee),r.addEventListener(`end`,M),r.addEventListener(`inputsourceschange`,N),v.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(C),h&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;v.depth&&(o=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=v.stencil?f:Ee,a=v.stencil?Pe:he);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),b=new qe(d.textureWidth,d.textureHeight,{format:U,type:Se,depthTexture:new we(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),b=new qe(p.framebufferWidth,p.framebufferHeight,{format:U,type:Se,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),R.setContext(r),R.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function N(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=S.indexOf(n);r>=0&&(S[r]=null,x[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=S.indexOf(n);if(r===-1){for(let e=0;e<x.length;e++)if(e>=S.length){S.push(n),r=e;break}else if(S[e]===null){S[e]=n,r=e;break}if(r===-1)break}let i=x[r];i&&i.connect(n)}}let P=new J,ne=new J;function F(e,t,n){P.setFromMatrixPosition(t.matrixWorld),ne.setFromMatrixPosition(n.matrixWorld);let r=P.distanceTo(ne),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function re(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;g.texture!==null&&(g.depthNear>0&&(t=g.depthNear),g.depthFar>0&&(n=g.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(A!==O.near||j!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),A=O.near,j=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&3,E.layers.mask=O.layers.mask&5;let i=e.parent,a=O.cameras;re(O,i);for(let e=0;e<a.length;e++)re(a[e],i);a.length===2?F(O,T,E):O.projectionMatrix.copy(T.projectionMatrix),ie(e,O,i)};function ie(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Le*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||p!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(O)},this.getCameraTexture=function(e){return _[e]};let I=null;function L(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(b,p.framebuffer),e.setRenderTarget(b));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(b,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(b))}let o=D[n];o===void 0&&(o=new te,o.layers.enable(n),o.viewport=new Ae,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&h){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&g.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&h){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=_[n];e||(e=new k,_[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<x.length;e++){let t=S[e],n=x[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}I&&I(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let R=new it;R.setAnimationLoop(L),this.setAnimationLoop=function(e){I=e},this.dispose=function(){}}},ni=new re,ri=new me;function ii(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,oe(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,ni.copy(o),ni.x*=-1,ni.y*=-1,ni.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(ni.y*=-1,ni.z*=-1),e.envMapRotation.value.setFromMatrix4(ri.makeRotationFromEuler(ni)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function ai(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var oi=class{constructor(e={}){let{canvas:t=z(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Uint32Array(4),m=new Int32Array(4),h=null,g=null,_=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,x=!1;this._outputColorSpace=ee;let S=0,C=0,w=null,T=-1,D=null,k=new Ae,A=new Ae,j=null,te=new Y(0),M=0,N=t.width,P=t.height,F=1,re=null,ie=null,I=new Ae(0,0,N,P),L=new Ae(0,0,N,P),R=!1,ae=new O,B=!1,oe=!1,se=new me,V=new J,H=new Ae,ce={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},le=!1;function ue(){return w===null?F:1}let U=n;function de(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,Ve,!1),t.addEventListener(`webglcontextrestored`,He,!1),t.addEventListener(`webglcontextcreationerror`,Ue,!1),U===null){let t=`webgl2`;if(U=de(t,e),U===null)throw de(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let W,fe,G,he,K,q,_e,ve,ye,xe,Ce,we,Te,Ee,De,Oe,ke,je,Me,Ne,Pe,Ie,Le,Re;function ze(){W=new Rt(U),W.init(),Ie=new Zr(U,W),fe=new pt(U,W,e,Ie),G=new Yr(U,W),fe.reversedDepthBuffer&&d&&G.buffers.depth.setReversed(!0),he=new Vt(U),K=new Nr,q=new Xr(U,W,G,K,fe,Ie,he),_e=new ht(y),ve=new Lt(y),ye=new at(U),Le=new dt(U,ye),xe=new zt(U,ye,he,Le),Ce=new Ut(U,xe,ye,he),Me=new Ht(U,fe,q),Oe=new mt(K),we=new Mr(y,_e,ve,W,fe,Le,Oe),Te=new ii(y,K),Ee=new Lr,De=new Wr(W),je=new ut(y,_e,ve,G,Ce,f,s),ke=new qr(y,Ce,fe),Re=new ai(U,he,fe,G),Ne=new ft(U,W,he),Pe=new Bt(U,W,he),he.programs=we.programs,y.capabilities=fe,y.extensions=W,y.properties=K,y.renderLists=Ee,y.shadowMap=ke,y.state=G,y.info=he}ze();let Be=new ti(y,U);this.xr=Be,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let e=W.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=W.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return F},this.setPixelRatio=function(e){e!==void 0&&(F=e,this.setSize(N,P,!1))},this.getSize=function(e){return e.set(N,P)},this.setSize=function(e,n,r=!0){if(Be.isPresenting){console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`);return}N=e,P=n,t.width=Math.floor(e*F),t.height=Math.floor(n*F),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(N*F,P*F).floor()},this.setDrawingBufferSize=function(e,n,r){N=e,P=n,F=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(k)},this.getViewport=function(e){return e.copy(I)},this.setViewport=function(e,t,n,r){e.isVector4?I.set(e.x,e.y,e.z,e.w):I.set(e,t,n,r),G.viewport(k.copy(I).multiplyScalar(F).round())},this.getScissor=function(e){return e.copy(L)},this.setScissor=function(e,t,n,r){e.isVector4?L.set(e.x,e.y,e.z,e.w):L.set(e,t,n,r),G.scissor(A.copy(L).multiplyScalar(F).round())},this.getScissorTest=function(){return R},this.setScissorTest=function(e){G.setScissorTest(R=e)},this.setOpaqueSort=function(e){re=e},this.setTransparentSort=function(e){ie=e},this.getClearColor=function(e){return e.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor(...arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(w!==null){let t=w.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=w.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=je.getClearColor(),r=je.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(p[0]=i,p[1]=a,p[2]=o,p[3]=r,U.clearBufferuiv(U.COLOR,0,p)):(m[0]=i,m[1]=a,m[2]=o,m[3]=r,U.clearBufferiv(U.COLOR,0,m))}else r|=U.COLOR_BUFFER_BIT}t&&(r|=U.DEPTH_BUFFER_BIT),n&&(r|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ve,!1),t.removeEventListener(`webglcontextrestored`,He,!1),t.removeEventListener(`webglcontextcreationerror`,Ue,!1),je.dispose(),Ee.dispose(),De.dispose(),K.dispose(),_e.dispose(),ve.dispose(),Ce.dispose(),Le.dispose(),Re.dispose(),we.dispose(),Be.dispose(),Be.removeEventListener(`sessionstart`,Ze),Be.removeEventListener(`sessionend`,Qe),$e.stop()};function Ve(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),x=!0}function He(){console.log(`THREE.WebGLRenderer: Context Restored.`),x=!1;let e=he.autoReset,t=ke.enabled,n=ke.autoUpdate,r=ke.needsUpdate,i=ke.type;ze(),he.autoReset=e,ke.enabled=t,ke.autoUpdate=n,ke.needsUpdate=r,ke.type=i}function Ue(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function We(e){let t=e.target;t.removeEventListener(`dispose`,We),Ge(t)}function Ge(e){Ke(e),K.remove(e)}function Ke(e){let t=K.get(e).programs;t!==void 0&&(t.forEach(function(e){we.releaseProgram(e)}),e.isShaderMaterial&&we.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=ce);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=st(e,t,n,r,i);G.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=xe.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Le.setup(i,r,s,n,c);let h,g=Ne;if(c!==null&&(h=ye.get(c),g=Pe,g.setIndex(h)),i.isMesh)r.wireframe===!0?(G.setLineWidth(r.wireframeLinewidth*ue()),g.setMode(U.LINES)):g.setMode(U.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),G.setLineWidth(e*ue()),i.isLineSegments?g.setMode(U.LINES):i.isLineLoop?g.setMode(U.LINE_LOOP):g.setMode(U.LINE_STRIP)}else i.isPoints?g.setMode(U.POINTS):i.isSprite&&g.setMode(U.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)ne(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(W.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ye.get(c).bytesPerElement:1,o=K.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(U,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Je(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Z(e,t,n),e.side=0,e.needsUpdate=!0,Z(e,t,n),e.side=2):Z(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),g=De.get(n),g.init(t),v.push(g),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),g.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Je(a,n,e),r.add(a)}else Je(t,n,e),r.add(t)}}),g=v.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){K.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}W.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Ye=null;function Xe(e){Ye&&Ye(e)}function Ze(){$e.stop()}function Qe(){$e.start()}let $e=new it;$e.setAnimationLoop(Xe),typeof self<`u`&&$e.setContext(self),this.setAnimationLoop=function(e){Ye=e,Be.setAnimationLoop(e),e===null?$e.stop():$e.start()},Be.addEventListener(`sessionstart`,Ze),Be.addEventListener(`sessionend`,Qe),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(x===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Be.enabled===!0&&Be.isPresenting===!0&&(Be.cameraAutoUpdate===!0&&Be.updateCamera(t),t=Be.getCamera()),e.isScene===!0&&e.onBeforeRender(y,e,t,w),g=De.get(e,v.length),g.init(t),v.push(g),se.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ae.setFromProjectionMatrix(se,be,t.reversedDepth),oe=this.localClippingEnabled,B=Oe.init(this.clippingPlanes,oe),h=Ee.get(e,_.length),h.init(),_.push(h),Be.enabled===!0&&Be.isPresenting===!0){let e=y.xr.getDepthSensingMesh();e!==null&&et(e,t,-1/0,y.sortObjects)}et(e,t,0,y.sortObjects),h.finish(),y.sortObjects===!0&&h.sort(re,ie),le=Be.enabled===!1||Be.isPresenting===!1||Be.hasDepthSensing()===!1,le&&je.addToRenderList(h,e),this.info.render.frame++,B===!0&&Oe.beginShadows();let n=g.state.shadowsArray;ke.render(n,e,t),B===!0&&Oe.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=h.opaque,i=h.transmissive;if(g.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];tt(r,i,e,a)}le&&je.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];X(h,e,r,r.viewport)}}else i.length>0&&tt(r,i,e,t),le&&je.render(e),X(h,e,t);w!==null&&C===0&&(q.updateMultisampleRenderTarget(w),q.updateRenderTargetMipmap(w)),e.isScene===!0&&e.onAfterRender(y,e,t),Le.resetDefaultState(),T=-1,D=null,v.pop(),v.length>0?(g=v[v.length-1],B===!0&&Oe.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,_.pop(),h=_.length>0?_[_.length-1]:null};function et(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)g.pushLight(e),e.castShadow&&g.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ae.intersectsSprite(e)){r&&H.setFromMatrixPosition(e.matrixWorld).applyMatrix4(se);let t=Ce.update(e),i=e.material;i.visible&&h.push(e,t,i,n,H.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ae.intersectsObject(e))){let t=Ce.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),H.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),H.copy(e.boundingSphere.center)),H.applyMatrix4(e.matrixWorld).applyMatrix4(se)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&h.push(e,t,s,n,H.z,o)}}else i.visible&&h.push(e,t,i,n,H.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)et(i[e],t,n,r)}function X(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;g.setupLightsView(n),B===!0&&Oe.setGlobalState(y.clippingPlanes,n),r&&G.viewport(k.copy(r)),i.length>0&&nt(i,t,n),a.length>0&&nt(a,t,n),o.length>0&&nt(o,t,n),G.buffers.depth.setTest(!0),G.buffers.depth.setMask(!0),G.buffers.color.setMask(!0),G.setPolygonOffset(!1)}function tt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[r.id]===void 0&&(g.state.transmissionRenderTarget[r.id]=new qe(1,1,{generateMipmaps:!0,type:W.has(`EXT_color_buffer_half_float`)||W.has(`EXT_color_buffer_float`)?E:Se,minFilter:ge,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:pe.workingColorSpace}));let a=g.state.transmissionRenderTarget[r.id],o=r.viewport||k;a.setSize(o.z*y.transmissionResolutionScale,o.w*y.transmissionResolutionScale);let s=y.getRenderTarget(),c=y.getActiveCubeFace(),l=y.getActiveMipmapLevel();y.setRenderTarget(a),y.getClearColor(te),M=y.getClearAlpha(),M<1&&y.setClearColor(16777215,.5),y.clear(),le&&je.render(n);let u=y.toneMapping;y.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),g.setupLightsView(r),B===!0&&Oe.setGlobalState(y.clippingPlanes,r),nt(e,n,r),q.updateMultisampleRenderTarget(a),q.updateRenderTargetMipmap(a),W.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,rt(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(q.updateMultisampleRenderTarget(a),q.updateRenderTargetMipmap(a))}y.setRenderTarget(s,c,l),y.setClearColor(te,M),d!==void 0&&(r.viewport=d),y.toneMapping=u}function nt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&rt(o,t,n,s,l,c)}}function rt(e,t,n,r,i,a){e.onBeforeRender(y,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(y,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=2):y.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(y,t,n,r,i,a)}function Z(e,t,n){t.isScene!==!0&&(t=ce);let r=K.get(e),i=g.state.lights,a=g.state.shadowsArray,o=i.state.version,s=we.getParameters(e,i.state,a,t,n),c=we.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?ve:_e).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,We),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return ot(e,s),u}else s.uniforms=we.getUniforms(e),e.onBeforeCompile(s,y),u=we.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=Oe.uniform),ot(e,s),r.needsLights=lt(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function Q(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Zn.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ot(e,t){let n=K.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function st(e,t,n,r,i){t.isScene!==!0&&(t=ce),q.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=w===null?y.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Fe,c=(r.isMeshStandardMaterial?ve:_e).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(m=y.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=h===void 0?0:h.length,v=K.get(r),b=g.state.lights;if(B===!0&&(oe===!0||e!==D)){let t=e===D&&r.id===T;Oe.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Oe.numPlanes||v.numIntersection!==Oe.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=Z(r,t,i));let C=!1,E=!1,O=!1,k=S.getUniforms(),A=v.uniforms;if(G.useProgram(S.program)&&(C=!0,E=!0,O=!0),r.id!==T&&(T=r.id,E=!0),C||D!==e){G.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),k.setValue(U,`projectionMatrix`,e.projectionMatrix),k.setValue(U,`viewMatrix`,e.matrixWorldInverse);let t=k.map.cameraPosition;t!==void 0&&t.setValue(U,V.setFromMatrixPosition(e.matrixWorld)),fe.logarithmicDepthBuffer&&k.setValue(U,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&k.setValue(U,`isOrthographic`,e.isOrthographicCamera===!0),D!==e&&(D=e,E=!0,O=!0)}if(i.isSkinnedMesh){k.setOptional(U,i,`bindMatrix`),k.setOptional(U,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),k.setValue(U,`boneTexture`,e.boneTexture,q))}i.isBatchedMesh&&(k.setOptional(U,i,`batchingTexture`),k.setValue(U,`batchingTexture`,i._matricesTexture,q),k.setOptional(U,i,`batchingIdTexture`),k.setValue(U,`batchingIdTexture`,i._indirectTexture,q),k.setOptional(U,i,`batchingColorTexture`),i._colorsTexture!==null&&k.setValue(U,`batchingColorTexture`,i._colorsTexture,q));let j=n.morphAttributes;if((j.position!==void 0||j.normal!==void 0||j.color!==void 0)&&Me.update(i,n,S),(E||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,k.setValue(U,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(A.envMap.value=c,A.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),E&&(k.setValue(U,`toneMappingExposure`,y.toneMappingExposure),v.needsLights&&ct(A,O),a&&r.fog===!0&&Te.refreshFogUniforms(A,a),Te.refreshMaterialUniforms(A,r,F,P,g.state.transmissionRenderTarget[e.id]),Zn.upload(U,Q(v),A,q)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Zn.upload(U,Q(v),A,q),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&k.setValue(U,`center`,i.center),k.setValue(U,`modelViewMatrix`,i.modelViewMatrix),k.setValue(U,`normalMatrix`,i.normalMatrix),k.setValue(U,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Re.update(n,S),Re.bind(n,S)}}return S}function ct(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function lt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(e,t,n){let r=K.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),K.get(e.texture).__webglTexture=t,K.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=K.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let gt=U.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){w=e,S=t,C=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=K.get(e);if(s.__useDefaultFramebuffer!==void 0)G.bindFramebuffer(U.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)q.setupRenderTarget(e);else if(s.__hasExternalTextures)q.rebindTextures(e,K.get(e.texture).__webglTexture,K.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&K.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);q.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=K.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&q.useMultisampledRTT(e)===!1?K.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,k.copy(e.viewport),A.copy(e.scissor),j=e.scissorTest}else k.copy(I).multiplyScalar(F).floor(),A.copy(L).multiplyScalar(F).floor(),j=R;if(n!==0&&(i=gt),G.bindFramebuffer(U.FRAMEBUFFER,i)&&r&&G.drawBuffers(e,i),G.viewport(k),G.scissor(A),G.setScissorTest(j),a){let r=K.get(e.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=K.get(e.textures[t]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=K.get(e.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,t.__webglTexture,n)}T=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=K.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){G.bindFramebuffer(U.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!fe.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!fe.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+s),U.readPixels(t,n,r,i,Ie.convert(c),Ie.convert(l),a))}finally{let e=w===null?null:K.get(w).__webglFramebuffer;G.bindFramebuffer(U.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=K.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){G.bindFramebuffer(U.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!fe.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!fe.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,d),U.bufferData(U.PIXEL_PACK_BUFFER,a.byteLength,U.STREAM_READ),e.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+s),U.readPixels(t,n,r,i,Ie.convert(l),Ie.convert(u),0);let f=w===null?null:K.get(w).__webglFramebuffer;G.bindFramebuffer(U.FRAMEBUFFER,f);let p=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await b(U,p,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,d),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,a),U.deleteBuffer(d),U.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;q.setTexture2D(e,0),U.copyTexSubImage2D(U.TEXTURE_2D,n,0,0,o,s,i,a),G.unbindTexture()};let _t=U.createFramebuffer(),vt=U.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(ne(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ie.convert(t.format),_=Ie.convert(t.type),v;t.isData3DTexture?(q.setTexture3D(t,0),v=U.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(q.setTexture2DArray(t,0),v=U.TEXTURE_2D_ARRAY):(q.setTexture2D(t,0),v=U.TEXTURE_2D),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,t.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,t.unpackAlignment);let y=U.getParameter(U.UNPACK_ROW_LENGTH),b=U.getParameter(U.UNPACK_IMAGE_HEIGHT),x=U.getParameter(U.UNPACK_SKIP_PIXELS),S=U.getParameter(U.UNPACK_SKIP_ROWS),C=U.getParameter(U.UNPACK_SKIP_IMAGES);U.pixelStorei(U.UNPACK_ROW_LENGTH,h.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,h.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,l),U.pixelStorei(U.UNPACK_SKIP_ROWS,u),U.pixelStorei(U.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=K.get(e),r=K.get(t),h=K.get(n.__renderTarget),g=K.get(r.__renderTarget);G.bindFramebuffer(U.READ_FRAMEBUFFER,h.__webglFramebuffer),G.bindFramebuffer(U.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,K.get(e).__webglTexture,i,d+n),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,K.get(t).__webglTexture,a,m+n)),U.blitFramebuffer(l,u,o,s,f,p,o,s,U.DEPTH_BUFFER_BIT,U.NEAREST);G.bindFramebuffer(U.READ_FRAMEBUFFER,null),G.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||K.has(e)){let n=K.get(e),r=K.get(t);G.bindFramebuffer(U.READ_FRAMEBUFFER,_t),G.bindFramebuffer(U.DRAW_FRAMEBUFFER,vt);for(let e=0;e<c;e++)w?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,n.__webglTexture,i),T?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,r.__webglTexture,a),i===0?T?U.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):U.copyTexSubImage2D(v,a,f,p,l,u,o,s):U.blitFramebuffer(l,u,o,s,f,p,o,s,U.COLOR_BUFFER_BIT,U.NEAREST);G.bindFramebuffer(U.READ_FRAMEBUFFER,null),G.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?U.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?U.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):U.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):U.texSubImage2D(U.TEXTURE_2D,a,f,p,o,s,g,_,h);U.pixelStorei(U.UNPACK_ROW_LENGTH,y),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,b),U.pixelStorei(U.UNPACK_SKIP_PIXELS,x),U.pixelStorei(U.UNPACK_SKIP_ROWS,S),U.pixelStorei(U.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&U.generateMipmap(v),G.unbindTexture()},this.initRenderTarget=function(e){K.get(e).__webglFramebuffer===void 0&&q.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?q.setTextureCube(e,0):e.isData3DTexture?q.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?q.setTexture2DArray(e,0):q.setTexture2D(e,0),G.unbindTexture()},this.resetState=function(){S=0,C=0,w=null,G.reset(),Le.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return be}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=pe._getDrawingBufferColorSpace(e),t.unpackColorSpace=pe._getUnpackColorSpace()}},si=Re(`fps`),ci=si!==null&&!isNaN(+si)?+si:Me?30:60,li=performance.now();for(let e of[`pointerdown`,`pointermove`,`keydown`,`wheel`,`touchstart`])addEventListener(e,()=>li=performance.now(),{capture:!0,passive:!0});function ui(e,t=()=>!1){let n=0,r=-1/0,i=performance.now(),a=!1,o=s=>{if(a||(n=requestAnimationFrame(o),document.hidden))return;let c=s-li,l=ci;if(si===null&&(Me&&c>3e4?l=4:!Me&&c>8e3&&t()&&(l=30)),l>0){let e=1e3/l;if(s-r<e-1.5)return;r=s-r>e*2?s:r+e}let u=Math.min(.1,Math.max(0,(s-i)/1e3));i=s,e(s,u)};return n=requestAnimationFrame(o),()=>{a=!0,cancelAnimationFrame(n)}}var di=25,fi=300,pi=120,mi=2.5,hi=.6,gi=450,_i=class{static on=Re(`perf`)===`1`;el;chart;ctx;text;copyBtn;times=new Float32Array(pi);n=0;log=[];events=[];moves=0;start=performance.now();lastPrograms=-1;worst=0;slow=0;copiedUntil=0;prev=null;view=null;jerks=0;onMove=()=>this.moves++;constructor(e){let t=this.el=document.createElement(`div`);t.style.cssText=`position:absolute;right:8px;top:calc(var(--top-clear, 104px) + 8px);z-index:60;width:220px;padding:6px;border-radius:10px;background:rgba(20,16,30,.72);color:#fff;font:11px/1.35 ui-monospace,Menlo,monospace;pointer-events:auto;touch-action:none`;for(let e of[`pointerdown`,`click`])t.addEventListener(e,e=>e.stopPropagation());let n=this.chart=document.createElement(`canvas`);n.width=416,n.height=112,n.style.cssText=`display:block;width:208px;height:56px`,this.ctx=n.getContext(`2d`),this.text=document.createElement(`div`),this.text.style.cssText=`margin:4px 0;white-space:pre-wrap`;let r=document.createElement(`div`);r.style.cssText=`display:flex;gap:6px`;let i=(e,t)=>{let n=document.createElement(`button`);return n.textContent=e,n.style.cssText=`flex:1;height:40px;border:none;border-radius:8px;background:#F7B6D2;color:#3A1E3A;font:600 13px system-ui`,n.addEventListener(`click`,t),r.appendChild(n),n};this.copyBtn=i(`Copy`,()=>this.copy()),i(`Clear`,()=>this.clear()),t.append(n,this.text,r),e.appendChild(t),addEventListener(`pointermove`,this.onMove,{capture:!0,passive:!0})}event(e){this.events.push(e)}frame(e,t,n){n&&this.jerk(e,t,n);let r=[...this.events];this.events.length=0,this.lastPrograms>=0&&t.programs>this.lastPrograms&&r.push(`programs +${t.programs-this.lastPrograms}`),this.lastPrograms=t.programs;let i=this.prev;if(this.prev={now:e,f:t,extra:r},!i)return;let a=e-i.now,o=i.f;this.times[this.n++%pi]=a;let s=((performance.now()-this.start)/1e3).toFixed(1);if(a>di){this.slow++,this.worst=Math.max(this.worst,a);let e=this.times[(this.n-2+pi)%pi];this.log.push(`${s}s ${a.toFixed(0)}ms (prev ${e.toFixed(0)}) upd ${o.update.toFixed(1)} rnd ${o.render.toFixed(1)} calls ${o.calls} tris ${(o.tris/1e3).toFixed(0)}k dpr ${o.dpr} moves ${this.moves} ${o.finger?`finger`:`no-finger`}`+(o.note?` | ${o.note}`:``)+(i.extra.length?` | ${i.extra.join(`, `)}`:``)),this.log.length>fi&&this.log.shift()}else i.extra.length&&this.log.push(`${s}s event: ${i.extra.join(`, `)}`);this.moves=0,this.n%6==0&&this.draw(o),this.copiedUntil&&performance.now()>this.copiedUntil&&(this.copiedUntil=0,this.copyBtn.textContent=`Copy`)}jerk(e,t,n){let r=n.m,i=[r[12],r[13],r[14]],a=[-r[8],-r[9],-r[10]],o=this.view,s=this.times[(this.n-1+pi)%pi];if(this.view={now:e,p:i,d:a,s:n.focus?{...n.focus}:null},!o)return;let c=(e-o.now)/1e3;if(c<=0)return;let l=i.map((e,t)=>(e-o.p[t])/c),u=a.map((e,t)=>(e-o.d[t])/c),d=n.focus&&o.s?[(n.focus.x-o.s.x)/c,(n.focus.y-o.s.y)/c]:void 0;if(Object.assign(this.view,{v:l,w:u,sv:d}),!o.v||!o.w||c*1e3>di||s>di)return;let f=(e,t)=>Math.hypot(...e.map((e,n)=>e-t[n])),p=f(l,o.v),m=f(u,o.w),h=d&&o.sv?f(d,o.sv):0,g=[p>mi&&`camera speed Δ${p.toFixed(1)}m/s`,m>hi&&`camera turn Δ${m.toFixed(2)}rad/s`,h>gi&&`on screen Δ${h.toFixed(0)}px/s`].filter(Boolean);if(!g.length)return;this.jerks++;let _=((performance.now()-this.start)/1e3).toFixed(1);this.log.push(`${_}s jerk: ${g.join(`, `)} (${(c*1e3).toFixed(0)}ms) ${t.finger?`finger`:`no-finger`}${t.note?` | ${t.note}`:``}`),this.log.length>fi&&this.log.shift()}draw(e){let t=this.ctx;if(t){let e=this.chart.width,n=this.chart.height,r=e=>n-Math.min(1,e/66)*n;t.clearRect(0,0,e,n);let i=e/pi,a=Math.min(this.n,pi);for(let e=0;e<a;e++){let o=this.times[(this.n-a+e+240)%pi];t.fillStyle=o>33?`#FF5A6E`:o>di?`#FFC24B`:`#7EE2A8`,t.fillRect(e*i,r(o),Math.max(1,i-1),n-r(o))}t.fillStyle=`rgba(255,255,255,.5)`,t.fillRect(0,r(16.7),e,2),t.fillRect(0,r(33.3),e,2)}let n=0,r=Math.min(this.n,pi);for(let e=0;e<r;e++)n+=this.times[e];this.text.textContent=`fps ${Math.round(1e3/(n/Math.max(1,r)))}  slow ${this.slow}  worst ${this.worst.toFixed(0)}ms  jerks ${this.jerks}\ncalls ${e.calls}  tris ${(e.tris/1e3).toFixed(0)}k  dpr ${e.dpr}\nupd ${e.update.toFixed(1)}  rnd ${e.render.toFixed(1)} ms`+(e.note?`\n${e.note}`:``)}report(){return[`perf log ${new Date().toISOString()}`,`${navigator.userAgent}`,`screen ${screen.width}x${screen.height} devicePixelRatio ${devicePixelRatio} page ${location.hash}`,`slow frames (> ${di}ms): ${this.slow}, worst ${this.worst.toFixed(0)}ms, jerks ${this.jerks}, frames ${this.n}`,``].concat(this.log).join(`
`)}copy(){let e=this.report(),t=()=>{this.copyBtn.textContent=`Copied!`,this.copiedUntil=performance.now()+1500},n=()=>{let n=document.createElement(`textarea`);n.value=e,n.style.cssText=`position:fixed;left:0;top:0;opacity:0`,document.body.appendChild(n),n.select();try{document.execCommand(`copy`),t()}finally{n.remove()}};navigator.clipboard?.writeText?navigator.clipboard.writeText(e).then(t,n):n()}clear(){this.log.length=0,this.prev=null,this.view=null,this.jerks=0,this.slow=0,this.worst=0,this.start=performance.now()}dispose(){removeEventListener(`pointermove`,this.onMove,{capture:!0}),this.el.remove()}},vi=null;function yi(){if(vi)return clearTimeout(vi.timer),vi.users++,vi.renderer;let e=document.createElement(`canvas`),t=e.getContext(`webgl2`,{antialias:!0,alpha:!1,stencil:!1,depth:!0,powerPreference:`high-performance`,preserveDrawingBuffer:Me});if(!t)throw Error(`WebGL2 is not available`);let n=new oi({canvas:e,context:t});return n.outputColorSpace=ee,n.toneMapping=0,n.debug.checkShaderErrors=!1,n.localClippingEnabled=!0,e.style.cssText=`display:block;width:100%;height:100%;touch-action:none;-webkit-tap-highlight-color:transparent;outline:none`,vi={renderer:n,users:1},n}function bi(e){if(!vi||vi.renderer!==e||(vi.users--,vi.users>0))return;let t=vi;t.timer=setTimeout(()=>{vi!==t||t.users>0||(vi=null,t.renderer.dispose(),t.renderer.forceContextLoss())},6e4)}function xi(e){vi?.renderer===e&&(vi=null)}function Si(e){let t=[],n=[],r=(e,i)=>{let a=i||!e.visible;e.isLight?a&&e.visible&&(e.visible=!1,n.push(e)):e.visible||(e.visible=!0,t.push(e));for(let t of e.children)r(t,a)};return r(e,!1),()=>{for(let e of t)e.visible=!1;for(let e of n)e.visible=!0}}function Ci(e,t,n,r=null){let i=Si(t),a;try{a=e.compile(t,n,r)}finally{i()}let o=e.properties;return new Promise(t=>{let n=()=>{for(let e of a){let t=o.get(e).currentProgram;(!t||t.isReady())&&a.delete(e)}a.size===0?t():setTimeout(n,10)};e.extensions.has(`KHR_parallel_shader_compile`)?n():setTimeout(n,10)})}var wi=`roam`,Ti=o(wi,`Roblox controls`,`src/world/engine3d/roam.ts`,{turn:{value:.32,min:.05,max:1,step:.01,label:`Camera turn`,unit:`°/px`,note:`degrees the camera swings per pixel of drag, side to side`,main:!0},tilt:{value:.22,min:.05,max:1,step:.01,label:`Camera tilt`,unit:`°/px`,note:`degrees it tilts per pixel of drag, up and down`},dragStart:{value:10,min:2,max:30,step:1,label:`Drag starts`,unit:`px`,note:`how far a finger moves before it turns the camera instead of tapping`},stickSide:{value:.5,min:.25,max:.7,step:.01,label:`Stick side`,note:`a drag that starts left of this share of the screen is the thumbstick`},stickReach:{value:.38,min:.2,max:.6,step:.01,label:`Stick reach`,note:`how far the knob travels, as a share of the stick`},stickDead:{value:.14,min:0,max:.4,step:.01,label:`Stick dead zone`,note:`a push smaller than this does nothing`,main:!0},speed:{value:1.25,min:.5,max:2.5,step:.05,label:`Walk speed`,unit:`×`,note:`a full push, times her walking speed`,main:!0}},{shared:!0}),Ei=Math.PI/180;function Di(e,t,n){let r=Math.min(1,Math.hypot(t,n)),i=Ti.stickDead;if(r<=i)return{x:0,z:0,k:0};let a=(r-i)/(1-i),o=e*Ei,s=-Math.sin(o),c=-Math.cos(o),l=Math.cos(o),u=-Math.sin(o),d=t/r,f=n/r;return{x:l*d+s*f,z:u*d+c*f,k:a}}var Oi=e(),ki=`clamp(72px, 12vmin, 88px)`,Ai=()=>Math.max(112,Math.min(184,Math.min(window.innerWidth,window.innerHeight)*.22))*Ti.stickReach,ji=20,Mi=5e4,Ni=()=>{document.documentElement.style.removeProperty(`--roam-left`)},Pi=(0,rt.forwardRef)(function({onStick:e},t){let n=u(),r=(0,rt.useRef)(null),i=(0,rt.useRef)(null),a=(0,rt.useRef)(null),o=(0,rt.useRef)(null),s=(0,rt.useRef)({walk:!1}),c=(0,rt.useRef)(null),l=()=>{c.current!==null&&clearTimeout(c.current),c.current=null,r.current&&(r.current.style.opacity=`0`,r.current.style.pointerEvents=`none`),document.documentElement.style.removeProperty(`--roam-left`)},d=()=>{l(),r.current&&(r.current.style.opacity=`0.8`,r.current.style.pointerEvents=`auto`),document.documentElement.style.setProperty(`--roam-left`,`calc(${ki} + ${ji}px)`),c.current=n.later(l,2e3)};(0,rt.useEffect)(()=>()=>{c.current!==null&&clearTimeout(c.current),Ni()},[]);let f=(t,n,a)=>{let o=Math.hypot(t,n);o>a&&(t*=a/o,n*=a/o);let s=(r.current?.offsetWidth??72)*Ti.stickReach;i.current&&(i.current.style.transform=`translate(calc(-50% + ${(t/a*s).toFixed(1)}px), calc(-50% + ${(n/a*s).toFixed(1)}px))`),e(t/a,-n/a)},p=()=>{a.current=null,i.current&&(i.current.style.transform=`translate(-50%, -50%)`),r.current?.style.setProperty(`--lit`,`0`),e(0,0)};(0,rt.useImperativeHandle)(t,()=>({show(e){let t=!!e?.walk,n=s.current;t!==n.walk&&(!t&&n.walk&&(a.current||o.current)&&(o.current=null,p()),t||l(),n.walk=t,r.current&&(r.current.style.display=t?``:`none`))},float(e,t,n,i){let c=r.current;if(!c||!s.current.walk||a.current)return;let l=o.current;l||(c.style.setProperty(`--lit`,`1`),l=o.current={cx:e,cy:t,r:Ai()},d()),f(n-l.cx,i-l.cy,l.r)},sink(){o.current&&(o.current=null,p())}}));let m=e=>{let t=a.current;t&&t.pointer===e.pointerId&&f(e.clientX-t.cx,e.clientY-t.cy,t.r)};return(0,Oi.jsx)(Oi.Fragment,{children:(0,Oi.jsxs)(`div`,{ref:r,"aria-label":`Walk`,"data-roam":`stick`,onPointerDown:e=>{if(e.stopPropagation(),o.current)return;let t=r.current.getBoundingClientRect();r.current.setPointerCapture(e.pointerId),a.current={pointer:e.pointerId,cx:t.left+t.width/2,cy:t.top+t.height/2,r:Ai()},r.current.style.setProperty(`--lit`,`1`),d(),m(e)},onPointerMove:m,onPointerUp:e=>a.current?.pointer===e.pointerId&&p(),onPointerCancel:e=>a.current?.pointer===e.pointerId&&p(),onLostPointerCapture:e=>a.current?.pointer===e.pointerId&&p(),style:{display:`none`,position:`absolute`,left:`calc(var(--safe-left, 0px) + ${ji}px)`,bottom:`calc(var(--safe-bottom, 0px) + ${ji}px)`,width:ki,height:ki,borderRadius:`50%`,background:`radial-gradient(circle, rgba(255,255,255,.55) 0 30%, rgba(255,182,214,.5) 31% 100%)`,border:`3px solid rgba(255,255,255,.9)`,boxShadow:`0 4px 14px rgba(43,35,48,.22), inset 0 0 0 calc(var(--lit, 0) * 6px) rgba(255,79,154,.45)`,zIndex:Mi,touchAction:`none`,opacity:0,pointerEvents:`none`,transition:`opacity .3s ease-out`},children:[(0,Oi.jsx)(`svg`,{viewBox:`-50 -50 100 100`,width:`100%`,height:`100%`,style:{position:`absolute`,inset:0,pointerEvents:`none`,opacity:.85},children:[0,90,180,270].map(e=>(0,Oi.jsx)(`path`,{d:`M0,-44 L-8,-33 L8,-33 Z`,fill:`#fff`,transform:`rotate(${e})`},e))}),(0,Oi.jsx)(`div`,{ref:i,style:{position:`absolute`,left:`50%`,top:`50%`,width:`46%`,height:`46%`,transform:`translate(-50%, -50%)`,borderRadius:`50%`,background:`radial-gradient(circle at 38% 34%, #ff9ccb, var(--hotpink, #ff4f9a) 70%)`,border:`3px solid #fff`,boxShadow:`0 4px 10px rgba(43,35,48,.3)`,pointerEvents:`none`}})]})})});function Fi({make:e,name:t,qaKey:n,onMode:r,worldRef:i,anchors:a,paused:o=!1}){let c=u(),l=(0,rt.useRef)(o);l.current=o;let d=(0,rt.useRef)(null),f=(0,rt.useRef)(null),p=(0,rt.useRef)(new Map),m=(0,rt.useRef)(r);m.current=r;let h=(0,rt.useRef)(null),g=(0,rt.useRef)(null),_=(0,rt.useRef)(null);return(0,rt.useEffect)(()=>{let r=d.current,a=yi(),o;try{o=e(a)}catch(e){throw bi(a),Error(`${t} could not be built`,{cause:e})}i.current=o,o.setAnchorElements(p.current);let u=a.domElement;r.prepend(u);let v={rig:o.rig,qa:()=>o.qa(),host:r,renderer:a,snapshot:()=>(o.render(),u.toDataURL(`image/png`))};De.attach(v);let y={scene:o.scene,camera:o.rig.camera,renderer:a,render:()=>o.render()};Me&&(window.__kaylee3d=y);let b=Number(Re(`dpr`)),x=b>0?b:0,S=x||Math.min(window.devicePixelRatio||1,2),C=_i.on?new _i(r):null,w=!1,T=!1,E=()=>{let e=r.getBoundingClientRect(),t=r.offsetWidth?e.width/r.offsetWidth:1,n=e.width/t,i=e.height/t;a.setPixelRatio(S),a.setSize(n,i,!1),C?.event(`resize ${Math.round(n)}x${Math.round(i)} dpr ${S}`),o.setSize(n,i,f.current?.offsetHeight??104),w&&!T&&o.render()};E();let D=new ResizeObserver(E);D.observe(r);let O=0,k=()=>{clearTimeout(O),O=c.later(E,250)};window.addEventListener(`orientationchange`,k),window.visualViewport?.addEventListener(`resize`,k);let A=[],j=[],ee=0,te=0,M=()=>{},N=null,P=()=>{w||T||(w=!0,M=ui((e,t)=>{if(l.current)return;let n=C?performance.now():0;De.frozen?o.rig.update(t):o.update(t);let r=C?performance.now():0;if(o.render(),C){let t=performance.now();C.frame(e,{update:r-n,render:t-r,calls:o.stats.calls,tris:o.stats.tris,dpr:S,programs:a.info.programs?.length??0,finger:ie.size>0,note:o.perfNote?.()??``},{m:o.rig.camera.matrixWorld.elements,focus:o.perfFocus?.()??null})}o.placeAnchors();let i=o.roam?.()??null;_.current?.show(i);let c=!!i?.walk;if(c&&!N?N=s.claim(wi):!c&&N&&(N(),N=null),A[ee++%120]=t*1e3,ee%30==0){let e=Math.min(ee,120),t=0;for(let t=0;t<e;t++)j[t]=A[t];j.length=e,j.sort((e,t)=>e-t);for(let n=0;n<e;n++)t+=j[n];o.stats.fps=Math.round(1e3/(t/e)),o.stats.p95=Math.round(j[Math.floor(e*.95)]??0)}!Me&&!o.calm&&(te=t>.02?te+1:Math.max(0,te-2),te>90&&S>1&&!x&&(C?.event(`dpr ${S}→${Math.max(1,S-.25)}`),S=Math.max(1,S-.25),te=0,E()))},()=>l.current||o.calm))},ne=!1,F=Ci(a,o.scene,o.rig.camera);F.then(()=>ne=!0,()=>ne=!0),F.then(P,P);let re=e=>{let t=r.getBoundingClientRect(),n=r.offsetWidth?t.width/r.offsetWidth:1;return{x:(e.clientX-t.left)/n,y:(e.clientY-t.top)/n}},ie=new Map,I=null,L=!1,R=null,z=()=>[...ie.keys()].filter(e=>e!==R?.pointer),ae=()=>!!o.roam?.()&&o.rig.turnable,B=(e,t)=>{let n=ie.get(e),r=ie.get(t);return n&&r?Math.max(1,Math.hypot(n.x-r.x,n.y-r.y)):0},oe=e=>{let t=re(e);if(ie.has(e.pointerId)&&ie.set(e.pointerId,t),R?.pointer===e.pointerId){_.current?.float(R.cx,R.cy,e.clientX,e.clientY);return}let n=I;if(n?.kind===`pinch`){if(e.pointerId===n.a||e.pointerId===n.b){let e=B(n.a,n.b),t=ie.get(n.a),r=ie.get(n.b);e&&t&&r&&o.rig.zoomAt(n.z0*n.d0/e,(t.x+r.x)/2,(t.y+r.y)/2)}return}let i=h.current,a=!!i&&i.pointer===e.pointerId;if(a&&n?.kind===`turn`){o.rig.turn(-(t.x-n.x)*Ti.turn,(t.y-n.y)*Ti.tilt),n.x=t.x,n.y=t.y;return}if(a&&!L&&Math.hypot(t.x-i.x,t.y-i.y)>Ti.dragStart){if(o.roam?.()?.walk&&!R&&i.x<r.offsetWidth*Ti.stickSide){o.pointerUp(),R={pointer:i.pointer,cx:i.cx,cy:i.cy},h.current=null,_.current?.float(i.cx,i.cy,e.clientX,e.clientY);return}if(ae()){o.pointerUp(),I={kind:`turn`,x:t.x,y:t.y};return}}o.pointerMove(t.x,t.y,i?.x??t.x,i?.y??t.y,a)},se=e=>{let t=ie.delete(e.pointerId);if(R?.pointer===e.pointerId){R=null,_.current?.sink();return}let n=I;if(n?.kind===`pinch`){t&&!z().length&&(I=null);return}let r=h.current;if(!r||r.pointer!==e.pointerId)return;if(h.current=null,L=!1,n?.kind===`turn`){I=null;return}let i=re(e);o.pointerUp(),Math.hypot(i.x-r.x,i.y-r.y)<14&&performance.now()-r.t<900&&o.tap(i.x,i.y,r.id)},V=(e,t)=>{if(e.button>0)return;let n=re(e);if(ie.set(e.pointerId,n),I?.kind===`pinch`)return;let r=z();if(r.length===2&&ae()&&!L){let[e,t]=r;h.current&&I?.kind!==`turn`&&o.pointerUp(),h.current=null,I={kind:`pinch`,a:e,b:t,d0:B(e,t),z0:o.rig.user.zoom};return}h.current||(h.current={x:n.x,y:n.y,cx:e.clientX,cy:e.clientY,t:performance.now(),pointer:e.pointerId,id:t},o.pointerDown(n.x,n.y,t),L=o.roamGrabbed?.()??!1)},H=new Set,ce={KeyW:[0,1],ArrowUp:[0,1],KeyS:[0,-1],ArrowDown:[0,-1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]},le=()=>{let e=0,t=0;for(let n of H)e+=ce[n][0],t+=ce[n][1];let n=Math.hypot(e,t)||1;o.roamStick?.(e/n,t/n)},ue=e=>e.target instanceof HTMLElement&&(e.target.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)),U=e=>{let t=o.roam?.();!t||ue(e)||e.metaKey||e.ctrlKey||e.altKey||ce[e.code]&&t.walk&&(H.add(e.code),le(),e.preventDefault())},de=e=>{H.delete(e.code)&&le()},W=()=>{H.size&&(H.clear(),le())};window.addEventListener(`keydown`,U),window.addEventListener(`keyup`,de),window.addEventListener(`blur`,W);let fe=e=>V(e);u.addEventListener(`pointerdown`,fe),window.addEventListener(`pointermove`,oe),window.addEventListener(`pointerup`,se),window.addEventListener(`pointercancel`,se),g.current=(e,t)=>V(e.nativeEvent,t);let pe=e=>e.preventDefault(),G=navigator.maxTouchPoints===0,me=null,he=e=>{e.preventDefault(),G&&ae()&&(me=o.rig.user.zoom)},K=e=>{e.preventDefault();let t=e;if(me===null||!t.scale||!ae())return;let n=t.clientX!==void 0&&t.clientY!==void 0?re({clientX:t.clientX,clientY:t.clientY}):{x:r.offsetWidth/2,y:r.offsetHeight/2};o.rig.zoomAt(me/t.scale,n.x,n.y)},ge=e=>{e.preventDefault(),me=null},q=e=>{if(!ae()||(e.preventDefault(),me!==null))return;let t=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?400:1),n=e.ctrlKey?.01:.002,r=re(e);o.rig.zoomAt(o.rig.user.zoom*Math.exp(Math.max(-60,Math.min(60,t))*n),r.x,r.y)};r.addEventListener(`gesturestart`,he),r.addEventListener(`gesturechange`,K),r.addEventListener(`gestureend`,ge),r.addEventListener(`wheel`,q,{passive:!1}),r.addEventListener(`dblclick`,pe);let _e=e=>{e.preventDefault(),M(),xi(a),m.current(`lost`)};u.addEventListener(`webglcontextlost`,_e);let ve=()=>{let e=0;return o.scene.traverseVisible(t=>{let n=t.geometry;t.isMesh&&n?.attributes.position&&(e+=n.attributes.position.count*(t.isInstancedMesh?t.count:1))}),e};return window[n]=()=>({mode:`webgl`,...o.qa(),stats:{...o.stats,dpr:S,programs:a.info.programs?.length??0,vertices:ve()},memory:o.memory()}),()=>{M(),C?.dispose(),N?.(),De.detach(v),window.__kaylee3d===y&&delete window.__kaylee3d,D.disconnect(),clearTimeout(O),window.removeEventListener(`orientationchange`,k),window.visualViewport?.removeEventListener(`resize`,k),u.removeEventListener(`pointerdown`,fe),window.removeEventListener(`pointermove`,oe),window.removeEventListener(`pointerup`,se),window.removeEventListener(`pointercancel`,se),window.removeEventListener(`keydown`,U),window.removeEventListener(`keyup`,de),window.removeEventListener(`blur`,W),u.removeEventListener(`webglcontextlost`,_e),r.removeEventListener(`gesturestart`,he),r.removeEventListener(`gesturechange`,K),r.removeEventListener(`gestureend`,ge),r.removeEventListener(`wheel`,q),r.removeEventListener(`dblclick`,pe),g.current=null,window[n]&&delete window[n],T=!0,o.timers?.dispose();let e=()=>o.dispose();ne?e():F.then(e,e),i.current=null,u.remove(),bi(a)}},[]),(0,Oi.jsxs)(`div`,{ref:d,style:{position:`absolute`,inset:0,isolation:`isolate`,touchAction:`none`,userSelect:`none`,WebkitUserSelect:`none`},children:[(0,Oi.jsx)(`div`,{ref:f,style:{position:`absolute`,left:0,top:0,width:0,height:`var(--top-clear)`,pointerEvents:`none`}}),a({onDown:(e,t)=>g.current?.(e,t),onKey:e=>i.current?.tap(0,0,e),onHover:e=>i.current?.hoverAnchor?.(e)},p.current),(0,Oi.jsx)(Pi,{ref:_,onStick:(e,t)=>i.current?.roamStick?.(e,t)})]})}var Ii=Math.PI/180,Li=1.2,Ri=class{camera=new te(He.fov,1,.3,300);w=1;h=1;top=0;goal=null;cur={center:new J,yaw:0,pitch:30,dist:20};fits=new Map;probe=new te;lag=.35;fov=null;over=null;quick=0;user={yaw:0,pitch:0,zoom:1,panX:0,panZ:0};cine=null;handBack=0;setCine(e){if(!e){if(!this.cine)return;let e=this.cine,t=e.eye.clone().sub(e.look),n=Math.max(.5,t.length()),r=Math.atan2(t.x,t.z)/Ii,i=this.goal?this.aim(this.goal).yaw:r;r+=Math.round((i-r)/360)*360,this.cur.center.copy(e.look),this.cur.yaw=r,this.cur.pitch=Math.asin(Math.max(-1,Math.min(1,t.y/n)))/Ii,this.cur.dist=n,this.cine=null,this.handBack=Li,this.place();return}this.cine=e}get cinema(){return!!this.cine}get lens(){return this.over?.fov??this.fov??He.fov}setSize(e,t,n){this.w=Math.max(1,e),this.h=Math.max(1,t),this.top=Math.max(0,Math.min(n,t*.4)),this.fits.clear();let r=this.camera;r.fov=this.lens,r.aspect=this.w/(this.h+this.top),r.setViewOffset(this.w,this.h+this.top,0,0,this.w,this.h),r.updateProjectionMatrix(),this.place()}setShot(e,t=!1){if(this.goal=e,t){let t=this.aim(e);this.cur.center.copy(t.center),this.cur.yaw=t.yaw,this.cur.pitch=t.pitch,this.cur.dist=t.dist,this.place()}}get shot(){return this.goal}setOverride(e,t=!1){let n=this.lens;this.over=e,this.lens!==n&&this.setSize(this.w,this.h,this.top),this.quick=.4,t&&this.goal&&this.setShot(this.goal,!0)}framed(){if(this.cine){let e=this.cine,t=e.eye.clone().sub(e.look),n=t.length();return{center:e.look.clone(),yaw:Math.atan2(t.x,t.z)/Ii,pitch:Math.asin(t.y/Math.max(1e-6,n))/Ii,dist:n,fov:e.fov}}return this.goal?{...this.aim(this.goal),fov:this.lens}:null}turn(e,t){let n=this.goal?.roam;if(!n)return!1;let r=this.user;return r.yaw=Vi(r.yaw+e,n.yaw),r.pitch=Vi(r.pitch+t,n.pitch),this.quick=Math.max(this.quick,.12),!0}zoomAt(e,t,n){let r=t/this.w*2-1,i=1-n/(this.h+this.top)*2,a=this.goal,o=a?.roam;if(!a||!o)return!1;let s=this.user,c=s.zoom,l=Vi(e,o.zoom);if(l!==c&&a.objectFit){let e=this.cur.dist*Math.tan(this.camera.fov*Ii/2),t=e*this.camera.aspect,n=this.cur.yaw*Ii,a=1-l/c,o=r*t*a,u=i*e*a/Math.max(.35,Math.sin(this.cur.pitch*Ii));s.panX+=Math.cos(n)*o-Math.sin(n)*u,s.panZ+=-Math.sin(n)*o-Math.cos(n)*u}return s.zoom=l,this.clampPan(a),this.quick=Math.max(this.quick,.12),!0}clampPan(e){let t=this.user,n=e.objectFit?Math.max(e.half.x,e.half.z)*Math.max(0,1-t.zoom):0;t.panX=Math.max(-n,Math.min(n,t.panX)),t.panZ=Math.max(-n,Math.min(n,t.panZ))}resetTurn(){this.user.yaw=this.user.pitch=0,this.user.zoom=1,this.user.panX=this.user.panZ=0}get turnable(){return!!this.goal?.roam}refit(){this.fits.clear(),this.camera.fov!==this.lens&&this.setSize(this.w,this.h,this.top)}update(e){let t=this.goal;if(!t){this.cine&&this.place();return}let n=this.quick>0?Math.min(this.lag,.06):this.handBack>0?Math.max(this.lag,.32+.5*(this.handBack/Li)):this.lag;this.quick=Math.max(0,this.quick-e),this.handBack=Math.max(0,this.handBack-e);let r=1-Math.exp(-e/Math.max(.01,n));!this.cine&&Math.abs(this.camera.fov-this.lens)>.001&&(this.camera.fov=this.handBack>0?this.camera.fov+(this.lens-this.camera.fov)*r:this.lens,this.camera.updateProjectionMatrix());let i=this.aim(t);this.cur.center.lerp(i.center,r),this.cur.yaw+=(i.yaw-this.cur.yaw)*r,this.cur.pitch+=(i.pitch-this.cur.pitch)*r,this.cur.dist+=(i.dist-this.cur.dist)*r,this.place()}get yaw(){return this.cur.yaw}get moving(){if(this.cine)return!0;let e=this.goal;if(!e)return!1;let t=this.aim(e);return this.cur.center.distanceToSquared(t.center)>1e-4||Math.abs(t.yaw-this.cur.yaw)>.05||Math.abs(t.dist-this.cur.dist)>.02}aim(e){let t=this.turned(e),n=this.over;if(!n){let n=this.fit(e);return{center:this.panned(t,this.centered(t,t.yaw,t.pitch,n)),yaw:t.yaw,pitch:t.pitch,dist:n*(t.zoom??1)}}let r=n.mode===`lock`?n.yaw:t.yaw+n.yaw,i=Math.max(-20,Math.min(89,n.mode===`lock`?n.pitch:t.pitch+n.pitch)),a=this.fit({...t,yaw:r,pitch:i})*n.zoom,o=a*(t.zoom??1),s=r*Ii,c=this.panned(t,this.centered(t,r,i,a));return c.x+=Math.cos(s)*n.px,c.z-=Math.sin(s)*n.px,c.y+=n.py,{center:c,yaw:r,pitch:i,dist:o}}panned(e,t){return!e.roam||!e.objectFit?t:(t.x+=this.user.panX,t.z+=this.user.panZ,t)}turned(e){let t=e.roam;if(!t)return e;let n=this.user;return n.yaw=Vi(n.yaw,t.yaw),n.pitch=Vi(n.pitch,t.pitch),n.zoom=Vi(n.zoom,t.zoom),this.clampPan(e),!n.yaw&&!n.pitch&&n.zoom===1?e:{...e,yaw:e.yaw+n.yaw,pitch:Math.max(-20,Math.min(85,e.pitch+n.pitch)),zoom:n.zoom}}place(){let e=this.cine;if(e){let t=this.over?.fov??e.fov;Math.abs(this.camera.fov-t)>.001&&(this.camera.fov=t,this.camera.updateProjectionMatrix()),this.camera.position.copy(e.eye),this.camera.lookAt(e.look),e.roll&&this.camera.rotateZ(e.roll);return}let{center:t,yaw:n,pitch:r,dist:i}=this.cur;this.camera.position.copy(t).add(zi(n,r,i)),this.camera.lookAt(t)}get room(){return{x:.94,y:(this.h-this.top)/(this.h+this.top)*.94}}lensProbe(){let e=this.probe;return e.fov=this.lens,e.aspect=this.camera.aspect,e.updateProjectionMatrix(),e}spread(e,t,n,r){let i=this.lensProbe();i.position.copy(zi(t,n,r)),i.lookAt(0,0,0);let a=i.position.clone(),o=new J(1,0,0).applyQuaternion(i.quaternion),s=new J(0,1,0).applyQuaternion(i.quaternion),c=Math.tan(i.fov*Ii/2),l=c*i.aspect,u=new J,d=0,f=0,p=0,m=0;for(let t=0;t<5;t++){i.position.copy(a).addScaledVector(o,d).addScaledVector(s,f),i.updateMatrixWorld();let t=1/0,n=-1/0,h=1/0,g=-1/0;for(let r of[-1,1])for(let a of[-1,1])for(let o of[-1,1]){if(u.set(r*e.x,a*e.y,o*e.z).project(i),u.z>1)return null;t=Math.min(t,u.x),n=Math.max(n,u.x),h=Math.min(h,u.y),g=Math.max(g,u.y)}p=(n-t)/2,m=(g-h)/2,d+=(t+n)/2*r*l,f+=(h+g)/2*r*c}return{ax:d,ay:f,ex:p,ey:m,right:o,up:s}}centered(e,t,n,r){let i=e.center.clone();if(!e.objectFit||e.follow)return i;let a=this.spread(e.half,t,n,r);return a?i.addScaledVector(a.right,a.ax).addScaledVector(a.up,a.ay):i}fit(e){let t=e.follow?0:e.yaw,n=e.follow?void 0:e.objectFit,r=`${e.half.x.toFixed(2)},${e.half.y.toFixed(2)},${e.half.z.toFixed(2)},${t.toFixed(2)},${e.pitch.toFixed(2)},${e.minDist},${e.maxDist},${n}`,i=this.fits.get(r);if(i!==void 0)return i;let a=this.room;if(n){let i=Bi(r=>{let i=this.spread(e.half,t,e.pitch,r);if(!i)return!1;let o=i.ex/a.x,s=i.ey/a.y;return(n===`cover`?Math.min(o,s):Math.max(o,s))<=1},e.minDist??2,e.maxDist??120);return this.fits.set(r,i),i}let o=this.lensProbe(),s=a.y,c=a.x,l=new J,u=n=>{o.position.copy(zi(t,e.pitch,n)),o.lookAt(0,0,0),o.updateMatrixWorld();for(let t of[-1,1])for(let n of[-1,1])for(let r of[-1,1])if(l.set(t*e.half.x,n*e.half.y,r*e.half.z).project(o),l.z>1||Math.abs(l.x)>c||Math.abs(l.y)>s)return!1;return!0},d=e.minDist??2,f=e.maxDist??120;if(u(d))f=d;else for(let e=0;e<28;e++){let e=(d+f)/2;u(e)?f=e:d=e}return this.fits.set(r,f),f}};function zi(e,t,n){let r=e*Ii,i=t*Ii;return new J(Math.sin(r)*Math.cos(i),Math.sin(i),Math.cos(r)*Math.cos(i)).multiplyScalar(n)}function Bi(e,t,n){if(e(t))return t;for(let r=0;r<28;r++){let r=(t+n)/2;e(r)?n=r:t=r}return n}var Vi=(e,[t,n])=>Math.max(t,Math.min(n,e)),Hi=class{items=new Set;add(e){return this.items.add(e),e}dispose(){for(let e of this.items)e.dispose();this.items.clear()}},Ui=new J;function Wi(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;Ui.copy(t),Ui[r]=0,Ui.normalize();let l=.5*o/(o+s),u=1-Ui.angleTo(e)/c;return Math.sign(Ui[n])===1?u*l:s/(o+s)+l+l*(1-u)}var Gi=class e extends We{constructor(e=1,t=1,n=1,r=2,i=.1){let a=r*2+1;if(i=Math.min(e/2,t/2,n/2,i),super(1,1,1,a,a,a),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:n,segments:r,radius:i},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let s=new J,c=new J,l=new J(e,t,n).divideScalar(2).subScalar(i),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new J,h=.5/a;for(let r=0,a=0;r<u.length;r+=3,a+=2)switch(s.fromArray(u,r),c.copy(s),c.x-=Math.sign(c.x)*h,c.y-=Math.sign(c.y)*h,c.z-=Math.sign(c.z)*h,c.normalize(),u[r+0]=l.x*Math.sign(s.x)+c.x*i,u[r+1]=l.y*Math.sign(s.y)+c.y*i,u[r+2]=l.z*Math.sign(s.z)+c.z*i,d[r+0]=c.x,d[r+1]=c.y,d[r+2]=c.z,Math.floor(r/p)){case 0:m.set(1,0,0),f[a+0]=Wi(m,c,`z`,`y`,i,n),f[a+1]=1-Wi(m,c,`y`,`z`,i,t);break;case 1:m.set(-1,0,0),f[a+0]=1-Wi(m,c,`z`,`y`,i,n),f[a+1]=1-Wi(m,c,`y`,`z`,i,t);break;case 2:m.set(0,1,0),f[a+0]=1-Wi(m,c,`x`,`z`,i,e),f[a+1]=Wi(m,c,`z`,`x`,i,n);break;case 3:m.set(0,-1,0),f[a+0]=1-Wi(m,c,`x`,`z`,i,e),f[a+1]=1-Wi(m,c,`z`,`x`,i,n);break;case 4:m.set(0,0,1),f[a+0]=1-Wi(m,c,`x`,`y`,i,e),f[a+1]=1-Wi(m,c,`y`,`x`,i,t);break;case 5:m.set(0,0,-1),f[a+0]=Wi(m,c,`x`,`y`,i,e),f[a+1]=1-Wi(m,c,`y`,`x`,i,t)}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}};function Ki(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new _e,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=qi(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=qi(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function qi(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new K(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function Ji(e,t=1e-4){t=Math.max(t,2**-52);let n={},r=e.getIndex(),i=e.getAttribute(`position`),a=r?r.count:i.count,o=0,s=Object.keys(e.attributes),c={},l={},u=[],d=[`getX`,`getY`,`getZ`,`getW`],f=[`setX`,`setY`,`setZ`,`setW`];for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.attributes[n];c[n]=new r.constructor(new r.array.constructor(r.count*r.itemSize),r.itemSize,r.normalized);let i=e.morphAttributes[n];i&&(l[n]||(l[n]=[]),i.forEach((e,t)=>{let r=new e.array.constructor(e.count*e.itemSize);l[n][t]=new e.constructor(r,e.itemSize,e.normalized)}))}let p=t*.5,m=10**Math.log10(1/t),h=p*m;for(let t=0;t<a;t++){let i=r?r.getX(t):t,a=``;for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),o=r.itemSize;for(let e=0;e<o;e++)a+=`${~~(r[d[e]](i)*m+h)},`}if(a in n)u.push(n[a]);else{for(let t=0,n=s.length;t<n;t++){let n=s[t],r=e.getAttribute(n),a=e.morphAttributes[n],u=r.itemSize,p=c[n],m=l[n];for(let e=0;e<u;e++){let t=d[e],n=f[e];if(p[n](o,r[t](i)),a)for(let e=0,r=a.length;e<r;e++)m[e][n](o,a[e][t](i))}}n[a]=o,u.push(o),o++}}let g=e.clone();for(let t in e.attributes){let e=c[t];if(g.setAttribute(t,new e.constructor(e.array.slice(0,o*e.itemSize),e.itemSize,e.normalized)),t in l)for(let e=0;e<l[t].length;e++){let n=l[t][e];g.morphAttributes[t][e]=new n.constructor(n.array.slice(0,o*n.itemSize),n.itemSize,n.normalized)}}return g.setIndex(u),g}function Yi(e,t){if(t===0)return console.warn(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.`),e;if(t===2||t===1){let n=e.getIndex();if(n===null){let t=[],r=e.getAttribute(`position`);if(r!==void 0){for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),n=e.getIndex()}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.`),e}let r=n.count-2,i=[];if(t===2)for(let e=1;e<=r;e++)i.push(n.getX(0)),i.push(n.getX(e)),i.push(n.getX(e+1));else for(let e=0;e<r;e++)e%2==0?(i.push(n.getX(e)),i.push(n.getX(e+1)),i.push(n.getX(e+2))):(i.push(n.getX(e+2)),i.push(n.getX(e+1)),i.push(n.getX(e)));i.length/3!==r&&console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.`);let a=e.clone();return a.setIndex(i),a.clearGroups(),a}return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:`,t),e}var Xi={pink:`#FF8FB8`,hotpink:`#FF4F9A`,lavender:`#D9CCFF`,lavenderDark:`#B9A6F5`,butter:`#FBEA9A`,mint:`#8FE3C8`,sky:`#A8DCFF`,peach:`#FFC2A8`,cream:`#FFF7F0`,gold:`#FFC83D`,ink:`#2B2330`},Zi=null;function Qi(){return Zi||(Zi=new y(new Uint8Array(He.bands.length*4),He.bands.length,1,U),Zi.minFilter=Zi.magFilter=Oe,Zi.generateMipmaps=!1,$i()),Zi}function $i(){if(!Zi)return;let e=Zi.image.data;He.bands.forEach((t,n)=>t.forEach((t,r)=>e[n*4+r]=Math.round(t*255))),He.bands.forEach((t,n)=>e[n*4+3]=255),Zi.needsUpdate=!0}var ea=new Map;function ta(e=`#ffffff`,t=!1){let n=`${new Y(e).getHexString()}|${t}`,r=ea.get(n);return r||(r=new x({color:e,vertexColors:t,gradientMap:Qi()}),ea.set(n,r)),r}function na(e){let t=new fe(`#FFF7F0`,He.ambient*Math.PI),n=new M(`#FFF7F0`,He.sun*Math.PI);return n.position.set(5,10,7),e.add(t,n,n.target),{ambient:t,sun:n,follow(e,r,i){n.target.position.set(e,r,i),n.position.set(e+5,r+10,i+7),t.intensity=He.ambient*Math.PI,n.intensity=He.sun*Math.PI}}}var ra={uRes:{value:[1,1]},uScale:{value:1},...ze.clone(Q.fog)};function ia(e,t){ra.uRes.value=[Math.max(1,e),Math.max(1,t)],ra.uScale.value=He.outline}var aa=`
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
`,oa=`
  #include <fog_pars_fragment>
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <fog_fragment>
  }
`,sa=new Map;function ca(e,t=Xi.ink,n=0){let r=`${e}|${t}|${n}`,i=sa.get(r);return i||(i=new h({uniforms:{...ra,uPx:{value:e},uColor:{value:new Y(t)},uBias:{value:n}},vertexShader:aa,fragmentShader:oa,side:1,fog:!0}),sa.set(r,i)),i}function la(e){let t=e.clone();for(let e of Object.keys(t.attributes))e!==`position`&&t.deleteAttribute(e);let n=Ji(t,.001);return t.dispose(),n.computeVertexNormals(),n}function ua(e,t,n=Xi.ink){let r=new $e(la(e),ca(t,n));return r.userData.hull=t,n!==Xi.ink&&(r.userData.hullColor=n),r.raycast=da,r}var da=()=>{};function fa(e,t){let n=e.userData.hull;n!==void 0&&(e.material=ca(n,t?Xi.hotpink:e.userData.hullColor??Xi.ink,e.userData.hullBias??0))}var pa=aa.replace(`vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);`,`mat4 m = modelMatrix * instanceMatrix;
    vec4 mvPosition = viewMatrix * m * vec4(position, 1.0);`).replace(`vec3 n = normalMatrix * normal;`,`vec3 n = mat3(viewMatrix) * mat3(m) * normal;`),ma=new Map;function ha(e){let t=ma.get(e);if(!t){let n=ca(e);t=new h({uniforms:{...n.uniforms},vertexShader:pa,fragmentShader:oa,side:1,fog:!0}),ma.set(e,t)}return t}function ga(e,t,n,r){let i=new Uint8Array(e*t*4);for(let a=0;a<t;a++)for(let o=0;o<e;o++){let s=((t-1-a)*e+o)*4;i[s]=n[0],i[s+1]=n[1],i[s+2]=n[2],i[s+3]=Math.round(Math.min(1,Math.max(0,r(o+.5,a+.5)))*255)}let a=new y(i,e,t,U,Se);return a.magFilter=Ge,a.minFilter=ge,a.generateMipmaps=!0,a.needsUpdate=!0,a}function _a(e,t,n){let r=e/t;if(r<=n[0][0])return n[0][1];for(let e=1;e<n.length;e++){let[t,i]=n[e];if(r<=t){let[a,o]=n[e-1];return o+(i-o)*(r-a)/(t-a||1)}}return n[n.length-1][1]}var va=e=>1-e.reduce((e,t)=>e*(1-t),1),ya=(e={})=>new me().compose(new J(...e.at??[0,0,0]),new D().setFromEuler(new re(...e.rot??[0,0,0],e.order??`XYZ`)),new J(...e.scale??[1,1,1])),ba=new Y;function xa(e,t,n={},r=!1){let i=e.index&&!r?e.toNonIndexed():e;i!==e&&e.dispose();for(let e of Object.keys(i.attributes))e!==`position`&&e!==`normal`&&i.deleteAttribute(e);i.applyMatrix4(ya(n)),ba.set(t);let a=i.attributes.position.count,o=new Float32Array(a*3);for(let e=0;e<a;e++)o.set([ba.r,ba.g,ba.b],e*3);return i.setAttribute(`color`,new K(o,3)),i}var $={box:(e,t,n,r,i)=>xa(new We(e,t,n),r,i,!0),rbox:(e,t,n,r,i,a)=>xa(new Gi(e,t,n,2,Math.min(r,e/2,t/2,n/2)*.999),i,a,!0),cyl:(e,t,n,r,i,a=16)=>xa(new Je(e,t,n,a),r,i,!0),cone:(e,t,n,r,i=16)=>xa(new Ze(e,t,i),n,r,!0),sphere:(e,t,n,r=18)=>xa(new Ie(e,r,Math.round(r*.7)),t,n,!0),capsule:(e,t,n,r)=>xa(new xe(e,t,5,14),n,r,!0),torus:(e,t,n,r,i=Math.PI*2)=>xa(new d(e,t,8,24,i),n,r,!0),prism:(e,t,n,r)=>{let i=new se(e.map(([e,t])=>new ve(e,t)));return xa(new j(i,{depth:t,bevelEnabled:!1}).translate(0,0,-t/2),n,r)}};function Sa(e,t,n,r){let i=$.sphere(1,e,{},t),a=i.attributes.position,o=new J;for(let e=0;e<a.count;e++)n(o.fromBufferAttribute(a,e)),a.setXYZ(e,o.x,o.y,o.z);i.computeVertexNormals();let s=i.attributes.normal,c=new Map,l=e=>`${Math.round(a.getX(e)*1e4)},${Math.round(a.getY(e)*1e4)},${Math.round(a.getZ(e)*1e4)}`;for(let e=0;e<a.count;e++){let t=l(e),n=c.get(t);n?n.add(o.fromBufferAttribute(s,e)):c.set(t,new J().fromBufferAttribute(s,e))}for(let e=0;e<a.count;e++){let t=o.copy(c.get(l(e))).normalize();s.setXYZ(e,t.x,t.y,t.z)}return i.applyMatrix4(ya(r))}function Ca(e,t,n){let r=[...e].sort((e,t)=>e.z-t.z),i=r[0].pts.length,a=[],o=[],s=new Y,c=(e,t,n,r)=>{a.push(...e,...t,...n),s.set(r);for(let e=0;e<3;e++)o.push(s.r,s.g,s.b)},l=e=>Array.isArray(t)?t[e%t.length]:t,u=(e,t)=>[e.pts[t%i][0],e.pts[t%i][1],e.z];for(let e=0;e+1<r.length;e++)for(let t=0;t<i;t++){let n=u(r[e],t),i=u(r[e],t+1),a=u(r[e+1],t+1),o=u(r[e+1],t);c(n,i,a,l(t)),c(n,a,o,l(t))}for(let[e,t]of[[r[0],-1],[r[r.length-1],1]]){let n=[e.pts.reduce((e,t)=>e+t[0],0)/i,e.pts.reduce((e,t)=>e+t[1],0)/i,e.z];for(let r=0;r<i;r++)t>0?c(n,u(e,r),u(e,r+1),l(r)):c(n,u(e,r+1),u(e,r),l(r))}let d=new _e;return d.setAttribute(`position`,new K(new Float32Array(a),3)),d.applyMatrix4(ya(n)),d.computeVertexNormals(),d.setAttribute(`color`,new K(new Float32Array(o),3)),d}function wa(e){if(e.some(e=>e.index))for(let t of e)t.index||t.setIndex(Ta(t.attributes.position.count));let t=Ki(e,!1);for(let t of e)t.dispose();if(!t)throw Error(`merge: parts have different attributes`);return t}var Ta=e=>{let t=e>65535?new Uint32Array(e):new Uint16Array(e);for(let n=0;n<e;n++)t[n]=n;return new K(t,1)};function Ea(e,t,n=2,r){let i=new V,a=new $e(t.add(e),ta(`#ffffff`,!0));if(i.add(a),n>0){let a=ua(e,n,r);t.add(a.geometry),i.add(a)}return i}function Da(e,t,n,r=2){let i=new V,a=r>0&&e.length?wa(e.map(e=>e.clone())):null,o=wa([...e,...t]);if(i.add(new $e(n.add(o),ta(`#ffffff`,!0))),a){let e=ua(a,r);a.dispose(),n.add(e.geometry),i.add(e)}return i}var Oa=(e,t,n=2)=>Ea(e,t,n),ka=null;function Aa(e,t){ka??=ga(64,64,[43,35,48],(e,t)=>_a(Math.hypot(e-32,t-32),32,[[0,.34],[.62,.2],[1,0]]));let n=new $e(t.add(new nt(e*2,e*2)),Ma());return n.rotation.x=-Math.PI/2,n.position.y=.012,n.renderOrder=1,n}var ja=null,Ma=()=>ja??=new ae({map:ka,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4}),Na=new me,Pa=new D,Fa=new J,Ia=new J,La=new D().setFromAxisAngle(new J(1,0,0),-Math.PI/2),Ra=class{o;mesh;pool=[];next=0;live=0;palette;constructor(e,t){this.o=e;let n=e.kind===`foam`?new de(.5,16):new A(.5,0),r=new ae({color:e.color??`#FFFFFF`,transparent:(e.opacity??1)<1,opacity:e.opacity??1,depthWrite:e.kind!==`foam`});e.kind===`foam`&&(r.polygonOffset=!0,r.polygonOffsetFactor=-2),this.mesh=t.add(new ce(t.add(n),t.add(r),e.count)),this.mesh.instanceMatrix.setUsage(N),this.mesh.frustumCulled=!1,this.mesh.renderOrder=+(e.kind===`foam`);for(let t=0;t<e.count;t++)this.pool.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,age:1,life:0,size:0,color:0});if(this.palette=(e.colors??[]).map(e=>new Y(e)),this.palette.length)for(let t=0;t<e.count;t++)this.mesh.setColorAt(t,this.palette[0]);this.mesh.count=0}emit(e,t,n,r,i,a,o,s,c=-1){let l=this.pool[this.next];this.next=(this.next+1)%this.pool.length,l.x=e,l.y=t,l.z=n,l.vx=r,l.vy=i,l.vz=a,l.age=0,l.life=o,l.size=s,l.color=this.palette.length?c>=0?c%this.palette.length:Math.floor(Math.random()*this.palette.length):0}burst(e,t,n,r,i,a,o=.22,s=-1){for(let c=0;c<r;c++){let r=Math.random()*Math.PI*2,c=i*(.4+Math.random()*.6);this.emit(e,t,n,Math.cos(r)*c,a*(.6+Math.random()*.6),Math.sin(r)*c,.5+Math.random()*.4,o*(.6+Math.random()*.8),s)}}get busy(){return this.live>0}update(e){if(this.live===0&&!this.pool.some(e=>e.age<e.life)){this.mesh.visible=!1;return}let t=this.o.kind===`foam`,n=0;for(let r of this.pool){if(r.age>=r.life||(r.age+=e,r.age>=r.life))continue;let i=r.age/r.life;r.x+=r.vx*e,r.z+=r.vz*e;let a;t?(r.vx*=Math.exp(-2*e),r.vz*=Math.exp(-2*e),a=r.size*Math.sqrt(Math.min(1,i*4))*(1-i*i),Pa.copy(La)):(r.vy-=(this.o.gravity??14)*e,r.y+=r.vy*e,r.y<0&&(r.age=r.life),a=r.size*(1-i),Pa.identity()),Na.compose(Fa.set(r.x,r.y,r.z),Pa,Ia.set(a,a,a)),this.palette.length&&this.mesh.setColorAt(n,this.palette[r.color]),this.mesh.setMatrixAt(n++,Na)}if(this.live=n,this.mesh.count=n,this.mesh.visible=n>0,n===0)return;let r=this.mesh.instanceMatrix;r.clearUpdateRanges(),r.addUpdateRange(0,n*16),r.needsUpdate=!0;let i=this.mesh.instanceColor;i&&(i.clearUpdateRanges(),i.addUpdateRange(0,n*3),i.needsUpdate=!0)}};function za(e,t,n){let r=new se;r.moveTo(e*.46,.82);let i=(t,n,i,a,o,s)=>r.bezierCurveTo(e*t,n,e*i,a,e*o,s);i(.65,.91,.76,.98,.82,1.12),i(.88,1.32,.98,1.36,1.1,1.37),i(1.24,1.37,1.23,1.6,1.25,1.58),i(1.29,1.58,1.28,1.44,1.36,1.44),i(1.44,1.44,1.47,1.68,1.51,1.68),i(1.54,1.67,1.54,1.45,1.62,1.45),i(1.68,1.45,1.74,1.57,1.77,1.57),i(1.81,1.57,1.79,1.42,1.84,1.35),i(1.94,1.24,1.98,1.11,1.87,1.02),i(1.68,.84,1.29,.76,.96,.94),i(.84,1,.66,.78,.46,.67),r.closePath();let a=new j(r,{depth:.18,bevelSize:.025,bevelThickness:.045,bevelSegments:3,curveSegments:6});return a.translate(-e*.46,0,-.09),xa(a,`#E4C495`,{at:[e*.46*t,n,-.13*t],rot:[0,e*.31,0],scale:[t,t,t]})}function Ba(e,t,n,r){let i=new ie(0,1,48,12),a=i.attributes.position,o=i.attributes.normal,s=new J;for(let r=0;r<a.count;r++){let i=a.getX(r)*.1,c=.314+a.getY(r)*.111,l=c-Math.max(.29,Math.min(.39,c)),u=Math.sqrt(.155**2-i*i-l*l);a.setXYZ(r,e*t*i,e*c,e*n*(u+.0015)),s.set(i/t,l,u/n).normalize(),o.setXYZ(r,s.x,s.y,s.z)}return xa(i,r,{},!0)}function Va(e,t,n){let r=(n,r,i)=>{let a=(r+1)/2,o=n*(.074+.105*a),s=i*.042;return[t[0]+e*(.8*o-.6*s-.25*a*a),t[1]+e*(.6*o+.8*s-.072*Math.sin(Math.PI*a)+.155*a*a),t[2]-e*a*.38]},i=$.sphere(1,n,{},48),a=i.attributes.position;for(let e=0;e<a.count;e++)a.setXYZ(e,...r(a.getX(e),a.getY(e),a.getZ(e)));i.computeVertexNormals();let o=[],s=[];for(let e of[-1,1])for(let t of[-1,1])for(let n=-3;n<=3;n++){let i=n*.235,a=Math.sqrt(.9**2-(Math.abs(i)+.02)**2);for(let n=0;n<=20;n++){let c=a*(2*n/20-1),l=o.length/3;for(let n of[-1,1]){let a=i+n*.02,s=(c-t*a)*Math.SQRT1_2,l=(t*c+a)*Math.SQRT1_2,u=e*(Math.sqrt(1-s*s-l*l)+.024);o.push(...r(s,l,u))}n>0&&(e>0?s.push(l-2,l,l-1,l-1,l,l+1):s.push(l-2,l-1,l,l-1,l+1,l))}}let c=new _e;return c.setAttribute(`position`,new tt(o,3)),c.setIndex(s),c.computeVertexNormals(),[i,xa(c,`#4A3028`,{},!0)]}var Ha=[1.18,.95,1],Ua=Ha,Wa=`#FF9DB8`,Ga=`#3A2F40`;function Ka({R:e,headY:t},n,r,i,a,o,s){let c=[],l=[],u=[],d=new J,f=(n,i)=>{let a=Math.sqrt(Math.max(0,1-(n/Ua[0])**2-(i/Ua[1])**2))*Ua[2];d.set(n/Ua[0]**2,i/Ua[1]**2,a/Ua[2]**2).normalize(),c.push(r*(n+d.x*s)*e,t+(i+d.y*s)*e,(a+d.z*s)*e),l.push(r*d.x,d.y,d.z)};f(i,a);for(let e=1;e<=10;e++)for(let t=0;t<44;t++){let n=t/44*Math.PI*2,r=o(n)*e/10;f(i+Math.cos(n)*r,a+Math.sin(n)*r)}let p=(e,t)=>1+(e-1)*44+t%44,m=(e,t,n)=>r>0?u.push(e,t,n):u.push(e,n,t);for(let e=0;e<44;e++){m(0,p(1,e),p(1,e+1));for(let t=1;t<10;t++)m(p(t,e),p(t+1,e),p(t+1,e+1)),m(p(t,e),p(t+1,e+1),p(t,e+1))}let h=new _e;return h.setAttribute(`position`,new K(new Float32Array(c),3)),h.setAttribute(`normal`,new K(new Float32Array(l),3)),h.setIndex(u),xa(h,n,{},!0)}var qa=(e,t,n,r=0)=>i=>{let a=i-n,o=t*(1+r*Math.cos(a));return 1/Math.hypot(Math.cos(a)/e,Math.sin(a)/o)};function Ja(e,t,n=.62,r=.4){let i=new Ie(1,20,16),a=i.attributes.position;for(let e=0;e<a.count;e++){let t=(a.getY(e)+1)/2;a.setXYZ(e,a.getX(e)*(1-n*t**1.5),a.getY(e),a.getZ(e)*r*(1-.3*t))}return i.computeVertexNormals(),xa(i,e,t,!0)}function Ya(e,t){let{R:n,headY:r,eyeX:i,eyeY:a,eyeSize:o}=t,s=(e,t,i)=>[n*e,r+n*t,n*i],c=i/n,l=a/n,u=[$.sphere(n,e.fur,{at:s(0,0,0),scale:Ua},40)],d=[],f=[];for(let r of[-1,1]){let i=[-.1,r*.3,-r*.52];u.push(Ja(e.fur,{at:s(r*.83,.78,-.06),rot:i,scale:[.46*n,.5*n,.46*n]},.4)),d.push(Ja(e.ear??e.dark,{at:s(r*.82,.76,.075),rot:i,scale:[.28*n,.32*n,.28*n]},.4,.3));for(let[t,i,a,o]of[[1,-.2,.25,1],[.93,-.46,.75,.9]])u.push(Ja(e.light,{at:s(r*t,i,.16),rot:[0,r*.3,-r*(Math.PI/2+a)],scale:[.27*n*o,.4*n*o,.42*n*o]},.5));d.push(Ka(t,e.light,r,c+.16,l+.08,qa(.6,.37,-.42,.1),.006)),d.push(Ka(t,e.dark,r,c+.1,l-.06,qa(.43,.27,-.42,.18),.012)),f.push(Ka(t,e.light,r,c,l,qa(o/n*.92,o/n*1.14,0),.018)),d.push(Ka(t,Wa,r,.6,-.42,qa(.13,.075,0),.016))}for(let[t,r]of[[-.1,.5],[.08,-.25]])u.push($.sphere(.16*n,e.fur,{at:s(t,.9,.3),rot:[.7,0,r],scale:[.5,1.3,.6]}));return d.push(Ka(t,e.light,1,0,-.5,qa(.62,.34,0),.008)),u.push($.sphere(.36*n,e.light,{at:s(0,-.36,.68),scale:[1.25,.72,.85]},28)),d.push($.sphere(.1*n,Ga,{at:s(0,-.225,.965),scale:[1.35,.9,.8]},20)),d.push($.sphere(.026*n,`#B9A9C0`,{at:s(-.04,-.185,1.03),scale:[1.5,.6,.4]})),{outlined:u,plain:d,eyeRings:f,mouth:s(0,-.47,.962)}}function Xa(e,t,n,r){let i=new Ie(1,28,14,0,Math.PI*2,0,Math.PI/2),a=i.attributes.position,o=i.attributes.normal,s=new J;for(let r=0;r<a.count;r++){let i=a.getX(r)*.098,c=.33-a.getZ(r)*.15,l=c-Math.max(.29,Math.min(.39,c)),u=Math.sqrt(Math.max(0,.155**2-i*i-l*l));a.setXYZ(r,e*t*i,e*c,e*n*(u+.0015)),s.set(i/t,l,u/n).normalize(),o.setXYZ(r,s.x,s.y,s.z)}return xa(i,r,{},!0)}function Za(e,t){let n=e.height,r=(e,t=new J)=>t.set(.04+.33*Math.sin(e*1.5),-.03+.37*e**1.6,-.07*(1-(1-e)**4)),i=new Ie(1,20,42),a=i.attributes.position,o=new J,s=new J,c=new J(0,0,1),l=new J;for(let e=0;e<a.count;e++){let i=a.getY(e),u=(i+1)/2;r(u,o),s.copy(r(Math.min(1,u+.02),l)).sub(r(Math.max(0,u-.02),l)).normalize(),l.crossVectors(s,c).normalize();let d=(.062+.036*u)*Math.max(1e-4,1-i*i)**-.15;a.setXYZ(e,t[0]+n*(o.x+l.x*a.getX(e)*d),t[1]+n*(o.y+l.y*a.getX(e)*d),t[2]+n*(o.z+a.getZ(e)*d))}i.computeVertexNormals();let u=i.toNonIndexed();i.dispose();let d=u.attributes.uv.array.slice(),f=xa(u,e.fur,{}),p=f.attributes.color,m=new Y(e.dark);for(let e=0;e<p.count;e+=3){let t=(Math.floor(Math.min(d[e*2+1],d[e*2+3],d[e*2+5])*42+.01)+.5)/42;if(t>.14&&t<.27||t>.41&&t<.54||t>.68&&t<.81||t>.93)for(let t=0;t<3;t++)p.setXYZ(e+t,m.r,m.g,m.b)}return f}var Qa=[1.1,1,1],$a=`#3A2A33`,eo=`#FFB5C8`;function to(e,t,n,r,i){let a=Sa(e,t,n),o=a.attributes.position,s=a.attributes.color,c=new J,l=new Y;for(let e=0;e<o.count;e++){let t=r(c.fromBufferAttribute(o,e),e);t&&s.setXYZ(e,l.set(t).r,l.g,l.b)}return a.applyMatrix4(ya(i))}var no=e=>{let t=(e.y+1)/2;e.x*=1.12-.86*t**1.25,e.z=e.z*.3*(1-.45*t)+.3*e.x*e.x};function ro(e,t,n){let{R:r,headY:i,eyeX:a,eyeY:o,on:s,turnTo:c}=t,l=(e,t,n)=>[r*e,i+r*t,r*n],u=[$.sphere(r,e.fur,{at:l(0,0,0),scale:Qa},44)],d=[],f=e.ears===`short`&&e.ear?e.ear:`#`+new Y(e.fur).lerp(new Y(`#FFFFFF`),.45).getHexString();for(let t of[-1,1]){let i=[-.12,t*.3,-t*.34],p=e.ears===`short`?.62:1;u.push(Sa(e.fur,36,no,{at:l(t*.64,.9-.54*(1-p)*.6,-.1),rot:i,scale:[.4*r,.54*p*r,.4*r]})),d.push(Sa(f,28,no,{at:l(t*.628,.83-.54*(1-p)*.6,-.02),rot:i,scale:[.23*r,.36*p*r,.24*r]}));let m=t*(a+.02*r);d.push($.torus(.2*r,.02*r,n,{at:s(m,o+.18*r,.004*r),rot:[0,c(m)[1],Math.PI/2-.45+t*.06],scale:[1,1,.5]},.9));let h=[t*.5,-.43,.75],g=.25;u.push($.sphere(g*r,e.cheeks===`white`?e.light:eo,{at:l(t*.63-h[0]*.2*g,-.43-h[1]*.2*g,.665-h[2]*.2*g),rot:[.52,t*.6,0],scale:[.98,.95,.42]},32))}return u.push(Sa(e.light,32,e=>{let t=(e.z+1)/2;e.x*=1.15-.3*t,e.y=e.y*(1.05-.3*t)+.12*t*t},{at:l(0,-.38,.72),scale:[.4*r,.27*r,.44*r]})),u.push(Sa($a,20,e=>{e.x*=1+.25*e.y},{at:l(0,-.235,1.105),scale:[.115*r,.08*r,.085*r]})),d.push($.sphere(.026*r,`#B9A9C0`,{at:l(-.04,-.195,1.175),scale:[1.5,.6,.4]})),{outlined:u,plain:d,mouth:l(0,-.5,1.03)}}function io(e,t){let n=e.height,r=(e,t=new J)=>t.set(.03+.3*Math.sin(e*1.35),-.04*Math.sin(e*Math.PI)+.34*e**1.7,-.02-.2*Math.sin(e*1.9)),i=new J,a=new J,o=new J,s=new J,c=new J(0,1,0),l=[];return to(e.fur,40,e=>{let t=(e.y+1)/2;r(t,i),a.copy(r(Math.min(1,t+.02),o)).sub(r(Math.max(0,t-.02),s)).normalize(),o.crossVectors(a,c).normalize(),s.crossVectors(o,a).normalize();let n=Math.max(1e-4,1-e.y*e.y)**-.12,u=(.035+.095*Math.sin(Math.PI*t**.8)**.8)*n,d=e.x*u,f=e.z*u;l.push(t-.045*Math.sin(Math.atan2(e.z,e.x)*5)),e.set(i.x+o.x*d+s.x*f,i.y+o.y*d+s.y*f,i.z+o.z*d+s.z*f)},(t,n)=>l[n]>.7?e.light:null,{at:t,scale:[n,n,n]})}var ao=[1.1,.98,1],oo=`#EBD3A8`,so=`#FFF8EC`,co=`#3A2E40`;function lo(e,t,n){let r=new J(.62*e*t,n+.4*t,-.06*t),i=.62*t,a=-.22-Math.PI/2,o=(n,o=new J)=>{let s=a+2.15*n;return o.set(e*i*(Math.cos(s)-Math.cos(a)),i*(Math.sin(s)-Math.sin(a)),-.1*t*n*n).add(r)},s=new J,c=new J,l=new J,u=new J,d=new J(0,0,1),f=[],p=new Y(so),m=new Y(oo);return to(oo,40,e=>{let n=(e.y+1)/2;o(n,s),c.copy(o(Math.min(1,n+.02),l)).sub(o(Math.max(0,n-.02),u)).normalize(),l.crossVectors(c,d).normalize(),u.crossVectors(l,c).normalize();let r=Math.max(1e-4,1-e.y*e.y)**-.35,i=(.045+.165*(1-n)**.85)*t*Math.min(1.6,r),a=e.x*i,p=e.z*i;f.push(n),e.set(s.x+l.x*a+u.x*p,s.y+l.y*a+u.y*p,s.z+l.z*a+u.z*p)},(e,t)=>`#`+m.clone().lerp(p,Math.min(1,Math.max(0,(f[t]-.35)/.55))).getHexString(),{})}function uo(e,t){let{R:n,headY:r}=t,i=(e,t,i)=>[n*e,r+n*t,n*i],a=[$.sphere(n,e.fur,{at:i(0,0,0),scale:ao},44)],o=[];for(let t of[-1,1]){a.push(lo(t,n,r));let s=e=>{let n=(e.x*t+1)/2;e.y*=1.05-.4*n**1.6,e.z*=1-.4*n};a.push(Sa(e.fur,32,s,{at:i(t*1,.1,-.06),rot:[0,-t*.35,-t*.38],scale:[.34*n,.19*n,.1*n]})),o.push(Sa(e.ear??e.light,24,s,{at:i(t*1.03,.095,0),rot:[0,-t*.35,-t*.38],scale:[.24*n,.12*n,.05*n]}))}a.push(Sa(e.light,40,e=>{e.x*=1-.12*e.y,e.z*=1-.15*Math.max(0,e.y)},{at:i(0,-.37,.7),scale:[.45*n,.31*n,.37*n]}));for(let e of[-1,1])o.push(Sa(co,16,e=>{e.x*=1+.2*e.y},{at:i(e*.15,-.29,1.035),rot:[-.3,e*.32,e*.45],scale:[.065*n,.042*n,.03*n]}));return{outlined:a,plain:o,mouth:i(0,-.53,1)}}var fo=76,po=30,mo=.4,ho=.74,go=.98,_o=[1.25,1.16,1.14],vo=-.05,yo=.915;function bo(e,{R:t,headY:n}){let r=new Y(e),i=r.clone().multiplyScalar(.8),o=r.clone().lerp(new Y(`#E2AE84`),.5),s=r.clone().multiplyScalar(.66),l=2387,u=new Float32Array(l*2*3),d=new Float32Array(l*2*3),f=new Y;for(let e=0;e<2;e++)for(let p=0;p<=po;p++)for(let m=0;m<=fo;m++){let h=m/fo,g=p/po,_=Math.min(1,g/mo)*(Math.PI/2),v=Math.max(0,(g-mo)/.6),y=c((_-ho)/(Math.PI/2-ho))**.8,b=go*y+.5*v**1.3,x=b+h*(Math.PI*2-b*2),S=Math.min(x-b,Math.PI*2-b-x),C=Math.sqrt(Math.min(1,S/.42)),w=a(1,C,c(_/.3)),T=Math.max(0,-Math.cos(x)),E=Math.sqrt(1-v**4),D=1+.035*Math.exp(-(((_-1.05)/.3)**2)-((S-.45)/.35)**2),O=a(a(.955,yo,y),1,w)*D;e&&(O*=1-.1*w*E);let k=1-v*(.08+.26*T)-.05*v**4,A=1.3+.22*T+.035*Math.sin(x*9),j=_o[0]*O*k*Math.sin(_)*Math.sin(x),ee=vo+_o[2]*O*k*Math.sin(_)*Math.cos(x),te=v>0?-v*A:_o[1]*O*Math.cos(_),M=(e*l+p*77+m)*3;if(u[M]=j*t,u[M+1]=n+te*t,u[M+2]=ee*t,e)f.copy(s);else{f.copy(i).lerp(r,c(g/.45));let e=Math.exp(-(((S-.2)/.11)**2));for(let t of[1.55,2.2,2.75,3.6,4.15,4.8])e=Math.max(e,.7*Math.exp(-(((x-t)/.07)**2)));f.lerp(o,e*c((g-.12)/.4)*.85)}d[M]=f.r,d[M+1]=f.g,d[M+2]=f.b}let p=[];for(let e=0;e<2;e++){let t=(t,n)=>e*l+n*77+t;for(let n=0;n<po;n++)for(let r=0;r<fo;r++){let i=t(r,n),a=t(r,n+1),o=t(r+1,n+1),s=t(r+1,n);e?p.push(i,o,a,i,s,o):p.push(i,a,o,i,o,s)}}let m=new _e;return m.setAttribute(`position`,new K(u,3)),m.setAttribute(`color`,new K(d,3)),m.setIndex(p),m.computeVertexNormals(),m}function xo(e,t,n){let r=new Y(e.fur),i=new Y(e.light),a=new Y,o=$.sphere(1,e.fur,{},40),s=o.attributes.position,c=o.attributes.color;for(let e=0;e<s.count;e++){let t=s.getX(e),o=s.getY(e),l=s.getZ(e);a.copy(r).lerp(i,n(t,o,l)),c.setXYZ(e,a.r,a.g,a.b)}return o.applyMatrix4(ya(t))}function So(e,t){let n=e.height;return[xo(e,{at:[0,.293*n,0],scale:[.175*n*t[0],.267*n,.177*n*t[2]]},(e,t,n)=>r(.5,.94,n+t*.23)*.86),...[-1,1].map(t=>$.sphere(.09*n,e.dark,{at:[t*.103*n,.052*n,.062*n],rot:[0,t*.42,0],scale:[.87,.54,1.44]},20))]}function Co(e,t,n,r,i){let a=new H(new J(...e),new J(...t),new J(...n));return xa(new q(a,8,r,5,!1),i,{},!0)}function wo(e,{R:t,headY:n}){let i=(e,r,i)=>[t*e,n+t*r,t*i],a=[xo(e,{at:i(0,0,0),scale:[1.12*t,.96*t,t]},(e,t,n)=>r(.02,.38,.31*n-t+.11*e*e))],o=[$.sphere(.44*t,e.light,{at:i(0,-.52,.64),scale:[1.43,.73,.71]},24),$.sphere(.155*t,e.dark,{at:i(0,-.12,1.022),scale:[1.57,.9,.77]},20),$.sphere(.055*t,`#9D8077`,{at:i(-.045,-.071,1.128),scale:[1.7,.54,.3]},12)],s=[];for(let n of[-1,1]){a.push($.sphere(.162*t,e.fur,{at:i(n*1.08,.37,-.025),scale:[.88,1,.68]},18)),o.push($.sphere(.101*t,e.ear??e.dark,{at:i(n*1.12,.37,.053),scale:[.72,.93,.51]},14),$.sphere(.37*t,e.light,{at:i(n*.255,-.285,.744),scale:[1.13,.7,.79]},24));for(let[e,r,a]of[[.25,-.23,1.03],[.37,-.3,1.028],[.27,-.34,1.032]])o.push($.sphere(.021*t,`#967967`,{at:i(n*e,r,a)},8));for(let e=0;e<3;e++){let r=-.27-.06*e;o.push(Co(i(n*(.38+.016*e),r,1.014),i(n*.83,r+.11-e*.08,1.025),i(n*(1.3-.1*e),r+.15-e*.15,.87-e*.04),.01*t,`#FFF4E0`))}s.push(Co([0,.05*t,0],[n*.105*t,-.045*t,.02*t],[n*.19*t,-.012*t,.026*t],.014*t,`#684147`))}return{outlined:a,plain:o,mouth:i(0,-.52,.974),smile:s}}function To({height:e,fur:t},n){let r=$.sphere(1,t,{},24),i=r.attributes.position;for(let t=0;t<i.count;t++){let r=(1+i.getY(t))/2;i.setXYZ(t,n[0]+e*(i.getX(t)*(.13-.09*r)+.1*r*r),n[1]+e*(i.getZ(t)*(.054-.03*r)-.125*r),n[2]+e*(.045-.45*r))}return r.computeVertexNormals(),r}var Eo=[`sunhat`,`spare-hat`,`sunglasses`,`floaties`,`scrubs`,`scrub-cap`,`apron`,`chef-hat`,`smock`,`gloves`,`mongkhon`],Do=`#2E2233`,Oo=`#FF9DB8`,ko=`#7A2745`,Ao=`#FF8FA8`,jo=`#FFF6E6`,Mo=`#FFFFFF`,No=`#F2555F`,Po=`#7E88A0`,Fo=(e,t,n,r,i)=>$.cyl(e,t,n,r,i,20);function Io(e){let t=e.height,n=e.species===`sea-otter`,r=e.species===`penguin`,i=e.species===`hornbill`||e.species===`tern`||e.species===`pelican`||e.species===`hen`,a=(r?.27:e.species===`panda`||e.species===`elephant`||e.species===`bear`||e.species===`polarbear`||e.species===`beaver`||e.species===`moose`||e.species===`raccoon`?.26:i?.22:e.species===`puppy`||e.species===`tortoise`?.25:.24)*t,o=e.chub??1,s=r?.2*t:a*.92;return{H:t,R:a,headY:s,shoulder:r?[.3*t,.5*t,0]:e.species===`tern`?[.15*t,.45*t,-.01*t]:[.155*t*o,.47*t,0],eyeX:n?.47*a:e.species===`raccoon`?.43*a:e.species===`unicorn`||e.species===`pony`?.37*a:e.species===`hornbill`||e.species===`gecko`?.46*a:i?.42*a:.36*a,eyeY:e.species===`moose`?.18*a:n?.16*a:e.species===`beaver`?.19*a:e.species===`gecko`?.2*a:e.species===`unicorn`||e.species===`pony`?.12*a:r?.02*a:i?.14*a:.05*a,eyeSize:(e.species===`gecko`?.3:.21)*a,lift:r?.12*a:n?.045*a:e.species===`raccoon`?.015*a:e.species===`monkey`?.07*a:0,on:(e,t,n=0)=>[e,s+t,Math.sqrt(Math.max(0,a*a-e*e-t*t))+n],turnTo:e=>[0,Math.asin(Math.max(-1,Math.min(1,e/a))),0]}}var Lo=e=>Eo.includes(e),Ro=`#7FB2F0`,zo=`#5D8FD6`;function Bo(e,t,n){let{H:r,R:i,headY:a,eyeX:o,eyeY:s,on:c,turnTo:l}=t,u={head:[],headPlain:[],armL:[],armR:[],body:[],bodyPlain:[]};if(e===`sunhat`||e===`spare-hat`){let t=e===`sunhat`,n=t?`#FBEA9A`:`#FFC2A8`,r=t?`#FF4F9A`:`#B9A6F5`,o=-.16*i,s=a+.64*i;u.head.push($.cyl(1.24*i,1.28*i,.07*i,n,{at:[0,s,o+.1*i]},32),$.torus(1.26*i,.07*i,n,{at:[0,s+.04*i,o+.1*i],rot:[Math.PI/2,0,0]}),$.cyl(.6*i,.66*i,.26*i,n,{at:[0,s+.15*i,o]},24),$.sphere(.6*i,n,{at:[0,s+.27*i,o],scale:[1,.42,1]},24),$.cyl(.675*i,.69*i,.14*i,r,{at:[0,s+.1*i,o]},24));let c=[.46*i,s+.12*i,o+.5*i];if(t){for(let e of[-1,1])u.head.push($.sphere(.13*i,r,{at:[c[0]+e*.13*i,c[1],c[2]],rot:[0,.75,e*.5],scale:[1.2,.75,.45]}));u.head.push($.sphere(.06*i,r,{at:c}))}else{for(let e=0;e<5;e++){let t=e/5*Math.PI*2;u.head.push($.sphere(.07*i,`#FFFFFF`,{at:[c[0]+Math.cos(t)*.08*i,c[1]+Math.sin(t)*.08*i,c[2]],rot:[0,.75,0],scale:[1,1,.4]}))}u.headPlain.push($.sphere(.055*i,`#FFC83D`,{at:[c[0],c[1],c[2]+.02*i]}))}}if(e===`sunglasses`){let e=t.lift+.13*i,n=(t,n,r,a,o)=>{let u=l(t);for(let l of[-1,1])o.push($.sphere(.12*i*n,r,{at:c(t+l*.085*i*n,s+.04*i,e+a),rot:u,scale:[1,1,.3]},14));o.push($.cone(.19*i*n,.22*i*n,r,{at:c(t,s-.1*i*n,e+a),rot:[Math.PI,u[1],0],scale:[1,1,.3]},14))};for(let t of[-1,1]){let r=t*o;n(r,1.22,`#FF4F9A`,0,u.head),n(r,.9,`#5A3F66`,.012*i,u.head),u.headPlain.push($.sphere(.05*i,`#FFFFFF`,{at:c(r-t*.07*i,s+.08*i,e+.05*i),rot:l(r),scale:[1,.7,.3]})),u.headPlain.push($.sphere(.022*i,`#FFFFFF`,{at:c(r+t*.05*i,s-.04*i,e+.05*i),rot:l(r),scale:[1,1,.3]}))}u.head.push($.capsule(.035*i,o*2-.5*i,`#FF4F9A`,{at:c(0,s+.07*i,e+.02*i),rot:[0,0,Math.PI/2]}))}if(e===`scrubs`){u.body.push($.capsule(.172*r,.06*r,Ro,{at:[0,.37*r,0]})),u.body.push($.cyl(.168*r,.248*r,.18*r,Ro,{at:[0,.232*r,0]},20));for(let e of[-1,1])u.body.push($.capsule(.078*r,.05*r,zo,{at:[e*.085*r,.115*r,0]}));u.body.push($.rbox(.07*r,.06*r,.012*r,.008*r,zo,{at:[.075*r,.42*r,.165*r],rot:[0,.4,0]})),u.body.push($.cyl(.008*r,.008*r,.06*r,`#FF4F9A`,{at:[.06*r,.46*r,.168*r],rot:[0,0,.15]}));for(let e of[-1,1])u.bodyPlain.push($.box(.012*r,.08*r,.01*r,`#FFFFFF`,{at:[e*.022*r,.505*r,.152*r],rot:[-.35,0,e*.5]}));for(let[e,t]of[[`armL`,-1],[`armR`,1]])u[e].push($.sphere(.074*r,Ro,{at:[t*.006*r,-.02*r,0]}))}if(e===`scrub-cap`){let e=-.12*i;u.head.push($.sphere(1*i,Ro,{at:[0,a+.4*i,e],scale:[1.07,.7,1.05]},24)),u.head.push($.torus(.98*i,.07*i,zo,{at:[0,a+.42*i,e],rot:[Math.PI/2+.12,0,0],scale:[1.08,1.05,1]}));for(let[e,t]of[[-.5,.86],[.1,1.02],[.6,.82],[-.15,.7]])u.headPlain.push($.sphere(.07*i,`#FF8FB8`,{at:c(e*i,(t-.45)*i+.4*i,.08*i),scale:[1,1,.4]}))}if(e===`apron`){u.body.push($.rbox(.2*r,.15*r,.03*r,.03*r,`#FF8FB8`,{at:[0,.4*r,.15*r],rot:[-.12,0,0]})),u.body.push($.cyl(.2*r,.26*r,.2*r,`#FF8FB8`,{at:[0,.22*r,.012*r],scale:[1,1,.9]},20)),u.body.push($.torus(.19*r,.016*r,`#FFFFFF`,{at:[0,.32*r,0],rot:[Math.PI/2,0,0]}));for(let e of[-1,1])u.body.push($.capsule(.012*r,.1*r,`#FFFFFF`,{at:[e*.075*r,.5*r,.1*r],rot:[-.6,0,-e*.5]}));u.bodyPlain.push($.rbox(.09*r,.06*r,.012*r,.012*r,`#FFFFFF`,{at:[0,.2*r,.235*r],rot:[-.3,0,0]}))}if(e===`smock`){u.body.push($.capsule(.175*r,.06*r,`#C9B5F7`,{at:[0,.37*r,0]})),u.body.push($.cyl(.17*r,.25*r,.2*r,`#C9B5F7`,{at:[0,.225*r,0]},20)),u.bodyPlain.push(...[.44,.36,.28].map(e=>$.sphere(.014*r,`#FFFFFF`,{at:[.07*r,e*r,.17*r]}))),u.body.push($.rbox(.07*r,.06*r,.012*r,.008*r,`#B39CEB`,{at:[-.075*r,.42*r,.165*r],rot:[0,-.4,0]})),u.body.push($.box(.05*r,.03*r,.008*r,`#FF8FB8`,{at:[-.075*r,.465*r,.168*r],rot:[0,-.4,0]}));for(let[e,t]of[[`armL`,-1],[`armR`,1]])u[e].push($.sphere(.074*r,`#C9B5F7`,{at:[t*.006*r,-.02*r,0]}))}if(e===`chef-hat`){let e=-.32*i;u.head.push($.cyl(.62*i,.66*i,.4*i,`#FFFFFF`,{at:[0,a+.98*i,e],rot:[-.25,0,0]},24));for(let[t,n]of[[0,0],[-.32,-.1],[.32,-.1],[0,-.3],[-.18,.2],[.18,.2]])u.head.push($.sphere(.4*i,`#FFFFFF`,{at:[t*i,a+1.32*i,e+(n-.12)*i]},16));u.head.push($.torus(.65*i,.06*i,`#FFD6E6`,{at:[0,a+.8*i,e+.04*i],rot:[Math.PI/2-.25,0,0]}))}if(e===`gloves`){let e=n.species===`unicorn`?`#FF4F9A`:`#E8403F`;for(let[t,n]of[[`armL`,-1],[`armR`,1]])u[t].push($.sphere(.082*r,e,{at:[n*.054*r,-.158*r,.012*r],scale:[1,1.08,1.12]})),u[t].push($.sphere(.034*r,e,{at:[n*.012*r,-.15*r,.06*r],scale:[.9,1.4,.9]})),u[t].push($.cyl(.058*r,.062*r,.04*r,`#FFFFFF`,{at:[n*.036*r,-.098*r,.004*r],rot:[0,0,n*.35]}))}if(e===`mongkhon`&&(u.head.push($.torus(.985*i,.085*i,`#E8403F`,{at:[0,a+.3*i,-.02*i],rot:[Math.PI/2-.2,0,0],scale:[1.04,1,1]})),u.head.push($.capsule(.07*i,.4*i,`#E8403F`,{at:[.08*i,a+.02*i,-1.08*i],rot:[-.55,0,.25]})),u.headPlain.push($.sphere(.07*i,`#FFC83D`,{at:c(0,.48*i,.07*i)}))),e===`floaties`)for(let[e,t,n]of[[`armL`,-1,`#FF7FA8`],[`armR`,1,`#FF9F45`]]){let i=.058*r,a=.038*r,o=[t*Math.sin(.35),-Math.cos(.35),0],s=[t*.026*r,-.072*r,0],c=e=>[s[0]-o[0]*e,s[1]-o[1]*e,s[2]],l=[Math.PI/2,t*.35,0];u[e].push($.torus(i,a,n,{at:s,rot:l})),u[e].push($.torus(i+a*.5,a*.32,`#FFF7F0`,{at:c(a*.82),rot:l})),u[e].push($.cyl(.012*r,.012*r,.03*r,`#FFF7F0`,{at:[s[0]+t*(i+a*.9),s[1],s[2]+.01*r],rot:[0,0,t*(Math.PI/2-.35)]}))}return u}function Vo(e,t,n,r=Io(e),i=e.height>=1?3:2.5){let a=Bo(t,r,e),o=(e,t)=>e.length||t.length?Da(e,t,n,i):null;return{head:o(a.head,a.headPlain),armL:o(a.armL,[]),armR:o(a.armR,[]),body:o(a.body,a.bodyPlain)}}var Ho=class{goal=0;k=0;update(e,t,n){this.k+=(this.goal-this.k)*(1-Math.exp(-t*4));let r=this.k;e.mane&&(e.mane.rotation.x=r*(.62+Math.sin(n*13)*.08+Math.sin(n*5.3)*.06),e.mane.rotation.z=r*Math.sin(n*9.1)*.05,e.tail&&(e.tail.rotation.x=r*(.75+Math.sin(n*11+1)*.12),e.tail.rotation.y=r*Math.sin(n*7)*.12))}},Uo=e=>.135*e.height;function Wo(e,t=.6){let n=Uo(e);e.body.rotation.x=-t,e.body.position.set(0,n*(1-Math.cos(t)),n*Math.sin(t)),e.head.rotation.x=t*.8,e.tail&&(e.tail.visible=t===0)}function Go(e,t){let n=Io(e),{H:r,R:i,headY:a,shoulder:o,eyeX:s,eyeY:c,eyeSize:l,lift:u,on:d,turnTo:f}=n,p=e.species===`sea-otter`,m=p?1.5:r>=1?3:2.5,h=e.species===`penguin`,_=e.species===`hornbill`||e.species===`tern`||e.species===`pelican`||e.species===`hen`,v=e.species===`tern`,y=e.species===`polarbear`,b=e.species===`unicorn`||e.species===`buffalo`||e.species===`panda`||e.species===`pony`||e.species===`bear`||e.species===`moose`||e.species===`raccoon`||e.species===`beaver`,x=[],S=[],C=[],w=[],T=[],E=[],D=[],O=[],k=[],A=[0,0,0],j=[],ee=[],te=[],M=null,N={L:[],R:[]},P=[],ne=[],F=[0,0,0],re=[],ie=[],I=e.chub??1,L=[I,1,1+(I-1)*.8],R=.52*r;if(h){if(e.cap)for(let t=0;t<9;t++){let n=t/9*Math.PI*2+.3;x.push($.sphere(.07*r,e.fur,{at:[Math.sin(n)*.28*r,(.24+t%2*.05)*r,Math.cos(n)*.26*r],rot:[0,n,.5],scale:[.7,1,.7]}))}x.push($.sphere(.31*r,e.fur,{at:[0,.33*r,0],scale:[1,1.02,.95]},24)),x.push($.sphere(.25*r,e.light,{at:[0,.3*r,.12*r],scale:[1,1.08,.66]},20));for(let t of[-1,1])x.push($.sphere(.09*r,e.dark,{at:[t*.11*r,.025*r,.13*r],scale:[1,.42,1.45]}))}else if(_){let t=e.species===`hen`;t?x.push($.sphere(.2*r,e.fur,{at:[0,.33*r,-.01*r],scale:[I,1.05,1.1]},22)):x.push($.sphere(.17*r,e.fur,{at:[0,.36*r,v?-.015*r:0],scale:[1,1.2,1]},20)),x.push(v?$.sphere(.16*r,e.light,{at:[0,.34*r,.035*r],scale:[1,1.15,.9]},20):$.sphere(.13*r,e.light,{at:[0,.3*r,.07*r],scale:[1,1.15,.7]}));let n=v?e.dark:e.species===`pelican`||t?e.ear??`#FFB45C`:e.fur;for(let e of[-1,1]){let t=e*.07*r;x.push($.capsule(.025*r,.12*r,n,{at:[t,.1*r,0]}));for(let e of[-.5,0,.5])x.push($.capsule(.017*r,.06*r,n,{at:[t+Math.sin(e)*.04*r,.015*r,Math.cos(e)*.04*r],rot:[Math.PI/2,e,0]}))}}else if(p)x.push(...So(e,L));else{let t=e.species===`panda`?e.dark:e.fur,n=e.sculpted?e.paws??`#6A4234`:b?e.dark:e.light,i=.085*r*(1+(I-1)*.7),a=.07*r*(1+(I-1)*.6);for(let e of[-1,1])x.push($.capsule(a,.06*r,t,{at:[e*i,.1*r,0]})),x.push($.sphere(.075*r*(1+(I-1)*.6),n,{at:[e*i,.035*r,.02*r],scale:[1,.6,1.3]}));if(x.push($.capsule(.155*r,.1*r,e.fur,{at:[0,.34*r,0],scale:L})),(e.species===`fox`||e.species===`puppy`||e.species===`otter`)&&!e.outfit?.lace&&x.push($.sphere(.075*r,e.light,{at:[0,.5*r,.11*r*L[2]],scale:[1.1,.8,.7]})),e.species===`beaver`&&S.push(Ba(r,I,L[2],e.light)),e.species===`raccoon`&&!e.outfit&&S.push(Xa(r,I,L[2],e.light)),e.species===`buffalo`&&!e.outfit&&x.push($.sphere(.11*r,e.light,{at:[0,.27*r,.1*r],scale:[1,1.1,.55]})),e.species===`tortoise`){let t=.2*r*I,n=[0,.35*r,-.06*r*L[2]],i=[1.02,1.05,.85];x.push($.sphere(t,e.dark,{at:n,scale:i},26));let a=(a,o,s)=>{let c=-Math.sqrt(Math.max(0,1-a*a-o*o));S.push($.sphere(s*r*I,e.ear??e.light,{at:[n[0]+a*t*i[0]*.97,n[1]+o*t*i[1]*.97,n[2]+c*t*i[2]*.97],scale:[1,1,.45]},14))};a(0,.12,.07);for(let e=0;e<6;e++){let t=e/6*Math.PI*2+Math.PI/6;a(Math.cos(t)*.6,.1+Math.sin(t)*.55,.05)}x.push($.torus(t*.96,.024*r,e.light,{at:[0,n[1],.01*r],scale:[i[0],i[1],1]})),e.outfit||x.push($.sphere(.13*r,e.light,{at:[0,.31*r,.1*r*L[2]],scale:[1.05*I,1.25,.55]}))}if(e.species===`bear`&&!e.plainChest){let t=.445*r,n=Math.sqrt(Math.max(0,(.155*r)**2-(t-.39*r)**2))*L[2];x.push($.torus(.07*r*I,.026*r,e.light,{at:[0,t+.03*r,n-.008*r],rot:[-.45,0,Math.PI],scale:[1.15,1,1]},Math.PI))}}let z=e.outfit;if(z){if(h)x.push(Fo(.3*r,.335*r,.18*r,z.color,{at:[0,.43*r,0]}));else{let e=z.kind===`shirt`;if(x.push($.capsule(.163*r,(e?.1:.06)*r,z.color,{at:[0,(e?.35:.37)*r,0],scale:L})),z.kind===`dress`&&x.push(Fo(.15*r,.235*r,.17*r,z.color,{at:[0,.235*r,0],scale:L})),z.shorts&&x.push(Fo(.16*r,.168*r,.09*r,z.shorts,{at:[0,.205*r,0],scale:L})),z.kind===`polo`){for(let e of[-1,1])x.push($.box(.08*r,.012*r,.06*r,z.color,{at:[e*.045*r,.535*r,.1*r],rot:[.5,0,e*-.4]}));S.push(...[.47,.42].map(e=>$.sphere(.009*r,Mo,{at:[0,e*r,.162*r*L[2]]})))}if(z.kind===`blouse`&&z.lace){for(let e=0;e<11;e++){let t=-1.5+e/10*3,n=[Math.sin(t)*.9,.44,Math.cos(t)*.9],i=[Math.sin(t)*.152*r*L[0],(.476+Math.abs(t)*.024)*r,Math.cos(t)*.152*r*L[2]];x.push($.sphere(.031*r,z.lace,{at:i,rot:[-.5,t,0],scale:[1,.9,.38]},14)),S.push($.sphere(.012*r,`#FFD9E6`,{at:[i[0]+n[0]*.009*r,i[1]+n[1]*.009*r,i[2]+n[2]*.009*r],rot:[-.5,t,0],scale:[1,.9,.5]},10))}S.push(...[-.09,-.06,-.03,0,.03,.06,.09].map(e=>$.capsule(.004*r,.11*r,`#EBD3DE`,{at:[e*r,.385*r,Math.sqrt(.1645**2-e*e)*r*L[2]],rot:[0,Math.asin(e/.1645),0]}))),x.push(Fo(.16*r,.184*r,.07*r,z.color,{at:[0,.283*r,0],scale:L})),x.push($.torus(.183*r,.008*r,z.lace,{at:[0,.25*r,0],rot:[Math.PI/2,0,0],scale:[L[0],L[2],1]}))}else z.kind===`blouse`&&(x.push($.torus(.075*r,.016*r,`#FFFFFF`,{at:[0,.525*r,.04*r*L[2]],rot:[Math.PI/2-.35,0,0]})),S.push(...[.46,.4].map(e=>$.sphere(.009*r,`#FFE7A8`,{at:[0,e*r,.163*r*L[2]]}))));if(z.kind===`shirt`&&z.print){for(let e of[-1,1])x.push($.box(.085*r,.012*r,.07*r,z.color,{at:[e*.05*r,.53*r,.1*r],rot:[.55,0,e*-.45]}));S.push(...[.44,.37,.3].map(e=>$.sphere(.009*r,Mo,{at:[0,e*r,.165*r*L[2]]})));let e=.165*r;[[-.6,.47],[.62,.46],[-.2,.38],[.3,.33],[1.05,.38],[-1.1,.36],[-.55,.28],[.75,.26],[1.6,.46],[-1.7,.44],[2.3,.36],[-2.4,.33],[3.1,.42],[2.8,.27],[-2.9,.26]].forEach(([t,n],i)=>{Ko(S,[Math.sin(t)*e*L[0],n*r,Math.cos(t)*e*L[2]],[0,t,0],.032*r,z.print[i%z.print.length],i)})}else z.kind===`shirt`&&(S.push(...[.47,.4,.33,.26].map(e=>$.sphere(.011*r,`#E8B85C`,{at:[0,e*r,.164*r*L[2]]}))),x.push($.box(.06*r,.06*r,.01*r,z.color,{at:[.07*r,.44*r,.15*r],rot:[0,.45,0]})))}}for(let[t,n]of[[`L`,-1],[`R`,1]]){let i=N[t];if(h)i.push($.capsule(.07*r,.14*r,e.fur,{at:[n*.015*r,-.12*r,0],rot:[0,0,n*.3],scale:[.45,1,1]})),z&&i.push($.sphere(.06*r,z.color,{at:[n*0,-.02*r,0],scale:[.8,1,1]}));else if(v)i.push($.sphere(.1*r,e.fur,{at:[n*.025*r,-.12*r,-.03*r],rot:[.35,0,n*.1],scale:[.34,1.6,.85]})),i.push($.sphere(.06*r,Po,{at:[n*.035*r,-.25*r,-.08*r],rot:[.45,0,n*.1],scale:[.36,1.7,.7]}));else if(_)i.push($.sphere(.08*r,e.fur,{at:[n*.02*r,-.09*r,0],rot:[0,0,n*.3],scale:[.5,1.35,.95]})),i.push($.sphere(.04*r,e.light,{at:[n*.05*r,-.18*r,.02*r],scale:[.6,1,.9]})),z&&i.push($.sphere(.06*r,z.color,{at:[0,-.01*r,0]}));else{let a=e.species===`panda`?e.dark:e.fur,o=e.sculpted?e.paws??`#6A4234`:b||p?e.dark:e.species===`fox`||e.species===`puppy`||e.species===`monkey`||e.species===`otter`||y?e.light:e.fur;i.push($.capsule(.052*r,.09*r,a,{at:[n*.025*r,-.075*r,0],rot:[0,0,n*.35]})),i.push($.sphere(.054*r,o,{at:[n*.05*r,-.14*r,.005*r],scale:p?[.84,1.2,.67]:void 0})),z&&i.push($.sphere(.068*r,z.color,{at:[n*.004*r,-.015*r,0]})),z?.lace&&i.push($.torus(.054*r,.01*r,z.lace,{at:[n*.021*r,-.062*r,0],rot:[Math.PI/2,n*.35,0]})),z?.print&&Ko(i,[n*.035*r,-.01*r,.058*r],[0,n*.55,0],.024*r,z.print[+(t===`L`)],0)}}for(let t of[-1,1]){let n=t*s;if(T.push($.sphere(l,Do,{at:d(n,c,u-.03*i),rot:f(n),scale:[.78,1,.42]})),E.push($.sphere(l*.3,Mo,{at:d(n+t*.05*i,c+.08*i,u+.035*i)})),E.push($.sphere(l*.14,Mo,{at:d(n-t*.05*i,c-.07*i,u+.035*i)})),e.extras?.includes(`lids`)){T.push($.sphere(l*1.08,e.light,{at:d(n,c+.1*i,u-.005*i),rot:[-.15,f(n)[1],t*-.12],scale:[.86,.62,.5]}));for(let e of[-1,1])w.push($.capsule(.011*i,.08*i,Do,{at:d(n+t*.24*i,c+e*.055*i,u+.005*i),rot:[0,f(n+t*.24*i)[1],t*(Math.PI/2+e*.55)]}))}if(e.extras?.includes(`eye-ring`)&&w.push($.sphere(l*1.55,Mo,{at:d(n,c,u-.06*i),rot:f(n),scale:[.9,1.05,.3]},16)),e.lashes)for(let e of[0,1])E.push($.capsule(.012*i,.07*i,Do,{at:d(n+t*(.16+e*.05)*i,c+(.17-e*.07)*i,u+.01*i),rot:[0,0,t*(-.9-e*.5)]}));let r=e.species===`unicorn`||e.species===`pony`?-.08*i:-.2*i;!p&&e.species!==`raccoon`&&!e.sculpted&&w.push($.sphere(.12*i,e.species===`moose`?`#B77865`:Oo,{at:d(t*.58*i,r,u*.6-.02*i),rot:f(t*.58*i),scale:[1.25,.65,.3]}))}let ae=(e,t)=>t===void 0?d(0,e,.005*i):[0,a+e,t],B=t=>{A=t,e.smile===`teeth`?(D.push($.sphere(.2*i,ko,{at:[0,-.02*i,-.1*i],scale:[1.2,.6,.7]},20)),D.push($.sphere(.17*i,Mo,{at:[0,.035*i,-.07*i],scale:[1.2,.3,.7]},20)),D.push($.sphere(.08*i,Ao,{at:[0,-.08*i,-.03*i],scale:[1.6,.5,.8]}))):e.open?(D.push($.sphere(.2*i,ko,{scale:[1.15,.72,.35]})),D.push($.sphere(.1*i,Ao,{at:[0,-.07*i,.03*i],scale:[1.3,.6,.5]}))):D.push($.torus(.075*i,.017*i,ko,{rot:[0,0,Math.PI]},Math.PI))};switch(e.species){case`unicorn`:{let t=e.mane??[e.fur],n=e=>t[e%t.length];C.push($.sphere(i,e.fur,{at:[0,a,0]},26)),C.push($.sphere(.52*i,e.light,{at:[0,a-.36*i,.6*i],scale:[1.05,.66,.6]})),w.push(...[-1,1].map(e=>$.sphere(.032*i,Do,{at:[e*.16*i,a-.27*i,.91*i],scale:[1,.7,.6]}))),B(ae(-.47*i,.86*i));for(let t of[-1,1])C.push($.cone(.24*i,.7*i,e.fur,{at:[t*.62*i,a+.92*i,0*i],rot:[-.1,0,-t*.42]})),w.push($.cone(.13*i,.44*i,e.ear??e.light,{at:[t*.6*i,a+.87*i,.1*i],rot:[-.1,0,-t*.42]}));C.push($.cone(.15*i,.78*i,`#FFC83D`,{at:[0,a+1.12*i,.25*i],rot:[.28,0,0]})),w.push(...[0,1,2].map(e=>$.torus(.12*i-e*.03*i,.022*i,`#E8A92A`,{at:[0,a+(.86+e*.17)*i,(.18+e*.05)*i],rot:[Math.PI/2+.28,0,0]}))),C.push($.sphere(.88*i,n(0),{at:[0,a+.42*i,-.12*i],scale:[1.05,.62,1]})),C.push($.sphere(.32*i,n(0),{at:[-.32*i,a+.62*i,.62*i]}),$.sphere(.27*i,n(1),{at:[.02*i,a+.72*i,.6*i]}));let o=e.hair===`short`?2:e.hair===`long`?5:3,s=e.hair===`short`?0:e.hair===`long`?5:2;for(let e=0;e<o;e++)k.push($.sphere((.42-e*.03)*i,n(e+1),{at:[.05*i*(e%2),a+(.15-e*.36)*i,-.82*i+e*.04*i]}));for(let e of[-1,1])for(let t=0;t<s;t++)k.push($.sphere((.34-t*.02)*i,n(t+(e<0?2:3)),{at:[e*(.86+t*.03)*i,a+(.05-t*.34)*i,(-.2-t*.04)*i]}));[[.27,-.16,.07],[.23,-.23,.075],[.17,-.29,.075],[.11,-.31,.068],[.06,-.27,.058]].forEach(([e,t,i],a)=>P.push($.sphere(i*r,n(a),{at:[0,e*r,t*r]})));break}case`panda`:C.push($.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])C.push($.sphere(.27*i,e.dark,{at:[t*.7*i,a+.7*i,-.12*i]})),w.push($.sphere(.15*i,e.ear??`#FFB3C7`,{at:[t*.68*i,a+.68*i,.08*i],scale:[1,1,.4]})),C.push($.sphere(.3*i,`#62566A`,{at:d(t*s,c-.03*i,-.12*i),rot:[0,Math.asin(t*s/i),t*.45],scale:[.85,1.12,.4]}));C.push($.sphere(.42*i,e.light,{at:[0,a-.33*i,.62*i],scale:[1.1,.72,.7]})),C.push($.sphere(.1*i,e.dark,{at:[0,a-.17*i,.96*i],scale:[1.3,.8,.8]})),B(ae(-.47*i,.86*i)),C.push($.sphere(.16*i,e.fur,{at:[.05*i,a+.96*i,.1*i],scale:[1.4,.7,1]}));break;case`elephant`:C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[1.08,1,1]},26));for(let t of[-1,1])C.push($.sphere(.62*i,e.fur,{at:[t*1.02*i,a+.08*i,-.12*i],rot:[0,t*.45,-t*.15],scale:[1,1.12,.26]})),w.push($.sphere(.46*i,e.ear??e.dark,{at:[t*1.07*i,a+.06*i,-.03*i],rot:[0,t*.45,-t*.15],scale:[1,1.1,.2]}));for(let[t,n,r]of[[-.15,.88,.24],[-.32,.98,.21],[-.48,1.05,.19],[-.62,1.14,.17],[-.7,1.27,.155],[-.7,1.4,.145],[-.62,1.5,.14]])C.push($.sphere(r*i,e.fur,{at:[0,a+t*i,n*i]}));w.push($.torus(.09*i,.035*i,e.dark,{at:[0,a-.55*i,1.56*i],rot:[-.9,0,0]})),A=d(0,-.36*i,.01*i),D.push($.torus(.24*i,.022*i,ko,{rot:[0,0,Math.PI]},Math.PI)),C.push(...[-.14,.04,.2].map((t,n)=>$.sphere((.15-n*.02)*i,e.dark,{at:[t*i,a+(.95-n*.04)*i,.15*i],scale:[.8,1.2,.8]}))),P.push($.capsule(.018*r,.12*r,e.fur,{at:[0,.2*r,-.19*r*L[2]],rot:[.5,0,0]})),P.push($.sphere(.035*r,e.dark,{at:[0,.13*r,-.24*r*L[2]],scale:[1,1.4,1]})),F=[0,.26*r,-.17*r*L[2]];break;case`puppy`:C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[1.08,1,1]},26)),C.push($.sphere(.44*i,e.light,{at:[0,a-.36*i,.66*i],scale:[1.15,.72,.75]})),C.push($.sphere(.14*i,e.dark,{at:[0,a-.18*i,1*i],scale:[1.35,.9,.8]})),B(ae(-.52*i,.92*i));for(let t of[-1,1])C.push($.sphere(.38*i,e.ear??e.fur,{at:[t*.94*i,a-.02*i,-.04*i],rot:[0,0,t*.22],scale:[.58,1.38,.55]}));C.push(...[-.12,.1].map((t,n)=>$.sphere((.2-n*.03)*i,e.fur,{at:[t*i,a+(.94-n*.04)*i,.2*i],scale:[.8,1.2,.8]}))),F=[0,.24*r,-.15*r*L[2]],P.push($.sphere(.05*r,e.fur,{at:[0,.3*r,-.2*r*L[2]],rot:[-.7,0,0],scale:[.8,1.7,.8]})),P.push($.sphere(.04*r,e.light,{at:[0,.38*r,-.24*r*L[2]]}));break;case`pony`:{let t=e.mane??[e.dark],n=e=>t[e%t.length];C.push($.sphere(i,e.fur,{at:[0,a,0]},26)),C.push($.sphere(.56*i,e.light,{at:[0,a-.4*i,.62*i],scale:[1.05,.72,.76]})),w.push(...[-1,1].map(e=>$.sphere(.05*i,Do,{at:[e*.2*i,a-.32*i,1.02*i],scale:[1,1.3,.6]}))),B(ae(-.56*i,.9*i));for(let t of[-1,1])C.push($.cone(.22*i,.62*i,e.fur,{at:[t*.5*i,a+.98*i,-.05*i],rot:[-.1,0,-t*.28]})),w.push($.cone(.12*i,.38*i,e.ear??e.light,{at:[t*.49*i,a+.94*i,.05*i],rot:[-.1,0,-t*.28]}));k.push($.sphere(.3*i,n(0),{at:[0,a+.74*i,.62*i],scale:[1,.9,.8]}));for(let e=0;e<5;e++)k.push($.sphere((.36-e*.02)*i,n(e+1),{at:[0,a+(.92-e*.36)*i,(.2-e*.26)*i],scale:[.85,1,1]}));F=[0,.26*r,-.16*r],[[.27,-.2,.06],[.22,-.25,.065],[.16,-.28,.065],[.1,-.29,.058]].forEach(([e,t,i],a)=>P.push($.sphere(i*r,n(a),{at:[0,e*r,t*r]})));break}case`monkey`:{C.push($.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])C.push($.sphere(.46*i,e.light,{at:[t*.3*i,a+.07*i,.6*i],scale:[1,1.08,.78]}));C.push($.sphere(.52*i,e.light,{at:[0,a-.36*i,.62*i],scale:[1.25,.8,.8]})),w.push(...[-1,1].map(e=>$.sphere(.04*i,Do,{at:[e*.1*i,a-.2*i,1.03*i],scale:[1,.75,.6]}))),B(ae(-.52*i,1*i));for(let t of[-1,1])C.push($.sphere(.36*i,e.fur,{at:[t*1.02*i,a-.02*i,-.02*i],scale:[.36,1,1]})),w.push($.sphere(.24*i,e.ear??e.light,{at:[t*1.09*i,a-.02*i,.02*i],scale:[.3,1,1]}));C.push($.cone(.13*i,.36*i,e.fur,{at:[.05*i,a+1.02*i,.12*i],rot:[.2,0,-.5]})),F=[0,.2*r,-.15*r*L[2]];let t=[[.2,-.13,.034],[.17,-.22,.032],[.16,-.3,.03],[.2,-.37,.029],[.28,-.41,.028],[.37,-.4,.027],[.43,-.35,.026],[.44,-.29,.026],[.4,-.26,.026]];for(let n=0;n<t.length-1;n++){let[i,a,o]=t[n],[s,c]=t[n+1],l=Math.hypot(s-i,c-a)*r;P.push($.capsule(o*r,l,e.fur,{at:[0,(i+s)/2*r,(a+c)/2*r],rot:[Math.atan2(c-a,s-i),0,0]}))}break}case`fox`:if(e.sculpted){let t=ro(e,n,e.hairdo?.color??`#6A4234`);C.push(...t.outlined),w.push(...t.plain),B(t.mouth),e.hairdo||C.push(...[-.2,.05,.28].map((t,n)=>$.sphere((.24-n*.03)*i,e.fur,{at:[t*i,a+(.82-n*.06)*i,.48*i]}))),F=[.02*r,.25*r,-.12*r],P.push(io(e,F));break}C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[1.1,1,1]},26));for(let t of[-1,1])C.push($.cone(.36*i,.98*i,e.fur,{at:[t*.58*i,a+.95*i,-.08*i],rot:[-.1,0,-t*.38]})),w.push($.cone(.2*i,.6*i,e.ear??e.light,{at:[t*.56*i,a+.88*i,.06*i],rot:[-.1,0,-t*.38]})),C.push($.sphere(.34*i,e.light,{at:[t*.52*i,a-.42*i,.55*i]}));C.push($.sphere(.3*i,e.light,{at:[0,a-.36*i,.8*i],scale:[1.1,.8,.8]})),C.push($.sphere(.08*i,e.dark,{at:[0,a-.22*i,1.03*i],scale:[1.3,.85,.9]})),B(ae(-.48*i,1*i)),e.hairdo||C.push(...[-.2,.05,.28].map((t,n)=>$.sphere((.24-n*.03)*i,e.fur,{at:[t*i,a+(.82-n*.06)*i,.48*i]}))),P.push($.sphere(.13*r,e.fur,{at:[.05*r,.27*r,-.2*r],rot:[-.6,0,.25],scale:[.78,1.38,.78]})),P.push($.sphere(.085*r,e.light,{at:[.09*r,.42*r,-.29*r]}));break;case`buffalo`:{let t=uo(e,n);if(C.push(...t.outlined),w.push(...t.plain),B(t.mouth),e.hairdo||C.push(...[-.15,.12].map(e=>$.sphere(.25*i,`#7A86B0`,{at:[e*i,a+.82*i,.3*i],scale:[1.2,.7,1]}))),e.extras?.includes(`pigtails`))for(let e of[-1,1])C.push($.capsule(.16*i,.5*i,`#7A86B0`,{at:[e*1.12*i,a-.52*i,-.02*i],rot:[0,0,e*.45]})),C.push($.sphere(.13*i,`#7A86B0`,{at:[e*1.36*i,a-.98*i,.02*i]})),C.push($.cone(.13*i,.26*i,`#FF6FAE`,{at:[e*1.12*i,a-.2*i,.04*i],rot:[0,0,e*Math.PI/2]})),C.push($.cone(.13*i,.26*i,`#FF6FAE`,{at:[e*.9*i,a-.2*i,.04*i],rot:[0,0,-e*Math.PI/2]}));P.push($.capsule(.02*r,.14*r,e.fur,{at:[0,.18*r,-.19*r],rot:[.6,0,0]})),F=[0,.26*r,-.15*r],P.push($.sphere(.04*r,e.dark,{at:[0,.1*r,-.25*r],scale:[1,1.3,1]}));break}case`penguin`:{let t=e.cap??e.fur;if(C.push($.sphere(i,t,{at:[0,a,0]},26)),e.ear)for(let t of[-1,1])C.push($.sphere(.3*i,e.ear,{at:[t*.8*i,a-.3*i,.22*i],rot:[0,t*.6,t*-.3],scale:[.55,1.15,.9]}));let n=e.extras?.includes(`eye-ring`)?t:e.light;for(let e of[-1,1])C.push($.sphere(.62*i,n,{at:[e*.28*i,a-.16*i,.48*i],scale:[1,1.02,.95]}));A=[0,a-(e.open?.25:.33)*i,(e.open?1.08:1.04)*i],e.open?(C.push($.cone(.2*i,.4*i,e.dark,{at:[0,a-.14*i,1.13*i],rot:[Math.PI/2,0,0],scale:[1.5,1,.65]})),C.push($.cone(.14*i,.26*i,e.dark,{at:[0,a-.33*i,1.06*i],rot:[Math.PI/2+.4,0,0],scale:[1.4,1,.6]})),D.push($.sphere(.11*i,ko,{scale:[1.5,.6,.5]}))):C.push($.cone(.18*i,.36*i,e.dark,{at:[0,a-.2*i,1.12*i],rot:[Math.PI/2,0,0],scale:[1.45,1,.65]})),e.extras?.includes(`tuft`)&&C.push(...[-.15,.05,.24].map((e,n)=>$.sphere(.17*i,t,{at:[e*i,a+(1+n%2*.1)*i,0],rot:[0,0,-e*2.5],scale:[.7,1.5,.7]}))),e.extras?.includes(`tuft`)||C.push($.sphere(.18*i,t,{at:[.05*i,a+.93*i,.1*i],scale:[1.3,.6,1]}));break}case`tortoise`:C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[1,.96,1.04]},26)),C.push($.sphere(.5*i,e.light,{at:[0,a-.36*i,.6*i],scale:[1.2,.68,.72]})),w.push(...[-1,1].map(e=>$.sphere(.035*i,Do,{at:[e*.13*i,a-.17*i,1.02*i],scale:[1,.8,.6]}))),B(ae(-.44*i,.92*i)),F=[0,.16*r,-.2*r*L[2]],P.push($.cone(.035*r,.1*r,e.fur,{at:[0,.15*r,-.25*r*L[2]],rot:[-Math.PI/2-.3,0,0]},10));break;case`bear`:C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[1.08,1,1]},26));for(let t of[-1,1])C.push($.sphere(.3*i,e.fur,{at:[t*.74*i,a+.7*i,-.08*i],scale:[1,1,.7]})),w.push($.sphere(.17*i,e.ear??e.light,{at:[t*.74*i,a+.69*i,.07*i],scale:[1,1,.4]}));C.push($.sphere(.5*i,e.light,{at:[0,a-.33*i,.6*i],scale:[1.25,.8,.78]})),C.push($.sphere(.14*i,e.dark,{at:[0,a-.16*i,.99*i],scale:[1.4,.9,.8]})),B(ae(-.52*i,.92*i)),F=[0,.2*r,-.15*r*L[2]],P.push($.sphere(.05*r,e.fur,{at:[0,.2*r,-.17*r*L[2]]}));break;case`polarbear`:C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[1.08,.98,1]},26));for(let t of[-1,1])C.push($.sphere(.25*i,e.fur,{at:[t*.78*i,a+.6*i,-.06*i],scale:[1,1,.7]})),w.push($.sphere(.14*i,e.ear??e.light,{at:[t*.79*i,a+.59*i,.07*i],scale:[1,1,.4]})),C.push($.sphere(.2*i,e.fur,{at:[t*.86*i,a-.3*i,.2*i],scale:[.7,.9,.9]}));C.push(...[-.18,.04,.22].map((t,n)=>$.sphere(.15*i,e.fur,{at:[t*i,a+(.94+n%2*.08)*i,.06*i],rot:[0,0,-t*2.2],scale:[.75,1.3,.75]}))),C.push($.sphere(.5*i,e.light,{at:[0,a-.3*i,.66*i],scale:[1.15,.78,.9]})),C.push($.sphere(.15*i,e.dark,{at:[0,a-.13*i,1.08*i],scale:[1.35,.95,.8]})),B(ae(-.52*i,1*i)),F=[0,.2*r,-.15*r*L[2]],P.push($.sphere(.05*r,e.fur,{at:[0,.2*r,-.17*r*L[2]]}));break;case`tern`:C.push($.sphere(i,e.light,{at:[0,a,0]},26)),C.push($.sphere(1.05*i,e.cap??Do,{at:[0,a+.12*i,-.24*i],rot:[-.75,0,0],scale:[1.03,.8,1]},26)),C.push($.cone(.2*i,.75*i,e.dark,{at:[0,a-.16*i,1.22*i],rot:[Math.PI/2+.15,0,0],scale:[1,1,.8]})),A=[0,a-.36*i,.92*i],F=[0,.27*r,-.15*r],P.push($.sphere(.07*r,e.fur,{at:[0,.25*r,-.18*r],scale:[1,.7,1.2]}));for(let t of[-1,1])P.push($.cone(.035*r,.3*r,e.light,{at:[t*.045*r,.17*r,-.3*r],rot:[-(Math.PI/2+.6),t*.3,0]}));break;case`beaver`:{let n=$.sphere(1,e.fur,{},48),o=n.attributes.position,c=n.attributes.normal,l=new J;for(let e=0;e<o.count;e++){let t=o.getX(e),n=o.getY(e),r=o.getZ(e),i=Math.exp(-((n+.36)**2)/.18),a=1+.17*i-.04*n,s=-.34*(n+.36)*i/.18-.04;o.setXYZ(e,t*a,n,r),l.set(t/a,n-t*t*s/a,r).normalize(),c.setXYZ(e,l.x,l.y,l.z)}C.push(n.scale(i,i,i).translate(0,a,0));for(let n of[-1,1]){let r=[n*.79*i,a+.67*i,-.04*i];C.push($.sphere(.21*i,e.fur,{at:r,scale:[1,1.07,.65]},26)),w.push($.sphere(.135*i,`#87563E`,{at:[r[0],r[1],.062*i],scale:[1,1.06,.32]},24));let o=n*s,c=new V;c.position.set(...d(o,.39*i,.035*i)),c.add(Da([],[$.torus(.148*i,.033*i,e.dark,{rot:[-.46,f(o)[1],.52-n*.18]},Math.PI-1.04)],t,0)),O.push(c),w.push($.sphere(.26*i,e.light,{at:[n*.165*i,a-.175*i,.97*i],rot:[0,n*.23,n*.16],scale:[1.03,.85,.69]},32))}w.push($.sphere(.175*i,`#4D3329`,{at:[0,a-.036*i,1.115*i],scale:[1.08,.78,.74]},30)),w.push($.sphere(.032*i,`#D7B79C`,{at:[-.055*i,a+.018*i,1.224*i],scale:[1.45,.64,.38]})),A=[0,a-.29*i,.986*i];let u=$.sphere(1,`#512B2A`,{},36),p=u.attributes.position;for(let e=0;e<p.count;e++){let t=p.getX(e),n=p.getY(e);p.setXYZ(e,t*.34,n*.18+t*t*.17-.095,p.getZ(e)*.085)}u.computeVertexNormals(),D.push(u.scale(i,i,i).rotateX(.4)),D.push($.sphere(.09*i,`#C67B71`,{at:[0,-.193*i,-.017*i],rot:[.4,0,0],scale:[1.45,.47,.34]}));for(let e of[-1,1])w.push($.rbox(.122*i,.176*i,.06*i,.027*i,jo,{at:[e*.064*i,a-.365*i,1.046*i],rot:[.3,e*.08,e*-.035]}));F=[0,.18*r,-.07*r*L[2]];let[m,h]=Va(r,F,e.dark);P.push(m),ne.push(h);break}case`moose`:C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[.94,1.04,1]},26)),C.push($.sphere(i,e.fur,{at:[0,a-.2*i,.71*i],rot:[.46,0,0],scale:[.48,.43,.51]},24)),C.push($.sphere(i,e.light,{at:[0,a-.34*i,.87*i],rot:[.2,0,0],scale:[.6,.42,.55]},40)),B(ae(-.5*i,1.392*i));for(let t of[-1,1]){w.push($.sphere(.085*i,e.dark,{at:[t*.255*i,a-.26*i,1.34*i],rot:[-.15,t*.52,-t*.2],scale:[.78,1.28,.36]})),w.push($.sphere(.15*i,`#70482F`,{at:d(t*s,c+.35*i),rot:f(t*s),scale:[1,.25,.35]}));let n=[0,-t*.18,-t*1.22];C.push($.sphere(i,e.fur,{at:[t*.93*i,a+.47*i,-.1*i],rot:n,scale:[.17,.33,.13]})),w.push($.sphere(i,e.ear??e.light,{at:[t*.96*i,a+.48*i,.01*i],rot:n,scale:[.1,.22,.055]})),C.push(za(t,i,a))}for(let[t,n]of[[-.19,.85],[0,.46],[.15,-.14]])C.push($.sphere(.2*i,e.fur,{at:[t*i,a+.98*i,.27*i],rot:[.6,0,n],scale:[.45,1.42,.6]}));F=[0,.24*r,-.15*r*L[2]],P.push($.sphere(.04*r,e.fur,{at:[0,.24*r,-.17*r*L[2]]}));break;case`raccoon`:{let t=Ya(e,n);C.push(...t.outlined),w.push(...t.plain),E.push(...t.eyeRings),B(t.mouth),F=[0,.18*r,-.15*r*L[2]],P.push(Za(e,F));break}case`sea-otter`:{let t=wo(e,n);C.push(...t.outlined),w.push(...t.plain),A=t.mouth,D.push(...t.smile),F=[0,.15*r,-.1*r],P.push(To(e,F));break}case`otter`:C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[1.12,.94,1]},26));for(let t of[-1,1]){C.push($.sphere(.18*i,e.fur,{at:[t*.86*i,a+.5*i,-.12*i],scale:[1,.9,.7]})),w.push($.sphere(.1*i,e.ear??e.dark,{at:[t*.86*i,a+.5*i,-.02*i],scale:[1,.9,.4]})),C.push($.sphere(.3*i,e.light,{at:[t*.2*i,a-.33*i,.76*i],scale:[1.05,.8,.75]}));for(let[n,r]of[[.18,.02],[.28,-.04],[.22,-.1]])w.push($.sphere(.025*i,e.dark,{at:[t*n*i,a-.3*i+r*i,1*i]}));for(let e of[-1,1])w.push($.capsule(.008*i,.32*i,`#FFFFFF`,{at:[t*.52*i,a-(.33+e*.05)*i,.82*i],rot:[0,-t*.5,Math.PI/2+t*e*.18]}))}C.push($.sphere(.13*i,e.dark,{at:[0,a-.16*i,1.02*i],scale:[1.6,.85,.8]})),C.push($.sphere(.45*i,e.light,{at:[0,a-.62*i,.4*i],scale:[1.1,.55,.8]})),B(ae(-.5*i,.98*i)),F=[0,.16*r,-.15*r*L[2]],[[.15,-.2,.075],[.11,-.29,.065],[.08,-.37,.052],[.06,-.44,.04],[.05,-.5,.028]].forEach(([t,n,i])=>P.push($.sphere(i*r,e.fur,{at:[0,t*r,n*r*L[2]],scale:[1,.8,1.2]})));break;case`pelican`:C.push($.sphere(i,e.fur,{at:[0,a,0]},26)),C.push(...[-.15,.05,.2].map((t,n)=>$.cone(.13*i,.5*i,e.fur,{at:[t*i,a+(.88-n*.05)*i,-.35*i],rot:[-1.1-n*.2,0,t*1.5]})));{let t=.75,n=[0,-Math.sin(t),Math.cos(t)],r=(e,t=0)=>[0,a-.32*i+n[1]*e+t,.86*i+n[2]*e];j.push($.capsule(.15*i,1.25*i,e.dark,{at:r(.78*i),rot:[Math.PI/2+t,0,0],scale:[1.3,1,.5]})),j.push($.sphere(.12*i,`#FF9A3C`,{at:r(1.5*i,.02*i),scale:[1.3,1,1]})),M=r(.05*i,-.04*i);let o=(e,n,i=0)=>{let a=r(e);return[i,a[1]+Math.cos(t)*n,a[2]+Math.sin(t)*n]};ee.push($.sphere(.36*i,e.ear??`#FFB45C`,{at:r(.7*i,-.33*i),rot:[t,0,0],scale:[.7,.6,1.6]}));for(let n of[-1,1])ee.push($.capsule(.035*i,1.05*i,e.dark,{at:o(.74*i,-.01*i,n*.17*i),rot:[Math.PI/2+t,0,0]}));te.push($.capsule(.15*i,1*i,ko,{at:o(.72*i,-.005*i),rot:[Math.PI/2+t,0,0],scale:[1.15,1,.12]})),te.push($.sphere(.12*i,Ao,{at:o(.5*i,.01*i),rot:[t,0,0],scale:[1,.18,1.9]}))}A=[0,a-.3*i,.92*i],F=[0,.24*r,-.15*r];for(let t of[-.5,0,.5])P.push($.sphere(.06*r,e.light,{at:[Math.sin(t)*.07*r,.22*r,-.2*r],rot:[-1,t,0],scale:[.6,1.4,.35]}));break;case`gecko`:{C.push($.sphere(i,e.fur,{at:[0,a,0],scale:[1.18,.9,1.08]},26)),C.push($.sphere(.6*i,e.light,{at:[0,a-.45*i,.5*i],scale:[1.3,.5,.8]}));for(let t of[-1,1])C.push($.sphere(.3*i,e.fur,{at:d(t*s,c+.06*i,-.12*i),rot:f(t*s),scale:[1,1,.6]})),w.push($.sphere(.03*i,Do,{at:[t*.14*i,a-.05*i,1.06*i]}));let t=e.ear??`#FF9A3C`;for(let[e,n]of[[0,.78],[-.38,.62],[.42,.55],[-.7,.2],[.72,.15],[.1,.45]])w.push($.sphere(.09*i,t,{at:[e*i*1.12,a+n*i*.9,Math.sqrt(Math.max(.05,1-e*e-n*n))*i*1.05],scale:[1,1,.4]}));for(let[e,n]of[[.9,.4],[-.9,.42],[2.4,.36],[-2.4,.3],[3.14,.42],[.5,.28],[-.4,.24]])S.push($.sphere(.022*r,t,{at:[Math.sin(e)*.158*r*L[0],n*r,Math.cos(e)*.158*r*L[2]],scale:[1,1,.45]}));A=d(0,-.32*i,.02*i),D.push($.torus(.2*i,.02*i,ko,{rot:[0,0,Math.PI]},Math.PI)),F=[0,.16*r,-.15*r*L[2]];for(let n=0;n<8;n++){let i=n/7;P.push($.sphere((.065-i*.04)*r,n%2?t:e.fur,{at:[Math.sin(i*2.2)*.12*r,(.1+Math.sin(i*Math.PI)*.08+i*.12)*r,(-.2-i*.32)*r*L[2]],scale:[1,.85,1.2]}))}break}case`hen`:C.push($.sphere(i,e.fur,{at:[0,a,0]},26)),C.push(...[-.22,0,.22].map((e,t)=>$.sphere((t===1?.26:.21)*i,No,{at:[0,a+(.95+(t===1?.08:0))*i,e*i+.12*i],scale:[.55,1,.9]}))),C.push($.cone(.17*i,.36*i,e.dark,{at:[0,a-.12*i,1.08*i],rot:[Math.PI/2,0,0],scale:[1.2,1,.8]})),C.push(...[-1,1].map(e=>$.sphere(.12*i,No,{at:[e*.07*i,a-.42*i,.9*i],scale:[.8,1.3,.7]}))),A=[0,a-.26*i,1*i],F=[0,.32*r,-.18*r];for(let[t,n]of[-.6,-.2,.2,.6].entries())P.push($.sphere(.075*r,t%2?e.fur:e.light,{at:[Math.sin(n)*.08*r,.42*r,-.2*r],rot:[-.35,n,0],scale:[.45,1.5,.35]}));break;case`hornbill`:A=[0,a-.45*i,.95*i],C.push($.sphere(i,e.fur,{at:[0,a,0]},26));for(let t of[-1,1])C.push($.sphere(.42*i,e.light,{at:[t*.42*i,a+.02*i,.62*i],scale:[1,1.05,.55]}));C.push($.cone(.32*i,1.45*i,e.dark,{at:[0,a-.32*i,1.35*i],rot:[2.05,0,0],scale:[.62,1,1.25]})),C.push($.capsule(.2*i,.55*i,`#FFD45C`,{at:[0,a+.22*i,1*i],rot:[Math.PI/2+.3,0,0],scale:[.65,1,.8]})),C.push($.sphere(.6*i,e.light,{at:[0,a-.75*i,.1*i],scale:[1.15,.55,1]})),C.push(...[-.2,.15].map(t=>$.sphere(.22*i,e.fur,{at:[t*i,a+.9*i,-.15*i],scale:[1.2,.7,1]})));for(let[t,n]of[-.9,-.45,0,.45,.9].entries())P.push($.sphere(.07*r,t%2?e.light:`#EADFCB`,{at:[Math.sin(n)*.1*r,.2*r,-.2*r-Math.cos(n)*.05*r],rot:[-.9,n,0],scale:[.55,1.6,.3]}))}e.hairdo&&qo(e.hairdo,n,C);for(let t of e.extras??[]){if(t===`glasses`||t===`round-glasses`){let e=t===`glasses`?`#E8A92A`:`#5FBFA0`,n=(t===`glasses`?.2:.26)*i;for(let t of[-1,1])C.push($.torus(n,.03*i,e,{at:d(t*s,c,.06*i),rot:f(t*s)}));C.push($.capsule(.025*i,s*2-n*2,e,{at:d(0,c+.03*i,.08*i),rot:[0,0,Math.PI/2]}))}if(t===`mailbag`){let e=`#C98A55`;x.push($.torus((_?.185:.168*I)*r,.013*r,e,{at:[0,.37*r,0],rot:[Math.PI/2,.75,0],scale:[1,1,L[2]]})),x.push($.rbox(.16*r,.13*r,.07*r,.02*r,e,{at:[-.2*r*I,.22*r,.04*r],rot:[0,-.5,0]})),x.push($.rbox(.165*r,.06*r,.075*r,.02*r,`#A86E44`,{at:[-.2*r*I,.27*r,.045*r],rot:[0,-.5,0]})),S.push($.box(.09*r,.05*r,.008*r,Mo,{at:[-.21*r*I,.31*r,.03*r],rot:[0,-.5,.15]})),S.push($.box(.022*r,.022*r,.004*r,`#FF6FAE`,{at:[-.185*r*I,.325*r,.04*r],rot:[0,-.5,.15]}))}if(t===`bun`){let e=`#F4F0F6`;C.push($.sphere(i,e,{at:[0,a+.4*i,-.12*i],scale:[1.08,.7,1.04]},26)),C.push($.sphere(.34*i,e,{at:[0,a+1.08*i,-.3*i]},18)),C.push($.capsule(.035*i,.62*i,`#FF6FAE`,{at:[.05*i,a+1.12*i,-.3*i],rot:[0,0,1.25]})),w.push($.sphere(.08*i,`#FF9CC8`,{at:[.4*i,a+1.23*i,-.3*i]}))}if(t===`pakama`){let e=.255*r,t=.166*r*I;for(let n=0;n<30;n++)x.push($.torus(t,.026*r,n%2?`#B9404A`:`#E0645A`,{at:[0,e,0],rot:[Math.PI/2,0,n/30*Math.PI*2],scale:[1,1,.75]},Math.PI*2/30+.004));S.push($.torus(t+.02*r,.005*r,`#FFE3C8`,{at:[0,e,0],rot:[Math.PI/2,0,0]}));let n=-.07*r*I,i=Math.sqrt(Math.max(0,t*t-n*n))*L[2]+.02*r;x.push($.sphere(.038*r,`#E0645A`,{at:[n,e,i],scale:[1.2,1,.8]}));for(let[t,a]of[.25,-.2].entries()){let o=[n+(t?.035:-.03)*r,e-.075*r,i-.005*r];x.push($.rbox(.05*r,.11*r,.016*r,.008*r,t?`#B9404A`:`#E0645A`,{at:o,rot:[-.12,0,a]})),S.push($.box(.052*r,.012*r,.004*r,`#FFE3C8`,{at:[o[0]+Math.sin(-a)*-.02*r,o[1]-.025*r,o[2]+.01*r],rot:[-.12,0,a]}))}}if(t===`moustache`)for(let e of[-1,1])C.push($.capsule(.08*i,.24*i,`#F4EFF4`,{at:[e*.18*i,a-.33*i,.95*i],rot:[0,0,e*1.15]}));if(t===`cap`&&(C.push($.sphere(1*i,`#8FC9F5`,{at:[0,a+.32*i,-.06*i],rot:[-.3,0,0],scale:[1.12,.72,1.06]})),C.push($.cyl(.5*i,.5*i,.06*i,`#6FB0E6`,{at:[0,a+.42*i,-1*i],rot:[.35,0,0],scale:[1,1,1.3]})),C.push($.box(.5*i,.08*i,.06*i,`#6FB0E6`,{at:[0,a+.5*i,.86*i],rot:[-.55,0,0]}))),t===`officer-cap`&&(C.push($.cyl(.66*i,.72*i,.3*i,`#3E4C8A`,{at:[0,a+.84*i,-.04*i],rot:[-.12,0,0]},24)),C.push($.cyl(.8*i,.72*i,.12*i,`#4A5A9C`,{at:[0,a+1.03*i,-.07*i],rot:[-.12,0,0]},24)),C.push($.cyl(.52*i,.52*i,.05*i,`#2B3566`,{at:[0,a+.72*i,.62*i],rot:[.3,0,0],scale:[1,1,.55]},20)),C.push($.sphere(.11*i,`#FFC83D`,{at:[0,a+.88*i,.66*i],scale:[1,1,.5]}))),t===`scarf`&&e.species===`beaver`?(x.push($.torus(.15*r,.032*r,`#FF8FB8`,{at:[0,.521*r,0],rot:[1.71,0,0],scale:[1,1.1,1]})),x.push($.rbox(.065*r,.14*r,.025*r,.012*r,`#FF8FB8`,{at:[.038*r,.443*r,.157*r],rot:[-.15,.15,-.16]}))):t===`scarf`&&(x.push($.torus(.255*r,.05*r,`#FF8FB8`,{at:[0,.54*r,.02*r],rot:[Math.PI/2,0,0]},Math.PI*2)),x.push($.rbox(.09*r,.24*r,.04*r,.015*r,`#FF8FB8`,{at:[.12*r,.42*r,.27*r],rot:[.25,0,-.15]}))),t===`bib`&&x.push($.sphere(.2*r,`#A8DCFF`,{at:[0,.48*r,.2*r],scale:[1.1,.55,.45]})),t===`phone`){let e=[0,.42*r,.25*r*L[2]],t=-2.3,n=[t,0,0],i=[0,-Math.sin(t),Math.cos(t)];re.push($.rbox(.13*r,.21*r,.022*r,.016*r,`#6B5BA8`,{at:e,rot:n})),ie.push($.rbox(.11*r,.18*r,.006*r,.012*r,`#BFE9FF`,{at:(t=>[e[0]+i[0]*t,e[1]+i[1]*t,e[2]+i[2]*t])(.012*r),rot:n}))}if(t===`cane`){let e=.017*r,t={x:-.065*r,y:-.125*r,z:.03*r},n=.04*r,i=[new J(t.x-n,-o[1],t.z)];for(let e=0;e<=16;e++){let r=Math.PI-e/16*Math.PI*1.12;i.push(new J(t.x+Math.cos(r)*n,t.y+Math.sin(r)*n,t.z))}let a=new g;for(let e=1;e<i.length;e++)a.add(new Ve(i[e-1],i[e]));N.L.push(xa(new q(a,64,e,10,!1),`#B07A4A`,{},!0));let s=i[i.length-1];N.L.push($.sphere(e,`#B07A4A`,{at:[s.x,s.y,s.z]},12)),N.L.push($.cyl(e*1.15,e*1.25,.03*r,`#4A3F4F`,{at:[i[0].x,i[0].y+.012*r,i[0].z]}))}if(Lo(t)){let r=Bo(t,n,e);C.push(...r.head),w.push(...r.headPlain),x.push(...r.body),S.push(...r.bodyPlain),N.L.push(...r.armL),N.R.push(...r.armR)}}let oe=new V,se=new V,H=new V;H.position.y=R;let ce=new V,le=new V;ce.position.set(-o[0],o[1],o[2]),le.position.set(o[0],o[1],o[2]),oe.add(Aa((h?.3:.2*I)*r*1.3,t),se),se.add(Da(x,S,t,m),H,ce,le);let ue=re.length?Da(re,ie,t,m):null;ue&&se.add(ue),H.add(Da(C,w,t,m));let U=new V;U.position.y=a+c;for(let e of[...T,...E])e.translate(0,-(a+c),0);U.add(Da(T,E,t,m));let de=new V,W=new V;for(let e of[de,W])e.position.set(...A);D.length&&de.add(Da([],D,t,0)),W.add(Da([],[$.sphere(.17*i,ko,{scale:[1.1,.9,.35]}),$.sphere(.09*i,Ao,{at:[0,-.06*i,.03*i],scale:[1.3,.6,.5]})],t,0)),W.scale.setScalar(.001),W.visible=!1,e.species===`moose`&&(de.rotation.x=W.rotation.x=.36),H.add(U,de,W);let fe;if(O.length){H.add(...O);let e=O[0].position.y;fe=t=>{let n=Math.sqrt(t);de.scale.set(1-.08*t,.86+.38*t,1);for(let t=0;t<O.length;t++){let r=t===0?-1:1,a=Math.min(1,Math.abs((t===0?ce:le).rotation.z)/2.3),o=n*(t===0?.022:.016)+a*.04;O[t].position.y=e+o*i,O[t].position.z=d(r*s,.39*i+o*i,.035*i)[2],O[t].rotation.z=r*(-.04*n-.08*a)}}}let pe;if(M){let e=Jo(j,M,t,m),n=new V;n.position.set(...M);for(let e of[...ee,...te])e.translate(-M[0],-M[1],-M[2]);n.add(Da(ee,te,t,m)),H.add(e,n),pe={top:e,bottom:n,k:0,open(t){this.k=t,e.rotation.x=-.28*t,n.rotation.x=.5*t}}}let G=null;k.length&&(G=Jo(k,e.species===`pony`?[0,a+.6*i,0]:[0,a+.5*i,-.6*i],t,m),H.add(G)),ce.add(Da(N.L,[],t,m)),le.add(Da(N.R,[],t,m));let me=null;return P.length&&(me=Jo(P,e.species===`unicorn`?[0,.29*r,-.15*r]:F,t,m,ne),se.add(me)),{root:oe,body:se,head:H,eyes:U,mouth:de,talk:W,expression:fe,open:(!!e.open||e.smile===`teeth`)&&D.length>0,beak:pe,armL:ce,armR:le,tail:me,mane:G,height:r,radius:h?.3*r:.16*r*I,phone:ue,face:{R:i,headY:a,mouth:A}}}function Ko(e,t,n,r,i,a){let o=new me().compose(new J(...t),new D().setFromEuler(new re(...n)),new J(1,1,1)),s=(e,t,n)=>{let r=new J(e,t,n).applyMatrix4(o);return[r.x,r.y,r.z]},c=a*1.3;for(let t of[0,1]){let i=c+2.4+t*1.6;e.push($.sphere(r*.75,`#5FBF8A`,{at:s(Math.cos(i)*r*1.2,Math.sin(i)*r*1.2,.001),rot:[n[0],n[1],i],scale:[1.6,.6,.25]}))}for(let t=0;t<5;t++){let a=c+t/5*Math.PI*2;e.push($.sphere(r*.62,i,{at:s(Math.cos(a)*r*.62,Math.sin(a)*r*.62,.003),rot:n,scale:[1,1,.3]}))}e.push($.sphere(r*.3,`#FFE9A8`,{at:s(0,0,.006),rot:n,scale:[1,1,.3]}))}function qo(e,t,n){let{R:r,headY:i}=t,a=e.color;if(e.style===`long`)n.push(bo(a,t));else{n.push($.sphere(.92*r,a,{at:[0,i+.36*r,-.08*r],scale:[1.05,.68,1.06]},48));for(let[e,t,o,s]of[[0,.25,0,.35],[-.3,.3,-.35,.45],[.3,.3,.35,.45],[-.16,-.1,-.15,.05],[.16,-.1,.15,.05],[-.42,-.25,-.55,-.2],[.42,-.25,.55,-.2],[0,-.45,0,-.45],[-.12,.55,-.2,.9],[.14,.56,.25,.95]]){let c=Math.sqrt(Math.max(0,1-e*e-(t+.08)**2))*.68+.36;n.push($.cone(.17*r,.42*r,a,{at:[e*r,i+(c+.06)*r,t*r],rot:[s,0,-o]}))}}}function Jo(e,t,n,r,i=[]){let a=new V;a.position.set(...t);for(let n of[...e,...i])n.translate(-t[0],-t[1],-t[2]);return a.add(Da(e,i,n,r)),a}var Yo=class{rig;nextBlink=.8+Math.random()*3;blink=-1;level=0;voices;constructor(e,t){this.rig=e,this.voices=t===void 0?[]:typeof t==`string`?[t]:t}update(e){let{eyes:t,mouth:n,talk:r,open:a}=this.rig;this.nextBlink-=e,this.nextBlink<=0&&(this.blink=0,this.nextBlink=Math.random()<.2?.25:2.2+Math.random()*3.5);let o=1;this.blink>=0&&(this.blink+=e/.16,o=1-.9*l(Math.min(1,this.blink)),this.blink>=1&&(this.blink=-1)),this.rig.blink?this.rig.blink(o):t.scale.y=o;let s=0;for(let e of this.voices)s=Math.max(s,i(e));this.level+=(s-this.level)*(1-Math.exp(-e*(s>this.level?30:14)));let c=this.level;if(this.rig.beak)this.rig.beak.open(c);else if(this.rig.expression)this.rig.expression(c);else if(a)n.scale.set(1+.15*c,1+.9*c,1);else{let e=c>.04;r.visible=e,n.visible=!e,e&&r.scale.set(.55+.45*c,Math.min(1,.25+c),1)}}},Xo=`#2B2330`;function Zo(e){let t=new ke;e.eyes.traverse(e=>{let n=e.geometry;n&&(n.computeBoundingBox(),n.boundingBox&&t.union(n.boundingBox))});let n=(t.max.y-t.min.y)/2;return{size:n,x:Math.max(n*.9,t.max.x-n*.78),z:t.max.z}}function Qo(e,t,n,r,i,a=1){let{size:o,x:s,z:c}=e,l=o*Math.max(.02,.47*n-.46);return{white:$.sphere(o*1.12*n,`#FFFFFF`,{at:[t*s,0,c-o*.42],scale:[.86,1,.42]}),dark:[$.sphere(o*.46*a,Xo,{at:[t*s+r*o,i*o,c+l],scale:[1,1,.35]},12),$.sphere(o*.14*Math.max(.5,a),`#FFFFFF`,{at:[t*s+(r-.06)*o,(i+.12)*o,c+l+o*.14]},8)]}}function $o(e,t,n){let r=Zo(t),{size:i,x:a,z:o}=r,s=new V,c=[],l=(e,t,r=[],i=[])=>s.add(Da([e.white,t.white,...i],[...e.dark,...t.dark,...r],n,2)),u=t.face.mouth,d=()=>$.sphere(i*.5,`#FF7FA5`,{at:[u[0]-t.eyes.position.x,u[1]-t.eyes.position.y-i*.55,u[2]-t.eyes.position.z+i*.25],scale:[.8,1.15,.45]},10);if(e===`crossed`)l(Qo(r,-1,1,.44,-.3),Qo(r,1,1,-.44,-.3));else if(e===`soaked`){let e=[-1.5,.2,1.6].map((e,t)=>$.sphere(i*.2,`#8FD3F7`,{at:[e*a*.8,i*(1.5-t*.22),o-i*.3],scale:[.75,1.3,.75]},8));l(Qo(r,-1,1.05,-.4,.38,.8),Qo(r,1,1.05,-.3,-.42,.8),e,[d()])}else if(e===`dazzled`)l(Qo(r,-1,1.38,0,.04,.66),Qo(r,1,1.38,0,.04,.66));else if(e===`dizzy`){let e=[-1,1].map(e=>$.sphere(i*1.2,`#FFFFFF`,{at:[e*a,0,o-i*.42],scale:[.86,1,.42]}));s.add(Da(e,[d()],n,2));for(let e of[-1,1]){let t=Da([],[$.torus(i*.62,i*.09,Xo,{},Math.PI*1.55),$.torus(i*.3,i*.09,Xo,{rot:[0,0,2.2]},Math.PI*1.6),$.sphere(i*.1,Xo,{scale:[1,1,.4]},8)],n,2);t.position.set(e*a,0,o+i*.06),t.scale.set(.86,1,1),s.add(t),c.push(t)}}else{let e=Qo(r,-1,1.15,.1,.1,.9),t=$.torus(i*.55,i*.1,Xo,{at:[a,-i*.2,o],rot:[0,0,0]},Math.PI),c=[$.sphere(i*.62,`#FFE3F0`,{at:[a*1.25,i*1.1,o-i*.2]},10),$.sphere(i*.46,`#FFFFFF`,{at:[a*.7,i*1.3,o-i*.1]},10),$.sphere(i*.38,`#FFD0E4`,{at:[a*1.7,i*.7,o-i*.3]},10)];s.add(Da([e.white,...c],[...e.dark,t],n,2))}return s.position.copy(t.eyes.position),s.visible=!1,t.eyes.parent?.add(s),{root:s,spin:c}}function es(e,t){let n=new Map,r=null;return{show(i){if(i!==r){if(r&&(n.get(r).root.visible=!1),r=i,i){let r=n.get(i);r||n.set(i,r=$o(i,e,t)),r.root.visible=!0}e.eyes.visible=!i}},get face(){return r},update(e){if(r===`dizzy`)for(let t of n.get(`dizzy`).spin)t.rotation.z-=e*7}}}function ts(e,t){let n=es(e,t);return{on(e){n.show(e?`crossed`:null)},get crossed(){return n.face===`crossed`}}}var ns=`
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,rs=`
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
`,is=class{mesh;mat;constructor(e,t){this.mat=t.add(new h({uniforms:{uDeep:{value:new Y(e.deep)},uShallow:{value:new Y(e.shallow)},uDash:{value:new Y(`#FFFFFF`)},uHaze:{value:new Y(e.haze)},uTime:{value:0},uHazeNear:{value:e.hazeNear},uHazeFar:{value:e.hazeFar},uAlpha:{value:e.opacity??1}},vertexShader:ns,fragmentShader:rs,transparent:(e.opacity??1)<1})),this.mesh=new $e(t.add(new nt(e.size,e.size)),this.mat),this.mesh.rotation.x=-Math.PI/2}update(e){this.mat.uniforms.uTime.value=e}set opacity(e){this.mat.uniforms.uAlpha.value=e}setColors(e,t,n){let r=this.mat.uniforms;r.uDeep.value.set(e),r.uShallow.value.set(t),r.uHaze.value.set(n)}};function as(e,t,n){return .05*Math.sin(e*.21+n*1.3)+.04*Math.sin(t*.17-n*1.1)+.02*Math.sin((e-t)*.5+n*2.1)}export{ha as A,Ki as B,Sa as C,_a as D,va as E,Xi as F,Ti as G,Hi as H,$i as I,Di as K,na as L,ca as M,fa as N,ga as O,ia as P,ta as R,ya as S,Da as T,Ri as U,Yi as V,Fi as W,xa as _,es as a,wa as b,Ho as c,Uo as d,Wo as f,$ as g,Ra as h,ts as i,ua as j,la as k,Go as l,Ha as m,as as n,Ro as o,Eo as p,Q as q,Yo as r,zo as s,is as t,Vo as u,Aa as v,Ea as w,Oa as x,Ca as y,Qi as z};
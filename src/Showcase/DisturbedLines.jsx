// DisturbedLines3D.jsx
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

const vertexShader = /* glsl */ `
  precision highp float;

  // controls
  uniform float u_time;
  uniform float u_sinkDepth;
  uniform float u_bumpHeight;
  uniform float u_sinkRadius;
  uniform vec2 u_mouseLocal; // mouse in local mesh coordinates (same space as position.xy)

  varying vec2 vUv;
  varying vec3 vPosition; // displaced position in model space

  // simple fbm
  float hash21(vec2 p){
    p = fract(p*vec2(123.34, 345.45));
    p += dot(p,p+34.345);
    return fract(p.x*p.y);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float s = 0.0;
    float amp = 0.5;
    for(int i=0;i<5;i++){
      s += amp * noise(p);
      p = p*2.0 + 13.37;
      amp *= 0.5;
    }
    return s;
  }

  void main(){
    vUv = uv;

    // position.xy is in local plane space; we assume plane geometry width/height map centered at 0
    vec3 pos = position;

    // compute local radial distance to mouse in local plane coordinates
    vec2 d = pos.xy - u_mouseLocal;
    float r = length(d);

    // sink: strong negative displacement (hole) + little central bump
    // Use u_sinkRadius to control the size of the sinkhole
    float sink = -u_sinkDepth * exp(-pow(r * u_sinkRadius, 2.0));
    float bump = u_bumpHeight * exp(-pow(r * 3.5, 2.0));

    // small layered ripples + fbm for subtle surface noise
    float ripples = 0.12 * sin(r * 12.0 - u_time * 2.0) * exp(-r * 3.0);
    float micro = 0.08 * fbm(pos.xy * 3.0 + u_time * 0.2);

    // final displacement applied to Z
    pos.z += sink + bump + ripples + micro;

    vPosition = pos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;

  // pattern & shading controls
  uniform float u_lineFreq;
  uniform float u_thickness;
  uniform float u_warpAmp;
  uniform float u_rippleAmp;
  uniform float u_rippleFreq;
  uniform float u_flowSpeed;
  uniform float u_sinkRadius;
  uniform float u_voidThreshold;
  uniform vec2 u_mouseLocal;

  varying vec2 vUv;
  varying vec3 vPosition; // displaced position from vertex shader

  // ---- noise / fbm (same as vertex) ----
  float hash21(vec2 p){
    p = fract(p*vec2(123.34, 345.45));
    p += dot(p,p+34.345);
    return fract(p.x*p.y);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float s = 0.0;
    float amp = 0.5;
    for(int i=0;i<5;i++){
      s += amp * noise(p);
      p = p*2.0 + 13.37;
      amp *= 0.5;
    }
    return s;
  }

  // anti-aliased step
  float aastep(float t, float v){
    float afwidth = fwidth(v)*0.6;
    return smoothstep(t - afwidth, t + afwidth, v);
  }

  void main(){
    // Use UV coordinates for line pattern to avoid seam lines
    vec2 coords = vUv;
    float t = u_time;

    // domain warp for organic wiggle
    float warp =
      0.6 * fbm(coords*1.2 + vec2(0.0, t*0.08)) +
      0.25 * fbm(coords*3.6 + vec2(t*0.03, -t*0.06));

    // pull-lines effect (make stripes flow inward) using radial component
    vec2 center = vec2(0.0, 0.0);
    vec2 d = coords - center;
    float r = length(d);
    vec2 radialDir = normalize(max(vec2(0.0001), d));
    // compute a small inward bias based on inverted r: near center stronger
    float pull = exp(-r * 2.0) * 1.6;

    // final phase: combine base (y) + warp + radial pull + animated flow
    float base = coords.y;
    float phase = base + u_warpAmp * warp - dot(radialDir, vec2(1.0, 0.0)) * pull + t * u_flowSpeed;

    // crisp stripe pattern
    float s = sin(phase * 3.14159 * u_lineFreq);
    float line = 1.0 - aastep(u_thickness, abs(s));

    // subtle vertical streaks near deep hole: use vPosition.z to create streak mask
    float depthMask = smoothstep(-0.1, -1.5, vPosition.z) ; // more negative = deeper
    // create small random breaks along verticals using noise
    float verticalBreak = step(0.6, fract(fbm(vPosition.xy * 30.0 + t * 0.5)));

    // combine: lines darkened by shading and depth mask
    vec3 lineColor = vec3(0.0);
    vec3 bgColor = vec3(1.0);

    // inside deep area, make lines more dense and streaky:
    float streakInfluence = depthMask * (1.0 - step(0.5, abs(s))) * verticalBreak;
   
    float finalLine = max(line, streakInfluence); 
    vec3 col = mix(bgColor, lineColor, finalLine);

    // Calculate distance to mouse for void effect
    vec2 d_mouse = vPosition.xy - u_mouseLocal;
    float r_mouse = length(d_mouse);
    
    // Create void effect - pure black when sinkhole gets deep enough
    float voidMask = smoothstep(u_voidThreshold, 0.0, vPosition.z);
    col -= mix(col, vec3(0.0), voidMask);

    // slight vignette by depth to help the hole read
    float vign = smoothstep(0.0, 0.8, length(vPosition.xy) * 0.8);
    col *= mix(1.0, 0.8, vign * 0.35);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function DisturbedLinesMesh() {
  const meshRef = useRef();
  const matRef = useRef();
  const { size, viewport, camera, pointer } = useThree();

  // Leva controls
  const controls = useControls("Disturbed Lines 3D", {
    lineFreq: { value: 100, min: 20, max: 150, step: 1 },
    thickness: { value: 0.35, min: 0.01, max: 0.8, step: 0.01 },
    warpAmp: { value: 0.5, min: 0, max: 2.0, step: 0.01 },
    sinkDepth: { value: 3.0, min: 0.0, max: 6.0, step: 0.05 },
    sinkRadius: { value: 3.0, min: 0.1, max: 5.0, step: 0.01 },
    bumpHeight: { value: 0.0, min: 0.0, max: 3.0, step: 0.01 },
    rippleAmp: { value: 0.0, min: 0, max: 0.1, step: 0.001 },
    rippleFreq: { value: 0.0, min: 0.1, max: 5, step: 0.1 },
    flowSpeed: { value: 0.01, min: 0, max: 0.2, step: 0.001 },
    mouseLerp: { value: 0.05, min: 0.01, max: 0.3, step: 0.01 },
    voidThreshold: { value: -1.5, min: -5.0, max: 0.0, step: 0.1 },
    subdivisions: { value: 512, min: 8, max: 512, step: 2 },
    tiltDeg: { value: 45, min: 0, max: 70, step: 1 },
  });

  // Geometry created in useMemo but without controls dependency to prevent freezing
  const geometry = useMemo(() => {
    // create plane with many segments so displacement looks smooth
    // Make it much larger to accommodate the depression without showing edges
    const width = viewport.width * 3;
    const height = viewport.height * 3;
    const seg = Math.max(8, Math.floor(controls.subdivisions));
    return new THREE.PlaneGeometry(width, height, seg, seg);
  }, [viewport.width, viewport.height]); // Removed controls.subdivisions dependency

  // Uniforms created without controls dependency to prevent freezing
  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },

    // parameters - will be updated in useFrame
    u_lineFreq: { value: 20 },
    u_thickness: { value: 0.25 },
    u_warpAmp: { value: 0.1 },
    u_sinkDepth: { value: 3.0 },
    u_sinkRadius: { value: 3.0 },
    u_bumpHeight: { value: 0.0 },
    u_rippleAmp: { value: 0.0 },
    u_rippleFreq: { value: 0.0 },
    u_flowSpeed: { value: 0.05 },
    u_voidThreshold: { value: -1.5 },

    // mouse in local mesh coords (we will set this from raycast)
    u_mouseLocal: { value: new THREE.Vector2(0, 0) },
  }), [size]); // Removed controls dependency

  // frame update
  useFrame((state, dt) => {
    // time
    uniforms.u_time.value += dt;
    uniforms.u_resolution.value.set(size.width, size.height);

    // update uniforms from Leva controls in real-time
    uniforms.u_lineFreq.value = controls.lineFreq;
    uniforms.u_thickness.value = controls.thickness;
    uniforms.u_warpAmp.value = controls.warpAmp;
    uniforms.u_sinkDepth.value = controls.sinkDepth;
    uniforms.u_sinkRadius.value = controls.sinkRadius;
    uniforms.u_bumpHeight.value = controls.bumpHeight;
    uniforms.u_rippleAmp.value = controls.rippleAmp;
    uniforms.u_rippleFreq.value = controls.rippleFreq;
    uniforms.u_flowSpeed.value = controls.flowSpeed;
    uniforms.u_voidThreshold.value = controls.voidThreshold;

    // RAYCAST: pointer is already NDC (-1..1)
    if (!meshRef.current) return;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2(pointer.x, pointer.y);
    raycaster.setFromCamera(ndc, camera);
    const intersects = raycaster.intersectObject(meshRef.current, false);

    if (intersects.length > 0) {
      const hit = intersects[0].point.clone();
      // convert world point to local mesh space
      meshRef.current.worldToLocal(hit);
      // hit is now in local coordinates: plane centered at (0,0)
      // convert to "local" UV-space where (0,0) at center -> keep local coords
      // We'll pass local coords directly (same space as position.xyz in shader)
      const mx = hit.x;
      const my = hit.y;
      // smooth lerp previous mouse towards new point
      const cur = uniforms.u_mouseLocal.value;
      cur.lerp(new THREE.Vector2(mx, my), controls.mouseLerp);
      uniforms.u_mouseLocal.value.copy(cur);
    } else {
      // optional: push mouse far out so hole fades when off-plane
      // lerp toward far away point
      const cur = uniforms.u_mouseLocal.value;
      cur.lerp(new THREE.Vector2(1000, 1000), 0.08);
      uniforms.u_mouseLocal.value.copy(cur);
    }
  });

  // rotate the mesh to a tilt so camera sees it from side
  const tiltRad = (controls.tiltDeg * Math.PI) / 180;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-tiltRad, 0, 0]} // tilt around X (look-from side)
      // position={[0, -0.25 * viewport.height, 0]} // move slightly to compose frame
    >
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function DisturbedLines() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
      {/* ambient to lift whites slightly */}
      <ambientLight intensity={0.6} />
      <DisturbedLinesMesh />
      <OrbitControls enablePan={true} enableRotate={false} enableZoom={true} />
    </Canvas>
  );
}

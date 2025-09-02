import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Line, ContactShadows, Environment, SoftShadows,  useGLTF, useAnimations, Shadow  } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo, useEffect } from "react";
import { EffectComposer, TiltShift2 } from "@react-three/postprocessing";
import { Perf } from "r3f-perf";

function ClockFace({ margin = 0.5 }) {
  const { viewport } = useThree();
  // Dynamic radius: fit width with margin
//   const radius = Math.min(viewport.width, viewport.height) / 2 - margin;
  const radius = 5;
  const numeralRadius = radius * 1.15;

  const numerals = useMemo(() => ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"], []);

  return (
    <group rotation={[-Math.PI, 0, 0]}>
      {/* 12 radial lines */}
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x = Math.sin(a) * radius;
        const z = Math.cos(a) * radius;
        return (
          <Line
            key={`tick-${i}`}
            points={[
              [0, 0.001, 0],
              [x, 0.001, z],
            ]}
            color={"#555"}
            lineWidth={1.5}
          />
        );
      })}

      {/* Roman numerals */}
      {numerals.map((t, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x = Math.sin(a) * numeralRadius;
        const z = Math.cos(a) * numeralRadius;
        return (
          <Text position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]} fontSize={0.6} font='http://fonts.gstatic.com/s/oldstandardtt/v7/QQT_AUSp4AV4dpJfIN7U5PWrQzeMtsHf8QsWQ2cZg3c.ttf' color='#333' anchorX='center' anchorY='middle'>
            {t}
          </Text>
        );
      })}
    </group>
  );
}

export function Model(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/Model/stand.glb')
  const { actions } = useAnimations(animations, group)
  
  useEffect(() => {
    // Play standUp animation first
    actions.standUp.reset().play()
    
    // Get the duration of standUp animation for dynamic timeout
    const standUpDuration = actions.standUp.getClip().duration * 1000 // Convert to milliseconds
    
    // After standUp animation duration, crossfade to idle
    const timer = setTimeout(() => {
      actions.idle.reset().setLoop(THREE.LoopRepeat, Infinity).play()
      actions.standUp.crossFadeTo(actions.idle, 0.5)
    }, standUpDuration-1000)
    
    // Cleanup
    return () => {
      clearTimeout(timer)
      actions.standUp.fadeOut(0.5)
      actions.idle.fadeOut(0.5)
    }
  }, [actions])
  
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <primitive object={nodes.mixamorig7Hips} />
        </group>
        <skinnedMesh
        // castShadow
          name="Ch08_Beard"
          geometry={nodes.Ch08_Beard.geometry}
          material={materials['Ch08_hair.001']}
          skeleton={nodes.Ch08_Beard.skeleton}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
        <skinnedMesh
        castShadow
          name="Ch08_Body"
          geometry={nodes.Ch08_Body.geometry}
          material={materials['Ch08_body.001']}
          skeleton={nodes.Ch08_Body.skeleton}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
        <skinnedMesh
        // castShadow
          name="Ch08_Eyelashes"
          geometry={nodes.Ch08_Eyelashes.geometry}
          material={materials['Ch08_hair.001']}
          skeleton={nodes.Ch08_Eyelashes.skeleton}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
        <skinnedMesh
        // castShadow
          name="Ch08_Hair"
          geometry={nodes.Ch08_Hair.geometry}
          material={materials['Ch08_hair.001']}
          skeleton={nodes.Ch08_Hair.skeleton}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
        <skinnedMesh
        castShadow
          name="Ch08_Hoodie"
          geometry={nodes.Ch08_Hoodie.geometry}
          material={materials['Ch08_body1.001']}
          skeleton={nodes.Ch08_Hoodie.skeleton}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
        <skinnedMesh
        castShadow
          name="Ch08_Pants"
          geometry={nodes.Ch08_Pants.geometry}
          material={materials['Ch08_body1.001']}
          skeleton={nodes.Ch08_Pants.skeleton}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
        <skinnedMesh
        // castShadow
          name="Ch08_Sneakers"
          geometry={nodes.Ch08_Sneakers.geometry}
          material={materials['Ch08_body1.001']}
          skeleton={nodes.Ch08_Sneakers.skeleton}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
      </group>
    </group>
  )
}

function ClockHands() {
  const hourLight = useRef();
  const minuteLight = useRef();
  const secondLight = useRef();

  useFrame(() => {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;

    // Smooth, continuous angles (radians)
    const hourAngle = ((h + m / 60 + s / 3600) / 12) * -Math.PI * 2;
    const minuteAngle = ((m + s / 60) / 60) * -Math.PI * 2;
    const secondAngle = (s / 60) * -Math.PI * 2;

    const radius = 14;

    // Main "sun" — long, cinematic shadow
    if (hourLight.current) {
      hourLight.current.position.set(
        Math.sin(hourAngle) * radius,
        5.5, // lower = longer shadow
        Math.cos(hourAngle) * radius
      );
      hourLight.current.target.position.set(0, 0, 0);
      hourLight.current.target.updateMatrixWorld();
    }

    // Minute light — slightly higher = shorter shadow
    if (minuteLight.current) {
      minuteLight.current.position.set(Math.sin(minuteAngle) * radius, 8, Math.cos(minuteAngle) * radius);
      minuteLight.current.target.position.set(0, 0, 0);
      minuteLight.current.target.updateMatrixWorld();
    }

    // Second light — highest = shortest shadow, updates every frame
    if (secondLight.current) {
      secondLight.current.position.set(Math.sin(secondAngle) * radius, 12, Math.cos(secondAngle) * radius);
      secondLight.current.target.position.set(0, 0, 0);
      secondLight.current.target.updateMatrixWorld();
    }
  });

  return (
    <group position={[0, 0, -0.5]}>
      {/* Ground — subtle warm off-white with micro-roughness */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[80, 80]} />
        {/* <shadowMaterial transparent opacity={0.75} /> */}
        <meshStandardMaterial 
          color="#d7e9fa" 
          roughness={0.75}
          metalness={0.35}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Printed clock face */}
      <ClockFace />

      {/* The gnomon (shadow caster) */}
      <group position={[0, 0, 0]}>
        <mesh receiveShadow castShadow position={[0, -0.01, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.05, 48]} />
          <meshStandardMaterial color='#e7e9ec' roughness={0.95} />
        </mesh>
        <Model />
      </group>

      {/* Directional lights as "hands" */}
      <directionalLight
        ref={hourLight}
        castShadow
        intensity={1.5}
        color={"#ffd9b0"} // warm, sun-like
        // shadow-mapSize-width={2048}
        // shadow-mapSize-height={2048}
        // shadow-bias={-0.0001}
      />
      
      <directionalLight
        ref={minuteLight}
        castShadow
        intensity={0.6}
        color={"#bedfff"} // cooler tint
        // shadow-mapSize-width={2048}
        // shadow-mapSize-height={2048}
        // shadow-bias={-0.0001}

      />

      <directionalLight
        ref={secondLight}
        castShadow
        intensity={0.45}
        color={"#ffb9b9"} // subtle warm/red tint
        // shadow-mapSize-width={2048}
        // shadow-mapSize-height={2048}
        // shadow-bias={-0.0001}
      />

    </group>
  );
}


useGLTF.preload('/Model/stand.glb')


export default function Sundial() {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows
    orthographic
      camera={{ position: [-7, 7, 9], fov: 40, near: 0.1, far: 100, zoom: 100 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
        {/* Performance Monitor */}
      <Perf position="top-left" minimal={false} />

      <color attach='background' args={["#e9ecef"]} />
      {/* <fog attach='fog' args={["#edf0f3", 0, 100]} /> */}
      <Environment preset='night' background={false} blur={0.19} environmentIntensity={3.5} backgroundIntensity={3.5} backgroundBlurriness={0} />
      

      {/* <SoftShadows size={24} samples={64} focus={0.9} /> */}

      <ClockHands />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      {/* <OrbitControls minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 3} /> */}
    </Canvas>
  );
}

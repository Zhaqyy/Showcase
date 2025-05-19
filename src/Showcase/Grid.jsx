import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { gsap } from "gsap";
// import { Perf } from "r3f-perf";
import { easing } from "maath";

function DynamicGrid() {
  const meshRef = useRef();
  const materialRef = useRef();
  const transmissionMaterialRef = useRef();
  const { viewport, camera, pointer } = useThree();

  const cubeSize = 0.4;
  const spacingFactor = 4;
  const fullSize = -(cubeSize * spacingFactor) / 2;

  const cubesX = Math.ceil(viewport.width / (cubeSize * spacingFactor));
  const cubesY = Math.ceil(viewport.height / (cubeSize * spacingFactor));
  const instanceCount = cubesX * cubesY;

  const proximityRadius = 5; // Adjusted for better control
  const maxScale = 2; // Maximum scale for the cubes
  const minScale = 1.0; // Minimum scale for the cubes

  // Utility Functions
  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  };

  const map = (value, start1, stop1, start2, stop2) => {
    return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  };

  function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  // Define the material using MeshPhysicalMaterial
  // const material = useMemo(
  //   () =>
  //     new THREE.MeshPhysicalMaterial({
  //       color: 0xffffff,
  //       thickness: 1.0,
  //       reflectivity: 0.25,
  //       roughness: 0.0,
  //       clearcoat: 0.1,
  //       transmission: 1.0,
  //       ior: 1.5,
  //       iridescence: 1,
  //       iridescenceIOR: 1.3,
  //     }),
  //   []
  // );

  // const material = Object.assign(new MeshTransmissionMaterial(10), {
  //   clearcoat: 1,
  //   clearcoatRoughness: 0,
  //   transmission: 1,
  //   chromaticAberration: 2,
  //   // anisotrophy: 0.1,
  //   // backsideThickness: 0.15,
  //   // backside:true,
  //   // Set to > 0 for diffuse roughness
  //   roughness: 0,
  //   thickness: 0.95,
  //   ior: 1.25,
  //   // Set to > 0 for animation
  //   distortion: 1.95,
  //   distortionScale: 0.95,
  //   temporalDistortion: 0.95
  // })

  // Update the grid layout
  useEffect(() => {
    const mesh = meshRef.current;
    let index = 0;

    for (let i = 0; i < cubesX; i++) {
      for (let j = 0; j < cubesY; j++) {
        const id = index++;

        const position = new THREE.Vector3(
          i * cubeSize * spacingFactor - viewport.width / 2 + (cubeSize * spacingFactor) / 2,
          j * cubeSize * spacingFactor - viewport.height / 2 + (cubeSize * spacingFactor) / 2,
          0
        );

        mesh.setMatrixAt(id, new THREE.Matrix4().makeTranslation(position.x, position.y, position.z));
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [cubesX, cubesY, viewport.width, viewport.height]);

  // for useframe
  const mesh = meshRef.current;

  const color = new THREE.Color(0xffffff); // Default color
  const targetColor = new THREE.Color(0xffffff); // Initial target color

  const colorArray = new Float32Array(instanceCount * 3); // 3 for RGB
  const colorAttribute = new THREE.InstancedBufferAttribute(colorArray, 3);
  if (mesh) {
    mesh.instanceColor = colorAttribute;
    mesh.geometry.setAttribute("color", colorAttribute);
  }

  // Store the mouse position
  const mouseRef = useRef(new THREE.Vector3(0, 0, 0));
  const pointLightRef = useRef();

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 0]);

    const x = (pointer.x * width) / 2;
    const y = (pointer.y * height) / 2;

// Smoothly move the light using lerp
pointLightRef.current.position.lerp(new THREE.Vector3(x, y, 0), 0.1);

    // Smooth the mouse position using damping
    const mousePosition = new THREE.Vector3(
      THREE.MathUtils.damp(mouseRef.current.x, x, 5, delta),
      THREE.MathUtils.damp(mouseRef.current.y, y, 4, delta),
      0
    );

    // Store the last mouse position for the next frame
    mouseRef.current.copy(mousePosition);

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();

    for (let i = 0; i < instanceCount; i++) {
      mesh.getMatrixAt(i, matrix);
      position.setFromMatrixPosition(matrix);

      // Calculate 2D distance from mouse to grid element
      const mouseDistance = distance(position.x, position.y, mousePosition.x, mousePosition.y);

      // Calculate distance from the center to determine max scale
      const distanceFromCenter = position.distanceTo(mousePosition);
      const maxCenterScale = map(distanceFromCenter, 0, proximityRadius, maxScale, minScale);

      // Map distance to scale range
      const targetScale = mouseDistance < proximityRadius ? maxCenterScale : minScale;

      // Get current scale, and apply easing.damp3 for smooth transition
      matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);

      easing.damp3(scale, new THREE.Vector3(targetScale, targetScale, targetScale), delta, 0.01); // Smooth transition for scaling

      // Apply bounce effect when leaving proximity using a spring effect manually
      // if (targetScale === minScale && scale.x > minScale) {
      //   scale.set(
      //     Math.max(scale.x * 1.1, minScale), // More pronounced bounce down
      //     Math.max(scale.y * 1.1, minScale),
      //     Math.max(scale.z * 1.1, minScale)
      //   );
      // }
      // Apply new scale to matrix
      matrix.compose(position, new THREE.Quaternion(), scale);
      mesh.setMatrixAt(i, matrix);

      // Update material properties for items within proximity
      const mat = mesh.material;
      // console.log(mat);
      // if (mouseDistance < proximityRadius) {
      //   mat.color = new THREE.Color(0xe68989)
      //   // easing.dampC(mat.color, new THREE.Color(0xe68989), delta, 0.001); // Smooth color change
      //   // easing.dampC(ref.current.material.color, store.open ? '#f0f0f0' : '#ccc', 0.1, delta)
      //   mat.thickness =THREE.MathUtils.damp(mat.thickness, 5, 0.001, delta);
      //   // mat.reflectivity =THREE.MathUtils.damp(mat.reflectivity, 0.5, delta, 0.001);
      //   // mat.roughness =THREE.MathUtils.damp(mat.roughness, 0.1, delta, 0.001);
      //   // mat.clearcoat =THREE.MathUtils.damp(mat.clearcoat, 0.1, delta, 0.001);
      //   // mat.transmission =THREE.MathUtils.damp(mat.transmission, 1.0, delta, 0.001);
      //   // mat.ior =THREE.MathUtils.damp(mat.ior, 2.1, delta, 0.001);
      //   mat.needsUpdate = true;
      // } else {
      //   // Reset material properties when leaving proximity
      //   // easing.dampC(mat.color, new THREE.Color(0xffffff), delta, 0.001); // Smooth color reset
      //   // mat.thickness = THREE.MathUtils.damp(mat.thickness, 1, delta, 0.001);
      //   // mat.reflectivity = THREE.MathUtils.damp(mat.reflectivity, 0.5, delta, 0.001);
      //   // mat.roughness = THREE.MathUtils.damp(mat.roughness, 0.5, delta, 0.001);
      //   // mat.clearcoat = THREE.MathUtils.damp(mat.clearcoat, 0.1, delta, 0.001);
      //   // mat.transmission = THREE.MathUtils.damp(mat.transmission, 0.0, delta, 0.001);
      //   // mat.ior = THREE.MathUtils.damp(mat.ior, 1.5, delta, 0.001);
      //   mat.needsUpdate = true;
      // }

      // Change color only for items within proximity
      // if (mouseDistance < proximityRadius) {
      //   // Change color for this specific instance
      //   const instanceColor = new THREE.Color(0xe68989);
      //   mat.color.set(instanceColor);
      //   mat.needsUpdate = true; // Ensure material is updated
      // } else {
      //   // Reset color for this specific instance (optional)
      //   const defaultColor = new THREE.Color(0xffffff);
      //   mat.color.set(defaultColor);
      //   mat.needsUpdate = true; // Ensure material is updated
      // }
      // Update color based on proximity
      // const color = mouseDistance < proximityRadius ? new THREE.Color(0xe68989) : new THREE.Color(0xffffff);
      // Update color based on proximity
      if (mouseDistance < proximityRadius) {
        targetColor.set(0xe68989); // Color when in proximity
      } else {
        targetColor.set(0xffffff); // Default color
      }

      // Set color for the instance
      easing.dampC(color, targetColor, delta, 0.01);
      // color.lerp(targetColor, 0.1);
      colorAttribute.setXYZ(i, color.r, color.g, color.b);

      // Update material properties based on proximity
      // if (mouseDistance < proximityRadius) {
      //   // Example of animating roughness based on proximity
      //   mat.roughness = THREE.MathUtils.lerp(mat.roughness, 1.0, 0.1); // Smoothly reduce roughness
      //   // mat.clearcoat = THREE.MathUtils.lerp(mat.clearcoat, 1.0, 0.1); // Smoothly increase clearcoat
      // } else {
      //   // Reset material properties when leaving proximity
      //   mat.roughness = THREE.MathUtils.lerp(mat.roughness, 0, 0.1); // Smoothly increase roughness
      //   // mat.clearcoat = THREE.MathUtils.lerp(mat.clearcoat, 0.0, 0.1); // Smoothly decrease clearcoat
      // }

      mat.needsUpdate = true; // Ensure material is updated
    }
    const mat = mesh.material;
    // Mark color attribute for update
    mat.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
  });

// Function to randomly change the light color
function randomColor() {
  return Math.random() * 0xffffff;
}

useEffect(() => {
  const interval = setInterval(() => {
    // Change the light color to a random color
    gsap.to(pointLightRef.current.color, {
      r: Math.random(),
      g: Math.random(),
      b: Math.random(),
      duration: 2, // Smooth color transition
      ease: "power2.inOut"
    });
  }, 3000); // Change color every 3 seconds

  return () => clearInterval(interval); // Cleanup on unmount
}, []);


  return (
    <group position={[0, 0, 0]}>
      <instancedMesh
        ref={meshRef}
        args={[null, null, instanceCount]}
        // material={material}
      >
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <MeshTransmissionMaterial
          ref={transmissionMaterialRef}
          thickness={0.95}
          anisotropy={0.1}
          chromaticAberration={2}
          backside={true}
          backsideThickness={0.15}
          samples={16}
          resolution={256}
          // _transmission={1}
          transmission={1}
          clearcoat={1}
          clearcoatRoughness={0.0}
          roughness={0.0}
          distortion={0.95}
          distortionScale={0.5}
          temporalDistortion={0.1}
          ior={1.25}
          // color='white'
          // shadow='#94cbff'
        />
      </instancedMesh>
      <pointLight ref={pointLightRef} intensity={500} />
    </group>
  );
}

const Griddy = React.memo(() => {
  const ringRef = useRef();

  // Randomize Lightformer Colors
  const randomizeColor = () => {
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 90 }}>
      {/* <Perf position='top-right' minimal={true} /> */}
      {/* <Environment preset='city' environmentIntensity={2.5} /> */}
      <Environment resolution={32} 
      // background
      >
        <group rotation={[-Math.PI / 4, -0.3, 0]}>
          <Lightformer intensity={1} rotation-x={Math.PI / 2} position={[0, 1, -5]} scale={[10, 10, 1]} color={randomizeColor()} />
          <Lightformer intensity={1} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 2, 1]} color={randomizeColor()} />
          <Lightformer intensity={1} rotation-y={-Math.PI / 2} position={[5, 1, 0]} scale={[20, 2, 1]} color={randomizeColor()} />
          <Lightformer
            ref={ringRef}
            type='ring'
            intensity={2}
            color={randomizeColor()}
            rotation-y={Math.PI / 2}
            position={[-0.1, -1, -5]}
            scale={20}
          />
        </group>
      </Environment>
      <ambientLight intensity={1.5} />

      <DynamicGrid />
      {/* <OrbitControls /> */}
    </Canvas>
  );
});
export default Griddy;

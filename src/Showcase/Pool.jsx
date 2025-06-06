// import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function Pool() {
  return (
    <Canvas>
      <ambientLight intensity={1} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
      {/* <OrbitControls /> */}
    </Canvas>
  );
};

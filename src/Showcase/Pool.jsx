// import { OrbitControls } from "@react-three/drei";
// import { Canvas } from "@react-three/fiber";
// import React from "react";

// export default function Pool() {
//   return (
//     <Canvas>
//       <ambientLight intensity={1} />
//       <mesh>
//         <boxGeometry />
//         <meshStandardMaterial />
//       </mesh>
//       {/* <OrbitControls /> */}
//     </Canvas>
//   );
// };

// src/components/Showcase/Pool.jsx
import React from 'react';
import "../Style/Home.scss";
export default function Pool() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(45deg, #000000, #434343)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '2rem'
    }}>
      Pool Component Loaded Successfully
    </div>
  );
}
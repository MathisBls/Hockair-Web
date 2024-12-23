import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import "./Classic.css";

const TableModel = ({ path }) => {
  const gltf = useGLTF(`${import.meta.env.VITE_BACKEND_URL}${path}`);
  return <primitive object={gltf.scene} position={[0, -1, 0]} />;
};

const StrikerModel = ({ path, bounds }) => {
  const gltf = useGLTF(`${import.meta.env.VITE_BACKEND_URL}${path}`);
  const strikerRef = useRef();

  const [isDragging, setIsDragging] = useState(false); // État pour suivre le glissement
  const [offset, setOffset] = useState([0, 0]); // Décalage pour un mouvement précis

  // Gestion du clic pour commencer le déplacement
  const handlePointerDown = (event) => {
    setIsDragging(true);

    // Calculer le décalage entre la position actuelle et la position de la souris
    const intersect = event.intersections[0];
    if (intersect) {
      const strikerPosition = strikerRef.current.position;
      const mousePosition = intersect.point;
      setOffset([mousePosition.x - strikerPosition.x, mousePosition.z - strikerPosition.z]);
    }
  };

  // Gestion du relâchement pour arrêter le déplacement
  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Gestion des mouvements de la souris
  const handlePointerMove = (event) => {
    if (isDragging && strikerRef.current) {
      const intersect = event.intersections[0];
      if (intersect) {
        let x = intersect.point.x - offset[0];
        let z = intersect.point.z - offset[1];

        // Appliquer les limites
        x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
        z = Math.max(bounds.minZ, Math.min(bounds.maxZ, z));

        strikerRef.current.position.set(x, 0, z);
      }
    }
  };

  return (
    <primitive
      ref={strikerRef}
      object={gltf.scene}
      scale={0.5}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    />
  );
};

const Classic = () => {
  return (
    <div className="gameplay-container">
      <Canvas
        className="canvas-gameplay"
        camera={{ position: [0, 10, 10], fov: 35 }}
        onPointerUp={() => console.log("Relâché")}
      >
        {/* Lumières */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <spotLight position={[-10, 15, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

        {/* Table */}
        <TableModel path="/assets/untitled.gltf" />

        {/* Striker */}
        <StrikerModel
          path="/assets/1734907962050-skin_black.glb"
          bounds={{
            minX: -5, // Limite gauche
            maxX: 5, // Limite droite
            minZ: -3, // Limite haut
            maxZ: 3, // Limite bas
          }}
        />
      </Canvas>
    </div>
  );
};

export default Classic;

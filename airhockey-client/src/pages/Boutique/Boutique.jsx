import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { useLanguage } from "../../../LanguageContext";
import "./Boutique.css";
import monnaie from "./../../assets/monnaie.svg";

const InteractiveModel = ({ path }) => {
  const gltf = useGLTF(`${import.meta.env.VITE_BACKEND_URL}${path}`);

  return (
    <primitive
      object={gltf.scene}
      scale={3.5} // Ajuste la taille
      position={[0, -1.5, 0]} // Centrage
    />
  );
};

const Boutique = () => {
  const [skins, setSkins] = useState([]);
  const [filter, setFilter] = useState("all"); // Filtre par défaut
  const { translations } = useLanguage();

  useEffect(() => {
    const fetchSkins = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/skins`);
        if (response.ok) {
          const data = await response.json();
          setSkins(data);
        } else {
          console.error("Erreur lors de la récupération des skins");
        }
      } catch (error) {
        console.error("Erreur API :", error);
      }
    };

    fetchSkins();
  }, []);

  // Filtrer les skins en fonction du type
  const filteredSkins = filter === "all" ? skins : skins.filter((skin) => skin.type === filter);

  return (
    <div className="boutique-container">
      <h1 className="boutique-title">{translations.page.shop.title}</h1>

      <div className="filter-buttons">
        <button
          className={`filter-button ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          {translations.page.shop.filters.all}
        </button>
        <button
          className={`filter-button ${filter === "puck" ? "active" : ""}`}
          onClick={() => setFilter("puck")}
        >
          {translations.page.shop.filters.pucks}
        </button>
        <button
          className={`filter-button ${filter === "mallet" ? "active" : ""}`}
          onClick={() => setFilter("mallet")}
        >
          {translations.page.shop.filters.strikers}
        </button>
        <button
          className={`filter-button ${filter === "table" ? "active" : ""}`}
          onClick={() => setFilter("table")}
        >
          {translations.page.shop.filters.tables}
        </button>
      </div>

      {/* Grille des modèles */}
      <div className="models-grid">
        {filteredSkins.map((skin) => (
          <div className="model-card" key={skin._id}>
            <div className="monnaie-container">
              <p className="monnaie-amount">{skin.price}</p>
              <img src={monnaie} alt="Monnaie" className="monnaie-boutique" />
            </div>
            <Canvas className="canvas">
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 10, 5]} intensity={1} />
              <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
              <InteractiveModel path={skin.filePath} />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
            <h2 className="model-title">{skin.name}</h2>
            <button className="buy-button">{translations.page.shop.buy}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boutique;

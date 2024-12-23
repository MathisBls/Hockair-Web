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
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all"); // Filtre par défaut
  const { translations } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les skins
        const skinsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/skins`);
        const skinsData = await skinsResponse.json();
        setSkins(skinsData);

        // Récupérer les informations utilisateur
        const userResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const userData = await userResponse.json();
        setUser(userData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, []);

  const handleBuy = async (skinId, price) => {
    if (user?.money < price) {
      alert(translations.page.shop.notEnoughMoney); // Message si argent insuffisant
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/skins/buy/${skinId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user); // Met à jour l'état utilisateur
      } else {
        console.error("Erreur lors de l'achat du skin");
      }
    } catch (error) {
      console.error("Erreur API :", error);
    }
  };

  const handleEquip = async (skinId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/skins/equip/${skinId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user); // Met à jour l'état utilisateur
      } else {
        console.error("Erreur lors de l'équipement du skin");
      }
    } catch (error) {
      console.error("Erreur API :", error);
    }
  };

  const filteredSkins = filter === "all" ? skins : skins.filter((skin) => skin.type === filter);

  return (
    <div className="boutique-container">
      <div className="user-money">
        <p>
          {user?.money}
          <img src={monnaie} alt="Monnaie" className="money-icon" />
        </p>
      </div>

      <h1 className="boutique-title">{translations.page.shop.title}</h1>

      {/* Boutons de filtre */}
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
            <div className="tags-container">
              {user?.ownedSkins?.includes(skin._id) && (
                <p className="tag isowned">{translations.page.shop.owned}</p>
              )}
              {user?.equippedSkin === skin._id && (
                <p className="tag isEquiped">{translations.page.shop.equiped}</p>
              )}
              <div className="monnaie-container">
                <p className="monnaie-amount">{skin.price}</p>
                <img src={monnaie} alt="Monnaie" className="monnaie-boutique" />
              </div>
            </div>
            <Canvas className="canvas">
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 10, 5]} intensity={1} />
              <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
              <InteractiveModel path={skin.filePath} />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
            <h2 className="model-title">{skin.name}</h2>
            {user?.ownedSkins?.includes(skin._id) ? (
              <button
                className="buy-button"
                onClick={() => handleEquip(skin._id)}
                disabled={user?.equippedSkin === skin._id}
              >
                {user?.equippedSkin === skin._id
                  ? translations.page.shop.equiped
                  : translations.page.shop.equip}
              </button>
            ) : (
              <button
                className="buy-button"
                onClick={() => handleBuy(skin._id, skin.price)}
              >
                {translations.page.shop.buy}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Boutique;

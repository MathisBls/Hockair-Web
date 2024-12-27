import React from "react";
import "./BeforePlay.css";

const BeforePlay = () => {
  return (
    <div className="before-play-wrapper">
      <div className="before-play-game-area">
        <img
          src="https://via.placeholder.com/1200x800.png?text=Terrain+de+Jeu"
          alt="Terrain de Jeu"
          className="before-play-game-field"
        />
      </div>
      <div className="before-play-sidebar">
        <h1 className="before-play-title">Préparez-vous à jouer</h1>
        <button className="before-play-action-button">Jouer</button>
        <button className="before-play-action-button">Jouer avec un ami</button>
        <button className="before-play-action-button">Jouer contre l'IA</button>
        <button className="before-play-action-button">Rejoindre un tournoi</button>
      </div>
    </div>
  );
};

export default BeforePlay;

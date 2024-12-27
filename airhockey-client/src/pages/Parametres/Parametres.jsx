import React, { useState } from 'react';
import './Parametres.css';

const Parametres = () => {
  const [showStats, setShowStats] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundVolume, setSoundVolume] = useState(50);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [puckColor, setPuckColor] = useState('#ff0000'); // Couleur par défaut

  return (
    <div className="parametres-container">
      <h1 className="parametres-title">Paramètres</h1>

      <div className="parametre-item">
        <label className="parametre-label">
          Ne pas afficher les stats
          <input
            type="checkbox"
            checked={!showStats}
            onChange={() => setShowStats(!showStats)}
          />
        </label>
      </div>

      <div className="parametre-item">
        <label className="parametre-label">
          Activer les notifications par mail
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
          />
        </label>
      </div>

      <div className="parametre-item">
        <label className="parametre-label">
          Volume des effets sonores
          <input
            type="range"
            min="0"
            max="100"
            value={soundVolume}
            onChange={(e) => setSoundVolume(e.target.value)}
          />
          <span>{soundVolume}%</span>
        </label>
      </div>

      <div className="parametre-item">
        <label className="parametre-label">
          Désactiver le son musical du site
          <input
            type="checkbox"
            checked={!musicEnabled}
            onChange={() => setMusicEnabled(!musicEnabled)}
          />
        </label>
      </div>
    </div>
  );
};

export default Parametres;

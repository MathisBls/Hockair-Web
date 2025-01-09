import React, { useState, useEffect, useRef } from 'react';

import './Classic.css'; // Assurez-vous de créer ce fichier CSS pour les styles de base
import bluepaddle from '../../assets/sprites/In-game_Field/paddleBlueDown.png';
import redpaddle from '../../assets/sprites/In-game_Field/paddleRedTop.png';

const Classic = () => {
  // Positions des paddles et du puck
  const [redPaddle, setRedPaddle] = useState({ x: 300, y: 50 });
  const [bluePaddle, setBluePaddle] = useState({ x: 300, y: 400 });
  const [puck, setPuck] = useState({ x: 400, y: 250, dx: 2, dy: 2 });

  // Taille de l'arène
  const arenaWidth = 800;
  const arenaHeight = 500;
  const goalWidth = 200;

  // Déplacement du paddle bleu via la souris
  const arenaRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = arenaRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setBluePaddle((prev) => ({
      x: Math.min(Math.max(mouseX - 25, 0), arenaWidth - 50),
      y: Math.min(Math.max(mouseY - 25, arenaHeight / 2), arenaHeight - 50),
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Mise à jour des positions du puck
      setPuck((prev) => {
        let newX = prev.x + prev.dx;
        let newY = prev.y + prev.dy;

        // Collision avec les murs latéraux
        if (newX <= 0 || newX >= arenaWidth - 20) prev.dx *= -1;

        // Collision avec le haut et le bas
        if (
          (newY <= 10 &&
            newX >= (arenaWidth - goalWidth) / 2 &&
            newX <= (arenaWidth + goalWidth) / 2) ||
          (newY >= arenaHeight - 30 &&
            newX >= (arenaWidth - goalWidth) / 2 &&
            newX <= (arenaWidth + goalWidth) / 2)
        ) {
          // But marqué, remettre la balle au centre
          return {
            x: arenaWidth / 2,
            y: arenaHeight / 2,
            dx: 2 * (Math.random() > 0.5 ? 1 : -1),
            dy: 2 * (Math.random() > 0.5 ? 1 : -1),
          };
        }

        if (newY <= 0 || newY >= arenaHeight - 20) prev.dy *= -1;

        // Collision avec les paddles
        if (
          newY >= bluePaddle.y - 20 &&
          newY <= bluePaddle.y + 50 &&
          newX >= bluePaddle.x &&
          newX <= bluePaddle.x + 50
        ) {
          const impactAngle =
            (((newX - (bluePaddle.x + 25)) / 25) * Math.PI) / 4;
          prev.dx = 5 * Math.sin(impactAngle);
          prev.dy = -Math.abs(prev.dy);
        }

        if (
          newY <= redPaddle.y + 50 &&
          newY >= redPaddle.y - 20 &&
          newX >= redPaddle.x &&
          newX <= redPaddle.x + 50
        ) {
          const impactAngle =
            (((newX - (redPaddle.x + 25)) / 25) * Math.PI) / 4;
          prev.dx = 5 * Math.sin(impactAngle);
          prev.dy = Math.abs(prev.dy);
        }

        return { ...prev, x: newX, y: newY };
      });

      // Mouvement simple du bot (paddle rouge)
      setRedPaddle((prev) => ({
        ...prev,
        x: Math.min(Math.max(puck.x - 25, 0), arenaWidth - 50),
      }));
    }, 16);

    return () => clearInterval(interval);
  }, [puck, bluePaddle]);

  return (
    <div
      ref={arenaRef}
      className='arena'
      onMouseMove={handleMouseMove}
      style={{
        width: `${arenaWidth}px`,
        height: `${arenaHeight}px`,
        backgroundColor: '#222',
        position: 'relative',
        margin: '20px auto',
        overflow: 'hidden',
        border: '4px solid #fff',
        cursor: 'none',
      }}
    >
      {/* Cages */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: `${(arenaWidth - goalWidth) / 2}px`,
          width: `${goalWidth}px`,
          height: '10px',
          backgroundColor: 'red',
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: `${(arenaWidth - goalWidth) / 2}px`,
          width: `${goalWidth}px`,
          height: '10px',
          backgroundColor: 'blue',
        }}
      ></div>

      {/* Paddles */}
      <img
        src={redpaddle}
        alt='Red Paddle'
        className='paddle'
        style={{
          position: 'absolute',
          left: redPaddle.x,
          top: redPaddle.y,
          width: '50px',
          height: '50px',
        }}
      />
      <img
        src={bluepaddle}
        alt='Blue Paddle'
        className='paddle'
        style={{
          position: 'absolute',
          left: bluePaddle.x,
          top: bluePaddle.y,
          width: '50px',
          height: '50px',
        }}
      />

      {/* Puck */}
      <div
        className='puck'
        style={{
          position: 'absolute',
          left: puck.x,
          top: puck.y,
          width: '20px',
          height: '20px',
          backgroundColor: '#fff',
          borderRadius: '50%',
        }}
      ></div>
    </div>
  );
};

export default Classic;

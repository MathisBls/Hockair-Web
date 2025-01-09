import React, { useState, useEffect } from 'react';
import './Classement.css';

const Classement = () => {
  const [selectedLeague, setSelectedLeague] = useState('Bronze');
  const [timeLeft, setTimeLeft] = useState(600); // Exemple : 10 minutes

  const leagues = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

  const leaderboardData = [
    { rank: 1, name: 'Player1', score: 1000 },
    { rank: 2, name: 'Player2', score: 950 },
    { rank: 3, name: 'Player3', score: 900 },
    { rank: 4, name: 'Player4', score: 850 },
    { rank: 5, name: 'Player5', score: 800 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((time) => (time > 0 ? time - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='classement-container'>
      <h1 className='classement-title'>Classement</h1>
      <div className='league-selector'>
        {leagues.map((league) => (
          <button
            key={league}
            className={`league-button ${selectedLeague === league ? 'active' : ''}`}
            onClick={() => setSelectedLeague(league)}
          >
            {league}
          </button>
        ))}
      </div>
      <div className='timer'>Temps restant : {formatTime(timeLeft)}</div>
      <div className='leaderboard'>
        {leaderboardData.map((player, index) => (
          <div key={index} className='player-row'>
            <div className='rank'>{player.rank}</div>
            <div className='name'>{player.name}</div>
            <div className='score'>{player.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classement;

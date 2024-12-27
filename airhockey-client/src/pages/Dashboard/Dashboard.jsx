import React from "react";
import Tournament from "../../components/Tournament/Tournament";
import "./Dashboard.css";

const Dashboard = () => {
    const recentMatches = [
        {
          id: 1,
          player1: { name: "You", logo: "path/to/your/logo.png", country: "FR" },
          player2: { name: "John Doe", logo: "path/to/johndoe/logo.png", country: "US" },
          score: "3 - 2",
          date: "2023-12-26"
        },
        {
          id: 2,
          player1: { name: "You", logo: "path/to/your/logo.png", country: "FR" },
          player2: { name: "Jane Smith", logo: "path/to/janesmith/logo.png", country: "UK" },
          score: "1 - 3",
          date: "2023-12-24"
        },
      ];
  const tournaments = [
    {
      id: 1,
      name: "Winter Cup",
      description: "A frosty battle awaits!",
      image: "https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525",
    },
    {
      id: 2,
      name: "Summer Slam",
      description: "Heat up the competition!",
      image: "https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525",
    },
    {
      id: 3,
      name: "Autumn Arena",
      description: "Fall into victory!",
      image: "https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525",
    },
    {
      id: 4,
      name: "Spring Showdown",
      description: "Blossom to greatness!",
      image: "https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525",
    },

  ];

  const challenges = [
    {
      id: 1,
      name: "2v1 Survival",
      difficulty: "Hard",
      stars: 5,
    },
    {
      id: 2,
      name: "Comeback Challenge",
      difficulty: "Medium",
      stars: 4,
    },
    {
      id: 3,
      name: "Perfect Defense",
      difficulty: "Easy",
      stars: 3,
    },
  ];

  return (
    <div className="dashboard-container">
    <div className="dashboard-banner">
        <div className="banner-content">
            <h1>Welcome to HOCKAIR</h1>
            <p>Challenge your friends, climb the ranks, and conquer the air hockey tournaments!</p>
            <button className="play-button">Play Now</button>
        </div>
    </div>

      <div className="dashboard-overview">
        <div className="overview-card">
          <h2>Total Matches</h2>
          <p>152</p>
        </div>
        <div className="overview-card">
          <h2>Win Rate</h2>
          <p>75%</p>
        </div>
        <div className="overview-card">
          <h2>Current Elo</h2>
          <p>1250</p>
        </div>
        <div className="overview-card">
          <h2>Tournaments Played</h2>
          <p>8</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Upcoming Tournaments</h2>
        <div className="carousel">
          {tournaments.map((tournament) => (
            <Tournament
              key={tournament.id}
              name={tournament.name}
              description={tournament.description}
              image={tournament.image}
            />
          ))}
        </div>
      </div>

      {/* Challenges Section */}
      <div className="dashboard-section">
        <h2>Challenges</h2>
        <div className="challenges-grid">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="challenge-card">
              <h3>{challenge.name}</h3>
              <p>Difficulty: {challenge.difficulty}</p>
              <div className="stars">
                {Array.from({ length: challenge.stars }).map((_, i) => (
                  <span key={i} className="star">⭐</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-section recent-matches">
        <h2>Recent Matches</h2>
        <div className="matches-list">
          {recentMatches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="player player1">
                <img src={match.player1.logo} alt={match.player1.name} className="player-logo" />
                <span className="player-name">{match.player1.name}</span>
                <img src={`https://flagcdn.com/24x18/${match.player1.country.toLowerCase()}.png`} alt={match.player1.country} className="country-flag" />
              </div>
              <div className="match-details">
                <span className="vs">VS</span>
                <span className="score">{match.score}</span>
                <span className="date">{match.date}</span>
              </div>
              <div className="player player2">
                <img src={match.player2.logo} alt={match.player2.name} className="player-logo" />
                <span className="player-name">{match.player2.name}</span>
                <img src={`https://flagcdn.com/24x18/${match.player2.country.toLowerCase()}.png`} alt={match.player2.country} className="country-flag" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

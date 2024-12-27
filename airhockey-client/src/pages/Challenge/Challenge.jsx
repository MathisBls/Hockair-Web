import React from "react";
import "./Challenge.css";

const Challenge = () => {
  const challenges = [
    {
      id: 1,
      name: "Against All Odds",
      description: "Start 5 goals behind and make a comeback to win.",
      difficulty: 5,
      stars: 5,
      map: "Frozen Arena",
      image: "https://via.placeholder.com/300x200.png?text=Against+All+Odds",
    },
    {
      id: 2,
      name: "Speed Demon",
      description: "Win the match within 3 minutes.",
      difficulty: 4,
      stars: 4,
      map: "Desert Dunes",
      image: "https://via.placeholder.com/300x200.png?text=Speed+Demon",
    },
    {
      id: 3,
      name: "Perfect Defense",
      description: "Don't let the bot score any goals.",
      difficulty: 3,
      stars: 3,
      map: "Neon Nights",
      image: "https://via.placeholder.com/300x200.png?text=Perfect+Defense",
    },
    {
      id: 4,
      name: "Endurance Test",
      description: "Survive a 10-minute match against increasing difficulty.",
      difficulty: 4,
      stars: 4,
      map: "Volcanic Crater",
      image: "https://via.placeholder.com/300x200.png?text=Endurance+Test",
    },
  ];

  return (
    <div className="challenge-container">
      <h1 className="challenge-title">Challenges</h1>
      <div className="challenge-grid">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="challenge-cards">
            <img
              src={challenge.image}
              alt={challenge.name}
              className="challenge-image"
            />
            <div className="challenge-details">
              <h3 className="challenge-name">{challenge.name}</h3>
              <p className="challenge-description">{challenge.description}</p>
              <p className="challenge-map">Map: {challenge.map}</p>
              <div className="challenge-difficulty">
                Difficulty:{" "}
                {"⭐".repeat(challenge.stars).padEnd(5, "☆")}
              </div>
              <button className="challenge-play-button">Play</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenge;

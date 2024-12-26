import React from "react";
import "./Tournaments.css";

const Tournaments = () => {
  const tournaments = [
    {
      id: 1,
      name: "Winter Clash",
      description: "A thrilling 32-player tournament in icy arenas.",
      rules: "5v5, Single Elimination",
      participants: 32,
      date: "Dec 25, 2024",
      image: "https://media.discordapp.net/attachments/1311338282776399933/1321776083036672082/file-Epv8DmUxFMc1FvMU834PM2.png?ex=676e7767&is=676d25e7&hm=a37891c981be143ee016bbe86d6ed3432facd87a4cd4931d46c5ffba96cb59df&=&format=webp&quality=lossless&width=593&height=593",
    },
    {
      id: 2,
      name: "Summer Heatwave",
      description: "Challenge yourself in the blazing summer sun.",
      rules: "1v1, Best of 3",
      participants: 16,
      date: "Jul 15, 2024",
      image: "https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676e78c7&is=676d2747&hm=c98a6f187efa1eb2f9546064f9814d0a274b5fcd5b362665657490b29f5aa981&=&format=webp&quality=lossless&width=593&height=593",
    },
    {
      id: 3,
      name: "Champions League",
      description: "The ultimate showdown for the best players worldwide.",
      rules: "3v3, Double Elimination",
      participants: 64,
      date: "Mar 10, 2024",
      image: "https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676e78c7&is=676d2747&hm=c98a6f187efa1eb2f9546064f9814d0a274b5fcd5b362665657490b29f5aa981&=&format=webp&quality=lossless&width=593&height=593",
    },
    {
      id: 4,
      name: "Rookie Rumble",
      description: "A beginner-friendly tournament to hone your skills.",
      rules: "Free-for-All, 20 Players",
      participants: 20,
      date: "Jan 5, 2024",
      image: "https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676e78c7&is=676d2747&hm=c98a6f187efa1eb2f9546064f9814d0a274b5fcd5b362665657490b29f5aa981&=&format=webp&quality=lossless&width=593&height=593",
    },
  ];

  return (
    <div className="tournament-container">
      <h1 className="tournament-title">Tournaments</h1>
      <div className="tournament-grid">
        {tournaments.map((tournament) => (
          <div key={tournament.id} className="tournament-card">
            <div className="card-front">
              <img
                src={tournament.image}
                alt={tournament.name}
                className="tournament-logo"
              />
            </div>
            <div className="card-back">
              <h3 className="tournament-name">{tournament.name}</h3>
              <p className="tournament-description">{tournament.description}</p>
              <div className="tournament-details">
                <span className="tournament-rule">{tournament.rules}</span>
                <span className="tournament-participants">
                  {tournament.participants} Participants
                </span>
                <span className="tournament-date">{tournament.date}</span>
              </div>
              <button className="tournament-join-button">Join Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tournaments;

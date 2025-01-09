import React from 'react';

import Tournament from '../../components/Tournament/Tournament';
import './Tournaments.css';

const Tournaments = () => {
  const tournaments = [
    {
      id: 1,
      name: 'Winter Clash',
      description: 'A thrilling 32-player tournament in icy arenas.',
      rules: '5v5, Single Elimination',
      participants: 32,
      date: 'Dec 25, 2024',
      image:
        'https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525',
    },
    {
      id: 2,
      name: 'Summer Heatwave',
      description: 'Challenge yourself in the blazing summer sun.',
      rules: '1v1, Best of 3',
      participants: 16,
      date: 'Jul 15, 2024',
      image:
        'https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525',
    },
    {
      id: 3,
      name: 'Champions League',
      description: 'The ultimate showdown for the best players worldwide.',
      rules: '3v3, Double Elimination',
      participants: 64,
      date: 'Mar 10, 2024',
      image:
        'https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525',
    },
    {
      id: 4,
      name: 'Rookie Rumble',
      description: 'A beginner-friendly tournament to hone your skills.',
      rules: 'Free-for-All, 20 Players',
      participants: 20,
      date: 'Jan 5, 2024',
      image:
        'https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676e78c7&is=676d2747&hm=c98a6f187efa1eb2f9546064f9814d0a274b5fcd5b362665657490b29f5aa981&=&format=webp&quality=lossless&width=593&height=593',
    },
    {
      id: 5,
      name: 'Spring Showdown',
      description: 'A vibrant tournament to celebrate the spring season.',
      rules: '2v2, Round Robin',
      participants: 24,
      date: 'Apr 20, 2024',
      image:
        'https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525',
    },
    {
      id: 6,
      name: 'Autumn Arena',
      description: 'Battle it out in the crisp autumn air.',
      rules: '4v4, Single Elimination',
      participants: 40,
      date: 'Oct 10, 2024',
      image:
        'https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525',
    },
    {
      id: 7,
      name: 'Night Owl Knockout',
      description: 'A late-night tournament for the night owls.',
      rules: '1v1, Single Elimination',
      participants: 16,
      date: 'Nov 1, 2024',
      image:
        'https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525',
    },
    {
      id: 8,
      name: 'Holiday Havoc',
      description: 'Celebrate the holidays with an intense tournament.',
      rules: '3v3, Double Elimination',
      participants: 48,
      date: 'Dec 20, 2024',
      image:
        'https://media.discordapp.net/attachments/1311338282776399933/1321777557938634843/file-EfS6cwgsXFtqyGuNmbf1ii.png?ex=676fca47&is=676e78c7&hm=1bb46cfe0f2c1de31a12a33eb5326fb54908d1149be34c55dfab6602342ba6fa&=&format=webp&quality=lossless&width=525&height=525',
    },
  ];

  return (
    <div className='tournament-container'>
      <div className='dashboard-section'>
        <h2>Upcoming Tournaments</h2>
        <div className='tournament-grid'>
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
    </div>
  );
};

export default Tournaments;

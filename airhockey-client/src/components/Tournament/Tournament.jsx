import React, { useEffect, useState } from 'react';
import './Tournament.css';

const Tournament = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/tournaments`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch tournaments');
        }

        const data = await response.json();

        // Filter out duplicates using a Set to track unique IDs
        const uniqueTournaments = data.filter(
          (tournament, index, self) =>
            index === self.findIndex((t) => t._id === tournament._id)
        );

        setTournaments(uniqueTournaments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []); // Ensure useEffect runs only once

  if (loading) {
    return <div>Loading tournaments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='tournament-list'>
      {tournaments.map((tournament) => (
        <div key={tournament._id} className='tournament-card'>
          <div
            className='tournament-image'
            style={{ backgroundImage: `url(${tournament.image})` }}
          >
            <div className='tournament-overlay'>
              <div className='tournament-details'>
                <h3 className='tournament-name'>{tournament.name}</h3>
                <p className='tournament-description'>
                  {tournament.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tournament;

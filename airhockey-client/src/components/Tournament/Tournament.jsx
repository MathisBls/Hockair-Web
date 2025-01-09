import React from 'react';
import './Tournament.css';

const Tournament = ({ name, description, image }) => {
  return (
    <div className='tournament-card'>
      <div
        className='tournament-image'
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className='tournament-overlay'>
          <div className='tournament-details'>
            <h3 className='tournament-name'>{name}</h3>
            <p className='tournament-description'>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournament;

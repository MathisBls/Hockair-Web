import React from 'react';
import { subscriptions } from './subscriptionData';
import './Abonnements.css';

const Abonnements = () => {
  return (
    <div className="subscriptions-container">
      <div className="subscriptions-grid">
        {subscriptions.map((sub, index) => (
          <div key={index} className={`subscription-card ${sub.name.toLowerCase().replace(' ', '-')}`}>
            <div className="subscription-header">
              <h2>{sub.name}</h2>
              <p className="subscription-price">{sub.price}</p>
            </div>
            <p className="subscription-target">{sub.target}</p>
            <ul className="subscription-advantages">
              {sub.advantages.map((adv, i) => (
                <li key={i}>{adv}</li>
              ))}
            </ul>
            <button className="subscribe-button">S'abonner</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Abonnements;

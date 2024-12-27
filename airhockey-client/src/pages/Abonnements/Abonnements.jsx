import React from 'react';
import { useLanguage } from '../../../LanguageContext';
import './Abonnements.css';




const Abonnements = () => {

  const { translations } = useLanguage();

  const subscriptions = [
    {
      name: translations.page.subscriptionData.hockairPro.name,
      price: translations.page.subscriptionData.hockairPro.price,
      target: translations.page.subscriptionData.hockairPro.target,
      advantages: translations.page.subscriptionData.hockairPro.advantages
    },
    {
      name: translations.page.subscriptionData.hockairChampion.name,
      price: translations.page.subscriptionData.hockairChampion.price,
      target: translations.page.subscriptionData.hockairChampion.target,
      advantages: translations.page.subscriptionData.hockairChampion.advantages
    }
  ];
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
            <button className="subscribe-button">{translations.page.subscriptionData.subscribe}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Abonnements;

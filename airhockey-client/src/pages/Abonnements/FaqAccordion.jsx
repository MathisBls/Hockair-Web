import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import React, { useState } from 'react';

const FaqAccordion = ({ items }) => {
  const [openItemId, setOpenItemId] = useState(null);

  const toggleItem = (itemId) =>
    setOpenItemId((currentId) => (currentId === itemId ? null : itemId));

  return (
    <div className='subs-faq-list'>
      {items.map((item) => (
        <div
          key={item.id}
          className={`subs-faq-item ${openItemId === item.id ? 'subs-faq-item-open' : ''}`}
        >
          <h3 className='subs-faq-heading'>
            <button
              type='button'
              id={`${item.id}-trigger`}
              className='subs-faq-trigger'
              aria-expanded={openItemId === item.id}
              aria-controls={`${item.id}-panel`}
              onClick={() => toggleItem(item.id)}
            >
              <span>{item.question}</span>
              <ExpandMoreRoundedIcon className='subs-faq-chevron' />
            </button>
          </h3>
          <div
            id={`${item.id}-panel`}
            role='region'
            aria-labelledby={`${item.id}-trigger`}
            className='subs-faq-panel'
            hidden={openItemId !== item.id}
          >
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion;

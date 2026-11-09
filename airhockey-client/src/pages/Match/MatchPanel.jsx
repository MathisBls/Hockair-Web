import React from 'react';

const MatchPanel = ({ feedItems, statRows, gameTexts }) => (
  <aside className='match-panel'>
    <h4 className='match-panel-title'>{gameTexts.feedTitle}</h4>
    <ol className='match-feed'>
      {feedItems.length === 0 && (
        <li className='match-feed-empty'>{gameTexts.feedEmpty}</li>
      )}
      {feedItems.map((item) => (
        <li
          key={item.id}
          className={`match-feed-item match-feed-${item.type} ${item.side ? `match-feed-side-${item.side}` : ''}`}
        >
          <span className='match-feed-time'>{item.timeLabel}</span>
          <span className='match-feed-text'>{item.text}</span>
        </li>
      ))}
    </ol>

    <h4 className='match-panel-title'>{gameTexts.stats.title}</h4>
    <ul className='match-stats'>
      {statRows.map((row) => (
        <li key={row.statKey}>
          <div className='match-stat-labels'>
            <span>{row.playerLabel}</span>
            <span className='match-stat-name'>{row.label}</span>
            <span>{row.botLabel}</span>
          </div>
          <div className='match-stat-bar'>
            <div style={{ width: `${row.playerShare * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  </aside>
);

export default MatchPanel;

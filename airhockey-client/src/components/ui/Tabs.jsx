import React from 'react';

const Tabs = ({ tabs, activeTab, onChange, ariaLabel }) => (
  <div className='ui-tabs' role='tablist' aria-label={ariaLabel}>
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type='button'
        role='tab'
        aria-selected={tab.value === activeTab}
        className={`ui-tab ${tab.value === activeTab ? 'ui-tab-active' : ''}`}
        onClick={() => onChange(tab.value)}
      >
        {tab.icon}
        {tab.label}
        {tab.count !== undefined && (
          <span className='ui-tab-count'>{tab.count}</span>
        )}
      </button>
    ))}
  </div>
);

export default Tabs;

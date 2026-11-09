import React from 'react';

const PageContainer = ({ isWide = false, className = '', children }) => (
  <main className={`ui-page ${isWide ? 'ui-page-wide' : ''} ${className}`}>
    {children}
  </main>
);

export default PageContainer;

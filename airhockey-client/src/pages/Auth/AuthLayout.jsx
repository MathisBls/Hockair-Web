import React from 'react';

import HeaderLogin from '../../components/HeaderLogin/HeaderLogin';
import { PageContainer, PageHeader } from '../../components/ui';

import BrandPanel from './BrandPanel';
import LanguageSwitcher from './LanguageSwitcher';
import './AuthLayout.css';

const AuthLayout = ({
  eyebrow = null,
  title,
  description = null,
  isLanguageSwitcherVisible = true,
  children,
}) => (
  <PageContainer isWide className='auth-page'>
    <BrandPanel />
    <section className='auth-panel'>
      <div className='auth-panel-topbar'>
        <HeaderLogin className='auth-panel-logo' />
        {isLanguageSwitcherVisible && <LanguageSwitcher />}
      </div>
      <div className='auth-panel-body'>
        <PageHeader eyebrow={eyebrow} title={title} description={description} />
        {children}
      </div>
    </section>
  </PageContainer>
);

export default AuthLayout;

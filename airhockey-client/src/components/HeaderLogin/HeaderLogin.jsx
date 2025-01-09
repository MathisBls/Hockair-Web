import React from 'react';

import logo from '../../assets/logo.png';
import './HeaderLogin.css';

const HeaderLogin = () => {
  return (
    <div>
      <div className='logo-headerlog'>
        <a href='/'>
          <img src={logo} alt='Logo' />
        </a>
      </div>
    </div>
  );
};

export default HeaderLogin;

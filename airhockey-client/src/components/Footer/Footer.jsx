import { Language as LanguageIcon } from '@mui/icons-material';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import Logo from '../../assets/logo.png';
import { formatTranslation } from '../../i18n/formatTranslation';
import './Footer.css';

const LANGUAGE_ROUTE = '/language';

const FOOTER_COLUMNS = [
  {
    id: 'product',
    links: [
      { id: 'play', path: '/play' },
      { id: 'arcade', path: '/arcade' },
      { id: 'shop', path: '/shop' },
      { id: 'subscriptions', path: '/subscriptions' },
    ],
  },
  {
    id: 'community',
    links: [
      { id: 'tournaments', path: '/tournaments' },
      { id: 'leaderboard', path: '/leaderboard' },
      { id: 'challenges', path: '/challenges' },
      { id: 'friends', path: '/friends' },
    ],
  },
  {
    id: 'legal',
    links: [
      { id: 'terms', path: null },
      { id: 'privacy', path: null },
      { id: 'cookies', path: null },
    ],
  },
];

const Footer = () => {
  const { translations, language } = useLanguage();
  const footerTexts = translations.footer;

  const viewModel = useMemo(
    () => ({
      copyright: formatTranslation(footerTexts.copyright, {
        year: new Date().getFullYear(),
      }),
      currentLanguageLabel: footerTexts.languages[language] ?? language,
      columns: FOOTER_COLUMNS.map((column) => ({
        id: column.id,
        title: footerTexts.columns[column.id].title,
        links: column.links.map((link) => ({
          id: link.id,
          path: link.path,
          hasPath: Boolean(link.path),
          label: footerTexts.columns[column.id][link.id],
        })),
      })),
    }),
    [footerTexts, language]
  );

  return (
    <footer className='footer'>
      <div className='footer-inner'>
        <div className='footer-brand'>
          <Link to='/' className='footer-logo'>
            <img src={Logo} alt='' className='footer-logo-image' />
            <span className='footer-logo-name'>{footerTexts.brandName}</span>
          </Link>
          <p className='footer-tagline'>{footerTexts.tagline}</p>
        </div>
        <nav
          className='footer-columns'
          aria-label={footerTexts.navigationLabel}
        >
          {viewModel.columns.map((column) => (
            <div key={column.id} className='footer-column'>
              <h2 className='footer-column-title'>{column.title}</h2>
              <ul className='footer-link-list'>
                {column.links.map((link) => (
                  <li key={link.id}>
                    {link.hasPath ? (
                      <Link to={link.path} className='footer-link'>
                        {link.label}
                      </Link>
                    ) : (
                      <span className='footer-link footer-link-placeholder'>
                        {link.label}
                        <span className='footer-soon'>
                          {footerTexts.columns.legal.soon}
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className='footer-bottom'>
        <p className='footer-copyright'>{viewModel.copyright}</p>
        <Link to={LANGUAGE_ROUTE} className='footer-language'>
          <LanguageIcon fontSize='inherit' />
          <span>{footerTexts.language}</span>
          <span className='footer-language-current'>
            {viewModel.currentLanguageLabel}
          </span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;

import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import SportsHockeyOutlinedIcon from '@mui/icons-material/SportsHockeyOutlined';
import React, { useMemo } from 'react';

import { useLanguage } from '../../../LanguageContext';
import HeaderLogin from '../../components/HeaderLogin/HeaderLogin';
import { BOTS } from '../../game/bots';
import { formatPluralTranslation } from '../../i18n/formatTranslation';

import TableIllustration from './TableIllustration';

const ProductHighlight = Object.freeze({
  BOTS: 'bots',
  RANKED: 'ranked',
  TOURNAMENTS: 'tournaments',
});

const HIGHLIGHT_ICONS = Object.freeze({
  [ProductHighlight.BOTS]: SmartToyOutlinedIcon,
  [ProductHighlight.RANKED]: LeaderboardOutlinedIcon,
  [ProductHighlight.TOURNAMENTS]: EmojiEventsOutlinedIcon,
});

const BrandPanel = () => {
  const { translations } = useLanguage();
  const brandTranslations = translations.page.auth.brand;

  const highlights = useMemo(
    () =>
      Object.values(ProductHighlight).map((highlight) => ({
        id: highlight,
        Icon: HIGHLIGHT_ICONS[highlight],
        title: brandTranslations.highlights[highlight].title,
        description: brandTranslations.highlights[highlight].description,
      })),
    [brandTranslations]
  );

  const botCountLabel = formatPluralTranslation(
    brandTranslations.botCount,
    BOTS.length
  );

  return (
    <aside className='auth-brand'>
      <HeaderLogin />

      <div className='auth-brand-intro'>
        <span className='ui-eyebrow'>{brandTranslations.eyebrow}</span>
        <h2 className='auth-brand-title'>{brandTranslations.title}</h2>
        <p className='auth-brand-description'>
          {brandTranslations.description}
        </p>
      </div>

      <div className='auth-brand-illustration'>
        <TableIllustration label={brandTranslations.illustrationLabel} />
      </div>

      <ul className='auth-highlights'>
        {highlights.map(({ id, Icon, title, description }) => (
          <li key={id} className='auth-highlight'>
            <span className='auth-highlight-icon'>
              <Icon fontSize='small' />
            </span>
            <div>
              <p className='auth-highlight-title'>{title}</p>
              <p className='auth-highlight-description'>{description}</p>
            </div>
          </li>
        ))}
      </ul>

      <ul className='auth-brand-facts'>
        <li>
          <SportsHockeyOutlinedIcon fontSize='inherit' />
          {botCountLabel}
        </li>
        <li>
          <LanguageOutlinedIcon fontSize='inherit' />
          {brandTranslations.noInstall}
        </li>
      </ul>
    </aside>
  );
};

export default BrandPanel;

import { Lightbulb as TipIcon } from '@mui/icons-material';
import React, { useMemo } from 'react';

import { useLanguage } from '../../../LanguageContext';
import { Card } from '../../components/ui';

import { BEGINNER_TIP_IDS } from './homeData';

const BeginnerTipsCard = () => {
  const { translations } = useLanguage();
  const tipsTexts = translations.page.home.tips;

  const tips = useMemo(
    () =>
      BEGINNER_TIP_IDS.map((tipId) => ({
        id: tipId,
        text: tipsTexts.items[tipId],
      })),
    [tipsTexts]
  );

  return (
    <Card title={tipsTexts.title}>
      <ul className='home-tips-list'>
        {tips.map((tip) => (
          <li key={tip.id} className='home-tip'>
            <TipIcon className='home-tip-icon' fontSize='small' />
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default BeginnerTipsCard;

import React from 'react';

import { SkinType } from './shopCatalog';

const MalletIllustration = ({ preview }) => (
  <svg viewBox='0 0 120 120' className='shop-preview-svg' aria-hidden='true'>
    <ellipse className='shop-preview-shadow' cx='60' cy='98' rx='40' ry='8' />
    <ellipse cx='60' cy='76' rx='44' ry='18' fill={preview.accentColor} />
    <ellipse
      className='shop-preview-outline'
      cx='60'
      cy='70'
      rx='44'
      ry='18'
      fill={preview.bodyColor}
    />
    <ellipse
      cx='60'
      cy='70'
      rx='32'
      ry='12'
      fill='none'
      stroke={preview.accentColor}
      strokeWidth='2.5'
    />
    <rect x='52' y='44' width='16' height='24' fill={preview.accentColor} />
    <circle
      className='shop-preview-outline'
      cx='60'
      cy='40'
      r='20'
      fill={preview.bodyColor}
    />
    <circle className='shop-preview-highlight' cx='67' cy='32' r='5' />
  </svg>
);

const PuckIllustration = ({ preview }) => (
  <svg viewBox='0 0 120 120' className='shop-preview-svg' aria-hidden='true'>
    <ellipse className='shop-preview-shadow' cx='60' cy='92' rx='42' ry='9' />
    <ellipse cx='60' cy='72' rx='42' ry='16' fill={preview.bodyColor} />
    <rect x='18' y='58' width='84' height='14' fill={preview.bodyColor} />
    <ellipse
      className='shop-preview-outline'
      cx='60'
      cy='58'
      rx='42'
      ry='16'
      fill={preview.bodyColor}
    />
    <ellipse
      cx='60'
      cy='58'
      rx='30'
      ry='10'
      fill='none'
      stroke={preview.accentColor}
      strokeWidth='3'
    />
  </svg>
);

const TableIllustration = ({ preview }) => (
  <svg viewBox='0 0 120 120' className='shop-preview-svg' aria-hidden='true'>
    <rect
      x='22'
      y='8'
      width='76'
      height='104'
      rx='12'
      fill={preview.railColor}
    />
    <rect
      x='26'
      y='12'
      width='68'
      height='96'
      rx='9'
      fill='none'
      stroke={preview.trimColor}
      strokeWidth='2'
    />
    <rect
      x='30'
      y='16'
      width='60'
      height='88'
      rx='6'
      fill={preview.surfaceColor}
    />
    <line
      x1='30'
      y1='60'
      x2='90'
      y2='60'
      stroke={preview.lineColor}
      strokeWidth='1.5'
    />
    <circle
      cx='60'
      cy='60'
      r='11'
      fill='none'
      stroke={preview.lineColor}
      strokeWidth='1.5'
    />
    <rect
      x='48'
      y='14'
      width='24'
      height='4'
      rx='2'
      fill={preview.botGoalColor}
    />
    <rect
      x='48'
      y='102'
      width='24'
      height='4'
      rx='2'
      fill={preview.playerGoalColor}
    />
  </svg>
);

const ILLUSTRATION_BY_KIND = {
  [SkinType.MALLET]: MalletIllustration,
  [SkinType.PUCK]: PuckIllustration,
  [SkinType.TABLE]: TableIllustration,
};

const ItemPreview = ({ preview }) => {
  const Illustration = ILLUSTRATION_BY_KIND[preview.kind] ?? PuckIllustration;

  return <Illustration preview={preview} />;
};

export default ItemPreview;

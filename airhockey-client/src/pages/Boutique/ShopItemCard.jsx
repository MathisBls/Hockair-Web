import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import React from 'react';

import coinIcon from '../../assets/monnaie.svg';
import {
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/ui';

import ItemPreview from './ItemPreview';
import { ShopItemAction } from './shopCatalog';

const ACTION_VARIANT = {
  [ShopItemAction.BUY]: ButtonVariant.PRIMARY,
  [ShopItemAction.EQUIP]: ButtonVariant.SECONDARY,
  [ShopItemAction.EQUIPPED]: ButtonVariant.GHOST,
};

export const CoinAmount = ({ label, isLarge = false }) => (
  <span className={`shop-coin-amount ${isLarge ? 'shop-coin-amount-lg' : ''}`}>
    <img src={coinIcon} alt='' className='shop-coin-icon' />
    {label}
  </span>
);

const ShopItemCard = ({ item, texts, isPending, onAction }) => (
  <article
    className={`shop-item ${item.isEquipped ? 'shop-item-equipped' : ''}`}
  >
    <div className='shop-item-preview'>
      <ItemPreview preview={item.preview} />
      <div className='shop-item-badges'>
        {item.isEquipped && (
          <Badge tone={BadgeTone.SUCCESS} icon={<CheckCircleRoundedIcon />}>
            {texts.badges.equipped}
          </Badge>
        )}
        {item.isOwned && !item.isEquipped && !item.isPreview && (
          <Badge tone={BadgeTone.INFO}>{texts.badges.owned}</Badge>
        )}
        {item.isPremiumOnly && (
          <Badge
            tone={BadgeTone.WARNING}
            icon={<WorkspacePremiumRoundedIcon />}
          >
            {texts.badges.premium}
          </Badge>
        )}
      </div>
    </div>
    <div className='shop-item-body'>
      <div className='shop-item-heading'>
        <span className='shop-item-type'>{item.typeLabel}</span>
        <h3 className='shop-item-name'>{item.name}</h3>
      </div>
      <div className='shop-item-footer'>
        {item.isFree ? (
          <span className='shop-item-free'>{item.priceLabel}</span>
        ) : (
          <CoinAmount label={item.priceLabel} />
        )}
        <Button
          variant={ACTION_VARIANT[item.action]}
          size={ButtonSize.SMALL}
          disabled={item.isActionDisabled}
          isLoading={isPending}
          onClick={() => onAction(item)}
        >
          {item.actionLabel}
        </Button>
      </div>
    </div>
  </article>
);

export default ShopItemCard;

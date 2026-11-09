import React, { lazy, Suspense } from 'react';

import { Badge, BadgeTone, Button, ButtonSize } from '../../components/ui';

import ItemPreview from './ItemPreview';
import { CoinAmount } from './ShopItemCard';

const MalletShowcase = lazy(() => import('./MalletShowcase'));

const FeaturedItem = ({ item, texts, isPending, onAction }) => {
  const illustration = (
    <div className='shop-featured-illustration'>
      <ItemPreview preview={item.preview} />
    </div>
  );

  return (
    <section className='shop-featured' aria-labelledby='shop-featured-name'>
      <div className='shop-featured-text'>
        <span className='ui-eyebrow'>{texts.featured.eyebrow}</span>
        <h2 id='shop-featured-name' className='shop-featured-name'>
          {item.name}
        </h2>
        <p className='shop-featured-description'>
          {texts.featured.description}
        </p>
        <div className='shop-featured-meta'>
          <Badge tone={BadgeTone.NEUTRAL}>{item.typeLabel}</Badge>
          {item.isEquipped && (
            <Badge tone={BadgeTone.SUCCESS}>{texts.badges.equipped}</Badge>
          )}
          {item.isPreview && (
            <Badge tone={BadgeTone.INFO}>{texts.badges.preview}</Badge>
          )}
        </div>
        <div className='shop-featured-actions'>
          {item.isFree ? (
            <span className='shop-item-free'>{item.priceLabel}</span>
          ) : (
            <CoinAmount label={item.priceLabel} isLarge />
          )}
          <Button
            size={ButtonSize.LARGE}
            disabled={item.isActionDisabled}
            isLoading={isPending}
            onClick={() => onAction(item)}
          >
            {item.actionLabel}
          </Button>
        </div>
        {item.hasLiveShowcase && (
          <p className='shop-featured-hint'>{texts.featured.interactionHint}</p>
        )}
      </div>
      <div className='shop-featured-stage'>
        {item.hasLiveShowcase ? (
          <Suspense fallback={illustration}>
            <MalletShowcase
              bodyColor={item.preview.bodyColor}
              accentColor={item.preview.accentColor}
            />
          </Suspense>
        ) : (
          illustration
        )}
      </div>
    </section>
  );
};

export default FeaturedItem;

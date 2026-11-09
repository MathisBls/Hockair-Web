import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useLanguage } from '../../../LanguageContext';
import { apiRequest, HttpMethod } from '../../api/apiClient';
import {
  Button,
  ButtonVariant,
  EmptyState,
  Modal,
  PageContainer,
  PageHeader,
  SegmentedControl,
  Skeleton,
} from '../../components/ui';
import { normalizeMatchSettings } from '../../game/matchSettings';
import {
  getStoredMatchSettings,
  storeMatchSettings,
} from '../../game/progress';
import { formatTranslation } from '../../i18n/formatTranslation';

import FeaturedItem from './FeaturedItem';
import {
  applyLocalEquip,
  buildPurchaseModel,
  buildShopPageModel,
  CatalogSource,
  ShopApiPath,
  ShopCategory,
  ShopItemAction,
} from './shopCatalog';
import ShopItemCard, { CoinAmount } from './ShopItemCard';
import './Boutique.css';

const LoadStatus = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
});

const FeedbackTone = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
});

const FEEDBACK_DURATION_MS = 4000;
const SKELETON_CARD_KEYS = ['first', 'second', 'third', 'fourth'];

const FEEDBACK_ICON = {
  [FeedbackTone.SUCCESS]: <CheckCircleRoundedIcon />,
  [FeedbackTone.ERROR]: <ErrorOutlineRoundedIcon />,
};

const loadShopData = async () => {
  const [skinsResult, profileResult] = await Promise.allSettled([
    apiRequest(ShopApiPath.SKINS),
    apiRequest(ShopApiPath.PROFILE),
  ]);
  const skins =
    skinsResult.status === 'fulfilled' && Array.isArray(skinsResult.value)
      ? skinsResult.value
      : [];

  return {
    skins,
    source: skins.length > 0 ? CatalogSource.API : CatalogSource.LOCAL,
    user: profileResult.status === 'fulfilled' ? profileResult.value : null,
  };
};

const Boutique = () => {
  const { translations, language } = useLanguage();
  const texts = translations.page.shop;

  const [loadStatus, setLoadStatus] = useState(LoadStatus.LOADING);
  const [shopData, setShopData] = useState({
    skins: [],
    source: CatalogSource.LOCAL,
    user: null,
  });
  const [matchSettings, setMatchSettings] = useState(() =>
    normalizeMatchSettings(getStoredMatchSettings())
  );
  const [category, setCategory] = useState(ShopCategory.ALL);
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [pendingItemId, setPendingItemId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let isActive = true;
    loadShopData().then((loadedData) => {
      if (isActive) {
        setShopData(loadedData);
        setLoadStatus(LoadStatus.READY);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }
    const timeoutId = window.setTimeout(
      () => setFeedback(null),
      FEEDBACK_DURATION_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const pageModel = useMemo(
    () =>
      buildShopPageModel({
        skins: shopData.skins,
        source: shopData.source,
        user: shopData.user,
        matchSettings,
        category,
        texts,
        language,
      }),
    [shopData, matchSettings, category, texts, language]
  );

  const purchaseModel = useMemo(
    () =>
      purchaseItem
        ? buildPurchaseModel({
            item: purchaseItem,
            balance: pageModel.balance,
            texts,
            language,
          })
        : null,
    [purchaseItem, pageModel.balance, texts, language]
  );

  const isLoading = loadStatus === LoadStatus.LOADING;

  const showFeedback = (tone, template, item) =>
    setFeedback({
      tone,
      message: formatTranslation(template, { name: item?.name ?? '' }),
    });

  const equipItem = async (item) => {
    if (shopData.source === CatalogSource.LOCAL) {
      const nextSettings = applyLocalEquip(matchSettings, item);
      storeMatchSettings(nextSettings);
      setMatchSettings(nextSettings);
      showFeedback(FeedbackTone.SUCCESS, texts.feedback.equipped, item);

      return;
    }
    setPendingItemId(item.id);
    try {
      const response = await apiRequest(ShopApiPath.buildEquipPath(item.id), {
        method: HttpMethod.POST,
      });
      setShopData((currentData) => ({ ...currentData, user: response.user }));
      showFeedback(FeedbackTone.SUCCESS, texts.feedback.equipped, item);
    } catch {
      showFeedback(FeedbackTone.ERROR, texts.feedback.equipFailed, item);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleItemAction = (item) => {
    if (item.action === ShopItemAction.BUY) {
      setPurchaseItem(item);

      return;
    }
    if (item.action === ShopItemAction.EQUIP) {
      equipItem(item);
    }
  };

  const closePurchase = useCallback(() => setPurchaseItem(null), []);

  const confirmPurchase = async () => {
    const item = purchaseItem;
    setPendingItemId(item.id);
    try {
      const response = await apiRequest(ShopApiPath.buildBuyPath(item.id), {
        method: HttpMethod.POST,
      });
      setShopData((currentData) => ({ ...currentData, user: response.user }));
      showFeedback(FeedbackTone.SUCCESS, texts.feedback.purchased, item);
    } catch {
      showFeedback(FeedbackTone.ERROR, texts.feedback.purchaseFailed, item);
    } finally {
      setPendingItemId(null);
      setPurchaseItem(null);
    }
  };

  const wallet = (
    <div
      className='shop-wallet'
      role='group'
      aria-label={pageModel.balanceAriaLabel}
    >
      <span className='shop-wallet-label'>{texts.wallet.label}</span>
      {isLoading && <Skeleton width='5rem' height='1.5rem' />}
      {!isLoading && pageModel.hasBalance && (
        <CoinAmount label={pageModel.balanceLabel} isLarge />
      )}
      {!isLoading && !pageModel.hasBalance && (
        <span className='shop-wallet-unavailable'>
          {pageModel.balanceLabel}
        </span>
      )}
    </div>
  );

  return (
    <PageContainer className='shop-page'>
      <PageHeader
        eyebrow={texts.eyebrow}
        title={texts.title}
        description={texts.description}
        actions={wallet}
      />

      {feedback && (
        <div
          className={`shop-feedback shop-feedback-${feedback.tone}`}
          role='status'
        >
          {FEEDBACK_ICON[feedback.tone]}
          <span className='shop-feedback-message'>{feedback.message}</span>
          <button
            type='button'
            className='shop-feedback-dismiss'
            aria-label={texts.feedback.dismiss}
            onClick={() => setFeedback(null)}
          >
            <CloseRoundedIcon />
          </button>
        </div>
      )}

      {!isLoading && pageModel.isPreview && (
        <div className='shop-notice'>
          <InfoOutlinedIcon />
          <div>
            <p className='shop-notice-title'>{texts.previewNotice.title}</p>
            <p className='shop-notice-description'>
              {texts.previewNotice.description}
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className='shop-featured shop-featured-loading'>
          <div className='shop-featured-text'>
            <Skeleton width='6rem' />
            <Skeleton width='60%' height='2rem' />
            <Skeleton width='80%' />
            <Skeleton width='10rem' height='2.75rem' />
          </div>
        </div>
      )}
      {!isLoading && pageModel.featuredItem && (
        <FeaturedItem
          item={pageModel.featuredItem}
          texts={texts}
          isPending={pendingItemId === pageModel.featuredItem.id}
          onAction={handleItemAction}
        />
      )}

      <section className='shop-catalog' aria-labelledby='shop-catalog-title'>
        <div className='shop-toolbar'>
          <SegmentedControl
            options={pageModel.categoryOptions}
            value={category}
            onChange={setCategory}
            ariaLabel={texts.categoryAria}
          />
          {!isLoading && (
            <span id='shop-catalog-title' className='shop-result-count'>
              {pageModel.resultCountLabel}
            </span>
          )}
        </div>

        {isLoading && (
          <div className='shop-grid' aria-busy='true'>
            {SKELETON_CARD_KEYS.map((skeletonKey) => (
              <div key={skeletonKey} className='shop-item shop-item-skeleton'>
                <Skeleton height='10rem' />
                <div className='shop-item-body'>
                  <Skeleton width='40%' />
                  <Skeleton width='70%' height='1.25rem' />
                  <Skeleton width='100%' height='2rem' />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && pageModel.hasVisibleItems && (
          <div className='shop-grid'>
            {pageModel.visibleItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                texts={texts}
                isPending={pendingItemId === item.id}
                onAction={handleItemAction}
              />
            ))}
          </div>
        )}

        {!isLoading && !pageModel.hasVisibleItems && (
          <EmptyState
            icon={<StorefrontRoundedIcon />}
            title={texts.empty.title}
            description={texts.empty.description}
            action={
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={() => setCategory(ShopCategory.ALL)}
              >
                {texts.empty.action}
              </Button>
            }
          />
        )}
      </section>

      <Modal
        isOpen={Boolean(purchaseItem)}
        title={texts.confirm.title}
        onClose={closePurchase}
        footer={
          purchaseModel && (
            <>
              <Button variant={ButtonVariant.GHOST} onClick={closePurchase}>
                {texts.confirm.cancel}
              </Button>
              <Button
                onClick={confirmPurchase}
                disabled={!purchaseModel.isAffordable}
                isLoading={Boolean(pendingItemId)}
              >
                {purchaseModel.submitLabel}
              </Button>
            </>
          )
        }
      >
        {purchaseModel && (
          <div className='shop-confirm'>
            <p>{purchaseModel.description}</p>
            <dl className='shop-confirm-summary'>
              <div>
                <dt>{texts.confirm.price}</dt>
                <dd>{purchaseModel.priceLabel}</dd>
              </div>
              <div>
                <dt>{texts.confirm.balance}</dt>
                <dd>{purchaseModel.balanceLabel}</dd>
              </div>
              <div>
                <dt>{texts.confirm.balanceAfter}</dt>
                <dd>{purchaseModel.balanceAfterLabel}</dd>
              </div>
            </dl>
            {!purchaseModel.isAffordable && (
              <p className='shop-confirm-warning'>
                {purchaseModel.insufficientLabel}
              </p>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default Boutique;

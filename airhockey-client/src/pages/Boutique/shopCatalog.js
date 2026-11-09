import { normalizeMatchSettings } from '../../game/matchSettings';
import { MALLET_SKINS, PALETTE, TABLE_THEMES } from '../../game/theme';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';

export const SkinType = Object.freeze({
  PUCK: 'puck',
  MALLET: 'mallet',
  TABLE: 'table',
});

export const ShopCategory = Object.freeze({
  ALL: 'all',
  PUCK: SkinType.PUCK,
  MALLET: SkinType.MALLET,
  TABLE: SkinType.TABLE,
});

export const CatalogSource = Object.freeze({
  API: 'api',
  LOCAL: 'local',
});

export const ShopItemAction = Object.freeze({
  BUY: 'buy',
  EQUIP: 'equip',
  EQUIPPED: 'equipped',
});

export const ShopApiPath = Object.freeze({
  SKINS: '/api/skins',
  PROFILE: '/api/users/profile',
  buildBuyPath: (skinId) => `/api/skins/buy/${skinId}`,
  buildEquipPath: (skinId) => `/api/skins/equip/${skinId}`,
});

const SHOP_CATEGORY_ORDER = [
  ShopCategory.ALL,
  ShopCategory.PUCK,
  ShopCategory.MALLET,
  ShopCategory.TABLE,
];

const LOCAL_MALLET_PRICES = {
  cyan: 0,
  red: 250,
  lime: 400,
  violet: 600,
  gold: 1200,
};

const LOCAL_TABLE_PRICES = {
  neon: 0,
  ice: 500,
  sunset: 900,
};

const MATCH_SETTING_KEY_BY_TYPE = {
  [SkinType.MALLET]: 'malletSkinId',
  [SkinType.TABLE]: 'tableThemeId',
};

const buildMalletPreview = (skin) => ({
  kind: SkinType.MALLET,
  bodyColor: skin.body,
  accentColor: skin.accent,
});

const buildPuckPreview = (skin) => ({
  kind: SkinType.PUCK,
  bodyColor: PALETTE.black,
  accentColor: skin.body,
});

const buildTablePreview = (theme) => ({
  kind: SkinType.TABLE,
  surfaceColor: theme.surface,
  lineColor: theme.surfaceLine,
  railColor: theme.rail,
  trimColor: theme.railTrim,
  playerGoalColor: theme.playerGoal,
  botGoalColor: theme.botGoal,
});

const buildApiPreview = (skinType, indexInType) => {
  if (skinType === SkinType.TABLE) {
    return buildTablePreview(TABLE_THEMES[indexInType % TABLE_THEMES.length]);
  }
  const skin = MALLET_SKINS[indexInType % MALLET_SKINS.length];

  return skinType === SkinType.PUCK
    ? buildPuckPreview(skin)
    : buildMalletPreview(skin);
};

const buildApiCatalog = (skins) => {
  const countByType = {};

  return skins.map((skin) => {
    const indexInType = countByType[skin.type] ?? 0;
    countByType[skin.type] = indexInType + 1;

    return {
      id: skin._id,
      type: skin.type,
      name: skin.name,
      price: skin.price,
      isPremiumOnly: Boolean(skin.premiumOnly),
      preview: buildApiPreview(skin.type, indexInType),
    };
  });
};

const buildLocalCatalog = (catalogTexts) => [
  ...MALLET_SKINS.map((skin) => ({
    id: skin.id,
    type: SkinType.MALLET,
    name: catalogTexts.mallets[skin.labelKey],
    price: LOCAL_MALLET_PRICES[skin.id] ?? 0,
    isPremiumOnly: false,
    preview: buildMalletPreview(skin),
  })),
  ...TABLE_THEMES.map((theme) => ({
    id: theme.id,
    type: SkinType.TABLE,
    name: catalogTexts.tables[theme.labelKey],
    price: LOCAL_TABLE_PRICES[theme.id] ?? 0,
    isPremiumOnly: false,
    preview: buildTablePreview(theme),
  })),
];

export const applyLocalEquip = (matchSettings, item) => {
  const settingKey = MATCH_SETTING_KEY_BY_TYPE[item.type];

  return settingKey
    ? normalizeMatchSettings({ ...matchSettings, [settingKey]: item.id })
    : matchSettings;
};

const isLocallyEquipped = (matchSettings, item) => {
  const settingKey = MATCH_SETTING_KEY_BY_TYPE[item.type];

  return Boolean(settingKey) && matchSettings[settingKey] === item.id;
};

const resolveOwnership = ({ source, item, user, matchSettings }) => {
  if (source === CatalogSource.LOCAL) {
    return {
      isOwned: true,
      isEquipped: isLocallyEquipped(matchSettings, item),
    };
  }
  const ownedSkinIds = (user?.ownedSkins ?? []).map(String);

  return {
    isOwned: ownedSkinIds.includes(String(item.id)),
    isEquipped: String(user?.equippedSkin ?? '') === String(item.id),
  };
};

const resolveAction = ({ isOwned, isEquipped }) => {
  if (isEquipped) {
    return ShopItemAction.EQUIPPED;
  }

  return isOwned ? ShopItemAction.EQUIP : ShopItemAction.BUY;
};

const ACTION_LABEL_KEY = {
  [ShopItemAction.BUY]: 'buy',
  [ShopItemAction.EQUIP]: 'equip',
  [ShopItemAction.EQUIPPED]: 'equipped',
};

const buildItemViewModel = ({
  item,
  source,
  user,
  matchSettings,
  balance,
  texts,
  numberFormatter,
}) => {
  const ownership = resolveOwnership({ source, item, user, matchSettings });
  const action = resolveAction(ownership);
  const isAffordable = balance !== null && balance >= item.price;
  const isBlockedByBalance = action === ShopItemAction.BUY && !isAffordable;

  return {
    ...item,
    ...ownership,
    action,
    isAffordable,
    isActionDisabled: action === ShopItemAction.EQUIPPED || isBlockedByBalance,
    actionLabel: isBlockedByBalance
      ? texts.actions.notEnoughCoins
      : texts.actions[ACTION_LABEL_KEY[action]],
    typeLabel: texts.types[item.type],
    priceLabel:
      item.price > 0 ? numberFormatter.format(item.price) : texts.price.free,
    isFree: item.price <= 0,
    isPreview: source === CatalogSource.LOCAL,
    hasLiveShowcase: item.preview.kind === SkinType.MALLET,
  };
};

const pickFeaturedItem = (items) => {
  const rankedItems = [...items].sort(
    (firstItem, secondItem) => secondItem.price - firstItem.price
  );

  return (
    rankedItems.find((item) => !item.isOwned) ??
    rankedItems.find((item) => item.preview.kind === SkinType.MALLET) ??
    rankedItems[0] ??
    null
  );
};

export const buildShopPageModel = ({
  skins,
  source,
  user,
  matchSettings,
  category,
  texts,
  language,
}) => {
  const numberFormatter = new Intl.NumberFormat(language);
  const balance = typeof user?.money === 'number' ? user.money : null;
  const catalog =
    source === CatalogSource.API
      ? buildApiCatalog(skins)
      : buildLocalCatalog(texts.catalog);
  const items = catalog.map((item) =>
    buildItemViewModel({
      item,
      source,
      user,
      matchSettings,
      balance,
      texts,
      numberFormatter,
    })
  );
  const visibleItems =
    category === ShopCategory.ALL
      ? items
      : items.filter((item) => item.type === category);

  return {
    isPreview: source === CatalogSource.LOCAL,
    hasBalance: balance !== null,
    balance,
    balanceLabel:
      balance === null
        ? texts.wallet.unavailable
        : numberFormatter.format(balance),
    balanceAriaLabel:
      balance === null
        ? texts.wallet.unavailable
        : formatPluralTranslation(texts.wallet.coins, balance, {
            count: numberFormatter.format(balance),
          }),
    categoryOptions: SHOP_CATEGORY_ORDER.map((categoryValue) => ({
      value: categoryValue,
      label: texts.categories[categoryValue],
    })),
    featuredItem: pickFeaturedItem(items),
    visibleItems,
    hasVisibleItems: visibleItems.length > 0,
    resultCountLabel: formatPluralTranslation(
      texts.resultCount,
      visibleItems.length
    ),
  };
};

export const buildPurchaseModel = ({ item, balance, texts, language }) => {
  const numberFormatter = new Intl.NumberFormat(language);
  const formatCoins = (amount) =>
    formatPluralTranslation(texts.wallet.coins, amount, {
      count: numberFormatter.format(amount),
    });
  const currentBalance = balance ?? 0;
  const missingAmount = Math.max(item.price - currentBalance, 0);

  return {
    description: formatTranslation(texts.confirm.description, {
      name: item.name,
    }),
    priceLabel: formatCoins(item.price),
    balanceLabel: formatCoins(currentBalance),
    balanceAfterLabel: formatCoins(Math.max(currentBalance - item.price, 0)),
    isAffordable: missingAmount === 0,
    insufficientLabel: formatTranslation(texts.confirm.insufficient, {
      amount: formatCoins(missingAmount),
    }),
    submitLabel: formatTranslation(texts.confirm.submit, {
      amount: formatCoins(item.price),
    }),
  };
};

import { formatTranslation } from '../../i18n/formatTranslation';

export const PlanId = Object.freeze({
  FREE: 'free',
  PRO: 'hockairPro',
  CHAMPION: 'hockairChampion',
});

export const BillingCycle = Object.freeze({
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
});

export const FeatureValueKind = Object.freeze({
  INCLUDED: 'included',
  NOT_INCLUDED: 'notIncluded',
  TEXT: 'text',
});

export const PROFILE_API_PATH = '/api/users/profile';
export const FREE_PLAN_ROUTE = '/play';

const PLAN_CURRENCY = 'EUR';
const MONTHS_PER_YEAR = 12;
const PERCENT = 100;

const SUBSCRIPTION_STATUS_TO_PLAN_ID = {
  free: PlanId.FREE,
};

export const SUBSCRIPTION_PLANS = [
  {
    id: PlanId.FREE,
    monthlyPrice: 0,
    yearlyPrice: 0,
    isRecommended: false,
  },
  {
    id: PlanId.PRO,
    monthlyPrice: 4.99,
    yearlyPrice: 49.9,
    isRecommended: true,
  },
  {
    id: PlanId.CHAMPION,
    monthlyPrice: 9.99,
    yearlyPrice: 99.9,
    isRecommended: false,
  },
];

const INCLUDED = { kind: FeatureValueKind.INCLUDED };
const NOT_INCLUDED = { kind: FeatureValueKind.NOT_INCLUDED };
const describedAs = (textKey) => ({ kind: FeatureValueKind.TEXT, textKey });

const buildRow = (id, freeValue, proValue, championValue) => ({
  id,
  valueByPlanId: {
    [PlanId.FREE]: freeValue,
    [PlanId.PRO]: proValue,
    [PlanId.CHAMPION]: championValue,
  },
});

export const FEATURE_COMPARISON_ROWS = [
  buildRow('rankedMatches', INCLUDED, INCLUDED, INCLUDED),
  buildRow(
    'coinRewards',
    describedAs('standardRewards'),
    describedAs('boostedRewards'),
    describedAs('boostedRewards')
  ),
  buildRow('exclusiveSkins', NOT_INCLUDED, INCLUDED, INCLUDED),
  buildRow('advancedStats', NOT_INCLUDED, INCLUDED, INCLUDED),
  buildRow('premiumBadge', NOT_INCLUDED, INCLUDED, INCLUDED),
  buildRow('priorityMatchmaking', NOT_INCLUDED, NOT_INCLUDED, INCLUDED),
  buildRow('aiCoaching', NOT_INCLUDED, NOT_INCLUDED, INCLUDED),
  buildRow('exclusiveTournaments', NOT_INCLUDED, NOT_INCLUDED, INCLUDED),
  buildRow('animatedCosmetics', NOT_INCLUDED, NOT_INCLUDED, INCLUDED),
  buildRow('eloBoost', NOT_INCLUDED, NOT_INCLUDED, describedAs('eloBoost')),
  buildRow(
    'shopDiscount',
    NOT_INCLUDED,
    NOT_INCLUDED,
    describedAs('shopDiscount')
  ),
  buildRow('opponentScouting', NOT_INCLUDED, NOT_INCLUDED, INCLUDED),
];

export const resolveCurrentPlanId = (user) =>
  SUBSCRIPTION_STATUS_TO_PLAN_ID[user?.subscription?.status] ?? null;

const computeYearlySavings = (plan) =>
  Math.max(plan.monthlyPrice * MONTHS_PER_YEAR - plan.yearlyPrice, 0);

const computeSavingsPercent = (plan) =>
  plan.monthlyPrice > 0
    ? Math.round(
        (computeYearlySavings(plan) / (plan.monthlyPrice * MONTHS_PER_YEAR)) *
          PERCENT
      )
    : 0;

const buildPlanTexts = (planId, texts, legacyTexts) =>
  planId === PlanId.FREE ? texts.plans.free : legacyTexts[planId];

const buildBillingNote = ({ plan, cycle, texts, formatPrice }) => {
  if (plan.monthlyPrice <= 0) {
    return texts.freeForever;
  }

  return cycle === BillingCycle.YEARLY
    ? formatTranslation(texts.billedYearly, {
        amount: formatPrice(plan.yearlyPrice / MONTHS_PER_YEAR),
      })
    : texts.billedMonthly;
};

const buildCtaLabel = ({ isCurrent, isFree, texts, planName }) => {
  if (isCurrent) {
    return texts.cta.current;
  }

  return isFree
    ? texts.cta.free
    : formatTranslation(texts.cta.paid, { plan: planName });
};

const buildPlanViewModel = ({
  plan,
  cycle,
  texts,
  legacyTexts,
  formatPrice,
  currentPlanId,
}) => {
  const planTexts = buildPlanTexts(plan.id, texts, legacyTexts);
  const isFree = plan.monthlyPrice <= 0;
  const isCurrent = plan.id === currentPlanId;
  const price =
    cycle === BillingCycle.YEARLY ? plan.yearlyPrice : plan.monthlyPrice;
  const yearlySavings = computeYearlySavings(plan);

  return {
    id: plan.id,
    name: planTexts.name,
    target: planTexts.target,
    advantages: planTexts.advantages,
    isFree,
    isCurrent,
    isRecommended: plan.isRecommended,
    priceLabel: formatPrice(price),
    periodLabel: texts.pricePeriod[cycle],
    billingNote: buildBillingNote({ plan, cycle, texts, formatPrice }),
    hasSavings: cycle === BillingCycle.YEARLY && yearlySavings > 0,
    savingsLabel: formatTranslation(texts.yearlySavings, {
      amount: formatPrice(yearlySavings),
    }),
    isCtaDisabled: isCurrent,
    ctaLabel: buildCtaLabel({
      isCurrent,
      isFree,
      texts,
      planName: planTexts.name,
    }),
    comingSoonPriceLabel: `${formatPrice(price)} ${texts.pricePeriod[cycle]}`,
  };
};

const buildComparisonCell = (value, texts) => {
  if (value.kind === FeatureValueKind.TEXT) {
    return { kind: value.kind, label: texts.comparison.values[value.textKey] };
  }

  return { kind: value.kind, label: texts.comparison[value.kind] };
};

export const buildSubscriptionsPageModel = ({
  cycle,
  texts,
  legacyTexts,
  language,
  currentPlanId,
}) => {
  const currencyFormatter = new Intl.NumberFormat(language, {
    style: 'currency',
    currency: PLAN_CURRENCY,
  });
  const wholeCurrencyFormatter = new Intl.NumberFormat(language, {
    style: 'currency',
    currency: PLAN_CURRENCY,
    maximumFractionDigits: 0,
  });
  const formatPrice = (amount) =>
    Number.isInteger(amount)
      ? wholeCurrencyFormatter.format(amount)
      : currencyFormatter.format(amount);
  const plans = SUBSCRIPTION_PLANS.map((plan) =>
    buildPlanViewModel({
      plan,
      cycle,
      texts,
      legacyTexts,
      formatPrice,
      currentPlanId,
    })
  );
  const maxSavingsPercent = Math.max(
    ...SUBSCRIPTION_PLANS.map(computeSavingsPercent)
  );

  return {
    plans,
    billingOptions: [
      { value: BillingCycle.MONTHLY, label: texts.billing.monthly },
      {
        value: BillingCycle.YEARLY,
        label: texts.billing.yearly,
        badgeLabel: formatTranslation(texts.billing.savingsBadge, {
          percent: maxSavingsPercent,
        }),
      },
    ],
    comparisonRows: FEATURE_COMPARISON_ROWS.map((row) => ({
      id: row.id,
      label: texts.comparison.rows[row.id],
      cells: plans.map((plan) => ({
        planId: plan.id,
        isHighlighted: plan.isRecommended,
        ...buildComparisonCell(row.valueByPlanId[plan.id], texts),
      })),
    })),
    faqItems: texts.faq.items.map((item, index) => ({
      ...item,
      id: `subscriptions-faq-${index}`,
    })),
  };
};

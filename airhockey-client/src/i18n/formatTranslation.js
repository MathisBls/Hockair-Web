const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

export const formatTranslation = (template, params = {}) =>
  String(template ?? '').replace(PLACEHOLDER_PATTERN, (placeholder, key) =>
    key in params ? String(params[key]) : placeholder
  );

const FALLBACK_LOCALE = 'en';

const selectPluralCategory = (count) => {
  const locale = document.documentElement.lang || FALLBACK_LOCALE;

  return new Intl.PluralRules(locale).select(count);
};

export const formatPluralTranslation = (forms, count, params = {}) => {
  const template =
    selectPluralCategory(count) === 'one' ? forms?.one : forms?.other;

  return formatTranslation(template, { count, ...params });
};

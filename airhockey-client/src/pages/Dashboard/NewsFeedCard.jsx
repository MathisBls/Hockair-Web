import React, { useMemo } from 'react';

import { useLanguage } from '../../../LanguageContext';
import { Badge, BadgeTone, Card } from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';

import { NEWS_ITEMS, NewsCategory } from './homeData';

const BADGE_TONE_BY_NEWS_CATEGORY = {
  [NewsCategory.UPDATE]: BadgeTone.ACCENT,
  [NewsCategory.EVENT]: BadgeTone.WARNING,
  [NewsCategory.COMMUNITY]: BadgeTone.NEUTRAL,
};

const NewsFeedCard = () => {
  const { translations, language } = useLanguage();
  const newsTexts = translations.page.home.news;

  const newsEntries = useMemo(() => {
    const dateFormatter = new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return NEWS_ITEMS.map((newsItem) => ({
      id: newsItem.id,
      title: newsTexts.items[newsItem.id].title,
      summary: newsTexts.items[newsItem.id].summary,
      categoryLabel: newsTexts.categories[newsItem.category],
      categoryTone: BADGE_TONE_BY_NEWS_CATEGORY[newsItem.category],
      versionLabel: newsItem.version
        ? formatTranslation(newsTexts.version, { version: newsItem.version })
        : null,
      publishedAtIso: newsItem.publishedAt,
      publishedAtLabel: dateFormatter.format(new Date(newsItem.publishedAt)),
    }));
  }, [newsTexts, language]);

  return (
    <Card title={newsTexts.title}>
      <ul className='home-news-list'>
        {newsEntries.map((newsEntry) => (
          <li key={newsEntry.id} className='home-news-item'>
            <div className='home-news-meta'>
              <Badge tone={newsEntry.categoryTone}>
                {newsEntry.categoryLabel}
              </Badge>
              {newsEntry.versionLabel && (
                <span className='home-news-version'>
                  {newsEntry.versionLabel}
                </span>
              )}
              <time
                className='home-news-date'
                dateTime={newsEntry.publishedAtIso}
              >
                {newsEntry.publishedAtLabel}
              </time>
            </div>
            <h4 className='home-news-title'>{newsEntry.title}</h4>
            <p className='home-news-summary'>{newsEntry.summary}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default NewsFeedCard;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { apiRequest } from '../../api/apiClient';
import {
  Button,
  Modal,
  PageContainer,
  PageHeader,
  SegmentedControl,
} from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';

import ComparisonTable from './ComparisonTable';
import FaqAccordion from './FaqAccordion';
import PlanCard from './PlanCard';
import {
  BillingCycle,
  buildSubscriptionsPageModel,
  FREE_PLAN_ROUTE,
  PROFILE_API_PATH,
  resolveCurrentPlanId,
} from './subscriptionsData';
import './Abonnements.css';

const Abonnements = () => {
  const { translations, language } = useLanguage();
  const navigate = useNavigate();
  const texts = translations.page.subscriptions;
  const legacyTexts = translations.page.subscriptionData;

  const [cycle, setCycle] = useState(BillingCycle.YEARLY);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [comingSoonPlan, setComingSoonPlan] = useState(null);

  useEffect(() => {
    let isActive = true;
    apiRequest(PROFILE_API_PATH)
      .then((user) => {
        if (isActive) {
          setCurrentPlanId(resolveCurrentPlanId(user));
        }
      })
      .catch(() => {
        if (isActive) {
          setCurrentPlanId(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const pageModel = useMemo(
    () =>
      buildSubscriptionsPageModel({
        cycle,
        texts,
        legacyTexts,
        language,
        currentPlanId,
      }),
    [cycle, texts, legacyTexts, language, currentPlanId]
  );

  const billingOptions = useMemo(
    () =>
      pageModel.billingOptions.map((option) => ({
        value: option.value,
        label: (
          <>
            {option.label}
            {option.badgeLabel && (
              <span className='subs-savings-pill'>{option.badgeLabel}</span>
            )}
          </>
        ),
      })),
    [pageModel.billingOptions]
  );

  const comingSoonDescription = useMemo(
    () =>
      comingSoonPlan
        ? formatTranslation(texts.comingSoon.description, {
            plan: comingSoonPlan.name,
            price: comingSoonPlan.comingSoonPriceLabel,
          })
        : '',
    [comingSoonPlan, texts]
  );

  const selectPlan = (plan) => {
    if (plan.isFree) {
      navigate(FREE_PLAN_ROUTE);

      return;
    }
    setComingSoonPlan(plan);
  };

  const closeComingSoon = useCallback(() => setComingSoonPlan(null), []);

  return (
    <PageContainer className='subs-page'>
      <PageHeader
        eyebrow={texts.eyebrow}
        title={texts.title}
        description={texts.description}
      />

      <div className='subs-billing'>
        <SegmentedControl
          options={billingOptions}
          value={cycle}
          onChange={setCycle}
          ariaLabel={texts.billing.aria}
        />
      </div>

      <div className='subs-plans'>
        {pageModel.plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            texts={texts}
            onSelect={selectPlan}
          />
        ))}
      </div>

      <section className='subs-section' aria-labelledby='subs-comparison-title'>
        <div className='subs-section-header'>
          <h2 id='subs-comparison-title' className='subs-section-title'>
            {texts.comparison.title}
          </h2>
          <p className='subs-section-description'>
            {texts.comparison.description}
          </p>
        </div>
        <ComparisonTable
          plans={pageModel.plans}
          rows={pageModel.comparisonRows}
          featureColumnLabel={texts.comparison.featureColumn}
        />
      </section>

      <section className='subs-section' aria-labelledby='subs-faq-title'>
        <div className='subs-section-header'>
          <h2 id='subs-faq-title' className='subs-section-title'>
            {texts.faq.title}
          </h2>
        </div>
        <FaqAccordion items={pageModel.faqItems} />
      </section>

      <Modal
        isOpen={Boolean(comingSoonPlan)}
        title={texts.comingSoon.title}
        onClose={closeComingSoon}
        footer={
          <Button onClick={closeComingSoon}>{texts.comingSoon.close}</Button>
        }
      >
        <p>{comingSoonDescription}</p>
        <p className='subs-modal-note'>{texts.comingSoon.note}</p>
      </Modal>
    </PageContainer>
  );
};

export default Abonnements;

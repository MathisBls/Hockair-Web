import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import React from 'react';

import { Badge, BadgeTone, Button, ButtonVariant } from '../../components/ui';

const PlanCard = ({ plan, texts, onSelect }) => (
  <article
    className={`subs-plan ${plan.isRecommended ? 'subs-plan-recommended' : ''}`}
    aria-labelledby={`subs-plan-${plan.id}`}
  >
    <header className='subs-plan-header'>
      <div className='subs-plan-title-row'>
        <h2 id={`subs-plan-${plan.id}`} className='subs-plan-name'>
          {plan.name}
        </h2>
        {plan.isRecommended && (
          <Badge tone={BadgeTone.ACCENT}>{texts.recommended}</Badge>
        )}
        {plan.isCurrent && (
          <Badge tone={BadgeTone.SUCCESS}>{texts.currentPlan}</Badge>
        )}
      </div>
      <p className='subs-plan-target'>{plan.target}</p>
    </header>

    <div className='subs-plan-price'>
      <span className='subs-plan-amount'>{plan.priceLabel}</span>
      {!plan.isFree && (
        <span className='subs-plan-period'>{plan.periodLabel}</span>
      )}
    </div>
    <div className='subs-plan-billing'>
      <span>{plan.billingNote}</span>
      {plan.hasSavings && (
        <span className='subs-plan-savings'>{plan.savingsLabel}</span>
      )}
    </div>

    <Button
      variant={
        plan.isRecommended ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY
      }
      isFullWidth
      disabled={plan.isCtaDisabled}
      onClick={() => onSelect(plan)}
    >
      {plan.ctaLabel}
    </Button>

    <ul className='subs-plan-advantages'>
      {plan.advantages.map((advantage) => (
        <li key={advantage}>
          <CheckRoundedIcon />
          <span>{advantage}</span>
        </li>
      ))}
    </ul>
  </article>
);

export default PlanCard;

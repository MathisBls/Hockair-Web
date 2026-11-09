import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import React from 'react';

import { FeatureValueKind } from './subscriptionsData';

const ComparisonCell = ({ cell }) => {
  if (cell.kind === FeatureValueKind.INCLUDED) {
    return (
      <span className='subs-cell-included'>
        <CheckRoundedIcon aria-hidden='true' />
        <span className='subs-visually-hidden'>{cell.label}</span>
      </span>
    );
  }
  if (cell.kind === FeatureValueKind.NOT_INCLUDED) {
    return (
      <span className='subs-cell-excluded'>
        <RemoveRoundedIcon aria-hidden='true' />
        <span className='subs-visually-hidden'>{cell.label}</span>
      </span>
    );
  }

  return <span className='subs-cell-text'>{cell.label}</span>;
};

const ComparisonTable = ({ plans, rows, featureColumnLabel }) => (
  <div className='subs-table-scroll'>
    <table className='subs-table'>
      <thead>
        <tr>
          <th scope='col'>{featureColumnLabel}</th>
          {plans.map((plan) => (
            <th
              key={plan.id}
              scope='col'
              className={plan.isRecommended ? 'subs-table-highlight' : ''}
            >
              {plan.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <th scope='row'>{row.label}</th>
            {row.cells.map((cell) => (
              <td
                key={cell.planId}
                className={cell.isHighlighted ? 'subs-table-highlight' : ''}
              >
                <ComparisonCell cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ComparisonTable;

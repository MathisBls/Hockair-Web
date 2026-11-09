import React from 'react';

import { SegmentedControl } from '../../components/ui';

import { SettingRow, SwatchPicker } from './SettingsControls';

const MALLET_LABEL_ID = 'settings-mallet-label';
const TABLE_LABEL_ID = 'settings-table-label';

const GameplaySection = ({ matchSettings, options, texts, onChange }) => (
  <div className='settings-panel-stack'>
    <SettingRow
      label={texts.malletSkin}
      hint={texts.malletSkinHint}
      labelId={MALLET_LABEL_ID}
      isStacked
      control={
        <SwatchPicker
          options={options.skinOptions}
          value={matchSettings.malletSkinId}
          onChange={(malletSkinId) => onChange({ malletSkinId })}
          labelledBy={MALLET_LABEL_ID}
        />
      }
    />
    <SettingRow
      label={texts.tableTheme}
      hint={texts.tableThemeHint}
      labelId={TABLE_LABEL_ID}
      isStacked
      control={
        <SwatchPicker
          options={options.tableOptions}
          value={matchSettings.tableThemeId}
          onChange={(tableThemeId) => onChange({ tableThemeId })}
          labelledBy={TABLE_LABEL_ID}
        />
      }
    />
    <SettingRow
      label={texts.goalTarget}
      hint={texts.goalTargetHint}
      control={
        <SegmentedControl
          options={options.goalOptions}
          value={matchSettings.goalTarget}
          onChange={(goalTarget) => onChange({ goalTarget })}
          ariaLabel={texts.goalTarget}
        />
      }
    />
    <SettingRow
      label={texts.timeLimit}
      hint={texts.timeLimitHint}
      control={
        <SegmentedControl
          options={options.timeOptions}
          value={matchSettings.timeLimitSeconds}
          onChange={(timeLimitSeconds) => onChange({ timeLimitSeconds })}
          ariaLabel={texts.timeLimit}
        />
      }
    />
  </div>
);

export default GameplaySection;

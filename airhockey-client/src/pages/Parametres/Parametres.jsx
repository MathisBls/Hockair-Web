import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SportsHockeyRoundedIcon from '@mui/icons-material/SportsHockeyRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import {
  apiRequest,
  clearAuthToken,
  isAuthenticated,
} from '../../api/apiClient';
import {
  Button,
  ButtonVariant,
  Modal,
  PageContainer,
  PageHeader,
  SegmentedControl,
} from '../../components/ui';
import { soundEngine } from '../../game/audio/soundEngine';
import { normalizeMatchSettings } from '../../game/matchSettings';
import {
  getBeatenBotIds,
  getStoredMatchSettings,
  storeMatchSettings,
} from '../../game/progress';

import AccountSection from './AccountSection';
import GameplaySection from './GameplaySection';
import { SettingRow, SettingsSwitch } from './SettingsControls';
import {
  buildAccountModel,
  buildGameplayOptions,
  buildPrivacyItems,
  buildSectionNavItems,
  PROFILE_API_PATH,
  resetLocalProgress,
  SettingsRoute,
  SettingsSection,
  SUPPORTED_LANGUAGES,
} from './settingsData';
import './Parametres.css';

const ProfileStatus = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
});

const NOTICE_DURATION_MS = 2500;
const SOUND_EFFECTS_LABEL_ID = 'settings-sound-effects-label';

const SECTION_ICON = {
  [SettingsSection.ACCOUNT]: <PersonOutlineRoundedIcon />,
  [SettingsSection.GAMEPLAY]: <SportsHockeyRoundedIcon />,
  [SettingsSection.AUDIO]: <VolumeUpRoundedIcon />,
  [SettingsSection.DISPLAY]: <TranslateRoundedIcon />,
  [SettingsSection.PRIVACY]: <LockOutlinedIcon />,
  [SettingsSection.DANGER]: <WarningAmberRoundedIcon />,
};

const Parametres = () => {
  const { translations, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const texts = translations.page.settings;

  const [activeSection, setActiveSection] = useState(SettingsSection.ACCOUNT);
  const [profileState, setProfileState] = useState({
    status: ProfileStatus.LOADING,
    user: null,
  });
  const [profileRequestCount, setProfileRequestCount] = useState(0);
  const [matchSettings, setMatchSettings] = useState(() =>
    normalizeMatchSettings(getStoredMatchSettings())
  );
  const [isMuted, setIsMuted] = useState(() => soundEngine.getMuted());
  const [beatenBotCount, setBeatenBotCount] = useState(
    () => getBeatenBotIds().length
  );
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let isActive = true;
    setProfileState({ status: ProfileStatus.LOADING, user: null });
    apiRequest(PROFILE_API_PATH)
      .then((user) => {
        if (isActive) {
          setProfileState({ status: ProfileStatus.READY, user });
        }
      })
      .catch(() => {
        if (isActive) {
          setProfileState({ status: ProfileStatus.ERROR, user: null });
        }
      });

    return () => {
      isActive = false;
    };
  }, [profileRequestCount]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }
    const timeoutId = window.setTimeout(
      () => setNotice(null),
      NOTICE_DURATION_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const navItems = useMemo(() => buildSectionNavItems(texts), [texts]);
  const activeNavItem = useMemo(
    () => navItems.find((item) => item.id === activeSection) ?? navItems[0],
    [navItems, activeSection]
  );
  const gameplayOptions = useMemo(
    () => buildGameplayOptions(texts.gameplay),
    [texts]
  );
  const account = useMemo(
    () =>
      profileState.user
        ? buildAccountModel(profileState.user, texts.account, language)
        : null,
    [profileState.user, texts, language]
  );
  const languageOptions = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((languageCode) => ({
        value: languageCode,
        label: texts.display.languages[languageCode],
      })),
    [texts]
  );
  const privacyItems = useMemo(
    () =>
      buildPrivacyItems({
        texts,
        beatenBotCount,
        isMuted,
        language,
        isSignedIn: isAuthenticated(),
      }),
    [texts, beatenBotCount, isMuted, language]
  );

  const isProfileLoading = profileState.status === ProfileStatus.LOADING;
  const hasProfileError = profileState.status === ProfileStatus.ERROR;

  const updateMatchSettings = (changes) => {
    const nextSettings = normalizeMatchSettings({
      ...matchSettings,
      ...changes,
    });
    storeMatchSettings(nextSettings);
    setMatchSettings(nextSettings);
    setNotice(texts.gameplay.saved);
  };

  const updateSoundEffects = (isEnabled) => {
    soundEngine.setMuted(!isEnabled);
    setIsMuted(!isEnabled);
  };

  const playTestSound = () => soundEngine.playGoal(true);

  const logout = () => {
    clearAuthToken();
    navigate(SettingsRoute.LOGIN);
  };

  const closeResetModal = useCallback(() => setIsResetModalOpen(false), []);

  const confirmReset = () => {
    setMatchSettings(resetLocalProgress());
    setBeatenBotCount(getBeatenBotIds().length);
    setIsResetModalOpen(false);
    setNotice(texts.danger.resetDone);
  };

  const sectionContentById = {
    [SettingsSection.ACCOUNT]: (
      <AccountSection
        account={account}
        isLoading={isProfileLoading}
        hasError={hasProfileError}
        texts={texts.account}
        onRetry={() => setProfileRequestCount((count) => count + 1)}
        onEditProfile={() => navigate(SettingsRoute.PROFILE)}
        onManagePlan={() => navigate(SettingsRoute.SUBSCRIPTIONS)}
        onLogout={logout}
      />
    ),
    [SettingsSection.GAMEPLAY]: (
      <GameplaySection
        matchSettings={matchSettings}
        options={gameplayOptions}
        texts={texts.gameplay}
        onChange={updateMatchSettings}
      />
    ),
    [SettingsSection.AUDIO]: (
      <div className='settings-panel-stack'>
        <SettingRow
          label={texts.audio.soundEffects}
          hint={texts.audio.soundEffectsHint}
          labelId={SOUND_EFFECTS_LABEL_ID}
          control={
            <SettingsSwitch
              isChecked={!isMuted}
              onChange={updateSoundEffects}
              labelledBy={SOUND_EFFECTS_LABEL_ID}
            />
          }
        />
        <SettingRow
          label={texts.audio.testSound}
          hint={texts.audio.testSoundHint}
          control={
            <Button
              variant={ButtonVariant.SECONDARY}
              icon={<VolumeUpRoundedIcon />}
              onClick={playTestSound}
              disabled={isMuted}
            >
              {texts.audio.testSound}
            </Button>
          }
        />
      </div>
    ),
    [SettingsSection.DISPLAY]: (
      <div className='settings-panel-stack'>
        <SettingRow
          label={texts.display.language}
          hint={texts.display.languageHint}
          control={
            <SegmentedControl
              options={languageOptions}
              value={language}
              onChange={changeLanguage}
              ariaLabel={texts.display.language}
            />
          }
        />
      </div>
    ),
    [SettingsSection.PRIVACY]: (
      <div className='settings-panel-stack'>
        <p className='settings-paragraph'>{texts.privacy.intro}</p>
        <dl className='settings-data-list'>
          {privacyItems.map((item) => (
            <div key={item.id}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className='settings-paragraph settings-paragraph-muted'>
          {texts.privacy.accountData}
        </p>
      </div>
    ),
    [SettingsSection.DANGER]: (
      <div className='settings-panel-stack settings-danger'>
        <SettingRow
          label={texts.danger.resetProgress}
          hint={texts.danger.resetProgressHint}
          control={
            <Button
              variant={ButtonVariant.DANGER}
              icon={<DeleteForeverRoundedIcon />}
              onClick={() => setIsResetModalOpen(true)}
            >
              {texts.danger.resetAction}
            </Button>
          }
        />
      </div>
    ),
  };

  return (
    <PageContainer className='settings-page'>
      <PageHeader
        eyebrow={texts.eyebrow}
        title={texts.title}
        description={texts.description}
      />

      <div className='settings-layout'>
        <nav className='settings-nav' aria-label={texts.navAria}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type='button'
              className={`settings-nav-item ${item.id === activeSection ? 'settings-nav-item-active' : ''} ${item.isDanger ? 'settings-nav-item-danger' : ''}`}
              aria-current={item.id === activeSection ? 'page' : undefined}
              onClick={() => setActiveSection(item.id)}
            >
              {SECTION_ICON[item.id]}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <section
          className='settings-panel'
          aria-labelledby='settings-panel-title'
        >
          <header className='settings-panel-header'>
            <div>
              <h2 id='settings-panel-title' className='settings-panel-title'>
                {activeNavItem.label}
              </h2>
              <p className='settings-panel-description'>
                {activeNavItem.description}
              </p>
            </div>
            {notice && (
              <span className='settings-notice' role='status'>
                <CheckCircleRoundedIcon />
                {notice}
              </span>
            )}
          </header>
          {sectionContentById[activeSection]}
        </section>
      </div>

      <Modal
        isOpen={isResetModalOpen}
        title={texts.danger.confirmTitle}
        onClose={closeResetModal}
        footer={
          <>
            <Button variant={ButtonVariant.GHOST} onClick={closeResetModal}>
              {texts.danger.confirmCancel}
            </Button>
            <Button variant={ButtonVariant.DANGER} onClick={confirmReset}>
              {texts.danger.confirmSubmit}
            </Button>
          </>
        }
      >
        <p>{texts.danger.confirmDescription}</p>
      </Modal>
    </PageContainer>
  );
};

export default Parametres;

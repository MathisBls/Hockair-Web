import {
  Bolt as BoltIcon,
  InfoOutlined as InfoIcon,
  LocalFireDepartment as StreakIcon,
  Percent as PercentIcon,
  ShowChart as EloIcon,
  SportsEsports as GamesIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useLanguage } from '../../../LanguageContext';
import BotAvatar from '../../components/BotAvatar/BotAvatar';
import {
  Avatar,
  AvatarSize,
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  EmptyState,
  PageContainer,
  PageHeader,
  SegmentedControl,
  Skeleton,
  StatTile,
} from '../../components/ui';
import { getBeatenBotIds } from '../../game/progress';
import { useUserProfile } from '../Profile/useUserProfile';

import {
  buildEloHistoryDto,
  buildRecentMatchesDto,
  buildNewPlayerResultsByBotDto,
  buildResultsByBotDto,
  EloChartRange,
  getFastestShotDate,
  SAMPLE_PLAYER_RECORD,
} from './statsData';
import {
  buildBotResultRows,
  buildEloChartModel,
  buildKpiTiles,
  buildRecentMatchRows,
} from './statsViewModel';
import './Stats.css';

const PLAY_PATH = '/play';
const CHART_Y_DOMAIN = ['auto', 'auto'];
const CHART_X_MIN_TICK_GAP = 48;
const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 };
const CHART_TICK_COUNT = 5;
const CHART_Y_AXIS_WIDTH = 44;
const CHART_LINE_WIDTH = 2;
const CHART_ACTIVE_DOT = { r: 5, strokeWidth: 2, stroke: 'var(--surface-1)' };

const KPI_ICON_BY_ID = {
  elo: <EloIcon />,
  games: <GamesIcon />,
  winRate: <PercentIcon />,
  bestStreak: <StreakIcon />,
  fastestShot: <BoltIcon />,
};

const RESULT_BADGE_TONE = {
  win: BadgeTone.SUCCESS,
  lose: BadgeTone.ACCENT,
  draw: BadgeTone.NEUTRAL,
};

const EloTooltip = ({ active, payload }) => {
  const point = payload?.[0]?.payload;
  if (!active || !point) {
    return null;
  }

  return (
    <div className='stats-chart-tooltip'>
      <span className='stats-chart-tooltip-date'>{point.dateLabel}</span>
      <span className='stats-chart-tooltip-value'>{point.eloLabel}</span>
    </div>
  );
};

const Stats = () => {
  const { translations, language } = useLanguage();
  const navigate = useNavigate();
  const statsTexts = translations.competitive.stats;
  const { profile, isLoading: isProfileLoading, error } = useUserProfile();
  const [chartRange, setChartRange] = useState(EloChartRange.QUARTER);

  const playerRecord = useMemo(
    () =>
      profile
        ? {
            elo: profile.elo ?? SAMPLE_PLAYER_RECORD.elo,
            victories: profile.victories ?? 0,
            defeats: profile.defeats ?? 0,
          }
        : SAMPLE_PLAYER_RECORD,
    [profile]
  );

  const hasMatchHistory =
    !profile || playerRecord.victories + playerRecord.defeats > 0;

  const statsSource = useMemo(() => {
    const beatenBotIds = getBeatenBotIds();

    const resultsByBot = buildResultsByBotDto(beatenBotIds);

    return hasMatchHistory
      ? {
          beatenBotIds,
          eloHistory: buildEloHistoryDto(playerRecord.elo),
          recentMatches: buildRecentMatchesDto({ resultsByBot }),
          resultsByBot,
          fastestShotDate: getFastestShotDate(),
        }
      : {
          beatenBotIds,
          eloHistory: [],
          recentMatches: [],
          resultsByBot: buildNewPlayerResultsByBotDto(beatenBotIds),
          fastestShotDate: null,
        };
  }, [playerRecord.elo, hasMatchHistory]);

  const viewModel = useMemo(() => {
    const formattingContext = { language, translations };

    return {
      kpiTiles: buildKpiTiles({
        playerRecord,
        eloHistory: statsSource.eloHistory,
        fastestShotDate: statsSource.fastestShotDate,
        hasMatchHistory,
        ...formattingContext,
      }),
      eloChart: buildEloChartModel({
        eloHistory: statsSource.eloHistory,
        chartRange,
        ...formattingContext,
      }),
      chartRangeOptions: Object.values(EloChartRange).map((range) => ({
        value: range,
        label: statsTexts.eloChart.periods[range],
      })),
      botRows: buildBotResultRows({
        resultsByBot: statsSource.resultsByBot,
        beatenBotIds: statsSource.beatenBotIds,
        ...formattingContext,
      }),
      recentMatchRows: buildRecentMatchRows({
        recentMatches: statsSource.recentMatches,
        ...formattingContext,
      }),
      hasRecentMatches: statsSource.recentMatches.length > 0,
      noticeLabel: error
        ? statsTexts.errorDescription
        : statsTexts.sampleNotice,
      hasNotice: Boolean(error) || hasMatchHistory,
    };
  }, [
    playerRecord,
    statsSource,
    chartRange,
    language,
    translations,
    statsTexts,
    error,
    hasMatchHistory,
  ]);

  return (
    <PageContainer className='stats-page'>
      <PageHeader
        eyebrow={statsTexts.eyebrow}
        title={statsTexts.title}
        description={statsTexts.description}
        actions={
          <Button onClick={() => navigate(PLAY_PATH)}>
            {statsTexts.recent.playNow}
          </Button>
        }
      />

      {viewModel.hasNotice && (
        <p className='stats-notice'>
          <InfoIcon aria-hidden='true' />
          {viewModel.noticeLabel}
        </p>
      )}

      <section className='stats-kpis' aria-busy={isProfileLoading}>
        {viewModel.kpiTiles.map((tile) => (
          <StatTile
            key={tile.id}
            icon={KPI_ICON_BY_ID[tile.id]}
            label={tile.label}
            value={
              isProfileLoading ? (
                <Skeleton width='5rem' height='2rem' />
              ) : (
                tile.value
              )
            }
            detail={tile.detail}
          />
        ))}
      </section>

      <div className='stats-grid'>
        <Card
          className='stats-elo-card'
          title={statsTexts.eloChart.title}
          subtitle={viewModel.eloChart.summaryLabel}
          action={
            viewModel.eloChart.hasPoints && (
              <SegmentedControl
                options={viewModel.chartRangeOptions}
                value={chartRange}
                onChange={setChartRange}
                ariaLabel={statsTexts.eloChart.periodLabel}
              />
            )
          }
        >
          <div className='stats-elo-chart'>
            {isProfileLoading && <Skeleton height='100%' />}
            {!isProfileLoading && !viewModel.eloChart.hasPoints && (
              <EmptyState
                icon={<EloIcon />}
                title={statsTexts.eloChart.emptyTitle}
                description={statsTexts.eloChart.emptyDescription}
              />
            )}
            {!isProfileLoading && viewModel.eloChart.hasPoints && (
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={viewModel.eloChart.points}
                  margin={CHART_MARGIN}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke='var(--border-subtle)'
                  />
                  <XAxis
                    dataKey='timestamp'
                    type='number'
                    scale='time'
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={viewModel.eloChart.formatTick}
                    minTickGap={CHART_X_MIN_TICK_GAP}
                    axisLine={{ stroke: 'var(--border-default)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={CHART_Y_DOMAIN}
                    tickFormatter={viewModel.eloChart.formatValueTick}
                    tickCount={CHART_TICK_COUNT}
                    width={CHART_Y_AXIS_WIDTH}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<EloTooltip />}
                    cursor={{ stroke: 'var(--border-strong)' }}
                    isAnimationActive={false}
                  />
                  <Line
                    type='monotone'
                    dataKey='elo'
                    stroke='var(--accent)'
                    strokeWidth={CHART_LINE_WIDTH}
                    dot={false}
                    activeDot={{ ...CHART_ACTIVE_DOT, fill: 'var(--accent)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card
          className='stats-bots-card'
          title={statsTexts.byBot.title}
          subtitle={statsTexts.byBot.subtitle}
        >
          <ul className='stats-bot-list'>
            {viewModel.botRows.map((row) => (
              <li key={row.botId} className='stats-bot-row'>
                <BotAvatar
                  color={row.bot.color}
                  accent={row.bot.accent}
                  mood={row.bot.mood}
                  size='small'
                />
                <div className='stats-bot-body'>
                  <div className='stats-bot-heading'>
                    <span className='stats-bot-name'>{row.name}</span>
                    <span className='stats-bot-tier'>
                      {row.tierLabel} · {row.ratingLabel}
                    </span>
                    {row.isBeaten && (
                      <Badge tone={BadgeTone.SUCCESS}>
                        {statsTexts.byBot.beaten}
                      </Badge>
                    )}
                  </div>
                  <div
                    className='stats-bot-bar'
                    title={row.winRateLabel}
                    aria-hidden='true'
                  >
                    <span
                      className='stats-bot-bar-fill'
                      style={{ transform: `scaleX(${row.winRatio})` }}
                    />
                  </div>
                  <div className='stats-bot-figures'>
                    <span>{row.recordLabel}</span>
                    <span>{row.winRateLabel}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        className='stats-matches-card'
        title={statsTexts.recent.title}
        subtitle={statsTexts.recent.subtitle}
        isPadded={false}
      >
        {viewModel.hasRecentMatches ? (
          <ul className='stats-match-list'>
            {viewModel.recentMatchRows.map((row) => (
              <li key={row.matchId} className='stats-match-row'>
                <span className='stats-match-result'>
                  <Badge tone={RESULT_BADGE_TONE[row.result]}>
                    {row.resultLabel}
                  </Badge>
                </span>
                <div className='stats-match-opponent'>
                  {row.bot ? (
                    <BotAvatar
                      color={row.bot.color}
                      accent={row.bot.accent}
                      mood={row.bot.mood}
                      size='small'
                    />
                  ) : (
                    <Avatar name={row.opponentName} size={AvatarSize.MEDIUM} />
                  )}
                  <div className='stats-match-opponent-text'>
                    <span className='stats-match-opponent-name'>
                      {row.opponentName}
                    </span>
                    <span className='stats-match-meta'>
                      {row.opponentKindLabel} · {row.opponentEloLabel}
                    </span>
                  </div>
                </div>
                <span className='stats-match-score'>{row.scoreLabel}</span>
                <span
                  className={`stats-match-elo ${row.isEloGain ? 'stats-match-elo-gain' : 'stats-match-elo-loss'}`}
                >
                  {row.eloChangeLabel}
                </span>
                <span className='stats-match-time'>
                  <span>{row.playedAtLabel}</span>
                  <span className='stats-match-duration'>
                    {row.durationLabel}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<HistoryIcon />}
            title={statsTexts.recent.emptyTitle}
            description={statsTexts.recent.emptyDescription}
            action={
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.SMALL}
                onClick={() => navigate(PLAY_PATH)}
              >
                {statsTexts.recent.playNow}
              </Button>
            }
          />
        )}
      </Card>
    </PageContainer>
  );
};

export default Stats;

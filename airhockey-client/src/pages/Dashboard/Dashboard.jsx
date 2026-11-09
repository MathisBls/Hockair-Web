import React from 'react';

import { PageContainer } from '../../components/ui';

import ArcadeTeaserCard from './ArcadeTeaserCard';
import BeginnerTipsCard from './BeginnerTipsCard';
import BotLadderCard from './BotLadderCard';
import DailyChallengeCard from './DailyChallengeCard';
import HomeGreeting from './HomeGreeting';
import LeaderboardPreviewCard from './LeaderboardPreviewCard';
import NewsFeedCard from './NewsFeedCard';
import PlayHeroCard from './PlayHeroCard';
import TournamentsPreviewCard from './TournamentsPreviewCard';
import { useHomeProfile, useUpcomingTournaments } from './useHomeData';
import './Dashboard.css';

const Dashboard = () => {
  const profileRequest = useHomeProfile();
  const tournamentsRequest = useUpcomingTournaments();

  return (
    <PageContainer className='home-page'>
      <HomeGreeting profileRequest={profileRequest} />
      <div className='home-layout'>
        <div className='home-column-main'>
          <PlayHeroCard />
          <BotLadderCard />
          <ArcadeTeaserCard />
          <NewsFeedCard />
        </div>
        <aside className='home-column-side'>
          <DailyChallengeCard />
          <LeaderboardPreviewCard />
          <TournamentsPreviewCard tournamentsRequest={tournamentsRequest} />
          <BeginnerTipsCard />
        </aside>
      </div>
    </PageContainer>
  );
};

export default Dashboard;

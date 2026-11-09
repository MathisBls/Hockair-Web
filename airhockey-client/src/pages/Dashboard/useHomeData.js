import { useCallback, useEffect, useState } from 'react';

import {
  apiRequest,
  clearAuthToken,
  isAuthenticated,
} from '../../api/apiClient';

import {
  HomeApiPath,
  RequestStatus,
  TOURNAMENT_PREVIEW_LIMIT,
  TournamentStatus,
} from './homeData';

const VISIBLE_TOURNAMENT_STATUSES = [
  TournamentStatus.ONGOING,
  TournamentStatus.UPCOMING,
];

const getTournamentStartTime = (tournament) =>
  new Date(tournament.parameters?.startDate ?? 0).getTime();

const selectVisibleTournaments = (tournaments) =>
  (Array.isArray(tournaments) ? tournaments : [])
    .filter((tournament) =>
      VISIBLE_TOURNAMENT_STATUSES.includes(tournament.status)
    )
    .sort(
      (firstTournament, secondTournament) =>
        getTournamentStartTime(firstTournament) -
        getTournamentStartTime(secondTournament)
    )
    .slice(0, TOURNAMENT_PREVIEW_LIMIT);

const REJECTED_SESSION_STATUSES = [401, 403];

const useAuthenticatedRequest = (path, selectResult) => {
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState(isAuthenticated);
  const [requestState, setRequestState] = useState({
    status: isUserAuthenticated ? RequestStatus.LOADING : RequestStatus.IDLE,
    result: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isUserAuthenticated) {
      return undefined;
    }
    let isCancelled = false;
    const loadResult = async () => {
      setRequestState({ status: RequestStatus.LOADING, result: null });
      try {
        const payload = await apiRequest(path);
        if (!isCancelled) {
          setRequestState({
            status: RequestStatus.SUCCESS,
            result: selectResult(payload),
          });
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }
        if (REJECTED_SESSION_STATUSES.includes(error.status)) {
          clearAuthToken();
          setIsUserAuthenticated(false);
          setRequestState({ status: RequestStatus.IDLE, result: null });

          return;
        }
        setRequestState({ status: RequestStatus.ERROR, result: null });
      }
    };
    loadResult();

    return () => {
      isCancelled = true;
    };
  }, [path, selectResult, isUserAuthenticated, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { ...requestState, isUserAuthenticated, retry };
};

const selectProfile = (profile) => profile;

export const useHomeProfile = () =>
  useAuthenticatedRequest(HomeApiPath.USER_PROFILE, selectProfile);

export const useUpcomingTournaments = () =>
  useAuthenticatedRequest(HomeApiPath.TOURNAMENTS, selectVisibleTournaments);

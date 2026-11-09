import { useCallback, useEffect, useState } from 'react';

import { apiRequest, isAuthenticated } from '../../api/apiClient';

export const USER_PROFILE_PATH = '/api/users/profile';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(isAuthenticated());
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);

      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setProfile(await apiRequest(USER_PROFILE_PATH));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, isLoading, error, setProfile, reloadProfile: loadProfile };
};

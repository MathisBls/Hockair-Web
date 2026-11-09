import { useCallback, useEffect, useState } from 'react';

import { fetchCurrentUserProfile } from './friendsApi';
import { LoadStatus } from './socialConstants';

export const useRemoteList = (fetchItems) => {
  const [listState, setListState] = useState({
    status: LoadStatus.LOADING,
    items: [],
  });

  const reload = useCallback(async () => {
    try {
      const items = await fetchItems();
      setListState({ status: LoadStatus.READY, items });
    } catch {
      setListState((previousState) => ({
        status: LoadStatus.ERROR,
        items: previousState.items,
      }));
    }
  }, [fetchItems]);

  const retry = useCallback(() => {
    setListState((previousState) => ({
      status: LoadStatus.LOADING,
      items: previousState.items,
    }));
    reload();
  }, [reload]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...listState, reload, retry };
};

export const useCurrentUser = () => {
  const [profileState, setProfileState] = useState({
    status: LoadStatus.LOADING,
    currentUser: null,
  });

  useEffect(() => {
    let isCurrent = true;
    fetchCurrentUserProfile()
      .then((profile) => {
        if (isCurrent) {
          setProfileState({ status: LoadStatus.READY, currentUser: profile });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setProfileState({ status: LoadStatus.ERROR, currentUser: null });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return profileState;
};

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ id: Date.now(), message, type });
  }, []);

  return { toast, showToast };
};

export const useDebouncedValue = (value, delayInMs) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayInMs);

    return () => clearTimeout(timeoutId);
  }, [value, delayInMs]);

  return debouncedValue;
};

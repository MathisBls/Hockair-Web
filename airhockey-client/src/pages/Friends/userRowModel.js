import { buildAssetUrl } from '../../api/apiClient';
import { formatTranslation } from '../../i18n/formatTranslation';

export const buildUserRowModel = (user, friendsText) => {
  const username = user.username || friendsText.unknownUser;

  return {
    id: user._id,
    username,
    avatarUrl: buildAssetUrl(user.profilePicture),
    meta: formatTranslation(friendsText.userMeta, {
      elo: user.elo ?? '—',
      level: user.level ?? '—',
    }),
    moreActionsLabel: formatTranslation(friendsText.actions.more, {
      username,
    }),
  };
};

export const matchesUsernameFilter = (row, normalizedFilter) =>
  row.username.toLowerCase().includes(normalizedFilter);

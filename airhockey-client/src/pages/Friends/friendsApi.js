import { apiRequest, HttpMethod } from '../../api/apiClient';

export const fetchCurrentUserProfile = () => apiRequest('/api/users/profile');

export const fetchFriends = () => apiRequest('/api/friends/list');

export const fetchFriendRequests = () => apiRequest('/api/friends/requests');

export const fetchBlockedUsers = () => apiRequest('/api/friends/blocked');

export const searchUsers = (query) =>
  apiRequest(`/api/users/search?${new URLSearchParams({ query })}`);

export const sendFriendRequest = (recipientId) =>
  apiRequest('/api/friends/add', {
    method: HttpMethod.POST,
    body: { recipientId },
  });

export const acceptFriendRequest = (requesterId) =>
  apiRequest('/api/friends/accept', {
    method: HttpMethod.POST,
    body: { requesterId },
  });

export const declineFriendRequest = (requesterId) =>
  apiRequest('/api/friends/decline', {
    method: HttpMethod.POST,
    body: { requesterId },
  });

export const blockFriend = (friendId) =>
  apiRequest('/api/friends/block', {
    method: HttpMethod.POST,
    body: { friendId },
  });

export const unblockFriend = (friendId) =>
  apiRequest('/api/friends/unblock', {
    method: HttpMethod.POST,
    body: { friendId },
  });

export const deleteFriend = (friendId) =>
  apiRequest('/api/friends/delete', {
    method: HttpMethod.DELETE,
    body: { friendId },
  });

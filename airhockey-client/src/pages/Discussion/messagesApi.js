import { apiRequest, HttpMethod } from '../../api/apiClient';

export const fetchLatestMessages = () => apiRequest('/api/messages/latest');

export const fetchChatList = () => apiRequest('/api/messages');

export const fetchConversationMessages = (friendId) =>
  apiRequest(`/api/messages/${encodeURIComponent(friendId)}`);

export const postMessage = ({ receiverId, content }) =>
  apiRequest('/api/messages', {
    method: HttpMethod.POST,
    body: { receiverId, content },
  });

export const markMessagesAsRead = (friendId) =>
  apiRequest('/api/messages/read', {
    method: HttpMethod.PUT,
    body: { friendId },
  });

export const deleteMessage = (messageId) =>
  apiRequest(`/api/messages/${encodeURIComponent(messageId)}`, {
    method: HttpMethod.DELETE,
  });

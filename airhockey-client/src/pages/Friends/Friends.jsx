import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast/Toast';
import { useLanguage } from '../../../LanguageContext';
import {
  Person as FriendsIcon,
  PersonAdd as AddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import './Friends.css';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blockedFriends, setBlockedFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [userData, setUserData] = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });

  const { translations } = useLanguage();
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleMessage = (friendId) => {
    navigate(`/friends/chat/${friendId}`);
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      } else {
        showToast(translations.page.friendsRequest.errorFetchingFriends, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  };

  const handleDecline = async (requesterId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ requesterId }),
      });

      if (response.ok) {
        showToast(translations.page.friendsRequest.friendDeclinedSuccess, 'success');
        fetchRequests();
            } else {
        showToast(translations.page.friendsRequest.friendDeclinedError, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  };


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
            console.error('Failed to fetch user profile');
            showToast(translations.page.friendsRequest.errorFetchingUserProfile, 'error');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        showToast(translations.page.friendsRequest.errorFetchingRequests, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/search?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Filtrer pour exclure le pseudo de l'utilisateur actuel
        const filteredResults = data.filter((user) => user.username !== userData?.username);

        setSearchResults(filteredResults);
      } else {
        showToast(translations.page.friendsRequest.errorSearchingUsers, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  };


  const sendFriendRequest = async (userId) => {
    if (sentRequests.includes(userId)) {
      showToast(translations.page.friendsRequest.friendRequestAlreadySent, 'error');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (response.ok) {
        showToast(translations.page.friendsRequest.friendRequestSentSuccess, 'success');
        setSentRequests((prev) => [...prev, userId]);
      } else {
        showToast(translations.page.friendsRequest.friendRequestSentError, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  };

  const handleAccept = async (requesterId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ requesterId }),
      });

      if (response.ok) {
        showToast(translations.page.friendsRequest.friendAcceptedSuccess, 'success');
        fetchRequests();
        fetchFriends();
            } else {
        showToast(translations.page.friendsRequest.friendAcceptedError, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  };

  const handleBlock = async (friendId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        showToast(translations.page.friendsRequest.friendBlockedSuccess, 'success');
        fetchFriends();
      } else {
        showToast(translations.page.friendsRequest.friendBlockedError, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);


  // blocked
  const handleUnblock = async (friendId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/unblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        showToast(translations.page.friendsRequest.friendUnblockedSuccess, 'success');
        fetchBlockedFriends();
        fetchFriends();
      } else {
        showToast(translations.page.friendsRequest.friendUnblockedError, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchBlockedFriends();
    fetchRequests();
  }, []);

  const fetchBlockedFriends = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/blocked`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBlockedFriends(data);
      } else {
        showToast(translations.page.friendsRequest.errorFetchingBlockedFriends, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  }

  const handleDelete = async (friendId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ friendId }),
      });

      if (response.ok) {
        showToast(translations.page.friendsRequest.friendDeletedSuccess, 'success');
        fetchFriends();
      } else {
        showToast(translations.page.friendsRequest.friendDeletedError, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast(translations.page.friendsRequest.unexpectedError, 'error');
    }
  }

  return (
    <div className="friends-container">
      {toast.message && <Toast message={toast.message} type={toast.type} />}

      <div className="friends-tabs">
        <button
          className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <FriendsIcon />
        </button>
        <button
          className={`friends-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <AddIcon />
          {requests.length > 0 && <span className="notification-badge">{requests.length}</span>}
        </button>
        <button
          className={`friends-tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          <BlockIcon />
        </button>
      </div>

      <div className="friends-content">
        {activeTab === 'friends' && (
          <ul>
            {friends.map((friend) => (
              <li key={friend._id} className="friend-item">
                <div className="friend-details">
                  <p className="friend-name">{friend.username || translations.page.friendsRequest.unknown}</p>
                  <p className="friend-info">Elo: {friend.elo || 'N/A'}</p>
                  <p className="friend-info">{translations.page.friendsRequest.level}: {friend.level || 'N/A'}</p>
                </div>
                <div className="friend-actions">
                  <button className="action-button" onClick={() => handleMessage(friend._id)}>{translations.page.friendsRequest.message}</button>
                  <button className="action-button" onClick={() => handleBlock(friend._id)}>
                      {translations.page.friendsRequest.block}
                  </button>
                  <button className="action-button" onClick={() => handleDelete(friend._id)}>
                      {translations.page.friendsRequest.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'requests' && (
          <div>
            <input
              className="search-bar"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={translations.page.friendsRequest.searchPlaceholder}
            />
            <ul>
              {searchResults.map((user) => {
                const isFriend = friends.some((friend) => friend._id === user._id);
                const isPending = requests.some((req) => req.requesterId._id === user._id);
                const isBlocked = blockedFriends.some((blocked) => blocked._id === user._id);

                return (
                  <li key={user._id} className="friend-item">
                    <div className="friend-details">
                      <p className="friend-name">{user.username}</p>
                      <p className="friend-info">Elo: {user.elo}</p>
                      <p className="friend-info">{translations.page.friendsRequest.level}: {user.level}</p>
                    </div>
                    <div className="friend-actions">
                      {isFriend || isPending || isBlocked ? (
                        <CheckCircleIcon className="action-icon" />
                      ) : (
                        <button
                          className="action-button"
                          onClick={() => {
                            sendFriendRequest(user._id);
                            setSearchResults((prev) =>
                              prev.map((u) =>
                                u._id === user._id ? { ...u, status: 'pending' } : u
                              )
                            );
                          }}
                        >
                          <AddIcon />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <h3>{translations.page.friendsRequest.messageFriendRequest}</h3>
            <ul>
              {requests.map((req) => (
                <li key={req._id} className="friend-item">
                  <div className="friend-details">
                    <p className="friend-name">{req.requesterId?.username || translations.page.unknown}</p>
                    <p className="friend-info">Elo: {req.requesterId?.elo || 'N/A'}</p>
                    <p className="friend-info">{translations.page.friendsRequest.level}: {req.requesterId?.level || 'N/A'}</p>
                  </div>
                  <div className="friend-actions">
                    <button
                      className="accept-button"
                      onClick={() => handleAccept(req.requesterId._id)}
                    >
                      {translations.page.friendsRequest.accept}
                    </button>
                    <button
                      className="decline-button"
                      onClick={() => handleDecline(req.requesterId._id)}
                    >
                      {translations.page.friendsRequest.decline}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'blocked' && (
          <ul>
            {blockedFriends.map((friend) => (
              <li key={friend._id} className="friend-item">
                <div className="friend-details">
                  <p className="friend-name">{friend.username || translations.page.friendsRequest.unknown}</p>
                  <p className="friend-info">Elo: {friend.elo || 'N/A'}</p>
                  <p className="friend-info">{translations.page.friendsRequest.level}: {friend.level || 'N/A'}</p>
                </div>
                <div className="friend-actions">
                  <button
                    className="action-button"
                    onClick={() => handleUnblock(friend._id)}
                  >
                    <CheckCircleIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friends;

import React, { useEffect, useState } from 'react';
import {
  Home as HomeIcon,
  SportsEsports as GameIcon,
  Leaderboard as LeaderboardIcon,
  BarChart as StatsIcon,
  Settings as SettingsIcon,
  MonetizationOn as PremiumIcon,
  AccountCircle as ProfileIcon,
  EmojiEvents as TournamentIcon,
  Chat as ChatIcon,
  Store as ShopIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  GpsFixed as ChallengeIcon,
} from '@mui/icons-material';
import Logo from '../../assets/logo.png';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "../../../LanguageContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { translations } = useLanguage();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            console.error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <a href="/">
          <img src={Logo} alt="Logo" />
        </a>
        <h1>Hockair</h1>
      </div>

      {isLoggedIn && user ? (
        <div className="profile">
          <div className="profile-pic" onClick={() => navigate('/profile')}>
            {user.profilePicture ? (
              <img src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`} alt="Profile" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="profile-info">
            <h2 onClick={() => navigate('/profile')}>{truncateText(user.username, 14)}</h2>
            <div className="container-badgeupgrade">
              <div className="badge">Elo: <strong>{user.elo}</strong></div>
              <button className="upgrade" onClick={() => navigate('/subscriptions')}>{translations.sidebar.upgrade}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="profile">
          <div className="profile-pic">G</div>
          <div className="profile-info">
            <h2>Guest</h2>
          </div>
        </div>
      )}

      <ul className="menu">
        <li onClick={() => navigate('/')}>
          <p className="list-side">
            <HomeIcon /> {translations.sidebar.home}
          </p>
        </li>
        <li onClick={() => navigate('/play')}>
          <p className="list-side">
            <GameIcon /> {translations.sidebar.playOnline}
          </p>
        </li>
        <li onClick={() => navigate('/challenges')}>
          <p className="list-side">
            <ChallengeIcon /> {translations.sidebar.challenge}
          </p>
        </li>
        <li onClick={() => navigate('/leaderboard')}>
          <p className="list-side">
            <LeaderboardIcon /> {translations.sidebar.leaderboard}
          </p>
        </li>
        <li onClick={() => navigate('/stats')}>
          <p className="list-side">
            <StatsIcon /> {translations.sidebar.myStats}
          </p>
        </li>
        <li onClick={() => navigate('/tournaments')}>
          <p className="list-side">
            <TournamentIcon /> {translations.sidebar.tournaments}
          </p>
        </li>
      </ul>

      <h4 className="menu-title">{translations.sidebar.community}</h4>
      <ul className="menu">
        <li onClick={() => navigate('/friends/chat')}>
          <p className="list-side">
            <ChatIcon /> {translations.sidebar.chatWithFriends}
          </p>
        </li>
        <li onClick={() => navigate('/friends')}>
          <p className="list-side">
            <ProfileIcon /> {translations.sidebar.friendsList}
          </p>
        </li>
      </ul>

      <h4 className="menu-title">{translations.sidebar.extras}</h4>
      <ul className="menu">
        <li onClick={() => navigate('/shop')}>
          <p className="list-side">
            <ShopIcon /> {translations.sidebar.shop}
          </p>
        </li>
        <li onClick={() => navigate('/subscriptions')}>
          <p className="list-side">
            <PremiumIcon /> {translations.sidebar.premiumPlans}
          </p>
        </li>
        <li onClick={() => navigate('/settings')}>
          <p className="list-side">
            <SettingsIcon /> {translations.sidebar.settings}
          </p>
        </li>
        <hr></hr>
        {isLoggedIn ? (
          <li onClick={handleLogout}>
            <p className="list-side">
              <LogoutIcon /> {translations.sidebar.logout}
            </p>
          </li>
        ) : (
          <li onClick={() => navigate('/login')}>
            <p className="list-side">
              <LoginIcon /> {translations.sidebar.login}
            </p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;

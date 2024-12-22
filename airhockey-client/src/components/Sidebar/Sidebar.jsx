import React from 'react';
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
} from '@mui/icons-material';
import Logo from '../../assets/logo.png';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {

  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="sidebar">
      <div className="logo">
        <a href="/">
          <img src={Logo} alt="Logo" />
        </a>
      </div>

      <div className="profile">
        <div className="profile-pic">A</div>
        <div className="profile-info">
          <h2>HockMaster</h2>
          <div className="container-badgeupgrade">
            <div className="badge">Elo: <strong>1450</strong></div>
            <button className="upgrade" onClick={() => navigate('/premium')}>Upgrade</button>
          </div>
        </div>
      </div>

      <ul className="menu">
        <li onClick={() => navigate('/')}>
          <p className="list-side">
            <HomeIcon /> Dashboard
          </p>
        </li>
        <li onClick={() => navigate('/play')}>
          <p className="list-side">
            <GameIcon /> Play Online
          </p>
        </li>
        <li onClick={() => navigate('/leaderboard')}>
          <p className="list-side">
            <LeaderboardIcon /> Leaderboard
          </p>
        </li>
        <li onClick={() => navigate('/stats')}>
          <p className="list-side">
            <StatsIcon /> My Stats
          </p>
        </li>
        <li onClick={() => navigate('/tournaments')}>
          <p className="list-side">
            <TournamentIcon /> Tournaments
          </p>
        </li>
      </ul>

      {/* Améliorations et interactions */}
      <h4 className="menu-title">Community</h4>
      <ul className="menu">
        <li onClick={() => navigate('/chat')}>
          <p className="list-side">
            <ChatIcon /> Chat with Friends
          </p>
        </li>
        <li onClick={() => navigate('/friends')}>
          <p className="list-side">
            <ProfileIcon /> Friends List
          </p>
        </li>
      </ul>

      {/* Plus d'options */}
      <h4 className="menu-title">Extras</h4>
      <ul className="menu">
        <li onClick={() => navigate('/shop')}>
          <p className="list-side">
            <ShopIcon /> Shop
          </p>
        </li>
        <li onClick={() => navigate('/premium')}>
          <p className="list-side">
            <PremiumIcon /> Premium Plans
          </p>
        </li>
        <li onClick={() => navigate('/settings')}>
          <p className="list-side">
            <SettingsIcon /> Settings
          </p>
        </li>
        <hr></hr>
        {isLoggedIn ? (
          <li onClick={handleLogout}>
            <p className="list-side">
              <LogoutIcon /> Logout
            </p>
          </li>
        ) : (
          <li onClick={() => navigate('/login')}>
            <p className="list-side">
              <LoginIcon /> Login
            </p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;

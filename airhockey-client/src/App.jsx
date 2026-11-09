import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
  useLocation,
} from 'react-router-dom';

import { LanguageProvider } from '../LanguageContext';

import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar/Sidebar';
import Abonnements from './pages/Abonnements/Abonnements';
import ActivateAccount from './pages/ActivateAccount/ActivateAccount';
import Arcade from './pages/Arcade/Arcade';
import ArcadeGame from './pages/Arcade/ArcadeGame';
import Boutique from './pages/Boutique/Boutique';
import Challenge from './pages/Challenge/Challenge';
import ChoixLangue from './pages/ChoixLangue/ChoixLangue';
import Classement from './pages/Classement/Classement';
import Dashboard from './pages/Dashboard/Dashboard';
import Discussion from './pages/Discussion/Discussion';
import FriendsList from './pages/Friends/Friends';
import MessageFriend from './pages/Friends/MessageFriend';
import Login from './pages/Login/Login';
import Match from './pages/Match/Match';
import Parametres from './pages/Parametres/Parametres';
import Play from './pages/Play/Play';
import Profile from './pages/Profile/Profile';
import Register from './pages/Register/Register';
import Stats from './pages/Stats/Stats';
import Tournaments from './pages/Tournaments/Tournaments';

function App() {
  return (
    <LanguageProvider>
      <div id='root'>
        <Router>
          <Layout>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/' element={<Dashboard />} />
              <Route path='/arcade' element={<Arcade />} />
              <Route path='/arcade/:gameId' element={<ArcadeGame />} />
              <Route
                path='/shop'
                element={
                  <ProtectedRoute>
                    <Boutique />
                  </ProtectedRoute>
                }
              />
              <Route path='/language' element={<ChoixLangue />} />
              <Route
                path='/profile'
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path='/play' element={<Play />} />
              <Route path='/play/bot' element={<Match />} />
              <Route
                path='/gameplay-classic'
                element={<Navigate to='/play' replace />}
              />
              <Route
                path='/stats'
                element={
                  <ProtectedRoute>
                    <Stats />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/tournaments'
                element={
                  <ProtectedRoute>
                    <Tournaments />
                  </ProtectedRoute>
                }
              />
              <Route path='/activate/:token' element={<ActivateAccount />} />
              <Route
                path='/friends'
                element={
                  <ProtectedRoute>
                    <FriendsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/friends/chat'
                element={
                  <ProtectedRoute>
                    <Discussion />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/friends/chat/:id'
                element={
                  <ProtectedRoute>
                    <MessageFriend />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/challenges'
                element={
                  <ProtectedRoute>
                    <Challenge />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/leaderboard'
                element={
                  <ProtectedRoute>
                    <Classement />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/subscriptions'
                element={
                  <ProtectedRoute>
                    <Abonnements />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/settings'
                element={
                  <ProtectedRoute>
                    <Parametres />
                  </ProtectedRoute>
                }
              />
              <Route
                path='*'
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </div>
    </LanguageProvider>
  );
}

function Layout({ children }) {
  const location = useLocation();

  const isLoginPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/language' ||
    location.pathname.startsWith('/activate/') ||
    location.pathname.startsWith('/play/bot');
  const isGamePage =
    location.pathname.startsWith('/play') ||
    location.pathname.startsWith('/arcade/');

  return (
    <div className={`app-container ${isLoginPage ? 'no-sidebar' : ''}`}>
      {!isLoginPage && <Sidebar />}
      <div className='content-container'>
        {children}
        {!isLoginPage && !isGamePage && <Footer />}
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Boutique from './pages/Boutique/Boutique';
import Login from './pages/Login/Login';
import ChoixLangue from './pages/ChoixLangue/ChoixLangue';
import Profile from './pages/Profile/Profile';
import Stats from './pages/Stats/Stats';
import Tournaments from './pages/Tournaments/Tournaments';
import Register from './pages/Register/Register';
import FriendsList from './pages/Friends/Friends';
import MessageFriend from './pages/Friends/MessageFriend';
import Discussion from './pages/Discussion/Discussion';
import Challenge from './pages/Challenge/Challenge';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ActivateAccount from './pages/ActivateAccount/ActivateAccount';
// Gameplay
import Classic from './pages/Gameplay/Classic';

import { LanguageProvider } from '../LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div id="root">
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/shop" element={<ProtectedRoute><Boutique /></ProtectedRoute>} />
              <Route path="/language" element={<ChoixLangue />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/gameplay-classic" element={<ProtectedRoute><Classic /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
              <Route path="/activate/:token" element={<ActivateAccount />} />
              <Route path="/friends" element={<ProtectedRoute><FriendsList /></ProtectedRoute>} />
              <Route path="/friends/chat" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
              <Route path="/friends/chat/:id" element={<ProtectedRoute><MessageFriend /></ProtectedRoute>} />
              <Route path="/challenges" element={<ProtectedRoute><Challenge /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </LanguageProvider>
  );
}

function Layout({ children }) {
  const location = useLocation();

  const isLoginPage = location.pathname === '/login' ||
   location.pathname === '/register' || location.pathname === '/language'
    || location.pathname.startsWith('/activate/');

  return (
    <div className={`app-container ${isLoginPage ? 'no-sidebar' : ''}`}>
      {!isLoginPage && <Sidebar />}
      <div className="content-container">
        {children}
        {!isLoginPage && <Footer />}
      </div>
    </div>
  );
}

export default App;

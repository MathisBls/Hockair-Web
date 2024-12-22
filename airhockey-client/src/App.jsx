import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import Boutique from './pages/Boutique/Boutique';
import Login from './pages/Login/Login';
import ChoixLangue from './pages/ChoixLangue/ChoixLangue';
import Register from './pages/Register/Register';
import Footer from './components/Footer/Footer';

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
              <Route path="/" element={<Dashboard />} />
              <Route path="/shop" element={<Boutique />} />
              <Route path="/language" element={<ChoixLangue />} />
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
   location.pathname === '/register' || location.pathname === '/language';

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

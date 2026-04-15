import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import authService from './services/authService';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

/**
 * Main App component with routing
 */
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <>
      {isAuthenticated && (
        <header className="app-header">
          <div className="header-content">
            <h1>📊 Business Analytics System</h1>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
      )}

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            ) : (
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {isAuthenticated && (
        <footer className="footer">
          <p>© 2024 Business Analytics System. All rights reserved.</p>
        </footer>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

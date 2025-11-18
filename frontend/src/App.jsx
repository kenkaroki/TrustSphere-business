import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import Analytics from './pages/Analytics';
import Setup from './pages/Setup';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddMetrics from './pages/AddMetrics';
import Navbar from './components/Navbar'; // We will create this component

import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Main />
      </Router>
    </AuthProvider>
  );
};

const Main = () => {
  const location = useLocation();
  const showNavbar = !['/login', '/signup'].includes(location.pathname);

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      
      <div className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/add-metrics" element={<AddMetrics />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;

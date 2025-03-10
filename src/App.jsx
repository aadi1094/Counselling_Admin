import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Colleges from './pages/Colleges';
import Login from './pages/Login';

// Protected Route component to handle authentication
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    // Redirect to login if no token exists
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Login route */}
          <Route path='/' element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path='/colleges' 
            element={
              <ProtectedRoute>
                <Colleges />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path='/users' 
            element={
              <ProtectedRoute>
                <h1>Users Page - Coming Soon</h1>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

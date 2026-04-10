import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import { Login, Signup } from './pages/Auth';
import { CreateSociety, JoinSociety } from './pages/Society';
import Dashboard from './pages/dashboard/Dashboard';
import { PaymentSuccess, PaymentFailure } from './pages/PaymentResult';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/signup"         element={<Signup />} />
            <Route path="/create-society" element={<ProtectedRoute><CreateSociety /></ProtectedRoute>} />
            <Route path="/join-society"   element={<ProtectedRoute><JoinSociety /></ProtectedRoute>} />
            <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/payment/success"  element={<PaymentSuccess />} />
          <Route path="/payment/failure"  element={<PaymentFailure />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontSize:'13px', borderRadius:'8px' },
              success: { style: { background:'var(--bg-card)', color:'var(--text)', border:'1px solid var(--border)' } },
              error:   { style: { background:'var(--bg-card)', color:'var(--text)', border:'1px solid rgba(220,38,38,0.3)' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
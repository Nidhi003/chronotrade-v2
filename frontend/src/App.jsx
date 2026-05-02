import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

const Landing = lazy(() => import('./pages/Landing'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const JournalPage = lazy(() => import('./pages/Journal'));
const Auth = lazy(() => import('./pages/Auth'));
const Subscribe = lazy(() => import('./pages/Subscribe'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="size-8 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  return user ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <ToastProvider>
            <Router>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/subscribe" element={<Subscribe />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/journal" 
                    element={
                      <ProtectedRoute>
                        <JournalPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </ToastProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

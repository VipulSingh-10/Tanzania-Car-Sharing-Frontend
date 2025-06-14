
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RideBooking from './pages/RideBooking';
import RideOffering from './pages/RideOffering';
import RideTracking from './pages/RideTracking';
import MyRides from './pages/MyRides';
import Vehicles from './pages/Vehicles';
import Profile from './pages/Profile';
import TestMapPage from './pages/TestMapPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/test-map" element={<TestMapPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/book-ride" element={
                <ProtectedRoute>
                  <RideBooking />
                </ProtectedRoute>
              } />
              <Route path="/offer-ride" element={
                <ProtectedRoute>
                  <RideOffering />
                </ProtectedRoute>
              } />
              <Route path="/track-ride" element={
                <ProtectedRoute>
                  <RideTracking />
                </ProtectedRoute>
              } />
              <Route path="/find-rides" element={
                <ProtectedRoute>
                  <RideBooking />
                </ProtectedRoute>
              } />
              <Route path="/create-trip" element={
                <ProtectedRoute>
                  <RideOffering />
                </ProtectedRoute>
              } />
              <Route path="/my-rides" element={
                <ProtectedRoute>
                  <MyRides />
                </ProtectedRoute>
              } />
              <Route path="/vehicles" element={
                <ProtectedRoute>
                  <Vehicles />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

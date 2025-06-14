
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MobileLayout from "@/components/MobileLayout";
import MobileDashboard from "@/pages/MobileDashboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import RideBooking from "@/pages/RideBooking";
import RideOffering from "@/pages/RideOffering";
import RideTracking from "@/pages/RideTracking";
import MyRides from "@/pages/MyRides";
import Vehicles from "@/pages/Vehicles";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function MobileApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="mobile-app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <MobileDashboard />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <MobileDashboard />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-ride"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <RideBooking />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/find-rides"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <RideBooking />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/offer-ride"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <RideOffering />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-trip"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <RideOffering />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/track-ride"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <RideTracking />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-rides"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <MyRides />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <Vehicles />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <Profile />
                    </MobileLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

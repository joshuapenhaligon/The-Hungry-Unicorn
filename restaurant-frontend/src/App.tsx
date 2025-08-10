// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import AvailabilityPage from './pages/AvailabilityPage';
import BookingPage from './pages/BookingPage';
import LookupPage from './pages/LookupPage';
import DetailsPage from './pages/DetailsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Navbar stays at top */}
        <Navbar />

        {/* Main content flexes to center */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-4xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/availability" element={<AvailabilityPage />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/lookup" element={<LookupPage />} />
              <Route path="/booking/:ref" element={<DetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

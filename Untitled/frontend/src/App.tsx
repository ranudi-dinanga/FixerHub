import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatBot from "./components/chat/ChatBot";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import ProviderProfile from "./pages/ProviderProfile";
import Bookings from "./pages/Bookings";
import ServiceHistory from "./pages/ServiceHistory";
import ProviderDashboard from "./pages/ProviderDashboard";
import Navbar from "./components/layout/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import EmailVerification from "./pages/EmailVerification";
import Reviews from "./pages/Reviews";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";
import Bill from "./pages/Bill";
import CertificationUpload from "./components/certifications/CertificationUpload";
import PaymentsReceived from "./pages/PaymentsReceived";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <BookingProvider>
              <Routes>
                {/* Bill route without navbar and footer */}
                <Route path="/bill/:bookingId" element={<Bill />} />
                
                {/* All other routes with navbar and footer */}
                <Route path="/*" element={
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/provider/:id" element={<ProviderProfile />} />
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/service-history" element={<ServiceHistory />} />
                        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/verify-email" element={<EmailVerification />} />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/certifications/upload" element={<CertificationUpload />} />
                        <Route path="/payments-received" element={<PaymentsReceived />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
                      <div className="container mx-auto">
                        <p className="text-center text-gray-500 text-sm">
                          &copy; {new Date().getFullYear()} Fixerhub - FYP Project
                        </p>
                      </div>
                    </footer>
                  </div>
                } />
              </Routes>
            </BookingProvider>
          </AuthProvider>
        </BrowserRouter>
        
        <ChatBot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Make sure this is at the top level, not inside any block!
export default App;

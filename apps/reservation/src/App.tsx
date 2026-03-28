import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/next"
import Index from "./pages/Index";
import Login from "./pages/Login";

import ReservationList from "./pages/ReservationList";
import ReservationFormPage from "./pages/ReservationFormPage";
import ReservationChat from "./pages/ReservationChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reservations" element={<ReservationList />} />
            <Route path="/reservations/new" element={<ReservationFormPage />} />
            <Route path="/reservations/:id/chat" element={<ReservationChat />} />
            <Route path="/login" element={<Login />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    <Analytics />
  </QueryClientProvider>
  );
}

export default App;

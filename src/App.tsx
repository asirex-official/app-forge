import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Builder from "./pages/Builder.tsx";
import Docs from "./pages/Docs.tsx";
import Server from "./pages/Server.tsx";
import Studio from "./pages/Studio.tsx";
import Master from "./pages/Master.tsx";
import Projects from "./pages/Projects.tsx";
import Files from "./pages/Files.tsx";
import Admin from "./pages/Admin.tsx";
import Connect from "./pages/Connect.tsx";
import VisualEditOverlay from "./components/VisualEditOverlay.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/master" element={<Master />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/files" element={<Files />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/server" element={<Server />} />
          <Route path="/connect" element={<Connect />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <VisualEditOverlay />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import AppShell from './components/AppShell';
import ConnectPage from './pages/ConnectPage';
import SettingsPage from './pages/SettingsPage';
import LeadsPage from './pages/LeadsPage';
import CampaignsPage from './pages/CampaignsPage';
import QueuePage from './pages/QueuePage';
import LogsPage from './pages/LogsPage';

const PageTransitions = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.995 }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<ConnectPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <BrowserRouter>
    <AppShell>
      <PageTransitions />
    </AppShell>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);

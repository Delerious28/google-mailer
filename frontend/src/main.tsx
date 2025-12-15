import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import AppShell from './components/AppShell';
import ConnectPage from './pages/ConnectPage';
import SettingsPage from './pages/SettingsPage';
import LeadsPage from './pages/LeadsPage';
import CampaignsPage from './pages/CampaignsPage';
import QueuePage from './pages/QueuePage';
import LogsPage from './pages/LogsPage';

const App = () => (
  <BrowserRouter>
    <AppShell>
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Routes>
    </AppShell>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);

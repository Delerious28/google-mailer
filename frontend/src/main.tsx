import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './index.css';
import ConnectPage from './pages/ConnectPage';
import SettingsPage from './pages/SettingsPage';
import LeadsPage from './pages/LeadsPage';
import CampaignsPage from './pages/CampaignsPage';
import QueuePage from './pages/QueuePage';
import LogsPage from './pages/LogsPage';

const App = () => (
  <BrowserRouter>
    <div className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Mailer</h1>
        <nav className="space-x-4 text-sm text-gray-700">
          <Link to="/">Connect</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/leads">Leads</Link>
          <Link to="/campaigns">Campaigns</Link>
          <Link to="/queue">Queue</Link>
          <Link to="/logs">Logs</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<ConnectPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Routes>
    </div>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);

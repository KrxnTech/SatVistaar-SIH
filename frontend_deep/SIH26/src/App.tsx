import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import Workspace from './pages/Workspace';
import History from './pages/History';
import Reports from './pages/Reports';
import System from './pages/System';
import Settings from './pages/Settings';
import AuroraBackgroundDemo from './components/ui/aurora-background-demo';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Dashboard Console Chrome */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-analysis" element={<NewAnalysis />} />
          <Route path="workspace" element={<Workspace />} />
          <Route path="history" element={<History />} />
          <Route path="reports" element={<Reports />} />
          <Route path="system" element={<System />} />
          <Route path="models" element={<System />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Full-screen UI/UX Aurora Demo */}
        <Route path="aurora" element={<AuroraBackgroundDemo />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

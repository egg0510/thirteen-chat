import { lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const Plugins = lazy(() => import('./pages/Plugins'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));

export default function RoutesView() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/plugins" element={<Plugins />} />
      <Route path="/history" element={<History />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

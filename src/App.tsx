import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import RoutesView from './routes';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const loc = useLocation();
  const hideNav = loc.pathname === '/onboarding';
  return (
    <div className="app">
      <ErrorBoundary>
        <Suspense fallback={<div style={{padding:16}}>加载中...</div>}>
          <RoutesView />
        </Suspense>
      </ErrorBoundary>
      {!hideNav && <BottomNav />}
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logEvent } from '../utils/activityLogger';

type Card = { key: string; title: string; icon?: React.ReactNode; to: string; };

export const QuickActionsGrid: React.FC<{ cards: Card[] }> = ({ cards }) => {
  const nav = useNavigate();
  const go = (c: Card) => {
    logEvent('ui:navigate', { to: c.to, from: 'quick' });
    nav(c.to);
  };
  return (
    <div className="qa-grid card">
      {cards.map(c => (
        <button key={c.key} className="qa-card" onClick={() => go(c)} aria-label={c.title}>
          <div className="icon">{c.icon ?? '🔗'}</div>
          <div className="title">{c.title}</div>
        </button>
      ))}
    </div>
  );
};

export default QuickActionsGrid;

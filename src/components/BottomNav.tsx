import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: '主页' },
  { to: '/chat', label: '聊天' },
  { to: '/plugins', label: '插件' },
  { to: '/history', label: '历史' },
  { to: '/settings', label: '我的' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} className={({isActive}) => isActive ? 'active' : ''}>
          <span style={{display:'inline-block',padding:'8px 12px',borderRadius:12}}>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

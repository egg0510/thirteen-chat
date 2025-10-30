import React, { lazy, Suspense, useEffect, useState } from 'react';
import Bubble from '../components/Bubble';
const CalendarCard = lazy(() => import('../components/CalendarCard'));
const GreetingCard = lazy(() => import('../components/GreetingCard'));
const TasksPanel = lazy(() => import('../components/TasksPanel'));
import { initActivityLogger, logEvent } from '../utils/activityLogger';

export default function Home(){
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<{ temp?: number; code?: number }>();
  const [messages, setMessages] = useState<{ id: string; role: 'user'|'system'; content: string; ts: number }[]>([]);

  useEffect(() => { initActivityLogger(); }, []);

  const handleSubmit = (text: string) => {
    const id = typeof (crypto as any).randomUUID === 'function' ? (crypto as any).randomUUID() : String(Date.now());
    const msg: { id: string; role: 'user'|'system'; content: string; ts: number } = { id, role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [msg, ...prev]);
    logEvent('speech:send', { len: text.length });
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // 尝试读取缓存（10 分钟有效）
    try {
      const raw = localStorage.getItem('weather_yantai');
      if (raw) {
        const cached = JSON.parse(raw);
        if (Date.now() - (cached.ts || 0) < 10 * 60 * 1000) {
          setWeather(cached.data);
        }
      }
    } catch {}
    // Open-Meteo：无需密钥的实时天气
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.45&longitude=121.43&current=temperature_2m,weather_code&timezone=Asia/Shanghai')
      .then((r) => r.json())
      .then((d) => {
        const data = { temp: d?.current?.temperature_2m, code: d?.current?.weather_code };
        setWeather(data);
        try { localStorage.setItem('weather_yantai', JSON.stringify({ ts: Date.now(), data })); } catch {}
      })
      .catch(() => {/* 保持缓存或显示占位 */});
  }, []);

  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 · ${weekdays[now.getDay()]}`;
  const codeDesc = (c?: number) => {
    if (c == null) return '—';
    // 简化映射（拟物温润用语）
    if (c === 0) return '晴朗';
    if ([1,2,3].includes(c)) return '多云';
    if ([45,48].includes(c)) return '雾';
    if ([51,53,55].includes(c)) return '小雨';
    if ([61,63,65].includes(c)) return '中到大雨';
    if ([71,73,75].includes(c)) return '雪';
    if ([80,81,82].includes(c)) return '阵雨';
    if ([95,96,99].includes(c)) return '雷雨';
    return '天气良好';
  };
  const weatherStr = weather ? `${Math.round(weather.temp ?? 0)}°C · ${codeDesc(weather.code)}` : '—';
  const hour = now.getHours();
  const isDay = hour >= 6 && hour <= 18;
  const phase: 'dawn'|'day'|'dusk'|'night' = hour < 6 ? 'night' : hour < 9 ? 'dawn' : hour < 17 ? 'day' : hour < 20 ? 'dusk' : 'night';
  const weatherIcon = (c?: number) => {
    if (c == null) return '⛅';
    if (c === 0) return isDay ? '☀️' : '🌙';
    if ([1,2,3].includes(c)) return '⛅';
    if ([45,48].includes(c)) return '🌫️';
    if ([51,53,55].includes(c)) return '🌦️';
    if ([61,63,65].includes(c)) return '🌧️';
    if ([71,73,75].includes(c)) return '❄️';
    if ([80,81,82].includes(c)) return '🌦️';
    if ([95,96,99].includes(c)) return '⛈️';
    return '⛅';
  };
  const bubbleStyleTime = () => ({
    background:
      phase === 'dawn' ? 'radial-gradient(circle at 30% 30%, #ffe5b3, #f1bb62)'
      : phase === 'day' ? 'radial-gradient(circle at 30% 30%, #ffe699, #f5c45d)'
      : phase === 'dusk' ? 'radial-gradient(circle at 30% 30%, #ffd1a8, #e09c5a)'
      : 'radial-gradient(circle at 30% 30%, #ffdca8, #d8a24b)'
  });
  const bubbleStyleWeather = (c?: number) => ({
    background: c == null ? 'radial-gradient(circle at 30% 30%, #ffdfa8, #ff9c7a)'
      : [51,53,55,61,63,65,80,81,82].includes(c)
        ? (phase==='night' ? 'radial-gradient(circle at 30% 30%, #a9c9ff, #588de8)' : 'radial-gradient(circle at 30% 30%, #bfe0ff, #6fb5ff)')
        : [71,73,75].includes(c)
          ? (phase==='night' ? 'radial-gradient(circle at 30% 30%, #dfe8f7, #8da3c7)' : 'radial-gradient(circle at 30% 30%, #e7f0ff, #9fb7d9)')
          : [45,48].includes(c)
            ? 'radial-gradient(circle at 30% 30%, #eaeaea, #c9c9c9)'
            : phase==='night'
              ? 'radial-gradient(circle at 30% 30%, #c9bdf5, #7d6df0)'
              : 'radial-gradient(circle at 30% 30%, #ffe0a1, #ffb36b)'
  });
  const bubbleStyleDate = () => ({
    background:
      phase==='night' ? 'radial-gradient(circle at 30% 30%, #2e2e2e, #111)'
      : phase==='dawn' ? 'radial-gradient(circle at 30% 30%, #efefef, #d6d6d6)'
      : phase==='dusk' ? 'radial-gradient(circle at 30% 30%, #ededed, #d0d0d0)'
      : 'radial-gradient(circle at 30% 30%, #f0f0f0, #d9d9d9)'
  });

  return (
    <div className="section">
      <div className="header">
        <h2>Hi, 褚钰翔</h2>
        <div className="actions">
          <div className="pill">Search...</div>
          <div className="pill">Upgrade</div>
        </div>
      </div>
      <div className="grid cols-2">
        {/* 个性化问候卡（懒加载） */}
        <Suspense fallback={<div className="card"><div className="title"><span>加载中</span><span>...</span></div></div>}>
          <GreetingCard name="褚钰翔" timeStr={timeStr} weatherStr={weatherStr} phase={phase} />
        </Suspense>
        {/* <MultiModalInput onSubmit={handleSubmit} /> */}
        <div className="card tilt" onMouseMove={(e)=>{          const el = e.currentTarget as HTMLElement | null;
          if (!el) return;
          const rect = el.getBoundingClientRect?.();
          if (!rect) return;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rx = ((y/rect.height)-0.5)*6; // rotateX range ~±3deg
          const ry = ((x/rect.width)-0.5)*-6; // rotateY range ~±3deg
          el.style.setProperty('--rx', rx.toFixed(2)+'deg');
          el.style.setProperty('--ry', ry.toFixed(2)+'deg');
        }} onMouseLeave={(e)=>{
          const el = e.currentTarget as HTMLElement | null;
          if (!el) return;
          el.style.removeProperty('--rx');
          el.style.removeProperty('--ry');
        }}>
          <div className="title"><span>Your Mood Today</span><span>·</span></div>
          <div className="bubbles">
            {/* 时间球：自动适配尺寸/字体/主题 */}
            <Bubble className="yellow time" title="时间" value={timeStr} theme={bubbleStyleTime().background as string} style={{ right:'8%', top:'18%' }} />
            {/* 天气球：自动适配，包含图标 */}
            <Bubble className="red weather" title="天气（烟台）" value={`${weatherIcon(weather?.code)} ${weatherStr}`} theme={bubbleStyleWeather(weather?.code).background as string} style={{ left:'10%', bottom:'12%' }} />
            {/* 日期球：自动适配 */}
            <Bubble className="black date" title="日期" value={dateStr} theme={bubbleStyleDate().background as string} style={{ left:'40%', top:'10%' }} />
          </div>
        </div>
        <div className="card dark calendar">
          <span className="shine"/>
          <CalendarCard />
        </div>
        {/* 今日任务面板（懒加载） */}
        <Suspense fallback={<div className="card"><div className="title"><span>今日任务</span><span>加载中...</span></div></div>}>
          <TasksPanel />
        </Suspense>
        <div className="card">
          <div className="title"><span>My Habits</span><span>Add New +</span></div>
          <div className="habits">
            <div className="item"><span>Stretching</span><div className="progress"><i/></div></div>
            <div className="item"><span>Yoga</span><div className="progress"><i/></div></div>
            <div className="item"><span>Massage</span><div className="progress"><i/></div></div>
            <div className="item"><span>Ab exercises</span><div className="progress"><i/></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

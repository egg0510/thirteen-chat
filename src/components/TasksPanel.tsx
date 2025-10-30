import React, { useEffect, useRef, useState } from 'react';
import { app, ensureLogin } from '../tcb';
import { logEvent } from '../utils/activityLogger';

type Repeat = 'none' | 'daily' | 'weekly' | 'monthly'
type Task = {
  _id?: string;
  title: string;
  done?: boolean;
  due?: string; // YYYY-MM-DD
  remindAt?: string; // HH:MM
  repeat?: Repeat;
  order?: number; // list order
  _openid?: string;
};

export default function TasksPanel(){
  const [items, setItems] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [remindAt, setRemindAt] = useState(''); // HH:MM
  const [repeat, setRepeat] = useState<Repeat>('none');
  const [view, setView] = useState<'today'|'week'>('today');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const db = app.database();

  function fmtDay(d: Date){
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async function load(){
    await ensureLogin();
    const today = new Date();
    const _ = db.command;
    if (view === 'today'){
      const dayStr = fmtDay(today);
      const res = await db.collection('tasks').where({ due: dayStr }).get();
      const list: Task[] = (res.data as Task[]).sort((a,b)=> (a.order??0) - (b.order??0));
      setItems(list);
    } else {
      const start = new Date(today); start.setDate(today.getDate() - today.getDay()); // week start (Sun)
      const days: string[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start); d.setDate(start.getDate() + i);
        return fmtDay(d);
      });
      const res = await db.collection('tasks').where({ due: _.in(days) }).get();
      const list: Task[] = (res.data as Task[]).sort((a,b)=> {
        if ((a.due||'') === (b.due||'')) return (a.order??0) - (b.order??0);
        return (a.due||'').localeCompare(b.due||'');
      });
      setItems(list);
    }
  }

  async function addTask(){
    if (!input.trim()) return;
    await ensureLogin();
    const dayStr = fmtDay(new Date());
    const order = Date.now();
    await db.collection('tasks').add({ title: input.trim(), done: false, due: dayStr, remindAt, repeat, order });
    logEvent('task:add', { title: input.trim(), remindAt, repeat });
    setInput(''); setRemindAt(''); setRepeat('none');
    await load();

    // generate upcoming instances for repeat (lightweight, client-side)
    if (repeat !== 'none'){
      try{
        const adds: Task[] = [];
        for (let i=1; i<= (repeat==='daily'?3 : repeat==='weekly'?2 : 1); i++){
          const d = new Date();
          if (repeat==='daily') d.setDate(d.getDate()+i);
          else if (repeat==='weekly') d.setDate(d.getDate()+7*i);
          else if (repeat==='monthly') d.setMonth(d.getMonth()+i);
          adds.push({ title: input.trim(), done:false, due: fmtDay(d), remindAt, repeat, order: Date.now()+i });
        }
        if (adds.length){ await db.collection('tasks').add(adds as any); }
      }catch(e){ /* ignore */ }
    }
  }

  async function toggleDone(t: Task){
    if (!t._id) return;
    await ensureLogin();
    await db.collection('tasks').doc(t._id).update({ done: !t.done });
    logEvent('task:done', { id: t._id, title: t.title, done: !t.done });
    await load();
  }

  // Drag & drop reordering
  function onDragStart(idx: number){ setDragIndex(idx); }
  function onDragOver(e: React.DragEvent<HTMLLIElement>, overIdx: number){ e.preventDefault(); }
  async function onDrop(overIdx: number){
    if (dragIndex == null || dragIndex === overIdx) { setDragIndex(null); return; }
    const next = items.slice();
    const [moved] = next.splice(dragIndex,1);
    next.splice(overIdx,0,moved);
    setItems(next);
    setDragIndex(null);
    logEvent('task:reorder', { from: dragIndex, to: overIdx });
    await ensureLogin();
    // persist new order as sequential integers for current view set
    const batch = db.collection('tasks');
    for (let i=0;i<next.length;i++){
      const it = next[i];
      if (it._id) await batch.doc(it._id).update({ order: i });
    }
  }

  // Local reminder notifications when app is open
  useEffect(() => {
    // ask permission once
    if (typeof Notification !== 'undefined' && Notification.permission === 'default'){
      Notification.requestPermission().catch(()=>{});
    }
  }, []);

  useEffect(() => {
    // clear previous timers
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];
    const todayStr = fmtDay(new Date());
    items.forEach(t => {
      if (t.done) return;
      if (t.due !== todayStr) return;
      if (!t.remindAt) return;
      const [hh, mm] = t.remindAt.split(':').map(n=>parseInt(n,10));
      const now = new Date();
      const target = new Date(); target.setHours(hh, mm, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff > 500){
        const id = window.setTimeout(() => {
          const msg = `提醒：${t.title} (${t.remindAt})`;
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted'){
            new Notification('日程提醒', { body: msg });
          } else {
            alert(msg);
          }
        }, diff);
        timersRef.current.push(id);
      }
    });
    return () => { timersRef.current.forEach(id => window.clearTimeout(id)); timersRef.current = []; };
  }, [items]);

  useEffect(() => { load(); }, [view]);

  return (
    <div className="card tasks">
      <div className="title"><span>{view==='today'? '今日任务':'本周任务'}</span>
        <span>{items.filter(i=>!i.done).length} 未完成</span></div>
      <div className="task-input">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="添加一个待办..." />
        <input type="time" value={remindAt} onChange={e=>setRemindAt(e.target.value)} />
        <select value={repeat} onChange={e=>setRepeat(e.target.value as Repeat)}>
          <option value="none">不重复</option>
          <option value="daily">每天</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
        </select>
        <button onClick={addTask}>添加</button>
      </div>
      <div className="task-tabs">
        <button className={view==='today'? 'active':''} onClick={()=>setView('today')}>今日</button>
        <button className={view==='week'? 'active':''} onClick={()=>setView('week')}>本周</button>
      </div>
      <ul className="list tasks-list">
        {items.map((t, idx)=> (
          <li key={t._id||idx} className={[t.done? 'done':'', dragIndex===idx? 'dragging':'', 'draggable'].filter(Boolean).join(' ')}
              draggable
              onDragStart={()=>onDragStart(idx)}
              onDragOver={(e)=>onDragOver(e, idx)}
              onDrop={()=>onDrop(idx)}>
            <input type="checkbox" checked={!!t.done} onChange={()=>toggleDone(t)} />
            <span>{t.title}</span>
            {t.remindAt ? <em className="remind">{t.remindAt}</em> : null}
            {t.repeat && t.repeat!=='none' ? <em className="remind">{t.repeat==='daily'? '每天': t.repeat==='weekly'? '每周':'每月'}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

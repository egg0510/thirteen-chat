import React, { useEffect, useMemo, useState } from 'react';
import { ActivityEvent, getEvents, subscribe } from '../utils/activityLogger';

type Filter = {
  type: string | 'all';
  from?: number;
  to?: number;
};

const TYPES = [
  { value: 'all', label: '全部' },
  { value: 'task:add', label: '新增任务' },
  { value: 'task:done', label: '完成任务' },
  { value: 'speech:start', label: '语音开始' },
  { value: 'speech:send', label: '语音发送' },
  { value: 'ui:navigate', label: '页面跳转' },
  { value: 'task:reorder', label: '任务排序' },
];

export const ActivityLogPanel: React.FC = () => {
  const [list, setList] = useState<ActivityEvent[]>(getEvents());
  const [filter, setFilter] = useState<Filter>({ type: 'all' });

  useEffect(() => {
    const off = subscribe(setList);
    return off;
  }, []);

  const filtered = useMemo(() => {
    return list
      .filter(ev => filter.type === 'all' ? true : ev.type === filter.type)
      .filter(ev => (filter.from ? ev.ts >= filter.from : true))
      .filter(ev => (filter.to ? ev.ts <= filter.to : true))
      .slice()
      .sort((a,b) => b.ts - a.ts);
  }, [list, filter]);

  return (
    <div className="card activity-panel">
      <div className="panel-header">
        <h3>实时活动日志</h3>
        <div className="filters">
          <select
            value={filter.type}
            onChange={e => setFilter(f => ({ ...f, type: e.target.value as any }))}
          >
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input type="datetime-local"
            onChange={e => setFilter(f => ({ ...f, from: e.target.value ? new Date(e.target.value).getTime() : undefined }))}
          />
          <input type="datetime-local"
            onChange={e => setFilter(f => ({ ...f, to: e.target.value ? new Date(e.target.value).getTime() : undefined }))}
          />
        </div>
      </div>
      <div className="panel-actions">
        <button className="export" onClick={() => downloadJSON(filtered)}>导出 JSON</button>
        <button className="export" onClick={() => downloadCSV(filtered)}>导出 CSV</button>
      </div>
      <div className="timeline">
        {filtered.map(ev => (
          <div className="item" key={ev.id}>
            <div className="dot" />
            <div className="meta">
              <div className="line1">
                <span className="type">{ev.type}</span>
                <span className="time">{new Date(ev.ts).toLocaleString()}</span>
              </div>
              {ev.payload && <div className="payload">{renderPayload(ev)}</div>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty">暂无记录</div>}
      </div>
    </div>
  );
};

function renderPayload(ev: ActivityEvent) {
  try {
    const text = typeof ev.payload === 'string' ? ev.payload : JSON.stringify(ev.payload);
    return <pre>{text}</pre>;
  } catch {
    return null;
  }
}

function downloadJSON(list: ActivityEvent[]){
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `activity_${Date.now()}.json`; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function downloadCSV(list: ActivityEvent[]){
  const header = ['id','ts','type','payload'];
  const rows = list.map(ev => {
    const payload = (()=>{ try{ return JSON.stringify(ev.payload ?? ''); }catch{ return ''; } })();
    return [ev.id, new Date(ev.ts).toISOString(), ev.type, payload]
      .map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',');
  });
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `activity_${Date.now()}.csv`; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

export default ActivityLogPanel;

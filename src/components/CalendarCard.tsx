import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

// 节假日集合（JS版本，不使用 TS 泛型）
const HOLIDAYS = new Set([
  '2025-01-01', // 元旦
  '2025-02-01', '2025-02-02', '2025-02-03', // 春节示例（占位）
  '2025-04-05', // 清明
  '2025-05-01', // 劳动节
  '2025-06-01', // 儿童节
  '2025-10-01', '2025-10-02', '2025-10-03', // 国庆
]);

function buildMonth(year: number, month: number){
  const start = dayjs().year(year).month(month).startOf('month');
  const end = dayjs().year(year).month(month).endOf('month');
  const days: any[] = [];
  // 前导空位到周一
  const leading = (start.day() + 6) % 7; // 把周日(0)变为6，周一(1)变为0
  for(let i=leading; i>0; i--){
    const d = start.subtract(i, 'day');
    days.push({ date:d, inMonth:false });
  }
  // 当月
  for(let d=0; d<end.date(); d++){
    const cur = start.add(d, 'day');
    days.push({ date:cur, inMonth:true });
  }
  // 补齐到整周
  while(days.length % 7 !== 0){
    const last = days[days.length-1].date.add(1,'day');
    days.push({ date:last, inMonth:false });
  }
  return days;
}

export default function CalendarCard(){
  const now = dayjs();
  const [cur,setCur] = useState(now);
  const days = useMemo(()=> buildMonth(cur.year(), cur.month()), [cur]);
  const monthLabel = cur.format('MMMM');

  const prev = () => setCur(cur.subtract(1,'month'));
  const next = () => setCur(cur.add(1,'month'));

  return (
    <>
      <div className="title"><span>Your Training Days</span><span>{monthLabel}</span></div>
      <div className="calendar-grid">
        <div className="cal-head">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(w=> <span key={w}>{w}</span>)}
        </div>
        <div className="cal-body">
          {days.map((d:any,i:number)=>{
            const key = d.date.format('YYYY-MM-DD');
            const isHoliday = HOLIDAYS.has(key);
            const isWeekend = [6,0].includes(d.date.day());
            const today = dayjs().format('YYYY-MM-DD')===key;
            return (
              <div key={key+i} className={`cal-cell ${d.inMonth?'in':''} ${isWeekend?'weekend':''} ${isHoliday?'holiday':''} ${today?'today':''}`}>
                <span className="num">{d.date.date()}</span>
                {isHoliday && <span className="tag">假</span>}
              </div>
            );
          })}
        </div>
        <div className="cal-actions">
          <button onClick={prev}>上一月</button>
          <button onClick={next}>下一月</button>
        </div>
      </div>
    </>
  );
}

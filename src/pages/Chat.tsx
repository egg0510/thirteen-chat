import { useState } from 'react';
import { useApp } from '../store/useApp';
import { useChatStream } from '../hooks/useChatStream';

export default function Chat(){
  const { model, vad } = useApp();
  const [text,setText] = useState('');
  const [messages,setMessages] = useState<any[]>([
    { id:'m1', role:'assistant', content:'今天心情如何？我在阳台等你喝茶。', time:'21:30' },
    { id:'m2', role:'user', content:'有点累，想听你拉琴。', time:'21:31' },
  ]);
  const [streamingId,setStreamingId] = useState<string|undefined>();
  const { start, stop } = useChatStream();

  const send = async () => {
    if(!text.trim() || streamingId) return;
    const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const userMsg = { id:crypto.randomUUID(), role:'user', content:text, time: now };
    setMessages(prev => [...prev, userMsg]);
    setText('');

    const sid = crypto.randomUUID();
    setStreamingId(sid);
    const assistantMsg = { id:sid, role:'assistant', content:'', time: now, streaming:true };
    setMessages(prev => [...prev, assistantMsg]);

    const payload = { messages: [...messages, userMsg], params:{ location:{ city:'苏州' } } };
    start(
      payload,
      (delta) => setMessages(prev => prev.map(m => m.id===sid ? { ...m, content: m.content + delta } : m)),
      (meta) => { setMessages(prev => prev.map(m => m.id===sid ? { ...m, streaming:false, meta } : m)); setStreamingId(undefined); },
      (err) => { setMessages(prev => prev.map(m => m.id===sid ? { ...m, streaming:false, error: err } : m)); setStreamingId(undefined); }
    );
  };

  return (
    <div className="section chat">
      <div className="card chat-card">
        <div className="chat-header">
          <div className="persona">
            <div className="avatar sm">十三</div>
            <div>
              <strong>林疏月（十三）</strong>
              <div className="meta">温柔 · 含蓄 · 偶尔毒舌｜模型 {model} {streamingId? '｜正在输入…':''}</div>
            </div>
          </div>
          <div style={{width:160}} className="vadbar"><i/></div>
        </div>
        <div className="chat-messages">
          {messages.map((m:any,i)=> (
            <div key={m.id||i} className={`msg ${m.role}`}>
              <div className="avatar">{m.role==='assistant'?'十三':'我'}</div>
              <div>
                <div className={`bubble ${m.role}`}>{m.content || (m.streaming ? '…' : '')}</div>
                <div className="meta">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} placeholder="说点什么..." />
          <button onClick={send} disabled={!!streamingId}>发送</button>
        </div>
      </div>
    </div>
  );
}

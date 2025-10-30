import { useState, useEffect, useRef } from 'react';
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
  const [showTyping, setShowTyping] = useState(false);
  const listRef = useRef<HTMLDivElement|null>(null);
  const { start, stop } = useChatStream();

  const send = async () => {
    if(!text.trim() || streamingId) return;
    const now = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const userMsg = { id:crypto.randomUUID(), role:'user', content:text, time: now };
    setMessages(prev => [...prev, userMsg]);
    setText('');

    const sid = crypto.randomUUID();
    setStreamingId(sid);
    // 显示AI打字指示器，稍后移除
    setShowTyping(true);
    const assistantMsg = { id:sid, role:'assistant', content:'', time: now, streaming:true };
    setMessages(prev => [...prev, assistantMsg]);

    const payload = { messages: [...messages, userMsg], params:{ location:{ city:'苏州' } } };
    start(
      payload,
      (delta) => { setShowTyping(false); setMessages(prev => prev.map(m => m.id===sid ? { ...m, content: (m.content || '') + delta } : m)); },
      (meta) => { setMessages(prev => prev.map(m => m.id===sid ? { ...m, streaming:false, meta } : m)); setStreamingId(undefined); setShowTyping(false); },
      (err) => { setMessages(prev => prev.map(m => m.id===sid ? { ...m, streaming:false, error: err } : m)); setStreamingId(undefined); setShowTyping(false); }
    );
  };

  // 自动滚动到底部（新增消息或指示器变化时）
  useEffect(()=>{
    const el = listRef.current; if(!el) return; el.scrollTop = el.scrollHeight;
  }, [messages, showTyping]);

  return (
    <div className="section chat">
      <div className="card chat-card">
        <div className="chat-header">
          <div className="persona">
            <div className="avatar sm">十三</div>
            <div>
              <strong>褚钰翔（十三）</strong>
              <div className="meta">温柔 · 含蓄 · 偶尔毒舌｜模型 {model} {streamingId? '｜正在输入…':''}</div>
            </div>
          </div>
          <div style={{width:160}} className="vadbar"><i/></div>
        </div>
        <div className="chat-messages" ref={listRef}>
          {messages.map((m:any,i)=> (
            <div key={m.id||i} className={`msg ${m.role}`}>
              <div className="avatar">{m.role==='assistant'?'十三':'我'}</div>
              <div>
                <div className={`bubble ${m.role}`}>
                  <div className="content">{m.content || (m.streaming ? '…' : '')}</div>
                </div>
                <div className="meta">{m.time}</div>
              </div>
            </div>
          ))}
          {showTyping && (
            <div className="msg assistant">
              <div className="avatar">十三</div>
              <div>
                <div className="bubble assistant">
                  <div className="content typing"><span>正在思考</span><span className="dots" aria-label="AI正在输入"><i/><i/><i/></span></div>
                </div>
                <div className="meta">…</div>
              </div>
            </div>
          )}
        </div>
        <div className="chat-input">
          <input value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="输入消息…（Enter 发送，Shift+Enter 换行）" />
          <button onClick={send} disabled={!!streamingId || !text.trim()}>{streamingId? '回答中…':'发送'}</button>
        </div>
      </div>
    </div>
  );
}

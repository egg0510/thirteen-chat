import { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/useApp';
import { useChatStream } from '../hooks/useChatStream';

export default function Chat(){
  const { model, vad } = useApp();
  const [text,setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement|null>(null);
  const inputRef = useRef<HTMLInputElement|null>(null);
  const [messages,setMessages] = useState<any[]>([]);
  const [streamingId,setStreamingId] = useState<string|undefined>();
  const [showTyping, setShowTyping] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
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
    const el = listRef.current; if(!el) return; if(atBottom) el.scrollTop = el.scrollHeight;
  }, [messages, showTyping, atBottom]);

  // iOS/移动端键盘适配：跟随键盘高度增加底部占位，保持消息可见
  useEffect(()=>{
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    if(!vv) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height);
      document.documentElement.style.setProperty('--kb-offset', offset + 'px');
      // 保持视图在底部，避免键盘遮挡
      const el = listRef.current; if(!el) return; el.scrollTop = el.scrollHeight;
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, []);

  // 文本域自动高度
  useEffect(()=>{
    const ta = textareaRef.current; if(!ta) return;
    ta.style.height = 'auto';
    const next = Math.min(200, ta.scrollHeight);
    ta.style.height = next + 'px';
  }, [text]);

  // 监听滚动，决定是否显示“回到最新”
  useEffect(()=>{
    const el = listRef.current; if(!el) return;
    const onScroll = () => {
      const threshold = 24;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
      setAtBottom(nearBottom);
    };
    el.addEventListener('scroll', onScroll);
    onScroll();
    return ()=> el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="section chat chat-full">
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
          {messages.map((m:any,i)=> {
            const prev = messages[i-1];
            const continued = prev && prev.role === m.role;
            return (
              <div key={m.id||i} className={`msg ${m.role} ${continued ? 'continued' : ''}`}>
                {!continued && <div className="avatar">{m.role==='assistant'?'十三':'我'}</div>}
                <div>
                  <div className={`bubble ${m.role}`}>
                    <div className="content">{m.content || (m.streaming ? '…' : '')}</div>
                  </div>
                  <div className="meta">{m.time}</div>
                </div>
              </div>
            );
          })}
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
        {!atBottom && (
          <button className="scroll-latest" onClick={()=>{ const el=listRef.current; if(el){ el.scrollTop = el.scrollHeight; } }}>
            回到最新 ↓
          </button>
        )}
        <div className="chat-input">
          <input ref={inputRef} value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} onFocus={()=>{ const el=listRef.current; if(el){ setTimeout(()=>{ el.scrollTop = el.scrollHeight; }, 0); } }} onBlur={()=>{ document.documentElement.style.setProperty('--kb-offset','0px'); }} placeholder="输入消息…（Enter 发送，Shift+Enter 换行）" />
          <button onClick={send} disabled={!!streamingId || !text.trim()}>{streamingId? '回答中…':'发送'}</button>
        </div>
      </div>
    </div>
  );
}

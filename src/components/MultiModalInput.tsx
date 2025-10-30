import React, { useEffect, useMemo, useRef, useState } from 'react';
import { logEvent } from '../utils/activityLogger';

type Props = {
  onSubmit: (text: string) => void;
  emojiList?: string[];
  placeholder?: string;
};

export const MultiModalInput: React.FC<Props> = ({
  onSubmit,
  emojiList = ['😀','😂','😊','🤔','👍','🔥','🎉','❤️','🌟','⚡','📌','✅'],
  placeholder = '说点什么…（可语音输入）'
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<string[]>(()=>{
    try{ const raw = localStorage.getItem('emoji_order_v1'); if(raw) return JSON.parse(raw); }catch{}
    return emojiList;
  });
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const supported = useMemo(() => {
    return typeof window !== 'undefined' && (
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }, []);

  useEffect(() => {
    if (!supported) return;
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += transcript;
        }
      }
      if (finalText) {
        setInput(prev => (prev ? prev + ' ' : '') + finalText.trim());
      }
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    return () => {
      try { rec.abort(); } catch {}
      recognitionRef.current = null;
    };
  }, [supported]);

  const toggleRecord = () => {
    if (!supported) {
      alert('当前浏览器不支持语音识别，请手动输入。');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start?.();
        setIsRecording(true);
        logEvent('speech:start');
      } catch {
        alert('无法启动语音识别，请检查麦克风权限。');
      }
    }
  };

  useEffect(()=>{ try{ localStorage.setItem('emoji_order_v1', JSON.stringify(order)); }catch{} }, [order]);

  const insertEmoji = (emo: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const next = input.slice(0, start) + emo + input.slice(end);
    setInput(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emo.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    onSubmit(text);
    logEvent('speech:send', { len: text.length });
    setInput('');
  };

  return (
    <div className="card mm-input">
      <div className={`mm-toolbar ${isRecording ? 'rec' : ''}`}>
        <button className="mic" onClick={toggleRecord} aria-pressed={isRecording}>
          {isRecording ? '停止' : '语音'}
        </button>
        {!supported && <span className="hint">浏览器不支持语音识别</span>}
      </div>
      <textarea
        ref={inputRef}
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
      />
      <div className="emoji-bar" role="list">
        {order.map(e => (
          <button key={e} className="emoji" onClick={() => insertEmoji(e)} role="listitem" aria-label={e}>
            {e}
          </button>
        ))}
        <button className="emoji more" onClick={()=>setPanelOpen(true)} aria-label="更多表情">＋</button>
      </div>
      {panelOpen && (
        <div className="emoji-panel">
          <div className="panel-head">
            <input placeholder="搜索表情…" value={query} onChange={e=>setQuery(e.target.value)} />
            <button onClick={()=>setPanelOpen(false)}>关闭</button>
          </div>
          <div className="panel-body" onDragOver={(e)=>e.preventDefault()}>
            {order.filter(e=> e.includes(query)).map((e, idx) => (
              <button key={e}
                className="emoji draggable"
                draggable
                onDragStart={(ev)=>{ ev.dataTransfer.setData('text/plain', String(idx)); }}
                onDrop={(ev)=>{ const from = parseInt(ev.dataTransfer.getData('text/plain'),10); const to = idx; if(isNaN(from)) return; const next=order.slice(); const [mv]=next.splice(from,1); next.splice(to,0,mv); setOrder(next);} }
                onClick={()=>insertEmoji(e)}
              >{e}</button>
            ))}
          </div>
        </div>
      )}
      <div className="mm-actions">
        <button className="primary" onClick={handleSubmit}>发送</button>
      </div>
    </div>
  );
};

export default MultiModalInput;

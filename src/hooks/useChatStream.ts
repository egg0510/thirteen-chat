import { useRef } from 'react';

export function useChatStream() {
  const esRef = useRef<EventSource | null>(null);

  const start = (payload: any, onDelta: (t:string)=>void, onDone:(meta:any)=>void, onError:(msg:string)=>void) => {
    const url = `/api/llm/stream?q=${encodeURIComponent(JSON.stringify(payload))}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (e) => {
      try{
        const data = JSON.parse(e.data);
        if (data.type === 'delta') onDelta(data.content);
        else if (data.type === 'done') { onDone(data.meta); es.close(); esRef.current = null; }
        else if (data.type === 'error') { onError(data.message); es.close(); esRef.current = null; }
      } catch(err){ onError('解析错误'); es.close(); esRef.current = null; }
    };
    es.onerror = () => { onError('网络错误'); es.close(); esRef.current = null; };
    return () => { es.close(); esRef.current = null; };
  };

  const stop = () => { if (esRef.current) { esRef.current.close(); esRef.current = null; } };

  return { start, stop };
}

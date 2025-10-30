import React from 'react';

type Msg = { id: string; role: 'user'|'system'; content: string; ts: number };

export const MessagesList: React.FC<{ messages: Msg[] }>=({ messages })=>{
  const list = messages.slice(0, 20);
  return (
    <div className="card msgs-list">
      <div className="title"><span>消息预览</span><span>{list.length} 条</span></div>
      <ul className="msgs">
        {list.length === 0 && <li className="empty">暂无消息</li>}
        {list.map(m => (
          <li key={m.id} className={m.role}>
            <div className="content">{m.content}</div>
            <div className="meta">{new Date(m.ts).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessagesList;

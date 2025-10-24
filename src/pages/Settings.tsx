import { useState } from 'react';
import { useApp } from '../store/useApp';

export default function Settings(){
  const { model, setModel } = useApp();
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('https://api.deepseek.com');

  const save = async () => {
    const { secretsApi } = await import('../lib/api');
    const resp = await secretsApi.save({ endpoint, key: apiKey, model });
    const test = await secretsApi.test();
    alert(test.data.ok ? '保存成功，测试通过' : '已保存，但测试未通过，请检查端点/模型');
  };

  return (
    <div className="section">
      <div className="header"><h2>设置</h2><div className="actions"><div className="pill">测试连通性</div></div></div>
      <div className="card form">
        <div className="title"><span>DeepSeek 设置</span><span className="badge">安全存储</span></div>
        <div className="fields">
          <label>API 基础地址</label>
          <input value={endpoint} onChange={e=>setEndpoint(e.target.value)} placeholder="https://api.deepseek.com" />
          <label>API 密钥</label>
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} type="password" placeholder="sk-..." />
          <label>模型选择</label>
          <select value={model} onChange={(e)=>setModel(e.target.value)}>
            <option value="DeepSeek-Chat">DeepSeek-Chat</option>
            <option value="DeepSeek-R1">DeepSeek-R1</option>
          </select>
        </div>
        <div className="actions" style={{marginTop:12}}>
          <button onClick={save} className="primary">保存并测试</button>
        </div>
      </div>
      <div className="card">
        <div className="title"><span>提示模板微调（需审核）</span><span className="badge">流程</span></div>
        <p className="muted">支持预览与提交，后台审核通过后落入人设模板。</p>
      </div>
    </div>
  );
}

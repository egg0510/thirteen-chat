export default function Plugins(){
  return (
    <div className="section">
      <div className="header">
        <h2>插件中心</h2>
        <div className="actions"><div className="pill">管理</div></div>
      </div>
      <div className="grid cols-2">
        <div className="card plugin-card">
          <div className="title"><span>天气</span><span className="badge">AMap</span></div>
          <div className="plugin-body">
            <div className="temperature">22°</div>
            <div className="muted">多云微风 · 苏州</div>
          </div>
        </div>
        <div className="card dark plugin-card">
          <div className="title"><span>日历</span><span className="badge">June</span></div>
          <div className="plugin-body">
            <div className="muted">深色卡占位 · 计划与完成标记</div>
          </div>
        </div>
        <div className="card plugin-card">
          <div className="title"><span>待办</span><span className="badge">4项</span></div>
          <ul className="list">
            <li><i/> 购买琴弦</li>
            <li><i/> 备课绘本</li>
            <li><i/> 带孩子写生</li>
            <li><i/> 晚上拉《起风了》</li>
          </ul>
        </div>
        <div className="card plugin-card">
          <div className="title"><span>备忘录</span><span className="badge">近期</span></div>
          <div className="notes">
            <div className="note">“你为玫瑰花费的时间，才让她变得珍贵。”</div>
            <div className="note">今晚有星星，别熬夜。</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function History(){
  return (
    <div className="section">
      <div className="header"><h2>历史与回溯</h2><div className="actions"><div className="pill">搜索...</div></div></div>
      <div className="card timeline">
        <div className="line"/>
        
        <div className="node">
          <div className="dot"/><div>
            <strong>21:40 插件触发：天气</strong>
            <div className="muted">苏州多云微风，约22℃</div>
          </div>
        </div>
      </div>
    </div>
  );
}

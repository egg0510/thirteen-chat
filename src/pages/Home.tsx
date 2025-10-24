import CalendarCard from '../components/CalendarCard';

export default function Home(){
  return (
    <div className="section">
      <div className="header">
        <h2>Hi, 林疏月</h2>
        <div className="actions">
          <div className="pill">Search...</div>
          <div className="pill">Upgrade</div>
        </div>
      </div>
      <div className="grid cols-2">
        <div className="card">
          <div className="title"><span>Your Mood Today</span><span>·</span></div>
          <div className="bubbles">
            <div className="bubble yellow"/>
            <div className="bubble red"/>
            <div className="bubble black">2.3h</div>
          </div>
        </div>
        <div className="card dark calendar">
          <CalendarCard />
        </div>
        <div className="card">
          <div className="title"><span>Steps for Today</span><span>Goal 8,500</span></div>
          <p style={{color:'var(--muted)'}}>圆弧进度条占位</p>
        </div>
        <div className="card">
          <div className="title"><span>My Habits</span><span>Add New +</span></div>
          <div className="habits">
            <div className="item"><span>Stretching</span><div className="progress"><i/></div></div>
            <div className="item"><span>Yoga</span><div className="progress"><i/></div></div>
            <div className="item"><span>Massage</span><div className="progress"><i/></div></div>
            <div className="item"><span>Ab exercises</span><div className="progress"><i/></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

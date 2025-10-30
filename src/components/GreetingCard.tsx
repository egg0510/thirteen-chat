import React from 'react';

type GreetingCardProps = {
  name?: string;
  timeStr: string;
  weatherStr: string;
  phase: 'dawn'|'day'|'dusk'|'night';
};

const phrases: Record<GreetingCardProps['phase'], string[]> = {
  dawn: ["清晨好，愿你今天精神充沛。", "早安，柔光与新意同在。"],
  day: ["午后好，保持专注，循序渐进。", "你好，阳光正好，继续前行。"],
  dusk: ["傍晚好，放缓节奏，舒展身心。", "夕阳下也要照顾好自己。"],
  night: ["夜色好，早点休息，温柔以待。", "晚安，愿你拥有好梦。"],
};

function pick(arr: string[]){ return arr[Math.floor(Math.random()*arr.length)]; }

export default function GreetingCard({ name='朋友', timeStr, weatherStr, phase }: GreetingCardProps){
  const greet = pick(phrases[phase]);
  const suggestion = phase === 'dawn'
    ? '今天先从一个最小任务开始吧（例如整理桌面/拉伸5分钟）。'
    : phase === 'day'
      ? '给今日安排设定一个小目标，并在午后进行短暂走动。'
      : phase === 'dusk'
        ? '做个轻松的拉伸或散步，准备晚间的放松时刻。'
        : '远离屏幕一小时，营造睡前仪式感（阅读/音乐）。';

  return (
    <div className="card greet">
      <div className="title"><span>你好，{name}</span><span>{timeStr} · {weatherStr}</span></div>
      <p className="lead">{greet}</p>
      <details className="suggest">
        <summary>今日建议</summary>
        <p>{suggestion}</p>
      </details>
    </div>
  );
}

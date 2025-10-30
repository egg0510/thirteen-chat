import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

type BubbleProps = {
  title: string;
  value: string;
  theme: string; // CSS gradient or color
  className?: string;
  style?: React.CSSProperties; // position or extra styles
};

// 自动适配：根据文本尺寸动态计算球体直径与字体大小
export default function Bubble({ title, value, theme, className, style }: BubbleProps){
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>(160);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    // 测量内容尺寸（title+value）
    const valueEl = el.querySelector('.value') as HTMLElement | null;
    const titleEl = el.querySelector('.title-sm') as HTMLElement | null;
    const vw = valueEl?.offsetWidth ?? 0;
    const vh = valueEl?.offsetHeight ?? 0;
    const tw = titleEl?.offsetWidth ?? 0;
    const th = titleEl?.offsetHeight ?? 0;
    // 目标直径：内容较大时增大。留出内边距（24~28）。限制最小/最大，防止过大过小。
    const contentW = Math.max(vw, tw);
    const contentH = (vh + th);
    const padding = 28;
    const base = Math.max(contentW, contentH) + padding * 2;
    const next = Math.min(Math.max(base, 120), 260); // clamp 120~260
    setSize(next);
  }, [title, value]);

  return (
    <div
      ref={boxRef}
      className={["bubble", "auto", className].filter(Boolean).join(' ')}
      style={{
        ...(style||{}),
        // 尺寸变量 + 主题（渐变/颜色）
        ['--size' as any]: `${size}px`,
        background: theme,
      }}
      onTouchStart={(e)=>e.currentTarget.classList.add('press')}
      onTouchEnd={(e)=>e.currentTarget.classList.remove('press')}
    >
      <div className="content">
        <div className="title-sm">{title}</div>
        <div className="value">{value}</div>
      </div>
    </div>
  );
}

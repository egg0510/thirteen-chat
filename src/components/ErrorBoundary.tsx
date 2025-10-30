import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props){
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any){
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any){
    console.error('ErrorBoundary caught', error, info);
  }
  render(){
    if (this.state.hasError){
      return (
        <div className="card" style={{ padding: 16 }}>
          <div className="title"><span>页面发生错误</span><span>请刷新</span></div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {(this.state.error && String(this.state.error)) || '未知错误'}
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

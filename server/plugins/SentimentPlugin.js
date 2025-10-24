module.exports = {
  name: 'SentimentPlugin', priority: 90,
  async run(ctx){
    const text = [...ctx.messages].reverse().find(m=>m.role==='user')?.content || '';
    const score = text.match(/累|难过/) ? -0.3 : 0.2; // mock
    ctx.vad = { valence: Math.max(0,0.5+score), arousal: 0.4, dominance: 0.5 };
    return { ok:true, vad: ctx.vad };
  }
};

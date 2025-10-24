module.exports = {
  name: 'SentimentPlugin', priority: 90,
  async run(ctx){
    const text = Array.isArray(ctx.messages) ? [...ctx.messages].reverse().find(m=>m.role==='user')?.content || '' : '';
    const score = /累|难过|疲|忧|伤/.test(text) ? -0.3 : 0.2; // mock
    ctx.vad = { valence: Math.max(0,0.5+score), arousal: 0.4, dominance: 0.5 };
    return { ok:true, vad: ctx.vad };
  }
};

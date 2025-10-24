module.exports = {
  name: 'MemoryPlugin', priority: 100,
  async run(ctx){
    // Persist short-term memory (mock)
    const lastUser = [...ctx.messages].reverse().find(m=>m.role==='user');
    ctx.memory = ctx.memory || [];
    if(lastUser) ctx.memory.push({ text: lastUser.content, time: Date.now() });
    return { ok:true, memorySize: ctx.memory.length };
  }
};

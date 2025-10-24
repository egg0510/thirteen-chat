module.exports = {
  name: 'MemoryPlugin', priority: 100,
  async run(ctx){
    const lastUser = Array.isArray(ctx.messages) ? [...ctx.messages].reverse().find(m=>m.role==='user') : null;
    ctx.memory = ctx.memory || [];
    if(lastUser) ctx.memory.push({ text: lastUser.content, time: Date.now() });
    return { ok:true, memorySize: ctx.memory.length };
  }
};

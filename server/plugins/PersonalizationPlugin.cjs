module.exports = {
  name: 'PersonalizationPlugin', priority: 80,
  async run(ctx){
    const persona = ctx.persona && ctx.persona.name ? ctx.persona.name : '十三';
    ctx.tone = `以${persona}温柔、含蓄、偶尔毒舌的口吻`;
    return { ok:true, tone: ctx.tone };
  }
};

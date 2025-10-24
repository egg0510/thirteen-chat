const Memory = require('./MemoryPlugin');
const Sentiment = require('./SentimentPlugin');
const Personalization = require('./PersonalizationPlugin');
const ContextMgr = require('./ContextManagerPlugin');
const KB = require('./KnowledgeBasePlugin');
const Perf = require('./PerformanceOptimizerPlugin');
const WeatherTime = require('./WeatherTimeMapPlugin');

const plugins = [Memory, Sentiment, WeatherTime, Personalization, ContextMgr, KB, Perf];

async function runPipeline(ctx){
  const ordered = plugins.sort((a,b)=> (b.priority||0)-(a.priority||0));
  ctx.results = [];
  for(const p of ordered){
    try{ const r = await p.run(ctx); ctx.results.push({ name:p.name, ...r }); }
    catch(e){ ctx.results.push({ name:p.name, ok:false, error: e?.message||String(e) }); }
  }
  return ctx;
}

module.exports = { runPipeline };

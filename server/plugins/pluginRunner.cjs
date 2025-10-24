const Memory = require('./MemoryPlugin.cjs');
const Sentiment = require('./SentimentPlugin.cjs');
const Personalization = require('./PersonalizationPlugin.cjs');
const ContextMgr = require('./ContextManagerPlugin.cjs');
const KB = require('./KnowledgeBasePlugin.cjs');
const Perf = require('./PerformanceOptimizerPlugin.cjs');
const WeatherTime = require('./WeatherTimeMapPlugin.cjs');

const plugins = [Memory, Sentiment, WeatherTime, Personalization, ContextMgr, KB, Perf];

const { withTimeout } = require('../utils/withTimeout.cjs');
const { logger } = require('../logger.cjs');

async function runPipeline(ctx){
  const ordered = plugins.sort((a,b)=> (b.priority||0)-(a.priority||0));
  ctx.results = [];
  for(const p of ordered){
    try{
      const r = await withTimeout(Promise.resolve(p.run(ctx)), 15000, p.name);
      ctx.results.push({ name: p.name, ok: true, ...r });
    } catch(e){
      const msg = e && e.message ? e.message : String(e);
      logger && logger.warn && logger.warn({ plugin: p.name, err: msg, traceId: ctx.traceId }, 'PLUGIN_FAIL_CONTINUE');
      ctx.results.push({ name: p.name, ok:false, error: msg });
      // continue to next plugin
    }
  }
  return ctx;
}

module.exports = { runPipeline };

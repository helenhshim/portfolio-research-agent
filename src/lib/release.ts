import { load } from 'cheerio';
import { createHash } from 'node:crypto';
export function extractRelease(html: string) {
  const $ = load(html);
  $('script,style,head,noscript').remove();
  // Preserve cell boundaries and text nodes without injecting whitespace into nested inline text.
  $('td,th').each((_i, el) => { $(el).append('\t'); });
  $('tr,p,div,h1,h2,h3,li').each((_i, el) => { $(el).append('\n'); });
  $('br').replaceWith('\n');
  const text = $('body').text().split('\n').map(line=>line.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n');
  const paragraphs = text.split('\n').map((text,index)=>({id:`p${index+1}`,text}));
  return {text,paragraphs,normalized_sha256:createHash('sha256').update(text).digest('hex')};
}
export function lookupEvidence(packet: any, terms: string[], limit = 6) {
  if (!Array.isArray(terms) || terms.length < 1 || terms.length > 5 || terms.some(t=> typeof t !== 'string' || t.length<2 || t.length>100)) throw new Error('Invalid evidence search terms');
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  const query = terms.map(normalize).filter(Boolean);
  const hits = packet.release.paragraphs.map((p: any)=>({...p,score:query.filter(q=>normalize(p.text).includes(q)).length})).filter((p:any)=>p.score>0).sort((a:any,b:any)=>b.score-a.score).slice(0,limit);
  return hits.map(({score,...p}:any)=>({...p,id:`${packet.ticker}:${p.id}`,source_id:`${packet.ticker}:release`}));
}

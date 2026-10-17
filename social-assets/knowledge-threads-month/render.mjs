import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { plans } from './visual-plan.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manuscriptBytes = await fs.readFile(path.join(root,'content.json'));
const content = JSON.parse(manuscriptBytes);
const contentSha256 = hash(manuscriptBytes);
const threads = [...content.threads].sort((a,b)=>a.sequence-b.sequence);
assert.equal(threads.length,30);
for(const thread of threads){assert.equal(thread.posts.length,6);assert.equal(plans[thread.id].length,6);}
for(const name of ['images','contact-sheets','assets']) await fs.mkdir(path.join(root,name),{recursive:true});
const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{const bytes=await fs.readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'}).end(bytes);}catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
if(process.argv.includes('--serve')){console.log(`Review server: ${url}/preview.html`);await new Promise(()=>{});}
const browser=await chromium.launch({headless:true,executablePath:'/Users/vedang/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
const page=await browser.newPage({viewport:{width:1200,height:1500},deviceScaleFactor:1});
const errors=[];page.on('pageerror',err=>errors.push(err.message));
const images=[], checks=[];
const filter=process.argv.find(arg=>arg.startsWith('--only='))?.slice(7).split(',');
const structureDescriptions={flow:'An ordered teaching sequence.',compare:'Side-by-side comparison.',check:'A reusable checklist with empty checkboxes.',record:'A worksheet with explicitly labeled blank personal fields.',lanes:'Paired rows link each subject to its action or condition.',stack:'Separate labeled layers distinguish the parts.',branch:'A branching relationship diagram.',shot:'Genuine product control crops, arranged separately for reading.',allowancebars:'Two proportional bars: the 200-token cap is ten times the 20-token trade.',agenda:'A proportional agenda bar separates 10 minutes, 50 minutes and 20 minutes.',gaslimit:'Two equal work bars with different limit markers: one beyond the work, one cutting through it.',decimal:'A worked fixed-point calculation.',sources:'Left: one shared source feeds reporters A, B and C. Right: independent sources X, Y and Z feed the reporters.',multisig:'Two of three abstract owners authorize the standard path.',availability:'One unavailable signer leaves two; two unavailable signers leave one.',nftscope:'One highlighted NFT is contrasted with all NFTs in the same collection contract.',overlap:'Two blank schedule rows share a highlighted overlap band.',proxy:'The fixed proxy entry points toward a previous and an updated implementation.',mint:'A mint branches to two token accounts and their distinct owners.',ata:'Owner, mint and token program determine the ATA; a separate payer funds creation.',atomic:'Two hypothetical instructions sit inside one transaction boundary.',isolation:'An assessment environment is bounded separately from valuable access.',room:'Nested city, neighborhood and room scopes lead to checks of the actual accommodation.'};
const cropDescriptions={
  'resume-project-control':'Add Project','resume-experience-control':'Add Experience',
  'invoice-payment-control':'empty Payment Method field','invoice-notes-control':'empty Notes field',
  'jd-responsibilities':'Responsibilities','jd-required':'Qualifications','jd-preferred':'Preferred Qualifications','jd-add-control':'Add item control',
  'interview-navigation':'Frontend dApp Engineer navigation','interview-scoring':'Appendix B: Scoring Guide heading',
  'nomads-rank-cost':'ranking selector set to Living costs','nomads-rank-internet':'ranking selector set to Internet speed','nomads-compare':'Compare control',
  'visa-tabs':'Visa programs and Passport checker tabs','visa-search':'empty program search','visa-requirements':'Key Requirements heading','visa-official-source':'official-source arrow link',
  'checker-checked':'Checked, government-backed baseline','checker-historical':'Historical official evidence','checker-unresolved':'Unresolved official review','checker-conditions':'Conditions & sources disclosure',
  'popups-popup':'Popup filter state','popups-permanent':'Permanent filter state','popups-city':'City / SEZ filter state',
  'remote-workspace':'Workspace Setup','remote-communication':'Communication & Collaboration','remote-backup-control':'unchecked automated file and code backup task',
  'citizenship-investment':'Investment','citizenship-holding-conditions':'Holding conditions','citizenship-additional-fees':'Additional fees','citizenship-presence':'Presence','citizenship-source-control':'Official program source link',
};
try{
  await page.goto(`${url}/boards.html`);
  await page.waitForFunction(()=>document.documentElement.dataset.ready==='true');
  for(const thread of threads){
    for(const post of thread.posts){
      const id=`${thread.id}-${String(post.number).padStart(2,'0')}`;
      if(filter&&!filter.includes(thread.id)&&!filter.includes(id))continue;
      const meta=await page.evaluate(([id,number])=>window.showBoard(id,number),[thread.id,post.number]);
      const result=await page.locator('.board').evaluate(board=>{
        const issues=[];const boardBox=board.getBoundingClientRect();
        const contrastFailures=[];
        const luminance=color=>{const c=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
        const textElements=[...board.querySelectorAll('h1,h2,h3,p,a,span')].filter(el=>el.textContent.trim());
        const rect=el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom}};
        for(const el of textElements){
          const b=rect(el);const style=getComputedStyle(el);
          if(style.display==='none')continue;
          let parentBackground=el,background;
          while(parentBackground){const bg=getComputedStyle(parentBackground).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'){background=bg;break;}parentBackground=parentBackground.parentElement;}
          if(background){const a=luminance(style.color),b=luminance(background);const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(ratio<4.5)contrastFailures.push({text:el.textContent,ratio,color:style.color,background});}
          if(b.x<boardBox.x-1||b.right>boardBox.right+1||b.y<boardBox.y-1||b.bottom>boardBox.bottom+1)issues.push({type:'outside-board',text:el.textContent,box:b});
          if(el.clientWidth>0&&el.scrollWidth>el.clientWidth+2)issues.push({type:'horizontal-overflow',text:el.textContent,box:b});
          const parent=el.closest('.node,.column,.layer,.record-row,.crop-row,.stage');
          if(parent){const pb=rect(parent);const range=document.createRange();range.selectNodeContents(el);for(const r of range.getClientRects()){if(r.width&&r.height&&(r.left<pb.x-2||r.right>pb.right+2||r.top<pb.y-2||r.bottom>pb.bottom+2))issues.push({type:'text-outside-container',text:el.textContent,box:b,parent:parent.className});}}
        }
        const stage=rect(board.querySelector('.stage'));const note=rect(board.querySelector('.note'));const footer=rect(board.querySelector('.footer'));
        for(const el of board.querySelectorAll('.stage *')){const b=rect(el);if(getComputedStyle(el).display!=='none'&&b.w&&b.h&&(b.x<stage.x-2||b.right>stage.right+2||b.y<stage.y-2||b.bottom>stage.bottom+2))issues.push({type:'stage-overflow',tag:el.tagName,cls:el.className,text:el.textContent?.slice(0,120),box:b});}
        if(rect(board.querySelector('.heading')).bottom+12>rect(board.querySelector('.scope')).y)issues.push({type:'heading-scope-collision'});
        if(rect(board.querySelector('.scope')).bottom+12>stage.y)issues.push({type:'scope-stage-collision'});
        if(note.bottom+12>footer.y)issues.push({type:'note-footer-collision'});
        const missing=[...board.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src);
        const mainText=board.querySelector('.stage').innerText.replace(/\n+/g,'; ');
        const textBoxes=[];const walker=document.createTreeWalker(board,NodeFilter.SHOW_TEXT);let current;
        while(current=walker.nextNode()){
          if(!current.textContent.trim()||getComputedStyle(current.parentElement).display==='none')continue;
          const range=document.createRange();range.selectNodeContents(current);
          for(const r of range.getClientRects()){
            if(!r.width||!r.height)continue;
            if(r.left<boardBox.left-1||r.right>boardBox.right+1||r.top<boardBox.top-1||r.bottom>boardBox.bottom+1)issues.push({type:'glyph-outside-board',text:current.textContent});
            for(const previous of textBoxes)if(previous.parent!==current.parentElement&&Math.min(previous.right,r.right)-Math.max(previous.left,r.left)>2&&Math.min(previous.bottom,r.bottom)-Math.max(previous.top,r.top)>2)issues.push({type:'text-collision',a:previous.text,b:current.textContent});
            textBoxes.push({left:r.left,right:r.right,top:r.top,bottom:r.bottom,text:current.textContent,parent:current.parentElement});
          }
        }
        return{issues,contrastFailures,missing,heading:board.querySelector('h1').innerText,headingFont:parseFloat(getComputedStyle(board.querySelector('h1')).fontSize),scope:board.querySelector('.scope').innerText,mainText,note:board.querySelector('.note').innerText,footer:board.querySelector('.url').innerText,text:board.innerText,images:[...board.querySelectorAll('.stage img')].map(i=>({src:i.getAttribute('src'),alt:i.alt}))};
      });
      assert.deepEqual(result.missing,[],id);
      assert.ok(!/[—–“”‘’]/.test(result.text),`${id} forbidden punctuation`);
      assert.ok(!/0x[a-f0-9]{12,}/i.test(result.text),`${id} usable-looking wallet address`);
      const raw=await page.locator('.board').screenshot({type:'png',animations:'disabled'});
      const bytes=await sharp(raw).jpeg({quality:89,chromaSubsampling:'4:4:4',mozjpeg:true}).toBuffer();
      const imageMeta=await sharp(bytes).metadata();
      assert.equal(imageMeta.width,1200,id);assert.equal(imageMeta.height,1500,id);assert.ok(bytes.length<5_000_000,id);
      await fs.writeFile(path.join(root,'images',`${id}.jpg`),bytes);
      const visualText=result.mainText.replace(/(?:^|; )0[1-4]; /g,'; ').replace(/^; /,'');
      const plan=plans[thread.id][post.number-1];
      const cropText=plan.shots?' Crops show '+plan.shots.map(s=>cropDescriptions[s.file]).join('; ')+'.':'';
      const alt=`${result.heading}. ${result.scope}. ${structureDescriptions[meta.kind]||'Educational relationship diagram.'} ${visualText}. ${result.note}${cropText}${result.images.some(i=>i.src.includes('edge-city'))?' The photograph shows people working at an Edge City gathering.':''}`.replace(/\.\./g,'.').replace(/; \./g,'.');
      assert.ok(alt.length<=1000,`${id} alt text is ${alt.length} characters`);
      const canonical=post.linkPath?content.siteOrigin+post.linkPath:content.siteOrigin;
      images.push({threadId:thread.id,threadSequence:thread.sequence,threadTitle:thread.title,postNumber:post.number,path:`images/${id}.jpg`,repoPath:`social-assets/knowledge-threads-month/images/${id}.jpg`,sha256:hash(bytes),width:1200,height:1500,bytes:bytes.length,alt,canonicalUrl:canonical,composition:post.visual.composition,visualKind:meta.kind,contentPostSha256:hash(JSON.stringify(post)),sourceUrls:thread.sources.filter(s=>s.supports.some(support=>support.posts.includes(post.number))).map(s=>s.url),assetPaths:result.images.map(i=>i.src.replace('./',''))});
      checks.push({id,issues:result.issues,contrastFailures:result.contrastFailures,headingFont:result.headingFont,missingImages:result.missing,renderedText:result.text});
      console.log(`${id} ${Math.round(bytes.length/1024)} KB ${result.issues.length?'LAYOUT: '+result.issues.length:'OK'}`);
    }
  }
  assert.deepEqual(errors,[]);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
const now=new Date().toISOString();
if(filter){
  const prior=JSON.parse(await fs.readFile(path.join(root,'image-manifest.json'),'utf8'));
  const previousChecks=JSON.parse(await fs.readFile(path.join(root,'assets/render-checks.json'),'utf8'));
  for(const image of prior.images)if(!images.some(i=>i.path===image.path))images.push(image);
  for(const check of previousChecks.images)if(!checks.some(i=>i.id===check.id))checks.push(check);
}
images.sort((a,b)=>a.threadSequence-b.threadSequence||a.postNumber-b.postNumber);
assert.equal(images.length,180);
const manifest={schemaVersion:1,generatedAt:now,contentSha256,threadCount:30,masterCount:180,totalBytes:images.reduce((sum,i)=>sum+i.bytes,0),format:'JPEG',colorSpace:'sRGB',width:1200,height:1500,images};
await fs.writeFile(path.join(root,'image-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(path.join(root,'assets/render-checks.json'),JSON.stringify({checkedAt:now,contentSha256,pageErrors:errors,issueCount:checks.reduce((s,c)=>s+c.issues.length,0),contrastFailureCount:checks.reduce((s,c)=>s+(c.contrastFailures?.length||0),0),images:checks},null,2)+'\n');
await fs.writeFile(path.join(root,'ALT-TEXT.md'),'# Finished image descriptions\n\nDescriptions reflect the rendered graphics, not the original briefs. Paths are relative to this directory.\n\n'+images.map(i=>`## ${i.threadId}-${String(i.postNumber).padStart(2,'0')}\n\n\`${i.path}\`\n\n${i.alt}\n`).join('\n'));

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const thread of threads){
  if(filter&&!filter.some(f=>f===thread.id||f.startsWith(thread.id+'-')))continue;
  const selected=images.filter(i=>i.threadId===thread.id);const layers=[];
  const header=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="65"><rect width="100%" height="100%" fill="#deded8"/><text x="18" y="28" font-size="23" font-family="Arial" fill="#171719">${esc(thread.id+' | '+thread.title)}</text><text x="18" y="52" font-size="15" font-family="Arial" fill="#575955">Six finished JPEGs | reading order left to right, top to bottom | 360 px previews</text></svg>`);
  layers.push({input:header,left:0,top:0});
  for(const [index,image] of selected.entries())layers.push({input:await sharp(path.join(root,image.path)).resize(360,450).toBuffer(),left:12+(index%3)*372,top:72+Math.floor(index/3)*466});
  await sharp({create:{width:1128,height:1008,channels:3,background:'#deded8'}}).composite(layers).jpeg({quality:90,chromaSubsampling:'4:4:4'}).toFile(path.join(root,'contact-sheets',`${thread.id}.jpg`));
}
const sampleIds=['C01-01','C02-06','C04-06','C07-06','E01-02','E04-01','E07-03','E09-05','E10-01','N01-03','N04-03','N05-03','N06-03','N07-06','N09-06'];
for(let start=0;start<sampleIds.length;start+=3){
  const layers=[];const ids=sampleIds.slice(start,start+3);
  for(const [i,id]of ids.entries())layers.push({input:await sharp(path.join(root,'images',id+'.jpg')).resize(390,488).toBuffer(),left:i*410+10,top:40});
  layers.push({input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1230" height="32"><rect width="100%" height="100%" fill="#deded8"/>${ids.map((id,i)=>`<text x="${i*410+10}" y="24" font-size="19" font-family="Arial" fill="#171719">${id} | 390 px</text>`).join('')}</svg>`),left:0,top:0});
  await sharp({create:{width:1230,height:538,channels:3,background:'#deded8'}}).composite(layers).jpeg({quality:92,chromaSubsampling:'4:4:4'}).toFile(path.join(root,'contact-sheets',`mobile-${String(start/3+1).padStart(2,'0')}.jpg`));
}
const priorSources=JSON.parse(await fs.readFile(path.join(root,'../nomad-resources-thread/sources.json'),'utf8'));
const credits={recordedAt:now,brand:[{file:'assets/wordmark.png',copiedFrom:'social-assets/nomad-resources-thread/assets/wordmark.png',credit:'Hashtag Web3 existing approved wordmark'},{file:'assets/inter.woff2',copiedFrom:'social-assets/nomad-resources-thread/assets/inter.woff2',sourceUrl:priorSources.font.url,credit:'Existing Hashtag Web3 Inter webfont'}],photos:priorSources.photos.filter(p=>p.file==='assets/edge-city.jpg'||p.file==='assets/4seas.jpg').map(p=>({file:p.file,copiedFrom:'social-assets/nomad-resources-thread/'+p.file,sourceUrl:p.source,imageUrl:p.selectedImage,credit:p.credit,creditIsPublisherNotNamedPhotographer:true,usedIn:p.file.includes('edge-city')?['N05-03']:[]})),productCaptures:'assets/capture-credits.json',diagrams:{credit:'Original educational graphics by Hashtag Web3, authored for the supplied manuscript',factSource:'content.json per-post source mappings',examples:'Explicitly labeled exercises or blank personal worksheets'}};
await fs.writeFile(path.join(root,'assets/source-credits.json'),JSON.stringify(credits,null,2)+'\n');
assert.equal(hash(await fs.readFile(path.join(root,'content.json'))),contentSha256,'Manuscript changed during rendering');
console.log(JSON.stringify({masters:images.length,totalMiB:manifest.totalBytes/1048576,maxBytes:Math.max(...images.map(i=>i.bytes)),layoutIssues:checks.reduce((s,c)=>s+c.issues.length,0),contentSha256},null,2));

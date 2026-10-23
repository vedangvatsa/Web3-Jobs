const [content, calendar, assetData, sourceData] = await Promise.all(['content.json','calendar.json','assets/revision/visual-assets.json','assets/revision/source-data.json'].map(async file => {const r=await fetch(file);if(!r.ok)throw Error(file);return r.json()}));
const assets=new Map(assetData.assets.map(a=>[a.id,a]));
const cities=new Map(sourceData.cities.map(c=>[c.slug,c]));
const publishedIds=new Set(['C01','E01','N01','C02','E02']);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Number(v).toLocaleString('en-US',{maximumFractionDigits:1});
const countryPhotos={Malaysia:'kuala-lumpur',Thailand:'bangkok',Philippines:'manila',Japan:'osaka',Taiwan:'taipei',Canada:'toronto','United Kingdom':'london',Nepal:'kathmandu',Indonesia:'bali',Vietnam:'da-nang'};
const topic={C02:'Citizenship routes',E02:'Salary calculator',N02:'Remote markets',C03:'City budgets',E03:'Career quiz',N03:'Solidity interviews',C04:'Indian passport',E04:'City-based ranking',N04:'Frontend interviews',C05:'Remote-work visas',E05:'Broadband + budget',N05:'Resume Builder',C06:'November events',E06:'Family citizenship',N06:'Safety + budget',C07:'Security interviews',E07:'Salary calculator',N07:'US passport',C08:'Career practice',E08:'December climate',N08:'2027 conferences',C09:'Resume rewrites',E09:'Indian passport',N09:'Learning library',C10:'Citizenship costs',E10:'Walkable cities',N10:'Invoice Generator'};
function image(id,cls='',style='') {const a=assets.get(id);if(!a)throw Error('Missing source asset: '+id);return `<img data-asset="${esc(id)}" data-source-kind="${a.kind}" src="${esc(a.file)}" alt="" class="${cls}" style="${style}">`;}
const shot=(id,width,caption='')=>`<figure class="shot"${width?` style="width:${width}px"`:''}>${image(id)}${caption?`<figcaption class="shot-caption">${esc(caption)}</figcaption>`:''}</figure>`;
const paragraphs=(text,cls='body')=>String(text).split(/\n\s*\n/).map(p=>`<p class="${cls}">${esc(p)}</p>`).join('');
const body=(text,cls='')=>`<div class="paragraphs">${paragraphs(text,`body ${cls}`)}</div>`;
const scope=text=>`<p class="scope">${esc(text)}</p>`;
const note=text=>`<div class="note paragraphs">${paragraphs(text)}</div>`;
const facts=items=>`<div class="facts">${items.map(f=>`<p class="fact">${esc(f)}</p>`).join('')}</div>`;
const answer=(title,text,extra=[])=>`<section class="answer"><p class="eyebrow">${esc(title)}</p>${body(text)}${facts(extra)}</section>`;
const landmarks=new Set(['singapore','paris','siem-reap','budapest','prague','bali','tallinn']);
const photo=(slug,height=360)=>image('photo-'+slug,`photo${landmarks.has(slug)?' landmark':''}`,`height:${height}px${slug==='taipei'?';object-position:center top':''}`);
const detailRows=rows=>`<dl class="detail-rows">${rows.map(([label,text])=>`<div class="detail-row"><dt>${esc(label)}</dt><dd>${esc(text)}</dd></div>`).join('')}</dl>`;
const metric=(label,value,unit='',wide=false)=>`<div class="metric${wide?' wide':''}"><dt>${esc(label)}</dt><dd>${esc(value)}${unit?` <span class="unit">${esc(unit)}</span>`:''}</dd></div>`;
const budget=rows=>`<div class="budget">${rows.map(([label,value,total])=>`<div class="budget-row${total?' total':''}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div>`;

function cityPlan(thread,post) {
  const items=post.visual.items, kind=thread.id;
  const reference=items.some(i=>i.slug==='taipei')?'Travel Taipei':items.some(i=>i.slug==='cartagena')?'ProColombia':null;
  const footer=items.some(i=>i.slug==='tallinn')?'Tallinn photo: Kaupo Kalda / Visit Tallinn':reference?`${items.length>1?'Photos via Hashtag Web3 / ':'Photo: '}${reference}`:undefined;
  const periods={C03:'Monthly estimates (USD)',E04:'Directory city scores /100 · USD/month estimates',E05:'Fixed broadband: 2026 Q1 · USD/month estimates',N06:'Directory safety /10 · 2026 Q1 broadband\nMonthly estimates (USD)',E08:'December averages · Monthly estimates (USD)',E10:'Directory walkability /10 · Broadband: 2026 Q1'};
  let headline=post.visual.headline, html=scope(periods[kind]);
  if(post.number===1&&kind==='E08'){headline='December: five warm bases';html=scope('December averages · Monthly estimates (USD)');}
  if(post.number===1&&kind==='E10'){headline='Walkable, connected cities';html=scope('2026 Q1 download · USD/month estimates');}
  if(post.number===1&&kind==='N06'){headline='Safety + budget: five cities';html=scope('Directory safety rating /10 · USD/month estimates');}
  if(post.number===1&&kind==='C03')headline='Five bases at USD 1,000 or less';
  if(items.length>=3) {
    html+=`<div class="rows">${items.map((item,index)=>{
      const city=cities.get(item.slug);let text=item.facts.join(' · ');
      if(kind==='E05')text=`${city.internet.download_mbps} Mbps down · USD ${num(city.cost.monthly_total)}`;
      if(kind==='C03'||kind==='N06')text=text.replaceAll('/month','').replaceAll(' estimated','');
      if(kind==='E08')text=`${city.december.temp}°C · ${city.december.rain} mm rain · USD ${num(city.cost.monthly_total)}`;
      if(kind==='E10')text=`${city.walkability.walk}/10 walk · ${city.internet.download_mbps} Mbps · USD ${num(city.cost.monthly_total)}`;
      return `<div class="city-row${kind==='E08'||kind==='E10'?' dense':''}">${photo(item.slug,112)}<div><h2>${index+1}. ${esc(city.name)}${kind==='E04'?', '+esc(item.country):''}</h2><p>${esc(text).replaceAll('\n','<br>')}</p></div></div>`;
    }).join('')}</div>`;
    if(kind==='E08')html+=note('Mean ≥25°C; rain ≤80 mm; cost ≤USD 1,300. Ordered by rainfall.');
    else if(kind==='E10')html+=note('Walkability ≥7.5; download ≥200 Mbps; cost ≤USD 1,800. Rated cities only.');
    else if(kind==='E04')html+=note('Highest-rated base per country. Ties: lower cost, then name. Scores describe cities.');
    else if(kind==='N06')html+=note('Safety ≥8/10; budget ≤USD 1,500/month. Ordered by estimated cost.');
    else if(kind==='E05')html+=note('City-level reference speeds. Your accommodation connection can differ.');
    else html+=note('Regional shortlist, ordered by estimated total. Rent and coworking are included.');
    return {headline,html,kind:'city-photo-ranking',footer};
  }
  if(items.length===2) {
    html+=items.map(item=>{const city=cities.get(item.slug);return `<section class="city-pair">${photo(item.slug,270)}<div><h2>${esc(item.country)}<br>${esc(city.name)}</h2>${body(`${city.score}/100 directory score\nUSD ${num(city.cost.monthly_total)}/month estimated`)}</div></section>`}).join('');
    html+=note(post.text.split('\n').at(-1));
    return{headline,html,kind:'city-photo-comparison',footer};
  }
  const item=items[0], city=cities.get(item.slug);
  headline=city.name===item.country?city.name:`${city.name}, ${item.country}`;
  if(kind==='C03')html='';
  html+=photo(item.slug,kind==='C03'?220:kind==='E05'?360:kind==='E08'?280:320);
  if(kind==='C03') {
    html+=budget([['Monthly estimate',`USD ${num(city.cost.monthly_total)}`,true],...['rent','food','transport','coworking','other'].map(k=>[k[0].toUpperCase()+k.slice(1),num(city.cost[k])])]);
    html+=body(`2026 Q1 fixed broadband\n${city.internet.download_mbps} down / ${city.internet.upload_mbps} up Mbps`);
  } else if(kind==='E08') {
    html+=`<dl class="metric-grid">${metric('December mean',city.december.temp,'°C')}${metric('Monthly rain',city.december.rain,'mm')}${metric('Humidity',city.december.humidity,'%')}${metric('Monthly estimate',num(city.cost.monthly_total),'USD')}</dl>`;
    const climateNotes={lagos:'Directory safety: 4/10. Selected for weather and budget.',bangkok:'Same budget as Lagos; humidity 13 percentage points lower.','siem-reap':'Rent included: USD 280/month estimated.',cartagena:'Versus Siem Reap: 1 mm more rain; USD 500/month more.','ho-chi-minh-city':'Versus Bangkok: USD 100/month less; 46 mm more rain.'};
    html+=note(climateNotes[item.slug]);
  } else {
    const metrics=item.metrics||[];
    html+=`<dl class="metric-grid${kind==='E05'?' thirds':''}">${metrics.filter(m=>m.label!=='Rent'&&m.label!=='Site transit').map(m=>kind==='E05'?metric(m.label==='Monthly estimate'?'Cost (USD/month)':`${m.label} (Mbps)`,num(m.value)):metric(m.label==='Monthly estimate'?'USD/month estimate':m.label,num(m.value),m.unit==='USD/month'?'':m.unit)).join('')}</dl>`;
    const extra=kind==='E05'?(item.facts[2]||'Check the connection at your accommodation.'):kind==='N06'?null:item.facts[0];
    if(extra)html+=note(extra);
  }
  return{headline,html,kind:'city-photo-metrics',footer};
}

const salaryRoles=['contract','auditor','product','writer','community'];
const salaryNames=['Smart Contract Developer','Security Auditor','Product Manager','Technical Writer','Community Manager'];
function salaryPlan(thread,post) {
  let html,headline;
  const assumptions='North America · Series A/B · 11-50 staff';
  const compensation='Tokens and equity excluded.';
  if(thread.id==='E02') {
    if(post.number===6) {
      headline='Five roles, identical inputs';
      html=scope('Estimated annual base pay (USD) · 2 years')+body(assumptions)+`<div>${post.visual.items.map(item=>{const i=salaryNames.indexOf(item.title);return `<div class="salary-row"><h2>${esc(item.title)}</h2>${image(`E02-${salaryRoles[i]}-result-amount`)}</div>`}).join('')}</div>`+note('Auditor minus Community: USD 70,000/year. Tokens and equity excluded.');
    } else {
      const role=salaryRoles[post.number-1];headline=salaryNames[post.number-1];
      html=scope('Estimated annual base pay (USD) · 2 years')+shot(`E02-${role}-result-value`,980)+body(assumptions)+note(compensation);
    }
  } else {
    if(post.number===6) {
      headline='Base pay estimates: 1 vs 7 years';
      html=scope('Estimated annual base pay (USD)')+body(assumptions+'\n'+compensation)+['auditor','community'].map((r,i)=>`<section class="salary-gap"><h2>${i===0?'Security Auditor':'Community Manager'}</h2><div class="values"><div>${i===0?'<p>1 year</p>':''}${image(`E07-${r}-junior-result-amount`)}</div><div>${i===0?'<p>7 years</p>':''}${image(`E07-${r}-senior-result-amount`)}</div></div><p class="delta">Gap: USD ${i===0?'36,000':'18,000'}/year</p></section>`).join('');
    } else {
      const role=salaryRoles[post.number-1];headline=salaryNames[post.number-1];
      html=scope('Estimated annual base pay (USD)')+body(assumptions)+['junior','senior'].map((variant,i)=>`<section class="salary-result"><p class="caption">${i===0?'Junior example: 1 year':'Senior example: 7 years'}</p>${shot(`E07-${role}-${variant}-result-amount`,980)}</section>`).join('')+note(compensation);
    }
  }
  return{headline,html,kind:'salary-results',footer:'Hashtag Web3 salary calculator'};
}

function marketPlan(thread,post) {
  const items=post.visual.items;
  let html=scope('October 20, 2026 snapshot');
  if(post.number===1)html+=`<table class="counts-table"><thead><tr><th>Eligible country</th><th>Listings</th><th>Employers</th></tr></thead><tbody>${items.map(i=>`<tr><td>${esc(i.country)}</td><td class="number">${parseInt(i.facts[0])}</td><td class="number">${parseInt(i.facts[1])}</td></tr>`).join('')}</tbody></table>`+note('Explicit-country eligibility only. Multi-country listings count in each named country.');
  else {
    const item=items[0];html+=item.metrics.map(m=>`<section class="count-metric"><div class="big-number">${m.value}</div><p>${m.label==='Employers'?'Distinct employers':'Fully remote listings'}</p></section>`).join('');
    const context={2:"Largest explicit-country count. Eligibility follows the role's location, not employer headquarters.",3:'US minus UK: 126 listings and 26 employers. Eligible locations, not headquarters.',4:'11-listing tie: Cyprus, Georgia and Poland. Distinct employers: 2, 1 and 4, respectively.',5:'Poland also has 11 listings, across 4 employers. Equal volume can hide different employer concentration.',6:'Excluded: 6 worldwide and 180 unresolved-location listings. Multi-country listings count in each named country; totals overlap.'};
    html+=note(context[post.number]);
  }
  return{headline:post.number===1?'Remote Web3: country counts':items[0].country,html,kind:'historical-market-counts',footer:'Hashtag Web3 jobs catalog'};
}

function eventPlan(thread,post) {
  const items=post.visual.items;let html=scope(thread.id==='C06'?'November 2026 · Organizer checks: October 20':'Announced 2027 dates · Checked October 20, 2026');
  if(items.length>1)html+=`<div class="event-index">${items.map(item=>`<section class="event-row">${image('poster-'+item.id)}<div><h2>${esc(item.title)}</h2><p>${esc(item.facts.join(' · '))}</p></div></section>`).join('')}</div>`;
  else {
    const item=items[0];html+=`<figure class="poster-frame">${image('poster-'+item.id)}</figure>`+body(post.text,'legal-summary');
  }
  return{headline:thread.id==='N08'&&post.number===5?'Dutch Blockchain Week':items.length===1?items[0].title:thread.id==='N08'?'Five 2027 main conferences':post.visual.headline,html,kind:items.length>1?'event-poster-index':'event-poster-and-facts',footer:thread.id==='N08'&&post.number===3?'Cannes photo · Dates: event organizer':'Sources: event organizers'};
}

function questionPlan(thread,post) {
  const item=post.visual.items[0];
  const introPost={N03:4,N04:3,C07:4}[thread.id];
  const n=post.number===1?introPost:post.number;
  const id=[...assets.keys()].find(k=>k.startsWith(`${thread.id}-${String(n).padStart(2,'0')}-`) && /-(SOL|FE|AUD)-/.test(k));
  const summary=(post.number===1?item.answer:post.text.split('A: ')[1]||item.answer).replace(/^Yes\. /,'');
  const extraIndex={'N03-3':1,'N03-6':2,'N04-3':1,'C07-3':2,'C07-5':2};
  const extra=extraIndex[thread.id+'-'+post.number]!==undefined?[item.facts[extraIndex[thread.id+'-'+post.number]]]:[];
  let explanation=answer('Answer',summary,extra);
  if(thread.id==='N03'&&post.number===3)explanation=`<section class="answer"><p class="eyebrow">Example modifier</p><pre class="code-fragment">modifier onlyOwner() {
  require(msg.sender == owner);
  _;
}</pre>${body('The caller check runs before the function body.\n_; runs the body; code after it runs afterward.')}${facts(extra)}</section>`;
  if(thread.id==='N03'&&post.number===6)explanation=`<section class="answer"><p class="eyebrow">Example · Each box is 32 bytes</p><div class="packing-row"><h2>2 slots</h2><p class="slot">2 × uint128</p><p class="slot">uint256</p></div><div class="packing-row"><h2>3 slots</h2><p class="slot">uint128</p><p class="slot">uint256</p><p class="slot">uint128</p></div>${body('Fewer slots do not guarantee cheaper writes; gas depends on access patterns.')}${facts(extra)}</section>`;
  return{headline:thread.id==='N03'&&post.number===6?'Storage packing: 2 or 3 slots':thread.id==='C07'&&post.number===5?'Fuzzing a custody vault':post.visual.headline,html:(post.number===1?scope(post.visual.labels.join(' · ')):'')+shot(id,1072)+explanation,kind:'interview-answer',footer:'Hashtag Web3 interview bank'};
}

function quizPlan(thread,post) {
  const id=thread.id+'-'+post.number;
  const map={'E03-1':['builder',1],'E03-2':['strategist',1],'E03-3':['analyst',1],'E03-4':['weaver',1],'E03-5':['builder',2],'C08-2':['builder',1],'C08-3':['analyst',1],'C08-4':['weaver',1],'C08-5':['analyst',2]};
  if(post.number===6) {
    const a=thread.id==='E03'?'builder':'analyst';
    return{headline:`The ${a==='builder'?'Builder':'Analyst'}: three role matches`,html:[1,2,3].map(i=>shot(`QUIZ-${a}-role-0${i}`,940)).join(''),kind:'quiz-role-list',footer:'Hashtag Web3 career quiz · 16 questions',className:'compact'};
  }
  if(id==='C08-1')return{headline:'Code, query, support runbook',html:['builder','analyst','weaver'].map(a=>shot(`QUIZ-${a}-role-01`,960)).join(''),kind:'quiz-role-comparison',footer:'Hashtag Web3 career quiz',className:'compact'};
  const [archetype,role]=map[id],item=post.visual.items[0];
  let html=scope('Career quiz match');
  html+=shot(`QUIZ-${archetype}-role-0${role}`,1060);
  const proposed=id==='C08-5'?'Affected function\nFailing test\nProposed fix':thread.id==='C08'?item.facts.join('\n'):item.facts.filter(f=>f.startsWith('Example')).join('\n');
  html+=answer('Practice task',proposed);
  return{headline:post.visual.headline,html,kind:'quiz-practice-task',footer:'Hashtag Web3 career quiz',className:archetype==='weaver'?'compact':''};
}

function resumePlan(thread,post) {
  let html=scope('Example résumé');
  let headline=post.visual.headline;
  if(thread.id==='N05') {
    if(post.number===1){headline='A junior developer résumé';html+=shot('RESUME-junior-summary',1050);}
    if(post.number===2)html+=shot('RESUME-junior-project-after',1020);
    if(post.number===3){headline='Name the failure cases';html+=shot('RESUME-junior-project-after',1000)+note('Example assertions: unauthorized callers and repeat withdrawals revert.');}
    if(post.number===4)html+=shot('RESUME-junior-project-link',1000)+answer('Example README','Run forge test. Check that unauthorized callers and repeat withdrawals revert.',['The sample has no repository link.']);
    if(post.number===5)html+=shot('RESUME-junior-skills',1128)+note('List tools and skills that the project demonstrates.');
    if(post.number===6) {
      headline='Completed example résumé';
      html=scope('Example résumé')+shot('RESUME-junior-project-after',900)+body('Skills: Solidity, Foundry, Git, README writing.')+note('Experience and Education are empty. Download PDF exports the preview.');
    }
  } else {
    if(post.number<=3) {
      const variant=['technical','community','content'][post.number-1];
      html+=answer('Before',post.visual.items[0].facts[0].replace('Example wording: ',''))+`<section class="quiz-role"><p class="caption">After</p>${shot(`RESUME-${variant}-project-after`,1072)}</section>`;
    } else if(post.number===4) {
      headline='Three example résumés';
      html=['technical','community','content'].map(v=>shot(`RESUME-${v}-summary-text`,1000)).join('');
    } else if(post.number===5) {
      headline='Interview walkthroughs';
      html=scope('Practice prompts')+`<section class="quiz-role">${shot('RESUME-technical-summary-text',970)}${body('Technical: disconnect the wallet, load a balance, simulate an RPC error.')}</section><section class="quiz-role">${shot('RESUME-community-summary-text',970)}${body('Support: classify, assign, record the resolution.')}</section>`;
    } else {headline='Use the project fields';html+=shot('RESUME-content-project-after',1128)+answer('Key Projects & Portfolio','Project Name · Your Role · Description · Link',['The sample link is empty. Download PDF exports the preview.']);}
  }
  return{headline,html,kind:'resume-example',footer:'Hashtag Web3 Resume Builder',className:'compact'};
}

function lessonPlan(thread,post) {
  let html;
  if(post.number===1) {
    html=shot('N09-01-library-excerpt',1128)+`<div class="learning-index">${post.visual.items.map(i=>`<div><h2>${esc(i.title)} · ${esc(i.facts[0])}</h2><p>${esc(i.facts[1].replace('Selected module: ',' '))}</p></div>`).join('')}</div>`;
  } else {
    const names=['wallet','lending','testing','growth','agents'],item=post.visual.items[0];
    html=scope(post.visual.labels.join(' · '))+shot('lesson-'+names[post.number-2],1128)+answer('Lesson summary',post.text.split('\n').slice(1).join('\n').trim());
    if(post.number===4)html=scope(post.visual.labels.join(' · '))+shot('N09-04-transfer-excerpt',1128,'test_Transfer example')+answer('Sample raw units',post.text.split('\n').slice(1).join('\n').trim());
  }
  if(post.number===2)html=scope('Web3 Fundamentals · Lesson 5 of 15')+shot('lesson-wallet',1072)+answer('Lesson summary','A wallet signs messages and transactions. A signature proves account control, not legal identity.');
  return{headline:post.number===1?'Five course selections':post.visual.headline,html,kind:'lesson-summary',footer:'Hashtag Web3 learning library',className:post.number===4?'compact':''};
}

function legalPlan(thread,post) {
  const items=post.visual.items, item=items[0];
  let html=scope((thread.id==='C05'?'Remote-work route':thread.id==='N07'?'US ordinary passport · Tourism':'Indian ordinary passport · Tourism')+'\nRules checked October 20, 2026');
  const selected=items.find(i=>countryPhotos[i.country])||item;
  const photoSlug=countryPhotos[selected.country];
  const excerpts={
    'C04-1': {rows:[['Malaysia','Up to 30 visa-free days; exemption ends December 31, 2026.'],['Kazakhstan','Up to 14 days per entry; 42 days in any 180-day period.']],note:'Five destinations in this thread. Entry documents and conditions apply.'},
    'C04-2': {rows:[['Stay','Up to 30 visa-free days; exemption ends December 31, 2026.'],['Documents','Passport valid 6 months, confirmed return ticket and hotel booking.'],['Arrival card','Submit Malaysia Digital Arrival Card 3 days before arrival.']]},
    'C04-3': {rows:[['Stay','30 visa-free days; maximum 2 entries per calendar year. Effective September 15, 2026.'],['Before arrival','TDAC within 3 days; accommodation and onward travel within 30 days.'],['Funds','THB 20,000/person or THB 40,000/family.']],note:'An extension of up to 30 days is discretionary.',noPhoto:true},
    'C04-4': {rows:[['Per entry','Up to 14 visa-free calendar days from border crossing.'],['Total limit','42 calendar days in any 180-day period.']],note:'Leaving and returning does not reset the 42-day allowance.'},
    'C04-5': {rows:[['Stay','14 visa-free days, non-extendable and non-convertible.'],['Documents','Hotel, funds and onward/return proof. Passport valid 6 months beyond the stay.']],note:'Transit-only trips still require a transit visa.'},
    'C04-6': {rows:[['Visa','No visa required for Indian passports.'],['Tourist ceiling','Up to 6 months per calendar year; actual visit length is decided at entry.'],['Documents','Return ticket, confirmed stay and funds. Passport must outlast the stay.']],note:'Gainful activity requires a valid residence permit.'},
    'C05-1': {rows:[['Japan','Digital Nomad: 6 months, no extension.'],['Thailand DTV','5-year multiple-entry validity; 180 days per entry.']],note:'Five routes in this thread. Worker, money, nationality and application-location requirements differ.'},
    'C05-2': {rows:[['Funds','Evidence of THB 500,000 and remote work or freelancing.'],['Duration','5-year multiple-entry visa; 180 days per entry. Extend once by up to 180 days, then leave and re-enter.'],['London only','Permanent residence: UK, Ireland or British Overseas Territories. Police clearance ≤6 months old.']],note:"Apply within London's consular jurisdiction."},
    'C05-3': {rows:[['Tech income','At least USD 24,000/year for freelancers or remote employees.'],['Non-tech income','USD 60,000/year minimum.'],['Pass + territory','3-12 months; up to 24 with renewal. Peninsular Malaysia and Labuan.']],note:'Employees need a foreign employer; freelancers may serve Malaysian clients. Contracts must start at least 3 months before application.'},
    'C05-4': {rows:[['Annual income','At least JPY 10 million for remote work.'],['Insurance','Death, injury or illness cover; at least JPY 10 million for injury/illness treatment.'],['Stay','6 months, no extension.']],note:'Principal-applicant nationality list: US included; India absent. The spouse/child list differs.'},
    'C05-5': {rows:[['Monthly income','USD 3,000 individual / USD 4,000 with dependants, from overseas work. Evidence for the previous year.'],['Medical cover','At least USD 50,000 for the full stay; each dependant covered.'],['Estancia','1 year, renewable once.']],note:'Renewal requires at least 80 days physically in Costa Rica.'},
    'C05-6': {rows:[['Expected income','At least USD 50,000 over the intended 12 months.'],['Fee after approval','USD 2,000 individual / USD 3,000 family; non-refundable.'],['Work + duration','12 months of remote work for overseas clients or employers.']],note:'Reapplication is possible after the year.'},
    'N07-1': {rows:[['Japan','90-day short-stay visa exemption.'],['Thailand','30 tourist days under the September 15, 2026 scheme.'],['United Kingdom','Visa-exempt tourism; advance ETA required unless individually exempt.']],note:'Five destinations in this thread, with stay limits and entry documents.'},
    'N07-2': {rows:[['Short stay','90 days under the visa exemption for US citizens.'],['Activity limit','No income-earning activities under this exemption.']],note:'Sightseeing fits this route. Paid work needs the appropriate immigration status.'},
    'N07-3': {rows:[['Stay','Up to 90 days, counted from the day after arrival; non-extendable tourist stay.'],['Documents','US passport valid for the whole stay; confirmed return/onward travel and onward visa if required.'],['Arrival card','Submit within 7 days before arrival.']],noPhoto:true},
    'N07-4': {rows:[['Permission','US citizens need neither visitor visa nor eTA.'],['Duration','Usually up to 6 months; the officer can set a different end date.'],['Passport','Valid US passport. Follow any date on the entry record.']],note:'Without a stamp, earlier passport expiry can shorten the default stay.',noPhoto:true},
    'N07-5': {rows:[['Tourist stay','Visa-free for up to 6 months; passport must cover the stay.'],['ETA','Normally required before travel; GBP 20 per application. Each traveller, including children, needs one.'],['Entry evidence','Funds and plans to leave after the visit.']],note:'British/Irish citizenship or existing UK permission may exempt an individual from ETA.',noPhoto:true},
    'N07-6': {rows:[['Stay','30 visa-free days; up to 2 entries per calendar year.'],['Arrival','Free TDAC within 3 days. Accommodation and onward travel within 30 days.'],['Funds','THB 20,000/person or THB 40,000/family.']],note:'30-day extensions are discretionary.',noPhoto:true},
    'E09-1': {rows:[['Nepal','Visa-free for Indian nationals.'],['Indonesia','B1 visa on arrival: IDR 500,000 for up to 30 days.'],['Vietnam','Advance eVisa, up to 90 days; single or multiple entry.']],note:'Five tourist-entry examples in this thread. These are different permission routes.'},
    'E09-2': {rows:[['Visa','Indian nationals do not need a visa.'],['Accepted ID','Valid Indian passport or Election Commission voter card.']],note:'Nepal Tourism Board says Aadhaar is not an accepted travel document.'},
    'E09-3': {rows:[['Entry permit','Required for Indian visitors. Carry Indian passport or voter ID; stay follows approved permit dates.'],['Adult SDF','INR 1,200/night. Five inland nights = INR 6,000 SDF only.'],['Other costs','Accommodation and mandatory guide are additional.']]},
    'E09-4': {rows:[['Permission','Tourist visa issued on arrival; admissibility assessed at arrival.'],['Documents','MRZ passport valid at least 1 month, prepaid registered accommodation and return ticket.'],['Declaration','Each traveller submits free IMUGA within 96 hours before arrival.']],note:'Check the stay granted at arrival. IMUGA is a declaration, not an eVisa.'},
    'E09-5': {rows:[['B1 tourist visa','IDR 500,000; up to 30 days, one extension to 60 days total. Indian passports eligible.'],['Documents','Passport valid at least 6 months; onward/return ticket.']],note:'Online e-VOA is available. Use within 90 days of issue; this is not a 90-day stay.'},
    'E09-6': {rows:[['eVisa','Up to 90 days for Indian tourists; apply in advance.'],['Fees','USD 25 single-entry / USD 50 multiple-entry; no refund if refused.'],['Entry','Valid passport; follow granted dates and use designated eVisa gates.']]},
  };
  const excerpt=excerpts[thread.id+'-'+post.number];
  const usePhoto=items.length===1&&photoSlug&&thread.id!=='C05'&&!excerpt.noPhoto;
  if(usePhoto)html+=photo(photoSlug,180);
  else if(items.length===1&&!photoSlug)html=`<div class="legal-scope">${html}${image('flag-'+selected.country)}</div>`;
  else html=`<div class="legal-scope">${html}${photo(photoSlug,96)}</div>`;
  html+=detailRows(excerpt.rows);
  if(excerpt.note)html+=note(excerpt.note);
  const authorities=[...new Set(thread.sources.filter(s=>s.supports?.some(s=>s.posts.includes(post.number))).map(s=>new URL(s.url).hostname.replace('www.','')))];
  const sourceLabels={'C04-1':'HCI Kuala Lumpur · Malaysia Immigration · Kazakhstan MFA','C05-1':'Japan MOFA · Royal Thai Embassy, London','N07-1':'Japan MOFA · Thai Embassy · GOV.UK','E09-1':'Nepal Tourism Board · Indonesia Immigration · Vietnam Government'};
  const authorityLabels={'C04-2':'HCI Kuala Lumpur · Malaysia Immigration','C04-3':'Thai embassies · Thailand MFA','C05-2':'Royal Thai Embassy, London','C05-4':'Japan MOFA · Immigration Services Agency','N07-5':'GOV.UK','N07-6':'Thai embassies · Thailand MFA'};
  const credit=photoSlug?` · Photo: ${cities.get(photoSlug)?.name||selected.country}${photoSlug==='taipei'?' / Travel Taipei':''}`:'';
  return{headline:thread.id==='C05'&&post.number===2?'Thailand DTV: eligibility':thread.id==='E09'&&post.number===5?'Indonesia: B1 tourist visa':post.visual.headline,html,kind:photoSlug?'country-photo-and-rule-summary':'native-flag-and-rule-summary',footer:'Rules: '+(sourceLabels[thread.id+'-'+post.number]||authorityLabels[thread.id+'-'+post.number]||authorities.join(' · '))+credit};
}

function citizenshipAsset(thread,item) {
  const kind=item.slug==='turkiye'?'property':item.slug==='jordan'?'business':thread.id==='C10'&&item.slug==='egypt'?'deposit':thread.id==='C10'&&item.slug==='saint-lucia'?'bonds':'contribution';
  return `citizenship-${item.slug}-${kind}`;
}
function citizenshipPlan(thread,post) {
  const items=post.visual.items;
  let headline=post.visual.headline, html=scope(thread.id==='E06'?'Published USD bases · Fees and approval checks additional':'One main applicant · Published currencies · Fees extra');
  if(thread.id==='C10')headline=post.number===1?'Contribution or deposit':'Itemized costs: '+items[0].country;
  if(thread.id==='E06') {
    const comparisons={
      1:{headline:'Property holds: 3, 5 or 7 years',rows:[['Dominica','3 years from citizenship; 5 years before resale to another CBI applicant.'],['Saint Kitts and Nevis','Approved developer property: minimum 7-year hold.']],note:'Five Caribbean programs. Qualifying family and asset conditions differ; fees additional.'},
      2:{headline:'Dominica: contribution or property',rows:[['EDF contribution','USD 200,000 single / USD 250,000 applicant + up to 3 qualifying dependants.'],['Approved property','From USD 200,000 + USD 75,000 main-applicant government fee.'],['Property hold','3 years from citizenship; 5 years before resale to another CBI applicant.']],note:'Other fees are separate.'},
      3:{headline:'Antigua and Barbuda: two routes',rows:[['NDF contribution','USD 230,000 for up to 4 qualifying family members + USD 20,000 processing.'],['Approved property','From USD 300,000.'],['Property hold','5 years from purchase, unless replaced with another officially approved property.']],note:'Larger NDF families retain the USD 230,000 base; incremental processing and other fees apply.'},
      4:{headline:'Grenada: two routes',rows:[['NTF contribution','USD 235,000, up to 4 qualifying family members. Extra for siblings and parents/grandparents ≤55.'],['Tourism share','USD 270,000 + USD 50,000 government contribution. Approved units, 2+ joint buyers; developer equity conditions.'],['CBI resale','5 years from citizenship before resale to another CBI applicant.']],note:'General project threshold: USD 350,000. Extra fees apply.'},
      5:{headline:'Saint Kitts and Nevis: a 7-year hold',rows:[['SISC contribution','USD 250,000 for one applicant or up to 4 qualifying family members.'],['Extra dependants','USD 25,000 under 18 / USD 50,000 at 18+.'],['Developer property','From USD 325,000; minimum 7-year hold. USD 25,000 main-applicant post-approval fee.']],note:'Approved developer units only. Due diligence and purchase costs extra.'},
      6:{headline:'Saint Lucia: contribution or bonds',rows:[['NEF contribution','USD 240,000: applicant + up to 3 qualifying dependants.'],['National Action Bonds','USD 300,000 + USD 50,000 administration. Any number of qualifying dependants.'],['Bond hold',"5 years from first issue, in applicant's name; no interest."]],note:'USD 350,000 financial-resources declaration also applies. Processing, due diligence and other fees extra.'},
    };
    const comparison=comparisons[post.number];
    html=shot(citizenshipAsset(thread,items[0])+'-identity',672)+detailRows(comparison.rows)+note(comparison.note+' Approval required.');
    return{headline:comparison.headline,html,kind:'citizenship-comparison',footer:'Hashtag Web3 · Official program rules'};
  }
  if(items.length===2) {
    const selections={
      'C02-1':[['USD 90,000 fund donation'],['Qualifying property · 3-year resale restriction']],
      'C02-2':[['Non-refundable EDF contribution. Authorised agent submits.'],['NDF contribution. Licensed local agent submits.']],
      'C02-3':[['NTF contribution; payment follows approval.'],['Sworn declaration: at least USD 350,000 financial resources. This is not another payment.']],
      'C02-4':[['Sustainable Island State Contribution. Main-applicant interview required.'],['Qualifying property. At least 3-year resale restriction; subject to presidential decision.']],
      'C02-5':[['Single-applicant donation after approval in principle.'],['Regular: USD 115,000. Offer: USD 90,000 for applications filed prior to December 31, 2026.']],
      'C02-6':[['Non-refundable Treasury grant; transfer from abroad. USD 10,000 application fee separate.'],["Outside Capital Governorate: eligible asset share averages JOD 350,000 over 3 audited years. Average 10 Jordanian employees, at least 9 each month."]],
      'E06-1':[['Property hold: 3 years from citizenship; 5 years for resale to another CBI applicant.'],['Approved developer property: minimum 7-year hold.']],
      'C10-1':[['EDF USD 200,000 + four listed fees USD 10,000 = USD 210,000 subtotal.'],['USD 500,000 deposit capital + USD 10,000 application fee. Capital repayment is in EGP.']],
    };
    html+=items.map((item,i)=>`<section class="country-block"><div class="country-price"><h2>${esc(item.country)}</h2>${shot(citizenshipAsset(thread,item)+'-price',740)}</div>${facts(selections[thread.id+'-'+post.number][i])}</section>`).join('');
    if(thread.id==='C02'&&post.number===1)html+=note('10 selected routes. Eligibility and approval required; amounts exclude fees.');
    else if(thread.id==='C02'&&post.number===5)html+=note('Submission, document and due-diligence fees are additional.');
    else if(thread.id==='C10')html+=note('Unlisted professional, document and transaction costs remain extra.');
  } else if(thread.id==='C10') {
    const item=items[0];html=scope('One main applicant · USD · Listed fees')+shot(citizenshipAsset(thread,item)+'-identity',672);
    const rows={
      2:[['EDF contribution','200,000'],['Processing','1,000'],['Due diligence','7,500'],['Naturalisation certificate','500'],['Interview','1,000']],
      3:[['NDF contribution','230,000'],['Processing','10,000'],['Due diligence','8,500'],['Passport','300']],
      4:[['Donation','90,000'],['Submission','5,000'],['Citizenship documents','750']],
      5:[['Bond capital','300,000'],['Administration','50,000'],['Processing','2,000'],['Due diligence','8,000']],
      6:[['Deposit capital','500,000'],['Non-refundable application fee','10,000']],
    };
    html+=`<div class="fee-list">${budget(rows[post.number])}</div><p class="fee-total">USD ${['','', '210,000','248,800','95,750','360,000','510,000'][post.number]} subtotal</p>`;
    const conditions={
      2:'Agent, passport, bank and any enhanced-check costs remain extra.',
      3:'Single applicant. Agent charges additional.',
      4:'USD 750 includes registration certificate, passport and national ID. Sponsored applications add USD 5,000 benefactor due diligence; agent costs extra.',
      5:'Bonds: 5 years, no interest. Fees are separate from capital. USD 350,000 financial-resources declaration also applies; other costs excluded.',
      6:'Deposit repayment after 3 years in Egyptian pounds at the Central Bank rate on repayment. No interest; no promise of repayment in USD.',
    };
    html+=note(conditions[post.number]);
  } else {
    const item=items[0];html+=shot(citizenshipAsset(thread,item)+'-price',1040)+body(post.text,'legal-summary');
    const extras={2:'Property government fee: USD 75,000 for the main applicant. Other fees separate.',3:'NDF family up to 4: USD 20,000 processing extra. Qualifying family members only.',4:'The USD 270,000 share is for qualifying approved tourism units, jointly purchased by 2 or more; developer equity conditions apply.',5:'Property post-approval fee: USD 25,000 for the main applicant. Due diligence and purchase costs extra.',6:'USD 350,000 financial-resources declaration also applies. Bond holding runs from first issue; other fees separate.'};
    html+=note(extras[post.number]);
  }
  return{headline,html,kind:'citizenship-comparison',footer:'Hashtag Web3 · Official program rules'};
}

function invoicePlan(thread,post) {
  let html=scope('Sample invoice (USD) · Not payable');
  let headline=post.visual.headline;
  if(post.number===1){headline='Sample invoice · USD 750';html+=shot('INVOICE-sample-header-dates',1128);}
  if(post.number===2)html+=shot('INVOICE-sample-first-row',1072)+answer('Description carries the unit','"Hours" is typed in Description; there is no separate hours selector.');
  if(post.number===3)html+=shot('INVOICE-sample-subtotal',1128)+answer('Sample subtotal','USD 600 + USD 200 = USD 800');
  if(post.number===4)html+=shot('INVOICE-sample-totals',1000)+note('Tax input: 0% for this sample only. Flat discount: USD 50. The preview omits the zero tax row.');
  if(post.number===5)html+=shot('INVOICE-sample-notes-readable',1128)+answer('Typed payment instructions','Payment Method and Notes are text fields. The sample agreement does not convert currencies.',['Wallet field is empty; no payment requested.']);
  if(post.number===6) {
    headline='SAMPLE-016 · USD 750';
    html=scope('Sample invoice · Due November 30, 2026')+shot('INVOICE-sample-totals',1128)+note('Sample settlement: 750 USDC on Ethereum mainnet at an agreed 1 USD = 1 USDC. Wallet field empty; no payment requested.');
  }
  return{headline,html,kind:'invoice-example',footer:'Hashtag Web3 Invoice Generator',className:'compact'};
}

window.showRevision=async(threadId,number)=> {
  const thread=content.threads.find(t=>t.id===threadId);
  if(!thread||thread.sequence<=5||publishedIds.has(threadId))throw Error('Only unpublished threads after October 22, 2026 can be rendered.');
  const date=calendar.dates.find(d=>d.id===threadId)?.date;
  if(!date||date<'2026-10-23'||date>'2026-11-16')throw Error('Publication date is outside the future campaign window.');
  const post=thread.posts.find(p=>p.number===number);
  if(!post)throw Error('Unknown post: '+threadId+'-'+number);
  if(typeof post.alt!=='string'||post.alt.length<100||post.alt.length>1000)throw Error('Curated alt must be 100-1000 characters: '+threadId+'-'+number);
  const type=post.visual.items[0].type;
  const fn={city:cityPlan,salary:salaryPlan,'country-market':marketPlan,event:eventPlan,interview:questionPlan,quiz:quizPlan,resume:resumePlan,learning:lessonPlan,passport:legalPlan,visa:legalPlan,citizenship:citizenshipPlan,invoice:invoicePlan}[type];
  if(!fn)throw Error(type);
  const plan=fn(thread,post);
  const html=`<article class="board ${plan.className||''}" role="img" aria-label="${esc(post.alt)}" data-id="${thread.id}-${String(number).padStart(2,'0')}"><header><div class="masthead"><img class="wordmark" src="assets/wordmark.png" alt="Hashtag Web3"><p class="serial">${esc(topic[thread.id])}</p></div><h1 class="heading${plan.headline.length>65?' long':''}">${esc(plan.headline)}</h1></header><section class="stage">${plan.html}</section><footer class="footer"><p class="source">${esc(plan.footer||'Hashtag Web3 city directory')}</p><p class="count">${thread.id} · ${number}/6</p></footer></article>`;
  document.querySelector('#mount').innerHTML=html;
  await document.fonts.ready;
  await Promise.all([...document.images].map(i=>i.decode()));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  return {kind:plan.kind,heading:plan.headline,alt:post.alt,assets:[...new Set([...document.querySelectorAll('[data-asset]')].map(el=>el.dataset.asset))].map(id=>assets.get(id))};
};
document.documentElement.dataset.ready='true';

const [content, assetData, sourceData] = await Promise.all(['content.json','assets/revision/visual-assets.json','assets/revision/source-data.json'].map(async file => {const r=await fetch(file);if(!r.ok)throw Error(file);return r.json()}));
const assets=new Map(assetData.assets.map(a=>[a.id,a]));
const cities=new Map(sourceData.cities.map(c=>[c.slug,c]));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Number(v).toLocaleString('en-US',{maximumFractionDigits:1});
const countryPhotos={Malaysia:'kuala-lumpur',Thailand:'bangkok',Philippines:'manila',Japan:'osaka',Taiwan:'taipei',Canada:'toronto','United Kingdom':'london',Nepal:'kathmandu',Indonesia:'bali',Vietnam:'da-nang'};
const topic={C02:'Citizenship routes',E02:'Salary calculator',N02:'Remote markets',C03:'City budgets',E03:'Career quiz',N03:'Solidity interviews',C04:'Indian passport',E04:'City-based ranking',N04:'Frontend interviews',C05:'Remote-work visas',E05:'Broadband + budget',N05:'Resume Builder',C06:'November events',E06:'Family citizenship',N06:'Safety + budget',C07:'Security interviews',E07:'Salary calculator',N07:'US passport',C08:'Career practice',E08:'December climate',N08:'2027 conferences',C09:'Resume rewrites',E09:'Indian passport',N09:'Learning library',C10:'Citizenship costs',E10:'Walkable cities',N10:'Invoice Generator'};
function image(id,cls='',style='') {const a=assets.get(id);if(!a)throw Error('Missing source asset: '+id);return `<img data-asset="${esc(id)}" data-source-kind="${a.kind}" src="${esc(a.file)}" alt="${esc(a.caption||a.visibleText||a.credit)}" class="${cls}" style="${style}">`;}
const shot=(id,width,caption='')=>`<figure class="shot"${width?` style="width:${width}px"`:''}>${image(id)}${caption?`<figcaption class="shot-caption">${esc(caption)}</figcaption>`:''}</figure>`;
const body=(text,cls='')=>`<p class="body ${cls}">${esc(text)}</p>`;
const scope=text=>`<p class="scope">${esc(text)}</p>`;
const note=text=>`<p class="note">${esc(text)}</p>`;
const facts=items=>`<div class="facts">${items.map(f=>`<p class="fact">${esc(f)}</p>`).join('')}</div>`;
const answer=(title,text,extra=[])=>`<section class="answer"><p class="eyebrow">${esc(title)}</p><p class="body">${esc(text)}</p>${facts(extra)}</section>`;
const photo=(slug,height=360)=>image('photo-'+slug,'photo',`height:${height}px${slug==='taipei'?';object-position:center top':''}`);
const metric=(label,value,unit='',wide=false)=>`<div class="metric${wide?' wide':''}"><dt>${esc(label)}</dt><dd>${esc(value)}${unit?` <span class="unit">${esc(unit)}</span>`:''}</dd></div>`;
const budget=rows=>`<div class="budget">${rows.map(([label,value,total])=>`<div class="budget-row${total?' total':''}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div>`;

function cityPlan(thread,post) {
  const items=post.visual.items, kind=thread.id;
  const reference=items.some(i=>i.slug==='taipei')?'Travel Taipei':items.some(i=>i.slug==='cartagena')?'ProColombia':null;
  const footer=reference?`${items.length>1?'Photos: directory / ':'Photo: '}${reference} · Authored directory metrics`:undefined;
  const periods={C03:'Monthly USD estimates. Broadband: 2026 Q1.',E04:'City/base site scores /100. Monthly USD estimates.',E05:'Fixed broadband, 2026 Q1. Monthly USD estimates.',N06:'Site safety /10 · Broadband: 2026 Q1 · Monthly USD estimates',E08:'December monthly climate reference, not a forecast.',E10:'Walkability: site rating /10. Broadband: 2026 Q1.'};
  let headline=post.visual.headline, html=scope(periods[kind]);
  if(post.number===1&&kind==='E08'){headline='December: five warm bases';html=scope('December reference, not a forecast');}
  if(post.number===1&&kind==='E10'){headline='Walkable, connected cities';html=scope('Site walkability · Broadband: 2026 Q1');}
  if(post.number===1&&kind==='N06')headline='Safety + budget: five cities';
  if(items.length>=3) {
    html+=`<div class="rows">${items.map((item,index)=>{
      const city=cities.get(item.slug);let text=item.facts.join(' · ');
      if(kind==='E08')text=`${city.december.temp}°C · ${city.december.rain} mm rain\nUSD ${num(city.cost.monthly_total)}/month estimated`;
      if(kind==='E10')text=`Walk ${city.walkability.walk}/10 · ${city.internet.download_mbps} Mbps down\nUSD ${num(city.cost.monthly_total)}/month estimated`;
      return `<div class="city-row${kind==='E08'||kind==='E10'?' dense':''}">${photo(item.slug,146)}<div><h2>${index+1}. ${esc(city.name)}${kind==='E04'?', '+esc(item.country):''}</h2><p>${esc(text).replaceAll('\n','<br>')}</p></div></div>`;
    }).join('')}</div>`;
    if(kind==='E08')html+=note('Mean ≥25°C · Rain ≤80 mm · Cost ≤USD 1,300/month estimated. Rainfall order.');
    else if(kind==='E10')html+=note('Walk ≥7.5; download ≥200 Mbps; cost ≤USD 1,800. Missing walk scores excluded.');
    else if(kind==='E04')html+=note('Best-scoring base per country. Ties: lower cost, then name. City scores are not national scores.');
    else if(kind==='N06')html+=note('Both filters: safety ≥8/10 and cost ≤USD 1,500/month. Safety is not an official crime index.');
    else if(kind==='E05')html+=note('City-level reference speeds. Your accommodation connection can differ.');
    else html+=note('Regional shortlist, ordered by estimated total. Rent and coworking are included.');
    return {headline,html,kind:'city-photo-ranking',footer};
  }
  if(items.length===2) {
    html+=items.map(item=>{const city=cities.get(item.slug);return `<section class="city-pair">${photo(item.slug,270)}<div><h2>${esc(item.country)}<br>${esc(city.name)}</h2>${body(`${city.score}/100 site score\nUSD ${num(city.cost.monthly_total)}/month estimated`)}</div></section>`}).join('');
    html+=note(post.text.split('\n').at(-1));
    return{headline,html,kind:'city-photo-comparison',footer};
  }
  const item=items[0], city=cities.get(item.slug);
  headline=city.name===item.country?city.name:`${city.name}, ${item.country}`;
  html+=photo(item.slug,kind==='C03'?310:355);
  if(kind==='C03') {
    html+=budget([['Monthly estimate',`USD ${num(city.cost.monthly_total)}`,true],...['rent','food','transport','coworking','other'].map(k=>[k[0].toUpperCase()+k.slice(1),num(city.cost[k])])]);
    html+=body(`2026 Q1 fixed broadband\n${city.internet.download_mbps} down / ${city.internet.upload_mbps} up Mbps`);
  } else if(kind==='E08') {
    html+=`<dl class="metric-grid">${metric('December mean',city.december.temp,'°C')}${metric('Monthly rain',city.december.rain,'mm')}${metric('Humidity',city.december.humidity,'%')}${metric('Monthly estimate',num(city.cost.monthly_total),'USD')}</dl>`;
    html+=note(item.slug==='lagos'?'Site safety rating: 4/10. This is a weather-and-budget selection.':item.facts.at(-1));
  } else {
    const metrics=item.metrics||[];
    html+=`<dl class="metric-grid">${metrics.filter(m=>m.label!=='Rent'&&m.label!=='Site transit').map(m=>metric(m.label==='Monthly estimate'?'Monthly USD estimate':m.label,num(m.value),m.unit==='USD/month'?'':m.unit)).join('')}</dl>`;
    const extra=kind==='E05'?(item.facts[2]||'City-level reference, not apartment Wi-Fi.'):kind==='N06'?'Safety is a site rating, not an official crime index.':item.facts[0];
    html+=note(extra);
  }
  return{headline,html,kind:'city-photo-metrics',footer};
}

const salaryRoles=['contract','auditor','product','writer','community'];
const salaryNames=['Smart Contract Developer','Security Auditor','Product Manager','Technical Writer','Community Manager'];
function salaryPlan(thread,post) {
  let html,headline;
  const assumptions='North America · Series A/B · 11-50 employees';
  const disclaimer='Model estimates, not observed pay. Tokens and equity excluded.';
  if(thread.id==='E02') {
    if(post.number===6) {
      headline='Five roles, identical inputs';
      html=scope('Annual USD model estimates · 2 years')+body(assumptions)+`<div>${post.visual.items.map(item=>{const i=salaryNames.indexOf(item.title);return `<div class="salary-row"><h2>${esc(item.title)}</h2>${image(`E02-${salaryRoles[i]}-result-amount`)}</div>`}).join('')}</div>`+note('USD 70,000 gap: Security Auditor minus Community Manager. '+disclaimer);
    } else {
      const role=salaryRoles[post.number-1];headline=salaryNames[post.number-1];
      html=scope('Annual USD salary model · 2 years')+shot(`E02-${role}-controls-role`,820)+shot(`E02-${role}-result-value`,980)+body(assumptions)+note(disclaimer);
    }
  } else {
    if(post.number===6) {
      headline='The 1-to-7-year model gap';
      html=scope('Annual USD estimates · Same assumptions')+body(assumptions)+['auditor','community'].map((r,i)=>`<section class="salary-gap"><h2>${i===0?'Security Auditor':'Community Manager'}</h2><div class="values"><div><p>1 year</p>${image(`E07-${r}-junior-result-amount`)}</div><div><p>7 years</p>${image(`E07-${r}-senior-result-amount`)}</div></div><p class="delta">Difference: USD ${i===0?'36,000':'18,000'}/year</p></section>`).join('')+note(disclaimer);
    } else {
      const role=salaryRoles[post.number-1];headline=salaryNames[post.number-1];
      html=scope('Annual USD model estimates')+body(assumptions)+['junior','senior'].map((variant,i)=>`<section class="salary-result"><p class="caption">${i===0?'Junior example: 1 year':'Senior example: 7 years'}</p>${shot(`E07-${role}-${variant}-result-value`,980)}</section>`).join('')+note(disclaimer);
    }
  }
  return{headline,html,kind:'genuine-salary-results',footer:'Salary calculator · Real app, local capture'};
}

function marketPlan(thread,post) {
  const items=post.visual.items;
  let html=scope('Historical snapshot · October 20, 2026');
  if(post.number===1)html+=`<table class="counts-table"><thead><tr><th>Eligible country</th><th>Listings</th><th>Employers</th></tr></thead><tbody>${items.map(i=>`<tr><td>${esc(i.country)}</td><td class="number">${parseInt(i.facts[0])}</td><td class="number">${parseInt(i.facts[1])}</td></tr>`).join('')}</tbody></table>`+note('Explicit-country eligibility only. Multi-country listings count in each named country.');
  else {
    const item=items[0];html+=item.metrics.map(m=>`<section class="count-metric"><div class="big-number">${m.value}</div><p>${m.label==='Employers'?'Distinct employers':'Fully remote listings'}</p></section>`).join('');
    html+=note(post.text);
  }
  return{headline:post.number===1?'Remote Web3: country counts':items[0].country,html,kind:'authored-historical-aggregate',footer:'Authored chart · Dated catalog counts, not live vacancies'};
}

function eventPlan(thread,post) {
  const items=post.visual.items;let html=scope(thread.id==='C06'?'November 2026 · Organizer checks: October 20':'Announced 2027 dates · Checked October 20, 2026');
  if(items.length>1)html+=items.map(item=>`<section class="event-row">${image('poster-'+item.id)}<div><h2>${esc(item.title)}</h2><p>${esc(item.facts.join(' · '))}</p></div></section>`).join('');
  else {
    const item=items[0];html+=`<figure class="poster-frame">${image('poster-'+item.id)}</figure>`+`<p class="legal-summary">${esc(post.text)}</p>`;
  }
  return{headline:thread.id==='N08'&&post.number===1?'Five 2027 main conferences':post.visual.headline,html,kind:items.length>1?'event-poster-index':'event-poster-and-facts',footer:thread.id==='N08'&&post.number===3?'Actual Cannes photo · Organizer-announced dates':thread.id==='N08'&&post.number<=2?'Live organizer date panel + imagery · Authored captions':'Actual organizer covers · Dates and admission: authored captions'};
}

function questionPlan(thread,post) {
  const item=post.visual.items[0];
  const introPost={N03:4,N04:3,C07:4}[thread.id];
  const n=post.number===1?introPost:post.number;
  const id=[...assets.keys()].find(k=>k.startsWith(`${thread.id}-${String(n).padStart(2,'0')}-`) && /-(SOL|FE|AUD)-/.test(k));
  const summary=post.number===1?item.answer:post.text.split('A: ')[1]||item.answer;
  const extraIndex={'N03-3':1,'N03-6':2,'N04-3':1,'C07-3':2,'C07-5':2};
  const extra=extraIndex[thread.id+'-'+post.number]!==undefined?[item.facts[extraIndex[thread.id+'-'+post.number]]]:[];
  return{headline:post.visual.headline,html:scope(post.visual.labels.join(' · '))+shot(id,1128)+answer('Answer summary · authored',summary,extra),kind:'real-question-and-authored-answer',footer:'Original question: live Hashtag Web3 interview bank'};
}

function quizPlan(thread,post) {
  const id=thread.id+'-'+post.number;
  const map={'E03-1':['builder',1],'E03-2':['strategist',1],'E03-3':['analyst',1],'E03-4':['weaver',1],'E03-5':['builder',2],'C08-2':['builder',1],'C08-3':['analyst',1],'C08-4':['weaver',1],'C08-5':['analyst',2]};
  if(post.number===6) {
    const a=thread.id==='E03'?'builder':'analyst';
    return{headline:`The ${a==='builder'?'Builder':'Analyst'}: three role matches`,html:scope('Actual 16-question quiz result')+[1,2,3].map(i=>shot(`QUIZ-${a}-role-0${i}`,1000)).join(''),kind:'actual-quiz-role-list',footer:'Career quiz · Three genuine role-card crops, local capture',className:'compact'};
  }
  if(id==='C08-1')return{headline:'Code, research or community',html:[['builder','Builder · Example: contract + tests'],['analyst','Analyst · Example: query + methodology'],['weaver','Weaver · Example: support runbook']].map(([a,label])=>`<section class="quiz-role"><p class="caption">${esc(label)}</p>${shot(`QUIZ-${a}-role-01`,960)}</section>`).join(''),kind:'actual-quiz-role-comparison',footer:'Real recommendations · Proposed practice outputs, not quiz assignments',className:'compact'};
  const [archetype,role]=map[id],item=post.visual.items[0];
  let html=scope('Actual quiz result · Practice task is an example');
  if(thread.id==='E03')html+=shot(`QUIZ-${archetype}-archetype`,archetype==='weaver'?640:900);
  html+=shot(`QUIZ-${archetype}-role-0${role}`,1060);
  const proposed=thread.id==='C08'?item.facts.join('\n'):item.facts.filter(f=>f.startsWith('Example')).join('\n');
  html+=answer('Proposed practice output',proposed);
  return{headline:post.visual.headline,html,kind:'real-quiz-and-practice-caption',footer:'Career quiz · Real application rendered locally',className:archetype==='weaver'?'compact':''};
}

function resumePlan(thread,post) {
  let html=scope('Fictional practice example · Actual Resume Builder');
  let headline=post.visual.headline;
  if(thread.id==='N05') {
    if(post.number===1)html+=shot('RESUME-junior-summary',1050)+note('Example wording. No real candidate or employment claim.');
    if(post.number===2)html+=shot('RESUME-junior-project-name-role',1000)+shot('RESUME-junior-project-after',1020);
    if(post.number===3)html+=shot('RESUME-junior-project-after',1000)+answer('Example assertions','Unauthorized callers revert.\nRepeat withdrawals revert.',['These are example resume assertions, not results from a real repository.']);
    if(post.number===4)html+=shot('RESUME-junior-project-after',1000)+shot('RESUME-junior-project-link',1000)+note('Proposed README command: forge test. The fictional sample has no repository.');
    if(post.number===5)html+=shot('RESUME-junior-skills',1128)+note(post.text);
    if(post.number===6) {
      headline='Completed practice resume';
      html=scope('Project + skills excerpts · No employment entries')+shot('RESUME-junior-project-after',900)+shot('RESUME-junior-skills',900);
    }
  } else {
    if(post.number<=3) {
      const variant=['technical','community','content'][post.number-1];
      html+=`<p class="caption">Before</p>`+shot(`RESUME-${variant}-project-before`,1080)+`<p class="caption">After</p>`+shot(`RESUME-${variant}-project-after`,1080);
    } else if(post.number===4) {
      headline='Three practice summaries';
      html=['technical','community','content'].map((v,i)=>`<section class="quiz-role"><p class="caption">${esc(post.visual.items[i].title)}</p>${shot(`RESUME-${v}-summary-text`,1000)}</section>`).join('');
    } else if(post.number===5) {
      html=scope('Fictional practice projects · Walkthrough prompts')+shot('RESUME-technical-project-after',970)+shot('RESUME-community-project-after',970)+note('Technical: disconnect, load balance, simulate RPC error.\nSupport: classify, assign, record resolution.');
    } else html+=shot('RESUME-content-project-after',1128)+answer('Key Projects & Portfolio','Project Name · Your Role · Description · Link',['The sample link is empty. Download PDF exports the preview.']);
  }
  return{headline,html,kind:'genuine-resume-example',footer:'Resume Builder · Real app, local capture · Fictional sample',className:'compact'};
}

function lessonPlan(thread,post) {
  let html;
  if(post.number===1) {
    html=shot('N09-01-library-excerpt',1128)+`<div class="learning-index">${post.visual.items.map(i=>`<div><h2>${esc(i.title)} · ${esc(i.facts[0])}</h2><p>${esc(i.facts[1].replace('Selected module: ',' '))}</p></div>`).join('')}</div>`;
  } else {
    const names=['wallet','lending','testing','growth','agents'],item=post.visual.items[0];
    html=scope(post.visual.labels.join(' · '))+shot('lesson-'+names[post.number-2],1128)+answer('Lesson summary · authored',post.text.split('\n').slice(1).join('\n'));
    if(post.number===4)html=scope(post.visual.labels.join(' · '))+shot('N09-04-transfer-excerpt',1128,'Actual test_Transfer excerpt; this is not a test-result log.')+answer('Lesson summary · Sample raw units',post.text.split('\n').slice(1).join('\n'));
  }
  return{headline:post.visual.headline,html,kind:'real-lesson-and-authored-summary',footer:'Live Hashtag Web3 lesson excerpt · Course context from manuscript',className:post.number===4?'compact':''};
}

function legalPlan(thread,post) {
  const items=post.visual.items, item=items[0];
  let html=scope((thread.id==='C05'?'Remote-work route':thread.id==='N07'?'US ordinary passport · Tourism':'Indian ordinary passport · Tourism')+'\nRules checked October 20, 2026');
  const selected=items.find(i=>countryPhotos[i.country])||item;
  const photoSlug=countryPhotos[selected.country];
  html+=photoSlug?photo(photoSlug,340):image('flag-'+selected.country,'flag-photo');
  html+=`<p class="photo-credit">${esc(photoSlug==='taipei'?'Taipei photo: Travel Taipei. Rule summary below.':photoSlug?`Place illustration: ${photoSlug.replaceAll('-',' ')}. Rule summary below.`:'Country flag. Rule summary below is authored from official sources.')}</p>`;
  html+=`<p class="legal-summary">${esc(post.text)}</p>`;
  const extras={
    'C04-3':'Extension up to 30 days is discretionary.',
    'C04-6':'Actual visit length is decided at entry. Gainful activity requires a valid residence permit.',
    'C05-3':'Foreign employer for employees; freelancers may serve Malaysian clients. Contracts must have started at least 3 months before application.',
    'C05-5':'Renewal requires at least 80 days physically in Costa Rica. Each dependant needs full-stay medical cover.',
    'N07-3':'Count starts the day after arrival. The ordinary tourist stay is non-extendable.',
    'E09-3':'INR 6,000 is the adult SDF only, not a trip price. Stay follows the approved permit dates.',
    'E09-4':'Admissibility is assessed at arrival. No numerical stay limit is asserted here.',
    'E09-5':'The e-VOA must be used within 90 days of issue; this is not a 90-day stay.',
  };
  if(extras[thread.id+'-'+post.number])html+=note(extras[thread.id+'-'+post.number]);
  const source=thread.sources.find(s=>s.supports?.some(s=>s.posts.includes(post.number)));
  return{headline:post.visual.headline,html,kind:photoSlug?'country-photo-and-rule-summary':'native-flag-and-rule-summary',footer:'Official rules: '+new URL(source.url).hostname.replace('www.','')};
}

function citizenshipAsset(thread,item) {
  const kind=item.slug==='turkiye'?'property':item.slug==='jordan'?'business':thread.id==='C10'&&item.slug==='egypt'?'deposit':thread.id==='C10'&&item.slug==='saint-lucia'?'bonds':'contribution';
  return `citizenship-${item.slug}-${kind}`;
}
function citizenshipPlan(thread,post) {
  const items=post.visual.items;
  let headline=post.visual.headline, html=scope(thread.id==='E06'?'Published USD bases · Fees and approval checks additional':'One main applicant · Published currencies · Fees extra');
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
    html+=items.map((item,i)=>`<section class="country-block"><h2>${esc(item.country)}</h2>${shot(citizenshipAsset(thread,item)+(thread.id==='E06'?'-identity':'-price'),960)}${facts(selections[thread.id+'-'+post.number][i])}</section>`).join('');
    if(thread.id==='C02'&&post.number===1)html+=note('Selected from 10 routes in this thread. Eligibility and approval required; amounts are not all-inclusive prices.');
    else if(thread.id==='C02'&&post.number===5)html+=note('Submission, document and due-diligence fees are additional.');
    else if(thread.id==='C10')html+=note('Unlisted professional, document and transaction costs remain extra.');
  } else if(thread.id==='C10') {
    const item=items[0];html+=shot(citizenshipAsset(thread,item)+'-price',980);
    const rows={
      2:[['EDF contribution','200,000'],['Processing','1,000'],['Due diligence','7,500'],['Naturalisation certificate','500'],['Interview','1,000']],
      3:[['NDF contribution','230,000'],['Processing','10,000'],['Due diligence','8,500'],['Passport','300']],
      4:[['Donation','90,000'],['Submission','5,000'],['Citizenship documents','750']],
      5:[['Bond capital','300,000'],['Administration','50,000'],['Processing','2,000'],['Due diligence','8,000']],
      6:[['Deposit capital','500,000'],['Non-refundable application fee','10,000']],
    };
    html+=`<div class="fee-list">${budget(rows[post.number])}</div><p class="fee-total"><small>Authored itemized subtotal · USD</small>${['','', '210,000','248,800','95,750','360,000','510,000'][post.number]}</p>`;
    const conditions={
      2:'Agent, passport, bank and any enhanced-check costs remain extra.',
      3:'Single applicant. Agent charges additional.',
      4:'USD 750 includes registration certificate, passport and national ID. Sponsored applications add USD 5,000 benefactor due diligence; agent costs extra.',
      5:'Bonds: 5 years, no interest. Fees are separate from capital. USD 350,000 financial-resources declaration also applies; other costs excluded.',
      6:'Deposit repayment after 3 years in Egyptian pounds at the Central Bank rate on repayment. No interest; no promise of repayment in USD.',
    };
    html+=note(conditions[post.number]);
  } else {
    const item=items[0];html+=shot(citizenshipAsset(thread,item)+'-price',1040)+`<p class="legal-summary">${esc(post.text)}</p>`;
    const extras={2:'Property government fee: USD 75,000 for the main applicant. Other fees separate.',3:'NDF family up to 4: USD 20,000 processing extra. Qualifying family members only.',4:'The USD 270,000 share is for qualifying approved tourism units, jointly purchased by 2 or more; developer equity conditions apply.',5:'Property post-approval fee: USD 25,000 for the main applicant. Due diligence and purchase costs extra.',6:'USD 350,000 financial-resources declaration also applies. Bond holding runs from first issue; other fees separate.'};
    html+=note(extras[post.number]);
  }
  return{headline,html,kind:'genuine-citizenship-crop-and-comparison',footer:'Directory excerpt: local capture · Conditions and fees: authored from official sources',className:'compact'};
}

function invoicePlan(thread,post) {
  let html=scope('Fictional sample · USD invoice · Not payable');
  let headline=post.visual.headline;
  if(post.number===1)html+=shot('INVOICE-sample-header-dates',1128)+note('SAMPLE-016 · All parties fictional.\nWorked total: USD 750.');
  if(post.number===2)html+=shot('INVOICE-sample-first-row',1128)+answer('Sample line item 1','12 hours × USD 50 = USD 600',['Hours is typed in Description; there is no separate hours selector.']);
  if(post.number===3)html+=shot('INVOICE-sample-subtotal',1128)+answer('Sample subtotal','USD 600 + USD 200 = USD 800');
  if(post.number===4)html+=shot('INVOICE-sample-tax-discount',1100)+shot('INVOICE-sample-totals',1000)+note('Tax input: 0% for this sample only. Flat discount: USD 50. The preview omits the zero tax row.');
  if(post.number===5)html+=shot('INVOICE-sample-notes-readable',1128)+answer('Sample agreement, not a conversion feature','USD 750 billed. Sample settlement: 750 USDC on Ethereum mainnet at an agreed 1 USD = 1 USDC.',['Wallet field is empty. Payment Method and Notes are typed text.']);
  if(post.number===6) {
    headline='SAMPLE-016 · USD 750';
    html=scope('Fictional sample · Due November 30, 2026')+shot('INVOICE-sample-totals',1128)+shot('INVOICE-sample-notes-readable',1128)+note('Payment Method: USDC on Ethereum mainnet, sample only. Wallet field empty. No payment requested.');
  }
  return{headline,html,kind:'genuine-invoice-example',footer:'Invoice Generator · Real local preview excerpts · No payment requested',className:'compact'};
}

window.showRevision=async(threadId,number)=> {
  const thread=content.threads.find(t=>t.id===threadId),post=thread.posts.find(p=>p.number===number);
  if(thread.sequence<=3)throw Error('Published history cannot be rendered by this renderer.');
  const type=post.visual.items[0].type;
  const fn={city:cityPlan,salary:salaryPlan,'country-market':marketPlan,event:eventPlan,interview:questionPlan,quiz:quizPlan,resume:resumePlan,learning:lessonPlan,passport:legalPlan,visa:legalPlan,citizenship:citizenshipPlan,invoice:invoicePlan}[type];
  if(!fn)throw Error(type);
  const plan=fn(thread,post);
  const html=`<article class="board ${plan.className||''}" data-id="${thread.id}-${String(number).padStart(2,'0')}"><header><div class="masthead"><img class="wordmark" src="assets/wordmark.png" alt="Hashtag Web3"><p class="serial">${esc(topic[thread.id])}</p></div><h1 class="heading${plan.headline.length>65?' long':''}">${esc(plan.headline)}</h1></header><section class="stage">${plan.html}</section><footer class="footer"><p class="source">${esc(plan.footer||'City photos: existing directory assets · Authored data labels')}</p><p class="count">${thread.id} · ${number}/6</p></footer></article>`;
  document.querySelector('#mount').innerHTML=html;
  await document.fonts.ready;
  await Promise.all([...document.images].map(i=>i.decode()));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  return {kind:plan.kind,heading:plan.headline,assets:[...new Set([...document.querySelectorAll('[data-asset]')].map(el=>el.dataset.asset))].map(id=>assets.get(id))};
};
document.documentElement.dataset.ready='true';

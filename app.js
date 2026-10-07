const events = window.NAVRATRI_EVENTS || [];
const state = {step:1, city:null, group:null, budget:null, style:null, needs:[]};
const choices = {
 city:[["Surat","📍","Surat"],["Ahmedabad","🏙️","Ahmedabad"],["Vadodara","🏛️","Vadodara"],["Mumbai","🌆","Mumbai"],["Other","✨","Other"]],
 group:[["family","👨‍👩‍👧","Family"],["couple","❤️","Couple"],["friends","👯","Friends"],["solo","🧍","Solo"]],
 budget:[["0","Free","₹0 / free events"],["500","₹500","Up to ₹500"],["1000","₹1,000","Up to ₹1,000"],["2000","₹2,000","Up to ₹2,000"],["2001","₹2,000+","Premium / high budget"]],
 style:[["traditional","🪔","Traditional"],["premium","✨","Premium"],["dj","🎧","DJ / High-energy"],["celebrity","⭐","Celebrity / artist"],["family","👨‍👩‍👧","Family-friendly"]],
 needs:[["parking","🅿️","Parking"],["food","🍴","Food"],["shopping","🛍️","Shopping"],["photography","📸","Photography"]]
};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function renderChoices(){
  Object.entries(choices).forEach(([key,list])=>{
    const el=$(`#${key}Choices`); if(!el)return;
    el.innerHTML=list.map(([value,icon,label])=>`<button class="choice" data-value="${value}"><span>${icon} ${label}</span><small>${key==='city'?'Event coverage':key==='budget'?label:'Tap to select'}</small></button>`).join('');
    el.querySelectorAll('.choice').forEach(btn=>btn.addEventListener('click',()=>{
      if(key==='needs'){btn.classList.toggle('selected');state.needs=[...el.querySelectorAll('.selected')].map(x=>x.dataset.value)}
      else {state[key]=btn.dataset.value; el.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected')}
      if(key==='city' && state.step===1) setTimeout(()=>go(2),120);
      else if(key!=='needs' && state.step<5) setTimeout(()=>go(state.step+1),120);
    }));
  });
}
function go(step){
  state.step=Math.max(1,Math.min(5,step));
  $$('.question').forEach(q=>q.classList.toggle('active',+q.dataset.step===state.step));
  $('#stepCount').textContent=`${state.step} / 5`; $('#progressBar').style.width=`${state.step*20}%`;
  $('#backBtn').disabled=state.step===1;
  $('#nextBtn').textContent=state.step===5?'See my plan →':'Next →';
  if(state.step===5) $('#nextBtn').style.display='inline-flex'; else $('#nextBtn').style.display='inline-flex';
}
function budgetFits(e,b){
  if(b==='0') return e.priceMin===0;
  if(b==='500') return e.priceMin!=null && e.priceMin<=500;
  if(b==='1000') return e.priceMin!=null && e.priceMin<=1000;
  if(b==='2000') return e.priceMin!=null && e.priceMin<=2000;
  if(b==='2001') return e.priceMin==null || e.priceMin>2000;
  return true;
}
function score(e){
  let s=0;
  if(state.city && state.city!=='Other' && e.city===state.city)s+=40;
  if(state.group==='family' && e.features.includes('family'))s+=16;
  if(state.group==='couple')s+=5;
  if(state.group==='friends' && (e.style.includes('dj')||e.style.includes('premium')))s+=8;
  if(state.group==='solo' && e.style.includes('traditional'))s+=5;
  if(state.budget && budgetFits(e,state.budget))s+=18;
  if(state.style && e.style.includes(state.style))s+=16;
  state.needs.forEach(n=>{if(e.features.includes(n))s+=7});
  if(e.verified.startsWith('Official'))s+=3;
  return s;
}
function maps(e){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address)}`}
function card(e, best=false){
  return `<article class="result-card ${best?'best':''}">
    <div>${best?'<span class="best-badge">BEST MATCH</span>':''}<div class="event-title">${e.name}</div>
    <div class="meta"><span>📍 ${e.area}, ${e.city}</span><span>🕗 ${e.time}</span><span>🎟️ ${e.priceLabel}</span></div>
    <p class="description">${e.description}</p>
    <div>${e.tags.map(t=>`<span class="tag">${t}</span>`).join(' ')}</div>
    <div class="source">✓ ${e.verified} · checked ${e.lastVerified}</div></div>
    <div class="event-actions"><a class="small-btn primary" target="_blank" rel="noopener" href="${maps(e)}">Get directions</a><a class="small-btn" target="_blank" rel="noopener" href="${e.sourceUrl}">View source</a><button class="small-btn share-event" data-id="${e.id}">Share</button></div>
  </article>`;
}
function showResults(){
  const ranked=events.map(e=>({...e,_score:score(e)})).filter(e=>!state.city||state.city==='Other'||e.city===state.city).sort((a,b)=>b._score-a._score);
  const top=ranked.slice(0,5);
  $('#matchSummary').textContent=`Matched for ${state.city||'your city'}, ${state.group||'your group'}, ${state.budget?('budget '+({'0':'free','500':'₹500','1000':'₹1,000','2000':'₹2,000','2001':'₹2,000+'}[state.budget])):'your budget'} and your selected preferences.`;
  $('#resultList').innerHTML=top.length?top.map((e,i)=>card(e,i===0)).join(''):`<div class="event-card"><h3>No exact city match yet.</h3><p class="description">Try Surat, Ahmedabad or Vadodara for the current verified 2026 directory.</p></div>`;
  $('#results').classList.add('show'); document.querySelector('#results').scrollIntoView({behavior:'smooth'});
  bindShareButtons();
}
function renderDirectory(){
  const cities=[...new Set(events.map(e=>e.city))].sort(); $('#filterCity').innerHTML='<option value="">All cities</option>'+cities.map(c=>`<option>${c}</option>`).join('');
  const draw=()=>{
    const city=$('#filterCity').value,b=$('#filterBudget').value,f=$('#filterFeature').value,q=$('#searchBox').value.toLowerCase().trim();
    const list=events.filter(e=>(!city||e.city===city)&&(!b||budgetFits(e,b))&&(!f||e.features.includes(f))&&(!q||[e.name,e.city,e.area,e.venue,e.description].join(' ').toLowerCase().includes(q)));
    $('#eventGrid').innerHTML=list.map(e=>`<article class="event-card"><div><span class="best-badge">${e.city}</span><h3>${e.name}</h3></div><div class="meta"><span>📅 ${e.dates}</span><span>🕗 ${e.time}</span></div><p class="description">${e.description}</p><div>${e.tags.map(t=>`<span class="tag">${t}</span>`).join(' ')}</div><div class="source">✓ ${e.verified} · ${e.lastVerified}</div><div class="event-actions"><a class="small-btn primary" target="_blank" rel="noopener" href="${maps(e)}">Directions</a><a class="small-btn" target="_blank" rel="noopener" href="${e.sourceUrl}">Source</a></div></article>`).join('')||'<div class="event-card"><h3>No events match those filters.</h3></div>';
  };
  ['filterCity','filterBudget','filterFeature','searchBox'].forEach(id=>$( '#'+id).addEventListener('input',draw)); draw();
}
async function share(text,url=location.href){
  if(navigator.share){try{await navigator.share({title:'Plan My Navratri',text,url});return}catch(e){}}
  try{await navigator.clipboard.writeText(`${text}\n${url}`);alert('Plan copied to clipboard.');}catch(e){alert('Copy this link: '+url)}
}
function bindShareButtons(){ $$('.share-event').forEach(btn=>btn.onclick=()=>{const e=events.find(x=>x.id===btn.dataset.id);share(`${e.name} · ${e.city} · ${e.dates} · ${e.priceLabel}`)})}
$('#nextBtn').onclick=()=>state.step===5?showResults():go(state.step+1);
$('#backBtn').onclick=()=>go(state.step-1);
$('#restartBtn').onclick=()=>{Object.assign(state,{step:1,city:null,group:null,budget:null,style:null,needs:[]});$$('.choice').forEach(x=>x.classList.remove('selected'));$('#results').classList.remove('show');go(1);document.querySelector('#planner').scrollIntoView({behavior:'smooth'})};
$('#shareTop').onclick=()=>share('Plan My Navratri · verified 2026 Garba event planner');
renderChoices();renderDirectory();go(1);

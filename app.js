'use strict';
(() => {
 const {categories, sites} = window.DETLENG_DIRECTORY;
 const $ = id => document.getElementById(id);
 const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const find = id => sites.find(site => site.id === id);
 function siteLink(site, label) {
  if (site.id === 'detleng-network') return `<a class="site-action" href="#directory">${esc(label || site.cta)} →</a>`;
  return `<a class="site-action" href="${esc(site.url)}" target="_blank" rel="noopener noreferrer">${esc(label || site.cta)} ↗</a>`;
 }
 function siteCard(site) { return `<article class="site-card"><span class="badge ${site.access === 'Registered users only' ? 'private' : ''}">${esc(site.status)}</span><h4>${esc(site.name)}</h4><p>${esc(site.intro)}</p>${siteLink(site)}</article>`; }
 $('totalCount').textContent = sites.length;
 $('categoryNav').innerHTML = categories.map(c => `<a class="category-link" href="#category-${c.id}" data-category="${c.id}"><span>${esc(c.name)}</span><span><strong>${sites.filter(s => s.categoryId === c.id).length}</strong><small>websites</small></span></a>`).join('');
 const featured = [
  ['arrange-my-files-ai','Documents or folders','A naming and folder plan, organized copies and a copy report','Local browser processing. Uncertain files stay unchanged in Needs Review.'],
  ['business-flow','An Excel workbook','A structured report workbook and analytics','Choose the worksheet, columns and reporting period.'],
  ['excelflow-ai','A spreadsheet and a reporting question','Reports, Live Analytics and optional AI investigation','Online AI requires permission to share supplied workbook/report data.'],
  ['flashcard-by-detleng','A three-column Word question bank','Classic flashcards or MCQ study decks','Generation happens in the browser. Review the extracted questions.'],
  ['al-noor-student-chat','A teacher-provided account','A private classroom communication space','Registered users only. Public access is sign-in, not an open demo.']
 ];
 $('featuredGrid').innerHTML = featured.map(([id,input,output,note]) => {
  const s = find(id);
  return `<article class="project-card"><span class="badge ${id === 'al-noor-student-chat' ? 'private' : ''}">${esc(s.status)}</span><h3>${esc(s.name)}</h3><dl><dt>You provide</dt><dd>${esc(input)}</dd><dt>You receive</dt><dd>${esc(output)}</dd></dl><p class="quiet">${esc(note)}</p>${siteLink(s)}</article>`;
 }).join('');
 const normal = text => text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function renderDirectory() {
  const words = normal($('networkSearch').value).trim().split(/\s+/).filter(Boolean);
  const matches = sites.filter(s => words.every(w => normal([s.name,s.intro,s.category,s.status,s.url,s.reviewNote].join(' ')).includes(w)));
  $('networkGroups').innerHTML = categories.map(c => {
   const group = matches.filter(s => s.categoryId === c.id);
   if (!group.length) return '';
   return `<section id="category-${c.id}" class="group" tabindex="-1" aria-labelledby="heading-${c.id}"><div class="group-heading"><h3 id="heading-${c.id}">${esc(c.name)}</h3><span class="count-pill">${group.length}</span></div><p>${esc(c.intro)}</p><div class="site-grid">${group.map(siteCard).join('')}</div></section>`;
  }).join('');
  $('searchCount').textContent = `Showing ${matches.length} of ${sites.length} websites${words.length ? ' matching your search.' : '.'}`;
  $('emptyState').hidden = matches.length !== 0;
 }
 $('networkSearch').addEventListener('input',renderDirectory);
 $('clearSearch').addEventListener('click',() => { $('networkSearch').value='';renderDirectory();$('networkSearch').focus(); });
 document.querySelectorAll('[data-category]').forEach(a => a.addEventListener('click',e => {
  e.preventDefault(); $('networkSearch').value='';renderDirectory();
  const target = $('category-'+a.dataset.category);target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});history.replaceState(null,'','#'+target.id);
 }));
 renderDirectory();
 const goals = [
  ['Organize my files',['arrange-my-files-ai']],
  ['Build or explore a spreadsheet report',['business-flow','excelflow-ai','csv-cleaner']],
  ['Create study material',['flashcard-by-detleng','mcq-generator']],
  ['Find a private classroom',['al-noor-student-chat','educational-solutions']],
  ['Improve a business workflow',['automation-desk','lfds-logic-first-digital-solutions','detleng-solutions']],
  ['Learn or practise',['n8n-learning','python-learning-lab','customer-service-learning-hub']],
  ['See project evidence',['case-studies','detleng-n8n-lab','detleng-ops']],
  ['Explore languages and reflection',['learn-german','ai-english','human-potential']]
 ];
 // Resolve recommendations through approved directory records only.
 // No free-form AI, external requests or invented destinations in this phase.
 $('goalOptions').innerHTML = goals.map(([label],i) => `<button data-goal="${i}" aria-pressed="false">${esc(label)} →</button>`).join('');
 $('goalOptions').addEventListener('click',e => {
  const button = e.target.closest('[data-goal]');if(!button)return;
  document.querySelectorAll('[data-goal]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  const [label,ids]=goals[Number(button.dataset.goal)];
  const recommended = ids.map(find).filter(Boolean);
  $('guideResults').innerHTML=`<h3>${esc(label)}</h3>`+recommended.map(s=>`<article class="guide-result"><h3>${esc(s.name)}</h3><span class="badge">${esc(s.status)}</span><p>${esc(s.intro)}</p>${siteLink(s)}</article>`).join('');
 });
 let returnFocus;
 function openDialog(dialog) { returnFocus=document.activeElement;dialog.showModal(); }
 function closeDialog(dialog) { dialog.close(); }
 document.querySelectorAll('[data-guide]').forEach(b=>b.addEventListener('click',()=>{closeMenu();openDialog($('guideDialog'));}));
 document.querySelectorAll('dialog').forEach(d=>{
  d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(d)));
  d.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
  d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
 });
 $('dismissWelcome').addEventListener('click',()=>{$('welcome').hidden=true;try{sessionStorage.setItem('network-welcome-dismissed','1');}catch{}$('showWelcome').focus({preventScroll:true});});
 try{$('welcome').hidden=sessionStorage.getItem('network-welcome-dismissed')==='1';}catch{}
 $('showWelcome').addEventListener('click',()=>{$('welcome').hidden=false;try{sessionStorage.removeItem('network-welcome-dismissed');}catch{}$('welcomeHeading').setAttribute('tabindex','-1');$('welcomeHeading').focus();});
 const tabs=[$('loginTab'),$('createTab')];
 function accountTab(index){
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
  $('accountPanel').setAttribute('aria-labelledby',tabs[index].id);
  const fields=index?['Username','Email','Password','Confirm Password']:['Email','Password'];
  $('accountPanel').innerHTML=fields.map(label=>`<label>${label}<input disabled type="${label.includes('Password')?'password':label==='Email'?'email':'text'}" placeholder="Available when accounts launch"></label>`).join('')+'<label><input type="checkbox" disabled> Show Password</label>'+`<button class="button" disabled>${index?'Create Account':'Sign In'}</button>`;
 }
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>accountTab(index));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowLeft')next=1-index;else if(e.key==='Home')next=0;else if(e.key==='End')next=1;else return;e.preventDefault();accountTab(next);tabs[next].focus();});});
 [$('loginButton'),$('footerLogin')].forEach(b=>b.addEventListener('click',()=>{closeMenu();accountTab(0);openDialog($('accountDialog'));}));accountTab(0);
 function closeMenu(){ $('headerActions').classList.remove('open');$('menuButton').setAttribute('aria-expanded','false'); }
 $('menuButton').addEventListener('click',()=>{const open=$('headerActions').classList.toggle('open');$('menuButton').setAttribute('aria-expanded',String(open));});
 $('headerActions').querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
 // Keep anchor targets below the actual sticky header at every zoom level.
 const headerObserver=new ResizeObserver(()=>document.documentElement.style.setProperty('--header',document.querySelector('.header').getBoundingClientRect().height+'px'));headerObserver.observe(document.querySelector('.header'));
 $('year').textContent=new Date().getFullYear();
})();

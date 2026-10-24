'use strict';
(() => {
 const dialog=document.getElementById('guideDialog');
 const preview=dialog.querySelector('.ai-preview');
 preview.innerHTML='<strong>Ask DeTLeng AI</strong><p>Your guide to the DeTLeng Network</p><p id="aiStatus" role="status">Checking online guide availability…</p><form id="aiForm"><label><input id="aiConsent" type="checkbox" required> Send my question and up to 6 recent messages to the DeTLeng backend and Groq for an AI reply.</label><p class="quiet">Do not share passwords, private documents or sensitive details. This app keeps chat only in this page’s memory and does not save chat to a database. Hosting and AI-provider logging/retention policies also apply.</p><label for="aiQuestion">What would you like to do?</label><textarea id="aiQuestion" maxlength="1600" rows="3" placeholder="Which tool can organize my documents?" required disabled></textarea><div class="actions"><button id="aiSend" class="button primary" disabled>Ask DeTLeng AI</button><button id="aiClear" class="button" type="button">Clear conversation</button></div></form><div id="aiMessages" aria-live="polite"></div>';
 const status=document.getElementById('aiStatus'),question=document.getElementById('aiQuestion'),send=document.getElementById('aiSend'),messages=document.getElementById('aiMessages');
 let base=String(window.DETLENG_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
 if(!base&&(/\.onrender\.com$/.test(location.hostname)||['localhost','127.0.0.1'].includes(location.hostname)))base=location.origin;
 let history=[],request=null;
 function unavailable(){status.textContent='Online AI is unavailable. Use the curated choices above or Automation Desk.';question.disabled=true;send.disabled=true;}
 async function checkStatus(){if(!base)return unavailable();try{const response=await fetch(base+'/api/status',{signal:AbortSignal.timeout(12000)});const data=await response.json();if(!response.ok||!data.configured)return unavailable();status.textContent='Online guide ready. Your permission is required before sending.';question.disabled=false;send.disabled=false;}catch{unavailable();}}
 checkStatus();
 function addMessage(label,text){const article=document.createElement('article');article.className='guide-result';const title=document.createElement('strong');title.textContent=label;const p=document.createElement('p');p.textContent=text;p.style.whiteSpace='pre-wrap';article.append(title,p);messages.append(article);return article;}
 document.getElementById('aiForm').addEventListener('submit',async event=>{
  event.preventDefault();const message=question.value.trim();if(!message||!document.getElementById('aiConsent').checked||request)return;
  request=new AbortController();const timer=setTimeout(()=>request?.abort(),45000);send.disabled=true;status.textContent='Finding a useful starting point…';addMessage('You',message);question.value='';
  try{const response=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,history:history.slice(-6)}),signal:request.signal});const data=await response.json();if(!response.ok)throw new Error(data.error||'The guide could not answer just now.');
   const article=addMessage('Ask DeTLeng AI',String(data.answer));
   // Resolve IDs against the current local directory, never trust model/server URLs.
   for(const recommendation of data.recommendations||[]){const site=window.DETLENG_DIRECTORY.sites.find(s=>s.id===recommendation.id);if(!site)continue;const link=document.createElement('a');link.href=site.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=site.name+' ↗';link.style.display='block';article.append(link);}
   history.push({role:'user',content:message},{role:'assistant',content:String(data.answer)});history=history.slice(-6);status.textContent='AI can make mistakes. Check the destination’s current details.';
  }catch(error){addMessage('Guide status',error.name==='AbortError'?'The request took too long. Try again, or use the curated guide.':error.message);status.textContent='Curated recommendations remain available above.';}
  finally{clearTimeout(timer);request=null;send.disabled=false;}
 });
 document.getElementById('aiClear').addEventListener('click',()=>{request?.abort();history=[];messages.replaceChildren();question.value='';document.getElementById('aiConsent').checked=false;status.textContent='Conversation cleared.';});
})();

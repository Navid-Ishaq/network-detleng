'use strict';
(() => {
 const dialog=document.createElement('dialog');dialog.id='chatDialog';dialog.setAttribute('aria-labelledby','chatTitle');
 dialog.innerHTML=`<div class="chat-header"><div><h2 id="chatTitle">✧ Ask DeTLeng AI</h2><p>Your guide to the DeTLeng Network</p></div><button id="chatClose" class="close" aria-label="Close chat">×</button></div><div id="aiMessages" class="chat-messages" role="log" aria-live="polite"></div><div class="chat-bottom"><p id="aiStatus" role="status">Ready to help you find your way.</p><form id="aiForm"><label class="sr-only" for="aiQuestion">Your message</label><div class="chat-composer"><textarea id="aiQuestion" maxlength="1600" rows="2" placeholder="Ask about a tool or tell me what you need…" required></textarea><button id="aiSend" class="button primary">Send ↑</button></div></form><div class="chat-tools"><button id="aiClear" class="text-button">New chat</button><button id="chatBrowse" class="text-button">Browse without AI</button><details><summary>Privacy details</summary><p>Sending a message shares your question and up to six recent messages with the DeTLeng backend and Groq. Do not share passwords or sensitive information. This app keeps chat in page memory, without a chat database; hosting and provider policies also apply.</p></details></div><p class="chat-disclosure">Online AI · Please check important details.</p></div>`;
 document.body.append(dialog);
 const $=id=>document.getElementById(id);const status=$('aiStatus'),question=$('aiQuestion'),send=$('aiSend'),messages=$('aiMessages');
 let base=String(window.DETLENG_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');
 if(!base&&(/\.onrender\.com$/.test(location.hostname)||['localhost','127.0.0.1'].includes(location.hostname)))base=location.origin;
 let history=[],request=null,epoch=0,opener,ready=false;
 function addMessage(label,text){const article=document.createElement('article');article.className='chat-bubble '+(label==='You'?'from-user':'from-guide');const title=document.createElement('strong');title.textContent=label;const p=document.createElement('p');p.textContent=text;article.append(title,p);messages.append(article);messages.scrollTop=messages.scrollHeight;return article;}
 function welcome(){messages.replaceChildren();addMessage('DeTLeng AI','Welcome! Tell me what you would like to do. I can explain the websites, compare tools or help you find a useful starting point.');}
 function unavailable(){ready=false;status.textContent='Online chat is not connected. Browse the Network guide, or try connecting again.';send.textContent='Retry connection';}
 async function checkStatus(){if(!base)return unavailable();status.textContent='Connecting… The first connection may take a little longer.';send.disabled=true;try{const response=await fetch(base+'/api/status',{signal:AbortSignal.timeout(70000)});const data=await response.json();if(!response.ok||!data.configured)return unavailable();ready=true;send.textContent='Send ↑';status.textContent='How can I help?';}catch{unavailable();}finally{send.disabled=false;}}
 document.querySelectorAll('[data-chat]').forEach(button=>button.addEventListener('click',()=>{opener=button;document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.getElementById('headerActions').classList.remove('open');document.getElementById('menuButton').setAttribute('aria-expanded','false');dialog.showModal();if(!ready)checkStatus();}));
 $('chatClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>opener?.focus());
 $('chatBrowse').onclick=()=>{dialog.close();document.querySelector('[data-guide]').click();};
 $('aiForm').addEventListener('submit',async event=>{
  event.preventDefault();if(request)return;if(!ready){await checkStatus();return;}
  const message=question.value.trim();if(!message)return;const current=epoch;const controller=new AbortController();request=controller;const timer=setTimeout(()=>controller.abort(),45000);send.disabled=true;status.textContent='Thinking…';addMessage('You',message);question.value='';
  try{const response=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,history:history.slice(-6)}),signal:controller.signal});const data=await response.json();if(current!==epoch)return;if(!response.ok)throw new Error(data.error||'The guide could not answer just now.');
   const article=addMessage('DeTLeng AI',String(data.answer));
   for(const recommendation of data.recommendations||[]){const site=window.DETLENG_DIRECTORY.sites.find(s=>s.id===recommendation.id);if(!site)continue;const link=document.createElement('a');link.href=site.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=site.name+' ↗';article.append(link);}
   history.push({role:'user',content:message},{role:'assistant',content:String(data.answer)});history=history.slice(-6);status.textContent='Ask a follow-up whenever you like.';messages.scrollTop=messages.scrollHeight;
  }catch(error){if(current!==epoch)return;addMessage('Guide status',error.name==='AbortError'?'That took too long. Please try again or use the Network guide.':error.message);status.textContent='The Network guide is still available.';}
  finally{clearTimeout(timer);if(current===epoch){request=null;send.disabled=false;}}
 });
 question.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('aiForm').requestSubmit();}});
 $('aiClear').onclick=()=>{epoch++;request?.abort();request=null;history=[];question.value='';welcome();send.disabled=false;status.textContent=ready?'New conversation. How can I help?':'Ready when you are.';question.focus();};
 welcome();
})();

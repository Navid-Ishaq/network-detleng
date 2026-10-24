import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { directory,createGuide,responseSchema,resolveRecommendations } from './agent.js';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const inputSchema=z.object({message:z.string().trim().min(1).max(1600),history:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().max(3500)})).max(6).default([])}).strict();
export function createApp({generate,enabled=Boolean(process.env.GROQ_API_KEY),origins=process.env.ALLOWED_ORIGINS || 'https://network.detleng.com',dailyLimit=Number(process.env.DAILY_REQUEST_LIMIT || 200)}={}) {
 const app=express();
 app.disable('x-powered-by');
 // Render is the single reverse proxy in front of this service.
 app.set('trust proxy',1);
 app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'none'"],frameAncestors:["'none'"]}}}));
 const allowed=new Set(origins.split(',').map(s=>s.trim()).filter(Boolean));
 app.use('/api',(req,res,next)=>{
  res.set('Cache-Control','no-store');
  const origin=req.get('origin');
  if(origin&&!allowed.has(origin))return res.status(403).json({error:'Origin not allowed.'});
  if(origin){res.set('Access-Control-Allow-Origin',origin);res.vary('Origin');}
  res.set('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.set('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.sendStatus(204);
  next();
 });
 app.get('/health',(_req,res)=>res.json({ok:true,service:'detleng-network-ai',configured:enabled}));
 app.get('/api/status',(_req,res)=>res.json({configured:enabled,name:'Ask DeTLeng AI',directoryVersion:directory.version}));
 app.use('/api/chat',rateLimit({windowMs:60000,limit:8,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Please wait a minute before asking again.'}}));
 app.use(express.json({limit:'24kb'}));
 let day='',used=0,active=0;
 app.post('/api/chat',async(req,res)=>{
  const parsed=inputSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Send a question of 1–1600 characters with up to 6 recent messages.'});
  if(!enabled)return res.status(503).json({error:'Online AI is not configured yet. Please use the Network guide.'});
  const today=new Date().toISOString().slice(0,10);if(day!==today){day=today;used=0;}
  if(used>=dailyLimit||active>=2)return res.status(429).json({error:'The guide is busy or today’s usage limit has been reached. Please use the curated guide or Automation Desk.'});
  used++;active++;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
  try {
   const messages=[...parsed.data.history.map(m=>({role:m.role,content:m.content})),{role:'user',content:parsed.data.message}];
   const response=await generate(messages,controller.signal);
   const result=responseSchema.parse(response);
   // No AI-authored links: all destination URLs come from the directory.
   const answer=result.answer.replace(/https?:\/\/\S+|www\.\S+/gi,'[see approved destinations below]');
   res.json({answer,recommendations:resolveRecommendations(result.siteIds),directoryVersion:directory.version});
  }catch{res.status(502).json({error:'The online guide could not answer just now. Your curated Network guide is still available.'});}
  finally{clearTimeout(timer);active--;}
 });
 // Only public frontend files are served. Never expose source, env or dependencies.
 for(const file of ['index.html','styles.css','app.js','network-data.js','config.js','ai-guide.js'])app.get(file==='index.html'?'/':'/'+file,(_req,res)=>{
  res.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'none'");
  res.sendFile(path.join(root,file));
 });
 app.use((error,_req,res,_next)=>res.status(error.type==='entity.too.large'?413:400).json({error:'Invalid request.'}));
 return app;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 const enabled=Boolean(process.env.GROQ_API_KEY);
 const agent=enabled?createGuide():null;
 const app=createApp({enabled,generate:async(messages,signal)=>{
  const response=await agent.generate(messages,{structuredOutput:{schema:responseSchema},abortSignal:signal,maxSteps:1,modelSettings:{maxOutputTokens:1200,temperature:0.2}});
  return response.object;
 }});
 app.listen(Number(process.env.PORT || 10000),'0.0.0.0',()=>console.log(`DeTLeng Network API listening; AI configured: ${enabled}`));
}

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load a local .env file if present; the real .env is intentionally not included in the ZIP.
try { const envPath=path.join(__dirname,'.env'); if(fs.existsSync(envPath)){ for(const line of fs.readFileSync(envPath,'utf8').split(/\r?\n/)){ const m=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/); if(m && !process.env[m[1]]) process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,''); } } } catch {}
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const OPENAI_URL = 'https://api.openai.com/v1/responses';
const SHARE_DIR = path.join(__dirname, 'data', 'shares');
fs.mkdirSync(SHARE_DIR, {recursive:true});

if (!OPENAI_API_KEY) console.warn('WARNING: OPENAI_API_KEY is not set. The AI endpoint will return a setup error.');

const rate = new Map();
function allow(ip){
  const now=Date.now(), windowMs=60_000, max=20;
  const hits=(rate.get(ip)||[]).filter(t=>now-t<windowMs);
  if(hits.length>=max){rate.set(ip,hits);return false;}
  hits.push(now);rate.set(ip,hits);return true;
}
function send(res,status,body,type='application/json'){
  res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(type==='application/json'?JSON.stringify(body):body);
}
function safePath(urlPath){
  const decoded=decodeURIComponent(urlPath.split('?')[0]);
  const rel=decoded==='/'?'index.html':decoded.replace(/^\/+/, '');
  const full=path.resolve(__dirname, rel);
  return full.startsWith(path.resolve(__dirname)+path.sep)?full:null;
}
function mime(file){return {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.md':'text/plain; charset=utf-8'}[path.extname(file).toLowerCase()]||'application/octet-stream';}
async function readJson(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>15_000_000)throw new Error('Request too large (15 MB maximum).');}return JSON.parse(raw||'{}');}
function extractText(payload){if(typeof payload.output_text==='string')return payload.output_text;const out=[];for(const item of payload.output||[]){for(const c of item.content||[]){if(typeof c.text==='string')out.push(c.text);}}return out.join('\n').trim();}

function cleanShareData(body){
  const d=body&&typeof body.data==='object'?body.data:{};
  return {week:Number(body.week||1),title:String(body.title||`Week ${Number(body.week||1)}`),createdAt:new Date().toISOString(),data:d};
}
function sharePage(token){
  const safe=JSON.stringify(token).replace(/</g,'\u003c');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Professor Review — Study Hub</title><link rel="stylesheet" href="/css/styles.css"></head><body><main class="professor-view"><div id="report">Loading report…</div></main><script>const token=${safe};fetch('/api/share/'+token).then(r=>r.ok?r.json():Promise.reject(new Error('Report not found'))).then(({report})=>{const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));const d=report.data||{};let h='<p class="eyebrow">STUDY HUB · PROFESSOR REVIEW</p><h1>'+esc(report.title)+'</h1><p class="hint">Created '+new Date(report.createdAt).toLocaleString()+'</p>';if(d.description)h+='<section class="report-section"><h2>Weekly writing & reflections</h2><h3>Overview</h3><p>'+esc(d.description).replace(/\n/g,'<br>')+'</p><h3>What I did</h3><p>'+esc(d.whatDid).replace(/\n/g,'<br>')+'</p><h3>What I learned</h3><p>'+esc(d.learned).replace(/\n/g,'<br>')+'</p><h3>Problems & fixes</h3><p>'+esc(d.problems).replace(/\n/g,'<br>')+'</p><h3>Next steps</h3><p>'+esc(d.nextSteps).replace(/\n/g,'<br>')+'</p></section>';if(d.html)h+='<section class="report-section"><h2>HTML work</h2><pre class="report-code">'+esc(d.html)+'</pre><iframe class="report-preview" sandbox="allow-scripts" srcdoc="'+esc('<!doctype html><html><body style=\"font-family:system-ui;padding:24px;line-height:1.6\">'+d.html+'</body></html>')+'"></iframe></section>';if(d.images?.length)h+='<section class="report-section"><h2>Evidence</h2><div class="report-images">'+d.images.map(x=>'<figure><img src="'+esc(x.src)+'"><figcaption>'+esc(x.alt)+'</figcaption></figure>').join('')+'</div></section>';if(d.resources?.length)h+='<section class="report-section"><h2>Resources</h2><ul>'+d.resources.map(x=>'<li><a target="_blank" rel="noopener" href="'+esc(x.url)+'">'+esc(x.name)+'</a></li>').join('')+'</ul></section>';if(d.checklist?.length)h+='<section class="report-section"><h2>Checklist</h2><ul>'+d.checklist.map(x=>'<li>'+ (x.done?'☑':'☐') +' '+esc(x.text)+'</li>').join('')+'</ul></section>';if(d.notes?.length)h+='<section class="report-section"><h2>Sticky notes</h2><div class="report-notes">'+d.notes.map(x=>'<article><strong>Note</strong><p>'+esc(x.text).replace(/\n/g,'<br>')+'</p></article>').join('')+'</div></section>';if(d.chalk?.length)h+='<section class="report-section"><h2>Chalkboard</h2><img class="report-chalk" src="'+esc(d.chalk)+'" alt="Saved chalkboard"> </section>';if(d.aiAnswer)h+='<section class="report-section"><h2>AI assistant response</h2><pre class="report-code">'+esc(d.aiAnswer)+'</pre></section>';document.getElementById('report').innerHTML=h}).catch(e=>document.getElementById('report').innerHTML='<h1>Report unavailable</h1><p>'+e.message+'</p>');</script></body></html>`;
}

const server=http.createServer(async(req,res)=>{
  const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').toString().split(',')[0].trim();
  if(req.method==='POST' && req.url==='/api/share'){
    try{
      const body=await readJson(req);
      const report=cleanShareData(body);
      const token=crypto.randomBytes(18).toString('base64url');
      fs.writeFileSync(path.join(SHARE_DIR,token+'.json'),JSON.stringify(report),'utf8');
      return send(res,200,{token,url:`/share/${token}`});
    }catch(err){return send(res,400,{error:err.message||'Could not create report.'});}
  }
  if(req.method==='GET' && /^\/api\/share\/[A-Za-z0-9_-]+$/.test(req.url||'')){
    const token=(req.url||'').split('/').pop();
    const file=path.join(SHARE_DIR,token+'.json');
    if(!file.startsWith(path.resolve(SHARE_DIR)+path.sep)) return send(res,403,{error:'Forbidden'});
    try{return send(res,200,{report:JSON.parse(fs.readFileSync(file,'utf8'))});}catch{return send(res,404,{error:'Report not found.'});}
  }
  if(req.method==='GET' && /^\/share\/[A-Za-z0-9_-]+$/.test(req.url||'')){
    const token=(req.url||'').split('/').pop();
    const file=path.join(SHARE_DIR,token+'.json');
    if(!fs.existsSync(file)) return send(res,404,{error:'Report not found.'});
    return send(res,200,sharePage(token),'text/html; charset=utf-8');
  }
  if(req.method==='POST' && req.url==='/api/ai'){
    if(!allow(ip)) return send(res,429,{error:'Too many AI requests. Please wait a minute.'});
    if(!OPENAI_API_KEY) return send(res,503,{error:'AI backend is not configured. Add OPENAI_API_KEY to the server environment.'});
    try{
      const body=await readJson(req);
      const question=String(body.question||'').trim();
      const context=String(body.context||'').slice(0,60_000);
      if(!question)return send(res,400,{error:'A question is required.'});
      const upstream=await fetch(OPENAI_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}`},body:JSON.stringify({model:OPENAI_MODEL,input:[{role:'system',content:[{type:'input_text',text:'You are a practical coding and study assistant inside a private student study journal. Help with HTML, CSS, JavaScript, browser debugging, accessibility, and Babylon.js. Explain errors plainly, propose small testable fixes, and do not claim to have executed code or seen files unless they are included in the request. Preserve the student\'s intent and point out uncertainty.'}]},{role:'user',content:[{type:'input_text',text:`QUESTION:\n${question}\n\nWEEK CONTEXT:\n${context}`}]}]})});
      const payload=await upstream.json();
      if(!upstream.ok)return send(res,upstream.status,{error:payload?.error?.message||'The AI provider returned an error.'});
      return send(res,200,{answer:extractText(payload)||'No text response was returned.'});
    }catch(err){return send(res,400,{error:err.message||'Invalid request.'});}
  }
  if(req.method!=='GET') return send(res,405,{error:'Method not allowed'});
  const file=safePath(req.url||'/');
  if(!file)return send(res,403,{error:'Forbidden'});
  fs.stat(file,(err,st)=>{
    if(err||!st.isFile())return send(res,404,{error:'Not found'});
    res.writeHead(200,{'Content-Type':mime(file),'X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
  });
});
server.listen(PORT,HOST,()=>console.log(`Study Hub running at http://${HOST}:${PORT}`));

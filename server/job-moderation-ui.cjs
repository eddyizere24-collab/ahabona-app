'use strict';

const JOB_MODERATION_HTML = String.raw\`<!doctype html>
<html lang="rw">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1a9b6c"><title>Genzura amatangazo y'akazi | AHABONA</title>
<style>
:root{--green:#16865f;--ink:#1e2a32;--muted:#64707a;--line:#e8e4da;--bg:#faf8f2;--white:#fff;--red:#a9342a;--gold:#9b711b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}button,textarea{font:inherit}.top{background:#fff;border-bottom:1px solid var(--line);padding:13px 16px}.top-inner,.wrap{max-width:1020px;margin:auto}.top-inner{display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{font-weight:900;letter-spacing:.3px;color:#174b37;text-decoration:none;font-size:19px}.back,.btn{display:inline-flex;align-items:center;justify-content:center;padding:9px 13px;border:1px solid var(--line);border-radius:10px;background:white;color:var(--ink);font-weight:700;text-decoration:none;cursor:pointer}.btn.primary{background:var(--green);color:white;border-color:var(--green)}.btn.reject{background:#fff0ee;color:var(--red);border-color:#f0cbc6}.btn:disabled{opacity:.5;cursor:wait}.wrap{padding:25px 16px 50px}.intro h1{font-size:clamp(27px,4vw,36px);margin:10px 0 4px}.intro p,.muted{color:var(--muted)}.stats{display:flex;gap:10px;flex-wrap:wrap;margin:17px 0}.pill{background:#eaf5ef;color:#176345;padding:6px 10px;border-radius:99px;font-size:12px;font-weight:800}.job{background:white;border:1px solid var(--line);border-radius:15px;padding:18px;margin:12px 0;box-shadow:0 6px 24px rgba(15,40,27,.05)}.job h2{margin:0;font-size:20px;line-height:1.3}.meta{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.chip{padding:4px 8px;background:#f3f5f2;border-radius:999px;font-size:12px;color:#4d5b54}.description{white-space:pre-wrap;color:#4b585f}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.section h3{font-size:14px;margin:14px 0 5px}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.note{width:100%;min-height:68px;border:1px solid var(--line);border-radius:9px;padding:10px;resize:vertical}.alert{padding:12px;border-radius:10px;background:#eaf5ef;color:#185e42;margin:12px 0}.alert.error{background:#fff0ee;color:#9d342b}.alert.warn{background:#fff5df;color:#755517}.empty,.loading{text-align:center;padding:32px;color:var(--muted)}.status{font-size:11px;font-weight:800;color:var(--gold);background:#fff5df;border-radius:99px;padding:5px 9px}.footer{margin-top:28px;text-align:center;font-size:12px;color:var(--muted)}
@media(max-width:680px){.grid{grid-template-columns:1fr}.job{padding:14px}.wrap{padding:18px 12px 40px}.top{padding:10px 12px}}
</style>
</head>
<body>
<header class="top"><div class="top-inner"><a class="brand" href="/">AHABONA · Admin</a><a class="back" href="/admin">← Subira kuri Admin</a></div></header>
<main class="wrap">
<section class="intro"><span class="pill">ADMIN / JOB MODERATION</span><h1>Genzura amatangazo y'akazi</h1><p>Reba amakuru yatanzwe, genzura umutekano n'ukuri kwayo, hanyuma wemeze, usabe ibikosorwa cyangwa wange itangazo.</p></section>
<div class="stats"><span class="pill" id="pending-count">Turimo kubara…</span><span class="pill">Approved jobs ni zo zigaragara ku mugaragaro</span></div>
<div id="message" aria-live="polite"></div>
<div id="jobs"><div class="loading">Turimo kuzana amatangazo ategereje igenzura…</div></div>
<p class="footer">AHABONA · Genzura amakuru yatanzwe. Ntukemeze impamyabumenyi cyangwa umwirondoro utabanje kubona ibimenyetso byabyo.</p>
</main>
<script>
(function(){
'use strict';
function $(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
async function api(method,url,body){
 try{var r=await fetch(url,{method:method,credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});var data={};try{data=await r.json()}catch(e){}return {ok:r.ok,status:r.status,data:data}}catch(e){return {ok:false,status:0,data:{error:'network'}}}
}
function msg(text,error){$('message').innerHTML='<div class="alert'+(error?' error':'')+'">'+esc(text)+'</div>'}
function fmt(v){if(!v)return 'Nta tariki';var d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleString('rw-RW'):'Nta tariki'}
function renderJob(j){
 var employerState=j.employer_verification_status==='verified'?'Verified':'Ntabwo umukoresha yagenzuwe';
 return '<article class="job" data-job="'+esc(j.id)+'"><div class="meta"><span class="status">Pending review</span><span class="chip">'+esc(employerState)+'</span><span class="chip">Yatanzwe: '+esc(fmt(j.created_at))+'</span></div>'+
 '<h2>'+esc(j.title)+'</h2><div class="muted">'+esc(j.employer_name||'Umukoresha utaramenyekana')+'</div>'+
 '<div class="meta"><span class="chip">'+esc(j.province||'Aho hantu ntihatoranyijwe')+'</span><span class="chip">'+esc(j.district||'')+'</span><span class="chip">'+esc(j.employment_type||'')+'</span><span class="chip">'+esc(j.work_arrangement||'')+'</span><span class="chip">'+esc(j.vacancies||1)+' imyanya</span></div>'+
 '<p class="description">'+esc(j.description)+'</p>'+
 '<div class="grid"><div class="section"><h3>Ahantu</h3><p>'+esc([j.province,j.district,j.location_text].filter(Boolean).join(' · ')||'Nta makuru')+'</p><h3>Umushahara</h3><p>'+esc([j.salary_min,j.salary_max].filter(x=>x!=null).join(' - ')||'Ntiwatangajwe')+' '+esc(j.salary_currency||'')+' '+esc(j.salary_period||'')+'</p></div><div class="section"><h3>Deadline</h3><p>'+esc(fmt(j.deadline_at))+'</p><h3>Icyiciro</h3><p>'+esc(j.category||'Nta cyiciro')+'</p></div></div>'+
 '<h3>Impamvu / ibisobanuro by’igenzura</h3><textarea class="note" maxlength="1000" placeholder="Andika impamvu iyo usabye ibikosorwa cyangwa wanze itangazo."></textarea>'+
 '<div class="actions"><button class="btn primary" type="button" data-review="approved">Emeza kandi ushyire hanze</button><button class="btn" type="button" data-review="changes_requested">Saba ibikosorwa</button><button class="btn reject" type="button" data-review="rejected">Anga itangazo</button></div></article>';
}
async function load(){
 $('jobs').innerHTML='<div class="loading">Turimo kuzana amatangazo ategereje igenzura…</div>';
 var result=await api('GET','/api/admin/jobs?limit=50');
 if(!result.ok){$('pending-count').textContent='Igenzura ntiryabashije kuboneka';$('jobs').innerHTML='<div class="empty">Ugomba kwinjira nka Admin ufite uburenganzira bwa jobs.moderate kugira ngo ukore igenzura.</div>';return}
 var rows=result.data.jobs||[];$('pending-count').textContent=rows.length+' amatangazo ategereje igenzura';
 $('jobs').innerHTML=rows.length?rows.map(renderJob).join(''):'<div class="empty">Nta tangazo ritegereje igenzura. Ubu nta murimo usigaye hano.</div>';
}
async function review(button){
 var card=button.closest('[data-job]'),id=card&&card.getAttribute('data-job');
 if(!card||!id)return;
 var action=button.getAttribute('data-review'),note=card.querySelector('textarea').value.trim();
 if(action!=='approved'&&note.length<5){msg('Andika impamvu nibura inyuguti 5 mbere yo gusaba ibikosorwa cyangwa kwanga.',true);return}
 if(!window.confirm(action==='approved'?'Wemeza ko iri tangazo rihuye n’amabwiriza kandi rishobora kujya hanze?':'Urashaka kohereza iki cyemezo ku watanze akazi?'))return;
 var buttons=card.querySelectorAll('button');buttons.forEach(function(x){x.disabled=true});
 var result=await api('POST','/api/admin/jobs/'+encodeURIComponent(id)+'/review',{action:action,note:note});
 if(!result.ok){buttons.forEach(function(x){x.disabled=false});msg((result.data&&result.data.error)||'Igenzura ntiryabashije kubikwa.',true);return}
 msg(action==='approved'?'Itangazo ryemejwe. Rigiye kugaragara ku rubuga, kandi matching izatangira.':action==='rejected'?'Itangazo ryanze. Umukoresha azamenyeshwa impamvu.':'Umukoresha yasabwe gukosora itangazo.','');
 card.remove();var remaining=$('jobs').querySelectorAll('[data-job]').length;$('pending-count').textContent=remaining+' amatangazo ategereje igenzura';
 if(!remaining)$('jobs').innerHTML='<div class="empty">Nta tangazo ritegereje igenzura.</div>';
}
$('jobs').addEventListener('click',function(e){var b=e.target.closest('[data-review]');if(b)review(b)});
load();
})();
</script>
</body>
</html>\`;

module.exports={JOB_MODERATION_HTML};

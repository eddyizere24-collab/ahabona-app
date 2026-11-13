'use strict';

const OPPORTUNITIES_HTML = String.raw`<!doctype html>
<html lang="rw">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1a9b6c">
<meta name="description" content="Reba amahirwe y'akazi yatangajwe kuri AHABONA. Shaka akazi kajyanye n'ubushobozi bwawe cyangwa utangaze umwanya ukeneye abakozi.">
<meta name="robots" content="index,follow">
<link rel="canonical" href="https://ahabona.duckdns.org/opportunities">
<title>Amahirwe y'akazi | AHABONA</title>
<style>
:root{--p:#1a9b6c;--pd:#158055;--g:#d4a838;--bg:#faf7ef;--surface:#fff;--ink:#1e2a32;--muted:#64707a;--border:#e8e4da;--danger:#b9382e;--soft:rgba(26,155,108,.09);--shadow:0 8px 28px rgba(20,40,30,.07)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}a{color:var(--p);text-decoration:none}button,input,select,textarea{font:inherit}button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid rgba(212,168,56,.8);outline-offset:2px}
.top{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}.top-inner{max-width:1120px;margin:auto;padding:10px 16px;display:flex;align-items:center;gap:12px}.brand{display:flex;align-items:center;gap:9px;color:#12261c;font-size:18px;font-weight:850;letter-spacing:.3px;margin-right:auto}.sun{width:28px;height:28px}.back{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border);padding:8px 12px;border-radius:10px;color:var(--ink);font-weight:650;background:#fff}.wrap{max-width:1120px;margin:0 auto;padding:24px 16px 56px}.intro{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin:10px 0 22px}.eyebrow{display:inline-block;padding:5px 10px;border-radius:999px;background:#e7f4ed;color:#166144;font-size:12px;font-weight:800;letter-spacing:.2px}.intro h1{font-size:clamp(27px,4vw,38px);line-height:1.15;margin:12px 0 8px;letter-spacing:-.7px}.intro p{max-width:650px;margin:0;color:var(--muted)}.actions{display:flex;flex-wrap:wrap;gap:9px}.btn{display:inline-flex;justify-content:center;align-items:center;gap:8px;border:1px solid var(--border);border-radius:11px;background:#fff;color:var(--ink);padding:10px 14px;font-weight:700;min-height:42px}.btn.primary{background:var(--p);border-color:var(--p);color:#fff}.btn.primary:hover{background:var(--pd)}.btn.ghost{background:var(--soft);border-color:transparent;color:#166144}.btn:disabled{opacity:.5;cursor:not-allowed}.panel{background:var(--surface);border:1px solid var(--border);border-radius:17px;box-shadow:var(--shadow)}.filters{display:grid;grid-template-columns:minmax(220px,1.6fr) repeat(2,minmax(150px,1fr)) auto;gap:10px;padding:14px;margin-bottom:15px}.field{display:flex;flex-direction:column;gap:5px}.field label{font-size:12px;font-weight:750;color:#4d5a62}.field input,.field select,.field textarea{width:100%;border:1px solid #d9ded9;border-radius:10px;background:#fff;padding:10px 11px;min-height:42px;color:var(--ink)}.field textarea{min-height:104px;resize:vertical}.field input::placeholder,.field textarea::placeholder{color:#8a949b}.filter-action{align-self:end}.result-line{display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:13px;margin:10px 3px 12px}.jobs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.job{padding:17px;display:flex;flex-direction:column;gap:11px;min-width:0;transition:transform .15s ease,border-color .15s ease}.job:hover{transform:translateY(-2px);border-color:#b8d7c6}.job-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.job h2{font-size:18px;line-height:1.3;margin:0 0 3px;overflow-wrap:anywhere}.employer{font-size:13px;color:var(--muted)}.verified{display:inline-flex;align-items:center;gap:4px;color:#176b4a;background:#eaf6ef;border-radius:999px;padding:3px 7px;font-size:11px;font-weight:750;white-space:nowrap}.chips{display:flex;flex-wrap:wrap;gap:6px}.chip{font-size:12px;background:#f3f5f2;border:1px solid #e7ebe6;color:#53615a;border-radius:999px;padding:4px 8px}.job-summary{margin:0;color:#56636a;font-size:13px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.job-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:6px}.salary{font-weight:800;color:#155f43;font-size:13px}.job-open{font-size:13px;font-weight:800;white-space:nowrap}.empty,.loading,.error{padding:34px;text-align:center;color:var(--muted)}.error{color:var(--danger)}.paging{display:flex;justify-content:center;gap:8px;margin:20px 0}.hidden{display:none!important}.detail{padding:22px;margin-top:14px}.detail-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.detail h2{font-size:25px;line-height:1.2;margin:7px 0}.detail h3{font-size:16px;margin:23px 0 8px}.detail p{white-space:pre-wrap}.detail-meta{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}.meta{background:#f4f6f3;border-radius:10px;padding:8px 10px;font-size:13px}.detail-columns{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(230px,1fr);gap:22px}.detail-main{min-width:0}.detail-side{background:#f8faf7;border:1px solid var(--border);border-radius:13px;padding:15px;height:max-content}.detail-side .btn{width:100%;margin-top:8px}.list-lines{padding-left:21px;margin:7px 0}.list-lines li{margin:5px 0}.form-panel{padding:20px;margin-top:16px}.form-panel h2{margin:0 0 6px;font-size:22px}.hint{font-size:13px;color:var(--muted);margin:0 0 16px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.wide{grid-column:1/-1}.form-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:16px}.notice{border-radius:11px;padding:11px 13px;margin:12px 0;font-size:13px;background:#edf6ef;color:#225b41}.notice.warn{background:#fff6e4;color:#78551a}.notice.error{background:#fff0ee;color:#92352c;text-align:left}.check-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted)}.check-row input{width:auto;min-height:0}.dashboard-list{display:grid;gap:9px}.dashboard-item{border:1px solid var(--border);border-radius:12px;padding:13px;display:flex;justify-content:space-between;gap:10px;align-items:center}.status{font-size:11px;font-weight:800;border-radius:999px;padding:4px 8px;background:#f0f2ef;color:#4b5b53}.status.approved{background:#e5f5eb;color:#176342}.status.pending_review{background:#fff4df;color:#865b15}.status.rejected{background:#fff0ee;color:#9d352d}.tabs{display:flex;gap:7px;flex-wrap:wrap;margin:24px 0 12px}.tab{background:#fff;border:1px solid var(--border);border-radius:999px;padding:8px 12px;font-size:13px;font-weight:750;color:#546159}.tab.active{background:#176b4a;color:#fff;border-color:#176b4a}.application-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px}.application-actions select{border:1px solid var(--border);border-radius:9px;padding:8px;min-height:40px;background:#fff}.candidate-snapshot{margin:12px 0}.candidate-snapshot p{margin:7px 0}.candidate-snapshot .chips{margin:7px 0}.skill-picks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:8px 0}.skill-picks .check-row{align-items:flex-start}.application-actions .hint{margin:0}.footer-note{color:var(--muted);font-size:12px;text-align:center;margin-top:35px}
@media(max-width:780px){.intro{display:block}.actions{margin-top:14px}.filters{grid-template-columns:1fr 1fr}.filters .search{grid-column:1/-1}.filter-action{grid-column:1/-1}.jobs{grid-template-columns:1fr}.detail-columns{grid-template-columns:1fr}.detail-side{order:-1}}
@media(max-width:480px){.top-inner{padding:9px 12px}.wrap{padding:18px 12px 42px}.back{padding:8px 9px;font-size:12px}.brand{font-size:16px}.filters{grid-template-columns:1fr}.filters .search,.filter-action{grid-column:auto}.intro h1{font-size:28px}.form-grid{grid-template-columns:1fr}.wide{grid-column:auto}.detail{padding:16px}.detail-head{align-items:flex-start}.detail h2{font-size:22px}.job{padding:15px}.dashboard-item{align-items:flex-start;flex-direction:column}}
</style>
</head>
<body>
<header class="top">
  <div class="top-inner">
    <a class="brand" href="/" aria-label="AHABONA home">
      <svg class="sun" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g stroke="#d4a838" stroke-width="1.6" stroke-linecap="round"><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/></g><circle cx="12" cy="12" r="4.5" fill="#d4a838"/></svg>
      AHABONA
    </a>
    <a class="back" href="/">← <span>Subira ku bantu</span></a>
  </div>
</header>
<main class="wrap">
  <section id="list-view">
    <div class="intro">
      <div>
        <span class="eyebrow">AMAHIRWE KU BANTU BOSE</span>
        <h1>Amahirwe y'akazi</h1>
        <p>Reba imyanya y'akazi yatangajwe. Ushobora kuyisoma utariyandikishije; gusaba akazi bikorwa kuri AHABONA aho bishoboka.</p>
      </div>
      <div class="actions">
        <button class="btn primary" id="open-post" type="button">＋ Tangaza akazi</button>
        <button class="btn" id="open-dashboard" type="button">Ibikorwa byanjye</button>
      </div>
    </div>
    <form class="panel filters" id="filters">
      <div class="field search">
        <label for="q">Shakisha akazi</label>
        <input id="q" name="q" type="search" placeholder="Urugero: umushoferi, accountant..." maxlength="100">
      </div>
      <div class="field">
        <label for="province">Intara</label>
        <select id="province" name="province">
          <option value="">Intara zose</option>
          <option>Umujyi wa Kigali</option><option>Amajyaruguru</option><option>Amajyepfo</option><option>Iburasirazuba</option><option>Iburengerazuba</option>
        </select>
      </div>
      <div class="field">
        <label for="employment">Ubwoko bw'akazi</label>
        <select id="employment" name="employment_type">
          <option value="">Ubwoko bwose</option><option value="full_time">Igihe cyose</option><option value="part_time">Igice cy'igihe</option><option value="contract">Amasezerano</option><option value="temporary">Igihe gito</option><option value="casual">By'igihe gito</option><option value="internship">Stage</option><option value="volunteer">Ubukorerabushake</option>
        </select>
      </div>
      <div class="filter-action"><button class="btn primary" type="submit">Shakisha</button></div>
    </form>
    <div class="result-line"><span id="result-count">Turimo gushakisha…</span><button class="btn" id="clear-filters" type="button">Siba filters</button></div>
    <div id="jobs" class="jobs" aria-live="polite"><div class="panel loading">Turimo gushakisha amahirwe…</div></div>
    <div class="paging"><button class="btn hidden" id="prev-page" type="button">← Ibanjirije</button><button class="btn hidden" id="next-page" type="button">Ibikurikira →</button></div>
  </section>

  <section id="detail-view" class="panel detail hidden" aria-live="polite">
    <div id="detail-content"><div class="loading">Turimo gufungura itangazo…</div></div>
  </section>

  <section id="post-view" class="panel form-panel hidden">
    <h2>Tangaza akazi</h2>
    <p class="hint">Tanga amakuru y'ingenzi gusa. Itangazo rinyura mu igenzura mbere yo kugaragara ku mugaragaro.</p>
    <div id="post-message" aria-live="polite"></div>
    <form id="post-form">
      <div class="form-grid">
        <div class="field"><label for="employer-name">Izina ry'umuntu cyangwa ikigo *</label><input id="employer-name" name="employer_name" required minlength="2" maxlength="120" autocomplete="organization"></div>
        <div class="field"><label for="job-title">Umwanya w'akazi *</label><input id="job-title" name="title" required minlength="3" maxlength="180" placeholder="Urugero: Abashoferi 5 barakenewe"></div>
        <div class="field wide"><label for="job-description">Ibisobanuro by'akazi *</label><textarea id="job-description" name="description" required minlength="20" maxlength="20000" placeholder="Sobanura icyo abakozi bazakora n'ibyo bakeneye kumenya."></textarea></div>
        <div class="field"><label for="category">Icyiciro cy'akazi</label><input id="category" name="category" maxlength="100" placeholder="Urugero: Ubwikorezi"></div>
        <div class="field wide"><label for="primary-capability">Ubuhanga nyamukuru bukenewe (bufasha matching)</label><select id="primary-capability" name="primary_capability_id"><option value="">Hitamo ubuhanga niba buhari</option></select><span class="hint">Hitamo ubuhanga nyamukuru kugira ngo AHABONA ibashe guhuza itangazo n'abantu bafite ubwo buhanga.</span></div>
        <div class="field"><label for="employment-type">Ubwoko bw'akazi *</label><select id="employment-type" name="employment_type" required><option value="full_time">Igihe cyose</option><option value="part_time">Igice cy'igihe</option><option value="contract">Amasezerano</option><option value="temporary">Igihe gito</option><option value="casual">By'igihe gito</option><option value="internship">Stage</option><option value="volunteer">Ubukorerabushake</option></select></div>
        <div class="field"><label for="work-arrangement">Aho akazi gakorerwa *</label><select id="work-arrangement" name="work_arrangement"><option value="on_site">Ku kazi</option><option value="hybrid">Ku kazi na online</option><option value="remote">Online</option></select></div>
        <div class="field"><label for="province-post">Intara</label><select id="province-post" name="province"><option value="">Hitamo intara</option><option>Umujyi wa Kigali</option><option>Amajyaruguru</option><option>Amajyepfo</option><option>Iburasirazuba</option><option>Iburengerazuba</option></select></div>
        <div class="field"><label for="district-post">Akarere</label><select id="district-post" name="district"><option value="">Hitamo akarere</option></select></div>
        <div class="field"><label for="location-text">Ahandi hantu hasobanutse</label><input id="location-text" name="location_text" maxlength="180" placeholder="Umurenge cyangwa aho bakorera"></div>
        <div class="field"><label for="vacancies">Umubare w'abakozi *</label><input id="vacancies" name="vacancies" type="number" min="1" max="10000" value="1" required></div>
        <div class="field"><label for="salary-min">Umushahara muto (RWF)</label><input id="salary-min" name="salary_min" type="number" min="0" step="1"></div>
        <div class="field"><label for="salary-max">Umushahara munini (RWF)</label><input id="salary-max" name="salary_max" type="number" min="0" step="1"></div>
        <div class="field"><label for="salary-period">Igihe umushahara ubarirwaho</label><select id="salary-period" name="salary_period"><option value="">Ntabwo watanzwe</option><option value="hourly">Ku isaha</option><option value="daily">Ku munsi</option><option value="weekly">Ku cyumweru</option><option value="monthly">Ku kwezi</option><option value="yearly">Ku mwaka</option><option value="one_off">Umushahara umwe</option></select></div>
        <div class="field"><label for="deadline">Itariki ntarengwa yo gusaba</label><input id="deadline" name="deadline_at" type="date"></div>
        <div class="field wide"><label for="requirements">Ibisabwa (buri kimwe ku murongo)</label><textarea id="requirements" name="requirements" placeholder="Urugero:&#10;Uruhushya rwo gutwara ibinyabiziga&#10;Uburambe bw'imyaka 2"></textarea></div>
        <div class="field wide"><label for="responsibilities">Inshingano z'akazi (buri kimwe ku murongo)</label><textarea id="responsibilities" name="responsibilities" placeholder="Andika inshingano z'ingenzi z'uyu mwanya."></textarea></div>
        <div class="field"><label for="apply-method">Uburyo abantu basaba akazi *</label><select id="apply-method" name="application_method"><option value="in_platform">Apply kuri AHABONA</option><option value="employer_contact">Kuvugana n'utanga akazi</option><option value="external_url">Gukoresha indi link</option></select></div>
        <div class="field"><label for="application-instructions">Andi mabwiriza yo gusaba</label><input id="application-instructions" name="application_instructions" maxlength="2000" placeholder="Ibyo usaba umukandida kohereza"></div>
        <div class="field contact-field hidden"><label for="public-email">Email yo kwakira abasaba</label><input id="public-email" name="employer_public_email" type="email" maxlength="254"></div>
        <div class="field contact-field hidden"><label for="public-phone">Telefoni yo kuvugana nawe</label><input id="public-phone" name="employer_public_phone" maxlength="30"></div>
        <div class="field wide external-field hidden"><label for="external-url">Link yo gusabiraho (HTTPS)</label><input id="external-url" name="external_application_url" type="url" placeholder="https://..." maxlength="1000"></div>
        <div class="field wide"><label class="check-row"><input id="salary-visible" name="salary_visible" type="checkbox" checked> Erekana umushahara ku itangazo</label></div>
      </div>
      <div class="form-actions"><button class="btn" id="cancel-post" type="button">Hagarika</button><button class="btn primary" id="submit-post" type="submit">Ohereza itangazo rijye kugenzurwa</button></div>
    </form>
  </section>

  <section id="dashboard-view" class="panel form-panel hidden">
    <div class="detail-head"><div><h2>Ibikorwa byanjye</h2><p class="hint">Kurikirana amatangazo watanze n'ubusabe bwo gusaba akazi.</p></div><button id="close-dashboard" class="btn" type="button">Funga</button></div>
    <div class="tabs"><button class="tab active" type="button" data-tab="employer">Amatangazo yanjye</button><button class="tab" type="button" data-tab="candidate">Akazi nasabye</button><button class="tab" type="button" data-tab="preferences">Ibyo nshaka mu kazi</button></div>
    <div id="dashboard-content"><div class="loading">Turimo kureba amakuru…</div></div>
  </section>
  <p class="footer-note">AHABONA · Kwiyandikisha, kureba no gusaba akazi kuri AHABONA ni ubuntu.</p>
</main>
<script>
(function(){
'use strict';
var PAGE_SIZE=20,OFFSET=0,LANG='rw',CURRENT_JOB=null,CURRENT_USER=null;
var DISTRICTS={
 'Umujyi wa Kigali':['Gasabo','Kicukiro','Nyarugenge'],
 'Amajyepfo':['Gisagara','Huye','Kamonyi','Muhanga','Nyamagabe','Nyanza','Nyaruguru','Ruhango'],
 'Amajyaruguru':['Burera','Gakenke','Gicumbi','Musanze','Rulindo'],
 'Iburasirazuba':['Bugesera','Gatsibo','Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana'],
 'Iburengerazuba':['Karongi','Ngororero','Nyabihu','Nyamasheke','Rubavu','Rusizi','Rutsiro']
};
function $(id){return document.getElementById(id)}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function deviceId(){
 try{var v=localStorage.getItem('ahabona_device');if(!v){var a=new Uint8Array(12);crypto.getRandomValues(a);v=Array.from(a,function(x){return ('0'+x.toString(16)).slice(-2)}).join('');localStorage.setItem('ahabona_device',v)}return v}catch(e){return ''}
}
async function api(method,url,body){
 var headers={'X-Device':deviceId()};
 if(body!==undefined)headers['Content-Type']='application/json';
 try{var response=await fetch(url,{method:method,headers:headers,body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin'});var data={};try{data=await response.json()}catch(e){}return {ok:response.ok,status:response.status,data:data}}catch(e){return {ok:false,status:0,data:{error:'network'}}}
}
function fmtDate(value){if(!value)return 'Nta tariki ntarengwa yatanzwe';var d=new Date(value);if(!Number.isFinite(d.getTime()))return '';return d.toLocaleDateString(LANG==='rw'?'rw-RW':'en-GB',{year:'numeric',month:'short',day:'numeric'})}
function fmtSalary(job){
 if(job.salary_min==null&&job.salary_max==null)return 'Umushahara ntiwatangajwe';
 var amount=(v)=>Number(v).toLocaleString('en-US');
 var text=job.salary_min!=null?amount(job.salary_min):'';
 if(job.salary_max!=null)text+=(text?' – ':'')+amount(job.salary_max);
 return text+' '+(job.salary_currency||'RWF')+(job.salary_period?' / '+job.salary_period:'');
}
function employmentLabel(value){return ({full_time:'Igihe cyose',part_time:"Igice cy'igihe",contract:'Amasezerano',temporary:'Igihe gito',casual:'By\'igihe gito',internship:'Stage',volunteer:'Ubukorerabushake'})[value]||value||''}
function workLabel(value){return ({on_site:'Ku kazi',hybrid:'Hybrid',remote:'Online'})[value]||value||''}
function show(view){
 ['list-view','detail-view','post-view','dashboard-view'].forEach(function(id){$(id).classList.toggle('hidden',id!==view)});
 window.scrollTo({top:0,behavior:'smooth'});
}
function showMessage(id,text,type){
 var node=$(id);if(!node)return;
 node.className='notice'+(type?' '+type:'');node.textContent=text;node.classList.remove('hidden');
}
async function refreshUnread(){
 var badge=$('jobs-unread');if(!badge)return;
 var result=await api('GET','/api/jobs/unread-count');
 if(!result.ok){badge.classList.add('hidden');return}
 var count=Number(result.data&&result.data.unread)||0;
 badge.textContent=count>99?'99+':String(count);
 badge.classList.toggle('hidden',count<1);
}
function jobCard(job){
 var location=[job.district,job.province].filter(Boolean).join(', ')||'Aho akazi gakorerwa hasobanuwe mu itangazo';
 var verified=job.employer_verified?'<span class="verified">✓ Igenzuwe</span>':'';
 return '<article class="panel job">'+
  '<div class="job-head"><div><h2>'+esc(job.title)+'</h2><div class="employer">'+esc(job.employer_name||'Umukoresha')+'</div></div>'+verified+'</div>'+
  '<div class="chips"><span class="chip">'+esc(employmentLabel(job.employment_type))+'</span><span class="chip">'+esc(workLabel(job.work_arrangement))+'</span><span class="chip">'+esc(location)+'</span></div>'+
  '<p class="job-summary">'+esc(job.summary||'')+'</p>'+
  '<div class="job-foot"><span class="salary">'+esc(fmtSalary(job))+'</span><button class="btn ghost" type="button" data-job="'+esc(job.id)+'">Reba itangazo →</button></div>'+
 '</article>';
}
async function loadJobs(reset){
 if(reset)OFFSET=0;
 var box=$('jobs');box.innerHTML='<div class="panel loading">Turimo gushakisha amahirwe…</div>';
 var params=new URLSearchParams();
 params.set('limit',String(PAGE_SIZE));params.set('offset',String(OFFSET));
 var q=$('q').value.trim(),province=$('province').value,employment=$('employment').value;
 if(q)params.set('q',q);if(province)params.set('province',province);if(employment)params.set('employment_type',employment);
 var result=await api('GET','/api/jobs?'+params.toString());
 if(!result.ok){
  box.innerHTML='<div class="panel error"><strong>Amatangazo y\'akazi ntaraboneka.</strong><p>Serivisi y\'amatangazo ntirabasha kugerwaho kuri iyi environment. Gerageza nyuma.</p></div>';
  $('result-count').textContent='Nta bisubizo bibonetse';
  $('prev-page').classList.add('hidden');$('next-page').classList.add('hidden');return;
 }
 var rows=(result.data&&result.data.jobs)||[];
 box.innerHTML=rows.length?rows.map(jobCard).join(''):'<div class="panel empty"><strong>Nta tangazo rihari muri ubu buryo bwo gushakisha.</strong><p>Ongera uhindure filters cyangwa uze kureba andi mahirwe.</p></div>';
 $('result-count').textContent=rows.length?rows.length+' amahirwe kuri uru rupapuro':'Nta tangazo rihuye na filters';
 $('prev-page').classList.toggle('hidden',OFFSET===0);
 $('next-page').classList.toggle('hidden',rows.length<PAGE_SIZE);
}
async function markRead(id){await api('POST','/api/jobs/'+encodeURIComponent(id)+'/read',{});refreshUnread()}
function renderDetail(data){
 var j=data.job||{},skills=data.skills||[],questions=data.applicationQuestions||[];
 var where=[j.district,j.province,j.location_text].filter(Boolean).join(', ')||'Aho akazi gakorerwa harasobanuwe mu bisobanuro';
 var req=Array.isArray(j.requirements)?j.requirements:[];
 var duties=Array.isArray(j.responsibilities)?j.responsibilities:[];
 var skillHtml=skills.length?'<ul class="list-lines">'+skills.map(function(x){return '<li>'+esc(x.skill)+(x.requirement_level==='preferred'?' (Byifuzwa)':' (Birakenewe)')+'</li>'}).join('')+'</ul>':'<p class="hint">Nta bumenyi bwihariye bwashyizwe ku rutonde.</p>';
 var reqHtml=req.length?'<ul class="list-lines">'+req.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':'<p class="hint">Nta bindi bisabwa byatanzwe.</p>';
 var dutiesHtml=duties.length?'<ul class="list-lines">'+duties.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':'';
 var method=j.application_method||'in_platform';
 var applyText=method==='in_platform'?'Saba akazi kuri AHABONA':(method==='external_url'?'Fungura uburyo bwo gusabiraho':'Vugana n\'utanga akazi');
 var contact=method==='employer_contact'?'<div class="notice">Ushobora kuvugana n\'utanga akazi ukoresheje amakuru yashyizwe ku mugaragaro.</div>'+(j.application_email?'<p><strong>Email:</strong> <a href="mailto:'+esc(j.application_email)+'">'+esc(j.application_email)+'</a></p>':'')+(j.application_phone?'<p><strong>Telefoni:</strong> <a href="tel:'+esc(j.application_phone)+'">'+esc(j.application_phone)+'</a></p>':''):'';
 var external=method==='external_url'&&j.external_application_url?'<a class="btn primary" rel="noopener noreferrer" target="_blank" href="'+esc(j.external_application_url)+'">Saba kuri link y\'utanga akazi ↗</a>':'';
 var questionHtml=questions.map(function(q){
  var id=esc(q.id),label=esc(q.prompt),required=q.required?'required':'';
  var input='';
  if(q.input_type==='long_text')input='<textarea data-question="'+id+'" '+required+'></textarea>';
  else if(q.input_type==='yes_no')input='<select data-question="'+id+'" '+required+'><option value="">Hitamo</option><option value="yes">Yego</option><option value="no">Oya</option></select>';
  else if(q.input_type==='single_choice')input='<select data-question="'+id+'" '+required+'><option value="">Hitamo</option>'+(q.options||[]).map(function(o){return '<option>'+esc(o)+'</option>'}).join('')+'</select>';
  else if(q.input_type==='multiple_choice')input='<select multiple data-question="'+id+'" '+required+'>' +(q.options||[]).map(function(o){return '<option>'+esc(o)+'</option>'}).join('')+'</select>';
  else input='<input data-question="'+id+'" type="text" '+required+'>';
  return '<div class="field"><label>'+label+(required?' *':'')+'</label>'+input+'</div>';
 }).join('');
 var applyPanel=method==='in_platform'?'<div class="detail-side"><strong>Gusaba akazi</strong><p class="hint">Koresha amakuru ari muri profile yawe. Amakuru y\'ibanga ntashyirwa ku mugaragaro.</p><div class="field"><label for="cover-message">Ubutumwa bugufi (si ngombwa)</label><textarea id="cover-message" maxlength="4000" placeholder="Sobanura impamvu wujuje ibisabwa."></textarea></div>'+(questionHtml?'<h3>Ibibazo by\'utanga akazi</h3>'+questionHtml:'')+'<div id="apply-message"></div><button class="btn primary" id="apply-job" type="button">Ohereza ubusabe</button></div>':'<div class="detail-side"><strong>Uburyo bwo gusaba</strong><p>'+esc(j.application_instructions||'Kurikiza amabwiriza ari ku itangazo.')+'</p>'+contact+external+'</div>';
 $('detail-content').innerHTML=
  '<div class="detail-head"><div><span class="eyebrow">ITANGAZO RY\'AKAZI</span><h2>'+esc(j.title)+'</h2><div class="employer">'+esc(j.employer_name||'Umukoresha')+(j.employer_verified?' · Igenzuwe':'')+'</div></div><button class="btn" id="back-list" type="button">← Subira ku matangazo</button></div>'+
  '<div class="detail-meta"><span class="meta">📍 '+esc(where)+'</span><span class="meta">'+esc(employmentLabel(j.employment_type))+'</span><span class="meta">'+esc(workLabel(j.work_arrangement))+'</span><span class="meta">'+esc(j.vacancies||1)+' imyanya</span><span class="meta">Deadline: '+esc(fmtDate(j.deadline_at))+'</span></div>'+
  '<div class="detail-columns"><div class="detail-main">'+
  '<h3>Ibisobanuro by\'akazi</h3><p>'+esc(j.description||'')+'</p>'+
  '<h3>Umushahara</h3><p>'+esc(fmtSalary(j))+'</p>'+
  '<h3>Ibisabwa</h3>'+reqHtml+
  '<h3>Ubuhanga bukenewe</h3>'+skillHtml+
  (duties.length?'<h3>Inshingano z\'akazi</h3>'+dutiesHtml:'')+
  '</div>'+applyPanel+'</div>';
 if(method==='in_platform')$('apply-job').addEventListener('click',function(){submitApplication(j.id,questions)});
}
async function openJob(id,changeUrl){
 CURRENT_JOB=id;show('detail-view');$('detail-content').innerHTML='<div class="loading">Turimo gufungura itangazo…</div>';
 if(changeUrl!==false){var u=new URL(window.location.href);u.searchParams.set('job',id);history.pushState({opportunity:id},'',u.pathname+u.search)}
 var result=await api('GET','/api/jobs/'+encodeURIComponent(id));
 if(!result.ok){$('detail-content').innerHTML='<div class="error">Iri tangazo ntiribashije kuboneka cyangwa ryarangije igihe.</div><button class="btn" id="back-list">Subira ku matangazo</button>';return}
 renderDetail(result.data);markRead(id);
}
async function submitApplication(jobId,questions){
 var message=$('apply-message'),button=$('apply-job');
 if(button)button.disabled=true;
 var answers={};
 (questions||[]).forEach(function(q){
  var el=document.querySelector('[data-question="'+q.id+'"]');
  if(!el)return;
  answers[q.id]=q.input_type==='multiple_choice'?Array.from(el.selectedOptions).map(function(o){return o.value}):el.value;
 });
 var result=await api('POST','/api/jobs/'+encodeURIComponent(jobId)+'/applications',{cover_message:$('cover-message')?$('cover-message').value:'',answers:answers});
 if(button)button.disabled=false;
 if(result.ok){showMessage('apply-message','Ubusabe bwawe bwoherejwe neza. Ushobora gukurikirana aho bugeze muri Ibikorwa byanjye.','');return}
 if(result.status===401){showMessage('apply-message','Ugomba kubanza kwinjira muri AHABONA kugira ngo usabe akazi. Fungura Ahabanza, winjire, hanyuma ugaruke kuri iri tangazo.','warn');return}
 showMessage('apply-message',(result.data&&result.data.error)||'Ubusabe ntibwashoboye koherezwa. Ongera ugerageze.','error');
}
function formObject(form){
 var data={},fd=new FormData(form);
 fd.forEach(function(value,key){if(key==='requirements'||key==='responsibilities')return;data[key]=typeof value==='string'?value.trim():value});
 data.salary_visible=$('salary-visible').checked;
 data.requirements=$('requirements').value.split(/\r?\n/).map(function(x){return x.trim()}).filter(Boolean);
 data.responsibilities=$('responsibilities').value.split(/\r?\n/).map(function(x){return x.trim()}).filter(Boolean);
 if(data.deadline_at)data.deadline_at=new Date(data.deadline_at+'T23:59:00').toISOString();
 if(data.salary_min==='')delete data.salary_min;
 if(data.salary_max==='')delete data.salary_max;
 if(data.vacancies)data.vacancies=Number(data.vacancies);
 if(data.salary_min)data.salary_min=Number(data.salary_min);
 if(data.salary_max)data.salary_max=Number(data.salary_max);
 return data;
}
function toggleApplyFields(){
 var method=$('apply-method').value;
 document.querySelectorAll('.contact-field').forEach(function(x){x.classList.toggle('hidden',method!=='employer_contact')});
 document.querySelectorAll('.external-field').forEach(function(x){x.classList.toggle('hidden',method!=='external_url')});
}
async function submitPost(event){
 event.preventDefault();
 var form=$('post-form');if(!form.reportValidity())return;
 $('submit-post').disabled=true;$('post-message').innerHTML='';
 var data=formObject(form);
 var result=await api('POST','/api/jobs',data);
 $('submit-post').disabled=false;
 if(result.ok){
  showMessage('post-message','Itangazo ryakiriwe kandi rishyizwe ku murongo wo kugenzurwa. Rizagaragara ku mugaragaro nyuma yo kwemezwa.','');
  form.reset();$('vacancies').value='1';$('salary-visible').checked=true;toggleApplyFields();return;
 }
 if(result.status===401){showMessage('post-message','Ugomba kubanza kwinjira muri AHABONA kugira ngo utangaze akazi. Fungura Ahabanza, winjire, hanyuma ugaruke hano.','warn');return}
 showMessage('post-message',(result.data&&result.data.error)||'Itangazo ntiryashoboye koherezwa. Reba amakuru wanditse wongere ugerageze.','error');
}
async function loadPostCapabilities(){
 var select=$('primary-capability');if(!select)return;
 var result=await api('GET','/api/jobs/capabilities');
 if(!result.ok)return;
 var groups={};(result.data.capabilities||[]).forEach(function(cap){(groups[cap.category]||(groups[cap.category]=[])).push(cap)});
 select.innerHTML='<option value="">Hitamo ubuhanga niba buhari</option>'+Object.keys(groups).sort().map(function(category){return '<optgroup label="'+esc(category)+'">'+groups[category].map(function(cap){return '<option value="'+esc(cap.id)+'" data-category="'+esc(cap.category)+'">'+esc(cap.name)+' / '+esc(cap.name_en)+'</option>'}).join('')+'</optgroup>'}).join('');
}
async function loadJobPreferences(){
 $('dashboard-content').innerHTML='<div class="loading">Turimo kureba ibyifuzo byawe…</div>';
 var result=await api('GET','/api/me/job-preferences');
 if(!result.ok){$('dashboard-content').innerHTML='<div class="empty">Ugomba kubanza kwinjira muri AHABONA kugira ngo ubike ibyo ushaka mu kazi. <a href="/">Fungura ahabanza</a>.</div>';return}
 var p=result.data.preferences||{},caps=result.data.capabilities||[];
 var groups={};caps.forEach(function(cap){(groups[cap.category]||(groups[cap.category]=[])).push(cap)});
 var selectedSkills=new Set((p.preferred_capability_ids||[]).map(Number));
 var skillsHtml=Object.keys(groups).sort().map(function(category){return '<div class="field"><strong>'+esc(category)+'</strong><div class="skill-picks">'+groups[category].map(function(cap){return '<label class="check-row"><input type="checkbox" name="preferred_capability_ids" value="'+esc(cap.id)+'" '+(selectedSkills.has(Number(cap.id))?'checked':'')+'> <span>'+esc(cap.name)+' / '+esc(cap.name_en)+'</span></label>'}).join('')+'</div></div>'}).join('');
 var provinces=Object.keys(DISTRICTS),districts=Object.keys(DISTRICTS).flatMap(function(x){return DISTRICTS[x]});
 var multi=function(id,label,values,selected){return '<div class="field"><label for="'+id+'">'+label+'</label><select id="'+id+'" multiple size="'+Math.min(5,Math.max(3,values.length))+'">'+values.map(function(x){return '<option value="'+esc(x)+'" '+(selected.includes(x)?'selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select><span class="hint">Ushobora guhitamo byinshi ukoresheje urutonde.</span></div>'};
 var employment=[['full_time','Igihe cyose'],['part_time',"Igice cy'igihe"],['contract','Amasezerano'],['temporary','Igihe gito'],['casual','By’igihe gito'],['internship','Stage'],['volunteer','Ubukorerabushake']];
 $('dashboard-content').innerHTML='<form id="preferences-form" class="form-panel" style="margin:0;padding:0;border:0;box-shadow:none">'+
  '<div id="preferences-message" aria-live="polite"></div><p class="hint">Andika icyo ushaka gukora. AHABONA izajya iguhuza n’amatangazo yujuje ibisabwa, kandi ushobora guhindura ibi igihe icyo ari cyo cyose.</p>'+
  '<label class="check-row"><input id="pref-seeking" type="checkbox" '+(p.seeking_work?'checked':'')+'> <strong>Ndi gushaka akazi ubu</strong></label>'+
  '<label class="check-row"><input id="pref-matching" type="checkbox" '+(p.matching_enabled?'checked':'')+'> Menyesha akazi gahuje n’ubushobozi n’ibyifuzo byanjye</label>'+
  '<div class="form-grid" style="margin-top:15px">'+
   '<div class="field wide"><strong>Ubuhanga nifuza gukoresha</strong><p class="hint">Hitamo ubuhanga bushobora kuguhesha amahirwe. Bushobora kuba ubwo washyize muri profile cyangwa ubundi wifuza gukoresha.</p>'+skillsHtml+'</div>'+
   multi('pref-provinces','Intara nakoreramo',provinces,p.preferred_provinces||[])+
   multi('pref-districts','Uturere nakoreramo',districts,p.preferred_districts||[])+
   '<div class="field"><label for="pref-employment">Ubwoko bw’akazi</label><select id="pref-employment" multiple size="5">'+employment.map(function(x){return '<option value="'+x[0]+'" '+((p.employment_types||[]).includes(x[0])?'selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></div>'+
   '<div class="field"><label for="pref-min-salary">Umushahara ntarengwa nifuza (RWF)</label><input id="pref-min-salary" type="number" min="0" max="1000000000" step="1000" value="'+(p.min_salary==null?'':esc(p.min_salary))+'"><span class="hint">Si ngombwa kuwushyiraho.</span></div>'+
  '</div>'+
  '<hr style="border:0;border-top:1px solid var(--border);margin:20px 0">'+
  '<label class="check-row"><input id="pref-inapp" type="checkbox" '+(p.in_app_enabled!==false?'checked':'')+'> Nemerera AHABONA kunyoherereza notifications zo muri uru rubuga</label>'+
  '<p class="hint">Email na push notifications tuzabihuza nyuma y’uko delivery services zigenzuwe. Ntiturakwereka amahitamo atarohereza ubutumwa.</p>'+
  '<div class="form-actions"><button class="btn primary" type="submit" id="save-preferences">Bika ibyo nshaka mu kazi</button></div></form>';
 $('pref-seeking').addEventListener('change',function(){$('pref-matching').disabled=!this.checked;if(!this.checked)$('pref-matching').checked=false});
 $('preferences-form').addEventListener('submit',saveJobPreferences);
}
async function saveJobPreferences(event){
 event.preventDefault();var button=$('save-preferences');button.disabled=true;
 var selected=function(id){var node=$(id);return Array.from(node.selectedOptions).map(function(o){return o.value})};
 var skills=Array.from(document.querySelectorAll('input[name="preferred_capability_ids"]:checked')).map(function(x){return Number(x.value)});
 var minimum=$('pref-min-salary').value;
 var payload={seeking_work:$('pref-seeking').checked,matching_enabled:$('pref-matching').checked,preferred_capability_ids:skills,preferred_provinces:selected('pref-provinces'),preferred_districts:selected('pref-districts'),employment_types:selected('pref-employment'),min_salary:minimum===''?null:Number(minimum),in_app_enabled:$('pref-inapp').checked};
 var result=await api('PUT','/api/me/job-preferences',payload);button.disabled=false;
 if(!result.ok){showMessage('preferences-message',(result.data&&result.data.error)||'Ibyo wahisemo ntibyabashije kubikwa. Gerageza nanone.','error');return}
 var matched=result.data.matching||{};
 showMessage('preferences-message','Byabitswe neza. '+(matched.notified||0)+' amahirwe mashya ahuye nawe yabonetse muri AHABONA.','');
}
function applicationStatusLabel(status){
 return ({submitted:'Byoherejwe',viewed:'Byarebwe',shortlisted:'Yatoranyijwe',interview:'Yatumiwe mu kiganiro',offered:'Yahawe amahirwe',hired:'Yabonye akazi',rejected:'Ntiyatoranyijwe',withdrawn:'Yikuyeho'})[status]||status||'';
}
function profileSnapshotHtml(raw){
 var p=raw;
 if(typeof p==='string'){try{p=JSON.parse(p)}catch(e){p={}}}
 p=p&&typeof p==='object'?p:{};
 var caps=Array.isArray(p.capabilities)?p.capabilities:[];
 var lines=[];
 if(p.district)lines.push('<span class="chip">📍 '+esc(p.district)+'</span>');
 if(caps.length)lines.push('<span class="chip">'+esc(caps.slice(0,8).join(', '))+'</span>');
 var exp=Array.isArray(p.experience)?p.experience:[];
 var languages=Array.isArray(p.languages)?p.languages:[];
 var availability=Array.isArray(p.availability)?p.availability:[];
 return '<div class="candidate-snapshot"><strong>'+esc(p.display_name||'Umukandida wa AHABONA')+'</strong><div class="chips">'+lines.join('')+'</div>'+
  (p.introduction?'<p>'+esc(p.introduction)+'</p>':'')+
  (exp.length?'<p class="hint"><strong>Uburambe:</strong> '+esc(exp.map(function(x){return typeof x==='string'?x:(x.title||x.role||x.description||'')}).filter(Boolean).join(' · '))+'</p>':'')+
  (p.education?'<p class="hint"><strong>Amashuri:</strong> '+esc(p.education)+'</p>':'')+
  (languages.length?'<p class="hint"><strong>Indimi:</strong> '+esc(languages.map(function(x){return typeof x==='string'?x:(x.name||'')}).filter(Boolean).join(', '))+'</p>':'')+
  (availability.length?'<p class="hint"><strong>Igihe aboneka:</strong> '+esc(availability.map(function(x){return typeof x==='string'?x:(x.label||x.type||'')}).filter(Boolean).join(', '))+'</p>':'')+'</div>';
}
function nextApplicationStatuses(status){
 return ({submitted:['viewed','shortlisted','interview','rejected'],viewed:['shortlisted','interview','rejected'],shortlisted:['interview','offered','rejected'],interview:['offered','hired','rejected'],offered:['hired','rejected']})[status]||[];
}
async function openEmployerApplications(jobId,title){
 $('dashboard-content').innerHTML='<div class="loading">Turimo gufungura applications…</div>';
 var result=await api('GET','/api/employer/jobs/'+encodeURIComponent(jobId)+'/applications');
 if(!result.ok){$('dashboard-content').innerHTML='<div class="notice error">Applications ntizashoboye kuboneka. Reba ko winjiye nka nyir\'itangazo.</div>';return}
 var rows=result.data.applications||[];
 var header='<div class="detail-head"><div><h3>'+esc(title||result.data.job&&result.data.job.title||'Applications')+'</h3><p class="hint">'+rows.length+' applications</p></div><button class="btn" id="back-employer-jobs" type="button">← Subira ku matangazo yanjye</button></div><div id="dashboard-message" aria-live="polite"></div>';
 if(!rows.length){$('dashboard-content').innerHTML=header+'<div class="empty">Nta muntu urasaba aka kazi.</div>';return}
 $('dashboard-content').innerHTML=header+'<div class="dashboard-list">'+rows.map(function(app){
  var next=nextApplicationStatuses(app.status);
  var action=next.length?'<div class="application-actions"><label class="hint" for="app-status-'+esc(app.id)+'">Hindura status</label><select id="app-status-'+esc(app.id)+'" data-application-status="'+esc(app.id)+'">'+next.map(function(x){return '<option value="'+x+'">'+esc(applicationStatusLabel(x))+'</option>'}).join('')+'</select><button type="button" class="btn primary" data-save-application="'+esc(app.id)+'">Bika status</button></div>':'';
  return '<article class="panel" style="padding:15px"><div class="dashboard-item" style="border:0;padding:0"><div><strong>'+esc(applicationStatusLabel(app.status))+'</strong><div class="hint">Yoherejwe: '+esc(fmtDate(app.submitted_at))+'</div></div><span class="status">'+esc(app.status)+'</span></div>'+
   profileSnapshotHtml(app.profile_snapshot)+
   (app.cover_message?'<div class="notice"><strong>Ubutumwa:</strong> '+esc(app.cover_message)+'</div>':'')+
   action+'</article>';
 }).join('')+'</div>';
}
async function updateApplicationStatus(applicationId){
 var select=document.querySelector('[data-application-status="'+applicationId+'"]');
 var button=document.querySelector('[data-save-application="'+applicationId+'"]');
 if(!select||!button)return;
 button.disabled=true;
 var result=await api('POST','/api/employer/applications/'+encodeURIComponent(applicationId)+'/status',{status:select.value});
 button.disabled=false;
 if(!result.ok){showMessage('dashboard-message',(result.data&&result.data.error)||'Status ntibyabashije guhinduka.','error');return}
 var card=button.closest('article');
 if(card){var old=card.querySelector('.status');if(old){old.textContent=applicationStatusLabel(select.value);old.className='status'}card.querySelector('strong').textContent=applicationStatusLabel(select.value);card.querySelector('.application-actions').remove()}
 showMessage('dashboard-message','Status ya application yahinduwe neza. Uwasabye akazi azabimenyeshwa muri AHABONA.','');
}
async function loadDashboard(tab){
 if(tab==='preferences')return loadJobPreferences();
 $('dashboard-content').innerHTML='<div class="loading">Turimo kureba amakuru…</div>';
 var endpoint=tab==='candidate'?'/api/me/applications':'/api/me/jobs';
 var result=await api('GET',endpoint);
 if(!result.ok){$('dashboard-content').innerHTML='<div class="empty">Ugomba kwinjira muri AHABONA kugira ngo urebe ibikorwa byawe.</div>';return}
 var rows=tab==='candidate'?(result.data.applications||[]):(result.data.jobs||[]);
 if(tab==='candidate'){
  if(!rows.length){$('dashboard-content').innerHTML='<div class="empty">Nta kazi urasaba.</div>';return}
  $('dashboard-content').innerHTML='<div class="dashboard-list">'+rows.map(function(x){return '<div class="dashboard-item"><div><strong>'+esc(x.job_title||x.title||'Akazi')+'</strong><div class="hint">'+esc(x.employer_name||'')+' · '+esc([x.district,x.province].filter(Boolean).join(', '))+'</div></div><span class="status">'+esc(applicationStatusLabel(x.status))+'</span></div>'}).join('')+'</div>';
 }else{
  if(!rows.length){$('dashboard-content').innerHTML='<div class="empty">Nta tangazo uratanga.</div>';return}
  $('dashboard-content').innerHTML='<div id="dashboard-message" aria-live="polite"></div><div class="dashboard-list">'+rows.map(function(x){
   return '<article class="panel dashboard-item" style="padding:14px"><div><strong>'+esc(x.title)+'</strong><div class="hint">'+esc(x.application_count||0)+' applications · '+esc(x.vacancies||1)+' imyanya · '+esc(fmtDate(x.deadline_at))+'</div><span class="status '+esc(x.status)+'">'+esc(x.status)+'</span></div><div class="actions"><button class="btn primary" data-open-applications="'+esc(x.id)+'" data-job-title="'+esc(x.title)+'" type="button">Reba applications ('+esc(x.application_count||0)+')</button></div></article>';
  }).join('')+'</div>';
 }
}

async function checkUser(){
 var r=await api('GET','/api/me');
 CURRENT_USER=r.ok&&r.data?r.data.user||null:null;
}
$('filters').addEventListener('submit',function(e){e.preventDefault();loadJobs(true)});
$('clear-filters').addEventListener('click',function(){$('filters').reset();loadJobs(true)});
$('prev-page').addEventListener('click',function(){OFFSET=Math.max(0,OFFSET-PAGE_SIZE);loadJobs(false)});
$('next-page').addEventListener('click',function(){OFFSET+=PAGE_SIZE;loadJobs(false)});
$('jobs').addEventListener('click',function(e){var b=e.target.closest('[data-job]');if(b)openJob(b.getAttribute('data-job'),true)});
$('detail-content').addEventListener('click',function(e){if(e.target.closest('#back-list')){history.back();if(window.location.search.indexOf('job=')===-1)show('list-view')}});
$('open-post').addEventListener('click',async function(){await checkUser();await loadPostCapabilities();show('post-view')});
$('cancel-post').addEventListener('click',function(){show('list-view')});
$('post-form').addEventListener('submit',submitPost);
$('apply-method').addEventListener('change',toggleApplyFields);
$('work-arrangement').addEventListener('change',function(){var remote=this.value==='remote';$('province-post').disabled=remote;$('district-post').disabled=remote});
$('province-post').addEventListener('change',function(){var items=DISTRICTS[this.value]||[];$('district-post').innerHTML='<option value="">Hitamo akarere</option>'+items.map(function(x){return '<option>'+esc(x)+'</option>'}).join('')});
$('open-dashboard').addEventListener('click',function(){show('dashboard-view');loadDashboard('employer')});
$('dashboard-content').addEventListener('click',function(e){
 var open=e.target.closest('[data-open-applications]');
 if(open){openEmployerApplications(open.getAttribute('data-open-applications'),open.getAttribute('data-job-title'));return}
 var save=e.target.closest('[data-save-application]');
 if(save)updateApplicationStatus(save.getAttribute('data-save-application'));
 if(e.target.closest('#back-employer-jobs'))loadDashboard('employer');
});
$('primary-capability').addEventListener('change',function(){var selected=this.options[this.selectedIndex];if(selected&&selected.dataset.category&&!$('category').value)$('category').value=selected.dataset.category});
$('close-dashboard').addEventListener('click',function(){show('list-view')});
document.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('[data-tab]').forEach(function(x){x.classList.toggle('active',x===b)});loadDashboard(b.getAttribute('data-tab'))})});
window.addEventListener('popstate',function(){var u=new URL(window.location.href),id=u.searchParams.get('job');if(id)openJob(id,false);else{CURRENT_JOB=null;show('list-view')}});
window.addEventListener('pageshow',refreshUnread);
if(new URL(window.location.href).searchParams.get('job'))openJob(new URL(window.location.href).searchParams.get('job'),false);else loadJobs(true);
checkUser();refreshUnread();toggleApplyFields();
})();
</script>
</body>
</html>`;

module.exports = { OPPORTUNITIES_HTML };

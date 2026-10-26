
'use strict';
(function(){
var LANG='rw';
var TAX_GLOBAL={};
function t(k){return k}

/* UI translations for the separate admin dashboard. User-supplied names and content
   remain unchanged; only known interface labels and prompts are translated. */
var ADMIN_EN={
  "Ubuyobozi":"Admin","Injira":"Log in","Injira kugira ngo ukomeze":"Sign in to continue",
  "Email cyangwa telefoni":"Email or phone","Ijambobanga":"Password",
  "Email, telefoni cyangwa ijambobanga si byo.":"Email, phone number or password is incorrect.",
  "Iyi konti si iy’umuyobozi.":"This account is not an administrator.",
  "Nta burenganzira bwo kureba ikintu na kimwe. Saba Super Admin.":"You do not have permission to view any section. Contact the Super Admin.",
  "Birimo…":"Loading…","Habaye ikibazo":"An error occurred",
  "Incamake":"Overview","Uko urubuga rukorera ubu":"Current website activity",
  "Abakoresha":"Users","Imyirondoro":"Profiles","Ibibazo":"Reports","Ibisabwa":"Requests",
  "Imirimo":"Skills and jobs","Ibyiciro":"Categories","Ikibaho cy’Izuba":"Hero banner",
  "FAQ":"FAQ","Ubutumwa":"Messages","Ibikorwa":"Features","Igenamiterere":"Settings",
  "Amateka":"Audit log","Abayobozi":"Administrators","Ohereza ubutumwa kuri bose":"Send a message to everyone",
  "Umutwe":"Subject","Ubutumwa":"Message","Ohereza":"Send","Bika":"Save","Emeza":"Confirm",
  "Hindura":"Edit","Reba":"View","Siba":"Delete","Kuraho":"Remove","Subira":"Back",
  "Ongeraho":"Add","Ongeraho icyiciro":"Add category","Ongeraho ikibazo":"Add question",
  "Ongeraho umurimo mushya":"Add a new skill","Ongeraho umuyobozi":"Add administrator",
  "Bose":"All","Akarere":"District","Izina":"Name","Telefoni":"Phone","Email":"Email",
  "Ibara":"Color","Ubwoko":"Type","Icyiciro":"Category","Ijambo":"Term","Inshuro":"Count",
  "Igikorwa":"Action","Igihe":"Date and time","Impamvu":"Reason","Igisubizo":"Response",
  "Icyo yasabye":"Requested item","Ibyo yemerewe":"Permissions","Imirimo n’ibyo yemerewe":"Skills and permissions",
  "Link y’ubutumire":"Invitation link","Kopera link":"Copy link","Reset password":"Reset password",
  "Ohereza kuri WhatsApp":"Send via WhatsApp","Ifoto":"Image","Ifoto (fayile)":"Image file",
  "Video (fayile)":"Video file","Video (max ~30s)":"Video (max ~30 seconds)",
  "Agaciro (ijambo ryo gushakisha, link cyangwa telefoni)":"Value (search term, link or phone number)",
  "Amagambo (English)":"Text (English)","Amagambo (Kinyarwanda)":"Text (Kinyarwanda)",
  "Izina rya buto (English)":"Button label (English)","Izina rya buto (Kinyarwanda)":"Button label (Kinyarwanda)",
  "Umutwe (English)":"Title (English)","Umutwe (Kinyarwanda)":"Title (Kinyarwanda)",
  "Tagline":"Tagline","Icyiciro kigomba kuba kimwe muri ibi:":"Category must be one of these:",
  "Ubwoko bwikibaho":"Banner type","Ubwoko (akamenyetso gato hejuru)":"Type (small label at the top)",
  "Igikorwa cya buto":"Button action","Tondeka":"Sort order","Itondekanya (umubare munini ujya imbere)":"Sort order (higher numbers first)",
  "Itangira (itariki, bishobora kuba ubusa)":"Starts at (date, may be empty)",
  "Irangira (itariki, bishobora kuba ubusa)":"Ends at (date, may be empty)",
  "Ifoto ihindurwa ku telefoni yawe mbere yo koherezwa (ntirenze 1600px). Ushobora kongeraho amafoto menshi uko ushaka: buri foto ni ikibaho cyayo.":"Images are resized on your device before upload (maximum 1600px). You can add multiple images; each image becomes its own banner.",
  "Ifoto iriho ubu irerekanwa hasi. Hitamo indi niba ushaka kuyisimbuza.":"The current image is shown below. Choose another file to replace it.",
  "Video ntirenze 64MB. Niba ndende, dufata amasegonda 30 ya mbere (iyo ffmpeg ihari). Hasi urabona niba ikina.":"Videos must be no larger than 64 MB. If longer, the first 30 seconds are used when ffmpeg is available. The preview below shows whether the video plays.",
  "Ibibaho bizunguruka hejuru y’urubuga. Ongeraho inyandiko, ifoto cyangwa video (max ~30s), ibibaho byinshi uko ushaka. Ibiri ON bihinduranya. Ibifite itangira n’irangira bigaragara gusa muri icyo gihe.":"Banners rotate at the top of the website. Add text, an image or a video (about 30 seconds maximum); add as many banners as needed. Enabled banners rotate. Scheduled banners appear only during their start and end dates.",
  "Ibyamamaza (Iyamamaza) bihora byanditseho “Iyamamaza” kugira ngo abantu batayobywa.":"Advertisements must be labelled “Advertisement” so users are not misled.",
  "Ibifite akamenyetso “Haracyaje” ntibirakora: kubizimya cyangwa kubifungura ntacyo bihindura.":"Features marked “Coming soon” are not implemented; turning them on or off has no effect.",
  "Super Admin ni we uhindura ibyemerewe byihariye.":"Only the Super Admin can change restricted permissions.",
  "Nta bakoresha.":"No users.","Nta bibazo.":"No reports.","Nta bisabwa.":"No requests.",
  "Nta butumwa.":"No messages.","Nta mateka.":"No audit events.",
  "Ubutumwa buzoherezwa ku bakoresha BOSE. Urabyemeza?":"This message will be sent to ALL users. Continue?",
  "Urabyemeza gusiba uyu mukoresha?":"Are you sure you want to delete this user?",
  "Siba umurimo?":"Delete this skill?","Gusiba iki kibaho?":"Delete this banner?",
  "Siba?":"Delete?","Iyi link imara iminsi 3. Ushobora gukora indi mu rutonde rw’abayobozi.":"This link expires in 3 days. You can create another from the administrators list.",
  "Nta foto iragaragara":"No image to display","ifoto nta URL":"image URL is missing",
  "ifoto: FAYILE NTIBONEKA":"image: FILE NOT FOUND","video nta URL":"video URL is missing",
  "video: FAYILE NTIBONEKA":"video: FILE NOT FOUND","Buto":"Button","Stats zuzuye":"Full statistics",
  "Injira":"Sign in","Owner":"Owner","Role":"Role","Status":"Status","Verified":"Verified",
  "Category":"Category","Contact":"Contact","Top searches (7d)":"Top searches (7 days)",
  "Terms (amagambo yo gushakisha)":"Terms (search terms)","Message":"Message","Name":"Name",
  "Umunyamuryango":"Member","active":"Active","suspended":"Suspended","deleted":"Deleted",
  "dismissed":"Dismissed","reviewed":"Reviewed","actioned":"Actioned","done":"Done",
  "off":"Off","on":"On","new":"New","read":"Read","deleted":"Deleted",
  "Hindura umukoresha":"Edit user","Nta muntu":"No user"
};
var ADMIN_TEXT_SOURCE=new WeakMap();
var ADMIN_ATTR_SOURCE=new WeakMap();
function adminEnglishText(source){
  if(Object.prototype.hasOwnProperty.call(ADMIN_EN,source))return ADMIN_EN[source];
  var m;
  if((m=/^(\\d+) bakoresha$/.exec(source)))return m[1]+' users';
  if((m=/^(\\d+) imyirondoro$/.exec(source)))return m[1]+' profiles';
  if((m=/^(\\d+) ibibazo$/.exec(source)))return m[1]+' reports';
  if((m=/^(\\d+) bisabwa$/.exec(source)))return m[1]+' requests';
  if((m=/^(\\d+) imirimo$/.exec(source)))return m[1]+' skills';
  if((m=/^(\\d+) byiciro$/.exec(source)))return m[1]+' categories';
  if((m=/^(\\d+) messages$/.exec(source)))return m[1]+' messages';
  if((m=/^(\\d+) reports$/.exec(source)))return m[1]+' reports';
  if((m=/^Hindura umukoresha #(\\d+)$/.exec(source)))return 'Edit user #'+m[1];
  if((m=/^Hindura ikibaho #(\\d+)$/.exec(source)))return 'Edit banner #'+m[1];
  if((m=/^Hindura (.+)$/.exec(source)))return 'Edit '+m[1];
  if((m=/^Ohereza iyi link kuri (.+)\\. Ni we ushyiraho ijambobanga rye; ntawe urimenya\\.$/.exec(source)))return 'Send this link to '+m[1]+'. They set their own password; nobody else can see it.';
  if((m=/^Guhagarika (.+)\\? Ntazabasha kwinjira\\.$/.exec(source)))return 'Suspend '+m[1]+'? They will not be able to sign in.';
  if((m=/^Gukuraho ubuyobozi bwa (.+)\\?(.+)$/.exec(source)))return 'Remove administrator access for '+m[1]+'?'+m[2];
  if((m=/^Habaye ikibazo: (.+)$/.exec(source)))return 'An error occurred: '+m[1];
  if((m=/^(.+): tegereza…$/.exec(source)))return 'Waiting: '+m[1];
  if((m=/^(.+): NTIKINA\\.(.*)$/.exec(source)))return m[1]+': NOT PLAYING.'+m[2];
  if((m=/^(.+): irakina \\((.+)\\)\\.(.*)$/.exec(source)))return m[1]+': playing ('+m[2]+').'+m[3];
  return source;
}
function translateAdminTextNode(node){
  var current=node.nodeValue||'';
  var rec=ADMIN_TEXT_SOURCE.get(node);
  var source=rec&&current===rec.output?rec.source:current;
  var output=LANG==='en'?adminEnglishText(source):source;
  ADMIN_TEXT_SOURCE.set(node,{source:source,output:output});
  if(current!==output)node.nodeValue=output;
}
function translateAdminAttributes(el){
  ['placeholder','title','aria-label'].forEach(function(attr){
    if(!el.hasAttribute||!el.hasAttribute(attr))return;
    var current=el.getAttribute(attr)||'';
    var dict=ADMIN_ATTR_SOURCE.get(el)||{};
    var rec=dict[attr];
    var source=rec&&current===rec.output?rec.source:current;
    var output=LANG==='en'?adminEnglishText(source):source;
    dict[attr]={source:source,output:output};
    ADMIN_ATTR_SOURCE.set(el,dict);
    if(current!==output)el.setAttribute(attr,output);
  });
}
function translateAdminNode(node){
  if(!node)return;
  if(node.nodeType===3){translateAdminTextNode(node);return}
  if(node.nodeType!==1&&node.nodeType!==9&&node.nodeType!==11)return;
  if(node.nodeType===1)translateAdminAttributes(node);
  var walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
  var textNode;
  while((textNode=walker.nextNode()))translateAdminTextNode(textNode);
  if(node.querySelectorAll)node.querySelectorAll('*').forEach(translateAdminAttributes);
}
function setAdminLanguage(lang){
  LANG=lang==='en'?'en':'rw';
  try{localStorage.setItem('ahabona_lang',LANG)}catch(e){}
  document.documentElement.lang=LANG;
  document.querySelectorAll('[data-admin-lang]').forEach(function(btn){
    btn.classList.toggle('active',btn.getAttribute('data-admin-lang')===LANG);
    btn.setAttribute('aria-pressed',btn.getAttribute('data-admin-lang')===LANG?'true':'false');
  });
  translateAdminNode(document.body);
}
function setupAdminLanguage(){
  document.querySelectorAll('[data-admin-lang]').forEach(function(btn){
    btn.addEventListener('click',function(){setAdminLanguage(btn.getAttribute('data-admin-lang'))});
  });
  var initial='rw';
  try{var saved=localStorage.getItem('ahabona_lang');if(saved==='rw'||saved==='en')initial=saved}catch(e){}
  setAdminLanguage(initial);
  var observer=new MutationObserver(function(records){
    records.forEach(function(rec){
      if(rec.type==='characterData')translateAdminTextNode(rec.target);
      if(rec.type==='attributes'&&rec.target.nodeType===1)translateAdminAttributes(rec.target);
      rec.addedNodes&&rec.addedNodes.forEach(translateAdminNode);
    });
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
}
function $(s){return document.querySelector(s)}
function $$(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toast(msg){
  var el=$('#toast');
  if(!el)return;
  el.textContent=msg;
  el.style.display='block';
  clearTimeout(toast.t);
  toast.t=setTimeout(function(){el.style.display='none'},3000);
}
async function api(m,u,b){
  var h={};
  if(b!==undefined)h['Content-Type']='application/json';
  try{
    var r=await fetch(u,{method:m,headers:h,body:b===undefined?undefined:JSON.stringify(b),credentials:'same-origin'});
    var j={};
    try{j=await r.json()}catch(e){}
    return {ok:r.ok,status:r.status,data:j};
  }catch(e){return {ok:false,status:0,data:{error:'err.server'}}}
}
function when(ts){
  if(!ts)return '';
  var d=new Date(ts);
  return d.toLocaleString('rw-RW',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
}
var ME=null;
var TAB='summary';
var PERMS=[];
function can(p){return PERMS.indexOf(p)!==-1}

async function boot(){
  var sun=document.getElementById('sunTop');
  if(sun)sun.innerHTML='<svg class="sun" viewBox="0 0 24 24" fill="none"><g stroke="#d4a838" stroke-width="1.6" stroke-linecap="round"><line x1="12" y1="6" x2="12" y2="2"/><line x1="15.2" y1="6.9" x2="17.4" y2="3.6"/><line x1="17.5" y1="9.5" x2="21.1" y2="7.8"/><line x1="17.9" y1="12.9" x2="21.9" y2="13.4"/><line x1="16.5" y1="15.9" x2="19.6" y2="18.5"/><line x1="13.7" y1="17.8" x2="14.8" y2="21.6"/><line x1="10.3" y1="17.8" x2="9.2" y2="21.6"/><line x1="7.5" y1="15.9" x2="4.4" y2="18.5"/><line x1="6.1" y1="12.9" x2="2.1" y2="13.4"/><line x1="6.5" y1="9.5" x2="2.9" y2="7.8"/><line x1="8.8" y1="6.9" x2="6.6" y2="3.6"/></g><circle cx="12" cy="12" r="4.6" fill="#d4a838"/></svg>';
  var r=await api('GET','/api/me');
  if(r.ok&&r.data&&r.data.user&&r.data.user.staff){
    ME=r.data.user;
    PERMS=ME.perms||[];
    var who=document.getElementById('whoAmI');
    if(who)who.textContent=ME.name||(r.data.profile&&r.data.profile.name)||ME.email||'Admin';
    render();
  }else{
    renderLogin();
  }
  var lo=document.getElementById('btnLogout');
  if(lo)lo.addEventListener('click',doLogout);
}

function renderLogin(){
  var app=document.getElementById('app');
  app.innerHTML='<div class="login">'+
    '<svg class="sun" viewBox="0 0 24 24" fill="none"><g stroke="#d4a838" stroke-width="1.6" stroke-linecap="round"><line x1="12" y1="6" x2="12" y2="2"/><line x1="15.2" y1="6.9" x2="17.4" y2="3.6"/><line x1="17.5" y1="9.5" x2="21.1" y2="7.8"/><line x1="17.9" y1="12.9" x2="21.9" y2="13.4"/><line x1="16.5" y1="15.9" x2="19.6" y2="18.5"/><line x1="13.7" y1="17.8" x2="14.8" y2="21.6"/><line x1="10.3" y1="17.8" x2="9.2" y2="21.6"/><line x1="7.5" y1="15.9" x2="4.4" y2="18.5"/><line x1="6.1" y1="12.9" x2="2.1" y2="13.4"/><line x1="6.5" y1="9.5" x2="2.9" y2="7.8"/><line x1="8.8" y1="6.9" x2="6.6" y2="3.6"/></g><circle cx="12" cy="12" r="4.6" fill="#d4a838"/></svg>'+
    '<h1>AHABONA — Ubuyobozi</h1>'+
    '<p class="sub">Injira kugira ngo ukomeze</p>'+
    '<div class="f"><label>Email cyangwa telefoni</label><input id="lg-id" autocomplete="username"><label>Ijambobanga</label><input id="lg-pw" type="password" autocomplete="current-password"><div class="er" id="lg-err"></div></div>'+
    '<div class="act"><button class="btn" id="lg-go" style="width:100%">Injira</button></div>'+
    '</div>';
  var go=document.getElementById('lg-go');
  if(go)go.addEventListener('click',doLogin);
  var pw=document.getElementById('lg-pw');
  if(pw)pw.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doLogin()}});
}
async function doLogin(){
  var id=document.getElementById('lg-id');
  var pw=document.getElementById('lg-pw');
  var er=document.getElementById('lg-err');
  if(er)er.textContent='';
  var r=await api('POST','/api/login',{id:id.value.trim(),password:pw.value});
  if(!r.ok){if(er)er.textContent='Email, telefoni cyangwa ijambobanga si byo.';return}
  if(!r.data.staff){
    if(er)er.textContent='Iyi konti si iy’umuyobozi.';
    await api('POST','/api/logout',{});
    return;
  }
  location.reload();
}
async function doLogout(){
  await api('POST','/api/logout',{});
  location.reload();
}

var TABS=[
  {id:'summary',label:'Incamake',perm:'dash.view'},
  {id:'users',label:'Abakoresha',perm:'users.view'},
  {id:'profiles',label:'Imyirondoro',perm:'users.view'},
  {id:'reports',label:'Ibibazo',perm:'reports.handle'},
  {id:'requests',label:'Ibisabwa',perm:'requests.handle'},
  {id:'caps',label:'Imirimo',perm:'catalog.edit'},
  {id:'cats',label:'Ibyiciro',perm:'catalog.edit'},
  {id:'strip',label:'Ikibaho',perm:'content.edit'},
  {id:'faq',label:'FAQ',perm:'content.edit'},
  {id:'contact',label:'Ubutumwa',perm:'content.edit'},
  {id:'staff',label:'Abayobozi',perm:'staff.manage'},
  {id:'features',label:'Ibikorwa',perm:'settings.edit'},
  {id:'settings',label:'Igenamiterere',perm:'settings.edit'},
  {id:'logs',label:'Amateka',perm:'audit.view'}
];
function visibleTabs(){return TABS.filter(function(x){return can(x.perm)})}
function render(){
  var app=document.getElementById('app');
  var vt=visibleTabs();
  if(!vt.length){app.innerHTML='<div class="note">Nta burenganzira bwo kureba ikintu na kimwe. Saba Super Admin.</div>';return}
  if(!vt.some(function(x){return x.id===TAB}))TAB=vt[0].id;
  app.innerHTML='<div class="layout">'+
    '<div class="side">'+vt.map(function(x){
      return '<button data-tab="'+x.id+'"'+(x.id===TAB?' class="on"':'')+'>'+esc(x.label)+'</button>';
    }).join('')+'</div>'+
    '<div class="content" id="content"></div>'+
    '</div>';
  $$('.side button').forEach(function(b){
    b.addEventListener('click',function(){TAB=b.getAttribute('data-tab');render()});
  });
  loadTab();
}

async function loadTab(){
  var c=document.getElementById('content');
  if(!c)return;
  c.innerHTML='<div class="note">Birimo…</div>';
  try{
    if(TAB==='summary')return await renderSummary(c);
    if(TAB==='users')return await renderUsers(c);
    if(TAB==='profiles')return await renderProfiles(c);
    if(TAB==='reports')return await renderReports(c);
    if(TAB==='requests')return await renderRequests(c);
    if(TAB==='caps')return await renderCaps(c);
    if(TAB==='cats')return await renderCats(c);
    if(TAB==='strip')return await renderStrip(c);
    if(TAB==='faq')return await renderFaq(c);
    if(TAB==='contact')return await renderContactMsgs(c);
    if(TAB==='features')return await renderFeatures(c);
    if(TAB==='settings')return await renderSettings(c);
    if(TAB==='logs')return await renderLogs(c);
    if(TAB==='staff')return await renderStaff(c);
  }catch(e){
    c.innerHTML='<div class="note">Habaye ikibazo: '+esc(e.message||'')+'</div>';
  }
}
/* ===== END OF IGICE 15a/16 ===== */


async function renderSummary(c){
  var r=await api('GET','/api/admin/summary');
  if(!r.ok){c.innerHTML='<div class="note">'+esc(r.data.error||'err')+'</div>';return}
  var s=r.data||{};
  var cards=[
    {n:s.users||0,l:'Abakoresha'},
    {n:s.profiles_public||0,l:'Imyirondoro'},
    {n:s.reports_new||0,l:'Ibibazo bishya',g:s.reports_new>0},
    {n:s.cap_requests_pending||0,l:'Ibisabwa bishya',g:s.cap_requests_pending>0},
    {n:s.impressions||0,l:'Impressions'},
    {n:s.opens||0,l:'Profile opens'},
    {n:s.contacts||0,l:'Contacts',g:true},
    {n:s.searches_7d||0,l:'Searches (7d)'},
    {n:s.new_users_7d||0,l:'Abashya (7d)'},
    {n:s.suspended||0,l:'Suspended'},
    {n:s.deletion_pending||0,l:'Pending delete',g:true}
  ];
  c.innerHTML='<h1>Incamake</h1><p class="sub">Uko urubuga rukorera ubu</p>'+
    '<div class="cards">'+cards.map(function(x){
      return '<div class="stat'+(x.g?' gold':'')+'"><div class="num">'+x.n+'</div><div class="lbl">'+esc(x.l)+'</div></div>';
    }).join('')+'</div>'+
    '<div class="panel"><h3>Stats zuzuye</h3>'+
    Object.keys(s).map(function(k){
      return '<div class="flag"><span class="nm">'+esc(k.replace(/_/g,' '))+'</span><span>'+s[k]+'</span></div>';
    }).join('')+
    '</div>';
  var stats=await api('GET','/api/admin/stats');
  if(stats.ok&&stats.data){
    var top=(stats.data.top_searches||[]);
    if(top.length){
      c.innerHTML+='<div class="panel"><h3>Top searches (7d)</h3><table><tr><th>Ijambo</th><th>Inshuro</th></tr>'+
        top.map(function(x){return '<tr><td>'+esc(x.q)+'</td><td>'+x.n+'</td></tr>'}).join('')+
        '</table></div>';
    }
  }
  addBroadcast(c);
}

function addBroadcast(c){
  if(!can('broadcast.send'))return;
  var d=document.createElement('div');
  d.className='panel';
  d.innerHTML='<h3>Ohereza ubutumwa kuri bose</h3><div class="f"><label>Umutwe</label><input id="bc-s" maxlength="120"><label>Ubutumwa</label><textarea id="bc-b" rows="4" maxlength="2000"></textarea></div><div class="act"><button class="btn" id="bc-go">Ohereza</button></div>';
  c.appendChild(d);
  document.getElementById('bc-go').addEventListener('click',async function(){
    var b=document.getElementById('bc-b').value.trim();
    if(!b)return toast('Andika ubutumwa');
    if(!confirm('Ubutumwa buzoherezwa ku bakoresha BOSE. Urabyemeza?'))return;
    var r=await api('POST','/api/admin/broadcast',{subject:document.getElementById('bc-s').value.trim(),body:b});
    if(r.ok){toast('Bwoherejwe ku bantu '+r.data.count);document.getElementById('bc-b').value=''}else toast((r.data&&r.data.error)||'Byanze');
  });
}

async function renderUsers(c){
  var r=await api('GET','/api/admin/users');
  if(!r.ok){c.innerHTML='<div class="note">'+esc(r.data.error||'err')+'</div>';return}
  var users=(r.data&&r.data.users)||[];
  c.innerHTML='<h1>Abakoresha</h1><p class="sub">'+users.length+' bakoresha</p>'+
    '<div class="panel"><div class="row"><input id="usrSearch" placeholder="Shakisha: izina, email, telefoni" style="max-width:320px"><select id="usrFilter" style="max-width:160px"><option value="">Bose</option><option value="active">Active</option><option value="deleted">Deleted</option><option value="admin">Admin</option></select></div></div>'+
    '<div class="panel" id="usrTable">'+renderUsersTable(users)+'</div>';
  var inp=document.getElementById('usrSearch');
  var flt=document.getElementById('usrFilter');
  function upd(){
    var q=(inp.value||'').toLowerCase();
    var f=flt.value;
    var filt=users.filter(function(u){
      if(f==='active'&&u.status!=='active')return false;
      if(f==='deleted'&&u.status!=='deleted')return false;
      if(f==='admin'&&!(u.role==='admin'||u.role_level==='admin'||u.role_level==='super'))return false;
      if(q){
        var blob=((u.name||'')+' '+(u.email||'')+' '+(u.phone||'')).toLowerCase();
        if(blob.indexOf(q)===-1)return false;
      }
      return true;
    });
    var t=document.getElementById('usrTable');
    if(t)t.innerHTML=renderUsersTable(filt);
    bindUserActions();
  }
  if(inp)inp.addEventListener('input',upd);
  if(flt)flt.addEventListener('change',upd);
  bindUserActions();
}
function renderUsersTable(users){
  if(!users.length)return '<div class="note">Nta bakoresha.</div>';
  return '<table><tr><th>ID</th><th>Izina</th><th>Email</th><th>Telefoni</th><th>Akarere</th><th>Status</th><th>Role</th><th>Verified</th><th>Igikorwa</th></tr>'+
    users.map(function(u){
      var verif=[];
      if(u.email_verified)verif.push('E');
      if(u.phone_verified)verif.push('P');
      if(u.id_verified)verif.push('I');
      var roleLbl=(u.role_level||u.role||'user');
      var statusBadge=u.status==='active'?'<span class="badge">active</span>':(u.status==='deleted'?'<span class="badge red">deleted</span>':'<span class="badge gray">'+esc(u.status)+'</span>');
      return '<tr data-uid="'+u.id+'">'+
        '<td>'+u.id+'</td>'+
        '<td>'+esc(u.name||'-')+'</td>'+
        '<td>'+esc(u.email||'')+'</td>'+
        '<td>'+esc(u.phone||'')+'</td>'+
        '<td>'+esc(u.district||'')+'</td>'+
        '<td>'+statusBadge+'</td>'+
        '<td>'+esc(roleLbl)+'</td>'+
        '<td>'+esc(verif.join(' '))+'</td>'+
        '<td><button class="btn ol sm" data-act="edit" data-uid="'+u.id+'">'+(can('users.edit')?'Hindura':'Reba')+'</button> '+
        (can('users.message')?'<button class="btn ol sm" data-act="message" data-uid="'+u.id+'">Message</button> ':'')+
        (can('users.delete')?'<button class="btn ol sm" data-act="delete" data-uid="'+u.id+'">Siba</button>':'')+'</td>'+
        '</tr>';
    }).join('')+'</table>';
}
function bindUserActions(){
  $$('[data-act]').forEach(function(b){
    if(b._bound)return;
    b._bound=true;
    b.addEventListener('click',async function(){
      var act=b.getAttribute('data-act');
      var uid=b.getAttribute('data-uid');
      if(act==='edit')return openUserEdit(uid);
      if(act==='delete'){
        if(!confirm('Urabyemeza gusiba uyu mukoresha?'))return;
        var r=await api('DELETE','/api/admin/users/'+uid);
        if(r.ok){toast('Yasibwe');loadTab()}else toast(r.data.error||'Byanze');
      }
      if(act==='message'){
        var subj=prompt('Subject:');if(subj===null)return;
        var body=prompt('Ubutumwa:');if(!body)return;
        var r2=await api('POST','/api/admin/users/'+uid+'/message',{subject:subj,body:body});
        if(r2.ok)toast('Yoherejwe');else toast(r2.data.error||'Byanze');
      }
    });
  });
}
async function openUserEdit(uid){
  var r=await api('GET','/api/admin/users/'+uid);
  if(!r.ok)return toast(r.data.error||'err');
  var u=r.data.user||{};
  var p=r.data.profile||{};
  var ro=can('users.contact')?'':' readonly';
  var rs=can('users.edit')?'':' disabled';
  var rn=can('users.edit')?'':' readonly';
  var c=document.getElementById('content');
  c.innerHTML='<h1>Hindura umukoresha #'+uid+'</h1>'+
    '<div class="panel"><div class="f">'+
    '<label>Izina</label><input id="eu-name"'+rn+' value="'+esc(p.name||'')+'">'+
    '<label>Email</label><input id="eu-email"'+ro+' value="'+esc(u.email||'')+'">'+
    '<label>Telefoni</label><input id="eu-phone"'+ro+' value="'+esc(u.phone||'')+'">'+
    '<label>Akarere</label><input id="eu-district"'+rn+' value="'+esc(p.district||'')+'">'+
    '<label>Status</label><select id="eu-status"'+rs+'><option value="active"'+(u.status==='active'?' selected':'')+'>active</option><option value="suspended"'+(u.status==='suspended'?' selected':'')+'>suspended</option>'+(can('users.delete')||u.status==='deleted'?'<option value="deleted"'+(u.status==='deleted'?' selected':'')+'>deleted</option>':'')+'</select>'+
    '</div>'+
    '<div class="act">'+(can('users.edit')?'<button class="btn" id="eu-save">Bika</button>':'')+(can('users.edit')?'<button class="btn ol" id="eu-resetpw">Reset password</button>':'')+'<button class="btn ol" id="eu-back">Subira</button></div>'+
    '</div>';
  document.getElementById('eu-back').addEventListener('click',function(){TAB='users';render()});
  var rpb=document.getElementById('eu-resetpw');
  if(rpb)rpb.addEventListener('click',async function(){
    if(!confirm('Ohereza link yo gushyiraho ijambobanga?'))return;
    var r2=await api('POST','/api/admin/users/'+uid+'/reset-password',{});
    if(r2.ok){toast(r2.data.link||'Yoherejwe');}else toast((r2.data&&r2.data.error)||'Byanze');
  });
  var svb=document.getElementById('eu-save');
  if(svb)svb.addEventListener('click',async function(){
    var body={
      name:document.getElementById('eu-name').value.trim(),
      email:document.getElementById('eu-email').value.trim(),
      phone:document.getElementById('eu-phone').value.trim(),
      district:document.getElementById('eu-district').value.trim(),
      status:document.getElementById('eu-status').value
    };
    var r2=await api('PUT','/api/admin/users/'+uid,body);
    if(r2.ok){toast('Byabitswe');TAB='users';render()}else toast(r2.data.error||'Byanze');
  });
}

async function renderProfiles(c){
  var r=await api('GET','/api/admin/users');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var users=((r.data&&r.data.users)||[]).filter(function(x){return x.pid});
  c.innerHTML='<h1>Imyirondoro</h1><p class="sub">'+users.length+' imyirondoro</p>'+
    '<div class="panel"><table><tr><th>PID</th><th>Izina</th><th>Akarere</th><th>Rating</th><th>Suspended</th><th>Igikorwa</th></tr>'+
    users.map(function(u){
      var rate=(u.rating_count?((u.rating_sum/u.rating_count).toFixed(1)):'-');
      return '<tr>'+
        '<td>'+esc(u.pid)+'</td>'+
        '<td>'+esc(u.name||'')+'</td>'+
        '<td>'+esc(u.district||'')+'</td>'+
        '<td>'+rate+(u.rating_count?' ('+u.rating_count+')':'')+'</td>'+
        '<td>'+(u.suspended?'<span class="badge red">suspended</span>':'<span class="badge">active</span>')+'</td>'+
        '<td><button class="btn ol sm" data-ppid="'+esc(u.pid)+'" data-psus="'+(u.suspended?1:0)+'">'+(u.suspended?'Subiza':'Hagarika')+'</button> '+
        '<a class="btn ol sm" href="/u/'+esc(u.pid)+'" target="_blank" rel="noopener">Reba</a></td>'+
        '</tr>';
    }).join('')+'</table></div>';
  $$('[data-ppid]').forEach(function(b){
    b.addEventListener('click',async function(){
      var pid=b.getAttribute('data-ppid');
      var sus=b.getAttribute('data-psus')==='1';
      var r2=await api('POST','/api/admin/profiles/'+pid,{action:sus?'restore':'suspend'});
      if(r2.ok){toast('Byagenze neza');loadTab()}else toast(r2.data.error||'Byanze');
    });
  });
}

async function renderReports(c){
  var r=await api('GET','/api/admin/reports');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var rows=(r.data&&r.data.reports)||[];
  c.innerHTML='<h1>Ibibazo</h1><p class="sub">'+rows.length+' reports</p>'+
    '<div class="panel">'+(rows.length?'<table><tr><th>Igihe</th><th>PID</th><th>Izina</th><th>Impamvu</th><th>Status</th><th>Igikorwa</th></tr>'+
    rows.map(function(x){
      return '<tr>'+
        '<td>'+esc(when(x.created_at))+'</td>'+
        '<td>'+esc(x.pid)+'</td>'+
        '<td>'+esc(x.name||'')+'</td>'+
        '<td>'+esc(x.reason||'')+(x.detail?': '+esc(x.detail):'')+'</td>'+
        '<td><span class="badge'+(x.status==='new'?' gold':'')+'">'+esc(x.status)+'</span></td>'+
        '<td><select data-rid="'+x.id+'" style="max-width:140px"><option value="new"'+(x.status==='new'?' selected':'')+'>new</option><option value="reviewed"'+(x.status==='reviewed'?' selected':'')+'>reviewed</option><option value="actioned"'+(x.status==='actioned'?' selected':'')+'>actioned</option><option value="dismissed"'+(x.status==='dismissed'?' selected':'')+'>dismissed</option></select></td>'+
        '</tr>';
    }).join('')+'</table>':'<div class="note">Nta bibazo.</div>')+'</div>';
  $$('[data-rid]').forEach(function(sel){
    sel.addEventListener('change',async function(){
      var id=sel.getAttribute('data-rid');
      var r2=await api('POST','/api/admin/reports/'+id,{status:sel.value});
      if(r2.ok)toast('Byabitswe');else toast(r2.data.error||'Byanze');
    });
  });
}

async function renderRequests(c){
  var r=await api('GET','/api/admin/requests');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var reqs=(r.data&&r.data.requests)||[];
  var cats=(r.data&&r.data.categories)||[];
  c.innerHTML='<h1>Ibisabwa</h1><p class="sub">'+reqs.length+' bisabwa</p>'+
    '<div class="panel">'+(reqs.length?'<table><tr><th>Izina</th><th>Icyo yasabye</th><th>Icyiciro</th><th>Izina rishya</th><th>Igikorwa</th></tr>'+
    reqs.map(function(x){
      return '<tr>'+
        '<td>'+esc(x.name||'-')+'</td>'+
        '<td>'+esc(x.text)+'</td>'+
        '<td><select data-cid="'+x.id+'">'+cats.map(function(k){return '<option value="'+esc(k)+'">'+esc(k)+'</option>'}).join('')+'</select></td>'+
        '<td><input data-cname="'+x.id+'" value="'+esc(x.text)+'" style="min-width:140px"></td>'+
        '<td><button class="btn sm" data-act="approve" data-rid="'+x.id+'">Emeza</button> <button class="btn ol sm" data-act="reject" data-rid="'+x.id+'">Anga</button></td>'+
        '</tr>';
    }).join('')+'</table>':'<div class="note">Nta bisabwa.</div>')+'</div>';
  $$('[data-act="approve"]').forEach(function(b){
    b.addEventListener('click',async function(){
      var id=b.getAttribute('data-rid');
      var cat=document.querySelector('[data-cid="'+id+'"]').value;
      var name=document.querySelector('[data-cname="'+id+'"]').value;
      var r2=await api('POST','/api/admin/requests/'+id,{action:'approve',category:cat,name:name});
      if(r2.ok){toast('Byemejwe');loadTab()}else toast(r2.data.error||'Byanze');
    });
  });
  $$('[data-act="reject"]').forEach(function(b){
    b.addEventListener('click',async function(){
      var id=b.getAttribute('data-rid');
      var r2=await api('POST','/api/admin/requests/'+id,{action:'reject'});
      if(r2.ok){toast('Byanzwe');loadTab()}else toast(r2.data.error||'Byanze');
    });
  });
}

async function renderCaps(c){
  var r=await api('GET','/api/admin/caps');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var rows=(r.data&&r.data.capabilities)||[];
  // fetch categories for hint
  var cats=await api('GET','/api/admin/cats');
  var catList=(cats.ok&&cats.data&&cats.data.categories)||[];
  c.innerHTML='<h1>Imirimo</h1><p class="sub">'+rows.length+' imirimo</p>'+
    '<div class="panel"><h3>Ongeraho umurimo mushya</h3><div class="row"><input id="nc-name" placeholder="Izina (Kinyarwanda)" style="max-width:220px"><input id="nc-en" placeholder="Name (English)" style="max-width:220px"><input id="nc-cat" placeholder="Icyiciro" style="max-width:180px"><button class="btn" id="nc-add">Ongeraho</button></div><div class="note" id="nc-cats-hint">Icyiciro kigomba kuba kimwe muri ibi: '+catList.map(esc).join(', ')+'</div></div>'+
    '<div class="panel"><table><tr><th>ID</th><th>Izina</th><th>Icyiciro</th><th>Active</th><th>Igikorwa</th></tr>'+
    rows.map(function(x){
      return '<tr>'+
        '<td>'+x.id+'</td>'+
        '<td>'+esc(x.name)+'</td>'+
        '<td>'+esc(x.category)+'</td>'+
        '<td>'+(x.active?'<span class="badge">on</span>':'<span class="badge gray">off</span>')+'</td>'+
        '<td><button class="btn ol sm" data-toggle="'+x.id+'" data-active="'+x.active+'">'+(x.active?'Zimya':'Emeza')+'</button> <button class="btn ol sm" data-del="'+x.id+'">Siba</button></td>'+
        '</tr>';
    }).join('')+'</table></div>';
  document.getElementById('nc-add').addEventListener('click',async function(){
    var name=document.getElementById('nc-name').value.trim();
    var en=document.getElementById('nc-en').value.trim();
    var cat=document.getElementById('nc-cat').value.trim();
    if(!name||!cat)return toast('Uzuza byose');
    var r2=await api('POST','/api/admin/caps',{name:name,name_en:en,category:cat});
    if(r2.ok){toast('Byongewe');loadTab()}else toast(r2.data.error||'Byanze');
  });
  $$('[data-toggle]').forEach(function(b){
    b.addEventListener('click',async function(){
      var id=b.getAttribute('data-toggle');
      var active=b.getAttribute('data-active')==='1';
      var r2=await api('PUT','/api/admin/caps/'+id,{active:active?0:1});
      if(r2.ok)loadTab();else toast(r2.data.error||'Byanze');
    });
  });
  $$('[data-del]').forEach(function(b){
    b.addEventListener('click',async function(){
      if(!confirm('Siba umurimo?'))return;
      var id=b.getAttribute('data-del');
      var r2=await api('DELETE','/api/admin/caps/'+id);
      if(r2.ok)loadTab();else toast(r2.data.error||'Byanze');
    });
  });
}

async function renderCats(c){
  var r=await api('GET','/api/admin/cats');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var cats=(r.data&&r.data.categories)||[];
  TAX_GLOBAL={};cats.forEach(function(x){TAX_GLOBAL[x]=1});
  c.innerHTML='<h1>Ibyiciro</h1><p class="sub">'+cats.length+' byiciro</p>'+
    '<div class="panel"><h3>Ongeraho icyiciro</h3><div class="row"><input id="nc2-name" placeholder="Izina ry’icyiciro" style="max-width:240px"><button class="btn" id="nc2-add">Ongeraho</button></div></div>'+
    '<div class="panel"><table><tr><th>#</th><th>Izina</th></tr>'+cats.map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+esc(x)+'</td></tr>'}).join('')+'</table></div>';
  document.getElementById('nc2-add').addEventListener('click',async function(){
    var name=document.getElementById('nc2-name').value.trim();
    if(!name)return toast('Andika izina');
    var r2=await api('POST','/api/admin/cats',{name:name});
    if(r2.ok){toast('Byongewe');loadTab()}else toast(r2.data.error||'Byanze');
  });
}

var HERO_THEMES=[
  ['ijoro','Ijoro ry’Izuba','linear-gradient(160deg,#0c1424,#10213a 58%,#0e3a33)'],
  ['izuba','Izuba rirasa','linear-gradient(135deg,#0f5c45,#1a9b6c 58%,#d4a838)'],
  ['kigali','Kigali','linear-gradient(135deg,#0b3a53,#1d7a8c 60%,#5fd0c0)'],
  ['musanze','Musanze','linear-gradient(135deg,#1f2a44,#3d4f7a 55%,#8fb8a0)'],
  ['rubavu','Rubavu','linear-gradient(135deg,#052a5e,#0b63c9 60%,#4fc3f7)'],
  ['huye','Huye','linear-gradient(135deg,#4a2c12,#9a5b1f 60%,#e0b04b)'],
  ['nyungwe','Nyungwe','linear-gradient(135deg,#06301f,#126b3f 60%,#7ccf6a)'],
  ['ibendera','Amabara y’ibendera','linear-gradient(135deg,#0a4aa6,#1a9b6c 60%,#e6b800)']
];
var HERO_KINDS=[['info','Urugo rw’Izuba'],['tip','Inama'],['announcement','Itangazo'],['city','Umujyi'],['promo','Iyamamaza'],['sponsor','Iyamamaza ry’umuterankunga']];
var HERO_ACTIONS=[['none','Nta buto'],['register','Iyandikishe'],['focus','Shaka (kujya kuri search)'],['search','Shakisha ijambo runaka'],['help','Ubufasha'],['about','Ibyerekeye'],['link','Link (https://)'],['phone','Hamagara']];
function heroBg(th){var x=HERO_THEMES.filter(function(t){return t[0]===th})[0];return x?x[2]:HERO_THEMES[1][2]}
function dayStr(ts){return ts?new Date(ts).toISOString().slice(0,10):''}
function opts(list,sel){return list.map(function(x){return '<option value="'+esc(x[0])+'"'+(x[0]===sel?' selected':'')+'>'+esc(x[1])+'</option>'}).join('')}

function mb(n){return (n/1048576).toFixed(1)+' MB'}
function vErrText(code){
  if(code===1)return 'Kureba kwahagaritswe.';
  if(code===2)return 'Ikibazo cya network, cyangwa fayile ntiri kuri server.';
  if(code===3)return 'Video yangiritse cyangwa telefoni ntishobora kuyisoma.';
  if(code===4)return 'Ubwoko bwa video (codec) ntibwemewe kuri iyi telefoni, cyangwa fayile ntiri kuri server.';
  return 'Ikibazo kitazwi.';
}

function prepareImage(file){
  return new Promise(function(resolve){
    var MAXD=1600,MAXB=8*1024*1024;
    var done=false;
    function finish(v){if(!done){done=true;resolve(v)}}
    function fallback(){
      var ty=String(file.type||'').toLowerCase();
      if((ty==='image/jpeg'||ty==='image/png'||ty==='image/webp')&&file.size<=MAXB)finish(file);
      else finish(null);
    }
    var url=null;
    try{url=URL.createObjectURL(file)}catch(e){return fallback()}
    var img=new Image();
    img.onload=function(){
      try{
        var w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
        if(!w||!h){try{URL.revokeObjectURL(url)}catch(e){}return fallback()}
        var sc=Math.min(1,MAXD/Math.max(w,h));
        var cw=Math.max(1,Math.round(w*sc)),ch=Math.max(1,Math.round(h*sc));
        var cv=document.createElement('canvas');
        cv.width=cw;cv.height=ch;
        var cx=cv.getContext('2d');
        cx.fillStyle='#ffffff';
        cx.fillRect(0,0,cw,ch);
        cx.drawImage(img,0,0,cw,ch);
        try{URL.revokeObjectURL(url)}catch(e){}
        if(cv.toBlob){
          cv.toBlob(function(b){
            if(b&&b.size>100&&b.size<=MAXB)finish(b);else fallback();
          },'image/jpeg',0.85);
        }else fallback();
      }catch(e){
        try{URL.revokeObjectURL(url)}catch(e2){}
        fallback();
      }
    };
    img.onerror=function(){try{URL.revokeObjectURL(url)}catch(e){}fallback()};
    img.src=url;
  });
}

function openHeroForm(c,ad){
  var isNew=!ad;
  var a=ad||{theme:'ijoro',kind:'info',action_type:'register',priority:0,active:1};
  var theme=a.theme||'izuba';
  c.innerHTML='<h1>'+(isNew?'Ongeraho ku kibaho':'Hindura ikibaho #'+a.id)+'</h1><div class="panel"><div class="f">'+
    '<div id="hf-prev" style="border-radius:16px;padding:16px;color:#fff;min-height:110px;margin-bottom:6px"></div>'+
    '<label>Ubwoko bwikibaho</label><select id="hf-media"><option value="text"'+((a.media_type==='video'||a.media_type==='image')?'':' selected')+'>Inyandiko</option><option value="image"'+(a.media_type==='image'?' selected':'')+'>Ifoto</option><option value="video"'+(a.media_type==='video'?' selected':'')+'>Video (max ~30s)</option></select>'+
    '<div id="hf-img-box" style="display:'+(a.media_type==='image'?'block':'none')+'">'+
    '<label>Ifoto (fayile)</label><input type="file" id="hf-img-file" accept="image/*">'+
    (a.image_url?'<div class="note">Ifoto iriho ubu irerekanwa hasi. Hitamo indi niba ushaka kuyisimbuza.</div><img src="'+esc(a.image_url)+'" alt="" style="max-width:100%;max-height:200px;border-radius:12px;margin-top:6px">':'')+
    '<div class="note">Ifoto ihindurwa ku telefoni yawe mbere yo koherezwa (ntirenze 1600px). Ushobora kongeraho amafoto menshi uko ushaka: buri foto ni ikibaho cyayo.</div></div>'+
    '<div id="hf-vid-box" style="display:'+(a.media_type==='video'?'block':'none')+'">'+
    '<label>Video (fayile)</label><input type="file" id="hf-vid-file" accept="video/*">'+
    '<label>cyangwa URL ya video</label><input id="hf-vid-url" maxlength="500" placeholder="https://..." value="'+esc(a.video_url||'')+'">'+
    '<div class="note">Video ntirenze 64MB. Niba ndende, dufata amasegonda 30 ya mbere (iyo ffmpeg ihari). Hasi urabona niba ikina.</div>'+
    '<video id="hf-vtest" controls muted playsinline preload="metadata" style="width:100%;max-height:240px;background:#000;border-radius:12px;margin-top:6px;display:none"></video>'+
    '<div id="hf-vdiag" class="note"></div></div>'+
    '<label>Ibara</label><div id="hf-themes" class="row">'+HERO_THEMES.map(function(t){
      return '<button type="button" data-th="'+t[0]+'" title="'+esc(t[1])+'" style="width:44px;height:30px;border-radius:8px;border:3px solid '+(t[0]===theme?'#12261c':'transparent')+';background:'+t[2]+';cursor:pointer"></button>';
    }).join('')+'</div>'+
    '<label>Ubwoko (akamenyetso gato hejuru)</label><select id="hf-kind">'+opts(HERO_KINDS,a.kind||'tip')+'</select>'+
    '<label>Umutwe (Kinyarwanda)</label><input id="hf-title" maxlength="80" value="'+esc(a.title||'')+'">'+
    '<label>Umutwe (English)</label><input id="hf-title-en" maxlength="80" value="'+esc(a.title_en||'')+'">'+
    '<label>Amagambo (Kinyarwanda)</label><textarea id="hf-text" rows="3" maxlength="220">'+esc(a.text||'')+'</textarea>'+
    '<label>Amagambo (English)</label><textarea id="hf-text-en" rows="3" maxlength="220">'+esc(a.text_en||'')+'</textarea>'+
    '<label>Igikorwa cya buto</label><select id="hf-action">'+opts(HERO_ACTIONS,a.action_type||'none')+'</select>'+
    '<label>Izina rya buto (Kinyarwanda)</label><input id="hf-cta" maxlength="28" value="'+esc(a.cta||'')+'">'+
    '<label>Izina rya buto (English)</label><input id="hf-cta-en" maxlength="28" value="'+esc(a.cta_en||'')+'">'+
    '<label>Agaciro (ijambo ryo gushakisha, link cyangwa telefoni)</label><input id="hf-value" maxlength="500" value="'+esc(a.action_value||'')+'">'+
    '<label>Itangira (itariki, bishobora kuba ubusa)</label><input id="hf-start" type="date" value="'+dayStr(a.start_at)+'">'+
    '<label>Irangira (itariki, bishobora kuba ubusa)</label><input id="hf-end" type="date" value="'+dayStr(a.end_at)+'">'+
    '<label>Itondekanya (umubare munini ujya imbere)</label><input id="hf-pr" type="number" value="'+(a.priority||0)+'">'+
    '</div><div class="act"><button class="btn" id="hf-save">Bika</button><button class="btn ol" id="hf-back">Subira</button></div>'+
    '<div class="note">Ibyamamaza (Iyamamaza) bihora byanditseho “Iyamamaza” kugira ngo abantu batayobywa.</div></div>';
  var previewImg=(a.media_type==='image'&&a.image_url)?a.image_url:'';
  var previewObj='';
  function cur(){return theme}
  function prev(){
    var t=val('hf-title')||val('hf-text')||'Umutwe',x=val('hf-title')?val('hf-text'):'';
    var el=document.getElementById('hf-prev');
    el.style.background=heroBg(cur());
    if(val('hf-media')==='image'&&previewImg)el.style.background='linear-gradient(105deg,rgba(0,0,0,.55),rgba(0,0,0,.15)),url('+JSON.stringify(previewImg)+') center/cover';
    el.innerHTML='<div style="font-size:12px;opacity:.9">'+esc(HERO_KINDS.filter(function(k){return k[0]===val('hf-kind')})[0][1])+'</div><div style="font-size:22px;font-weight:800;margin:4px 0">'+esc(t)+'</div><div style="opacity:.92">'+esc(x)+'</div>';
  }
  prev();
  ['hf-title','hf-text','hf-kind'].forEach(function(id){document.getElementById(id).addEventListener('input',prev);document.getElementById(id).addEventListener('change',prev)});
  $$('#hf-themes button').forEach(function(b){
    b.addEventListener('click',function(){
      theme=b.getAttribute('data-th');
      $$('#hf-themes button').forEach(function(x){x.style.borderColor=(x===b)?'#12261c':'transparent'});
      prev();
    });
  });
  document.getElementById('hf-back').addEventListener('click',function(){renderStrip(c)});
  var hfMedia=document.getElementById('hf-media');
  if(hfMedia)hfMedia.addEventListener('change',function(){
    var box=document.getElementById('hf-vid-box');
    if(box)box.style.display=hfMedia.value==='video'?'block':'none';
    var ibox=document.getElementById('hf-img-box');
    if(ibox)ibox.style.display=hfMedia.value==='image'?'block':'none';
    prev();
  });
  var vt=document.getElementById('hf-vtest'),vd=document.getElementById('hf-vdiag');
  var vObj='';
  function vShow(src,label,extra){
    if(!vt||!vd)return;
    vt.style.display='block';
    vd.textContent=label+': tegereza…';
    vt.onerror=function(){vd.textContent=label+': NTIKINA. '+vErrText(vt.error&&vt.error.code)+(extra?' '+extra:'')};
    vt.onloadedmetadata=function(){
      if(!vt.videoWidth){vd.textContent=label+': NTIKINA. Nta shusho ya video isomwa (codec ntiyemewe).'+(extra?' '+extra:'');return}
      vd.textContent=label+': irakina ('+vt.videoWidth+'x'+vt.videoHeight+', '+Math.round(vt.duration||0)+'s).'+(extra?' '+extra:'');
    };
    vt.src=src;
    try{vt.load()}catch(e){}
  }
  if(a.media_type==='video'&&a.video_url&&String(a.video_url).indexOf('youtu')===-1){
    var info=[];
    if(a.video_bytes>0)info.push('Ingano: '+mb(a.video_bytes)+'.');
    if(a.video_bytes===-1)info.push('FAYILE NTIBONEKA KURI SERVER (disk ihoraho ntiriho, cyangwa upload yanze).');
    if(a.video_codec)info.push('Codec: '+a.video_codec+'.');
    if(a.video_proc===1)info.push('Yahinduwe na ffmpeg (H.264).');
    if(a.video_proc===0)info.push('ffmpeg ntiyayihinduye.');
    if(a.video_proc===0&&a.video_codec==='hevc')info.push('HEVC ntikina kuri Chrome nyinshi: koresha H.264 mp4 cyangwa ushyireho ffmpeg.');
    vShow(a.video_url,'Video iri kuri server',info.join(' '));
  }
  var hfVidFile=document.getElementById('hf-vid-file');
  if(hfVidFile)hfVidFile.addEventListener('change',function(){
    try{if(vObj){URL.revokeObjectURL(vObj);vObj=''}}catch(e){}
    var f1=hfVidFile.files&&hfVidFile.files[0];
    if(!f1)return;
    try{vObj=URL.createObjectURL(f1)}catch(e){return}
    vShow(vObj,'Fayile wahisemo ('+mb(f1.size)+')',f1.size>64*1024*1024?'IRARENZE 64MB: ntizakirwa.':'');
  });
  var hfImgFile=document.getElementById('hf-img-file');
  if(hfImgFile)hfImgFile.addEventListener('change',function(){
    try{if(previewObj){URL.revokeObjectURL(previewObj);previewObj=''}}catch(e){}
    var f0=hfImgFile.files&&hfImgFile.files[0];
    if(f0){
      try{previewObj=URL.createObjectURL(f0);previewImg=previewObj}catch(e){}
    }
    prev();
  });
  document.getElementById('hf-save').addEventListener('click',async function(){
    var mediaType=val('hf-media')||'text';
    var body={
      title:val('hf-title'),title_en:val('hf-title-en'),text:val('hf-text'),text_en:val('hf-text-en'),
      cta:val('hf-cta'),cta_en:val('hf-cta-en'),theme:theme,kind:val('hf-kind'),
      action:val('hf-action'),value:val('hf-value'),priority:Number(val('hf-pr')||0),
      start_at:val('hf-start')?new Date(val('hf-start')+'T00:00:00').getTime():null,
      end_at:val('hf-end')?new Date(val('hf-end')+'T23:59:59').getTime():null,
      media_type:mediaType,video_url:val('hf-vid-url')||''
    };
    if(mediaType==='text'&&!body.title&&!body.text)return toast('Andika umutwe cyangwa amagambo');
    var fileInput=document.getElementById('hf-vid-file');
    var file=(mediaType==='video'&&fileInput&&fileInput.files&&fileInput.files[0])?fileInput.files[0]:null;
    if(file&&file.size>64*1024*1024)return toast('Video nini cyane (max ~64MB)');
    if(mediaType==='video'&&!file&&!body.video_url&&!(a&&a.video_url))return toast('Hitamo video cyangwa andika URL');
    var imgInput=document.getElementById('hf-img-file');
    var imgFile=(mediaType==='image'&&imgInput&&imgInput.files&&imgInput.files[0])?imgInput.files[0]:null;
    if(mediaType==='image'&&!imgFile&&!(a&&a.image_url))return toast('Hitamo ifoto');
    var imgBlob=null;
    if(imgFile){
      toast('Ifoto iri gutunganywa…');
      imgBlob=await prepareImage(imgFile);
      if(!imgBlob)return toast('Iyi foto ntishobora gusomwa. Gerageza indi (JPG, PNG cyangwa WebP).');
    }
    if(mediaType==='video'&&file){
      body.media_type='video';
      if(!body.title&&!body.text)body.title='Video';
    }
    toast('Tegereza…');
    var r2=isNew?await api('POST','/api/admin/strip',body):await api('PUT','/api/admin/strip/'+a.id,body);
    if(!r2.ok){toast((r2.data&&r2.data.error)||'Byanze');return}
    var sid=isNew?(r2.data&&r2.data.id):a.id;
    if(imgBlob&&sid){
      try{
        var upi=await fetch('/api/admin/strip/'+sid+'/image',{
          method:'POST',
          credentials:'same-origin',
          headers:{'Content-Type':imgBlob.type||'image/jpeg'},
          body:imgBlob
        });
        var ij=await upi.json().catch(function(){return{}});
        if(!upi.ok||!ij.image_url){
          toast((ij&&ij.error)||'Ifoto ntiyabitswe neza');
          renderStrip(c);return;
        }
        toast('Ifoto yabitswe');
      }catch(e){
        toast('Kohereza ifoto byanze');
        renderStrip(c);
        return;
      }
    }else if(file&&sid){
      try{
        var up=await fetch('/api/admin/strip/'+sid+'/video',{
          method:'POST',
          credentials:'same-origin',
          headers:{'Content-Type':file.type||'video/mp4'},
          body:file
        });
        var uj=await up.json().catch(function(){return{}});
        if(!up.ok||!uj.video_url){
          toast((uj&&uj.error)||'Video ntiyabitswe neza — gerageza fayile ya mp4');
          renderStrip(c);return;
        }
        if(uj.processed===false){
          toast('Video yabitswe. Niba itakina, koresha mp4 (H.264) — ffmpeg ntibonetse');
        }else{
          toast('Video yabitswe');
        }
      }catch(e){
        toast('Kohereza video byanze');
        renderStrip(c);
        return;
      }
    }else{
      toast('Byabitswe');
    }
    renderStrip(c);
  });
}

async function renderStrip(c){
  var r=await api('GET','/api/admin/strip');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var ads=(r.data&&r.data.ads)||[];
  var kindName={};
  HERO_KINDS.forEach(function(k){kindName[k[0]]=k[1]});
  c.innerHTML='<h1>Ikibaho cy’Izuba</h1><p class="sub">Ibibaho bizunguruka hejuru y’urubuga. Ongeraho inyandiko, ifoto cyangwa video (max ~30s), ibibaho byinshi uko ushaka. Ibiri ON bihinduranya. Ibifite itangira n’irangira bigaragara gusa muri icyo gihe.</p>'+
    '<div class="panel"><div class="act"><button class="btn" id="hr-add">Ongeraho</button></div></div>'+
    '<div class="panel"><table><tr><th>Ibara</th><th>Umutwe</th><th>Ubwoko</th><th>Buto</th><th>Status</th><th>Igihe</th><th>#</th><th>Igikorwa</th></tr>'+
    ads.map(function(x){
      var live=x.active?'<span class="badge">on</span>':'<span class="badge gray">off</span>';
      var when=(x.start_at||x.end_at)?(dayStr(x.start_at)||'…')+' → '+(dayStr(x.end_at)||'…'):'buri gihe';
      return '<tr>'+
        '<td><span style="display:inline-block;width:34px;height:22px;border-radius:6px;background:'+heroBg(x.theme||'izuba')+'"></span></td>'+
        '<td>'+esc(x.title||x.text||(x.media_type==='image'?'(ifoto)':(x.media_type==='video'?'(video)':'')))+'<div class="note">'+esc(x.title?x.text:'')+'</div></td>'+
        '<td>'+esc(kindName[x.kind]||x.kind||'')+(x.media_type==='video'?(x.video_url?(x.video_bytes===-1?' <span class="badge gray">video: FAYILE NTIBONEKA</span>':' <span class="badge">video OK'+(x.video_bytes>0?' '+mb(x.video_bytes):'')+(x.video_codec?' '+esc(x.video_codec):'')+'</span>'):' <span class="badge gray">video nta URL</span>'):'')+(x.media_type==='image'?(x.image_url?(x.image_bytes===-1?' <span class="badge gray">ifoto: FAYILE NTIBONEKA</span>':' <span class="badge">ifoto OK'+(x.image_bytes>0?' '+mb(x.image_bytes):'')+'</span>'):' <span class="badge gray">ifoto nta URL</span>'):'')+'</td>'+
        '<td>'+esc(x.action_type==='none'?'—':x.action_type)+'</td>'+
        '<td>'+live+'</td>'+
        '<td>'+esc(when)+'</td>'+
        '<td>'+(x.priority||0)+'</td>'+
        '<td><button class="btn ol sm" data-hed="'+x.id+'">Hindura</button> <button class="btn ol sm" data-stog="'+x.id+'" data-active="'+x.active+'">'+(x.active?'Zimya':'Emeza')+'</button> <button class="btn ol sm" data-sdel="'+x.id+'">Siba</button></td>'+
        '</tr>';
    }).join('')+'</table></div>';
  document.getElementById('hr-add').addEventListener('click',function(){openHeroForm(c,null)});
  $$('[data-hed]').forEach(function(b){
    b.addEventListener('click',function(){
      var id=b.getAttribute('data-hed'),ad=null;
      ads.forEach(function(x){if(String(x.id)===String(id))ad=x});
      if(ad)openHeroForm(c,ad);
    });
  });
  $$('[data-stog]').forEach(function(b){
    b.addEventListener('click',async function(){
      var id=b.getAttribute('data-stog');
      var on=b.getAttribute('data-active')==='1';
      var r2=await api('PUT','/api/admin/strip/'+id,{active:on?0:1});
      if(r2.ok)renderStrip(c);else toast((r2.data&&r2.data.error)||'Byanze');
    });
  });
  $$('[data-sdel]').forEach(function(b){
    b.addEventListener('click',async function(){
      if(!confirm('Gusiba iki kibaho?'))return;
      var r2=await api('DELETE','/api/admin/strip/'+b.getAttribute('data-sdel'));
      if(r2.ok)renderStrip(c);else toast((r2.data&&r2.data.error)||'Byanze');
    });
  });
}

async function renderFaq(c){
  var r=await api('GET','/api/admin/faq');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var items=(r.data&&r.data.faq)||[];
  c.innerHTML='<h1>FAQ</h1><p class="sub">'+items.length+' ibibazo</p>'+
    '<div class="panel"><h3>Ongeraho ikibazo</h3><div class="f">'+
    '<label>Ikibazo</label><input id="faq-q" placeholder="Ikibazo">'+
    '<label>Igisubizo</label><textarea id="faq-a"></textarea>'+
    '<label>Terms (amagambo yo gushakisha)</label><input id="faq-terms">'+
    '<label>Category</label><input id="faq-cat" value="general">'+
    '</div><div class="act"><button class="btn" id="faq-add">Ongeraho</button></div></div>'+
    '<div class="panel"><table><tr><th>#</th><th>Ikibazo</th><th>Category</th><th>Active</th><th>Igikorwa</th></tr>'+
    items.map(function(x){
      return '<tr><td>'+x.id+'</td><td>'+esc(x.q)+'</td><td>'+esc(x.category||'')+'</td>'+
        '<td>'+(x.active?'<span class="badge">on</span>':'<span class="badge gray">off</span>')+'</td>'+
        '<td><button class="btn ol sm" data-fedit="'+x.id+'">Hindura</button> <button class="btn ol sm" data-fdel="'+x.id+'">Siba</button></td></tr>';
    }).join('')+'</table></div>';
  var addBtn=document.getElementById('faq-add');
  if(addBtn)addBtn.addEventListener('click',async function(){
    var body={q:document.getElementById('faq-q').value.trim(),a:document.getElementById('faq-a').value.trim(),terms:document.getElementById('faq-terms').value.trim(),category:document.getElementById('faq-cat').value.trim()||'general'};
    if(!body.q||!body.a)return toast('Uzuza byose');
    var r2=await api('POST','/api/admin/faq',body);
    if(r2.ok){toast('Byongewe');loadTab()}else toast(r2.data.error||'Byanze');
  });
  $$('[data-fdel]').forEach(function(b){
    b.addEventListener('click',async function(){
      if(!confirm('Siba?'))return;
      var r2=await api('DELETE','/api/admin/faq/'+b.getAttribute('data-fdel'));
      if(r2.ok)loadTab();else toast(r2.data.error||'Byanze');
    });
  });
  $$('[data-fedit]').forEach(function(b){
    b.addEventListener('click',async function(){
      var id=b.getAttribute('data-fedit');
      var row=items.filter(function(x){return String(x.id)===String(id)})[0];
      if(!row)return;
      var nq=prompt('Ikibazo',row.q||'');
      if(nq===null)return;
      var na=prompt('Igisubizo',row.a||'');
      if(na===null)return;
      var r2=await api('PUT','/api/admin/faq/'+id,{q:nq,a:na,terms:row.terms||'',category:row.category||'general',active:row.active});
      if(r2.ok){toast('Byabitswe');loadTab()}else toast((r2.data&&r2.data.error)||'Byanze');
    });
  });
}

async function renderContactMsgs(c){
  var r=await api('GET','/api/admin/messages');
  if(!r.ok){c.innerHTML='<div class="note">'+esc((r.data&&r.data.error)||'err')+'</div>';return}
  var rows=(r.data&&r.data.messages)||[];
  c.innerHTML='<h1>Ubutumwa</h1><p class="sub">'+rows.length+' messages</p>'+
    '<div class="panel">'+(rows.length?'<table><tr><th>Igihe</th><th>Izina</th><th>Email</th><th>Ubutumwa</th><th>Status</th><th>Igikorwa</th></tr>'+
    rows.map(function(x){
      return '<tr>'+
        '<td>'+esc(when(x.created_at))+'</td>'+
        '<td>'+esc(x.name||'-')+'</td>'+
        '<td>'+esc(x.email||'-')+'</td>'+
        '<td>'+esc(x.body||'')+'</td>'+
        '<td><span class="badge'+(x.status==='new'?' gold':'')+'">'+esc(x.status)+'</span></td>'+
        '<td><select data-mid="'+x.id+'" style="max-width:140px">'+
          '<option value="new"'+(x.status==='new'?' selected':'')+'>new</option>'+
          '<option value="read"'+(x.status==='read'?' selected':'')+'>read</option>'+
          '<option value="done"'+(x.status==='done'?' selected':'')+'>done</option>'+
        '</select></td></tr>';
    }).join('')+'</table>':'<div class="note">Nta butumwa.</div>')+'</div>';
  $$('[data-mid]').forEach(function(sel){
    sel.addEventListener('change',async function(){
      var id=sel.getAttribute('data-mid');
      var r2=await api('PUT','/api/admin/messages/'+id,{status:sel.value});
      if(r2.ok)toast('Byabitswe');else toast((r2.data&&r2.data.error)||'Byanze');
    });
  });
}
async function renderFeatures(c){
  var r=await api('GET','/api/admin/settings');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var f=(r.data&&r.data.features)||{};
  var impl={messaging:'Ubutumwa hagati y’abakoresha',pwa:'Gushyira urubuga kuri telefoni (PWA)'};
  c.innerHTML='<h1>Ibikorwa</h1><p class="sub">Ibifite akamenyetso “Haracyaje” ntibirakora: kubizimya cyangwa kubifungura ntacyo bihindura.</p><div class="panel">'+Object.keys(f).map(function(k){
    var on=f[k]&&f[k].on;
    var ok=!!impl[k];
    return '<div class="flag"><span class="nm">'+esc(impl[k]||k)+(ok?'':' <span class="badge gray">Haracyaje</span>')+'</span><label class="sw"><input type="checkbox" data-feat="'+esc(k)+'"'+(on?' checked':'')+(ok?'':' disabled')+'><span class="sl"></span></label></div>';
  }).join('')+'</div>';
  $$('[data-feat]').forEach(function(inp){
    inp.addEventListener('change',async function(){
      var r2=await api('POST','/api/admin/features',{key:inp.getAttribute('data-feat'),on:inp.checked});
      if(r2.ok)toast('Byabitswe');else toast(r2.data.error||'Byanze');
    });
  });
}
async function renderSettings(c){
  var r=await api('GET','/api/admin/settings');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var s=r.data||{};
  var contact=s.contact||{};
  var site=s.site||{};
  c.innerHTML='<h1>Igenamiterere</h1>'+
    '<div class="panel"><h3>Site</h3><div class="f">'+
    '<label>Name</label><input id="st-name" value="'+esc(site.name||'')+'">'+
    '<label>Tagline</label><input id="st-tag" value="'+esc(site.tagline||'')+'">'+
    '<label>Owner</label><input id="st-owner" value="'+esc(site.owner||'')+'">'+
    '</div></div>'+
    '<div class="panel"><h3>Contact</h3><div class="f">'+
    '<label>Email</label><input id="st-email" value="'+esc(contact.email||'')+'">'+
    '<label>WhatsApp</label><input id="st-wa" value="'+esc(contact.whatsapp||'')+'">'+
    '<label>Phone</label><input id="st-phone" value="'+esc(contact.phone||'')+'">'+
    '</div><div class="act"><button class="btn" id="st-save">Bika</button></div></div>';
  document.getElementById('st-save').addEventListener('click',async function(){
    var body={
      site:{name:document.getElementById('st-name').value.trim(),tagline:document.getElementById('st-tag').value.trim(),owner:document.getElementById('st-owner').value.trim()},
      contact:{email:document.getElementById('st-email').value.trim(),whatsapp:document.getElementById('st-wa').value.trim(),phone:document.getElementById('st-phone').value.trim()}
    };
    var r2=await api('POST','/api/admin/settings',body);
    if(r2.ok)toast('Byabitswe');else toast(r2.data.error||'Byanze');
  });
}
async function renderLogs(c){
  var r=await api('GET','/api/admin/logs');
  if(!r.ok){c.innerHTML='<div class="note">err</div>';return}
  var rows=(r.data&&r.data.logs)||[];
  c.innerHTML='<h1>Amateka</h1><div class="panel">'+(rows.length?'<table><tr><th>Igihe</th><th>Admin</th><th>Action</th><th>Target</th></tr>'+
    rows.map(function(x){return '<tr><td>'+esc(when(x.at))+'</td><td>'+esc(x.admin_id||'')+'</td><td>'+esc(x.action)+'</td><td>'+esc((x.target_type||'')+':'+(x.target_id||''))+'</td></tr>'}).join('')+
    '</table>':'<div class="note">Nta mateka.</div>')+'</div>';
}

function val(id){var e=document.getElementById(id);return e?e.value.trim():''}
function showInvite(c,name,link,title){
  var msg='Muraho '+name+', wahawe uburenganzira bwo gufasha kuyobora AHABONA. Kanda hano ushyireho ijambobanga ryawe (rimara iminsi 3): '+link;
  c.innerHTML='<h1>'+esc(title)+'</h1><div class="panel"><p>Ohereza iyi link kuri '+esc(name)+'. Ni we ushyiraho ijambobanga rye; ntawe urimenya.</p>'+
    '<div class="f"><input id="iv-link" readonly value="'+esc(link)+'"></div>'+
    '<div class="act"><button class="btn" id="iv-copy">Kopera link</button>'+
    '<a class="btn gold" style="text-decoration:none;display:inline-block" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(msg)+'">Ohereza kuri WhatsApp</a>'+
    '<button class="btn ol" id="iv-back">Subira</button></div>'+
    '<div class="note">Iyi link imara iminsi 3. Ushobora gukora indi mu rutonde rw’abayobozi.</div></div>';
  var inp=document.getElementById('iv-link');
  document.getElementById('iv-copy').addEventListener('click',function(){
    inp.select();
    var done=function(ok){toast(ok?'Yakoporowe':'Hitamo link uyikopere')};
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(link).then(function(){done(true)},function(){done(false)});return}
    }catch(e){}
    done(false);
  });
  document.getElementById('iv-back').addEventListener('click',function(){TAB='staff';render()});
}

async function renderStaff(c){
  var r=await api('GET','/api/admin/staff');
  if(!r.ok){c.innerHTML='<div class="note">'+esc((r.data&&r.data.error)||'err')+'</div>';return}
  var d=r.data||{};
  var staff=d.staff||[],roles=d.roles||[],perms=d.perms||[],me=d.me||{};
  var rk={},rn={},tpl={};
  roles.forEach(function(x){rk[x.id]=x.rank;rn[x.id]=x.rw;tpl[x.id]=x.perms||[]});
  var isSuper=me.level==='super';
  var pn={};
  perms.forEach(function(p){pn[p.id]=p.rw});
  function allowedRoles(){
    return roles.filter(function(x){return isSuper||x.rank<(rk[me.level]||0)}).sort(function(a,b){return b.rank-a.rank});
  }
  function mayManage(m){return isSuper||(rk[m.level]||0)<(rk[me.level]||0)}
  function permBoxes(roleId,add,remove){
    var base=tpl[roleId]||[];
    return perms.map(function(p){
      var inBase=base.indexOf(p.id)!==-1;
      var checked=roleId==='super'||(inBase&&remove.indexOf(p.id)===-1)||(!inBase&&add.indexOf(p.id)!==-1);
      var dis=roleId==='super'||!isSuper;
      return '<label style="display:flex;gap:8px;align-items:center;margin:6px 0;font-weight:400"><input type="checkbox" data-perm="'+esc(p.id)+'"'+(checked?' checked':'')+(dis?' disabled':'')+'> <span>'+esc(p.rw)+'</span></label>';
    }).join('');
  }
  function openForm(m){
    var isNew=!m;
    var isMe=!!m&&m.id===me.id;
    var role=m?m.level:'admin';
    var allowed=allowedRoles();
    if(!isNew&&allowed.every(function(x){return x.id!==role})){
      roles.forEach(function(x){if(x.id===role)allowed.push(x)});
    }
    c.innerHTML='<h1>'+(isNew?'Ongeraho umuyobozi':'Hindura '+esc(m.name))+'</h1><div class="panel"><div class="f">'+
      '<label>Izina</label><input id="sf-name" maxlength="80" value="'+esc(m?m.name:'')+'">'+
      '<label>Email</label><input id="sf-email" value="'+esc(m?m.email:'')+'"'+(isNew?'':' readonly')+'>'+
      '<label>Telefoni</label><input id="sf-phone" value="'+esc(m?m.phone:'')+'"'+(isNew?'':' readonly')+'>'+
      '<label>Umurimo</label><select id="sf-role"'+(isMe?' disabled':'')+'>'+allowed.map(function(x){return '<option value="'+x.id+'"'+(x.id===role?' selected':'')+'>'+esc(x.rw)+'</option>'}).join('')+'</select>'+
      '<label>Ibyo yemerewe</label><div id="sf-perms">'+permBoxes(role,m?m.perms.add:[],m?m.perms.remove:[])+'</div>'+
      (isSuper?'':'<div class="note">Super Admin ni we uhindura ibyemerewe byihariye.</div>')+
      '</div><div class="act"><button class="btn" id="sf-save">Bika</button><button class="btn ol" id="sf-back">Subira</button></div></div>';
    document.getElementById('sf-back').addEventListener('click',function(){renderStaff(c)});
    document.getElementById('sf-role').addEventListener('change',function(){
      document.getElementById('sf-perms').innerHTML=permBoxes(this.value,[],[]);
    });
    document.getElementById('sf-save').addEventListener('click',async function(){
      var name=val('sf-name');
      if(name.length<2)return toast('Andika izina');
      var body={name:name};
      if(isNew){body.email=val('sf-email');body.phone=val('sf-phone')}
      if(!isMe){
        var rl=document.getElementById('sf-role').value;
        body.role=rl;
        if(isSuper&&rl!=='super'){
          var base=tpl[rl]||[],add=[],remove=[];
          $$('#sf-perms input[data-perm]').forEach(function(cb){
            var id=cb.getAttribute('data-perm');
            if(cb.checked&&base.indexOf(id)===-1)add.push(id);
            if(!cb.checked&&base.indexOf(id)!==-1)remove.push(id);
          });
          body.add=add;body.remove=remove;
        }
      }
      var r2=isNew?await api('POST','/api/admin/staff',body):await api('PUT','/api/admin/staff/'+m.id,body);
      if(!r2.ok)return toast((r2.data&&r2.data.error)||'Byanze');
      if(isNew&&r2.data.invite)return showInvite(c,name,r2.data.invite,'Umuyobozi yongewe');
      toast(isNew?'Yongewe ku bayobozi (asanzwe afite konti)':'Byabitswe');
      renderStaff(c);
    });
  }
  var rows=staff.map(function(m){
    var badge=m.status==='active'?'<span class="badge">active</span>':'<span class="badge red">'+esc(m.status)+'</span>';
    var isMe=m.id===me.id;
    var acts='';
    if(isMe||mayManage(m))acts+='<button class="btn ol sm" data-sedit="'+m.id+'">Hindura</button> ';
    if(!isMe&&mayManage(m)){
      acts+='<button class="btn ol sm" data-sinv="'+m.id+'">Link y’ubutumire</button> ';
      acts+='<button class="btn ol sm" data-ssus="'+m.id+'" data-st="'+esc(m.status)+'">'+(m.status==='active'?'Hagarika':'Garura')+'</button> ';
      acts+='<button class="btn ol sm" data-sdel="'+m.id+'">Kuraho</button>';
    }
    return '<tr><td>'+esc(m.name)+(isMe?' (wowe)':'')+'</td><td>'+esc(m.email)+'</td><td>'+esc(m.phone)+'</td><td>'+esc(rn[m.level]||m.level)+'</td><td>'+badge+'</td><td>'+acts+'</td></tr>';
  }).join('');
  var roleInfo=roles.slice().sort(function(a,b){return b.rank-a.rank}).map(function(x){
    var list=x.id==='super'?'Byose':(x.perms||[]).map(function(p){return pn[p]||p}).join(', ');
    return '<div class="flag"><span class="nm">'+esc(x.rw)+'</span><span class="note" style="flex:2">'+esc(list)+'</span></div>';
  }).join('');
  c.innerHTML='<h1>Abayobozi</h1><p class="sub">Abakozi bafasha kuyobora urubuga. Buri wese afite gusa ibyo yemerewe.</p>'+
    '<div class="panel"><div class="act"><button class="btn" id="st-add">Ongeraho umuyobozi</button></div></div>'+
    '<div class="panel"><table><tr><th>Izina</th><th>Email</th><th>Telefoni</th><th>Umurimo</th><th>Status</th><th>Igikorwa</th></tr>'+rows+'</table></div>'+
    '<div class="panel"><h3>Imirimo n’ibyo yemerewe</h3>'+roleInfo+'</div>';
  document.getElementById('st-add').addEventListener('click',function(){openForm(null)});
  function find(id){var x=null;staff.forEach(function(m){if(String(m.id)===String(id))x=m});return x}
  $$('[data-sedit]').forEach(function(b){b.addEventListener('click',function(){openForm(find(b.getAttribute('data-sedit')))})});
  $$('[data-sinv]').forEach(function(b){b.addEventListener('click',async function(){
    var m=find(b.getAttribute('data-sinv'));
    var r2=await api('POST','/api/admin/staff/'+m.id+'/invite',{});
    if(r2.ok)showInvite(c,m.name,r2.data.invite,'Link nshya y’ubutumire');else toast((r2.data&&r2.data.error)||'Byanze');
  })});
  $$('[data-ssus]').forEach(function(b){b.addEventListener('click',async function(){
    var m=find(b.getAttribute('data-ssus'));
    var to=m.status==='active'?'suspended':'active';
    if(to==='suspended'&&!confirm('Guhagarika '+m.name+'? Ntazabasha kwinjira.'))return;
    var r2=await api('PUT','/api/admin/staff/'+m.id,{status:to});
    if(r2.ok)renderStaff(c);else toast((r2.data&&r2.data.error)||'Byanze');
  })});
  $$('[data-sdel]').forEach(function(b){b.addEventListener('click',async function(){
    var m=find(b.getAttribute('data-sdel'));
    if(!confirm('Gukuraho ubuyobozi bwa '+m.name+'?'+(m.has_profile?' Konti ye izasigara nk’umukoresha usanzwe.':' Konti ye izasibwa.')))return;
    var r2=await api('DELETE','/api/admin/staff/'+m.id);
    if(r2.ok)renderStaff(c);else toast((r2.data&&r2.data.error)||'Byanze');
  })});
}

setupAdminLanguage();
boot();
})();
/* end admin.js */

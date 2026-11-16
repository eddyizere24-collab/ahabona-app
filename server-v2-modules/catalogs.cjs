'use strict';

const PROV={
  "Umujyi wa Kigali":["Gasabo","Kicukiro","Nyarugenge"],
  "Amajyepfo":["Gisagara","Huye","Kamonyi","Muhanga","Nyamagabe","Nyanza","Nyaruguru","Ruhango"],
  "Amajyaruguru":["Burera","Gakenke","Gicumbi","Musanze","Rulindo"],
  "Iburasirazuba":["Bugesera","Gatsibo","Kayonza","Kirehe","Ngoma","Nyagatare","Rwamagana"],
  "Iburengerazuba":["Karongi","Ngororero","Nyabihu","Nyamasheke","Rubavu","Rusizi","Rutsiro"]
};
const DIST=Object.values(PROV).flat();
const provOf=d=>Object.keys(PROV).find(p=>PROV[p].includes(d))||'';

const TAX={
  "Mu rugo":["Umukozi wo mu rugo","Umurezi w'abana","Umutetsi","Umukozi w'isuku","Umuzamu","Umurimyi w'ubusitani"],
  "Ubwikorezi":["Umushoferi","Umumotari","Umunyonzi","Umushoferi w'ikamyo","Umukozi wo gutwara ibicuruzwa"],
  "Ubwubatsi, amazi n'amashanyarazi":["Umufundi","Umubaji","Umusudira","Umuhanga mu mashanyarazi","Umukozi w'amazi","Umusiga irangi","Umukozi w'amabati","Umukozi w'amatafari n'amabuye"],
  "Gukanika no gusana":["Umukanishi w'imodoka","Umukanishi wa moto","Umukanishi w'amagare","Usana telefoni","Usana mudasobwa","Usana ibikoresho by'amashanyarazi","Woza imodoka"],
  "Ubuhinzi n'ubworozi":["Umuhinzi","Umworozi","Umworozi w'amafi","Umuvuzi w'amatungo","Umukozi w'ubuhinzi","Ucuruza ibikomoka ku buhinzi"],
  "Ubucuruzi":["Umucuruzi","Umukozi w'iduka","Ucuruza imboga n'imbuto","Agent wa mobile money","Ucuruza imyenda","Ucuruza ibikoresho"],
  "Ubwiza n'imyambaro":["Umudozi","Umuvuzi w'imisatsi","Umwogoshi","Ukora ubwiza (make-up)","Ukora inkweto","Ukora imitako"],
  "Uburezi n'ubuzima":["Umwarimu","Umwarimu w'abana","Umuforomo","Umuganga","Umujyanama w'ubuzima","Uhugura abantu"],
  "Ikoranabuhanga n'ibiro":["Umukozi w'ibiro","Umucungamari","Ukora porogaramu","Ukora imbuga za interineti","Ukora ibishushanyo","Umusemuzi","Ukora ubutumwa kuri social media"],
  "Ubukerarugendo n'amahoteri":["Uyobora ba mukerarugendo","Umukozi wa hoteli","Umukozi wa resitora","Utegura ibirori","Umucungamutungo w'amacumbi"],
  "Ubuhanzi n'imyidagaduro":["Umuririmbyi","Umubyinnyi","Umushushanya","Umufotozi","Ufata amashusho","DJ","Umushyushyarugamba (MC)"]
};

const ALIAS={
  "Umushoferi":["gutwara imodoka","utwara imodoka","umuntu utwara imodoka","shoferi","driver","chauffeur"],
  "Umukozi wo mu rugo":["gukora mu rugo","isuku mu rugo","umukozi w'urugo","maid","house help","domestic worker"],
  "Umukozi w'isuku":["cleaner","cleaning"],
  "Umubaji":["gukora ameza","gukora inzugi","carpenter","woodwork"],
  "Umufundi":["kubaka","umwubatsi","mason","builder"],
  "Umudozi":["gudoda","imyenda","tailor","seamstress"],
  "Umumotari":["moto","gutwara moto","motorcycle taxi"],
  "Umucuruzi":["gucuruza","iduka","ubucuruzi","trader","shopkeeper"],
  "Umutetsi":["guteka","cook","chef"],
  "Umukanishi w'imodoka":["gukanika","gusana imodoka","mechanic","garage","car mechanic"],
  "Umukanishi wa moto":["gukanika moto","mechanic","motorcycle mechanic"],
  "Umuhinzi":["guhinga","ubuhinzi","farmer"],
  "Woza imodoka":["kunyoza imodoka","kwoza imodoka","kogesha imodoka","umuntu woza imodoka","car washing","car wash","wash car"],
  "Umusudira":["gusudira","welder","welding"],
  "Umwarimu":["kwigisha","teacher","tutor"],
  "Umuvuzi w'imisatsi":["gusuka","hairdresser","salon"],
  "Umwogoshi":["kogosha","barber"],
  "Umuforomo":["nurse"],
  "Umuganga":["doctor"],
  "Umufotozi":["gufotora","photographer"],
  "Umusemuzi":["translator","interpreter"],
  "Umuzamu":["security guard","guard"],
  "Umukozi w'amazi":["plumber","plumbing"],
  "Umuhanga mu mashanyarazi":["electrician","amashanyarazi"],
  "Umusiga irangi":["painter","irangi"]
};

const CAP_EN={
  "Umushoferi":"Driver","Umukozi wo mu rugo":"House helper",
  "Umurezi w'abana":"Childcare worker","Umutetsi":"Cook",
  "Umukozi w'isuku":"Cleaner","Umuzamu":"Security guard",
  "Umurimyi w'ubusitani":"Gardener","Umumotari":"Motorcycle taxi",
  "Umunyonzi":"Bicycle courier","Umushoferi w'ikamyo":"Truck driver",
  "Umukozi wo gutwara ibicuruzwa":"Delivery worker",
  "Umufundi":"Mason","Umubaji":"Carpenter","Umusudira":"Welder",
  "Umuhanga mu mashanyarazi":"Electrician",
  "Umukozi w'amazi":"Plumber","Umusiga irangi":"Painter",
  "Umukozi w'amabati":"Roofing worker",
  "Umukozi w'amatafari n'amabuye":"Bricklayer",
  "Umukanishi w'imodoka":"Car mechanic",
  "Umukanishi wa moto":"Motorcycle mechanic",
  "Umukanishi w'amagare":"Bicycle mechanic",
  "Usana telefoni":"Phone repairer","Usana mudasobwa":"Computer repairer",
  "Usana ibikoresho by'amashanyarazi":"Appliance repairer",
  "Woza imodoka":"Car washer","Umuhinzi":"Farmer",
  "Umworozi":"Livestock keeper","Umworozi w'amafi":"Fish farmer",
  "Umuvuzi w'amatungo":"Veterinarian",
  "Umukozi w'ubuhinzi":"Farm worker",
  "Ucuruza ibikomoka ku buhinzi":"Farm produce seller",
  "Umucuruzi":"Trader","Umukozi w'iduka":"Shop assistant",
  "Ucuruza imboga n'imbuto":"Vegetable seller",
  "Agent wa mobile money":"Mobile money agent",
  "Ucuruza imyenda":"Clothes seller",
  "Ucuruza ibikoresho":"Hardware seller","Umudozi":"Tailor",
  "Umuvuzi w'imisatsi":"Hairdresser","Umwogoshi":"Barber",
  "Ukora ubwiza (make-up)":"Make-up artist",
  "Ukora inkweto":"Shoemaker","Ukora imitako":"Craft maker",
  "Umwarimu":"Teacher","Umwarimu w'abana":"Preschool teacher",
  "Umuforomo":"Nurse","Umuganga":"Doctor",
  "Umujyanama w'ubuzima":"Health advisor",
  "Uhugura abantu":"Trainer",
  "Umukozi w'ibiro":"Office worker","Umucungamari":"Accountant",
  "Ukora porogaramu":"Software developer",
  "Ukora imbuga za interineti":"Web developer",
  "Ukora ibishushanyo":"Graphic designer",
  "Umusemuzi":"Translator",
  "Ukora ubutumwa kuri social media":"Social media manager",
  "Uyobora ba mukerarugendo":"Tour guide",
  "Umukozi wa hoteli":"Hotel staff",
  "Umukozi wa resitora":"Restaurant staff",
  "Utegura ibirori":"Event planner",
  "Umucungamutungo w'amacumbi":"Property manager",
  "Umuririmbyi":"Singer","Umubyinnyi":"Dancer",
  "Umushushanya":"Visual artist","Umufotozi":"Photographer",
  "Ufata amashusho":"Videographer","DJ":"DJ",
  "Umushyushyarugamba (MC)":"MC"
};

const CAT_EN={
  "Mu rugo":"Domestic","Ubwikorezi":"Transport",
  "Ubwubatsi, amazi n'amashanyarazi":"Construction & Utilities",
  "Gukanika no gusana":"Repair & Service",
  "Ubuhinzi n'ubworozi":"Farming & Livestock",
  "Ubucuruzi":"Business","Ubwiza n'imyambaro":"Beauty & Tailoring",
  "Uburezi n'ubuzima":"Education & Health",
  "Ikoranabuhanga n'ibiro":"Tech & Office",
  "Ubukerarugendo n'amahoteri":"Tourism & Hotels",
  "Ubuhanzi n'imyidagaduro":"Arts & Entertainment"
};

const PROV_EN={
  "Umujyi wa Kigali":"City of Kigali","Amajyepfo":"Southern",
  "Amajyaruguru":"Northern","Iburasirazuba":"Eastern",
  "Iburengerazuba":"Western"
};

const EDU_LEVELS=[
  {id:'none',rw:'Nta mashuri',en:'No education'},
  {id:'primary',rw:'Amashuri abanza',en:'Primary'},
  {id:'olevel',rw:'Amashuri yisumbuye - O Level',en:'Secondary - O Level'},
  {id:'alevel',rw:'Amashuri yisumbuye - A Level',en:'Secondary - A Level'},
  {id:'a1',rw:'A1',en:'A1'},
  {id:'a2',rw:'A2',en:'A2'},
  {id:'tvet',rw:'TVET / VTC',en:'TVET / VTC'},
  {id:'bachelor',rw:'Kaminuza - Bachelor',en:'University - Bachelor'},
  {id:'master',rw:'Kaminuza - Master',en:'University - Master'},
  {id:'phd',rw:'Kaminuza - PhD',en:'University - PhD'}
];

const GENDERS=[
  {id:'m',rw:'Umugabo',en:'Male'},
  {id:'f',rw:'Umugore',en:'Female'}
];

const LANGS=[
  {id:'rw',rw:'Ikinyarwanda',en:'Kinyarwanda'},
  {id:'en',rw:'Icyongereza',en:'English'},
  {id:'fr',rw:'Igifaransa',en:'French'},
  {id:'sw',rw:'Igiswahili',en:'Swahili'}
];

const MAXP=3;
const MAXPH=5;
const MAXSVC=5;
const MAXCAPS=3;
const MIN_AGE=18;
const MAX_AGE=100;
const W={rel:45,fair:25,nov:10,div:10,exp:10};
const DAY=864e5;
const HOUR=36e5;
const DEL_MS=183*DAY;
const FRESH_MS=14*DAY;
const IDLE_MS=15*60e3;
const BODY_MAX=6*1024*1024;

function trustedBaseUrl(){
  const raw=String(process.env.AHABONA_URL||'').trim();
  if(!raw)return null;
  try{
    const u=new URL(raw);
    if(u.username||u.password||u.search||u.hash)return null;
    if(u.pathname&&u.pathname!=='/')return null;
    const isLocal=['localhost','127.0.0.1','::1'].includes(u.hostname);
    if(u.protocol!=='https:'&&!(process.env.AHABONA_DEV==='1'&&u.protocol==='http:'&&isLocal))return null;
    return u.origin;
  }catch(e){return null;}
}

const FEATURE_DEFAULTS={
  sms_verification:{on:false},
  email_verification:{on:false},
  id_verification:{on:false},
  payments:{on:false},
  messaging:{on:false},
  reviews:{on:false},
  push_notifications:{on:false},
  social_login:{on:false},
  analytics:{on:false},
  pwa:{on:true}
};

const BLOCKLIST=[
  "indaya","kugurisha umubiri","ubusambanyi","kwica","gutsemba","gutema","gukubita",
  "ihohoterwa","gufata ku ngufu","ibiyobyabwenge","kwibeshya","uburiganya","umujura",
  "kwiba","amagambo y'urwango","akato","gufata abana ku ngufu","kwiyahura",
  "prostitute","prostitution","porn","pornography","murder","kill","assault","rape",
  "drugs","cocaine","heroin","cannabis","scam","fraud","steal","hate","slur"
];

const ROLES={
  super:{rank:100,rw:"Super Admin",en:"Super Admin"},
  admin:{rank:80,rw:"Umuyobozi",en:"Admin"},
  mod:{rank:50,rw:"Umugenzuzi",en:"Moderator"},
  editor:{rank:30,rw:"Umwanditsi",en:"Editor"},
  viewer:{rank:10,rw:"Ureba",en:"Viewer"}
};

const STAFF_LEVELS=["super","admin","mod","editor","viewer"];
const PERMS={
  "dash.view":{rw:"Kureba incamake n'imibare",en:"View overview and stats"},
  "users.view":{rw:"Kureba abakoresha",en:"View users"},
  "users.edit":{rw:"Guhindura abakoresha (izina, akarere, guhagarika)",en:"Edit users (name, district, suspend)"},
  "users.contact":{rw:"Guhindura email na telefoni",en:"Edit email and phone"},
  "users.delete":{rw:"Gusiba abakoresha",en:"Delete users"},
  "users.message":{rw:"Kohereza ubutumwa ku muntu",en:"Message a user"},
  "broadcast.send":{rw:"Kohereza ubutumwa kuri bose",en:"Broadcast to everyone"},
  "profiles.moderate":{rw:"Guhagarika no kugarura imyirondoro",en:"Suspend and restore profiles"},
  "reports.handle":{rw:"Gukemura ibibazo (reports)",en:"Handle reports"},
  "requests.handle":{rw:"Kwemeza ibyifuzo by'imirimo",en:"Approve skill requests"},
  "catalog.edit":{rw:"Imirimo n'ibyiciro",en:"Skills and categories"},
  "content.edit":{rw:"Ikibaho, FAQ n'ubutumwa bw'ubufasha",en:"Hero board, FAQ and help messages"},
  "settings.edit":{rw:"Igenamiterere n'ibikorwa",en:"Settings and features"},
  "staff.manage":{rw:"Gucunga abayobozi",en:"Manage staff"},
  "audit.view":{rw:"Kureba amateka y'ibikorwa",en:"View audit log"}
};
const ROLE_PERMS={
  super:Object.keys(PERMS),
  admin:["dash.view","users.view","users.edit","users.message","profiles.moderate","reports.handle","requests.handle","catalog.edit","content.edit"],
  mod:["dash.view","users.view","profiles.moderate","reports.handle","requests.handle"],
  editor:["dash.view","catalog.edit","content.edit"],
  viewer:["dash.view"]
};
function isPerm(x){return typeof x==='string'&&Object.prototype.hasOwnProperty.call(PERMS,x)}
function staffLevelRaw(u){
  if(!u)return null;
  if(STAFF_LEVELS.includes(u.role_level))return u.role_level;
  if(u.role==='admin')return 'admin';
  return null;
}
function staffLevel(u){return(u&&u.status==='active')?staffLevelRaw(u):null}
function permsFor(u){
  const lv=staffLevelRaw(u);
  if(!lv)return [];
  if(lv==='super')return Object.keys(PERMS);
  const set=new Set(ROLE_PERMS[lv]||[]);
  try{
    const o=JSON.parse(u.perms||'{}')||{};
    (Array.isArray(o.add)?o.add:[]).forEach(x=>{if(isPerm(x))set.add(x)});
    (Array.isArray(o.remove)?o.remove:[]).forEach(x=>{set.delete(x)});
  }catch(e){}
  return Array.from(set);
}
function permsOf(u){return staffLevel(u)?permsFor(u):[]}
function rankOfLevel(l){return l&&ROLES[l]?ROLES[l].rank:0}
function permsCatalog(){return Object.keys(PERMS).map(k=>({id:k,rw:PERMS[k].rw,en:PERMS[k].en}))}
function rolesCatalog(){return STAFF_LEVELS.map(k=>({id:k,rw:ROLES[k].rw,en:ROLES[k].en,rank:ROLES[k].rank,perms:ROLE_PERMS[k]}))}


module.exports = {
  PROV,
  DIST,
  provOf,
  TAX,
  ALIAS,
  CAP_EN,
  CAT_EN,
  PROV_EN,
  EDU_LEVELS,
  GENDERS,
  LANGS,
  MAXP,
  MAXPH,
  MAXSVC,
  MAXCAPS,
  MIN_AGE,
  MAX_AGE,
  W,
  DAY,
  HOUR,
  DEL_MS,
  FRESH_MS,
  IDLE_MS,
  BODY_MAX,
  trustedBaseUrl,
  FEATURE_DEFAULTS,
  BLOCKLIST,
  ROLES,
  STAFF_LEVELS,
  PERMS,
  ROLE_PERMS,
  isPerm,
  staffLevelRaw,
  staffLevel,
  permsFor,
  permsOf,
  rankOfLevel,
  permsCatalog,
  rolesCatalog
};

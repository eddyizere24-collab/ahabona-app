'use strict';
const EMBED={};
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const zlib=require('node:zlib');
const {DatabaseSync}=require('node:sqlite');
const {execFile}=require('node:child_process');
const STUDIO_BETA=process.env.AHABONA_STUDIO_BETA==='1';
const StudioStore=STUDIO_BETA?require('./server-v2-modules/studio/store.cjs'):null;
const StudioMedia=STUDIO_BETA?require('./server-v2-modules/studio/media.cjs'):null;

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

/* ===== END OF IGICE 1/16 ===== */const I18N={
  rw:{
    "nav.home":"Ahabanza","nav.about":"Ibyerekeye","nav.help":"Ubufasha","nav.saved":"Abitse",
    "nav.login":"Injira","nav.logout":"Sohoka","nav.register":"Iyandikishe","nav.profile":"Umwirondoro",
    "nav.admin":"Ubuyobozi","nav.lang":"Ururimi",
    "home.search.ph":"Shaka uwo ukeneye","home.search.label":"Shaka kuri AHABONA",
    "home.results":"Ibisubizo {{count}}","home.empty":"Nta muntu ubonetse hano.",
    "home.empty.filt":"Nta muntu ubonetse hano. Gerageza filters zindi.",
    "home.first":"Nta muntu urabona hano. Iyandikishe kugira ngo ube uwa mbere.",
    "home.loading":"Turimo gushakisha…","home.error":"Seriveri ntiboneka cyangwa nta interineti.",
    "home.retry":"Ongera ugerageze","home.more":"Erekana abandi",
    "home.offline":"Nta interineti. Reba amakuru yabitswe.",
    "home.slow":"Interineti irahinze. Tegereza gato.",
    "home.clearFilter":"Siba filter","home.tryOther":"Gerageza irindi jambo",
    "home.widenArea":"Shakira mu ntara yose","home.clearArea":"Kuraho aho ari",
    "filters":"Muyunguruzi","filters.search":"Shakisha","filters.prov":"Intara",
    "filters.dist":"Akarere","filters.sort":"Gutondeka","filters.clear":"Siba byose",
    "filters.allProv":"Intara zose","filters.allDist":"Akarere kose",
    "filters.category":"Icyiciro","filters.allCat":"Ibyiciro byose",
    "filters.verified":"Abemejwe gusa","filters.hasPhoto":"Abafite amafoto",
    "sort.rel":"Bihuye cyane","sort.fresh":"Bishya","sort.top":"Amanota","sort.new":"Abashya",
    "theme.auto":"Isura: byikora","theme.light":"Isura: umucyo","theme.dark":"Isura: umwijima",
    "saver.off":"Kubika data: off","saver.on":"Kubika data: on",
    "profile.title":"Umwirondoro","profile.name":"Amazina","profile.location":"Aho atuye",
    "profile.serves":"Akorera","profile.skills":"Ubushobozi","profile.bio":"Ibyerekeye",
    "profile.experience":"Uburambe","profile.education":"Amashuri","profile.languages":"Indimi",
    "profile.availability":"Igihe ariho","profile.contact":"Kuvugana","profile.phone":"Telefoni",
    "profile.whatsapp":"WhatsApp","profile.call":"Hamagara","profile.message":"Vugana",
    "profile.save":"Bika","profile.saved":"Wabitse","profile.share":"Sangira",
    "profile.report":"Menyesha ikibazo","profile.view":"Umwirondoro wose","profile.back":"Subira",
    "profile.edit":"Hindura","profile.notfound":"Umwirondoro ntubonetse",
    "profile.verified":"Yemejwe","profile.fresh":"Yavuguruwe vuba",
    "profile.showPhoto":"Erekana ifoto","profile.age":"Imyaka","profile.gender":"Igitsina",
    "profile.safety":"Mbere yo guhura: ntukishyure mbere, uhurire ahantu hari abandi, kandi wisuzumire ubushobozi bwe.",
    "profile.unnamed":"Umunyamuryango wa AHABONA","profile.noSkills":"Nta bushobozi burashyirwaho.",
    "profile.noBio":"Nta bisobanuro birashyirwaho.","profile.noPhoto":"Nta foto irashyirwaho.",
    "reg.title":"Iyandikishe","reg.edit":"Hindura umwirondoro","reg.next":"Komeza",
    "reg.prev":"Subira","reg.submit":"Emeza","reg.saving":"Tegereza…",
    "reg.step":"Intambwe {{n}} kuri {{total}}","reg.s1":"Abo uri bo","reg.s2":"Umwirondoro",
    "reg.s3":"Icyo ushoboye","reg.s4":"Kuvugana","reg.s5":"Konti","reg.s6":"Amabwiriza",
    "reg.name":"Izina ryawe","reg.name.ph":"Urugero: Jean Mukamana","reg.birthdate":"Itariki yavukiye",
    "reg.birthdate.ph":"YYYY-MM-DD","reg.gender":"Igitsina","reg.gender.pick":"Hitamo igitsina",
    "reg.province":"Intara utuyemo","reg.province.pick":"Hitamo intara","reg.district":"Akarere utuyemo",
    "reg.district.pick":"Hitamo akarere","reg.service":"Aho ukorera (ihitamo)",
    "reg.service.hint":"Hitamo kugeza ku turere 5.","reg.photo":"Ifoto yawe",
    "reg.photo.hint":"Ifoto ni ihitamo. Ushobora kongeraho amafoto atarenze atatu.",
    "reg.photo.add":"Shyiraho ifoto","reg.photo.more":"Ongeraho ifoto",
    "reg.edu":"Amashuri","reg.edu.pick":"Hitamo urwego","reg.bio":"Ubwiyerekane bugufi",
    "reg.bio.ph":"Urugero: Mfite uburambe bw'imyaka 5","reg.exp":"Uburambe bw'akazi",
    "reg.exp.hint":"Andika akazi wakoze (ihitamo).",
    "reg.exp.ph":"Urugero: Umubaji, Kigali Construction, 2019-2022",
    "reg.langs":"Indimi (ihitamo)","reg.avail":"Igihe ariho (ihitamo)",
    "reg.avail.morning":"Mu gitondo","reg.avail.afternoon":"Ku manywa","reg.avail.evening":"Nimugoroba",
    "reg.avail.weekday":"Ku wa mbere - Ku wa gatanu","reg.avail.weekend":"Weekend",
    "reg.jobs":"Icyo ushoboye","reg.jobs.hint":"Hitamo kugeza kuri 3.",
    "reg.jobs.find":"Shaka umurimo","reg.jobs.other":"Ntabona umurimo wanjye",
    "reg.jobs.otherText":"Andika umurimo wawe","reg.phone":"Telefoni",
    "reg.phone.hint":"Izagaragara ku mwirondoro wawe.","reg.phone.ph":"0792053086",
    "reg.phone.agree":"Nzi kandi nemeye ko nimero yanjye izagaragara.",
    "reg.wa":"WhatsApp (ihitamo)","reg.phones":"Izindi telefoni (ihitamo)",
    "reg.phones.hint":"Kugeza kuri 4 zindi.","reg.phones.add":"Ongeraho iyindi telefoni","reg.email.public":"Email yo kwakirira abandi (si ngombwa)","reg.email.public.hint":"Izagaragara ku mwirondoro wawe.","reg.social":"Imbuga nkoranyambaga (si ngombwa)","reg.social.add":"Ongeraho imbuga nkoranyambaga","reg.email":"Email",
    "reg.email.hint":"Ntigaragara ku bandi.","reg.email.ph":"izere.eddy@email.com",
    "reg.password":"Ijambobanga","reg.password.hint":"Nibura inyuguti 8.",
    "reg.password.show":"Erekana","reg.password.hide":"Hisha",
    "reg.terms":"Nzi kandi nemeye amabwiriza","reg.terms.read":"Soma",
    "reg.success":"Wiyandikishije neza!","reg.view":"Reba umwirondoro wanjye",
    "reg.draft":"Byabitswe kuri iyi telefoni. Ushobora gukomeza nyuma.",
    "reg.draftRestore":"Wari utangiye kwiyandikisha. Ukomeza?",
    "reg.err.name":"Andika izina ryawe ryuzuye (nibura inyuguti 3).",
    "reg.err.birthdate":"Andika itariki yavukiye.","reg.err.age":"Ugomba kuba nibura imyaka 18.",
    "reg.err.gender":"Hitamo igitsina.","reg.err.province":"Hitamo intara.",
    "reg.err.district":"Hitamo akarere.","reg.err.photo":"Ifoto ntiyemewe cyangwa nini cyane. Gerageza indi.",
    "reg.err.jobs":"Hitamo nibura umurimo umwe.","reg.err.jobs3":"Hitamo imirimo itarenze 3.",
    "reg.err.other":"Andika umurimo wawe (nibura inyuguti 3).",
    "reg.err.phone":"Andika telefoni nyayo, urugero 0788123456.",
    "reg.err.phone.agree":"Emeza ko nimero yawe igaragara.",
    "reg.err.wa":"Andika nimero ya WhatsApp nyayo.","reg.err.phones":"Andika telefoni nyazo.",
    "reg.err.email":"Andika email nyayo.","reg.err.password":"Ijambobanga nibura inyuguti 8.",
    "reg.err.terms":"Ugomba kwemera amabwiriza.",
    "login.title":"Injira","login.id":"Email cyangwa telefoni",
    "login.id.ph":"izina@gmail.com cyangwa 0788123456","login.password":"Ijambobanga",
    "login.submit":"Injira","login.working":"Turimo kukwinjiza…",
    "login.forgot":"Nibagiwe ijambobanga","login.orReg":"Nta konti? Iyandikishe",
    "login.err":"Email, telefoni cyangwa ijambobanga si byo.","login.ok":"Winjiye neza.",
    "logout.ok":"Wasohotse.","forgot.title":"Nibagiwe ijambobanga",
    "forgot.email":"Email yawe","forgot.submit":"Ohereza",
    "forgot.sent":"Niba iyi email ibaho, twohereje ubutumwa bufite link. Reba inbox na spam.",
    "forgot.hint":"Tuzakoherereza link yo gushyiraho irindi jambobanga.",
    "forgot.already_sent":"Ufite link iracyakora yoherejwe kuri email yawe. Reba Inbox na Spam. Ushobora gusaba iyindi nyuma y'amasaha 48.",
    "reset.title":"Ijambobanga rishya","reset.new":"Ijambobanga rishya",
    "reset.submit":"Bika","reset.ok":"Ijambobanga ryabitswe. Injira.",
    "reset.err":"Link yarangiye cyangwa ntiyemewe.",
    "restore.title":"Konti iri mu gihe cyo gusibwa",
    "restore.body":"Warasabye gusiba konti yawe. Iracyashobora gusubizwa mu mezi 6. Ushaka kuyisubiza?",
    "restore.yes":"Yego, subiza","restore.no":"Oya","restore.ok":"Konti yasubijwe.",
    "account.title":"Konti yawe","account.myProfile":"Umwirondoro wanjye",
    "account.edit":"Hindura umwirondoro","account.password":"Hindura ijambobanga",
    "account.delete":"Siba konti",
    "account.deleteWarn":"Konti yawe izahita ihishwa. Ishobora gusubizwa mu mezi 6. Nyuma yaho isibwa burundu.",
    "account.currentPw":"Ijambobanga rya none","account.newPw":"Ijambobanga rishya",
    "account.confirmPw":"Andika ijambobanga kugira ngo wemeze",
    "account.logout":"Sohoka","account.logoutAll":"Sohoka kuri byose","account.messages":"Ubutumwa","account.notifications":"Amatangazo","notif.empty":"Nta matangazo.","notif.markRead":"Soma byose","msg.empty":"Nta butumwa.","msg.reply":"Subiza","nav.notifications":"Amatangazo","verify.email":"Email ntiyemejwe — emeza ubu","verify.phone":"Telefoni ntiyemejwe — emeza ubu","verify.send":"Ohereza","verify.code":"Kode",
    "account.deleteOk":"Gusiba byakiriwe",
    "account.deleteBody":"Konti yawe yahishwe. Izamara amezi 6 ishobora gusubizwa. Nyuma yaho izasibwa burundu.",
    "account.admin":"Ubuyobozi",
    "saved.title":"Abantu wabitse","saved.empty":"Nta muntu urabika. Kanda \"Bika\" ku mwirondoro w'umuntu.",
    "saved.removed":"Wakuyeho.","saved.ok":"Wabitse.",
    "report.title":"Menyesha ikibazo","report.choose":"Hitamo ikibazo",
    "report.r.wrong":"Amakuru atari yo","report.r.photo":"Ifoto itari iyo",
    "report.r.behavior":"Imyitwarire mibi","report.r.other":"Ikindi",
    "report.submit":"Emeza","report.hint":"Kizagera ku bashinzwe kugenzura.",
    "report.ok":"Amakuru yawe yakiriwe.",
    "help.title":"Ubufasha","help.search":"Shaka igisubizo","help.search.ph":"Shaka igisubizo",
    "help.ask":"Baza ubufasha","help.ask.ph":"Urugero: Nshyiraho nte ifoto?",
    "help.send":"Baza","help.hint":"Ibisubizo biva mu makuru yemewe gusa.",
    "help.no":"Nta gisubizo kibonetse. Gerageza andi magambo.",
    "help.contact":"Vugana natwe","help.contact.hint":"Ntubonye igisubizo? Twandikire.",
    "help.contactForm.name":"Izina ryawe","help.contactForm.email":"Email yawe",
    "help.contactForm.msg":"Ikibazo cyawe","help.contactForm.submit":"Ohereza",
    "help.contactForm.ok":"Ubutumwa bwoherejwe. Turakusubiza vuba.",
    "help.cat.all":"Byose","help.cat.register":"Kwiyandikisha","help.cat.profile":"Umwirondoro",
    "help.cat.search":"Gushakisha","help.cat.contact":"Kuvugana","help.cat.safety":"Umutekano",
    "about.title":"Ibyerekeye AHABONA",
    "about.intro":"AHABONA ni urubuga abantu bagaragarizaho ibyo bashoboye, kugira ngo ababakeneye babone kandi babavugishe.",
    "about.why":"Hari abantu benshi bashoboye batazwi uretse n'abo baziranye. AHABONA ituma baboneka kure.",
    "about.how":"Wiyandikisha, ukerekana icyo ushoboye n'aho uri, ukaboneka, abagukeneye bakakuvugisha.",
    "about.what":"Si urubuga rwo gutangaza akazi, kandi ntirwemeza ko umuntu afite ubushobozi avuga. Ukeneye umuntu agomba kwisuzumira.",
    "about.vision":"Intego yacu ni ugutuma umuntu wese abona akazi, kandi umukoresha wese abone umukozi mwiza.",
    "about.stats.users":"Abakoresha","about.stats.profiles":"Imyirondoro",
    "about.stats.districts":"Uturere","about.stats.jobs":"Imirimo","about.contact":"Twandikire",
    "common.ok":"Sawa","common.cancel":"Hagarika","common.close":"Funga","common.back":"Subira",
    "common.next":"Komeza","common.prev":"Inyuma","common.save":"Bika","common.delete":"Siba",
    "common.edit":"Hindura","common.yes":"Yego","common.no":"Oya","common.retry":"Ongera",
    "common.loading":"Birimo…","common.error":"Habaye ikibazo","common.success":"Byagenze neza",
    "common.offline":"Nta interineti","common.online":"Interineti yagarutse",
    "common.confirm":"Urabyemeza?","common.or":"cyangwa","common.of":"kuri","common.new":"Gishya",
    "common.required":"Ni ngombwa","common.optional":"Si ngombwa",
    "toast.langChanged":"Ururimi rwahinduwe.","toast.themeChanged":"Isura yahinduwe.",
    "toast.saverOn":"Kubika data byashyizweho.","toast.saverOff":"Kubika data byazimijwe.",
    "toast.copied":"Byakopowe.","toast.shared":"Byasangiwe.",
    "footer.copy":"© {{year}} AHABONA. Uburenganzira bwose burabitswe.",
    "footer.terms":"Amabwiriza","footer.privacy":"Ibanga",
    "err.server":"Habaye ikibazo kuri seriveri. Ongera ugerageze.",
    "err.rate":"Ubusabe bwinshi. Tegereza gato.","err.auth":"Banza winjire.",
    "hero.err.link":"Link igomba gutangira na http:// cyangwa https://","hero.err.phone":"Telefoni ntiyemewe.","staff.err.exists":"Uyu muntu asanzwe ari umuyobozi.","staff.err.self":"Ntushobora guhindura uburenganzira bwawe bwite.","staff.err.lastsuper":"Ntushobora gukuraho Super Admin wa nyuma.","staff.err.rank":"Nta burenganzira bwo guhindura uyu muyobozi.",
    "err.forbidden":"Nta burenganzira.","err.notfound":"Ntibonetse.",
    "err.big":"Ifoto cyangwa amakuru ni binini cyane.","err.mail":"Kohereza email ntibishobotse.",
    "err.blocklist":"Iri jambo ntirikwiye kuri AHABONA.","err.offline":"Nta interineti.","val.soc":"Andika link nyayo (https://...).","val.svc":"Hitamo akarere kemewe.","val.svc5":"Hitamo kugeza ku turere 5."
  },
  en:{
    "nav.home":"Home","nav.about":"About","nav.help":"Help","nav.saved":"Saved",
    "nav.login":"Log in","nav.logout":"Log out","nav.register":"Sign up","nav.profile":"Profile",
    "nav.admin":"Admin","nav.lang":"Language",
    "home.search.ph":"Search for who you need","home.search.label":"Search on AHABONA",
    "home.results":"{{count}} results","home.empty":"No one found here.",
    "home.empty.filt":"No one found. Try other filters.",
    "home.first":"No one to show. Sign up to be the first.",
    "home.loading":"Searching…","home.error":"Server unavailable or no internet.",
    "home.retry":"Try again","home.more":"Show more",
    "home.offline":"No internet. Showing saved content.","home.slow":"Slow network. Please wait.",
    "home.clearFilter":"Clear filter","home.tryOther":"Try another word",
    "home.widenArea":"Search the whole province","home.clearArea":"Clear location",
    "filters":"Filters","filters.search":"Search","filters.prov":"Province",
    "filters.dist":"District","filters.sort":"Sort","filters.clear":"Clear all",
    "filters.allProv":"All provinces","filters.allDist":"All districts",
    "filters.category":"Category","filters.allCat":"All categories",
    "filters.verified":"Verified only","filters.hasPhoto":"With photo",
    "sort.rel":"Most relevant","sort.fresh":"Recently updated","sort.top":"Top rated","sort.new":"Newest members",
    "theme.auto":"Theme: auto","theme.light":"Theme: light","theme.dark":"Theme: dark",
    "saver.off":"Data saver: off","saver.on":"Data saver: on",
    "profile.title":"Profile","profile.name":"Name","profile.location":"Location",
    "profile.serves":"Serves","profile.skills":"Skills","profile.bio":"About",
    "profile.experience":"Experience","profile.education":"Education","profile.languages":"Languages",
    "profile.availability":"Availability","profile.contact":"Contact","profile.phone":"Phone",
    "profile.whatsapp":"WhatsApp","profile.call":"Call","profile.message":"Message",
    "profile.save":"Save","profile.saved":"Saved","profile.share":"Share",
    "profile.report":"Report issue","profile.view":"Full profile","profile.back":"Back",
    "profile.edit":"Edit","profile.notfound":"Profile not found",
    "profile.verified":"Verified","profile.fresh":"Recently updated",
    "profile.showPhoto":"Show photo","profile.age":"Age","profile.gender":"Gender",
    "profile.safety":"Before meeting: do not pay in advance, meet in a public place, and verify the person's skills.",
    "profile.unnamed":"AHABONA member","profile.noSkills":"No skills added.",
    "profile.noBio":"No description added.","profile.noPhoto":"No photo added.",
    "reg.title":"Sign up","reg.edit":"Edit profile","reg.next":"Continue",
    "reg.prev":"Back","reg.submit":"Submit","reg.saving":"Please wait…",
    "reg.step":"Step {{n}} of {{total}}","reg.s1":"Who you are","reg.s2":"Profile",
    "reg.s3":"What you can do","reg.s4":"Contact","reg.s5":"Account","reg.s6":"Terms",
    "reg.name":"Your name","reg.name.ph":"e.g. Jean Mukamana","reg.birthdate":"Date of birth",
    "reg.birthdate.ph":"YYYY-MM-DD","reg.gender":"Gender","reg.gender.pick":"Choose gender",
    "reg.province":"Province you live in","reg.province.pick":"Choose province","reg.district":"District you live in",
    "reg.district.pick":"Choose district","reg.service":"Service areas (optional)",
    "reg.service.hint":"Choose up to 5 districts.","reg.photo":"Your photo",
    "reg.photo.hint":"A photo is optional. You can add up to three photos.",
    "reg.photo.add":"Add photo","reg.photo.more":"Add another",
    "reg.edu":"Education","reg.edu.pick":"Choose level","reg.bio":"Short headline",
    "reg.bio.ph":"e.g. 5 years of experience","reg.exp":"Work experience",
    "reg.exp.hint":"Describe the work you did (optional).",
    "reg.exp.ph":"e.g. Carpenter, Kigali Construction, 2019-2022",
    "reg.langs":"Languages (optional)","reg.avail":"Availability (optional)",
    "reg.avail.morning":"Morning","reg.avail.afternoon":"Afternoon","reg.avail.evening":"Evening",
    "reg.avail.weekday":"Monday - Friday","reg.avail.weekend":"Weekend",
    "reg.jobs":"What you can do","reg.jobs.hint":"Choose up to 3.",
    "reg.jobs.find":"Search a job","reg.jobs.other":"Cannot find my job",
    "reg.jobs.otherText":"Type your job","reg.phone":"Phone",
    "reg.phone.hint":"Will be visible on your profile.","reg.phone.ph":"0792053086",
    "reg.phone.agree":"I understand my number will be visible.",
    "reg.wa":"WhatsApp (optional)","reg.phones":"Other phones (optional)",
    "reg.phones.hint":"Up to 4 more.","reg.phones.add":"Add another phone","reg.email.public":"Public email (optional)","reg.email.public.hint":"Will be shown on your profile.","reg.social":"Social media (optional)","reg.social.add":"Add social media","reg.email":"Email",
    "reg.email.hint":"Not shown to others.","reg.email.ph":"izere.eddy@email.com",
    "reg.password":"Password","reg.password.hint":"At least 8 characters.",
    "reg.password.show":"Show","reg.password.hide":"Hide",
    "reg.terms":"I have read and agree to the terms","reg.terms.read":"Read",
    "reg.success":"Registration successful!","reg.view":"View my profile",
    "reg.draft":"Saved on this phone. You can continue later.",
    "reg.draftRestore":"You started signing up. Continue?",
    "reg.err.name":"Enter your full name (at least 3 characters).",
    "reg.err.birthdate":"Enter your date of birth.","reg.err.age":"You must be at least 18 years old.",
    "reg.err.gender":"Choose your gender.","reg.err.province":"Choose your province.",
    "reg.err.district":"Choose your district.","reg.err.photo":"The photo could not be accepted. Try another image.",
    "reg.err.jobs":"Choose at least one job.","reg.err.jobs3":"Choose up to 3 jobs.",
    "reg.err.other":"Type your job (at least 3 characters).",
    "reg.err.phone":"Enter a valid phone, e.g. 0788123456.",
    "reg.err.phone.agree":"Confirm that your number is visible.",
    "reg.err.wa":"Enter a valid WhatsApp number.","reg.err.phones":"Enter valid phones.",
    "reg.err.email":"Enter a valid email.","reg.err.password":"Password must be at least 8 characters.",
    "reg.err.terms":"You must accept the terms.",
    "login.title":"Log in","login.id":"Email or phone",
    "login.id.ph":"name@gmail.com or 0788123456","login.password":"Password",
    "login.submit":"Log in","login.working":"Logging you in…",
    "login.forgot":"Forgot password","login.orReg":"No account? Sign up",
    "login.err":"Email, phone or password is incorrect.","login.ok":"Logged in.",
    "logout.ok":"Logged out.","forgot.title":"Forgot password",
    "forgot.email":"Your email","forgot.submit":"Send",
    "forgot.sent":"If this email exists, we sent a link. Check inbox and spam.",
    "forgot.hint":"We will send a link to set a new password.",
    "forgot.already_sent":"You already have a working link in your email. Check Inbox and Spam. You can request another after 48 hours.",
    "reset.title":"New password","reset.new":"New password",
    "reset.submit":"Save","reset.ok":"Password saved. Log in.",
    "reset.err":"Link expired or invalid.",
    "restore.title":"Account pending deletion",
    "restore.body":"You asked to delete your account. It can be restored within 6 months. Restore it?",
    "restore.yes":"Yes, restore","restore.no":"No","restore.ok":"Account restored.",
    "account.title":"Your account","account.myProfile":"My profile",
    "account.edit":"Edit profile","account.password":"Change password",
    "account.delete":"Delete account",
    "account.deleteWarn":"Your account will be hidden. It can be restored within 6 months. After that, permanently deleted.",
    "account.currentPw":"Current password","account.newPw":"New password",
    "account.confirmPw":"Type your password to confirm",
    "account.logout":"Log out","account.logoutAll":"Log out everywhere","account.messages":"Messages","account.notifications":"Notifications","notif.empty":"No notifications.","notif.markRead":"Mark all read","msg.empty":"No messages.","msg.reply":"Reply","nav.notifications":"Notifications","verify.email":"Email not verified — verify now","verify.phone":"Phone not verified — verify now","verify.send":"Send","verify.code":"Code",
    "account.deleteOk":"Deletion requested",
    "account.deleteBody":"Your account is hidden. Within 6 months it can be restored. After that, permanently deleted.",
    "account.admin":"Admin",
    "saved.title":"Saved people","saved.empty":"No saved profiles. Tap \"Save\" on a profile.",
    "saved.removed":"Removed.","saved.ok":"Saved.",
    "report.title":"Report issue","report.choose":"Choose an issue",
    "report.r.wrong":"Wrong information","report.r.photo":"Wrong photo",
    "report.r.behavior":"Bad behaviour","report.r.other":"Other",
    "report.submit":"Submit","report.hint":"Goes to moderators.","report.ok":"Your report was received.",
    "help.title":"Help","help.search":"Search answer","help.search.ph":"Search answer",
    "help.ask":"Ask help","help.ask.ph":"e.g. How do I add a photo?",
    "help.send":"Ask","help.hint":"Answers come from approved content only.",
    "help.no":"No answer found. Try other words.",
"help.contact":"Contact us","help.contact.hint":"Didn't find what you need? Write to us.",
"help.contactForm.name":"Your name","help.contactForm.email":"Your email",
"help.contactForm.msg":"Your question","help.contactForm.submit":"Send",
"help.contactForm.ok":"Message sent. We'll reply soon.",
"help.cat.all":"All","help.cat.register":"Registration","help.cat.profile":"Profile",
"help.cat.search":"Search","help.cat.contact":"Contact","help.cat.safety":"Safety",
"about.title":"About AHABONA",
"about.intro":"AHABONA is a platform where people show what they can do, so those who need them can find and contact them.",
"about.why":"Many capable people are unknown except to those close to them. AHABONA makes them discoverable.",
"about.how":"Sign up, show what you can do and where you are, become visible, and people who need you reach out.",
"about.what":"Not a job board, and it does not certify skills. Verify the person you engage.",
"about.vision":"Our goal is that everyone finds work, and every employer finds a good worker.",
"about.stats.users":"Users","about.stats.profiles":"Profiles",
"about.stats.districts":"Districts","about.stats.jobs":"Jobs","about.contact":"Contact us",
"common.ok":"OK","common.cancel":"Cancel","common.close":"Close","common.back":"Back",
"common.next":"Continue","common.prev":"Previous","common.save":"Save","common.delete":"Delete",
"common.edit":"Edit","common.yes":"Yes","common.no":"No","common.retry":"Retry",
"common.loading":"Loading…","common.error":"Something went wrong","common.success":"Success",
"common.offline":"No internet","common.online":"Internet restored",
"common.confirm":"Are you sure?","common.or":"or","common.of":"of","common.new":"New",
"common.required":"Required","common.optional":"Optional",
"toast.langChanged":"Language changed.","toast.themeChanged":"Theme changed.",
"toast.saverOn":"Data saver on.","toast.saverOff":"Data saver off.",
"toast.copied":"Copied.","toast.shared":"Shared.",
"footer.copy":"© {{year}} AHABONA. All rights reserved.",
"footer.terms":"Terms","footer.privacy":"Privacy",
"err.server":"Server error. Please try again.","err.rate":"Too many requests. Wait a moment.",
"err.auth":"Please log in first.","hero.err.link":"The link must start with http:// or https://","hero.err.phone":"Invalid phone number.","staff.err.exists":"This person is already staff.","staff.err.self":"You cannot change your own permissions.","staff.err.lastsuper":"You cannot remove the last Super Admin.","staff.err.rank":"You cannot change this staff member.",
"err.forbidden":"Not allowed.","err.notfound":"Not found.",
"err.big":"Photo or data too large.","err.mail":"Could not send email.",
"err.blocklist":"This word is not allowed on AHABONA.","err.offline":"No internet.","val.soc":"Enter a valid link (https://...).","val.svc":"Choose a valid district.","val.svc5":"Choose up to 5 districts."
}
};
function t(lang,key,vars){
  const L=I18N[lang]?lang:'rw';
  let s=I18N[L][key]||I18N.rw[key]||key;
  if(vars)for(const k in vars)s=s.split('{{'+k+'}}').join(String(vars[k]));
  return s;
}
function normLang(x){return I18N[x]?x:'rw'}
const nz=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['\u2019]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const clean=(s,n)=>String(s==null?'':s).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const np=t=>String(t||'').replace(/[\s-]/g,'').replace(/^\+?250/,'0');
const EM=/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const MP=/^07[2389]\d{7}$/;
const URL_RE=/^https?:\/\/[^\s<>"']+$/i;
const PID_RE=/^[a-z0-9]{8,16}$/;
const SLUG_RE=/^[a-z0-9][a-z0-9-]{2,30}$/;
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ini=n=>String(n||'').split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase();

const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const unit=s=>crypto.createHash('sha1').update(s).digest().readUInt32BE(0)/4294967296;

const scrypt=(pw,salt)=>new Promise((res,rej)=>crypto.scrypt(pw,salt,64,{N:16384,r:8,p:1},(e,k)=>e?rej(e):res(k)));
async function hashPw(pw){const salt=crypto.randomBytes(16).toString('hex');return 'scrypt$'+salt+'$'+(await scrypt(pw,salt)).toString('hex')}
async function checkPw(pw,stored){const parts=String(stored||'').split('$');if(parts.length!==3)return false;const[t,salt,h]=parts;if(t!=='scrypt')return false;const k=await scrypt(pw,salt);const a=Buffer.from(h,'hex');return a.length===k.length&&crypto.timingSafeEqual(a,k)}

const lev1=(a,b)=>{
  if(a===b)return true;
  if(Math.abs(a.length-b.length)>1)return false;
  let i=0,j=0,d=0;
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){i++;j++;continue}
    if(++d>1)return false;
    if(a.length>b.length)i++;
    else if(a.length<b.length)j++;
    else{i++;j++}
  }
  return d+(a.length-i)+(b.length-j)<=1;
};

function isValidCalendarDate(bd){
  if(!bd||!DATE_RE.test(bd))return false;
  const parts=bd.split('-').map(Number);
  const y=parts[0],m=parts[1],d=parts[2];
  if(m<1||m>12||d<1||d>31||y<1900||y>2100)return false;
  const dt=new Date(Date.UTC(y,m-1,d));
  return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
}
function ageFromBirthdate(bd){
  if(!isValidCalendarDate(bd))return null;
  const parts=bd.split('-').map(Number);
  const y=parts[0],m=parts[1],d=parts[2];
  const now=new Date();
  let age=now.getFullYear()-y;
  const mo=now.getMonth()+1,dy=now.getDate();
  if(mo<m||(mo===m&&dy<d))age--;
  return age;
}

function containsBlocked(text){
  if(!text)return false;
  const norm=nz(text);
  const padded=' '+norm+' ';
  for(const w of BLOCKLIST){
    const wn=nz(w);
    if(!wn)continue;
    if(padded.includes(' '+wn+' '))return true;
  }
  return false;
}

const _compCache=new Map();
const _COMP_MIN=512;
const _COMP_MAX=200;
function _pickEnc(req){
  const a=String(req.headers['accept-encoding']||'').toLowerCase();
  if(a.includes('br'))return 'br';
  if(a.includes('gzip'))return 'gzip';
  return null;
}
function _compressBody(buf,enc){
  if(!enc||buf.length<_COMP_MIN)return buf;
  if(buf.length>=4){
    const b0=buf[0],b1=buf[1],b2=buf[2],b3=buf[3];
    if((b0===0xff&&b1===0xd8)||(b0===0x89&&b1===0x50&&b2===0x4e&&b3===0x47)||(b0===0x47&&b1===0x49&&b2===0x46)||(b0===0x52&&b1===0x49&&b2===0x46&&b3===0x46)||(b0===0x77&&b1===0x4f&&b2===0x46&&b3===0x32))return buf;
  }
  const k=enc+'|'+buf.length+'|'+crypto.createHash('sha1').update(buf).digest('hex');
  const hit=_compCache.get(k);
  if(hit)return hit;
  let o;
  try{
    if(enc==='br')o=zlib.brotliCompressSync(buf,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:4}});
    else o=zlib.gzipSync(buf,{level:6});
  }catch(e){return buf}
  if(_compCache.size>=_COMP_MAX)_compCache.delete(_compCache.keys().next().value);
  _compCache.set(k,o);
  return o;
}
function _etagOf(buf){return '"'+crypto.createHash('sha1').update(buf).digest('hex').slice(0,20)+'"'}

const SCHEMA=`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  pw TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  deleted_at INTEGER,
  terms_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS profiles(
  user_id INTEGER PRIMARY KEY,
  pid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  caps TEXT NOT NULL,
  other_text TEXT,
  intro TEXT,
  edu TEXT,
  soc TEXT,
  wa TEXT,
  phone_visible INTEGER NOT NULL DEFAULT 1,
  phones TEXT NOT NULL DEFAULT '[]',
  svc TEXT NOT NULL DEFAULT '[]',
  nphotos INTEGER NOT NULL DEFAULT 0,
  suspended INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS capabilities(
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  aliases TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS cap_requests(
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions(
  th TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS saved(
  user_id INTEGER NOT NULL,
  pid TEXT NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY(user_id,pid)
);
CREATE TABLE IF NOT EXISTS reports(
  id INTEGER PRIMARY KEY,
  pid TEXT NOT NULL,
  reporter INTEGER,
  reason TEXT NOT NULL,
  detail TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS devices(
  id TEXT PRIMARY KEY,
  seed TEXT NOT NULL,
  epoch INTEGER NOT NULL DEFAULT 0,
  last_active INTEGER NOT NULL,
  snapshot_at INTEGER,
  snapshot TEXT,
  current TEXT
);
CREATE TABLE IF NOT EXISTS exposure(
  device TEXT NOT NULL,
  pid TEXT NOT NULL,
  seen INTEGER NOT NULL DEFAULT 0,
  last_seen INTEGER,
  PRIMARY KEY(device,pid)
);
CREATE TABLE IF NOT EXISTS stats(
  pid TEXT PRIMARY KEY,
  impressions INTEGER NOT NULL DEFAULT 0,
  opens INTEGER NOT NULL DEFAULT 0,
  contacts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS intent(
  device TEXT NOT NULL,
  key TEXT NOT NULL,
  score REAL NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY(device,key)
);
CREATE TABLE IF NOT EXISTS resets(
  th TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY,
  admin INTEGER,
  action TEXT,
  target TEXT,
  at INTEGER
);
CREATE TABLE IF NOT EXISTS search_log(
  id INTEGER PRIMARY KEY,
  q TEXT,
  district TEXT,
  n INTEGER,
  at INTEGER
);
`;

/* ===== END OF IGICE 3/16 ===== */const SCHEMA_V2_TABLES=`
CREATE TABLE IF NOT EXISTS site_settings(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_logs(
  id INTEGER PRIMARY KEY,
  admin_id INTEGER,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  ip TEXT,
  at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY,
  from_id INTEGER,
  to_id INTEGER NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  title TEXT,
  body TEXT,
  link TEXT,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS email_verifications(
  th TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  expires INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS phone_verifications(
  th TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS verifications(
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at INTEGER NOT NULL,
  decided_at INTEGER,
  decided_by INTEGER
);
CREATE TABLE IF NOT EXISTS strip_ads(
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'about',
  action_value TEXT,
  kind TEXT DEFAULT 'announcement',
  active INTEGER NOT NULL DEFAULT 1,
  start_at INTEGER,
  end_at INTEGER,
  priority INTEGER DEFAULT 0,
  paid_amount INTEGER DEFAULT 0,
  paid_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS help_faq(
  id INTEGER PRIMARY KEY,
  q TEXT NOT NULL,
  a TEXT NOT NULL,
  terms TEXT,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS help_messages(
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
`;

function addColumn(db,table,col,def){
  try{db.exec('ALTER TABLE '+table+' ADD COLUMN '+col+' '+def)}catch(e){}
}

function migrate(db){
  const A=(t,c,d)=>addColumn(db,t,c,d);
  A('devices','snapshot_at','INTEGER');
  A('users','lang',"TEXT DEFAULT 'rw'");
  A('users','email_verified',"INTEGER DEFAULT 0");
  A('users','phone_verified',"INTEGER DEFAULT 0");
  A('users','id_verified',"INTEGER DEFAULT 0");
  A('users','last_seen',"INTEGER");
  A('users','flagged',"INTEGER DEFAULT 0");
  A('users','national_id',"TEXT");
  A('users','role_level',"TEXT DEFAULT 'user'");
  A('users','perms',"TEXT");
  A('users','display_name',"TEXT");
  A('users','admin_deleted',"INTEGER DEFAULT 0");
  A('profiles','experience',"TEXT DEFAULT '[]'");
  A('profiles','languages',"TEXT DEFAULT '[]'");
  A('profiles','availability',"TEXT DEFAULT '[]'");
  A('profiles','portfolio',"TEXT DEFAULT '[]'");
  A('profiles','rating_sum',"INTEGER DEFAULT 0");
  A('profiles','rating_count',"INTEGER DEFAULT 0");
  A('profiles','birthdate',"TEXT");
  A('profiles','gender',"TEXT");
  A('profiles','edu_level',"TEXT");
  A('profiles','email_public',"TEXT");
  A('profiles','facebook',"TEXT");
  A('profiles','instagram',"TEXT");
  A('profiles','tiktok',"TEXT");
  A('profiles','linkedin',"TEXT");
  A('profiles','telegram',"TEXT");
  A('profiles','twitter',"TEXT");
  A('capabilities','name_en',"TEXT");
  A('capabilities','sort_order',"INTEGER DEFAULT 0");
  A('sessions','ua',"TEXT");
  A('sessions','ip',"TEXT");
  A('sessions','created_at',"INTEGER");
  A('audit','details',"TEXT");
  A('audit','ip',"TEXT");
  A('cap_requests','decided_at',"INTEGER");
  A('cap_requests','decided_by',"INTEGER");
  A('reports','decided_at',"INTEGER");
  A('reports','decided_by',"INTEGER");
  A('strip_ads','title',"TEXT");
  A('strip_ads','title_en',"TEXT");
  A('strip_ads','text_en',"TEXT");
  A('strip_ads','cta',"TEXT");
  A('strip_ads','cta_en',"TEXT");
  A('strip_ads','theme',"TEXT");
  A('strip_ads','media_type',"TEXT DEFAULT 'text'");
  A('strip_ads','video_url',"TEXT");
  A('strip_ads','image_url',"TEXT");
  A('strip_ads','video_proc',"INTEGER");
  A('strip_ads','video_codec',"TEXT");
  A('help_faq','lang',"TEXT DEFAULT 'rw'");
  try{db.exec("UPDATE help_faq SET lang='rw' WHERE lang IS NULL OR lang=''")}catch(e){}
}

function seedCapabilities(db){
  const n=db.prepare('SELECT COUNT(*) n FROM capabilities').get().n;
  if(n>0){
    try{
      const rows=db.prepare('SELECT id,name,name_en FROM capabilities').all();
      const upd=db.prepare('UPDATE capabilities SET name_en=? WHERE id=?');
      for(const r of rows){
        if(!r.name_en && CAP_EN[r.name])upd.run(CAP_EN[r.name],r.id);
      }
    }catch(e){}
    return;
  }
  const ins=db.prepare('INSERT INTO capabilities(name,category,aliases,name_en) VALUES(?,?,?,?)');
  for(const cat in TAX){
    for(const name of TAX[cat]){
      ins.run(name,cat,JSON.stringify(ALIAS[name]||[]),CAP_EN[name]||null);
    }
  }
}

function seedStrip(db,now){
  const n=db.prepare('SELECT COUNT(*) n FROM strip_ads').get().n;
  if(n>0)return;
  const defaults=[
    {t:'Ushaka umushoferi?',a:'search',v:'umushoferi'},
    {t:'Ushaka umukozi wo mu rugo?',a:'search',v:'umukozi wo mu rugo'},
    {t:'Ushaka umubaji?',a:'search',v:'umubaji'},
    {t:'Ushaka umukanishi?',a:'search',v:'umukanishi'},
    {t:'Ushaka umudozi?',a:'search',v:'umudozi'},
    {t:'Shaka uwo ukeneye.',a:'focus',v:''},
    {t:'Ufite icyo ushoboye?',a:'register',v:''},
    {t:'Ushaka kwiyandikisha?',a:'register',v:''},
    {t:'Ukeneye ubufasha?',a:'help',v:''},
    {t:'Menya AHABONA.',a:'about',v:''}
  ];
  const ins=db.prepare('INSERT INTO strip_ads(text,action_type,action_value,kind,active,created_at) VALUES(?,?,?,?,1,?)');
  for(const d of defaults)ins.run(d.t,d.a,d.v,'tip',now);
}

function seedHero(db,now){
  const done=db.prepare("SELECT 1 FROM site_settings WHERE key='hero_v2'").get();
  if(done)return;
  db.prepare("UPDATE strip_ads SET active=0 WHERE kind='tip' AND title IS NULL").run();
  const ins=db.prepare('INSERT INTO strip_ads(text,title,text_en,title_en,cta,cta_en,theme,action_type,action_value,kind,active,priority,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?)');
  const slides=[
    ['Gushaka umukozi no kwiyandikisha ntibyishyurwa. Nta kwishyura na gato ubu.','Ubuntu 100%','Finding a worker and signing up cost nothing. No fees at all right now.','100% free','Iyandikishe ku buntu','Sign up free','ijoro','register','','info',40],
    ['Ubonwe n’abakeneye umukozi mu karere kawe. Kwiyandikisha ni ubuntu.','Ufite icyo ushoboye?','Be found by people who need a worker near you. Signing up is free.','Got a skill?','Iyandikishe','Sign up','izuba','register','','tip',30],
    ['Shakisha umushoferi, umubaji, umudozi n’abandi. Gushaka ni ubuntu.','Ukeneye umukozi?','Find drivers, carpenters, tailors and more. Searching is free.','Need a worker?','Shaka ubu','Search now','ibendera','focus','','tip',20],
    ['AHABONA ntaka amafaranga yo kukwandika. Niba hari ubigusaba, ubitumenyeshe.','Ntukishyure mbere','AHABONA never charges to register you. If anyone asks you to pay, tell us.','Never pay upfront','Ubufasha','Help','nyungwe','help','','info',10]
  ];
  for(const x of slides)ins.run(x[0],x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[9],x[10],now);
  db.prepare('INSERT INTO site_settings(key,value,updated_at) VALUES(?,?,?)').run('hero_v2','1',now);
}

function seedHelp(db,now){
  const n=db.prepare('SELECT COUNT(*) n FROM help_faq').get().n;
  const items=[
    ['Niyandikisha nte?','Kanda Iyandikishe. Uzuza intambwe 6: Abo uri bo, Umwirondoro, Icyo ushoboye, Uburyo bwo kukugeraho, Konti yawe, hanyuma wemere amabwiriza.','iyandikishe kwiyandikisha konti register','register'],
    ['Nshyiraho nte ibyo nshoboye?','Hitamo mu rutonde kugeza ku bintu 3. Niba icyo ushoboye kitari mu rutonde, hitamo Undi murimo; uzasuzumwa mbere yo kugaragara.','ubushobozi umurimo capability skills 3','profile'],
    ['Nshyiraho amafoto angahe?','Ifoto ni ihitamo. Ushobora gushyiraho amafoto atarenze 3; agabanywa mbere yo koherezwa.','ifoto amafoto photo photos','profile'],
    ['Nshyiraho telefoni zingahe?','Ushobora kugira telefoni kugeza kuri 5: imwe y\'ingenzi n\'izindi enye.','telefoni nimero phone numbers','profile'],
    ['Abantu bambona bate?','Bashakisha icyo ushoboye cyangwa aho uri. Iyo nta wubonetse mu karere, berekwa abo mu turere duturanye hanyuma abo mu Rwanda.','kubona gushakisha search discovery','search'],
    ['Mpindura nte umwirondoro?','Injira, ufungure Umwirondoro, ukande Hindura umwirondoro.','guhindura edit','profile'],
    ['Mvugana n\'umuntu nte?','Fungura umwirondoro we, ukande Hamagara, cyangwa WhatsApp iyo ihari.','hamagara whatsapp vugana contact','contact'],
    ['Bika ni iki?','Bika ni ukubika umuntu kugira ngo uzamusubireho. Ubona abo wabitse muri menu.','bika saved','profile'],
    ['Namenyesha nte ikibazo?','Fungura umwirondoro, ukande Menyesha ikibazo, uhitemo icyo kibazo, wemeze.','menyesha rapora report','safety'],
    ['Nibagiwe ijambobanga, nkora iki?','Kanda Injira, hanyuma Nibagiwe ijambobanga, wandike email yawe.','ijambobanga password nibagiwe reset','register'],
    ['Nshaka gusiba konti, nkora iki?','Mu Umwirondoro, kanda Igenamiterere, hanyuma Siba konti. Ihita ihishwa, imara amezi 6 ishobora gusubizwa.','siba delete konti gusiba','profile'],
    ['AHABONA ni urubuga rwo gutangaza akazi?','Oya. AHABONA ni urubuga rwo kugaragaza abantu n\'ubushobozi bwabo.','akazi job umukoresha','general'],
    ['Nakora iki ngira ngo nirinde?','Ntukishyure mbere yo kubona umuntu, uhurire n\'umuntu ahantu hari abandi.','umutekano safety kwirinda','safety'],
    ['Nshobora kuba admin?','Oya, admin ni umuyobozi w\'urubuga. Abakoresha basanzwe ntibabasha kuba admin.','admin ubuyobozi','general'],
    ['Ese AHABONA isaba nimero y\'irangamuntu?','Oya. Kuri ubu AHABONA ntisaba nimero y\'irangamuntu mu kwiyandikisha.','irangamuntu national id','safety']
  ];
  const ins=db.prepare('INSERT INTO help_faq(q,a,terms,category,sort_order,active,created_at,lang) VALUES(?,?,?,?,?,1,?,?)');
  if(n===0){
    items.forEach((x,i)=>ins.run(x[0],x[1],x[2],x[3],i,now,'rw'));
  }
  const itemsEn=[
    ['How do I sign up?','Tap Sign up. Complete 6 steps: Who you are, Profile, What you can do, How to reach you, Your account, then accept the terms.','register signup account','register'],
    ['How do I add my skills?','Choose up to 3 from the list. If your skill is missing, pick Other job; it will be reviewed before showing.','skills capability jobs 3','profile'],
    ['How many photos can I add?','A photo is optional. You can add up to 3 photos; they are compressed before upload.','photo photos','profile'],
    ['How many phone numbers?','You can have up to 5: one primary and four more.','phone numbers','profile'],
    ['How do people find me?','They search by skill or location. If none nearby, nearby districts then Rwanda-wide results appear.','search discovery','search'],
    ['How do I edit my profile?','Log in, open Profile, tap Edit profile.','edit','profile'],
    ['How do I contact someone?','Open their profile, tap Call, or WhatsApp if available.','call whatsapp contact','contact'],
    ['What is Save?','Save stores a person so you can return later. Find saved people in the menu.','save saved','profile'],
    ['How do I report a problem?','Open the profile, tap Report issue, choose the issue, submit.','report','safety'],
    ['I forgot my password','Tap Log in, then Forgot password, enter your email.','password reset forgot','register'],
    ['How do I delete my account?','In Profile, Settings, then Delete account. It is hidden immediately and can be restored within 6 months.','delete account','profile'],
    ['Is AHABONA a job board?','No. AHABONA shows people and their skills.','job employer','general'],
    ['How do I stay safe?','Do not pay before meeting, meet in public places.','safety','safety'],
    ['Can I become admin?','No. Admin is for platform operators only.','admin','general'],
    ['Does AHABONA ask for a National ID number?','No. AHABONA does not currently ask for a National ID number during registration.','national id','safety']
  ];
  const nEn=db.prepare("SELECT COUNT(*) n FROM help_faq WHERE lang='en'").get().n;
  if(nEn===0){
    itemsEn.forEach((x,i)=>ins.run(x[0],x[1],x[2],x[3],i,now,'en'));
  }
  try{db.prepare("UPDATE help_faq SET a=? WHERE q=?").run('Ifoto ni ihitamo. Ushobora gushyiraho amafoto atarenze 3; agabanywa mbere yo koherezwa.','Nshyiraho amafoto angahe?')}catch(e){}
  try{db.prepare("UPDATE help_faq SET a=? WHERE q=?").run('A photo is optional. You can add up to 3 photos; they are compressed before upload.','How many photos can I add?')}catch(e){}
  try{db.prepare("UPDATE help_faq SET q=?,a=?,terms=? WHERE q=?").run('Ese AHABONA isaba nimero y\'irangamuntu?','Oya. Kuri ubu AHABONA ntisaba nimero y\'irangamuntu mu kwiyandikisha.','national ID identity','Kuki nimero y\'irangamuntu isabwa?')}catch(e){}
  try{db.prepare("UPDATE help_faq SET q=?,a=?,terms=? WHERE q=?").run('Does AHABONA ask for a National ID number?','No. AHABONA does not currently ask for a National ID number during registration.','national ID identity','Why is National ID requested?')}catch(e){}
}

const JPG_RE=/^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/;
function parseJpeg(s,max){
  const m=JPG_RE.exec(String(s||''));
  if(!m)return null;
  let b;
  try{b=Buffer.from(m[1],'base64')}catch(e){return null}
  if(b.length<100)return null;
  const lim=max||900*1024;
  if(b.length>lim)return null;
  if(b[0]!==0xff||b[1]!==0xd8)return null;
  return b;
}



function parseVideoB64(s){
  if(typeof s!=='string'||s.length<32)return null;
  const m=s.match(/^data:video\/[a-z0-9.+-]+;base64,(.+)$/i);
  const b64=m?m[1]:((s.indexOf('base64,')>=0)?s.split('base64,').pop():s);
  try{
    const buf=Buffer.from(b64,'base64');
    if(buf.length<100||buf.length>64*1024*1024)return null;
    return buf;
  }catch(e){return null}
}
function makeMediaStore(dataDir){
  const dir=path.join(dataDir,'media');
  fs.mkdirSync(dir,{recursive:true});
  function pathOf(name){return path.join(dir,name)}
  function read(name){
    try{return fs.readFileSync(pathOf(name))}catch(e){return null}
  }
  function remove(name){
    try{fs.unlinkSync(pathOf(name))}catch(e){}
  }
  function saveStripVideo(id,buf){
    /* Sniff raw codec to decide the correct extension when ffmpeg is unavailable */
    var sniff='';
    try{
      if(buf[0]===0x1A&&buf[1]===0x45&&buf[2]===0xDF&&buf[3]===0xA3)sniff='webm';
      else if(buf[0]===0x52&&buf[1]===0x49&&buf[2]===0x46&&buf[3]===0x46&&buf.toString('latin1',8,12)==='AVI ')sniff='avi';
      else if(buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70){
        var brand=buf.toString('latin1',8,12);
        if(brand==='heic'||brand==='heix'||brand==='avif'||brand==='avis')sniff='bad';
        else sniff='mp4';
      }
    }catch(e){}
    if(sniff==='bad')return Promise.resolve({ok:false,error:'Fayile ntabwo ari video (koresha mp4)'});
    var rawExt=sniff==='webm'?'webm':(sniff==='avi'?'avi':'mp4');
    var rawName='strip-'+id+'.'+rawExt;
    try{
      ['mp4','webm','avi'].forEach(function(x){try{fs.unlinkSync(pathOf('strip-'+id+'.'+x))}catch(e){}});
      fs.writeFileSync(pathOf(rawName),buf);
    }catch(e){return Promise.resolve({ok:false,error:'err.server'})}
    var out='strip-'+id+'.mp4';
    return new Promise(function(resolve){
      execFile('ffmpeg',['-y','-i',pathOf(rawName),'-t','30','-vf',"scale='trunc(min(1280,iw)/2)*2':-2",'-c:v','libx264','-pix_fmt','yuv420p','-preset','veryfast','-crf','28','-an','-movflags','+faststart',pathOf(out)+'.tmp.mp4'],{timeout:240000},function(err){
        if(!err){
          try{
            fs.renameSync(pathOf(out)+'.tmp.mp4',pathOf(out));
            if(rawName!==out)try{fs.unlinkSync(pathOf(rawName))}catch(e){}
            return resolve({ok:true,path:out,processed:true,codec:'h264'});
          }catch(e){}
        }
        try{fs.unlinkSync(pathOf(out)+'.tmp.mp4')}catch(e){}
        /* ffmpeg missing or failed: keep original bytes with the correct extension */
        resolve({ok:true,path:rawName,processed:false,codec:sniff||''});
      });
    });
  }
  function saveStripImage(id,buf,ext){
    const e=(ext==='png'||ext==='webp')?ext:'jpg';
    const out='strip-'+id+'.'+e;
    try{
      ['jpg','png','webp'].forEach(function(x){if(x!==e)remove('strip-'+id+'.'+x)});
      fs.writeFileSync(pathOf(out)+'.tmp',buf);
      fs.renameSync(pathOf(out)+'.tmp',pathOf(out));
    }catch(err){
      try{fs.unlinkSync(pathOf(out)+'.tmp')}catch(e2){}
      return {ok:false,error:'err.server'};
    }
    return {ok:true,path:out};
  }
  return {read,remove,saveStripVideo,saveStripImage,dir,pathOf};
}

function makePhotoStore(dataDir){
  const dir=path.join(dataDir,'photos');
  fs.mkdirSync(dir,{recursive:true});
  const pdir=f=>path.join(dir,f);
  function save(pid,photosArr,thumb){
    if(photosArr==null)photosArr=[];
    if(!Array.isArray(photosArr)||photosArr.length>MAXP){
      return {ok:false,error:'reg.err.photo'};
    }
    if(photosArr.length===0){
      remove(pid);
      return {ok:true,count:0};
    }
    const bufs=[];
    for(const p of photosArr){
      const b=parseJpeg(p,900*1024);
      if(!b)return {ok:false,error:'reg.err.photo'};
      bufs.push(b);
    }
    const t=thumb?parseJpeg(thumb,120*1024):(bufs[0]||null);
    if(!t)return {ok:false,error:'reg.err.photo'};
    const tmps=[];
    try{
      bufs.forEach((b,i)=>{
        const tmp=pdir(pid+'-'+i+'.jpg.tmp');
        fs.writeFileSync(tmp,b);
        tmps.push(tmp);
      });
      const ttmp=pdir(pid+'-t.jpg.tmp');
      fs.writeFileSync(ttmp,t);
      tmps.push(ttmp);
      for(let i=0;i<6;i++){
        const final=pdir(pid+'-'+i+'.jpg');
        if(i<bufs.length)fs.renameSync(pdir(pid+'-'+i+'.jpg.tmp'),final);
        else{try{fs.unlinkSync(final)}catch(e){}}
      }
      fs.renameSync(pdir(pid+'-t.jpg.tmp'),pdir(pid+'-t.jpg'));
    }catch(e){
      tmps.forEach(f=>{try{fs.unlinkSync(f)}catch(e2){}});
      return {ok:false,error:'reg.err.photo'};
    }
    return {ok:true,count:bufs.length};
  }
  function remove(pid){
    for(let i=0;i<6;i++){try{fs.unlinkSync(pdir(pid+'-'+i+'.jpg'))}catch(e){}}
    try{fs.unlinkSync(pdir(pid+'-t.jpg'))}catch(e){}
  }
  function read(name){
    try{return fs.readFileSync(pdir(name))}catch(e){return null}
  }
  return {save,remove,read,dir};
}

function validateProfile(b,opts){
  opts=opts||{};
  const creating=!!opts.creating;
  const primary=opts.primary||'';
  const f={};
  let err=null;
  const bad=(field,msg)=>{if(!err)err={field,msg}};
  f.name=clean(b.name,60);
  if(f.name.length<3)bad('name','reg.err.name');
  f.birthdate=clean(b.birthdate,10);
  if(f.birthdate&&!isValidCalendarDate(f.birthdate))bad('birthdate','reg.err.birthdate');
  if(f.birthdate&&DATE_RE.test(f.birthdate)){
    if(!isValidCalendarDate(f.birthdate))bad('birthdate','reg.err.birthdate');
    else{
      const a=ageFromBirthdate(f.birthdate);
      if(a===null||a<MIN_AGE||a>MAX_AGE)bad('birthdate','reg.err.age');
    }
  }
  f.gender=clean(b.gender,1);
  if(f.gender&&!['f','m','n','o'].includes(f.gender))bad('gender','reg.err.gender');
  f.district=clean(b.district,40);
  if(!DIST.includes(f.district))bad('district','reg.err.district');
  const jobs=Array.isArray(b.jobs)?[...new Set(b.jobs.map(x=>clean(x,80)))]:[];
  f.other=clean(b.other,40);
  f.caps=jobs.map(n=>(caps.find(c=>c.name===n)||{}).id);
  if(f.caps.some(x=>!x))bad('jobs','reg.err.jobs');
  if(f.caps.length+(f.other?1:0)<1)bad('jobs','reg.err.jobs');
  if(f.caps.length+(f.other?1:0)>MAXCAPS)bad('jobs','reg.err.jobs3');
  if(f.other&&f.other.length<3)bad('other','reg.err.other');
  f.intro=clean(b.intro,80);
  f.edu=clean(b.edu,40);
  f.soc=clean(b.soc,200);
  if(f.soc&&!URL_RE.test(f.soc))bad('soc','val.soc');
  function validSocial(s){
    if(!s)return true;
    if(/^https?:\/\//i.test(s))return URL_RE.test(s)&&!/^javascript:/i.test(s)&&!/^data:/i.test(s);
    if(/^javascript:/i.test(s)||/^data:/i.test(s))return false;
    return /^[a-z0-9._-]{1,60}$/i.test(s);
  }
  f.email_public=clean(b.email_public,200).toLowerCase();
  if(f.email_public&&!EM.test(f.email_public))bad('email_public','reg.err.email');
  f.facebook=clean(b.facebook,200);
  if(f.facebook&&f.facebook.charAt(0)==='@')f.facebook=f.facebook.slice(1);
  if(f.facebook&&!validSocial(f.facebook))bad('facebook','val.soc');
  f.instagram=clean(b.instagram,200);
  if(f.instagram&&f.instagram.charAt(0)==='@')f.instagram=f.instagram.slice(1);
  if(f.instagram&&!validSocial(f.instagram))bad('instagram','val.soc');
  f.tiktok=clean(b.tiktok,200);
  if(f.tiktok&&f.tiktok.charAt(0)==='@')f.tiktok=f.tiktok.slice(1);
  if(f.tiktok&&!validSocial(f.tiktok))bad('tiktok','val.soc');
  f.linkedin=clean(b.linkedin,200);
  if(f.linkedin&&f.linkedin.charAt(0)==='@')f.linkedin=f.linkedin.slice(1);
  if(f.linkedin&&!validSocial(f.linkedin))bad('linkedin','val.soc');
  f.telegram=clean(b.telegram,200);
  if(f.telegram&&f.telegram.charAt(0)==='@')f.telegram=f.telegram.slice(1);
  if(f.telegram&&!validSocial(f.telegram))bad('telegram','val.soc');
  f.twitter=clean(b.twitter,200);
  if(f.twitter&&f.twitter.charAt(0)==='@')f.twitter=f.twitter.slice(1);
  if(f.twitter&&!validSocial(f.twitter))bad('twitter','val.soc');
  f.wa=b.wa?np(b.wa):'';
  if(f.wa&&!MP.test(f.wa))bad('wa','reg.err.wa');
  const pm=creating?np(b.phone):primary;
  f.phones=[...new Set((Array.isArray(b.phones)?b.phones:[]).map(np).filter(Boolean))].filter(x=>x!==pm);
  if(f.phones.some(x=>!MP.test(x)))bad('phones','reg.err.phones');
  if(f.phones.length+1>MAXPH)bad('phones','reg.err.phones');
  f.svc=[...new Set((Array.isArray(b.svc)?b.svc:[]).map(x=>clean(x,40)))];
  if(f.svc.some(x=>!DIST.includes(x)))bad('svc','val.svc');
  if(f.svc.length>MAXSVC)bad('svc','val.svc5');
  const phoneConsent=b.phone_visible===true||b.phone_visible===1||b.phone_visible==='1'||b.phone_visible==='true';
  f.phone_visible=creating?1:b.phone_visible===undefined||b.phone_visible===null?(creating?0:null):(phoneConsent?1:0);
  /* phone_visible optional */;
  f.languages=[...new Set((Array.isArray(b.languages)?b.languages:[]).map(x=>clean(x,3)).filter(x=>['rw','en','fr','sw'].includes(x)))];
  f.availability=[...new Set((Array.isArray(b.availability)?b.availability:[]).map(x=>clean(x,20)))].slice(0,6);
  f.experience=clean(b.experience,500);
  if(creating){
    f.phone=np(b.phone);
    if(!MP.test(f.phone))bad('phone','reg.err.phone');
    f.email=clean(b.email,254).toLowerCase();
    if(!EM.test(f.email))bad('email','reg.err.email');
    if(typeof b.password!=='string'||b.password.length<8||b.password.length>200)bad('password','reg.err.password');
    if(b.terms!==true)bad('terms','reg.err.terms');
  }
  if(!err){
    const blob=[f.name,f.intro,f.other,f.edu].filter(Boolean).join(' ');
    if(containsBlocked(blob))err={field:'name',msg:'err.blocklist'};
  }
  return {f,err};
}

/* ===== END OF IGICE 4/16 ===== */function pubProfile(p,u,opt){
  opt=opt||{};
  const ids=JSON.parse(p.caps||'[]');
  const names=ids.map(capName).filter(Boolean);
  const pend=!!p.other_text;
  const tot=names.length+(pend&&names.length?1:0);
  const cap=(names[0]||(pend?'Andi mahitamo (itegereje kwemezwa)':''))+(tot>1?' +'+(tot-1):'');
  const v=p.updated_at;
  const age=ageFromBirthdate(p.birthdate);
  const o2={
    pid:p.pid,
    name:p.name,
    district:p.district,
    province:provOf(p.district),
    cap:cap,
    caps:names,
    pending:pend,
    intro:p.intro||'',
    edu:p.edu||'',
    edu_level:p.edu_level||'',
    soc:p.soc||'',
    email_public:p.email_public||'',
    facebook:p.facebook||'',
    instagram:p.instagram||'',
    tiktok:p.tiktok||'',
    linkedin:p.linkedin||'',
    telegram:p.telegram||'',
    twitter:p.twitter||'',
    wa:p.wa||'',
    phone:(p.phone_visible||opt.own)?(p.phone||''):'',
    photos:Array.from({length:p.nphotos},(_,i)=>'/photos/'+p.pid+'-'+i+'.jpg?v='+v),
    thumb:'/photos/'+p.pid+'-t.jpg?v='+v,
    fresh:Date.now()-p.updated_at<FRESH_MS,
    svc:JSON.parse(p.svc||'[]'),
    phones:(p.phone_visible||opt.own)?JSON.parse(p.phones||'[]'):[],
    experience:(function(){try{return p.experience?JSON.parse(p.experience):[]}catch(e){return []}})(),
    languages:(function(){try{return p.languages?JSON.parse(p.languages):[]}catch(e){return []}})(),
    availability:(function(){try{return p.availability?JSON.parse(p.availability):[]}catch(e){return []}})(),
    gender:opt.own?(p.gender||''):'',
    rating_sum:p.rating_sum||0,
    rating_count:p.rating_count||0,
    verified:!!p.owner_verified,
    cap_en:(function(){const ids2=JSON.parse(p.caps||'[]');const n2=ids2.map(function(id){const c=caps.find(function(x){return x.id===id});return c?(c.name_en||CAP_EN[c.name]||c.name):null}).filter(Boolean);const pend2=!!p.other_text;const tot2=n2.length+(pend2&&n2.length?1:0);return (n2[0]||(pend2?'Other (pending)':''))+(tot2>1?' +'+(tot2-1):'');})(),
    caps_en:(function(){try{return JSON.parse(p.caps||'[]').map(function(id){const c=caps.find(function(x){return x.id===id});return c?(c.name_en||CAP_EN[c.name]||c.name):null}).filter(Boolean)}catch(e){return []}})(),
    province_en:PROV_EN[provOf(p.district)]||provOf(p.district),
  };
  if(u&&p.user_id===u.id)o2.mine=true;
  if(opt.saved)o2.saved=opt.saved.has(p.pid);
  if(opt.own){
    o2.me=true;
    o2.phone_visible=!!p.phone_visible;
    o2.other=p.other_text||'';
    o2.email=opt.email||'';
    o2.status=opt.status||'active';
    o2.birthdate=p.birthdate||'';
    o2.age=age||null;
    o2.gender=p.gender||'';
  }
  return o2;
}

const profRow=(w,...a)=>Q('SELECT p.*,u.phone,u.email,u.status,u.national_id,u.id_verified,u.id_verified AS owner_verified FROM profiles p JOIN users u ON u.id=p.user_id WHERE '+w).get(...a);

const savedSet=u=>u?new Set(Q('SELECT pid FROM saved WHERE user_id=?').all(u.id).map(x=>x.pid)):null;

function intentMap(dv){
  const m=new Map();
  if(!dv)return m;
  const t=Date.now();
  for(const r of Q('SELECT * FROM intent WHERE device=?').all(dv)){
    m.set(r.key,r.score*Math.pow(0.8,(t-r.at)/DAY));
  }
  return m;
}

const lvl=x=>x>=5?1:x>=3?0.8:x>=2?0.5:x>=1?0.25:0;

function bump(dv,key,add){
  if(!dv)return;
  const m=intentMap(dv);
  const cur=m.get(key)||0;
  Q('INSERT INTO intent VALUES(?,?,?,?) ON CONFLICT(device,key) DO UPDATE SET score=?,at=?')
    .run(dv,key,cur+add,Date.now(),cur+add,Date.now());
}

const capsFor=qn=>{
  if(!qn)return [];
  const padded=' '+qn+' ';
  const toks=qn.split(' ');
  return caps.filter(c=>c.forms.some(f=>{
    if(padded.includes(' '+f+' '))return true;
    if(!f.includes(' ')&&f.length>=5&&toks.some(t=>t.length>=5&&lev1(t,f)))return true;
    return false;
  })).map(c=>c.id);
};

const nameHit=(qn,name)=>{
  if(qn.length<3)return false;
  if(nz(name).includes(qn))return true;
  return qn.split(' ').every(t=>t.length>=3&&nz(name).split(' ').some(w=>w.startsWith(t)||(t.length>=5&&lev1(t,w))));
};

function rank(opts){
  const q=opts.q;
  const prov=opts.prov;
  const dist=opts.dist;
  const dv=opts.dv;
  const epoch=opts.epoch||0;
  const limit=opts.limit||60;
  const qn=nz(q);
  const qc=capsFor(qn);
  const im=intentMap(dv);
  let pool=Q("SELECT p.*,u.phone,u.id_verified AS owner_verified FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.status='active' AND p.suspended=0").all()
    .map(p=>({...p,ids:JSON.parse(p.caps),sv:JSON.parse(p.svc||'[]')}));
  const ex=new Map(dv?Q('SELECT pid,seen FROM exposure WHERE device=?').all(dv).map(r=>[r.pid,r.seen]):[]);
  const st=new Map(Q('SELECT pid,impressions i FROM stats').all().map(r=>[r.pid,r.i]));
  for(const p of pool){
    if(qn){
      p.band=p.ids.some(i=>qc.includes(i))?2:(nameHit(qn,p.name)?1:0);
      p.r=p.band===2?1:p.band===1?0.6:0;
    }else{
      p.band=2;
      const interest=Math.max(0,
        ...p.ids.map(i=>lvl(im.get('cap:'+i)||0)),
        lvl(im.get('loc:'+p.district)||0)
      );
      p.r=0.4+0.6*interest;
    }
  }
  if(qn)pool=pool.filter(p=>p.band>0);
  const region=dist||prov;
  const provs=p=>[p.district,...p.sv].map(provOf);
  const tierOf=p=>dist
    ?(p.district===dist||p.sv.includes(dist)?0:provs(p).includes(provOf(dist))?1:2)
    :prov?(provs(p).includes(prov)?0:2):0;
  pool.forEach(p=>{p.tier=tierOf(p)});
  const MIN=6;
  const cnt=t=>pool.filter(p=>p.tier===t).length;
  const used=[0];
  if(region){
    if(cnt(0)<MIN&&dist)used.push(1);
    if(cnt(0)+(used.includes(1)?cnt(1):0)<MIN)used.push(2);
  }
  const fallback=region?{
    requested:region,
    exact:cnt(0),
    nearby:used.includes(1)?cnt(1):0,
    wider:used.includes(2)?cnt(2):0,
    used:used
  }:null;
  pool=pool.filter(p=>used.includes(p.tier));
  const avg=pool.length?pool.reduce((s,p)=>s+(st.get(p.pid)||0),0)/pool.length:0;
  for(const p of pool){
    const imp=st.get(p.pid)||0;
    const fairness=1/(1+imp/(avg+1));
    const novelty=(ex.get(p.pid)||0)===0?1:0;
    const exploration=unit((dv||'anon')+'|'+epoch+'|'+p.pid);
    const fairBoost=W.fair*fairness;
    p.pre=W.rel*p.r+fairBoost+W.nov*novelty+W.exp*exploration;
  }
  const out=[];
  const groups=[...new Set(pool.map(p=>p.tier*10+(2-p.band)))].sort((a,b)=>a-b);
  for(const g of groups){
    let rest=pool.filter(p=>p.tier*10+(2-p.band)===g);
    const seenCap=new Set();
    const seenD=new Set();
    while(rest.length&&out.length<limit){
      let bi=0,bs=-1;
      rest.forEach((p,i)=>{
        const diverse=0.5*(seenCap.has(p.ids[0])?0:1)+0.5*(seenD.has(p.district)?0:1);
        const s=p.pre+W.div*diverse;
        if(s>bs){bs=s;bi=i}
      });
      const p=rest.splice(bi,1)[0];
      if(p.ids[0])seenCap.add(p.ids[0]);
      seenD.add(p.district);
      out.push(p);
    }
  }
  return {list:out,fallback:fallback,qc:qc};
}

function applySort(list,sort){
  if(!sort||sort==='rel'||!list||!list.length)return list;
  const arr=list.slice();
  if(sort==='fresh'){
    arr.sort((a,b)=>(b.updated_at||0)-(a.updated_at||0));
  }else if(sort==='top'){
    arr.sort((a,b)=>{
      const ra=(a.rating_count>0)?(a.rating_sum/a.rating_count):0;
      const rb=(b.rating_count>0)?(b.rating_sum/b.rating_count):0;
      return rb-ra||(b.rating_count||0)-(a.rating_count||0);
    });
  }else if(sort==='new'){
    arr.sort((a,b)=>(b.created_at||0)-(a.created_at||0));
  }
  return arr;
}

function discover(req,u,url){
  const q=clean(url.searchParams.get('q'),100);
  const prov=url.searchParams.get('prov')||'';
  const dist=url.searchParams.get('dist')||'';
  const sort=url.searchParams.get('sort')||'rel';
  const limit=Math.min(+url.searchParams.get('limit')||20,60);
  const offset=Math.max(0,Math.min(500,+(url.searchParams.get('offset')||0)||0));
  const dv=deviceOf(req);
  let d=dv?Q('SELECT * FROM devices WHERE id=?').get(dv):null;
  const t=Date.now();
  if(dv&&!d){
    Q('INSERT INTO devices(id,seed,epoch,last_active) VALUES(?,?,0,?)').run(dv,crypto.randomBytes(8).toString('hex'),t);
    d=Q('SELECT * FROM devices WHERE id=?').get(dv);
  }
  const sv=u?savedSet(u):null;
  const fmt=l=>l.map(p=>pubProfile(p,u,{saved:sv}));
  if(q||dist||prov||!dv){
    const need=offset+limit;
    const r=rank({q:q,prov:prov,dist:dist,dv:dv,epoch:d?d.epoch:0,limit:need+1});
    if(q){
      Q('INSERT INTO search_log(q,district,n,at) VALUES(?,?,?,?)').run(q.slice(0,100),dist,r.list.length,t);
      if(dv){
        r.qc.forEach(i=>bump(dv,'cap:'+i,(intentMap(dv).get('cap:'+i)||0)>0?4:1));
        if(dist)bump(dv,'loc:'+dist,(intentMap(dv).get('loc:'+dist)||0)>0?3:1);
      }
    }
    const sorted=applySort(r.list,sort);
    const page=sorted.slice(offset,offset+limit);
    const total=sorted.length>need?need+1:sorted.length;
    return {profiles:fmt(page),meta:{mode:q?'search':'filter',total:total,fallback:r.fallback,understood:r.qc.map(capName)}};
  }
  const live=new Set(Q("SELECT p.pid FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.status='active' AND p.suspended=0").all().map(r=>r.pid));
  let epoch=d.epoch;
  let cur=d.current?JSON.parse(d.current):null;
  let snap=d.snapshot?JSON.parse(d.snapshot):null;
  const refresh=url.searchParams.get('refresh')==='1'||t-d.last_active>IDLE_MS||t-(d.snapshot_at||0)>DAY;
  const save=()=>Q('UPDATE devices SET epoch=?,current=?,last_active=? WHERE id=?').run(epoch,JSON.stringify(cur),t,dv);
  if(!snap||(live.size&&!snap.some(x=>live.has(x)))){
    epoch=0;
    cur=snap=rank({dv:dv,epoch:0,limit:Math.max(100,live.size)}).list.map(p=>p.pid);
    Q('UPDATE devices SET snapshot=?,snapshot_at=? WHERE id=?').run(JSON.stringify(snap),t,dv);
    save();
  }else if(url.searchParams.get('reset')==='1'){
    cur=snap;
    save();
  }else if(refresh||!cur){
    epoch++;
    cur=rank({dv:dv,epoch:epoch,limit:Math.max(100,live.size)}).list.map(p=>p.pid);
    snap=cur.slice();
    Q('UPDATE devices SET snapshot=?,snapshot_at=? WHERE id=?').run(JSON.stringify(snap),t,dv);
    save();
  }else{
    const miss=[...live].filter(x=>!cur.includes(x));
    if(miss.length){
      const add=rank({dv:dv,epoch:epoch,limit:Math.max(100,live.size)}).list.map(p=>p.pid).filter(x=>miss.includes(x));
      cur=[...cur.slice(0,4),...add,...cur.slice(4)];
    }
    save();
  }
  let rows=cur.map(pid=>Q("SELECT p.*,u.phone,u.id_verified AS owner_verified FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.pid=? AND u.status='active' AND p.suspended=0").get(pid)).filter(Boolean);
  rows=applySort(rows,sort);
  const total=rows.length;
  rows=rows.slice(offset,offset+limit);
  return {profiles:fmt(rows),meta:{mode:'browse',total:total}};
}

function helpAsk(q,lang){
  const qn=nz(q);
  const toks=qn.split(' ').filter(x=>x.length>=3);
  if(!toks.length)return null;
  const L=normLang(lang||'rw');
  const rows=Q('SELECT q,a,terms FROM help_faq WHERE active=1 AND (lang=? OR lang IS NULL OR lang=\'\')').all(L);
  let best=null,bs=0;
  for(const d of rows){
    const hay=' '+nz(d.q+' '+(d.terms||'')+' '+d.a)+' ';
    const words=hay.trim().split(' ');
    let sc=0;
    for(const tk of toks){
      if(hay.includes(' '+tk+' '))sc+=2;
      else if(tk.length>=5&&words.some(w=>w.length>=5&&lev1(tk,w)))sc+=1.5;
      else if(tk.length>=5&&hay.includes(' '+tk.slice(0,tk.length-1)))sc+=1;
    }
    if(nz(d.q).includes(qn)&&qn.length>=5)sc+=3;
    if(sc>bs){bs=sc;best=d}
  }
  return bs>=2?{question:best.q,answer:best.a}:null;
}

function purge(){
  const cut=Date.now()-DEL_MS;
  const rows=Q("SELECT u.id,p.pid FROM users u LEFT JOIN profiles p ON p.user_id=u.id WHERE u.status='deleted' AND u.deleted_at<?").all(cut);
  for(const r of rows){
    try{deleteUserData(r.id)}catch(e){}
  }
  Q('DELETE FROM sessions WHERE expires<?').run(Date.now());
  Q('DELETE FROM resets WHERE expires<?').run(Date.now());
  Q('DELETE FROM email_verifications WHERE expires<?').run(Date.now());
  Q('DELETE FROM phone_verifications WHERE expires<?').run(Date.now());
  const t90=Date.now()-90*DAY;
  try{Q('DELETE FROM search_log WHERE at<?').run(t90)}catch(e){}
  try{Q('DELETE FROM exposure WHERE last_seen IS NOT NULL AND last_seen<?').run(t90)}catch(e){}
  try{Q('DELETE FROM intent WHERE at<?').run(t90)}catch(e){}
  try{Q('DELETE FROM devices WHERE last_active<?').run(Date.now()-180*DAY)}catch(e){}
  try{Q('DELETE FROM audit WHERE at<?').run(Date.now()-365*DAY)}catch(e){}
  try{Q('DELETE FROM admin_logs WHERE at<?').run(Date.now()-365*DAY)}catch(e){}
  try{Q("DELETE FROM strip_ads WHERE active=0 AND end_at IS NOT NULL AND end_at<?").run(Date.now()-90*DAY)}catch(e){}
  try{Q("DELETE FROM help_messages WHERE status IN ('done','archived') AND created_at<?").run(Date.now()-180*DAY)}catch(e){}
  return rows.length;
}

function deleteUserData(id){
  const p=Q('SELECT pid FROM profiles WHERE user_id=?').get(id);
  Q('BEGIN').run();
  try{
    if(p){
      Q('DELETE FROM saved WHERE pid=?').run(p.pid);
      Q('DELETE FROM exposure WHERE pid=?').run(p.pid);
      Q('DELETE FROM stats WHERE pid=?').run(p.pid);
            Q('DELETE FROM reports WHERE pid=?').run(p.pid);
      Q('DELETE FROM profiles WHERE user_id=?').run(id);
    }
    Q('DELETE FROM saved WHERE user_id=?').run(id);
    Q('DELETE FROM sessions WHERE user_id=?').run(id);
    Q('DELETE FROM resets WHERE user_id=?').run(id);
    Q('UPDATE reports SET reporter=NULL WHERE reporter=?').run(id);
    Q('DELETE FROM cap_requests WHERE user_id=?').run(id);
    Q('DELETE FROM messages WHERE to_id=? OR from_id=?').run(id,id);
    Q('DELETE FROM notifications WHERE user_id=?').run(id);
                Q('DELETE FROM email_verifications WHERE user_id=?').run(id);
    Q('DELETE FROM phone_verifications WHERE user_id=?').run(id);
    Q('DELETE FROM verifications WHERE user_id=?').run(id);
    Q('DELETE FROM users WHERE id=?').run(id);
    Q('COMMIT').run();
  }catch(e){
    try{Q('ROLLBACK').run()}catch(e2){}
    throw e;
  }
  if(p){try{if(typeof store!=='undefined'&&store&&store.remove)store.remove(p.pid)}catch(e){}}
}

/* ===== END OF IGICE 5/16 ===== */function makeSettings(db){
  const getS=db.prepare('SELECT value FROM site_settings WHERE key=?');
  const setS=db.prepare('INSERT INTO site_settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=?,updated_at=?');
  function get(key,fallback){
    const row=getS.get(key);
    if(!row)return fallback===undefined?null:fallback;
    try{return JSON.parse(row.value)}catch(e){return row.value}
  }
  function set(key,value){
    const v=JSON.stringify(value);
    const t=Date.now();
    setS.run(key,v,t,v,t);
  }
  function featureFlags(){
    const raw=get('features',{})||{};
    const out={};
    for(const k in FEATURE_DEFAULTS){
      const base=FEATURE_DEFAULTS[k];
      const cur=raw[k]||{};
      out[k]={on:cur.on!==undefined?!!cur.on:!!base.on,needs:base.needs||null};
    }
    return out;
  }
  function setFeature(key,on){
    if(!FEATURE_DEFAULTS[key])return false;
    const raw=get('features',{})||{};
    raw[key]={on:!!on};
    set('features',raw);
    return true;
  }
  function contact(){
    return get('contact',{email:'',whatsapp:'',phone:'',facebook:''});
  }
  function setContact(obj){
    set('contact',Object.assign(contact(),obj||{}));
  }
  function site(){
    return get('site',{name:'AHABONA',tagline:'Menya abantu. Menya amahirwe.',owner:'Izere'});
  }
  function setSite(obj){
    set('site',Object.assign(site(),obj||{}));
  }
  return {get,set,featureFlags,setFeature,contact,setContact,site,setSite};
}

function makeRateLimiter(){
  const buckets=new Map();
  const MAX_KEYS=20000;
  function allow(key,max,windowMs){
    const t=Date.now();
    let arr=buckets.get(key);
    if(!arr){
      if(buckets.size>=MAX_KEYS){
        /* Drop oldest ~10% to keep memory bounded */
        const drop=Math.floor(MAX_KEYS/10);
        const it=buckets.keys();
        for(let i=0;i<drop;i++){const k=it.next().value;if(k===undefined)break;buckets.delete(k)}
      }
      arr=[];buckets.set(key,arr);
    }
    while(arr.length&&t-arr[0]>windowMs)arr.shift();
    if(arr.length>=max)return false;
    arr.push(t);
    return true;
  }
  function cleanup(maxAgeMs){
    const t=Date.now();
    for(const [k,arr] of buckets){
      while(arr.length&&t-arr[0]>maxAgeMs)arr.shift();
      if(!arr.length)buckets.delete(k);
    }
  }
  return {allow,cleanup};
}

function makeMailer(cfg){
  cfg=cfg||{};
  const dev=!!cfg.dev;
  const apiUrl=cfg.apiUrl;
  const apiKey=cfg.apiKey;
  const from=cfg.from||'AHABONA <noreply@ahabona.local>';
  const devMail=[];
  async function send(to,subject,text){
    if(dev){devMail.push({to:to,subject:subject,text:text,at:Date.now()});return {ok:true,dev:true}}
    if(apiUrl&&apiKey){
      try{
        let lastErr=null;
        for(let attempt=0;attempt<3;attempt++){
          try{
            const ac=new AbortController();
            const timer=setTimeout(function(){ac.abort()},15000);
            const r=await fetch(apiUrl,{
              method:'POST',
              headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
              body:JSON.stringify({from:from,to:to,subject:subject,text:text}),
              signal:ac.signal
            });
            clearTimeout(timer);
            if(r.ok)return {ok:true,status:r.status};
            lastErr='status '+r.status;
            if(r.status>=400&&r.status<500)return {ok:false,status:r.status};
          }catch(e){lastErr=e&&e.message||String(e)}
          await new Promise(function(r){setTimeout(r,500*(attempt+1))});
        }
        return {ok:false,error:lastErr||'err.mail'};
      }catch(e){return {ok:false,error:e.message}}
    }
    console.log('[mail-not-configured]',to,'|',subject);
    return {ok:false,error:'err.mail'};
  }
  return {send,devMail,isDev:dev,isLive:!!(apiUrl&&apiKey)};
}

function makeCtx(opts){
  const dataDir=opts.dataDir;
  const pubDir=opts.pubDir;
  const secure=!!opts.secure;
  const proxy=!!opts.proxy;
  const dev=!!opts.dev;
  fs.mkdirSync(dataDir,{recursive:true});
  fs.mkdirSync(path.join(dataDir,'photos'),{recursive:true});
  const dbFile=path.join(dataDir,'ahabona.db');
  const db=new DatabaseSync(dbFile);
  let studioStore=null;
  let studioMedia=null;
  db.exec('PRAGMA journal_mode=WAL;')
  db.exec('PRAGMA foreign_keys=OFF;');
  db.exec(SCHEMA);
  migrate(db);
  db.exec(SCHEMA_V2_TABLES);
  migrate(db);
  if(STUDIO_BETA){
    studioStore=StudioStore;
    studioStore.initStudioSchema(db);
    studioMedia=StudioMedia.makeStudioMediaPipeline(dataDir);
  }
  seedCapabilities(db);
  const nowTs=Date.now();
  seedStrip(db,nowTs);
  seedHero(db,nowTs);
  seedHelp(db,nowTs);
  Q=s=>db.prepare(s);
  caps=[];
  const loadCaps=()=>{
    caps=Q('SELECT * FROM capabilities WHERE active=1').all().map(c=>({
      ...c,
      name_en:c.name_en||CAP_EN[c.name]||c.name,
      forms:[...new Set([nz(c.name),nz(c.name_en||CAP_EN[c.name]||''),...JSON.parse(c.aliases||'[]').map(nz)].filter(Boolean))]
    }));
  };
  capName=id=>(caps.find(c=>c.id===id)||{}).name;
  const settings=makeSettings(db);
  try{
    (settings.get('extra_cats',[])||[]).forEach(function(n){
      if(typeof n==='string'&&n&&!Object.prototype.hasOwnProperty.call(TAX,n))TAX[n]=[];
    });
  }catch(e){}
  const rate=makeRateLimiter();
  loadCaps();
  store=makePhotoStore(dataDir);
  const mediaStore=makeMediaStore(dataDir);
  const mailer=makeMailer({
    dev:dev,
    apiUrl:process.env.MAIL_API_URL,
    apiKey:process.env.MAIL_API_KEY,
    from:process.env.MAIL_FROM
  });
  const rlCleanup=setInterval(()=>rate.cleanup(HOUR),HOUR);
  if(rlCleanup&&rlCleanup.unref)rlCleanup.unref();
  const purgeTimer=setInterval(()=>{try{purge()}catch(e){}},HOUR);
  if(purgeTimer&&purgeTimer.unref)purgeTimer.unref();
  const ipOf=r=>{
    if(proxy&&r.headers['x-forwarded-for']){
      const parts=String(r.headers['x-forwarded-for']).split(',').map(s=>s.trim()).filter(Boolean);
      /* The left-most entries can be forged by the client. Use the entry added by the last trusted proxy (AHABONA_PROXY_HOPS, default 1). */
      const hops=Math.max(1,parseInt(process.env.AHABONA_PROXY_HOPS||'1',10)||1);
      return parts.length?parts[Math.max(0,parts.length-hops)]:r.socket.remoteAddress;
    }
    return r.socket.remoteAddress;
  };
   deviceOf=r=>{const d=r.headers['x-device'];return /^[A-Za-z0-9-]{16,64}$/.test(d||'')?d:null};
  const parseCookies=r=>{
    const out={};
    const s=r.headers.cookie;
    if(!s)return out;
    for(const part of String(s).split(';')){
      const i=part.indexOf('=');
      if(i<0)continue;
      const k=part.slice(0,i).trim();
      const v=part.slice(i+1).trim();
      if(!k)continue;
      try{out[k]=decodeURIComponent(v)}catch(e){out[k]=v}
    }
    return out;
  };
  const sessionUser=(r,allowDeleted)=>{
    const c=parseCookies(r);
    const tok=c.ahs;
    if(!tok)return null;
    const s=Q('SELECT * FROM sessions WHERE th=?').get(sha(tok));
    if(!s||s.expires<Date.now())return null;
    const u=Q('SELECT * FROM users WHERE id=?').get(s.user_id);
    if(!u)return null;
    if(u.status!=='active'&&!(allowDeleted&&u.status==='deleted'))return null;
    return u;
  };
  const newSession=(res,uid,r)=>{
    const tok=crypto.randomBytes(32).toString('base64url');
    const t=Date.now();
    Q('INSERT INTO sessions(th,user_id,expires,ua,ip,created_at) VALUES(?,?,?,?,?,?)')
      .run(sha(tok),uid,t+30*DAY,String((r&&r.headers['user-agent'])||'').slice(0,200),r?ipOf(r):null,t);
    const parts=['ahs='+tok,'HttpOnly','SameSite=Lax','Path=/','Max-Age='+(30*86400)];
    if(secure)parts.push('Secure');
    res.setHeader('Set-Cookie',parts.join('; '));
  };
  const destroySession=(req,res)=>{
    const c=parseCookies(req);
    const tok=c.ahs;
    if(tok)try{Q('DELETE FROM sessions WHERE th=?').run(sha(tok))}catch(e){}
    res.setHeader('Set-Cookie','ahs=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'+(secure?'; Secure':''));
  };
  const isAdmin=u=>!!staffLevel(u);
  const isSuper=u=>staffLevel(u)==='super';
  const can=(u,perm)=>permsOf(u).includes(perm);
  const adminLog=(adminId,action,targetType,targetId,details,ip)=>{
    try{
      Q('INSERT INTO admin_logs(admin_id,action,target_type,target_id,details,ip,at) VALUES(?,?,?,?,?,?,?)')
        .run(adminId||null,action||'',targetType||null,targetId||null,details||null,ip||null,Date.now());
      Q('INSERT INTO audit(admin,action,target,at,details,ip) VALUES(?,?,?,?,?,?)')
        .run(adminId||null,action||'',targetType?(targetType+':'+targetId):(targetId||null),Date.now(),details||null,ip||null);
    }catch(e){}
  };
  const adminBoot=async()=>{
    const A={
      email:process.env.ADMIN_EMAIL,
      phone:process.env.ADMIN_PHONE,
      password:process.env.ADMIN_PASSWORD
    };
    if(!A.email||!A.phone||!A.password)return {ok:false,reason:'env-missing'};
    const email=String(A.email).toLowerCase().trim();
    const phone=np(A.phone);
    if(!EM.test(email)||!MP.test(phone))return {ok:false,reason:'invalid'};
    const byEmail=Q('SELECT * FROM users WHERE email=?').get(email);
    const byPhone=Q('SELECT * FROM users WHERE phone=?').get(phone);
    if(byEmail||byPhone){
      if(!byEmail||!byPhone||Number(byEmail.id)!==Number(byPhone.id)){
        console.error('[admin] bootstrap refused: ADMIN_EMAIL and ADMIN_PHONE do not identify the same account');
        return {ok:false,reason:'identity-mismatch'};
      }
      if(byEmail.status&&byEmail.status!=='active'){
        console.error('[admin] bootstrap refused: configured admin account is not active');
        return {ok:false,reason:'account-inactive'};
      }
      Q("UPDATE users SET role='admin',role_level='super' WHERE id=?").run(byEmail.id);
      return {ok:true,reason:'exists'};
    }
    const pw=await hashPw(String(A.password));
    const t=Date.now();
    const r=Q("INSERT INTO users(email,phone,pw,role,role_level,terms_at,created_at) VALUES(?,?,?,'admin','super',?,?)")
      .run(email,phone,pw,t,t);
    return {ok:true,reason:'created',id:Number(r.lastInsertRowid)};
  };
  const featureEnabled=key=>{
    const f=settings.featureFlags();
    return !!(f[key]&&f[key].on);
  };
  const stripActive=()=>{
    const t=Date.now();
    return Q("SELECT * FROM strip_ads WHERE active=1 AND (start_at IS NULL OR start_at<=?) AND (end_at IS NULL OR end_at>=?) ORDER BY priority DESC, id ASC").all(t,t);
  };
  return {
    db,Q,store,settings,rate,mailer,caps,loadCaps,capName,
    ipOf,deviceOf,parseCookies,sessionUser,newSession,destroySession,
    isAdmin,isSuper,can,adminLog,adminBoot,featureEnabled,stripActive,mediaStore,studio:studioStore,studioMedia:studioMedia,
    secure,dev,proxy,dataDir,pubDir,
    purge:()=>purge()
  };
}

/* ===== END OF IGICE 6/16 ===== */async function readBody(req,maxBytes){
  return new Promise(resolve=>{
    const limit=maxBytes||BODY_MAX;
    let n=0,over=false,done=false;
    const chunks=[];
    const finish=r=>{if(!done){done=true;resolve(r)}};
    req.on('data',c=>{
      n+=c.length;
      if(n>limit){over=true;chunks.length=0;return}
      if(!over)chunks.push(c);
    });
    req.on('end',()=>{
      if(done)return;
      if(over)return finish({ok:false,code:413,error:'err.big'});
      if(!chunks.length)return finish({ok:true,data:{}});
      try{
        const txt=Buffer.concat(chunks).toString('utf8');
        finish({ok:true,data:txt?JSON.parse(txt):{}});
      }catch(e){
        console.error('[readBody] JSON parse failed:',e&&e.message||e);
        finish({ok:false,code:400,error:'err.server'});
      }
    });
    req.on('error',()=>finish({ok:false,code:400,error:'err.server'}));
  });
}

function sendJson(req,res,code,obj,opts){
  opts=opts||{};
  const requestPath=String(req.url||'').split('?')[0];
  const noStore=!!opts.noCache||requestPath.indexOf('/api/')===0;
  const b=Buffer.from(JSON.stringify(obj),'utf8');
  const tag=_etagOf(b);
  if(!noStore&&req.headers['if-none-match']===tag){
    res.writeHead(304,{'ETag':tag});
    return res.end();
  }
  const enc=_pickEnc(req);
  const out=_compressBody(b,enc);
  const headers={
    'Content-Type':'application/json; charset=utf-8',
    'ETag':tag,
    'Cache-Control':noStore?'no-store':(opts.cache||'private, max-age=0'),
    'Vary':'Accept-Encoding',
    'Content-Length':out.length
  };
  if(enc && out !== b)headers['Content-Encoding']=enc;
  res.writeHead(code,headers);
  if(req.method==='HEAD')return res.end();
  res.end(out);
}

function sendText(req,res,code,body,type,opts){
  opts=opts||{};
  const b=Buffer.isBuffer(body)?body:Buffer.from(String(body),'utf8');
  const tag=_etagOf(b);
  const cc=opts.noCache?'no-store':(opts.cache||'public, max-age=60');
  if(!opts.noCache&&req.headers['if-none-match']===tag){
    res.writeHead(304,{'ETag':tag,'Cache-Control':cc,'Vary':'Accept-Encoding'});
    return res.end();
  }
  const enc=_pickEnc(req);
  const out=_compressBody(b,enc);
  const headers={
    'Content-Type':type||'text/plain; charset=utf-8',
    'ETag':tag,
    'Cache-Control':cc,
    'Vary':'Accept-Encoding',
    'Content-Length':out.length
  };
  if(enc && out !== b)headers['Content-Encoding']=enc;
  res.writeHead(code,headers);
  if(req.method==='HEAD')return res.end();
  res.end(out);
}

function sendBinary(req,res,code,buf,type,cache){
  const tag=_etagOf(buf);
  const cc=cache||'public, max-age=86400, immutable';
  if(req.headers['if-none-match']===tag){
    res.writeHead(304,{'ETag':tag,'Cache-Control':cc,'Accept-Ranges':'bytes'});
    return res.end();
  }
  const size=buf.length;
  const rangeHdr=req.headers.range;
  if(rangeHdr&&typeof rangeHdr==='string'){
    const m=/bytes=(\d*)-(\d*)/.exec(rangeHdr);
    if(m){
      let start=m[1]?parseInt(m[1],10):0;
      let end=m[2]?parseInt(m[2],10):size-1;
      if(!m[1]&&m[2]){start=Math.max(0,size-parseInt(m[2],10));end=size-1}
      if(Number.isNaN(start))start=0;
      if(Number.isNaN(end)||end>=size)end=size-1;
      if(start>=size||start>end){
        res.writeHead(416,{'Content-Range':'bytes */'+size,'Accept-Ranges':'bytes'});
        return res.end();
      }
      const chunk=buf.subarray(start,end+1);
      res.writeHead(206,{
        'Content-Type':type||'application/octet-stream',
        'Content-Range':'bytes '+start+'-'+end+'/'+size,
        'Accept-Ranges':'bytes',
        'Content-Length':chunk.length,
        'Cache-Control':cc,
        'ETag':tag
      });
      if(req.method==='HEAD')return res.end();
      return res.end(chunk);
    }
  }
  res.writeHead(code,{
    'Content-Type':type||'application/octet-stream',
    'ETag':tag,
    'Cache-Control':cc,
    'Content-Length':size,
    'Accept-Ranges':'bytes'
  });
  if(req.method==='HEAD')return res.end();
  res.end(buf);
}

/* Serves a file from disk without loading it all in memory. Supports Range (needed by Safari/iOS video). */
function sendMediaFile(req,res,fp,type,cache){
  let st;
  try{st=fs.statSync(fp)}catch(e){return sendError(req,res,404,'err.notfound')}
  if(!st.isFile()||st.size<1)return sendError(req,res,404,'err.notfound');
  const size=st.size;
  const tag='"'+size.toString(16)+'-'+Math.floor(st.mtimeMs).toString(16)+'"';
  const cc=cache||'public, max-age=3600';
  if(req.headers['if-none-match']===tag){
    res.writeHead(304,{'ETag':tag,'Cache-Control':cc,'Accept-Ranges':'bytes'});
    return res.end();
  }
  let start=0,end=size-1,code=200;
  const rh=req.headers.range;
  const ir=req.headers['if-range'];
  if(rh&&typeof rh==='string'&&(!ir||ir===tag)){
    const m=/^bytes=(\d*)-(\d*)$/.exec(rh.trim());
    if(m&&(m[1]!==''||m[2]!=='')){
      if(m[1]===''){
        const n=parseInt(m[2],10);
        if(!(n>0)){
          res.writeHead(416,{'Content-Range':'bytes */'+size,'Accept-Ranges':'bytes'});
          return res.end();
        }
        start=Math.max(0,size-n);end=size-1;
      }else{
        start=parseInt(m[1],10);
        end=(m[2]==='')?size-1:Math.min(parseInt(m[2],10),size-1);
      }
      if(Number.isNaN(start)||Number.isNaN(end)||start>=size||start>end){
        res.writeHead(416,{'Content-Range':'bytes */'+size,'Accept-Ranges':'bytes'});
        return res.end();
      }
      code=206;
    }
  }
  const headers={
    'Content-Type':type||'application/octet-stream',
    'Content-Length':end-start+1,
    'Accept-Ranges':'bytes',
    'Cache-Control':cc,
    'ETag':tag
  };
  if(code===206)headers['Content-Range']='bytes '+start+'-'+end+'/'+size;
  res.writeHead(code,headers);
  if(req.method==='HEAD')return res.end();
  const stream=fs.createReadStream(fp,{start:start,end:end});
  stream.on('error',function(){try{res.destroy()}catch(e){}});
  res.on('close',function(){try{stream.destroy()}catch(e){}});
  stream.pipe(res);
}

function pickLang(req,explicit){
  if(explicit)return normLang(explicit);
  try{
    const h=String((req&&req.headers&&req.headers['accept-language'])||'');
    const first=h.split(',')[0].split(';')[0].trim().toLowerCase();
    if(first.indexOf('en')===0)return 'en';
    if(first.indexOf('rw')===0||first.indexOf('kinya')!==-1)return 'rw';
    if(first.indexOf('fr')===0||first.indexOf('sw')===0)return 'rw';
  }catch(e){}
  return 'rw';
}
function sendError(req,res,code,keyOrText,field,lang){
  const L=pickLang(req,lang);
  const s=typeof keyOrText==='string'?keyOrText:'';
  const isKey=s.startsWith('err.')||s.startsWith('reg.')||s.startsWith('val.')||s.startsWith('login.')||s.startsWith('common.')||s.startsWith('restore.')||s.startsWith('account.')||s.startsWith('reset.')||s.startsWith('staff.')||s.startsWith('hero.')||s.startsWith('msg.');
  const msg=isKey?t(L,s):s;
  sendJson(req,res,code,{error:msg,field:field||null});
}

function securityHeaders(res,secure){
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Cross-Origin-Opener-Policy','same-origin');
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
  res.setHeader('Permissions-Policy','geolocation=(self), camera=(self), microphone=()');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob: https: data:; frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if(secure)res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
}

function apiHealth(req,res){
  sendJson(req,res,200,{ok:true,v:'2.0.0',t:Date.now()},{noCache:true});
}

function apiConfig(ctx,req,res){
  const f=ctx.settings.featureFlags();
  const c=ctx.settings.contact();
  const capsList=ctx.Q?ctx.Q('SELECT id,name,name_en,category FROM capabilities WHERE active=1 ORDER BY category,name').all():[];
  const provEn={};
  for(const k in PROV){provEn[PROV_EN[k]||k]=PROV[k]}
  const catEn={};
  for(const k in TAX){catEn[CAT_EN[k]||k]=TAX[k].map(n=>CAP_EN[n]||n)}
  sendJson(req,res,200,{
    provinces:PROV,
    provinces_en:PROV_EN,
    categories:TAX,
    categories_en:CAT_EN,
    capabilities:capsList,
    education:EDU_LEVELS,
    genders:GENDERS,
    languages:LANGS,
    maxCaps:MAXCAPS,
    maxPhotos:MAXP,
    maxPhones:MAXPH,
    maxServiceAreas:MAXSVC,
    minAge:MIN_AGE,
    freshDays:14,
    features:f,
    contact:c,
    defaultLang:'rw',
    cap_en:CAP_EN,
    cat_en:CAT_EN,
    prov_en:PROV_EN
  },{cache:'public, max-age=60'});
}

function stripShowable(a){
  const mt=a.media_type||'text';
  if(mt==='image'&&a.image_url)return true;
  if(mt==='video'&&a.video_url)return true;
  if(a.text)return true;
  if(a.title&&!(mt==='video'&&a.title==='Video'))return true;
  return false;
}

function apiStrip(ctx,req,res){
  const ads=ctx.stripActive().filter(stripShowable);
  sendJson(req,res,200,{
    ads:ads.map(a=>({
      title:a.title||'',
      title_en:a.title_en||'',
      text:a.text||'',
      text_en:a.text_en||'',
      cta:a.cta||'',
      cta_en:a.cta_en||'',
      theme:a.theme||'izuba',
      action:a.action_type,
      value:a.action_value||'',
      kind:a.kind,
      media_type:a.media_type||'text',
      video_url:a.video_url||'',
      image_url:a.image_url||''
    }))
  },{cache:'public, max-age=30'});
}

function apiProfiles(ctx,req,res,url){
  const u=ctx.sessionUser(req);
  const out=discover(req,u,url);
  sendJson(req,res,200,out,{noCache:true});
}

function apiProfile(ctx,req,res,pid){
  const u=ctx.sessionUser(req);
  const r=ctx.Q("SELECT p.*,u.phone,u.email,u.status,u.id_verified AS owner_verified FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.pid=? AND u.status='active' AND p.suspended=0").get(pid);
  if(!r)return sendError(req,res,404,'err.notfound');
  const sv=u?savedSet(u):null;
  sendJson(req,res,200,{profile:pubProfile(r,u,{saved:sv})},{noCache:true});
}

async function apiEvents(ctx,req,res){
  try{
    const dv=ctx.deviceOf(req);
    if(!dv)return sendJson(req,res,200,{ok:true});
    if(!ctx.rate.allow('e:'+dv,600,60000))return sendError(req,res,429,'err.rate');
    const b=await readBody(req,16384);
    if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
    const data=b.data||{};
    const type=typeof data.type==='string'?data.type:String(data.type||'');
    let rawPids=[];
    if(Array.isArray(data.pids))rawPids=data.pids;
    else if(data.pid!=null)rawPids=[data.pid];
    const pids=rawPids.map(x=>typeof x==='string'?x:String(x||'')).filter(x=>PID_RE.test(x)).slice(0,60);
    const t=Date.now();
    if(pids.length){
      const placeholders=pids.map(()=>'?').join(',');
      const rows=ctx.Q('SELECT pid,caps FROM profiles WHERE pid IN ('+placeholders+')').all(...pids);
      const byPid=new Map(rows.map(r=>[r.pid,r]));
      for(const pid of pids){
        const r=byPid.get(pid);
        if(!r)continue;
        ctx.Q('INSERT OR IGNORE INTO stats(pid) VALUES(?)').run(pid);
        if(type==='impression'){
          ctx.Q('INSERT INTO exposure VALUES(?,?,1,?) ON CONFLICT(device,pid) DO UPDATE SET seen=seen+1,last_seen=?').run(dv,pid,t,t);
          ctx.Q('UPDATE stats SET impressions=impressions+1 WHERE pid=?').run(pid);
        }else if(type==='open'){
          ctx.Q('UPDATE stats SET opens=opens+1 WHERE pid=?').run(pid);
          try{JSON.parse(r.caps||'[]').forEach(i=>bump(dv,'cap:'+i,1))}catch(e){}
        }else if(type==='contact'){
          ctx.Q('UPDATE stats SET contacts=contacts+1 WHERE pid=?').run(pid);
          try{JSON.parse(r.caps||'[]').forEach(i=>bump(dv,'cap:'+i,5))}catch(e){}
        }
      }
    }
    sendJson(req,res,200,{ok:true});
  }catch(e){
    console.error('[apiEvents]',e&&e.message||e);
    if(!res.headersSent)sendError(req,res,500,'err.server');
  }
}

async function apiHelpAsk(ctx,req,res){
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  if(!ctx.rate.allow('h:'+(ctx.ipOf(req)||''),60,60000))return sendError(req,res,429,'err.rate');
  const u=ctx.sessionUser(req);
  const lang=normLang((data.lang)||(u&&u.lang)||'rw');
  const r=helpAsk(clean(data.q,200),lang);
  sendJson(req,res,200,r?{grounded:true,question:r.question,answer:r.answer}:{grounded:false,answer:null});
}

async function apiHelpContact(ctx,req,res){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  if(!ctx.rate.allow('hc:'+(ctx.ipOf(req)||''),10,HOUR))return sendError(req,res,429,'err.rate');
  const name=clean(data.name,80);
  const email=clean(data.email,254).toLowerCase();
  const body=clean(data.body,2000);
  if(!body||body.length<3)return sendError(req,res,400,'common.required','body');
  if(email&&!EM.test(email))return sendError(req,res,400,'reg.err.email','email');
  if(containsBlocked(name+' '+body))return sendError(req,res,400,'err.blocklist');
  ctx.Q('INSERT INTO help_messages(name,email,body,status,created_at) VALUES(?,?,?,?,?)').run(name||null,email||null,body,'new',Date.now());
  sendJson(req,res,201,{ok:true});
}

async function apiReport(ctx,req,res){
  try{
    const b=await readBody(req,4096);
    if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
    const data=b.data||{};
    const u=ctx.sessionUser(req);
    if(!ctx.rate.allow('rp:'+(ctx.ipOf(req)||''),10,HOUR))return sendError(req,res,429,'err.rate');
    const pid=typeof data.pid==='string'?data.pid:Array.isArray(data.pid)?String(data.pid[0]||''):String(data.pid||'');
    if(!PID_RE.test(pid))return sendError(req,res,404,'err.notfound');
    if(!ctx.Q('SELECT 1 FROM profiles WHERE pid=?').get(pid))return sendError(req,res,404,'err.notfound');
    let reason=clean(typeof data.reason==='string'?data.reason:String(data.reason||''),60);
    const detail=clean(typeof data.detail==='string'?data.detail:String(data.detail||''),500);
    const allowedReasons=['wrong_info','wrong_photo','bad_behavior','other','wrong','photo','behavior'];
    const rmap={wrong:'wrong_info',photo:'wrong_photo',behavior:'bad_behavior'};
    if(rmap[reason])reason=rmap[reason];
    if(!allowedReasons.includes(reason))reason='other';
    if(!reason)return sendError(req,res,400,'common.required','reason');
    ctx.Q('INSERT INTO reports(pid,reporter,reason,detail,created_at) VALUES(?,?,?,?,?)').run(pid,u?u.id:null,reason,detail,Date.now());
    sendJson(req,res,201,{ok:true});
  }catch(e){
    console.error('[apiReport]',e&&e.message||e);
    if(!res.headersSent)sendError(req,res,500,'err.server');
  }
}

/* ===== END OF IGICE 7/16 ===== */async function apiRegister(ctx,req,res){
  const ip=ctx.ipOf(req)||'';
  if(!ctx.rate.allow('r:'+ip,8,HOUR))return sendError(req,res,429,'err.rate');
  const b=await readBody(req,BODY_MAX);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const v=validateProfile(data,{creating:true});
  if(v.err)return sendError(req,res,400,v.err.msg,v.err.field);
  const f=v.f;
  const existEmail=ctx.Q('SELECT * FROM users WHERE email=?').get(f.email);
  if(existEmail){
    if(existEmail.status==='deleted')return sendError(req,res,409,'restore.body','email');
    return sendError(req,res,409,'reg.err.email','email');
  }
  const existPhone=ctx.Q('SELECT * FROM users WHERE phone=?').get(f.phone);
  if(existPhone){
    if(existPhone.status==='deleted')return sendError(req,res,409,'restore.body','phone');
    return sendError(req,res,409,'reg.err.phone','phone');
  }
  const pid=crypto.randomBytes(8).toString('hex').replace(/[^a-z0-9]/g,'').slice(0,10);
  const saved=ctx.store.save(pid,data.photos,data.thumbs&&data.thumbs[0]);
  if(!saved.ok){return sendError(req,res,400,saved.error||'reg.err.photo','photos')}
  const pw=await hashPw(data.password);
  const t=Date.now();
  let uid;
  try{
    ctx.db.exec('BEGIN');
    uid=Number(ctx.Q("INSERT INTO users(email,phone,pw,terms_at,created_at) VALUES(?,?,?,?,?)").run(f.email,f.phone,pw,t,t).lastInsertRowid);
    const pv=f.phone_visible===null?1:f.phone_visible;
    ctx.Q('INSERT INTO profiles(user_id,pid,name,district,caps,other_text,intro,edu,edu_level,soc,wa,phones,svc,nphotos,experience,languages,availability,birthdate,gender,email_public,facebook,instagram,tiktok,linkedin,telegram,twitter,phone_visible,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(uid,pid,f.name,f.district,JSON.stringify(f.caps),f.other||null,f.intro,f.edu,f.edu,f.soc||'',f.wa,JSON.stringify(f.phones),JSON.stringify(f.svc),saved.count,JSON.stringify(f.experience?[f.experience]:[]),JSON.stringify(f.languages),JSON.stringify(f.availability),f.birthdate,f.gender,f.email_public||null,f.facebook||null,f.instagram||null,f.tiktok||null,f.linkedin||null,f.telegram||null,f.twitter||null,pv,t,t);
    if(f.other)ctx.Q('INSERT INTO cap_requests(user_id,text,created_at) VALUES(?,?,?)').run(uid,f.other,t);
    ctx.db.exec('COMMIT');
  }catch(x){
    try{ctx.db.exec('ROLLBACK')}catch(e){}
    ctx.store.remove(pid);
    console.error('[apiRegister]',x&&x.message||x);
    const msg=String(x&&x.message||'');
    if(/email/i.test(msg))return sendError(req,res,409,'reg.err.email','email');
    if(/phone/i.test(msg))return sendError(req,res,409,'reg.err.phone','phone');
    return sendError(req,res,500,'err.server');
  }
  ctx.newSession(res,uid,req);
  try{
    await ctx.mailer.send(f.email,"AHABONA: Murakaza neza","☀️ MURAKAZA NEZA KURI AHABONA!\n\nUmwirondoro wawe uri kuri AHABONA! Abantu bakeneye serivisi utanga bashobora kuwureba, bakakuvugisha.\n\n������ Nawe gira uruhare mu gukura kwa AHABONA! Bwira nibura abantu 3 uzi biyandikishe, bagaragaze ibyo bashoboye. Bashobora kuba inshuti, abaturanyi cyangwa abandi, nk’abadozi, abafundi, abashoferi, abarimu n’abandi bafite ibyo bakora.\n\n������ https://ahabona.duckdns.org\n\n✅ Kwiyandikisha ni ubuntu!\n✅ No gushaka umuntu wo kugukorera serivisi kuri AHABONA ni ubuntu!\n\n������ Ukeneye ubufasha? Duhamagare cyangwa utwandikire kuri WhatsApp kuri 0792 053 086, tugufashe.\n\n❤️ Sangiza abandi AHABONA, kuko uko tugenda twiyongera, ni ko turushaho gufashanya kubona abo dukeneye.\n\n☀️ AHABONA — Uko turushaho kuba benshi, ni ko turushaho kubonana!\n\nMurakoze kuba muri kumwe natwe! ❤️");
  }catch(e){}
  const r=ctx.Q('SELECT p.*,u.phone,u.email,u.status,u.id_verified AS owner_verified FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=?').get(uid);
  sendJson(req,res,201,{profile:pubProfile(r,null,{own:true,email:f.email,status:'active'})});
}

async function apiLogin(ctx,req,res){
  const ip=ctx.ipOf(req)||'';
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const id=clean(data.id,254);
  const k=id.includes('@')?id.toLowerCase():np(id);
  if(!ctx.rate.allow('l:'+ip+':'+k,10,15*60*1000))return sendError(req,res,429,'err.rate');
  const us=ctx.Q('SELECT * FROM users WHERE email=? OR phone=?').get(k,k);
  const ok=await checkPw(String(data.password||''),us?us.pw:'scrypt$00$00');
  if(!us||!ok)return sendError(req,res,401,'login.err');
  if(us.status==='deleted'&&us.deleted_at<Date.now()-DEL_MS)return sendError(req,res,401,'login.err');
  ctx.newSession(res,us.id,req);
  const r=ctx.Q('SELECT p.*,u.phone,u.email,u.status,u.id_verified AS owner_verified FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=?').get(us.id);
  sendJson(req,res,200,{
    status:us.status,
    role:us.role,
    role_level:us.role_level||'user',
    staff:ctx.isAdmin(us),
    level:staffLevel(us),
    perms:permsOf(us),
    profile:r?pubProfile(r,null,{own:true,email:us.email,status:us.status}):null
  });
}

function apiLogout(ctx,req,res){
  ctx.destroySession(req,res);
  sendJson(req,res,200,{ok:true});
}

function apiLogoutAll(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  ctx.Q('DELETE FROM sessions WHERE user_id=?').run(u.id);
  ctx.destroySession(req,res);
  sendJson(req,res,200,{ok:true});
}

function apiMeGet(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendJson(req,res,200,{user:null});
  const r=ctx.Q('SELECT p.*,u.phone,u.email,u.status,u.id_verified AS owner_verified FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=?').get(u.id);
  sendJson(req,res,200,{
    user:{role:u.role,role_level:u.role_level||'user',status:u.status,email:u.email,phone:u.phone,email_verified:!!u.email_verified,phone_verified:!!u.phone_verified,lang:u.lang||'rw',staff:ctx.isAdmin(u),level:staffLevel(u),perms:permsOf(u),name:u.display_name||''},
    profile:r?pubProfile(r,null,{own:true,email:u.email,status:u.status}):null
  });
}

async function apiMePut(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  if(u.status!=='active')return sendError(req,res,403,'err.forbidden');
  const b=await readBody(req,BODY_MAX);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const r=ctx.Q('SELECT * FROM profiles WHERE user_id=?').get(u.id);
  if(!r)return sendError(req,res,404,'err.notfound');
  const v=validateProfile(data,{creating:false,primary:u.phone});
  if(v.err)return sendError(req,res,400,v.err.msg,v.err.field);
  const f=v.f;
  let nphotos=r.nphotos;
  if(Array.isArray(data.photos)&&data.photos.length){
    const s=ctx.store.save(r.pid,data.photos,data.thumbs&&data.thumbs[0]);
    if(!s.ok)return sendError(req,res,400,s.error||'reg.err.photo','photos');
    nphotos=s.count;
  }
  const had=r.other_text;
  const newPhoneVisible=f.phone_visible===null?(r.phone_visible?1:0):f.phone_visible;
  ctx.Q('UPDATE profiles SET name=?,district=?,caps=?,other_text=?,intro=?,edu=?,edu_level=?,soc=?,wa=?,phones=?,svc=?,nphotos=?,experience=?,languages=?,availability=?,birthdate=?,gender=?,email_public=?,facebook=?,instagram=?,tiktok=?,linkedin=?,telegram=?,twitter=?,phone_visible=?,updated_at=? WHERE user_id=?')
    .run(f.name,f.district,JSON.stringify(f.caps),f.other||null,f.intro,f.edu,f.edu,f.soc||'',f.wa,JSON.stringify(f.phones),JSON.stringify(f.svc),nphotos,JSON.stringify(f.experience?[f.experience]:(r.experience?JSON.parse(r.experience):[])),JSON.stringify(f.languages),JSON.stringify(f.availability),f.birthdate||r.birthdate||null,f.gender||r.gender||null,f.email_public||null,f.facebook||null,f.instagram||null,f.tiktok||null,f.linkedin||null,f.telegram||null,f.twitter||null,newPhoneVisible,Date.now(),u.id);
  if(f.other&&f.other!==had){
    ctx.Q("DELETE FROM cap_requests WHERE user_id=? AND text=? AND status='pending'").run(u.id,f.other);
    ctx.Q('INSERT INTO cap_requests(user_id,text,created_at) VALUES(?,?,?)').run(u.id,f.other,Date.now());
  }
  const nr=ctx.Q('SELECT p.*,u.phone,u.email,u.status,u.id_verified AS owner_verified FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=?').get(u.id);
  sendJson(req,res,200,{profile:pubProfile(nr,null,{own:true,email:u.email,status:u.status})});
}

async function apiMePassword(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  if(!ctx.rate.allow('pw:'+u.id,8,15*60*1000))return sendError(req,res,429,'err.rate');
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  if(typeof data.next!=='string'||data.next.length<8)return sendError(req,res,400,'reg.err.password','password');
  if(!await checkPw(String(data.current||''),u.pw))return sendError(req,res,401,'login.err','current');
  ctx.Q('UPDATE users SET pw=? WHERE id=?').run(await hashPw(data.next),u.id);
  const cur=(ctx.parseCookies(req).ahs)||'';
  ctx.Q('DELETE FROM sessions WHERE user_id=? AND th<>?').run(u.id,sha(cur));
  sendJson(req,res,200,{ok:true});
}

async function apiMeDelete(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  if(!ctx.rate.allow('del:'+u.id,8,15*60*1000))return sendError(req,res,429,'err.rate');
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  if(!await checkPw(String(data.password||''),u.pw))return sendError(req,res,401,'login.err');
  ctx.Q("UPDATE users SET status='deleted',deleted_at=?,admin_deleted=0 WHERE id=?").run(Date.now(),u.id);
  sendJson(req,res,200,{ok:true,restorable_until:Date.now()+DEL_MS});
}

function apiMeRestore(ctx,req,res){
  const u=ctx.sessionUser(req,true);
  if(!u)return sendError(req,res,401,'err.auth');
  if(u.status!=='deleted'||u.deleted_at<Date.now()-DEL_MS)return sendError(req,res,400,'err.forbidden');
  if(u.admin_deleted)return sendError(req,res,403,'err.forbidden');
  ctx.Q("UPDATE users SET status='active',deleted_at=NULL WHERE id=?").run(u.id);
  sendJson(req,res,200,{ok:true});
}

async function apiPasswordForgot(ctx,req,res){
  const ip=ctx.ipOf(req)||'';
  if(!ctx.rate.allow('f:'+ip,5,HOUR))return sendError(req,res,429,'err.rate');
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const em=clean(data.email,254).toLowerCase();
  if(EM.test(em)){
    const us=ctx.Q('SELECT * FROM users WHERE email=?').get(em);
    if(us&&us.status==='active'){
      const base=trustedBaseUrl();
      if(!base){
        console.error('[password-reset] AHABONA_URL is missing or invalid; reset email was not issued');
      }else{
        const tok=crypto.randomBytes(32).toString('base64url');
        ctx.Q('DELETE FROM resets WHERE user_id=?').run(us.id);
        ctx.Q('INSERT INTO resets(th,user_id,expires) VALUES(?,?,?)').run(sha(tok),us.id,Date.now()+48*HOUR);
        try{await ctx.mailer.send(em,'AHABONA: kugarura ijambobanga','Kanda hano ushyireho ijambobanga rishya (rimara amasaha 48): '+base+'/reset/'+tok)}
        catch(e){console.error('[password-reset] mail send failed:',e&&e.message||e)}
      }
    }
  }
  sendJson(req,res,200,{ok:true});
}

async function apiPasswordReset(ctx,req,res){
  const ip=ctx.ipOf(req)||'';
  if(!ctx.rate.allow('rs:'+ip,10,HOUR))return sendError(req,res,429,'err.rate');
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  if(typeof data.password!=='string'||data.password.length<8)return sendError(req,res,400,'reg.err.password','password');
  const r=ctx.Q('SELECT * FROM resets WHERE th=?').get(sha(String(data.token||'')));
  if(!r||r.expires<Date.now())return sendError(req,res,400,'reset.err');
  ctx.Q('UPDATE users SET pw=? WHERE id=?').run(await hashPw(data.password),r.user_id);
  ctx.Q('DELETE FROM resets WHERE user_id=?').run(r.user_id);
  ctx.Q('DELETE FROM sessions WHERE user_id=?').run(r.user_id);
  sendJson(req,res,200,{ok:true});
}

/* ===== END OF IGICE 8/16 ===== */function apiSavedList(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  const rows=ctx.Q("SELECT p.*,u.phone,u.id_verified AS owner_verified FROM saved s JOIN profiles p ON p.pid=s.pid JOIN users u ON u.id=p.user_id WHERE s.user_id=? AND u.status='active' AND p.suspended=0 ORDER BY s.at DESC").all(u.id);
  const sv=new Set(rows.map(x=>x.pid));
  sendJson(req,res,200,{profiles:rows.map(r=>pubProfile(r,u,{saved:sv}))});
}

async function apiUserMessage(ctx,req,res){
  try{
    if(!ctx.featureEnabled('messaging'))return sendError(req,res,403,'err.forbidden');
    const u=ctx.sessionUser(req);
    if(!u)return sendError(req,res,401,'err.auth');
    if(u.status!=='active')return sendError(req,res,403,'err.forbidden');
    if(!ctx.rate.allow('msg:'+u.id,30,HOUR))return sendError(req,res,429,'err.rate');
    const b=await readBody(req,8192);
    if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
    const data=b.data||{};
    const body=clean(typeof data.body==='string'?data.body:String(data.body||''),2000);
    if(!body||body.length<1)return sendError(req,res,400,'common.required','body');
    if(containsBlocked(body))return sendError(req,res,400,'err.blocklist');
    let toId=null;
    const toPid=typeof data.to_pid==='string'?data.to_pid:String(data.to_pid||'');
    if(toPid&&PID_RE.test(toPid)){
      const pr=ctx.Q("SELECT user_id FROM profiles WHERE pid=?").get(toPid);
      if(!pr)return sendError(req,res,404,'err.notfound');
      toId=pr.user_id;
    }else if(data.to_id!=null){
      toId=Number(data.to_id)||null;
    }
    if(!toId||toId===u.id)return sendError(req,res,400,'common.required','to');
    const subject=clean(typeof data.subject==='string'?data.subject:String(data.subject||''),120)||null;
    ctx.Q('INSERT INTO messages(from_id,to_id,subject,body,created_at) VALUES(?,?,?,?,?)')
      .run(u.id,toId,subject,body,Date.now());
    try{
      ctx.Q('INSERT INTO notifications(user_id,kind,title,body,link,created_at) VALUES(?,?,?,?,?,?)')
        .run(toId,'message',subject||'Ubutumwa bushya',body.slice(0,120),null,Date.now());
    }catch(e){}
    sendJson(req,res,201,{ok:true});
  }catch(e){
    console.error('[apiUserMessage]',e&&e.message||e);
    if(!res.headersSent)sendError(req,res,500,'err.server');
  }
}
function apiMessagesList(ctx,req,res){
  try{
    if(!ctx.featureEnabled('messaging'))return sendError(req,res,403,'err.forbidden');
    const u=ctx.sessionUser(req);
    if(!u)return sendError(req,res,401,'err.auth');
    if(u.status!=='active')return sendError(req,res,403,'err.forbidden');
    const rows=ctx.Q('SELECT m.id,m.from_id,m.to_id,m.subject,m.body,m.read_at,m.created_at,COALESCE(p.name,u2.display_name,u2.email) AS from_name FROM messages m LEFT JOIN users u2 ON u2.id=m.from_id LEFT JOIN profiles p ON p.user_id=m.from_id WHERE m.to_id=? ORDER BY m.id DESC LIMIT 100').all(u.id);
    const now=Date.now();
    ctx.Q('UPDATE messages SET read_at=? WHERE to_id=? AND read_at IS NULL').run(now,u.id);
    sendJson(req,res,200,{messages:rows});
  }catch(e){
    console.error('[apiMessagesList]',e&&e.message||e);
    if(!res.headersSent)sendError(req,res,500,'err.server');
  }
}

async function apiSavedToggle(ctx,req,res,pid,method){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  if(method==='PUT'){
    const r=ctx.Q("SELECT p.caps FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.pid=? AND p.suspended=0 AND u.status='active'").get(pid);
    if(!r)return sendError(req,res,404,'err.notfound');
    ctx.Q('INSERT OR IGNORE INTO saved VALUES(?,?,?)').run(u.id,pid,Date.now());
    const dv=ctx.deviceOf(req);
    if(dv)JSON.parse(r.caps||'[]').forEach(i=>bump(dv,'cap:'+i,6));
  }else{
    ctx.Q('DELETE FROM saved WHERE user_id=? AND pid=?').run(u.id,pid);
  }
  sendJson(req,res,200,{ok:true});
}

function apiNotificationsList(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  const rows=ctx.Q('SELECT id,kind,title,body,link,read_at,created_at FROM notifications WHERE user_id=? ORDER BY (read_at IS NULL) DESC, created_at DESC LIMIT 50').all(u.id);
  const unread=ctx.Q('SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read_at IS NULL').get(u.id).n;
  sendJson(req,res,200,{notifications:rows,unread:unread});
}
function apiNotificationsReadAll(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  ctx.Q('UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL').run(Date.now(),u.id);
  sendJson(req,res,200,{ok:true});
}
async function apiMeLang(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  const b=await readBody(req,1024);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const lang=normLang((b.data||{}).lang);
  ctx.Q('UPDATE users SET lang=? WHERE id=?').run(lang,u.id);
  sendJson(req,res,200,{ok:true,lang:lang});
}
async function apiVerifyEmailRequest(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  if(!ctx.featureEnabled('email_verification'))return sendError(req,res,403,'err.forbidden');
  if(u.email_verified)return sendJson(req,res,200,{ok:true,already:true});
  if(!ctx.rate.allow('ve:'+u.id,5,HOUR))return sendError(req,res,429,'err.rate');
  const tok=crypto.randomBytes(24).toString('base64url');
  const t=Date.now();
  ctx.Q('DELETE FROM email_verifications WHERE user_id=?').run(u.id);
  ctx.Q('INSERT INTO email_verifications(th,user_id,email,expires,created_at) VALUES(?,?,?,?,?)').run(sha(tok),u.id,u.email,t+24*HOUR,t);
  const base=trustedBaseUrl();
  if(!base){
    ctx.Q('DELETE FROM email_verifications WHERE user_id=?').run(u.id);
    console.error('[email-verification] AHABONA_URL is missing or invalid; verification email was not issued');
    return sendError(req,res,503,'err.server');
  }
  try{await ctx.mailer.send(u.email,'AHABONA: verify email','Kanda hano / Click here: '+base+'/api/verify-email/'+tok)}
  catch(e){return sendError(req,res,503,'err.server')}
  sendJson(req,res,200,{ok:true});
}
function apiVerifyEmailToken(ctx,req,res,token){
  const r=ctx.Q('SELECT * FROM email_verifications WHERE th=?').get(sha(token));
  const ok=!!(r&&r.expires>=Date.now());
  if(ok){
    ctx.Q('UPDATE users SET email_verified=1 WHERE id=?').run(r.user_id);
    ctx.Q('DELETE FROM email_verifications WHERE user_id=?').run(r.user_id);
  }
  /* Redirect to homepage so the emailed link works in a browser, not raw JSON */
  const dest='/?verified='+(ok?'1':'0');
  res.writeHead(303,{'Location':dest,'Cache-Control':'no-store'});
  return res.end();
}
async function apiVerifyPhoneRequest(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  if(!ctx.featureEnabled('sms_verification'))return sendError(req,res,403,'err.forbidden');
  if(u.phone_verified)return sendJson(req,res,200,{ok:true,already:true});
  if(!ctx.rate.allow('vp:'+u.id,5,HOUR))return sendError(req,res,429,'err.rate');
  const code=String(crypto.randomInt(100000,1000000));
  const t=Date.now();
  const tok=crypto.randomBytes(16).toString('hex');
  ctx.Q('DELETE FROM phone_verifications WHERE user_id=?').run(u.id);
  ctx.Q('INSERT INTO phone_verifications(th,user_id,phone,code,expires,created_at) VALUES(?,?,?,?,?,?)').run(tok,u.id,u.phone,code,t+15*60*1000,t);
  /* SMS stub: log code; integrate Africa's Talking / Twilio later */
  console.log('[sms-stub] phone verify code for',u.phone,code);
  sendJson(req,res,200,{ok:true,stub:true,hint:'Code logged server-side (SMS gateway not configured)'});
}
function safeEqStr(a,b){a=Buffer.from(String(a));b=Buffer.from(String(b));return a.length===b.length&&crypto.timingSafeEqual(a,b)}
async function apiVerifyPhoneConfirm(ctx,req,res){
  const u=ctx.sessionUser(req);
  if(!u)return sendError(req,res,401,'err.auth');
  if(!ctx.rate.allow('vc:'+u.id,8,15*60*1000))return sendError(req,res,429,'err.rate');
  const b=await readBody(req,1024);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const code=String((b.data||{}).code||'').trim();
  const r=ctx.Q('SELECT * FROM phone_verifications WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(u.id);
  if(!r||r.expires<Date.now()||!safeEqStr(r.code,code))return sendError(req,res,400,'reset.err');
  ctx.Q('UPDATE users SET phone_verified=1 WHERE id=?').run(u.id);
  ctx.Q('DELETE FROM phone_verifications WHERE user_id=?').run(u.id);
  sendJson(req,res,200,{ok:true});
}

function adminSummary(ctx,req,res){
  const c=s=>ctx.Q(s).get().n;
  const t=Date.now();
  sendJson(req,res,200,{
    users:c("SELECT COUNT(*) n FROM users WHERE role='user'"),
    profiles_public:c("SELECT COUNT(*) n FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.status='active' AND p.suspended=0"),
    suspended:c('SELECT COUNT(*) n FROM profiles WHERE suspended=1'),
    deletion_pending:c("SELECT COUNT(*) n FROM users WHERE status='deleted'"),
    reports_new:c("SELECT COUNT(*) n FROM reports WHERE status='new'"),
    reports_total:c('SELECT COUNT(*) n FROM reports'),
    cap_requests_pending:c("SELECT COUNT(*) n FROM cap_requests WHERE status='pending'"),
    searches_7d:ctx.Q('SELECT COUNT(*) n FROM search_log WHERE at>?').get(t-7*DAY).n,
    searches_empty_7d:ctx.Q('SELECT COUNT(*) n FROM search_log WHERE at>? AND n=0').get(t-7*DAY).n,
    impressions:c('SELECT COALESCE(SUM(impressions),0) n FROM stats'),
    opens:c('SELECT COALESCE(SUM(opens),0) n FROM stats'),
    contacts:c('SELECT COALESCE(SUM(contacts),0) n FROM stats'),
    new_users_7d:ctx.Q('SELECT COUNT(*) n FROM users WHERE role=\'user\' AND created_at>?').get(t-7*DAY).n,
    new_users_30d:ctx.Q('SELECT COUNT(*) n FROM users WHERE role=\'user\' AND created_at>?').get(t-30*DAY).n
  });
}

function adminUsers(ctx,req,res,actor){
  const rows=ctx.Q("SELECT u.id,u.email,u.phone,u.status,u.role,u.role_level,u.created_at,u.email_verified,u.phone_verified,u.id_verified,p.pid,p.name,p.district,p.suspended,p.rating_sum,p.rating_count FROM users u LEFT JOIN profiles p ON p.user_id=u.id ORDER BY u.id DESC LIMIT 500").all();
  const out=rows.filter(r=>!staffLevelRaw(r));
  sendJson(req,res,200,{users:out});
}

function adminUserGet(ctx,req,res,id,actor){
  const u=ctx.Q('SELECT * FROM users WHERE id=?').get(id);
  if(!u)return sendError(req,res,404,'err.notfound');
  if(staffLevelRaw(u)&&!ctx.can(actor,'staff.manage'))return sendError(req,res,403,'err.forbidden');
  delete u.pw;
  delete u.national_id; // National ID collection/verification is out of scope for this MVP.
  const p=ctx.Q('SELECT * FROM profiles WHERE user_id=?').get(id);
  sendJson(req,res,200,{user:u,profile:p||null});
}

async function adminUserPut(ctx,req,res,id,admin){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const u=ctx.Q('SELECT * FROM users WHERE id=?').get(id);
  if(!u)return sendError(req,res,404,'err.notfound');
  if(staffLevelRaw(u))return sendError(req,res,403,'err.forbidden');
  const changed=[];
  const mayContact=ctx.can(admin,'users.contact');
  let email=u.email,phone=u.phone;
  if(data.email!==undefined&&clean(data.email,254).toLowerCase()!==u.email){
    if(!mayContact)return sendError(req,res,403,'err.forbidden');
    email=clean(data.email,254).toLowerCase();
    if(!EM.test(email))return sendError(req,res,400,'reg.err.email','email');
    if(ctx.Q('SELECT 1 FROM users WHERE email=? AND id<>?').get(email,id))return sendError(req,res,409,'reg.err.email','email');
    changed.push('email');
  }
  if(data.phone!==undefined&&np(String(data.phone||''))!==u.phone){
    if(!mayContact)return sendError(req,res,403,'err.forbidden');
    phone=np(String(data.phone||''));
    if(!MP.test(phone))return sendError(req,res,400,'reg.err.phone','phone');
    if(ctx.Q('SELECT 1 FROM users WHERE phone=? AND id<>?').get(phone,id))return sendError(req,res,409,'reg.err.phone','phone');
    changed.push('phone');
  }
  // Ignore legacy national_id input: collecting or verifying it is not enabled in this MVP.
  let status=u.status;
  if(data.status!==undefined&&data.status!==u.status){
    if(!['active','suspended','deleted'].includes(data.status))return sendError(req,res,400,'common.required','status');
    if(data.status==='deleted'&&!ctx.can(admin,'users.delete'))return sendError(req,res,403,'err.forbidden');
    status=data.status;
    changed.push('status');
  }
  /* Validate profile fields BEFORE any write so we never half-update */
  let newName=null,newDistrict=null;
  if(data.name!==undefined||data.district!==undefined){
    const p0=ctx.Q('SELECT name,district FROM profiles WHERE user_id=?').get(id);
    if(p0){
      newName=p0.name;newDistrict=p0.district;
      if(data.name!==undefined){
        const nn=clean(data.name,60);
        if(nn.length<3)return sendError(req,res,400,'reg.err.name','name');
        if(containsBlocked(nn))return sendError(req,res,400,'err.blocklist','name');
        newName=nn;
      }
      if(data.district!==undefined){
        const dd=clean(data.district,40);
        if(dd&&!DIST.includes(dd))return sendError(req,res,400,'reg.err.district','district');
        if(dd)newDistrict=dd;
      }
    }
  }
  const delAt=status==='deleted'?(u.status==='deleted'&&u.deleted_at?u.deleted_at:Date.now()):null;
  ctx.Q('UPDATE users SET email=?,phone=?,status=?,deleted_at=? WHERE id=?').run(email,phone,status,delAt,id);
  if(changed.includes('email'))ctx.Q('UPDATE users SET email_verified=0 WHERE id=?').run(id);
  if(changed.includes('phone'))ctx.Q('UPDATE users SET phone_verified=0 WHERE id=?').run(id);
  if(status!==u.status)ctx.Q('UPDATE users SET admin_deleted=? WHERE id=?').run(status==='deleted'?1:0,id);
  if(status!=='active'&&status!==u.status){
    ctx.Q('DELETE FROM sessions WHERE user_id=?').run(id);
  }
  if(newName!==null&&newDistrict!==null){
    const p=ctx.Q('SELECT name,district FROM profiles WHERE user_id=?').get(id);
    if(p&&(newName!==p.name||newDistrict!==p.district)){
      ctx.Q('UPDATE profiles SET name=?,district=?,updated_at=? WHERE user_id=?').run(newName,newDistrict,Date.now(),id);
      changed.push('profile');
    }
  }
  ctx.adminLog(admin.id,'user.update','user',String(id),JSON.stringify({fields:changed}),ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

function adminUserDelete(ctx,req,res,id,admin){
  if(Number(id)===admin.id)return sendError(req,res,400,'err.forbidden');
  const u=ctx.Q('SELECT * FROM users WHERE id=?').get(id);
  if(!u)return sendError(req,res,404,'err.notfound');
  if(staffLevelRaw(u))return sendError(req,res,403,'err.forbidden');
  try{deleteUserData(id)}catch(e){return sendError(req,res,500,'err.server')}
  ctx.adminLog(admin.id,'user.delete','user',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

async function adminUserMessage(ctx,req,res,id,admin){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const subj=clean(data.subject,120);
  const body=clean(data.body,2000);
  if(!body)return sendError(req,res,400,'common.required','body');
  const target=ctx.Q('SELECT id,email FROM users WHERE id=?').get(id);
  if(!target)return sendError(req,res,404,'err.notfound');
  ctx.Q('INSERT INTO messages(from_id,to_id,subject,body,created_at) VALUES(?,?,?,?,?)').run(admin.id,id,subj||null,body,Date.now());
  ctx.Q('INSERT INTO notifications(user_id,kind,title,body,created_at) VALUES(?,?,?,?,?)').run(id,'message',subj||'Ubutumwa',body.slice(0,200),Date.now());
  if(target.email)await ctx.mailer.send(target.email,subj||'AHABONA',body);
  ctx.adminLog(admin.id,'user.message','user',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

async function adminBroadcast(ctx,req,res,admin){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const subj=clean(data.subject,120);
  const body=clean(data.body,2000);
  if(!body)return sendError(req,res,400,'common.required','body');
  const users=ctx.Q("SELECT id,email,role,role_level FROM users WHERE status='active'").all().filter(x=>!staffLevelRaw(x));
  const now=Date.now();
  ctx.db.exec('BEGIN');
  try{
    for(const usr of users){
      ctx.Q('INSERT INTO messages(from_id,to_id,subject,body,created_at) VALUES(?,?,?,?,?)').run(admin.id,usr.id,subj||null,body,now);
      ctx.Q('INSERT INTO notifications(user_id,kind,title,body,created_at) VALUES(?,?,?,?,?)').run(usr.id,'broadcast',subj||'AHABONA',body.slice(0,200),now);
    }
    ctx.db.exec('COMMIT');
  }catch(e){
    try{ctx.db.exec('ROLLBACK')}catch(e2){}
    return sendError(req,res,500,'err.server');
  }
  ctx.adminLog(admin.id,'broadcast',null,null,JSON.stringify({count:users.length}),ctx.ipOf(req));
  sendJson(req,res,200,{ok:true,count:users.length});
  if(ctx.mailer.isLive){
    setImmediate(async function(){
      for(const usr of users){
        if(!usr.email)continue;
        try{await ctx.mailer.send(usr.email,subj||'AHABONA',body)}catch(e){}
      }
    });
  }
}

function adminReports(ctx,req,res){
  const rows=ctx.Q('SELECT r.*,p.name FROM reports r LEFT JOIN profiles p ON p.pid=r.pid ORDER BY r.id DESC LIMIT 500').all();
  sendJson(req,res,200,{reports:rows});
}

function adminReportUpdate(ctx,req,res,id,admin){
  return readBody(req,4096).then(b=>{
    if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
    const data=b.data||{};
    if(!['new','reviewed','actioned','dismissed'].includes(data.status))return sendError(req,res,400,'common.required');
    ctx.Q('UPDATE reports SET status=?,decided_at=?,decided_by=? WHERE id=?').run(data.status,Date.now(),admin.id,id);
    ctx.adminLog(admin.id,'report:'+data.status,'report',String(id),null,ctx.ipOf(req));
    sendJson(req,res,200,{ok:true});
  });
}

function adminRequests(ctx,req,res){
  const rows=ctx.Q("SELECT c.*,p.name,p.pid FROM cap_requests c LEFT JOIN profiles p ON p.user_id=c.user_id WHERE c.status='pending' ORDER BY c.id").all();
  sendJson(req,res,200,{requests:rows,categories:Object.keys(TAX)});
}

function adminRequestDecide(ctx,req,res,id,admin){
  return readBody(req,4096).then(b=>{
    if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
    const data=b.data||{};
    const r=ctx.Q('SELECT * FROM cap_requests WHERE id=?').get(id);
    if(!r||r.status!=='pending')return sendError(req,res,404,'err.notfound');
    if(data.action==='approve'){
      const cat=clean(data.category,80);
      const name=clean(data.name||r.text,60);
      if(!TAX[cat]||name.length<3)return sendError(req,res,400,'common.required');
      let c=ctx.Q('SELECT id FROM capabilities WHERE name=?').get(name);
      if(!c){
        c={id:Number(ctx.Q('INSERT INTO capabilities(name,category) VALUES(?,?)').run(name,cat).lastInsertRowid)};
        ctx.loadCaps();
      }
      for(const pr of ctx.Q('SELECT user_id,caps FROM profiles WHERE other_text=?').all(r.text)){
        const a=JSON.parse(pr.caps);
        if(!a.includes(c.id))a.push(c.id);
        ctx.Q('UPDATE profiles SET caps=?,other_text=NULL WHERE user_id=?').run(JSON.stringify(a),pr.user_id);
      }
      ctx.Q("UPDATE cap_requests SET status='approved',decided_at=?,decided_by=? WHERE text=? AND status='pending'").run(Date.now(),admin.id,r.text);
    }else if(data.action==='reject'){
      ctx.Q("UPDATE cap_requests SET status='rejected',decided_at=?,decided_by=? WHERE id=?").run(Date.now(),admin.id,r.id);
      /* keep other_text so user can edit; status rejected is tracked on cap_requests */
    }else{
      return sendError(req,res,400,'common.required');
    }
    ctx.adminLog(admin.id,'capability:'+data.action,'cap_request',String(id),r.text,ctx.ipOf(req));
    sendJson(req,res,200,{ok:true});
  });
}

function adminProfileSuspend(ctx,req,res,pid,admin){
  return readBody(req,4096).then(b=>{
    if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
    const data=b.data||{};
    if(!['suspend','restore'].includes(data.action))return sendError(req,res,400,'common.required');
    ctx.Q('UPDATE profiles SET suspended=? WHERE pid=?').run(data.action==='suspend'?1:0,pid);
    if(data.action==='suspend'){
      const pr=ctx.Q('SELECT user_id FROM profiles WHERE pid=?').get(pid);
      if(pr)ctx.Q('DELETE FROM sessions WHERE user_id=?').run(pr.user_id);
    }
    ctx.adminLog(admin.id,data.action,'profile',pid,null,ctx.ipOf(req));
    sendJson(req,res,200,{ok:true});
  }).catch(e=>{
    console.error('[adminProfileSuspend]',e&&e.message||e);
    if(!res.headersSent)sendError(req,res,500,'err.server');
  });
}

function adminAudit(ctx,req,res){
  const rows=ctx.Q('SELECT * FROM audit ORDER BY id DESC LIMIT 200').all();
  sendJson(req,res,200,{audit:rows});
}

function adminLogs(ctx,req,res){
  const rows=ctx.Q('SELECT * FROM admin_logs ORDER BY id DESC LIMIT 500').all();
  sendJson(req,res,200,{logs:rows});
}

function adminMessages(ctx,req,res){
  const rows=ctx.Q('SELECT * FROM help_messages ORDER BY id DESC LIMIT 500').all();
  sendJson(req,res,200,{messages:rows});
}

function adminMessageUpdate(ctx,req,res,id,admin){
  return readBody(req,4096).then(b=>{
    if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
    const data=b.data||{};
    if(!['new','read','archived','done'].includes(data.status))return sendError(req,res,400,'common.required');
    ctx.Q('UPDATE help_messages SET status=? WHERE id=?').run(data.status,id);
    ctx.adminLog(admin.id,'help_message:'+data.status,'help_message',String(id),null,ctx.ipOf(req));
    sendJson(req,res,200,{ok:true});
  });
}

/* ===== END OF IGICE 9/16 ===== */function adminSettings(ctx,req,res){
  const f=ctx.settings.featureFlags();
  const c=ctx.settings.contact();
  const s=ctx.settings.site();
  sendJson(req,res,200,{features:f,contact:c,site:s});
}

async function adminSettingsUpdate(ctx,req,res,admin){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const upd={};
  if(data.contact&&typeof data.contact==='object'){
    const c0={};
    ['email','whatsapp','phone','facebook'].forEach(k=>{if(data.contact[k]!==undefined)c0[k]=clean(data.contact[k],200)});
    if(c0.email&&!EM.test(c0.email.toLowerCase()))return sendError(req,res,400,'reg.err.email','email');
    if(c0.email)c0.email=c0.email.toLowerCase();
    if(c0.whatsapp){c0.whatsapp=np(c0.whatsapp);if(!MP.test(c0.whatsapp))return sendError(req,res,400,'reg.err.wa','whatsapp')}
    if(c0.phone){c0.phone=np(c0.phone);if(!MP.test(c0.phone))return sendError(req,res,400,'reg.err.phone','phone')}
    if(c0.facebook&&!URL_RE.test(c0.facebook))return sendError(req,res,400,'val.soc','facebook');
    ctx.settings.setContact(c0);upd.contact=c0;
  }
  if(data.site&&typeof data.site==='object'){
    const s0={};
    ['name','tagline','owner'].forEach(k=>{if(data.site[k]!==undefined)s0[k]=clean(data.site[k],120)});
    ctx.settings.setSite(s0);upd.site=s0;
  }
  ctx.adminLog(admin.id,'settings.update',null,null,JSON.stringify(upd),ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

async function adminFeatureToggle(ctx,req,res,admin){
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const key=clean(data.key,60);
  const on=!!data.on;
  if(!['messaging','pwa'].includes(key))return sendError(req,res,400,'common.required');
  const r=ctx.settings.setFeature(key,on);
  if(!r)return sendError(req,res,400,'common.required');
  ctx.adminLog(admin.id,'feature:'+key+':'+(on?'on':'off'),null,null,null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

function stripMediaBytes(ctx,url){
  const m=/^\/media\/(strip-\d+\.(?:mp4|webm|avi|jpg|png|webp))/.exec(String(url||''));
  if(!m||!ctx.mediaStore)return null;
  try{return fs.statSync(ctx.mediaStore.pathOf(m[1])).size}catch(e){return -1}
}
function adminStripList(ctx,req,res){
  const rows=ctx.Q('SELECT * FROM strip_ads ORDER BY priority DESC, id ASC').all();
  const out=rows.map(function(r){
    const o=Object.assign({},r);
    const vb=stripMediaBytes(ctx,r.video_url);
    const ib=stripMediaBytes(ctx,r.image_url);
    if(vb!==null)o.video_bytes=vb;
    if(ib!==null)o.image_bytes=ib;
    return o;
  });
  sendJson(req,res,200,{ads:out});
}

const HERO_THEMES=['ijoro','izuba','kigali','musanze','rubavu','huye','nyungwe','ibendera'];
const HERO_KINDS=['info','tip','announcement','city','promo','sponsor'];
const HERO_ACTIONS=['none','search','focus','register','help','about','link','phone'];
function heroClean(data,cur){
  const c=cur||{};
  const pick=(k,max)=>data[k]!==undefined?clean(data[k],max):(c[k]||'');
  const o={};
  o.title=pick('title',80);o.title_en=pick('title_en',80);
  o.text=pick('text',220);o.text_en=pick('text_en',220);
  o.cta=pick('cta',28);o.cta_en=pick('cta_en',28);
  const mediaType=data.media_type!==undefined?String(data.media_type):(c.media_type||'text');
  o.media_type=(mediaType==='video')?'video':((mediaType==='image')?'image':'text');
  o.video_url=data.video_url!==undefined?clean(data.video_url,500):(c.video_url||'');
  if(o.media_type==='video'){
    /* video file may upload after create; URL optional at this step */
    if(!o.title&&!o.text)o.title=o.title||'Video';
  }else if(o.media_type==='image'){
    /* photo uploads after create; title and text are optional for a photo slide */
  }else if(!o.title&&!o.text)return{err:'common.required',field:'title'};
  const theme=data.theme!==undefined?String(data.theme):(c.theme||'izuba');
  o.theme=HERO_THEMES.includes(theme)?theme:'izuba';
  const kind=data.kind!==undefined?String(data.kind):(c.kind||'tip');
  o.kind=HERO_KINDS.includes(kind)?kind:'tip';
  const action=data.action!==undefined?String(data.action):(c.action_type||'none');
  o.action=HERO_ACTIONS.includes(action)?action:'none';
  let value=data.value!==undefined?clean(data.value,500):(c.action_value||'');
  if(o.action==='link'){
    if(!/^https?:\/\/[^\s"'<>]+$/i.test(value))return{err:'hero.err.link',field:'value'};
  }else if(o.action==='phone'){
    value=np(String(value||''));
    if(!MP.test(value))return{err:'hero.err.phone',field:'value'};
  }else if(o.action==='search'){
    value=value.slice(0,80);
  }else{
    value='';
  }
  o.value=value;
  const num=v=>{if(v===null||v===''||v===undefined)return null;const n=Number(v);return Number.isFinite(n)?Math.floor(n):null};
  o.start_at=data.start_at!==undefined?num(data.start_at):(c.start_at||null);
  o.end_at=data.end_at!==undefined?num(data.end_at):(c.end_at||null);
  if(o.start_at&&o.end_at&&o.end_at<o.start_at)return{err:'common.required',field:'end_at'};
  const pr=data.priority!==undefined?Math.round(Number(data.priority)):(c.priority||0);
  o.priority=Number.isFinite(pr)?Math.max(-100,Math.min(100,pr)):0;
  o.active=data.active!==undefined?(data.active?1:0):(c.active===undefined?1:c.active);
  return{v:o};
}

async function adminStripAdd(ctx,req,res,admin){
  const b=await readBody(req,20*1024*1024);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const h=heroClean(b.data||{},null);
  if(h.err)return sendError(req,res,400,h.err,h.field);
  const o=h.v;
  const r=ctx.Q('INSERT INTO strip_ads(text,title,text_en,title_en,cta,cta_en,theme,action_type,action_value,kind,active,start_at,end_at,priority,created_at,media_type,video_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(o.text||'',o.title||null,o.text_en||null,o.title_en||null,o.cta||null,o.cta_en||null,o.theme,o.action,o.value||null,o.kind,o.active,o.start_at,o.end_at,o.priority,Date.now(),o.media_type||'text',o.video_url||null);
  const id=Number(r.lastInsertRowid);
  if(o.media_type==='video'&&b.data&&b.data.video_b64){
    const buf=parseVideoB64(b.data.video_b64);
    if(!buf)return sendError(req,res,400,'common.required','video');
    if(!looksLikeVideo(buf))return sendError(req,res,400,'Fayile ntabwo ari video (koresha mp4)');
    const ms=ctx.mediaStore;
    if(ms){
      const sv=await ms.saveStripVideo(id,buf);
      if(!sv.ok)return sendError(req,res,500,'err.server');
      const url='/media/'+sv.path+'?v='+Date.now();
      const codec=sv.processed?'h264':(sv.codec||sniffCodec(buf));
      ctx.Q('UPDATE strip_ads SET video_url=?,video_proc=?,video_codec=? WHERE id=?')
        .run(url,sv.processed?1:0,codec||null,id);
      o.video_url=url;
    }
  }
  ctx.adminLog(admin.id,'strip.add','strip',String(id),o.title||o.text||'video',ctx.ipOf(req));
  sendJson(req,res,201,{ok:true,id:id});
}

async function adminStripUpdate(ctx,req,res,id,admin){
  const b=await readBody(req,20*1024*1024);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const cur=ctx.Q('SELECT * FROM strip_ads WHERE id=?').get(id);
  if(!cur)return sendError(req,res,404,'err.notfound');
  const h=heroClean(b.data||{},cur);
  if(h.err)return sendError(req,res,400,h.err,h.field);
  const o=h.v;
  if(o.media_type==='video'&&b.data&&b.data.video_b64){
    const buf=parseVideoB64(b.data.video_b64);
    if(!buf)return sendError(req,res,400,'common.required','video');
    if(!looksLikeVideo(buf))return sendError(req,res,400,'Fayile ntabwo ari video (koresha mp4)');
    const ms=ctx.mediaStore;
    if(ms){
      const sv=await ms.saveStripVideo(id,buf);
      if(!sv.ok)return sendError(req,res,500,'err.server');
      o.video_url='/media/'+sv.path+'?v='+Date.now();
      o.video_proc=sv.processed?1:0;
      o.video_codec=sv.processed?'h264':(sv.codec||sniffCodec(buf));
    }
  }
  if(o.media_type!=='video')o.video_url=o.video_url||null;
  ctx.Q('UPDATE strip_ads SET text=?,title=?,text_en=?,title_en=?,cta=?,cta_en=?,theme=?,action_type=?,action_value=?,kind=?,active=?,start_at=?,end_at=?,priority=?,media_type=?,video_url=?,video_proc=?,video_codec=? WHERE id=?')
    .run(o.text||'',o.title||null,o.text_en||null,o.title_en||null,o.cta||null,o.cta_en||null,o.theme,o.action,o.value||null,o.kind,o.active,o.start_at,o.end_at,o.priority,o.media_type||'text',o.video_url||null,(o.video_proc!==undefined?o.video_proc:cur.video_proc),(o.video_codec!==undefined?o.video_codec:cur.video_codec),id);
  ctx.adminLog(admin.id,'strip.update','strip',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

function adminStripDelete(ctx,req,res,id,admin){
  ctx.Q('DELETE FROM strip_ads WHERE id=?').run(id);
  try{
    if(ctx.mediaStore){
      ctx.mediaStore.remove('strip-'+id+'.mp4');
      ctx.mediaStore.remove('strip-'+id+'.mp4.tmp.mp4');
      ctx.mediaStore.remove('strip-'+id+'.webm');
      ctx.mediaStore.remove('strip-'+id+'.avi');
      ctx.mediaStore.remove('strip-'+id+'-raw.bin');
      ctx.mediaStore.remove('strip-'+id+'.jpg');
      ctx.mediaStore.remove('strip-'+id+'.png');
      ctx.mediaStore.remove('strip-'+id+'.webp');
    }
  }catch(e){}
  ctx.adminLog(admin.id,'strip.delete','strip',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

function looksLikeVideo(buf){
  if(!buf||buf.length<12)return false;
  /* ISO BMFF / MP4 / MOV: ....ftyp (reject image/audio brands such as HEIC, AVIF, M4A) */
  if(buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70){
    const brand=buf.toString('latin1',8,12);
    const bad=['heic','heix','heim','heis','hevm','hevs','mif1','msf1','avif','avis','M4A ','M4B ','M4P ','crx '];
    return bad.indexOf(brand)===-1;
  }
  /* WebM / Matroska: 1A 45 DF A3 */
  if(buf[0]===0x1A&&buf[1]===0x45&&buf[2]===0xDF&&buf[3]===0xA3)return true;
  /* RIFF....AVI  (only AVI, not WAV/WebP) */
  if(buf[0]===0x52&&buf[1]===0x49&&buf[2]===0x46&&buf[3]===0x46&&buf.toString('latin1',8,12)==='AVI ')return true;
  return false;
}
function sniffImage(buf){
  if(!buf||buf.length<12)return null;
  if(buf[0]===0xFF&&buf[1]===0xD8&&buf[2]===0xFF)return 'jpg';
  if(buf[0]===0x89&&buf[1]===0x50&&buf[2]===0x4E&&buf[3]===0x47)return 'png';
  if(buf.toString('latin1',0,4)==='RIFF'&&buf.toString('latin1',8,12)==='WEBP')return 'webp';
  return null;
}
function sniffCodec(buf){
  try{
    const n=buf.length,W=2*1024*1024;
    const parts=n>W*2?[buf.subarray(0,W),buf.subarray(n-W)]:[buf];
    const has=function(tag){return parts.some(function(b){return b.indexOf(tag,0,'latin1')>=0})};
    if(has('hvc1')||has('hev1'))return 'hevc';
    if(has('avc1'))return 'h264';
    if(has('av01'))return 'av1';
    if(has('vp09'))return 'vp9';
    if(buf[0]===0x1A&&buf[1]===0x45&&buf[2]===0xDF&&buf[3]===0xA3)return 'webm';
  }catch(e){}
  return '';
}
async function readRawBody(req,max){
  const chunks=[];
  let total=0;
  try{
    for await (const chunk of req){
      total+=chunk.length;
      if(total>max)return {over:true};
      chunks.push(chunk);
    }
  }catch(e){return {fail:true}}
  return {buf:Buffer.concat(chunks)};
}
async function adminStripImageUpload(ctx,req,res,id,admin){
  const cur=ctx.Q('SELECT * FROM strip_ads WHERE id=?').get(id);
  if(!cur)return sendError(req,res,404,'err.notfound');
  const rb=await readRawBody(req,8*1024*1024);
  if(rb.over)return sendError(req,res,400,'Ifoto nini cyane (max 8MB)');
  if(rb.fail)return sendError(req,res,400,'err.server');
  const buf=rb.buf;
  if(!buf||buf.length<100)return sendError(req,res,400,'common.required','image');
  const kind=sniffImage(buf);
  if(!kind)return sendError(req,res,400,'Iyi fayile ntabwo ari ifoto (koresha JPG, PNG cyangwa WebP)');
  const ms=ctx.mediaStore;
  if(!ms)return sendError(req,res,500,'err.server');
  const sv=ms.saveStripImage(id,buf,kind);
  if(!sv.ok)return sendError(req,res,500,'err.server');
  const url='/media/'+sv.path+'?v='+Date.now();
  ctx.Q('UPDATE strip_ads SET media_type=?,image_url=? WHERE id=?').run('image',url,id);
  ctx.adminLog(admin.id,'strip.image','strip',String(id),url,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true,image_url:url});
}
async function adminStripVideoUpload(ctx,req,res,id,admin){
  const cur=ctx.Q('SELECT * FROM strip_ads WHERE id=?').get(id);
  if(!cur)return sendError(req,res,404,'err.notfound');
  const rb=await readRawBody(req,64*1024*1024);
  if(rb.over)return sendError(req,res,400,'Video nini cyane (max 64MB)');
  if(rb.fail)return sendError(req,res,400,'err.server');
  const buf=rb.buf;
  if(!buf||buf.length<100)return sendError(req,res,400,'common.required','video');
  if(!looksLikeVideo(buf))return sendError(req,res,400,'Fayile ntabwo ari video (koresha mp4)');
  const ms=ctx.mediaStore;
  if(!ms)return sendError(req,res,500,'err.server');
  const sv=await ms.saveStripVideo(id,buf);
  if(!sv.ok)return sendError(req,res,500,'err.server');
  const url='/media/'+sv.path+'?v='+Date.now();
  const codec=sv.processed?'h264':(sv.codec||sniffCodec(buf));
  ctx.Q('UPDATE strip_ads SET media_type=?,video_url=?,video_proc=?,video_codec=? WHERE id=?').run('video',url,sv.processed?1:0,codec||null,id);
  ctx.adminLog(admin.id,'strip.video','strip',String(id),url,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true,video_url:url,processed:!!sv.processed,codec:codec,size:buf.length});
}

function adminCapsList(ctx,req,res){
  const rows=ctx.Q('SELECT * FROM capabilities ORDER BY category,name').all();
  sendJson(req,res,200,{capabilities:rows});
}

async function adminCapsAdd(ctx,req,res,admin){
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const name=clean(data.name,80);
  const cat=clean(data.category,80);
  const nameEn=clean(data.name_en||'',80);
  if(!name||!cat||!TAX[cat])return sendError(req,res,400,'common.required');
  try{
    const r=ctx.Q('INSERT INTO capabilities(name,category,name_en,active) VALUES(?,?,?,1)').run(name,cat,nameEn||null);
    ctx.loadCaps();
    ctx.adminLog(admin.id,'cap.add','cap',String(r.lastInsertRowid),name,ctx.ipOf(req));
    sendJson(req,res,201,{ok:true,id:Number(r.lastInsertRowid)});
  }catch(e){return sendError(req,res,409,'common.error')}
}

async function adminCapsUpdate(ctx,req,res,id,admin){
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const c=ctx.Q('SELECT * FROM capabilities WHERE id=?').get(id);
  if(!c)return sendError(req,res,404,'err.notfound');
  const name=data.name!==undefined?clean(data.name,80):c.name;
  const cat=data.category?clean(data.category,80):c.category;
  const active=data.active!==undefined?(data.active?1:0):c.active;
  if(!name||name.length<2)return sendError(req,res,400,'common.required','name');
  if(cat&&!TAX[cat])return sendError(req,res,400,'common.required','category');
  try{
    ctx.Q('UPDATE capabilities SET name=?,category=?,active=? WHERE id=?').run(name,cat,active,id);
  }catch(e){
    if(/UNIQUE/i.test(String(e&&e.message||'')))return sendError(req,res,409,'common.error','name');
    return sendError(req,res,500,'err.server');
  }
  ctx.loadCaps();
  ctx.adminLog(admin.id,'cap.update','cap',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

function adminCapsDelete(ctx,req,res,id,admin){
  let inUse=false;
  try{inUse=ctx.Q('SELECT caps FROM profiles').all().some(r=>{try{return JSON.parse(r.caps||'[]').includes(id)}catch(e){return false}})}catch(e){}
  if(inUse)ctx.Q('UPDATE capabilities SET active=0 WHERE id=?').run(id);
  else ctx.Q('DELETE FROM capabilities WHERE id=?').run(id);
  ctx.loadCaps();
  ctx.adminLog(admin.id,inUse?'cap.deactivate':'cap.delete','cap',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true,deactivated:inUse});
}

function adminCategoriesList(ctx,req,res){
  sendJson(req,res,200,{categories:Object.keys(TAX)});
}

async function adminCategoriesAdd(ctx,req,res,admin){
  const b=await readBody(req,4096);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const name=clean(data.name,80);
  if(!name||name.length<2)return sendError(req,res,400,'common.required');
  if(['__proto__','constructor','prototype'].includes(name))return sendError(req,res,400,'common.required');
  if(Object.prototype.hasOwnProperty.call(TAX,name))return sendError(req,res,409,'common.error');
  TAX[name]=[];
  try{
    const ex=ctx.settings.get('extra_cats',[])||[];
    if(!ex.includes(name)){ex.push(name);ctx.settings.set('extra_cats',ex)}
  }catch(e){}
  ctx.adminLog(admin.id,'cat.add',null,null,name,ctx.ipOf(req));
  sendJson(req,res,201,{ok:true});
}

function adminCapRequests(ctx,req,res){
  const rows=ctx.Q("SELECT c.*,p.name,p.pid FROM cap_requests c LEFT JOIN profiles p ON p.user_id=c.user_id WHERE c.status='pending' ORDER BY c.id").all();
  sendJson(req,res,200,{requests:rows,categories:Object.keys(TAX)});
}

function adminFaqList(ctx,req,res){
  const rows=ctx.Q('SELECT * FROM help_faq ORDER BY category,sort_order').all();
  sendJson(req,res,200,{faq:rows});
}

async function adminFaqAdd(ctx,req,res,admin){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const q=clean(data.q,200);
  const a=clean(data.a,2000);
  const cat=clean(data.category,40)||'general';
  const terms=clean(data.terms,500);
  if(!q||!a||q.length<3||a.length<3)return sendError(req,res,400,'common.required');
  const r=ctx.Q('INSERT INTO help_faq(q,a,terms,category,sort_order,active,created_at) VALUES(?,?,?,?,?,1,?)').run(q,a,terms||null,cat,Number(data.sort_order)||0,Date.now());
  ctx.adminLog(admin.id,'faq.add','faq',String(r.lastInsertRowid),q,ctx.ipOf(req));
  sendJson(req,res,201,{ok:true,id:Number(r.lastInsertRowid)});
}

async function adminFaqUpdate(ctx,req,res,id,admin){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const data=b.data||{};
  const cur=ctx.Q('SELECT * FROM help_faq WHERE id=?').get(id);
  if(!cur)return sendError(req,res,404,'err.notfound');
  const q=data.q!==undefined?clean(data.q,200):cur.q;
  const a=data.a!==undefined?clean(data.a,2000):cur.a;
  const cat=data.category?clean(data.category,40):cur.category;
  const terms=data.terms!==undefined?clean(data.terms,500):cur.terms;
  const active=data.active!==undefined?(data.active?1:0):cur.active;
  ctx.Q('UPDATE help_faq SET q=?,a=?,category=?,terms=?,active=? WHERE id=?').run(q,a,cat,terms,active,id);
  ctx.adminLog(admin.id,'faq.update','faq',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

function adminFaqDelete(ctx,req,res,id,admin){
  ctx.Q('DELETE FROM help_faq WHERE id=?').run(id);
  ctx.adminLog(admin.id,'faq.delete','faq',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

function adminStats(ctx,req,res){
  const t=Date.now();
  const top=ctx.Q('SELECT q,COUNT(*) n FROM search_log WHERE at>? GROUP BY q ORDER BY n DESC LIMIT 20').all(t-7*DAY);
  const byDistrict=ctx.Q("SELECT district,COUNT(*) n FROM profiles p JOIN users u ON u.id=p.user_id WHERE u.status='active' GROUP BY district ORDER BY n DESC LIMIT 30").all();
  sendJson(req,res,200,{top_searches:top,by_district:byDistrict});
}

/* ===== END OF IGICE 10/16 ===== */EMBED['index.html'] = `<!doctype html>
<html lang="rw">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1a9b6c">
<meta name="description" content="AHABONA — Menya abantu. Menya amahirwe.">
<meta name="color-scheme" content="light">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icon.svg">
<title>AHABONA</title>
<style>
:root{
  --p:#1a9b6c;
  --pd:#158055;
  --pt:#fff;
  --pl:rgba(26,155,108,.12);
  --g:#d4a838;
  --gl:rgba(212,168,56,.16);
  --gd:#8a6100;
  --bg:#faf7ef;
  --s:#ffffff;
  --t:#1e2a32;
  --th:#12261c;
  --m:#5a6470;
  --b:#e8e4da;
  --e:#c3392c;
  --r:14px;
  --sh:0 1px 3px rgba(30,42,50,.06),0 4px 12px rgba(30,42,50,.05);
  --sh2:0 6px 20px rgba(30,42,50,.12);
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;height:100%}
body{
  margin:0;
  min-height:100vh;
  min-height:100dvh;
  display:flex;
  flex-direction:column;
  background:var(--bg);
  color:var(--t);
  font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  -webkit-font-smoothing:antialiased;
}
body>main{flex:1 0 auto}
body>footer{flex-shrink:0}
body>header{flex-shrink:0}
a{color:var(--p);text-decoration:none}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer}
:focus-visible{outline:2px solid var(--g);outline-offset:2px;border-radius:6px}
img{max-width:100%;display:block}
svg{display:block}
.skip{position:absolute;left:-9999px}
.skip:focus{left:12px;top:12px;z-index:100;background:var(--s);padding:8px 12px;border-radius:8px;box-shadow:var(--sh2)}
.wrap{max-width:1200px;margin:0 auto;padding:0 12px}
@media(min-width:900px){.wrap{padding:0 20px}}
header{position:sticky;top:0;z-index:5;background:var(--s);border-bottom:1px solid var(--b)}
.bar{display:flex;align-items:center;gap:8px;padding:10px 12px;max-width:1200px;margin:0 auto}
@media(min-width:900px){.bar{padding:12px 20px}}
.brand{font-weight:800;font-size:18px;letter-spacing:.4px;margin-right:auto;display:flex;align-items:center;gap:8px;color:var(--th)}
.brand .sun{width:28px;height:28px;flex-shrink:0}
/* #bSearch visible on mobile */
.ib{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;min-width:40px;padding:0 10px;border:0;background:transparent;border-radius:8px;color:var(--t);text-decoration:none}
.ib:hover{background:var(--pl)}
.pb{background:var(--p);color:var(--pt);font-weight:600;padding:0 14px;font-size:14px}
.pb:hover{background:var(--pd)}
.ol{border:1px solid var(--b)}
.lsw{display:flex;gap:2px;background:var(--pl);border-radius:8px;padding:2px}
.lsw button{border:0;background:transparent;color:var(--t);font-size:12px;font-weight:700;padding:6px 9px;border-radius:6px;min-height:30px}
.lsw button.on{background:var(--p);color:var(--pt)}
.nav-desktop{display:none;gap:2px;align-items:center}
@media(min-width:900px){.nav-desktop{display:flex}.nav-mobile{display:none}}
.menu{display:none;background:var(--s);border-bottom:1px solid var(--b);padding:4px 12px 8px}
.menu.on{display:block}
.menu button,.menu a{display:flex;width:100%;gap:10px;align-items:center;background:none;border:0;border-top:1px solid var(--b);padding:12px 4px;text-align:left;min-height:44px;color:var(--t);text-decoration:none;font:inherit}
.menu button:first-child,.menu a:first-child{border-top:0}
.strip{display:none;width:100%;border:0;background:var(--s);color:var(--m);font:inherit;font-size:13px;text-align:center;padding:7px 12px;border-bottom:1px solid var(--b);cursor:pointer;transition:opacity .3s,color .2s}
.strip:hover{color:var(--t)}
.strip.on{display:block}
.hero{position:relative;margin:12px 0 14px;border-radius:22px;overflow:hidden;color:#fff;box-shadow:var(--sh);isolation:isolate}
.hero-track{display:flex;transition:transform .55s cubic-bezier(.22,.61,.36,1);will-change:transform}
.hero-slide{position:relative;flex:0 0 100%;box-sizing:border-box;min-height:200px;padding:20px 20px 44px;display:flex;flex-direction:column;align-items:flex-start;gap:8px;background:var(--hb,linear-gradient(135deg,#0f5c45,#1a9b6c 58%,#d4a838));overflow:hidden}
.hero-slide::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.30),rgba(0,0,0,0) 75%);pointer-events:none}
.hero-slide::after{content:"";position:absolute;right:-34px;top:-34px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.30),rgba(255,255,255,0) 70%);pointer-events:none}
.hero-slide>*{position:relative;z-index:1}
.hero-slide.has-vid{min-height:260px;background:#000!important}
.hero-vid,.hero-iframe{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;border:0;pointer-events:none;background:#000}
.hero-slide.has-vid::before{content:"";position:absolute;inset:0;background:linear-gradient(105deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.3) 50%,rgba(0,0,0,.15) 100%);z-index:1;pointer-events:none}
.hero-slide.has-vid::after{opacity:.08}
.hero-copy{position:relative;z-index:2;display:flex;flex-direction:column;align-items:flex-start;gap:8px;width:100%}
.hero-slide.has-vid .hero-copy{pointer-events:none}
.hero-slide.has-vid .hero-cta{pointer-events:auto;cursor:pointer}
.hero-vfb{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(0,0,0,.5);color:#fff;text-align:center;padding:16px;font-weight:600}
.hero-vfb[hidden],.hero-vbtn[hidden],.hero-vlnk[hidden]{display:none}
.hero-vbtn{border:0;border-radius:999px;background:#fff;color:#12261c;padding:12px 24px;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.3)}
.hero-vlnk{color:#fff;text-decoration:underline;font-size:14px}

.hero-b{display:inline-flex;align-items:center;font-size:12px;font-weight:700;letter-spacing:.2px;padding:4px 11px;border-radius:999px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.30)}
.hero-t{margin:2px 0 0;font-size:clamp(23px,6.4vw,32px);line-height:1.15;font-weight:800;letter-spacing:-.2px;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.25)}
.hero-p{margin:0;max-width:34em;font-size:15px;line-height:1.45;color:rgba(255,255,255,.92)}
.hero-cta{margin-top:6px;border:0;border-radius:999px;background:#fff;color:#12261c;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.2)}
.hero-cta:hover{background:#f3efe4}
.hero-cta:focus-visible,.hero-dot:focus-visible{outline:3px solid #fff;outline-offset:2px}
.hero-dots{position:absolute;left:20px;bottom:14px;display:flex;gap:8px;z-index:2}
.hero-dot{width:9px;height:9px;padding:0;border:0;border-radius:99px;background:rgba(255,255,255,.45);cursor:pointer;transition:width .25s ease,background .25s ease}
.hero-dot.on{width:24px;background:#fff}
.hero-slide[data-th=ijoro]{--hb:linear-gradient(160deg,#0c1424 0%,#10213a 58%,#0e3a33 100%)}
.hero-slide[data-th=ijoro] .hero-t{background:linear-gradient(90deg,#5ee0a0,#f2c94c 55%,#ffb020);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none}
.hero-slide[data-th=izuba]{--hb:linear-gradient(135deg,#0f5c45,#1a9b6c 58%,#d4a838)}
.hero-slide[data-th=kigali]{--hb:linear-gradient(135deg,#0b3a53,#1d7a8c 60%,#5fd0c0)}
.hero-slide[data-th=musanze]{--hb:linear-gradient(135deg,#1f2a44,#3d4f7a 55%,#8fb8a0)}
.hero-slide[data-th=rubavu]{--hb:linear-gradient(135deg,#052a5e,#0b63c9 60%,#4fc3f7)}
.hero-slide[data-th=huye]{--hb:linear-gradient(135deg,#4a2c12,#9a5b1f 60%,#e0b04b)}
.hero-slide[data-th=nyungwe]{--hb:linear-gradient(135deg,#06301f,#126b3f 60%,#7ccf6a)}
.hero-slide[data-th=ibendera]{--hb:linear-gradient(135deg,#0a4aa6,#1a9b6c 60%,#e6b800)}
@media (prefers-reduced-motion:reduce){.hero-track{transition:none}.hero-dot{transition:none}}
main{padding:16px 12px 28px}
@media(min-width:900px){main{padding:24px 20px 40px}}
.cols{max-width:1200px;margin:0 auto}
@media(min-width:900px){.cols{display:grid;grid-template-columns:260px 1fr;gap:20px;align-items:start}}
.sidebar{display:none}
@media(min-width:900px){.sidebar{display:block;position:sticky;top:80px}}
.sidebar h2{font-size:13px;text-transform:uppercase;letter-spacing:.5px;color:var(--m);margin:0 0 8px;font-weight:700}
.sidebar .grp{margin-bottom:14px}
.sidebar label{display:block;font-weight:600;margin-bottom:4px;font-size:13px}
.sidebar input,.sidebar select{width:100%;min-height:40px;border:1px solid var(--b);border-radius:10px;background:var(--s);padding:0 10px}
.q{display:grid;grid-template-columns:1fr auto;gap:8px;margin-bottom:10px}.q .loc{max-width:140px;min-width:0}.q .loc select{width:100%;max-width:140px}
.q input,.q select{min-height:44px;border:1px solid var(--b);border-radius:10px;background:var(--s);padding:0 12px;width:100%}
.q input{flex:2 1 200px}
.q select{flex:1 1 140px}
.q .loc{position:relative;flex:1 1 160px;display:flex;align-items:center}
.q .loc svg{position:absolute;left:11px;width:16px;height:16px;color:var(--m);pointer-events:none}
.q .loc select{padding-left:34px}
@media(min-width:900px){.q{display:none}}
.chips{display:flex;gap:8px;overflow-x:auto;padding:4px 0 12px;margin-bottom:8px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex:none;border:1px solid var(--b);background:var(--s);border-radius:20px;padding:7px 13px;font-size:14px;min-height:40px}
.chip.on{background:var(--p);color:var(--pt);border-color:var(--p)}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:640px){.grid{grid-template-columns:repeat(3,1fr);gap:14px}}
@media(min-width:900px){.grid{grid-template-columns:repeat(4,1fr);gap:14px}}
@media(min-width:1280px){.grid{grid-template-columns:repeat(5,1fr);gap:16px}}
/* ===== END OF IGICE 11a/16 ===== */
`;EMBED['index.html'] += `
.card{background:var(--s);border:1px solid var(--b);border-radius:var(--r);padding:10px;text-align:left;display:flex;flex-direction:column;gap:6px;min-width:0;box-shadow:var(--sh);transition:transform .15s,box-shadow .15s}
.card:hover{transform:translateY(-2px);box-shadow:var(--sh2)}
.card:active{transform:none}
.card .nm{font-weight:700;font-size:15px;color:var(--th);line-height:1.3;letter-spacing:-.01em}
.card .cp{font-size:13px;color:var(--p);font-weight:600}
.card .lc{font-size:12px;color:var(--m);display:flex;align-items:center;gap:4px}
.av,.big{overflow:hidden;background:var(--pl);color:var(--p);display:flex;align-items:center;justify-content:center;font-weight:700}
.av{width:100%;aspect-ratio:5/4;border-radius:8px;font-size:26px;margin-bottom:4px}
.big{width:96px;height:96px;border-radius:12px;font-size:32px;flex:none}
.av img,.big img{width:100%;height:100%;object-fit:cover}
.av .ph,.big .ph{width:46px;height:46px;border-radius:50%;background:var(--s);color:var(--p);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700}
.big .ph{width:56px;height:56px;font-size:20px}
.nm{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px}
.cp{font-weight:500;font-size:13.5px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lc{color:var(--m);font-size:12.5px;display:flex;gap:4px;align-items:center}
.lc svg{width:14px;height:14px;flex:none}
.me{width:8px;height:8px;border-radius:50%;background:var(--g);margin-left:auto;flex:none}
.skel{background:var(--b);border-radius:10px;animation:pu 1.2s infinite}
@keyframes pu{50%{opacity:.5}}
.sm{text-align:center;margin:16px 0}
.empty{grid-column:1/-1;padding:48px 16px;text-align:center;color:var(--m);display:flex;flex-direction:column;align-items:center;gap:10px}
.empty .empty-icon{width:56px;height:56px;border-radius:50%;background:var(--pl);display:flex;align-items:center;justify-content:center;color:var(--p);margin-bottom:4px}
.empty .empty-title{font-size:17px;font-weight:700;color:var(--th);margin:0}
.empty .empty-sub{font-size:14px;color:var(--m);margin:0;max-width:280px;line-height:1.4}
.empty .ib{margin-top:8px}
.note{font-size:13px;color:var(--m);margin-top:8px}
footer{border-top:1px solid var(--b);margin-top:auto;padding:20px 12px 28px;color:var(--m);font-size:13px;background:var(--s)}
footer .wrap{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between}
.lk{background:none;border:0;color:var(--m);font-size:13px;text-decoration:underline;padding:6px;min-height:32px}
.ov{position:fixed;inset:0;background:rgba(30,42,50,.5);z-index:20;display:none;align-items:flex-end;justify-content:center}
.ov.on{display:flex}
.sh{background:var(--s);width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:16px 16px 0 0;padding:16px;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}
@media(min-width:640px){.ov{align-items:center}.sh{border-radius:16px;max-height:90vh;padding:20px}}
@media(min-width:900px){.sh{max-width:820px}}
.sh h2{margin:0 0 8px;font-size:20px}
.sh h3{margin:14px 0 4px;font-size:15px}
.sh p{margin:4px 0}
.row{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}
.act{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.f label{display:block;margin:12px 0 4px;font-weight:600}
.f input,.f select,.f textarea{width:100%;min-height:44px;border:1px solid var(--b);border-radius:10px;background:var(--s);padding:8px 12px}
.f textarea{min-height:96px;padding-top:10px}
.f .ck{display:flex;gap:8px;align-items:flex-start;font-weight:400;font-size:14px}
.f .ck input{width:20px;min-height:20px;margin-top:2px}
.er{color:var(--e);font-size:13px;margin-top:4px;min-height:1em}
.box{background:var(--pl);border-radius:10px;padding:10px 12px;font-size:13px;margin-top:12px}
.prog{height:4px;background:var(--b);border-radius:2px;margin:6px 0}
.prog>div{height:4px;background:linear-gradient(90deg,var(--p),var(--g));border-radius:2px;transition:width .25s}
#toast{pointer-events:none;position:fixed;left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));max-width:480px;margin:auto;background:var(--t);color:var(--bg);padding:12px 14px;border-radius:10px;z-index:30;display:none;box-shadow:0 6px 20px rgba(30,42,50,.2);border-left:3px solid var(--g)}
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;background:var(--gl);color:var(--gd);font-size:12px;font-weight:600}
.badge.ok{background:var(--pl);color:var(--p)}
.profile-grid{display:grid;grid-template-columns:1fr;gap:16px}
@media(min-width:900px){.profile-grid{grid-template-columns:minmax(280px,420px) 1fr;gap:24px;align-items:start}}
.gallery-main{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;background:var(--pl)}
.gallery-thumbs{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.gallery-thumbs img{width:56px;height:56px;object-fit:cover;border-radius:8px;border:2px solid transparent;cursor:pointer}
.gallery-thumbs img.on{border-color:var(--p)}
.saver-hint{display:none;background:var(--gl);color:var(--gd);padding:10px 12px;border-radius:10px;font-size:13px;margin-top:10px}
:root[data-saver="1"] .av img,:root[data-saver="1"] .big img,:root[data-saver="1"] .gallery-main,:root[data-saver="1"] .gallery-thumbs img{display:none!important}
:root[data-saver="1"] .saver-hint{display:block}
@media(prefers-reduced-motion:reduce){.card{transition:none}.skel{animation:none}.prog>div{transition:none}}

#splash{position:fixed;inset:0;z-index:99999;background:#faf7ef;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;margin:0;pointer-events:all;
  animation:spGone .3s ease .9s forwards}
#splash.hide,#splash.gone{opacity:0!important;pointer-events:none!important;visibility:hidden!important;display:none!important}
@keyframes spGone{to{opacity:0;pointer-events:none;visibility:hidden}}
#splash .sp-sun-wrap{width:88px;height:88px;position:relative;opacity:0;animation:spSunIn .35s ease forwards}
#splash .sp-sun-wrap svg{width:100%;height:100%;filter:drop-shadow(0 2px 8px rgba(212,168,56,.35))}
#splash .sp-rays{transform-origin:50% 50%;animation:spSpin 8s linear infinite}
#splash .sp-name{font-weight:800;font-size:24px;letter-spacing:.5px;color:#1e2a32;margin-top:16px;opacity:0;animation:spFade .3s ease .15s forwards}
#splash .sp-tag{font-size:14px;color:#5a6470;margin-top:8px;opacity:0;animation:spFade .3s ease .3s forwards}
#splash .sp-brand{font-size:12px;font-weight:700;letter-spacing:.28em;color:#d4a838;margin-top:10px;text-transform:uppercase;opacity:0;animation:spFade .3s ease .4s forwards}
#splash .sp-bar{width:120px;max-width:120px;height:3px;border-radius:2px;background:rgba(26,155,108,.15);margin-top:18px;overflow:hidden;opacity:0;animation:spFade .2s ease .45s forwards;flex:none;align-self:center}
#splash .sp-bar>i{display:block;height:100%;width:0;max-width:100%;border-radius:2px;background:linear-gradient(90deg,#1a9b6c,#d4a838);animation:spBar .35s ease .5s forwards}
@keyframes spSunIn{from{opacity:0;transform:translateY(14px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes spFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes spSpin{to{transform:rotate(360deg)}}
@keyframes spBar{from{width:0}to{width:100%}}
@media (prefers-reduced-motion:reduce){
  #splash .sp-sun-wrap,#splash .sp-name,#splash .sp-tag,#splash .sp-brand,#splash .sp-bar,#splash .sp-rays{animation:none!important;opacity:1;transform:none}
  #splash .sp-bar>i{animation:none!important;width:100%}
}

.job-list{
  max-height:40vh;
  overflow-y:auto;
  border:1px solid var(--b);
  border-radius:10px;
  padding:6px 10px;
  margin-top:8px;
  background:var(--s);
  -webkit-overflow-scrolling:touch;
}
@media(min-width:900px){
  .job-list{max-height:320px}
}
.job-cat{
  font-size:11px;
  font-weight:700;
  letter-spacing:.04em;
  text-transform:uppercase;
  color:var(--m);
  margin:12px 0 4px;
  padding:0 2px;
}
.job-cat:first-child{margin-top:4px}
.job-item{
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 6px;
  border-radius:6px;
  cursor:pointer;
  font-size:14px;
  color:var(--t);
  line-height:1.3;
}
.job-item:hover{background:var(--pl)}
.job-item.on{background:var(--pl);font-weight:600}
.job-item.disabled{opacity:.45;cursor:not-allowed}
.job-item input[type=checkbox]{
  width:18px;
  height:18px;
  flex:none;
  accent-color:var(--p);
}
.job-count{
  font-size:12px;
  font-weight:700;
  color:var(--p);
  margin:4px 2px 6px;
}
#rg-jobs-search{margin-bottom:8px}
</style>
</head>
<body>
<div id="splash" role="status" aria-live="polite" aria-label="AHABONA">
  <div class="sp-sun-wrap" aria-hidden="true">
    <svg viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="spg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f0c14b"/>
          <stop offset="100%" stop-color="#d4a838"/>
        </linearGradient>
      </defs>
      <g class="sp-rays" stroke="url(#spg)" stroke-width="3.2" stroke-linecap="round"><line x1="50.0" y1="24.0" x2="50.0" y2="8.0"/><line x1="64.1" y1="28.1" x2="72.7" y2="14.7"/><line x1="73.7" y1="39.2" x2="88.2" y2="32.6"/><line x1="75.7" y1="53.7" x2="91.6" y2="56.0"/><line x1="69.6" y1="67.0" x2="81.7" y2="77.5"/><line x1="57.3" y1="74.9" x2="61.8" y2="90.3"/><line x1="42.7" y1="74.9" x2="38.2" y2="90.3"/><line x1="30.4" y1="67.0" x2="18.3" y2="77.5"/><line x1="24.3" y1="53.7" x2="8.4" y2="56.0"/><line x1="26.3" y1="39.2" x2="11.8" y2="32.6"/><line x1="35.9" y1="28.1" x2="27.3" y2="14.7"/></g>
      <circle cx="50" cy="50" r="18" fill="url(#spg)"/>
      <circle cx="50" cy="50" r="12" fill="#faf7ef" opacity=".25"/>
    </svg>
  </div>
  <div class="sp-name">AHABONA</div>
  <div class="sp-tag">Menya abantu. Menya amahirwe.</div>
  <div class="sp-brand">IZERE</div>
  <div class="sp-bar" aria-hidden="true"><i></i></div>
</div>
<script src="/splash.js" defer></script>
<a class="skip" href="#main" data-i18n="a11y.skip">Genda ku bikubiyemo</a>
<header>
<div class="bar">
<a class="brand" href="/" id="brand"><span id="sunm"></span>AHABONA</a>
<div class="lsw" id="lsw" role="group" aria-label="Ururimi">
<button type="button" data-lang="rw">RW</button>
<button type="button" data-lang="en">EN</button>
</div>
<button class="ib" data-m="notif" id="bn" style="display:none;position:relative" aria-label="Notifications"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span id="bn-n" style="display:none;position:absolute;top:2px;right:2px;background:var(--e);color:#fff;border-radius:10px;font-size:10px;min-width:16px;padding:1px 4px;line-height:14px">0</span></button>
<button class="ib nav-mobile" id="bSearch" aria-label="Shaka"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></button>
<button class="ib pb" id="bReg"><span id="rg" data-i18n="nav.register">Iyandikishe</span></button>
<nav class="nav-desktop" aria-label="Main">
<button class="ib" data-m="home"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 11l9-8 9 8v10H3z"/></svg><span data-i18n="nav.home">Ahabanza</span></button>
<button class="ib" data-m="about"><span data-i18n="nav.about">Ibyerekeye</span></button>
<button class="ib" data-m="help"><span data-i18n="nav.help">Ubufasha</span></button>
<button class="ib" data-m="saved" id="ms" style="display:none"><span data-i18n="nav.saved">Abitse</span></button>
<button class="ib" data-m="login"><span id="lt" data-i18n="nav.login">Injira</span></button>
</nav>
<button class="ib nav-mobile" id="bMenu" aria-label="Menu"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
</div>
<nav class="menu" id="menu" aria-label="Menu">
<button data-m="home"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 11l9-8 9 8v10H3z"/></svg><span data-i18n="nav.home">Ahabanza</span></button>
<button data-m="about"><span data-i18n="nav.about">Ibyerekeye</span></button>
<button data-m="help"><span data-i18n="nav.help">Ubufasha</span></button>
<button data-m="saver" id="msv"><span id="svl" data-i18n="saver.off">Kubika data: off</span></button>
<button data-m="saved" id="ms2" style="display:none"><span data-i18n="nav.saved">Abitse</span></button>
<button data-m="login"><span id="lt2" data-i18n="nav.login">Injira</span></button>
</nav>
</header>
<button class="strip" id="strip" aria-live="polite" type="button"></button>
<main id="main">
<div class="cols">
<aside class="sidebar" aria-label="Filters">
<h2 data-i18n="filters">Filters</h2>
<div class="grp">
<label for="sq" data-i18n="filters.search">Shakisha</label>
<input id="sq" type="search" placeholder="Umushoferi, umubaji..." autocomplete="off">
</div>
<div class="grp">
<label for="sp" data-i18n="filters.prov">Intara</label>
<select id="sp"></select>
</div>
<div class="grp">
<label for="sd" data-i18n="filters.dist">Akarere</label>
<select id="sd" disabled></select>
</div>
<div class="grp">
<label for="ss" data-i18n="filters.sort">Gutondeka</label>
<select id="ss">
<option value="rel">Bihuye cyane</option>
<option value="fresh">Bishya</option>
<option value="top">Amanota</option>
<option value="new">Abashya</option>
</select>
</div>
<div class="grp">
<button class="ib ol" id="sclear" style="width:100%" data-i18n="filters.clear">Siba byose</button>
</div>
</aside>
<div>
<section class="hero" id="hero" aria-roledescription="carousel" aria-label="AHABONA">
<div class="hero-track" id="heroTrack">
<div class="hero-slide" data-th="ijoro">
<span class="hero-b" data-i18n="hero.free.b">Urugo rw’Izuba</span>
<h2 class="hero-t" data-i18n="hero.free.t">Ubuntu 100%</h2>
<p class="hero-p" data-i18n="hero.free.p">Gushaka umukozi no kwiyandikisha ntibyishyurwa. Nta kwishyura na gato ubu.</p>
<button class="hero-cta" type="button" data-hero-act="register" data-hero-val="" data-i18n="hero.free.cta">Iyandikishe ku buntu</button>
</div>
</div>
<div class="hero-dots" id="heroDots"></div>
</section>
<div class="q" id="qbox">
<input id="q" type="search" placeholder="Shaka uwo ukeneye" aria-label="Shaka">
<div class="loc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg><select id="fp" aria-label="Intara"></select></div>
<select id="fd" aria-label="Akarere" style="display:none"></select>
</div>
<div class="chips" id="chips"></div>
<div class="grid" id="grid" aria-live="polite"></div>
<div class="sm"><button class="ib ol" id="more" style="display:none" data-i18n="home.more">Erekana abandi</button></div>
</div>
</div>
</main>
<footer>
<div class="wrap">
<div>© <span id="yr"></span> AHABONA.</div>
<div>
<button class="lk" data-m="help"><span data-i18n="nav.help">Ubufasha</span></button>
<button class="lk" data-m="about"><span data-i18n="nav.about">Ibyerekeye</span></button>
<a class="lk" href="/terms" data-i18n="footer.terms">Amabwiriza</a>
<a class="lk" href="/privacy" data-i18n="footer.privacy">Ibanga</a>
</div>
</div>
</footer>
<div class="ov" id="ov" role="dialog" aria-modal="true" aria-hidden="true"><div class="sh" id="sh"></div></div>
<div id="toast" role="status"></div>
<noscript><div class="wrap" style="padding:24px">AHABONA ikenera JavaScript kugira ngo ikore.</div></noscript>
<script src="/app.js" defer></script>
</body>
</html>`;

/* ===== END OF IGICE 11/16 ===== */EMBED['app.js'] = `
'use strict';
(function(){
if(window.__ahabona)return;
window.__ahabona=true;

var LANG='rw';
try{var s=localStorage.getItem('ahabona_lang');if(s==='rw'||s==='en')LANG=s}catch(e){}
if(!LANG||(LANG!=='rw'&&LANG!=='en')){
  try{
    var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
    if(tz.indexOf('Kigali')!==-1)LANG='rw';
    else{
      var nv=(navigator.language||'').toLowerCase();
      if(nv.indexOf('rw')===0||nv.indexOf('kinya')!==-1)LANG='rw';
      else LANG='en';
    }
  }catch(e){LANG='rw'}
}

var I18N={
  rw:{
    'a11y.skip':'Genda ku bikubiyemo',
    'nav.home':'Ahabanza','nav.about':'Ibyerekeye','nav.help':'Ubufasha','nav.saved':'Abitse',
    'nav.login':'Injira','nav.logout':'Sohoka','nav.register':'Iyandikishe','nav.profile':'Umwirondoro',
    'nav.admin':'Ubuyobozi',
    'home.search.ph':'Shaka uwo ukeneye','home.results':'Ibisubizo {{count}}',
    'home.empty':'Nta muntu ubonetse hano.','home.empty.hint':'Gerageza irindi jambo, cyangwa uhitemo akarere kose.','hero.free.b':'Urugo rw’Izuba','hero.free.t':'Ubuntu 100%','hero.free.p':'Gushaka umukozi no kwiyandikisha ntibyishyurwa. Nta kwishyura na gato ubu.','hero.free.cta':'Iyandikishe ku buntu','hero.k.info':'Urugo rw’Izuba','hero.k.tip':'Inama','hero.k.announcement':'Itangazo','hero.k.city':'Umujyi','hero.k.promo':'Iyamamaza','hero.k.sponsor':'Iyamamaza','hero.cta.search':'Shaka','hero.cta.focus':'Shaka ubu','hero.cta.register':'Iyandikishe','hero.cta.help':'Ubufasha','hero.cta.about':'Menya byinshi','hero.cta.link':'Reba','hero.cta.phone':'Hamagara','home.loading':'Turimo gushakisha…',
    'home.error':'Seriveri ntiboneka cyangwa nta interineti.','home.retry':'Ongera ugerageze',
    'home.more':'Erekana abandi','home.first':'Nta muntu urabona hano. Iyandikishe kugira ngo ube uwa mbere.',
    'home.offline':'Nta interineti. Reba amakuru yabitswe.',
    'home.widenArea':'Shakira mu ntara yose','home.clearArea':'Kuraho aho ari','home.tryOther':'Gerageza irindi jambo',
    'filters':'Muyunguruzi','filters.search':'Shakisha','filters.prov':'Intara','filters.dist':'Akarere',
    'filters.sort':'Gutondeka','filters.clear':'Siba byose','filters.allProv':'Intara zose','filters.allDist':'Akarere kose',
    'sort.rel':'Bihuye cyane','sort.fresh':'Bishya','sort.top':'Amanota','sort.new':'Abashya',
    'theme.auto':'Isura: byikora','theme.light':'Isura: umucyo','theme.dark':'Isura: umwijima',
    'saver.off':'Kubika data: off','saver.on':'Kubika data: on',
    'profile.view':'Umwirondoro wose','profile.back':'Subira','profile.save':'Bika','profile.saved':'Wabitse',
    'profile.share':'Sangira','profile.report':'Menyesha ikibazo','profile.edit':'Hindura',
    'profile.call':'Hamagara','profile.message':'Vugana','profile.notfound':'Umwirondoro ntubonetse',
    'profile.verified':'Yemejwe','profile.fresh':'Yavuguruwe vuba','profile.showPhoto':'Erekana ifoto',
    'profile.phone':'Telefoni','profile.whatsapp':'WhatsApp','profile.contact':'Kuvugana',
    'profile.experience':'Uburambe','profile.education':'Amashuri','profile.languages':'Indimi',
    'profile.availability':'Igihe ariho','profile.skills':'Ubushobozi','profile.bio':'Ibyerekeye',
    'profile.serves':'Akorera','profile.age':'Imyaka','profile.gender':'Igitsina',
    'profile.safety':'Mbere yo guhura: ntukishyure mbere, uhurire ahantu hari abandi, kandi wisuzumire ubushobozi bwe.',
    'reg.title':'Iyandikishe','reg.edit':'Hindura umwirondoro','reg.next':'Komeza','reg.prev':'Subira',
    'reg.submit':'Emeza','reg.saving':'Tegereza…','reg.step':'Intambwe {{n}} kuri {{total}}',
    'reg.s1':'Abo uri bo','reg.s2':'Umwirondoro','reg.s3':'Icyo ushoboye','reg.s4':'Kuvugana','reg.s5':'Konti','reg.s6':'Amabwiriza',
    'reg.name':'Izina ryawe','reg.birthdate':'Itariki yavukiye','reg.gender':'Igitsina',
    'reg.gender.pick':'Hitamo igitsina','reg.province':'Intara utuyemo','reg.province.pick':'Hitamo intara',
    'reg.district':'Akarere utuyemo','reg.district.pick':'Hitamo akarere','reg.service':'Aho ukorera (ihitamo)',
    'reg.service.hint':'Hitamo kugeza ku turere 5.','reg.photo':'Ifoto yawe',
    'reg.photo.hint':'Ifoto ni ihitamo. Ushobora kongeraho amafoto atarenze atatu.','reg.photo.add':'Shyiraho ifoto','reg.photo.working':'Ifoto iri gutunganywa…','reg.photo.fail':'Iyi foto ntishobora gusomwa. Gerageza indi, cyangwa uyifotore na none.','reg.photo.max':'Amafoto atatu ni yo ntarengwa.','reg.bio.ph':'Urugero: Mfite uburambe bw’imyaka 5','reg.youtube':'Video ya YouTube (si ngombwa)','reg.youtube.hint':'Link ya video yawe. Igaragara ku mwirondoro wuzuye gusa.','profile.video':'Video','profile.watchVideo':'Reba kuri YouTube','profile.link':'Link',
    'reg.edu':'Amashuri','reg.edu.pick':'Hitamo urwego','reg.bio':'Ubwiyerekane bugufi',
    'reg.exp':'Uburambe bw’akazi','reg.exp.hint':'Andika akazi wakoze (ihitamo).',
    'reg.langs':'Indimi (ihitamo)','reg.avail':'Igihe ariho (ihitamo)',
    'reg.avail.morning':'Mu gitondo','reg.avail.afternoon':'Ku manywa','reg.avail.evening':'Nimugoroba',
    'reg.avail.weekday':'Ku wa mbere - Ku wa gatanu','reg.avail.weekend':'Weekend',
    'reg.jobs':'Icyo ushoboye','reg.jobs.hint':'Hitamo kugeza kuri 3.','reg.jobs.find':'Shaka umurimo',
    'reg.jobs.other':'Ntabona umurimo wanjye','reg.jobs.otherText':'Andika umurimo wawe',
    'reg.phone':'Telefoni','reg.phone.hint':'Izagaragara ku mwirondoro wawe.','reg.phone.ph':'0792053086',
    'reg.phone.agree':'Nzi kandi nemeye ko nimero yanjye izagaragara.','reg.wa':'WhatsApp (ihitamo)',
    'reg.phones':'Izindi telefoni (ihitamo)','reg.phones.hint':'Kugeza kuri 4 zindi.','reg.phones.add':'Ongeraho iyindi telefoni','reg.email.public':'Email yo kwakirira abandi (si ngombwa)','reg.email.public.hint':'Izagaragara ku mwirondoro wawe.','reg.social':'Imbuga nkoranyambaga (si ngombwa)','reg.social.add':'Ongeraho imbuga nkoranyambaga',
    'reg.email':'Email','reg.email.hint':'Ntigaragara ku bandi.','reg.email.ph':'izere.eddy@email.com',
    'reg.password':'Ijambobanga','reg.password.hint':'Nibura inyuguti 8.',
    'reg.password.show':'Erekana','reg.password.hide':'Hisha','reg.terms':'Nzi kandi nemeye amabwiriza',
    'reg.success':'Wiyandikishije neza!','reg.view':'Reba umwirondoro wanjye',
    'reg.draft':'Byabitswe kuri iyi telefoni. Ushobora gukomeza nyuma.',
    'reg.draftRestore':'Wari utangiye kwiyandikisha. Ukomeza?',
    'reg.err.name':'Andika izina ryawe ryuzuye (nibura inyuguti 3).',
    'reg.err.birthdate':'Andika itariki yavukiye.','reg.err.age':'Ugomba kuba nibura imyaka 18.',
    'reg.err.gender':'Hitamo igitsina.','reg.err.province':'Hitamo intara.','reg.err.district':'Hitamo akarere.',
    'reg.err.photo':'Ifoto ntiyemewe cyangwa nini cyane. Gerageza indi.','reg.err.jobs':'Hitamo nibura umurimo umwe.',
    'reg.err.jobs3':'Hitamo imirimo itarenze 3.','reg.err.other':'Andika umurimo wawe (nibura inyuguti 3).',
    'reg.err.phone':'Andika telefoni nyayo, urugero 0788123456.','reg.err.phone.agree':'Emeza ko nimero yawe igaragara.',
    'reg.err.wa':'Andika nimero ya WhatsApp nyayo.','reg.err.phones':'Andika telefoni nyazo.',
    'reg.err.email':'Andika email nyayo.','reg.err.password':'Ijambobanga nibura inyuguti 8.',
    'reg.err.terms':'Ugomba kwemera amabwiriza.',
    'login.title':'Injira','login.id':'Email cyangwa telefoni','login.id.ph':'Email cyangwa telefoni','common.save':'Bika','login.password':'Ijambobanga',
    'login.submit':'Injira','login.working':'Turimo kukwinjiza…','login.forgot':'Nibagiwe ijambobanga',
    'login.orReg':'Nta konti? Iyandikishe','login.err':'Email, telefoni cyangwa ijambobanga si byo.',
    'login.ok':'Winjiye neza.','logout.ok':'Wasohotse.',
    'forgot.title':'Nibagiwe ijambobanga','forgot.email':'Email yawe','forgot.submit':'Ohereza',
    'forgot.sent':'Niba iyi email ibaho, twohereje ubutumwa bufite link.','forgot.hint':'Tuzakoherereza link yo gushyiraho irindi jambobanga.',
    'reset.title':'Ijambobanga rishya','reset.new':'Ijambobanga rishya','reset.submit':'Bika',
    'reset.ok':'Ijambobanga ryabitswe. Injira.','reset.err':'Link yarangiye cyangwa ntiyemewe.',
    'restore.title':'Konti iri mu gihe cyo gusibwa','restore.body':'Warasabye gusiba konti yawe. Iracyashobora gusubizwa mu mezi 6. Ushaka kuyisubiza?',
    'restore.yes':'Yego, subiza','restore.no':'Oya','restore.ok':'Konti yasubijwe.',
    'account.title':'Konti yawe','account.myProfile':'Umwirondoro wanjye','account.edit':'Hindura umwirondoro',
    'account.password':'Hindura ijambobanga','account.delete':'Siba konti',
    'account.deleteWarn':'Konti yawe izahita ihishwa. Ishobora gusubizwa mu mezi 6. Nyuma yaho isibwa burundu.',
    'account.currentPw':'Ijambobanga rya none','account.newPw':'Ijambobanga rishya',
    'account.confirmPw':'Andika ijambobanga kugira ngo wemeze','account.logout':'Sohoka',
    'account.logoutAll':'Sohoka kuri byose','account.deleteOk':'Gusiba byakiriwe',
    'account.deleteBody':'Konti yawe yahishwe. Izamara amezi 6 ishobora gusubizwa. Nyuma yaho izasibwa burundu.',
    'account.admin':'Ubuyobozi',
    'saved.title':'Abantu wabitse','saved.empty':'Nta muntu urabika. Kanda "Bika" ku mwirondoro w’umuntu.',
    'saved.ok':'Wabitse.','saved.removed':'Wakuyeho.',
    'report.title':'Menyesha ikibazo','report.r.wrong':'Amakuru atari yo','report.r.photo':'Ifoto itari iyo',
    'report.r.behavior':'Imyitwarire mibi','report.r.other':'Ikindi','report.submit':'Emeza',
    'report.hint':'Kizagera ku bashinzwe kugenzura.','report.ok':'Amakuru yawe yakiriwe.',
    'help.title':'Ubufasha','help.search':'Shaka igisubizo','help.ask':'Baza ubufasha',
    'help.ask.ph':'Urugero: Nshyiraho nte ifoto?','help.send':'Baza','help.hint':'Ibisubizo biva mu makuru yemewe gusa.',
    'help.no':'Nta gisubizo kibonetse. Gerageza andi magambo.','help.contact':'Vugana natwe',
    'help.contact.hint':'Ntubonye igisubizo? Twandikire.','help.contactForm.name':'Izina ryawe',
    'help.contactForm.email':'Email yawe','help.contactForm.msg':'Ikibazo cyawe',
    'help.contactForm.submit':'Ohereza','help.contactForm.ok':'Ubutumwa bwoherejwe. Turakusubiza vuba.',
    'about.title':'Ibyerekeye AHABONA',
    'about.intro':'AHABONA ni urubuga abantu bagaragarizaho ibyo bashoboye, kugira ngo ababakeneye babone kandi babavugishe.',
    'about.why':'Hari abantu benshi bashoboye batazwi uretse n’abo baziranye. AHABONA ituma baboneka kure.',
    'about.how':'Wiyandikisha, ukerekana icyo ushoboye n’aho uri, ukaboneka, abagukeneye bakakuvugisha.',
    'about.what':'Si urubuga rwo gutangaza akazi, kandi ntirwemeza ko umuntu afite ubushobozi avuga. Ukeneye umuntu agomba kwisuzumira.',
    'about.vision':'Intego yacu ni ugutuma umuntu wese abona akazi, kandi umukoresha wese abone umukozi mwiza.',
    'common.ok':'Sawa','common.cancel':'Hagarika','common.close':'Funga','common.back':'Subira',
    'common.yes':'Yego','common.no':'Oya','common.retry':'Ongera','common.loading':'Birimo…',
    'common.error':'Habaye ikibazo','common.success':'Byagenze neza','common.offline':'Nta interineti',
    'common.online':'Interineti yagarutse','common.confirm':'Urabyemeza?','common.required':'Ni ngombwa',
    'toast.langChanged':'Ururimi rwahinduwe.','toast.saverOn':'Kubika data byashyizweho.',
    'toast.saverOff':'Kubika data byazimijwe.','toast.copied':'Byakopowe.','toast.shared':'Byasangiwe.',
    'footer.terms':'Amabwiriza','footer.privacy':'Ibanga',
    'err.auth':'Banza winjire.','err.notfound':'Ntibonetse.'
  },
  en:{
    'a11y.skip':'Skip to content',
    'nav.home':'Home','nav.about':'About','nav.help':'Help','nav.saved':'Saved',
    'nav.login':'Log in','nav.logout':'Log out','nav.register':'Sign up','nav.profile':'Profile',
    'nav.admin':'Admin',
    'home.search.ph':'Search for who you need','home.results':'{{count}} results',
    'home.empty':'No one found here.','home.empty.hint':'Try another word, or choose all districts.','hero.free.b':'Urugo rw’Izuba','hero.free.t':'100% free','hero.free.p':'Finding a worker and signing up cost nothing. No fees at all right now.','hero.free.cta':'Sign up free','hero.k.info':'Urugo rw’Izuba','hero.k.tip':'Tip','hero.k.announcement':'Notice','hero.k.city':'City','hero.k.promo':'Ad','hero.k.sponsor':'Ad','hero.cta.search':'Search','hero.cta.focus':'Search now','hero.cta.register':'Sign up','hero.cta.help':'Help','hero.cta.about':'Learn more','hero.cta.link':'View','hero.cta.phone':'Call','home.loading':'Searching…',
    'home.error':'Server unavailable or no internet.','home.retry':'Try again',
    'home.more':'Show more','home.first':'No one to show. Sign up to be the first.',
    'home.offline':'No internet. Showing saved content.',
    'home.widenArea':'Search the whole province','home.clearArea':'Clear location','home.tryOther':'Try another word',
    'filters':'Filters','filters.search':'Search','filters.prov':'Province','filters.dist':'District',
    'filters.sort':'Sort','filters.clear':'Clear all','filters.allProv':'All provinces','filters.allDist':'All districts',
    'sort.rel':'Most relevant','sort.fresh':'Recently updated','sort.top':'Top rated','sort.new':'Newest',
    'theme.auto':'Theme: auto','theme.light':'Theme: light','theme.dark':'Theme: dark',
    'saver.off':'Data saver: off','saver.on':'Data saver: on',
    'profile.view':'Full profile','profile.back':'Back','profile.save':'Save','profile.saved':'Saved',
    'profile.share':'Share','profile.report':'Report','profile.edit':'Edit',
    'profile.call':'Call','profile.message':'Message','profile.notfound':'Profile not found',
    'profile.verified':'Verified','profile.fresh':'Recently updated','profile.showPhoto':'Show photo',
    'profile.phone':'Phone','profile.whatsapp':'WhatsApp','profile.contact':'Contact',
    'profile.experience':'Experience','profile.education':'Education','profile.languages':'Languages',
    'profile.availability':'Availability','profile.skills':'Skills','profile.bio':'About',
    'profile.serves':'Serves','profile.age':'Age','profile.gender':'Gender',
    'profile.safety':'Before meeting: do not pay in advance, meet in a public place, and verify the person.',
    'reg.title':'Sign up','reg.edit':'Edit profile','reg.next':'Continue','reg.prev':'Back',
    'reg.submit':'Submit','reg.saving':'Please wait…','reg.step':'Step {{n}} of {{total}}',
    'reg.s1':'Who you are','reg.s2':'Profile','reg.s3':'What you can do','reg.s4':'Contact','reg.s5':'Account','reg.s6':'Terms',
    'reg.name':'Your name','reg.birthdate':'Date of birth','reg.gender':'Gender',
    'reg.gender.pick':'Choose gender','reg.province':'Province you live in','reg.province.pick':'Choose province',
    'reg.district':'District you live in','reg.district.pick':'Choose district','reg.service':'Service areas (optional)',
    'reg.service.hint':'Choose up to 5 districts.','reg.photo':'Your photo',
    'reg.photo.hint':'A photo is optional. You can add up to three photos.','reg.photo.add':'Add photo','reg.photo.working':'Processing photo…','reg.photo.fail':'This photo cannot be read. Try another one, or take a new photo.','reg.photo.max':'Maximum 3 photos.','reg.bio.ph':'e.g. 5 years of experience','reg.youtube':'YouTube video (optional)','reg.youtube.hint':'Link to your video. Shown on your full profile only.','profile.video':'Video','profile.watchVideo':'Watch on YouTube','profile.link':'Link',
    'reg.edu':'Education','reg.edu.pick':'Choose level','reg.bio':'Short headline',
    'reg.exp':'Work experience','reg.exp.hint':'Describe the work you did (optional).',
    'reg.langs':'Languages (optional)','reg.avail':'Availability (optional)',
    'reg.avail.morning':'Morning','reg.avail.afternoon':'Afternoon','reg.avail.evening':'Evening',
    'reg.avail.weekday':'Monday - Friday','reg.avail.weekend':'Weekend',
    'reg.jobs':'What you can do','reg.jobs.hint':'Choose up to 3.','reg.jobs.find':'Search a job',
    'reg.jobs.other':'Cannot find my job','reg.jobs.otherText':'Type your job',
    'reg.phone':'Phone','reg.phone.hint':'Will be visible on your profile.','reg.phone.ph':'0792053086',
    'reg.phone.agree':'I understand my number will be visible.','reg.wa':'WhatsApp (optional)',
    'reg.phones':'Other phones (optional)','reg.phones.hint':'Up to 4 more.','reg.phones.add':'Add another phone','reg.email.public':'Public email (optional)','reg.email.public.hint':'Will be shown on your profile.','reg.social':'Social media (optional)','reg.social.add':'Add social media',
    'reg.email':'Email','reg.email.hint':'Not shown to others.','reg.email.ph':'izere.eddy@email.com',
    'reg.password':'Password','reg.password.hint':'At least 8 characters.',
    'reg.password.show':'Show','reg.password.hide':'Hide','reg.terms':'I have read and agree to the terms',
    'reg.success':'Registration successful!','reg.view':'View my profile',
    'reg.draft':'Saved on this phone. You can continue later.',
    'reg.draftRestore':'You started signing up. Continue?',
    'reg.err.name':'Enter your full name (at least 3 characters).',
    'reg.err.birthdate':'Enter your date of birth.','reg.err.age':'You must be at least 18 years old.',
    'reg.err.gender':'Choose your gender.','reg.err.province':'Choose your province.','reg.err.district':'Choose your district.',
    'reg.err.photo':'The photo could not be accepted. Try another image.','reg.err.jobs':'Choose at least one job.',
    'reg.err.jobs3':'Choose up to 3 jobs.','reg.err.other':'Type your job (at least 3 characters).',
    'reg.err.phone':'Enter a valid phone, e.g. 0788123456.','reg.err.phone.agree':'Confirm that your number is visible.',
    'reg.err.wa':'Enter a valid WhatsApp number.','reg.err.phones':'Enter valid phones.',
    'reg.err.email':'Enter a valid email.','reg.err.password':'Password must be at least 8 characters.',
    'reg.err.terms':'You must accept the terms.',
    'login.title':'Log in','login.id':'Email or phone','login.id.ph':'Email or phone','common.save':'Save','login.password':'Password',
    'login.submit':'Log in','login.working':'Logging you in…','login.forgot':'Forgot password',
    'login.orReg':'No account? Sign up','login.err':'Email, phone or password is incorrect.',
    'login.ok':'Logged in.','logout.ok':'Logged out.',
    'forgot.title':'Forgot password','forgot.email':'Your email','forgot.submit':'Send',
    'forgot.sent':'If this email exists, we sent a link.','forgot.hint':'We will send a link to set a new password.',
    'reset.title':'New password','reset.new':'New password','reset.submit':'Save',
    'reset.ok':'Password saved. Log in.','reset.err':'Link expired or invalid.',
    'restore.title':'Account pending deletion','restore.body':'You asked to delete your account. It can be restored within 6 months. Restore it?',
    'restore.yes':'Yes, restore','restore.no':'No','restore.ok':'Account restored.',
    'account.title':'Your account','account.myProfile':'My profile','account.edit':'Edit profile',
    'account.password':'Change password','account.delete':'Delete account',
    'account.deleteWarn':'Your account will be hidden. It can be restored within 6 months. After that, permanently deleted.',
    'account.currentPw':'Current password','account.newPw':'New password',
    'account.confirmPw':'Type your password to confirm','account.logout':'Log out',
    'account.logoutAll':'Log out everywhere','account.deleteOk':'Deletion requested',
    'account.deleteBody':'Your account is hidden. Within 6 months it can be restored. After that, permanently deleted.',
    'account.admin':'Admin',
    'saved.title':'Saved people','saved.empty':'No saved profiles. Tap "Save" on a profile.',
    'saved.ok':'Saved.','saved.removed':'Removed.',
    'report.title':'Report issue','report.r.wrong':'Wrong information','report.r.photo':'Wrong photo',
    'report.r.behavior':'Bad behaviour','report.r.other':'Other','report.submit':'Submit',
    'report.hint':'Goes to moderators.','report.ok':'Your report was received.',
    'help.title':'Help','help.search':'Search answer','help.ask':'Ask help',
    'help.ask.ph':'e.g. How do I add a photo?','help.send':'Ask','help.hint':'Answers come from approved content only.',
    'help.no':'No answer found. Try other words.','help.contact':'Contact us',
    'help.contact.hint':'Didn’t find what you need? Write to us.','help.contactForm.name':'Your name',
    'help.contactForm.email':'Your email','help.contactForm.msg':'Your question',
    'help.contactForm.submit':'Send','help.contactForm.ok':'Message sent. We’ll reply soon.',
    'about.title':'About AHABONA',
    'about.intro':'AHABONA is a platform where people show what they can do, so those who need them can find and contact them.',
    'about.why':'Many capable people are unknown except to those close to them. AHABONA makes them discoverable.',
    'about.how':'Sign up, show what you can do and where you are, become visible, and people who need you reach out.',
    'about.what':'Not a job board, and it does not certify skills. Verify the person you engage.',
    'about.vision':'Our goal is that everyone finds work, and every employer finds a good worker.',
    'common.ok':'OK','common.cancel':'Cancel','common.close':'Close','common.back':'Back',
    'common.yes':'Yes','common.no':'No','common.retry':'Retry','common.loading':'Loading…',
    'common.error':'Something went wrong','common.success':'Success','common.offline':'No internet',
    'common.online':'Internet restored','common.confirm':'Are you sure?','common.required':'Required',
    'toast.langChanged':'Language changed.','toast.saverOn':'Data saver on.',
    'toast.saverOff':'Data saver off.','toast.copied':'Copied.','toast.shared':'Shared.',
    'footer.terms':'Terms','footer.privacy':'Privacy',
    'err.auth':'Please log in first.','err.notfound':'Not found.'
  }
};

function t(k,v){
  var d=I18N[LANG]||I18N.rw;
  var s=d[k]||I18N.rw[k]||k;
  if(v)for(var x in v)s=s.split('{{'+x+'}}').join(String(v[x]));
  return s;
}
function $(id){return document.getElementById(id)}
function $$(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ini(n){return String(n||'').split(/\\s+/).slice(0,2).map(function(w){return w[0]||''}).join('').toUpperCase()}
function debounce(fn,ms){var id;return function(){var a=arguments,c=this;clearTimeout(id);id=setTimeout(function(){fn.apply(c,a)},ms)}}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function safeStore(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

var DEVICE=(function(){
  try{
    var d=localStorage.getItem('ahabona_device');
    if(!d){
      var a=new Uint8Array(12);
      (window.crypto||window.msCrypto).getRandomValues(a);
      d=Array.from(a,function(x){return ('0'+x.toString(16)).slice(-2)}).join('');
      localStorage.setItem('ahabona_device',d);
    }
    return d;
  }catch(e){return 'anon-'+String(Date.now())}
})();


var ST={
  me:null,
  cfg:null,
  list:[],
  shown:0,
  total:0,
  pageSize:20,
  F:{q:'',prov:'',dist:'',sort:'rel'},
  openPid:null,
  openPhotos:[]
};

var saverOn=false;
try{saverOn=localStorage.getItem('ahabona_saver')==='1'}catch(e){}

function toast(msg){
  var el=$('toast');
  if(!el){
    el=document.createElement('div');
    el.id='toast';
    el.className='toast';
    document.body.appendChild(el);
  }
  el.textContent=msg;
  el.classList.add('on');
  el.style.display='block';
  clearTimeout(toast._t);
  toast._t=setTimeout(function(){el.classList.remove('on');el.style.display='none'},2800);
}

var AH_HIST={open:false,skip:false};
function openModal(html){
  var ov=$('ov');
  if(!ov){
    ov=document.createElement('div');
    ov.id='ov';
    ov.className='ov';
    ov.setAttribute('role','dialog');
    ov.setAttribute('aria-modal','true');
    ov.innerHTML='<div class="sh" id="sh"></div>';
    document.body.appendChild(ov);
  }
  var sheet=$('sh')||ov.querySelector('.sh');
  if(!sheet){
    sheet=document.createElement('div');
    sheet.className='sh';
    sheet.id='sh';
    ov.appendChild(sheet);
  }
  sheet.innerHTML=html;
  var wasOff=!ov.classList.contains('on');
  ov.classList.add('on');
  ov.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  if(wasOff&&!AH_HIST.open){
    AH_HIST.open=true;
    try{history.pushState({ahabona_modal:1},'')}catch(e){}
  }
  var focusable=sheet.querySelector('button,input,select,textarea,a[href]');
  if(focusable)try{focusable.focus()}catch(e){}
}

function closeModal(fromPop){
  var ov=$('ov');
  if(ov){ov.classList.remove('on');ov.setAttribute('aria-hidden','true')}
  document.body.style.overflow='';
  if(AH_HIST.open){
    AH_HIST.open=false;
    if(!fromPop){
      try{
        if(history.state&&history.state.ahabona_modal){
          AH_HIST.skip=true;
          history.back();
        }
      }catch(e){}
    }
  }
}

function setupHistoryBack(){
  window.addEventListener('popstate',function(){
    if(AH_HIST.skip){AH_HIST.skip=false;return}
    var ov=$('ov');
    if(ov&&ov.classList.contains('on')){
      closeModal(true);
      return;
    }
    var menu=document.getElementById('menu');
    if(menu&&menu.classList.contains('on')){
      menu.classList.remove('on');
    }
  });
}

function modalBackBtn(){
  return '<button class="ib ol" type="button" data-act="close">'+esc(t('common.close')||'Close')+'</button>';
}
function pwToggleBtn(inputId){
  return ' <button type="button" class="ib ol" data-act="pwToggle" data-input="'+inputId+'" style="min-height:32px;padding:4px 10px;margin-left:6px">'+esc(t('reg.password.show'))+'</button>';
}
function wirePwToggle(){
  $$('[data-act="pwToggle"]').forEach(function(btn){
    if(btn._pwBound)return;
    btn._pwBound=true;
    btn.addEventListener('click',function(){
      var id=btn.getAttribute('data-input');
      var inp=document.getElementById(id);
      if(!inp)return;
      if(inp.type==='password'){inp.type='text';btn.textContent=t('reg.password.hide')}
      else{inp.type='password';btn.textContent=t('reg.password.show')}
    });
  });
}

async function api(method, path, body, opts){
  opts=opts||{};
  var headers={'X-Device':DEVICE};
  if(body!==undefined)headers['Content-Type']='application/json';
  var tries=opts.retry===false?1:3;
  var lastErr=null;
  for(var i=0;i<tries;i++){
    try{
      var r=await fetch(path,{
        method:method,
        headers:headers,
        body:body===undefined?undefined:JSON.stringify(body),
        credentials:'same-origin'
      });
      var data=null;
      var ct=r.headers.get('content-type')||'';
      if(ct.indexOf('json')!==-1){
        try{data=await r.json()}catch(e){data=null}
      }else{
        try{data={raw:await r.text()}}catch(e){data=null}
      }
      return {ok:r.ok,status:r.status,data:data};
    }catch(e){
      lastErr=e;
      if(i<tries-1)await sleep(400*(i+1));
    }
  }
  return {ok:false,status:0,data:{error:'err.offline'},error:lastErr};
}

function applySaver(){
  try{saverOn=localStorage.getItem('ahabona_saver')==='1'}catch(e){}
  var svl=$('svl');
  if(svl)svl.textContent=t(saverOn?'saver.on':'saver.off');
  document.documentElement.dataset.saver=saverOn?'1':'';
}

function toggleSaver(){
  saverOn=!saverOn;
  try{localStorage.setItem('ahabona_saver',saverOn?'1':'0')}catch(e){}
  applySaver();
  toast(t(saverOn?'toast.saverOn':'toast.saverOff'));
  paint();
}

function relabelSelects(){
  ['sp','fp','sd','fd'].forEach(function(id){
    var el=$(id);
    if(!el||!el.options||!el.options.length)return;
    if(el.options[0].value==='')el.options[0].textContent=t(id==='sp'||id==='fp'?'filters.allProv':'filters.allDist');
  });
}
function setLang(lang){
  if(lang!=='rw'&&lang!=='en')return;
  LANG=lang;
  try{localStorage.setItem('ahabona_lang',lang)}catch(e){}
  try{document.documentElement.lang=lang}catch(e){}
  if(ST.me){try{api('PUT','/api/me/lang',{lang:lang})}catch(e){}}
  applyStaticTexts();
  renderSortOptions();
  renderChips();
  relabelSelects();
  renderHero();
  if(typeof loadProfiles==='function')try{loadProfiles({reset:true})}catch(e){}
  $$('.lsw button[data-lang]').forEach(function(b){
    b.classList.toggle('on',b.getAttribute('data-lang')===LANG);
  });
  toast(t('toast.langChanged'));
  paint();
}

function applyStaticTexts(){
  try{document.documentElement.lang=LANG}catch(e){}
  var map=[
    ['rg', ST.me?'nav.profile':'nav.register'],
    ['lt', ST.me?'nav.logout':'nav.login'],
    ['lt2', ST.me?'nav.logout':'nav.login']
  ];
  map.forEach(function(x){
    var el=$(x[0]);
    if(el)el.textContent=t(x[1]);
  });
  $$('[data-i18n]').forEach(function(el){
    var k=el.getAttribute('data-i18n');
    if(k)el.textContent=t(k);
  });
  var ms=$('ms'), ms2=$('ms2');
  if(ms)ms.style.display=ST.me?'':'none';
  if(ms2)ms2.style.display=ST.me?'':'none';
  var q=$('q');
  if(q)q.setAttribute('placeholder',t('home.search.ph'));
  var sq=$('sq');
  if(sq)sq.setAttribute('placeholder',t('home.search.ph'));
  applySaver();
  $$('.lsw button[data-lang]').forEach(function(b){
    b.classList.toggle('on',b.getAttribute('data-lang')===LANG);
  });
}

function loadConfig(){
  return api('GET','/api/config',undefined,{retry:false}).then(function(r){
    if(r.ok&&r.data){
      ST.cfg=r.data;
    }else{
      ST.cfg={provinces:{},categories:{},education:[],genders:[],languages:[]};
    }
    return ST.cfg;
  });
}

function fillProvSelects(){
  var provs=(ST.cfg&&ST.cfg.provinces)||{};
  var keys=Object.keys(provs);
  ['sp','fp'].forEach(function(id){
    var el=$(id);
    if(!el)return;
    var cur=el.value;
    el.innerHTML='<option value="">'+esc(t('filters.allProv'))+'</option>'+
      keys.map(function(k){return '<option value="'+esc(k)+'">'+esc(displayProv(k))+'</option>'}).join('');
    if(cur)el.value=cur;
  });
}

function fillDistSelect(id, prov){
  var el=$(id);
  if(!el)return;
  var provs=(ST.cfg&&ST.cfg.provinces)||{};
  var list=prov&&provs[prov]?provs[prov]:[];
  var all=[];
  if(!prov){
    Object.keys(provs).forEach(function(k){all=all.concat(provs[k])});
    list=all;
  }
  var cur=el.value;
  el.innerHTML='<option value="">'+esc(t('filters.allDist'))+'</option>'+
    list.map(function(d){return '<option value="'+esc(d)+'">'+esc(d)+'</option>'}).join('');
  if(cur&&list.indexOf(cur)!==-1)el.value=cur;
  else el.value='';
  el.disabled=false;
}

function renderSortOptions(){
  var ss=$('ss');
  if(!ss)return;
  var cur=ss.value||ST.F.sort||'rel';
  var opts=[
    ['rel','sort.rel'],
    ['fresh','sort.fresh'],
    ['top','sort.top'],
    ['new','sort.new']
  ];
  ss.innerHTML=opts.map(function(o){
    return '<option value="'+o[0]+'">'+esc(t(o[1]))+'</option>';
  }).join('');
  ss.value=cur;
}

function renderChips(){
  var el=$('chips');
  if(!el)return;
  var capsList=(ST.cfg&&ST.cfg.capabilities)||[];
  var chips=[];
  if(capsList.length){
    var seen={};
    var prefer=['Umushoferi','Umukozi wo mu rugo','Umubaji','Umudozi','Umukanishi w’imodoka','Umutetsi'];
    prefer.forEach(function(n){
      for(var i=0;i<capsList.length;i++){
        if(capsList[i].name===n&&!seen[n]){chips.push(capsList[i]);seen[n]=1}
      }
    });
    if(chips.length<6){
      for(var i=0;i<capsList.length&&chips.length<8;i++){
        if(!seen[capsList[i].name]){chips.push(capsList[i]);seen[capsList[i].name]=1}
      }
    }
  }else{
    chips=[
      {name:'Umushoferi',name_en:'Driver'},
      {name:'Umukozi wo mu rugo',name_en:'House helper'},
      {name:'Umubaji',name_en:'Carpenter'},
      {name:'Umudozi',name_en:'Tailor'},
      {name:'Umukanishi w’imodoka',name_en:'Car mechanic'},
      {name:'Umutetsi',name_en:'Cook'}
    ];
  }
  el.innerHTML=chips.map(function(c){
    var label=(LANG==='en'&&c.name_en)?c.name_en:c.name;
    var q=c.name||'';
    return '<button type="button" class="chip" data-act="chip" data-q="'+esc(q)+'">'+esc(label)+'</button>';
  }).join('');
}


function normProfile(p){
  var bio=[];
  if(p.intro)bio.push(p.intro);
  if(p.caps&&p.caps.length>1){var _dc=displayCaps(p);bio.push((LANG==='en'?'Other skills: ':'Ubundi bushobozi: ')+(_dc.slice(1).join(', ')||p.caps.slice(1).join(', '))+'.');}
  if(p.pending)bio.push(LANG==='en'?'Other job pending review.':'Undi murimo ryanditswe riri gusuzumwa.');
  return Object.assign({},p,{
    id:p.pid,
    loc:p.district,
    ph:p.photos||[],
    th:p.thumb?[p.thumb]:[],
    bio:bio.join(' '),
    jobs:p.caps||[],
    other:p.other||'',
    intro:p.intro||'',
    me:!!(p.me||p.mine)
  });
}
var CACHE={};
function findCached(pid){
  if(CACHE[pid])return CACHE[pid];
  for(var i=0;i<ST.list.length;i++)if(ST.list[i].id===pid||ST.list[i].pid===pid)return ST.list[i];
  return null;
}
function ic(name){
  var p={
    pin:'<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    mark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
    share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>',
    back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
    msg:'<path d="M4 5h16v11H9l-5 4z"/>',
    report:'<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>'
  }[name]||'';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">'+p+'</svg>';
}

function avHtml(p,big){
  var cls=big?'big':'av';
  var thumb=(p.th&&p.th[0])||(p.ph&&p.ph[0])||'';
  if(thumb&&!saverOn){
    var src=big?(p.ph&&p.ph[0]||thumb):thumb;
    return '<div class="'+cls+'"><img src="'+esc(src)+'" alt="'+esc(p.name||'')+'" loading="lazy" decoding="async"></div>';
  }
  return '<div class="'+cls+'"><span class="ph">'+esc(ini(p.name||''))+'</span></div>';
}

function cardHtml(p){
  var me=p.me?'<span class="me"></span>':'';
  return '<button class="card" type="button" data-act="open" data-pid="'+esc(p.id)+'" aria-label="'+esc(p.name||'')+'">'+
    avHtml(p,false)+
    '<div class="nm">'+esc(p.name||'')+'</div>'+
    '<div class="cp">'+esc(displayCap(p))+'</div>'+
    '<div class="lc">'+ic('pin')+esc(p.loc||'')+me+'</div>'+
    '</button>';
}

function paint(){
  var g=$('grid');
  if(!g)return;
  if(!ST.list.length){
    g.innerHTML='<div class="empty">'+
      '<div class="empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></div>'+
      '<p class="empty-title">'+esc(t('home.empty'))+'</p>'+
      '<p class="empty-sub">'+esc(t('home.empty.hint')||t('home.first')||'')+'</p>'+
      '<button type="button" class="ib ol" data-act="clearFilters">'+esc(t('filters.clear')||'Siba byose')+'</button>'+
    '</div>';
    var mb=$('more');if(mb)mb.style.display='none';
    return;
  }
  var note='';
  if(ST.cfg&&ST.list.length===0){
    note='<div class="note" style="grid-column:1/-1">'+esc(t('home.first'))+'</div>';
  }
  g.innerHTML=note+ST.list.map(cardHtml).join('');
  var mb=$('more');
  if(mb)mb.style.display=ST.list.length<ST.total?'':'none';
  try{
    var pids=ST.list.map(function(p){return p.id||p.pid}).filter(Boolean).slice(0,60);
    if(pids.length)api('POST','/api/events',{type:'impression',pids:pids},{retry:false});
  }catch(e){}
}

function loadProfiles(opts){
  opts=opts||{};
  var isReset=!!opts.reset;
  if(isReset){ST.shown=0;ST.list=[]}
  var p=new URLSearchParams();
  if(ST.F.q.trim())p.set('q',ST.F.q.trim());
  if(ST.F.prov)p.set('prov',ST.F.prov);
  if(ST.F.dist)p.set('dist',ST.F.dist);
  p.set('sort',ST.F.sort);
  p.set('limit',String(ST.pageSize));
  p.set('offset',String(ST.shown));
  return api('GET','/api/profiles?'+p.toString()).then(function(r){
    if(!r.ok){
      toast(t('home.error'));
      if(isReset){ST.list=[];ST.total=0;paint()}
      return;
    }
    var arr=(r.data&&r.data.profiles)||[];
    var mapped=arr.map(normProfile);
    mapped.forEach(function(p){if(p.id)CACHE[p.id]=p;if(p.pid)CACHE[p.pid]=p});
    ST.list=isReset?mapped:ST.list.concat(mapped);
    ST.shown=ST.list.length;
    ST.total=(r.data&&r.data.meta&&r.data.meta.total)||ST.list.length;
    paint();
  });
}

function openPreview(pid){
  var p=findCached(pid);
  if(!p)return;
  ST.openPid=pid;
  try{api('POST','/api/events',{type:'open',pid:pid},{retry:false})}catch(e){}

  var body=
    '<div class="row">'+avHtml(p,true)+
    '<div><h2>'+esc(p.name)+'</h2>'+
    '<div class="cp">'+esc(displayCap(p))+'</div>'+
    '<div class="lc">'+ic('pin')+esc(p.loc||'')+(p.province?', '+esc(displayProv(p.province)):'')+'</div>'+
    (p.fresh?'<div class="badge" style="margin-top:6px">'+esc(t('profile.fresh'))+'</div>':'')+
    '</div></div>'+
    (p.bio?'<p style="margin-top:10px">'+esc(p.bio)+'</p>':'')+
    '<div class="act"><button class="ib pb" type="button" data-act="full" data-pid="'+esc(pid)+'">'+esc(t('profile.view'))+'</button>'+modalBackBtn()+'</div>';
  openModal(body);
}

function renderFull(p){
  ST.openPid=p.pid;
  ST.openPhotos=p.photos||[];
  var photos=p.photos||[];
  var main=photos[0]||p.thumb||'';
  var gallery='';
  if(photos.length&&!saverOn){
    gallery='<img class="gallery-main" src="'+esc(main)+'" alt="">';
    if(photos.length>1){
      gallery+='<div class="gallery-thumbs">'+photos.map(function(ph,i){
        return '<img src="'+esc(ph)+'" data-i="'+i+'" alt="" class="'+(i===0?'on':'')+'">';
      }).join('')+'</div>';
    }
  }else if(photos.length&&saverOn){
    gallery='<div class="saver-gallery" style="text-align:center;padding:14px 0">'+avHtml(p,true)+
      '<button class="ib pb" type="button" style="margin-top:12px" data-act="showphotos" data-pid="'+esc(p.pid)+'">'+esc(t('profile.showPhoto'))+'</button>'+
      '<div class="saver-hint">'+esc(t('saver.on'))+'</div></div>';
  }else{
    gallery='<div style="padding:20px;text-align:center">'+avHtml(p,true)+'</div>';
  }
  var skills=(function(){var cs=displayCaps(p);return (cs&&cs.length)?cs.map(function(s){return '<span class="badge ok">'+esc(s)+'</span>'}).join(' '):''})();
  var phones='';
  if(p.phone&&(p.phone_visible||p.me)){
    phones+='<div class="lc" style="margin-top:6px">'+ic('phone')+' '+esc(p.phone)+'</div>';
  }
  if(p.phones&&p.phones.length){
    phones+='<div class="lc" style="margin-top:4px;flex-wrap:wrap">'+p.phones.map(function(n){return '<a href="tel:'+esc(n)+'">'+esc(n)+'</a>'}).join(' · ')+'</div>';
  }
  var exp='';
  if(p.experience&&p.experience.length){
    exp='<h3>'+esc(t('profile.experience'))+'</h3>'+p.experience.map(function(x){
      if(typeof x==='string')return '<p>'+esc(x)+'</p>';
      return '<p>'+esc(x.role||'')+(x.where?' — '+esc(x.where):'')+(x.years?' ('+esc(x.years)+')':'')+'</p>';
    }).join('');
  }
  var meta='';
  if(p.edu_level){
    var eduList=(ST.cfg&&ST.cfg.education)||[];
    var found=null;
    for(var k=0;k<eduList.length;k++)if(eduList[k].id===p.edu_level){found=eduList[k];break}
    if(found)meta+='<h3>'+esc(t('profile.education'))+'</h3><p>'+esc(LANG==='en'?found.en:found.rw)+'</p>';
  }else if(p.edu){
    meta+='<h3>'+esc(t('profile.education'))+'</h3><p>'+esc(p.edu)+'</p>';
  }
  if(p.languages&&p.languages.length){
    var langList=(ST.cfg&&ST.cfg.languages)||[];
    var names=p.languages.map(function(id){
      for(var k=0;k<langList.length;k++)if(langList[k].id===id)return LANG==='en'?langList[k].en:langList[k].rw;
      return id;
    });
    meta+='<h3>'+esc(t('profile.languages'))+'</h3><p>'+names.map(esc).join(', ')+'</p>';
  }
  if(p.availability&&p.availability.length){
    meta+='<h3>'+esc(t('profile.availability'))+'</h3><p>'+p.availability.map(esc).join(', ')+'</p>';
  }
  if(p.svc&&p.svc.length){
    meta+='<h3>'+esc(t('profile.serves'))+'</h3><p>'+p.svc.map(esc).join(', ')+'</p>';
  }
  if(p.soc&&(p.soc.toLowerCase().indexOf('youtu.be')>-1||p.soc.toLowerCase().indexOf('youtube.com')>-1)){
    var yurl=p.soc;
    meta+='<h3>'+esc(t('profile.video')||'Video')+'</h3>'+
      '<p><a class="ib ol" href="'+esc(yurl)+'" target="_blank" rel="noopener">'+esc(t('profile.watchVideo')||'Reba kuri YouTube')+'</a></p>';
  }else if(p.soc){
    meta+='<h3>'+esc(t('profile.link')||'Link')+'</h3><p><a href="'+esc(p.soc)+'" target="_blank" rel="noopener">'+esc(p.soc)+'</a></p>';
  }
  var callBtn=p.phone?'<a class="ib pb" href="tel:'+esc(p.phone)+'">'+ic('phone')+' '+esc(t('profile.call'))+'</a>':'';
  var waBtn=p.wa?'<a class="ib ol" href="https://wa.me/250'+esc(String(p.wa).replace(/^0/,''))+'" target="_blank" rel="noopener">WhatsApp</a>':'';
  function socialHref(kind,val){
    if(!val)return '';
    var v=String(val).trim();
    if(/^https?:\\/\\//i.test(v))return v;
    v=v.replace(/^@/,'');
    if(kind==='facebook')return 'https://facebook.com/'+encodeURIComponent(v);
    if(kind==='instagram')return 'https://instagram.com/'+encodeURIComponent(v);
    if(kind==='tiktok')return 'https://tiktok.com/@'+encodeURIComponent(v);
    if(kind==='linkedin')return 'https://linkedin.com/in/'+encodeURIComponent(v);
    if(kind==='telegram')return 'https://t.me/'+encodeURIComponent(v);
    if(kind==='twitter')return 'https://twitter.com/'+encodeURIComponent(v);
    return v;
  }
  var emailPubBtn=p.email_public?'<a class="ib ol" href="mailto:'+esc(p.email_public)+'">Email</a>':'';
  var fbBtn=p.facebook?'<a class="ib ol" href="'+esc(socialHref('facebook',p.facebook))+'" target="_blank" rel="noopener">Facebook</a>':'';
  var igBtn=p.instagram?'<a class="ib ol" href="'+esc(socialHref('instagram',p.instagram))+'" target="_blank" rel="noopener">Instagram</a>':'';
  var ttBtn=p.tiktok?'<a class="ib ol" href="'+esc(socialHref('tiktok',p.tiktok))+'" target="_blank" rel="noopener">TikTok</a>':'';
  var liBtn=p.linkedin?'<a class="ib ol" href="'+esc(socialHref('linkedin',p.linkedin))+'" target="_blank" rel="noopener">LinkedIn</a>':'';
  var tgBtn=p.telegram?'<a class="ib ol" href="'+esc(socialHref('telegram',p.telegram))+'" target="_blank" rel="noopener">Telegram</a>':'';
  var twBtn=p.twitter?'<a class="ib ol" href="'+esc(socialHref('twitter',p.twitter))+'" target="_blank" rel="noopener">X</a>':'';
  var saveBtn='<button class="ib ol" type="button" data-act="save" data-pid="'+esc(p.pid)+'" aria-pressed="'+(p.saved?'true':'false')+'">'+ic('mark')+' '+esc(t(p.saved?'profile.saved':'profile.save'))+'</button>';
  var shareBtn='<button class="ib ol" type="button" data-act="share" data-pid="'+esc(p.pid)+'">'+ic('share')+' '+esc(t('profile.share'))+'</button>';
  var reportBtn='<button class="ib ol" type="button" data-act="report" data-pid="'+esc(p.pid)+'">'+ic('report')+' '+esc(t('profile.report'))+'</button>';
  var meBlock='';
  if(p.me){
    meBlock='<div class="act"><button class="ib ol" type="button" data-act="accountEdit">'+esc(t('profile.edit'))+'</button>'+
      '<button class="ib ol" type="button" data-act="accountPw">'+esc(t('account.password'))+'</button>'+
      '<button class="ib ol" type="button" data-act="accountDelete" style="color:var(--e)">'+esc(t('account.delete'))+'</button></div>';
  }
  var body=
    '<div class="profile-grid">'+
      '<div>'+gallery+'</div>'+
      '<div>'+
        '<h2>'+esc(p.name)+(p.verified?' <span class="badge">'+esc(t('profile.verified'))+'</span>':'')+'</h2>'+
        '<div class="cp">'+esc(displayCap(p))+'</div>'+
        '<div class="lc">'+ic('pin')+esc(p.district||'')+(p.province?', '+esc(displayProv(p.province)):'')+'</div>'+
        (skills?'<div style="margin-top:8px">'+skills+'</div>':'')+
        (p.intro?'<p style="margin-top:10px">'+esc(p.intro)+'</p>':'')+
        phones+
        exp+
        meta+
        '<div class="act">'+callBtn+waBtn+
          '<button class="ib ol" type="button" data-act="msg" data-pid="'+esc(p.pid)+'">'+ic('msg')+' '+esc(t('profile.message'))+'</button>'+
          emailPubBtn+fbBtn+igBtn+ttBtn+liBtn+tgBtn+twBtn+
        '</div>'+
        '<div class="act">'+saveBtn+shareBtn+reportBtn+'</div>'+
        meBlock+
        '<div class="box">'+esc(t('profile.safety'))+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="act">'+modalBackBtn()+'</div>';
  openModal(body);
  var thumbs=$$('.gallery-thumbs img');
  thumbs.forEach(function(el){
    el.addEventListener('click',function(){
      var i=+el.dataset.i;
      var m=document.querySelector('.gallery-main');
      if(m&&photos[i])m.src=photos[i];
      thumbs.forEach(function(x){x.classList.toggle('on',x===el)});
    });
  });
}

function openFull(pid){
  var p=findCached(pid);
  openModal('<div class="note">'+esc(t('common.loading'))+'</div>');
  api('GET','/api/profile/'+encodeURIComponent(pid)).then(function(r){
    if(!r.ok||!r.data||!r.data.profile){
      if(p)return renderFull(p);
      openModal('<h2>'+esc(t('profile.notfound'))+'</h2><div class="act">'+modalBackBtn()+'</div>');
      return;
    }
    renderFull(normProfile(r.data.profile));
  });
}

function doSaveProfile(pid,el){
  if(!ST.me){toast(t('err.auth'));return openLogin()}
  var on=el&&el.getAttribute('aria-pressed')==='true';
  api(on?'DELETE':'PUT','/api/saved/'+pid,{}).then(function(r){
    if(!r.ok)return toast(t('home.error'));
    if(el){
      el.setAttribute('aria-pressed',String(!on));
      el.innerHTML=ic('mark')+' '+esc(t(!on?'profile.saved':'profile.save'));
    }
    toast(t(!on?'saved.ok':'saved.removed'));
  });
}
function doShare(pid){
  var url=location.origin+'/u/'+pid;
  if(navigator.share){navigator.share({title:'AHABONA',url:url}).catch(function(){});return}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(function(){toast(t('toast.copied'))}).catch(function(){window.prompt('Link:',url)});
  }else{
    window.prompt('Link:',url);
  }
}
function openReport(pid){
  var items=[
    ['report.r.wrong','wrong_info'],
    ['report.r.photo','wrong_photo'],
    ['report.r.behavior','bad_behavior'],
    ['report.r.other','other']
  ];
  var html='<h2>'+esc(t('report.title'))+'</h2><div class="f">'+items.map(function(x,i){
    return '<label class="ck"><input type="radio" name="rr" value="'+x[1]+'"'+(i===0?' checked':'')+'><span>'+esc(t(x[0]))+'</span></label>';
  }).join('')+'</div>'+
  '<div class="note">'+esc(t('report.hint'))+'</div>'+
  '<div class="act"><button class="ib pb" type="button" data-act="reportSend" data-pid="'+esc(pid)+'">'+esc(t('report.submit'))+'</button>'+modalBackBtn()+'</div>';
  openModal(html);
}
function doSendReport(pid){
  var el=document.querySelector('input[name="rr"]:checked');
  var code=el?el.value:'other';
  api('POST','/api/report',{pid:pid,reason:code,detail:''}).then(function(r){
    if(!r.ok)return toast(t('home.error'));
    closeModal();
    toast(t('report.ok'));
  });
}
/* ===== END OF IGICE 12b/16 ===== */
`;EMBED['app.js'] += `

var RG={
  step:1,total:6,editing:false,busy:false,
  data:{
    name:'',birthdate:'',gender:'',province:'',district:'',svc:[],
    photos:[],thumbs:[],jobs:[],other:'',intro:'',
    edu:'',soc:'',experience:'',languages:[],availability:[],
    phone:'',wa:'',phones:[],email:'',password:'',terms:false,email_public:'',facebook:'',instagram:'',tiktok:'',linkedin:'',telegram:'',twitter:'',
    phone_visible:false,
    _photosUnchanged:false
  }
};
var DRAFT_KEY='ahabona_draft_v1';

function saveDraft(){
  try{
    var d=Object.assign({},RG.data);
    d.photos=[];d.thumbs=[];
    delete d.password;delete d.terms;
    if(RG.data.photos.length)d._photoCount=RG.data.photos.length;
    localStorage.setItem(DRAFT_KEY,JSON.stringify(d));
  }catch(e){}
}
function loadDraft(){
  try{
    var s=localStorage.getItem(DRAFT_KEY);
    if(!s)return null;
    return JSON.parse(s);
  }catch(e){return null}
}
function clearDraft(){try{localStorage.removeItem(DRAFT_KEY)}catch(e){}}
function resetRG(){
  RG.editing=false;RG._checked=false;RG.step=1;RG.busy=false;
  RG.data={
    name:'',birthdate:'',gender:'',province:'',district:'',svc:[],
    photos:[],thumbs:[],jobs:[],other:'',intro:'',
    edu:'',soc:'',experience:'',languages:[],availability:[],
    phone:'',wa:'',phones:[],email:'',password:'',terms:false,email_public:'',facebook:'',instagram:'',tiktok:'',linkedin:'',telegram:'',twitter:'',
    phone_visible:false,
    _photosUnchanged:false
  };
}

/* Photo pipeline: decode once, shrink step by step, never reject a readable image */
function loadPhotoSource(file){
  return new Promise(function(resolve,reject){
    function wrap(bm){return {src:bm,w:bm.width,h:bm.height,close:function(){try{bm.close()}catch(e){}}}}
    function viaImg(){
      var url=null;
      try{url=(window.URL||window.webkitURL).createObjectURL(file)}catch(e){url=null}
      function fromSrc(src,revoke){
        var img=new Image();
        img.onload=function(){
          if(revoke&&url){try{URL.revokeObjectURL(url)}catch(e){}}
          resolve({src:img,w:img.naturalWidth||img.width,h:img.naturalHeight||img.height,close:function(){}});
        };
        img.onerror=function(){
          if(revoke&&url){try{URL.revokeObjectURL(url)}catch(e){}}
          reject(new Error('decode'));
        };
        img.src=src;
      }
      if(url){fromSrc(url,true);return}
      var fr=new FileReader();
      fr.onerror=function(){reject(new Error('read'))};
      fr.onload=function(){fromSrc(fr.result,false)};
      fr.readAsDataURL(file);
    }
    if(window.createImageBitmap){
      var p=null;
      try{p=createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){p=null}
      if(p&&typeof p.then==='function'){
        p.then(function(bm){resolve(wrap(bm))},function(){
          var p2=null;
          try{p2=createImageBitmap(file)}catch(e){p2=null}
          if(p2&&typeof p2.then==='function'){
            p2.then(function(bm){resolve(wrap(bm))},viaImg);
          }else viaImg();
        });
        return;
      }
    }
    viaImg();
  });
}
function encodeJpeg(photo,maxSide,maxBytes,q0){
  var base=Math.min(1,maxSide/Math.max(photo.w,photo.h));
  var steps=[1,0.8,0.64,0.5,0.4];
  var c=document.createElement('canvas');
  var ctx=c.getContext('2d');
  if(!ctx)throw new Error('canvas');
  var out='';
  for(var i=0;i<steps.length;i++){
    var cw=Math.max(1,Math.round(photo.w*base*steps[i]));
    var ch=Math.max(1,Math.round(photo.h*base*steps[i]));
    c.width=cw;c.height=ch;
    ctx.fillStyle='#fff';
    ctx.fillRect(0,0,cw,ch);
    try{ctx.imageSmoothingQuality='high'}catch(e){}
    ctx.drawImage(photo.src,0,0,cw,ch);
    var q=q0||0.8;
    while(true){
      out=c.toDataURL('image/jpeg',q);
      if(out.indexOf('data:image/jpeg')!==0)throw new Error('encode');
      if(Math.floor((out.length-23)*0.75)<=maxBytes)return out;
      if(q<=0.42)break;
      q=Math.max(0.4,q-0.1);
    }
  }
  return out;
}
function processPhoto(file){
  return loadPhotoSource(file).then(function(ph){
    try{
      if(!ph.w||!ph.h)throw new Error('decode');
      var big=encodeJpeg(ph,1280,380*1024,0.86);
      var small=encodeJpeg(ph,400,45*1024,0.78);
      ph.close();
      return {big:big,small:small};
    }catch(e){
      try{ph.close()}catch(e2){}
      throw e;
    }
  });
}
function compressImage(file,maxSide,maxBytes,quality){
  return loadPhotoSource(file).then(function(ph){
    var out=encodeJpeg(ph,maxSide,maxBytes,quality);
    ph.close();
    return out;
  });
}

function rgVal(key){
  return RG.data[key]!==undefined?RG.data[key]:'';
}
function rgSet(key,val){
  RG.data[key]=val;
  saveDraft();
}

function renderRegister(){
  if(RG.editing)RG.total=4;else RG.total=6;
  var d=RG.data;
  var body='<h2>'+esc(t(RG.editing?'reg.edit':'reg.title'))+'</h2>'+
    '<div class="prog"><div style="width:'+Math.round(RG.step/RG.total*100)+'%"></div></div>'+
    '<div class="note">'+esc(t('reg.step',{n:RG.step,total:RG.total}))+'</div>';
  var s=RG.step;
  if(!RG.editing){
    if(s===1){
      body+='<h3>'+esc(t('reg.s1'))+'</h3><div class="f">'+
        '<label>'+esc(t('reg.name'))+'</label><input data-rg="name" value="'+esc(d.name)+'" autocomplete="name" placeholder="Izere Eddy">'+
        '<label>'+esc(t('reg.birthdate'))+' <span class="muted">'+(LANG==='en'?'(optional)':'(si ngombwa)')+'</span></label><input data-rg="birthdate" type="date" value="'+esc(d.birthdate)+'">'+
        '<label>'+esc(t('reg.gender'))+' <span class="muted">'+(LANG==='en'?'(optional)':'(si ngombwa)')+'</span></label><select data-rg="gender"><option value="">'+esc(t('reg.gender.pick'))+'</option>'+
        ((ST.cfg&&ST.cfg.genders)||[]).map(function(g){return '<option value="'+g.id+'"'+(d.gender===g.id?' selected':'')+'>'+esc(LANG==='en'?g.en:g.rw)+'</option>'}).join('')+
        '</select>'+
        '<label>'+esc(t('reg.province'))+'</label><select data-rg="province"><option value="">'+esc(t('reg.province.pick'))+'</option>'+
        Object.keys((ST.cfg&&ST.cfg.provinces)||{}).map(function(p){return '<option value="'+esc(p)+'"'+(d.province===p?' selected':'')+'>'+esc(p)+'</option>'}).join('')+
        '</select>'+
        '<label>'+esc(t('reg.district'))+'</label><select data-rg="district"><option value="">'+esc(t('reg.district.pick'))+'</option>'+
        ((ST.cfg&&ST.cfg.provinces&&ST.cfg.provinces[d.province])||[]).map(function(dd){return '<option value="'+esc(dd)+'"'+(d.district===dd?' selected':'')+'>'+esc(dd)+'</option>'}).join('')+
        '</select>'+
        '<label style="margin-top:12px">'+esc(t('reg.service'))+'</label><div class="note">'+esc(t('reg.service.hint'))+'</div>'+
        '<div id="rg-svc" style="max-height:180px;overflow:auto;border:1px solid var(--b);border-radius:10px;padding:6px;margin-top:6px"></div>'+
        '</div>';
    }else if(s===2){
      body+='<h3>'+esc(t('reg.s2'))+'</h3><div class="f">'+
        '<label>'+esc(t('reg.photo'))+'</label><div class="note">'+esc(t('reg.photo.hint'))+'</div>'+
        '<div id="rg-photos" class="wrap" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"></div>'+
        '<label class="ib ol" for="rg-photo" style="justify-content:center;margin-top:8px">'+esc(t('reg.photo.add'))+'</label>'+
        '<input id="rg-photo" type="file" accept="image/*" multiple style="display:none">'+
        '<div class="er" id="rg-photo-err"></div>'+
        '<label style="margin-top:12px">'+esc(t('reg.edu'))+'</label><select data-rg="edu"><option value="">'+esc(t('reg.edu.pick'))+'</option>'+
        ((ST.cfg&&ST.cfg.education)||[]).map(function(e){return '<option value="'+e.id+'"'+(d.edu===e.id?' selected':'')+'>'+esc(LANG==='en'?e.en:e.rw)+'</option>'}).join('')+
        '</select>'+
        '<label>'+esc(t('reg.bio'))+'</label><input data-rg="intro" value="'+esc(d.intro)+'" maxlength="80" placeholder="'+esc(t('reg.bio.ph')||'')+'">'+
        '<label style="margin-top:12px">'+esc(t('reg.youtube')||'YouTube (si ngombwa)')+'</label>'+
        '<div class="note">'+esc(t('reg.youtube.hint')||"Video link - only on full profile")+'</div>'+
        '<input data-rg="soc" type="url" inputmode="url" placeholder="https://youtube.com/watch?v=..." value="'+esc(d.soc||'')+'">'+
        '</div>';
    }else if(s===3){
      body+='<h3>'+esc(t('reg.s3'))+'</h3><div class="note">'+esc(t('reg.jobs.hint'))+'</div><div class="f">'+
        '<input id="rg-jobs-search" type="search" placeholder="'+esc(t('reg.jobs.find'))+'">'+
        '<div id="rg-jobs-list" class="job-list"></div>'+
        '<label class="ck" style="margin-top:8px"><input type="checkbox" data-rg="other-cb"'+(d.other?' checked':'')+'><span>'+esc(t('reg.jobs.other'))+'</span></label>'+
        '<input data-rg="other" placeholder="'+esc(t('reg.jobs.otherText'))+'" value="'+esc(d.other)+'"'+(d.other?'':' style="display:none"')+'>'+
        '<label style="margin-top:12px">'+esc(t('reg.exp'))+'</label><div class="note">'+esc(t('reg.exp.hint'))+'</div>'+
        '<textarea data-rg="experience" maxlength="500">'+esc(d.experience||'')+'</textarea>'+
        '</div>';
    }else if(s===4){
      body+='<h3>'+esc(t('reg.s4'))+'</h3><div class="f">'+
        '<label>'+esc(t('reg.phone'))+'</label><div class="note">'+esc(t('reg.phone.hint'))+'</div>'+
        '<input data-rg="phone" type="tel" inputmode="tel" placeholder="'+esc(t('reg.phone.ph'))+'" value="'+esc(d.phone)+'">'+
        '<label class="ck"><input type="checkbox" data-rg="phone-agree"'+(d.phone_visible?' checked':'')+'><span>'+esc(t('reg.phone.agree'))+'</span></label>'+
        '<label>'+esc(t('reg.wa'))+'</label><input data-rg="wa" type="tel" inputmode="tel" placeholder="'+esc(t('reg.phone.ph'))+'" value="'+esc(d.wa)+'">'+
        '<label>'+esc(t('reg.phones'))+'</label><div class="note">'+esc(t('reg.phones.hint'))+'</div>'+
        '<div id="rg-phones-extra"></div>'+
        '<button type="button" class="ib ol" id="rg-phone-add" style="margin-top:6px;min-height:36px">'+esc(t('reg.phones.add'))+'</button>'+
        '<label style="margin-top:12px">'+esc(t('reg.email.public'))+'</label><div class="note">'+esc(t('reg.email.public.hint'))+'</div>'+
        '<input data-rg="email_public" type="email" inputmode="email" placeholder="name@email.com" value="'+esc(d.email_public||'')+'">'+
        '<label style="margin-top:12px">'+esc(t('reg.social'))+'</label>'+
        '<div id="rg-social-extra"></div>'+
        '<button type="button" class="ib ol" id="rg-social-add" style="margin-top:6px;min-height:36px">'+esc(t('reg.social.add'))+'</button>'+
        '</div>';
    }else if(s===5){
      body+='<h3>'+esc(t('reg.s5'))+'</h3><div class="f">'+
        '<label>'+esc(t('reg.email'))+'</label><div class="note">'+esc(t('reg.email.hint'))+'</div>'+
        '<input data-rg="email" type="email" inputmode="email" placeholder="'+esc(t('reg.email.ph'))+'" value="'+esc(d.email)+'">'+
        '<label>'+esc(t('reg.password'))+'</label><div style="display:flex;align-items:center;gap:4px"><input id="rg-password" data-rg="password" type="password" placeholder="'+esc(t('reg.password.hint'))+'" style="flex:1">'+pwToggleBtn('rg-password')+'</div>'+
        '</div>';
    }else if(s===6){
      body+='<h3>'+esc(t('reg.s6'))+'</h3>'+
        '<div class="note"><a href="/terms" target="_blank" rel="noopener">'+esc(t('footer.terms'))+'</a> · <a href="/privacy" target="_blank" rel="noopener">'+esc(t('footer.privacy'))+'</a></div>'+
        '<label class="ck" style="margin-top:12px"><input type="checkbox" data-rg="terms"'+(d.terms?' checked':'')+'><span>'+esc(t('reg.terms'))+'</span></label>'+
        '<div class="er" id="rg-terms-err"></div>';
    }
  }else{
    if(s===1){
      body+='<h3>'+esc(t('reg.s1'))+'</h3><div class="f">'+
        '<label>'+esc(t('reg.name'))+'</label><input data-rg="name" value="'+esc(d.name)+'">'+
        '<label>'+esc(t('reg.province'))+'</label><select data-rg="province"><option value="">'+esc(t('reg.province.pick'))+'</option>'+
        Object.keys((ST.cfg&&ST.cfg.provinces)||{}).map(function(p){return '<option value="'+esc(p)+'"'+(d.province===p?' selected':'')+'>'+esc(p)+'</option>'}).join('')+
        '</select>'+
        '<label>'+esc(t('reg.district'))+'</label><select data-rg="district"><option value="">'+esc(t('reg.district.pick'))+'</option>'+
        ((ST.cfg&&ST.cfg.provinces&&ST.cfg.provinces[d.province])||[]).map(function(dd){return '<option value="'+esc(dd)+'"'+(d.district===dd?' selected':'')+'>'+esc(dd)+'</option>'}).join('')+
        '</select>'+
        '</div>';
    }else if(s===2){
      body+='<h3>'+esc(t('reg.s2'))+'</h3><div class="f">'+
        '<label>'+esc(t('reg.photo'))+'</label><div class="note">'+esc(t('reg.photo.hint'))+'</div>'+
        '<div id="rg-photos" class="wrap" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"></div>'+
        '<label class="ib ol" for="rg-photo" style="justify-content:center;margin-top:8px">'+esc(t('reg.photo.add'))+'</label>'+
        '<input id="rg-photo" type="file" accept="image/*" multiple style="display:none">'+
        '<div class="er" id="rg-photo-err"></div>'+
        '</div>';
    }else if(s===3){
      body+='<h3>'+esc(t('reg.s3'))+'</h3><div class="f">'+
        '<input id="rg-jobs-search" type="search" placeholder="'+esc(t('reg.jobs.find'))+'">'+
        '<div id="rg-jobs-list" class="job-list"></div>'+
        '<label>'+esc(t('reg.bio'))+'</label><input data-rg="intro" value="'+esc(d.intro)+'" maxlength="80">'+
        '<label style="margin-top:12px">'+esc(t('reg.exp'))+'</label><textarea data-rg="experience" maxlength="500">'+esc(d.experience||'')+'</textarea>'+
        '</div>';
    }else if(s===4){
      body+='<h3>'+esc(t('reg.s4'))+'</h3><div class="f">'+
        '<label>'+esc(t('reg.phone'))+'</label><input value="'+esc(d.phone)+'" readonly style="background:var(--pl)">'+
        '<label class="ck"><input type="checkbox" data-rg="phone-agree"'+(d.phone_visible?' checked':'')+'><span>'+(LANG==='en'?'Allow other users to see my phone number':'Nemera ko nimero yanjye ya telefoni igaragara ku bandi')+'</span></label>'+
        '<label>'+esc(t('reg.wa'))+'</label><input data-rg="wa" type="tel" value="'+esc(d.wa)+'">'+
        '<label>'+esc(t('reg.phones'))+'</label><div class="note">'+esc(t('reg.phones.hint'))+'</div>'+
        '<div id="rg-phones-extra"></div>'+
        '<button type="button" class="ib ol" id="rg-phone-add" style="margin-top:6px;min-height:36px">'+esc(t('reg.phones.add'))+'</button>'+
        '<label style="margin-top:12px">'+esc(t('reg.email.public'))+'</label><div class="note">'+esc(t('reg.email.public.hint'))+'</div>'+
        '<input data-rg="email_public" type="email" inputmode="email" placeholder="name@email.com" value="'+esc(d.email_public||'')+'">'+
        '<label style="margin-top:12px">'+esc(t('reg.social'))+'</label>'+
        '<div id="rg-social-extra"></div>'+
        '<button type="button" class="ib ol" id="rg-social-add" style="margin-top:6px;min-height:36px">'+esc(t('reg.social.add'))+'</button>'+
        '</div>';
    }
  }
  body+='<div class="act">'+
    (RG.step>1?'<button class="ib ol" type="button" data-act="rgPrev">'+esc(t('reg.prev'))+'</button>':'')+
    '<button class="ib pb" type="button" id="rg-next" data-act="'+(RG.step===RG.total?'rgSubmit':'rgNext')+'">'+esc(RG.step===RG.total?t('reg.submit'):t('reg.next'))+'</button>'+
    modalBackBtn()+'</div>';
  openModal(body);
  wireRegInputs();
  if(s===1&&!RG.editing)wireSvc();
  if(s===1&&RG.editing)wireSvc();
  if(s===2)wirePhotos();
  if(s===3)wireJobs();
  if(s===4){wireExtraPhones();wireSocial();}
}
/* ===== END OF IGICE 13a/16 ===== */
`;EMBED['app.js'] += `

function wireExtraPhones(){
  var box=document.getElementById('rg-phones-extra');
  var addBtn=document.getElementById('rg-phone-add');
  if(!box)return;
  var phones=(RG.data.phones||[]).slice();
  if(typeof RG._phoneSlots!=='number'){
    var last=-1;
    for(var i=0;i<4;i++){if(phones[i])last=i}
    RG._phoneSlots=last>=0?last+1:0;
  }
  function render(){
    var slots=Math.min(4,Math.max(0,RG._phoneSlots|0));
    RG._phoneSlots=slots;
    var html='';
    for(var i=0;i<slots;i++){
      html+='<div style="display:flex;gap:6px;align-items:center;margin-top:6px">'+
        '<input data-rg="phone-'+i+'" type="tel" inputmode="tel" placeholder="'+esc(t('reg.phone.ph'))+'" value="'+esc(phones[i]||'')+'" style="flex:1">'+
        '<button type="button" class="ib ol" data-rm-phone="'+i+'" style="min-height:36px;min-width:36px;padding:0 8px" aria-label="Remove">×</button>'+
        '</div>';
    }
    box.innerHTML=html;
    if(addBtn)addBtn.style.display=slots>=4?'none':'';
    box.querySelectorAll('[data-rg^="phone-"]').forEach(function(el){
      var idx=parseInt(el.getAttribute('data-rg').slice(6),10);
      el.addEventListener('input',function(){
        var arr=(RG.data.phones||[]).slice();
        while(arr.length<=idx)arr.push('');
        arr[idx]=el.value;
        rgSet('phones',arr);
        phones=arr;
      });
    });
    box.querySelectorAll('[data-rm-phone]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var idx=parseInt(btn.getAttribute('data-rm-phone'),10);
        var arr=(RG.data.phones||[]).slice();
        arr.splice(idx,1);
        rgSet('phones',arr);
        phones=arr;
        RG._phoneSlots=Math.max(0,(RG._phoneSlots||1)-1);
        render();
      });
    });
  }
  if(addBtn){
    addBtn.onclick=function(){
      if((RG._phoneSlots||0)>=4)return;
      RG._phoneSlots=(RG._phoneSlots||0)+1;
      render();
    };
  }
  render();
}
var SOCIAL_FIELDS=['facebook','instagram','tiktok','linkedin','telegram','twitter'];
var SOCIAL_LABELS={facebook:'Facebook',instagram:'Instagram',tiktok:'TikTok',linkedin:'LinkedIn',telegram:'Telegram',twitter:'X (Twitter)'};
function wireSocial(){
  var box=document.getElementById('rg-social-extra');
  var addBtn=document.getElementById('rg-social-add');
  if(!box)return;
  if(typeof RG._socialSlots!=='number'){
    var n=0;
    for(var i=0;i<SOCIAL_FIELDS.length;i++){if(RG.data[SOCIAL_FIELDS[i]])n=i+1}
    RG._socialSlots=n;
  }
  function render(){
    var slots=RG._socialSlots||0;
    var html='';
    for(var i=0;i<slots;i++){
      var key=SOCIAL_FIELDS[i];
      html+='<div style="margin-top:8px"><label>'+esc(SOCIAL_LABELS[key])+'</label>'+
        '<div style="display:flex;gap:6px;align-items:center">'+
        '<input data-rg="'+key+'" type="text" placeholder="@username or https://..." value="'+esc(RG.data[key]||'')+'" style="flex:1">'+
        '<button type="button" class="ib ol" data-rm-social="'+i+'" style="min-height:36px;min-width:36px;padding:0 8px" aria-label="Remove">×</button>'+
        '</div></div>';
    }
    box.innerHTML=html;
    if(addBtn)addBtn.style.display=slots>=SOCIAL_FIELDS.length?'none':'';
    box.querySelectorAll('[data-rg]').forEach(function(el){
      var key=el.getAttribute('data-rg');
      el.addEventListener('input',function(){rgSet(key,el.value)});
    });
    box.querySelectorAll('[data-rm-social]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var idx=parseInt(btn.getAttribute('data-rm-social'),10);
        var key=SOCIAL_FIELDS[idx];
        rgSet(key,'');
        // shift remaining
        for(var j=idx;j<SOCIAL_FIELDS.length-1;j++){
          rgSet(SOCIAL_FIELDS[j],RG.data[SOCIAL_FIELDS[j+1]]||'');
        }
        rgSet(SOCIAL_FIELDS[SOCIAL_FIELDS.length-1],'');
        RG._socialSlots=Math.max(0,(RG._socialSlots||1)-1);
        render();
      });
    });
  }
  if(addBtn){
    addBtn.onclick=function(){
      if((RG._socialSlots||0)>=SOCIAL_FIELDS.length)return;
      RG._socialSlots=(RG._socialSlots||0)+1;
      render();
    };
  }
  render();
}
function wireRegInputs(){
  wirePwToggle();
  $$('[data-rg]').forEach(function(el){
    var key=el.getAttribute('data-rg');
    if(key==='province'){
      el.addEventListener('change',function(){
        rgSet('province',el.value);
        rgSet('district','');
        renderRegister();
      });
      return;
    }
    if(key==='district'){
      el.addEventListener('change',function(){rgSet('district',el.value)});
      return;
    }
    if(key==='other-cb'){
      el.addEventListener('change',function(){
        var te=document.querySelector('[data-rg="other"]');
        if(te)te.style.display=el.checked?'':'none';
        if(!el.checked){rgSet('other','');if(te)te.value=''}
        saveDraft();
      });
      return;
    }
    if(key==='terms'){
      el.addEventListener('change',function(){rgSet('terms',!!el.checked)});
      return;
    }
    if(key==='phone-agree'){
      el.addEventListener('change',function(){rgSet('phone_visible',!!el.checked)});
      return;
    }
    if(key.indexOf('phone-')===0){
      var i=parseInt(key.slice(6),10);
      el.addEventListener('input',function(){
        var arr=(RG.data.phones||[]).slice();
        arr[i]=el.value;
        rgSet('phones',arr);
      });
      return;
    }
    if(key==='experience'){
      el.addEventListener('input',function(){rgSet('experience',el.value)});
      return;
    }
    if(key==='intro'){
      el.addEventListener('input',function(){rgSet('intro',el.value)});
      return;
    }
    if(key==='soc'){
      el.addEventListener('input',function(){rgSet('soc',el.value)});
      return;
    }
    el.addEventListener('input',function(){rgSet(key,el.value)});
  });
}

function wireSvc(){
  var box=document.getElementById('rg-svc');
  if(!box)return;
  var provs=(ST.cfg&&ST.cfg.provinces)||{};
  var provNames=Object.keys(provs);
  if(!provNames.length){box.innerHTML='<div class="note">'+esc(t('common.loading'))+'</div>';return}
  var cur=(RG.data.svc||[]).slice();
  var html='';
  provNames.forEach(function(p,idx){
    var dists=provs[p]||[];
    var anyOn=cur.some(function(d){return dists.indexOf(d)!==-1});
    html+='<details style="border-bottom:1px solid var(--b)"'+(idx===0||anyOn?' open':'')+'>'+
      '<summary style="padding:8px 4px;min-height:40px;cursor:pointer;font-weight:600">'+esc(p)+'</summary>'+
      '<div style="padding:4px 4px 8px">'+dists.map(function(dd){
        var on=cur.indexOf(dd)!==-1;
        return '<label class="ck" style="margin:4px 0"><input type="checkbox" data-svc="'+esc(dd)+'"'+(on?' checked':'')+'><span>'+esc(dd)+'</span></label>';
      }).join('')+'</div></details>';
  });
  html+='<div class="note" id="rg-svc-count">'+cur.length+' / 5</div>';
  box.innerHTML=html;
  box.querySelectorAll('[data-svc]').forEach(function(cb){
    cb.addEventListener('change',function(){
      var dd=cb.getAttribute('data-svc');
      var arr=(RG.data.svc||[]).slice();
      var i=arr.indexOf(dd);
      if(cb.checked&&i===-1){
        if(arr.length>=5){cb.checked=false;toast('Max 5');return}
        arr.push(dd);
      }else if(!cb.checked&&i!==-1){
        arr.splice(i,1);
      }
      rgSet('svc',arr);
      var c=document.getElementById('rg-svc-count');
      if(c)c.textContent=arr.length+' / 5';
    });
  });
}

function wirePhotos(){
  var inp=document.getElementById('rg-photo');
  var list=document.getElementById('rg-photos');
  if(!inp||!list)return;
  function draw(){
    var html='';
    if(RG.editing&&RG.data._photosUnchanged&&RG.data.thumbs.length===0){
      var existing=(ST.me&&ST.me.photos)||[];
      var thumb=(ST.me&&ST.me.thumb)||'';
      var exThumb=thumb?[thumb]:existing.slice(0,1);
      html+=exThumb.map(function(u){
        return '<div style="position:relative"><img src="'+esc(u)+'" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:10px"></div>';
      }).join('');
    }
    html+=RG.data.thumbs.map(function(u,i){
      return '<div style="position:relative"><img src="'+esc(u)+'" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:10px">'+
        '<button type="button" class="ib ol" data-act="rgRmPhoto" data-i="'+i+'" style="position:absolute;top:-6px;right:-6px;min-height:26px;min-width:26px;padding:0;background:var(--s)">×</button></div>';
    }).join('');
    list.innerHTML=html;
  }
  draw();
  inp.addEventListener('change',function(){
    var files=Array.prototype.slice.call(inp.files||[]);
    var err=document.getElementById('rg-photo-err');
    if(err)err.textContent='';
    var failed=0,tooMany=false;
    var chain=Promise.resolve();
    files.forEach(function(f){
      chain=chain.then(function(){
        if(RG.data.photos.length>=3){tooMany=true;return}
        if(err)err.textContent=t('reg.photo.working');
        return processPhoto(f).then(function(r){
          RG.data.photos.push(r.big);
          RG.data.thumbs.push(r.small);
          RG.data._photosUnchanged=false;
          draw();
          saveDraft();
        }).catch(function(){failed++});
      });
    });
    chain.then(function(){
      if(err)err.textContent=failed?t('reg.photo.fail'):(tooMany?t('reg.photo.max'):'');
      inp.value='';
    });
  });
}

function wireJobs(){
  var list=document.getElementById('rg-jobs-list');
  var search=document.getElementById('rg-jobs-search');
  if(!list)return;
  var cats=(ST.cfg&&ST.cfg.categories)||{};
  var sel=(RG.data.jobs||[]).slice();
  function draw(){
    var f=(search&&search.value||'').toLowerCase().trim();
    var html='<div class="job-count">'+esc(String(sel.length))+'/3</div>';
    var any=false;
    Object.keys(cats).forEach(function(cat){
      var jobs=cats[cat].filter(function(j){
        if(!f)return true;
        var rw=String(j).toLowerCase();
        var en=String(displayCapName(j)||'').toLowerCase();
        return rw.indexOf(f)!==-1||en.indexOf(f)!==-1;
      });
      if(!jobs.length)return;
      any=true;
      html+='<div class="job-cat">'+esc(displayCat(cat))+'</div>';
      jobs.forEach(function(j){
        var on=sel.indexOf(j)!==-1;
        var full=sel.length>=3&&!on;
        html+='<label class="job-item'+(on?' on':'')+(full?' disabled':'')+'" data-job="'+esc(j)+'">'+
          '<input type="checkbox"'+(on?' checked':'')+(full?' disabled':'')+'>'+
          '<span>'+esc(displayCapName(j))+'</span></label>';
      });
    });
    if(!any)html+='<div class="note">'+esc(t('home.empty'))+'</div>';
    list.innerHTML=html;
  }
  if(!list._wired){
    list._wired=true;
    list.addEventListener('change',function(e){
      var inp=e.target;
      if(!inp||inp.type!=='checkbox')return;
      var row=inp.closest('[data-job]');
      if(!row)return;
      var j=row.getAttribute('data-job');
      var i=sel.indexOf(j);
      if(inp.checked){
        if(i===-1){
          if(sel.length>=3){inp.checked=false;toast(t('reg.err.jobs3')||'Max 3');return}
          sel.push(j);
        }
      }else{
        if(i!==-1)sel.splice(i,1);
      }
      rgSet('jobs',sel.slice());
      draw();
    });
    list.addEventListener('click',function(e){
      var row=e.target.closest('label.job-item');
      if(!row||row.classList.contains('disabled'))return;
      /* label+checkbox handles toggle via change */
    });
  }
  draw();
  if(search&&!search._wired){
    search._wired=true;
    search.addEventListener('input',draw);
  }
}

function rgValidate(step){
  var d=RG.data;
  if(step===1){
    if(d.name.trim().length<3)return 'reg.err.name';
    if(!RG.editing&&d.birthdate){
      var bd=new Date(d.birthdate+'T00:00:00');
      if(!Number.isFinite(bd.getTime()))return 'reg.err.birthdate';
      var now=new Date();
      var age=now.getFullYear()-bd.getFullYear();
      var mo=now.getMonth()-bd.getMonth(),dy=now.getDate()-bd.getDate();
      if(mo<0||(mo===0&&dy<0))age--;
      if(age<18||age>100)return 'reg.err.age';
    }
    if(!d.province)return 'reg.err.province';
    if(!d.district)return 'reg.err.district';
  }
  if(step===2){
  }
  if(step===3){
    if(!d.jobs.length&&!d.other.trim())return 'reg.err.jobs';
    if(d.jobs.length+(d.other.trim()?1:0)>3)return 'reg.err.jobs3';
    if(d.other&&d.other.trim().length<3)return 'reg.err.other';
  }
  if(step===4&&!RG.editing){
    var ph=d.phone.replace(/[\\s-]/g,'').replace(/^\\+?250/,'0');
    if(!/^07[2389]\\d{7}$/.test(ph))return 'reg.err.phone';
    if(!d.phone_visible)return 'reg.err.phone.agree';
  }
  if(step===5&&!RG.editing){
    if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(d.email.trim()))return 'reg.err.email';
    if(d.password.length<8)return 'reg.err.password';
  }
  if(step===6&&!RG.editing){
    if(!d.terms)return 'reg.err.terms';
  }
  return null;
}

function openRegister(){
  if(RG.editing)resetRG();
  var draft=loadDraft();
  if(draft&&!RG._checked){
    RG._checked=true;
    if(window.confirm(t('reg.draftRestore'))){
      var r=Object.assign({},draft);
      delete r.password;delete r.terms;
      RG.data=Object.assign({},RG.data,r);
      RG.data.password='';
      RG.data.terms=false;
    }
  }
  RG.editing=false;
  RG.step=1;
  renderRegister();
}

function openEditProfile(){
  if(!ST.me)return openLogin();
  var m=ST.me;
  RG.editing=true;
  RG.step=1;
  RG._checked=true;
  RG._phoneSlots=undefined;RG._socialSlots=undefined;
  RG.data={
    name:m.name||'',
    birthdate:m.birthdate||'',
    gender:m.gender||'',
    province:m.province||'',
    district:m.district||'',
    svc:(m.svc||[]).slice(),
    photos:[],
    thumbs:[],
    jobs:(m.caps||[]).slice(),
    other:m.other||'',
    intro:m.intro||'',
    edu:m.edu_level||m.edu||'',
    soc:m.soc||'',
    email_public:m.email_public||'',
    facebook:m.facebook||'',
    instagram:m.instagram||'',
    tiktok:m.tiktok||'',
    linkedin:m.linkedin||'',
    telegram:m.telegram||'',
    twitter:m.twitter||'',
    experience:(function(){
      if(!m.experience)return '';
      if(typeof m.experience==='string')return m.experience;
      if(Array.isArray(m.experience)&&m.experience.length){
        var x=m.experience[0];
        if(typeof x==='string')return x;
        return (x.role||'')+(x.where?' — '+x.where:'')+(x.years?' ('+x.years+')':'');
      }
      return '';
    })(),
    languages:(m.languages||[]).slice(),
    availability:(m.availability||[]).slice(),
    phone:m.phone||'',
    phone_visible:m.phone_visible!==false,
    wa:m.wa||'',
    phones:(m.phones||[]).slice(),
    email:m.email||'',
    password:'',
    terms:true,
    _photosUnchanged:true
  };
  renderRegister();
}

async function rgSubmit(){
  if(RG.busy)return;
  RG.busy=true;
  var btn=document.getElementById('rg-next');
  if(btn){btn.disabled=true;btn.textContent=t('reg.saving')}
  var d=RG.data;
  var url=RG.editing?'/api/me':'/api/register';
  var method=RG.editing?'PUT':'POST';
  var body={
    name:d.name.trim(),
    district:d.district,
    jobs:d.jobs.slice(),
    other:d.other.trim(),
    intro:d.intro.trim(),
    edu:d.edu||'',
    edu_level:d.edu||'',
    soc:d.soc.trim(),
    wa:d.wa.trim(),
    phones:(d.phones||[]).filter(Boolean),
    svc:d.svc.slice(),
    languages:d.languages.slice(),
    availability:d.availability.slice(),
    experience:d.experience||'',
    email_public:(d.email_public||'').trim(),
    facebook:(d.facebook||'').trim(),
    instagram:(d.instagram||'').trim(),
    tiktok:(d.tiktok||'').trim(),
    linkedin:(d.linkedin||'').trim(),
    telegram:(d.telegram||'').trim(),
    twitter:(d.twitter||'').trim()
  };
  if(!RG.editing){
    body.birthdate=d.birthdate;
    body.gender=d.gender;
    body.phone=d.phone.trim();
    body.phone_visible=!!document.querySelector('[data-rg=\"phone-agree\"]:checked');
    body.email=d.email.trim().toLowerCase();
    body.password=d.password;
    body.terms=d.terms;
  }else{
    body.birthdate=d.birthdate||undefined;
    body.gender=d.gender||undefined;
    body.phone_visible=!!RG.data.phone_visible;
  }
  if(d.photos.length){
    body.photos=d.photos.slice();
    body.thumbs=[d.thumbs[0]];
  }
  var r=await api(method,url,body);
  RG.busy=false;
  if(btn){btn.disabled=false;btn.textContent=t('reg.submit')}
  if(!r.ok){
    if(r.data&&r.data.field){
      var stepMap={name:1,birthdate:1,gender:1,district:1,province:1,photos:2,jobs:3,other:3,phone:4,email:5,password:5,terms:6};
      var st=stepMap[r.data.field];
      if(st){RG.step=st;renderRegister();setTimeout(function(){toast(r.data.error||t('home.error'))},100);return}
    }
    return toast((r.data&&r.data.error)||t('home.error'));
  }
  if(RG.editing){
    if(r.data&&r.data.profile)ST.me=normProfile(r.data.profile);
    RG.editing=false;
    clearDraft();
    closeModal();
    applyStaticTexts();
    toast(t('common.success'));
    return;
  }
  clearDraft();
  if(r.data&&r.data.profile){
    ST.me=normProfile(r.data.profile);
  }
  applyStaticTexts();
  var pid=ST.me&&ST.me.id;
  openModal('<h2>'+esc(t('reg.success'))+'</h2>'+
    '<div class="act">'+
      (pid?'<button class="ib pb" type="button" data-act="full" data-pid="'+esc(pid)+'">'+esc(t('reg.view'))+'</button>':'')+
      modalBackBtn()+
    '</div>');
}

function openLogin(){
  var html='<h2>'+esc(t('login.title'))+'</h2>'+
    '<div class="f">'+
      '<label>'+esc(t('login.id'))+'</label><input id="lp" autocomplete="username" placeholder="'+esc(t('login.id.ph'))+'">'+
      '<label>'+esc(t('login.password'))+'</label><div style="display:flex;align-items:center;gap:4px"><input id="lw" type="password" autocomplete="current-password" style="flex:1">'+pwToggleBtn('lw')+'</div>'+
      '<div class="er" id="le"></div>'+
    '</div>'+
    '<div class="act">'+
      '<button class="ib pb" type="button" id="lb" data-act="doLogin">'+esc(t('login.submit'))+'</button>'+
      '<button class="ib ol" type="button" data-act="openRegister">'+esc(t('nav.register'))+'</button>'+
      modalBackBtn()+
    '</div>'+
    '<div class="act"><button class="lk" type="button" data-act="openForgot">'+esc(t('login.forgot'))+'</button></div>';
  openModal(html);
  wirePwToggle();
  var pw=document.getElementById('lw');
  if(pw)pw.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doLogin()}});
}

async function doLogin(){
  var id=document.getElementById('lp');
  var pw=document.getElementById('lw');
  var err=document.getElementById('le');
  if(!id||!pw)return;
  if(err)err.textContent='';
  var btn=document.getElementById('lb');
  if(btn){btn.disabled=true;btn.textContent=t('login.working')}
  var r=await api('POST','/api/login',{id:id.value.trim(),password:pw.value});
  if(btn){btn.disabled=false;btn.textContent=t('login.submit')}
  if(!r.ok){
    if(err)err.textContent=t('login.err');
    return;
  }
  if(r.data&&r.data.status==='deleted'){
    closeModal();openRestore();return;
  }
  if(r.data&&r.data.profile){
    ST.me=normProfile(r.data.profile);
    ST.me.role=r.data.role;
    ST.me.role_level=r.data.role_level;
    if(r.data.profile.email)ST.me.email=r.data.profile.email;
  }
  closeModal();
  applyStaticTexts();
  toast(t('login.ok'));
  if(ST.me&&ST.me.id)openFull(ST.me.id);
}

async function doLogout(){
  await api('POST','/api/logout',{});
  ST.me=null;
  resetRG();
  var ms1=document.getElementById('ms');if(ms1)ms1.style.display='none';
  var ms2=document.getElementById('ms2');if(ms2)ms2.style.display='none';
  applyStaticTexts();
  toast(t('logout.ok'));
}

function openRestore(){
  openModal('<h2>'+esc(t('restore.title'))+'</h2><p>'+esc(t('restore.body'))+'</p>'+
    '<div class="act"><button class="ib pb" type="button" data-act="doRestore">'+esc(t('restore.yes'))+'</button>'+
    '<button class="ib ol" type="button" data-act="close">'+esc(t('restore.no'))+'</button></div>');
}
async function doRestore(){
  var r=await api('POST','/api/me/restore',{});
  if(!r.ok)return toast(t('home.error'));
  closeModal();
  try{
    var me=await api('GET','/api/me',undefined,{retry:false});
    if(me.ok&&me.data&&me.data.profile){
      ST.me=normProfile(me.data.profile);
      if(me.data.user){ST.me.role=me.data.user.role;ST.me.role_level=me.data.user.role_level;ST.me.email=me.data.user.email||ST.me.email}
    }
    applyStaticTexts();
  }catch(e){}
  toast(t('restore.ok'));
}

function openForgot(){
  openModal('<h2>'+esc(t('forgot.title'))+'</h2><div class="f">'+
    '<label>'+esc(t('forgot.email'))+'</label><input id="fe" type="email" inputmode="email" autocomplete="email">'+
    '<div class="note" id="fm">'+esc(t('forgot.hint'))+'</div></div>'+
    '<div class="act"><button class="ib pb" type="button" data-act="doForgot">'+esc(t('forgot.submit'))+'</button>'+modalBackBtn()+'</div>');
}
async function doForgot(){
  var fe=document.getElementById('fe');if(!fe)return;
  var _r=await api('POST','/api/password/forgot',{email:fe.value.trim()});
  var fm=document.getElementById('fm');
  if(fm){
    if(_r&&_r.data&&_r.data.has_existing)fm.textContent=t('forgot.already_sent');
    else fm.textContent=t('forgot.sent');
  }
}

function openReset(token){
  openModal('<h2>'+esc(t('reset.title'))+'</h2><div class="f">'+
    '<label>'+esc(t('reset.new'))+'</label><div style="display:flex;align-items:center;gap:4px"><input id="rp" type="password" autocomplete="new-password" style="flex:1">'+pwToggleBtn('rp')+'</div>'+
    '<div class="er" id="rerr"></div></div>'+
    '<div class="act"><button class="ib pb" type="button" data-act="doReset" data-token="'+esc(token)+'">'+esc(t('reset.submit'))+'</button>'+modalBackBtn()+'</div>');
  wirePwToggle();
}
async function doReset(token){
  var rp=document.getElementById('rp'),err=document.getElementById('rerr');
  if(!rp)return;
  if(err)err.textContent='';
  if(rp.value.length<8){if(err)err.textContent=t('reg.err.password');return}
  var r=await api('POST','/api/password/reset',{token:token,password:rp.value});
  if(!r.ok){if(err)err.textContent=t('reset.err');return}
  closeModal();
  toast(t('reset.ok'));
  openLogin();
}
/* ===== END OF IGICE 13b/16 ===== */
`;EMBED['app.js'] += `

function openAccount(){
  if(!ST.me)return openLogin();
  var m=ST.me;
  var isAdmin=(m.role_level==='admin'||m.role_level==='super'||m.role==='admin'||m.role_level==='mod'||m.role_level==='editor'||m.role_level==='viewer');
  var html='<h2>'+esc(t('account.title'))+'</h2>'+
    '<div class="note">'+esc(m.name||'')+' · '+esc(m.email||'')+'</div>'+
    (m.email_verified===0||m.email_verified===false?'<div class="note" style="color:var(--e)">'+esc(t('verify.email'))+' <button class="ib ol sm" type="button" data-act="verifyEmail">'+esc(t('verify.send'))+'</button></div>':'')+
    '<div class="act" style="flex-direction:column;align-items:stretch">'+
      '<button class="ib pb" type="button" data-act="accountMyProfile">'+esc(t('account.myProfile'))+'</button>'+
      '<button class="ib ol" type="button" data-act="accountEdit">'+esc(t('account.edit'))+'</button>'+
      '<button class="ib ol" type="button" data-act="accountMessages">'+esc(t('account.messages'))+'</button>'+
      '<button class="ib ol" type="button" data-act="accountNotif">'+esc(t('account.notifications'))+'</button>'+
      '<button class="ib ol" type="button" data-act="accountPw">'+esc(t('account.password'))+'</button>'+
      (isAdmin?'<a class="ib ol" href="/admin" target="_blank" rel="noopener" style="text-decoration:none;text-align:center">'+esc(t('account.admin'))+'</a>':'')+
      '<button class="ib ol" type="button" data-act="accountDelete" style="color:var(--e)">'+esc(t('account.delete'))+'</button>'+
      '<button class="ib ol" type="button" data-act="accountLogout">'+esc(t('account.logout'))+'</button>'+
      '<button class="ib ol" type="button" data-act="accountLogoutAll">'+esc(t('account.logoutAll'))+'</button>'+
    '</div>'+
    '<div class="act">'+modalBackBtn()+'</div>';
  openModal(html);
}
function openNotifications(){
  if(!ST.me)return openLogin();
  openModal('<h2>'+esc(t('account.notifications'))+'</h2><div class="note">'+esc(t('common.loading'))+'</div>');
  api('GET','/api/me/notifications').then(function(r){
    if(!r.ok){openModal('<h2>'+esc(t('account.notifications'))+'</h2><div class="note">'+esc((r.data&&r.data.error)||t('common.error'))+'</div><div class="act">'+modalBackBtn()+'</div>');return}
    var rows=(r.data&&r.data.notifications)||[];
    var html='<h2>'+esc(t('account.notifications'))+'</h2>'+
      (rows.length?'<div class="act"><button class="ib ol" type="button" data-act="notifReadAll">'+esc(t('notif.markRead'))+'</button></div>':'')+
      (rows.length?rows.map(function(n){
        return '<div class="box" style="'+(n.read_at?'':'border-left:3px solid var(--p);')+'margin:8px 0">'+
          '<div style="font-weight:600">'+esc(n.title||n.kind||'')+'</div>'+
          '<div class="note">'+esc(n.body||'')+'</div>'+
          '<div class="note" style="font-size:12px">'+esc(n.created_at?new Date(n.created_at).toLocaleString():'')+'</div></div>';
      }).join(''):'<div class="note">'+esc(t('notif.empty'))+'</div>')+
      '<div class="act">'+modalBackBtn()+'</div>';
    openModal(html);
    refreshNotifBadge(r.data&&r.data.unread);
  });
}
function openMessagesInbox(){
  if(!ST.me)return openLogin();
  openModal('<h2>'+esc(t('account.messages'))+'</h2><div class="note">'+esc(t('common.loading'))+'</div>');
  api('GET','/api/messages').then(function(r){
    if(!r.ok){openModal('<h2>'+esc(t('account.messages'))+'</h2><div class="note">'+esc((r.data&&r.data.error)||t('common.error'))+'</div><div class="act">'+modalBackBtn()+'</div>');return}
    var rows=(r.data&&r.data.messages)||[];
    var html='<h2>'+esc(t('account.messages'))+'</h2>'+
      (rows.length?rows.map(function(n){
        return '<div class="box" style="'+(n.read_at?'':'border-left:3px solid var(--p);')+'margin:8px 0">'+
          '<div style="font-weight:600">'+esc(n.subject||'(no subject)')+'</div>'+
          '<div class="note">'+esc(n.from_name||n.from_id||'')+' · '+esc(n.created_at?new Date(n.created_at).toLocaleString():'')+'</div>'+
          '<div>'+esc(n.body||'')+'</div>'+
          (n.from_id?'<button class="ib ol sm" type="button" data-act="msgReply" data-to="'+esc(String(n.from_id))+'" data-subj="'+esc('Re: '+(n.subject||''))+'">'+esc(t('msg.reply'))+'</button>':'')+
          '</div>';
      }).join(''):'<div class="note">'+esc(t('msg.empty'))+'</div>')+
      '<div class="act">'+modalBackBtn()+'</div>';
    openModal(html);
  });
}
function openMsgCompose(toId,subj){
  openModal('<h2>'+esc(t('msg.reply'))+'</h2><div class="f">'+
    '<label>'+esc(t('help.contactForm.msg'))+'</label><textarea id="msg-body" rows="4"></textarea>'+
    '<div class="er" id="msg-err"></div></div>'+
    '<div class="act"><button class="ib pb" type="button" data-act="msgSend" data-to="'+esc(String(toId))+'" data-subj="'+esc(subj||'')+'">'+esc(t('common.save'))+'</button>'+modalBackBtn()+'</div>');
}
async function refreshNotifBadge(n){
  var bn=document.getElementById('bn');
  var badge=document.getElementById('bn-n');
  if(!bn)return;
  if(!ST.me){bn.style.display='none';return}
  bn.style.display='';
  if(n===undefined){
    var r=await api('GET','/api/me/notifications');
    if(r.ok)n=(r.data&&r.data.unread)||0;
    else n=0;
  }
  if(badge){
    if(n>0){badge.style.display='inline-block';badge.textContent=String(n>99?'99+':n)}
    else badge.style.display='none';
  }
}
function displayCap(p){
  if(LANG==='en'&&p.cap_en)return p.cap_en;
  return p.cap||'';
}
function displayCaps(p){
  if(LANG==='en'&&p.caps_en&&p.caps_en.length)return p.caps_en;
  return p.caps||[];
}
function displayProv(name){
  if(LANG==='en'&&ST.cfg&&ST.cfg.prov_en&&ST.cfg.prov_en[name])return ST.cfg.prov_en[name];
  return name||'';
}
function displayCat(name){
  if(LANG==='en'&&ST.cfg&&ST.cfg.cat_en&&ST.cfg.cat_en[name])return ST.cfg.cat_en[name];
  return name||'';
}
function displayCapName(rwName){
  if(LANG==='en'&&ST.cfg&&ST.cfg.cap_en&&ST.cfg.cap_en[rwName])return ST.cfg.cap_en[rwName];
  return rwName||'';
}


function openChangePassword(){
  openModal('<h2>'+esc(t('account.password'))+'</h2><div class="f">'+
    '<label>'+esc(t('account.currentPw'))+'</label><div style="display:flex;align-items:center;gap:4px"><input id="cp-current" type="password" autocomplete="current-password" style="flex:1">'+pwToggleBtn('cp-current')+'</div>'+
    '<label>'+esc(t('account.newPw'))+'</label><div style="display:flex;align-items:center;gap:4px"><input id="cp-new" type="password" autocomplete="new-password" style="flex:1">'+pwToggleBtn('cp-new')+'</div>'+
    '<div class="er" id="cp-err"></div></div>'+
    '<div class="act"><button class="ib pb" type="button" data-act="doChangePw">'+esc(t('common.save'))+'</button>'+modalBackBtn()+'</div>');
  wirePwToggle();
}
async function doChangePassword(){
  var cur=document.getElementById('cp-current');
  var nw=document.getElementById('cp-new');
  var err=document.getElementById('cp-err');
  if(err)err.textContent='';
  if(!nw||nw.value.length<8){if(err)err.textContent=t('reg.err.password');return}
  var r=await api('POST','/api/me/password',{current:cur.value,next:nw.value});
  if(!r.ok){if(err)err.textContent=(r.data&&r.data.error)||t('home.error');return}
  closeModal();
  toast(t('common.success'));
}

function openDeleteAccount(){
  openModal('<h2>'+esc(t('account.delete'))+'</h2>'+
    '<div class="box">'+esc(t('account.deleteWarn'))+'</div>'+
    '<div class="f"><label>'+esc(t('account.confirmPw'))+'</label>'+
    '<div style="display:flex;align-items:center;gap:4px"><input id="del-pw" type="password" autocomplete="current-password" style="flex:1">'+pwToggleBtn('del-pw')+'</div>'+
    '<div class="er" id="del-err"></div></div>'+
    '<div class="act">'+
      '<button class="ib ol" type="button" data-act="close">'+esc(t('common.no'))+'</button>'+
      '<button class="ib pb" type="button" data-act="doDelete" style="background:var(--e);color:#fff">'+esc(t('common.yes'))+'</button>'+
    '</div>');
  wirePwToggle();
}
async function doDeleteAccount(){
  var pw=document.getElementById('del-pw');
  var err=document.getElementById('del-err');
  if(err)err.textContent='';
  if(!pw||!pw.value){if(err)err.textContent=t('common.required');return}
  var r=await api('POST','/api/me/delete',{password:pw.value});
  if(!r.ok){if(err)err.textContent=(r.data&&r.data.error)||t('home.error');return}
  await api('POST','/api/logout',{});
  ST.me=null;
  resetRG();
  closeModal();
  applyStaticTexts();
  openModal('<h2>'+esc(t('account.deleteOk'))+'</h2><p>'+esc(t('account.deleteBody'))+'</p>'+
    '<div class="act"><button class="ib pb" type="button" data-act="close">'+esc(t('common.ok'))+'</button></div>');
}

function openSaved(){
  if(!ST.me)return openLogin();
  openModal('<h2>'+esc(t('saved.title'))+'</h2><div class="note">'+esc(t('common.loading'))+'</div>');
  api('GET','/api/saved').then(function(r){
    if(!r.ok){
      openModal('<h2>'+esc(t('saved.title'))+'</h2><div class="note">'+esc(t('home.error'))+'</div><div class="act">'+modalBackBtn()+'</div>');
      return;
    }
    var list=(r.data&&r.data.profiles)||[];
    var body;
    if(!list.length){
      body='<p class="note">'+esc(t('saved.empty'))+'</p>';
    }else{
      body=list.map(function(p){
        var x=normProfile(p);
        if(x.id)CACHE[x.id]=x;
        if(x.pid)CACHE[x.pid]=x;
        if(p.pid)CACHE[p.pid]=x;
        var thumb=(x.th&&x.th[0])||(x.ph&&x.ph[0])||'';
        var av=thumb&&!saverOn
          ?'<div class="av" style="width:56px;aspect-ratio:1;margin:0;flex:none"><img src="'+esc(thumb)+'" alt="" loading="lazy" decoding="async"></div>'
          :'<div class="av" style="width:56px;aspect-ratio:1;margin:0;flex:none"><span class="ph">'+esc(ini(x.name))+'</span></div>';
        return '<button class="card" type="button" style="width:100%;flex-direction:row;align-items:center;gap:10px;margin-top:8px" data-act="open" data-pid="'+esc(x.id)+'">'+
          av+'<div style="min-width:0"><div class="nm">'+esc(x.name)+'</div>'+
          '<div class="cp">'+esc(x.cap||'')+'</div>'+
          '<div class="lc">'+ic('pin')+esc(x.loc||'')+'</div></div></button>';
      }).join('');
    }
    openModal('<h2>'+esc(t('saved.title'))+'</h2>'+body+'<div class="act">'+modalBackBtn()+'</div>');
  });
}

function openMessage(pid){
  if(!ST.me)return openLogin();
  var p=findCached(pid);
  var name=p?p.name:pid;
  openModal('<h2>'+esc(t('profile.message')||'Message')+'</h2>'+
    '<div class="note">'+esc(name)+'</div>'+
    '<div class="f"><label>'+esc(t('help.contactForm.msg')||'Message')+'</label>'+
    '<textarea id="msg-body" maxlength="2000" rows="4"></textarea>'+
    '<div class="er" id="msg-err"></div></div>'+
    '<div class="act"><button class="ib pb" type="button" data-act="sendMessage" data-pid="'+esc(pid)+'">'+esc(t('help.send')||'Send')+'</button>'+modalBackBtn()+'</div>');
}
async function sendMessage(pid){
  var body=document.getElementById('msg-body');
  var err=document.getElementById('msg-err');
  if(err)err.textContent='';
  if(!body||body.value.trim().length<1){if(err)err.textContent=t('common.required');return}
  var r=await api('POST','/api/messages',{to_pid:pid,body:body.value.trim()});
  if(!r.ok){if(err)err.textContent=(r.data&&r.data.error)||t('home.error');return}
  closeModal();
  toast(t('common.success'));
}
function openHelp(){
  openModal('<h2>'+esc(t('help.title'))+'</h2>'+
    '<div class="f">'+
      '<label>'+esc(t('help.ask'))+'</label>'+
      '<input id="ha" placeholder="'+esc(t('help.ask.ph'))+'">'+
      '<div class="note">'+esc(t('help.hint'))+'</div>'+
    '</div>'+
    '<div id="hr" class="box" aria-live="polite"></div>'+
    '<div class="act">'+
      '<button class="ib pb" type="button" data-act="doAsk">'+esc(t('help.send'))+'</button>'+
      modalBackBtn()+
    '</div>'+
    '<div class="box">'+
      '<div>'+esc(t('help.contact.hint'))+'</div>'+
      '<div class="act" style="margin-top:6px">'+
        '<button class="ib ol" type="button" data-act="openContact">'+esc(t('help.contact'))+'</button>'+
      '</div>'+
    '</div>');
  var ha=document.getElementById('ha');
  if(ha)ha.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();doAsk()}});
}
async function doAsk(){
  var ha=document.getElementById('ha');
  var hr=document.getElementById('hr');
  if(!ha||!hr||!ha.value.trim())return;
  hr.textContent=t('common.loading');
  var r=await api('POST','/api/help/ask',{q:ha.value.trim()});
  if(!r.ok){hr.textContent=t('home.error');return}
  if(r.data&&r.data.answer){
    hr.innerHTML='<b>'+esc(r.data.question||ha.value)+'</b><br>'+esc(r.data.answer);
  }else{
    hr.textContent=t('help.no');
  }
}
function openContact(){
  openModal('<h2>'+esc(t('help.contact'))+'</h2><div class="f">'+
    '<label>'+esc(t('help.contactForm.name'))+'</label><input id="hc-name">'+
    '<label>'+esc(t('help.contactForm.email'))+'</label><input id="hc-email" type="email" inputmode="email">'+
    '<label>'+esc(t('help.contactForm.msg'))+'</label><textarea id="hc-body" maxlength="2000"></textarea>'+
    '<div class="er" id="hc-err"></div></div>'+
    '<div class="act"><button class="ib pb" type="button" data-act="doContact">'+esc(t('help.contactForm.submit'))+'</button>'+modalBackBtn()+'</div>');
}
async function doContact(){
  var n=document.getElementById('hc-name');
  var e=document.getElementById('hc-email');
  var b=document.getElementById('hc-body');
  var er=document.getElementById('hc-err');
  if(er)er.textContent='';
  if(!b||b.value.trim().length<3){if(er)er.textContent=t('common.required');return}
  var r=await api('POST','/api/help/contact',{name:n.value.trim(),email:e.value.trim(),body:b.value.trim()});
  if(!r.ok){if(er)er.textContent=(r.data&&r.data.error)||t('home.error');return}
  closeModal();
  toast(t('help.contactForm.ok'));
}

function openAbout(){
  var s=(ST.cfg&&ST.cfg.contact)||{};
  var contact='';
  if(s.email||s.whatsapp||s.phone){
    contact='<div class="box"><b>'+esc(t('help.contact'))+'</b>';
    if(s.email)contact+='<div class="lc" style="margin-top:6px"><a href="mailto:'+esc(s.email)+'">'+esc(s.email)+'</a></div>';
    if(s.whatsapp)contact+='<div class="lc" style="margin-top:4px"><a href="https://wa.me/250'+esc(String(s.whatsapp).replace(/^0/,''))+'" target="_blank" rel="noopener">WhatsApp: '+esc(s.whatsapp)+'</a></div>';
    if(s.phone)contact+='<div class="lc" style="margin-top:4px"><a href="tel:'+esc(s.phone)+'">'+esc(s.phone)+'</a></div>';
    contact+='</div>';
  }
  openModal('<h2>'+esc(t('about.title'))+'</h2>'+
    '<p>'+esc(t('about.intro'))+'</p>'+
    '<h3>'+esc(t('reg.s3'))+'</h3><p>'+esc(t('about.why'))+'</p>'+
    '<h3>'+esc(t('reg.s1'))+'</h3><p>'+esc(t('about.how'))+'</p>'+
    '<h3>'+esc(t('nav.about'))+'</h3><p>'+esc(t('about.what'))+'</p>'+
    '<h3>'+esc(t('about.vision'))+'</h3>'+
    contact+
    '<div class="act">'+modalBackBtn()+'</div>');
}

function bindNav(){
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-m]');
    if(!b)return;
    var m=b.getAttribute('data-m');
    var menu=document.getElementById('menu');
    if(menu)menu.classList.remove('on');
    if(m==='home'){window.scrollTo({top:0,behavior:'smooth'});return}
    if(m==='saver')return toggleSaver();
    if(m==='login')return ST.me?doLogout():openLogin();
    if(m==='about')return openAbout();
    if(m==='help')return openHelp();
    if(m==='saved')return openSaved();
    if(m==='notif')return openNotifications();
  });
  var bm=document.getElementById('bMenu');
  if(bm)bm.addEventListener('click',function(){
    var menu=document.getElementById('menu');
    if(menu)menu.classList.toggle('on');
  });
  var bs=document.getElementById('bSearch');
  if(bs)bs.addEventListener('click',function(){
    var box=document.getElementById('qbox');
    if(box)box.scrollIntoView({behavior:'smooth',block:'start'});
    var qi=document.getElementById('q');
    if(qi)setTimeout(function(){qi.focus()},250);
    if(typeof loadProfiles==='function')loadProfiles({reset:true});
  });
  var br=document.getElementById('bReg');
  if(br)br.addEventListener('click',function(){
    if(ST.me)return openAccount();
    return openRegister();
  });
  $$('.lsw button[data-lang]').forEach(function(b){
    b.classList.toggle('on',b.getAttribute('data-lang')===LANG);
    b.addEventListener('click',function(){setLang(b.getAttribute('data-lang'))});
  });
}

function bindClicks(){
  document.addEventListener('click',function(e){
    var el=e.target.closest('[data-act]');
    if(!el){if(e.target.id==='ov')closeModal();return}
    var act=el.getAttribute('data-act');
    var pid=el.getAttribute('data-pid');
    var token=el.getAttribute('data-token');
    if(act==='close')return closeModal();
    if(act==='open')return openPreview(pid);
    if(act==='full')return openFull(pid);
    if(act==='clearFilters'){ST.F={q:'',prov:'',dist:'',sort:ST.F.sort||'rel'};var sq=$('sq'),q=$('q'),sp=$('sp'),sd=$('sd');if(sq)sq.value='';if(q)q.value='';if(sp)sp.value='';if(sd){sd.value='';sd.disabled=false}loadProfiles({reset:true});return;}
    if(act==='chip'){
      ST.F.q=el.getAttribute('data-q')||'';
      var q=document.getElementById('q');if(q)q.value=ST.F.q;
      var sq=document.getElementById('sq');if(sq)sq.value=ST.F.q;
      return loadProfiles({reset:true});
    }
    if(act==='save')return doSaveProfile(pid,el);
    if(act==='share')return doShare(pid);
    if(act==='report')return openReport(pid);
    if(act==='reportSend')return doSendReport(pid);
    if(act==='msg')return openMessage(pid);
    if(act==='showphotos'){
      var photos=ST.openPhotos||[];
      var box=el.closest('.saver-gallery');
      if(!box||!photos.length)return;
      var h='<img class="gallery-main" src="'+esc(photos[0])+'" style="display:block !important" alt="">';
      if(photos.length>1){
        h+='<div class="gallery-thumbs" style="display:flex !important">'+photos.map(function(ph,i){
          return '<img src="'+esc(ph)+'" data-i="'+i+'" style="display:block !important" class="'+(i===0?'on':'')+'" alt="">';
        }).join('')+'</div>';
      }
      box.outerHTML=h;
      var th=$$('.gallery-thumbs img');
      th.forEach(function(t){
        t.addEventListener('click',function(){
          var i=+t.dataset.i;
          var m=document.querySelector('.gallery-main');
          if(m&&photos[i])m.src=photos[i];
          th.forEach(function(x){x.classList.toggle('on',x===t)});
        });
      });
      return;
    }
    if(act==='doLogin')return doLogin();
    if(act==='openRegister')return openRegister();
    if(act==='openForgot')return openForgot();
    if(act==='doForgot')return doForgot();
    if(act==='doReset')return doReset(token);
    if(act==='doRestore')return doRestore();
    if(act==='rgNext'){
      var err1=rgValidate(RG.step);
      if(err1)return toast(t(err1));
      RG.step=Math.min(RG.total,RG.step+1);
      if(!RG.editing)saveDraft();
      renderRegister();
      return;
    }
    if(act==='rgPrev'){
      RG.step=Math.max(1,RG.step-1);
      if(!RG.editing)saveDraft();
      renderRegister();
      return;
    }
    if(act==='rgSubmit'){
      var err2=rgValidate(RG.step);
      if(err2)return toast(t(err2));
      return rgSubmit();
    }
    if(act==='rgRmPhoto'){
      var i=+el.getAttribute('data-i');
      if(i>=0&&RG.data.photos[i]){
        RG.data.photos.splice(i,1);
        RG.data.thumbs.splice(i,1);
        RG.data._photosUnchanged=false;
        if(!RG.editing)saveDraft();
        var list=document.getElementById('rg-photos');
        if(list){
          list.innerHTML=RG.data.thumbs.map(function(u,k){
            return '<div style="position:relative"><img src="'+esc(u)+'" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:10px">'+
            '<button type="button" class="ib ol" data-act="rgRmPhoto" data-i="'+k+'" style="position:absolute;top:-6px;right:-6px;min-height:26px;min-width:26px;padding:0;background:var(--s)">×</button></div>';
          }).join('');
        }
      }
      return;
    }
    if(act==='accountMyProfile'){closeModal();return openFull(ST.me&&ST.me.pid)}
    if(act==='accountEdit'){closeModal();return setTimeout(openEditProfile,10)}
    if(act==='accountPw')return openChangePassword();
    if(act==='accountDelete')return openDeleteAccount();
    if(act==='accountLogout')return doLogout();
    if(act==='accountLogoutAll'){
      api('POST','/api/me/logout-all',{}).then(function(r){
        if(!r.ok){toast((r.data&&r.data.error)||t('common.error'));return}
        ST.me=null;closeModal();applyStaticTexts();toast(t('logout.ok'));
      });
      return;
    }
    if(act==='accountMessages'){openMessagesInbox();return}
    if(act==='accountNotif'){openNotifications();return}
    if(act==='notifReadAll'){
      api('POST','/api/me/notifications/read-all',{}).then(function(){openNotifications();refreshNotifBadge(0)});
      return;
    }
    if(act==='msgReply'){
      openMsgCompose(el.getAttribute('data-to'),el.getAttribute('data-subj')||'');
      return;
    }
    if(act==='msgSend'){
      var bodyEl=document.getElementById('msg-body');
      var err=document.getElementById('msg-err');
      var body=bodyEl?bodyEl.value.trim():'';
      if(!body){if(err)err.textContent=t('common.required');return}
      api('POST','/api/messages',{to_id:Number(el.getAttribute('data-to')),subject:el.getAttribute('data-subj')||'',body:body}).then(function(r){
        if(!r.ok){if(err)err.textContent=(r.data&&r.data.error)||t('common.error');return}
        toast(t('common.success'));openMessagesInbox();
      });
      return;
    }
    if(act==='verifyEmail'){
      api('POST','/api/me/verify-email',{}).then(function(r){
        toast(r.ok?t('common.success'):((r.data&&r.data.error)||t('common.error')));
      });
      return;
    }
    if(act==='doChangePw')return doChangePassword();
    if(act==='doDelete')return doDeleteAccount();
    if(act==='sendMessage')return sendMessage(pid);
    if(act==='doAsk')return doAsk();
    if(act==='openContact')return openContact();
    if(act==='doContact')return doContact();
  });
}

function bindFilters(){
  var q=document.getElementById('q');
  var sq=document.getElementById('sq');
  var onQ=debounce(function(e){
    var src=e&&e.target;
    var v=(src&&'value' in src)?src.value:((q&&q.value)||(sq&&sq.value)||'');
    ST.F.q=v;
    if(q&&q!==src)q.value=v;
    if(sq&&sq!==src)sq.value=v;
    loadProfiles({reset:true});
  },300);
  if(q)q.addEventListener('input',onQ);
  if(sq)sq.addEventListener('input',onQ);
  var sp=document.getElementById('sp');
  var fp=document.getElementById('fp');
  var sd=document.getElementById('sd');
  var fd=document.getElementById('fd');
  function syncProv(v){
    ST.F.prov=v;ST.F.dist='';
    if(sp)sp.value=v;
    if(fp)fp.value=v;
    fillDistSelect('sd',v);
    fillDistSelect('fd',v);
    if(fd)fd.style.display=v?'':'none';
    loadProfiles({reset:true});
  }
  if(sp)sp.addEventListener('change',function(){syncProv(sp.value)});
  if(fp)fp.addEventListener('change',function(){syncProv(fp.value)});
  if(sd)sd.addEventListener('change',function(){ST.F.dist=sd.value;if(fd)fd.value=sd.value;loadProfiles({reset:true})});
  if(fd)fd.addEventListener('change',function(){ST.F.dist=fd.value;if(sd)sd.value=fd.value;loadProfiles({reset:true})});
  var ss=document.getElementById('ss');
  if(ss)ss.addEventListener('change',function(){ST.F.sort=ss.value;loadProfiles({reset:true})});
  var sc=document.getElementById('sclear');
  if(sc)sc.addEventListener('click',function(){
    ST.F={q:'',prov:'',dist:'',sort:'rel'};
    if(q)q.value='';if(sq)sq.value='';
    if(sp)sp.value='';if(fp)fp.value='';
    if(ss)ss.value='rel';
    fillDistSelect('sd','');fillDistSelect('fd','');
    loadProfiles({reset:true});
  });
  var more=document.getElementById('more');
  if(more)more.addEventListener('click',function(){loadProfiles({})});
}

function bindKeyboard(){
  document.addEventListener('keydown',function(e){
    var ov=document.getElementById('ov');
    if(!ov||!ov.classList.contains('on'))return;
    if(e.key==='Escape'){closeModal();e.preventDefault();return}
    if(e.key!=='Tab')return;
    var nodes=ov.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if(!nodes.length)return;
    var first=nodes[0],last=nodes[nodes.length-1];
    if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault()}
    else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault()}
  });
}

var HERO={ads:[],idx:0,timer:null,mouse:false,touchAt:0,kbd:false,sig:'',gen:0};
function heroText(a,k){
  var v=(LANG==='en'&&a[k+'_en'])?a[k+'_en']:a[k];
  return v||'';
}
function renderHero(){
  var track=$('heroTrack'),dots=$('heroDots');
  if(!track||!HERO.ads.length)return;
  var ads=HERO.ads;
  if(HERO.idx>=ads.length)HERO.idx=0;
  track.innerHTML=ads.map(function(a,i){
    var title=heroText(a,'title'),text=heroText(a,'text');
    if(!title){title=text;text=''}
    var act=a.action&&a.action!=='none'?a.action:'';
    var cta=act?(heroText(a,'cta')||t('hero.cta.'+act)):'';
    var isVid=a.media_type==='video'&&a.video_url;
    var isImg=!isVid&&a.media_type==='image'&&a.image_url;
    var vurl=a.video_url||'';
    var yt=null;
    if(isVid){
      var ym=String(vurl).match(new RegExp('(?:youtube\\.com/(?:watch\\?(?:.*&)?v=|embed/|shorts/)|youtu\\.be/)([A-Za-z0-9_-]{6,})'));
      if(ym)yt=ym[1];
      if(!yt){var ym2=String(vurl).match(new RegExp('[?&]v=([A-Za-z0-9_-]{6,})'));if(ym2)yt=ym2[1];}
    }
    var vid='';
    if(isVid&&yt){
      vid='<iframe class="hero-vid hero-iframe" src="https://www.youtube.com/embed/'+esc(yt)+'?autoplay='+(i===HERO.idx?1:0)+'&mute=1&controls=0&loop=1&playlist='+esc(yt)+'&playsinline=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>';
    }else if(isVid){
      vid='<video class="hero-vid" src="'+esc(vurl)+'" muted autoplay playsinline webkit-playsinline loop preload="'+(i===HERO.idx?'auto':'metadata')+'"></video>';
    }else if(isImg){
      vid='<img class="hero-vid hero-img" src="'+esc(a.image_url)+'" alt="" decoding="async"'+(i===HERO.idx?'':' loading="lazy"')+'>';
    }
    return '<div class="hero-slide'+((isVid||isImg)?' has-vid':'')+'" data-th="'+esc(a.theme||'izuba')+'" role="group" aria-roledescription="slide" aria-label="'+(i+1)+'/'+ads.length+'"'+(i===HERO.idx?'':' aria-hidden="true"')+'>'+
      vid+
      '<div class="hero-copy">'+
      '<span class="hero-b">'+esc(t('hero.k.'+(a.kind||'info')))+'</span>'+
      (title?'<h2 class="hero-t">'+esc(title)+'</h2>':'')+
      (text?'<p class="hero-p">'+esc(text)+'</p>':'')+
      (act?'<button class="hero-cta" type="button" data-hero-act="'+esc(act)+'" data-hero-val="'+esc(a.value||'')+'">'+esc(cta)+'</button>':'')+
      '</div></div>';
  }).join('');
  $$('#heroTrack img.hero-img').forEach(function(im){
    im.onerror=function(){try{im.style.opacity='0.3'}catch(e){}};
  });
  $$('#heroTrack video.hero-vid').forEach(heroBindVideo);
  heroSyncVideo();
  track.style.transform='translateX(-'+(HERO.idx*100)+'%)';
  if(dots)dots.innerHTML=ads.length>1?ads.map(function(a,i){
    return '<button type="button" class="hero-dot'+(i===HERO.idx?' on':'')+'" data-hero-go="'+i+'" aria-label="'+(i+1)+'"></button>';
  }).join(''):'';
}
function heroBindVideo(v){
  if(!v||v.getAttribute('data-b'))return;
  v.setAttribute('data-b','1');
  var slide=v.parentNode;
  if(!slide)return;
  var box=document.createElement('div');
  box.className='hero-vfb';
  box.hidden=true;
  var msg=document.createElement('span');
  var btn=document.createElement('button');
  btn.type='button';
  btn.className='hero-vbtn';
  var lnk=document.createElement('a');
  lnk.className='hero-vlnk';
  lnk.target='_blank';
  lnk.rel='noopener';
  box.appendChild(msg);
  box.appendChild(btn);
  box.appendChild(lnk);
  slide.appendChild(box);
  function show(kind){
    var en=(typeof LANG!=='undefined'&&LANG==='en');
    box.hidden=false;
    if(kind==='play'){
      msg.textContent='';
      btn.hidden=false;
      btn.textContent=en?'Play video':'Kina video';
      lnk.hidden=true;
    }else{
      msg.textContent=en?'This video cannot be played on this device.':'Video ntishobora gukina kuri iyi telefoni.';
      btn.hidden=true;
      lnk.hidden=false;
      lnk.textContent=en?'Open video':'Fungura video';
      lnk.href=v.currentSrc||v.getAttribute('src')||'#';
    }
  }
  v._fb=show;
  v.addEventListener('playing',function(){box.hidden=true});
  v.addEventListener('error',function(){show('err')});
  v.addEventListener('loadeddata',function(){if(v.videoWidth===0)show('err')});
  btn.addEventListener('click',function(){
    box.hidden=true;
    try{
      v.muted=true;
      var p=v.play();
      if(p&&p.catch)p.catch(function(){show('play')});
    }catch(e){}
  });
}
function heroSyncVideo(){
  var n=HERO.ads.length;
  $$('#heroTrack .hero-slide').forEach(function(slide,k){
    var active=k===HERO.idx;
    var v=slide.querySelector('video.hero-vid');
    var f=slide.querySelector('iframe.hero-iframe');
    var im=slide.querySelector('img.hero-img');
    if(im&&n>0&&(active||k===(HERO.idx+1)%n)){
      try{im.loading='eager'}catch(e){}
    }
    if(v){
      try{
        v.onerror=function(){try{v.style.opacity='0.3'}catch(e){}};
        if(active){
          v.muted=true;
          v.setAttribute('autoplay','');
          try{v.currentTime=0}catch(e){}
          var p=v.play();
          if(p&&p.catch)p.catch(function(err){
            try{if(err&&err.name==='NotAllowedError'&&v._fb)v._fb('play')}catch(e2){}
          });
          v.onloadeddata=function(){try{if(k===HERO.idx)v.play()}catch(e){}};
        }else{
          v.pause();
          try{v.currentTime=0}catch(e){}
        }
      }catch(e){}
    }
    if(f){
      try{
        var src=f.getAttribute('src')||'';
        if(active){
          if(src.indexOf('autoplay=0')>=0)f.setAttribute('src',src.replace('autoplay=0','autoplay=1'));
        }else{
          if(src.indexOf('autoplay=1')>=0)f.setAttribute('src',src.replace('autoplay=1','autoplay=0'));
        }
      }catch(e){}
    }
  });
}
function heroGo(i){
  var n=HERO.ads.length;
  if(n<1)return;
  if(n===1){HERO.idx=0;heroSyncVideo();return}
  HERO.idx=((i%n)+n)%n;
  var track=$('heroTrack');
  if(track)track.style.transform='translateX(-'+(HERO.idx*100)+'%)';
  $$('#heroDots .hero-dot').forEach(function(d,k){d.classList.toggle('on',k===HERO.idx)});
  $$('#heroTrack .hero-slide').forEach(function(s,k){
    if(k===HERO.idx)s.removeAttribute('aria-hidden');else s.setAttribute('aria-hidden','true');
  });
  heroSyncVideo();
  heroStart();
}
function heroStop(){
  HERO.gen=(HERO.gen||0)+1;
  if(HERO.timer){clearTimeout(HERO.timer);HERO.timer=null}
}
function heroHeld(){
  if(HERO.mouse)return true;
  if(HERO.touchAt&&(Date.now()-HERO.touchAt)<8000)return true;
  if(HERO.kbd)return true;
  return false;
}
function heroStart(){
  heroStop();
  if(HERO.ads.length<2)return;
  var slow=false;
  try{slow=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){}
  function tick(){
    if(document.hidden)return;
    if(heroHeld())return;
    heroGo(HERO.idx+1);
  }
  function schedule(){
    heroStop();
    var a=HERO.ads[HERO.idx]||{};
    var ms=6000;
    if(a.media_type==='video'&&a.video_url)ms=12000;
    else if(a.media_type==='image'&&a.image_url)ms=7000;
    if(slow)ms=Math.round(ms*1.5);
    HERO.timer=setTimeout(function(){
      HERO.timer=null;
      tick();
      if(!HERO.timer)schedule();
    },ms);
  }
  schedule();
}
function heroAct(a,v){
  if(a==='search'){
    var q=document.getElementById('q');
    if(q){q.value=v;ST.F.q=v;loadProfiles({reset:true})}
  }else if(a==='focus'){
    var qi=document.getElementById('q');
    if(qi)qi.focus();
  }else if(a==='register'){
    if(ST.me)openFull(ST.me.pid);else openRegister();
  }else if(a==='help'){
    openHelp();
  }else if(a==='about'){
    openAbout();
  }else if(a==='phone'&&v){
    window.location.href='tel:'+v;
  }else if(a==='link'&&/^https?:/i.test(v)){
    window.open(v,'_blank','noopener');
  }
}
function heroLoad(first){
  function loadLegacy(){
    return api('GET','/api/strip',undefined,{retry:false}).then(function(r){
      if(!(r&&r.ok&&r.data&&Array.isArray(r.data.ads)&&r.data.ads.length))return;
      var ads=r.data.ads.slice(0,30);
      var sig=JSON.stringify(ads);
      if(!first&&sig===HERO.sig)return;
      HERO.sig=sig;
      HERO.ads=ads;
      if(first||HERO.idx>=ads.length)HERO.idx=0;
      renderHero();
      heroStart();
    });
  }
  function stopStudio(){
    if(window.AhabonaStudioRenderer){
      try{window.AhabonaStudioRenderer.stop($('hero'))}catch(e){}
    }
  }
  function useStudio(playlist){
    return new Promise(function(resolve){
      function mount(){
        try{
          var host=$('hero');
          if(!host||!window.AhabonaStudioRenderer)return resolve(false);
          heroStop();
          HERO.ads=[];
          HERO.sig='';
          var player=window.AhabonaStudioRenderer.mount(host,playlist);
          resolve(!!player);
        }catch(e){resolve(false)}
      }
      if(window.AhabonaStudioRenderer)return mount();
      var script=document.createElement('script');
      script.src='/studio-renderer.js';
      script.async=true;
      script.onload=mount;
      script.onerror=function(){resolve(false)};
      document.head.appendChild(script);
    }).then(function(ok){
      if(ok)return true;
      stopStudio();
      return loadLegacy().then(function(){return false});
    });
  }
  return api('GET','/api/studio/playlist',undefined,{retry:false}).then(function(r){
    var playlist=r&&r.ok&&r.data;
    if(playlist&&playlist.enabled&&Array.isArray(playlist.scenes)&&playlist.scenes.length){
      return useStudio(playlist);
    }
    stopStudio();
    return loadLegacy();
  }).catch(function(){
    stopStudio();
    return loadLegacy();
  });
}
function setupStrip(){
  var host=$('hero');
  if(host){
    host.addEventListener('click',function(e){
      var b=e.target.closest?e.target.closest('[data-hero-act]'):null;
      if(b){heroAct(b.getAttribute('data-hero-act'),b.getAttribute('data-hero-val')||'');return}
      var d=e.target.closest?e.target.closest('[data-hero-go]'):null;
      if(d){heroGo(+d.getAttribute('data-hero-go'))}
    });
    /* pause only for a real mouse hover: touch taps also fire emulated mouse events and used to freeze rotation */
    host.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')HERO.mouse=true});
    host.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')HERO.mouse=false});
    /* pause for keyboard focus only (not for focus caused by a click or tap) */
    host.addEventListener('focusin',function(e){
      try{if(e.target&&e.target.matches&&e.target.matches(':focus-visible'))HERO.kbd=true}catch(err){}
    });
    host.addEventListener('focusout',function(){HERO.kbd=false});
    var sx=0,sy=0,tracking=false;
    host.addEventListener('touchstart',function(e){
      var p=e.touches&&e.touches[0];
      if(!p)return;
      sx=p.clientX;sy=p.clientY;tracking=true;HERO.touchAt=Date.now();
    },{passive:true});
    host.addEventListener('touchend',function(e){
      HERO.touchAt=0;
      if(!tracking)return;
      tracking=false;
      var p=e.changedTouches&&e.changedTouches[0];
      if(!p)return;
      var dx=p.clientX-sx,dy=p.clientY-sy;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5){heroGo(HERO.idx+(dx<0?1:-1))}
    },{passive:true});
    host.addEventListener('touchcancel',function(){HERO.touchAt=0;tracking=false},{passive:true});
  }
  heroLoad(true);
  setInterval(function(){if(!document.hidden)heroLoad(false)},300000);
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){
      $$('#heroTrack video.hero-vid').forEach(function(v){try{v.pause()}catch(e){}});
    }else{
      heroSyncVideo();
      heroStart();
      heroLoad(false);
    }
  });
}

function setupOffline(){
  var el=document.getElementById('strip');
  var tm=null;
  function say(msg,sticky){
    if(!el)return;
    el.textContent=msg;
    el.classList.add('on');
    clearTimeout(tm);
    if(!sticky)tm=setTimeout(function(){el.classList.remove('on')},2500);
  }
  window.addEventListener('offline',function(){say(t('common.offline'),true)});
  window.addEventListener('online',function(){say(t('common.online'),false)});
  if(navigator.onLine===false)say(t('common.offline'),true);
}

function setupSW(){
  if(!('serviceWorker' in navigator))return;
  var f=(ST.cfg&&ST.cfg.features&&ST.cfg.features.pwa&&ST.cfg.features.pwa.on);
  if(!f)return;
  try{navigator.serviceWorker.register('/sw.js').catch(function(){})}catch(e){}
}

function hideSplash(){
  var sp=document.getElementById('splash');
  if(!sp)return;
  try{sessionStorage.setItem('ahabona_splash','1')}catch(e){}
  try{sp.style.cssText='display:none!important;opacity:0;pointer-events:none;visibility:hidden;z-index:-1';}catch(e){}
  try{sp.remove()}catch(e){try{if(sp.parentNode)sp.parentNode.removeChild(sp)}catch(e2){}}
}
function boot(){
  var sp=document.getElementById('splash');
  var skipSplash=false;
  try{skipSplash=sessionStorage.getItem('ahabona_splash')==='1'}catch(e){}
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)skipSplash=true;
  if(skipSplash&&sp){sp.classList.add('gone');if(sp.parentNode)sp.parentNode.removeChild(sp);sp=null}
  var splashStart=Date.now();
  var SPLASH_MS=1100;
  /* Safety: always dismiss splash even if config fails */
  if(sp)setTimeout(hideSplash,SPLASH_MS);
  if(sp)setTimeout(hideSplash,SPLASH_MS+800);
  loadConfig().then(function(){
    fillProvSelects();
    fillDistSelect('sd','');
    fillDistSelect('fd','');
    renderSortOptions();
    renderChips();
    applySaver();
    applyStaticTexts();
    var yr=document.getElementById('yr');
    if(yr)yr.textContent=String(new Date().getFullYear());
    var sunm=document.getElementById('sunm');
    if(sunm)sunm.innerHTML='<svg class="sun" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g stroke="#d4a838" stroke-width="1.6" stroke-linecap="round"><line x1="12" y1="6" x2="12" y2="2"/><line x1="15.2" y1="6.9" x2="17.4" y2="3.6"/><line x1="17.5" y1="9.5" x2="21.1" y2="7.8"/><line x1="17.9" y1="12.9" x2="21.9" y2="13.4"/><line x1="16.5" y1="15.9" x2="19.6" y2="18.5"/><line x1="13.7" y1="17.8" x2="14.8" y2="21.6"/><line x1="10.3" y1="17.8" x2="9.2" y2="21.6"/><line x1="7.5" y1="15.9" x2="4.4" y2="18.5"/><line x1="6.1" y1="12.9" x2="2.1" y2="13.4"/><line x1="6.5" y1="9.5" x2="2.9" y2="7.8"/><line x1="8.8" y1="6.9" x2="6.6" y2="3.6"/></g><circle cx="12" cy="12" r="4.6" fill="#d4a838"/></svg>';
    var grid=document.getElementById('grid');
    if(grid)grid.innerHTML=Array(8).fill('<div class="card"><div class="skel" style="aspect-ratio:5/4"></div><div class="skel" style="height:14px;margin-top:6px;width:75%"></div><div class="skel" style="height:12px;margin-top:4px;width:50%"></div></div>').join('');
    return api('GET','/api/me',undefined,{retry:false}).then(function(r){
      if(r.ok&&r.data&&r.data.user&&r.data.user.status==='active'&&r.data.profile){
        ST.me=normProfile(r.data.profile);
        if(r.data.user){
          ST.me.role=r.data.user.role;
          ST.me.role_level=r.data.user.role_level;
          ST.me.email=r.data.user.email||ST.me.email;
          ST.me.email_verified=r.data.user.email_verified;
          ST.me.phone_verified=r.data.user.phone_verified;
          if(r.data.user.lang&&(r.data.user.lang==='rw'||r.data.user.lang==='en')){
            try{if(localStorage.getItem('ahabona_lang')!==r.data.user.lang){/* prefer server */}LANG=r.data.user.lang;localStorage.setItem('ahabona_lang',LANG);document.documentElement.lang=LANG}catch(e){}
          }
        }
      }
      applyStaticTexts();
      try{if(ST.me)refreshNotifBadge()}catch(e){}
      try{var bn=document.getElementById('bn');if(bn)bn.style.display=ST.me?'':'none'}catch(e){}
      return routeFromPath().then(function(handled){
        if(!handled)return loadProfiles({reset:true});
      });
    }).catch(function(){
      applyStaticTexts();
      return routeFromPath().then(function(handled){
        if(!handled)return loadProfiles({reset:true});
      });
    });
  });
  bindNav();
  bindClicks();
  bindFilters();
  bindKeyboard();
  setupHistoryBack();
  setupStrip();
  setupOffline();
  setupSW();
  var left=Math.max(0,SPLASH_MS-(Date.now()-splashStart));
  if(document.getElementById('splash'))setTimeout(hideSplash, left);
  else hideSplash();
}

function routeFromPath(){
  var path=location.pathname||'/';
  /* Strip single trailing slash (but keep "/") */
  if(path.length>1&&path.endsWith('/'))path=path.slice(0,-1);
  var m;
  if((m=path.match(/^\\/reset\\/([A-Za-z0-9_-]+)$/))){
    openReset(m[1]);
    return Promise.resolve(true);
  }
  if((m=path.match(/^\\/u\\/([a-z0-9-]+)$/))){
    openFull(m[1]);
    return Promise.resolve(true);
  }
  if(path==='/saved'){
    openSaved();
    return Promise.resolve(true);
  }
  if(path==='/about'){
    openAbout();
    return Promise.resolve(true);
  }
  if(path==='/help'){
    openHelp();
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

boot();
})();
`;

EMBED['admin.html'] = `<!doctype html>
<html lang="rw">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AHABONA — Ubuyobozi</title>
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<style>
:root{--p:#1a9b6c;--pd:#158055;--pt:#fff;--pl:rgba(26,155,108,.10);--g:#d4a838;--gl:rgba(212,168,56,.14);--gd:#8a6100;--bg:#faf7ef;--s:#fff;--t:#1e2a32;--m:#5a6470;--b:#e8e4da;--e:#c3392c;--sh:0 1px 2px rgba(30,42,50,.06);--sh2:0 4px 14px rgba(30,42,50,.10)}
*{box-sizing:border-box}
body{margin:0;font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:var(--bg);color:var(--t)}
a{color:var(--p);text-decoration:none}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer}
.top{position:sticky;top:0;z-index:5;background:var(--s);border-bottom:1px solid var(--b);padding:10px 16px;display:flex;align-items:center;gap:10px}
.top .brand{font-weight:800;font-size:18px;letter-spacing:.5px}
.top .brand .sun{width:24px;height:24px;vertical-align:middle;margin-right:6px}
.top .spacer{flex:1}
.top .user{color:var(--m);font-size:13px}
.top button.b{background:var(--pl);border:0;border-radius:8px;padding:8px 12px;font-weight:600;color:var(--t)}
.top button.b:hover{background:rgba(26,155,108,.18)}
.layout{display:grid;grid-template-columns:220px 1fr;min-height:calc(100vh - 53px)}
@media(max-width:800px){.layout{grid-template-columns:1fr}}
.side{background:var(--s);border-right:1px solid var(--b);padding:12px}
@media(max-width:800px){.side{border-right:0;border-bottom:1px solid var(--b);display:flex;overflow-x:auto;gap:4px;padding:8px}}
.side button{display:flex;width:100%;align-items:center;gap:8px;background:none;border:0;padding:10px 12px;text-align:left;border-radius:8px;color:var(--t);font-weight:500;min-height:40px}
.side button.on{background:var(--pl);color:var(--p);font-weight:700}
.side button:hover{background:var(--pl)}
@media(max-width:800px){.side button{flex:none;width:auto;white-space:nowrap}}
.content{padding:20px}
@media(max-width:800px){.content{padding:14px}}
h1{margin:0 0 4px;font-size:22px}
h2{margin:20px 0 10px;font-size:16px}
h3{margin:16px 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:.4px;color:var(--m)}
.sub{color:var(--m);margin:0 0 16px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:20px}
.stat{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:14px;box-shadow:var(--sh)}
.stat .num{font-size:26px;font-weight:800;color:var(--p)}
.stat .lbl{font-size:12px;color:var(--m);text-transform:uppercase;letter-spacing:.4px;margin-top:2px}
.stat.gold .num{color:var(--g)}
.panel{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:var(--sh)}
table{width:100%;border-collapse:collapse;font-size:13px}
table th{text-align:left;padding:8px 6px;border-bottom:2px solid var(--b);font-weight:700;color:var(--m);font-size:12px;text-transform:uppercase;letter-spacing:.3px}
table td{padding:8px 6px;border-bottom:1px solid var(--b);vertical-align:top}
table tr:hover td{background:rgba(26,155,108,.04)}
.btn{background:var(--p);color:var(--pt);border:0;border-radius:8px;padding:8px 12px;font-weight:600;cursor:pointer;min-height:36px}
.btn:hover{background:var(--pd)}
.btn.ol{background:transparent;color:var(--t);border:1px solid var(--b)}
.btn.ol:hover{background:var(--pl)}
.btn.danger{background:var(--e);color:#fff}
.btn.gold{background:var(--g);color:#3a2a00}
.btn.sm{padding:4px 8px;font-size:12px;min-height:28px}
input,select,textarea{width:100%;border:1px solid var(--b);border-radius:8px;padding:8px 10px;background:var(--s);min-height:36px;font-size:14px}
input[type=checkbox],input[type=radio]{width:auto;min-height:auto}
.f label{display:block;font-weight:600;margin:10px 0 4px;font-size:13px}
.f textarea{min-height:80px}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.act{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.note{font-size:12px;color:var(--m);margin-top:6px}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;background:var(--pl);color:var(--p);font-size:11px;font-weight:700}
.badge.gold{background:var(--gl);color:var(--gd)}
.badge.red{background:rgba(195,57,44,.12);color:var(--e)}
.badge.gray{background:rgba(90,100,112,.12);color:var(--m)}
.login{max-width:400px;margin:80px auto;background:var(--s);border:1px solid var(--b);border-radius:12px;padding:24px;box-shadow:var(--sh2)}
.login h1{font-size:22px;margin:0 0 6px;text-align:center}
.login .sub{text-align:center;margin:0 0 20px}
.login .sun{width:56px;height:56px;display:block;margin:0 auto 12px}
.er{color:var(--e);font-size:13px;margin-top:8px;min-height:1em;text-align:center}
.toast{position:fixed;left:16px;right:16px;bottom:16px;max-width:400px;margin:auto;background:var(--t);color:var(--bg);padding:12px 14px;border-radius:10px;display:none;box-shadow:var(--sh2);border-left:3px solid var(--g);z-index:999}
.flag{padding:10px 0;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:10px}
.flag:last-child{border-bottom:0}
.flag .nm{flex:1;font-weight:600}
.flag .needs{color:var(--m);font-size:12px}
.sw{position:relative;display:inline-block;width:44px;height:24px;flex:none}
.sw input{opacity:0;width:0;height:0}
.sw .sl{position:absolute;cursor:pointer;inset:0;background:var(--b);border-radius:24px;transition:.2s}
.sw .sl:before{content:"";position:absolute;height:18px;width:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.sw input:checked+.sl{background:var(--p)}
.sw input:checked+.sl:before{transform:translateX(20px)}
@media(max-width:640px){table{font-size:12px}table th,table td{padding:6px 4px}}
</style>
</head>
<body>
<div class="top">
<div class="brand"><span id="sunTop"></span>AHABONA</div>
<div class="spacer"></div>
<span class="user" id="whoAmI"></span>
<button class="b" id="btnLogout">Sohoka</button>
</div>
<div id="app"></div>
<div class="toast" id="toast"></div>
<script src="/admin.js" defer></script>
</body>
</html>`;

EMBED['admin.js'] = `
'use strict';
(function(){
var LANG='rw';
var TAX_GLOBAL={};
function t(k){return k}
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
`;
/* ===== END OF IGICE 15/16 ===== */EMBED['admin.js'] += `

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

boot();
})();
/* end admin.js */
`;

EMBED['legal.css'] = `body{margin:0;font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:#faf7ef;color:#1e2a32}
main{max-width:720px;margin:auto;padding:20px 16px 60px}
a{color:#1a9b6c}
h1{font-size:26px;margin:.4em 0}
h2{font-size:18px;margin:1.4em 0 .2em}
.draft{background:rgba(212,168,56,.14);color:#8a6100;border-radius:10px;padding:10px 12px;font-size:14px}
.brand{font-weight:800;color:#1a9b6c;text-decoration:none;display:inline-block;margin-bottom:6px}
p,li{margin:.3em 0}`;

EMBED['terms.html'] = `<!doctype html><html lang="rw"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amabwiriza yo gukoresha AHABONA</title>
<link rel="stylesheet" href="/legal.css">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
</head><body><main>
<a class="brand" href="/">AHABONA</a>
<h1>Amabwiriza yo gukoresha AHABONA</h1>
<p class="draft">INYANDIKO Y’AGATEGANYO: Aya mabwiriza agomba gusuzumwa no kwemezwa n’umunyamategeko ubifitiye ubumenyi mu mategeko y’u Rwanda mbere yo gutangaza urubuga ku mugaragaro. Ntabwo ari inama y’amategeko.</p>
<h2>1. Ibyerekeye aya mabwiriza</h2><p>Aya mabwiriza asobanura uko wemerewe gukoresha urubuga AHABONA. Iyo ufunguye konti cyangwa ukoresheje urubuga, uba wemeye kuyubahiriza.</p>
<h2>2. AHABONA ni iki?</h2><p>AHABONA ni urubuga rufasha abantu kugaragaza ubumenyi, ubushobozi na serivisi bashobora gutanga, kugira ngo ababikeneye bababone kandi babavugishe. Mbere yo gutangira kwakira abantu ku mugaragaro, hagomba kugaragazwa izina ry’uwufite inshingano z’amategeko ku rubuga n’amakuru ye yo kumuvugisha.</p>
<h2>3. Abemerewe gukoresha urubuga</h2><p>Ugomba kuba ufite nibura imyaka 18 kandi ufite ububasha bwo kwemera aya mabwiriza. Ugomba gutanga amakuru y’ukuri no kurinda ijambobanga ryawe. Ntugomba gufungura konti nyinshi z’umuntu umwe ugamije kuyobya abandi.</p>
<h2>4. Inshingano za AHABONA</h2><p>AHABONA ituma abantu n’ubushobozi bwabo baboneka gusa. Ntabwo ari umukoresha w’abakozi, ikigo gishakira abantu akazi, urubuga rutangaza imyanya y’akazi, umuhuza mu masezerano, urubuga rwo kwishyuriraho cyangwa urubuga rubika amafaranga y’abakoresha.</p>
<h2>5. Amakuru utanga</h2><p>Ugomba gutanga amakuru y’ukuri kandi akwiye kuvugururwa. AHABONA ntigenzura byikora niba amakuru, impamyabumenyi cyangwa ubuhanga uvuga ufite ari ukuri. Ifishi isanzwe yo kwiyandikisha ntigusaba nimero y’indangamuntu kandi iyi verisiyo ntitanga serivisi yo kuyigenzura. Amakuru nk’ayo ashobora kuba yarasigaye mu bubiko bwa verisiyo ishize agomba gusuzumwa no gufatwa uko amategeko abiteganya mbere yo gutangira ku mugaragaro.</p>
<h2>6. Ubumenyi na serivisi</h2><p>AHABONA ntiyemeza ko umuntu afite ubumenyi, impamyabumenyi, uruhushya, ubunyangamugayo, ubushobozi bwo gukora cyangwa ko ahari igihe cyose.</p>
<h2>7. Imikoranire hagati y’abakoresha</h2><p>Hamagara, ubutumwa, guhura, kwishyurana n’amasezerano hagati y’abakoresha bikorwa ku nshingano zabo. AHABONA ntiyinjira muri ayo masezerano kandi ntikemura mu buryo bwikora amakimbirane, kwishyurana cyangwa ibibazo by’umurimo.</p>
<h2>8. Imyitwarire isabwa</h2><p>Ntugomba kwiyitirira undi muntu, gutanga amakuru ayobya, gutoteza abandi, gushyira ibinyoma ku rubuga, kugerageza kwinjira aho utabyemerewe cyangwa gukoresha urubuga mu bikorwa binyuranyije n’amategeko.</p>
<h2>9. Ibitemewe</h2><p>Ntibyemewe gushyiraho uburiganya, iterabwoba, ihohoterwa, amagambo y’urwango, gukoresha abana mu bikorwa bibangiriza, kwamamaza ibikorwa binyuranyije n’amategeko cyangwa ibindi bikubiyemo ibyaha. AHABONA ishobora gukuraho ibirimo ibyo bikorwa, guhagarika konti cyangwa kuyifunga, hakurikijwe uburemere bw’ikibazo n’amategeko abigenga.</p>
<h2>10. Nimero za telefoni n’izindi nzira zo kuvugana</h2><p>Nimero ya telefoni igaragara ku bandi gusa iyo ubyemeye mu buryo bugaragara. Amakuru y’indi nzira yo kukuvugisha ushyize ku mwirondoro ashobora kugaragara ku bandi. Iyo ukoresheje WhatsApp cyangwa izindi serivisi zo hanze, amategeko n’amabwiriza yazo na byo arakureba.</p>
<h2>11. Amafoto n’ibindi ushyiraho</h2><p>Ni wowe ufite inshingano ku mafoto, ibisobanuro n’andi makuru ushyira ku mwirondoro wawe. Ugomba kuba ufite uburenganzira bwo kuyakoresha kandi ntibibangamire uburenganzira bw’abandi.</p>
<h2>12. Kugaragaza imyirondoro</h2><p>AHABONA igamije guha abantu amahirwe yo kuboneka mu buryo buringaniye kandi ikagaragaza ibyafasha abashaka serivisi. Urutonde rw’imyirondoro ntiruvuga ko umuntu umwe aruta abandi. Kugaragara ku rubuga ntibihamya ko uzabonwa, uhamagarwa cyangwa uhabwa akazi.</p>
<h2>13. Umutekano</h2><p>Jya wigenzurira umwirondoro, ubushobozi, impamyabumenyi n’uruhushya rw’uwo ushaka gukorana na we. Irinde kohereza amafaranga mbere yo gusobanukirwa neza n’uwo mukorana n’amasezerano. Mu gihe bishoboka, muhure ahantu hari abandi bantu.</p>
<h2>14. Amakuru bwite</h2><p>Amakuru bwite akoreshwa nk’uko bisobanurwa mu Mabwiriza y’Ibanga. Aya mabwiriza y’Ibanga na yo aracyari umushinga ugomba gusuzumwa no kwemezwa mbere yo gutangira ibikorwa ku mugaragaro.</p>
<h2>15. Umutekano wa konti</h2><p>Rinda ijambobanga ryawe kandi nturisangize abandi. Menyesha uwufite inshingano ku rubuga igihe ukeka ko hari uwinjiye muri konti yawe utabimwemereye.</p>
<h2>16. Guhagarika cyangwa gufunga konti</h2><p>AHABONA ishobora guhagarika cyangwa gufunga konti iyo habayeho kurenga aya mabwiriza, gukoresha urubuga nabi cyangwa gushyira abandi mu kaga. Uburyo bwo kubifataho icyemezo buzashingira ku kibazo cyagaragaye n’amategeko abigenga; nta rutonde rw’ibihano ruhoraho rwemejwe muri iyi verisiyo.</p>
<h2>17. Gusiba konti</h2><p>Iyo usabye gusiba konti, umwirondoro uhishwa. Konti ishobora gusubizwa mu gihe cy’amezi 6. Iyo icyo gihe kirangiye, konti n’amakuru ayifitanye isano bisibwa burundu hakurikijwe imikorere ya sisitemu n’ibisabwa n’amategeko.</p>
<h2>18. Nta cyemezo cy’umusaruro</h2><p>AHABONA ntiyemeza ko uzahabwa abakiriya, akazi, amafaranga, amasezerano cyangwa ikindi gisubizo kubera kuba ku rubuga.</p>
<h2>19. Uruhare rw’abakoresha</h2><p>Ni wowe ugomba gufata icyemezo niba wemera gukorana n’uwo wabonye kuri AHABONA. Mu rugero rwemewe n’amategeko, AHABONA ntigomba gufatwa nk’aho ari yo yakoze cyangwa yemeje amasezerano hagati y’abakoresha.</p>
<h2>20. Inshingano n’amategeko</h2><p>Amabwiriza yerekeye inshingano za AHABONA agomba gusuzumwa n’umunyamategeko mbere yo kwemezwa burundu. Nta gice cy’aya mabwiriza kigamije gukuraho uburenganzira cyangwa inshingano amategeko y’u Rwanda adatanga uburenganzira bwo gukuraho.</p>
<h2>21. Uburenganzira ku bihangano</h2><p>Izina, ikirango n’ibindi bikoresho byakozwe by’umwihariko ku rubuga AHABONA ni iby’ufite uburenganzira kuri byo. Ibyo abakoresha bashyiraho bikomeza kugengwa n’uburenganzira bwabyo.</p>
<h2>22. Guhindura amabwiriza</h2><p>Aya mabwiriza ashobora kuvugururwa. Impinduka zikomeye zigomba kumenyeshwa abakoresha kandi zigashyirwa ahagaragara hamwe n’itariki yatangiriyeho gukurikizwa.</p>
<h2>23. Amategeko agenga urubuga</h2><p>Ibibazo by’amategeko bijyanye no gukoresha urubuga bizasuzumwa hakurikijwe amategeko y’u Rwanda, hatabangamiwe uburenganzira buteganywa n’amategeko.</p>
<h2>24. Uko watuvugisha</h2><p>Izina ry’uwufite inshingano z’amategeko, aderesi na telefoni cyangwa email yo kumuvugisha bigomba gushyirwa hano mbere yo gutangira ibikorwa ku mugaragaro. Kugeza icyo gihe, iyi nyandiko iracyari umushinga.</p>
<h2>25. Kwemera aya mabwiriza</h2><p>Kwiyandikisha bisobanuye ko wemeje ko wasomye aya mabwiriza kandi wemeye kuyubahiriza.</p>
<p><a href="/">Subira ku rubuga</a></p>
</main></body></html>`;

EMBED['privacy.html'] = `<!doctype html><html lang="rw"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amabwiriza y’Ibanga | AHABONA</title>
<link rel="stylesheet" href="/legal.css">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
</head><body><main>
<a class="brand" href="/">AHABONA</a>
<h1>Amabwiriza y’Ibanga</h1>
<p class="draft">INYANDIKO Y’AGATEGANYO: Iyi ni inyandiko y’ibanze igomba gusuzumwa no kwemezwa n’umunyamategeko ubifitiye ubumenyi mu mategeko y’u Rwanda. Izina ry’uwufite inshingano z’amategeko n’amakuru ye yo kumuvugisha bigomba kuzuzwa mbere yo gutangira kwakira abantu ku mugaragaro.</p>
<h2>1. Uwushinzwe amakuru yawe</h2><p>Mbere yo gutangira ku mugaragaro, AHABONA igomba kugaragaza izina ry’umuntu cyangwa urwego rushinzwe gukoresha no kurinda amakuru, hamwe n’amakuru yizewe yo kumuvugisha. Kugeza icyo gihe, iyi nyandiko ntiraba iya nyuma.</p>
<h2>2. Amakuru dushobora gukusanya</h2><p>Konti: email, nimero ya telefoni n’ijambobanga ribikwa nk’agaciro karinzwe (hash), aho kubikwa uko waranditse. Umwirondoro: izina, akarere, aho utanga serivisi, ubushobozi wahisemo, amafoto wahisemo gushyiraho, ibisobanuro, amashuri, indimi, igihe ushobora gukora n’amakuru yo kukuvugisha wahisemo kongeraho. Itariki y’amavuko n’igitsina ni amahitamo. Ifishi isanzwe yo kwiyandikisha ntigusaba nimero y’indangamuntu, kandi AHABONA ntitanga serivisi yo kugenzura indangamuntu muri iyi verisiyo. Sisitemu ishobora kandi kubika ikimenyetso cy’igikoresho, imyirondoro yerekanwe cyangwa yafunguwe, ibimenyetso by’inyungu, ibirego watanze n’amagambo yo gushakisha.</p>
<h2>3. Impamvu dukoresha ayo makuru</h2><p>Dukoresha amakuru kugira ngo dufungure konti, tugaragaze umwirondoro wawe ku bantu bashaka ubushobozi ufite, tunoze uko ibisubizo bigaragara, turinde urubuga, dusuzume ibirego kandi twubahirize amategeko abigenga.</p>
<h2>4. Amakuru abandi bashobora kubona</h2><p>Abandi bashobora kubona izina ryawe, akarere, ubushobozi, amafoto n’ibindi bisobanuro washyize ku mugaragaro. Nimero ya telefoni igaragara gusa iyo wabyemeye. Email, ijambobanga n’amakuru y’ibanga ya konti ntibigaragazwa ku bandi bakoresha.</p>
<h2>5. Ikimenyetso cy’igikoresho n’uko imyirondoro igaragara</h2><p>AHABONA ishobora gukoresha ikimenyetso cy’igikoresho kitagaragaza izina ryawe kugira ngo imenye imyirondoro yamaze kukwereka, iyafunguwe n’ibimenyetso by’inyungu. Ibi bifasha kuringaniza amahirwe no gutuma ibisubizo bijyana n’ibyo ushaka. Aya makuru agomba gukoreshwa mu rwego rwo gutanga serivisi no kurinda urubuga, atari ukugurisha amakuru yawe.</p>
<h2>6. Gusangiza abandi amakuru</h2><p>AHABONA ntiyagurisha amakuru bwite. Abatanga serivisi zo kubika urubuga cyangwa kohereza email bashobora gutunganya amakuru akenewe kugira ngo serivisi ikore, iyo ibyo bikoreshejwe. Amakuru ashobora gutangwa igihe amategeko abiteganya cyangwa urwego rubifitiye ububasha rubisabye mu buryo bwemewe n’amategeko.</p>
<h2>7. Igihe amakuru abikwa no gusiba konti</h2><p>Iyo usabye gusiba konti, umwirondoro uhishwa kandi konti ishobora gusubizwa mu gihe cy’amezi 6. Iyo icyo gihe kirangiye, amakuru ya konti n’amafoto ayifitanye isano bisibwa hakurikijwe imikorere ya sisitemu. Amwe mu makuru ajyanye n’ibirego cyangwa umutekano ashobora kubikwa igihe gito gikenewe kugira ngo ikibazo gikurikiranwe cyangwa amategeko yubahirizwe.</p>
<h2>8. Uko turinda amakuru</h2><p>Ijambobanga ririndwa hakoreshejwe scrypt n’agaciro kihariye (salt). Cookies za session zashyizweho ibiranga umutekano ku buryo buboneka mu igenamiterere ry’urubuga. Sisitemu igenzura amakuru yoherezwa kandi igashyiraho imipaka ku bikorwa bimwe. Nta sisitemu ishobora kwemezwa ko idashobora na rimwe kugira ikibazo cy’umutekano.</p>
<h2>9. Uburenganzira bwawe</h2><p>Ushobora guhindura amakuru yawe yo ku mwirondoro no gusaba gusiba konti ukoresheje ibiri muri urubuga. Ushobora kandi gusaba amakuru yerekeye amakuru yawe cyangwa uko akoreshwa. Uburyo bwo kutwandikira bugomba kugaragazwa hano mbere yo gutangira ibikorwa ku mugaragaro.</p>
<h2>10. Abana</h2><p>AHABONA igenewe abantu bafite imyaka 18 cyangwa irenga.</p>
<h2>11. Impinduka</h2><p>Amabwiriza y’Ibanga ashobora guhinduka uko urubuga rugenda rutera imbere. Impinduka zikomeye zigomba kumenyeshwa abakoresha kandi inyandiko ikagaragaza igihe zatangiriyeho gukurikizwa.</p>
<p><a href="/">Subira ku rubuga</a></p>
</main></body></html>`;

/* ===== END OF IGICE 17/19 ===== */

function handleRequest(ctx,req,res){
  securityHeaders(res,ctx.secure);
  var url;
  try{url=new URL(req.url,'http://localhost')}
  catch(e){return sendError(req,res,400,'err.server')}
  var p;
  try{p=decodeURIComponent(url.pathname)}
  catch(e){return sendError(req,res,400,'err.server')}
  var ip=ctx.ipOf(req)||'unknown';
  if(!ctx.rate.allow('g:'+ip,600,60000))return sendError(req,res,429,'err.rate');
  if(p==='/admin/studio'||p==='/admin/studio/'||p.startsWith('/admin/studio/')){
    if(!ctx.studio)return sendError(req,res,404,'err.notfound');
    const admin=ctx.sessionUser(req);
    if(!admin)return sendError(req,res,401,'err.auth');
    if(!ctx.isAdmin(admin)||!ctx.can(admin,'content.edit'))return sendError(req,res,403,'err.forbidden');
    const files={
      '/admin/studio':'editor.html',
      '/admin/studio/':'editor.html',
      '/admin/studio/editor.css':'editor.css',
      '/admin/studio/renderer.css':'renderer.css',
      '/admin/studio/renderer.js':'renderer.js',
      '/admin/studio/editor.js':'editor.js'
    };
    const file=files[p];
    if(!file)return sendError(req,res,404,'err.notfound');
    try{
      const body=fs.readFileSync(path.join(__dirname,'server-v2-modules','studio',file));
      const types={'editor.html':'text/html; charset=utf-8','editor.css':'text/css; charset=utf-8','renderer.css':'text/css; charset=utf-8','renderer.js':'text/javascript; charset=utf-8','editor.js':'text/javascript; charset=utf-8'};
      return sendText(req,res,200,body,types[file],{noCache:true});
    }catch(e){
      console.error('[studio-ui] asset unavailable:',file,e&&e.message||String(e));
      return sendError(req,res,404,'err.notfound');
    }
  }
  if(p==='/icon.svg'){
    var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="34" fill="#1a9b6c"/><g stroke="#d4a838" stroke-width="6" stroke-linecap="round"><line x1="96" y1="42" x2="96" y2="20"/><line x1="120" y1="48" x2="135" y2="30"/><line x1="138" y1="72" x2="158" y2="62"/><line x1="142" y1="96" x2="164" y2="96"/><line x1="138" y1="120" x2="158" y2="130"/><line x1="120" y1="144" x2="135" y2="162"/><line x1="72" y1="144" x2="57" y2="162"/><line x1="54" y1="120" x2="34" y2="130"/><line x1="50" y1="96" x2="28" y2="96"/><line x1="54" y1="72" x2="34" y2="62"/><line x1="72" y1="48" x2="57" y2="30"/></g><circle cx="96" cy="96" r="40" fill="#d4a838"/><text x="96" y="164" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="22" font-weight="800">AHABONA</text></svg>';
    var buf=Buffer.from(svg,'utf8');
    res.writeHead(200,{'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=86400','Content-Length':buf.length});
    return res.end(buf);
  }
  if(p==='/sw.js'){
    var sw=EMBED['sw.js']||'';
    var swb=Buffer.from(sw,'utf8');
    res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-cache','Service-Worker-Allowed':'/','Content-Length':swb.length});
    return res.end(swb);
  }
  if(p==='/manifest.webmanifest'){
    var manifest={
      name:'AHABONA',
      short_name:'AHABONA',
      description:'Menya abantu. Menya amahirwe.',
      start_url:'/',
      scope:'/',
      display:'standalone',
      orientation:'portrait',
      theme_color:'#1a9b6c',
      background_color:'#faf7ef',
      lang:'rw',
      icons:[
        {src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},
        {src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'maskable'}
      ]
    };
    var mb=Buffer.from(JSON.stringify(manifest),'utf8');
    res.writeHead(200,{'Content-Type':'application/manifest+json; charset=utf-8','Cache-Control':'public, max-age=3600','Content-Length':mb.length});
    return res.end(mb);
  }
  if(p==='/studio-renderer.js'||p==='/studio-renderer.css'){
    if(!ctx.studio)return sendError(req,res,404,'err.notfound');
    const file=p.endsWith('.js')?'renderer.js':'renderer.css';
    const type=file.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8';
    try{return sendText(req,res,200,fs.readFileSync(path.join(__dirname,'server-v2-modules','studio',file)),type,{noCache:true})}
    catch(e){return sendError(req,res,404,'err.notfound')}
  }
  var studioMediaMatch=p.match(/^\/studio-media\/(\d+)$/);
  if(studioMediaMatch){
    if(!ctx.studio||!ctx.studioMedia)return sendError(req,res,404,'err.notfound');
    const id=Number(studioMediaMatch[1]);
    const asset=ctx.Q("SELECT id,asset_kind,storage_key,mime_type,status FROM studio_assets WHERE id=?").get(id);
    if(!asset||asset.status!=='ready'||!ctx.studioMedia.validKey(asset.storage_key))return sendError(req,res,404,'err.notfound');
    const mt=asset.mime_type;
    if(!['image/jpeg','image/png','image/webp','video/mp4'].includes(mt))return sendError(req,res,404,'err.notfound');
    const admin=ctx.sessionUser(req);
    const authorizedAdmin=!!(admin&&ctx.isAdmin(admin)&&ctx.can(admin,'content.edit'));
    const now=Date.now();
    const live=ctx.Q("SELECT 1 FROM studio_scenes WHERE status='published' AND (start_at IS NULL OR start_at<=?) AND (end_at IS NULL OR end_at>?) AND (asset_id=? OR poster_asset_id=?) LIMIT 1").get(now,now,id,id);
    if(!live&&!authorizedAdmin)return sendError(req,res,404,'err.notfound');
    const fp=path.join(ctx.studioMedia.root,asset.storage_key);
    if(path.dirname(fp)!==ctx.studioMedia.root)return sendError(req,res,404,'err.notfound');
    const mediaCache=live?'public, max-age=31536000, immutable':'private, no-store';
    return sendMediaFile(req,res,fp,mt,mediaCache);
  }
  if(p.startsWith('/photos/')){
    var f=p.slice(8);
    if(!/^[a-z0-9]+-(?:[0-5]|t)\.jpg$/.test(f))return sendError(req,res,404,'err.notfound');
    var b=ctx.store.read(f);
    if(!b)return sendError(req,res,404,'err.notfound');
    return sendBinary(req,res,200,b,'image/jpeg','public, max-age=86400, immutable');
  }
  if(p.startsWith('/media/')){
    var mf=p.slice(7);
    var mm=/^strip-(\d+)\.(mp4|webm|avi|jpg|png|webp)$/.exec(mf);
    if(!mm||!ctx.mediaStore)return sendError(req,res,404,'err.notfound');
    var mtype=mm[2]==='mp4'?'video/mp4':(mm[2]==='webm'?'video/webm':(mm[2]==='avi'?'video/x-msvideo':(mm[2]==='jpg'?'image/jpeg':(mm[2]==='png'?'image/png':'image/webp'))));
    var mcache=url.searchParams.has('v')?'public, max-age=604800':'public, max-age=3600';
    return sendMediaFile(req,res,ctx.mediaStore.pathOf(mf),mtype,mcache);
  }
  if(p.startsWith('/api/'))return handleApi(ctx,req,res,url,p);
  var key='';
  // Normalize: strip a single trailing slash (but keep "/" itself)
  if(p.length>1&&p.endsWith('/'))p=p.slice(0,-1);
  if(p==='/')key='index.html';
  else if(p==='/admin')key='admin.html';
  else if(p==='/terms')key='terms.html';
  else if(p==='/privacy')key='privacy.html';
  else if(p==='/help')key='index.html';
  else if(/^\/u\/[a-z0-9-]+$/.test(p))key='index.html';
  else if(/^\/reset\/[A-Za-z0-9_-]+$/.test(p))key='index.html';
  else if(p==='/saved')key='index.html';
  else if(p==='/about')key='index.html';
  else if(Object.prototype.hasOwnProperty.call(EMBED,p.slice(1)))key=p.slice(1);
  else{
    var name=p.slice(1);
    if(!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)||name.indexOf('..')!==-1)return sendError(req,res,404,'err.notfound');
    var fp=path.join(ctx.pubDir,name);
    try{
      var b2=fs.readFileSync(fp);
      var ext2=path.extname(name).toLowerCase();
      var mime2=({
        '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
        '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
        '.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg',
        '.jpeg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json; charset=utf-8',
        '.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'
      })[ext2]||'application/octet-stream';
      return sendBinary(req,res,200,b2,mime2,'public, max-age=3600');
    }catch(e){
      return sendError(req,res,404,'err.notfound');
    }
  }
  var body=EMBED[key];
  if(body===undefined)return sendError(req,res,404,'err.notfound');
  var ext=path.extname(key)||'.html';
  var type=({
    '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
    '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'
  })[ext]||'text/html; charset=utf-8';
  var cc=ext==='.html'?'public, max-age=60':(ext==='.js'?'no-cache':'public, max-age=3600');
  return sendText(req,res,200,body,type,{cache:cc});
}

function studioApiError(req,res,e){
  const code=String(e&&e.code||'');
  const messages={
    'studio.err.text_required':'Andika umutwe cyangwa ubutumwa mbere yo gutangaza.',
    'studio.err.asset_not_ready':'Media ntirarangiza gutunganywa.',
    'studio.err.asset_required':'Hitamo media mbere yo gutangaza.',
    'studio.err.asset_kind':'Ubwoko bwa media wahisemo ntibuhuye n’ikibaho.',
    'studio.err.asset_missing':'Iyo media ntibonetse.',
    'studio.err.duration':'Igihe kigomba kuba hagati y’amasegonda 1 na 90.',
    'studio.err.schedule':'Amatariki yo gutangira no kurangira si yo.',
    'studio.err.cta_url':'Link igomba gutangirana na https://.',
    'studio.err.style_value':'Imiterere y’inyandiko irimo agaciro katemewe.',
    'studio.err.asset_key':'Izina rya media ntiryemewe.',
    'studio.err.asset_size':'Ingano ya media irarenze umupaka.',
    'studio.err.asset_duration':'Video igomba kuba itarengeje amasegonda 90.',
    'studio.err.not_initialized':'Studio ntiyafunguwe kuri iyi seriveri.'
  };
  Object.assign(messages,{
    'studio.err.video_not_ready':'Video igomba kuba MP4/H.264 ifite poster kandi itarengeje amasegonda 90.',
    'studio.err.media_processing':'Video cyangwa ifoto ntishoboye gutunganywa.',
    'studio.err.transcoder_missing':'Seriveri ntirabona ffmpeg/ffprobe; media ntizatangazwa.',
    'studio.err.image_type':'Hitamo ifoto ya JPG, PNG cyangwa WebP.',
    'studio.err.video_type':'File ntiyemewe nka video.',
    'studio.err.media_invalid':'File ya media yangiritse cyangwa ntisomeka.',
    'studio.err.media_duration':'Igihe cya video nticyasomwe.',
    'studio.err.media_too_long':'Video irengeje amasegonda 90.',
    'studio.err.media_dimensions':'Ingano y’ifoto/video ntiyemewe.',
    'studio.err.asset_size':'File irenze ingano yemewe.',
    'studio.err.asset_mime':'Ubwoko bwa file ntibwemewe.'
  });
  const msg=messages[code]||((code.startsWith('studio.err.'))?'Hari amakuru atemewe. Ongera uyagenzure.':'Habaye ikibazo. Gerageza nanone.');
  const status=Number.isInteger(e&&e.status)&&e.status>=400&&e.status<=599?e.status:(code.startsWith('studio.err.')?400:500);
  console.error('[studio-api]',code||'unexpected',e&&e.message||String(e));
  sendJson(req,res,status,{error:msg,code:code||null,field:e&&e.field||null});
}
function studioOff(req,res){
  sendError(req,res,404,'err.notfound');
}
function apiStudioPlaylist(ctx,req,res){
  if(!ctx.studio)return sendJson(req,res,200,{enabled:false,scenes:[]},{cache:'no-store'});
  try{
    const result=ctx.studio.getPublicPlaylist(ctx.db,{now:Date.now()});
    const scenes=result.scenes.map(function(x){return {
      id:x.id,scene_kind:x.scene_kind,title_rw:x.title_rw,title_en:x.title_en,
      body_rw:x.body_rw,body_en:x.body_en,text_style:x.text_style,overlay_style:x.overlay_style,
      asset_id:x.asset_id,poster_asset_id:x.poster_asset_id,
      asset_url:x.asset_id?('/studio-media/'+x.asset_id):null,
      poster_url:x.poster_asset_id?('/studio-media/'+x.poster_asset_id):null,
      cta_label_rw:x.cta_label_rw,cta_label_en:x.cta_label_en,cta_action:x.cta_action,cta_value:x.cta_value,
      sort_order:x.sort_order,duration_ms:x.duration_ms,transition:x.transition,fit:x.fit,
      crop_x:x.crop_x,crop_y:x.crop_y,start_at:x.start_at,end_at:x.end_at
    }});
    sendJson(req,res,200,{enabled:result.enabled,settings:result.settings,scenes:scenes},{cache:'no-store'});
  }catch(e){studioApiError(req,res,e)}
}
function adminStudioScenes(ctx,req,res,admin){
  if(!ctx.studio)return studioOff(req,res);
  try{sendJson(req,res,200,{scenes:ctx.studio.listScenes(ctx.db)})}
  catch(e){studioApiError(req,res,e)}
}
async function adminStudioSceneAdd(ctx,req,res,admin){
  if(!ctx.studio)return studioOff(req,res);
  const b=await readBody(req,65536);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  try{
    const scene=ctx.studio.createScene(ctx.db,b.data||{},{actorId:admin.id,now:Date.now()});
    ctx.adminLog(admin.id,'studio.scene.create','studio_scene',String(scene.id),scene.title_rw||scene.title_en||scene.scene_kind,ctx.ipOf(req));
    sendJson(req,res,201,{ok:true,scene:scene});
  }catch(e){studioApiError(req,res,e)}
}
async function adminStudioSceneUpdate(ctx,req,res,id,admin){
  if(!ctx.studio)return studioOff(req,res);
  const b=await readBody(req,65536);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  try{
    const scene=ctx.studio.updateScene(ctx.db,id,b.data||{},{actorId:admin.id,now:Date.now()});
    if(!scene)return sendError(req,res,404,'err.notfound');
    ctx.adminLog(admin.id,'studio.scene.update','studio_scene',String(id),scene.title_rw||scene.title_en||scene.scene_kind,ctx.ipOf(req));
    sendJson(req,res,200,{ok:true,scene:scene});
  }catch(e){studioApiError(req,res,e)}
}
function adminStudioSceneDelete(ctx,req,res,id,admin){
  if(!ctx.studio)return studioOff(req,res);
  try{
    if(!ctx.studio.deleteScene(ctx.db,id))return sendError(req,res,404,'err.notfound');
    ctx.adminLog(admin.id,'studio.scene.delete','studio_scene',String(id),null,ctx.ipOf(req));
    sendJson(req,res,200,{ok:true});
  }catch(e){studioApiError(req,res,e)}
}
function studioAssetSummary(a){
  if(!a)return null;
  return {id:a.id,asset_kind:a.asset_kind,mime_type:a.mime_type,bytes:a.bytes,width:a.width,height:a.height,duration_ms:a.duration_ms,codec:a.codec,status:a.status,created_at:a.created_at,updated_at:a.updated_at};
}
async function adminStudioUpload(ctx,req,res,admin,kind){
  if(!ctx.studio||!ctx.studioMedia)return studioOff(req,res);
  const release=ctx.studioMedia.tryAcquire();
  if(!release){req.resume();return sendError(req,res,429,'err.rate');}
  const max=kind==='image'?ctx.studioMedia.maxImageBytes:ctx.studioMedia.maxVideoBytes;
  try{
    const ct=String(req.headers['content-type']||'application/octet-stream').split(';')[0].trim().toLowerCase();
    if(kind==='image'&&!['image/jpeg','image/png','image/webp','application/octet-stream'].includes(ct)){
      req.resume();return sendError(req,res,415,'studio.err.image_type');
    }
    const rb=await readRawBody(req,max);
    if(rb.over)return sendError(req,res,413,'err.big');
    if(rb.fail)return sendError(req,res,400,'err.server');
    if(!rb.buf||!rb.buf.length)return sendError(req,res,400,'common.required');
    const pending=kind==='image'
      ?ctx.studioMedia.uploadImage(ctx.db,rb.buf,admin.id,Date.now())
      :ctx.studioMedia.uploadVideo(ctx.db,rb.buf,ct,admin.id,Date.now());
    rb.buf=null;
    const result=await pending;
    ctx.adminLog(admin.id,'studio.asset.upload','studio_asset',String(result.asset.id),JSON.stringify({kind:kind,bytes:result.asset.bytes}),ctx.ipOf(req));
    sendJson(req,res,201,{ok:true,asset:studioAssetSummary(result.asset),poster:studioAssetSummary(result.poster)});
  }catch(e){studioApiError(req,res,e)}
  finally{release();}
}
function adminStudioAssets(ctx,req,res,admin){
  if(!ctx.studio)return studioOff(req,res);
  try{
    const assets=ctx.Q('SELECT id,asset_kind,mime_type,bytes,width,height,duration_ms,codec,status,created_at,updated_at FROM studio_assets ORDER BY id DESC').all();
    sendJson(req,res,200,{assets:assets});
  }catch(e){studioApiError(req,res,e)}
}
function adminStudioSettings(ctx,req,res,admin){
  if(!ctx.studio)return studioOff(req,res);
  try{sendJson(req,res,200,{settings:ctx.studio.readSettings(ctx.db)})}
  catch(e){studioApiError(req,res,e)}
}
async function adminStudioSettingsUpdate(ctx,req,res,admin){
  if(!ctx.studio)return studioOff(req,res);
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  try{
    const settings=ctx.studio.updateSettings(ctx.db,b.data||{},{now:Date.now()});
    ctx.adminLog(admin.id,'studio.settings.update','studio_settings','1',JSON.stringify(settings),ctx.ipOf(req));
    sendJson(req,res,200,{ok:true,settings:settings});
  }catch(e){studioApiError(req,res,e)}
}

async function handleApi(ctx,req,res,url,p){
  var m=req.method;
  if(p==='/api/health')return apiHealth(req,res);
  if(p==='/api/config'&&(m==='GET'||m==='HEAD'))return apiConfig(ctx,req,res);
  if(p==='/api/strip'&&(m==='GET'||m==='HEAD'))return apiStrip(ctx,req,res);
  if(p==='/api/studio/playlist'&&(m==='GET'||m==='HEAD'))return apiStudioPlaylist(ctx,req,res);
  if(p==='/api/profiles'&&(m==='GET'||m==='HEAD'))return apiProfiles(ctx,req,res,url);
  var mt;
  if((mt=p.match(/^\/api\/profile\/([a-z0-9-]+)$/))&&(m==='GET'||m==='HEAD'))return apiProfile(ctx,req,res,mt[1]);
  if(p==='/api/events'&&m==='POST')return apiEvents(ctx,req,res);
  if(p==='/api/help/ask'&&m==='POST')return apiHelpAsk(ctx,req,res);
  if(p==='/api/help/contact'&&m==='POST')return apiHelpContact(ctx,req,res);
  if(p==='/api/report'&&m==='POST')return apiReport(ctx,req,res);
  if(p==='/api/register'&&m==='POST')return apiRegister(ctx,req,res);
  if(p==='/api/login'&&m==='POST')return apiLogin(ctx,req,res);
  if(p==='/api/logout'&&m==='POST')return apiLogout(ctx,req,res);
  if(p==='/api/me/logout-all'&&m==='POST')return apiLogoutAll(ctx,req,res);
  if(p==='/api/me/notifications'&&m==='GET')return apiNotificationsList(ctx,req,res);
  if(p==='/api/me/notifications/read-all'&&m==='POST')return apiNotificationsReadAll(ctx,req,res);
  if(p==='/api/me/lang'&&m==='PUT')return apiMeLang(ctx,req,res);
  if(p==='/api/me/verify-email'&&m==='POST')return apiVerifyEmailRequest(ctx,req,res);
  if(p==='/api/me/verify-phone'&&m==='POST')return apiVerifyPhoneRequest(ctx,req,res);
  if(p==='/api/me/verify-phone/confirm'&&m==='POST')return apiVerifyPhoneConfirm(ctx,req,res);
  var vt;
  if((vt=p.match(/^\/api\/verify-email\/([A-Za-z0-9_-]+)$/))&&(m==='GET'||m==='HEAD'))return apiVerifyEmailToken(ctx,req,res,vt[1]);
  if(p==='/api/me'&&m==='GET')return apiMeGet(ctx,req,res);
  if(p==='/api/me'&&m==='PUT')return apiMePut(ctx,req,res);
  if(p==='/api/me/password'&&m==='POST')return apiMePassword(ctx,req,res);
  if(p==='/api/me/delete'&&m==='POST')return apiMeDelete(ctx,req,res);
  if(p==='/api/me/restore'&&m==='POST')return apiMeRestore(ctx,req,res);
  if(p==='/api/password/forgot'&&m==='POST')return apiPasswordForgot(ctx,req,res);
  if(p==='/api/password/reset'&&m==='POST')return apiPasswordReset(ctx,req,res);
  if(p==='/api/saved'&&m==='GET')return apiSavedList(ctx,req,res);
  if((mt=p.match(/^\/api\/saved\/([a-z0-9]+)$/))&&(m==='PUT'||m==='DELETE'))return apiSavedToggle(ctx,req,res,mt[1],m);
  if(p==='/api/messages'&&m==='POST')return apiUserMessage(ctx,req,res);
  if(p==='/api/messages'&&m==='GET')return apiMessagesList(ctx,req,res);
  var u=ctx.sessionUser(req);
  if(p.indexOf('/api/admin/')===0){
    if(!u)return sendError(req,res,401,'err.auth');
    if(!ctx.isAdmin(u))return sendError(req,res,403,'err.forbidden');
    var ar=adminRoute(ctx,req,res,p,m,u);
    if(ar!==NOROUTE)return ar;
  }
  return sendError(req,res,404,'err.notfound');
}

const NOROUTE={};
const ADMIN_ROUTES=[
  ['GET','/api/admin/studio/scenes','content.edit',function(ctx,req,res,mt,u){return adminStudioScenes(ctx,req,res,u)}],
  ['POST','/api/admin/studio/scenes','content.edit',function(ctx,req,res,mt,u){return adminStudioSceneAdd(ctx,req,res,u)}],
  ['GET','/api/admin/studio/assets','content.edit',function(ctx,req,res,mt,u){return adminStudioAssets(ctx,req,res,u)}],
  ['POST','/api/admin/studio/assets/image','content.edit',function(ctx,req,res,mt,u){return adminStudioUpload(ctx,req,res,u,'image')}],
  ['POST','/api/admin/studio/assets/video','content.edit',function(ctx,req,res,mt,u){return adminStudioUpload(ctx,req,res,u,'video')}],
  ['GET','/api/admin/studio/settings','content.edit',function(ctx,req,res,mt,u){return adminStudioSettings(ctx,req,res,u)}],
  ['PUT','/api/admin/studio/settings','content.edit',function(ctx,req,res,mt,u){return adminStudioSettingsUpdate(ctx,req,res,u)}],
  ['PUT',/^\/api\/admin\/studio\/scenes\/(\d+)$/,'content.edit',function(ctx,req,res,mt,u){return adminStudioSceneUpdate(ctx,req,res,+mt[1],u)}],
  ['DELETE',/^\/api\/admin\/studio\/scenes\/(\d+)$/,'content.edit',function(ctx,req,res,mt,u){return adminStudioSceneDelete(ctx,req,res,+mt[1],u)}],
  ['GET','/api/admin/summary','dash.view',function(ctx,req,res,mt,u){return adminSummary(ctx,req,res)}],
  ['GET','/api/admin/users','users.view',function(ctx,req,res,mt,u){return adminUsers(ctx,req,res,u)}],
  ['POST','/api/admin/broadcast','broadcast.send',function(ctx,req,res,mt,u){return adminBroadcast(ctx,req,res,u)}],
  ['GET','/api/admin/reports','reports.handle',function(ctx,req,res,mt,u){return adminReports(ctx,req,res)}],
  ['GET','/api/admin/requests','requests.handle',function(ctx,req,res,mt,u){return adminRequests(ctx,req,res)}],
  ['GET','/api/admin/audit','audit.view',function(ctx,req,res,mt,u){return adminAudit(ctx,req,res)}],
  ['GET','/api/admin/logs','audit.view',function(ctx,req,res,mt,u){return adminLogs(ctx,req,res)}],
  ['GET','/api/admin/messages','content.edit',function(ctx,req,res,mt,u){return adminMessages(ctx,req,res)}],
  ['GET','/api/admin/settings','settings.edit',function(ctx,req,res,mt,u){return adminSettings(ctx,req,res)}],
  ['POST','/api/admin/settings','settings.edit',function(ctx,req,res,mt,u){return adminSettingsUpdate(ctx,req,res,u)}],
  ['POST','/api/admin/features','settings.edit',function(ctx,req,res,mt,u){return adminFeatureToggle(ctx,req,res,u)}],
  ['GET','/api/admin/strip','content.edit',function(ctx,req,res,mt,u){return adminStripList(ctx,req,res)}],
  ['POST','/api/admin/strip','content.edit',function(ctx,req,res,mt,u){return adminStripAdd(ctx,req,res,u)}],
  ['GET','/api/admin/caps','catalog.edit',function(ctx,req,res,mt,u){return adminCapsList(ctx,req,res)}],
  ['POST','/api/admin/caps','catalog.edit',function(ctx,req,res,mt,u){return adminCapsAdd(ctx,req,res,u)}],
  ['GET','/api/admin/cats','catalog.edit',function(ctx,req,res,mt,u){return adminCategoriesList(ctx,req,res)}],
  ['POST','/api/admin/cats','catalog.edit',function(ctx,req,res,mt,u){return adminCategoriesAdd(ctx,req,res,u)}],
  ['GET','/api/admin/faq','content.edit',function(ctx,req,res,mt,u){return adminFaqList(ctx,req,res)}],
  ['POST','/api/admin/faq','content.edit',function(ctx,req,res,mt,u){return adminFaqAdd(ctx,req,res,u)}],
  ['GET','/api/admin/stats','dash.view',function(ctx,req,res,mt,u){return adminStats(ctx,req,res)}],
  ['GET',/^\/api\/admin\/users\/(\d+)$/,'users.view',function(ctx,req,res,mt,u){return adminUserGet(ctx,req,res,+mt[1],u)}],
  ['PUT',/^\/api\/admin\/users\/(\d+)$/,'users.edit',function(ctx,req,res,mt,u){return adminUserPut(ctx,req,res,+mt[1],u)}],
  ['DELETE',/^\/api\/admin\/users\/(\d+)$/,'users.delete',function(ctx,req,res,mt,u){return adminUserDelete(ctx,req,res,+mt[1],u)}],
  ['POST',/^\/api\/admin\/users\/(\d+)\/message$/,'users.message',function(ctx,req,res,mt,u){return adminUserMessage(ctx,req,res,+mt[1],u)}],
  ['POST',/^\/api\/admin\/users\/(\d+)\/reset-password$/,'users.edit',function(ctx,req,res,mt,u){return adminUserResetPw(ctx,req,res,+mt[1],u)}],
  ['POST',/^\/api\/admin\/reports\/(\d+)$/,'reports.handle',function(ctx,req,res,mt,u){return adminReportUpdate(ctx,req,res,+mt[1],u)}],
  ['POST',/^\/api\/admin\/requests\/(\d+)$/,'requests.handle',function(ctx,req,res,mt,u){return adminRequestDecide(ctx,req,res,+mt[1],u)}],
  ['POST',/^\/api\/admin\/profiles\/([a-z0-9]+)$/,'profiles.moderate',function(ctx,req,res,mt,u){return adminProfileSuspend(ctx,req,res,mt[1],u)}],
  ['PUT',/^\/api\/admin\/messages\/(\d+)$/,'content.edit',function(ctx,req,res,mt,u){return adminMessageUpdate(ctx,req,res,+mt[1],u)}],
  ['PUT',/^\/api\/admin\/strip\/(\d+)$/,'content.edit',function(ctx,req,res,mt,u){return adminStripUpdate(ctx,req,res,+mt[1],u)}],
  ['DELETE',/^\/api\/admin\/strip\/(\d+)$/,'content.edit',function(ctx,req,res,mt,u){return adminStripDelete(ctx,req,res,+mt[1],u)}],
  ['POST',/^\/api\/admin\/strip\/(\d+)\/video$/,'content.edit',function(ctx,req,res,mt,u){return adminStripVideoUpload(ctx,req,res,+mt[1],u)}],
  ['POST',/^\/api\/admin\/strip\/(\d+)\/image$/,'content.edit',function(ctx,req,res,mt,u){return adminStripImageUpload(ctx,req,res,+mt[1],u)}],
  ['PUT',/^\/api\/admin\/caps\/(\d+)$/,'catalog.edit',function(ctx,req,res,mt,u){return adminCapsUpdate(ctx,req,res,+mt[1],u)}],
  ['DELETE',/^\/api\/admin\/caps\/(\d+)$/,'catalog.edit',function(ctx,req,res,mt,u){return adminCapsDelete(ctx,req,res,+mt[1],u)}],
  ['PUT',/^\/api\/admin\/faq\/(\d+)$/,'content.edit',function(ctx,req,res,mt,u){return adminFaqUpdate(ctx,req,res,+mt[1],u)}],
  ['DELETE',/^\/api\/admin\/faq\/(\d+)$/,'content.edit',function(ctx,req,res,mt,u){return adminFaqDelete(ctx,req,res,+mt[1],u)}],
  ['GET','/api/admin/perms',null,function(ctx,req,res,mt,u){return adminPerms(ctx,req,res,u)}],
  ['GET','/api/admin/staff','staff.manage',function(ctx,req,res,mt,u){return adminStaffList(ctx,req,res,u)}],
  ['POST','/api/admin/staff','staff.manage',function(ctx,req,res,mt,u){return adminStaffCreate(ctx,req,res,u)}],
  ['PUT',/^\/api\/admin\/staff\/(\d+)$/,'staff.manage',function(ctx,req,res,mt,u){return adminStaffUpdate(ctx,req,res,+mt[1],u)}],
  ['DELETE',/^\/api\/admin\/staff\/(\d+)$/,'staff.manage',function(ctx,req,res,mt,u){return adminStaffDelete(ctx,req,res,+mt[1],u)}],
  ['POST',/^\/api\/admin\/staff\/(\d+)\/invite$/,'staff.manage',function(ctx,req,res,mt,u){return adminStaffInvite(ctx,req,res,+mt[1],u)}]
];
function adminRoute(ctx,req,res,p,m,u){
  for(let i=0;i<ADMIN_ROUTES.length;i++){
    const r=ADMIN_ROUTES[i];
    if(r[0]!==m)continue;
    let mt=null;
    if(typeof r[1]==='string'){if(p===r[1])mt=[p]}else mt=p.match(r[1]);
    if(!mt)continue;
    if(r[2]&&!ctx.can(u,r[2]))return sendError(req,res,403,'err.forbidden');
    return r[3](ctx,req,res,mt,u);
  }
  return NOROUTE;
}

function staffMayAssign(actor,role){
  if(staffLevel(actor)==='super')return true;
  return rankOfLevel(role)<rankOfLevel(staffLevel(actor));
}
function staffMayManage(actor,level){
  if(staffLevel(actor)==='super')return true;
  return rankOfLevel(level)<rankOfLevel(staffLevel(actor));
}
function cleanPermsInput(actor,role,d){
  if(role==='super')return null;
  const base=new Set(ROLE_PERMS[role]||[]);
  const mine=new Set(permsOf(actor));
  const add=[],remove=[];
  (Array.isArray(d.add)?d.add:[]).forEach(x=>{if(isPerm(x)&&!base.has(x)&&mine.has(x)&&!add.includes(x))add.push(x)});
  (Array.isArray(d.remove)?d.remove:[]).forEach(x=>{if(isPerm(x)&&base.has(x)&&!remove.includes(x))remove.push(x)});
  return(add.length||remove.length)?JSON.stringify({add:add,remove:remove}):null;
}
function parsePermsJson(t){
  try{const o=JSON.parse(t.perms||'{}')||{};return{add:Array.isArray(o.add)?o.add:[],remove:Array.isArray(o.remove)?o.remove:[]}}catch(e){return{add:[],remove:[]}}
}
function makeInviteLink(req,userId){
  const base=trustedBaseUrl();
  if(!base)return null;
  const tok=crypto.randomBytes(32).toString('base64url');
  Q('DELETE FROM resets WHERE user_id=?').run(userId);
  Q('INSERT INTO resets(th,user_id,expires) VALUES(?,?,?)').run(sha(tok),userId,Date.now()+3*24*HOUR);
  return base+'/reset/'+tok;
}
function staffRow(t){
  const lv=staffLevelRaw(t);
  return{id:t.id,name:t.display_name||t.name||t.email,email:t.email,phone:t.phone,level:lv,status:t.status,perms:parsePermsJson(t),effective:permsFor(t),has_profile:!!t.pid,created_at:t.created_at};
}
function adminPerms(ctx,req,res,actor){
  sendJson(req,res,200,{perms:permsCatalog(),roles:rolesCatalog(),mine:permsOf(actor),level:staffLevel(actor)});
}
function adminStaffList(ctx,req,res,actor){
  const rows=ctx.Q("SELECT u.id,u.email,u.phone,u.status,u.role,u.role_level,u.perms,u.display_name,u.created_at,p.pid,p.name FROM users u LEFT JOIN profiles p ON p.user_id=u.id WHERE u.role_level IN ('super','admin','mod','editor','viewer') OR u.role='admin' ORDER BY u.id").all();
  sendJson(req,res,200,{staff:rows.map(staffRow),perms:permsCatalog(),roles:rolesCatalog(),me:{id:actor.id,level:staffLevel(actor),mine:permsOf(actor)}});
}
async function adminStaffCreate(ctx,req,res,actor){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const d=b.data||{};
  const name=clean(d.name,80);
  const email=clean(d.email,254).toLowerCase();
  const phone=np(String(d.phone||''));
  const role=STAFF_LEVELS.includes(d.role)?d.role:null;
  if(name.length<2)return sendError(req,res,400,'reg.err.name','name');
  if(!EM.test(email))return sendError(req,res,400,'reg.err.email','email');
  if(!MP.test(phone))return sendError(req,res,400,'reg.err.phone','phone');
  if(!role)return sendError(req,res,400,'common.required','role');
  if(!staffMayAssign(actor,role))return sendError(req,res,403,'staff.err.rank');
  const perms=cleanPermsInput(actor,role,d);
  const us=ctx.Q('SELECT * FROM users WHERE email=?').get(email);
  let id=0,promoted=false;
  if(us){
    if(us.status!=='active')return sendError(req,res,409,'reg.err.email','email');
    if(staffLevelRaw(us))return sendError(req,res,409,'staff.err.exists');
    if(us.phone!==phone)return sendError(req,res,409,'reg.err.phone','phone');
    ctx.Q('UPDATE users SET role=?,role_level=?,perms=?,display_name=? WHERE id=?').run('admin',role,perms,name,us.id);
    id=us.id;promoted=true;
  }else{
    if(ctx.Q('SELECT 1 FROM users WHERE phone=?').get(phone))return sendError(req,res,409,'reg.err.phone','phone');
    const pw=await hashPw(crypto.randomBytes(24).toString('hex'));
    try{
      const r=ctx.Q('INSERT INTO users(email,phone,pw,role,role_level,perms,display_name,terms_at,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(email,phone,pw,'admin',role,perms,name,Date.now(),Date.now());
      id=Number(r.lastInsertRowid);
    }catch(e){return sendError(req,res,409,'reg.err.email','email')}
  }
  let invite=null;
  if(!promoted){
    invite=makeInviteLink(req,id);
    if(invite&&ctx.mailer.isLive){
      try{await ctx.mailer.send(email,'AHABONA: ubutumire bw\'ubuyobozi','Wahawe uburenganzira bwo gufasha kuyobora AHABONA. Kanda hano ushyireho ijambobanga ryawe (rimara iminsi 3): '+invite)}catch(e){}
    }
  }
  ctx.adminLog(actor.id,'staff.create','user',String(id),JSON.stringify({role:role,promoted:promoted}),ctx.ipOf(req));
  sendJson(req,res,201,{ok:true,id:id,promoted:promoted,invite:invite});
}
async function adminStaffUpdate(ctx,req,res,id,actor){
  const b=await readBody(req,8192);
  if(!b.ok)return sendError(req,res,b.code||400,b.error||'err.server');
  const d=b.data||{};
  const t=ctx.Q('SELECT * FROM users WHERE id=?').get(id);
  if(!t||!staffLevelRaw(t))return sendError(req,res,404,'err.notfound');
  const curLv=staffLevelRaw(t);
  const isSelf=t.id===actor.id;
  if(isSelf&&(d.role!==undefined||d.status!==undefined||d.add!==undefined||d.remove!==undefined))return sendError(req,res,403,'staff.err.self');
  if(!isSelf&&!staffMayManage(actor,curLv))return sendError(req,res,403,'staff.err.rank');
  let role=curLv;
  if(d.role!==undefined){
    if(!STAFF_LEVELS.includes(d.role))return sendError(req,res,400,'common.required','role');
    role=d.role;
    if(role!==curLv&&!staffMayAssign(actor,role))return sendError(req,res,403,'staff.err.rank');
  }
  let status=t.status;
  if(d.status!==undefined){
    if(!['active','suspended'].includes(d.status))return sendError(req,res,400,'common.required','status');
    status=d.status;
  }
  let perms=t.perms||null;
  if(d.add!==undefined||d.remove!==undefined){
    const cur=parsePermsJson(t);
    perms=cleanPermsInput(actor,role,{add:d.add!==undefined?d.add:cur.add,remove:d.remove!==undefined?d.remove:cur.remove});
  }else if(role!==curLv){
    perms=null;
  }
  if(curLv==='super'&&(role!=='super'||status!=='active')){
    const n=ctx.Q("SELECT COUNT(*) n FROM users WHERE role_level='super' AND status='active' AND id<>?").get(t.id).n;
    if(n<1)return sendError(req,res,400,'staff.err.lastsuper');
  }
  const name=d.name!==undefined?clean(d.name,80):t.display_name;
  ctx.Q('UPDATE users SET role=?,role_level=?,perms=?,status=?,display_name=? WHERE id=?').run('admin',role,perms,status,name||null,t.id);
  if(status!=='active')ctx.Q('DELETE FROM sessions WHERE user_id=?').run(t.id);
  ctx.adminLog(actor.id,'staff.update','user',String(t.id),JSON.stringify({role:role,status:status}),ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}
function adminStaffDelete(ctx,req,res,id,actor){
  const t=ctx.Q('SELECT * FROM users WHERE id=?').get(id);
  if(!t||!staffLevelRaw(t))return sendError(req,res,404,'err.notfound');
  if(t.id===actor.id)return sendError(req,res,403,'staff.err.self');
  const curLv=staffLevelRaw(t);
  if(!staffMayManage(actor,curLv))return sendError(req,res,403,'staff.err.rank');
  if(curLv==='super'){
    const n=ctx.Q("SELECT COUNT(*) n FROM users WHERE role_level='super' AND status='active' AND id<>?").get(t.id).n;
    if(n<1)return sendError(req,res,400,'staff.err.lastsuper');
  }
  const hasProfile=ctx.Q('SELECT 1 FROM profiles WHERE user_id=?').get(t.id);
  if(hasProfile){
    ctx.Q("UPDATE users SET role='user',role_level='user',perms=NULL,display_name=NULL WHERE id=?").run(t.id);
    ctx.Q('DELETE FROM sessions WHERE user_id=?').run(t.id);
  }else{
    try{deleteUserData(t.id)}catch(e){return sendError(req,res,500,'err.server')}
  }
  ctx.adminLog(actor.id,'staff.remove','user',String(t.id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true});
}

async function adminUserResetPw(ctx,req,res,id,admin){
  const t=ctx.Q('SELECT * FROM users WHERE id=?').get(id);
  if(!t)return sendError(req,res,404,'err.notfound');
  const tLv=staffLevelRaw(t);
  if(tLv&&t.id!==admin.id&&!(ctx.can(admin,'staff.manage')&&staffMayManage(admin,tLv)))return sendError(req,res,403,'staff.err.rank');
  // 1-hour password-reset token (not the 3-day staff invite)
  const base=trustedBaseUrl();
  if(!base)return sendError(req,res,503,'err.server');
  const tok=crypto.randomBytes(32).toString('base64url');
  ctx.Q('DELETE FROM resets WHERE user_id=?').run(t.id);
  ctx.Q('INSERT INTO resets(th,user_id,expires) VALUES(?,?,?)').run(sha(tok),t.id,Date.now()+48*HOUR);
  const link=base+'/reset/'+tok;
  if(ctx.mailer.isLive||ctx.mailer.isDev){
    try{await ctx.mailer.send(t.email,'AHABONA: reset password','Link (1 hour): '+link)}catch(e){}
  }
  ctx.adminLog(admin.id,'user.resetpw','user',String(id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true,link:link});
}
async function adminStaffInvite(ctx,req,res,id,actor){
  const t=ctx.Q('SELECT * FROM users WHERE id=?').get(id);
  if(!t||!staffLevelRaw(t))return sendError(req,res,404,'err.notfound');
  if(t.id!==actor.id&&!staffMayManage(actor,staffLevelRaw(t)))return sendError(req,res,403,'staff.err.rank');
  if(t.status!=='active')return sendError(req,res,409,'err.forbidden');
  const invite=makeInviteLink(req,t.id);
  if(!invite)return sendError(req,res,503,'err.server');
  if(ctx.mailer.isLive){
    try{await ctx.mailer.send(t.email,'AHABONA: shyiraho ijambobanga','Kanda hano ushyireho ijambobanga rishya (rimara iminsi 3): '+invite)}catch(e){}
  }
  ctx.adminLog(actor.id,'staff.invite','user',String(t.id),null,ctx.ipOf(req));
  sendJson(req,res,200,{ok:true,invite:invite});
}

/* ===== END OF IGICE 18/19 ===== */var Q, caps, capName, store, deviceOf;

EMBED['splash.js'] = `(function(){
  function kill(){
    var s=document.getElementById('splash');
    if(!s)return;
    try{sessionStorage.setItem('ahabona_splash','1')}catch(e){}
    s.className=(s.className||'')+' gone';
    try{s.style.cssText='display:none!important;opacity:0;pointer-events:none;visibility:hidden';}catch(e){}
    try{s.remove()}catch(e){try{if(s.parentNode)s.parentNode.removeChild(s)}catch(e2){}}
  }
  try{if(sessionStorage.getItem('ahabona_splash')==='1'){kill();return}}catch(e){}
  setTimeout(kill,1200);
  setTimeout(kill,2000);
  setTimeout(kill,3000);
})();
`;

EMBED['sw.js'] = `/* AHABONA Service Worker v2 */
const SHELL='ahabona-shell-v9';
const DATA='ahabona-data-v9';
const PHOTOS='ahabona-photos-v9';
const SHELL_URLS=['/','/manifest.webmanifest','/icon.svg','/splash.js'];
const DATA_LIMIT=60;
const PHOTO_LIMIT=120;

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(SHELL).then(function(c){return c.addAll(SHELL_URLS)}).then(function(){return self.skipWaiting()}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==SHELL&&k!==DATA&&k!==PHOTOS}).map(function(k){return caches.delete(k)}));
    }).then(function(){return self.clients.claim()})
  );
});

function trim(cacheName,max){
  return caches.open(cacheName).then(function(c){
    return c.keys().then(function(keys){
      if(keys.length<=max)return;
      var toDelete=keys.slice(0,keys.length-max);
      return Promise.all(toDelete.map(function(k){return c.delete(k)}));
    });
  });
}

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url;
  try{url=new URL(req.url)}catch(err){return}
  if(url.origin!==self.location.origin)return;
  var p=url.pathname;
  if(p.indexOf('/media/')===0||p.indexOf('/studio-media/')===0||p==='/studio-renderer.js'||p==='/studio-renderer.css'||p==='/admin/studio'||p.indexOf('/admin/studio/')===0)return;
  if(p.indexOf('/api/me')===0||p.indexOf('/api/admin')===0||p.indexOf('/api/saved')===0||p.indexOf('/api/events')===0||p.indexOf('/api/report')===0||p.indexOf('/api/help/contact')===0){
    e.respondWith(fetch(req).catch(function(){return new Response(JSON.stringify({error:'offline'}),{status:503,headers:{'Content-Type':'application/json'}})}));
    return;
  }
  if(p.indexOf('/api/')===0){
    /* API responses may depend on the active account; never persist them in a shared offline cache. */
    e.respondWith(fetch(req).catch(function(){
      return new Response(JSON.stringify({error:'offline'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
    }));
    return;
  }
  if(p.indexOf('/photos/')===0){
    e.respondWith(
      caches.match(req).then(function(cached){
        if(cached)return cached;
        return fetch(req).then(function(r){
          if(r&&r.ok){
            var copy=r.clone();
            caches.open(PHOTOS).then(function(c){c.put(req,copy);trim(PHOTOS,PHOTO_LIMIT)});
          }
          return r;
        }).catch(function(){return new Response('',{status:504})});
      })
    );
    return;
  }
  if(req.mode==='navigate'||p==='/'||/^\\/(u|reset|saved|about|help|terms|privacy|admin)\\b/.test(p)){
    e.respondWith(
      fetch(req).then(function(r){
        if(r&&r.ok){
          var copy=r.clone();
          caches.open(SHELL).then(function(c){c.put(req,copy)});
        }
        return r;
      }).catch(function(){
        return caches.match(req).then(function(cached){
          if(cached)return cached;
          return caches.match('/').then(function(root){
            return root||new Response('offline',{status:503});
          });
        });
      })
    );
    return;
  }
  if(p==='/app.js'||p==='/admin.js'||p==='/splash.js'){
    e.respondWith(
      fetch(req).then(function(r){
        if(r&&r.ok){
          var copy=r.clone();
          caches.open(SHELL).then(function(c){c.put(req,copy)});
        }
        return r;
      }).catch(function(){
        return caches.match(req).then(function(cached){
          return cached||new Response('',{status:504});
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function(cached){
      if(cached)return cached;
      return fetch(req).then(function(r){
        if(r&&r.ok&&(p.indexOf('/assets/')===0||/\\.(css|js|woff2|svg|png|jpg|jpeg|webmanifest)$/.test(p))){
          var copy=r.clone();
          caches.open(SHELL).then(function(c){c.put(req,copy)});
        }
        return r;
      }).catch(function(){return new Response('',{status:504})});
    })
  );
});
`;

function start(opts){
  opts=opts||{};
  // node:sqlite is built-in (Node 22.5+). On Node <24 it may need --experimental-sqlite.
  try{
    if(typeof DatabaseSync!=='function')throw new Error('DatabaseSync missing');
  }catch(e){
    console.error('[boot] node:sqlite unavailable. Use Node 22.5+ with NODE_OPTIONS=--experimental-sqlite (or Node 24+).');
    throw e;
  }
  var dataDir=opts.dataDir||process.env.AHABONA_DATA||path.join(__dirname,'data');
  var pubDir=opts.publicDir||path.join(__dirname,'public');
  var secure=opts.secure!==undefined?!!opts.secure:(process.env.AHABONA_SECURE==='1'||process.env.AHABONA_SECURE==='true');
  var dev=opts.dev!==undefined?!!opts.dev:(process.env.AHABONA_DEV==='1'||process.env.AHABONA_DEV==='true');
  var proxy=process.env.AHABONA_TRUST_PROXY==='1'||process.env.AHABONA_TRUST_PROXY==='true';
  console.log('[boot] env flags set:', {
    AHABONA_DATA:!!process.env.AHABONA_DATA,
    AHABONA_SECURE:process.env.AHABONA_SECURE!=null,
    AHABONA_DEV:process.env.AHABONA_DEV!=null,
    AHABONA_TRUST_PROXY:process.env.AHABONA_TRUST_PROXY!=null,
    ADMIN_EMAIL:!!process.env.ADMIN_EMAIL,
    ADMIN_PHONE:!!process.env.ADMIN_PHONE,
    ADMIN_PASSWORD:!!process.env.ADMIN_PASSWORD,
    MAIL_API_URL:!!process.env.MAIL_API_URL,
    PORT:!!process.env.PORT
  });
  var ctx=makeCtx({
    dataDir:dataDir,
    pubDir:pubDir,
    secure:secure,
    dev:dev,
    proxy:proxy
  });
  if(!process.env.AHABONA_DATA&&!opts.dataDir){
    console.warn('[warn] AHABONA_DATA is not set: data lives in the app folder ('+dataDir+') and is lost on redeploy unless a persistent disk is mounted there. Attach a disk and set AHABONA_DATA to its mount path.');
  }
  try{
    execFile('ffmpeg',['-version'],{timeout:8000},function(err){
      if(err)console.warn('[media] ffmpeg NOT found: videos are stored exactly as uploaded (use H.264 mp4).');
      else console.log('[media] ffmpeg found');
    });
  }catch(e){}
  Q=ctx.Q;
  caps=ctx.caps;
  capName=ctx.capName;
  store=ctx.store;
  var mediaStore=ctx.mediaStore;
  deviceOf=ctx.deviceOf;
  var adminBoot=Promise.resolve(ctx.adminBoot()).catch(function(e){
    console.error('[admin]',e&&e.message||e);
    return {ok:false};
  });
  var server=http.createServer(function(req,res){
    Promise.resolve().then(function(){return handleRequest(ctx,req,res)}).catch(function(e){
      console.error('[req]',e&&e.stack||e);
      if(!res.headersSent){try{sendError(req,res,500,'err.server')}catch(e2){}}
    });
  });
  process.on('unhandledRejection',function(err){
    console.error('[unhandledRejection]',err&&err.stack||err);
  });
  process.on('uncaughtException',function(err){
    console.error('[uncaughtException]',err&&err.stack||err);
    process.exit(1);
  });
  function listen(port){
    return new Promise(function(resolve){
      server.listen(port||0,function(){resolve(server.address().port)});
    });
  }
  function close(){
    return new Promise(function(resolve){
      server.close(function(){
        try{ctx.db.close()}catch(e){}
        resolve();
      });
    });
  }
  return {
    server:server,
    ctx:ctx,
    db:ctx.db,
    store:ctx.store,
    settings:ctx.settings,
    mailer:ctx.mailer,
    listen:listen,
    close:close,
    adminBoot:adminBoot
  };
}

module.exports={start:start,makeCtx:makeCtx,nz:nz};

if(require.main===module){
  var port=+(process.env.PORT||3000);
  var app=start();
  app.adminBoot.then(function(){return app.listen(port)}).then(function(p){
    console.log('AHABONA v2 listening on http://localhost:'+p);
  }).catch(function(e){
    console.error('boot failed',e&&e.stack||e);
    process.exit(1);
  });
}

/* ===== END OF IGICE 19/19 ===== */

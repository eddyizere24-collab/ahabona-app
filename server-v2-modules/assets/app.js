
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
function ini(n){return String(n||'').split(/\s+/).slice(0,2).map(function(w){return w[0]||''}).join('').toUpperCase()}
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
    if(/^https?:\/\//i.test(v))return v;
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


var RG={
  step:1,total:6,editing:false,busy:false,
  data:{
    name:'',birthdate:'',gender:'',province:'',district:'',svc:[],
    photos:[],thumbs:[],jobs:[],other:'',intro:'',
    edu:'',soc:'',experience:'',languages:[],availability:[],
    phone:'',wa:'',phones:[],email:'',password:'',terms:false,email_public:'',facebook:'',instagram:'',tiktok:'',linkedin:'',telegram:'',twitter:'',
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
        '<label class="ck"><input type="checkbox" data-rg="phone-agree"><span>'+esc(t('reg.phone.agree'))+'</span></label>'+
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
      el._agree=true;
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
    var ph=d.phone.replace(/[\s-]/g,'').replace(/^\+?250/,'0');
    if(!/^07[2389]\d{7}$/.test(ph))return 'reg.err.phone';
    if(!d._agree&&!document.querySelector('[data-rg="phone-agree"]:checked'))return 'reg.err.phone.agree';
  }
  if(step===5&&!RG.editing){
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()))return 'reg.err.email';
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
    body.phone_visible=!!document.querySelector('[data-rg="phone-agree"]:checked');
    body.email=d.email.trim().toLowerCase();
    body.password=d.password;
    body.terms=d.terms;
  }else{
    body.birthdate=d.birthdate||undefined;
    body.gender=d.gender||undefined;
    body.phone_visible=!!document.querySelector('[data-rg="phone-agree"]:checked');
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
  await api('POST','/api/password/forgot',{email:fe.value.trim()});
  var fm=document.getElementById('fm');
  if(fm)fm.textContent=t('forgot.sent');
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
      var ym=String(vurl).match(new RegExp('(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{6,})'));
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
  if((m=path.match(/^\/reset\/([A-Za-z0-9_-]+)$/))){
    openReset(m[1]);
    return Promise.resolve(true);
  }
  if((m=path.match(/^\/u\/([a-z0-9-]+)$/))){
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

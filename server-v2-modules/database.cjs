'use strict';

const { CAP_EN, TAX, ALIAS } = require('./catalogs.cjs');

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

module.exports = { migrate, seedCapabilities, seedStrip, seedHero, seedHelp };

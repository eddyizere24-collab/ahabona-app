'use strict';
const { initStudioSchema } = require('./schema.cjs');

const TRANSITIONS = ['inherit','none','fade','slide'];
const CTA = ['none','register','search','help','about','link'];
const KEY_RE = /^studio-[A-Za-z0-9_-]{8,80}\.(?:jpg|jpeg|png|webp|mp4)$/;
const MIME_EXT = {'image/jpeg':['jpg','jpeg'],'image/png':['png'],'image/webp':['webp']};

class StudioValidationError extends Error {
  constructor(code, field) { super(code); this.name='StudioValidationError'; this.code=code; this.field=field||null; }
}
function bad(code, field) { throw new StudioValidationError(code, field); }
function has(o,k) { return Object.prototype.hasOwnProperty.call(o,k); }
function int(v,min,max,def) {
  if (v===undefined||v===null||v==='') return def;
  const n=Number(v); return Number.isSafeInteger(n)&&n>=min&&n<=max?n:null;
}
function text(v,max,field) {
  if (v===undefined||v===null) return '';
  if (typeof v!=='string') bad('studio.err.text',field);
  const s=v.replace(/\u0000/g,'').trim();
  if (s.length>max) bad('studio.err.text_length',field);
  return s;
}
function object(v,field) {
  if (v===undefined||v===null) return {};
  if (typeof v==='string') {
    if (v.length>4096) bad('studio.err.style_size',field);
    try { v=JSON.parse(v); } catch (_) { bad('studio.err.style_json',field); }
  }
  if (!v||typeof v!=='object'||Array.isArray(v)) bad('studio.err.style_json',field);
  return v;
}
function safeStyle(v,overlay) {
  const field=overlay?'overlay_style':'text_style', x=object(v,field), o={};
  const keys=overlay?['position','opacity','background','x','y']:['fontSize','fontWeight','textAlign','color','backgroundColor','fontFamily'];
  for (const k of Object.keys(x)) if (!keys.includes(k)) bad('studio.err.style_key',field);
  if (!overlay) {
    if (has(x,'fontSize')) { if (typeof x.fontSize!=='number'||x.fontSize<12||x.fontSize>48) bad('studio.err.style_value',field); o.fontSize=Math.round(x.fontSize); }
    if (has(x,'fontWeight')) { if (![400,500,600,700,800].includes(x.fontWeight)) bad('studio.err.style_value',field); o.fontWeight=x.fontWeight; }
    if (has(x,'textAlign')) { if (!['left','center','right'].includes(x.textAlign)) bad('studio.err.style_value',field); o.textAlign=x.textAlign; }
    for (const k of ['color','backgroundColor']) if (has(x,k)) { if (typeof x[k]!=='string'||!/^#[0-9a-f]{6}$/i.test(x[k])) bad('studio.err.style_value',field); o[k]=x[k].toLowerCase(); }
    if (has(x,'fontFamily')) { if (!['system','sans','serif'].includes(x.fontFamily)) bad('studio.err.style_value',field); o.fontFamily=x.fontFamily; }
  } else {
    if (has(x,'position')) { if (!['top','middle','bottom'].includes(x.position)) bad('studio.err.style_value',field); o.position=x.position; }
    if (has(x,'opacity')) { if (typeof x.opacity!=='number'||!Number.isFinite(x.opacity)||x.opacity<0||x.opacity>1) bad('studio.err.style_value',field); o.opacity=Math.round(x.opacity*100)/100; }
    if (has(x,'background')) { if (!['none','dark','light'].includes(x.background)) bad('studio.err.style_value',field); o.background=x.background; }
    for (const k of ['x','y']) if (has(x,k)) { if (typeof x[k]!=='number'||!Number.isFinite(x[k])||x[k]<0||x[k]>100) bad('studio.err.style_value',field); o[k]=Math.round(x[k]); }
  }
  return o;
}
function stamp(options) { return options&&Number.isSafeInteger(options.now)?options.now:Date.now(); }
function rawScene(db,id) { const n=int(id,1,Number.MAX_SAFE_INTEGER,null); return n===null?null:db.prepare('SELECT * FROM studio_scenes WHERE id=?').get(n)||null; }
function sceneOut(r) {
  if (!r) return null;
  const o={...r};
  for (const [out,key] of [['text_style','text_style_json'],['overlay_style','overlay_style_json']]) {
    try { o[out]=JSON.parse(o[key]||'{}'); } catch (_) { o[out]={}; } delete o[key];
  }
  return o;
}
function asset(db,id,field) {
  if (id===undefined||id===null||id==='') return null;
  const n=int(id,1,Number.MAX_SAFE_INTEGER,null);
  if (n===null) bad('studio.err.asset_id',field);
  const a=db.prepare('SELECT * FROM studio_assets WHERE id=?').get(n);
  if (!a) bad('studio.err.asset_missing',field);
  return a;
}
function checkAsset(db,id,kind,status,field) {
  const a=asset(db,id,field);
  if (!a) { if (status==='published') bad('studio.err.asset_required',field); return null; }
  if (a.asset_kind!==kind) bad('studio.err.asset_kind',field);
  if (status==='published'&&a.status!=='ready') bad('studio.err.asset_not_ready',field);
  return a;
}
function init(db,now) { return initStudioSchema(db,now); }
function readSettings(db) {
  const r=db.prepare('SELECT * FROM studio_settings WHERE id=1').get();
  if (!r) bad('studio.err.not_initialized');
  return {enabled:r.enabled===1,playback_mode:r.playback_mode,transition:r.transition,transition_ms:r.transition_ms,
    default_duration_ms:r.default_duration_ms,pause_on_interaction:r.pause_on_interaction===1,updated_at:r.updated_at};
}
function updateSettings(db,p={},options) {
  const old=readSettings(db), n={...old}, now=stamp(options);
  if (has(p,'enabled')) { if (![true,false,0,1].includes(p.enabled)) bad('studio.err.setting_value','enabled'); n.enabled=p.enabled===true||p.enabled===1; }
  if (has(p,'playback_mode')) { if (!['sequential','shuffle'].includes(p.playback_mode)) bad('studio.err.setting_value','playback_mode'); n.playback_mode=p.playback_mode; }
  if (has(p,'transition')) { if (!['none','fade','slide'].includes(p.transition)) bad('studio.err.setting_value','transition'); n.transition=p.transition; }
  if (has(p,'transition_ms')) { n.transition_ms=int(p.transition_ms,0,1500,null); if(n.transition_ms===null) bad('studio.err.setting_value','transition_ms'); }
  if (has(p,'default_duration_ms')) { n.default_duration_ms=int(p.default_duration_ms,1000,90000,null); if(n.default_duration_ms===null) bad('studio.err.setting_value','default_duration_ms'); }
  if (has(p,'pause_on_interaction')) { if (![true,false,0,1].includes(p.pause_on_interaction)) bad('studio.err.setting_value','pause_on_interaction'); n.pause_on_interaction=p.pause_on_interaction===true||p.pause_on_interaction===1; }
  db.prepare('UPDATE studio_settings SET enabled=?,playback_mode=?,transition=?,transition_ms=?,default_duration_ms=?,pause_on_interaction=?,updated_at=? WHERE id=1')
    .run(n.enabled?1:0,n.playback_mode,n.transition,n.transition_ms,n.default_duration_ms,n.pause_on_interaction?1:0,now);
  return readSettings(db);
}
function normalize(db,input={},cur={},now=Date.now(),actorId) {
  const val=k=>has(input,k)?input[k]:cur[k];
  const kind=val('scene_kind')||'text', status=val('status')||'draft';
  if (!['text','image','video'].includes(kind)) bad('studio.err.scene_kind','scene_kind');
  if (!['draft','published','archived'].includes(status)) bad('studio.err.scene_status','status');
  const o={scene_kind:kind,status};
  for (const [k,max] of Object.entries({title_rw:120,title_en:120,body_rw:2000,body_en:2000,cta_label_rw:50,cta_label_en:50,cta_value:500})) o[k]=text(val(k),max,k);
  o.text_style_json=JSON.stringify(safeStyle(val('text_style')!==undefined?val('text_style'):cur.text_style,false));
  o.overlay_style_json=JSON.stringify(safeStyle(val('overlay_style')!==undefined?val('overlay_style'):cur.overlay_style,true));
  o.cta_action=val('cta_action')||'none';
  if (!CTA.includes(o.cta_action)) bad('studio.err.cta_action','cta_action');
  if (o.cta_action==='link') { if (!/^https:\/\/[^\s"'<>]+$/i.test(o.cta_value)) bad('studio.err.cta_url','cta_value'); }
  else if (o.cta_action!=='search'&&o.cta_value) bad('studio.err.cta_value','cta_value');
  o.sort_order=int(val('sort_order'),-100000,100000,0); if(o.sort_order===null) bad('studio.err.sort_order','sort_order');
  o.duration_ms=int(val('duration_ms'),1000,90000,7000); if(o.duration_ms===null) bad('studio.err.duration','duration_ms');
  o.transition=val('transition')||'inherit'; if(!TRANSITIONS.includes(o.transition)) bad('studio.err.transition','transition');
  o.fit=val('fit')||'cover'; if(!['cover','contain'].includes(o.fit)) bad('studio.err.fit','fit');
  for (const k of ['crop_x','crop_y']) { o[k]=int(val(k),0,100,50); if(o[k]===null) bad('studio.err.crop',k); }
  for (const k of ['start_at','end_at']) { const v=val(k); o[k]=v===undefined||v===null||v===''?null:int(v,0,Number.MAX_SAFE_INTEGER,null); if(v!==undefined&&v!==null&&v!==''&&o[k]===null) bad('studio.err.schedule',k); }
  if(o.start_at!==null&&o.end_at!==null&&o.end_at<=o.start_at) bad('studio.err.schedule','end_at');
  o.asset_id=val('asset_id')===undefined||val('asset_id')===null||val('asset_id')===''?null:int(val('asset_id'),1,Number.MAX_SAFE_INTEGER,null);
  o.poster_asset_id=val('poster_asset_id')===undefined||val('poster_asset_id')===null||val('poster_asset_id')===''?null:int(val('poster_asset_id'),1,Number.MAX_SAFE_INTEGER,null);
  if(val('asset_id')!==undefined&&val('asset_id')!==null&&val('asset_id')!==''&&o.asset_id===null) bad('studio.err.asset_id','asset_id');
  if(val('poster_asset_id')!==undefined&&val('poster_asset_id')!==null&&val('poster_asset_id')!==''&&o.poster_asset_id===null) bad('studio.err.asset_id','poster_asset_id');
  if(kind==='text') {
    if(o.asset_id!==null||o.poster_asset_id!==null) bad('studio.err.text_asset','asset_id');
    if(status==='published'&&!(o.title_rw||o.title_en||o.body_rw||o.body_en)) bad('studio.err.text_required','body_rw');
  } else {
    checkAsset(db,o.asset_id,kind,status,'asset_id');
    if(kind==='video') checkAsset(db,o.poster_asset_id,'poster',status,'poster_asset_id');
    else if(o.poster_asset_id!==null) bad('studio.err.poster_kind','poster_asset_id');
  }
  o.created_by=cur.created_by!==undefined?cur.created_by:(Number.isSafeInteger(actorId)&&actorId>0?actorId:null);
  o.created_at=cur.created_at||now; o.updated_at=now;
  return o;
}
function getScene(db,id) { return sceneOut(rawScene(db,id)); }
function createScene(db,input,options) {
  const now=stamp(options), o=normalize(db,input,{},now,options&&options.actorId);
  const r=db.prepare('INSERT INTO studio_scenes (scene_kind,title_rw,title_en,body_rw,body_en,text_style_json,overlay_style_json,asset_id,poster_asset_id,cta_label_rw,cta_label_en,cta_action,cta_value,status,sort_order,duration_ms,transition,fit,crop_x,crop_y,start_at,end_at,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(o.scene_kind,o.title_rw,o.title_en,o.body_rw,o.body_en,o.text_style_json,o.overlay_style_json,o.asset_id,o.poster_asset_id,o.cta_label_rw,o.cta_label_en,o.cta_action,o.cta_value,o.status,o.sort_order,o.duration_ms,o.transition,o.fit,o.crop_x,o.crop_y,o.start_at,o.end_at,o.created_by,o.created_at,o.updated_at);
  return getScene(db,Number(r.lastInsertRowid));
}
function updateScene(db,id,patch,options) {
  const cur=getScene(db,id); if(!cur) return null;
  const o=normalize(db,patch,cur,stamp(options),options&&options.actorId);
  db.prepare('UPDATE studio_scenes SET scene_kind=?,title_rw=?,title_en=?,body_rw=?,body_en=?,text_style_json=?,overlay_style_json=?,asset_id=?,poster_asset_id=?,cta_label_rw=?,cta_label_en=?,cta_action=?,cta_value=?,status=?,sort_order=?,duration_ms=?,transition=?,fit=?,crop_x=?,crop_y=?,start_at=?,end_at=?,created_by=?,created_at=?,updated_at=? WHERE id=?')
    .run(o.scene_kind,o.title_rw,o.title_en,o.body_rw,o.body_en,o.text_style_json,o.overlay_style_json,o.asset_id,o.poster_asset_id,o.cta_label_rw,o.cta_label_en,o.cta_action,o.cta_value,o.status,o.sort_order,o.duration_ms,o.transition,o.fit,o.crop_x,o.crop_y,o.start_at,o.end_at,o.created_by,o.created_at,o.updated_at,Number(id));
  return getScene(db,id);
}
function deleteScene(db,id) { const n=int(id,1,Number.MAX_SAFE_INTEGER,null); return n!==null&&db.prepare('DELETE FROM studio_scenes WHERE id=?').run(n).changes>0; }
function getAsset(db,id) { const n=int(id,1,Number.MAX_SAFE_INTEGER,null); return n===null?null:db.prepare('SELECT * FROM studio_assets WHERE id=?').get(n)||null; }
function createAsset(db,input,options) {
  const x=input||{}, now=stamp(options), kind=x.asset_kind;
  if(!['image','video','poster'].includes(kind)) bad('studio.err.asset_kind','asset_kind');
  if(typeof x.storage_key!=='string'||!KEY_RE.test(x.storage_key)) bad('studio.err.asset_key','storage_key');
  const ext=x.storage_key.split('.').pop().toLowerCase();
  if(kind==='video') { if(x.mime_type!=='video/mp4'||ext!=='mp4') bad('studio.err.asset_mime','mime_type'); }
  else if(!MIME_EXT[x.mime_type]||!MIME_EXT[x.mime_type].includes(ext)) bad('studio.err.asset_mime','mime_type');
  const bytes=int(x.bytes,1,kind==='video'?64*1024*1024:8*1024*1024,null); if(bytes===null) bad('studio.err.asset_size','bytes');
  const sha=x.sha256==null||x.sha256===''?null:String(x.sha256).toLowerCase(); if(sha!==null&&!/^[0-9a-f]{64}$/.test(sha)) bad('studio.err.asset_sha','sha256');
  const width=x.width==null?null:int(x.width,1,20000,null), height=x.height==null?null:int(x.height,1,20000,null);
  if((x.width!=null&&width===null)||(x.height!=null&&height===null)||((kind!=='video')&&(!width||!height))||((width===null)!==(height===null))) bad('studio.err.asset_dimensions','width');
  const dur=x.duration_ms==null?null:int(x.duration_ms,1,90000,null);
  if((kind==='video'&&dur===null)||(kind!=='video'&&dur!==null)) bad('studio.err.asset_duration','duration_ms');
  const codec=kind==='video'?text(x.codec,40,'codec')||null:null;
  const r=db.prepare('INSERT INTO studio_assets (asset_kind,storage_key,mime_type,bytes,sha256,width,height,duration_ms,codec,status,failure_code,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,\'processing\',NULL,?,?)')
    .run(kind,x.storage_key,x.mime_type,bytes,sha,width,height,dur,codec,now,now);
  return getAsset(db,Number(r.lastInsertRowid));
}
function updateAssetStatus(db,id,status,details,options) {
  const a=getAsset(db,id); if(!a) return null; details=details||{};
  const now=stamp(options); if(!['processing','ready','failed'].includes(status)) bad('studio.err.asset_status','status');
  if(status==='failed') {
    const code=text(details.failure_code||'processing_failed',80,'failure_code');
    db.prepare("UPDATE studio_assets SET status='failed',failure_code=?,updated_at=? WHERE id=?").run(code,now,Number(id));
  } else if(status==='processing') {
    db.prepare("UPDATE studio_assets SET status='processing',failure_code=NULL,updated_at=? WHERE id=?").run(now,Number(id));
  } else {
    const w=details.width===undefined?a.width:int(details.width,1,20000,null), h=details.height===undefined?a.height:int(details.height,1,20000,null);
    const d=details.duration_ms===undefined?a.duration_ms:int(details.duration_ms,1,90000,null);
    if(!w||!h) bad('studio.err.asset_dimensions','width');
    if((a.asset_kind==='video'&&(!d||d>90000))||(a.asset_kind!=='video'&&d!==null)) bad('studio.err.asset_duration','duration_ms');
    if(a.asset_kind==='video'&&a.mime_type!=='video/mp4') bad('studio.err.asset_mime','mime_type');
    const codec=a.asset_kind==='video'?(text(details.codec===undefined?a.codec:details.codec,40,'codec')||'h264'):null;
    db.prepare("UPDATE studio_assets SET status='ready',failure_code=NULL,width=?,height=?,duration_ms=?,codec=?,updated_at=? WHERE id=?").run(w,h,d,codec,now,Number(id));
  }
  return getAsset(db,id);
}
function listScenes(db,options) {
  options=options||{}; const rows=db.prepare('SELECT * FROM studio_scenes ORDER BY sort_order,id').all();
  if(!options.publicOnly) return rows.map(sceneOut);
  const now=Number.isSafeInteger(options.now)?options.now:Date.now();
  return rows.filter(r=>{
    if(r.status!=='published'||(r.start_at!==null&&r.start_at>now)||(r.end_at!==null&&r.end_at<=now)) return false;
    if(r.scene_kind==='text') return !!(r.title_rw||r.title_en||r.body_rw||r.body_en);
    const a=r.asset_id?getAsset(db,r.asset_id):null;
    if(!a||a.status!=='ready'||a.asset_kind!==r.scene_kind) return false;
    if(r.scene_kind==='video') { const p=r.poster_asset_id?getAsset(db,r.poster_asset_id):null; return !!p&&p.status==='ready'&&p.asset_kind==='poster'; }
    return true;
  }).map(sceneOut);
}
function getPublicPlaylist(db,options) {
  const settings=readSettings(db);
  return {enabled:settings.enabled,settings,scenes:settings.enabled?listScenes(db,{publicOnly:true,now:options&&options.now}):[]};
}
module.exports={StudioValidationError,initStudioSchema:init,readSettings,updateSettings,createScene,getScene,updateScene,deleteScene,listScenes,getPublicPlaylist,createAsset,getAsset,updateAssetStatus};

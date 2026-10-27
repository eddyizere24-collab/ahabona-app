'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
const studio=require('../server-v2-modules/studio/store.cjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ahabona-studio-test-'));
let db;
function expectCode(fn,code){assert.throws(fn,e=>e&&e.code===code);}
try {
  db=new DatabaseSync(path.join(tmp,'test.db'));
  db.exec('PRAGMA foreign_keys=ON');
  db.exec('CREATE TABLE strip_ads (id INTEGER PRIMARY KEY,text TEXT NOT NULL)');
  db.prepare('INSERT INTO strip_ads(id,text) VALUES(1,?)').run('legacy stays');
  studio.initStudioSchema(db,1000);
  assert.equal(studio.readSettings(db).enabled,false);
  assert.deepEqual(studio.getPublicPlaylist(db,{now:2000}).scenes,[]);
  assert.equal(db.prepare('SELECT text FROM strip_ads WHERE id=1').get().text,'legacy stays');
  assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get(),undefined);

  const draft=studio.createScene(db,{scene_kind:'text',title_rw:'Murakaza neza',body_rw:'Menya AHABONA',text_style:{fontSize:26,fontWeight:700,textAlign:'center',color:'#ffffff'}},{now:1100,actorId:7});
  assert.equal(draft.status,'draft'); assert.equal(draft.text_style.fontSize,26); assert.equal(draft.created_by,7);
  const empty=studio.createScene(db,{scene_kind:'text',status:'draft'},{now:1150});
  expectCode(()=>studio.updateScene(db,empty.id,{status:'published'},{now:1200}),'studio.err.text_required');
  const text=studio.updateScene(db,draft.id,{status:'published',body_rw:'Menya abantu. Menya amahirwe.'},{now:1250});
  assert.equal(text.status,'published');

  const image=studio.createAsset(db,{asset_kind:'image',storage_key:'studio-image12345.jpg',mime_type:'image/jpeg',bytes:3000,width:800,height:600},{now:1260});
  const imageDraft=studio.createScene(db,{scene_kind:'image',title_rw:'Ifoto',asset_id:image.id,status:'draft'},{now:1270});
  expectCode(()=>studio.updateScene(db,imageDraft.id,{status:'published'},{now:1280}),'studio.err.asset_not_ready');
  studio.updateAssetStatus(db,image.id,'ready',{width:800,height:600},{now:1290});
  const pubImage=studio.updateScene(db,imageDraft.id,{status:'published'},{now:1295});
  assert.equal(pubImage.status,'published');

  expectCode(()=>studio.createScene(db,{scene_kind:'text',title_rw:'link',body_rw:'x',cta_action:'link',cta_value:'http://example.org'}),'studio.err.cta_url');
  expectCode(()=>studio.createScene(db,{scene_kind:'text',title_rw:'x',body_rw:'x',text_style:{color:'url(javascript:alert(1))'}}),'studio.err.style_value');
  expectCode(()=>studio.createAsset(db,{asset_kind:'image',storage_key:'../../evil.jpg',mime_type:'image/jpeg',bytes:100,width:10,height:10}),'studio.err.asset_key');
  expectCode(()=>studio.createAsset(db,{asset_kind:'video',storage_key:'studio-longvid123.mp4',mime_type:'video/mp4',bytes:1000,duration_ms:90001}),'studio.err.asset_duration');

  const video=studio.createAsset(db,{asset_kind:'video',storage_key:'studio-video123456.mp4',mime_type:'video/mp4',bytes:5000,sha256:'a'.repeat(64),duration_ms:20000,codec:'h264'},{now:1300});
  const poster=studio.createAsset(db,{asset_kind:'poster',storage_key:'studio-poster123.jpg',mime_type:'image/jpeg',bytes:4000,sha256:'b'.repeat(64),width:720,height:405},{now:1300});
  const videoDraft=studio.createScene(db,{scene_kind:'video',title_rw:'Video',asset_id:video.id,poster_asset_id:poster.id,status:'draft'},{now:1300});
  expectCode(()=>studio.updateScene(db,videoDraft.id,{status:'published'},{now:1400}),'studio.err.asset_not_ready');
  expectCode(()=>studio.updateAssetStatus(db,video.id,'ready',{width:1280,height:720,duration_ms:20000,codec:'hevc'},{now:1450}),'studio.err.video_not_ready');
  studio.updateAssetStatus(db,video.id,'ready',{width:1280,height:720,duration_ms:20000,codec:'h264'},{now:1500});
  studio.updateAssetStatus(db,poster.id,'ready',{width:720,height:405},{now:1500});
  const pubVideo=studio.updateScene(db,videoDraft.id,{status:'published'},{now:1600});
  assert.equal(pubVideo.status,'published');

  const future=studio.createScene(db,{scene_kind:'text',title_rw:'Later',body_rw:'Scheduled',status:'published',start_at:5000,end_at:8000},{now:1700});
  studio.updateSettings(db,{enabled:true,playback_mode:'shuffle',transition_ms:600},{now:1800});
  assert.deepEqual(studio.getPublicPlaylist(db,{now:4000}).scenes.map(x=>x.id),[text.id,pubImage.id,pubVideo.id]);
  assert.deepEqual(studio.getPublicPlaylist(db,{now:6000}).scenes.map(x=>x.id),[text.id,pubImage.id,pubVideo.id,future.id]);
  studio.initStudioSchema(db,1900); // Re-running setup must preserve settings/content.
  assert.equal(studio.readSettings(db).enabled,true);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM strip_ads').get().n,1);
  assert.equal(studio.deleteScene(db,pubVideo.id),true);
  assert.equal(studio.getAsset(db,video.id).status,'ready');
  console.log('Studio store smoke tests passed.');
} finally {
  if(db) db.close();
  fs.rmSync(tmp,{recursive:true,force:true});
}

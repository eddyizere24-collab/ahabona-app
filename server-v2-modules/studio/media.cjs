'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const runFile = promisify(execFile);
const STORE = require('./store.cjs');

const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_VIDEO = 64 * 1024 * 1024;
const MAX_DURATION_MS = 90000;
const KEY_RE = /^studio-[A-Za-z0-9_-]{8,80}\.(?:jpg|jpeg|png|webp|mp4)$/;
const INPUT_VIDEO_MIMES = ['video/mp4','video/webm','video/quicktime','video/x-msvideo','application/octet-stream'];

class StudioMediaError extends Error {
  constructor(code, status=400) { super(code); this.name='StudioMediaError'; this.code=code; this.status=status; }
}
function fail(code,status) { throw new StudioMediaError(code,status); }
function hashFile(file) {
  const hash=crypto.createHash('sha256');
  const fd=fs.openSync(file,'r');
  try {
    const b=Buffer.allocUnsafe(256*1024);
    let n=0;
    while((n=fs.readSync(fd,b,0,b.length,null))>0) hash.update(b.subarray(0,n));
  } finally { fs.closeSync(fd); }
  return hash.digest('hex');
}
function imageType(buf) {
  if(!Buffer.isBuffer(buf)||buf.length<12)return null;
  if(buf[0]===0xff&&buf[1]===0xd8&&buf[2]===0xff)return {ext:'jpg',mime:'image/jpeg'};
  if(buf[0]===0x89&&buf[1]===0x50&&buf[2]===0x4e&&buf[3]===0x47)return {ext:'png',mime:'image/png'};
  if(buf.toString('latin1',0,4)==='RIFF'&&buf.toString('latin1',8,12)==='WEBP')return {ext:'webp',mime:'image/webp'};
  return null;
}
function videoContainer(buf) {
  if(!Buffer.isBuffer(buf)||buf.length<12)return false;
  if(buf[4]===0x66&&buf[5]===0x74&&buf[6]===0x79&&buf[7]===0x70) {
    const brand=buf.toString('latin1',8,12);
    return !['heic','heix','heim','heis','hevm','hevs','mif1','msf1','avif','avis','M4A ','M4B ','M4P ','crx '].includes(brand);
  }
  if(buf[0]===0x1a&&buf[1]===0x45&&buf[2]===0xdf&&buf[3]===0xa3)return true;
  if(buf.toString('latin1',0,4)==='RIFF'&&buf.toString('latin1',8,12)==='AVI ')return true;
  return false;
}
function key(ext) { return 'studio-'+crypto.randomBytes(16).toString('hex')+'.'+ext; }
function dimensions(probe) {
  const stream=(probe.streams||[]).find(x=>x.codec_type==='video');
  if(!stream||!Number.isInteger(stream.width)||!Number.isInteger(stream.height)||stream.width<1||stream.height<1||stream.width>20000||stream.height>20000||stream.width*stream.height>20000000)fail('studio.err.media_dimensions');
  return {stream,width:stream.width,height:stream.height};
}
function durationMs(probe,stream) {
  const seconds=Number((probe.format&&probe.format.duration)||stream.duration||NaN);
  if(!Number.isFinite(seconds)||seconds<=0)fail('studio.err.media_duration');
  const ms=Math.round(seconds*1000);
  if(ms>MAX_DURATION_MS)fail('studio.err.media_too_long');
  return ms;
}
function makeStudioMediaPipeline(dataDir) {
  const root=path.join(dataDir,'studio-media');
  const tempRoot=path.join(root,'.tmp');
  fs.mkdirSync(root,{recursive:true,mode:0o750});
  fs.mkdirSync(tempRoot,{recursive:true,mode:0o700});
  let busy=false;
  function tryAcquire() {
    if(busy)return null;
    busy=true;
    let released=false;
    return function release() { if(!released){released=true;busy=false;} };
  }
  async function exec(command,args,timeout=180000) {
    try { return await runFile(command,args,{timeout,killSignal:'SIGKILL',maxBuffer:4*1024*1024,windowsHide:true}); }
    catch(e) {
      const missing=e&&e.code==='ENOENT';
      fail(missing?'studio.err.transcoder_missing':'studio.err.media_processing',missing?503:422);
    }
  }
  async function probe(file) {
    const r=await exec('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height,duration','-of','json',file],30000);
    let o;
    try{o=JSON.parse(r.stdout)}catch(_){fail('studio.err.media_invalid')}
    if(!o||!Array.isArray(o.streams))fail('studio.err.media_invalid');
    return o;
  }
  function outputFile(dir,name) {
    if(!KEY_RE.test(name))fail('studio.err.asset_key',500);
    const fp=path.join(dir,name);
    if(path.dirname(fp)!==dir)fail('studio.err.asset_key',500);
    return fp;
  }
  function statFile(file,max) {
    const st=fs.statSync(file);
    if(!st.isFile()||st.size<1||st.size>max)fail('studio.err.asset_size');
    return st;
  }
  function createReadyImage(db,file,actorId,now) {
    const stat=statFile(file,MAX_IMAGE);
    const probeInfo=probeImageMetadata(file);
    const name=key('jpg'), dest=outputFile(root,name);
    fs.renameSync(file,dest);
    let asset=null;
    try {
      asset=STORE.createAsset(db,{asset_kind:'image',storage_key:name,mime_type:'image/jpeg',bytes:stat.size,sha256:hashFile(dest),width:probeInfo.width,height:probeInfo.height},{now,actorId});
      STORE.updateAssetStatus(db,asset.id,'ready',{width:probeInfo.width,height:probeInfo.height},{now});
      return STORE.getAsset(db,asset.id);
    } catch(e) {
      try{fs.unlinkSync(dest)}catch(_){}
      if(asset)try{STORE.updateAssetStatus(db,asset.id,'failed',{failure_code:'storage_error'},{now})}catch(_){}
      throw e;
    }
  }
  function probeImageMetadata(file) {
    const info=imageMetadataCache.get(file);
    if(!info)fail('studio.err.media_invalid');
    return info;
  }
  const imageMetadataCache=new Map();

  async function uploadImage(db,buffer,actorId,now=Date.now()) {
    if(!Buffer.isBuffer(buffer)||buffer.length<100||buffer.length>MAX_IMAGE)fail('studio.err.asset_size');
    if(!imageType(buffer))fail('studio.err.image_type');
    const dir=fs.mkdtempSync(path.join(tempRoot,'image-'));
    const input=path.join(dir,'source.bin'), out=path.join(dir,'optimized.jpg');
    let saved=null;
    try {
      fs.writeFileSync(input,buffer,{flag:'wx',mode:0o600});
      buffer=null;
      const source=await probe(input), sourceDim=dimensions(source);
      if(sourceDim.width*sourceDim.height>20000000)fail('studio.err.media_dimensions');
      await exec('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',input,'-frames:v','1','-update','1','-vf',"scale='trunc(min(1280,iw)/2)*2':-2",'-q:v','5','-map_metadata','-1','-threads','1',out],90000);
      const p=await probe(out), d=dimensions(p);
      if((p.streams||[]).some(x=>x.codec_type==='video'&&x.codec_name&&x.codec_name!=='mjpeg'))fail('studio.err.media_invalid');
      imageMetadataCache.set(out,{width:d.width,height:d.height});
      saved=createReadyImage(db,out,actorId,now);
      imageMetadataCache.delete(out);
      return {asset:saved};
    } finally {
      imageMetadataCache.delete(out);
      try{fs.rmSync(dir,{recursive:true,force:true})}catch(_){}
    }
  }

  async function uploadVideo(db,buffer,contentType,actorId,now=Date.now()) {
    if(!Buffer.isBuffer(buffer)||buffer.length<100||buffer.length>MAX_VIDEO)fail('studio.err.asset_size');
    if(!INPUT_VIDEO_MIMES.includes(String(contentType||'').toLowerCase())&&!videoContainer(buffer))fail('studio.err.video_type');
    if(!videoContainer(buffer))fail('studio.err.video_type');
    const dir=fs.mkdtempSync(path.join(tempRoot,'video-'));
    const input=path.join(dir,'source.bin'), out=path.join(dir,'optimized.mp4'), posterFile=path.join(dir,'poster.jpg');
    let mediaAsset=null,posterAsset=null,mediaKey=null,posterKey=null;
    try {
      fs.writeFileSync(input,buffer,{flag:'wx',mode:0o600});
      buffer=null;
      const source=await probe(input), sourceDim=dimensions(source);
      const sourceDuration=durationMs(source,sourceDim.stream);
      // Reject overlong input; do not silently truncate user content.
      if(sourceDuration>MAX_DURATION_MS)fail('studio.err.media_too_long');
      await exec('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',input,'-t','90','-map','0:v:0','-vf',"scale='trunc(min(960,iw)/2)*2':-2",'-c:v','libx264','-preset','veryfast','-crf','29','-maxrate','1200k','-bufsize','2400k','-pix_fmt','yuv420p','-profile:v','main','-level','3.1','-threads','1','-an','-sn','-dn','-map_metadata','-1','-movflags','+faststart','-f','mp4',out],180000);
      const processed=await probe(out), pd=dimensions(processed), dur=durationMs(processed,pd.stream);
      if(pd.stream.codec_name!=='h264'||dur>MAX_DURATION_MS)fail('studio.err.video_not_ready');
      await exec('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',out,'-frames:v','1','-update','1','-vf',"scale='trunc(min(640,iw)/2)*2':-2",'-q:v','4','-map_metadata','-1','-threads','1',posterFile],60000);
      const mp4stat=statFile(out,MAX_VIDEO), posterStat=statFile(posterFile,MAX_IMAGE);
      const pp=await probe(posterFile), posterDim=dimensions(pp);
      mediaKey=key('mp4');posterKey=key('jpg');
      const dest=outputFile(root,mediaKey),posterDest=outputFile(root,posterKey);
      fs.renameSync(out,dest);fs.renameSync(posterFile,posterDest);
      try {
        posterAsset=STORE.createAsset(db,{asset_kind:'poster',storage_key:posterKey,mime_type:'image/jpeg',bytes:posterStat.size,sha256:hashFile(posterDest),width:posterDim.width,height:posterDim.height},{now,actorId});
        mediaAsset=STORE.createAsset(db,{asset_kind:'video',storage_key:mediaKey,mime_type:'video/mp4',bytes:mp4stat.size,sha256:hashFile(dest),width:pd.width,height:pd.height,duration_ms:dur,codec:'h264'},{now,actorId});
        STORE.updateAssetStatus(db,posterAsset.id,'ready',{width:posterDim.width,height:posterDim.height},{now});
        STORE.updateAssetStatus(db,mediaAsset.id,'ready',{width:pd.width,height:pd.height,duration_ms:dur,codec:pd.stream.codec_name},{now});
        return {asset:STORE.getAsset(db,mediaAsset.id),poster:STORE.getAsset(db,posterAsset.id)};
      } catch(e) {
        if(mediaAsset)try{STORE.updateAssetStatus(db,mediaAsset.id,'failed',{failure_code:'storage_error'},{now})}catch(_){}
        if(posterAsset)try{STORE.updateAssetStatus(db,posterAsset.id,'failed',{failure_code:'storage_error'},{now})}catch(_){}
        try{fs.unlinkSync(dest)}catch(_){}
        try{fs.unlinkSync(posterDest)}catch(_){}
        throw e;
      }
    } finally { try{fs.rmSync(dir,{recursive:true,force:true})}catch(_){} }
  }
  return {root,tryAcquire,uploadImage,uploadVideo,isBusy:()=>busy,maxImageBytes:MAX_IMAGE,maxVideoBytes:MAX_VIDEO,maxDurationMs:MAX_DURATION_MS,validKey:(s)=>typeof s==='string'&&KEY_RE.test(s)};
}
module.exports={StudioMediaError,makeStudioMediaPipeline,imageType,videoContainer,MAX_IMAGE,MAX_VIDEO,MAX_DURATION_MS};

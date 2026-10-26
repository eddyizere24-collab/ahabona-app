'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { MAXP } = require('./catalogs.cjs');

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

module.exports = { parseJpeg, parseVideoB64, makeMediaStore, makePhotoStore };

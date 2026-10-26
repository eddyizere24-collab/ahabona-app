'use strict';

const crypto = require('node:crypto');
const zlib = require('node:zlib');

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


module.exports = { _pickEnc, _compressBody, _etagOf };

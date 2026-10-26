'use strict';

const crypto = require('node:crypto');
const { BLOCKLIST } = require('./catalogs.cjs');

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


module.exports = {
  nz,
  clean,
  np,
  EM,
  MP,
  URL_RE,
  PID_RE,
  SLUG_RE,
  DATE_RE,
  esc,
  ini,
  sha,
  unit,
  scrypt,
  hashPw,
  checkPw,
  lev1,
  isValidCalendarDate,
  ageFromBirthdate,
  containsBlocked
};

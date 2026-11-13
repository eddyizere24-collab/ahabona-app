'use strict';
const {withTransaction}=require('./postgres.cjs');
const {ensureLegacyIdentity}=require('./jobs-employer.cjs');
const {buildProfileSnapshot}=require('./applications.cjs');
function parseStoredArray(value,maximum=40){let v=value;if(typeof value==='string'){try{v=JSON.parse(value)}catch{return []}}return Array.isArray(v)?v.slice(0,maximum):[];}
function safeTimestamp(value,fallback){const n=Number(value);return Number.isSafeInteger(n)&&n>0?n:fallback;}
async function ensureLegacyUser(pool,actor){return withTransaction(pool,c=>ensureLegacyIdentity(c,actor));}
async function syncLegacyCandidateProfile(pool,actor,sourceProfile){
 const userId=Number(actor?.id);if(!Number.isSafeInteger(userId)||userId<1||actor?.status!=='active')throw new TypeError('Active AHABONA session required.');
 if(!sourceProfile||typeof sourceProfile!=='object')return{synced:false,reason:'PROFILE_NOT_FOUND'};
 const pid=typeof sourceProfile.pid==='string'?sourceProfile.pid.trim():'';if(!pid||pid.length>64)return{synced:false,reason:'PROFILE_ID_NOT_AVAILABLE'};
 const profile={...sourceProfile,caps:parseStoredArray(sourceProfile.caps,40),experience:parseStoredArray(sourceProfile.experience,30),languages:parseStoredArray(sourceProfile.languages,20),availability:parseStoredArray(sourceProfile.availability,20)};
 const snap=buildProfileSnapshot(profile,actor);if(!snap.display_name||!snap.district)return{synced:false,reason:'PROFILE_INCOMPLETE'};
 const now=Date.now(),created=safeTimestamp(sourceProfile.created_at,now),updated=safeTimestamp(sourceProfile.updated_at,now);
 return withTransaction(pool,async c=>{
  await ensureLegacyIdentity(c,actor);
  const out=await c.query(
   'INSERT INTO public.profiles (user_id,pid,name,district,caps,other_text,intro,edu,phone_visible,phones,svc,nphotos,suspended,created_at,updated_at,experience,languages,availability,portfolio,edu_level) '+
   'SELECT $1,$2,$3,$4,$5::jsonb,$6,$7,$8,false,\\'[]\\'::jsonb,\\'[]\\'::jsonb,0,$9,$10,$11,$12::jsonb,$13::jsonb,$14::jsonb,\\'[]\\'::jsonb,$15 '+
   'FROM public.users WHERE id=$1 AND identity_source IN (\\'legacy_sqlite\\',\\'imported\\') '+
   'ON CONFLICT(user_id) DO UPDATE SET pid=EXCLUDED.pid,name=EXCLUDED.name,district=EXCLUDED.district,caps=EXCLUDED.caps,other_text=EXCLUDED.other_text,intro=EXCLUDED.intro,edu=EXCLUDED.edu,suspended=EXCLUDED.suspended,updated_at=EXCLUDED.updated_at,experience=EXCLUDED.experience,languages=EXCLUDED.languages,availability=EXCLUDED.availability,edu_level=EXCLUDED.edu_level RETURNING user_id',
   [userId,pid,snap.display_name,snap.district,JSON.stringify(snap.capabilities),snap.other_skills,snap.introduction,snap.education,!!sourceProfile.suspended,created,updated,JSON.stringify(snap.experience),JSON.stringify(snap.languages),JSON.stringify(snap.availability),typeof sourceProfile.edu_level==='string'?sourceProfile.edu_level.slice(0,120):null]
  );
  if(!out.rows?.length)return{synced:false,reason:'IDENTITY_NOT_LEGACY'};
  return{synced:true,user_id:userId};
 });
}
module.exports={ensureLegacyUser,syncLegacyCandidateProfile,parseStoredArray};

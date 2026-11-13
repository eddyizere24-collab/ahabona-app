'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { syncLegacyCandidateProfile, parseStoredArray } = require('../server/legacy-profile-bridge.cjs');

class FakeClient {
  constructor(){this.calls=[];}
  async query(sql,values=[]){
    this.calls.push({sql,values});
    if(sql.includes('INSERT INTO public.users')&&sql.includes('RETURNING id'))return{rows:[{id:9}]};
    if(sql.includes('INSERT INTO public.profiles'))return{rows:[{user_id:9}]};
    return{rows:[]};
  }
  release(){}
}
class FakePool { constructor(){this.client=new FakeClient();} async connect(){return this.client;} }

test('SQLite JSON arrays are parsed safely',()=>{
  assert.deepEqual(parseStoredArray('["Driver","Mechanic"]'),['Driver','Mechanic']);
  assert.deepEqual(parseStoredArray('broken-json'),[]);
});

test('legacy profile projection keeps job data and excludes private contact channels',async()=>{
  const pool=new FakePool();
  const result=await syncLegacyCandidateProfile(pool,{id:9,status:'active',created_at:1000,display_name:'Test User'},{
    pid:'abc12345',name:'Test User',district:'Gasabo',caps:'["Driver"]',
    other_text:'Can drive safely',intro:'Experienced driver',edu:'Secondary',
    experience:'["3 years"]',languages:'["Kinyarwanda"]',availability:'["Full time"]',
    suspended:0,created_at:1000,updated_at:2000,wa:'0788000000',
    email_public:'private@example.test',facebook:'https://social.example.test/private'
  });
  assert.deepEqual(result,{synced:true,user_id:9});
  const insert=pool.client.calls.find(call=>call.sql.includes('INSERT INTO public.profiles'));
  assert.ok(insert);
  assert.equal(insert.values[2],'Test User');
  assert.equal(insert.values[3],'Gasabo');
  assert.ok(!insert.values.includes('0788000000'));
  assert.ok(!insert.values.includes('private@example.test'));
  assert.ok(!insert.values.includes('https://social.example.test/private'));
  assert.ok(!insert.sql.includes('email_public'));
  assert.ok(!insert.sql.includes('facebook'));
});

test('profile without stable public ID is not projected',async()=>{
  const pool=new FakePool();
  const result=await syncLegacyCandidateProfile(pool,{id:9,status:'active'},{name:'Test User',district:'Gasabo'});
  assert.deepEqual(result,{synced:false,reason:'PROFILE_ID_NOT_AVAILABLE'});
  assert.equal(pool.client.calls.length,0);
});

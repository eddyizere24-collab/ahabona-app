'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {listOpportunityNotifications,markOpportunityNotificationRead,markAllOpportunityNotificationsRead}=require('../server/opportunity-notifications.cjs');

test('notification list and unread count are scoped to the signed-in user',async()=>{
  const calls=[];
  const pool={query:async(sql,values)=>{calls.push({sql,values});return sql.includes('COUNT(*)')?{rows:[{unread_count:2}]}:{rows:[{id:1,title:'New opportunity'}]};}};
  const result=await listOpportunityNotifications(pool,{id:7,status:'active'});
  assert.equal(result.notifications.length,1);
  assert.equal(result.unread_count,2);
  assert.ok(calls.every(call=>call.values[0]===7));
});

test('mark-read is scoped to notification owner',async()=>{
  const pool={query:async(_sql,values)=>({rows:[{id:5,read_at:values[0]}]})};
  const result=await markOpportunityNotificationRead(pool,{id:7,status:'active'},'5');
  assert.equal(result.notification.id,5);
});

test('a user cannot mark another user notification as read',async()=>{
  const pool={query:async()=>({rows:[]})};
  await assert.rejects(()=>markOpportunityNotificationRead(pool,{id:7,status:'active'},'5'),error=>error.status===404);
});

test('mark-all only updates current user notifications',async()=>{
  let values;
  const pool={query:async(_sql,params)=>{values=params;return{rowCount:3,rows:[]};}};
  const result=await markAllOpportunityNotificationsRead(pool,{id:11,status:'active'});
  assert.equal(result.marked_read,3);
  assert.deepEqual(values.slice(1),[11]);
});

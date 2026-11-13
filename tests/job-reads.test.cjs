'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { getReaderKey, getUnreadJobCount, markJobRead, JobReadError } = require('../server/job-reads.cjs');

test('reader keys separate account and anonymous device identities', () => {
  const headers = {'x-device':'device_12345678901234567890'};
  const account = getReaderKey({headers},{id:42,status:'active'});
  const anonymous = getReaderKey({headers},null);
  assert.equal(account.length,64);
  assert.equal(anonymous.length,64);
  assert.notEqual(account,anonymous);
  assert.doesNotMatch(account,/device_123/);
});

test('unread count returns a numeric count scoped to the reader key', async () => {
  let call;
  const pool = { query: async (sql,values) => {
    call = {sql,values};
    return {rows:[{unread_count:'7'}]};
  }};
  assert.deepEqual(await getUnreadJobCount(pool,'a'.repeat(64)),{unread_count:7});
  assert.deepEqual(call.values,['a'.repeat(64)]);
  assert.match(call.sql,/status = 'approved'/);
  assert.match(call.sql,/deadline_at > now/);
});

test('invalid reader key is rejected', async () => {
  await assert.rejects(
    () => getUnreadJobCount({query:async()=>({rows:[]})},'bad'),
    error => error instanceof JobReadError && error.status===400
  );
});

test('mark read only records approved and unexpired jobs', async () => {
  let call;
  const id='d14a611e-4f2f-4d2f-8ad3-6343658e1c13';
  const pool={query:async(sql,values)=>{call={sql,values};return{rows:[{job_post_id:id}]};}};
  const result=await markJobRead(pool,'b'.repeat(64),id);
  assert.equal(result.read.job_post_id,id);
  assert.match(call.sql,/status = 'approved'/);
  assert.match(call.sql,/deadline_at > now/);
});

test('malformed job IDs are rejected', async () => {
  await assert.rejects(
    () => markJobRead({query:async()=>({rows:[]})},'a'.repeat(64),'bad'),
    error => error instanceof JobReadError && error.status===404
  );
});

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { syncLegacyProfile, safeIdList } = require('../server/legacy-profile-sync.cjs');

class FakePool {
  constructor() { this.calls = []; }
  async connect() {
    return {
      query: async (sql, values = []) => {
        this.calls.push({ sql, values });
        if (/INSERT INTO public.users/.test(sql)) return { rows: [{ id: Number(values[0]) }] };
        if (/INSERT INTO public.profiles/.test(sql)) return { rows: [{ user_id: Number(values[0]) }] };
        return { rows: [] };
      },
      release() {}
    };
  }
}

test('profile bridge copies capability IDs safely and excludes private fields', async () => {
  const pool = new FakePool();
  const actor = { id: 17, status: 'active', created_at: 1000 };
  const profile = {
    user_id: 17, pid: 'public-profile-17', name: 'Candidate', district: 'Gasabo',
    caps: '[3,"4",3,"invalid"]', suspended: 0, created_at: 1000, updated_at: 2000,
    experience: '[]', languages: '["rw","en"]', availability: '["full_time"]',
    email: 'private@example.test', phone: '+250700000000', pw: 'hash'
  };
  const result = await syncLegacyProfile(pool, actor, profile, [
    { id: 3, name: 'Driver', category: 'Transport', aliases: '["umushoferi"]', active: 1 },
    { id: 4, name: 'Cook', category: 'Hospitality', aliases: '[]', active: 1 },
    { id: 9, name: 'Other', category: 'Other', aliases: '[]', active: 1 }
  ]);

  assert.deepEqual(result, { userId: 17, profileSynced: true, capabilityCount: 2 });
  const profileWrite = pool.calls.find(call => /INSERT INTO public\.profiles/.test(call.sql));
  assert.ok(profileWrite);
  assert.deepEqual(JSON.parse(profileWrite.values[4]), [3, 4]);
  assert.equal(profileWrite.values.includes('private@example.test'), false);
  assert.equal(profileWrite.values.includes('+250700000000'), false);
  assert.equal(profileWrite.values.includes('hash'), false);
  assert.equal(profileWrite.values[5], false);
  assert.ok(pool.calls.some(call => /INSERT INTO public\.capabilities/.test(call.sql)));
});

test('profile bridge rejects wrong user, missing profile and private-only profile values', async () => {
  const pool = new FakePool();
  await assert.rejects(() => syncLegacyProfile(pool, { id: 1, status: 'active' }, { user_id: 2 }), /matching legacy profile/);
  await assert.rejects(() => syncLegacyProfile(pool, { id: 1, status: 'active' }, { user_id: 1 }), /missing required public fields/);
});

test('safe capability id parser deduplicates and rejects malformed IDs', () => {
  assert.deepEqual(safeIdList('[1,"2",1,"nope",0,-1]'), [1, 2]);
});

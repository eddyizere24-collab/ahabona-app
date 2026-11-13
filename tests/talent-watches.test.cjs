'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {normalizeTalentWatch,calculateTalentWatchMatch,TalentWatchError}=require('../server/talent-watches.cjs');

test('talent watch requires valid capability IDs and accepts valid Rwanda locations',()=>{
 const value=normalizeTalentWatch({name:'Abashoferi bashya',capability_ids:[1,2],provinces:['Umujyi wa Kigali'],districts:['Gasabo']},[1,2,3]);
 assert.deepEqual(value.criteria.capability_ids,[1,2]);
 assert.deepEqual(value.criteria.districts,['Gasabo']);
});
test('talent watch rejects empty, unknown, or invalid skills and locations',()=>{
 assert.throws(()=>normalizeTalentWatch({name:'Drivers',capability_ids:[]},[1]),TalentWatchError);
 assert.throws(()=>normalizeTalentWatch({name:'Drivers',capability_ids:[9]},[1]),TalentWatchError);
 assert.throws(()=>normalizeTalentWatch({name:'Drivers',capability_ids:[1],districts:['Ntabwo ari akarere']},[1]),TalentWatchError);
});
test('employer discovery requires candidate consent and an explicit shared skill',()=>{
 const criteria={capability_ids:[2],districts:['Gasabo'],provinces:[]};
 assert.equal(calculateTalentWatchMatch(criteria,{caps:[2],district:'Gasabo',preferred_districts:[],preferred_provinces:[]}).score,1);
 assert.equal(calculateTalentWatchMatch(criteria,{caps:[2],district:'Rubavu',preferred_districts:[],preferred_provinces:[]}),null);
 assert.equal(calculateTalentWatchMatch(criteria,{caps:[4],district:'Gasabo',preferred_districts:[],preferred_provinces:[]}),null);
});
test('candidate willingness to work in a selected district can satisfy location matching',()=>{
 const result=calculateTalentWatchMatch({capability_ids:[7],districts:['Kicukiro'],provinces:[]},{caps:'[7]',district:'Huye',preferred_districts:['Kicukiro'],preferred_provinces:[]});
 assert.ok(result);assert.ok(result.score>=0.8);
});

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const media=require('../server-v2-modules/studio/media.cjs');

const jpg=Buffer.from([0xff,0xd8,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
assert.equal(media.imageType(jpg).mime,'image/jpeg');
const png=Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,0]);
assert.equal(media.imageType(png).mime,'image/png');
const webp=Buffer.from('RIFFxxxxWEBP','latin1');
assert.equal(media.imageType(webp).mime,'image/webp');
const mp4=Buffer.from([0,0,0,20,0x66,0x74,0x79,0x70,...Buffer.from('isomxxxx')]);
assert.equal(media.videoContainer(mp4),true);
const avif=Buffer.from([0,0,0,20,0x66,0x74,0x79,0x70,...Buffer.from('avifxxxx')]);
assert.equal(media.videoContainer(avif),false);
assert.equal(media.videoContainer(Buffer.from('not-a-video')),false);
assert.equal(media.MAX_DURATION_MS,90000);
assert.equal(media.MAX_VIDEO,64*1024*1024);

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ahabona-studio-media-test-'));
try{
  const pipeline=media.makeStudioMediaPipeline(tmp);
  const release=pipeline.tryAcquire();
  assert.equal(typeof release,'function');
  assert.equal(pipeline.tryAcquire(),null,'only one media job should run at a time');
  release();
  const releaseAgain=pipeline.tryAcquire();
  assert.equal(typeof releaseAgain,'function','lock should be available after release');
  releaseAgain();
  assert.equal(pipeline.validKey('studio-0123456789abcdef.jpg'),true);
  assert.equal(pipeline.validKey('../studio-0123456789abcdef.jpg'),false);
  assert.equal(pipeline.validKey('studio-abc.mp4'),false);
  console.log('Studio media validation smoke tests passed.');
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}

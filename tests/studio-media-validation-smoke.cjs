'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {DatabaseSync}=require('node:sqlite');
const media=require('../server-v2-modules/studio/media.cjs');
const store=require('../server-v2-modules/studio/store.cjs');

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

(async function main(){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ahabona-studio-media-test-'));
  let db=null;
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

    // Generate real input files and exercise the same conversion pipeline used
    // by uploads. The database and all output files stay inside this temp test.
    const sourceImage=path.join(tmp,'source.png');
    const sourceVideo=path.join(tmp,'source.mp4');
    execFileSync('ffmpeg',[
      '-y','-hide_banner','-loglevel','error','-f','lavfi','-i',
      'testsrc2=size=320x180:rate=1','-frames:v','1','-threads','1',sourceImage
    ],{timeout:30000});
    execFileSync('ffmpeg',[
      '-y','-hide_banner','-loglevel','error','-f','lavfi','-i',
      'testsrc2=size=160x90:rate=10:duration=1','-t','1','-c:v','libx264',
      '-preset','ultrafast','-pix_fmt','yuv420p','-threads','1','-an',
      '-movflags','+faststart','-f','mp4',sourceVideo
    ],{timeout:30000});
    assert.ok(fs.statSync(sourceImage).size>100,'generated PNG should be a real image');
    assert.ok(fs.statSync(sourceVideo).size>100,'generated MP4 should be a real video');

    db=new DatabaseSync(':memory:');
    store.initStudioSchema(db);
    const now=Date.now();
    const imageResult=await pipeline.uploadImage(db,fs.readFileSync(sourceImage),1,now);
    assert.equal(imageResult.asset.asset_kind,'image');
    assert.equal(imageResult.asset.mime_type,'image/jpeg');
    assert.equal(imageResult.asset.status,'ready');
    assert.ok(/^[0-9a-f]{64}$/.test(imageResult.asset.sha256));
    assert.ok(fs.existsSync(path.join(pipeline.root,imageResult.asset.storage_key)));
    assert.ok(imageResult.asset.width<=1280);

    const videoResult=await pipeline.uploadVideo(db,fs.readFileSync(sourceVideo),'video/mp4',1,now+1);
    assert.equal(videoResult.asset.asset_kind,'video');
    assert.equal(videoResult.asset.mime_type,'video/mp4');
    assert.equal(videoResult.asset.status,'ready');
    assert.equal(videoResult.asset.codec,'h264');
    assert.ok(videoResult.asset.duration_ms<=media.MAX_DURATION_MS);
    assert.ok(fs.existsSync(path.join(pipeline.root,videoResult.asset.storage_key)));
    assert.equal(videoResult.poster.asset_kind,'poster');
    assert.equal(videoResult.poster.mime_type,'image/jpeg');
    assert.equal(videoResult.poster.status,'ready');
    assert.ok(fs.existsSync(path.join(pipeline.root,videoResult.poster.storage_key)));

    const finalProbe=execFileSync('ffprobe',[
      '-v','error','-select_streams','v:0','-show_entries','stream=codec_name',
      '-of','default=noprint_wrappers=1:nokey=1',path.join(pipeline.root,videoResult.asset.storage_key)
    ],{encoding:'utf8',timeout:30000}).trim();
    assert.equal(finalProbe,'h264','processed video must be playable H.264 MP4');
    console.log('Studio media validation and real image/video pipeline smoke tests passed.');
  } finally {
    if(db)db.close();
    fs.rmSync(tmp,{recursive:true,force:true});
  }
})().catch((error)=>{
  console.error(error&&error.stack||error);
  process.exitCode=1;
});

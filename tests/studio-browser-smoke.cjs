'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');

const envNames=['AHABONA_STUDIO_BETA','ADMIN_EMAIL','ADMIN_PHONE','ADMIN_PASSWORD'];
const oldEnv=Object.fromEntries(envNames.map(name=>[name,process.env[name]]));
process.env.AHABONA_STUDIO_BETA='1';
process.env.ADMIN_EMAIL='studio-browser-test@example.test';
process.env.ADMIN_PHONE='0781234567';
process.env.ADMIN_PASSWORD='Studio-browser-pass-2026';

const {start}=require('../server-v2.cjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ahabona-studio-browser-test-'));
let app=null;
let browser=null;

(async function main(){
  try{
    app=start({dataDir:tmp,publicDir:tmp,secure:false,dev:true});
    const boot=await app.adminBoot;
    assert.equal(boot.ok,true,'test admin should bootstrap only in temporary test DB');
    const port=await app.listen(0);
    const base='http://127.0.0.1:'+port;

    browser=await chromium.launch({headless:true,args:['--no-sandbox']});
    const context=await browser.newContext({viewport:{width:390,height:844}});
    const login=await context.request.post(base+'/api/login',{
      data:{id:'studio-browser-test@example.test',password:'Studio-browser-pass-2026'}
    });
    assert.equal(login.status(),200,'browser test admin login');
    assert.equal((await login.json()).staff,true,'test account should be recognized as admin');

    const page=await context.newPage();
    const pageErrors=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    const response=await page.goto(base+'/admin/studio',{waitUntil:'networkidle'});
    assert.equal(response.status(),200,'authenticated Studio editor should load');
    await page.locator('#scene-form').waitFor();
    await page.locator('#scene-list').waitFor();

    // Generate valid files and upload them through the actual authenticated UI.
    // Conversion runs only against the temporary test database and directory.
    const sourceImage=path.join(tmp,'browser-input.png');
    const sourceVideo=path.join(tmp,'browser-input.mp4');
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

    await page.locator('#scene-kind').selectOption('image');
    await page.locator('#asset-upload').setInputFiles(sourceImage);
    await page.locator('#upload-btn').click();
    await page.waitForFunction(
      () => { const n=document.querySelector('#upload-note'); return n&&n.classList.contains('success')&&n.textContent.includes('Ifoto yatunganyijwe'); },
      null,{timeout:120000}
    );
    const imageId=await page.locator('#asset-select').inputValue();
    assert.ok(/^\d+$/.test(imageId),'uploaded image should be selected in the editor');

    await page.locator('#scene-kind').selectOption('video');
    await page.locator('#asset-upload').setInputFiles(sourceVideo);
    await page.locator('#upload-btn').click();
    await page.waitForFunction(
      () => { const n=document.querySelector('#upload-note'); return n&&n.classList.contains('success')&&n.textContent.includes('Video yatunganyijwe'); },
      null,{timeout:120000}
    );
    const videoId=await page.locator('#asset-select').inputValue();
    const posterId=await page.locator('#poster-select').inputValue();
    assert.ok(/^\d+$/.test(videoId),'uploaded video should be selected in the editor');
    assert.ok(/^\d+$/.test(posterId),'generated poster should be selected in the editor');

    // Exercise the real editor in a narrow phone viewport: save an isolated
    // draft, then render its preview through the shared renderer.
    await page.locator('#new-scene').click();
    await page.locator('#title-rw').fill('Igenzura rya telefoni');
    await page.locator('#body-rw').fill('Ubutumwa bwo kugerageza AHABONA Studio.');
    await page.locator('#save-draft').click();
    await page.locator('#scene-list').getByText('Igenzura rya telefoni').waitFor({timeout:10000});
    await page.locator('#preview-scene').click();
    await page.locator('#studio-preview .studio-slide').waitFor({timeout:5000});
    const previewText=await page.locator('#studio-preview').innerText();
    assert.ok(previewText.includes('Igenzura rya telefoni'),'preview should show the saved draft title');

    // Verify responsive layout at phone, small phone, tablet and desktop widths.
    for(const size of [
      {width:360,height:800},
      {width:390,height:844},
      {width:430,height:932},
      {width:768,height:1024},
      {width:1280,height:900}
    ]){
      await page.setViewportSize(size);
      const layout=await page.evaluate(()=>{
        const scene=document.querySelector('.scene-panel').getBoundingClientRect();
        const editor=document.querySelector('.editor-panel').getBoundingClientRect();
        return {
          viewport:window.innerWidth,
          pageWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),
          sceneLeft:scene.left,sceneRight:scene.right,sceneTop:scene.top,sceneBottom:scene.bottom,
          editorLeft:editor.left,editorRight:editor.right,editorTop:editor.top,
          workspaceWidth:document.querySelector('.workspace').getBoundingClientRect().width
        };
      });
      assert.ok(layout.pageWidth<=size.width+1,
        'horizontal overflow at '+size.width+'px: page='+layout.pageWidth+'px');
      assert.ok(layout.sceneLeft>=-1&&layout.editorLeft>=-1,
        'Studio panels should remain inside viewport at '+size.width+'px');
      assert.ok(layout.sceneRight<=size.width+1&&layout.editorRight<=size.width+1,
        'Studio panels should not clip at '+size.width+'px');
      if(size.width<=760){
        assert.ok(layout.editorTop>=layout.sceneBottom-1,
          'editor should stack below scene list on mobile width '+size.width+'px');
      }else{
        assert.ok(Math.abs(layout.sceneTop-layout.editorTop)<3,
          'scene list and editor should share a row at '+size.width+'px');
      }
    }
    assert.deepEqual(pageErrors,[],'editor and shared preview should not throw browser errors');
    await context.close();
    console.log('Studio browser smoke tests passed: editor login, draft save, shared preview and 5 responsive viewport widths.');
  }finally{
    if(browser)await browser.close().catch(()=>{});
    if(app)await app.close().catch(()=>{});
    fs.rmSync(tmp,{recursive:true,force:true});
    for(const name of envNames){
      if(oldEnv[name]===undefined)delete process.env[name];
      else process.env[name]=oldEnv[name];
    }
  }
})().catch(error=>{
  console.error(error&&error.stack||error);
  process.exitCode=1;
});

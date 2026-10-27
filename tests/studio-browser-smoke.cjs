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

    // Save and preview an image draft through the authenticated UI; this also
    // checks that the private media route returns real image bytes.
    await page.locator('#new-scene').click();
    await page.locator('#scene-kind').selectOption('image');
    await page.locator('#title-rw').fill('Igenzura ry’ifoto');
    await page.locator('#asset-select').selectOption(imageId);
    await page.locator('#save-draft').click();
    await page.waitForFunction(() => {
      const node=document.querySelector('#form-message');
      return !!node && (node.classList.contains('error') || node.textContent.includes('Draft yabitswe'));
    },null,{timeout:10000});
    const imageDraftState=await page.locator('#form-message').evaluate(node=>({text:node.textContent,className:node.className}));
    assert.ok(imageDraftState.className.includes('success')&&imageDraftState.text.includes('Draft yabitswe'),
      'Image draft save failed: '+JSON.stringify(imageDraftState));
    const imageRoutePromise=page.waitForResponse(resp=>resp.url().includes('/studio-media/'+imageId)&&resp.request().resourceType()==='image');
    await page.locator('#preview-scene').click();
    const imageRoute=await imageRoutePromise;
    assert.equal(imageRoute.status(),200,'uploaded image preview should load successfully');
    assert.equal(imageRoute.headers()['cache-control'],'private, no-store',
      'draft image previews must not be cached by shared/public caches');
    await page.waitForFunction(()=>{
      const img=document.querySelector('#studio-preview img.studio-poster');
      return !!img&&img.complete&&img.naturalWidth>0;
    },null,{timeout:10000});

    // Save and preview a video draft; the generated JPEG poster must load even
    // in browsers that reject automatic video playback.
    await page.locator('#new-scene').click();
    await page.locator('#scene-kind').selectOption('video');
    await page.locator('#title-rw').fill('Igenzura rya video');
    await page.locator('#asset-select').selectOption(videoId);
    await page.locator('#poster-select').selectOption(posterId);
    await page.locator('#save-draft').click();
    await page.waitForFunction(() => (document.querySelector('#form-message')||{}).textContent.includes('Draft yabitswe'));
    const posterRoutePromise=page.waitForResponse(resp=>resp.url().includes('/studio-media/'+posterId)&&resp.request().resourceType()==='image');
    await page.locator('#preview-scene').click();
    const posterRoute=await posterRoutePromise;
    assert.equal(posterRoute.status(),200,'video poster preview should load successfully');
    assert.equal(posterRoute.headers()['cache-control'],'private, no-store',
      'draft video posters must not be cached by shared/public caches');
    const videoRange=await context.request.get(base+'/studio-media/'+videoId,{headers:{Range:'bytes=0-99'}});
    assert.equal(videoRange.status(),206,'video media should support HTTP byte-range streaming');
    assert.match(videoRange.headers()['content-range']||'',/^bytes 0-99\//);
    assert.equal(videoRange.headers()['cache-control'],'private, no-store',
      'draft video stream must not be cached publicly');
    await page.waitForFunction(()=>{
      const img=document.querySelector('#studio-preview img.studio-poster');
      return !!img&&img.complete&&img.naturalWidth>0;
    },null,{timeout:10000});
    await page.locator('#studio-preview video.studio-video').waitFor({state:'attached',timeout:5000});

    // With Studio still disabled, anonymous visitors should continue seeing
    // the legacy hero rather than an empty or partially enabled Studio view.
    const visitorContext=await browser.newContext({viewport:{width:390,height:844}});
    const visitorPage=await visitorContext.newPage();
    visitorPage.on('pageerror',error=>pageErrors.push('visitor: '+error.message));
    await visitorPage.goto(base+'/',{waitUntil:'domcontentloaded'});
    await visitorPage.locator('#hero').waitFor({timeout:10000});
    await visitorPage.locator('#hero .hero-slide').first().waitFor({timeout:10000});
    assert.equal(await visitorPage.locator('#hero .studio-slide').count(),0,
      'Studio disabled: anonymous homepage should keep the legacy hero');

    // Publish the same text shown in the admin preview and enable Studio only
    // in this temporary test database, then verify the public homepage output.
    await page.locator('#new-scene').click();
    await page.locator('#title-rw').fill('Igenzura rya telefoni');
    await page.locator('#body-rw').fill('Ubutumwa bwo kugerageza AHABONA Studio.');
    await page.locator('#save-draft').click();
    await page.waitForFunction(() => (document.querySelector('#form-message')||{}).textContent.includes('Draft yabitswe'));
    await page.locator('#preview-scene').click();
    await page.locator('#studio-preview .studio-slide').waitFor({timeout:5000});
    const previewText=await page.locator('#studio-preview').innerText();
    assert.ok(previewText.includes('Igenzura rya telefoni'),'preview should show the saved draft title');
    await page.locator('#scene-fit-status').selectOption('published');
    await page.locator('#publish-scene').click();
    await page.waitForFunction(() => (document.querySelector('#form-message')||{}).textContent.includes('Byabitswe kandi byatangajwe.'));
    await page.locator('#setting-enabled').check();
    await page.locator('#settings-save').click();
    await page.waitForFunction(() => (document.querySelector('#settings-note')||{}).textContent.includes('Byabitswe'));
    const publicPlaylist=await (await context.request.get(base+'/api/studio/playlist')).json();
    assert.ok(publicPlaylist.scenes.some(scene=>scene.title_rw==='Igenzura rya telefoni'),
      'published text scene should be in the public playlist');
    await visitorPage.reload({waitUntil:'domcontentloaded'});
    await visitorPage.locator('#hero .studio-slide').waitFor({timeout:10000});
    await visitorPage.waitForFunction(() =>
      Array.from(document.querySelectorAll('#hero .studio-slide')).some(slide=>
        slide.textContent.includes('Igenzura rya telefoni')
      ),null,{timeout:10000});
    const publicHeroText=(await visitorPage.locator('#hero .studio-slide').allTextContents()).join(' ');
    assert.ok(publicHeroText.includes('Igenzura rya telefoni'),
      'anonymous public hero should render the same published text as admin preview');

    // Publish the uploaded H.264 video and verify that anonymous visitors can
    // fetch its public poster/video and that the public hero mounts the video.
    await page.locator('#new-scene').click();
    await page.locator('#scene-kind').selectOption('video');
    await page.locator('#title-rw').fill('Video yo kugerageza');
    await page.locator('#asset-select').selectOption(videoId);
    await page.locator('#poster-select').selectOption(posterId);
    await page.locator('#scene-fit-status').selectOption('published');
    await page.locator('#publish-scene').click();
    await page.waitForFunction(()=>{
      const n=document.querySelector('#form-message');
      return !!n&&(n.classList.contains('success')||n.classList.contains('error'));
    },null,{timeout:10000});
    const videoSave=await page.locator('#form-message').evaluate(n=>({text:n.textContent,className:n.className}));
    assert.ok(videoSave.className.includes('success')&&videoSave.text.includes('Byabitswe kandi byatangajwe'),
      'Publishing the uploaded video failed: '+JSON.stringify(videoSave));
    const videoSceneId=Number(await page.locator('#scene-id').inputValue());
    assert.ok(Number.isSafeInteger(videoSceneId)&&videoSceneId>0,'published video scene should have an ID');

    // Put the video first so the anonymous homepage exercises its public renderer.
    const videoRow=page.locator('#scene-list .scene-item').filter({hasText:'Video yo kugerageza'});
    await videoRow.locator('[data-move][data-delta="-1"]').click();
    await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('Itondekanya ryahindutse'),
      null,{timeout:10000});
    const videoPlaylist=await (await context.request.get(base+'/api/studio/playlist')).json();
    const publicVideoScene=videoPlaylist.scenes.find(scene=>scene.id===videoSceneId);
    assert.ok(publicVideoScene&&publicVideoScene.scene_kind==='video',
      'published video scene should appear in the public playlist');

    // These requests use a separate visitor context with no admin cookie.
    const publicVideoRange=await visitorContext.request.get(base+'/studio-media/'+videoId,
      {headers:{Range:'bytes=0-99'}});
    assert.equal(publicVideoRange.status(),206,'anonymous public video should support byte-range streaming');
    assert.match(publicVideoRange.headers()['content-range']||'',/^bytes 0-99\//);
    assert.equal(publicVideoRange.headers()['cache-control'],'public, max-age=31536000, immutable',
      'published video should use the public media cache policy');
    const publicPoster=await visitorContext.request.get(base+'/studio-media/'+posterId);
    assert.equal(publicPoster.status(),200,'anonymous visitor should receive the published poster');
    assert.match(publicPoster.headers()['content-type']||'',/^image\/jpeg/);
    assert.equal(publicPoster.headers()['cache-control'],'public, max-age=31536000, immutable',
      'published poster should use the public media cache policy');

    await visitorPage.reload({waitUntil:'domcontentloaded'});
    await visitorPage.locator('#hero .studio-video').waitFor({state:'attached',timeout:10000});
    assert.equal(await visitorPage.locator('#hero .studio-video').getAttribute('src'),
      '/studio-media/'+videoId,'public hero should mount the published video source');
    await visitorPage.waitForFunction(()=>{
      const img=document.querySelector('#hero .studio-poster');
      return !!img&&img.complete&&img.naturalWidth>0;
    },null,{timeout:10000});

    // Scheduling: a published scene beginning tomorrow must stay out of the
    // public playlist until its start time, then appear after moving its start
    // into the past. All changes remain in this temporary test database.
    await page.locator('#new-scene').click();
    await page.locator('#title-rw').fill('Igenzura ry’igihe');
    await page.locator('#body-rw').fill('Iki kibaho kigerageza gahunda y’igihe.');
    const futureLocal=await page.evaluate(()=>{
      const date=new Date(Date.now()+24*60*60*1000);
      date.setMinutes(date.getMinutes()-date.getTimezoneOffset());
      return date.toISOString().slice(0,16);
    });
    await page.locator('#start-at').fill(futureLocal);
    await page.locator('#scene-fit-status').selectOption('published');
    await page.locator('#publish-scene').click();
    await page.waitForFunction(()=>{
      const n=document.querySelector('#form-message');
      return !!n&&(n.classList.contains('success')||n.classList.contains('error'));
    },null,{timeout:10000});
    const futureSave=await page.locator('#form-message').evaluate(n=>({text:n.textContent,className:n.className}));
    assert.ok(futureSave.className.includes('success')&&futureSave.text.includes('Byabitswe kandi byatangajwe'),
      'Scheduled scene publish failed: '+JSON.stringify(futureSave));
    let scheduledPlaylist=await (await context.request.get(base+'/api/studio/playlist')).json();
    assert.ok(!scheduledPlaylist.scenes.some(scene=>scene.title_rw==='Igenzura ry’igihe'),
      'a future-scheduled scene must not appear in the public playlist yet');

    await page.locator('#scene-list').getByText('Igenzura ry’igihe').click();
    const pastLocal=await page.evaluate(()=>{
      const date=new Date(Date.now()-5*60*1000);
      date.setMinutes(date.getMinutes()-date.getTimezoneOffset());
      return date.toISOString().slice(0,16);
    });
    await page.locator('#start-at').fill(pastLocal);
    await page.locator('#publish-scene').click();
    await page.waitForFunction(()=>{
      const n=document.querySelector('#form-message');
      return !!n&&(n.classList.contains('success')||n.classList.contains('error'));
    },null,{timeout:10000});
    const pastSave=await page.locator('#form-message').evaluate(n=>({text:n.textContent,className:n.className}));
    assert.ok(pastSave.className.includes('success')&&pastSave.text.includes('Byabitswe kandi byatangajwe'),
      'Scheduled scene update failed: '+JSON.stringify(pastSave));
    scheduledPlaylist=await (await context.request.get(base+'/api/studio/playlist')).json();
    assert.ok(scheduledPlaylist.scenes.some(scene=>scene.title_rw==='Igenzura ry’igihe'),
      'a published scene whose start time has passed should appear in the public playlist');

    // Reorder a newly saved draft via the actual ↑ control, then delete that
    // draft via the editor confirmation dialog and verify it disappears.
    await page.locator('#new-scene').click();
    await page.locator('#title-rw').fill('Itondekanya rya kabiri');
    await page.locator('#body-rw').fill('Draft yo kugerageza itondeka.');
    await page.locator('#save-draft').click();
    await page.waitForFunction(()=>{
      const n=document.querySelector('#form-message');
      return !!n&&(n.classList.contains('success')||n.classList.contains('error'));
    },null,{timeout:10000});
    const reorderSave=await page.locator('#form-message').evaluate(n=>({text:n.textContent,className:n.className}));
    assert.ok(reorderSave.className.includes('success')&&reorderSave.text.includes('Draft yabitswe'),
      'Reorder test draft save failed: '+JSON.stringify(reorderSave));
    const titlesBefore=await page.locator('#scene-list .scene-item .scene-copy strong').allTextContents();
    const beforeIndex=titlesBefore.indexOf('Itondekanya rya kabiri');
    assert.ok(beforeIndex>0,'new draft should appear after the existing scenes before reordering');
    const reorderRow=page.locator('#scene-list .scene-item').filter({hasText:'Itondekanya rya kabiri'});
    const reorderId=await reorderRow.locator('[data-edit]').getAttribute('data-edit');
    await reorderRow.locator('[data-move][data-delta="-1"]').click();
    await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('Itondekanya ryahindutse'),null,{timeout:10000});
    const titlesAfter=await page.locator('#scene-list .scene-item .scene-copy strong').allTextContents();
    assert.equal(titlesAfter.indexOf('Itondekanya rya kabiri'),beforeIndex-1,
      'move-up control should shift the selected draft up exactly one position');

    page.once('dialog',dialog=>dialog.accept());
    await page.locator('#scene-list [data-edit="'+reorderId+'"]').click();
    await page.locator('#delete-scene').click();
    await page.waitForFunction(title=>
      !Array.from(document.querySelectorAll('#scene-list .scene-item')).some(row=>row.textContent.includes(title)),
      'Itondekanya rya kabiri', {timeout:10000});
    assert.equal(app.db.prepare('SELECT COUNT(*) n FROM studio_scenes WHERE title_rw=?').get('Itondekanya rya kabiri').n,0,
      'deleted draft should be removed from the isolated database');

    // Turning Studio off again should restore the legacy hero for visitors.
    await page.locator('#setting-enabled').uncheck();
    await page.locator('#settings-save').click();
    await page.waitForFunction(()=>document.querySelector('#settings-note')?.textContent.includes('Byabitswe'),null,{timeout:10000});
    const disabledPlaylist=await (await context.request.get(base+'/api/studio/playlist')).json();
    assert.equal(disabledPlaylist.enabled,false,'Studio should turn off cleanly');
    assert.deepEqual(disabledPlaylist.scenes,[],'disabled Studio should expose no public scenes');
    // A visitor may already have Studio mounted when an admin switches it off.
    // Stopping the renderer must remove its old slides before legacy fallback.
    await visitorPage.evaluate(()=>{
      if(window.AhabonaStudioRenderer)window.AhabonaStudioRenderer.stop(document.querySelector('#hero'));
    });
    assert.equal(await visitorPage.locator('#hero .studio-slide').count(),0,
      'stopping Studio should clear its slides before legacy fallback');
    await visitorPage.reload({waitUntil:'domcontentloaded'});
    await visitorPage.locator('#hero .hero-slide').first().waitFor({timeout:10000});
    assert.equal(await visitorPage.locator('#hero .studio-slide').count(),0,
      'after Studio is disabled, anonymous homepage should return to the legacy hero');

    await visitorContext.close();

    // Verify responsive layout at phone, small phone, tablet and desktop widths.
    for(const size of [
      {width:360,height:800},
      {width:390,height:844},
      {width:430,height:932},
      {width:768,height:1024},
      {width:1280,height:900}
    ]){
      await page.setViewportSize(size);
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.waitForTimeout(50);
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

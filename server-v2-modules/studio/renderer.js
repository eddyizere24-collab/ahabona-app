'use strict';
(function () {
  if (window.AhabonaStudioRenderer) return;

  const $ = (root, selector) => root && root.querySelector(selector);
  const $$ = (root, selector) => root ? Array.from(root.querySelectorAll(selector)) : [];
  const text = (value) => String(value == null ? '' : value);
  const safeInt = (v, lo, hi, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback;
  };
  const safeColor = (v, fallback) => /^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v).toLowerCase() : fallback;
  const langNow = (v) => (v === 'en' || v === 'rw') ? v : ((document.documentElement.lang || 'rw').toLowerCase().startsWith('en') ? 'en' : 'rw');
  const mediaUrl = (id) => Number.isSafeInteger(Number(id)) && Number(id) > 0 ? '/studio-media/' + Number(id) : '';
  const ACTION_LABELS = {
    rw:{register:'Iyandikishe',search:'Shaka umukozi',help:'Ubufasha',about:'Ibyerekeye AHABONA',link:'Fungura link'},
    en:{register:'Sign up',search:'Find a worker',help:'Help',about:'About AHABONA',link:'Open link'}
  };
  const stateByContainer = new WeakMap();
  function ensureStyles() {
    if (document.querySelector('link[data-ahabona-studio-renderer-style]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/studio-renderer.css';
    link.setAttribute('data-ahabona-studio-renderer-style','1');
    document.head.appendChild(link);
  }

  function styleFor(scene) {
    const src = scene && scene.text_style && typeof scene.text_style === 'object' ? scene.text_style : {};
    return {
      fontSize:safeInt(src.fontSize,12,48,26),
      fontWeight:[400,500,600,700,800].includes(Number(src.fontWeight)) ? Number(src.fontWeight) : 700,
      textAlign:['left','center','right'].includes(src.textAlign) ? src.textAlign : 'left',
      color:safeColor(src.color,'#ffffff'),
      backgroundColor:safeColor(src.backgroundColor,'#123c2d'),
      fontFamily:['system','sans','serif'].includes(src.fontFamily) ? src.fontFamily : 'system'
    };
  }
  function overlayFor(scene) {
    const src = scene && scene.overlay_style && typeof scene.overlay_style === 'object' ? scene.overlay_style : {};
    return {
      position:['top','middle','bottom'].includes(src.position) ? src.position : 'bottom',
      opacity:safeInt(src.opacity,0,1,.35),
      background:['none','dark','light'].includes(src.background) ? src.background : 'dark'
    };
  }
  function actionFor(scene) {
    const actions=['none','register','search','help','about','link'];
    return actions.includes(scene && scene.cta_action) ? scene.cta_action : 'none';
  }
  function addTextNode(parent, tag, className, value) {
    const node=document.createElement(tag);
    if(className)node.className=className;
    node.textContent=text(value);
    parent.appendChild(node);
    return node;
  }
  function titleFor(scene, lang) {
    return text((lang==='en' && scene.title_en) ? scene.title_en : (scene.title_rw || scene.title_en || ''));
  }
  function bodyFor(scene, lang) {
    return text((lang==='en' && scene.body_en) ? scene.body_en : (scene.body_rw || scene.body_en || ''));
  }
  function buildSlide(scene, options) {
    options=options||{};
    const lang=langNow(options.lang);
    scene=scene&&typeof scene==='object'?scene:{};
    const kind=['text','image','video'].includes(scene.scene_kind)?scene.scene_kind:'text';
    const media=kind!=='text';
    const style=styleFor(scene), overlay=overlayFor(scene);
    const slide=document.createElement('div');
    slide.className='hero-slide studio-slide' + (media?' has-vid':'') + (kind==='video'?' studio-slide-video':'');
    slide.setAttribute('role','group');
    slide.setAttribute('aria-roledescription','slide');
    slide.setAttribute('aria-label', titleFor(scene,lang) || (lang==='en'?'Announcement':'Itangazo'));
    slide.style.setProperty('--studio-bg',style.backgroundColor);
    slide.style.setProperty('--studio-text',style.color);
    slide.style.setProperty('--studio-font-size',style.fontSize+'px');
    slide.style.setProperty('--studio-font-weight',String(style.fontWeight));
    slide.style.setProperty('--studio-text-align',style.textAlign);
    slide.style.setProperty('--studio-font-family',style.fontFamily==='serif'?'Georgia,serif':(style.fontFamily==='sans'?'Arial,sans-serif':'system-ui,-apple-system,"Segoe UI",sans-serif'));
    slide.style.setProperty('--studio-zoom',String(safeInt(scene.zoom,1,2.5,1)));
    slide.style.setProperty('--studio-crop-x',safeInt(scene.crop_x,0,100,50)+'%');
    slide.style.setProperty('--studio-crop-y',safeInt(scene.crop_y,0,100,50)+'%');
    slide.style.backgroundColor=media?'#153c2c':style.backgroundColor;

    if(media) {
      const id=kind==='image'?scene.asset_id:scene.poster_asset_id;
      const image=document.createElement('img');
      image.className='studio-media studio-poster';
      image.alt='';
      image.decoding='async';
      image.loading=options.preview||options.active?'eager':'lazy';
      image.src=mediaUrl(id);
      image.style.objectFit=scene.fit==='contain'?'contain':'cover';
      image.style.objectPosition=safeInt(scene.crop_x,0,100,50)+'% '+safeInt(scene.crop_y,0,100,50)+'%';
      slide.appendChild(image);
      if(kind==='video')slide.dataset.videoId=String(Number(scene.asset_id)||'');
    }

    const copy=document.createElement('div');
    copy.className='hero-copy studio-copy studio-copy-'+overlay.position;
    copy.style.color=style.color;
    copy.style.textAlign=style.textAlign;
    copy.style.fontFamily=slide.style.getPropertyValue('--studio-font-family');
    copy.style.setProperty('--studio-overlay-opacity',String(overlay.opacity));
    if(media && overlay.background!=='none') {
      const rgb=overlay.background==='light'?'255,255,255':'0,0,0';
      copy.style.backgroundColor='rgba('+rgb+','+overlay.opacity+')';
    } else if (!media) {
      copy.style.backgroundColor='transparent';
    }

    const badge=addTextNode(copy,'span','hero-b studio-badge',lang==='en'?'AHABONA ANNOUNCEMENT':'ITANGAZO RYA AHABONA');
    badge.setAttribute('aria-hidden','true');
    const title=titleFor(scene,lang);
    const body=bodyFor(scene,lang);
    if(title) {
      const heading=addTextNode(copy,'h2','hero-t studio-title',title);
      heading.style.fontSize=style.fontSize+'px';
      heading.style.fontWeight=String(style.fontWeight);
      heading.style.color=style.color;
    }
    if(body) {
      const paragraph=addTextNode(copy,'p','hero-p studio-body',body);
      paragraph.style.fontWeight='500';
      paragraph.style.color=style.color;
    }
    const action=actionFor(scene);
    if(action!=='none') {
      const label=text((lang==='en'&&scene.cta_label_en)?scene.cta_label_en:(scene.cta_label_rw||scene.cta_label_en||ACTION_LABELS[lang][action]));
      const button=addTextNode(copy,'button','hero-cta studio-cta',label);
      button.type='button';
      button.setAttribute('data-hero-act',action);
      button.setAttribute('data-hero-val',action==='link'||action==='search'?text(scene.cta_value):'');
    }
    slide.appendChild(copy);

    if(kind==='video') {
      const retry=addTextNode(slide,'button','studio-video-play',lang==='en'?'Tap to play video':'Kanda ukine video');
      retry.type='button';
      retry.hidden=true;
      retry.addEventListener('click',function(e){
        e.preventDefault();e.stopPropagation();
        playVideo(slide,true);
      });
    }
    return slide;
  }
  function playVideo(slide, userGesture) {
    if(!slide)return;
    const id=Number(slide.dataset.videoId);
    if(!Number.isSafeInteger(id)||id<1)return;
    let video=$ (slide,'.studio-video');
    if(!video) {
      video=document.createElement('video');
      video.className='studio-media studio-video';
      video.muted=true;
      video.defaultMuted=true;
      video.autoplay=true;
      video.loop=true;
      video.playsInline=true;
      video.setAttribute('muted','');
      video.setAttribute('autoplay','');
      video.setAttribute('playsinline','');
      video.setAttribute('webkit-playsinline','');
      video.preload='none';
      const poster=$ (slide,'.studio-poster');
      if(poster)video.poster=poster.src;
      video.addEventListener('loadeddata',function(){video.classList.add('studio-video-ready');});
      video.addEventListener('playing',function(){
        const retry=$ (slide,'.studio-video-play');if(retry)retry.hidden=true;
      });
      video.addEventListener('error',function(){
        video.classList.remove('studio-video-ready');
        const retry=$ (slide,'.studio-video-play');
        if(retry){retry.hidden=false;retry.textContent=langNow() === 'en'?'Try video again':'Ongera ugerageze video';}
      });
      const copy=$ (slide,'.studio-copy');
      slide.insertBefore(video,copy||null);
    }
    const src=mediaUrl(id);
    if(src && video.getAttribute('src')!==src)video.setAttribute('src',src);
    video.preload=userGesture?'auto':'metadata';
    try{video.load()}catch(_){}
    let p;
    try{p=video.play()}catch(_){p=null}
    if(p&&typeof p.catch==='function')p.catch(function(){
      const retry=$ (slide,'.studio-video-play');if(retry)retry.hidden=false;
    });
  }
  function stopVideo(slide) {
    const video=$ (slide,'.studio-video');
    if(!video)return;
    try{video.pause()}catch(_){}
    video.removeAttribute('src');
    video.classList.remove('studio-video-ready');
    try{video.load()}catch(_){}
    const retry=$ (slide,'.studio-video-play');if(retry)retry.hidden=true;
  }
  function updateDots(player) {
    $$(player.dots,'.hero-dot').forEach(function(dot,i){
      const on=i===player.index;
      dot.classList.toggle('on',on);
      dot.setAttribute('aria-current',on?'true':'false');
    });
  }
  function updatePause(player) {
    if(!player.pauseButton)return;
    const label=player.pausedByUser
      ?(player.lang==='en'?'Resume announcements':'Komeza amatangazo')
      :(player.lang==='en'?'Pause announcements':'Hagarika amatangazo');
    player.pauseButton.textContent=player.pausedByUser?'▶':'Ⅱ';
    player.pauseButton.setAttribute('aria-label',label);
    player.pauseButton.setAttribute('title',label);
    player.pauseButton.setAttribute('aria-pressed',player.pausedByUser?'true':'false');
  }
  function isHeld(player) {
    return player.pausedByUser||player.hovered||player.keyboardHeld||document.hidden||Date.now()<player.touchUntil;
  }
  function durationFor(player) {
    const scene=player.scenes[player.index]||{};
    const configured=Number(scene.duration_ms);
    const def=Number(player.settings.default_duration_ms)||7000;
    return safeInt(configured,1000,90000,def);
  }
  function schedule(player) {
    clearTimeout(player.timer);player.timer=null;
    if(player.scenes.length<2)return;
    if(isHeld(player)) {
      if(!player.pausedByUser&&Date.now()<player.touchUntil) {
        player.timer=setTimeout(function(){schedule(player)},Math.max(50,player.touchUntil-Date.now()+30));
      }
      return;
    }
    player.timer=setTimeout(function(){go(player,player.nextIndex())},durationFor(player));
  }
  function go(player,index) {
    const n=player.scenes.length;
    if(!n)return;
    const old=player.index;
    player.index=((index%n)+n)%n;
    player.slides.forEach(function(slide,i){
      const active=i===player.index;
      slide.classList.toggle('studio-active',active);
      if(active)slide.removeAttribute('aria-hidden');else slide.setAttribute('aria-hidden','true');
      if(!active)stopVideo(slide);
    });
    if(player.settings.transition==='slide') {
      player.track.style.display='flex';
      player.track.style.transform='translateX(-'+(player.index*100)+'%)';
    } else {
      player.track.style.display='grid';
      player.track.style.transform='none';
    }
    updateDots(player);
    const activeSlide=player.slides[player.index];
    if(activeSlide && activeSlide.dataset.videoId)playVideo(activeSlide,false);
    schedule(player);
  }
  function destroy(player) {
    if(!player)return;
    clearTimeout(player.timer);
    player.destroyed=true;
    player.container.removeEventListener('click',player.onClick);
    player.container.removeEventListener('pointerenter',player.onEnter);
    player.container.removeEventListener('pointerleave',player.onLeave);
    player.container.removeEventListener('focusin',player.onFocusIn);
    player.container.removeEventListener('focusout',player.onFocusOut);
    player.container.removeEventListener('touchstart',player.onTouchStart);
    player.container.removeEventListener('touchend',player.onTouchEnd);
    player.container.removeEventListener('touchcancel',player.onTouchCancel);
    document.removeEventListener('visibilitychange',player.onVisibility);
    player.slides.forEach(stopVideo);
    if(player.pauseButton)player.pauseButton.remove();
    if(player.controls)player.controls.remove();
  }
  function mount(container, playlist) {
    if(!container||!playlist||!Array.isArray(playlist.scenes)||!playlist.scenes.length)return null;
    ensureStyles();
    const prior=stateByContainer.get(container);
    const signature=JSON.stringify({settings:playlist.settings||{},scenes:playlist.scenes});
    if(prior&&prior.signature===signature)return prior;
    if(prior)destroy(prior);

    const track=$(container,'#heroTrack')||$('.hero-track');
    const dots=$(container,'#heroDots')||$('.hero-dots');
    if(!track||!dots)return null;
    const settings=playlist.settings||{};
    const lang=langNow();
    const scenes=playlist.scenes.slice(0,60);
    const mode=['sequential','shuffle'].includes(settings.playback_mode)?settings.playback_mode:'sequential';
    const transition=['none','fade','slide'].includes(settings.transition)?settings.transition:'fade';
    const transitionMs=safeInt(settings.transition_ms,0,1500,450);
    const player={
      container,track,dots,scenes,settings:{...settings,transition},lang,mode,transition,transitionMs,
      signature,index:0,timer:null,pausedByUser:false,hovered:false,keyboardHeld:false,touchUntil:0,
      slides:[],pauseButton:null,controls:null,destroyed:false
    };
    track.innerHTML='';
    track.classList.add('studio-track');
    track.classList.toggle('studio-fade',transition==='fade');
    track.classList.toggle('studio-none',transition==='none');
    track.style.transitionDuration=transitionMs+'ms';
    track.style.transitionProperty=transition==='slide'?'transform':'none';
    player.slides=scenes.map(function(scene,i){
      const slide=buildSlide(scene,{lang:lang,active:i===0,preview:false});
      if(i!==0)slide.setAttribute('aria-hidden','true');
      track.appendChild(slide);
      return slide;
    });
    dots.innerHTML='';
    scenes.forEach(function(scene,i){
      if(scenes.length<2)return;
      const b=document.createElement('button');
      b.type='button';b.className='hero-dot'+(i===0?' on':'');
      b.setAttribute('data-studio-go',String(i));
      b.setAttribute('aria-label',(lang==='en'?'Show item ':'Erekana itangazo ')+(i+1));
      b.setAttribute('aria-current',i===0?'true':'false');
      dots.appendChild(b);
    });
    player.controls=document.createElement('div');
    player.controls.className='studio-controls';
    player.pauseButton=document.createElement('button');
    player.pauseButton.type='button';player.pauseButton.className='studio-pause';
    player.pauseButton.setAttribute('data-studio-pause','1');
    player.controls.appendChild(player.pauseButton);
    container.appendChild(player.controls);
    updatePause(player);

    player.nextIndex=function(){
      if(player.scenes.length<2)return player.index;
      if(player.mode!=='shuffle')return player.index+1;
      let n=player.index;
      while(n===player.index)n=Math.floor(Math.random()*player.scenes.length);
      return n;
    };
    player.onClick=function(e){
      const goButton=e.target.closest&&e.target.closest('[data-studio-go]');
      if(goButton&&container.contains(goButton)){
        e.preventDefault();go(player,Number(goButton.getAttribute('data-studio-go')));return;
      }
      const pause=e.target.closest&&e.target.closest('[data-studio-pause]');
      if(pause&&container.contains(pause)){
        e.preventDefault();player.pausedByUser=!player.pausedByUser;updatePause(player);schedule(player);return;
      }
    };
    player.onEnter=function(e){if(e.pointerType==='mouse'){player.hovered=true;schedule(player)}};
    player.onLeave=function(e){if(e.pointerType==='mouse'){player.hovered=false;schedule(player)}};
    player.onFocusIn=function(e){try{if(e.target&&e.target.matches&&e.target.matches(':focus-visible')){player.keyboardHeld=true;schedule(player)}}catch(_){}};
    player.onFocusOut=function(){player.keyboardHeld=false;schedule(player)};
    let sx=0,sy=0,tracking=false;
    player.onTouchStart=function(e){const p=e.touches&&e.touches[0];if(!p)return;sx=p.clientX;sy=p.clientY;tracking=true;player.touchUntil=Date.now()+8000;schedule(player)};
    player.onTouchEnd=function(e){
      if(!tracking)return;tracking=false;
      const p=e.changedTouches&&e.changedTouches[0];if(!p)return;
      const dx=p.clientX-sx,dy=p.clientY-sy;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.5){player.touchUntil=0;go(player,player.index+(dx<0?1:-1));}
      else schedule(player);
    };
    player.onTouchCancel=function(){tracking=false;player.touchUntil=0;schedule(player)};
    player.onVisibility=function(){if(document.hidden){clearTimeout(player.timer);player.timer=null;player.slides.forEach(stopVideo)}else{const v=player.slides[player.index];if(v&&v.dataset.videoId)playVideo(v,false);schedule(player)}};
    container.addEventListener('click',player.onClick);
    container.addEventListener('pointerenter',player.onEnter);
    container.addEventListener('pointerleave',player.onLeave);
    container.addEventListener('focusin',player.onFocusIn);
    container.addEventListener('focusout',player.onFocusOut);
    container.addEventListener('touchstart',player.onTouchStart,{passive:true});
    container.addEventListener('touchend',player.onTouchEnd,{passive:true});
    container.addEventListener('touchcancel',player.onTouchCancel,{passive:true});
    document.addEventListener('visibilitychange',player.onVisibility);
    container.setAttribute('aria-roledescription','carousel');
    stateByContainer.set(container,player);
    if(player.slides[0]&&player.slides[0].dataset.videoId)playVideo(player.slides[0],false);
    schedule(player);
    return player;
  }
  function renderPreview(target, scene, language) {
    if(!target)return;
    ensureStyles();
    $(target,'video').forEach(function(video){
      try{video.pause()}catch(_){}
      video.removeAttribute('src');
      try{video.load()}catch(_){}
    });
    target.innerHTML='';
    target.classList.add('studio-preview-stage');
    const slide=buildSlide(scene,{lang:langNow(language),active:true,preview:true});
    slide.classList.add('studio-preview-slide','studio-active');
    slide.removeAttribute('aria-hidden');
    target.appendChild(slide);
    if(slide.dataset.videoId)playVideo(slide,false);
  }
  function stop(container) {
    const p=container&&stateByContainer.get(container);
    if(p)destroy(p);
    if(container)stateByContainer.delete(container);
  }
  window.AhabonaStudioRenderer={mount,renderSlide:buildSlide,renderPreview,stop};
})();
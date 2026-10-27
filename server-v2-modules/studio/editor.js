'use strict';
(function () {
  const $ = (id) => document.getElementById(id);
  const API = '/api/admin/studio';
  const state = { scenes: [], assets: [], settings: null, current: null, loading: false, toastTimer: 0 };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function toast(message) {
    const node = $('toast'); node.textContent = String(message || 'Byanze'); node.classList.add('show');
    clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => node.classList.remove('show'), 2800);
  }
  function message(text, type) {
    const node = $('form-message'); node.textContent = text || ''; node.className = 'form-message' + (type ? ' ' + type : '');
  }
  async function api(path, options) {
    options = options || {};
    const init = { method: options.method || 'GET', credentials: 'same-origin', headers: { 'Accept':'application/json' } };
    if (options.body !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(options.body); }
    const response = await fetch(path, init);
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) throw new Error((data && (data.error || data.message)) || ('HTTP ' + response.status));
    return data || {};
  }
  function statusText(status) { return status === 'published' ? 'Yatangajwe' : status === 'archived' ? 'Archived' : 'Draft'; }
  function statusClass(status) { return status === 'published' ? 'published' : status === 'archived' ? 'archived' : 'draft'; }
  function kindText(kind) { return kind === 'image' ? 'Ifoto' : kind === 'video' ? 'Video' : 'Inyandiko'; }
  function kindIcon(kind) { return kind === 'image' ? '▧' : kind === 'video' ? '▶' : 'T'; }
  function activeTitle(scene) { return scene.title_rw || scene.title_en || scene.body_rw || scene.body_en || (kindText(scene.scene_kind) + ' #' + scene.id); }
  function renderScenes() {
    const query = $('scene-search').value.trim().toLocaleLowerCase();
    const found = state.scenes.filter((scene) => [activeTitle(scene), scene.title_rw, scene.title_en, scene.scene_kind, scene.status].join(' ').toLocaleLowerCase().includes(query));
    $('scene-count').textContent = found.length + (found.length === 1 ? ' ikibaho' : ' ibibaho');
    if (!found.length) { $('scene-list').innerHTML = '<div class="empty-state">Nta kibaho gihari. Kanda <b>＋ Gishya</b> utangire.</div>'; return; }
    $('scene-list').innerHTML = found.map((scene) => {
      const selected = state.current && Number(state.current.id) === Number(scene.id);
      return '<div class="scene-item' + (selected ? ' selected' : '') + '" role="group" aria-label="' + esc(activeTitle(scene)) + '">' +
        '<span class="scene-icon" aria-hidden="true">' + kindIcon(scene.scene_kind) + '</span>' +
        '<button class="scene-copy" data-edit="' + Number(scene.id) + '" type="button" style="background:none;border:0;text-align:left;padding:0;color:inherit;min-width:0">' +
        '<strong>' + esc(activeTitle(scene)) + '</strong><small>' + esc(kindText(scene.scene_kind)) + ' · #' + Number(scene.id) + '</small></button>' +
        '<div class="scene-end"><span class="status-pill ' + statusClass(scene.status) + '">' + esc(statusText(scene.status)) + '</span>' +
        '<div class="move-buttons"><button type="button" data-move="' + Number(scene.id) + '" data-delta="-1" aria-label="Himura hejuru" title="Himura hejuru">↑</button><button type="button" data-move="' + Number(scene.id) + '" data-delta="1" aria-label="Himura hasi" title="Himura hasi">↓</button></div></div>' +
        '</div>';
    }).join('');
  }
  function toLocalDate(value) {
    if (value === null || value === undefined || value === '') return '';
    const d = new Date(Number(value)); if (!Number.isFinite(d.getTime())) return '';
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0,16);
  }
  function fromLocalDate(value) { if (!value) return null; const n = new Date(value).getTime(); return Number.isFinite(n) ? n : null; }
  function setValue(id, value) { $(id).value = value == null ? '' : String(value); }
  function updatePublishLabel() {
    const status = $('scene-fit-status').value;
    $('publish-scene').textContent = status === 'archived' ? 'Bika & Archive' : status === 'draft' ? 'Bika Draft' : 'Bika & Tangaza';
  }
  function resetForm() {
    state.current = null;
    $('scene-form').reset(); $('scene-id').value = ''; $('scene-kind').value = 'text'; $('scene-transition').value = 'inherit';
    $('scene-fit-status').value = 'draft'; $('scene-duration').value = state.settings ? Math.round(state.settings.default_duration_ms / 1000) : 7;
    $('style-size').value = '26'; $('style-weight').value = '700'; $('style-align').value = 'center'; $('style-font').value = 'system';
    $('style-color').value = '#ffffff'; $('style-bg').value = '#123c2d'; $('overlay-position').value = 'bottom';
    $('overlay-opacity').value = '0.35'; $('overlay-bg').value = 'dark'; $('scene-fit').value = 'cover'; $('scene-zoom').value = '1';
    $('crop-x').value = '50'; $('crop-y').value = '50'; $('cta-action').value = 'none';
    $('asset-select').value = ''; $('poster-select').value = '';
    $('editor-title').textContent = 'Ongeraho ikibaho'; $('editor-eyebrow').textContent = 'EDITOR';
    $('scene-status').className = 'status-pill draft'; $('scene-status').textContent = 'Draft'; updatePublishLabel();
    $('delete-scene').hidden = true; $('preview-scene').disabled = true;
    message(''); toggleFields(); renderScenes(); updateOutputs();
  }
  function fillForm(scene) {
    if (!scene) return resetForm();
    state.current = scene;
    setValue('scene-id', scene.id); setValue('scene-kind', scene.scene_kind); setValue('scene-transition', scene.transition || 'inherit');
    setValue('title-rw', scene.title_rw); setValue('title-en', scene.title_en); setValue('body-rw', scene.body_rw); setValue('body-en', scene.body_en);
    setValue('asset-select', scene.asset_id); setValue('poster-select', scene.poster_asset_id);
    setValue('scene-fit', scene.fit || 'cover'); setValue('scene-zoom', scene.zoom == null ? 1 : scene.zoom);
    setValue('crop-x', scene.crop_x == null ? 50 : scene.crop_x); setValue('crop-y', scene.crop_y == null ? 50 : scene.crop_y);
    const style = scene.text_style || {}; setValue('style-size', style.fontSize == null ? 26 : style.fontSize);
    setValue('style-weight', style.fontWeight == null ? 700 : style.fontWeight); setValue('style-align', style.textAlign || 'center');
    setValue('style-font', style.fontFamily || 'system'); setValue('style-color', style.color || '#ffffff'); setValue('style-bg', style.backgroundColor || '#123c2d');
    const overlay = scene.overlay_style || {}; setValue('overlay-position', overlay.position || 'bottom');
    setValue('overlay-opacity', overlay.opacity == null ? .35 : overlay.opacity); setValue('overlay-bg', overlay.background || 'dark');
    setValue('cta-action', scene.cta_action || 'none'); setValue('cta-value', scene.cta_value); setValue('cta-label-rw', scene.cta_label_rw); setValue('cta-label-en', scene.cta_label_en);
    setValue('scene-duration', Math.round((scene.duration_ms || 7000) / 1000)); setValue('scene-fit-status', scene.status || 'draft');
    setValue('start-at', toLocalDate(scene.start_at)); setValue('end-at', toLocalDate(scene.end_at));
    $('editor-title').textContent = 'Hindura ikibaho #' + scene.id; $('editor-eyebrow').textContent = 'GUHINDURA';
    $('scene-status').className = 'status-pill ' + statusClass(scene.status); $('scene-status').textContent = statusText(scene.status); updatePublishLabel();
    $('delete-scene').hidden = false; $('preview-scene').disabled = false;
    message(''); toggleFields(); updateAssetState(); updateOutputs(); renderScenes();
  }
  function toggleFields() {
    const kind = $('scene-kind').value;
    $('media-fields').hidden = kind === 'text';
    $('poster-label').hidden = kind !== 'video';
    const action = $('cta-action').value;
    $('cta-value-label').hidden = action !== 'link' && action !== 'search';
    const label = action === 'link' ? 'Link ya HTTPS' : 'Ijambo ryo gushakisha';
    $('cta-value-label').firstChild && ($('cta-value-label').childNodes[0].textContent = label);
  }
  function optionsForAssets(select, kinds, selected) {
    const assets = state.assets.filter((asset) => kinds.includes(asset.asset_kind));
    select.innerHTML = '<option value="">Hitamo media</option>' + assets.map((a) => {
      const ready = a.status === 'ready';
      const detail = a.asset_kind + ' · #' + a.id + ' · ' + (ready ? 'iteguye' : a.status);
      return '<option value="' + Number(a.id) + '"' + (Number(selected) === Number(a.id) ? ' selected' : '') + (ready ? '' : ' disabled') + '>' + esc(detail) + '</option>';
    }).join('');
  }
  function refreshAssetChoices() {
    const kind = $('scene-kind').value;
    optionsForAssets($('asset-select'), kind === 'image' ? ['image'] : ['video'], state.current && state.current.asset_id);
    optionsForAssets($('poster-select'), ['poster'], state.current && state.current.poster_asset_id);
  }
  function updateAssetState() {
    const id = Number($('asset-select').value); const asset = state.assets.find((a) => Number(a.id) === id);
    const node = $('asset-state');
    if (!asset) { node.textContent = 'Nta media'; node.className = 'status-pill neutral'; return; }
    node.textContent = asset.status === 'ready' ? 'Iteguye' : asset.status;
    node.className = 'status-pill ' + (asset.status === 'ready' ? 'on' : 'neutral');
  }
  function updateOutputs() {
    $('zoom-output').textContent = Number($('scene-zoom').value).toFixed(1) + '×';
    $('crop-x-output').textContent = $('crop-x').value + '%'; $('crop-y-output').textContent = $('crop-y').value + '%';
    $('overlay-opacity-output').textContent = Math.round(Number($('overlay-opacity').value) * 100) + '%';
  }
  function readForm(status) {
    const kind = $('scene-kind').value; const action = $('cta-action').value;
    const duration = Number($('scene-duration').value);
    if (!Number.isFinite(duration) || duration < 1 || duration > 90) throw new Error('Igihe kigomba kuba hagati y’amasegonda 1 na 90.');
    const start = fromLocalDate($('start-at').value); const end = fromLocalDate($('end-at').value);
    if (start !== null && end !== null && end <= start) throw new Error('Itariki yo kurangira igomba kuza nyuma y’iyo gutangira.');
    return {
      scene_kind:kind,status:status || $('scene-fit-status').value,
      title_rw:$('title-rw').value,title_en:$('title-en').value,body_rw:$('body-rw').value,body_en:$('body-en').value,
      text_style:{fontSize:Number($('style-size').value),fontWeight:Number($('style-weight').value),textAlign:$('style-align').value,color:$('style-color').value,backgroundColor:$('style-bg').value,fontFamily:$('style-font').value},
      overlay_style:{position:$('overlay-position').value,opacity:Number($('overlay-opacity').value),background:$('overlay-bg').value},
      asset_id:kind === 'text' ? null : (Number($('asset-select').value) || null),
      poster_asset_id:kind === 'video' ? (Number($('poster-select').value) || null) : null,
      cta_action:action,cta_value:action === 'link' || action === 'search' ? $('cta-value').value.trim() : '',
      cta_label_rw:$('cta-label-rw').value,cta_label_en:$('cta-label-en').value,
      duration_ms:Math.round(duration*1000),transition:$('scene-transition').value,
      fit:$('scene-fit').value,zoom:Number($('scene-zoom').value),crop_x:Number($('crop-x').value),crop_y:Number($('crop-y').value),
      start_at:start,end_at:end,sort_order:state.current ? state.current.sort_order : state.scenes.length*10
    };
  }
  async function refreshAll() {
    if (state.loading) return; state.loading = true; $('refresh-btn').disabled = true;
    try {
      const replies = await Promise.all([api(API + '/scenes'), api(API + '/settings'), api(API + '/assets')]);
      state.scenes = Array.isArray(replies[0].scenes) ? replies[0].scenes : Array.isArray(replies[0]) ? replies[0] : [];
      state.settings = replies[1].settings || replies[1];
      state.assets = Array.isArray(replies[2].assets) ? replies[2].assets : Array.isArray(replies[2]) ? replies[2] : [];
      fillSettings(); refreshAssetChoices();
      if (state.current) fillForm(state.scenes.find((s) => Number(s.id) === Number(state.current.id)) || null); else resetForm();
      renderScenes(); $('system-status').textContent = state.settings.enabled ? 'Studio irakora' : 'Kizimye';
      $('system-status').className = 'status-pill ' + (state.settings.enabled ? 'on' : 'off');
    } catch (error) {
      $('scene-list').innerHTML = '<div class="empty-state">Studio backend ntirahuzwa n’iyi editor.<br><br><small>' + esc(error.message) + '</small></div>';
      $('system-status').textContent = 'Ntihujwe'; $('system-status').className = 'status-pill neutral';
      message('Studio API ntibashije guhuza. Reba ko winjiye nka admin ufite uburenganzira bwa content.edit, hanyuma wongere ugerageze.', 'error');
    } finally { state.loading = false; $('refresh-btn').disabled = false; }
  }
  function fillSettings() {
    const s = state.settings || {};
    $('setting-enabled').checked = !!s.enabled; $('setting-playback').value = s.playback_mode || 'sequential';
    $('setting-transition').value = s.transition || 'fade'; $('setting-transition-ms').value = s.transition_ms == null ? 450 : s.transition_ms;
    $('setting-duration').value = Math.round((s.default_duration_ms || 7000) / 1000); $('setting-pause').checked = s.pause_on_interaction !== false;
  }
  async function saveScene(status) {
    try {
      const data = readForm(status); const id = Number($('scene-id').value);
      const reply = id ? await api(API + '/scenes/' + id, {method:'PUT',body:data}) : await api(API + '/scenes', {method:'POST',body:data});
      const scene = reply.scene || reply;
      toast('Byabitswe'); await refreshAll();
      const savedId = scene.id || id; if (savedId) fillForm(state.scenes.find((s) => Number(s.id) === Number(savedId)) || null);
      // refreshAll/fillForm reset the form message, so restore confirmation
      // afterwards; otherwise a successful save appears to have no result.
      message(status === 'published' ? 'Byabitswe kandi byatangajwe.' : status === 'archived' ? 'Byashyizwe muri archive.' : 'Draft yabitswe.', 'success');
    } catch (error) { message(error.message, 'error'); toast(error.message); }
  }
  async function saveSettings() {
    try {
      const data = {enabled:$('setting-enabled').checked,playback_mode:$('setting-playback').value,transition:$('setting-transition').value,
        transition_ms:Number($('setting-transition-ms').value),default_duration_ms:Number($('setting-duration').value)*1000,pause_on_interaction:$('setting-pause').checked};
      if (!Number.isInteger(data.transition_ms)||data.transition_ms<0||data.transition_ms>1500) throw new Error('Transition igomba kuba hagati ya 0 na 1500 ms.');
      if (!Number.isInteger(data.default_duration_ms)||data.default_duration_ms<1000||data.default_duration_ms>90000) throw new Error('Igihe gisanzwe kigomba kuba hagati y’amasegonda 1 na 90.');
      const reply = await api(API + '/settings',{method:'PUT',body:data}); state.settings = reply.settings || reply; fillSettings();
      $('settings-note').textContent = 'Byabitswe'; $('system-status').textContent = state.settings.enabled ? 'Studio irakora' : 'Kizimye';
      $('system-status').className = 'status-pill ' + (state.settings.enabled ? 'on' : 'off'); toast('Igenamiterere ryabitswe');
    } catch (error) { $('settings-note').textContent = error.message; toast(error.message); }
  }
  function mediaKind(file) {
    const mime = String(file && file.type || '').toLowerCase();
    const name = String(file && file.name || '').toLowerCase();
    if (mime.startsWith('video/') || /\.(mp4|webm|mov|avi)$/.test(name)) return 'video';
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/.test(name)) return 'image';
    return null;
  }
  async function uploadAsset() {
    const file = $('asset-upload').files && $('asset-upload').files[0];
    if (!file) { $('upload-note').textContent = 'Banza hitamo ifoto cyangwa video.'; $('upload-note').className = 'upload-note error'; return; }
    const kind = mediaKind(file);
    if (!kind) { $('upload-note').textContent = 'File itemewe. Koresha JPG, PNG, WebP, MP4 cyangwa WebM.'; $('upload-note').className = 'upload-note error'; return; }
    const limit = kind === 'image' ? 8*1024*1024 : 64*1024*1024;
    if (file.size < 100 || file.size > limit) { $('upload-note').textContent = kind === 'image' ? 'Ifoto igomba kuba hagati ya 100 bytes na 8 MB.' : 'Video igomba kuba hagati ya 100 bytes na 64 MB.'; $('upload-note').className = 'upload-note error'; return; }
    const button = $('upload-btn'); button.disabled = true; button.textContent = 'Biratunganywa…';
    $('upload-note').textContent = 'Ohereza file; server iri kuyigenzura no kuyitunganya. Ntufunge uru rupapuro.'; $('upload-note').className = 'upload-note';
    try {
      const response = await fetch(API + '/assets/' + kind, {
        method:'POST', credentials:'same-origin',
        headers:{'Content-Type':file.type || 'application/octet-stream'},
        body:file
      });
      let data = {};
      try { data = await response.json(); } catch (_) {}
      if (!response.ok) throw new Error(data.error || ('HTTP ' + response.status));
      const list = await api(API + '/assets');
      state.assets = Array.isArray(list.assets) ? list.assets : [];
      $('scene-kind').value = kind; toggleFields(); refreshAssetChoices();
      if (data.asset && data.asset.id) $('asset-select').value = String(data.asset.id);
      if (data.poster && data.poster.id) $('poster-select').value = String(data.poster.id);
      updateAssetState(); updateOutputs();
      $('upload-note').textContent = kind === 'video' ? 'Video yatunganyijwe. Poster yakozwe; iriteguye guhitwa no gutangazwa.' : 'Ifoto yatunganyijwe kandi iriteguye.';
      $('upload-note').className = 'upload-note success'; $('asset-upload').value = '';
      toast('Media yabitswe');
    } catch (error) {
      $('upload-note').textContent = error.message || 'Upload yanze. Ongera ugerageze.'; $('upload-note').className = 'upload-note error';
    } finally {
      button.disabled = false; button.textContent = 'Ohereza media';
    }
  }
  async function deleteScene() {
    const id = Number($('scene-id').value); if (!id) return;
    if (!window.confirm('Urashaka gusiba iki kibaho? Media yo kuri server ntizahita isibwa.')) return;
    try { await api(API + '/scenes/' + id,{method:'DELETE'}); toast('Ikibaho cyasibwe'); resetForm(); await refreshAll(); }
    catch (error) { message(error.message,'error'); }
  }
  async function moveScene(id,delta) {
    const at = state.scenes.findIndex((s) => Number(s.id) === Number(id)); const to = at + delta;
    if (at < 0 || to < 0 || to >= state.scenes.length) return;
    const arr = state.scenes.slice(); const tmp=arr[at]; arr[at]=arr[to]; arr[to]=tmp;
    try {
      for (let i=0;i<arr.length;i++) await api(API + '/scenes/' + arr[i].id,{method:'PUT',body:{sort_order:i*10}});
      await refreshAll(); toast('Itondekanya ryahindutse');
    } catch (error) { toast('Guhindura itondeka byanze: ' + error.message); }
  }
  function bind() {
    $('new-scene').addEventListener('click', resetForm); $('refresh-btn').addEventListener('click', refreshAll);
    $('upload-btn').addEventListener('click', uploadAsset);
    $('asset-upload').addEventListener('change', () => {
      const f = $('asset-upload').files && $('asset-upload').files[0];
      if (!f) return;
      const kind = mediaKind(f);
      if (kind) { $('scene-kind').value = kind; toggleFields(); refreshAssetChoices(); }
      $('upload-note').textContent = f.name + ' · ' + (f.size/1024/1024).toFixed(2) + ' MB';
      $('upload-note').className = 'upload-note';
    });
    $('scene-search').addEventListener('input', renderScenes); $('scene-list').addEventListener('click', (event) => {
      const move = event.target.closest('[data-move]');
      if (move) { moveScene(Number(move.dataset.move), Number(move.dataset.delta)); return; }
      const button = event.target.closest('[data-edit]'); if (button) fillForm(state.scenes.find((s) => Number(s.id) === Number(button.dataset.edit)) || null);
    });
    $('scene-kind').addEventListener('change', () => { toggleFields(); refreshAssetChoices(); updateAssetState(); });
    $('cta-action').addEventListener('change', toggleFields); $('asset-select').addEventListener('change', updateAssetState);
    ['scene-zoom','crop-x','crop-y','overlay-opacity'].forEach((id) => $(id).addEventListener('input', updateOutputs));
    $('settings-save').addEventListener('click', saveSettings); $('save-draft').addEventListener('click', () => saveScene('draft'));
    $('publish-scene').addEventListener('click', (event) => { event.preventDefault(); saveScene($('scene-fit-status').value); });
    $('scene-form').addEventListener('submit', (event) => { event.preventDefault(); saveScene($('scene-fit-status').value); });
    $('scene-fit-status').addEventListener('change', updatePublishLabel);
    $('reset-scene').addEventListener('click', () => state.current ? fillForm(state.current) : resetForm()); $('delete-scene').addEventListener('click', deleteScene);
    $('preview-scene').addEventListener('click', () => {
      try {
        const scene=readForm('draft');
        if(scene.scene_kind==='image'&&!scene.asset_id)throw new Error('Hitamo ifoto mbere yo kuyireba.');
        if(scene.scene_kind==='video'&&(!scene.asset_id||!scene.poster_asset_id))throw new Error('Hitamo video na poster yayo mbere yo kuyireba.');
        const stage=$('studio-preview');
        if(!stage||!window.AhabonaStudioRenderer)throw new Error('Renderer ya Studio ntirahari. Ongera ufungure iri paji.');
        window.AhabonaStudioRenderer.renderPreview(stage,scene,document.documentElement.lang);
        $('preview-title').textContent='Preview — '+(scene.title_rw||scene.title_en||kindText(scene.scene_kind));
        message('Iyi Preview ikoresha renderer imwe n’iy’urubuga.','success');
      } catch(error) {
        message(error.message,'error');
        toast(error.message);
      }
    });
  }
  bind(); resetForm(); refreshAll();
})();
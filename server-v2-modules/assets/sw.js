/* AHABONA Service Worker v2 */
const SHELL='ahabona-shell-v9';
const DATA='ahabona-data-v9';
const PHOTOS='ahabona-photos-v9';
const SHELL_URLS=['/','/manifest.webmanifest','/icon.svg','/splash.js'];
const DATA_LIMIT=60;
const PHOTO_LIMIT=120;

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(SHELL).then(function(c){return c.addAll(SHELL_URLS)}).then(function(){return self.skipWaiting()}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==SHELL&&k!==DATA&&k!==PHOTOS}).map(function(k){return caches.delete(k)}));
    }).then(function(){return self.clients.claim()})
  );
});

function trim(cacheName,max){
  return caches.open(cacheName).then(function(c){
    return c.keys().then(function(keys){
      if(keys.length<=max)return;
      var toDelete=keys.slice(0,keys.length-max);
      return Promise.all(toDelete.map(function(k){return c.delete(k)}));
    });
  });
}

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url;
  try{url=new URL(req.url)}catch(err){return}
  if(url.origin!==self.location.origin)return;
  var p=url.pathname;
  if(p.indexOf('/media/')===0)return;
  if(p.indexOf('/api/me')===0||p.indexOf('/api/admin')===0||p.indexOf('/api/saved')===0||p.indexOf('/api/events')===0||p.indexOf('/api/report')===0||p.indexOf('/api/help/contact')===0){
    e.respondWith(fetch(req).catch(function(){return new Response(JSON.stringify({error:'offline'}),{status:503,headers:{'Content-Type':'application/json'}})}));
    return;
  }
  if(p.indexOf('/api/')===0){
    /* API responses may depend on the active account; never persist them in a shared offline cache. */
    e.respondWith(fetch(req).catch(function(){
      return new Response(JSON.stringify({error:'offline'}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
    }));
    return;
  }
  if(p.indexOf('/photos/')===0){
    e.respondWith(
      caches.match(req).then(function(cached){
        if(cached)return cached;
        return fetch(req).then(function(r){
          if(r&&r.ok){
            var copy=r.clone();
            caches.open(PHOTOS).then(function(c){c.put(req,copy);trim(PHOTOS,PHOTO_LIMIT)});
          }
          return r;
        }).catch(function(){return new Response('',{status:504})});
      })
    );
    return;
  }
  if(req.mode==='navigate'||p==='/'||/^\/(u|reset|saved|about|help|terms|privacy|admin)\b/.test(p)){
    e.respondWith(
      fetch(req).then(function(r){
        if(r&&r.ok){
          var copy=r.clone();
          caches.open(SHELL).then(function(c){c.put(req,copy)});
        }
        return r;
      }).catch(function(){
        return caches.match(req).then(function(cached){
          if(cached)return cached;
          return caches.match('/').then(function(root){
            return root||new Response('offline',{status:503});
          });
        });
      })
    );
    return;
  }
  if(p==='/app.js'||p==='/admin.js'||p==='/splash.js'){
    e.respondWith(
      fetch(req).then(function(r){
        if(r&&r.ok){
          var copy=r.clone();
          caches.open(SHELL).then(function(c){c.put(req,copy)});
        }
        return r;
      }).catch(function(){
        return caches.match(req).then(function(cached){
          return cached||new Response('',{status:504});
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function(cached){
      if(cached)return cached;
      return fetch(req).then(function(r){
        if(r&&r.ok&&(p.indexOf('/assets/')===0||/\.(css|js|woff2|svg|png|jpg|jpeg|webmanifest)$/.test(p))){
          var copy=r.clone();
          caches.open(SHELL).then(function(c){c.put(req,copy)});
        }
        return r;
      }).catch(function(){return new Response('',{status:504})});
    })
  );
});

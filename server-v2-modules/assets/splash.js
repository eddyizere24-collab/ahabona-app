(function(){
  function kill(){
    var s=document.getElementById('splash');
    if(!s)return;
    try{sessionStorage.setItem('ahabona_splash','1')}catch(e){}
    s.className=(s.className||'')+' gone';
    try{s.style.cssText='display:none!important;opacity:0;pointer-events:none;visibility:hidden';}catch(e){}
    try{s.remove()}catch(e){try{if(s.parentNode)s.parentNode.removeChild(s)}catch(e2){}}
  }
  try{if(sessionStorage.getItem('ahabona_splash')==='1'){kill();return}}catch(e){}
  setTimeout(kill,1200);
  setTimeout(kill,2000);
  setTimeout(kill,3000);
})();

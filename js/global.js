/* ════════════════════════════════════════════════════════════
   GLOBAL.JS — shared behavior for sayanahamed.online
   Theme system (16-theme slider), scroll reveal, scroll progress,
   scroll-to-top, marquee touch-pause, cursor, wipe-in headings,
   and a defensively-guarded mobile nav toggle.
   Analytics (GA4/Clarity), lightbox, and page-unique interactions
   stay inline in each page's own <script>.
   ════════════════════════════════════════════════════════════ */

/* ── THEME SYSTEM ── */
(function(){
  const THEMES=[
    {id:0, th:'light',      h:155,s:'62%',l:'42%',label:'Cream'},
    {id:1, th:'studio',     h:211,s:'100%',l:'50%',label:'Studio'},
    {id:2, th:'chalk',      h:20, s:'78%',l:'50%',label:'Chalk'},
    {id:3, th:'sketch',     h:0,  s:'0%', l:'10%',label:'Sketch'},
    {id:4, th:'grid',       h:72, s:'38%',l:'36%',label:'Grid'},
    {id:5, th:'tokyo',      h:4,  s:'78%',l:'45%',label:'Tokyo'},
    {id:6, th:'sand',       h:28, s:'65%',l:'48%',label:'Sand'},
    {id:7, th:'terracotta', h:18, s:'70%',l:'48%',label:'Terra'},
    {id:8, th:'ember',      h:22, s:'72%',l:'46%',label:'Ember'},
    {id:9, th:'paper',      h:278,s:'60%',l:'56%',label:'Paper'},
    {id:10,th:'forest',     h:140,s:'55%',l:'48%',label:'Forest'},
    {id:11,th:'midnight',   h:196,s:'84%',l:'52%',label:'Midnight'},
    {id:12,th:'navy',       h:322,s:'80%',l:'58%',label:'Navy'},
    {id:13,th:'dusk',       h:310,s:'62%',l:'58%',label:'Dusk'},
    {id:14,th:'noir',       h:76, s:'78%',l:'55%',label:'Noir'},
    {id:15,th:'dark',       h:20, s:'78%',l:'50%',label:'Dark'},
  ];
  const html=document.documentElement,bar=document.getElementById('theme-bar'),
        btn=document.getElementById('theme-toggle-btn'),track=document.getElementById('tb-track'),
        thumb=document.getElementById('tb-thumb'),label=document.getElementById('tb-label'),
        iconSun=document.getElementById('theme-icon-sun'),iconMoon=document.getElementById('theme-icon-moon');
  if(!bar||!btn||!track||!thumb) return;
  let isOpen=false,activeIdx=15,dragging=false;
  function posForIdx(i){return i/(THEMES.length-1)}
  function applyTheme(idx){
    activeIdx=idx;const t=THEMES[idx];
    html.setAttribute('data-theme',t.th);
    html.style.setProperty('--a-h',t.h);html.style.setProperty('--a-s',t.s);html.style.setProperty('--a-l',t.l);
    if(label) label.textContent=t.label;
    placeThumb(posForIdx(idx));
    document.querySelectorAll('.tb-stop').forEach((s,i)=>s.classList.toggle('active-stop',i===idx));
    const isDark=['dark','midnight','forest','dusk','noir','navy'].includes(t.th);
    if(iconSun) iconSun.style.display=isDark?'none':'block';
    if(iconMoon) iconMoon.style.display=isDark?'block':'none';
    let m=document.querySelector('meta[name="theme-color"]');
    if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}
    m.content=isDark?'#0a0a0a':'#f5f0e3';
    localStorage.setItem('gsa-theme-idx',idx);
  }
  function placeThumb(pos){const th=track.offsetHeight,tw=thumb.offsetHeight;thumb.style.top=(pos*(th-tw)+tw/2)+'px';}
  function positionStops(){
    THEMES.forEach((t,i)=>{
      const stop=document.getElementById('stop-'+i);if(!stop) return;
      const pos=posForIdx(i),th=track.offsetHeight,tw=thumb.offsetHeight;
      stop.style.top=(pos*(th-tw)+tw/2)+'px';stop.style.transform='translate(-50%,-50%)';
    });
  }
  function getIdxFromY(clientY){
    const rect=track.getBoundingClientRect(),tw=thumb.offsetHeight;
    return Math.round(Math.max(0,Math.min(1,(clientY-rect.top-tw/2)/(rect.height-tw)))*(THEMES.length-1));
  }
  btn.addEventListener('click',()=>{
    isOpen=!isOpen;
    bar.classList.toggle('open',isOpen);
    btn.classList.toggle('bar-open',isOpen);
    btn.setAttribute('aria-expanded',isOpen);
    if(btn.hasAttribute('aria-label')) btn.setAttribute('aria-label',isOpen?'Close theme picker':'Open theme picker');
    if(bar.hasAttribute('aria-hidden')) bar.setAttribute('aria-hidden',!isOpen);
    track.setAttribute('tabindex',isOpen?'0':'-1');
  });
  document.addEventListener('click',e=>{
    if(isOpen&&!bar.contains(e.target)&&e.target!==btn&&!btn.contains(e.target)){
      isOpen=false;bar.classList.remove('open');btn.classList.remove('bar-open');
      btn.setAttribute('aria-expanded','false');
      if(btn.hasAttribute('aria-label')) btn.setAttribute('aria-label','Open theme picker');
      if(bar.hasAttribute('aria-hidden')) bar.setAttribute('aria-hidden','true');
      track.setAttribute('tabindex','-1');
    }
  });
  track.addEventListener('click',e=>{if(dragging) return;e.stopPropagation();applyTheme(getIdxFromY(e.clientY))});
  function onDragStart(e){dragging=true;e.preventDefault();document.addEventListener('mousemove',onDragMove);document.addEventListener('mouseup',onDragEnd);document.addEventListener('touchmove',onDragMoveT,{passive:false});document.addEventListener('touchend',onDragEnd)}
  function onDragMove(e){if(!dragging) return;applyTheme(getIdxFromY(e.clientY))}
  function onDragMoveT(e){if(!dragging) return;e.preventDefault();applyTheme(getIdxFromY(e.touches[0].clientY))}
  function onDragEnd(){dragging=false;document.removeEventListener('mousemove',onDragMove);document.removeEventListener('mouseup',onDragEnd);document.removeEventListener('touchmove',onDragMoveT);document.removeEventListener('touchend',onDragEnd)}
  thumb.addEventListener('mousedown',onDragStart);
  thumb.addEventListener('touchstart',onDragStart,{passive:false});
  requestAnimationFrame(()=>{
    const saved=parseInt(localStorage.getItem('gsa-theme-idx')??'15');
    const hasSaved=localStorage.getItem('gsa-theme-idx')!==null;
    let defaultIdx=15;
    if(!hasSaved) defaultIdx=window.matchMedia('(prefers-color-scheme: dark)').matches?15:0;
    applyTheme(isNaN(saved)?defaultIdx:Math.max(0,Math.min(15,saved)));
    positionStops();
  });
  window.addEventListener('resize',()=>{placeThumb(posForIdx(activeIdx));positionStops()});
})();

/* ── SCROLL REVEAL ── */
(function(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:0.07});
  document.querySelectorAll('.rv,.rv-l,.rv-r').forEach(el=>io.observe(el));
})();

/* ── SCROLL PROGRESS ── */
window.addEventListener('scroll',()=>{
  const h=document.documentElement;
  const spb=document.getElementById('spb');
  if(spb) spb.style.width=((h.scrollTop/(h.scrollHeight-h.clientHeight))*100)+'%';
},{passive:true});

/* ── SCROLL TO TOP ── */
window.addEventListener('scroll',()=>{
  const btn=document.getElementById('scroll-top');
  if(btn) btn.classList.toggle('visible',window.scrollY>400);
},{passive:true});

/* ── MARQUEE TOUCH ── */
(function(){
  const mqEl=document.querySelector('.cs-marquee'),mqIn=document.querySelector('.cs-marquee-inner');
  if(mqEl&&mqIn){
    mqEl.addEventListener('touchstart',()=>{mqIn.style.animationPlayState='paused'},{passive:true});
    mqEl.addEventListener('touchend',()=>{mqIn.style.animationPlayState='running'},{passive:true});
  }
})();

/* ── CURSOR ── */
(function(){
  const cur=document.getElementById('cur'),ring=document.getElementById('cur-ring');
  if(!cur||!ring||!window.matchMedia('(hover:hover)').matches) return;
  let mx=0,my=0,rx=0,ry=0,raf=null;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';if(!raf) raf=requestAnimationFrame(loop);},{passive:true});
  function loop(){raf=null;rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.left=rx.toFixed(1)+'px';ring.style.top=ry.toFixed(1)+'px';if(Math.abs(mx-rx)>.3||Math.abs(my-ry)>.3) raf=requestAnimationFrame(loop);}
  document.addEventListener('mouseover',e=>{if(e.target.closest('a,button,[role="button"]')) document.body.classList.add('cur-h');});
  document.addEventListener('mouseout',e=>{if(e.target.closest('a,button,[role="button"]')) document.body.classList.remove('cur-h');});
  document.addEventListener('mouseleave',()=>{cur.style.opacity='0';ring.style.opacity='0';});
  document.addEventListener('mouseenter',()=>{cur.style.opacity='1';ring.style.opacity='1';});
})();

/* ── WIPE ANIMATION ── */
(function(){
  function fireWipe(wrap){if(!wrap.classList.contains('wiped')) wrap.classList.add('wiped');}
  function checkAll(){
    document.querySelectorAll('.wipe-wrap:not(.wiped)').forEach(wrap=>{
      const rect=wrap.getBoundingClientRect();
      if(rect.top<window.innerHeight*.88&&rect.bottom>0) setTimeout(()=>fireWipe(wrap),400);
    });
  }
  window.addEventListener('scroll',checkAll,{passive:true});
  window.addEventListener('load',()=>{setTimeout(checkAll,300);setTimeout(checkAll,900);});
  setTimeout(checkAll,500);
})();

/* ── MOBILE NAV TOGGLE (defensive: no-ops on pages without a hamburger menu) ── */
(function(){
  const btn=document.getElementById('nav-menu-btn'),panel=document.getElementById('nav-mobile');
  if(!btn||!panel) return;
  function close(){btn.classList.remove('open');panel.classList.remove('open');document.body.style.overflow='';}
  btn.addEventListener('click',()=>btn.classList.contains('open')?close():(btn.classList.add('open'),panel.classList.add('open'),document.body.style.overflow='hidden'));
  document.querySelectorAll('.mob-link').forEach(a=>a.addEventListener('click',close));
})();

/* ── MEDIA SKELETON / SHIMMER + LAZY VIDEO LOADING ── */
(function(){
  var seen=new WeakSet();
  var lazyVideoSeen=new WeakSet();

  function lazyLoadVideo(video){
    var sources=video.querySelectorAll('source[data-src]');
    if(!sources.length) return;
    sources.forEach(function(s){
      s.src=s.getAttribute('data-src');
      s.removeAttribute('data-src');
    });
    video.load();
  }
  var videoIO=null;
  function getVideoIO(){
    if(videoIO || !('IntersectionObserver' in window)) return videoIO;
    videoIO=new IntersectionObserver(function(entries,obs){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          lazyLoadVideo(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },{rootMargin:'400px 0px'});
    return videoIO;
  }
  function initVideoLazyLoad(video){
    if(lazyVideoSeen.has(video)) return;
    if(!video.querySelector('source[data-src]')) return;
    lazyVideoSeen.add(video);
    var io=getVideoIO();
    if(io){ io.observe(video); }
    else { lazyLoadVideo(video); }
  }

  function shouldSkip(el){
    if(el.tagName==='IMG'){
      return !el.getAttribute('src') || (el.complete && el.naturalWidth>0);
    }
    if(el.tagName==='VIDEO'){
      return el.readyState>=2;
    }
    return true;
  }
  function markLoaded(el){
    el.classList.remove('media-skel');
    el.classList.add('media-loaded');
  }
  function initSkeleton(el){
    if(seen.has(el)) return;
    seen.add(el);
    if(shouldSkip(el)) return;
    el.classList.add('media-skel');
    function done(){
      markLoaded(el);
      el.removeEventListener('load',done);
      el.removeEventListener('loadeddata',done);
      el.removeEventListener('error',done);
    }
    if(el.tagName==='IMG'){
      el.addEventListener('load',done);
      el.addEventListener('error',done);
    }else{
      el.addEventListener('loadeddata',done);
      el.addEventListener('error',done);
    }
  }
  function scan(root){
    if(root.matches && root.matches('img[src]')) initSkeleton(root);
    if(root.matches && root.matches('video')){ initVideoLazyLoad(root); initSkeleton(root); }
    if(root.querySelectorAll){
      root.querySelectorAll('img[src]').forEach(initSkeleton);
      root.querySelectorAll('video').forEach(function(v){ initVideoLazyLoad(v); initSkeleton(v); });
    }
  }
  function run(){
    scan(document);
    if('MutationObserver' in window){
      new MutationObserver(function(mutations){
        mutations.forEach(function(m){
          m.addedNodes.forEach(function(node){
            if(node.nodeType===1) scan(node);
          });
        });
      }).observe(document.body,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',run);
  }else{
    run();
  }
})();
